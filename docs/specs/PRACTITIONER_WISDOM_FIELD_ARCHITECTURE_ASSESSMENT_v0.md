# Practitioner Wisdom Field — Architecture Assessment v0

**Companion to:** `PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` (principles).
This document is the **evidence + gap** half: what exists, what is missing, what is assumed.

**Status:** assessment only. ⛔ No build, migration, or ingestion authorized.
**Date:** 2026-08-03 · **Branch:** `fix/practice-field-corpus-authority-gate` · **Anchor commit:** `c327dd526`

---

## Evidence flags

Every claim below carries one:

| Flag | Meaning |
|---|---|
| **[O]** observed | I read the file, migration, or symbol this session. Cited by path\:line. |
| **[I]** inferred | Derived from a name, a neighbouring file, or a prior ruling — **not read this session**. |
| **[C]** candidate | A design proposal. Nothing authorizes it. |
| **[V]** requires practitioner validation | Cannot be settled by inspection or by us. Needs a real practitioner. |

⚠️ Nothing marked **[I]** may be cited as architecture. Several **[I]** items below are high-value and should be promoted to **[O]** by reading before any design is finalized — §6 lists them.

---

## 1. Current architecture assessment

### 1.1 The composition boundary — the most important thing that exists

**[O]** There is exactly one place where practitioner meaning becomes available to MAIA in a room: `lib/maia/roomComposition.ts`. It imports both composition paths.

| Path | Entry | Call sites |
|---|---|---|
| Field identity + corpus | `formatFieldContextForRoom` | `roomComposition.ts:119`, `:130` |
| Program lessons | `composeLessonContext` | `roomComposition.ts:266` |

**[O]** The corpus gate is real and absolute:

```
lib/practiceField/practiceFieldService.ts:262
  export function corpusIsComposable(_field: PracticeField): boolean
```

The parameter is `_field` — **the function ignores its input entirely and returns `false`**. Two call sites consume it: `:268` (render) and `:420` (context build). `lib/practiceField/__tests__/corpusAuthorityGate.test.ts` asserts `false` for `live` and for every other status.

⭐ **This is a well-formed control**: one predicate, both boundaries, characterized by test. When the authority model arrives, `corpusIsComposable` is the single seam it plugs into. **Do not route around it.**

### 1.2 `practice_fields` — the identity layer

**[O]** Columns (`database/migrations/20260701000001_practice_fields.sql`):

```
practitioner_member_id · welcome_message · welcome_video_url
about_practice · how_we_work_together · how_maia_supports
professional_practice · orientation_style · resources (JSONB)
active_field_content (TEXT) · active_field_updated_at
status · status_reason · created_at · updated_at
```

**[O]** **Zero provenance columns.** No `authored_by`, `rights_status`, `license`, `attribution`, `source_relationship`, or `provenance_class` anywhere in this table.

**[O]** The first four text fields are **self-descriptive** — a practitioner describing their own practice, relationship, and MAIA's role. This is why identity kept composing when the corpus channel closed: the practitioner is the author *and* the subject.

**[O]** `active_field_content` is a bare `TEXT` column sitting in the same table with no structural distinction from the self-descriptive fields. **That adjacency is the design defect** — it let 63,861 chars of third-party-derived material inherit the trust posture of a self-description.

### 1.3 Custody spine — deployed and sound

- **[O]** `practice_field_revisions` (`practice_field_id`, `layers` JSONB, `saved_by`) — append-only revision history.
- **[O]** `practice_field_snapshots` — per-`relationship_space` frozen copy with `field_status` and `snapshotted_at`.
- **[O]** ⚠️ **Snapshots carry the identity fields but NOT `active_field_content`.** Observed from the column list. **[I]** The likely reason is that snapshots predate the corpus column. Either way it means corpus material was *never* space-scoped — it composed globally per slug. Consistent with the incident.
- **[O]** `getAuthoredField(memberId)` (`programAuthoringService.ts:117`) takes **no field parameter** — a practitioner can only ever reach their own field. Documented in the file header at `:19`.

### 1.4 `library_sources` — the vault

**[O]** `database/migrations/20260130000001_library_intelligence.sql:7`:

