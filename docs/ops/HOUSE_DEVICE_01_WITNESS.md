# HOUSE-DEVICE-01 — first member witness

**Candidate (immutable):** `124ae099a` · **Suite:** 299/299 · **Class:** SOURCE + TEST PASS ·
**DEVICE: UNWITNESSED**

> **Observe first. Repair afterward.** The witness belongs to ONE build. If step *n* fails, record it
> `FAIL` and do not fix it and then continue claiming steps *n+1…* witnessed the same candidate. If a
> failure blocks the rest, they are `NOT REACHED` — that distinction is the evidence.

⛔ **Out of scope, explicitly.** The five web-platform voice commits
(`lib/ai/oracleStreaming`, `lib/voice/*`, `app/api/voice/*`, `platformDetection`) are a separate
lane. This acceptance does not absorb them.

---

## 0 · Pre-flight — record before launching

```bash
cd ~/MAIA-SOVEREIGN
git fetch origin claude/maia-desktop-architecture-yzqb3p
git checkout 124ae099a            # the candidate, not the branch tip
git status --porcelain            # MUST be empty
git rev-parse HEAD                # MUST print 124ae099a…

cd maia-desktop
npm install                       # electron ^28
node scripts/witness-env.mjs      # writes the machine-readable environment record
npm test                          # 299/299 expected on this machine too
```

| field | value |
|---|---|
| git HEAD | |
| working tree clean (y/n) | |
| Mac used | |
| macOS version | |
| `MAIA_PLATFORM_ORIGIN` (unset = production `https://soullab.life`) | |
| witness JSONL path (printed at first capture as `[D01 witness] evidence → …`) | |

Launch: `npm start` — or, to witness against a local platform instead of production,
`MAIA_PLATFORM_ORIGIN=http://127.0.0.1:3000 npm start`. An invalid value refuses to start rather
than silently using production; that refusal is itself correct behaviour, not a failure.

---

## 1 · Reading provenance mechanically

Every revocation writes one `voice_capture_lost` record carrying **what** happened and **why**. Do
not judge this by impression — read it:

```bash
# newest witness file, revocation events only
W=$(ls -t ~/Library/Application\ Support/maia-desktop-dev/witness/*.jsonl | head -1)
grep voice_capture_lost "$W" | python3 -c 'import sys,json
for l in sys.stdin:
    r=json.loads(l); print(f"{r.get(\"at\",\"\")}  cause={r.get(\"cause\")!r:24} source={r.get(\"source\")!r}")'
```

Expected pairs — **same operation, different truthful cause**:

```text
signed_out        → source auth_teardown
session_expired   → source auth_teardown
attention_crossed → source attention_crossing      ⛔ NOT auth_teardown
unratified        → source unratified              (a development finding, not a runtime block)
```

⭐ A crossing that reports `auth_teardown` is a **FAIL** even if the microphone visibly stopped. The
point of this walk is that the system knows *why* it stopped.

---

## 2 · The walk

Class every step **PASS · FAIL · NOT REACHED**. For a failure record only: step · what you did ·
what you expected · what happened · visible state · console/log evidence · screenshot if useful.

### 1 — Arrival · ☐ PASS ☐ FAIL ☐ NOT REACHED
Launch cold. App opens · House appears · correct member identity · no browser needed · no debug
surface exposed · navigation understandable without knowing the architecture.
**The question is experiential: does this feel like entering MAIA Desktop?** Not "does Electron
start."

### 2 — House containment · ☐ PASS ☐ FAIL ☐ NOT REACHED
Enter each available destination. MAIA stays the native/local surface · platform destinations appear
only in the contained view · remote content never replaces or navigates the MAIA renderer · return
behaviour intelligible · menu state agrees with what is visible.
Then deliberately attempt an **off-allowlist navigation** from inside the platform surface →
expected **blocked/refused**. ⛔ Do not weaken containment to make a destination work.

