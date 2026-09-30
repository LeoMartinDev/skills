# Memory

User preferences live in `~/.agents/memory/leogpt.md`, outside any repo, so they never land in a commit.

## Read

Read the file at the start of every run. It may not exist: then every key takes its default.

The file has a `## global` section and optional `## repo: <owner>/<name>` sections. Resolve the repo name from `git remote get-url origin`, or from the top-level folder name when there is no remote. A repo section overrides the global section key by key.

## Write

When the user states a lasting preference ("from now on", "remember", "always", "never"), write it under the right section and confirm in one line. Ask "this repo or everywhere?" only when the scope is unclear. Create the file and its folder on first write. Never store secrets.

## Keys

| Key | Values | Default |
|---|---|---|
| `plan.destination` | `none`, `repo:<path>`, `home` (`~/.agents/plans/<repo>/`), `github-issue` | `none` |
| `finish` | `pr`, `draft-pr`, `stop` | `pr` |
| `arena.design` | `auto`, `never` | `auto` |
| `arena.implementation` | `auto`, `never` | `auto` |
| `arena.candidates` | integer >= 2 | `2` |
| `pr.max-lines` | changed lines per PR, tests included | `700` |
| `grill.max-rounds` | `feature=<n> bugfix=<n> plan=<n> grill=<n>` | `feature=3 bugfix=3 plan=5 grill=5` |
| `grill.max-questions` | same shape, per round | `feature=4 bugfix=4 plan=8 grill=4` |
| `verify.max-rounds` | integer | `3` |
| `setup.<harness>` | `done <YYYY-MM-DD>`, `later`, `never` | unset (ask) |
| `models.<harness>` | `role=model, ...` (see below) | unset |

A lower PR size cap documented in the repo (agent docs, `CONTRIBUTING.md`, a bot config) wins over `pr.max-lines`.

`later` means ask again on the next run. A setup older than 60 days earns a one-line suggestion to rerun `/leogpt setup` in the final reply.

## Models

Tiers: `smart`, `code`, `fast`. Roles map to tiers:

| Tier | Roles |
|---|---|
| `smart` | `designer`, `judge`, `reviewer`, `arena.design` |
| `code` | `implementer`, `verifier`, `arena.implementation` |
| `fast` | `explorer` |

A value is a model slug as the harness spells it, or a profile model for Delta. An arena role takes a list of models, e.g. `[opus, fable]`.

Resolve a role's model: its role key in `models.<harness>` (e.g. `reviewer=...`), else its tier key, else the harness-native config named in its harness file, else your judgment with the tier rules in `playbooks/setup.md`. `none` means the role has no model, and for an arena role, no arena.

**Distinct models.** When a brick asks a role for a model distinct from other roles' (the judge from the candidates, the design challenger from the designers), take another model of the same tier, from memory or the harness's list, from a vendor they did not use when possible. When none exists, keep the resolved model and say so in one line.

Pass the model explicitly on every spawn, per section 2 of the harness file. If the harness rejects it, fall back to the inherited model, or for an arena, drop it, and say so in one line.

**Arena gate.** The one place that decides whether an arena runs. It runs when its key is not `never`, the harness has subagents, and it can select at least 2 distinct models for the role: `arena.candidates` candidates, one distinct model each. With a single model, only `arena.design` runs, one distinct angle per candidate. Say in one line when an arena is skipped or runs on one model, and recheck the gate after any fallback.

## Example

```markdown
# leogpt memory

## global
- finish: pr
- setup.claude-code: done 2026-09-24
- models.claude-code: smart=opus, code=sonnet, fast=haiku, arena.design=[opus, fable], arena.implementation=none
- setup.zed: never

## repo: acme/app
- plan.destination: repo:plans/
- finish: draft-pr
```
