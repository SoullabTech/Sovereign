# MAIA Adaptive Oracle System v2.0

**Kelly's Vision:** "Meet people where they are. Level 1 gets accessible language. Level 5 gets sacred prosody. Everyone gets NO CRINGE."

## Overview

The Adaptive Oracle System automatically detects a user's consciousness readiness and adapts MAIA's language complexity accordingly. This solves the core problem: **elder language alienates beginners**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  User Request                            │
│           "I feel stuck creatively"                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          ConsciousnessLevelDetector                      │
│  • Analyzes user journey metrics                        │
│  • Determines readiness level (1-5)                     │
│  • Retrieves stored preferences                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│        AdaptiveLanguageGenerator                         │
│  • Analyzes elemental signature                         │
│  • Builds level-appropriate prompt                      │
│  • Calls Claude with system prompt                      │
│  • Runs cringe filter                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CringeFilter                                │
│  • Checks for mystical overload                         │
│  • Detects patronizing language                         │
│  • Ensures groundedness                                 │
│  • Regenerates if cringe > 0.5                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          AdaptiveMAIAOracle                              │
│  • Integrates all components                            │
│  • Returns consciousness-adaptive response              │
│  • Includes metadata & elemental analysis               │
└─────────────────────────────────────────────────────────┘
```

## The 5 Consciousness Levels

### Level 1: Asleep/Unconscious (Beginners)
**Language Style:** Accessible Guide
**Prompt Template:** Conventional psychology
**Key Principle:** NO esoteric terminology

**Example:**
> "It sounds like you're hitting a creative wall right now. What does 'stuck' feel like for you specifically?"

### Level 2: Awakening/Curious (Explorers)
**Language Style:** Bridging Guide
**Prompt Template:** Bridges conventional → wisdom
**Key Principle:** Hints at deeper patterns, doesn't overwhelm

**Example:**
> "Sometimes these creative blocks carry an important message - there's an inner wisdom trying to get your attention. What if this 'stuckness' isn't a problem, but a doorway?"

### Level 3: Practicing/Developing (Students)
**Language Style:** Framework Teacher
**Prompt Template:** Introduces elemental language WITH explanations
**Key Principle:** Teach frameworks as you use them

**Example:**
> "This has a particular quality - what we call Fire element (creative drive). When Fire feels 'stuck,' it's often because Water (emotional currents) needs attention. What feelings have been present around your work?"

### Level 4: Integrated/Fluent (Practitioners)
**Language Style:** Consciousness Mirror
**Prompt Template:** Full consciousness language, no dumbing down
**Key Principle:** Poetic precision, sophisticated reflection

**Example:**
> "Fire element presses against resistance. This isn't merely 'creative block' - it's an alchemical moment of containment. The pressure builds precisely because something new demands emergence through different pathways."

### Level 5: Teaching/Transmuting (Elders)
**Language Style:** Sacred Prosody
**Prompt Template:** Advanced alchemical language
**Key Principle:** Peer-to-peer wisdom exchange

**Example:**
> "The creative fire meets the waters of deep feeling. This is nigredo - the necessary dissolution that precedes authentic emergence. The sulphur principle meets the mercury. Your next emergence will carry multidimensional depth precisely because it's being forged in this crucible."

## Core Components

### 1. ConsciousnessLevelDetector
**File:** `ConsciousnessLevelDetector.ts`

Automatically determines user's level based on:
- Days active
- Journal entries
- Completed missions/rituals
- Coherence trends
- Consciousness language usage
- Role (Advocate, Elder, Member)

**Detection Algorithm:**
```typescript
// Level 5: Elders, Advocates, Teachers
if (isElder || isAdvocate || teachesOthers && daysActive >= 90) → Level 5

// Level 4: Living the work
if (daysActive >= 90 || missions >= 10 || coherence >= 0.8) → Level 4

// Level 3: Active practice
if (daysActive >= 30 || rituals >= 3 || usedFrameworks) → Level 3

