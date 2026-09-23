# JARVIS-KP-01 / I3C1 — 30-Falsifier Reconciliation

**Opening canonical:** `0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`
**Canonical I3 merge:** `20c8764b516e042f38e33800f71b2bb040025665`
**Data class:** SYNTHETIC ONLY
**Production:** untouched

Each row names the exact mechanism actually reached. A neighboring invariant is
not counted as evidence for a separate falsifier.

| # | Required falsifier | Instrument / mechanism reached | Evidence class | Result |
|---:|---|---|---|---|
| 1 | Write while feature flag absent | `persistence.test.ts` flag evaluation | TypeScript execution | PASS |
| 2 | Write while feature flag false | `persistence.test.ts` exact `false` OFF case | TypeScript execution | PASS |
| 3 | Malformed/unexpected flag value | `persistence.test.ts` `1`, `TRUE`, `yes` OFF cases | TypeScript execution | PASS |
| 4 | UPDATE immutable join | DB witness W4 → append-only trigger | Disposable PostgreSQL execution | PASS |
| 5 | DELETE immutable join | DB witness W4 → append-only trigger | Disposable PostgreSQL execution | PASS |
| 6 | UPDATE/DELETE immutable warrant | DB witness W4 → warrant append-only trigger | Disposable PostgreSQL execution | PASS |
| 7 | UPDATE/DELETE standing act | DB witness W4 → standing append-only trigger | Disposable PostgreSQL execution | PASS |
| 8 | UPDATE/DELETE adoption act | DB witness W4 against round-trip adoption row | Disposable PostgreSQL execution | PASS |
| 9 | Duplicate act id | DB witness W5A → standing-act primary key | Disposable PostgreSQL execution | PASS |
| 10 | Unknown standing predecessor | DB witness W5A → predecessor foreign key | Disposable PostgreSQL execution | PASS |
| 11 | Cross-member standing predecessor | DB witness W5A → standing successor trigger | Disposable PostgreSQL execution | PASS |
| 12 | Cross-join standing predecessor | DB witness W5A → standing successor trigger | Disposable PostgreSQL execution | PASS |
| 13 | Cross-component standing predecessor | DB witness W5A → standing successor trigger | Disposable PostgreSQL execution | PASS |
| 14 | Duplicate root for standing subject | DB witness W5A → partial unique root index | Disposable PostgreSQL execution | PASS |
| 15 | Branched standing successor | DB witness W5 → one-successor unique index | Disposable PostgreSQL execution | PASS |
| 16 | Cross-member warrant attachment | DB witness W5A → member/join + warrant foreign-key boundary | Disposable PostgreSQL execution | PASS |
| 17 | Cross-member support/reliance attachment | DB witness W5A → member-scoped dependency foreign key | Disposable PostgreSQL execution | PASS |
| 18 | Reference silently becomes reliance | round-trip witness compares persisted dependence modes | Disposable PostgreSQL execution | PASS |
| 19 | Authorship changes on round trip | round-trip witness deep-compares authorship JSON | Disposable PostgreSQL execution | PASS |
| 20 | Jurisdiction changes on round trip | round-trip witness compares standing/adoption jurisdiction | Disposable PostgreSQL execution | PASS |
| 21 | Adoption rewrites original authorship | round-trip witness compares adopter separately from original proposer | Disposable PostgreSQL execution | PASS |
| 22 | Current standing writable directly | DB witness W6A attempts UPDATE of derived view | Disposable PostgreSQL execution | PASS |
| 23 | Discharge deletes source/history | round-trip witness appends DISCHARGED act and proves 3-act history remains | Disposable PostgreSQL execution | PASS |
| 24 | Partial transaction survives failure | DB witness W7 explicit transaction ROLLBACK | Disposable PostgreSQL execution | PASS |
| 25 | Concurrent incompatible successors both succeed | DB witness W7A observes two advisory-lock waiters; one success + one stale refusal | Concurrency execution | PASS |
| 26 | Store mutates while persistence disabled | `persistence.test.ts` proves transaction/randomness untouched while OFF | TypeScript execution | PASS |
| 27 | Production persistence import/call site appears | I3 matrix F18 repository import scan | Structural source guard | PASS |
| 28 | `projection.ts` appears | I3 matrix F19 filesystem guard | Structural source guard | PASS |
| 29 | `crossing_allowed` changes | I3 matrix F20 checks canonical CHECK-closed migration text | Structural schema guard | PASS |
| 30 | Persisted existence grants representation authority | DB witness W6 CHECK refusal + round-trip closed result + matrix F16 | PostgreSQL + structural guard | PASS |

## Aggregate

> **30 / 30 PASS**

The true-concurrency witness is distinct from the earlier sequential stale-writer
case. The round-trip witness uses direct test-only database reads; no application
or member-facing read API is introduced.
