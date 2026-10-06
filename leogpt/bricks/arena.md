# Brick: arena

N candidates propose designs for the same task in parallel. A judge scores them. You pick a base and graft the best ideas of the others into it. Used by `bricks/architect.md` before implementation.

## 0. Gate

Apply the arena gate in `references/config.md#models` for `arena.design`. If it fails, do not run: return to the caller, which falls back. If it passes, take the runners it gives, from different vendors when possible. A same-model arena is noted in the final reply.

## 1. Frame

- **Artifact**: one design package per candidate (see `bricks/architect.md`), addressing the same observable behavior, constraints, and invariants.
- **Rubric**: 3 to 6 gradeable criteria for this task. Only you and the judge see it. Candidates see the task.
- **Angles**: give each candidate one distinct stance, for example "smallest diff that reuses what exists" versus "the right domain model, even if the diff grows".
- **Output paths**: `/tmp/leogpt-arena-<slug>/candidate-<n>.md`. Candidates share the source checkout and write only their report; see the harness file, section 5.

## 2. Fan out

Spawn all candidates at once, in parallel, with the same brief (see `references/subagent-brief.md`) except for the angle and the output path. Each candidate returns its artifact location and a rationale that names the alternatives it rejected. If one fails, continue with the rest and note the dropout.

## 3. Judge

After every candidate has returned, spawn one read-only `judge`, on a different vendor from the candidates when possible. It gets the rubric and the candidates by label, scores each criterion, and recommends a base with its reason.

## 4. Pick

Read every candidate design in full.

Score against the rubric yourself, then compare with the judge. If you disagree, read both rationales before deciding. Pick the base that a future maintainer extends most easily. When tied, pick the smaller surface.

## 5. Graft

Take at most one or two ideas per losing candidate that are worth porting, and fold them into the base so it stays one coherent design. Never paste mechanically.

- All candidates converged: keep the consensus shape, no graft needed.
- Candidates diverged wildly: the frame was underspecified. Reframe and rerun once, then pick.

## Output

The synthesized design, plus a note for the final reply: the base, each graft and its source, what you rejected and why, and any dropouts. The caller settles remaining design decisions before implementation.
