# F5-CONFORMANCE-REPAIR-01 · P4 — ARCHITECTURE ADJUDICATION

**Date:** 2026-09-17

```text
P3 AUTHORITY          1d2dfd70e
P4 COMPETITION        9bde582ef
MODE                  DOCUMENT-ONLY ADVERSARIAL ADJUDICATION

A · S5 PRIMARY        FAIL AS PRIMARY · RETAIN AS DEPENDENCY
B · DEDICATED LEDGER  PASS · SOLE SURVIVOR
C · GENERIC AUDIT     FAIL

IMPLEMENTATION        CLOSED
PRODUCTION            UNTOUCHED
```

## 0 · Ruling

Candidate B is the only candidate that survives the pre-registered constitutional attacks without
changing the meaning of an existing governance substrate or reducing destructive-act authority to
unconstrained convention.

This ruling selects an **architecture**, not an implementation. No table, migration, route or UI is
authorized by this record.

---

# 1 · Candidate A — S5 manifest family primary

## Verdict — **FAIL AS PRIMARY · RETAIN AS ANTI-RESURRECTION DEPENDENCY**

The S5 family is real governance and must be preserved. It is not, in its present shape, a complete
account-erasure plan/execution ledger.

### A1 · disposition semantics — FAIL

Existing S5 records carry:

```text
manifest: reason · authority label · timestamps · note
scope:    table · session/member/window
marker:   object kind · object id
```

They do not structurally carry planned disposition, member-visible class, execution result,
verification result, owed custody, refusal state or policy/registry version.

Putting those into `note` or interpreting generic scope columns as an implicit state machine fails
P4-A falsifiers 1 and 2.

### A2 · member-wide scope — FAIL as presently enforced

`deletion_manifest_scopes` permits a `member_id`, but the S5 restore trigger's scope match is shaped
around session/time restore predicates. Its decisive predicate requires session/window scope rather
than treating a member-id-only row as a generic account-wide restore refusal.

So:

```text
column exists → account-wide restore protection exists
```

is not earned. That would repeat I-11's exact failure class.

### A3 · extending S5 until it passes — collapses into B

A could be made viable by adding a dedicated child object for per-domain plan, outcome and
verification semantics while preserving the original S5 restore meaning. But at that point the
constitutional source of truth for account erasure is the new dedicated disposition object, with S5
as its restore-governance dependency.

That is Candidate B's architecture with an S5 integration, not a distinct S5-primary solution.

### A4 · surviving role

S5 remains the correct layer for:

- anti-resurrection tombstones/scopes;
- restore refusal;
- content-free proof that forgotten material must not reappear.

P5 must integrate with that role where applicable and may not repurpose it silently.

---

# 2 · Candidate C — generic `audit_logs`

## Verdict — **FAIL**

Candidate C clears only the cheapest property: a generic audit row can survive deletion because
`audit_logs.user_id` has no member FK.

It fails the harder governance tests.

### C1 · shape enforcement — FAIL

`metadata JSONB` accepts arbitrary shape. No erasure-specific CHECK, child rows, required-domain
constraint, or state-transition guard was located.

A malformed or incomplete erasure record can therefore be persisted successfully. The database
cannot distinguish:

```text
complete governed manifest
partial JSON
missing domain
wrong disposition vocabulary
post-hoc reinterpretation
```

### C2 · historical immutability — FAIL

No append-only / immutable audit-row enforcement was located for the account-erasure semantics this
candidate would depend on. I-33 requires the historical record to carry the historical act; a
mutable generic JSON record is too weak to be the sole constitutional record of a destructive act.

### C3 · durability semantics — FAIL in the existing writer

`logAuthEvent()` explicitly treats audit persistence as best-effort: authentication may succeed when
the audit write fails. That is a reasonable availability choice for authentication telemetry and a
fatal precedent for a destructive-act ledger.

Candidate C could bypass `logAuthEvent` and INSERT directly inside the erasure transaction, but that
fixes durability only. It does not fix unconstrained shape or historical mutation.

### C4 · repairing C makes it cease to be C

Adding erasure-specific required fields, append-only transitions, per-domain child records and
fail-closed persistence would create a dedicated erasure domain model in all but table name.

The minimal candidate therefore fails honestly rather than being rescued by renaming Candidate B's
requirements as JSON conventions.

---

# 3 · Candidate B — dedicated account-erasure plan / execution ledger

## Verdict — **PASS · SOLE SURVIVOR**

