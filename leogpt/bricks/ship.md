# Brick: ship

Branch, commit, and deliver per the repo's conventions and the `finish` key in memory.

## Branch

Run this at the start of feature and bugfix.

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
- Before committing, remove debug leftovers, commented-out code, and comments that narrate the change.
- Clean up local history if needed. Never rewrite pushed history.
- Follow the harness or user rules on commit attribution.

## Finish

Read `finish` from memory.

- `stop`: leave the commits on the branch, do not push, and report.
- `pr`: push, then open a ready PR.
- `draft-pr`: push, then open a draft PR.

Never merge, and do not babysit CI after opening. Post the URL in the final reply.

## PR body

Fill the repo's template when there is one. Otherwise use these sections, dropping any that are empty:

- **Why**: the intent, in one or two short paragraphs.
- **What changes**: bullets naming real symbols and paths.
- **Decisions**: one line per decision taken alone (choice, alternatives, why).
- **Verification**: each command or run and its outcome, then the `unverified:` items.

Write plainly: short sentences, no filler, no "Summary" or "Test plan" boilerplate, no file-by-file essay. A reviewer who has the diff should learn why the change exists and how it was proven.
