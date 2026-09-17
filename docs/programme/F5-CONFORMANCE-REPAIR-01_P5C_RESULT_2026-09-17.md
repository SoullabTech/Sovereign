# F5-CONFORMANCE-REPAIR-01 · P5-C — LEGACY SOVEREIGNTY RETIREMENT RESULT

**Date:** 2026-09-17
**Parent:** `134f43dca353c4ece29f60899390492dabe306aa`
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5C_FOUNDER_AUTHORIZATION_2026-09-17.md`

```text
P5-C LEGACY RETIREMENT       PASS · CANDIDATE
P3 CLUSTER A                 RETIRED AS AUTHORITY
P4 MUTANT 11                 KILLED · MECHANICALLY GUARDED
CANONICAL ACCOUNT ERASURE    UNCHANGED · FAIL-CLOSED
P5-D ACTIVATION              CLOSED
SCHEMA DEPLOYMENT            NOT AUTHORIZED
PRODUCTION                   UNTOUCHED
```

## 1 · What was retired

The legacy erasure experiment had four coupled executable claims:

1. `POST /api/sovereignty/delete-my-memory` bridged into a standalone Express deletion service;
2. that service could also start independently and owned its own PostgreSQL pool;
3. `/api/sovereignty/my-data-summary/[userId]` returned a static/mock summary advertising deletion
   as available, permanent and immediate;
4. the Lab Tools sovereignty page supplied a hardcoded mock user id, the old public confirmation
   phrase and a destructive button wired to the legacy route.

P5-C retires that whole erasure experience rather than leaving a dormant second authority.

### New standing

```text
/api/sovereignty/delete-my-memory
  → stable HTTP 410
  → accountChanged=false
  → no request identity read
  → no DB/service call
  → no success/queued/completion branch

/api/sovereignty/my-data-summary/[userId]
  → stable HTTP 410
  → no mock member census
  → deletionAvailable=false

services/user-sovereignty/delete-memory-api.js
  → DELETED from executable repository state

app/labtools/sovereignty/page.tsx
  → historical/status-only internal surface
  → no fetch
  → no member id
  → no confirmation phrase
  → no destructive action
