def blocker($kind; $reason): {kind:$kind,reason:$reason};
def latest_checks: sort_by(.id) | group_by([.name,.app.id]) | map(last);
def latest_statuses: sort_by(.id) | group_by(.context) | map(last);
def check_state:
  if .status != "completed" then "pending"
  else .conclusion as $c | if ["success","neutral","skipped"] | index($c) then "pass"
    elif ["failure","cancelled","timed_out","action_required","startup_failure","stale"] | index($c) then "fail" else "unknown" end end;
def status_state: if .state == "success" then "pass" elif .state == "pending" then "pending" elif .state == "failure" or .state == "error" then "fail" else "unknown" end;
def opinions: map(select(.state == "APPROVED" or .state == "CHANGES_REQUESTED" or .state == "DISMISSED")) | sort_by(.id) | group_by(.user.login) | map(last);
def fingerprint($s):
  {head:$s.pr.headRefOid,base:[$s.pr.baseRefName,$s.pr.baseRefOid,$s.baseTip,$s.pr.potentialMergeCommit.oid],
   checks:{runs:[$s.checks.head[],$s.checks.merge[]]|sort_by(.id)|map({id,name,status,conclusion,app:.app.id}),
     statuses:[$s.statuses.head[],$s.statuses.merge[]]|sort_by(.id)|map({id,context,state})},
   reviews:$s.reviews|sort_by(.id)|map({id,state,commit_id,body,user:.user.login}),
   threads:$s.threads|sort_by(.id)|map({id,isResolved,isOutdated,comments:.comments.nodes|sort_by(.id)|map({id,body,author:.author.login})}),
   comments:$s.comments|sort_by(.id)|map({id,body,user:.user.login}),
   policy:$s.policy,state:[$s.pr.state,$s.pr.isDraft,$s.pr.mergeable,$s.pr.mergeStateStatus,$s.pr.reviewDecision],errors:$s.errors};
