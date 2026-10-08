# Playbook: plan

Write an implementation plan for a feature or maintenance change. You own the plan, not the code: do not implement. The plan is a checklist that `/bigbrain` later runs slice by slice. Record its execution flow; refactors and chores keep maintenance mode and its conditional design gate throughout planning and execution.

Coming from feature or maintenance: step 1 is settled, step 2 asks only what is still open, step 3 reuses the mental model and baseline already built, and step 4 reuses the sketch or transformation brief, if any.

Copy these steps into your todo list verbatim.

1. **Size.** Select feature or maintenance from the request and routing in `SKILL.md`; preserve the caller's flow. If the request clearly fits one PR with an obvious approach and no consequential uncertainty, say that no plan is needed, offer to run that playbook directly, and stop. For one PR with a risky migration, uncertain integration, or consequential product decisions, write a compact one-slice plan using the same steps; omit empty sections.
2. **Clarify.** Apply the clarity gate from `SKILL.md`. For a raw idea, establish who has the problem, what happens today, the desired observable outcome, and the smallest useful scope, including what is out of scope. Run `bricks/grill.md` with the plan caps only for unresolved decisions; reuse answers already settled.
3. **Ground.** Run `bricks/how.md`, choosing its simple or complex path for the subsystems touched. Collect the test commands and conventions, and record the repo identity and explored commit, plus relevant uncommitted changes. Write the success criteria per the Ticket items rule in `SKILL.md`: preserve explicit items verbatim, or define 2 to 6 observable behaviors for a feature; for maintenance, use the concrete cleanup or operational outcome and contracts to preserve, with the baseline per `playbooks/maintenance.md` step 3. If the code shows the work is simple and low-risk after all, stop per step 1.
4. **Set the approach.** For a feature, run `bricks/architect.md`; its sketch is the target shape. For maintenance, write or reuse the compact transformation brief from `playbooks/maintenance.md` step 4 and apply its Conditional design gate only to open decisions necessary for the goal. Reuse a settled sketch when present; planning or slicing alone does not trigger architecture or arena.
5. **Slice.** Cut the work into vertical slices per `principles/sequence-verifiable-units.md`:
   - Each slice is one PR that works end to end, passes the repo's full checks, fits the budget (PR budget rule in `references/config.md#pr-budget`), and can be checked by hand, or better, by running it.
   - The riskiest unknown goes first, as the thinnest slice that proves it.
   - A foundation slice (schema, types) comes first only when later slices cannot start without it.
   - Never slice by layer ("all the backend, then all the frontend").
   - Prefer slices a user can observe. When none fits the budget, a slice proven by its tests alone (a ported field, a model and its tests) is fine, as long as the next slice wires it. "No slice is verifiable alone" never justifies a PR over budget.
   - For maintenance, each slice delivers a coherent cleanup or operational result while preserving contracts and a working state. Follow `principles/migrate-callers-then-delete-legacy-apis.md`: group internal API replacement, all callers, and deletion in the same wave; slice by independent replacements. Persisted data or external consumers use that principle's exception with explicit final removal and intermediate-state checks.
6. **Write** the plan with the template below. Keep it short: pointers and decisions, not code. Map every success criterion to the slice that satisfies it and its verification; intermediate work alone does not count as coverage. Record the assumptions each slice depends on, with source pointers or evidence. Name existing symbols where useful; specify responsibilities, interfaces, and invariants for new work, fixing new names only when later slices depend on them.
7. **Challenge the plan.** A read-only `reviewer` checks the written plan against the success criteria and grounded code, independently of the author. Use `references/subagent-brief.md`. Check coverage, dependency order (no cycles or missing prerequisites), whether each slice is usable or testable alone, whether its estimate fits the PR budget including tests, and whether migrations or rollout leave a working state between slices. Return only concrete gaps and failure scenarios. Resolve each finding and update the plan before saving; unresolved blockers keep the affected slices explicitly blocked. Product choices go through the grill within the existing plan caps; flag remaining choices under "Decisions to validate" and mark dependent slices blocked until settled.
8. **Save** per `plan.destination` in configuration:
   - `none`: present it in the conversation only.
   - `repo:<path>`: write `<path>/<slug>.md` in the repo.
   - `home`: write `~/.agents/plans/<repo>/<slug>.md`.
   - `github-issue`: `gh issue create`, with the plan as the body.
9. **Learn.** Apply `references/memory.md#learn-at-the-end-of-a-workflow`; save only established durable knowledge from grounding, never the unimplemented plan itself.
10. **Stop.** Reply with the plan's location, the slices in order, and the decisions to validate or blockers. Explain how to run a slice: `/bigbrain implement slice <n> of <plan location>`. With `none`, a slice can run only in this conversation: offer once to save the plan (repo, home, or issue) so another session can pick it up.

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
- C1: <verbatim ticket item, or observable behavior>. Covered by slice <n>, verified by <case or real run>.
## Decisions
- <decision> (by: user | agent). <why>
## Decisions to validate
- <decision the agent took alone after the grill cap>

## Slice <n>: <verb phrase>
- **Depends on**: <slice or none>
- **Prerequisites**: <assumptions to recheck, required earlier behavior, unresolved blocker or none>
- **Criteria**: <criterion IDs this slice satisfies; or intermediate contribution>
- **Files**: <paths to create, edit, or delete>
- **Build**: <responsibilities, interfaces, and invariants; relevant existing symbols>
- **You see**: <observable behavior, concrete simplification, or operational result>
- **Verify**: <test command and the case it adds>, then <the real run and its expected result>
- **Size**: <estimated changed lines including tests, and main source of uncertainty>

## Risks
- <risk>: <the slice where it lands, what to watch>
## Rejected alternatives
- <approach>: <why it lost>
```

## Execute a saved slice

Before entering the selected playbook, confirm the repo identity, compare the current code with the plan's reference, and recheck the chosen slice's prerequisites and sourced assumptions. Verify required earlier slices by their behavior in the current checkout, not by a completion label. A changed HEAD alone does not invalidate the plan. For an older plan without a reference or assumptions, reconstruct only the grounding needed for this slice and record it.

If drift invalidates an assumption, refresh the affected grounding, sketch or maintenance brief, and dependent slices, then apply the plan challenge to the revised portion. Maintenance keeps its flow and applies `playbooks/maintenance.md#conditional-design` only to newly opened decisions. Preserve settled decisions and unaffected slices; ask only for newly exposed product or scope choices. Do not implement a slice whose prerequisites or structural decisions remain blocked.

Once these checks pass, run the playbook named by **Flow** (`playbooks/feature.md` or `playbooks/maintenance.md`). For an older plan without **Flow**, infer maintenance only when its scope and criteria clearly describe a refactor or chore; otherwise keep the legacy feature flow. The selected playbook treats the slice as a clear, detailed ticket. Its mapped success criteria, **You see**, and **Verify** lines are its ticket items; carry the plan's scope, decisions, invariants, and baseline when applicable into the brief.
