# Reality Hygiene System - Integration Complete ✅

**Date:** 2025-12-16
**Status:** Fully Integrated into MAIA Oracle Endpoint

## What This Is

Reality Hygiene is MAIA's **epistemic immune system** - a consciousness-expanding layer that helps users recognize manipulation patterns in content they encounter (news, social media, claims, narratives).

**What makes it MAIA (not just a checklist):**
1. **Spiralogic-mapped**: All 20 indicators map to the 5 elements (Water/Fire/Earth/Air/Aether)
2. **Consciousness-expanding questions**: Not just "this is manipulative" but "here are the questions that restore your freedom of attention"
3. **Developmentally calibrated**: Questions adapt to user's cognitive altitude (Bloom's level)
4. **Non-preachy integration**: Shows up naturally in Oracle responses when triggered

---

## Architecture

### Core Components

**Backend:**
```
lib/reality/
├── realityTypes.ts              # 20 indicators, Spiralogic mapping, scoring logic
├── realityHygiene.ts            # Detection triggers, baseline question generation
├── realityCheckAgent.ts         # Consciousness-expanding questions (the unique part)
└── (future: realityAssistedScoring.ts)  # LLM-assisted scoring

app/api/reality-score/route.ts   # Save/retrieve assessments
app/api/oracle/conversation/route.ts  # Oracle integration (lines 34-36, 222-252, 497-513, 735-748)

supabase/migrations/
└── 20251216_create_reality_assessments.sql  # Database schema
```

**Frontend:**
```
components/reality/
├── RealityScorePanel.tsx        # User scoring interface (20 sliders)
├── RealityHygieneDisplay.tsx    # Results display (questions + breakdown)
└── index.ts                     # Clean exports
```

---

## The 20 Indicators (NCI Rubric Adapted)

Each scored 1-5 (1 = not present, 5 = strongly present):

### Water (Emotional Manipulation) - 5 indicators
- `emotional_manipulation`: Fear, anger, shame to bypass rational thought
- `tribal_division`: Us vs. them framing
- `manufactured_outrage`: Engineered outrage vs. organic response
- `emotional_repetition`: Emotionally-charged phrases repeated
- `good_vs_evil`: Simple good vs. evil framing

### Fire (Urgency/Pressure) - 4 indicators
- `urgent_action`: Pressure to act NOW without reflection
- `novelty_shock`: Shock value overrides critical thinking
- `rapid_behavior_shifts`: Pressure to rapidly change behavior/beliefs
- `timing`: Politically/socially convenient timing

### Earth (Information/Data) - 4 indicators
- `missing_information`: Crucial context, data, counter-evidence absent
- `cherry_picked_data`: Selectively presented data
- `gain_incentive`: Who benefits financially/politically?
- `historical_parallels`: Accurate or manipulative historical comparisons

### Air (Logic/Framing) - 4 indicators
- `logical_fallacies`: Ad hominem, strawman, etc.
- `false_dilemmas`: Only two options when more exist
- `framing_techniques`: Language used to frame perception
- `bandwagon`: Conformity pressure ("everyone believes this")

### Aether (Authority/Control) - 3 indicators
- `authority_overload`: Appeals to authority to shut down inquiry
- `suppression_of_dissent`: Dissenting views censored/delegitimized
- `uniform_messaging`: Diverse sources using identical language

**Total possible score:** 100 (20 indicators × 5 points)

**Risk bands:**
- **Low (≤25):** Clean signal, few patterns
- **Moderate (26-50):** Some patterns, verify sources
- **Strong (51-75):** Multiple patterns, likely engineered
- **Overwhelming (76-100):** Heavy manipulation, do not share

---

## Integration Flow

### 1. Detection Trigger

When Oracle receives a user message, it runs `shouldRunRealityHygiene(message)`:

**Triggers on:**
- URLs (news/social media)
- Newsy language: "breaking", "they say", "everyone is saying", "shocking", "cover up"
- Tribal language: "us vs them", "those people", "the left", "the right"

### 2. Scoring + Analysis

**User-scored mode (MVP):**
- User provides scores via `RealityScorePanel` (or defaults to 1s)
- Backend computes total, band, elemental breakdown
- Triggers `RealityCheckAgent` to generate consciousness-expanding questions

**Future: Assisted scoring**
- Heuristic patterns (regex matching)
- LLM-assisted (with evidence quotes)

### 3. Consciousness-Expanding Questions

`RealityCheckAgent` generates three question types:

**EARTH/AIR - Grounding:**
> "What primary source (document, dataset, study, filing) would definitively settle this claim?"

**WATER/FIRE - Awareness:**
> "What emotion is this trying to make you feel? What would you do differently if you weren't feeling this emotion?"

