# LC-01 — Living Constellation Existing Reality Census

**Date:** 2026-09-18
**Class:** read-only architecture / UX census
**Status:** Candidate evidence record — no implementation authority
**Evidence subject:** `clean-main-no-secrets` @ `bfab0c3c7cb02a924fe517a98471d95a895f01e4`
**Companion:** `docs/design/contracts/LIVING_CONSTELLATION_CONTRACT_V0_1_2026-09-18.md`

> **Purpose:** determine what already exists beneath Living Field, Vision Studio, and Practice Field before any redesign or shared-map implementation.
> **Boundary:** no runtime changes · no schema · no migration · no graph writes · no production reads/writes · no deployment · no authority change.

---

## 0. Executive finding

The three visible rooms are not empty shells. Each already sits on substantial and constitutionally different substrate.

The major problem is therefore **not absence of backend capability**. It is that the member cannot perceive how the pieces belong together.

The census establishes five conclusions:

1. **Living Field is already a real life-level member field**, with authored expressions, developmental versions, sources, consent, spirals, states, affinities, and living encounters.
2. **Vision Studio is already a real developmental environment for a practitioner's body of work**, with ephemeral MAIA facilitation and member-authored carried threads.
3. **Practice Field is already a real practitioner-authored relational ecology**, with identity, relationship conditions, client formation snapshots, active practice context, governance containment, and bounded MAIA guidance.
4. There is **no shared read model** that lets the member see those distinct objects together as one coherent constellation.
5. Existing canon strongly argues **against** solving that by collapsing the three into one universal persistence substrate.

The correct architectural direction is therefore:

> **Living Constellation = a read-first projection across distinct constitutional centers, with provenance and authority preserved.**

Not:

> **Living Constellation = a new master graph that absorbs the other domains.**

---

# 1. Current visible topology

Today the top-level experience is structurally connected but semantically weak.

### Living Field

Route:

`/maia/living-field`

Entry:

`app/maia/living-field/page.tsx`

The route loads:

`GET /api/maia/living-field`

and renders:

`components/maia/living-field/PersonalLivingFieldDashboard.tsx`

### Vision Studio

Route:

`/maia/vision-studio?tab=vision`

Entry:

`app/maia/vision-studio/page.tsx`

renders:

`components/maia/vision-studio/VisionStudioRoom.tsx`

### Practice Field

There is no independent `/maia/practice-field` route in the current tree.

Practice Field is rendered as:

`/maia/vision-studio?tab=practice`

using:

`components/maia/practice-field/PracticeFieldEditor.tsx`

### Navigation asymmetry

The tab bar visually presents:

`Living Field | Vision Studio | Practice Field`

but:

- Living Field navigates to a separate route;
- Vision Studio and Practice Field are query-param states of the same route;
- each room has a different persistence model;
- there is no shared object or read model underneath the tab shell.

The connection is therefore currently **navigation-level only**.

---

# 2. Living Field — existing reality

## 2.1 Canonical object

Migration:

`database/migrations/20260701000002_personal_living_fields.sql`

creates the current Personal Living Field substrate.

### `personal_living_fields`

One member-owned expression per canonical field dimension:

- `member_id`
- `field_key`
- `current_expression`
- `status`
- timestamps

### `personal_living_field_versions`

Developmental history, explicitly distinguished from software-style version history.

Carries:

- expression;
- change note;
- authorship;
- timestamp.

### `personal_living_field_sources`

Sources that nourished a field expression:

- source type;
- source id;
- source excerpt.

### `personal_spirals`

Recurring developmental patterns:

- title;
- description;
- phase;
- status.

### `personal_states`

Current lived conditions:

- state key;
- label;
- intensity;
- source provenance.

### `living_field_participant_consents`

Per-field participant consent.

The migration itself names the governing orientation:

> **The Personal Living Field is the constitutional center of gravity. Participants are chapters — not owners.**

That is already strongly aligned with the Living Constellation direction.

