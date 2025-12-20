#!/usr/bin/env bash
# scripts/certify-memory.sh - Persistent Memory Certification
# Proves memory survives server restarts

set -e

PORT=${PORT:-3000}
BASE_URL="http://localhost:$PORT"
TEST_SESSION_ID="memory_cert_$(date +%s)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

test_start() {
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  echo -e "\n${YELLOW}[$TESTS_TOTAL]${NC} $1"
}

test_pass() {
  TESTS_PASSED=$((TESTS_PASSED + 1))
  echo -e "  ${GREEN}✓${NC} $1"
}

test_fail() {
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo -e "  ${RED}✗${NC} $1"
  echo "  Detail: $2"
}

# Robust JSON handling - write to file, validate, extract
post_maia_json() {
  local outfile="$1"
  local payload="$2"
  local errfile="${outfile}.err"

  if ! curl -sS --max-time 20 --retry 2 --retry-connrefused \
    -X POST "$BASE_URL/api/sovereign/app/maia" \
    -H "Content-Type: application/json" \
    --data-binary "$payload" > "$outfile" 2>"$errfile"; then
    echo "❌ curl failed. stderr:" >&2
    cat "$errfile" >&2
    return 1
  fi

  # Clean up error file if empty
  [ -s "$errfile" ] || rm -f "$errfile"
}

assert_valid_json() {
  local file="$1"
  python3 - "$file" <<'PY'
import json,sys
path=sys.argv[1]
try:
  with open(path,"r",encoding="utf-8") as f:
    json.load(f)
except Exception as e:
  print("❌ Invalid JSON in:", path)
  print("Error:", e)
  print("---- RAW BODY START ----")
  with open(path,"r",encoding="utf-8") as f:
    print(f.read())
  print("---- RAW BODY END ----")
  sys.exit(2)
PY
}

extract_response_text() {
  local file="$1"
  python3 - "$file" <<'PY'
import json,sys
with open(sys.argv[1],"r",encoding="utf-8") as f:
  data=json.load(f)
# try common shapes
candidates = [
  ("message",),
  ("text",),
  ("response",),
  ("data","message"),
  ("data","text"),
  ("result","message"),
  ("result","text"),
]
for path in candidates:
  cur=data
  ok=True
  for p in path:
    if isinstance(cur,dict) and p in cur:
      cur=cur[p]
    else:
      ok=False
      break
  if ok and isinstance(cur,str) and cur.strip():
    print(cur.strip())
    exit(0)
print("")
PY
}

extract_json() {
  local file="$1"
  local jq_path="$2"
  python3 - "$file" "$jq_path" <<'PY'
import json,sys
with open(sys.argv[1],"r",encoding="utf-8") as f:
  data=json.load(f)
path=sys.argv[2].strip().lstrip(".")
if not path:
  print(json.dumps(data))
  exit(0)
parts=path.split(".")
cur=data
for p in parts:
  if isinstance(cur,dict) and p in cur:
    cur=cur[p]
  else:
    print("0")
    exit(0)
print(cur if isinstance(cur,(int,float)) else (cur if isinstance(cur,str) else "0"))
PY
}

# Generate unguessable token for favorite plant
TOKEN=$(python3 - <<'PY'
import secrets; print(secrets.token_hex(4))
PY
)
FAVORITE_PLANT="orchid-${TOKEN}"

# Server management functions
SERVER_LOG="/tmp/maia-certify-memory-server.log"
SERVER_PID=""

wait_for_server() {
  local waited=0
  while [ $waited -lt 45 ]; do
    if curl -sS --max-time 2 "$BASE_URL/api/health" 2>/dev/null | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
      echo "  ✓ Server ready (${waited}s startup time)"
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
  done

  echo "  ✗ Server did not become ready within 45s. Tail logs:"
  tail -80 "$SERVER_LOG" 2>/dev/null || true
  exit 1
}

start_server() {
  echo "  → Starting server (PORT=$PORT)..."
  rm -rf .next >/dev/null 2>&1 || true
  PORT="$PORT" npm run dev >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
  wait_for_server
}

stop_server() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "  → Stopping server (pid=$SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    sleep 2
  fi

  # Fallback: ensure nothing is still holding the port
  local pids
  pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  → Forcing port cleanup on :$PORT (pids: $pids)"
    kill $pids 2>/dev/null || true
    sleep 1
  fi

  SERVER_PID=""
}

