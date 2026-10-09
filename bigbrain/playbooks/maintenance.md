# Playbook: maintenance

Refactor, simplify, or restructure code, or handle a chore (tooling, dependency, configuration, documentation). You own the scope, invariants, review, and verification; subagents write the code. For a saved plan slice, first apply `playbooks/plan.md#execute-a-saved-slice`.

Copy these steps into your todo list verbatim.

1. **Check the tree** per `bricks/ship.md#branch`.
2. **Clarify** per the clarity gate in `SKILL.md`: the cleanup or operational goal and what is in scope. Infer existing behavior from the repo; ask only about intent or scope.
3. **Ground and baseline.** Run `bricks/how.md` over the affected code, callers, and tests. Record the contracts to preserve with source pointers, and run the relevant checks before editing, keeping pre-existing failures explicit. Criteria: for a refactor, the concrete simplification and preserved behavior; for a chore, the requested outcome. Name the proof for each; where coverage is thin, plan characterization tests that capture current behavior before the transformation.
4. **Bound the change.** Write a transformation brief: allowed paths, intended cleanup, invariants, assumptions, checks, and principle files. Run `bricks/architect.md` only when its When to run section applies. When the change exceeds the PR budget or needs several slices, switch to `playbooks/plan.md`.
5. **Branch** per `bricks/ship.md#branch`, before the first write, characterization tests included.
6. **Implement** with `bricks/implement.md`, the brief, and the baseline. Prefer deletion; use a script or codemod for repetitive transformations.
7. **Verify and review.** Launch `bricks/verify.md` and `bricks/interrogate.md` together on the same change reference, with the baseline and preserved contracts: compare behavior before and after through the affected entry points, or exercise the changed tool, build, or configuration. Repair per `bricks/verify.md#rounds`.
8. **Ship** with `bricks/ship.md`, explaining what became simpler or changed operationally, with the preservation evidence.
9. **Reply** per `SKILL.md` with the outcome, verified contracts, and limits.

## Scope rules

- A refactor preserves observable behavior, public contracts, and persisted formats. A chore changes only the operational surface requested, such as a tool version or lint policy.
- If the goal cannot be met without changing behavior or a contract beyond the request, report the conflict and ask before dependent work; never broaden silently. An architectural improvement beyond the goal is proposed separately.
- A baseline failure is evidence to investigate, not permission for an unrelated fix; distinguish it from regressions.
