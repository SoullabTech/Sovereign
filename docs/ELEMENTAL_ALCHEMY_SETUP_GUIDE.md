# 🚀 Elemental Alchemy Integration - Setup & Testing Guide

**Status**: Ready for Local Testing
**Date**: 2025-12-14
**Target**: Phase 3A Complete - API Routes + Postgres Integration

---

## What's Been Built

✅ **Database Infrastructure**
- Docker Compose setup for local Postgres
- Complete migration SQL (8 tables)
- Postgres client with query/transaction helpers

✅ **API Routes** (4 core endpoints)
1. `/api/elemental-alchemy/ask` - Ask the Book
2. `/api/elemental-alchemy/journey` - Journey tracking
3. `/api/elemental-alchemy/daily` - Daily teachings
4. `/api/elemental-alchemy/shadow` - Shadow integration

✅ **Backend Services** (from Phase 2)
- SemanticChapterDetector
- UnifiedSpiralogicAlchemyMap
- AskTheBookService
- ElementalJourneyTracker
- DailyAlchemyService
- ShadowIntegrationTracker
- ElementalAlchemyAnalytics

---

## Setup Instructions

### Step 1: Start Docker Desktop

1. **Open Docker Desktop**
   - Find it in your Applications folder
   - Wait for the Docker icon in the menu bar to stop animating
   - You should see "Docker Desktop is running" when you click the icon

### Step 2: Start Local Postgres

```bash
cd /Users/soullab/MAIA-SOVEREIGN/backend
docker compose up -d
```

**Expected output:**
```
[+] Running 2/2
 ✔ Volume "backend_maia_pgdata" Created
 ✔ Container maia_local_postgres Started
```

### Step 3: Verify Postgres is Running

```bash
docker compose ps
```

**Expected output:**
```
NAME                  IMAGE         STATUS
maia_local_postgres   postgres:16   Up About a minute
```

### Step 4: Run Database Migration

The migration runs automatically on first startup (via the init mount in docker-compose.yml).

To verify tables were created:

```bash
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" -c "\dt ea_*"
```

**Expected output:**
```
List of relations
 Schema |           Name           | Type  | Owner
--------+--------------------------+-------+-------
 public | ea_analytics_events      | table | maia
 public | ea_book_queries          | table | maia
 public | ea_daily_alchemy_views   | table | maia
 public | ea_journey_state         | table | maia
 public | ea_practice_events       | table | maia
 public | ea_shadow_instances      | table | maia
 public | ea_shadow_patterns       | table | maia
```

### Step 5: Install Node Dependencies (if needed)

```bash
cd /Users/soullab/MAIA-SOVEREIGN
npm install pg @types/pg
```

### Step 6: Start the Development Server

```bash
npm run dev
```

**Or if using a specific port:**
```bash
PORT=3000 npm run dev
```

---

## Fast Smoke Test Sequence

**Before running full tests, verify the critical path works:**

### A) Ask route responds with semantic detection

```bash
curl -s -X POST http://localhost:3000/api/elemental-alchemy/ask \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","question":"I feel like I am drowning in emotion"}' | jq
```

**Expected**: `"success": true` + element detection (likely Water) + chapters/practices.

### B) Verify database write occurred

```bash
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" -c \
"SELECT id, user_id, query_text, detected_element, created_at FROM ea_book_queries ORDER BY created_at DESC LIMIT 3;"
```

**Expected**: Your test query appears in the most recent row.

### C) Run canonical prompts test

```bash
chmod +x scripts/test-canonical-prompts.sh
./scripts/test-canonical-prompts.sh
```

**Expected**: 10/10 tests pass with correct element detection.

---

## Detailed API Testing

### Test 1: Ask the Book

**Request:**
```bash
curl -X POST http://localhost:3000/api/elemental-alchemy/ask \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "question": "I am burning with ambition but exhausted"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "query": "I am burning with ambition but exhausted",
    "detectedThemes": ["fire (85%)"],
    "chapters": [
      {
        "element": "fire",
        "title": "Fire - The Element of Spirit and Energy",
        "excerpt": "...",
        "relevance": 85
      }
    ],
    "suggestedQuestions": [
      "What vision is trying to emerge through me?",
      "Where is my creative fire burning unsustainably?"
    ],
    "practices": [
      "Creative rest: Schedule intentional pauses",
      "Discernment practice: Ask 'Is this mine or borrowed?'"
    ]
  }
}
```

