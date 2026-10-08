# Loop control

The caller owns these limits in every flow, including repairs, planning transitions, slices, and watch work. They supplement local brick limits and verification/watch counters; none resets another. Read `loop.max-replans` and `repro.max-rounds` from `references/config.md`.

## Structural returns

A structural return reopens the cause, grounding, design, or transformation approach after implementation or repair exposes a contradiction or a newly necessary structural decision. Charge one `replanCount` before investigating and revising that approach, even if it needs only a targeted lookup rather than architect. The initial approach, a narrow factual lookup within it, and ordinary repairs that preserve it do not count. A repair that reopens it consumes both its repair round and one structural return.

Before dispatch, record the current reference, blocking fact or failed assumption, its evidence, the new information since the preceding attempt, and the next discriminating probe. Increment and checkpoint the counter before starting the return; keep valid work. Updating a brief, changing subagent, switching to plan, or resuming does not create a fresh budget. Stop before a return that would exceed `loop.max-replans`.

## Reproduction

A reproduction pass tests one concrete trigger or environment hypothesis through the symptom's entry point, with its faithful test/script and result. Increment and checkpoint `reproRound` before each pass, including the first. A pass may run its setup and targeted checks; a changed trigger or environment hypothesis starts another pass, not an uncounted continuation.

If it fails to reproduce, use the observed result to select a different trigger or a discriminating probe. Ask only for a specific inaccessible fact or resource. Stop before a pass that would exceed `repro.max-rounds`; no reproduced failure means no speculative fix.

## Progress and exit

For both loops, a repeated blocker or hypothesis with no new evidence capable of changing the decision is stagnation: stop before retrying it. A rewritten explanation, another model's agreement, or a new commit without a new observation is not progress. An inconclusive probe is recorded, not treated as confirmation; another attempt needs a concrete reason its conditions can settle the uncertainty.

On stagnation or exhaustion, stop dependent work, preserve valid commits and artifacts, and checkpoint `blocked` with counters, attempts, unresolved hypotheses, and the next useful action. Do not ship a partial result or reset a counter to escape the limit. Continue only independent authorized work. Previously published PRs remain open; failed repairs stay unpushed.

## Persistence

Store `replanCount`, `reproRound`, and an `artifacts.loop` report per `references/run-state.md`. The report carries the attempt records above; without durable storage, retain the same compact records in the conversation and disclose the resume limit. Resume restores counters and the last blocker/evidence before any retry. For older checkpoints, reconstruct consumed attempts from artifacts/history; zero is valid only with evidence that none occurred. If usage cannot be reconstructed, keep dependent retries blocked and report that gap rather than granting a new budget.
