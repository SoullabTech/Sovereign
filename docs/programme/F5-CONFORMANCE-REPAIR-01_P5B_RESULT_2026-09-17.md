# F5-CONFORMANCE-REPAIR-01 · P5-B — SHADOW PLAN / ADAPTER RESULT

**Date:** 2026-09-17

```text
P5-B AUTHORITY              founder continuation after P5-A closure
P5-A SUBJECT                8f5bc64854c62ae0f95bc9dabf2fe1803d97a51d
P4 ARCHITECTURE             54e5cb202fe72fb0009e893eb1f3ed2104d1af95
MODE                        SHADOW / TEST ONLY

LIVE ROUTE ACTIVATION       NONE
CLIENT ACTIVATION           NONE
SCHEMA DEPLOYMENT           NONE
PRODUCTION                  UNTOUCHED
```

## 1 · Exact candidate custody

| Artifact | Git blob |
|---|---|
| `config/governance/account-erasure-registry.v2.json` | `54b8673e4e45a1f975548fb2a4c30207fe5f9f66` |
| `lib/erasure/accountErasureAdapters.ts` | `72b183f2847893e2bae8ac5c8e5cf666c56580c0` |
| `lib/erasure/accountErasureShadowPlan.ts` | `acabc1c91e3c2c069e89ba40f34df0501d256f1d` |
| `lib/erasure/__tests__/accountErasureShadowPlan.test.ts` | `fa9863b943d689efb523ef65da13de0471c40416` |
| `scripts/witness/account-erasure-p5b-shadow-witness.ts` | `2c198301c86f7a4b5f55e7e4f8718559133e0843` |
| `scripts/erasure/account-erasure-registry-core.ts` | `df6eee51411a7c427941c91fe89b891d9b767bff` |
| `scripts/check-account-erasure-registry.ts` | `8bce457c4ddd8bb1926ce7f4ece94718aa872545` |
| `docs/programme/F5-CONFORMANCE-REPAIR-01_P5B_FOUNDER_AUTHORIZATION_2026-09-17.md` | `db5fa75934ecc649e4d43ab1f6570a0e7a68c39f` |

P5-A registry v1 is preserved. P5-B adds v2 rather than rewriting v1.

## 2 · Registry v2 succession is narrow

Only five direct loci move beyond P5-A's refuse seed:

```text
auth_sessions                  revoke     account_session     requires S5
member_settings                erase      account_session     requires S5
member_sessions                erase      account_session     requires S5
circle_memberships             revoke     circles_lifecycle   no S5
circle_inquiry_responses       tombstone  circles_lifecycle   no S5
```

Only three member-FK declarations change from refuse to explicitly manifested erase effects:

```text
auth_sessions      ON DELETE CASCADE
member_settings    ON DELETE CASCADE
member_sessions    ON DELETE CASCADE
```

Everything else remains coverage-only / refuse-by-default. Registry v2 still declares:

```text
coverageOnly=true
activationProhibited=true
```

A focused falsifier compares v1 and v2 mechanically and fails if another locus/FK changes silently.

## 3 · Shadow plan model

The planner consumes explicit facts; it never queries production and never performs a disposition.

It distinguishes:

- direct registry loci;
- migration-declared member-FK effects;
- domain-owned expansions;
- the synthetic terminal member-row effect.

Missing facts yield `evidence_incomplete`. Occupied but unadjudicated loci/FKs yield
`governed_refusal`. Only a fully evidenced plan with no refusal blocker becomes
`candidate_destructive_plan` — and even then `activationReady` is structurally `false` in P5-B.

## 4 · Circles is modeled at its own domain boundary

`shared_artifacts.shared_by` is not one of P5-A's direct identity-column loci. P5-B does not hide that
fact by broadening the registry definition. Instead, the Circles adapter adds it as a named domain
expansion.

The shadow dependency chain is:

```text
shared_artifacts revoke ─┐
                         ├─> circle membership revoke/end ─> members row may end
inquiry responses tombstone ┘
```

This preserves the existing Circles law: representations are withdrawn before the member loses the
ordinary authority to withdraw them.

## 5 · Lineage boundary remains separate

P1's corrected eleven-locus lineage set is carried as a refusal guard, not repaired here.

If an occupied source-dependent locus lacks **specific** source lineage, P5-B emits a governed refusal
and never guesses a destructive relation. Coarse/session/no lineage therefore cannot become a deletion
instruction by convenience.

## 6 · S5 remains downstream

Account/session destructive plan entries are marked `requiresS5=true`. P5-B can therefore identify
where anti-resurrection evidence will be required, but it cannot claim activation readiness.

