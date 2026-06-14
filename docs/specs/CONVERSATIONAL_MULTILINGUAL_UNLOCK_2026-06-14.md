# Conversational Multilingual Unlock — Scope

**Date:** 2026-06-14
**Status:** Gate resolved 2026-06-14 — small Tier 1 path **approved to proceed** (see §0)
**Name (claim-disciplined):** *Conversational Multilingual Unlock* — **not** "full multilingual support."

> One-line read: **MAIA is multilingual-capable in intelligence, but English-locked in embodiment.**
> For a relational system, "their language" is not just text response — it is *hearing them accurately.*
> This pass unlocks hearing. It does not translate the interface.

---

## 0. Decision — Gate Resolved (2026-06-14)

**Decision: proceed with the small Tier 1 path**, *gated on a text-mode probe* (below). Model provisioning is auto-pull (confirmed on prod, §4.3) — this is a bounded STT unlock + cache persistence, not a model-provisioning project.

### Probe gate (run before the build)
Send to MAIA in text mode: `Hola MAIA, ¿puedes responderme en español y decirme si entiendes lo que estoy diciendo?`
- **PASS** — replies in Spanish, no English fallback framing, no "I can translate that" confusion, MAIA tone/continuity intact → **proceed with the build below.**
- **FAIL** → **do not touch Whisper.** The issue is *above* STT — in conversation/prompt/language handling — and the fix moves there.

**Result — PASS (2026-06-14, prod probe via `maia-sovereign`):**
- Spanish → *"Hola Kelly. Sí, te entiendo perfectamente y con gusto puedo responderte en español. ¿Qué tienes en mente hoy?"*
- Japanese → *"こんにちは、Kelly。はい、あなたのおっしゃっていることは完全に理解できます。日本語でお答えすることも問題ありません。今日は何を探求したいですか？"*
- Both: **FAST tier / `claude-sonnet-4-6`**, name-continuity + MAIA tone intact, no English fallback, no "I can translate" confusion.
- **Consequence:** text multilingual is **Live**. The prompt guard (build step 1) is now **hardening-only for the voice path** (shorter/lower-context turns), *not* load-bearing for correctness — Claude mirrors language natively without it. Proceed with the build.

### Build order (on PASS)
1. Add prompt guard (`stream-conversation/route.ts:~1110`).
2. Add browser `navigator.language` hint (`OptimizedVoiceRecognition.ts:50,172`, `maiaVoiceSystem.ts:264`).
3. Switch Whisper `WHISPER__MODEL=base.en` → `base` + route fallback string `base.en` → `base`.
4. Add persistent HF cache volume.
5. Warm-up request (pre-pull the multilingual model).
6. Test Spanish voice input end-to-end.

