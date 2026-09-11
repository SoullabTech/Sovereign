# Provider & Sovereignty Policy — CANDIDATE

**Act:** ARCH-01 · artifact 5 · 2026-09-11 · **Status:** CANDIDATE.
**Law it implements:** VOICE-11, VOICE-17, VOICE-18; CLAUDE.md *MAIA Sovereignty* ("never use OpenAI or other cloud AI providers"; "voice: local TTS/STT or browser APIs only"); Sanctuary invariants.

> *Sovereignty is a routing invariant, not a mission statement.* (research §13)

---

## 1. Why this is a separate artifact

The census found the vow is not met today: the spoken voice on `/maia` is OpenAI cloud TTS by default, local Kokoro requires an environment flag **and** an archetype, and the client has no fallback engine (census F1; P3 §3). Dormant modules still target OpenAI Realtime, OpenAI STT and Deepgram (P5 #33–34). None of this is malicious; it is what happens when sovereignty is a statement rather than a check. This artifact makes it a check.

## 2. `VoiceProviderPolicy` — the schema

A single declarative policy, loaded at kernel start, enforced at every adapter selection and every network egress from the voice path.

| Field | Meaning | Type |
|---|---|---|
| `allowedProviders` | the closed list of adapters that may be instantiated, per role (`stt`, `tts`, `vad`, `turn`, `transport`) | list of provider ids with class |
| `providerClass` | `onDevice` · `ownedServer` · `platformOS` (Apple system speech, on device) · `thirdPartyCloud` | enum per provider |
| `rawAudioMayLeaveDevice` | whether PCM may cross the device boundary at all | boolean, per role |
| `ownedEndpoints` | the only hosts a `RealtimeTransport` or STT/TTS adapter may connect to (e.g. the minisforum stack behind `soullab.life`) | allowlist |
| `fallbackOrder` | per role, the ordered adapters to try; **may not cross from a lower to a higher `providerClass` risk** (see §4) | ordered list |
| `fallbackAllowed` | whether any fallback is permitted for the role | boolean |
| `modelIdentity` | model name · version · weights hash · code licence · weights licence · voice-consent basis | record per provider |
| `telemetry` | what the adapter may emit about the member (never content; timing/health only) | declared set |
| `retention` | see §5 | table |
| `policyVersion` + `signedBy` | provenance of the policy itself | record |

## 3. Provider classes and the default posture for MAIA

| Class | Examples (from SURVEY-01 / research §9; none selected) | Allowed in production? |
|---|---|---|
| `onDevice` | whisper.cpp, WhisperKit, Moonshine, sherpa-onnx models, Silero VAD, Smart Turn, Kokoro on device, Pocket TTS | **yes** |
| `platformOS` | Apple `SpeechAnalyzer`/`SpeechTranscriber`, `AVSpeechSynthesizer` buffer adapter | **yes**, as one adapter, never a constitutional dependency (research §9.1) |
| `ownedServer` | `maia-whisper`, Kokoro/Parakeet/Qwen on MAIA's own hosts, reached only via `ownedEndpoints` | **yes** |
| `thirdPartyCloud` | OpenAI TTS/STT/Realtime, Deepgram, ElevenLabs, any hosted speech API not owned by Soullab | **no** — prohibited on the voice path in every profile |

The `thirdPartyCloud` row is the executable form of the vow. It is not a preference and has no override flag in production configuration.

## 4. Fail-closed rules

1. **No class escalation on fallback.** A fallback chain may move within `onDevice ↔ platformOS ↔ ownedServer`; it may never resolve to `thirdPartyCloud`. If every allowed adapter for a role fails, the role enters `failed` (state model §1, health dimension) and the floor enters `degraded` with the text channel visibly available (research §13: *"a visible degraded voice state with text continuity — not silently sending material to a vendor endpoint"*).
2. **Egress allowlist.** Any connection from a voice adapter to a host outside `ownedEndpoints` is refused at the transport layer and journalled as a policy violation (VOICE-16). Silence is not an acceptable failure mode here; the violation is visible in `requestDiagnosticsSnapshot()`.
3. **Raw audio boundary.** If `rawAudioMayLeaveDevice = false` for a role, that role may only use `onDevice`/`platformOS` adapters; an `ownedServer` STT adapter requires the flag true **and** an owned endpoint — and the member-facing setting that expresses this is the existing local-only voice consent (`x-voice-local-only` / member policy, P3 §3), carried forward as ADAPT.
4. **Sanctuary.** In a Sanctuary session no raw audio, transcript hypothesis, or prosodic feature persists beyond the turn on any tier; the policy's retention table is overridden to *none* for the session (Sanctuary invariants 1–3, 6).
5. **Policy is versioned and attributable.** The active policy's version is in every journal record's session header; a change of policy is a founder act with a recorded diff, not a deploy side effect (cf. the 2026-09-07 schema-drift finding: nothing gates the branch, so the policy is gated at load, by identity).

## 5. Retention table (VOICE-18)

| Data | Default | Requires |
|---|---|---|
| Raw PCM (input) | ephemeral; buffer lifetime only | any persistence needs a declared purpose, a member-visible consent, and a TTL |
| Raw PCM (output) | ephemeral | same |
| Transcript hypotheses (partials) | ephemeral; last partial only for continuity | never stored |
| Committed member text | passes to canonical MAIA under existing memory consent | governed by Sanctuary / memory rules, not by this policy |
| Interaction-control features (VAD score, pause length, overlap flags) | ephemeral; journalled as timing only | may reach `TurnCoordinator` / `InterruptionController`; never cognition |
| Prosodic / affective features | **not derived** in Voice 2026 v0 | a future derivation needs its own purpose statement, retention row and founder act; it may never be used for personality or mental-state inference (research §20.5; Sovereignty Invariants) |
| Health telemetry (cadence, RMS/peak, route, generation) | journalled per session, content-free | retention per ops policy |

## 6. Enforcement gates

| Gate | Kind | What fails |
|---|---|---|
| G-P1 provider import gate | S | any production module on the iOS voice path importing a `thirdPartyCloud` SDK or client (`openai`, `deepgram`, …) |
| G-P2 policy conformance | P | a policy file listing a `thirdPartyCloud` provider in `allowedProviders`, or a `fallbackOrder` that escalates class |
| G-P3 egress witness | D | a KERNEL/BENCH run's journal containing any egress to a host outside `ownedEndpoints` |
| G-P4 fail-closed witness | D | fault injection "terminate TTS mid-response" ends in `degraded` with text continuity, not in a request to any other class |
| G-P5 retention witness | D | after a session, no raw PCM or partials remain on device or server storage |

## 7. Migration consequence (binds `MIGRATE-01`)

`MIGRATE-01` cannot be accepted while any reachable spoken-output path on `/maia` iOS resolves to a `thirdPartyCloud` provider. The current default (`/api/voice/openai-tts` → OpenAI unless flags + archetype) is therefore a **migration prerequisite**, not a patch to make now: the route's Kokoro path is a candidate `ownedServer` adapter for BENCH-01, and until an allowed adapter passes BENCH-01 the honest production state under this policy is *degraded voice, text continuity*. Whether that interim is acceptable is a founder call recorded in `00_README.md` §2 (it is the sharp edge of D5).

## 8. What this policy does not decide

Which allowed provider is best (BENCH-01); whether Apple system speech is available on the supported device/locale matrix (research §20.2); licensing fitness of any voice (research §20.4 — "open weights" and "sovereign" are not synonyms; a voice becomes production default only after code licence, weights licence, training-data terms and voice-consent are reviewed and recorded in `modelIdentity`).
