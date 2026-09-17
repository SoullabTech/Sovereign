# F5-CONFORMANCE-REPAIR-01 · P4 — REPAIR ARCHITECTURE COMPETITION

**Date:** 2026-09-17

```text
AUTHORITY             P3 founder ruling 1d2dfd70e
SUBJECT               canonical account-erasure orchestration only
MODE                  DOCUMENT-ONLY ARCHITECTURE COMPETITION
CANDIDATES            A · B · C
PREFERRED CANDIDATE   NONE AT OPEN
IMPLEMENTATION        CLOSED
PRODUCTION            UNTOUCHED
```

## 0 · Common acceptance law

Every candidate must preserve P3 jurisdiction and satisfy the same constitutional burden.

A viable architecture must make one member-initiated account-erasure act answerable as:

```text
WHO        verified actor / subject
WHAT       every governed information class in scope
WHY        disposition basis
PLAN       what will happen before mutation
ACT        what actually happened
PROOF      storage-sufficient verification or durable owed work
TRUTH      what the member is told
HISTORY    a durable content-free record sufficient to reconstruct that historical act
```

It must also preserve the frozen positive controls and refuse unknown disposition rather than guess.

---

## 1 · Shared domain model required of any survivor

The names below are conceptual, not schema authorization.

### 1.1 Act

A durable erasure act needs at least:

```text
act identity
verified subject reference
verified actor / authority basis
policy / registry version
requested / planned / executed / completed timestamps
state: planned | refused | executing | custody_pending | completed | failed
```

The record is content-free. It may identify domains, counts, dispositions, verification classes and
errors; it may not retain journal text, conversation text, embeddings, excerpts or fingerprints of
member content merely to prove deletion.

### 1.2 Per-domain disposition

For every governed class implicated by the act:

```text
domain key / storage locus
member-legible label
binding rule
planned disposition:
  erase | revoke | tombstone | retain | refuse | no-op / non-participating
basis / authority
expected effect
actual effect
verification method
result / owed state
```

### 1.3 Registry / coverage guard

A versioned erasure registry must make schema drift loud.

At minimum, CI/build evidence must fail when a new member-bound durable locus or relevant member FK
appears without an explicit disposition classification. Runtime may additionally refuse on a schema
fingerprint mismatch; no candidate may make runtime schema archaeology the only form of governance.

### 1.4 Circles adapter

Account erasure must consume the existing Circles authority lifecycle rather than inventing a
parallel one. The architecture must ensure active shares and inquiry responses receive the same
revocation/tombstone consequences required when consent or membership ordinarily ends, before the
member identity becomes unable to exercise those acts.

### 1.5 Lineage dependency

Missing source lineage is not guessed. Where an erasure decision depends on source-dependent
lineage that the separate lineage lane has not established, the plan must retain/refuse/mark
unknown truthfully. Account erasure does not acquire authority to backfill or infer provenance.

---

# 2 · Candidate A — S5 manifest family as the primary erasure ledger

## Shape

Use existing `deletion_manifests`, `deletion_manifest_scopes`, and `provenance_tombstones` as the
primary account-erasure record.

Existing strengths:

- `reason_class = member_deletion` already exists;
- manifests are content-free and survive independently of member rows;
- tombstones/scopes already protect restore paths;
- disclosure-receipt deletion already demonstrates a manifest-named governed deletion seam.

## Missing semantics at present

The current S5 family does **not** represent:

```text
per-domain planned disposition
member-visible label
planned vs actual effect
refusal vs retention vs revoke vs tombstone
verification method/result
partial / custody_pending / failed state
outstanding external work
registry/policy version
```

`deletion_manifest_scopes` says *where forgotten material must not be restored*; it does not say
*what the account-erasure act planned, why, or what occurred.* `provenance_tombstones` is a restore
refusal marker, not an orchestration ledger.

## Candidate A permitted form

A may extend the S5 family only if it can do so without changing the meaning of existing restore
records or restore triggers.

If A requires a new dedicated child object carrying account-erasure dispositions/execution state,
that is recorded as **collapse toward Candidate B**, not disguised as unchanged S5 reuse.

## Pre-registered falsifiers

A fails if:

1. `note` or generic scope fields must carry structured disposition semantics by convention;
2. restore scopes become overloaded with orchestration meanings restore code does not consume;
3. a member-only scope is treated as proof that restore protection currently enforces that scope;
4. existing S5 incidents/restore behavior would require reinterpretation or migration to understand
   new account-erasure records;
5. per-domain execution/verification requires a new dedicated ledger whose semantics are no longer
   the existing S5 manifest model.

---

# 3 · Candidate B — dedicated account-erasure plan / execution ledger

## Shape

Create a domain-specific durable erasure-act record and per-domain disposition records. S5 remains a
separate downstream restore-governance layer.

Conceptually:

```text
AccountErasureAct
  └── AccountErasureDisposition[*]
        ├── domain / member label
        ├── binding + disposition
        ├── plan state
        ├── execution result
        └── verification / owed state

successful destructive dispositions
  └── emit/link S5 manifest scopes or tombstones where restore refusal is required
```

No schema is authorized by this document; names are architectural roles.

## Execution model

