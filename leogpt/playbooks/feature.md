# Playbook: feature

New or changed behavior. You own the design, the review, and the verification. Subagents write the code.

Copy these steps into your todo list verbatim.

1. **Branch.** Follow `bricks/ship.md#branch`.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. Grill if needed (`bricks/grill.md`, feature caps).
3. **Ground.** Run `bricks/how.md` over the subsystems the feature touches. Keep its model (<= 20 lines) for every later brief.
4. **Design.** Run `bricks/architect.md`. It returns one sketch: types, signatures, module boundaries, `not implemented` bodies, the named data shape (per `principles/model-the-domain.md`), and the open implementation choices.
5. **Implement.**
   - Run `bricks/arena.md` with the implementation task, one worktree per candidate, only when all three hold: the sketch has at least one `major` open choice, `arena.implementation` is `auto`, and the arena gate passes. `minor` choices go to a single implementer.
   - Otherwise, one `implementer` subagent. Its brief contains the sketch, the allowed paths, the success criteria, and the principle files `laziness-protocol`, `test-behavior-not-implementation`, and `sequence-verifiable-units`.
   - The implementer commits in small units, each ending in a passing check.
6. **Verify.** Run `bricks/verify.md`. On fail, send only the counterexamples back to the implementer (see `references/subagent-brief.md#continuing`), then verify again, up to `verify.max-rounds`. Still failing: stop per the Stuck rule in `SKILL.md`.
7. **Review.** Run `bricks/interrogate.md` on the branch diff. Send the accepted findings to the implementer, then rerun step 6.
8. **Ship.** Run `bricks/ship.md` per `finish`.
9. **Reply.** Follow the Final reply rule in `SKILL.md`. Add a table when you weighed design alternatives.

## Scope rules

- One feature, one PR. If grounding shows the feature needs several independently verifiable slices, switch to `playbooks/plan.md` and say why in one line. The grill decisions carry over.
- Code-coupled work goes to a single implementer. Parallel implementers only for disjoint files with no shared state.
- If implementation contradicts the sketch (a missing parameter, a wrong boundary), the implementer reports it instead of absorbing it. Go back to step 4 with that evidence.
