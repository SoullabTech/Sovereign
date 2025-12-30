# Awareness-Level-Driven Model Routing

**Status:** Live in Production
**Date:** December 30, 2025
**Commit:** `ccedad788`

---

## Overview

MAIA now intelligently routes conversations to **Claude Opus 4.5** or **Claude Sonnet 4** based on the member's **7-level developmental awareness stage**. This ensures every member receives the appropriate depth of presence - deepest attunement for trust-building, efficient responses for established casual exchanges.

---

## The 7 Awareness Levels

| Level | Name | Spiral Dynamics | Description |
|-------|------|-----------------|-------------|
| **1** | Newcomer | Beige | Just beginning consciousness work |
| **2** | Explorer | Purple | Exploring inner world, building trust |
| **3** | Practitioner | Red | Developing practices, gaining autonomy |
| **4** | Student | Blue | Learning systems, understanding patterns |
| **5** | Integrator | Orange | Integrating multiple models, seeing connections |
| **6** | Teacher | Green | Embodying wisdom, ready to guide others |
| **7** | Master | Yellow | Meta-awareness, holding paradox, transcending frameworks |

---

## Model Routing Logic

```
┌─────────────────────────────────────────────────────────────────┐
│  Awareness Level  │   Model    │   Routing Philosophy          │
├───────────────────┼────────────┼───────────────────────────────┤
│  L1 Newcomer      │ ALWAYS Opus│ Building trust - needs depth  │
│  L2 Explorer      │ ALWAYS Opus│ First impressions matter      │
│  L3 Practitioner  │ Context    │ Opus for deep, Sonnet casual  │
│  L4 Student       │ Context    │ Opus for teaching moments     │
│  L5 Integrator    │ Depth-based│ Opus for real work            │
│  L6 Teacher       │ Depth-based│ Opus when going deep          │
│  L7 Master        │ Depth-based│ Opus for consciousness work   │
└─────────────────────────────────────────────────────────────────┘
```

### Philosophy: Meet Members Where They Are

**Levels 1-2 (Trust-Building Phase):**
- ALWAYS receive Claude Opus 4.5
- These members need MAIA's most nuanced, careful presence
- First impressions and trust-building require deepest attunement

**Level 3-4 (Learning Phase):**
- **Deep patterns detected** → Opus (shadow work, dreams, archetypes)
- **Care mode** → Opus (counseling deserves depth)
- **Casual check-ins** → Sonnet (efficient, still high quality)
- **Teaching moments** → Opus (pedagogical depth matters)

