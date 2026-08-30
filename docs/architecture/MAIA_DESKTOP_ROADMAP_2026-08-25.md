# MAIA Desktop Companion — Roadmap to a full functioning Desktop MAIA

**Date:** 2026-08-25 · **Status:** programme reference
**Position:** Desktop tree is CANONICAL · D02A in PR · D04 partial · D05 unblocked
**Position last updated:** 2026-08-27 late, after the reconciliation landing (STATUS CORRECTION)
**Supersedes nothing.** This refines the founder's original D00–D30 programme with what the
MAIA-D00 census, MAIA-D00A, and MAIA-D01 actually established. Where the census changed a unit's
size or sequence, that is marked ⭐.

---

## ⭐ THE GOVERNING SENTENCE

> **The Companion is one MAIA realm across surfaces; Desktop must join and remain in the member's
> canonical identity, conversation, memory, Work, and permissions rather than creating a parallel
> Desktop state.**

Every unit below is subordinate to that sentence. A Desktop feature that works beautifully and holds
its own copy of anything the realm already owns has failed, however well it runs.

---

## 0 · Where we actually are

⭐ **STATUS CORRECTION 2026-08-27 (late).** Desktop is **no longer branch-only**. The programme was
reconciled onto canonical through PR #1119 (merge `626706eee`), so `maia-desktop/` is now part of
the main tree and later work branches from canonical rather than from a long-lived programme branch.
The reconciliation was a selective replay, not a wholesale merge: four Writer's Studio commits were
excluded from the graph entirely, and one commit already on canonical under a different SHA was not
replayed. See `docs/ops/DESKTOP_RECONCILIATION_CENSUS_2026-08-27.md`.

### 0.A Current programme state — the 9-part sequence

```
1  Desktop reconciliation     ✅ DONE       census 938988c26 → merged 626706eee
2  D02A false listening       ◑  IN PR      #1121 — frame receipt is the authority
3  D04 live continuity        ◑  PARTIAL    launch-time adoption only (see 0.B)
4  D05 native playback        ○  UNBLOCKED  canon settled; consume the canonical path
5  D06 turn coordination      ○  known acoustic-echo defect waiting (§0.0.2)
6  D07 companion UX           ○
7  Platform presence          ○  House · history · Settings · Astrology · Now What? ·
                                 Work/Writer's Studio · Session Room · practitioner surfaces
8  Native Desktop powers      ○  quick capture · files · session listening · menu bar ·
                                 notifications · multi-window · background presence
9  Packaging / sign / update  ○  deliberately last — until the thing is worth installing
```

### 0.B D04 — what is proven and what is open

```
PROVEN
  launch-time adoption of an existing same-member conversation

OPEN
  an already-open Desktop does not re-read or adopt live thread changes
  iOS → Desktop not yet witnessed
  iOS ↔ PWA continuity mechanism not yet established
```

⛔ That distinction is load-bearing and must not be softened in planning. Desktop joins the thread
**once, at launch**. That is continuity as a snapshot, not continuity as a field, and the founder's
acceptance bar is the field: *phone → iOS app → PWA → desktop app, continuous.*

### 0.C Historical unit state (2026-08-27 walk)

```
MAIA-D00    ✅ CLOSED    canonical reconciliation
MAIA-D00A   ✅ CLOSED    preload boundary reconciliation
MAIA-D01    ✅ WITNESSED native capture → transcript, on a real Mac, 2026-08-27
MAIA-D03    ✅ WITNESSED authenticated transport into the live MAIA routes
MAIA-D04    ◑  PARTIAL   launch-time adoption proven; live re-adoption not
MAIA-D02    ◑  OPEN      reliability — device churn, restarts, long sessions
MAIA-D02A   ◑  IN PR     false listening / capture liveness — #1121
```

⭐ **The unit boundary between D01 and D03 dissolved on contact with the device.** They could not be
witnessed separately: `/api/voice/transcribe-simple` requires member identity, so native
transcription was never independently acceptable. They closed together, in one walk.

One sentence of honest state, superseding the previous one:
**MAIA has heard a human being, answered, and been answered — repeatedly, on a Mac, into the same
member's substrate; what has not been proven is that a Desktop conversation is the SAME conversation
as an iPhone one.**