```
type CHECK (txt|book|transcript|article|manual|teaching)
title · author · file_path · checksum (SHA256) · meta JSONB
ingestion_status · ingestion_error · token_count_total · chunk_count
consent_required · consent_granted · consent_granted_at · consent_granted_by
```

Three findings:

1. **[O]** ✅ **A consent axis already exists** (`consent_required` / `consent_granted` / `_at` / `_by`), built for *"user journals — never ingest without explicit consent."* This is a **real, reusable precedent** for the permission model. It is the closest existing thing to §7 of the product definition.
2. **[O]** ❌ **`author` exists but there is no rights axis** — no `license`, `rights_status`, `provenance_class`, or `source_relationship`. Consent-to-ingest ≠ authority-to-compose.
3. **[O]** `meta JSONB` is documented as `{folder, tags[], date, tradition, lineage, ...}`. **`lineage` already appears as an intended concept** — untyped, unenforced, in a free JSONB bag. **[C]** This is where a lineage pointer *could* be formalized rather than invented.

**[I]** (prior ruling, not re-verified this session) `composeLessonContext` selects `title, type, description` and **drops `author`** — so vault material composes with zero attribution vocabulary.

### 1.5 Program authoring — the ratification lifecycle

**[O]** `lib/practiceField/programAuthoringService.ts`:

```
ReviewStatus = 'uploaded' | 'processed' | 'reviewed' | 'ratified' | 'archived'
ProgramKind  = 'coaching' | 'training' | 'workshop' | 'course' | 'retreat'
AuthoredField · Material · Lesson · AuthoredProgram
```

⚠️ **`ratified` here is an editorial trust state, not a rights state.** It answers *"has someone looked at this?"* — never *"does the practitioner have the right to let MAIA compose it, and under what relationship to its source?"* Reusing this enum as the authority gate would be the exact class of error already rejected for `status` and revision history.

⚠️ **[O]** `ProgramKind` is a **fixed 5-value CHECK-style union**. It presumes a delivery vocabulary (`coaching|training|workshop|course|retreat`) that fits a coach and fits a spiritual director poorly. **This is the first concrete instance of the ontology-imposition risk the brief warns about, and it is already in the code.**

### 1.6 ⭐ The developmental substrate already exists — scattered and ungoverned

This is the most consequential finding for the developmental reframe. **Layer 2 is not missing. It is present, fragmented, and outside the authority model.**

**[O]** Tables (names + presence verified; **[I]** semantics not read this session):

| Table | Migration | Layer-2 relevance |
|---|---|---|
| `practitioner_growth` | `20260110000001` | practitioner's own development **[I]** |
| `practice_insights`, `session_insights` | `20260110000003/5/6` | pattern recognition **[I]** |
| `practitioner_insight_preferences` | `20260110000001` | how they want to be shown things **[I]** |
| `world_experiments`, `practice_worlds`, `practitioner_worlds` | `20260110000002` | the experiment loop **[I]** |
| `modality_vocabulary` | `20260110000001` | ⭐ **proto Language Field** **[I]** |
| `library_distillates` | `20260130000001` | derived artifacts **[I]** |
| `prompt_library`, `prompt_library_items` | `20260402000005` | their questions **[I]** |
| `vault_symbols`, `vault_symbol_links` | `20260108000001` | their distinctions **[I]** |

**[O]** Routes: `/api/studio/practitioner-observations`, `/api/studio/changes/[id]/experiments`, `/api/studio/field/{capture,attention,pulse,notes}`, `/api/studio/daily-log`, `/api/studio/changes/[id]/interpret`.

**[O]** `database/migrations/20260624000001_practitioner_observation_provenance.sql` — **a provenance migration for practitioner observations already exists.** **[I]** Contents unread. ⭐ **This is the single highest-value read before any design work**: it may already contain a provenance vocabulary that the Wisdom Field should extend rather than duplicate.

**[O]** `/studio` has ~40 surfaces, including `materials`, `programs`, `fields`, `field`, `maia-guidance`, `changes`, `decisions`, `encounters`, `case-studies`, `environment`, `review`, `scribe`.

⭐⭐⭐ **Assessment:** the platform did not fail to build a developmental environment. It built one **without a promotion boundary**. There is no line in the system today between *"a practitioner wrote this while thinking"* and *"a practitioner authored this as their teaching."* §5 of the product definition is therefore not a new feature — **it is the missing boundary through existing substrate.**

