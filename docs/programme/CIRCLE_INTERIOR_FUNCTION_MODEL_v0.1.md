# CIRCLE INTERIOR FUNCTION MODEL — v0.1

**Lane** `JARVIS-CIRCLES-01` · interior design record
**Date** 2026-09-07
**Status** ⛔ **DESIGN ONLY.** No implementation, no migration, no schema, no API, no UI change, no
deploy. Every verb below is a proposal; the docket at §7 is what has to be answered first.

> **The Circle is a room people live in, not a substrate they are enrolled in.**

Everything the lane has produced so far constrains what a Circle must never do. This record describes
what it is *for*. The grammar is seven human acts:

> **Arrive · Witness · Offer · Respond · Inquire · Remember · Tend**

```
                    ARRIVE
                       ↓
                    WITNESS
                       ↕
                 OFFER ⇄ RESPOND
                       ↕
                    INQUIRE
                       ↓
                    REMEMBER

           TEND surrounds all of it.
```

---

## 1 · What exists today — verified, not recalled

Read from the branch head. This is the skeleton the model evolves.

| surface | file | what it actually is |
|---|---|---|
| three modes | `app/commons/circles/[circleId]/page.tsx` | `type Mode = 'alive' \| 'offerings' \| 'journey'` with labels **"What's alive"** · **"Offerings"** · **"The journey"**; default `'alive'` |
| field pulse | `components/circles/FieldPresence.tsx` | renders one of four sentences — *"This field is active right now" · "This field is integrating" · "You are entering a forming field" · "You are entering a quiet field"* — plus *"An inquiry is open"* |
| the heuristic | `lib/circles/fieldPulseService.ts` | ```derivePhase(hasActiveInquiry, hasSignals, hasActivity)``` → `active` if an inquiry is open · `integrating` if any signals · `forming` if any activity at all · else `quiet` |
| offerings | `components/circles/SharedFeed.tsx` | reads `/feed`; every item is an **imported** `artifact_type`/`artifact_ref` with `content_mode`, plus revoke. **There is no Circle-native authoring path anywhere.** |
| journey | `components/circles/FieldMemory.tsx` | closed inquiries and their `Synthesis` |
| settings | `components/circles/CircleSettings.tsx` | **"Generate invite link"** (creator-only, `FORBIDDEN` otherwise) · **"Leave circle"** |
| inquiry | `components/circles/CircleInquiry.tsx` | the structured form: contribute independently, then encounter others |

⭐ **The founder's three observations are confirmed by the code**, and one is sharper than it looks:
`derivePhase` has no notion of people. It reads *an inquiry is open* and *something happened
recently* and then tells the humans what their field is.

---

## 2 · The seven verbs

### 2.1 ARRIVE — *Where am I? What are we holding?*

Rename **`What's alive` → `Here`**. Today "what's alive" is operationally a synonym for *is an inquiry
open* — with none open the room mostly says the field awaits a question. Ordinary Circle life is
broader than inquiry: people share, witness, rest, disagree, relate.

`Here` shows: the Circle's name and its human-authored orientation · the open inquiry if there is one
· recent offerings · `Offer something` and `Propose an inquiry`.

⛔ **Never on this surface:** member counts · "7 active today" · "last activity 3h ago" · participation
percentages · streaks · "5 members haven't responded." Not a copy preference — **FR-08.7** (participation
must not become a member-visible signal) and **D-I5** (member count and derived FORMING/ACTIVE are
interior).

⭐ **Recency does not get to tell humans what their field is.** A field can be profoundly alive while
nobody has typed for a week. So the pulse is **demoted below human-authored orientation** — kept as
atmosphere, never as the narrator, and "last movement" leaves the surface.

⚠️ **What this creates, and it is not free.** Human-authored orientation is a **new authored field on
the Circle**. Only `name`, `description`, `created_at` are established safe outer facts, so
orientation is **interior by default** — visible to members, not in any outer representation — unless
ruled otherwise (**D-K1**). Getting this wrong publishes a Circle's self-understanding to people who
have not entered it.

### 2.2 WITNESS — *I can be here without performing.*

Almost no UI, which is the point. Enter, read, leave. **Nothing records socially**: no "Kelly viewed
this," no "8 people saw this," no read receipts, no attendance, no streaks.

Witnessing aloud (*"I hear the grief underneath this"*) is a **Response** — an authored act. Silent
reading is already participation and needs no button to legitimize it.

⭐ Binds **D-06 as corrected by the founder**: contribute-before-see belongs to **structured inquiry
only**. Peripheral participation is legitimate. ⛔ A future session must not "improve consistency" by
extending the inquiry gate to the feed — that correction was already made once (G-02).

### 2.3 OFFER — *I want to bring this into our field.*

**The largest missing function.** Verified above: every feed item is an imported artifact; a member
cannot say anything *in* the Circle without first creating an object elsewhere.

Two origins, one membrane:

