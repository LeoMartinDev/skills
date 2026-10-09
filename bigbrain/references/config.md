# Configuration

Explicit execution settings live in `~/.agents/config/bigbrain.md`, outside any repo, so they never land in a commit.

## Read

Read the file at the start of every run. Missing keys or entries take their defaults. If it is absent, use the defaults until the next setup or explicit settings write. An existing config key always wins.

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
| `pr.max-lines` | `none` or a positive integer of changed lines per PR, tests included | `none` |
| `grill.max-rounds` | `feature=<n> bugfix=<n> maintenance=<n> plan=<n> grill=<n>` | `feature=3 bugfix=3 maintenance=3 plan=5 grill=5` |
| `grill.max-questions` | same shape, per round | `feature=4 bugfix=4 maintenance=4 plan=8 grill=4` |
| `verify.max-rounds` | integer | `3` |
| `loop.max-replans` | positive integer, structural returns per run | `3` |
| `repro.max-rounds` | positive integer, reproduction passes including the first | `3` |
| `watch.after-ship` | `true`, `false` | `false` |
| `watch.max-rounds` | positive integer, repair batches per watch run | `5` |
| `watch.timeout-minutes` | positive integer, total watch duration | `30` |
| `watch.poll-seconds` | integer >= 15 | `60` |
| `setup.<harness>` | `done <YYYY-MM-DD>`, `later`, `never` | unset (ask) |
| `models.<harness>` | `tier-or-role=model:effort, ...` (see below) | unset |

Loop limits are charged per `references/loop-control.md`. `later` means ask again on the next run. A setup older than 60 days earns a one-line suggestion to rerun `/bigbrain setup` in the final reply.

## PR budget

A cap applies only when `pr.max-lines` sets one or the repo documents one (agent docs, `CONTRIBUTING.md`, a bot config); when both do, the lower wins. Without a cap, skip size checks and never slice for line count.

With a cap, measure `git diff --shortstat <baseCommit>...<headCommit>` (`references/run-state.md#change-reference`), tests included, after each implementer or fix round. Up to the cap plus 5 %, ship as is. Beyond it: no verify, review, or push; switch to `playbooks/plan.md` and slice, reusing grounding, brief or sketch, and branch commits. The cap is a stop condition, never a target or a success criterion: no subagent compacts, reflows, or reindents code to fit. A non-blocking review fix that would cross it stays unapplied and is listed in the PR body; a blocking one puts the whole change over budget.

## Models

Tiers: `smart`, `code`, `fast`. Roles map to tiers:

| Tier | Roles |
|---|---|
| `smart` | `designer`, `judge`, `reviewer`, `verifier`, `arena.design` |
| `code` | `implementer` |
| `fast` | `explorer` |

A value is a native model slug, or a profile model for Delta, optionally followed by `:effort`. Each design arena entry can carry its own effort, e.g. `[provider/model-a:high, provider/model-b:medium]`. Bare slugs remain valid and preserve native defaults or inheritance; `none` keeps its existing meaning.

Resolve a role's model: its role key in `models.<harness>` (e.g. `reviewer=...`), else its tier key, else the harness-native config named in its harness file, else your judgment with the tier rules in `playbooks/setup.md`. `none` means the role has no model, and for an arena role, no arena.

Model and effort come from the same selected entry; never pair one entry's model with another's effort. Different efforts on one model are not distinct models.

## Effort

The `:effort` suffix is an execution setting, not part of the model ID: never pass it inside a model slug. Translate it through section 2 of the harness file, using only levels the harness and model actually support. An absent suffix or `:inherit` keeps the native default. If effort cannot be applied, keep the model and say so once.

Example: `models.pi: smart=opencode-go/muse-spark-1.3-contributor:high, code=opencode-go/muse-spark-1.3-contributor:high, fast=opencode-go/deepseek-v4.1-flash:low, arena.design=[opencode-go/mimo-v2.6-pro:high, opencode-go/glm-5.3-flash:high]`.

## Selection and fallback

**Distinct models.** When a brick asks a role for a model distinct from other roles' (the judge from the candidates, the design challenger from the designers), take another model of the same tier, from configuration or the harness's list, from a vendor they did not use when possible. When none exists, keep the resolved model and say so in one line.

Pass the model explicitly on every spawn, per section 2 of the harness file. If the harness rejects it, fall back to the inherited model, or for an arena, drop it, and say so in one line.

**Arena gate.** The one place that decides whether the design arena runs, at most once per run. It needs a named structural decision with several viable shapes and consequential tradeoffs (coupling, maintenance, migration, operations) that the request, local conventions, and grounded facts do not settle. Verify missing facts first; never manufacture candidates. Size or available models alone never qualify. Then apply the capability conditions below.

The arena runs when `arena.design` is not `never`, the harness has subagents, and enough distinct selectable models exist for `arena.candidates`, one per candidate. With only one selectable model, use one distinct angle per candidate. When diversity is insufficient otherwise, skip the arena. Say in one line when an arena is skipped or runs on one model, and recheck the gate after any fallback.
