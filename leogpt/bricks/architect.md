# Brick: architect

Settle the shape before any code: data shape, types, signatures, and module boundaries. Always compare at least two structurally distinct designs, not variations of one.

## Input

The goal, the mental model from `bricks/how.md`, and the user's decisions from `bricks/grill.md`, if any.

## 1. Produce candidate designs

- **Arena gate passes** for `arena.design` and `arena.design` is `auto`: run `bricks/arena.md` with the design task. Each candidate writes one design package.
- **Otherwise**: one `designer` subagent produces two structurally distinct design packages and states which it prefers. Say in one line that the arena was skipped, and why.

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

Pick the design that hides the most complexity behind the smallest public surface, and fits the existing patterns. When two tie, pick the smaller diff.

## Output

One sketch, the chosen package plus any grafts, and its open choices. The open choices decide whether the implementation goes to an arena (see `playbooks/feature.md`).

If implementation proves the sketch wrong, redo this brick with that evidence. Do not patch around it.
