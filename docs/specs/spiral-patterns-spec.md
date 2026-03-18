# Spiralogic Life Spirals — Product Spec

## What this is

Not a pattern detector. A system of symbolic-developmental orientation.

Each major area of life has its own spiral. Patterns arise within those spirals.
Those patterns can be read structurally, elementally, and archetypally. MAIA helps
the person witness, name, and work with them over time.

The question the system answers is not "what pattern was detected?" It is:
**Where in this part of life is this person moving, looping, or ripening?**

---

## Core Object: SpiralPattern

A recurring movement within a specific life spiral, described through structural,
elemental, archetypal, and developmental lenses.

### Identity
```
id                  uuid
memberId            uuid
name                string          — human-readable title (not a label)
description         string          — 2–3 sentence narrative in MAIA's voice
lifeDomain          LifeDomain      — see domains below
status              emerging | active | integrated | dormant
```

### Pattern Intelligence
```
structuralPattern   string          — what repeats behaviorally
elementalSignature  ElementalSig    — primary element, secondary, tension type
spiralPhase         SpiralPhase     — where in the developmental arc
archetypeTone       string          — archetypal figure active here
sourceStreams        SourceStream[]  — conversation | journal | mission | checkin
evidenceCount       int
dateWindow          { first, last } — span of observed instances
confidence          float 0–1
```

### Process Intelligence
```
likelyTriggers      string[]        — what tends to precede it
linkedMissionIds    uuid[]          — /journey missions this pattern appears in
linkedThemes        string[]        — participatory reality themes connected
transformationalInvitation string   — the real question: not advice, an opening
```

### User Relationship
```
resonanceResponse   ResonanceResponse | null
memberNotes         string | null
reflections         Reflection[]
practicesTaken      string[]
```

### Evolution Layer
```
whatChanged         string | null   — what softened or shifted
whatIsEmerging      string | null   — what is trying to come through this pattern
lastEvolvedAt       timestamptz
```

---

## Life Domains

Eight spirals. Each person develops these gradually — not all at once.

```
relationship   — intimacy, friendship, partnership, conflict
work           — vocation, contribution, output, calling
body           — health, nervous system, sensation, energy
creative       — expression, making, vision, form
spiritual      — meaning, practice, transcendence, inner life
family         — belonging, origin, inheritance, home
resources      — money, sufficiency, scarcity, flow
purpose        — mission, legacy, service, becoming
```

---

## Elemental Signatures

Each pattern carries an elemental reading — not what the person is, but what
movement is currently active or distorted.

```
Fire excess     — overprojection, urgency, intensity, inflation
Fire absence    — passivity, deflation, stalled will

Water depth     — grief cycle, fusion, retreat, initiation underway
Water absence   — emotional flatness, bypassing, disconnection from feeling

Earth distortion — stagnation, overcontrol, depletion, embodiment rupture
Earth absence   — ungroundedness, disembodiment, no container

Air distortion  — over-analysis, distance, fragmentation, abstraction
Air absence     — no perspective, fusion with situation, no witness

Aether          — meaning reorganization, identity dissolution, threshold state
```

An elemental signature has: `{ primary, secondary, tensionType, description }`

Where tensionType is one of: `excess | absence | transition | conflict | integration`

---

## Spiral Phase

Not all repetition is pathology. Phase determines meaning.

```
1  beginning       — something is initiating
2  descent         — entering the unknown
3  crisis          — confronting what cannot be avoided
4  purification    — stripping to essentials
5  stillpoint      — before movement returns
6  integration     — metabolizing what was encountered
7  threshold       — standing at the edge of new form
8  emergence       — new identity or capacity forming
9  consolidation   — rooting the new
10 offering        — sharing what was earned
11 return          — cycling back at deeper octave
12 completion      — a cycle closes
```

---

## Archetypal Tones

Used with discipline — not decorative. Archetypes answer:
*What role am I inhabiting? What inner figure is overactive, split, or ripening?*

Starter library (expandable):
```
The Orphan         The Martyr         The Seeker
The Priestess      The Rebel          The Builder
The Exile          The Sovereign      The Shape-shifter
The Witness        The Devourer       The Threshold Guardian
The Wounded Healer The Seer           The Child
The Elder          The Trickster      The Ancestor
```

---

## Resonance Responses (replaces binary confirm/reject)

```
fits        — yes, this is real for me
partly      — something here, not the whole frame
not_now     — true but not the right moment to engage
no          — this doesn't land
explore     — I want to go deeper with this
```

`explore` triggers: a reflective question surfaced in the conversation or on the card.

---

## Pattern Types (what the detector produces)

Patterns are not all the same kind of thing. Typed at detection:

