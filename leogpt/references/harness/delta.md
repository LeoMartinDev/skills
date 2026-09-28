# Harness: Delta

You are in Delta when your thread runs in a Delta worktree with nested subagents in the thread sidebar, or your tool list offers subagent delegation with Worker, Scout, and Reviewer profiles.

## 1. Spawn a subagent

Delegate through the subagent mechanism in your tool list: read its schema and pass the brief as the task. Each subagent works in a separate conversation and reports its final result back to the parent automatically. Map roles to profiles:

- Explorer: `Scout` (shared checkout, gathers information).
- Designer, implementer, verifier, arena candidate: `Worker` (full tool access, isolated copy).
- Judge, reviewer: `Reviewer` (checks changes, isolated copy).

- Scout and Reviewer have no file-editing tools but can change files through terminal commands: the brief's scope line still carries read-only, never the profile.
- Spawn independent subagents in the same turn to run them in parallel.
- Only the lead spawns.
- To continue a returned subagent, send it a follow-up message. Otherwise spawn a fresh one per `references/subagent-brief.md#continuing`.
- When delegation is Disabled in Settings > Subagents, run each role yourself per `generic.md`.

## 2. Pick the model

There is no per-call model. Each profile has a default model and thinking effort in Settings > Subagents; provider-specific Model Preferences in LLM Providers take precedence, then Delta's built-in default (Worker follows the parent's model). Custom profiles are TOML files in the `profiles` folder beside `settings.json`. A role mapped to a profile in memory means: delegate with that profile.

## 3. List available models

There is no tool for this. Check Settings > LLM Providers and the thread's model selector for the picker list, plus `~/.config/delta/.env` for configured provider keys. Otherwise, ask the user to paste the list from the model selector.

## 4. Ask multiple-choice questions

There is no choice UI. Use the text format in `bricks/grill.md`.

## 5. Isolate an arena candidate

Do not create worktrees yourself: Worker and Reviewer use isolated copies that merge back automatically on successful completion (failed work does not merge). Scout shares the parent's checkout: never use it for implementation candidates. The design arena needs no isolation (candidates write files). The implementation arena needs at least 2 distinct selectable profile models, else one Worker implements and you say so in one line.

## 6. Native config written by setup

Setup sets the Worker, Scout, and Reviewer profile models, or writes custom `<id>.toml` profiles from `example.toml.example` (`worktree = "isolated"` for writers, `"shared"` for Scout-like reads). Show the change before writing. Memory records `models.delta` per tier and arena role. Profiles are machine-local: a missing profile on another machine errors instead of substituting.

## 7. Limits

- Delegation can be Disabled or Only When Asked; concurrency defaults to 4 per thread and 8 overall, 0 pauses new subagent work.
- Switching the thread's model mid-run keeps the conversation and worktrees.
- Skills load from `.agents/skills/` (shared), `.delta/skills/` (Delta-only override by frontmatter `name`), and `~/.agents/skills/` (personal).