```

Git history and the F5 records remain the historical evidence. Retirement does not require executable
legacy code to remain in the current tree.

## 2 · Namespace authority correction

Before P5-C, `/api/sovereignty/*` inherited the rule:

```text
prefix: /api/sovereign
```

because `matchRule()` uses raw `startsWith` prefix matching. The namespace was therefore protected by
lexical coincidence rather than an intentionally declared rule — the exact I-3 failure class.

P5-C adds the more specific rule first:

```text
prefix: /api/sovereignty/
minTier: free
purpose: explicit authenticated edge containment for the legacy namespace
```

This is **access containment only**. It does not confer erasure authority. The retirement handlers
remain 410.

The live `/api/sovereign/*` namespace keeps its original rule unchanged. The unrelated
`/api/sovereignty/notifications` and `/api/sovereignty/tts-monitor` diagnostic siblings remain in the
tree and now inherit an intentional namespace rule rather than the accidental lexical match.

## 3 · Canonical positive controls preserved

The two surfaces P5-D will eventually integrate remain byte-identical to the P5-B parent:

```text
app/api/members/delete-account/route.ts
  git blob 256c8e2bfcd390308ba53458ca30581f109fb7af

components/account/AccountSettings.tsx
  git blob c3d82a4463d24dd7e588dcaabf383af9beabea58
```

The canonical account-deletion route therefore remains in its existing truthful fail-closed posture.
P5-C does not spend activation authority by retiring its legacy competitor.

## 4 · Mechanical retirement guard

New command:

```bash
npm run check:legacy-erasure-retired
```

The guard fails if any of these recur:

- `services/user-sovereignty/delete-memory-api.js` exists again;
- either retirement route stops being a stable 410 tombstone;
- `UserDataSovereignty` or `delete-memory-api.js` returns to the handlers;
- the old `DELETE ALL MY CONSCIOUSNESS DATA` contract returns to executable code;
- a retired handler reports `success: true`;
- the Lab Tools page regains a legacy fetch/mock identity/destructive contract;
- canonical `/api/members/delete-account` references the legacy engine;
- `/api/sovereignty/*` falls back to the `/api/sovereign` lexical prefix again;
- the original `/api/sovereign/*` policy is displaced.

The guard is bound into:

- revision-aware pre-commit;
- `build`;
- `build:docker`;
- `preflight`;
- `ci:sovereignty` / Sovereignty Gate.

P4 mutant 11 is therefore held mechanically, not merely marked complete in prose.

## 5 · Member-identifier log debt shrank

The two retired routes had one raw-member-identifier logging violation each. Removing the execution
paths removed those violations.

The baseline was narrowed surgically:

```text
before    534 violations / 476 identities
after     532 violations / 474 identities
removed   exactly 2
new       0
```

The two removed identities are:

```text
app/api/sovereignty/delete-my-memory/route.ts
app/api/sovereignty/my-data-summary/[userId]/route.ts
```

No unrelated baseline line-number metadata was refreshed or re-blessed.

## 6 · Exact critical candidate custody

| Artifact | Git blob |
|---|---|
| `app/api/sovereignty/delete-my-memory/route.ts` | `3ded1895f25cb63ba32ad82f6e967eee85d0f079` |
| `app/api/sovereignty/my-data-summary/[userId]/route.ts` | `1e7f7270eadd70e2c61ac8e8fe0df46312da2b03` |
| `app/labtools/sovereignty/page.tsx` | `335b95d82ed5de0cdb475c2a909aecd5fef04294` |
| `config/accessMatrix.ts` | `f0f591ce7f5233f79ceafc5be1e53fbe22f07ef4` |
| `scripts/check-legacy-erasure-retired.ts` | `ed5bb440badd3681494e4147487eb41c6bce8b4d` |
| `lib/erasure/__tests__/legacySovereigntyRetirement.test.ts` | `336e4208278c3f81edcfee525313aac9ef5ce6c1` |
| `member-id-log-baseline.json` | `49a26ea4b0385f7a5f6608a0209b582b1eb59a44` |
| `package.json` | `df00714e7f9487cb943853a56432ec442f9a5fc8` |
| `.githooks/pre-commit` | `244f35b8c6665f0463b6c1af9667f9c55eec65b0` |
| `.github/workflows/sovereignty-gate.yml` | `87153fa21fd0af9942fb7ed03e7dd3d4bcfc4474` |
| `F5-CONFORMANCE-REPAIR-01_P5C_FOUNDER_AUTHORIZATION_2026-09-17.md` | `e281f4f1db495c727051d32ada65b61580992cd1` |

`services/user-sovereignty/delete-memory-api.js` is intentionally absent at the candidate state.

## 7 · Evidence

### P5-C focused retirement suite

```text
legacy retirement guard                 PASS
Jest                                     1 / 1 suite PASS
P5-C tests                               9 / 9 PASS
```

The focused suite directly exercises both retirement handlers and proves:

- deletion route 410 / no change;
- summary route 410 / deletion unavailable;
- standalone engine absent;
- old bridge/phrase/mock success absent;
- Lab Tools status-only;
- explicit namespace containment;
- unrelated diagnostic siblings preserved;
- canonical route + Account Settings blobs unchanged;
- no legacy fallback from canonical account deletion.

### Combined F5 implementation suite

```text
P5-A + P5-B + P5-C suites                4 / 4 PASS
combined tests                           39 / 39 PASS
```

### Type health

```text
ship TypeScript diagnostics              229
ship baseline                            239
new ship regressions                       0

scripts diagnostics at P5-B parent        40
scripts diagnostics at P5-C               40
new scripts diagnostics                    0
resolved scripts diagnostics               0
```

The scripts gate remains repository-red on inherited debt; P5-C introduces no script-type
diagnostic.

### Sovereignty aggregate

After the surgical log-baseline shrink:

```text
check:erasure-registry                   PASS
check:legacy-erasure-retired             PASS
check:no-supabase                        PASS
voice provenance / vendor-voice          PASS
provider governance                      PASS
member-id log gate                       PASS · 532 current / 532 baseline · 0 new
voice identity                           29 / 29 PASS
ci:sovereignty                           PASS
```

## 8 · P4 mutant standing after P5-C

| P4 mutant | standing after P5-C |
|---|---|
| 1 unknown-table | **KILLED P5-A** |
| 2 unknown-FK | **KILLED P5-A** |
| 3 Circles-order | **KILLED IN SHADOW P5-B · activation still owed P5-D** |
| 4 manifest-loss | **PARTIAL P5-A · transactional live coupling owed P5-D** |
| 5 owed-custody | **KILLED AT LEDGER LEVEL P5-A** |
| 6 false-success | **LEGACY FALSE-SUCCESS REMOVED P5-C · canonical activated outcome still owed P5-D** |
| 7 silent-409 | **OWED P5-D** |
| 8 lineage-guess | **REFUSED IN SHADOW P5-B · separate lineage lane still required** |
| 9 S5-bypass | **OWED P5-D** |
| 10 positive-control weakening | **PRESERVED** |
| 11 legacy-fallback | **KILLED P5-C + retirement guard** |
| 12 history-rewrite | **KILLED AT LEDGER LEVEL P5-A** |

## 9 · Containment / not authorized

P5-C performs no:

- canonical account-erasure activation;
- Account Settings result rendering change;
- Circle deletion execution change;
- S5 manifest/tombstone integration;
- registry activation;
- schema migration change or deployment;
- legacy-table cleanup;
- historical production incident adjudication;
- production read or write.

```text
P5-A SUBSTRATE / REGISTRY       COMPLETE
P5-B SHADOW PLAN / ADAPTERS     COMPLETE
P5-C LEGACY RETIREMENT          COMPLETE · CANDIDATE

P5-D ROUTE / CLIENT / S5        CLOSED · NEW FOUNDER ACT REQUIRED
P5-E PRODUCTION WITNESS         CLOSED
SCHEMA DEPLOYMENT               NOT AUTHORIZED
CANONICAL MERGE                 NOT TAKEN
PRODUCTION                      UNTOUCHED
```

**NEXT EXACT ACT after P5-C commit/review: founder authorization, return, or rejection of P5-D
activation design/implementation.** P5-D is the first gate allowed to change canonical account-erasure
execution/member-visible outcomes and integrate S5 anti-resurrection evidence.
