# Principle: model the domain

**When**: writing stateful logic, or code that branches a lot or repeats the same shape assumption across files.

**Rule**: encode the domain in a structure the code follows, not in conditionals scattered around.

## Do
- Model lifecycles as a state machine with named states and allowed transitions, not as a set of booleans.
- Replace a long `if`/`switch` over kinds with a table or registry keyed by kind.
- Give a concept that appears in several places one typed model, with one home.
- Use the domain's own words for names.

## Don't
- Let `isX && !isY` combinations stand in for states.
- Re-derive the same fact in several places from raw fields.

## Check
- Can an impossible combination of flags occur? Make it unrepresentable.
- Adding a new kind: is it one entry in one place, or edits in many files?
