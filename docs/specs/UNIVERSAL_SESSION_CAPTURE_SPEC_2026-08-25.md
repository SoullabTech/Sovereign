# Universal Session Capture — Specification

**Date:** 2026-08-25 · **Status:** Design specification. **No schema, no client, no production change is authorized by this document.**
**Branch:** `claude/maia-onboarding-orientation-djtoii`
**Governed by:** `docs/specs/NATIVE_SESSION_ROOM_PHASE1_SPEC_2026-07-05.md` (evidentiary layers, R-A1) ·
`docs/canon/ENCOUNTER_AS_PRIMITIVE.md` · `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` ·
`docs/security/free-text-phi-doctrine.md` · `docs/ops/COLAB_RELEASE_GATE.md`

**Claim layer:** **Designed** (substrate) / **Vision** (Watch, Siri). Everything below is unbuilt unless §2 says otherwise.

---

## 0 · The proposition, restated

> **One capture system. Many capture surfaces. One Session Room memory.**

The target is not "bring Session Room to a small screen." It is that a practitioner can preserve a moment
**without leaving the moment**, from whatever device is on their body, and find those fragments waiting when
they sit down to write.

The distinction that makes this work — and that the current substrate does not yet express — is:

| | **Capture** | **Session Note** |
|---|---|---|
| When | during, in seconds | after, deliberately |
| Authored by | the practitioner, atomically | the practitioner, from captures |
| Form | a mark, a fragment, a spoken sentence | a coherent document |
| MAIA's role | **none** | may organize and draft, marked as derived |
| Mutability | **immutable** | edited and approved |

Desktop is good at reflection. Phone is good at capture. Watch is good at marking presence without leaving it.
MAIA is good at reconstitution afterward. **The system should let each do only its own part.**

---

## 1 · This distinction is already ruled — name it correctly

The Session Room spec establishes **four evidentiary layers** that must never masquerade as one another:
raw audio → transcript → speaker attribution → reflection. *"System-derived reflection is Reflection layer at
most and may never manufacture Recognition."*

A capture does not fit any of the four. It is not audio, not derived text, not an attribution guess, and not
meaning-made-later. It is **a practitioner's authored observation, made in the room, in their own words.**

**Ratified amendment (Kelly, 2026-08-25).** The first draft called Observation a fifth layer *"above
Reflection."* **"Above" is withdrawn** — it implies epistemic superiority, which is not what is meant.
Observation is **closer to source**, not more true. The ratified model is a chain of custody, not a ranking:

```
   CAPTURE           raw retained source — audio, transcript, attribution
        │            (the Session Room's original layers 1–3 sit in this band)
        ▼
   OBSERVATION ★     human-authored noticing / marking / dictation about what occurred
        │
        ▼
   REFLECTION        interpretation, meaning-making, synthesis
        │
        ▼
   RECOGNITION       qualified pattern attribution
        │
        ▼
   INTEGRATION /     how prior material responsibly re-enters relationship
   RETURN
```

The distinction this protects, in the practitioner's own material:

> *"Client became angry when discussing her father."* — **Observation.**
> *"The father complex is activating Water."* — **Recognition.**

These are not the same epistemic object and must never be stored, displayed, or synthesized as if they were.
That difference is cheap to hold now and impossible to reconstruct once AIN is working across thousands of
captured encounters.

Two consequences follow immediately and govern the whole design:

- **A MAIA draft may never absorb an observation.** The draft is Reflection; the mark is Observation, one band
  closer to source. A synthesis may cite observations; it may never replace, rewrite, or absorb them.
  **Authorship and provenance survive every transformation** — this is the property the whole chain exists for.
- **MAIA may organize observations; MAIA may never retroactively become their author.** Nothing at Reflection
  may write a row at Observation. That is the exact
  upward-only violation the Direction of Authority exists to prevent — meaning manufactured at a higher layer
  and then presented as something the practitioner observed.

---

## 2 · What already exists (and three collisions to avoid)

Read from source on 2026-08-25. **This is the part the proposal most needs**, because two of these already
solve pieces of it and one of them is a trap.

### 2.1 Reusable — the Encounter lane

| Object | What it gives us |
|---|---|
| `encounters`, `encounter_participants` (`practitioner`/`client`/`supervisor`/`observer`) | the session container and who is in it |
| `encounter_consent_events` (`text_snapshot` = the exact language shown) | consent as a **recorded event**, per participant, per kind |
| `encounter_media_streams` + trigger `enforce_record_consent_before_stream()` | **R-A1, enforced in the database**: a media stream cannot exist without a matching record-consent row. Not a checkbox — a foreign key. |
| `encounter_transcripts.raw_text_enc` / `_enc_meta` | the born-encrypted column pattern for free text |

