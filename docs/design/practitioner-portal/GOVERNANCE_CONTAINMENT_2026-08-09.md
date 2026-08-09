# Governance Containment — Durable Record + Smallest Fix

**Date:** 2026-08-09 · **Status:** PART 1 recorded (founder-directed). PART 2 is DESIGN ONLY — no implementation.
**Founder ruling, 2026-08-09:** *"Readiness is modeled. Containment is not."*
**Related:** [`RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md`](../now-what/RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md) §Addendum · [`FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md`](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md)

---

# PART 1 — DURABLE RECORD OF THE 2026-08-03 CONTAINMENT

Recorded in docs per founder direction, because it currently exists **only** as a free-text database string that the ordinary save path would erase.

**Subject:** `practice_fields` row `8be895ad…` (production `maia_consciousness`, minisforum).

**Verbatim `status_reason` as stored:**

> `contained 2026-08-03: active content was Soullab candidate material composed as Larry program corpus; preserved as evidence pending governance decision`

**State as measured 2026-08-09 (read-only; lengths only, no authored content read):**

| Field | Value |
| --- | --- |
| `status` | `pending` |
| `welcome_message` | 129 chars |
| `how_we_work_together` | 434 chars |
| `how_maia_supports` | 507 chars |
| `professional_practice` | 225 chars |
| `updated_at` | 2026-08-05 22:18 |
| **`checkPracticeFieldReadiness` recomputed** | **`is_live = true`** |

**Why this matters:** the field satisfies every readiness requirement. It is non-live *only* because a human wrote that sentence into `status_reason`. `syncStatus` (`lib/practiceField/practiceFieldService.ts:118-130`) overwrites `status` **and** `status_reason` unconditionally after every update. One save through `PracticeFieldEditor` would set `status='live'`, null the reason, satisfy Gate 0, arm the invitation pathway, and on first invite freeze the contained content into an immutable formation snapshot (`createSnapshot`, FORMATION_AS_RECORD).

**Standing constraints until Part 2 ships:**

- ⛔ Do **not** open `8be895ad…` in `PracticeFieldEditor`. Inspection through the editor is itself the hazard — the save path is what erases the containment.
- ⛔ Do **not** use it for ceremony-adoption testing.
- ✅ Adoption testing uses `87c28398…` (legitimately incomplete — `welcome_message` NULL) or a fresh field, and only after the practitioner-identity question is settled.
- The other pending field, `87c28398…`, carries `status_reason = NULL` and therefore holds the schema **default** `'pending'` — it has never been through `syncStatus` at all. Correctly pending, but by default rather than by evaluation.

**Provenance gap, stated honestly:** the containment is not recorded in git history or any prior document. Author and authorizing decision are unknown from evidence; only the date and the sentence survive. This document is the first durable record, not a reconstruction of the decision.

---

# PART 2 — SMALLEST FIX (DESIGN ONLY)

## 2.1 The distinction to encode

```
readiness    = "could this go live?"     ← computed from content
containment  = "is this allowed to go live?" ← a governance act
```

**Independent.** The state the current model cannot represent:

```
ready = true  ∧  contained = true   →  MUST REMAIN NON-LIVE
```

**Precedent check:** no containment, hold, freeze, or withhold vocabulary exists anywhere in the schema (`grep` across all migrations returns only two unrelated `frozen` matches). This is the **first instance of the pattern** in AIN, and should be named so it can be reused wherever the same shape recurs.

## 2.2 Schema (additive; nothing dropped, nothing recomputed)

```sql
ALTER TABLE practice_fields
  ADD COLUMN containment_status    TEXT NOT NULL DEFAULT 'none'
             CHECK (containment_status IN ('none','contained')),
  ADD COLUMN containment_reason    TEXT,
  ADD COLUMN contained_at          TIMESTAMPTZ,
  ADD COLUMN contained_by          UUID REFERENCES members(id),
  ADD COLUMN containment_reference TEXT,   -- pointer to the governing document
  ADD COLUMN released_at           TIMESTAMPTZ,
  ADD COLUMN released_by           UUID REFERENCES members(id);

-- A containment must carry its provenance.
ALTER TABLE practice_fields ADD CONSTRAINT containment_has_provenance CHECK (
  containment_status = 'none'
  OR (containment_reason IS NOT NULL AND contained_at IS NOT NULL AND contained_by IS NOT NULL)
);
```

