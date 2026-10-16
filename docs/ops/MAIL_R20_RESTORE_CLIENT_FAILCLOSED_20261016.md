# R20 restore — fail-closed governance preservation

**Date:** October 16, 2026
**Source basis:** Soullab Mail draft PR #1830 `f17c806e5108f40f0eae6751e7a9360861b3c779`.
**Scope:** non-production security hardening and synthetic tests; separate draft review required. **No release/deploy/restore authorization is implied by this patch.**

## Defect found

The original `scripts/restore-governed.sh` ran `pg_dump` on the *destination database* before restoring an incoming snapshot, to retain existing deletion manifests, deletion scopes and tombstones. However, **any nonzero pg_dump error** was silently reclassified as "governance tables absent," and the script continued with an empty preserved-governance file.

That is unsafe: a failed dump (bad permissions, connection, or old client) is **not** proof that the destination has no deletion records. In the Mac Studio environment, `pg_dump` is v14.19 while the source system uses PostgreSQL 16.13. The prior fictional R20 tests used the **matching v16.13 database-container client** and did not exercise that tool mismatch.

## Isolated fix

- Require an exact, usable server version and a governance-export `pg_dump` client whose major version is not older than the target server, before any restore.
- Query the destination catalog for all three required governance tables and refuse incomplete schemas.
- Only treat governance tables as absent when the destination is **truly empty** (no other public base tables).
- If all three exist, a successful, non-empty deletion-governance export is mandatory. Error/empty export is a refusal, not a warning.
- After restoring an incoming snapshot, verify that all three governance tables are now present **before** trying to reapply/sweep deletion records.
- Enforce `umask 077` and remove temporary preservation data on both success and failure.

This does **not** make restoring a large SQL snapshot atomic, does **not** replace R20 deletion-governance custody from the source host, and does **not** permit restoring real member data into an unapproved destination.

## Synthetic evidence

- Before the client-version check was added, patched R20 restore on **exact public production-matched PostgreSQL 16.13 / pgvector 0.8.2** passed a **full compressed fictional pg_dump**, preserved one manifest, one scope and one tombstone, re-erased two fictional records, and retained two unaffected records. The test container was removed.
- The patched R20 also passed a **data-only fictional restore with pre-existing governance**, preserving deletion markers and refusing resurrection.
- **Four negative database tests passed** on the matched image: failure of governance export, partial governance schema, a populated target without governance tables, and a restored snapshot without governance tables. Test data/containers removed.
- After adding the client-major compatibility check, shell-only synthetic tests passed **2/2**: simulated PG14 versus server PG16 is refused before restore; simulated correctly versioned but failed `pg_dump` is refused. `bash -n` passes.
- Docker Desktop was briefly unavailable, but later returned without being restarted by this workflow. The final, portable, reviewed-source tests were rerun: **both positive PostgreSQL 16.13 restoration paths PASS**, all **four database-level negative tests PASS**, and both client/export-version refusal tests PASS. All fictional-data containers were removed. The test entry points are `scripts/witness/r20-restore-full-dump-positive-20261016.sh`, `r20-restore-existing-governance-positive-20261016.sh`, `r20-restore-failclosed-test-20261016.sh`, and `r20-pg-client-version-refusal-20261016.sh`. The synthetic faulting `pg_dump` fixture is `r20-failing-pgdump-fixture.sh`.
- This positive evidence covers **only disconnected fictional snapshots**, never the approved real production backup; the connected-device safety block still prevents that transfer.

## Release gates

1. Repeat full compressed fictional dump and existing-governance PostgreSQL 16.13 tests against **final exact source bytes** when Docker is available, plus all negative tests.
2. Separate Class A/structural review of this source change. No auto-merging into PR #1830.
3. Use the production-matched database client INSIDE the isolated container for any eventual authorized real R20 rehearsal; do not run Mac-host `pg_dump 14` against a PG16 target.
4. Preserve the existing founder-approved **one-time** backup transfer/restore scope but respect the connected-device safety restriction. The transfer was blocked before any backup bytes moved; **no alternate transfer path is authorized** by this note.
5. Keep Proton Mail PR #1830 in DRAFT/HOLD pending the independent human exact-SHA verdict, protected real-backup R20 test, and a tested non-Resend recovery path. Production remains unchanged.