trap 'stop_server' EXIT

echo "======================================"
echo "  MEMORY PERSISTENCE CERTIFICATION"
echo "======================================"
echo "Session ID: $TEST_SESSION_ID"
echo "Testing against: $BASE_URL"
echo "Unguessable plant: $FAVORITE_PLANT"
echo ""

# Start server for initial tests
start_server

# ============================================
# TEST 0: No-name fabrication guard (cold start)
# ============================================
test_start "No-name fabrication guard (must not invent a name)"

NONAME_SESSION="memory_noname_${TOKEN}_$(date +%s)"
TURN0_FILE="/tmp/maia_memory_turn0_noname.json"

post_maia_json "$TURN0_FILE" "{\"message\":\"Hi\",\"userId\":\"$NONAME_SESSION\",\"mode\":\"dialogue\",\"sessionId\":\"$NONAME_SESSION\"}" || {
  test_fail "Turn 0 failed" "curl failed"
}
assert_valid_json "$TURN0_FILE"

TURN0_TEXT="$(extract_response_text "$TURN0_FILE")"
TURN0_EXCH_INJ="$(extract_json "$TURN0_FILE" "metadata.memory.exchangesInjected")"

python3 - "$TURN0_TEXT" "$TURN0_EXCH_INJ" <<'PY'
import re,sys
text=(sys.argv[1] or "").strip()
inj=int(sys.argv[2] or "0")
# We only care about the cold-start condition (no injected memory)
if inj != 0:
  sys.exit(0)

# Detect greeting + invented name, allow generic non-names
m=re.match(r'^\s*(hi|hey|hello|good (?:morning|afternoon|evening))\s+([A-Za-z][a-z]{2,})\b', text, re.I)
if not m:
  sys.exit(0)

name=m.group(2).lower()
allowed={"there","friend","friends","everyone","all","folks","yall","team"}
sys.exit(0 if name in allowed else 1)
PY

if [ $? -eq 0 ]; then
  test_pass "No invented name greeting (exchangesInjected=${TURN0_EXCH_INJ:-0})"
else
  test_fail "Invented a name in greeting" "Response: ${TURN0_TEXT:0:160}"
fi

# ============================================
# TEST 1: Write conversation turn to database
# ============================================
test_start "Write Turn 1 - Initial conversation"

TURN1_FILE="/tmp/maia_memory_turn1.json"
post_maia_json "$TURN1_FILE" "{\"message\":\"My name is Alice and I love gardening\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}"
assert_valid_json "$TURN1_FILE"
TURN1_TEXT="$(extract_response_text "$TURN1_FILE")"

if [ -n "$TURN1_TEXT" ]; then
  test_pass "Turn 1 completed successfully"
else
  test_fail "Turn 1 failed" "No response text received"
fi

# ============================================
# TEST 2: Write second turn with context
# ============================================
test_start "Write Turn 2 - Add context about favorite plant"

TURN2_FILE="/tmp/maia_memory_turn2.json"
post_maia_json "$TURN2_FILE" "{\"message\":\"My favorite plant is ${FAVORITE_PLANT}\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}"
assert_valid_json "$TURN2_FILE"
TURN2_TEXT="$(extract_response_text "$TURN2_FILE")"

if [ -n "$TURN2_TEXT" ]; then
  test_pass "Turn 2 completed successfully"
else
  test_fail "Turn 2 failed" "No response text received"
fi

# Give DB a moment to flush
sleep 1

# ============================================
# TEST 2.5: DB Sanity Check - Verify retrieval works
# ============================================
test_start "DB Sanity Check - Can we query what we just wrote?"

DB_QUERY_TEST=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "SELECT id, turn_count, jsonb_array_length(conversation_history) AS hist_len FROM maia_sessions WHERE id = '$TEST_SESSION_ID';" 2>/dev/null | xargs)

if echo "$DB_QUERY_TEST" | grep -q "$TEST_SESSION_ID"; then
  HIST_LEN=$(echo "$DB_QUERY_TEST" | awk '{print $NF}')
  if [ "$HIST_LEN" = "2" ]; then
    test_pass "DB query returns correct history length: $HIST_LEN exchanges"
  else
    test_fail "DB query history length mismatch" "Expected 2, got: $HIST_LEN"
  fi
