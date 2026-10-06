# Brick: arena

N candidates on distinct models attempt the same task in parallel. A judge scores them. You pick a base and graft the best ideas of the others into it. Used by `bricks/architect.md` (design) and `bricks/implement.md` (internal implementation strategies under one settled design).

## 0. Gate

Apply the arena gate in `references/config.md#models` for `arena.design` or `arena.implementation`. If it fails, do not run: return to the caller, which falls back. If it passes, take the runners it gives, from different vendors when possible. A same-model arena is noted in the final reply.

## 1. Frame

- **Artifact**: what each candidate produces. A design package (see `bricks/architect.md`), or a working implementation with commits.
- **Implementation contract**: identical boundaries, observable behavior, and invariants for every candidate; each follows `bricks/implement.md`. Major design choices are settled before this arena.
- **Rubric**: 3 to 6 gradeable criteria for this task. Only you and the judge see it. Candidates see the task.
- **Angles**: give each candidate one distinct stance, for example "smallest diff that reuses what exists" versus "the right domain model, even if the diff grows".
- **Output paths**: design, `/tmp/leogpt-arena-<slug>/candidate-<n>.md`; implementation, one git worktree per candidate (see the harness file, section 5).

## 2. Fan out

Spawn all candidates at once, in parallel, with the same brief (see `references/subagent-brief.md`) except for the angle and the output path. Each candidate returns its artifact location and a rationale that names the alternatives it rejected. If one fails, continue with the rest and note the dropout.

## 3. Judge

After every candidate has returned, spawn one read-only `judge`, on a different vendor from the candidates when possible. It gets the rubric and the candidates by label, scores each criterion, and recommends a base with its reason.

## 4. Pick

- **Design**: read every candidate in full.
- **Implementation**: read `git diff --stat` for each candidate, the full diff of the judge's pick, and the parts of the others the judge flagged as strengths.

Score against the rubric yourself, then compare with the judge. If you disagree, read both rationales before deciding. Pick the base that a future maintainer extends most easily. When tied, pick the smaller surface.

## 5. Graft

Take at most one or two ideas per losing candidate that are worth porting, and fold them into the base so it stays one coherent design. Never paste mechanically.

- Implementation: bring the base's commits onto the working branch, then an `implementer` applies the grafts there. Review the graft diff first; remove every arena worktree only after the graft reads clean. Full verification stays with the caller's next step.
- All candidates converged: ship the consensus shape, no graft needed.
- Candidates diverged wildly: the frame was underspecified. Reframe and rerun once, then pick.

## Output

The synthesized artifact, plus a note for the final reply: the base, each graft and its source, what you rejected and why, and any dropouts. Verification happens in the caller's next step.
