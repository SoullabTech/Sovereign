# Practitioner Publishing — Production Substrate Verification (Track 1)

**Status: EVIDENCE — read-only measurement.** ⛔ No schema change, no data change, no remediation.

> ⭐⭐⭐ **Track 1 measures the floor. It does not repair the floor.**

⭐⭐⭐ **Headline (founder phrasing, 2026-08-06):**

> **The substrate is deployed, but not yet inhabited by the practitioner-publishing domain.**

⛔ That is a different claim from *"cleanly mapped."* Zero of the four "maps cleanly" rows in the Implementation Map survive contact with production — ⛔ not because the tables are absent, but because the **qualifying domain population is zero**.

---

## 1. Environment and method

| Item | Value |
|---|---|
| Remote host | `minisforum` via `ssh soullab@minisforum` |
| Container | `maia-postgres` (Docker) |
| Database | `maia_consciousness` |
| Deployed app SHA | ⭐ **`b1399f693`** (`docker exec maia-sovereign printenv GIT_COMMIT`) |
| Database timestamp | `2026-08-06 19:12:00.240529+00` |
| Posture | ⭐ **read-only** — every batch wrapped `BEGIN TRANSACTION READ ONLY; … ROLLBACK;` |
| Content inspected | ⛔ **none.** Structural metadata, counts, null rates, referential integrity only |

### ⭐⭐⭐ Method rule earned by this measurement

> **A failed transaction can masquerade as a clean absence unless transaction state is checked.**

⚠️ **What happened:** two queries in batch 3 aborted on `operator is not unique: "char" || unknown` (missing `contype::text` cast). Postgres aborts **every remaining statement** in a failed transaction, so their empty output was **not** a null result — the constraint check and the Lane V search had simply never run. Both were re-run successfully in batch 4, and both returned substantive results.

⛔ **Had this gone unnoticed, the record would have asserted "`relationship_spaces` has no constraints" and "no Lane V substrate exists"** — two false-clean findings, in a lane whose entire purpose is preventing exactly that class of error. ⭐ Any future run of this instrument must capture stderr and verify statement completion, ⛔ never infer absence from empty output alone.

⛔ **Not done, by discipline:** no inserts, no repair, no schema change, no indexes, no migrations. ⭐ Once live evidence exists, migration files are **no longer** treated as evidence of deployed shape.

---

## 2. Results

### 2.1 Row counts — the decisive measurement

| Table | Rows | Note |
|---|---|---|
| `library_sources` | **2228** | ⭐ the only populated table in the set |
| `practitioner_clients` | **13** | the live relationship substrate in practice |
| `practitioners` | **17** | ⚠️ a **separate identity space** from `members` |
| `member_field_note_events` | 3 | the ledger **R1 forbids widening** |
| `relationship_spaces` | ⛔ **0** | the named authority container — **empty** |
| `field_programs` | ⛔ **0** | |
| `field_program_lessons` | ⛔ **0** | |
| `field_program_positions` | ⛔ **0** | the Uptake primitive — **empty** |
| `field_program_revisions` | ⛔ **0** | |
| `practitioner_materials` | ⛔ **0** | ⭐ the legacy duplicate is empty — simplifies its disposition |
| `practitioner_file_shares` | ⛔ **0** | competing referent, unused |
| `practitioner_resources` | ⛔ **0** | competing referent, unused |
| `artifact_shares` | ⛔ **0** | ⭐ *the shape to refuse* exists but is unused |

### 2.2 Identity floor — `practitioner_clients`

```sql
SELECT count(*), count(*) FILTER (WHERE member_id IS NULL), count(DISTINCT practitioner_id) FROM practitioner_clients;
```

| Measure | Value |
|---|---|
| Rows | 13 |
| `member_id` **NULL** | ⛔ **12 of 13** |
| `member_id` populated | ⭐ **1 of 13** |
| Distinct practitioners | 5 |
| `relationship_status` values | `active`, `pending` |
| Orphaned `member_id` → `members` | **0** ✅ |
| Duplicate `(practitioner_id, member_id)` | **0** ✅ |
| UNIQUE constraint on `(practitioner_id, member_id)` | ⛔ **none** — 0 unique constraints on the table |

**Effective foreign keys** (observed, `pg_constraint`):

```
practitioner_clients.practitioner_id  ->  practitioners     ⚠️  NOT members
practitioner_clients.member_id        ->  members           (nullable)
relationship_spaces.steward_member_id ->  members
relationship_spaces.participant_member_id -> members
relationship_spaces.practitioner_client_id -> practitioner_clients
field_program_positions.member_id     ->  members
library_sources.practitioner_member_id -> members
library_sources.ratified_by           ->  members
library_sources.vault_file_id         ->  practitioner_files
```

⭐ **The bridge exists but is two hops.** `practitioners.member_id` is populated **17 of 17** — so a practitioner *can* be resolved to a member via `practitioner_clients.practitioner_id → practitioners.id → practitioners.member_id`. ⛔ The **client** side does not resolve: 12 of 13 relationships cannot name the member at all.

