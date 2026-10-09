# Brick: verify

Prove the change works on the real artifact. A `verifier` subagent does it, fresh on the first round. It never sees the implementer's reasoning, only the goal, the success criteria, and where the diff lives.

## Brief

Use `references/subagent-brief.md`, role `verifier`, with the principle file `prove-it-works`. Include:

- the goal, as observable behavior or a concrete maintenance outcome;
- the success criteria and check classifications from the implementer's brief, per Delivery gate below;
- the invariants from grounding/design, with source pointers; verify preservation independently of implementation claims;
- the ticket items, verbatim, per the Ticket items rule in `SKILL.md`;
- the branch or worktree path and change reference per `references/run-state.md#change-reference`;
- the obligatory repo/CI checks for this scope, including the full suite when required;
- the entry point to drive (route, command, job, tool), never a function behind it;
- for a bugfix, the symptom entry point, original repro command, and its failing output;
- for maintenance, the baseline commands, results, and pre-existing failures, plus the affected contracts and entry points to compare or exercise.

The verifier fixes nothing; it writes only its report and proof files, per `references/subagent-brief.md#rules`.

## Checks, in order

1. **Confirm source and commands.** Confirm the tested source is the recorded head commit. Find commands in package scripts, Makefile, CI config, and the repo's agent docs; add any obligatory check omitted from the brief.
2. **Static.** Run obligatory lint, typecheck, or document/configuration validation; use the smallest useful scope only where the repo/CI permits it.
3. **Tests.** Run the obligatory tests, tests covering changed code, and tests added by the change. For new behavior or a bugfix, when cheap, check that a new test fails at the base commit (see Rules). Refactor characterization tests should pass before and after; compare the same cases and expected outputs on both versions. For chores, check the requested operational outcome and unrelated contracts. A pre-existing failure does not prove preservation; identify any remaining verification gap.
4. **Real run**, when cheap: drive the entry point the way a user does, through its production wiring (DI, providers, registry, config): a local HTTP request, a CLI invocation, a script that boots the app, or a browser if the harness has one. For a bugfix, rerun the original repro and exercise the symptom's same surface when cheap; report a gap if the repro bypasses it. For a chore, exercise the changed tool, build, configuration, or document as applicable; do not invent an application entry point. Calling the functions behind an affected entry point is not a real run. Whatever cannot run through its affected wiring is `unverified: wiring because <why>`.
5. **Derived checks.** From the goal alone, the verifier names 1 to 3 cases the tests may miss (an edge input, an empty state, an error path) and runs them when cheap.

## Report

At most 30 lines:

- A verdict per check, ticket item, and relevant invariant: `required` or `supplementary`, then `PASS`, `FAIL`, or `INCONCLUSIVE`, with the exact command and tested change reference.
- Verbatim output, trimmed to the lines that prove the verdict.
- On `FAIL`: counterexamples (input, expected, actual), returned with the verdicts to the caller.
- `unverified: <what> because <why>` for anything that could not run.

## Rounds

The verifier only reports. The caller waits for verification and any concurrent review on the fixed change reference, then sends counterexamples and accepted findings in one batch through `bricks/implement.md` (see `references/subagent-brief.md#continuing`), charged per `references/loop-control.md`. It checkpoints the new head and requests re-verification; a fresh review only for material scope or design changes. A required `INCONCLUSIVE` calls for a targeted evidence probe or an explicit blocker, never a speculative code repair.

A re-verification checks the fix and its affected behaviors and invariants. Continue the same verifier, or give a fresh one the previous report and proof script paths. It reruns its proof scripts, adds a case per counterexample and applied finding, and reruns covering tests, static checks on the changed package, and obligatory checks on the new head. Earlier verdicts count only for their recorded commit and scope.

Out of rounds before shipping: the implementer may restore a previously passing result only if it meets every required criterion; verify it before shipping and list unapplied optional fixes. Otherwise stop. After a push, failed repairs stay unpushed; never rewrite pushed history.

## Delivery gate

The single definition of done; other files point here.

- Criteria and checks are classified in the brief before implementation, `required` unless marked `supplementary`. Ticket items, the requested outcome, preserved contracts, and obligatory repo/CI checks are always required, whatever their cost. A supplementary check that reveals a broken required behavior is a required failure.
- A flow is complete, and ship may deliver, only when every required item has `PASS` evidence for the current change reference and scope, and no required review finding is unresolved. `FAIL`, `INCONCLUSIVE`, missing, or stale evidence blocks; `unverified` discloses a gap but never waives it. Supplementary gaps stay visible without blocking.
- On a required gap, keep local work and report `blocked` with the missing proof and next action; `finish` never waives this. Only the user can drop a required item (record it with its residual risk) or authorize publishing the unfinished change as a draft PR, which stays visibly incomplete and is never marked ready or watched.

## Rules

- Any comparison with the base (a pre-existing error, a baseline count, a test that must fail) runs in a unique worktree under the run scratch at `baseCommit`: copy the needed tests in, run them, then `git worktree remove` it. Never through `git stash` or a checkout in the user's tree.
- An inconclusive check, or a check run on the wrong surface, is not a pass. Say so.
- "It compiles" and "the tests I wrote pass" are not enough when a real run is cheap.
- The lead re-reads every verdict with its exact command, and reruns one targeted check where a verdict lacks its evidence or the ticket's core behavior stays unverified.
- The unverified items go into the final reply as they are, and into the PR body per `bricks/ship.md#pr-body`.