1. resolve canonical member identity;
2. build a complete versioned plan before mutation;
3. fail closed if any durable member-bound class lacks classification;
4. refuse before mutation if a disposition cannot safely execute;
5. persist the content-free act + plan;
6. execute DB-bound dispositions transactionally where possible;
7. execute Circles through the existing authority lifecycle or a transaction-equivalent adapter;
8. enqueue/record non-atomic external custody work rather than claiming completion;
9. verify each disposition using its declared verification method;
10. mark the act complete only when the constitutional completion condition is met;
11. return a member-visible result derived from the durable act, never from optimistic control flow.

## S5 relationship

Candidate B does not replace S5. Where erased material must never return through restore, B emits or
links the appropriate S5 manifest/tombstone evidence. The account-erasure ledger answers *what this
member act did*; S5 answers *what restore may never resurrect.*

## Pre-registered falsifiers

B fails if:

1. the act/disposition record is FK-cascaded away with the member;
2. the ledger stores member content or content-derived fingerprints merely for proof;
3. a plan can complete while an unclassified member-bound locus exists;
4. a per-domain result can be changed after completion without an append-only correction trail;
5. external custody can remain owed while the act says `completed`;
6. Circles shares survive while the ordinary member authority required to revoke them has been
   destroyed;
7. the member response can diverge from the durable act state;
8. S5 restore protection is bypassed for deleted material that requires anti-resurrection custody;
9. missing lineage is guessed rather than surfaced/refused;
10. frozen positive controls are weakened to fit the ledger.

---

# 4 · Candidate C — versioned code registry + generic `audit_logs`, no new domain object

## Shape

Keep all disposition semantics in a deterministic code registry. Before mutation, serialize the
planned disposition into the existing `audit_logs.metadata`; update or append outcome evidence after
execution. No new erasure-specific persistent object.

Existing strengths:

- `audit_logs` is durable and has no FK to `members`;
- JSON metadata can represent a plan without a migration;
- a direct transaction-bound INSERT is technically possible;
- code registry + CI can still enforce schema coverage.

## Current structural weaknesses

- metadata shape is unconstrained by the database;
- no located append-only or immutability trigger protects the erasure record;
- generic audit events share the table with unrelated security events;
- the existing auth-audit writer is explicitly best-effort and allows the primary operation to
  succeed when persistence fails;
- there is no erasure-specific state-transition model or per-domain relational completeness guard.

Candidate C may not claim those weaknesses are solved by developer discipline.

## Pre-registered falsifiers

C fails if:

1. the destructive act can commit when its durable erasure record fails to persist;
2. the database accepts an erasure event missing one required domain/disposition without a structural
   refusal;
3. historical erasure metadata can be overwritten or reinterpreted with no append-only correction;
4. completion depends on parsing arbitrary JSON whose required shape is not governed at the storage
   boundary;
5. adding enough constraints/triggers/child rows to make C pass creates an erasure-specific domain
   model in all but name.

---

# 5 · Shared falsification matrix

| Attack | A — S5 primary | B — dedicated ledger | C — generic audit |
|---|---|---|---|
| new member-bound table appears | must be registry-refused | must be registry-refused | must be registry-refused |
| unenumerated RESTRICT/FK side effect | plan must surface it | plan must surface it | registry JSON must surface it |
| active Circle share exists | explicit revocation disposition required | explicit Circles adapter required | registry action required |
| DB mutation rolls back | manifest must not say completed | act remains non-complete | audit record must remain truthful |
| external bytes remain owed | durable owed state required | durable owed state required | JSON state required |
| member receives 409 | reason + no-change must render | reason + no-change must render | reason + no-change must render |
| derivative lineage unknown | refuse/retain truthfully | refuse/retain truthfully | refuse/retain truthfully |
| restore attempts deleted content | S5 native strength | link/emission into S5 required | separate S5 integration still required |
| historical question months later | manifest must carry act | ledger must carry act | audit JSON must carry act |
| positive specimen changed | FAIL | FAIL | FAIL |

---

# 6 · Legacy-surface consequence common to all candidates

Whichever Cluster-B architecture survives, P3 Ruling A remains:

```text
/api/sovereignty/delete-my-memory   RETIRE AS AUTHORITY
```

P4 architecture therefore assumes the legacy route will eventually be contained/retired rather
than integrated. No candidate may depend on its service, target table list or completion claims.

---

# 7 · Member-visible state model required of any survivor

The exact HTTP status codes remain an implementation decision, but the semantic states may not be
collapsed:

```text
REFUSED / NO CHANGE
  accountChanged=false
  truthful reason
  governed retained/blocked classes
  next step where one exists

FAILED / ROLLED BACK
  accountChanged=false when the transaction made no durable member change
  no success language

CUSTODY PENDING / PARTIAL
  exact changes already made
  exact work still owed
  never "complete"

COMPLETE
  only after every required disposition is verified or explicitly governed as retained
```

The Account Settings client must render the body for non-2xx governed outcomes; `res.ok` alone is
not a member-visible truth boundary.

---

## 8 · Competition standing

```text
CANDIDATE A   OPEN TO ATTACK
CANDIDATE B   OPEN TO ATTACK
CANDIDATE C   OPEN TO ATTACK

SELECTION     NOT TAKEN IN THIS RECORD
IMPLEMENTATION CLOSED
PRODUCTION     UNTOUCHED
```

**NEXT — bounded P4 adjudication against the pre-registered falsifiers.**
