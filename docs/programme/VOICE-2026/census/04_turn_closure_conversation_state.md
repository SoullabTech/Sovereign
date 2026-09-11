# VOICE-2026 / CENSUS-01 — 04 · Turn Closure and Conversation / UI State

**Scope:** the live `/maia` voice path (iOS native + PWA/web). Read-only code census of branch `claude/voice-2026-census-01`, 2026-09-11.
**Question:** who has authority to declare the human's utterance complete, who can discard captured text, who can change the conversation's state, and who can change what the member sees about the microphone.
**Method:** source read of `components/voice/ContinuousConversation.tsx` (CC, 4275 lines), `components/OracleConversation.tsx` (OC, 11142 lines), `lib/voice/dispatchProvenance.ts`, `lib/voice/voiceDiagnostics.ts`, `lib/voice/conversationContinuityBuffer.ts`, `lib/voice/restartAuthority.ts`, `lib/voice/micLiveness.ts`, `lib/voice/voiceTiming.ts`, `hooks/useVoiceSession.ts`, `components/voice/VoiceInteractionBar.tsx`, and the headers of four `__tests__/voice-*` files. Every claim cites `file:line`. Items marked **[inference]** are derived from source shape, not from a witnessed run. Nothing here claims device behaviour.

**Branch note.** This branch still carries the `native_stop` dispatch (CC:3099-3100). The E20 "Repair Two" (`lib/voice/turnAccumulator.ts`, removal of `native_stop`, `armNativeFallbackSilenceTimer()`) lives on `claude/ios-runtime-01-repair-two-turn-close` and is **not present here**; this census describes the unrepaired state.

---

## 1. Send sites — every live `onTranscript(` invocation

All eight sites are preceded by `witnessDispatch(source, trigger, …)` (CC:271-290), which calls `recordDispatch()` (`lib/voice/dispatchProvenance.ts:113-130`) and emits `voice_transcript_dispatched`. The receiver on the live path is always `handleVoiceTranscript` (OC:6780, wired at OC:10412).