---

## 2.2 Current canonical dimensions

`lib/maia/living-field/canonicalFieldKeys.ts` defines 13 current dimensions:

1. Who I Am Becoming
2. What I'm Learning
3. Current Life Phase
4. Emotional Weather
5. Relationships
6. Body / Soma
7. Work / Vocation
8. Creativity
9. Spiritual Life / Meaning
10. Current Questions
11. Practices
12. Dreams / Symbols
13. Thresholds / Transitions

These are a **Living Field navigation/organization grammar**.

They should not automatically become the universal node ontology of the Living Constellation.

A person, project, relationship, practice-field declaration, or Vision Studio thread is not necessarily one of these dimensions.

---

## 2.3 Gathered Keeps and affinities

Migration:

`database/migrations/20260702000001_living_field_affinities.sql`

creates `living_field_affinities`.

This maps eligible memory atoms into Living Field dimensions with:

- member;
- atom;
- field key;
- affinity score;
- evidence reason.

Current mapping is implemented by:

- `lib/maia/living-field/affinityMapper.ts`
- `lib/maia/living-field/indexAtom.ts`

The mapper is intentionally **structural rather than semantic**:

- register;
- elemental lens;
- source type;
- breakthrough flag.

No content NLP is used.

The member-visible gathering can therefore show a **selection warrant** rather than pretending the system “understood” the member.

### Reusable principle

> **When the system places material nearby, the reason for placement should remain inspectable.**

This is useful precedent for Living Constellation projection.

### Standing seam — do not repair inside LC

The current write/index path in `indexAtom.ts` still uses its older eligibility guards.

The newer LF-SCOPE-01 read paths apply the stronger shared Living Field eligibility predicate.

That divergence was already explicitly left outside LF-SCOPE-01.

LC-01 records it only.

The constellation must not reproduce the older write-path semantics merely because they exist.

---

## 2.4 Living Field interaction capabilities already exist

Current routes include:

- `GET /api/maia/living-field`
- `GET|PATCH /api/maia/living-field/[fieldKey]`
- `POST /api/maia/living-field/[fieldKey]/sources`
- `GET /api/maia/living-field/[fieldKey]/gathering`
- `POST /api/maia/living-field/[fieldKey]/refine`
- `POST|PATCH /api/maia/living-field/[fieldKey]/encounter`
- `/spirals`
- `/states`

### Direct member expression

`PATCH /api/maia/living-field/[fieldKey]`

upserts the member's current expression and appends a **member-authored developmental version**.

### Bringing material into a field

`POST /[fieldKey]/sources`

supports member-provided:

- text;
- voice-note transcript;
- upload text;
- reflection.

This creates a source attached to the Living Field dimension.

### MAIA candidate expression

`POST /[fieldKey]/refine`

creates an **ephemeral candidate** only.

It does not save the candidate.

Persistence requires the member's separate PATCH gesture.

This is directly reusable authority structure.

---

# 3. Living Encounter — a mature temporal/epistemic primitive

Migration:

`database/migrations/20260706000001_living_encounters.sql`

creates:

- `living_encounters`
- append-only `living_encounter_events`

Event vocabulary already distinguishes such things as:

- utterance;
- MAIA utterance;
- phase proposal;
- phase confirmation;
- state proposal;
- state confirmation;
- recognition;
- doorway opened;
- expression drafted;
- friction;
- interruption;
- novelty;
- recovery.

The migration states explicitly:

> proposals carry zero authority until member-confirmed.

That is close to the relation-authority model proposed for Living Constellation.

### Strong reuse candidate

The constellation should inherit the same epistemic distinction:

> **candidate ≠ confirmed**

and should preserve append-only evidence where relevant rather than converting all history into a current profile.

---

# 4. Living Field — what is strong and what is missing

## Keep

- member ownership;
- authored current expressions;
- developmental history;
- source provenance;
- consent;
- proposal/confirmation distinction;
- inspectable affinity warrants;
- living encounters;
- quiet/empty states;
- separate spirals and states.

