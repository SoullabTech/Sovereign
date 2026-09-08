# JARVIS — Writer's Studio Experiences · §21 DISCOVER report

**Authority:** founder brief (Experiences lane) + founder ruling 2026-09-08 authorizing DISCOVER completion.
**Status:** REPORT ONLY. ⛔ No Experience object, schema, route, builder, or production behaviour is
authorized. Nothing was renamed, migrated, merged, or reconciled. The §21 report remains the gate before build.

> **Headline.** The "For Others" half of this brief is **already built** — for practitioners, under the
> noun *programme*, in `coach_program_definitions`. The "For Myself" half has **no substrate at all**,
> and the one self-oriented object that exists (`creativity_journeys`) is a status economy the brief
> explicitly forbids. The naming collision is real but is the smaller problem. **The larger question is
> not what to call an Experience. It is whether Writer's Studio can express a facilitated container
> without importing the practitioner/client relationship ontology that currently carries one.**

---

# PART I — The three meanings of "Experience" (required finding)

Three distinct things in this repository answer to the word. Per the ruling, they are described, not
reconciled.

## I.A — `decision_experiences` / `change_experiences` — **an experience someone HAD**

| Axis | Finding |
|---|---|
| **Ontology** | An account of a lived event. Closer to a Reflection than to a container. |
| **Purpose** | *"Between council consultations, practitioners log what happened in the field… This is how meaning accumulates between councils"* (migration header, verbatim). |
| **Object shape** | Child rows: `decision_id` / `change_id`, `occurred_at`, `experience_type ∈ {field_event, reflection, breakthrough, setback}` (+ `dream`, `synchronicity` on changes), `content`, optional `element`, `hexagram_resonance`, `tags[]`. |
| **User-facing term** | Not surfaced in Writer's Studio at all. Pro Studio / decision-council instrument vocabulary. |
| **Ownership** | `practitioner_id` (decisions) / `owner_id` (changes). |
| **Permissions** | Inherited by `ON DELETE CASCADE` from the parent decision/change; no independent grant. |
| **Relationship to Works** | None. No path to `living_works` or `member_manuscripts`. |
| **Relationship to MAIA** | None in the schema. Narrative material for council consultation. |
| **Internal or exposed** | **Internal.** Practitioner-side. |

**The load-bearing fact:** the repository's established `*_experiences` convention means *the log of
something that happened*. A bare `experiences` table meaning *a designed container* would sit directly
beside `change_experiences` meaning the opposite kind of thing.

## I.B — `lib/experiences` — **Guided Experiences** — *an experience someone is GIVEN*

| Axis | Finding |
|---|---|
| **Ontology** | A fixed authored piece delivered to a named recipient. "The Beginning" is the first; route `app/the-beginning/[recipient]`. |
| **Purpose** | Orientation. Self-described **CANDIDATE capability**. |
| **Object shape** | **No persistence whatsoever.** A TypeScript recipient registry: display name + optional reply target. Its own header: *"Personalization here is pure delivery data… It persists nothing, infers nothing, and asserts no member meaning."* |
| **User-facing term** | The experience is named to the member ("The Beginning"); the *category* "Guided Experience" is not. |
| **Ownership** | Soullab-authored. Recipient is addressee, not owner. |
| **Permissions** | Route + recipient slug. No member auth model of its own. |
| **Relationship to Works** | None. |
| **Relationship to MAIA** | None — a scroll shell, not a MAIA surface. |
| **Internal or exposed** | Term internal; the artifact is member-facing. |

