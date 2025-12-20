# MAIA Skills Runtime System

**Thin, shippable spine for progressive disclosure, cognitive gating, and agent emergence.**

---

## What This Is

The Skills Runtime System enables MAIA to:

1. **Load** discrete skills from filesystem
2. **Select** relevant skills based on context
3. **Gate** skills based on safety contraindications
4. **Execute** skills with proper logging
5. **Learn** from usage patterns to discover emergent agents

---

## Architecture

```
User Input
    ↓
MainOracleAgent.processInteraction()
    ↓
Field Safety Gate ✅
    ↓
Skills Runtime (if enabled)
    ├─ Load: Scan /skills/ directory
    ├─ Select: Score skills by context
    ├─ Gate: Check contraindications
    ├─ Execute: Run skill logic
    └─ Log: Record to database
    ↓
Personal Oracle (fallback)
```

---

## Directory Structure

```
skills/
├── README.md                          ← You are here
├── elemental-checkin/                 ← FAST foundational skill
│   ├── meta.json                      ← Metadata (tier, category, triggers)
│   ├── skill.json                     ← Full definition (eligibility, contraindications, procedure)
│   ├── prompts/
│   │   ├── system.md                  ← System prompt template
│   │   └── user.md                    ← User prompt template
│   └── tests/                         ← Unit tests (future)
├── window-of-tolerance/               ← FAST foundational skill
│   └── ...
└── dialectical-scaffold/              ← CORE foundational skill
    └── ...
```

---

## Skill Definition Format

### meta.json

```json
{
  "id": "elemental-checkin",
  "name": "Elemental Check-In",
  "version": "0.1.0",
  "description": "FAST attunement + regulation-first next step.",
  "tier": "FAST",
  "category": "foundational",
  "kind": "prompt",
  "tags": ["checkin", "regulation", "elemental"],
  "triggers": ["check in", "how am i", "state", "overwhelmed", "feeling"],
  "elements": ["water", "earth", "air", "fire", "aether"],
  "realms": ["MIDDLEWORLD"]
}
```

### skill.json

```json
{
  "meta": { ... },
  "eligibility": {
    "minCognitiveLevel": 1,
    "allowedNervousSystemStates": ["window", "sympathetic"]
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"],
    "whenNotToUse": ["Acute crisis requiring referral"],
    "hardRefusalMessageKey": "FAST_DORSAL_REFUSAL"
  },
  "procedure": [
    {
      "id": "attune",
      "title": "Attune",
      "instruction": "Reflect sensations/emotions/thoughts briefly; name likely element; invite one grounding breath."
    }
  ],
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  },
  "successCriteria": [
    "Names present state without escalation",
    "Gives one doable regulation step"
  ],
  "nextSkillHints": ["window-of-tolerance"]
}
```

---

## Database Schema

### skills_registry

Cached metadata for fast lookups:

```sql
CREATE TABLE skills_registry (
  skill_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  sha256 TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trust_level INT NOT NULL DEFAULT 1,
  meta JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### skill_unlocks

Progressive disclosure:

```sql
CREATE TABLE skill_unlocks (
  user_id UUID NOT NULL,
  skill_id TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT,
  PRIMARY KEY (user_id, skill_id)
);
```

### skill_usage_events

Every execution logged:

```sql
CREATE TABLE skill_usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  skill_id TEXT NOT NULL,
  version TEXT NOT NULL,
  tier TEXT,
  outcome TEXT NOT NULL, -- success | soft_fail | hard_refusal
  latency_ms INT,
  state_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
  artifacts JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### agent_emergence_candidates

Pattern-mined proto-agents:

