# Harness: Pi

Use this adapter when the runtime identifies itself as Pi. Built-in filesystem and bash tools alone do not distinguish Pi from other harnesses. Verify loaded extension tools and schemas before assigning optional capabilities.

## 1. Spawn a subagent

Vanilla Pi does not provide built-in subagents. If an installed extension exposes a child-agent tool, use its actual schema for the brief, role or agent name, model, and checkout. Do not assume a tool named `spawn_agent` exists. Map every LeoGPT role to a child with the necessary tools and explicit write scope.

Use extension batch or concurrent dispatch only if supported. Continue a child only with the exposed session/agent handle; otherwise start a fresh child with the original brief and follow-up. Without an extension run roles sequentially per `generic.md`. Only the lead spawns.

## 2. Pick the model

Resolve roles per `references/config.md#models`. Pass the exact provider/model or configured profile accepted by the installed subagent extension. If it cannot select per child, use its inherited model and disclose that. Changing the lead's model is not per-role selection.

## 3. List available models

Use an exposed model-list tool, or inspect the installed CLI's help for its model-list option before invoking it. A runtime extension can expose the authenticated model registry; SDK access does not imply an LLM-callable tool. If no inventory is accessible, ask for the user's available list during setup. Do not read authentication secrets to infer it.

## 4. Ask multiple-choice questions

Use a question tool only if an installed extension exposes it. Pi extension UI APIs are not themselves agent tools. Otherwise use the text question format in `bricks/grill.md`.

## 5. Isolate an arena candidate

Use extension checkout isolation when documented and ensure the candidate reports its branch and path. Otherwise create one manual worktree per implementation candidate, pass its absolute path, and remove only your own worktrees after preserving the selected commits. Without safe isolation skip the implementation arena.

## 6. Native config written by setup

LeoGPT choices live in `~/.agents/config/leogpt.md`. Write extension-specific profiles only when the installed extension documents their location and format and the user confirms the proposed setup. Do not add speculative Pi settings or install packages as part of setup.

## 7. Limits

The skill owns playbook ordering and gates; Pi extensions supply mechanisms. Session history or a resumable Pi conversation is not automatically a structured LeoGPT run checkpoint. Do not claim background monitoring from an extension's mere presence.

## 8. Additional capabilities

Apply `references/capabilities.md`. `spawnAgent`, `continueAgent`, `parallelAgents`, `modelPerRole`, and `choiceUI` depend on loaded extensions; confirm each separately. `isolation` can use shell worktrees. Built-in shell/file access can store run state and project memory via the shared file fallbacks; `wakeUp` needs an explicitly exposed scheduler.

For conceptual retrieval prefer an installed hybrid search extension such as pi-knowledge, using its actual schema. For definitions/references prefer an exposed LSP tool. Neither is assumed installed. Confirm results with targeted source reads; use `rg` when missing or stale. Installing or implementing these extensions is a separate runtime task.

Official runtime references: [Pi overview](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md) and [extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md). Consult the installed version's docs when its API differs.
