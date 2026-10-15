# Brick: implement

**Turn a settled design into the smallest idiomatic diff.** Used for the first implementation and for every repair. The caller owns the repro, verification, review, and shipping.

## Brief

Give the goal, the grounding, the brief or sketch, the allowed paths, the criteria with the ticket items, and the invariants. Add the challenge points you accepted, verbatim, when the challenge already ran, the report paths of the explorers and designers, and the test commands that already ran green. A bugfix adds the repro and the confirmed cause; a refactor, the baseline; a repair, the accepted findings, the counterexamples, and the current commit.

One `implementer` owns coupled code and continues for repairs when the harness allows it. Parallel implementers need disjoint files; split any shared state first (`separate-before-serializing-shared-state`).

Writers get `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus `fix-root-causes` for a bugfix, and `subtract-before-you-add` and `minimize-reader-load` for a refactor.

## 1. Plan the writes

Start from the closest existing implementation and test of the same kind, and reuse their patterns. If none fits, justify the shape. Cut the work into units, and list each unit's files and check. Plan the details of one unit at a time, never the whole diff up front.

A fact the brief cites with `path:line` holds until your code or a check disproves it: don't re-verify it before writing. Stop and report, keeping valid work, when a structural decision opens (responsibilities, state ownership, dependency direction), the scope or a contract conflicts, or a fact breaks an assumption. Never patch around it. The lead settles it per `bricks/architect.md` and resumes without a restart.

## 2. Implement in verifiable units

Work one unit at a time: read only the files that unit touches, edit them, run its checks, commit, then read for the next unit. Make the smallest change that meets the contract, extending local patterns. Each commit delivers one behavior or prerequisite with its proof and leaves the branch working; the bugfix repro is the only allowed red commit.

Run narrow checks before each commit and the package typecheck after the last; broad checks belong to the verifier. Extend an existing test's assertions before adding a test. With a line budget, measure the diff after each commit, and stop and report as soon as the remaining units would cross it. Remove instrumentation and debug code.

A repair fixes only the accepted findings and counterexamples. If evidence refutes the cause or the design, report it instead of growing the patch.

## 3. Inspect the final diff

Read the diff on the change reference. Every touched file is justified, existing abstractions are reused, there is no needless wrapper or compatibility code, comments explain only a necessary why, and each criterion and invariant has evidence or an explicit gap. Fix what this exposes and rerun the affected checks.

## Output

The commit, files, reused precedent, decisions, check evidence, and any unmet criteria or unverified assumptions.
