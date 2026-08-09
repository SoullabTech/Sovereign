# Practitioner Publishing — Implementation Reconciliation (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route.

**The test applied** (founder, 2026-08-06):

> **Can every constitutional concept be mapped onto the existing substrate without inventing hidden
> assumptions?**

**Answer: no — three assumptions do not hold, and one of them is severe.** The model is coherent;
the substrate underneath three of its load-bearing concepts is not what the design assumed.

⭐ This document tests the design against reality. It does not extend the theory.

> ✅ **MEASURED 2026-08-06T19:11Z against production** (`minisforum` / `maia_consciousness`, app
> `b1399f693`), read-only and rolled back →
> [`…PRODUCTION_MEASUREMENT_2026-08-06.md`](PRACTITIONER_PUBLISHING_PRODUCTION_MEASUREMENT_2026-08-06.md).
>
> ⭐ **§3.1 below was wrong about the schema and is superseded by the measurement.** Production holds
> **one** governed `practitioner_clients` table (48 columns, `member_id` present, FK to `members`,
> three coherence CHECKs), ⛔ not three competing definitions. **The severity moved rather than
> disappeared:** only **1 of 13 rows** carries `member_id`. Identity is unpopulated, not undefined.
>
> §3.2 (per-subject erasure) and §3.3 (Work versioning) are **confirmed** by measurement. §4.2 is
> **resolved** — `practitioner_client` is a valid `relationship_type`. The reasoning below is
> preserved unedited; the measurement is the operative record.
>
> ⚠️⚠️ **Interpretation amended 2026-08-09 — Ruling 1 §2/§2.1.** ⭐ *"Identity is unpopulated, not
> undefined"* remains **accurate as measurement**. ⛔ But it must **not** be read as *"populate it and
> the commitment follows."* `practitioner_clients` population or member association ⛔ **does not
> establish the constitutional commitment**, and backfilling one from it is **prohibited**. ⭐ Linkage
> resolves **identity reference** only.

**[O]** = observed in the repository 2026-08-06 · **[I]** = inferred · ⚠️ = requires production
verification.

---

## 0. The three-layer frame (founder, 2026-08-06)

| Layer | Documents | Question | Reconciliation verdict |
|---|---|---|---|
| **Constitutional** | Ontology · Permissions | what may exist, who may act | ⚠️ **two hidden assumptions** |
| **Historical** | Events · Event Specification | what becomes true | ⚠️ **one severe hidden assumption** |
| **Representational** | Rendering Conformance | how truth may appear | ✅ **clean** — no substrate dependency beyond the row |

⭐ The representational layer reconciles cleanly *because* it was specified as a pure function of the
row. Purity bought substrate independence — an unplanned dividend worth noticing.

---

## 1. Verdict summary

| Constitutional concept | Substrate | Verdict |
|---|---|---|
| **Work** | `library_sources` + practitioner scoping + ratification lifecycle | ✅ exists |
| **Work versioning** | — | 🔴 **absent** (§3.3) |
| **Arrangement** | `field_programs` · `field_program_lessons` · `field_program_revisions` | ✅ exists, already versioned |
| **Placement** | — | 🟡 must be built (known since Session 1) |
| **Uptake** | `field_program_positions.stated_by` pattern | ✅ pattern exists; needs generalizing beyond position |
| **Attestation** | `stated_by='practitioner_seeded'` shape | ✅ shape exists |
| **Authorship authority** | `library_sources.ratified_by`, `authored_by` | ✅ exists |
| **Relationship authority** | `relationship_spaces` (`status` + `consent_status`) | ✅ exists |
| **Declaration authority** | `member_confirmed_at` | ✅ exists |
| **Ratification authority** | `review_status` + `ratified_by` | ✅ exists |
| **Custodial authority** | — | 🔴 **absent** — no mandate instrument (canon source 5) |
| **Delegation grant** | — | 🔴 absent — already ruled to mean delegated acts cannot be written |
| **The addressed person** | `practitioner_clients` | 🔴 **SEVERE — §3.1** |
| **Publishing event ledger** | — | 🟡 must be built (R1) |
| **Crypto-erasure / tombstones** | `lib/security/phiEncryption.ts` | 🔴 **SEVERE — §3.2** |
| **Cohort** | — | 🟡 absent, known |
| **Occasion (encounter)** | `sessions` · `encounters` · `living_encounters` | 🟡 **three candidates** (§4.1) |
| **Rendering** | — | 🟡 must be built; no substrate dependency |

