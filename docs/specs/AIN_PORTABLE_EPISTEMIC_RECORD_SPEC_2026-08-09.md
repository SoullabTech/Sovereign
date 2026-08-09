# AIN Portable Epistemic Record Specification (APER v1)

**Status**: **APPROVED as v1 candidate contract** (founder, 2026-08-09), with the §0.1 envelope amendment.
**Date**: 2026-08-09 · amended same day
**Authored in response to**: `docs/architecture/AIN_OBSIDIAN_ARCHITECTURE_AUDIT_2026-08-09.md` §V Step 1
**Step 2 authorization**: **Keeps only.** Smallest `projectRecord` path, projection proof, loss-surface report. No traversal-to-ingestion, no round-trip mutation, no sync, no adapter cleanup, no generalized export.

---

## 0.1 Envelope amendment (founder, 2026-08-09) — GOVERNING

> **The AIN Portable Epistemic Record is a transport/interchange envelope around governed typed records. It is not a replacement for AIN's canonical ontology and must not flatten distinct record types into one universal memory object.**

This constrains every other section and overrides any reading of them that conflicts.

**What it forbids**: APER must not become the place where record semantics live. `ain_type` is a **pointer to a governed type whose meaning remains defined elsewhere** — in its migration, its canon, its service. APER carries the type; it does not define it. A downstream consumer that can fully understand a record from APER alone, without reference to the governed type, is evidence that the type has been flattened into the envelope.

**Why it matters**: the spec's whole purpose is preventing *epistemic* flattening (declaration vs. inference). Without this guard it would achieve that while causing *ontological* flattening (keep vs. decision vs. encounter all becoming "a memory object with metadata") — solving one collapse by creating another.

**The test**: adding a new `ain_type` must require **no change to §4's universal fields**. If a new type forces new envelope fields, the envelope is absorbing semantics that belong to the type.

**Corollary**: APER v1 deliberately carries *less* than each type contains. Under-carrying with a named loss surface is correct; over-carrying to achieve "completeness" is the failure. See §10.2 and §16.

---

## 0. Naming

This is not a "vault record." The vault is one destination. The contract belongs to AIN.

**A Portable Epistemic Record (APER)** is the minimum representation required to carry an AIN memory object into an external knowledge environment *without losing what kind of knowing it is, who established it, and what authority it carries*.

Obsidian is a **conforming destination**, not the subject. Any environment that can hold structured metadata alongside content — a filesystem, a git repo, a federated peer, a printed archive, a successor system — is a candidate destination. **If the spec cannot be satisfied without Obsidian-specific mechanics, the spec is wrong.**

---

## 1. Problem statement

AIN's epistemic rigor is currently **schema-resident**. It lives in Postgres columns: `source_type`, `registers`, `return_preference`, `crossing_allowed`, `is_breakthrough`, `memory_contracts.disposition`, `provenance_tombstones`. Every one of those distinctions is destroyed the moment a record leaves the database as prose.

The consequence is not merely lossy export. It is **category collapse**: a member's declaration and MAIA's inference become the same kind of object. Once collapsed, the distinction cannot be recovered — not by better parsing, not by re-reading, not by asking. The information is gone.

APER exists to make that collapse structurally impossible rather than merely discouraged.

**What APER is not**: a file format, a folder taxonomy, a note-taking method, or a knowledge-management system. It is a **contract on what must survive transport**.

---

## 2. Projection and ingestion are different acts

This section is load-bearing. Everything else follows from it.

### 2.1 The three acts

| Act | Direction | Produces | Requires |
|---|---|---|---|
| **Projection** | AIN → external | A portable record | A member act (§7, I8) |
| **Traversal** | external → AIN | A **typed candidate reference** | Nothing; read-only |
| **Ingestion** | external → AIN canonical | Canonical AIN memory | A **separate, explicit member act** |

### 2.2 The boundary

**Traversal is not ingestion.** Reading a portable record yields a *reference* — a typed pointer that AIN may use to navigate, to decide what to look up, to know that something exists. It does **not** create canonical memory, and it does **not** grant the referenced content authority to assert.

