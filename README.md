# leogpt

A personal Agent Skill for serious engineering work: build a feature, fix a bug, write a plan, explain code, review a diff, or challenge an idea. It runs in Claude Code, Cursor, Delta, omp, opencode, Pi, and Zed, and degrades gracefully anywhere else.

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
| `/leogpt setup` | **Setup**: the agent proposes models, you choose, configuration stores them |
| `/leogpt watch-pr 123` | **Watch**: inspect CI and reviews, repair verified findings, stop at readiness or a limit |
| `/leogpt resume <run-id or state-path>` | Validate a saved checkpoint and continue the workflow |
| `/leogpt from now on, open PRs as drafts here` | **Configuration**: stores the execution preference, confirms, stops |

By default a run goes **all the way to an open PR without stopping**. It only asks you something when the request is vague, when a choice is truly yours (product, scope, a public API change), or when it is stuck.

---

## How a run goes

Every diagram reads top to bottom. The text on the right says what can branch off.

### Every run starts the same way

```text
1. Identify the harness     from the tool list, load references/harness/<harness>.md
   │
   ▼
2. Read configuration       ~/.agents/config/leogpt.md + relevant learned memory
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
      watch-pr ....................... monitor and repair an existing PR
      resume ......................... validate a checkpoint, continue
      "from now on…" .................. save execution preference to config, stop
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
   │                        (optional comparison of internal strategies under one settled design)
   ▼
7. Verify + review          see the loop below
   │
   ▼
8. Ship                     PR, draft PR, or stop, per configuration; optional bounded PR watch
   │
   ▼
9. Learn                    save only non-obvious, durable, sourced knowledge; usually nothing
   │
   ▼
10. Final reply             decisions, evidence, what stays unverified, models used
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

Out of rounds → ship a rechecked passing result only if all required criteria still hold.
Otherwise stop. Never rewrite pushed history to restore an old checkpoint.
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
9. Ship                     optional bounded PR watch
   │
   ▼
10. Learn + reply           qualifying knowledge only; root cause, fix, repro before/after
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
7. Learn + stop             save proven knowledge, not the unimplemented plan
                            then run a slice: /leogpt implement slice <n> of <plan>
```

A slice runs through Feature as a clear ticket: no questions unless the code contradicts the plan.

### Setup

```text
1. List the harness's models
   │
   ▼
2. Assess models            agent judgment, available controls, and your priorities
   │
   ▼
3. Propose                  smart · code · fast, alternatives and tradeoffs
   │
   ▼
4. You confirm each pick
   │
   ▼
5. Write configuration      + confirmed native profiles, when applicable
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
| `implement` | Settled design to checked commits: concrete precedent, expected writes, invariants, evidence, final diff inspection. | |
| `pr-watch` | CI and review triage, verified repairs, bounded polling, readiness and blocker report. | when a user decision is needed |
| `ship` | Branch rules, the repo's commit and PR conventions (Conventional Commits by default), then `finish`. Never merges. | |

**Arena**: 2 candidates on different models attempt the same task, a judge scores them, the lead keeps the best as a base and grafts 1 or 2 ideas from the other. Designs always get one when subagents exist, even on a single model (one angle each). Implementations get one only with enough distinct models and a justified comparison of internal strategies under the same contract. Major choices are resolved in architecture.

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
| `smart` | designer, judge, reviewer, verifier, design arena | Strong reasoning and judgment |
| `code` | implementer, implementation arena | Reliable implementation and tool use |
| `fast` | explorer | Low latency and cost, adequate for the exploration scope |

Arena roles use suitable distinct models, from different vendors when useful. Tiers may share models; selection depends on availability and user priorities.

A role's model resolves in this order: its role key in `models.<harness>` → its tier key → the harness-native config → the agent's judgment. Setup fetches no benchmark rankings. Uncertain capabilities are disclosed; current product facts are checked in official provider documentation when needed.

## Configuration, memory, and execution state

Explicit settings live in `~/.agents/config/leogpt.md`, outside every repo, so they never land in a commit. It has a `## global` section and optional `## repo: <owner>/<name>` sections that override it key by key. Change it in plain language (`/leogpt from now on…`); the agent confirms in one line.

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
| `watch.after-ship` | `false` | `true` |
| `watch.max-rounds` | `5` | repair batches |
| `watch.timeout-minutes` | `30` | bounded duration |
| `watch.poll-seconds` | `60` | integer ≥ 15 |

```markdown
# leogpt config

## global
- finish: pr
- models.claude-code: smart=opus, code=sonnet, fast=haiku, arena.design=[opus, fable]

## repo: acme/app
- plan.destination: repo:plans/
- finish: draft-pr
```

Existing settings in the legacy `~/.agents/memory/leogpt.md` are read when the new config is absent, then copied on the next settings write; the old file is preserved. Project knowledge lives in `~/.agents/memory/projects/<repo>/leogpt.md`. End-of-workflow learning writes only useful, non-obvious, established facts with a source, and updates existing entries instead of accumulating duplicates. Generic advice, task summaries, and unverified plans are excluded.