---

## 2. What reconciles cleanly

Worth stating, because the failures below are not evenly distributed:

- **The four party-authority sources all have real substrate.** Authorship, relationship,
  declaration, and ratification each resolve to columns that exist and already carry the semantics
  the Permissions document assumed. ⭐ The authority model was not invented on top of the schema; it
  was read out of it.
- **`relationship_spaces` carries both gates** Placement needs — `status='active'` **and**
  `consent_status='accepted'` — as separate columns. The write-time refusal list (§4.2 of the Event
  Specification) is checkable today.
- **Append-only versioning has a working precedent** in `field_program_revisions`.
- **The rendering layer has no substrate dependency at all.**

## 3. The hidden assumptions

### 3.1 🔴 SEVERE — `practitioner_clients` is defined three times, incompatibly

**[O]** Three migrations each declare `CREATE TABLE IF NOT EXISTS practitioner_clients`:

| Migration | `practitioner_id` FK | `member_id`? | `status` vocabulary |
|---|---|---|---|
| `20260114000001_practitioner_themes` | → `practitioners(id)` | ✅ **yes** (`REFERENCES members(id) ON DELETE SET NULL`) | + `completed` |
| `20260116000001_practitioner_portal` | → `practitioners(id)` | ⛔ **no** | no `completed` |
| `20260118_stellium_practitioner_layer` | ⭐ → **`members(id)`** | (different shape again) | — |

**[I]** `IF NOT EXISTS` means **the first migration to run wins and the other two silently no-op.**
Therefore:

> ⚠️ **Whether the table linking a practitioner to a person even *has* a `member_id` column is
> determined by migration order, not by design. And `practitioner_id` points at two different
> entities depending on which definition landed.**

**Why this is severe for publishing specifically.** Every act in the model is addressed to a
*person*: `placed` needs a member, `taken_up` is authored by a member, visibility is per-party, and
`declaration:<member_id>:self` is an authority instance. If `practitioner_clients` has no
`member_id`, then **a client is an email address, not a person** — and there is no identity for a
Placement to be addressed to, no subject for an Uptake, and no `{party}` for a rendering.

⭐ Note the shape of the failure: this is the **same duplication class** already found with
`practitioner_materials` vs `library_sources` and with the eight role vocabularies. Three
independent instances is a pattern, not three accidents.

