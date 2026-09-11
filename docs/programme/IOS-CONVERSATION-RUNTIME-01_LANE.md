# IOS-CONVERSATION-RUNTIME-01 — Deterministic Speak ↔ Listen Lifecycle

**Status (2026-09-11, E5):** C′ CONFIRMED — ONE REPAIR AUTHORIZED AND
APPLIED ON THIS BRANCH (`claude/ios-runtime-01-audiosession-registration`,
fresh from `clean-main-no-secrets` at `e1c6f527b`) — DEVICE ACCEPTANCE
PENDING (§7.3). This copy of the lane document is canonical from here;
the copy on the custody branch `claude/voice-recognition-acceptance-witness-ffeadt`
is frozen at E4.

*Superseded opening status:* OPENED AS A LANE DOCUMENT — DIAGNOSTIC CAPTURE
PENDING — **NO BUILD AUTHORIZED YET.** Build begins only after the
calibrated Console capture (`VOICE-RECOGNITION-ENGINE-01_LANE.md` §13.4)
names a locus and the founder authorizes exactly one locus-specific repair.
The runtime rebuild described in §3–§4 is this lane's mandate thereafter,
gated by §6 sequencing and §5 acceptance.

Predecessor: `docs/programme/VOICE-RECOGNITION-ENGINE-01_LANE.md` (suspended
at §13). Founder ruling that opened this lane: 2026-09-11, recorded there.

---

## 0 · Governing sentence

> Rebuild the conversation audio runtime and state authority so that MAIA
> always knows whether she is listening, thinking or speaking, and every
> state has a deterministic way out.

Not "fix the mic." Not "patch the timeout." Not the whole iOS app.

## 1 · Why this lane exists — the defect as witnessed

On the iPhone 16 Pro Max (iOS 26.6.1), beta bundle `5846a0824` over native
`73d0df30d` (§12.10 of the predecessor): the member speaks, is transcribed,
MAIA's reply renders as text with no spoken audio, and the microphone does
not return to listening. A tap on the orb does nothing. After roughly
90–120 seconds the app returns to listening — because
`components/OracleConversation.tsx` (`[voice:watchdog]`, ~line 2869) forces
a reset after `AUDIO_STUCK_TIMEOUT_MS = 90000` / `PROCESSING_STUCK_TIMEOUT_MS
= 120000`, not because anything recovered. The symptom family predates the
predecessor lane (prior voice-loop testing; an August 30 engineering note on
a response completing without audio and the consequences for re-arming).
Attribution to any single changed surface is unresolved.

Founder's reading: *too many layers each doing something reasonable
locally, with no single component owning the whole turn.* JS, TTS
playback, the community speech-recognition plugin and the native
`AudioSessionManager` each take decisions about the audio session and the
microphone lifecycle.

## 2 · Target

```text
HUMAN SPEAKS
    ↓
LISTENING
    ↓
TURN CLOSES
    ↓
MAIA THINKS
    ↓
MAIA SPEAKS
    ↓
SPEECH ENDS
    ↓
LISTENING

EVERY TIME
```

**There must be no legitimate state in which the app waits indefinitely for
an event that might never arrive.**

## 3 · Invariants (founder, 2026-09-11)

1. **One owner of audio-session transitions.** JS, TTS, community
   recognition and native recognition cannot independently decide
   microphone / audio-session lifecycle.
2. **Explicit states, not inferred states.**

   ```text
   idle
   listening
   closing_turn
   thinking
   preparing_to_speak
   speaking
   rearming
   listening
   ```

3. **Every transition has success, failure and timeout.** If TTS produces
   no audio: `speaking requested → TTS fails / silent / no completion event
   → bounded timeout → rearm listening anyway`.
4. **`prepareForListening()` and `prepareForSpeaking()` are idempotent.**
   Calling either twice cannot strand the audio graph.
5. **The orb remains sovereign.** If the system believes MAIA is still
   speaking and the member taps the orb, the member's explicit act must be
   capable of forcing a lawful re-entry to listening — not "ignore the tap
   until a stale timeout expires."
6. **TTS completion is not the sole authority for microphone re-entry.**
   (Directly responsive to the witnessed symptom.)
