# Playbook: plan

Write an implementation plan for a feature. You own the plan, not the code: do not implement. The plan is a checklist that `/leogpt` later runs slice by slice.

Coming from the feature playbook: step 1 is settled, step 2 asks only what is still open, step 3 reuses the mental model already built, and step 4 reuses the sketch, if any.

Copy these steps into your todo list verbatim.

1. **Size.** If the request clearly fits one PR with an obvious approach, say that no plan is needed, offer to run the feature playbook directly, and stop.
2. **Clarify.** Apply the clarity gate from `SKILL.md`; a plan almost always fails it. Run `bricks/grill.md` with the plan caps.
3. **Ground.** Run `bricks/how.md`, usually the complex path. Collect the test commands and the conventions. If the code shows the work fits one PR after all, stop per step 1.
4. **Design.** Run `bricks/architect.md`. Its sketch is the plan's target shape.
5. **Slice.** Cut the work into vertical slices per `principles/sequence-verifiable-units.md`:
   - Each slice is one PR that works end to end, passes the repo's full checks, fits `pr.max-lines`, and can be checked by hand, or better, by running it.
   - The riskiest unknown goes first, as the thinnest slice that proves it.
   - A foundation slice (schema, types) comes first only when later slices cannot start without it.
   - Never slice by layer ("all the backend, then all the frontend"), and never ship unwired code, such as models no caller uses yet.
6. **Write** the plan with the template below. Keep it short: pointers and decisions, not code.
7. **Save** per `plan.destination` in memory:
   - `none`: present it in the conversation only.
   - `repo:<path>`: write `<path>/<slug>.md` in the repo.
   - `home`: write `~/.agents/plans/<repo>/<slug>.md`.
   - `github-issue`: `gh issue create`, with the plan as the body.
8. **Stop.** Reply with the plan's location, the slices in order, and the decisions to validate. Explain how to run a slice: `/leogpt implement slice <n> of <plan location>`. With `none`, a slice can run only in this conversation: offer once to save the plan (repo, home, or issue) so another session can pick it up.

## Template

```markdown
# <Feature> plan

<Up to 5 lines: what changes, for whom, and the target shape in one sentence.>

## Decisions
- <decision> (by: user | agent). <why>
## Decisions to validate
- <decision the agent took alone after the grill cap>

## Slice <n>: <verb phrase>
- **Depends on**: <slice or none>
- **Files**: <paths to create, edit, or delete>
- **Build**: <the change, naming real symbols>
- **You see**: <the observable result: screen state, output, log line>
- **Verify**: <test command and the case it adds>, then <the real run and its expected result>

## Risks
- <risk>: <the slice where it lands, what to watch>
## Rejected alternatives
- <approach>: <why it lost>
```

When `/leogpt` runs a slice, the feature playbook treats that slice as a clear, detailed ticket: no grill unless the code contradicts the plan. Its **You see** and **Verify** lines are its ticket items.
