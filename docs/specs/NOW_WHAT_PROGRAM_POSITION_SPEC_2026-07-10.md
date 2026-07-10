# Now What? Program Position — Spec

**Date:** 2026-07-10
**Status:** SPEC — PREPARED, NOT AUTHORIZED. Per Preparation ≠ Authorization, this
document creates readiness, not permission. The build gate is Kelly's word.
**Branch lineage:** `feature/now-what-eval-harness-tier1` (PR #577) — sequenced after
the field-composition wire (`b021d84b1`) and the off-ramps cut (`dae6a0f86`).
**Ratified in dialogue 2026-07-10:** the design conversation that produced this spec,
including the authority split and the three notes incorporated below.

---

## 1. Purpose — the room shows its anchoring instead of asking to be trusted

A client in a practitioner's room needs to know the session is anchored in the work
at hand — their current course module, workshop, retreat material — not generic
territory. Today MAIA infers the focus from conversation each turn; she can be right,
but the client has no way to *see* that she is.

The mechanism is provenance displayed on the artifact at the moment of encounter:

> *This room holds Larry's flourishing work — current focus: Savoring & attention.
> Is that where you are?*

The room **declares** what it is composed from and invites correction. Trust from
display, not assurance. This is the third surface where the move appears — the
`served` provider label, MAIA's knowledge stance, now the focal-point line — which
makes it a house signature: **every channel into the room announces itself.**

## 2. Authority split — who authors what

The split resolves the provenance question before it can exist:

| Layer | Author | Gesture |
|---|---|---|
| Curriculum (program structure, focal points, sequence) | Practitioner | Authoring act in the practitioner field store |
| Position (where *this member* stands in the program) | Member | Locating themselves: confirm or correct, one tap or one sentence |
| Member's own material (notes, worksheets, journal) | Member | "Bring something with you" — the door that is already theirs |

"Whose version of the program is true" never arises because members were never given
authorship of the program — only of where they stand in it. Inference asks,
declaration reflects, the member's statement wins. Existing grammar; no new doctrine.

**The asymmetry rule (explicit):** the practitioner advancing the cohort focal point
and a member advancing their own position can disagree — a member still on
retreat-week material after the cohort moved on, or deliberately revisiting. The
member's confirmed position wins **for their room**; the practitioner's sequence is
the **default they are located against**. This sentence is what keeps
"member-confirmed" from being decorative.

## 3. Schema

Two pieces, both minimal:

**Cohort default** — one column on the existing field store:

```sql
ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS current_focal_point TEXT;
-- Practitioner-authored display name of the program's current focus,
-- e.g. 'Savoring & attention'. NULL = the field declares no focal point
-- and the arrival line simply does not render. No fabrication from absence.
```

**Per-member position:**

```sql
CREATE TABLE IF NOT EXISTS field_program_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug VARCHAR(64) NOT NULL,          -- joins practice_fields.field_slug
  member_id UUID NOT NULL REFERENCES members(id),
  focal_point TEXT NOT NULL,                -- the member's stated/confirmed position
  stated_by TEXT NOT NULL CHECK (stated_by IN ('member_confirmed','member_stated','practitioner_seeded')),
  member_confirmed_at TIMESTAMPTZ,          -- NULL until the member's own gesture
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (field_slug, member_id)
);
```

`member_confirmed` = tapped "yes, that's where I am" on the cohort default.
`member_stated` = corrected in their own words. `practitioner_seeded` = Larry placed
them (e.g. at enrollment) and the member has not yet spoken — which is precisely the
*assumed* epistemic state below.

The full curriculum sequence (modules, ordering, practices per stage) is **deferred**
to the practitioner authoring surface. v1 needs only: one cohort-level focal point +
one member-level position. The richer structure arrives when Larry's authoring loop
exists to fill it.

## 4. Epistemic state — confirmed-current vs assumed-from-last-known

`member_confirmed_at` propagates as epistemic state, not just a timestamp. A stale
confirmation — weeks old, cohort default has since changed — must not be silently
assumed current, and the cohort default must not silently override it. Neither branch
is assumed; degradation is first-class, per the grammar's standing rule.

The composed block distinguishes exactly two footings:

- **Confirmed-current:** member confirmed this position and the cohort default has
  not changed since → compose as fact.
- **Assumed-from-last-known:** anything else (practitioner-seeded and never
  confirmed; confirmed but the cohort default advanced after `member_confirmed_at`;
  no position row at all where the field declares a focal point) → compose as
  last-known-with-uncertainty, and MAIA's instruction is to **ask rather than
  assume**. The arrival line handles this naturally: an unconfirmed-lately position
  just asks again.

Composed block shape (illustrative):

```
[PROGRAM POSITION — member-confirmed 2026-07-08]
Current focus: Savoring & attention (week 3 of the flourishing course).
```
```
[PROGRAM POSITION — last known, not reconfirmed; cohort default has advanced]
Member last confirmed: Savoring & attention (2026-06-20). Cohort default is now:
Values in action. Do not assume either — ask where they are before working from it.
```

## 5. Arrival affordance

When the room's `fieldContext` resolves to a field with a non-null
`current_focal_point`, the arrival threshold renders one line and two gestures:

> This room holds [practitioner]'s work — current focus: **[focal point]**.
> Is that where you are?
> [ Yes, that's where I am ] [ I'm somewhere else ]

"Somewhere else" opens a one-line free text: the member states their position in
their own words → saved verbatim as `member_stated`. No menu of the practitioner's
modules in v1 (that requires the curriculum model); the member's language is the
record, per the member's-language discipline.

**Boundary (inherited, not re-derived):** the focal-point line surfaces only inside
the room the member entered — member-pulled, never a nudge, no ambient surfacing of
position anywhere else. This inherits from the attentive-stewardship candidate's
three-gate grammar (channel consent → proposal → authorization); this spec points at
that home rather than restating it.

## 6. Composition order

Downstream of everything constitutional, upstream of nothing:

```
MAIA runtime constitution
  → practitioner field constitution (field composition wire, b021d84b1)
    → program position block (this spec)
      → member presence / conversation
```

Composed per turn, same as the field. The position block is **context, not
instruction** — it never overrides the room's grammar or hard limits. If the field
composition is absent (flag off, field missing), the position block is absent too:
position without program is not composed.

## 7. API surface

- `GET` — position rides the existing room-load path (return detection already calls
  the field-note GET; position resolves server-side during interview composition and
  in the arrival payload). No new public read surface.
- `POST /api/now-what/program-position` — body: `{ fieldContext, focalPoint?, confirm? }`.
  `confirm: true` → confirm the cohort default. `focalPoint: "<text>"` → member
  statement (capped, sanitized). Auth: cookie session or `x-session-token`, 401
  before any read or write. Unknown fields → 422, zero residue (the
  guidance-boundary pattern, probe-witnessed in Tier 1).
- Practitioner writes `current_focal_point` through the existing practitioner
  guidance surface and its 422-boundary — no new practitioner write path.

## 8. Probes — entering PENDING per the induction rule

New probes enter `PENDING` and stay there until witnessed under a live run; no card
claims PASS from authorship.

- **P7a** — unauth `POST program-position` → 401 before any write; zero residue.
- **P7b** — member statement wins: seed `practitioner_seeded` position + differing
  cohort default; member POSTs correction; composed block carries the member's words,
  not the practitioner default.
- **P7c** — epistemic footing: stale confirmation + advanced cohort default composes
  the `assumed-from-last-known` block (string-witnessed), never the confirmed form.
- **P7d** — widening the POST body (extra fields) → 422, zero DB residue.

## 9. Deferred (recorded so no session builds them unprompted)

- Curriculum sequence model (modules, ordering, practices per stage) — waits for the
  practitioner authoring surface.
- Cohort management (enrollment lists, practitioner view of member positions) —
  jurisdictional questions (what Larry sees of member positions) belong to the
  practitioner-client privacy model and are NOT settled by this spec. v1 gives the
  practitioner no read of member-confirmed positions.
- Any menu-driven position picker built from the practitioner's module list.
- Any surfacing of position outside the room (dashboards, nudges, summaries).

## 10. Build gate

The word is Kelly's. On authorization: migration + position resolution in the
interview route + arrival affordance + P7 probes (PENDING), one commit, this branch.
