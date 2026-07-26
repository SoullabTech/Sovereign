# Voice & Interaction Architecture Audit — 2026-07-26 (corrected)

> **Discovery only — no code modified.** Supersedes the first draft
> (`docs/architecture/VOICE_INTERACTION_ARCHITECTURE_AUDIT_2026-07-26.md`), incorporating
> runtime confirmation and the founder corrections of 2026-07-26. Governing ruling:
> `docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md` (§ Ruling).
> Evidence tagged **PROVEN** (source, file:line) / **INFERRED**.

## 0. Layer discipline (corrected framing)

Four distinct layers. A change at one is **not** a change at another:

- **Cognition / language — Claude.** Claude decides *what MAIA says* and phrases it. This is the
  mind. TTS providers do **not** replace it.
- **Orchestration / constitution — AIN.** Memory, consent, relational stance, tool selection,
  authorship policy, persistence, the text/voice distinction.
- **Voice rendering — a governed, replaceable renderer.** OpenAI TTS, local Kokoro, and (not yet
  present) Inworld are *independent peer renderers* that turn finished text into audio. None
  wraps another. **Inworld is not "support for Kokoro."**
- **Playback / interaction — AIN-owned.** Chunking, FIFO queue, barge-in, cancellation live in
  the app (`StreamingAudioQueue`, `OracleConversation`), not in any renderer.

> Ruling wording: *"MAIA's cognitive identity is provider-independent. Voice rendering is a
> governed presentation layer whose default may change only by explicit founder decision after
> comparative evaluation."*

## 1. Executive finding (runtime-confirmed 2026-07-26)

Production env: `MAIA_VOICE_OVERRIDE` **unset**, `MAIA_LOCAL_VOICE_ENABLED=1`,
`MAIA_TTS_PROVIDER=kokoro`, `maia-kokoro-tts` **Up 5 weeks (healthy)**. Yet the default
`maia_core` archetype resolves to `provider:'openai'` (`voiceArchetypes.ts:59,67`), so
`openai-tts/route.ts:131` takes the **"skipping Kokoro"** branch and renders via OpenAI.
The local-first logic (`route.ts:202–204`) is only reachable by Kokoro archetypes, which the
default never is. **Therefore MAIA's production default voice is rendered by OpenAI cloud today,
while a healthy local Kokoro sits bypassed.** This is a code-level short-circuit overriding the
sovereign env config — the defect Phase 0 addresses.

## 2. Corrected architecture diagram (supported by code)

```
Member speech
   │
   ▼  [AIN / local]  STT — Web Speech API + local faster-whisper (WHISPER_LOCAL_URL)
   │
   ▼  [AIN + Claude] orchestration + cognition — /api/sovereign/app/maia → getMaiaResponse
   │                 (Claude authors substance AND wording; complete, not streamed)
   ▼  [AIN]          response TEXT — persisted to conversation_turns, independent of TTS
   │
   ▼  ── governed TTS router (lib/tts/ttsRouter.ts) ──   ◀ single decision point (target state)
   │        ├── OpenAI TTS      (renderer — production default today)
   │        ├── local Kokoro    (renderer — deployed, healthy, bypassed)
   │        └── Inworld TTS      (renderer — NOT PRESENT in repo)
   │
   ▼  [AIN]  provider-neutral playback + interruption — StreamingAudioQueue (FIFO),
             barge-in (maya-voice-interrupted), iOS watchdog
   ▼
Member hears MAIA
```

**Caveat (per founder):** if Inworld is ever admitted, it *also* offers realtime
transport/playback orchestration and speech-to-speech. Those are **not** part of the renderer
box — they would be documented as a separate layer, never collapsed into "renderer."