**Nearest to the proposed meaning, and it holds an explicit invitation:** *"If/when a second guided
experience earns the shared shell, THIS registry + the scroll shell get extracted into a real engine
(extract, don't invent)."* But a Guided Experience is **authored once and delivered**; the proposed
Experience is **designed, entered, and possibly facilitated**. The invitation is real; it is not this.

## I.C — The proposed Writer's Studio Experience — *an experience someone DESIGNS or ENTERS*

| Axis | Finding |
|---|---|
| **Ontology** | A designed container for exploration, learning, practice, development, creation, or offering. Not a Work. |
| **Purpose** | Two orientations — For Myself, For Others — held as equally legitimate. |
| **Object shape** | **Does not exist.** No table, no type, no route. |
| **User-facing term** | Proposed as a member-facing section noun. |
| **Ownership** | Proposed: member (self) or facilitator (others), with facilitator IP preserved. |
| **Permissions** | Proposed: enrollment confers **no** access to participant material. |
| **Relationship to Works** | May give rise to many; may produce none. A Work may join several. |
| **Relationship to MAIA** | MAIA is **commissioned by** the Experience — host, companion, writer guide, reflector, researcher, developmental reader, practice guide. |
| **Internal or exposed** | Proposed: fully member-facing. |

### Can the three coexist?

**Yes, at the schema layer; no, at the conversational layer, without a distinction.** I.A and I.C never
touch: different tables, different owners, different surfaces, no join path. But in speech and in
review, "the experiences table" would be ambiguous the day I.C ships — and I.A's convention is the
*established* one. I.B is the genuine hazard: it already means something in the same product register
and would be read as the same feature.

---

# PART II — The §21 questions

## 1. What existing objects already resemble an Experience

Ranked by closeness. **None is an Experience; two are close enough that building from zero would be
reinvention, and one is close enough to be dangerous.**

### ⭐ `coach_program_definitions` + `_stages` + `_enrollments` + `coach_cohorts` + `_memberships` — *the For-Others half, already built*

```
coach_program_definitions  owner_practitioner_id · title · description · state
  kind ∈ coaching | facilitation | mentoring | education | spiritual_direction
       | training | workshop | course | retreat | open_ended
coach_program_stages       label · position · description
  kind ∈ stage | phase | module | week | session | milestone
coach_program_enrollments  process_id → coach_client_processes · current_stage_id
  status ∈ pending | enrolled | paused | completed | withdrawn
coach_cohorts              owner · program_definition_id · title · starts_on/ends_on
coach_cohort_memberships   cohort_id · relationship_id → practitioner_clients
```

This is the brief's §12 nearly line for line — including its refusal to force one discipline into
another's vocabulary (the migration comment says so explicitly), and including `open_ended`, which is
§6's non-schooling grammar already admitted.

**And it is anchored to `practitioners` and `practitioner_clients`.** Enrollment hangs off a
`coach_client_processes` row — a *clinical/coaching relationship*, not a creative one. That anchor, not
the shape, is the reconciliation question.

### ⭐ `field_programs` + `field_program_positions` + `field_program_revisions` + `field_program_lessons`

The Now What? / `practice_fields` platform. **Two ratified precedents this lane needs:**

- **Authority split, verbatim from the migration:** *"curriculum = practitioner-authored; position = the
  member locating themselves."* Exactly the brief's facilitator-authored ÷ participant-sovereign line.
- **Enrollment is declared by arrival, not administered by roster:** *"a position row exists only from a
  member's own gesture… There is no enrollment table, no roster, no departed-status graveyard —
  departure hard-deletes."*

`field_program_revisions` is the **only versioning precedent** for a facilitator-authored curriculum
(§17). Note the two platforms **disagree**: `coach_program_enrollments` is a roster with a status
lifecycle; `field_program_positions` refuses rosters on principle. Both are shipped. A lane that adopts
either inherits a settled position on §9 without noticing it did.

### 🔴 `creativity_journeys` — *the self-oriented object, and it is barred*

```
creativity_journeys  member_id PK · current_stage 1-7 · completed_stages[] · unlocked_features[]
member_achievements  achievement_type · achievement_key (attempts_100, streak_30, …)
```

The **only** member-owned progression object in the repository, and it is a **status economy**:
staged advancement, feature unlocking gated on progression, and achievement keys. §13 forbids exactly
this. Structurally identical to the Circles I0 finding about `contribution_tier` /
`min_cognitive_level`. **Reusing it would import a status economy on day one.** Classified INERT LEGACY,
not an offence — its semantics were constituted elsewhere; the finding is that it must not become
Experience substrate.

### Others, uninspected in depth and deliberately left unclassified

`academy_enrollments` · `workflow_enrollments` · `studio_protocol_assignments` · `field_program_lessons` ·
`coach_enrollment_stage_history`. Named so a later lane does not mistake this census for exhaustive.

## 2. Canonical meanings of "experience", "programme", "journey", "course", "cohort"

| Term | Status |
|---|---|
| **experience** | **Taken twice.** Part I. |
| **programme / program** | **Taken twice, incompatibly** — `coach_program_definitions` (practitioner catalogue, roster-based) and `field_programs` (practice-field curriculum, roster-refusing). |
| **journey** | **Taken, and compromised** — `creativity_journeys` is the status economy above. |
| **course** | **Not a table.** Exists only as a `kind` *value* inside `coach_program_definitions`. The one term whose noun-space is free — and the brief explicitly refuses it (§20: "the core question is not *how do we let people create courses*"). |
| **cohort** | **Taken** — `coach_cohorts`, keyed to `practitioner_clients`. Note the Circles lane's ruling: cohort mechanism at I8, ⛔ do not touch `FOUNDER_MEMBER_IDS`. |
| **Studio** | **Taken four times** — Author/Writer's Studio, Pro Studio (`/studio`), Book Studio, Vision/Media Studio (the `studio_*` tables belong to *none* of Writer's Studio). Recorded because §21's answers will be written in a room whose own name is already ambiguous. |

