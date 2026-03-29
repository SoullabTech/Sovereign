# Voice Presence Architecture v1.0

**Status**: Specification (pre-implementation)
**Date**: 2026-03-29
**Scope**: Sovereign voice cloning, presence encoding, and runtime modulation

---

## 1. Baseline: What Exists

| Component | Role | Status |
|-----------|------|--------|
| **Kokoro** (`maia-kokoro-tts`) | Fast neural TTS inference. Local, sovereign. | Live |
| **XTTS v2** | Voice cloning (zero-shot) and fine-tuning (high-fidelity). Open-source. | Available, not integrated |
| **Sovereign Voices** (`lib/voice/sovereignVoices.ts`) | Voice identity registry. Maps archetype IDs to Kokoro voice IDs. | Live |
| **Speech Director** (`lib/voice/voiceMap.ts`, tone offsets) | Speed, warmth, clarity, guidance, energy modifiers per utterance. | Live |
| **Elemental Conductor** (`lib/voice/conductor.ts`) | Determines dominant element from conversation state with hysteresis. | Live |
| **Spiral State** (`lib/consciousness/spiralStatePersistence.ts`) | Tracks member's phase, motion, intensity across sessions. | Live |
| **Relational Phase** (`member_spiral_state.relational_phase`) | Maturation stage: orientation → capacity → autonomy → seasonal return. | Live |

**Foundation voice**: Maia (Bella) — Kokoro `af_bella`. Pace +0.24, Warmth +0.17, Clarity +0.10, Guidance -0.08, Energy +0.02.

---

## 2. Three Tiers (Locked)

| Tier | Name | Input | Processing | Output | Use Case |
|------|------|-------|------------|--------|----------|
| 1 | **Instant Clone** | 10–30s audio clip | XTTS zero-shot extraction | Speaker embedding file | Member tries their voice with MAIA. Exploratory. |
| 2 | **Studio Clone** | 5–15 min guided recording | XTTS fine-tune (light, ~30 min training) | Tuned voice model | Member's personal MAIA voice. Daily use quality. |
| 3 | **Signature Voice** | 30–60 min studio recording + curation | XTTS full fine-tune + prosody calibration | Production voice model | Soullab canonical voice, Master voices, practitioner voices. |

### Constraints

- Tier 1 is the only tier exposed initially. Tiers 2 and 3 require manual promotion.
- No tier produces a "general purpose" voice. Every output is scoped to MAIA's runtime pipeline.
- A member can have exactly **one active voice model** at a time. Previous models are archived, not deleted, unless the member requests deletion.

---

## 3. Voice Model Lifecycle

### Create

1. Member enters Voice Forge (UI surface, future).
2. Guided recording session: MAIA presents prompts designed to capture full phonetic range + emotional variation.
3. Audio captured locally. Never leaves the machine.
4. For Tier 1: raw audio → XTTS zero-shot → speaker embedding (~5s processing).
5. For Tiers 2–3: raw audio → preprocessing (noise reduction, segmentation) → XTTS fine-tune → voice model.

### Process

- **Zero-shot** (Tier 1): XTTS extracts a speaker embedding from the clip. No training. Fast.
- **Fine-tune** (Tiers 2–3): XTTS trains a voice model checkpoint. GPU-bound. Runs on Mac Studio (M2 Ultra).
- Processing is queued via `maia-voice-forge` worker. Member is notified on completion.

### Store

| Artifact | Location | Format | Size (approx) |
|----------|----------|--------|----------------|
| Raw recording | `data/voice-forge/{memberId}/raw/` | WAV 48kHz | 50–500 MB |
| Speaker embedding | `data/voice-forge/{memberId}/embedding.npy` | NumPy | ~2 KB |
| Fine-tuned model | `data/voice-forge/{memberId}/model/` | XTTS checkpoint | ~500 MB |
| Voice config | `member_voice_models` table | JSON metadata | <1 KB |

### Load

