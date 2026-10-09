#!/usr/bin/env bash
set -eu
dir=$(cd "$(dirname "$0")" && pwd)
watch=$dir/../watch-pr.sh
tmp=$(mktemp -d "${TMPDIR:-/tmp}/bigbrain-watch-test.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
count=0
test_case() {
  local name=$1 expected=$2 filter=$3
  jq "$filter" "$dir/ready.json" > "$tmp/case"
  bash "$watch" 123 --snapshot "$tmp/case" > "$tmp/out"
  if [ "$(jq -r .verdict "$tmp/out")" != "$expected" ]; then echo "FAIL: $name" >&2; cat "$tmp/out" >&2; exit 1; fi
  count=$((count + 1))
}
test_case 'explicit no requirements' READY '.'
test_case 'missing required check' WAITING '.policy.rules=[{type:"required_status_checks",parameters:{required_status_checks:[{context:"build",integration_id:42}]}}]'
test_case 'approval missing' NEEDS_HUMAN '.policy.rules=[{type:"pull_request",parameters:{required_approving_review_count:1}}]|.pr.reviewDecision="REVIEW_REQUIRED"|.end.reviewDecision="REVIEW_REQUIRED"'
test_case 'approved then commented remains approved' READY '.policy.rules=[{type:"pull_request",parameters:{required_approving_review_count:1}}]|.pr.reviewDecision="APPROVED"|.end.reviewDecision="APPROVED"|.reviews=[{id:1,state:"APPROVED",commit_id:"h",user:{login:"a"}},{id:2,state:"COMMENTED",user:{login:"a"}}]'
test_case 'stale dismissed approvals do not count' NEEDS_HUMAN '.policy.rules=[{type:"pull_request",parameters:{required_approving_review_count:1,dismiss_stale_reviews_on_push:true}}]|.pr.reviewDecision="APPROVED"|.end.reviewDecision="APPROVED"|.reviews=[{id:1,state:"APPROVED",commit_id:"old",user:{login:"a"}}]'
test_case 'comment does not erase changes request' NEEDS_FIX '.reviews=[{id:1,state:"CHANGES_REQUESTED",user:{login:"a"}},{id:2,state:"COMMENTED",user:{login:"a"}}]'
test_case 'dismissed request is cleared' READY '.reviews=[{id:1,state:"CHANGES_REQUESTED",user:{login:"a"}},{id:2,state:"DISMISSED",user:{login:"a"}}]'
test_case 'unresolved outdated thread' NEEDS_FIX '.threads=[{id:"t",isResolved:false,isOutdated:true,comments:{nodes:[],pageInfo:{hasNextPage:false}}}]'
test_case 'resolved thread' READY '.threads=[{id:"t",isResolved:true,comments:{nodes:[],pageInfo:{hasNextPage:false}}}]'
test_case 'unknown policy' UNKNOWN '.policy.classic=null'
test_case 'mergeability being computed' WAITING '(.pr,.end) |= (.mergeable="UNKNOWN"|.mergeStateStatus="UNKNOWN")'
test_case 'missing mergeability' UNKNOWN '(.pr,.end).mergeable=null'
test_case 'blocked by missing approval' NEEDS_HUMAN '.policy.rules=[{type:"pull_request",parameters:{required_approving_review_count:1}}]|(.pr,.end) |= (.reviewDecision="REVIEW_REQUIRED"|.mergeStateStatus="BLOCKED")'
test_case 'blocked by pending required check' WAITING '.policy.rules=[{type:"required_status_checks",parameters:{required_status_checks:[{context:"build",integration_id:42}]}}]|.checks.head=[{id:1,name:"build",app:{id:42},status:"in_progress"}]|(.pr,.end).mergeStateStatus="BLOCKED"'
test_case 'blocked by failed check' NEEDS_FIX '.checks.head=[{id:1,name:"build",app:{id:42},status:"completed",conclusion:"failure"}]|(.pr,.end).mergeStateStatus="BLOCKED"'
test_case 'blocked without explanation' UNKNOWN '(.pr,.end).mergeStateStatus="BLOCKED"'
test_case 'draft merge state' NEEDS_HUMAN '(.pr,.end) |= (.isDraft=true|.mergeStateStatus="DRAFT")'
test_case 'draft merge state on ready PR' UNKNOWN '(.pr,.end).mergeStateStatus="DRAFT"'
test_case 'merge queue' NEEDS_HUMAN '.policy.rules=[{type:"merge_queue"}]'
test_case 'unsupported policy' UNKNOWN '.policy.rules=[{type:"required_deployments"}]'
test_case 'head race' UNKNOWN '.end.headRefOid="new"'
test_case 'base tip race' UNKNOWN '.endBaseTip="new"'
test_case 'test merge race' UNKNOWN '.end.potentialMergeCommit.oid="new"'
test_case 'draft' NEEDS_HUMAN '.pr.isDraft=true|.end.isDraft=true'
test_case 'closed is terminal' STOP '.pr.state="CLOSED"|.end.state="CLOSED"'
test_case 'collection failure' UNKNOWN '.errors=["API unavailable"]'
test_case 'final merge conflict invalidates snapshot' UNKNOWN '.end.mergeable="CONFLICTING"|.end.mergeStateStatus="DIRTY"'
test_case 'final review decision invalidates snapshot' UNKNOWN '.end.reviewDecision="CHANGES_REQUESTED"'
test_case 'base branch changed with same SHA' UNKNOWN '.end.baseRefName="release"'
test_case 'terminal state reopened' UNKNOWN '.pr.state="CLOSED"'
test_case 'missing identity' UNKNOWN 'del(.pr.headRefOid,.end.headRefOid)'
test_case 'invalid classic policy type' UNKNOWN '.policy.classic="invalid"'
test_case 'malformed required checks policy' UNKNOWN '.policy.rules=[{type:"required_status_checks",parameters:{}}]'
test_case 'malformed review policy' UNKNOWN '.policy.rules=[{type:"pull_request",parameters:null}]'
test_case 'malformed classic checks policy' UNKNOWN '.policy.classic=true|.policy.protection={required_status_checks:{},required_pull_request_reviews:null}'
for invalid_count in 'null' '"invalid"' '-1' '0.5'; do
  test_case 'malformed classic approval policy' UNKNOWN ".policy.classic=true|.policy.protection={required_status_checks:null,required_pull_request_reviews:{required_approving_review_count:$invalid_count}}"
done
test_case 'missing classic approval count' UNKNOWN '.policy.classic=true|.policy.protection={required_status_checks:null,required_pull_request_reviews:{}}'
test_case 'aggregate review required without count' NEEDS_HUMAN '.pr.reviewDecision="REVIEW_REQUIRED"|.end.reviewDecision="REVIEW_REQUIRED"'
test_case 'truncated thread replies' UNKNOWN '.threads=[{id:"t",isResolved:true,comments:{nodes:[],pageInfo:{hasNextPage:true}}}]'
test_case 'malformed check identity' UNKNOWN '.checks.head=[{status:"completed",conclusion:"success"}]'
for conclusion in success neutral skipped failure cancelled timed_out action_required mystery; do
  expected=NEEDS_FIX; case "$conclusion" in success|neutral|skipped) expected=READY;; mystery) expected=UNKNOWN;; esac
  test_case "check $conclusion" "$expected" ".checks.head=[{id:1,name:\"build\",app:{id:42},status:\"completed\",conclusion:\"$conclusion\"}]"
