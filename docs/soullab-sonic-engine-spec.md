# MAIA Songwriter — Build Spec
## Creative Mode inside MAIA (Acoustic Mode v1)

**Version:** 0.3
**Date:** 2026-03-20
**Status:** Pre-build — architecture locked, session flow defined

---

## Vision

> Not "press button → song."
> A second mind sitting beside you — one that knows your inner state, holds your themes, and helps you write the song you actually meant to write.

This is a songwriting co-creation system. The output is a **better song**, written by the human, supported at every stage by an intelligent collaborator that never dominates the process.

**Primary user:** Nathan — acoustic guitarist, songwriter, founding artist interface.

---

## Architectural Decision: Creative Mode, Not a Separate Product

Do NOT create `/artists` or a separate "Artists section."

**Correct structure: mode inside MAIA**

```
/maia
  ├── Guide          (oracle conversation)
  ├── Songwriter     (Creative Mode v1)
  └── Creative       (future umbrella)
```

**Why this is critical:**

The system's power comes from shared memory, shared symbolic interpretation, shared context. If you split artists out, you lose cross-pollination:

- Journal → becomes lyric
- Dream → becomes song
- Relationship → becomes narrative

That only works if it's **one system**.

**Name:** Use "Creative" or "Create" — not "Artists." Universal, not exclusive.

---

## Three Layers (The Completed Circuit)

Most systems stop at layer 2. MAIA completes the circuit into output.

```
1. Inner Layer
   journaling · emotional state · shadow work · elemental profile

2. Translation Layer
   symbolic interpretation · pattern detection · narrative shaping

3. Expression Layer (new — this build)
   songwriting · writing · visual creation · voice
```

---

## Nathan's Role

Nathan is not a beta tester or facilitator.

He is the **Founding Artist Interface**:
- His behavior defines UX decisions
- His friction points define what to build next
- His workflow becomes the baseline model for all creative users

**Engagement sequence:**

1. Send: *"I built something for you to try. It helps turn what you're working through into songs — without taking over the process."* + private link. No long explanation.
2. Let him use it. Watch: where he slows down, what he ignores, what he repeats.
3. Then give him this spec: *"What you used is actually part of a larger system I'm building. You're the first person shaping it."*

**Signal to watch:**

| Where he resists | Where he leans in | Where he's surprised |
|-----------------|-------------------|----------------------|
| "this feels generic" | edits instead of replaces | "that's actually good" |
| skips suggestions | reuses outputs | "I wouldn't have thought of that" |
| "this isn't me" | asks for variations | pauses and reads twice |

---

## Critical Constraint: Co-Creation Balance

MAIA must never:
- Write full songs too easily
- Dominate the process
- Make it feel like "press button → song"

The correct feeling: **a second mind sitting beside him**, not a generator producing for him.

If he feels authorship, the product works. If he feels like a prompt engineer, it doesn't.

---

## Nathan's First Session Flow

This is the exact experience he has on first use. Every screen, every decision, every output.

### Entry

Path: `/maia/songwriter` (or temporary: `/songwriter` before MAIA nav integration)

No onboarding wall. One screen. One question:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   What are you working through right now?       │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │                                         │   │
│   │                                         │   │
│   │                                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   This can be a feeling, a line, a memory,      │
│   or something you can't quite name yet.        │
│                                                 │
│                        [ Start writing → ]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

No genre picker. No style selector. No mood sliders. Just the question.

---

### Response (what Nathan sees ~5–8 seconds later)

Three panels appear. Not a wall of text. Quiet, readable, editable.

**Panel 1 — What I heard**
```
Theme           disconnection / observer self
Feeling         melancholic, looking inward
Direction       first-person watching own life from outside
```
Editable. He can correct this before anything else generates.

**Panel 2 — A starting place**
```
Possible titles
  From the Outside
  Watching Me
  Glass Between

Verse 1 (rough)
  I've been standing in the doorway
  Of a life I used to know
  Everything is moving forward
  But I'm somewhere far below

Chorus (rough)
  I'm watching me from the outside
  Like a stranger passing through
  Every word feels like an echo
  Of something I never knew
```

