# Writer's Studio R31 — Legacy Content Writer Migration Plan

**2026-10-16 · Five invited writers on `soullab.life` · Real-member release HOLD**

## Decision

R30 `e205116f0b09b7fc673f75dc4de83124cfb63e23` qualified signed session/consent plus fictional PostgreSQL Work-level save/withdrawal ordering. That is not enough to launch a real writer, because the canonical Writer's Studio application still includes existing ordinary SQL paths for original Source, live drafts, historical revisions, kept text and editorial context.

R31 provides a reproducible **repository-source-only** inventory of the literal SQL writer sites. The scan reads only checked-out `.ts/.tsx` source files, not membership, manuscripts, SQL rows, backups, vault bytes, AWS credentials or provider content. It writes a mode-0600 private structural receipt (relative source path, operation, SQL table, line and known column *names* only). The receipt carries no SQL parameter values or source-text excerpt.

### Verified bounded inventory

| Fact | R31 result |
|---|---:|
| Source files scanned | 309 |
| Literal SQL write candidates | **51** |
| Distinct source files with matches | **19** |
| INSERT candidates | 26 |
| UPDATE candidates | 22 |
| DELETE candidates | 3 |
| Targeted legacy tables with matches | 11 |
| Real-member access authorized | **No** |

This is a **lexical lower-bound worklist**, not a data-flow or deployment reachability proof. Some statements may carry metadata rather than prose, be inaccessible to the beta cohort, or use additional governance already present. Conversely, dynamic SQL, ORM writes, stored procedures, logs, model requests, client caches, WAL, exports and old backups may expose more. **No number of zero literal matches would, alone, permit GO.**

