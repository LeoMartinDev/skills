# Principle: migrate callers, then delete legacy APIs

**When**: introducing an internal API that replaces an old one while old callers still exist.

**Rule**: migrate every caller and delete the old API in the same wave. Do not keep both alive behind a compatibility layer.

## Do
- List every caller first, with a search that a reviewer can rerun.
- Migrate them all, then delete the old API and its tests.
- For persisted data or external consumers, use expand, migrate, contract across releases. That case is the exception, not the default.

## Don't
- Leave the old API "deprecated" with no removal date.
- Add an adapter so old callers keep working unchanged.

## Check
- After the change, does anything still reference the old name?
