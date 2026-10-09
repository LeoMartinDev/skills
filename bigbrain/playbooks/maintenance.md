# Playbook: maintenance

Refactor, simplify, or restructure existing code, and handle chores such as tooling, dependency, configuration, or documentation changes. You own the scope, invariants, review, and verification. Subagents write the code. A broad transformation still uses this flow when its purpose is maintenance.

Direct implementation is the default, with a compact transformation brief. Insert architecture only for unresolved structural decisions, per Conditional design below. Keep one workflow, including for broad transformations and architectural refactors.

For a saved plan slice, first apply `playbooks/plan.md#execute-a-saved-slice`. Carry its criteria, scope, decisions, and invariants through the steps below.

Copy these steps into your todo list verbatim.

1. **Check the tree.** Per `bricks/ship.md#branch`: unrelated uncommitted changes stop the run.
2. **Clarify.** Apply the clarity gate from `SKILL.md`, using maintenance caps if a grill is needed. Establish the cleanup or operational goal and the code or tooling in scope. Infer existing behavior from the repo; ask only about unresolved intent or scope, not implementation structure.
3. **Ground and baseline.** Run `bricks/how.md` over the affected code, callers, and tests. Record the contracts to preserve with source pointers and run the relevant existing checks before editing. Keep pre-existing failures explicit. Write criteria per the Ticket items rule in `SKILL.md`: for a refactor, the concrete simplification and preserved behavior; for a chore, the requested operational or documentation outcome and affected contracts. Name the check or other proof for each. If coverage is inadequate, identify focused characterization tests or a reproducible comparison to add in implementation before transforming the code; they capture current behavior, not internal structure.
4. **Bound the change.** Write a compact transformation brief: allowed paths, intended cleanup, invariants, sourced assumptions, checks, and applicable principle files. Apply Conditional design below; carry its sketch only when architecture is needed. Estimate the diff including proof work. Apply the Scope rules below when it needs multiple PRs or exceeds the budget.
5. **Branch.** Follow `bricks/ship.md#branch` before the first write, including characterization tests.
6. **Implement.** Run `bricks/implement.md` in maintenance mode with the transformation brief, baseline, allowed paths, criteria, invariants, and sketch when present. Local choices belong to the implementer; a newly discovered structural decision returns to the lead per Conditional design. Prefer deletion and use a script or codemod for repetitive transformations when appropriate.
7. **Verify and review.** Launch `bricks/verify.md` and `bricks/interrogate.md` together on the same fixed change reference per `references/run-state.md#change-reference`, with the maintenance goal, baseline, and preserved contracts. For a refactor, compare behavior before and after through the affected entry points. For a chore, exercise the changed tool, build, configuration, or document as applicable. Wait for both reports before any repair; own the single repair batch, counter, and re-verification per `bricks/verify.md#rounds`, retaining maintenance mode. A material change to scope or transformation approach needs a fresh review; apply Conditional design only to newly opened structural decisions.
8. **Ship.** Run `bricks/ship.md` per `finish`. Explain what became simpler or changed operationally, the preservation evidence, and any verification gaps.
9. **Learn.** Apply `references/memory.md#learn-at-the-end-of-a-workflow`; save only qualifying durable knowledge, otherwise write nothing.
10. **Reply.** Follow the Final reply rule in `SKILL.md` with the maintenance outcome, verified contracts, and material limits.

## Conditional design

- **Architect.** After grounding, name any open decision about module responsibilities, ownership of state, or dependency direction, and its concrete consequence. If resolving it is necessary for the requested goal, run `bricks/architect.md` autonomously on that point and explain why. Reuse settled choices and preserved contracts. Naming, a signature change, function extraction, size, or crossing module boundaries alone is insufficient. If a target is prescribed, check whether it actually settles these decisions rather than assuming it does.
- **Direct path.** Delete wrappers, simplify local logic, or migrate callers to an existing API with an established pattern directly. Moving business logic into services needs architecture only when their responsibilities or dependencies remain undefined; removing shared state needs it when the new source of truth is undecided.
- **Arena.** Only through the gate in `references/config.md#selection-and-fallback`, as in every flow.
- **Principles.** Apply relevant core and architecture principles to the brief and any design, plus verification principles to its proof. Give their file paths to implementers, designers, candidates, judge, and reviewers as applicable. Reject or revise a candidate violating an applicable principle or preserved contract before ranking; recheck the final synthesis and grafts.
- **During implementation or repair.** The implementer reports the concrete open decision and pauses dependent edits. The lead first applies `references/loop-control.md`, then the same design gate to that point, keeps the grounding, criteria, and still-valid work, updates the brief or sketch, then resumes. Do not restart the workflow. An architectural improvement beyond the requested goal is proposed separately, not folded into the change.

## Scope rules

- One coherent maintenance goal per PR, within budget. If it needs several independently verifiable slices or exceeds the budget, switch to `playbooks/plan.md` in maintenance mode. Reuse the baseline, brief, and sketch when present; apply the same conditional design gate. Each slice preserves contracts and leaves a working state; size alone never triggers design.
- Code-coupled work goes to a single implementer. Parallel implementers require disjoint files and no shared state.
- A refactor preserves observable behavior, public contracts, and persisted formats. A chore may change the operational surface explicitly requested, such as a tool version or lint policy; preserve unrelated contracts. An internal structural change alone is not a scope change.
- If the goal cannot be met without changing behavior or a contract beyond the request, report the concrete conflict and ask for that scope decision before dependent design or edits. Do not silently broaden the task. If the user explicitly authorizes a feature or bugfix as separate work, route that work to its playbook and retain the maintenance boundaries.
- A baseline failure is evidence to investigate, not permission for an unrelated bugfix. Report it and distinguish it from regressions; never claim a failed or unavailable check proves preservation.
