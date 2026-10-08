#!/usr/bin/env bash
set -eu
if [ "$1" = pr ]; then
  count=0; [ ! -f "$WATCH_TEST_DIR/pr-count" ] || count=$(cat "$WATCH_TEST_DIR/pr-count")
  count=$((count + 1)); echo "$count" > "$WATCH_TEST_DIR/pr-count"
  if [ "$WATCH_TEST_SCENARIO" = race ] && [ "$count" -gt 1 ]; then jq '.pr|.headRefOid="new"' "$WATCH_TEST_FIXTURE"; else jq .pr "$WATCH_TEST_FIXTURE"; fi
  exit
fi
[ "$1" = api ] || exit 1
endpoint=$2; shift 2
case "$endpoint" in
  graphql)
    if [ "$WATCH_TEST_SCENARIO" = partial ]; then echo '{"data":{},"errors":[{"message":"denied"}]}'; exit; fi
    args=" $* "
    if [ "$WATCH_TEST_SCENARIO" = cycle ]; then
      next=A; [[ "$args" != *'endCursor=A'* ]] || next=B
      printf '{"data":{"repository":{"pullRequest":{"baseRef":{"branchProtectionRule":null},"reviewThreads":{"nodes":[],"pageInfo":{"hasNextPage":true,"endCursor":"%s"}}}}}}\n' "$next"
    elif [[ "$args" = *'id=t1'* ]]; then
      echo '{"data":{"node":{"comments":{"nodes":[{"id":"r2","body":"reply"}],"pageInfo":{"hasNextPage":false,"endCursor":null}}}}}'
    elif [[ "$args" = *'endCursor=next'* ]]; then
      echo '{"data":{"repository":{"pullRequest":{"baseRef":{"branchProtectionRule":null},"reviewThreads":{"nodes":[{"id":"t2","isResolved":true,"comments":{"nodes":[],"pageInfo":{"hasNextPage":false}}}],"pageInfo":{"hasNextPage":false}}}}}}'
    elif [ "$WATCH_TEST_SCENARIO" = malformed ]; then echo '{"data":{"repository":{"pullRequest":{"reviewThreads":{"nodes":[],"pageInfo":{}}}}}}'
    else echo '{"data":{"repository":{"pullRequest":{"baseRef":{"branchProtectionRule":null},"reviewThreads":{"nodes":[{"id":"t1","isResolved":true,"comments":{"nodes":[{"id":"r1","body":"first"}],"pageInfo":{"hasNextPage":true,"endCursor":"reply-next"}}}],"pageInfo":{"hasNextPage":true,"endCursor":"next"}}}}}}'; fi ;;
  */branches/main) echo '{"commit":{"sha":"b"}}' ;;
  */check-suites*) if [ "$WATCH_TEST_SCENARIO" = suites ]; then echo '{"total_count":1001}'; else echo '{"total_count":2}'; fi ;;
  *)
    [[ " $* " = *' --paginate '* && " $* " = *' --slurp '* && " $* " = *' --method GET '* ]] || exit 1
    case "$endpoint" in
      */rules/branches/*) if [ "$WATCH_TEST_SCENARIO" = error ]; then echo 'denied' >&2; exit 1; else echo '[[],[]]'; fi;;
      */check-runs*) [[ "$endpoint" = *'filter=latest'* ]] || exit 1
        echo '[{"total_count":2,"check_runs":[{"id":1,"name":"one","app":{"id":42},"status":"completed","conclusion":"success"}]},{"total_count":2,"check_runs":[{"id":2,"name":"two","app":{"id":42},"status":"completed","conclusion":"success"}]}]' ;;
      */comments*) echo '[[{"id":1,"body":"one"}],[{"id":2,"body":"two"}]]' ;;
      *) echo '[[],[]]' ;;
    esac ;;
esac