```
FROM HERE          write something directly into this Circle
FROM MY FIELD      intentionally release a representation of something held privately
```

Both end at: **what enters is the representation the member intentionally offered.** No live pointer
back into the Personal Field (**FR-01/FR-08.8**, asserted by C11).

Text first. Broad, not twenty post types. The composer says **`Offer to the Circle`**, never "Post" —
the word carries the relational posture the constitution already fixed.

⭐⭐ **This creates a new object class, and it has an unanswered constitutional question.** A
Circle-native offering has **no source anywhere else**. Every existing rule about crossings assumes
one: revocation removes the Circle-side representation *and the source survives* (T1/T2); leaving
revokes what a person shared *while their originals stay private* — which is exactly what the leave
copy promises today. **For native speech there is no original.** So:

- Does withdrawing a native offering delete it, or tombstone it (**FR-15**)?
- Does *leaving* withdraw it, or does it stay as part of what the Circle lived through
  (**FR-16** — author withdrawal ≠ boundary cascade)?
- Does **removal** cascade it, as responses now do?

**Not decided here → D-K2.** ⛔ Native offering must not be built before it is answered; shipping it
under the existing share semantics would silently promise members something the code does not do.

### 2.4 RESPOND — *I want to meet what someone brought.*

Ordinary conversation without becoming a forum.

⛔ **No reactions, no likes, no counts, no "top response," no "most helpful."** Every one of those is
`contribution_points` wearing an emoji — the status economy R9 named and FR-08.7 forbids.

A response is authored speech. Later it may carry relational **orientations** — `Reflection · Witness
· Question · Offering` — as *kinds*, never *rankings*. (The first three already exist inside inquiry.)

The two modes must stay visibly different:

| ordinary response | structured inquiry |
|---|---|
| see first · respond if you want · **silence legitimate** | **feel first** · contribute independently · then encounter others |

⭐ **Depth is capped at one level:** `Offering ↳ responses`. Not `post ↳ comment ↳ reply ↳ argument ↳
sub-thread`. The Circle is the context; it must not fracture into hundreds of mini-forums. Nesting is
where a room becomes a platform.

### 2.5 INQUIRE — *There is a question worth holding together.*

Architecturally the strongest thing already built. Retain it nearly intact.

Add one earlier member act: **Propose an inquiry** → *"this question feels worth holding together"* →
procedural authority opens it formally. This separates **having a question** (anyone) from **opening a
structured process around it** (procedural authority), so questions are not a facilitator privilege.

⚠️ It also lands on **CA-15**: no code path anywhere writes `facilitator`, and `created_by` is
provenance not ownership (**D-I6**). Proposal cannot ship before someone can actually hold that
authority → **D-K3**.

**Synthesis never means "here is what the Circle believes."** It is *a reflection on what emerged* —
with provenance, contestable, and legitimately absent. MAIA may eventually help compose one, but only
under its explicit **Field Witness** authority, never as the Circle's voice.

### 2.6 REMEMBER — *What have we lived through together?*

Today: closed inquiries plus syntheses. The principle that should govern its growth:

> ⭐ **Circle memory is what the field deliberately carries — not everything the database happens to
> retain.**

Eventually: questions we lived with · things explicitly Kept · completed inquiries · agreements the
Circle authored · representations carried forward.

⛔ Never: an AI-generated history · a transcript dump · "MAIA says this was the important part."

**Keep for the Circle** is the interesting extension and the one with teeth. A member keeping *their
own* contribution is easy. *"We want this to represent us"* is a **collective act of meaning**, and the
FR-13 companion ruling is explicit: facts may be derived; **meaning must be declared**. Authority for a
collective Keep → **D-K4**. ⚠️ And if kept items ever become countable per member, the status economy
returns through the archive.

### 2.7 TEND — *This relationship has boundaries and needs care.*

`Settings` is too mechanical for what this is. **Tend the Circle** holds:

**People** — who is in this relationship. Names and roles visible *inside*. ⛔ No contribution
ranking, no activity badges.

**Purpose & Agreements** — what we are here for · how we want to relate · what happens in disagreement
· what stays here. Member-authored. (Same interiority question as orientation, **D-K1**.)

**Invitation** — who may invite, how the outer membrane appears, what threshold another person
crosses. Today invite generation is **creator-only**, which I0 classified as temporary substrate, not
settled governance.

**Facilitation** — who holds procedural authority and **how it was conferred**. Blocked on the same
CA-15 gap.

**Repair** — ⭐ **first-class, and the function that most distinguishes a Soullab Circle.** Not "Report
member." Rather: *something in the relationship needs attention* → the Circle or facilitator convenes
a process. The system **never** declares `REPAIRED ✅` — human beings do that.

⚠️ **The design constraint that makes repair safe:** a repair request must not itself become a record
against a person. If "request attention" quietly writes a durable row naming someone, it is an
accusation log with a gentle label, and people will stop using it. What it may record and for how long
is **D-K5**.

