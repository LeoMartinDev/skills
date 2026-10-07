# Principle: sequence verifiable units

**When**: multi-step work (several similar edits, a migration, a plan), and when ordering commits and PRs.

**Rule**: cut the work into small units that each end in a verifiable state. Check each one before starting the next, and order them so the sequence proves itself to a reviewer.

## Do
- End each commit with a passing check: build, test, or run.
- Order commits as a story: removal, then scaffold, then behavior, then polish. For a bug: the failing test, then the fix.
- Cut plans into vertical slices, each one working end to end.

## Don't
- Stack five unverified edits and debug them together.
- Slice by layer ("all the backend, then all the frontend").
- Make a commit that leaves the branch broken. The one exception is a bug's repro test, committed just before its fix: the pair is the unit.

## Check
- If work stopped after any commit, would the branch still build and pass?
