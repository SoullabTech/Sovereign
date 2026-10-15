# Beta canonical bootstrap and basic paired recovery

2026-10-14 local review candidate. Parent: `23ecd09bc3881692a4c484c1d5c4686961c86cd2`.
No production cutover, live migration, provider operation or tester admission.

## Reproduced failure, not a synthetic prerequisite assumption

An empty, networkless PostgreSQL16 instance loaded the exact committed September1
baseline (634 tables, 504 recorded migrations, zero members). The unmodified
migration runner applied 67 later migrations, then refused R4G because
`semantic_memory_vectors` does not exist. All four old required-migration names
were already present: that short list alone does not establish release readiness.
The original failed database and logs are retained, not reset or relabelled PASS.

The repository has no canonical genesis DDL for this vector sink. Its only
creation example is explicitly fictional; its application insert catches a
missing-table error. Creating a guessed table would activate previously failing
content persistence, which this repair deliberately does not do.

## Narrow held-R4G correction

Protect `public.semantic_memory_vectors` only where it already exists. When
absent, leave it absent; create no store, row or permission. Existing rows retain
the three ancestry columns, unknown historical default, origin CHECK, index and
source comment. No exception fallback hides an incompatible existing relation.
The developmental and breakthrough tables remain mandatory, not optional.

Actual PostgreSQL cases: full fresh bootstrap/migrations PASS; repeat PASS;
missing sink stays absent; pre-existing fictional sink receives its protections
and keeps its exact text with unknown ancestry; incompatible view refuses; the
failed migration is not stamped; old applied checksum refuses without restamping.
The corrected schema has 686 tables and 574 ledger entries before the additional
member-trigger resolution migration described below.

IMPORTANT: R4G is an already-authored held migration. An environment with its old
checksum MUST still refuse this source. This is a fresh-beta bootstrap candidate,
not permission to edit a live ledger or silently upgrade an already-migrated DB.
Any future creation of the absent sink requires separate reviewed genesis,
provenance, retention and reader/writer qualification.

## Existing restore failure and minimal additive correction

A basic paired rehearsal used two new fictional UTF-8/CRLF original files and
separate editable drafts in the actual canonical members/manuscript/source-arrival/
working-draft tables. A selected-table pg_dump and file hashes were retained.
The unchanged governed restore failed at its first member insert: pg_dump clears
search_path, while the member trigger calls compute_developmental_tier unqualified.
The failed target contained no partial member/manuscript/source records.

New additive migration `20261014000001_restore_member_tier_function_resolution.sql`
sets search_path to pg_catalog,public on the EXISTING trigger function only.
Its body, security-definer flag and privileges were hash/metadata-compared unchanged.
Normal and empty-search-path tests agree for under13/tier2/tier3/adult and their
guardian requirement. No age policy, content gate or restore script was rewritten.

Reusing the EXACT original dump and fictional files without resetting either DB,
the existing governed restore now completes. Both files, source associations,
Unicode/line endings and distinct edited drafts match hashes. The restored DB
survives stop/start. The rehearsal verifier rejects missing/corrupt files. That
verifier is test instrumentation, not a newly shipped production restore service.

## Regression and limits

Existing Studio/history/audio/panel/queue/mode and privacy suites were rerun
(109+21+477 passing); eight new source guards pass. Existing Review rollback
contract tests pass eight cases and verify refusal before live-image retagging.
That is a source-level rollback guard result, not a production rollback execution.
No app/lib/component, provider, package lock, Prisma schema or compiler setting changed.

Basic selected-table/file recovery is NOT a full database/vault restore, strict
Delete Work erasure, independently current signed R20 custody, historical-backup
non-resurrection, actual tester sign-in, physical-audio quality or release approval.
Legacy restore governance gaps remain under #1793 and are not waived by this test.
The saved beta key was not accessed; the authorized paid-request allowance is unused.

Evidence: `/Volumes/T7 Shield/ws-beta-db-recovery-qualification-20261014/` and
`/tmp/ws-beta-db-recovery-23ecd09b-20261014` on the native staging host.
Only newly named networkless test databases and an owned persistent test volume
were used; no live member rows or real Source vault files were copied. The owned
PostgreSQL container was stopped after each run, with failed/positive evidence
retained. Original public application identity/start time/health stayed unchanged.
