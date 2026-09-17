# F5-CONFORMANCE-REPAIR-01 · P3 — FOUNDER REPAIR-SCOPE RULING

**Date:** 2026-09-17

```text
AUTHORITY            founder act in-session: continue through the P3 gate
CANONICAL SUBJECT    9e11eedb7574714fce60a1e9489cbf80fa032c4c
CONSTITUTION         SPM-FC-01-R5 · manifest SHA-256
                     75932893bd8beddac5f08666a3aa4656b28683036cf4d8a9d0b96c73626e33b7
EVIDENCE             P0 bc38c3769 · P1 5374f5365 · P2 b2725cdea
TYPE                 FOUNDER JURISDICTION RULING

REPAIR DESIGN        AUTHORIZED ONLY WITHIN §8
IMPLEMENTATION       CLOSED
PRODUCTION           UNTOUCHED
```

## 0 · Ruling

P0–P2 established three materially different failure clusters. They are not one repair merely
because they all touch deletion.

This ruling assigns jurisdiction before architecture.

---

## 1 · Cluster A — legacy `/api/sovereignty/*` deletion authority

### RULING A — **RETIRE AS AUTHORITY**

The legacy surface is not admitted as a foundation for the canonical repair architecture.

Evidence:

- subject is caller-supplied;
- authorization is not established at the handler;
- authentication presently arrives by an accidental lexical prefix;
- the only located UI caller is founder/founding-member Lab Tools, not a member surface;
- the service opens a separate PostgreSQL pool rather than the canonical DB boundary;
- all six tables the operation requires are absent from canonical schema;
- the failure fallback reports success and a queue that does not exist.

Therefore P4 may **not**:

```text
integrate this service into canonical account closure
copy its target-table list
copy its identity model
copy its completion semantics
preserve it as a second member-erasure authority
```

`RETIRE AS AUTHORITY` is a constitutional disposition, not source deletion authority. P4 may design
containment/deprecation/removal consequences, but source mutation remains P5 work and historical
execution/compatibility evidence remains question-bound under P2.

---

## 2 · Cluster B — canonical account closure

### RULING B — **CENTER OF F5 REPAIR DESIGN**

`POST /api/members/delete-account` is the canonical member account-erasure orchestration boundary
for this lane.

P4 owns the problem of making that boundary conform across:

```text
verified subject authority       I-1 / I-2 / I-3 constraints
complete governed disposition    I-21 / I-22 / I-23
Circles authority lifecycle      I-24
completion evidence              I-25
member-visible truth             I-7 / I-29 / I-30 / I-31
manifestability                  I-32 + imported I-33
```

The current fail-closed posture is a **positive containment control**. P4 may not weaken or remove
that refusal merely to make deletion succeed more often.

---

## 3 · Cluster C — derivation / lineage

### RULING C — **SPLIT TO A SEPARATE GOVERNED LINEAGE LANE**

The cross-system lineage problem is not owned by account deletion.

P1 refined the current repository fact:

```text
11 surveyed derived / interpretive loci
 1 specific source-material link
 3 session-level links
 1 optional/coarse conversation/session link
 6 no located link

10 / 11 therefore lack reliable specific source-material lineage.
```

That problem governs how derivatives relate to sources across cognition, memory, correction,
withdrawal, export and erasure. Letting F5 account closure redesign it would make a member-deletion
lane the accidental owner of a system-wide provenance architecture.

A separate future lane may be opened for I-26 / I-28 conformance. Until then, F5 P4 may only:

- state the lineage guarantees it requires at the erasure boundary;
- identify where missing lineage blocks a disposition;
- refuse to claim derivative completeness where the relation is unknowable;
- define an interface/dependency for future lineage governance.

P4 may **not** add lineage columns, backfill derivations, redefine source identity, or redesign
memory derivation.

---

## 4 · Existing S5 deletion-manifest substrate

### RULING D — **ADMISSIBLE CANDIDATE, NOT SELECTED**

The existing:

```text
deletion_manifests
deletion_manifest_scopes
provenance_tombstones
```

may be evaluated in P4 as a candidate substrate.

Its existence does not decide the architecture. P1 established that account closure has no located
runtime integration with it. It presently serves restore governance and selected deletion-boundary
mechanisms.

Any P4 candidate that reuses it must prove, rather than assume, that it can represent at least:

- the member/authority that initiated the governed act;
- the plan before execution;
- explicit per-class disposition;
- multi-sovereign refusal/revocation/tombstone outcomes;
- execution result and storage-sufficient verification;
- outstanding/owed work;
- truthful partial/refusal/no-change states;
- historical traceability required by I-33.

If the substrate cannot carry those semantics without distorting its existing restore-governance
meaning, P4 must reject reuse rather than overload it.

---

## 5 · Positive controls are frozen

### RULING E — **PRESERVE, DO NOT REDESIGN**

P4 and any later implementation must preserve the constitutional properties already earned by:

```text
manuscript erasure
  member binding · non-disclosing not-found · multi-Work refusal · custody_incomplete honesty

vault destruction
  out-of-root refusal · storage-sufficient completion verification · durable owed-work queue

sanctuary purge
  verified member binding · persisted mode · unowned-session refusal · transactionality

Circles ordinary lifecycle
  consent change / leave / removal revokes active shares before authority is ended
  response withdrawal/tombstone preserves another sovereign's governed record

account closure containment
  server-derived subject · confirmation is not authorization · truthful 409 · accountChanged=false
```

A repair candidate that weakens any of those to simplify account deletion fails P4.

---

## 6 · Runtime evidence standing

P2 remains binding.

No production read is authorized merely by opening P4. Runtime evidence may be spent only where a
specific P4 candidate or later rollout decision names the decision that the runtime fact can change.

---

## 7 · What is not authorized

This ruling does not authorize:

- route edits;
- schema or FK changes;
- migration creation;
- UI changes;
- deployment;
- production reads or writes;
- data cleanup/backfill;
- lineage repair;
- deletion-manifest reuse;
- retirement/deletion of the legacy route in source.

It assigns design jurisdiction only.

---

## 8 · P4 authority

P4 is now authorized as a **document-only architecture competition** for Cluster B, with a bounded
legacy-retirement consequence for Cluster A and a dependency boundary toward the future lineage
lane.

P4 must produce at least:

1. **three materially distinct candidates**, including:
   - one that evaluates reuse of the S5 manifest substrate;
   - one that uses a dedicated account-erasure plan/ledger distinct from S5;
   - one minimal candidate that tests whether durable plan/verification can be achieved without a
     new database object;
2. per-candidate mapping to I-1/I-2/I-3/I-7/I-21–I-25/I-29–I-33;
3. explicit treatment of Circles authority lifecycle without redesigning Circles;
4. explicit member-visible refusal / partial / success semantics;
5. positive-control preservation tests;
6. falsifiers strong enough to kill each candidate;
7. no preferred candidate until the comparison is complete.

```text
P0  COMPLETE
P1  COMPLETE
P2  COMPLETE
P3  ⭐ FOUNDER SCOPE RULING — COMPLETE
P4  AUTHORIZED · DOCUMENT ONLY
P5  IMPLEMENTATION BLOCKED
P6  WITNESS / RELEASE BLOCKED
```

**NEXT — P4 architecture competition.**

**STOP — no implementation follows from this ruling.**
