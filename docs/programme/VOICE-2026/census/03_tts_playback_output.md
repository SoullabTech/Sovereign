# VOICE-2026 / CENSUS-01 — 03 · TTS / Playback / Output side (iOS, live `/maia` path)

**Read-only census.** Branch `claude/voice-2026-census-01` @ `5b20ee590`. Date 2026-09-11.
Scope: everything that can produce, play, stop, or watchdog MAIA's spoken audio on the live `/maia` path
(`app/maia/page.tsx:843,1540` → `<OracleConversation apiEndpoint="/api/sovereign/app/maia/list">`), and
everything that touches the audio session or the output graph for playback. Every claim cites `file:line`.
Statements marked **[inference]** are derived from code ordering, not from a witnessed run.

**Branch-state caveat (load-bearing).** On this branch `ios/App/App/` contains `AudioSessionManager.swift`,
`VoiceController.swift`, `AppDelegate.swift`, `HandwritingOCR.swift` only (`git ls-files ios/App/App`); there is
**no `MAIABridgeViewController.swift`**. `capacitor.config.ts:39-43` declares `AudioSessionManager` /
`VoiceController` in `packageClassList`, which the lane record (`IOS-CONVERSATION-RUNTIME-01` E2/E3) found inert.
So for a build of *this* branch, every `AudioSessionManager` call recorded below **rejects at the bridge**; the
TS wrapper converts the rejection to `false` (`lib/voice/AudioSessionManager.ts:188-192`) and the callers continue.
The registration repair lives only on `claude/ios-runtime-01-audiosession-registration` and is not merged here.

---

## 1. Inventory