**Resolvable only in production**, before any further design:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'practitioner_clients' ORDER BY ordinal_position;
```

### 3.2 🔴 SEVERE — crypto-erasure is not possible per member

The Event Specification §7 rests on: *"erasure destroys the key; the row persists as a tombstone."*

**[O]** `lib/security/phiEncryption.ts` derives keys from **environment variables** —
`PHI_ENCRYPTION_KEY` with `PHI_ENCRYPTION_KEY_ID` (default `'k1'`), plus rotation keys matching
`PHI_ENCRYPTION_KEY_<id>`. `getKeyById(keyId)` reads a **process-global** key cache.

> ⭐ **Keys are global, not per-subject. Destroying `k1` erases every record encrypted under `k1` —
> every member's, every practitioner's.** There is no key that belongs to one person, so there is no
> key whose destruction erases one person's content.

⛔ The erasure mechanism as specified **cannot be implemented on this substrate.** What exists is
key *rotation* infrastructure, which is a different capability: rotation preserves plaintext under a
new key; erasure requires destroying access to plaintext for exactly one subject.

**What would close it** — a per-subject key-wrapping layer: a data key per member, itself wrapped by
the global key; erasure destroys the wrapped data key. ⛔ Not designed here, and ⚠️ it interacts with
the rotation logic already in `phiEncryption.ts` (`needsRotation` compares `blob.kid` to the current
key id — per-subject kids would change that comparison's meaning).

**Consequence for sequencing:** ⛔ **the erasure section of the Event Specification is not
implementable as written.** Either the key layer is built first, or §7 must be re-specified against
what the substrate can actually do. ⭐ It should not be quietly implemented as row deletion — that is
precisely the tombstone-purity violation the founder just closed.

### 3.3 🟡 Work versioning does not exist

**[O]** `library_sources` has no `version`, `supersedes`, `parent_id`, or `replaces` column. The only
append-only version history in the practitioner substrate is `field_program_revisions`, which
versions **Arrangements**, not Works.

The Event Specification's `object_version` and its rule — *"existing placements keep pointing at the
version that was placed"* — has **nothing to point at for Works.** ⛔ This is not a gap to paper
over: without it, revising a Work silently changes what every prior member received, which is the
exact failure §6 of the specification was written to prevent.

⚠️ This is also open question #1 from the ratified Plan Record (general Field Object versioning) —
so it is a **governance dependency**, not just an engineering one.

## 4. Smaller ambiguities

### 4.1 The occasion has three candidate tables
**[O]** `sessions`, `encounters`, and `living_encounters` all exist. Placement's *occasioned by*
needs exactly one. ⛔ Choosing by convenience would embed a fourth duplication.

### 4.2 `relationship_type` vocabulary unverified
⚠️ The CHECK constraint on `relationship_spaces.relationship_type` was not read this session.
Whether the practitioner↔client relation is one of its values must be confirmed before treating
`relationship_space:<id>:steward` as a resolvable authority instance.

### 4.3 Arrangement identity is a slug pair, not a UUID
**[O]** `field_programs` and `field_program_lessons` are keyed on `(field_slug, program_slug)`.
`object_ref` for an Arrangement is therefore a composite string, ⛔ not a UUID — and `material_ids`
is a bare `UUID[]` with no FK. **[I]** Referential integrity for Arrangement→Work is enforced
nowhere.

## 5. What production must answer before design continues

```sql
-- 1. Which practitioner_clients definition actually exists? (§3.1 — blocking)
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'practitioner_clients' ORDER BY ordinal_position;

-- 2. Do clients resolve to people, or only to email addresses?
SELECT count(*) AS total, count(member_id) AS with_member FROM practitioner_clients;

-- 3. Which relationship types exist, and is practitioner↔client among them? (§4.2)
SELECT relationship_type, status, consent_status, count(*)
FROM relationship_spaces GROUP BY 1,2,3;

-- 4. Is practitioner_materials live substrate or dead legacy? (carried from Session 1)
SELECT count(*) FROM practitioner_materials;

-- 5. Are Works actually ratified, or is the lifecycle unused?
SELECT review_status, count(*) FROM library_sources
WHERE practitioner_member_id IS NOT NULL GROUP BY 1;
```

⚠️ **None of these can be answered from the repository.** Every schema fact above is a *declaration*;
which declarations took effect is a production question. ⛔ Design should not proceed on the
assumption that the files describe the database.

## 6. What this changes about sequencing

⭐ **The blockers are no longer conceptual.** In order:

1. **Answer §5's queries.** Cheap, and §3.1 may invalidate assumptions in three documents.
2. **Rule the identity question** — what is a client, and does a client have a member identity? ⛔ A
   publishing model addressed to non-persons cannot be built.
3. **Rule Field Object versioning** (§3.3) — governance dependency, already open.
4. **Decide the erasure path** (§3.2) — build the per-subject key layer, or re-specify §7 honestly.
5. **Then**, and only then, the ontology's implementation block becomes a real question.

⭐ **The pattern worth naming.** Three independent duplications — `practitioner_clients` (×3),
`practitioner_materials` vs `library_sources`, eight role vocabularies — all produced by
`IF NOT EXISTS` migrations declaring overlapping concepts at different times. ⚠️ The constitutional
model assumes a **single referent** for each concept. The substrate does not currently guarantee one.
That is the deepest finding here, and it is broader than publishing.

## 7. Not authorized

⛔ Schema, migration, code, route, UI · ⛔ resolving any duplication · ⛔ running the §5 queries
against production without the usual care · ⛔ lifting the ontology's implementation block — a
founder act · ⛔ re-specifying §7 erasure unilaterally.
