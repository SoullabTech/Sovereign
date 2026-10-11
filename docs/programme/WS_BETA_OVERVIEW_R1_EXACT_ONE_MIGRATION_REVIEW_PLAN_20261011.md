# Writer's Studio small beta — Overview R1: exact one-migration independent review

**Date:** 11 October 2026
**Standing:** **BOUNDED REVIEW PLAN — NOT YET REVIEWED, NOT APPROVED, NO DEPLOYMENT AUTHORITY.**
**Live old reader at plan drafting:** `c9e4f7f7eccb4049bf036d189cac7feb007ef3cc`.
**Pre-plan application and test candidate:** `d810d6f2594931bd7f65cb8288996080c93f6419`.
**Exact review target:** MUST be supplied externally by the independent review/custody harness, from its **final immutable commit**. Do not derive a target identity from a self-referential assertion in this plan.

## Scope and history

This review concerns only the exact final beta application and the single remaining Chapter Overview migration. Earlier writer beta, source custody, Listen, Publish, and advanced-runtime review documents are historical context, **not an approval for this target**.

The production application was observed healthy at the old-reader stamp above, while the production Caddy source-write fence now blocks POST/PUT/PATCH to the Writer's Studio Materials, founder Book Studio Workbench and manuscript-file ingest families at all public Caddy origins. Installed Caddy hash at plan drafting: `adcc4c6f8c368927c1019396e5824d73b48bf935b8e5635ad3770a30ee3a681d`. This fence must remain operative throughout any old/new reader overlap; Caddy protection alone does not certify internal-network bypasses or durable source custody.

The application candidate has additional independent server-side, fail-closed upload and reviewed-text guards, including the separate file-backed manuscript-arrival route. Existing Work and manuscript textual editing is not part of those new hard-false gates. Nothing in this plan opens source uploads, certifies PDF/EPUB, admits non-founder beta access, authorizes schema mutation, or permits deploying a new application.

## Exact production-pending migration set

Production ledger at plan drafting: 570 recorded migrations. The complete candidate migration directory, compared read-only to that live filename ledger, had **one** unapplied candidate SQL file (52 previously applied legacy ledger filenames have no corresponding candidate .sql source file; they are not part of the pending set):

1. `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`
   SHA-256: `d45c56cfc84089f758b477430e8912cd864a549c1129a34ab789d2a1f95afaba`.

The exact final target commit must contain these bytes. The deployment entrypoint must independently **re-witness** the ordered migration set, target commit and live reader identity immediately before any schema operation. Added/removed/changed/reordered migration bytes, old-reader movement, or a changed final target invalidate the review. Do not promote this one-file finding into a claim about unrelated staging environments or unpublished migrations.

## Existing production schema (read-only observed)

- Production PostgreSQL `16.13`; `developmental_readings` contains **33 existing frozen readings** occupying approximately **2,228,224 bytes** including indexes/TOAST.
- The current `developmental_readings_commissioned_lens_check` permits the eight lenses: structure, development, continuity, arc, themes, voice, coherence, reader.
- Existing lens distribution: structure 7; development 8; continuity 4; arc 3; themes 2; voice 3; coherence 3; reader 3.
- The observation validation is enforced by exactly one BEFORE INSERT trigger calling `developmental_readings_observations_check()`, alongside the existing immutable and orphan-delete protections. Full live observation function code was obtained through a read-only production query and compared to the candidate.
- The proposed migration uses a transaction and `SET LOCAL lock_timeout = '5s'`, drops/re-adds the lens CHECK to admit the ninth `overview` value, and uses `CREATE OR REPLACE FUNCTION` to admit that lens inside the observation check. The comparison found the Overview admission as the material function change; the reviewer must independently inspect the *exact complete SQL* and old function shape for accidental weakening.

These are observations, not promises about the schema at review/cutover time.

## Builder preflight: useful but insufficient