### 1.7 `lib/practitioner/` is a different concern

**[O]** `tierPricing · stripeConnect · slidingScale · integrations · sessionPrep · systemPromptBuilder · features · auth · trustedColleagues · clientSubscription`.

This is the **practice-as-business** layer, not the wisdom layer. ⚠️ Do not let Wisdom Field work land here — the naming collision (`lib/practitioner/` vs `lib/practiceField/`) is an existing trap. **[O]** `lib/practitioner/features.ts` **[I]** may already be a toggle registry; if so, capability toggles extend it rather than introducing a second one.

---

## 2. Capability model

**[C]** throughout. The split is: *what the platform guarantees* vs *what the practitioner configures*.

### 2.1 Platform-guaranteed (never configurable)

| Capability | State |
|---|---|
| Field-scoped custody (`getAuthoredField`) | **[O]** built |
| Append-only revisions | **[O]** built |
| Immutable vault originals + checksum | **[O]** built |
| Single composition boundary (`roomComposition.ts`) | **[O]** built |
| Corpus gate (`corpusIsComposable`) | **[O]** built, closed |
| Non-impersonation fence | **[I]** built (`practiceFieldService.ts:239`, prior ruling) |
| **Provenance: class × source-relationship** | ❌ **absent** |
| **Layer-promotion authority** | ❌ **absent** |
| **Attribution in composed context** | ❌ **absent** |
| **Composition trace** | ❌ **absent** |

### 2.2 Practitioner-configurable

**[C]** Vocabulary · framework names · practice structure · which modules are active · pace · what stays private.

### 2.3 Toggle candidates

**[C][V]** `Wisdom Commons access · Development Field · Evolution Journal · Practice Laboratory · Reflection Prompts · Client Commitments · Session Continuity · Assessments · Community · Courses · Certification · Publishing · Research Integration`

⚠️ Per *promote on observed use*: **this list is a sketch.** No item becomes a built abstraction on an imagined second practitioner — only an observed one. The toggle **mechanism** is the design target; the list is not.

---

## 3. Proposed domain model

**[C]** — proposal only.

### 3.1 The governed unit

```
FieldContribution
  ├── origin
  │     ├── practitioner_id            [O] getAuthoredField pattern exists
  │     ├── field_id
  │     ├── channel                    identity | corpus | vault | lesson | reflection | …
  │     └── layer                      1 commons | 2 development | 3 wisdom
  ├── authority
  │     ├── provenance_class           A|B|C|D|E|F  (default F)
  │     ├── source_relationship        (default `unknown` → blocks composition)
  │     └── referent_id                REQUIRED when relationship names a source
  ├── permission                       never | development_only | context_only |
  │                                    attributed_reference | composable | member_visible
  └── composition_trace                what composed, when, into which room
```

⭐ **The invariant to preserve:** the substrate may change; the authority relationship may not. Bind the *moment*, not the table.

### 3.2 Two design decisions worth stating

**[C] Separate `active_field_content` out of `practice_fields`.** Its adjacency to the self-descriptive fields is the structural cause of the incident. Self-description and imported meaning are different authority classes and should not be columns in the same row.

**[C] `referent_id` is a foreign key, not a string.** *A relationship claim with no verifiable referent is the mechanism by which a translation layer acquires source authority.* A `TEXT` field saying "derived from Larry's program documents" is exactly what failed. Make the claim unrepresentable without a resolvable target.

### 3.3 Vocabulary

**[V]** `ProgramKind`'s five values **[O]** are a coach-shaped ontology already in the code. Whether a practitioner-supplied vocabulary replaces it, or it becomes a display hint over a free structure, is **not answerable by inspection**. It needs practitioners — plural, from different modalities.

---

## 4. Candidate workflows

**[C]** all — sequence sketches, not specs.

**W1 · Acquisition** — practitioner adds a source → declares class + relationship + referent → **default `unknown` blocks composition** → sits in Layer 1 or 2 as a pointer.

**W2 · Development loop** — idea → experiment → session → reflection → refinement. Everything `still exploring`, `development_only`, invisible to members. **[O]** substrate largely exists (§1.6); **the boundary does not.**

