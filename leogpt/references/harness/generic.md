# Harness: generic (unknown agent)

Use this file when no other harness file matches your tools. Check which capabilities you actually have, and degrade the rest as described here.

## 1. Spawn a subagent

If you have a tool that starts a child agent with a fresh context, use it for every delegation, and pass the brief from `references/subagent-brief.md` as its prompt.

Without one, run each delegated step yourself, in the main thread, in the same order. Keep the discipline anyway:

- Before each role, re-read only the brief you would have sent. Nothing else from earlier steps.
- Write each step's result in the brief's return format, then continue from that summary only.
- The verifier step re-derives the success criteria from the goal and the ticket items before reading the diff.

## 2. Pick the model

Only if a per-call or per-agent model setting exists. Otherwise everything runs on the current model.

Split model/effort pairs per `references/config.md#effort`. Pass effort only through a supported control; strip the suffix when sending a bare model ID. With no effort control, retain native behavior and state the limitation once.

## 3. List available models

Only if the harness exposes a list (a CLI command, a settings file, a tool schema). Otherwise, ask the user to paste it during setup.

## 4. Ask multiple-choice questions

Without a choice UI, use the text format in `bricks/grill.md`: numbered questions, each with its options and your recommendation.

## 5. Scope an arena candidate

Design candidates share the source checkout and write only their own report at the path in the brief. They do not change project files or Git state; separate worktrees are unnecessary. Apply read-only tool controls where available, allowing only the report write when needed.

Without subagents, skip the arena and say so in one line: `architect` drafts one design itself and still runs its challenge step. With subagents, apply the arena gate in `references/config.md`.

## 6. Native config written by setup

None.

## 7. Limits

- Without subagents, the context window fills faster. Keep summaries short and never re-read large files you already summarized.

## 8. Additional capabilities

Apply `references/capabilities.md`. Determine each optional capability from actual tools. Use the fallbacks in the shared contract; do not infer retrieval, durable resume, or background wake-up from the presence of shell or child-agent tools.
