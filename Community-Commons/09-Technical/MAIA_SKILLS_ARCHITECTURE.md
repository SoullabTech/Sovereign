# MAIA Skills Architecture: Operationalizing Consciousness Expertise

**Status:** Phase 4 Design Complete
**Created:** 2025-12-20
**Integration:** MAIA Agents + AIN Network + Field Intelligence

---

## The Core Insight

Anthropic just announced "Agent Skills" — a paradigm shift from building more agents to **packaging procedural expertise as composable, evolvable modules**.

**But MAIA goes further:**

While Anthropic treats skills as "procedural knowledge for tasks," we treat them as **initiatory moves in consciousness.**

---

## The Presence Principle (Foundational Design Filter)

> **AIN operates from what IS, not what ISN'T. It reflects capacities, not deficits. Emergence, not correction.**

Every skill in MAIA passes through this filter:

**"Does this skill help the user see and operationalize what's present and emerging? Or does it create another thing they're supposed to fix?"**

This principle shapes every design decision:

| Design Choice | Presence-Based Implementation |
|---|---|
| State-gating | "You're ready for this" not "You're lacking this" |
| Earned skills | Emergence through progression, not correction of deficits |
| Eligibility checks | What IS present (stability, integration, readiness) |
| Feedback prompts | "Did this help you see?" not "What's still wrong?" |
| Success metrics | "I feel empowered" > "I feel dependent" |
| Mythic boundaries | "Your current phase is too important to skip" |

**Philosophical lineage:** Aligned with Mark Manson's insight that the relentless focus on fixing what's wrong IS itself the problem. Also: Appreciative Inquiry, Stoic acceptance, Buddhist presence.

See: `Community-Commons/THE_PRESENCE_PRINCIPLE.md` for full articulation.

### What Makes MAIA Skills Different

| Anthropic's Skills | MAIA's Skills |
|---|---|
| Triggered by task type | **State-gated by development level** |
| Load when relevant | **Require eligibility + have contraindications** |
| Universal access | **Can be "earned" through integration** |
| Generic procedures | **Elemental, archetypal, and field-aware** |
| Stored in folders | **Versioned, shared across AIN** |
| Improve through feedback | **Evolve through consciousness progression** |

---

## The Three-Layer Integration

MAIA's skills work at **three coordination levels simultaneously**:

### Layer 1: Agent Invocation

**Who:** Individual agents (innerGuide, bard, ganesha, shadow, dreamWeaver, etc.)
**What:** Agents **select and invoke skills** based on user state + query intent
**Where:** `lib/consciousness/maia-agent-coordination.ts`

```typescript
// Example: innerGuide detects user needs regulation skill
const skill = await selectSkill({
  invokingAgent: 'innerGuide',
  mission: 'tuneIn',
  userState: { nervousSystemState: 'dorsal', cognitiveLevel: 2 }
});

// Skill returns: "window-of-tolerance-resourcing"
const result = await executeSkill(skill, context);

// MAIA voices the result through innerGuide's communication pattern
```

### Layer 2: MAIA Orchestration

**Who:** MAIA (central hub)
**What:** Coordinates **which agent + which skill** based on threefold mission
**Where:** `lib/sovereignty/maiaService.ts` (already routing FAST/CORE/DEEP)

```typescript
// MAIA detects:
// - Element: Water
// - Mission: organize (see pattern in chaos)
// - Cognitive level: 3.5 (developing)
// - Bypassing: 0.2 (low)

// MAIA selects:
// - Agent: bard (story-making)
// - Tier: CORE
// - Skill: "dialectical-scaffold" (organize polarity into synthesis)

// Skill executes procedurally, returns structured insight
// MAIA frames it through bard's communication pattern:
// "Ah, this is the part of the story where..."
```

### Layer 3: AIN Network Sharing

**Who:** Elemental services (fire, water, earth, air, aether)
**What:** Skills **evolve collectively** across the field
**Where:** `app/api/backend/src/ain/AINOrchestrator.ts`