### 3 — Platform permissions · ☐ PASS ☐ FAIL ☐ NOT REACHED
From the contained view, attempt anything that would solicit a sensitive browser permission.
Expected: the remote platform **cannot** acquire microphone/camera through the BrowserView. The
House's own sovereign voice path is separate and unaffected.

### 4 — Typed conversation · ☐ PASS ☐ FAIL ☐ NOT REACHED
Type one ordinary message → send → thinking → one answer. One member turn, one MAIA answer, no
duplicate, thinking terminates, continuity correct. Send a second typed turn.

### 5 — Voice conversation · ☐ PASS ☐ FAIL ☐ NOT REACHED
Real microphone. Start → permission → listening → speech recognised → member speech appears
correctly → thinking → answer → audio if enabled → usable state.
Judge **lifecycle coherence**, not voice quality, unless quality prevents use.

### 6 — Cross-modality ownership · ☐ PASS ☐ FAIL ☐ NOT REACHED
`voice → typed → voice`. One coherent conversation · no thread split · no stuck busy · no
overlapping answers · no modality-specific continuity break.
⭐ New in this candidate (`turn.say`): typed and spoken must feel like one MAIA, not two subsystems.

### 7 — Navigation while capture is live · ☐ PASS ☐ FAIL ☐ NOT REACHED
Start listening, speak enough to establish active capture, then navigate into a platform place.
Capture ceases **before** the platform surface takes attention · no epoch commit · no abandoned
fragment promoted into a completed turn · no recovery/rebuild attempt · returning to MAIA shows a
sane idle state.

```text
expected cause:  attention_crossed / attention_crossing
observed cause:
```

### 8 — Sign-out, no active turn · ☐ PASS ☐ FAIL ☐ NOT REACHED
Capture released · continuity polling stopped · member state gone · House retains no privileged
member presentation · no stale MAIA interaction usable.

```text
expected cause:  signed_out / auth_teardown
observed cause:
```

### 9 — Sign-out mid-answer · ☐ PASS ☐ FAIL ☐ NOT REACHED
**Highest-value step.** Send a turn, and sign out while MAIA is still thinking.
No answer delivered after revocation · **no generic operational error presented as though MAIA
failed** · thinking does not remain forever · authority does not survive · the turn releases its own
in-flight state.
This witnesses TURN-REVOCATION rather than trusting its unit test.

```text
expected cause:  signed_out / auth_teardown
observed cause:
expected turn outcome: cancelled, surface returns to idle — NOT an error
observed:
```

### 9b — Expiry, only if inducible safely · ☐ PASS ☐ FAIL ☐ NOT REACHED
If the 401 path can be induced without damage. Same lifecycle disposition, different provenance.

```text
expected cause:  session_expired / auth_teardown
observed cause:
```

### 10 — Return · ☐ PASS ☐ FAIL ☐ NOT REACHED
Sign in again. House restores coherently · canonical continuity resumes · no zombie capture · no
stuck busy flag · no stale BrowserView or member state.

---

## 3 · Acceptance — binary

PASS only if the real Mac demonstrates **all** of:

```text
☐ House is a coherent entry surface
☐ contained platform navigation works WITHOUT weakening containment
☐ typed and voice turns inhabit one conversation
☐ cross-modality use does not duplicate or wedge turns
☐ capture does not leak across platform navigation
☐ sign-out revokes live Desktop authority
☐ mid-answer revocation delivers neither stale answer nor fake error
☐ return after sign-in is coherent
☐ every revocation's observed cause matches its expected cause
```

Aesthetic observations — spacing, icons, "this could feel better" — become **product findings**
without failing the witness, unless they make the House confusing or unusable.

---

## 4 · Result

### Walk 1 — candidate `124ae099a` · **FAIL** · PERMANENT RECORD, do not overwrite

```text
HEAD witnessed:   124ae099a
STEP 1 COLD ARRIVAL   FAIL
  expected:  canonical full /maia as the Desktop centre
  observed:  the local D01 mini-MAIA witness surface (file:// index.html —
             local transcript, "Message MAIA…", diagnostics, Start listening)
STEPS 2-10            NOT REACHED
  Voice, containment and navigation were not tested: on this candidate they
  would no longer answer the acceptance question.
```

