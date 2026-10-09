# Playbook: feature

New or changed behavior. You own the design, review, and verification; subagents write the code. For a saved plan slice, first apply `playbooks/plan.md#execute-a-saved-slice`.

Copy these steps into your todo list verbatim.

1. **Check the tree** per `bricks/ship.md#branch`.
2. **Clarify** per the clarity gate in `SKILL.md`.
3. **Ground.** Run `bricks/how.md` over the subsystems touched and keep its mental model for every later brief. Write the criteria: the ticket items, or 2 to 6 behaviors a user observes, plus the test commands and an integration test for each new or changed entry point whose closest sibling has one.
4. **Set the approach.** Write a compact brief, or run `bricks/architect.md` when its When to run section applies. Estimate the diff with tests; when it exceeds the PR budget or needs several independently verifiable slices, switch to `playbooks/plan.md` and say why in one line.
5. **Branch** per `bricks/ship.md#branch`.
6. **Implement** with `bricks/implement.md`.
7. **Verify and review.** Launch `bricks/verify.md` and `bricks/interrogate.md` together on the same change reference, then repair per `bricks/verify.md#rounds`.
8. **Ship** with `bricks/ship.md`.
9. **Reply** per `SKILL.md`, with a table when you weighed design alternatives.
