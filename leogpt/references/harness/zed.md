# Harness: Zed (native agent)

You are in Zed's native agent when your tools include `spawn_agent` and `skill`. If Zed runs an external agent over ACP (Claude Code, Codex, Gemini), that agent's own harness file applies instead.

## 1. Spawn a subagent

Tool `spawn_agent`, with the parameters `label` (a short UI label), `message` (the brief), and optionally `model` and `session_id`. Each subagent gets its own context window and the parent's tool access, and returns only its final message plus a `session_id`.

- Read-only is not enforced: the brief's scope line carries it.
- Parallel: put several `spawn_agent` calls in one message.
- Only the lead spawns.
- Continue a subagent that already returned by passing its `session_id` with a short follow-up `message`. Its context and model stay intact. `model` cannot be combined with `session_id`.

## 2. Pick the model

Parameter `model` on the `spawn_agent` call (Zed 1.22 and later), as the exact `provider/model-id` that `list_agents_and_models` returns for the native agent (for example `anthropic/claude-opus-5-5`, `openai-subscribed/gpt-5.6-sol`). Omit it only when the role has no model per `references/config.md#models`: the subagent then runs on `agent.subagent_model`, else the thread's model. An unavailable model fails the spawn, and the error names `list_agents_and_models`. If `spawn_agent` has no `model` parameter, Zed is older than 1.22: every subagent shares one model, so say so in one line.

## 3. List available models

Tool `list_agents_and_models`. Use the `models[].id` of the entry with `is_native: true`: it lists every model of the authenticated providers. Ignore the other entries, which are external agents. If the tool is missing, read `agent` and `language_models` in `~/.config/zed/settings.json`, or ask the user to paste the list from the model selector.

## 4. Ask multiple-choice questions

There is no choice UI. Use the text format in `bricks/grill.md`.

## 5. Isolate an arena candidate

There is no worktree parameter on `spawn_agent`. The design arena's candidates write files, so they need none. Before spawning each implementation candidate, create a worktree yourself: `git worktree add ../<repo>-arena-<n> -b arena/<slug>-<n>`. Pass its absolute path in the brief, and scope the candidate's writes to it. Remove the worktrees with `git worktree remove` after the graft.

## 6. Native config written by setup

None required: configuration holds `models.zed`, and each spawn passes its role's model. Setup may also propose `agent.subagent_model` in `~/.config/zed/settings.json`, set to the `fast` pick, so Zed's own unrouted subagents stay cheap. Show the JSON change and write it only after the user confirms.

## 7. Limits

- Zed loads global skills from `~/.agents/skills/` only, one level deep: the `leogpt` folder must sit directly in it.
- There is no choice UI.
- `agent.subagent_model` carries thinking, effort and speed settings, and a spawn with that same model keeps them. Another model runs with its defaults.

## 8. Additional capabilities

Apply `references/capabilities.md`. Delegation, continuation, parallelism, model selection, and manual isolation follow sections 1–5. Choice UI falls back to text. Inspect retrieval and wake-up tools; state and memory use file fallbacks.
