# Playbook: bugfix

A defect: wrong behavior observable today. Be scientific: every shipped line traces to runtime evidence. A change that "might help" is a hypothesis, not a fix.

Copy these steps into your todo list verbatim.

1. **Check the tree** per `bricks/ship.md#branch`.
2. **Clarify** per the clarity gate in `SKILL.md`: the observed behavior, the expected behavior, and where it happens.
3. **Ground.** Run `bricks/how.md` on the symptom's code path. Name the entry point and its wiring so the repro and verification exercise the same surface.
4. **Branch** per `bricks/ship.md#branch`.
5. **Reproduce.** One `implementer` writes the cheapest faithful repro, a failing test when a local test path exists, otherwise a script, and returns the command and its failing output verbatim. A repro test is committed as the only allowed red commit; a script stays uncommitted. If it won't reproduce, synthesize the trigger, tighten the conditions, or add temporary instrumentation; ask the user only for what you cannot reach (production data, a device). No repro, no fix.
6. **Find the root cause.** List 2 to 4 hypotheses and test them in parallel: an `explorer (report)` when code, logs, and `git log` can settle one, or an `implementer` in its own worktree when it needs temporary instrumentation, which never lands. Eliminate until one mechanism survives and confirm it against the repro. A new wave of hypotheses needs a new observation, per the Loops rule in `SKILL.md`. Principles `fix-root-causes` and `attack-the-premise`.
7. **Fix.** Apply `bricks/architect.md#when-to-run`, then run `bricks/implement.md` with the repro, the confirmed cause, and the invariants. Commit the smallest justified fix on top of the repro test. Criteria: the repro passes, the expected behavior from step 2 holds, and the ticket items hold. No guard that hides the symptom, no unrelated cleanup.
8. **Verify and review.** Launch `bricks/verify.md`, with the repro and symptom entry point, and `bricks/interrogate.md` together on the same change reference, then repair per `bricks/verify.md#rounds`. When two fixes built on the same hypothesis fail, question the premise and return to step 6.
9. **Ship** with `bricks/ship.md`; for a repro script, put its command and before/after output in the PR body.
10. **Reply** per `SKILL.md`: what was broken, the root cause, the fix, and the repro output before and after, verbatim.

When evidence refutes a hypothesis, revert everything it motivated. A unit test proves a branch's behavior, not the bug's absence: the original repro is the proof.