Three things stay separate, as the lane already discovered:

```
rupture / repair   ≠   boundary / safety   ≠   removal
```

Removal keeps its full FR-05 contract (authority, grounds, append-only record) and **FR-18** at the
door.

**Leave** — already strong and already honest: the current copy tells the member that leaving revokes
what they shared while their originals stay private. Keep it a visible, dignified exit; never bury it
in account settings. (Its promise needs revisiting for native offerings — D-K2.)

---

## 3 · The three changes to the existing design

1. **`What's alive` stops meaning "an inquiry is open."** Ordinary relational life belongs there.
   Rename to `Here`.
2. **Offerings gain a Circle-native path.** Today it is imported artifacts only.
3. **The automated pulse becomes secondary to human-authored orientation**, and "last movement" leaves
   the surface. `derivePhase` is a four-line activity heuristic; it must not be the room's narrator.

⛔ None of these touches `FieldPhase` itself — **CA-14** stands, and C18 asserts it.

---

## 4 · Two later functions

### 4.1 CONNECT — the Circle enables an encounter it does not own

```
Kelly encounters Maria in a Circle
        ↓  "I'd like to continue this with you."
        ↓  Maria explicitly accepts
   DYADIC FIELD
```

Not "Send DM." **FR-03** already holds that a dyad is not a Circle, so this is a *different object*,
not a Circle feature. ⭐ **The Circle enabled the encounter and inherits no access to the relationship
that follows** — no visibility, no record, no membrane.

Open: does a Circle removal or a departure affect an already-formed dyad? My reading is no — the
encounter happened, and the dyad is its own field — but that is an inference, not a ruling
(**D-K6**).

### 4.2 GATHER — synchronous life

Enter a live room, talk or practice together, leave.

⛔ **No automatic transcript. No automatic MAIA extraction.** A live room is where the no-stealth-memory
vow bites hardest: people speak differently when a machine is listening on their behalf. If something
should remain, a person **explicitly Offers or Keeps a representation afterward** — the same membrane
as everywhere else.

---

## 5 · Proposed future obligations

⛔ **IDs RESERVED, NOT REGISTERED.** Registering a MISSING required obligation would fail **FR-14** by
construction. They are registered in the act that implements them. Numbered clear of I1's C23–C26 /
T11–T18.

| id | obligation |
|---|---|
| **C27** | no Circle surface component renders a participation quantity, count, streak, or read receipt |
| **C28** | the response contract exposes no reaction, vote, or score field |
| **C29** | response depth is structurally capped at one level below an offering |
| **C30** | human-authored orientation and agreements are not readable from any outer/unauthenticated representation |
| **T19** | witnessing writes nothing observable to any other member |
| **T20** | a native offering's withdrawal/leave/removal semantics match whatever D-K2 rules — asserted against the ruling, not invented |
| **T21** | a repair request creates no durable adverse record against a named member beyond what D-K5 permits |
| **T22** | a Circle-originated dyadic field is invisible to the Circle: no membership, feed, or pulse path reaches it |
| **T23** | a synchronous gathering produces no persisted content absent an explicit member Offer or Keep |
| **T24** | ordinary responses are never gated by contribute-before-see (inquiry-only, D-06 as corrected) |

---

## 6 · Standing

```
CIRCLE INTERIOR FUNCTION MODEL   v0.1 · DESIGN ONLY
IMPLEMENTATION                   NOT AUTHORIZED
I1 (Interest Commons)            DESIGN OPEN, separate record
PRODUCTION                       UNCHANGED · UNMIGRATED · UNDEPLOYED
```

---

## 7 · Founder docket

| # | Question | Blocks |
|---|---|---|
| **D-K1** | Are human-authored **orientation and agreements** interior-only, or may some appear in an outer representation? Proposed default: interior. | Arrive · Tend |
| **D-K2** | ⭐ **A Circle-native offering has no source elsewhere.** What do withdrawal, leaving and removal do to it? Every existing rule assumes an original survives; here there is none. | **Offer — the largest missing function** |
| **D-K3** | How is **procedural authority** conferred, given that no code path writes `facilitator` (CA-15) and `created_by` is provenance not ownership (D-I6)? | Inquire (propose) · Tend (facilitation) · Repair |
| **D-K4** | Authority for a **collective Keep** — "this represents us" is declared meaning, not derived fact. | Remember |
| **D-K5** | What may a **repair request** record, about whom, and for how long — such that it is not an accusation log with a gentle name? | Repair |
| **D-K6** | Does a Circle removal or departure affect an **already-formed dyadic field**? | Connect |
| **D-K7** | Do response **orientations** (`Reflection · Witness · Question · Offering`) ship at all, or is an unmarked response better? A typed response is a small classification of one's own speech — mild, but not nothing. | Respond |

⛔ None answered to shorten the list.
