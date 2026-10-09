# Brick: ship

Branch, commit, and deliver per the repo's conventions and the `finish` setting. Git safety follows `SKILL.md`.

## Change reference

Before measuring or delegating work on a diff, resolve `baseBranch` (the PR's actual target, the stack parent, or the default branch when it is the intended target), its tip `baseCommit`, and the examined `headCommit`. Every diff for review, size, and comments is `git diff <baseCommit>...<headCommit>`, and the PR targets `baseBranch`. Evidence counts only for the reference it checked: when the reference moves, rerun the affected checks.

## Branch

Check the tree first, and create the branch just before the first write.

- **Unrelated uncommitted changes**: touch nothing; stop and tell the user.
- **On the default branch**: create a branch from `baseCommit`, named per the repo's pattern.
- **On another branch**: continue on it if the task belongs there; otherwise branch from `baseCommit`. A stacked change targets its parent branch, and only its own changes count.

## Conventions

Detect them once, then follow them exactly. Look for:

- a PR template (`.github/pull_request_template.md` and its variants);
- `CONTRIBUTING.md`, and agent docs such as `AGENTS.md` and `CLAUDE.md`;
- a PR or commit skill or rule in the repo. If one exists, it wins over everything below;
- the last 20 commit subjects and branch names.

With no convention: Conventional Commits (`type(scope): subject`, imperative, no trailing period), and a branch named `type/short-description`.

## Commits

- Small ordered commits, each a verifiable unit (`principles/sequence-verifiable-units.md`); a bugfix's repro test comes just before the fix.
- Before committing, remove debug leftovers and commented-out code, and keep only added comments that pass `principles/comment-the-why.md`.
- Follow the harness or user rules on commit attribution.

## Finish

Before pushing, fetch the remote head and base. If either moved, update the change reference and have the caller re-verify what it affects. Push only past `bricks/verify.md#delivery-gate` and within the PR budget (`references/config.md#pr-budget`). Then act on `finish`:

- `stop`: leave the commits on the branch, do not push, and report.
- `pr`: push, then open a ready PR.
- `draft-pr`: push, then open a draft PR.

Create with `gh pr create --base <baseBranch>` or update with `gh pr edit --base <baseBranch>`, and confirm the PR's head and base match the change reference. When `watch.after-ship` is true and a PR was pushed, run `bricks/pr-watch.md`. Report the URL and the watch result.

## PR body

Write it with `bricks/explain.md` from the final diff and recorded evidence, for a teammate who knows the codebase but has not seen the ticket, the plan, or this run. Every sentence must make sense and be true for that reader.

- **With a PR template** in the repo: fill it, keeping its headings, order, and language. Tick only the true checklist items. Pass the filled file with `gh pr create --body-file`, since `--body` skips the template.
- **Without one**: Why, What changes, Decisions, Verification, in the language of the repo's recent PRs. Drop any empty section.

Either way, link the ticket and keep it short.
