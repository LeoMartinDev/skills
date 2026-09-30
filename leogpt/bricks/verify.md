# Brick: verify

Prove the change works on the real artifact. A `verifier` subagent does it, fresh on the first round. It never sees the implementer's reasoning, only the goal, the success criteria, and where the diff lives.

## Brief

Use `references/subagent-brief.md`, role `verifier`, with the principle file `prove-it-works`. Include:

- the goal, as the behavior a user observes;
- the success criteria from the implementer's brief;
- the ticket items, verbatim, per the Ticket items rule in `SKILL.md`;
- the branch or worktree path;
- the entry point to drive (route, command, job, tool), never a function behind it;
- for a bugfix, the original repro command and its failing output.

The verifier may write only temporary files outside the repo. It fixes nothing.

## Checks, in order

1. **Find the commands.** Package scripts, Makefile, CI config, the repo's agent docs. Prefer the commands CI runs.
2. **Static.** Lint and typecheck on the smallest useful scope (changed package or files).
3. **Tests.** Run the tests covering the changed code, and any tests added by the change. When cheap, check that a new test fails without the change: in a temporary worktree at the commit before the change (`git worktree add /tmp/leogpt-verify <base-sha>`), copy in the new test and run it. Then remove that worktree.
4. **Real run**, when cheap: drive the entry point the way a user does, through its production wiring (DI, providers, registry, config): a local HTTP request, a CLI invocation, a script that boots the app, or a browser if the harness has one. For a bugfix, rerun the original repro. Calling the functions behind the entry point is not a real run. Whatever cannot run this way is `unverified: wiring because <why>`.
5. **Derived checks.** From the goal alone, the verifier names 1 to 3 cases the tests may miss (an edge input, an empty state, an error path) and runs them when cheap.

## Report

At most 30 lines:

- A verdict per check, and one per ticket item: `PASS`, `FAIL`, or `INCONCLUSIVE`, with the exact command.
- Verbatim output, trimmed to the lines that prove the verdict.
- On `FAIL`: counterexamples (input, expected, actual). These alone go back to the implementer.
- `unverified: <what> because <why>` for anything that could not run.

## Rounds

On `FAIL`, send only the counterexamples back to the implementer (see `references/subagent-brief.md#continuing`), then verify again.

A re-verification checks the fix round only. Continue the same verifier, or give a fresh one the previous report and its proof script paths. It reruns its proof scripts, adds a case per counterexample and per applied finding, reruns the tests covering the files the round changed, and the static checks on their package. Everything else keeps its previous verdict. Every fix, from counterexamples or review findings, costs one round of `verify.max-rounds`, a single counter for the whole run. Out of rounds: revert to the last commit that passed, ship it, and list in the PR body what it leaves unapplied. When no commit passed, stop per the Stuck rule in `SKILL.md`.

## Rules

- Any comparison with the base (a pre-existing error, a baseline count, a test that must fail) runs in a temporary worktree at the base, as in step 3. Never through `git stash` or a checkout in the user's tree.
- An inconclusive check, or a check run on the wrong surface, is not a pass. Say so.
- "It compiles" and "the tests I wrote pass" are not enough when a real run is cheap.
- The lead re-reads every verdict with its exact command, and reruns one targeted check where a verdict lacks its evidence or the ticket's core behavior stays unverified.
- The unverified items go into the final reply as they are, and into the PR body per `bricks/ship.md#pr-body`.
