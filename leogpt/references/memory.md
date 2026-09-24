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
| `review.single-reviewer-max-diff` | changed lines | `700` |
| `grill.max-rounds` | `feature=<n> bugfix=<n> plan=<n> grill=<n>` | `feature=3 bugfix=3 plan=5 grill=5` |
| `grill.max-questions` | same shape, per round | `feature=4 bugfix=4 plan=8 grill=4` |
| `verify.max-rounds` | integer | `3` |
| `setup.<harness>` | `done <YYYY-MM-DD>`, `later`, `never` | unset (ask) |
| `models.<harness>` | `role=model, ...` (see below) | unset |

`later` means ask again on the next run. A setup older than 60 days earns a one-line suggestion to rerun `/leogpt setup` in the final reply.

## Models

Roles: `explorer`, `designer`, `implementer`, `verifier`, `reviewer`, `judge`, `arena.design`, `arena.implementation`. The two arena roles take a list.

A value is a model slug as the harness spells it, or `agent:<id>` for harnesses that fix the model per agent definition (opencode).

Resolve a role's model in this order:

1. `models.<harness>` in the repo section.
2. `models.<harness>` in the global section.
3. The harness-native config named in its harness file.
4. Your own judgment, using the tier rules in `playbooks/setup.md`.

An explicit `none` stops the resolution: that role has no model, and for an arena role, no arena.

If the harness rejects a model, fall back to the inherited model and say so in one line. For an arena role, drop the rejected model instead of replacing it.

**Arena gate.** An arena runs only when its role resolves to at least 2 distinct models the harness can actually select. Run as many candidates as `arena.candidates` allows, but never more than the number of distinct models. Recheck the gate after any fallback. Otherwise skip the arena and say so in one line. The same model twice is not an arena.

## Example

```markdown
# leogpt memory

## global
- finish: pr
- setup.claude-code: done 2026-09-24
- models.claude-code: explorer=haiku, designer=opus, judge=opus, reviewer=opus, implementer=sonnet, verifier=sonnet, arena.design=[opus, fable], arena.implementation=none
- setup.zed: never

## repo: georges-tech/georges
- plan.destination: repo:plans/
- finish: draft-pr
```
