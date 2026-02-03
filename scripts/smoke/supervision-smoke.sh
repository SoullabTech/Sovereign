#!/usr/bin/env bash
#
# Supervision smoke test - validates supervision session lifecycle and Practice mode
#
# Usage:
#   ./scripts/smoke/supervision-smoke.sh [BASE_URL] [OPTIONS]
#
# Options:
#   --with-practice       Test Practice insights generation via /api/practice/insights/generate
#   --check-insights-sse  Test SSE stream at /api/supervision/insights/stream
#
# Examples:
#   ./scripts/smoke/supervision-smoke.sh                              # Basic test
#   ./scripts/smoke/supervision-smoke.sh --with-practice              # With Practice mode
#   ./scripts/smoke/supervision-smoke.sh https://soullab.life --check-insights-sse
#
set -euo pipefail

# Parse arguments
BASE_URL="http://localhost:3000"
WITH_PRACTICE=false
CHECK_SSE=false

for arg in "$@"; do
  case "$arg" in
    --with-practice) WITH_PRACTICE=true ;;
    --check-insights-sse) CHECK_SSE=true ;;
    http://*|https://*) BASE_URL="$arg" ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

# Use DATABASE_URL if provided; otherwise default to local db name.
if [[ -n "${DATABASE_URL:-}" ]]; then
  PSQL_BASE=(psql "$DATABASE_URL" -v ON_ERROR_STOP=1)
else
  PSQL_BASE=(psql -d "${PGDATABASE:-maia_consciousness}" -v ON_ERROR_STOP=1)
fi

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing dependency: $1"; exit 1; }; }
need curl
need jq
need psql

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

psqlq() { "${PSQL_BASE[@]}" -tA -c "$1"; }

expect_fail_contains() {
  local needle="$1"; shift
  set +e
  local out
  out="$("$@" 2>&1)"
  local code=$?
  set -e
  if [[ $code -eq 0 ]]; then
    echo "$out"
    no "Expected failure, but command succeeded."
  fi
  if ! echo "$out" | grep -qF "$needle"; then
    echo "$out"
    no "Failure did not contain expected text: $needle"
  fi
  ok "Expected failure matched: $needle"
}

http_post_json() {
  local url="$1"
  local data="$2"
  curl -sS -X POST "${BASE_URL}${url}" \
    -H "Content-Type: application/json" \
    -d "$data"
}

http_get_json() {
  local url="$1"
  curl -sS "${BASE_URL}${url}"
}

log "Supervision smoke test starting…"
log "BASE_URL=${BASE_URL}"
if [[ -n "${DATABASE_URL:-}" ]]; then log "DATABASE_URL=(set)"; else log "PGDATABASE=${PGDATABASE:-maia_consciousness}"; fi

# 0) Basic API health check
log "Checking /api/supervision/sessions?limit=1 …"
HEALTH_JSON="$(http_get_json "/api/supervision/sessions?limit=1")"
echo "$HEALTH_JSON" | jq -e '.success == true' >/dev/null || no "Health check failed: $HEALTH_JSON"
ok "Health check OK"

# 1) Verify trigger exists
log "Verifying integrity trigger exists…"
TRG_COUNT="$(psqlq "SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trg_practice_insights_session_exists';")"
[[ "${TRG_COUNT}" == "1" ]] || no "Trigger not found: trg_practice_insights_session_exists"
ok "Trigger exists"

# 2) Pick a world_id for practice_insights
log "Fetching a practice_worlds.id…"
WORLD_ID="$(psqlq "SELECT id FROM practice_worlds ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 1;")"
[[ -n "${WORLD_ID}" ]] || no "No practice_worlds rows found (WORLD_ID empty)."
ok "WORLD_ID=${WORLD_ID}"

