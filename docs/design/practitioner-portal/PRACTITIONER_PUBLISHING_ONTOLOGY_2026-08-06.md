# Practitioner Publishing — Domain Ontology (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route is authorized by
this document. It proposes an object model and asks for a ruling. It is Session 1 of the
founder-set sequence (ontology → coach workspace → client experience → MAIA's role).

**Orientation check** (`PROJECT_ORIENTATION.md`): this is a **level-5 supporting capability** for
Now What?, whose loop is *coaching conversation → daily life → reflection → next coaching
conversation*. Publishing exists to carry Larry's work across the gap between sessions. It may not
reshape the loop, and it may not become the loop. Larry's vocabulary is a **lens**: every object
name below is universal; the coaching words appear only as read-time labels.

**Ownership frame** (founder, 2026-08-05): *the practitioner owns the wisdom tradition, method,
language and lens; the member owns their field of experience.* This ontology's central job is to
make that boundary **structural** rather than procedural.

---

## 0. The headline

The ten objects in the founder's list are not ten first-class objects. They are **four**, and the
list conflates three different kinds of thing:

| Kind | What it is | Who authors it |
|---|---|---|
| **Work** | An authored artifact that exists whether or not anyone has seen it | practitioner |
| **Arrangement** | An ordered composition of Works for a purpose | practitioner |
| **Placement** | A dated, directed act of putting something in front of someone | practitioner |
| **Uptake** | A member's declaration of relationship to a placed thing | **member** |

⭐ **The load-bearing move: "Practice" is not a Work type. It is an Uptake.** A worksheet is a
Work; *practising it* is a member declaration. Modelling Practice as a document type would put the
member's developmental commitment inside the practitioner's authored object — which is exactly the
crossing the ratified authority model forbids:

> *Everything crossing from a person's sovereign field into a shared developmental commitment must
> be an explicit declaration by that person — never an observation, inference, score, pattern,
> telemetry event, or system-authored claim.*
> — `PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md`

---

## 1. What already exists (so this reconciles rather than invents)

**[O] Observed in the repository, 2026-08-06.**

| Existing substrate | Where | Which of the four it already is |
|---|---|---|
| `library_sources` + practitioner scoping (`practitioner_member_id`, `field_slug`, `vault_file_id`, `review_status` lifecycle `uploaded→processed→reviewed→ratified→archived`, `ratified_at/by`; type vocabulary widened to include `manual, worksheet, exercise, audio, video, link, document`) | `20260714000001` | **Work** — already exists, with a ratification gate and a practitioner-only advancement rule |
| `practitioner_files` / `practitioner_file_folders` | `20260206000001` | the **vault** (bytes), not the Work — correctly separate |
| `field_programs` (`kind`, `title`, `focal_points[]`, `current_focal_point`) + `field_program_lessons` (`focal_point`, `purpose`, `material_ids[]`, `practice`, `reflection_prompt`) + `field_program_revisions` (append-only snapshots) | `20260712000001`, `20260714000001` | **Arrangement** — already exists, already versioned |
| `field_program_positions` (`focal_point`, `stated_by ∈ member_confirmed \| member_stated \| practitioner_seeded`, `member_confirmed_at`) | `20260712000001` | **Uptake** — the pattern already exists, for position only |
| `practice_fields` (+ snapshots, revisions) | `20260701000001`, `20260710000002` | the **standing context**, not a Work — correctly separate |
| `practitioner_client_notes` (encrypted) | `20260730000001` | practitioner-private. ⛔ Not a Placement. Never member-visible. |
| Member visibility withdrawal ledger | `20260730000002`, Lane V | the **member-side** withdrawal authority |

**The gap is exactly one object.** `field_program_lessons.material_ids UUID[]` carries **no foreign
key and no direct-to-member path**. Works can be attached to a *lesson in a program*; they cannot be
placed in front of *a person*. There is no Placement object anywhere in the schema.

**Two collisions to resolve, not to route around:**

1. ⚠️ **Duplicated Work model.** `practitioner_materials` (`20260116000001` — RAG-oriented,
   `vector_store_id`, no ratification) and the `library_sources` practitioner extension
   (`20260714000001` — ratification-gated) model the same concern with unrelated shapes. The
   disposition document already flags this class of duplication. **`library_sources` is the correct
   survivor** — it is the one carrying the ratification gate. `practitioner_materials` needs a
   disposition ruling, not a quiet second life.
2. ⚠️ **Wrong-grammar sharing surfaces.** `practitioner_file_shares` (`share_type ∈ view|download`,
   `access_token`) and `artifact_shares` (link token, `password_hash`, `view_count`) are
   **file-cabinet and public-link grammar**. Neither is a publishing act, and `view_count` is
   engagement telemetry pointed at a person. ⛔ Placement must not be built on either.

---

## 2. The four objects

### 2.1 Work

> An artifact the practitioner authored or ratified. It exists independently of any member.

- **Belongs to:** the practitioner. Never to a member, never to a relationship.
- **Form** (`manual`, `worksheet`, `video`, `audio`, `article`, `link`, …) is an **attribute**, not
  a type hierarchy. A manual and a video differ in how they render, not in what they are.
- **Composability gate:** a Work is available to Arrangement, Placement, and (subject to §5) MAIA
  **only when `ratified`**. Only the practitioner's own gesture ratifies.
- ⛔ A Work carries **no member-derived state**. No view counts, no completion, no engagement
  score, no "most used." Popularity may not harden into authority (**N8**, binding).

### 2.2 Arrangement

> An ordered composition of Works for a stated purpose. `Program` and `Collection` are the same
> object at different degrees of sequence.

- `Program` = ordered, with positions the member can occupy. `Collection` = unordered grouping.
  Model as one object with an `ordered` property; do not build two tables.
- Already substantially exists (`field_programs` + `field_program_lessons`).
- ⛔ An Arrangement is a **path that exists**, not a path a member is **on**. Where a member stands
  is Uptake, and only the member may confirm it (`stated_by='member_confirmed'`).

### 2.3 Placement

> **The missing object.** A dated, authored act of putting something in front of a named audience,
> optionally carrying the practitioner's own words.

`Session Follow-up`, `Shared Note`, and `Announcement` are **not three objects**. They are one
Placement differing in two attributes:

| Founder's name | audience | occasion | message | referenced Works |
|---|---|---|---|---|
| Session follow-up | one member | an encounter | usually | usually |
| Shared note | one member | none | required | optional |
| Announcement | cohort / all clients | none | required | optional |

- **Authored by** a practitioner; **addressed to** a member or a cohort; **references** zero or more
  ratified Works; **occasioned by** an optional encounter.
- A Placement is **immutable once sent** — revising means a new Placement that supersedes it. It is
  a spoken act, and spoken acts are not silently rewritten.
- ⛔ **Placement is not assignment.** It creates availability, never obligation, never a task,
  never a due date, never a state on the member. `studio_protocol_assignments` uses assignment
  grammar (`active_stage_number`, `target_occupancy`); ⛔ Placement must not inherit it.
- ⛔ Placement generates **no read receipt visible to the practitioner**. Whether the member opened
  it is member-side information. Visibility is not acknowledgment; acknowledgment is a member act.

### 2.4 Uptake

> A member's explicit declaration about a placed thing. The **only** object in this ontology the
> member authors, and the only one that may express a developmental commitment.

- Kinds: *taken up* (I am practising this) · *set down* · *found this useful* · *this is where I
  am*. Each is a distinct member gesture with a timestamp and an author.
- Follows the existing `field_program_positions` pattern: `stated_by` is recorded, and a
  practitioner-seeded value is **not** a member declaration until `member_confirmed_at` is set.
- ⛔ There is **no system-authored Uptake**. Not from opens, dwell time, replies, MAIA
  conversation, or recurrence. If the member did not declare it, it does not exist.
- Member may withdraw an Uptake at any time; withdrawal is recorded in the authorship ledger
  (existing Lane V mechanism).

---

## 3. The ten names, resolved

| Founder's object | Resolves to | Note |
|---|---|---|
| Program | **Arrangement** (ordered) | exists: `field_programs` |
| Collection | **Arrangement** (unordered) | same object |
| Manual | **Work** (`form=manual`) | exists in type vocabulary |
| Worksheet | **Work** (`form=worksheet`) | exists |
| Video | **Work** (`form=video`) | exists |
| Audio | **Work** (`form=audio`) | exists |
| **Practice** | **Work** (`form=practice`) **+ Uptake** | ⭐ the *doing* is the member's declaration, never a property of the document |
| Session follow-up | **Placement** (one member, occasioned) | missing |
| Shared note | **Placement** (one member, unoccasioned) | missing |
| Announcement | **Placement** (cohort) | missing |

---

## 4. Relationships — each with its authority named

The seven named relationships are not symmetric: they have different owners, and two of them are
secretly two relationships.

| Relationship | Who may write | Who may read | May never imply |
|---|---|---|---|
| **authored by** | practitioner (immutable) | practitioner, member on placed Works | that authorship confers access to the member's field |
| **belongs to arrangement** | practitioner | both | that the member is *in* the arrangement |
| **version / supersedes** | practitioner | both, with lineage visible | that the member's prior copy silently changed |
| **placed by → addressed to** | practitioner | both | obligation, task, or member state |
| **taken up (Uptake)** | **member only** | both | anything the member did not declare |
| **withdrawn (author)** | practitioner | both | erasure of what was already received |
| **withdrawn (member visibility)** | **member only** | member; practitioner sees *withdrawn*, not content | that withdrawal is a signal about the member |

⭐ **Two findings the flat list hides:**

1. **"Withdrawn" is two relationships with different owners.** The practitioner withdraws a Work
   from future placement (unpublish). The member withdraws practitioner visibility into their own
   field (existing Lane V, `20260730000002`). Collapsing them would let one party's act read as the
   other's.
2. **"Shared with" is not a relationship; it is an act with a date and an author.** Modelling it as
   an edge loses the occasion and the practitioner's words — which is most of what a follow-up
   *is*. That is why Placement is an object, not a join table.

**One relationship is deliberately absent:** there is **no edge from a Work to a member's state.**
Nothing in this ontology can express "this member needs this material" or "this member is at stage
3." That absence is the design.

---

## 5. Lifecycle and versioning

**Works** already have a lifecycle: `uploaded → processed → reviewed → ratified → archived`. Extend
it, don't replace it. Revision proposal (⚠️ candidate — see §7):

- A revision creates a **new version** of the Work with `supersedes` pointing at the prior version.
- ⛔ Prior versions are **retired in place, never deleted** — matching the standing discipline that
  a superseded artifact remains historically true.
- **A Placement references a specific version.** What the member received does not change under
  them because the practitioner revised the source. If the practitioner wants the member to have
  the new version, that is a **new Placement** — a fresh act, visible as such.
- **Arrangements** already have `field_program_revisions` (append-only snapshots). Same model.

**Withdrawal (practitioner):** removes a Work from future placement and from MAIA composability. It
does **not** retract Placements already made. ⭐ *You cannot unsay something you said to someone.*
If the practitioner needs to correct it, that is a new Placement carrying the correction.

---

## 6. What this ontology structurally forbids

Stated so Session 4's constitutional question can be answered against a shape, not a promise. The
unruled §7 defines three MAIA-awareness classes — **A**: state of the practitioner's own offering ·
**B**: member declaration about an offered object · **C**: pattern claim about the member. This
ontology is built so that **C has no object to live in**:

1. **No member-derived attribute on a Work or Arrangement.** Nothing aggregates members into a
   claim about material, or material into a claim about a member.
2. **Only two authorities write the practitioner↔member edge:** the practitioner (Placement) and
   the member (Uptake). No third writer exists, so there is no row for the system to author.
3. **No engagement telemetry addressed to a person.** ⛔ `view_count` / `last_viewed_at` on
   `artifact_shares` is the shape to refuse.
4. **No cross-client aggregation path.** `/api/caseload` remains a list surface and ⛔ must not
   become a MAIA context source (existing containment, pinned in
   `__tests__/practitioner-authority-boundaries.test.ts`).
5. **Practitioner-private stays private.** `practitioner_client_notes` is encrypted and
   practitioner-only; it is not a Placement and has no path into one except by the practitioner
   authoring a new Placement in their own words.

**The MAIA edge is deliberately unbuilt.** Class A and B are *plausibly* permissible; §7 has not
been ruled, so this ontology defines no MAIA read path at all. Session 4 rules it; Session 1 must
not pre-empt it by leaving a convenient hook.

---

## 7. Growth-obligation check (CLAUDE.md, required for capability increases)

- **What uncertainty does this introduce, and how is it preserved?** Whether a placed Work was
  *received, understood, or used* is unknown to the system — and stays unknown. Placement records
  what the practitioner did, never what the member experienced. The four-question client surface
  (§8) must render that absence honestly rather than filling it with activity.
- **What provenance and ownership boundaries does it require?** Every object carries an author and
  a timestamp; Works carry ratification provenance; Uptake carries `stated_by` + confirmation.
  ⚠️ The provenance seed (`20260624000001`) is already noted as **one axis short** — that gap now
  becomes load-bearing and should be closed before implementation, not after.
- **What new responsibility does it create?** The practitioner becomes a publisher, with the
  standing obligation that superseding and withdrawing are **visible acts**, not silent edits — and
  that what a member already received is never rewritten beneath them.

---

## 8. Acceptance test for Sessions 2–3

The founder's four client questions must each resolve to exactly one object — no more, no less:

| Client question | Object |
|---|---|
| *What am I practising?* | **Uptake** (member-declared) |
| *What has Larry shared?* | **Placement** |
| *What have I discovered?* | ⭐ **nothing in this ontology** — the member's own field, which the practitioner does not author |
| *Where do I continue?* | **Arrangement** + the member's confirmed position |

⭐ That the third question has **no object here** is the proof the boundary holds. If a later design
finds itself wanting one, that is the moment the ontology is being breached.

---

## 9. Open questions carried, not resolved

1. **General Field Object versioning** — open question #1 in `PRACTITIONER_PLAN_RECORD_2026-08-05.md`
   §7. §5 above is a *candidate answer*, not a ruling.
2. **§7 crossing rule + MAIA awareness classes A/B/C** — unruled. §6 is shaped to be compatible with
   any outcome; it does not anticipate one.
3. **Disposition of `practitioner_materials`** (legacy duplicate) — needs a ruling, not a merge.
4. **Cohort** as an object — Announcement implies one; no cohort object exists today.
5. **Supervision** — explicitly unruled, and ⛔ must not be modelled as `practitioner_role + extra
   read access`.
6. **Larry's own domain language** — only he can supply it; all names above are placeholders at the
   universal layer.

## 10. What this document does not do

⛔ Authorize schema, migration, code, route, or UI · ⛔ rule any of §9 · ⛔ re-open the P2
ratification bounds · ⛔ define a MAIA read path · ⛔ define the crossing gesture · ⛔ name any
member-facing room (that is Session 3, under `docs/design/INHABITABLE_ARCHITECTURE.md`).
