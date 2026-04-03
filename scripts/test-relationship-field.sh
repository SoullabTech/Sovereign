#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Relationship Field v1 — Trust Calibration Script
#
# Tests the relational check-in engine across 6 critical scenarios.
# Requires an authenticated session cookie from soullab.life.
#
# Usage:
#   ./scripts/test-relationship-field.sh <session-cookie>
#
# To get your session cookie:
#   1. Sign in at soullab.life/signin
#   2. Open browser DevTools → Application → Cookies
#   3. Copy the value of the 'session' cookie
#
# What this tests:
#   1. Empty state (zero relationships, no crash)
#   2. Outer relationship — sparse input
#   3. Outer relationship — emotionally loaded input
#   4. Inner figure — "The Inner Critic"
#   5. Transpersonal — "My Calling"
#   6. Repeated check-ins (pattern guard — must say "not enough history")
#   7. Rupture followed by repair entry
#
# What to watch for:
#   ✓ Reflection is grounded, not interpretive
#   ✓ No pattern hallucination with < 3 entries
#   ✓ Field tone is from canonical vocabulary
#   ✓ Movement is one sentence, not advice
#   ✓ Inner/transpersonal prompts don't sound interpersonal
#   ✗ Therapeutic mush
#   ✗ Inflated language when little data exists
#   ✗ Pattern claims on first check-in
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

BASE="https://soullab.life"
COOKIE="${1:-}"
PASS=0
FAIL=0
WARN=0

CANONICAL_TONES="open contracted unclear tense warm distant fragile active quiet unresolved"

if [ -z "$COOKIE" ]; then
  echo "Usage: $0 <session-cookie>"
  echo ""
  echo "Get your session cookie from browser DevTools → Application → Cookies → 'session'"
  exit 1
fi

# ── Helpers ──────────────────────────────────────────────────────────

api() {
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -s -X "$method" "$BASE$path" \
      -H "Content-Type: application/json" \
      -H "Cookie: maia_session=$COOKIE" \
      -d "$body"
  else
    curl -s -X "$method" "$BASE$path" \
      -H "Cookie: maia_session=$COOKIE"
  fi
}

check() {
  local label="$1" condition="$2"
  if eval "$condition" > /dev/null 2>&1; then
    echo "  ✓ $label"
    PASS=$((PASS + 1))
  else
    echo "  ✗ FAIL: $label"
    FAIL=$((FAIL + 1))
  fi
}

# Quote-safe helpers for common checks
check_eq() { check "$1" "[ \"$2\" = \"$3\" ]"; }
check_nonempty() { check "$1" "[ -n \"$2\" ]"; }
check_grep() { check "$1" "echo \"$2\" | grep -qi \"$3\""; }
check_grep_word() { check "$1" "echo \"$2\" | grep -qw \"$3\""; }

warn() {
  local label="$1"
  echo "  ⚠ REVIEW: $label"
  WARN=$((WARN + 1))
}

separator() {
  echo ""
  echo "─── $1 ───"
  echo ""
}

json_field() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d$2)" 2>/dev/null || echo ""
}

# Track created IDs for cleanup
CREATED_IDS=()

