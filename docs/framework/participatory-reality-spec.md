# Participatory Reality Framework — Integration Spec
**Version**: 1.0
**Date**: 2026-03-16
**Status**: Phase 1 Implementation Ready

---

## SECTION 1 — Conceptual Translation

### North Star

> **Supporting the movement out of being driven by habituated mindstates is alone a powerful process.**

The deeper gift of this framework is not the six themes themselves. It is the development of a witnessing capacity — the ability to see a habituated pattern in motion without being fully identified with it. Recognition without fusion. The gap between stimulus and automatic response, however brief, is already a transformation. The pattern doesn't have to stop for something to change.

Each of the six lenses is one possible entry point to that gap.

This is what separates the framework from manifestation doctrine: the doctrine says *change your thoughts to change your outcomes*. This framework says *notice the habituated state itself — that noticing is the work*.

### Product Philosophy

The Participatory Reality Framework is not a doctrine. It is a perceptual grammar — a set of lenses through which members can notice patterns in their experience that would otherwise remain invisible or overwhelming.

The six themes (originally drawn from traditions of natural law and consciousness philosophy) are translated here into psychologically responsible, symbolically alive language compatible with:

- Jungian depth psychology (archetypes, shadow, individuation)
- Contemplative traditions (attention, presence, non-grasping)
- Somatic and nervous system frameworks (regulation, window of tolerance)
- Developmental psychology (stages, relational maturation)
- Complexity theory (emergence, nonlinear causality, field effects)

### The Six Themes in Soullab Language

| Original | Soullab Translation | Spiralogic Element |
|----------|--------------------|--------------------|
| Divine Oneness | **Field Awareness** | Aether |
| Recurrence / Echo | **Pattern Recurrence** | Water |
| Law of Attraction | **Embodied Coherence** | Fire + Water |
| Correspondence | **Adaptive Unfolding** | Air |
| Non-Resistance | **Wise Acceptance** | Earth |
| Timing / Gestation | **Ripeness / Kairos** | Aether |

### Poetic Truth vs Literal Causal Claims

The framework uses symbolic truth, not mechanistic causality.

**Symbolic truth**: "What you attend to tends to grow" — an invitation to notice the feedback between attention and experience.

**Mechanistic overclaim**: "Your thoughts create your reality" — causal determinism that shames the sufferer and denies structural forces.

MAIA must always hold the former and refuse the latter.

The correct framing: **human participation in reality** — not passive receipt of fate, not omnipotent manufacture of circumstances. Members are participants in a dynamic field, capable of orientation, attention, and response.

### What This Framework Is NOT For

- Explaining illness, trauma, loss, systemic oppression, or grief as caused by the member's consciousness
- Bypassing legitimate need for structural change, professional support, or medication
- Generating spiritual bypassing (using insight to avoid feeling)
- Creating a performance standard for "correct manifestation"
- Suggesting that not getting what you want means you did it wrong

### Ethical Guardrails (MUST be enforced in all prompts)

1. **Never imply the member caused their suffering** through poor consciousness
2. **Always allow multiple causal levels**: developmental, relational, structural, systemic, somatic, and historical
3. **Never use deterministic language**: "will", "guaranteed", "always", "must"
4. **Hold uncertainty**: "some traditions hold...", "one way to look at...", "what if..."
5. **Preserve agency without overclaiming control**: members can orient, not dominate
6. **Name complexity**: "these patterns are real and also not the whole story"

---

## SECTION 2 — Member Experience Design

### Surface 1: Daily Check-in

**User goal**: Orient briefly at the start of day; notice inner weather
**When this framework appears**: After state selection + intensity, as optional reflection layer
**Module name**: `RipenessSignal`
**Questions asked**:
- "What feels ready to move today?"
- "What are you working around rather than through?"
- "Is there a pattern you've seen before showing up again?"

**Value**: Surfaces ripeness (Kairos) and wise acceptance (Earth) as actionable orientors
**Risk to avoid**: Do not present these as diagnostic — they are invitations, not assessments

---

### Surface 2: Journaling Reflection

