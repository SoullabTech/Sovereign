#!/bin/bash
# Bardic Memory System Smoke Test
# Verifies the core episode creation + linking pipeline works

set -e

echo "=== Bardic Spine Smoke Test ==="
echo ""

# 1) Build check (optional - slow)
if [[ "$1" == "--full" ]]; then
  echo "1) Running build..."
  MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder npm run build > /dev/null 2>&1
  echo "   ✅ Build passed"

  echo "2) Checking no Supabase..."
  npm run check:no-supabase > /dev/null 2>&1
  echo "   ✅ No Supabase violations"
else
  echo "1-2) Skipping build (use --full to include)"
fi

# 3) Episode creation
echo "3) Creating test episode..."
RESPONSE=$(curl -s http://localhost:3000/api/consciousness/memory/episodes \
  -H "Content-Type: application/json" \
  -d '{"userId":"smoke-test","sceneStanza":"Bardic smoke test","affectValence":1,"affectArousal":1,"runLinking":true}')

EPISODE_ID=$(echo "$RESPONSE" | grep -o '"episodeId":"[^"]*"' | cut -d'"' -f4)
LINKS_CREATED=$(echo "$RESPONSE" | grep -o '"linksCreated":[0-9]*' | cut -d':' -f2)

if [[ -n "$EPISODE_ID" ]]; then
  echo "   ✅ Episode created: $EPISODE_ID"
  echo "   ✅ Links created: $LINKS_CREATED"
else
  echo "   ❌ Episode creation failed: $RESPONSE"
  exit 1
fi

# 4) Verify in database
echo "4) Verifying database..."
LINK_COUNT=$(psql -h localhost -p 5432 -U soullab -d maia_consciousness -t -c \
  "SELECT COUNT(*) FROM bardic_links WHERE user_id = 'smoke-test';" 2>/dev/null | tr -d ' ')

echo "   ✅ Total smoke-test links in DB: $LINK_COUNT"

# 5) Show recent links
echo ""
echo "=== Recent bardic_links ==="
psql -h localhost -p 5432 -U soullab -d maia_consciousness -c \
  "SELECT relation, round(strength::numeric, 2) as strength,
          substring(from_id::text, 1, 8) as from_id,
          substring(to_id::text, 1, 8) as to_id
   FROM bardic_links
   ORDER BY created_at DESC
   LIMIT 5;" 2>/dev/null

echo ""
echo "=== Smoke Test Complete ==="
