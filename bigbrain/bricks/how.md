# Brick: how

Build a working mental model of the code a task touches, or answer "how does X work" and "where should X live". You never read the code in bulk yourself: explorers do.

## 1. Size the question

- **Simple**: one module, one function, one narrow question. The lead may settle it with targeted source reads and a compact sourced summary; use one `explorer (report)` when the needed reading is substantial. No explorer report is required for a direct lookup.
- **Complex**: a subsystem across several files, packages, or services. Split it into 2 to 4 distinct angles, for example the data model, the runtime flow, the entry points, and the tests. One `explorer (report)` per angle, launched in parallel.

When in doubt, take the simple path.

## 2. Brief the explorers

Use semantic search for conceptual questions, `rg` for exact names, and symbol navigation for definitions and callers, when the harness has them; confirm results with targeted reads, and never claim completeness from text matches.

Role `explorer (report)`. Each explorer writes only its `angle-<n>.md` in the scratch directory and returns a digest. The digest overrides the brief's return format: at most about 50 lines. When the task comes from a ticket, paste into each brief, verbatim, the risks, dependencies, and caveats named in the ticket and its parent. Each explorer returns:

- **Entry points**: where the flow starts (route, command, job, UI event), as `path:line`.
- **Flow**: the runtime path in 3 to 8 steps.
- **Key types**: the data shapes that carry the domain, with their paths. The digest inlines an excerpt of each key definition or signature, at most 10 lines, so the lead designs without opening files.
- **Where things live**: which package or layer owns what, and the local conventions.
- **Templates**: for each kind of file the task will add (handler, component, test), the closest existing sibling, as a path. For each data source or service the new code will call, how its existing callers reach it (wrapper, repair step, cache, guard), as `path:line`. The new code takes the same path unless the design says otherwise.
- **Tests**: where the tests live and the exact command to run them.
- **Gotchas**: surprising behavior, invariants, known traps.
- **Known risks**: each risk, dependency, or caveat passed in the brief, mapped to `path:line`, and whether the change must handle it.
- **Rationale leads**: relevant historical sources already encountered, with pointers and uncertainty; code or a commit subject alone does not establish intent. If unclear rationale affects a material safety, scope, or design choice, return the concrete question to the lead; explorers do not expand the workflow.

## 3. Synthesize

For a direct simple lookup, synthesize the inspected facts and pointers yourself. Otherwise merge the reports. When a digest is not enough, or two explorers disagree, continue that explorer with a targeted question per `references/subagent-brief.md#continuing`. Keep any source reads targeted to a decision, blocker, or remaining disagreement.

When an explorer flags an unclear rationale that affects a decision, apply `bricks/why.md` with the evidence collected, and carry its constraints and gaps in the mental model.

- **In a playbook**: keep a mental model of at most 20 lines (entry points, flow, key types, conventions, templates, test commands, gotchas, known risks) plus the report paths. Pass both to every later brief; a subagent that doubts the digest re-reads the file.
- **In the how route**: present the explanation to the user with the sections Overview, Key concepts, How it works, Where things live, and Gotchas. Drop any that are empty. Give `path:line` references, not code dumps.

## Rules

- Answer the question asked. A placement question ("where should this live") ends with a recommendation and its reason.
- State your interpretation of an ambiguous question in one line and proceed. The user can redirect.
