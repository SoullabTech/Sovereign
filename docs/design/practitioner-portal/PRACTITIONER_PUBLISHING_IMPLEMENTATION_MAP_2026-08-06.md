# Practitioner Publishing — Reconciliation Ledger & Implementation Map (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route. ⛔ **This document does not authorize implementation and proposes no migrations.**

**Source set (six):** [Candidate Model Synthesis](../now-what/PRACTITIONER_PUBLISHING_CANDIDATE_MODEL_SYNTHESIS_2026-08-06.md) · [Ontology](PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md) · [Permissions](PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md) · [Events](PRACTITIONER_PUBLISHING_EVENTS_2026-08-06.md) · [Event Specification](PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md) · [Rendering Conformance](PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md)

**Provenance source (not a specification):** [the seven-amendment record](../now-what/PRACTITIONER_PUBLISHING_AND_THE_PRACTICE_SPACE_2026-08-06.md).

**The test this document runs, and nothing wider:**

> **Can every ruled concept be mapped without inventing a new constitutional object or silently relying on a missing substrate?**

⛔ Where the answer is no, this map **exposes the gap rather than repairing it.**

---

# PART 1 — Reconciliation ledger

Marks used: **ruled** · **still candidate** · **superseded** · **genuinely conflicting** · **unmappable**.

⚠️ The Synthesis was authored in a parallel session **without consulting the five portal artifacts**. Where it differs, the portal set governs — it is grounded in observed migrations. Differences are recorded below rather than silently dropped.