## 3. Practitioner infrastructure safely reusable

**Reusable as precedent, and one directly reusable mechanism.**

- ⭐ **`coach_client_shared_items` — directly answers §9.** Sharing is an affirmative member act:
  `offered_by_member_id` is *"authorship: which person performed the act. NOT ownership of the source"*;
  the payload is `snapshot_enc` **ciphertext with no plaintext sibling**; lineage is `origin` +
  `source_id` with **no FK — opaque by design, nothing to join back through**; and the member can
  withdraw it. This is a stronger participant-sovereignty model than the brief asks for, already shipped.
- **`practitioner_clients` / `client_relationships`** — the relationship spine. Reusable *as a shape*;
  adopting it wholesale would make every Writer's Studio facilitator a practitioner and every
  participant a client.
- **`practitioner_materials` / `practitioner_files` / `practitioner_file_shares` / `_file_access_log`** —
  facilitator-authored material with sharing and access logging. The nearest existing answer to §8.
- ⛔ **Not reusable without a ruling:** `practitioner_tiers`, `practitioner_usage_metrics`,
  `practitioner_growth`, `contribution_tier`-style mechanics.

## 4. Group / Circle infrastructure safely reusable

**None, yet — and the Circles lane's own standing forbids it.** As of 2026-09-07: Circle API authority
is founder-only (`requireCircleAccess()`, `CIRCLE_ACCESS_MEMBER_IDS` unconstituted), discovery is
**zero**, `visibility` and `invite_enabled` are **INERT** (⛔ do not build to them), no code path writes
`facilitator`, I1 is on HOLD, and further Circle build is on HOLD.

`circles` is documented as *"member-organized groups, distinct from practitioner client_groups"* — a
third group ontology beside `coach_cohorts` and `client_groups`. **Experience ≠ Circle** is confirmed by
the schema, not merely asserted by the brief: a Circle has no curriculum, no arc, no facilitator role,
and no relationship to Works.

Reusable **precedent** only: `labAccess.ts` (union with founder · fails closed · confers nothing beyond
its door), and FR-18 — *a recorded removal standing outranks a generic invitation* — which any
Experience invitation must satisfy from the start rather than rediscover.

## 5. Is a new Experience object actually required?

**Split answer, and the split is the finding.**

- **For Others — probably NOT from zero.** `coach_program_definitions` already expresses the container.
  What it does not express is a *creative* facilitation relationship: it can only reach a participant
  through `practitioner_clients` → `coach_client_processes`. **The required work is an ontology
  reconciliation, not a new object.**
- **For Myself — YES, nothing exists.** No member-owned, member-authored container exists anywhere.
  `creativity_journeys` is the only candidate and is barred. This half genuinely builds from zero.

**Consequence for sequencing:** the two orientations are *not* symmetrical in build cost, and treating
them as one object risks the self-oriented half inheriting practitioner-relationship machinery it does
not need — the precise failure the brief names as "building a second Studio".

## 6. Minimum permissions model

Derivable from what is already shipped; **nothing here is authorized**.