### Test 2: Journey Snapshot

**Request:**
```bash
curl "http://localhost:3000/api/elemental-alchemy/journey?userId=test-user-001"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "currentFacet": {
      "id": "Fire-1",
      "number": 1,
      "element": "Fire"
    },
    "progress": {
      "inFacet": 0,
      "facetsCompleted": 0,
      "spiralLevel": 0
    },
    "alchemical": {
      "stage": "nigredo",
      "color": "Black"
    },
    "teachings": {
      "theme": "First spark of vision emerging from darkness",
      "shadowToWatch": "Manic creation without grounding, spiritual bypassing",
      "goldMedicine": "Sacred discernment of true purpose"
    }
  }
}
```

### Test 3: Daily Alchemy

**Request:**
```bash
curl "http://localhost:3000/api/elemental-alchemy/daily?userId=test-user-001"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "morning": {
      "type": "morning",
      "element": "Fire",
      "title": "Morning Fire Reflection",
      "content": "As you awaken, feel the spark of new possibility...",
      "practice": "Light a candle and set an intention...",
      "reflection": "What vision is calling to me this morning?"
    },
    "midday": { ... },
    "evening": { ... }
  }
}
```

### Test 4: Shadow Instance Recording

**Request:**
```bash
curl -X POST http://localhost:3000/api/elemental-alchemy/shadow \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "facet": "Fire-1",
    "shadowPattern": "Creative Burnout",
    "trigger": "Saw someone else succeed",
    "intensity": 4,
    "noticeMethod": "emotion",
    "awareness": "Felt compulsive need to work all night",
    "goldMedicineApplied": "Asked: Is this sustainable?",
    "responseTaken": "Set 2-hour work limit and went to bed"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "facet": "Fire-1",
    "intensity": 4,
    "wasIntegrated": true,
    "occurredAt": "2025-12-14T..."
  },
  "message": "Shadow instance recorded with gold medicine applied! 🌟"
}
```

### Test 5: Shadow Metrics

**Request:**
```bash
curl "http://localhost:3000/api/elemental-alchemy/shadow?userId=test-user-001&windowDays=30"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalInstancesRecorded": 1,
      "integrationRate": 100,
      "byElement": {
        "Fire": 1,
        "Water": 0
      }
    },
    "recentInstances": [...]
  }
}
```

---

## Testing with the 10 Canonical Prompts

These prompts test semantic detection across all elements:

```bash
#!/bin/bash

# Test all 10 canonical prompts
PROMPTS=(
  "I'm burning with ambition but exhausted"
  "I feel like I'm drowning in emotion and can't think"
  "Everything is chaos; I need structure"
  "I can't stop analyzing; it's disconnecting me from my life"
  "A threshold moment—something is ending and I don't know what's next"
  "I'm compelled to create, but it turns manic"
  "I keep repeating the same relational pattern"
  "My body is tense; my mind won't settle"
  "I feel blank—like I can't access anything"
  "I had a dream that felt like an initiation"
)

for i in "${!PROMPTS[@]}"; do
  echo "Testing prompt $((i+1)): ${PROMPTS[$i]}"

  curl -X POST http://localhost:3000/api/elemental-alchemy/ask \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"test-canonical-$i\",
      \"question\": \"${PROMPTS[$i]}\"
    }" | jq '.data.detectedThemes'

  echo ""
  sleep 1
done
```

Save this as `/Users/soullab/MAIA-SOVEREIGN/scripts/test-canonical-prompts.sh` and run:

```bash
chmod +x scripts/test-canonical-prompts.sh
./scripts/test-canonical-prompts.sh
```

---

## Verifying Database Writes

Check that data is being saved:

