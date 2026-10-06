# Principle: fix root causes

**When**: debugging.

**Rule**: reproduce first, then trace the symptom to its cause and fix it there.

## Do
- Get a failing repro before touching the code.
- Ask "why" until the answer is a mechanism you can point at in the code.
- Confirm the mechanism with runtime evidence (logs, instrumentation, a test), not by reasoning alone.
- Fix at the origin of the bad state, not where it surfaces.

## Don't
- Add a null check, a `try/catch`, a retry, or a default value that makes the crash go away.
- Ship a change "that might help" with no evidence it addresses the cause.
- Keep speculative changes after the real cause is found.

## Check
- Can you explain, step by step, how the bad state is produced?
- Does the fix make that step impossible, rather than hiding its effect?