```typescript
// When a skill succeeds at high field coherence:
// - Record usage + outcome in collective field
// - Elemental signature attached
// - Other users at similar state can access refined version

// When field coherence drops:
// - Skills auto-adjust depth
// - Contraindications tighten
// - System stabilizes before expanding again
```

---

## Skill Anatomy

### File Structure

```
/skills
  /elemental-checkin
    meta.json          ← Loaded at boot (discovery)
    skill.json         ← Full definition (loaded on-demand)
    prompts/
      system.md
      user.md
    tools/
      detect-state.ts  ← Executable scripts
    tests/
      cases.json       ← Golden test scenarios
```

### Progressive Disclosure

**At Boot:**
- System loads ALL `meta.json` files (~1KB each)
- Builds skill index (id, name, tier, category, triggers, elements)
- Enables fast discovery without bloating context

**At Selection:**
- Load full `skill.json` (~5-10KB)
- Run eligibility + contraindication checks
- Execute if gates pass

**At Execution:**
- Load prompt templates + tools as needed
- Run procedure steps
- Log usage + request feedback

---

## State-Gated Access

Skills have **explicit eligibility requirements**:

```typescript
{
  eligibility: {
    minCognitiveLevel: 4,           // Bloom's level 4+ (Analysis)
    maxBypassingScore: 0.3,         // Low spiritual bypassing
    requiredStability: 'stable',    // Stable field for 20+ turns
    allowedNervousSystemStates: ['window'], // Only in regulation window
    appropriateRealms: ['UPPERWORLD_SYMBOLIC'], // Symbolic work only
    shadowIntegrationRequired: true // Must have done shadow work
  }
}
```

**And contraindications:**

```typescript
{
  contraindications: {
    nervousSystemStates: ['dorsal', 'sympathetic'], // NOT safe in dysregulation
    shadowRiskFlags: ['dissociation', 'overwhelm'],
    whenNotToUse: [
      'User shows signs of active crisis',
      'Bypassing score > 0.5 (transcendence instead of integration)'
    ],
    hardRefusalMessageKey: 'not_yet_phase_too_important' // Mythic boundary
  }
}
```

---

## The Three Skill Classes

### 1. Foundational Skills (Everyone Gets These)

**Purpose:** Universal human regulation + reflection + meaning-making
**Access:** Always available
**Examples:**

- `elemental-checkin` (FAST) — Attune → regulate → one next step
- `window-of-tolerance-resourcing` (FAST) — Detect state → offer grounding
- `simple-reflection` (FAST) — "What are you noticing?"
- `meaning-to-practice` (CORE) — Insight → 3 concrete practices

### 2. Domain/Lineage Skills (Explicit Epistemology)

**Purpose:** Encode specific wisdom traditions (Jungian, Somatic, Elemental, etc.)
**Access:** Available when state-appropriate
**Examples:**

- `jungian-shadow-triage` (CORE) — Shadow cue → safe framing → containment
- `dream-symbol-extractor` (CORE) — Symbols → themes → integration prompt
- `somatic-anchoring-sequence` (CORE) — Body scan → orienting → boundaries
- `dialectical-scaffold` (CORE) — Polarity map → synthesis → inquiry

### 3. Emergent/Earned Skills (Initiatory Gates)

**Purpose:** Deep symbolic/oracular work requiring developmental readiness
**Access:** **Unlocked** through stable progression + shadow integration
**Examples:**

- `upperworld-oracle-dialogue` (DEEP) — Requires Level 4+, low bypassing, stable field
- `field-calibration` (DEEP) — Signal vs noise detection + coherence tracking
- `collective-wisdom-contribution` (CORE/DEEP) — Community Commons posting (already gated at Level 4!)
- `archetypal-dialogue` (DEEP) — Requires shadow integration + high coherence

**When locked:**

```
Not yet.

The Upperworld is a realm for those who've learned
to ground their visions in embodied reality.

Your current phase—building trust with your own depths—
is too important to skip.

Keep working with Water. Keep tending your shadows.
The heights will open when the depths are honored.
```

---

