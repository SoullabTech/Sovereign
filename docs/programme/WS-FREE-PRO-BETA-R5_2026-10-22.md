# Writer’s Studio Free + Pro — R5 independent checkpoint contract
**22 October 2026 · Research-only · Class A review candidate · HOLD**

## Why this exists

The user-facing contract is unchanged: **Free** preserves a real writing practice,
Inspiration Compass and foundational Writer Academy/MAIA, while **Pro** provides
deeper editorial intelligence. Every individually admitted Writer’s Studio beta
member receives full *currently approved* Pro inclusion without charge.

The key safety requirement is that restoring old Soullab and authorization
databases must not reactivate a revoked member grant.

R3 demonstrated an actual PostgreSQL restore resurrecting an accepted grant.
R4 extended this with a genuine three-database fictional rehearsal and found:

- The Writer database can restore the old acceptance.
- One authority rolling back is refused by the second current authority.
- **Both independent signer databases rolling back** can still produce fresh,
  cryptographically valid ACTIVE receipts for a revoked grant.
- A separately held monotonic revocation high-water epoch would refuse them.

This finding rules out the assumption that two ordinary databases plus two
signatures constitute durable anti-resurrection.

## New R5 implementation — signed checkpoint verification contract

The bounded source addition is:

- `lib/writersStudio/pilotR20CheckpointProtocol.ts`
- `lib/writersStudio/__tests__/pilotR20CheckpointProtocol.test.ts`

A third, independently pinned **Ed25519 signing identity** produces a
short-lived signed attestation over exact member and grant UUIDs, an
unpredictable per-request nonce, two minimum allowed signer epochs, a
monotonic checkpoint sequence, issuer/key identity, audience and lifetime.

The verifier:

1. Verifies checkpoint signature, exact fields, correct grant/member,
   audience and live nonce, expiry and sequence floor.
2. Ensures all three issuer identities, key IDs and **normalized SPKI
   public-key bytes** are distinct. Merely renaming a reused key does not
   create an independent authority.
3. Requires checkpoint state ACTIVE. Missing, revoked, absent, malformed,
   stale and contradictory checkpoints always refuse.
4. Passes the independently signed signer-epoch floors into the pre-existing
   dual-signature verifier. Two older ACTIVE signer receipts cannot defeat a
   checkpoint that has recorded newer revocation epochs.
5. Fails closed with a content-free generic error when any check fails.

**The checkpoint's minimumSequence and keypin must be independently trusted.**
No claim can be made about anti-rollback if the caller gets either from the
restorable member database. A signature proves origin and integrity, not that
an old but authentic checkpoint represents the latest truth.

### What remains not implemented

The R5 verifier does **not** provide the trusted checkpoint service itself.
It contains no provisioned key, HSM, external WORM repository, custody
authority, network endpoint, enrollment command, public API route or
authorization bypass.

**Production `lib/writersStudio/pilotR20Authority.ts` still throws an
unavailable/refusal error.** No beta writer gets real Pro solely because
three fictional signatures can be validated in a unit test.

## Evidence and limitations

- **R4 three-database real PostgreSQL 16 fixture: 29/29 PASS**, including
  three actual pre-revocation `pg_dump` snapshots, `pg_restore`, distinct
  fictional writers, signers, single-signature rollback and double-signer
  rollback negative control. The Docker test containers were stopped.
- **R5 signed-checkpoint tests: 15/15 PASS**, including healthy triple
  authorization, revoked checkpoint, old epochs, wrong member/grant, replay,
  expiry, forged signer, same-key-as-signer alias and malformed signed claims.
- **R1–R5 focused suite: 95/95 PASS across 11 Jest suites**. R5 targeted
  Writer TypeScript and lint checks passed. Sovereignty pre-commit checks
  and the exact source SHA are recorded by the ensuing review-only Git commit
  and draft PR.