Label matters: **"A starting place"** not "Your song." This is a sketch, not a finished product.

**Panel 3 — Chords to try**
```
Key    D major (Capo 2)
Feel   introspective, warm — resolves but doesn't rush

Verse    D – A – Bm – G
Chorus   G – D – A – Bm
Bridge   Am – C – G – D
```

One progression. Not three options. He can ask for alternatives, but he starts with one clear suggestion.

---

### What He Does Next (The Canvas)

The three panels collapse into a **Song Canvas** — his workspace.

```
┌────────────────────────────────────────────────────────────┐
│ From the Outside                          [Save] [Export]  │
│ D major · Capo 2 · introspective                           │
├──────────────────┬─────────────────────────────────────────┤
│                  │                                         │
│  Sections        │  Verse 1                               │
│  ───────         │  ─────────────────────────────────────  │
│  ✦ Verse 1       │  I've been standing in the doorway      │
│    Verse 2       │  Of a life I used to know               │
│    Chorus        │  Everything is moving forward           │
│    Bridge        │  But I'm somewhere far below            │
│    Outro         │                                         │
│                  │  [Expand] [Tighten] [Rewrite] [Ask]     │
│  + Add section   │                                         │
│                  │  Chorus                                 │
│                  │  ─────────────────────────────────────  │
│                  │  I'm watching me from the outside...    │
│                  │  [Expand] [Tighten] [Rewrite] [Ask]     │
│                  │                                         │
│                  │  Chords                                 │
│                  │  ─────────────────────────────────────  │
│                  │  Verse: D – A – Bm – G                  │
│                  │  Chorus: G – D – A – Bm                 │
│                  │  [Try different key] [Show fingering]   │
│                  │                                         │
└──────────────────┴─────────────────────────────────────────┘
```

Everything editable. His edits take priority over anything the system generated.

---

### Lyric Actions (How Collaboration Actually Works)

When Nathan clicks **[Ask]** on any section, a small panel opens inline:

```
┌──────────────────────────────────────────────────────────┐
│  What do you want to do with this section?               │
│                                                          │
│  [Expand it]  [Make it more concrete]  [Find the hook]  │
│  [Remove the clichés]  [Try a different rhythm]          │
│                                                          │
│  Or just tell me: ______________________________         │
└──────────────────────────────────────────────────────────┘
```

The free-text option matters. He should be able to say:
- "the second line feels weak"
- "this sounds like every breakup song"
- "I want it to feel more resigned than sad"

System responds with 1–3 variations. Never a single "correct" answer.

**Co-creation rule:** System shows variations. He chooses. He edits. He owns the result.

---

### Chord Exploration

When he clicks **[Try different key]**:

```
You're in D major (Capo 2). What are you after?

  [Darker / more tension]   →   suggests D minor or Am
  [Brighter / more hope]    →   suggests G or A
  [Higher register]         →   suggests Capo 4 or 5
  [Something unexpected]    →   suggests modal or less common

Or tell me your vocal range and I'll suggest from there.
```

No dropdown menus. Directional choices that feel like a conversation.

---

### Structure (When He's Ready)

A separate tab / panel, not the primary view. He gets here when he has at least 2 sections.

```
Your structure so far
  Verse 1 → Chorus

Common shapes for this kind of song
  Verse · Verse · Chorus · Verse · Chorus · Bridge · Chorus   ← most familiar
  Verse · Chorus · Verse · Chorus · Bridge · Chorus           ← tighter
  Verse · Verse · Bridge · Chorus (no early chorus)           ← more tension

Where this song might peak
  The chorus you have builds well. The bridge is where it could break open.
  You don't have a bridge yet — want to write one now, or leave space?
```

Suggestions, not prescriptions.

---

### Ending the Session

When Nathan closes or pauses, the system saves everything automatically and shows:

