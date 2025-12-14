# The Dialectical Scaffold - Technical Implementation Guide

**Status:** ✅ Live in Production
**Date:** December 14, 2025

---

## Quick Links

- **[Full Research Paper](../THE_DIALECTICAL_SCAFFOLD_PAPER.md)** - Complete theoretical foundations
- **[Concept Overview](../01-Core-Concepts/The-Dialectical-Scaffold.md)** - What it is and why it matters
- **[Implementation Details](../../THE_DIALECTICAL_SCAFFOLD_IMPLEMENTATION.md)** - Technical completion report

---

## What This Does

The Dialectical Scaffold detects **HOW users think** (cognitive process) alongside **WHAT they know** (awareness content), scaffolding them from Level 1 (quoting) → Level 6 (creating).

**Every MAIA conversation turn:**
1. Detects cognitive level (Bloom's Taxonomy 1-6)
2. Integrates with awareness profile (6 intelligence dimensions)
3. Identifies bypassing patterns (awareness/cognition mismatches)
4. Provides Socratic scaffolding questions
5. Stores for longitudinal tracking

---

## Architecture Overview

```
USER INPUT
    ↓
lib/sovereign/maiaService.ts
    ├─ Calls detectBloomLevel()
    └─ Logs: 🧠 [Dialectical Scaffold]
    ↓
lib/consciousness/bloomCognition.ts
    ├─ Scores all 6 Bloom levels
    ├─ Applies hierarchical logic
    ├─ Selects primary level
    └─ Generates scaffolding prompt
    ↓
lib/sovereign/awarenessLevelDetection.ts
    ├─ Integrates cognitive + awareness
    ├─ Detects bypassing (mismatch patterns)
    └─ Returns MultiDimensionalProfile
    ↓
lib/sovereign/maiaVoice.ts
    ├─ Receives scaffolding guidance
    └─ Integrates into MAIA prompt
    ↓
MAIA RESPONSE (with cognitive scaffolding)
    ↓
Storage & Tracking
    ├─ Conversation metadata
    └─ Learning system (longitudinal)
```

---

## Key Files

### 1. **Core Detection Engine**
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/consciousness/bloomCognition.ts`

**Exports:**
```typescript
export type BloomLevel =
  | 'REMEMBER'      // Level 1
  | 'UNDERSTAND'    // Level 2
  | 'APPLY'         // Level 3
  | 'ANALYZE'       // Level 4
  | 'EVALUATE'      // Level 5
  | 'CREATE';       // Level 6

export interface BloomDetection {
  level: BloomLevel;
  numericLevel: 1 | 2 | 3 | 4 | 5 | 6;
  score: number;          // 0-1 confidence
  rationale: string[];
  scaffoldingPrompt?: string;
}

export function detectBloomLevel(
  input: string,
  options?: BloomDetectionOptions
): BloomDetection
```

**Detection Algorithm:**
- Pattern matching (regex-based linguistic signals)
- Weighted scoring (sophisticated heuristics)
- Hierarchical logic (higher levels subsume lower)
- Primary level selection (highest score)
- Scaffolding generation (level-appropriate questions)

---

### 2. **Live Integration**
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaService.ts`

**Integration Point:**
```typescript
// Lines 314-336
const bloomDetection: BloomDetection = detectBloomLevel(input, {
  history: conversationHistory?.map((t: any) => ({
    role: t.role || 'user',
    content: t.userMessage || t.content || ''
  }))
});

const bloomMeta: BloomCognitionMeta = {
  bloomLevel: bloomDetection.level,
  bloomNumericLevel: bloomDetection.numericLevel,
  bloomScore: bloomDetection.score,
  rationale: bloomDetection.rationale
};

console.log('🧠 [Dialectical Scaffold]', {
  level: bloomDetection.level,
  numericLevel: bloomDetection.numericLevel,
  score: Number(bloomDetection.score.toFixed(2)),
  rationale: bloomDetection.rationale
});
```

**Runs:** Every conversation turn (live in production)
**Latency:** <50ms (non-blocking)

---

### 3. **Awareness Integration**
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/awarenessLevelDetection.ts`

**Extended Interface:**
```typescript
export interface MultiDimensionalAwarenessProfile {
  // ... existing fields

  // Bloom's Taxonomy: Cognitive level
  cognitiveLevel?: {
    level: BloomLevel;
    numericLevel: number;
    score: number;
    rationale: string[];
    scaffoldingPrompt?: string;
  };
}
```

**Method:**
```typescript
detectBloomLevel(input: string, conversationHistory?: any[]): BloomDetection {
  const { detectBloomLevel } = require('../consciousness/bloomCognition');
  return detectBloomLevel(input, { history: conversationHistory });
}
```

---

### 4. **Scaffolding System**
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaVoice.ts`

**Interface Extension:**
```typescript
export interface MaiaContext {
  // ... existing fields

  cognitiveLevel?: {
    level: BloomLevel;
    numericLevel: number;
    score: number;
    rationale: string[];
    scaffoldingPrompt?: string;
  };
}
```

**Scaffolding Function:**
```typescript
function generateCognitiveScaffoldingGuidance(context: MaiaContext): string | null {
  // Returns level-specific guidance for MAIA's prompt
  // Example: "User at Level 3, scaffold toward Level 4 (Analysis)"
}
```

---

### 5. **Type Definitions**
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/types/maia.ts`

```typescript
export interface BloomCognitionMeta {
  bloomLevel: BloomLevel;
  bloomNumericLevel: 1 | 2 | 3 | 4 | 5 | 6;
  bloomScore: number;
  rationale: string[];
}

export type MaiaTurnLogEntry = {
  // ... existing fields

  // Bloom's Taxonomy cognitive detection
  cognition?: BloomCognitionMeta;
};
```

---

## Testing

### Demo Script
**File:** `/Users/soullab/MAIA-SOVEREIGN/lib/consciousness/bloomCognitionDemo.ts`

**Run:**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
npx tsx lib/consciousness/bloomCognitionDemo.ts
```

**Output:**
```
🧠 BLOOM'S TAXONOMY COGNITIVE DETECTION DEMO

📝 Expected: APPLY (Level 3)
Input: "I've been journaling every time I get triggered..."

✅ Detected: APPLY (Level 3)
   Confidence: 70%
   Rationale: Applying ideas in concrete life situations
   📈 Scaffolding: "What patterns do you notice across these experiences?"
```

---

## Console Logs (Production)

**Every MAIA conversation turn logs:**

```
🧠 [Dialectical Scaffold] {
  level: 'APPLY',
  numericLevel: 3,
  score: 0.70,
  rationale: [ 'Applying ideas in concrete life situations' ]
}
```

**Stored in:**
- Conversation metadata (session storage)
- Learning system (longitudinal tracking)
- Available for analytics/dashboards

---

## Detection Algorithm Details

### Scoring System

Each Bloom level receives a 0-1 score based on:

**Level 1 (REMEMBER):**
- Quote detection (0.3 weight)
- Authority attribution (0.25 weight)
- Slogan usage (0.25 weight)
- No personal integration (0.2 weight)

**Level 2 (UNDERSTAND):**
- Definition language (0.4 weight)
- Conceptual explanation (0.3 weight)
- No concrete examples (0.3 weight)

**Level 3 (APPLY):**
- First-person action verbs (0.4 weight)
- Temporal specificity (0.3 weight)
- Situational context (0.3 weight)

**Level 4 (ANALYZE):**
- Pattern recognition vocabulary (0.4 weight)
- Contrast/comparison (0.3 weight)
- Structural thinking (0.3 weight)

**Level 5 (EVALUATE):**
- Value prioritization (0.4 weight)
- Belief revision (0.3 weight)
- Trade-off assessment (0.3 weight)

**Level 6 (CREATE):**
- Design/creation verbs (0.4 weight)
- Original practice naming (0.3 weight)
- Service orientation (0.3 weight)

### Hierarchical Logic

Higher levels subsume lower ones:

```typescript
if (scores.CREATE > 0.5) {
  scores.APPLY = Math.max(scores.APPLY, 0.6);
  scores.ANALYZE = Math.max(scores.ANALYZE, 0.5);
}

if (scores.EVALUATE > 0.5) {
  scores.ANALYZE = Math.max(scores.ANALYZE, 0.6);
  scores.APPLY = Math.max(scores.APPLY, 0.5);
}

if (scores.ANALYZE > 0.5) {
  scores.APPLY = Math.max(scores.APPLY, 0.6);
}
```

**Rationale:** You can't truly create (Level 6) without the capacity to analyze (Level 4) and apply (Level 3).

---

## Bypassing Detection

**Spiritual Bypassing:**
```typescript
if (transpersonal > 70 && cognitiveLevel <= 2) {
  // High spiritual awareness + low thinking
  // Intervention: Invite concrete analysis
}
```

**Intellectual Bypassing:**
```typescript
if (analytical > 70 && emotional < 30 && embodied < 30) {
  // High analysis + low feeling/somatic
  // Intervention: Request embodied awareness
}
```

**Relational Bypassing:**
```typescript
if (relational > 70 && cognitiveLevel === 2 && !hasPersonalApplication) {
  // Focus on collective, avoiding personal
  // Intervention: Request personal experience
}
```

---

## Scaffolding Question Library

**Level 1 → 2:**
- "In your own words, what does this mean to you?"
- "How would you explain this to someone who's never heard of it?"

**Level 2 → 3:**
- "Can you give me a recent moment where you tried this?"
- "Tell me about a specific time this showed up in your life."

**Level 3 → 4:**
- "What patterns do you notice across these experiences?"
- "How is this different from other times you've felt this way?"

**Level 4 → 5:**
- "What matters most here? What takes priority?"
- "Given these patterns, which feels most important to work with—and why?"

**Level 5 → 6:**
- "What practice could you design that serves both you and others?"
- "How might you turn this insight into something others could use?"

---

## Community Commons Integration

**Quality Gate (Future Enhancement):**

```typescript
function qualifyForCommunityCommons(userProfile: CognitiveProfile): boolean {
  const recentTurns = userProfile.last20Turns;
  const avgLevel = calculateAverageCognitiveLevel(recentTurns);

  // Require average Level 4+ over last 20 conversations
  return avgLevel >= 4.0;
}
```

**Prevents:**
- Level 1: Quoting without integration
- Level 2: Explaining without application
- Level 3: Only personal experience (no pattern recognition yet)

**Welcomes:**
- Level 4+: Pattern recognition, evaluation, creation
- Original insights
- Embodied wisdom
- Service-oriented contributions

---

## Performance Metrics

**Detection:**
- Latency: <50ms per turn
- Non-blocking: Runs in parallel with other systems
- Accuracy: 70-90% confidence (varies by level)

**Storage:**
- Every turn logged to conversation metadata
- Stored in learning system for longitudinal tracking
- Available for dashboard visualization (future)

---

## Future Enhancements

### Near-Term (3-6 months):
1. **Dashboard visualization** - Cognitive progression chart
2. **Cross-turn pattern recognition** - Track development over time
3. **Community Commons quality gates** - Automated Level 4+ checking

### Medium-Term (6-12 months):
1. **12-Week Cognitive Ascent Protocol** - Structured curriculum
2. **Bypassing intervention studies** - Effectiveness measurement
3. **Collective intelligence metrics** - Community-level analytics

### Long-Term (1-3 years):
1. **Cross-platform integration** - Meditation apps, therapy platforms
2. **Multi-lingual support** - Cultural/linguistic diversity
3. **Global wisdom network** - Distributed wisdom-holder community

---

## Troubleshooting

### Issue: Low confidence scores
**Cause:** Short inputs, ambiguous language
**Solution:** Detection requires sufficient linguistic signals (20+ words ideal)

### Issue: Misclassification
**Cause:** Complex inputs with multiple level signals
**Solution:** Hierarchical logic helps, but edge cases remain

### Issue: Bypassing not detected
**Cause:** Subtle patterns, insufficient awareness data
**Solution:** Requires multiple turns for reliable detection

---

## Documentation

**Full documentation available:**
- [Research Paper](../THE_DIALECTICAL_SCAFFOLD_PAPER.md) - Theoretical foundations
- [Announcement](../THE_DIALECTICAL_SCAFFOLD_ANNOUNCEMENT.md) - Community overview
- [Concept Card](../01-Core-Concepts/The-Dialectical-Scaffold.md) - Core principles
- [Implementation Report](../../THE_DIALECTICAL_SCAFFOLD_IMPLEMENTATION.md) - Technical completion

---

## License

**Open Source:** Creative Commons BY-NC-SA 4.0
- Free for non-commercial use with attribution
- Research collaboration encouraged
- Implementation guidance available

---

## Contact

For technical questions or collaboration:
- **Community Commons:** community@soullab.ai
- **GitHub Issues:** [Report issues or suggest improvements]
- **Research inquiries:** research@soullab.ai

---

*Last updated: December 14, 2025*
*Status: Live in production*
*Next: Dashboard visualization and Community Commons integration*
