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

```text
HEAD witnessed:
date / walker:
PASS · FAIL · PARTIAL:
steps NOT REACHED:
product findings (non-blocking):
```

⛔ Until this page carries a result, the correct statement about the House is: **SOURCE and TEST
pass; DEVICE unwitnessed.** Nothing above may be cited as evidence that a member has entered it.