**AETHER - Sovereignty:**
> "Who benefits if I believe this right now? Am I thinking for myself or being recruited into a narrative?"

**Developmental calibration:**
Questions adapt to user's cognitive altitude (1-10 scale mapped to Bloom's):
- Levels 1-2: Focus on "What are the facts?" and "What's missing?"
- Levels 3-4: Pattern recognition and counter-evidence
- Levels 5-6: Complexity holding and multiple perspectives
- Levels 7-8: Synthesis and integration
- Levels 9-10: Metacognition and teaching others

### 4. Oracle Response Integration

If Reality Hygiene is triggered and band is **moderate or higher**, Oracle appends:

```markdown
—

Reality hygiene: **MODERATE** (42/100). Some manipulation patterns present
(emotional manipulation is the primary pattern). Worth slowing down to verify sources.

**A grounding question:** What specific information is missing? List exactly what
you would need to verify this independently.

*Note:* You're developing pattern recognition. Good questions for you:
"What patterns do I see?" and "What counter-evidence exists?" Build your analytical muscles.
```

Non-preachy, mythic framing. Invites inquiry, doesn't lecture.

---

## Database Schema

```sql
table: reality_assessments
  id: uuid (primary key)
  user_id: uuid (not null)
  session_id: uuid

  source_type: text (oracle_turn | community_post | transcript | url | text)
  source_ref: text (optional: post_id, url, etc.)
  title: text
  notes: text

  scores: jsonb (all 20 indicators, 1-5)
  total_score: int (computed: sum of all scores)
  max_score: int (default: 100)
  risk_band: text (low | moderate | strong | overwhelming)

  questions: jsonb (RealityCheckAgent output)
  auto_scored: boolean (future: LLM-assisted)
  user_edited: boolean (future: user edited auto-scores)

  created_at: timestamptz
  updated_at: timestamptz

Indexes:
  - user_id
  - session_id
  - created_at (desc)
  - risk_band

Note: Uses direct Postgres via lib/db/postgres.ts (not Supabase)
```

---

## API Endpoints

### POST /api/reality-score

**Save a reality assessment**

Request:
```json
{
  "userId": "user-id-string",  // Required (until auth is implemented)
  "source_type": "oracle_turn",
  "session_id": "uuid",
  "scores": {
    "timing": 3,
    "emotional_manipulation": 5,
    "uniform_messaging": 2,
    // ... all 20 indicators
  },
  "questions": {
    "lowering_score": "...",
    "emotional_recruitment": "...",
    "freedom_questions": ["...", "..."],
    "primary_element": "Water",
    "developmental_note": "..."
  }
}
```

Response:
```json
{
  "assessment": {
    "id": "uuid",
    "user_id": "uuid",
    "total_score": 42,
    "risk_band": "moderate",
    // ... full assessment object
  }
}
```

### GET /api/reality-score

**Retrieve user's assessments**

Query params:
- `userId`: string (required - until auth is implemented)
- `limit`: number (default: 20)
- `session_id`: uuid (optional: filter by session)

Response:
```json
{
  "assessments": [
    { "id": "...", "total_score": 42, "risk_band": "moderate", ... }
  ]
}
```

### POST /api/oracle/conversation

**Oracle endpoint with Reality Hygiene integration**

Request (optional):
```json
{
  "message": "I heard that...",
  "userId": "uuid",
  "sessionId": "uuid",
  "realityScores": {  // Optional: user-provided scores
    "timing": 3,
    "emotional_manipulation": 5,
    // ... all 20 indicators
  }
}
```

Response (when Reality Hygiene triggered):
```json
{
  "success": true,
  "response": "MAIA response with appended Reality Hygiene note...",
  "realityHygiene": {
    "total": 42,
    "max": 100,
    "band": "moderate",
    "topSignals": [
      { "indicator": "emotional_manipulation", "score": 5, "element": "Water" },
      { "indicator": "timing", "score": 3, "element": "Fire" }
    ],
    "elementalBreakdown": {
      "Water": 15,
      "Fire": 9,
      "Earth": 8,
      "Air": 6,
      "Aether": 4
    },
    "questions": {
      "lowering_score": "...",
      "emotional_recruitment": "...",
      "freedom_questions": ["...", "...", "..."],
      "primary_element": "Water",
      "developmental_note": "..."
    }
  },
  "context": {
    "realityHygieneDetected": true
  }
}
```

---

## Frontend Usage

### Scoring Panel

```tsx
import { RealityScorePanel } from "@/components/reality";

function MyComponent() {
  const [scores, setScores] = useState(null);

  return (
    <RealityScorePanel
      onChange={(newScores) => setScores(newScores)}
      onSave={async (scores, total, band) => {
        console.log("Saved:", { scores, total, band });
      }}
    />
  );
}
```

