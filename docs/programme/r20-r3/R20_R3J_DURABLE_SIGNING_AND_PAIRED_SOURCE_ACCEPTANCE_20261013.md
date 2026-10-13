# R20-R3J — Durable signing / paired Source recovery fixture

October 13, 2026. **Founder-led engineering candidate; NOT production authorization.**

## Parent and scope
Parent exact isolated R20-R3I commit: 7791076ef92b2b6222e436931c461657eed7d635.
New branch: feature/r20-r3j-durable-fixture-20261013.

New implementation and evidence:
- lib/recovery/r20-r3/durableFixtureAuthority.mjs
- lib/recovery/r20-r3/syntheticPairedVaultRecovery.mjs
- tests/constitutional/r20-r2/r3j-durable-signing-recovery.test.mjs
- tests/constitutional/r20-r2/r3j-paired-source-recovery.test.mjs
- tests/constitutional/r20-r2/r3j-legacy-backup-disposition.test.mjs
- docs/ops/WS_R20_R3J_HISTORICAL_BACKUP_REMEDIATION_20261013.md

No existing production routes, database migrations, scheduler scripts, mounted-drive files, member-data directories or real signing keys changed.

## Signed durable checkpoint architecture — fictional custody only

An injected three-role signing interface supplies separate signed ledger, HEAD and monotonic-pin envelopes. The fixture stores immutable numbered files in separate ledger/head/pin folders and publishes a final commit record. Every write has file and directory sync; conflicting or incomplete histories are refused, never auto-repaired or silently pruned.

The reader must verify every persisted generation's signature, externally supplied public keys and complete committed-outbox prefix, not a self-asserted latest pointer. A separate Node process can reopen the fixture from disk using only public keys.

Tests inject interruption after ledger, head, pin and final commit and verify the appropriate fail-closed / read-back behavior. Two simultaneous writers cannot publish competing sequences. A held-back or missing committed deletion, absent signing role, changed data, partial rollback, or unexpected storage object refuses.

**Material limits:** All four folders are on a single Mac temporary filesystem. Test Ed25519 private keys are ephemeral in test memory, and signer callbacks are not actual remotely administered signing devices. If an adversary rolls back both the entire mock outbox and all signed folders, this fixture alone cannot detect it. Therefore it is NOT an independent durable high-water service or key-retirement solution.

## Full paired Source recovery — synthetic only

The fictional paired verifier checks:
- one exact database + Source generation and commit fence;
- declared Work / Source / original-file counts;
- Work ownership and original Source file-to-reference coverage in both directions;
- SHA-256 of exact fictional bytes and extracted text;
- source provenance distinction between pasted text and uploaded originals;
- strict refusal of orphaned, missing, corrupt, extra or duplicate files;
- refusal of any Work named by the currently verified signed deletion checkpoint;
- refusal of even one known or unknown historic reconstructive archive;
- no acceptance of caller-supplied authority success flags.

This is **not** a full current production manuscript-vault restore: no live PostgreSQL/WAL, 44-table current coverage, old SQL archive bytes, Synology ACL, NAS recycle, offsite key management or real member Source was inspected or migrated. This candidate never authorizes real publication.

## Observed acceptance

On the authorized Mac Studio, the entire scoped R20 Node test suite returned **139/139 PASS, zero failures**:
- Prior R20 and R3I suites: 94 tests.
- New durable-signing checkpoint suite: 21 tests.
- New paired Source recovery suite: 19 tests.
- New historic backup hold and disposition suite: 5 tests.

All results are synthetic/local, not a human second review or security release certification. Founder requested continuation without a second reviewer; this staffing choice does not erase objective storage, key, irreversible deletion or recoverability requirements.

## Separately gated remaining work

1. Provision a genuinely independent signing/head/high-water custodian (outside all restorable DB/NAS failure domains), durable across signer loss, rollback and rotation. Prove deletion signing order and per-Work key retirement.
2. Bind that authority and a real complete committed transactional outbox to a true restore publication fence; test interruption, concurrent deletion, hostile stale restore, loss of signer and recovery device.
3. Obtain renewed read-only Minisforum/Synology counts and exact ACL/snapshot/offsite witness (remote SSH was unavailable in this session); remediate each historical plaintext and recycled copy by a separately approved, proven irrecoverability method. Do NOT purge current backups to make a test pass.
4. Complete encrypted-before-durable storage and exact current PostgreSQL + original Source consistency across all reconstructive tables/derived content and original bytes; resolve WS-DELETE-02.
5. With exact separate founder authorization, make one real encrypted complete capture, isolated restore, all-reference/hash comparison, deleted-Work negative control and unrelated Work success witness. Only then qualify recurring Lexar ciphertext copy and beta deployment.

**Production, real manuscripts, NAS, LaCie, Lexar, R20 signer services, backup crons, migration and public beta remain unchanged and HOLD.**
