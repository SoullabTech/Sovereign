# Now What? — Field Participation Reconciliation

**Date:** 2026-08-03 · **Status:** ⛔ **RECORD ONLY — NO DESIGN DECISION.**
Nothing here authorizes an object, a schema, a Home change, or an implementation lane.
Claude may Draft and Record, never Ratify.

**Purpose:** establish what already exists, in which direction authority flows, and what is genuinely
absent — **before** a practitioner-field model is authored. Written because a proposed model was about
to be built on two premises that measurement did not support.

**Measured against:** trunk `origin/clean-main-no-secrets`, deployed image `95b21ce42`, and the parked
branch `feature/bring-forward-v1`. Every row below names its referent.

---

## 0. ⭐⭐⭐ Headline finding — the practitioner container object is not missing

The reconciliation was opened to answer *"does the platform need a practitioner-authored container
object, and should it be called a Program, Cohort, Practice, Course, or Field container?"*

**Measurement answers the first half: it already exists, on trunk, and the deployed Home already reads
it.** `field_programs` even carries the naming question as a settled enum:

```sql
kind TEXT NOT NULL CHECK (kind IN ('coaching','training','workshop','course','retreat'))
```

**This is the fourth instance in one session of an apparent existence failure that measurement
resolved into a referent failure** (see the ledger in §5). The proposed next artifact would have
authored a `Program` object that is already deployed and already queried by the Home being redesigned.

⛔ **This does not mean the design question is closed.** It means the question changes from *"what should
we build?"* to *"what is actually absent about the thing we have?"* — which is a different question with
a different remedy, and it is **not answered here.**

---

## 1. Verified direction of authority — corrected

### The correction

A model was proposed in which `coach_shared_offerings` is a *"practitioner → member visibility bridge"*
meaning *"here is something available to you."* **Measurement inverts it.** The direction is:

```
Member-owned Field expression
        ↓  member's act — "I bring this forward"
Shared Offering
        ↓  projection
Practitioner receives
```

**Not** `Practitioner → offers → Member Field`.

### The enforcement is structural, not conventional

`database/migrations/20260803000001_coach_shared_offerings.sql`:

```sql
IF NEW.offered_by_member_id <> client_id THEN
  RAISE EXCEPTION 'Only the client may bring something forward. Member % is not '
                  'the client of relationship %.', NEW.offered_by_member_id, NEW.relationship_id;
```

Migration comments, verbatim: *"a practitioner cannot offer on a member's behalf"* ·
*"The practitioner never browses the member. They receive what was offered."* The trigger exists
specifically to close *"the case where a practitioner-side write path — present or future — creates a row."*

⇒ **`coach_shared_offerings` is not misnamed and is not the practitioner→member bridge.** Reusing it as
one would fail at the trigger. Concluding that a practitioner→member bridge exists because this table
exists would be false.

---

## 2. Object map — what exists, where it lives, who may write it

