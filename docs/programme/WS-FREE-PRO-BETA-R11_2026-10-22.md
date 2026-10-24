# Writer’s Studio Free + Pro — R11 proof-bound mutation SQL

**22 October 2026 · Class A review-only fixture · Production HOLD**

## Founder inclusion policy

Writer’s Studio Free remains meaningful, with author-owned writing, privacy,
safe deletion/export and foundational Inspiration Compass/Academy. Optional Pro
adds deeper MAIA and editorial craft. **Every individually founder-approved,
account-verified restricted beta writer receives the complete currently
approved Pro experience free of charge.** The first canary is two distinct
verified writers, with expansion subject to separate founder review. No public
enrollment, payment, new Source ingest, member PDF/EPUB or independent R20
deployment is authorized by R11.

## R10 verified a credential theft gap

R10 separated an ordinary Writer SQL reader from a privileged mutation-only
SQL login. The actual PostgreSQL 16 negative control showed that **someone
holding only that mutation-login credential** could call the guarded function
with an invented `issued` event; PostgreSQL did not know whether the event
had been sealed by an independent authority.

R11 tests a second bound proof requirement, without claiming the actual
independent authority exists.

## R11 source and design

- `scripts/writers-studio/r11-fixture/pilotSealedMutationContract.sql`
- `scripts/writers-studio/r11-fixture/pilotR11SealedRoleProof.ts`
- `lib/writersStudio/__tests__/pilotR11MutationProofBoundary.test.ts`

These are **disposable test-only artifacts**. No `database/migrations` entry,
production API import, real service role, live key or cloud infrastructure is
introduced.

A separate synthetic Node signer creates a 256-bit random test secret in
process memory. The fresh PostgreSQL fixture stores a matching verification
copy in a restricted private schema readable only by the fixture DB owner.
An R11 `SECURITY DEFINER` function checks a `pgcrypto` HMAC-SHA256 of a
fixed, domain-separated, canonically ordered payload:

`operationId | action | memberId | actorId | grantId | eventSequence | issuedAtMs | expiresAtMs`

before making *any* local grant or canary-seat change. The proof is bound to
the exact five identity/action fields, the expected next operation sequence
and a short lifetime (maximum 30 seconds). The function retains R10's
serialized two-seat counter and terminal `issued → accepted → revoked`
transitions. Already consumed operation IDs are bound to their exact signed
generation and cannot reopen a later revoked grant.

The ordinary Writer reader and the mutator do not have SELECT privilege on
the verification secret. The function explicitly removes the default
PUBLIC EXECUTE privilege, uses a pinned `SECURITY DEFINER` search path with
`pg_temp` last, and exposes no direct table DML to either login.

### Real test results

- **77/77 actual fictional PostgreSQL 16 role, proof and transaction checks
  PASS.** Tested independent readers/mutators; denied raw DML, role elevation
  and verification-secret access; denied forged grant mutation by a stolen
  mutator login; tampered member, actor, action, operation ID, grant ID,
  sequence and timestamps; malformed MAC, expired/future proofs; even a
  correctly signed but out-of-order sequence; eight concurrent same-operation
  retries; stable two-grant identities; writer-owned acceptance, terminal
  revocation, author separation, row cleanup and nonreplenishing seats.
- **12/12 R11 static source regressions PASS** (exact test-only placement,
  proof-first ordering, signer key secrecy checks, Public EXECUTE revocation,
  search-path control, canonical operation fields and hold invariants).
- **186/186 R1–R11 focused Jest tests PASS across 20 suites**, including
  the 12/12 R11 source guards and all earlier Free/Pro/R20 authorization
  regressions. Writer flagship TypeScript, targeted ESLint and diff checks
  PASS. Sovereignty pre-commit and exact Git source are reported at commit.
- All membership UUIDs and signer bytes were synthetic. PostgreSQL ran in
  the exact verified `postgres:16` Docker container using memory-backed
  database and temporary storage, bound only to `127.0.0.1:55439`, and
  was stopped. No real members or manuscripts were accessed.

PostgreSQL 16 documents `pgcrypto.hmac()` and the importance of locked-down
`SECURITY DEFINER` search paths and function EXECUTE grants:

- https://www.postgresql.org/docs/16/pgcrypto.html
- https://www.postgresql.org/docs/16/sql-createfunction.html

## Deliberately preserved security limitations

**A valid MAC is not proof that an event is current or durable.**

1. **The fixture HMAC key is held inside the restorable PostgreSQL database.**
   The test explicitly proves the fixture database owner CAN read it. Restoring
   that key together with an old grant database cannot establish independent
   WORM revocation authority. A compromised owner or stolen backup can forge
   proofs. This design must not be copied directly into production.
2. The SQL function verifies a test HMAC, **not a real externally governed
   Ed25519/WORM head**. No independent signer keyring, monotonic checkpoint,
   antirollback archive, hardware custody, recovery key rotation or
   cross-process idempotency authority exists yet.
3. The HMAC field is compared within SQL and is not claimed to implement a
   formally constant-time verification primitive; timing risks and transport
   confidentiality need independent Class A assessment.
4. The synthetic Node signer can issue a proof on request because it is a
   fixture. No real founder-account authentication, writer consent or
   author-owned Work permission is implemented by this R11 function.
5. A captured **valid unexpired bearer proof** could still be replayed
   before expiry. Local operation idempotency limits repeated effects but
   does not replace authenticated channel binding and independent online
   admission authority.
6. The normal app's read-only SQL permissions do not automatically enforce
   member-private projections of the invitation roster.
7. The entire R11 contract lives under `scripts/writers-studio/r11-fixture`;
   it is not installed in production. The real
   `lib/writersStudio/pilotR20Authority.ts` remains unprovisioned and
   fail-closed; no ordinary API can issue beta Pro via R11.

### Next true release dependency

The existing R5/R6 requirement remains: a **separately administered,
antirollback latest WORM checkpoint and signer**, with independent key/role
custody. The R8 seal-before-mutation choreography and R10 narrowly privileged
SQL function should be joined only once a trusted, nonrestorable source
supplies a current grant proof to a separately authorized mutator.

Then the qualified *current* Writer P4R1 lineage must prove exact
authenticated first-day Work editing, writer ownership, Save/reopen/Undo,
mobile Safari/VoiceOver, R20 original-file/deletion-safe restore gates, and an
explicit founder exact-image go/no-go. The R1–R11 research branch is **not**
a full replacement production Studio.

**Disposition: R11 review-only / HOLD. No real beta grants, subscriptions,
manuscript operations, protected backups or production services were changed.**