**Cause, traced before any change.** `/maia` existed, its containment existed,
`shell.show()` was correct — and nothing called it during arrival. HOUSE-RECONCILE-01
dropped three caller lines that were present on the House branch:
`did-finish-load → goTo(MAIA)`, `sign-in success → goTo(MAIA)`, `sign-in success → buildMenu()`.
The candidate reached canonical MAIA only by a manual menu click.
Repaired in DESKTOP-ARRIVAL-01 on a new SHA; this record stays as it is.

### Walk 2 — candidate `1ec8135b2` · **FAIL at voice** · PERMANENT RECORD

```text
HOUSE-DEVICE-01 / WALK 2                candidate 1ec8135b2

cold arrival → canonical /maia   PASS
local mini-MAIA hidden           PASS
title / host place agrees        PASS
member identity → Kelly          PASS

voice start                      FAIL
  action     tap TAP TO SPEAK
  observed   listening indicator engages briefly, then immediately returns
  capture    none

classification                   DESKTOP VOICE TRANSPORT
STEPS 2-10                       NOT REACHED
```

⭐ **DESKTOP-ARRIVAL-01 witnessed and closed.** Confirmed mechanically: `Hey`,
`quiet hours`, `I'm ready` and the holoflower are all absent from
`src/index.html`; the local renderer's `Start listening` and `Sign out` were not
on screen; the title bar read `MAIA Desktop` from `showPlace(MAIA)`.

⭐ **Identity resolved on device: the account sheet reads Kelly, and the top-right
shows `K Kelly`.** The earlier `F` is closed for this walk and
CANONICAL-MAIA-IDENTITY-01 is NOT opened. (An earlier revision of this page named
a `DESKTOP-IDENTITY-CARRY-01`; that name was wrong twice over — the defect was
not Desktop's, and it did not survive the device check. Recorded here so the
correction is visible rather than silently edited away.)

#### The blocking defect: canonical MAIA thinks Electron is a browser

⛔ **This is NOT the old mini-MAIA voice problem.** The sovereign voice machinery
extracted into the Desktop core is not what the member is touching. The visible
surface is canonical web `/maia` inside the contained BrowserView, and it makes
its own transport choice:

```text
IS                                        MUST BE
canonical /maia                           canonical /maia
  → Capacitor native?      no               → MAIA Desktop?        yes
  → Chromium has                            → SOVEREIGN WHISPER
    SpeechRecognition?     yes                 getUserMedia
  → WEB SPEECH                                 MediaRecorder
  → dies immediately in Electron               first-party transcription
```

`lib/utils/platformDetection.ts` on this lineage has no `desktop` category, no
`maia-desktop/` UA marker, no `isDesktopShell()` and no `selectVoiceTransport()`.
It selects the sovereign path only when `SpeechRecognition` is ABSENT — and in
Electron's Chromium it is present.

⚠️ **Carried half a contract.** `test/ds02-ua-marker.test.mjs` was brought over in
HOUSE-RECONCILE-01 and is headed `DESKTOP-SOVEREIGN-STT-01`. It states that
`platformDetection.ts` classifies Desktop by the `maia-desktop/<version>` token
and defines *"the exact regex platformDetection.ts uses"* — locally. It never
opens that file, so it passes against a counterpart that does not exist on this
lineage. The pin was carried; the thing it pins was left on the branch.

⛔ **Do not respond by widening the BrowserView permissions.** `platformPermission`
is audio-only, main-frame-only, origin-equal, and gated on main's own observation
that MAIA is visible at `/maia`. It is correct. The defect is which transport
canonical MAIA chooses after the tap.

Repaired in **DESKTOP-SOVEREIGN-STT-01**.

### Walk 3 — STT DEVICE witness · candidate `1c2c59af9` · **PENDING**