- On conversation start, if member has an active voice model, load speaker embedding into Kokoro/XTTS inference context.
- Loading is lazy: first utterance triggers model warm-up (~200ms for embedding, ~2s for fine-tuned model).
- Fallback: if member model fails to load, use foundation voice (Bella). Log the fallback. Never fail silently.

### Delete

- Member can delete their voice model at any time from Account settings.
- Deletion removes: raw audio, embedding, fine-tuned model, all metadata.
- Deletion is **irreversible and immediate**. No soft-delete, no retention period.
- Confirmation UI: "This will permanently delete your voice model. You'll need to record again to create a new one."

---

## 4. Runtime Pipeline

```
User speaks → STT (Whisper, local)
                ↓
MAIA processes → Oracle route → LLM response text
                ↓
        ┌─────────────────────────────┐
        │   Speech Director           │
        │                             │
        │   Inputs:                   │
        │   - response text           │
        │   - member tone offsets     │
        │   - current element         │
        │   - spiral phase/motion     │
        │   - relational phase        │
        │   - voice mode (Talk/Care)  │
        │                             │
        │   Outputs:                  │
        │   - speed modifier          │
        │   - style/emotion tags      │
        │   - pause instructions      │
        │   - emphasis markers        │
        └──────────┬──────────────────┘
                   ↓
        ┌─────────────────────────────┐
        │   Voice Engine (Kokoro)     │
        │                             │
        │   Inputs:                   │
        │   - shaped text + SSML      │
        │   - voice model (member's   │
        │     or foundation)          │
        │   - prosody parameters      │
        │                             │
        │   Output:                   │
        │   - audio stream (MP3)      │
        └──────────┬──────────────────┘
                   ↓
        Audio playback → StreamingAudioQueue
```

### Separation of concerns

| Layer | Responsibility | Does NOT do |
|-------|---------------|-------------|
| **Voice Model** | Generate speech that sounds like a specific person | Decide how to speak |
| **Speech Director** | Shape prosody, pacing, emphasis based on context | Generate audio |
| **Elemental Conductor** | Determine dominant element and intensity | Modify voice directly |
| **Spiral State** | Track position and motion across sessions | Make real-time decisions |

The voice model is a **rendering surface**. The Speech Director is the **shaping intelligence**. These must never collapse into each other.

---

## 5. Elemental Modulation Layer

### Inputs

| Input | Source | Type |
|-------|--------|------|
| `dominant_element` | Conductor hysteresis buffer | fire / water / earth / air / aether |
| `intensity` | Conductor output | 0.0–1.0 |
| `voice_mode` | Session state | Talk / Care / Scribe |
| `spiral_phase` | `member_spiral_state` | 1–12 |
| `motion` | `member_spiral_state` | ascending / stuck / breakthrough |

### Outputs (instruction modifiers)

| Element | Speed | Pause Weight | Energy | Warmth | Constraint |
|---------|-------|-------------|--------|--------|------------|
| **Fire** | +10–20% | Short pauses | High | Neutral | Never aggressive |
| **Water** | -10–15% | Long pauses, held silence | Low | High | Never sluggish |
| **Earth** | Baseline | Even spacing | Medium | Medium | Never monotone |
| **Air** | +5–10% | Quick, light | Medium-high | Low-medium | Never sharp |
| **Aether** | -5–10% | Extended silence between phrases | Low | Neutral | Never theatrical |

### Constraints

1. **No stacking**: Only one element modulates at a time. The conductor resolves conflicts before this layer sees them.
2. **No contradiction**: If member's tone offsets oppose the elemental modulation (e.g., member sets Pace slow, Fire wants fast), member's offsets take precedence. Element modulation applies as a **bias within the member's range**, not an override.
3. **Intensity scaling**: All modulations scale linearly with conductor intensity. At intensity 0.3, Fire adds +3–6% speed, not +10–20%.
4. **Mode interaction**: Care mode dampens all modulations by 30%. Talk mode applies full. Scribe mode disables elemental modulation entirely (neutral rendering).

---

## 6. Relational Memory Interaction