done
test_case 'pending check' WAITING '.checks.head=[{id:1,name:"build",app:{id:42},status:"in_progress"}]'
test_case 'both check and status must pass' NEEDS_FIX '.checks.head=[{id:1,name:"build",app:{id:42},status:"completed",conclusion:"success"}]|.statuses.head=[{id:1,context:"build",state:"failure"}]'
test_case 'app pinned legacy identity unknown' UNKNOWN '.policy.rules=[{type:"required_status_checks",parameters:{required_status_checks:[{context:"build",integration_id:42}]}}]|.statuses.head=[{id:1,context:"build",state:"success"}]'
test_case 'wrong app check cannot satisfy requirement' WAITING '.policy.rules=[{type:"required_status_checks",parameters:{required_status_checks:[{context:"build",integration_id:42}]}}]|.checks.head=[{id:1,name:"build",app:{id:99},status:"completed",conclusion:"success"}]'
test_case 'classic pinned check succeeds' READY '.policy.classic=true|.policy.protection={required_status_checks:{checks:[{context:"build",app_id:42}],contexts:["build"]},required_pull_request_reviews:null}|.checks.head=[{id:1,name:"build",app:{id:42},status:"completed",conclusion:"success"}]'
test_case 'merge commit checks take precedence' READY '.checks.head=[{id:1,name:"build",status:"completed",conclusion:"failure",app:{id:42}}]|.checks.merge=[{id:2,name:"build",status:"completed",conclusion:"success",app:{id:42}}]'
bash "$watch" 123 --snapshot "$dir/ready.json" > "$tmp/previous"
bash "$watch" 123 --snapshot "$tmp/previous" --previous "$tmp/previous" > "$tmp/out"
jq -e '.changes == [] and .verdict == "READY"' "$tmp/out" >/dev/null
jq '.observedAt="later"|.pr.updatedAt="later"' "$dir/ready.json" > "$tmp/case"
bash "$watch" 123 --snapshot "$tmp/case" --previous "$tmp/previous" > "$tmp/out"
jq -e '.changes == []' "$tmp/out" >/dev/null
for change in '.pr.headRefOid="new"|.end.headRefOid="new"' '.baseTip="new"|.endBaseTip="new"' '.threads=[{id:"t",isResolved:true,comments:{nodes:[{id:"reply",body:"edited"}]}}]'; do
  jq "$change" "$dir/ready.json" > "$tmp/case"
  bash "$watch" 123 --snapshot "$tmp/case" --previous "$tmp/previous" > "$tmp/out"
  jq -e '.changes|length == 1' "$tmp/out" >/dev/null
