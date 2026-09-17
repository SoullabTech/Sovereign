# F5-CONFORMANCE-REPAIR-01 · P0 — CONFORMANCE PREFLIGHT RESULT

**Date:** 2026-09-17

```text
CANONICAL SUBJECT        9e11eedb7574714fce60a1e9489cbf80fa032c4c
CONTRACT                 SPM-FC-01-R5 · manifest 75932893…e33b7
F5 EVIDENCE SUBJECT      7ee173db0d54f7340353316d11729b88480434a5
DRIFT TEST               PASS — zero change in declared F5 population
P0                       COMPLETE
REPAIR DESIGN            CLOSED
PRODUCTION               UNTOUCHED
```

## 1 · Drift adjudication

The earlier F5 evidence remains admissible against current canonical source because the bounded
population is unchanged between `7ee173db` and `9e11eedb`:

```text
app/api/members/delete-account
app/api/sovereignty
app/labtools/sovereignty
app/api/sovereign/manuscripts
lib/manuscript/source
lib/storage
app/api/scribe
lib/circles · app/api/circles
lib/memory
config/accessMatrix.ts · middleware.ts
services/user-sovereignty
database/migrations · database/baseline
scripts/run-sql-migrations.sh
docker-compose.production.yml
```

No path in that population changed. The F5/R1 counts and source-shape findings are therefore not
stale by repository drift. This does **not** convert runtime-unwitnessed facts into runtime evidence.

## 2 · Law-to-current-organism matrix

| Law | P0 standing | Evidence class | Current seam / reason |
|---|---|---|---|
| **I-1** member self-erasure subject binding | **FAIL** | REPOSITORY-REACHABLE · runtime unwitnessed | `/api/sovereignty/delete-my-memory` uses caller body `userId` as deletion subject; no sovereign subject derivation. |
| **I-2** confirmation phrase ≠ authority | **FAIL** | REPOSITORY-SHAPE | same path delegates destructive service authority to a fixed phrase while subject authority is otherwise absent. |
| **I-3** no accidental authority adjacency | **FAIL** | REPOSITORY-SHAPE | `/api/sovereignty/*` receives authentication through accidental `/api/sovereign` prefix matching; no rule declares that namespace. |
| **I-7** non-disclosing refusal + entitled truth | **MIXED / NON-CONFORMANT** | REPOSITORY-REACHABLE | ownership refusals are non-disclosing positive specimens; Account Settings does not render the governed 409 reason/change-state to the entitled member. |
| **I-12** withdrawal preserves history while removing present effect | **PASS specimen / no F5 repair target yet** | REPOSITORY-REACHABLE · runtime unwitnessed | circle inquiry withdrawal tombstones content while retaining the act; no P0 evidence licenses absorbing T-6 retrieval repair. |
| **I-20** protect another sovereign's governed stake | **PASS at located boundaries** | REPOSITORY-REACHABLE · runtime unwitnessed | manuscript shared-declaration refusal, circle tombstone/revocation, unowned-session refusal. Preserve. |
| **I-21** multi-sovereign stake visible to disposition | **FAIL** | REPOSITORY-SHAPE | 18 marked member-bound loci; 14 named by no located erasure path. |
| **I-22** explicit disposition for every governed class | **FAIL** | REPOSITORY-SHAPE | 302 member-bound baseline loci; account closure inspects 35; 267 named by no located erasure path. |
| **I-23** orchestration accounts for what it will cause | **FAIL** | REPOSITORY-SHAPE | governed set and FK graph are effectively separate; unenumerated RESTRICT can fail after preflight; CASCADE/SET NULL behavior is not governed by the route. |
| **I-24** deletion may not strand revocable authority | **FAIL by reachable shape** | REPOSITORY-REACHABLE · runtime occurrence unwitnessed | circle membership/shared-artifact authority can survive account deletion while its holder is erased, making ordinary revocation unavailable. |
| **I-25** erasure completion needs storage-sufficient evidence | **MIXED / NON-CONFORMANT** | REPOSITORY-REACHABLE | vault/manuscript custody is a PASS specimen; `delete-my-memory` catch reports success/queued with no queue or completion evidence. |
| **I-26** source-dependent derivatives need governed lineage | **FAIL** | REPOSITORY-SHAPE | 7/11 derived loci carry no source reference; 3/11 only session-level coarse reference. |
| **I-28** co-location ≠ lineage governance | **NO CURRENT FAIL ASSIGNED** | REPOSITORY-SHAPE | in-row embeddings erase with owning row where reached; this narrows the problem but is not a lineage mechanism. Preserve as design constraint. |
| **I-29** member receives refusal / retention truth | **FAIL** | REPOSITORY-REACHABLE | account-deletion API returns truthful 409, but current client handles `res.ok` only and does not render the body. |
| **I-30** failure may not present as completion | **FAIL** | REPOSITORY-REACHABLE | `delete-my-memory` catch returns `success: true`; sole caller renders permanent/completed deletion. |
| **I-31** declared scope ≤ executable scope | **FAIL** | REPOSITORY-SHAPE | Lab Tools promises all consciousness data across all systems; executable service names five tables absent from canonical schema surface and uses hardcoded demo subject at caller. |
| **I-32** disposition manifest comes from governed process | **FAIL** | REPOSITORY-SHAPE | complete outcome requires reconstructing union of explicit route behavior and incidental DB behavior; neither mechanism explains the other. |
| **I-33** imported historical traceability | **UNRESOLVED for F5 erasure** | NOT ASSESSED | binding constraint on any later repair; existing F5 evidence did not establish per-act historical traceability of complete erasure disposition. Do not infer FAIL. |

