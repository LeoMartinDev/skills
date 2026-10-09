# Use case: feature

**You own the design. Plan, review, verify.** Subagents write the code; you stay in the lead. A chore (tooling, dependency, configuration, documentation) runs here too: its criteria are the requested operational result, proven by exercising the changed tool, build, or configuration. A saved plan slice arrives here through `usecases/plan.md#execute-a-saved-slice`.

1. Clarify. Run `bricks/grill.md` when the goal or scope is open, or two plausible readings lead to different code, per the clarity gate in `SKILL.md`. A clear request runs autonomously.
2. Run `bricks/how.md` over the affected subsystems. Keep its mental model for every later brief.
3. Write the criteria: the ticket items verbatim, or 2 to 6 behaviors a user observes, each with the test or run that proves it. A new or changed entry point gets an integration test when its closest sibling has one.
4. Name the data shape before any logic, and choose its organizing structure per `principles/model-the-domain.md`: a state machine over scattered booleans, a table over branching, a typed model over repeated shape assumptions.
5. Settle the design. Run `bricks/architect.md` when an open structural decision remains (its When to run section); otherwise write a compact brief. If the estimated diff with tests exceeds the PR budget or splits into independently verifiable slices, switch to `usecases/plan.md` and say why in one line.
6. Delegate the code with `bricks/implement.md`: file paths, the data shape, the criteria, and the invariants. Decide the split first: coupled code goes to one implementer; workstreams on disjoint files get parallel implementers in separate worktrees, with any shared state split first (`principles/separate-before-serializing-shared-state.md`), after any blocking step such as a schema or shared types. Say in one line why you kept one or split. Small commits, each a verifiable unit (`principles/sequence-verifiable-units.md`).
7. Verify on the matching surface with `bricks/verify.md`. "Inconclusive" or the wrong surface is not a pass. If the design was contested or the change is risky (persisted data, security, money, concurrency), run `bricks/interrogate.md` alongside on the same change. Repair per `bricks/verify.md#rounds`.
8. Run `bricks/ship.md`.

**Reply:** what you built, what you chose and why, how you verified it, and open decisions. A table when you weighed design alternatives.
