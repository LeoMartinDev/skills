# leogpt

A personal Agent Skill for serious engineering work: build a feature, fix a bug, write a plan, explain code, review a diff, or challenge an idea. It runs in Claude Code, Cursor, Delta, omp, opencode, and Zed, and degrades gracefully anywhere else.

**The one idea: the main agent is a lead, not a typist.** It decides, synthesizes, and verifies. Subagents read the code, write it, verify it, and review it, and each hands back a short report. The main context stays small, so long tasks stay sharp.

```text
You:  /leogpt <request>
  │
  ▼
Lead (main thread)        decides, synthesizes, verifies
  │
  │  sends a brief to each subagent, gets back a short report
  ▼
Subagents                 explorers · designers · implementer · verifier · reviewers
  │
  ▼
You:  a PR, with every decision and its evidence
```

---

## Install

The skill lives in `leogpt/`. Symlink it so edits apply everywhere at once:

```bash
ln -s ~/Documents/dev/skills/leogpt ~/.agents/skills/leogpt   # Zed, opencode, Cursor, Delta, omp
ln -s ~/.agents/skills/leogpt ~/.claude/skills/leogpt         # Claude Code
```

Or install it from GitHub for every agent: `npx skills add LeoMartinDev/skills -g`.

Then run `/leogpt setup` once per harness to pick the models (optional, the skill asks on first run).

## Usage

Type `/leogpt` followed by what you want (`/skill:leogpt` in omp). The input can be free text, a GitHub issue URL, or a Notion page.

| You type | What happens |
|---|---|
| `/leogpt add a CSV export to the invoices list` | **Feature**: design, implement, verify, review, open a PR |
| `/leogpt https://github.com/org/repo/issues/123` | The issue is fetched (with its parent and linked issues), then routed |
| `/leogpt the dashboard total is off by one cent` | **Bugfix**: reproduce, find the root cause, fix, prove it, open a PR |
| `/leogpt plan the migration to the new numbering` | **Plan**: a checklist of small PRs, saved for later |
| `/leogpt implement slice 2 of plans/numbering.md` | Runs one slice of a saved plan as a feature |
| `/leogpt how does invoice numbering work?` | **How**: an explanation with `path:line` references |
| `/leogpt review this branch` | **Review**: an adversarial verdict, nothing applied |
| `/leogpt grill my idea: cache VAT rates per org` | **Grill**: tough questions on your idea, then a recap |
| `/leogpt setup` | **Setup**: pick one model per tier for this harness |
| `/leogpt from now on, open PRs as drafts here` | **Memory**: stores the preference, confirms, stops |

By default a run goes **all the way to an open PR without stopping**. It only asks you something when the request is vague, when a choice is truly yours (product, scope, a public API change), or when it is stuck.

---

## How a run goes

Every diagram reads top to bottom. The text on the right says what can branch off.

### Every run starts the same way

```text
1. Identify the harness     from the tool list, load references/harness/<harness>.md
   │
   ▼
2. Read memory              ~/.agents/memory/leogpt.md
   │
   ▼
3. First run here?          ask once: setup now / later / never
   │
   ▼
4. Fetch the input          text, GitHub issue (+ parent and linked issues), Notion page
   │
   ▼
5. Route
      new or changed behavior ......... Feature
      a slice of a saved plan ......... Feature
      wrong behavior today ............ Bugfix
      plan, spec, break down .......... Plan
      setup, models ................... Setup
      how does X work? ................ explain, stop
      review a PR or diff ............. verdict, stop
      grill my idea ................... questions + recap, stop
      "from now on…" .................. save to memory, stop
```

Feature, bugfix, and plan pass a **clarity gate** first. The request gets grilled only when it does not state the expected behavior, leaves the scope open, or has two readings that lead to different code. A ticket that states behavior and scope runs with no questions.

### Feature

```text
1. Check the tree           unrelated uncommitted changes → stop
   │
   ▼
2. Clarify                  vague request → grill you (a few questions)
   │
   ▼
3. Ground                   explorers map the code → a mental model + acceptance criteria
   │
   ▼
4. Design                   a sketch: types, signatures, boundaries; a reviewer challenges it
   │                        changes a public API or stored data → ask you once
   │                        too big for one PR → switch to Plan
   ▼
5. Branch
   │
   ▼
6. Implement                one implementer, small checked commits
   │                        (2 competing implementations when a major choice is open)
   ▼
7. Verify + review          see the loop below
   │
   ▼
8. Ship                     PR, draft PR, or stop, per memory
   │
   ▼
9. Final reply              decisions, evidence, what stays unverified, models used
```