A traversed record carries **whatever authority its own `epistemic_status` claims, capped at reference level**. It can inform retrieval. It cannot inform assertion. MAIA may say *"there is a record from you about this"*; MAIA may not say *"you believe X"* on the strength of a traversed record alone.

### 2.3 Why the boundary must be structural

Without it, the system acquires a laundering path:

```
MAIA derives something (authority: none)
   → projected to a file (authority: still none, if APER holds)
   → file traversed back
   → ingested as "found in the member's own vault"
   → now reads as declared (authority: the member's own)
```

Each step is individually defensible. The composition is a fabrication. **The external environment must never function as an authority-upgrade channel**, and no amount of care at each step prevents this — only a structural rule does.

**Rule**: `epistemic_status` is monotone-or-fixed under transport. It may never increase. `derived` never becomes `observed` or `declared` by any sequence of projection, traversal, editing, or re-ingestion. The only thing that can make something `declared` is a person declaring it, in AIN, as a first-class act.

### 2.4 Human edits to projected records

If a human edits a projected record in the external environment, that edit is **not** an AIN change. At most it constitutes a **candidate declaration** awaiting a member act inside AIN.

APER v1 does not define the round-trip mechanism. It is required only that the format **not foreclose it** — hence `aper_version`, stable `ain_ref`, and `source_updated_at` (§4), which together let a future round-trip detect divergence rather than silently overwrite.

---

## 3. The three epistemic statuses

`epistemic_status` is the load-bearing field. It answers: **what kind of knowing is this?**

### 3.1 `declared`

A person stated this as true *for them*.

- **Authority**: the author's own, over their own experience. AIN never adjudicates a declaration, never scores its accuracy, never flags it as inconsistent.
- **Establishing act**: an authoring act by an identified person.
- **Minimum provenance**: `authored_by` (identity + role), `authored_at`.
- **A declaration by MAIA is not possible.** MAIA has no experience to declare from. If `authored_by.role` is `maia`, the status is not `declared` — it is `derived`. This is a validation rule, not a convention.

### 3.2 `observed`

Something occurred and was recorded as having occurred.

- **Authority**: the record of occurrence — that it happened, when, and what registered it. Not the meaning of what happened.
- **Establishing act**: an observation event.
- **Minimum provenance**: `observed_by` (identity + role; `system` permitted), `occurred_at`, `observation_method` (what registered it — e.g. `session_transcript`, `practitioner_note`, `calendar_event`, `member_gesture`).
- **The boundary against `derived`**: *"the member opened the app at 09:14"* is observed. *"the member is in a morning practice rhythm"* is derived. If a claim requires a model to produce, it is derived, regardless of how well-evidenced.

### 3.3 `derived`

AIN produced this by inference, synthesis, aggregation, or summarization.

- **Authority**: **none over the person.** A derived record is AIN's product and remains AIN's product permanently.
- **Establishing act**: a derivation.
- **Minimum provenance**: `derived_from` (non-empty list of resolvable `ain_ref`s), `derivation_method` (named, not free text), `derivation_confidence`, `derived_at`.
- **`derived_from` must be non-empty and resolvable.** A derivation whose inputs cannot be named is not a derivation; it is an assertion, and it must not be projected at all.

### 3.4 What is deliberately absent

There is no `inferred_but_probably_true`, no `confirmed`, no `validated`, no confidence score on `declared` or `observed`. **Confidence applies only to `derived`**, because only derivation has an error mode AIN owns. Attaching confidence to a declaration would imply AIN is evaluating the member's self-report — which the system does not do.

### 3.5 Reconciliation with AIN's live epistemic vocabulary

**Correction to §3 as first drafted.** AIN is not epistemically silent today. `member_memory_atoms.epistemological_status` (migration `20260624000001_practitioner_observation_provenance.sql`, typed as `EpistemologicalStatus` in `lib/maia/memoryAtomsLoader.ts:111-116`) is a **live five-value vocabulary**:

`observed` · `reported` · `inferred` · `provisional` · `claimed`

APER v1 therefore does **not** introduce an epistemic vocabulary. Per §0.1, it carries a **projection of the governed one**. The canonical vocabulary remains canonical; APER's three statuses are the transport-stable partition of it.