7. **Runtime telemetry describes the transition.** For every turn:

   ```text
   speaking requested
   audio session configured
   playback began / did not begin
   playback ended / timed out
   rearm requested
   audio session configured for record
   recognizer started
   first audio buffer received
   first transcript produced
   ```

   Then these bugs stop being séance work.

## 4 · Architecture geometry (long-term)

```text
                 MAIA Conversation
                        │
                        ▼
              ConversationAudioCoordinator
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
      TTS OUTPUT                 MIC CAPTURE
          │                           │
          │                    RecognitionEngine
          │                    baseline / modern
          └─────────────┬─────────────┘
                        │
                 AVAudioSession
                 ONE AUTHORITY
```

The community speech plugin (`@capacitor-community/speech-recognition`) may
remain as a temporary fallback during migration; it must not remain a
second owner of the audio lifecycle. The predecessor's engine-neutral
`RecognitionEngine` boundary and `lib/voice/recognition/humanTurnAuthority.ts`
(sole owner of human turn `open|complete`) carry forward unchanged in
role: `TURN CLOSES` in §2 is that authority, not recognizer finality.

## 5 · Acceptance — brutal, before the rebuilt runtime replaces anything

```text
20 consecutive ordinary turns
10 deliberate long pauses
10 silent/failed-TTS simulations
10 rapid orb re-entries
background → foreground
phone lock → unlock
ringer mute / unmute
Bluetooth connect / disconnect
TTS → mic transition repeatedly
mic → TTS transition repeatedly

ZERO stranded states
ZERO "wait and it eventually fixes itself"
ZERO Kelly rescue
```

Same-device, relayed, recorded here with the two-layer header
(`NATIVE SUBJECT` / `WEB BUNDLE`) inherited from the predecessor §12.7.
Then — and only then — the SpeechAnalyzer comparison
(`VOICE-RECOGNITION-ENGINE-01` Probe / A-B) resumes.

## 6 · Sequencing (each step a STOP on failure; each build step needs its own ruling)

1. **Calibrated capture** — predecessor §13.4: positive control, reproduce,
   three taps, read A/B/C/D. No source change. Output is this lane's first
   evidence entry (§9).
2. **Exactly one locus-specific repair**, authorized by founder ruling on
   the capture. Bounded to the locus the capture names. Witnessed by the
   same S1–S4 walk. Not a mitigation that masks the failure (the watchdog
   shortening is explicitly deferred — §8).
3. **Runtime rebuild** per §3–§4: coordinator + explicit state machine +
   telemetry. Scope and file plan authored as §7 before any code.
4. **Acceptance** per §5.
5. **Resume the predecessor witness** (Probe / A-B) on the rebuilt runtime.

## 7 · Surfaces (map, not a plan — plan is authored at step 3)

| layer | surface | role today |
|---|---|---|
| web | `components/OracleConversation.tsx` — voice state, `handlePlaybackSignal`, `[voice:watchdog]` | inferred states, watchdog recovery |
| web | `lib/voice/AudioSessionManager.ts` (`VoiceController.prepareForListening/Speaking`) | JS-side caller of native transitions |
| web | `lib/audio/ttsWithFallback.ts`, streaming voice playback | TTS playback; completion signals |
| web | `@capacitor-community/speech-recognition` binding (live mic) | second owner of the session today |
| native | `ios/App/App/AudioSessionManager.swift` | session category / activation / full teardown |
| native | `ios/App/App/VoiceController.swift`, `ios/App/App/Recognition/*` | engine-neutral recognition boundary (predecessor) |
| contract | `lib/voice/recognition/humanTurnAuthority.ts` | human turn `open|complete` — unchanged |

## 8 · Held, deferred, not authorized

- **Watchdog resilience ruling** — 90–120 s is too long for a
  conversational product even after the root cause is fixed; separate
  ruling later; not now, because shortening it before the locus is known
  masks the failure.
- **Web mitigation (re-arm on playback failure)** — same reason.
- **Native revert of the predecessor's `AudioSessionManager.swift` edit** —
  unattributed; not authorized.
- **Production recognition routing / `legacy_until_witnessed`** — unchanged.
- **Any new diagnostic surface** — P12 stands; telemetry in §3.7 is
  runtime logging, not a page.

## 9 · Evidence log

### E1 · 2026-09-11 · first unified-log archive from the phone — instrument PARTIALLY calibrated, no classification yet

