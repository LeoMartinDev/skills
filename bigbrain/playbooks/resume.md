# Playbook: resume

Pick up earlier work on a branch or PR. The trail is authoritative input: read it, don't redo it.

Copy these steps into your todo list verbatim.

1. **Locate the trail.** The named branch or PR, plus the previous conversation when the harness exposes it (never another project's). A subagent condenses a long transcript into a short timeline.
2. **Reconstruct the state** from git and GitHub: the branch, commits and diff against the base (`bricks/ship.md#change-reference`), uncommitted changes, the PR body, checks, and review threads. Never overwrite unrelated changes or switch the user's checkout silently.
3. **Diff done against pending.** Compare what landed with the goal and criteria from the ticket, plan, or PR body. Name the resume point; do not redo completed work or rerun a settled repro.
4. **Verify inherited claims** that the remaining work depends on, on the current head (`principles/prove-it-works.md`): a prior report of passing is not proof.
5. **Route** the remaining work to its playbook or to `bricks/pr-watch.md`, starting at the resume point.
6. **Reply** with where the earlier work stopped, what was inherited and what was redone (ideally nothing), and the resume point.