| AIN `epistemological_status` | APER `epistemic_status` | Note |
|---|---|---|
| `reported` | `declared` | member's own words |
| `claimed` | `declared` | member asserts as their truth |
| `observed` | `observed` | facilitator witnessed in session |
| `inferred` | `derived` | `derivation_confidence: supported` |
| `provisional` | `derived` | `derivation_confidence: tentative` |
| `NULL` (member-placed atom) | `declared` | keeping is a member act |

**Two hazards this creates, both named rather than resolved:**

1. **Name collision on `observed`.** AIN's `observed` means *a facilitator witnessed this in session*. APER's `observed` means *a recorded occurrence*. They coincide for practitioner atoms but are not the same concept, and the shared spelling will mislead a reader who knows one and not the other. v1 keeps both spellings (renaming a live column is out of scope) and flags the collision here. **Any future third use of the word must be checked against both.**

2. **Five-to-three is lossy and one-directional.** `reported` and `claimed` both project to `declared`; `inferred` and `provisional` both project to `derived`. The distinction is recoverable only via `ain_ref` back into the canonical row. This is intentional under §0.1 — APER carries the transport-stable partition, not the full governed vocabulary — but it means **a projected record is not a substitute for the canonical row, ever.** It is a pointer with enough epistemic character to be safely read.

### 3.6 On `witnessed` as a fourth status — ruled out for v1

Founder ruling, 2026-08-09: `witnessed` is **not** added as a fourth `epistemic_status` unless evidence establishes it as a distinct *source of knowing* rather than a register, stance, or relational quality.

The reasoning holds under inspection: `witnessed` currently exists as a **register** (`member_memory_atoms.registers`), which is a member-placed vantage point, not an epistemic origin. A member can `declare` something that was witnessed; MAIA can record an `observed` event carrying a witnessing register. Those are different axes, and merging them would make the partition incoherent.

**Reopening condition**: if a case appears where witnessing changes *who established the knowing* — not how the record feels or who was present — this ruling is revisited.

---

## 4. The record contract

### 4.1 Universally required

Present on **every** portable record, regardless of kind or destination.

| Field | Type | Meaning |
|---|---|---|
| `aper_version` | integer | Format version. v1 = `1`. |
| `ain_ref` | string | Canonical identity: `ain://<object_kind>/<uuid>`. `object_kind` is the canonical table name. |
| `ain_type` | enum | What kind of thing this is (§5.1). |
| `epistemic_status` | enum | `declared` \| `observed` \| `derived`. |
| `subject` | `ain_ref` | Whose record this is — the ownership axis. Almost always `ain://members/<uuid>`. |
| `about` | `ain_ref[]` | What or whom it concerns. May be empty. Canonical refs only (§8, F7). |
| `content_disposition` | enum | `inline` \| `referenced` (§4.5). |
| `projected_at` | ISO 8601 | When this portable record was produced. |
| `source_updated_at` | ISO 8601 | The canonical object's `updated_at` at projection time. Staleness detection. |

### 4.2 Conditionally required by status

| Status | Additionally required |
|---|---|
| `declared` | `authored_by` {`ref`, `role`}, `authored_at` |
| `observed` | `observed_by` {`ref`, `role`}, `occurred_at`, `observation_method` |
| `derived` | `derived_from` (non-empty `ain_ref[]`), `derivation_method`, `derivation_confidence`, `derived_at` |

A record missing its status-required provenance is **refused at projection**. It is never projected with the field omitted, never projected with a placeholder, and never downgraded to a status whose requirements it happens to satisfy. (§8, F2; §9, A5.)

### 4.3 Conditionally required by consent-bearing kinds

Where the canonical object has a consent axis, the portable record carries it:

| Field | Values | Source |
|---|---|---|
| `visibility` | `private` \| `shared_scoped` \| `public` | derived from the object's consent state |
| `circulation` | `member_pulled` \| `contextual_doorway` \| `ritual_review_opt_in` | mirrors `return_preference` / `surface_preference` |

**Absence is not permission.** A record without `visibility` is treated as `private` by every consumer. Defaults never open.

### 4.4 Member-marked significance

