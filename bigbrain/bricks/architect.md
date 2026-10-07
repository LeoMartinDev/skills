# Brick: architect

Settle the shape before any code: data shape, types, signatures, and module boundaries. Produce designs, pick one, then have a fresh reviewer challenge it.

## Input

The goal, the mental model from `bricks/how.md`, and the user's decisions from `bricks/grill.md`, if any.

Before a design keeps existing data or sessions working (backward compatibility, grandfathering, a migration), establish the fact that it must: the feature is live (flag default, rollout config), or stored data already has that shape. When nothing is live, design no compatibility and record the decision.

## 1. Produce candidate designs

- **The arena gate passes** for `arena.design`: run `bricks/arena.md` with the design task. Each candidate writes one design package.
- **Otherwise**: one `designer` subagent produces one design package. Say in one line that the arena was skipped, and why.

Brief the designers with the principle files `foundational-thinking`, `model-the-domain`, `type-system-discipline`, `boundary-discipline`, `redesign-from-first-principles`, and `exhaust-the-design-space`.

## 2. Design package

Each package, at most 60 lines:

- **Data shape**: the organizing structure, named. A state machine rather than scattered booleans, a table or registry rather than branching, a typed model rather than repeated shape assumptions.
- **Sketch**: new or changed types and signatures, with their file paths. Bodies are `not implemented` or pseudocode.
- **Boundaries**: what each module owns and what it hides.
- **Call site**: how the main caller uses it, in 3 to 10 lines.
- **Rationale**: the alternatives considered and why they lost.
- **Invariants**: existing behavior and contracts that must remain true, grounded in actual callers, stored data, or user requirements. Do not invent compatibility constraints for unused surfaces.
- **Assumptions and evidence**: important safety claims, their source or proof, and any unresolved uncertainty.
- **Open choices**: distinguish major decisions (public surface, persisted data, data flow, module boundaries) from minor choices (naming, local structure, test layout). Resolve major decisions in this brick before output; only minor choices reach implementation.

## 3. Screen and pick

Reject or revise any design with:

- a shallow module, whose interface is as complex as its implementation;
- pass-through methods, or wrappers with a single caller;
- information leakage, where two modules must change together;
- temporal decomposition, split by "what runs first" instead of by knowledge;
- a new pattern where the codebase already has one that fits.

Pick the design that hides the most complexity behind the smallest public surface, and fits the existing patterns. When two tie, pick the smaller diff. With a single package, screen it and revise it.

## 4. Challenge

One read-only `reviewer`, on a different model from the designers when possible, challenges the chosen sketch. It always runs after a single designer. After an arena, it runs only when the sketch has an unresolved major decision, a new public surface, or a cross-boundary change; otherwise skip it in one line.

The reviewer gets the sketch location, mental model, invariants, and allowed paths, never the designers' reasoning. At most 15 lines: the weakest choice, one concrete failure scenario per risk, what to change, and any major decision still unresolved. Accept or reject each point in one line and revise the sketch. Record each rejected point per the Record rule in `SKILL.md`.

## Output

One settled sketch, including grafts and review fixes, invariants, sourced assumptions, and only minor open choices. The lead settles structural decisions; unresolved product decisions follow the paragraph below. If a major uncertainty needs runtime evidence, obtain a scoped temporary probe before finalizing the design, not competing production implementations.

An open choice that is a product call, because it changes what a user sees or which users or sessions get the behavior, is not yours to settle. Neither is an open question a judge or reviewer raises for product. Put them to the user in one grill round, per the Decide rule in `SKILL.md`, before implementing. Ask as soon as the pick is made: when the challenge runs, ask while it runs, never after it. The same round carries the go that `playbooks/feature.md` step 4 requires, if any. A product question raised by the challenge itself gets its own round.

If implementation proves the sketch wrong, redo this brick with that evidence. Do not patch around it.