```sql
CREATE TABLE agent_emergence_candidates (
  id BIGSERIAL PRIMARY KEY,
  signature_hash TEXT NOT NULL,
  tier TEXT,
  element TEXT,
  realm TEXT,
  cooccur_skills JSONB NOT NULL DEFAULT '[]'::JSONB,
  support_count INT NOT NULL DEFAULT 0,
  avg_success_rate NUMERIC,
  archetypal_name TEXT,
  status TEXT NOT NULL DEFAULT 'monitoring',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Skill Tiers

| Tier   | Latency  | Purpose                       | Example                  |
|--------|----------|-------------------------------|--------------------------|
| FAST   | < 2s     | Quick orientation, triage     | elemental-checkin        |
| CORE   | 2-6s     | Practical integration work    | dialectical-scaffold     |
| DEEP   | 6-20s    | Symbolic/archetypal immersion | shadow-integration (TBD) |

---

## Skill Categories

| Category     | Description                           | Unlocking                         |
|--------------|---------------------------------------|-----------------------------------|
| foundational | Always available                      | Automatic for all users           |
| lineage      | Domain-specific expertise             | Unlock via stable cognitive level |
| emergent     | Pattern-mined from co-occurring skills| Unlock via demonstrable readiness |

---

## Integration with MainOracleAgent

**Location:** `/lib/agents/MainOracleAgent.ts:476-538`

**Flow:**

1. Field safety gate (existing)
2. **Skills runtime check** (NEW)
   - If `SKILLS_RUNTIME_ENABLED=true` in .env
   - Build context from cognitive profile + sentiment + state
   - Call `runSkillRuntime(context)`
   - If success → return skill response (early exit)
   - If hard refusal → return boundary message (early exit)
   - If soft fail or no match → continue to personal oracle
3. Personal oracle processing (existing fallback)

**Feature Flag:**

```bash
# .env
SKILLS_RUNTIME_ENABLED=true
```

---

## Runtime Functions

### Load

```typescript
loadSkillMetas(): Promise<Array<SkillMetadata>>
loadSkillDefinition(skillId: string): Promise<SkillDefinition | null>
loadPromptFile(skillId: string, path: string): Promise<string>
```

### Select

```typescript
scoreSkill(skill: SkillDefinition, context: SkillContext): number
shortlistSkills(context: SkillContext, maxSkills: number): Promise<Array<ScoredSkill>>
```

### Gate

```typescript
hardGate(skill: SkillDefinition, context: SkillContext): string | null
isSkillUnlocked(userId: string, skillId: string): Promise<boolean>
```

### Execute

```typescript
executeSkill(skill: SkillDefinition, context: SkillContext): Promise<SkillResult>
```

### Log

```typescript
logSkillUsage(
  context: SkillContext,
  result: SkillResult,
  skillVersion: string,
  skillTier: SkillTier
): Promise<void>
```

### Runtime

```typescript
runSkillRuntime(context: SkillContext): Promise<SkillResult | null>
```

---

## Setup Instructions

### 1. Apply Database Migration

```bash
psql $DATABASE_URL < supabase/migrations/20251220_create_skill_system.sql
```

### 2. Sync Skills to Registry

```bash
npx tsx scripts/init-skills-system.ts
```

**Expected output:**

```
🚀 Initializing Skills System...

1️⃣  Syncing skills to database registry...
   ✅ Skills synced

2️⃣  Validating skill definitions...
   Found 3 skills:

   📦 Elemental Check-In (elemental-checkin)
      Version: 0.1.0
      Tier: FAST
      Category: foundational
      SHA256: 5f4dcc3b5aa765...
      ✅ Valid

   📦 Window of Tolerance Resourcing (window-of-tolerance)
      Version: 0.1.0
      Tier: FAST
      Category: foundational
      SHA256: 5f4dcc3b5aa765...
      ✅ Valid

   📦 Dialectical Scaffold (dialectical-scaffold)
      Version: 0.1.0
      Tier: CORE
      Category: foundational
      SHA256: 5f4dcc3b5aa765...
      ✅ Valid

3️⃣  Unlocking foundational skills for existing users...
   Found 42 users
   Found 3 foundational skills
   ✅ 126 skills unlocked

✅ Skills system initialized!
```

### 3. Enable Skills Runtime

```bash
# .env or .env.local
SKILLS_RUNTIME_ENABLED=true
```

### 4. Restart MAIA Server

```bash
npm run dev
```

### 5. Test

Try these queries:

- "check in" → elemental-checkin
- "I'm feeling overwhelmed" → elemental-checkin or window-of-tolerance
- "I'm stuck between two choices" → dialectical-scaffold

---

## Monitoring

### View Recent Skill Usage

```sql
SELECT
  skill_id,
  outcome,
  latency_ms,
  state_snapshot->>'element' as element,
  state_snapshot->>'cognitiveLevel' as cognitive_level,
  created_at
FROM skill_usage_events
ORDER BY created_at DESC
LIMIT 20;
```

### Skill Effectiveness Dashboard

```sql
SELECT * FROM v_skill_effectiveness;
```

**Output:**

| skill_id          | total_uses | success_count | success_rate_pct | avg_latency_ms | avg_rating | unique_users |
|-------------------|------------|---------------|------------------|----------------|------------|--------------|
| elemental-checkin | 156        | 148           | 94.87            | 1450           | 4.2        | 42           |
| window-of...      | 89         | 82            | 92.13            | 1820           | 4.5        | 31           |
| dialectical...    | 23         | 21            | 91.30            | 4200           | 4.8        | 12           |

---

## Pattern Mining (Agent Emergence)

### Run Pattern Miner

```bash
npx tsx scripts/pattern-miner.ts
```

**Output:**

```
🔍 Pattern Miner: Analyzing skill co-occurrence...

1️⃣  Fetching co-occurrence patterns...
   Found 5 candidate patterns