- Tests use process-local ephemeral Ed25519 keys and fictional UUIDs only.
- **R5 enhanced three-database PostgreSQL 16 integration: 35/35 PASS** on
  exact R5 source `3cc858721c17a6231446b34a69d4208a3e25288c`. Tests
  exercised healthy triple-signature decisions for fictional writers A and B,
  revoked checkpoints, restored historical member-grant rows, one/both signer
  rollbacks, checkpoint epoch floors and minimum checkpoint sequence.
  Each database used a fresh, isolated `postgres:16` container with its
  database files and `pg_dump` archives on Docker **tmpfs (memory)**, bound
  only to loopback ports 55439–55441. The three containers were stopped.
  The temporary fixtures did not require Docker image/volume pruning, and
  did not touch production or unrelated workstream storage.
  A previous attempt had exited with Docker-internal `No space left on
  device` while creating `pg_wal`; this did not indicate a product
  authorization failure. The test script retains a 6 GiB host-disk minimum.
- The R5 35/35 integration proof demonstrates protocol correctness and a
  rollback counterexample in a fictional environment, **not** actual
  independent WORM retention, signed trusted-latest attestation, or
  production key custody. Even three ordinary signing databases can be
  simultaneously restored; a separately governed nonrollbackable
  high-water trust anchor remains mandatory.

## Concrete production R20 checkpoint requirements

The next release candidate must independently attest:

- **Immutable retention:** a nonrewritable history of grant activations,
  revocations and monotonic checkpoint sequence, accessible independently of
  all member databases and their application-image restoration.
- **Key custody:** signer keys cannot be loaded from the Soullab DB, its
  dumps, user sessions, application environment or ordinary host backups.
  Separate authorized signers, hardware isolation and key-rotation/retirement
  must be reviewed.
- **Latest-truth availability:** on every sensitive Pro operation the
  trusted verifier requests fresh evidence from the current checkpoint
  authority, not a prior signed token or client-supplied `minimumSequence`.
  Missing/partitioned/unavailable state refuses.
- **Revocation order:** independently append and seal a revocation first,
  receive a signed acknowledgement, then update the Writer grant. If only
  one side completes, access remains denied until reconciliation.
- **Monotonic recovery:** replaying older Writer, signer and checkpoint
  database snapshots, restoring old application images, rotating signing
  keys, or rolling back only the client cannot lower trusted epochs.
- **Two-seat first canary:** initial cohort count persists externally and
  cannot recycle a seat after revocation, deletion or backup restore without
  an explicit, separately reviewed founder authorization.
- **Erasure/privacy:** retain only the minimum revocation metadata supported
  by an explicit legal and governance basis; never place writing, contacts,
  manuscript filenames or email addresses in checkpoint receipts.
- **Writer rights:** cancellation, downgrade and expiry must never erase
  author-owned text or restrict consent, core privacy, safe essential export,
  or deletion; advanced operations remain independently authenticated and
  scoped to the owner's Work.
- **Acceptance:** independent Class A review, production-image ancestry and
  rollback verification, two-fictional-writer HTTP session isolation, lost
  authority and wrong-credential negative cases, physical Safari/VoiceOver,
  then an exact-source founder release decision.

Potential independent storage technologies must be evaluated against these
requirements; using a third ordinary PostgreSQL server is insufficient.
The R5 rehearsal is reproducible with three clean, dedicated PostgreSQL 16
fixtures bound only to loopback ports 55439–55441 and at least 6 GiB of
host-disk safety margin. Docker's internal disk may be full despite ample
host-disk space; ephemeral `--tmpfs /var/lib/postgresql/data` and
`--tmpfs /tmp` mounts allow the original fixed-name fixture to execute
without consuming or deleting shared Docker image/volume storage. For
future runs, confirm that each database is freshly empty, bound to the
correct container and entirely fictional. Never reuse production DBs or
prune unrelated Docker workstreams.
No external resources, paid cloud services or secrets are being provisioned
by this R5 candidate.

## Product handoff

Keep one unified Writer’s Studio, not another parallel application.
The current qualified P4R1 release owner should separately port the admitted
Free/Pro inclusion and verified, approved beta authority onto the current
source, while keeping the Inspiration Compass / foundational Academy in Free.
Production enrollment, billing, R20 authorizations, original-file ingestion,
member PDF/EPUB and publisher submission remain held pending their own gates.

**Disposition: review-only, not authorized for merge, migration, emails,
member grants, subscriptions or deployment.**
