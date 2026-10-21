# SOULLAB-LIVING-ARCHIVE-01 · Source Vault Substrate Census

**Status:** CENSUS · 2026-10-01 · no schema authored · no runtime implementation · no production change.

**Canonical basis:** `887d7bbf465d` (PR #1642 merged). This act answers one question only: **what archive/provenance substrate already exists, and what must not be silently repurposed?**

## 1. Finding

There is **no existing Living Archive database schema, service, route, or renderer** in canonical.

The two admitted Living Archive records are documentation only:

- `SOULLAB-LIVING-ARCHIVE-01_DARK_FIELD_AND_CHOICE_CANDIDATE_2026-10-01.md`
- `SOULLAB-LIVING-ARCHIVE-01_LA2_DARK_FIELD_PREBUILD_CLOSURE_CANDIDATE_2026-10-01.md`

That means the historical archive still has no persistence substrate. This is good: there is no legacy schema we must preserve or migrate before deciding the right object model.

## 2. Vocabulary collision: "Source Vault" already exists elsewhere

`MAIA-WISDOM-01_CHARTER_CANDIDATE_2026-09-15.md` already uses **Source Vault + Wisdom Registry** for the future wisdom-corpus lane. Its source-vault principle is: preserve the source corpus intact while indexes/distillates remain derivative.

That lane is explicitly about **knowledge sources for MAIA's wisdom retrieval**, and explicitly excludes member conversational content from becoming a second corpus.

Therefore:

- the MAIA-WISDOM Source Vault and the Living Archive historical source layer are **not the same corpus**;
- neither should silently absorb the other;
- an unqualified database/service name such as `source_vault` would create architectural ambiguity.

**Candidate namespace rule:** any future historical substrate should be domain-qualified as **Living Archive Source Vault** in prose and use a `living_archive_*` technical namespace unless later canon deliberately unifies the two concepts.

No unification is proposed by this census.

## 3. Existing substrate that is adjacent but not reusable as the archive itself

### 3.1 `library_sources` / `library_chunks` / `library_distillates`

These tables are the Library Intelligence / wisdom-ingestion substrate.

They are designed for:

- one row per ingested knowledge source;
- checksum deduplication;
- ingestion state;
- chunking, full-text/vector retrieval;
- AI-generated distillates;
- source consent in the knowledge-library context.

They do **not** encode the Living Archive's required distinctions: Then/Between/Now, evidentiary standing, original vs reconstruction, Sealed vs Withheld, known gaps, sub-artifact membership, rights/publication status, artifact admission lifecycle, or lineage strength.

**Finding:** do not extend `library_sources` into the Living Archive merely because both contain "sources." That would collapse *knowledge retrieval* and *historical evidence* into one authority surface.

### 3.2 `manuscript_source_arrivals`

This is the strongest reusable **pattern**, but not a reusable table.

It preserves immutable evidence of what arrived in Writer's Studio:

`SOURCE ARTIFACT → SOURCE TEXT → INTERPRETATION → WORK STRUCTURE`

It structurally distinguishes a file-backed artifact from member-supplied text and refuses to invent an upstream artifact where none exists.

That discipline is directly relevant to the Living Archive: **artifact before interpretation; provenance is structural, not decorative.**

But the table is manuscript/member-specific and bound to Writer's Studio custody. It must not become the general historical archive.

**Finding:** reuse the provenance discipline, not the table.

### 3.3 `provenance_tombstones`

These are sovereignty-driven deletion refusal markers. They retain object identity only so restored data cannot resurrect material that was deliberately forgotten.

They are not historical withdrawal markers and cannot be used to represent a Living Archive artifact that becomes private, sealed, or withheld.

This distinction matters especially for third-party material: LA-29 requires **no positional trace** in the member-facing field.

**Finding:** deletion provenance and archive visibility provenance remain separate authorities.

## 4. Existing generic "artifact" tables do not form one artifact registry

Canonical contains multiple domain-specific artifact concepts (`session_artifacts`, `shared_artifacts`, `relationship_space_artifacts`, `studio_clarity_artifacts`, `artifact_shares`, release evidence, etc.). Their shared noun does not establish a shared ontology.

No table currently acts as a universal artifact identity/provenance registry for historical objects.

**Finding:** do not join these domains merely because each uses the word *artifact*.

## 5. What a future Living Archive substrate must represent

This is not a schema proposal. It is the minimum semantic surface the later schema must be able to express without lossy JSON improvisation:

- stable archive identity at the fixed object unit;
- parent/sub-artifact relation without sub-artifacts inflating Dark Field point count;
- exact / approximate / range / unknown date standing;
- artifact class and source status;
- original / contemporary record / later recollection / reconstruction / derived record;
- creator / voice;
- source location without requiring publication;
- access standing;
- rights/privacy standing;
- **SEALED (SELF)** versus **WITHHELD (THIRD PARTY)**;
- admission lifecycle: discovered → catalogued → reviewed → admitted / restricted / private → exhibited where lawful;
- Then / Between / Now separation;
- what the artifact establishes / does not establish;
- known-gap records as first-class objects distinct from artifacts;
- lineage edges carrying DIRECT / FOUNDER-ATTESTED / STRUCTURAL / PROPOSED standing;
- withdrawal behavior that cannot re-disclose third-party existence;
- coordinate eligibility without requiring coordinates to be stored as historical fact.

If a future schema cannot express these distinctions structurally, it is not yet the Living Archive substrate described by LA2/LA3.

## 6. What is explicitly not authorized by this census

- no migration;
- no `living_archive_*` tables;
- no API route;
- no renderer;
- no import from `library_sources`;
- no copying of Writer's Studio source-arrival rows;
- no artifact ingestion;
- no Dark Field prototype;
- no change in standing for LA-27, LA-28, or LA-29;
- no decision on anonymous vs authenticated entry.

## 7. Next lawful boundary

The repository is now clear enough that the next act is **not another census**.

The remaining founder standing is narrow:

1. rule on the layered entry model (anonymous PUBLIC-only / authenticated member / WITHHELD invisible);
2. rule on LA-27, LA-28 and LA-29;
3. if admitted, authorize a **Living Archive Source Vault schema candidate** under the `living_archive_*` namespace;
4. only then author executable F1–F11 fixtures against that reference model.

**Census conclusion:** the Living Archive needs its own historical-evidence substrate. It should borrow provenance discipline from existing systems, but it should not reuse their authority surfaces or vocabulary unqualified.
