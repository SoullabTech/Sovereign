# Practitioner Publishing — Event Specification (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route. Completes the
Session-3 grammar under the founder's rulings **R1–R4** (2026-08-06), recorded in
[`…EVENTS_2026-08-06.md`](PRACTITIONER_PUBLISHING_EVENTS_2026-08-06.md).

Scope, as set: **exact fact language · visibility · authority-instance references · supersession ·
erasure handling.** Once complete, the ontology's implementation block may be reconsidered — that
reconsideration is a founder act, ⛔ not a consequence of this document existing.

---

## 1. The record

One ledger (**R1**), append-only, one row per act.

| Field | Rule |
|---|---|
| `event_id` | immutable |
| `occurred_at` | the moment of the act |
| `act` | from the closed vocabulary (§2). ⛔ Never free text |
| `acted_by` | the person who performed it |
| `authored_by` | author of the object acted on; differs from `acted_by` only under a ruled delegation |
| `authority_instance` | §4 — concrete instance, ⛔ never a bare category |
| `authority_snapshot` | §4.3 — what was true at `occurred_at`, frozen |
| `commitment_ref` | the relationship space or cohort the act occurs within |
| `object_ref` + `object_version` | what, at which version |
| `fact` | §3 — the canonical sentence this row asserts |
| `content_ref` | pointer to the act's words, where it has any (§6) |
| `audience` | member · cohort · self |
| `gesture_force` | `share \| recommend \| assign` — Placement only |
| `visibility` | §5 — per party, fixed at write time |
| `supersedes` | prior `event_id` this act replaces, where applicable |

⛔ **No `updated_at`. No `deleted_at`. No status column.** A row never changes. Change is a later
row that supersedes it.

## 2. The five acts and their vocabulary

| Act | Vocabulary |
|---|---|
| **Placement** | `placed` · `placement_withdrawn` |
| **Uptake** | `taken_up` · `set_down` · `attestation_confirmed` · `attestation_disputed` |
| **Attestation** | `attested` |
| **Withdrawal** | `work_withdrawn_from_placement` · `work_deratified` · `practitioner_visibility_withdrawn` *(existing — reuse)* |
| **Ratification** | `work_ratified` · `arrangement_composed` · `arrangement_revised` · `work_authored` · `work_revised` |

**Absent by ruling (R4)** — ⛔ `viewed` · `opened` · `downloaded` · `delivered` · `reminded` ·
`overdue` · `progressed` · `completed` (except as a member `taken_up`/declaration) ·
`recommended_by_maia`.

⭐ **Delivery infrastructure may record technical delivery in its own operational store. It may
never be promoted into this ledger, joined into it at read time, or surfaced beside it.** Promotion
is the drift path: a delivery record rendered next to a placement becomes a read receipt.

## 3. Exact fact language

⭐ **The canonical `fact` is the row's meaning; the rendered strings are that meaning addressed to a
reader. A rendering that asserts more than the canonical fact is a defect, not copy.**

| Act | Canonical fact | Rendered to practitioner | Rendered to member |
|---|---|---|---|
| `placed` | *P placed OBJECT@v into the commitment with M on DATE, as SHARE/RECOMMEND/ASSIGN* | "You shared *Title* with M" | "Larry shared *Title* with you" |
| `placed` (assign) | as above, force = assign | "You asked M to work with *Title*" | "Larry asked you to work with *Title*" |
| `placement_withdrawn` | *P withdrew the placement of OBJECT@v on DATE* | "You withdrew *Title*" | "Larry withdrew *Title*" |
| `taken_up` | *M declared they are working with OBJECT@v on DATE* | "M said they're working with *Title*" | "You're working with *Title*" |
| `set_down` | *M declared they set OBJECT@v down on DATE* | "M set *Title* down" | "You set *Title* down" |
| `attested` | ⭐ *P recorded that P heard M say STATEMENT on DATE* | "You recorded: M told you …" | ⭐ "**Larry recorded that you told him** …" |
| `attestation_confirmed` | *M confirmed P's attestation E on DATE* | "M confirmed this" | "You confirmed this" |
| `attestation_disputed` | *M disputed P's attestation E on DATE* | "M disputed this" | "You said this isn't right" |
| `work_withdrawn_from_placement` | *P withdrew OBJECT from future placement on DATE* | "*Title* is no longer available to place" | — (not rendered) |
| `practitioner_visibility_withdrawn` | *M ended P's access to THREAD on DATE* | "M withdrew access" (⛔ no content, ⛔ no reason) | "You withdrew Larry's access" |

