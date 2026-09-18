# LC-01A — Vision Studio Crossing + Center Conformance Investigation

**Date:** 2026-09-18  
**Class:** read-only conformance investigation  
**Status:** Candidate evidence record — no repair authority  
**Candidate branch:** `design/living-constellation-lc00-lc01-20260918`  
**Original census evidence base:** `bfab0c3c7cb02a924fe517a98471d95a895f01e4`  
**Freshness check:** current canonical `c6ed841f8ebc378031b5c3fa0262e367a42dc3e8`  
**Boundary:** no runtime change · no schema · no migration · no data read/write · no copy change · no deployment

> Purpose: resolve the two ambiguities exposed by LC-01 before any Living Constellation read model trusts Vision Studio provenance or claims that a saved Vision Studio thread has crossed into Personal Living Field.

---

## 1. Freshness

Between census base `bfab0c3c7...` and current canonical `c6ed841f...`, canonical advanced by 17 commits.

The intervening changed-file set is confined to:

- voice turn-taking / silent-death recovery;
- JARVIS routing-intelligence documents and harnesses;
- JARVIS Desktop / Work Unit implementation;
- builder/provider routing files.

No intervening commit touches:

- `app/api/maia/vision-studio/*`;
- `components/maia/vision-studio/*`;
- `app/api/maia/living-field/*`;
- `components/maia/living-field/*`;
- `member_field_note_threads` schema;
- `personal_living_fields` schema;
- Practice Field substrate relevant to this investigation.

**Freshness verdict: PASS.** The two LC-01 questions remain materially unchanged on current canonical.

---

# 2. Question A — Does Vision Studio persist its threads as project-centered?

## Intended provenance law

Migration:

`database/migrations/20260627000001_member_field_note_center.sql`

adds:

`member_field_note_threads.center`

with the closed vocabulary:

- `person`
- `project`

The migration comment is explicit that the field exists so the two Centers of Inquiry do not blur:

> `person` (Legacy Field) | `project` (Vision Studio)

and further states that this is provenance only, not an inferred property of the member or project.

The database default is:

`center = 'person'`

## Current Vision Studio writer

Current route:

`app/api/maia/vision-studio/field-note/route.ts`

persists accepted / revised / split / member-authored threads into:

`member_field_note_threads`

Its INSERT names:

- member_id;
- source_session_ref;
- title;
- content;
- authorship;
- is_directly_stated;
- member_confirmed;
- member_decision;
- member_decision_at;
- revision_notes;
- consent_state;
- can_be_remembered;
- can_be_shown_to_practitioner;
- confirmed_at;
- spiralogic_phase;
- field_context.

It does **not** write `center`.

Therefore the schema default applies.

## Finding

A thread saved by the current Vision Studio writer is persisted as:

`center = 'person'`

unless some separate database mechanism rewrites it.

The field-note-specific migration lineage inspected for this census contains no later Vision Studio override establishing `center='project'`.

### Conformance verdict

**NON-CONFORMING with the center migration's stated Vision Studio provenance intent.**

This is not a claim that member ownership is wrong. Member ownership remains correct.

The mismatch is narrower:

> Vision Studio-authored threads are member-owned, but their Center of Inquiry provenance is currently recorded as `person` rather than the migration-declared `project`.

### Why LC cares

LC-02 must not use `center` as a trusted cross-room discriminator until this mismatch is separately repaired or the intended meaning of `center` is re-adjudicated.

No repair is authorized by this record.

---

# 3. Question B — Does “carried into your Living Field” correspond to a real persistence crossing?

## Current member-facing claim

`components/maia/vision-studio/VisionStudioRoom.tsx` includes member-facing statements such as:

> “threads carried into your field”

and:

> “What you carry enters your own Living Field”

The room therefore presents a semantic crossing.

## Actual Vision Studio persistence

The save route:

`POST /api/maia/vision-studio/field-note`

writes accepted material to:

- `member_field_note_threads`;
- `member_field_note_events`.

It does not write to:

- `personal_living_fields`;
- `personal_living_field_versions`;
- `personal_living_field_sources`;
- `living_field_affinities`.

## Actual Living Field reads

The primary Living Field read:

`GET /api/maia/living-field`

reads:

- `personal_living_fields`;
- `personal_living_field_sources`;
- `living_field_affinities` joined to eligible `member_memory_atoms`;
- `member_spiral_state`;
- `personal_spirals`;
- `personal_states`.

The single-field detail route reads:

- `personal_living_fields`;
- `personal_living_field_versions`;
- `personal_living_field_sources`;
- `living_field_participant_consents`.

Neither route reads `member_field_note_threads`.

The Vision Studio writer also imports no bridge that promotes or references the saved thread into those Personal Living Field tables.