1. **Enrollment confers nothing.** Participation grants the facilitator **no** read of Reflections,
   Works, drafts, or MAIA conversations. Precedent: `field_program_positions` (position ≠ roster) and
   `coach_client_shared_items` (sharing is a separate act).
2. **Sharing is an affirmative, bounded, withdrawable member act**, one artifact at a time, with opaque
   lineage. Mechanism exists.
3. **Facilitator authorship is readable by participants, not extractable** (§8).
4. **Fail closed, confer nothing beyond the door** (`labAccess.ts`).
5. **A recorded removal outranks a generic invitation** (FR-18) — from the first invitation, not later.
6. **Route authorization is not API authorization.** `config/accessMatrix.ts` must carry any Experience
   route explicitly; the unmapped-route default is permissive, and a page that hides its own contents is
   not an access boundary (the 2026-07-31 `public: true` correction).

## 7. Facilitator IP / provenance representation

The brief's four classes — FACILITATOR-AUTHORED · MAIA-DERIVED · PLATFORM · PARTICIPANT — have **one
existing analogue and one existing law**:

- `practitioner_materials` / `practitioner_file_shares` hold facilitator material with bounded sharing.
- `living_work_materials` carries `declared_by` + `relationship_sentence` — **the author declares the
  relationship, in their own sentence.** That is PT-4's shape already shipped.
- MAIA-derived material has a governing rule to inherit, not invent: MAIA may propose, and may not
  assert or persist authorship on the member's behalf.

⛔ **Open:** nothing today distinguishes facilitator-authored from platform material inside a shared
container, because no such container exists.

## 8. Participant privacy preservation

Answered by (6) plus the Studio's existing default: Works, drafts, sections and MAIA conversations are
member-scoped by `member_id` throughout, and every manuscript query in the falsifier census carries
`AND member_id = $n`. **The privacy posture the brief asks for is the Studio's current default; the risk
is not achieving it but eroding it** the first time a facilitator asks to "see how everyone is doing."

## 9. How MAIA is commissioned differently per Experience

**No mechanism exists.** MAIA's composition is governed by `lib/maia/canonical-turn/` (CMT-01: a closed
38-producer registry, pure participation adjudication, one renderer). An Experience commissioning MAIA
means **adding a producer under an authority the Experience supplies** — which lands directly on CMT-01's
open channel finding and its M3 hold.

The Developmental Reader (`lib/manuscript/developmentalReader/`) is the existing precedent for a
*bounded, ratified* MAIA reading role, and the brief correctly points at it. ⛔ The commissioning
question cannot be answered inside this lane: it is a CMT-01 question.

## 10. How Experiences relate to Living Works without becoming Works

`living_work_materials` already provides the join: `(living_work_id, material_type, material_id,
relationship_sentence, declared_by, declared_at)`. `material_type` is free text with no CHECK — an
Experience could participate as a material type **without any schema change**, and the author would
declare the relationship in their own sentence.

⛔ **Do not read that as permission.** It means the genealogy has room, not that Experience belongs in
it. And the brief's recursion — *Experience → Work → Experience offered to others* — is a **Work→
Experience lineage**, which is adjacent to PT-4's still-unbuilt Work→Work lineage. Both must be
author-declared. Neither is authorized.

## 11. Versioning required

**Required, and there is exactly one precedent.** §17's rule — *a facilitator changing next year's
programme must not silently rewrite what last year's participants experienced* — is the same shape as
PT-3: **a descendant may change; the thing participants encountered may not.**

`field_program_revisions` is the only existing implementation. ⚠️ `coach_program_definitions` has **no
revisions table** — it is a mutable single object, precisely the shape §17 warns against. A lane that
adopts the coach platform inherits that defect.

**Note the convergence, and note that it is unproven:** the PT-3 falsifier run of the same day found
custody *behaviourally respected and structurally unenforced*. An Experience version model would be a
second custody claim in a system that has just demonstrated it does not yet enforce its first one.

## 12. Smallest first implementation proving both orientations without an LMS

⛔ **Not authorized; described as the answer to the question, not as a plan.**

