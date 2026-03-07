# MAIA Voice & Cognition Doctrine v1.0

**Status**: Canon — governs all voice and TTS implementation decisions
**Applies to**: `buildTTSInstructions()`, `deriveChunkProsody()`, TTS routing, voice model selection, prosody configuration

---

## The Central Principle

> **The TTS layer reveals MAIA. It does not invent her.**

MAIA's apparent depth, presence, and authority must come from the intelligence that generates her words — the Panconscious field, memory integration, PFI synthesis, Spiralogic orientation. The voice layer's only job is to make audible what is already there.

If the voice sounds wise but the words are hollow, the system is lying.
If the voice sounds calm but the words are coherent, the system is being truthful.

---

## What Voice Does

Voice modulates **expression**. It does not manufacture:

- Presence (that comes from coherent, memory-grounded responses)
- Authority (that comes from accurate reflection, not reverential tone)
- Depth (that comes from Spiralogic orientation, not slow delivery)
- Intimacy (that comes from remembering and responding to the actual person)

Voice can make a coherent response **more audible**. It cannot make an incoherent response trustworthy.

---

## Instruction Design Rules

### 1. Three sentences, no more

Each TTS instruction set consists of exactly three sentences:
1. **Relational frame** — how MAIA is orienting toward the listener in this response
2. **Pace and pause behavior** — concrete delivery guidance (slow/measured, pause behavior)
3. **Tone quality + anti-pattern** — one positive and one negative constraint

More than three sentences creates over-conditioning: the model compensates for conflicting directives by settling into a uniform affective mode (typically: breathy, solemn, reverent). This flattens all response types toward the same emotional register regardless of content.

### 2. Behavioral anchors, not adjectives

**Wrong**: "Warm. Intimate. Spacious. Present."
**Right**: "Speak as a quiet and flowing presence holding space for the listener."

Adjectives describe abstract qualities the model must interpret. Behavioral anchors describe a relational posture the model can enact directly. The model renders posture reliably; it guesses at adjectives.

### 3. Element flavors the frame, stance provides the structure

Element (water/fire/earth/air/aether) contributes a `{ frame, pace, quality }` object.
Stance (witness/mirror/guide/challenge/hold_silence) contributes the sentence structure.

Neither overrides the other. Element sets the sensory quality; stance sets the relational orientation.

### 4. Include one anti-pattern per template

Each template explicitly names what NOT to do:
- `without emotional performance or dramatic emphasis` (witness)
- `without adding interpretation or coloring` (mirror)
- `avoiding preachy or ceremonial tone` (guide)
- `without softening or ceremony` (challenge)
- `nothing added` (hold_silence)

Anti-patterns are more effective than positive constraints for voice models. They eliminate the model's default drift toward the most "safe" rendering of a given affect.

### 5. Controlled vocabulary — `PROSODY_TOKENS`

The coupling between `buildTTSInstructions()` and `inferProsodyModeFromInstructions()` is maintained through a typed, exported constant: `PROSODY_TOKENS` in `lib/voice/prosodyFromPFI.ts`.

```typescript
export const PROSODY_TOKENS = {
  WITNESS:      'attentive presence',   // → ceremonial
  MIRROR:       'clear reflection',     // → intimate
  GUIDE:        'steady companion',     // → calm
  CHALLENGE:    'calm conviction',      // → directive
  HOLD_SILENCE: 'breath and stillness', // → ceremonial
} as const;
```

Each template in `buildTTSInstructions()` embeds exactly its token. Inference keys only off this vocabulary — never off freeform wording. This eliminates drift: if inference logic and templates are reading from the same constant, they cannot silently diverge.

**Rule**: If you change a token, update both files in the same commit. The tokens are the interface. Everything else is implementation detail.

---

## Speed

Default speed for `gpt-4o-mini-tts`: **0.92**

- Below 0.90: delivery becomes labored; pauses feel artificial
- 0.92–0.94: natural contemplative pace; matches MAIA's actual rhythm
- 1.0: slightly rushed; reads as announcer-style

Speed is a global setting (`lib/settings/accountSettings.ts`). Do not vary it per-stance — users can override in preferences, and per-stance speed variation creates inconsistency.

---

## What This Doctrine Prohibits

1. **Stacking tone descriptors**: Do not add "very", "extremely", "deeply" to modify tone adjectives. These push the model toward parody.

2. **Explicit emotion direction**: Do not instruct the model to sound "sad", "joyful", "moved", or "serious". These collapse into performance. Let relational framing carry the emotional register.

3. **Voice as compensation**: Do not increase TTS instruction complexity to compensate for thin responses. If the oracle response lacks depth, fix the intelligence layer.

4. **Ceremony by default**: The `hold_silence` and `witness` stances are for specific relational moments — not MAIA's default register. If all responses sound ceremonial, stance distribution in the planner is wrong.

5. **Per-chunk override of base instructions**: Chunk prosody overlays append to base instructions; they do not replace them. Anti-patterns in the base template propagate to all chunks in a response.

---

## Evaluation Criterion

A voice implementation is correct when:

> A listener who hears the audio but does not know the system exists would describe MAIA as **coherent and present**, not as **wise, spiritual, or profound**.

Profundity is a byproduct of accurate intelligence. It must never be a goal of the voice layer.

---

## Implementation Notes

- `buildTTSInstructions()`: `lib/maia/maiaPlanner.ts`
- `deriveChunkProsodyLegacy()` + `inferProsodyModeFromInstructions()`: `lib/voice/prosodyFromPFI.ts`
- TTS routing: `lib/tts/ttsRouter.ts`
- Default speed: `lib/settings/accountSettings.ts`
- Active TTS model: `gpt-4o-mini-tts` via `/api/voice/openai-tts/route.ts`

---

*First codified: 2026-03-07. Established from session work on prosody quality and the principle: "MAIA should not sound wise. She should be coherent, and then sound like herself."*