⛔ **PIN THE CANDIDATE, NOT THE BRANCH.** The branch head has moved past the frozen candidate
(docs and the lineage guard only — `git diff 1c2c59af9 HEAD -- maia-desktop lib components app` is
empty). Walk **`1c2c59af9`** or you are not walking the frozen app.

```bash
cd /tmp/witness-house
git fetch origin
git cat-file -e '1c2c59af9^{commit}' && echo 'CANDIDATE FOUND'
git worktree add -f --detach /tmp/house-device-04 1c2c59af9
cd /tmp/house-device-04
git rev-parse HEAD
git status --short
ln -s ~/MAIA-SOVEREIGN/node_modules /tmp/house-device-04/node_modules
npx jest lib/utils/__tests__/voiceTransportSelection.test.ts lib/voice/__tests__/transcribeResponseShape.test.ts lib/voice/__tests__/sovereignPartialTranscription.test.ts lib/voice/__tests__/desktopUtteranceLimit.test.ts lib/voice/__tests__/sovereignCaptureLifecycle.test.ts
npm run typecheck
cd maia-desktop
npm install --no-save --package-lock=false --no-audit --no-fund
npm test
npm start
```

Desktop expects **310/310**. Name the five tests explicitly — `lib/voice/__tests__` holds 18 files
and the other 13 are unrelated pre-existing coverage.

#### Three observations, increasingly demanding. If one fails, STOP — do not repair and continue.

```text
SHORT TURN
  listening held:
  provisional visible:          look for the exact label "hearing · not sent yet"
  one final turn:
  MAIA responded:

SECOND TAP                      the highest-value check
  re-armed:
  second transcript:
  second response:

LONG TURN
  duration:
  cut off near 8s:
  provisional continued:
  final transcript complete:
```

⭐ **The second tap distinguishes "STT works once" from "the conversation voice lifecycle works."**
A first turn that lands and a second tap that will not arm points at post-turn lifecycle state —
`revokeCapture`, the turn's own `finally`, and `capture-watch`'s self-stop failing to agree — not at
STT.

**The label and the provisional words share ONE render guard** (`VoiceInteractionBar.tsx:200`:
`voiceState === 'listening' && interimTranscript.length > 0`), so *"label but no words"* is not a
possible outcome. They appear together or not at all.

```text
label + words + one final turn        first-turn sovereign STT PASS
no label/words, but final lands       interim display pipeline defect
listening holds, no interim, no final capture / transcription defect
listening collapses                   acquisition / transport activation defect
first turn works, second tap fails    post-turn lifecycle / restart defect
```

A clean result across all three establishes something materially stronger than "the microphone
works": **canonical MAIA on Desktop can hear visibly, commit speech once, recover for another turn,
and preserve a natural thought beyond the old recovery timer.**

```text
HEAD witnessed:
date / walker:
SHORT / SECOND / LONG:
product findings (non-blocking):
```

---

### Deferred, not lost

```text
identity `Friend` on a fresh profile   canonical /maia resolves identity from localStorage;
                                       the platform partition starts empty. Not a Desktop
                                       defect and untouched by the STT carry.
VoiceWithNotes.tsx                     renders ContinuousConversation without
                                       onInterimTranscript — Notes mode has no provisional
                                       display. Logged, not in this unit.
desktop-app/package.json               also names itself `maia-desktop`, colliding with
                                       maia-desktop in jest-haste-map. Fix by renaming the
                                       LEGACY one; ds02 fails if the wrong one is renamed.
```

Re-run **from Step 1, not from Step 2.** The first acceptance question is now:

> Cold launch with an existing member session must open the canonical full `/maia`,
> not mini-MAIA.

```text
HEAD witnessed:
date / walker:
PASS · FAIL · PARTIAL:
steps NOT REACHED:
product findings (non-blocking):
```

⛔ Until this page carries a result, the correct statement about the House is: **SOURCE and TEST
pass; DEVICE unwitnessed.** Nothing above may be cited as evidence that a member has entered it.
