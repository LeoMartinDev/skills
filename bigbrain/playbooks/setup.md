# Playbook: setup

Pick one model and effort per tier (`smart`, `code`, `fast`) for the current harness, have the user confirm, and store the choices. Runs in the main thread, since it talks to the user.

Copy these steps into your todo list verbatim.

1. **List the available models** per the harness file, section 3. If the harness picks no model per tier (see section 2), say so. Configure only what it supports.
2. **Assess the available models yourself**, using the role guidance below, the user's priorities, and the harness's actual model controls. Do not fetch benchmark rankings. State uncertainty when you do not know a model; do not invent capabilities, prices, speed measurements, or scores. If a recommendation depends on current product facts, verify only those facts in the provider's official documentation.
3. **Draft a selection.** One model/effort pair per tier (`smart`, `code`, `fast`) with useful alternatives when available, and one pair per design arena candidate. Apply `references/config.md#effort`, checking the actual supported levels; tiers may share a model with different efforts.
4. **Propose.** Show a compact table: tier or design arena, model, effort, alternatives, and why. Explain the relevant quality, latency, and cost tradeoffs qualitatively; include numbers only when verified. Confirm model and effort together rather than adding separate effort questions.
5. **Confirm.** One question per tier and for the design arena through the choice tool: the pick first, marked "(Recommended)", then the alternatives. Batch the questions per the harness's limits.
6. **Write** `models.<harness>` and `setup.<harness>: done <YYYY-MM-DD>` in the global section of configuration. Then write the harness-native config (section 6 of its file), showing it before writing.
7. **Reply** with the confirmed choices and where they were stored.

## Tier rules

Use your judgment to recommend models appropriate to each role. Favor quality for reasoning and verification, reliable coding for implementation, and low latency and cost for exploration. Account for the user's subscription and priorities when known.

| Tier | Rule |
|---|---|
| `smart` | Strong reasoning for design, judging, review, and verification |
| `code` | Reliable implementation and tool use in the codebase |
| `fast` | Efficient exploration and factual lookup, with enough capability for the assigned scope |

- **Design arena** (`arena.design`) uses suitable distinct models, from different vendors when useful and available. Propose enough models for `arena.candidates` when possible. With a single model, write it anyway: the arena gate in `references/config.md` decides what runs. With no usable model, write `none`, which disables that arena on this harness. Tell the user.

## Answers to the first-run prompt

- `later`: write `setup.<harness>: later`. The prompt comes back on the next run.
- `never`: write `setup.<harness>: never`. Models then follow your judgment with the tier rules above, and the prompt does not come back. `/bigbrain setup` still works.
