# Brick: explain

Make the completed work easy to inspect. The lead composes the PR explanation and final reply from the final diff and recorded evidence; this is presentation, not another verification round.

## Inputs

Use the observable goal, ticket criteria, final diff and head commit, verification and review reports, decisions, and unresolved findings. Include the PR URL and watch result when present. Use existing report paths instead of loading raw logs again.

## Choose the format

Choose the smallest format that makes the behavior and evidence clear:

- **Small correction or straightforward feature:** short text, with a concrete before/after example when useful. For a bugfix, keep the original repro command and its before/after output.
- **Changed flow, boundaries, or architecture:** add one diagram when it clarifies what changed. Prefer Mermaid supported by the destination; distinguish the previous and resulting behavior.
- **Complex migration or several interacting changes:** optionally add a local interactive HTML explanation when exploring modules, flows, or proof details materially helps review and the harness can create and show it. Otherwise use text and a diagram.

A visual is optional, not a completion gate. No mandatory controlled-English vocabulary or video. Write per `principles/plain-prose.md`, with concrete examples, in the reader's language; respect the repo's PR language and template.

## Compose

1. Lead with what changes for the user, the strongest evidence, and material limits. Use the actual outcome, including partial or blocked work.
2. Map every success criterion to its recorded check, result (`PASS`, `FAIL`, or `INCONCLUSIVE`), and evidence pointer or compact output. Include tested commit and scope; a shared check may cover several criteria. Keep the complete mapping in the PR or a linked report, and summarize it in the final reply. A criterion without evidence is explicitly unverified.
3. Explain decisions affecting behavior, maintenance, or risk: choice and why, with alternatives only when they help assess the tradeoff. Retain every dropped, deferred, or reinterpreted criterion and each rejected or deferred finding with its residual risk. Keep routine implementation decisions in the recorded reports or run state.
4. Preserve every `unverified:` item. Link the PR, relevant files, and proof artifacts so the reader can inspect them. Keep the final reply brief; put supporting detail in the PR or linked report, plus the models actually used per role as required by `SKILL.md`.

## Evidence discipline

- Explain only what the diff and recorded checks establish. A diagram or interactive view is an explanation, never proof that the behavior ran.
- Passing tests prove their recorded scope, not universal correctness. Missing or inconclusive evidence stays visible; never turn it into a pass.
- Use numbers from the latest recorded command output. Name stale evidence as such; do not claim it proves the current head. Route any required recheck through `bricks/verify.md`.
- After watch repairs, compose the final explanation from the new diff and current evidence, not the pre-watch summary. Respect the PR template when updating its explanation.
- Store optional explanation artifacts in the run directory or harness artifact store, outside the production diff unless the task requests repo documentation. Record their paths in the run state's `artifacts` when available. Keep evidence available as text even when a visual is used.