**Instrument.** `sudo log collect --device --start "2026-09-10 21:10:00"` on
the Mac (phone on USB) → `~/voice-witness-logs/phone2.logarchive`, covering
≈21:10 → ≈22:16 device time, which contains the §12.11 turns (screenshots
21:18, 21:24). The earlier `--last 20m` archive (21:55–22:15) held no voice
activity and is not evidence either way.

**Result.**

| query | count | meaning |
|---|---|---|
| `eventMessage CONTAINS[c] "AudioSessionManager" OR "teardown" OR "prepareFor"` | 172 lines, **0** from MAIA's native plugin | all matches are Apple processes (`cameracaptured`, `passd`, `CommCenter`, `corespeechd`) or WebKit `HTMLMediaElement::prepareForLoad` inside the App process |
| `process == "App" AND (coreaudio ∨ speech ∨ AVAudioSession)` | **18,387** | the app's Apple-side audio-session and speech traffic in the window is fully visible |

**What this does and does not establish.**

- The archive covers the turns and the phone persisted the app's Apple
  audio/speech logging. The instrument is not blind to the app's audio path.
- **Not one `[AudioSessionManager] …` line exists in the window** — not in
  a healthy turn, not in the stall. Two readings remain open and the next
  command separates them: (i) MAIA's `NSLog` output from the main binary
  is not persisted in this archive (then this instrument is D for MAIA's
  native lines specifically); (ii) the native `prepareForSpeaking` /
  `prepareForListening` were never invoked on the live path in any turn —
  which, if true, would mean the web wrapper's call never reaches the
  plugin and the predecessor's native edit is not on the executed path at
  all. Neither is inferred yet.
- WebKit `HTMLMediaElement::prepareForLoad … gesture = 1` lines from the
  App process cluster at 21:14:30, 21:14:41, 21:21:41, 21:34:43–49 — the
  web layer creating/loading audio elements. Recorded, not interpreted.

**Calibration step still required** (predecessor §13.3: absence needs a
calibrated instrument): count lines whose *sender* is MAIA's own binary
(`App.debug.dylib` in a Debug build, or `App.app/App`). If that count is
>0, `NSLog` is persisted and the absence of `[AudioSessionManager]` lines is
admissible. If 0, MAIA-native lines are invisible to `log collect` and the
Xcode console is the instrument for them.

**Classification: NONE YET.**

## 10 · Governance

- **Deep-Intelligence Gate** applies: this lane changes the capture and
  speech path; it may not change the mind. Spoken and typed turns converge
  where `__tests__/voice-non-degradation.test.ts` pins them.
- **Sovereignty check**: §3.5 is the agency invariant — the member's act
  outranks the system's belief about its own state. No feature in this lane
  may make the orb less responsive to the member than it is today.
- **Claim discipline**: nothing in this document is Live. §2–§5 are Design.

### E2 · 2026-09-11 · calibration result — MAIA's native audio plugin is NOT REGISTERED in the installed build

**Sender calibration (Mac, relayed).** Lines in the archive whose sender is
MAIA's own binary (`App.debug.dylib` / `App.app/App`): **0** (header only).
So the archive holds nothing emitted by MAIA's native code at all — healthy
turn or stalled turn. By the letter of predecessor §13.3 that alone is
reading **D** for MAIA-native lines. The next artefact explains the zero.

**Installed build's Capacitor config (Mac, relayed).**
`/Users/soullab/maia-ds01-witness/ios/App/App/capacitor.config.json` —
the file `cap sync` generated for the build that went onto the phone —
carries this `packageClassList`:

```text
SignInWithApple, BluetoothLe, SpeechRecognition, AppPlugin, ClipboardPlugin,
FilesystemPlugin, HapticsPlugin, LocalNotificationsPlugin, SharePlugin,
SplashScreenPlugin, StatusBarPlugin, GoogleAuth, VoiceRecorder
```

**`AudioSessionManager` and `VoiceController` are absent**, although
`capacitor.config.ts` (line 39) declares both, with the comment *"Custom iOS
plugins that need explicit registration."* The CLI regenerates
`packageClassList` from the installed npm plugins at every sync and the
in-app classes are dropped.

**Repo-side facts (this checkout).**