### 2.3 Work — `library_sources`

| Measure | Value |
|---|---|
| Total rows | 2228 |
| `review_status` distribution | ⛔ **`uploaded` = 2228. Nothing else.** |
| `practitioner_member_id` populated | ⛔ **0** |
| `ratified_by` populated | ⛔ **0** |

⭐⭐⭐ **Zero Works are ratified and zero are practitioner-scoped.** The Ontology's composability gate — *a Work is available to Arrangement, Placement, and MAIA only when `ratified`* — means the count of Works currently eligible for Placement is **zero**. The lifecycle `uploaded → processed → reviewed → ratified → archived` exists as a column; ⛔ **only its first value is in use.**

### 2.4 Commitment — `relationship_spaces`

Constraints are **well-formed and match the migration**:

```
p  relationship_spaces_pkey                  PRIMARY KEY (id)
u  relationship_spaces_invite_token_key      UNIQUE (invite_token)
c  relationship_spaces_no_self               CHECK (steward_member_id <> participant_member_id)
c  ..._status_check          status ∈ invited|active|paused|archived
c  ..._consent_status_check  consent_status ∈ pending|accepted|declined|withdrawn
c  ..._relationship_type_check  ∈ practitioner_client|teacher_student|c…
c  ..._created_from_check    ∈ booking|invite|manual
c  ..._invitation_mode_check ∈ automatic|practitioner_approval|manual
```

⭐ The shape is exactly what Permissions §1 described — ⛔ **and it holds 0 rows.** `participant_member_id` is nullable, and `practitioner_client_id` points back at `practitioner_clients`, which is where the 13 live relationships actually are.

### 2.5 Member-visibility Withdrawal — Lane V

⚠️ **Lane V is not a table.** `20260730000002_practitioner_visibility_withdrawn_event.sql` **widens a CHECK constraint** on an existing ledger:

```sql
ALTER TABLE member_field_note_events
  ADD CONSTRAINT member_field_note_events_event_type_check
  CHECK (event_type IN ('proposed','kept','revised','split','discarded',
                        'created','consent_changed','released',
                        'practitioner_visibility_withdrawn'));
```

⭐ Verified live: the constraint is deployed and carries `practitioner_visibility_withdrawn`. Table holds **3 rows total** (all event types combined).

---

## 3. Classification per concept

| Concept | Verdict | Basis |
|---|---|---|
| **Work** | ⛔ **present but ineligible for Placement** | table live with 2228 rows, but **0 ratified, 0 practitioner-scoped**. ⭐ The lifecycle substrate exists; the **qualifying domain population is zero** |
| **Arrangement** | ⛔ **missing in practice** | all three tables deployed, **0 rows**. `field_program_lessons` FKs are on **slugs** (`field_slug`, `program_slug`), and `material_ids` still carries no FK |
| **Commitment** | ⚠️ **ambiguous — competing referents** | `relationship_spaces` is correctly shaped and **empty**; `practitioner_clients` holds the 13 live relationships. Two live representations of one concept, and the authoritative one is unused |
| **Member-visibility Withdrawal** | ⚠️ **different-but-sufficient, with a conflict** | works as an `event_type`, not a table — ⛔ but it lives in `member_field_note_events`, the ledger **R1 forbids widening** for publishing acts |
| **Uptake** | ⛔ **missing in practice** | `field_program_positions` deployed, `member_id → members` FK present, **0 rows**. The `stated_by` attribution primitive has never been exercised |
| **Practitioner Withdrawal** | ⛔ **missing** | no de-ratification possible from a corpus where nothing is ratified. `work_deratified` has no reachable precondition |
| **Identity link (practitioner ⇄ client ⇄ member)** | 🔴 **identity substrate present; operational identity linkage insufficient** | practitioner side resolves (17/17 via `practitioners.member_id`); ⛔ **client side resolves in 1 of 13**. Two-hop path. No UNIQUE on `(practitioner_id, member_id)` |

⭐ **The schema can express a governed person; production mostly does not.** ⛔ Placement design may not assume that an existing practitioner-client relationship names a member.

---

## 4. Corrections to the Implementation Map

⛔ **The map's verdict table is superseded by this measurement.**

| Map claimed | Production shows |
|---|---|
| ✅ 4 map cleanly — Work · Arrangement · Commitment · member-visibility Withdrawal | ⛔ **0 map cleanly.** 1 different-but-sufficient (with a ledger conflict), 2 missing in practice, 1 ambiguous, 1 insufficient |
| ⚠️ 2 right-shape-wrong-scope — Uptake · practitioner Withdrawal | ⛔ **Both are right-shape-and-unexercised.** Zero rows is weaker than "narrower case" |
| 🔴 5 blocked | ⭐ **6 blocked** — the identity link joins them, and it **gates Placement absolutely** |
| Substrate column = "✅ exists" | ⚠️ Must read **"deployed, unpopulated"** — a materially different claim |

