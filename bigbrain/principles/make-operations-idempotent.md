# Principle: make operations idempotent

**When**: designing commands, jobs, migrations, webhooks, or loops that can crash, restart, or be retried.

**Rule**: running an operation twice, or resuming it after a partial run, reaches the same end state as running it once.

## Do
- Check the current state and converge to the target, rather than applying blind deltas.
- Use natural or idempotency keys to deduplicate retried requests and events.
- Make each step safe to rerun after a crash halfway through.

## Don't
- Increment, append, or send on every run without checking what was already done.
- Assume a job runs exactly once.

## Check
- Kill the operation halfway and rerun it: is the result correct?
- Deliver the same event twice: is anything duplicated?
