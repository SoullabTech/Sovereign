# Writer's Studio R18 — Actual PostgreSQL 16 physical parity, fictional only

Date: 2026-10-16
Source parent: R17 `d53abd1180d96d36cd71c938f189b734947f2ca4`
Status: **PHYSICAL PG16 ADAPTER TEST PASS; REAL MEMBER RELEASE HOLD**

## What R18 verified

An independent native PostgreSQL 14 test previously qualified the R16 actual repository adapter. R18 runs the **same adapted end-to-end fixture** on an actual disposable `postgres:16.13` Docker image available on the founder's Mac Studio, exercising `lib/db/postgres.ts` and `lib/storage/fileVault.ts` through the unmocked R16 adapter. It does **not** run on Minisforum or load the live database.

All identities, Source bytes, signing keys, logical records and manuscripts are fictional. An explicit environment gate `R18_PG16_FIXTURE=fictional-only` is necessary. The PG16 container has a randomized dedicated name and publishes only `127.0.0.1:55418` on the local Mac; no public interface is exposed. A fresh temporary database and file vault are created for each run. Its review-only table is applied ONLY to this empty temporary database, never the real beta database.

Checks:
- Exact PostgreSQL version 16.13, loopback-only disposable DB, **22/22 physical checks PASS**, five explicit refusals/negative controls.
- Real repository's Postgres transaction + immutable file vault persist two authenticated ciphertext objects, readback verifies their SHA-256, same-member Work and provenance are reconstituted under fictional test-only signer trust.
- Foreign-member read/write, mutable SQL ownership, and absent second provenance half are refused.
- Plaintext negative control is detected in a complete fixture logical PostgreSQL dump; once removed, the fictional text and private original filename are absent.
- Active PostgreSQL container receives SIGKILL and restarts with the same persisted fictional database; exact owner, pair digests and files survive.
- Fixture-restricted Docker container and temporary files are removed; no persistent test container remains.
- No real member, live source, production API, SMTP, provider, key-management service or external database was accessed by R18.

Recorded physical receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R18_DOCKER_PG16_ACTUAL_STORE_20261016.json`.
Companion strict scoped TypeScript: PASS. R16/R17 focused JS regression: 34/34 PASS across 3 suites.

## Safety boundary and remaining gate

This qualifies actual PG16 behavior **for the isolated held-pair adapter**; it is not a complete release-equivalent production migration, multi-writer backup, historical SQL/WAL/JSONB/Source census, multi-GB source streaming, independent KMS/nonrollbackable deletion highwater, source-file life-cycle erasure, old-image recovery, or live browser acceptance. `R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED=false` and `R17_REAL_WRITER_SERVICE_ENABLED=false` remain unchanged. R17 preflight is unconnected to any active route.

Actual next release-critical slice: reconcile the real 16 schema and all plaintext reconstructive fields, external custody authority and writer-owned consent to the isolated R16/17 service; demonstrate complete DBA-grade restore and old-reader rollback before an exact-source/image founder GO. Production host `soullab.life` remains unchanged, with the five-person beta still closed.
