# Configuration

Explicit execution settings live in `~/.agents/config/leogpt.md`, outside any repo, so they never land in a commit.

## Read

Read the file at the start of every run. Missing keys take their defaults. If it is absent, read recognized settings from the legacy `~/.agents/memory/leogpt.md`. On the next setup or explicit settings write, copy recognized legacy keys to the new config first, preserve repo sections, and keep the legacy file untouched. An existing config key always wins.

The file has a `## global` section and optional `## repo: <owner>/<name>` sections. Resolve the repo name from `git remote get-url origin`, or from the top-level folder name when there is no remote. A repo section overrides the global section key by key.

## Write

When the user states a lasting execution preference ("from now on", "remember", "always", "never"), write it under the right section and confirm in one line. Ask "this repo or everywhere?" only when the scope is unclear. Create the file and its folder on first write. Never store secrets.

## Keys

| Key | Values | Default |
|---|---|---|
| `plan.destination` | `none`, `repo:<path>`, `home` (`~/.agents/plans/<repo>/`), `github-issue` | `none` |
| `finish` | `pr`, `draft-pr`, `stop` | `pr` |
| `arena.design` | `auto`, `never` | `auto` |
| `arena.candidates` | integer >= 2 | `2` |
| `pr.max-lines` | changed lines per PR, tests included | `700` |
| `grill.max-rounds` | `feature=<n> bugfix=<n> plan=<n> grill=<n>` | `feature=3 bugfix=3 plan=5 grill=5` |
| `grill.max-questions` | same shape, per round | `feature=4 bugfix=4 plan=8 grill=4` |
| `verify.max-rounds` | integer | `3` |
| `watch.after-ship` | `true`, `false` | `false` |
| `watch.max-rounds` | positive integer, repair batches per watch run | `5` |
| `watch.timeout-minutes` | positive integer, total watch duration | `30` |
| `watch.poll-seconds` | integer >= 15 | `60` |
| `setup.<harness>` | `done <YYYY-MM-DD>`, `later`, `never` | unset (ask) |
| `models.<harness>` | `role=model, ...` (see below) | unset |

A lower PR size cap documented in the repo (agent docs, `CONTRIBUTING.md`, a bot config) wins over `pr.max-lines`.

`later` means ask again on the next run. A setup older than 60 days earns a one-line suggestion to rerun `/leogpt setup` in the final reply.

## Models

Tiers: `smart`, `code`, `fast`. Roles map to tiers:

| Tier | Roles |
|---|---|
| `smart` | `designer`, `judge`, `reviewer`, `verifier`, `arena.design` |
| `code` | `implementer` |
| `fast` | `explorer` |

A value is a model slug as the harness spells it, or a profile model for Delta. An arena role takes a list of models, e.g. `[opus, fable]`.

Resolve a role's model: its role key in `models.<harness>` (e.g. `reviewer=...`), else its tier key, else the harness-native config named in its harness file, else your judgment with the tier rules in `playbooks/setup.md`. `none` means the role has no model, and for an arena role, no arena.

**Distinct models.** When a brick asks a role for a model distinct from other roles' (the judge from the candidates, the design challenger from the designers), take another model of the same tier, from configuration or the harness's list, from a vendor they did not use when possible. When none exists, keep the resolved model and say so in one line.

Pass the model explicitly on every spawn, per section 2 of the harness file. If the harness rejects it, fall back to the inherited model, or for an arena, drop it, and say so in one line.

**Arena gate.** The one place that decides whether the design arena runs. It runs when `arena.design` is not `never`, the harness has subagents, and enough distinct selectable models exist for `arena.candidates`, one per candidate. With only one selectable model, use one distinct angle per candidate. When diversity is insufficient otherwise, skip the arena. Say in one line when an arena is skipped or runs on one model, and recheck the gate after any fallback.