- Capacitor core/iOS is `^8.0.2`. `AudioSessionManager.swift` was
  introduced in `1fa816177` (2026-01-21) on `^6.1.2`. From Capacitor 5
  onward an in-app Swift plugin is loaded only if it is named in the
  generated `packageClassList` or registered in a `CAPBridgeViewController`
  subclass.
- `Main.storyboard` uses the stock `CAPBridgeViewController`; no subclass,
  no `registerPluginInstance`, no `capacitorDidLoad` in `ios/App/App`.
- No legacy Objective-C `CAP_PLUGIN` registration exists for it.
- The web wrapper `lib/voice/AudioSessionManager.ts` catches the rejection,
  logs `[VoiceController] prepareForSpeaking error:` to the *web* console,
  returns `false`, and `OracleConversation.tsx` (~1977) continues to TTS
  regardless (`prepareForSpeaking timed out — continuing`).

**Finding.** In the installed build (NATIVE SUBJECT `73d0df30d`, WEB
`5846a0824`) the native `AudioSessionManager` plugin — the self-described
"iOS Audio Session Gatekeeper" — is not registered with the Capacitor
bridge. `prepareForSpeaking` / `prepareForListening` never reach Swift.
`performFullTeardown()` never runs. The audio session on the live path is
governed only by WebKit's media playback and by
`@capacitor-community/speech-recognition`. The periodic
`AVAudioSession … Activated session 0x6ff68` lines (every ≈0.7 s / ≈2.3 s
from 21:14:42) are that plugin and WebKit, not MAIA's native code.

**Consequence for attribution (proposed, founder rules).**

- The predecessor's `AudioSessionManager.swift` edit is **not executed** on
  the live path of the witnessed build. It cannot be the cause of the
  stall. The shared-seam question of ENGINE-01 §12.11 is answered for this
  build: the seam is inert, not damaged.
- Because the generated list is rewritten on every sync, the plugin has
  most probably been unregistered in every synced build since its
  introduction (inference; a historical `capacitor.config.json` would
  confirm). The prior symptom family (§1) occurred with the gatekeeper
  inert.
- Proposed classification: **C′** — no act, healthy or stalled, reaches
  MAIA's native audio layer, because that layer is not registered. Locus:
  web / TTS playback lifecycle and the community recognizer's session
  ownership. Not A (no native transition to fail), not B (no native
  transition completed), not the letter of D (the zero is explained
  structurally).

**Confirmations requested before the ruling (no construction):**
(1) CLI source on the Mac showing `packageClassList` is written by the
CLI; (2) Safari Web Inspector on the phone, one turn, console filtered
`VoiceController`, expecting the "not implemented on ios" rejection;
(3) clock times of the healthy turn, the stall, and the recovery for the
record.

**E2 confirmations received (Mac, relayed).** (2) The main checkout's
generated `ios/App/App/capacitor.config.json`, dated **Aug 27 10:59** —
a sync from before the predecessor lane existed — also contains **0**
occurrences of `AudioSessionManager`. The plugin was unregistered in that
earlier build too; the "inert since introduction" inference now has a
second data point. (1) `grep packageClassList` in
`@capacitor/cli/dist/ios/update.js` returned nothing; the list is written
elsewhere in the CLI — a broader grep is requested. (3) Web Inspector
runtime proof pending. (4) clock times pending.

**E2 confirmation (1) received.** `@capacitor/cli/dist/util/iosplugin.js:53`:
`capJSON['packageClassList'] = classList;` — the CLI assigns the list
from the npm plugins it detects, replacing whatever `capacitor.config.ts`
declared. Confirmed: the declared in-app classes cannot survive a sync.

### E3 · 2026-09-11 · closure from the installed artefact itself

Mac, relayed, no phone interaction, on the exact `.app` that `devicectl`
installed (§12.10 of the predecessor):

| check | result |
|---|---|
| `App.app/capacitor.config.json` — occurrences of `AudioSessionManager` | **0** |
| `App.app/capacitor.config.json` — `packageClassList` | the same 13 names as E2; no `AudioSessionManager`, no `VoiceController` |
| `strings App.app/App.debug.dylib \| grep -c AudioSessionManager` | **25** — the Swift class is compiled into the binary |
| `@capacitor/cli/dist/util/iosplugin.js:53` | `capJSON['packageClassList'] = classList;` — the list is CLI-generated |
| main checkout's generated config, Aug 27 | also 0 — pre-lane build likewise unregistered |

