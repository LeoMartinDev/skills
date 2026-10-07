# Principle: guard the context window

**When**: large reads, long outputs, repeated file reads, or planning a fan-out.

**Rule**: route bulk work to subagents. The main thread keeps decisions and short summaries, never raw payloads.

## Do
- Send exploration, implementation, verification, and review to subagents with a short return format.
- Ask for pointers (`path:line`) and verbatim excerpts of the relevant lines, not whole files.
- Read a file yourself only for a targeted check, such as confirming a blocker.
- Pass summaries forward. Do not re-read what you already summarized.

## Don't
- Paste whole files, long diffs, or full logs into the main thread.
- Run the same broad search twice.

## Check
- Is what you are about to read needed for a decision? If not, delegate it.
