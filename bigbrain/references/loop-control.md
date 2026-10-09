# Loop control

Every bounded loop in the skill, in one place. The owner charges the counter and checkpoints it per `references/run-state.md` before the attempt, and stops before an attempt that would exceed the limit. The budget belongs to the run, not to a step or an agent: no counter resets another, and a new brief, another subagent, switching to plan, or resuming never grants a fresh one. Running a saved plan slice later starts a new run with fresh budgets. Limits come from `references/config.md`.

| Loop | Owner | Charge one for | Limit |
|---|---|---|---|
| Reproduction | bugfix playbook | each pass, including the first | `repro.max-rounds` |
| Structural return | calling playbook | each return, defined below | `loop.max-replans` |
| Repair | calling playbook | each batch of counterexamples and accepted findings; each probe for a required `INCONCLUSIVE` | `verify.max-rounds` |
| Watch | `bricks/pr-watch.md` | each repair batch, failed ones included; each probe for a required `INCONCLUSIVE`; each CI rerun. Verification inside the watch charges nothing else. | `watch.max-rounds`, `watch.timeout-minutes` |
| Arena | `references/config.md#selection-and-fallback` | each arena, its one reframe included | once per run |
| Grill | `bricks/grill.md` | each round of user questions | the current flow's `grill.max-rounds` and `grill.max-questions`; rounds already used still count |
| Design correction, report-format retry | the brick | each retry | once |

A repair that reopens the approach charges both its repair counter and one structural return.

## Structural returns

A structural return reopens the cause, grounding, design, or transformation approach because implementation or repair exposed a contradiction or a newly necessary structural decision, or because a root-cause wave confirmed no mechanism. The initial approach, a factual lookup within it, a repair that keeps it, and a changed HEAD alone do not count; a return counts even when a lookup settles it.

Before the return, record the current reference, the blocking fact or failed assumption with its evidence, what is new since the previous attempt, and the next discriminating probe. Keep valid work.

## Reproduction

A pass tests one concrete trigger or environment hypothesis through the symptom's entry point, with its test or script and result. A changed hypothesis is a new pass; the method lives in `playbooks/bugfix.md`.

## Progress and exit

Every loop stops on stagnation: a retry needs an observation absent from earlier attempt records, such as a changed check result, error, or location. A rewritten explanation, another model's agreement, or a new commit is not one. An inconclusive probe is recorded, not treated as confirmation.

On stagnation or an exhausted limit, stop dependent work, keep valid commits and artifacts, and checkpoint `blocked` with counters, attempts, unresolved hypotheses, and the next useful action. Never ship a partial result; continue only independent authorized work. Published PRs stay open and failed repairs stay unpushed. Before shipping, an exhausted repair budget may still deliver a previously passing result per `bricks/verify.md#rounds`.

## Persistence

Counters live in run-state fields (`reproRound`, `replanCount`, `verifyRound`, `watch.fixRounds`, `arenaRuns`, `grillRound`) and attempt records in the `artifacts.loop` report. Without durable storage, keep them in the conversation and disclose the resume limit. Resume restores them before any retry. For an older checkpoint, reconstruct consumed attempts from artifacts and history; if that is impossible, keep dependent retries blocked rather than granting a new budget. The watch deadline is saved with its counter; only an explicit new watch run starts a new watch budget and deadline.
