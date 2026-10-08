# Brick: implement

Turn a settled design, an evidence-backed fix, or a maintenance brief into a small idiomatic diff. Used for initial implementation and targeted repairs; the calling playbook owns reproduction, verification, review, and shipping.

## Input and delegation

The goal, grounding, sketch when needed, allowed paths, ticket items, success criteria, invariants, and check commands. For a bugfix include the original repro and confirmed cause. For maintenance include the transformation brief, baseline, and sketch only when conditional design produced one. For a repair include the accepted findings or counterexamples and current commit. Outside maintenance, an unresolved choice changing public behavior, persisted data, data flow, or module boundaries returns to `bricks/architect.md` before writing.

In maintenance mode, choose local structure directly within the brief's scope and contracts, including established cross-module transformations. A newly opened decision about responsibilities, state ownership, or dependency direction returns to the lead per `playbooks/maintenance.md#conditional-design`; pause dependent edits and preserve still-valid work. A conflict with scope or preserved contracts follows its Scope rules. Neither situation automatically restarts the workflow.

In every mode, including repairs and slices, return new evidence that invalidates an assumption or reveals an unknown rationale affecting safety or contracts: the fact, source/probe, affected assumption or contract, and paused dependent edit. Preserve valid work. The lead refreshes only affected grounding, choosing a targeted lookup, probe, or conditional `bricks/why.md`, then resumes without a full restart.

Use `references/subagent-brief.md` and the lead's `references/run-state.md#change-reference`. One `implementer` owns coupled code. Parallel implementers require disjoint files, no shared state, and separate branches/worktrees; the lead integrates their returned commits through one designated implementer before verification. Continue the existing implementer for repairs when supported.

Give writers the principle files `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus task-specific principles such as `fix-root-causes` for a bugfix, or `subtract-before-you-add` and `minimize-reader-load` for simplification. Include applicable architecture principles from the maintenance brief or sketch.

## 1. Establish the write plan

Before editing, inspect the closest existing implementation and test of the same kind. Start with grounding's templates; confirm they fit. Record their paths and the patterns reused in the report artifact. If none fits, say so and justify the chosen shape.

List the expected files to modify within the allowed scope and the checks for each behavior. This needs no user checkpoint. A newly discovered file inside scope may be added with a reason; changes outside scope or contradicting the sketch go back to the lead before editing. Return evidence for a design correction rather than patching around it.

Carry the invariants alongside the new behavior. For a complex task, keep a compact mapping of criterion → implementation → test or other proof → entry point, with gaps explicit. For each important safety assumption, name its evidence (type, boundary validation, inspected caller, or executed check); an assertion without evidence is unverified.

## 2. Implement verifiable units

Extend local patterns, with the smallest change that satisfies the contract. Each unit delivers a behavior, maintenance outcome, or necessary prerequisite and its relevant proof, leaving the branch working. Maintenance characterization tests pass against the baseline and transformed code. Avoid dividing commits solely by technical layer. The bugfix repro commit remains the only permitted red commit.

Run the narrow checks before committing each unit; run the package typecheck after the last one. A check run on unchanged code need not be repeated. Broad checks stay with `bricks/verify.md`. Remove instrumentation and debug leftovers. Measure the total diff against the configured budget; never compress code to fit.

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