The smallest honest proof is **one Experience, held by one member, that produces no Work** — the §11
"Discover the Work" case. It proves: a container can exist without being a Work; MAIA can accompany
inside it without authoring; the low door (§18) opens on one question. It requires no cohort, no
invitation, no facilitator role, no sharing, and no group ontology — i.e. it can be built **without
touching any of the held lanes** (Circles I1, CMT-01 M3, WS2-08B).

The For-Others half cannot be proven that cheaply, because its cheapest form still requires the
ontology reconciliation of Q5. **Proving both in one first implementation is what would build an LMS.**

---

# PART II-B — The three design witnesses

§19's two witnesses are joined by two more, added by the founder during this census. Each is recorded
with **what it falsifies**, because a witness that cannot fail is decoration.

| | Witness | Falsifies |
|---|---|---|
| **A** | *"I have always wanted to write poetry, but I don't know where to start."* | That a self-oriented Experience can exist without a student record and without MAIA writing the poems. |
| **B** | A memoir facilitator running an eight-week group who wants MAIA supporting participants **between** sessions while remaining the teacher. | That a facilitated container can exist without surrendering the method, without automatic access to private participant material, without MAIA becoming the teacher, without a second Studio, and without an LMS. |
| **C** | ⭐ A screenwriter with an unfinished feature: some scenes strong, structure uncertain, characters alive, **second act collapsing**. | That development can be accompanied across a whole Work while preserving historical drafts, screenplay **form**, the writer's authorship, and the ability to read the script **without continuous AI intervention**. |
| **D** | ⭐ A playwright with an unfinished stage play — several vivid characters, unresolved dramatic architecture — which later undergoes a **table read and rehearsal**. | That rehearsal discoveries can enter a Work's genealogy **without overwriting prior states**; that theatrical form is understood as theatrical rather than cinematic; that silence and physical action are read as authored acts; and that MAIA stays dramaturgical rather than ghostwriting. |

## Witness C — what the substrate already says

Witness C is the strongest of the three because it stresses the architecture where this lane is
weakest, and the census can answer part of it **from shipped schema rather than from design intent**.

### C.1 — Form-aware structure already exists, and is already form-agnostic

```
manuscript_structure_units   parent_id (self-referencing) · position · kind · title
  kind    CHECK: non-blank text only — NO closed vocabulary
  origin  CHECK: member | imported | proposed
  depth   UNBOUNDED — nesting is by parent_id, with no level column and no cap
```

**The screenplay hierarchy — Act → Sequence → Scene → Beat — is expressible today with no schema
change**, and so is a novel's parts-and-chapters, a poetry collection's sections, and a documentary's
reels. `kind` is deliberately open text: the substrate can carry *sequence* and *scene* without
*sequence* and *scene* becoming Writer's Studio ontology. That is exactly the founder's requirement —
**form-aware structure without one form's structure becoming canonical** — and it is a consequence of
the WS2-05A ruling that structure is **not** a `level` on the tree.

### C.2 — But the *derived* tier is capped at three, on purpose

```
manuscript_sections.heading_depth   CHECK: NULL or 1..3
manuscript_sections.heading_signal  CHECK: markdown | chapter | caps | member
```

The Source Representation — what the machine *interprets* from an imported document — carries a
**capped depth and a closed signal vocabulary**. The author-declared structure tree carries neither.

**This asymmetry is the architecture, not a limitation to remove.** What the system may infer from a
document is bounded and conservative; what the author may declare is not. A screenplay imported with
four heading levels will not have its Act/Sequence/Scene/Beat hierarchy *derived* — and per WS2-08A,
ALL-CAPS lines (`INT. KITCHEN — NIGHT`) are admitted as boundaries with **depth NULL, never a chapter
by default**. Slug lines will read as boundaries the writer may name, not as structure the machine
asserted. ⛔ Whether that is *sufficient* for screenplay form is an open question this report does not
answer; that it is the *right shape* follows from law already ratified.

### C.3 — What Witness C exposes that A and B do not

- **Quiet manuscript (PT-5) gets its sharpest case.** A screenwriter must be able to read the script
  *as a film* with no AI commentary draped over it, then deliberately call MAIA in. PT-5 is currently
  a ratified thesis with no implementation; Witness C is what would falsify it.
