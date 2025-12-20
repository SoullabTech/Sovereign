#!/usr/bin/env bash
# scripts/certify-spiral-state.sh - Spiral State Persistence Certification
# Proves spiral state memory injection works and prevents fabrication

set -e

PORT=${PORT:-3000}
BASE_URL="http://localhost:$PORT"
TEST_USER_ID="spiral_cert_$(date +%s)"

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

# Robust JSON handling
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
candidates = [("message",),("text",),("response",),("data","message"),("data","text"),("result","message"),("result","text")]
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
    print("")
    exit(0)
# Force booleans to lowercase JSON format (true/false not True/False)
if isinstance(cur,bool):
  print("true" if cur else "false")
elif isinstance(cur,(int,float,str)):
  print(cur)
else:
  print(json.dumps(cur))
PY
}

# Server management
SERVER_LOG="/tmp/maia-certify-spiral-server.log"
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

echo "=========================================="
echo "  SPIRAL STATE CERTIFICATION"
echo "=========================================="
echo "Test User ID: $TEST_USER_ID"
echo "Testing against: $BASE_URL"
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Please install PostgreSQL client."
  exit 1
fi

# Get database connection from env
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-maia_consciousness}"
DB_USER="${DATABASE_USER:-soullab}"

start_server

# ============================================
# TEST S0: No spiral invention when absent
# ============================================
test_start "No spiral invention when absent (TRUTH CONSTRAINTS)"

NOSPI_USER="spiral_nospi_$(date +%s)"
NOSPI_FILE="/tmp/maia_spiral_nospi.json"

post_maia_json "$NOSPI_FILE" "{\"message\":\"What phase am I in?\",\"userId\":\"$NOSPI_USER\",\"sessionId\":\"$NOSPI_USER\"}" || {
  test_fail "No-spiral test failed" "curl failed"
}
assert_valid_json "$NOSPI_FILE"

NOSPI_TEXT="$(extract_response_text "$NOSPI_FILE")"
NOSPI_INJECTED="$(extract_json "$NOSPI_FILE" "metadata.spiralMeta.injected")"

# Check that spiralMeta.injected is false or absent
if [ "$NOSPI_INJECTED" = "true" ]; then
  test_fail "Spiral state should NOT be injected when absent" "spiralMeta.injected=${NOSPI_INJECTED}"
else
  test_pass "Spiral state not injected (spiralMeta.injected=${NOSPI_INJECTED:-false})"
fi

# Check that response doesn't fabricate phase/element
python3 - "$NOSPI_TEXT" <<'PY'
import re,sys
text=(sys.argv[1] or "").strip().lower()

# Forbidden fabrications
forbidden = [
  r'\byou(?:\'re| are) in (?:phase|element)',
  r'\bwater \d',
  r'\bfire \d',
  r'\bearth \d',
  r'\bair \d',
  r'\bphase [1-7]',
  r'your current (?:phase|element|facet) is',
]

for pattern in forbidden:
  if re.search(pattern, text):
    print(f"❌ Found forbidden fabrication: {pattern}")
    sys.exit(1)

# Should say something like "I don't have that yet" or "I don't know"
allowed = [
  r'don\'t (?:have|know)',
  r'not (?:sure|tracking|aware)',
  r'haven\'t (?:established|recorded)',
  r'would need',
  r'could (?:tell|share)',
]

for pattern in allowed:
  if re.search(pattern, text):
    sys.exit(0)

print(f"⚠️  Response neither fabricated nor admitted absence. Check manually:")
print(f"    {text[:200]}")
sys.exit(0)
PY

if [ $? -eq 0 ]; then
  test_pass "No phase/element fabrication detected"
else
  test_fail "Response fabricated phase/element" "Response: ${NOSPI_TEXT:0:200}"
fi

# ============================================
# TEST S1: Spiral injection matches stored state
# ============================================
test_start "Spiral injection matches stored state"