# 3) FAIL case: insert insight with bogus session_id must fail with trigger error
BAD_SESSION_ID="$(psqlq "SELECT gen_random_uuid();")"
log "Testing FAIL case insert with bogus session_id=${BAD_SESSION_ID}…"
expect_fail_contains \
  "not found in practice_sessions or supervision_sessions" \
  psql "${PSQL_BASE[@]:1}" -v ON_ERROR_STOP=1 -tA -c \
  "INSERT INTO practice_insights (session_id, world_id, insight_type, content)
   VALUES ('${BAD_SESSION_ID}'::uuid, '${WORLD_ID}'::uuid, 'smoke_test', 'should fail');"

# 4) Start a real supervision session
log "Starting supervision session…"
START_JSON="$(http_post_json "/api/supervision/session/start" "$(jq -nc '{title:"Smoke Test Session", sessionType:"consultation"}')")"
SESSION_ID="$(echo "$START_JSON" | jq -er '.session.id')"
echo "$START_JSON" | jq -e '.success == true' >/dev/null || no "Start session failed: $START_JSON"
ok "SESSION_ID=${SESSION_ID}"

# 5) Ingest transcript segments (array form)
log "Injecting transcript segments…"
SEGMENTS_JSON="$(jq -nc --arg sid "$SESSION_ID" '[
  {sessionId:$sid, speaker:"therapist", startMs:0,     endMs:5000,  text:"Welcome. What feels most present today?", isFinal:true},
  {sessionId:$sid, speaker:"client",   startMs:5500,  endMs:14000, text:"My chest is tight and my thoughts are racing.", isFinal:true},
  {sessionId:$sid, speaker:"therapist",startMs:14500, endMs:22000, text:"Let us slow down and notice what the body is saying.", isFinal:true}
]')"
ADD_JSON="$(http_post_json "/api/supervision/transcript" "$SEGMENTS_JSON")"
echo "$ADD_JSON" | jq -e '.success == true' >/dev/null || no "Add segments failed: $ADD_JSON"
ok "Segments injected"

# 6) Poll transcript initial (afterMs=-1)
log "Polling transcript afterMs=-1…"
POLL1_JSON="$(http_get_json "/api/supervision/transcript?sessionId=${SESSION_ID}&afterMs=-1&limit=200")"
echo "$POLL1_JSON" | jq -e '.success == true' >/dev/null || no "Transcript poll failed: $POLL1_JSON"
CURSOR1="$(echo "$POLL1_JSON" | jq -er '.cursor.afterMs')"
SEGCOUNT1="$(echo "$POLL1_JSON" | jq -er '.segments | length')"
[[ "$SEGCOUNT1" -ge 3 ]] || no "Expected >=3 segments on initial poll, got ${SEGCOUNT1}"
ok "Transcript poll OK (segments=${SEGCOUNT1}, cursor.afterMs=${CURSOR1})"

# 7) Incremental polling correctness: inject one more segment, then poll using prior cursor
log "Injecting one more segment for incremental poll…"
ADD2_JSON="$(http_post_json "/api/supervision/transcript" "$(jq -nc --arg sid "$SESSION_ID" '{
  sessionId:$sid, speaker:"client", startMs:23000, endMs:31000,
  text:"When you say slow down, I can finally feel my shoulders unclench.",
  isFinal:true
}')")"
echo "$ADD2_JSON" | jq -e '.success == true' >/dev/null || no "Add single segment failed: $ADD2_JSON"
ok "Extra segment injected"

log "Polling transcript incrementally afterMs=${CURSOR1}…"
POLL2_JSON="$(http_get_json "/api/supervision/transcript?sessionId=${SESSION_ID}&afterMs=${CURSOR1}&limit=200")"
echo "$POLL2_JSON" | jq -e '.success == true' >/dev/null || no "Incremental poll failed: $POLL2_JSON"
SEGCOUNT2="$(echo "$POLL2_JSON" | jq -er '.segments | length')"
CURSOR2="$(echo "$POLL2_JSON" | jq -er '.cursor.afterMs')"
[[ "$SEGCOUNT2" -ge 1 ]] || no "Expected >=1 new segment on incremental poll, got ${SEGCOUNT2}"
[[ "$CURSOR2" -gt "$CURSOR1" ]] || no "Expected cursor.afterMs to advance (got ${CURSOR2} vs ${CURSOR1})"
ok "Incremental poll OK (segments=${SEGCOUNT2}, cursor.afterMs=${CURSOR2})"

