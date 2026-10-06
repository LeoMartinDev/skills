# Harness: Cursor

You are in Cursor when your tools include `Task` (also named `Agent` since Cursor 2.1.63) with a `readonly` parameter, and `AskQuestion`.

## 1. Spawn a subagent

Tool `Task`, with the parameters `subagent_type` (`generalPurpose`, or the name of a `.cursor/agents/*.md` agent), `prompt` (the brief), and optionally `model`, `readonly`, and `run_in_background`.

- Read-only roles (explorer (lookup), reviewer, judge): `readonly: true`. Caution: `readonly` also strips MCP access. Leave it off for a subagent that needs an MCP (Notion, GitHub).
- Writing roles (explorer (report), implementer, verifier, arena candidate): `readonly` off.
- Parallel: put several `Task` calls in one message.
- Nesting stops at one level: a subagent cannot spawn another. Only the lead spawns.
- Continuing a returned subagent is not documented: spawn a fresh one per `references/subagent-brief.md#continuing`.

## 2. Pick the model

Parameter `model` on the `Task` call, as a Cursor slug (for example `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast`). Omit it only when the role has no model per `references/config.md#models`. An invalid slug is rejected, and the error lists the valid slugs.

## 3. List available models

There is no in-agent tool for this. Try, in order:

1. The CLI, if installed: `agent models` or `cursor-agent --list-models`.
2. Spawn a tiny `Task` with a deliberately invalid `model`, and read the valid slugs from the rejection error.
3. Otherwise, ask the user to paste their model list. This is the only factual question setup may ask.

## 4. Ask multiple-choice questions

Tool `AskQuestion`. It renders several multiple-choice questions in one form. Batch the independent questions of a round in one call. Put the recommended option first and mark it "(Recommended)".

## 5. Isolate an arena candidate

There is no worktree parameter on `Task`. Before spawning each candidate, create a worktree yourself: `git worktree add ../<repo>-arena-<n> -b arena/<slug>-<n>`. Pass its absolute path in the brief, and scope the candidate's writes to it. Remove the worktrees with `git worktree remove` after the graft.

## 6. Native config written by setup

Setup also writes `~/.cursor/rules/leogpt-models.mdc`, with frontmatter `description: leogpt model choices` and `alwaysApply: true`, and one line per tier (`smart: <slug>`, `code: <slug>`, `fast: <slug>`), plus any per-role override. The configuration stays the source of truth: the rule mirrors it for Cursor sessions that do not load this skill.

## 7. Limits

- Parallel agents beyond 2 to 4 cost more in review than they gain.
- If `AskQuestion` fails to render, fall back to the text format in `bricks/grill.md`.

## 8. Additional capabilities

Apply `references/capabilities.md`. Core delegation, parallelism, model selection, choice UI, and manual isolation follow sections 1–5; continuation uses a fresh child. Use semantic/symbol tools only when exposed, not inferred from editor indexing. State and memory use file fallbacks; inspect wake-up support.
