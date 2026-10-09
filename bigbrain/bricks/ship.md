# Brick: ship

**Deliver a PR a teammate can review in a minute.** Branch, commit, and open a ready PR the way the repo already does it. Git safety follows `SKILL.md`.

## Change reference

Every diff for review, size, and comments is `git diff <baseCommit>...<headCommit>`. `baseBranch` is the PR's target (the stack parent, or the default branch), `baseCommit` its tip, and `headCommit` the commit under review. Resolve them before measuring or delegating work on a diff. Evidence holds only for the reference it checked: when either end moves, rerun the affected checks.

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

Before pushing, fetch the remote head and base. If either moved, update the change reference and have the caller re-verify what it affects. Push only past `bricks/verify.md#delivery-gate` and within the PR budget (`references/config.md#pr-budget`). Then open the PR ready, never as a draft: create with `gh pr create --base <baseBranch>` or update with `gh pr edit --base <baseBranch>`, and confirm the PR's head and base match the change reference. When `watch.after-ship` is true and a PR was pushed, run `bricks/pr-watch.md`. Report the URL and the watch result.

## PR body

Write it with `bricks/explain.md` from the final diff and recorded evidence, for a teammate who knows the codebase but has not seen the ticket, the plan, or this run. Every sentence must make sense and be true for that reader.

- **With a PR template** in the repo: fill it, keeping its headings, order, and language. Tick only the true checklist items. Pass the filled file with `gh pr create --body-file`, since `--body` skips the template.
- **Without one**: Why, What changes, Decisions, Verification, in the language of the repo's recent PRs. Drop any empty section.

Either way, link the ticket and keep it short.
