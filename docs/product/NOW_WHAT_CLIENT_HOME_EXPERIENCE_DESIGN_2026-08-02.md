# Now What? Client Home — Experience Design

**Date:** 2026-08-02 · **Status:** DESIGN ARTIFACT. Ratified inputs, proposed experience.
**No code. No routes. No schema.**

**Ratified inputs:**
- **Q-C** — the deferred content tables are a *protected boundary*, not a gap. The Home may compose
  from accepted structural objects, encrypted content objects once that lane exists, and explicit
  visibility acts. **It may not create temporary plaintext versions to make the UI work.**
- **Q-A** — *the relationship is shared; the claims within it are separately authored, and every
  claim carries its author.*
- **Q-B** — direction ratified, implementation open. The empty state is not emptiness; it is a
  different state of relationship.
- **Q-B′** — concurrent threads stay open by design. The question is not how to prevent them, but
  how the Home helps a person orient among several without reducing them to one.
- **E-2** — *The Home begins from what the member has chosen to carry, not what the system considers
  recent. Time may contextualize; it does not determine prominence.*
- **E-3** — *Withdrawal from member-owned Field material is silent. Changes to shared relational
  objects follow relational lifecycle rules. Private sovereignty is not converted into practitioner
  notification.*

**The three-line summary of the whole design:** *recognition before information, authorship before
chronology, relationship without surveillance.*

Prior: [Phase 0](../architecture/NOW_WHAT_CLIENT_HOME_LARRY_PILOT_PHASE0_2026-08-02.md) ·
[Phase 0.5](../architecture/NOW_WHAT_CLIENT_HOME_PHASE_0_5_BOUNDARY_2026-08-02.md)

---

## 1. Experience thesis

> **The Home is where a person meets their own work again, in the presence of someone who is
> accompanying them.**

It is not a report on them. It is not a summary of them. It is the room their material is kept in,
and it happens to have a second chair in it.

### The first thirty seconds

The order of what is understood matters more than what is shown.

| Time | What the person understands | How |
|---|---|---|
| **0–3s** | *I am in the right place, and this is mine.* | Their own most recent material is visible without scrolling. Not a greeting. Not a chart. Their words. |
| **3–10s** | *I am not doing this alone.* | One quiet line naming the relationship: working with Larry. Present, not prominent. |
| **10–20s** | *I can see what is mine and what is his.* | Three authorship registers, visually distinct at a glance, never interleaved. |
| **20–30s** | *There is a next thing, and it is my choice.* | Named doors. No recommendation, no prompt, no nudge. |

**The feeling to design for is recognition, not information.** A dashboard opens with the system's
account of you. A home opens with your own things where you left them.

### What it must never feel like

- Being assessed. No progress bars, streaks, scores, percentages, stage-completion meters.
- Being addressed by the system about oneself. No *"You seem to be working on…"* — that is synthesis
  wearing a friendly voice.
- Being behind. Absence is never rendered as deficit.
- Being managed. Larry's material is *offered*, never *assigned-at* the person.

### The claim this surface proves

> Two people can share a developmental space without one becoming the author of the other's reality.

Every design decision below is downstream of that sentence.

---

## 2. The core design constraint: three registers, legible at a glance

The architecture's authorship model must be **perceptible**, not merely enforced in the database.
If the UI flattens three kinds of claim into one stream, the person cannot tell whose account of
their life they are reading — and the invariant is intact while the experience violates it.

| Register | Voice | Meaning |
|---|---|---|
| **From Larry** | offered | *someone placed this here for you* |
| **From me** | authored | *you said this; it is yours* |
| **What we're working with** | shared | *both of you are oriented to this* |

**Rules:**

1. **Never interleave registers in a single list.** A chronological feed mixing Larry's note with
   the client's reflection is the failure mode. Time is not the organizing principle; authorship is.
2. **Each register has a stable visual signature** — position, and one consistent non-colour cue
   (label, rule, indent). Colour alone fails for colour-blind viewers and in dark mode.
3. **The signature never varies by content type.** A resource and a date from Larry read as the same
   register.
4. **Shared items show both hands.** A commitment Larry offered and the client affirmed displays
   both acts and both timestamps. The affirmation is the client's, visibly.
5. **No register may be collapsed by default** to make the page shorter. Hiding "From me" behind a
   tab makes the platform's account primary.

---

## 3. Home architecture

Bands, in the order they are met. Each band is a **relationship to the work**, not a card type.