## Do not turn into universal ontology

- the 13 field dimensions;
- affinity score;
- elemental mapping;
- personal state intensity.

These belong to their current contexts unless separately governed.

## Missing for the new experience

- shared cross-room projection;
- visible object-to-object relations;
- unified provenance display across source domains;
- a member-centered map;
- an introduction explaining what the room gives the member over time.

---

# 5. Vision Studio — existing reality

## 5.1 Current meaning is stronger than the current arrival screen

The current route describes Vision Studio as a Spiralogic Interview environment.

The richer legacy specification remains in:

`docs/fields/larry/VISION_STUDIO_SPEC.md`

Its anchor definition is:

> **A developmental environment where practitioners cultivate a body of work over a lifetime.**

The spec explicitly says Vision Studio is not fundamentally:

- an authoring tool;
- a knowledge-management system;
- an AI workspace.

Those may be capabilities.

Its purpose is developmental.

The spec describes the movement:

| What practitioners bring | What Vision Studio helps develop |
| --- | --- |
| Experience | Recognition |
| Practice | Coherence |
| Insights | Principles |
| Stories | Teaching |
| Patterns | Methodology |
| Questions | Direction |

This is substantially richer than the current arrival screen.

### Product finding

The purpose was not absent from the architecture.

**It was lost in the current first-run presentation.**

---

## 5.2 Current runtime

Component:

`components/maia/vision-studio/VisionStudioRoom.tsx`

The room has four phases:

`arrival → conversation → proposal → closed`

The conversation route:

`POST /api/maia/vision-studio/interview`

is explicitly ephemeral.

It does not persist the conversation.

It uses:

- Spiralogic phase prompts;
- the twelve facilitation disciplines;
- shared `composeRoomTurnPrompt()`;
- governed LLM provider routing;
- optional Practice Field composition through `fieldContext`.

Its hard limits include:

- no typing or categorizing the person;
- no identity model;
- no interpretation as fact;
- authority for meaning remains with participant.

The propose step may return 1–3 tentative threads or none.

“None” is explicitly a faithful outcome.

This is strong architecture and should be preserved.

---

## 5.3 Crossing into persistence

At the end of a Vision Studio dialogue:

MAIA proposes threads.

The member can:

- keep;
- revise;
- split;
- discard;
- create their own.

The save route is:

`POST /api/maia/vision-studio/field-note`

Persistence target:

`member_field_note_threads`

with append-only:

`member_field_note_events`

The underlying thread model carries:

- authorship;
- whether directly stated;
- member confirmation;
- member decision;
- revision note;
- consent state;
- memory permission;
- practitioner visibility;
- release state.

Per-thread practitioner visibility defaults **false**.

Sharing requires a separate explicit member gesture.

### Strong reuse candidate

This is probably the clearest current implementation of:

> **MAIA proposes; member authors.**

It should be a primary precedent for Living Constellation candidate relationships.

---

# 6. Vision Studio finding A — current copy overstates the crossing

The current Vision Studio UI tells the member that accepted threads are:

> “carried into your field”

and:

> “What you carry enters your own Living Field”

But the route writes to:

`member_field_note_threads`

It does **not** write to:

`personal_living_fields`

and the census found no direct Vision Studio bridge that converts those saved threads into Personal Living Field expressions.

That matters even more because the ratified:

`MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md`

states that an enduring Field Object comes into being only through an explicit human declaration and that source-save is not declaration.

### Standing

**Semantic crossing is currently ambiguous.**

The current UI language implies a stronger ontological crossing than the persistence path proves.

LC-01 does not decide the repair.

Possible later solutions include:

1. narrow the copy to describe exactly what is saved;
2. expose the thread as a source/reference available to Living Field;
3. create a separately governed explicit declaration gesture;
4. another founder-ratified model.

### Prohibition

Do **not** silently solve this by auto-copying Vision Studio threads into Living Field.

