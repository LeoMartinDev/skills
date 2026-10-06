# heyleo

**Give your coding agent a task. It coordinates the work and checks the result.**

heyleo is a personal engineering skill for building features, fixing bugs, planning changes, and reviewing code. The main agent acts as the lead: it makes decisions and delegates exploration, implementation, verification, and review to subagents.

```text
/heyleo add a CSV export to the invoices list
```

For features and fixes, the default outcome is an open pull request with the decisions and verification evidence. If the request is clear, the agent works through it autonomously. If a product or scope decision needs your input, it asks.

## Install

```bash
npx skills add LeoMartinDev/heyleo -g
```

Then run this once in each coding agent to choose models for the different roles:

```text
/heyleo setup
```

Setup is optional. You can defer it or keep the agent's model choices.

Supported agents: Claude Code, Cursor, Delta, omp, opencode, Pi, and Zed. Other agents use a generic fallback and report unavailable capabilities. In omp, use `/skill:heyleo` instead of `/heyleo`.

## Use it

Write a request after `/heyleo`. You can also pass a GitHub issue URL, a Notion page, or a saved plan.

| What you want | Example |
|---|---|
| Build a feature | `/heyleo add a CSV export to the invoices list` |
| Fix a bug | `/heyleo the dashboard total is off by one cent` |
| Plan a larger change | `/heyleo plan the migration to the new numbering` |
| Implement part of a plan | `/heyleo implement slice 2 of plans/numbering.md` |
| Understand code | `/heyleo how does invoice numbering work?` |
| Review changes | `/heyleo review this branch` |
| Challenge an idea | `/heyleo grill my idea: cache VAT rates per org` |
| Watch a pull request | `/heyleo watch-pr 123` |
| Continue saved work | `/heyleo resume <run-id or state-path>` |

Plans, explanations, reviews, and idea discussions stop at their result. A PR watch checks CI and reviews, repairs verified findings, and stops when ready or when its limits are reached. The skill never merges pull requests.

## How it works

A feature follows this flow:

```text
Understand → Design → Implement → Verify + Review → Open a PR
```

For a bug, the agent first reproduces the failure and identifies its cause. Large changes become a plan of smaller PRs.

The lead keeps decisions and short summaries in its context. Subagents handle the detailed work, and a fresh verifier checks the result independently. Verification includes relevant checks, tests, and a real run through the user entry point; anything it cannot check is reported explicitly.

PRs default to a limit of 700 changed lines, including tests, with a 5% tolerance. If no result passes verification within the repair limit, the agent stops and explains the blocker.

## Preferences

Change lasting preferences in plain language:

```text
/heyleo from now on, open PRs as drafts here
```

Settings live in `~/.agents/config/heyleo.md`, with global defaults and optional overrides per repository. Project knowledge and resumable checkpoints are stored separately, outside your checkout.

Renamed from **leogpt**: existing configuration is read as a fallback and copied on the next settings write. Old checkpoints can still be resumed. For the exact settings and defaults, see [configuration](heyleo/references/config.md).

## Develop locally

Clone the repository and link the skill so edits apply immediately:

```bash
git clone git@github.com:LeoMartinDev/heyleo.git
cd heyleo
mkdir -p ~/.agents/skills ~/.claude/skills
ln -s "$PWD/heyleo" ~/.agents/skills/heyleo
ln -s ~/.agents/skills/heyleo ~/.claude/skills/heyleo
```

The skill is organized into small files loaded as needed:

- [SKILL.md](heyleo/SKILL.md): entry point, routing, and lead rules.
- [Playbooks](heyleo/playbooks/): feature, bugfix, plan, and setup workflows.
- [Bricks](heyleo/bricks/): reusable steps such as exploration, implementation, review, and shipping.
- [Principles](heyleo/principles/): engineering rules applied when relevant.
- [References](heyleo/references/): settings, memory, checkpoints, and agent adapters.

Keep each skill file under 80 lines and check referenced paths when editing. To validate behavior, run a clear feature request and a vague request in a sandbox repository: the first should proceed, and the second should ask for the missing decisions.

## Credits

Flow and principles adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto (Lauren Tan).
