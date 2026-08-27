# MAIA Desktop Companion — Roadmap to a full functioning Desktop MAIA

**Date:** 2026-08-25 · **Status:** programme reference · **Position:** D01 open on device evidence
**Supersedes nothing.** This refines the founder's original D00–D30 programme with what the
MAIA-D00 census, MAIA-D00A, and MAIA-D01 actually established. Where the census changed a unit's
size or sequence, that is marked ⭐.

---

## 0 · Where we actually are

```
MAIA-D00    ✅ CLOSED    canonical reconciliation
MAIA-D00A   ✅ CLOSED    preload boundary reconciliation
MAIA-D01    ◑  OPEN      implemented · device witness required   ← HERE
MAIA-D02+   ○  not eligible
```

One sentence of honest state: **a native voice state machine exists and is provably correct;
nothing has heard a human being.**

---

## 1 · The critical path — what actually makes Desktop MAIA real

Twelve units, not thirty. Everything else in the programme either hardens these or is a separate
product that happens to run in the same window.

```
D01  native listening        ◑ implemented, device witness owed
D02  voice reliability       device churn, restarts, long sessions
D03  MAIA transport          ⭐ wiring + proof, NOT architecture
D04  same-conversation       ⭐⭐ THE unit — the one that makes it MAIA
D05  native playback         needs a TTS sovereignty decision first
D06  turn coordination       interruption, silence, being heard
D07  companion UX            the first thing that feels like a product
D08  Realm continuity        depends entirely on D04
D09  memory integrity        no parallel Desktop memory, ever
D17A packaging correction    ⭐ NEW — the root foot-gun, unlisted in D00–D30
D18  packaging               installable, survives a moved repo
D19  signing + notarization  JOP-03's owed obligation, inherited
D20  updates                 signed, rollback-capable
D27  founder proving walk    the whole journey, on the installed app
D28  small trusted beta
D30  V1
```

⭐⭐ **D04 is the load-bearing unit of the entire programme.** Everything before it builds a
*voice-capable desktop app* — a category that already exists and that nobody needs another of. D04 is
where it becomes *the same MAIA*, on a third surface, with one continuity. Until D04 lands, the
Desktop Companion is a nicer microphone.

---

## 2 · ⭐ What the census changed about the original plan

### 2.1 D03 shrank — it is wiring, not architecture

MAIA-D00 §5.1 witnessed that the identity invariant is **already satisfied server-side**:
`getMemberFromRequest.ts` resolves identity only from an `auth_sessions` credential, treats
`x-member-id` as a claim that must match or be rejected, and `POST /api/members/signin` already
returns `{ token }` explicitly for header auth.

**Consequence:** Desktop carries that token as `x-session-token`. No new auth transport is designed.
D03 is a wiring-and-proof unit and should be sized as one.

⚠️ **One decision it must make, not inherit:** `/api/between/chat` degrades an unauthenticated
production request to `anon:${sessionId}` rather than refusing. That is safe for identity and wrong
for Desktop — a client whose token silently expired would keep conversing as a fresh stranger. D03
must decide: refuse, or degrade visibly. It is a sovereignty question, not a technical one.

### 2.2 A packaging-correction unit is missing from the original list

`package.json` at repo root still declares `"main": "electron/main.js"` and
`"desktop:package": "electron-builder"`. **`npm run desktop:package` today packages the LabTools
window** — not MAIA, not JARVIS. Any release run through that script produces an artifact that is not
the product it claims to be.

**D17A — Packaging Target Correction** must land before D18 and must not be folded into any voice
unit. Recorded in `electron/STATUS.md` where someone will hit it.

### 2.3 D05 has an unresolved canon conflict upstream of it

`app/api/voice/openai-tts` exists against the project rule *"Never use OpenAI or other cloud AI
providers."* `local-tts` also exists. **D05 cannot begin until that disposition is settled** — it
determines whether native playback has a sovereign source at all.

### 2.4 Session Room is a product, not a phase

D10–D12 (session listening, transcript, → Realm) is the largest body of work in the original list and
is **not on the V1 critical path**. It ships when D10–D12 are independently complete and
release-ready, or it ships after V1. Treating it as a V1 phase is how V1 slips a quarter.