**Chain.** The code is in the app. The loader's list never carries its
name. No other registration path exists in the app target. Therefore the
native `AudioSessionManager` plugin is never instantiated by the Capacitor
bridge in this build, and (Aug 27 data point) was not in the pre-lane
build either. `prepareForListening` / `prepareForSpeaking` from the web
layer reject; the wrapper returns `false`; the conversation proceeds
without any native audio-session governance. Whatever governs the session
on `/maia` is WebKit plus `@capacitor-community/speech-recognition`.

One optional confirmation remains: the Capacitor iOS runtime reading
`packageClassList` at bridge start. The pod is consumed via `:path`, so
it lives under `node_modules/@capacitor/ios`, not `Pods/`. A live console
showing the "not implemented" rejection is now confirmation, not a gate.

**Classification proposed for the founder's ruling: C′** — no act,
healthy or stalled, reaches MAIA's native audio layer, because the layer
is not loaded. Attribution consequence unchanged from E2: the predecessor's
Swift edit is not on the executed path and cannot be the cause of the
stall; the locus is the web/TTS playback lifecycle and the community
recognizer's ownership of the session. The clock times for the 21:1x
turns were not recorded by the founder; the WebKit `prepareForLoad`
clusters (E1) stand in as the timeline.

**E3 optional confirmation received.** Capacitor iOS runtime,
`node_modules/@capacitor/ios/Capacitor/Capacitor/CapacitorBridge.swift:313`:
`for plugin in registrationList.packageClassList { … }` — the bridge
registers exactly the classes named in that list (line 9:
`let packageClassList: Set<String>`). The loader reads the list the CLI
wrote; the list omits the plugin; the plugin is never registered.
**Chain closed at every link: CLI → generated config → bundled config →
runtime loader → binary contains the unloaded class.** Awaiting the
founder's ruling on C′.

### E4 · 2026-09-11 · founder observation — "it's working now after 5 rounds"

Same installed artefact, nothing changed on the device or in source. After
about five turns the voice loop is voicing replies and returning to
listening. Recorded as stated. Consistent with the predecessor §12.12
characterization ("resolves itself with time") and with a warm-up-shaped
fault on the web/TTS side; not evidence of repair, since none was applied,
and not evidence against C′. The stall is intermittent; a working stretch
is expected within the same session.

*Addendum, later the same evening:* founder — *"we have been jamming for
5 minutes and it is jamming!"* — a continuous multi-minute voice
conversation on the same unrepaired build. Recorded as the longest healthy
stretch observed. It does not change E5 or §7: the plugin is still
unregistered in that build, so this stretch is the WebKit + community
recognizer path working on its own, which is exactly the intermittent
baseline the repair will be compared against.

*Gate note at commit time:* `npm run typecheck` on this branch reports one
NEW diagnostic, `app/wisdom-keepers/sacred-texts/page.tsx:207` (TS2322).
That file is untouched by this branch and the diagnostic is present on
`clean-main-no-secrets` at `e1c6f527b`; it is not absorbed into the
baseline here and belongs to whoever landed that page. This branch adds
one `.ts` file (the gate test) and three iOS files; the no-regression
comparison is otherwise 11 errors better than baseline.

### E5 · 2026-09-11 · founder ruling — C′ confirmed, one repair authorized

```text
RUNTIME-01

C′ CLASSIFICATION       ACCEPTED → CONFIRMED (runtime-loader link closed)
NATIVE SWIFT BLAME      EXCLUDED for witnessed build
ROOT CAUSE              NOT YET CLAIMED
ACTIVE LOCUS            WebKit + community recognizer   (remaining locus, not proven mechanism)

REPAIR                  AUTHORIZED
                        register AudioSessionManager
                        at the native Capacitor bridge seam

BRANCH                  fresh from clean-main-no-secrets

VOICE CONTROLLER        UNTOUCHED
WEB/TTS MITIGATION      NOT AUTHORIZED
WATCHDOG CHANGE         NOT AUTHORIZED
RUNTIME REBUILD         NOT YET AUTHORIZED
PRODUCTION              UNTOUCHED
```

