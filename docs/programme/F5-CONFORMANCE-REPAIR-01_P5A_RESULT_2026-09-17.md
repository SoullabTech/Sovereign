# F5-CONFORMANCE-REPAIR-01 · P5-A — SUBSTRATE / REGISTRY RESULT

**Date:** 2026-09-17

```text
AUTHORITY                 P5-A founder authorization · this branch
P4 SELECTED ARCHITECTURE  54e5cb202fe72fb0009e893eb1f3ed2104d1af95
MODE                      SOURCE / SCHEMA CANDIDATE · NO DEPLOYMENT

LEDGER SUBSTRATE          IMPLEMENTED · CANDIDATE ONLY
COVERAGE REGISTRY         IMPLEMENTED · coverage-only · activation prohibited
DRIFT GUARD               IMPLEMENTED · pre-commit + build + CI bound
ROUTE / CLIENT BEHAVIOR   UNCHANGED
PRODUCTION                UNTOUCHED
```

## 1 · Exact candidate custody

| Artifact | Git blob |
|---|---|
| `database/migrations/20260917000001_account_erasure_ledger.sql` | `c39997c0ff7e20145b468e048183a558986a8ddf` |
| `config/governance/account-erasure-registry.v1.json` | `d365ae1231ffb5c9c8b5763d4f5d4737fbc8cc8c` |
| `scripts/check-account-erasure-registry.ts` | `d97ab5f252875779690e6a0e1794b7cb5ce1bce7` |
| `scripts/erasure/account-erasure-registry-core.ts` | `e3b0608654107343591e9abee78047d698edab4b` |
| `scripts/witness/account-erasure-ledger-p5a-witness.sql` | `66393cbb9ba27484bee4159b0870f8504119e038` |

The migration was applied only to a disposable local PostgreSQL 14 database under
`/private/tmp`. It has not been applied to the shared development database, minisforum, or
production.

## 2 · Durable ledger shape

P5-A creates three candidate tables:

```text
account_erasure_acts
  one immutable content-free member act
  subject_member_id deliberately has NO FK to members
  policy_version + registry_version frozen on the act

account_erasure_dispositions
  immutable per-locus plan rows
  explicit planned disposition + label + binding + reason + verification + adapter
  INSERT closes after plan_frozen

account_erasure_execution_events
  append-only execution / verification / custody / terminal evidence
  monotonic event_seq orders successive verification attempts
  correction is additive and points to the historical event it corrects
```

There is no mutable status field. Present state is derived from positive durable facts.

## 3 · Completion law now enforced in the substrate

`act_completed` is refused unless:

1. the frozen plan contains no `refuse` disposition;
2. every plan row has a successful disposition outcome;
3. for every non-`none` verification rule, the **latest** verification event is success;
4. no custody obligation remains open.

A failed verification remains in history and may be followed by a later governed retry. The
failure is not rewritten; the later success is another event.

`act_refused` requires an explicit refused disposition in the frozen plan and is itself refused if
an erase/revoke/tombstone disposition already succeeded. Therefore *refused / no change* cannot be
reported after destructive work occurred.

UPDATE, DELETE and TRUNCATE are refused on the act, plan and event tables.

## 4 · Registry census and the instrument corrections

The checked-in registry is deliberately **coverage-only**. Except for the retained constitutional
act itself, existing loci and member-FK effects are seeded `refuse` until a later governed adapter
adjudicates a different disposition. This is not a mass retention ruling; it is a fail-closed
activation barrier.

The guard reproduces the two historical anti-vacuity anchors:

```text
F5-C baseline
  634 tables
  302 member-bound

F5-R1 migration member-FK surface
  289 raw REFERENCES members(id) declarations
  243 FK-linked tables
  264 distinct table / ON DELETE pairs
  CASCADE 161 · RESTRICT 24 · NO ACTION 47 · SET NULL 32
```

Current repository declaration surface after adding the P5-A act:

```text
319 member-bound loci
  302 baseline
   17 post-baseline, including account_erasure_acts

289 member-FK declarations
  2 retained indirect ledger-child FK declarations
    account_erasure_dispositions → account_erasure_acts
    account_erasure_execution_events → account_erasure_acts
```

### Instrument correction recorded during P5-A

A first post-baseline parser misread SQL comments containing apostrophes as string delimiters and
missed CREATE bodies. A second conservative parser initially produced an `episode_links.user_id`
false positive by reading across a dynamic-SQL `DO $$` block. The source was inspected directly:
`episode_links` has no member identity column. The final guard unions two CREATE discovery methods,
strips SQL comments before column parsing, reproduces the 634/302 baseline anchor, and keeps
`episode_links` out of the member-bound set.

No count was padded to match a prior result.

## 5 · Drift guard reachability

The canonical command is:

```bash
npm run check:erasure-registry
```

It is bound into:

- tracked `.githooks/pre-commit`;
- `build`;
- `build:docker`;
- `ci:sovereignty` (and therefore the Sovereignty Gate workflow);
- `preflight`.

