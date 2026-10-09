# Use case: resume

**You own the resume point. Read the prior trail, don't redo it.**

1. Locate the trail: the named branch or PR, plus the previous conversation when the harness exposes it, never another project's. A subagent condenses a long transcript into a short timeline of decisions.
2. Reconstruct the state from git and GitHub: commits and diff against the base (`bricks/ship.md#change-reference`), uncommitted changes, the PR body, checks, and review threads. The trail is authoritative input; resist re-deriving it. Never overwrite unrelated changes or switch the user's checkout silently.
3. Diff done against pending. Compare what landed with the goal and criteria from the ticket, plan, or PR body, and name the resume point. Don't rerun a settled repro or redo completed work.
4. Verify the inherited claims the remaining work depends on, on the current head (`principles/prove-it-works.md`). A prior report of passing is not proof.
5. Route the remaining work to its use case, or to `bricks/pr-watch.md`, starting at the resume point. That use case owns the rest.

**Reply:** where the earlier work stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
