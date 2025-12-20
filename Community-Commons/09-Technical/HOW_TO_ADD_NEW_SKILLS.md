# How To Add New Skills

Quick reference for creating new MAIA skills.

---

## 5-Minute Skill Creation

### 1. Create Skill Directory

```bash
mkdir -p skills/YOUR-SKILL-NAME/prompts
cd skills/YOUR-SKILL-NAME
```

### 2. Create `meta.json` (Boot-time metadata)

```json
{
  "id": "your-skill-name",
  "version": "0.1.0",
  "tier": "FAST",
  "kind": "prompt",
  "category": "foundational",
  "enabled": true,
  "trustLevel": 3,
  "title": "Short Title",
  "description": "What this skill does in one sentence",
  "triggers": ["keyword1", "keyword2", "phrase to match"],
  "elements": ["water", "earth"],
  "realms": ["MIDDLEWORLD"]
}
```

**Fields:**
- `tier`: "FAST" (<2s), "CORE" (2-6s), "DEEP" (6-20s)
- `kind`: "prompt", "code", "hybrid"
- `category`: "foundational" (always available), "lineage" (developmental gates), "emergent" (explicit unlock)
- `trustLevel`: 1-5 (1=beta, 5=stable production)
- `triggers`: Keywords/phrases that increase selection score
- `elements`: Earth, Water, Fire, Air, Aether
- `realms`: UNDERWORLD, MIDDLEWORLD, UPPERWORLD_SYMBOLIC

### 3. Create `skill.json` (On-demand definition)

```json
{
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxBypassingScore": 0.5,
    "requiredStability": "stable",
    "allowedNervousSystemStates": ["window"],
    "requiresUnlock": false
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"],
    "shadowRiskFlags": ["spiritual_bypassing"],
    "hardRefusalMessageKey": "SKILL_DORSAL_REFUSAL"
  },
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  },
  "nextSkillHints": [
    "follow-up-skill-1",
    "follow-up-skill-2"
  ]
}
```

