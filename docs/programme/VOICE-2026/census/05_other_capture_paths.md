# VOICE-2026 / CENSUS-01 — 05 · Other capture / recognition / recording / audio-session paths

**Lane:** VOICE-2026 · CENSUS-01 · **Branch:** `claude/voice-2026-census-01` · **Date:** 2026-09-11
**Scope:** every module in `lib/`, `components/`, `hooks/`, `app/` that can claim the microphone, an `AudioContext`, the iOS audio session, or a recognizer — **excluding** `components/voice/ContinuousConversation.tsx` (covered by census 04). Read-only; no source changed.
**Method:** `rg` over the named patterns (259 hits / 107 files), then a transitive static+dynamic import walk from `app/maia/page.tsx` and from every `app/**/page.tsx|layout.tsx` (script kept in session scratchpad, not committed). Walker edges that turned out to be **type-only or commented imports** are called out and *not* counted as runtime reachability. Everything not cited to a file:line is marked *inference*.

**Entry facts used throughout**
- `/maia` = `app/maia/page.tsx:17` imports `OracleConversation`; renders it at `:831` / `:1528` with `initialShowChatInterface={showChatInterface}`, state default `false` (`app/maia/page.tsx:374`).
- `OracleConversation.tsx:11` imports `ContinuousConversation` (value import); renders it at `:10410` under `{voiceEnabled && (!showChatInterface || (showChatInterface && enableVoiceInput)) && (` (`:10408`). `enableVoiceInput` is `useState(false)` at `:1009` and **`setEnableVoiceInput(` has zero call sites** (rg over `components/`, `app/`). So ContinuousConversation is mounted **iff** `voiceEnabled && !showChatInterface`.
- `ModernTextInput` is rendered once, at `OracleConversation.tsx:10183`, inside the `{showChatInterface ? (` branch opened at `:9913`, with `showVoiceInputButton={voiceEnabled}`. So in chat mode the text input's mic is mounted and ContinuousConversation is **not**; in voice mode the reverse. The two /maia conversational claimants are therefore **mode-exclusive by render**, not by any shared owner (see §4).
- iOS native: `ios/App/App/` on this branch contains `AppDelegate.swift`, `AudioSessionManager.swift`, `HandwritingOCR.swift`, `VoiceController.swift` — **no** `MAIABridgeViewController.swift` (that repair lives on `claude/ios-runtime-01-audiosession-registration`, not here). Pods linked: `CapacitorCommunitySpeechRecognition` (`ios/App/Podfile:16`) and `CapacitorVoiceRecorder` (`ios/App/Podfile:26`).

---

## 1. Inventory

Legend — **Claims:** mic = `getUserMedia`/native recorder/recognizer; AC = `AudioContext`; AS = iOS audio session via a Capacitor plugin; SR = recognizer. **iOS?** / **PWA?** = reachable from `/maia` on that surface. "Dormant" = not reachable from any `app/**/page.tsx|layout.tsx` entry (walker), and imported only by other unreached modules.

### 1a. Reachable from `/maia` (either surface)

