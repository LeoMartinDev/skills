# Brick: implement

Turn a settled design or an evidence-backed fix into a small idiomatic diff. Used for initial implementation and targeted repairs; the calling playbook owns reproduction, verification, review, and shipping.

## Input and delegation

The goal, grounding, sketch when needed, allowed paths, ticket items, success criteria, invariants, and check commands. For a bugfix include the original repro and confirmed cause. For a repair include the accepted findings or counterexamples and current commit. An unresolved choice changing public behavior, persisted data, data flow, or module boundaries returns to `bricks/architect.md` before writing.

Use `references/subagent-brief.md`. One `implementer` owns coupled code. Parallel implementers require disjoint files and no shared state. Continue the existing implementer for repairs when supported.

Give writers the principle files `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`, plus task-specific principles such as `fix-root-causes` for a bugfix.

An implementation arena is optional only when comparing credible internal strategies under the same settled contract, boundaries, invariants, and observable behavior would resolve a concrete uncertainty. Name the comparison and its evidence criterion; apply `bricks/arena.md`'s gate. It is never a fallback for unfinished architecture. Each candidate follows this brick. Otherwise use one implementer.

## 1. Establish the write plan

Before editing, inspect the closest existing implementation and test of the same kind. Start with grounding's templates; confirm they fit. Record their paths and the patterns reused in the report artifact. If none fits, say so and justify the chosen shape.

List the expected files to modify within the allowed scope and the checks for each behavior. This needs no user checkpoint. A newly discovered file inside scope may be added with a reason; changes outside scope or contradicting the sketch go back to the lead before editing. Return evidence for a design correction rather than patching around it.

Carry the invariants alongside the new behavior. For a complex task, keep a compact mapping of criterion → implementation → test or other proof → entry point, with gaps explicit. For each important safety assumption, name its evidence (type, boundary validation, inspected caller, or executed check); an assertion without evidence is unverified.

## 2. Implement verifiable units

Extend local patterns, with the smallest change that satisfies the contract. Each unit adds a behavior or necessary prerequisite and its relevant proof, leaving the branch working. Avoid dividing commits solely by technical layer. The bugfix repro commit remains the only permitted red commit.

Run the narrow checks before committing each unit; run the package typecheck after the last one. A check run on unchanged code need not be repeated. Broad checks stay with `bricks/verify.md`. Remove instrumentation and debug leftovers. Measure the total diff against the configured budget; never compress code to fit.

For repairs, fix only accepted findings and counterexamples. Preserve the established criteria and invariants. If evidence refutes the cause or design, report it to the caller rather than expanding the patch.

## 3. Inspect the final diff

Inspect `git diff <base>...HEAD`, its stat, and any uncommitted changes before handing off:

- Every touched file and behavior is justified by the task or accepted repair.
- Existing abstractions and caller paths are reused; no needless wrappers or compatibility code remain.
- Comments explain a necessary why; debug code is gone.
- Criteria, invariants, and important new paths have evidence or an explicit gap.

Fix issues this pass exposes and rerun affected narrow checks. This pass supplements independent verification and review.

## Output

Return the brief's short report: commit, actual files, precedent and reused patterns, decisions, exact check evidence, and unmet criteria or unverified assumptions. Put a long criterion map or write plan in a temporary report and return its path. The lead measures the final diff and checkpoints per `references/run-state.md` before verification.
