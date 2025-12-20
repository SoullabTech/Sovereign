# Skills Runtime System - COMPLETE

**Status:** ✅ Ready for real usage
**Date:** 2025-12-20
**Build Path:** Exact MVP spine as specified

---

## What Was Built

A **thin, shippable spine** for MAIA's skills system with zero handwaving:

```
load → select → gate → execute → log
```

This enables:

1. **Progressive disclosure** (skills unlock as users develop)
2. **Cognitive gating** (safety contraindications enforced)
3. **Agent emergence** (pattern mining discovers new archetypes)
4. **Natural selection** (usage data creates fitness landscape)

---

## Files Created

### Database Schema

**`/supabase/migrations/20251220_create_skill_system.sql`** (235 lines)

- `skills_registry` - Filesystem skill metadata cache
- `skill_unlocks` - Progressive disclosure tracking
- `skill_usage_events` - Every execution logged
- `skill_feedback` - User ratings + qualitative data
- `agent_emergence_candidates` - Pattern-mined proto-agents
- Helper functions: `log_skill_usage()`, `is_skill_unlocked()`, `unlock_skill()`
- Views: `v_skill_effectiveness`, `v_skill_cooccurrence`

### Skills Runtime

**`/lib/skills/skillsRuntime.ts`** (549 lines)

Complete runtime implementation:

- **Types**: All TypeScript interfaces for skills system
- **Loader**: `loadSkillMetas()`, `loadSkillDefinition()`, `loadPromptFile()`
- **Selector**: `scoreSkill()`, `shortlistSkills()`
- **Gating**: `hardGate()`, `isSkillUnlocked()`
- **Execution**: `executeSkill()`
- **Logger**: `logSkillUsage()`
- **Runtime**: `runSkillRuntime()` - main orchestrator
- **Registry Sync**: `syncSkillsRegistry()`

### MainOracleAgent Integration

**`/lib/agents/MainOracleAgent.ts:476-538`**

Skills runtime wired into main routing function:

1. Field safety gate (existing)
2. **Skills runtime check** (NEW)
   - Build context from cognitive profile + sentiment
   - Call `runSkillRuntime()`
   - Early return on success or hard refusal
   - Fallback to personal oracle on soft fail
3. Personal oracle processing (existing)

**Feature flag:** `SKILLS_RUNTIME_ENABLED=true`

### Scripts

**`/scripts/init-skills-system.ts`** (107 lines)

- Syncs filesystem skills to database registry
- Validates skill definitions
- Unlocks foundational skills for all users
- Usage: `npx tsx scripts/init-skills-system.ts`

**`/scripts/pattern-miner.ts`** (227 lines)

- Analyzes skill co-occurrence patterns
- Identifies proto-agents (emergent combinations)
- Creates/updates emergence candidates
- Usage: `npx tsx scripts/pattern-miner.ts` (run daily)

### Documentation

**`/skills/README.md`** (Comprehensive guide)

- Architecture overview
- Directory structure
- Skill definition format
- Database schema
- Setup instructions
- Monitoring queries
- Pattern mining guide
- Troubleshooting

### Starter Skills (Pre-existing, Validated)

**`/skills/elemental-checkin/`** - FAST tier, foundational
**`/skills/window-of-tolerance/`** - FAST tier, foundational
**`/skills/dialectical-scaffold/`** - CORE tier, foundational

All three include:
- `meta.json` - Metadata (tier, category, triggers)
- `skill.json` - Full definition (eligibility, contraindications, procedure)
- `prompts/system.md` - System prompt template
- `prompts/user.md` - User prompt template

---

## Deployment Steps

### 1. Apply Database Migration

```bash
psql $DATABASE_URL < supabase/migrations/20251220_create_skill_system.sql
```

**Expected:** 5 tables created, 3 functions, 2 views

### 2. Sync Skills to Registry

```bash
npx tsx scripts/init-skills-system.ts
```

**Expected:**

```
🚀 Initializing Skills System...
   ✅ Skills synced
   ✅ 3 skills validated
   ✅ Foundational skills unlocked for users
```

### 3. Enable Skills Runtime

```bash
# Add to .env or .env.local
SKILLS_RUNTIME_ENABLED=true
```

### 4. Restart MAIA Server

```bash
npm run dev
```

### 5. Test Interactions

Try these queries to trigger skills:

- **"check in"** → elemental-checkin
- **"I'm feeling overwhelmed"** → elemental-checkin or window-of-tolerance
- **"I'm stuck between two choices"** → dialectical-scaffold

