# Brick: ship

Branch, commit, and deliver per the repo's conventions and the `finish` key in configuration.

## Branch

Feature, bugfix, and maintenance check the tree first, and create the branch only just before their first write.

- **Unrelated uncommitted changes**: touch nothing. Stop and tell the user.
- **On the default branch**: create a branch named per the repo's pattern.
- **On another branch**: continue on it if the task belongs there. Otherwise, create a new branch from the up-to-date default branch.

## Conventions

Detect them once, then follow them exactly. Look for:

- a PR template (`.github/pull_request_template.md` and its variants);
- `CONTRIBUTING.md`, and agent docs such as `AGENTS.md` and `CLAUDE.md`;
- a PR or commit skill or rule in the repo. If one exists, it wins over everything below;
- the last 20 commit subjects and branch names.

With no convention: Conventional Commits (`type(scope): subject`, imperative, no trailing period), and a branch named `type/short-description`.

## Commits

- Small ordered commits, each a verifiable unit, per `principles/sequence-verifiable-units.md`. For a bugfix, the repro test comes just before the fix, as the only allowed red commit.
- Before committing, remove debug leftovers and commented-out code. Then list the comments the branch adds (`git diff <default>...HEAD`, the added lines holding a comment) and keep only those that pass `principles/comment-the-why.md`.
- Clean up local history if needed. Never rewrite pushed history.
- Follow the harness or user rules on commit attribution.

## Finish

Before pushing a branch stacked on another branch, check that its base still exists on the remote (`git ls-remote --heads origin <base>`) and that its PR is still open. If it was merged, rebase with `git rebase --onto origin/<default> <old base tip>`, rerun the tests covering the change, and target the default branch.

Read `finish` from configuration. Measure the diff with `git diff --shortstat <default>...HEAD`. Over budget, do not push: apply the PR budget rule in `references/config.md#pr-budget`.

- `stop`: leave the commits on the branch, do not push, and report.
- `pr`: push, then open a ready PR.
- `draft-pr`: push, then open a draft PR.

Attach every created PR when the harness has a PR attachment tool, and checkpoint its URL and head per `references/run-state.md`. Never merge. When `watch.after-ship` is true, run `bricks/pr-watch.md` after opening or updating the PR (ready or draft); otherwise stop monitoring here. Post the URL and any watch result in the final reply. `finish=stop` never starts a watch.

## PR body

Before opening the PR, run `bricks/explain.md` from the final diff and recorded evidence, for a teammate who knows the codebase but has not seen the ticket, the plan, or this run. Every sentence must make sense and be true for that reader. Write the PR title, body, and commit messages per `principles/plain-prose.md`. Use the same brick for the final reply, including `finish=stop`; after watch repairs, refresh the explanation against the current head.

- **With a PR template** in the repo: fill it, keeping its headings, order, and language. Tick only the true checklist items. Pass the filled file with `gh pr create --body-file`, since `--body` skips the template.
- **Without one**: Why, What changes, Decisions, Verification, in the language of the repo's recent PRs. Drop any empty section.

Either way, link the ticket, keep it short, and keep every `unverified:` item.