| # | Capability | File:line | Can start | Can stop | Can restart | Can reconfigure | Trigger / condition | Values | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `maiaSpeak()` — the only live speak function on `/maia` | `components/OracleConversation.tsx:1955-2525` | ✔ playback | ✘ (no stop handle) | ✘ | ✔ AudioContext resume | Called from the response handler `:6514` and 12 ad-hoc sites (`:6854,7039-7209`) | — | Deps `[startAudioAnalysis, stopAudioAnalysis, voiceSettings]` `:2525`. Local `source`/`audio` variables; nothing stores them, so no caller can stop them. |
| 2 | Shared web AudioContext borrow + resume | `OracleConversation.tsx:1962-1979` → `lib/voice/ios-audio-session.ts:26-32,40-60` | ✔ (creates ctx) | ✘ | ✔ `resume()`; recreates ctx on resume failure `:52-55` | — | Every `maiaSpeak` on iOS UA | — | Also borrowed on mount `:3294` and in `enableAudio` `:4478-4484`. |
| 3 | Native gatekeeper `prepareForSpeaking` | `OracleConversation.tsx:1999-2024` → `lib/voice/AudioSessionManager.ts:166-193` → `ios/App/App/AudioSessionManager.swift:109-163` | ✔ session for playback | ✔ tears down *its own* recognizer/engine `:239-274` | — | ✔ category | `isCapacitor` `:1995-1996`; **not** gated on the TS `isNativeIOS()` | `withTimeout` 5000 ms `:2005-2009`; diagnostics 2000 ms `:2013`; Swift `Thread.sleep 0.1` `:125` | Swift: `setActive(false,.notifyOthersOnDeactivation)` `:128` → `setCategory(.playback,.spokenAudio,[.duckOthers])` `:132-136` → `setActive(true)` `:140`. Failure/timeout is logged and **playback proceeds anyway** `:2016-2023`. Unregistered on this branch (see caveat). |
| 4 | Native `getAudioDiagnostics` (route / port readout) | `AudioSessionManager.swift:192-234`; TS `:218-252` | — | — | — | — | Only on prepare failure `OracleConversation.tsx:2013` | 2000 ms cap | Reports `outputDataSource`, `availableInputs`, category, mode. Never read on a healthy turn. |
| 5 | Synthesis request (Capacitor) | `OracleConversation.tsx:2036-2057` | ✔ | ✘ | ✘ | — | `isCapacitor` | `withTimeout` 30 000 ms `:2055`; `CapacitorHttp.post` `responseType:'arraybuffer'` | Body: `text, voice: voiceSettings.voice, speed, model: ttsInstructions ? 'gpt-4o-mini-tts' : voiceSettings.model, instructions?` `:2046-2052`. Base64 → `base64ToArrayBuffer` `:2094`; MP3 magic check `:2114-2116` (warn only). |
| 6 | Synthesis request (web/PWA) | `OracleConversation.tsx:2130-2153` | ✔ | ✘ | ✘ | — | `!isCapacitor` | **no timeout** | `apiFetch('/api/voice/openai-tts')`; json/`<1000` bytes → throw `:2147-2152`. |
| 7 | TTS route (server) | `app/api/voice/openai-tts/route.ts:38-383` | ✔ | ✘ | ✘ | ✔ provider | POST | text ≤ 4096 `:109`; limits 429 `:76-87`; **no upstream timeout** | See §3. Provider chosen by member archetype `:118-131`, not by body.voice on the OpenAI path. |
| 8 | iOS **Capacitor** playback graph (Web Audio) | `OracleConversation.tsx:2288-2420` | ✔ `source.start(0)` `:2389` | ✘ (no ref) | ✘ | ✔ `ctx.resume()` `:2292-2296, 2395-2405` | `isIOS && audioContextRef.current` | playbackTimeout `(duration+30)·1000` ms `:2360-2365` → `reject` | Graph: `BufferSource → Gain(1.0) → Analyser(fft 256, smoothing 0.8) → destination` `:2320-2338`. `setIsAudioPlaying(true)` `:2387` inside `startPlayback`. `onended` `:2367-2373`; `onerror` `:2375-2383` (toast "check mute switch"). |
| 9 | "Audio output confirmed" probe | `OracleConversation.tsx:2408-2420` | — | — | — | — | 2000 ms after `startPlayback` scheduling, only if `audioAnalyserRef && animationId` | one-shot | `getByteFrequencyData`; `some(v>0)` → `✅ [iOS] Audio output confirmed` `:2418`, else toast "No audio output" `:2413-2415`. See §4. |
| 10 | iOS **Safari/PWA** playback (Web Audio) | `OracleConversation.tsx:2190-2286` | ✔ | ✘ | ✘ | ✔ resume `:2194-2198` | `isIOS && !isCapacitor && audioBlob` | playbackTimeout `(duration+30)·1000` `:2216-2221` | No analyser; amplitude is **simulated** `Math.random` `:2235-2237`. `onended` assigned twice `:2223,:2241`. Falls through to #8 on error `:2260-2264`. |
| 11 | Desktop playback (HTMLAudioElement) | `OracleConversation.tsx:2422-2504` | ✔ `audio.play()` `:2496` | ✔ internal only (`audio.pause()` on timeouts `:2407,:2419`) | ✘ | — | non-iOS | start timeout 5000 ms `:2434-2441`; playback `(duration+30)·1000` `:2446-2452` | `onplay` → `setIsAudioPlaying(true)` + `startAudioAnalysis(audio)` `:2454-2460` (`createMediaElementSource` `:1908`). Not the iOS path; listed for completeness. |
| 12 | Post-playback state release | `OracleConversation.tsx:2509-2524` | — | — | — | — | success `:2509-2511`; `finally` `:2517-2523` | — | `finally` always: `stopAudioAnalysis(); setIsResponding(false); setIsAudioPlaying(false)`. Catch shows toast only `:2513-2516` — **no fallback engine**. |
| 13 | Response-handler speak gate | `OracleConversation.tsx:6444-6475` | — | — | — | — | `shouldSpeak = !usedStreamingAudio && enableVoiceInChat && (!showChatInterface \|\| (showChatInterface && voiceEnabled && maiaReady))` `:6457` | `enableVoiceInChat` default true `:1001-1007`; `maiaReady = true` const `:2527`; `voiceEnabled` prop default true `:656` | `usedStreamingAudio` `:6446` is false on `/maia` (see #21). |
| 14 | Speaking-state set before TTS | `OracleConversation.tsx:6480-6485` | — | — | — | — | inside `if (shouldSpeak && maiaSpeak)` | — | `setIsResponding(true)` `:6480`; `setIsMicrophonePaused(true)` `:6484`. `isAudioPlaying` deliberately NOT set here `:6481-6483`. |
| 15 | Transcript watchdog (`commitOracleTurn`) | `OracleConversation.tsx:6372-6398, 6497-6502` | — | — | — | — | armed before `await maiaSpeak` | `VOICE_TRANSCRIPT_WATCHDOG_MS = 6000` `:341` | Idempotent seam; reasons: `chat` `:6400`, `voice_streaming_audio` `:6461`, `voice_tts_watchdog` `:6500`, `voice_after_speech` `:6529`, `voice_speech_error` `:6535`, `voice_no_tts` `:6634`. Pinned by `__tests__/voice-transcript-commit.test.ts`. Does **not** stop or restart audio. |
| 16 | Post-speech release + mic re-arm | `OracleConversation.tsx:6538-6621` | ✔ mic (`voiceSession.methods.startListening`) | — | ✔ up to 8 attempts | — | `finally` of the speak block | `cooldownMs = 0` `:6493`; attempts every 300 ms (blocked) / 400 ms (didn't start) `:6613,:6605`; final forced reset + 500 ms `:6565-6582` | `setIsResponding(false); setIsAudioPlaying(false)` `:6541-6543`; `isMicrophonePaused` released in the 0 ms timeout `:6553`; `setIsMuted(false)` `:6554`. Restart only when `lastSendWasVoiceRef` `:6580,6600`. |
| 17 | `isSpeaking` prop to capture side | `OracleConversation.tsx:10421` → `components/voice/ContinuousConversation.tsx:1943,1959-2028` | — | ✔ stops native recognizer | ✔ re-arm | — | `isSpeaking={isAudioPlaying \|\| isMicrophonePaused}` | — | On true: `NativeSpeechRecognition.stop()` `:1991` (fire-and-forget), `setMicState('PLAYING_TTS')` `:1985`. On false: `normalizeTurnCompleteState` + `requestRestart('maia_stopped_speaking')` `:2019-2027`; native hands-free auto-restart after 800 ms if speech heard within 30 s `:2044-2080`. |
| 18 | Barge-in (voice) | `ContinuousConversation.tsx:2354-2384` → `OracleConversation.tsx:2869-2896` | — | ✔ `stopStreamingVoice()` only `:2873` | ✔ `setIsListening(true)` `:2891` | — | `isSpeakingRef && interruptEnabled && level > vadSensitivity·interruptThresholdMultiplier` for `interruptDebounceMs` | `interruptEnabled` default **false** (`:1126-1134`, only `maia_settings.interrupt.enabled === true`) | **Does not stop `maiaSpeak` playback** — no handle exists (grep `sourceRef\|bufferSourceRef` → none). Resets flags `:2882-2888` while the BufferSource keeps rendering **[inference]**. |
| 19 | Tap-to-interrupt (holoflower) | `OracleConversation.tsx:8425-8441` | — | ✔ `stopStreamingVoice()` `:8432` | — | — | `isMuted && (isAudioPlayingRef \|\| isRespondingRef)` | — | Same limitation as #18. Also warms an iOS `Audio` element `:8388-8408` and calls `unlockStreamingAudio()` `:8416`. |
| 20 | `VoiceInteractionBar.onStop` | `OracleConversation.tsx:10339-10343` | — | `streamVoice.stop()` `:10340` | — | — | user tap | — | **`streamVoice` has no definition anywhere in the repo** (single grep hit) and is absent from `typecheck-baseline.json`. **[inference]** a `ReferenceError` on tap; whether tsc reports it is unverified. |
| 21 | Streaming audio path (`StreamingAudioQueue`) | `OracleConversation.tsx:5669-6000`; `lib/voice/StreamingAudioQueue.ts` | ✔ | ✔ `audioQueue.stop()` `:5994`; SAQ `stop()` `:368-391` | — | ✔ SAQ own AudioContext `:491-504` | `isStreaming = content-type text/event-stream` `:5653` | chunk watchdog `(duration \|\| 20 s)+15 s` `SAQ:284-292`; finalize stall marker 15 000 ms `:5817`; cooldown 200 ms `:5691`; per-chunk TTS retry backoff 300·attempt `:5935` | **Unreachable on `/maia`**: `/api/sovereign/app/maia/list` never emits `text/event-stream` (grep negative); only `app/api/voice/stream-conversation/route.ts` does. Chunks synthesised via `fetch('/api/voice/openai-tts')` `SAQ:596`. Dispatches `maya-voice-start/end` `:5699,:5742`. |
| 22 | `useStreamingVoice` hook (mounted, exit removed) | `OracleConversation.tsx:2600-2785`; `hooks/useStreamingVoice.ts` | ✔ (`sendStreamingMessage`) | ✔ `stop` `:950-990` (pause, `src=''`, abort) | — | ✔ reuses one `Audio` element / `window.__maiaGlobalAudio` `:429-441` | `sendStreamingMessage` no longer called from the voice flow `:7351-7394` | `AUDIO_WATCHDOG_MS = 6000` `:290`; retry delay 50 ms `:411` | Its `stop` is what #18/#19 call — on `/maia` it stops nothing that is playing. `isStreamingPlaying → isAudioPlaying` sync `:2790-2795` inert. |
| 23 | Voice watchdog `[voice:watchdog]` | `OracleConversation.tsx:2898-3007` | ✔ mic restart `:2994-2997` | — | ✔ | — | `streamingVoiceMode` (hard-true `:1014-1016`); interval | `AUDIO_STUCK 90 000` · `PROCESSING_STUCK 120 000` · `CHECK 5 000` `:2946-2948`; deferred tier when text still streaming `:2963-2969` | Owner: OracleConversation. `forceWatchdogReset` `:2971-2999` clears all flags, `setIsListening(true)`, `voiceSession.methods.startListening('watchdog_recovery')` if `lastSendWasVoiceRef`, toast "Voice recovered". **Does not stop audio.** "Progress" = `lastAudioProgressRef` refreshed on turn start `:2916-2923` and on effect re-run while `isAudioPlaying` `:2941-2943` — state transitions, not rendered samples **[inference]**. |
| 24 | 75 s recovery timer | `OracleConversation.tsx:3997-4056` | — | — | — | — | `isProcessing \|\| isResponding` | 75 000 ms; hard 45 000 ms when `isAudioPlaying` stuck `:4014-4025`; stuck ≥ 74 000 ms `:4033` | Injects "I seem to have gotten stuck…" `:4041` + `resetAllStates()` `:3968` (state only; no audio stop). |
| 25 | Emergency stop | `OracleConversation.tsx:7566-7595` | — | ✔ `speechSynthesis.cancel()` `:7572`; `audioRef.pause()` `:7578`; `stopListening()` `:7585` | — | — | user | — | `audioRef` is only the chat-mode replay element (#26); does not reach `maiaSpeak` audio. |
| 26 | Chat-mode per-message replay | `OracleConversation.tsx:7499-7548`, stop `:7557-7563` | ✔ | ✔ | — | — | message speaker button | none | `apiFetch('/api/voice/openai-tts')` `:7517`; `new Audio(url)` `:7538`; no session prep, no timeout. |
| 27 | iOS keep-alive oscillator | `lib/voice/ios-audio-session.ts:116-148` | ✔ on first gesture `:89` | ✔ `stopSessionKeepAlive` `:153` | — | — | module load installs gesture unlock `:184-187` | 1 Hz, gain 0.0001 → destination | Permanently renders near-silence into the shared context **[inference: keeps WebKit's output graph active between turns]**. A second, separate `iosAudioContext` + silent `Audio` unlock lives in `lib/voice/voice-feedback-prevention.ts:19-75`, installed at module load `:202-210` (imported by CC and SAQ). |
| 28 | Global unlock element | `app/layout.tsx:120-148` | ✔ | — | — | — | first gesture | — | `window.__maiaGlobalAudio` — consumed only by `useStreamingVoice:429-432` (#22). |
| 29 | Server-side synthesis on the canonical route | `app/api/sovereign/app/maia/list/route.ts:310-313,1300-1302,1802-1809` → `lib/voice/maiaVoiceService.ts:32` | ✔ (OpenAI) | — | — | — | `includeAudio` in body | — | OracleConversation **never sends `includeAudio`** (`:5403-…`; only a comment at `:7382` claims it) and never reads `responseData.audio` (grep negative). Dead on `/maia`; also feeds the CMT shadow's modality proxy (`'typed'` when absent) `:1300-1302`. |
| 30 | `lib/audio/ttsWithFallback.ts` | `:26-148` | ✔ | — | — | — | — | 10 000 ms | **Zero callers** (grep). Targets `/api/voice/sesame` (no such route under `app/api/voice/`) then browser `speechSynthesis` via `mayaVoice.speak` `:126`. Calls `VoiceController.prepareForSpeaking()` `:44-54`. Dead. |
| 31 | `IOSNativeVoiceProvider` / `capacitorRecorder` | `lib/voice/providers/IOSNativeVoiceProvider.ts:79-85`; `lib/voice/capacitorRecorder.ts:129-161` | — | `stopAllAudio` | — | `prepareForListening` | callers: `lib/hooks/useVoiceInput.ts` (text-input mics), `app/voice-controller-test` | — | Not on `/maia`. `stopAllAudio` (Swift `:166-189`) = full teardown + `setActive(false)`. |
| 32 | `speechSynthesis` | `OracleConversation.tsx:7572, 8273` | ✘ | ✔ `cancel()` only | — | — | emergency stop; agent change | — | Nothing on `/maia` ever *speaks* through `speechSynthesis`; only cancels. |

---

## 2. The speak sequence on iOS (Capacitor), as executed

Entry: response JSON received from `/api/sovereign/app/maia/list` (`isStreaming` false, `:5653`), `responseText`, `spokenText`, `ttsInstructions` extracted `:6046-6047`.

1. `usedStreamingAudio = false` `:6446`; `shouldSpeak` `:6457` true in voice mode with `enableVoiceInChat`.
2. **Web** `setIsResponding(true)` `:6480`; `setIsMicrophonePaused(true)` `:6484` → next React commit passes `isSpeaking = true` to `ContinuousConversation` `:10421`.
3. **Web** `cleanMessageForVoice(spokenText || responseText)` `:6489`; transcript watchdog armed at 6000 ms `:6500-6502`.
4. **Web** `await maiaSpeak(cleanVoiceText, element, ttsInstructionsForVoice)` `:6514` → enters `:1955`.
5. **Web** (async, unawaited by anyone) CC effect on `isSpeaking` runs after the commit: `NativeSpeechRecognition.stop()` `ContinuousConversation.tsx:1991` (community plugin `Plugin.swift:234-236`: `endAudio`, `engine.stop`, `removeTap`; **no `setActive(false)`** — the plugin's `playAndRecord/.voiceChat/.mixWithOthers` session set at `:82-89` stays active). `setMicState('PLAYING_TTS')` `:1985`.
6. **Web** `audioContextRef = getSharedAudioContext()` if missing `:1963-1969`; `await ensureAudioReady()` `:1975` (resume; recreate on failure `ios-audio-session.ts:45-56`).
7. **Web** `rhythmTracker.onMAIAResponse()` `:1986`; `setIsResponding(true)` again `:1988`.
8. **Native** `VoiceController.prepareForSpeaking()` under 5000 ms `:2005-2009` → `AudioSessionManager.swift:109-163`: own-state teardown `:122` (only *its* task/request/engine `:239-274` — it has no reference to the community plugin's engine), sleep 0.1 s `:125`, `setActive(false, notifyOthers)` `:128`, `setCategory(.playback, .spokenAudio, .duckOthers)` `:132-136`, `setActive(true)` `:140`. **Ordering relative to step 5 is unsequenced**: nothing awaits the community `stop()` before this call **[inference — consistent with E14's "native teardown before community recognizer stopped"]**. On this branch the call rejects at the bridge (see caveat) → `false` → `logDiagnostics()` (also rejects, 2000 ms cap) `:2011-2017` → continue.
9. **Web/native HTTP** `CapacitorHttp.post('/api/voice/openai-tts')` ≤ 30 000 ms `:2040-2057`; server picks engine (§3); base64 → ArrayBuffer `:2094`.
10. **Web** graph `:2288-2338`: resume if `suspended|interrupted` `:2292-2296`; `decodeAudioData` `:2314`; BufferSource→Gain→Analyser→destination.
11. **Web** playback promise `:2359-2420`: `playbackTimeout = (duration+30) s` `:2360`; if ctx not running, `resume().then(startPlayback)` `:2395-2405` else `startPlayback()` `:2407` → `setIsAudioPlaying(true)` `:2387` (isSpeaking already true via #2), `readAmplitude()` loop `:2388`, `source.start(0)` `:2389`.
12. **Web** at +2000 ms: analyser probe → `✅ [iOS] Audio output confirmed` or "No audio output" toast `:2408-2420` (§4).
13. **Web** `source.onended` `:2367-2373` → resolve; or timeout `:2360-2365` / `onerror` `:2375-2383` → reject.
14. **Web** `maiaSpeak` tail: `setIsAudioPlaying(false); setIsResponding(false)` `:2509-2511`; `finally` `:2517-2523` repeats + `stopAudioAnalysis()`. **No native call on the way out** — the session remains `.playback` until the next capture start reconfigures it (community plugin `Plugin.swift:82-89` on next `start`).
15. **Web** back in the handler: `commitOracleTurn('voice_after_speech')` `:6529` (or `voice_speech_error` `:6535`; or the 6000 ms watchdog already committed it `:6500`).
16. **Web** `finally` `:6538-6545`: `clearTimeout(transcriptWatchdog)`; `setIsResponding(false)`; `setIsAudioPlaying(false)`; `isMicrophonePaused` stays true until the 0 ms cooldown `:6551-6553` → `setIsMicrophonePaused(false)` → **`isSpeaking = false`** at the next commit `:10421`.
17. **Web** two competing re-arm drivers now run: (a) OC's `attemptMicRestart` loop `:6560-6618` (≤ 8 attempts, `startListening('non_stream_restart_attempt')`); (b) CC's `isSpeaking→false` effect `:2019-2027` (`requestRestart('maia_stopped_speaking')`) and the native 800 ms hands-free restart `:2044-2080`. Plus the 90/120 s `[voice:watchdog]` `:2898-3007` and the 75 s recovery timer `:3997-4056` as backstops. (Restart arbitration itself is the capture-side census's subject.)

---

## 3. Engines and fallback chain

| Engine | Where | Sovereign? | Reachable on `/maia`? | Selection rule | Fallback |
|---|---|---|---|---|---|
| **OpenAI TTS** (`gpt-4o-mini-tts`, or `body.model` = `tts-1` default `lib/settings/accountSettings.ts:58` when no instructions) | `app/api/voice/openai-tts/route.ts:140-150, 310-318`; SDK `:22-29` (`OPENAI_API_KEY`) | ✘ cloud | **✔ — the default and, in practice, only engine** | Member archetype `maia_*` → `provider:'openai'` (`lib/voice/voiceArchetypes.ts:66-72, 87-92`); unset archetype → `openai/alloy` `:88` | None on the client (`:2513-2516` "no fallback - OpenAI TTS only") |
| **Kokoro** (local) | route `:202-206` via `lib/tts/ttsRouter.ts:167` | ✔ | Only if `MAIA_LOCAL_VOICE_ENABLED=1` **and** `MAIA_TTS_PROVIDER=kokoro` (`:142-155`, route `:203`) **and** the member chose a Kokoro archetype (`voiceArchetypes.ts:75-80`) | archetype `group:'local'` | → consent check `:257-279` (`x-voice-local-only`/member policy) → OpenAI `alloy` `:306` or 503 `:275` |
| **Sesame / PersonaPlex** | `ttsRouter.ts:41-66` (`production-maia: ['auto','kokoro']`), `app/api/voice/stream-conversation/route.ts:101-106` | — | ✘ (stream route unreachable; Sesame "not qualified for production" `:41-46`) | — | — |
| **Server-side `synthesizeMaiaVoice`** (OpenAI) | `lib/voice/maiaVoiceService.ts:32`; list route `:1802-1809` | ✘ | ✘ — never requested/consumed by OracleConversation (#29) | `includeAudio` | — |
| **Browser `speechSynthesis`** | `lib/voice/maya-voice.ts` via dead `ttsWithFallback.ts:126` | ✔ | ✘ (no callers); `/maia` only `cancel()`s it `:7572,8273` | — | — |

Finding: the project invariant "Never use OpenAI or other cloud AI providers" (CLAUDE.md) is not met by the live output side — the spoken voice on `/maia` is OpenAI cloud TTS by default and by archetype table; local Kokoro is opt-in twice (env + archetype). Response headers make this auditable (`X-TTS-Provider`, `X-Voice-Policy`, `X-PFI-Voice-Plan` `:181-185, 352-356`). Route logs `pfi.tts.no_voice_plan` when instructions are absent `:99-107`.

---

## 4. What "output confirmed" actually measures

`OracleConversation.tsx:2408-2420`, iOS Web Audio path only. Two seconds after `startPlayback` is *scheduled* (the timer is armed even if `startPlayback` is deferred behind `ctx.resume()` `:2395-2405`), it reads `audioAnalyserRef.getByteFrequencyData()` and reports confirmed if **any frequency bin is non-zero**. The analyser sits inside the page's Web Audio graph between the gain node and `destination` `:2336-2338`. So the probe proves:

- the buffer decoded and the graph is pulling samples through the analyser node in WebKit's content process;
- and nothing more. It does not observe `AVAudioSession` activation, the content process's audio-session interruption state, the route (receiver/speaker/Bluetooth), the silent switch, or the hardware volume.

Consequently a graph that renders while the content process's session is interrupted (H-SILENT in the lane record) still logs `✅ [iOS] Audio output confirmed`. The keep-alive oscillator `ios-audio-session.ts:125-134` is also connected to `destination` but **upstream of nothing the probe sees** (it bypasses the analyser), so it cannot produce a false positive by itself **[inference]**.

Silent-switch / route awareness on the output side: none programmatic. Only user-facing hints (`:2390`, toasts `:2380,2413-2415,2516`) and the never-read-on-success `getAudioDiagnostics` (#4). The `.playback` category chosen by the gatekeeper (`AudioSessionManager.swift:132-136`) is the category iOS defines as *not* silenced by the ring/silent switch — platform semantics, not code in this repo; but on this branch the gatekeeper does not run, and the community plugin's `playAndRecord` session (`Plugin.swift:82-89`) is what governs.

---

## 5. Authority findings

**Who owns output.** `OracleConversation.maiaSpeak` `:1955` is the sole live producer and the sole owner of the Web Audio playback graph; ownership is expressed as local variables — there is no ref to the `BufferSource`, so no other site (barge-in `:2869`, tap-interrupt `:8425`, emergency stop `:7566`, watchdogs `:2971`, `:3968`) can stop MAIA's audio once `source.start(0)` `:2389` runs. Every "stop" on `/maia` stops either the unreachable streaming path (`stopStreamingVoice`) or the chat-mode replay element (`audioRef`). The only terminators are natural end, `(duration+30) s` timeout, and `onerror`.

**Who owns the audio session (native).** Three writers, none coordinated: (1) `@capacitor-community/speech-recognition` sets `playAndRecord/.voiceChat/.mixWithOthers` + `setActive(true)` on every `start` (`Plugin.swift:82-89`) and never deactivates; (2) `AudioSessionManager.prepareForSpeaking` does `setActive(false)` → `.playback/.spokenAudio/.duckOthers` → `setActive(true)` (`Swift:128-140`) — when registered; (3) WebKit's content process owns its own session state for Web Audio (not code in this repo). The gatekeeper's teardown `:239-274` only cancels resources it created via `createRecognitionRequest`/`startAudioEngine` `:284-315`, which `/maia` never calls (those are `VoiceController.swift:110,172` paths used by `IOSNativeVoiceProvider`, not by `ContinuousConversation`). So "full teardown" on `/maia` tears down nothing that is live.

**Do output and input negotiate the session?** No. Output announces itself through React state (`isMicrophonePaused` `:6484` → `isSpeaking` `:10421`); the capture side reacts asynchronously (`NativeSpeechRecognition.stop()` `:1991`, unawaited). Output does not wait for capture to stop before `prepareForSpeaking` `:2005` or `source.start` `:2389`; capture does not wait for output to finish before its restart drivers fire (`:2019-2027, 2044-2080`; OC `:6560-6618`). There is no handshake, no shared owner, no sequencing token — only flags and timers. `prepareForListening` is deliberately not called on the live path (`ContinuousConversation.tsx:3288-3292`).

**Every timeout touching output (ms).**

| Value | Where | Effect on expiry |
|---|---|---|
| 5 000 | `prepareForSpeaking` cap `OC:2007` | log, continue |
| 2 000 | `logDiagnostics` cap `OC:2013` | log |
| 30 000 | Capacitor TTS HTTP `OC:2055` | throw → catch toast → `finally` releases state; turn committed by watchdog/error path |
| none | web `apiFetch` TTS `OC:2130`; server OpenAI call `route.ts:150,318` | hang until the transport gives up |
| 2 000 | output probe `OC:2420` | toast only |
| (duration+30)·1000 | iOS playback `OC:2360`; Safari `:2216`; desktop `:2446` | reject → catch toast; source **not** stopped on iOS (no `source.stop()` in the timeout `:2360-2365`) |
| 5 000 | desktop start timeout `OC:2434` | pause + reject |
| 6 000 | transcript watchdog `OC:341,6500` | commit turn text; no audio effect |
| 0 | echo cooldown `OC:6493` | releases `isMicrophonePaused` |
| 300 / 400 / 500 | mic re-arm retries `OC:6613,6605,6579` | up to 8 attempts, then forced reset |
| 800 · 30 000 | CC native auto-restart delay · recent-speech window `CC:2049,2051` | restart request |
| 5 000 · 90 000 · 120 000 | `[voice:watchdog]` `OC:2946-2948` | flags reset, mic restart, toast; audio untouched |
| 45 000 · 74 000 / 75 000 | recovery timer `OC:4014,4033,4053` | `resetAllStates`, inject apology; audio untouched |
| 6 000 · 50 | `useStreamingVoice` watchdog / advance `:290,411` | inert on `/maia` |
| (dur‖20 000)+15 000 · 15 000 · 200 · 300·n | `StreamingAudioQueue` chunk watchdog `SAQ:284-292`; finalize stall `OC:5817`; cooldown `OC:5691`; TTS retry `OC:5935` | inert on `/maia` |
| 10 000 | `ttsWithFallback` `:66` | dead code |

---

## 6. Open questions

1. **Branch of record for the phone.** This branch carries the unregistered gatekeeper; the repaired build (E13/E14) is on `claude/ios-runtime-01-audiosession-registration`. Which build any future output witness runs against must be stated, because #3/#8 in §1 change meaning between them.
2. **H-SILENT mechanism.** Does `setActive(false)`→`setActive(true)` in the app process (`Swift:128,140`) interrupt WebKit's content-process session so that the graph in #8 renders to nothing while #9 reports confirmed? Not decidable from this repo; the probe is structurally blind to it (§4). The preserved A/B build (`~/voice-witness-dd`) is the founder-ruled control.
3. **Ordering of step 5 vs step 8.** Code gives no sequencing; E14 witnessed native teardown before the community stop. Is the community plugin's `stop()` (`Plugin.swift:234-236`) ever completing before `prepareForSpeaking`, and does it matter given the plugin never deactivates the session?
4. **No stop handle for live playback.** Is the absence of a `source.stop()` path (barge-in, interrupt, navigation, timeout) intended? With `interruptEnabled` default false `:1126-1134` the barge-in is mostly dormant, but the tap-interrupt `:8425` is live and currently resets flags while audio continues **[inference]**; that would also re-open capture under playing audio.
5. **`streamVoice.stop()` `:10340`.** Undefined identifier on the voice bar's stop button — confirm whether tsc reports it and whether the button is reachable on iOS.
6. **`includeAudio` discrepancy.** The convergence note `:7382` says the canonical path returns audio via `includeAudio: true`; the request body does not send it and the client never reads `responseData.audio`. Which statement is the intended design? (Affects the CMT modality proxy `list/route.ts:1300-1302`, which will read every `/maia` voice turn as `'typed'`.)
7. **Engine vow.** Is OpenAI TTS as the default `/maia` voice an accepted, documented exception to "never OpenAI", or a claim-state gap? The Kokoro path exists but requires env + archetype opt-in.
8. **Two keep-alive contexts.** `ios-audio-session.ts` (shared ctx + 1 Hz oscillator) and `voice-feedback-prevention.ts:19-75` (separate `iosAudioContext` + silent `Audio`) both run at module load. Does the second context interact with the session flip in #3?
9. **Watchdog "progress" semantics.** `lastAudioProgressRef` `:2941-2943` is refreshed on effect re-runs, not on rendered samples; a `BufferSource` that plays for > 90 s with no state change would be reset mid-speech **[inference]**. Long replies on slow TTS are the case to check.
10. **Unreachable but mounted.** `useStreamingVoice` keeps an `Audio` element and unlock listeners alive `:2600-2785, hooks:1010-1030`; does an idle, unlocked `HTMLAudioElement` in the same page affect WebKit's session category negotiation alongside the Web Audio graph?