```
Session saved.

What you worked on:   disconnection / observer self
Sections drafted:     Verse 1, Chorus
Chords:               D major, Capo 2
Title:                From the Outside

Next time you return, you'll pick up here.
If something new comes up before then, start a new seed — it might become a second song,
or it might deepen this one.
```

No forced reflection prompt. No rating. Just presence and continuity.

---

## Strategic Position

| Platform | What they do |
|----------|-------------|
| Suno | Auto-generates finished songs from prompts |
| Udio | Upload + remix + inpainting on generated audio |
| **MAIA Songwriter** | **Develops songs with you — inner state to finished composition** |

This does not compete with Suno or Udio. It competes with a blank page and a guitar.

**The niche:** the best AI collaborator for acoustic singer-songwriters who want to write better songs.

---

## The Workflow (Full Arc)

```
Seed → Lyrics → Chords → Melody → Structure → Refinement → Recording
```

### Stage 1 — Seed
Input: feeling, journal, phrase, memory, conversation
Output: theme, emotional tone, narrative direction, 3–5 titles

### Stage 2 — Lyrics Development
Support modes: expand, rewrite (light/heavy), sharpen imagery, match syllable count, surface clichés

Voice protection: system asks "what feeling are you after?" before rewriting. Never assumes.

### Stage 3 — Chord Progression
Output: key + capo + progressions per section + tension/release guidance + strumming feel
Differentiator: suggestions stay in his vocal range. System never suggests a key that doesn't fit.

### Stage 4 — Melody Guidance
Not a vocal track. Melodic contour, phrasing notes, syllable rhythm, optional MIDI sketch.

### Stage 5 — Structure Builder
Section sequence, emotional peak placement, where to simplify vs. intensify.

### Stage 6 — Refinement
Line-by-line critique, filler removal, imagery strengthening, voice consistency check.

### Stage 7 — Recording Support
Tempo, strumming/picking patterns, mic placement basics, simple home recording chain.

---

## Core Features (MVP)

### Song Canvas
Primary workspace. Sections: Idea / Lyrics (per section) / Chords / Melody notes / Structure / Notes

### Lyric Assistant
Expand · Rewrite (light/heavy) · Sharpen imagery · Match syllables · Rhyme variants · Flag clichés

### Chord Engine (Key Differentiator)
Input: mood + vocal range + style + section type
Output: playable acoustic progressions + capo + fingering notes + tension analysis
Later: chord diagrams, alternative voicings, transposition helper

### Voice-Aware Suggestions
Asked once: vocal range, playing style, influences
Then: all key suggestions stay in his range

### Iteration Memory
Tracks: preferred keys, lyrical themes, chord styles, structural preferences
Surfaces: "You write a lot in D minor. Here's what you haven't tried yet."

---

## Backend Services

### `lib/songwriter/seedInterpreter.ts`
```typescript
interpretSeed(input: string): Promise<SeedInterpretation>
// → { theme, emotionalTone, narrativeDirection, titleSuggestions[], verseDraft, chorusDraft }
```

### `lib/songwriter/lyricAssistant.ts`
```typescript
expandLine(line: string, context: SongContext): Promise<string[]>
rewriteLine(line: string, instruction: string, context: SongContext): Promise<string>
critiqueSection(section: string, context: SongContext): Promise<LyricCritique>
matchSyllables(line: string, targetCount: number): Promise<string[]>
```

### `lib/songwriter/chordEngine.ts`
```typescript
generateProgression(params: ChordRequest): Promise<ChordResponse>
transposeProgression(chords: string[], fromKey: string, toKey: string): ChordResponse
```

### `lib/songwriter/structureBuilder.ts`
```typescript
suggestStructure(seed: SeedInterpretation, sections: SongSection[]): Promise<StructureSuggestion>
findEmotionalPeak(sections: SongSection[]): Promise<PeakAnalysis>
```

---

## API Surface

### `POST /api/songwriter/seed`
```json
{ "content": "I've been feeling disconnected..." }
→ { "theme", "emotional_tone", "title_suggestions", "verse_draft", "chorus_draft", "chord_suggestion" }
```