### 0.0 Acceptance walk — PASSED 2026-08-27

Nine consecutive spoken turns on a Mac, no Terminal touched, zero transcription
failures and zero retries — including 914816 bytes at 28.6 seconds, larger and
longer than anything that had ever succeeded before the middleware fix
(`92bc2a9df`). The DESKTOP-CONVERSATION-01 acceptance was five; it did nine.

Two defects the walk surfaced, both D02, neither blocking: a ~20-second
near-silent epoch was dispatched and came back as a looping Whisper
hallucination (`peakX1000=127 rmsX1000=8` against a normal ~1000/70), and input
is clipping (`peakX1000` above 1000). Detail:
`docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md` §7.

### 0.0.0 D04 — ✅ WITNESSED CROSS-SURFACE 2026-08-27 (late)

Desktop was quit and relaunched with nothing typed and nothing spoken. It
opened on a conversation created in the **browser PWA**, under the same member
id, and rendered it correctly attributed:

> "That feeling of \"close\" is worth trusting. You've been in this long enough
> to know the difference between close and wishful thinking…"

⭐ **The discriminator is punctuation, and it is the same test that exposed the
earlier false positive — applied honestly in the other direction.** Acoustic
capture always drifts: on the failed attempt the em-dash became a period, a
comma appeared, the emoji vanished. Here the text is character-identical across
both windows — curly quotes intact, the em-dash in the preceding turn intact.
Whisper does not reproduce typography. This is a database read.

Desktop was not listening and the browser was not speaking. So:

```
member speaks in the browser PWA
        ↓
Desktop launched, nothing typed, nothing spoken
        ↓
Desktop opens on that conversation
```

**D04's mechanism is witnessed: Desktop joins the member's existing thread
across surfaces.** It is the same MAIA, the same member, and now the same
conversation.

⛔ What is still NOT witnessed, and is a real limitation rather than a caveat:
adoption runs at startup and after sign-in only. A Desktop window already open
when the member speaks elsewhere never re-reads. A companion whose view of the
conversation goes stale the moment the member picks up their phone is a
snapshot, not a companion. That is the next D04 increment.

⭐ **Confirmed a second, independent way.** A direct query showed Desktop's
displayed turn living in `session_1787834660422` under `ce284751` — a thread
created by the browser, not by Desktop. So the witness rests on database
evidence, not only on reading the screen.

⛔ **iOS is NOT part of this witness.** The iPhone was signed in as a second
member record (`49ae4717` / `soullab13cab`, 267 turns against Kelly's 27,305 —
a test account). After signing it into `Kelly`, no phone turn has yet appeared
in `conversation_turns`, so iOS→Desktop continuity is UNTESTED, not failing.
The signal to watch for is a NEW `session_` id under `ce284751`: the phone keeps
its own id in its own localStorage, so it cannot reuse the browser's.

⛔ **And iOS↔PWA cannot work by any current mechanism.** Only Desktop performs
the server-side adoption read. Web and iOS each mint a per-device, per-day id in
localStorage and never ask the server what conversation the member is in.
Porting the adoption read into the web client is the unit that would close
that — the same read, applied to `app/maia/page.tsx` — but it changes behaviour
for every member on every device and is a platform change, not a Desktop one.

### 0.0.1 The route to that witness — three wrong turns, kept

⛔ **RETRACTED intermediate claim. NOT witnessed cross-device (first attempt).**

**An earlier revision of this section claimed D04 was witnessed cross-device on
2026-08-27. That claim was wrong and is withdrawn.**

What actually happened: after speaking to MAIA in the PWA on iPhone, Desktop
launched, showed "Picking up where you left off", and rendered a thread. But
the restored turns were the *"Able to move to the back of the screen"* loop and
MAIA's reply to it — both from the earlier **Desktop** session. Desktop adopted
its own previous thread.

The phone's words did appear in the window, which is what produced the false
positive, but they arrived **acoustically**: the iPhone spoke MAIA's reply
aloud and the Mac's microphone transcribed it (§0.0.2). Punctuation gives it
away — the em-dash became a period, a comma appeared, the emoji vanished.

