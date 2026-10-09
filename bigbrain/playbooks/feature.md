# Playbook: feature

New or changed behavior. You own the design, the review, and the verification. Subagents write the code.

For a saved plan slice, first apply `playbooks/plan.md#execute-a-saved-slice`. Carry its mapped success criteria, scope, decisions, and invariants through the steps below.

Copy these steps into your todo list verbatim.

1. **Check the tree.** Per `bricks/ship.md#branch`: unrelated uncommitted changes stop the run.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. If it fails, run `bricks/grill.md` with the feature caps.
3. **Ground.** Run `bricks/how.md` over the subsystems the feature touches. Keep its model (<= 20 lines) for every later brief. Then write the acceptance criteria: the ticket items per the Ticket items rule in `SKILL.md`, or 2 to 6 behaviors a user observes when the input lists none, plus the test commands, and an integration test for each new or changed entry point whose closest sibling has one. They are the success criteria of every later brief.
4. **Set the approach.** Apply Conditional design below. Write a compact implementation brief or obtain a settled sketch from `bricks/architect.md`, with invariants and sourced assumptions. Decide and ask per `SKILL.md`. Estimate the diff, tests included. Over budget (`references/config.md#pr-budget`), apply the Scope rules below.
5. **Branch.** Follow `bricks/ship.md#branch`.
6. **Implement.** Run `bricks/implement.md` with the implementation brief, sketch when present, invariants, allowed paths, and success criteria.
7. **Verify and review.** Launch `bricks/verify.md` and `bricks/interrogate.md` together on the same fixed change reference per `references/run-state.md#change-reference`. Wait for both reports before any repair; own the single repair batch, counter, and re-verification per `bricks/verify.md#rounds`.
8. **Ship.** Run `bricks/ship.md` per `finish`.
9. **Learn.** Apply `references/memory.md#learn-at-the-end-of-a-workflow`; save only qualifying durable knowledge, otherwise write nothing.
10. **Reply.** Follow the Final reply rule in `SKILL.md`. Add a table when you weighed design alternatives.

## Conditional design

- If the request, grounded contracts, and an inspected precedent settle the data shape, wiring, and boundaries, the lead writes a compact brief: precedent, allowed paths, intended behavior, invariants, sourced assumptions, and checks. No designer, arena, or design challenge is needed; independent verification and diff review still run.
- Otherwise name the consequential open structural decision and run `bricks/architect.md` on it. Verify a missing fact with a targeted lookup/probe first; do not manufacture alternatives. Arena selection always follows `references/config.md#selection-and-fallback`.
- Apply the same gate in planning, saved slices, and repairs. On a contradiction or newly necessary structural decision after implementation, apply `references/loop-control.md` before revising the affected brief or sketch; preserve valid work.

## Scope rules

- One feature, one PR, within budget. If grounding shows the feature needs several independently verifiable slices, or the design's estimate exceeds the budget, switch to `playbooks/plan.md` and say why in one line. The grill decisions carry over.
- Code-coupled work goes to a single implementer. Parallel implementers only for disjoint files with no shared state.
- If implementation contradicts the brief or sketch (a missing parameter, a wrong boundary), the implementer reports it instead of absorbing it. Return to step 4 through `references/loop-control.md` with that evidence.
