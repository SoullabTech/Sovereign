# JARVIS — Writer's Studio Experiences · DESIGN

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XIII–XIX. DESIGN authorized.
**Status:** ⛔ **BUILD PROHIBITED.** No schema, no migration, no route, no code. This is architecture.

**The twelve things the design must express** (§XIX) are answered below, each against one rule:
reuse existing infrastructure only where its semantics survive the constituted laws.

> ⭐ **The design's centre of gravity:** four of the twelve need **no new object at all**, and one of
> the remaining needs **no place to be stored**. The smallest architecture is smaller than the list
> suggests, and the reason is that most of these laws already exist elsewhere in the system.

---

## 1. What is reused, what is refused

| | Decision | Why |
|---|---|---|
| `living_work_materials` | ⭐ **REUSED for Experience↔Work** | Its semantics survive exactly: the author declares the relationship, in their own sentence (`relationship_sentence`, `declared_by`), and `material_type` has no CHECK. An Experience participates in a Work's genealogy as a declared material. **Zero/one/many falls out in both directions from rows**, with no join table. |
| `living_works.form` | **REUSED unchanged** | §XV. Member-declared, free text, never system-authored. The design adds no competing form field anywhere. |
| `coach_program_definitions` shape | **PRECEDENT ONLY** | The container shape informs `experiences`; its participant attachment is refused (§VII). |
| `coach_position_share_consents` · `coach_client_shared_items` | **PRECEDENT for sharing** | The mechanisms are sound but are bound to `practitioner_clients`. The laws transfer; the tables do not. |
| `practitioner_clients` | ⛔ **REFUSED** (§VII) | A practitioner-held contact record with name, email, phone, intake responses. Participation must not depend on it. |
| `creativity_journeys` · `member_achievements` | ⛔ **REFUSED** (§VIII) | The status economy §XIV prohibits. |
| `coach_program_enrollments` | ⛔ **REFUSED** | `current_stage_id` + `enrolled_by_practitioner_id` are the two things §XIV and §IX forbid, in columns. |

---

## 2. The smallest architecture

### 2.1 One container (§XIII)

```
experiences
  id · owner_member_id → members · title · intention (the member's own words)
  orientation ∈ for_myself | for_others          -- declared, changeable; NOT a type
  state ∈ active | archived · created_at · updated_at
```

**One object, two orientations.** `orientation` is declared rather than derived: a facilitated
Experience with no participants yet would otherwise read as self-directed, and the container needs
to know what it is before anyone arrives. It is a property of the container, not a subclass — every
other table below is identical for both.

**`intention` is the member's words** and belongs on the `NEVER_AUTHORED_BY_THE_SYSTEM` list, beside
`living_works.title` / `purpose` / `form`. MAIA may help a member find it; MAIA may not write it.

### 2.2 Versions, and what freezes one (§XIX, F3)

```
experience_versions
  id · experience_id · version_number · note · created_at
  frozen_at timestamptz NULL     -- NULL = still editable; set at first encounter
```

⭐ **The law binds to encounter, not to orientation** (F3). A version is editable until someone
begins participating in it — including the owner undertaking their own. From that moment it is
frozen, and a revision creates the next version. So:

- A facilitator revising next year's programme cannot rewrite the field last year's participants
  moved through. §X's temporal law, satisfied by construction.
- A self-directed member editing an Experience nobody has entered rewrites nothing, and pays no
  ceremony for versioning they do not yet need.
- **The same mechanism serves both.** Versioning is not a facilitated-only feature.

Participation records the version, not the container — which is what makes the guarantee legible
years later.

### 2.3 Movements — addressable, not ordinal-in-force (§XIV)

```
experience_movements
  id · version_id · position int · kind text (open) · title · body
  authored_by_member_id → members
  authorship ∈ facilitator | platform | maia_derived
```

- **`kind` is open text**, as `manuscript_structure_units.kind` is. *Week*, *movement*, *threshold*,
  *encounter*, *session*, *gathering* — the creator's word, never a platform vocabulary.
- **`authorship` answers Witness B's surviving condition.** A method is a sequence and a voice, not a
  file: a movement must be able to say it is the facilitator's, and that attribution must survive
  their departure. This is the four provenance classes applied where the text actually lives.