- The current old-reader persistence entrypoint `lib/manuscript/developmentalReading/store.ts` has **no source diff** from `c9e4f7f7e` to the pre-plan candidate. It INSERTs `commissioned_lens` and JSONB `observations` in the canonical table and does not update or delete frozen readings. The independent reviewer must examine old and target source, triggers, and possible *other* calling code.
- Synthetic PostgreSQL 17.7 and PostgreSQL 16.12 fixtures, with the exact candidate migration SQL and a read-only snapshot of the old function, passed **23/23 each**. The tests exercised all eight previously accepted lenses before/after, new Overview refusal before and admission after, and representative malformed observation refusals. The transaction-only fixtures rolled back entirely and left no scratch schema.
- A separate synthetic PostgreSQL 16.12 two-connection test held an old-reader-style ACCESS SHARE lock while the migration attempted its ALTER TABLE. The migration returned **SQLSTATE 55P03 in ~5,002 ms**, and the old constraint/reading insertion remained valid. After the blocking transaction committed, rerunning the same SQL succeeded and admitted old + Overview readings. The scratch schema was removed; the disposable container was destroyed.
- Reproducible test harnesses: `scripts/verification/ws-overview-prefix-probe.cjs` and `scripts/verification/ws-overview-lock-refusal-probe.cjs`, guarded to a named local test DB or loopback-only disposable PostgreSQL instance.
- Focused Studio beta acceptance after app-side import holds: **267/267 across 43 suites**. Governed TypeScript no-regression: **PASS**, 222 known diagnostics vs 239 historical baseline. A raw compiler run is still not clean. There is no current full-build receipt for the hardened final candidate; previous build for `2c962b95f8` was successful but its cache was safely removed after later code changes and disk pressure.
- Remaining critical limitations: the fixtures were not the complete live production database and did not exercise all existing 33 rows individually; PostgreSQL 16.12 differs from live 16.13 at the minor version; holding time **after** successfully acquiring an ACCESS EXCLUSIVE lock is not bounded by `lock_timeout`. Production long-running transactions or lock queues may still cause interruption. There is no governed cross-member browser acceptance or Safari downloaded-file receipt for the final image.

## Mandatory independent reviewer questions

The independent reviewer must establish, with exact source evidence, or return REVISE/BLOCKED:

1. The migration's only material acceptance change is admitting `overview`, not relaxing other observation identity, evidence, themes-label, position, provenance, immutability or ownership conditions.
2. All eight old reader lenses, including old Themes observations and both old/identity-augmented observation representations, remain lawful before and after the migration.
3. The exact old reader `c9e4f7f7e...` can continue all relevant existing inserts/reads (including in-flight commissions) under the new table CHECK and validation function; the old reader is never required to produce an Overview observation.
4. The target reader's new Overview commissions are valid under the final schema and **cannot** become active before the migration is successfully committed.
5. The migration's table alteration and function replacement are transactional and failure-safe under the production migration runner; a lock timeout rolls back the file and leaves the old reader serving, with no reader swap or rollback-tag advancement.
6. The single possible successful prefix (migration 1) is compatible with the old reader, and the empty prefix is the unchanged original state. The reviewer must give an explicit limitation-bounded `failure_prefix_compatibility` attestation only if this is established.
7. Reader rollback after the successfully committed schema remains lawful **without** a reverse schema migration, and the Overview-containing new records cannot break old-reader read/list/display paths that may encounter them.
8. The migration's ACCESS EXCLUSIVE lock acquisition and CHECK validation of the ~2.2 MB table are acceptable in the observed live shape or require pre-cutover lock/traffic mitigation. The 5-second `lock_timeout` protects waiting time, **not lock hold time**.
9. Production's source-writing Caddy hold is operative through old/new overlap and must not be implicitly retired by schema work. New app-side hard guards and remaining direct/internal writer bypass limitations must be explicitly noted. File-backed imports will remain unavailable during this held release.
10. The approved migration process is `scripts/deploy-production.sh deploy|update <exact commit>`, with exact build/rollback provenance and migration review, then re-witness/migrate, then tag/swap; **never** the quick `prepare-maia` or `cutover-maia` path while any SQL is pending.
11. Distinguish a successful isolated code build and 267 unit tests from real authenticated lead-tester usability, membership isolation, Safari device download and positive crash-safe source custody. These remain separate product release gates.

