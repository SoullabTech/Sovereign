# F5-CONFORMANCE-REPAIR-01 · P1 — EXACT REPAIR-SURFACE CENSUS / OVERLAP MAP

**Date:** 2026-09-17

```text
STATUS                  P1 COMPLETE · READ ONLY
CANONICAL SUBJECT       9e11eedb7574714fce60a1e9489cbf80fa032c4c
P0                      bc38c3769
CONTRACT                SPM-FC-01-R5 · manifest 75932893…e33b7
SOURCE / SCHEMA         UNTOUCHED
PRODUCTION              UNTOUCHED
REPAIR DESIGN           CLOSED
```

## 0 · Question

P1 asks only:

> **Where do the P0 conformance failures actually live, which failures share a mechanism, and which
> apparently adjacent failures must remain separate?**

This is an overlap census. It does not choose a repair.

## 1 · Cluster A — legacy sovereignty self-erasure is a separate authority

### A1 · Entry point

`POST app/api/sovereignty/delete-my-memory/route.ts`

The route:

- accepts `userId`, `confirmationPhrase`, and `deleteReason` from the request body;
- performs no route-level member-subject resolution;
- `require()`s `services/user-sovereignty/delete-memory-api.js`;
- on service failure returns `success: true` plus *"your request has been queued"* although no queue
  is written.

### A2 · Separate storage authority

`services/user-sovereignty/delete-memory-api.js` opens its own `pg.Pool` from `POSTGRES_*` variables.
It does not use the canonical `lib/db/postgres.ts` database authority.

It targets exactly:

```text
elemental_evolution
wisdom_moments
ain_consciousness_memory
elemental_personalities
maia_adaptations
```

and then writes `user_deletion_log`.

Mechanical census against the canonical baseline plus migration directory:

```text
elemental_evolution         ABSENT
wisdom_moments              ABSENT
ain_consciousness_memory    ABSENT
elemental_personalities     ABSENT
maia_adaptations            ABSENT
user_deletion_log           ABSENT
```

Whether any of these tables exist in production is a runtime question. Their absence from the
canonical schema is already enough to prove that this path is not an authoritative description of
canonical member custody.

### A3 · Caller and exposure are also separate

The sole located UI caller is `app/labtools/sovereignty/page.tsx`:

- hardcoded `userId = 'demo_user_001'`;
- requires the fixed phrase `DELETE ALL MY CONSCIOUSNESS DATA`;
- renders *"All your consciousness data has been permanently and completely deleted."*

Lab Tools is explicitly **not a member surface** and is gated by `requireLabAccess()` for founder / founding-member access.

The API itself does not inherit that UI authority. Authentication reaches it through
`config/accessMatrix.ts` because raw prefix matching makes:

```text
'/api/sovereignty/...'.startsWith('/api/sovereign') === true
```

No rule declares the `/api/sovereignty` namespace.

### A4 · P1 ruling for Cluster A

```text
A is NOT an alternate implementation of canonical account closure.
A is a distinct legacy route + service + connection + schema assumption + caller.
```

Therefore a future repair may not speak of *"the erasure endpoint"* as though A and Cluster B were
one authority. Founder/design adjudication must decide A's disposition explicitly before any source
change: retain under a governed role, integrate into a canonical path, retire, or another option.
P1 chooses none.

## 2 · Cluster B — canonical account closure is the active orchestration surface

### B1 · Canonical route

`POST app/api/members/delete-account/route.ts` correctly derives the subject with
`getMemberIdFromRequest` and treats `confirmUsername` as deliberateness rather than authority.

Its current explicit inventory is:

```text
GOVERNED_CONTENT      40 entries / 40 names
OPTIONAL_CLEANUP       3 entries /  3 names
TOTAL                  43 entries / 42 distinct names
duplicate              developmental_memories
```

The live posture is `CONTAINMENT_POSTURE = 'refuse'`.

When a named governed class has rows, the route returns a truthful HTTP 409 with:

```text
accountChanged: false
nextStep: 'contact_support'
retained: <member-legible categories>
```

When no named governed content is found, it may proceed to revoke credentials, remove account rows,
run three best-effort cleanups and delete the `members` row.

### B2 · Member-visible truth breaks at the client, not at the server

