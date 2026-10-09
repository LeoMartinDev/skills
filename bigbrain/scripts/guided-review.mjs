#!/usr/bin/env node
// Guided PR review: collect a PR or branch into a review folder, build the page from the agent's tour.json,
// and serve it locally so the reviewer can submit a GitHub review from the page. Node 18+, no dependencies.
//
//   guided-review.mjs collect [TARGET] [--base REF] [--remote NAME] [--out DIR]
//   guided-review.mjs build DIR [--open]
//   guided-review.mjs serve DIR [--port N] [--no-open]

import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const VIEWER = join(dirname(fileURLToPath(import.meta.url)), '..', 'viewer');
const MAX_BYTES = 1_000_000; // larger files are listed, but their content is not embedded
const LARGE_DIFF = 3000; // the viewer asks before rendering a file diff longer than this many lines
const SUMMARY_LINES = 10;
const SUMMARY_WORDS = 130;
const LONG_STEP_WORDS = 90;
const MAX_CHECKS = 2;
const MAX_PANELS = 3;
const MAX_HIGHLIGHTS = 3;
const LONG_NOTE_WORDS = 40;
const MAX_STEPS = 8;
const RISKS = ['low', 'medium', 'high'];
// Fields of the earlier, longer tour format, with where their content goes now.
const REMOVED = {
  context: 'put the why in summary, in one line',
  scenario: 'put the concrete case in a step body',
  evidence: 'put how it is tested in summary, in one line',
  glossary: 'define a new name where the reader first meets it',
  order: 'the reading path speaks for itself',
};
const REMOVED_STEP = {
  claim: 'make the first sentence of body say it',
  depends: 'order the steps so each builds on earlier ones',
  tag: 'the title says what the step is',
  attention: 'use checks',
};
// Words that judge the code for the reviewer; checks may use them in questions.
const REASSURING = /\b(simply|trivial(?:ly)?|obviously|clearly|correctly|properly|safely|robust(?:ly)?|elegant(?:ly)?|seamless(?:ly)?|simplement|triviale?s?|évidemment|clairement|correctement|proprement|sans risque|robustes?|élégante?s?)\b/giu;
const IDLE_MS = 15 * 60 * 1000; // serve stops this long after the last request; an open page pings every minute
const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/;
const BADGE = /\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
const REF = /^(.*?)(?::(\d+)(?:-(\d+))?)?$/;
const PR_FIELDS = 'number,title,body,url,author,state,isDraft,baseRefName,headRefName,baseRefOid,headRefOid';
const EVENTS = ['COMMENT', 'APPROVE', 'REQUEST_CHANGES'];
const MISSING = Symbol('missing');