A REVISE or BLOCKED finding is a legitimate result. A negative outcome must never be promoted into approval by modifying the review record afterward.

## Minimum physical Read witnesses (not just Grep)

The independent trace must physically Read at least:

- this exact plan and `docs/programme/evidence/WS-BETA-OVERVIEW-R1-20261011/READ_ONLY_CONTEXT.json`;
- `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`;
- `database/migrations/20260904000001_developmental_readings.sql`;
- `database/migrations/20260921000001_developmental_reading_observation_identity_compatibility.sql`;
- `lib/manuscript/developmentalReading/store.ts`;
- `lib/manuscript/developmentalReading/contract.ts`;
- `lib/manuscript/developmentalReader/read.ts` and `lib/manuscript/developmentalReader/contract.ts`;
- `app/api/sovereign/manuscripts/[id]/readings/route.ts`;
- `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx` (Overview commission and return, not merely a heading);
- `app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx`;
- `scripts/deploy-production.sh`, `scripts/run-sql-migrations.sh` and `scripts/review-custody-migration-gate.ts`;
- `scripts/migration-compatibility-core.ts` and `scripts/migration-prefix-compatibility-core.ts`;
- `docs/ops/SOURCE_CUSTODY_MANUSCRIPT_INGEST_EDGE_LIVE_INSTALL_RECEIPT_2026-10-11.md` and `lib/workbench/uploadPostureAuthority.ts`;
- at minimum the same old-reader source paths `lib/manuscript/developmentalReading/store.ts`, `lib/manuscript/developmentalReading/contract.ts`, `lib/manuscript/developmentalReader/read.ts`, `lib/manuscript/developmentalReader/contract.ts`, `app/api/sovereign/manuscripts/[id]/readings/route.ts`, the old schema/identity migrations and the old deployment runner from **`old-reader/c9e4f7f7eccb4049bf036d189cac7feb007ef3cc/<repo-path>`** in the reviewer bundle;
- any other exact source the reviewer identifies as necessary to establish write/rollback or lock behavior.

These are minimum Reads; reviewer discovery through grep/glob is not itself coverage. The reviewer should not have production credentials, mutation capability, deployment authorization or authority to alter the release candidate.

## Required independent review output and admission law

A real review must produce Review-Custody `verdict` (`APPROVED`, `REVISE`, `BLOCKED`), exact `plan_sha256`, a stable `trace_id` matching the actual reviewer process, nonempty reviewer/summary/findings, physically witnessed `coverage.files`, limitations and a genuine reviewer trace. If and only if independent evidence establishes the outcome, attach `migration_compatibility` with:

- `instrument: migration-compatibility/v1`; `verdict: COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader SHA and externally resolved exact final target SHA;
- the single ordered pending SQL path and its SHA-256 given above;
- old-reader evidence items with `repo_path`, SHA-256 derived from the real old Git blob and the exact `old-reader/<SHA>/...` trace path actually Read by the reviewer;
- nonempty concrete rationale and explicit limitations;
- `failure_prefix_compatibility` (`instrument: migration-prefix-compatibility/v1`) with `ALL_PREFIXES_COMPATIBLE` only after one verified prefix entry bound to this exact migration path/hash, with nonempty rationale and explicit limitations.

The record MUST be admitted by the ordinary Review-Custody process and then independently checked for applicability by `scripts/review-custody-migration-gate.ts`. Neither a reviewer summary nor a locally fabricated trace is an admissible substitution. The gate must report `MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES` against the **re-witnessed** live state before any migration runner may execute.

## Disposition and next separately authorized actions

**Prepared for independent review; not passed.** Do not execute SQL or swap the production reader on this plan. After independent review and a separately authorized final build/cutover, the operator must still verify backups, lock concurrency, non-founder beta flows, continued Caddy 423 fences and a working rollback image. New source-file uploads, source editing, optional cloud sync and PDF/EPUB remain separately held until their own release receipts and founder choices.
