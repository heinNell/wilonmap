#!/usr/bin/env bash
set -euo pipefail

# --- Config
API="https://hst-api.wialon.com/wialon/ajax.html"
SID_FILE="${XDG_STATE_HOME:-$HOME/.local/state}/wialon.sid"
mkdir -p "$(dirname "$SID_FILE")"

# Optional: source a private .env next to this script
if [[ -f "$(dirname "$0")/.env" ]]; then
  # .env should define WIALON_TOKEN=...
  # Ensure the file is chmod 600
  set -o allexport
  # shellcheck disable=SC1090
  source "$(dirname "$0")/.env"
  set +o allexport
fi

# --- Helpers
have() { command -v "$1" >/dev/null 2>&1; }
require_tools() {
  for t in curl jq; do
    have "$t" || { echo "Missing tool: $t" >&2; exit 127; }
  done
}

save_sid() { printf "%s" "$1" > "$SID_FILE"; }
load_sid() { [[ -f "$SID_FILE" ]] && cat "$SID_FILE" || true; }
clear_sid() { rm -f "$SID_FILE"; }

# Unified POST to Wialon
post() {
  local svc="$1"; shift
  local params="$1"; shift
  local sid="${1:-}"; shift || true

  # Build form fields
  local data=(
    --data-urlencode "svc=${svc}"
    --data-urlencode "params=${params}"
  )
  if [[ -n "$sid" ]]; then
    data+=( --data-urlencode "sid=${sid}" )
  fi

  curl -sS --fail-with-body -X POST "$API" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    "${data[@]}"
}

# Pretty print JSON with jq if available
pp() { jq '.' 2>/dev/null || cat; }

# --- Commands

cmd_login() {
  require_tools
  local token="${WIALON_TOKEN:-}"
  if [[ -z "$token" ]]; then
    echo "Set WIALON_TOKEN in env or .env before login." >&2
    exit 2
  fi
  # EXACT call from your example: svc=token/login with token
  local res
  res="$(post "token/login" "{\"token\":\"${token}\"}")" || {
    echo "Login failed."; exit 1; }
  # Wialon returns an "eid" session id; later requests use "sid=eid"
  local sid
  sid="$(printf "%s" "$res" | jq -r '.eid // .sid // empty')"
  if [[ -z "$sid" || "$sid" == "null" ]]; then
    echo "Could not extract SID from response:"; printf "%s\n" "$res" | pp; exit 1
  fi
  save_sid "$sid"
  echo "Login OK. SID saved."
  printf "%s\n" "$res" | pp
}

cmd_logout() {
  local sid; sid="$(load_sid)"
  [[ -z "$sid" ]] && { echo "No SID found. Already logged out?"; exit 0; }
  post "core/logout" "{}" "$sid" | pp || true
  clear_sid
  echo "Logged out and SID cleared."
}

cmd_units_list() {
  # EXACT: core/search_items avl_unit by sys_name, flags=1
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local params='{"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}'
  post "core/search_items" "$params" "$sid" | pp
}

cmd_unit_by_id() {
  # EXACT: specific unit by sys_id with huge flags=4611686018427387903
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local unit_id="${1:?Usage: $0 unit-by-id <UNIT_ID>}"
  local params
  params="$(jq -cn --arg id "$unit_id" \
    '{spec:{itemsType:"avl_unit",propName:"sys_id",propValueMask:$id,sortType:"sys_name"},force:1,flags:(4611686018427387903|tonumber),from:0,to:0}')"
  post "core/search_items" "$params" "$sid" | pp
}

cmd_positions_now() {
  # EXACT: real-time tracking flags=1025
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local params='{"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1025,"from":0,"to":0}'
  post "core/search_items" "$params" "$sid" | pp
}

cmd_reports_list() {
  # EXACT: avl_resource flags=8192 (report templates)
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local params='{"spec":{"itemsType":"avl_resource","propName":"","propValueMask":"","sortType":""},"force":1,"flags":8192,"from":0,"to":0}'
  post "core/search_items" "$params" "$sid" | pp
}

cmd_history() {
  # EXACT: messages/load_interval with loadCount=100
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local unit_id="${1:?Usage: $0 history <UNIT_ID> <FROM_UNIX> <TO_UNIX> [LOAD_COUNT=100] }"
  local from_ts="${2:?missing FROM_UNIX}"
  local to_ts="${3:?missing TO_UNIX}"
  local count="${4:-100}"
  local params
  params="$(jq -cn --argjson itemId "$unit_id" --argjson timeFrom "$from_ts" --argjson timeTo "$to_ts" --argjson loadCount "$count" \
    '{itemId:$itemId,timeFrom:$timeFrom,timeTo:$timeTo,flags:0,flagsMask:0,loadCount:$loadCount}')"
  post "messages/load_interval" "$params" "$sid" | pp
}

cmd_geofences() {
  # EXACT (your first form): avl_resource flags=16, no prop filters
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local params='{"spec":{"itemsType":"avl_resource","propName":"","propValueMask":"","sortType":""},"force":1,"flags":16,"from":0,"to":0}'
  post "core/search_items" "$params" "$sid" | pp
}

cmd_geofences_wild() {
  # EXACT (your adjusted form): propName:"name", propValueMask:"*", flags=16
  local sid; sid="$(load_sid)"; [[ -z "$sid" ]] && { echo "Not logged in."; exit 3; }
  local params='{"spec":{"itemsType":"avl_resource","propName":"name","propValueMask":"*","sortType":""},"force":1,"flags":16,"from":0,"to":0}'
  post "core/search_items" "$params" "$sid" | pp
}

# --- UX sugar

usage() {
  cat <<'EOF'
Wialon CLI (curl-based)
Usage:
  wialon.sh login                       # token/login  (uses $WIALON_TOKEN)
  wialon.sh logout                      # core/logout
  wialon.sh units-list                  # avl_unit by sys_name (flags=1)
  wialon.sh unit-by-id <UNIT_ID>        # avl_unit by sys_id (flags=4611686018427387903)
  wialon.sh positions-now               # real-time tracking (flags=1025)
  wialon.sh reports-list                # avl_resource (flags=8192)
  wialon.sh history <UNIT_ID> <FROM_UNIX> <TO_UNIX> [LOAD_COUNT=100]   # messages/load_interval
  wialon.sh geofences                   # avl_resource (flags=16)
  wialon.sh geofences-wild              # avl_resource name="*" (flags=16)

Tips:
  # Convert human time to epoch (GNU date)
  FROM=$(date -d "2025-09-20 00:00:00Z" +%s)
  TO=$(date   -d "2025-09-21 00:00:00Z" +%s)
  ./wialon.sh history 600590053 "$FROM" "$TO"

Security:
  export WIALON_TOKEN=...   # or put into ./.env (chmod 600)
EOF
}

main() {
  local cmd="${1:-}"; shift || true
  case "$cmd" in
    login)            cmd_login "$@";;
    logout)           cmd_logout "$@";;
    units-list)       cmd_units_list "$@";;
    unit-by-id)       cmd_unit_by_id "$@";;
    positions-now)    cmd_positions_now "$@";;
    reports-list)     cmd_reports_list "$@";;
    history)          cmd_history "$@";;
    geofences)        cmd_geofences "$@";;
    geofences-wild)   cmd_geofences_wild "$@";;
    -h|--help|"")     usage;;
    *) echo "Unknown command: $cmd" >&2; usage; exit 2;;
  esac
}

main "$@"