### 2.2 The pattern to copy — `living_encounter_events`

A different encounter (member↔MAIA, not practitioner↔client), but it has already solved exactly the modelling
problem this proposal raises:

- **append-only** — *"No UPDATE/DELETE paths on `living_encounter_events`, ever."*
- **provenance in the payload** — `{ source: 'member_marked' | 'structural' }`
- **an explicit observation instrument, ruled as not an interpretation layer** — and within it, `novelty` and
  `recovery` are **member-markable only**: *"no semantic/sentiment inference ever produces them."*

That last rule is the capture system's rule, already written down for a neighbouring object. **Captures are
practitioner-marked only.** The proposal should not invent a new provenance vocabulary; it should inherit this one.

### 2.3 Three collisions

1. **`lib/capture/` is already taken.** `captureStore.ts` is *Capture Mode* — a devlog/content system with its
   own `CaptureNote`, `CaptureSession`, and tags `ship | fix | decision | blocked | next`, exporting to
   Descript chapters and Patreon drafts. Naming the new object `Capture` guarantees confusion in code review
   forever. **This spec uses `EncounterMark`** (`lib/encounter/marks/`). Naming is open — §9 Q1.

2. **`session_voice_notes` is not the foundation — RED, legacy privacy debt (see §2.4).** It stores `transcript TEXT NULL`
   alongside `client_id` in plaintext, with no `_enc` columns. It predates the free-text PHI doctrine
   (Feb 2026 vs. the doctrine's Phase 2 work), so this is legacy rather than a regression. But under the
   doctrine — *"free-text that may reference a client is PHI unless explicitly exempted"* — **the new object
   must not extend this table or copy its shape.** Whether the legacy table needs remediation is a separate
   question this spec raises but does not answer (§9 Q4).

3. **`practitioner_client_notes` is the shape to follow.** Born encrypted, deliberately no plaintext column,
   no Stage A dual-write, and — instructively — it **refused to add a `visibility` column** because member
   sharing had not been ruled: *"encoding a column for it now would make the schema assert a policy that does
   not exist."* The proposal's `visibility: private | shareable` field falls under exactly that refusal. See §3.

### 2.4 `session_voice_notes` — RED, and a separate unit

**Classified (Kelly, 2026-08-25): RED — legacy privacy debt, separate remediation unit. NOT "Capture
architecture blocked."** The difference matters: this must not derail the Capture programme, and it must not
sit as a footnote either.

A bounded remediation unit establishes, in order:

1. whether the table is actually populated in production;
2. what data category the rows contain;
3. which runtime paths still write and read it;
4. retention behaviour;
5. encryption and storage controls around the database itself;
6. migration and deletion implications;
7. whether it should be retired into the new capture substrate at all.

> **Do not casually migrate the contents into the new constitutional system merely because the new system is
> cleaner. Legacy material needs custody first.**

Nothing in §3 onward depends on the outcome.

---

## 3 · The object

```
EncounterMark                        ── append-only, born encrypted, practitioner-authored
  id
  encounter_id      → encounters(id)
  author_id         → encounter_participants(id)   -- never a bare user id; the room says who this is
  marked_at         timestamptz                    -- wall clock
  offset_ms         int                            -- position within the encounter
  modality          'mark' | 'text' | 'voice' | 'photo' | 'followup'
  source            'web' | 'ios' | 'watch' | 'siri'
  body_enc          text NULL                      -- ciphertext ONLY. no plaintext sibling. NULL for 'mark'
  body_enc_meta     jsonb NULL
  transcript_enc    text NULL                      -- for 'voice', from local Whisper
  transcript_enc_meta jsonb NULL
  media_ref         text NULL                      -- audio/photo, sovereign storage
  client_captured_at timestamptz                   -- what the device believed; kept, never trusted
  dedupe_key        text                           -- idempotency for offline replay
```

### 3.1 What is deliberately **not** in the schema

- **No `tags[]` column, yet.** A tag vocabulary (`Insight · Emotion · Body · Pattern · Question · Follow-up`)
  is a documentation standard. `practitioner_client_notes` refused `note_type` for precisely this reason.
  Tags arrive when there is a practitioner gesture that produces them and a ruling on the vocabulary — not
  before. Until then a typed fragment carries its own words.
- **No `visibility: private | shareable`.** Client-facing sharing of practitioner material is **unruled**
  (the Now What? door map has *Notes from Larry* gated on exactly this). A column asserting a policy that
  does not exist is the failure the neighbouring migration already refused. Marks are practitioner-private,
  full stop, until ruled otherwise.
- **No `elemental` column.** Elemental classification of a moment in another person's session, made in
  seconds, is Recognition-layer material about a third party. Not from a wrist tap.
- **No UPDATE path.** A wrong mark is corrected by a new mark, or deleted by its author. It is never rewritten.
  Immutability is the whole point: it is what lets a derived note be *derived* rather than *asserted*.

### 3.2 The one hard invariant

> **R-M1 — No mark exists outside an encounter whose consent threshold has been crossed.**

`encounter_id` NOT NULL, and — following R-A1's precedent — a trigger, not a code path. The Session Room's
existing guarantee is that *the system cannot begin recording because the precondition object does not exist.*
The same must be true of marks: a wrist tap during a session that never opened a threshold has nowhere to land.

---

## 4 · The consent question the Watch forces

This is the part of the proposal that most needs a ruling before any code, and it is not obvious.

**MARK is constitutionally cheap.** A timestamp with no content. It records *that the practitioner's attention
moved*, not *what the client said*. It is the closest thing to a purely practitioner-side act in the whole
system. Start here — the memo is right that it is the deceptively powerful feature.

**SPEAK is not cheap.** A practitioner dictating *"something shifted when she talked about her father"* while
sitting three feet from that person is:

- **audio captured in a room containing a client**, whose consent model is governed by R-A1;
- **free text about an identified client** the moment it is transcribed — PHI by default;
- **audible to the client**, which is a relational fact, not only a data fact.

Three positions are defensible and the difference matters. **USC-Q2 is ruled: P3.**

> **MARK and SPEAK are constitutionally different acts.** MARK says *"something here matters."* SPEAK opens a
> microphone in the presence of another human being and introduces new content. **MARK does not grant SPEAK
> consent**, and no interface may let one imply the other.


| Position | Claim | Consequence |
|---|---|---|
| **P1** | A practitioner's dictated observation is their own utterance, not a recording of the encounter. | Governed by PHI rules only; no `record` consent needed. |
| **P2** | Any mic opened in the room is a media stream. | R-A1 applies in full; SPEAK is unavailable without client record-consent. |
| **P3** ✅ **RATIFIED (Kelly, 2026-08-25)** | It is the practitioner's utterance **and** it opens a mic in a shared room. | SPEAK requires its own consent kind — `practitioner_dictation` — disclosed in the threshold's `text_snapshot`, plus: push-to-talk only (never ambient, never always-on), local Whisper transcription (already self-hosted), audio discarded on successful transcription by default, and a visible indicator on the practitioner's device while the mic is open. |

P3 costs one consent kind and a sentence at the threshold. P1 saves that and risks the exact thing the
Session Room's threshold ruling exists to prevent: a second human recorded without an authored consent row.

**Recommended threshold language, disclosed to the client at consent time (needs voice review):**

> *Your practitioner may make private notes during our time, sometimes by speaking them aloud. Those notes are
> theirs, about their own work. They are not a recording of you.*

---

## 5 · Surfaces

### 5.1 Apple Watch — the presence instrument

**V1 is two gestures. Not a menu, not an app.**

```
      ┌───────────────────────┐
      │   SESSION    32:14    │      MARK  → haptic → screen dismisses
      │                       │              one tap, no confirmation,
      │        ◎              │              no undo prompt in the room
      │       MARK            │
      │                       │      SPEAK → press and hold → speak →
      │   ─────────────       │              release → haptic → dismissed
      │        🎙              │              (push-to-talk; mic never
      │       SPEAK           │               opens on its own)
      │                       │
      └───────────────────────┘      No tags. No categories. No lists.
                                     Nothing to read. Nothing to decide.
```

**The rule that makes it worth building:** *presence is more valuable than metadata.* Nothing on this screen
may ask the practitioner to classify anything while they are sitting with another human being.

**Offline is the default assumption, not an error path:**

```
   tap ──► local write ──► haptic ──► queued transfer ──► Session Room
                             ▲
                   confirmation happens HERE,
                   not after the network answers
```

`WatchConnectivity` background queued transfers survive app suspension; the correct failure mode is
*"tap → local save → haptic → syncs later"*, never *"tap → spinner → error → lost thought."* The `dedupe_key`
in §3 exists for this replay.

**Platform notes, verified against Apple's own restrictions:** do **not** architect around the Watch Ultra
Action button — third-party Action-button App Intents are currently restricted primarily to workout/dive
intents. Complication, Smart Stack, app, and Siri routes are general and sufficient.

### 5.2 iPhone — one thumb, one second

```
┌──────────────────────────┐    Tap        → mark
│  ● SESSION ACTIVE 32:14  │    Hold       → speak
│                          │    Type       → fragment
│   ┌──────────────────┐   │    Photo      → workshop/handwritten material
│   │                  │   │    Follow-up  → something to return to
│   │        ◎         │   │
│   │   hold to speak  │   │    Exposed outside the app where Apple permits:
│   │                  │   │    Lock Screen widget · Home Screen widget ·
│   └──────────────────┘   │    Smart Stack · App Intents / Shortcuts / Siri
│                          │
│   ⌨︎ type    📷 photo    │    "Siri, make a Soullab note: grief appeared
│                          │     when she mentioned home."
└──────────────────────────┘     → lands in the ACTIVE session, not Apple Notes
```

**The Capacitor reality, stated plainly, because it is the largest hidden cost in this proposal:**
MAIA's iOS app is a Capacitor WebView. **watchOS cannot run a WebView app.** A Watch companion requires a
native SwiftUI watch target, a native iPhone extension to receive `WCSession` transfers, and a Capacitor
plugin bridging queued marks into the web layer. Siri/App Intents likewise need native intent definitions.
This is real native work in a project whose mobile posture has so far been "one web app, wrapped." It does not
make the Watch wrong — the Watch may be the single most differentiated surface here — but the sequencing in §8
puts it last for this reason and not only for product reasons.

Also inherited: the **Capacitor cookie trap** (`SameSite=Lax` cookies are not sent from the iOS WebView).
Every capture call authenticates via `x-member-id` through `apiFetch()`. A native watch/phone extension does
not get the WebView's session at all and needs its own token path — an unsolved seam, §9 Q3.

### 5.3 Session Room — where fragments become meaning

```
┌─────────────────────────────────────────────────────────────────┐
│  Session · Tuesday 10:00–10:50                                  │
│                                                                 │
│  SESSION CAPTURES                                    6 marks    │
│  ──────────────────────────────────────────────────────────     │
│  10:07  ◉  Marked moment                              ⌚         │
│  10:13  🎙 "Notice the sudden change from anger to     ⌚         │
│             sadness."                                           │
│  10:22  ◉  Marked moment                              ⌚         │
│  10:31  ✎  tightness in chest when mother came up     📱         │
│  10:46  ↗  Follow up on dream image                   📱         │
│  10:49  ◉  Marked moment                              ⌚         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Ask MAIA to organize these                               │ │
│  │  Draft a session note from them                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Your captures stay exactly as you made them.                   │
└─────────────────────────────────────────────────────────────────┘
```

Instead of an empty textarea after a fifty-minute session: **the practitioner's own attention, replayed.**

**Rules on the derived note:**

1. **The captures are never mutated by the draft.** Two objects, one derived from the other, both retained.
2. **Every claim in the draft traces to a capture.** A sentence with no capture behind it is MAIA's inference
   and must be visibly marked as such — Reflection layer, per §1.
3. **MAIA may organize; it may not conclude.** *"Major movements", "themes", "questions to revisit"* are
   arrangements of the practitioner's own material. *"The client is working through unresolved grief"* is a
   conclusion about a third party who is not in the room for this step, and is out of bounds.
4. **The practitioner approves.** An unapproved draft is not a session note; it is a suggestion.
5. **The elemental layer, if it ever appears here, appears after the practitioner's own organization** —
   never as the first frame offered.

---

## 6 · What must not be built

- ❌ Three note systems (Watch notes / mobile notes / Session Room notes). One object, many surfaces — this is
  the proposal's best structural instinct and it should be held rigidly.
- ❌ Ambient or always-on listening on any device. Push-to-talk only, on every surface, forever.
- ❌ AI-generated captures. Reflection may not write Observation (§1).
- ❌ Automatic classification of a capture into insight / emotion / body / pattern without a practitioner act.
- ❌ Any mark surface that renders when no session is active — it would have nowhere to land (R-M1) and would
  quietly become a general note-taking app, which is not what this is.
- ❌ Client-visible capture surfaces in v1. Sharing is unruled (§3.1).
- ❌ A plaintext `transcript` column. The one existing precedent for that is the finding in §2.3, not the model.

---

## 7 · Gates this work trips

**The Co-Lab Release Gate is mandatory here.** Its trigger list names *sessions/encounters*, *files*, and *any
migration touching those tables* — this proposal touches all three:

```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-colab-boundaries.ts'
# required: 31 passed · 0 failed · 0 warned
```

Also required before any capture surface reaches a practitioner with a real client:

- a **refusal-registry entry + constitutional test** for R-M1, alongside R-A1's (`npm run check:refusals`);
- a **PHI leak test** in the pattern of `lib/security/__tests__/phiLeakPrevention.test.ts` proving no mark body
  or transcript reaches a log line (IDs and counts only, per the doctrine);
- an **offline-replay test** proving `dedupe_key` idempotency — a Watch that syncs twice must not double a
  practitioner's observation.

---

## 8 · Sequencing

The memo's three layers are right; the order inside layer 1 needs one correction — **the consent ruling
precedes the schema**, because §4's outcome changes the columns.

| # | Layer | Contents | Gate to the next |
|---|---|---|---|
| **0** | **Rulings** | §9 Q1–Q5, especially the SPEAK consent position | nothing is built before Q2 |
| **1** | **Substrate** | `EncounterMark` table (born encrypted, append-only), R-M1 trigger, write/read API scoped to the encounter, refusal test | Co-Lab gate 31/31 |
| **2** | **Web capture in the Session Room** | mark + type + voice from the surface that already exists; the timeline view of §5.3 | a practitioner uses it in a real session and the timeline is worth reading |
| **3** | **iPhone quick capture** | one-thumb control while a session is active; then widgets / App Intents / Siri | offline queue proven under real loss of signal |
| **4** | **Apple Watch** | MARK + SPEAK only; native target + `WCSession` bridge | — |

**Why the web surface comes before the phone:** it needs no native work, no new auth seam, and it answers the
only question that matters before investing in devices — *does a timeline of fragments actually make the note
easier to write?* If it does not, the Watch will not save it.

---

## 9 · Rulings required

| # | Question | Why it blocks |
|---|---|---|
| **Q1** | Object name — `EncounterMark`? `SessionMark`? | `lib/capture` is taken by Capture Mode (§2.3). |
| **Q2** | Which SPEAK consent position — P1, P2, or **P3** (§4)? | Determines whether a new consent kind, threshold language, and a `text_snapshot` change are in scope. Blocks the schema. |
| **Q3** | How does a native Watch/phone extension authenticate, given the WebView's `x-member-id` posture? | No answer means no Watch, regardless of design. |
| ~~Q4~~ | *Resolved by classification (Kelly, 2026-08-25): RED — legacy privacy debt, separate remediation unit. Does **not** block Capture. See §2.4.* | — |
| **Q5** | Do captures ever become client-visible? | Currently unruled and modelled as *no column* (§3.1). Same ruling as *Notes from Larry* in the Now What? door map. |

---

## 10 · Growth-obligation answers

Required by `CLAUDE.md` for any capability increase.

**What uncertainty does this introduce, and how is it preserved?**
A mark made in one second is ambiguous by construction — the practitioner does not yet know why the moment
mattered. That uncertainty is preserved by keeping marks immutable and unclassified: no tag vocabulary, no
inferred category, no elemental assignment. The fragment stays as ambiguous as it was when it was made, and
only the practitioner may later say what it meant.

**What provenance and ownership boundaries does this require?**
The five-layer model (§1) with Observation above Reflection; every derived sentence traceable to a capture;
MAIA structurally unable to author at layer 0; marks born encrypted and practitioner-private, because they are
free text about a person who is not their author.

**What new responsibility does this capability create?**
Capture makes it easy to accumulate observations about another human being who cannot see them. That is a
real asymmetry, and it grows with every device we add. The responsibility is threefold: the client is told at
the threshold that private practitioner notes happen (§4); the notes are structurally practitioner-private
rather than incidentally so; and no surface may ever tempt the practitioner to classify a person while sitting
in front of them. **The instrument must make presence cheaper, not attention more expensive.**

---

*We are not building note-taking. We are building continuity of attention — a way to say "remember this moment
for me" without leaving the moment. Every constraint above exists to keep that sentence true for both people
in the room.*