| # | File:line | Dispatch source (witnessDispatch) | Who decides the turn is over | Guards in front of the send | Clears `accumulatedTranscript`? | Notes |
|---|---|---|---|---|---|---|
| 1 | CC:1254-1255 | `fallback` / trigger `fallback` | The Android-Chrome one-shot `MediaRecorder` fallback (`androidVoiceFallback.recordAndTranscribe`, dynamic import CC:1245-1247), reached from web `onend` after `voice_audio_no_speech` hits its threshold. Turn end = the recorder's own bound (module default 8 s per the comment at CC:3508-3512; the module itself was not read for this census). | `result.ok && result.transcript` (CC:1248). Platform-gated to Android Chrome upstream. | No — this path never touches the accumulator. | No `isProcessingRef` set; no dedup. Failure → `onVoiceUnavailable` (CC:1260-1263). |
| 2 | CC:2251-2252 | `process_accumulated` / trigger = `sendTriggerRef` (`silence_timer` when armed by the web silence timer CC:1066; otherwise `other`) | **Web silence timer** (CC:1043-1077) at `silenceThreshold` ms, or the `extendRecording` re-arm (CC:3931-3936). Both call `processAccumulatedTranscript()` (CC:2105). | Concurrency latch `isCallingProcessRef` (2107); empty (2116); `isProcessingRef` (2124); **Check 1** exact-match within 2000 ms of last send (2137); **Check 2** >0.9 word-overlap within 1000 ms (2155-2160); **Check 3** MAIA-pattern list + <15 words (2180-2198). Timer callback itself requires `!isProcessingRef && trim()` (1073). | **Yes** (2208), then `recordSubmitted()` (2213), `recognition.stop()` (2217), `setMicState('SUBMITTING')` (2249). `isProcessingRef=true` (2205), auto-released after 500 ms (2265). | The **only** dedup-guarded site (`dispatchProvenance.ts:8-24`). `continuationRestartRef=false` (2209). Emits `voice_turn_committed` (2234). |
| 3 | CC:2809-2810 | `android_fallback` / `fallback` | `tryAndroidFallback` inside native `startListening` (CC:2783-2826): the recorder bound decides. | `platform === 'android'` (2784); `result.ok && result.transcript` (2806). `isProcessingRef=true` immediately before (2808). | No. | Sets `micState LISTENING` at 2799 and `IDLE` at 2822 around the one-shot capture. |
| 4 | CC:2943-2944 | `native_silence` / `silence_timer` | **2500 ms no-partials timer** (`nativeSilenceTimerRef`) re-armed on every native `partialResults` event (CC:2926-2949). | `finalTranscript && !isProcessingRef.current && !isSpeakingRef.current` (2932). | **Yes** (2939); `isProcessingRef=true` (2940); `setIsRecording(false)` (2941). | After dispatch calls `NativeSpeechRecognition.stop()` (2946), which will fire `listeningState:stopped` → site 6 (buffer already empty, so 6's guard fails). No dedup. |
| 5 | CC:3041-3042 | `native_audio_silence` / `silence_timer` | **1500 ms audio-level silence timer** armed by the native `audioLevel` listener when `rawLevel < 0.01 && transcript.length > 0 && (now − lastHighAudio) < 2000` (CC:3010-3021). | Timer arm requires `!nativeSilenceTimerRef.current` (3018); fire requires `accumulatedTranscript.trim() && !isProcessingRef.current` (3024). **No `isSpeakingRef` check** on this site. Timer cleared when `rawLevel >= 0.02` (3046-3052). | **Yes** (3037); `isProcessingRef=true` (3038). | **Shares `nativeSilenceTimerRef` with site 4.** Site 4 unconditionally clears and re-arms the ref on each partial (2926-2929); site 5 arms only when the ref is null. Which timer is live at any instant depends on event interleaving — **[inference]** the 1500 ms timer can only exist in a gap where no partial has re-armed the 2500 ms one. |
| 6 | CC:3099-3100 | `native_stop` / `native_stop` | **The native recognizer** — `listeningState` listener receives `status === 'stopped'` (CC:3059-3062, 3086). The plugin, not the app, decides. | `isListeningRef.current && accumulatedTranscript.current.trim()` (3092). **No `isProcessingRef`, no `isSpeakingRef`, no dedup.** | **Yes** (3096); `setIsRecording(false)` (3097-3098). | The path Repair Two removes on the other branch. Here it is live: any plugin-side segment end with text in the buffer sends. |
| 7 | CC:3532-3533 | `web_whisper` / `fallback` | The sovereign capture recorder (`recordAndTranscribe` with `maxMs: DESKTOP_MAX_UTTERANCE_MS` on desktop, module 8 s bound elsewhere — CC:3504-3512). | Stale-result gate `sovereignGenerationRef.current !== captureGeneration` (3520-3523); `result.ok && result.transcript` (3526). `isProcessingRef=true` (3531). | No (accumulator unused on this path). | Desktop/Firefox/Zen path only (comment 3505-3512). |
| 8 | CC:3780-3781 | `manual_stop` / `manual` | **Whoever calls `stopListening()`** (CC:3750). Callers found: `toggleListening` (CC:3902), unmount (CC:4157), `handleInterruptionStart`? (no — it does not call stopListening; it discards), and every OC caller through `useVoiceSession.methods.stopListening/cleanup` (`hooks/useVoiceSession.ts:96-101, 118-123`): holoflower mute tap (OC:8529), `VoiceInteractionBar.onStop` (OC:10340-10344), emergency stop (OC:7586). | `accumulatedTranscript.current.trim()` (3772); `onTranscript && !isProcessingRef.current` (3776). | **Yes, unconditionally** (3783) — including when the `!isProcessingRef` guard fails, in which case the text is cleared **without being sent** (see §2, D8). | `resetDispatchProvenance()` at 3790 and `wantsContinuousConversationRef=false` at 3763 run only under `options?.userExitMode`. **No caller in `components/`, `hooks/`, `app/`, `lib/` passes `userExitMode: true`** (grep, 2026-09-11) — the OC comment "USER EXIT MODE" at OC:8527-8529 describes a branch that `useVoiceSession.stopListening()` never reaches. **[inference]** |

**Receiver side (OC `handleVoiceTranscript`, OC:6780-7428).** Every site above hands text to a second gatekeeper that can *veto* but cannot *close* a turn. It reaches MAIA cognition only at `await handleTextMessage(cleanedText)` (OC:7397). `onTranscript` is typed `void`; CC neither awaits nor inspects the result, and CC has already cleared its buffer and called `recordSubmitted()` (CC:2213, site 2 only) before any OC guard runs. There is no return channel from OC's rejection back to CC's buffer or continuity record.

---

## 2. Discard sites — captured text cleared or dropped without being sent

### 2a. Inside `ContinuousConversation.tsx` (before dispatch)

| # | File:line | What is discarded | Reason given in code | Recoverable? |
|---|---|---|---|---|
| D1 | CC:870-880 (`onresult`) | Incoming Web Speech results (interim **and** final) are returned before accumulation when `inputSuppressedRef.current` (873) or `isSpeakingRef.current` (879). | "MAIA is speaking, transcript ignored (barge-in still active)" / "likely echo/feedback". | No. `voice_result_after_commit` (851-860) is emitted **before** these guards so the drop is witnessed, but the text is gone. |
| D2 | CC:814 (`onstart`) | Whole accumulator: `accumulatedTranscript.current = ""` on any start that is not flagged `continuationRestartRef` (808-815). | "Only clear on a genuinely new turn … processAccumulatedTranscript() owns the real clear once a turn is sent." | No. The continuity buffer's `pending` is **not** cleared here (only `salvageTranscript`/`recordSubmitted`/`clearPending` touch it), so a later `salvageTranscript` can still recover it from `sessionStorage` (CC:1528-1531). |
| D3 | CC:1971 (`isSpeaking` effect, `isSpeaking===true` branch) | Whole accumulator. | "Clear any accumulated transcript (it could be MAIA echo starting)" (1966-1972). Also clears the web silence timer and the 60 s recognition timer (1975-1982). | No. Fires whenever OC flips `isAudioPlaying \|\| isMicrophonePaused` true (OC:10421) — i.e. **the parent's TTS state change discards the child's unsent text.** |
| D4 | CC:2149 | Accumulator (`// Clear duplicate`) | Check 1 exact-match dedup, 2000 ms window (2137). | No. Emits `voice_dedup_blocked dedupKind=exact`. |
| D5 | CC:2176 | Accumulator | Check 2 fuzzy dedup >0.9 within 1000 ms (2155-2160). | No. Emits `voice_dedup_blocked dedupKind=fuzzy`. |
| D6 | CC:2197 | Accumulator (`// Clear echo`) | Check 3: transcript contains any of 16 hard-coded MAIA phrases (`'mmm'`, `'yes'`, `'pause'`, `'like...'`, …) **and** is under 15 words (2180-2194). | No. **No telemetry event** on this branch (only `console.log`). A member saying a short sentence containing "yes" or "pause" is silently dropped. **[inference from the pattern list]** |
| D7 | CC:2923 (native `partialResults`) | The **previous** accumulator content — `accumulatedTranscript.current = transcript` is an **assignment, not an append**. | "Accumulate transcript" (comment 2922) — but the code replaces. | No. This is the E16 long-utterance mechanism: when the recognizer re-segments inside one task and delivers a fresh partial, everything before it is overwritten. The continuity buffer is **not** mirrored on the native path (`recordPending` is called only from web `onresult`, CC:1014). |
| D8 | CC:3783 (`stopListening`) | Accumulator, cleared **after** the send is skipped when `isProcessingRef.current` is true (3776-3783). | None stated; the clear is unconditional. | No. |
| D9 | CC:1073-1076 (web silence timer fires while `isProcessingRef`) | Not cleared — left in the buffer, "conditions not met to process". | — | Text survives until D2 or a later timer; **[inference]** it can then be sent late, merged into the next utterance. |
| D10 | CC:2124-2128 (`processAccumulatedTranscript` while `isProcessingRef`) | Not cleared, not sent ("Already processing, skipping"). | — | Same as D9. |
| S1 (redirect, not discard) | CC:1524-1538 `salvageTranscript` | Accumulator **and** continuity `pending` cleared (1533-1534), text handed to `onTranscriptSalvage` → OC appends it to the text-input draft and opens the chat surface (OC:10448-10455). Called from `handleCaptureLoss` (1638) and `handleWebDeviceChange` (1919). | "What the member said is the member's … never auto-sent." | Yes — becomes an editable draft. |

### 2b. Inside `OracleConversation.handleVoiceTranscript` (after dispatch; CC buffer already cleared)

| # | OC:line | Drop condition | Note |
|---|---|---|---|
| O1 | 6784-6787 | empty after trim | |
| O2 | 6796-6803 | `isAudioPlayingRef \|\| isRespondingRef \|\| isMicrophonePausedRef` | "Rejecting transcript — MAIA is speaking". Uses refs synced from state by effect OC:3990-3995 **and** by ~39 direct ref writes — two sync mechanisms. |
| O3 | 6811-6817 | identical text to `lastProcessedTranscriptRef` within **30 000 ms** | Third dedup window (after CC's 2000/1000 ms). |
| O4 | 7150-7155 | matched voice command and `t.length < 50` and not a reflect action | "standalone command" heuristic |
| O5 | 7212 | pure "voice MAIA" command with no content | |
| O6 | 7221-7225 | punctuation-only after strip | |
| O7 | 7256-7258 | contains a "ghost phrase" (YouTube-style) | |
| O8 | 7262-7265 | `now < echoSuppressUntil` | `echoSuppressUntil` is only ever set to `now + 0` (OC:6493, 6520) — **[inference]** this guard cannot currently fire. |
| O9 | 7270-7281 | ≥10 chars and substring-similar to `lastMaiaResponseRef` | |
| O10 | 7287-7293 | `isProcessingRef \|\| isRespondingRef` | "Already processing" |
| O11 | 7297-7300 | same text as last `messages[]` user entry | Fourth dedup. |
| O12 (redirect) | 7336-7341 | scribe mode, not aside | recorded via `recordVoiceTranscript`, not sent to MAIA |

**Consequence [inference]:** a turn that CC dispatched from site 2 has been marked `recordSubmitted` in the continuity buffer (CC:2213) and cleared from the accumulator; if OC then drops it at O2/O3/O10 the member's words exist in no buffer, no draft, and no message — only in the `voice_transcript_dispatched` count.

---

## 3. Turn timers

| Timer | Value | Owner / file:line | Effect |
|---|---|---|---|
| Web silence (`silenceThreshold` prop) | Talk **3500 ms**, Care **10 000 ms**, Scribe **999 999 ms** (`lib/voice/voiceTiming.ts:14-20`), selected by OC `listeningMode` at OC:10423-10427. CC default `12000` (CC:303) is dead because OC always passes a value. | CC web `onresult` arms/re-arms on every result (CC:1017-1077); `silenceTimerRef`. | → `processAccumulatedTranscript()` (site 2). Emits `voice_silence_timer_armed`/`_fired`. |
| `extendRecording` re-arm | same `silenceThreshold` | CC:3925-3937; exposed as `useVoiceSession.methods.interrupt()` (hook:104-111). **No caller of `.interrupt()`/`extendRecording()` found outside CC and the hook** (grep). | Dead in practice **[inference]**. |
| Native no-partials silence | **2500 ms** literal (CC:2949) | `partialResults` listener, `nativeSilenceTimerRef` | → site 4 |
| Native audio-level silence | **1500 ms** literal (CC:3045); arm conditions `rawLevel<0.01`, recent-speech window **2000 ms** (CC:3013), clear at `rawLevel>=0.02` (3046) | `audioLevel` listener, same `nativeSilenceTimerRef` | → site 5 |
| `VOICE_TIMING.NATIVE_SILENCE_MS` 2500 / `NATIVE_RECENT_SPEECH_MS` 3500 / `GRACE_WINDOW_MS` 750 | declared `voiceTiming.ts:26-46` | **Unreferenced anywhere outside `voiceTiming.ts`** (grep). The native path uses literals; the grace window described in the comment does not exist in CC. | Documentation drift **[inference]**. |
| `isProcessingRef` auto-release | 500 ms after site-2 dispatch | CC:2263-2266 | Re-opens the send gate regardless of whether OC has finished. |
| Dedup windows | CC exact 2000 ms (2137), CC fuzzy 1000 ms (2155); OC identical 30 000 ms (6815) | | Three overlapping windows on one text. |
| Web recognition hard timeout | 60 000 ms; then `stop()` if >8000 ms since speech else +20 000 ms (CC:826-843) | `recognitionTimeoutRef` | `stop()` → `onend` → restart path (buffer preserved via `continuationRestartRef`, CC:1439). |
| `onend` inactivity stand-down | no speech **and** no MAIA audio end within **45 000 ms** (CC:1365-1369), unless `persistentListening` (Care/Scribe) | web `onend` → `handleCaptureLoss('inactivity')` (CC:1379) | reason code `LISTENING_STOOD_DOWN` (`micLiveness.ts:129`), `micState ERROR` (CC:1665), `level:'info'` so OC does **not** toast or flip `isHandsFreeMode` (OC:10437). |
| Rapid-end / restart-loop | end <500 ms of start (CC:1296); restart <2000 ms apart counts as rapid, 10 → `restart_loop` (CC:1400-1413); backoff 300·2ⁿ ms cap 5000 (1424-1427) | web `onend` | `handleCaptureLoss` → ERROR |
| Web ARMING watchdog | 2000 ms (CC:2690-2709) | `startListening` | → IDLE, web instance discarded |
| Native hands-free ARMING watchdog | 3000 ms (CC:3226-3239) | `listeningState:stopped` restart path | → IDLE |
| Native idle-stop grace | `nativeStartGraceMs = 1200` (CC:616, used 3113) | | stop within grace not counted as failure |
| Native hands-free backoff | 800 / 1500 / 2500 ms, then fallback to PUSH_TO_TALK (CC:3152-3181); `MAX_NATIVE_RESTARTS = 10` (3120) | | `onHandsFreeFallback` → OC `setIsHandsFreeMode(false)` (OC:10429-10432) |
| `isConversationAlive` | 30 s since transcript / 15 s since audio end / 10 s since tap (CC:81-92) | gates native restarts (3137-3141), interruption end (3973), foreground (4061) | |
| Native post-TTS auto-restart | 800 ms delay, requires speech within 30 000 ms (CC:2054-2068) | `isSpeaking` false effect | → `requestRestart('maia_stopped_speaking')` |
| Capture liveness | heartbeat 1000 ms, silent death 15 000 ms, arming-silent 5000 ms, track-mute grace 1500 ms (`micLiveness.ts:67-85`) | CC:1740-1809 | `handleCaptureLoss(cause)` |
| OC activating timeout | 5000 ms (OC:8471-8480) | holoflower tap | `setIsActivating(false); setIsMuted(true)`; toast "Mic failed to start" |
| OC "Still preparing" | 6000 ms (OC:1719-1721) | `micRequestState` | wording only, never concludes failure (comment 1700-1708) |
| `VOICE_TRANSCRIPT_WATCHDOG_MS` | 6000 ms (OC:341; armed 6499-6501) | non-streaming TTS branch | `commitOracleTurn('voice_tts_watchdog')` |
| `[voice:watchdog]` | audio-stuck 90 000 ms, processing-stuck 120 000 ms, check every 5000 ms (OC:2934-2936) | interval OC:2939-2977 | `forceWatchdogReset` sets `isListening=true` **without** engine confirmation (OC:2989) |
| Streaming cooldown | 200 ms (OC:5688); non-streaming `cooldownMs = 0` (OC:6493) | TTS complete → `setIsMicrophonePaused(false)` | |
| Barge-in debounce | 200 ms default (CC:313), threshold multiplier 1.2 (CC:314); native threshold `0.02 × multiplier` (CC:2986) | `audioLevel` listener | `onInterrupt` → OC `handleVoiceInterrupt` (OC:2874-2896) |

---

## 4. Conversation / mic state

### 4a. State variables

**Engine side — `ContinuousConversation.tsx`**

| Name | Type / values | Declared | Writers | Readers |
|---|---|---|---|---|
| `micStateRef` | `MicState` = `IDLE \| ARMING \| LISTENING \| CAPTURING \| SUBMITTING \| WAITING_FOR_TTS \| PLAYING_TTS \| INTERRUPTED \| ERROR` (CC:69-79) — a **ref, not React state** | CC:357 | only `setMicState(newState, source)` (CC:524-529), 36 call sites. **`CAPTURING` and `WAITING_FOR_TTS` are never set anywhere** (grep). | `authorityGuard` (CC:143-146), `handleCaptureLoss` idempotency (1585), `normalizeTurnCompleteState` (3663-3667), forensics (1604), imperative handle snapshot `micState: micStateRef.current` (CC:4116) → `useVoiceSession.getPhase()` (hook:45-63). |
| `listeningModeRef` | `'PUSH_TO_TALK' \| 'HANDS_FREE' \| 'OFF'` (CC:67), default `HANDS_FREE` | CC:358 | `setHandsFree` (4096-4099); backoff-exhausted (3172) | `authorityGuard` (148) |
| `handsFreeActiveRef` | boolean, default **true** | CC:515 | `setHandsFree` (4098), backoff-exhausted (3171) | `restartPolicy` (3702), native restart gates (3151, 2059, 3971), handle `isHandsFree` (4115) |
| `isListening` + `isListeningRef` | boolean — "the member wants listening" | CC:310, 350; synced 1951-1953 | ~20 sites (start/stop/loss/error) | `onend` restart predicate (1392), native `stopped` gate (3092), liveness `applicable` |
| `isRecording` + `isRecordingRef` | boolean — "the engine reports live" | CC:311, 351 | web `onstart` (793), native `listeningState` (3066-3067), partial (2916), dispatch sites | `toggleListening` (web branch), forensics |
| `nativeStatusRef` | `'started' \| 'stopped'` — "🔑 single source of truth for native listening state" | CC:337 | native `listeningState` listener (3065) | `toggleListening` (3897-3899), post-TTS restart (2065) |
| `wantsContinuousConversationRef` | boolean | CC:353 | start paths true; fatal error/loss/backoff false; **`stopListening(userExitMode)` false — unreachable (§1 #8)** | native `stopped` (3090), post-TTS effect (2049), restart timers |
| `inputSuppressedRef` | boolean (web TTS suppression) | CC:642 | `isSpeaking` effect (2006, 2023) | `onresult` D1 (873), liveness `applicable` (1757) |
| `isProcessingRef` | boolean | CC:348 | **two authorities**: prop sync `isProcessing` → ref (CC:1947-1949; prop = OC `isResponding`, OC:10420) **and** local `= true` at sites 2,3,4,5,7,8 plus `= false` at CC:2017, 2050, 2265 | every send guard; `restartPolicy` |
| `isSpeakingRef` | boolean | CC:349 | synchronous prop sync `isSpeakingRef.current = isSpeaking` (CC:1943; prop = `isAudioPlaying \|\| isMicrophonePaused`, OC:10421); force-override clears it (2733) | D1, D3, site 4 guard, `onend` (1301, 1349), restart policy |
| `continuationRestartRef` | boolean | — | `onend` restart (1439), cleared at `onstart` (810), site 2 (2209), stopListening (3792) | `onstart` D2 decision (808) |
| `committedRef` / `turnCommitIdRef` / `sendTriggerRef` | witness state | — | site 2 (2230-2245) | telemetry only |
| `voiceError` | string \| null | CC:315 | fatal `onerror` (1127), arming timeout (2704), cleared on `onstart` (795) | CC's own JSX (4204-4218) — **rendered inside `sr-only`** (OC:10409), invisible |

**Orchestration side — `OracleConversation.tsx`**

| Name | Type | Declared | Writers | Readers |
|---|---|---|---|---|
| `isListening` | boolean | OC:847 | `handleRecordingStateChange` (1822, "SOURCE OF TRUTH" per comment 1813); holoflower fail (8501) / mute (8377); `VoiceInteractionBar.onStop` (10344); streaming restart **optimistic true** (2843) / false (2827); barge-in **optimistic true** (2891); watchdog reset **optimistic true** (2989); limits block (2634); `onVoiceStatus` non-info (10440) | `voiceInteractionState` (886), holoflower label (9148), UV aura (9000), `RhythmHoloflower` (8556), `TransformationalPresence` (8345), `micRequestState` reset (1714) |
| `isActivating` | boolean | OC:848 | holoflower tap true (8467), cleared by recording callback (1821), timeout (8476), restart paths | `voiceInteractionState → 'recovering'` (887) |
| `micRequestState` / `micPreparingLong` | `'idle'\|'pending'\|'failed'` / boolean | OC:1709-1711 | effects 1713-1722 | holoflower label (9144-9147) |
| `isMuted` | boolean, default **true** | OC:868 | recording callback (1827, 1838); holoflower (8466, 8477, 8526); TTS-complete paths (5756, 6555); emergency (7585) | holoflower toggle decision (8423-8426): "isMuted as source of truth — isListening can desync on iOS" |
| `isHandsFreeMode` | boolean, default true — "UI state mirror" | OC:869 | `onHandsFreeFallback` (10430), `onVoiceStatus` (10440), `onVoiceUnavailable` (10463) | UI only; **the engine truth is `voiceMicRef.current?.isHandsFree`**, read at OC:2777 (`?? true`), 2822 (`?? true`), 5748 (`?? false`) — three reads, two different defaults |
| `isResponding`, `isProcessing`, `isAudioPlaying`, `isMicrophonePaused` | booleans | OC:849-850, 864, 867 | ≈120 `set*` sites (grep) | derive `voiceInteractionState`; `isSpeaking`/`isProcessing` props to CC (10420-10421); OC guards O2/O10 via refs |
| `isRespondingRef`, `isAudioPlayingRef`, `isMicrophonePausedRef`, `isProcessingRef` | refs | OC:1610-1612 | synced from state by effect OC:3990-3995 **and** written directly at ~39 sites | O2, O10, watchdog, restart gates |
| `listeningMode` | `'session' \| 'patient' \| …` (Talk/Care/Scribe) | OC:727 | 4941, 7187 (voice commands / mode UI) | `silenceThreshold` + `persistentListening` props (10423-10428) |
| `voiceInteractionState` | derived: `thinking > speaking > listening > recovering > idle` | OC:883-888 | pure derivation | `VoiceInteractionBar.voiceState` (10337) |
| `interimTranscript` | string | — | `onInterimTranscript` (10413); cleared at dispatch (6782) | `VoiceInteractionBar` tape (VIB:223-240) |
| `lastSendWasVoiceRef` | boolean | OC:1619 | set true after O2/O3 pass (6825) | gates mic re-arm after TTS (2781, 2665, 5758) |
| `echoSuppressUntil` | number | OC:770 | `now + 0` (6493/6520) | O8 — inert |
| `isPwaVoice` / `pwaVoice` | `false` stub | OC:892-905 | never | dead branches (8368, 9228-9240 debug panel) |

### 4b. Transitions — text state machine

**`micState` (engine, CC).** Only `setMicState` writes it; the *sources* below are the string tags passed.

```
IDLE ──startListening('startListening')──────────────────────▶ ARMING            CC:2685
IDLE ──hands-free restart timer('hands_free_restart')────────▶ ARMING            CC:3200
IDLE ──sovereign capture('sovereign_awaiting_admission')─────▶ ARMING            CC:3470
ARMING ──web onstart('web_recognition_started')──────────────▶ LISTENING         CC:798
ARMING ──native listeningState:started───────────────────────▶ LISTENING         CC:3078
ARMING ──2 s / 3 s watchdog('arming_timeout','hands_free_arming_timeout')─▶ IDLE CC:2705, 3237
ARMING ──start blocked, MAIA speaking / permissions failed / restart_failed─▶ IDLE CC:2727, 2843, 3260
ARMING ──foreground while stuck('foreground_clear_stale_arming')─▶ IDLE          CC:4056
* ──android fallback('android_native_fallback')──────────────▶ LISTENING → IDLE  CC:2799, 2822
* ──sovereign admitted / done────────────────────────────────▶ LISTENING → IDLE  CC:3477, 3572
LISTENING ──processAccumulatedTranscript (site 2 only)────────▶ SUBMITTING        CC:2249
* ──isSpeaking prop true('maia_speaking')────────────────────▶ PLAYING_TTS       CC:1984
PLAYING_TTS | SUBMITTING | ARMING(not starting) | ERROR | INTERRUPTED
   ──normalizeTurnCompleteState(source)──────────────────────▶ IDLE              CC:3663-3667 (shouldNormalizeToIdle, restartAuthority.ts:45-60)
LISTENING ──native listeningState:stopped (wantsToListen)────▶ IDLE              CC:3133
* ──fatal onerror / handleCaptureLoss / ensureFreshAndStart failure─▶ ERROR      CC:1128, 1665, 1845
* ──devicechange / backoff_exhausted / interruption_end / ios_interruption_end─▶ IDLE CC:1926, 3173, 3979, 3987
* ──iOS interruption start───────────────────────────────────▶ INTERRUPTED       CC:3950
ERROR | IDLE ──requestRestart(source) → authorityGuard.allowed─▶ (startListening) CC:3699-3725
```
Never entered: `CAPTURING`, `WAITING_FOR_TTS`. Sites 4, 5, 6, 8 dispatch **without** moving `micState` to `SUBMITTING`; only site 2 does. **[inference]** After a native silence-timer send the engine reads `LISTENING` until the plugin's `stopped` event arrives (→ `IDLE`, CC:3133), so `useVoiceSession.getPhase()` reports `listening` during a turn that has already been sent.

**Restart authority (who may re-arm).** `requestRestart(source)` (CC:3669-3742) is the declared single entry: re-entrancy latch → tap clears stale latches (`staleLatchesToClearForTap`, restartAuthority.ts:114-125) → `normalizeTurnCompleteState` → `restartPolicy` (restartAuthority.ts:83-103: speaking / processing / push-to-talk-awaits-tap) → `authorityGuard` (CC:114-153: in-flight / not IDLE-or-ERROR / iOS PTT non-tap) → `startListening({forceOverride:true})`. Callers: `user_tap` (toggle 3910, handle 4092), `maia_stopped_speaking` (2043, 2068), `recognition_stopped` (3248, forceOverride), `interruption_end` (3981), `foreground_resume` (4071). The parent reaches it only via `voiceMicRef.startListening` → `useVoiceSession.methods.startListening(reason)` (hook:78-90) — the `reason` string is **not forwarded**; every parent call arrives as `user_tap` (CC:4092-4093). **[inference]** Therefore OC's automatic restarts at 2678, 2781, 2848, 5758 are admitted by `restartPolicy` as user taps (`isUserTap` bypasses `push_to_talk_awaits_tap`, restartAuthority.ts:84, 98).

**OC `isListening` (what the member sees).**

```
false ──CC onRecordingStateChange(true) [web onstart 796 · native started 3071]──▶ true     OC:1822
true  ──CC onRecordingStateChange(false) [dispatch sites 4/8, loss, stop, fatal, TTS suspend 2025]─▶ false OC:1822
false ──streaming TTS complete + hands-free──────────────────────────────────────▶ true (optimistic) OC:2843
false ──barge-in handleVoiceInterrupt────────────────────────────────────────────▶ true (optimistic) OC:2891
false ──[voice:watchdog] forceWatchdogReset───────────────────────────────────────▶ true (optimistic) OC:2989
true  ──holoflower mute tap / VoiceInteractionBar stop / start failure / limits───▶ false OC:8377, 10344, 8501, 2634
true  ──onVoiceStatus level≠info─────────────────────────────────────────────────▶ false OC:10440
```

**`voiceInteractionState` (bar).** `thinking` if `isProcessing||isResponding`; else `speaking` if `isAudioPlaying`; else `listening` if `isListening`; else `recovering` if `isActivating`; else `idle` (OC:883-888). No input from `micState`.

**MAIA turn commit.** `commitOracleTurn(reason)` (OC:6371-6396) is idempotent (`oracleTurnCommitted` latch) and appends the oracle message + `onMessageAdded` + voice-mode memory save. Terminal callers: `chat` (6400), `voice_streaming_audio` (6461), `voice_tts_watchdog` (6499-6501, 6 s), `voice_after_speech` (6529), `voice_speech_error` (6535), `voice_no_tts` (6634). Streaming path (`onComplete` with `audioChunks===0`) appends via its own `setMessages` (OC:2667) — a separate seam outside `commitOracleTurn` (it belongs to the streaming route, not the `handleTextMessage` non-streaming path pinned by the test).

**`isSpeaking` prop to CC = `isAudioPlaying || isMicrophonePaused` (OC:10421).** Set true at non-streaming TTS start (`setIsMicrophonePaused(true)`, 6483) and streaming start (5693-5694); `isAudioPlaying` true from `audio.onplay`/Web-Audio start (2195, 2352, 2430) and false from `onended`/`onerror`/`finally` (2202-2235, 2452-2487); `isMicrophonePaused` false after cooldown (5743, 6554), on error (6652), on barge-in (2888), on watchdog (2988), on TTS-with-no-chunks (2657). Emergency stop sets it **true** and leaves it (7591).

### 4c. Where two variables can disagree

| Pair | How they diverge | Cite |
|---|---|---|
| OC `isListening` vs CC `micState`/`nativeStatusRef` | Three OC writers set `isListening=true` before any engine confirmation (2843, 2891, 2989); the OC comment at 1813-1814 and 4360-4362 says the recording callback is the sole truth. | OC:2843, 2891, 2989 vs 1822 |
| OC `isMuted` vs OC `isListening` | Acknowledged in code: "isListening can desync on iOS" — the holoflower toggles on `isMuted`, the label renders `isListening`. | OC:8423-8426, 9148 |
| OC `isHandsFreeMode` vs CC `handsFreeActiveRef` | `isHandsFreeMode` is only ever set **false** (10430, 10440, 10463) and never read by the engine; the engine mode is flipped only via `setHandsFree` (CC:4096), which OC never calls (grep in this file: no `setHandsFree(` caller found). Reads of the engine value use different fallbacks (`?? true` ×2, `?? false` ×1). | OC:869, 2777, 2822, 5748 |
| CC `isProcessingRef` vs OC `isResponding` | CC sets `isProcessingRef=true` locally at dispatch; the prop-sync effect (CC:1947-1949) overwrites it with OC's `isResponding` on the next render, and CC's own 500 ms release (2265) runs regardless of OC. Two clocks. | CC:1947, 2205, 2265; OC:10420 |
| CC `isListeningRef` vs `wantsContinuousConversationRef` | Native `stopped` treats either as "wants to listen" (CC:3090); the send guard on site 6 uses only `isListeningRef` (3092). | CC:3090-3092 |
| `micState` vs dispatch | Sites 4/5/6/8 send without `SUBMITTING`; `useVoiceSession.capabilities.canSubmit/canInterrupt` key on `capturing` (hook:161-163), a phase never produced. | CC:2939-2944, 3037-3042, 3096-3100; hook:159-165 |
| Handle snapshot staleness | `useImperativeHandle` recomputes on `[isListening, isRecording, …]` (CC:4118); `micState`/`listeningMode`/`isHandsFree` are copied by value, so a ref change without a state change leaves the parent reading the old value. **[inference]** | CC:4110-4118 |
| Continuity buffer vs native path | `recordPending` is called only from web `onresult` (CC:1014); on iOS native the buffer holds no pending text, so `salvageTranscript`'s fallback (1528-1531) has nothing to recover after D7 overwrites. | CC:1014, 2923, 1528-1531 |

### 4d. Which component renders the mic state, and from what

| Surface | File:line | Source of truth |
|---|---|---|
| `VoiceInteractionBar` dot + label ("listening"/"thinking"/"speaking"/"…") + interim tape | `components/voice/VoiceInteractionBar.tsx:71-135, 223-240, 293-295`; mounted OC:10334-10338 | OC-derived `voiceInteractionState` (OC:883-888) — four OC booleans; **no `micState`** |
| Holoflower caption ("Tap to Speak" / "Preparing to listen…" / "Still preparing…" / "Listening" / "Tap to try again") | OC:9144-9150 | OC `micRequestState`, `micPreparingLong`, `isListening` |
| Ultraviolet listening aura | OC:9000 | OC `isListening` |
| `RhythmHoloflower` motion | OC:8556-8561 | OC `isListening`, `isProcessing`, `isResponding`, `isAudioPlaying` |
| `TransformationalPresence` | OC:8345-8346 | OC `isListening`, `isResponding` |
| Toasts ("Activating voice…", "Interrupted", "Hands-free paused — tap to talk", capture-loss messages) | OC:8460-8470, 2895, 10431, 10441 | event-driven; capture-loss text authored in `micLiveness.describeCaptureLoss` (201-255) |
| CC's own mic button / "Listening…" status / `voiceError` banner | CC:4195-4230 | CC `isListening`, `isRecording`, `voiceError` — **inside `<div className="sr-only">`** (OC:10409): not visible, screen-reader only |
| `VoiceDebugOverlay` | mounted by OC on Capacitor native (CC comment 328-330) | `pushVoiceDebug` bus |
| PWA debug panel | OC:9222-9240 | `pwaVoice` stub — dead (`isPwaVoice=false`, OC:895) |

**Finding:** the member-visible microphone state is derived entirely from OracleConversation booleans; the engine's `micState` reaches the parent only through `useVoiceSession.state.phase`, which is consumed for *capability gating* (OC:2678, 2777) and **never rendered**.

---

## 5. Already-pinned invariants (from test headers / `it()` names)

- `__tests__/voice-non-degradation.test.ts` — Deep-Intelligence Gate v5: pins the **closed exit set** of `handleVoiceTranscript` (every `return`) and the **closed call sets** (handler-wide and per-guard) so no responder can be added, moved, or substituted between voice input acquisition and MAIA cognition; convergence point is `handleTextMessage` (header lines 1-60).
- `__tests__/voice-transcript-commit.test.ts` — exactly **one** `commitOracleTurn` seam; nothing else appends the oracle message on the canonical (non-streaming) turn; the post-speech commit is **not** gated on `showVoiceText`; a stalled `maiaSpeak` cannot withhold the words (6 s watchdog); speak + silent still commits; every terminal voice path reaches the seam (`it()` at 40, 47, 64, 71, 79, 83).
- `__tests__/voice-capture-01b-dispatch-provenance.test.ts` — both dedup guards emit `voice_dedup_blocked` (exact and fuzzy, similarity only on fuzzy); **every `onTranscript(` invocation is immediately preceded by its own `witnessDispatch(`** with a distinct source label; no transcript text leaves either event; both events are in the emitter union and server allowlist; the comparator numbers monotonically, reports first-as-false/−1, normalizes case/space, detects CASE 2 repeats, never equates empties; provenance resets on mount, unmount and `userExitMode` (after the `manual_stop` flush) — exactly three reset sites — and **not** on mic re-acquisition (`it()` at 47, 58, 99, 105, 144, 162, 185, 203, 218-258, 294-326).
- `__tests__/voice-capture-01a-latch-release.test.ts` — `processAccumulatedTranscript` takes the `isCallingProcessRef` latch on entry and **releases it on every early return** while held, including Check 1 (`it()` at 66, 73, 91).

None of the four pins: which timer may close a native turn; that `partialResults` must append rather than replace (D7); that a dispatched turn must not be discarded by the parent; that `micState` must move on every dispatch; or that the UI must read the engine's state.

---

## 6. Authority findings

1. **Turn-closure authorities: eight dispatch sites, seven distinct deciders.** (a) the web silence timer (site 2; plus its dead `extendRecording` twin); (b) the native 2500 ms no-partials timer (site 4); (c) the native 1500 ms audio-level timer (site 5); (d) **the native recognizer itself** via `listeningState:stopped` (site 6); (e) any caller of `stopListening()` — user tap, `VoiceInteractionBar` stop, emergency stop, unmount, toggle (site 8); (f) the Android one-shot recorder bound (sites 1 and 3); (g) the sovereign whisper recorder bound (site 7). On the **live iOS native path four of them are simultaneously armed** — (b), (c), (d), (e) — and (b)/(c) share one timer ref while (d) and (e) carry no dedup and no `isSpeaking` check. On the **PWA path** it is (a) plus (e), with the sovereign path (g) on browsers lacking Web Speech. `OracleConversation` is a **ninth authority that can veto** any of the eight (twelve guard returns, §2b) but cannot itself close a turn.

2. **Discard authorities: ten in the engine, twelve in the orchestrator.** Engine: D1 result suppression, D2 `onstart` clear, D3 parent-TTS clear, D4/D5/D6 dedup + echo pattern, D7 native partial overwrite, D8 stop-while-processing, plus D9/D10 silent non-sends. Orchestrator: O1-O11 (§2b). Only D4, D5 and the `voice_transcript_salvaged` redirect emit telemetry; D3, D6, D7, D8 and all twelve OC drops are `console` only. The parent's state (`isAudioPlaying || isMicrophonePaused`) is itself a discard authority over the child's buffer (D3) and over dispatched text (O2).

3. **Dispatched ≠ accepted, and nothing reconciles the two.** Site 2 clears its buffer and records `recordSubmitted` before OC's guards run; OC's rejection returns `void` into a callback CC never awaits. The continuity buffer can therefore hold a "submitted" turn that MAIA never received.

4. **The UI does not read one source of truth.** The engine keeps three overlapping liveness signals (`micState`, `nativeStatusRef`, `isRecording`/`isListening`) plus a mode pair (`listeningModeRef`, `handsFreeActiveRef`); the orchestrator keeps its own six (`isListening`, `isActivating`, `micRequestState`, `isMuted`, `isHandsFreeMode`, four TTS booleans) and derives the rendered state from those alone. `handleRecordingStateChange` is declared the source of truth (OC:1813) yet three OC paths set `isListening=true` optimistically and one CC path (`onVoiceStatus` info-level) is deliberately not propagated. The engine's `micState` is never rendered.

5. **The single-restart-authority claim holds inside CC but is flattened at the boundary.** `requestRestart` is the only path to `startListening` inside CC, but `useVoiceSession` forwards every parent request as `user_tap` (hook:78-90 → CC:4092), so parent-initiated automatic restarts are evaluated under the user-gesture policy.

6. **`userExitMode` is a declared but unreachable authority.** No caller passes it; the provenance reset at CC:3790 and the intent clear at CC:3763 depend on it. The 01b test pins the source shape, not reachability.

---

## 7. Open questions

1. On iOS, which of the four armed closers (2500 ms partial, 1500 ms audio, plugin `stopped`, manual) actually fires first in the E16 long-utterance case, and does the 1500 ms timer ever survive a partial re-arm? Answerable from `voice_transcript_dispatched.source` + `ios_voice_final_result_received.source` on a device trace; not from source.
2. Does the native `partialResults` payload ever carry cumulative text across a recognizer re-segmentation, or always the new segment only? Source assumes replacement is safe (CC:2923); E16 says it is not. Plugin behaviour, not app code.
3. How often does O2 (`MAIA is speaking`) reject a turn that CC has already marked `recordSubmitted`? No event is emitted at O2; unmeasurable today.
4. Is `voiceTiming.ts`'s `GRACE_WINDOW_MS` (750 ms, "finalization is cancelled if speech resumes") an unimplemented design or a removed feature? Git history not consulted.
5. Why does `useVoiceSession.methods.startListening(reason)` drop `reason`, and should parent-driven restarts be classified as `user_tap`? Design intent not recoverable from source.
6. Does the 60 s web recognition timeout (CC:826-843) ever `stop()` with text in the buffer and, via `onend` → continuation restart, merge two utterances the member intended as separate? Requires a trace of `voice_recognition_ended` vs `voice_turn_committed`.
7. Is the 16-phrase echo list (CC:2180-2186) still load-bearing now that web recognition is suspended during TTS (CC:2011-2021)? Its drops emit no telemetry, so its hit rate is unknown.
8. On this branch `isHandsFreeMode` is only ever set false and `setHandsFree` is never invoked from OC — is hands-free mode therefore permanently `true` on the engine side until backoff exhaustion, regardless of what the UI mirror shows?

---
*Census only. No source modified. Output: `docs/programme/VOICE-2026/census/04_turn_closure_conversation_state.md`.*
