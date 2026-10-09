# Brick: architect

**Design before implementing.** Settle the shape (data, types, signatures, module boundaries) before any code, pick one design, and have a fresh reviewer attack it. Return a settled design or concrete blockers to the caller.

## When to run

Run it for a named structural decision that the request, the contracts, and an existing precedent don't settle: data shape, module responsibilities, state ownership, or dependency direction. Check a missing fact with a lookup before calling a decision open, and never invent alternatives. Size, naming, a signature change, or an extraction alone don't qualify.

Otherwise write a compact brief: precedent, allowed paths, intended behavior, invariants, sourced assumptions, and checks. Verification still runs.

If implementation or a repair opens a new decision later, apply the same test and revise only the affected part.

## 1. Design

Start from the goal, the mental model from `bricks/how.md`, the user's decisions, and for a refactor the target shape, baseline, and contracts. When an unclear reason affects a choice, run `bricks/why.md` first.

- When `bricks/arena.md#gate` passes, run the arena. It returns a synthesized design or blockers.
- Otherwise one `designer` writes a design package per `references/prompts/designer.md`.

Designers read `foundational-thinking`, `model-the-domain`, `type-system-discipline`, `boundary-discipline`, `redesign-from-first-principles`, and `exhaust-the-design-space`, plus the task's core principles. A refactor usually adds `laziness-protocol`, `follow-local-conventions`, `subtract-before-you-add`, and `minimize-reader-load`.

## 2. Screen and pick

Read each design in full and screen it against `references/prompts/designer.md#red-flags`. Pick the one that hides the most complexity behind the smallest public surface and fits existing patterns; on a tie, the smaller diff. If a major choice stays unsupported after one targeted lookup and revision, return blockers, never a flawed sketch.

## 3. Challenge

A read-only `reviewer`, on a different model from the designers when possible, attacks the sketch. It always runs after a single designer; after an arena, only for an open major decision, a new public surface, or a cross-boundary change. It gets the sketch, mental model, invariants, allowed paths, and principle files, never the designers' reasoning, and returns 15 lines at most: the weakest choice, a concrete failure scenario per risk, and what to change. Accept or reject each point in one line and revise.

## Output

One settled sketch with invariants, sourced assumptions, and only minor open choices, or concrete blockers. Product or scope questions raised on the way go to the user in one grill round before dependent work.
