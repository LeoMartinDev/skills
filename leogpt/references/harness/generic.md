# Harness: generic (unknown agent)

Use this file when no other harness file matches your tools. Check which capabilities you actually have, and degrade the rest as described here.

## 1. Spawn a subagent

If you have a tool that starts a child agent with a fresh context, use it for every delegation, and pass the brief from `references/subagent-brief.md` as its prompt.

Without one, run each delegated step yourself, in the main thread, in the same order. Keep the discipline anyway:

- Before each role, re-read only the brief you would have sent. Nothing else from earlier steps.
- Write each step's result in the brief's return format, then continue from that summary only.
- The verifier step re-derives the success criteria from the goal before reading the diff.

## 2. Pick the model

Only if a per-call or per-agent model setting exists. Otherwise everything runs on the current model.

## 3. List available models

Only if the harness exposes a list (a CLI command, a settings file, a tool schema). Otherwise, ask the user to paste it during setup.

## 4. Ask multiple-choice questions

Without a choice UI, use the text format in `bricks/grill.md`: numbered questions, each with its options and your recommendation.

## 5. Isolate an arena candidate

Arenas need subagents. Without them, skip every arena and say so in one line: `architect` then drafts one design itself and still runs its challenge step. With subagents, the arena gate in `references/memory.md` applies: the design arena runs even on one model, the implementation arena needs at least 2 distinct selectable models.

When an implementation arena runs, isolate each candidate yourself: `git worktree add ../<repo>-arena-<n> -b arena/<slug>-<n>`, pass the path in the brief, and `git worktree remove` it after the graft.

## 6. Native config written by setup

None.

## 7. Limits

- Without subagents, the context window fills faster. Keep summaries short and never re-read large files you already summarized.