```
behavioral    — observable repetition in choices, language, pacing, avoidance
emotional     — recurring affective fields: shame, urgency, grief, longing, collapse
archetypal    — recurring symbolic roles or relational positions
elemental     — imbalances, fixations, developmental absences, or transitions
mission       — themes repeating in /journey goals, intentions, unfinished callings
threshold     — the person repeatedly nears change, then retreats or fragments
```

---

## Signal Sources

Patterns form from multiple streams:

```
conversation    — oracle turns (already wired via PatternDetectionService)
mission         — /journey mission creation, stall, progress, completion, dissolution
journal         — themes in written entries
checkin         — daily checkin patterns
```

Mission integration specifically reveals:
- where intention is authentic vs. borrowed
- where action stalls at a recurring point (e.g., visibility threshold)
- where aspiration outruns embodiment
- where a calling keeps reappearing under different names

---

## Database Evolution

### Add to `pattern_ledger`
```sql
ALTER TABLE pattern_ledger
  ADD COLUMN life_domain        text,
  ADD COLUMN pattern_type       text,   -- behavioral|emotional|archetypal|elemental|mission|threshold
  ADD COLUMN elemental_signature jsonb,  -- { primary, secondary, tensionType, description }
  ADD COLUMN spiral_phase       integer, -- 1–12
  ADD COLUMN archetype_tone     text,
  ADD COLUMN transformational_invitation text,
  ADD COLUMN member_notes       text,
  ADD COLUMN resonance_response text,   -- fits|partly|not_now|no|explore
  ADD COLUMN what_is_emerging   text,
  ADD COLUMN last_evolved_at    timestamptz;
```

### New table: `member_life_spirals`
```sql
CREATE TABLE member_life_spirals (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id           uuid REFERENCES members(id) ON DELETE CASCADE,
  domain              text NOT NULL,
  current_element     text,
  current_phase       integer,
  current_motion      text,   -- ascending | stuck | breakthrough
  active_pattern_ids  uuid[], -- pattern_ledger ids active in this domain
  active_mission_ids  uuid[],
  last_active_at      timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(member_id, domain)
);
```

---

## UI Surfaces

### Level 1: Spiral Map (new page — `/patterns` or inside `/journey`)

A domain grid. Each card shows:
- domain name
- current elemental state (small element glyph)
- current phase label
- active pattern count
- motion indicator (ascending / stuck / threshold)
- linked mission count

Entry point: tap a domain to enter its spiral.

### Level 2: Domain Spiral (per-domain view)

For a single life domain:
- current phase description
- elemental reading (1–2 lines)
- active patterns (pattern cards)
- linked active missions
- recent activity (when signals last appeared)

### Level 3: Pattern Card (per-pattern detail)

Six-layer view:
1. **Name + description** (narrative, MAIA's voice)
2. **Elemental signature** (element glyph + tension type)
3. **Phase** (where in the arc)
4. **Archetypal tone** (figure name + 1-line frame)
5. **Transformational invitation** (the real question)
6. **Evidence** (count + date window + source streams)

Resonance responses: Fits / Partly / Not now / No / Explore

On Explore → conversation entry point or reflective prompt surfaced inline.

---

## Implementation Phases

### Phase 1 — Make patterns humane (can start now)
- Generate description via MAIA when pattern confidence crosses 0.6
- Show evidence metadata (count + date window)
- Replace confirm/reject with 5-response model
- Attach transformational invitation at generation time

### Phase 2 — Place patterns inside life spirals
- Add `life_domain` to `pattern_ledger`
- Create `member_life_spirals` table
- Map existing scopes → domains
- Build domain-grouped view

### Phase 3 — Elemental and archetypal framing
- Generate elemental signature at pattern formation
- Assign archetype tone
- Wire `archetype_wisdom_library` (populate it)
- Phase detection from `member_spiral_state`

### Phase 4 — Mission integration
- Connect `missions.house` → life domain
- Signal from mission stall/dissolution → threshold pattern detection
- Surface "this mission has dissolved 3 times at the same point" as a pattern
- Link pattern cards to related missions

### Phase 5 — Living map
- Visual spiral map per domain
- Pattern evolution timeline
- Cross-domain synthesis (e.g., "Fire-Earth tension appears in both Work and Body")
- Developmental arc over months

---

## Language Principles

Every pattern is held as provisional, contextual, developmental, open to revision.

Use:
- "this movement has been appearing"
- "this may be a live theme"
- "this seems to arise especially when…"
- "this may represent a threshold, not a fixed trait"

Never:
- "you are a person who…"
- "your pattern is…" (identity language)
- "you tend to…" without qualification
- certainty language

The pattern is not the point. **What is trying to emerge through it is the point.**

---

## Design Principle

Move from diagnosis to orientation.

Every feature should help the person answer:
- Where am I?
- What is repeating?
- In what part of life?
- Through what element?
- In what phase of becoming?
- What is this pattern asking of me now?
