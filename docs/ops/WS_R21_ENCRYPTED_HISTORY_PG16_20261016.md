# Writer's Studio R21 — Actual PG16 encrypted, immutable draft-history prototype

Date: 2026-10-16 · Destination intention: 5 invited writers, `soullab.life`.
**Disposition:** fictional-only source/physical PASS, real-member writing and public deployment HOLD.

## Scope and ancestry

R21 reconciles both sibling R20 local source candidates rather than replacing either:
- R20 deny-only PG16 role `54aca510148080912c43890d1705d8589485a207`
- R20 full manuscript-history schema custody `7e028333750f144cf02b333610fba955c35b7c26`

Both descend from R19 `9fbdb71c950c276d5508eda9ad65618af27de3db`.
Their combination was merged in an isolated R21 worktree; legacy production code, Caddy, DB and hosted beta remained untouched.

## Actual writing path newly qualified

`lib/writersStudio/recovery/heldEncryptedHistoryR21.ts` implements offline/fictive **append** and **read** operations using the application's unmocked `lib/db/postgres.ts` pool/transaction plus the existing authenticated AES-256-GCM `workEnvelopeV1` and signed antirollback/deletion-checkpoint verifier. It stores an authenticated sealed WorkRecord set in PostgreSQL 16 `jsonb` with the exact ciphertext digest and prior-revision digest, no author plaintext.

- The external input must have R17's exact `soullab.life` held-only typed session preflight; the DB independently verifies same-member Work ownership (row lock on append, member-scoped join on read).
- Every append demands a signed deletion high-water plus independent minimum generation witness and a scoped Work encryption key. Those are **ephemeral fictional** in this test. No independent real-world key/signing authority is deployed.
- Encrypted versions are append-only and generation-ordered; stale submissions fail. A simultaneous pair of same-version saves produces one winner and one refusal. Read rechecks prior-revision digest and scoped owner identity. Missing/wrong keys and stale/revoked deletion checkpoints refuse.
- Existing R11 classified Source, draft, keep and revision record types can be encrypted with this codec (small bounded snapshots). This does **not** yet cover all R20 observed editorial/JSON/metadata fields, large source streaming, actual application routes, all backup replicas or original-file lifecycle.
- The R21 adapter rejects all calls unless the exact **`R21_FICTIONAL_ENCRYPTED_HISTORY=fictional-only`** test option is set; it has no public API caller or real-member feature flag. `R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED=false`.

Review-only schema: `docs/ops/WS_R21_ENCRYPTED_HISTORY_REVIEW_ONLY.sql` **outside** `database/migrations`, defines a disposable ciphertext-only historical table, owner/immutability trigger, denies PUBLIC and refuses additional envelope metadata fields. It is **not** an approved deployed migration or replacement for the existing plaintext writer tables.

## Physical evidence

`scripts/ops/wsBetaR21PG16EncryptedHistory.ts` uses a randomly named local `postgres:16.13` container with Mac-loopback-only port, fresh fictional owner Work, disposable DB, no host file mounts and one synthetic GCM key/Ed25519 signer.

Results: **14 physical checks passed**, **10 negative controls**, including:
- Exact original & edited fictional prose roundtrip in two separate revisions.
- Full isolated PostgreSQL dump contained no fictional manuscript sentinel or editorial note.
- Uninvited/foreign member read and save refused; wrong key, expired/absent independent deletion proof, revoked Work and stale revision all refused.
- Exactly one of two competing same-version writes commits.
- Direct SQL UPDATE/DELETE of encrypted historical records refused.
- Actual PostgreSQL SIGKILL/restart retained historical ciphertext and owner/digests.
- Disposable PG16 container and its ephemeral test volume removed.
- No live member, production DB, SMTP, model provider, real KMS, original Source files or visitor session touched.

Private machine receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R21_PG16_ENCRYPTED_HISTORY_20261016.json`.
Full selected inherited security/workflow regressions: **37 suites / 433 tests PASS**. Scoped strict TypeScript PASS.

## What is still missing before five real beta testers

1. **Independent real key custody and antirollback deletion high-water**; fictional process-memory signers do not qualify. The R17 preflight is typed, not wired to the actual authenticated service; no live consent/invitation grant.
2. **Migrate all real plaintext content-writing and reading pathways** (Source, chapter, draft, revision, preservation/undo, editorial JSON, filenames, provider messages) without duplicating plaintext in SQL/WAL/old backups/exports. Ensure member-owned original Source is intact and recoverable, including large file streaming.
3. **Real PG16 migration and restore across exact hosted schema** with audited least-privilege service role, transactional/file-vault reconciliation, historic backup non-resurrection and old-image reader/rollback parity. Do not turn on table migration during public build implicitly.
4. **Complete live Safari/Chrome/MAIA Develop–Write–Review, Apply/Undo, import, save/reopen and withdrawal/export.** Approved participation notice, individual invite delivery through approved non-Resend transport and founder exact source/image cutover GO.
5. Shared Linux host still below the 60 GiB disk-space release gate. Neither production nor Docker archives/volumes may be indiscriminately pruned.

**R21 is a functional encrypted revision-history fixture, not a published Writer’s Studio or five-member release.**