```
┌──────────────────────────────────────────────────────────────┐
│  ①  WHAT YOU ARE CARRYING                                    │
│      what the member chose to keep, in their own words        │
│      · one quiet line: working with Larry                    │
│      · the door back into it                                 │
├──────────────────────────────────────────────────────────────┤
│  ②  WHAT YOU'RE WORKING WITH                     [shared]    │
│      thread(s) · stage · your focus                          │
│      several threads sit as peers — none is "primary"        │
├──────────────────────────────────────────────────────────────┤
│  ③  FROM LARRY                                   [offered]   │
│      practices · resources · dates · messages                │
│      each item: placed by Larry, on <date>                   │
├──────────────────────────────────────────────────────────────┤
│  ④  YOURS                                       [authored]   │
│      questions · keeps · reflections · notes                 │
│      and: what you've chosen to share                        │
├──────────────────────────────────────────────────────────────┤
│  ⑤  ANOTHER WAY IN                                           │
│      MAIA — resident, not destination                        │
└──────────────────────────────────────────────────────────────┘
```

### ① What you are carrying

**Ruled E-2.** The top of the Home is what the member **chose to keep**, in their words — not what
the system judges most recent.

Recency looks neutral and is not. *Recent ≠ important · recent ≠ alive · recent ≠ what the person
wants to return to.* Leading with it would make the platform's account of the person's attention
primary, which is the projection failure in miniature.

| Wrong framing | Correct framing |
|---|---|
| Last conversation | What you are carrying |
| Recent activity | What remains alive |
| Latest reflection | Chosen return point |
| Timeline | Relationship with the work |

> **The ordering rule: the member's gesture determines presence; time may describe, but not
> determine, prominence.**

A timestamp may appear as context — *you kept this on July 28* — but never as the reason an item is
there. No "recent" heading, no "last updated" sort framed as significance, no activity feed.

**Substrate — this is buildable today.** `member_field_note_threads` already models the gesture
exactly: `member_decision ∈ (keep, revise, split, discard, create)` with `member_decision_at`, plus
`authorship ∈ (maia_proposed, member_authored, member_confirmed)` and `is_directly_stated`. Band ①
reads kept threads. The authorship column also lets the band honour a finer distinction — what the
member *said* versus what MAIA proposed and they *confirmed* — which should be visible, not merged.

**Narrow implementation question (E-2′):** among kept items, some order must be chosen. Keep-time is
the least interpretive default available, but it must never be *presented* as recency, and member
ordering may be better. `20260627000001_member_field_note_center.sql` suggests a "center" concept
that may already be the intended mechanism — check before designing a new one.

The relationship line sits here, small: *Working with Larry.* Tapping it opens the relationship —
who Larry is, what is shared with him, what he can and cannot see. **The Home's privacy story is one
tap from the top, always.**

If nothing has been kept yet, this band becomes the arrival band (§5).

### ② What you're working with

Threads, not "your program." Each thread shows: what it is, where in it, and — separately — what the
person has said they are attending to.

**Multiple threads are peers.** A leadership program, a personal transition, and a learning process
are three legitimate simultaneous shapes. The design must not force a "main identity":

- No "primary program" slot, no thread-switcher that hides the others.
- Selected focus is **soft emphasis within a visible set** — the other threads remain on the page,
  quieter but present.
- Focus is never inferred from recency or activity. It is a stated act, or it is absent.
- Absent focus is a legitimate, unnagged state: *nothing selected right now.* No CTA to fix it.

**The distinction this band must hold:** stage is Larry's placement; focus is the client's
attention. They sit adjacent and are never merged into one "where you are" statement.

### ③ From Larry

Offered material, each item carrying *placed by Larry, on <date>*.

- Practices · resources · dates · messages.
- **Nothing here is a task list.** No completion checkboxes on items Larry authored — that would
  make his offering into a scoring surface. A practice is available, not owed.
- A commitment appears here **only until affirmed**; once affirmed it moves to band ② as shared.
  The affirmation gesture is explicit and reversible.
- **Larry's private notes never appear** — not collapsed, not greyed, not "1 private note." Their
  existence is not signalled. The Home reads publications only.

### ④ Yours

The person's own material: questions, keeps, reflections, notes.

- **Nothing here is visible to Larry unless the person has shared it**, and each item shows its own
  sharing state plainly.
- Sharing is an explicit act producing a *separate* object; the source stays theirs. The design must
  make this legible: *you shared a copy on <date>* — and **withdrawal is available at the item.**
- Volume is never a metric. No counts framed as achievement.

**Ruled E-3 — withdrawal is silent.**

> Private sovereignty is silent. Shared commitments have relational state.

| Object | On change |
|---|---|
| Member-authored Field material | **silent** — no notification, no event surfaced to Larry, no "no longer shared" marker in his view beyond the item's simple absence |
| Shared relational objects (a commitment, a jointly held practice, a practitioner-provided item) | relational lifecycle applies — these were placed *into* the relationship |

**Event language is prohibited for the member Field.** No activity log, no change history visible to
others, no *"Kelly removed X."* A platform that renders a member's private curation as a stream to
someone else has become an observation system, whatever its access controls say.

