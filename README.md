# leogpt

A personal, harness-agnostic Agent Skill that implements features, fixes bugs, and writes plans with the rigor of [pstack](https://github.com/cursor/plugins/tree/main/pstack), in a minimal form. It runs in Claude Code, Cursor, Delta, opencode, and Zed, and degrades gracefully anywhere else.

Its core idea comes from pstack: **the main agent is a lead, not a typist.** It decides, synthesizes, and verifies. Subagents explore, design, write code, verify, and review, and each returns a short report. The main context stays small, so long tasks stay sharp.

This README is the design document. It records every decision and why, so the skill can be reviewed against it.

## Install

The skill lives in `leogpt/`. During iteration, symlink it so edits apply everywhere at once:

```bash
ln -s ~/Documents/dev/skills/leogpt ~/.agents/skills/leogpt    # Zed, opencode, Cursor, Delta (personal skills share this folder)
ln -s ~/.agents/skills/leogpt ~/.claude/skills/leogpt          # Claude Code
```

Once pushed to GitHub, `npx skills add <owner>/skills -g` installs it for every agent.

## Usage

```
/leogpt add a CSV export to the invoices list
/leogpt https://github.com/org/repo/issues/123
/leogpt the dashboard total is off by one cent on some invoices
/leogpt plan the migration of invoices to the new numbering
/leogpt how does invoice numbering work?
/leogpt review this branch
/leogpt grill my idea: cache VAT rates per organisation
/leogpt setup
/leogpt from now on, open PRs as drafts in this repo
```

## How it works

### Start of every run

1. Identify the harness from the tool list and load `references/harness/<harness>.md`.
2. Read memory (`~/.agents/memory/leogpt.md`).
3. First run on this harness without a models setup: ask once "setup now / later / never".
4. Fetch the input (free text, GitHub issue via `gh`, Notion page via MCP).
5. Route to a playbook. Apply the **clarity gate**: a request that does not state the expected behavior or the scope, or has two plausible readings, gets grilled; a ticket that states both runs autonomously. The gate leans toward deciding alone.

### Routes

| Request | Runs |
|---|---|
| Feature | `playbooks/feature.md` |
| Bugfix | `playbooks/bugfix.md` |
| Plan | `playbooks/plan.md` |
| Setup | `playbooks/setup.md` |
| How does X work | `bricks/how.md` |
| Review | `bricks/interrogate.md` |
| Grill an idea | `bricks/grill.md`, then stop |
| Lasting preference ("from now on") | `references/memory.md`, confirm, stop |

### Flows

Legend: 🧠 lead (main thread) · 🤖 subagent · 🤖×N parallel subagents · 👤 user.

```
FEATURE
 🧠 check the tree → 🧠/👤 clarity gate (grill if needed)
 🤖×2-4 how: explorers → 🧠 mental model (<= 20 lines)
 architect: arena of 2 designs (🤖×2 + 🤖 judge) or 🤖 designer → 🧠 sketch → 🤖 reviewer challenges it
 🧠 branch → 🤖 implementer  |  arena of implementations in worktrees (🤖×2 + 🤖 judge → 🧠 graft)
 🤖 verifier (fresh, never sees implementer reasoning) → fail: counterexamples back, max 3 rounds
 🤖×1-2 interrogate once (1 if diff <= 700 lines) → 🧠 synthesis → fixes → verify again, same round counter
 🧠 ship (PR / draft PR / stop) → 🧠 final reply

BUGFIX
 🧠 check the tree → clarity gate → how → 🧠 branch
 🤖 reproduce (failing test committed first, or a script; verbatim output) — no repro, no fix
 🧠 hypotheses → 🤖×N one per hypothesis → eliminate → 🧠 confirm mechanism
 🤖 smallest fix the evidence justifies (architect if it crosses a boundary)
 🤖 verify: same repro now passes
 review → ship → reply

PLAN
 clarity gate (grill very likely) → how → architect arena
 🧠 vertical slices, one PR each, each with its verification
 save per plan.destination → stop

SETUP
 list available models → fetch Artificial Analysis data → propose one model per tier (`smart`, `code`, `fast`) and the arena lists
 👤 confirm per tier and arena role (+ review threshold) → write memory (+ native config: opencode agents, Cursor rule, Zed setting)
```

**Stuck** (verification still failing after the max rounds, or a bug that won't reproduce): stop, no PR, report what was tried, where it blocks, and what remains.

### Bricks

| Brick | Role |
|---|---|
| `grill` | Rounds of questions through the harness's choice UI, each with a recommendation. The agent looks facts up itself and asks only for decisions. Caps per round and per flow |
| `how` | Parallel read-only explorers, then one synthesized mental model |
| `architect` | Types, signatures, and module boundaries with empty bodies. Arena of designs, or one designer; then a fresh reviewer challenges the pick |
| `arena` | Frame a rubric → N candidates on distinct models → judge → pick a base → graft the best ideas → verify |
| `interrogate` | Adversarial review. Angles: blast radius, simplicity and comments, domain and tests. Synthesis of consensus and single-reviewer findings |
| `verify` | Fresh subagent. Tests, lint, and typecheck on the smallest useful scope, plus a real run when cheap. Verbatim output. Explicit "unverified: …" when impossible |
| `ship` | Branch rules, the repo's commit and PR conventions (or Conventional Commits by default), then the `finish` mode |

### Principles

20 principles in two tiers, as in pstack. `SKILL.md` holds a one-line index (when it applies, and the rule). Each principle has a file of about 25 lines in `principles/`, read only when it applies. The lead names the relevant files in every subagent brief, so the context cost stays low.

### Memory

`~/.agents/memory/leogpt.md` sits outside every repo. It has a `global` section and `repo: <owner>/<name>` sections, which override the global one. The user updates it in natural language, and the agent confirms in one line. The schema and defaults are in `leogpt/references/memory.md`.

| Key | Default |
|---|---|
| `plan.destination` | `none` (options: `repo:<path>`, `home`, `github-issue`) |
| `finish` | `pr` (options: `draft-pr`, `stop`) |
| `arena.design`, `arena.implementation` | `auto` (option: `never`) |
| `arena.candidates` | `2` |
| `review.single-reviewer-max-diff` | `700` |
| `grill.max-rounds` / `grill.max-questions` | feature and bugfix `3` / `4`, plan `5` / `8`, grill route `5` / `4` |
| `verify.max-rounds` | `3` |
| `setup.<harness>` | unset (ask), `later`, `never`, `done <date>` |
| `models.<harness>` | unset |

### Models

Each role gets a tier. The rule is **the best quality for the price, biased toward intelligence**, never simply the most expensive model.

| Role | Rule |
|---|---|
| `smart`: designer, judge, reviewer, design-arena candidates | Cheapest model with an intelligence index at least 90 % of the best available |
| `code`: implementer, verifier, implementation-arena candidates | Best coding-index-per-dollar among models at least 75 % of the best coding index |
| `fast`: explorer | Fastest model at least 50 % of the best coding index, then cheapest |
| arena | The top 2 for the role, from different vendors when possible |

Resolution order: repo memory > global memory > harness-native config > the agent's own judgment with the same rules.

**Arena gate.** A standard arena needs at least 2 distinct selectable models. With a single model, the design arena still runs (same model, one distinct angle per candidate), but the implementation arena is skipped. With none, every arena is skipped and the agent says so.

Setup uses the [Artificial Analysis](https://artificialanalysis.ai/) API when `ARTIFICIAL_ANALYSIS_API_KEY` is set, and otherwise its public leaderboard page. Attribution is required by their terms.

### Harness support

| | Claude Code | Cursor | Delta | opencode | Zed | generic |
|---|---|---|---|---|---|---|
| Subagents | `Agent` | `Task` | Worker / Scout / Reviewer profiles | `subagent` | `spawn_agent` | sequential fallback |
| Model per tier | per call (`model`) | per call (`model`) | per profile (Settings) | per agent file | one `subagent_model` | no |
| Arena | ✅ | ✅ | ✅ design; implementation with ≥ 2 selectable profile models | ✅ design; implementation with ≥ 2 agent files on distinct models | design only, same model | design with subagents; implementation also needs ≥ 2 selectable models |
| Choice UI | `AskUserQuestion` | `AskQuestion` | text | `question` | text | text |
| Worktrees | `isolation: "worktree"` | manual `git worktree` | managed isolated copies | manual | manual | manual |
| Setup writes | memory | memory + `~/.cursor/rules/leogpt-models.mdc` | memory + profile models / `<id>.toml` | memory + `~/.config/opencode/agents/leogpt-*.md` | memory + `agent.subagent_model` | memory |

Each harness file answers the same 7 questions in the same order: spawn, model, list models, questions, isolation, native config, limits.

## Files

| Path | Role | Status |
|---|---|---|
| `leogpt/SKILL.md` | Router, lead rules, principles index | ✅ |
| `leogpt/references/memory.md` | Memory schema, defaults, model resolution, arena gate | ✅ |
| `leogpt/references/subagent-brief.md` | Delegation template and return format | ✅ |
| `leogpt/references/harness/*.md` | Claude Code, Cursor, Delta, opencode, Zed, generic | ✅ |
| `leogpt/playbooks/feature.md` | Feature flow | ✅ |
| `leogpt/playbooks/bugfix.md` | Bugfix flow | ✅ |
| `leogpt/playbooks/plan.md` | Plan flow and plan template | ✅ |
| `leogpt/playbooks/setup.md` | Model setup and tier rules | ✅ |
| `leogpt/bricks/*.md` | grill, how, architect, arena, interrogate, verify, ship | ✅ |
| `leogpt/principles/*.md` | 20 principle files | ✅ |

## Design decisions

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Entry point | One skill, `/leogpt`, with a router | Separate `/feature`, `/bugfix`, `/plan`: generic names clash with built-in commands |
| Packaging | Bricks and principles as files inside one skill | Separate skills: more to install, and a crowded skill list |
| Origin | Written from scratch, including grilling | Reusing repo or public skills: it would tie the suite to one repo or one author |
| Size | 80 lines max per file; details loaded on demand | Large files: they cost context on every run |
| Autonomy | No human stop by default, until the PR opens | Checkpoints before implementation: the grill already covers the risky case, a vague request |
| Grilling | Only when the request is vague or ambiguous; capped; biased to decide alone | Always grilling: too slow for detailed tickets |
| Arena | Design, always, even on one model with distinct angles: two 60-line designs are cheap. Implementation, only with ≥ 2 distinct models and a `major` open choice (public surface or data flow) | Same-model implementation arena: two full implementations for little diversity. pstack's mandatory arena on any open choice: too expensive by default |
| Review | 1 reviewer ≤ 700 changed lines, 2 above | pstack's 3 models every time: too expensive |
| Verification | A fresh verifier; tests plus a cheap real run; explicit "unverified" | Tests only: pstack's `prove-it-works` requires the real artifact |
| Stuck | Stop without a PR and report | Draft PR marked unverified: contradicts `prove-it-works` |
| Models | Setup proposes, the user confirms, memory stores | Live API calls every run: adds latency, needs a key, needs web access |
| Memory | One file outside the repos, global plus per-repo | In the skill repo: preferences would get committed |

### From pstack: kept, merged, dropped

- **Kept as bricks:** `how`, `architect`, `arena`, `interrogate`.
- **Merged:**
  - `why` becomes one line in `how`.
  - `blast-radius` and `no-comments` (with its `comment-sicko` agent) become angles of `interrogate`.
  - `tdd` becomes the repro step of bugfix.
  - `unslop` and `technical-writing` become lines in `ship`.
  - `setup-pstack` becomes `playbooks/setup.md`.
  - `show-me-your-work` becomes the decisions section of the final reply.
- **Dropped:**
  - `poteto-mode` and `poteto-agent`: replaced by the router.
  - `teach`, `recall`, `bro`, `swarm`, `figure-it-out`, `automate-me`, `make-bot-ui`, `typescript-best-practices`: out of scope.
  - Verification-skill generators and `reflect`: maybe later.
- **Principles dropped:** `outcome-oriented-execution` (long migrations only), `separate-before-serializing-shared-state` (reduced to "one worktree per arena candidate"), `encode-lessons-in-structure` (meta).

## Review guide

1. Check file sizes (80 lines max per skill file) and that every referenced path exists.
2. Read `leogpt/SKILL.md` as the agent would, then follow one route end to end. Every step must name either a file that exists or a concrete action.
3. Check every delegation against `references/subagent-brief.md`: role, scope, principles to read, success criteria, short return.
4. Check each harness file for the same 7 sections, and that none relies on a tool another harness file says is missing.
5. Look for contradictions with the Design decisions table above.
6. Run it on a real task in a sandbox branch: a detailed ticket should run with no questions; a bare prompt should grill.

## Credits

Flow and principles adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto (Lauren Tan). Model data from [Artificial Analysis](https://artificialanalysis.ai/).
