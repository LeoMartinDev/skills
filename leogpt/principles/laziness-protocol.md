# Principle: laziness protocol

**When**: sizing a diff, or tempted to add an abstraction, a layer, an option, or a parameter threaded through calls.

**Rule**: ship the smallest change that fully solves the problem. Deleting beats adding.

## Do
- Reuse what the codebase already has before writing anything new.
- Inline a helper that has one caller.
- Solve today's requirement. A second real use case justifies a generalization; a hypothetical one does not.
- Prefer changing one place over threading a flag through five.

## Don't
- Add configuration nobody asked for.
- Keep a compatibility shim "just in case".
- Refactor neighboring code in a feature or bug PR.

## Check
- Could the diff be half as large and still meet every success criterion?
- Does every new name (function, type, file) earn its place?