That would violate the very architecture the constellation is intended to protect.

---

# 7. Vision Studio finding B — Center of Inquiry provenance drift

Migration:

`database/migrations/20260627000001_member_field_note_center.sql`

adds:

`member_field_note_threads.center`

with values:

- `person`
- `project`

Its comment says this exists specifically so:

> the Legacy Field `person` and Vision Studio `project` centers do not blur in storage.

The column defaults to:

`person`

The current Vision Studio field-note INSERT does **not** set `center`.

Therefore the current route appears to inherit the default `person` value.

### Standing

This looks like a **provenance drift / mismatch** between the migration's intended center semantics and the current Vision Studio writer.

This is recorded, not repaired.

It deserves a separate bounded conformance gate before Living Constellation depends on `center` as trustworthy provenance.

---

# 8. Vision Studio — what is strong and what is missing

## Keep

- developmental practitioner/body-of-work purpose;
- Spiralogic interview arc;
- ephemeral conversation;
- MAIA proposal/member authorship;
- explicit keep/revise/split/discard/create;
- private-by-default threads;
- per-thread practitioner sharing;
- release semantics;
- room composition through fieldContext;
- possibility of “no thread” as faithful result.

## Recover in UX

The legacy spec's language around:

- becoming;
- not performing certainty;
- not manufacturing authority;
- growing a body of work;
- beginning with lived material rather than expertise.

## Missing

- visible connection to Living Field source objects;
- visible relationship to Practice Field development;
- shared constellation;
- trustworthy cross-room provenance;
- arrival explanation matching the real purpose.

---

# 9. Practice Field — existing reality

## 9.1 This object must not be silently redefined

Migration:

`database/migrations/20260701000001_practice_fields.sql`

defines Practice Field as:

> **practitioner-authored expression layer**

and states:

> **MAIA receives it as context, not instructions.**

The current object is not a generic personal habit/practice tracker.

It is a practitioner-facing relational ecology that governs how a practice meets clients.

This is a critical correction to the first conceptual sketch of Living Constellation.

The redesign should make Practice Field more alive.

It should **not** overwrite the meaning of the existing constitutional object.

---

## 9.2 Current layers

### Layer 1 — Identity

- welcome message;
- welcome video;
- about practice.

### Layer 2 — Relationship

- how we work together;
- how MAIA supports;
- professional practice declarations;
- orientation style.

### Layer 3 — Practice

- resources;
- active practitioner field/current emphasis.

### Layer 4 — Adaptive Guidance

Activated later by:

`database/migrations/20260708000001_practice_field_maia_guidance.sql`

This is narrow-only guidance about how MAIA may participate.

It may never relax constitutional safeguards or widen authority.

---

## 9.3 Stable and active field

Practice Field already distinguishes:

### Stable Field

Formation-snapshotted into:

`practice_field_snapshots`

when a Relationship Space is created.

Existing relationships retain the conditions present at formation.

### Active Field

Current practitioner emphasis.

It is not formation-snapshotted and can update current spaces subject to governance.

This is a real temporal distinction and should be made intelligible to the practitioner rather than hidden behind configuration forms.

---

## 9.4 Readiness is not governance permission

Current Practice Field types distinguish:

- readiness state: pending / warning / live;
- containment state;
- containment authority;
- identity ratification.

Effective liveness is conjunctive:

> **ready AND not contained**

This is mature governance and should remain independent of the new visual experience.

A prettier constellation must not bypass the field's existing authority boundaries.

---

# 10. Practice Field scope history is a warning against unifying substrates

`docs/reviews/PRACTICE_FIELD_SCOPE_MISMATCH_FINDING_2026-08-03.md`

records a previous architecture failure:

- relationship-scoped snapshots existed;
- other practice content had different/global scope;
- the conceptual and persistence scopes diverged;
- content could therefore travel more widely than the apparent boundary implied.

That history is directly relevant to Living Constellation.

### Lesson