**User goal**: Deepen understanding of a recent experience or pattern
**When this framework appears**: After free-write, as a structured reflection lens
**Module name**: `PatternEchoReflection`
**Questions asked**:
- "Does this feel familiar? When have you been here before?"
- "What part of you is resisting what you know?"
- "What would it mean to act from where you actually are rather than where you think you should be?"

**Value**: Surfaces Pattern Recurrence (Water) and Embodied Coherence (Fire + Water)
**Risk to avoid**: Do not retrospectively interpret the journal entry as "caused" by the member's state

---

### Surface 3: Oracle Response Generation

**User goal**: Be witnessed and guided through a real concern
**When this framework appears**: Woven into MAIA's response when one of the six signals is detected
**Module name**: Injected via `participatory_reality` framework block in FRAMEWORK_REGISTRY
**Questions asked**: No direct questions — reflected back as reframes or curiosities
**Value**: Adds symbolic depth and pattern recognition without prescribing
**Risk to avoid**: MAIA must not diagnose which theme is "operative" — it may name it as a possibility only

---

### Surface 4: Post-Session Integration Summary

**User goal**: Consolidate insight from a conversation
**When this framework appears**: At end of deep session (DEEP processing path)
**Module name**: `SessionThemeSummary`
**Output**: 1-3 theme signals surfaced in session, named in Soullab language
**Value**: Helps members track symbolic patterns over time
**Risk to avoid**: Do not present themes as diagnoses or fixed characterizations

---

### Surface 5: Pattern Ledger / Practitioner Dashboard

**User goal** (practitioner): Understand recurring dynamics in client's system
**When this framework appears**: In session prep and between-session pattern review
**Module name**: `ParticipatoryPatternCard` in `PatternLedgerPanel`
**Output**: Pattern type tags mapped to six themes + element resonance + signal strength
**Value**: Gives practitioners symbolic vocabulary for what the client keeps encountering
**Risk to avoid**: Do not present these as fixed diagnoses — present as recurring tendencies with question marks

---

### Surface 6: Ripeness / Kairos Check-in

**User goal**: Discern readiness for action or change
**When this framework appears**: When member explicitly asks "is now the right time?", "should I...?", or after declaring a desire
**Module name**: `KairosSignal`
**Questions asked**:
- "What signs of readiness are you noticing?"
- "What would need to be true for this to feel aligned?"
- "Is this urgency — or ripeness?"

**Value**: Supports discernment without prescribing timing
**Risk to avoid**: MAIA must not predict or guarantee outcomes

---

## SECTION 3 — Data Model

### New Table: `member_theme_signals`

```sql
CREATE TABLE member_theme_signals (
  id BIGSERIAL PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,
  journal_entry_id UUID,
  theme TEXT NOT NULL CHECK (theme IN (
    'field_awareness',
    'pattern_recurrence',
    'embodied_coherence',
    'adaptive_unfolding',
    'wise_acceptance',
    'ripeness'
  )),
  signal_type TEXT NOT NULL DEFAULT 'active' CHECK (signal_type IN (
    'active',      -- clearly present in session
    'emerging',    -- beginning to surface
    'blocked',     -- resistance to theme detected
    'integrating'  -- member is working with this theme
  )),
  resonance_strength FLOAT CHECK (resonance_strength >= 0 AND resonance_strength <= 1),
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  context JSONB DEFAULT '{}',  -- session excerpt ref, not content
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_theme_signals_member ON member_theme_signals (member_id);
CREATE INDEX idx_member_theme_signals_theme ON member_theme_signals (theme, signal_type);
CREATE INDEX idx_member_theme_signals_detected ON member_theme_signals (detected_at DESC);
```

### Extension: Journal Entries

Add `participatory_themes` JSONB column to `journal_entries` (or equivalent table):

```sql
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS participatory_themes JSONB DEFAULT '[]';
-- Format: [{ theme: string, signal_type: string, resonance_strength: float }]
```

### Extension: Pattern Ledger

Extend `pattern_reflections.pattern_type` CHECK constraint or JSONB `pattern_data` to include:
- `participatory_recurrence` — repeated theme across sessions
- `participatory_coherence` — coherence/alignment pattern
- `participatory_ripeness` — multiple Kairos signals in sequence

### TypeScript Interfaces