. as $s
| (.policy.rules // []) as $rules
| (.policy.protection // {}) as $classic
| [$rules[] | select(.type == "pull_request") | .parameters] as $review_rules
| ([$review_rules[].required_approving_review_count,$classic.required_pull_request_reviews.required_approving_review_count] | map(. // 0) | max // 0) as $approval_count
| ([ ($rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks[]? | {context,app:(.integration_id // -1)}),
     ($classic.required_status_checks.checks[]? | {context,app:(.app_id // -1)}),
     ($classic.required_status_checks.contexts[]? | {context:.,app:-1})] | unique) as $required
| (.checks.head | latest_checks) as $head_checks
| (.checks.merge | latest_checks) as $merge_checks
| (.statuses.head | latest_statuses) as $head_statuses
| (.statuses.merge | latest_statuses) as $merge_statuses
# GitHub selects the test merge commit when it has checks or statuses.
| (if ($merge_checks|length) + ($merge_statuses|length) > 0 then $merge_checks else $head_checks end) as $checks
| (if ($merge_checks|length) + ($merge_statuses|length) > 0 then $merge_statuses else $head_statuses end) as $statuses
| (.reviews | opinions) as $opinions
| ([
    ($s.errors[] | blocker("UNKNOWN";.)),
    if .pr == null or .end == null then blocker("UNKNOWN";"PR details unavailable") else empty end,
    if any([.pr,.end][]; .number != $s.number or (.url|type) != "string" or
      any([.headRefOid,.baseRefOid][]; type != "string" or length == 0)) then blocker("UNKNOWN";"PR identity incomplete") else empty end,
    if [.pr.headRefOid,.pr.baseRefName,.pr.baseRefOid,.pr.potentialMergeCommit.oid] != [.end.headRefOid,.end.baseRefName,.end.baseRefOid,.end.potentialMergeCommit.oid]
      then blocker("UNKNOWN";"head, base or test merge commit moved during collection") else empty end,
    if [.pr.state,.pr.isDraft,.pr.mergeable,.pr.mergeStateStatus,.pr.reviewDecision,.pr.updatedAt] != [.end.state,.end.isDraft,.end.mergeable,.end.mergeStateStatus,.end.reviewDecision,.end.updatedAt] then blocker("UNKNOWN";"PR state moved during collection") else empty end,
    if .baseTip == null or .endBaseTip == null or .baseTip != .endBaseTip then blocker("UNKNOWN";"target branch tip unavailable or moved") else empty end,
    if (.policy.classic|type) != "boolean" or (.policy.classic == true and (.policy.protection|type) != "object") or (.policy.rules|type) != "array"
      then blocker("UNKNOWN";"branch policy unavailable") else empty end,
    ($rules[] | if .type == "required_status_checks" and (.parameters.required_status_checks|type) != "array" or
      .type == "pull_request" and ((.parameters.required_approving_review_count|type) != "number" or .parameters.required_approving_review_count < 0) then blocker("UNKNOWN";"incomplete branch rule parameters") else empty end),
    if .policy.classic == true and (($classic|has("required_status_checks")|not) or ($classic|has("required_pull_request_reviews")|not)) then blocker("UNKNOWN";"incomplete classic branch policy") else empty end,
    if $classic.required_status_checks != null and (($classic.required_status_checks.contexts|type) != "array" or ($classic.required_status_checks.checks|type) != "array") then blocker("UNKNOWN";"incomplete classic required checks") else empty end,
    if $classic.required_pull_request_reviews != null and ($classic.required_pull_request_reviews.required_approving_review_count as $count | if ($count|type) != "number" then true else $count < 0 or ($count|floor) != $count end) then blocker("UNKNOWN";"incomplete classic required approvals") else empty end,
    if any([.checks.head[],.checks.merge[]][]; (.id|type) != "number" or (.name|type) != "string" or .name == "" or (.app.id|type) != "number") then blocker("UNKNOWN";"check run identity incomplete") else empty end,
    if any([.statuses.head[],.statuses.merge[]][]; (.id|type) != "number" or (.context|type) != "string" or .context == "") then blocker("UNKNOWN";"status identity incomplete") else empty end,
    ($rules[] | .type as $type | select(["pull_request","required_status_checks","creation","deletion","non_fast_forward"] | index($type) | not)
      | blocker(if .type == "merge_queue" then "NEEDS_HUMAN" else "UNKNOWN" end;"unsupported branch rule: \(.type)")),
    if .pr.mergeable == "CONFLICTING" then blocker("NEEDS_FIX";"merge conflict")
      elif .pr.mergeable == "UNKNOWN" then blocker("WAITING";"GitHub is computing mergeability")
      elif .pr.mergeable != "MERGEABLE" then blocker("UNKNOWN";"mergeability unavailable") else empty end,
    if .pr.mergeStateStatus == "BEHIND" then blocker("NEEDS_FIX";"branch is behind required base")
      elif .pr.mergeStateStatus == "UNSTABLE" then blocker("WAITING";"GitHub reports unstable checks")
      elif .pr.mergeStateStatus == "DIRTY" then blocker("NEEDS_FIX";"merge conflict")
      elif .pr.mergeStateStatus == "UNKNOWN" then blocker("WAITING";"GitHub is computing merge state")
      # BLOCKED is explained by the other blockers; an unexplained one is checked below.
      elif .pr.mergeStateStatus == "BLOCKED" or (.pr.mergeStateStatus == "DRAFT" and .pr.isDraft == true) then empty
      elif .pr.mergeStateStatus != "CLEAN" then blocker("UNKNOWN";"merge state is not CLEAN: \(.pr.mergeStateStatus)") else empty end,
    if .pr.isDraft == true then blocker("NEEDS_HUMAN";"PR is draft") elif (.pr.isDraft|type) != "boolean" then blocker("UNKNOWN";"draft state unavailable") else empty end,
    if .pr.state != "OPEN" and .pr.state != "CLOSED" and .pr.state != "MERGED" then blocker("UNKNOWN";"PR state unavailable") else empty end,
    if .pr.reviewDecision == "CHANGES_REQUESTED" or any($opinions[]; .state == "CHANGES_REQUESTED") then blocker("NEEDS_FIX";"outstanding changes request") else empty end,
    if .pr.reviewDecision == "REVIEW_REQUIRED" then blocker("NEEDS_HUMAN";"GitHub requires review")
      elif .pr.reviewDecision != "APPROVED" and .pr.reviewDecision != "CHANGES_REQUESTED" and .pr.reviewDecision != "" and .pr.reviewDecision != null then blocker("UNKNOWN";"review decision unavailable") else empty end,
    if $approval_count > 0 then
      if .pr.reviewDecision == "REVIEW_REQUIRED" then blocker("NEEDS_HUMAN";"required review approval missing")
      elif .pr.reviewDecision != "APPROVED" then blocker("UNKNOWN";"required approval policy not confirmed by GitHub")
      elif ([$opinions[] | select(.state == "APPROVED")]|length) < $approval_count then blocker("NEEDS_HUMAN";"required approval count missing")
      elif ($classic.required_pull_request_reviews.dismiss_stale_reviews == true or any($review_rules[]; .dismiss_stale_reviews_on_push == true)) and
        ([$opinions[] | select(.state == "APPROVED" and .commit_id == $s.pr.headRefOid)]|length) < $approval_count then blocker("NEEDS_HUMAN";"current head approval missing") else empty end
    elif any($review_rules[]; .require_code_owner_review == true or .require_last_push_approval == true) or
      $classic.required_pull_request_reviews.require_code_owner_reviews == true or $classic.required_pull_request_reviews.require_last_push_approval == true then
      if .pr.reviewDecision != "APPROVED" then blocker("NEEDS_HUMAN";"special review approval missing") else empty end else empty end,
    (.threads[] | if .isResolved == false then blocker("NEEDS_FIX";"unresolved review thread: \(.id)")
      elif .isResolved != true then blocker("UNKNOWN";"review thread resolution unavailable") else empty end),
    (.threads[] | if .comments.pageInfo.hasNextPage != false then blocker("UNKNOWN";"thread replies incomplete: \(.id)") else empty end),
    ((($checks[] | {name,state:check_state}), ($statuses[] | {name:.context,state:status_state}))
      | select(.state != "pass") | blocker(if .state == "fail" then "NEEDS_FIX" elif .state == "pending" then "WAITING" else "UNKNOWN" end;"check \(.name): \(.state)")),
    ($required[] as $r | [$checks[] | select(.name == $r.context and ($r.app == -1 or .app.id == $r.app))] as $runs
      | [$statuses[] | select(.context == $r.context)] as $legacy
      | if $r.app != -1 and ($legacy|length) > 0 then blocker("UNKNOWN";"app identity unavailable for required legacy status: \($r.context)")
        elif ($runs|length) + ($legacy|length) == 0 then blocker("WAITING";"required check missing: \($r.context)") else empty end)
  ] | unique) as $found
| ($found + if .pr.mergeStateStatus == "BLOCKED" and all($found[]; .kind == "UNKNOWN")
    then [blocker("UNKNOWN";"merge blocked for an unidentified reason")] else [] end | unique) as $blockers
| (if (.pr.state == "CLOSED" or .pr.state == "MERGED") and .pr.state == .end.state then "STOP"
   elif any($blockers[]; .kind == "UNKNOWN") then "UNKNOWN"
   elif any($blockers[]; .kind == "NEEDS_FIX") then "NEEDS_FIX"
   elif any($blockers[]; .kind == "NEEDS_HUMAN") then "NEEDS_HUMAN"
   elif any($blockers[]; .kind == "WAITING") then "WAITING" else "READY" end) as $verdict
| fingerprint($s) as $current
| (if $previous[0] == null then ["initial"] else fingerprint($previous[0]) as $old | [$current|keys[]|select($current[.] != $old[.])] end) as $changes
| {snapshot:$s,verdict:$verdict,blockers:$blockers,changes:$changes}