```bash
# Book queries
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" \
  -c "SELECT id, query_text, detected_element, created_at FROM ea_book_queries ORDER BY created_at DESC LIMIT 5;"

# Shadow instances
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" \
  -c "SELECT id, facet, shadow_pattern, intensity, was_integrated, occurred_at FROM ea_shadow_instances ORDER BY occurred_at DESC LIMIT 5;"

# Daily alchemy views
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" \
  -c "SELECT id, user_id, alchemy_type, element, viewed_at FROM ea_daily_alchemy_views ORDER BY viewed_at DESC LIMIT 5;"
```

---

## Common "Looks Fine But Isn't" Failure Modes

### 1. Wrong connection string / env not loaded
**Symptom**: Routes respond but no database writes appear
**Check**: Verify `.env.local` has correct `DATABASE_URL`
**Fix**: Ensure `DATABASE_URL=postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign`

### 2. Migration didn't run
**Symptom**: Database is up but tables missing or wrong schema
**Check**: `psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" -c "\dt ea_*"`
**Fix**: If no tables, the migration didn't auto-run. See Troubleshooting → Migration didn't run.

### 3. Server duplication
**Symptom**: Inconsistent state, stale responses, `.next/dev/lock` errors
**Check**: `ps aux | egrep "next dev|npm run dev" | grep -v egrep`
**Fix**: Kill duplicate processes, remove `.next/dev/lock`, start single instance.

---

## Troubleshooting

### Docker not starting

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start
3. Verify in menu bar: Docker icon should be solid, not animated

### Migration didn't run

**Error:** Tables don't exist

**Solution:**
```bash
# Stop container
cd /Users/soullab/MAIA-SOVEREIGN/backend
docker compose down

# Remove volume to force re-init
docker volume rm backend_maia_pgdata

# Start again (migration runs on first start)
docker compose up -d
```

### Can't connect to database

**Error:** `ECONNREFUSED` or connection timeout

**Solution:**
```bash
# Check if Postgres is running
docker compose ps

# Check logs
docker compose logs postgres

# Verify port is correct (5433, not 5432)
psql "postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign" -c "SELECT 1"
```

### Module not found: 'pg'

**Error:** `Cannot find module 'pg'`

**Solution:**
```bash
npm install pg @types/pg
```

---

## What's Next

After verifying everything works locally:

### Phase 3B: UI Components (Next Step)

1. **Ask The Book Page** (`/book/ask`)
   - Clean search interface
   - Detected themes display
   - Results cards with chapters + practices
   - Citations from book

2. **My Journey Page** (`/alchemy/journey`)
   - Current facet card
   - Alchemical stage visualization
   - Progress bar
   - Next steps panel

3. **Daily Alchemy Page** (`/alchemy/daily`)
   - Morning/Midday/Evening collapsible panels
   - Time tracking
   - Streak display

4. **Shadow Tracker Page** (`/alchemy/shadow`)
   - Log form
   - Recent instances list
   - Integration trend chart
   - Element balance visualization

### Phase 3C: Analytics Dashboard (For Kelly)

- Platform-wide metrics
- Most popular chapters
- Transformation patterns
- User engagement trends

---

## Success Criteria

You'll know everything is working when:

✅ Docker container running
✅ Database tables created
✅ All 4 API routes responding
✅ Data being saved to Postgres
✅ 10 canonical prompts detecting correctly
✅ No errors in server console

---

## Quick Reference

**Start everything:**
```bash
# Terminal 1: Start Postgres
cd /Users/soullab/MAIA-SOVEREIGN/backend
docker compose up -d

# Terminal 2: Start dev server
cd /Users/soullab/MAIA-SOVEREIGN
npm run dev
```

**Stop everything:**
```bash
# Stop dev server: Ctrl+C

# Stop Postgres
cd /Users/soullab/MAIA-SOVEREIGN/backend
docker compose down
```

**View logs:**
```bash
# Postgres logs
docker compose logs -f postgres

# Next.js logs
# (visible in terminal where you ran npm run dev)
```

---

**Document Maintained By**: Claude Code
**Last Updated**: 2025-12-14
**Status**: Phase 3A Complete - Ready for Testing
