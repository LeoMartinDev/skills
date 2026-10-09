# Use case: bugfix

**You own this task. Plan, review, verify.** Subagents investigate and write the fix; you stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. A change that "might help" is a hypothesis, not a fix, and it does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Clarify the observed behavior, the expected behavior, and where it happens. Run `bricks/grill.md` when the expected behavior is open, per the clarity gate in `SKILL.md`.
2. Reproduce it on the symptom's surface. Run `bricks/how.md` on the symptom's code path to find its entry point, then have an `implementer` write the cheapest faithful repro: a failing test when a local test path exists, otherwise a script. Keep the command and its failing output verbatim. A repro test is committed now, as the only allowed red commit, so the fix lands on top of it; a repro script stays uncommitted. If it won't fire, synthesize the trigger, tighten the conditions, or instrument until it does. Ask the user only for what you cannot reach (production data, a device). No repro, no fix.
3. Binary-search the cause. Form 2 to 4 hypotheses from the grounding and `git log` (`bricks/why.md` when a regression's history matters), then rule them out in parallel: an `explorer (report)` when code and logs can settle one, an `implementer` in its own worktree when it needs instrumentation, which never lands. Each round takes the split that cuts the most remaining space. Don't guess: when state is unclear, log it and read it as the code runs. Confirm the surviving mechanism against the repro (`principles/fix-root-causes.md`).
4. Plan the fix. Run `bricks/architect.md` when its When to run section applies, then `bricks/implement.md` with the repro, the confirmed cause, and the invariants. Criteria: the repro passes, the expected behavior from step 1 holds, and the ticket items hold. No guard that hides the symptom, no unrelated cleanup.
5. Verify on the same surface with `bricks/verify.md`: the original repro now passes. A unit test shows a branch's behavior, not the bug's absence. If the fix is contested or risky, run `bricks/interrogate.md` alongside. Repair per `bricks/verify.md#rounds`. Two failed fixes on the same hypothesis mean the premise is wrong (`principles/attack-the-premise.md`): go back to step 3.
6. Run `bricks/ship.md`. For a repro script, put its command and before/after output in the PR body.

**Reply:** what was broken, the root cause, the fix, and the repro output before and after, verbatim.