- **Encounter (PT-1) gets its sharpest case.** *"Read this screenplay first. Don't solve it yet. Tell
  me what film you experienced."* That is Encounter stated as a member gesture rather than a principle.
- **The dead-scene case is the product test.** Not *"write scene 27"* but *"I think this scene is
  dead and I don't know why"* — answered from knowledge of the whole Work (*"Elena enters wanting his
  permission and leaves still wanting it"*). This is the Developmental Reader's existing lens
  discipline applied at scene granularity, and it is the clearest statement yet of §14's development
  principle: **it strengthens the writer's dramatic intelligence rather than substituting for it.**
- **Continuity across a whole Work** — objects, chronology, locations, who knows what — is a *memory*
  obligation, not a writing one, and lands on the Authority × Time decomposition and the still-unauthored
  Episodic Phase 2 spec.

### C.4 — Consequence for this lane

Witness C **does not require an Experience object to be valuable** — every capability above belongs to
the Work, not to a container around it. It therefore sharpens Q5's split answer rather than changing it:

> The screenplay case argues that Writer's Studio needs **form-aware accompaniment of a Living Work**
> before it needs Experiences at all. An Experience is the field a writer may choose to put *around*
> that work — "Develop My Screenplay", twelve weeks, entered at whichever movement matches what they
> already have. **The container is optional; the form-awareness is not.**

⚠️ This is also the clearest evidence for §6: a screenwriter with seventy pages enters at *Whole Script
Encounter*; one with a single image enters at *discovery*. A `course → module → lesson → completion`
grammar cannot express that, and `coach_program_stages` — whose `kind` runs `stage | phase | module |
week | session | milestone` and whose enrollment carries a `current_stage_id` — **presumes forward
progression through an ordered sequence.** That is the most concrete reason found in this census not to
adopt the coach platform wholesale for Writer's Studio.

⛔ Nothing in Part II-B is authorized. Screenwriting support, form-aware structure, quiet manuscript,
Encounter, and continuity reading are all unbuilt and remain so.

## Witness D — theatre, and why it is not screenwriting with different margins

Recorded as a **separate** witness, not folded into C. A play is written toward embodiment, space,
voice, actors, audience, and live time; a film toward shot, edit, location, and camera implication.
Treating them as one form is the flattening this lane exists to avoid.

### D.1 — A Work can already declare its own form, and the system may not assign it

```
living_works.form   free text · CHECK: non-blank only
living_works.stage  CHECK: capturing | developing | writing | refining | sharing
```

From the migration, verbatim: `form` is *"the member's own word for what this is becoming… Free text;
never a system taxonomy"*, and both columns sit on the **NEVER_AUTHORED_BY_THE_SYSTEM** list
(`lib/livingWork/domain.ts`) — the only writer is a member act through the PATCH route, and **NULL means
"not stated", a legitimate permanent state, not a gap to fill.**

So the founder's requirement — *Studio should eventually know: this is a screenplay versus this is a
stage play* — is already expressible, with a refinement the schema insists on: **the member says which
it is; the system never infers it.** That is FR-06's shape (explicit selection drives; free text is
expressive, never inferred into taxonomy) reached independently by the Work ontology.

⚠️ **What does not yet exist is any consequence of that declaration.** `form` is a member's word that
nothing reads. Form-*aware* accompaniment — dramaturgical questions for a play, visual-storytelling
questions for a screenplay — would be the first thing to read it, and reading it is exactly where the
inference risk returns: a lens that behaves differently by form must be commissioned by the member's
declaration, never by a guess from the text.

Note also `stage`: *"Orientation, never progress: no ordering is enforced, no completion is implied, and
the system never advances it."* That is the same distinction PT-2 draws — Preserve / Restore /
Redevelop / Continue are an **authority axis**, not `living_works.stage` — and it is one more reason a
`current_stage_id`-style enrollment (the coach platform) is the wrong grammar for this Studio.

### D.2 — Rehearsal is the cleanest demonstration of PT-3 found anywhere in this census

```
playwright draft → table read → discoveries → descendant draft
                 → rehearsal  → discoveries → descendant draft → production text
```

