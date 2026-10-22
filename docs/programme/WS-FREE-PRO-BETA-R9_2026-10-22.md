# Writer’s Studio Free + Pro — R9 closed grant-write bypass and role boundary

**22 October 2026 · Class A review-only · Draft / HOLD · No production mutation**

## Founder product canon — unchanged

Writer’s Studio Free must be genuinely useful on its own. Optional Pro adds
advanced MAIA/editorial depth. **Every individually founder-approved, account-
verified participant in the restricted beta receives the complete currently
approved Pro inclusion free of charge.** Initial cohort: exactly two distinct
verified writers, with a separately governed founder decision before any
larger restricted-group admission.

Neither subscriptions, self-service author rights, the current source-vault
upload pause, PDF/EPUB, or external practitioner records are widened by R9.

## What the exact source audit found

The R7 HTTP routes refused mutations without an independent R20 sealed
receipt; however, `lib/writersStudio/pilotGrantServer.ts` still directly
exported **SQL-bearing** `approvePilotWriter`, `acceptPilotWriter`, and
`revokePilotWriter`. A future internal caller could import these functions
without going through the HTTP check. They used default local
`gen_random_uuid()` for the grant generation, which could not be matched to
the future externally sealed `issued` event required by R8.

The danger is a *code bypass in a review branch*, not evidence of a live
account being admitted. The R20 authority remains unprovisioned.

## R9 implementation

1. **Member-serving module is READ ONLY + DENY.**
   `lib/writersStudio/pilotGrantServer.ts` retains the founder-bound and
   member-accepted **SELECT-only** entitlement candidate. Its three
   backwards-compatible write exports now throw
   `PilotR20AuthorityUnavailable` unconditionally. Neither an env flag,
   valid founder account nor a directly importing server component can
   enable those helpers. All production-facing R7 routes still require
   the unprovisioned R20 mutation seal before reaching the write seam.
2. **The historical SQL is isolated under scripts.**
   `scripts/writers-studio/r9-fixture/fictionalPilotGrantDbModel.ts`
   preserves the old R2/R3 SQL for synthetic invariants only. Every function
   refuses before any SQL unless `DATABASE_URL` matches an explicitly
   supplied `WS_PILOT_TEST_DATABASE_URL` or `WS_R4_MEMBER_DATABASE`,
   the connection is PostgreSQL on **127.0.0.1:55439/postgres** with fictional
   fixture authority, `WRITER_PILOT_GRANT_WRITES_ENABLED=1`, and the
   process is not in production mode. None of the member-facing
   `app/` or `lib/` runtime code imports this model.
3. **Existing proofs use the correct side of the split.** The R2/R3
   disposable SQL/collision/restore witness and the R4/R5 three-authority
   test explicitly import the fictional DB model; they continue to obtain
   read-only member eligibility through the real server read policy.
   Their tests retain real PostgreSQL16 migration/trigger/rollback evidence.
4. **Database-role boundary candidate:** the R9 fixture creates one
   independent disposable PostgreSQL login with **SELECT-only** privileges
   on grants/admission control and ephemeral randomly generated credentials.
   It proves the login cannot insert/update/delete grant rows, alter
   `issued_seats` or founder binding, or elevate itself to the Postgres
   owner. It does **not** change or certify the actual Soullab application
   database credentials. A production owner/superuser would still be able to
   bypass SQL ACLs.

## Verified evidence

- **6/6 R9 direct-write and fixture-guard tests PASS**: real app helpers
  throw with the flag ON, even with a plausible fictional fixture URL; the
  fictional model refuses nonloopback, wrong port, wrong database, mismatched
  environment declaration and absence of fixture authority without touching
  PostgreSQL.
- **67/67 R2/R7 actual PostgreSQL 16 + direct handler/restore checks PASS**,
  with two fictional containers, concurrency, two writer grants, strict
  same-account sessions, old-backup resurrected accepted row and an
  independent tombstone that would refuse that stale entitlement.
- **9/9 separate PostgreSQL SQL-login privilege checks PASS**, including
  reader SELECT and all positive/negative write permission probes.
- **35/35 R4/R5 actual PostgreSQL 16 + signed-rollback/restore checks PASS**
  with three fictional containers: a doubly restored signer pair can still
  emit valid ACTIVE receipts, but a separately trusted checkpoint/epoch
  refuses those restored states.
- The temporary containers ran with Docker `tmpfs` and loopback-only ports
  `55439–55441` and were stopped. No real account, data, cloud resource,
  member message, billing, import, manuscript, or shared Docker storage was
  changed.
- **165/165 R1–R9 focused Jest tests PASS across 18 suites**. Writer
  flagship TypeScript, targeted ESLint and Git source diff checks PASS.
  Sovereignty pre-commit checks and exact commit identity are recorded at
  final R9 source commit.

## Important structural HOLD

**Application-code denial is not a substitute for database privileges.**
The current Writer DB migration is a founder/canary model; the live app may
still use a privileged generic Postgres connection. Therefore no honest claim
can yet be made that an independent service, an irreversible WORM grant log,
a non-rollbackable latest head, or real role-separated production DB identity
is implemented.

Before opening production grant writes, a separate Class A review must prove:

- The *external* R20 current-head/WORM signer durably mints a single grant
  generation ID and content-free `issued` event for the verified member,
  founder, subject commitment and stable operation ID.
- A narrowly privileged and separate mutator receives only **independently
  verified** sealed generation evidence; normal Writer app/read identity
  cannot INSERT/UPDATE/DELETE grant/admission tables, directly call a
  privileged SECURITY DEFINER routine, or impersonate the R20 service.
- The signer, monotonic head and privileged mutation identity cannot be
  forged from a client header, regular server environment flag, mutable DB,
  old app image, restored backup, or a client-supplied trust configuration.
- The R8 26/26 postseal-crash/retry proof is repeated with an actual
  independently operated signer and restored process+DB state. Revocation
  seals independently first and remains terminal after backup restores.
- Current qualified P4R1 authenticated manuscript ownership, real two-writer
  Home → Work → Save → Reopen → Undo, mobile Safari/VoiceOver, R20
  deletion/recovery/Source custody, old/new readers and exact signed image
  receive independent reviews and explicit founder go/no-go.

**Disposition: R9 strengthens internal source boundaries only. This draft PR
must not be merged/deployed as a current Writer image, and no beta user is
admitted or charged by these results.**
