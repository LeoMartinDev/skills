# Principle: redesign from first principles

**When**: a new requirement meets an existing design.

**Rule**: redesign as if the requirement had been known from day one, then take the shortest path to that design. Do not bolt it onto the side.

## Do
- Ask: "if we were writing this today with this requirement, what would the shape be?"
- Compare that shape with the current one. Change what differs, even if it touches more code.
- When grafting ideas from arena candidates, fold them into one coherent model.

## Don't
- Add a special case, a flag, or an `if (newThing)` branch that the rest of the design does not know about.
- Keep two parallel paths for the old and the new behavior.

## Check
- Would a new reader guess this requirement was added later? If yes, it was bolted on.
