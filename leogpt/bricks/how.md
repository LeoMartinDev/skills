# Brick: how

Build a working mental model of the code a task touches, or answer "how does X work" and "where should X live". You never read the code in bulk yourself: explorers do.

## 1. Size the question

- **Simple**: one module, one function, one narrow question. One `explorer` explores and explains in a single pass.
- **Complex**: a subsystem across several files, packages, or services. Split it into 2 to 4 distinct angles, for example the data model, the runtime flow, the entry points, and the tests. One `explorer` per angle, launched in parallel.

When in doubt, take the simple path.

## 2. Brief the explorers

Use `references/subagent-brief.md`, read-only, role `explorer`. Give each explorer its output path `/tmp/leogpt-how-<slug>/angle-<n>.md`: it writes the full report there and returns the digest. Each explorer returns:

- **Entry points**: where the flow starts (route, command, job, UI event), as `path:line`.
- **Flow**: the runtime path in 3 to 8 steps.
- **Key types**: the data shapes that carry the domain, with their paths.
- **Where things live**: which package or layer owns what, and the local conventions.
- **Templates**: for each kind of file the task will add (handler, component, test), the closest existing sibling, as a path.
- **Tests**: where the tests live and the exact command to run them.
- **Gotchas**: surprising behavior, invariants, known traps.
- **Why**: when a shape looks odd, one line from `git log` or `git blame` on why it is that way.

## 3. Synthesize

Merge the reports yourself. When two explorers disagree, send one targeted follow-up rather than reading the code.

- **In a playbook**: keep a mental model of at most 20 lines (entry points, flow, key types, conventions, templates, test commands, gotchas) plus the report paths. Pass both to every later brief; a subagent that doubts the digest re-reads the file.
- **In the how route**: present the explanation to the user with the sections Overview, Key concepts, How it works, Where things live, and Gotchas. Drop any that are empty. Give `path:line` references, not code dumps.

## Rules

- Answer the question asked. A placement question ("where should this live") ends with a recommendation and its reason.
- State your interpretation of an ambiguous question in one line and proceed. The user can redirect.
