# Harness: Pi

Use this adapter when the runtime identifies itself as Pi. Built-in filesystem and bash tools alone do not distinguish Pi from other harnesses. Verify loaded extension tools and schemas before assigning optional capabilities.

## 1. Spawn a subagent

Vanilla Pi does not provide built-in subagents. With Everyx (`@everyx/pi-subagent`), use `agent_spawn` with a self-contained `prompt` from `references/subagent-brief.md`, a short role/task `label`, explicit `model`, and a `tools` allowlist. It defines no agent profiles; the brick supplies the role instructions. Read-only discovery can use `read`, `grep`, `find`, `ls`; grant `bash` only when the task needs it and state its allowed scope. Writers need the relevant edit/write tools. Exclude delegation tools from children: only the lead spawns.

Independent `agent_spawn` calls can run concurrently; dispatch in bounded waves (start with at most 4) because Everyx has no concurrency cap. Use foreground calls for dependencies; background calls return an `agent_id` and deliver completion notifications. There is no result/wait tool: do not poll. Set `timeoutMs` to the remaining phase/run deadline when bounded execution is required.

Use `persistent: true` for an implementer expected to receive review corrections. Continue its resident context with `agent_send({to: agent_id, message: ...})`; delivery is not completion, so await the result notification before verification. Stop unneeded residents with `agent_stop({agent_id})`. After stop, reload, or exit, start a fresh child with the checkpoint and brief: saved transcripts do not restore the live handle. For another extension inspect its actual schema; without one execute roles sequentially per `references/harness/generic.md`.

Everyx inherits the parent's cwd. Give read-only tools to candidates that return their report inline; the lead can save each returned report at its assigned path.

## 2. Pick the model

Resolve model/effort pairs per `references/config.md#models`. Split `provider/model:effort`: send the bare `provider/model` in `agent_spawn.model` and the supported level in `agent_spawn.thinking`. For example, `provider/model:high` becomes `{model: "provider/model", thinking: "high"}`. Omit `thinking` for a bare entry or `:inherit`; it then inherits the parent. Check the installed Everyx enum and Pi's supported levels for the model; Pi can clamp a level, so distinguish requested from effective effort. Pass the model explicitly; unavailable models fail instead of silently falling back. Changing the lead's model is not per-role selection.

## 3. List available models

Use an exposed model-list tool, or inspect the installed CLI's help for its model-list option before invoking it. A runtime extension can expose the authenticated model registry; SDK access does not imply an LLM-callable tool. If no inventory is accessible, ask for the user's available list during setup. Do not read authentication secrets to infer it.

## 4. Ask multiple-choice questions

Use a question tool only if an installed extension exposes it. Pi extension UI APIs are not themselves agent tools. Otherwise use the text question format in `bricks/grill.md`.

## 5. Native config written by setup

bigbrain choices live in `~/.agents/config/bigbrain.md`. Everyx needs no role profile files: send role instructions and resolved model/effort pairs at launch. This does not change Pi's main-session `defaultThinkingLevel`. Its installation is a separate, user-authorized runtime task (`pi install npm:@everyx/pi-subagent`); setup does not install packages. Do not add speculative Pi settings.

## 6. Limits

The skill owns playbook ordering and gates; Pi extensions supply mechanisms. Everyx background children depend on the parent process; they are not a scheduler and do not survive its exit. Keep an interactive or RPC parent alive for follow-ups: `pi --print` can exit after delivery acknowledgement, before the child's notification. Session transcripts are not structured bigbrain checkpoints. Persist phase, evidence and artifacts per `references/run-state.md` independently of live agent IDs.

## 7. Additional capabilities

Apply `references/capabilities.md`. Loaded Everyx tools support `spawnAgent`, `parallelAgents`, `modelPerRole`, and `continueAgent` for resident children. They provide neither `choiceUI` nor `wakeUp`. Built-in shell/file access can store run state and project memory via the shared file fallbacks; confirm additional capabilities from actual tools.

Retrieval and LSP extensions are optional separate runtime tasks. Use targeted `rg` and source reads when none are loaded; inspect actual schemas before using any installed retrieval or symbol tools.

Runtime references: [Pi overview](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md), [extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), and [Everyx](https://github.com/everyx/pi-extensions/tree/master/packages/pi-subagent). Consult installed docs and schemas when versions differ.
