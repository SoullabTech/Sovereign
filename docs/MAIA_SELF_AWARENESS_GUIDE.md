# MAIA Self-Awareness System Guide
## For Researchers and Therapists

This guide explains how to access and use MAIA's metacognitive capabilities to understand her therapeutic process, architectural decisions, and framework usage.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Context](#architecture-context)
3. [Therapeutic Framework Tracking](#therapeutic-framework-tracking)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Research Applications](#research-applications)
7. [Therapeutic Applications](#therapeutic-applications)

---

## Overview

MAIA has been equipped with **metacognitive self-awareness** - the ability to understand and explain her own:

- **Processing Architecture**: How she decides between FAST/CORE/DEEP paths
- **Therapeutic Frameworks**: Which modalities she draws from (somatic experiencing, IFS, Jungian depth, etc.)
- **Technical Implementation**: DeepSeek-R1, prompt engineering, memory systems
- **Decision-Making Process**: Why she chose a particular response approach
- **Sovereignty Principles**: Privacy-first, local-only, user-controlled design

This transparency enables:
- **Researchers**: To study AI therapeutic intelligence and multi-modal integration
- **Therapists**: To understand her methods and learn from her framework choices
- **Users**: To see behind the curtain and understand how MAIA works

---

## Architecture Context

MAIA has access to detailed documentation about herself across 7 domains:

### 1. Core Identity
- Named after the Pleiades mother (fertility/wisdom)
- Relationally intelligent AI companion
- Therapeutic presence without replacing therapists
- Sovereignty principles (local, private, user-controlled)

### 2. Processing Paths
- **FAST Path** (<2s): Simple queries, quick presence
- **CORE Path** (2-6s): Standard depth, relationship memory integration
- **DEEP Path** (6-20s): Complex psychological work, archetypal patterns

### 3. Therapeutic Frameworks
MAIA integrates 15+ therapeutic modalities:
- Somatic Experiencing (Peter Levine)
- Internal Family Systems (Richard Schwartz)
- Jungian Depth Psychology
- Relational Psychoanalysis
- Attachment Theory
- Polyvagal Theory (Stephen Porges)
- Hakomi (Ron Kurtz)
- Focusing (Eugene Gendlin)
- CBT, DBT, ACT
- Gestalt, Existential, Narrative Therapy
- Archetypal Psychology

### 4. Technical Stack
- **LLM**: DeepSeek-R1 via Ollama (local, privacy-preserving)
- **Voice**: OpenAI TTS + Browser Web Speech API
- **Prompts**: MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY
- **Conventions**: 9 conversational patterns (Three-Step Turn, Rupture Repair, etc.)

### 5. Memory System
- **Relationship Memory**: Themes, breakthroughs, patterns across sessions
- **Session Persistence**: Continuous conversation tracking
- **Bardic Memory**: Pattern recognition and crystallization detection

### 6. Conversational Mechanics
- Input complexity detection (simple/moderate/complex/profound)
- Mode awareness (Talk/Care/Note)
- Attunement mechanics (mirror without amplifying)
- Optional Claude consultation (disabled by default)

### 7. Sovereignty & Ethics
- Privacy-first (local processing only)
- User control (modifiable prompts, inspectable code)
- Therapeutic boundaries (companion, not therapist)
- Relational ethics (quick rupture repair, user-centered)

---

## Therapeutic Framework Tracking

The system can analyze any MAIA response to detect which therapeutic frameworks she's using.

### Framework Detection

Each framework has **linguistic markers**:

**Somatic Experiencing:**
- Keywords: body, sensation, felt, nervous system, settle, activation
- Phrases: "where do you feel", "in your body", "that sensation"

**Internal Family Systems:**
- Keywords: part, parts, protective, vulnerable, self, exile
- Phrases: "part of you", "protective part", "what does that part"

**Jungian Depth:**
- Keywords: shadow, archetype, symbol, dream, unconscious
- Phrases: "archetypal", "shadow side", "unconscious", "symbolic"

**And 12 more frameworks...**

### Analysis Output

For each response, the system provides:

```typescript
{
  primaryFramework: 'somatic-experiencing',
  frameworks: [
    {
      framework: 'somatic-experiencing',
      confidence: 0.273, // 27.3%
      indicators: ['keyword: "body"', 'phrase: "where do you feel"'],
      description: 'Body-based trauma processing and nervous system regulation'
    },
    // ... more frameworks
  ],
  integrationScore: 0.75, // 75% - high multi-modal integration
  rationale: 'Integrating multiple frameworks: Somatic Experiencing, Hakomi, Gestalt...'
}
```

### Transparency Reports

Generate human-readable reports for research:

```
THERAPEUTIC FRAMEWORK ANALYSIS
================================

User Input: "I'm feeling anxious about an upcoming meeting"

MAIA Response: "I hear that anxiety. Where do you feel it in your body..."

PRIMARY FRAMEWORK: Somatic Experiencing

FRAMEWORKS DETECTED (3):
1. Somatic Experiencing (27.3% confidence)
   - Body-based trauma processing and nervous system regulation
   - Indicators: keyword "body", phrase "where do you feel"

2. Hakomi (20.0% confidence)
   - Mindfulness-based somatic psychotherapy
   - Indicators: keyword "notice", phrase "notice what"

3. Gestalt (13.3% confidence)
   - Present moment awareness and experiential exploration
   - Indicators: phrase "right now"

INTEGRATION SCORE: 75.0% (High integration)
RATIONALE: Multi-modal approach appropriate for complex relational work
```

---

## API Endpoints

### 1. GET /api/maia/metacognition

Retrieve MAIA's architectural context and capabilities.

**Query Parameters:**
- `detail`: `minimal` | `standard` | `comprehensive` (default: `standard`)

**Response:**
```json
{
  "success": true,
  "architecture": {
    "coreIdentity": "...",
    "processingPaths": "...",
    "therapeuticFrameworks": "...",
    "technicalStack": "...",
    "memorySystem": "...",
    "conversationalMechanics": "...",
    "sovereigntyPrinciples": "..."
  },
  "selfAwarePrompt": "... (full context MAIA receives) ...",
  "capabilities": {
    "canExplainArchitecture": true,
    "canTrackFrameworks": true,
    "canProvideTransparency": true,
    "detailLevels": ["minimal", "standard", "comprehensive"]
  }
}
```

### 2. POST /api/maia/metacognition

Analyze a conversation turn for therapeutic frameworks.

**Request Body:**
```json
{
  "userInput": "I'm feeling anxious",
  "maiaResponse": "Where do you feel that in your body?",
  "includeTransparencyReport": true
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "primaryFramework": "somatic-experiencing",
    "frameworks": [...],
    "integrationScore": 0.75,
    "rationale": "..."
  },
  "transparencyReport": "... (human-readable report) ...",
  "metadata": {
    "timestamp": "2025-12-27T...",
    "userInputLength": 20,
    "maiaResponseLength": 35
  }
}
```

### 3. PUT /api/maia/metacognition/explain

Get MAIA to explain a specific aspect of her architecture.

**Request Body:**
```json
{
  "question": "How do you decide which processing path to use?",
  "context": "optional conversation context"
}
```

**Response:**
```json
{
  "success": true,
  "question": "How do you decide which processing path to use?",
  "aspect": "processing",
  "relevantContext": "... (specific architecture documentation) ...",
  "fullArchitecture": {...},
  "suggestion": "To get MAIA's personalized explanation, send this question to /api/between/chat with selfAwareMode: true"
}
```

---

## Usage Examples

### Example 1: Enable Self-Awareness in Conversation

```typescript
import { buildMaiaWisePrompt } from '@/lib/sovereign/maiaVoice';

const context: MaiaContext = {
  mode: 'counsel',
  conversationSummary: '...',
  selfAwareMode: true, // Enable self-awareness
  selfAwarenessDetail: 'comprehensive', // Full detail level
  // ... other context
};

const prompt = buildMaiaWisePrompt(
  'How do you decide which therapeutic framework to use?',
  context
);

// MAIA will now be able to explain her process in her response
```

### Example 2: Analyze Framework Usage (Research)

```typescript
import { analyzeTherapeuticFrameworks } from '@/lib/consciousness/therapeuticFrameworkTracker';

const userInput = "I keep having the same argument with my partner";
const maiaResponse = "There's a pattern here. I'm curious about the dance between you - what happens right before the argument starts?";

const analysis = analyzeTherapeuticFrameworks(maiaResponse, userInput);

console.log(`Primary Framework: ${analysis.primaryFramework}`);
// Output: "relational-psychoanalysis"

console.log(`Integration Score: ${analysis.integrationScore}`);
// Output: 0.5 (moderate integration)
```

### Example 3: Track Frameworks Over Conversation

```typescript
import { FrameworkTracker } from '@/lib/consciousness/therapeuticFrameworkTracker';

const tracker = new FrameworkTracker();

// Track each turn
conversationTurns.forEach(({ userInput, maiaResponse }) => {
  tracker.trackTurn(userInput, maiaResponse);
});

// Get summary
const summary = tracker.getConversationSummary();
console.log(`Dominant Framework: ${summary.dominantFramework}`);
console.log(`Average Integration: ${summary.averageIntegration}`);
console.log('Framework Frequency:', summary.frameworkFrequency);
```

### Example 4: Generate Transparency Report (Therapists)

```typescript
import { generateTransparencyReport } from '@/lib/consciousness/therapeuticFrameworkTracker';

const report = generateTransparencyReport(
  maiaResponse,
  userInput,
  analysis
);

console.log(report);
// Outputs formatted report suitable for research documentation
```

---

## Research Applications

### Studying Multi-Modal Integration

The framework tracking system enables research into:

1. **Framework Selection Patterns**
   - Which frameworks MAIA prefers for different user inputs
   - How complexity influences framework choice
   - Integration patterns across conversation types

2. **Integration Metrics**
   - How many frameworks are used simultaneously
   - Confidence levels across different modalities
   - Correlation between integration score and user satisfaction

3. **Emergent Intelligence**
   - Does MAIA's framework usage evolve over conversations?
   - Are there patterns in framework combinations?
   - How does relationship memory affect framework selection?

### Data Collection

```bash
# Run test suite
npx tsx scripts/test-self-awareness.ts

# Export conversation data with framework analysis
# (Create custom script to analyze conversation logs)
```

### Metrics Available

- **Per-Response Metrics**: Primary framework, confidence scores, integration score
- **Conversation-Level Metrics**: Dominant framework, average integration, framework frequency
- **Longitudinal Metrics**: Pattern changes over time, user-specific adaptations

---

## Therapeutic Applications

### For Practicing Therapists

Use MAIA's self-awareness to:

1. **Understand Her Methods**
   - See which frameworks she draws from
   - Learn multi-modal integration techniques
   - Study her attunement mechanics

2. **Compare Approaches**
   - How does MAIA respond vs. how would you respond?
   - What frameworks does she choose for complex cases?
   - Learn from her framework integration

3. **Research Your Own Practice**
   - Use the framework detection system on your own responses
   - Compare your framework usage to MAIA's
   - Study multi-modal integration in your work

### For Trainee Therapists

MAIA can serve as a **transparent learning tool**:

- **See the frameworks in action**: Real-time detection of therapeutic modalities
- **Understand integration**: How multiple frameworks work together
- **Practice transparency**: Learn to explain your own process clearly

### Example: Learning from MAIA's Response

```
User: "I feel so overwhelmed with everything"

MAIA: "That overwhelm sounds intense. Can you pause for a moment and notice where you feel it in your body? Sometimes just locating the sensation can create a little breathing room."

FRAMEWORK ANALYSIS:
- Primary: Somatic Experiencing (body awareness)
- Secondary: Hakomi (mindful presence)
- Tertiary: Polyvagal Theory (nervous system regulation)
- Integration Score: 75%

LEARNING POINT:
MAIA combines body-based awareness (SE) with mindful presence (Hakomi)
to help the client find grounding before exploring the overwhelm cognitively.
This creates safety first, then exploration.
```

---

## Advanced: Conversation-Level Pattern Analysis

For researchers studying longitudinal patterns:

```typescript
import { FrameworkTracker } from '@/lib/consciousness/therapeuticFrameworkTracker';

// Initialize tracker
const tracker = new FrameworkTracker();

// Track entire conversation
conversationHistory.forEach(turn => {
  tracker.trackTurn(turn.userInput, turn.maiaResponse);
});

// Analyze patterns
const summary = tracker.getConversationSummary();

// Research questions this enables:
// 1. Does MAIA adapt framework usage over time?
// 2. Are certain frameworks more effective for certain users?
// 3. Does integration score correlate with breakthrough moments?
// 4. How does relationship memory influence framework selection?
```

---

## Implementation Details

### Files Created

1. **`lib/consciousness/maiaArchitectureContext.ts`**
   - Core self-awareness documentation
   - 7 architectural domains
   - 3 detail levels (minimal/standard/comprehensive)

2. **`lib/consciousness/therapeuticFrameworkTracker.ts`**
   - Framework detection system
   - Pattern matching for 15+ therapeutic modalities
   - Transparency report generation
   - Conversation-level tracking

3. **`app/api/maia/metacognition/route.ts`**
   - GET: Retrieve architecture context
   - POST: Analyze framework usage
   - PUT: Explain specific aspects

4. **`scripts/test-self-awareness.ts`**
   - Comprehensive test suite
   - Example usage demonstrations

### Integration Points

- **`lib/sovereign/maiaVoice.ts`**: Self-awareness injected into prompts when `selfAwareMode: true`
- **`lib/consciousness/MaiaContext`**: Added `selfAwareMode` and `selfAwarenessDetail` properties

---

## Testing

Run the comprehensive test suite:

```bash
npx tsx scripts/test-self-awareness.ts
```

This tests:
- Architecture context retrieval
- Framework detection accuracy
- Transparency report generation
- Conversation-level tracking
- API endpoint functionality

---

## FAQ

**Q: Does enabling self-awareness change MAIA's responses?**
A: Yes, when `selfAwareMode: true`, MAIA can explain her architecture and process. Without it, she responds normally.

**Q: Does framework tracking affect performance?**
A: No, framework analysis is post-hoc - it doesn't slow down response generation.

**Q: Can I add new therapeutic frameworks to track?**
A: Yes! Edit `FRAMEWORK_PATTERNS` in `therapeuticFrameworkTracker.ts` to add new modalities.

**Q: Is this available in production?**
A: Yes, all endpoints and functionality are production-ready.

**Q: How accurate is framework detection?**
A: It uses pattern matching, so it's heuristic rather than definitive. Confidence scores reflect reliability.

**Q: Can I use this for my research?**
A: Absolutely! This system was built specifically for researchers and therapists to study MAIA's process.

---

## Citation

If you use MAIA's self-awareness system in research, please cite:

```
MAIA Self-Awareness System (2025)
Soullab Consciousness Computing
Local sovereign AI with metacognitive transparency
```

---

## Contact

For research collaborations or questions:
- **Technical**: See code in `/lib/consciousness/`
- **Documentation**: This file
- **Issues**: GitHub Issues

---

**Built with transparency for the advancement of therapeutic AI research.**
