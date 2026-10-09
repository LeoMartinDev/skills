# Brick: grill

Interview the user until the request is clear enough to build. Runs in the main thread and owns structured product/scope interviews. Targeted setup, review, or inaccessible-fact questions elsewhere are not grill rounds.

## Mindset

- **Called from a playbook**: lean toward deciding alone. Ask only what the user alone can decide: a product or business call, a preference, an irreversible choice, a scope boundary. Decide the rest and record it.
- **In the grill route**: the goal is to challenge the user's idea. Put every open decision to them, and push back on weak answers with a concrete counterexample.

Facts are your job, never the user's. When a question needs a fact (how the code works, what exists, a convention), send an `explorer (lookup)` subagent to find it. Only the questions downstream of that fact wait for it.

## Design tree

Map the request as a tree of decisions: each decision opens the ones that depend on it. The **frontier** is every open decision whose prerequisites are settled.

Work in rounds. A round asks the whole frontier at once. After the answers, recompute the frontier. A question that depends on another open question waits for a later round.

## Stopping

Rounds continue until the frontier is empty or the user ends the session. Silence is never approval: an unresolved human choice stays open, flagged (in a plan, under "Decisions to validate"), and work depending on it stays paused.

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

Recap one line per decision: the decision, then who took it (user or you); name unresolved choices explicitly.

- Called from a playbook: present the recap and continue authorized work without a confirmation round; work depending on an unresolved choice stays paused, and in a plan its slices are marked blocked.
- In the grill route: present the recap, then stop. Suggest the next step in one line (plan or feature), without starting it. Do not ask for approval of decisions the user already made.

When the input came from a ticket (GitHub issue, Notion page): after the recap is settled, append it to the ticket as a comment (`gh issue comment`, Notion comment), never by rewriting the original request. The comment lists each decision, who took it, and the open points still flagged. Give its link in the final reply.
