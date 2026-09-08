# JARVIS — Writer's Studio Experiences · FALSIFY

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XI, §XIII, §XIV. FALSIFY authorized.
**Status:** ⛔ No CONSTITUTE, no DESIGN of production behaviour, no build, no schema.

**The proposition under attack:**

> One member-owned Experience ontology can support both self-directed and facilitated creative fields
> while preserving Work sovereignty, participant privacy, historical versions, facilitator authorship,
> contributor provenance, and non-prescriptive creative structure.

**Result: the proposition SURVIVES on eight attacks, SURVIVES WITH CONDITION on four, and FAILS on one.**

> ⭐ **The failure is returned rather than resolved, as §XIII requires.** It is **not** the single-object
> proposition and **not** the For Myself / For Others symmetry — both of those held under direct attack.
> It is **contributor provenance**: nothing in the architecture can hold a contribution that originated
> with another human *pending the author's decision to adopt it*. The proposition claims to preserve
> contributor provenance. It cannot, because the object that would carry it does not exist and is not
> a variant of anything that does.

---

# PART 1 — Attacks on the single-object proposition

## F1 — Ownership asymmetry · **SURVIVES**

*Attack:* For Myself the member owns the container; For Others the facilitator owns it and participants
do not. One object cannot hold two ownership models.

*Result:* it holds one. The facilitator **is a member** (R1 removed the `practitioners` anchor), so
ownership is `owner_member_id` in both orientations. The self case is the degenerate case of the
facilitated one: the owner is also the only person present.

⚠️ This survives *only because of R1*. Under `owner_practitioner_id NOT NULL`, F1 would fail
immediately — a member could not own an Experience at all.

## F2 — Participation asymmetry · **SURVIVES WITH CONDITION**

*Attack:* if the object requires a participation row, the self case acquires a roster of one — which is
Witness A's "student record", inside the member's own Studio.

*Condition, discovered by the attack:*

> **Participation must be a separate, optional relation — never a required field of the container, and
> never implied by ownership.** A self-directed Experience with **zero** participation rows is the
> normal case, not an empty state.

Under that condition one object serves both. Without it, either the self case gets a roster or the
facilitated case has nowhere to say who is present. **This is the constraint most likely to be lost in
implementation**, because "every Experience has participants" is the intuitive shape and it is wrong.

## F3 — Versioning ceremony · **SURVIVES, and the attack strengthens the law**

*Attack:* R4 requires versions so a facilitator cannot rewrite the field earlier participants moved
through. In the self case nobody else moved through it, so versioning is pure ceremony — and if
versioning is therefore made optional, R4 degrades from a law to a mode.

*Result:* the premise is wrong. In the self case the person protected by the version **is the member
themselves**: it is the record of the field they actually moved through, which is precisely the
genealogy value the Reflections→Works architecture already asserts. Versioning is not ceremony in the
self case; it is the same law with the same beneficiary structure and a smaller cast.

> **Reconciled:** the law binds to **encounter**, not to orientation. Revising an Experience nobody has
> entered rewrites nothing. Revising one that has been entered creates a descendant version — whether
> the person who entered it is a stranger or the author.

## F4 — The impoverishment failure mode · **SURVIVES**

*Attack (§XIII, named explicitly):* the only way to fit both may be to impoverish facilitated use into a
private self-help container.

*Result:* what the facilitated case needs beyond the self case is exactly three things — **participation**
(F2), **authorship attribution on movements** (F8), and **bounded sharing** (F6). All three are additive
relations around the container; none changes the container. Removing them yields the self case exactly,
with nothing missing. That is composition, not impoverishment.

## F5 — The smuggling failure mode · **SURVIVES**

*Attack (§XIII):* the only way to fit both may be to smuggle practitioner/client semantics into
self-directed use.

*Result:* nothing in F1–F4 requires `practitioner_clients`, intake records, contact ownership,
facilitator-created enrollment, or a status lifecycle. R1 removed the anchor and no attack has needed to
restore it. ⚠️ The residual risk is **reuse pressure at build time**, not ontology: `coach_*` is
sitting there, shaped almost right, one foreign key away from wrong.

---

# PART 2 — The four witnesses

## Witness A — Self / Poetry · **SURVIVES WITH CONDITION**

*Attacks:* student record · status score · MAIA becomes the poet.

- Student record → defeated by F2 (zero participation rows).
- MAIA becomes the poet → the existing constraint holds: `maiaOffering.ts` already forbids anything
  under the MAIA region authoring, owning, or scoring the work; generation must be optional rather than
  default.