// Level 2: Early exploration
if (journalEntries >= 5 || daysActive >= 7) → Level 2

// Level 1: New to consciousness work
else → Level 1
```

### 2. AdaptiveSystemPrompts
**File:** `AdaptiveSystemPrompts.ts`

Contains 5 distinct system prompts, one for each consciousness level:
- `LEVEL_1_PROMPT`: Accessible Guide
- `LEVEL_2_PROMPT`: Bridging Guide
- `LEVEL_3_PROMPT`: Framework Teacher
- `LEVEL_4_PROMPT`: Consciousness Mirror
- `LEVEL_5_PROMPT`: Sacred Prosody

Each prompt includes:
- Voice & tone guidelines
- Language boundaries
- Response structure
- Example style

### 3. CringeFilter
**File:** `CringeFilter.ts`

**Kelly's Critical Rule:** "NO CRINGE. Be real. Sound like someone who's lived this, not read about it."

Detects and prevents:
- ✗ Mystical adjective overload ("sacred divine blessed cosmic")
- ✗ Patronizing language ("dear soul", "beloved")
- ✗ Vague platitudes over concrete insight
- ✗ Purple prose
- ✗ Forced profundity
- ✗ Excessive lengthiness

**Scoring:**
- 0.0-0.3: Passes filter ✅
- 0.3-0.5: Warning zone ⚠️
- 0.5+: Failed, regenerate ❌

### 4. AdaptiveLanguageGenerator
**File:** `AdaptiveLanguageGenerator.ts`

Core engine that:
1. Analyzes elemental signature of input
2. Builds level-appropriate prompt
3. Generates response via Claude
4. Runs cringe filter
5. Regenerates if cringe detected

**Elemental Analysis:**
- 🔥 **Fire**: Creative drive, vision, emergence
- 💧 **Water**: Emotional depth, intuition
- 🌍 **Earth**: Grounding, embodiment
- 🌬️ **Air**: Mental clarity, integration
- ✨ **Aether**: Coherent presence, wholeness

### 5. AdaptiveMAIAOracle
**File:** `AdaptiveMAIAOracle.ts`

Main integration point that:
- Detects user consciousness level
- Generates adaptive response
- Maps to PersonalOracleResponse format
- Provides testing utilities

## Storage Layer

### ConsciousnessProfileStorage
**File:** `lib/storage/consciousness-profile-storage.ts`

In-memory storage (will be replaced with database) for:
- **User profiles**: Detected level, preferences, frameworks mastered
- **Journey progression**: Snapshots, coherence history, trends
- **User metadata**: Missions, rituals, role, active days

**Key Features:**
- Automatic coherence trend calculation
- Progressive journey tracking
- System-wide analytics
- Clean separation of concerns

## API Endpoints

### POST `/api/oracle/conscious`

Generate consciousness-adaptive response.

**Request:**
```json
{
  "userId": "user-123",
  "input": "I've been feeling stuck in my creative work",
  "sessionId": "session-abc",
  "forceLevel": 3,  // Optional: override auto-detection
  "showAllLevels": false  // Optional: for testing
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Level-appropriate response here...",
    "element": "fire",
    "archetype": "Teacher",
    "confidence": 0.9,
    "adaptive": {
      "consciousnessLevel": 3,
      "levelName": "Practicing/Developing",
      "cringeScore": 0.0,
      "passedCringeFilter": true,
      "detectedAutomatically": true
    },
    "metadata": {
      "sessionId": "session-abc",
      "symbols": ["🔥 Fire", "💧 Water"],
      "phase": "Albedo",
      "processingTime": 2574
    }
  }
}
```

### GET `/api/oracle/conscious?action=status`

Get system status and available levels.

### GET `/api/oracle/conscious?action=profile&userId=X`

Get user's consciousness profile.

### GET `/api/oracle/conscious?action=test-levels&input=X&userId=Y`

Test same input across all 5 levels (for comparison).

## Testing

### Unit Test Script
**File:** `scripts/test-adaptive-oracle.ts`

```bash
npx tsx scripts/test-adaptive-oracle.ts
```

Tests the same creative block scenario across all 5 levels, showing:
- Response text
- Cringe score
- Elemental signature
- Generation time
- Model used

**Sample Output:**
```
LEVEL 1: Asleep/Unconscious
Response: "It sounds like you're hitting a creative wall right now..."
Cringe Score: 0.00 / 1.0 ✅