Founder's wording boundary, preserved: *"WebKit + `@capacitor-community/speech-recognition`
are the remaining executed audio actors. That is established. 'The stall
is caused by WebKit/community recognizer lifecycle' is not yet established."*
And: *code present, runtime registration absent.* Prohibitions in the act:
no hand-edit of the generated `capacitor.config.json` / `packageClassList`;
no TTS lifecycle change; no community-recognizer change; no watchdog
change; no `VoiceController` / `RecognitionEngine` change; no
coordinator/state-machine rebuild; no production routing change.
`VoiceController` is another missing in-app plugin and is deliberately not
registered in this act.

## 7 · The one repair (applied on this branch)

### 7.1 Change

| file | change |
|---|---|
| `ios/App/App/MAIABridgeViewController.swift` | **new.** `class MAIABridgeViewController: CAPBridgeViewController`; `capacitorDidLoad()` calls `bridge?.registerPluginInstance(AudioSessionManager())` and logs one `NSLog` line. Registers nothing else. |
| `ios/App/App/Base.lproj/Main.storyboard` | the scene's view controller `customClass` changes from `CAPBridgeViewController` (module `Capacitor`) to `MAIABridgeViewController` (module `App`, `customModuleProvider="target"`). |
| `ios/App/App.xcodeproj/project.pbxproj` | the new file added as `PBXFileReference` + `PBXBuildFile`, to the `App` group, and to the `Sources` build phase (IDs `A8D00016…` / `A8D00017…`, previously unused). |
| `__tests__/ios-bridge-registration.test.ts` | **new gate**, 5 assertions: subclass + `capacitorDidLoad` registration; `VoiceController` NOT registered; storyboard instantiates the subclass; file in the Sources phase; the Swift `jsName` equals the name the web layer binds. Passing 5/5. |

Why this path: `CapacitorBridge.swift:313` registers the classes named in
`packageClassList`, and `@capacitor/cli/dist/util/iosplugin.js:53`
overwrites that list from npm plugins on every sync. A
`CAPBridgeViewController` subclass calling `registerPluginInstance` is
Capacitor's documented mechanism for in-app plugins and lives in files
`cap sync` never touches (Swift source, storyboard, pbxproj). The
generated config is not edited. `capacitor.config.ts`'s declared list is
left as is; it is inert and now documented as such here.

Not changed: `AudioSessionManager.swift` (the pre-lane version on the
default branch, with `SFSpeechAudioBufferRecognitionRequest` — that is the
code that will now execute), `lib/voice/AudioSessionManager.ts`,
`OracleConversation.tsx`, TTS, the community recognizer, watchdogs,
`VoiceController`, production routing.

### 7.2 What activating this code means

`prepareForSpeaking` / `prepareForListening` will now reach Swift on every
reply and every mic start. That code performs a **full teardown** of a
private `AVAudioEngine` and then sets the session category and activates
it. It has never run on `/maia` before. Two behaviours are therefore
possible on the device and both are legitimate outcomes (founder ruling):

```text
stall disappears
→ registration defect was causally sufficient
→ proceed from that evidence

stall remains (or changes shape)
→ C′ remains true historically
→ native path is now active
→ capture the new failure and locate it
→ do not infer that registration "failed"
```

A third possibility is named so it is not mistaken for either: the newly
active native teardown interacts with the community recognizer's own
session (two owners, Invariant 1 unmet by design of the current code).
That would be new evidence for §3–§4, not a reason to revert this act.

### 7.3 Acceptance for this repair (founder, verbatim)

```text
AudioSessionManager compiled          YES
AudioSessionManager registered        YES
cap sync does not erase registration  YES
web prepareForSpeaking call           reaches Swift
web prepareForListening call          reaches Swift
native runtime trace                  visible on healthy turn
same S1–S4 voice walk                 performed
```

"The repair does not pass merely because the app builds."

