# Playbook: setup

Pick one model per role for the current harness, have the user confirm, and store the choices. Runs in the main thread, since it talks to the user.

Copy these steps into your todo list verbatim.

1. **List the available models** per the harness file, section 3. If the harness picks no model per role (see section 2), say so. Configure only what it supports.
2. **Get the benchmark data.** An `explorer` subagent returns, for the listed models only: the intelligence index, the coding index, the blended price per million tokens, and the output speed. Its sources, in order:
   - the Artificial Analysis API, when `ARTIFICIAL_ANALYSIS_API_KEY` is set: `curl -s -H "x-api-key: $ARTIFICIAL_ANALYSIS_API_KEY" https://artificialanalysis.ai/api/v2/data/llms/models`;
   - otherwise, the model leaderboard pages on artificialanalysis.ai, through web fetch;
   - otherwise, your own knowledge, flagged as such.
   Models are matched by vendor, family, and version. An unmatched model gets "no data".
3. **Apply the tier rules** below, and draft one pick per role with one or two alternatives.
4. **Propose.** Show a table: role, pick, intelligence, coding, price, and one line on why.
5. **Confirm.** One question per role through the choice tool: the pick first, marked "(Recommended)", then the alternatives. Batch the questions per the harness's limits.
6. **Write** `models.<harness>` and `setup.<harness>: done <YYYY-MM-DD>` in the global section of memory. Then write the harness-native config (section 6 of its file), showing it before writing.
7. **Reply** with the final table and the line "Model data: Artificial Analysis (https://artificialanalysis.ai/)".

## Tier rules

The goal is the best quality for the price, with intelligence first. Never pick a model just because it is the most expensive.

| Role | Rule |
|---|---|
| `designer`, `judge`, `reviewer`, `arena.design` | Among models with an intelligence index of at least 90 % of the best available, the cheapest |
| `implementer`, `verifier`, `arena.implementation` | Among models with a coding index of at least 75 % of the best available, the best coding index per dollar |
| `explorer` | Among models with a coding index of at least 50 % of the best available, the fastest, then the cheapest |

- **Arena roles** take the top 2 under their rule, from different vendors when possible. With fewer than 2 distinct models, write the role as `none`, which disables that arena on this harness. Tell the user.
- **Missing data**: rank that model by your own knowledge of its tier, and mark it with `*` in the table.

## Answers to the first-run prompt

- `later`: write `setup.<harness>: later`. The prompt comes back on the next run.
- `never`: write `setup.<harness>: never`. Models then follow your judgment with the tier rules above, and the prompt does not come back. `/leogpt setup` still works.