| Object | Referent | Answers | Write authority |
|---|---|---|---|
| **`practitioner_clients`** | trunk + deployed | *who works with whom* | — (relationship spine, re-established by #902) |
| **`field_programs`** | trunk + deployed | *the practitioner's container* — title, `kind`, ordered `focal_points`, `current_focal_point` (cohort default) | **practitioner** (`lib/practiceField/programAuthoringService.ts`) |
| **`field_program_positions`** | trunk + deployed | *the member's position in that container* — `focal_point`, `stated_by`, `member_confirmed_at` | **both, asymmetrically** — see §3 |
| **`field_program_lessons`** | trunk (`20260714000001`) | practitioner-authored lesson content | practitioner |
| **`field_program_revisions`** | trunk | revision history of the above | practitioner |
| **`member_field_note_threads`** | trunk + deployed | the member's authored material — the Home's Decisions / Commitments / Questions / Reflections | member |
| **Field Object** | ruled 2026-08-02 | *the member's enduring work* | **member's meaning-making act only** |
| **`coach_shared_offerings`** | ⚠️ **`feature/bring-forward-v1` ONLY — absent from trunk AND from `95b21ce42`** | *what the member intentionally brought forward* | **member only (trigger-enforced)** |

⚠️ **The last row is built but not merged and not deployed.** The branch is 8 commits ahead of trunk and
parked. *Existing in a branch is not existing in the system* — the distinction this session exists to keep.

**Read wiring, verified:** the deployed Home (`app/api/now-what/home/route.ts`) already joins
`field_program_positions` → `field_programs` to compose its `journey` band. `practitioner_programs` and
`program_enrollments` have **zero** references anywhere — they are names from the proposal, not objects.

---

## 3. ⭐⭐⭐ The sovereignty boundary is already encoded in the schema

The proposed model asked for: *the practitioner creates pathways; the member creates meaningful
inclusion; the practitioner never places into the member's Field.*

`field_program_positions` already implements exactly that split:

```sql
stated_by TEXT NOT NULL CHECK (stated_by IN ('member_confirmed','member_stated','practitioner_seeded')),
member_confirmed_at TIMESTAMPTZ,   -- NULL until the member's own gesture
```

**A practitioner may seed a position. Only the member's own gesture confirms it,** and the schema keeps
the two distinguishable forever rather than collapsing them into one "assigned" state. That is the
proposed authority model, already in the substrate, already deployed.

⭐ **The vocabulary the proposal was reaching for exists as data, not as design debt.**

---

## 4. What is genuinely open

⛔ None of these are answered here.

| # | Question | Why it is open |
|---|---|---|
| **Q1** | Given that the container exists, **what is actually absent about it** — capability, activation, authority, or visibility? | The four-branch classification exists (§5); **it has not been run against the program objects.** ⛔ Do not assume "activation gap" because it is the fashionable answer |
| **Q2** | Is there a **practitioner→member invitation/enrollment edge**, or does membership derive implicitly from a position row? | Not measured. `field_program_positions` has no explicit enrollment act |
| **Q3** | Do practitioner **resources** reach a member, and by what edge? | `field_program_lessons` exists on trunk; its read path was not traced |
| **Q4** | Does the Home begin **Option A** (*what is alive · where am I working · what might I choose*) or **Option B** (*what am I enrolled in · what is next · what resources exist*)? Or does B become **context feeding** A rather than a navigation layer? | ⚠️ **A is the deployed and ruled answer.** B is a proposed reversal — see §6 |
| **Q5** | Field Object **versioning / declaration** | ⏳ UNRULED, founder holds it. ⛔ Upstream of the offering primitive *and* of any UI |
| **Q6** | Does `coach_shared_offerings` merge, and on what authority? | Parked. Not this document's question |

---

## 5. The classification instrument, unapplied

Agreed but **not yet run** against the program objects:

| Observed condition | Derived status | Correct response |
|---|---|---|
| Door exists + route resolves + substrate + write path | **Active** | none |
| Door missing + route/substrate/write path exist | **Activatable — hidden entry point** | navigation |
| Substrate or write path missing | **Capability unavailable** | build |
| Conceptual surface only, no implementation path | **Unavailable** | defer or redesign taxonomy |

⛔ **`latent` is not collectible** — it is a theory of absence, not an observation of one. Facts are
collected; status is derived afterward by a written rule.
⛔ **A build follows ONLY a capability gap.**

---

## 6. Rulings this touches — none reversed here

| Ruling | State | What the proposal would do to it |
|---|---|---|
| `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` — *a Field Object exists when the member performs the act; that act is the authority boundary* | ✅ **RULED** | **compatible** — practitioner containers never author Field Objects |
| Lane reconciliation — Home inventory **superseded**; `what is alive · where I am working · what I might choose` ✅ over `my things → shared things` ⛔ (*"the act must emerge from meaning, not from a register of past acts"*) | ✅ **RULED** | ⚠️ **a `MY PROGRAMS / Week 4 / Next:` Home is in tension with this** |
| Field Object **versioning** | ⏳ **UNRULED**, upstream of offering + UI | untouched |
| *"The declaration creates the Field Object, not the source"* | ⚠️ **CANDIDATE — framed conditionally, promotion to canon NOT done** | untouched |
| `can_be_shown_to_practitioner` is per-**object**, cannot express per-**version**; *"may survive as a convenience indicator; it cannot be the authority"* | recorded | ⚠️ the **deployed Home derives `sharedWithCoach` from exactly this column** — known-insufficient authority already live |

⚠️⚠️ **Q4 is a reversal, not a refinement.** The Home currently begins with Option A by ruling and in
production. Moving to Option B may well be right — participation context could be what makes downstream
objects legible rather than administrative — **but it must be made as a reversal with reasons on the
record, not adopted as a clarification.**

⚠️ **Unresolved discrepancy, flagged not fixed:** `MEMORY.md` records *Field Object declaration — RULED
Amendment 5*, while the topic file records the invariant as a **candidate, not ruled**. "Amendment 5"
appears in one repo artifact (`docs/specs/CORRECTION_3_LANE_RECONNAISSANCE_2026-08-03.md`) which has
**not** been opened. A hook that reads settled while its topic file says otherwise is the failure the
index exists to prevent.

---

## 7. Non-goals

⛔ This document does not:

1. Name, design, or authorize a `Program`, `Participation`, `Cohort`, or container object — **the
   container already exists; naming a second one would duplicate it.**
2. Redesign the Home, or rule Q4.
3. Merge, promote, or deploy `feature/bring-forward-v1`.
4. Run the activation classification (§5).
5. Reverse, weaken, or reinterpret any ruling in §6.
6. Resolve the Amendment 5 discrepancy.
7. Ratify anything.

---

## 8. Status

```
Direction of authority        ✅ VERIFIED — member → practitioner, trigger-enforced
Practitioner container        ✅ EXISTS on trunk + deployed (field_programs)
Participation + its boundary  ✅ EXISTS (field_program_positions.stated_by / member_confirmed_at)
coach_shared_offerings        ⚠️ built, PARKED — absent from trunk and from 95b21ce42
Activation classification     ▢ instrument agreed, NOT RUN
Q1–Q6                         ⏳ open
Home Option A vs B            ⏳ open — B is a REVERSAL of a live ruling
Implementation                ⛔ not authorized
```

> **The gap is not "how does a practitioner put something into a member's field?"**
> That question is answered, and the answer is *they do not.*
>
> **The open question is what is actually absent about the container that already exists** — and that
> is a measurement, not a model.

*The system does not outrun the evidence.*