### 7.4 Mac runbook (no trailing comments on any line)

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/ios-runtime-01-audiosession-registration
git worktree add /Users/soullab/maia-runtime-01 origin/claude/ios-runtime-01-audiosession-registration
cd /Users/soullab/maia-runtime-01
git rev-parse --short HEAD
npm ci
CAPACITOR_MODE=beta scripts/build-ios-static.sh build
CAPACITOR_MODE=beta npx cap sync ios
grep -c AudioSessionManager ios/App/App/capacitor.config.json
grep -c MAIABridgeViewController ios/App/App/Base.lproj/Main.storyboard
git status --short
cd ios/App
pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination generic/platform=iOS -allowProvisioningUpdates -derivedDataPath ~/voice-runtime01-dd build 2>&1 | tail -3
strings ~/voice-runtime01-dd/Build/Products/Debug-iphoneos/App.app/App.debug.dylib | grep -c MAIABridgeViewController
xcrun devicectl device install app --device A0736AC8-793B-516F-AC72-C076DB6CEE38 ~/voice-runtime01-dd/Build/Products/Debug-iphoneos/App.app
xcrun devicectl device process launch --device A0736AC8-793B-516F-AC72-C076DB6CEE38 life.soullab.maia
```

Expected: the first `grep -c` prints `0` (generated list still omits the
plugin — that is the point: registration no longer depends on it); the
second prints `1`; `git status` clean; `BUILD SUCCEEDED`; `strings` count
> 0. Then on the phone: one healthy turn, then S1–S4, ringer loud. Then
on the Mac, within 20 minutes:

```bash
sudo log collect --device --last 20m --output ~/voice-witness-logs/runtime01.logarchive
log show ~/voice-witness-logs/runtime01.logarchive --predicate 'eventMessage CONTAINS "AudioSessionManager" OR eventMessage CONTAINS "MAIABridgeViewController"' --info --debug --style compact
```

Expected at launch: `[MAIABridgeViewController] registered in-app plugin:
AudioSessionManager`. Expected per turn: `[AudioSessionManager] …` lines
from `prepareForListening` / `prepareForSpeaking` / `Performing full
teardown`. If the launch line appears and the per-turn lines do not, the
web wrapper is not calling the plugin — a different finding, record it.
If neither appears but the app runs, use the Xcode console (Run from the
`maia-runtime-01` workspace) before concluding anything: `NSLog` visibility
in `log collect` is itself unproven for this app (E2).

### 7.5 Record format for §9

```text
NATIVE SUBJECT: <this branch SHA>
WEB BUNDLE: beta static export at <same SHA>
APP VERSION / BUILD / DEVICE / iOS / XCODE / SDK / LOCALE / INSTALL METHOD
LAUNCH LINE:        seen / not seen
HEALTHY TURN:       prepareForListening lines / prepareForSpeaking lines / teardown lines
S1..S4:             PASS / FAIL each, ×N passes
STALL:              disappeared / remains / changed shape (describe)
```

### E6 · 2026-09-11 · first Mac attempt at §7.4 — BLOCKED before any install; nothing new on the phone

Relayed from the Mac, worktree `/Users/soullab/maia-runtime-01` at
`4551a56ed`.

**Two blockers, both outside this repair.**

1. **Mac disk full.** `ENOSPC: no space left on device` hit the webpack
   cache during `next build`, then `pod install` (`Errno::ENOSPC … fcopyfile`
   while copying `Capacitor (8.0.2)`), then `log collect`. Consequences:
   no Pods → `xcodebuild` failed → no `.app` → `strings` 0 →
   `devicectl install` failed (`file doesn't exist`). The `devicectl launch`
   that followed **launched the previous build already on the phone**
   (NATIVE `73d0df30d`, WEB `5846a0824`). **The repair has not been
   installed.** The runtime01 log archive is corrupt (written during ENOSPC)
   and is not evidence.