Candidate B can represent the constitutional act without making the account route, generic logs, or
restore substrate pretend to be something they are not.

Its PASS is architectural only. The implementation must still prove every property below.

---

## 4 · Ratified P4 architecture — exact shape

### 4.1 · One canonical boundary

The only member account-erasure authority in this architecture is:

```text
POST /api/members/delete-account
```

with verified server-side member identity.

The legacy `/api/sovereignty/delete-my-memory` path remains P3 `RETIRE AS AUTHORITY`; it is never a
fallback, compatibility implementation or second erasure engine.

### 4.2 · Durable act separate from member row

The erasure act must survive the member row it governs. Therefore its durable subject/act record may
not be FK-cascaded through `members`.

The retained record is content-free and is itself an explicit retention disposition. It records the
minimum identity/reference needed for accountability and anti-resurrection governance; P5 must not
turn it into a shadow profile.

### 4.3 · Durable per-domain plan

Before destructive mutation, the governed mechanism freezes a versioned plan covering every
classified durable member-bound domain relevant to the act.

Each disposition records at least:

```text
domain / storage locus
member-facing label
binding rule
planned disposition
authority / reason
verification rule
```

Execution adds result/verification/owed-state evidence without rewriting the historical plan.
Corrections are additive/successive, not silent edits to completed history.

### 4.4 · Coverage registry and drift guard

A versioned registry classifies every durable member-bound locus and every relevant member FK into a
governed disposition class.

Future schema change is refused by CI/build evidence if it creates a new member-bound locus or FK
without an erasure classification.

The registry does **not** mean every locus is deleted. Legitimate classifications include:

```text
erase
revoke
tombstone
retain with governed reason
refuse/block
non-participating / no-op with evidence
```

Unknown is fail-closed, never `retain by omission`.

### 4.5 · Disposition adapters, not one giant DELETE script

The plan executes through domain adapters whose semantics match the governed subsystem.

At minimum:

```text
ACCOUNT / SESSION
  revoke credentials and remove account-owned settings under canonical identity

CIRCLES
  consume the existing revocation/tombstone lifecycle before member authority is ended
  do not duplicate a second Circles consent model

CONTENT / CUSTODY
  use storage-specific erasure mechanisms and their verification contracts

EXTERNAL / ASYNC CUSTODY
  record durable owed work; never claim completion while it remains owed

RETENTION / REFUSAL
  preserve material only under an explicit governed disposition and tell the member truthfully
```

### 4.6 · Circles sequence is a load-bearing acceptance condition

For a member with active Circle representations, account erasure cannot remove the member identity
first and then discover that ordinary revocation is no longer exercisable.

The plan must produce an explicit Circles disposition before the member authority is destroyed.
Whether implementation delegates to refactored existing services or a transaction-equivalent
adapter is P5 design detail; the semantics must remain the existing consent/leave/removal semantics.

### 4.7 · S5 integration is downstream, not the account-erasure source of truth

Where deleted content must never return through restore, the completed destructive disposition emits
or links the corresponding S5 anti-resurrection evidence.

```text
account-erasure ledger   = what this member act planned/did/verified
S5 manifest/tombstone    = what restore must never resurrect
```

Neither substitutes for the other.

### 4.8 · Lineage boundary

P3's split remains binding.

Where an account-erasure disposition requires source-dependent lineage that is unavailable, the
account-erasure plan records that lack and refuses/retains rather than inventing a source relation.

F5-CONFORMANCE-REPAIR-01 therefore **cannot by itself close I-26 system-wide**. Full F5
constitutional conformance remains dependent on the separately governed lineage lane.

### 4.9 · Completion and owed work

The ledger's terminal semantics must distinguish:

```text
refused / no change
failed / rolled back
custody pending / partial
completed
```

`completed` is illegal while a required verification failed or external custody remains owed.

For non-DB custody, the existing manuscript/vault pattern is the positive precedent: deletion can
create durable owed work, but it may not claim finished custody until verification succeeds.

### 4.10 · Member-visible result derives from durable state

The response is a projection of the governed act state, not an optimistic branch in route code.

The Account Settings consumer must parse and render governed non-2xx responses. A truthful 409 that
is dropped by the client remains a constitutional failure.

---

# 5 · Law mapping