⛔ The failure of reasoning is worth more than the failure of the feature:
"it resumed something" was allowed to stand in for "it resumed the right
thing." That is the collapse this project's own doctrine names — *wired ≠
surfacing; surfacing ≠ verified* — committed in the record itself.

**Established:** adoption runs, reads the server, and resumes a real thread.
**NOT established:** that the thread it resumes is the member's most recent
across surfaces.

#### RESOLVED — the cause was two member accounts, not a Desktop defect

```
Desktop  desktop-1787849086266  user_id ce284751-e457-42f6-89b6-bc07d0876682
iPhone   session_1787848849575  user_id 49ae4717-2b3a-4189-b25d-2bef95b1a45a
```

The iPhone PWA is authenticated as a **different member record**. No thread
adoption can cross that boundary, and none should — the boundary is correct.

⭐ So the D04 code did the right thing. For `ce284751`, the most recent thread
genuinely was `desktop-1787849086266`, and it resumed exactly that. The
retraction above was right about the evidence and wrong about the cause; both
are left standing, because a record that quietly deletes its own wrong turns
teaches nothing.

**The available witness.** The same query shows a `session_`-prefixed thread —
minted by a WEB surface — under the Desktop member id:

```
18:14  session_1787834660422  ce284751…  "hi Maya can you hear me"
```

Relaunching Desktop should open on that conversation, which Desktop never
created. That is same-member cross-surface continuity and it is testable now.

**A separate finding, outside this programme.** Two member accounts exist for
one person. CLAUDE.md's onboarding invariant states email-uniqueness prevents
account forking. Memory, anamnesis and atoms are all keyed to member id, so the
iPhone has been accumulating a separate history. Named here because the Desktop
walk surfaced it; the disposition is not a Desktop decision.

#### Still true regardless: adoption is launch-only

It runs at startup and after sign-in, so a Desktop window already open when the
member speaks elsewhere never re-reads. A companion whose view of the
conversation goes stale the moment the member picks up their phone is wrong,
and this was not caused by the account split.

⛔ Still day-scoped, and that is inherited, not introduced. Web and iOS mint
their sessionId in localStorage with daily rotation
(`lib/maia/presence/conversationIdentity.ts`), so "the same conversation" was
never available to any surface pair before this. Desktop reading the server's
record is strictly better than what any surface did, and it does not remove the
daily boundary. Removing that is a separate, larger question.

### 0.0.2 ⚠️ NEW DEFECT — cross-device acoustic echo (D06)

During the D04 walk the iPhone spoke MAIA's reply aloud, the Mac's microphone
captured it, and Desktop transcribed it as the member's own speech. Diagnosed
from the text rather than assumed: the em-dash became a period, a comma
appeared, the emoji vanished — the signature of transcription, not of a
database read.

`getUserMedia` already sets `echoCancellation: true`, but that cancels only
THIS machine's output. Another device's speaker is just sound in the room.

⭐ This stops being device-specific the moment D05 lands: Desktop speaking
aloud into its own microphone is the same loop, and there the built-in AEC does
apply. So D05 and D06 are coupled — native playback should not ship without
the turn coordination that keeps MAIA's voice out of the member's transcript.

⭐ Worth recording as system behaviour, not just as a defect: MAIA caught the
misattribution herself, unprompted — "That message reads like something I said
to you — not something you sent to me." Nothing designed that.

### 0.1 What the 2026-08-27 walk actually established

Production runtime evidence, from `docker logs maia-sovereign` during Desktop turns:

```
sessionId: 'desktop-1787848078168'
✅ [TurnsStore] Persisted exchange for 88099bb1977c
📊 [MemoryAudit] Recorded 5 memory uses
💫 [ANAMNESIS] Essence loaded from PostgreSQL (1745 encounters): ce284751-…
🧠 [CorpusCallosum] Logged 6 elemental agent runs
✅ MAIA FAST response complete: 4587ms | 32 chars + audio
```

That is not a Desktop-shaped MAIA. It is **the** MAIA: the founder's own member id, 1745 prior
encounters loaded, five memory uses recorded, the Corpus Callosum substrate firing, the FAST profile
on the live route. A Desktop turn is a turn in the member's existing realm — which is the whole
point of the programme (§VII).

