# Principle: type system discipline

**When**: designing types or signatures, in any typed language.

**Rule**: make illegal states unrepresentable, and never lie to the compiler.

## Do
- Use discriminated unions for variants, and handle every case exhaustively.
- Brand or wrap primitives that carry meaning (an id, an amount in cents, an email).
- Derive types from the authoritative schema (database, API contract) instead of retyping them.
- Parse external data into types at the boundary.

## Don't
- Use `any`, unchecked casts, or non-null assertions to silence an error.
- Model variants as one object with many optional fields.
- Widen a type to make a call compile.

## Check
- Does the type allow a value the domain forbids? Tighten it.
- Would adding a variant make the compiler point at every place to update?
