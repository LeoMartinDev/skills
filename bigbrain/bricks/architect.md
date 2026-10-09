# Brick: architect

Settle the shape before any code: data shape, types, signatures, and module boundaries. Produce designs, pick one, then have a fresh reviewer challenge it. Designers never write production code; return a settled design or concrete blockers to the caller.

## When to run

Only for a named open structural decision with a concrete consequence: data shape, module responsibilities, state ownership, or dependency direction that the request, grounded contracts, and an inspected precedent do not settle. Verify a missing fact with a lookup or probe before calling a decision open, and never manufacture alternatives. Size, crossing module boundaries, naming, a signature change, a function extraction, or slicing a plan never qualify alone.

Otherwise the lead writes a compact brief instead: precedent, allowed paths, intended behavior, invariants, sourced assumptions, and checks. Independent verification and review still run.

The same test applies when implementation or a repair surfaces a new decision: it revises only the affected part of the brief or sketch, keeping valid work.

## Input

The goal, the mental model from `bricks/how.md`, the user's decisions, and for maintenance the transformation brief, baseline, and preserved contracts. Reuse settled choices; propose no unrelated architecture.

Design backward compatibility (a migration, grandfathering) only for what is live: a released flag or stored data already in that shape. When nothing is, design none and record that decision. When an unclear rationale affects a choice, apply `bricks/why.md` first.

## 1. Produce candidate designs

- When `bricks/arena.md#gate` passes, run the arena. It returns a viable synthesized design or blockers.
- Otherwise one `designer` subagent produces one design package.

Brief designers with `foundational-thinking`, `model-the-domain`, `type-system-discipline`, `boundary-discipline`, `redesign-from-first-principles`, and `exhaust-the-design-space`, plus the task's core principles; maintenance commonly adds `laziness-protocol`, `follow-local-conventions`, `subtract-before-you-add`, and `minimize-reader-load`.

## 2. Design package

At most 60 lines:

- **Data shape**: the organizing structure, named: a state machine rather than scattered booleans, a table rather than branching, a typed model rather than repeated shape assumptions.
- **Sketch**: new or changed types and signatures with their paths; bodies are pseudocode.
- **Boundaries**: what each module owns and hides.
- **Call site**: how the main caller uses it, in 3 to 10 lines.
- **Rationale**: the alternatives considered and why they lost.
- **Invariants**: existing behavior that must remain true, grounded in actual callers, stored data, or requirements.
- **Assumptions and evidence**: safety claims with their source or proof.
- **Open choices**: only minor ones (naming, local structure, test layout); major ones (public surface, persisted data, data flow, boundaries) are resolved here.

## 3. Screen and pick

Reject or revise a design with a principle, criterion, or contract violation; a shallow module whose interface is as complex as its implementation; pass-through methods or one-caller wrappers; two modules that must change together; a split by "what runs first" instead of by knowledge; or a new pattern where the codebase has one.

Pick the design that hides the most complexity behind the smallest public surface and fits existing patterns; on a tie, the smaller diff. For blockers or an unsupported major choice, allow one targeted lookup and revision; if still unsupported, return blockers, never a violating sketch.

## 4. Challenge

One read-only `reviewer`, on a different model from the designers when possible, challenges the sketch. It always runs after a single designer; after an arena, only for an unresolved major decision, a new public surface, or a cross-boundary change.

It gets the sketch, mental model, invariants, allowed paths, and principle files, never the designers' reasoning, and returns at most 15 lines: the weakest choice, a concrete failure scenario per risk, and what to change. Accept or reject each point in one line and revise the sketch.

## Output

One settled sketch with invariants, sourced assumptions, and only minor open choices, or concrete blockers. Product preferences or scope extensions raised along the way go to the user in one grill round before dependent work.