> **A visual connection between domains must never imply that the underlying access scopes have become the same.**

The map must preserve:

- member scope;
- practitioner scope;
- relationship-space scope;
- fieldContext scope;
- privacy and ratification state.

---

# 11. Why the current Practice Field feels like setup rather than a field

Current component:

`components/maia/practice-field/PracticeFieldEditor.tsx`

opens with:

- readiness state;
- Who I Am;
- How We Work;
- My Practice;
- Invite Client.

It exposes the persistence model almost directly.

That is useful operationally.

But it does not first explain the developmental meaning of the object.

### UX diagnosis

Practice Field is currently presented mainly as:

> **“Complete these fields so you can invite clients.”**

Its architecture is actually closer to:

> **“Shape the relational environment through which your practice meets the people you serve.”**

The redesign should put the second sentence first.

The readiness/configuration editor can remain underneath or become an explicit **Practice Setup / Client Space** sub-surface.

No schema change is required to make that conceptual distinction in the UX.

---

# 12. Practice Field — what is strong and what is missing

## Keep

- practitioner authorship;
- stable vs active field;
- formation snapshots;
- relationship-space scope;
- readiness;
- governance containment;
- identity ratification;
- narrow-only MAIA guidance;
- explicit invitation;
- compositional guards.

## Do not repurpose

- `practice_fields` as a generic habit tracker;
- client readiness as a personal-development score;
- active_field_content as universal Living Constellation prose;
- MAIA guidance as graph-level instruction.

## Missing

- developmental arrival;
- visible relationship to the practitioner's wider Living Field;
- visible relationship to Vision Studio's developing body of work;
- history/lineage of how practice principles came to be;
- shared constellation.

---

# 13. Existing relation and placement precedents elsewhere

The repository already contains several useful precedents.

None should be adopted wholesale without respecting their original scope.

## 13.1 `responds_to_thread_id` — strongest current semantic-edge precedent

Migration:

`database/migrations/20260828000002_field_note_responds_to.sql`

adds a relation between two member-authored acts.

It means only:

> **the member wrote this in answer to that**

It is explicitly **not**:

- an outcome;
- progress;
- a system inference;
- success/failure;
- a journey state.

The relation is written only when the member returns through a specific doorway and then explicitly keeps/revises their new act.

### Reuse lesson

A Living Constellation edge should be similarly narrow:

> **one human-authored relationship, with no hidden psychological upgrade.**

---

## 13.2 `flourishing_dimension` — strongest current placement precedent

Migration:

`database/migrations/20260805200001_flourishing_dimension.sql`

records a member's **placing gesture**.

A thread has a dimension only because the member entered through that dimension door and kept material there.

NULL is normal.

Nothing auto-categorizes.

### Reuse lesson

> **Placement may be meaningful when the member made the placement.**

This is much safer than inferring graph position from semantic similarity.

---

## 13.3 Member Field → Project Reference → Placement canon

The ratified:

`docs/canon/MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md`

already gives a highly relevant domain pattern:

```
Field Object
    ↓
Project Reference
    ↓
Placement
```

It explicitly separates:

- the thing;
- its durable relationship to another domain;
- where that relationship is currently represented.

### Reuse lesson

This is likely the strongest architectural precedent for Living Constellation.

A future constellation does not need to invent a new philosophy of cross-domain relationship.

It needs to generalize carefully from a law the platform already uses.

---

# 14. Existing graph systems that should NOT be casually reused

## 14.1 Wisdom Graph

Migration:

`database/migrations/20260214100001_wisdom_graph_foundation.sql`

already provides:

- wisdom events;
- wisdom nodes;
- member-authored wisdom labels.

This is a useful graph for Library/wisdom interaction.

But it also contains domain-specific concepts such as:

- computed clusters;
- waiting scores;
- source/theme nodes.

It is **not** a universal member-life graph.

### Standing

Useful implementation precedent.

Not the Living Constellation substrate without a separate authority/scope audit.