**Eligibility (all must pass):**
- `minCognitiveLevel`: 1-6 (Bloom's taxonomy level)
- `maxBypassingScore`: 0.0-1.0 (blocks spiritual/intellectual bypassing)
- `requiredStability`: "stable", "developing", "volatile", "unstable"
- `allowedNervousSystemStates`: "window", "sympathetic", "dorsal"
- `requiresUnlock`: true = check `skill_unlocks` table

**Contraindications (any blocks):**
- `nervousSystemStates`: States where skill is unsafe
- `shadowRiskFlags`: Patterns that contraindicate skill
- `hardRefusalMessageKey`: Key for refusal message lookup

### 4. Create `prompts/system.md`

```markdown
You are MAIA's **SKILL_NAME** skill.

## Purpose
[What this skill accomplishes]

## Strategy
1. [First step]
2. [Second step]
3. [Third step]

## Voice
[How to speak: direct, gentle, Socratic, etc.]

## What NOT to do
- Don't give advice
- Don't collapse polarity prematurely
- Don't spiritualize or intellectualize

## Context Available
- Element: {{ELEMENT}}
- Realm: {{REALM}}
- Tier: {{TIER}}
- Cognitive Level: {{COGNITIVE_LEVEL}}
- Nervous System: {{NERVOUS_SYSTEM_STATE}}
```

### 5. Create `prompts/user.md`

```markdown
**User's query:**
{{QUERY}}

**Context:**
- Current element: {{ELEMENT}}
- Developmental realm: {{REALM}}
- Processing tier: {{TIER}}
- Cognitive level: {{COGNITIVE_LEVEL}}
- Nervous system state: {{NERVOUS_SYSTEM_STATE}}

---

Respond using the **SKILL_NAME** strategy from the system prompt.
```

**Available template variables:**
- `{{QUERY}}` — User's input text
- `{{ELEMENT}}` — Current elemental attunement
- `{{REALM}}` — Developmental realm
- `{{TIER}}` — FAST/CORE/DEEP
- `{{COGNITIVE_LEVEL}}` — 1-6 (Bloom's)
- `{{NERVOUS_SYSTEM_STATE}}` — window/sympathetic/dorsal

---

## Example: Shadow Integration Skill

### `meta.json`
```json
{
  "id": "shadow-integration",
  "version": "0.1.0",
  "tier": "CORE",
  "kind": "prompt",
  "category": "lineage",
  "enabled": true,
  "trustLevel": 2,
  "title": "Shadow Integration",
  "description": "Re-integrates disowned material without spiritual bypassing",
  "triggers": ["shadow", "disowned", "projection", "what I hate about"],
  "elements": ["water", "earth"],
  "realms": ["UNDERWORLD", "MIDDLEWORLD"]
}
```

### `skill.json`
```json
{
  "eligibility": {
    "minCognitiveLevel": 4,
    "maxBypassingScore": 0.3,
    "requiredStability": "stable",
    "allowedNervousSystemStates": ["window"]
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal", "sympathetic"],
    "shadowRiskFlags": ["spiritual_bypassing", "intellectual_bypassing"],
    "hardRefusalMessageKey": "SHADOW_WORK_NOT_SAFE"
  },
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  },
  "nextSkillHints": ["somatic-check-in", "archetypal-dialogue"]
}
```

### `prompts/system.md`
```markdown
You are MAIA's **Shadow Integration** skill.

## Purpose
Help users reclaim disowned material (shadow) without:
- Spiritual bypassing ("it's all love")
- Intellectual bypassing ("I understand why I do this")
- Premature forgiveness ("I've let it go")

## Jung's Shadow Work Process
1. **Detection:** Notice what triggers strong aversion or attraction
2. **Ownership:** "This quality I see 'out there' is also in me"
3. **Grounding:** Feel the discomfort without spiritualizing
4. **Integration:** Hold the tension until something new emerges

## Strategy
1. **Name the projection:** "You see X quality in [person/situation]"
2. **Ask for ownership:** "Where might this quality live in YOU?"
3. **Prevent bypass:** If they intellectualize or transcend, redirect to body/feeling
4. **Hold tension:** Don't resolve—let integration happen organically

## Voice
- Direct, grounded, Jungian
- No platitudes ("everything happens for a reason")
- No advice ("you should...")
- Socratic questions that create discomfort

## What NOT to do
- Don't spiritualize ("this is your teacher")
- Don't analyze ("this comes from your childhood")
- Don't resolve ("now you can let it go")
```

### `prompts/user.md`
```markdown
**User's query:**
{{QUERY}}

**Context:**
- Current element: {{ELEMENT}}
- Nervous system: {{NERVOUS_SYSTEM_STATE}} (must be 'window' for shadow work)
- Cognitive level: {{COGNITIVE_LEVEL}} (you're at Level 4+, ready for this work)

---

Use the Shadow Integration process:
1. Name the projection they're experiencing
2. Ask where this quality lives in THEM
3. If they bypass (spiritualize/intellectualize), redirect to feeling/body
4. Hold the tension—don't offer resolution
```

---

## Testing Your Skill

### 1. Add to filesystem
```bash
# Skill files should now exist
ls -la skills/your-skill-name/
```

### 2. Sync to database
```bash
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
npx tsx -e "
  import { loadSkillMetas, syncSkillsToRegistry } from './lib/skills/loader';
  import path from 'node:path';
  const loaded = await loadSkillMetas(path.join(process.cwd(), 'skills'));
  await syncSkillsToRegistry(loaded);
  console.log('✅ Synced', loaded.length, 'skills');
"
```

### 3. Test selection
```bash
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
npx tsx -e "
  import { runSkillRuntime } from './lib/skills/runtime';
  import path from 'node:path';
  const result = await runSkillRuntime({
    skillsRoot: path.join(process.cwd(), 'skills'),
    ctx: {
      userId: 'test',
      sessionId: 'test',
      queryText: 'YOUR TEST QUERY HERE',
      state: { tierAllowed: 'CORE', cognitiveLevel: 4, nervousSystemState: 'window' }
    },
    renderWithModel: async (sys, usr) => '[MOCK RESPONSE]',
    refusalMessage: (key) => 'Refusal: ' + key
  });
  console.log('Selected:', result?.skillId, '| Outcome:', result?.outcome);
"
```

### 4. Test end-to-end
```bash
# Enable skills
export SKILLS_ENABLED=1

# Start dev server
npm run dev

# Send test query
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "input": "YOUR TEST QUERY HERE"
  }'
```

---

## Skill Selection Algorithm

Skills are scored based on:

1. **Tier match** (+10 if tier ≤ allowed, -100 if blocked)
2. **Trigger match** (+20 if query contains trigger keyword)
3. **Element match** (+8 if current element in skill's elements)
4. **Realm match** (+6 if current realm in skill's realms)
5. **Category bonus** (+15 for foundational, +10 for lineage, +5 for emergent)

**Example scoring:**
```
User: "I feel stuck between two choices" (CORE tier allowed, Level 3, window state)

dialectical-scaffold:
  +10 tier allowed (CORE ≤ CORE)
  +20 trigger match ("stuck between")
  +10 lineage category
  = 40 points (selected!)

elemental-checkin:
  +10 tier allowed (FAST ≤ CORE)
  +0 no trigger match
  +15 foundational category
  = 25 points (runner-up)
```

---

## Common Patterns

### Regulation Skill (FAST, Foundational)
```json
{
  "tier": "FAST",
  "category": "foundational",
  "triggers": ["overwhelmed", "anxious", "stressed"],
  "eligibility": {
    // No requirements—always safe
  },
  "contraindications": {
    // None—regulation is always appropriate
  }
}
```

### Developmental Skill (CORE, Lineage)
```json
{
  "tier": "CORE",
  "category": "lineage",
  "triggers": ["shadow", "stuck", "paradox"],
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxBypassingScore": 0.5,
    "allowedNervousSystemStates": ["window"]
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal", "sympathetic"],
    "shadowRiskFlags": ["spiritual_bypassing"]
  }
}
```

### Initiatory Skill (DEEP, Emergent)
```json
{
  "tier": "DEEP",
  "category": "emergent",
  "triggers": ["archetype", "symbolic", "numinous"],
  "eligibility": {
    "minCognitiveLevel": 5,
    "requiredStability": "stable",
    "requiresUnlock": true  // Must be explicitly unlocked
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal", "sympathetic"],
    "shadowRiskFlags": ["spiritual_bypassing", "psychotic_features"]
  }
}
```

---

## Refusal Messages

When a skill hard-refuses, map the refusal key to mythic messaging:

```typescript
// In lib/sovereign/maiaService.ts integration
refusalMessage: (keyOrReason: string) => {
  const mapping: Record<string, string> = {
    'SHADOW_WORK_NOT_SAFE': 'Shadow work needs grounded presence. Let's regulate your nervous system first.',
    'DIALECTIC_REQUIRES_REGULATION': 'You're in a state that needs tending before we can hold complexity together.',
    'SKILL_DORSAL_REFUSAL': 'Your system is in shutdown. Text won't help right now—you need embodied support.',
  };
  return mapping[keyOrReason] || "Let's take the safest next step together.";
}
```

---

## Next Steps After Creation

1. **Monitor usage** — Check `skill_usage_events` for selection frequency
2. **Gather feedback** — Add user ratings to `skill_feedback`
3. **Refine prompts** — Iterate based on real responses
4. **Detect patterns** — Watch for co-occurrence with other skills
5. **Propose agents** — If skill clusters emerge, create new archetype

---

## Skill Lifecycle

```
1. CREATION     → Write meta.json, skill.json, prompts
2. TESTING      → Test locally with mock data
3. BETA         → enabled=true, trustLevel=1 (limited rollout)
4. PRODUCTION   → trustLevel=3-5 (general availability)
5. REFINEMENT   → Update prompts based on usage
6. EVOLUTION    → Detect co-occurrence → propose new agent
7. DEPRECATION  → enabled=false (superseded by agent)
```

---

## Checklist for New Skills

- [ ] `meta.json` created with all required fields
- [ ] `skill.json` defines eligibility + contraindications
- [ ] `prompts/system.md` explains strategy clearly
- [ ] `prompts/user.md` uses template variables correctly
- [ ] Skill tested locally with `runSkillRuntime()`
- [ ] Skill synced to `skills_registry` table
- [ ] End-to-end test with real MAIA query
- [ ] Refusal message mapped (if has contraindications)
- [ ] Documentation added to this file (if new pattern)

---

**Adding skills is easy. Knowing when NOT to use them is the art.**
