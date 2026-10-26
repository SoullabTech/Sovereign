# Writer’s Studio Free + Pro — R10 least-privilege mutation-service boundary

**22 October 2026 · Class A research candidate · DRAFT/HOLD · NO PRODUCTION CHANGE**

## Founder-approved product contract (unchanged)

Writer’s Studio Free remains meaningful on its own: author-owned drafting,
essential MAIA/Develop/Write/Review, foundational Inspiration Compass/Academy,
privacy, deletion, and essential safe export are not subject to a paid toll.
Optional Pro offers deeper editorial/MAIA craft and publish preparation.
**Every individually founder-approved, account-verified member of the limited
Writer beta will receive every currently approved Pro feature free of charge**.
The first canary is exactly **two distinct verified writer accounts**.
No public enrollment, time-limited trial, paid billing, grant activation, or
lifting of Source/PDF/EPUB security holds is authorized here.

## Problem carried forward from R9

R9 removed three direct SQL write methods from the application-facing grant
module, preserving them only in disposable fictional scripts. That closes an
import-level bypass but does NOT establish the permissions of a real application
database login or an independent mutation service. A generic owner-capable
connection can bypass application middleware or manually insert/edit rows,
including on a restored PostgreSQL backup.

R10 qualifies a *least-privilege database interface* separately from R20
signing, using PostgreSQL 16 and synthetic members only.

## Exact R10 research source

- `scripts/writers-studio/r10-fixture/pilotRoleContract.sql`
- `scripts/writers-studio/r10-fixture/pilotR10RoleContractProof.ts`
- `lib/writersStudio/__tests__/pilotR10RoleBoundary.test.ts`

All R10 SQL is under **scripts**, not `database/migrations/`. It is NOT
auto-applied by the production deploy system, and no operating DB role is
created outside the disposable PostgreSQL witness.

The fixture establishes **two distinct authenticated SQL logins**:

1. **Ordinary Writer app reader:** SELECT permission on the fictional grants
   and two-seat admission tables, but **no raw INSERT/UPDATE/DELETE** on them,
   no permission to change the founder binding or issued-seat counter, and
   no EXECUTE privilege on the mutation function or role escalation.
2. **Independent mutation-service login:** EXECUTE permission on one narrow
   `public.writer_r10_fixture_apply_event` function and **no direct SELECT,
   INSERT, UPDATE or DELETE** against the grant, admission or mutation-log
   tables; no member/CRM reads, schema CREATE privileges, or role escalation.

The guarded SQL function is `SECURITY DEFINER` with an explicit locked-down
search path, schema-qualified object references, and a revoked **PUBLIC
EXECUTE** default. It serializes initial-canary decisions, requires an
already founder-bound exact authority, accepts a **caller-supplied canonical
grant ID** (rather than minting one in SQL), records operation-ID idempotency
in the same database transaction, and enforces `issued → accepted → revoked`
plus irreversible two-seat exclusion. Old issue/accept operation IDs cannot
be replayed after a later terminal revoke, including after the revoked grant
row is deleted.

The witness itself refuses any database besides a newly empty PostgreSQL 16
container with the exact ephemeral name, `postgres:16` image, Docker
`tmpfs` database/backup mounts, and loopback port
`127.0.0.1:55439/postgres`. Role passwords are randomly generated inside
the test process and are never checked into the repository.

## Actual verification evidence

- **60/60 R10 real fictional PostgreSQL 16 role/transaction checks PASS.**
  These test session identities, denied raw SQL, denied function EXECUTE for
  ordinary readers, denied table SELECT/DML/schema modification for the
  mutation login, role non-escalation, and SQL function ownership/EXECUTE
  restrictions. Positive and negative cases exercise founder-approved A/B
  UUIDs, eight simultaneous attempts for one writer, safe identical retries,
  writer-owned acceptance, unrelated writer isolation, terminal revocation,
  old operation-ID replay refusal, local grant-row cleanup and two-seat
  permanence. The witness validates the exact fixed Docker container's
  image, loopback host port and memory-backed database storage.
  Its explicit negative case also proves that stolen mutation-service
  credentials can authorize an invented event without external R20 proof;
  the demonstration was rolled back.
- **9/9 R10 static source-regression cases PASS**, including no application
  SQL-bearing grant exports, fixture placement rather than auto-migrations,
  explicit SECURITY DEFINER search path, PUBLIC EXECUTE revocation and
  pinned fixture ownership.
- **174/174 R1–R10 focused Jest tests PASS across 19 suites.**
  Writer-specific flagship TypeScript, targeted ESLint and source-diff
  whitespace checks PASS. The final sovereignty pre-commit checks and exact
  source commit are reported by the associated draft PR.
  All Docker witnesses were synthetic, memory-backed, loopback-bound,
  and stopped.

## Intentionally demonstrated negative control

**This design is still not production-authorized.** The R10 test explicitly
proved that a compromised mutation-service SQL credential could itself call
the guarded function with an invented `issued` event and get a successful
database mutation **without any genuine external R20 signature**. That
fictional negative test ran inside a SQL transaction that was rolled back;
it consumed no seat and did not alter durable state.

Thus, keeping the member-facing Writer database user read-only is important
but **insufficient**. The mutation-service credential must be held by a
separate, independently reviewed R20 signer/verifier under controls that
prevent its use by a normal web process, direct client request, restored
application image or malicious internal caller. An actual signer-service
protocol must verify the **current immutable WORM head, correct member,
generation, subject, operation ID, short-lived proof and terminal revocation**
before accessing this SQL role. The current service does not exist.

Further limitations:

- The fictional ordinary-reader SQL role can SELECT the entire pilot grant
  table. Production must independently prove owner/session-scoped
  projections and avoid exposing a private beta roster or other writers'
  account identifiers. Read-only is not automatically member-private.
- A PostgreSQL table owner or superuser still has authority to bypass
  the tested grants. Production database identity, administrative recovery
  powers, backups, signer separation and nonrollbackable revocation truth
  remain separately unqualified.
- The R10 operation log is an ordinary PostgreSQL table; it is not WORM,
  does not survive arbitrary database rollback independently, and is not a
  substitute for R5 signed checkpoints or R6 externally anchored event
  history.
- The R10 SQL service function is a **synthetic acceptance contract only**;
  no current P4R1 route imports it, and the production
  `pilotR20Authority.ts` continues refusing all beta grant reads/writes
  pending independent service provisioning and Class A review.

## Remaining mandatory gates

The next production candidate must join:
independently protected R20 signing and trusted-latest WORM checkpoint;
separate credential/key custody; externally sealed grant-generation UUID and
idempotent crash/restore reconciliation; per-member authenticated Work
ownership; latest qualified P4R1 source; two-real-writer sign-in/Save/reopen;
physical Safari/VoiceOver; R20 original-file and deletion-safe backup gates;
independent Class A reviewer; and founder exact-source release decision.

The R9 application-server no-direct-SQL refusal and the temporary
founder-approved upload/retention protections must stay intact throughout.

**Disposition: R10 is a bounded fictional authorization-layer test, not
production permission. No live DB role, member approval, subscription,
invitation, manuscript or cloud service was changed.**
