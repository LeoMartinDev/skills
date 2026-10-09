# Brick: arena

**Several models design the same thing; keep the best and graft the rest.** Candidates propose designs in parallel, a judge scores them, and you pick a base and fold in the best ideas of the others. Called by `bricks/architect.md`.

## Gate

Run it at most once per run, and only when both hold:

- a named structural decision has several viable shapes with real tradeoffs (coupling, maintenance, migration, operations) that the request, conventions, and facts don't settle. Size or available models alone don't qualify;
- the harness has subagents and `arena.design` is not `none` (`references/config.md#models`).

Each listed model runs one candidate, at least two. With a single model listed, or `arena.design` unset, run two candidates on the resolved model with distinct angles. When the gate fails, architect uses one designer. Say in one line why the arena was skipped, or that it ran on one model.

## 1. Frame

- **Artifact.** One design package per candidate, per `references/prompts/designer.md`, for the same behavior, constraints, and invariants.
- **Rubric.** 3 to 6 gradeable criteria for this task. Only you and the judge see it.
- **Angles.** One distinct stance per candidate, for example "smallest diff that reuses what exists" against "the right domain model, even if the diff grows". An angle never relaxes a principle, criterion, or contract.
- **Output paths.** `candidate-<n>.md` in the scratch directory. Candidates only read the checkout, so they need no worktree.

## 2. Fan out

Spawn every candidate at once with the same brief, except the angle and output path. Each returns its design path and the alternatives it rejected. If one fails, continue with the rest and note the dropout.

## 3. Judge

Once all have returned, one read-only `judge`, on another vendor when possible, gets the rubric, the shared constraints, and the candidates by label. It flags violations first, scores only viable candidates, and recommends a base with its reason.

## 4. Pick

Read every design in full. Drop or revise any that violates a principle, criterion, or contract; scores never offset a violation. Score the rest yourself, then compare with the judge. If you disagree, read both rationales before deciding. Pick the base a future maintainer extends most easily; on a tie, the smaller surface. If none is viable, return blockers.

## 5. Graft

Port at most one or two ideas per losing candidate, folded into the base so it stays one coherent design. Never paste mechanically. Recheck the result against the shared constraints.

- Candidates converged: keep the consensus, no graft.
- Candidates diverged wildly: the frame was underspecified. Pick a viable design or return blockers.

## Output

A synthesized design plus a note for the final reply (the base, each graft and its source, what you rejected and why, dropouts), or concrete blockers. Return to architect.
