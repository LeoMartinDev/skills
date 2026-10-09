# Configuration

Settings live in `~/.agents/config/bigbrain.md`, outside any repo.

## Read

Read the file at the start of every run; missing keys take their defaults. It has a `## global` section and optional `## repo: <owner>/<name>` sections that override it key by key.

The repo is `<owner>/<name>` from `git remote get-url origin`, or the top-level folder name without a remote. Wherever a path needs it, use the **repo slug** `<owner>-<name>`, keeping only letters, digits, `.`, `_`, and `-`.

## Write

When the user states a lasting preference ("from now on", "always", "never"), write it under the right section and confirm in one line. Ask "this repo or everywhere?" only when unclear. Create the file on first write. Never store secrets.

## Keys

| Key | Values | Default |
|---|---|---|
| `plan.destination` | `none`, `repo:<path>`, `home` (`~/.agents/plans/<repo slug>/`), `github-issue` | `none` |
| `pr.max-lines` | `none` or changed lines per PR, tests included | `none` |
| `watch.after-ship` | `true`, `false` | `false` |
| `setup.<harness>` | `done <YYYY-MM-DD>`, `later`, `never` | unset (ask) |
| `models.<harness>` | `tier-or-role=model:effort, ...` (see below) | unset |

## PR budget

`pr.max-lines` caps the changed lines per PR, tests included. Without it, never check or slice for size.

With a cap, measure `git diff --shortstat` on the change reference after each implementation or repair. Over the cap, do not push: switch to `usecases/plan.md` and slice, reusing the work done. The cap is a stop condition, never a target: nobody compacts code to fit.

## Models

Tiers: `smart`, `code`, `fast`. Roles map to tiers:

| Tier | Roles |
|---|---|
| `smart` | `designer`, `judge`, `reviewer`, `verifier`, `arena.design` |
| `code` | `implementer` |
| `fast` | `explorer` |

A value is a native model slug, or a profile for Delta, optionally followed by `:effort`; `none` disables the role, and for `arena.design`, the arena. Each arena entry carries its own effort, e.g. `[provider/model-a:high, provider/model-b:medium]`.

Resolve a role's model: its role key in `models.<harness>` (e.g. `reviewer=...`), else its tier key, else the harness-native config named in its adapter, else your judgment per `usecases/setup.md#tier-rules`. Model and effort always come from the same entry.

The `:effort` suffix is never part of the model ID: translate it through section 2 of the adapter, using only levels the harness and model support. Without a suffix, or with `:inherit`, keep the native default. If effort cannot be applied, keep the model and say so once.

Example: `models.pi: smart=opencode-go/muse-spark-1.3-contributor:high, code=opencode-go/muse-spark-1.3-contributor:high, fast=opencode-go/deepseek-v4.1-flash:low, arena.design=[opencode-go/mimo-v2.6-pro:high, opencode-go/glm-5.3-flash:high]`.

## Selection and fallback

When a brick asks for a model distinct from other roles' (the judge from the candidates, the challenger from the designers), take another model of the same tier, from another vendor when possible; with none, keep the resolved one and say so in one line.

Pass the model explicitly on every spawn. If the harness rejects it, fall back to the inherited model, or for an arena skip it, and say so in one line.
