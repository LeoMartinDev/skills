# Harness: opencode

You are in opencode when your tools include `subagent`, `skill`, and `question`. Resolve this skill's relative paths against the base directory returned by the `skill` tool.

## 1. Spawn a subagent

Tool `subagent`, with the parameters: `agent` (the agent ID), `description`, `prompt` (the brief), and optionally `model`, `background` and `sessionID`.

- Only `mode: subagent` agents can be targeted. Built-ins: `explore` (glob, grep, and read only) and `general` (full tools).
- `explore`: explorer (lookup), reviewer, judge, when reading files is enough. It cannot write a file or run the shell.
- `general`: every other role, the explorer (report) included, since it writes its report and runs `git log`. The brief's scope line keeps a read-only role read-only.
- With `background: true`, the call returns at once and you are notified on completion. Pass the returned `sessionID` to continue that child, for example with counterexamples.
- Nesting stops at one level by default. Only the lead spawns.
- Issue independent `subagent` calls in the same turn to run them in parallel.

## 2. Pick the model

Parameter `model` on the `subagent` call, as `provider/model` or `provider/model#variant`. It overrides the agent's own model, which overrides the session's model. Omit it only when the role has no model per `references/config.md#models`.

Translate `:effort` to a verified native variant supported by that model; do not append the skill suffix to `model`. Strip `:inherit` and preserve an existing native variant. If no corresponding variant exists, apply the effort fallback in `references/config.md#models`.

## 3. List available models

Run `opencode models` in the shell. It lists every model available to the user, as `provider/model`.

## 4. Ask multiple-choice questions

Tool `question`: one or more questions per call, with a `multiple` flag for multi-select. Put the recommended option first and mark it "(Recommended)". If the tool rejects your shape, fall back to the text format in `bricks/grill.md`.

## 5. Native config written by setup

None needed: the model is chosen per call. Setup writes only `models.opencode` in configuration.

## 6. Limits

- The `skill` tool lists at most 10 supporting files. Read any other file of this skill by its path.

## 7. Additional capabilities

Apply `references/capabilities.md`. Core delegation, continuation, parallelism, model selection, and choice UI follow sections 1–4. Inspect retrieval and wake-up extensions; memory uses the file fallback.
