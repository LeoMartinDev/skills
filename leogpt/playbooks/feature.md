# Playbook: feature

New or changed behavior. You own the design, the review, and the verification. Subagents write the code.

Copy these steps into your todo list verbatim.

1. **Check the tree.** Per `bricks/ship.md#branch`: unrelated uncommitted changes stop the run.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. If it fails, run `bricks/grill.md` with the feature caps.
3. **Ground.** Run `bricks/how.md` over the subsystems the feature touches. Keep its model (<= 20 lines) for every later brief. Then write the acceptance criteria: the ticket items per the Ticket items rule in `SKILL.md`, or 2 to 6 behaviors a user observes when the input lists none, plus the test commands, and an integration test for each new or changed entry point whose closest sibling has one. They are the success criteria of every later brief.
4. **Design.** Run `bricks/architect.md`. It returns one sketch: types, signatures, module boundaries, `not implemented` bodies, the named data shape (per `principles/model-the-domain.md`), and the open implementation choices. When the sketch changes an external public surface (published API, CLI, file format) or a persisted data shape, show it to the user and ask once for a go. Estimate the diff from the sketch, tests included. Over budget (Budget rule in `SKILL.md`), apply the Scope rules below.
5. **Branch.** Follow `bricks/ship.md#branch`.
6. **Implement.**
   - Every implementation brief, arena candidate or single implementer, contains the sketch, the allowed paths, the success criteria, and the principle files `laziness-protocol`, `follow-local-conventions`, `comment-the-why`, `test-behavior-not-implementation`, and `sequence-verifiable-units`.
   - When the sketch has at least one `major` open choice, run `bricks/arena.md` with the implementation task, one worktree per candidate. If its gate fails, fall back to the next bullet.
   - Otherwise, one `implementer` subagent, which also settles the `minor` choices.
   - The implementer commits in small units, each ending in a passing check.
7. **Verify and review.** Launch `bricks/verify.md` and `bricks/interrogate.md` together, on the same commit. Send the counterexamples and the accepted findings to the implementer in one batch, then verify again per the Rounds of `bricks/verify.md`. No second review.
8. **Ship.** Run `bricks/ship.md` per `finish`.
9. **Reply.** Follow the Final reply rule in `SKILL.md`. Add a table when you weighed design alternatives.

## Scope rules

- One feature, one PR, within budget. If grounding shows the feature needs several independently verifiable slices, or the design's estimate exceeds the budget, switch to `playbooks/plan.md` and say why in one line. The grill decisions carry over.
- Code-coupled work goes to a single implementer. Parallel implementers only for disjoint files with no shared state.
- If implementation contradicts the sketch (a missing parameter, a wrong boundary), the implementer reports it instead of absorbing it. Go back to step 4 with that evidence.