| # | Module / file:line | What it claims | Engine | /maia iOS? | /maia PWA? | Other routes | Dormant? | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | `lib/hooks/useVoiceInput.ts:216` (web) · `:595`→`startNativeRecording` (native) | mic + SR (web) · mic + AS (native) | web `SpeechRecognition` (created at mount `:212-216`, started on tap) · native `capacitor-voice-recorder` via `lib/voice/capacitorRecorder.ts` | **YES** (chat mode) | **YES** (chat mode) | 10 routes incl. `/`, `/field/talk`, `/studio/maia`, `/maia/prototype`, `/reflections/[id]`, `/partners/onboarding/prelude` | no | Chain §2.1. Branch by `Capacitor.isNativePlatform()` `:173-177`. Native init at mount calls `canRecordNative()` → `VoiceRecorder.hasAudioRecordingPermission()` (`capacitorRecorder.ts:69`) — a plugin call on every chat-mode mount, not a mic claim. Web cleanup `abort()` at `:450` (inference: in the effect cleanup). Blob → `POST /api/voice/transcribe-simple` `:519-531`. |
| 2 | `lib/voice/capacitorRecorder.ts:115-166` | mic + AS | `VoiceRecorder.startRecording()` `:146` (AVAudioRecorder — inference) **preceded by** `VoiceController.prepareForListening()` `:131` and followed by `VoiceController.stopAllAudio()` `:161`, both gated `isNativeIOS()` `:129,:159` | **YES** (chat mode, via #1) | n/a (returns early; web branch never calls it) | same as #1 | no | The **only** live caller of `prepareForListening` on `/maia` (ContinuousConversation explicitly does not call it — `ContinuousConversation.tsx:3288`). Second, independent native audio-session owner on iOS. |
| 3 | `lib/voice/AudioSessionManager.ts:67-74` (`registerPlugin('AudioSessionManager')`), `VoiceController` singleton `:256` | AS | Capacitor plugin → `AudioSessionManager.swift`; web fallback `AudioSessionManagerWeb.ts` is log-only no-op `:21-47` | **YES** | no-op | 10 routes | no | Callers: `OracleConversation.tsx:2006` `prepareForSpeaking()` (guarded `isCapacitor` `:1997-1998`, TTS path, voice mode) · `capacitorRecorder.ts:131,161` · `lib/audio/ttsWithFallback.ts:44-49` (dormant). Registration with the bridge is **not** established by this branch's `ios/App/App` (see entry facts). |
| 4 | `components/journal/QuickJournalSheet.tsx:347-350` + `:375-377` | mic + **SR in parallel** | `getUserMedia({audio:true})` → `MediaRecorder('audio/webm')` **and** `new SpeechRecognition()` (`continuous=true` `:380`) in the same `startRecording` | **YES (code path)** — see note | **YES** | `/maia` only | no | Chain §2.2. Modal sheet over `/maia` (`MaiaModalManager.tsx:131`, `app/maia/page.tsx:461,644,815,1187,1456`). Voice button `:688` gated only by `activeTab !== 'handwriting'` `:686` — **no Capacitor / native gate on the audio path** (`Capacitor.isNativePlatform()` at `:175` guards OCR only). Opening the sheet does not touch voice: `app/maia/page.tsx` has 0 refs to `pauseMic|stopListening|voiceMicRef`. Audio+transcript → `POST /api/journal/quick/audio` `:468` (no server STT; stores client transcript `route.ts:107-110,239`). Whether WKWebView exposes `getUserMedia` / `webkitSpeechRecognition` is **not determined by source** (guarded `if (SpeechRecognition)` `:377`; `HybridVoiceInput.tsx:105` asserts getUserMedia is absent in WKWebView — a dormant file's comment, unverified). |
| 5 | `lib/voice/androidVoiceFallback.ts:168` `recordAndTranscribe(stream, …)` → `:376` | records a **caller-supplied** stream (no `getUserMedia` in module) | `MediaRecorder` → `apiFetch('/api/voice/transcribe-simple')` `:275` → maia-whisper | not by selection law (`selectVoiceTransport` returns `'native-speech'` when `isNative` `platformDetection.ts:126`) — whether the caller honours that is census 04 | **YES** when transport is `'sovereign-whisper'` (desktop, or no-SR browser `:127-128`) | 9 routes | no | Dynamically imported by ContinuousConversation `:1246,:2803,:3503`. The stream it records comes from census-04's `getUserMedia`; this module adds no second claim. |
| 6 | `lib/utils/platformDetection.ts:209-238` `checkMicrophoneAccess()` | mic **probe** (`getUserMedia` then `track.stop()` `:224-227`) | — | no | no | — | **dormant function** | Zero callers (rg). `getPlatformInfo()` `:252` calls only `hasSpeechRecognitionAPI()` (`:273`); ContinuousConversation calls `getPlatformInfo` `:3372` and `selectVoiceTransport` `:3401`. `canRecordAudioForWhisper()` `:133-139` is feature-detection only. Module reachable; the probe is not. |
| 7 | `components/OracleConversation.tsx:1880` | AC | `new AudioContext()` for TTS amplitude analysis (`startAudioAnalysis`, `:1876`) | YES (voice mode, TTS) | YES | 9 routes | no | Output-side; on iOS an AC participates in WebKit's audio session (inference). |
| 8 | `lib/voice/ios-audio-session.ts:28,52` + keep-alive oscillator `:125-134` | AC (shared) + **standing oscillator** | `getAudioContext()`; `unlockAudioOnUserGesture()` **auto-installed at module load** `:184-187`, whose gesture handler resumes the context `:75-76` and calls `startSessionKeepAlive()` `:89` (gain 0.0001 `:128`, `oscillator.start()` `:133`) | **YES** — on first gesture after load | YES | 9 routes | no | Imported by `OracleConversation.tsx:160` and `StreamingAudioQueue.ts:13`. Load-time side effect: a near-silent oscillator holds an AC `running` for the page lifetime once the member touches anything. No external caller of `startSessionKeepAlive` — the internal `:89` call is the live path. |
| 9 | `lib/voice/voice-feedback-prevention.ts:30` (`getIOSAudioContext`) and `:54,:96,:103,:132` | AC (**its own**, not the shared one) | `new AudioContext()` | YES (if invoked) | YES | 9 routes | module reachable; invocation not traced | Header says delegated to ios-audio-session (`:16,:164-198`) but `getIOSAudioContext` still constructs a separate context `:30`. Default-exported class imported by `ContinuousConversation.tsx:5` and `StreamingAudioQueue.ts:12`. Whether the class calls `getIOSAudioContext` was not read. |
| 10 | `lib/voice/StreamingAudioQueue.ts:494` | AC | `new AudioContext()` if none | YES (voice mode, TTS) | YES | 9 routes | no | Dynamic import `OracleConversation.tsx:5680`, instantiated `:5703`. Output side. |
| 11 | `lib/session/SessionGong.ts:21` via `getSessionGong()` `:159` | AC | `new AudioContext()` lazily | YES | YES | 9 routes | no | Called at `OracleConversation.tsx:7640,:7692,:7772`. Output side. |
| 12 | `lib/voice/AudioSessionManagerWeb.ts:21-47` | nothing (logs) | — | n/a | loaded as web impl of #3 | — | no | No-op fallback. |
| 13 | `lib/voice/micLiveness.ts:162,:201,:267` · `webSpeechLifecycle.ts` · `dispatchProvenance.ts` · `conversationContinuityBuffer.ts` | **none** — pure helpers; hits are comments/types | — | — | — | — | — | Listed so the pattern hits are accounted for. |
| 14 | `lib/capacitor/HandwritingOCR.ts:63` `registerPlugin('HandwritingOCR')` | **camera/OCR only** — 0 audio refs | — | — | — | `/maia` via #4 | no | Not a mic claimant; included because `registerPlugin` was in scope. |

**Walker false positives (type-only / commented imports — NOT runtime-reachable from `/maia`):**
- `lib/voice/synthesis/formantSynthesizer.ts:84`, `lib/voice/integration/maiaVoiceEngine.ts:52` — reached only through `OracleConversation.tsx:165` `import type { Element } from '@/lib/voice'` (`:164` value import is commented). No `getMaiaVoiceEngine(`/`new FormantSynthesizer(` callers outside `lib/voice`.
- `lib/voice/voice-capture.ts:44,53` (`SacredVoiceAnalyzer`, `useVoiceCapture` `:277`) — `OracleConversation.tsx:158` is `import { VoiceState }` (an interface) only; no other importer. Dormant.
- `lib/voice/MaiaRealtimeWebRTC.ts:127,472` — chain went through `OracleConversation.tsx:161`, which is a **commented** import of `useMaiaVoice`. Real importer `components/voice/MaiaWebRTCConversation.tsx:5`, itself imported only by `app/oracle/page.broken.tsx` (not a route). Dormant. Would POST `/api/voice/webrtc-session` `:210` → OpenAI (route header).

### 1b. Reachable from other routes only

| # | Module / file:line | What it claims | Engine | Routes | Notes |
|---|---|---|---|---|---|
| 15 | `hooks/useAudioCapture.ts:141,:154,:172` | mic + AC | `getUserMedia` → `MediaRecorder` → `POST /api/voice/transcribe-simple` `:113` | `/labtools/scribe`, `/caseload/[caseId]/notes/new`, `/studio/sessions`, `/studio/sessions/[sessionId]` | whisper path. |
| 16 | `lib/studio/RecordingContext.tsx:306,:401,:434` | mic + AC(16 kHz) | `getUserMedia` → `MediaRecorder(destination.stream)` → `apiFetch('/api/supervision/transcript/stream')` `:554` | `/studio`, `/studio/session-room` | Server side `app/api/supervision/transcript/stream/route.ts:21,211` → `WHISPER_URL`. |
| 17 | `lib/encounters/recordingCoordinator.ts:93` (`getUserMedia`), `:32` (`MediaRecorder`) | mic | chunks → `/api/open/threshold/[token]/stream…` `:81-172` | `/open/threshold/[token]` | Route inserts `encounter_media_streams` (`stream/route.ts:67`); no STT in route. |
| 18 | `app/first-witness/page.tsx:127-128` | mic | `getUserMedia` → `MediaRecorder` → `/api/first-witness/transcribe` `:141` | `/first-witness` | whisper (`route.ts:14,38`). |
| 19 | `components/maia/MaiaCapture.tsx:41-42` | mic | `getUserMedia` → `MediaRecorder` → `/api/voice/transcribe-simple` `:71` | `/maia/living-field` | whisper. |
| 20 | `app/open/session-room/[roomId]/page.tsx:268` | mic | `getUserMedia({audio:true})` → WebRTC signalling `/api/open/session-room/…/signal` `:123` | `/open/session-room/[roomId]` | peer audio, no STT. |
| 21 | `components/session/SovereignLobby.tsx:157-165` | mic (opt-in device check, `:14`) | `getUserMedia` | `/session/join/[token]` | — |
| 22 | `app/studio/camera/page.tsx:65,:119,:153` | camera(+mic) | `getUserMedia(constraints)` → `MediaRecorder` | `/studio/camera` | no STT endpoint found. |
| 23 | `components/now-what/NowWhatRoom.tsx:659` | SR | web `SpeechRecognition` | `/now-what/room` | — |
| 24 | `components/maia/vision-studio/VisionStudioRoom.tsx:298` | SR | web `SpeechRecognition` | `/maia/vision-studio` | — |
| 25 | `components/dreams/DreamJournalInterface.tsx:98` | SR | web `SpeechRecognition` | `/maia/labtools` | — |
| 26 | `components/consciousness/VoiceConsciousness.tsx:133` | SR | web `webkitSpeechRecognition` | `/dashboard` | — |
| 27 | `lib/consciousness/SoulConsciousnessInterface.ts:100,:430,:432` | mic + AC | `getUserMedia`, `new AudioContext()` | `/maia/soul-consciousness` | — |
| 28 | `lib/voice/providers/IOSNativeVoiceProvider.ts:55-56` (own `registerPlugin('VoiceController')`, `registerPlugin('AudioSessionManager')`), `start()` `:72-81` | AS + native recognizer | `AudioSessionManager.prepareForListening()` `:79` then `VoiceController.start()` `:80` (Swift `VoiceController.swift`) | `/voice-controller-test` (`app/voice-controller-test/page.tsx:26-40`) | Third distinct native-session claimant in the codebase; diagnostic route only. `lib/voice/providers/` holds only this file. |
| 29 | `app/labtools/voice/page.tsx:75` · `app/maia/labtools/components/AdvancedMeditationConsole.tsx:167` · `RealTimeBiometricMeditationConsole.tsx:270` · `lib/audio/sacred-tones.ts:27` | AC (output) | `new AudioContext()` | `/labtools/voice` · `/maia/labtools` · `/labtools/{breathwork,orienting,regulation-minute,coherence,vocal-toning}` | TTS/tones, no mic. |

### 1c. Dormant (no `app/**` page/layout reaches them)

| # | Module / file:line | What it would claim | Engine / destination | Imported by (also unreached) |
|---|---|---|---|---|
| 30 | `components/voice/VoiceMirror.tsx:13` (**second importer of `@capacitor-community/speech-recognition`**), `:163` | native recognizer + web SR | community plugin · web SR | `components/chat/EnhancedMirrorView.tsx:5` |
| 31 | `components/voice/WhisperContinuousConversation.tsx:8` (**second importer of `capacitor-voice-recorder`**), `:433` | native recorder | `VoiceRecorder` → `/api/voice/transcribe-simple` | none |
| 32 | `components/voice/MicInputWithTorus.tsx:65,:78,:85,:200` | mic + AC + MediaRecorder + SR | → `fetch('/api/oracle/voice/transcribe')` `:175` — **route does not exist** (`app/api/oracle/` has `conversation iching memory runes tarot trust`) | `components/voice/OracleVoiceExample.tsx:8` |
| 33 | `lib/voice/streamTranscribe.ts:129,:168,:191` | SR | **`https://api.openai.com/v1/audio/transcriptions`** and **`api.deepgram.com`** — cloud STT, would violate the Sovereignty invariant if ever wired | `lib/voice/micSession.ts:7` (→ `useCollectiveListening.ts:5`) |
| 34 | `lib/voice/MaiaRealtimeClientDirect.ts:213,:224` | mic + AC | `wss://api.openai.com/v1/realtime` `:78` | none |
| 35 | `lib/voice/maiaVoiceSystem.ts:97,:100,:261` | AC + mic + SR | web | `components/voice/MAIAVoiceInterface.tsx:12`, `components/oracle/OracleConversationInterface.tsx:17` |
| 36 | `lib/voice/OptimizedVoiceRecognition.ts:178,:180` | mic + SR | web | `lib/voice/MayaHybridVoiceSystem.ts:9` |
| 37 | `lib/components/WakeWordVoiceInterface.tsx:92,:102,:147,:238,:250` | mic + AC + MediaRecorder | → `/api/voice/transcribe` `:324` | none |
| 38 | `components/chat/HybridInput.tsx:75,:179,:183` · `components/chat/ConversationFlow.tsx:49,:68` · `components/voice/HybridVoiceInput.tsx:119,:123` · `components/voice/EnhancedVoiceControls.tsx:67,:134,:148` · `components/voice/MicrophoneCapture.tsx:53,:62` · `hooks/useVoiceChat.ts:86,:90` | mic / AC / SR / MediaRecorder | web; some → `/api/voice/transcribe-simple` | `components/maya/*`, `components/chat/*`, `components/dreams/MorningDreamCaptureInterface.tsx` — none reached |
| 39 | `lib/capacitor/NativeAudioRecorder.ts:30` `registerPlugin('NativeAudioRecorder')` · `NativeAudioRecorderWeb.ts:22,:33,:43` | native recorder / web MediaRecorder | **no Swift implementation exists** in `ios/App/App/` | only each other |
| 40 | `lib/voice/micSession.ts:34,:43` · `ios-voice-fix.ts:46,:156` · `voiceContemplativeIntegration.ts:30,:184` · `VisualPatternRecognizer.ts:442` · `lib/video/WebRTCManager.ts:118` · `RealtimeVoiceAI.ts:37` · `PersonalizedVoiceService.ts:84` · `maia-voice.ts:82` · `elevenlabs-voice.ts:52` · `lib/audio/{audioUnlock:11,SoulfulSounds:19,StreamingAudioQueue:30,ttsWithFallback:6}` · `lib/maia/sonic-field-layer.ts:227` · `lib/neuropod/psychoactivationEngine.ts:475` · `lib/ritual-layers/ritual-layer-system.ts:154` · `components/voice/{MaiaVoiceUnlock:45,MaiaBubble:70,HybridMicIndicator:76}` · `lib/utils/browserDetection.ts:30` · `lib/voice/utils.ts:31` · `hooks/useIOSDeliveryMode.ts` (comments only) | mixed | — | unreached |
| 41 | `app/api/_backend/src/wake-word/WakeWordActivation.ts:60,:83` · `_backend/src/sesame-tts/SesameTTSIntegration.ts:391` | mic + AC (browser code inside an API folder) | — | `_`-prefixed folder → private, not routed (*inference from Next.js app-router convention*) |

---

## 2. Import chains (runtime-reachable items only)

**2.1 Text-input mic (#1, #2, #3)**
`app/maia/page.tsx:17` → `components/OracleConversation.tsx:75` (`ModernTextInput`) → `components/ui/ModernTextInput.tsx:21` → `lib/hooks/useVoiceInput.ts:30-37` → `lib/voice/capacitorRecorder.ts:6-7` → `capacitor-voice-recorder` + `lib/voice/AudioSessionManager.ts`.
Render gate: `OracleConversation.tsx:9913` `{showChatInterface ? (` … `:10183` `<ModernTextInput … showVoiceInputButton={voiceEnabled}>` (`:10190-10191`). Chat mode is entered by `setShowChatInterface(true)` at `:4160,:4315,:4346,:10313,:10452,:10464`; the "Speak" button leaves it (`:10138`) and calls `voiceSession.methods.startListening('speak_button_gesture')` `:10145`.

**2.2 Quick Journal (#4)**
`app/maia/page.tsx:29` → `components/journal/QuickJournalSheet.tsx` (also `components/maia/MaiaModalManager.tsx:14,:131`). Opened by `setShowJournalSheet(true)` (`page.tsx:644,:815,:1187,:1456`; deep link via `shouldOpenJournalCapture`, `page.tsx:30`).

**2.3 VoiceController on the TTS path (#3)**
`app/maia/page.tsx:17` → `components/OracleConversation.tsx:159` → `lib/voice/AudioSessionManager.ts:67` (`registerPlugin`) → `.web` fallback `AudioSessionManagerWeb.ts`. Call site `OracleConversation.tsx:2006` under `isCapacitor` `:1997`.

**2.4 Audio-session-holding AudioContexts (#7–#11)**
`OracleConversation.tsx:160` → `lib/voice/ios-audio-session.ts` (module-load gesture installer `:184-187`). `OracleConversation.tsx:5680` (dynamic) → `lib/voice/StreamingAudioQueue.ts:12-13` → `voice-feedback-prevention.ts`, `ios-audio-session.ts`. `OracleConversation.tsx:223` → `lib/session/SessionGong.ts`.

**2.5 Whisper fallback (#5)**
`OracleConversation.tsx:11` → `components/voice/ContinuousConversation.tsx:1246/:2803/:3503` (dynamic) → `lib/voice/androidVoiceFallback.ts` → `lib/http/apiBase.apiFetch('/api/voice/transcribe-simple')` `:275`.

**2.6 Platform facts (#6)**
`ContinuousConversation.tsx:3372,:3401` → `lib/utils/platformDetection.ts` (`getPlatformInfo`, `selectVoiceTransport`); `checkMicrophoneAccess` has no caller.

---

## 3. STT routes and services

Whisper service: `docker-compose.production.yml:592-594` service `whisper`, image `fedirz/faster-whisper-server@sha256:…`, `container_name: maia-whisper`; env `WHISPER_LOCAL_URL: "http://whisper:8000"` and `WHISPER_URL: "http://whisper:8000"` (`:142-143`, worker `:448`).

| Route | Server destination | Client callers (reachable) | Client callers (dormant) |
|---|---|---|---|
| `POST /api/voice/transcribe-simple` (`route.ts:20,23`) | `WHISPER_LOCAL_URL` default `http://127.0.0.1:8000` | `lib/hooks/useVoiceInput.ts:519` (/maia chat mode, native + any MediaRecorder path) · `lib/voice/androidVoiceFallback.ts:275` (/maia whisper transport) · `ContinuousConversation.tsx:482,:1228,:3380` (census 04) · `components/maia/MaiaCapture.tsx:71` · `hooks/useAudioCapture.ts:113` | `EnhancedVoiceControls.tsx:169` · `MicrophoneCapture.tsx:98` · `WhisperContinuousConversation.tsx:433` |
| `POST /api/voice/transcribe` (`route.ts:30,39`) | `WHISPER_LOCAL_URL` (cloud STT removed 2026-07-06, `:26-28`) | `hooks/useMemorySystem.ts:227`, `lib/voice/ElementalVoiceOrchestrator.ts:257` (reachability of these two not walked — neither captures audio itself) | `WakeWordVoiceInterface.tsx:324` |
| `POST /api/caseload/transcribe` (`route.ts:15,53`) | `WHISPER_LOCAL_URL` | via `hooks/useAudioCapture` surfaces (`/caseload/[caseId]/notes/new`) | — |
| `POST /api/first-witness/transcribe` (`route.ts:14,38`) | `WHISPER_LOCAL_URL` | `app/first-witness/page.tsx:141` | — |
| `POST /api/studio/sessions/[sessionId]/voice-notes` (`route.ts:25,258`) | `WHISPER_LOCAL_URL` | `components/studio/VoiceNotePanel.tsx:10` (doc comment) | — |
| `POST /api/supervision/transcript/stream` (`route.ts:21,211`) | `WHISPER_URL` `/v1/audio/transcriptions` | `lib/studio/RecordingContext.tsx:554` | — |
| `POST /api/journal/quick/audio` (`route.ts:36`) | **no STT** — stores audio + client-provided `transcriptSource/Confidence` `:107-110,:239` | `QuickJournalSheet.tsx:468` | — |
| `POST /api/media/projects/[projectId]/transcribe` (`route.ts:9,21`) | enqueues jobs; worker `lib/media/processors.ts:20,288` → `WHISPER_LOCAL_URL || http://faster-whisper:8000` | media projects | — |
| `POST /api/open/threshold/[token]/stream` (`route.ts:67`) | stores `encounter_media_streams`; no STT | `lib/encounters/recordingCoordinator.ts:81-172` | — |
| `GET /api/voice/health` (`route.ts:7`) | `http://maia-whisper:9000/health` — **port 9000, whereas the service is published at 8000** (`compose:142`) | health only | — |
| `GET /api/health/local-voice` (`route.ts:20-25`) | `${WHISPER_LOCAL_URL}/health` | health only | — |
| `/api/voice/webrtc-session` (header: "creates session with OpenAI") | OpenAI Realtime | — | `MaiaRealtimeWebRTC.ts:210` (dormant) |
| `/api/voice/stream-conversation` | TTS/turn route, not STT (retired per `OracleConversation.tsx:7354-7358` comment) | — | — |

Cloud STT still present in dormant source: `lib/voice/streamTranscribe.ts:129` (OpenAI), `:168` (Deepgram); `lib/voice/MaiaRealtimeClientDirect.ts:78` (OpenAI Realtime WS).

---

## 4. Authority findings

**A. Independent mic/recognizer claimants in the codebase (excluding census 04):** 25 distinct claim sites that call `getUserMedia`, a native recorder, or `new SpeechRecognition()` — #1/#2 (one path, two engines), #4, #15–#28 (14), #30–#38 (9 dormant families counted as one each), #39. Plus 5 distinct native-plugin handles: `AudioSessionManager` (registered twice — `AudioSessionManager.ts:67` and `IOSNativeVoiceProvider.ts:56`), `VoiceController` (`IOSNativeVoiceProvider.ts:55`), `SpeechRecognition` community plugin (ContinuousConversation + `VoiceMirror.tsx:13`), `capacitor-voice-recorder` (`capacitorRecorder.ts:6` + `WhisperContinuousConversation.tsx:8`), `NativeAudioRecorder` (no Swift).

**B. Reachable on `/maia` iOS (native shell):**
1. ContinuousConversation's community recognizer (census 04) — voice mode.
2. `useVoiceInput` → `capacitorRecorder` → **`capacitor-voice-recorder` + `VoiceController.prepareForListening/stopAllAudio`** — chat mode (§2.1). **A second native audio-session owner, with a different plugin, and the only live caller of `prepareForListening`.**
3. `QuickJournalSheet` `getUserMedia` + `MediaRecorder` + web `SpeechRecognition` — any mode, modal (§2.2), *if* WKWebView grants them (open question Q1).
4. `VoiceController.prepareForSpeaking` on TTS (`OracleConversation.tsx:2006`) — voice mode.
5. Standing WebKit AudioContexts: `ios-audio-session` shared context + keep-alive oscillator on first gesture (#8), `OracleConversation:1880` analyser (#7), `StreamingAudioQueue:494` (#10), `SessionGong:21` (#11), and `voice-feedback-prevention:30` if invoked (#9).

**C. Reachable on `/maia` PWA:** same list with #2 replaced by `useVoiceInput`'s web `SpeechRecognition` (`:216`), and #5 `androidVoiceFallback` when `selectVoiceTransport` yields `'sovereign-whisper'` (`platformDetection.ts:125-130`). No native plugin is live (web fallbacks are no-ops).

**D. Can two be alive at once on `/maia` iOS?**
- *Voice mode ⇄ chat mode:* mutually exclusive **by render** (`:10408` vs `:9913`), not by a shared owner. Nothing in source hands the audio session from the community recognizer to `capacitor-voice-recorder` or back; the hand-off is whatever unmount/cleanup each side does (census 04 for the recognizer; `useVoiceInput.ts:450` abort for the web branch, native stop at `:676-683` — inference that these run on unmount). **Sequential overlap on mode switch is possible in principle; not ruled out by source.**
- *Quick Journal over voice mode:* **YES, concurrently.** The sheet is a modal (`MaiaModalManager.tsx:131`) rendered while ContinuousConversation remains mounted; `app/maia/page.tsx` never pauses or stops voice on open (0 refs). If WKWebView honours `getUserMedia`, `QuickJournalSheet.tsx:347` claims the mic while the native recognizer holds it.
- *AudioContexts:* always concurrent with capture; on iOS every one of #7–#11 is a WebKit content-process audio-session participant alongside the app-process plugins (inference; the mechanism is H-SILENT's subject in the CLAUDE.md lane note).
- *`AudioSessionManager` double registration:* `AudioSessionManager.ts:67` and `IOSNativeVoiceProvider.ts:56` each call `registerPlugin('AudioSessionManager')` — two JS proxies for one native class, but only the former is on `/maia`.

**E. Nothing in the codebase is a single owner.** No module exports a lock that both the recognizer path and the recorder path acquire; `lib/services/VoiceLock` is re-exported at `lib/voice/index.ts:59` but that barrel is imported type-only on `/maia` (`OracleConversation.tsx:165`), and no `voiceLock` caller was found among the claimants above.

---

## 5. Open questions

- **Q1 — WKWebView and `QuickJournalSheet`:** does the Capacitor WKWebView on the shipped iOS target expose `navigator.mediaDevices.getUserMedia` and `webkitSpeechRecognition`? Source does not decide it (guard at `QuickJournalSheet.tsx:377`; stale contrary claim at `HybridVoiceInput.tsx:105`). If yes, #4 is a live concurrent mic claimant on `/maia` iOS; if no, the sheet's voice button fails silently on native.
- **Q2 — Mode-switch hand-off:** what exactly runs when `ModernTextInput` unmounts mid-recording (`useVoiceInput.ts:450,:676-683`) and when ContinuousConversation unmounts on entering chat mode (census 04)? Is there a window where `capacitor-voice-recorder` starts before the community recognizer's native task ends?
- **Q3 — `prepareForListening` asymmetry:** on `/maia` iOS the gatekeeper's `prepareForListening` is called only by the chat-mode recorder (`capacitorRecorder.ts:131`) and never by the voice-mode recognizer (`ContinuousConversation.tsx:3288`). Is that asymmetry intended once the plugin is actually registered?
- **Q4 — `ios-audio-session` keep-alive:** the load-time gesture installer (`:184-187`) starts a permanent oscillator (`:125-134`). Is a permanently `running` WebKit AudioContext desired on iOS while the native recognizer is active? (Relevant to H-SILENT / the interruption trace; not decidable from source.)
- **Q5 — `voice-feedback-prevention.ts:30`:** does the `VoiceFeedbackPrevention` class actually construct its own AudioContext at runtime on `/maia`, making a fourth WebKit context, or is that path unreached? Not read.
- **Q6 — `/api/voice/health` port:** probes `maia-whisper:9000` (`route.ts:7`) while the service listens on 8000 (`compose:142`). Is this health route used by anything that matters?
- **Q7 — Dormant cloud STT:** `streamTranscribe.ts` (OpenAI, Deepgram) and `MaiaRealtimeClientDirect.ts` (OpenAI Realtime) remain in tree, unreached. Deletion is a separate ruling; noted here only so the census is complete.
- **Q8 — `ElementalVoiceOrchestrator` / `useMemorySystem` callers of `/api/voice/transcribe`:** reachability not walked (they do not capture audio themselves); whether they can be triggered from `/maia` is unknown.