`status` / `status_reason` keep their present meaning: **readiness only**. They are never used to express containment again.

**Release columns are deliberate, not scope creep.** A containment that cannot be lifted repeats the one-way-consent error in mirror image. Lifting is an explicit, attributed act — and the reason is retained, not blanked, so the history survives the release.

## 2.3 The invariant

> **GC-1.** Readiness recomputation may change readiness-derived status, but may **never** clear, weaken, or override an active governance containment.
>
> **GC-2.** Effective liveness is a conjunction:
> `effective_live := (status = 'live') AND (containment_status = 'none')`
> Every gate that today tests `status`, tests `effective_live` instead.
>
> **GC-3.** Containment transitions are explicit, attributed acts. No computation, migration, or content edit may set or clear `containment_status`.

## 2.4 Code changes (three, all small)

1. **`syncStatus`** — unchanged behaviour on `status`/`status_reason`; add a comment binding it to GC-1 and **never** reference the containment columns. Its `UPDATE` already names only those two columns, so GC-1 holds by construction.
2. **Gate 0** (`app/api/practitioner/practice-field/invite/route.ts`) — replace `if (field.status === 'pending')` with the `effective_live` test, and return a **distinct** refusal for containment (`409` + governance reason) versus incompleteness (`422` + missing sections). *Absence and prohibition must not render identically* — the same discipline as separating absence from failure.
3. **A containment route** — `POST/DELETE /api/practitioner/practice-field/[id]/containment`, restricted to a governance actor, writing the columns and their provenance. This is the *only* writer.

## 2.5 Ordering hazard ⚠️

Today Gate 0 is held shut by `status='pending'`. The moment `status` becomes purely readiness-derived, `8be895ad…` recomputes to `'live'`. **Therefore the containment must be recorded in the same transaction that adds the columns** — otherwise the migration itself unblocks the contained field.

The migration should set `containment_status='contained'` for that row, carrying the existing `status_reason` verbatim into `containment_reason` and `containment_reference` → this document.

⚠️ **This is a judgment call requiring founder sign-off.** It is *recording an existing governance act from its own surviving evidence*, not manufacturing state — but given how strictly this engagement has treated backfill, it should be ruled on rather than assumed. `contained_by` has no evidence and must be NULL or a named governance actor; the provenance CHECK above would need to permit NULL for this one legacy row, or the founder supplies the actor.

## 2.6 Executable invariants (in the manner of `rooms.test.ts`)

The room registry caught this class of error because its invariants were executable. Same treatment:

1. `syncStatus`'s `UPDATE` statement names only `status` and `status_reason` — source-level assertion.
2. No code path outside the containment route writes `containment_status`.
3. No migration writes `containment_status` except the one recording the legacy containment.
4. Every gate reading `practice_fields.status` also reads `containment_status`.
5. Integration: a field with `ready=true, contained` cannot produce an invitation, and `POST /invite` returns the governance refusal.
6. Integration: recomputing readiness on a contained field leaves all containment columns byte-identical.

Invariant 6 is the direct executable form of GC-1 and of the failure this design exists to prevent.

## 2.7 Preservation

Nothing dropped; all columns additive. `status`/`status_reason` semantics unchanged for every existing reader. `87c28398…` unaffected (`containment_status` defaults `'none'`). The invite pathway's behaviour is unchanged for uncontained fields. `createSnapshot` timing untouched.

## 2.8 Family

This is the second deficit of one shape found in this engagement:

| Deficit | Models | Cannot express |
| --- | --- | --- |
| One-way consent | entrance | decline · withdraw · pause · dissolution |
| Readiness without containment | progression to live | restraint · prohibition · supersession |

**The system models positive progression better than restraint, reversal, and supersession.** Both belong to the corrigibility family, and in both cases the correct repair is structural, not textual. A governance decision that lives in a free-text column is not governed — it is merely written down.