2. **Static export of `clean-main-no-secrets` is broken independently of
   this branch.** `next build` under `output: 'export'` fails:
   `Page "/reflections/[id]" is missing "generateStaticParams()"`.
   `app/reflections/[id]/page.tsx` is a `'use client'` page on a dynamic
   segment, added by `a0dc55571` (2026-09-04, "move reflections out of Lab
   Tools"). That commit added `'/reflections'` to `WEB_ONLY_PREFIXES` in
   `lib/mobile/mobileAllowlist.ts` (lines 163–170, with a comment that
   expects `capacitor-patch-routes.sh` to strip the route) but did **not**
   add the mirror entry `"app/reflections"` to `MOBILE_EXCLUDED_DIRS` in
   `scripts/capacitor-patch-routes.sh` (line 482, whose own comment reads
   *"Mirrors WEB_ONLY_PREFIXES … keep in sync"*). The script's dynamic-page
   scanner also failed to flag the page as `client + dynamic` for a reason
   not yet established. Net effect: **every iOS static bundle built from
   main since 2026-09-04 fails at export.** The witness bundle of the
   predecessor (`5846a0824`) built because its base predates that commit.
   Not caused by, and not fixable within, the authorized repair.

**Side observation.** `next build` rewrote the tracked `next-env.d.ts`
(shows as ` M`); it is Next's own regeneration, not a change to commit —
`git checkout next-env.d.ts` in the worktree.

**Proposed, for ruling:** a separate one-line tooling commit adding
`"app/reflections"` to `MOBILE_EXCLUDED_DIRS`, restoring the sync the
script's comment mandates. Without it no acceptance build is possible
from main. The deeper drift (a hand-mirrored list) is queued as its own
task, not done here.

**Status.** REPAIR PUSHED (`4551a56ed`) — NOT YET BUILT — NOT INSTALLED —
phone still on the pre-repair build — blocked on (1) Mac disk space,
(2) a ruling on the export blocker.

### E7 · 2026-09-11 · two further lifecycle observations on the unrepaired build (founder)

Same pre-repair build on the phone (NATIVE `73d0df30d`, WEB `5846a0824`).
Founder, verbatim in substance:

1. *"I am getting cut off if I talk too long and it simply starts to live
   transcribe at the new point, cutting off all I said before."* — a long
   member utterance is not carried whole: at some point the recognizer
   restarts and the transcript continues from the new point, discarding
   the earlier text. Founder ask: *live transcription scrolling so I can
   see it is still attending.*
2. *"MAIA is also getting cut off in her spoken aspect — part way through
   what she has written she gets timed out."* — the spoken reply stops
   before the written reply ends.
3. Founder proposal: *"extend both time spaces."*

**Recorded as baseline evidence, not as new requests for repair.** Both
are turn-lifecycle failures of exactly the class §2 names (`HUMAN SPEAKS →
TURN CLOSES` and `MAIA SPEAKS → SPEECH ENDS`), observed with the native
gatekeeper unregistered (C′), so they belong to the WebKit + community
recognizer baseline.

**Candidate mechanisms (named, not attributed):**

- (1) `@capacitor-community/speech-recognition` on iOS wraps
  `SFSpeechRecognizer`, whose per-request sessions are bounded; the live
  path consumes `partialResults` in `components/voice/ContinuousConversation.tsx`
  (~2899). If the plugin restarts its request, `matches` begins again from
  the new segment; whether the app concatenates across a restart is the
  question. This is the transcript-accumulation seam that
  `lib/voice/recognition/humanTurnAuthority.ts` (predecessor lane) was
  written to own — recognizer finality must never close or reset the
  member's turn.
- (2) Three candidates on the speaking side, all in `OracleConversation.tsx`:
  the playback timeouts (`audio.duration + 30` s, ~2416; fixed timeouts
  ~2200/~2324), the echo-suppression / mic-resume cooldown after streaming
  chunks (~5687–5738), and barge-in (~2871, default OFF for beta). A fourth
  is the two-owner problem itself: the recognizer re-arming and re-taking
  the audio session while playback is still running.

**Requirements harvested for §3 (design, not yet authorized):**

- R-A · **Visible attention.** While the member speaks, the live transcript
  scrolls on screen; silence from the UI is never the only signal.
- R-B · **No silent reset.** A recognizer restart may never discard already
  captured text; the turn is closed by the member or by `humanTurnAuthority`,
  not by the recognizer's session length (Invariant 3.6 generalized to the
  listening side).
- R-C · **Speech completes or fails visibly.** A spoken reply either plays
  to the end of the written reply or the UI shows that it stopped and why
  (Invariant 3.3, 3.7).

**Ruling boundary on "extend both time spaces".** Held. E5 does not
authorize timeout or watchdog changes, and lengthening a timeout before the
locus is known is the mitigation the founder refused for the stall. The
proposal is preserved here as a candidate for the §6 step 3 rebuild, where
timeouts become explicit bounded transitions rather than tunables.