### 2.5 The hard part is D01–D02, and it is hard for an unusual reason

Not because native audio is difficult, but because the acceptance bar is *relational*: a pause is not
a finished thought. Every off-the-shelf VAD is tuned for dictation and will mutilate the exact speech
this product exists to receive. That is why D01 built the tail invariant before anything else, and
why D02 exists as its own unit rather than as polish.

---

## 3 · The phases, restated with honest gating

### Phase A — the seam (D01 → D02)
**Gate:** a real 2–5 minute monologue survives, with no silently lost tail, on a real Mac.
Risk: VAD thresholds against real voices; IPC pressure at 128-sample cadence.
*This is the only phase where the technology is genuinely uncertain.*

### Phase B — it becomes MAIA (D03 → D04)
**Gate:** speak on iPhone, open Desktop, continue the same conversation, no duplicate identity, no
duplicate conversation object.
⭐ D04 must define, not discover: "continue current" vs "start new", archived conversations,
simultaneous clients, conflict handling, stale client state.

### Phase C — it becomes conversation (D05 → D06)
**Gate:** MAIA speaks, can be interrupted mid-sentence, yields, and resumes without replaying the
head. The playback defect class the browser programme already documented must not recur natively.

### Phase D — it becomes a companion (D07 → D09)
**Gate:** Realm continuity present; **no parallel Desktop memory database**. Local cache may optimize
experience but can never become canonical truth.

### Phase E — it becomes software people can install (D17A → D18 → D19 → D20)
**Gate:** installs to `/Applications`, launches from Finder/Spotlight/Dock, survives the repo being
moved and the Terminal being closed, signed + notarized, signed updates with rollback.
Inherits JOP-01/JOP-03's still-open distribution obligation.

### Phase F — it becomes real (D27 → D28 → D30)
**Gate:** the full journey on the *installed* app, then a small trusted cohort, then V1.

---

## 4 · V1 boundary — deliberately bounded

**In V1:** installed native app · secure sign-in · same MAIA continuity · text conversation · native
voice capture · reliable transcription · native playback · Realm continuity · restart continuity ·
secure updates · clear consent/capture states.

**Not V1:** Session Room (unless D10–D12 independently complete) · Studio · Writer's Studio ·
practitioner cockpit · astrology · Soul Portrait · local inference · proactive notifications ·
menu-bar companion · global invocation · calendar context.

⛔ Do not delay V1 to include every Soullab function. The failure mode is a Desktop app that does
everything except feel like MAIA.

---

## 5 · Standing constraints (carried, not re-litigated)

- **One person · one MAIA continuity · many surfaces.** No Desktop-only identity, memory, or
  conversation store.
- **`jarvis-desktop/`** is the founder/operator surface; **`maia-desktop/`** is the member surface.
  Patterns are shared; the applications are not merged.
- **`desktop-app/`** LEGACY, **`electron/`** LabTools only. Neither has packaging authority.
- **No Web Speech API** in the native capture path, enforced by proof.
- **No parallel voice-diagnostics vocabulary** — reuse `VoiceDiagEvent`; one documented exception
  (`voice_tail_lost`) exists and a proof fails if a second appears.
- **Evidence classes stay separate:** SOURCE ≠ TEST ≠ RUNTIME ≠ DEVICE ≠ EXPERIENCE.
  `UNWITNESSED` is never a pass.

---

## 6 · The honest read

The programme's remaining risk is not evenly distributed. **D01–D02 and D04 carry almost all of it.**

- D01–D02 because relational speech is genuinely hard to segment and nobody's defaults fit.
- D04 because it is the only unit that cannot be built by analogy to something else — it is where the
  architecture's central claim (*one continuity, many surfaces*) either holds under real
  concurrent use or does not.

D05–D09 are substantial but understood. D17A–D20 are known work with known gates. D27–D30 are
process.

⭐ **The most useful thing to know:** if D04 works, the Desktop Companion is real and everything after
is craft. If D04 does not work, no amount of D05–D30 will make Desktop MAIA anything other than a
second app wearing MAIA's name.
