# Harness: Zed (native agent)

You are in Zed's native agent when your tools include `spawn_agent` and `skill`. If Zed runs an external agent over ACP (Claude Code, Codex, Gemini), that agent's own harness file applies instead.

## 1. Spawn a subagent

Tool `spawn_agent`. Pass the brief as the task. Each subagent gets its own context window and the parent's tool access, and returns only its final message. Zed publishes no formal parameter schema: read the tool's schema in your tool list.

- Read-only is not enforced: the brief's scope line carries it.
- Spawn independent subagents in the same turn to run them in parallel.
- Only the lead spawns.
- Continuing a returned subagent is not documented: spawn a fresh one per `references/subagent-brief.md#continuing`.

## 2. Pick the model

There is no per-call model. Every subagent runs on the single `agent.subagent_model` setting in `~/.config/zed/settings.json`, or on the thread's model when that setting is unset. Roles cannot get different models.

## 3. List available models

There is no tool for this. Read `agent` and `language_models` in `~/.config/zed/settings.json` for configured providers. Otherwise, ask the user to paste the list from the model selector.

## 4. Ask multiple-choice questions

There is no choice UI. Use the text format in `bricks/grill.md`.

## 5. Isolate an arena candidate

Arenas never run in Zed: all subagents share one model, so the arena gate fails. Say so in one line. `architect` asks one designer for two structurally distinct designs, and you pick.

## 6. Native config written by setup

Setup proposes one value for `agent.subagent_model`: the implementer pick, since implementation is the heaviest delegated work. Show the JSON change and write it only after the user confirms. Memory records `models.zed: subagent=<model>`.

## 7. Limits

- Zed loads global skills from `~/.agents/skills/` only, one level deep: the `leogpt` folder must sit directly in it.
- There is no choice UI, and no model per role.
