# Use case: feature

**You own the design. Size the task first, then run the shortest path that proves it.** Subagents write and verify the code; you stay in the lead. A chore (tooling, dependency, configuration, documentation) runs here too: its criteria are the requested operational result, proven by exercising the changed tool, build, or configuration. A saved plan slice arrives here through `usecases/plan.md#execute-a-saved-slice`.

Clarify first: run `bricks/grill.md` when the goal or scope is open, or two plausible readings lead to different code, per the clarity gate in `SKILL.md`.

Then size the task from the ticket and one lookup at most, name the lane in one line, and put its steps on the todo list. **Direct** when every signal holds: the anchor points are named or found with one `rg`, in one module; you cannot name a competing shape; no risk signal from `bricks/interrogate.md`; the estimated diff fits the PR budget. **Designed** when any fails. Over the budget, or splitting into independently verifiable slices: `usecases/plan.md`, and say why in one line.

**Direct**

1. Read the anchored files and their closest sibling test yourself, about 300 lines in all, and note the test command from the package scripts. Past that, the lane was wrong: switch to designed.
2. Write the criteria: the ticket items verbatim, or 2 to 6 behaviors a user observes, each with the test or run that proves it. One test may prove several criteria, and extending an existing test beats adding one.
3. Write the brief: the sibling to imitate, the allowed paths, the data shape in one line, the invariants with pointers, and the checks. No designer and no challenge: the precedent settles the shape.
4. One `implementer` per `bricks/implement.md`. If it stops on a structural decision, continue in designed from its step 2, keeping its valid commits.
5. One `verifier` per `bricks/verify.md`, with the commands that ran green and the entry point to drive. Repair per `bricks/verify.md#rounds`.
6. Run `bricks/ship.md`.

**Designed**

1. Run `bricks/how.md`, one explorer per angle, launched together. While they run, draft the criteria as in direct step 2 from the ticket alone, then complete them from the digests.
2. Settle the shape with `bricks/architect.md`: a designer or the arena, screened and picked by you. The data shape comes first in the sketch, per `principles/model-the-domain.md`.
3. Delegate with `bricks/implement.md` as soon as the sketch is picked, and launch the challenge (`bricks/architect.md#3-challenge`) in the same message when it applies: its accepted points go in the first repair batch, and a point that moves a boundary, a stored shape, or the public surface stops the implementer, which restarts on the revised sketch with its valid commits kept. Coupled code goes to one implementer; disjoint workstreams get parallel implementers in separate worktrees, after any blocking step such as a schema or shared types, with shared state split first (`principles/separate-before-serializing-shared-state.md`). Say in one line why you kept one or split.
4. Verify with `bricks/verify.md`. When the design was contested or a risk signal holds, run `bricks/interrogate.md` alongside on the same change. One repair batch per round, per `bricks/verify.md#rounds`.
5. Run `bricks/ship.md`.

In both lanes, use the waits. While the implementer runs, detect the PR conventions (`bricks/ship.md#conventions`) and lay out the PR body. While the verifier runs, lay out the explanation (`bricks/explain.md`). Fill both from the recorded evidence, never before it.

Escalation goes one way: direct work that opens a decision moves to designed once and keeps its valid commits; designed work never drops to direct.

**Reply:** the lane and why, what you built, what you chose and why, how you verified it, and open decisions. A table when you weighed design alternatives.