A new direct member-bound locus, a new raw member-FK declaration, or a new indirect child of the
retained erasure act absent from the registry fails the gate. The FK declaration fingerprint includes
source file + line + table + action, so adding another FK to an already-known table with an
already-known ON DELETE action is still detected.

## 6 · Evidence run in this act

### Registry / unit falsifiers

```text
npm run check:erasure-registry                         PASS
focused Jest suites                                   2 / 2 PASS
focused Jest tests                                    18 / 18 PASS
```

The focused tests kill:

- unknown member-bound table;
- new FK declaration with unchanged table/action semantics;
- identity-binding drift;
- accidental disposal of the retained erasure act;
- unclassified indirect child custody beneath the retained act;
- plan mutation after freeze;
- history UPDATE / DELETE / TRUNCATE;
- completion without outcome / verification;
- completion with owed custody;
- route/client activation during P5-A.

### Fresh PostgreSQL behavioral witness

A fresh disposable PostgreSQL 14 database was created, the migration applied from zero, and
`scripts/witness/account-erasure-ledger-p5a-witness.sql` executed with `ON_ERROR_STOP`.

```text
W1   empty plan cannot freeze                                      PASS
W2   plan INSERT after freeze refused                              PASS
W3   act UPDATE refused                                            PASS
W4   disposition DELETE refused                                   PASS
W5   TRUNCATE refused                                              PASS
W6   completion without disposition outcome refused                PASS
W7   completion without verification refused                       PASS
W8   latest failed verification blocks completion                  PASS
W9   open owed custody blocks completion                           PASS
W10  custody clear without matching owed record refused            PASS
W11  completion after outcome + retry-success + custody clear      PASS
W12  non-correction event after terminal state refused             PASS
W13  correction is additive; original event remains                PASS
W14  execution-event UPDATE refused                                PASS
W15  act_refused after destructive success refused                 PASS
W16  durable act has no FK back to members                         PASS

16 / 16 PASS
```

The disposable witness transaction rolls its test rows back. No production database was contacted.

### Existing sovereignty aggregate

```text
npm run ci:sovereignty                                PASS
voice identity tests                                  29 / 29 PASS
member-id logging gate                                no new violations
provider / sovereignty checks                         PASS
```

## 7 · P4 mutant standing after P5-A

| P4 mutant | P5-A standing |
|---|---|
| 1 unknown-table | **KILLED** — registry guard |
| 2 unknown-FK | **KILLED** — semantic anchors + raw declaration coverage |
| 3 Circles-order | **OWED P5-B/P5-D** — no adapter/activation yet |
| 4 manifest-loss | **PARTIAL** — durable substrate exists; transactional route coupling owed later |
| 5 owed-custody | **KILLED AT LEDGER LEVEL** — completion guard + SQL witness |
| 6 false-success | **OWED P5-D** — member response not integrated yet |
| 7 silent-409 | **OWED P5-D** — Account Settings untouched |
| 8 lineage-guess | **DEPENDENCY BOUNDARY PRESERVED** — lineage repair remains separate; P5-B must refuse guessing |
| 9 S5-bypass | **OWED P5-D** — S5 integration not activated |
| 10 positive-control weakening | **PRESERVED IN P5-A** — no manuscript/vault/sanctuary/Circles behavior delta |
| 11 legacy-fallback | **OWED P5-C** — retirement implementation not yet taken |
| 12 history-rewrite | **KILLED AT LEDGER LEVEL** — append-only + additive correction |

P5-A therefore closes only the mutants its layer owns. It does not borrow future-layer standing.

## 8 · Containment

This cut changes no member-facing or erasure execution path. In particular:

```text
app/api/members/delete-account/route.ts       unchanged
components/account/AccountSettings.tsx        unchanged
lib/circles/**                                unchanged
lib/manuscript/**                             unchanged
lib/storage/**                                unchanged
legacy /api/sovereignty execution             unchanged in P5-A
```

The live account-deletion posture remains the existing truthful fail-closed refusal.

## 9 · Standing

```text
P5-A SUBSTRATE / REGISTRY       IMPLEMENTED AS CANDIDATE
P5-A FOCUSED TESTS              PASS
P5-A SQL WITNESS                16 / 16 PASS · disposable local PostgreSQL
P5-A CI SOVEREIGNTY             PASS

P5-B PLAN BUILDER / ADAPTERS    CLOSED · NEW FOUNDER ACT REQUIRED
P5-C LEGACY RETIREMENT          CLOSED
P5-D ROUTE / CLIENT ACTIVATION  CLOSED
P5-E PRODUCTION WITNESS         CLOSED

SCHEMA DEPLOYMENT               NOT AUTHORIZED
PRODUCTION                      UNTOUCHED
```

**NEXT EXACT ACT after P5-A is committed and reviewed: founder authorization, return, or rejection
of P5-B shadow plan-builder / adapter implementation.**
