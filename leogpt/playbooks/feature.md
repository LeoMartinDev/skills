# Playbook: feature

New or changed behavior. You own the design, the review, and the verification. Subagents write the code.

Copy these steps into your todo list verbatim.

1. **Check the tree.** Per `bricks/ship.md#branch`: unrelated uncommitted changes stop the run.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. If it fails, run `bricks/grill.md` with the feature caps.
3. **Ground.** Run `bricks/how.md` over the subsystems the feature touches. Keep its model (<= 20 lines) for every later brief. Then write the acceptance criteria: 2 to 6 behaviors a user observes, plus the test commands. They are the success criteria of every later brief.
4. **Design.** Run `bricks/architect.md`. It returns one sketch: types, signatures, module boundaries, `not implemented` bodies, the named data shape (per `principles/model-the-domain.md`), and the open implementation choices. When the sketch changes an external public surface (published API, CLI, file format) or a persisted data shape, show it to the user and ask once for a go.
5. **Branch.** Follow `bricks/ship.md#branch`.
6. **Implement.**
   - When the sketch has at least one `major` open choice, run `bricks/arena.md` with the implementation task, one worktree per candidate. If its gate fails, fall back to the next bullet.
   - Otherwise, one `implementer` subagent, which also settles the `minor` choices. Its brief contains the sketch, the allowed paths, the success criteria, and the principle files `laziness-protocol`, `test-behavior-not-implementation`, and `sequence-verifiable-units`.
   - The implementer commits in small units, each ending in a passing check.
7. **Verify.** Run `bricks/verify.md`. On fail, send only the counterexamples back to the implementer (see `references/subagent-brief.md#continuing`), then verify again. One round counter, `verify.max-rounds`, covers the whole run, review fixes included. Still failing: stop per the Stuck rule in `SKILL.md`.
8. **Review.** Run `bricks/interrogate.md` once on the branch diff. Send the accepted findings to the implementer, then rerun step 7. No second review. If the review fixes exhaust `verify.max-rounds`, do not stop: revert them, ship the last green commit, and list the unapplied findings in the PR body.
9. **Ship.** Run `bricks/ship.md` per `finish`.
10. **Reply.** Follow the Final reply rule in `SKILL.md`. Add a table when you weighed design alternatives.

## Scope rules

- One feature, one PR. If grounding shows the feature needs several independently verifiable slices, switch to `playbooks/plan.md` and say why in one line. The grill decisions carry over.
- Code-coupled work goes to a single implementer. Parallel implementers only for disjoint files with no shared state.
- If implementation contradicts the sketch (a missing parameter, a wrong boundary), the implementer reports it instead of absorbing it. Go back to step 4 with that evidence.
