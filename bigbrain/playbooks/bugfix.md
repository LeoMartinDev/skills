# Playbook: bugfix

A defect: wrong behavior observable today. Be scientific. Every shipped line traces to runtime evidence. A change that "might help" is a hypothesis, not a fix, and it does not ship.

Copy these steps into your todo list verbatim.

1. **Check the tree.** Per `bricks/ship.md#branch`: unrelated uncommitted changes stop the run.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. If it fails, run `bricks/grill.md` with the bugfix caps. What you need: the observed behavior, the expected behavior, and where it happens.
3. **Ground.** Run `bricks/how.md` on the code path of the symptom, usually the simple path.
4. **Branch.** Follow `bricks/ship.md#branch`.
5. **Reproduce.** One `implementer` subagent writes the cheapest faithful repro: a failing test when a local test path exists, a script otherwise. It returns the command and its failing output verbatim. It commits a repro test, the only red commit allowed; a repro script stays uncommitted.
   - It won't reproduce: synthesize the trigger, tighten the conditions, add temporary instrumentation. Ask the user only for a specific thing the agent cannot reach (production data, a device), after trying.
   - Still no repro: stop per the Stuck rule in `SKILL.md`. No repro, no fix.
6. **Find the root cause.** From the grounding and the repro, list 2 to 4 hypotheses. Spawn one subagent per hypothesis, in parallel. It is an `explorer (report)` when reading code, logs, and `git log` can settle the hypothesis. It is an `implementer` in its own worktree when settling it needs temporary instrumentation, which never lands. Each returns a verdict with its evidence. Eliminate until one mechanism survives, and confirm it against the repro. Principle files `fix-root-causes` and `attack-the-premise`.
7. **Fix.** If the fix crosses a function or module boundary, run `bricks/architect.md` first. Establish the surrounding behaviors that must remain true, with source evidence. Run `bricks/implement.md` with the original repro, confirmed cause, invariants, and the settled sketch when needed. Commit the smallest justified fix on top of the repro test. Its success criteria: the repro passes, the expected behavior from step 2 holds, and the ticket items hold, per the Ticket items rule in `SKILL.md`. No defensive guard that hides the symptom, no unrelated cleanup.
8. **Verify and review.** Launch `bricks/verify.md`, with the original repro, and `bricks/interrogate.md` together, on the same commit. The repro now passes, and the surrounding tests still pass. Send counterexamples and accepted findings in one batch through `bricks/implement.md`, then verify again per the Rounds of `bricks/verify.md`. No second review unless the scope or design materially changes. If two fixes built on the same hypothesis fail, go back to step 6 and question the premise.
9. **Ship.** Run `bricks/ship.md` per `finish`. For a repro script, put its command and its before and after output in the PR body.
10. **Learn.** Apply `references/memory.md#learn-at-the-end-of-a-workflow`; save only qualifying durable knowledge, otherwise write nothing.
11. **Reply.** Follow the Final reply rule in `SKILL.md`, with four parts: what was broken, the root cause, the fix, and the repro output before and after, verbatim.

## Rules

- When evidence refutes a hypothesis, revert everything that hypothesis motivated.
- A unit test proves a branch's behavior, not the bug's absence. The original repro is the proof.
