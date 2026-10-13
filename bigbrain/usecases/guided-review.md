# Use case: guided review

**The human reviews; you make it easy.** Turn a PR, branch, or diff into a guided page in their browser: what the change does, how its parts fit, and where to look hard. Subagents read the code and check your tour; you write it. You never approve, request changes, or post to GitHub: the page lets the reviewer submit their own review. To find defects yourself instead, the user asks for a critique (`bricks/interrogate.md`).

Commands below run `node scripts/guided-review.mjs`, which needs Node 18+, `git`, and `gh` for PRs. Skip step 4 of the skill's start, since `collect` fetches the PR, and the **Learn** rule.

1. **Collect.** Run `collect [TARGET] [--base REF]`. TARGET is a PR number or URL, a branch, or `base..head`; by default, the current branch against its base. It prints a review folder outside the repo, where reports and the tour also go. Read its `overview.md`: description, commits, changed files with numbered hunks, the commits that last wrote each changed or deleted line, and where to read the code at the PR head. Create the worktree it names when the checkout is not at head.
2. **Intent.** From the description, linked issues (`gh issue view`), and commits, write one paragraph: the problem the change solves, in the product's terms, what the change is for, and each claim of the description the code must show. With no description, take the intent from the commits and say so in the summary.
3. **Understand the change in its module.** Read-only subagents, launched together, each briefed per `references/subagent-brief.md` with the intent, the review folder, the code at head, and a report path in the review folder:
   - **Risk**, always: a `reviewer` with `references/prompts/reviewer.md` at the head commit, angles A and C, and from angle B only logic the PR duplicates or a layer it may not need. It looks for failure scenarios, callers outside the diff, behavior no test covers, and description claims the code does not show. At most 8 findings, each with a failure scenario; no nits.
   - **Module**, past about 700 changed lines outside tests and generated files: an `explorer (report)` with `references/prompts/explorer.md`, angle "the modules this PR touches, read whole at head": entry points, the runtime path through the changed code and the step each change sits on, key types, tests. Past about 1,500 lines or across unrelated areas, one per area. Below 700 lines, read the module yourself with targeted reads.

   History comes from the line origins in `overview.md`. Only when the PR removes or loosens a guard, workaround, retry, or limit whose reason those commits do not show, run `bricks/why.md` on that region alone.
4. **Map, split, and order** (below), from the digests. Before turning a finding into a check, confirm it with one targeted read; send these reads together.
5. **Write** `tour.json` in the review folder per `references/tour-format.md` and `references/tour-writing.md`, in the user's language.
6. **Build.** Run `build FOLDER`. Fix every error; act on warnings unless you have a reason not to.
7. **Critique, every time.** A `verifier` on the `code` tier's model (`references/config.md#models`), with `references/prompts/tour-critic.md`, `references/tour-writing.md`, and `principles/plain-prose.md` to read first, given the review folder and the code at head, never the reports or your notes. Confirm its `wrong` findings with targeted reads sent together, fix each confirmed one, and each `unclear` or `missing` one unless you record why not; then rebuild. Run a second critique only if you rewrote a whole step.
8. **Open.** For a PR, start `serve FOLDER` in the background, its output unfiltered: a pipe holds back the URL it prints. The reviewer comments on diff lines or ranges, as on GitHub, and submits the review through `gh`; the server stops 15 minutes after the page is closed. Otherwise run `build FOLDER --open`. Remove the head worktree if you created one.

**Reply:** the page link, the step titles, the one or two points most worth a look, and what the critique corrected. No verdict.

## Map, split, and order

The reader must always know what they are reviewing, why it comes now, and how it connects to the rest.

**Map the flow.** `flow` lists the 3 to 7 places the change runs through, in execution order (screen, component, store, API, job), each tagged with the step that explains it. A change with no runtime path takes the order a reader needs instead: the new shape, one representative caller, then the repetitions; or the data's path from writer to reader.

**Split along the flow, by relatedness.** A step covers one place or a few consecutive ones, with the test that proves them: a definition and its use, a behavior and its test. A step that needs "also" is two steps. A step holds about four new ideas and a few hundred changed lines at most. A change repeated across many files is one step showing one or two examples. Aim for 3 to 6 steps; past 8, tell the user the PR probably bundles several changes.

**Order along the flow**, so each step relies only on the summary and earlier steps. Renames, formatting, generated files, and configuration come last or in `skipped`. Each step after the first opens with `link`: one sentence on how it follows from the previous one.

**Rate each step.** `risk` sets a reading hint, not the order: `high` for state, concurrency, error paths, money, security, data loss, or changed behavior for callers; `medium`; `low` to skim.