**Three prohibitions on rendering, binding across every surface:**

1. ⛔ An attestation may **never** render as *"Kelly declared X"* or *"You said X"* — not in a
   list, not in a summary, not in MAIA's voice, not after the member confirms an *unrelated* item.
   ✅ Only `attestation_confirmed` licenses *"You confirmed you said X."*
2. ⛔ **Absence never renders as a state.** No "not started," "no response," "not opened." Where the
   member has declared nothing, the honest rendering is nothing — or *"nothing recorded."*
3. ⛔ **No count that implies a norm** — no "3 of 7 taken up," no streaks, no comparisons across
   members (**N8**).

## 4. Authority instance references (R3)

### 4.1 Form

`<kind>:<id>[:<qualifier>]` — the instance, never the class.

| Act | Required instance |
|---|---|
| author / revise / ratify Work | `work:<id>:authored_by:<person_id>` |
| compose / revise Arrangement | `arrangement:<id>:authored_by:<person_id>` |
| `placed`, `attested` | `relationship_space:<id>:steward` |
| `taken_up`, `set_down`, `attestation_confirmed/disputed` | `declaration:<member_id>:self` |
| `practitioner_visibility_withdrawn` | `declaration:<member_id>:self` |
| any delegated act | `delegation_grant:<id>` ⚠️ *no such instrument exists yet — until one is ruled, no act may name it, and delegated acts therefore cannot be written* |
| custodial act | `custodial_mandate:<id>` ⚠️ *instrument not yet designed (canon candidate, source 5)* |

⛔ `relationship`, `authorship`, `delegation`, `admin`, `role:practitioner` — a bare category names
an authority class without proving the authority existed for this act.

### 4.2 Write-time validation (fail-closed)

A write is **refused** — never downgraded, never defaulted — when:

1. `authority_instance` is absent, malformed, or a bare category.
2. The named instance does not resolve.
3. The instance did not confer the claimed authority **at `occurred_at`**.
4. A `relationship_space` instance is not `status='active'` **and** `consent_status='accepted'`.
5. The object is not `ratified` where the act requires ratification.
6. `acted_by ≠ authored_by` without a resolvable `delegation_grant` — ⭐ which today means **always
   refused**.
7. The act is `attested` and the canonical fact does not name both the attesting party and the
   reporting party.

### 4.3 The snapshot

⭐ The row preserves what was true at `occurred_at`: the instance's kind and id, its status and
consent state, the parties, and the validating rule's version. **Later changes to roles,
relationships, or consent must never retroactively authorize or invalidate a recorded act.**

Two failure modes this closes: a revoked relationship silently invalidating history that was
lawful when made; and a *newly granted* role silently legitimising an act performed without it.

## 5. Visibility

Fixed at write time, per party. ⛔ Never recomputed from current state.

| Row | Practitioner sees | Member sees | Anyone else |
|---|---|---|---|
| practitioner's own authoring / ratification | full | — | ⛔ no |
| `placed` / `placement_withdrawn` | full | full | ⛔ no |
| `attested` | full | full | ⛔ no |
| member `taken_up` / `set_down` of a Work **that practitioner placed** | full | full | ⛔ no |
| member declarations about anything else | ⛔ **no** | full | ⛔ no |
| `practitioner_visibility_withdrawn` | ⭐ **the fact only** — ⛔ never content, ⛔ never reason | full | ⛔ no |
| custodial acts | ⛔ no | ⛔ no | custodial log only |

⭐ **Reading your own history is not surveillance; reading someone else's behaviour is.** A
practitioner reads every act *they* performed, plus member declarations *directed at them*. Nothing
else — no cohort rollups, no cross-client aggregation (**N7**), no "clients who took this up."

⛔ **The ledger is not a MAIA context source.** Whether MAIA may read class A/B rows is the unruled
§7 crossing question. This specification neither opens nor pre-answers it; it ensures class C has no
row to read.

## 6. Supersession