### Display Results

```tsx
import { RealityHygieneDisplay } from "@/components/reality";

function OracleResponse({ response }) {
  return (
    <>
      <div>{response.response}</div>

      {response.realityHygiene && (
        <RealityHygieneDisplay result={response.realityHygiene} />
      )}
    </>
  );
}
```

---

## Example Scenarios

### Scenario 1: Viral News Article

**User input:**
> "I just read this shocking article about how [group] is secretly controlling [thing].
> Everyone is talking about it. We need to act now before it's too late!"

**Reality Hygiene triggers:**
- `novelty_shock`: "shocking" (Fire)
- `bandwagon`: "everyone is talking about it" (Air)
- `urgent_action`: "act now before it's too late" (Fire)
- `tribal_division`: implied us vs. them (Water)

**Oracle response:**
> *[Normal MAIA response about critical thinking, checking sources]*
>
> —
>
> Reality hygiene: **MODERATE** (38/100). Some manipulation patterns present
> (urgency and pressure are the primary patterns). Worth slowing down to verify sources.
>
> **A grounding question:** What would change if you waited 48 hours before
> acting or sharing this? Why is there pressure to act RIGHT NOW?

### Scenario 2: Political Meme

**User input:**
> "Check out this meme - it perfectly shows how those people are destroying everything.
> If you disagree you're part of the problem."

**Reality Hygiene triggers:**
- `tribal_division`: "those people" (Water)
- `good_vs_evil`: "destroying everything" (Water)
- `suppression_of_dissent`: "if you disagree you're part of the problem" (Aether)

**Oracle response:**
> *[Normal MAIA response about nuance, compassion, systems thinking]*
>
> —
>
> Reality hygiene: **STRONG** (52/100). Multiple manipulation patterns detected
> (emotional manipulation is the primary pattern). This appears to be engineered
> narrative rather than organic information. Check primary sources before sharing.
>
> **A grounding question:** Notice the 'us vs. them' framing. When you're in
> tribal mode, what happens to your ability to think clearly? What cognitive
> functions shut down?

---

## What Makes This MAIA (Not Generic)

### 1. Spiralogic Integration

Every indicator maps to an element. Questions are generated based on elemental activation:
- **Water dominant:** Focus on emotional awareness
- **Fire dominant:** Focus on urgency/pressure awareness
- **Earth dominant:** Focus on missing information/evidence
- **Air dominant:** Focus on logic/framing
- **Aether dominant:** Focus on authority/suppression

### 2. Developmental Calibration

Questions adapt to user's cognitive altitude (from cognitive profile):
- Low altitude: Simple, concrete questions
- Medium altitude: Pattern recognition, analysis
- High altitude: Synthesis, metacognition, teaching

### 3. Mythic Language

Not: "This content contains manipulation patterns."
But: "Reality hygiene: MODERATE. Worth slowing down to check sources."

Not: "You are being manipulated."
But: "Notice where you feel the emotional hook. What is it recruiting you to believe?"

### 4. Sovereignty-Preserving

Always: "Here are questions to restore your freedom of attention"
Never: "This is false" or "Don't believe this"

User maintains agency. MAIA offers tools, not verdicts.

---

## Future Enhancements

### Phase 2: LLM-Assisted Scoring

```typescript
// lib/reality/realityAssistedScoring.ts (already outlined in system reminder)

// Heuristic scoring (regex patterns)
function assistRealityScoresFromText(text: string): AssistedScoreResult

// LLM scoring (with evidence quotes)
function suggestRealityScoresLLM(text: string, client: LLMClient): AssistedScoreResult
```

### Phase 3: Community Integration

Apply to Community Commons posts before publishing:
- High reality scores → "Slow down + sources" UI gate
- Users learn to recognize manipulation in their own content
- Commons stays clean (not a viral outrage vector)

### Phase 4: Cross-Session Learning

- Track user's reality assessment patterns over time
- Identify blind spots: "You tend to miss [indicator]"
- Celebrate growth: "Your detection of [indicator] has improved"

### Phase 5: Source Reputation

- Build reputation scores for domains/sources
- "This domain historically scores high on [indicators]"
- Not censorship - information, not restriction

---

## Testing Checklist