| Field | Type | Rule |
|---|---|---|
| `marked` | string[] | **Member acts only.** v1 vocabulary: `breakthrough`, `still_alive`, `protected`. |

The system never writes to `marked`. An empty array means *no member mark* — it does not mean *unknown*, and it must never be inferred into. This carries forward the atoms migration's own rule (*"The system NEVER auto-assigns…"*) across the transport boundary.

### 4.5 `content_disposition` — the source-bridge preserved

This field exists because of a discipline the audit surfaced and nearly broke.

`member_memory_atoms` is deliberately a **pointer, not a copy**: *"The atom points at the source; the source remains in its native table."* A projection that inlines the source body converts a reference into a duplicate — silently defeating the exact discipline the schema was built to enforce, and creating a second copy outside every consent and deletion mechanism.

Therefore:

- `content_disposition: inline` — the portable record **is** the content. Permitted only when the canonical object owns its content (e.g. a spontaneous keep, where `body` is required).
- `content_disposition: referenced` — the portable record carries title, provenance, and a `source_ref`; the content stays in AIN. The external environment shows *what was kept and why it matters*, not the material itself.

**Projecting a sourced object as `inline` is a spec violation**, not a configuration choice.

### 4.6 Sanctuary has no representation

There is no `consent_scope: sanctuary_excluded` value, and no Sanctuary-related field of any kind.

This is deliberate and corrects a formulation in the audit (§V Step 1), which listed `sanctuary_excluded` as a permitted value. **A value implies projectability.** Sanctuary material is not projected-and-marked-excluded; it has no representation in this format at all. The absence of any Sanctuary vocabulary is the enforcement.

---

## 5. Vocabularies

All vocabularies are **closed**. An unrecognized value is a refusal, never a coercion to the nearest match (§8, F5).

### 5.1 `ain_type` (v1)

`person` · `relationship` · `episode` · `session` · `decision` · `declaration` · `keep` · `commitment` · `practice` · `project` · `work` · `question` · `source` · `map`

**`map` is always `derived`.** An index, a person page, a "recent work" overview — any composite view — is a derivation over other records and must be marked so. A map that reads as declared is the aggregation-smuggling failure (§8, F9).

### 5.2 Roles

`member` · `practitioner` · `maia` · `system` · `external`

Validation: `role: maia` is incompatible with `epistemic_status: declared` (§3.1).

### 5.3 `derivation_confidence`

`tentative` · `supported`

Two values only. Numeric confidence invites false precision and downstream arithmetic on it; both are refused. Neither value grants authority — a `supported` derivation is still a derivation.

### 5.4 `object_kind` in `ain_ref`

The canonical table name (`member_memory_atoms`, `field_people`, `episodic_memories`, …).

This deliberately matches the shape of `provenance_tombstones (object_kind, object_id)`, so a tombstoned object's projections are **identifiable** by the existing deletion substrate. Whether they can be *acted on* is open (§10, Q2).

---

## 6. Reference model

```
aper_version: 1
ain_ref: ain://<object_kind>/<uuid>       ← canonical identity, stable across renames
source_ref: ain://<object_kind>/<uuid>    ← when content_disposition: referenced
subject:   ain://members/<uuid>
about:     [ain://field_people/<uuid>, ain://member_manuscripts/<uuid>]
derived_from: [ain://<...>, ain://<...>]
```

Human-facing links (e.g. wiki-style `[[Name]]`) are a **destination-side rendering concern**, never the identity. Identity is always the `ain_ref`. A destination may render whatever it likes; it may not substitute a display name for an identity (§8, F7).

---

## 7. Invariants

Numbered for citation. Each is stated so it can be mechanically checked.

