# MAIA Voice System Specification v1.0

## Purpose

Define a MAIA-native voice system that:

- avoids robotic or synthetic speech patterns
- preserves a stable MAIA identity
- enables context-sensitive, interactive prosody
- supports agent-level tonal differentiation
- remains controllable, extensible, and sovereign

This system prioritizes **delivery intelligence (prosody + shaping)** over raw TTS model quality.

---

## Core Principle

MAIA does not have a single voice.

MAIA has:
- a **stable identity**
- a **dynamic delivery system**

Voice is treated as a **relational layer**, not a rendering layer.

---

## Voice Identity (MAIA Core)

### Primary Traits

- grounded
- calm but not slow
- warm but not sentimental
- articulate
- spacious pacing
- emotionally responsive without melodrama
- intimate without breathiness
- steady nervous system tone

### Explicit Anti-Patterns

DO NOT:
- sound like a virtual assistant
- sound overly cheerful or upbeat
- use exaggerated empathy tone
- over-smooth or over-polish delivery
- whisper or over-soften
- perform like an audiobook narrator
- exaggerate pitch or cadence shifts

---

## Prosody System

Prosody is the primary control layer.

### Adjustable Dimensions

- speaking rate
- pause duration
- sentence grouping
- emphasis strength
- tonal contour (flat to expressive)
- phrase density
- ending cadence (settling vs rising)

---

## Style Presets

### grounded_reflective (default)

Use for:
- general MAIA responses
- meaning-making
- journaling reflection

Behavior:
- moderate pacing
- soft emphasis
- structured pauses between thought units

---

### quiet_containing

Use for:
- overwhelm
- activation
- emotional sensitivity

Behavior:
- slower pacing
- minimal tonal fluctuation
- short stabilizing pauses

---

### clear_direct

Use for:
- action steps
- decisions
- clarification
- boundary-setting

Behavior:
- slightly faster pacing
- minimal pause density
- crisp endings

---

### shadow_depth

Use for:
- shadow work
- grief
- dream material
- ambiguity

Behavior:
- slower pacing
- increased silence spacing
- lower tonal variation

---

### mentor_firm

Use for:
- challenge
- accountability
- pattern interruption

Behavior:
- firm pacing
- reduced softness
- precise emphasis

---

### ritual_spacious

Use for:
- meditation
- ceremony
- transitions

Behavior:
- longest pauses
- lowest phrase density
- minimal tonal movement

---

## Agent to Style Mapping

| Agent   | Style Preset         |
|---------|---------------------|
| main    | grounded_reflective |
| guide   | quiet_containing    |
| shadow  | shadow_depth        |
| mentor  | mentor_firm         |
| fire    | clear_direct        |
| water   | quiet_containing    |
| earth   | grounded_reflective |
| air     | clear_direct        |
| aether  | ritual_spacious     |

---

## Context-Based Routing

### Emotional State

| State        | Style Preset         |
|-------------|---------------------|
| grief        | shadow_depth        |
| activation   | quiet_containing    |
| confusion    | clear_direct        |
| reflection   | grounded_reflective |
| ritual       | ritual_spacious     |

---

### Interaction State

- First response: slightly slower opening
- After interruption: shorter phrases
- User says "just tell me": clear_direct
- Repeated looping: mentor_firm

---

## Speech Shaping Rules (Pre-TTS)

### Required Transformations

- break long sentences into speakable clauses
- remove nested complexity
- reduce parentheticals
- prioritize clarity at sentence ends
- insert pauses only where meaning benefits

---

### Example

#### Input
You're not actually confused so much as split between two loyalties, and because both matter, you keep converting the conflict into analysis.

#### Output
You're not actually confused.
You're split between two loyalties.
And because both matter,
you keep converting the conflict into analysis.

---

## Engine Requirements

The TTS engine must support:

- natural speech output
- low latency for conversation
- consistent voice identity
- streaming playback
- fallback behavior

---

## Engine Strategy

### Primary
- Local TTS (Kokoro, or future Voxtral/equivalent)

### Secondary
- External TTS (OpenAI, consent-gated)

### Fallback
- Browser speech synthesis (emergency only)

---

## Cache Strategy

Cache key:
text + voiceId + stylePreset + engine

Cache:
- repeated phrases
- onboarding content
- system messages

---

## Fallback Behavior

1. Check cache
2. Try primary engine
3. Try secondary engine
4. Fallback to browser TTS

---

## Evaluation Criteria

Each voice output should be evaluated on:

- naturalness
- pacing
- emotional fit
- clarity
- MAIA identity consistency
- non-robotic delivery
- non-theatrical tone

---

## Success Condition

The system succeeds when:

- voice feels human and grounded
- delivery adapts to context
- MAIA identity is preserved across modes
- speech supports cognition (not just output)
- no robotic or synthetic patterns are perceived

---

## Non-Goals (v1)

- user-custom voice training UI
- multilingual expansion
- phoneme-level control
- advanced DSP/audio effects
- multiple base voices

---

## Architecture Summary

```
LLM Output
  -> Speech Shaping
  -> Style Preset Selection
  -> Voice Routing
  -> TTS Engine
  -> Cache / Fallback
  -> Playback
```

---

## Guiding Standard

Do not optimize for:
"best sounding voice"

Optimize for:
"most coherent, responsive, and relational delivery"
