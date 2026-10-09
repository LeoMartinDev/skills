# Execution state

Run state records a task's progress and evidence. It is neither configuration nor learned memory. The skill defines checkpoints; the harness provides storage and resumption, not a second workflow implementation.

## Store

Use the adapter's run-state tool when present. Otherwise keep a JSON checkpoint in `~/.agents/runs/bigbrain/<repo>/<run-id>/state.json`, outside the repo. Resolve a safe repo identity as in `references/memory.md`; generate a unique run ID and report its location. Update via a temporary file and atomic rename. Only the lead writes the checkpoint. If durable writes are unavailable, retain a compact conversation checkpoint and disclose that it will not survive session loss.

Create state only for feature, bugfix, maintenance, plan, or watch work that spans phases. A small factual answer or setup needs no run. Never write user secrets, raw private logs, or entire code files into state.

## Working artifacts

Scratch reports, briefs, and command output go in one unique per-task directory outside every checkout (for example `mktemp -d "${TMPDIR:-/tmp}/bigbrain.XXXXXX"`). Never create `.tmp-bigbrain` or any scratch directory in the repo, even an ignored one; without temporary storage, use another location outside the repo or the conversation. Requested deliverables, such as a saved plan, keep their destination. The lead gives each subagent an absolute output path there.

Before yielding or finishing, copy the reports and proofs needed for resume or for the final result into the run directory and record their paths in state. Then, once no subagent uses it, delete this task's scratch directory, never another task's.

## Change reference

Before measuring or delegating a task diff, the lead resolves `baseBranch`, its tip `baseCommit`, and the examined `headCommit`, plus the checkout and head branch. `baseBranch` is the PR's actual target, a grounded stacked parent, or the default only when it is the intended target; an unresolved target is a grounding gap, never an assumed default.

Every diff for inspection, review, comments, and size is `git diff <baseCommit>...<headCommit>`, and the PR targets that `baseBranch`. Evidence binds to that reference and its scope; if it moves before verification and review end, rerun the affected checks.

## Fields

Use this small schema, omitting irrelevant fields:

```json
{
  "version": 1,
  "runId": "unique-id",
  "repo": "owner/name",
  "checkout": "/absolute/path",
  "branch": "task-branch",
  "baseBranch": "target-branch",
  "baseCommit": "sha",
  "headCommit": "sha",
  "flow": "feature | bugfix | maintenance | plan | watch",
  "phase": "current playbook step or watch phase",
  "status": "active | waiting | blocked | done",
  "goal": "observable outcome",
  "criteria": [],
  "invariants": [],
  "decisions": [],
  "artifacts": {"grounding": "path", "sketch": "path", "transformation": "path", "baseline": "path", "loop": "path"},
  "verifyRound": 0,
  "replanCount": 0,
  "reproRound": 0,
  "arenaRuns": 0,
  "grillRound": 0,
  "reviewCommit": null,
  "lastPassingCommit": null,
  "evidence": [],
  "findings": [],
  "unverified": [],
  "prUrl": null,
  "watch": {"startedAt": null, "deadline": null, "fixRounds": 0, "observedHead": null, "handledThreads": []},
  "nextAction": "concrete next step",
  "updatedAt": "ISO timestamp"
}
```

Criteria and evidence carry `required` or `supplementary` per `bricks/verify.md#delivery-gate`. Evidence names the check, verdict, tested change reference, command, scope, and output artifact or compact result. Findings have stable IDs, source, disposition, reason, and any fix commit. Decisions record the user's instruction and its scope, but a checkpoint never grants new authorization.

## Checkpoints

Save after each phase and each returned batch, after PR creation or push and each actionable watch event, and before structural returns, reproduction passes, and yielding; not after every tool call. `reviewCommit` records what was reviewed, not a timeless flag. Status is `waiting` at a deadline, `blocked` for a concrete blocker, and `done` only when the goal is achieved or the PR is closed; every unfinished exit records `nextAction`.

## Resume

Route `/bigbrain resume <run-id or state-path>` here. For a run ID, look in `~/.agents/runs/bigbrain/<repo>/`; an explicit state path also works. Keep a resumed run in its existing directory. Load that run, confirm the repo identity and checkout exist, inspect the current branch, HEAD, uncommitted changes, PR state when present, and recover needed artifacts. Never overwrite unrelated changes or switch the user's checkout silently. Report a mismatch that prevents safe progress.

A checkpoint is a claim; check it against reality before continuing. A PR's current head and target outrank the saved reference, and evidence counts only for the reference and scope it checked: after HEAD, base, wiring, or relevant files change, rerun the affected proofs. Restore criteria, invariants, and counters per `references/loop-control.md` before spawning any child; material changes require a fresh review.

Resume the named playbook at the next justified step. When its saved phase is post-ship watch, resume `bricks/pr-watch.md` directly instead of opening another PR. Reconstruct missing evidence rather than inventing it. An expired deadline stops the watch with its current blockers. Completion stores `done` and the final artifact or PR; it does not turn task details into learned memory.