See `lib/consciousness/participatoryReality.ts` for full type definitions.

---

## SECTION 4 — Prompt Architecture

### System Prompt Block for MAIA (Oracle)

See `lib/maia/prompts/participatoryRealityPrompt.ts` for production-ready prompt blocks.

**Activation condition**: Framework block is injected when:
1. `participatoryReality` feature flag is enabled
2. Member's current element maps to one of the six themes, OR
3. Pattern ledger shows recurring theme signal (confidence ≥ 0.55)

**Never activate when**:
- Member is in crisis (safety concern detected)
- Processing path is FAST (< 2s)
- Member explicitly requests practical/tactical help only

### Constraint Hierarchy for Prompts

1. Mirror the member's actual words first (no framework imposed)
2. Bridge only if a theme is organically present in their language
3. Never name a theme in a way that forecloses other interpretations
4. Always preserve "one lens among many" framing
5. Never overclaim: "you are doing X" → "I notice something that might be X"

---

## SECTION 5 — Member Copy

### Short Introduction (Settings / Onboarding)

> **Six Ways of Participating**
>
> These aren't rules or laws. They're patterns that many traditions — contemplative, psychological, symbolic — have noticed in how human experience tends to move.
>
> MAIA may occasionally use them as lenses when something in your conversation seems to resonate with one. They're offered as possibilities, not diagnoses.

---

### Six-Card UI Explanation

**Field Awareness** (Aether)
> The invisible atmosphere of a room, a relationship, a moment. Sometimes what's happening isn't only personal — it's in the field. Noticing the field means asking: what's present here that doesn't belong only to me?

**Pattern Recurrence** (Water)
> The psyche tends to circle back. Old themes return wearing new costumes. Recognizing recurrence isn't failure — it's the moment before something finally changes.

**Embodied Coherence** (Fire + Water)
> When what you think, feel, say, and do are pointing in roughly the same direction, things tend to move. Incoherence isn't bad — it's information. It tells you what's not yet integrated.

**Adaptive Unfolding** (Air)
> Life responds to how you engage with it. Not because you control it, but because attention, choice, and meaning-making change what's possible. The navigator doesn't control the sea — but navigation matters.

**Wise Acceptance** (Earth)
> Resistance costs energy. There is a difference between what you can change and what you need to move *with*. Acceptance isn't passivity — it's a way of regaining ground.

**Ripeness / Kairos** (Aether)
> Not everything that's right is right *now*. There's a quality of timing that can be sensed — when the moment is ripe, action costs less and lands further. Patience here isn't delay; it's intelligence.

---

### Journal Prompts (per theme)

- **Field Awareness**: "What's in the atmosphere of this situation — beyond what you personally brought to it?"
- **Pattern Recurrence**: "Where have you been here before? What's different this time?"
- **Embodied Coherence**: "On a scale that's not about judgment — how aligned do you feel right now between what you know and how you're living?"
- **Adaptive Unfolding**: "What would shift if you treated this situation as responsive rather than fixed?"
- **Wise Acceptance**: "What are you spending energy fighting that isn't going to change? What would it cost to stop?"
- **Ripeness**: "Is this a moment of action, or a moment of preparation? How do you know?"

---

### Practitioner Summary Labels

- `Field Dynamic` — relational atmosphere observed in session
- `Returning Pattern` — previously noted theme resurfacing
- `Coherence Tension` — gap between stated values and embodied state
- `Unfolding Edge` — moment of active navigation / meaning-making
- `Resistance Point` — energy bound around acceptance
- `Ripeness Window` — timing signal — client may be ready to act

---

### Tooltip / Help Text

> These lenses are drawn from Jungian, contemplative, and somatic traditions. MAIA uses them to add depth to reflection — not to explain your life or predict your future. If any of them land wrong, trust that.

---

### Grounding Note (visible to member)

> **About these themes**: They describe patterns in human experience, not laws that govern it. Your suffering is not caused by misaligned consciousness. Structural, relational, developmental, and biological forces are real. These lenses may occasionally offer a useful angle — and they're always just one angle.

---

## SECTION 6 — Product Modules

