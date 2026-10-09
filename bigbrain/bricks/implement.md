# Brick: implement

Turn a settled design, an evidence-backed fix, or a maintenance brief into a small idiomatic diff. Used for initial implementation and targeted repairs; the calling playbook owns reproduction, verification, review, and shipping.

## Input and delegation

The goal, grounding, implementation brief or sketch when needed, allowed paths, ticket items, classified criteria/checks per `bricks/verify.md#delivery-gate`, and invariants. For a bugfix include the original repro and confirmed cause. For maintenance include the transformation brief, baseline, and sketch only when conditional design produced one. For a repair include accepted findings/counterexamples and current commit.

Settle local structure yourself within the brief's scope and contracts, including established cross-module transformations in maintenance. Stop dependent edits and return to the lead on a newly open structural decision (responsibilities, state ownership, dependency direction), a conflict with scope or preserved contracts, or evidence that invalidates an assumption or reveals an unknown rationale affecting safety or contracts. Report the fact, its source or probe, and what it affects; keep valid work. The lead routes it through its playbook's conditional design (architect outside feature and maintenance) and `references/loop-control.md`, refreshes only affected grounding with a lookup, probe, or `bricks/why.md`, then resumes without a full restart.

Use `references/subagent-brief.md` and the lead's `references/run-state.md#change-reference`. One `implementer` owns coupled code and continues for repairs when supported. Parallel implementers need disjoint files, no shared state, and separate worktrees; one designated implementer integrates their commits before verification.

Give writers the principle files `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus task-specific principles such as `fix-root-causes` for a bugfix, or `subtract-before-you-add` and `minimize-reader-load` for simplification. Include applicable architecture principles from the maintenance brief or sketch.

## 1. Establish the write plan

Before editing, inspect the closest existing implementation and test of the same kind. Start with grounding's templates; confirm they fit. Record their paths and the patterns reused in the report artifact. If none fits, say so and justify the chosen shape.

List the expected files within the allowed scope and the checks for each behavior; this needs no user checkpoint. A new in-scope file may be added with a reason; anything out of scope or contradicting the sketch goes back to the lead first, never patched around.

Carry the invariants alongside the new behavior. Map each criterion and invariant to its proof, gaps explicit; an important safety assumption without evidence (a type, boundary validation, inspected caller, or executed check) is unverified.

## 2. Implement verifiable units

Extend local patterns, with the smallest change that satisfies the contract. Each unit delivers a behavior, maintenance outcome, or necessary prerequisite and its relevant proof, leaving the branch working. Maintenance characterization tests pass against the baseline and transformed code. Avoid dividing commits solely by technical layer. The bugfix repro commit remains the only permitted red commit.

Run the narrow checks before committing each unit; run the package typecheck after the last one. A check run on unchanged code need not be repeated. Broad checks stay with `bricks/verify.md`. Remove instrumentation and debug leftovers.

For repairs, fix only accepted findings and counterexamples. Preserve the established criteria and invariants. If evidence refutes the cause or design, report it to the caller rather than expanding the patch.

## 3. Inspect the final diff

Inspect `git diff <baseCommit>...<headCommit>` from the effective change reference, its stat, and any uncommitted changes before handing off:

- Every touched file and behavior is justified by the task or accepted repair.
- Existing abstractions and caller paths are reused; no needless wrappers or compatibility code remain.
- Comments explain a necessary why; debug code is gone.
- Criteria, invariants, and important new paths have evidence or an explicit gap.

Fix issues this pass exposes and rerun affected narrow checks. This pass supplements independent verification and review.

## Output

Return the brief's short report: commit, actual files, precedent and reused patterns, decisions, exact check evidence, and unmet criteria or unverified assumptions. Put a long criterion map or write plan in a temporary report and return its path. The lead measures the final diff and checkpoints per `references/run-state.md` before verification.
