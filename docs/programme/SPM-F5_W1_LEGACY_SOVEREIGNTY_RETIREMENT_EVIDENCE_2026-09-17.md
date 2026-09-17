# SPM-F5 W1 — Legacy Sovereignty Retirement Evidence — 2026-09-17

**Standing:** W1 IMPLEMENTED · PROVED IN NON-PRODUCTION · P7 R1 RE-ADJUDICATION EVIDENCE

## Authority

- Governing law: `SPM-FC-01`
- Governing contract blob: `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`
- Ratified conformance commit: `bbb1672d5e454f1f9051bdca76b8f71e681e88d8`
- P4 falsification commit: `c7075abc50bcc7ece0f6e32df6e9b9c648c7c005`
- Founder grant: `GRANT W1 — S1 LEGACY SOVEREIGNTY RETIREMENT ONLY`
- W1 implementation commit: `13fcbc049a4f8c8c1e4d2908fa3e3c3832804bb0`
- Branch: `fix/spm-f5-w1-legacy-sovereignty-retirement-20260917`

W1 changes no schema, migration, production data, modern account-deletion logic, deployment configuration, or any later F5 repair wave.

## Implemented scope

Exactly six implementation/test files changed:

1. `app/api/sovereignty/delete-my-memory/route.ts`
2. `app/api/sovereignty/my-data-summary/[userId]/route.ts`
3. `app/labtools/sovereignty/page.tsx`
4. `config/accessMatrix.ts`
5. `services/user-sovereignty/delete-memory-api.js`
6. `app/api/sovereignty/__tests__/legacyRetirement.test.ts`

Implementation diff: **285 insertions / 820 deletions**.
## Observable retirement behavior

### Next deletion route

`POST /api/sovereignty/delete-my-memory` is a 410 retirement tombstone.

It:
- does not parse a caller-selected subject;
- does not accept or inspect a confirmation phrase;
- imports no database or legacy deletion service;
- performs no queue operation;
- performs no deletion;
- returns `accountChanged: false`;
- directs the caller to current account settings.

### Next legacy summary route

`GET /api/sovereignty/my-data-summary/[userId]` is a 410 retirement tombstone.

It:
- does not read the path identity;
- does not read a database;
- does not fabricate counts;
- does not echo a subject id;
- makes no deletion-availability, permanence, immediacy, or completeness claim.

### Lab Tools surface

`/labtools/sovereignty` is now a static retirement notice.

The hardcoded `demo_user_001`, destructive confirmation phrase, delete action, fake data summary, completion screen, and all-system deletion claims are absent.
### Standalone legacy service

The standalone service remains in source only because W1 did not authorize unrelated `pause-learning` redesign.

Its two R1 handlers now fail before PostgreSQL access:

- `deleteUserMemory` → 410 / `success:false` / `accountChanged:false`
- `getDataSummary` → 410 / no user-id echo

All five former legacy destructive `DELETE FROM` statements and the deletion-log write were removed from the service.

### Explicit route authority

The prior lexical-authority defect is removed.

`config/accessMatrix.ts` now declares:

- an exact rule for `/api/sovereignty/delete-my-memory`;
- a narrower prefix for `/api/sovereignty/my-data-summary/`.

Both are ordered so neither route obtains access classification merely because the word `sovereignty` begins with `sovereign`.

The effective authenticated/free posture is preserved; only the source of authority changes from accidental lexical inheritance to explicit declaration.
## Standalone-service reachability witness

Before claiming W1 retirement, the authorized Mac Studio was checked for independent service reachability.

Observed:
- no listener on default port 3011;
- no legacy delete-memory/user-sovereignty process;
- no Docker container exposing the service;
- no repository Docker/package/PM2/deployment launcher for `delete-memory-api.js` was located.

W1 additionally contains the service itself, so independent manual launch from the changed code cannot revive destructive behavior.

A non-production HTTP witness launched the service on isolated local port **39111** and called both retired endpoints:

```text
POST /api/sovereignty/delete-my-memory
→ HTTP 410
→ success: false
→ error: legacy_sovereignty_retired
→ accountChanged: false

GET /api/sovereignty/my-data-summary/victim
→ HTTP 410
→ error: legacy_sovereignty_retired
→ accountChanged: false
→ caller-selected id not echoed
```

No production environment or production database was read or mutated by this witness.
## Regression evidence

Targeted Jest evidence:

```text
app/api/sovereignty/__tests__/legacyRetirement.test.ts
lib/auth/__tests__/accountDeletionHonesty.test.ts

Test Suites: 2 passed / 2
Tests:       22 passed / 22
```

The W1 suite proves:
- both Next retirement routes return 410;
- neither Next route has a database/destructive-service dependency;
- the legacy summary does not read/echo a caller-selected id;
- both retired standalone handlers make zero PostgreSQL calls;
- explicit access classification defeats lexical `/api/sovereign` inheritance;
- the Lab Tools page cannot call the old routes;
- `demo_user_001`, the old confirmation phrase, and old completion/promissory claims are absent.

The existing modern account-deletion honesty suite also remained green.
## Repository / governance gates

All run against the W1 working tree before commit:

```text
git diff --check                 PASS
check:no-supabase                PASS
check:no-openai                  PASS
check:no-direct-anthropic        PASS
check:phi-gate                   PASS
check:design-canon               PASS
TypeScript no-regression         PASS
```

TypeScript no-regression result:

```text
program files   4369
errors          229
baseline        239
regressions       0
net fixed        10
```

The repository pre-commit sovereignty checks also passed on the committed W1 diff.

## Negative source sweeps

Across the retired W1 surfaces, source search found no executable occurrence of:

- `demo_user_001`;
- `DELETE ALL MY CONSCIOUSNESS DATA`;
- `deletion_available`;
- `deletion_permanent`;
- `deletion_immediate`;
- false `processed successfully` / queue claims;
- legacy complete/permanent consciousness-deletion claims.

The old phrases remain only where the regression test asserts their absence.

No legacy destructive SQL remains in the W1 sovereignty corridor.
## Explicit non-actions

W1 did **not**:
- modify `app/api/members/delete-account/route.ts`;
- create a replacement deletion architecture;
- add or alter schema;
- add or run a migration;
- read production member data;
- delete a real member;
- perform a production database operation;
- deploy;
- merge to canonical;
- open W2 or any later repair wave.

## Evidence verdict

All seven founder-grant evidence conditions are discharged for the changed source tree at:

`13fcbc049a4f8c8c1e4d2908fa3e3c3832804bb0`.

This record is evidence for P7 re-adjudication only. Passing W1 does not imply full account erasure exists; RC-3/S3 remains a separate unresolved programme.