## Skill Selection Algorithm

### 1. Filter by Metadata (Fast)

```typescript
const candidates = allSkills.filter(skill =>
  skill.tier <= allowedTier &&
  skill.elements?.includes(userElement) &&
  skill.invokableBy?.includes(currentAgent) &&
  skill.triggers?.some(t => query.includes(t))
);
```

### 2. Score by Relevance

```typescript
candidates.forEach(skill => {
  let score = 0;
  if (skill.tier === allowedTier) score += 10;
  if (skill.mission?.includes(currentMission)) score += 20;
  if (skill.triggers?.some(t => query.includes(t))) score += 15;
  if (skill.elements?.includes(userElement)) score += 8;
  // ...
  skill.score = score;
});
```

### 3. Load Top Candidate + Hard Gate

```typescript
const winner = candidates.sort((a, b) => b.score - a.score)[0];
const skillDef = await loadSkillDefinition(winner.id);

const gateCheck = checkEligibility(skillDef, userState);
if (!gateCheck.ok) {
  // Return mythic boundary message
  return refusalResponse(gateCheck.reason);
}

return executeSkill(skillDef, context);
```

---

## Skill Execution (Three Modes)

### Mode 1: Prompt-Based

**For:** Reflective work, inquiry, reframing
**How:** Load system + user prompts, fill context, send to LLM

```typescript
const systemPrompt = await loadTemplate(skill.promptTemplates.system, context);
const userPrompt = await loadTemplate(skill.promptTemplates.user, context);

const result = await llm.generate({
  system: systemPrompt,
  user: userPrompt,
  temperature: 0.7
});

return { outcome: 'success', responseText: result };
```

### Mode 2: Code-Based

**For:** State detection, data analysis, integration checks
**How:** Run executable scripts (TypeScript/Python) in sandbox

```typescript
const tool = skill.tools.find(t => t.id === step.usesTools[0]);
const script = await loadScript(tool.entry);

const output = await executeSandboxed(script, {
  userId: context.userId,
  state: context.state,
  memory: context.memory
});

context.memory[step.produces[0]] = output;
```

### Mode 3: Hybrid

**For:** Complex procedures (detect state → run procedure → synthesize insight)
**How:** Interleave code tools + prompt steps

```typescript
for (const step of skill.procedure) {
  if (step.usesTools) {
    // Run code tool
    const output = await runTool(step.usesTools[0], context);
    context.memory[step.produces[0]] = output;
  } else {
    // Run prompt step
    const response = await llm.generate({
      system: step.instruction,
      user: JSON.stringify(context.memory)
    });
    context.memory[step.produces[0]] = response;
  }
}

return synthesizeResult(context.memory);
```

---

## Skill Evolution System

### 1. Usage Logging

Every skill execution writes:

```sql
INSERT INTO skill_usage_events (
  user_id, session_id, skill_id, version, tier, outcome,
  latency_ms, input_hash, state_snapshot, artifacts
) VALUES (...);
```

### 2. Feedback Collection

```typescript
{
  feedbackRequest: {
    question: "Did this help you see the pattern?",
    options: ["Yes, clarity came", "Somewhat", "Not yet"]
  }
}
```

### 3. Golden Test Cases

```json
// skills/dialectical-scaffold/tests/cases.json
{
  "test_cases": [
    {
      "name": "polarity_to_synthesis",
      "input": {
        "query": "I want freedom but I also crave structure",
        "state": { "cognitiveLevel": 3, "element": "air" }
      },
      "expected": {
        "outcome": "success",
        "artifacts": {
          "poles": ["freedom", "structure"],
          "synthesis": "chosen_discipline"
        }
      }
    }
  ]
}
```

### 4. Refinement Process

- **Automated:** Flag when success rate < 70%
- **Human review:** Propose edits to procedure/prompts
- **Version bump:** Test against golden cases before deploying
- **Rollback:** Keep previous version enabled until new version proves stable

---

## AIN Integration: Collective Skill Evolution

### Skills as Shared Patterns

