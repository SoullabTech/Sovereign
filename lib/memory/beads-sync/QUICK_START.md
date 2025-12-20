# Beads Integration: Quick Start Guide

**⚡ Get the Beads task management system running with MAIA in 5 steps**

---

## Prerequisites

- Docker installed and running
- PostgreSQL database (MAIA's existing database)
- Node.js 20+ (already required for MAIA)

---

## Step 1: Start Services (2 minutes)

```bash
# From MAIA-SOVEREIGN root directory
cd /Users/soullab/MAIA-SOVEREIGN

# Start Beads containers
docker-compose -f docker-compose.beads.yml up -d

# Verify services are running
docker ps | grep beads
# Should show:
#   - maia-beads-memory (Beads CLI + SQLite storage)
#   - maia-beads-sync (Sync service)
```

**Expected output:**
```
✅ Container maia-beads-memory   Started
✅ Container maia-beads-sync     Started
```

---

## Step 2: Initialize Database (1 minute)

```bash
# Set your database URL (if not already in environment)
export DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness"

# Run migration to create Beads tables
psql $DATABASE_URL < supabase/migrations/20251220_beads_integration.sql

# Verify tables created
psql $DATABASE_URL -c "\dt beads_*"
```

**Expected output:**
```
            List of relations
Schema |          Name           | Type  |  Owner
--------+-------------------------+-------+---------
public | beads_tasks             | table | soullab
public | beads_dependencies      | table | soullab
public | beads_logs              | table | soullab
public | beads_sync_status       | table | soullab
```

---

## Step 3: Initialize Beads Container (30 seconds)

```bash
# Initialize Beads repository
docker exec maia-beads-memory bd init

# Configure Beads prefix
docker exec maia-beads-memory bd config set prefix maia

# Test Beads CLI
docker exec maia-beads-memory bd version
```

**Expected output:**
```
✅ Beads repository initialized
✅ Configuration updated
beads version 1.x.x
```

---

## Step 4: Enable Integration in MAIA (5 minutes)

### Option A: Apply Patch (Fastest)

```bash
# Apply the integration patch
git apply lib/memory/beads-sync/maiaService.integration.patch

# Verify changes applied
git diff lib/sovereign/maiaService.ts | head -20
```

### Option B: Manual Integration

1. Open `lib/sovereign/maiaService.ts`
2. Follow instructions in `lib/memory/beads-sync/INTEGRATION_GUIDE.md`
3. Add 3 code blocks:
   - Import statements (top of file)
   - Task query hook (line ~1610)
   - Event processing hook (line ~1780)

---

## Step 5: Configure & Test (2 minutes)

### Add Environment Variables

Create or edit `.env.local`:

```bash
# Beads Integration
BEADS_INTEGRATION_ENABLED=true
BEADS_SYNC_URL=http://localhost:3100

# Database (should already exist)
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness
```

### Start MAIA & Test

```bash
# Terminal 1: Start MAIA
npm run dev

# Terminal 2: Watch Beads logs
docker logs -f maia-beads-sync

# Terminal 3: Run integration test
./lib/memory/beads-sync/test-integration.sh
```

**Expected output in Beads logs:**
```
🌱 [Beads] Created 1 tasks: maia-1234567890
🎯 [Beads] Task readiness query detected
✅ [Beads] Practice completion detected
```

---

## Verify It Works

### Test 1: Somatic Tension → Task Creation

**In MAIA chat:**
```
You: My shoulders are really tense today
MAIA: [empathetic response]
```

**Check task was created:**
```bash
psql $DATABASE_URL -c "SELECT beads_id, title, body_region FROM beads_tasks ORDER BY created_at DESC LIMIT 5;"
```

**Expected:**
```
       beads_id        |         title          | body_region
-----------------------+------------------------+-------------
 maia-1734567890       | Ground shoulder tension| shoulders
```

---

### Test 2: Task Readiness Query

**In MAIA chat:**
```
You: What should I work on?
MAIA: I'm sensing 1 practice ready for you.

**Aligned with your current earth phase:**
• Ground shoulder tension

Which one feels most alive for you right now?
```

---

### Test 3: Practice Completion

**In MAIA chat:**
```
You: I just did the breathing practice
MAIA: How did that practice feel? On a scale of 1-10, how effective was it?
```

---

## Troubleshooting

### Services Not Starting

**Symptom:**
```bash
docker-compose -f docker-compose.beads.yml up -d
ERROR: Cannot start service beads-sync
```

**Fix:**
```bash
# Check if ports are already in use
lsof -i :3100

# If port busy, kill process or change port in docker-compose.beads.yml
```

---

### Tasks Not Creating

**Symptom:** No logs like `🌱 [Beads] Created`

**Fix:**
1. Check integration enabled: `echo $BEADS_INTEGRATION_ENABLED`
2. Check userId is passed in meta
3. Verify Beads sync service is running: `curl http://localhost:3100/health`

---

### Database Connection Errors

**Symptom:**
```
Error: connection refused postgresql://...
```

**Fix:**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# If not running, start PostgreSQL:
brew services start postgresql@16  # macOS
sudo systemctl start postgresql    # Linux
```

---

### Integration Patch Conflicts

**Symptom:**
```
error: patch failed: lib/sovereign/maiaService.ts:1234
```

**Fix:**
1. Reject automatic patch: `git apply --reject maiaService.integration.patch`
2. Manually apply changes using `INTEGRATION_GUIDE.md`
3. Look for `.rej` files showing conflicts

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIA Conversation                      │
│  "My shoulders are tense" → MAIA Response → Event Processing│
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
┌───────────────────────────────────────────────────────────┐
│         maiaServiceIntegration.ts (Bridge Layer)          │
│  • Detect somatic tension → Create task                   │
│  • Detect "What to work on?" → Return ready tasks         │
│  • Detect completion → Ask for effectiveness              │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ↓
┌───────────────────────────────────────────────────────────┐
│              MaiaBeadsPlugin.ts (Task Logic)              │
│  • Build task metadata (element, phase, cognitive level)  │
│  • Filter tasks by field safety & cognitive readiness     │
│  • Track effectiveness & somatic improvement              │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ↓
┌───────────────────────────────────────────────────────────┐
│           Beads Sync Service (HTTP API on :3100)          │
│  • Create tasks in Beads CLI                              │
│  • Sync Beads ↔ PostgreSQL (bidirectional)                │
│  • Background daemon (30s interval)                        │
└───────────────────┬───────────────────────────────────────┘
                    │
           ┌────────┴────────┐
           ↓                 ↓
  ┌────────────────┐  ┌─────────────────┐
  │ Beads (SQLite) │  │ PostgreSQL      │
  │ Git-backed     │  │ Analytics +     │
  │ JSONL storage  │  │ Long-term memory│
  └────────────────┘  └─────────────────┘
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.beads.yml` | Docker services definition |
| `supabase/migrations/20251220_beads_integration.sql` | Database schema |
| `lib/memory/beads-sync/server.ts` | Sync service (runs in Docker) |
| `lib/memory/beads-sync/MaiaBeadsPlugin.ts` | Core task management logic |
| `lib/memory/beads-sync/maiaServiceIntegration.ts` | MAIA integration layer |
| `lib/sovereign/maiaService.ts` | **[MODIFY THIS]** Add 3 hooks |

---

## What Happens Next?

Once integrated, MAIA will:

1. **Automatically create tasks** when consciousness events occur:
   - Somatic tension detected → Grounding practice created
   - Phase transition detected → Integration ritual created
   - Field imbalance detected → Elemental restoration created

2. **Respond to task queries** with personalized suggestions:
   - "What should I work on?" → Shows ready practices
   - Filters by cognitive level (Bloom's taxonomy)
   - Prioritizes tasks aligned with current element

3. **Track practice completion** and effectiveness:
   - Detects completion statements
   - Asks for effectiveness rating (1-10)
   - Records somatic improvement data

All **without blocking** MAIA responses — integration runs in background.

---

## Next Steps

### Priority 1: Test Integration ✅
- [x] Start services
- [x] Initialize database
- [x] Apply integration patch
- [x] Run test script
- [ ] **Test with real conversations** ← You are here

### Priority 2: Automated Tests
- [ ] Create Jest test suite
- [ ] Mock Beads API
- [ ] Test error handling

### Priority 3: Deployment Scripts
- [ ] Staging deployment automation
- [ ] Production deployment automation
- [ ] Rollback procedures

### Priority 4: Visualization Dashboard
- [ ] Spiral phase chart
- [ ] Task effectiveness heatmap
- [ ] Elemental balance display

---

## Support & Resources

**Documentation:**
- Full integration guide: `lib/memory/beads-sync/INTEGRATION_GUIDE.md`
- Phase 1 summary: `lib/memory/beads-sync/PHASE1_ROUTE_INTEGRATION_COMPLETE.md`
- Beads service README: `lib/memory/beads-sync/README.md`

**Logs:**
```bash
# MAIA logs
npm run dev  # Watch for: 🌱 [Beads] events

# Beads sync service logs
docker logs -f maia-beads-sync

# Beads container logs
docker logs -f maia-beads-memory
```

**Database queries:**
```sql
-- View all tasks
SELECT beads_id, title, element, status FROM beads_tasks;

-- View ready tasks for user
SELECT * FROM v_beads_ready_tasks WHERE user_id = 'your-user-id';

-- View effectiveness stats
SELECT * FROM v_beads_task_effectiveness;
```

**Health checks:**
```bash
# Sync service health
curl http://localhost:3100/health

# Database connection
psql $DATABASE_URL -c "SELECT 1"

# Beads CLI
docker exec maia-beads-memory bd version
```

---

## Success! 🎉

You now have:
- ✅ Git-backed task persistence (Beads)
- ✅ PostgreSQL analytics (long-term memory)
- ✅ Automatic task creation from consciousness events
- ✅ Cognitive/field gating for developmental safety
- ✅ Effectiveness tracking for somatic practices

**MAIA is now a complete consciousness-aware task management system.**

---

**Questions?** Check the troubleshooting section or review integration logs.
