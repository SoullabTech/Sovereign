# 🔍 Reality Hygiene System - READY FOR DEPLOYMENT

**Status:** ✅ **FULLY INTEGRATED** - Using Direct Postgres (No Supabase)

---

## Quick Summary

Reality Hygiene is MAIA's **epistemic immune system** - a consciousness-expanding layer that helps users recognize manipulation patterns in content. It's fully integrated into the Oracle endpoint and ready to deploy.

**What makes it MAIA:**
- Maps to Spiralogic elements (Water/Fire/Earth/Air/Aether)
- Generates consciousness-expanding questions (not verdicts)
- Calibrates to user's developmental level
- Preserves sovereignty (offers tools, not answers)

---

## Files Created (All Using Postgres)

### Backend
```
✅ lib/reality/realityTypes.ts              (types, scoring, Spiralogic mapping)
✅ lib/reality/realityHygiene.ts            (detection, baseline questions)
✅ lib/reality/realityCheckAgent.ts         (consciousness-expanding questions)
✅ app/api/reality-score/route.ts           (save/retrieve via Postgres)
✅ app/api/oracle/conversation/route.ts     (integrated at lines 34-36, 222-252, 497-513, 735-748)
```

### Database
```
✅ supabase/migrations/20251216_create_reality_assessments.sql  (plain Postgres)
✅ scripts/migrate-reality-hygiene.sh                           (migration runner)
```

### Frontend
```
✅ components/reality/RealityScorePanel.tsx         (20 sliders UI)
✅ components/reality/RealityHygieneDisplay.tsx     (results display)
✅ components/reality/index.ts                      (exports)
```

### Documentation
```
✅ REALITY_HYGIENE_INTEGRATION_COMPLETE.md    (comprehensive guide)
✅ REALITY_HYGIENE_POSTGRES_FIX.md            (Postgres migration notes)
✅ test-reality-hygiene.ts                    (verification script)
```

---

## Database Setup

**Connection:** Uses existing Postgres pool from `lib/db/postgres.ts`
```
postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign
```

**Run Migration:**
```bash
./scripts/migrate-reality-hygiene.sh
```

Or manually:
```bash
psql postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign \
  -f supabase/migrations/20251216_create_reality_assessments.sql
```

**Verify:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM reality_assessments;"
```

---

## How It Works

### 1. Detection Trigger

When Oracle receives a message, it checks `shouldRunRealityHygiene()`:

**Triggers on:**
- URLs (news/social media)
- Newsy language: "breaking", "everyone is saying", "shocking"
- Tribal language: "us vs them", "those people"

### 2. Scoring

**User-provided scores** (1-5 for each of 20 indicators):
- emotional_manipulation, timing, urgent_action, etc.
- Computed total → risk band (low/moderate/strong/overwhelming)

### 3. Consciousness-Expanding Questions

`RealityCheckAgent` generates three types:

**EARTH/AIR (Grounding):**
> "What primary source would definitively settle this claim?"

**WATER/FIRE (Awareness):**
> "What emotion is being recruited? What would you do differently without it?"

**AETHER (Sovereignty):**
> "Who benefits if you believe this? Am I thinking freely or being recruited?"

### 4. Oracle Response

If band ≥ moderate, Oracle appends:

```
—

Reality hygiene: MODERATE (42/100). Some manipulation patterns present
(emotional manipulation is the primary pattern).

