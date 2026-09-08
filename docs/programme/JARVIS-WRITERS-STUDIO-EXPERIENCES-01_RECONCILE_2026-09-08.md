# JARVIS — Writer's Studio Experiences · RECONCILE

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §V–IX. RECONCILE authorized; **do not build.**
**Gate:** resolves the four architectural collisions before FALSIFY or CONSTITUTE.
**Status:** ⛔ No object, schema, route, migration, or renaming. Nothing merged.

Governing distinction, carried unchanged:

> A **Work** is the creative undertaking belonging to the member.
> An **Experience** is the designed container through which exploration, learning, practice,
> development, or creation may occur.
> Neither becomes the other merely because they are related.

---

## R1 — For Others: what the coach substrate does and does not express

Eleven `coach_*` tables exist. They divide cleanly, and **the division is not where the product
language suggested.**

### R1.a — Expresses the Experience ontology (recovered as design, reusable in shape)

| Table | What it already gets right |
|---|---|
| `coach_program_definitions` | `title` · `description` · `kind ∈ coaching…retreat, open_ended` · `state ∈ active/archived`. The migration's own comment: none of these disciplines "may be forced to describe itself in another discipline's vocabulary." `open_ended` is §6's non-schooling grammar, already admitted. |
| `coach_program_stages` | `label` · `position` · `description` · `kind ∈ stage/phase/module/week/session/milestone`. The brief's *movements*, with a deliberately plural vocabulary. |
| `coach_cohorts` | `title` · `starts_on` / `ends_on` · `status`. A run of a container, held apart from the container itself — §17's repeat-with-another-cohort, already separated. |

**These three carry the container.** An Experience does not need a different shape from them.

### R1.b — Practitioner/program semantics, NOT the Experience ontology

| Table | Why it does not transfer |
|---|---|
| `practitioner_clients` (the anchor) | Carries `name`, `email`, `phone`, `intake_responses` — **a practitioner-held contact record about a person**, with `member_id` merely optional (`ON DELETE SET NULL`). |
| `coach_client_processes` | Every enrollment hangs off `relationship_id → practitioner_clients`. |
| `coach_program_enrollments` | `status ∈ pending/enrolled/paused/completed/withdrawn`, plus `current_stage_id` and `enrolled_by_practitioner_id`. |
| `coach_cohort_memberships` | Keyed to `relationship_id`, not to a member. |
| `coach_enrollment_stage_history` · `coach_sessions` | Progression tracking and appointment-keeping in a service relationship. |

### ⭐ R1.c — The finding

**The container transfers. The participant attachment does not.**

`coach_program_definitions` cannot reach a participant except through a client record. To enroll a
Writer's Studio participant that way, the system would first have to **create a practitioner-held
record containing their name, email, phone and intake responses** — for someone whose actual
relationship to the facilitator is that they joined a writing container.

Three further mismatches follow from the same anchor:

1. **`owner_practitioner_id NOT NULL REFERENCES practitioners`.** A memoir teacher, poet, or film
   mentor would have to become a *practitioner* — a role with tiers, usage metrics, caseload and
   directory semantics — to offer an Experience.
2. **`enrolled_by_practitioner_id`** permits participation to be *created by the facilitator*. That is
   the R3 collapse, written into a column.
3. **`current_stage_id` + ordered `position`** presume forward progression. A screenwriter with seventy
   pages entering at *Whole Script Encounter* has no expressible position (Witness C).

> **Reconciled:** treat `coach_*` as **recovered practitioner infrastructure whose container shape is
> the reference design**, per §V — not as the Experience object, and not as a thing to duplicate.
> Writer's Studio Experiences must attach participants **as members**, not as clients.

⛔ Whether the two eventually share one container table with two attachment models, or remain separate
implementations of a common shape, is a CONSTITUTE question. RECONCILE establishes only that the
attachment cannot be inherited.

---

## R2 — For Myself: the minimum genuinely missing

**What already exists and must not be duplicated:**

- `living_works` — member-owned; `title`, `purpose`, `form`, `stage`, all on the
  **NEVER_AUTHORED_BY_THE_SYSTEM** list. The member's own words, never inferred.
- `living_work_materials` — `(material_type, material_id, relationship_sentence, declared_by)`. The
  member declares the relationship, **in their own sentence**. `material_type` has no CHECK.
- `member_manuscripts` → `manuscript_*` — the Work's own substrate.

**What is missing is exactly one thing: a member-owned container that is not a Work.**

Everything else the brief asks for is already expressible:

| Brief's anatomy | Where it already lives |
|---|---|
| Work relationship (bring / begin / several / none) | `living_work_materials`, by declaration — including **none**, which is simply no row |
| Form-responsiveness | `living_works.form`, member-declared (§VIII) |
| Arc / movements | the `coach_program_stages` shape (R1.a); ⛔ ordered but **not** progressed through |
| Orientation without progress | `living_works.stage` — *"Orientation, never progress: no ordering is enforced, no completion is implied, and the system never advances it"* |

> **Reconciled:** the For-Myself minimum is **a container with an intention in the member's own words,
> and its movements** — plus reuse of the existing declaration pattern for any relationship to Works.
> It requires **no enrollment, no roster, no status lifecycle, no stage advancement, and no
> participant/facilitator distinction at all.**

⛔ **Explicitly excluded** (§V): `creativity_journeys` and `member_achievements`. `current_stage`,
`completed_stages[]`, `unlocked_features[]` and achievement keys are the status economy the doctrine
prohibits. Not substrate; not a starting point; not a migration target.

⚠️ **Asymmetry is the answer, not a problem to fix.** For Others needs an attachment model For Myself
does not have and does not want. Forcing symmetry is precisely how this becomes "a second Studio."