### Module 1: `FieldAwareness`
**Purpose**: Help members notice what's happening at the relational/atmospheric level beyond individual psychology
**Where**: Oracle response, session summary, practitioner prep
**Inputs**: Session content, relational context markers
**Outputs**: Reflection prompt, summary label
**MVP**: Prompt block injection + theme tag in session metadata
**Advanced**: Cross-session field pattern tracking, group session summaries

### Module 2: `PatternEcho`
**Purpose**: Surface recurring themes across sessions and journals
**Where**: Pattern ledger, journal reflection, oracle bridge
**Inputs**: `member_theme_signals` history, journal entry tags
**Outputs**: "You've been here before" reflection, practitioner pattern card
**MVP**: Store theme signals, query for recurrence (≥3 signals same theme)
**Advanced**: Timeline visualization, recurrence-triggered journaling prompts

### Module 3: `CoherenceState`
**Purpose**: Track alignment between stated intention and embodied state
**Where**: Daily check-in (optional extension), oracle, session summary
**Inputs**: Check-in state + intensity + note, recent session themes
**Outputs**: Coherence resonance indicator (high/low/building)
**MVP**: Record coherence signal in `member_theme_signals` with `embodied_coherence` theme
**Advanced**: Coherence trajectory over time, element correlation

### Module 4: `WiseAcceptance`
**Purpose**: Surface resistance patterns without pathologizing them
**Where**: Oracle, journal reflection
**Inputs**: Language markers for resistance/avoidance in session
**Outputs**: Earth-element reflection prompt, `blocked` signal tag
**MVP**: Prompt config instruction; `blocked` signal type in theme signals
**Advanced**: Somatic integration prompts, practitioner resistance map

### Module 5: `KairosSignal`
**Purpose**: Support discernment about timing without prescribing outcomes
**Where**: Oracle (when member asks timing questions), check-in optional add-on
**Inputs**: Member language markers ("should I now", "is it time", "feel ready")
**Outputs**: Ripeness reflection question, `ripeness` theme signal
**MVP**: Prompt instruction + language trigger detection
**Advanced**: Kairos window tracking over sessions, ripeness-to-action outcome logging

---

## SECTION 7 — Implementation Roadmap

### Phase 1: Quickest Safe MVP (this PR)

**Goal**: Framework available in oracle + theme signals stored

**Files involved**:
- `lib/consciousness/participatoryReality.ts` — shared types + element mapping
- `lib/maia/prompts/participatoryRealityPrompt.ts` — prompt config objects
- `database/migrations/20260316000001_participatory_reality_themes.sql` — schema
- `lib/utils/feature-flags.ts` — add `participatoryReality` flag (default off)
- `lib/consciousness/participatoryRealityHelper.ts` — backend detection + storage helper

**Backend services**: Oracle conversation route (prompt injection only; no code change yet)
**Frontend surfaces**: None yet — feature flag keeps it dark
**Prompt work**: Participatory Reality system prompt block + journaling block
**Analytics**: `participatory_theme_detected` event stub
**Risks**: Prompt contamination (framework language leaking into unrelated responses) — mitigated by activation conditions

### Phase 2: Memory + Journaling Integration

**Goal**: Themes stored across sessions; journal reflection surfaces themes

**Files involved**:
- `app/api/oracle/conversation/route.ts` — inject prompt block + store signals
- `app/api/journal/` routes — add theme tagging on save
- `components/checkin/DailyCheckin.tsx` — add optional ripeness/resistance question

**Backend services**: Pattern ledger (extend `pattern_reflections`)
**Frontend surfaces**: Journal reflection UI, check-in extension
**Risks**: Prompt injection affecting all oracle responses — require confidence threshold ≥ 0.5 before injecting

### Phase 3: Practitioner + Session Intelligence

**Goal**: Themes surface in practitioner dashboard and session summaries

**Files involved**:
- `components/studio/PatternLedgerPanel.tsx` — add `ParticipatoryPatternCard`
- `app/api/oracle/conversation/route.ts` — add theme detection to session summary
- Practitioner prep route — add theme signal retrieval

**Backend services**: Session summary generator, practitioner API
**Frontend surfaces**: Studio dashboard, session summary view
**Risks**: Practitioners over-relying on labels — copy must maintain "tendency, not diagnosis" framing

