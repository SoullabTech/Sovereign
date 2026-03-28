# MAIA Speech Director Spec v1

## Purpose

The Speech Director is the layer that turns MAIA's response into:

1. **spoken-form text**
2. **delivery mode**
3. **provider-specific voice instructions**

It does **not** decide meaning.
It decides **how meaning should land in voice**.

---

## Core Responsibilities

### A. Shape text for speech

Convert written prose into:
- speakable clauses
- cleaner sentence rhythm
- reduced punctuation burden
- fewer nested phrases

### B. Resolve style preset

Pick one of the MAIA presets based on:
- agent
- emotional state
- interaction state
- user request style

### C. Build provider-specific speech guidance

Same preset, different output format:
- **Kokoro** -> speed, pauses, chunking
- **OpenAI** -> natural-language delivery instructions

### D. Preserve MAIA identity across providers

No matter which provider speaks, MAIA should still sound:
- grounded
- calm
- intelligent
- non-assistant-y
- non-theatrical

---

## Inputs

```ts
type SpeechDirectorInput = {
  rawText: string
  agent?: "main" | "guide" | "shadow" | "mentor" | "fire" | "water" | "earth" | "air" | "aether"
  emotionalTone?: "grief" | "activation" | "panic" | "confusion" | "reflection" | "ritual" | string
  interrupted?: boolean
  looping?: boolean
  userAskedForDirectness?: boolean
  firstResponse?: boolean
  element?: "fire" | "water" | "earth" | "air" | "aether"
  provider: "kokoro" | "openai"
}
```

---

## Outputs

### For all providers

```ts
type SpeechDirectorOutput = {
  shapedText: string
  stylePreset:
    | "grounded_reflective"
    | "quiet_containing"
    | "clear_direct"
    | "shadow_depth"
    | "mentor_firm"
    | "ritual_spacious"
}
```

### Additional for OpenAI

```ts
type OpenAISpeechOutput = SpeechDirectorOutput & {
  instructions: string
}
```

### Additional for Kokoro

```ts
type KokoroSpeechOutput = SpeechDirectorOutput & {
  speed: number
  sentencePauseMs: number
  clausePauseMs: number
  chunkStrategy: "balanced" | "tight" | "spacious"
}
```

---

## Preset Resolution Rules

### Default agent map

| Agent  | Preset              |
|--------|---------------------|
| main   | grounded_reflective |
| guide  | quiet_containing    |
| shadow | shadow_depth        |
| mentor | mentor_firm         |
| fire   | clear_direct        |
| water  | quiet_containing    |
| earth  | grounded_reflective |
| air    | clear_direct        |
| aether | ritual_spacious     |

### Emotional overrides

| Emotional tone | Preset              |
|----------------|---------------------|
| grief          | shadow_depth        |
| activation     | quiet_containing    |
| panic          | quiet_containing    |
| confusion      | clear_direct        |
| reflection     | grounded_reflective |
| ritual         | ritual_spacious     |

### Interaction overrides

- `userAskedForDirectness = true` -> `clear_direct`
- `interrupted = true` -> `clear_direct`
- `looping = true` -> `mentor_firm`
- `firstResponse = true` -> keep preset, soften opening pacing

### Resolution order

```
agent default -> emotional override -> interaction override
```

---

## MAIA Identity Instruction (always present for OpenAI)

```
Speak as MAIA: grounded, calm, articulate, and human.
Do not sound like a virtual assistant.
Do not sound overly cheerful, salesy, breathy, or theatrical.
Favor natural speech, clean pacing, and relational presence.
Let meaning land without overperforming it.
```

---

## Style Preset Instruction Templates

### grounded_reflective

**When:** main MAIA responses, journaling, meaning-making, earth-aligned stability

```
Speak with calm clarity and grounded warmth.
Use a moderate pace.
Let each thought land naturally.
Use gentle pauses between ideas.
Do not sound dramatic, breathy, or overly soft.
Sound thoughtful and present.
```

### quiet_containing

**When:** guide mode, overwhelm, activation, water-regulation

```
Speak steadily and softly, with low-arousal calm.
Use a slightly slower pace.
Keep the tone containing and reassuring without sounding therapeutic or sentimental.
Use short stabilizing pauses.
Do not overemphasize emotion.
```

### clear_direct

**When:** action steps, confusion, fire/air mode, "just tell me"

```
Speak clearly, directly, and cleanly.
Use a slightly faster pace.
Keep the tone grounded and decisive.
Minimize softness and poetic drift.
Use crisp sentence endings.
Do not sound harsh.
```

