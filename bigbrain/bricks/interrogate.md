# Brick: interrogate

**Attack the change before anyone else does.** Two reviewers challenge a diff from distinct angles, and you synthesize a verdict. Nothing is applied automatically.

## 1. Scope

Review the diff on the change reference (`bricks/ship.md#change-reference`). In the critique route, resolve it from the named PR, branch, or paths. For a PR, use its current head and base; never assume the local checkout matches.

## 2. Intent

Write one paragraph on what the change is meant to do, from the task, the commits, and the PR body. In the critique route, if the intent is unclear, ask the user one question first.

## 3. Reviewers

Two read-only `reviewer`s, launched together on distinct models when possible, each pointed to `references/prompts/reviewer.md`. Reviewer 1 takes angles A and C; reviewer 2 takes angle B. Each brief carries the intent, the change reference, where the source and diff live (not the diff itself), the criteria, the invariants, and its angles.

## 4. Synthesize

Merge duplicates and rank by severity and evidence. Agreement counts only where both reviewers covered the same ground. Check each blocker yourself with one targeted read before accepting it, and do the same before rejecting a finding on a factual claim ("already handled", "out of scope"). Accept or reject each finding with a one-line reason, and note the reviewed head and base and any coverage gaps.

- **In a use case:** return findings and dispositions to the caller, which repairs per `bricks/verify.md#rounds`. A `should` whose fix adds more than about 30 lines needs a failure scenario in normal use; otherwise it stays unapplied and goes in the PR body.
- **In the critique route:** present the accepted findings, most severe first, then the rejected ones with their reasons. Apply nothing unless the user asks.