- [x] Database migration runs without errors
- [x] Reality types and scoring logic correct
- [x] Detection triggers work (URLs, newsy language, tribal framing)
- [x] RealityCheckAgent generates questions for all elements
- [x] Oracle integration: detection + question generation
- [x] Oracle integration: appends note to response when band ≥ moderate
- [x] Oracle integration: includes realityHygiene in response metadata
- [x] API route: POST /api/reality-score saves assessments
- [x] API route: GET /api/reality-score retrieves user's assessments
- [x] Frontend: RealityScorePanel renders and updates correctly
- [x] Frontend: RealityHygieneDisplay shows results with proper styling
- [ ] End-to-end: User submits message → Reality Hygiene triggers → Questions displayed
- [ ] End-to-end: User scores manually → Saves assessment → Retrieves later

---

## Deployment Steps

1. **Run migration:**
   ```bash
   # Connect to your Postgres database and run:
   psql $DATABASE_URL -f supabase/migrations/20251216_create_reality_assessments.sql

   # Or if using the default local connection:
   psql postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign \
     -f supabase/migrations/20251216_create_reality_assessments.sql
   ```

2. **Verify types are available:**
   ```bash
   npm run build  # Should compile without errors
   ```

3. **Test Oracle endpoint:**
   ```bash
   # Send a test message with newsy language
   curl -X POST http://localhost:3000/api/oracle/conversation \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Breaking: Everyone is saying this shocking thing happened! Act now!",
       "userId": "test-user-id",
       "sessionId": "test-session-id"
     }'

   # Should return response with realityHygiene field
   ```

4. **Test UI components:**
   - Navigate to a page with `<RealityScorePanel />`
   - Adjust sliders, verify total/band updates
   - Click "Save Assessment", verify database entry
   - Submit Oracle message, verify `<RealityHygieneDisplay />` appears

---

## Success Metrics

**Immediate (MVP):**
- Reality Hygiene triggers correctly (>80% accuracy on test cases)
- Questions are relevant and consciousness-expanding (subjective eval)
- Users can save/retrieve assessments
- No performance degradation (Oracle response time < 5s)

**Phase 2 (After Launch):**
- Users save ≥3 reality assessments per week (engagement)
- Users report increased awareness of manipulation patterns (survey)
- False positive rate <10% (users don't feel over-policed)

**Phase 3 (Community Integration):**
- Community Commons posts with high reality scores decline over time
- Users self-correct before posting (evidence: edit patterns)
- Commons maintains high epistemic hygiene (steward assessment)

---

## The Crucial Difference

**Before Reality Hygiene:**
> User: "I just saw this shocking news - everyone's talking about it!"
> MAIA: *[responds to content, maybe encourages critical thinking]*

**After Reality Hygiene:**
> User: "I just saw this shocking news - everyone's talking about it!"
> MAIA: *[responds to content, encourages critical thinking]*
> —
> Reality hygiene: **MODERATE** (42/100). Some manipulation patterns present.
> **A grounding question:** Who benefits if you believe this right now?

---

## Integration Points with Existing MAIA Systems

1. **Field Safety Gate** (lines 173-220):
   - Field Safety blocks unsafe symbolic work
   - Reality Hygiene detects manipulation patterns
   - Complementary: one protects from overwhelm, one from manipulation

2. **Cognitive Profile** (line 178):
   - Provides `cognitiveAltitude` for developmental calibration
   - Reality questions adapt to user's current level
   - Tight integration: questions grow with user

3. **Spiralogic Cell** (line 282):
   - Element/phase detection informs MAIA response
   - Reality element breakdown adds epistemic layer
   - Both use same elemental language (Water/Fire/Earth/Air/Aether)

4. **Opus Axioms** (line 498):
   - Validates MAIA's response quality (Jungian principles)
   - Reality Hygiene validates user's input quality (manipulation)
   - Bidirectional quality control

5. **Socratic Validator** (line 358):
   - Validates MAIA doesn't make ungrounded claims
   - Reality Hygiene helps user not make ungrounded claims
   - Shared epistemic rigor

---

## Conclusion

Reality Hygiene is now fully integrated into MAIA's Oracle endpoint. It operates as a **consciousness-expanding epistemic immune system** - not a censor, but a teacher.

**The system:**
- Detects when users encounter potentially manipulative content
- Maps manipulation patterns to Spiralogic elements (MAIA-native)
- Generates consciousness-expanding questions (not verdicts)
- Calibrates to user's developmental level
- Preserves user sovereignty (questions, not answers)

**Next steps:**
1. Test end-to-end with real Oracle conversations
2. Gather user feedback on question quality
3. Add LLM-assisted scoring (Phase 2)
4. Integrate with Community Commons (Phase 3)

**The vision:**
A community of users who can recognize manipulation patterns in real-time,
ask consciousness-expanding questions, and maintain epistemic hygiene -
all while preserving freedom of attention and developmental sovereignty.

**Reality Hygiene isn't about controlling what people believe.**
**It's about restoring their capacity to think freely.**

✅ **Integration Complete**