**And the precise gap.** `sessionId` is `desktop-<launch timestamp>` — a NEW conversation per launch.
So D04's *member* continuity is proven and its *conversation* continuity is not. Speaking on iPhone
and continuing on Desktop remains unwitnessed. That is exactly D04, and it is still the load-bearing
unit.

⛔ Not yet witnessed at all: MAIA speaking aloud (the route returns no audio — a Kokoro/server-side
question, not a Desktop one), which is D05, and which still has the openai-tts canon conflict
upstream of it per §2.3.

---

## 1 · The critical path — what actually makes Desktop MAIA real

⭐ **SUPERSEDED 2026-08-27 (late).** The sixteen-unit presentation below is **no longer the planning
surface**. The founder's lane ruling of 2026-08-27 replaced it with the 9-part programme sequence in
§0.A, and narrowed what belongs to this lane at all:

```
IN LANE     D02 · D04 · D05 · D06 · D07 · realm continuity · memory integrity ·
            House/platform surfaces · Desktop reconciliation · packaging (later)

OUT OF LANE repository-wide TTS sanitizer work · global provider policy ·
            web/PWA voice defects · provider-wide logging · generic voice
            infrastructure unless it directly blocks Desktop
```

The governing test: *if a change does not materially improve the Companion Desktop app or unblock its
path to full MAIA, it belongs in another lane.*

The unit identifiers below are **retained as historical references** — they are how D01, D03, D17A
and the rest are named in the ops records and commit history, and renaming them would break that
trail. Read the list as a glossary, not as a sequence.

**Sixteen units, not thirty.** Everything else in the programme either hardens these or is a separate
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

*(Sixteen IDs, sixteen units — nothing is collapsed or composite. An earlier draft of this file said
"twelve" above a list of sixteen; corrected 2026-08-25 on founder review. Programme custody should be
arithmetically boring: a future session must never have to infer why the count and the list disagree.)*

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

### 2.3 D05's canon conflict — ✅ RESOLVED 2026-08-27, D05 IS UNBLOCKED

⭐ **STATUS CORRECTION.** This section previously read *"D05 cannot begin until that disposition is
settled."* It is settled, and leaving that sentence in place would keep generating plans that gate a
unit which is now free to start.

The founder ruled on cloud voice on 2026-08-27 and both units shipped:

```
VOICE-SOVEREIGNTY-01  merged 37bbf0c23 · DEPLOYED · runtime-witnessed
VOICE-SOVEREIGNTY-02  merged cc1f1ea10
```

The canonical voice authority is now:

```
LOCAL is authoritative.

Cloud is available ONLY under BOTH:
  · explicit future re-permission        (MAIA_ALLOW_CLOUD_VOICE=1)
  · an explicit member `cloud` preference

  auto  → local, in every flag state. The absence of a choice is not
          consent to leave the local machine.

Chosen cloud, unavailable → local if healthy → otherwise text.
Never silence, and never a different unconsented cloud provider.
```

⛔ **D05's rule follows directly: Desktop must CONSUME the canonical voice path and never invent its
own TTS policy.** No Desktop-specific provider, no Desktop-specific Alloy path, no Desktop-local
fallback ladder. Whatever the voice lane establishes as the sovereign decision, Desktop plays.

Runtime C of VOICE-SOVEREIGNTY-01 was witnessed on the server side — Kokoro down, the fallback path
reached, `CloudVoiceForbidden` refusing it, zero OpenAI attempts. Two eyewitness items remain
unrecorded and are noted in `docs/ops/PRODUCTION_LOG_FINDINGS_2026-08-27.md`; neither gates D05.

### 2.4 Session Room is a product, not a phase

D10–D12 (session listening, transcript, → Realm) is the largest body of work in the original list and
is **not on the V1 critical path**. It ships when D10–D12 are independently complete and
release-ready, or it ships after V1. Treating it as a V1 phase is how V1 slips a quarter.

### 2.4A ⭐ D02A — false listening, and the invariant it establishes