# 8) PASS case: insert insight with real supervision session_id must succeed
log "Testing PASS case insert with real supervision session_id…"
INSIGHT_ID="$(psqlq "INSERT INTO practice_insights (session_id, world_id, insight_type, content)
                     VALUES ('${SESSION_ID}'::uuid, '${WORLD_ID}'::uuid, 'smoke_test', 'should pass')
                     RETURNING id;" | head -1)"
[[ -n "${INSIGHT_ID}" ]] || no "Insert practice_insights PASS case returned empty id"
ok "Inserted practice_insights id=${INSIGHT_ID}"

# 9) UPDATE should FAIL (set session_id to bogus)
log "Testing FAIL case UPDATE to bogus session_id…"
expect_fail_contains \
  "not found in practice_sessions or supervision_sessions" \
  psql "${PSQL_BASE[@]:1}" -v ON_ERROR_STOP=1 -tA -c \
  "UPDATE practice_insights SET session_id = '${BAD_SESSION_ID}'::uuid WHERE id = '${INSIGHT_ID}'::uuid;"

# 10) Optional: Practice insights generation (--with-practice)
if [[ "$WITH_PRACTICE" == "true" ]]; then
  log "Testing Practice insights generation via API…"
  WORLD_CODE="$(psqlq "SELECT code FROM practice_worlds ORDER BY RANDOM() LIMIT 1;")"
  PRAC_JSON="$(http_post_json "/api/practice/insights/generate" "$(jq -nc --arg sid "$SESSION_ID" --arg wc "$WORLD_CODE" '{
    sessionId: $sid,
    worldCode: $wc,
    generateAll: true
  }')")"

  if echo "$PRAC_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
    INSIGHT_COUNT="$(echo "$PRAC_JSON" | jq -er '.insights | length')"
    ok "Practice insights generated (worldCode=${WORLD_CODE}, count=${INSIGHT_COUNT})"
  else
    # May fail if Ollama not running - warn but don't fail test
    PRAC_ERR="$(echo "$PRAC_JSON" | jq -r '.error // "unknown"')"
    echo "⚠️  Practice insight generation skipped: ${PRAC_ERR}"
  fi
fi

# 11) Optional: SSE stream check (--check-insights-sse)
if [[ "$CHECK_SSE" == "true" ]]; then
  log "Testing insights SSE stream…"
  # Capture first 5 seconds of SSE output
  SSE_OUT="$(timeout 5 curl -sS "${BASE_URL}/api/supervision/insights/stream?sessionId=${SESSION_ID}&afterTs=0" 2>/dev/null || true)"

  if echo "$SSE_OUT" | grep -q "event: ready"; then
    ok "SSE stream responded with ready event"
  else
    echo "⚠️  SSE stream did not return ready event within timeout"
  fi
fi

# 12) Cleanup: delete insights + stop session
log "Cleanup: deleting test insights…"
psqlq "DELETE FROM practice_insights WHERE session_id = '${SESSION_ID}'::uuid;"
ok "Insights deleted"

log "Stopping supervision session…"
# Skip analysis to keep smoke test fast (triggerAnalysis: false)
STOP_JSON="$(http_post_json "/api/supervision/session/stop" "$(jq -nc --arg sid "$SESSION_ID" '{sessionId:$sid, triggerAnalysis:false}')" )"
echo "$STOP_JSON" | jq -e '.success == true' >/dev/null || no "Stop session failed: $STOP_JSON"
ok "Session stopped"

ok "Supervision smoke test PASSED ✅"