| Concept | Current ruling | Canonical source | Conflicts or drift | Mapping consequence |
|---|---|---|---|---|
| **Work** | Practitioner-authored artifact, exists independently of any member. `form` is an **attribute**, not a type hierarchy. Composable only when `ratified`; only the practitioner's own gesture ratifies. ⛔ No member-derived state (**N8**) | Ontology §2.1 | ⚠️ **Synthesis drift** — §3 listed Program · Course · Module as objects alongside Work | Map to existing `library_sources`. ⛔ Do not create a per-form table |
| **Arrangement** | Ordered composition. ⭐ **Program and Collection are the SAME object** at different degrees of sequence — model `ordered` as a property | Ontology §2.2, §3 | 🔴 **Synthesis superseded** — it treated Program as a Work-like object and Arrangement as a separate "authored composition" | One object. ⛔ **Do not build two tables.** Maps to `field_programs` + `field_program_lessons` |
| **Placement** | An **object**, not a join table — *"'shared with' is not a relationship; it is an act with a date and an author"*. References a **specific Work version**. ⭐ **Irreversible by design** | Ontology §2.3, §4; Permissions §4 | ✅ Synthesis agrees on the act; ⚠️ understated that it is an object carrying the occasion and the practitioner's words | ⛔ **UNMAPPABLE — no substrate. This is the one missing object.** |
| **Uptake** | Member-only declaration. ⛔ Never delegable, never suppliable by anyone else | Ontology §2.4; Permissions §4 | ⚠️ Substrate exists **for position only** (`field_program_positions.stated_by`), not for Works generally | Extend the existing attribution primitive; ⛔ do not invent a second declaration shape |
| **Commitment** | The `relationship_space` — `active` + `consent_status='accepted'` between **the acting person and the recipient** | Permissions §1, §3 | ✅ Consistent. Synthesis stated it abstractly; portal grounds it in `20260701000001` | `commitment_ref` → `relationship_spaces.id`. ⭐ Authority container for every Placement |
| **Placement types** | `share \| recommend \| assign` as **`gesture_force`** on the act row; Placement-only | Event Spec §1; Permissions §5 | ✅ Consistent with Synthesis §6 type ⊥ state | One field on the event row. ⛔ Never an object state |
| **Object states** | Work: `uploaded → processed → reviewed → ratified → archived`, **extend don't replace**. Revision = new version with `supersedes`; ⛔ prior versions retired in place, never deleted | Ontology §5 | ⚠️ **Synthesis drift** — proposed `draft → published → superseded/withdrawn/archived`, a parallel vocabulary | Use the **existing** lifecycle. ⛔ Do not introduce `draft`/`published` |
| **Placement states** | ⭐ **There are none.** Append-only; change is a **later row that supersedes**. ⛔ No `updated_at`, no `deleted_at`, no status column | Event Spec §1, §6 | 🔴 **Synthesis SUPERSEDED** — its `created → delivered → accepted \| declined → completed` lifecycle does not exist and must not be built | ⛔ **No placement state machine.** `taken_up` / `set_down` are member acts, not placement states |
| **Attestation** | ✅ **R2** — a third authored act, ⛔ not a fifth object. Vocabulary: `attested` · `attestation_confirmed` · `attestation_disputed` | Events R2; Event Spec §2–3 | 🔴 **Synthesis superseded** — listed "attestation's final event shape" as open; it is specified | Map all three act types. ⭐ Highest-risk rendering |
| **Authority sources** | Exactly four: **Authorship · Relationship · Declaration · Ratification.** ⛔ Not authority: team membership · caseload visibility · role string · seniority | Permissions §3 | ⚠️ Synthesis §9 posed six *questions* but named no sources | Every gesture validates against exactly one source |
| **Authority instance** | ✅ **R3** — mandatory at write time, **concrete instance not category** (`relationship_space:<id>:steward`, ⛔ never `relationship`). Validated fail-closed; snapshot frozen at `occurred_at`. ⛔ Later role changes never retroactively authorize or invalidate | Events R3; Event Spec §4 | 🔴 **Synthesis wrongly flagged this "new at consolidation"** — corrected in its §0a | Two columns: `authority_instance` + `authority_snapshot` |
| **Event ledger** | ✅ **R1** — **separate publishing ledger.** ⛔ Do not widen `member_field_note_events` | Events R1 | 🔴 Synthesis wrongly listed as open | One new append-only ledger. ⛔ No reuse |
| **Act · Fact · Record** | Canonical `fact` sentence per act type, fixed. ⭐ *A rendering that asserts more than the canonical fact is a defect, not copy* | Event Spec §3 | ✅ Consistent; portal is strictly more precise | `fact` is a column, not a comment |
| **recorded ⊥ visible ⊥ actionable** | `visibility` fixed **at write time, per party**; ⛔ never recomputed from current state. ⛔ The ledger is **not a MAIA context source** | Event Spec §5 | ✅ Consistent with Synthesis §10 | `visibility` column written once. ⛔ No runtime visibility computation |
| **Rendering bindings** | Registered **templates** with typed slots (`{party}` `{title}` `{date}` `{count}`). ⛔ No prose interpolation, no second-person speech verb for an act the viewer did not perform, no predicate the canonical fact lacks, no absence-keyed conditionals, no cross-member aggregation | Rendering Conformance §2–3 | ⚠️ **Absent from the Synthesis entirely** — pure addition | Template registry + conformance tests. ⭐ *Needs a test, not a review* |
| **Erasure / tombstones** | ⭐ *The fact that an act occurred is shared; the **content** is not.* Per-subject key destruction; `content_ref` → *erased*; row persists as tombstone. ⭐ **Tombstone purity** — ⛔ no summaries, embeddings, classifications, excerpts, topic labels, sentiment; binds `library_chunks`, `library_distillates`, every derived index | Event Spec §7 | ⚠️ **Synthesis overstated the gap** — it called erasure wholly open; the mechanism is specified, **one case** is open | Encrypted content + key destruction. ⛔ `DELETE` still refused |
| **Attestation-content erasure** | ⛔ **Genuinely open** — a real conflict of two authorships (Larry authored it; the member's speech is its subject). ⛔ Must not be settled by implementation | Event Spec §7 | — | ⛔ **Blocked row.** Do not implement either way |
| **Offer / Invitation** | 🟡 **Still candidate** — held gestures, earned by evidence only | Synthesis §6 | Absent from portal set; no conflict | ⛔ Not mapped. Not built |
| **Governing pair · Acts create facts** | 🟡 **Still candidate** — two nominations, unratified | Synthesis §1, §5 | Portal set operates consistently with both without citing them | ⛔ Not mapped. Ratification is a founder act |

### Cross-cutting drift the ledger surfaces

1. ⚠️ **Two vocabularies exist for the same lifecycle** (Synthesis `draft/published` vs. Ontology `uploaded→…→ratified`). ⛔ The domain-model artifact must collapse this to one; ⛔ leaving both in the tree is the stated failure mode.
2. 🔴 **The Synthesis's placement state machine is the most consequential drift.** It is not merely unbuilt — an append-only ledger and a mutable placement status are **incompatible designs**. Building the second silently discards R1's guarantee.
3. ⚠️ **`Program` appears in three roles** across the source set (a Work-like object, an Arrangement, and a member position). Ontology §3 resolves it; ⛔ the resolution must be carried, not re-derived.

---

# PART 2 — Implementation map

⛔ **Not schema. Not code. Not authorization.** *Required storage* names what a concept would need, ⛔ never how to build it.

| Concept | Existing substrate | Required storage | Authority validation | Event emitted | Canonical fact | Rendering path | Gap / disposition |
|---|---|---|---|---|---|---|---|
| **Work** | ✅ `library_sources` (`practitioner_member_id`, `field_slug`, `vault_file_id`, `review_status`, `ratified_at/by`; forms incl. manual/worksheet/exercise/audio/video/link/document) — `20260714000001` | version lineage (`supersedes`) | **Authorship**; ratify = practitioner's own gesture only | `work_ratified` · `work_deratified` · `work_revised` | *P ratified/revised OBJECT@v* | practitioner-only | ⚠️ **Versioning is a candidate answer, not a ruling** (Ontology §9.1). ⛔ Do not build lineage on an unruled model |
| **Arrangement** | ✅ `field_programs` + `field_program_lessons` + `field_program_revisions` (append-only) — `20260712000001`, `20260714000001` | `ordered` property to unify Program/Collection | **Authorship + Ratification** (own ratified Works only) | — *(composition is not a relational act)* | — | practitioner-only until placed | ⚠️ `material_ids UUID[]` carries **no FK**. ⛔ Not a gap this map may close |
| **Placement** | ⛔ **NONE.** `field_program_lessons.material_ids` has no FK and **no direct-to-member path** | an act object: author · addressee · Work@version · occasion · practitioner's words · `gesture_force` | **Authorship + Relationship** — own `active`, `consent_status='accepted'` space with **that member** | `placed` · `placement_withdrawn` | *P placed OBJECT@v into the commitment with M on DATE, as SHARE/RECOMMEND/ASSIGN* | both parties; ⛔ no third party | 🔴 **BLOCKED — the one missing object.** ⭐ Everything else reconciles to substrate; this does not |
| **Authority** | ⚠️ `relationship_spaces` (container) · `admin_role_grants` (operational only) | concrete `authority_instance` + frozen `authority_snapshot` | fail-closed at write time (**R3**) | every row carries it | — | never rendered | 🔴 **BLOCKED — cannot key on `role`.** ⭐ `role` has **eight unrelated meanings** across migrations. Consolidation is a **precondition, not a bug** |
| **Uptake** | ⚠️ `field_program_positions.stated_by ∈ member_confirmed \| member_stated \| practitioner_seeded` + `member_confirmed_at` — **position only** | the same attribution primitive, generalized to any placed object | **Declaration** — ⭐ member only, ⛔ never delegable | `taken_up` · `set_down` | *M declared they are working with / set down OBJECT@v on DATE* | both parties, for Works **P placed** | ⚠️ Primitive exists in the right shape; **not general**. ⛔ Do not invent a second declaration mechanism |
| **Commitment** | ✅ `relationship_spaces` — `20260701000001` | `commitment_ref` on every row | is itself the Relationship authority | — | — | — | ✅ **Maps cleanly.** ⚠️ **Cohort has no object** (Ontology §9.4) — Announcement unmappable |
| **Attestation** | ⛔ none. ⚠️ `practitioner_client_notes` (encrypted, `content_enc` + `kid`) is the **key-destruction precedent**, ⛔ not a Placement | act rows + encrypted content + per-subject key | **Relationship** (own active) | `attested` · `attestation_confirmed` · `attestation_disputed` | ⭐ *P recorded that P **heard M say** STATEMENT on DATE* — ⛔ never *M declared* | ⭐ member: `{party} recorded that you told him/them …` — **exact skeleton, mandatory** | 🔴 **Content erasure genuinely open.** ⛔ Do not implement either disposition |
| **Withdrawal (practitioner)** | ⚠️ `library_sources.review_status` (de-ratify shape) | supersession row | **Authorship** | `work_withdrawn_from_placement` · `placement_withdrawn` | *P withdrew OBJECT from future placement / withdrew the placement* | ⛔ recipients of prior placements unaffected | ⚠️ ⛔ **Never erases what was received** |
| **Withdrawal (member visibility)** | ✅ Lane V ledger — `20260730000002` | — | **Declaration** — member only | `practitioner_visibility_withdrawn` | *M ended P's access to THREAD on DATE* | ⭐ practitioner sees **the fact only** — ⛔ no content, ⛔ no reason | ✅ **Maps cleanly.** ⛔ Never superseded by a practitioner act |
| **Ratification (governance)** | ⚠️ `library_sources.ratified_by` (object-side only) | — | authorized governor | — | *a candidate acquired constitutional force* | — | ⚠️ Object ratification exists; **constitutional** ratification is a founder act with no substrate, and needs none |
| **Rendering** | ⛔ none | template registry keyed by `act` + viewer party | — | — | reads `fact` | conformance-tested skeletons | 🔴 **No enforcement exists.** ⭐ *The failure mode is a correct row rendered as a false sentence — invisible to schema checks* |
| **Erasure** | ⚠️ `content_enc` + `content_enc_meta.kid` precedent | per-subject keys; tombstone rows | custodial mandate — **named, scoped, logged**; ⭐ the custodial act earns its own row | custodial row | tombstone: act · parties · timestamp · authority | erased content renders as *"shared something"* — ⛔ never a placeholder implying content | ⚠️ Mechanism specified. 🔴 Custodial-mandate instrument **does not exist** |

## Carried absences — recorded, ⛔ not solved

| Absence | Consequence |
|---|---|
| **No delegation primitive** | HC1 (assistant) has no floor. ⛔ Not inferable from Co-Lab membership or admin role |
| **No organization rights-holder** | HC3 has nothing to grant. `practice_display_name` is a display string; `studio_teams.owner_id` is a person. ⭐ **N7** — aggregation cannot manufacture a rights grant unavailable individually. A contractual/IP instrument, ⛔ not a platform permission |
| **No MAIA principal** | ⭐ MAIA has **no seat** in this model — not "denied," absent. ⛔ A one-click approval of a machine-drafted Placement is machine authorship with a human alibi |
| **No member-view telemetry events** | ⛔ Deliberate (**R4**, **N8**). `artifact_shares.view_count` / `last_viewed_at` is *the shape to refuse*. Delivery infrastructure may record technical delivery separately; ⛔ never promoted into this ledger |
| **No attestation-content erasure implementation** | ⛔ Two authorships in genuine conflict. Ruling required |
| **No settled MAIA access to classes A/B** | ⛔ Unruled §7 crossing rule. The ontology is shaped so **class C has no object to live in**; ⛔ this map adds no hook |

## Verdict on the test

**Can every ruled concept be mapped without inventing a new constitutional object or silently relying on a missing substrate?**

⭐ **Nearly — and the exceptions are informative rather than fatal.**

| | Count | |
|---|---|---|
| ✅ Map cleanly to existing substrate | 4 | Work · Arrangement · Commitment · member-visibility Withdrawal |
| ⚠️ Map to a substrate that exists in the **right shape but wrong scope** | 2 | Uptake (position-only) · practitioner Withdrawal |
| 🔴 **Blocked** | 5 | **Placement** (no object) · **Authority** (`role` ≠ boundary) · **Rendering** (no enforcement) · **attestation-content erasure** (unruled) · **custodial mandate** (no instrument) |

⭐ **The architecture is mature in the sense the test intended: no blocked row required inventing a new constitutional object.** Placement is the one genuinely missing object and was already named as such by the Ontology. The other four blocks are a **missing enforcement layer**, a **substrate hygiene problem** (`role`), and **two absent instruments** — none of them ontological.

## ⭐⭐⭐ Three kinds of gap — ⛔ not interchangeable

Founder taxonomy, 2026-08-06. The five blocked rows are **not one problem**, and treating them as a single "gaps" list is how the wrong response gets applied to the wrong absence:

| Category | Blocked rows | Nature | ⭐ Required response |
|---|---|---|---|
| **Missing object** | **Placement** | structural absence | **modeling** |
| **Missing instrument** | custodial mandate · delegation grant · attestation-content erasure ruling · organization rights-holder | **constitutional** absence | **governance** — ⛔ a founder act, never an engineering decision |
| **Missing enforcement** | rendering conformance · authority validation (`role` consolidation) | operational absence | **implementation** |

⛔ **The failure mode this prevents:** answering a constitutional absence with modeling. Inventing an "organization" entity or a "delegation" table would *look* like progress and would manufacture authority no instrument granted — exactly what **N7** forbids. ⭐ A missing instrument is not a schema gap.

⭐ **What the blocked rows have in common** is not a missing business concept — every one asks *who has authority to do this, and how is that authority enforced?* That is a different phase of design than ontology, which is why no further conceptual work is indicated.

⛔ **What this map does not do:** authorize implementation · propose migrations · resolve any blocked row · lift the Ontology's implementation block. That block lifts only by **founder act**.

## Next work — four distinct tracks

⛔ **Not another conceptual document.** Founder direction, 2026-08-06:

📌 **The tracks below are 1–3 of a seven-track progression** (Measure · Rule · Architect · Implement · Populate/Inhabit · Operate · Steward) — see [`TRACK_PROGRESSION_AND_TRACK_5_INHABIT_2026-08-06.md`](TRACK_PROGRESSION_AND_TRACK_5_INHABIT_2026-08-06.md). ⭐ That record clarifies that this lane's track 3 is **modeling**, ⛔ not building; **Build is track 4**.

| # | Track | Addresses | Nature |
|---|---|---|---|
| 1 | **Production verification** — read-only checks against deployed reality | whether the substrate assumptions in Part 2 actually hold live | ⚠️ **no such check set exists yet** — see note |
| 2 | **Governance** — attestation-content erasure · custodial mandate instrument | the *missing instrument* category | founder act |
| 3 | **Implementation design** — beginning with **Placement** | the *missing object* category | modeling |
| 4 | **Implementation** — building the ruled architecture | ⭐ nothing new; ⛔ **fidelity only** | construction |

⭐⭐⭐ **Track 4 is different in kind.** Tracks 1–3 are about *thinking correctly*; Track 4 is about
*building correctly* — and its danger is ⛔ not inventing ontology but **violating the rulings while
implementing them**. Its charter, preconditions, per-PR questions, forbidden acts and the governing
law — ⭐ *implementation may specialize; it may never reinterpret* — are recorded in
[`…TRACK_4_IMPLEMENTATION_CHARTER_2026-08-06.md`](PRACTITIONER_PUBLISHING_TRACK_4_IMPLEMENTATION_CHARTER_2026-08-06.md).
⛔ **It may not begin while any Track 2 ruling is open.**

⚠️ **Note on track 1:** Part 2's substrate column is **[O] observed from migration files**, ⛔ not from production. Migration presence is not proof of deployed schema state. No read-only production check set for this lane exists in `scripts/` as of 2026-08-06; authoring one is unstarted work, not a recovery of something previously specified.

📌 **Track 1 is complete** — [`…SUBSTRATE_VERIFICATION_2026-08-06.md`](PRACTITIONER_PUBLISHING_SUBSTRATE_VERIFICATION_2026-08-06.md), measured against SHA `b1399f693`. ⛔ Part 2's verdict table is superseded by it.

## ⭐⭐⭐ Track 2 — ruling order (founder, 2026-08-06)

⛔ **Sequenced, not parallel.** Each ruling supplies a premise the next one needs:

| # | Ruling | Establishes | Depends on |
|---|---|---|---|
| **1** | **Commitment Authority** | ⭐ the **constitutional container** — `relationship_spaces` or `practitioner_clients` | — |
| **2** | **Custodial Authority** | ⭐⭐ **the fifth authority source** | 1 — you cannot define what bypasses commitment-relative jurisdiction until the commitment is fixed |
| **3** | **Attestation Governance** | resolves the **two-authorship conflict** (Larry authored it; the member's speech is its subject) | 1 — whose jurisdiction the attestation sits in |
| **4** | **Commitment Event Home** | fixes the **append-only history** | 1, 2, 3 — the ledger must attach to the settled container, accommodate custodial rows, and carry the ruled tombstone semantics |

⚠️ **Ruling 2 amends settled text, and should be made knowing that.** Permissions §3 currently states four authority sources — Authorship · Relationship · Declaration · Ratification — with *"Every permission below derives from exactly one of these. Nothing else grants."* ⭐ Naming custodial authority the **fifth source** is a stronger move than a carve-out: it makes custodial acts **positively authorized and therefore constrained**, rather than an exception that escapes the grid. ⛔ It is not a silent edit — Permissions §3 must be revised by the same ruling.

⭐ **Note the renaming in 4:** blocker 4 was recorded as *"Publishing event home."* Once ruling 1 settles the container, the event home attaches to **the commitment**, not to *publishing* — which is why the ledger question cannot be answered first.

### Track 3 begins only after all four

⭐ **Founder, 2026-08-06:** *only after those four rulings would I begin Track 3, because at that point the engineering work would be grounded in settled constitutional decisions rather than implicitly making them.* ⭐⭐⭐ **That is the whole point of the sequence** — an implementation that starts earlier does not avoid these decisions, it **makes them silently by choosing a schema.**

⚠️ **One precision, so the gate is not read as wider than it is.** The four rulings settle **two** of the four Track-3 blockers:

| Blocker | Settled by Track 2? |
|---|---|
| 2 — Commitment authority | ✅ ruling 1 |
| 4 — Event home | ✅ ruling 4 |
| 1 — **Identity linkage** (operational adoption) | ⛔ **no** — 12 of 13 relationships still name no member |
| 3 — **Eligible Work corpus** (product lifecycle) | ⛔ **no** — 0 of 2228 Works ratified |

⭐ So after the four rulings, Placement **design** is constitutionally grounded and may proceed. ⛔ Placement in **use** still waits on 1 and 3 — which are *adoption and lifecycle* problems, ⛔ not rulings and ⛔ not schema. Building the table does not populate a governed subject or ratify a single Work.

### ⭐⭐⭐ Track 2 authorizes design, not deployment

Three thresholds, ⛔ not one:

| Threshold | After the four rulings |
|---|---|
| **Constitutionally grounded** | ✅ yes |
| **Implementable** | ✅ yes |
| **Operationally usable** | ⛔ **not yet** — gated on two *empirical* conditions |

⭐ The two adoption gates are **empirical conditions, not governance questions**: relationships must resolve to governed members, and practitioner-authored Works must progress to `ratified`. ⛔ No ruling can satisfy either.

### The dependency chain, end to end

```
1. Commitment Authority
        ↓
2. Custodial Authority
        ↓
3. Attestation Governance
        ↓
4. Commitment Event Home
        ↓
   Placement design
        ↓
   Identity adoption          ← empirical
        ↓
   Eligible Work corpus       ← empirical
        ↓
   Operational use
```

⭐ Each step rests on a **settled floor beneath it** rather than quietly defining that floor itself.

### ⛔ The inference this sequence refuses

> **A completed schema is not evidence that a capability exists.**

⭐ A capability is operational only when **both** the constitutional foundation **and** the measured substrate conditions are satisfied.

📌 This is the same discipline the project already holds as *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified* (CLAUDE.md) — ⭐ extended one rung **downward**, to the constitutional floor the ladder was standing on all along.

### ⭐⭐ On Custodial Authority as the fifth source

The consequence is **not** that there are five instead of four. It is that:

> **Every act must continue to name exactly one authority source.**

⭐ Custodial acts stay **constrained by the same discipline as every other act** instead of bypassing it. ⛔ An exception accumulates *outside* the architecture; a named source stays *inside* it.