done
for invalid in '.snapshot.number=124' '.snapshot.repo="other/repo"'; do
  jq "$invalid" "$tmp/previous" > "$tmp/bad"
  if bash "$watch" 123 --snapshot "$dir/ready.json" --previous "$tmp/bad" > "$tmp/out" 2>/dev/null; then echo 'FAIL: mismatched previous accepted'; exit 1; fi
done
for invalid in empty multiple; do
  : > "$tmp/bad"; [ "$invalid" != multiple ] || cat "$dir/ready.json" "$dir/ready.json" > "$tmp/bad"
  if bash "$watch" 123 --snapshot "$tmp/bad" > "$tmp/out" 2>/dev/null; then echo 'FAIL: invalid JSON stream accepted'; exit 1; fi
done
mkdir "$tmp/bin"; cp "$dir/fake-gh.sh" "$tmp/bin/gh"; chmod +x "$tmp/bin/gh"
export PATH="$tmp/bin:$PATH" WATCH_TEST_DIR="$tmp" WATCH_TEST_FIXTURE="$dir/ready.json"
for scenario in pages race error partial malformed cycle suites; do
  export WATCH_TEST_SCENARIO=$scenario
  rm -f "$tmp/pr-count"
  bash "$watch" 123 --repo acme/demo > "$tmp/out" 2> "$tmp/stderr"
  case "$scenario" in
    pages) jq -e '.verdict == "READY" and (.snapshot.checks.head|length) == 2 and (.snapshot.comments|length) == 2 and (.snapshot.threads|length) == 2 and (.snapshot.threads[0].comments.nodes|length) == 2' "$tmp/out" >/dev/null;;
    *) jq -e '.verdict == "UNKNOWN"' "$tmp/out" >/dev/null;;
  esac
done
echo "PASS: $count verdict cases, snapshot identity/diff checks, seven collector scenarios"