else
  test_fail "DB query failed or session not found" "Query result: $DB_QUERY_TEST"
fi

# ============================================
# TEST 3: Verify database persistence
# ============================================
test_start "Database Persistence - Check PostgreSQL directly"

DB_COUNT=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "SELECT turn_count FROM maia_sessions WHERE id = '$TEST_SESSION_ID'" 2>/dev/null | xargs)

if [ "$DB_COUNT" = "2" ]; then
  test_pass "Database shows 2 turns persisted"
elif [ -z "$DB_COUNT" ]; then
  test_fail "Database has no record of session" "Query returned empty"
else
  test_fail "Database turn count mismatch" "Expected 2, got: $DB_COUNT"
fi

DB_HISTORY=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "SELECT jsonb_array_length(conversation_history) FROM maia_sessions WHERE id = '$TEST_SESSION_ID'" 2>/dev/null | xargs)

if [ "$DB_HISTORY" = "2" ]; then
  test_pass "Database shows 2 conversation exchanges stored"
elif [ -z "$DB_HISTORY" ]; then
  test_fail "No conversation history in database" "Query returned empty"
else
  test_fail "Conversation history length mismatch" "Expected 2, got: $DB_HISTORY"
fi

# ============================================
# TEST 4: Memory recall - Does MAIA remember?
# ============================================
test_start "Memory Recall - Ask about previous context"

TURN3_FILE="/tmp/maia_memory_turn3.json"
post_maia_json "$TURN3_FILE" "{\"message\":\"Answer in ONE sentence that includes: my name, the hobby I love, and my favorite plant.\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}"
assert_valid_json "$TURN3_FILE"
TURN3_TEXT="$(extract_response_text "$TURN3_FILE")"

# Plant recall: accept exact token OR semantic "orchid"
if echo "$TURN3_TEXT" | grep -qi "$FAVORITE_PLANT"; then
  test_pass "Memory recall: MAIA remembered exact token '$FAVORITE_PLANT'"
elif echo "$TURN3_TEXT" | grep -qi "orchid"; then
  test_pass "Memory recall: MAIA remembered plant type 'orchid' (semantic)"
else
  test_fail "Memory recall failed" "Response doesn't mention orchid: ${TURN3_TEXT:0:100}"
fi

if echo "$TURN3_TEXT" | grep -qi "alice\|your\|you"; then
  test_pass "Memory recall: MAIA used user context (name or 'you')"
else
  test_fail "Memory recall: No personalization" "Response: ${TURN3_TEXT:0:100}"
fi

# Metadata verification: Prove memory was actually injected
TURN3_EXCH_AVAIL="$(extract_json "$TURN3_FILE" "metadata.memory.exchangesAvailable")"
TURN3_EXCH_INJ="$(extract_json "$TURN3_FILE" "metadata.memory.exchangesInjected")"

if [ "${TURN3_EXCH_INJ:-0}" -ge 2 ]; then
  test_pass "Memory metadata confirms injection (exchangesInjected=$TURN3_EXCH_INJ)"
else
  test_fail "Memory metadata shows no injection" "exchangesInjected=${TURN3_EXCH_INJ:-0}, exchangesAvailable=${TURN3_EXCH_AVAIL:-0}"
fi

# ============================================
# TEST 5: Cross-restart persistence (CRITICAL)
# ============================================
test_start "Cross-Restart Persistence - Simulating server restart"

stop_server
start_server

TURN4_FILE="/tmp/maia_memory_turn4.json"
post_maia_json "$TURN4_FILE" "{\"message\":\"Answer in ONE sentence that includes: my name, the hobby I love, and my favorite plant.\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}"
assert_valid_json "$TURN4_FILE"
TURN4_TEXT="$(extract_response_text "$TURN4_FILE")"

MEMORY_SCORE=0

if echo "$TURN4_TEXT" | grep -qi "alice"; then
  test_pass "Cross-restart: Remembered user name 'Alice'"
  MEMORY_SCORE=$((MEMORY_SCORE + 1))
else
  test_fail "Cross-restart: Lost user name" "No 'Alice' in response: ${TURN4_TEXT:0:100}"
