# Subagent brief

Every delegation uses this template. A subagent starts with no context: the brief is its whole world. Fill every section, drop none.

```markdown
## Role
<explorer (report) | explorer (lookup) | designer | implementer | verifier | reviewer | judge | arena candidate>. <One sentence on what you produce.>

## Goal
<The outcome, in one or two sentences. For code: the behavior a user observes when you are done.>

## Grounding
<Only what this subagent needs: the lead's mental model (<= 20 lines), file pointers, the chosen sketch, conventions, test commands. Paths, not pasted code.>

## Scope
- Allowed to write: <paths or globs, or "nothing, read-only">.
- Out of scope: <what not to touch or decide>.
- Budget (roles that write code): <the remaining budget from `references/config.md#pr-budget`, tests included, or "no size limit" when no cap applies>. With a cap, it is a stop condition, not a target: when the next change would cross it, stop and report the measure. Never compact, reflow, or reindent code to fit, and extend existing code and tests in place rather than rewriting a block you only need to extend.

## Principles to read first
Read each file below in full before any other tool call.
<Absolute paths, e.g. <skill-dir>/principles/model-the-domain.md. For a role that writes code, under each path, its file's **Rule** line and **Don't** list, verbatim.>

## Success criteria
<Checkable statements. For code: the commands that must pass.>

## Invariants
<Existing behavior and contracts to preserve, with source pointers. "None identified" when appropriate; do not manufacture compatibility requirements.>

## Return format
<= 30 lines unless told otherwise:
- Result: <done | blocked | partial> and one line why.
- Pointers: <paths and symbols touched or found>.
- Decisions: <choice, alternatives, why>, one line each.
- Evidence: <commands run and their verbatim output, trimmed to the relevant lines>.
- Principles applied: <file> → <one concrete application in this work>, one line per file given.
- Open questions: <only what you could not settle yourself>.
Never paste whole files or long diffs. The lead reads the diff itself if needed.
```

## Rules

- Give absolute paths to the skill files the subagent must read, since its working directory is the repo.
- For file reports, name the absolute output path outside the repo in Scope's allowed writes, per `references/run-state.md#working-artifacts`. The lead owns evidence preservation and scratch cleanup.
- Inline principle text only for the roles that write code (`implementer`): a fast code model may never open the files. This is skill text, not code, so "Paths, not pasted code" does not apply. Other roles get paths only.
- An `explorer` runs in one of two cases, each mapped to an agent in section 1 of the harness file. An explorer (report), as in `bricks/how.md` or for a bugfix hypothesis, writes its report to a file and runs shell commands such as `git log`. An explorer (lookup) answers a quick factual question from files or the web, and writes nothing: a fact for the grill or grounding.
- Each check runs once per role's proof pass on unchanged code; the independent verifier may rerun an implementer's check. An implementer's success criteria name narrow tests after each commit and package typecheck after the last one. The full suite, lint, and wider checks run in `bricks/verify.md` only.
- The budget stays in the Scope section, never in the success criteria: a criterion invites the subagent to optimize toward it.
- One subagent, one role. A verifier never sees the implementer's reasoning, only the goal, diff location, success criteria, and independently grounded invariants.
- Guardrails are never in the allowed paths unless the task is about them: lint, type, format, test, and CI config, and disable comments (`eslint-disable`, `@ts-expect-error`, `# noqa`). When a guardrail blocks the code, change the code to satisfy it. If that is truly impossible, the subagent reports it as an open question, and the lead asks the user: a repo rule is the team's call.
- Name the implementer owning branch/commit mutations in each write brief; parallel writers use separate branches/worktrees, with one designated implementer integrating commits for the lead. The lead owns delivery pushes/PR updates under ship/watch and never recommits returned commits. Other roles leave the user's checkout alone: no `git stash`, `reset`, `checkout`, `switch`, `clean`, or `commit`. No role pops or drops another's stash.
- A verifier's explicit Scope may authorize creation/removal of only its own unique proof worktree under the run scratch, plus copying needed tests into it, or the lead prepares that copy. No fixes, commits, stash/reset, or changes to the source/user checkout. This permits isolated proof only, not authorship by other read-only roles.
- Independent subagents launch together, in parallel, when the harness allows it.
- A returned report that breaks the format gets one retry with the format restated, then the lead extracts what it needs.

## Continuing

To send follow-up work (counterexamples, review findings) to a subagent that already returned, continue that same subagent if the harness allows it (section 1 of its file). Otherwise, spawn a fresh one of the same role with the original brief, a note on the current branch state, and the follow-up only.
