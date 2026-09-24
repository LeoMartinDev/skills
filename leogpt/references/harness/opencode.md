# Harness: opencode

You are in opencode when your tools include `subagent` (v2) or `task` (v1), `skill`, and `question`. Resolve this skill's relative paths against the base directory returned by the `skill` tool.

## 1. Spawn a subagent

Tool `subagent` (v2), with the parameters: the agent ID, `description`, `prompt` (the brief), and optionally `background` and `sessionID`. In v1, the tool is `task`, with `subagent_type` and `session_id`. Use whichever your tool list shows.

- Only `mode: subagent` agents can be targeted. Built-ins: `explore` (read-only) and `general` (full tools).
- With `background: true`, the call returns at once and you are notified on completion. Pass the returned `sessionID` to continue that child, for example with counterexamples.
- Nesting stops at one level by default. Only the lead spawns.
- Issue independent `subagent` calls in the same turn to run them in parallel.

## 2. Pick the model

There is no per-call model parameter. The model is fixed in the agent definition. A role mapped to `agent:<id>` in memory means: spawn agent `<id>`. A role left unset uses `explore` (read-only roles) or `general` (writing roles), on the session's model.

## 3. List available models

Run `opencode models` in the shell. It lists every model available to the user, as `provider/model`.

## 4. Ask multiple-choice questions

Tool `question`: one or more questions per call, with a `multiple` flag for multi-select. Put the recommended option first and mark it "(Recommended)". If the tool rejects your shape, fall back to the text format in `bricks/grill.md`.

## 5. Isolate an arena candidate

There is no built-in worktree isolation. Before spawning each candidate, create a worktree yourself: `git worktree add ../<repo>-arena-<n> -b arena/<slug>-<n>`. Pass its absolute path in the brief, and scope the candidate's writes to it. Remove the worktrees with `git worktree remove` after the graft.

## 6. Native config written by setup

Setup writes one agent file per chosen model and role in `~/.config/opencode/agents/`, then maps the role to `agent:<id>` in memory. Show the files to the user before writing them.

```markdown
---
description: leogpt <role> (<provider/model>)
mode: subagent
model: <provider/model#variant>
hidden: true
---
You are a leogpt <role>. Follow the brief you receive exactly, including its return format.
```

Name the files `leogpt-<role>.md`. Arena roles get one file per model: `leogpt-arena-design-1.md`, `leogpt-arena-design-2.md`, and so on.

## 7. Limits

- The arena gate counts distinct models across the arena role's agents, not distinct agent files.
- Read-only is not enforced for custom agents: the brief's scope line carries it.
- The `skill` tool lists at most 10 supporting files. Read any other file of this skill by its path.