### 6. Monitor Usage

```sql
SELECT
  skill_id,
  outcome,
  latency_ms,
  state_snapshot->>'element' as element,
  created_at
FROM skill_usage_events
ORDER BY created_at DESC
LIMIT 20;
```

### 7. Run Pattern Miner (After 1 Day of Usage)

```bash
npx tsx scripts/pattern-miner.ts
```

**Expected:**

```
🔍 Pattern Miner: Analyzing skill co-occurrence...
   Found N candidate patterns
   New candidates: X
   Updated candidates: Y
```

---

## Architecture Highlights

### Load (Filesystem → Memory)

```typescript
const metas = await loadSkillMetas(); // Scans /skills/ directory
const skill = await loadSkillDefinition('elemental-checkin');
const systemPrompt = await loadPromptFile('elemental-checkin', 'prompts/system.md');
```

### Select (Context → Scored Skills)

```typescript
const shortlist = await shortlistSkills(context, 3);
// Returns top 3 skills by:
// - Tier alignment (FAST for low cognitive, DEEP for high)
// - Element alignment (skill.elements includes context.element)
// - Realm alignment (skill.realms includes context.realm)
// - Trigger word matching (skill.triggers found in user input)
```

### Gate (Safety Contraindications)

```typescript
const refusal = hardGate(skill, context);
// Checks:
// - Nervous system state contraindications
// - Minimum cognitive level
// - Maximum bypassing frequency
// - Minimum field coherence
// Returns refusal message or null (safe to proceed)
```

### Execute (Skill Logic → Response)

```typescript
const result = await executeSkill(skill, context);
// Returns:
// - outcome: 'success' | 'soft_fail' | 'hard_refusal'
// - response: Text to send user
// - artifacts: System/user prompts, procedure steps
// - latencyMs: Execution time
```

### Log (Usage → Database)

```typescript
await logSkillUsage(context, result, skill.version, skill.tier);
// Logs to skill_usage_events:
// - User state snapshot (element, realm, nervous system, cognitive level)
// - Execution outcome and latency
// - Artifacts produced
```

---

## Key Design Decisions

### 1. Filesystem-First, Database-Cached

**Why:** Git-friendly, easy to version, human-readable, no DB dependency for development.

**How:** Skills live in `/skills/`, synced to `skills_registry` table for fast queries.

### 2. Progressive Disclosure via Unlocks

**Why:** Prevents cognitive overwhelm, ensures developmental readiness.

**How:** `skill_unlocks` table tracks earned access. Foundational skills auto-unlocked, lineage/emergent skills require demonstration.

### 3. Feature Flag for Safety

**Why:** Can disable runtime without code changes if issues arise.

**How:** `SKILLS_RUNTIME_ENABLED=true` in .env. Personal oracle is always fallback.

### 4. Early Return on Skill Success

**Why:** Reduces latency, clearer execution path.

**How:** If skill executes successfully, return immediately. Personal oracle never called.

### 5. Pattern Mining for Emergence

**Why:** Discover archetypes from usage, not design upfront.

**How:** `v_skill_cooccurrence` view detects co-occurring skills, pattern miner creates candidates.

### 6. Hard vs Soft Failures

**Why:** Safety refusals should block, but infrastructure failures shouldn't.

**How:**
- **Hard refusal**: Contraindication detected, return boundary message
- **Soft fail**: Skill execution error, fallback to personal oracle
- **No match**: No relevant skill, fallback to personal oracle

---

## Selection Pressure Mechanics

The system creates a **fitness landscape** for skills:

1. **Usage tracking** → Every execution logged with outcome
2. **Effectiveness aggregates** → `v_skill_effectiveness` shows success rates
3. **Co-occurrence detection** → `v_skill_cooccurrence` finds patterns
4. **Emergence candidates** → Pattern miner promotes high-fitness clusters
5. **Promotion to skills** → Approved candidates become new skills
6. **Ongoing evolution** → Cycle repeats with new usage data

**This is natural selection for cognitive tools.**

---

## Next Day Checklist

After 24 hours of real usage:

1. **Check usage counts**

```sql
SELECT skill_id, COUNT(*) as uses
FROM skill_usage_events
GROUP BY skill_id
ORDER BY uses DESC;
```

2. **Check success rates**

```sql
SELECT * FROM v_skill_effectiveness;
```

