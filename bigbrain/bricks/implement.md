# Brick: implement

Turn a settled brief, sketch, or confirmed fix into a small idiomatic diff, for initial work and repairs. The caller owns reproduction, verification, review, and shipping.

## Input

The goal, grounding, brief or sketch, allowed paths, criteria with the ticket items, and invariants. A bugfix adds the repro and confirmed cause; maintenance, the baseline; a repair, the accepted findings, counterexamples, and current commit.

One `implementer` owns coupled code and continues for repairs when the harness allows it. Parallel implementers need disjoint files and no shared state.

Give writers `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus task-specific ones: `fix-root-causes` for a bugfix, `subtract-before-you-add` and `minimize-reader-load` for a simplification.

## 1. Plan the writes

Inspect the closest existing implementation and test of the same kind, starting from grounding's templates, and reuse their patterns; if none fits, justify the chosen shape. List the files and the check for each behavior. A new in-scope file may be added with a reason.

Stop and report to the lead, keeping valid work, on a newly open structural decision (responsibilities, state ownership, dependency direction), a conflict with scope or contracts, or a fact that invalidates an assumption. Never patch around it. The lead settles it per `bricks/architect.md#when-to-run` and resumes without a restart.

## 2. Implement in verifiable units

Make the smallest change that satisfies the contract, extending local patterns. Each commit delivers a behavior or a necessary prerequisite with its proof and leaves the branch working; the bugfix repro commit is the only allowed red commit. Run narrow checks before each commit and the package typecheck after the last; broad checks belong to `bricks/verify.md`. Remove instrumentation and debug code.

A repair fixes only accepted findings and counterexamples. If evidence refutes the cause or design, report it instead of growing the patch.

## 3. Inspect the final diff

Read the diff on the change reference: every touched file is justified; existing abstractions are reused, with no needless wrapper or compatibility code; comments explain only a necessary why; each criterion and invariant has evidence or an explicit gap. Fix what this exposes and rerun the affected checks.

## Output

The brief's report: commit, files, reused precedent, decisions, check evidence, and unmet criteria or unverified assumptions.