- **I1 — Provenance completeness.** No record is projected without the provenance its `epistemic_status` requires. Refuse, never degrade.
- **I2 — No authority upgrade.** `epistemic_status` may never increase under projection, traversal, editing, or re-ingestion. `derived` remains `derived` permanently.
- **I3 — Sanctuary absence.** Sanctuary material has no representation in this format.
- **I4 — Traversal yields references.** Traversal never creates canonical AIN memory. Ingestion requires a separate, explicit member act.
- **I5 — Marks are member acts.** `marked` is written only by a member gesture. Never inferred, never system-assigned.
- **I6 — Closed vocabularies.** An unrecognized enum value causes refusal of the record. Never coerced, never passed through.
- **I7 — Tombstone-compatible identity.** `ain_ref` uses the `(object_kind, object_id)` shape of `provenance_tombstones`.
- **I8 — Projection is a member act.** Projection creates a copy AIN cannot recall. It is therefore gated on an explicit member gesture — never on a config flag, never on `autoExport`, never as a side effect of any other operation.
- **I9 — One record, one object.** A portable record projects exactly one canonical object. Composites are `map` records and are always `derived`.
- **I10 — Consent defaults closed.** Missing `visibility` is read as `private`. Missing `circulation` is read as `member_pulled`.
- **I11 — Source-bridge preservation.** A canonical object that references its content projects as `referenced`, never `inline`.

---

## 8. Failure cases

Each is a way the design can fail in practice. Named so they can be tested for.

- **F1 — Authority laundering.** Derived content re-enters as declared via the external environment (§2.3). *The central failure this spec exists to prevent.* Guarded by I2, I4.
- **F2 — Provenance orphan.** `derived_from` points at a record that no longer exists or was tombstoned. The derivation becomes an unsourceable assertion. Guarded by I1; detection at traversal.
- **F3 — Silent staleness.** The canonical object changes; the projection does not. A reader trusts an outdated record as current. Mitigated by `source_updated_at`; **not solved** — no reconciliation mechanism is specified in v1.
- **F4 — Sanctuary leakage.** Sanctuary material reaches a destination by any path. Guarded by I3. **Any occurrence is a stop-work event**, not a bug to schedule.
- **F5 — Vocabulary drift.** An external tool or a human writes `ain_type: note` or `epistemic_status: probably`. Guarded by I6 — refuse the record rather than guess.
- **F6 — Consent bypass by traversal.** A `private` record is traversed into a prompt because traversal did not check `visibility`. Guarded by I10 plus a traversal-side gate mirroring the atoms `return_preference` gate.
- **F7 — Identity collapse.** Two people share a display name; a destination merges them under one page. Guarded by I6/§6 — identity is `ain_ref`, never a name.
- **F8 — Deletion survivorship.** A member deletes canonical memory. `provenance_tombstones` records the refusal. **The projection persists in an environment AIN does not control.** This is real, currently unsolved, and the strongest argument for I8. See §10, Q2.
- **F9 — Aggregation smuggling.** A generated "Person" or "Project" page presents synthesized material with the visual authority of a member's own record. Guarded by I9 + §5.1 (`map` is always `derived`) — but the *rendering* must also carry the status, or the guard is cosmetic.

---

## 9. Acceptance criteria — semantic round-trip

The test of this spec is not that files are produced. It is that **meaning survives the trip**.

### 9.1 The three questions

Given only a projected record — no database access — AIN must be able to answer:

- **A1 — What kind of knowing is this?** `epistemic_status` resolves to exactly one of three values.
- **A2 — Who or what established it?** The status-appropriate provenance resolves to a specific identity and a specific establishing act. *"Someone, somehow"* is a failure.
- **A3 — What authority does it carry?** `epistemic_status` + `visibility` + `circulation` + `marked` compose to a determinate verdict on what MAIA may do with it — assert, reference, surface, or nothing.

If any of the three cannot be answered from the record alone, the projection was lossy and the spec has failed.

### 9.2 Mechanical criteria

- **A4 — Idempotence.** `project(x)` → traverse → `project(x)` yields a byte-identical record except `projected_at`. Instability means the projection is carrying state it should not.
- **A5 — Refusal correctness.** A record missing status-required provenance is refused with a named reason. It is never emitted partially and never silently downgraded to a status it happens to satisfy.
- **A6 — Tombstone recognition.** Given a tombstoned `ain_ref`, traversal recognizes it as tombstoned and refuses to surface it — regardless of what the external record still says.
- **A7 — Negative test (the one that matters).** No sequence of project → traverse → edit → re-ingest can transform a `derived` record into a `declared` one. This must be tested adversarially — *attempt* the laundering, and confirm it fails.
- **A8 — Sanctuary negative test.** No input containing Sanctuary-scoped material produces any output, including an error message that quotes content.

