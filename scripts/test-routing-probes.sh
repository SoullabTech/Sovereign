#!/bin/bash
# Live routing probe test - tests full Opus/Sonnet routing pipeline
# Verifies: L1→Opus (new user), L4+established→Sonnet, L4+deep→Opus
set -e

API_URL="http://localhost:3000/api/between/chat"
DB_URL="postgresql://soullab@localhost:5432/maia_consciousness"
TEST_USER="routing-test-l4-established"
SESSION_ID="test-established-session-$(date +%s)"

echo "=========================================="
echo "MAIA Model Routing - Full Pipeline Test"
echo "=========================================="

# ─────────────────────────────────────────────
# TEST 1: New user → Opus (trust-building)
# ─────────────────────────────────────────────
echo ""
echo "▸ TEST 1: New user → should route to Opus"
echo "  (L1 Newcomer: trust-building phase)"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, this is my first time here.","userId":"routing-test-new-user","sessionId":"test-new"}' > /dev/null
echo "  ✓ Request sent"
sleep 1

# ─────────────────────────────────────────────
# TEST 2: Established user + casual (after warmup) → Sonnet
# ─────────────────────────────────────────────
echo ""
echo "▸ TEST 2: Creating established user fixture in relationship_essences..."

# Insert relationship essence with 60 encounters (L4 threshold is 50+)
psql "$DB_URL" -q -c "
DELETE FROM relationship_essences WHERE user_id = '$TEST_USER';
INSERT INTO relationship_essences (
  soul_signature, user_id, user_name, presence_quality,
  archetypal_resonances, spiral_position, relationship_field,
  first_encounter, last_encounter, encounter_count, morphic_resonance
) VALUES (
  '$TEST_USER', '$TEST_USER', 'Test L4 Student', 'Curious seeker',
  '[\"learner\"]'::jsonb,
  '{\"stage\": \"student\", \"dynamics\": \"learning\", \"emergingAwareness\": []}'::jsonb,
  '{\"coCreatedInsights\": [], \"breakthroughs\": [], \"quality\": \"developing\", \"depth\": 0.5}'::jsonb,
  NOW() - INTERVAL '90 days', NOW() - INTERVAL '1 day', 60, 0.6
);
"
echo "  ✓ Created essence with 60 encounters"

echo ""
echo "  Warming up session (5 casual exchanges to pass SONNET_THRESHOLD_TURNS)..."
for i in 1 2 3 4 5; do
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{"message":"Quick check-in '${i}'","userId":"'$TEST_USER'","sessionId":"'$SESSION_ID'"}' > /dev/null
  echo -n "."
  sleep 0.5
done
echo " done"

echo ""
echo "  Sending casual probe #6 (expecting Sonnet for L4 established)..."
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"message":"Just checking in. How are you today?","userId":"'$TEST_USER'","sessionId":"'$SESSION_ID'"}' > /dev/null
echo "  ✓ Request sent"
sleep 1

# ─────────────────────────────────────────────
# TEST 3: Established user + deep → Opus (even in established session)
# ─────────────────────────────────────────────
echo ""
echo "▸ TEST 3: Established user + deep-dive → should route to Opus"
echo "  (Deep pattern 'shadow' overrides casual routing)"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"message":"I have been exploring my shadow and noticing patterns of grief.","userId":"'$TEST_USER'","sessionId":"'$SESSION_ID'"}' > /dev/null
echo "  ✓ Request sent"
sleep 1

# ─────────────────────────────────────────────
# RESULTS
# ─────────────────────────────────────────────
echo ""
echo "=========================================="
echo "ROUTING DECISIONS (last 8 from server logs)"
echo "=========================================="

grep "MODEL_ROUTING" /tmp/maia-dev.log 2>/dev/null | tail -8 | python3 -c "
import sys, json
results = []
for line in sys.stdin:
    try:
        d = json.loads(line.strip())
        if d.get('_tag') == 'MODEL_ROUTING':
            lvl = d.get('level', '?')
            model = d.get('model', '?')
            reason = d.get('reason', '?')
            msgCount = d.get('ctx', {}).get('msgCount', '?')
            results.append((lvl, model, reason, msgCount))
    except: pass

# Show summary
for i, (lvl, model, reason, msgCount) in enumerate(results):
    marker = '→ ' if i in [0, len(results)-2, len(results)-1] else '  '
    print(f'{marker}L{lvl} msg#{msgCount} → {model.upper():6} | {reason}')
" 2>/dev/null || echo "  (Check npm run dev terminal for MODEL_ROUTING output)"

echo ""
echo "ESSENCE LOADING (last 3):"
grep "ANAMNESIS-SERVER" /tmp/maia-dev.log 2>/dev/null | tail -3 || echo "  (No essence logs found)"

# ─────────────────────────────────────────────
# CLEANUP
# ─────────────────────────────────────────────
echo ""
echo "▸ Cleaning up test fixtures..."
psql "$DB_URL" -q -c "DELETE FROM relationship_essences WHERE user_id = '$TEST_USER';"
psql "$DB_URL" -q -c "DELETE FROM relationship_essences WHERE user_id = 'routing-test-new-user';"
echo "  ✓ Test data removed"

echo ""
echo "=========================================="
echo "Expected Pattern:"
echo "  TEST 1 (new L1)        → Opus  (awareness_L1_trust)"
echo "  msg#1-5 (warmup)       → Opus  (new_conversation)"
echo "  TEST 2 (L4 msg#6+)     → Sonnet (established_casual)"
echo "  TEST 3 (L4 + shadow)   → Opus  (deep_dive_detected)"
echo "=========================================="