**Compatibility with what is shipped — checked, not assumed.** Withdrawal today writes a
`practitioner_visibility_withdrawn` row to `member_field_note_events`. That table is keyed to
`member_id`, and its only readers are member-facing surfaces (Now What?, Field Lab, Vision Studio) —
**no practitioner route reads it.** It is the member's own authorship record, not a practitioner
feed, so E-3 does not invalidate it. What E-3 *does* constrain: **the Home must never render that
ledger as a feed**, to Larry or to the member. It is provenance, not content.

Note also that `member_field_note_threads.can_be_shown_to_practitioner` is currently
`DEFAULT false` and documented *"DEFERRED: held FALSE, no path"* — practitioner visibility of field
notes is itself not yet open, and withdrawal is one-directional (no restore route exists). The
design must not imply a re-share that cannot be performed.

### ⑤ Another way in

MAIA is a **resident**, not the destination — one door among several, at the bottom, in the same
visual weight as the others.

MAIA on this surface may: help think about something already present, prepare for a conversation,
explore a question. MAIA may **not**: characterize the person, summarize their state, suggest what
they should work on, or narrate their development. **The Home never speaks in MAIA's voice about
the person.**

---

## 4. Surface definitions

Author · owner · visibility · authority · emotional purpose · substrate state.

| Surface | Author | Owner | Visibility | Authority | Emotional purpose | State |
|---|---|---|---|---|---|---|
| **Kept material** (Band ①) | client | person | client only | client | *recognition — what I chose to carry is here* | ✅ `member_field_note_threads.member_decision='keep'` |
| Relationship line | — | relationship | both | neither alone | *accompaniment — I'm not alone in this* | ✅ shipped |
| Thread / process | Larry | relationship | both | Larry | *context — this is the shape we're in* | ✅ shipped |
| Stage | Larry | relationship | both | Larry | *orientation — where this sits* | ✅ shipped |
| **Selected focus** | **client** | **person** | **client only** | **client** | *agency — I choose what I'm attending to* | ✅ shipped (pointer only) |
| Focus in own words | client | person | client only | client | *articulation* | ⛔ encrypted lane |
| Practice | Larry | relationship | published only | Larry offers | *support — something to work with* | ⛔ encrypted lane |
| Resource | Larry | relationship | recommended only | Larry offers | *support* | ⛔ encrypted lane |
| Date / session | either | relationship | both | shared | *anticipation — something is coming* | ◐ sessions ✅, dates ⛔ |
| Message from Larry | Larry | relationship | published only | Larry | *contact between sessions* | ⚠️ lineage unresolved — §7 |
| **Commitment — offered** | Larry | relationship | published only | Larry | *invitation* | ⛔ encrypted lane |
| **Commitment — affirmed** | **client** (`member_affirmed_at`) | relationship | both | **client** | *continuity — I said I would* | ⛔ encrypted lane |
| Note from Larry | Larry | relationship | **publication only** | Larry | *being thought about* | ⛔ encrypted lane |
| Larry's private note | Larry | relationship | **never** | Larry | — (must not be signalled) | ◐ older lane, encrypted |
| Question | client | person | client only | client | *permission to not know yet* | ◐ parallel primitive |
| Keep | client | person | client only | client | *this mattered* | ◐ parallel primitive |
| Reflection | client | person | client only | client | *meaning-making* | ◐ parallel primitive |
| Personal note | client | person | client only | client | *thinking in private* | ⛔ encrypted lane |
| Shared item | client elects | separate object | only what is elected | **client** | *deliberate disclosure* | ⛔ encrypted lane |
| Declared position | **client only** | person → snapshot | forward-only, consented | **client** | *self-account* | ⛔ (consents ✅) |
| MAIA | tool | — | client only | client initiates | *another way in* | ✅ available |

**Reading the states:** ✅ shipped · ◐ exists in a parallel lane, needs joining · ⛔ gated on the
encrypted-content lane. **The ⛔ rows are a protected boundary. No temporary plaintext substitute.**

---

## 5. States of the Home

The Home has states, not an empty state and a full one. Each is inhabited.

### A · Arrival — relationship exists, nothing placed yet

The critical state, and the one most likely to be treated as a failure. It is not.

```
Welcome back.

You're working with Larry.
Nothing is set up here yet — that's normal at this point.

In the meantime:
  → Start something of your own
  → Prepare for your next conversation
  → Explore with MAIA
```

Named doors, honest absence, no apology, no progress language, no "get started" CTA implying
incompleteness. **This state is fully buildable today.**

### B · Placed — one active thread

The canonical case. All five bands present. Focus may still be unset — unnagged.

### C · Several threads

Peers, per §2. The orienting question is *"which of these am I in right now?"* — answered by the
person's own selection or left open. Never answered by the system.

### D · Completed

