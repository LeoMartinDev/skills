# Brick: interrogate

Adversarial review of a diff. Reviewers challenge the change from distinct angles. The deliverable is a synthesized verdict. Nothing is applied automatically.

## 1. Scope

- **In a playbook**: the working branch against the default branch, `git diff <default>...HEAD`.
- **In the review route**: the PR (`gh pr diff <n>`), branch, or paths the user named.

## 2. Intent

Write one paragraph on what the change is meant to do, from the task, the commits, and the PR body. In the review route, if the intent is unclear, ask the user one question before going on.

## 3. Reviewers

Role `reviewer`, read-only. Two reviewers, on distinct models when possible. Reviewer 1 takes angles A and C, reviewer 2 takes angle B.

Angles:

- **A. Blast radius**: callers, shared state, new code that skips the wrapper its siblings use for the same data or service, data and migrations, concurrency, what breaks elsewhere. Any change to a guardrail (lint, type, test, or CI config, a disable comment) that the task did not ask for is a blocker. Prove the one fact the change's safety rests on with a cheap command, rather than asserting it.
- **B. Simplicity**: needless layers, one-caller wrappers, dead code, workaround code, comments that fail `comment-the-why`, departures from local conventions, including a file (test, doc, config) the closest siblings do not have. Principle files `laziness-protocol`, `minimize-reader-load`, `follow-local-conventions`, and `comment-the-why`.
- **C. Domain and tests**: domain modeling, types, boundaries, and whether the tests assert observable behavior. Principle files `model-the-domain`, `type-system-discipline`, and `test-behavior-not-implementation`.

Each brief carries the intent, diff location (not the diff), criteria, grounded invariants, and angles.

## 4. Findings format

One finding per line, at most 15 per reviewer:

`<blocker|should|nit> · <path:line> · <claim> · <failure scenario: input or state, then the wrong result> · <suggested fix>`

A finding with no concrete failure scenario is a nit at most.

## 5. Synthesize

Merge the duplicates. Rank findings raised by both reviewers first. Check each blocker yourself against the code, with one targeted read, before accepting it. Give the same read to any finding you would reject on a factual claim (already handled, out of scope, fixed by an existing contract) before rejecting it. Then accept or reject each finding with a one-line reason.

- **In a playbook**: send the accepted findings to the implementer, then verify again. Record each rejected blocker per the Record rule in `SKILL.md`. A `should` whose fix adds more than about 30 lines needs a failure scenario in normal use; otherwise do not apply it, and list it as unapplied in the PR body. The fixes you send stay within the Budget rule in `SKILL.md`.
- **In the review route**: present the verdict: accepted findings, most severe first, then rejected findings with their reasons. Apply nothing unless the user asks.