---

## R3 — Participation versus access

### The law, established here

> **Participation in an Experience and access to a participant's creative material are two separate
> authorities.**
>
> Participation is a member's presence in a container. Access is a **bounded, affirmative, revocable**
> grant over **named** material. Neither implies the other, in either direction.
>
> **No roster, practitioner relationship, cohort membership, or Experience enrollment may silently
> collapse them.** By default Works, Reflections, drafts, exploratory writing and conversations with
> MAIA remain private. Sharing is a member act, one bounded artifact at a time.

### Neither existing philosophy is inherited wholesale (§VII)

| | `coach_program_enrollments` | `field_program_positions` |
|---|---|---|
| Shape | Roster with status lifecycle | *"Enrollment is declared by arrival, not administered by roster… There is no enrollment table, no roster, no departed-status graveyard — departure hard-deletes."* |
| Created by | member **or practitioner** (`enrolled_by_practitioner_id`) | the member's own gesture only |
| Hazard | participation can be created *about* someone | a facilitated cohort may legitimately need to know who is in the room |

**Reconciled:** take the *authorship* rule from `field_programs` — participation originates in a member
gesture — while permitting a facilitated Experience to hold a roster **that confers nothing**. The two
philosophies disagree about the roster's *existence*; they agree, correctly, that it must not be an
access grant. The disagreement is therefore not load-bearing once participation and access are
separated.

### The mechanisms already exist — reuse, do not invent

- **`coach_position_share_consents`** already states this law in production, verbatim: *"Member-authored
  standing preference, default OFF… shares declarations made or updated FROM effective_from ONWARD — it
  never retroactively exposes earlier private declarations. Turning it off stops future sharing without
  deleting what was already shared. **Sharing a position is not permission for any broader Field access:
  no other read keys off this row.**"* That last clause is R3, already shipped.
- **`coach_client_shared_items`** is the artifact-level act: `offered_by_member_id` is *"which person
  performed the act. NOT ownership of the source"*; payload is `snapshot_enc` **ciphertext with no
  plaintext sibling**; lineage is `origin` + `source_id` with **no FK — opaque by design**; withdrawable.
- **`labAccess.ts`** — fails closed, confers nothing beyond its door.
- **FR-18** — a recorded removal outranks a generic invitation. Any Experience invitation must satisfy
  this at the mutation boundary from its first commit, not rediscover it (the Circles I0.5 defect).

⚠️ **The predictable erosion, named now:** the first facilitator request will be *"let me see how
everyone is doing."* Under this law the answer is that a facilitator may see exactly what each
participant has affirmatively given them, and no aggregate derived from what they have not.

---

## R4 — Version and history

**§17's requirement and PT-3 are the same law at two scales.**

| | PT-3 | Experience versioning |
|---|---|---|
| Protected | the Source a Working Draft descends from | the field earlier participants moved through |
| Permitted | work on a **descendant** representation | a **new version** for future participants |
| Prohibited | mutating the historical tier | rewriting what was already encountered |

**Substrate position:** `field_program_revisions` is the only curriculum versioning precedent in the
repository. `coach_program_definitions` has **none** — it is a mutable single object, exactly the shape
§17 warns against. A lane that adopted the coach platform for Writer's Studio would inherit that defect
along with the container.

> **Reconciled:** an Experience is **versioned**, and participation binds to the **version encountered**,
> not to the mutable container. A facilitator's revision creates a descendant version; earlier
> participants' record continues to name what they actually moved through. Withdrawing a version from
> future use is availability, not deletion — the same distinction §II draws between withdrawal and
> erasure.

⚠️ **And the same finding applies.** The PT-3 falsifier established that custody of the earlier state is
**behaviourally respected and structurally unenforced**. An Experience version model would be a second
custody claim in a system that has not yet enforced its first — and this one would have *more hands in
the room*, since a facilitator revises while participants are mid-container. **This is the clearest
argument in either lane for constituting PT-3 enforcement before Experiences admit participants.**

⛔ The mechanism (revision rows, immutable version snapshots, or a lineage pointer) is a CONSTITUTE
question. RECONCILE establishes only that mutability of the encountered container is prohibited.

---

## Carried forward, unresolved by design

- **MAIA commissioning per Experience** is a **CMT-01 question**, not an Experiences question. It means
  a producer admitted under an authority the Experience supplies, and lands on CMT-01's open-channel
  finding and its M3 hold. Not resolvable in this lane.
- **A third authorship class.** Witness D's table read introduces *other people's discoveries* — actors,
  a director — into a Work's history while the playwright keeps authority over every change. The brief's
  four classes (facilitator / MAIA / platform / participant) do not cover a collaborator whose discovery
  the author may adopt. Named, not resolved.
- **`form` is declared and unread** (§VIII). Form-responsive accompaniment is a capability gap, not a
  schema gap. When something first reads `living_works.form`, the inference prohibition applies at that
  read: MAIA may be commissioned by a declared form, and may never write an inferred form back as
  member truth.
- **Noun held** (§VI). No renaming. Internal identity must stay explicit enough that no code relies on
  the naked word `experience` to determine ontology. If Guided Experiences ever surface as a peer
  member-facing object, the naming question reopens **before** that collision ships.

---

## Standing

RECOVER ✓ · DISCOVER ✓ · **RECONCILE — this document** · FALSIFY held · CONSTITUTE held · DESIGN held ·
BUILD prohibited.

⛔ Nothing built, nothing renamed, nothing migrated, no object, no schema, no route, no cohort, no
invitation. Circles HOLD, CMT-01 M3 HOLD, WS2-08B HOLD untouched.