- ⚠️ **Status score survives as a live threat, from an unexpected direction.** The movement shape
  inherited from `coach_program_stages` carries an ordered `position`. **A progress score does not need
  a column** — "movement 3 of 6", a completion count, or a derived percentage is a status economy
  assembled from ordering alone, exactly as `creativity_journeys` assembles one from `current_stage`.

> **Condition:** movements are **addressable, not ordinal-in-force**. A member must be able to be in a
> container at **no position at all**, and nothing may derive a completion figure from movement order.
> `living_works.stage` is the precedent and the wording to inherit: *"Orientation, never progress: no
> ordering is enforced, no completion is implied, and the system never advances it."*

## Witness B — Facilitator / Memoir · **SURVIVES WITH CONDITION**

*Attacks:* implicit access to private Studios · surrender of intellectual property.

- Implicit access → defeated by R3, with the mechanisms already shipped
  (`coach_position_share_consents`: *"Sharing a position is not permission for any broader Field
  access"*; `coach_client_shared_items` for bounded, withdrawable, opaque-lineage artifacts).
- ⚠️ **IP survives as a real gap.** A facilitator's method is not a file — it is the sequence, the
  exercises, the framing language, the questions. `practitioner_materials` / `practitioner_file_shares`
  can share *documents*; **nothing today can mark the text of a movement as facilitator-authored rather
  than platform-supplied.** With no attribution at that level, a participant cannot tell whose voice
  they are reading, and the platform has no basis to refuse redistributing it.

> **Condition:** authorship provenance attaches at the **movement / practice level**, not only at the
> container. A movement must be able to say it is facilitator-authored, and that attribution must
> survive the facilitator's departure.

## Witness C — Screenwriter · **SURVIVES**

*Attacks:* forced linear progression · generic prose pedagogy · entry at the wrong place.

- Entry at Whole Script Encounter → permitted by F2 + Witness A's condition: entry point is a member
  act, and the absence of a position is a valid state. ⚠️ `current_stage_id` would defeat this, which is
  the concrete reason R1 rejected the coach enrollment model.
- Generic prose pedagogy → deferred to §XIV, below.
- ⚠️ Noted, not an ontology failure: *"my second act collapses"* requires that acts be **declared**.
  Under §XIV that is the author's declaration, not the platform's assumption — see F11.

## Witness D — Playwright · **FAILS on contributor provenance**

*Attacks:* historical versions · theatre grammar · **collaborator provenance** · playwright authority ·
**the difference between discovery and adoption**.

Three survive:

- Historical versions → F3, and PT-3's law at the Work tier.
- Theatre grammar → §XIV.
- Playwright authority → `living_work_materials` requires a **declaration** to attach material, with
  `relationship_sentence` and `declared_by`. Nothing enters a Work unbidden. Adoption is already an
  authored act.

⭐ **The fourth fails, and it is the §XI class made concrete.**

> *An actor, in rehearsal, discovers that Ruth's line lands differently if she is already holding the
> suitcase. The playwright has not decided whether to keep it.*
>
> **Where does that live?**

Every candidate is wrong, and each is wrong in a different way:

| Candidate | Why it fails |
|---|---|
| `living_work_materials` | Attachment **is** adoption. Recording it here makes the discovery part of the Work, which is exactly the decision not yet taken. |
| The manuscript / a draft | Same failure, one tier lower, and now it is content. |
| `coach_client_shared_items` | Direction is wrong — participant → facilitator. Here a **contributor → author**. And its payload is a snapshot of the member's own material, not another person's contribution. |
| A Reflection | It is not the author's reflection. Filing it there erases the actor. |
| MAIA's memory | It is not MAIA's observation, and the §XI class exists precisely to stop human contribution being absorbed into the AI/author binary. |

**The failure is therefore structural, not a missing column.** The architecture has:

- material **inside** the Work (adopted, declared), and
- material **outside** it (private, the member's own),

and no representation for **a third thing: a contribution that originated with another human, is
attributed to them, sits in the Work's history, and has not been adopted.**

> ⭐ **Returned as the falsifier's result:** the proposition claims to preserve contributor provenance
> and cannot. The missing object sits **at the seam between Experience and Work** — a table read is an
> Experience event; the discovery arises there; the Work is where it may or may not land. The
> distinction the architecture must learn to hold is:
>
> **someone else caused a discovery → the discovery entered the Work's history → the author chose what
> became authored material.**
>
> ⛔ Not designed here. §XI also reserves shared authorship, co-authorship, contractual ownership and
> jointly governed Works to separate law, and this finding must not be read as opening any of them.

⚠️ **Consequence for sequencing:** the contribution object is a **prerequisite of facilitated
Experiences, not of self-directed ones.** A facilitated container without it will silently resolve every
contribution into either "the author's material" or "nothing" — and the first resolution is a
sovereignty breach, the second a loss.

---

# PART 3 — §XIV · Form-responsive without form-prescriptive

**The falsifier: can MAIA and an Experience become form-responsive without the platform becoming
form-prescriptive?**

*Substrate, unchanged:* `living_works.form` free text, member-declared, never system-authored;
`manuscript_structure_units` open `kind` with unbounded nesting; the derived tier bounded to depth 1–3
with a closed signal vocabulary.

## F9 — The unknown form · **SURVIVES WITH CONDITION**

*Attack:* form-responsiveness needs a map from a form to a behaviour, and that map is a
platform-held list of forms — which is a taxonomy. What happens for `verbatim theatre`, `lyric essay`,
`radio play`, or a form not yet named?

> **Condition — the decisive one:** an unrecognised form must produce **absence, not approximation.**
> No nearest-match, no fuzzy mapping, and above all **no inference of form from the text.** A member
> writing what the platform would call a screenplay, who declared nothing, gets no screenplay lens —
> and the system never writes its guess back as their word (§VIII, FR-06).

Under that condition the map is a set of **optional lenses keyed by a member's declaration**, not a
taxonomy of what a Work may be. A form with no lens is fully supported; it simply has no lens. **That
asymmetry — every form supported, only some with lenses — is the whole difference between responsive
and prescriptive.**

## F10 — The lens as covert authority · **SURVIVES WITH CONDITION**

*Attack:* a lens commissioned by a declared form reads the Work through assumptions the member never
agreed to. A member who wrote `stage play` meaning something personal now receives dramaturgy.

> **Condition:** the lens is a **commission the member can decline and change**, and it must be legible
> as a lens — the member can always see which reading is speaking. `form` is their word; a lens is
> someone else's reading of it, and the two must not be conflated.

## F11 — The universal hierarchy · **SURVIVES** ⭐

*Attack (§XIV's core):* if the architecture needs the platform to know the universal hierarchy of
creative work, the design has failed. A dramaturg saying *"your second act collapses"* must know what an
act is.

*Result:* it must know what **this author called** an act. Because `manuscript_structure_units.kind` is
open text and the tree is unbounded, a lens can address *the units the author declared* without holding
any taxonomy:

> **A lens may speak in terms of structure the author declared. It may never assume structure the author
> did not.**

So: a playwright who declared units of kind `act` can be told an act collapses. A poet who declared
nothing gets no structural claim at all — not a weaker one, **none**. A hybrid work whose author
declared `movement` and `panel` is addressed in those words. The platform never learns that plays have
acts; it learns to read what this author built.

⭐ **This is the same principle already found at two other levels, now at a third:**
`living_works.form` (the human declares what it is) · `manuscript_structure_units` (the human declares
how it is organised) · the derived tier bounded at depth 3 with a closed vocabulary (what the machine
may infer is deliberately smaller than what the human may declare).

---

# Verdict

| | Attack | Result |
|---|---|---|
| F1 | Ownership asymmetry | SURVIVES (because of R1) |
| F2 | Participation asymmetry | SURVIVES WITH CONDITION — participation optional, never implied by ownership |
| F3 | Versioning ceremony | SURVIVES — the law binds to encounter, not orientation |
| F4 | Impoverishment of facilitated use | SURVIVES |
| F5 | Smuggling practitioner semantics | SURVIVES |
| A | Self / poetry | SURVIVES WITH CONDITION — movements addressable, never ordinal-in-force |
| B | Facilitator / memoir | SURVIVES WITH CONDITION — authorship attribution at movement level |
| C | Screenwriter | SURVIVES |
| **D** | **Playwright** | 🔴 **FAILS — contributor provenance has no representation** |
| F9 | Unknown form | SURVIVES WITH CONDITION — absence, never approximation |
| F10 | Lens as covert authority | SURVIVES WITH CONDITION — declinable, legible commission |
| F11 | Universal hierarchy | SURVIVES — declared structure only |

**The single-object proposition is not falsified.** For Myself and For Others are orientations of one
container, and no attack required either smuggling or impoverishment.

**The proposition as worded is falsified**, on the one clause it cannot presently honour: *contributor
provenance*. Four conditions additionally attach to clauses that survive.

## Standing

RECOVER ✓ · DISCOVER ✓ · RECONCILE ✓ · **FALSIFY — this document** · CONSTITUTE held · DESIGN held ·
BUILD prohibited.

⛔ Nothing built, designed, renamed, or migrated. The contributor-provenance failure is returned intact
and is **not** repaired here. MAIA commissioning remains an explicit external dependency on CMT-01
(§XII) — this lane names the authority it would need and does not touch the commissioning architecture.
