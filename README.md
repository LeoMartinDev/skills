# bigbrain

<p align="center">
  <img width="320" alt="bigbrain" src="https://github.com/user-attachments/assets/9c018297-e19b-4601-b6d8-26966d2c39c1" />
</p>

**Give your coding agent a task. It coordinates the work and checks the result.**

bigbrain is a skill for coding agents. The main agent acts as the lead: it makes the decisions and hands exploration, implementation, verification, and review to subagents. For a feature, fix, refactor, or chore, you get an open pull request with the decisions and the proof that it works.

```text
/bigbrain add a CSV export to the invoices list
```

Heavily inspired by [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto (Lauren Tan).

## Install

```bash
npx skills add LeoMartinDev/skills -g
```

Then, optionally, choose models for each role:

```text
/bigbrain setup
```

Works with Claude Code, Cursor, Delta, omp, opencode, Pi, and Zed. In omp, use `/skill:bigbrain`. Update with `npx skills update bigbrain -g`.

## Use it

Write a request after `/bigbrain`. It also accepts a GitHub issue URL, a Notion page, or a saved plan.

| What you want | Example |
|---|---|
| [Build a feature or a chore](bigbrain/usecases/feature.md) | `/bigbrain add a CSV export to the invoices list` |
| [Fix a bug](bigbrain/usecases/bugfix.md) | `/bigbrain the dashboard total is off by one cent` |
| [Refactor](bigbrain/usecases/refactoring.md) | `/bigbrain simplify invoice calculation` |
| [Plan a larger change](bigbrain/usecases/plan.md) | `/bigbrain plan the migration to the new numbering` |
| [Implement part of a plan](bigbrain/usecases/plan.md#execute-a-saved-slice) | `/bigbrain implement slice 2 of plans/numbering.md` |
| [Understand code](bigbrain/bricks/how.md) | `/bigbrain how does invoice numbering work?` |
| [Find out why code is the way it is](bigbrain/bricks/why.md) | `/bigbrain why does numbering retry three times?` |
| [Review a pull request](bigbrain/usecases/guided-review.md) | `/bigbrain review PR 123` |
| [Critique changes](bigbrain/bricks/interrogate.md) | `/bigbrain critique this branch` |
| [Challenge an idea](bigbrain/bricks/grill.md) | `/bigbrain grill my idea: cache VAT rates per org` |
| [Watch a pull request](bigbrain/bricks/pr-watch.md) | `/bigbrain watch-pr 123` |
| [Continue earlier work](bigbrain/usecases/resume.md) | `/bigbrain resume feat/csv-export` |

Plans, explanations, reviews, and idea discussions stop at their result. Each link leads to the full workflow.

## What to expect

- **It asks only what it must.** A clear request runs on its own. A product or scope decision that only you can make pauses the work that depends on it.
- **Every change is proven.** A separate verifier runs the CI checks, the tests, and the real entry point when it can. A risky change also gets reviewers. Nothing ships without passing evidence on the current commit.
- **It never merges and never force-pushes.** The PR opens ready for review. Large changes become a plan of smaller PRs.
- **It stops instead of looping.** It retries only when something new has come up since the last attempt. Otherwise it reports what it tried.

## Guided review

`/bigbrain review PR 123` opens the pull request as a page in your browser. You do the review; the agent explains the change and points out its doubts. It never posts anything by itself.

- **Tour:** the change in ten lines, then a reading path that follows the code from screen to API, with comments on the key lines and questions worth asking.
- **Files:** the classic view, with a file tree, full diffs, and a "viewed" checkbox.

You can comment on lines, suggest changes, and submit the review to GitHub from the page through your `gh` login. Keys: `←` `→` steps, `t` mode, `j` `k` files, `v` viewed, `[` sidebar. Requires Node 18+, `git`, and `gh`.

## Preferences

Set lasting preferences in plain language:

```text
/bigbrain from now on, save plans as GitHub issues here
```

They are saved in `~/.agents/config/bigbrain.md`. See [configuration](bigbrain/references/config.md) for every setting.

## Credits

bigbrain builds on [pstack](https://github.com/cursor/plugins/tree/main/pstack): its engineering principles, its delegation model, and the format of its playbooks. bigbrain is a smaller personal take, packaged as one skill that runs in several coding agents and stops at an open pull request. It does not need pstack to work.

To work on bigbrain itself, see [CONTRIBUTING.md](CONTRIBUTING.md).
