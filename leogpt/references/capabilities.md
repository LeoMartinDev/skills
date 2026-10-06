# Harness capabilities

Read with the selected harness adapter. Adapters map mechanisms; playbooks and bricks remain the only workflow policy. Determine support from actual tools and configuration, not from the product name alone.

| Capability | Contract | Fallback |
|---|---|---|
| `spawnAgent` | Fresh role context, explicit brief and scope, short result | Execute roles sequentially per `harness/generic.md`; disclose lack of independent verification |
| `continueAgent` | Address a returned child with targeted follow-up | Fresh child with original brief, current state, and follow-up |
| `parallelAgents` | Independent children launched together, within concurrency limits | Sequential execution; keep dependency order |
| `modelPerRole` | Selectable model or profile for a role | Inherited model; report actual selection, not configured intent |
| `isolation` | Separate checkout for competing writers, with artifacts recoverable | Manual worktrees; without safe isolation skip implementation arena |
| `choiceUI` | Questions and answers accessible in this session | Text questions per `bricks/grill.md` |
| `semanticSearch` | Conceptual retrieval returning source paths and snippets | `rg`/lexical search followed by targeted reads |
| `symbolNavigation` | Definitions, references, callers with source pointers | Exact search and inspect callers; do not claim completeness |
| `persistentState` | Read/update this run's checkpoint across turns | File checkpoint per `references/run-state.md`; if unwritable, report no durable resume |
| `projectMemory` | Scoped durable facts with source and deduplication | Markdown store per `references/memory.md` |
| `wakeUp` | Scheduler or event can resume this task and its checkpoint | Bounded live polling; if the session ends, report paused monitoring, never promise background work |

Each adapter's section 8 specifies extension dependencies and extra mechanisms. Unlisted optional capabilities require inspecting tools before use. Read-only roles' scopes still apply when a tool or profile does not enforce them.

Never install extensions, add model access, or create scheduler jobs just to satisfy a missing capability. Use a supported fallback; scheduled continuation must have user authorization and must preserve the watch limits and notification intent.
