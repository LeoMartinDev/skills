# Configuration

Explicit execution settings live in `~/.agents/config/bigbrain.md`, outside any repo, so they never land in a commit.

## Read

Read the file at the start of every run. Missing keys take their defaults. If it is absent, use the defaults until the next setup or explicit settings write. An existing config key always wins.

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
| `models.<harness>` | `tier-or-role=model:effort, ...` (see below) | unset |

A lower PR size cap documented in the repo (agent docs, `CONTRIBUTING.md`, a bot config) wins over `pr.max-lines`.

`later` means ask again on the next run. A setup older than 60 days earns a one-line suggestion to rerun `/bigbrain setup` in the final reply.

## Models

Tiers: `smart`, `code`, `fast`. Roles map to tiers:

| Tier | Roles |
|---|---|
| `smart` | `designer`, `judge`, `reviewer`, `verifier`, `arena.design` |
| `code` | `implementer` |
| `fast` | `explorer` |

A value is a native model slug, or a profile model for Delta, optionally followed by `:effort`. Each design arena entry can carry its own effort, e.g. `[provider/model-a:high, provider/model-b:medium]`. Bare slugs remain valid and preserve native defaults or inheritance; `none` keeps its existing meaning.

Resolve a role's model: its role key in `models.<harness>` (e.g. `reviewer=...`), else its tier key, else the harness-native config named in its harness file, else your judgment with the tier rules in `playbooks/setup.md`. `none` means the role has no model, and for an arena role, no arena.

Resolve model and effort together from the selected entry: an explicit role override replaces the tier's entire pair. A bare role override does not borrow the effort of a different tier model. When selecting a different model for a challenge or arena fallback, resolve its effort again. Different efforts on the same model do not count as distinct models.

## Effort

The suffix is an execution setting, not part of the model ID. Recognized labels are `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`; accept a label only when the installed harness and selected model support it. An absent suffix or `:inherit` preserves the native effort/default. Existing native selectors such as OMP's `:high` keep their meaning.

Translate the pair through section 2 of the harness adapter: a separate thinking/effort parameter, native model selector/variant, or profile setting. Never pass the skill suffix as an opaque model ID to a tool expecting a bare slug. Inspect actual controls before translating; do not invent an equivalent variant or silently promise the requested depth. If effort cannot be controlled or is clamped, retain the selected model, use its native supported behavior, and state the limitation once. A model without reasoning support has no adjustable effort.

Setup recommends and stores an explicit supported effort with each model, including every arena entry. Typical starting points are `high` for smart, `medium` for code, and `low` for fast; adapt to the user's preferences and model controls. Use `:inherit` when no explicit effort can be applied. These are setup recommendations, not defaults retroactively applied to existing bare entries.

Example: `models.pi: smart=opencode-go/muse-spark-1.3-contributor:high, code=opencode-go/muse-spark-1.3-contributor:high, fast=opencode-go/deepseek-v4.1-flash:low, arena.design=[opencode-go/mimo-v2.6-pro:high, opencode-go/glm-5.3-flash:high]`.

## Selection and fallback

**Distinct models.** When a brick asks a role for a model distinct from other roles' (the judge from the candidates, the design challenger from the designers), take another model of the same tier, from configuration or the harness's list, from a vendor they did not use when possible. When none exists, keep the resolved model and say so in one line.

Pass the model explicitly on every spawn, per section 2 of the harness file. If the harness rejects it, fall back to the inherited model, or for an arena, drop it, and say so in one line.

**Arena gate.** The one place that decides whether the design arena runs. It runs when `arena.design` is not `never`, the harness has subagents, and enough distinct selectable models exist for `arena.candidates`, one per candidate. With only one selectable model, use one distinct angle per candidate. When diversity is insufficient otherwise, skip the arena. Say in one line when an arena is skipped or runs on one model, and recheck the gate after any fallback.
