# SOULLAB AUDIO AUTHORITY — Cross-project integration map

**Engineering census from canonical Soullab source and founder's named product roadmap; October 24, 2026.**  
`Mapped` means a source path was observed, **not** qualified or wired. `Design` means an intended product/adapter, **not** verified runtime. Protected source remains unchanged. Source owners must reconcile to the actual current checkout before any patch.

| Experience | Needed shared behavior | Current grounded source / surface | Integration posture |
|---|---|---|---|
| MAIA main conversation | Spoken TTS reserves output before audible chunk; mic transitions remain sovereign and turn-bound; other MAIA engines reconciled | `components/OracleConversation.tsx`, `lib/voice/StreamingAudioQueue.ts`, `components/voice/ContinuousConversation.tsx` | Mapped; LISTEN-12–14 fictional queue pilot only; full real MAIA, Realtime, one-shot, iOS **HOLD** |
| Writer's Studio | Listen-to-passage pauses music and owns narration; normal editorial changes do not stop background sound | `app/writers-studio/insight/MaiaListen.tsx`, `RebuildStudioClient.tsx` | Mapped; LISTEN-11 exact two-addition owner proposal only; actual current Writer source **HOLD** |
| Listening Room | Member music and local files persist through authorized room transitions; stop/pause/volume visible | Review `components/listening/PersistentListeningProvider.tsx`, `lib/listening/audioOutputLock.ts` | Review browser source passes bounded Chrome/WebKit; not member-mounted |
| Sound Sanctuary / Resonance | One focus lease for an entire multi-stem interactive soundscape; optional exclusive/consented vocal materials | Soullab's Sound Sanctuary product design; no verified protected production soundscape player located in current source census | Design; source-owner implementation and audio licensing **HOLD** |
| JARVIS Talk / Desktop | Speech output, interruption, single microphone permission, authorized main-process/renderer bridge | Separate `jarvis-desktop` workstream / JARVIS-VM01 #1974 | Design/source-owner dependent; native IPC, signed app, voice engine **HOLD** |
| Cabin sovereign offline | Local-only speaker/mic authority across MAIA, writer, journals and sound; device lock and encrypted member context | Existing Cabin independent runtime/recovery workstream #1898 | Design/source-owner dependent; preserve offline operation, encrypted restore/erasure **HOLD** |
| Pro Studio / practitioner | Never preempt or record a live member/client session automatically; capture permission separate | Existing Pro Studio Reflect/product and release-security workstream #1816 | Design; no live call or recording integration admitted |
| Astrology / professional | Spoken optional chart teaching never preempts MAIA, client conversation or confidential consultation | Actual Astrology Pro workstation and House navigation; optional audio teaching not verified in current source | Design; no automatic chart-to-speech sharing; strict natal consent canon |
| Journals / Dreams | Voice memo input requires member initiation; no automatic transcription/analysis or content broadcast | `app/api/journal/quick/audio/route.ts`, `lib/capacitor/NativeAudioRecorder.ts` | Mapped; actual mic/recording consent owner review **HOLD** |
| Reader / Audiobooks | Member-started narration/book audio is one foreground listening session; pauses during spoken turn; maintains user location | `components/reader/AudiobookReader.tsx`, `components/reader/AudioControls.tsx` | Mapped source; audiobook continuity and member rights **HOLD** |
| House / Kelly's World | Authenticated stable audio host; one persistent dock; no public-page/mismatched-member playback | Actual Soullab layout/House project; LISTEN-10 fictional host was **not** full House | Design; auth and strict route/source freeze **HOLD** |
| Research / Teaching Intelligence / future | Optional spoken reading only on explicit user action, respecting MAIA voice and session state | Product and content experiences, no current accepted universal voice port | Design; attach through same authority, not per-project audio hacks |

## Existing coordinator compatibility — no duplicate engine

The protected repository already has `lib/hooks/useAudioCoordinator.ts`, exporting `audioCoordinator` and `useAudioCoordinator()`. Its current in-document singleton supports `registerPlayer`, `interruptAll`, `startRecording`, `stopRecording`, and simple listeners. The source census found no callsites in `app`, `components` or `lib` beyond its own definition. It does **not** own Web Locks, exclusive platform output, native audio session, authenticated member lifecycle or rights.

Proposed owner work: implement an adapter or compatible evolution **of this existing entrypoint**, preserving legacy callers and separating output focus from input recording authority. Do not duplicate global singleton state or change `interruptAll` to a global audio policy without each source owner and regression acceptance.

The iOS `lib/voice/AudioSessionManager.ts` separately wraps a native Capacitor plugin; its Web fallback does not reproduce the real AVAudioSession lifecycle. Native integration must use this existing route rather than a fabricated browser-only iOS solution.

## Integration sequence (each separately accepted)

1. **AUDIO-A0 policy:** typed cross-project policy, transaction contract, denial and rights invariants, source audit, executable tests; **review candidate completed**.
2. **AUDIO-A1 web source-owner adapter:** reconcile old `useAudioCoordinator` with LISTEN-14 exclusive WebLock; exact protected Next/House real navigation, two fictional accounts, strict auth, consent checks and failure recovery.
3. **AUDIO-A2 primary voice:** independently accept MAIA streaming, one-shot, WebRTC, hands-free/mic; Writer's actual current source, Reader/Audiobook, journal capture, Sound Sanctuary mixer; all real source lineages and interruptions.
4. **AUDIO-A3 native:** physical iPhone Safari/Capacitor, audio session/focus + lockscreen, headset, AirPlay, call/Siri interruption and VoiceOver; do not confuse mobile WebKit viewport with device acceptance.
5. **AUDIO-A4 sovereign desktop:** JARVIS Electron main-process IPC authorization and on-device speaker/mic control; Cabin offline authenticated local service with member/sync/recovery isolation.
6. **AUDIO-A5 product quality:** licensed long-form soundscape master and audio chain measurement, author-controlled audiobook continuity, user-set modes (focus/creative/rest), no medical claims or automatic private content interpretation.
7. **AUDIO-A6 release:** one exact signed/safely restorable integrated image; independent privacy/security, Class A authentication, deletion/restore, opt-in, commercial rights and founder product GO.

**Status:** One source of shared audio policy is prepared. None of the cross-project runtime integrations or releases described here is claimed complete.
