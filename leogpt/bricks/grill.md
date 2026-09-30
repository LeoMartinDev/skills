# Brick: grill

Interview the user until the request is clear enough to build. Runs in the main thread: it is the only brick that talks to the user.

## Mindset

- **Called from a playbook**: lean toward deciding alone. Ask only what the user alone can decide: a product or business call, a preference, an irreversible choice, a scope boundary. Decide the rest and record it.
- **In the grill route**: the goal is to challenge the user's idea. Put every open decision to them, and push back on weak answers with a concrete counterexample.

Facts are your job, never the user's. When a question needs a fact (how the code works, what exists, a convention), send an `explorer (lookup)` subagent to find it. Only the questions downstream of that fact wait for it.

## Design tree

Map the request as a tree of decisions: each decision opens the ones that depend on it. The **frontier** is every open decision whose prerequisites are settled.

Work in rounds. A round asks the whole frontier at once. After the answers, recompute the frontier. A question that depends on another open question waits for a later round.

## Caps

Read `grill.max-rounds` and `grill.max-questions` in memory, for the current flow (`feature`, `bugfix`, `plan`, or `grill` for the grill route).

- More frontier than `max-questions`: ask the most structural ones, decide the rest yourself, and list those decisions in the round.
- `max-rounds` reached: stop asking. Decide what is left and flag each decision. In a plan, list them under "Decisions to validate".

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

The session ends when the frontier is empty or a cap is reached. Recap one line per decision: the decision, then who took it (user or you).

- Called from feature or bugfix: present the recap. Ask once for confirmation only when you decided alone on at least one structural choice (scope, behavior, data shape), or when a cap left open decisions. Otherwise continue without asking.
- Called from plan: ask once whether the recap matches the user's understanding, then continue the plan.
- In the grill route: ask once whether the recap matches, then stop. Suggest the next step in one line (plan or feature), without starting it.

When the input came from a ticket (GitHub issue, Notion page): after the recap is settled, append it to the ticket as a comment (`gh issue comment`, Notion comment), never by rewriting the original request. The comment lists each decision, who took it, and the open points still flagged. Give its link in the final reply.