---

## 14.2 MemoryLinksStore

`lib/memory/stores/MemoryLinksStore.ts`

contains a generic-looking link API with relations such as:

- supports;
- contradicts;
- evolves;
- repeats;
- triggers;
- derives_from.

It also permits:

- system-created links;
- MAIA-created links;
- confidence;
- weights.

The census did not locate a canonical migration in the current tree whose filename establishes the corresponding `memory_links` table.

### Standing

**Legacy/unclear.**

Do not build Living Constellation on it merely because the API shape looks convenient.

It requires a dedicated provenance/liveness/authority audit first.

---

# 15. Current cross-room connection that already exists but is invisible

Vision Studio's interview route uses shared:

`composeRoomTurnPrompt()`

and can resolve a practitioner Practice Field through:

`fieldContext`

This means the runtime may already have Practice Field context while facilitating Vision Studio.

But the member does not see that as part of an intelligible developmental map.

### Important distinction

This is **prompt composition**, not a member-authored semantic relationship.

Living Constellation must not present “these are connected” merely because one room loaded another room's context.

Runtime availability is not member-authored meaning.

---

# 16. Shared substrate status table

| Capability | Living Field | Vision Studio | Practice Field | Shared today? |
| --- | --- | --- | --- | --- |
| Durable primary object | YES | YES — threads | YES | NO |
| Member authorship state | YES | YES | Practitioner authored | NO shared vocabulary |
| MAIA candidate vs confirmed | YES | YES | bounded assist/guidance | NO |
| Development/history | YES | event + release history | snapshots/revisions/governance | NO shared view |
| Source provenance | YES | session/phase/context | practitioner/space | NO shared view |
| Consent/sharing | YES | per-thread | relationship/governance | NO shared view |
| Cross-object relationships | Narrow/implicit | `responds_to` in sibling lineage | relationship-space formation | NO generic member-visible relation |
| Shared constellation | NO | NO | NO | **ABSENT** |
| Shared read model | NO | NO | NO | **ABSENT** |

---

# 17. What LC should KEEP

The following substrate should be treated as valuable and preserved:

### Living Field

- `personal_living_fields`
- developmental versions
- sources
- consents
- gathered Keeps with warrants
- living encounters
- candidate/confirmation split

### Vision Studio

- ephemeral facilitation
- member field-note threads
- authorship ledger
- keep/revise/split/discard/create crossing
- per-thread sharing
- release
- Spiralogic phase provenance

### Practice Field

- practice_fields
- stable/active distinction
- formation snapshots
- identity ratification
- containment
- narrow-only MAIA guidance
- fieldContext resolution

### Canonical relationship pattern

- source object;
- durable reference/relation;
- surface placement.

---

# 18. What LC should ADAPT as precedent, not copy blindly

- `responds_to_thread_id`
- `flourishing_dimension`
- Living Field affinity warrants
- Wisdom Graph node/label mechanics
- Project Reference / Placement pattern
- append-only authorship and encounter ledgers

These demonstrate useful laws.

Their existing tables remain domain-specific.

---

# 19. What LC must NOT repurpose

- Practice Field as a personal habit tracker;
- the 13 Living Field dimensions as universal graph node types;
- Wisdom Graph as a member identity graph;
- memory-link confidence as personal truth;
- raw transcripts/encounters as Living Field conclusions;
- runtime prompt composition as semantic relationship;
- AI co-occurrence as member-authored meaning;
- visual node proximity as a durable relation.

---

# 20. The minimum genuinely new architecture

If the contract is ratified, the smallest clean next implementation is **read-only**.

## LC-02 — Shared projection/read model

Create source adapters that can project selected existing objects into one common display shape.

Conceptually:

```ts
type ConstellationProjectionNode = {
  projectionId: string
  sourceDomain: string
  sourceType: string
  sourceId: string
  label: string
  authorship: string
  standing: string
  privacy: string
  occurredAt?: string
  updatedAt?: string
  viewHints?: Record<string, unknown>
}
```