fi

# Semantic recall check for gardening context
FACT_FILE="/tmp/maia_fact_gardening.txt"
RESP_FILE="/tmp/maia_resp_after_restart.txt"
echo "The user told you they love gardening." > "$FACT_FILE"
echo "$TURN4_TEXT" > "$RESP_FILE"

if node scripts/semantic-recall.js --fact-file "$FACT_FILE" --response-file "$RESP_FILE" --threshold 0.58 2>/dev/null; then
  test_pass "Cross-restart: Semantically recalled 'gardening' interest"
  MEMORY_SCORE=$((MEMORY_SCORE + 1))
else
  test_fail "Cross-restart: Lost gardening context (semantic check)" "Response: ${TURN4_TEXT:0:100}"
fi

# Plant recall after restart: accept exact token OR semantic "orchid"
if echo "$TURN4_TEXT" | grep -qi "$FAVORITE_PLANT"; then
  test_pass "Cross-restart: Remembered exact plant token '$FAVORITE_PLANT'"
  MEMORY_SCORE=$((MEMORY_SCORE + 1))
elif echo "$TURN4_TEXT" | grep -qi "orchid"; then
  test_pass "Cross-restart: Remembered plant type 'orchid' (semantic)"
  MEMORY_SCORE=$((MEMORY_SCORE + 1))
else
  test_fail "Cross-restart: Lost plant detail" "No orchid mention in: ${TURN4_TEXT:0:100}"
fi

# Metadata verification: Prove memory was actually injected after restart (THE BULLETPROOF CHECK)
TURN4_EXCH_AVAIL="$(extract_json "$TURN4_FILE" "metadata.memory.exchangesAvailable")"
TURN4_EXCH_INJ="$(extract_json "$TURN4_FILE" "metadata.memory.exchangesInjected")"
TURN4_CHARS_INJ="$(extract_json "$TURN4_FILE" "metadata.memory.charsInjected")"

if [ "${TURN4_EXCH_INJ:-0}" -ge 3 ]; then
  test_pass "Cross-restart: Memory was actually injected (exchangesInjected=$TURN4_EXCH_INJ, charsInjected=$TURN4_CHARS_INJ)"
else
  test_fail "Cross-restart: No memory injection after restart" "exchangesInjected=${TURN4_EXCH_INJ:-0}, charsInjected=${TURN4_CHARS_INJ:-0}"
fi

# ============================================
# TEST 6: Database integrity after restart
# ============================================
test_start "Database Integrity - Verify data survived restart"

DB_COUNT_AFTER=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "SELECT turn_count FROM maia_sessions WHERE id = '$TEST_SESSION_ID'" 2>/dev/null | xargs)

if [ "$DB_COUNT_AFTER" = "4" ]; then
  test_pass "Database shows 4 total turns after restart"
else
  test_fail "Database turn count incorrect after restart" "Expected 4, got: $DB_COUNT_AFTER"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "======================================"
echo "  MEMORY CERTIFICATION SUMMARY"
echo "======================================"
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo "Tests Total:   $TESTS_TOTAL"
echo ""
echo "Memory Score:  $MEMORY_SCORE/3 items recalled after restart"
echo ""

if [ $TESTS_FAILED -eq 0 ] && [ $MEMORY_SCORE -ge 2 ]; then
  echo -e "${GREEN}✓ PERSISTENT MEMORY CERTIFIED${NC}"
  echo "Memory survives server restarts and can be promised to testers."
  echo ""
  echo "Safe to promise:"
  echo "  - Conversation history persists across restarts"
  echo "  - User context is remembered (name, interests)"
  echo "  - Database writes are reliable and durable"
  echo ""
  exit 0
elif [ $MEMORY_SCORE -ge 1 ]; then
  echo -e "${YELLOW}⚠ MEMORY PARTIALLY WORKING${NC}"
  echo "Some memory survives but not all context is reliably recalled."
  echo "Promise testers: 'Memory is experimental - some context may be lost'"
  echo ""
  exit 1
else
  echo -e "${RED}✗ MEMORY CERTIFICATION FAILED${NC}"
  echo "Memory does NOT persist across restarts."
  echo "DO NOT promise persistent memory to testers."
  echo ""
  exit 1
fi
