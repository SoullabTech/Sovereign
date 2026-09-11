# VOICE-2026 · SURVEY-01 — Contemporary Voice Architecture for a Persistent Conversational Audio Runtime

**Lane:** VOICE-2026 · **Document type:** research survey (read-only; no repo source touched)
**Date of survey:** 2026-09-11
**Question served:** *How would MAIA's voice be built today as a persistent conversational audio runtime* — under an iOS Capacitor/WKWebView shell around a Next.js UI, with Claude as the mind and STT/TTS constrained to on-device or self-hosted (never OpenAI or other cloud AI providers). This is **not** a repair plan for the current code.

## Method

- **Instrument:** the `WebSearch` tool only. No page was fetched in full; no `WebFetch`, `curl`, or repository clone was used. Every finding below is a paraphrase of a search-result snippet or result title actually seen on 2026-09-11. Where a snippet came from a secondary blog rather than a primary source (Apple docs, WebKit bug tracker, project repo), it is labelled **(secondary)**.
- **Verification discipline:** a claim that could not be grounded in a seen result is marked **UNVERIFIED**. No URL is invented; every URL in a "Sources" list appeared in a result set.
- **Scope discipline:** cloud realtime stacks (OpenAI Realtime, Gemini Live) appear **only as reference architectures** for the separation of concerns they exhibit; they are out of bounds as components under the project's sovereignty invariants.
- **What this is not:** not a recommendation document. "Fit/misfit" notes are limited to whether an option satisfies the sovereignty constraint and where it would run.

---

## 1. iOS `AVAudioSession` for two-way voice

### Findings

- **Category `.playAndRecord`** supports simultaneous input and output, is **not silenced by the Ring/Silent switch or by screen lock**, and by default interrupts non-mixable audio of other apps. `.soloAmbient` (the platform default) and `.ambient` **are** silenced by the switch and by locking. Sources: audioplayers Dart API mirror of Apple category docs (secondary); Apple forum thread 703799. [S1-1, S1-2]
- **`.defaultToSpeaker`** routes output to the built-in speaker when no other output is connected and is **valid only with `.playAndRecord`**. [S1-3, S1-4]
- **`.allowBluetoothHFP`** (formerly `.allowBluetooth`) makes a paired HFP device available as an **input** route while output follows the category's rules; for `.playAndRecord` it defaults to false. When both HFP and A2DP options are set and the device supports both (e.g. AirPods), Core Audio **prefers the HFP route**. Sources: Apple doc page `allowBluetoothHFP`; Apple forum 4340/5787. [S1-5, S7-1, S7-2]
- **`.voiceChat` mode** is documented as the mode for two-way voice communication (VoIP); it enables automatic gain correction, voice-optimised EQ, and lets the Voice-Processing I/O unit mix so the voice is the loudest element. A Voice-Processing I/O unit used without an explicit chat mode implicitly uses `voiceChat`. Sources: Apple `voiceChat` mode page; Vivox docs (secondary). [S1-6, S1-7]
- **Silent switch:** `playAndRecord`/`playback` ignore the switch; only `ambient`/`soloAmbient` honour it. For **WKWebView content**, the behaviour is separately governed (see §4): Safari/WebKit on iOS allows HTML5 `<audio>` to play with the mute switch on but historically **not Web Audio**, and WKWebView content has been observed to follow the switch since ~iOS 11 regardless of the app's category. [S1-2, S4-9, S4-10]
- **`setActive` semantics:** deactivating with running I/O fails with `OSStatus 560030580` ("session deactivation failed"); all I/O must be stopped/paused before `setActive(false)`. `.notifyOthersOnDeactivation` signals other apps that they may resume. Random `561015905` activation errors and `-50` are reported in edge contexts (extensions, backgrounded apps). Sources: Apple docs `setActive:error:` / `notifyOthersOnDeactivation`; forum threads 134082, 679094, 709107; speech_to_text issue 241. [S1-8, S1-9, S1-10, S1-11, S1-12]
- **Interruption notification** (`AVAudioSession.interruptionNotification`): `userInfo` carries the type (`began`/`ended`) and, on `ended`, the `.shouldResume` hint that media apps are told to check before resuming. An `InterruptionReason.routeDisconnected` exists (interruption caused by a route going away). A reported defect: the notification is sometimes **delivered only once** (Apple forum 756311, not resolved in the seen snippet). Sources: Apple archive guide "Responding to Interruptions"; `shouldResume` doc page; `routeDisconnected` doc page; forum 756311. [S1-13, S1-14, S1-15, S1-16]
- **Route-change notification** carries `AVAudioSessionRouteChangeReasonKey` and `AVAudioSessionRouteChangePreviousRouteKey`; reasons include `newDeviceAvailable`, `oldDeviceUnavailable`, `categoryChange`, `override`, `wakeFromSleep`. Guidance: pause on `oldDeviceUnavailable`, do **not** pause on `override`. A route change is also posted when the category itself changes (e.g. adding input). Sources: Apple archive "Responding to Route Changes"; `RouteChangeReason` doc pages; Zenn notes (secondary). [S1-17, S1-18, S1-19, S1-20]
- **Media services reset** (`mediaServicesWereResetNotification`): rare daemon restart; the app must dispose orphaned audio objects, re-create engines/players/recorders and **re-apply category, mode and options** from scratch. Sources: Apple archive guide; Zenn notes. [S1-13, S1-20]
- **Background:** `UIBackgroundModes: audio` is required for audio to continue when the app is not foregrounded; the default `soloAmbient` is silenced on lock, so a non-default category is required. Apple's archived guidance says apps will **not in general be allowed to *start* recording while in the background** (privacy). A forum thread reports `setActive(true)` failing after a phone call while backgrounded. Sources: Apple "Audio Guidelines By App Type"; forum 120038, 813278, 713084. [S1-21, S1-22, S1-23, S1-24]
- **Permissions (iOS 17+):** `AVAudioApplication.requestRecordPermission` supersedes `AVAudioSession.requestRecordPermission`. `secondaryAudioShouldBeSilencedHint` and `isOtherAudioPlaying` remain available as hints. [S1-25, S1-26]

### Implications for a persistent runtime under a WKWebView UI

- The category/mode pair that a two-way voice runtime needs (`.playAndRecord` + `.voiceChat`) is precisely the pair that ignores the silent switch and survives lock — so "silence" of MAIA is never explained by the switch **if** the native session owns the graph; it may be explained by the switch **if** the audible path is WKWebView Web Audio (§4). These are two different sessions.
- `setActive(false)` while any engine, recognizer tap, or WebKit capture is still running is an error, not a no-op — so a "teardown → category → activate" gatekeeper must serialise against every other I/O owner, including WebKit's, which the app process cannot stop directly.
- Interruption/route/media-reset handling is a **state machine** (interrupted · route-lost · reset-pending) that must reach every audio owner; a WKWebView content process has its own view of interruption (§4) and does not receive the app's handler decisions.

### Sources

