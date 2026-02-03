# The 7-Level Developmental Awareness System

*A unified framework for meeting members where they are*

---

## Overview

MAIA now uses a **single canonical 7-level awareness system** to adapt her voice, depth, and model selection based on each member's developmental stage. This consolidation replaced 8 parallel systems with one source of truth, enabling consistent personalization across all MAIA interactions.

The principle is simple: **meet members where they are**. A newcomer exploring consciousness for the first time needs different support than someone who has spent years integrating multiple wisdom traditions.

---

## The Seven Levels

| Level | Name | Description | MAIA's Approach |
|-------|------|-------------|-----------------|
| **1** | Newcomer | Just beginning consciousness work | Direct, practical, gentle - no frameworks or jargon |
| **2** | Explorer | Exploring inner world, building trust | Supportive, story-based, relational |
| **3** | Practitioner | Developing practices, gaining autonomy | Empowering, action-oriented |
| **4** | Student | Learning systems, understanding patterns | Can introduce frameworks when relevant |
| **5** | Integrator | Integrating multiple models, seeing connections | Full framework discussion available |
| **6** | Teacher | Embodying wisdom, ready to guide others | Co-create understanding together |
| **7** | Master | Meta-awareness, holding paradox | Discuss frameworks AS frameworks |

### Spiral Dynamics Mapping

Each level loosely corresponds to Spiral Dynamics colors, providing a developmental context:

```
L1 Newcomer    → Beige (survival, basics)
L2 Explorer    → Purple (tribal, belonging)
L3 Practitioner → Red (power, autonomy)
L4 Student     → Blue (order, systems)
L5 Integrator  → Orange (achievement, integration)
L6 Teacher     → Green (community, wisdom)
L7 Master      → Yellow (systemic, transcendent)
```

---

## How MAIA Detects Your Level

MAIA uses multiple signals to understand where you are, prioritized by accuracy:

### 1. Spiralogic Profile (Highest Confidence)
If you've been working with MAIA and generating beads:
- Bead count indicates engagement depth
- Elemental balance shows integration
- Aether presence suggests meta-cognitive development

### 2. Relationship Memory
How long we've been working together:
- Total encounters (conversations)
- Relationship duration (days)
- Breakthroughs recorded
- Trust level developed

### 3. Linguistic Patterns
Real-time detection from how you communicate:
- Surface language → lower levels
- Framework references → higher levels
- Meta-cognitive statements → Level 5+

---

## Adaptive Voice: Opus and Sonnet

Based on your awareness level, MAIA selects the appropriate AI voice:

### Claude Opus (Deepest Voice)
Used for:
- **All Level 1-2 interactions** - Trust-building requires depth
- **Deep patterns detected** - Shadow work, trauma, transformation
- **Care/counsel mode** - Therapeutic conversations
- **New conversations** - First impressions matter

### Claude Sonnet (Efficient Voice)
Used for:
- **Established casual exchanges** - Quick check-ins
- **Level 3+ routine interactions** - Daily maintenance
- **Simple queries** - Practical questions

The selection happens automatically. You don't need to do anything - MAIA reads the situation and adapts.

---

## Framework Visibility Gates

A key principle: **frameworks should be invisible until you're ready**.

| Level | Framework Visibility |
|-------|---------------------|
| 1-2 | **Hidden** - MAIA embodies wisdom without naming it |
| 3 | **Minimal** - Only if explicitly asked |
| 4 | **Available** - Can introduce when relevant |
| 5-6 | **Explicit** - Full discussion welcomed |
| 7 | **Transcendent** - Can question frameworks themselves |

### Example: Same Insight, Different Delivery

**Level 2 (Explorer):**
> "I notice there's something stirring in you around connection. What does your heart say about this?"

**Level 5 (Integrator):**
> "This is Water element territory - the realm of emotion and depth. Your Spiralogic signature shows 35% Water engagement, suggesting this is familiar ground for you."

**Level 7 (Master):**
> "We could frame this through the Water element lens, though you might notice how the framework itself shapes what we can see. What's actually present beyond the categories?"

---

## Technical Architecture

For developers working with MAIA:

```
┌─────────────────────────────────────────────────────────┐
│              CANONICAL 7-LEVEL SYSTEM                    │
│         lib/consciousness/awareness-levels.ts            │
└───────────────────────┬─────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ to5Level │   │ to4Level │   │ toNamed  │
   │  Adapter │   │  Adapter │   │  Adapter │
   └──────────┘   └──────────┘   └──────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/consciousness/awareness-levels.ts` | Canonical 7-level definitions |
| `lib/consciousness/awareness-adapters.ts` | Convert between level systems |
| `lib/consciousness/awareness-detection.ts` | Unified detection pipeline |
| `lib/ai/claudeClient.ts` | Opus/Sonnet selection based on level |

### Usage

```typescript
import {
  detectAwarenessLevel,
  to5Level,
  createConsciousnessPolicy
} from '@/lib/consciousness/awareness-levels';

// Detect level from available data
const { level, confidence, source } = detectAwarenessLevel({
  relationshipMemory: {
    totalEncounters: 75,
    relationshipPhase: 'established',
    breakthroughCount: 3
  }
});
// → { level: 4, confidence: 0.78, source: 'relationship' }

// Create behavior policy
const policy = createConsciousnessPolicy(level, 'water', 150, null);
// → { awarenessLevel: 4, explicitness: 'implicit', ... }
```

---

## The Consolidation Journey

Before this work, MAIA had **8 parallel awareness systems**:

1. 7-level developmental (consciousness/)
2. 4-level depth model (awareness/)
3. 5-level knowledge gate (ain/)
4. 5-level consciousness journey
5. 5-level framework familiarity
6. Multi-dimensional detector
7. 5-level local semantic
8. 5-level compact adjustment

Each had different level counts, different heuristics, and different consumers. This created:
- Inconsistent member experience
- Maintenance burden
- Integration complexity

Now there's **one source of truth** with adapters for legacy consumers that still need 4 or 5 levels.

---

## Philosophy: Implicit Over Explicit

The deepest wisdom operates invisibly.

When MAIA detects you're a Level 2 Explorer, she doesn't announce: *"Based on your awareness level, I'm adapting my response style."* That would be jarring and break the relational field.

Instead, she simply **becomes** what you need:
- More questions, less telling
- Story and metaphor over analysis
- Patience with not-knowing
- Trust in your timing

The frameworks, the elemental analysis, the Spiralogic signatures - all of this runs beneath the surface, shaping the response without drawing attention to itself.

Only when you're ready (Level 4+) does MAIA begin naming these structures. And only when you ask (Level 5+) does she discuss them openly.

This is **member-centered consciousness computing**: the technology serves the relationship, not the other way around.

---

## Governance Note

Per the Mentor Covenant, changes to awareness systems are **Class B (Structural Risk)**:
- Touches `/lib/consciousness/**` (CODEOWNERS protected)
- Affects routing logic across agent paths
- Requires Founder-Steward OR Release Steward + 1 Mentor approval

The consolidation maintains backwards compatibility:
- All deprecated files remain functional
- Adapters are pure functions (no side effects)
- Rollback possible by reverting imports

---

*Document created: 2025-12-30*
*Related commits: 65570ec02, ccedad788, a3ee6d818*