---

## 10. Keeps as first proving case

Keeps (`member_memory_atoms`) are proposed as the first proving case — **not** because the contract is Keep-shaped, but because Keeps already carry nearly every field APER requires, so the projection is close to lossless and requires **no new interpretation**. A proving case that required AIN to invent provenance would prove nothing.

### 10.1 Mapping sketch

| APER field | Keep source | Note |
|---|---|---|
| `ain_ref` | `ain://member_memory_atoms/<id>` | direct |
| `ain_type` | `keep` | direct |
| `epistemic_status` | `declared` | keeping is a member act |
| `authored_by` | `{member_id, role: member}` | direct |
| `authored_at` | `kept_at` | direct |
| `subject` | `ain://members/<member_id>` | direct |
| `content_disposition` | `spontaneous` → `inline`; all others → `referenced` | **I11** |
| `source_ref` | `ain://<source_type table>/<source_id>` | when `referenced` |
| `circulation` | `return_preference` | direct — vocabulary already matches |
| `visibility` | from `status` (`protected` → `private`) | needs a stated mapping |
| `marked` | `is_breakthrough` → `breakthrough`; `status='still_alive'` → `still_alive`; `status='protected'` → `protected` | member acts only |

### 10.2 What does not map, and must not be forced

- **`registers` and `elemental_lenses`** are member-placed *vantage points*, not marks and not categories. They have no APER v1 field. Forcing them into `marked` would misrepresent them; forcing them into a `tags` field would let a destination treat them as system taxonomy. **v1 omits them** rather than distorting them. This is a known, accepted loss — flagged, not hidden.
- **`sacred_protected`** register: an atom carrying it is constrained to `status = 'protected'` and is **not projected in v1**. Non-circulating means non-circulating; a different medium does not change that.
- **`crossing_allowed`** is constrained `FALSE` system-wide. It has no APER representation, because there is nothing yet to represent.

### 10.3 Why this generalizes

The mapping exercise establishes the pattern for every other kind: identify the establishing act → derive the status → require that status's provenance → decide `content_disposition` from whether the object owns its content → carry consent forward → carry member marks forward → **omit rather than distort** anything that does not fit.

Nothing in §4–§9 references Keeps or Obsidian.

---

## 11. Open questions — founder decision required

- **Q1 — Sourced content.** Should a `referenced` record carry any excerpt at all, or title + provenance only? *Recommendation: title + provenance only.* Any excerpt is a copy, and copies escape consent and deletion.
- **Q2 — Deletion survivorship (F8).** No mechanism exists to retract a projection. Options: (a) accept and disclose — projection is permanent, stated plainly at the gesture; (b) destination-side tombstone records, which only work for cooperating destinations; (c) do not project deletable kinds at all. *No recommendation — this is a sovereignty judgment, not an engineering one.*
- **Q3 — `visibility` scope.** Required on all records, or only consent-bearing kinds? *Recommendation: required on all*, defaulting closed, so a future consent axis cannot be added into a gap.
- **Q4 — `about` identity.** Canonical `ain_ref` required at v1, or are name strings permitted for people not yet in `field_people`? *Recommendation: canonical refs only* — permitting strings reintroduces F7 immediately.
- **Q5 — Does APER belong in canon?** It constrains what AIN may do with member memory across every future destination. That is arguably constitutional rather than technical. *No recommendation.*

---

## 12. Non-goals for v1

Named so they are not smuggled in during review:

- Round-trip / external-edit ingestion (§2.4) — format must not foreclose it; nothing more.
- Folder structure, file naming, or destination layout.
- Any Obsidian-specific mechanism (REST plugin, wiki-links, Dataview).
- Retirement of the nine existing exporters (audit §I.F). Retirement follows adoption; it does not precede it.
- `MEMORY.md` reduction. Enabled eventually by traversal; **not authorized** by this document.
- Automatic projection of any kind, on any trigger. See I8.

---