function die(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function run(cmd, args, cwd, { check = true, input, buffer = false } = {}) {
  const result = spawnSync(cmd, args, { cwd, input, encoding: buffer ? 'buffer' : 'utf8', maxBuffer: 1 << 30 });
  if (result.error) {
    if (result.error.code !== 'ENOENT') throw result.error;
    if (check) die(`${cmd} is not installed`);
    return null;
  }
  if (check && result.status !== 0) die(`${cmd} ${args.join(' ')} failed: ${String(result.stderr).trim()}`);
  return result;
}
const git = (repo, ...args) => run('git', ['-c', 'core.quotepath=off', ...args], repo).stdout;
const gitOk = (repo, ...args) => run('git', args, repo, { check: false }).status === 0;

function rev(repo, ref) {
  const result = run('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], repo, { check: false });
  if (result.status !== 0) die(`unknown commit or ref: ${ref}`);
  return result.stdout.trim();
}

// Text of path at sha, null when binary or too large, MISSING when absent.
function readBlob(repo, sha, path) {
  const listing = git(repo, 'ls-tree', '-l', sha, '--', path).split('\t')[0].trim().split(/\s+/);
  if (listing.length < 4 || listing[1] !== 'blob') return MISSING;
  if (Number(listing[3]) > MAX_BYTES) return null;
  const raw = run('git', ['cat-file', 'blob', `${sha}:${path}`], repo, { buffer: true }).stdout;
  return raw.subarray(0, 8000).includes(0) ? null : raw.toString('utf8');
}

function loadJson(path) {
  if (!existsSync(path)) die(`${path} not found`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    die(`${path} is not valid JSON: ${error.message}`);
  }
}

function openInBrowser(url) {
  const [cmd, args] = process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
      : ['xdg-open', [url]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).on('error', () => console.error(`open ${url} in your browser`)).unref();
}

// ---------------------------------------------------------------- collect

function prNumber(target) {
  if (!target) return null;
  const match = target.match(/^#?(\d+)$/) || target.match(/\/pull\/(\d+)/);
  return match ? match[1] : null;
}

function ghPr(repo, selector) {
  const result = run('gh', ['pr', 'view', selector, '--json', PR_FIELDS], repo, { check: false });
  if (!result || result.status !== 0) return null;
  const pr = JSON.parse(result.stdout);
  pr.author = pr.author?.login ?? null;
  return pr;
}

function fetchCommit(repo, remote, sha, ref) {
  if (gitOk(repo, 'cat-file', '-e', `${sha}^{commit}`)) return;
  git(repo, 'fetch', '--quiet', '--no-tags', remote, ref);
  if (!gitOk(repo, 'cat-file', '-e', `${sha}^{commit}`)) die(`commit ${sha.slice(0, 12)} is still missing after fetching ${ref} from ${remote}`);
}

function defaultBase(repo, remote) {
  const result = run('git', ['symbolic-ref', '--quiet', '--short', `refs/remotes/${remote}/HEAD`], repo, { check: false });
  if (result.status === 0) return result.stdout.trim();
  for (const ref of [`${remote}/main`, `${remote}/master`, 'main', 'master']) {
    if (gitOk(repo, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`)) return ref;
  }
  die('cannot find the base branch; pass --base');
}

// Returns {pr, baseRef, baseSha, headRef, headSha}.
function resolveTarget(repo, target, base, remote) {
  const number = prNumber(target);
  if (number) {
    const pr = ghPr(repo, target);
    if (!pr) die(`cannot read PR ${target} with gh`);
    fetchCommit(repo, remote, pr.headRefOid, `pull/${number}/head`);
    fetchCommit(repo, remote, pr.baseRefOid, pr.baseRefName);
    return base
      ? { pr, baseRef: base, baseSha: rev(repo, base), headRef: pr.headRefName, headSha: pr.headRefOid }
      : { pr, baseRef: pr.baseRefName, baseSha: pr.baseRefOid, headRef: pr.headRefName, headSha: pr.headRefOid };
  }
  let head = target || 'HEAD';
  if (target && target.includes('..')) {
    const [left, right] = target.split(/\.{2,3}/, 2);
    base = base || left;
    head = right || 'HEAD';
  }
  const branch = head === 'HEAD'
    ? git(repo, 'branch', '--show-current').trim() || null
    : gitOk(repo, 'show-ref', '--verify', '--quiet', `refs/heads/${head}`) ? head : null;
  let pr = branch ? ghPr(repo, branch) : null;
  if (pr && pr.state !== 'OPEN') pr = null;
  if (!base) {
    const prBase = pr ? `${remote}/${pr.baseRefName}` : null;
    base = prBase && gitOk(repo, 'rev-parse', '--verify', '--quiet', `${prBase}^{commit}`) ? prBase : defaultBase(repo, remote);
  }
  return { pr, baseRef: base, baseSha: rev(repo, base), headRef: branch || head, headSha: rev(repo, head) };
}

function changedPaths(repo, base, head) {
  const raw = git(repo, 'diff', '--name-status', '-z', '-M', '--no-ext-diff', base, head).split('\0');
  const entries = [];
  for (let i = 0; i < raw.length && raw[i];) {
    const status = raw[i][0];
    if ('RC'.includes(status)) {
      entries.push({ status, oldPath: raw[i + 1], path: raw[i + 2] });
      i += 3;
    } else {
      entries.push({ status, oldPath: raw[i + 1], path: raw[i + 1] });
      i += 2;
    }
  }
  return entries;
}

function parseHunks(text) {
  const hunks = [];
  let current = null;
  let oldLine = 0;
  let newLine = 0;
  for (const line of text.split('\n')) {
    const match = line.match(HUNK);
    if (match) {
      oldLine = Number(match[1]);
      newLine = Number(match[3]);
      current = {
        oldStart: oldLine,
        oldLines: match[2] === undefined ? 1 : Number(match[2]),
        newStart: newLine,
        newLines: match[4] === undefined ? 1 : Number(match[4]),
        header: match[5].trim(),
        lines: [],
      };
      hunks.push(current);
      continue;
    }
    if (!current || !line || !'+- '.includes(line[0])) continue; // headers, "\ No newline at end of file", trailing newline
    const body = line.slice(1).replace(/\r$/, '');
    if (line[0] === '+') current.lines.push(['+', null, newLine++, body]);
    else if (line[0] === '-') current.lines.push(['-', oldLine++, null, body]);
    else current.lines.push([' ', oldLine++, newLine++, body]);
  }
  return hunks;
}

function describeFile(repo, base, head, entry) {
  const paths = entry.oldPath === entry.path ? [entry.path] : [entry.oldPath, entry.path];
  const text = git(repo, 'diff', '--no-color', '--no-ext-diff', '--no-textconv', '-M', '-U3', base, head, '--', ...paths);
  const hunks = parseHunks(text);
  const lines = hunks.flatMap(h => h.lines);
  return {
    ...entry,
    binary: !hunks.length && (text.includes('Binary files') || text.includes('GIT binary patch')),
    additions: lines.filter(l => l[0] === '+').length,
    deletions: lines.filter(l => l[0] === '-').length,
    large: lines.length > LARGE_DIFF,
    hunks,
  };
}

function commitsBetween(repo, base, head) {
  const log = git(repo, 'log', '--reverse', '--format=%H%x1f%an%x1f%aI%x1f%s%x1f%b%x1e', `${base}..${head}`);
  const keys = ['sha', 'author', 'date', 'subject', 'body'];
  return log.split('\x1e').filter(r => r.trim()).map(r => {
    const values = r.replace(/^\n+|\n+$/g, '').split('\x1f');
    return Object.fromEntries(keys.map((k, i) => [k, values[i] ?? '']));
  });
}

function recentHistory(repo, mergeBase, files) {
  const paths = new Set(files.filter(f => f.status !== 'A').map(f => f.oldPath));
  files.filter(f => f.status === 'A').forEach(f => paths.add(posix.dirname(f.path)));
  const list = [...paths].filter(p => p !== '.').sort().slice(0, 200);
  if (!list.length) return '';
  return git(repo, 'log', '--format=%h %ad %an  %s', '--date=short', '-n', '25', mergeBase, '--', ...list);
}

function repoName(repo, remote, pr) {
  let url = pr?.url || '';
  if (!url) {
    const result = run('git', ['remote', 'get-url', remote], repo, { check: false });
    url = result.status === 0 ? result.stdout.trim() : '';
  }
  const match = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git|\/pull\/.*)?$/);
  return match ? match[1] : posix.basename(repo);
}

const overlaps = ([a, b], [c, d]) => a <= d && c <= b;

function hunkSpan(hunk, side) {
  const [start, count] = side === 'new' ? [hunk.newStart, hunk.newLines] : [hunk.oldStart, hunk.oldLines];
  return count ? [start, start + count - 1] : [start, start];
}

function overview(data, history, codeAt) {
  const { pr, files } = data;
  const out = [`# ${data.title}`, ''];
  if (pr) out.push(`PR #${pr.number} by ${pr.author} (${pr.state.toLowerCase()}${pr.isDraft ? ', draft' : ''}): ${pr.url}`);
  const adds = files.reduce((n, f) => n + f.additions, 0);
  const dels = files.reduce((n, f) => n + f.deletions, 0);
  out.push(`Diff: ${data.base.ref} (merge base ${data.mergeBase.slice(0, 8)}) → ${data.head.ref} (${data.head.sha.slice(0, 8)}): `
    + `${files.length} files, +${adds} −${dels}, ${data.commits.length} commits.`);
  out.push(`Head commit: ${data.head.sha}`, `Code at head: ${codeAt}`);
  if (pr?.body?.trim()) out.push('', '## PR description', '', pr.body.trim());
  out.push('', '## Commits (oldest first)', '');
  for (const c of data.commits) {
    out.push(`- ${c.sha.slice(0, 8)} ${c.subject} (${c.author}, ${c.date.slice(0, 10)})`);
    c.body.trim().split('\n').filter(l => l.trim()).forEach(l => out.push(`    ${l}`));
  }
  out.push('', '## Changed files and hunks', '',
    'Hunk numbers are what `hunks` refers to in tour.json. Line ranges are new-side lines (old-side for deleted files).');
  for (const f of files) {
    const note = f.oldPath !== f.path ? ` (renamed from ${f.oldPath})` : '';
    const flags = f.binary ? ' [binary]' : f.large ? ' [large]' : '';
    out.push('', `### ${f.status} ${f.path} (+${f.additions} −${f.deletions})${note}${flags}`);
    const side = f.status === 'D' ? 'old' : 'new';
    f.hunks.forEach((h, i) => {
      const [first, last] = hunkSpan(h, side);
      const changed = h.lines.find(l => l[0] !== ' ' && l[3].trim())?.[3].trim() ?? '';
      const context = h.header ? ` in \`${h.header}\`` : '';
      out.push(`- hunk ${i}: lines ${first}-${last}${context}: \`${changed.slice(0, 90)}\``);
    });
  }
  if (history.trim()) out.push('', '## Recent history of the touched paths (before this change)', '', '```', history.trimEnd(), '```');
  return out.join('\n') + '\n';
}

function collect(target, opts) {
  const repo = run('git', ['rev-parse', '--show-toplevel'], process.cwd()).stdout.trim();
  const { pr, baseRef, baseSha, headRef, headSha } = resolveTarget(repo, target, opts.base, opts.remote);
  const mergeBase = git(repo, 'merge-base', baseSha, headSha).trim();
  const files = changedPaths(repo, mergeBase, headSha).map(e => describeFile(repo, mergeBase, headSha, e));
  if (!files.length) die(`no changes between ${baseRef} and ${headRef}`);
  const log = commitsBetween(repo, mergeBase, headSha);
  const contents = {};
  const baseContents = {};
  for (const f of files) {
    if (f.status !== 'D') {
      const text = readBlob(repo, headSha, f.path);
      contents[f.path] = text === MISSING ? null : text;
    }
    if (!'AC'.includes(f.status)) {
      const text = readBlob(repo, mergeBase, f.oldPath);
      baseContents[f.path] = text === MISSING ? null : text;
    }
  }
  const data = {
    version: 1,
    repo,
    repoName: repoName(repo, opts.remote, pr),
    title: pr ? pr.title : log.length === 1 ? log[0].subject : headRef,
    pr,
    base: { ref: baseRef, sha: baseSha },
    head: { ref: headRef, sha: headSha },
    mergeBase,
    commits: log,
    files,
    contents,
    baseContents,
  };
  const folder = opts.out ? resolve(opts.out) : mkdtempSync(join(tmpdir(), 'guided-review.'));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'data.json'), JSON.stringify(data));
  writeFileSync(join(folder, 'diff.patch'), git(repo, 'diff', '--no-color', '--no-ext-diff', '-M', mergeBase, headSha));
  // Reading the whole module needs the code at the PR head: the checkout itself when it is there and clean.
  const clean = gitOk(repo, 'diff', '--quiet', 'HEAD') && !git(repo, 'status', '--porcelain').trim();
  const codeAt = rev(repo, 'HEAD') === headSha && clean
    ? `this checkout, ${repo}`
    : `not checked out here; run \`git -C ${repo} worktree add --detach ${join(folder, 'head')} ${headSha}\`, `
      + `read it there, and remove it with \`git -C ${repo} worktree remove ${join(folder, 'head')}\` once done`;
  writeFileSync(join(folder, 'overview.md'), overview(data, recentHistory(repo, mergeBase, files), codeAt));
  console.log(folder);
}

// ---------------------------------------------------------------- build

// Changed files from the diff, plus unchanged files read at head on first reference.
class Files {
  constructor(data) {
    this.changed = new Map(data.files.map(f => [f.path, f]));
    this.repo = data.repo;
    this.head = data.head.sha;
    this.contents = data.contents;
    this.baseContents = data.baseContents || {};
    this.missing = new Set();
  }

  exists(path) {
    if (this.changed.has(path) || path in this.contents) return true;
    if (this.missing.has(path)) return false;
    const text = readBlob(this.repo, this.head, path);
    if (text === MISSING) {
      this.missing.add(path);
      return false;
    }
    this.contents[path] = text;
    return true;
  }

  lineCount(path) {
    const f = this.changed.get(path);
    const text = f && f.status === 'D' ? this.baseContents[path] : this.contents[path];
    if (typeof text !== 'string') return null;
    return text.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n').length;
  }
}

function parseLines(value) {
  if (Number.isInteger(value)) value = [value, value];
  if (typeof value === 'string') {
    const match = value.match(/^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/);
    if (!match) return null;
    value = [Number(match[1]), Number(match[2] ?? match[1])];
  }
  if (Array.isArray(value) && value.length === 2 && value.every(v => Number.isInteger(v) && v >= 1)) {
    return value[0] <= value[1] ? value : null;
  }
  return null;
}

const isText = value => typeof value === 'string' && value.trim() !== '';
const wordCount = text => String(text ?? '').split(/\s+/).filter(Boolean).length;

function validate(tour, data) {
  const errors = [];
  const warnings = [];
  const files = new Files(data);
  const checkRange = (where, path, [a, b]) => {
    const count = files.lineCount(path);
    if (count === null) return;
    if (a > count) errors.push(`${where}: ${path} has ${count} lines; range ${a}-${b} starts past the end`);
    else if (b > count) warnings.push(`${where}: ${path} has ${count} lines; range ${a}-${b} ends past the end`);
  };
  if (!tour || typeof tour !== 'object' || Array.isArray(tour)) return { errors: ['tour.json must be an object'], warnings };
  if (!isText(tour.summary)) errors.push('summary: required, non-empty markdown');
  else {
    const lines = tour.summary.split('\n').filter(l => l.trim()).length;
    if (lines > SUMMARY_LINES) errors.push(`summary: ${lines} lines; keep it to ${SUMMARY_LINES} at most`);
    if (wordCount(tour.summary) > SUMMARY_WORDS) warnings.push(`summary: over ${SUMMARY_WORDS} words; shorten the sentences`);
  }
  for (const [key, hint] of Object.entries(REMOVED)) if (key in tour) errors.push(`${key}: no longer part of the tour; ${hint}`);
  const flow = tour.flow ?? [];
  if (!Array.isArray(flow) || !flow.every(node => node && typeof node === 'object' && isText(node.label))) {
    errors.push('flow: must be a list of { "label", "step" }');
  }
  const steps = tour.steps;
  if (!Array.isArray(steps) || !steps.length) return { errors: [...errors, 'steps: required, a non-empty list'], warnings };
  if (steps.length > MAX_STEPS) warnings.push(`${steps.length} steps: group related changes, or tell the user the PR bundles several changes`);

  const ids = new Set();
  steps.forEach((step, i) => {
    if (!step || typeof step !== 'object') return errors.push(`step ${i + 1}: must be an object`);
    step.id ??= `step-${i + 1}`;
    if (ids.has(step.id)) errors.push(`step ${i + 1}: duplicate id ${JSON.stringify(step.id)}`);
    ids.add(step.id);
  });

  if (Array.isArray(flow)) {
    if (!flow.length && Array.isArray(tour.steps) && tour.steps.length > 1) warnings.push('flow: missing; list where the change runs, in order, so the reader sees how the steps fit');
    flow.forEach((node, k) => {
      if (node && 'step' in node && !ids.has(node.step)) errors.push(`flow[${k + 1}]: step names no step id ${JSON.stringify(node.step)}`);
    });
  }
  const texts = [['summary', tour.summary ?? '', true], ...(Array.isArray(flow) ? flow.map((node, k) => [`flow[${k + 1}]`, node?.label ?? '', true]) : [])]; // [where, markdown, judged]: judged texts are scanned for reassuring words
  const shown = new Map(); // changed path -> Set of hunk indexes some panel shows
  const showHunks = (path, list) => {
    const set = shown.get(path) ?? new Set();
    list.forEach(h => set.add(h));
    shown.set(path, set);
  };
  steps.forEach((step, i) => {
    if (!step || typeof step !== 'object') return;
    const where = `step ${i + 1} (${step.id})`;
    for (const key of ['title', 'body']) if (!isText(step[key])) errors.push(`${where}: ${key} is required`);
    for (const [key, hint] of Object.entries(REMOVED_STEP)) if (key in step) errors.push(`${where}: ${key} is no longer part of a step; ${hint}`);
    texts.push([where, step.title ?? '', true], [where, step.body ?? '', true]);
    if ('link' in step && !isText(step.link)) errors.push(`${where}: link must be one sentence`);
    else if (isText(step.link)) texts.push([where, step.link, true]);
    else if (i > 0) warnings.push(`${where}: no link; say in one sentence how this step follows from the previous one`);
    if (Array.isArray(flow) && flow.length && !flow.some(node => node?.step === step.id)) warnings.push(`${where}: appears nowhere in flow`);
    if (wordCount(step.body) > LONG_STEP_WORDS) {
      warnings.push(`${where}: body is over ${LONG_STEP_WORDS} words; cut it, split the step, or move detail to panel notes`);
    }
    if (!RISKS.includes(step.risk)) errors.push(`${where}: risk must be ${RISKS.join(', ')}`);
    const checks = step.checks ?? [];
    if (!Array.isArray(checks)) errors.push(`${where}: checks must be a list`);
    else {
      if (checks.length > MAX_CHECKS) errors.push(`${where}: ${checks.length} checks; keep the ${MAX_CHECKS} that matter most`);
      else if (!checks.length && step.risk !== 'low') warnings.push(`${where}: no check; a ${step.risk} risk step needs the one question that matters most`);
      checks.forEach((check, k) => {
        if (!isText(check)) return errors.push(`${where}, check ${k + 1}: must be a non-empty sentence`);
        texts.push([`${where}, check ${k + 1}`, check, false]);
      });
    }
    const show = step.show ?? [];
    if (!Array.isArray(show)) return errors.push(`${where}: show must be a list`);
    if (show.length > MAX_PANELS) warnings.push(`${where}: ${show.length} code panels; more than ${MAX_PANELS} is hard to follow`);
    show.forEach((card, j) => {
      const spot = `${where}, show[${j + 1}]`;
      const path = card && typeof card === 'object' ? card.file : null;
      if (!isText(path)) return errors.push(`${spot}: file is required`);
      const changed = files.changed.get(path);
      if (!changed && !files.exists(path)) return errors.push(`${spot}: ${JSON.stringify(path)} is neither changed nor present at head`);
      let lines = null;
      if ('lines' in card) {
        lines = parseLines(card.lines);
        if (!lines) errors.push(`${spot}: lines must look like "12-30" or "12"`);
        else {
          card.lines = lines;
          checkRange(spot, path, lines);
        }
      }
      if (card.hunks !== undefined) {
        const count = changed ? changed.hunks.length : 0;
        if (!changed) errors.push(`${spot}: hunks only apply to changed files`);
        else if (!Array.isArray(card.hunks) || !card.hunks.length || !card.hunks.every(h => Number.isInteger(h) && h >= 0 && h < count)) {
          errors.push(`${spot}: hunks must list indexes between 0 and ${count - 1} (see overview.md)`);
        } else showHunks(path, card.hunks);
      } else if (changed && lines) {
        const side = changed.status === 'D' ? 'old' : 'new';
        showHunks(path, changed.hunks.map((h, k) => k).filter(k => overlaps(hunkSpan(changed.hunks[k], side), lines)));
      } else if (changed && !('lines' in card)) showHunks(path, changed.hunks.map((h, k) => k));
      if (changed && !changed.hunks.length) shown.set(path, shown.get(path) ?? new Set()); // binary or mode-only
      const view = card.view;
      if (![undefined, 'diff', 'file'].includes(view)) errors.push(`${spot}: view must be "diff" or "file"`);
      else if (view === 'diff' && !changed) errors.push(`${spot}: view "diff" needs a changed file`);
      else if (view === 'file' && changed?.status === 'D') errors.push(`${spot}: a deleted file has no file view`);
      const highlights = card.highlights ?? [];
      if (!Array.isArray(highlights)) errors.push(`${spot}: highlights must be a list of { "lines", "text" }`);
      else {
        if (highlights.length > MAX_HIGHLIGHTS) warnings.push(`${spot}: ${highlights.length} highlights; keep the ${MAX_HIGHLIGHTS} that explain the most`);
        highlights.forEach((h, k) => {
          const at = `${spot}, highlight ${k + 1}`;
          const range = h && typeof h === 'object' ? parseLines(h.lines) : null;
          if (!range) return errors.push(`${at}: lines must look like "12-30" or "12"`);
          if (!isText(h.text)) return errors.push(`${at}: text is required`);
          h.lines = range;
          checkRange(at, path, range);
          texts.push([at, h.text, true]);
          if (wordCount(h.text) > LONG_NOTE_WORDS) warnings.push(`${at}: over ${LONG_NOTE_WORDS} words; one or two sentences`);
          if (lines && (range[1] < lines[0] - 6 || range[0] > lines[1] + 6)) warnings.push(`${at}: lines ${range.join('-')} fall outside the panel's lines; the reader will not see them`);
        });
      }
      if (isText(card.note)) texts.push([spot, card.note, true]);
      else warnings.push(`${spot}: no note; say in one sentence what to look at in this code`);
    });
  });

  for (const [where, text, judged] of texts) {
    const words = judged ? [...new Set([...String(text).matchAll(REASSURING)].map(m => m[0].toLowerCase()))] : [];
    if (words.length) warnings.push(`${where}: "${words.join('", "')}" judges the code for the reviewer; describe what it does instead`);
    for (const match of String(text).matchAll(BADGE)) {
      const target = match[1].trim();
      if (target.startsWith('step:')) {
        if (!ids.has(target.slice(5).trim())) errors.push(`${where}: [[${target}]] names no step id`);
        continue;
      }
      const ref = target.match(REF);
      if (!files.exists(ref[1])) errors.push(`${where}: [[${target}]] points to no changed file nor file at head`);
      else if (ref[2]) checkRange(where, ref[1], [Number(ref[2]), Number(ref[3] ?? ref[2])]);
    }
  }

  let skipped = tour.skipped ?? [];
  if (!Array.isArray(skipped)) {
    errors.push('skipped must be a list');
    skipped = [];
  }
  const left = new Map(); // changed path -> hunk indexes no step shows
  for (const [path, f] of files.changed) {
    const seen = shown.get(path);
    if (!seen) left.set(path, f.hunks.length ? f.hunks.map((h, k) => k) : [-1]);
    else if (f.hunks.some((h, k) => !seen.has(k))) left.set(path, f.hunks.map((h, k) => k).filter(k => !seen.has(k)));
  }
  for (const item of skipped) {
    const path = item && typeof item === 'object' ? item.file : null;
    const f = files.changed.get(path);
    if (!f) { errors.push(`skipped: ${JSON.stringify(path)} is not a changed file`); continue; }
    if (!isText(item.reason)) { errors.push(`skipped: ${path} needs a reason`); continue; }
    if (item.hunks === undefined) { left.delete(path); continue; }
    if (!Array.isArray(item.hunks) || !item.hunks.length || !item.hunks.every(h => Number.isInteger(h) && h >= 0 && h < f.hunks.length)) {
      errors.push(`skipped: ${path} hunks must list indexes between 0 and ${f.hunks.length - 1}`);
      continue;
    }
    const rest = (left.get(path) ?? []).filter(k => !item.hunks.includes(k));
    if (rest.length) left.set(path, rest); else left.delete(path);
  }
  if (left.size) {
    const list = [...left].map(([path, hunks]) => {
      const f = files.changed.get(path);
      const shownSome = shown.has(path);
      if (!shownSome || hunks[0] === -1) return path;
      return `${path} hunk${hunks.length > 1 ? 's' : ''} ${hunks.map(k => `${k} (lines ${hunkSpan(f.hunks[k], f.status === 'D' ? 'old' : 'new').join('-')})`).join(', ')}`;
    });
    errors.push(`changed code neither shown in a step nor listed in skipped: ${list.join('; ')}`);
  }
  return { errors, warnings };
}

function build(folder, { open }) {
  folder = resolve(folder);
  const data = loadJson(join(folder, 'data.json'));
  const tour = loadJson(join(folder, 'tour.json'));
  const { errors, warnings } = validate(tour, data);
  warnings.forEach(w => console.error(`warning: ${w}`));
  if (errors.length) {
    errors.forEach(e => console.error(`error: ${e}`));
    process.exit(1);
  }
  const { repo, ...pub } = data;
  // "<" never appears outside JSON strings, so escaping it keeps "</script>" out of the page.
  const payload = JSON.stringify({ data: pub, tour }).replace(/</g, '\\u003c');
  // The bundle holds "</script" and "<!--" in grammar strings, so it is embedded as a data URL, not inline.
  const bundle = readFileSync(join(VIEWER, 'vendor', 'codemirror.js')).toString('base64');
  const read = name => readFileSync(join(VIEWER, name), 'utf8');
  // Function replacements: the inserted text may contain "$&" and similar patterns.
  const page = read('index.html')
    .replace('__GR_STYLE__', () => read('style.css'))
    .replace('__GR_CODEMIRROR__', () => `data:text/javascript;base64,${bundle}`)
    .replace('__GR_APP__', () => read('app.js'))
    .replace('__GR_PAYLOAD__', () => payload);
  const out = join(folder, 'review.html');
  writeFileSync(out, page);
  console.log(out);
  if (open) openInBrowser(pathToFileURL(out).href);
}

// ---------------------------------------------------------------- serve

// Line numbers GitHub accepts a review comment on: every line of a diff hunk, per side.
function commentableLines(files) {
  const lines = new Map();
  for (const f of files) {
    const left = new Set();
    const right = new Set();
    f.hunks.forEach(h => h.lines.forEach(([, o, n]) => {
      if (o != null) left.add(o);
      if (n != null) right.add(n);
    }));
    lines.set(f.path, { LEFT: left, RIGHT: right });
  }
  return lines;
}

function checkReview(input, commentable) {
  if (!input || typeof input !== 'object') return 'invalid request';
  const { event, body = '', comments = [] } = input;
  if (!EVENTS.includes(event)) return `event must be one of ${EVENTS.join(', ')}`;
  if (typeof body !== 'string' || !Array.isArray(comments)) return 'invalid request';
  if (event === 'REQUEST_CHANGES' && !body.trim()) return 'requesting changes needs a review comment';
  if (event === 'COMMENT' && !body.trim() && !comments.length) return 'a comment review needs a comment';
  for (const c of comments) {
    const sides = c && commentable.get(c.path);
    if (!sides || !['LEFT', 'RIGHT'].includes(c.side) || !Number.isInteger(c.line) || !isText(c.body)) {
      return 'invalid line comment';
    }
    if (!sides[c.side].has(c.line)) return `${c.path}:${c.line} is outside the diff`;
  }
  return null;
}

function serve(folder, { port, open }) {
  folder = resolve(folder);
  const data = loadJson(join(folder, 'data.json'));
  const pagePath = join(folder, 'review.html');
  if (!existsSync(pagePath)) die(`${pagePath} not found; run build first`);
  const pr = data.pr;
  const slug = pr?.url?.match(/github\.com\/([^/]+\/[^/]+)\/pull\//)?.[1] ?? null;
  const commentable = commentableLines(data.files);
  const token = randomBytes(18).toString('base64url');
  const prefix = `/${token}/`;
  let origin = '';
  let idle;
  const touch = () => {
    clearTimeout(idle);
    idle = setTimeout(() => {
      console.log('no open page for 15 minutes; stopping');
      process.exit(0);
    }, IDLE_MS);
  };

  const gh = (args, input) => run('gh', args, data.repo, { check: false, input });
  const send = (res, status, body, type = 'application/json') => {
    res.writeHead(status, {
      'Content-Type': `${type}; charset=utf-8`,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer', // links out of the page must not leak the token
    });
    res.end(type === 'application/json' ? JSON.stringify(body) : body);
  };
  const samePrefix = path => {
    const a = Buffer.from(path.slice(0, prefix.length));
    const b = Buffer.from(prefix);
    return a.length === b.length && timingSafeEqual(a, b);
  };

  function status() {
    if (!pr || !slug) return { review: false, reason: 'not a GitHub pull request' };
    const viewer = gh(['api', 'user', '--jq', '.login']);
    if (!viewer || viewer.status !== 0) return { review: false, reason: 'gh is not authenticated' };
    const current = gh(['pr', 'view', String(pr.number), '--repo', slug, '--json', 'headRefOid,state']);
    const live = current?.status === 0 ? JSON.parse(current.stdout) : {};
    return {
      review: true,
      viewer: viewer.stdout.trim(),
      author: pr.author,
      state: live.state ?? pr.state,
      reviewedHead: data.head.sha,
      currentHead: live.headRefOid ?? null,
    };
  }

  function submit(input) {
    if (!pr || !slug) return [409, { error: 'not a GitHub pull request' }];
    const problem = checkReview(input, commentable);
    if (problem) return [400, { error: problem }];
    const review = { commit_id: data.head.sha, event: input.event, comments: input.comments.map(c => ({ path: c.path, line: c.line, side: c.side, body: c.body })) };
    if (input.body.trim()) review.body = input.body;
    const result = gh(['api', '-X', 'POST', `repos/${slug}/pulls/${pr.number}/reviews`, '--input', '-'], JSON.stringify(review));
    if (!result) return [500, { error: 'gh is not installed' }];
    let response = {};
    try { response = JSON.parse(result.stdout || '{}'); } catch { /* gh printed plain text */ }
    if (result.status !== 0) {
      const details = [response.message, ...(response.errors ?? []).map(e => (typeof e === 'string' ? e : e.message))].filter(Boolean);
      return [502, { error: details.join(' — ') || result.stderr.trim() || 'GitHub rejected the review' }];
    }
    return [200, { url: response.html_url ?? pr.url }];
  }

  const server = createServer((req, res) => {
    touch();
    // A page on another site can reach 127.0.0.1: the token in the path, the Host check (DNS rebinding),
    // and the Origin check on writes keep it from reading the review or posting on the reviewer's behalf.
    if (req.headers.host !== new URL(origin).host || !samePrefix(req.url)) return send(res, 404, { error: 'not found' });
    const route = new URL(req.url, origin).pathname.slice(prefix.length);
    if (req.method === 'GET' && route === '') return send(res, 200, readFileSync(pagePath, 'utf8'), 'text/html');
    if (req.method === 'GET' && route === 'api/ping') return send(res, 200, { ok: true });
    if (req.method === 'GET' && route === 'api/status') return send(res, 200, status());
    if (req.method === 'POST' && route === 'api/review') {
      if (req.headers.origin !== origin) return send(res, 403, { error: 'forbidden' });
      let raw = '';
      req.setEncoding('utf8');
      req.on('data', chunk => {
        raw += chunk;
        if (raw.length > 1_000_000) req.destroy();
      });
      req.on('end', () => {
        let input;
        try { input = JSON.parse(raw); } catch { return send(res, 400, { error: 'invalid JSON' }); }
        const [code, body] = submit(input);
        send(res, code, body);
      });
      return;
    }
    send(res, 404, { error: 'not found' });
  });
  server.on('error', error => die(error.message));
  server.listen(port, '127.0.0.1', () => {
    origin = `http://127.0.0.1:${server.address().port}`;
    const url = `${origin}${prefix}`;
    console.log(url);
    if (!pr) console.log('not a pull request: the page is read-only');
    touch();
    if (open) openInBrowser(url);
  });
}

// ---------------------------------------------------------------- main

const [command, ...rest] = process.argv.slice(2);
const usage = 'usage: guided-review.mjs collect [TARGET] [--base REF] [--remote NAME] [--out DIR]\n'
  + '       guided-review.mjs build DIR [--open]\n'
  + '       guided-review.mjs serve DIR [--port N] [--no-open]';
const options = {
  collect: { base: { type: 'string' }, remote: { type: 'string', default: 'origin' }, out: { type: 'string' } },
  build: { open: { type: 'boolean', default: false } },
  serve: { port: { type: 'string', default: '0' }, 'no-open': { type: 'boolean', default: false } },
}[command];
if (!options) die(usage);
let parsed;
try {
  parsed = parseArgs({ args: rest, options, allowPositionals: true });
} catch (error) {
  die(`${error.message}\n${usage}`);
}
const { values, positionals } = parsed;
if (command === 'collect') collect(positionals[0], values);
else if (!positionals[0]) die(usage);
else if (command === 'build') build(positionals[0], values);
else serve(positionals[0], { port: Number(values.port), open: !values['no-open'] });