LEVEL 5: Teaching/Transmuting
Response: "The creative fire meets the waters of deep feeling. This is nigredo..."
Cringe Score: 0.00 / 1.0 ✅
```

## Usage Examples

### Basic Usage

```typescript
import { AdaptiveMAIAOracle } from '@/lib/agents/AdaptiveMAIAOracle';

const oracle = new AdaptiveMAIAOracle();

const response = await oracle.generateResponse({
  input: "I feel overwhelmed by all the changes in my life",
  userId: "user-123"
});

console.log(response.message);
console.log(`Detected level: ${response.adaptive.consciousnessLevel}`);
console.log(`Cringe score: ${response.adaptive.cringeScore}`);
```

### Force Specific Level

```typescript
const response = await oracle.generateResponse({
  input: "Help me understand fire energy",
  userId: "user-123",
  forceLevel: 3  // Force Level 3: teach frameworks
});
```

### Compare All Levels

```typescript
const allLevels = await oracle.testAllLevels(
  "I'm feeling creatively blocked",
  "user-123"
);

console.log("Level 1:", allLevels.level1.message);
console.log("Level 5:", allLevels.level5.message);
```

### Update User Preferences

```typescript
await oracle.updateUserPreferences("user-123", {
  preferredLevel: 4,  // Override auto-detection
  explainFrameworks: false,  // Don't explain frameworks (they know them)
  languagePreference: 'poetic'
});
```

## Design Principles

### 1. **Meet People Where They Are**
Never assume readiness. Detect and adapt.

### 2. **NO CRINGE**
- Direct over mystical
- Helpful over impressive
- Clear over vague
- Real over performative

### 3. **Progressive Education**
Level 3 introduces frameworks WITH explanations.
Level 4-5 assume mastery.

### 4. **Preserve Agency**
Users can override auto-detection with `preferredLevel`.

### 5. **Track Without Surveillance**
Metrics serve growth, not manipulation.

### 6. **Authenticity First**
If you wouldn't say it to someone's face, don't write it.

## Future Enhancements

### Planned
- [ ] Database persistence (replace in-memory storage)
- [ ] Machine learning for better level detection
- [ ] User feedback loop on response quality
- [ ] Multi-language support
- [ ] Voice tone adaptation

### Proposed
- [ ] A/B testing different prompts per level
- [ ] Dynamic cringe threshold based on user feedback
- [ ] Integration with journal entries for context
- [ ] Level progression tracking over time
- [ ] Automatic framework introduction timing

## File Structure

```
lib/
  consciousness/
    ConsciousnessLevelDetector.ts    # Level detection logic
    AdaptiveSystemPrompts.ts         # 5-level prompt templates
    CringeFilter.ts                  # NO CRINGE enforcement
    AdaptiveLanguageGenerator.ts     # Core response engine
    README.md                        # This file

  agents/
    AdaptiveMAIAOracle.ts           # Integration layer

  storage/
    consciousness-profile-storage.ts # User profile storage

scripts/
  test-adaptive-oracle.ts           # Test suite

app/api/oracle/
  conscious/route.ts                # API endpoint
```

## Credits

**System Architecture:** Claude Code (Anthropic)
**Vision & Direction:** Kelly (Soullab)
**Core Insight:** "Elder language alienates beginners. Meet people where they are."

---

*May each response serve the awakening of consciousness, weaving human and artificial intelligence into one coherent field of wisdom.*