### shadow_depth

**When:** grief, dream material, shadow work, ambiguity

```
Speak more slowly, with quiet depth and spacious pacing.
Allow silence around key phrases.
Keep the tone grounded and inward, not solemn or theatrical.
Do not sound mystical for effect.
Let the weight come from restraint.
```

### mentor_firm

**When:** repeated looping, accountability, pattern interruption

```
Speak with measured firmness and calm authority.
Use a clear, steady pace.
Emphasize the key point cleanly.
Do not sound punitive, parental, or aggressive.
Be direct without sharpness.
```

### ritual_spacious

**When:** meditations, threshold states, ceremony, invocation

```
Speak slowly and spaciously.
Leave more room between phrases.
Keep the tone quiet, clear, and unforced.
Do not perform reverence.
Let the stillness carry the words.
```

---

## Element Overlays

Subtle modifiers, not separate personalities.

| Element | Overlay |
|---------|---------|
| Fire    | Add slightly more forward energy and clarity. Keep it disciplined, not intense. |
| Water   | Add emotional gentleness and receptivity. Keep the tone steady and contained. |
| Earth   | Add groundedness and steadiness. Favor clarity and embodied calm. |
| Air     | Add crispness and conceptual clarity. Keep the phrasing clean and light. |
| Aether  | Add spaciousness and simplicity. Reduce vocal density. |

---

## Text Shaping Rules

### Always do

- break long sentences into shorter spoken units
- convert comma-heavy structures into sentence-level rhythm
- preserve meaning over punctuation
- remove markdown artifacts
- flatten parentheticals
- convert bullet lists into spoken sequence

### Usually do

- move the key phrase to sentence ending
- reduce abstraction density
- add line breaks where pauses help meaning

### Do not do

- over-fragment everything
- create fake poetry
- insert theatrical pause markers
- over-soften direct language
- turn MAIA into an audiobook narrator

---

## Example Transformations

### Reflective prose

**Raw:** You're not actually confused so much as split between two loyalties, and because both matter, you keep converting the conflict into analysis.

**Shaped:** You're not actually confused. You're split between two loyalties. And because both matter, you keep converting the conflict into analysis.

**Preset:** grounded_reflective

### Direct guidance

**Raw:** The issue is that you keep asking for certainty before action, which guarantees delay.

**Shaped:** The real issue is simple. You keep asking for certainty before action. And that guarantees delay.

**Preset:** clear_direct

### Grief / shadow

**Raw:** Part of your pain is that you are trying to mourn and negotiate at the same time.

**Shaped:** Part of the pain is this: you are trying to mourn and negotiate at the same time.

**Preset:** shadow_depth

### Overwhelm regulation

**Raw:** You do not need to resolve the whole system tonight; you only need to stop escalating it.

**Shaped:** You do not need to resolve the whole system tonight. You only need to stop escalating it.

**Preset:** quiet_containing

---

## Provider Policy

### Default

```
provider = kokoro
fallback = openai
experimental = voxtral or future open model
```

### Premium

```
if user_allows_cloud_voice and premium_voice_requested:
    provider = openai
else:
    provider = kokoro
```

### Fallback

```
if kokoro_errors:
    provider = openai (consent-gated)
```

---

## Evaluation Criteria

Score each sample 1-5 on:
- naturalness
- MAIA identity
- emotional fit
- clarity
- non-robotic pacing
- non-theatrical delivery
- provider fit

### Success sounds like

- Kokoro sounds more human because text is shaped better
- OpenAI sounds more MAIA-like because it receives direction
- Both providers sound like the same intelligence using different instruments

---

## Implementation Map

| Responsibility | Module |
|---|---|
| Shape text | `lib/voice/textShaper.ts` |
| Resolve preset | `lib/voice/agentToneMap.ts` |
| Kokoro adapter | `lib/tts/prosody/kokoroProsody.ts` |
| OpenAI instructions | `lib/tts/prosody/openaiInstructions.ts` |
| Style preset params | `lib/voice/stylePresets.ts` |
| Voice cache | `lib/tts/voiceCache.ts` |
| Provider routing | `lib/tts/ttsRouter.ts` |
| TTS endpoint | `app/api/voice/openai-tts/route.ts` |

---

## Operational Summary

> Claude turns MAIA's response into spoken form and gives the voice its direction.
> Kokoro or OpenAI then perform that direction in their own way.
