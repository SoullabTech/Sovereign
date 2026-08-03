# Program identity reconciliation — steps 1 & 2 before the participation bridge

**Date**: 2026-08-03
**Status**: DRAFT for ruling. **Does not authorize implementation.**
**Sequence position**: steps 1–2 of *canonical identity → relationship →
enrolment → Home projection → member experience*.

---

## 0. Correction to the prior finding

Last pass I reported that `coach_program_definitions` and `field_programs`
"hold the same four programmes, duplicated." **That was wrong, and the
correction changes the remediation.**

The evidence:

```
coach_program_definitions.field_slug  →  practice_fields.field_slug
  one-to-one-coaching   →  NO MATCHING FIELD
  thursday-group        →  NO MATCHING FIELD
  training-module-3     →  NO MATCHING FIELD
  deep-dive-retreat     →  NO MATCHING FIELD
  writing-intensive     →  NO MATCHING FIELD          (0 of 5 match)

owners differ:
  coach_program_definitions.owner_member_id     = 1111…1111   (seed)
  practice_fields.practitioner_member_id        = 846b7d27… , 0000…0d01
```

These are **two independent datasets owned by different practitioners**. The
matching titles ("1:1 Coaching", "Thursday Group", "Deep Dive Retreat") are a
coincidence of seeding, not duplicated records of one practitioner's work.

So this is **not a dedupe problem**. It is something more basic:

> **The container table and the field table have never been connected — by
> anything, ever. Zero rows link them. The relationship has never been
> instantiated once.**

That is a cleaner problem than duplication, and a more fundamental one: there is
no convention to follow, so step 2 is a design act rather than a cleanup.

## 1. What each object actually is

Confirmed by structure, not by name:

| | `coach_program_definitions` | `field_programs` |
|---|---|---|
| Question | *What experience exists?* | *How does this become meaningful in a life?* |
| Owner | `owner_member_id` ✅ | none |
| Lifecycle | `state` ✅ | none |
| Member-facing language | `client_facing_language` ✅ | `title` |
| Structure beneath | stages · cohorts · processes · enrolment | lessons · focal points |
| Member's place in it | — | `field_program_positions` ✅ |
| Live member rows today | **0** | **1** (`now-what-demo/training`, `member_confirmed`) |

**They are two views of one journey, not rivals.** The container is where the
practitioner authors the experience. The field expression is where the member's
position and focus live. The single real member position in the entire system
sits on the *field* side — which tells you which half is currently load-bearing
for members.

## 2. The missing relationship

`coach_program_definitions.field_slug` is the vestigial attempt. It is holding
**programme slugs** (`training-module-3`), not field slugs, and matches nothing.
It cannot be repaired by backfilling — it was never populated with the kind of
value its name implies.

Three ways to establish the relationship:

| Option | Shape | Cost | Risk |
|---|---|---|---|
| **A** | Fix `coach_program_definitions.field_slug` to be a real FK → `practice_fields` | 1 column re-purposed + FK | column already misused; renaming is clearer than reusing |
| **B** | Add `field_programs.program_definition_id` → the container | 1 nullable column + FK | field expression optionally *projects* a container — additive, reversible |
| **C** | A join table | new table | violates "no new database objects unless required" |

**Recommendation: B.** It reads in the correct direction — *a field expression
may project a practitioner container* — keeps the field side (which holds the
only live member data) authoritative for member position, is nullable so
existing field programmes keep working unlinked, and is a single reversible
column. Option A is defensible but repairs a column whose name already lied;
if taken, rename it in the same migration.

**One container may project into many fields; a field programme projects at
most one container.** That preserves *the practitioner authors once, and it
appears wherever the relationship exists.*

## 3. Canonical identity — the ruling requested

- **Container identity is `coach_program_definitions.id`.** It is what enrolment already points at (`coach_program_enrollments.program_definition_id`).
- **Member position identity stays `(field_slug, program_slug)`.** It is what `field_program_positions` already keys on, and what the one live member row uses. Do not migrate it.
- **The two are joined by the new nullable link, never merged.**

Merging them would collapse *what exists* into *what it means to me* — the
exact distinction the authority chain depends on.

## 4. Steps 3 & 4, defined (not authorized)

**Step 3 — enrolment creation.** Practitioner invites → member accepts.
`enrolled_by_member_id` records the actor; acceptance stamps `enrolled_at`.
Enrolment writes **access only**. No field material, no position, no thread.

> **Guardrail — enrolment must not become a compliance engine.**
> It means *"you have entered a relationship with this work."* It never means
> completed · followed · achieved · progressed. `coach_program_stages` carries
> `expected_offset_days`; that is a practitioner's plan, and it may inform what
> is *available*. It may never be rendered as whether the member is on schedule.
> The member's field stays sovereign.

**Step 4 — Home projection.** Home renders the intersection: active containers ×
current experiences × the member's own meaning. Leads with Current Work;
programmes are the organizing context, not the index.

## 5. Sequence gate

```
1. canonical identity        ← §3   ruling requested
2. container ⇄ field link    ← §2   ruling requested (recommend B)
3. enrolment creation        ← §4   defined, not authorized
4. Home projection           ← §4   defined, not authorized
5. member experience         ←      not started
```

The dangerous path this ordering exists to prevent:
**invite → enrol → attach member → discover the wrong object.**

Nothing in steps 3–5 may begin until 1 and 2 are ruled.

---

## 6. The sentence to preserve

> A program is something a practitioner creates. Participation is something a
> member chooses. The Field is what the member makes meaningful.