- [S1-1] https://pub.dev/documentation/audioplayers/latest/audioplayers/AVAudioSessionCategory.html (seen 2026-09-11, secondary)
- [S1-2] https://developer.apple.com/forums/thread/703799
- [S1-3] https://pub.dev/documentation/audioplayers/latest/audioplayers/AVAudioSessionOptions.html (secondary)
- [S1-4] https://spin.atomicobject.com/bluetooth-audio-sessions-swift/ (secondary)
- [S1-5] https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/allowbluetoothhfp
- [S1-6] https://developer.apple.com/documentation/avfaudio/avaudiosession/mode-swift.struct/voicechat
- [S1-7] https://docs.vivox.com/v5/general/core/5_21_0/en-us/Core/developer-guide/ios/avaudiosessionmodevoicechat.htm (secondary)
- [S1-8] https://developer.apple.com/documentation/avfaudio/avaudiosession/setactive:error:
- [S1-9] https://developer.apple.com/documentation/AVFAudio/AVAudioSession/SetActiveOptions/notifyOthersOnDeactivation
- [S1-10] https://github.com/csdcorp/speech_to_text/issues/241
- [S1-11] https://developer.apple.com/forums/thread/134082
- [S1-12] https://developer.apple.com/forums/thread/679094
- [S1-13] https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/HandlingAudioInterruptions/HandlingAudioInterruptions.html
- [S1-14] https://developer.apple.com/documentation/avfaudio/avaudiosession/interruptionoptions/shouldresume
- [S1-15] https://developer.apple.com/documentation/avfaudio/avaudiosession/interruptionreason/routedisconnected?language=objc
- [S1-16] https://developer.apple.com/forums/thread/756311
- [S1-17] https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/HandlingAudioHardwareRouteChanges/HandlingAudioHardwareRouteChanges.html
- [S1-18] https://developer.apple.com/documentation/avfaudio/avaudiosession/routechangereason
- [S1-19] https://medium.com/@mehsamadi/managing-audio-interruption-and-route-change-in-ios-application-8202801fd72f (secondary)
- [S1-20] https://zenn.dev/nobu_y/articles/d3165cbd667918?locale=en (secondary)
- [S1-21] https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioGuidelinesByAppType/AudioGuidelinesByAppType.html
- [S1-22] https://developer.apple.com/forums/thread/120038
- [S1-23] https://developer.apple.com/forums/thread/813278
- [S1-24] https://developer.apple.com/forums/thread/713084
- [S1-25] https://developer.apple.com/documentation/avfaudio/avaudioapplication/requestrecordpermission(completionhandler:)
- [S1-26] https://developer.apple.com/documentation/avfaudio/avaudiosession/secondaryaudioshouldbesilencedhint

---

## 2. Voice-processing I/O (`AVAudioEngine`, Voice I/O unit)

### Findings

