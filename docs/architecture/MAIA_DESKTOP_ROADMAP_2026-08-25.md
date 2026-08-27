# MAIA Desktop Companion — Roadmap to a full functioning Desktop MAIA

**Date:** 2026-08-25 · **Status:** programme reference
**Position:** D01/D03 device-witnessed · nine-turn walk clean · D04 partially proven · D02 active
**Position last updated:** 2026-08-27 after the conversation device walk
**Supersedes nothing.** This refines the founder's original D00–D30 programme with what the
MAIA-D00 census, MAIA-D00A, and MAIA-D01 actually established. Where the census changed a unit's
size or sequence, that is marked ⭐.

---

## 0 · Where we actually are

```
MAIA-D00    ✅ CLOSED    canonical reconciliation
MAIA-D00A   ✅ CLOSED    preload boundary reconciliation
MAIA-D01    ✅ WITNESSED native capture → transcript, on a real Mac, 2026-08-27
MAIA-D03    ✅ WITNESSED authenticated transport into the live MAIA routes
MAIA-D04    ◑  PARTIAL   same member + same substrate proven; same CONVERSATION not
MAIA-D02    ◑  OPEN      reliability — the transport defect is fixed and witnessed  ← HERE
MAIA-D05+   ○  not eligible
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