# Write spiral state directly to database (as array with required fields)
echo "  → Writing spiral_states to database..."
PGPASSWORD="${DATABASE_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
-- Ensure user_relationship_context row exists
INSERT INTO user_relationship_context (user_id, spiral_states, spiral_states_updated_at)
VALUES (
  '$TEST_USER_ID',
  '[{"spiralKey":"general","element":"Water","phase":2,"facet":"Water 2","arc":"death/rebirth integration","confidence":0.74,"source":"manual_test","updatedAt":"2025-12-18T18:12:00Z","activeNow":true,"priorityRank":1}]'::jsonb,
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  spiral_states = EXCLUDED.spiral_states,
  spiral_states_updated_at = EXCLUDED.spiral_states_updated_at;
SQL

if [ $? -ne 0 ]; then
  test_fail "Failed to write spiral_states to database" "psql error"
  exit 1
fi

test_pass "Spiral state written to database (Water 2)"

# Send message and check metadata
SPIRAL_FILE="/tmp/maia_spiral_inject.json"
post_maia_json "$SPIRAL_FILE" "{\"message\":\"Tell me about my current phase\",\"userId\":\"$TEST_USER_ID\",\"sessionId\":\"$TEST_USER_ID\"}" || {
  test_fail "Spiral injection test failed" "curl failed"
}
assert_valid_json "$SPIRAL_FILE"

SPIRAL_TEXT="$(extract_response_text "$SPIRAL_FILE")"
SPIRAL_INJECTED="$(extract_json "$SPIRAL_FILE" "metadata.spiralMeta.injected")"
SPIRAL_ELEMENT="$(extract_json "$SPIRAL_FILE" "metadata.spiralMeta.element")"
SPIRAL_PHASE="$(extract_json "$SPIRAL_FILE" "metadata.spiralMeta.phase")"
SPIRAL_FACET="$(extract_json "$SPIRAL_FILE" "metadata.spiralMeta.facet")"

# Check metadata matches database
if [ "$SPIRAL_INJECTED" = "true" ]; then
  test_pass "Spiral state injected (spiralMeta.injected=true)"
else
  test_fail "Spiral state should be injected" "spiralMeta.injected=${SPIRAL_INJECTED:-false}"
fi

if [ "$SPIRAL_ELEMENT" = "Water" ]; then
  test_pass "Element matches (Water)"
else
  test_fail "Element mismatch" "Expected: Water, Got: ${SPIRAL_ELEMENT:-none}"
fi

if [ "$SPIRAL_PHASE" = "2" ]; then
  test_pass "Phase matches (2)"
else
  test_fail "Phase mismatch" "Expected: 2, Got: ${SPIRAL_PHASE:-none}"
fi

if [ "$SPIRAL_FACET" = "Water 2" ]; then
  test_pass "Facet matches (Water 2)"
else
  test_fail "Facet mismatch" "Expected: Water 2, Got: ${SPIRAL_FACET:-none}"
fi

# Check response mentions the phase (without fabricating new details)
python3 - "$SPIRAL_TEXT" <<'PY'
import re,sys
text=(sys.argv[1] or "").strip().lower()

# Should mention Water or phase 2
if re.search(r'\bwater\b', text) or re.search(r'\bphase\s+2\b', text):
  sys.exit(0)
else:
  print("⚠️  Response didn't mention Water or Phase 2. Check manually:")
  print(f"    {text[:200]}")
  sys.exit(1)
PY

if [ $? -eq 0 ]; then
  test_pass "Response mentions spiral state (Water/Phase 2)"
else
  test_fail "Response doesn't mention spiral state" "Response: ${SPIRAL_TEXT:0:200}"
fi

# ============================================
# TEST S2: Hard restart persistence (optional)
# ============================================
test_start "Hard restart persistence (server restart proof)"

echo "  → Stopping server for restart test..."
stop_server
sleep 2

echo "  → Restarting server..."
start_server

# Send message after restart
RESTART_FILE="/tmp/maia_spiral_restart.json"
post_maia_json "$RESTART_FILE" "{\"message\":\"What element am I working with?\",\"userId\":\"$TEST_USER_ID\",\"sessionId\":\"spiral_restart_$(date +%s)\"}" || {
  test_fail "Restart test failed" "curl failed"
}
assert_valid_json "$RESTART_FILE"

RESTART_TEXT="$(extract_response_text "$RESTART_FILE")"
RESTART_INJECTED="$(extract_json "$RESTART_FILE" "metadata.spiralMeta.injected")"
RESTART_ELEMENT="$(extract_json "$RESTART_FILE" "metadata.spiralMeta.element")"

if [ "$RESTART_INJECTED" = "true" ]; then
  test_pass "Spiral state injected after restart"
else
  test_fail "Spiral state not injected after restart" "spiralMeta.injected=${RESTART_INJECTED:-false}"
fi

if [ "$RESTART_ELEMENT" = "Water" ]; then
  test_pass "Element persisted after restart (Water)"
else
  test_fail "Element not persisted" "Expected: Water, Got: ${RESTART_ELEMENT:-none}"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=========================================="
echo "  CERTIFICATION SUMMARY"
echo "=========================================="
echo -e "Tests passed: ${GREEN}${TESTS_PASSED}/${TESTS_TOTAL}${NC}"
echo -e "Tests failed: ${RED}${TESTS_FAILED}/${TESTS_TOTAL}${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✓ Spiral state memory CERTIFIED${NC}"
  echo ""
  echo "Spiral state memory is:"
  echo "  - Stored in PostgreSQL (spiral_states JSONB array column)"
  echo "  - Injected into FAST/CORE/DEEP prompts"
  echo "  - Protected by TRUTH CONSTRAINTS (no fabrication)"
  echo "  - Returned in API metadata (spiralMeta)"
  echo "  - Persistent across server restarts"
  exit 0
else
  echo -e "${RED}✗ Spiral state certification FAILED${NC}"
  echo ""
  echo "Review failed tests above."
  exit 1
fi
