# Subagent brief

Every delegation uses this template. A subagent starts with no context: the brief is its whole world. Fill every section, drop none.

```markdown
## Role
<explorer | designer | implementer | verifier | reviewer | judge | arena candidate>. <One sentence on what you produce.>

## Goal
<The outcome, in one or two sentences. For code: the behavior a user observes when you are done.>

## Grounding
<Only what this subagent needs: the lead's mental model (<= 20 lines), file pointers, the chosen sketch, conventions, test commands. Paths, not pasted code.>

## Scope
- Allowed to write: <paths or globs, or "nothing, read-only">.
- Out of scope: <what not to touch or decide>.

## Principles to read first
<Absolute paths, e.g. <skill-dir>/principles/model-the-domain.md.>

## Success criteria
<Checkable statements. For code: the commands that must pass.>

## Return format
<= 30 lines unless told otherwise:
- Result: <done | blocked | partial> and one line why.
- Pointers: <paths and symbols touched or found>.
- Decisions: <choice, alternatives, why>, one line each.
- Evidence: <commands run and their verbatim output, trimmed to the relevant lines>.
- Open questions: <only what you could not settle yourself>.
Never paste whole files or long diffs. The lead reads the diff itself if needed.
```

## Rules

- Give absolute paths to the skill files the subagent must read, since its working directory is the repo.
- One subagent, one role. A verifier never sees the implementer's reasoning, only the goal, the diff location, and the success criteria.
- Independent subagents launch together, in parallel, when the harness allows it.
- A returned report that breaks the format gets one retry with the format restated, then the lead extracts what it needs.

## Continuing

To send follow-up work (counterexamples, review findings) to a subagent that already returned, continue that same subagent if the harness allows it (section 1 of its file). Otherwise, spawn a fresh one of the same role with the original brief, a note on the current branch state, and the follow-up only.