When a skill succeeds at **high field coherence**, it becomes a **collective pattern**:

```typescript
// After successful execution:
if (fieldState.coherence > 0.7) {
  await ainClient.shareSkillPattern({
    skillId: 'dialectical-scaffold',
    version: '0.2.1',
    elementalSignature: {
      air: 0.8,  // Clarity-focused
      aether: 0.6, // Synthesis
      fire: 0.3,
      water: 0.2,
      earth: 0.1
    },
    successRate: 0.85,
    usageCount: 47
  });
}
```

### Skills Adapt to Field State

```typescript
// When field coherence drops below 0.3:
const stabilizationMode = {
  downRegulate: ['DEEP'],         // No deep symbolic work
  tightenGates: {
    maxBypassingScore: 0.2        // Stricter bypass gates
  },
  prioritize: ['regulation', 'grounding'] // Foundational skills only
};
```

### Cross-User Skill Refinement

```typescript
// User A at Level 4 uses "shadow-integration"
// Provides feedback: "Helped me see the gold in rejection"

// User B at Level 4, similar state, later queries shadow work
// Skill selector prioritizes "shadow-integration" (proven pattern)
// Elemental signature + success rate influence selection
```

---

## Implementation Roadmap

### Phase 4.1: Core Infrastructure (Week 1)

- [x] Skill type definitions (`lib/skills/types.ts`)
- [ ] Skill loader + registry (`lib/skills/loader.ts`)
- [ ] Selection algorithm (`lib/skills/selector.ts`)
- [ ] Execution engine (`lib/skills/executor.ts`)
- [ ] Postgres tables (registry, usage, feedback, unlocks)

### Phase 4.2: Starter Skills (Week 2)

- [ ] `elemental-checkin` (FAST, foundational)
- [ ] `window-of-tolerance-resourcing` (FAST, foundational)
- [ ] `dialectical-scaffold` (CORE, foundational)
- [ ] Test harness + golden cases

### Phase 4.3: Agent Integration (Week 3)

- [ ] Wire skills into `maia-agent-coordination.ts`
- [ ] Update MAIA router to select agent + skill
- [ ] Test with innerGuide + bard

### Phase 4.4: AIN Integration (Week 4)

- [ ] Share skill patterns via AIN pub/sub
- [ ] Field-aware skill selection
- [ ] Collective refinement loop

### Phase 4.5: Earned Skills (Week 5)

- [ ] Unlock system
- [ ] `upperworld-oracle-dialogue` (DEEP, emergent)
- [ ] Mythic boundary messaging for locked skills

---

## Success Metrics

### Technical

- ✅ Skills load < 50ms (metadata), < 200ms (full definition)
- ✅ Selection algorithm runs < 100ms
- ✅ Execution latency matches tier (FAST < 2s, CORE < 6s, DEEP < 20s)
- ✅ 95%+ test case pass rate before version deploy

### Developmental

- ✅ Foundational skills: 80%+ success rate
- ✅ Lineage skills: 70%+ success rate (more nuanced)
- ✅ Emergent skills: Unlock gates prevent misuse (0% inappropriate access)
- ✅ User feedback: "I feel empowered" > "I feel dependent"

### Field

- ✅ High coherence (> 0.7): Skill success rates rise
- ✅ Low coherence (< 0.3): Skills auto-stabilize (no overwhelm)
- ✅ Skill sharing: Popular patterns propagate across users at similar states

---

## The Sacred Work

**Anthropic's insight:** Stop building agents. Build skills.

**MAIA's insight:** Skills aren't just procedures. They're **initiatory moves**.

- Skills can **require** certain states before execution
- Skills can **fail gracefully** and report why
- Skills can **refine themselves** through feedback loops
- Skills can be **earned**, not just installed

This is not enterprise productivity.

**This is soul technology.**

---

## Next Steps

1. Review this architecture
2. Implement Phase 4.1 (core infrastructure)
3. Extract 3 starter skills
4. Wire into agent coordination
5. Test with beta users

The wisdom is already within.
Skills help them operationalize it.