The exact type is not ratified by this census.

The important rule is:

> `projectionId` points to a source object. It does not become the source object's new identity.

### LC-02 must have zero semantic writes

No new edge table.

No graph mutation.

No MAIA-generated links.

No cross-domain promotion.

No schema is justified yet.

First prove that the existing world can be **seen together honestly**.

---

# 21. Falsifiers for LC-02

A read-only constellation prototype fails if any of the following are true:

1. the same underlying object becomes copied into multiple competing records;
2. source provenance disappears;
3. MAIA-candidate material looks equivalent to member-authored material;
4. a private Vision Studio thread becomes visible because another room can read the projection;
5. Practice Field material crosses a relationship or fieldContext boundary;
6. an encounter is rendered as an accepted recognition;
7. a visual placement is mistaken for a semantic relationship;
8. the system requires a new graph-write table merely to draw the first useful map;
9. a member cannot answer “why is this here?”;
10. the map implies completeness when the projection is partial.

---

# 22. Founder decisions now exposed

LC-01 does not make these decisions.

It makes them visible.

## Decision A — Vision Studio scope

Current evidence strongly supports:

> **practitioner/body-of-work developmental environment**

rather than a generic all-member future-vision room.

Founder can preserve that scope, broaden it deliberately, or define role-sensitive variations.

Do not broaden by redesign accident.

---

## Decision B — Practice Field identity

Current canon strongly supports:

> **practitioner-authored relational ecology**

rather than generic personal practice/habit space.

The current UI can be made far more developmental without changing the underlying object's constitutional meaning.

---

## Decision C — Vision Studio crossing language

Current “carried into your Living Field” copy outruns the proven persistence crossing.

Founder should decide whether to:

- narrow copy;
- add an explicit governed declaration/reference act;
- or establish another model.

No automatic bridge.

---

## Decision D — Vision Studio `center` provenance

The migration says Vision Studio should distinguish project center from person center.

The current writer appears not to set it.

This needs a separate conformance investigation before `center` is trusted by LC-02.

---

## Decision E — Is “Living Constellation” member-facing?

It may be:

- the architectural name only;
- the name of the visual map;
- or both.

The architecture does not depend on exposing the phrase.

---

## Decision F — initial relation vocabulary

The repo contains useful narrow precedents but no general member-facing relation grammar.

The first durable cross-domain edge should not be written until the member-facing verbs are decided and tested.

---

# 23. Recommended sequence after founder adjudication

### LC-00
Candidate UX constitution. **Written. Not ratified.**

### LC-01
Existing reality census. **This document. Read-only.**

### LC-01A
Bounded Vision Studio conformance investigation:
- `center` provenance;
- “carried into Living Field” crossing claim.

No repair unless separately authorized.

### LC-02
Read-only Living Constellation projection across existing source objects.

### LC-03
Three arrival experiences + shared constellation surface.

### LC-04
Member-authored placement/reference gestures using existing constitutional patterns.

### LC-05
Only if still necessary: a minimal durable cross-domain relation substrate.

### LC-06
Only after member-authored relation behavior is established: MAIA-proposed dotted candidates with explicit adjudication.

---

# 24. Final census judgment

The repository does **not** need another ambitious intelligence substrate to begin this work.

It already has:

- memory;
- authorship;
- recognition boundaries;
- field expressions;
- developmental histories;
- project-centered reflective threads;
- practitioner relational fields;
- consent;
- provenance;
- placement precedent;
- narrow relation precedent;
- temporal event streams.

What it lacks is the **member-visible connective tissue**.

That suggests the correct first product move is smaller and more consequential than a new graph engine:

> **Make the relationships among the member's already-real worlds visible without changing what those worlds are.**

If that succeeds, Living Field, Vision Studio, and Practice Field can finally feel additive because the member can perceive their continuity.

If it fails, the failure will be visible before we have created another persistence layer to unwind.
