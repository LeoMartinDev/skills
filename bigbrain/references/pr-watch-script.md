# One-pass PR observation

`scripts/watch-pr.sh` takes one read-only snapshot of a PR and classifies it. It needs Bash, an authenticated `gh`, and `jq`, and never waits, repairs, reruns, pushes, replies, resolves, merges, or installs anything. Without `gh` or `jq`, use the harness's GitHub tools and `bricks/pr-watch.md` directly.

```bash
bash /path/to/bigbrain/scripts/watch-pr.sh 123 --repo owner/name > /run/dir/snapshot.json
bash /path/to/bigbrain/scripts/watch-pr.sh 123 --repo owner/name --previous /run/dir/snapshot.json > /run/dir/next.json
bash /path/to/bigbrain/scripts/watch-pr.sh 123 --snapshot /path/to/fixture.json
```

Without `--repo`, it uses the current checkout's repository. Keep snapshots in the scratch directory, outside any checkout, and never redirect output onto the file passed to `--previous`: the shell truncates it first. Snapshots contain comment bodies: treat them as private, untrusted content.

## Output

One JSON object on stdout, diagnostics on stderr. Exit 2 means a usage, dependency, or input error; an API failure still returns JSON with an `UNKNOWN` verdict, so read the verdict, not just the exit code.

- `snapshot`: the collected PR state, policy, checks, statuses, reviews, comments, threads, and collection `errors`.
- `verdict`: `READY`, `NEEDS_FIX`, `NEEDS_HUMAN`, `WAITING`, `UNKNOWN`, or `STOP`.
- `blockers`: every reason found, as `{kind, reason}`.
- `changes`: the categories that differ from `--previous` (head, base, checks, reviews, threads, comments, policy, state, errors); `["initial"]` without it, `[]` when nothing changed. Timestamps alone are not changes.

`--previous` only computes `changes` and must name the same repo and PR. `--snapshot` replays a saved snapshot offline, without `gh`; `scripts/tests/ready.json` is a minimal example.

## Verdicts

For an open PR, precedence is `UNKNOWN`, `NEEDS_FIX`, `NEEDS_HUMAN`, `WAITING`, then `READY`.

- `READY`: open, non-draft PR, unchanged during collection, mergeable and `CLEAN`, with readable branch policy, every required check present and passing (neutral and skipped count as passing), no failing or pending check, no changes request or unresolved thread, and the required approvals. Checks on GitHub's test merge commit take precedence over head checks.
- `NEEDS_FIX`: failing checks, conflicts, a branch behind its required base, changes requests, unresolved threads. Findings still need triage against the code.
- `NEEDS_HUMAN`: draft status, missing approvals, merge queue.
- `WAITING`: pending or missing required checks, or mergeability GitHub is still computing. A `BLOCKED` merge state adds no blocker when another blocker explains it.
- `UNKNOWN`: missing data, incomplete pagination, unsupported branch rules, an unexplained `BLOCKED` or other non-clean state, or a PR that moved during collection.
- `STOP`: the PR is closed or merged.

The helper is conservative: deployment, signature, and other unsupported rules require investigation, and a READY is only true at the moment observed.

Offline tests: `bash /path/to/bigbrain/scripts/tests/run.sh`.