- `AVAudioIONode.setVoiceProcessingEnabled(_:)` turns on Apple's voice processing (echo cancellation + AGC on the mic input). It **requires both input and output nodes to be in voice-processing mode** — enabling on one switches both — and **cannot be enabled while the engine is running** (engine must be stopped). Sources: WWDC19 session 510 transcript (ASCIIwwdc); Apple doc page. [S2-1, S2-2]
- Known behaviours reported by practitioners: (a) after enabling VP and calling `start()`, the engine may **not** be running because it detected its configuration changed and stopped itself; (b) **only mono output** is supported in VP mode; (c) attach the playback graph **before** enabling VP. Sources: snakamura "Tips about AVAudioEngine"; Switchboard docs (secondary). [S2-3, S2-4]
- **Format changes on enable:** enabling VP has been reported to change the input node format from 1 ch/48 kHz to **5 ch/44.1 kHz** on some devices (forum 771530). Observed hardware rates: **48 kHz through the speaker, 24 kHz when AirPods are connected**, regardless of preferred rate. [S2-5, S2-6]
- **Echo cancellation is not perfect subtraction:** a 2026 field report on iOS voice agents finds VPIO's behaviour closer to subtraction than cancellation, with a residual tail, and recommends a **post-playback mic gate of 500–800 ms rather than 300 ms**. (secondary, single source) [S2-7]
- **Ducking:** with VP enabled, other audio (including the app's own non-voice playback) is ducked; historically an `AVAudioPlayer` played at reduced volume after VPIO initialisation (forum 22133). iOS 17 adds `AVAudioInputNode.voiceProcessingOtherAudioDuckingConfiguration` (`enableAdvancedDucking`, `duckingLevel`) and the Audio Unit equivalent `AUVoiceIOOtherAudioDuckingConfiguration`. [S2-8, S2-9, S2-10, S2-11]
- **Simultaneous STT + playback:** an input tap installed on a VP-enabled input node receives audio with playback already subtracted (forum 742683 / blog), which is the mechanism that makes "listen while MAIA speaks" possible natively. A conflicting practitioner report: `AVSpeechSynthesizer` would not speak while an `SFSpeechRecognizer` task or `AVAudioEngine` was running (Medium, secondary). [S2-12, S2-13]
- **Configuration-change coupling:** `AVAudioEngineConfigurationChange` fires on hardware changes (e.g. external mic); the engine is stopped by Core Audio; the app must rewire connections and restart, and **must not deallocate the engine inside the notification handler**. Practitioners report that after route changes the input node can keep the **old format**, that reconnecting the input node with a new format can fail with `kAudioUnitErr_CannotDoInCurrentContext`, and that discarding and rebuilding the engine is the only reliable recovery. [S2-14, S2-15, S2-16]

### Implications

- A native voice runtime that owns the engine can run full-duplex (tap on VP input while a player node renders TTS) — but it must own **both** ends; a TTS rendered by WKWebView's Web Audio is outside the VP unit's reference signal, so the native AEC cannot subtract it (inference from [S2-1]/[S2-12] and §4; **UNVERIFIED as a direct statement in any seen source**).
- Any component that installs its own tap and its own category (e.g. a speech-recognition plugin) is a second engine owner; VP mode being global per I/O unit means two engines are two configurations fighting.
- Format is not stable across routes (48 k ↔ 24 k ↔ VP-altered layouts); every downstream consumer (VAD, STT) needs a converter stage, not an assumed 16 kHz.

### Sources

- [S2-1] https://asciiwwdc.com/2019/sessions/510
- [S2-2] https://developer.apple.com/documentation/avfaudio/avaudioionode/setvoiceprocessingenabled(_:)?changes=_8%2C_8
- [S2-3] https://snakamura.github.io/log/2024/11/audio_engine.html (secondary)
- [S2-4] https://docs.switchboard.audio/audio-engine/ios/ (secondary)
- [S2-5] https://developer.apple.com/forums/thread/771530
- [S2-6] https://developer.apple.com/forums/thread/770285
- [S2-7] https://barock.dev/2026/04/22/why-your-ios-voice-agent-still-hears-itself (secondary)
- [S2-8] https://developer.apple.com/forums/thread/22133
- [S2-9] https://developer.apple.com/documentation/avfaudio/avaudioinputnode/voiceprocessingotheraudioduckingconfiguration?language=objc
- [S2-10] https://developer.apple.com/documentation/avfaudio/avaudiovoiceprocessingotheraudioduckingconfiguration/enableadvancedducking
- [S2-11] https://developer.apple.com/documentation/audiotoolbox/auvoiceiootheraudioduckingconfiguration?language=objc
- [S2-12] https://developer.apple.com/forums/thread/742683
- [S2-13] https://medium.com/@molvOps/speech-to-text-conversion-in-ios-using-speech-framework-2d82aaf6e35d (secondary)
- [S2-14] https://developer.apple.com/documentation/avfaudio/avaudioengineconfigurationchangenotification
- [S2-15] https://developer.apple.com/forums/thread/772380
- [S2-16] https://developer.apple.com/forums/thread/730600
- Also seen: https://developer.apple.com/documentation/avfoundation/audio_track_engineering/using_voice_processing ; https://community.openai.com/t/audio-notes-for-openai-realtime-on-apple-platforms/1108404 (reference only)

---

## 3. Apple speech APIs: `SpeechAnalyzer`/`SpeechTranscriber` (iOS 26) vs `SFSpeechRecognizer`; what the Capacitor community plugin owns

### Findings — `SFSpeechRecognizer` (legacy)

- Server-backed requests are limited to **one minute of audio per request** and ~1,000 requests/device/hour; **on-device recognition removes the one-minute limit** but requires `supportsOnDeviceRecognition == true` for the locale and a downloaded model; `requiresOnDeviceRecognition` is honoured only then. On-device accuracy is described as lower than server. No custom vocabulary training, no wake word, no standalone VAD. Sources: Picovoice 2026 guide (secondary); Apple `supportsOnDeviceRecognition` doc; Andy Ibanez (secondary). [S3-1, S3-2, S3-3]
- The list of on-device locales is **not published as a definitive list**; it depends on device and iOS version and mirrors keyboard dictation locales; `supportedLocales()` is the runtime query. [S3-4, S3-2]
- Practitioner reports of `installTap` **ceasing to deliver after a phone-call interruption** on iPhone 16e (forum 805735) and of restart difficulty (forum 770285). [S3-5, S2-6]

### Findings — `SpeechAnalyzer` (iOS 26 / macOS 26)

- Architecture: `SpeechAnalyzer` is an **actor-based coordinator**, not a transcriber; modules attach to it — `SpeechTranscriber` (long-form), `DictationTranscriber` (short utterances) and **`SpeechDetector` (voice activity)**. Input is an `AsyncSequence<AnalyzerInput>` (commonly `AsyncStream<AnalyzerInput>.makeStream()`); results are consumed as an `AsyncSequence` on the transcriber — **input, analysis and results are separate objects**. Sources: WWDC25 session 277 page; Anton Gubarenko guide; Create with Swift; dev.to (secondary). [S3-6, S3-7, S3-8, S3-9]
- **Volatile vs final:** `reportingOptions: [.volatileResults]` yields fast partials marked non-final; `isFinal` marks committed text; guidance is to render volatile text dimmed and persist only finals. Presets seen: `.progressiveLiveTranscription`, `.offlineTranscription`. Results carry per-token timing and confidence. [S3-7, S3-8, S3-10]
- **On-device only, no server path.** Language assets are managed by `AssetInventory` (must be downloaded when a supported language is not installed). Launch languages reported: Cantonese, Chinese, English, French, German, Italian, Japanese, Korean, Portuguese, Spanish (secondary count). Limits reported: no custom vocabulary hints, single language per session, closed model (cannot be benchmarked against a chosen Whisper variant or fine-tuned). [S3-10, S3-11, S3-12]
- Live-mic pitfalls documented by practitioners ("things the docs don't tell you"): format conversion to the analyzer's `bestAvailableAudioFormat`, stream lifecycle, and the need to finalize explicitly — details **not read in full; UNVERIFIED beyond the titles/snippets seen**. [S3-13]

### Findings — `@capacitor-community/speech-recognition`

- The plugin's iOS side uses **`SFSpeechRecognizer` by default on all iOS versions**; a Capgo fork notes the legacy path is the default and the fallback below iOS 26 (implying an optional `SpeechAnalyzer` path in that fork — **UNVERIFIED for the community plugin itself**). `partialResults: true` makes `start()` return immediately and emit `partialResults` events until stopped. Required `Info.plist` keys: `NSSpeechRecognitionUsageDescription`, `NSMicrophoneUsageDescription`. Sources: npm page; GitHub repo; Cap-go fork; capacitor-tutorial (secondary). [S3-14, S3-15, S3-16, S3-17]
- What the plugin therefore **owns** (per the standard pattern the results describe: `AVAudioEngine.inputNode.installTap` + `setCategory` on the shared session + an `SFSpeechAudioBufferRecognitionRequest`): its own `AVAudioEngine` instance, its own input tap, its own audio-session category/mode call, and the recognition-task lifecycle — i.e. **a second, independent owner of the app's audio session**, not a module inside an app-owned engine. The exact category/mode/options the community plugin sets were **not seen in a result and remain UNVERIFIED** (the `.record/.measurement/.duckOthers` snippet seen is from a generic Swift tutorial, not the plugin). [S3-17, S3-18]
- Event delivery from the plugin to JS goes through Capacitor's `notifyListeners` (see §4 for ordering/threading).

### Implications

- The iOS 26 API's shape (`SpeechDetector` + `SpeechTranscriber` on one analyzer fed by one `AsyncStream`) is already the "capture → VAD → STT" separation that §6 describes for server stacks; the legacy `SFSpeechRecognizer` bundles capture ownership with recognition.
- A plugin that owns capture cannot be a *module* of a persistent runtime; it can only be one *turn-scoped* client of it. Any design that keeps the community plugin keeps a second session owner by construction.
- A minimum-version decision (iOS 26+) is a capability decision, not a polish decision: it decides whether native VAD and unlimited on-device transcription exist at all.

### Sources

- [S3-1] https://picovoice.ai/blog/ios-speech-recognition/ (secondary)
- [S3-2] https://developer.apple.com/documentation/Speech/SFSpeechRecognizer/supportsOnDeviceRecognition
- [S3-3] https://www.andyibanez.com/posts/speech-recognition-sfspeechrecognizer/ (secondary)
- [S3-4] https://medium.com/@toru_furuya/available-languages-in-on-device-speech-recognition-on-ios-in-2022-8c6383fac9f2 (secondary)
- [S3-5] https://developer.apple.com/forums/thread/805735
- [S3-6] https://developer.apple.com/videos/play/wwdc2025/277/
- [S3-7] https://antongubarenko.substack.com/p/ios-26-speechanalyzer-guide (secondary)
- [S3-8] https://www.createwithswift.com/implementing-advanced-speech-to-text-in-your-swiftui-app/ (secondary)
- [S3-9] https://dev.to/arshtechpro/wwdc-2025-the-next-evolution-of-speech-to-text-using-speechanalyzer-6lo (secondary)
- [S3-10] https://www.callstack.com/blog/on-device-speech-transcription-with-apple-speechanalyzer (secondary)
- [S3-11] https://blog.addpipe.com/apple-speechanalyzer-api/ (secondary)
- [S3-12] https://vocai.net/blog/whisperkit-vs-speechanalyzer-2026/ (secondary)
- [S3-13] https://dev.to/simple_memo/ios-26s-speechanalyzer-on-a-live-mic-the-5-things-the-docs-dont-tell-you-2ng5 ; https://simplememofast.com/en/blog/ios26-speechanalyzer-live-mic (secondary)
- [S3-14] https://www.npmjs.com/package/@capacitor-community/speech-recognition/v/5.0.0-0
- [S3-15] https://github.com/capacitor-community/speech-recognition
- [S3-16] https://github.com/Cap-go/capacitor-speech-recognition
- [S3-17] https://capacitor-tutorial.com/plugins/speech-recognition/ (secondary)
- [S3-18] https://techotopia.com/index.php?mobileaction=toggle_view_mobile&title=An_iOS_10_Real-Time%2FLive_Speech_Recognition_Tutorial (secondary, generic pattern only)
- Also seen: https://blakecrosley.com/blog/speech-framework-vs-sfspeechrecognizer ; https://www.forasoft.com/blog/article/speech-recognition-with-neural-networks-on-ios-1621

---

## 4. WKWebView / Capacitor boundary

### Findings — capture in WKWebView

- `navigator.mediaDevices.getUserMedia` is exposed to WKWebView from **iOS 14.3**, automatically when the embedding app can capture natively (i.e. has the usage-description keys); access is gated by a WebKit prompt similar to Safari's. Practitioners report the prompt re-appearing on each `getUserMedia` call and cases of **no prompt** appearing (forum 734363). Sources: WebKit blog "MediaRecorder API"; forum 134216, 734363; Home Assistant iOS issue 1319. [S4-1, S4-2, S4-3, S4-4]
- `WKWebView.microphoneCaptureState` / `setMicrophoneCaptureState(_:completionHandler:)` (and the camera equivalents) are public API (promoted from SPI ~iOS 15). Reported behaviour: **capture becomes muted shortly after the app enters the background, and `setMicrophoneCaptureState(.active)` does not restore it while backgrounded** (forum 689182). [S4-5, S4-6, S4-7]
- WebKit's `getUserMedia` `echoCancellation` constraint historically had **no effect** (WebKit bug 179411, status not seen); WebRTC AEC needs a training period and a common workaround is to delay transmitting mic audio for a few seconds after `getUserMedia`. [S4-8, S4-9]

### Findings — WebKit's audio session vs the app's `AVAudioSession`

- WebKit manages **its own audio session** for web content. Long-standing reports: WKWebView **ignores the app's `AVAudioSession` category** (WebKit bug 167788; Apple forums 24464, 71889, 85256) — `mixWithOthers` set by the app does not apply to WKWebView media; WebRTC in the web view ducks other web-view media. [S4-10, S4-11, S4-12, S4-13]
- WebKit source `AudioSessionIOS.mm` contains logic that **prevents WebKit from setting `.playAndRecord` itself** because that can trigger TCC prompts (snippet seen; exact conditions not read). [S4-14]
- Since WebKit moved media to the **GPU process**, there are **two `AudioSession` objects — one in the Web process (`RemoteAudioSession`) and one in the GPU process**. `AVAudioSessionInterruptionNotification` is observed in the GPU process; interruption state is stored there and mirrored to the Web process. A WebKit fix (PR 13330 / changesets 268893, 269039) addressed a bug where the GPU-process session was **not told an interruption had ended**, so subsequent interruption notifications were **ignored because "the session is already interrupted"**, and web playback ended up interrupting other apps' audio. This is the documented origin of the *"already interrupted"* family of symptoms. [S4-15, S4-16, S4-17]
- Web Audio specifics: `AudioContext` can enter an **"interrupted"** state on iOS (phone call, lock, backgrounding) from which `resume()` has been reported not to work (WebKit bugs 143190, 237878, 263627, 273511; forum 658375, 121822); WebKit added a check for an interrupted MediaSession before asynchronously flipping `AudioContext` back to "running". The W3C TAG review #1069 concerns standardising the "interrupted" state. [S4-18, S4-19, S4-20, S4-21, S4-22, S4-23]
- Autoplay: `mediaTypesRequiringUserActionForPlayback = []` and `allowsInlineMediaPlayback = true` are the WKWebViewConfiguration switches to allow programmatic playback; iOS 26 behaviour changes for this configuration are under discussion (forum 803344, content not read). Web Audio still needs `AudioContext.resume()` inside a user gesture on some iOS versions (regression reports around iOS 16.3). [S4-24, S4-25, S4-26]
- Silent switch for web content: Safari allows HTML5 audio with the mute switch on but historically not Web Audio (the `unmute-ios-audio` library exists to work around this); WKWebView content has been reported to follow the mute switch since ~iOS 11. [S4-27, S4-28]
- Background: audio from WKWebView (HTML5 and Web Audio) stops when the app is backgrounded on iOS 13+ even with the audio background mode (forum 121822); the microphone is muted on background (above). [S4-21, S4-6]

### Findings — Capacitor Swift → JS events

- `notifyListeners(_:data:retainUntilConsumed:)` delivers plugin events; `retainUntilConsumed: true` holds the event until a JS listener exists (iOS/Android only). Delivery is by `evaluateJavaScript` dispatched on the **main thread** (`DispatchQueue.main.async`). Known issues: `eventListeners` is mutated on the bridge's dispatch queue but read from `notifyListeners` **without a lock** (issue 8157, data race); an older bug where retained events failed after listeners were added and removed (issue 2094); `notifyListeners` only working for the first call in some cases (issue 2404). **No ordering guarantee between events emitted from different threads is documented in any result seen** — ordering is whatever the main-queue hops produce (UNVERIFIED beyond the race report). [S4-29, S4-30, S4-31, S4-32, S4-33, S4-34]

### Implications

- Under a WKWebView UI there are **at minimum three audio-session actors**: the app process (`AVAudioSession.sharedInstance()`), WebKit's Web-process/GPU-process session pair, and any native plugin engine. The app's `setActive`/category calls do not configure WebKit's session, and WebKit's interruption bookkeeping has a documented failure mode of getting stuck "already interrupted".
- Web Audio as the *rendering* path for MAIA's voice inherits: mute-switch sensitivity, `AudioContext` interruption semantics with unreliable `resume()`, background stop, and invisibility to the native VP unit's echo reference. Native rendering inherits none of these but requires the runtime to be native.
- Plugin events are a best-effort, main-thread-serialised stream without documented cross-source ordering; a runtime state machine driven by them needs sequence numbers or a single native emitter to be deterministic.

### Sources

- [S4-1] https://webkit.org/blog/11353/mediarecorder-api/
- [S4-2] https://developer.apple.com/forums/thread/134216
- [S4-3] https://developer.apple.com/forums/thread/734363
- [S4-4] https://github.com/home-assistant/iOS/issues/1319
- [S4-5] https://developer.apple.com/documentation/webkit/wkwebview/setmicrophonecapturestate(_:completionhandler:)
- [S4-6] https://developer.apple.com/forums/thread/689182
- [S4-7] https://webkit.googlesource.com/WebKit/+/994076581f66fb5df3ffcc2b71d73aa0619e270c%5E!/
- [S4-8] https://bugs.webkit.org/show_bug.cgi?id=179411
- [S4-9] https://webrtchacks.com/guide-to-safari-webrtc/ (secondary)
- [S4-10] https://bugs.webkit.org/show_bug.cgi?id=167788
- [S4-11] https://developer.apple.com/forums/thread/24464
- [S4-12] https://developer.apple.com/forums/thread/71889
- [S4-13] https://developer.apple.com/forums/thread/85256
- [S4-14] https://github.com/WebKit/webkit/blob/main/Source/WebCore/platform/audio/ios/AudioSessionIOS.mm
- [S4-15] https://github.com/WebKit/WebKit/pull/13330
- [S4-16] https://trac.webkit.org/changeset/268893/webkit
- [S4-17] https://trac.webkit.org/changeset/269039/webkit
- [S4-18] https://bugs.webkit.org/show_bug.cgi?id=143190
- [S4-19] https://bugs.webkit.org/show_bug.cgi?id=237878
- [S4-20] https://bugs.webkit.org/show_bug.cgi?id=263627
- [S4-21] https://developer.apple.com/forums/thread/121822
- [S4-22] https://developer.apple.com/forums/thread/658375
- [S4-23] https://tag-github-bot.w3.org/gh/w3ctag/design-reviews/1069
- [S4-24] https://developers.google.com/admob/ios/browser/webview
- [S4-25] https://developer.apple.com/forums/thread/803344
- [S4-26] https://developer.apple.com/forums/thread/728463
- [S4-27] https://github.com/feross/unmute-ios-audio
- [S4-28] https://github.com/gree/unity-webview/issues/703
- [S4-29] https://capacitorjs.com/docs/v2/plugins/ios
- [S4-30] https://capacitorjs.com/docs/core-apis/ios
- [S4-31] https://github.com/ionic-team/capacitor/blob/main/ios/Capacitor/Capacitor/CapacitorBridge.swift
- [S4-32] https://github.com/ionic-team/capacitor/issues/8157
- [S4-33] https://github.com/ionic-team/capacitor/issues/2094
- [S4-34] https://github.com/ionic-team/capacitor/issues/2404
- Also seen: https://bugs.webkit.org/show_bug.cgi?format=multiple&id=273511 ; https://developer.apple.com/forums/thread/764453 (WebRTC audio in WKWebView on iOS 18) ; https://github.com/WebKit/webkit/blob/main/Source/WebCore/platform/audio/ios/MediaSessionManagerIOS.mm ; https://github.com/WebKit/WebKit/pull/7190 (experimental AudioSession Web API)

---

## 5. Sovereign / local STT and TTS options

### STT findings

- **whisper.cpp** (ggml-org) — MIT (LICENSE file seen). Core ML encoder on the Apple Neural Engine gives >3× encoder speed-up; decoder stays CPU/Metal. `stream` example does live-mic transcription; practical latency 0.5–2 s behind speech depending on model (secondary). [S5-1, S5-2, S5-3, S5-4]
- **WhisperKit** (Argmax) — MIT (LICENSE file seen); Swift-native, Core ML encoder+decoder on ANE/GPU/CPU; paper claims real-time streaming; blog/third-party claims of <200 ms first-word latency with large-v3-turbo on iPhone 15 Pro and compressed models (1.6 GB → 0.6 GB within 1 % WER). Now shipped inside the `argmax-oss-swift` package alongside TTSKit/SpeakerKit (README title seen). [S5-5, S5-6, S5-7, S5-8, S5-9]
- **Self-hosted Whisper servers** — `faster-whisper` (CTranslate2; ~4× lower latency and ~half VRAM vs reference), `WhisperLive` (WebSocket streaming server on faster-whisper, Docker image, multi-client, VAD). Reported limit: chunk-and-stitch streaming is 5–10 s latency on consumer hardware; sub-1 s needs Whisper-Streaming-style approaches or distil models (secondary). [S5-10, S5-11, S5-12]
- **Apple on-device Speech** — see §3 (`SFSpeechRecognizer` on-device; `SpeechAnalyzer` iOS 26). Closed model, zero data egress.
- **Vosk** — Apache 2.0; models ~50–200 MB; streaming API with partials; iOS supported; 20+ languages; no 2026 accuracy benchmark seen. [S5-13, S5-14, S5-15]
- **sherpa-onnx** (k2-fsa) — Apache 2.0; streaming ASR (Zipformer transducers), Paraformer, NeMo CTC, Whisper, SenseVoice; VAD, KWS, diarization; Swift/JS/12 language bindings; iOS/Android/embedded/server/WebSocket server. [S5-16, S5-17, S5-18]
- **Moonshine** (Moonshine AI / Useful Sensors) — MIT code and English models; `moonshine-streaming` tiny/small/medium on Hugging Face; ~27 M params at the small end; paper claims 5× less compute than Whisper tiny.en at equal WER; a 2026 paper on a compact streaming English model exists; browser VAD companion (`vad-moonshine`). [S5-19, S5-20, S5-21, S5-22, S5-23]

### TTS findings

- **Piper** — original `rhasspy/piper` **archived Oct 2025 (MIT)**; active successor **`OHF-Voice/piper1-gpl`** under **GPL-3.0** (embeds espeak-ng, itself GPL); releases as recent as Aug 2026; voice models licensed individually (MODEL_CARD per voice). Fast CPU VITS; sherpa-onnx can run Piper voices with incremental output. [S5-24, S5-25, S5-26]
- **Kokoro-82M** — Apache 2.0 weights, 82 M params, 54 voices / 8 languages at v1.0 (Jan 2025); real-time-or-faster on modest hardware server-side; first-token latency described as "fine, not exceptional" for sub-100 ms targets; in a 2026 on-device benchmark (Picovoice, secondary and competitor-authored) Kokoro measured ~3.7 s first-time-to-speak, 2 GB peak memory, 341 MB model, RTF > 1 on the tested mobile device. [S5-27, S5-28, S5-29]
- **Sesame CSM-1B** — Apache 2.0; Llama backbone + Mimi RVQ audio decoder; needs a CUDA GPU (~8 GB VRAM for practical speed); ~150 ms time-to-first-audio for synthesis alone (secondary); "conversational" context conditioning. Server-only. [S5-30, S5-31, S5-32]
- **Apple `AVSpeechSynthesizer`** — on-device, ~150+ preinstalled voices in iOS 17, `.enhanced`/`.premium` qualities (premium requires download), **Personal Voice** available to apps on iOS 17+ (user-created); `write(_:toBufferCallback:)` yields `AVAudioPCMBuffer`s that can be scheduled on an `AVAudioPlayerNode` (format conversion usually required); `write` had reported breakage on iOS 16/17 (forums 716424, 738048). [S5-33, S5-34, S5-35, S5-36, S5-37, S5-38]
- **sherpa-onnx TTS** — runs Kokoro, Matcha-Icefall, VITS-Piper, VITS-Coqui models on-device with the same Apache-2.0 runtime; a third-party benchmark (secondary) puts Piper/VITS fastest, Matcha mid, Kokoro slowest on mobile. [S5-16, S5-39, S5-40]
- **WhisperKit TTSKit** — appears as a product in `argmax-oss-swift` (title seen only); capabilities **UNVERIFIED**. [S5-8]

### Implications

- Every engine above satisfies the sovereignty constraint (no third-party cloud); the axis that differentiates them for a *persistent* runtime is **where it can run** (device vs minisforum) and whether it **streams** (partial results / incremental audio), not accuracy alone.
- Licensing is not uniform: Piper's live line is GPL-3.0 (engine) — a distribution question for an App Store binary if embedded on-device, not for a server container; Kokoro/CSM/Vosk/sherpa-onnx are Apache 2.0; whisper.cpp/WhisperKit/Moonshine/Silero are MIT.
- Apple-native pieces (`SpeechAnalyzer`, `AVSpeechSynthesizer`, Personal Voice) are the only options with zero bytes leaving the device **and** zero model-hosting obligation, at the price of a closed, un-benchmarkable model and an iOS 26 floor for the streaming analyzer.

### Sources

- [S5-1] https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE
- [S5-2] https://github.com/ggml-org/whisper.cpp
- [S5-3] https://github.com/ggml-org/whisper.cpp/discussions/548
- [S5-4] https://whipscribe.com/tools/whisper-cpp (secondary)
- [S5-5] https://github.com/argmaxinc/WhisperKit/blob/main/LICENSE
- [S5-6] https://arxiv.org/html/2507.10860v1
- [S5-7] https://www.argmaxinc.com/blog/whisperkit
- [S5-8] https://github.com/argmaxinc/argmax-oss-swift
- [S5-9] https://whipscribe.com/tools/whisperkit (secondary) ; https://cactuscompute.com/compare/argmax-vs-whisper-cpp (secondary)
- [S5-10] https://github.com/SYSTRAN/faster-whisper
- [S5-11] https://github.com/hwdsl2/docker-whisper-live
- [S5-12] https://www.dograh.com/feeds/blog/self-host-whisper-streaming (secondary)
- [S5-13] https://alphacephei.com/vosk/
- [S5-14] https://alphacephei.com/vosk/models
- [S5-15] https://github.com/alphacep/vosk-api
- [S5-16] https://github.com/k2-fsa/sherpa-onnx
- [S5-17] https://k2-fsa.github.io/sherpa/onnx/index.html
- [S5-18] https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html
- [S5-19] https://github.com/moonshine-ai/moonshine
- [S5-20] https://huggingface.co/moonshine-ai/moonshine-streaming-small
- [S5-21] https://arxiv.org/pdf/2410.15608
- [S5-22] https://arxiv.org/pdf/2604.14493
- [S5-23] https://github.com/moonshine-ai/vad-moonshine
- [S5-24] https://github.com/OHF-Voice/piper1-gpl
- [S5-25] https://www.cekura.ai/discover/piper-tts (secondary)
- [S5-26] https://www.promptquorum.com/power-local-llm/piper-tts-review (secondary)
- [S5-27] https://huggingface.co/hexgrad/Kokoro-82M
- [S5-28] https://localaimaster.com/blog/kokoro-tts-local-setup (secondary)
- [S5-29] https://picovoice.ai/blog/on-device-tts/ (secondary; vendor benchmark)
- [S5-30] https://huggingface.co/sesame/csm-1b
- [S5-31] https://github.com/SesameAILabs/csm
- [S5-32] https://www.spheron.network/blog/speech-to-speech-gpu-cloud-moshi-sesame-csm-hertz-dev/ (secondary)
- [S5-33] https://developer.apple.com/videos/play/wwdc2023/10033/
- [S5-34] https://bendodson.com/weblog/2024/04/03/using-your-personal-voice-in-an-ios-app/ (secondary)
- [S5-35] https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoicequality/premium
- [S5-36] https://developer.apple.com/documentation/avfaudio/avspeechsynthesizer/write(_:tobuffercallback:tomarkercallback:)?language=objc
- [S5-37] https://developer.apple.com/forums/thread/729218
- [S5-38] https://developer.apple.com/forums/thread/716424 ; https://developer.apple.com/forums/thread/738048?page=2
- [S5-39] https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/index.html
- [S5-40] https://github.com/k2-fsa/sherpa-onnx/discussions/3383

---

## 6. Streaming recognition, endpointing / turn detection, reference pipeline architectures

### Findings — VAD

- **WebRTC VAD**: signal-processing, 10–30 ms frames, very low latency, prone to false positives in noise. **Silero VAD**: neural, MIT, better accuracy in noise, prefers larger chunks (~30–250 ms per source), reported several-hundred-ms lag on speech→non-speech transitions. **TEN VAD**: Apache-2.0 "with conditions", 16 kHz, 10/16 ms hops, claims faster transition detection and ~32 % lower RTF than Silero. Two-stage WebRTC+Silero combinations are reported to improve precision/recall. Sources: Picovoice comparisons (secondary, vendor); py-webrtcvad issue 68; TEN VAD HF/PyPI pages; Silero LICENSE. [S6-1, S6-2, S6-3, S6-4, S6-5]
- Apple's own `SpeechDetector` (iOS 26) is an on-device VAD module in the same analyzer as the transcriber (§3).

### Findings — semantic endpointing / turn detection

- **LiveKit turn detector**: open-weights small language model predicting end-of-utterance from the **transcript**; runs alongside Silero VAD (VAD = speech presence + interruption trigger; model = commit signal); CPU-resident, <500 MB RAM, shared inference server; v1.0 write-up on end-of-turn. [S6-6, S6-7, S6-8, S6-9]
- **Pipecat Smart Turn v3/v3.1**: open-source (weights, data, training script) audio-native turn model on the **raw waveform**, 8 MB int8, **~12 ms CPU inference** (≈65 ms on a small cloud instance), 23 languages; `LocalSmartTurnAnalyzerV3` via ONNX. [S6-10, S6-11, S6-12, S6-13]
- **LiveKit AgentSession endpointing**: `min_endpointing_delay` semantics differ by mode — in VAD mode ≈ max(VAD silence, min delay); in STT-endpoint mode it is **additive** after the STT's end-of-speech; these parameters are deprecated in favour of `TurnHandlingOptions`. Issues 808, 4325, 5669, 3515 document the interaction bugs. [S6-14, S6-15, S6-16, S6-17]
- **Reference-only cloud designs** (not usable here): OpenAI Realtime exposes `server_vad` (threshold / prefix padding / silence duration / idle timeout) and `semantic_vad` (probability-of-done with an `eagerness` parameter that scales the wait timeout); Gemini Live performs automatic activity detection on a continuous stream, can be disabled for an external turn detector, cancels generation on interruption and reports it via a server message, and sends `AudioStreamEnd` after >1 s of paused audio. [S6-18, S6-19, S6-20]

### Findings — pipeline separation, barge-in, duplex

- **Pipecat**: frame pipeline — transport → STT → LLM → TTS → transport-out; `SystemFrame`s (e.g. `InputAudioRawFrame`, `UserStartedSpeakingFrame`, `InterruptionFrame`) bypass queues; `DataFrame`/`ControlFrame` are ordered. Interruption frames propagate **upstream**; barge-in is a state machine that within ~200 ms stops TTS, flushes the output buffer, cancels the in-flight LLM generation and redirects audio to STT; pipelining reduces voice-to-voice latency toward max(stage) rather than sum(stage), ~500–700 ms reported. [S6-21, S6-22, S6-23, S6-24]
- **Vocode**: transcriber / agent / synthesizer abstractions plus a conversation state machine; self-hostable; "fully local conversation" doc exists. [S6-25, S6-26]
- **LiveKit Agents**: sequential VAD → STT → LLM → TTS with each stage swappable; streaming turns the latency from a sum into something close to a max. [S6-27, S6-28]
- **Half- vs full-duplex**: barge-in requires a full-duplex audio pipeline (keep listening while playing); half-duplex stops listening when talking and cannot barge-in. Most orchestrators implement "half-duplex with barge-in", which is close to but not the same as full-duplex. Test metrics named: barge-in stop latency (T90), false barge-in rate; personalised VAD to reject non-primary speakers; post-interruption recovery benchmarks exist (IHBench, Full-Duplex-Bench). [S6-29, S6-30, S6-31, S6-32]

### Implications

- Every contemporary stack, cloud or open, separates **capture · VAD · STT · turn-commit · LLM · TTS · render** into independently replaceable stages with an explicit interruption signal that travels upstream. The turn-commit decision is its own stage (VAD-silence, STT-endpoint, or model-based) and is **never** the recognizer's segment boundary.
- The commit signal's *source* matters: model-based endpointing needs either the transcript (LiveKit) or the raw waveform (Smart Turn); both run on CPU-class hardware — feasible on the self-hosted server, and Smart Turn's size makes on-device plausible (UNVERIFIED on iOS).
- Barge-in is only possible if the runtime is full-duplex at the audio layer (VP-enabled native engine, §2) **and** the cognition/TTS layer can cancel mid-flight.

### Sources

- [S6-1] https://picovoice.ai/blog/best-voice-activity-detection-vad/ (secondary, vendor)
- [S6-2] https://github.com/wiseman/py-webrtcvad/issues/68
- [S6-3] https://huggingface.co/TEN-framework/ten-vad ; https://pypi.org/project/ten-vad/
- [S6-4] https://github.com/snakers4/silero-vad/blob/master/LICENSE ; https://github.com/snakers4/silero-vad
- [S6-5] https://medium.com/@dhanam2k03/optimizing-speech-pipelines-using-voice-activity-detection-d7323e53178e (secondary)
- [S6-6] https://docs.livekit.io/agents/logic/turns/
- [S6-7] https://huggingface.co/livekit/turn-detector
- [S6-8] https://blog.livekit.io/using-a-transformer-to-improve-end-of-turn-detection
- [S6-9] https://livekit.com/blog/solving-end-of-turn-detection
- [S6-10] https://huggingface.co/pipecat-ai/smart-turn-v3
- [S6-11] https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/
- [S6-12] https://www.daily.co/blog/improved-accuracy-in-smart-turn-v3-1/
- [S6-13] https://docs.pipecat.ai/api-reference/server/utilities/turn-detection/smart-turn-overview
- [S6-14] https://github.com/livekit/agents/issues/4325
- [S6-15] https://github.com/livekit/agents/issues/808
- [S6-16] https://github.com/livekit/agents/issues/5669
- [S6-17] https://github.com/livekit/agents/issues/3515
- [S6-18] https://developers.openai.com/api/docs/guides/realtime-vad (reference only)
- [S6-19] https://ai.google.dev/gemini-api/docs/live-api/capabilities (reference only)
- [S6-20] https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live (reference only)
- [S6-21] https://docs.pipecat.ai/guides/learn/pipeline
- [S6-22] https://reference-server.pipecat.ai/en/stable/api/pipecat.frames.frames.html
- [S6-23] https://github.com/pipecat-ai/nemotron-january-2026/blob/main/docs/streaming-pipeline-architecture.md
- [S6-24] https://modal.com/blog/low-latency-voice-bot (secondary)
- [S6-25] https://github.com/vocodedev/vocode-core
- [S6-26] https://docs.vocode.dev/open-source/local-conversation
- [S6-27] https://livekit.com/blog/sequential-pipeline-architecture-voice-agents
- [S6-28] https://livekit.com/blog/voice-agent-architecture-stt-llm-tts-pipelines-explained
- [S6-29] https://www.cekura.ai/discover/barge-in (secondary)
- [S6-30] https://roark.ai/blog/testing-full-duplex-voice-agents-gpt-live (secondary)
- [S6-31] https://arxiv.org/pdf/2507.23159
- [S6-32] https://arxiv.org/pdf/2606.19595
- Also seen: https://livekit.com/blog/turn-detection-voice-agents-vad-endpointing-model-based-detection ; https://www.assemblyai.com/blog/turn-detection-endpointing-voice-agent (secondary)

---

## 7. Bluetooth / routing / interruption recovery

### Findings

- **HFP vs A2DP**: HFP is always bidirectional (device mic + device speaker) at telephony quality; A2DP is high-quality output-only. With `.playAndRecord` and `.allowBluetoothHFP` set, output uses the HFP port and quality drops markedly; setting **only `.allowBluetoothA2DP`** (no HFP) keeps high-quality A2DP output while input falls back to the built-in mic — the documented pattern for "record on built-in mic, play on AirPods". Sources: Apple forums 4340, 5787, 741513, 784318; `allowBluetoothHFP` doc; Apple HT204387 profile list. [S7-1, S7-2, S7-3, S7-4, S1-5, S7-5]
- **AirPods**: with both options set, HFP is preferred; A2DP option issues on AirPods 2 reported (forum 745993); a 2025/26 thread concerns AirPods with H2 "studio-quality" capture and how to replicate Camera-app behaviour (content not read). iOS 17 changed `.allowBluetooth` handling per forum 736814 (content not read). [S7-6, S7-7, S7-8]
- **Sample-rate consequence**: AirPods force a 24 kHz hardware rate vs 48 kHz on speaker (§2, [S2-6]).
- **Phone-call interruption**: on `.ended` with `.shouldResume`, apps may reactivate; reactivation after a call has been reported to fail when backgrounded (forum 813278); an `installTap` that stops delivering after a call on iPhone 16e (forum 805735); `AVAudioRecorder` losing pre-interruption audio (forum 781778). CallKit integration requires restoring session config after `reportCall…endedAtDate…`. [S1-23, S3-5, S7-9, S7-10]
- **Lock screen / background**: `UIBackgroundModes: audio` + non-default category keep playback alive; starting recording in the background is generally disallowed; WKWebView capture is muted on background (§4). [S1-21, S1-22, S4-6]
- **Engine recovery**: `AVAudioEngineConfigurationChange` → Core Audio has already stopped the engine; rewire and restart; do not deallocate inside the handler. Practitioner reports: after AirPods→speaker switches the engine reports `isRunning == true` while routing nothing; input node keeps a stale format after hardware change; reconnecting can fail with `kAudioUnitErr_CannotDoInCurrentContext`; rebuilding the engine is the reliable path; an input tap returning constant-size **silent buffers** that only a device reboot cleared. Media-services reset requires full re-creation plus re-applying category/mode/options. [S2-14, S2-15, S2-16, S7-11, S7-12, S1-13]
- **Microphone data sources**: built-in mic exposes `dataSources` (Bottom / Front / Back, with location+orientation), `setPreferredDataSource`, and polar patterns on some devices (Apple QA1799). The system, not the app, assembles routes; `availableInputs` may lag (forum 770045). [S7-13, S7-14, S7-15]

### Implications

- A voice runtime must decide between **HFP (two-way on the headset, low quality, 24 kHz)** and **A2DP + built-in mic (high quality out, phone mic in)**; the choice changes the hardware sample rate and the AEC problem (headset mic vs phone mic hearing the room).
- Recovery from interruption/route/reset is **rebuild, not resume**, for the engine; the runtime needs an idempotent "construct graph from declared config" path and a health probe (§8) to confirm the rebuilt graph actually moves samples.
- Route flapping between built-in data sources (e.g. Bottom ↔ Front) is a system-selected event the app can only *prefer* against, not command.

### Sources

- [S7-1] https://developer.apple.com/forums/thread/4340
- [S7-2] https://developer.apple.com/forums/thread/5787
- [S7-3] https://developer.apple.com/forums/thread/741513
- [S7-4] https://developer.apple.com/forums/thread/784318
- [S7-5] https://support.apple.com/HT204387
- [S7-6] https://developer.apple.com/forums/thread/745993
- [S7-7] https://developer.apple.com/forums/thread/802775
- [S7-8] https://developer.apple.com/forums/thread/736814
- [S7-9] https://developer.apple.com/forums/thread/781778
- [S7-10] https://voximplant.com/docs/references/iossdk/hardware/viaudiomanager (secondary)
- [S7-11] https://developer.apple.com/forums/thread/769907
- [S7-12] https://developer.apple.com/forums/thread/679848
- [S7-13] https://developer.apple.com/library/archive/qa/qa1799/_index.html
- [S7-14] https://medium.com/@mehsamadi/understanding-avaudiosession-routes-on-ios-7718d934d0c0 (secondary)
- [S7-15] https://developer.apple.com/forums/thread/770045
- Also seen: https://www.audiodog.co.uk/blog/2021/07/11/correct-way-to-recover-from-core-audio-interruptions/ (secondary) ; https://developer.apple.com/forums/thread/122526 (engine bug after media services reset) ; https://github.com/winstondu/BluetoothIssueA2DP

---

## 8. Health / "physiological" observability

### Findings

- **Input energy on the tap**: standard practice is an `installTap` on the input node computing RMS per buffer (`sqrt(mean(x²))`) and `20·log10(rms)` dB, with iOS metering spanning roughly −160 dB (silent) to 0 dB. [S8-1, S8-2]
- **Digital zero vs quiet**: a buffer of **exact 0.0 samples** is distinguishable from a quiet or obstructed microphone, which still shows low-level noise; this distinction is the diagnostic for a dead capture path. (Apple forum on manual rendering; forum reports of silent constant-size tap buffers.) [S8-3, S7-12]
- **Warm-up false positives**: some devices emit digital zeros for ~0.5–1 s after the input stream opens (stream warm-up, not gating); one practitioner samples ~1.2 s before judging a mic dead; a macOS 26 report of all-zero USB mic input with a correctly detected device shows the failure is real at the OS/driver layer too. [S8-4, S8-5, S8-6]
- **Rendered-output verification**: no seen source describes an established iOS practice for confirming that rendered audio reached the transducer (as opposed to the graph rendering). WebKit's own "audio output" signals reflect graph activity. **UNVERIFIED / no established practice found** — the nearest analogues are loop-back checks in WebRTC stacks, which were not found for iOS in this survey.
- **Route stability**: observable via `currentRoute.inputs/outputs` (`portType`, `uid`, data source) at each route-change notification; in background on iOS 16 `currentRoute.outputs` was reported unreliable for CarPlay detection. [S7-14, S8-7]
- **VAD as liveness**: pipelines use frame-level VAD (WebRTC/Silero) not only for turn detection but as an "is audio actually arriving" monitor. [S8-8]

### Implications

- A persistent runtime can carry a small set of continuously sampled vitals: input RMS/peak with a **three-way classification (digital-zero · noise-floor · speech)**, a warm-up grace window, per-buffer sample-count/format, route descriptor hash, engine `isRunning` cross-checked against tap cadence (since `isRunning` can be true while nothing flows), and time since last non-zero buffer.
- "Output confirmed" from a Web Audio graph is not evidence of audibility; the only native-side proxies seen are absence of interruption state and route stability — an audibility oracle would have to be built (e.g. a test tone loop-back under VP), and no seen source documents one for iOS.

### Sources

- [S8-1] https://www.kodeco.com/21672160-avaudioengine-tutorial-for-ios-getting-started/page/2 (secondary)
- [S8-2] https://www.forasoft.com/blog/article/how-to-implement-silence-trimming-feature-to-your-ios-app-1720 (secondary)
- [S8-3] https://developer.apple.com/forums/thread/111249
- [S8-4] https://drunk.support/the-test-that-declared-a-live-mic-dead/ (secondary)
- [S8-5] https://github.com/pollen-robotics/reachy_mini/issues/820
- [S8-6] https://woteq.com/how-to-detect-silence-from-your-microphone-with-a-python-script/ (secondary)
- [S8-7] https://developer.apple.com/forums/thread/715244
- [S8-8] https://github.com/teunlao/silence-aware-recorder (secondary)

---

## Options matrix — STT

| Engine | Runs where | Streaming (partials) | Latency class | License | Maturity | Sovereignty fit |
|---|---|---|---|---|---|---|
| Apple `SpeechAnalyzer` / `SpeechTranscriber` + `SpeechDetector` | On-device, iOS 26+ | Yes — volatile → final | Low (on-device, progressive preset) | Apple platform API (closed model) | New (iOS 26, 2025); live-mic pitfalls documented | Fit: zero egress; misfit: iOS 26 floor, closed model, single language/session |
| Apple `SFSpeechRecognizer` (on-device mode) | On-device (server mode exists — not usable) | Yes — partial results | Low–medium | Apple platform API | Mature; legacy; 1-min cap only in server mode | Fit only with `requiresOnDeviceRecognition`; plugin default does not pin this — UNVERIFIED |
| WhisperKit | On-device (Apple silicon) | Yes (per paper/vendor) | Low (vendor: <200 ms first word, large-v3-turbo, iPhone 15 Pro) | MIT | Mature (v1.0 2026 per secondary) | Fit: on-device; model download at first run |
| whisper.cpp (+Core ML) | On-device or server | Chunked `stream` example | Medium (0.5–2 s behind, secondary) | MIT | Mature | Fit; streaming is chunk-based |
| faster-whisper / WhisperLive | Self-hosted server (minisforum, GPU optional) | WebSocket near-live | Medium–high (5–10 s chunk-stitch on CPU per secondary; lower with GPU/distil) | MIT (faster-whisper; WhisperLive license not seen — UNVERIFIED) | Mature | Fit: self-hosted; latency depends on server hardware |
| Vosk | On-device or server | Yes — true streaming | Low | Apache 2.0 | Mature, older acoustic models; no 2026 benchmark seen | Fit |
| sherpa-onnx (Zipformer streaming etc.) | On-device (Swift binding) or server (WebSocket) | Yes — true streaming transducers | Low | Apache 2.0 | Mature, very active | Fit; one runtime for STT+VAD+TTS |
| Moonshine Streaming | On-device / edge | Yes — streaming variants | Low (edge-class hardware) | MIT (code + English models) | Newer (2024–26); English focus | Fit; language coverage narrow |

## Options matrix — TTS

| Engine | Runs where | Streaming (incremental audio) | Latency class | License | Maturity | Sovereignty fit |
|---|---|---|---|---|---|---|
| Apple `AVSpeechSynthesizer` (+ Personal Voice) | On-device | Yes via `write(_:toBufferCallback:)` buffers or direct `speak` | Low | Apple platform API | Mature; `write` regressions reported iOS 16/17 | Fit: zero egress; voice quality bounded by system voices |
| Piper (`OHF-Voice/piper1-gpl`) | Server (CPU) or on-device via sherpa-onnx | Yes (sentence/paragraph incremental via sherpa-onnx) | Low on CPU | **GPL-3.0** engine (espeak-ng GPL); voices individually licensed | Mature; active (Aug 2026 release) | Fit on server; GPL is a distribution consideration if embedded in the app binary |
| Kokoro-82M | Server (CPU/GPU) or on-device via sherpa-onnx | Chunked | Low–medium on server; slow on mobile per vendor benchmark | Apache 2.0 | Mature (v1.0 2025) | Fit |
| Matcha-Icefall (sherpa-onnx) | On-device or server | Chunked | Medium | Apache 2.0 (runtime) | Moderate | Fit |
| Sesame CSM-1B | Server with CUDA GPU (~8 GB VRAM) | Yes (RVQ frames) | ~150 ms TTFA synthesis-only (secondary) | Apache 2.0 | Newer (2025); GPU required | Fit only if minisforum has a suitable GPU — UNVERIFIED |
| WhisperKit TTSKit | On-device | UNVERIFIED | UNVERIFIED | MIT (package) | Title seen only | UNVERIFIED |

---

## What this survey does not establish

1. **Any measured latency on MAIA's actual devices or on minisforum.** All latency figures are vendor or third-party claims on other hardware; several are from competitor-authored benchmarks (Picovoice) and are labelled as such.
2. **The exact `AVAudioSession` category/mode/options set by `@capacitor-community/speech-recognition`** — only the generic pattern was seen, not the plugin's Swift source.
3. **Whether WebKit's GPU-process/Web-process `AudioSession` pair can be configured, activated, or deactivated by the host app at all** on current iOS — only that the app's category is ignored and that WebKit's own interruption bookkeeping has a known "already interrupted" failure lineage.
4. **Whether the native Voice-Processing unit's echo reference includes audio rendered by WKWebView** — inferred as *no* from process separation, not stated in any seen source.
5. **Any ordering guarantee for Capacitor `notifyListeners` events across emitters/threads** — only the documented data race and main-thread hop.
6. **An established iOS practice for confirming audibility (rendered audio reaching the transducer)** — none found.
7. **On-device feasibility of Smart Turn / LiveKit turn-detector models on iOS** — CPU-class figures seen are for server CPUs.
8. **Current status of the WebKit bugs cited** (179411, 143190, 237878, 263627, 273511) — titles and snippets only; resolution states not read.
9. **Whether `AVAudioSession.interruptionNotification` "delivered only once" (forum 756311) is an iOS defect or an app-side error** — thread body not read.
10. **Anything about the project's own code.** This survey deliberately made no claim about the current runtime; the lane documents (`IOS-CONVERSATION-RUNTIME-01_LANE.md`) remain the record of what is witnessed on-device.