`components/account/AccountSettings.tsx` invokes the canonical route with no caller-supplied
`memberId`. But its deletion handler reads only `res.ok`; it does not parse or render the governed
409 body.

So I-7/I-29 is a **cross-surface failure**:

```text
server refusal semantics   conformant positive specimen
member delivery            non-conformant
```

A later repair must not replace the truthful server refusal merely because the UI currently fails
to show it.

### B3 · The route inventory and the database disposition graph are different mechanisms

The exact route list is a hand-authored content registry. The FK graph is database behavior. F5-R1
established that they are effectively separate disposition surfaces rather than mutual checks.

P1 therefore refuses the abstraction:

```text
route list == storage graph
```

Any future design must account for both explicit orchestration and implicit database consequences,
but P1 does not decide how.

## 3 · Existing S5 deletion-manifest substrate — AFFORDANCE, not current account-erasure conformance

The current repository already contains:

```text
deletion_manifests
deletion_manifest_scopes
provenance_tombstones
```

from the S5/R20 provenance substrate. Its declared purpose is a content-free record of
sovereignty-driven deletion whose scopes/tombstones survive restore.

The substrate is real and used by governance machinery:

- `scripts/restore-governed.sh` preserves, reapplies and consumes manifests/scopes/tombstones;
- the `context_disclosure_receipts` custody trigger requires a real named deletion manifest before
  a receipt may be deleted;
- witness SQL exercises the contract.

But a repository-wide runtime search found **no app/lib/component/service writer** that inserts a
member/account erasure into `deletion_manifests`.

The canonical account-deletion route contains no manifest or tombstone reference.

Therefore:

```text
manifest substrate exists                    YES
account closure uses it                       NO evidence / no located path
manifest proves I-32/I-33 account conformance NO
manifest is an approved F5 repair primitive   NO — design not opened
```

This is a pre-existing affordance. P3/P4 may later consider it; P1 may not convert availability into
adoption authority.

## 4 · Cluster B overlap with Circles — account closure bypasses a working authority lifecycle

### B4.1 · Current storage shape

`circle_memberships` carries:

```text
member_id UUID NOT NULL
consent_mode manual | not_now
```

but has no FK from `member_id` to `members(id)`.

`shared_artifacts` carries:

```text
shared_by UUID NOT NULL
revoked_at
```

but has no FK from `shared_by` to `members(id)`.

Neither table is named in the canonical account route's 42 distinct table names.

### B4.2 · Circles already has a conformant authority lifecycle

- `setConsent(..., 'not_now')` revokes the member's active shared artifacts in that Circle;
- leaving a Circle revokes shares, tombstones inquiry responses, then marks membership left;
- facilitator removal does the same before marking membership removed;
- explicit artifact revocation sets `revoked_at` while leaving the source item untouched;
- sharing requires the membership-held `consent_mode` authority.

### B4.3 · P1 ruling

I-24's F5 defect is therefore **not** *"Circles lacks revocation."*

It is:

> **account deletion can remove the sovereign without crossing the existing Circles revocation
> lifecycle that would otherwise end their operative representations.**

A future F5 repair may need to coordinate with Circles. It is not authorized to redesign Circles
simply because account closure currently bypasses it.

## 5 · Cluster C — derivation / lineage is cross-cutting and does not share Cluster B's mechanism

P1 re-parsed the eleven F5-C derived/interpretive loci from the current canonical baseline rather
than copying the earlier summary.

Current classification:

```text
specific source-material reference
  1  case_memory_chunks            source_type + source_id

coarse session reference
  3  conversation_insights         session_id
     user_session_patterns         session_id
     consciousness_expansion_events session_id

optional coarse conversation/session reference
  1  breakthrough_moments          nullable conversation_id

no located source/container reference
  6  selflet_nodes
     conversation_themes
     soul_patterns
     pattern_connections
     user_relationship_context
     episodes
```

### 5.1 · Correction to the F5-C shorthand

F5-C stated `7 of 11` with no source reference and `3 of 11` with a session id. P1 found that
`breakthrough_moments.conversation_id` exists and is read back as `sessionId`.

That field is **not** a reliable specific-source lineage mechanism:

- `MemoryWriteback.writeBreakthroughMoment` writes its `sessionId` there;
- `BreakthroughStore.addBreakthrough` writes it only when the caller supplies an optional
  `conversationId`;
