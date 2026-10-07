# Brick: verify

Prove the change works on the real artifact. A `verifier` subagent does it, fresh on the first round. It never sees the implementer's reasoning, only the goal, the success criteria, and where the diff lives.

## Brief

Use `references/subagent-brief.md`, role `verifier`, with the principle file `prove-it-works`. Include:

- the goal, as the behavior a user observes;
- the success criteria from the implementer's brief;
- the invariants from grounding/design, with source pointers; verify preservation independently of implementation claims;
- the ticket items, verbatim, per the Ticket items rule in `SKILL.md`;
- the branch or worktree path;
- the entry point to drive (route, command, job, tool), never a function behind it;
- for a bugfix, the original repro command and its failing output.

The verifier may write only temporary files outside the repo. It fixes nothing.

## Checks, in order

1. **Find the commands.** Package scripts, Makefile, CI config, the repo's agent docs. Prefer the commands CI runs.
2. **Static.** Lint and typecheck on the smallest useful scope (changed package or files).
3. **Tests.** Run the tests covering the changed code, and any tests added by the change. When cheap, check that a new test fails without the change: in a temporary worktree at the commit before the change (`git worktree add /tmp/bigbrain-verify <base-sha>`), copy in the new test and run it. Then remove that worktree.
4. **Real run**, when cheap: drive the entry point the way a user does, through its production wiring (DI, providers, registry, config): a local HTTP request, a CLI invocation, a script that boots the app, or a browser if the harness has one. For a bugfix, rerun the original repro. Calling the functions behind the entry point is not a real run. Whatever cannot run this way is `unverified: wiring because <why>`.
5. **Derived checks.** From the goal alone, the verifier names 1 to 3 cases the tests may miss (an edge input, an empty state, an error path) and runs them when cheap.

## Report

At most 30 lines:

- A verdict per check, ticket item, and relevant invariant: `PASS`, `FAIL`, or `INCONCLUSIVE`, with the exact command and tested commit.
- Verbatim output, trimmed to the lines that prove the verdict.
- On `FAIL`: counterexamples (input, expected, actual). These alone go back to the implementer.
- `unverified: <what> because <why>` for anything that could not run.

## Rounds

On `FAIL`, send only the counterexamples back to the implementer (see `references/subagent-brief.md#continuing`), then verify again.

A re-verification checks the fix round and its affected behaviors and invariants. Continue the same verifier, or give a fresh one the previous report and proof script paths. It reruns its proof scripts, adds a case per counterexample and applied finding, reruns covering tests, and static checks on the changed package. Earlier verdicts remain evidence only for their recorded commit and scope; shared code, wiring, base, or design changes require affected checks to rerun. Every fix costs one round of `verify.max-rounds`, a single counter for the flow, preserved on resume. Out of rounds before shipping: the implementer restores a previously passing result only if it still meets every required criterion, then verify that result before shipping and list unapplied optional fixes. Otherwise stop. After a PR is pushed, leave failed repairs unpushed and report the blocker; never rewrite pushed history to restore a checkpoint.

## Rules

- Any comparison with the base (a pre-existing error, a baseline count, a test that must fail) runs in a temporary worktree at the base, as in step 3. Never through `git stash` or a checkout in the user's tree.
- An inconclusive check, or a check run on the wrong surface, is not a pass. Say so.
- "It compiles" and "the tests I wrote pass" are not enough when a real run is cheap.
- The lead re-reads every verdict with its exact command, and reruns one targeted check where a verdict lacks its evidence or the ticket's core behavior stays unverified.
- The unverified items go into the final reply as they are, and into the PR body per `bricks/ship.md#pr-body`.