## 3 · Failure clusters — evidence organization only

P0 may group shared evidence without choosing a repair:

```text
A  SELF-ERASURE AUTHORITY / TRUTH SURFACE
   I-1 · I-2 · I-3 · I-25 · I-30 · I-31
   primary locus: /api/sovereignty/delete-my-memory + service + Lab Tools caller

B  ACCOUNT-CLOSURE DISPOSITION / MANIFESTABILITY
   I-7 · I-21 · I-22 · I-23 · I-24 · I-29 · I-32
   primary locus: /api/members/delete-account + storage graph + Account Settings consumer

C  DERIVATION / LINEAGE
   I-26, constrained by I-28
   primary locus: derived/interpretive stores identified by F5-C
```

These are **evidence clusters**, not approved repair workstreams. P1 must test whether the clusters
really share mechanisms or only look adjacent in the adjudication.

## 4 · Positive controls P1 must carry

P1 must explicitly preserve:

- server-derived subject binding on account closure, manuscript erasure and sanctuary purge;
- non-disclosing ownership refusals;
- truthful server-side account-closure 409 semantics;
- manuscript shared-declaration refusal;
- vault destruction verification / owed-custody reporting;
- circle tombstone and revocation semantics;
- in-row embedding co-location where it accurately narrows custody.

A census that lists only failures is incomplete because it cannot detect a repair that destroys a
working constitutional property.

## 5 · Runtime docket — not spent in P0

The repository still cannot establish:

1. whether any traced destructive path has ever executed in production;
2. whether the five legacy `delete-my-memory` tables exist in the production database despite being
   absent from canonical baseline+migrations;
3. whether any member deletion has created actual orphaned authority or residue;
4. current occupancy of the 267 ungoverned member-bound loci;
5. whether `vault_erasure_queue` currently contains owed destruction;
6. whether production clients exercise the accidental-prefix sovereignty route;
7. whether a complete historical disposition record already exists outside the located mechanisms.

P1 may determine whether any of these questions are actually necessary for repair-scope
adjudication. It may not read production merely because the question exists.

## 6 · P0 ruling

```text
DRIFT                               PASS — prior F5 repository evidence current
CURRENT CONFORMANCE                 FAIL — multiple ratified laws contradicted by source
POSITIVE CONFORMANT SPECIMENS       PRESENT — must be preserved
RUNTIME INCIDENT CLAIMS             NONE — unwitnessed remains unwitnessed
REPAIR ARCHITECTURE                 NOT OPEN
IMPLEMENTATION                      NOT AUTHORIZED

NEXT  P1 exact repair-surface census / overlap map — READ ONLY
```

**STOP.**