Private exact source receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R31_LEGACY_WRITER_WRITE_SITES_20261016.json`; fingerprint `c0a41a86d083e2022a885380da6a99a2150efc18daf536b6f99dcec5dfa1c550`. Exclude tests and migrations from this limited source scan; include them in later regression and migration review.

## Migration waves: writer experience stays intact

### A. Original Source and manuscript creation — first

**Ownership:** `lib/manuscript/source/arrivals.ts`, `app/api/sovereign/manuscripts/route.ts`, `app/api/sovereign/manuscripts/blank/route.ts`, and their importing call chain.

The source-arrival insert references original filename, extraction method and source text in an ordinary SQL-compatible schema. Replacement must preserve byte-exact import provenance, author ownership, accepted formats DOCX/PDF/TXT/MD, parse warnings, and new-Work versus existing-Work behavior. The original artifact and extracted Source need encrypted vault custody with independently scoped Work keys and deletion checks. SQL may contain only explicitly approved, non-reconstructive structural metadata and encrypted object references. Handle large imports by governed streaming/chunked encryption rather than R11's 16 MiB WorkSnapshot limit.

**Acceptance:** create and import fictional Works, restart the database, recover exact original bytes and extracted sections, reject foreign Work/read, verify entire disposable PG16 dump/source-vault backup contains no plaintext source sentinels, and prove old-key retirement/refused restore.

### B. Draft creation, saving and revision history — second

**Primary paths:** `app/api/sovereign/manuscripts/[id]/draft/route.ts`, `app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts`, `app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts`, `lib/manuscript/sections/saveSection.ts`, `lib/manuscript/sections/convertDraft.ts`, `lib/manuscript/sections/normalizeLegacyScaffold.ts`.

These represent the largest cluster (working draft content, draft section text, prior revision content and notes). They must use the **same** R23 immutable AES-256-GCM vault + PG owner/generation/cipher digest/predecessor manifest under R29 signed current session+consent and a **real independently administered** R30 Work revocation/commit authority. Server-side preauthorization and post-KMS permission recheck are insufficient if withdrawal can commit concurrently outside the same durable external coordinator. Preserve concurrent edit conflict/optimistic version semantics and autosave.

**Acceptance:** imported and blank fictional manuscripts, section edits, revision snapshots, save/close/reopen, version conflict, duplicate generation, two browser tabs, two authors' separation, revoked session/consent, key outage and crash/restart with no plaintext fallback. Existing Studio draft/revision API response semantics must not silently change.

### C. Editorial review, application and recovery — third

**Primary paths:** `lib/manuscript/revisionAuthorization/store.ts`, `lib/manuscript/revisionAuthorization/execute.ts`, `lib/manuscript/editorialRuntime/recovery.ts`, `lib/manuscript/proposalChain/store.ts`, `lib/manuscript/editorialWorkspace/store.ts`, and `app/api/sovereign/manuscripts/[id]/keeps/route.ts`.

Protected payloads include expected edit text, proposed revision chains, kept quotations, Apply/Undo before/after snapshots, rationale and related editorial context. Treat prose-bearing JSONB/notes as author writing, not harmless operational metadata. MAIA must remain the single conversational voice while author approval and undo custody are explicitly witnessed.

**Acceptance:** a fictional writer receives 2–4 edit options, accepts one, modifies another, ignores one, applies/undoes across session reopen and export; a withdrawn writer cannot receive a new key grant. No original/proposed/undone text survives in ordinary SQL, application logs or unrestricted provider calls.

### D. Structure, narrative development and derived records — fourth

**Primary paths:** `lib/manuscript/structure/structureService.ts`, `lib/manuscript/structure/authorStructure.ts`, `lib/manuscript/structure/proposalStore.ts`, plus additional nonliteral/dynamic paths from independent review.

Titles, headings, evidence, interpretation, reader provenance and structure proposals may disclose exact writing or intimate meaning even if no full chapter exists. Define which structural references can remain plain, which are author secrets and which are permitted model-provider disclosures under the approved member notice.

**Acceptance:** Develop → Write handoff, related sections, chapter arc/continuity, semantic zoom, accessibility/adjustable columns; save/reopen and export do not lose structure or authorship. No hidden auto-interpretation or MAIA suggestions are silently promoted to a Work.

## Deployment-compatible transition (not yet authorized)

1. **Define a single protected-writing service contract** mapping each writing action into Work-owned ciphertext records with durable owner/version/audit metadata. Join the R23 file vault, R29 consent-bound lease and **real** R30 coordinator; do not deploy a fixture flag or a caller-forged `server_verified_member_session` subject.
2. **Classify every targeted and derived field.** Release reviewers must record whether it contains author text/provenance, is safely structural, or is unavailable. Unknown means HOLD. Reconcile all R20 11 direct + 8 derived + 29 still-unclassified prioritized fields, then sample data-flow under a strictly separate fictional database. This R31 scan cannot determine actual column plaintext.
3. **Shadow-read and verify** rewritten new encrypted Work content against synthetic expected results while the real route stays closed; NEVER duplicate real prose into ordinary SQL for convenience.
4. **Migration and recovery:** design a governed encrypted re-encryption of legacy data with backup/WAL/replica/old-image controls. Merely encrypting a new column cannot erase historical text from older backups. Prove surviving Writer Source and history restored on a different environment using independent currently valid Work keys, and revoked prior-work denial from pre-revocation archives.
5. **Release gate:** exact source/image with full strict compilation, Mac/iPhone Safari and Chrome Develop/Write/Review/MAIA/Apply/Undo, original Source import/save/reopen/export, Personal Portal, approved notice and non-Resend invitations, independently reviewed rollback, owner-pinned key and revocation service, and >=60 GiB release disk threshold checked immediately before build. No fallback to the legacy writer if KMS unavailable.
6. **Founder Class A GO is separate.** At most five named, authenticated, consenting writers; invitation-only `soullab.life`, no additional member data access or cutover without the exact-image authorization.

## Code/test disposition

`scripts/ops/wsBetaR31LegacyWriteSites.py --self-test`: **4/4 PASS**.
`scripts/ops/wsBetaR31LegacyWriteSites.py --scan`: structural receipt PASS, **51 candidates/19 files**, status `HOLD_LEGACY_SQL_WRITE_CANDIDATES`, `canAdmitRealWriters=false`.

This source scanner is not a security oracle and is not wired to the production build; it is an engineering ownership register. Another reviewer must still inspect each literal match and every dynamic/ORM writer, read path and historical storage format. The report intentionally cannot return real-member GO.

**R31 outcome: tangible migration worklist prepared. Real-member beta HOLD, production unchanged.**
