# Principle: subtract before you add

**When**: sequencing an addition, a refactor, or a rewrite.

**Rule**: remove dead weight first, then build on the simpler base.

## Do
- Delete dead code, unused exports, redundant validation, and stale flags in the area you are about to change.
- Land the removal as its own commit, verified, before the addition.
- Simplify a convoluted path before extending it.

## Don't
- Add a new path next to a dead one "to clean up later".
- Mix deletions and new behavior in one commit, which makes both hard to review.

## Check
- Is there code in the touched area that nothing reaches? Remove it first.
- Would the addition be smaller on a cleaned base?