Run checkpoints use `~/.agents/runs/leogpt/<repo>/<run-id>/state.json` or an exposed harness store. They track phases, decisions, findings, counters, commits, and evidence. Resume validates the actual checkout and PR head; proofs on an older commit are rechecked where affected. Storage and wake-ups belong to the runtime; workflow decisions remain in the skill.

PR monitoring stops at readiness, a blocker, or configured time/repair limits. It never merges. Without an authorized scheduler, monitoring runs only while the session remains active; it does not silently create background jobs.

## Harness support

Each harness adapter has eight sections: spawn, model, model inventory, questions, isolation, native configuration, limits, and additional capabilities. The shared contract in `references/capabilities.md` defines optional retrieval, persistence, and wake-up capabilities with fallbacks. Pi requires extensions for subagents; no extension installation is part of the skill.

| | Claude Code | Cursor | Delta | omp | opencode | Zed | generic |
|---|---|---|---|---|---|---|---|
| Subagents | `Agent` | `Task` | Worker / Scout / Reviewer | `task` | `subagent` | `spawn_agent` | sequential fallback |
| Model per role | per call | per call | per profile | per agent file | per call | per call when supported | inspect tools |
| Implementation arena | ✅ | ✅ | distinct profile models | distinct agent models | ✅ | distinct selectable models | distinct selectable models |
| Design arena | ✅ | ✅ | ✅ | ✅ | ✅ | same model | with subagents |
| Choice UI | `AskUserQuestion` | `AskQuestion` | text | `ask` | `question` | text | text |
| Worktrees | `isolation: "worktree"` | manual | isolated copies | manual | manual | manual | manual |
| Setup writes | config | + `~/.cursor/rules/leogpt-models.mdc` | + profile models | + `~/.omp/agent/agents/leogpt-*.md` | config | + `agent.subagent_model` | config |

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
├── bricks/                   grill · how · architect · arena · implement · interrogate · verify · ship · pr-watch
├── principles/               22 principle files
└── references/
    ├── config.md             settings, defaults, model resolution, arena gate
    ├── memory.md             selective durable learning
    ├── run-state.md          checkpoints and validated resume
    ├── capabilities.md       harness contract and fallbacks
    ├── subagent-brief.md     the delegation template every subagent receives
    └── harness/              claude-code · cursor · delta · omp · opencode · pi · zed · generic
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
| Arena | Design always, even on one model with distinct angles: two 60-line designs are cheap. Implementation only with distinct models and a justified internal strategy comparison | Same-model implementation arena: two full implementations for little diversity. pstack's mandatory arena on any open choice: too expensive |
| Review | 2 reviewers on distinct models, once, in parallel with verification | pstack's 3 models every time: too expensive. Review after verification: slower, and each check would run twice |
| PR size | 700 changed lines + 5 %, else slice into a plan | Big PRs: hard to review. Slicing on any overflow: churn for a few lines |
| Verification | A fresh verifier; tests plus a cheap real run; explicit "unverified" | Tests only: `prove-it-works` requires the real artifact |
| Stuck | Stop without a PR and report | Draft PR marked unverified: contradicts `prove-it-works` |
| Models | Agent proposes, you choose, configuration stores | Benchmark ranking formulas: do not represent task fit or user priorities |
| Persistence | Separate config, learned memory, and per-run state outside repos | Mixing settings, durable facts, and transient progress makes resume and learning unreliable |

### From pstack: kept, merged, dropped

- **Kept as bricks:** `how`, `architect`, `arena`, `interrogate`.
- **Merged:** `why` into `how`; `blast-radius` and `no-comments` into the angles of `interrogate`; `tdd` into the bugfix repro; `unslop` and `technical-writing` into `ship`; `setup-pstack` into `playbooks/setup.md`; `show-me-your-work` into the decisions of the final reply.
- **Dropped:** `poteto-mode` and `poteto-agent` (replaced by the router); `teach`, `recall`, `bro`, `swarm`, `figure-it-out`, `automate-me`, `make-bot-ui`, `typescript-best-practices` (out of scope); verification-skill generators and `reflect` (maybe later).
- **Principles dropped:** `outcome-oriented-execution` (long migrations only), `separate-before-serializing-shared-state` (reduced to one worktree per arena candidate), `encode-lessons-in-structure` (meta).

## Review guide

1. Check file sizes (80 lines max per skill file) and that every referenced path exists.
2. Read `leogpt/SKILL.md` as the agent would, then follow one route end to end. Every step must name a file that exists or a concrete action.
3. Check every delegation against `references/subagent-brief.md`: role, scope, principles to read, success criteria, short return.
4. Check each harness file for the same 8 sections, and that none relies on a tool another harness file says is missing.
5. Look for contradictions with the design decisions above.
6. Run it on a real task in a sandbox branch: a detailed ticket should run with no questions; a bare prompt should grill.

## Credits

Flow and principles adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto (Lauren Tan).