cleanup() {
  if [ ${#CREATED_IDS[@]} -gt 0 ]; then
    echo ""
    echo "─── Cleanup ───"
    echo ""
    for id in "${CREATED_IDS[@]}"; do
      api DELETE "/api/relationships/$id" > /dev/null 2>&1
      echo "  Archived: $id"
    done
  fi
}
trap cleanup EXIT

# ═════════════════════════════════════════════════════════════════════
# TEST 1: Empty state
# ═════════════════════════════════════════════════════════════════════
separator "Test 1: Empty state (page loads with zero relationships)"

RESULT=$(api GET "/api/relationships")
SUCCESS=$(json_field "$RESULT" "['success']")
check_eq "API returns success" "$SUCCESS" "True"

# ═════════════════════════════════════════════════════════════════════
# TEST 2: Create outer relationship — sparse input
# ═════════════════════════════════════════════════════════════════════
separator "Test 2: Outer relationship — sparse input"

RESULT=$(api POST "/api/relationships" '{"name":"Alex","realm":"outer","bondType":"friend"}')
SUCCESS=$(json_field "$RESULT" "['success']")
OUTER_ID=$(json_field "$RESULT" "['relationship']['id']")
check_eq "Created outer relationship" "$SUCCESS" "True"
CREATED_IDS+=("$OUTER_ID")

# Check-in with minimal signals
RESULT=$(api POST "/api/relationships/$OUTER_ID/checkin" '{"feltSignals":["warmth"]}')
SUCCESS=$(json_field "$RESULT" "['success']")
REFLECTION=$(json_field "$RESULT" "['entry']['maiaReflection']")
PATTERN=$(json_field "$RESULT" "['entry']['patternHint']")
TONE=$(json_field "$RESULT" "['entry']['fieldToneSnapshot']")
MOVEMENT=$(json_field "$RESULT" "['entry']['suggestedMovement']")

check_eq "Check-in succeeded" "$SUCCESS" "True"
check_grep "Pattern guard: says 'not enough history'" "$PATTERN" "not enough"
check_grep_word "Field tone is canonical" "$CANONICAL_TONES" "$TONE"
check_nonempty "Reflection is present" "$REFLECTION"
check_nonempty "Movement is present" "$MOVEMENT"

echo ""
echo "  Reflection: $REFLECTION"
echo "  Pattern:    $PATTERN"
echo "  Tone:       $TONE"
echo "  Movement:   $MOVEMENT"
warn "Review: Is the reflection grounded, not inflated for sparse input?"

# ═════════════════════════════════════════════════════════════════════
# TEST 3: Outer relationship — emotionally loaded input
# ═════════════════════════════════════════════════════════════════════
separator "Test 3: Outer relationship — emotionally loaded input"

RESULT=$(api POST "/api/relationships" '{"name":"Jordan","realm":"outer","bondType":"partner","note":"We have been fighting a lot lately and I feel like things are falling apart"}')
SUCCESS=$(json_field "$RESULT" "['success']")
LOADED_ID=$(json_field "$RESULT" "['relationship']['id']")
check_eq "Created emotionally loaded relationship" "$SUCCESS" "True"
CREATED_IDS+=("$LOADED_ID")

RESULT=$(api POST "/api/relationships/$LOADED_ID/checkin" '{"feltSignals":["tension","distance","avoidance"],"freeText":"I feel like every conversation turns into a fight and I do not know how to stop it"}')
SUCCESS=$(json_field "$RESULT" "['success']")
REFLECTION=$(json_field "$RESULT" "['entry']['maiaReflection']")
PATTERN=$(json_field "$RESULT" "['entry']['patternHint']")
TONE=$(json_field "$RESULT" "['entry']['fieldToneSnapshot']")
MOVEMENT=$(json_field "$RESULT" "['entry']['suggestedMovement']")

check_eq "Check-in succeeded" "$SUCCESS" "True"
check_grep "Pattern guard: no premature claims" "$PATTERN" "not enough"
check_grep_word "Field tone is canonical" "$CANONICAL_TONES" "$TONE"

echo ""
echo "  Reflection: $REFLECTION"
echo "  Pattern:    $PATTERN"
echo "  Tone:       $TONE"
echo "  Movement:   $MOVEMENT"
warn "Review: Does this feel like clear seeing, or does it drift into therapy?"
warn "Review: Is the movement one grounded step, not a plan?"

# ═════════════════════════════════════════════════════════════════════
# TEST 4: Inner figure — "The Inner Critic"
# ═════════════════════════════════════════════════════════════════════
separator "Test 4: Inner figure — The Inner Critic"

RESULT=$(api POST "/api/relationships" '{"name":"The Inner Critic","realm":"inner","bondType":"inner_part","note":"The voice that tells me nothing I do is good enough"}')
SUCCESS=$(json_field "$RESULT" "['success']")
INNER_ID=$(json_field "$RESULT" "['relationship']['id']")
check_eq "Created inner figure" "$SUCCESS" "True"
CREATED_IDS+=("$INNER_ID")

RESULT=$(api POST "/api/relationships/$INNER_ID/checkin" '{"feltSignals":["tension","pressure"],"freeText":"It has been very loud this week, especially around work"}')
SUCCESS=$(json_field "$RESULT" "['success']")
REFLECTION=$(json_field "$RESULT" "['entry']['maiaReflection']")
TONE=$(json_field "$RESULT" "['entry']['fieldToneSnapshot']")
MOVEMENT=$(json_field "$RESULT" "['entry']['suggestedMovement']")

check_eq "Check-in succeeded" "$SUCCESS" "True"
check_grep_word "Field tone is canonical" "$CANONICAL_TONES" "$TONE"

echo ""
echo "  Reflection: $REFLECTION"
echo "  Tone:       $TONE"
echo "  Movement:   $MOVEMENT"
warn "Review: Does the reflection treat the Inner Critic as a real presence, not a problem to fix?"
warn "Review: Does it sound intrapsychic, not interpersonal?"

# ═════════════════════════════════════════════════════════════════════
# TEST 5: Transpersonal — "My Calling"
# ═════════════════════════════════════════════════════════════════════
separator "Test 5: Transpersonal — My Calling"

RESULT=$(api POST "/api/relationships" '{"name":"My Calling","realm":"transpersonal","bondType":"vocation","note":"The pull toward building something meaningful that I keep resisting"}')
SUCCESS=$(json_field "$RESULT" "['success']")
TRANS_ID=$(json_field "$RESULT" "['relationship']['id']")
check_eq "Created transpersonal relationship" "$SUCCESS" "True"
CREATED_IDS+=("$TRANS_ID")

RESULT=$(api POST "/api/relationships/$TRANS_ID/checkin" '{"feltSignals":["longing","avoidance","curiosity"],"freeText":"I feel drawn to it but afraid of what it will cost"}')
SUCCESS=$(json_field "$RESULT" "['success']")
REFLECTION=$(json_field "$RESULT" "['entry']['maiaReflection']")
TONE=$(json_field "$RESULT" "['entry']['fieldToneSnapshot']")
MOVEMENT=$(json_field "$RESULT" "['entry']['suggestedMovement']")

check_eq "Check-in succeeded" "$SUCCESS" "True"
check_grep_word "Field tone is canonical" "$CANONICAL_TONES" "$TONE"

echo ""
echo "  Reflection: $REFLECTION"
echo "  Tone:       $TONE"
echo "  Movement:   $MOVEMENT"
warn "Review: Does this avoid theologizing? Does it honor the pull without prescribing?"

# ═════════════════════════════════════════════════════════════════════
# TEST 6: Repeated check-ins — pattern emergence
# ═════════════════════════════════════════════════════════════════════
separator "Test 6: Repeated check-ins — pattern guard then emergence"

echo "  Check-in 2 on outer relationship (Alex)..."
RESULT=$(api POST "/api/relationships/$OUTER_ID/checkin" '{"feltSignals":["warmth","closeness"],"freeText":"Had a good conversation today"}')
PATTERN2=$(json_field "$RESULT" "['entry']['patternHint']")
check_grep "Second check-in: still says not enough history" "$PATTERN2" "not enough"
echo "  Pattern: $PATTERN2"

echo ""
echo "  Check-in 3 on outer relationship (Alex)..."
RESULT=$(api POST "/api/relationships/$OUTER_ID/checkin" '{"feltSignals":["warmth","gratitude"],"freeText":"Feeling grateful for this friendship"}')
PATTERN3=$(json_field "$RESULT" "['entry']['patternHint']")
echo "  Pattern: $PATTERN3"
# After 3 entries, pattern is allowed to emerge (but not required)
warn "Review: If pattern appears now, is it grounded in the actual signals (warmth recurring)?"

# ═════════════════════════════════════════════════════════════════════
# TEST 7: Rupture then repair entry
# ═════════════════════════════════════════════════════════════════════
separator "Test 7: Rupture followed by repair"

echo "  Adding rupture entry to Jordan..."
RESULT=$(api POST "/api/relationships/$LOADED_ID/entries" '{"kind":"rupture","content":"Big argument last night. Said things I regret. We went to bed without resolving it."}')
RSUCCESS=$(json_field "$RESULT" "['success']")
check_eq "Rupture entry created" "$RSUCCESS" "True"

echo "  Adding repair entry to Jordan..."
RESULT=$(api POST "/api/relationships/$LOADED_ID/entries" '{"kind":"repair","content":"Apologized this morning. They heard me. We are not fully okay but the door is open."}')
RSUCCESS=$(json_field "$RESULT" "['success']")
check_eq "Repair entry created" "$RSUCCESS" "True"

echo "  Fetching timeline..."
RESULT=$(api GET "/api/relationships/$LOADED_ID")
ENTRY_COUNT=$(json_field "$RESULT" "['entries'].__len__()")
check "Timeline has entries (checkin + rupture + repair)" "[ \"$ENTRY_COUNT\" -ge 3 ]"

echo ""
echo "  Entries: $ENTRY_COUNT"
warn "Review: Load /dashboard/relationships/$LOADED_ID in browser — does the timeline show visual weight (rupture accented, repair positive)?"

# ═════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════
separator "RESULTS"

echo "  Passed:  $PASS"
echo "  Failed:  $FAIL"
echo "  Review:  $WARN (manual review needed)"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "  ⚠ $FAIL tests failed. Fix before proceeding."
  exit 1
else
  echo "  ✓ All automated checks passed."
  echo ""
  echo "  Manual review items ($WARN):"
  echo "    - Open /dashboard/relationships in browser"
  echo "    - Check each reflection for tone (clear, not inflated)"
  echo "    - Check inner figure response (intrapsychic, not interpersonal)"
  echo "    - Check transpersonal response (no theologizing)"
  echo "    - Check timeline visual weight (rupture/repair accented)"
  echo "    - Verify empty state shows all entry paths"
  echo ""
  echo "  Created relationships will be archived on script exit."
fi
