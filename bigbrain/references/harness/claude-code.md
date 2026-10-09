# Harness: Claude Code

You are in Claude Code when your tools include `Agent` with `subagent_type` and `isolation` parameters. `AskUserQuestion` may be deferred: load it through `ToolSearch` if it is listed but has no schema.

## 1. Spawn a subagent

Tool `Agent`, with the parameters `description` (3-5 words), `prompt` (the brief), `subagent_type`, and optionally `model`, `effort`, and `isolation`.

- Explorer (lookup): `subagent_type: "Explore"`. It has no Edit or Write and is built for search, not judgment.
- Every other role (explorer (report), designer, implementer, verifier, reviewer, judge, arena candidate): `subagent_type: "general-purpose"`. The brief's scope line keeps the read-only roles read-only.
- Separate worktrees (parallel implementers, a bugfix hypothesis needing temporary instrumentation): pass `isolation: "worktree"`. The child works on an isolated copy of the repo; a worktree it changed is kept and its path and branch come back with the result. The designated implementer integrates kept commits; remove probe worktrees once their verdict is recorded. The verifier's base-comparison worktree still follows `references/prompts/verifier.md#checks-in-order`.
- Parallel: put several `Agent` calls in one message. Subagents run in the background by default and notify you on completion. Never poll them.
- Continue a subagent that already returned with `SendMessage`, addressed to its agent ID. Its context stays intact.
- The user does not see a subagent's report. Relay what matters.

## 2. Pick the model

Parameter `model` on the `Agent` call. It takes the aliases listed in the tool's schema (for example `opus`, `sonnet`, `haiku`, `fable`). Omit it only when the role has no model per `references/config.md#models`: the subagent then inherits the lead's model.

Strip the skill's `:effort` suffix from the alias and pass it as the `effort` parameter when the schema lists that level; otherwise omit `effort`, keeping the native default, and report the limitation per `references/config.md#models`. Do not change the lead's effort to simulate a child override.

## 3. List available models

Read the `model` enum in the `Agent` tool schema. That enum is the list. Map each alias to its full name and version (`opus` = Claude Opus <version>, and so on) using the model IDs in your system prompt. If a version is unknown, mark the guess with `*` in the setup table.

## 4. Ask multiple-choice questions

Tool `AskUserQuestion`: 1 to 4 questions per call, 2 to 4 options each, a `header` of 12 characters max, `multiSelect` when choices combine. "Other" is added automatically. Put the recommended option first, with " (Recommended)" at the end of its label. A round with more than 4 questions takes several calls.

## 5. Native config written by setup

None needed: the model is chosen per call. Setup writes only `models.claude-code` in configuration.

## 6. Limits

- Do not use the `Workflow` tool. It needs an explicit user opt-in and exists only in Claude Code.
- Only the lead spawns subagents. Do not rely on nested spawning.
- A background subagent keeps running after you reply. Wait for its notification before using its result.

## 7. Additional capabilities

Apply `references/capabilities.md`. Core delegation, continuation, parallelism, model selection, and choice UI follow sections 1–4. Retrieval extensions and wake-up support must be inspected; memory uses the shared fallback.

**PR watch waits.** Foreground `sleep` is blocked. Start one `Bash` call per PR with `run_in_background: true` that reruns `scripts/watch-pr.sh` against the saved snapshot every `POLL=60` seconds and exits on a change (0), a script failure, or the saved deadline (3). Set every variable in that same command; `DEADLINE` is the saved deadline in epoch seconds:

```bash
for v in "$DEADLINE" "$POLL"; do case "$v" in ''|*[!0-9]*) exit 2;; esac; done
until [ "$(date +%s)" -ge "$DEADLINE" ]; do
  bash "$SKILL/scripts/watch-pr.sh" "$PR" --repo "$REPO" --previous "$SNAP" > "$NEXT" || exit
  jq -e '.changes != []' "$NEXT" >/dev/null && exit
  sleep "$POLL"
done
exit 3
```

Its exit notifies you, and the user can keep talking meanwhile. Promote `$NEXT` to the snapshot once handled. This is live polling that ends with the session, not `wakeUp`: `CronCreate` and `ScheduleWakeup` are schedulers and need user authorization per `references/capabilities.md`.