- ⭐ **`position` orders the version. It is not a member's position, because the design has nowhere
  to put one.**

**There is no `current_movement_id`, no `completed_movements`, no participation↔movement table.**
That absence is the design decision, not an omission: a progress economy needs no column, only a
place to derive one from (F-A). A screenwriter entering at *Whole Script Encounter* is not "skipping
ahead" because the architecture cannot represent aheadness.

⚠️ **The predictable pressure is resume-where-I-left-off.** Deliberately excluded from the minimum.
If it is ever wanted, it is a **member-private bookmark, never aggregated and never visible to a
facilitator** — and that is a separate ruling, because the same row read by one more person becomes
a progress report.

### 2.4 Participation confers participation and nothing else (§IX)

```
experience_participations
  id · experience_id · version_id · member_id → members
  began_at · ended_at NULL
```

**Originates in a member gesture** — the `field_programs` rule (*"declared by arrival, not
administered by roster"*), not the `coach_*` rule. There is no `enrolled_by_facilitator`.

For a self-directed Experience the owner may hold a participation row (it is what freezes the
version) — but **zero rows is a normal state**, not an empty one (F2).

⭐ **How "non-authorizing" is made falsifiable rather than promised.** A comment cannot enforce this.
The obligation is a **census, in the shape of PT-3's Leg 1**:

> No query anywhere may join `experience_participations` to a member's Works, manuscripts, drafts,
> reflections, or MAIA conversations. Every such join site is a violation, named and failed.

That is the executable form of §IX, and it belongs in the FALSIFY instrument before any route ships.

### 2.5 Facilitator relationship — optional, and absent from the minimum

The owner is the facilitator when `orientation = for_others`. **No facilitator table is proposed**,
because co-facilitation is not yet asked for and a role table invented ahead of its need is where
`practitioner_tiers`-shaped semantics enter. ⛔ Open: co-facilitators, guest teachers, assistants.

### 2.6 Works — no new object (§XIII)

Reuse `living_work_materials` with `material_type = 'experience'`:

```
(living_work_id, material_type='experience', material_id=<experience_id>,
 relationship_sentence, declared_by, declared_at)
```

- An Experience may give rise to zero, one or many Works — zero is no row.
- A Work may participate in zero, one or many Experiences — many is many rows.
- The author declares it, in their own sentence. **PT-4's shape, already shipped.**
- ⭐ An Experience that produces no Work leaves no trace in any Work — which is exactly §XIII's
  *"An Experience is not a Work."*

⚠️ One consequence to accept knowingly: `living_work_materials.material_id` is `TEXT` with no FK, so
this relationship is unenforced at the database. That is the existing design (opaque lineage), not a
new weakness — but it means an Experience can be deleted out from under a declaration.

### 2.7 ⭐ Contribution — the one genuinely new object (§XVI)

```
contributions
  id · recorded_by_member_id → members          -- the author who wrote it down
  experience_id NULL → experiences              -- where it arose, if it arose in one
  living_work_id NULL → living_works            -- the Work it is IN RELATION TO
  contributor_name text                         -- the author's words: "Ruth's actor", "Maya Chen"
  contributor_member_id NULL → members          -- only if they are a member here
  kind text (open)                              -- discovery · observation · suggestion · response …
  context text NULL                             -- "rehearsal", "table read", "interview"
  body text                                     -- what was contributed
  occurred_at · created_at
  CHECK (experience_id IS NOT NULL OR living_work_id IS NOT NULL)
```

**A Contribution is in relationship to a Work without being part of it.** It is deliberately NOT a
`living_work_materials` row, because in that table attachment *is* adoption — the failure Witness D
exposed.

`contributor_name` is free text on purpose: an actor, a director, an interview subject or an elder
need not have an account here to be named as the origin of what they gave. **Requiring a member id
would erase every contributor who is not a user**, which is most of them.

⛔ **What this is not** (§XVIII): not a rights record. It settles no co-authorship, joint authorship,
contract, performer right, release, work-for-hire or adaptation right. It records that a human
brought something.

### 2.8 Adoption is a separate act (§XVII)

```
contribution_adoptions
  id · contribution_id → contributions · living_work_id → living_works
  adopted_by_member_id → members · adopted_at
  living_work_material_id NULL   -- set when the adoption also produced material
  note text NULL                 -- the author's words about what they took
```

> **Contribution records provenance. Adoption records authorial choice.**

Two shapes, both required, which is why adoption is its own table rather than a column:

1. **Adoption that produces material** — the contributed passage enters the Work. A
   `living_work_materials` row is created and named here.
2. ⭐ **Adoption that produces no material** — *"the actor discovered this line lands differently if
   she is already holding the suitcase"*, and the playwright rewrites the scene themselves. Nothing
   is attached; the Work changed anyway. **A design that could only record the first shape would
   lose the most common case in theatre**, and would quietly convert the second into "the author
   thought of it".

Provenance survives adoption: the adoption row always names the contribution it arose from.

### 2.9 Form-responsive lenses — no schema at all (§XV)

Nothing in this design stores a form. `living_works.form` remains the sole member authority.

A lens is a **platform-held reading keyed by the member's declaration**, subject to the two survived
conditions:

- **F9 — unknown form produces absence, not approximation.** No nearest-match, no inference from the
  text, and never a guess written back as the member's word.
- **F10 — a lens is a declinable, legible commission.** The member can see which reading is speaking
  and can decline it.
- **F11 — a lens may speak in terms of structure the author declared, and may never assume structure
  the author did not.** `manuscript_structure_units.kind` is open text and unbounded; the derived
  tier stays capped at depth 3 with a closed signal vocabulary.

⛔ **An Experience must not declare the form of a Work begun inside it.** "Develop My Screenplay" may
*invite* a form; only the member declares one. Otherwise a container would be authoring member truth
one level up — the same defect §VIII forbids at the Work.

---

## 3. Carried dependency — MAIA commissioning (§XII)

Not absorbed. This lane **names the authority it needs** and touches nothing:

> An Experience needs to commission MAIA's participation differently inside different containers —
> a dramaturg in one, a companion in another, a practice guide in a third — **without the Experience
> becoming a second place where MAIA's composition is decided.**

In CMT-01's terms that is a producer admitted under an authority the Experience supplies, adjudicated
by the existing participation contract, rendered by the one renderer. It lands on CMT-01's open
`meta` channel finding and its M3 hold. ⛔ Not resolvable here, and not to be worked around by having
the Experience assemble prompt text of its own.

---

## 4. What the FALSIFY instrument must later assert

Named now so the design cannot be built into something that quietly drops them:

1. **A self-directed Experience with zero participation rows is fully functional** (F2).
2. **No join exists from `experience_participations` to any member content table** (§IX, §2.4).
3. **No completion, position-of-member, or rank is derivable** from any table in §2 (§XIV).
4. **A frozen version is byte-identical after the owner revises the Experience** (§X, F3).
5. **A Contribution exists, is attributed, and is absent from the Work** until an adoption row exists
   (§XVI–XVII).
6. **Adoption without material is representable** (§2.8, shape 2).
7. **An unrecognised `living_works.form` yields no lens** rather than a nearest match (F9).
8. **The four witnesses run end to end** on the built architecture — poetry, memoir, screenplay,
   stage play.

---

## 5. Open, and deliberately unresolved

- **Co-facilitation** (§2.5) — no role table proposed.
- **Resume-where-I-left-off** (§2.3) — excluded from the minimum; needs its own ruling because the
  same row read by one more person becomes a progress report.
- **Experience discovery / a library** — §16 of the brief. Nothing here makes an Experience findable
  by anyone but its owner and participants, and that is the correct starting state.
- **Invitation** — none designed. When it is, FR-18 applies from the first commit: a recorded removal
  outranks a generic invitation, enforced at the mutation boundary, not at a precheck.
- **`material_id` has no FK** (§2.6) — an Experience can be deleted out from under a declaration.
- **Rights** (§XVIII) — untouched, and must stay so until its own law exists.

## Standing

RECOVER ✓ · DISCOVER ✓ · RECONCILE ✓ · FALSIFY ✓ · CONSTITUTE ✓ · **DESIGN — this document** ·
BUILD prohibited.

⛔ No schema, migration, route, builder, cohort, invitation, or code of any kind. Circles HOLD,
CMT-01 M3 HOLD, WS2-08B HOLD untouched.