| Law | P4-B obligation |
|---|---|
| I-1 | subject from verified server identity; ledger binds that subject |
| I-2 | confirmation is deliberateness only, never authority |
| I-3 | explicit canonical route authority; retired legacy adjacency cannot confer authority |
| I-7 | non-disclosing unauthorized refusal + truthful entitled-member outcome |
| I-20 | multi-sovereign disposition preserves the other sovereign's governed stake |
| I-21 | multi-sovereign markers/lifecycle are consumed by disposition adapters |
| I-22 | registry + plan gives every governed class an explicit disposition |
| I-23 | plan accounts for explicit and FK-caused effects before execution |
| I-24 | Circles authority is revoked/transferred/refused before subject authority disappears |
| I-25 | completion requires storage-sufficient verification or durable owed state |
| I-26 | dependency only: missing lineage blocks guessing; separate lane owns repair |
| I-28 | co-located derivative erasure does not masquerade as lineage governance |
| I-29 | member receives exact refusal/partial/success state |
| I-30 | failed/owed work cannot present as completion |
| I-31 | member-facing scope cannot exceed the durable plan/execution result |
| I-32 | historical act manifest is produced by the governed mechanism itself |
| I-33 | plan/outcome history is durable; later reconstruction is not the source of truth |

---

# 6 · P5 acceptance falsifiers inherited from P4

No P5 implementation may be accepted unless tests can kill at least these mutants:

1. **unknown-table mutant** — add a new member-bound durable table without registry entry → build/test fails;
2. **unknown-FK mutant** — add a member FK side effect absent from disposition accounting → fails;
3. **Circles-order mutant** — delete member authority before revoking active shares → fails;
4. **manifest-loss mutant** — destructive transaction succeeds while durable act/plan does not persist → fails;
5. **owed-custody mutant** — external deletion remains owed while result becomes `completed` → fails;
6. **false-success mutant** — underlying operation throws and member sees success → fails;
7. **silent-409 mutant** — server returns governed refusal and Account Settings renders nothing → fails;
8. **lineage-guess mutant** — missing source relation causes guessed derivative deletion → fails;
9. **S5-bypass mutant** — forgotten content can be restored because anti-resurrection evidence was not emitted where required → fails;
10. **positive-control mutant** — manuscript/vault/sanctuary/Circles safety semantics are weakened → fails;
11. **legacy-fallback mutant** — retired `/api/sovereignty` code becomes a fallback execution path → fails;
12. **history-rewrite mutant** — completed disposition is modified in place with no successor/correction record → fails.

---

# 7 · Sequencing if P5 is later authorized

This is sequencing, not implementation authority.

A lawful implementation should separate substrate from behavioral activation:

```text
P5-A  durable act/disposition substrate + invariants + registry coverage guards
      no member-visible behavior change

P5-B  plan builder + domain adapters + falsifiers in shadow/test mode
      current fail-closed account deletion remains in force

P5-C  legacy-surface retirement/containment implementation
      independently test that canonical account closure is the sole authority

P5-D  route/client integration under explicit activation authority
      member-visible states + Circles ordering + S5 anti-resurrection integration

P5-E  question-bound production witness / rollout
      spend only runtime evidence identified by P2 for the chosen design
```

Schema-first deployment consequences remain separately governed by the repository's existing deploy
laws; P4 does not authorize a migration merely because P5-A may eventually require one.

---

## 8 · Final P4 standing

```text
P0 EVIDENCE PREFLIGHT          COMPLETE
P1 SURFACE CENSUS              COMPLETE
P2 RUNTIME DOCKET              COMPLETE · production evidence unspent
P3 FOUNDER SCOPE RULING        COMPLETE
P4 ARCHITECTURE COMPETITION    COMPLETE

A · S5 PRIMARY                 FAIL AS PRIMARY · S5 RETAINED AS DEPENDENCY
B · DEDICATED LEDGER           PASS · SOLE SURVIVOR
C · GENERIC AUDIT              FAIL

SELECTED ARCHITECTURE          B — dedicated account-erasure plan/execution ledger
LINEAGE                        separate governed dependency; not repaired here
LEGACY SOVEREIGNTY             retire as authority
CURRENT FAIL-CLOSED POSTURE    PRESERVE UNTIL ACTIVATION IS EXPLICITLY AUTHORIZED

P5 IMPLEMENTATION              ⛔ BLOCKED — NEW FOUNDER ACT REQUIRED
P6 RELEASE / PRODUCTION        ⛔ BLOCKED
PRODUCTION                     UNTOUCHED
```

**NEXT EXACT ACT: founder authorization, return, or rejection of P5 implementation against the
selected P4 architecture.**

**STOP.**
