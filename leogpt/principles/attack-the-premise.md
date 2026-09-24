# Principle: attack the premise

**When**: two or more fixes built on the same assumption have failed the same check.

**Rule**: stop writing fixes. The shared assumption is the likely bug. Question it before trying again.

## Do
- Write down the premise every failed fix relied on.
- List every actor that touches the failing state (callers, jobs, caches, other services) and what each one assumes.
- Look for evidence that directly tests the premise, not the next fix.
- Revert what the refuted premise motivated.

## Don't
- Stack a third fix on the same assumption.
- Widen timeouts, add retries, or add guards to push past the symptom.

## Check
- If the premise were false, would all the failures make sense?