**A grounding question:** Who benefits if you believe this right now?
```

---

## API Reference

### Save Assessment

**POST /api/reality-score**
```json
{
  "userId": "user-123",
  "source_type": "oracle_turn",
  "scores": {
    "timing": 3,
    "emotional_manipulation": 5,
    // ... all 20 indicators
  }
}
```

### Retrieve Assessments

**GET /api/reality-score?userId=user-123&limit=20**

### Oracle Integration

**POST /api/oracle/conversation**
```json
{
  "message": "Breaking news: shocking claim!",
  "userId": "user-123",
  "sessionId": "session-abc"
}
```

Response includes `realityHygiene` if triggered.

---

## Testing

### Core Functionality
```bash
npx tsx test-reality-hygiene.ts
```

**Results:**
```
✅ Detection triggers correctly
✅ Scoring logic works (totals, bands, elemental breakdown)
✅ Top signals identified
✅ RealityCheckAgent generates appropriate questions
✅ Developmental calibration works
```

### TypeScript Build
```bash
npm run build
```

**Result:** ✅ Compiles without errors

### Integration Test

1. Start server
2. Send Oracle request with newsy content
3. Verify Reality Hygiene appears in response

---

## The 20 Indicators (Spiralogic-Mapped)

### Water (Emotional) - 5 indicators
- emotional_manipulation
- tribal_division
- manufactured_outrage
- emotional_repetition
- good_vs_evil

### Fire (Urgency) - 4 indicators
- urgent_action
- novelty_shock
- rapid_behavior_shifts
- timing

### Earth (Information) - 4 indicators
- missing_information
- cherry_picked_data
- gain_incentive
- historical_parallels

### Air (Logic) - 4 indicators
- logical_fallacies
- false_dilemmas
- framing_techniques
- bandwagon

### Aether (Authority) - 3 indicators
- authority_overload
- suppression_of_dissent
- uniform_messaging

**Total possible:** 100 points (20 indicators × 5 points)

**Risk bands:**
- **Low (≤25):** Few patterns, clean signal
- **Moderate (26-50):** Some patterns, verify sources
- **Strong (51-75):** Multiple patterns, likely engineered
- **Overwhelming (76-100):** Heavy manipulation, do not share

---

## Deployment Checklist

- [ ] Run database migration: `./scripts/migrate-reality-hygiene.sh`
- [ ] Verify table created: `psql $DATABASE_URL -c "\d reality_assessments"`
- [ ] Test core logic: `npx tsx test-reality-hygiene.ts`
- [ ] Test TypeScript build: `npm run build`
- [ ] Test Oracle endpoint with newsy content
- [ ] Verify Reality Hygiene appears in response
- [ ] Test RealityScorePanel UI (if integrated)
- [ ] Verify save/retrieve API works

---

## What's Next

### Phase 2: LLM-Assisted Scoring
- Heuristic pattern matching (regex)
- LLM scoring with evidence quotes
- User can edit AI suggestions

### Phase 3: Community Integration
- Apply to Community Commons posts
- High scores → "Slow down + sources" gate
- Users learn to recognize manipulation in their own content

### Phase 4: Cross-Session Learning
- Track user's detection patterns over time
- Identify blind spots
- Celebrate growth

---

## Key Integrations

**Works with existing MAIA systems:**

1. **Field Safety** (protects from overwhelm)
   - Reality Hygiene protects from manipulation
   - Complementary protective layers

2. **Cognitive Profile** (developmental calibration)
   - Questions adapt to user's Bloom's level
   - Grows with the user

3. **Spiralogic** (native element mapping)
   - All indicators map to elements
   - Natural MAIA language

4. **Opus Axioms** (response quality)
   - Validates MAIA's responses
   - Reality Hygiene validates user's inputs

---

## Success Metrics

**Immediate:**
- Detection accuracy >80% on test cases
- Questions feel consciousness-expanding (qualitative)
- No performance degradation (Oracle <5s)
- Users can save/retrieve assessments

**Post-Launch:**
- Users save ≥3 assessments per week
- Users report increased awareness (survey)
- False positive rate <10%
- Community Commons posts improve over time

---

## The Vision

A community of users who can:
- Recognize manipulation in real-time
- Ask consciousness-expanding questions
- Maintain epistemic hygiene
- Preserve freedom of attention

**Reality Hygiene isn't about controlling beliefs.**
**It's about restoring the capacity to think freely.**

---

## Status

✅ **Database:** Plain Postgres (no Supabase)
✅ **API Routes:** Using `lib/db/postgres.ts`
✅ **Migration:** Ready to run
✅ **Tests:** All passing
✅ **TypeScript:** Compiles clean
✅ **Oracle Integration:** Complete
✅ **Frontend Components:** Ready
✅ **Documentation:** Complete

**READY FOR DEPLOYMENT**

Run migration → Test → Deploy → Gather feedback → Iterate

---

**Questions?** See:
- `REALITY_HYGIENE_INTEGRATION_COMPLETE.md` - Full technical guide
- `REALITY_HYGIENE_POSTGRES_FIX.md` - Database migration notes
- `test-reality-hygiene.ts` - Working examples