## 3. Seven factual questions — answered

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | Claude mislabeled as a voice engine? | **No** (live code). Only in `.DISABLED` SDK README. | `maiaVoiceService.ts:45`, `maiaService.ts:3019`, `stream-conversation/route.ts:7`, `ClaudeService.ts:195` |
| 2 | Inworld provides renderer/transport/S2S/Kokoro-adapter? | **No to all — absent from repo.** | grep: only "worlds" feature matches |
| 3 | `providers/inworld.ts` exists? | **No.** kokoro/personaplex/sesame only. | `ls lib/tts/providers/` |
| 4 | Kokoro callable via `ttsRouter`? | **Yes.** | `ttsRouter.ts:226–255`, `providers/kokoro.ts` |
| 5 | Who owns chunking/stream/buffer/FIFO/barge-in/abort/retry? | **AIN/client; renderers own only synthesis.** Abort **absent**. | `StreamingAudioQueue.ts`, `ClaudeService.ts:195`, `ttsRouter` fallback |
| 6 | Renderer selectable without touching cognition/persistence/memory/text? | **Yes.** | `ttsRouter` `providerOverride`, `getDeploymentContext` |
| 7 | Same frozen text across renderers? | **OpenAI+Kokoro yes today; Inworld once a renderer exists.** | `ttsRouter.ts:120–127,163–177` |

## 4. Access-contract findings (per exposed voice route — "prove or hold")

Per founder ruling, access policy is **not invented here**. Each route classified A (member-only),
B (explicitly-authorized guest), or C (ambiguous → hold for separate ruling).

| Route | Identity handling (file:line) | Class | Disposition |
|---|---|---|---|
| `voice/transcribe`, `transcribe-simple`, `persist`, `preview`, `preview/[file]` | `getMemberIdFromRequest` → **401 if anon** | **A** member-only | already enforced; no change |
| `voice/openai-tts` | resolves member; `isAnon` **allowed** + free-tier limits (`:43–52`) | **C** ambiguous | *code* intends anon+limits, but not proven as an authorized guest experience in governing docs → **do not change access; flag for ruling** |
| `voice/local-tts` | same anon+limits pattern (`:49–55`) | **C** ambiguous | same as above |
| `voice/stream-conversation` | `userId = body||getMemberId`, **no 401** (`:585`) | **C** ambiguous | not a synthesis route; flag |
| **`sovereign/app/maia/voice`** | **no identity, no limits, no auth** (`@ts-nocheck`); calls OpenAI directly, **bypasses the seam** | **C** ambiguous **+ seam bypass** | **hold** — both an unresolved access contract *and* a second seam bypass; needs a ruling on (i) route-through-seam, (ii) add identity/limits, or (iii) leave for separate review |

**Net:** the two primary TTS routes already resolve identity + rate-limit; Phase 0 preserves that
behavior unchanged. The one genuine anomaly is `sovereign/app/maia/voice` (no contract + seam
bypass) — **held**, not silently repaired.

## 5. Sesame / realtime status (unchanged from first audit)

No live Sesame *audio* path (CI text-shaping + Voice-Lab candidate only). OpenAI Realtime WebRTC
route exists but its client is orphaned (`.broken` page). coturn is deployed for human-to-human
Encounter, not MAIA voice. None of this is in Phase 0 scope.

## 6. Proposed Phase 0 (behavior-preserving; propose — implementation gated by the ruling's "show before mutate")

Route all synthesis through `ttsRouter`; preserve OpenAI as the production default; keep Kokoro
available but not promoted; introduce no Inworld; no cognition change; no member-facing voice
change; no silent substitution; written response always survives TTS failure; record provenance.
File list + tests + non-goals: see the "show" presented to the founder (this turn) and the
seal-doc ruling.

## 7. Non-goals (explicit)

- No change to MAIA's production voice default (stays OpenAI).
- No Inworld introduction; no `providers/inworld.ts`.
- No A/B interface in the Phase 0 PR (A/B is the separate next step — see the evaluation spec).
- No cognition-provider change; no change to STT, memory, prompts, persistence, or member-facing text.
- No invented access policy; ambiguous routes are held.

## 8. Unknowns / held

- Governing-doc authorization for anonymous voice on landing/onboarding (needed to reclassify the
  C-routes as B or A) — held for founder ruling.
- `sovereign/app/maia/voice` intended contract — held.
