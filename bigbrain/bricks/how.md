# Brick: how

**Build a mental model before you change anything.** Map the code a task touches, or answer "how does X work" and "where should X live". Explorers read the code in bulk; you read their digests.

## 1. Size the question

If the scope is ambiguous, state your reading in one line and go. The user can redirect.

- **Simple** (one module, one function, one narrow question): answer with targeted reads, or one `explorer (report)` when the reading is substantial.
- **Complex** (a subsystem across files, packages, or services): split it into 2 to 4 angles, such as the data model, the runtime flow, the entry points, and the tests. Launch one `explorer (report)` per angle, in parallel.

When in doubt, take the simple path.

## 2. Brief the explorers

Each brief points to `references/prompts/explorer.md`, names its angle, and gives its report path in the scratch directory. For a ticket, paste the risks, dependencies, and caveats that it and its parent name, verbatim.

## 3. Synthesize

Merge the digests. When one is thin or two disagree, ask that explorer a targeted follow-up (`references/subagent-brief.md#continuing`) rather than reading the code yourself. When an unclear reason could change a decision, run `bricks/why.md` with the evidence collected.

- **In a use case:** keep a mental model of 20 lines at most (entry points, flow, key types, conventions, templates, test commands, gotchas, risks) plus the report paths. Every later brief gets both.
- **In the how route:** present Overview, Key concepts, How it works, Where things live, and Gotchas, dropping empty sections. Cite `path:line`, not code. A placement question ends with a recommendation and its reason.