| Act | How it is undone |
|---|---|
| `placed` | ⛔ never undone. `placement_withdrawn` supersedes — the placement remains historically true |
| `attested` | ⛔ never edited. A corrected attestation is a new row superseding the prior |
| `taken_up` | `set_down` supersedes; re-taking up is a new row |
| `work_ratified` | `work_deratified` supersedes; prior placements are unaffected |
| `work_revised` | new version; ⭐ **existing placements keep pointing at the version that was placed** |
| member withdrawal | ⛔ never superseded by a practitioner act |

⭐ *You cannot unsay something you said to someone. You can only say something after it.* A chain of
supersession is the honest record of a change of mind; a mutated row is a false record of never
having changed it.

## 7. Erasure

The hard case: an append-only ledger meeting a legitimate erasure obligation.

**The distinction that resolves most of it:**

> ⭐ **The *fact that an act occurred between two people* is a shared relational fact. The *content*
> of the act is not.**

Larry's knowledge that he placed something is his own history; erasing it would delete one party's
record of their own authorship at the other party's request. The **words** are separable.

**Mechanism (grounded in existing substrate):** act content is stored encrypted with per-subject
keys — `practitioner_client_notes` already carries `content_enc` + `content_enc_meta` with a `kid`.
**Erasure destroys the key**; `content_ref` resolves to *erased*. The row persists as a **tombstone**
carrying act, parties, timestamp, and authority instance — enough to keep the history internally
consistent, ⛔ never enough to reconstruct what was said.

⭐ **Tombstone purity (founder, 2026-08-06).** A tombstone must not carry **summaries, embeddings,
classifications, excerpts, topic labels, sentiment, or any derived meaning** that effectively
preserves the content after key destruction. ⛔ Key destruction that leaves a vector, a distillate,
or a three-word summary standing is not erasure — it is erasure of the evidence that the content was
retained. This binds every downstream store too: `library_chunks`, `library_distillates`, and any
index derived from erased content are erased with it.

| Request | Disposition |
|---|---|
| Member erases their own **declarations** | ✅ content erased; tombstone persists |
| Member erases an **attestation about them** | ⚠️ **needs a ruling.** Authored by Larry, subject is the member's speech. My read: the *content* should be erasable at member request and the *fact of attestation* persists — but this is a genuine conflict of two authorships and ⛔ should not be settled by implementation |
| Member erases the **practitioner's placement words** | ⛔ no — the practitioner's speech is the practitioner's authorship. The member may withdraw visibility |
| Practitioner erases their **own Work** | ✅ from future placement; ⛔ not from placements already made |
| Legal / statutory erasure | custodial mandate (canon source 5) — named, scoped, logged; ⭐ **the custodial act itself earns a row** |
| Full account closure | custodial mandate; tombstones persist with parties pseudonymised |

⛔ **Never**: silent deletion · a tombstone that misdescribes the act it replaces · erasure that
leaves a counterparty's history inconsistent without a visible tombstone explaining why.

**Sanctuary Mode:** publishing acts are not Sanctuary content. ⛔ But nothing said in a Sanctuary
session may become a `placed`, `attested`, or `taken_up` row — including at the member's request
during that session (Sanctuary invariant 6, absolute).

## 8. What must exist before implementation

1. **Rulings still open:** attestation-content erasure (§7) · delegation grant instrument (§4.1) ·
   custodial mandate instrument (canon source 5) · MAIA read access to class A/B (§7 crossing rule).
2. **Preconditions, not bugs:** role-vocabulary consolidation (eight meanings) · no organization
   entity · `practitioner_materials` disposition · Field Object versioning model.
3. **Gate:** every new scoped surface acquires checks in `scripts/verify-colab-boundaries.ts`
   (31/31 in production before any tester wave).
4. ⭐ **Rendering conformance:** §3's three prohibitions need a test, not a review. The failure mode
   is a correct row rendered as a false sentence — invisible to schema checks.

## 9. Not authorized

⛔ Schema, migration, code, route, UI · ⛔ any ruling in §8.1 · ⛔ widening
`member_field_note_events` · ⛔ a MAIA read path · ⛔ a delegation or custodial instrument ·
⛔ lifting the ontology's implementation block — that is a founder act.
