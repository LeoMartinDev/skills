# Brick: implement

**Turn a settled design into the smallest idiomatic diff.** Used for the first implementation and for every repair. The caller owns the repro, verification, review, and shipping.

## Brief

Give the goal, the grounding, the brief or sketch, the allowed paths, the criteria with the ticket items, and the invariants. A bugfix adds the repro and the confirmed cause; a refactor, the baseline; a repair, the accepted findings, the counterexamples, and the current commit.

One `implementer` owns coupled code and continues for repairs when the harness allows it. Parallel implementers need disjoint files; split any shared state first (`separate-before-serializing-shared-state`).

Writers get `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus `fix-root-causes` for a bugfix, and `subtract-before-you-add` and `minimize-reader-load` for a refactor.

## 1. Plan the writes

Start from the closest existing implementation and test of the same kind, and reuse their patterns. If none fits, justify the shape. List the files and the check for each behavior.

Stop and report, keeping valid work, when a structural decision opens (responsibilities, state ownership, dependency direction), the scope or a contract conflicts, or a fact breaks an assumption. Never patch around it. The lead settles it per `bricks/architect.md` and resumes without a restart.

## 2. Implement in verifiable units

Make the smallest change that meets the contract, extending local patterns. Each commit delivers one behavior or prerequisite with its proof and leaves the branch working; the bugfix repro is the only allowed red commit. Run narrow checks before each commit and the package typecheck after the last; broad checks belong to the verifier. Remove instrumentation and debug code.

A repair fixes only the accepted findings and counterexamples. If evidence refutes the cause or the design, report it instead of growing the patch.

## 3. Inspect the final diff

Read the diff on the change reference. Every touched file is justified, existing abstractions are reused, there is no needless wrapper or compatibility code, comments explain only a necessary why, and each criterion and invariant has evidence or an explicit gap. Fix what this exposes and rerun the affected checks.

## Output

The commit, files, reused precedent, decisions, check evidence, and any unmet criteria or unverified assumptions.