⭐ **The map was not wrong about shape. It was wrong to treat deployment as availability.** Every table it cited does exist, with the columns and constraints it described. ⛔ What it could not know from migration files is that the practitioner-publishing substrate is **structurally present and operationally unused**.

⚠️ **New finding not in any prior document:** `artifact_shares`, `practitioner_file_shares`, and `practitioner_resources` are all deployed and all empty — **three dormant competing referents** for Placement. ⭐ Their emptiness is the opportunity: ⛔ no migration path or reconciliation is owed to data that does not exist.

---

## 5. Consequences for Track 3

⛔ **Track 3 remains blocked.** ⭐ The diagnosis is now four named questions rather than a generic *"Placement is missing"*:

| # | Blocker | Statement |
|---|---|---|
| **1** | **Identity linkage** | Existing practitioner-client rows **mostly do not resolve to governed members** — 12 of 13 |
| **2** | **Commitment authority** | `practitioner_clients` and `relationship_spaces` are **competing referents with different levels of live use** |
| **3** | **Eligible Work corpus** | ⛔ **No practitioner-authored, ratified Work currently exists** |
| **4** | **Publishing event home** | The visibility-withdrawal precedent lives in a ledger the publishing rulings **prohibit widening** (R1) |

⭐⭐⭐ **The sharpened consequence:** *a Placement table built today would have **no reliably governed subject**, **no settled commitment**, **no eligible content**, and **no settled event home**.*

⚠️ Blocker 1 fails the founder's own stated gate verbatim: *"If the live identity cannot reliably name the member in a commitment, Placement design remains blocked regardless of the rest."*

### ⚠️ Correction — the empty-table opportunity, precisely stated

An earlier draft framed zero rows as making these decisions *cheap*. **Founder correction, and it holds:**

> Empty tables **do not make the decisions cheap in the constitutional sense.** They make them **cheap to implement once ruled.**

⛔ **Choosing the wrong empty table is still choosing the wrong constitutional object** — it merely produces less immediate data damage. ⭐ This bears hardest on **blocker 2**: `relationship_spaces` vs. `practitioner_clients` is a **jurisdiction ruling about which object is the authoritative shared developmental commitment**, and its emptiness reduces cleanup cost, ⛔ not the weight of getting it right.

**Track 2 (governance) is unaffected and may proceed** — attestation-content erasure and the custodial-mandate instrument depend on none of this.

⛔ This document authorizes nothing, repairs nothing, and lifts no block.

---

## 6. Lane state — ⭐ read this before opening any artifact in this lane

⭐⭐⭐ **Three layers, three different kinds of completion** (founder, 2026-08-06). ⛔ They are not stages of one progress bar:

| Layer | State |
|---|---|
| **Conceptual** | ✅ **Coherent.** The model hangs together without internal contradiction — subject to the two unratified canon nominations |
| **Empirical** | ✅ **Measured.** The production substrate has been *observed rather than assumed*, and several repository-derived assumptions were corrected by measurement |
| **Governance** | ⭐ **Intentionally incomplete.** The remaining blockers are ⛔ **no longer design ambiguities** — they are explicit constitutional decisions |

### ⭐⭐⭐ The lane invariant

> **No further conceptual elaboration is warranted until governance resolves the remaining constitutional questions.**

⭐ This is stronger than *"stop modeling"* because it supplies a **criterion**, not a mood:

| Condition | Response |
|---|---|
| a governance ruling **exposes a contradiction** | ✅ return to the model |
| otherwise | ⭐ **the model stands** |

⚠️ **Status: stable handoff, ⛔ not an intermediate draft.** Not because everything is solved — because the remaining work has **changed character**: from *"what is the right model?"* to *"the model is coherent; which constitutional decisions permit implementation?"*

### ⛔ What the next session should NOT do

1. ⛔ **Do not refine the ontology.** It is coherent. Further conceptual work here produces **parallel vocabulary, not missing structure**. Wait for a ruling.
2. ⛔ **Do not read "6 blocked, 0 clean" as regression.** ⭐ *Moving an unknown into a specifically blocked state is progress* — a design effort often appears to stall precisely when it has become honest. **Four named blockers is a stronger state than dozens of implicit assumptions.**
3. ⛔ **Do not settle a governance blocker by choosing a table.** Blockers 2 and 4 are constitutional; blocker 1 is operational adoption; blocker 3 is product lifecycle. ⭐ The *kind* determines the *owner*.
4. ⛔ **Do not treat migration files as measurements** once this record exists.

### The lane's four phases, completed

**Discovery** → **Reconciliation** → **Measurement** → **Governance**.

⭐ Phase 4 is **not more modeling.** It is deciding **which constitutional commitments the implementation is allowed to embody.** ⛔ Additional conceptual artifacts are unwarranted unless a governance ruling exposes a genuine contradiction.