### `POST /api/songwriter/lyric/assist`
```json
{ "song_id", "section", "line", "operation": "expand|rewrite|tighten|critique", "instruction" }
```

### `POST /api/songwriter/chords`
```json
{ "song_id", "section", "mood", "vocal_range", "style" }
```

### `GET|POST /api/songwriter/songs`
CRUD for song canvas state.

---

## Data Model

### `songs`
```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  seed_input TEXT,
  theme TEXT,
  emotional_tone TEXT,
  key_signature TEXT,
  capo INTEGER,
  tempo_bpm INTEGER,
  structure TEXT[],
  sections JSONB,
  melody_notes TEXT,
  recording_notes TEXT,
  status TEXT DEFAULT 'draft'
);
```

### `song_iterations`
```sql
CREATE TABLE song_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id),
  member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  section TEXT,
  line_original TEXT,
  operation TEXT,
  instruction TEXT,
  line_result TEXT,
  accepted BOOLEAN
);
```

### `songwriter_profile`
```sql
CREATE TABLE songwriter_profile (
  member_id UUID PRIMARY KEY REFERENCES members(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  vocal_range TEXT,
  playing_style TEXT,
  influences TEXT[],
  preferred_keys TEXT[],
  preferred_capo_range INT[],
  lyrical_themes TEXT[],
  structural_preferences JSONB
);
```

---

## Prompt Architecture

All songwriter prompts run through Claude (sovereign, no OpenAI).

Each prompt:
1. Establishes the songwriter's voice and intent
2. Supplies song context (theme, existing sections, chord structure)
3. Issues a narrow, specific operation
4. Returns structured output (never prose walls)

**Key constraint:** prompts never over-polish. The system works at the level of craft. Clichés are surfaced and questioned, not silently avoided.

**Voice protection rule:** before any rewrite, the system asks what feeling the writer is after. Never assumes.

**Co-creation rule:** system always offers 1–3 variations. The songwriter chooses. They edit. They own.

---

## Cohort Strategy (After Nathan)

Keep it tight: **3–5 total**
- Nathan (anchor — acoustic, established workflow)
- 1 intuitive/poetic type (leads from feeling, not theory)
- 1 beginner (tests whether it works without musical knowledge)
- 1 technically strong musician (stress-tests chord engine and structure logic)

**What you're testing:** not "does it work?" but "does it support different creative identities?" and "where does it overstep?"

---

## Implementation Phases

### Phase 1 — Seed + Canvas + Chord Engine (Weeks 1–3)
MVP. No audio. Full value.
- `POST /api/songwriter/seed`
- Song Canvas UI
- Chord Engine
- `songs` DB table
- Nathan test: input a feeling, get a song skeleton back

### Phase 2 — Lyric Assistant + Refinement (Weeks 4–6)
- `POST /api/songwriter/lyric/assist`
- Per-line action buttons in canvas
- Voice-aware suggestions (vocal range)
- `song_iterations` table

### Phase 3 — Structure + Melody Guide (Weeks 7–9)
- Structure builder UI
- Melody contour suggestions
- Recording support tab

### Phase 4 — Memory + Audio Sketch (Weeks 10–14)
- `songwriter_profile` adaptation
- Optional MIDI sketch
- Export (chord chart PDF, lyrics doc)
- Connect to MAIA journal / dream feed (opt-in)

---

## What Not to Build First
- Full audio generation
- Community / social features
- Marketplace
- DAW integration
- Mobile app

---

## The Strategic Sentence

> MAIA Songwriter is not a music generator.
> It is the most thoughtful collaborator an acoustic singer-songwriter has ever had —
> one that knows their voice, remembers their themes, and helps them write the song they actually meant to write.

---

## Future Expansion (Creative Mode Umbrella)

Once the songwriter module is proven:

```
MAIA Creative
  ├── Songwriter    (v1 — this build)
  ├── Writer        (narrative, poetry, memoir)
  ├── Visual        (concept, mood board, symbolic interpretation)
  └── Voice         (spoken word, performance)
```

Inner experience → creative output across domains. That's the platform.