The container closed; the work remains. The person's material stays exactly where it was — this is
the strongest proof that the Home is theirs and not the program's. A completed thread moves to a
quieter position and is not deleted, archived-by-default, or celebrated.

### E · No relationship

The Home is a member surface first. A person with no practitioner has bands ①, ④, ⑤ and a
complete, unapologetic experience. **The relationship enriches the Home; it does not constitute it.**

---

## 6. Prohibitions

Design-level, derived from ratified canon:

1. **No inferred progress.** Never derive advancement from activity, frequency, or volume.
2. **No development scoring.** No levels, percentages, maturity indicators, or trajectory lines.
3. **No hidden synthesis.** Nothing on the Home may be a model-generated characterization of the
   person. Every element traces to an authored act with a visible author.
4. **No recommendation engine.** "Continue" lists named doors. It never ranks, suggests, or
   personalizes an ordering.
5. **No practitioner-private material, in any form** — including its existence.
6. **No plaintext workaround** for a ⛔ surface. A band without substrate ships absent, not faked.
7. **No engagement mechanics.** No streaks, badges, reminders framed as obligation, or
   loss-aversion copy.
8. **No flattening of authorship** into one chronological stream.
9. **No forced primary thread.**
10. **No system voice about the person.**
11. **No recency-led presence** (E-2). The member's gesture determines what appears. Time may
    describe an item; it may not decide that it is there or that it matters.
12. **No withdrawal notification, and no member-Field activity history visible to anyone else**
    (E-3). Provenance may be recorded; it is never rendered as a feed.

---

## 7. Open questions this design raises

| # | Question | Why it matters | Disposition |
|---|---|---|---|
| **E-1** | **Messages lineage.** Kelly's structure includes messages from Larry. `clientMessages.ts` and `/api/practitioner/clients/[clientId]/messages` exist — but in the **older practitioner lineage**, not on the `practitioner_clients` spine. | Joining an off-spine surface would reintroduce the identity ambiguity Invariant 2 exists to prevent. | **Do not join in Slice 0.** Needs a lineage ruling. |
| **E-2** | Recency vs. election at the top of the Home. | Whether the platform's account of attention displaces the member's. | ✅ **RULED — kept, not last.** §3 ① |
| **E-2′** | Among kept items, what determines order? | Keep-time ordering must not be re-presented as recency. `member_field_note_center` may already answer this. | 🔴 Narrow, open. Decide at Slice 0. |
| **E-3** | Is withdrawal visible to Larry? | Sovereignty vs. relational honesty. | ✅ **RULED — silent for member Field; relational lifecycle for shared objects.** §3 ④ |
| **E-4** | Does the Home live at `/now-what` with `/now-what/map` retained as the room directory? | Route identity; navigation truthfulness. | Recommend yes — Phase 0 §1.1. |
| **E-5** | Mobile: this lands in the iOS PWA. Per standing finding, **rendering is not reachability** — tap targets must be measured (≥44px), not inferred from the DOM. | A Home that renders but can't be operated one-handed fails the thesis. | Design mobile-first; measure at walk time. |

---

## 8. Slice 0 — now fully specified

E-2 sharpened this rather than complicating it: Band ① turns out to rest on **shipped** substrate
(`member_field_note_threads.member_decision = 'keep'`), so the first slice is more than an arrival
screen. Bands ③ and the sharing half of ④ stay gated on the encrypted-content lane.

**The client experiences:**

```
Your work with Larry            quiet orientation — presence, not prominence
What you are carrying           kept material, their words, their gesture
Your current focus              their attention, or honestly unset
```

**The negative acceptance test — the actual proof.**

Larry:
- ✅ sees the relationship
- ✅ sees program / process placement, where it exists
- ⛔ does **not** see the selected focus
- ⛔ does **not** see private Field material
- ⛔ receives **no signal** when the member withdraws or curates (E-3)

Client:
- experiences continuity — their own material meets them
- recognizes what is theirs and what is Larry's
- understands Larry's presence **without feeling observed**

That last line is the one that cannot be verified by a passing test. It is a walk finding, and it
is the real acceptance criterion.

**Constraints carried into implementation:** services before UI (per #902 — *"UI begins only after
those services prove the identity and authorization boundaries"*); no migration; no plaintext
substitute for any ⛔ surface; E-1 (messages) excluded on lineage grounds; measure mobile tap
targets rather than infer them.

---

## 9. Status

Design artifact. Nothing implemented.

| | |
|---|---|
| **Ratified** | Q-C (resolved by evidence) · Q-A · Q-B · **E-2** · **E-3** |
| **Open** | E-1 messages lineage · E-2′ kept ordering · E-4 route identity · E-5 mobile reachability · Q-B′ concurrent threads (deliberately open, Slice 2) |

Slice 0 is specified and unauthorized. Authorization is the founder's.
