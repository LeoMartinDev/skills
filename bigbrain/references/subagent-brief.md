# Subagent brief

Every delegation uses this template. A subagent starts with no context: the brief is its whole world.

```markdown
## Role
<explorer (report) | explorer (lookup) | designer | implementer | verifier | reviewer | judge | arena candidate>. <What you produce.>

## Goal
<The outcome in one or two sentences; for code, the behavior a user observes when you are done.>

## Grounding
<Only what this role needs: the lead's mental model (<= 20 lines), file pointers, the chosen sketch, conventions, test commands. Paths, not pasted code.>

## Scope
- Allowed to write: <paths, or "nothing, read-only">; your report goes to <absolute path in the scratch directory>.
- Out of scope: <what not to touch or decide>.
- Budget (writing roles): <remaining PR budget, tests included, or "no size limit">. Stop and report before crossing it.

## Read first
Read each file below in full before any other tool call: your role prompt, when the brick names one, then the principles.
<Absolute paths. For an implementer, also each file's **Rule** line and **Don't** list, verbatim.>

## Success criteria
<Checkable statements and commands; mark any optional one `optional`.>

## Invariants
<Existing behavior and contracts to preserve, with source pointers, or "None identified".>

## Return format
<= 30 lines unless told otherwise:
- Result: <done | blocked | partial> and why, in one line.
- Pointers: <paths and symbols touched or found>.
- Decisions: <choice, alternatives, why>, one line each.
- Evidence: <commands run and their output, trimmed to the relevant lines>.
- Open questions: <only what you could not settle>.
If the same check fails twice with nothing new, stop and return `blocked` with the evidence. Never paste whole files or long diffs.
```

## Rules

- Give absolute paths to skill files: the subagent's working directory is the repo.
- A role prompt in `references/prompts/` carries the role's method and return format; it replaces the default return format above. Don't restate it in the brief.
- Inline principle text only for implementers, which may run on a fast model that never opens the files.
- One subagent, one role. A verifier never sees the implementer's reasoning.
- An explorer (report) writes a report file and may run shell commands such as `git log`; an explorer (lookup) answers a quick factual question from files or the web and writes nothing. Section 1 of the adapter maps each to an agent.
- Implementers run narrow checks; the full suite and wider checks belong to `bricks/verify.md`.
- Guardrails (lint, type, format, test, and CI config, disable comments) are never in the allowed paths unless the task is about them. When one blocks the code, change the code; if that is impossible, report it as an open question for the user.
- Independent subagents launch together when the harness allows it.
- A report that breaks the format gets one retry with the format restated; then extract what you need.

## Continuing

Send follow-up work (counterexamples, findings) to the same subagent when the adapter supports it (section 1). Otherwise spawn a fresh one of the same role with the original brief, the current branch state, and the follow-up.
