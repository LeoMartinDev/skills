# Use case: review

**The human reviews; you make it easy.** Turn a PR, branch, or diff into a guided page in their browser: what the change does, how its parts fit, and where to look hard. Subagents read the code and check your tour; you write it. You never approve, request changes, or post to GitHub: the page lets the reviewer submit their own review. To find defects yourself instead, the user asks for a critique (`bricks/interrogate.md`).

Commands below run `node scripts/guided-review.mjs`, which needs Node 18+, `git`, and `gh` for PRs.

1. **Collect.** Run `collect [TARGET] [--base REF]`. TARGET is a PR number or URL, a branch, or `base..head`; by default, the current branch against its base. It prints a review folder outside the repo, where reports and the tour also go. Read its `overview.md`: description, commits, changed files with numbered hunks, recent history, and where to read the code at the PR head. Create the worktree it names when the checkout is not at head.
2. **Intent.** From the description, linked issues (`gh issue view`), and commits, write one paragraph: what the change is for, and each claim of the description the code must show. With no description, take the intent from the commits and say so in the summary.
3. **Understand the change in its module.** Three read-only subagents, launched together, each briefed per `references/subagent-brief.md` with the intent, the review folder, the code at head, and a report path in the review folder:
   - **Module:** an `explorer (report)` with `references/prompts/explorer.md`, angle "the modules this PR touches, read whole at head": entry points, the runtime path through the changed code and the step each change sits on, key types, tests.
   - **History:** an `explorer (report)` with `references/prompts/investigator.md`. Question: what shaped each region the PR changes or deletes (commits, PRs, reverts, fixed bugs), and does the PR keep the reasons that still hold?
   - **Risk:** a `reviewer` with `references/prompts/reviewer.md`, angles A and C, at the head commit: failure scenarios, callers outside the diff, behavior no test covers, and description claims the code does not show.

   For a small PR (one module, under about 300 changed lines outside tests and generated files), read the module and its history yourself with targeted reads and launch only the risk reviewer. Past about 1,500 lines or across unrelated areas, give each area its own module explorer.
4. **Map, split, and order** (below), from the digests. Before turning a finding into a check, confirm it with one targeted read.
5. **Write** `tour.json` in the review folder per `references/tour-format.md` and `references/tour-writing.md`, in the user's language.
6. **Build.** Run `build FOLDER`. Fix every error; act on warnings unless you have a reason not to.
7. **Critique, every time.** A `verifier` with `references/prompts/tour-critic.md` and `references/tour-writing.md` to read first, given the review folder and the code at head, never the reports or your notes. Fix each `wrong` finding once one targeted read confirms it, and each `unclear` or `missing` one unless you record why not; then rebuild. Run a second critique only if you rewrote a whole step.
8. **Open.** For a PR, start `serve FOLDER` in the background: the reviewer can comment on diff lines and submit through `gh`, and it stops 15 minutes after the page is closed. Otherwise run `build FOLDER --open`. Remove the head worktree if you created one.

**Reply:** the page link, the step titles, the one or two points most worth a look, and what the critique corrected. No verdict.

## Map, split, and order

The reader must always know what they are reviewing, why it comes now, and how it connects to the rest.

**Map the flow.** `flow` lists the 3 to 7 places the change runs through, in execution order (screen, component, store, API, job), each tagged with the step that explains it. A change with no runtime path takes the order a reader needs instead: the new shape, one representative caller, then the repetitions; or the data's path from writer to reader.

**Split along the flow, by relatedness.** A step covers one place or a few consecutive ones, with the test that proves them: a definition and its use, a behavior and its test. A step that needs "also" is two steps. A step holds about four new ideas and a few hundred changed lines at most. A change repeated across many files is one step showing one or two examples. Aim for 3 to 6 steps; past 8, tell the user the PR probably bundles several changes.

**Order along the flow**, so each step relies only on the summary and earlier steps. Renames, formatting, generated files, and configuration come last or in `skipped`. Each step after the first opens with `link`: one sentence on how it follows from the previous one.

**Rate each step.** `risk` sets a reading hint, not the order: `high` for state, concurrency, error paths, money, security, data loss, or changed behavior for callers; `medium`; `low` to skim.