Every arrow is a **descendant representation**; every prior state stays intact. The playwright's
sentence — *"in rehearsal, the actor playing Ruth discovered this line becomes more painful if she is
already holding the suitcase"* — is a discovery that **belongs to the Work's history without rewriting
its past.** That is PT-3 stated as lived creative practice rather than as a database constraint.

⚠️ **And it is the case that most tests today's finding.** The PT-3 falsifier run of 2026-09-08 found
custody **behaviourally respected and structurally unenforced**: nothing would refuse a write to a
historical draft. A rehearsal genealogy is precisely a workflow in which many hands generate many
candidate changes to a text whose earlier states must survive. **Witness D is the strongest argument in
this census for constituting PT-3 enforcement before Experiences add participants to the room.**

Note also that a table read introduces **other people's discoveries** into a Work's history — actors,
a director — while the playwright retains ultimate authority over every change. That is a third
authorship class beyond the brief's four (facilitator / MAIA / platform / participant), and this census
does not resolve it.

### D.3 — Silence as authored material

A play's unsaid line is an authored dramatic act, not a gap awaiting completion. This is a **direct
constraint on MAIA's generative disposition**: absence must be readable as intention. The existing law
that most nearly covers it is the Developmental Reader's discipline of reading the whole before
diagnosing, and the standing rule that MAIA notices without declaring meaning for the member. ⛔ Nothing
today implements "this omission may be deliberate" as a distinguishable reading.

### D.4 — What C and D together establish for the hierarchy work

Both forms could share a generic spine — `Work → dramatic form → structural movement → scene → beat` —
and `manuscript_structure_units` (§C.1: self-referencing `parent_id`, open-text `kind`, no depth cap)
can already carry it. **But their grammars diverge below that spine**, and neither may become the
universal structure of a Work. The census position is therefore:

> The generic spine belongs in the substrate, which already has it. The **form-specific grammar belongs
> to the member's declaration and to the lens commissioned by it** — never to the schema, and never
> inferred from the text.

Four witnesses now span poetry, memoir, screenplay, and stage play — deliberately radically different.
**If the Experiences architecture survives all four without collapsing them into `course → module →
lesson` or into `prompt → AI output`, it is a creative ecology. If it survives only some, the ones it
fails name what it actually is.**

⛔ Nothing in Witness D is authorized. Playwriting support, form-aware lenses, rehearsal genealogy, and
silence-as-material are unbuilt and remain so.

---

# PART III — Recommendation on the noun

**Recommendation: `Experience` can become the canonical member-facing product noun, and requires a
namespace distinction in code and schema. It should not yield to another term.**

Reasoning, in order of weight:

1. **The member-facing space is genuinely free.** The word appears **nowhere** in Writer's Studio or
   Press member-facing copy. Both existing uses are internal (I.A) or uncategorised (I.B).
2. **The alternatives are worse.** *Programme* is taken twice incompatibly; *journey* is taken by a
   status economy; *cohort* is a group, not a container; *course* is free but the brief refuses it, and
   it presumes the schooling grammar §6 rejects.
3. **The collision is a convention clash, not a semantic one.** `*_experiences` means *an experience
   someone had*. That reading is stable, internal, and does not compete for the member's attention.
4. **Therefore the distinction should be carried by the identifier, not the word.** A qualified name
   (of the `studio_*` / `manuscript_*` family already in use) keeps the member-facing noun clean while
   leaving `change_experiences` legible in its own register. ⛔ Which qualifier is a naming ruling this
   report does not make.

**One condition on that recommendation.** If a lane later builds toward I.B's explicit invitation
(*"extract, don't invent"* — the Guided Experience engine), **two different things will be called
Experience in the member's own vocabulary**: one delivered to them, one designed by them. That is the
collision worth pre-empting, and it is the only one of the three that a namespace cannot solve.

---

## Standing

⛔ Nothing renamed · nothing migrated · nothing merged · nothing reconciled · no Experience object ·
no schema · no route · no builder · no cohort · no invitation · no discovery surface. Circles HOLD,
CMT-01 M3 HOLD, WS2-08B HOLD all untouched. **The §21 report is the gate; this is the report, not the
passing of it.** Witnesses C and D are recorded as census findings, not as authorization to build for screenplays or plays.
