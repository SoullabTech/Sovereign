---
name: MAIA Native Voice System
description: Voice sovereignty flip, style presets, speech director, provider strategy — built 2026-03-28
type: project
---

## What was built (PR on claude/heuristic-tharp, 2026-03-28)

MAIA-native voice system replacing OpenAI TTS as default with Kokoro (local).

### Architecture
```
MAIA response → Text Shaper → Style Preset Resolution → Provider Adapter → Audio
                                                         ├── Kokoro: speed + pauses + chunks
                                                         └── OpenAI: instruction-guided prosody
```

### Key files
- `lib/voice/stylePresets.ts` — 6 delivery modes
- `lib/voice/textShaper.ts` — pre-speech clause breaking, markdown strip
- `lib/voice/agentToneMap.ts` — context-aware preset resolution
- `lib/tts/prosody/kokoroProsody.ts` — Kokoro adapter
- `lib/tts/prosody/openaiInstructions.ts` — OpenAI Speech Director
- `lib/tts/voiceCache.ts` — in-memory LRU cache
- `lib/tts/providers/voxtral.ts` — dark-launched stub
- `docs/maia-voice-spec-v1.md` — design standard
- `docs/maia-speech-director-spec-v1.md` — authoritative spec

### Sovereignty flip
- `voiceArchetypes.ts` — default provider flipped from openai to kokoro
- `ttsRouter.ts` — auto mode = kokoro, archetype force-routing removed
- `openai-tts/route.ts` — archetype intercept removed, Speech Director added

### Three-lane provider strategy
- **Lane 1 (default):** Kokoro — sovereign, local, Apache-2.0
- **Lane 2 (fallback/premium):** OpenAI — consent-gated, Speech Director improves quality
- **Lane 3 (incubation):** Voxtral stub (CC BY-NC, not production), CSM-1B (Apache-2.0) most promising open candidate

### Six style presets
grounded_reflective, quiet_containing, clear_direct, shadow_depth, mentor_firm, ritual_spacious

### Core principle
Voice logic sits above the provider. Swapping engines later = swapping instruments, not rebuilding MAIA's speech mind.

**Why:** Kokoro license is Apache-2.0 (not MIT as sometimes stated). Voxtral is CC BY-NC 4.0 — prototyping only.

**How to apply:** When touching voice code, ensure changes are provider-agnostic (in presets/shaping/routing), not provider-specific. The adapter layer is the only place provider assumptions should live.

### Next phase
Calibration by ear — structured listening pass across 6 test cases, scoring naturalness/MAIA-ness/emotional fit. Create `docs/voice-listening-calibration.md` with results.
