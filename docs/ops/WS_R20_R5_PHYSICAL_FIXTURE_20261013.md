# Writer’s Studio R20-R5 — real PostgreSQL / Source recovery, fictional-data qualification

**Date:** October 13, 2026 (Eastern)
**Class:** Class A candidate evidence — source custody, deletion and recovery
**Branch:** `fix/r20-r5-real-postgres-paired-fixture-20261013`
**Base:** R20-R4 local protected-signer fixture commit `d1d99848d1cc48f116ecff21e0e4bbb4bb526392`
**Status:** Isolated engineering PASS. Real member vault restore and beta deployment **HOLD**.

## Why this exists

R3J's paired Source verification was an in-memory fictional object test. R4's signer
bridge was a physically non-independent, fictional signing process. This R5
candidate proves that **actual PostgreSQL dump/restore** and **actual original
Source filesystem bytes** can be checked against the existing independently
signed *fictional* deletion and consistency contract.

It is a concrete integration test, **not** a production backup writer, key
custodian, erasure implementation, or promotion mechanism.

## Bounded procedure (fixed sources only)

- Requires exact explicit `R20_R5_FIXTURE_ACK=RUN_FICTIONAL_NETWORKLESS_POSTGRES_ONLY`.
  Without it the test **SKIPS** before Docker access so ordinary broader R20 test runs remain unaffected (not a PASS witness).
- Starts two uniquely named `postgres:16-alpine` Docker containers with
  `--network none`, **no external ports**, **no host/user/data volume mounts**,
  bounded CPU/memory/PIDs, and **tmpfs database storage**.
- Seeds hardcoded fictional Work, sources and generation/fence metadata.
  Captures PostgreSQL custom-format dump **in memory** and pairs with
  bytes of two synthetic original files.
- Writes only locally encrypted **AES-256-GCM fictional packet** to a
  private temporary directory; an ephemeral key exists only in the test
  process (not a real custody or recovery key).
- Decrypts the packet, restores PostgreSQL into a second disposable container,
  restores the fictional original files to a separate temporary directory,
  rereads **restored DB rows and restored Source bytes**, and submits the
  result to R3J's three-role signed fictional deletion authority checker.
- Does not read or alter live PostgreSQL, Docker Source volume, member content,
  remote backup, NAS, LaCie, Lexar, private recovery keys or production settings.
- On termination removes the **two exact test containers**, private temporary
  data and signing fixtures. No container, source or key artifacts are installed.

## Final witnessed test outcome

Command (from isolated checkout):

`R20_R5_FIXTURE_ACK=RUN_FICTIONAL_NETWORKLESS_POSTGRES_ONLY node --test tests/constitutional/r20-r2/r5-physical-postgres-source-recovery.test.mjs`

**Result: 9/9 PASS, zero failures.** Verification includes:
- exact DB and original Source round trip with signed fictional deletion
  checkpoint and no promotion permission;
- wrong encryption key and corrupted ciphertext rejected;
- missing original file rejected;
- unregistered/orphan file rejected;
- changed original bytes rejected;
- mutated source-hash **inside the restored PostgreSQL database** rejected;
- mismatched DB/source snapshot generation fence rejected;
- a declared historical reconstructive plaintext backup forces refusal.

The explicit no-ack negative test was **SKIPPED** before any Docker operation; a skipped test is never counted as a recovery PASS.
Post-test `docker ps -a --filter label=life.soullab.r20.fixture=fictional-only`
returned **zero** fixture containers. No production data was examined.

Local test receipt:
`/tmp/r20-r5-physical-witness-20261013-final.log`

## What this cannot establish

1. No **current live Source vault** or entire member database has been captured,
   compared or recovered; the older 2-file archive is still partial.
2. A fictional `legacyReconstructiveCopies: 0` assertion is **not** an
   inventory of historic local SQL, NAS/recycled SQL, offsite copies or snapshots.
3. Neither a transactionally atomic real PostgreSQL+Source capture nor
   concurrent deletion-versus-restore publication has been implemented here.
4. Durable per-Work keys, encryption-before-WAL/Source/derived writes,
   irreversible all-replica deletion and a physically separately administered
   R20 signer/high-water authority remain outstanding.
5. Fixture ephemeral AES encryption cannot replace verified real GPG recovery
   credentials, independent key custody, human authorization or NAS ACL.
6. A passing fixture does not establish an immutable reviewed release image,
   restore of Jondi's Work, iOS voice, or access approval for the first two writers.

## The next production-shaped engineering gate

Review the actual production Source/SQL/derivative and archived-copy census
**metadata only**, adjudicate the two unexplained Source files and historical
plaintext archive/Recycle Bin policy without erasure, select physically separate
monotonic signing/key retirement authority, then build and independently
review a **default-deny, consented, coherent, encrypted real data capture and
disposable restore** plan. Its execution must receive distinct founder
authorization; this R5 test grants none.

Related: [#1788](https://github.com/SoullabTech/Sovereign/issues/1788),
[#1793](https://github.com/SoullabTech/Sovereign/issues/1793),
[Writer’s Studio small test group #1800](https://github.com/SoullabTech/Sovereign/issues/1800).
