# Brick: verify

**Prove it works on the real artifact, not that it compiles.** A fresh `verifier` checks the change against the goal and criteria, without the implementer's reasoning.

## Brief

Point the verifier to `references/prompts/verifier.md` and the principle `prove-it-works`. Give the goal, the criteria with the ticket items verbatim, the invariants with source pointers, the branch and change reference (`bricks/ship.md#change-reference`), the repo's obligatory checks, and the entry point to drive (route, command, job, tool), never a function behind it. A bugfix adds the original repro and its failing output; a refactor adds the baseline and pre-existing failures.

## Rounds

Wait for the verifier and any review on the same change, then send counterexamples and accepted findings to `bricks/implement.md` in one batch. Repeat while each round brings something new (the Loops rule in `SKILL.md`). A required `INCONCLUSIVE` gets a targeted probe or an explicit blocker, never a speculative code change. A material scope or design change also needs a fresh review.

Re-verification continues the same verifier, or gives a fresh one the previous report. It reruns its proofs, adds a case per counterexample and applied finding, and reruns the covering tests and obligatory checks on the new head. A verdict counts only for its commit.

Re-read every verdict with its command yourself, and rerun one targeted check where evidence is missing or the core behavior is still unverified.

## Delivery gate

The single definition of done.

- Every criterion and check is required unless marked `optional`. Ticket items, the requested outcome, preserved contracts, and the repo's obligatory checks are always required. An optional check that exposes a broken required behavior is a required failure.
- Ship only when every required item has `PASS` evidence on the current change reference and no accepted blocking finding remains. `FAIL`, `INCONCLUSIVE`, missing, or stale evidence blocks. `unverified` discloses a gap; it never waives one.
- On a required gap, keep the local work, don't push, and report `blocked` with the missing proof and the next action. Only the user can drop a required item, and it is recorded with its residual risk.
- Every `unverified` item appears in the final reply and the PR body.
