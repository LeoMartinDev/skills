# Brick: ship

Branch, commit, and deliver per the repo's conventions and the `finish` key in configuration.

## Branch

Feature, bugfix, and maintenance check the tree first, and create the branch only just before their first write.
The lead resolves `references/run-state.md#change-reference` and owns push and PR operations; git mutations follow `references/subagent-brief.md#rules`.

- **Unrelated uncommitted changes**: touch nothing. Stop and tell the user.
- **On the default branch**: create a branch named per the repo's pattern from the resolved `baseCommit`; use a resolved parent even when this checkout is on default.
- **On another branch**: continue on it if the task belongs there. Otherwise, create a new branch from the resolved `baseCommit` of `baseBranch`; use default only when it is the intended target.

## Conventions

Detect them once, then follow them exactly. Look for:

- a PR template (`.github/pull_request_template.md` and its variants);
- `CONTRIBUTING.md`, and agent docs such as `AGENTS.md` and `CLAUDE.md`;
- a PR or commit skill or rule in the repo. If one exists, it wins over everything below;
- the last 20 commit subjects and branch names.

With no convention: Conventional Commits (`type(scope): subject`, imperative, no trailing period), and a branch named `type/short-description`.

## Commits

- Small ordered commits, each a verifiable unit, per `principles/sequence-verifiable-units.md`. For a bugfix, the repro test comes just before the fix, as the only allowed red commit.
- Before committing, remove debug leftovers and commented-out code. Then list the comments the change adds (`git diff <baseCommit>...<headCommit>`, the added lines holding a comment) and keep only those that pass `principles/comment-the-why.md`.
- Clean up local history if needed. Never rewrite pushed history.
- Follow the harness or user rules on commit attribution.

## Finish

Before pushing, refresh the remote head and effective base. For a stack, check the parent branch (`git ls-remote --heads origin <baseBranch>`) and its PR. If merged, target the grounded default: the implementer may rebase an entirely unpushed child with `git rebase --onto origin/<default> <old base tip>`. A pushed child merges the new base per repo policy instead; stop if that would need rewriting pushed history. Never force-push.

If a rebase or merge moves the head or base, checkpoint the new reference and have the caller re-verify what it affects, plus review for material changes, before pushing. Confirm the remote still matches before delivery.

Push or update a PR only past `bricks/verify.md#delivery-gate` on the current reference; a user-authorized unfinished draft uses `draft-pr` whatever `finish` says. Measure the diff first; over budget, do not push (`references/config.md#pr-budget`). Otherwise act on `finish`:

- `stop`: leave the commits on the branch, do not push, and report.
- `pr`: push, then open a ready PR.
- `draft-pr`: push, then open a draft PR.

Create with `gh pr create --base <baseBranch>` or update with `gh pr edit --base <baseBranch>` (native tools use the same explicit target). Confirm the PR's head and base match the examined reference, checkpoint them, and attach the PR when supported. Never merge. When `watch.after-ship` is true, run `bricks/pr-watch.md` after a pushed PR, never after `stop` or an unfinished draft. Post the URL and the watch result or incomplete status.

## PR body

Before opening the PR, run `bricks/explain.md` from the final diff and recorded evidence, for a teammate who knows the codebase but has not seen the ticket, the plan, or this run. Every sentence must make sense and be true for that reader. Use the same brick for the final reply, including `finish=stop`; after watch repairs, refresh the explanation against the current head.

- **With a PR template** in the repo: fill it, keeping its headings, order, and language. Tick only the true checklist items. Pass the filled file with `gh pr create --body-file`, since `--body` skips the template.
- **Without one**: Why, What changes, Decisions, Verification, in the language of the repo's recent PRs. Drop any empty section.

Either way, link the ticket, keep it short, and keep every `unverified:` item.
