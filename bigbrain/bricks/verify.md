# Brick: verify

Prove the change works on the real artifact. A `verifier` subagent does it: it sees the goal, criteria, and where the diff lives, never the implementer's reasoning. It fixes nothing and writes only its report and proof files.

## Brief

Role `verifier`, principle file `prove-it-works`. Include the goal; the criteria with the ticket items verbatim; the invariants with source pointers; the branch and change reference (`bricks/ship.md#change-reference`); the repo's obligatory checks; and the entry point to drive (route, command, job, tool), never a function behind it. A bugfix adds the original repro command and its failing output; maintenance adds the baseline results and pre-existing failures.

## Checks, in order

1. **Source and commands.** Confirm the tested source is the head commit. Find the obligatory checks in package scripts, Makefile, CI config, and agent docs, adding any the brief missed.
2. **Static.** Run lint, typecheck, or configuration validation as the repo requires.
3. **Tests.** Run the obligatory tests, those covering changed code, and those added. For new behavior or a bugfix, check when cheap that a new test fails at the base. A refactor's characterization tests pass before and after on the same cases. A pre-existing failure proves nothing about preservation.
4. **Real run**, when cheap: drive the entry point the way a user does, through its production wiring: an HTTP request, a CLI invocation, a script that boots the app, a browser. For a bugfix, rerun the original repro on the symptom's surface; for a chore, exercise the changed tool, build, or configuration. Calling the functions behind an entry point is not a real run; what cannot run through its wiring is `unverified: wiring because <why>`.
5. **Derived checks.** From the goal alone, name 1 to 3 cases the tests may miss (edge input, empty state, error path) and run them when cheap.

Any comparison with the base runs in a unique worktree in the scratch directory at `baseCommit`, removed afterwards; never through `git stash` or a checkout in the user's tree.

## Report

At most 30 lines: per criterion and check, `PASS`, `FAIL`, or `INCONCLUSIVE` with the exact command, the tested commit, and the output lines that prove it; on `FAIL`, counterexamples (input, expected, actual); `unverified: <what> because <why>` for anything that could not run. An inconclusive check, or one run on the wrong surface, is not a pass.

## Rounds

The caller waits for verification and any concurrent review on the same change reference, then sends counterexamples and accepted findings in one batch through `bricks/implement.md`, and repeats while each round brings something new (the Loops rule in `SKILL.md`). A required `INCONCLUSIVE` gets a targeted probe or an explicit blocker, never a speculative code change. A material scope or design change also needs a fresh review.

Re-verification continues the same verifier, or gives a fresh one the previous report: it reruns its proofs, adds a case per counterexample and applied finding, and reruns covering tests and obligatory checks on the new head. Earlier verdicts count only for their commit.

The lead re-reads every verdict with its command, and reruns one targeted check where evidence is missing or the core behavior stays unverified.

## Delivery gate

The single definition of done.

- Every criterion and check is required unless marked `optional`. Ticket items, the requested outcome, preserved contracts, and the repo's obligatory checks are always required. An optional check that reveals a broken required behavior is a required failure.
- A flow is complete, and may ship, only when every required item has `PASS` evidence on the current change reference and no accepted blocking finding remains. `FAIL`, `INCONCLUSIVE`, missing, or stale evidence blocks; `unverified` discloses a gap but never waives it. Optional gaps stay visible without blocking.
- On a required gap, keep the local work and report `blocked` with the missing proof and next action; `finish` never waives this. Only the user can drop a required item, recorded with its residual risk.
- Every `unverified` item appears in the final reply and the PR body.