**Hold `small`-model escalation** until after real CPU/accuracy measurement (§6 risk #2).

### Cache volume (exact)
Under the `whisper` service in `docker-compose.production.yml`:
```yaml
volumes:
  - whisper-hf-cache:/root/.cache/huggingface
```
Top-level `volumes:`:
```yaml
volumes:
  whisper-hf-cache:
```

### Verification (after deploy / recreate)
```bash
docker logs -f maia-whisper
```
First multilingual request resolves/pulls:
```
Systran/faster-whisper-base
```
Then confirm the loop:
- [ ] Spanish audio → Spanish transcript
- [ ] Claude responds in Spanish
- [ ] TTS speaks the Spanish text
- [ ] English still works (no regression)
- [ ] cache survives a container recreate (no re-download)

### Claim (updated)
> **Voice multilingual is no longer a model-provisioning project. It is a bounded STT unlock plus cache persistence.**
> **Caveat:** browser STT depends on device/browser locale (it cannot auto-detect); the **Whisper fallback is the actual auto-detect path.**

---

## Why this matters — principle & community

**This is not feature expansion; it is removing a barrier.** The platform already has members and clients speaking — among others — Farsi, Japanese, Portuguese, Hindi, Arabic, Spanish, Italian, French, and Gaelic. They are here *now*. The question is not "should we support languages" but "what relationship do we want with the people already here." The difference between *"Please speak English so MAIA can understand you"* and *"Speak in the language that feels most natural to you"* is the difference between tolerance and respect — and around grief, prayer, ancestry, dreams, and identity, translation is not neutral; something is lost.

**Governing principle (Kelly, 2026-06-14): diversity at the edge, coherence at the center.**
- Many languages — **one** MAIA, **one** continuity thread, **one** memory substrate, **one** constitutional framework, **one** relationship.
- A Spanish speaker and an English speaker do not meet *different* MAIAs. They meet the *same being* through different linguistic channels. Language is a channel, not a separate identity.
- What must **not** multiply with languages: the constitutional principles, the memory architecture, the continuity. Chaos comes from losing the center — not from many edges.

**Three phases — kept rigorously separate (do not conflate):**
| Phase | Scope | Status |
|---|---|---|
| **1 — Conversational Multilingual Unlock** | Speak / hear / respond in any supported language; auto-detect where possible; no language settings; no translated UI | **This branch** |
| **2 — Language preference** | Remember / switch preferred language; language-specific onboarding | Later, only if needed |
| **3 — Full internationalization** | Every screen / docs / errors / help translated; cultural localization | Separate multi-year project — explicitly NOT this |

---

## 1. Claim discipline (current, honest state)

| Layer | Claim | Basis |
|---|---|---|
| **Text multilingual** | **Live — verified 2026-06-14** | Prod probe: Spanish + Japanese both mirrored natively at FAST tier (Sonnet), MAIA tone + name-continuity intact, no English fallback. Zero code changes (§0). |
| **Voice multilingual** | **Gate resolved → bounded STT unlock + cache persistence** (no longer a model-provisioning project) | Auto-pull confirmed on prod (§0/§4.3). Caveat: browser STT depends on device/browser locale; Whisper fallback is the true auto-detect path. |
| **Interface multilingual** | **Vision / future i18n project** | No i18n framework, locale files, or language picker exist. Explicitly **out of scope** here. |

**Stage language** (built ≠ wired ≠ surfacing ≠ verified) applies. See §7 gate.

---

## 2. The actual blocker: two English-locked STT surfaces on `/maia`

The live voice path is `app/maia/page.tsx` → `components/OracleConversation.tsx` → `<ContinuousConversation>` (mic in) + `useStreamingVoice` (response/TTS out). There are **two** STT surfaces, **both** English-locked:

### Surface A — Browser Web Speech API (PRIMARY, most users)
- `components/voice/ContinuousConversation.tsx` (comment at line ~10: "uses browser Web Speech API").
- Recognition language hardcoded:
  - `lib/voice/OptimizedVoiceRecognition.ts:50` — `language: config.language ?? 'en-US'`
  - `lib/voice/OptimizedVoiceRecognition.ts:172` — `this.recognition.lang = 'en-US'`
  - `lib/voice/maiaVoiceSystem.ts:264` — `this.speechRecognition.lang = 'en-US'`
- **Hard constraint:** the Web Speech API **cannot auto-detect language**. It must be *told* the language before recognition starts. "Auto-detect first" is **not possible on this path.**

### Surface B — Local faster-whisper (FALLBACK: Android Chrome / Web-Speech failures)
- `components/voice/ContinuousConversation.tsx` posts audio to `/api/voice/transcribe-simple`.
- `app/api/voice/transcribe-simple/route.ts:20` — `WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000'`
- `app/api/voice/transcribe-simple/route.ts:119` — `whisperFormData.append('model', 'base.en')`
- Server: `docker-compose.production.yml` → `maia-whisper` = `fedirz/faster-whisper-server`, env `WHISPER__MODEL: base.en` (line ~541), `WHISPER__INFERENCE_DEVICE: cpu`.
- **faster-whisper CAN auto-detect** once given a multilingual model and no forced `language`.

### Not on the live `/maia` path (sovereignty note)
OpenAI `whisper-1` STT (`app/api/voice/transcribe/route.ts` `language:"en"`, `lib/voice/streamTranscribe.ts:125`, `app/api/voice/webrtc-session`) is called only by `MicInputWithTorus`, `WakeWordVoiceInterface`, `ElementalVoiceOrchestrator` — secondary components. These **contradict the "never OpenAI / 100% local STT" doctrine** and are a *separable* cleanup item (confirm-dead or auto-detect), not part of this pass.

---

## 3. Design: how each surface goes multilingual

| Surface | Mechanism | Why |
|---|---|---|
| **B. faster-whisper (fallback)** | Multilingual model + **auto-detect** (no `language` param) | True auto-detect; matches "auto-detect first." |
| **A. browser Web Speech (primary)** | **Language hint** from `navigator.language` (device locale) | Browser STT can't auto-detect → seed from the locale the user already configured on their device. Zero UI, no stored preference, sovereign. If the hint is wrong, the Whisper fallback's auto-detect is the safety net. |
| **Downstream / LLM** | Prompt guard + optional `detectedLanguage` metadata | Claude mirrors language natively; the guard hardens it for short/voice turns. |
| **TTS** | **No change** | `eleven_multilingual_v2` + Kokoro + OpenAI TTS all auto-detect language from the text fed to them. |

**Key insight:** `navigator.language` is the clean v1 default for the un-auto-detectable browser path — the device already knows the user's language; no picker required, no preference stored. This is *more* sovereign than asking.

---

## 4. Change sites (precise)

### Tier 1 — Unlock STT (the real blocker)
1. `docker-compose.production.yml` (~541): `WHISPER__MODEL: base.en` → `base` (multilingual). Consider `small` only if `base` accuracy is insufficient (CPU-inference latency cost — see §6).
2. `app/api/voice/transcribe-simple/route.ts:119`: `'base.en'` → `process.env.WHISPER_MODEL || 'base'`. Confirm **no** `language` form field is appended (let faster-whisper auto-detect).
3. **Provisioning — GATE RESOLVED 2026-06-14 (read-only check on prod `maia-whisper`):** the server **auto-pulls** the CTranslate2 model from HuggingFace on demand, keyed by the requested model name. Proven: HF cache `/root/.cache/huggingface/hub/models--Systran--faster-whisper-base.en` is present; logs show `faster_whisper_server.model_manager` loading/offloading `base.en` by name; env `WHISPER__MODEL=base.en` is read. **Conclusion: changing `base.en` → `base` triggers an on-demand fetch of `Systran/faster-whisper-base` (multilingual) — no image rebuild, no model bake.** The `whisper-init` / `whisper_models` ggml path (`docker-compose.production.yml:514–532`) is **confirmed vestigial** — the running service mounts **no volume** for it; candidate for removal.
4. **Bundle a cache-persistence fix (NEW — surfaced by the gate check):** the running container has **no volume mounted** — the HF model cache lives in the ephemeral writable layer, so it is **wiped and re-downloaded from HuggingFace on every container recreate** (true today with `base.en`; pre-existing, not introduced here). Add a volume mount at `/root/.cache/huggingface` in `docker-compose.production.yml` so the multilingual model persists across recreates and deploys don't depend on HF reachability (self-hosted/air-gap alignment). Optionally pre-warm with one transcription request post-deploy.
5. `lib/voice/OptimizedVoiceRecognition.ts:50,172` + `lib/voice/maiaVoiceSystem.ts:264`: replace hardcoded `'en-US'` with a language passed down from `ContinuousConversation`, sourced from `navigator.language` (fallback `'en-US'`).

### Tier 2 — Thread detected language (optional metadata; Claude mirrors without it)
5. `app/api/voice/transcribe-simple/route.ts`: capture faster-whisper's returned `language` and return it as `detectedLanguage` in the JSON.
6. `hooks/useStreamingVoice.ts` (~626): include `detectedLanguage` (or the browser hint) in the `/api/voice/stream-conversation` body.
7. `app/api/voice/stream-conversation/route.ts:449`: add `detectedLanguage?: string` to `StreamRequest`.

### Tier 3 — Prompt guard (one insertion reaches the live voice LLM path)
8. `app/api/voice/stream-conversation/route.ts` (~1110): add a `languageDirective` to the `voiceSystemPrompt` assembly array:
   > "Respond in the user's language unless they ask otherwise. Never switch to English or ask them to translate."
   When `detectedLanguage` is present, name it explicitly.
   - **Note:** the *text/sovereign* surface (`/api/sovereign/app/maia/list` → `lib/sovereign/maiaVoice.ts` / `maiaService.ts`, FAST/CORE/DEEP) is a **different** prompt-builder lineage with a documented addenda-channel divergence. Adding the same guard there is a small, separable follow-up if text multilingual needs hardening (it likely already works — see §1).

### No change
- **TTS** — `lib/voice/elevenlabs-voice.ts:34` (`eleven_multilingual_v2`), `lib/tts/ttsRouter.ts` (Kokoro/OpenAI) all auto-detect from text. ✅

---

## 5. Explicitly OUT of scope (separate product phase)
- No language picker UI.
- No locale files / `next-intl` / i18next.
- No translated app shell / chrome.
- No stored `members.language` preference (rely on per-turn auto-detect + `navigator.language`; revisit only if auto-detect proves unreliable).
- OpenAI `whisper-1` STT cleanup (sovereignty item, tracked separately).

---

## 6. Risks

1. **Model provisioning — RESOLVED (no longer a risk).** Confirmed auto-pull from HuggingFace (§4.3). Residual operational item, not a blocker: the model cache is **ephemeral** (no volume) → re-downloads on every container recreate; mitigated by the §4.4 cache-volume mount. First-request warm-up after a model change incurs a one-time download (multilingual `base` ≈ same size as `base.en`, ~145MB).
2. **CPU inference latency.** `WHISPER__INFERENCE_DEVICE: cpu`. Multilingual `base` is ~same size as `base.en`, so latency should be comparable; `small`/`medium` are larger and slower — could push the voice-fallback turn over budget. Start at `base`, measure, escalate only on accuracy need.
3. **Short-utterance auto-detect misfires.** faster-whisper auto-detect is less reliable on very short/noisy clips; a one-word English reply could be mis-detected. Acceptable for v1; a "bias toward previous turn's language" refinement is a later option, not v1.
4. **Browser-hint wrongness.** `navigator.language` reflects device locale, which may differ from spoken language. The Whisper fallback's auto-detect is the safety net; full correctness on the browser path would need a picker (deferred).
5. **Code-switching** (mixing languages mid-utterance) — Whisper picks the dominant language. Acceptable v1.
6. **Gaelic is best-effort, not parity.** Of the languages already in the community, Gaelic is the one to flag: smaller training data, weaker STT + browser-locale support, inconsistent Whisper coverage by dialect. Frame as *"supported where capability exists; test carefully"* — do not promise day-one parity. Spanish, French, Portuguese, Italian, Arabic, Hindi, Japanese, and Farsi are handled far more reliably by modern multilingual models (Spanish + Japanese already verified, §0).

---

## 7. Verification gate (stage language)

- **Stage 3 — Reachable:** `WHISPER__MODEL: base` loads, `maia-whisper` `/health` green, multilingual model present in cache.
- **Stage 4 — Verified:** a non-English audio clip POSTed to `/api/voice/transcribe-simple` returns a correct transcript **+** a `detectedLanguage` matching the spoken language (curl test).
- **Stage 5 — Live:** a full voice turn in (e.g.) Spanish on `/maia` under authenticated load → MAIA responds in Spanish (text **and** TTS), captured in logs. Browser-path: confirm `navigator.language` seeds recognition and a non-English-locale device transcribes correctly.

Do not let a green `/health` or a single transcript inflate into "voice multilingual is Live." Live = Stage 5 across both STT surfaces.

---

## 8. Sovereignty / invariant check
- **Increases agency?** Yes — being *heard* in one's own language is foundational, not cosmetic.
- **Pushes life outward?** Yes — opens the platform to non-English speakers.
- **Reduces psychological centrality?** Neutral-to-positive; no dependency mechanics added.
- **Consent/memory?** No new memory surface; auto-detect is per-turn and stores nothing. No stealth profiling (we deliberately do *not* persist a language preference in v1).
- **Sovereignty doctrine:** unlock stays on the **local** faster-whisper + browser-native paths; does **not** add cloud STT. The OpenAI `whisper-1` routes remain a separate cleanup.

---

## 9. Implementation — what this branch actually changed (`feat/conversational-multilingual-unlock`)

Built on `clean-main-no-secrets` @ `1a5eb1ff2`. Verified locally: `tsc` typecheck clean, `check:no-supabase` clean, `docker-compose.production.yml` parses (`WHISPER__MODEL=base`, cache volume present). **Held at the production deploy** per the deploy covenant (merge ≠ deploy; a human pulls the prod trigger).

1. **Whisper multilingual** — `docker-compose.production.yml`: `WHISPER__MODEL: base.en` → `base`; `app/api/voice/transcribe-simple/route.ts`: model `'base.en'` → `'base'` (no `language` field → auto-detect).
2. **HF cache persistence** — `docker-compose.production.yml`: added `whisper-hf-cache:/root/.cache/huggingface` mount on the `whisper` service + top-level `whisper-hf-cache` volume. (Vestigial `whisper-init`/`whisper_models` left as-is — separate cleanup.)
3. **Browser locale hint** — `lib/voice/OptimizedVoiceRecognition.ts`: new `defaultRecognitionLang()` (`navigator.language` → `en-US` fallback) at the config default; `recognition.lang` now uses the resolved config language (was hardcoded `'en-US'` and *ignored* config — also a latent bug fixed). `lib/voice/maiaVoiceSystem.ts`: `recognition.lang` seeded from `navigator.language`.
4. **Prompt guard — placement diverged from scope, intentionally.** §4 Tier 3 proposed adding the directive to the `voiceSystemPrompt` array in `stream-conversation/route.ts`. **Rejected during build:** `ClaudeService.generateOracleResponseStreaming` uses `systemPrompt || buildMaiaSystemPrompt(context)` (line ~212) — **replace, not append**. An always-present directive there would make `voiceSystemPrompt` always-truthy and **replace MAIA's entire identity prompt on every voice turn** — a serious regression. The guard was instead placed **inside `buildMaiaSystemPrompt`** (after the "Name flexibility" block), joining the real MAIA prompt. Reaches the normal voice path; council-override turns (minority, where `voiceSystemPrompt` legitimately replaces) rely on Claude's native mirroring. Hardening-only either way (§0).
5. **Not done (per scope):** `detectedLanguage` metadata threading (Tier 2 — optional; Claude mirrors without it); TTS (no change needed).

**Deploy + verify (held for Kelly):** deploy `maia` + recreate `whisper`, then run the §7 Stage 4/5 gate + the §0 verification loop. The first non-English request warms the multilingual model (one-time HF pull, now persisted on the cache volume).
