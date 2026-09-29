# Brick: ship

Branch, commit, and deliver per the repo's conventions and the `finish` key in memory.

## Branch

Feature and bugfix check the tree first, and create the branch only just before their first write.

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

Write it last, from the final diff. The reader is a teammate who knows the codebase but has not read the ticket, the plan, or this run.

**With a template** (`.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, `docs/pull_request_template.md`, or `PULL_REQUEST_TEMPLATE.md` at the root, in any case): start from its exact content. Keep its headings, their order, and its language. Fill every section, tick only the checklist items that are true, and delete the placeholder comments. Add no section of your own: decisions, verification, and unverified items go into the closest template section, or stay in the final reply when none fits. `gh pr create --body` skips the template, so pass the filled file with `--body-file`.

**Without a template**, use these sections and drop any that are empty:

- **Why**: what was missing or broken, and why it matters.
- **What changes**: the change in a few bullets.
- **Decisions**: only the ones a reviewer might question.
- **Verification**: the checks run, then the `unverified:` items.

**Style**, in both cases:

- Write in the template's language, or in the language of the repo's recent PRs.
- Open with the problem from the user's side, in product words, before any code.
- Give the context a reviewer needs and nothing more. Link the ticket and any parent or stacked PR, and say in a few words what each one is.
- Never use labels that only exist in this run or its plan: "PR1", "slice 3", "the sketch", "candidate B", "found in review", "the contract".
- Explain in plain words. Name a symbol or a path only when the reviewer needs it to find something. No file-by-file tour, no list of helper names.
- One short sentence per decision: the choice and why. Drop the alternatives unless a reviewer would ask for them.
- One line per check: what it proves, then the command. Keep every `unverified:` item.
- Aim for about 20 lines outside the template's own text, readable in under a minute.

Before opening the PR, reread each sentence as that teammate. Rewrite any sentence that needs the ticket or this run to make sense.
