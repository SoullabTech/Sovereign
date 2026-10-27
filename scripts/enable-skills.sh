#!/bin/bash
# Enable MAIA Skills System
# Usage: ./scripts/enable-skills.sh [mode]
# Modes: silent (default) | shadow | active

set -e

: "${DATABASE_URL:?DATABASE_URL must be set explicitly before enabling skills}"

MODE="${1:-silent}"

echo "🧩 MAIA Skills System — Enablement Script"
echo ""

# Check if database is running
echo "1️⃣  Checking database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "   ✅ Database connected"
else
  echo "   ❌ Database not available"
  echo "   💡 Make sure PostgreSQL is running and DATABASE_URL is set"
  exit 1
fi

# Check if migrations are applied
echo ""
echo "2️⃣  Checking skills tables..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'skill%';" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -eq "4" ]; then
  echo "   ✅ Skills tables exist (4/4)"
else
  echo "   ⚠️  Only $TABLE_COUNT/4 skills tables found"
  echo "   💡 Run: npx tsx scripts/apply-skills-migration.ts"
  read -p "   Apply migrations now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx tsx scripts/apply-skills-migration.ts
  else
    exit 1
  fi
fi

# Sync skills from filesystem to database
echo ""
echo "3️⃣  Syncing skills to registry..."
npx tsx -e "
  import { loadSkillMetas } from './lib/skills/loader.js';
  import { upsertSkillsRegistry } from './lib/skills/db.js';
  import path from 'node:path';
  const loaded = await loadSkillMetas(path.join(process.cwd(), 'skills'));
  await upsertSkillsRegistry(loaded);
  console.log('   ✅ Synced', loaded.length, 'skills to registry');
  process.exit(0);
"

# Set environment flags based on mode
echo ""
echo "4️⃣  Setting mode: $MODE"

case "$MODE" in
  silent)
    echo "   Mode: SILENT (skills code exists but doesn't execute)"
    echo "   SKILLS_ENABLED=0"
    echo ""
    echo "   To enable later:"
    echo "   export SKILLS_ENABLED=1"
    ;;
  shadow)
    echo "   Mode: SHADOW (skills run and log, but don't change responses)"
    echo "   SKILLS_ENABLED=1"
    echo "   SKILLS_SHADOW_MODE=1"
    echo ""
    echo "   Add to your .env.local:"
    echo "   SKILLS_ENABLED=1"
    echo "   SKILLS_SHADOW_MODE=1"
    ;;
  active)
    echo "   Mode: ACTIVE (skills fully operational)"
    echo "   SKILLS_ENABLED=1"
    echo "   SKILLS_SHADOW_MODE=0"
    echo ""
    echo "   Add to your .env.local:"
    echo "   SKILLS_ENABLED=1"
    echo ""
    echo "   ⚠️  WARNING: This will change MAIA's responses!"
    echo "   💡 Recommend starting with 'shadow' mode first"
    ;;
  *)
    echo "   ❌ Unknown mode: $MODE"
    echo "   Valid modes: silent, shadow, active"
    exit 1
    ;;
esac

# Verify skills exist
echo ""
echo "5️⃣  Verifying skills..."
SKILL_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM skills_registry WHERE enabled = true;" 2>/dev/null | xargs)
echo "   ✅ $SKILL_COUNT enabled skills in registry"

psql "$DATABASE_URL" -c "
  SELECT
    skill_id,
    meta->>'tier' as tier,
    meta->>'category' as category
  FROM skills_registry
  WHERE enabled = true
  ORDER BY skill_id;
" 2>/dev/null

# Test query
echo ""
echo "6️⃣  Quick test (optional)"
echo "   Test query: 'I feel overwhelmed right now'"
echo ""
read -p "   Run test query? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ "$MODE" = "silent" ]; then
    echo "   ⚠️  Skills are in SILENT mode - no execution will occur"
    echo "   💡 Run with 'shadow' or 'active' mode to test"
  else
    echo "   🧪 Running test query..."
    SKILLS_ENABLED=1 SKILLS_SHADOW_MODE=$([ "$MODE" = "shadow" ] && echo "1" || echo "0") \
    npx tsx -e "
      import { runSkillRuntime } from './lib/skills/runtime.js';
      import { generateText } from './lib/ai/modelService.js';
      import path from 'node:path';
      import crypto from 'node:crypto';

      const result = await runSkillRuntime({
        skillsRoot: path.join(process.cwd(), 'skills'),
        ctx: {
          userId: crypto.randomUUID(),
          sessionId: 'test-session',
          queryText: 'I feel overwhelmed right now',
          state: {
            tierAllowed: 'FAST',
            cognitiveLevel: 2,
            nervousSystemState: 'sympathetic',
            element: 'water'
          }
        },
        renderWithModel: async (sys, usr) => {
          const r = await generateText({ systemPrompt: sys, userInput: usr });
          return r.text;
        },
        refusalMessage: (key) => 'Let us ground first.'
      });

      if (result) {
        console.log('   ✅ Skill selected:', result.skillId);
        console.log('   ✅ Outcome:', result.outcome);
        console.log('   ✅ Response preview:', result.responseText.slice(0, 100) + '...');
      } else {
        console.log('   ⚠️  No skill matched');
      }
    "
  fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Skills system ready!"
echo ""
echo "Current mode: $MODE"
echo ""
echo "To change modes:"
echo "  ./scripts/enable-skills.sh silent   # Disable execution"
echo "  ./scripts/enable-skills.sh shadow   # Log only (safe)"
echo "  ./scripts/enable-skills.sh active   # Fully operational"
echo ""
echo "Monitor usage:"
echo "  psql \$DATABASE_URL -c 'SELECT skill_id, outcome, COUNT(*) FROM skill_usage_events GROUP BY skill_id, outcome;'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
