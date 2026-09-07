# SALON → CIRCLE — TWO MEMBER JOURNEYS v0.1

**Lane** `JARVIS-CIRCLES-01` · `CIRCLE-05 · INVOKE`
**Date** 2026-09-07 · **Status** ⛔ **DESIGN ONLY. NO SCHEMA.**
**Governed by** FR-19…FR-28 (rulings addendum II).

> Two walks, end to end, **before** twenty more functions are designed. Their job is to expose the
> ambiguities that actually remain. They found three.

---

## JOURNEY A — declare · enter · attend · meet · leave with nothing retained

**A1 · Declare.** Kelly selects **Jung / Depth Psychology** from the canonical set. Optional: *"I keep
circling Jung's late work and can't tell if it's insight or avoidance."* → **private to Kelly**, no
discovery authority (FR-19). Kelly is shown nothing about other people. Nothing about Kelly is shown to
anyone.

**A2 · Enter the Commons.** Kelly sees **places**, never people (FR-28):

```
JUNG / DEPTH PSYCHOLOGY

Upcoming Salons          Shadow and the Late Work · hosted by Maria · Thursday 7pm
Circles                  name · description · created_at — nothing else
Commons offerings        (if any)
```

⛔ Absent: who else declared this · member counts · FORMING/ACTIVE (interior, D-I5) · any ranking (a
sort key is a status economy).

**A3 · Attend.** One act. Kelly sees the host's name and the invitation, **not who else is coming**
(FR-20 *before*). Maria, tending it, sees registrations — and the system offers **no export, no
persistent list, no cross-Salon aggregation**.

**A4 · Be present.** People who are actually there see each other, under the identities each chose to
use (FR-20 *during*). The roster is a room function: **who is here right now.**

**A5 · Close.** FR-26. *Nothing — this gathering was enough* is a first-class, unpenalised choice.

**A6 · Leave.** Nothing is retained (FR-25): no transcript, recording, MAIA memory, summary, key
insights, attendee graph, sentiment profile. Next week Kelly can find neither a list of who was there
nor a "people you met" surface. **Maria is a person Kelly met, held in Kelly's own memory.**

### ⭐ What Journey A exposes — D-M2

> **The attendance record itself is the unresolved object.**

FR-20 governs what participants may *see afterwards*. It does not say whether the **row survives**.
Two coherent readings, and they differ materially:

| | |
|---|---|
| **the row is destroyed** at a defined point | "nothing retained" is literally true. The host loses their own record of who came. |
| **the row persists, unsurfaced** | the host can reflect; but **a co-attendance graph now exists in the database** even though nothing renders it — and *unsurfaced* is one convenience query away from *surfaced*. |

FR-25's *nothing retained* and FR-20's *the host may see registrations* pull in **opposite directions
once the gathering is over**. ⛔ Not resolved here. **D-M2.**

⚠️ Whichever way it goes, "we simply don't query it" is not the safeguard — FR-20's own logic says the
protection has to be structural, not a promise about restraint.

---

## JOURNEY B — attend · several want to continue · form a Circle · first arrival

**B1 · The moment.** Four people, at the close: *"I'd like to keep going with this."*

**B2 · The Circle-formation threshold.** ⛔ Never automatic (FR-26). The Salon does not convert.

### ⭐⭐ What Journey B exposes — D-M3

> **There is no collective creation act. There is one creation and N joins.**

Today (verified): `circles` has one `created_by`, and each member arrives through their own
`circle_memberships` row. So *"the four of us are forming a Circle"* decomposes into: one person
creates it, three others each accept — with the constitution deriving `FORMING → ACTIVE` when the third
joins (FR-11).

That is **structurally fine** and **experientially wrong**. Four people who decided together are made
into one founder and three joiners at the exact moment their equality mattered most. And `created_by`
is **provenance, not ownership** (D-I6) — so the asymmetry is real in the interface while being
meaningless in authority, which is the worst combination.

Options, not decided:

- **accept it** — one creates, others join; the interface never calls that person an owner;
- **a co-formation moment** — the intent to form is registered by several people *before* the Circle
  exists, and the Circle is created once enough have assented;
- **an interstitial object** — a "forming intent" that either becomes a Circle or lapses.

**D-M3.** ⚠️ It also touches CA-15/D-K3: nobody can currently hold procedural authority in the new
Circle, because **no code path anywhere writes `facilitator`.** A Circle born from a Salon would be born
without anyone able to open an inquiry formally.

