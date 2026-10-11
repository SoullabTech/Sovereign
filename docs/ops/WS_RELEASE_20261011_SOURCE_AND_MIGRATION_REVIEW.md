# Writer's Studio beta — migration and source-writing release review
**2026-10-11 · Engineering evidence only · NO MIGRATION / NO PUBLIC CUTOVER / NO SOURCE-WRITE OPENING**

## Frozen reference points
- Production reader re-witnessed: `c9e4f7f7e`, healthy on Minisforum 192.168.4.38. The old SSH alias pointed to 192.168.0.104; identity was checked against its previously trusted host key.
- UI baseline `2c962b95f8` was previously built and smoke-tested on an isolated Mac worktree. Later security-hold changes require a NEW exact final build, so do not attach that earlier build receipt to a newer HEAD.
- Source-custody engineering is SEPARATE at `fix/materials-beta-server-gate-20261008` / `dfef36dfdb`. Its extra source-posture/reservation migrations are not merged into this candidate.
- This review carries NO approved migration review/custody record, no trace approval, and no source-write grant.

## Overview migration: source-grounded analysis
- Exact required production-pending migration file is `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`. It adds the new `overview` value to the existing commissioned-lens check and `developmental_readings_observations_check` trigger function.
- Production at review time had 570 schema ledger records; this file was absent. The old reader's existing eight-lens check is unchanged for the old values. An exact read-only function comparison identified the new Overview admission as the material difference; no existing observation constraint was intentionally removed.
- The old writer at `c9e4f7f7e` (`lib/manuscript/developmentalReading/store.ts`) performs a parameterized INSERT of lens and observations. It does not update or delete the immutable reading. Target store file has no diff against that old reader in this interval.
- Synthetic transaction-only probe code: `scripts/verification/ws-overview-prefix-probe.cjs`. Inputs: the read-only production function definition, the exact migration SQL and an explicitly allowlisted local or disposable DB URL. It removes the migration's own outer BEGIN/COMMIT before running it inside a test transaction and rolls the entire fixture back; checks the scratch schema is absent afterward.
- PostgreSQL 17.7 (local, `maia_consciousness_test`) **23/23 PASS**, no persisted fixture schema or records.
- PostgreSQL 16.12 (disposable, loopback-only `postgres:16-alpine`, temporary data filesystem) **23/23 PASS**, no persisted fixture schema or records; the disposable container was stopped and removed.
- Tests covered eight old lenses both before and after migration, refusal of Overview before, acceptance afterward, theme-label discipline, evidence requirements, partial identity, and invalid position rejection. Public observation function digest was unchanged by the scratch transaction.
- LIMIT: A synthetic table/trigger fixture is not an old-reader application binary exercised on every possible production row state. PostgreSQL minor versions and all live ingress are not exhaustively matched. A formal every-prefix migration compatibility record with reviewer custody, old-reader binding and distinct founder authorization is STILL REQUIRED.

## Source-writing overlap: safe guards developed in this candidate
- Shared `lib/workbench/uploadPostureAuthority.ts` is deliberately hard false for source uploads and independently hard false for reviewed-text edits. It was taken from the staged source engineering branch without enabling its new custody/persistence adapters.
- Authenticated beta source POST returns 423 before `formData`; non-beta is refused as 403 before parsing; unauthenticated is 401. Source PATCH returns 423 before writing reviewed bytes.
- The founder Book Studio Workbench POST/PATCH also return 423 after founder authorization but before parsing, DB mutation or filesystem writes. Its current PATCH includes `sanctuary` metadata, so the hold also pauses that route.
- Mocked route tests **8/8 PASS**. Combined Writer's Studio UI and source-route acceptance **234/234 PASS, 42 suites** at the uncommitted guard patch. Existing DELETE test remains enabled and was included in the combined run. Recheck against the exact committed release HEAD.
- This is server-side defense in depth beside the public Caddy HTTP 423 rule, not completion of the unresolved source-custody transaction, journal or recovery ownership.
- Separate source-custody engineering branch focused tests **40/40 PASS** at `dfef36dfdb`; no migration or real member uploads were run.

## NEW live gap: separate manuscript artifact ingestion
- `POST /api/sovereign/manuscripts/ingest` is a distinct **25 MB file-backed manuscript intake**. After access verification and multipart extraction it calls `recordArtifactArrival`.
- `lib/manuscript/source/arrivals.ts` writes source bytes with `writeVaultBytes` first, then INSERTs `manuscript_source_arrivals`; no committed operation journal, quiescent recovery owner, or atomic DB/filesystem sequence is proven. A failed INSERT can leave an orphan file, contrary to stronger source-write custody assurance.
- The production Caddy source-write fence currently covers Writer's Studio Materials sources and founder Workbench uploads, **NOT** this manuscript-ingest path. Anonymous empty POST through actual production Caddy returned **401** for manuscript ingest, vs **423** for the two already fenced source families. NO CONTENT WAS UPLOADED.
- A 70-byte *insertion-only* Caddy matcher overlay was prepared **LOCALLY ONLY** against exact production Caddy SHA-256 `0510d54568a8af5a539df9cdbcbebe5e8cc5831b6ac3f3b08bdb9028ae49d10f`. Staged overlay SHA-256 is `adcc4c6f8c368927c1019396e5824d73b48bf935b8e5635ad3770a30ee3a681d`.
- The staged overlay adds only the exact and wildcard forms of `/api/sovereign/manuscripts/ingest` to the existing POST/PUT/PATCH deny matcher. Complete production-based Caddyfile validated in cached Caddy 2 image: **Valid configuration**; unrelated pre-existing formatting/header warnings. Extracted exact matcher in isolated HTTP Caddy: **10/10 PASS**, including new ingest refusal, old refusals, ordinary GET/DELETE and unrelated POST.
- **DO NOT INSTALL WITHOUT A SEPARATELY AUTHORIZED EDGE-ONLY CHANGE.** No production Caddy bytes or running config were altered in this review.
- The new application manuscript-artifact route is STILL ungated by the candidate's source hard holds. Do not confuse route-level Materials holds with complete source custody.
- A limited beta could preserve existing manuscript editing and member-confirmed text entry, but a file import must not be advertised as safely available until that endpoint receives its own validated custody protocol OR an explicitly approved temporary file-intake hold and honest UI state. A new upload hold is a real product limitation and needs its own release decision.

## Remaining release stops
1. Independent edge-only approval/install/witness for the manuscript-ingest extension, or equivalent stronger production protection, with actual ingress/alternate-origin coverage and rollback.
2. File-backed manuscript arrival lifecycle: protect/hold it during beta or prove durable authorized reservation, fsync, DB outcome reconciliation, orphan recovery, ownership, in-flight worker quiescence and privacy transition semantics.
3. Formal `review-custody-migration-gate.ts` evidence triplet with approved review of exact Overview migration, old/new-reader compatibility and every failure prefix. Synthetic check alone cannot approve schema mutation.
4. Non-founder exact-image authenticated browser walk, member isolation, Home/Write/Develop/Review/Listen/Publish, safe save/reopen, and real Safari manuscript-download receipt. PDF/EPUB certified exports remain disabled in Publish Preview.
5. Exact rebuilt candidate receipt, disk headroom, rollback artifact, and independent production cutover approval; preserve the Caddy 423 fence across old/new reader overlap.

**Holding statement:** No production schema migration, source upload, edge change, cutover, remote Git push or beta invitation was performed. This report is review preparation, not a release authorization.
