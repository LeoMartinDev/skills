# Brick: explain

**Make the work easy to inspect.** Compose the PR explanation and the final reply from the final diff and the recorded evidence. This is presentation, not another verification round.

## Inputs

Use the observable goal, ticket criteria, final diff and head commit, verification and review reports, decisions, and unresolved findings. Include the PR URL and watch result when present. Use existing report paths instead of loading raw logs again.

## Choose the format

Choose the smallest format that makes the behavior and evidence clear:

- **Small correction or straightforward feature:** short text, with a concrete before/after example when useful. For a bugfix, keep the original repro command and its before/after output.
- **Changed flow, boundaries, or architecture:** add one diagram when it clarifies what changed. Prefer Mermaid supported by the destination; distinguish the previous and resulting behavior.
- **Complex migration or several interacting changes:** optionally add a local interactive HTML explanation when exploring modules, flows, or proof details materially helps review and the harness can create and show it. Otherwise use text and a diagram.

A visual is optional, never a completion gate. Use plain language, concrete examples, and the reader's language, and respect the repo's PR language and template.

## Compose

1. Lead with what changes for the user, the strongest evidence, and material limits. Use the actual outcome, including partial or blocked work.
2. Map every success criterion to its recorded check, result (`PASS`, `FAIL`, or `INCONCLUSIVE`), and evidence pointer or compact output. Include tested commit and scope; a shared check may cover several criteria. Keep the complete mapping in the PR or a linked report, and summarize it in the final reply. A criterion without evidence is explicitly unverified.
3. Explain decisions affecting behavior, maintenance, or risk: choice and why, with alternatives only when they help assess the tradeoff. Retain every dropped, deferred, or reinterpreted criterion and each rejected or deferred finding with its residual risk. Routine implementation decisions stay in the subagent reports.
4. Link the PR, relevant files, and proof artifacts so the reader can inspect them. Keep the final reply brief; supporting detail goes in the PR or a linked report.

## Evidence discipline

Explain only what the diff and recorded checks establish; a diagram is never proof that the behavior ran, and an example not taken from recorded output is labeled illustrative. Missing, inconclusive, or stale evidence stays visible, and numbers come from the latest recorded output. After watch repairs, rebuild the explanation from the current diff and evidence. Keep optional visuals outside the production diff, with the evidence also available as text.
