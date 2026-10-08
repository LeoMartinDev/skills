# Brick: verify

Prove the change works on the real artifact. A `verifier` subagent does it, fresh on the first round. It never sees the implementer's reasoning, only the goal, the success criteria, and where the diff lives.

## Brief

Use `references/subagent-brief.md`, role `verifier`, with the principle file `prove-it-works`. Include:

- the goal, as observable behavior or a concrete maintenance outcome;
- the success criteria from the implementer's brief;
- the invariants from grounding/design, with source pointers; verify preservation independently of implementation claims;
- the ticket items, verbatim, per the Ticket items rule in `SKILL.md`;
- the branch or worktree path and change reference per `references/run-state.md#change-reference`;
- the obligatory repo/CI checks for this scope, including the full suite when required;
- the entry point to drive (route, command, job, tool), never a function behind it;
- for a bugfix, the symptom entry point, original repro command, and its failing output;
- for maintenance, the baseline commands, results, and pre-existing failures, plus the affected contracts and entry points to compare or exercise.

The verifier fixes nothing; temporary proof writes and a unique isolated base worktree follow `references/subagent-brief.md#rules` and `references/run-state.md#working-artifacts`.

## Checks, in order

1. **Confirm source and commands.** Independently confirm the tested source matches the recorded head commit; unexplained local edits are a gap. Find commands in package scripts, Makefile, CI config, and the repo's agent docs; add any obligatory check omitted from the brief.
2. **Static.** Run obligatory lint, typecheck, or document/configuration validation; use the smallest useful scope only where the repo/CI permits it.
3. **Tests.** Run the obligatory tests, tests covering changed code, and tests added by the change. For new behavior or a bugfix, when cheap, check that a new test fails without the change: use a unique isolated proof worktree at the recorded base commit, copy in the new test, run it, and remove that worktree per the shared scope rules. Refactor characterization tests should pass before and after; compare the same cases and expected outputs on both versions. For chores, check the requested operational outcome and unrelated contracts. A pre-existing failure does not prove preservation; identify any remaining verification gap.
4. **Real run**, when cheap: drive the entry point the way a user does, through its production wiring (DI, providers, registry, config): a local HTTP request, a CLI invocation, a script that boots the app, or a browser if the harness has one. For a bugfix, rerun the original repro and exercise the symptom's same surface when cheap; report a gap if the repro bypasses it. For a chore, exercise the changed tool, build, configuration, or document as applicable; do not invent an application entry point. Calling the functions behind an affected entry point is not a real run. Whatever cannot run through its affected wiring is `unverified: wiring because <why>`.
5. **Derived checks.** From the goal alone, the verifier names 1 to 3 cases the tests may miss (an edge input, an empty state, an error path) and runs them when cheap.

## Report

At most 30 lines:

- A verdict per check, ticket item, and relevant invariant: `PASS`, `FAIL`, or `INCONCLUSIVE`, with the exact command and tested commit.
- Verbatim output, trimmed to the lines that prove the verdict.
- On `FAIL`: counterexamples (input, expected, actual), returned with the verdicts to the caller.
- `unverified: <what> because <why>` for anything that could not run.

## Rounds

The caller owns repairs: wait for verification and any concurrent review on the fixed change reference, then send counterexamples and accepted findings in one batch through `bricks/implement.md` (see `references/subagent-brief.md#continuing`). The verifier returns its report and never triggers repairs. The caller charges each repair batch once to the flow's `verify.max-rounds` counter, checkpoints the new head, and requests re-verification; request a fresh review only for material scope or design changes.

A re-verification checks the fix round and its affected behaviors and invariants. Continue the same verifier, or give a fresh one the previous report and proof script paths. It reruns its proof scripts, adds a case per counterexample and applied finding, reruns covering tests, and static checks on the changed package, plus any obligatory checks required on the new head. Earlier verdicts remain evidence only for their recorded commit and scope; shared code, wiring, base, or design changes require affected checks to rerun. Preserve the single counter on resume. Out of rounds before shipping: the caller may have the implementer restore a previously passing result only if it still meets every required criterion, then verify that result before shipping and list unapplied optional fixes. Otherwise stop. After a PR is pushed, leave failed repairs unpushed and report the blocker; never rewrite pushed history to restore a checkpoint.

## Rules

- Any comparison with the base (a pre-existing error, a baseline count, a test that must fail) runs in a temporary worktree at the base, as in step 3. Never through `git stash` or a checkout in the user's tree.
- An inconclusive check, or a check run on the wrong surface, is not a pass. Say so.
- "It compiles" and "the tests I wrote pass" are not enough when a real run is cheap.
- The lead re-reads every verdict with its exact command, and reruns one targeted check where a verdict lacks its evidence or the ticket's core behavior stays unverified.
- The unverified items go into the final reply as they are, and into the PR body per `bricks/ship.md#pr-body`.
