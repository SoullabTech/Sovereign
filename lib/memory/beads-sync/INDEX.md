# Beads Memory Integration for MAIA

**Complete consciousness-aware task management system**

**Status:** ✅ Phase 1 Complete (Route Integration Ready)
**Created:** 2025-12-20
**Repository:** `/Users/soullab/MAIA-SOVEREIGN/lib/memory/beads-sync/`

---

## 📚 Documentation Index

### Quick Start (Start Here)
**[QUICK_START.md](./QUICK_START.md)** - Get running in 5 steps (10 minutes)
- Step-by-step setup guide
- Service initialization
- Integration testing
- Troubleshooting

### Integration Guide (For Developers)
**[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete integration instructions
- Exact code locations in `maiaService.ts`
- Three integration hooks explained
- Environment configuration
- Performance considerations
- Common issues & fixes

### Phase 1 Summary (Architecture)
**[PHASE1_ROUTE_INTEGRATION_COMPLETE.md](./PHASE1_ROUTE_INTEGRATION_COMPLETE.md)** - Complete technical overview
- Integration architecture diagrams
- Flow charts for each scenario
- Files created & their purposes
- Success metrics
- Next steps roadmap

### Service README (Operations)
**[README.md](./README.md)** - Beads sync service documentation
- API endpoints reference
- Database schema
- Development workflow
- Production deployment
- Monitoring & troubleshooting

### Technical Specification (Design)
**[/docs/SPIRAL_MEMORY_MESH_SPEC.md](../../docs/SPIRAL_MEMORY_MESH_SPEC.md)** - Original architecture spec
- Hybrid memory design (MAIA + Beads + PostgreSQL)
- `SpiralTask` interface definition
- Workflow diagrams
- Migration strategy

---

## 🗂️ File Structure

```
lib/memory/beads-sync/
├── INDEX.md                          ← You are here
├── QUICK_START.md                    ← Start here for setup
├── INTEGRATION_GUIDE.md              ← Developer integration guide
├── PHASE1_ROUTE_INTEGRATION_COMPLETE.md  ← Phase 1 summary
├── README.md                         ← Service documentation
│
├── MaiaBeadsPlugin.ts               ← Core task management logic
├── maiaServiceIntegration.ts        ← MAIA service integration layer
├── maiaService.integration.patch    ← Git patch for maiaService.ts
├── integration-example.ts           ← Usage examples
│
├── server.ts                        ← Sync service (HTTP API)
├── package.json                     ← Dependencies
├── test-integration.sh              ← Integration test script
│
└── Dockerfile.beads-sync            ← Container image

Related files:
├── docker-compose.beads.yml         ← Service orchestration (root)
└── supabase/migrations/
    └── 20251220_beads_integration.sql  ← Database schema
```

---

## 🚀 Quick Navigation

### I want to...

**...get started quickly**
→ [QUICK_START.md](./QUICK_START.md) - 5 steps, 10 minutes

**...integrate into MAIA service**
→ [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Step-by-step code changes

**...understand the architecture**
→ [PHASE1_ROUTE_INTEGRATION_COMPLETE.md](./PHASE1_ROUTE_INTEGRATION_COMPLETE.md) - Full technical overview

**...deploy to production**
→ [README.md](./README.md#production-deployment) - Production deployment guide

**...troubleshoot issues**
→ [QUICK_START.md#troubleshooting](./QUICK_START.md#troubleshooting) - Common problems & fixes

**...see code examples**
→ [integration-example.ts](./integration-example.ts) - Real-world usage patterns

**...test the integration**
→ Run: `./test-integration.sh`

---

## 🎯 What This Does

### Automatic Task Creation
MAIA detects consciousness events and creates tasks automatically:

- **Somatic tension** → Grounding practices
- **Phase transitions** → Integration rituals
- **Field imbalances** → Elemental restoration
- **Cognitive leaps** → Celebration milestones

### Conversational Task Management
Users can ask MAIA about tasks naturally:

- "What should I work on?" → Returns ready practices
- "I just did the breathing exercise" → Asks for effectiveness rating
- Tasks filtered by cognitive level & field safety

### Persistence & Analytics
Three-layer memory architecture:

- **Beads (SQLite + Git)** → Task mechanics & version control
- **PostgreSQL** → Analytics & cross-session memory
- **MAIA Memory Palace** → Consciousness meaning

---

## 📊 Integration Status

### ✅ Phase 0: Foundation (Complete)
- [x] Beads sync service (`server.ts`)
- [x] Core plugin logic (`MaiaBeadsPlugin.ts`)
- [x] Database schema (PostgreSQL migration)
- [x] Docker orchestration (`docker-compose.beads.yml`)
- [x] Documentation (`README.md`)

### ✅ Phase 1: Route Integration (Complete)
- [x] Service integration layer (`maiaServiceIntegration.ts`)
- [x] Integration guide (`INTEGRATION_GUIDE.md`)
- [x] Git patch file (`maiaService.integration.patch`)
- [x] Test script (`test-integration.sh`)
- [x] Quick start guide (`QUICK_START.md`)

### 🔄 Phase 2: Automated Tests (Next)
- [ ] Jest test suite
- [ ] Mock Beads API
- [ ] Error handling tests
- [ ] CI/CD integration

### 🔄 Phase 3: Deployment Automation (Pending)
- [ ] Staging deployment script
- [ ] Production deployment script
- [ ] Health check automation
- [ ] Rollback procedures

### 🔄 Phase 4: Visualization Dashboard (Future)
- [ ] Spiral phase chart
- [ ] Task effectiveness heatmap
- [ ] Elemental balance display
- [ ] Real-time task tracking UI

---

## 🔧 Key Components

### 1. MaiaBeadsPlugin (`MaiaBeadsPlugin.ts`)
**Purpose:** Core task management logic

**Key Methods:**
- `onSomaticTensionSpike()` - Creates grounding tasks
- `onPhaseTransition()` - Creates integration rituals
- `onFieldImbalance()` - Creates elemental restoration
- `getReadyTasksForUser()` - Filters tasks by cognitive/field safety
- `completeTask()` - Tracks effectiveness & somatic improvement

### 2. Service Integration (`maiaServiceIntegration.ts`)
**Purpose:** Bridge between MAIA and Beads

**Key Functions:**
- `processConsciousnessEventsForBeads()` - Post-response event processing
- `handleTaskReadinessQuery()` - "What should I work on?" handler
- `detectAndLogPracticeCompletion()` - Completion detection

### 3. Sync Service (`server.ts`)
**Purpose:** HTTP API for Beads ↔ PostgreSQL sync

**Key Endpoints:**
- `POST /beads/task` - Create task from consciousness event
- `GET /beads/ready/:userId` - Get ready tasks for user
- `POST /beads/task/:id/complete` - Mark task complete with effectiveness
- `POST /beads/sync` - Trigger manual sync
- `GET /health` - Health check

---

## 🎓 Learning Path

### Level 1: User (Just want it working)
1. Read: [QUICK_START.md](./QUICK_START.md)
2. Run: 5-step setup process
3. Test: `./test-integration.sh`

### Level 2: Developer (Integrating into MAIA)
1. Read: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Apply: `maiaService.integration.patch`
3. Configure: Environment variables
4. Verify: Check logs for `🌱 [Beads]` events

### Level 3: Architect (Understanding design)
1. Read: [PHASE1_ROUTE_INTEGRATION_COMPLETE.md](./PHASE1_ROUTE_INTEGRATION_COMPLETE.md)
2. Review: Architecture diagrams
3. Study: Integration flow charts
4. Explore: Helper function implementations

### Level 4: Maintainer (Production operations)
1. Read: [README.md](./README.md)
2. Deploy: Docker production setup
3. Monitor: Health checks & logs
4. Troubleshoot: Database queries & sync status

---

## 🔍 Quick Reference

### Start Services
```bash
docker-compose -f docker-compose.beads.yml up -d
```

### Run Tests
```bash
./lib/memory/beads-sync/test-integration.sh
```

### Check Health
```bash
curl http://localhost:3100/health
```

### View Tasks
```sql
SELECT beads_id, title, element, status FROM beads_tasks;
```

### Watch Logs
```bash
docker logs -f maia-beads-sync
```

---

## 📈 Success Metrics

After integration, you'll see:

**In MAIA Logs:**
```
🌱 [Beads] Created 1 tasks: maia-1234567890
🎯 [Beads] Task readiness query detected - returning ready tasks
✅ [Beads] Practice completion detected - asking for effectiveness
```

**In Database:**
```sql
SELECT COUNT(*) FROM beads_tasks WHERE user_id = 'your-user-id';
-- Should increase as conversations happen
```

**In Beads:**
```bash
docker exec maia-beads-memory bd list
# Shows tasks with MAIA metadata
```

**User Experience:**
- Asks "What should I work on?" → Gets personalized task list
- Mentions tension → Next session sees grounding practice
- Completes practice → MAIA asks for effectiveness naturally

---

## 🛠️ Development Commands

### Local Development
```bash
# Start Beads services
docker-compose -f docker-compose.beads.yml up -d

# Start MAIA
npm run dev

# Watch Beads logs
docker logs -f maia-beads-sync

# Run integration tests
./lib/memory/beads-sync/test-integration.sh
```

### Database Operations
```bash
# Run migration
psql $DATABASE_URL < supabase/migrations/20251220_beads_integration.sql

# View tasks
psql $DATABASE_URL -c "SELECT * FROM beads_tasks LIMIT 5;"

# View ready tasks
psql $DATABASE_URL -c "SELECT * FROM v_beads_ready_tasks;"

# View effectiveness stats
psql $DATABASE_URL -c "SELECT * FROM v_beads_task_effectiveness;"
```

### Beads CLI
```bash
# List tasks
docker exec maia-beads-memory bd list

# Show task details
docker exec maia-beads-memory bd show maia-1234567890

# Complete task
docker exec maia-beads-memory bd complete maia-1234567890
```

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Services not starting | Check port 3100 not in use: `lsof -i :3100` |
| Tasks not creating | Check `BEADS_INTEGRATION_ENABLED=true` |
| Database errors | Verify `DATABASE_URL` set correctly |
| Integration patch conflicts | Use manual integration from `INTEGRATION_GUIDE.md` |

**Full troubleshooting guide:** [QUICK_START.md#troubleshooting](./QUICK_START.md#troubleshooting)

---

## 📞 Support

**Documentation Issues:**
- Check relevant doc file from index above
- Search for error message in `INTEGRATION_GUIDE.md`

**Service Issues:**
- Check logs: `docker logs maia-beads-sync`
- Verify health: `curl http://localhost:3100/health`
- Test API: `./test-integration.sh`

**Database Issues:**
- Check schema: `psql $DATABASE_URL -c "\d beads_tasks"`
- Verify migration: Check `beads_tasks` table exists
- Review queries: [README.md#monitoring](./README.md#monitoring)

---

## 🎉 You're Ready!

**Next step:** [QUICK_START.md](./QUICK_START.md) - Get running in 10 minutes

**Questions?** Check the appropriate doc file above or run `./test-integration.sh` to verify setup.

---

**Version:** 1.0.0
**Last Updated:** 2025-12-20
**Maintainer:** Soullab Media
**License:** Proprietary
