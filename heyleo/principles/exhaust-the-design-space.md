# Principle: exhaust the design space

**When**: a new interaction or architectural decision with no precedent in the codebase.

**Rule**: compare 2 or 3 structurally different shapes before committing to one.

## Do
- Make the alternatives differ in structure (where the state lives, who owns what), not only in details.
- Compare them on the same criteria: diff size, public surface, fit with existing patterns, and future change.
- Use an arena when the arena gate allows it. Otherwise, one designer writes the design and a fresh reviewer attacks it.

## Don't
- Commit to the first shape that works.
- Present "alternatives" that are the same design with renamed parts.

## Check
- Can you say in one sentence why each rejected design lost?