### Verify + review loop

Used by Feature and Bugfix.

```text
Implementer's commits
   │
   ▼
Size check                  over 735 changed lines → no PR, switch to Plan
   │
   ▼
Verifier + 2 reviewers      in parallel, on the same commit, review runs once
   │
   ▼
All green? ─── yes ───▶ Ship
   │
   │ no
   ▼
Implementer fixes           every failure and accepted finding, in one batch
   │                        each batch costs 1 round (max 3)
   ▼
Verifier re-checks          the fix only, then back to "All green?"

Out of rounds → ship the last commit that passed, listing what stays unapplied.
No commit ever passed → stop without a PR and report (stuck).
```

The verifier checks, in order: lint and typecheck, the tests, a **real run** through the entry point a user drives, then 1 to 3 edge cases of its own. What it cannot run is reported as `unverified: <what> because <why>`.

### Bugfix

**No repro, no fix.**

```text
1. Check the tree
   │
   ▼
2. Clarify                  observed behavior, expected behavior, where
   │
   ▼
3. Ground                   explorers map the symptom's code path
   │
   ▼
4. Branch
   │
   ▼
5. Reproduce                a failing test (committed) or a script
   │                        still no repro after trying → stop, report (stuck)
   ▼
6. Find the root cause      2-4 hypotheses, one subagent each, in parallel
   │                        → one mechanism survives
   ▼
7. Fix                      the smallest change the evidence justifies
   │
   ▼
8. Verify + review          the original repro must now pass
   │                        2 fixes on the same hypothesis failed → back to 6
   ▼
9. Ship + reply             what broke, root cause, fix, repro before/after
```

### Plan

The lead writes the plan, not the code.

```text
1. Size                     fits one PR with an obvious approach → say so, offer Feature, stop
   │
   ▼
2. Clarify                  grill you (almost always)
   │
   ▼
3. Ground                   explorers map the code, conventions, test commands
   │
   ▼
4. Design                   the target shape
   │
   ▼
5. Slice                    one PR per slice, riskiest first, each verifiable on its own
   │
   ▼
6. Write + save             chat, repo file, ~/.agents/plans, or a GitHub issue
   │
   ▼
7. Stop                     then run a slice: /leogpt implement slice <n> of <plan>
```

A slice runs through Feature as a clear ticket: no questions unless the code contradicts the plan.

### Setup

```text
1. List the harness's models
   │
   ▼
2. Fetch benchmarks         Artificial Analysis: intelligence, coding, price, speed
   │
   ▼
3. Pick one model per tier  smart · code · fast (rules below)
   │
   ▼
4. You confirm each pick
   │
   ▼
5. Write memory             + the harness's native config, if it has one
```

---

## Building blocks

Playbooks are assembled from **bricks**, each a file in `leogpt/bricks/`.

| Brick | What it does | Talks to you? |
|---|---|---|
| `grill` | Maps the request as a tree of decisions and asks the open ones in rounds, each with a recommended answer. Looks facts up itself; asks only for decisions. Capped per round and per flow. | ✅ the only one |
| `how` | 1 to 4 explorers in parallel, one per angle (data model, runtime flow, entry points, tests). The lead merges their digests into one mental model. | |
| `architect` | Types, signatures, and module boundaries with empty bodies. An arena of designs or one designer, a screen against common design smells, then a fresh reviewer challenges the pick. | |
| `arena` | N candidates on distinct models attempt the same task. A judge scores them against a hidden rubric. The lead picks a base and grafts the best ideas of the others. | |
| `interrogate` | Adversarial review by 2 reviewers on distinct models. Every finding needs a concrete failure scenario. The lead checks each blocker itself. | |
| `verify` | A fresh verifier that never sees the implementer's reasoning. Verbatim evidence or an explicit `unverified:`. | |
| `ship` | Branch rules, the repo's commit and PR conventions (Conventional Commits by default), then `finish`. Never merges. | |

**Arena**: 2 candidates on different models attempt the same task, a judge scores them, the lead keeps the best as a base and grafts 1 or 2 ideas from the other. Designs always get one when subagents exist, even on a single model (one angle each). Implementations get one only with 2 distinct models and a major open choice.

## Rules the lead never breaks