**W3 · Promotion (the governed act)** — practitioner reviews a Layer 2 item → explicitly declares it theirs → system records *from what, when, by whom* → lineage pointers **persist permanently** → item becomes Layer 3 and composable.
⛔ Never accumulative, never time-based, never MAIA-inferred. MAIA may show what sits unclaimed; it may **not** say it is ready.

**W4 · Composition** — room resolves field → contributions filtered by permission → **attribution rendered inline** → trace written.

**W5 · Synthetic validation** — fictional practitioner, invented corpus, deliberate attempts to smuggle Layer 1 text into Layer 3. **The gate must be proven against material no one is invested in, before Larry.**

---

## 5. Gaps

Ordered by *what blocks what*.

| # | Gap | Evidence | Blocks |
|---|---|---|---|
| **G1** | No provenance axes anywhere | **[O]** §1.2, §1.4 | everything |
| **G2** | No referent resolution — claims are unverifiable strings | **[O]** incident | G1 meaningless without it |
| **G3** | No layer boundary; Layer 2 substrate exists ungoverned | **[O]** §1.6 | the whole developmental model |
| **G4** | No promotion act; nothing distinguishes thinking from teaching | **[O]** §1.6 | W3, Larry as first learner |
| **G5** | No attribution in composed context | **[I]** `composeLessonContext` drops `author` | unattributed absorption |
| **G6** | No composition trace — cannot answer *"what did MAIA say from whose material?"* | **[O]** no such table | all audit + all incident response |
| **G7** | Corpus channel closed with no reopening path | **[O]** `corpusIsComposable` | any real practitioner corpus |
| **G8** | Wisdom Commons has no substrate; must be pointer-based for rights reasons | **[O]** no table; **[I]** rights ruling | Layer 1 entirely |
| **G9** | Fixed `ProgramKind` imposes a coach ontology | **[O]** §1.5 | non-coach practitioners |
| **G10** | Language Field unruled — voice absorbed from Class B/C is uncovered by any instrument | **[I]** prior ruling | §6.6 of the definition |
| **G11** | Client-derived input has no consent instrument | **[C]** | "client experiences" as a learning input |
| **G12** | Snapshots don't carry corpus → corpus was never space-scoped | **[O]** §1.3 | scoping model |

### The one-line summary

> **The custody spine is sound, the developmental substrate is already built, and the authority layer that would connect them does not exist.** The corpus gate is currently doing that job by refusing everything — which is correct, and is not a design.

---

## 6. Reads required before design is finalized

Promote **[I]** → **[O]**. In priority order:

1. `database/migrations/20260624000001_practitioner_observation_provenance.sql` — ⭐ may already define a provenance vocabulary to extend rather than duplicate.
2. `lib/practiceField/programAuthoringService.ts:482` `composeLessonContext` — confirm the attribution drop (G5).
3. `lib/practiceField/practiceFieldService.ts:239` — the non-impersonation fence, verbatim.
4. `20260110000001_practice_sessions.sql` — `practitioner_growth`, `modality_vocabulary`, `practitioner_insight_preferences` semantics (G3).
5. `lib/practitioner/features.ts` — is there already a toggle registry? (§1.7)
6. `20260714000001_practitioner_program_platform.sql` — the most recent platform-shaped migration; unread.

---

## 7. Standing constraints (do not relitigate)

- ⛔ No build, migration, or ingestion authorized by this document.
- ⛔ Larry's materials agreement is **unsigned**; Attachment A is **empty**. §1: *"if it's not on the list, it's not in the system."*
- ⛔ Do not reopen `corpusIsComposable` before steps 1–5 of the definition's §8 sequencing.
- ⛔ Do not define Larry's framework categories. **[V]** Those are his to name.
- ⛔ Do not gate on readiness `status` or on revision history — both explicitly rejected in `c327dd526`.
- ⛔ Third-party text is not licensable by the practitioner. **The lineage signal is; the text is not.**
- 🔴 Still live in production and unaddressed: the five-domain language in `about_practice`. **[V]** Only Larry can answer it.

---

## 8. The honest position

**[O]** The system can today: hold a practitioner's self-description, keep custody of their materials, and refuse to compose anything it cannot vouch for.

**[O]** The system cannot today: distinguish what a practitioner *learned* from what a practitioner *authored* — at any layer, in any table, at any boundary.

**That single missing distinction is the product.** Everything else is substrate that already exists.