**Added 2026-08-27 (late).** Not in the original D00–D30 list. Found during a Runtime C walk and
opened as its own unit because it is a truthfulness defect, not a reliability one.

Desktop declared `Listening…` and lit the live dot the moment the worklet was **connected**, with no
independent proof that a single audio frame had ever arrived. A worklet that connects and then emits
nothing left that state on screen indefinitely while the member kept talking into nothing.

Desktop was **worse than the PWA**, not equal to it. The PWA detects the condition and logs it
(`silent_death` / `NO_AUDIO_FRAMES`) and merely fails to change what is shown. Desktop had no
detector at all, and its two existing loss signals — `track_ended` and `track_muted` — reached main
and changed nothing the member could see. Three ways to lose the microphone, zero visible
consequences.

The state contract:

```
IDLE         not capturing
STARTING     worklet connected, WAITING FOR THE FIRST REAL FRAME
LISTENING    recent audio frames positively observed
RECOVERING   expected frames stopped arriving; one rebuild in flight
UNAVAILABLE  bounded recovery failed — the member is told
```

⭐ **THE INVARIANT, and it governs all later Desktop work:**

> **Frame receipt — not AudioWorklet connection — is the authority for "Listening".**

`STARTING` must stay distinct from `LISTENING`; only frame arrival may promote a session; "worklet
connected" must never again mean "listening". This is enforced structurally rather than by
discipline: two negative controls fail the Desktop suite if it decays — disabling the liveness timer
fails ~7 tests, and claiming `LISTENING` at connect time fails ~2.

Why the detector is safe to build at all: the worklet posts a block every 2.67 ms and **silence is
still blocks**, so the absence of frames never means the member went quiet — it means the graph is
dead. The detector therefore never guesses at a speech threshold and cannot mistake a pause for a
failure. The near-silence gate in `conversation.js` judges *content*; this one only asks whether audio
is arriving at all.

Liveness lives in **main**, beside the epoch machine, and rides the already-ratified
`maia:voice-state-changed` snapshot. **No new IPC channel was opened** — the preload doctrine requires
an added channel to argue for itself, and this one did not need to exist.

**PWA false-listening is a related finding and is NOT this lane's** — separate voice/web lane, by
founder ruling. Keeping it out is what stops this becoming a cross-platform voice project.

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

## 4A · ⭐ Programme separation — this document governs ONE programme

**Founder ruling, 2026-08-25.** Three distinct programmes exist. They may share infrastructure.
**None silently absorbs the others.**

```text
MAIA-DESKTOP         native companion · voice · same-MAIA continuity   ← THIS DOCUMENT
JARVIS-DESKTOP       founder operating surface for JARVIS
WRITERS-STUDIO-V2    Soullab writing environment
```

⛔ **Writer's Studio does not wait behind D01–D30.** Nothing in this roadmap gates it, and no unit ID
here (D-anything) may be used to sequence Writer's Studio work. Its custody is its own —
`docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md` (normative) and
`docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md` (the one live cockpit).

⛔ **JARVIS-DESKTOP is a separate repair programme** (JOP lineage) and is **not a dependency** for
MAIA Desktop development. `jarvis-desktop/` supplies architectural precedent only.

Scope note for future sessions: a census performed for one programme is evidence for that programme.
It does not confer authority to re-sequence another.

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
- ⭐ **Electron is a host adapter, not a domain boundary.** No canonical capability may depend
  directly on Electron APIs; Electron-specific code stays at the adapters (`BrowserWindow`, session
  partitions, IPC, `safeStorage`, permission handlers, notifications, window lifecycle) while
  identity, memory, conversation, Work, permissions and voice grammar stay substrate-neutral. Added
  2026-08-30 and binding on **Companion-01A and everything after it** — the five placement questions,
  the forbidden list, the SOURCE census of the current tree, and what the invariant deliberately does
  NOT authorize are in `docs/architecture/SOVEREIGN_PORTABILITY_INVARIANT_2026-08-30.md`. Enforced
  structurally by `maia-desktop/test/portability-01-host-boundary.test.mjs`, in the preload
  allow-list doctrine: only `src/main.js` and `src/preload.js` may name Electron, and a new source
  file fails the suite until it declares which side of the boundary it is on.

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
