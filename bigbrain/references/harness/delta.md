# Harness: Delta

You are in Delta when your thread runs in a Delta worktree with nested subagents in the thread sidebar, or your tool list offers subagent delegation with Worker, Scout, and Reviewer profiles.

## 1. Spawn a subagent

Delegate through the subagent mechanism in your tool list: read its schema and pass the brief as the task. Each subagent works in a separate conversation and reports its final result back to the parent automatically. Map roles to profiles:

- Explorer, report or lookup: `Scout` (shared checkout, gathers information). An explorer (report) writes its report through terminal commands.
- Designer, implementer, verifier, arena candidate: `Worker` (full tool access, isolated copy).
- Judge, reviewer: `Reviewer` (checks changes, isolated copy).

- Scout and Reviewer have no file-editing tools but can change files through terminal commands: the brief's scope line still carries read-only, never the profile.
- Spawn independent subagents in the same turn to run them in parallel.
- Only the lead spawns.
- To continue a returned subagent, send it a follow-up message. Otherwise spawn a fresh one per `references/subagent-brief.md#continuing`.
- When delegation is Disabled in Settings > Subagents, run each role yourself per `references/harness/generic.md`.

## 2. Pick the model

There is no per-call model. Each profile has a default model and thinking effort in Settings > Subagents; provider-specific Model Preferences in LLM Providers take precedence, then Delta's built-in default (Worker follows the parent's model). Custom profiles are TOML files in the `profiles` folder beside `settings.json`. A role mapped to a profile in configuration means: delegate with that profile.

Apply the effort from a model/profile pair through the native profile setting, checking its actual supported fields. Strip the skill suffix from profile IDs. Roles needing different efforts require distinct profiles; report provider-level overrides that prevent the requested effort per `references/config.md#effort`.

## 3. List available models

There is no tool for this. Check Settings > LLM Providers and the thread's model selector for the picker list, plus `~/.config/delta/.env` for configured provider keys. Otherwise, ask the user to paste the list from the model selector.

## 4. Ask multiple-choice questions

There is no choice UI. Use the text format in `bricks/grill.md`.

## 5. Native config written by setup

Setup sets the Worker, Scout, and Reviewer profile models, or writes custom `<id>.toml` profiles from `example.toml.example` (`worktree = "isolated"` for writers, `"shared"` for Scout-like reads). Show the change before writing. Configuration records `models.delta` per tier and design arena. Profiles are machine-local: a missing profile on another machine errors instead of substituting.

## 6. Limits

- Delegation can be Disabled or Only When Asked; concurrency defaults to 4 per thread and 8 overall, 0 pauses new subagent work.
- Switching the thread's model mid-run keeps the conversation and worktrees.
- Skills load from `.agents/skills/` (shared), `.delta/skills/` (Delta-only override by frontmatter `name`), and `~/.agents/skills/` (personal).

## 7. Additional capabilities

Apply `references/capabilities.md`. Delegation, continuation, parallelism, and model profiles depend on the enabled settings in sections 1–4. Choice UI falls back to text. Inspect retrieval and wake-up tools; state and memory use file fallbacks.
