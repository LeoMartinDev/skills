# Harness: Claude Code

You are in Claude Code when your tools include `Agent` with `subagent_type` and `isolation` parameters. `AskUserQuestion` may be deferred: load it through `ToolSearch` if it is listed but has no schema.

## 1. Spawn a subagent

Tool `Agent`, with the parameters `description` (3-5 words), `prompt` (the brief), `subagent_type`, and optionally `run_in_background`, `model`, and `isolation`.

- Explorer: `subagent_type: "Explore"`. It has no Edit or Write and is built for search, not judgment.
- Every other role (designer, implementer, verifier, reviewer, judge, arena candidate): `subagent_type: "general-purpose"`. The brief's scope line keeps the read-only roles read-only.
- Parallel: put several `Agent` calls in one message. Subagents run in the background by default and notify you on completion. Never poll them.
- Continue a subagent that already returned with `SendMessage`, addressed to its agent ID. Its context stays intact.
- The user does not see a subagent's report. Relay what matters.

## 2. Pick the model

Parameter `model` on the `Agent` call. It takes the aliases listed in the tool's schema (for example `opus`, `sonnet`, `haiku`, `fable`). Omit it to inherit the lead's model.

## 3. List available models

Read the `model` enum in the `Agent` tool schema. That enum is the list. Map each alias to its full name and version (`opus` = Claude Opus <version>, and so on) using the model IDs in your system prompt. If a version is unknown, mark the guess with `*` in the setup table.

## 4. Ask multiple-choice questions

Tool `AskUserQuestion`: 1 to 4 questions per call, 2 to 4 options each, a `header` of 12 characters max, `multiSelect` when choices combine. "Other" is added automatically. Put the recommended option first, with " (Recommended)" at the end of its label. A round with more than 4 questions takes several calls.

## 5. Isolate an arena candidate

Pass `isolation: "worktree"` on the `Agent` call. Each candidate gets its own git worktree, removed automatically when unchanged. Ask each candidate to report its worktree path and branch in its return.

## 6. Native config written by setup

None needed: the model is chosen per call. Setup writes only `models.claude-code` in memory.

## 7. Limits

- Do not use the `Workflow` tool. It needs an explicit user opt-in and exists only in Claude Code.
- Only the lead spawns subagents. Do not rely on nested spawning.
- A background subagent keeps running after you reply. Wait for its notification before using its result.