## Finding

The repository proves:

> **Vision Studio persistence and Personal Living Field persistence are separate.**

The current saved thread may be a member-authored developmental record that conceptually belongs to the member's wider field of life/work.

But no current persistence path proves that it has become a `personal_living_fields` object, source, version, or affinity.

### Conformance verdict

**THE CURRENT COPY OUTRUNS THE PROVEN PERSISTENCE CROSSING.**

This is a representation overclaim, not evidence of data loss.

The saved Vision Studio thread is real.

What is unproven is the stronger statement that the save act itself moved or promoted that thread into Personal Living Field.

---

# 4. Do not “fix” the mismatch by copying records

The easiest-looking repair would be dangerous:

`Vision Studio thread → automatically copy into personal_living_fields`

LC-01A explicitly rejects that as an ungoverned repair.

Reasons:

1. `member_field_note_threads` already has its own identity, authorship, consent, release, and phase provenance.
2. `personal_living_fields` is a different constitutional center with its own expression/version/source semantics.
3. automatic copying would create competing records for one human act;
4. it would convert a source/thread into a higher-order Living Field expression without a new member authority act;
5. it would make future deletion/revision/release semantics ambiguous.

### Governing direction

The Living Constellation candidate offers a cleaner possibility:

> **show the Vision Studio thread in a shared read projection while it remains a Vision Studio / member-field-note object.**

If the member later wants that thread to become a durable relation, source, project reference, or higher-order Living Field expression, that should be a separately governed human gesture.

---

# 5. Strong precedents already available

LC-01 found two useful existing patterns.

## `responds_to_thread_id`

A narrow relation between two member-authored acts.

It means only that the later act was written in answer to the earlier one.

It does not infer outcome, progress, or psychological meaning.

## `flourishing_dimension`

A member-authored placement produced by entering through a specific doorway and then keeping material there.

NULL is the ordinary state.

Nothing auto-categorizes.

### Implication

The platform already knows how to represent:

- a source object;
- a narrow relation;
- a member-authored placement;

without absorbing one object into another.

That is the preferable precedent for Living Constellation.

---

# 6. Standing after LC-01A

```text
Vision Studio member ownership ............... PROVEN
Vision Studio explicit authorship crossing ... PROVEN
Vision Studio per-thread sharing ............. PROVEN
Vision Studio center='project' provenance .... FAIL / CURRENT WRITER OMITS CENTER
Vision Studio saved thread ................... PROVEN in member_field_note_threads
Automatic Personal Living Field promotion .... NOT FOUND
Living Field reads Vision threads directly ... NOT FOUND
“enters your own Living Field” persistence .... NOT ESTABLISHED
Data loss .................................... NOT INDICATED
Repair authority ............................. NONE
Runtime/schema/production mutation ........... NONE
```

---

# 7. What this changes about the Living Constellation plan

LC-00's projection-first architecture is strengthened by the investigation.

The first useful constellation does **not** require an automatic Vision Studio → Living Field write bridge.

Instead LC-02 can project the member's real source objects together while preserving their origin.

However, LC-02 must not trust `center` as authoritative provenance until the separate center mismatch is adjudicated.

For the first projection, source provenance can safely come from the source adapter itself:

- adapter: Vision Studio field-note;
- source table: `member_field_note_threads`;
- route/surface provenance: Vision Studio;
- persisted center: reported honestly as currently stored.

No hidden correction.

---

# 8. Founder decisions exposed

## A — Center conformance

Choose later whether Vision Studio should:

1. explicitly persist `center='project'` as the migration intended; or
2. revise the Center of Inquiry model if that intent is no longer correct.

Do not silently treat the current default as deliberate.

## B — Crossing language

Until a governed cross-domain relation exists, choose later whether to:

1. narrow current copy to the proven save act; or
2. implement an explicit member-authored reference/declaration crossing; or
3. allow LC-02's shared projection to make the wider continuity visible while leaving source identity unchanged.

## C — No automatic promotion

LC-01A recommends preserving as a hard constraint:

> **Saving a Vision Studio thread does not, by itself, manufacture a Personal Living Field expression.**

---

# 9. Next clean implementation gate

If LC-00 is ratified, the smallest safe build remains:

## LC-02 — READ-ONLY LIVING CONSTELLATION PROJECTION

It should:

- adapt existing source objects into one display model;
- preserve source id, source domain, authorship, authority, privacy, and timestamps;
- make no semantic writes;
- create no new graph table;
- create no MAIA edges;
- make no cross-domain copy;
- render partiality honestly;
- prove that the three rooms can feel connected before new persistence is invented.

The `center` repair and crossing semantics should remain separate governed lanes rather than being smuggled into LC-02.

---

**LC-01A closes as a read-only finding only.**