### Phase 4: Adaptive Personalization

**Goal**: MAIA selects framework lenses based on member's recurring theme history

**Files involved**:
- `lib/voice/conductor.ts` — weight framework selection by theme signal history
- `lib/consciousness/patternHint.ts` — inject participatory themes alongside existing patterns
- New: `app/api/members/theme-history` route for client-side display

**Backend services**: Pattern ledger, conductor, oracle
**Frontend surfaces**: Member profile, settings (theme lens preferences)
**Risks**: Confirmation bias (MAIA always sees the same theme) — require cooling-off period; max one framework injection per session

---

## SECTION 9 — Evaluation Rubric

### Does MAIA use this framework well? Check for:

| Criterion | Pass | Fail |
|-----------|------|------|
| Causal language | "one way to understand..." / "what if..." | "you created this" / "this is because you..." |
| Trauma awareness | Allows structural/historical causes | Implies member's consciousness caused suffering |
| Member shaming | Never implies doing it wrong | "you're resisting" as accusation |
| Reflective utility | Produces curiosity, not certainty | Member feels judged or labeled |
| Agency support | Increases clarity + choice | Creates magical thinking or passivity |
| Voice consistency | Soullab tone (warm, grounded, literate) | New Age cliché, clinical sterility |
| Discernment over fantasy | Grounds symbolic language in felt experience | Floats in abstraction |
| Framework transparency | "one lens among several..." | Presents as universal law |

### Automated Checks (can add to ain_shape_telemetry)

Add boolean columns:
- `uses_participatory_framework` — did the response invoke any of the six themes?
- `shames_or_blames` — does the response imply member caused suffering?
- `overclaims_causality` — uses deterministic causal language?
- `maintains_open_framing` — uses possibility language, not certainty?

---

## SECTION 10 — Final Build Output

### A. File / Folder Changes

```
NEW:
  docs/framework/participatory-reality-spec.md       (this file)
  lib/consciousness/participatoryReality.ts           (shared types + element map)
  lib/maia/prompts/participatoryRealityPrompt.ts      (prompt config blocks)
  lib/consciousness/participatoryRealityHelper.ts     (detect + store signals)
  database/migrations/20260316000001_participatory_reality_themes.sql

EDIT:
  lib/utils/feature-flags.ts                         (add participatoryReality flag)
```

Phase 2+ additions:
```
EDIT:
  app/api/oracle/conversation/route.ts               (inject prompt + store signals)
  components/checkin/DailyCheckin.tsx                (ripeness question)
  components/studio/PatternLedgerPanel.tsx           (participatory pattern card)
```

### B. Migration Names

```
20260316000001_participatory_reality_themes.sql
20260316000002_journal_participatory_themes_column.sql  (Phase 2)
```

### C. Feature Flag Names

```
participatoryReality          — master flag (default: false)
participatoryJournalingLens   — journal surface (Phase 2, default: false)
participatoryPractitioner     — practitioner surface (Phase 3, default: false)
```

### D. Analytics Events

```
participatory_theme_detected      { theme, signal_type, element, source: 'oracle'|'journal'|'checkin' }
participatory_recurrence_surfaced { theme, recurrence_count, member_id (hashed) }
participatory_ripeness_asked      { context: 'timing_question'|'desire_statement' }
participatory_framework_pass      { criterion: string, passed: boolean }
```

### E. Next 5 Implementation Steps (in order)

1. **Apply migration** `20260316000001_participatory_reality_themes.sql` — creates `member_theme_signals` table
2. **Wire shared types** (`lib/consciousness/participatoryReality.ts`) — defines all TS interfaces and element map
3. **Add feature flag** — add `participatoryReality: false` to `lib/utils/feature-flags.ts`
4. **Write prompt config** (`lib/maia/prompts/participatoryRealityPrompt.ts`) — production prompt blocks for oracle + journaling + practitioner + check-in
5. **Write backend helper** (`lib/consciousness/participatoryRealityHelper.ts`) — `detectThemes()` + `storeThemeSignal()` + `getRecentThemes()` — ready for Phase 2 wiring into oracle route
