# Use case: plan

**You own the plan, not the code.** The plan is the deliverable: slices that `/bigbrain` later runs one by one, each with the evidence that checks it. Do not implement. Coming from feature or refactoring, reuse what is settled: the flow, answered questions, mental model, baseline, and brief.

1. When the change fits one PR with an obvious, low-risk approach, skip the plan: say so, offer that use case, and stop. One PR with a risky migration, uncertain integration, or consequential product decision gets a one-slice plan.
2. Settle the open questions before writing. Product and scope calls go through `bricks/grill.md`. For a raw idea, establish who has the problem, what happens today, the desired outcome, and the smallest useful scope with its exclusions.
3. Ground in subagents with `bricks/how.md`: file pointers, conventions, entry points, and the repo's obligatory checks, at a recorded commit. Write the criteria per the Ticket items rule in `SKILL.md`; for a refactor, add the contracts to preserve and the baseline. If the work proves simple, stop per step 1.
4. Set the approach: a compact brief, or `bricks/architect.md` when its When to run section applies.
5. Slice per `principles/sequence-verifiable-units.md`. Each slice is one PR that works end to end, passes the obligatory checks, fits `references/config.md#pr-budget`, and can be checked by running it. Riskiest unknown first, as the thinnest slice that proves it. Never slice by layer; a foundation slice (schema, types) goes first only when later slices need it. Prefer slices a user can observe; one proven by its tests alone is fine when the next slice wires it. Replacing an internal API migrates its callers and deletes the old one in a single slice (`principles/migrate-callers-then-delete-legacy-apis.md`).
6. Fill the template below: pointers and decisions, not code. Map every criterion to the slice that satisfies it and its verification. Omit empty sections.
7. Challenge it. A read-only `reviewer` checks coverage, dependency order, and whether each slice is testable alone, fits the budget, and leaves a working state. Resolve every concrete gap it returns. A still-open human decision goes under "Decisions to validate", and every slice depending on it is marked blocked.
8. Save per `plan.destination`: `none` (conversation only), `repo:<path>` (`<path>/<slug>.md`), `home` (`~/.agents/plans/<repo slug>/<slug>.md`), or `github-issue` (`gh issue create` with the plan as body). Then stop.

**Reply:** where the plan lives, the slices in order, the decisions to validate or blockers, and how to run a slice: `/bigbrain implement slice <n> of <plan location>`. With `none`, offer once to save it.

## Template

```markdown
# <Change> plan

<Up to 5 lines: what changes, for whom, and the target shape in one sentence.>

## Scope
- **Flow**: <feature | refactoring>
- **Problem and outcome**: <current problem and desired observable result>
- **In scope**: <smallest useful scope>
- **Out of scope**: <explicit exclusions>
## Grounding
- **Repo and reference**: <repo identity, explored commit, relevant local changes>
- **Assumptions**: <important claim, source or evidence, and dependent slices>
- **Invariants**: <contracts and behavior the slices must preserve>
## Success criteria
- C1: <verbatim ticket item, or observable behavior>. Covered by slice <n>, verified by <case or real run>.
## Decisions
- <decision> (by: user | agent). <why>
## Decisions to validate
- <still-open human decision and the slices it blocks>

## Slice <n>: <verb phrase>
- **Depends on**: <slice or none>
- **Prerequisites**: <assumptions to recheck, required earlier behavior, blocker, or none>
- **Criteria**: <criterion IDs this slice satisfies; or intermediate contribution>
- **Files**: <paths to create, edit, or delete>
- **Build**: <responsibilities, interfaces, and invariants; relevant existing symbols>
- **You see**: <observable behavior, concrete simplification, or operational result>
- **Verify**: <obligatory repo/CI commands and scopes>; <test command and the case it adds>; <real run and expected result>
- **Size**: <estimated changed lines including tests; main uncertainty>

## Risks
- <risk>: <the slice where it lands, what to watch>
## Rejected alternatives
- <approach>: <why it lost>
```

## Execute a saved slice

Confirm the repo, compare the current code with the plan's recorded commit, and recheck the slice's prerequisites. Earlier slices count only when their behavior works in the current checkout. If drift breaks an assumption, refresh the affected slices and have them challenged as in step 7, keeping settled decisions; ask only newly exposed human decisions. Never run a blocked slice.

Then run the use case named by **Flow**. The slice's criteria, **You see**, and **Verify** lines are its ticket items; the plan's decisions and invariants go into the brief.
