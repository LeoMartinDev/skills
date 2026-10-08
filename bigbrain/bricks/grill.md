# Brick: grill

Interview the user until the request is clear enough to build. Runs in the main thread and owns structured product/scope interviews. Targeted setup, review, or inaccessible-fact questions elsewhere are not grill rounds.

## Mindset

- **Called from a playbook**: lean toward deciding alone. Ask only what the user alone can decide: a product or business call, a preference, an irreversible choice, a scope boundary. Decide the rest and record it.
- **In the grill route**: the goal is to challenge the user's idea. Put every open decision to them, and push back on weak answers with a concrete counterexample.

Facts are your job, never the user's. When a question needs a fact (how the code works, what exists, a convention), send an `explorer (lookup)` subagent to find it. Only the questions downstream of that fact wait for it.

## Design tree

Map the request as a tree of decisions: each decision opens the ones that depend on it. The **frontier** is every open decision whose prerequisites are settled.

Work in rounds. A round asks the whole frontier at once. After the answers, recompute the frontier. A question that depends on another open question waits for a later round.

## Caps

Read `grill.max-rounds` and `grill.max-questions` in configuration, for the current flow (`feature`, `bugfix`, `maintenance`, `plan`, or `grill` for the grill route).

- More frontier than `max-questions`: ask the most structural ones; choose defaults only for reversible choices within authorized scope and list them in the round. Keep exclusively human choices unresolved.
- `max-rounds` reached: stop asking. Apply the same default rule and flag each decision or unresolved choice. In a plan, list them under "Decisions to validate". A cap is no approval: pause work dependent on unresolved human choices and proceed only with independent authorized work.

## Asking

Use the harness's choice tool (see its harness file, section 4). Per question:

- A short header and a full question.
- 2 to 4 mutually exclusive options, each with a one-line consequence.
- Your recommended option first, marked "(Recommended)".

Without a choice tool, use this text format:

```
❓ **Q1 - <title>**: <question, with options (a), (b), (c) and their consequences>

➡️ <your recommendation and why, in one line>
```

## End

The session ends when the frontier is empty or a cap is reached. Recap one line per decision: the decision, then who took it (user or you); name unresolved choices explicitly. Existing authorizations persist, but silence or a cap does not settle an unresolved choice.

- Called from feature, bugfix, maintenance, or plan: present the recap and continue authorized work without a confirmation checkpoint. Reversible structural choices within scope and already authorized behavior need no new go. Ask only a still-open human decision within the caps; exhausted caps keep dependent work blocked, never trigger an extra recap-approval round. A plan continues planning, not implementation; retain unresolved human decisions and block their dependent slices.
- In the grill route: present the recap, then stop. Suggest the next step in one line (plan or feature), without starting it. Do not ask for approval of decisions the user already made.

When the input came from a ticket (GitHub issue, Notion page): after the recap is settled, append it to the ticket as a comment (`gh issue comment`, Notion comment), never by rewriting the original request. The comment lists each decision, who took it, and the open points still flagged. Give its link in the final reply.