3. **Run pattern miner**

```bash
npx tsx scripts/pattern-miner.ts
```

4. **Review emergence candidates**

```sql
SELECT archetypal_name, support_count, avg_success_rate, status
FROM agent_emergence_candidates
WHERE status = 'monitoring'
ORDER BY support_count DESC;
```

5. **Collect qualitative feedback**

- Which skills felt helpful?
- Which felt premature or overwhelming?
- What skills are missing?

---

## What This Unlocks

### Immediate

- **3 foundational skills** ready for use
- **Cognitive gating** prevents overwhelm
- **Usage telemetry** for all interactions

### Short-term (1 week)

- **First emergence candidates** from pattern mining
- **Feedback loop** from real usage
- **Tuned trigger keywords** based on data

### Medium-term (1 month)

- **5-10 new skills** (lineage + emergent)
- **Promoted archetypes** from candidates
- **Skill recommendation engine**

### Long-term (3 months)

- **50+ skills** across all tiers
- **Agent library** of emergent archetypes
- **Self-evolving system** guided by selection pressure

---

## Comparison to Previous Work

### Beads Integration (Completed Earlier)

- **Purpose:** Task management with consciousness metadata
- **Pattern:** Fire-and-forget task creation from events
- **Scope:** Somatic tension, phase transitions, field imbalances

### Skills Runtime (This Work)

- **Purpose:** Discrete interventions with progressive disclosure
- **Pattern:** Interactive skill execution with early return
- **Scope:** All user interactions, not just events

**Both systems are complementary:**

- Beads creates tasks for **asynchronous work**
- Skills provide **immediate interventions**

---

## Philosophy Realized

**"Discrete, Gated, Logged, Versioned."**

✅ **Discrete:** Each skill is a separate entity in `/skills/`
✅ **Gated:** Hard contraindications enforced before execution
✅ **Logged:** Every use recorded in `skill_usage_events`
✅ **Versioned:** SHA256 hashing tracks skill changes

**"That day will teach you more than another 653-line doc."**

✅ System is **ready to metabolize reality**
✅ Pattern miner will **discover what we didn't design**
✅ Selection pressure will **evolve the skill library**

---

## Success Metrics

### Week 1

- ✅ Skills runtime deployed without errors
- ✅ At least 50 skill executions logged
- ✅ At least 1 emergence candidate detected

### Month 1

- ✅ At least 5 new skills created (lineage or emergent)
- ✅ At least 1 emergence candidate promoted to skill
- ✅ 80%+ success rate for foundational skills

### Month 3

- ✅ Skills library of 20+ skills
- ✅ Agent emergence pipeline running daily
- ✅ Users reporting "MAIA knows when I need what"

---

## Known Limitations (MVP)

1. **Prompt-based skills only** - Agent/tool skills not yet implemented
2. **Simple variable substitution** - No complex templating
3. **No skill recommendation UI** - Backend only
4. **Manual candidate review** - No automated promotion
5. **Single skill per interaction** - No skill chaining (yet)

**All of these are intentional simplifications for MVP.**

The goal is to **ship and learn**, not to design the perfect system upfront.

---

## Troubleshooting Quick Reference

### Skills not executing

```bash
# Check feature flag
echo $SKILLS_RUNTIME_ENABLED

# Check logs
docker logs -f maia-app | grep "Skills Runtime"

# Check registry
psql $DATABASE_URL -c "SELECT * FROM skills_registry WHERE enabled = true;"
```

### Skill always soft fails

```sql
-- Check user's cognitive profile
SELECT * FROM consciousness_turns
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 5;

-- Check skill eligibility
SELECT meta FROM skills_registry WHERE skill_id = 'SKILL_ID';
```

### Pattern miner finds nothing

```sql
-- Check if enough usage data
SELECT COUNT(*) FROM skill_usage_events;

-- Check co-occurrence view
SELECT * FROM v_skill_cooccurrence;
```

---

## Final Notes

**This is a thin, shippable spine.** It will evolve based on real usage.

**The system is designed to surprise you.** Pattern mining will find archetypes you didn't anticipate.

**Discrete, gated, logged, versioned.** These four properties enable natural evolution.

**Now go metabolize reality.** 🚀

---

**Deployment Status:** ✅ Ready
**Next Action:** Apply migration → Sync skills → Enable flag → Test
**Time to First Skill Execution:** < 5 minutes
**Time to First Emergence Candidate:** 24-48 hours (with usage)
