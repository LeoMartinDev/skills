# Execution state

Run state records a task's progress and evidence. It is neither configuration nor learned memory. The skill defines checkpoints; the harness provides storage and resumption, not a second workflow implementation.

## Store

Use the adapter's run-state tool when present. Otherwise keep a JSON checkpoint in `~/.agents/runs/bigbrain/<repo>/<run-id>/state.json`, outside the repo. Resolve a safe repo identity as in `references/memory.md`; generate a unique run ID and report its location. Update via a temporary file and atomic rename. Only the lead writes the checkpoint. If durable writes are unavailable, retain a compact conversation checkpoint and disclose that it will not survive session loss.

Create state only for feature, bugfix, maintenance, plan, or watch work that spans phases. A small factual answer or setup needs no run. Never write user secrets, raw private logs, or entire code files into state.

## Working artifacts

Keep scratch reports, briefs, command output, and other temporary working files outside every project checkout. Never create `.tmp-bigbrain` or another scratch directory in the repo, even if ignored by Git. This does not relocate requested deliverables such as a saved plan or project documentation.

Use a unique per-task directory under the system temporary directory (for example, `mktemp -d "${TMPDIR:-/tmp}/bigbrain.XXXXXX"`). The lead gives each subagent an explicit absolute output path there. If temporary storage is unavailable, use another writable location outside the repo or return a compact result in the conversation; do not fall back to the checkout.

Before checkpointing or yielding an unfinished run, preserve reports and proof artifacts needed for decisions, verification, or resume in the run directory or durable harness store, and record their durable locations in state. On completion, preserve the evidence supporting the final result there too. If durable storage is unavailable, keep a compact result in the conversation and disclose the resume limitation.

After required evidence is preserved and no subagent still uses the scratch files, remove the temporary directory created for this task. Preserve the run directory for resume and inspection; never clean up another task's files.

## Fields

Use this small schema, omitting irrelevant fields:

```json
{
  "version": 1,
  "runId": "unique-id",
  "repo": "owner/name",
  "checkout": "/absolute/path",
  "branch": "task-branch",
  "baseCommit": "sha",
  "headCommit": "sha",
  "flow": "feature | bugfix | maintenance | plan | watch",
  "phase": "current playbook step or watch phase",
  "status": "active | waiting | blocked | done",
  "goal": "observable outcome",
  "criteria": [],
  "invariants": [],
  "decisions": [],
  "artifacts": {"grounding": "path", "sketch": "path", "transformation": "path", "baseline": "path"},
  "verifyRound": 0,
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

Evidence names the check, verdict, tested commit, command, scope, and output artifact or compact result. Findings have stable IDs, source, disposition, reason, and any fix commit. Decisions record the user's instruction and its scope, but a checkpoint never grants new authorization. Preserve the grounding, sketch when present, maintenance brief and baseline when relevant, and proof artifacts needed for resume in the run directory or durable harness store. Missing temporary reports are a grounding gap, not evidence.

## Checkpoints

Save after grounding and design, each returned implementation or repair batch, verification and review, PR creation or push, and each actionable watch event. Save before yielding or ending a bounded watch. Do not serialize every tool call. Keep counters across resumption; `reviewCommit` records what was reviewed, not a timeless `reviewDone` flag. Save `waiting` at a deadline, `blocked` for a concrete blocker, and `done` only when the flow's goal is achieved or the PR is closed; include the next action on every unfinished exit.

## Resume

Route `/bigbrain resume <run-id or state-path>` here. For a run ID, look in `~/.agents/runs/bigbrain/<repo>/`; an explicit state path also works. Keep a resumed run in its existing directory. Load that run, confirm the repo identity and checkout exist, inspect the current branch, HEAD, uncommitted changes, PR state when present, and recover needed artifacts. Never overwrite unrelated changes or switch the user's checkout silently. Report a mismatch that prevents safe progress.

Check a checkpoint's claims against reality before continuing. A pushed PR's current head outranks the saved head. Evidence only proves the commit and scope actually checked. After HEAD, base, wiring, or relevant files change, rerun the affected proofs and static checks; old verdicts remain history. Review repairs follow `bricks/verify.md`'s rounds; material scope or design changes require a fresh review. Restore the flow's criteria and invariants before spawning any child.

Resume the named playbook at the next justified step. When its saved phase is post-ship watch, resume `bricks/pr-watch.md` directly instead of opening another PR. Reconstruct missing evidence rather than inventing it. A persisted deadline that expired stops the watch with its current blockers; an explicit new watch run may get a new budget. Completion stores `done` and the final artifact or PR; it does not turn task details into learned memory.
