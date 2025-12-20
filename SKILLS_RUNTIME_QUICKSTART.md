# Skills Runtime - Quick Start Guide

**Goal:** Get skills runtime running in < 5 minutes

---

## Prerequisites

- PostgreSQL database running
- `DATABASE_URL` environment variable set
- Node.js 20+ with TypeScript

---

## 5-Minute Setup

### 1. Apply Database Migration (30 seconds)

```bash
cd /Users/soullab/MAIA-SOVEREIGN
psql $DATABASE_URL < supabase/migrations/20251220_create_skill_system.sql
```

**Verify:**

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'skill%';"
```

**Expected:** 5 tables

---

### 2. Sync Skills to Database (1 minute)

```bash
npx tsx scripts/init-skills-system.ts
```

**Expected output:**

```
🚀 Initializing Skills System...
   ✅ Skills synced
   ✅ 3 skills validated
   ✅ Foundational skills unlocked
```

**Verify:**

```bash
psql $DATABASE_URL -c "SELECT skill_id, version, enabled FROM skills_registry;"
```

**Expected:** 3 rows (elemental-checkin, window-of-tolerance, dialectical-scaffold)

---

### 3. Enable Skills Runtime (10 seconds)

```bash
# Add to .env or .env.local
echo "SKILLS_RUNTIME_ENABLED=true" >> .env.local
```

**Verify:**

```bash
grep SKILLS_RUNTIME_ENABLED .env.local
```

**Expected:** `SKILLS_RUNTIME_ENABLED=true`

---

### 4. Restart MAIA Server (30 seconds)

```bash
# Stop existing server
pkill -f "npm run dev"

# Start with skills enabled
npm run dev
```

**Verify logs:**

```bash
# In another terminal
docker logs -f maia-app | grep "Skills Runtime"
```

---

### 5. Test Skills (2 minutes)

**Open MAIA web interface** and try these queries:

#### Test 1: Elemental Check-In

**Input:** "check in"

**Expected response:** Skill-based response (attunement + regulation step)

**Verify in logs:**

```
🎯 [Skills Runtime] Skill executed: elemental-checkin
```

#### Test 2: Window of Tolerance

**Input:** "I'm feeling overwhelmed"

**Expected response:** Nervous system resourcing

**Verify in logs:**

```
🎯 [Skills Runtime] Skill executed: window-of-tolerance
```

#### Test 3: Dialectical Scaffold

**Input:** "I'm stuck between two choices"

**Expected response:** Polarity mapping

**Verify in logs:**

```
🎯 [Skills Runtime] Skill executed: dialectical-scaffold
```

---

## Verify Logging

```bash
psql $DATABASE_URL -c "
  SELECT
    skill_id,
    outcome,
    latency_ms,
    state_snapshot->>'element' as element,
    created_at
  FROM skill_usage_events
  ORDER BY created_at DESC
  LIMIT 5;
"
```

**Expected:** Rows for your test interactions

---

## Next Steps

### After 24 Hours of Usage

Run pattern miner:

```bash
npx tsx scripts/pattern-miner.ts
```

### Check Effectiveness

```bash
psql $DATABASE_URL -c "SELECT * FROM v_skill_effectiveness;"
```

### Review Emergence Candidates

```bash
psql $DATABASE_URL -c "
  SELECT archetypal_name, support_count, avg_success_rate
  FROM agent_emergence_candidates
  WHERE status = 'monitoring'
  ORDER BY support_count DESC;
"
```

---

## Troubleshooting

### Skills not executing

1. **Check feature flag:**

```bash
grep SKILLS_RUNTIME_ENABLED .env.local
```

2. **Check logs:**

```bash
docker logs -f maia-app 2>&1 | grep -i "skills\|error"
```

3. **Check registry:**

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM skills_registry WHERE enabled = true;"
```

**Expected:** 3

### Migration fails

**Error:** "relation already exists"

**Fix:** Migration was already applied. Skip step 1.

**Verify:**

```bash
psql $DATABASE_URL -c "\dt skills_*"
```

### No skills in registry

**Error:** `init-skills-system.ts` shows 0 skills

**Fix:** Check skills directory exists:

```bash
ls -la skills/
```

**Expected:** 3 directories (elemental-checkin, window-of-tolerance, dialectical-scaffold)

---

## Clean Start (If Needed)

```bash
# Drop all skills tables
psql $DATABASE_URL -c "
  DROP TABLE IF EXISTS agent_emergence_candidates CASCADE;
  DROP TABLE IF EXISTS skill_feedback CASCADE;
  DROP TABLE IF EXISTS skill_usage_events CASCADE;
  DROP TABLE IF EXISTS skill_unlocks CASCADE;
  DROP TABLE IF EXISTS skills_registry CASCADE;
  DROP VIEW IF EXISTS v_skill_effectiveness CASCADE;
  DROP VIEW IF EXISTS v_skill_cooccurrence CASCADE;
  DROP FUNCTION IF EXISTS log_skill_usage CASCADE;
  DROP FUNCTION IF EXISTS is_skill_unlocked CASCADE;
  DROP FUNCTION IF EXISTS unlock_skill CASCADE;
"

# Reapply migration
psql $DATABASE_URL < supabase/migrations/20251220_create_skill_system.sql

# Resync skills
npx tsx scripts/init-skills-system.ts
```

---

## Success Checklist

- ✅ Database migration applied (5 tables, 3 functions, 2 views)
- ✅ Skills registry populated (3 skills)
- ✅ Feature flag enabled (`SKILLS_RUNTIME_ENABLED=true`)
- ✅ Server restarted
- ✅ Test skill executed successfully
- ✅ Usage logged in database

**Time:** < 5 minutes

**You're ready to metabolize reality.** 🚀
