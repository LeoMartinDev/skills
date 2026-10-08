# Brick: how

Build a working mental model of the code a task touches, or answer "how does X work" and "where should X live". You never read the code in bulk yourself: explorers do.

## 1. Size the question

- **Simple**: one module, one function, one narrow question. One `explorer (report)` explores and explains in a single pass.
- **Complex**: a subsystem across several files, packages, or services. Split it into 2 to 4 distinct angles, for example the data model, the runtime flow, the entry points, and the tests. One `explorer (report)` per angle, launched in parallel.

When in doubt, take the simple path.

## 2. Brief the explorers

Retrieval follows the harness capabilities: use hybrid/semantic search for conceptual questions, `rg` for exact names and strings, and symbol/LSP navigation for definitions, references, and callers. Confirm retrieved facts with targeted source reads. If an index is stale or a tool is missing, fall back to lexical search; do not claim reference completeness from text matches. Prefer compact sourced facts over broad file dumps.

Use `references/subagent-brief.md`, role `explorer (report)`. Spawn it on the agent that section 1 of the harness file maps to that role, never a read-only one: it must write its report and run `git log`. The lead allocates a unique scratch directory outside the repo per `references/run-state.md#working-artifacts`; each explorer may write only its assigned `angle-<n>.md` there and returns a digest. The digest overrides the brief's return format: at most about 50 lines. When the task comes from a ticket, paste into each brief, verbatim, the risks, dependencies, and caveats named in the ticket and its parent. Each explorer returns:

- **Entry points**: where the flow starts (route, command, job, UI event), as `path:line`.
- **Flow**: the runtime path in 3 to 8 steps.
- **Key types**: the data shapes that carry the domain, with their paths. The digest inlines an excerpt of each key definition or signature, at most 10 lines, so the lead designs without opening files.
- **Where things live**: which package or layer owns what, and the local conventions.
- **Templates**: for each kind of file the task will add (handler, component, test), the closest existing sibling, as a path. For each data source or service the new code will call, how its existing callers reach it (wrapper, repair step, cache, guard), as `path:line`. The new code takes the same path unless the design says otherwise.
- **Tests**: where the tests live and the exact command to run them.
- **Gotchas**: surprising behavior, invariants, known traps.
- **Structural facts**: relevant symbol → definition, key callers/wiring, tests, and closest sibling, with `path:line` pointers and uncertainty noted. Include only facts useful for the goal; retrieval results are leads to verify, not proof by themselves.
- **Known risks**: each risk, dependency, or caveat passed in the brief, mapped to `path:line`, and whether the change must handle it.
- **Rationale leads**: relevant historical sources already encountered, with pointers and uncertainty; code or a commit subject alone does not establish intent. If unclear rationale affects a material safety, scope, or design choice, return the concrete question to the lead; explorers do not expand the workflow.

## 3. Synthesize

Merge the reports yourself. When a digest is not enough, or two explorers disagree, continue that explorer with a targeted question per `references/subagent-brief.md#continuing`. Read the source yourself only to check a blocker, as in `bricks/interrogate.md` section 5, or a disagreement the follow-up left open.

For flagged questions, the lead decides whether `bricks/why.md`'s conditional gate passes before dependent decisions. Give it the collected evidence; carry its sourced constraints and consequential gaps in the mental model.

- **In a playbook**: keep a mental model of at most 20 lines (entry points, flow, key types, conventions, templates, test commands, gotchas, known risks) plus the report paths. Pass both to every later brief; a subagent that doubts the digest re-reads the file.
- **In the how route**: present the explanation to the user with the sections Overview, Key concepts, How it works, Where things live, and Gotchas. Drop any that are empty. Give `path:line` references, not code dumps.

## Rules

- Answer the question asked. A placement question ("where should this live") ends with a recommendation and its reason.
- State your interpretation of an ambiguous question in one line and proceed. The user can redirect.