### What conditions the voice

- **Relational phase** (orientation → capacity → autonomy → seasonal return):
  - Phase 1 (orientation): Slightly slower, warmer. MAIA is introducing herself.
  - Phase 2 (capacity): Baseline. Direct, clear.
  - Phase 3 (autonomy): Slightly faster, less warm. MAIA steps back.
  - Phase 4 (seasonal return): Warmth returns but pace stays efficient. Recognition without regression.

- **Autonomy streak**: If member has 5+ consecutive autonomous sessions, MAIA's voice becomes more economical. Fewer filler phrases, tighter pacing.

- **Return count**: If member returns after autonomy, first session has slightly more warmth (+0.05 bias) then normalizes.

### What does NOT condition the voice

- Emotional content of the conversation (no sentiment-to-prosody mapping — that path leads to manipulation).
- Member's stated mood (MAIA does not mirror emotional states through voice modulation).
- Session length or frequency (no reward/punishment signaling through voice changes).

### Identity coherence rule

The voice must always be recognizably the **same voice**. Modulation shifts parameters within a narrow band. If a member heard two recordings from different sessions, they should recognize the same speaker with natural variation — not two different characters.

---

## 7. Consent and Ownership

### Non-negotiables

1. **Member owns their voice model.** Soullab stores it; the member controls it.
2. **Delete means delete.** No backups, no retention, no "we keep it for 30 days."
3. **No cross-member access.** Member A's voice model is never used for Member B, under any circumstance.
4. **No training data extraction.** Voice models are not used to improve general models, train other systems, or generate synthetic data.
5. **Recording consent is explicit.** Before the first recording, member sees: "Your voice will be processed locally to create a personal voice model. The recording and model are stored on Soullab's sovereign infrastructure and never leave this machine. You can delete them at any time."
6. **No ambient capture.** Voice models are created only from explicit recording sessions, never from conversation audio.

### Master voice consent (additional)

Masters who create Signature voices for use by their students/members must:
- Explicitly authorize each use context
- Retain the right to revoke at any time
- Be informed of how many members are using their voice model

---

## 8. Infrastructure

### New service: `maia-voice-forge`

```yaml
# docker-compose.production.yml addition
maia-voice-forge:
  build:
    context: ./services/voice-forge
  volumes:
    - voice-data:/data/voice-forge
  environment:
    - XTTS_MODEL_PATH=/models/xtts-v2
  deploy:
    resources:
      limits:
        memory: 8G
  depends_on:
    maia-postgres:
      condition: service_healthy
```

### Database additions

```sql
CREATE TABLE member_voice_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  tier TEXT NOT NULL CHECK (tier IN ('instant', 'studio', 'signature')),
  status TEXT NOT NULL CHECK (status IN ('recording', 'processing', 'ready', 'failed', 'archived')),
  model_path TEXT,
  embedding_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Consent audit trail
CREATE TABLE voice_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  action TEXT NOT NULL, -- 'recording_started', 'model_created', 'model_deleted', 'consent_given', 'consent_revoked'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. What NOT to Build Yet

- Voice marketplace or sharing between members
- Multi-voice blending (e.g., "80% my voice, 20% Atlas")
- Real-time voice conversion (speaking as someone else live)
- Emotional sentiment-to-prosody mapping
- Cross-language voice cloning
- Persona stacking (multiple personality voices)

These may have value later. They are excluded now to prevent scope drift and identity fragmentation.

---

## 10. Implementation Sequence

1. **Now**: Ship and stabilize current voice fixes (mic restart, foundation voice).
2. **Next**: Build `maia-voice-forge` container with XTTS v2. CLI-only. No UI.
3. **Then**: Implement Tier 1 (instant clone) with CLI test surface. Validate quality.
4. **Then**: Build recording UI in MAIA (guided session flow).
5. **Then**: Implement Tier 2 (studio clone) for early Masters.
6. **Later**: Tier 3 (signature voice) with full curation pipeline.

Each tier ships independently. No tier depends on the next.
