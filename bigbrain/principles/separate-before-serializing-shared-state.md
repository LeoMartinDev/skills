# Principle: separate before serializing shared state

**When**: concurrent actors (parallel subagents, workers, jobs, processes) might write the same file, branch, key, or state object.

**Rule**: first remove the shared write target. Serialize access only when one shared writer is a real invariant, and then enforce it structurally, not by instruction.

## Do
- List what each actor both reads and writes: files, branches, keys, APIs defined and consumed.
- Give each actor its own file, key, branch, or worktree, and merge only where results are read or reported.
- When one canonical object is truly required, serialize it with structure: sequential phases, a single writer, a lockfile, or compare-and-swap.

## Don't
- Let two workers each update "their" field of one shared state file: that is still shared mutation.
- Rely on a convention ("don't touch X") as concurrency control.
- Reach for a lock before asking whether the sharing is needed at all.

## Check
- Run the actors in any order, or at the same time: is the result the same?
- Can you name the single writer of every shared object?