**B3 · Each person joins.** An explicit act each, with their own consent mode.

**B4 · First arrival — `Here`.**

```
                    (unnamed yet)
        Four of us met at "Shadow and the Late Work"
                and wanted to keep going.

                  No inquiry open yet.
                  Nothing offered yet.

              [ Offer ]   [ Propose an inquiry ]
```

⛔ Not: *forming field · 4 members · 0% participation · last activity —*. A new Circle is not a
deficient one. **Human-authored orientation is the top slot** (interior by default, D-K1); the pulse
does not narrate a room that has barely begun.

**B5 · Nothing crossed with them.** The Salon transferred nothing (FR-25). Whatever the four want in
this Circle they **author here** (FR-22 native offering) or **release from their own field** (FR-01
representation). The Salon may end and be gone; the Circle starts from its own first word.

---

## What the two walks settle, and what they leave

**Settled by walking:** discovery shows places, and Journey A never needs a people surface (FR-28
holds under use) · a Salon completing with nothing is a real, sufficient outcome · a new Circle needs
human-authored orientation on day one, because the pulse has nothing true to say · nothing crosses from
Salon to Circle without a fresh authored act.

**Left open — the three the walks found:**

| # | Question | From |
|---|---|---|
| **D-M1** | **Repair intake destruction point.** The tender must know whom to contact, so a name is in the intake. *Ephemeral* needs a defined destruction point — and it cannot be "when the process closes" if closing is indefinite, or the intake is a dossier in another table. | FR-24 |
| **D-M2** | ⭐ **Does the attendance record survive the gathering?** FR-25's *nothing retained* and FR-20's *the host may see registrations* diverge after the fact. Destroyed = literally nothing retained, host loses their record. Persisted-unsurfaced = a co-attendance graph exists, one query from surfaced. | Journey A |
| **D-M3** | ⭐⭐ **There is no collective formation act.** Four people who decided together become one founder and three joiners. Accept it · a co-formation moment · or an interstitial forming-intent object? (Compounded by CA-15/D-K3: the new Circle has nobody who can hold procedural authority.) | Journey B |

> ⭐ **ALL THREE CLOSED SAME DAY — founder rulings FR-29 · FR-30 · FR-31 (rulings ADDENDUM III).**
> **D-M1** → intake destroyed at **terminal disposition** (`resolved | declined | withdrawn | lapsed`),
> with a **hard maximum lifetime** for the unresolved case; only non-reconstructive aggregates survive.
> **D-M2** → the **stronger branch**: identified co-attendance is **destroyed, not hidden** —
> *persisted-but-unsurfaced is rejected, because retaining the edges IS constructing the graph.*
> ⚠️ Consequence: **the member's own attendance history goes too**; a *"your gatherings"* list is still a
> person↔Salon edge. **A Salon is remembered by the people who were there.**
> **D-M3** → ⭐ **creation is not formation.** `initiated_by` is provenance only; a Circle comes into
> being through a **collective formation act** (`constituted_by = {A,B,C,D}`), and **ACTIVE requires
> separately constituted facilitation** — CA-15 must not be repaired by making the initiator facilitator
> by default. Until then `FORMING` is valid and `ACTIVE` is not.
> ⚠️ Forward implication recorded: **FR-11's derivation gains a second term**, so **S4c** becomes
> *three AND facilitation constituted*; ⛔ not changed now — the current assertions are correct for the
> current substrate, and the verified 63/63 must not later be mistaken for coverage of a rule that had
> not yet been made.

⛔ No schema. ⛔ No implementation authorized.

---

## Proposed future obligations

⛔ **RESERVED, NOT REGISTERED** (FR-14: a MISSING required obligation never discharges). Clear of
C23–C32 / T11–T29.

| id | obligation |
|---|---|
| **C33** | no exported contract returns another member's interest declaration or expressive text (FR-19) |
| **C34** | `target_member_id` — or any equivalent column naming a person — does not exist on the repair-request object (FR-24) |
| **C35** | no response object may reference another response as parent (FR-23) |
| **C36** | no discovery surface enumerates people (FR-28) |
| **T30** | a withdrawn native offering leaves no payload, summary, or reconstruction; responses survive; the tombstone carries no author identity (FR-22) |
| **T31** | leaving and removal withdraw the member's live native offerings; others' responses survive independently (FR-22) |
| **T32** | after a Salon ends, no path returns its attendee set to any participant (FR-20) |
| **T33** | a Salon produces no persisted content absent an explicit post-hoc member act (FR-25) |