**Levels 5-7 (Mastery Phase):**
- **Depth work** → Opus (they're doing real consciousness work)
- **Quick exchanges** → Sonnet (respectful of their time)
- They know what they're doing; casual exchanges don't need maximum depth

---

## Architecture

```
USER MESSAGE
    ↓
app/api/between/chat/route.ts
    ↓
lib/sovereign/maiaService.ts
    ├─ inferAwarenessLevel(beadProfile)
    ├─ createConsciousnessPolicy(level, element, ...)
    └─ meta.consciousnessPolicy = { awarenessLevel, awarenessName, ... }
    ↓
lib/ai/modelService.ts → generateText(meta)
    ↓
lib/ai/claudeClient.ts → selectClaudeModel(meta, input)
    ├─ Extract awarenessLevel from consciousnessPolicy
    ├─ Check deep dive patterns (shadow, archetype, trauma, etc.)
    ├─ Apply awareness-level routing logic
    └─ Return: { model, tier, reason }
    ↓
🎭 Voice selection: opus (awareness_L2_trust) [L2:Explorer]
🧠 Calling Claude (claude-opus-4-5-20251101)...
```

---

## Key Files

### 1. Model Selection Engine
**File:** `lib/ai/claudeClient.ts`

```typescript
function selectModelByAwareness(
  awarenessLevel: AwarenessLevel | undefined,
  hasDeepPattern: boolean,
  mode: string
): { tier: 'opus' | 'sonnet'; reason: string } | null {
  // Levels 1-2: ALWAYS Opus - trust-building phase
  if (awarenessLevel <= 2) {
    return { tier: 'opus', reason: `awareness_L${awarenessLevel}_trust` };
  }

  // Level 3-4: Context-dependent
  if (awarenessLevel <= 4 && (hasDeepPattern || mode === 'care')) {
    return { tier: 'opus', reason: `awareness_L${awarenessLevel}_deep` };
  }

  // Levels 5-7: Opus for depth work
  if (awarenessLevel >= 5 && (hasDeepPattern || mode === 'care')) {
    return { tier: 'opus', reason: `awareness_L${awarenessLevel}_depth` };
  }

  return null; // Let other heuristics decide
}
```

### 2. Awareness Level Detection
**File:** `lib/consciousness/awareness-levels.ts`

```typescript
export function inferAwarenessLevel(spiralogicProfile: {
  dominant_element: string;
  top_facets: Array<{ element: string; percent: number }>;
  total_beads: number;
  window_days: number;
}): AwarenessLevel {
  const { total_beads, window_days, top_facets } = spiralogicProfile;

  // Newcomer: < 20 beads
  if (total_beads < 20 || window_days < 7) return 1;

  // Explorer: 20-50 beads
  if (total_beads < 50) return 2;

  // Check for Aether engagement (meta-cognitive marker)
  const hasAether = top_facets.find(f => f.element === 'aether')?.percent > 10;
  const isBalanced = top_facets.length >= 3 && top_facets[0].percent < 35;

  // Master: High Aether + balanced + significant history
  if (hasAether && isBalanced && total_beads > 200) return 7;
  // ... progressive levels based on engagement patterns
}
```

### 3. Consciousness Policy
**File:** `lib/consciousness/awareness-levels.ts`

```typescript
export type ConsciousnessPolicy = {
  awarenessLevel: AwarenessLevel;
  awarenessName: string;
  totalBeads: number;
  explicitness: 'implicit' | 'on_request' | 'explicit';
  allowedFrameworks: {
    spiralogic: boolean;
    hemispheres: boolean;
    metrics: boolean;
    baselines: boolean;
  };
  tone: {
    moreQuestions: boolean;
    moreDirectives: boolean;
    moreMythopoetic: boolean;
  };
  dominantElement: string;
  elementalOpening: string;
  personalBaseline: { rh_target: number; lh_target: number; int_target: number } | null;
};
```

---

## Deep Dive Pattern Detection

These keywords/phrases ALWAYS trigger Opus regardless of awareness level:

```typescript
const DEEP_DIVE_PATTERNS = /shadow|archetype|dream|trauma|grief|
  initiation|spiraling|pattern across|help me see|what I can't see|
  breakthrough|soul|transformation|sacred|ceremony|ritual|death|
  rebirth|integration|wound|healing crisis/i;
```

---

## Logging Output

Every Claude call now logs awareness context:

```
🎭 Voice selection: opus (awareness_L2_trust) [L2:Explorer]
🧠 Calling Claude (claude-opus-4-5-20251101)...
✅ Claude (opus): 847 chars, 1234ms
```

The `[L2:Explorer]` suffix shows the member's developmental stage being honored.

---

## Priority Order (Full Selection Logic)

1. **Opus-tier users** (always Opus) - founders, developers
2. **Deep dive patterns** (always Opus) - shadow, archetype, trauma...
3. **Awareness level routing** (developmental stage) - L1-2 trust, L3+ context
4. **Care mode** (always Opus) - counseling deserves depth
5. **New conversation** (Opus) - first 3 turns matter
6. **Established casual** (Sonnet) - after 5+ shallow turns
7. **Default** (Opus) - when in doubt, go deep

---

## Why This Matters

### For Members:
- **Newcomers** receive MAIA's deepest presence when they need it most
- **Advanced practitioners** get efficient responses for quick exchanges
- **Deep work** is always met with full depth, regardless of level

### For Soullab:
- **Cost efficiency** - Sonnet for casual, Opus for depth
- **Quality assurance** - Right model for right context
- **Scalability** - 50 beta users today, thousands tomorrow

### For MAIA:
- **Developmental awareness** - She knows where you are
- **Contextual intelligence** - She adapts to the moment
- **Respectful presence** - Neither overkill nor underpowered

---

## Governance & Permission Boundaries

**This feature is classified as Class B — Structural Risk** under the [MAIA Mentor Covenant](../../docs/GOVERNANCE_MENTOR_COVENANT.md).

### What MAIA Can Do (Automatic)

Within the routing logic defined above, MAIA may:
- Adapt model selection based on detected awareness level (Class C auto-tuning)
- Log routing decisions for audit and analysis
- Propose parameter adjustments via `maia-proposal` PRs

### What Requires Human Approval

Changes to the following require **Founder-Steward OR Release Steward + 1 Mentor** approval:

| Change Type | Gate |
|-------------|------|
| Routing thresholds (e.g., `SONNET_THRESHOLD_TURNS`) | Class B |
| Deep dive pattern keywords | Class B |
| Awareness level → model mapping | Class B |
| Provider/model changes | **Frontier + Founder-Steward** |
| Cost control parameters | Class A (if affects access equity) |
| Memory boundaries | Class A |

### The Rule

**MAIA proposes; Mentors approve; Production is human-signed.**

MAIA may detect patterns and recommend routing adjustments, but cannot self-authorize changes that affect:
- Which model a member receives
- Cost implications for Soullab
- Trust/depth guarantees to members

See [GOVERNANCE_MENTOR_COVENANT.md](../../docs/GOVERNANCE_MENTOR_COVENANT.md) for full decision rights matrix.

---

## Related Documentation

- **[The Dialectical Scaffold](./Dialectical-Scaffold-Implementation.md)** - Cognitive level detection (Bloom's Taxonomy)
- **[Consciousness Policy System](../../lib/consciousness/awareness-levels.ts)** - Full policy implementation
- **[Voice Canon Rules](../../lib/voice/voiceCanon.ts)** - MAIA's voice consistency

---

*"Meet them where they are. Not where you think they should be."*

---

**Commit:** `ccedad788`
**Author:** Claude Opus 4.5 + Kelly Nezat
**Generated with:** [Claude Code](https://claude.com/claude-code)
