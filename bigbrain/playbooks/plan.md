# Playbook: plan

Write an implementation plan for a feature or maintenance change, then stop: you own the plan, not the code. `/bigbrain` later runs it slice by slice in its recorded flow; maintenance keeps its conditional design gate throughout. Coming from feature or maintenance, reuse what is settled: the flow, answered questions, mental model, baseline, and sketch or brief.

Copy these steps into your todo list verbatim.

1. **Size.** Pick feature or maintenance per `SKILL.md`, preserving the caller's flow. One PR with an obvious, low-risk approach needs no plan: say so, offer that playbook, and stop. One PR with a risky migration, uncertain integration, or consequential product decision gets a one-slice plan; omit empty sections.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. For a raw idea, establish who has the problem, what happens today, the desired outcome, and the smallest useful scope with its exclusions. Grill (`bricks/grill.md`, plan caps) only unresolved decisions.
3. **Ground.** Run `bricks/how.md` on the subsystems touched. Record the repo identity, explored commit, relevant uncommitted changes, conventions, and obligatory repo/CI checks with their scopes. Write success criteria per the Ticket items rule in `SKILL.md`: verbatim items, or 2 to 6 observable behaviors for a feature; for maintenance, the outcome and contracts to preserve, with the baseline per `playbooks/maintenance.md` step 3. If the work proves simple and low-risk, stop per step 1.
4. **Set the approach** per `playbooks/feature.md#conditional-design` or `playbooks/maintenance.md#conditional-design`: a compact brief when the shape is settled, architect on an open decision. Slicing alone never triggers architecture or arena.
5. **Slice** per `principles/sequence-verifiable-units.md`:
   - Each slice is one PR that works end to end, passes the obligatory repo/CI checks for its scope, fits `references/config.md#pr-budget`, and can be checked by running it or by hand.
   - Riskiest unknown first, as the thinnest slice that proves it. A foundation slice (schema, types) goes first only when later slices need it. Never slice by layer.
   - Prefer slices a user can observe. When none fits the budget, a slice proven by its tests alone is fine if the next slice wires it; an unverifiable slice never justifies going over budget.
   - Maintenance slices each deliver a coherent result and leave a working state. Per `principles/migrate-callers-then-delete-legacy-apis.md`, replace an internal API, migrate all callers, and delete in one wave; persisted data and external consumers use its exception.
6. **Write** the plan with the template below: pointers and decisions, not code. Map every criterion to the slice that satisfies it and its verification; intermediate work is not coverage. For new work, specify responsibilities, interfaces, and invariants; fix new names only when later slices depend on them.
7. **Challenge the plan.** A read-only `reviewer` checks it against the criteria and grounded code: coverage, dependency order, whether each slice is testable alone and fits the budget, and whether migrations leave a working state between slices. Resolve each concrete gap and failure scenario it returns before saving. Product choices go through the grill within the plan caps; remaining ones go under "Decisions to validate", and every slice depending on them or on an unresolved blocker is marked blocked.
8. **Save** per `plan.destination`: `none` (conversation only), `repo:<path>` (`<path>/<slug>.md`), `home` (`~/.agents/plans/<repo>/<slug>.md`), or `github-issue` (`gh issue create` with the plan as body).
9. **Learn.** Apply `references/memory.md#learn-at-the-end-of-a-workflow` to established grounding only, never to the unimplemented plan.
10. **Stop.** Reply with the plan's location, the slices in order, and the decisions to validate or blockers, plus how to run a slice: `/bigbrain implement slice <n> of <plan location>`. With `none`, offer once to save the plan so another session can run it.

## Template

```markdown
# <Change> plan

<Up to 5 lines: what changes, for whom, and the target shape in one sentence.>

## Scope
- **Flow**: <feature | maintenance>
- **Problem and outcome**: <current problem and desired observable result>
- **In scope**: <smallest useful scope>
- **Out of scope**: <explicit exclusions>
## Grounding
- **Repo and reference**: <repo identity, explored commit, relevant local changes>
- **Assumptions**: <important claim, source or evidence, and dependent slices>
- **Invariants**: <contracts and behavior the slices must preserve>
## Success criteria
- C1 (`required`): <verbatim ticket item, or observable behavior>. Covered by slice <n>, verified by <case or real run>.
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

Before entering the playbook, confirm the repo identity, compare the current code with the plan's reference, and recheck the slice's prerequisites and assumptions. Earlier slices count only when their behavior works in the current checkout; a changed HEAD alone does not invalidate the plan. For an older plan without reference or assumptions, reconstruct and record only this slice's grounding.

If drift invalidates an assumption, refresh the affected grounding, brief or sketch, and dependent slices, then have the revised portion challenged as in step 7. Keep settled decisions and unaffected slices; ask only newly exposed human decisions. Never implement a slice whose prerequisites or structural decisions remain blocked.

Then run the playbook named by **Flow**. An older plan without it runs as maintenance only when it clearly describes a refactor or chore, otherwise as a feature. That playbook treats the slice as a clear ticket: its mapped criteria, **You see**, and **Verify** lines are ticket items, and the plan's scope, decisions, invariants, and baseline go into the brief.
