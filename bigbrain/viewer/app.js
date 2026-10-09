/* Guided PR review viewer: renders the embedded {data, tour} payload as a guided tour and a classic files view. */
(function () {
  'use strict';

  const CM = window.CM;
  const PAD = 6; // unchanged lines shown around a focused range in file view

  const STRINGS = {
    en: {
      app: 'Guided review', tour: 'Tour', files: 'Files', intro: 'Overview', end: 'Wrap-up',
      stepOf: (n, t) => `Step ${n} of ${t}`, start: 'Start the tour', next: 'Next', prev: 'Previous',
      description: 'Author’s description', botHidden: n => (n === 1 ? 'An automated summary is hidden.' : `${n} automated summaries are hidden.`),
      check: 'Worth a look', noChecks: 'No specific point was flagged.',
      skipped: 'Not detailed in the tour', skippedShort: 'not detailed',
      commits: 'Commits', changed: 'Changed files', contextFiles: 'Context',
      viewed: 'Viewed', viewedCount: (a, b) => `${a} of ${b} files viewed`,
      added: 'Additions', removed: 'Deletions', filter: 'Filter files', noMatch: 'No file matches.',
      diff: 'Diff', file: 'File', openFiles: 'Open in the files view', preview: 'Preview', back: 'Back to the step',
      hiddenChanges: n => (n === 1 ? 'Show 1 more change in this file' : `Show ${n} more changes in this file`),
      wholeFile: n => `Show the whole file (${n} lines)`, split: 'Side-by-side diff',
      phrases: {},
      unavailable: 'Content not available (binary, too large, or deleted).', binary: 'Binary file.',
      noText: 'No textual change (mode or metadata only).',
      large: n => `Large diff: ${n} lines.`, renderAnyway: 'Render it',
      explainedIn: 'Explained in', notExplained: 'Not explained in any step.', contextFile: 'Unchanged file, shown for context.',
      endTitle: 'You made it through the tour',
      endText: n => `You went through the ${n} steps. Here are the points worth a look, then finish file by file in the files view.`,
      switchFiles: 'Files view', theme: 'Toggle theme', wrap: 'Wrap long lines', sidebar: 'Toggle sidebar', renamedFrom: 'from',
      noCode: 'This step shows no code.', prevFile: 'Previous file', nextFile: 'Next file',
      by: 'by',
      collapse: 'Collapse or expand', keys: { steps: 'steps', files: 'files', viewed: 'viewed' },
      status: { A: 'Added', M: 'Modified', D: 'Deleted', R: 'Renamed', C: 'Copied', T: 'Type changed' },
      review: 'Review', finish: 'Finish your review', pending: 'Pending', edit: 'Edit', remove: 'Delete',
      addComment: 'Comment', save: 'Save', cancel: 'Cancel', close: 'Close',
      commentOn: (line, old) => `Comment on line ${line}${old ? ' (old version)' : ''}`,
      commentPlaceholder: 'Leave a comment (Markdown)', outsideDiff: 'GitHub only accepts comments on lines of the diff.',
      oldSide: 'old', lineComments: 'Pending comments',
      noComments: 'Hover a line number in a diff and click + to comment on that line.',
      reviewBody: 'Overall comment (Markdown)',
      events: { COMMENT: 'Comment', APPROVE: 'Approve', REQUEST_CHANGES: 'Request changes' },
      eventHints: {
        COMMENT: 'General feedback, without explicit approval.',
        APPROVE: 'Give your approval to merge these changes.',
        REQUEST_CHANGES: 'Feedback that must be addressed before merging.',
      },
      submitAs: { COMMENT: 'Submit comments', APPROVE: 'Approve', REQUEST_CHANGES: 'Request changes' },
      ownPr: 'This is your own pull request: GitHub refuses approvals and change requests from its author.',
      headMoved: 'The pull request has new commits since this tour was prepared. Your review targets the reviewed commit; its comments may show as outdated.',
      notOpen: 'This pull request is not open.', sending: 'Sending…', sent: 'Review submitted',
      sentText: { COMMENT: 'Your comments are on GitHub.', APPROVE: 'You approved the pull request.', REQUEST_CHANGES: 'You requested changes.' },
      openOnGitHub: 'Open on GitHub', needBody: 'Requesting changes needs an overall comment.', needSomething: 'Write a comment first.',
      failed: 'GitHub rejected the review:', offline: 'The local server does not answer. Is serve still running?', done: 'Done',
      path: 'Reading path', readHint: { high: 'read every line', low: 'skim' },
      skippedHunks: n => (n === 1 ? '1 change' : `${n} changes`),
    },
    fr: {
      app: 'Revue guidée', tour: 'Visite', files: 'Fichiers', intro: 'Introduction', end: 'Récapitulatif',
      stepOf: (n, t) => `Étape ${n} sur ${t}`, start: 'Commencer la visite', next: 'Suivant', prev: 'Précédent',
      description: 'Description de l’auteur', botHidden: n => (n === 1 ? 'Un résumé automatique est masqué.' : `${n} résumés automatiques sont masqués.`),
      check: 'À regarder', noChecks: "Aucun point particulier n'a été signalé.",
      skipped: 'Non détaillés dans la visite', skippedShort: 'non détaillé',
      commits: 'Commits', changed: 'Fichiers modifiés', contextFiles: 'Contexte',
      viewed: 'Vu', viewedCount: (a, b) => `${a} fichier${a > 1 ? 's' : ''} vu${a > 1 ? 's' : ''} sur ${b}`,
      added: 'Ajouts', removed: 'Suppressions', filter: 'Filtrer les fichiers', noMatch: 'Aucun fichier ne correspond.',
      diff: 'Diff', file: 'Fichier', openFiles: 'Ouvrir dans la vue fichiers', preview: 'Aperçu', back: "Revenir à l'étape",
      hiddenChanges: n => (n === 1 ? 'Afficher 1 autre modification de ce fichier' : `Afficher ${n} autres modifications de ce fichier`),
      wholeFile: n => `Afficher tout le fichier (${n} lignes)`, split: 'Diff côte à côte',
      phrases: { '$ unchanged lines': '$ lignes inchangées' },
      unavailable: 'Contenu indisponible (binaire, trop volumineux ou supprimé).', binary: 'Fichier binaire.',
      noText: 'Aucune modification textuelle (mode ou métadonnées).',
      large: n => `Diff volumineux : ${n} lignes.`, renderAnyway: 'Afficher quand même',
      explainedIn: 'Expliqué dans', notExplained: 'Expliqué dans aucune étape.', contextFile: 'Fichier non modifié, affiché pour le contexte.',
      endTitle: 'Vous avez fait le tour',
      endText: n => `Vous avez parcouru les ${n} étapes. Voici les points à regarder, puis terminez fichier par fichier dans la vue fichiers.`,
      switchFiles: 'Vue fichiers', theme: 'Changer de thème', wrap: 'Retour à la ligne', sidebar: 'Afficher ou masquer le panneau', renamedFrom: 'depuis',
      noCode: "Cette étape n'affiche pas de code.", prevFile: 'Fichier précédent', nextFile: 'Fichier suivant',
      by: 'par',
      collapse: 'Replier ou déplier', keys: { steps: 'étapes', files: 'fichiers', viewed: 'vu' },
      status: { A: 'Ajouté', M: 'Modifié', D: 'Supprimé', R: 'Renommé', C: 'Copié', T: 'Type modifié' },
      review: 'Review', finish: 'Terminer la review', pending: 'En attente', edit: 'Modifier', remove: 'Supprimer',
      addComment: 'Commenter', save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer',
      commentOn: (line, old) => `Commenter la ligne ${line}${old ? ' (ancienne version)' : ''}`,
      commentPlaceholder: 'Écrire un commentaire (Markdown)', outsideDiff: 'GitHub n’accepte les commentaires que sur les lignes du diff.',
      oldSide: 'ancienne', lineComments: 'Commentaires en attente',
      noComments: 'Survolez un numéro de ligne dans un diff et cliquez sur + pour commenter cette ligne.',
      reviewBody: 'Commentaire général (Markdown)',
      events: { COMMENT: 'Commenter', APPROVE: 'Approuver', REQUEST_CHANGES: 'Demander des changements' },
      eventHints: {
        COMMENT: 'Un retour général, sans approbation explicite.',
        APPROVE: 'Donner votre accord pour fusionner ces changements.',
        REQUEST_CHANGES: 'Des points doivent être corrigés avant la fusion.',
      },
      submitAs: { COMMENT: 'Envoyer les commentaires', APPROVE: 'Approuver', REQUEST_CHANGES: 'Demander des changements' },
      ownPr: 'C’est votre propre PR : GitHub refuse que son auteur l’approuve ou demande des changements.',
      headMoved: 'La PR a reçu de nouveaux commits depuis la préparation de la visite. La review vise le commit relu ; ses commentaires peuvent apparaître comme obsolètes.',
      notOpen: 'Cette PR n’est pas ouverte.', sending: 'Envoi…', sent: 'Review envoyée',
      sentText: { COMMENT: 'Vos commentaires sont sur GitHub.', APPROVE: 'Vous avez approuvé la PR.', REQUEST_CHANGES: 'Vous avez demandé des changements.' },
      openOnGitHub: 'Voir sur GitHub', needBody: 'Demander des changements nécessite un commentaire général.', needSomething: 'Écrivez d’abord un commentaire.',
      failed: 'GitHub a refusé la review :', offline: 'Le serveur local ne répond pas. serve tourne-t-il encore ?', done: 'Terminé',
      path: 'Parcours de lecture', readHint: { high: 'à lire ligne à ligne', low: 'survol suffisant' },
      skippedHunks: n => (n === 1 ? '1 modification' : `${n} modifications`),
    },
  };

  // Lucide-style icons (24×24, stroked).
  const ICONS = {
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
    wrap: '<path d="M3 6h18"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><path d="m16 16-2 2 2 2"/><path d="M3 18h7"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
    pr: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>',
    panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    files: '<path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    home: '<path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    commit: '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
    unfold: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    send: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11z"/><path d="m21.85 2.15-10.94 10.94"/>',
    sqPlus: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    sqMinus: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="M8 12h8"/>',
    sqDot: '<rect width="18" height="18" x="3" y="3" rx="3"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
    sqArrow: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="M8 12h8"/><path d="m12 16 4-4-4-4"/>',
  };
  const icon = (name, cls = '') => `<svg class="i${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  // ------------------------------------------------------------- data

  const payload = JSON.parse(document.getElementById('payload').textContent);
  const D = payload.data;
  const T = payload.tour;
  const lang = String(T.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const S = STRINGS[lang];
  document.documentElement.lang = lang;

  const files = D.files;
  const byPath = new Map(files.map(f => [f.path, f]));
  const contents = D.contents || {};
  const baseContents = D.baseContents || {};
  const steps = T.steps;
  const LAST = steps.length + 1; // view 0 is the overview, 1..n the steps, n+1 the wrap-up
  const stepOf = new Map(steps.map((s, i) => [s.id, i + 1]));
  const skipped = new Map((T.skipped || []).filter(s => !s.hunks).map(s => [s.file, s.reason])); // whole files
  const skippedParts = (T.skipped || []).filter(s => s.hunks);
  const coverage = new Map();
  steps.forEach((s, i) => (s.show || []).forEach(c => {
    const list = coverage.get(c.file) || [];
    if (!list.includes(i + 1)) list.push(i + 1);
    coverage.set(c.file, list);
  }));
  const contextPaths = Object.keys(contents).filter(p => !byPath.has(p));
  const totals = files.reduce((t, f) => [t[0] + f.additions, t[1] + f.deletions], [0, 0]);
  const checks = steps.flatMap((s, i) => (s.checks || []).map(text => ({ text, view: i + 1 })));
  const title = T.title || D.title || D.head.ref;
  document.title = `${D.pr ? `#${D.pr.number} ` : ''}${plain(title)} · ${S.app}`;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable: state lasts for this visit */ }
    },
  };
  const REVIEW_KEY = `guided-review:${D.head.sha}`;
  const saved = store.get(REVIEW_KEY, {});
  const viewed = new Set(saved.viewed || []);
  const visited = new Set(saved.visited || []);
  const prefs = store.get('guided-review:prefs', {});
  const savePrefs = () => store.set('guided-review:prefs', prefs);
  const saveReview = () => store.set(REVIEW_KEY, { viewed: [...viewed], visited: [...visited] });
  // Review submission exists only when the page comes from `guided-review.mjs serve` for a pull request.
  const SERVED = location.protocol === 'http:' || location.protocol === 'https:';
  const remote = { enabled: false, status: null };
  const DRAFTS_KEY = `guided-review:drafts:${D.head.sha}`;
  const drafts = store.get(DRAFTS_KEY, []); // {id, path, line, side: 'LEFT' | 'RIGHT', body}
  const reviewBody = { text: store.get(`${DRAFTS_KEY}:body`, '') };
  const saveDrafts = () => {
    store.set(DRAFTS_KEY, drafts);
    store.set(`${DRAFTS_KEY}:body`, reviewBody.text);
  };

  // ------------------------------------------------------------- helpers

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function plain(s) { return String(s ?? '').replace(/`/g, ''); }
  function basename(p) { return p.slice(p.lastIndexOf('/') + 1); }
  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function pathHtml(p) {
    const i = p.lastIndexOf('/');
    return `${i >= 0 ? `<span class="dir"><bdi>${esc(p.slice(0, i + 1))}</bdi></span>` : ''}<span class="base">${esc(p.slice(i + 1))}</span>`;
  }
  const STATUS_ICON = { A: 'sqPlus', D: 'sqMinus', R: 'sqArrow', C: 'sqArrow' };
  function statusIcon(f) {
    if (!f) return `<span class="st st-ctx" title="${esc(S.contextFile)}">${icon('file')}</span>`;
    return `<span class="st st-${esc(f.status)}" title="${esc(S.status[f.status] || f.status)}">${icon(STATUS_ICON[f.status] || 'sqDot')}</span>`;
  }
  function numsHtml(f) { return `<span class="nums"><span class="add">+${f.additions}</span><span class="del">−${f.deletions}</span></span>`; }
  // GitHub-style diffstat: the numbers and five blocks split between additions and deletions.
  function diffstatHtml(f) {
    const total = f.additions + f.deletions;
    const add = total ? Math.round((f.additions / total) * 5) : 0;
    const del = total ? Math.min(5 - add, Math.max(f.deletions ? 1 : 0, Math.round((f.deletions / total) * 5))) : 0;
    const blocks = Array.from({ length: 5 }, (_, i) => `<i class="${i < add ? 'a' : i < add + del ? 'd' : ''}"></i>`).join('');
    return `<span class="dstat">${numsHtml(f)}<span class="blocks" aria-hidden="true">${blocks}</span></span>`;
  }
  function chipHtml(n) { return `<button class="chip" data-act="go" data-view="${n}" title="${esc(S.stepOf(n, steps.length))} · ${esc(plain(steps[n - 1].title))}">${n}</button>`; }
  // How closely to read a step: a muted hint for high and low risk, nothing for medium.
  function readHint(level) { return S.readHint[level] ? `<span class="read-hint">${esc(S.readHint[level])}</span>` : ''; }
  function viewTitle(v) { return v === 0 ? S.intro : v === LAST ? S.end : plain(steps[v - 1].title); }
  function ring(ratio) {
    const c = 2 * Math.PI * 6;
    return `<svg class="ring" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/>
      <circle class="fg" cx="8" cy="8" r="6" stroke-dasharray="${(c * ratio).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 8 8)"/></svg>`;
  }
  const kbd = keys => keys.map(k => `<kbd>${esc(k)}</kbd>`).join('');

  // PR descriptions are GitHub Markdown: drop blocks written by review bots, HTML comments, and tags this renderer
  // cannot show. Returns the text and the number of bot blocks removed.
  function authorText(body) {
    let hidden = 0;
    let text = String(body || '').replace(/\r\n?/g, '\n')
      // <!-- NAME --> … <!-- /NAME -->, as Cursor Bugbot writes them
      .replace(/<!--\s*([A-Za-z][\w:-]*)\s*-->[\s\S]*?<!--\s*\/\1\s*-->/g, () => { hidden++; return ''; })
      // <!-- This is an auto-generated comment… --> … <!-- end of auto-generated comment… -->, as CodeRabbit writes them
      .replace(/<!--\s*This is an auto-generated comment[\s\S]*?<!--\s*end of auto-generated comment[^>]*-->/gi, () => { hidden++; return ''; })
      .replace(/<!--[\s\S]*?-->/g, '');
    let fenced = false;
    text = text.split('\n').map(line => {
      if (/^\s*```/.test(line)) fenced = !fenced;
      if (fenced || /^\s*```/.test(line)) return line;
      return line.split(/(`[^`]*`)/).map((part, k) => (k % 2 ? part : part.replace(/<\/?[a-zA-Z][^>]*>/g, ''))).join('');
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return { text, hidden };
  }

  // ------------------------------------------------------------- markdown (small subset) and badges

  const LIST = /^\s*([-*+]|\d+[.)])\s+/;
  function md(src) {
    if (!src) return '';
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      let m;
      if ((m = line.match(/^\s*```\s*([\w+#.-]*)/))) {
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(`<pre><code>${CM.highlightToHtml(buf.join('\n'), CM.languageFor(m[1]))}</code></pre>`);
      } else if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        const level = Math.min(6, m[1].length + 2);
        out.push(`<h${level}>${inline(m[2])}</h${level}>`);
        i++;
      } else if (LIST.test(line)) {
        const ordered = /^\s*\d/.test(line);
        const items = [];
        while (i < lines.length && LIST.test(lines[i])) {
          let item = lines[i++].replace(LIST, '');
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !LIST.test(lines[i])) item += ' ' + lines[i++].trim();
          items.push(`<li>${inline(item)}</li>`);
        }
        out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      } else if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
        // GitHub alert markers ([!NOTE], [!WARNING]…) are dropped: the quote stays a plain quote.
        if (/^\[!\w+\]$/.test(buf[0].trim())) buf.shift();
        out.push(`<blockquote>${md(buf.join('\n'))}</blockquote>`);
      } else if (!line.trim()) {
        i++;
      } else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^\s*(```|#{1,6}\s|>)/.test(lines[i]) && !LIST.test(lines[i])) buf.push(lines[i++]);
        out.push(`<p>${inline(buf.join('\n'))}</p>`);
      }
    }
    return out.join('');
  }

  function inline(text) {
    return String(text ?? '').split(/(`[^`\n]+`)/).map((part, k) => {
      if (k % 2) return `<code>${esc(part.slice(1, -1))}</code>`;
      return part.split(/(\[\[[^\]]+\]\])/).map((seg, j) => (j % 2 ? badge(seg) : prose(seg))).join('');
    }).join('');
  }

  function prose(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  }

  // [[path]], [[path:12]], [[path:12-30]], [[step:id]], each with an optional |label.
  function badge(seg) {
    const m = seg.match(/^\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]$/);
    if (!m) return esc(seg);
    const target = m[1].trim();
    const label = m[2] && m[2].trim();
    if (target.startsWith('step:')) {
      const n = stepOf.get(target.slice(5).trim());
      if (!n) return esc(seg);
      const text = label || plain(steps[n - 1].title);
      return `<button class="badge step" data-act="go" data-view="${n}" title="${esc(S.stepOf(n, steps.length))}"><span class="bn">${n}</span>${esc(text)}</button>`;
    }
    const r = target.match(/^(.*?)(?::(\d+)(?:-(\d+))?)?$/);
    const path = r[1];
    const a = r[2] ? Number(r[2]) : 0;
    const b = r[3] ? Number(r[3]) : a;
    const f = byPath.get(path);
    const lines = a ? `:${a}${b !== a ? `–${b}` : ''}` : '';
    const cls = f ? `st-${f.status}` : 'ctx';
    return `<button class="badge file ${esc(cls)}" data-act="ref" data-path="${esc(path)}" data-start="${a}" data-end="${b}" title="${esc(path + lines)}">${esc(label || basename(path))}${label ? '' : `<span class="ln">${lines}</span>`}</button>`;
  }

  // ------------------------------------------------------------- file tree

  function buildTree(paths) {
    const root = { name: '', dirs: new Map(), files: [] };
    for (const p of paths) {
      let node = root;
      for (const part of p.split('/').slice(0, -1)) {
        if (!node.dirs.has(part)) node.dirs.set(part, { name: part, dirs: new Map(), files: [] });
        node = node.dirs.get(part);
      }
      node.files.push(p);
    }
    (function compress(node) {
      for (const child of node.dirs.values()) {
        while (!child.files.length && child.dirs.size === 1) {
          const only = child.dirs.values().next().value;
          child.name += '/' + only.name;
          child.dirs = only.dirs;
          child.files = only.files;
        }
        compress(child);
      }
    })(root);
    return root;
  }
  function walkTree(node, visit, depth = 0, prefix = '') {
    [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name)).forEach(dir => {
      const key = prefix + dir.name;
      if (visit({ dir, key, depth }) !== false) walkTree(dir, visit, depth + 1, key + '/');
    });
    node.files.slice().sort((a, b) => basename(a).localeCompare(basename(b))).forEach(path => visit({ path, depth }));
  }
  function treeOrder(paths) {
    const order = [];
    walkTree(buildTree(paths), e => { if (e.path) order.push(e.path); });
    return order;
  }
  const changedOrder = treeOrder(files.map(f => f.path));
  const allOrder = changedOrder.concat(treeOrder(contextPaths));

  // ------------------------------------------------------------- state and routing

  const state = { mode: 'tour', view: 0, file: changedOrder[0], peek: null, focus: null, filter: '' };
  const collapsed = new Set();
  const $top = document.getElementById('top');
  const $side = document.getElementById('side');
  const $main = document.getElementById('main');
  const $left = document.getElementById('left');
  const $right = document.getElementById('right');
  let lastKey = '';

  function readHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    state.peek = null;
    composing = null;
    if (h.startsWith('file=')) {
      state.mode = 'files';
      const p = h.slice(5);
      state.file = byPath.has(p) || p in contents ? p : changedOrder[0];
    } else if (h === 'files') {
      state.mode = 'files';
    } else {
      state.mode = 'tour';
      const n = Number(h.slice(5));
      state.view = h.startsWith('step=') && Number.isInteger(n) && n >= 0 && n <= LAST ? n : 0;
      state.focus = null;
    }
    render();
  }
  function go(hash) {
    if (location.hash === '#' + hash) readHash(); else location.hash = hash;
  }
  const stepHash = n => `step=${n}`;
  const fileHash = p => `file=${encodeURIComponent(p)}`;

  function openRef(path, start, end) {
    const focus = start ? [start, end || start] : null;
    if (state.mode === 'files') {
      state.focus = focus;
      go(fileHash(path));
      return;
    }
    state.peek = { path, focus };
    renderTourRight();
    $right.scrollTop = 0;
  }

  function render() {
    const key = state.mode === 'tour' ? `t${state.view}` : `f${state.file}`;
    const same = key === lastKey;
    const keep = [$left.scrollTop, $right.scrollTop];
    lastKey = key;
    if (state.mode === 'tour' && !visited.has(state.view)) {
      visited.add(state.view);
      saveReview();
    }
    document.body.dataset.mode = state.mode;
    renderHeader();
    renderSide();
    if (state.mode === 'tour') {
      renderTourLeft();
      renderTourRight();
    } else {
      renderFilesRight();
    }
    if (same) {
      $left.scrollTop = keep[0];
      $right.scrollTop = keep[1];
    } else {
      $left.scrollTop = 0;
      $right.scrollTop = 0;
      const sel = $side.querySelector('.sel, .cur');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  }

  // ------------------------------------------------------------- header

  function renderHeader() {
    const pr = D.pr;
    const seen = files.filter(f => viewed.has(f.path)).length;
    const prState = String(pr?.state || 'open').toLowerCase();
    const num = pr ? (pr.url ? `<a class="tb-num" href="${esc(pr.url)}" target="_blank" rel="noopener">#${pr.number}</a>` : `<span class="tb-num">#${pr.number}</span>`) : '';
    $top.innerHTML = `
      <div class="tb-left">
        <button class="ib" data-act="sidebar" title="${esc(S.sidebar)} ( [ )" aria-label="${esc(S.sidebar)}">${icon('panel')}</button>
        <span class="tb-pr pr-${esc(prState)}">${icon('pr')}</span>
        ${D.repoName ? `<span class="tb-repo">${esc(D.repoName)}</span><span class="tb-sep">/</span>` : ''}${num}
        <span class="tb-title" title="${esc(plain(title))}">${inline(title)}</span>
        <span class="tb-branch" title="${esc(`${D.base.ref} ← ${D.head.ref}`)}"><code>${esc(D.base.ref)}</code>${icon('arrowLeft')}<code>${esc(D.head.ref)}</code></span>
      </div>
      <div class="tb-right">
        <span class="tb-stat">${numsHtml({ additions: totals[0], deletions: totals[1] })}</span>
        <span class="tb-progress" title="${esc(S.viewedCount(seen, files.length))}">${ring(files.length ? seen / files.length : 0)}<span>${seen}/${files.length}</span></span>
        <span class="tb-div"></span>
        <button class="ib${prefs.split ? ' on' : ''}" data-act="split" title="${esc(S.split)}" aria-label="${esc(S.split)}" aria-pressed="${!!prefs.split}">${icon('columns')}</button>
        <button class="ib${prefs.wrap ? ' on' : ''}" data-act="wrap" title="${esc(S.wrap)}" aria-label="${esc(S.wrap)}" aria-pressed="${!!prefs.wrap}">${icon('wrap')}</button>
        <button class="ib" data-act="theme" title="${esc(S.theme)}" aria-label="${esc(S.theme)}">${icon('contrast')}</button>
        ${remote.enabled ? `<button class="btn primary sm review-btn" data-act="review">${S.review}${drafts.length ? `<span class="count">${drafts.length}</span>` : ''}${icon('chevronDown')}</button>` : ''}
      </div>`;
  }

  // ------------------------------------------------------------- sidebar: steps or file tree

  function renderSide() {
    if ($side.dataset.mode !== state.mode) {
      $side.dataset.mode = state.mode;
      const tour = state.mode === 'tour';
      $side.innerHTML = `
        <div class="side-tabs" role="tablist">
          <button role="tab" class="tab${tour ? ' on' : ''}" aria-selected="${tour}" data-act="mode" data-mode="tour" title="T · ← → ${esc(S.keys.steps)}">${icon('book')}<span>${S.tour}</span></button>
          <button role="tab" class="tab${tour ? '' : ' on'}" aria-selected="${!tour}" data-act="mode" data-mode="files" title="T · J K ${esc(S.keys.files)} · V ${esc(S.keys.viewed)}">${icon('files')}<span>${S.files}</span><span class="count">${files.length}</span></button>
        </div>
        ${tour ? '' : `<label class="side-search">${icon('search')}<input type="search" placeholder="${esc(S.filter)}" aria-label="${esc(S.filter)}"></label>`}
        <div class="side-body"></div>`;
      const input = $side.querySelector('input[type=search]');
      if (input) {
        input.value = state.filter;
        input.addEventListener('input', () => { state.filter = input.value; renderTree(); });
      }
    }
    if (state.mode === 'tour') renderSteps(); else renderTree();
  }

  function renderSteps() {
    const body = $side.querySelector('.side-body');
    const keep = body.scrollTop;
    const row = (v, mark, label) => `<button class="srow${v === state.view ? ' cur' : ''}" data-act="go" data-view="${v}" ${v === state.view ? 'aria-current="step"' : ''}>
        <span class="mark">${mark}</span><span class="s-title">${label}</span></button>`;
    const out = [row(0, icon('home'), esc(S.intro))];
    steps.forEach((s, i) => out.push(row(i + 1, i + 1, inline(s.title))));
    out.push(row(LAST, icon('flag'), esc(S.end)));
    body.innerHTML = `<div class="steps">${out.join('')}</div>`;
    body.scrollTop = keep;
  }

  function renderTree() {
    const body = $side.querySelector('.side-body');
    const keep = body.scrollTop;
    const q = state.filter.trim().toLowerCase();
    const match = p => !q || p.toLowerCase().includes(q);
    const section = (paths, rootKey) => {
      let out = '';
      walkTree(buildTree(paths.filter(match)), e => {
        if (e.dir) {
          const key = rootKey + e.key;
          const closed = !q && collapsed.has(key);
          out += `<button class="row dir" data-act="dir" data-key="${esc(key)}" style="--d:${e.depth}" aria-expanded="${!closed}">
            ${icon(closed ? 'chevronRight' : 'chevronDown', 'chev')}${icon('folder', 'fold')}<span class="fname">${esc(e.dir.name)}</span></button>`;
          return !closed;
        }
        out += fileRow(e.path, e.depth);
        return true;
      });
      return out;
    };
    const changed = section(files.map(f => f.path), 'c:');
    const context = section(contextPaths, 'x:');
    const seen = files.filter(f => viewed.has(f.path)).length;
    body.innerHTML = `<div class="tree">${changed ? `<div class="tree-sec"><span>${S.changed}</span><span class="muted">${seen}/${files.length}</span></div>${changed}` : ''}
      ${context ? `<div class="tree-sec"><span>${S.contextFiles}</span></div>${context}` : ''}
      ${!changed && !context ? `<p class="empty">${S.noMatch}</p>` : ''}</div>`;
    body.scrollTop = keep;
  }

  function fileRow(p, depth) {
    const f = byPath.get(p);
    const cls = `row file${p === state.file ? ' sel' : ''}${viewed.has(p) ? ' seen' : ''}`;
    return `<div class="${cls}" style="--d:${depth}">
      <button class="name" data-act="file" data-path="${esc(p)}" title="${esc(p)}">${statusIcon(f)}<span class="fname">${esc(basename(p))}</span></button>
      ${f ? `<input type="checkbox" data-viewed="${esc(p)}" ${viewed.has(p) ? 'checked' : ''} title="${esc(S.viewed)}" aria-label="${esc(S.viewed)}">` : ''}</div>`;
  }

  // ------------------------------------------------------------- tour: explanation (left)

  function renderTourLeft() {
    const v = state.view;
    const body = v === 0 ? introHtml() : v === LAST ? endHtml() : stepHtml(v);
    $left.innerHTML = `<article class="doc">${body}</article>${navHtml(v)}`;
  }

  function introHtml() {
    const pr = D.pr;
    const kicker = pr
      ? `${icon('pr')}<span>PR #${pr.number}</span><span class="sep">·</span><span>${S.by} <b>${esc(pr.author || '?')}</b></span>`
      : `${icon('commit')}<span>${esc(D.head.sha.slice(0, 8))}</span>`;
    const author = authorText(pr && pr.body);
    const body = author.text || author.hidden
      ? `<details class="fold author"><summary>${icon('chevronRight', 'chev')}${S.description}${pr.author ? `<span class="muted">${esc(pr.author)}</span>` : ''}</summary>
        <div class="md">${md(author.text)}${author.hidden ? `<p class="bot-note">${esc(S.botHidden(author.hidden))}</p>` : ''}</div></details>` : '';
    return `<header class="doc-head"><div class="kicker">${kicker}</div><h1>${inline(title)}</h1></header>
      <div class="md lead">${md(T.summary)}</div>
      <section class="sec"><h3>${S.path}</h3>${readingPathHtml()}</section>
      ${body}`;
  }

  // The reading path follows the flow: each step lists, under its title, the places of the flow it explains.
  // Flow places no step explains show as plain context rows where they fall.
  function readingPathHtml() {
    const row = (n, places) => `<li><button data-act="go" data-view="${n}"><span class="n">${n}</span><span class="p-main">
      <span class="p-title">${inline(steps[n - 1].title)}${readHint(steps[n - 1].risk)}</span>
      ${places.length ? `<span class="p-where">${places.map(p => inline(p.label)).join(' <span class="arrow">→</span> ')}</span>` : ''}</span></button></li>`;
    const done = new Set();
    const out = [];
    for (const node of T.flow || []) {
      const n = node.step ? stepOf.get(node.step) : 0;
      if (!n) out.push(`<li class="ctx"><span class="n"></span><span class="p-where">${inline(node.label)}</span></li>`);
      else if (!done.has(n)) {
        done.add(n);
        out.push(row(n, T.flow.filter(x => x.step === node.step)));
      }
    }
    steps.forEach((s, i) => { if (!done.has(i + 1)) out.push(row(i + 1, [])); });
    return `<ol class="path-list">${out.join('')}</ol>`;
  }

  function checkList(list) {
    return `<ul class="checks">${list.map(c => `<li>${inline(c.text)}</li>`).join('')}</ul>`;
  }

  function stepHtml(v) {
    const s = steps[v - 1];
    const own = checks.filter(c => c.view === v);
    return `<header class="doc-head"><div class="kicker"><span>${S.stepOf(v, steps.length)}</span>${readHint(s.risk)}</div>
        <h1>${inline(s.title)}</h1></header>
      ${s.link ? `<p class="link-line">${inline(s.link)}</p>` : ''}
      <div class="md">${md(s.body)}</div>
      ${own.length ? `<section class="sec"><h3>${S.check}</h3>${checkList(own)}</section>` : ''}`;
  }

  function endHtml() {
    const groups = steps.map((s, i) => {
      const own = checks.filter(c => c.view === i + 1);
      return own.length ? `<div class="check-group"><h4>${chipHtml(i + 1)}<span>${inline(s.title)}</span></h4>${checkList(own)}</div>` : '';
    }).join('');
    const skipRows = [...[...skipped].map(([p, why]) => `<li>${badge(`[[${p}]]`)}<span>${inline(why)}</span></li>`),
      ...skippedParts.map(x => `<li>${badge(`[[${x.file}]]`)}<span class="muted">${esc(S.skippedHunks(x.hunks.length))}</span><span>${inline(x.reason)}</span></li>`)];
    const skips = skipRows.length ? `<section class="sec"><h3>${S.skipped}</h3><ul class="skips">${skipRows.join('')}</ul></section>` : '';
    return `<header class="doc-head"><div class="kicker">${icon('flag')}<span>${S.end}</span></div><h1>${S.endTitle}</h1></header>
      <div class="md"><p>${esc(S.endText(steps.length))}</p></div>
      ${checks.length ? `<section class="sec"><h3>${S.check}</h3>${groups}</section>` : `<p class="muted">${S.noChecks}</p>`}
      ${skips}`;
  }

  function navHtml(v) {
    const dots = [];
    for (let i = 0; i <= LAST; i++) {
      const cls = i === v ? 'cur' : visited.has(i) ? 'done' : '';
      dots.push(`<button class="${cls}" data-act="go" data-view="${i}" title="${esc(viewTitle(i))}" aria-label="${esc(viewTitle(i))}"></button>`);
    }
    const prev = v > 0
      ? `<button class="btn icon-only" data-act="go" data-view="${v - 1}" title="${esc(S.prev)} · ${esc(viewTitle(v - 1))} (←)" aria-label="${esc(S.prev)}">${icon('arrowLeft')}</button>`
      : '<span class="btn-ghost"></span>';
    const next = v < LAST
      ? `<button class="btn primary next" data-act="go" data-view="${v + 1}" title="→"><span class="nn"><small>${v === 0 ? S.start : S.next}</small><span>${esc(viewTitle(v + 1))}</span></span>${icon('arrowRight')}</button>`
      : `<button class="btn primary next" data-act="mode" data-mode="files"><span class="nn"><small>${S.next}</small><span>${S.switchFiles}</span></span>${icon('arrowRight')}</button>`;
    return `<nav class="doc-nav">${prev}<span class="dots">${dots.join('')}</span>${next}</nav>`;
  }

  // ------------------------------------------------------------- tour: code (right)

  function renderTourRight() {
    clearEditors();
    $right.innerHTML = '';
    if (state.peek) {
      const { path, focus } = state.peek;
      const wrap = el('div', 'peek');
      wrap.append(el('div', 'peek-bar', `${icon('eye')}<b>${S.preview}</b><span class="path">${pathHtml(path)}</span>
        <button class="btn sm" data-act="close-peek" title="Esc">${icon('arrowLeft')}${S.back}</button>`));
      const cards = el('div', 'cards');
      cards.append(card({ file: path, lines: focus, all: true }, { full: true }));
      wrap.append(cards);
      $right.append(wrap);
      return;
    }
    const v = state.view;
    if (v === 0) return $right.append(overview());
    if (v === LAST) return $right.append(overview());
    const cards = el('div', 'cards');
    const show = steps[v - 1].show || [];
    show.forEach((spec, i) => {
      const node = card(spec);
      node.id = `card-${i}`;
      cards.append(node);
    });
    if (!show.length) cards.append(notice(S.noCode));
    $right.append(cards);
  }

  function overview() {
    const node = el('div', 'overview');
    const seen = files.filter(f => viewed.has(f.path)).length;
    const rows = changedOrder.map(p => {
      const f = byPath.get(p);
      const cov = coverage.get(p) || [];
      const skip = !cov.length && skipped.has(p) ? `<span class="skip" title="${esc(skipped.get(p))}">${S.skippedShort}</span>` : '';
      return `<li><input type="checkbox" data-viewed="${esc(p)}" ${viewed.has(p) ? 'checked' : ''} title="${esc(S.viewed)}" aria-label="${esc(S.viewed)}">
        ${statusIcon(f)}<button class="link path" data-act="ref" data-path="${esc(p)}" data-start="0" data-end="0" title="${esc(p)}">${pathHtml(p)}</button>
        <span class="chips">${cov.map(chipHtml).join('')}${skip}</span>${diffstatHtml(f)}</li>`;
    }).join('');
    const commits = D.commits.map(c => `<li>${icon('commit')}<span class="subj">${esc(c.subject)}</span>
      <span class="who">${esc(c.author)} · ${esc(new Date(c.date).toLocaleDateString(lang, { day: 'numeric', month: 'short' }))}</span><code>${esc(c.sha.slice(0, 7))}</code></li>`).join('');
    node.innerHTML = `
      <div class="stat-row">
        <div><span>${S.changed}</span><b>${files.length}</b></div>
        <div><span>${S.added}</span><b class="add">+${totals[0]}</b></div>
        <div><span>${S.removed}</span><b class="del">−${totals[1]}</b></div>
        <div><span>${S.commits}</span><b>${D.commits.length}</b></div>
      </div>
      <section class="panel"><header class="panel-head"><span>${S.changed}</span><span class="muted" data-seen>${esc(S.viewedCount(seen, files.length))}</span></header>
        <ul class="flist">${rows}</ul></section>
      ${commits ? `<section class="panel"><header class="panel-head"><span>${S.commits}</span><span class="muted">${D.commits.length}</span></header><ol class="commits">${commits}</ol></section>` : ''}`;
    return node;
  }

  // ------------------------------------------------------------- code card (CodeMirror)

  const live = new Set(); // editors mounted on the right pane, destroyed before it re-renders
  function clearEditors() { closeNote(); notes.clear(); live.forEach(e => e.destroy()); live.clear(); }
  function track(bag, editor) { bag.add(editor); live.add(editor); return editor; }
  function* liveViews() {
    for (const e of live) {
      if (e.a && e.b) { yield e.a; yield e.b; } else yield e;
    }
  }

  function normalize(text) {
    const t = String(text).replace(/\r\n?/g, '\n');
    return t.endsWith('\n') ? t.slice(0, -1) : t;
  }
  // Head-side and base-side text of a file, or null when not embedded (binary or too large).
  function headText(path) {
    const f = byPath.get(path);
    if (f && f.status === 'D') return '';
    return typeof contents[path] === 'string' ? normalize(contents[path]) : null;
  }
  function baseText(f) {
    if (f.status === 'A') return '';
    return typeof baseContents[f.path] === 'string' ? normalize(baseContents[f.path]) : null;
  }
  function addedLines(f) {
    const added = [];
    f.hunks.forEach(h => h.lines.forEach(l => { if (l[0] === '+') added.push(l[2]); }));
    return added;
  }

  function span(hunk, side) {
    const start = side === 'new' ? hunk.newStart : hunk.oldStart;
    const count = side === 'new' ? hunk.newLines : hunk.oldLines;
    return count > 0 ? [start, start + count - 1] : [start + 1, start];
  }
  function touches(hunk, side, range) {
    const [a, b] = span(hunk, side);
    return a <= range[1] && Math.max(a, b) >= range[0];
  }

  // Line classes for a document showing file lines start..start+length-1, as [[docLine, classes]].
  function marksFor({ start = 1, length, focus, added, all }) {
    const map = new Map();
    const put = (n, cls) => {
      const d = n - start + 1;
      if (d >= 1 && d <= length) map.set(d, map.has(d) ? `${map.get(d)} ${cls}` : cls);
    };
    if (all) for (let n = start; n < start + length; n++) put(n, all);
    if (added) added.forEach(n => put(n, 'cm-gr-added'));
    if (focus) for (let n = focus[0]; n <= focus[1]; n++) put(n, 'cm-gr-focus');
    return [...map].sort((a, b) => a[0] - b[0]);
  }
  const lineDecos = new Map();
  // A note the tour attaches to a range of lines. The code stays intact: the lines get a thin bar, and a numbered pin
  // at the end of the first one opens the note in a floating bubble.
  const notes = new Map(); // pin id -> markdown text
  let noteSeq = 0;
  class NotePin extends CM.WidgetType {
    constructor(id, n) {
      super();
      this.id = id;
      this.n = n;
    }
    eq(other) { return other.id === this.id; }
    toDOM() {
      const pin = el('button', 'cm-gr-pin', String(this.n));
      pin.dataset.act = 'note';
      pin.dataset.note = this.id;
      pin.setAttribute('aria-label', plain(notes.get(this.id)));
      pin.addEventListener('mouseenter', () => markNoteLines(pin, true));
      pin.addEventListener('mouseleave', () => { if (openNote?.pin !== pin) markNoteLines(pin, false); });
      return pin;
    }
    ignoreEvent() { return true; }
  }
  // highlights: [{ a, b, text }] in file lines; start is the file line of the editor's first line.
  function highlightField(highlights, start) {
    const build = state => {
      const doc = state.doc;
      const ranges = [];
      highlights.forEach((h, k) => {
        const a = Math.max(1, h.a - start + 1);
        const b = Math.min(doc.lines, h.b - start + 1);
        if (a > b) return;
        const id = `n${++noteSeq}`;
        notes.set(id, h.text);
        for (let n = a; n <= b; n++) ranges.push(CM.Decoration.line({ class: 'cm-gr-hl', attributes: { 'data-hl': id } }).range(doc.line(n).from));
        ranges.push(CM.Decoration.widget({ widget: new NotePin(id, k + 1), side: 1 }).range(doc.line(a).to));
      });
      return CM.Decoration.set(ranges, true);
    };
    return CM.StateField.define({ create: build, update: value => value, provide: field => CM.EditorView.decorations.from(field) });
  }
  function markNoteLines(pin, on) {
    pin.closest('.cm-editor')?.querySelectorAll(`[data-hl="${pin.dataset.note}"]`).forEach(line => line.classList.toggle('on', on));
  }
  let openNote = null; // { pin, pop }
  function closeNote() {
    if (!openNote) return false;
    markNoteLines(openNote.pin, false);
    openNote.pin.classList.remove('on');
    openNote.pop.remove();
    openNote = null;
    return true;
  }
  function toggleNote(pin) {
    const same = openNote?.pin === pin;
    closeNote();
    if (same) return;
    const pop = el('div', 'note-pop', `<div class="md">${md(notes.get(pin.dataset.note))}</div>`);
    document.body.append(pop);
    // The bubble opens right of the pin, in the empty space after the line; without room there, right under the pin.
    const r = pin.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const side = r.right + 12 + w < window.innerWidth - 12;
    if (side) {
      pop.style.left = `${r.right + 12}px`;
      pop.style.top = `${Math.max(12, Math.min(r.top + r.height / 2 - 18, window.innerHeight - h - 12))}px`;
      pop.style.setProperty('--tip', `${r.top + r.height / 2 - pop.getBoundingClientRect().top}px`);
    } else {
      pop.style.left = `${Math.max(12, Math.min(r.left - 14, window.innerWidth - w - 12))}px`;
      pop.style.top = `${r.bottom + 8}px`;
      pop.style.setProperty('--tip', `${r.left + r.width / 2 - pop.getBoundingClientRect().left}px`);
    }
    pop.classList.add(side ? 'right' : 'below');
    pin.classList.add('on');
    markNoteLines(pin, true);
    openNote = { pin, pop };
  }

  function lineMarks(marks) {
    return CM.EditorView.decorations.of(view => {
      const builder = new CM.RangeSetBuilder();
      const doc = view.state.doc;
      for (const [n, cls] of marks) {
        if (n > doc.lines) break;
        if (!lineDecos.has(cls)) lineDecos.set(cls, CM.Decoration.line({ class: cls }));
        const from = doc.line(n).from;
        builder.add(from, from, lineDecos.get(cls));
      }
      return builder.finish();
    });
  }

  // Line numbers that accept a comment get a class, so only they show the + on hover.
  class CanComment extends CM.GutterMarker {
    constructor() {
      super();
      this.elementClass = 'cm-gr-can';
    }
  }
  const canComment = new CanComment();
  function commentableGutter(lines, start) {
    return CM.gutterLineClass.compute([], st => {
      const builder = new CM.RangeSetBuilder();
      for (let n = 1; n <= st.doc.lines; n++) {
        if (lines.has(n + start - 1)) {
          const from = st.doc.line(n).from;
          builder.add(from, from, canComment);
        }
      }
      return builder.finish();
    });
  }

  // side: the diff side these lines belong to ('LEFT' old, 'RIGHT' new), which makes them commentable.
  // An excerpt of a single-file component that starts inside <script> or <style> lacks the opening tag, so the
  // component's language would read it as markup: it gets the language of the block it starts in instead.
  const SFC = /\.(vue|svelte|html?)$/i;
  function languageAt(path, start, side) {
    const f = byPath.get(path);
    const text = start > 1 && SFC.test(path) ? (side === 'LEFT' && f ? baseText(f) : headText(path)) : null;
    if (!text) return CM.languageFor(path);
    let block = null;
    for (const line of text.split('\n').slice(0, start - 1)) {
      const open = line.match(/^\s*<(script|style)\b([^>]*)>/i);
      if (open && !new RegExp(`</${open[1]}\\s*>`, 'i').test(line)) {
        const lang = open[2].match(/\blang\s*=\s*["']?([\w-]+)/i);
        block = lang ? lang[1] : open[1].toLowerCase() === 'script' ? 'js' : 'css';
      } else if (/^\s*<\/(script|style)\s*>/i.test(line)) block = null;
    }
    return CM.languageFor(block || path);
  }

  function extensions(path, { start = 1, marks = [], side = null, highlights = [] } = {}) {
    const commenting = remote.enabled && side && byPath.has(path);
    const gutter = { formatNumber: n => String(n + start - 1) };
    if (commenting) {
      gutter.domEventHandlers = {
        mousedown(view, block) {
          openComposer({ path, side, line: view.state.doc.lineAt(block.from).number + start - 1 });
          return true;
        },
      };
    }
    const ext = [
      CM.EditorState.readOnly.of(true),
      CM.EditorView.editable.of(false),
      CM.lineNumbers(gutter),
      CM.syntaxHighlighting(CM.highlighter),
      CM.syntaxHighlighting(CM.classHighlighter),
      CM.EditorState.phrases.of(S.phrases),
    ];
    const language = languageAt(path, start, side);
    if (language) ext.push(language);
    if (prefs.wrap) ext.push(CM.EditorView.lineWrapping);
    if (marks.length) ext.push(lineMarks(marks));
    if (highlights.length) ext.push(highlightField(highlights, start));
    if (commenting) {
      ext.push(
        CM.EditorView.editorAttributes.of({ class: 'cm-gr-commentable' }),
        commentableGutter(commentable.get(path)[side], start),
        commentField(path, side, start),
      );
    }
    return ext;
  }

  // ------------------------------------------------------------- line comments (drafts and composer)

  let composing = null; // the line being commented: {path, side, line, id?, body?}
  const refreshComments = CM.StateEffect.define();
  const who = () => remote.status?.viewer || '';

  // Comment widgets stick to the left edge of the visible code, just after the line numbers.
  function stickAfterGutter(view, node) {
    setTimeout(() => {
      const gutter = view.dom.querySelector('.cm-gutters');
      if (gutter) node.style.setProperty('--gr-gutter', `${gutter.offsetWidth + 10}px`);
    }, 0);
    return node;
  }

  class CommentWidget extends CM.WidgetType {
    constructor(draft) {
      super();
      this.draft = draft;
    }
    eq(other) { return other.draft.id === this.draft.id && other.draft.body === this.draft.body; }
    toDOM(view) {
      const d = this.draft;
      const name = who();
      return stickAfterGutter(view, el('div', 'cm-gr-comment', `<div class="cmt-head">
          ${name ? `<span class="avatar">${esc(name.slice(0, 1).toUpperCase())}</span><b>${esc(name)}</b>` : ''}
          <span class="pill">${esc(S.pending)}</span><span class="spacer"></span>
          <button class="ib xs" data-act="edit-draft" data-id="${esc(d.id)}" title="${esc(S.edit)}" aria-label="${esc(S.edit)}">${icon('pencil')}</button>
          <button class="ib xs" data-act="delete-draft" data-id="${esc(d.id)}" title="${esc(S.remove)}" aria-label="${esc(S.remove)}">${icon('trash')}</button></div>
        <div class="md">${md(d.body)}</div>`));
    }
    ignoreEvent() { return true; }
  }

  class ComposerWidget extends CM.WidgetType {
    constructor(target) {
      super();
      this.target = target;
    }
    eq(other) { return other.target === this.target; }
    toDOM(view) {
      const t = this.target;
      const box = el('div', 'cm-gr-composer', `<div class="cmt-head">${icon('message')}<span>${esc(S.commentOn(t.line, t.side === 'LEFT'))}</span></div>
        <textarea rows="3" placeholder="${esc(S.commentPlaceholder)}"></textarea>
        <div class="cmt-acts"><span class="hint">${kbd(['⌘', '↵'])}</span><span class="spacer"></span>
          <button class="btn sm" data-c="cancel">${esc(S.cancel)}</button>
          <button class="btn sm primary" data-c="save">${esc(t.id ? S.save : S.addComment)}</button></div>`);
      const area = box.querySelector('textarea');
      area.value = t.body || '';
      area.addEventListener('input', () => { t.body = area.value; });
      area.addEventListener('mouseup', () => view.requestMeasure());
      area.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.stopPropagation(); closeComposer(); } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveComposer(); }
      });
      box.addEventListener('click', e => {
        const c = e.target.closest('[data-c]')?.dataset.c;
        if (c === 'save') saveComposer(); else if (c === 'cancel') closeComposer();
      });
      setTimeout(() => area.focus({ preventScroll: true }), 0);
      return stickAfterGutter(view, box);
    }
    ignoreEvent() { return true; }
  }

  // Draft comments of this file and side, and the open composer, shown under their line.
  // Block widgets must come from a state field; refreshComments rebuilds it after a draft changes.
  function commentField(path, side, start) {
    const build = st => {
      const doc = st.doc;
      const items = drafts
        .filter(d => d.path === path && d.side === side && !(composing && composing.id === d.id))
        .map(d => [d.line, 0, new CommentWidget(d)]);
      if (composing && composing.path === path && composing.side === side) items.push([composing.line, 1, new ComposerWidget(composing)]);
      const builder = new CM.RangeSetBuilder();
      items.map(([line, order, widget]) => [line - start + 1, order, widget])
        .filter(([n]) => n >= 1 && n <= doc.lines)
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
        .forEach(([n, , widget]) => {
          const end = doc.line(n).to;
          builder.add(end, end, CM.Decoration.widget({ widget, block: true, side: 1 }));
        });
      return builder.finish();
    };
    return CM.StateField.define({
      create: build,
      update: (value, tr) => (tr.effects.some(e => e.is(refreshComments)) ? build(tr.state) : value),
      provide: field => CM.EditorView.decorations.from(field),
    });
  }

  function refreshAllComments() {
    for (const view of liveViews()) view.dispatch({ effects: refreshComments.of(null) });
  }

  // target: {path, side, line} for a new comment, or a copy of a draft to edit.
  function openComposer(target) {
    if (!commentable.get(target.path)?.[target.side].has(target.line)) return toast(S.outsideDiff);
    if (composing && !composing.id && composing.body?.trim() && !(target.path === composing.path && target.line === composing.line)) {
      return document.querySelector('.cm-gr-composer textarea')?.focus();
    }
    composing = target;
    refreshAllComments();
  }
  function closeComposer() {
    if (!composing) return;
    composing = null;
    refreshAllComments();
  }
  function saveComposer() {
    const t = composing;
    const text = (t.body || '').trim();
    composing = null;
    if (text) {
      const existing = t.id && drafts.find(d => d.id === t.id);
      if (existing) existing.body = text;
      else drafts.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, path: t.path, side: t.side, line: t.line, body: text });
      saveDrafts();
      renderHeader();
    }
    refreshAllComments();
  }

  // ------------------------------------------------------------- code card

  function plainEditor(parent, bag, path, doc, opts) {
    const view = new CM.EditorView({ parent, state: CM.EditorState.create({ doc, extensions: extensions(path, opts) }) });
    return track(bag, view);
  }

  // CodeMirror marks every character of a line added or removed whole as changed text, which drowns the line in
  // the darker word color. Like GitHub, word highlights stay only on lines that were partly edited.
  const REWRITTEN = 0.5; // share of a line's visible characters above which the line counts as rewritten
  const rewrittenLine = CM.Decoration.line({ class: 'cm-gr-whole' });
  function rewrittenLines(state, { chunks, side }) {
    const isA = side === 'a';
    const doc = state.doc;
    const builder = new CM.RangeSetBuilder();
    for (const ch of chunks) {
      const from = isA ? ch.fromA : ch.fromB;
      const to = Math.min(isA ? ch.toA : ch.toB, doc.length);
      const ranges = ch.changes.map(c => (isA ? [from + c.fromA, from + c.toA] : [from + c.fromB, from + c.toB]));
      for (let pos = from; pos < to;) {
        const line = doc.lineAt(pos);
        let all = 0;
        let hit = 0;
        for (let i = 0; i < line.length; i++) {
          if (/\s/.test(line.text[i])) continue;
          all++;
          if (ranges.some(([a, b]) => line.from + i >= a && line.from + i < b)) hit++;
        }
        if (all && hit / all > REWRITTEN) builder.add(line.from, line.from, rewrittenLine);
        pos = line.to + 1;
      }
    }
    return builder.finish();
  }
  // Deleted lines of the unified view are widgets drawn by CodeMirror: they are marked in the DOM instead.
  function markRewrittenDeletions(view) {
    view.contentDOM.querySelectorAll('.cm-deletedLine:not([data-gr])').forEach(line => {
      line.dataset.gr = '';
      const count = node => node.textContent.replace(/\s/g, '').length;
      const all = count(line);
      const hit = [...line.querySelectorAll('.cm-deletedText')].reduce((n, span) => n + count(span), 0);
      if (all && hit / all > REWRITTEN) line.classList.add('cm-gr-whole');
    });
  }
  const wordHighlights = CM.ViewPlugin.fromClass(class {
    constructor(view) {
      this.chunks = null;
      this.decorations = CM.Decoration.none;
      this.refresh(view, view.state);
    }
    update(u) { this.refresh(u.view, u.state); }
    refresh(view, st) {
      const info = CM.getChunks(st);
      if (info && info.chunks !== this.chunks) {
        this.chunks = info.chunks;
        this.decorations = rewrittenLines(st, info);
      }
      view.requestMeasure({ key: this, read() {}, write() { markRewrittenDeletions(view); } });
    }
  }, { decorations: plugin => plugin.decorations });

  // A unified or side-by-side diff, per the reader's preference. Returns the editor showing the head side.
  function diffEditor(parent, bag, path, before, after, { startOld = 1, startNew = 1, marks = [], collapse = false, highlights = [] }) {
    const collapseUnchanged = collapse ? { margin: 3, minSize: 6 } : undefined;
    if (prefs.split) {
      const merge = new CM.MergeView({
        parent, highlightChanges: true, gutter: true, collapseUnchanged,
        a: { doc: before, extensions: [extensions(path, { start: startOld, side: 'LEFT' }), wordHighlights] },
        b: { doc: after, extensions: [extensions(path, { start: startNew, marks, side: 'RIGHT', highlights }), wordHighlights] },
      });
      track(bag, merge);
      return merge.b;
    }
    const view = new CM.EditorView({
      parent,
      state: CM.EditorState.create({
        doc: after,
        extensions: [
          extensions(path, { start: startNew, marks, side: 'RIGHT', highlights }),
          CM.unifiedMergeView({ original: before, mergeControls: false, highlightChanges: true, gutter: true, collapseUnchanged }),
          wordHighlights,
        ],
      }),
    });
    return track(bag, view);
  }

  // Centers a line of the editor in its pane. CodeMirror's scrollIntoView renders the line but does not move
  // the pane around an auto-height editor, so the pane is scrolled from the line's position in the height map.
  function reveal(view, docLine) {
    setTimeout(() => {
      if (!view.dom.isConnected) return;
      const line = view.state.doc.line(Math.min(Math.max(1, docLine), view.state.doc.lines));
      view.dispatch({ effects: CM.EditorView.scrollIntoView(line.from, { y: 'center' }) });
      const block = view.lineBlockAt(line.from);
      const y = view.documentTop + block.top + block.height / 2;
      const pane = view.dom.closest('.pane');
      if (pane && pane.scrollHeight > pane.clientHeight) {
        pane.scrollTop += y - (pane.getBoundingClientRect().top + pane.clientHeight / 2);
      } else {
        window.scrollBy(0, y - window.innerHeight / 2);
      }
    }, 30);
  }

  function notice(text) { return el('div', 'notice', `${icon('info')}<span>${esc(text)}</span>`); }
  function moreBar(label, onClick) {
    const btn = el('button', 'more-bar', `${icon('unfold')}<span>${esc(label)}</span>`);
    btn.addEventListener('click', onClick);
    return btn;
  }
  function holder(body) { const node = el('div', 'cm-holder'); body.append(node); return node; }

  // spec: {file, lines?: [a, b], hunks?: [i], view?: 'diff' | 'file', note?, all?: show every hunk and only focus the lines}
  // opts.full: preview or files view, where the whole file is shown and the focused lines scrolled into view.
  // opts.inFiles: the files view, which has no "open in files view" button.
  function card(spec, opts = {}) {
    const path = spec.file;
    const f = byPath.get(path);
    const range = spec.lines || null;
    const highlights = (spec.highlights || []).map(h => ({ a: h.lines[0], b: h.lines[1], text: h.text }));
    const side = f && f.status === 'D' ? 'old' : 'new';
    const canDiff = !!f;
    const canFile = headText(path) != null && !(f && f.status === 'D');
    let view = spec.view || (canDiff ? 'diff' : 'file');
    if (!spec.view && canDiff && canFile && range && !f.hunks.some(h => touches(h, side, range))) view = 'file';
    let showAll = !!spec.all || (!spec.hunks && !range);
    let wholeFile = !!opts.full;
    let forced = false;
    const bag = new Set();

    const node = el('article', 'card');
    node.dataset.path = path;
    const head = el('header', 'card-head');
    const renamed = f && f.oldPath !== f.path ? `<span class="from">${S.renamedFrom} ${esc(f.oldPath)}</span>` : '';
    head.innerHTML = `<button class="ib xs fold-btn" data-act="collapse" title="${esc(S.collapse)}" aria-label="${esc(S.collapse)}">${icon('chevronDown')}</button>
      ${statusIcon(f)}<span class="path" title="${esc(path)}">${pathHtml(path)}${renamed}</span>
      ${f ? diffstatHtml(f) : ''}<span class="spacer"></span>`;
    if (canDiff && canFile) {
      const seg = el('span', 'seg');
      seg.innerHTML = `<button data-v="diff">${S.diff}</button><button data-v="file">${S.file}</button>`;
      const sync = () => seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
      seg.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.dataset.v === view) return;
        view = b.dataset.v;
        sync();
        draw();
      });
      sync();
      head.append(seg);
    }
    if (f) {
      head.append(el('label', 'viewed-toggle', `<input type="checkbox" data-viewed="${esc(path)}" ${viewed.has(path) ? 'checked' : ''}><span>${S.viewed}</span>`));
    }
    if (!opts.inFiles) {
      head.append(el('button', 'ib xs', icon('external')));
      Object.assign(head.lastChild.dataset, { act: 'file', path });
      head.lastChild.title = S.openFiles;
      head.lastChild.setAttribute('aria-label', S.openFiles);
    }
    node.append(head);
    if (spec.note) node.append(el('div', 'card-note', `${icon('info')}<div class="md">${md(spec.note)}</div>`));
    const body = el('div', 'card-body');
    node.append(body);

    function draw() {
      bag.forEach(e => { e.destroy(); live.delete(e); });
      bag.clear();
      body.innerHTML = '';
      if (view === 'file') return fileBlock(body, bag, path, f, range, wholeFile, () => { wholeFile = true; draw(); }, highlights);
      if (f.binary) return body.append(notice(S.binary));
      if (!f.hunks.length) return body.append(notice(S.noText));
      if (f.large && !forced) {
        const box = notice(S.large(f.additions + f.deletions));
        const btn = el('button', 'btn sm', S.renderAnyway);
        btn.addEventListener('click', () => { forced = true; draw(); });
        box.append(btn);
        return body.append(box);
      }
      diffBlock(body, bag, f, spec, range, showAll, !!opts.full, () => { showAll = true; draw(); }, highlights);
    }
    draw();
    return node;
  }

  function fileBlock(body, bag, path, f, range, whole, onWhole, highlights = []) {
    const text = headText(path);
    if (text == null || (f && f.status === 'D')) return body.append(notice(S.unavailable));
    const total = text.split('\n').length;
    let a = 1;
    let b = total;
    if (range && !whole) {
      a = Math.max(1, range[0] - PAD);
      b = Math.min(total, range[1] + PAD);
    }
    if (a > 1) body.append(moreBar(S.wholeFile(total), onWhole));
    const doc = a === 1 && b === total ? text : text.split('\n').slice(a - 1, b).join('\n');
    const marks = marksFor({ start: a, length: b - a + 1, focus: range, added: f ? addedLines(f) : null });
    const editor = plainEditor(holder(body), bag, path, doc, { start: a, marks, side: 'RIGHT', highlights });
    if (b < total) body.append(moreBar(S.wholeFile(total), onWhole));
    if (range && whole) reveal(editor, range[0]);
  }

  // The old and new text of consecutive hunks, from the full files when known, else from the hunk itself.
  function excerpt(f, group, before, after) {
    const hunks = group.map(i => f.hunks[i]);
    const first = (h, k) => { const l = h.lines.find(x => x[k] != null); return l ? l[k] : null; };
    const last = (h, k) => { for (let j = h.lines.length - 1; j >= 0; j--) if (h.lines[j][k] != null) return h.lines[j][k]; return null; };
    const startOld = first(hunks[0], 1) ?? hunks[0].oldStart + 1;
    const startNew = first(hunks[0], 2) ?? hunks[0].newStart + 1;
    if (before != null && after != null) {
      const endOld = last(hunks[hunks.length - 1], 1) ?? startOld - 1;
      const endNew = last(hunks[hunks.length - 1], 2) ?? startNew - 1;
      return {
        before: before.split('\n').slice(startOld - 1, endOld).join('\n'),
        after: after.split('\n').slice(startNew - 1, endNew).join('\n'),
        startOld, startNew,
      };
    }
    const h = hunks[0];
    return {
      before: h.lines.filter(l => l[0] !== '+').map(l => l[3]).join('\n'),
      after: h.lines.filter(l => l[0] !== '-').map(l => l[3]).join('\n'),
      startOld, startNew,
    };
  }

  function diffBlock(body, bag, f, spec, range, showAll, full, onShowAll, highlights = []) {
    const before = baseText(f);
    const after = headText(f.path);
    const whole = before != null && after != null;
    if (f.status === 'A' || f.status === 'D') {
      // One side is empty: a plain editor reads better than a diff against nothing.
      const text = (f.status === 'A' ? after : before) ?? f.hunks.flatMap(h => h.lines.map(l => l[3])).join('\n');
      const all = f.status === 'A' ? 'cm-gr-added' : 'cm-gr-deleted';
      const side = f.status === 'A' ? 'RIGHT' : 'LEFT';
      const lines = text.split('\n');
      if (range && !showAll && !full) {
        // A range on a new or deleted file shows that excerpt, like a file view, not the whole file from line 1.
        const a = Math.max(1, range[0] - PAD);
        const b = Math.min(lines.length, range[1] + PAD);
        if (a > 1) body.append(moreBar(S.wholeFile(lines.length), onShowAll));
        const marks = marksFor({ start: a, length: b - a + 1, focus: range, all });
        plainEditor(holder(body), bag, f.path, lines.slice(a - 1, b).join('\n'), { start: a, marks, side, highlights });
        if (b < lines.length) body.append(moreBar(S.wholeFile(lines.length), onShowAll));
        return;
      }
      const marks = marksFor({ length: lines.length, focus: range, all });
      const editor = plainEditor(holder(body), bag, f.path, text, { marks, side, highlights });
      if (range) reveal(editor, range[0]);
      return;
    }
    let shown;
    if (showAll) shown = f.hunks.map((_, i) => i);
    else if (spec.hunks) shown = [...new Set(spec.hunks)].sort((a, b) => a - b);
    else {
      shown = f.hunks.map((_, i) => i).filter(i => touches(f.hunks[i], 'new', range));
      if (!shown.length) return fileBlock(body, bag, f.path, f, range, full, onShowAll, highlights);
    }
    if (showAll && whole) {
      const marks = marksFor({ length: after.split('\n').length, focus: range });
      const editor = diffEditor(holder(body), bag, f.path, before, after, { marks, collapse: !(full && range), highlights });
      if (range && full) reveal(editor, range[0]);
      return;
    }
    // Consecutive hunks share one editor when both files are known; otherwise each hunk gets its own.
    const groups = [];
    for (const i of shown) {
      const g = groups[groups.length - 1];
      if (whole && g && g[g.length - 1] === i - 1) g.push(i); else groups.push([i]);
    }
    let prev = -1;
    for (const group of groups) {
      const hidden = group[0] - prev - 1;
      if (hidden > 0) body.append(moreBar(S.hiddenChanges(hidden), onShowAll));
      const part = excerpt(f, group, whole ? before : null, whole ? after : null);
      const marks = marksFor({ start: part.startNew, length: part.after.split('\n').length, focus: range });
      diffEditor(holder(body), bag, f.path, part.before, part.after, { startOld: part.startOld, startNew: part.startNew, marks, collapse: group.length > 1, highlights });
      prev = group[group.length - 1];
    }
    const remaining = f.hunks.length - 1 - prev;
    if (remaining > 0) body.append(moreBar(S.hiddenChanges(remaining), onShowAll));
  }

  // ------------------------------------------------------------- files view

  function renderFilesRight() {
    clearEditors();
    $right.innerHTML = '';
    const p = state.file;
    if (!p) return $right.append(el('p', 'empty', esc(S.noMatch)));
    const f = byPath.get(p);
    const cov = coverage.get(p) || [];
    let info;
    if (cov.length) info = `<span>${S.explainedIn}</span>${cov.map(n => badge(`[[step:${steps[n - 1].id}]]`)).join('')}`;
    else if (skipped.has(p)) info = `<span class="tag">${S.skippedShort}</span><span>${inline(skipped.get(p))}</span>`;
    else info = `<span>${f ? S.notExplained : S.contextFile}</span>`;
    const i = allOrder.indexOf(p);
    const prev = allOrder[i - 1];
    const next = allOrder[i + 1];
    const navBtn = (target, name, label, key) => (target
      ? `<button class="ib sm" data-act="file" data-path="${esc(target)}" title="${esc(label)} · ${esc(basename(target))} (${key})" aria-label="${esc(label)}">${icon(name)}</button>`
      : `<button class="ib sm" disabled aria-label="${esc(label)}">${icon(name)}</button>`);
    $right.append(el('div', 'file-bar', `<div class="fb-info">${info}</div>
      <div class="fb-nav"><span class="muted">${i + 1} / ${allOrder.length}</span>${navBtn(prev, 'chevronUp', S.prevFile, 'K')}${navBtn(next, 'chevronDown', S.nextFile, 'J')}</div>`));
    const cards = el('div', 'cards');
    cards.append(card({ file: p, lines: state.focus, all: true }, { inFiles: true, full: true }));
    if (next) {
      cards.append(el('button', 'next-file', `<span class="nn"><small>${S.nextFile}</small><span class="path">${pathHtml(next)}</span></span>${icon('arrowRight')}`));
      Object.assign(cards.lastChild.dataset, { act: 'file', path: next });
    }
    $right.append(cards);
  }

  function moveFile(delta) {
    const i = allOrder.indexOf(state.file);
    const next = allOrder[Math.min(allOrder.length - 1, Math.max(0, i + delta))];
    if (next && next !== state.file) { state.focus = null; go(fileHash(next)); }
  }

  function toggleViewed(path, on) {
    if (on) viewed.add(path); else viewed.delete(path);
    saveReview();
    renderHeader();
    document.querySelectorAll('input[data-viewed]').forEach(i => { if (i.dataset.viewed === path) i.checked = on; });
    document.querySelectorAll('.card').forEach(c => { if (c.dataset.path === path) c.classList.toggle('collapsed', on); });
    const seen = files.filter(f => viewed.has(f.path)).length;
    document.querySelectorAll('[data-seen]').forEach(n => { n.textContent = S.viewedCount(seen, files.length); });
    if (state.mode === 'files') renderTree();
  }

  // ------------------------------------------------------------- review submission

  const commentable = new Map(files.map(f => {
    const sides = { LEFT: new Set(), RIGHT: new Set() };
    f.hunks.forEach(h => h.lines.forEach(([, o, n]) => {
      if (o != null) sides.LEFT.add(o);
      if (n != null) sides.RIGHT.add(n);
    }));
    return [f.path, sides];
  }));

  function toast(text, kind = '') {
    document.querySelector('.toast')?.remove();
    const node = el('div', `toast ${kind}`, `${icon(kind === 'ok' ? 'check' : 'info')}<span>${esc(text)}</span>`);
    document.body.append(node);
    setTimeout(() => node.remove(), 3200);
  }

  function openReviewDialog() {
    const st = remote.status;
    const own = !!(st.viewer && st.author && st.viewer === st.author);
    const warnings = [
      st.currentHead && st.currentHead !== st.reviewedHead ? S.headMoved : null,
      st.state && st.state !== 'OPEN' ? S.notOpen : null,
    ].filter(Boolean);
    const list = drafts.length
      ? `<ul class="draft-list">${drafts.map(d => `<li>
          <button class="draft-loc" data-act="ref" data-path="${esc(d.path)}" data-start="${d.line}" data-end="${d.line}" title="${esc(d.path)}:${d.line}">${esc(basename(d.path))}:${d.line}${d.side === 'LEFT' ? ` <span class="muted">(${esc(S.oldSide)})</span>` : ''}</button>
          <span class="draft-text">${esc(d.body)}</span>
          <button class="ib xs" data-act="delete-draft" data-id="${esc(d.id)}" title="${esc(S.remove)}" aria-label="${esc(S.remove)}">${icon('trash')}</button></li>`).join('')}</ul>`
      : `<p class="empty-note">${esc(S.noComments)}</p>`;
    const events = Object.keys(S.events).map((key, i) => `<label class="ev ev-${key.toLowerCase().replace('_', '-')}">
        <input type="radio" name="event" value="${key}" ${i === 0 ? 'checked' : ''}><span class="ev-dot"></span>
        <span class="ev-text"><b>${esc(S.events[key])}</b><small>${esc(S.eventHints[key])}</small></span></label>`).join('');
    document.querySelector('dialog.review-pop')?.remove();
    const dialog = el('dialog', 'review-pop', `<form method="dialog">
      <header class="pop-head"><h2>${esc(S.finish)}</h2>${D.pr ? `<span class="muted">#${D.pr.number}</span>` : ''}<span class="spacer"></span>
        <button class="ib xs" value="cancel" title="${esc(S.close)}" aria-label="${esc(S.close)}">${icon('x')}</button></header>
      ${warnings.map(w => `<p class="note warn">${icon('alert')}<span>${esc(w)}</span></p>`).join('')}
      <textarea name="body" rows="4" placeholder="${esc(S.reviewBody)}"></textarea>
      <div class="events">${events}</div>
      <p class="note warn own" hidden>${icon('alert')}<span>${esc(S.ownPr)}</span></p>
      <div class="pending"><div class="pending-head"><span>${esc(S.lineComments)}</span><span class="count">${drafts.length}</span></div>${list}</div>
      <p class="note error" hidden></p>
      <footer class="pop-foot"><span class="hint">${kbd(['⌘', '↵'])}</span><span class="spacer"></span>
        <button class="btn sm" value="cancel">${esc(S.cancel)}</button>
        <button class="btn sm primary" type="submit" value="send"></button></footer></form>`);
    const form = dialog.querySelector('form');
    const area = form.elements.body;
    const error = dialog.querySelector('.error');
    const send = dialog.querySelector('button[value="send"]');
    const ownNote = dialog.querySelector('.note.own');
    area.value = reviewBody.text;
    const sync = () => {
      const event = form.elements.event.value;
      send.textContent = S.submitAs[event];
      send.className = `btn sm primary${event === 'APPROVE' ? ' green' : event === 'REQUEST_CHANGES' ? ' danger' : ''}`;
      ownNote.hidden = !(own && event !== 'COMMENT');
      error.hidden = true;
    };
    sync();
    form.addEventListener('change', sync);
    area.addEventListener('input', () => { reviewBody.text = area.value; saveDrafts(); });
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); form.requestSubmit(send); } });
    const fail = text => { error.hidden = false; error.innerHTML = `${icon('alert')}<span>${esc(text)}</span>`; };
    form.addEventListener('submit', async e => {
      if (e.submitter?.value !== 'send') return;
      e.preventDefault();
      const event = form.elements.event.value;
      const body = area.value.trim();
      if (event === 'REQUEST_CHANGES' && !body) return fail(S.needBody);
      if (event === 'COMMENT' && !body && !drafts.length) return fail(S.needSomething);
      send.disabled = true;
      send.textContent = S.sending;
      try {
        const res = await fetch('api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, body, comments: drafts.map(({ path, line, side, body: text }) => ({ path, line, side, body: text })) }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(`${S.failed} ${out.error}`);
        drafts.length = 0;
        reviewBody.text = '';
        saveDrafts();
        form.innerHTML = `<div class="sent ev-${event.toLowerCase().replace('_', '-')}"><span class="sent-icon">${icon('check')}</span>
          <h2>${esc(S.sent)}</h2><p>${esc(S.sentText[event])}</p>
          <div class="sent-acts"><a class="btn sm" href="${esc(out.url)}" target="_blank" rel="noopener noreferrer">${esc(S.openOnGitHub)}${icon('external')}</a>
          <button class="btn sm primary" value="cancel">${esc(S.done)}</button></div></div>`;
        render();
      } catch (err) {
        fail(err instanceof TypeError ? S.offline : err.message);
        send.disabled = false;
        sync();
        error.hidden = false;
      }
    });
    dialog.addEventListener('close', () => dialog.remove());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    document.body.append(dialog);
    dialog.showModal();
    area.focus();
  }

  function startReview() {
    if (!SERVED) return;
    fetch('api/status').then(res => res.json()).then(st => {
      remote.status = st;
      remote.enabled = !!st.review;
      if (remote.enabled) render();
    }).catch(() => { /* opened without the server: read-only */ });
    setInterval(() => fetch('api/ping').catch(() => {}), 60 * 1000);
  }

  // ------------------------------------------------------------- events

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (openNote && !e.target.closest('.note-pop') && t?.dataset.act !== 'note') closeNote();
    if (!t) return;
    if (t.dataset.act === 'note') return toggleNote(t);
    const act = t.dataset.act;
    if (act === 'ref' || act === 'go' || act === 'file') document.querySelector('dialog.review-pop')?.close();
    if (act === 'go') { state.focus = null; go(stepHash(Number(t.dataset.view))); }
    else if (act === 'ref') openRef(t.dataset.path, Number(t.dataset.start), Number(t.dataset.end));
    else if (act === 'file') { state.focus = null; go(fileHash(t.dataset.path)); }
    else if (act === 'mode') setMode(t.dataset.mode);
    else if (act === 'close-peek') { state.peek = null; renderTourRight(); }
    else if (act === 'collapse') t.closest('.card').classList.toggle('collapsed');
    else if (act === 'dir') {
      const key = t.dataset.key;
      if (collapsed.has(key)) collapsed.delete(key); else collapsed.add(key);
      renderTree();
    } else if (act === 'theme') toggleTheme();
    else if (act === 'sidebar') toggleSidebar();
    else if (act === 'review') openReviewDialog();
    else if (act === 'edit-draft' || act === 'delete-draft') {
      const i = drafts.findIndex(d => d.id === t.dataset.id);
      if (i < 0) return;
      if (act === 'edit-draft') return openComposer({ ...drafts[i] });
      drafts.splice(i, 1);
      saveDrafts();
      renderHeader();
      refreshAllComments();
      if (document.querySelector('dialog.review-pop')) openReviewDialog();
    } else if (act === 'wrap' || act === 'split') {
      prefs[act] = !prefs[act];
      savePrefs();
      render();
    }
  });

  // A floating note belongs to where its pin was: scrolling or resizing closes it.
  document.addEventListener('scroll', () => closeNote(), true);
  window.addEventListener('resize', () => closeNote());

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.viewed) toggleViewed(t.dataset.viewed, t.checked);
  });

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]')) return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
    const k = e.key;
    if (k === 't') setMode(state.mode === 'tour' ? 'files' : 'tour');
    else if (k === '[') toggleSidebar();
    else if (k === 'Escape' && closeNote()) { /* closed the open note */ }
    else if (k === 'Escape' && composing) closeComposer();
    else if (k === 'Escape' && state.peek) { state.peek = null; renderTourRight(); }
    else if (state.mode === 'tour' && (k === 'ArrowRight' || k === 'ArrowLeft')) {
      const v = state.view + (k === 'ArrowRight' ? 1 : -1);
      if (v >= 0 && v <= LAST) { e.preventDefault(); go(stepHash(v)); }
    } else if (state.mode === 'files' && (k === 'j' || k === 'k')) moveFile(k === 'j' ? 1 : -1);
    else if (state.mode === 'files' && k === 'v' && byPath.has(state.file)) toggleViewed(state.file, !viewed.has(state.file));
  });

  function setMode(mode) {
    if (mode === state.mode) return;
    state.focus = null;
    go(mode === 'files' ? fileHash(state.file || allOrder[0]) : stepHash(state.view));
  }

  function applyPrefs() {
    if (prefs.theme) document.documentElement.dataset.theme = prefs.theme;
    else delete document.documentElement.dataset.theme;
    // Without a saved choice, the sidebar starts hidden on narrow windows.
    const side = prefs.side ?? window.innerWidth >= 1100;
    document.body.classList.toggle('no-side', !side);
  }
  function toggleTheme() {
    const current = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    prefs.theme = current === 'dark' ? 'light' : 'dark';
    savePrefs();
    applyPrefs();
  }
  function toggleSidebar() {
    prefs.side = document.body.classList.contains('no-side');
    savePrefs();
    applyPrefs();
  }

  const splitter = document.getElementById('splitter');
  splitter.addEventListener('pointerdown', e => {
    splitter.setPointerCapture(e.pointerId);
    splitter.classList.add('drag');
    const box = $main.getBoundingClientRect();
    const move = ev => {
      prefs.left = Math.min(70, Math.max(22, ((ev.clientX - box.left) / box.width) * 100));
      $main.style.setProperty('--left', `${prefs.left}%`);
    };
    const up = () => {
      splitter.classList.remove('drag');
      splitter.removeEventListener('pointermove', move);
      splitter.removeEventListener('pointerup', up);
      savePrefs();
    };
    splitter.addEventListener('pointermove', move);
    splitter.addEventListener('pointerup', up);
  });

  // ------------------------------------------------------------- start

  // Comment widgets size themselves on the visible width of the code pane.
  new ResizeObserver(() => $right.style.setProperty('--pane-w', `${$right.clientWidth}px`)).observe($right);
  applyPrefs();
  if (prefs.left) $main.style.setProperty('--left', `${prefs.left}%`);
  window.addEventListener('hashchange', readHash);
  readHash();
  startReview();
})();
