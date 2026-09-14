# P1-02 · ORGANISM CENSUS — DOMAIN H · SENSORY / VOICE

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN    H · SENSORY / VOICE
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385
TYPE      RECORD ONLY — evidence, never rulings
AUTHORITY READ / TRACE / CLASSIFY
RULE      P1-02 asks what the organism does. It does not infer from doing that
          the organism is authorized to do it.
SCOPE     Everything ABOVE and BELOW the convergence point. Domain A owns the
          shared cognition path. The seam is named in §1; it is not re-censused.
WARNING   A transport or voice mechanism must NOT be mistaken for an alternate
          MAIA. Where this record names a second utterance channel, it says
          precisely whether a model authored the words.
```

## 0 · Subject verification

```text
git rev-parse HEAD                      f0279c5b0eee0ae7090df38b67d820923917c58c
git merge-base --is-ancestor 1a555430… HEAD    → true (subject is an ancestor)
git diff --stat 1a555430… HEAD -- components/ lib/voice lib/tts lib/audio
                                   lib/webrtc lib/sesame app/ __tests__/
                                        → EMPTY
git diff --stat 1a555430… HEAD          → 14 files, all under docs/programme/**
```

⭐ **Every code path in this domain is byte-identical between the census subject
and the working tree read.** No code claim below depends on the difference. Line
numbers cited are working-tree line numbers and are therefore also subject line
numbers. Per the canon's own **D1** discipline, every citation names the
**OPERATION**; the line number is orientation for a reader today, never the
identity of the evidence.

⛔ Nothing was run. No build, no test, no migration, no deploy, no database.

---

## 1 · THE SEAM — where sensory ends and cognition begins, as implemented

### ANSWER 1 · The convergence point at the subject

```text
OPERATION   await handleTextMessage(cleanedText)
            — the sole canonical cognition call inside handleVoiceTranscript,
              at the tail of its try block, after the ghost/echo/duplicate
              admission guards and after cleanMessage(transcript)
LOCATION    components/OracleConversation.tsx:7397
ENCLOSING   const handleVoiceTranscript = useCallback(async (transcript) => {…})
            components/OracleConversation.tsx:6780 → :7428
```

**Does the canon's named location still match?**

```text
CANON       docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md:76-80
            "As of b17cbf8ff it is:
             components/OracleConversation.tsx:7268
                 await handleTextMessage(cleanedText)   ← inside handleVoiceTranscript"

SUBJECT     components/OracleConversation.tsx:7397 — same operation, same
            enclosing function, same argument.

VERDICT     THE OPERATION MATCHES. THE LINE NUMBER DOES NOT (7268 → 7397, +129).
```

⭐ The canon pinned the operation **and** a line number, and the line number has
drifted by 129 lines while the operation has not moved at all. This is the exact
condition D1 exists for: the citation survives because it names the operation;
the coordinate does not. ⛔ This is recorded as a **citation-staleness finding**,
not as a divergence — nothing about the convergence itself has moved.

⚠️ Two further stale coordinates in the same canon section, recorded not repaired:

| canon says | at the subject |
|---|---|
| `apiFetch(apiEndpoint)` at `OracleConversation.tsx:5362` | the send lives near `:5299`–`:5410`; `apiEndpoint` default is declared at `:626`-region, not `:626` exactly |
| "A stale comment at `:7266` still reads `Browser STT → /api/between/chat → Browser TTS`" | **the stale comment is still present**, now at `components/OracleConversation.tsx:7395`: `// ✅ STANDARD FLOW: Browser STT → /api/between/chat → Browser TTS` — immediately above the convergence call, still naming a route `/maia` does not use and a transport that is one of four |

### The seam, stated structurally

```text
ABOVE THE SEAM (domain H)          BELOW THE SEAM (domain A — not censused here)
─────────────────────────────      ────────────────────────────────────────────
capture (4 transports)             handleTextMessage(text)
  → STT                              → apiFetch(apiEndpoint)
  → onTranscript(transcript)         → /api/sovereign/app/maia/list on /maia
  → handleVoiceTranscript            → canonical cognition
      · 12 admission guards
      · crisis / command branches
      · cleanMessage()
      └──► await handleTextMessage(cleanedText)   ◄── THE SEAM
```

⭐ **As implemented, everything above the seam is capture and admission.** The
voice handler carries no request of its own, no prompt, no endpoint and no model
selection into cognition — it hands a string across. That is a WIRING fact. ⛔ It
is not a claim that the admission guards above the seam are governed; §5 shows
several are not.

⚠️ **The seam is not where sensory ends in the OUTPUT direction.** Below cognition
the path returns into domain H again (response → TTS → re-listen), and that
return leg is where the sharpest findings in this domain sit (§3, §4, §6).

---

## 2 · ANSWER 2 · How many paths carry a member utterance into cognition

### Capture transports (ear side) — FOUR, all converging

`selectVoiceTransport()` — `lib/utils/platformDetection.ts:125`-`:130` — resolves
transport from platform facts alone:

| # | transport | selected when | STT performed by | reaches convergence? |
|---|---|---|---|---|
| T1 | `native-speech` | `isNative` (Capacitor) | `@capacitor-community/speech-recognition` (OS) | ✅ via `onTranscript` |
| T2 | `sovereign-whisper` | `isDesktop && canRecordAudio` | `POST /api/voice/transcribe-simple` → local Faster-Whisper | ✅ via `onTranscript` |
| T3 | `sovereign-whisper` | `!hasSpeechRecognition && canRecordAudio` (Firefox/Zen, Android native-failure recovery) | same as T2 | ✅ via `onTranscript` |
| T4 | `web-speech` | otherwise (Chrome, Safari) | browser vendor (`webkitSpeechRecognition`) | ✅ via `onTranscript` |
| — | `none` | no recognition and no recorder | — | no utterance exists |

All four terminate in `onTranscript(...)` inside
`components/voice/ContinuousConversation.tsx` — dispatch operations at `:1255`,
`:2252` (`processAccumulatedTranscript`), `:2810`, `:2944`, `:3042`, `:3100`,
`:3533`. `OracleConversation.tsx:10412` binds `onTranscript={handleVoiceTranscript}`,
and that is the **only** mount of `ContinuousConversation` in the MAIA surface
(`OracleConversation.tsx:11`, `:10410`).

⭐ **Four capture transports, one admission handler, one convergence call.** The
ear is plural; the mouth of the ear is singular.

### Paths that do NOT cross the convergence

⭐ These are the answer to "name any that do not." All are **inside**
`handleVoiceTranscript` and all are `return`s — the member utterance is consumed
and no MAIA turn is authored by cognition.

| # | guard / branch | operation | line | does MAIA speak? |
|---|---|---|---|---|
| N1 | empty transcript | `return` | 6786 | no |
| N2 | feedback prevention (MAIA speaking / processing / mic paused) | `return` | 6803 | no |
| N3 | 30s duplicate-transcript window | `return` | 6819 | no |
| N4 | standalone voice command (`t.length < 50` heuristic) | `return` | 7157 | ⚠️ yes — `maiaSpeak(voiceCmd.acknowledgmentText)` at 7143 |
| N5 | MAIA command-only (`onlyCommands`) | `return` | 7212 | ⚠️ yes — `maiaSpeak(confirmation)` at 7209 |
| N6 | empty/punctuation-only after command strip | `return` | 7226 | no |
| N7 | ghost-phrase filter (21 hard-coded YouTube/ambient strings) | `return` | 7258 | no |
| N8 | echo-suppression cooldown window | `return` | 7265 | no |
| N9 | echo-suppression similarity to MAIA's last response | `return` | 7282 | no |
| N10 | already processing / responding | `return` | 7292 | no |
| N11 | duplicate of last user message | `return` | 7299 | no |
| N12 | Scribe mode, not aside — *"Don't trigger MAIA response when witnessing"* | `return` | 7341 | no |

⚠️ **N4 and N5 are exits on which MAIA SPEAKS AND NO COGNITION RAN.** The words
are locally authored (`voiceCmd.acknowledgmentText`, `getMaiaCommandConfirmation`).
⛔ **Not a second mind** — no model is in the path — but it is a first-person
utterance channel that never passes canonical egress. See §6 (Class C).

⚠️ **One branch speaks and deliberately does NOT return**: the crisis script,
`for (const line of crisisCheck.responseScript) { await maiaSpeak(line); }` —
`components/OracleConversation.tsx:6852`-`:6857`, followed verbatim by
`// Don't return - let the message go through with crisis context`. So a crisis
utterance is spoken **outside every guard**, and the same turn then also crosses
the convergence. P1-01's report of an unguarded crisis script is **VERIFIED AT
THE SUBJECT**. ⛔ No repair is proposed.

### Utterance-bearing transcript consumers OUTSIDE this path

| consumer | file | disposition at the subject |
|---|---|---|
| `VoiceWithNotes` | `components/voice/VoiceWithNotes.tsx:75`, `:179` | transcript → `POST /api/notes`. **Never reaches cognition** — a capture surface, not a conversation. |
| `MorningDreamCaptureInterface` | `components/dreams/MorningDreamCaptureInterface.tsx:242` | `onTranscript={(t) => setDreamContent(t)}` — fills a form field. No cognition. |
| `BetaMinimalMirror` | `components/chat/BetaMinimalMirror.tsx:133` | `handleTranscript` body is `// Optional: Show live transcript preview` — empty. **DORMANT**: grep finds no mount of `BetaMinimalMirror` anywhere in `app/` or `components/`. |
| `app/oracle/page.broken.tsx:1072`, `:1122` | — | binds its own `handleVoiceTranscript`. Filename `.broken.tsx` is not a Next route. **ORPHANED.** |
| `app/labtools/scribe/page.tsx:78` | — | `onTranscript: (result: TranscriptResult) => …` — labtools scribe surface, separate from the MAIA conversation. |

⭐ **No second voice→cognition path was found at the subject.**
`sendStreamingMessage` / `/api/voice/stream-conversation` — the historical second
mind — is **preserved and unreachable from voice**: `hooks/useStreamingVoice.ts:633`
still issues `apiFetch('/api/voice/stream-conversation')`, the route exists
(`app/api/voice/stream-conversation/route.ts`, 1,600+ lines, its own Claude
service), and `OracleConversation.tsx:2609` still calls `useStreamingVoice({…})` —
but no identifier `sendStreamingMessage` or `streamingVoiceMode` appears inside
`handleVoiceTranscript`'s body. Status: **SUPERSEDED (preserved as evidence,
unreachable from the voice handler)**.

---

## 3 · ANSWER 3 · Does MAIA's turn reach the member independently of TTS success?

**The sharpest question in this domain. VERIFIED AT THE SUBJECT: YES, for the
canonical turn — through one idempotent seam reached by six named paths.**

```text
OPERATION   const commitOracleTurn = (reason: string) => { … }
LOCATION    components/OracleConversation.tsx:6372  (declared :6371 `let oracleTurnCommitted = false;`)
SCOPE       local to the response-handling block of handleTextMessage
IDEMPOTENCE if (oracleTurnCommitted) return; oracleTurnCommitted = true;   :6373-:6374
EFFECT      setMessages(prev => appendMessageCapped(prev, oracleMessage))   :6375
            onMessageAddedRef.current?.(oracleMessage)                      :6376
            + voice-mode saveConversationMemory(…) rides the same seam      :6380-:6395
```

### The six terminal paths, counted at the subject

| # | reason | operation site | condition |
|---|---|---|---|
| 1 | `'chat'` | `:6400` | `!isInVoiceMode` — chat mode commits immediately |
| 2 | `'voice_streaming_audio'` | `:6461` | `usedStreamingAudio && isInVoiceMode` |
| 3 | `'voice_tts_watchdog'` | `:6500` | `setTimeout(() => commitOracleTurn('voice_tts_watchdog'), VOICE_TRANSCRIPT_WATCHDOG_MS)` armed **before** `await maiaSpeak` |
| 4 | `'voice_after_speech'` | `:6529` | speech resolved, `isInVoiceMode` |
| 5 | `'voice_speech_error'` | `:6535` | speech threw, `isInVoiceMode` |
| 6 | `'voice_no_tts'` | `:6634` | `else` of `shouldSpeak && maiaSpeak` — the **speak + silent** cell |

`VOICE_TRANSCRIPT_WATCHDOG_MS = 6000` — `components/OracleConversation.tsx:341`.
`clearTimeout(transcriptWatchdog)` in the `finally` — `:6539`.

### Is it genuinely independent of TTS success?

```text
TTS RESOLVES          path 4 commits · watchdog cleared in finally
TTS THROWS            path 5 commits · watchdog cleared in finally
TTS HANGS (neither)   path 3 commits at 6s — the case that motivated the repair;
                      a promise that never settles runs neither branch
TTS NOT ATTEMPTED     path 6 commits (member turned MAIA's voice off)
STREAMING AUDIO       path 2 commits
NOT VOICE MODE        path 1 commits
```

⭐ **Independent in all five voice outcomes.** The commit is armed before the
`await`, not after it, so the hang case is covered by construction rather than by
a handler that the hang prevents from running.

⭐ **Independent of `showVoiceText`.** The flag is read only at render
(`:9264`, `:9276`, `:9889`-`:9906`, `:10589`, `:10719`) and never in any
`commitOracleTurn` condition. `__tests__/voice-transcript-commit.test.ts:64`
pins the negative: `expect(code).not.toMatch(/isInVoiceMode\s*&&\s*showVoiceText/)`.

### ⛔ Paths that do NOT reach the seam — named, as required

| # | path | operation | line | what the member gets |
|---|---|---|---|---|
| X1 | offline fallback | builds its own `fallbackMessage` + `appendMessageCapped` + `handleSpeakMessage(fallbackText, …)` then `return` | `:5386`-`:5397` | locally-authored text, spoken via a **different TTS entry** |
| X2 | network-error fallback | same shape | `:5550`-`:5561` | same |
| X3 | server-error fallback | same shape | `:5630`-`:5641` | same |
| X4 | API catch block | `console.error('Text chat API error:' …)` then its own error message | `:6643`ff | error text |
| X5 | teen abuse block | own `blockingMessage` + append, `return` | `:5169`-`:5210` | intervention text, no cognition |
| X6 | voice-flow catch in `handleVoiceTranscript` | own `errorMessage` + `appendMessageCapped` | `:7404`-`:7416` | error text |

⭐ **All six are pre-cognition or failure paths** — `commitOracleTurn` does not
yet exist in scope at X1–X3, X5, and X6 is a different function. So "every
terminal path reaches the seam" is true **of the canonical response block**, and
the gate's own scoping says so: `__tests__/voice-transcript-commit.test.ts:52`-`:56`
slices from `const commitOracleTurn` to `console.error('Text chat API error:'`.

⚠️ **X1–X3 speak through `handleSpeakMessage` (`:7499`), a SECOND TTS entry
point** that calls `apiFetch('/api/voice/openai-tts')` at `:7517` independently of
`maiaSpeak` (`:1955`, fetching the same route at `:2034`/`:2130`). Three TTS call
paths, one route. ⛔ No model authored X1–X3's words.

---

## 4 · ANSWER 4 · What gates TTS, and what gates STT

### TTS — MULTIPLE NAMED GATES EXIST, AND THE PATH MAIA ACTUALLY SPEAKS THROUGH BYPASSES THEM

**Gates that exist:**

| gate | operation | location |
|---|---|---|
| G-T1 · deployment qualification (Refusal R15) | `assertProviderQualified(provider, context)` → `ProviderNotQualifiedError` | `lib/tts/ttsRouter.ts:97`-`:104`; allowlist `QUALIFIED_PROVIDERS` `:62`-`:67` (`production-maia: ['auto','kokoro']`); fail-closed context resolver `getDeploymentContext()` `:75`-`:79` |
| G-T2 · cloud-voice canon | `assertCloudVoiceAllowed` / `CloudVoiceForbidden` / `resolveVoicePreference`; constructor of `TTSFallbackToOpenAI` refuses to be built | `lib/tts/cloudVoicePolicy.ts` (whole module; doctrine block `:1`-`:40`) |
| G-T3 · member cloud consent | `checkCloudConsent({memberId, localOnlyHeader})` → 503 `'Local voice unavailable and cloud fallback is not permitted'` | `app/api/voice/openai-tts/route.ts:256`-`:277` |
| G-T4 · auth + usage limits | `getMemberIdFromRequest(req)`; usage-limit check → block | `app/api/voice/openai-tts/route.ts:43`, `:77` |
| G-T5 · length | `Text too long (max 4096 chars for TTS)` | `app/api/voice/openai-tts/route.ts:110` |

**⭐⭐ THE ARCHETYPE BRANCH RUNS BEFORE G-T1, G-T2 AND G-T3, AND RETURNS.**

```text
OPERATION  const archetypeResolution = resolveArchetypeVoice(effectiveArchetype);
           if (archetypeResolution.provider === 'openai') { … OpenAI … return }
LOCATION   app/api/voice/openai-tts/route.ts:128  → :131 → returns ~:181
COMMENT    ":131  // If archetype routes to OpenAI (MAIA feminine voices), skip Kokoro entirely"
           ":115  // MAIA vow: default voice is always maia_core (OpenAI Alloy)."
```

and the archetype default resolves to OpenAI unless one env var is set:

```text
lib/voice/voiceArchetypes.ts:58   const voiceOverride = (process.env.MAIA_VOICE_OVERRIDE || '').toLowerCase();
lib/voice/voiceArchetypes.ts:59   const maiaProvider  = voiceOverride === 'kokoro' ? 'kokoro' : 'openai';
lib/voice/voiceArchetypes.ts:67   { id: 'maia_core', … group: 'cloud', provider: maiaProvider, voice: … 'alloy' }
lib/voice/voiceArchetypes.ts:88   if (!archetype) return { provider: 'openai', voice: 'alloy' };   ← unset ⇒ cloud
lib/voice/voiceArchetypes.ts:92   …unknown archetype ⇒ { provider: 'openai', voice: 'alloy' }     ← unknown ⇒ cloud
app/api/voice/openai-tts/route.ts:127  const effectiveArchetype = memberArchetype || 'maia_core';
```

⭐ **`MAIA_VOICE_OVERRIDE` is absent from `docker-compose.production.yml`.** What
that file *does* set (`:175`-`:176`) is `MAIA_LOCAL_VOICE_ENABLED: "1"` and
`MAIA_TTS_PROVIDER: "kokoro"   # Sovereign TTS — zero-OpenAI doctrine` — both of
which are read at `app/api/voice/openai-tts/route.ts:202`-`:203`, **below the
archetype return**. ⛔ **Both directions of the drift are recorded and neither is
reconciled here** (§8).

⚠️ `assertProviderQualified` and `assertCloudVoiceAllowed` have **no caller on the
member-facing TTS route**. Grep across `app/` and `lib/` finds `resolveVoicePreference`
used only in `app/api/voice/stream-conversation/route.ts:250` (the unreachable
second-mind route) and `app/api/voice/preview/route.ts:133`; every other reference
is in `lib/tts/__tests__/voiceSovereignty.test.ts`. `app/api/voice/preview/route.ts:124`
states the shape of the problem in its own words: *"never passes through
`ttsRouter` and never hits `assertCloudVoiceAllowed`."*

### STT — ⛔ NO QUALIFICATION GATE. STATED PLAINLY.

```text
OPERATION  selectVoiceTransport(facts)         lib/utils/platformDetection.ts:125-:130
INPUTS     isNative · isDesktop · hasSpeechRecognition · canRecordAudio
OUTPUT     'native-speech' | 'sovereign-whisper' | 'web-speech' | 'none'
```

⛔ There is **no `QUALIFIED_PROVIDERS` for STT**, no `assertProviderQualified`
analogue, no `assertCloudEarAllowed`, no `checkCloudConsent` on the ear, no
refusal class, no deployment-context fail-closed resolver, and no policy module
anywhere under `lib/voice/**` matching `qualified|QUALIFIED|assertProvider`
(grep: zero hits).

**The ear is selected by CAPABILITY, not by POLICY.** Consequences as implemented:

- `web-speech` (T4) is the default for ordinary Chrome and Safari, and
  `webkitSpeechRecognition` performs recognition **off-device, at the browser
  vendor**. No consent gate, no member preference, no audit row, no refusal.
- The two **first-party** transports do carry auth gates, and they are the only
  ear-side gates that exist:

| ear-side gate | operation | location |
|---|---|---|
| E-1 · auth | `getMemberIdFromRequest(req)` → 401 `Unauthorized` | `app/api/voice/transcribe-simple/route.ts:31`-`:33` |
| E-2 · auth | same | `app/api/voice/transcribe/route.ts:42`-`:44` |
| E-3 · entitlements | `getEntitlements(memberId)` | `app/api/voice/transcribe/route.ts:93` |
| E-4 · daily usage quota | `getDailyUsage(memberId, "voice")`, `incrementDailyUsage` | `app/api/voice/transcribe/route.ts:116`, `:246` |

⭐ E-1…E-4 are **identity and commercial** gates. ⛔ **None is a provider-egress or
consent gate**, and none applies to T1 (OS recognizer) or T4 (browser vendor),
which never touch a first-party route at all.

⭐⭐ **THE ASYMMETRY, STATED AS FOUND**: the mouth has a fail-closed deployment
allowlist, a canon module whose default is refusal, a per-member consent check and
an audit table (`voice_fallback_events`). The ear has platform detection. **On the
path MAIA actually speaks through, the mouth's gates are bypassed; on the path the
member actually speaks through, the gates were never written.**

---

## 5 · Capability records

### H-1 · VOICE CAPTURE / TRANSPORT SELECTION

```text
DECLARED    lib/utils/platformDetection.ts — selectVoiceTransport, currentVoiceTransport,
            hasSpeechRecognitionAPI, canRecordAudioForWhisper, isDesktopShell
COMPUTED    selectVoiceTransport(facts)                      platformDetection.ts:125
CONSUMED    ContinuousConversation.tsx:3401 (LOGGED, not dispatched on — the
            dispatch condition is (info.isDesktop || !hasSpeechRecognitionAPI())
            && canRecordAudio at :3408)
PERSISTED   none · SURFACED console.log('[voice] transport:', …) at :3406
CALL PATH   startListening → getPlatformInfo() → selectVoiceTransport → branch
            → onTranscript → handleVoiceTranscript
MEMBER AUTH none — the member cannot choose a transport
MAIA / PRACTITIONER AUTH   none · SYSTEM AUTH total — platform facts decide
GOVERNANCE  ⛔ NONE FOUND for provider egress. (The Desktop branch cites
            "DESKTOP-SOVEREIGN-STT-01 · S1/S4" and "D01 §XII" in comments at
            ContinuousConversation.tsx:711 and :3390 — ⚠️ neither document was
            located in docs/** at the subject; see §10.)
FAILURE     returns 'none'; getVoiceUnavailableMessage() surfaces a truthful state
STATUS      WIRED-BUT-UNOBSERVED
EVIDENCE    platformDetection.ts:125-149 · ContinuousConversation.tsx:3370-3420
CONTRA      CLAUDE.md "Voice: Local TTS/STT or browser APIs only" admits the
            browser vendor as sovereign; canon does not address the ear's egress
            at all. Preserved, §8-C4.
```

### H-2 · STT · FIRST-PARTY WHISPER (T2 / T3)

```text
DECLARED    app/api/voice/transcribe-simple/route.ts (178 ln) · app/api/voice/transcribe/route.ts (411 ln)
COMPUTED    audio POSTed to the local Faster-Whisper server (OpenAI-compatible
            API) — transcribe-simple:116-:149 · transcribe:189-:219
PERSISTED   transcribe: llamaService.addMemory(memberId, …) :234 ·
            incrementDailyUsage(memberId,"voice",…) :246
            transcribe-simple: ⛔ no persistence found
CALL PATH   ContinuousConversation (MediaRecorder) → POST → maia-whisper → onTranscript
MEMBER AUTH implicit (speaking); no per-turn consent prompt
SYSTEM AUTH member must be authenticated
GOVERNANCE  E-1…E-4 (§4). ⛔ NO provider-qualification gate. ⛔ NO consent gate.
            ⚠️ transcribe-simple has AUTH ONLY — no entitlements, no quota.
FAILURE     401 · 5xx from whisper → ContinuousConversation salvage path
            (onTranscriptSalvage, :1537)
STATUS      WIRED-BUT-UNOBSERVED
EVIDENCE    both route files; sovereignty claims in their own headers
            (transcribe-simple:11-:14; transcribe:27)
```

### H-3 · STT · BROWSER / OS RECOGNIZERS (T1 / T4)

```text
DECLARED    components/voice/ContinuousConversation.tsx:715-:725 (webkitSpeechRecognition)
            :9 import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition'
            lib/voice/webSpeechLifecycle.ts — WebSpeechRecognitionSession, classifyRecognitionError
COMPUTED    off-device, by the browser or OS vendor · PERSISTED none at capture
SURFACED    interim + final transcripts; logVoiceEvent('voice_transcribe_result', …) :848
CALL PATH   initializeSpeechRecognition (:695) → onresult (:885-:920) → onTranscript
MEMBER AUTH microphone permission only
GOVERNANCE  ⛔ NONE FOUND. Desktop is refused Web Speech by CLASSIFICATION
            (:711 "SpeechRecognition refused on Desktop — sovereign Whisper
            transport only"), which is the ONLY place in the corpus where an STT
            provider is refused — and it is refused for Desktop only, by shell
            classification, never by a policy module.
FAILURE     classifyRecognitionError → restart / salvage
STATUS      WIRED-BUT-UNOBSERVED
CONTRA      §8-C4
```

### H-4 · VOICE ADMISSION GUARDS (the 12 exits)

```text
DECLARED    components/OracleConversation.tsx:6780-:7428 (handleVoiceTranscript)
COMPUTED    in-handler: detectCrisis · matchVoiceCommand · detectMaiaCommands ·
            ghostPhrases.some · echo similarity · duplicate refs
PERSISTED   lastProcessedTranscriptRef, echoSuppressUntil — in-memory only
MEMBER AUTH ⛔ NONE — the member cannot see, tune or override any guard
MAIA AUTH   none (no model reads them) · SYSTEM AUTH total
GOVERNANCE  ⭐ __tests__/voice-non-degradation.test.ts — a CLOSED-SET structural
            gate: RATIFIED_EXITS (12 rows, :236-:251) pins each exit key AND the
            exact calls its branch makes; RATIFIED_CALLS (76 entries, :122-:199)
            pins every call the handler makes anywhere; RATIFIED_COGNITION_TAIL
            (:214-:220) pins the ORDERED five-call tail around handleTextMessage.
            ⛔ It is a NON-DEGRADATION gate, not a governance ruling: it certifies
            that the set has not CHANGED. It does not establish that any guard is
            authorized. The file says so itself (:79-:83): "FROZEN IS NOT BLESSED."
FAILURE     a refused utterance is silently dropped; nothing is surfaced to the member
STATUS      WIRED-BUT-UNOBSERVED
CONTRA      §8-C2 (ghost-phrase list is content-based refusal with no governance)
```

### H-5 · CANONICAL CONVERGENCE

```text
OPERATION   await handleTextMessage(cleanedText)   OracleConversation.tsx:7397
GOVERNANCE  ⭐ docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md —
            named in CLAUDE.md as a "hard acceptance gate on all voice/transport
            work"; RED = voice does not ship.
            Enforced by __tests__/voice-non-degradation.test.ts (523 ln, 15 cases),
            which additionally proves the retired streaming exit cannot return:
            :501-:514 walks the handler's AST identifiers and asserts neither
            'streamingVoiceMode' nor 'sendStreamingMessage' appears.
STATUS      WIRED-BUT-UNOBSERVED (structurally pinned; no runtime witness in-repo)
CONTRA      canon's line number is stale (§1); canon's own GREEN verdict was
            withdrawn once already (canon :140ff) — that withdrawal is preserved
            in the document and is not re-litigated here.
```

### H-6 · MAIA TURN COMMIT SEAM

```text
OPERATION   commitOracleTurn(reason)            OracleConversation.tsx:6372
PERSISTED   messages state + onMessageAdded callback; voice-mode
            saveConversationMemory(…, sourceType:'voice', role:'assistant')  :6382
GOVERNANCE  ⭐ __tests__/voice-transcript-commit.test.ts (95 ln, 6 cases):
            one seam · idempotent · nothing else appends oracleMessage in the
            canonical region · not gated on showVoiceText · watchdog exists and is
            cleared · all six reasons present.
            ⚠️ Every assertion is a SOURCE-SHAPE assertion over stripped text.
            It proves the strings and the shape are present. ⛔ It does not
            execute the component, so it cannot witness that a hung TTS actually
            yields a committed turn at runtime.
MEMBER AUTH none over the seam; showVoiceText governs RENDERING only
STATUS      WIRED-BUT-UNOBSERVED under the LIVE calibration — see §7.
```

### H-7 · TTS EGRESS

```text
DECLARED    maiaSpeak (OracleConversation.tsx:1955 → POST /api/voice/openai-tts
            at :2034 native, :2130 web) · handleSpeakMessage (:7499 → same route
            at :7517) · route app/api/voice/openai-tts/route.ts (393 ln) ·
            policy lib/tts/ttsRouter.ts (450) · cloudVoicePolicy.ts (132) ·
            voiceSovereignty.ts (259)
PERSISTED   voice_fallback_events (logFallbackEvent, voiceSovereignty.ts)
MEMBER AUTH member voice archetype (getMemberVoicePreferences, route :121);
            cloud-consent row (checkCloudConsent) — ⚠️ consulted ONLY on the
            local-failure fallback branch (:256), never on the archetype branch
SYSTEM AUTH provider selection; env vars MAIA_VOICE_OVERRIDE · MAIA_TTS_PROVIDER ·
            MAIA_LOCAL_VOICE_ENABLED · MAIA_ALLOW_CLOUD_VOICE · MAIA_DEPLOYMENT_CONTEXT
GOVERNANCE  G-T1…G-T5 (§4) — ⛔ G-T1/G-T2/G-T3 NOT REACHED on the archetype branch
FAILURE     archetype=openai + missing OPENAI_API_KEY → 500; local failure without
            consent → 503 local-only; maiaSpeak hang → watchdog commits the turn
STATUS      WIRED-BUT-UNOBSERVED
CONTRA      §8-C1 — the load-bearing contradiction of this domain
```

### H-8 · RE-LISTEN / CONTINUATION

```text
DECLARED    lib/voice/restartAuthority.ts (continuation policy + micState
            normalization) · ContinuousConversation.tsx (micState machine,
            authorityGuard) · OracleConversation.tsx attemptMicRestart (:6560-:6620)
CONSENT     ⭐ lastSendWasVoiceRef — OracleConversation.tsx:1618 (init true),
            set false on every typed turn at :4919, set true on an ACCEPTED voice
            turn at :6827 (deliberately AFTER the feedback and duplicate guards,
            so a transcript rejected during a typed turn cannot flip it back).
            Read as the gate on seven restart sites: :2678 :2781 :2850 :2998
            :5758 :6580 :6597.
            Comment at :4917 states the rule: "typed input is not voice re-consent."
MEMBER AUTH ⭐ REAL — modality of the member's last send decides whether the mic re-arms
GOVERNANCE  ⚠️ PARTIAL. restartAuthority.ts documents a P0 (:1-:24) and encodes the
            policy in one place; the CONSENT rule is enforced only by this ref and
            is not traced to a ruling document at the subject.
            ⚠️ `lastSendWasVoiceRef` INITIALISES TRUE — before the member has spoken
            once, the system's default posture is "voice was the last modality."
STATUS      WIRED-BUT-UNOBSERVED
```

### H-9 · CLASS C · SPOKEN-WITHOUT-COGNITION

```text
COUNT AT SUBJECT   12 `await maiaSpeak(` call sites in OracleConversation.tsx:
                   6514 (canonical response) · 6854 (crisis script) · 7039 · 7044 ·
                   7053 · 7058 · 7079 · 7097 · 7099 (astrology / scribe data-API text) ·
                   7120 (paused-response replay) · 7143 (command ack) · 7209 (confirmation)
                   ⇒ ⭐ ELEVEN Class C sites + ONE canonical. P1-01's count VERIFIED.
WORDS AUTHORED BY  local scripts and data-API responses. ⛔ NO MODEL IN THE PATH —
                   these are not an alternate MAIA mind.
BUT                they are member-facing first-person utterances that bypass
                   canonical egress finalization entirely.
GOVERNANCE         ⛔ NONE FOUND. docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md:78-:82
                   states the classification is "Proposed … for founder ruling" and
                   "C should be recorded and deferred". The test header
                   (voice-non-degradation.test.ts:79-:83) pins several of them
                   "so they cannot grow" and says explicitly: "⚠️ FROZEN IS NOT
                   BLESSED: pinning stops them growing, it does not certify them."
SHARPEST           the crisis script at :6852-:6857 — spoken outside every guard,
                   deliberately non-returning. ⚠️ Its coordinates in the exit map
                   (":6712") and in the test header (":6712") are BOTH STALE; the
                   operation is at :6854 at the subject.
STATUS             WIRED-BUT-UNOBSERVED · UNRULED
```

---

## 6 · ANSWER 5 · Governance gate per capability

| capability | GOVERNANCE GATE |
|---|---|
| H-1 transport selection | ⛔ **NONE FOUND** (comments cite DESKTOP-SOVEREIGN-STT-01 / D01 §XII — documents not located, §10) |
| H-2 first-party STT | auth · entitlements · daily quota. ⛔ **NONE FOUND** for provider egress or consent. `transcribe-simple` has auth only. |
| H-3 browser / OS STT | ⛔ **NONE FOUND** |
| H-4 admission guards | `__tests__/voice-non-degradation.test.ts` — non-degradation only; ⛔ **no authorization ruling found** for any individual guard |
| H-5 convergence | ⭐ `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` + the closed-set gate. **The strongest gate in this domain.** |
| H-6 turn commit seam | `__tests__/voice-transcript-commit.test.ts` — source-shape gate. ⛔ No ruling document found naming modality-independence as law (see §9). |
| H-7 TTS egress | `assertProviderQualified` (R15) · `cloudVoicePolicy` · `checkCloudConsent` — ⛔ **all three unreached on the archetype branch the member's turn actually takes** |
| H-8 re-listen consent | ⚠️ `lastSendWasVoiceRef` only; ⛔ no ruling document located |
| H-9 Class C utterances | ⛔ **NONE FOUND** — explicitly "proposed, for founder ruling", deferred |
| H-10 voice-path memory write | ⛔ **NONE FOUND** — see §8-C5 |

---

## 7 · Status under the LIVE calibration

```text
LIVE requires  a traced call path at the subject AND a dated runtime/production
               witness record in-repo. ⛔ Both, or it is not LIVE.
```

⚠️ **No in-repo dated runtime or production witness record was located for ANY
capability in this domain.** `docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md`
is a source-analysis record, not a runtime witness; `docs/architecture/` contains
no voice witness file; `docs/programme/` contains no voice witness file.

⚠️ `CLAUDE.md` asserts a dated production verification for the 2026-09-07 commit
repair (`12eb44281` live at 19:31:13Z; `voice-transcript-commit.test.ts` 6/6;
post-swap Co-Lab gate 33/0/0) and, in the same bullet, states: *"⛔ NOT YET
FALSIFIED BY A MEMBER … Deployed ≠ demonstrated."* Under **D-P1-06** the anchor is
operational/session evidence and cannot, by assertion, supply the witness record
the calibration requires. ⛔ Therefore **nothing in domain H is recorded LIVE.**

```text
EVERY CAPABILITY H-1 … H-10   WIRED-BUT-UNOBSERVED
EXCEPT
  streaming voice exit        SUPERSEDED (preserved, unreachable from voice)
  BetaMinimalMirror transcript DORMANT (no mount found)
  app/oracle/page.broken.tsx   ORPHANED
  lib/voice/*.DISABLED (3 files: MaiaRealtimeWebRTC, RealtimeSpiralogicBraid,
                        RealtimeVoiceService)  DORMANT by filename
```

⭐ *A traced import chain proves wiring. It does not prove participation, and it
never proves authorization.*

---

## 8 · CONTRADICTIONS — both sides, unreconciled

### C1 · ⭐⭐ MAIA'S DEFAULT VOICE PROVIDER

```text
SIDE A — lib/tts/cloudVoicePolicy.ts:1-:40 (VOICE-SOVEREIGNTY-01, "Founder canon
ruling, 2026-08-27"):
    DEFAULT LOCAL · AUTO LOCAL · CLOUD NOT AVAILABLE under current canon ·
    OPENAI FALLBACK FORBIDDEN
    "⛔ THE DEFAULT IS THE CANON. Cloud voice is forbidden unless
     MAIA_ALLOW_CLOUD_VOICE=1 is set explicitly. An unset variable, a fresh
     environment, a new deployment — all sovereign."
    + lib/tts/ttsRouter.ts:62-:67 — production-maia may select only ['auto','kokoro']
    + docker-compose.production.yml:176 — MAIA_TTS_PROVIDER: "kokoro"
      # Sovereign TTS — zero-OpenAI doctrine
    + CLAUDE.md — "Voice: Local TTS/STT or browser APIs only"

SIDE B — app/api/voice/openai-tts/route.ts:115, :128-:131 (the route maiaSpeak
and handleSpeakMessage actually call):
    "MAIA vow: default voice is always maia_core (OpenAI Alloy)."
    "If archetype routes to OpenAI (MAIA feminine voices), skip Kokoro entirely"
    + lib/voice/voiceArchetypes.ts:59 — provider = 'openai' unless
      MAIA_VOICE_OVERRIDE=kokoro
    + lib/voice/voiceArchetypes.ts:88, :92 — unset OR unknown archetype ⇒ OpenAI
    + MAIA_VOICE_OVERRIDE is ABSENT from docker-compose.production.yml
    + the archetype branch RETURNS before :202 (where MAIA_TTS_PROVIDER is read),
      before assertProviderQualified, and before checkCloudConsent
```

⭐ Both sides call themselves the vow. One says the default is sovereign-local and
cloud requires an explicit opt-in; the other says the default is OpenAI Alloy and
local requires an explicit opt-in. **The env var each depends on is set for one
side and absent for the other in the production compose file.**
⛔ Not reconciled. ⛔ No repair proposed. **REPAIR QUESTION MAY EXIST — NOT YET
AUTHORIZED.**

### C2 · D-P1-06 CONFLICT — STT/TTS LATITUDE (preserved, as instructed)

```text
SIDE A — CLAUDE.md: "STT/TTS are sensory infrastructure and may change freely;
         the mind may not be substituted."

SIDE B — docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md:87:
         "the ear may be improved freely; the mind may not be substituted."
         — the canon grants latitude to the EAR ONLY. The mouth is absent from
         that sentence, and TTS is in fact gated in code (§4: R15 allowlist,
         cloudVoicePolicy, checkCloudConsent, voice_fallback_events audit).

WHAT THE CODE GATES
  TTS   deployment-qualification allowlist (fail-closed), cloud-voice canon
        module, per-member cloud consent, usage limits, length cap, audit table
        — ⚠️ and a branch that reaches none of the first three.
  STT   auth on the two first-party routes; entitlements + quota on one of them.
        ⛔ NO provider qualification. ⛔ NO consent gate. ⛔ NO audit of which ear
        heard the member. ⛔ Nothing at all on the OS and browser recognizers.
```

⭐ **The code gates the mouth and does not gate the ear — the exact inverse of the
latitude CLAUDE.md grants and the opposite of the asymmetry the canon states.**
⛔ Preserved. ⛔ Not reconciled. Under D-P1-06 this is a recorded defect, not
census law.

### C3 · THE NON-DEGRADATION GATE READS GREEN ON A SYSTEM THAT NEVER SPEAKS

```text
SIDE A — __tests__/voice-non-degradation.test.ts asserts convergence: one
         cognition call, reached once, with nothing before it.
SIDE B — convergence says nothing about EGRESS. The 2026-09-07 defect —
         cognition completes and the member receives nothing in either channel —
         left this gate GREEN throughout, because the defect lived downstream of
         the convergence it certifies.
```

⭐ **VERIFIED AT THE SUBJECT: the repair exists and the gap is structurally
closed** — six terminal paths, one idempotent seam, watchdog-armed before the
await (§3). ⭐ **But the gate that closes it is a SECOND, SEPARATE gate**
(`voice-transcript-commit.test.ts`), and the non-degradation gate is still green
independently of it. P1-01's finding — *the non-degradation gate reads green on a
system where cognition completes and the member receives nothing* — is
**structurally TRUE of that gate at the subject**; the condition it describes is
now covered by a different instrument. Both halves recorded.

### C4 · SOVEREIGNTY OF THE EAR

```text
SIDE A — app/api/voice/transcribe-simple/route.ts:11-:14 and transcribe/route.ts:27:
         "inbound member audio never leaves the host", "never OpenAI cloud".
SIDE B — the DEFAULT transport for Chrome and Safari members is `web-speech`
         (platformDetection.ts:129), where recognition is performed by the browser
         vendor off-device. ContinuousConversation.tsx:711 refuses Web Speech on
         DESKTOP only, by shell classification — every ordinary browser member
         keeps it.
```

⛔ Both sentences are true of different transports. Neither is qualified in the
other's presence. ⛔ Not reconciled.

### C5 · SANCTUARY AND THE VOICE PATH

```text
FOUND    four saveConversationMemory call sites in OracleConversation.tsx —
         :5120 (text turn), :6382 and :6428 (response, voice and chat),
         :7325 (member voice utterance, sourceType:'voice', role:'user').
         ⛔ NONE is gated on isSanctuary, and lib/services/memoryService.ts
         (the definition, :28) contains no occurrence of 'sanctuary' in any case.
AGAINST  CLAUDE.md Sanctuary Mode invariant 1: "No content retention — Sanctuary
         sessions are not stored, indexed, or used for pattern formation"; and
         invariant 6: "Absolute boundary".
SCOPE    ⚠️ This is MODALITY-SYMMETRIC — the typed path is identical. It is
         therefore NOT a voice-versus-typed divergence and NOT a non-degradation
         breach. It is recorded here because the trace passes through it, and it
         is routed to whichever domain owns Sanctuary.
```

⛔ Not repaired. ⛔ Not reconciled. **REPAIR QUESTION MAY EXIST — NOT YET
AUTHORIZED.**

### C6 · CITATION COORDINATES

Canon names the convergence at `:7268`; it is at `:7397`. The exit map and the
non-degradation test header both name the crisis script at `:6712`; it is at
`:6854`. The canon flags a stale comment at `:7266`; **that comment is still
present at `:7395`**, still reading `Browser STT → /api/between/chat → Browser
TTS` — naming one of four transports and a route `/maia` does not use, sitting
directly above the convergence call. ⛔ Recorded; not edited.

---

## 9 · UNLOCATED GOVERNANCE

| # | what is invoked | where invoked | search result |
|---|---|---|---|
| U1 | **MODALITY INDEPENDENCE (founder ruling 2026-08-13)** — cited by name at `OracleConversation.tsx:6447` ("member INPUT modality and MAIA OUTPUT modality are orthogonal. All four cells must be real") and again at `:6347` | code comments only | ⛔ **NO document found under `docs/canon/**` or `docs/programme/**` bearing this ruling.** P1-01's "MODALITY INDEPENDENCE is UNLOCATED in governance" is **CONFIRMED AT THE SUBJECT.** The law is carried by a comment and by one source-shape test. |
| U2 | **DESKTOP-SOVEREIGN-STT-01 · S1/S4 · S11** | `ContinuousConversation.tsx:3390`-`:3396` | ⛔ not located |
| U3 | **D01 §XII** ("SpeechRecognition refused on Desktop — sovereign Whisper transport only") | `ContinuousConversation.tsx:711` | ⛔ not located |
| U4 | **Refusal R15** (the TTS deployment-qualification refusal) | `lib/tts/ttsRouter.ts:35` | registry referenced by the exit map (`:112`) but the R15 entry itself was not read in this domain — ⚠️ named-but-unverified |
| U5 | **docs/adr/012** — cited as the governance question for OpenAI cloud egress | `lib/tts/ttsRouter.ts:43` | ⚠️ not opened in this domain — named-but-unverified |
| U6 | **VOICE-SOVEREIGNTY-01 · "Founder canon ruling, 2026-08-27" (both passes)** | `lib/tts/cloudVoicePolicy.ts:1`-`:19` | ⚠️ the ruling exists only as a doctrine block **inside the module it governs**. No separate canon document located. A module that states its own authorising ruling is the only record of that ruling. |
| U7 | **the Class C ruling** | exit map `:78`-`:82` | ⛔ explicitly "Proposed … for founder ruling", deferred. **Still unruled at the subject.** |
| U8 | governance of the **ghost-phrase list** — 21 hard-coded strings (`OracleConversation.tsx:7233`-`:7251`) that refuse a member's utterance on CONTENT | — | ⛔ **NONE FOUND.** A member who says "thanks for watching" or "before we begin" or "let's get started" is refused before cognition, silently. |
| U9 | governance of the **`t.length < 50` standalone-command heuristic** (`:7155`) — a length threshold deciding whether an utterance becomes a member turn | — | ⛔ **NONE FOUND** |

---

## 10 · NAMED-BUT-UNVERIFIED ARTIFACTS

| named | by | verified at subject |
|---|---|---|
| `components/OracleConversation.tsx` | CLAUDE.md, canon | ✅ EXISTS (11,142 ln) |
| `__tests__/voice-non-degradation.test.ts` | CLAUDE.md | ✅ EXISTS (523 ln, 15 cases) — read, ⛔ NOT RUN |
| `__tests__/voice-transcript-commit.test.ts` | CLAUDE.md | ✅ EXISTS (95 ln, 6 cases) — read, ⛔ NOT RUN |
| `docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md` | test header | ✅ EXISTS |
| `hooks/useStreamingVoice.ts` | test `:494`-`:500` | ✅ EXISTS |
| `app/api/voice/stream-conversation/route.ts` | test `:494`-`:500` | ✅ EXISTS |
| `lib/voice/` | task | ✅ EXISTS — **119 entries**, incl. 3 `.DISABLED`, a committed `VoicePreprocessor.js` + `.js.map` beside its `.ts`, and 13 subdirectories |
| `lib/tts/` | task | ✅ EXISTS (9 files + `providers/`, `__tests__/`) |
| `lib/audio/` | task | ✅ EXISTS (5 files) |
| `lib/webrtc/` | task | ✅ EXISTS — **one file**, `signalRelay.ts` |
| `lib/sesame/` | task | ✅ EXISTS — **one file**, `presence-layer-architecture.ts` |
| `lib/northflankSesame.ts` | task | ✅ EXISTS (3,173 bytes) |
| `docs/adr/012` | `ttsRouter.ts:43` | ⚠️ UNVERIFIED |
| Refusal Registry R13 / R15 entries | exit map, ttsRouter | ⚠️ UNVERIFIED in this domain |
| DESKTOP-SOVEREIGN-STT-01, D01 §XII | ContinuousConversation | ⛔ NOT LOCATED |
| the 2026-08-13 modality-independence ruling | OracleConversation comments | ⛔ NOT LOCATED |
| dated runtime/production witness for any H capability | — | ⛔ NOT LOCATED (§7) |

⚠️ `lib/voice/` holds **119 entries** against a handful reached from the traced
path. Reachability of the remainder (`aethericOrchestrator`, `moshi/`,
`personaplex/`, `MaiaRealtimeClient*`, `ElementalVoiceOrchestrator`,
`UnifiedVoiceOrchestrator`, `MayaHybridVoiceSystem`, …) was **not traced** — it is
outside this domain's question and is flagged for P1-04 rather than guessed at.

---

## 11 · OPEN QUESTIONS FOR P1-04

1. **C1 is the domain's load-bearing contradiction.** Which is MAIA's voice vow —
   `cloudVoicePolicy`'s "the default is the canon, cloud is forbidden unless
   explicitly permitted", or `openai-tts/route.ts`'s "MAIA vow: default voice is
   always maia_core (OpenAI Alloy)"? Both call themselves the vow; the production
   compose sets the env var one of them needs and omits the other's.
2. **Should an egress gate that exists be reachable on the path the member
   actually takes?** `assertProviderQualified`, `assertCloudVoiceAllowed` and
   `checkCloudConsent` all exist, are tested, and are all skipped by the archetype
   branch. ⛔ P1-02 does not answer this.
3. **Is the ear governed at all?** There is no STT analogue of R15 — no allowlist,
   no consent, no audit, no refusal class. Is that an absence to be ruled on, or
   a deliberate reading of "browser APIs only"?
4. **U1 — where does modality independence live?** A founder ruling cited twice in
   code comments, enforced by one source-shape test, and located in no document.
5. **U7 — the Class C ruling has been deferred through at least two units.** Eleven
   first-person utterance sites, one of them a crisis script spoken outside every
   guard. "Frozen is not blessed" is explicit; frozen is also where it has stayed.
6. **U8/U9 — silent content-based refusal.** Twenty-one hard-coded phrases and a
   50-character heuristic decide whether a member's spoken words become a turn,
   with no governance and no surface to the member.
7. **Does the canon's convergence section need to be re-pinned by OPERATION only?**
   Three of its coordinates have drifted while every operation held. The canon's
   own D1 discipline answers this; the canon text has not been updated to follow it.
8. **C5 — Sanctuary and conversation memory.** Four unconditional write sites, one
   of them on the member's spoken utterance. Routed out of this domain, not
   repaired, not reconciled.
9. **Is `lastSendWasVoiceRef` initialising `true` correct?** Before the member has
   spoken once, the default posture is "voice was the last modality."
10. **The 119-entry `lib/voice/` surface.** How much of it participates, and how
    much is dormant? Not traced here.

---

```text
DOMAIN H · COMPLETE
AUTHORITY EXERCISED   READ · TRACE · CLASSIFY
⛔ NO FILE EDITED except this record.
⛔ NO TEST RUN. NO BUILD. NO MIGRATION. NO DEPLOY.
⛔ NO REPAIR PROPOSED. NO CONTRADICTION RECONCILED.
⛔ NO COGNITION RE-CENSUSED — the seam is named at §1 and handed to domain A.
```
