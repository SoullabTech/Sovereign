# LC-02 — Living Constellation Projection Contract

**Date:** 2026-09-18
**Status:** bounded implementation contract
**Authority:** Founder adjudication LC-00 / LC-01 / LC-01A
**Base:** `87c311c5217debe9bb2e181d71bc9eac23e70b3a`
**Boundary:** read-only projection only; no schema, migration, cross-domain copy, semantic write, MAIA edge, sharing change, prompt expansion, merge, deploy, or production mutation.

## 1. Purpose

LC-02 proves one proposition:

> Existing Living Field, Vision Studio, and Practice Field source objects can be seen together as one member-centered constellation without changing what any source object is.

The projection is not a master graph and is not a new source of truth.

A projected node is a display reference to a real source object.

The synthetic center `YOU` is orientation only and does not claim the system possesses a complete object representing the member.
## 2. Exact initial node population

### Living Field

Source:

- table: `personal_living_fields`;
- source surface: `/maia/living-field`.

Admission:

- authenticated `member_id` only;
- `current_expression` must be non-empty;
- maximum 12, most recently updated first.

Projected material:

- canonical field label;
- current expression excerpt;
- field status;
- latest developmental-version authorship where available;
- source id and timestamps.

No gathered Keep becomes a separate constellation node in LC-02.

### Vision Studio

Source:

- table: `member_field_note_threads`;
- source surface: `/maia/vision-studio`.

Admission:

- authenticated `member_id` only;
- `released_at IS NULL`;
- `member_confirmed = TRUE`;
- `source_session_ref LIKE 'vs-%'`;
- maximum 12, most recently updated first.
The route does **not** trust `center` as Vision Studio provenance because LC-01A established current center conformance is broken.

The stored `center` value is reported honestly as source metadata only.

Projected material:

- thread title;
- authorship;
- member decision;
- Spiralogic phase;
- field context;
- practitioner-visibility state;
- persisted center;
- source id and timestamps.

No ephemeral conversation turn, unconfirmed proposal, discarded proposal, or released thread is projected.

### Practice Field

Source:

- table: `practice_fields`;
- source surface: `/maia/vision-studio?tab=practice`.

Admission:

- `practitioner_member_id` must equal the authenticated member;
- at most one beta Practice Field row.

Projected material:

- one Practice Field node;
- current active-field excerpt, falling back to about-practice;
- readiness state;
- containment state;
- identity-ratification presence;
- source id and timestamps.

LC-02 does not project client Relationship Spaces or client material.
## 3. Shared projection shape

Every durable projected node carries:

- projection id;
- source domain;
- source type;
- source id;
- label;
- optional excerpt;
- authorship;
- standing;
- privacy;
- created / updated timestamps;
- source table;
- source surface;
- bounded source-specific details.

The projection id is not a new canonical object identity.

It exists only to render a stable UI list key.

## 4. Authority labels

LC-02 preserves, rather than normalizes away:

- `member_authored`;
- `member_confirmed`;
- `maia_candidate`;
- `practitioner_authored`.

No candidate is displayed as member-authored merely because it appears in the shared projection.

## 5. Privacy / jurisdiction

Every adapter is scoped from the verified session member.

There is no request parameter for another member id.

Vision Studio thread visibility is reported as:

- member-private; or
- explicitly shared with practitioner.

Practice Field projection reads the practitioner's own field only.

The read model never broadens the access scope of an underlying source.
## 6. Visual semantics

The same component renders in all three rooms:

- Living Field foregrounds Living Field;
- Vision Studio foregrounds Vision Studio;
- Practice Field foregrounds Practice Field.

The complete node population remains the same.

The first visual has a `YOU` orientation center and three domain clusters.

Lines from `YOU` to the three domain clusters mean only:

> this material currently lives in this Soullab domain.

They do **not** mean:

- supports;
- causes;
- contradicts;
- arises from;
- evolves into;
- is psychologically linked with.

LC-02 creates zero semantic edges.

## 7. Empty and partial behavior

An empty domain remains visible and says that nothing has been authored there yet.

An entirely empty projection still renders the three-room shape around `YOU`.

If one source adapter fails, successful domains still render and the response is marked `partial`.

The UI states that what is shown is partial.

A failed projection never implies that absent material does not exist.
## 8. Falsifiers

LC-02 fails if any of the following becomes true:

1. a projection route exposes POST, PUT, PATCH, or DELETE;
2. projection code contains source-domain INSERT, UPDATE, DELETE, or upsert;
3. a caller can choose another member id;
4. Vision Studio material is selected by the currently unreliable `center='project'` assertion;
5. an unconfirmed or released Vision Studio thread appears;
6. a Practice Field belonging to another practitioner appears;
7. a MAIA candidate is relabeled member-authored;
8. the shared client sends a mutating request;
9. the three rooms render different persistence models masquerading as the same constellation;
10. visual placement is described as semantic relationship;
11. partial source failure is rendered as complete absence;
12. LC-02 requires a schema or migration.

## 9. Deferred by design

Not authorized here:

- member-authored semantic edges;
- member-authored cross-domain placement/reference writes;
- Vision Studio `center` repair;
- “enters your Living Field” copy repair;
- graph persistence;
- MAIA-proposed dotted connections;
- temporal inference;
- cross-room promotion;
- new Practice Field meaning;
- three-room arrival redesign.

Those remain later gates.