- `RelationshipMemoryService.saveBreakthroughMoment` omits it entirely;
- no FK or source-material constraint binds it;
- `SignificantMomentsService` reads it only as a session identifier.

So the corrected current statement is:

```text
1 / 11 has a specific source-material link
3 / 11 have session-level links
1 / 11 has an optional, inconsistently-populated conversation/session link
6 / 11 have none

10 / 11 therefore lack a reliable specific source-material lineage link.
```

The constitutional I-26 failure survives, but the denominator is now more precise.

### 5.2 · P1 ruling for Cluster C

Lineage does **not** reduce to account-route table coverage. Adding a table to `GOVERNED_CONTENT`
would not by itself answer what derived from what.

Cluster C is therefore a distinct design problem. P3 must decide whether it remains inside one F5
repair-design lane or is split into a separately governed lineage lane. P1 does not decide.

## 6 · Overlap map

```text
A  LEGACY SELF-ERASURE
   locus: /api/sovereignty + legacy service + Lab Tools caller
   shares constitutional laws with B, but NOT code/storage authority

B  CANONICAL ACCOUNT CLOSURE
   locus: /api/members/delete-account + AccountSettings + storage graph
   owns current member-facing account closure orchestration

B↔CIRCLES
   overlap is orchestration order / authority lifecycle
   Circles revocation exists; account closure bypasses it

S5 MANIFEST SUBSTRATE
   nearby reusable governance affordance
   NOT currently wired to account closure
   NOT yet selected as repair architecture

C  DERIVATION / LINEAGE
   cross-cutting source-to-derivative identity problem
   NOT solved by B's table inventory
```

There is **no single existing function/module** that is already the common implementation authority
for A+B+C.

## 7 · P0 runtime docket adjudicated for pre-design necessity

P1 now asks a narrower question: which runtime facts are required **before founder repair-scope
adjudication**?

| Runtime question from P0 | Needed before P3? | Why |
|---|---|---|
| Have destructive paths executed in production? | **NO** | Required for incident/history claims, not to establish current source non-conformance or choose a design scope. |
| Do the six legacy sovereignty tables exist in production? | **NO** | Their canonical absence and the path's separate authority already bound Cluster A. Runtime existence may matter if later retirement/migration is chosen. |
| Has orphaned Circles authority actually occurred? | **NO** | I-24 structural reachability and the lifecycle bypass are source-established. Occupancy matters before cleanup/backfill, not before design-scope adjudication. |
| What rows occupy the 267 ungoverned loci? | **NO** | Occupancy may govern rollout/backfill strategy; it is not needed to establish incomplete orchestration. |
| Does `vault_erasure_queue` currently hold rows? | **NO** | Vault custody is a positive specimen, not a current repair target. |
| Has production exercised accidental `/api/sovereignty` coverage? | **NO** | Usage history does not alter the source authority defect. |
| Does some external system already keep a complete erasure history? | **NO for P3** | The account route has no located integration. I-33 remains a binding design/witness constraint; an eventual design claiming historical traceability must prove its mechanism. |

**P1 result: no production read is required to decide the repair-design scope.**

This does not mean those runtime questions disappear. They are deferred to the first later gate whose
decision actually depends on them.

## 8 · P1 standing

```text
CLUSTER A                  BOUND · DISTINCT LEGACY AUTHORITY
CLUSTER B                  BOUND · CANONICAL ACCOUNT ORCHESTRATION
CIRCLES OVERLAP            BOUND · ACCOUNT CLOSURE BYPASSES WORKING LIFECYCLE
S5 MANIFEST SUBSTRATE      BOUND · AFFORDANCE, NOT CURRENT INTEGRATION
CLUSTER C                  BOUND · DISTINCT LINEAGE PROBLEM
LINEAGE COUNT              CORRECTED · 1 specific / 3 session / 1 optional coarse / 6 none
PRE-DESIGN PRODUCTION READ NOT REQUIRED

P1                         COMPLETE
REPAIR DESIGN              CLOSED
IMPLEMENTATION             CLOSED
PRODUCTION                 UNTOUCHED

NEXT                       P2 runtime-evidence docket — classify/defer, no production read
```

**STOP.**