## 13. Claim discipline

Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`:

- **Live**: nothing in this document.
- **Designed**: nothing in this document.
- **Vision**: all of it. APER v1 is a proposal awaiting review.

**Failure test**: if this spec is implemented and a member's external environment accumulates records where MAIA-derived content is indistinguishable from the member's own declarations, the design has failed and must be **withdrawn, not patched**.

---

## 14. Growth-obligation answers

Per `CLAUDE.md`, required for any capability increase.

**What uncertainty does this introduce, and how is it preserved?**
Portability creates copies of memory outside AIN's consent and deletion machinery. The uncertainty preserved is epistemic status itself: `derived` records remain visibly derived, with resolvable inputs, permanently. Where provenance cannot be written, the record is not projected — refusal is the preservation mechanism. Two uncertainties are preserved *unsolved and disclosed* rather than papered over: staleness (F3) and deletion survivorship (F8).

**What provenance and ownership boundaries does this require?**
Every record carries `ain_ref`, `epistemic_status`, status-appropriate provenance, `subject`, and consent state. The member owns the artifact; AIN owns only the projection. Sanctuary has no representation. Sourced content stays referenced, never copied.

**What new responsibility does this capability create?**
Projected records are durable, portable, and **irrevocable from AIN's side** — they outlive MAIA and cannot be recalled. That makes a projection heavier than a database write, which is why I8 gates it on an explicit member act rather than a preference, and why Q2 is a founder decision rather than an implementation detail.

---

## 15. Review outcome (founder, 2026-08-09)

**Step 1 approved as the v1 candidate contract**, subject to the §0.1 envelope amendment.

| Review question | Ruling |
|---|---|
| 1. Three statuses, or add `witnessed`? | **Keep three.** `declared \| observed \| derived` is a coherent epistemic partition. `witnessed` is a register/stance, not a source of knowing. See §3.6. |
| 2. Is the §2 boundary right? | **Keep exactly as drawn.** Traversal yields a typed candidate reference; it does not create canonical memory or increase authority. Monotonic non-escalation of `epistemic_status` under transport stands as the strongest invariant in the spec. |
| 3. Are Q1–Q5 the real open questions? | **F3 and F8 stay explicitly unresolved in v1, and neither blocks Step 2.** |

### 15.1 F3 — staleness

Detection without reconciliation is acceptable and honest for v1. `source_updated_at` detects divergence; v1 claims nothing more.

### 15.2 F8 — deletion survivorship (founder reasoning, recorded)

The eventual sovereignty rule distinguishes **AIN-controlled deletion** from **external-copy survivorship**:

> The member may delete the canonical source and have AIN cease using or re-projecting it, while being clearly told that previously exported copies may survive outside AIN's control. The tombstone preserves the system's refusal to resurrect; it cannot remotely erase sovereign copies.

> *"That is not necessarily a defect in sovereignty; it may be a consequence of giving the member real possession."*

**v1 obligations that follow**: do not promise deletion in environments AIN does not control. Preserve the canonical deletion/refusal boundary (I7, A6). The sovereignty policy — including what the member is told at the projection gesture — is **deferred to separate ruling** and is not settled here.

### 15.3 Preserved without modification

Explicitly carried forward by the ruling: epistemic-status non-escalation under transport (I2) · `role: maia` incompatible with `declared` (§3.1) · provenance requirements by status (§4.2) · source-bridge-not-copy via `content_disposition` (§4.5, I11) · Sanctuary's absence from projectable vocabulary (§4.6, I3) · the adversarial laundering test (A7) · omission rather than distortion for fields that do not map cleanly (§10.2).

---

## 16. Step 2 authorization — scope and stopping condition

**Authorized**: the smallest `projectRecord` path, proving the contract on **Keeps only**.

**Not authorized** (named so they are not drifted into): traversal-to-ingestion · round-trip mutation · sync of any kind · adapter cleanup (audit §I.F) · generalized export to other `ain_type`s · any destination-specific writer · any automatic or scheduled projection.

**The proof must show a Keep projects without losing**: canonical identity · epistemic status · provenance · authorship · source relationship · consent/visibility boundaries · member-marked significance where applicable.

**Stopping condition**: stop after the Keeps projection proof and report **the exact loss surface**, including every field intentionally omitted. Do not proceed to any further step without a separate authorization.