2️⃣  Analyzing patterns for agent emergence...

   📊 Pattern: elemental-checkin + window-of-tolerance
      Tier: FAST
      Element: water
      Realm: MIDDLEWORLD
      Co-occurrences: 12
      Users: 8
      Success rate: 95.0%
      Suggested archetype: Water Elemental Checkin → Window Of Tolerance (Fast)
      ✨ New candidate created (status: monitoring)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pattern mining complete!

   New candidates: 5
   Updated candidates: 0
   Total analyzed: 5

🎯 Candidates ready for review (high support + high success):

   Water Elemental Checkin → Window Of Tolerance (Fast)
      Support: 8 users
      Success: 95.0%
      Status: monitoring
```

### Review Candidates

```sql
SELECT
  archetypal_name,
  cooccur_skills,
  support_count,
  avg_success_rate,
  status
FROM agent_emergence_candidates
WHERE status = 'monitoring'
ORDER BY support_count DESC, avg_success_rate DESC;
```

### Promote Candidate to Skill

```sql
-- Mark for review
UPDATE agent_emergence_candidates
SET status = 'review'
WHERE id = 1;

-- After review, mark as approved
UPDATE agent_emergence_candidates
SET status = 'approved'
WHERE id = 1;

-- Create new skill definition in /skills/
-- Then mark as deployed
UPDATE agent_emergence_candidates
SET status = 'deployed',
    promoted_to_skill_id = 'water-regulation-flow'
WHERE id = 1;
```

---

## Creating New Skills

### 1. Create Directory Structure

```bash
mkdir -p skills/my-new-skill/prompts
```

### 2. Create meta.json

```json
{
  "id": "my-new-skill",
  "name": "My New Skill",
  "version": "0.1.0",
  "description": "What this skill does.",
  "tier": "CORE",
  "category": "lineage",
  "kind": "prompt",
  "tags": ["tag1", "tag2"],
  "triggers": ["keyword1", "keyword2"],
  "elements": ["fire"],
  "realms": ["MIDDLEWORLD"]
}
```

### 3. Create skill.json

```json
{
  "meta": { ... },
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxSpiritualBypassing": 0.3
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"]
  },
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  }
}
```

### 4. Create Prompts

**prompts/system.md:**

```markdown
You are executing the {{skillName}} skill.

User state:
- Element: {{element}}
- Nervous system: {{nervousSystemState}}

Guidelines:
- ...
```

**prompts/user.md:**

```markdown
User input: {{userInput}}

Respond with...
```

### 5. Sync to Registry

```bash
npx tsx scripts/init-skills-system.ts
```

---

## Troubleshooting

### Skills not executing

1. Check feature flag: `echo $SKILLS_RUNTIME_ENABLED`
2. Check logs: `docker logs -f maia-app | grep "Skills Runtime"`
3. Check database: `SELECT * FROM skills_registry WHERE enabled = true;`

### Skill always soft fails

1. Check eligibility in `skill.json`
2. Check user's cognitive profile: `SELECT * FROM v_cognitive_profiles WHERE user_id = '...';`
3. Check triggers: Ensure user input contains trigger keywords

### Pattern miner finds no patterns

1. Need more usage: At least 3 co-occurrences required
2. Check view: `SELECT * FROM v_skill_cooccurrence;`
3. Lower thresholds in `scripts/pattern-miner.ts` (for testing only)

---

## Next Steps

### Immediate (Day 1)

1. ✅ Run init script
2. ✅ Enable feature flag
3. ✅ Test 3 starter skills
4. ✅ Monitor usage logs

### Short-term (Week 1)

1. Run pattern miner daily
2. Review emergence candidates
3. Collect user feedback
4. Tune trigger keywords

### Medium-term (Month 1)

1. Create 5-10 lineage skills
2. Promote top emergence candidates
3. Build skill recommendation engine
4. Add skill feedback UI

---

## Philosophy

**Discrete, Gated, Logged, Versioned.**

These four properties enable:

- **Selection pressure** (usage data creates fitness landscape)
- **Natural emergence** (patterns appear without design)
- **Progressive disclosure** (users unlock skills as they develop)
- **Continuous evolution** (skills improve based on real usage)

**"That day will teach you more than another 653-line doc."**

The system is designed to learn from reality, not just theory.

---

## Support

**Issues?** Check:

1. Database migration applied: `SELECT * FROM skills_registry LIMIT 1;`
2. Feature flag enabled: `echo $SKILLS_RUNTIME_ENABLED`
3. Skills directory exists: `ls -la skills/`
4. Logs for errors: `docker logs -f maia-app | grep -i "skills\|error"`

**Questions?** See `/lib/skills/skillsRuntime.ts` for implementation details.
