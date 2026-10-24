# WS-TIERS-R3 — Restore-safe Pro admission boundary
**22 October 2026 · Class A review-only · NO DEPLOY / NO GRANTS / NO BILLING**

## Why R3 exists

Free + Pro is a product inclusion choice; an author’s writing and core privacy
rights are not purchasable permissions. Complimentary beta Pro is a separate
authorization. The R2 founder-bound, accepted grant can be **restored from an
old database snapshot after revocation**, because PostgreSQL triggers and rows
are restored together. A revoked member could be wrongly shown as Pro if the
system relied only on current `writer_studio_beta_grants` row state.

R3 introduces a stable, immutable `grant_id` in the R2 schema and an explicit
**independent R20 admission prerequisite** in the only Writer Pro product
projection function. The prerequisite is intentionally **UNPROVISIONED**.
Current production-independent source cannot display an ordinary beta member
as Pro until a separately controlled, fresh, verified R20 authority exists.
Founder's separate internal witness basis remains distinct from beta admission.
Operational advanced endpoints are not yet tied to this projection and retain
their existing independent product/source release gates.

## Actual restore witness

In a fictional Docker rehearsal using **two separately running PostgreSQL 16
containers**, all **51** focused integration checks PASSED:

1. PostgreSQL at 127.0.0.1:55439 contained fictional founder, two fictional
   approved writers and one unrelated account.
2. After both grants were accepted, the test took a full `pg_dump` backup of
   the source DB, including the `grant_id`.
3. Writer A's grant was revoked and became ineligible in the current DB.
4. A second PostgreSQL container at 127.0.0.1:55440 stored a deliberately
   separate content-free tombstone against the same `grant_id`.
5. The test restored the PRE-REVOCATION dump into a new database. **That
   database showed writer A's grant as `accepted` again**: a real
   reproduction of the danger.
6. The independently held tombstone still identified the grant as revoked.
   Cross-checking it would correctly refuse renewed Pro.
7. The actual Writer plan resolver currently refuses accepted DB grants
   because `requireIndependentPilotR20Grant` has no trusted authority
   configured; it cannot invent a positive decision.
8. The canary uses a **nonreplenishing `issued_seats` counter**. Eight concurrent
   requests for the same member consume exactly one seat; deleting a revoked
   grant row does not reopen a third place. The counter itself also needs an
   independent R20 high-water witness to survive whole-database rollback.

This test proves a *failure mode and a requirement*, NOT that an independent
production R20 authority is implemented. The second Postgres cluster is a
fictional demonstration, not a signed, append-only, professionally governed
source of truth. Full-service R20 mint/verify, key custody, runtime network,
restore orchestration, denial/expiry, old-image rollback and deletion acceptance
are still held.

## R20 authority protocol for independent implementation

The future R20 service must verify, using a separately held trust anchor:

- **Exact subject and generation:** the verified member UUID and immutable
  `grant_id` match the one offered by the authenticated Writer database read.
  Never authorize merely from an email address, public roster, generic tier,
  UI claim or a client-supplied R20 response.
- **Irreversible revocation:** a member/grant-specific tombstone and monotonic
  checkpoint are kept in an independent backup/security domain. It must survive
  restoring **any** older Soullab database and rollback of application images.
- **Freshness and integrity:** the signed verdict is current within a strict
  published bound; signature/key ID/rotation chain, audience, timestamp,
  sequence, grant ID and denial generation are authenticated. An unsigned,
  stale, contradictory or unavailable verdict is a REFUSAL, not a cached Pro.
- **Safe order of operations:** for revocation, first persist/seal the
  external irreversible tombstone and obtain signed acknowledgement. Only
  then update Writer’s Studio DB. If one side fails, deny access and reconcile.
  Restoring an accepted row must NEVER rewrite or invalidate external R20.
- **Grants also need custody:** new approvals/acceptances must be independently
  admissible and individually audited before Pro is enabled. The service may
  not turn a revoked generation back on or silently consume a third seat.
- **Deletion/ownership:** member data erasure and author-owned Work export
  cannot be blocked by Pro status. Maintain the minimum legally and
  operationally necessary anonymous/content-free revocation marker under a
  documented retention authority; do not preserve manuscript content.
- **Cache and offline:** no stale HTTP/CDN/browser cache may grant Pro. Offline
  Cabin can preserve author-owned drafts and local work without treating an
  old cached Pro flag as renewed server-side access.
- **Private failure feedback:** the public endpoint may report a generic
  “access verification temporarily unavailable.” Never reveal another
  writer's identity, grant ID, private record or contact in responses/logs.

The present `lib/writersStudio/pilotR20Authority.ts` is a *required
integration seam*, not the implementation of that future verifier. Its only
runtime behavior is a static refusal. Do NOT wire a debug flag, localStorage,
a normal same-database `SELECT`, unsigned JSON or a global admin toggle to
override it.

## Further negative cases required before changing this HOLD

- Restore pre-revocation database + old application image; external authority
  must refuse the old accepted grant.
- Restore or disconnect the external authority itself; a stale/forked/signed
  replay must be refused against the recovery/high-water protocol.
- Retry revocation and acceptance concurrently (A/B fictional members) under
  network partition, crashed worker, partial commits and stale sessions.
- Verify author deletion and deletion-safe backup restore, including grant-row
  cleanup and terminal exclusion of the old `grant_id` without obstructing
  member data erasure.
- Prove two initial seats, no recycled revoked seat, old/new schema/read
  compatibility and physical mobile Safari while the current P4R1 Work
  ownership and independent PDF/EPUB/ingestion gates remain unchanged.
- Independent Class A security assessment of signer custody, trust-boundary
  protocol, exact source/image ancestry and founder-owned release decision.

## Test and source evidence

- **51/51 actual fictional PostgreSQL 16 / direct Next handler checks PASS**,
  including real `pg_dump` and `pg_restore` of a pre-revocation snapshot,
  and a separately surviving tombstone.
- **56/56 focused Jest PASS** across nine suites on the uncommitted R3
  candidate at time of witness; R3 schema/restore-run source still requires
  final exact-source post-commit checks.
- Writer-specific TypeScript and lint passed at the time of R3 test update.
- No real identities, invitations, writing, account changes or external
  notification work. Public payment remains disabled.

**Disposition: DRAFT / HOLD. Neither successful test count nor an “accepted”
DB row creates production Pro, source/file permission, or a new beta seat.**
