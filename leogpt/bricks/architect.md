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
- **Open choices**: what the sketch leaves to the implementation. Tag each one `major` if it changes the public surface or the data flow, and `minor` otherwise (naming, local structure, test layout).

## 3. Screen and pick

Reject or revise any design with:

- a shallow module, whose interface is as complex as its implementation;
- pass-through methods, or wrappers with a single caller;
- information leakage, where two modules must change together;
- temporal decomposition, split by "what runs first" instead of by knowledge;
- a new pattern where the codebase already has one that fits.

Pick the design that hides the most complexity behind the smallest public surface, and fits the existing patterns. When two tie, pick the smaller diff. With a single package, screen it and revise it.

## 4. Challenge

One read-only `reviewer`, on a different model from the designers when possible, challenges the chosen sketch. It always runs after a single designer. After an arena, it runs only when the sketch has a `major` open choice, a new public surface, or a cross-boundary change; otherwise skip it in one line.

The reviewer gets the sketch location, the mental model, and the allowed paths, never the designers' reasoning. At most 15 lines: the weakest choice, one concrete failure scenario per risk, what to change, and whether each `major`/`minor` tag is right. Accept or reject each point in one line and revise the sketch. Record each rejected point per the Record rule in `SKILL.md`.

## Output

One sketch, the chosen package plus any grafts and review fixes, and its open choices. The open choices decide whether the implementation goes to an arena (see `playbooks/feature.md`).

An open choice that is a product call, because it changes what a user sees or which users or sessions get the behavior, is not yours to settle. Neither is an open question a judge or reviewer raises for product. Put them to the user in one grill round, per the Decide rule in `SKILL.md`, before implementing.

If implementation proves the sketch wrong, redo this brick with that evidence. Do not patch around it.