- **Clarity gate**: grill only a vague or ambiguous request, within caps. Otherwise decide alone.
- **Ticket items verbatim**: a Definition of Done or acceptance criteria become success criteria, word for word.
- **Decide reversible choices alone**, and record every decision (choice + why) in the reply and the PR body. A decision that leaves a gap also states its residual risk.
- **Budget**: a PR never exceeds `pr.max-lines` changed lines (700) plus 5 % (735), tests included. Over it, the work becomes a plan of smaller PRs.
- **Fresh verifier**: it gets the goal, the criteria, and the diff location, never the implementer's reasoning.
- **Hands off your checkout**: only the implementer touches git, on its own branch. No `stash`, `reset`, or `checkout` by anyone else. Unrelated uncommitted changes stop the run.
- **Guardrails are off limits**: lint, type, test, and CI configs and disable comments are never edited unless the task is about them.
- **Stuck means stop**: no PR, a report of what was tried and what remains.
- **Final reply**, in your language: what was done, each decision, the evidence, what stays unverified, and the models actually used per role.

## Roles and models

Each subagent has one role, and each role maps to a model tier. The rule is **the best quality for the price, biased toward intelligence**, never simply the most expensive model.

| Tier | Roles | Pick rule |
|---|---|---|
| `smart` | designer, judge, reviewer, verifier, design arena | Cheapest model with an intelligence index ≥ 90 % of the best |
| `code` | implementer, implementation arena | Best coding index per dollar among models ≥ 75 % of the best coding index |
| `fast` | explorer | Fastest model ≥ 50 % of the best coding index, then cheapest |

Arena roles take the top 2 of their tier, from different vendors when possible.