The witness explicitly reports:

```text
activationReady=false
activationBlockers=
  P5-B is shadow-only; registry activationProhibited=true
  S5 anti-resurrection integration remains a P5-D obligation
```

No S5 row is written in P5-B.

## 7 · Shadow witness

Synthetic evidence was supplied only to the in-memory planner; no database was contacted.

```text
P5-B SHADOW WITNESS — PASS
registry=account-erasure-registry-v2-shadow
outcome=candidate_destructive_plan
activationReady=false
entries=321
fkEffects=289

auth_sessions                   revoke     pre_identity
shared_artifacts                revoke     pre_identity
circle_inquiry_responses        tombstone  pre_identity
circle_memberships              revoke     pre_identity
members.id                      erase      identity_end
```

The terminal member-row entry depends on every destructive pre-identity entry in the shadow plan.

## 8 · Falsification results

P5-B focused suite:

```text
12 / 12 PASS
```

The suite proves at least:

1. missing locus facts cannot present as a complete plan;
2. occupied unadjudicated loci refuse;
3. occupied unadjudicated member-FK effects refuse;
4. account/session semantics match the already-earned route behavior without activation;
5. `shared_artifacts` is included as a Circles domain expansion;
6. Circles representation shutdown precedes membership ending;
7. membership ending precedes member-row ending;
8. coarse/missing lineage refuses rather than guesses;
9. S5-required destructive plans remain non-activatable;
10. live account route and Account Settings do not import the shadow planner;
11. registry v2 succession is bounded to 5 loci + 3 FK declarations;
12. P4 positive-control files are byte-identical to the P5-A tip.

P5-A + P5-B focused constitutional suites together:

```text
3 suites PASS
30 / 30 tests PASS
```

## 9 · Type / sovereignty evidence

Ship type-health:

```text
229 diagnostics vs baseline 239
0 regressions
```

Scripts typecheck remains repository-red. Direct comparison against the P5-A parent:

```text
P5-A script diagnostics   40
P5-B script diagnostics   40
new diagnostics            0
resolved diagnostics       0
```

Full sovereignty aggregate:

```text
npm run ci:sovereignty     PASS
erasure registry           PASS
voice identity             29 / 29 PASS
member-id log gate         534 baselined · 0 new
provider/sovereignty       PASS
```

## 10 · P4 mutant standing after P5-B

| P4 mutant | Standing after P5-B |
|---|---|
| 1 unknown-table | **KILLED P5-A** |
| 2 unknown-FK | **KILLED P5-A** |
| 3 Circles-order | **KILLED IN SHADOW** — dependencies enforce representations before membership before member row |
| 4 manifest-loss | **PARTIAL / OWED P5-D** — durable substrate exists; route transaction coupling not active |
| 5 owed-custody | **KILLED AT LEDGER LEVEL P5-A** |
| 6 false-success | **OWED P5-D** |
| 7 silent-409 | **OWED P5-D** |
| 8 lineage-guess | **KILLED IN SHADOW** — missing/coarse source relation yields refusal |
| 9 S5-bypass | **BLOCKED FROM ACTIVATION · OWED P5-D** |
| 10 positive-control weakening | **KILLED P5-B** — exact P5-A file hashes asserted |
| 11 legacy-fallback | **OWED P5-C** |
| 12 history-rewrite | **KILLED AT LEDGER LEVEL P5-A** |

## 11 · Containment

Compared with P5-A `8f5bc6485`, P5-B changes no live execution surface:

```text
app/api/members/delete-account/route.ts    unchanged
components/account/AccountSettings.tsx     unchanged
lib/circles/**                             unchanged
lib/manuscript/**                          unchanged
lib/storage/**                             unchanged
app/api/sovereignty/**                     unchanged
app/labtools/sovereignty/**                unchanged
```

The live route remains `CONTAINMENT_POSTURE='refuse'`.

## 12 · Standing

```text
P5-A SUBSTRATE / REGISTRY          COMPLETE AS CANDIDATE
P5-B SHADOW PLAN / ADAPTERS        COMPLETE AS CANDIDATE

P5-C LEGACY RETIREMENT             CLOSED · NEW FOUNDER ACT REQUIRED
P5-D ROUTE / CLIENT ACTIVATION     CLOSED
P5-E PRODUCTION WITNESS            CLOSED

SCHEMA DEPLOYMENT                  NOT AUTHORIZED
CANONICAL MERGE                    NOT TAKEN
PRODUCTION                         UNTOUCHED
```

**NEXT EXACT ACT: founder authorization, return, or rejection of P5-C legacy-surface retirement /
containment implementation.**
