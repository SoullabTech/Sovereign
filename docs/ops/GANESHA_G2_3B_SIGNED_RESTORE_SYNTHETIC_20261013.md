# Ganesha G2-3B — Synthetic signed deletion-overlay restore witness

**Date:** 2026-10-13
**Exact parent:** `64c565d96fdc322c7d1347ef8bcf2ec6dd49bc1e` (G2-3A Attention Owner repair).
**Isolated review branch:** `feature/ganesha-pro-g2-3b-sealed-recovery-fixture-20261013`
**Candidate status:** Synthetic-only witness and architecture evidence; **NOT a restoration engine**.
**Release:** merge, installed migration, commercial grants, member data and production HOLD.
**Human acceptance:** not received; exact commit must be reviewed separately.

## Governing boundary

Ganesha Life Flow belongs to members; Pro Studio belongs to professionally authorized contexts.
The four personal Field tables (`field_notes`, `field_attention`, `field_events`,
`field_people`) require zero resurrection of individually deleted objects and
content-minimal authority for both practitioner-compatibility and member-native rows.

The R20-R2 candidate in `lib/recovery/r20-r2/signedLedger.mjs` already sketches
Ed25519 signature verification, a signed independent HEAD, external monotonic
high-water and a fail-closed restoration posture for other specified content
tables. **R20 currently does not admit the four Ganesha tables in its TABLES
vocabulary. No production R20 code or governance was changed by this witness.**

## Exact schema source, disconnected PostgreSQL

`scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql` is a **review-only**
copy of the actual proposed archived SQL with verified SHA-256:

`f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465`.

It is stored under `scripts/witness/fixtures`, **not**
`database/migrations`, and must NEVER be executed against installed
Soullab storage as a consequence of this review.

`scripts/witness/ganeshaG2SignedRestoreFixture.mjs` runs the exact SQL
twice against a temporary Docker `postgres:16-alpine` with `--rm`,
`--network none`, no host mounts, no real member records, no production
credentials and no persistent DB. Fictional A/B member, practitioner and Field
rows are seeded. It takes an in-memory pre-deletion `pg_dump` and simulates
a successful deletion of eight A-owned objects **after** the snapshot.

## Content-minimal signed checkpoint and restore

- Generates separate **ephemeral Ed25519 keypairs** for a synthetic Ledger and
  synthetic HEAD in the Node process. These never enter PostgreSQL.
- Signs a content-minimal deletion event identifying exactly eight A-owned
  records across four tables, and separately signs a HEAD committing to the
  Ledger digest and sequence.
- Requires an independently held, pinned archive digest, head digest and
  minimum sequence, a pinned public verification key, authentic signatures,
  complete table/ID coverage, non-duplicate tombstones and correct owner type.
- Six negative inputs are refused **before any restore**: corrupt ledger
  signature, mismatched independent HEAD digest, stale sequence, backup digest
  mismatch, HEAD payload/signature mismatch and omitted deletion target.
- Restores an older raw synthetic snapshot to a separate quarantined database.
  Eight records demonstrably reappear **before** the signed overlay.
- Within a single transaction, rechecks signatures, validates exactly eight
  identity/owner matches, deletes exactly those objects, creates an explicit
  tombstone blocklist and installs database `BEFORE INSERT OR UPDATE`
  triggers refusing future use of tombstoned identities.
- Verifies all eight A records absent; B's four unrelated records retained;
  attempts to reinsert either legacy or member-native A objects are refused;
  an unrelated B insert remains authorized.

Final local execution:

```
PASS S1: exact G2-3A SQL SHA / fixture source population 12 rows across four tables
PASS S2: simulated authorized erasure in fabricated source after snapshot
PASS S3: six tampered, incomplete, unsigned or stale recovery authorities refused before restore
PASS S4: raw pre-deletion fixture snapshot resurrects 8 deleted objects before replay
PASS S5: signed-head-verified overlay deletes all 8 A rows, preserves all four B controls
PASS S6: both legacy and member-owned replay blocked after seal, unrelated member remains writable
SYNTHETIC_G2_3B_PASS (NOT PRODUCTION RESTORE ACCEPTANCE)
PASS CLEANUP: temporary disconnected PostgreSQL container absent
```

## Precisely what this does NOT prove

1. **Independent durable custody:** Signing keys and independent pins exist
   outside the PG backup but in the **same ephemeral Node process**. There is
   no tested HSM, independent attestation service, append-only offsite ledger,
   rollback-proof monotonic register, key rotation or signer separation.
2. **Deletion-grant provenance:** The fixture assumes the A deletion was
   authorized before signing. It does not implement a verified authenticated
   member gesture, atomic outbox, deletion manifest propagation, immutable
   receipts, signed tombstone mint at commit or asynchronous signed witness.
3. **Coverage beyond four tables:** It does not enumerate real archive assets,
   files, attachments, derived AI context, member_field_note_threads,
   House/Dream/Calendar data, session-historical records, every old migration,
   snapshots or other storage locations. It does not erase the restored member
   or practitioner rows themselves.
4. **Production database isolation:** The quarantine exists only inside a
   disconnected fixture; real restore grants, network fences, human one-shot
   execution gestures and fail-closed promotion gates still require acceptance.
5. **Actual installed schema:** The fixture simplifies base table definitions.
   Lock budgets, installed triggers, composite keys, historical IDs, real
   old/new readers and migrations must be individually verified.
6. **Independent security and human acceptance:** No independent human has
   approved this code, G1/G2, or a production deletion-safe restore.

## Next gates (no shortcut)

1. Independent human/source review of exact G2-3B candidate and R20-R2
   vocabulary/identity reconciliation (four Ganesha tables + both owner types).
2. Source- and ledger-admission gate: authenticated deletion gesture,
   transactional durable outbox and separately held signed checkpoint
   high-water with an independent trust anchor and replay-safe recovery grant.
3. Quarantined version-matched actual-schema PostgreSQL rehearsal with
   installed constraints and a deliberately authorized synthetic deletion.
4. Zero-resurrection proof **including** raw backups, all covered assets,
   external stores, composite keys, restoration replays and privacy-safe
   post-restore read paths; refusal on gaps.
5. Human PASS, then an **independent explicit founder decision** to approve
   installed schema or production cutover. No implicit rollout.

**Disposition:** synthetic security mechanism witnessed, production restoration
remains **R20 Grade B / G2-3A REVISE-HOLD**. No production or member-data change.