A role's model resolves in this order: its role key in `models.<harness>` → its tier key → the harness-native config → the agent's own judgment with the same rules. Setup uses the [Artificial Analysis](https://artificialanalysis.ai/) API when `ARTIFICIAL_ANALYSIS_API_KEY` is set, its public leaderboard otherwise.

## Memory

Preferences live in `~/.agents/memory/leogpt.md`, outside every repo, so they never land in a commit. It has a `## global` section and optional `## repo: <owner>/<name>` sections that override it key by key. Change it in plain language (`/leogpt from now on…`); the agent confirms in one line.

| Key | Default | Options |
|---|---|---|
| `finish` | `pr` | `draft-pr`, `stop` |
| `plan.destination` | `none` (chat only) | `repo:<path>`, `home`, `github-issue` |
| `pr.max-lines` | `700` | any; a lower cap documented in the repo wins |
| `verify.max-rounds` | `3` | integer |
| `arena.design`, `arena.implementation` | `auto` | `never` |
| `arena.candidates` | `2` | integer ≥ 2 |
| `grill.max-rounds` | `feature=3 bugfix=3 plan=5 grill=5` | per flow |
| `grill.max-questions` | `feature=4 bugfix=4 plan=8 grill=4` | per flow, per round |
| `setup.<harness>` | unset (ask) | `done <date>`, `later`, `never` |
| `models.<harness>` | unset | `smart=…, code=…, fast=…, arena.design=[…]` |

```markdown
# leogpt memory

## global
- finish: pr
- models.claude-code: smart=opus, code=sonnet, fast=haiku, arena.design=[opus, fable]

## repo: acme/app
- plan.destination: repo:plans/
- finish: draft-pr
```

## Harness support

Each harness file in `leogpt/references/harness/` answers the same 7 questions in the same order: spawn, model, list models, questions, isolation, native config, limits.

| | Claude Code | Cursor | Delta | omp | opencode | Zed | generic |
|---|---|---|---|---|---|---|---|
| Subagents | `Agent` | `Task` | Worker / Scout / Reviewer | `task` | `subagent` | `spawn_agent` | sequential fallback |
| Model per role | per call | per call | per profile | per agent file | per call | one for all | no |
| Implementation arena | ✅ | ✅ | ≥ 2 profile models | ≥ 2 distinct agent models | ✅ | ❌ | ≥ 2 selectable models |
| Design arena | ✅ | ✅ | ✅ | ✅ | ✅ | same model | with subagents |
| Choice UI | `AskUserQuestion` | `AskQuestion` | text | `ask` | `question` | text | text |
| Worktrees | `isolation: "worktree"` | manual | isolated copies | manual | manual | not needed | manual |
| Setup writes | memory | + `~/.cursor/rules/leogpt-models.mdc` | + profile models | + `~/.omp/agent/agents/leogpt-*.md` | memory | + `agent.subagent_model` | memory |

## Principles

22 short rules in `leogpt/principles/`, one file each (about 25 lines). `SKILL.md` holds a one-line index; a file is read only when it applies, and the lead names the relevant files in every subagent brief.

| Group | Principles |
|---|---|
| Core | laziness-protocol · follow-local-conventions · comment-the-why · foundational-thinking · redesign-from-first-principles · attack-the-premise · subtract-before-you-add · minimize-reader-load · experience-first · exhaust-the-design-space · build-the-lever |
| Architecture | model-the-domain · boundary-discipline · type-system-discipline · make-operations-idempotent · migrate-callers-then-delete-legacy-apis |
| Verification | prove-it-works · fix-root-causes · sequence-verifiable-units · test-behavior-not-implementation |
| Delegation | guard-the-context-window · never-block-on-the-human |

## Repository layout

```
leogpt/
├── SKILL.md                  router, lead rules, principles index
├── playbooks/                feature · bugfix · plan · setup
├── bricks/                   grill · how · architect · arena · interrogate · verify · ship
├── principles/               22 principle files
└── references/
    ├── memory.md             memory schema, defaults, model resolution, arena gate
    ├── subagent-brief.md     the delegation template every subagent receives
    └── harness/              claude-code · cursor · delta · omp · opencode · zed · generic
```

Every skill file stays under 80 lines: details load on demand, so each run pays only for what it uses.

---

## Design decisions

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Entry point | One skill, `/leogpt`, with a router | Separate `/feature`, `/bugfix`, `/plan`: generic names clash with built-in commands |
| Packaging | Bricks and principles as files inside one skill | Separate skills: more to install, a crowded skill list |
| Origin | Written from scratch, including grilling | Reusing repo or public skills: ties the suite to one repo or one author |
| Size | 80 lines max per file, details on demand | Large files: they cost context on every run |
| Autonomy | No human stop by default until the PR opens | Checkpoints before implementation: the grill already covers the risky case, a vague request |
| Grilling | Only for a vague or ambiguous request, capped, biased to decide alone | Always grilling: too slow for detailed tickets |
| Arena | Design always, even on one model with distinct angles: two 60-line designs are cheap. Implementation only with ≥ 2 distinct models and a `major` open choice | Same-model implementation arena: two full implementations for little diversity. pstack's mandatory arena on any open choice: too expensive |
| Review | 2 reviewers on distinct models, once, in parallel with verification | pstack's 3 models every time: too expensive. Review after verification: slower, and each check would run twice |
| PR size | 700 changed lines + 5 %, else slice into a plan | Big PRs: hard to review. Slicing on any overflow: churn for a few lines |
| Verification | A fresh verifier; tests plus a cheap real run; explicit "unverified" | Tests only: `prove-it-works` requires the real artifact |
| Stuck | Stop without a PR and report | Draft PR marked unverified: contradicts `prove-it-works` |
| Models | Setup proposes, you confirm, memory stores | Live API calls every run: latency, needs a key and web access |
| Memory | One file outside the repos, global plus per-repo | In the skill repo: preferences would get committed |

### From pstack: kept, merged, dropped

- **Kept as bricks:** `how`, `architect`, `arena`, `interrogate`.
- **Merged:** `why` into `how`; `blast-radius` and `no-comments` into the angles of `interrogate`; `tdd` into the bugfix repro; `unslop` and `technical-writing` into `ship`; `setup-pstack` into `playbooks/setup.md`; `show-me-your-work` into the decisions of the final reply.
- **Dropped:** `poteto-mode` and `poteto-agent` (replaced by the router); `teach`, `recall`, `bro`, `swarm`, `figure-it-out`, `automate-me`, `make-bot-ui`, `typescript-best-practices` (out of scope); verification-skill generators and `reflect` (maybe later).
- **Principles dropped:** `outcome-oriented-execution` (long migrations only), `separate-before-serializing-shared-state` (reduced to one worktree per arena candidate), `encode-lessons-in-structure` (meta).

## Review guide

1. Check file sizes (80 lines max per skill file) and that every referenced path exists.
2. Read `leogpt/SKILL.md` as the agent would, then follow one route end to end. Every step must name a file that exists or a concrete action.
3. Check every delegation against `references/subagent-brief.md`: role, scope, principles to read, success criteria, short return.
4. Check each harness file for the same 7 sections, and that none relies on a tool another harness file says is missing.
5. Look for contradictions with the design decisions above.
6. Run it on a real task in a sandbox branch: a detailed ticket should run with no questions; a bare prompt should grill.

## Credits

Flow and principles adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto (Lauren Tan). Model data from [Artificial Analysis](https://artificialanalysis.ai/).
