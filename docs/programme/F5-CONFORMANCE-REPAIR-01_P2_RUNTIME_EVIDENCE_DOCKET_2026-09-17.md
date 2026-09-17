# F5-CONFORMANCE-REPAIR-01 · P2 — RUNTIME EVIDENCE DOCKET

**Date:** 2026-09-17

```text
STATUS                  P2 COMPLETE
CANONICAL SUBJECT       9e11eedb7574714fce60a1e9489cbf80fa032c4c
P0                      bc38c3769
P1                      5374f5365
PRODUCTION READ         NONE
PRODUCTION MUTATION     NONE
REPAIR DESIGN           CLOSED
IMPLEMENTATION          CLOSED
```

## 0 · Purpose

P2 does **not** ask every question that could be answered from production.

It asks:

> **Which runtime facts are necessary before a founder can adjudicate the repair-design scope, and
> which runtime facts must remain unspent until a later decision actually depends on them?**

A question existing is not authorization to query production.

## 1 · P2 ruling — no pre-design production measurement is required

P0/P1 established the present repair problem from current canonical source and schema shape:

- Cluster A is a distinct legacy authority with caller-selected subject, accidental namespace
  protection, false-success semantics and noncanonical target tables;
- Cluster B is the canonical member account-closure orchestrator with incomplete storage-graph
  accounting and a member-visible refusal-delivery gap;
- account closure bypasses an already-working Circles revocation lifecycle;
- the existing S5 deletion-manifest substrate is not integrated into account closure;
- Cluster C is a distinct lineage problem, with only 1/11 surveyed derived loci carrying a reliable
  specific source-material reference.

None of those propositions depends on current row occupancy or proof that a member has already
suffered the failure.

Therefore:

```text
PRE-DESIGN PRODUCTION READ    NOT REQUIRED
P2 PRODUCTION AUTHORITY       UNSPENT
P3 FOUNDER SCOPE RULING       EVIDENTIALLY READY
```

## 2 · Docket

| Runtime question | P2 disposition | First later gate that may need it | Why |
|---|---|---|---|
| Have `/api/sovereignty/delete-my-memory` or account closure executed in production? | **DEFER** | incident/remediation review or release witness | Execution history is not required to adjudicate current source conformance or repair ownership. |
| Do the six legacy sovereignty tables exist in the production database? | **DEFER** | only if P3/P4 chooses retirement, migration, or compatibility treatment for Cluster A | Canonical absence already proves the path is not authoritative over canonical custody. Runtime existence changes migration/decommission consequences, not the present boundary finding. |
| Has account deletion produced an actual orphaned Circles authority state? | **DEFER** | before cleanup/backfill if a future design changes existing rows | The bypass is structurally reachable. Occupancy determines historical remediation, not whether the orchestration boundary must account for Circles. |
| Which of the 267 member-bound loci currently contain rows? | **DEFER** | rollout/backfill/retention witness for a chosen disposition model | Empty tables do not make an ungoverned disposition contract complete; occupied tables may change migration cost and rollout risk. |
| Does `vault_erasure_queue` currently contain owed destruction? | **OUT OF CURRENT REPAIR TARGET** | vault operational witness, if separately opened | Vault custody is a positive specimen P1 protects. Occupancy does not define the F5 repair-design scope. |
| Has any production client exercised the accidental `/api/sovereignty` prefix protection? | **DEFER** | security incident assessment if historical exploitation/exposure is being adjudicated | Usage does not cure or create the authority defect. |
| Is an external process writing `deletion_manifests` for account closure? | **DEFER — no located integration** | P4 if a candidate relies on existing external orchestration, or P6 witness | The account route and located runtime code contain no writer/integration. A future design may not claim manifestability merely by table existence. |
| Does production hold historical deletion manifests/scopes/tombstones? | **DEFER** | before a design migrates/reuses that substrate or a restore witness depends on its population | Existing data may constrain compatibility; it does not decide whether the substrate should be reused. |
| What exact rows have coarse/missing lineage in production? | **DEFER** | before lineage backfill/migration, if Cluster C remains in F5 | I-26's structural problem is already established. Occupancy controls remediation volume, not design jurisdiction. |
| Is there some complete historical erasure-disposition record outside located repository mechanisms? | **DEFER** | only if a future candidate claims pre-existing I-33 traceability | P1 found no account-route integration. P2 will not search production to rescue a claim the repository does not make. |

## 3 · Runtime evidence must be question-bound

If a later gate needs production evidence, its procedure must pre-register:

1. **the exact decision** the runtime fact can change;
2. **the exact subject and time window**;
3. **whether it reads counts, identities, content, or only schema/metadata**;
4. **the strongest claim a zero result permits**;
5. **a stop condition** preventing exploratory widening;
6. **whether the read itself creates sensitive evidence that must be governed.**

No “while we are there” production census is permitted under this lane.

## 4 · No-incident discipline

The present evidence licenses statements such as:

```text
source path can report success without completion
account closure can bypass Circles revocation
route inventory does not account for the full disposition graph
most surveyed derivatives lack specific lineage
```

It does **not** license:

```text
a member was falsely told deletion completed
an orphaned authority state exists in production right now
267 populated stores currently retain deleted-member data
legacy sovereignty tables definitely exist or do not exist in production
a production restore has resurrected forgotten material
```

Those are runtime/incident claims and remain unwitnessed unless separately measured.

## 5 · P2 effect on the three clusters

### Cluster A — legacy sovereignty

No production read is required before P3 decides whether this legacy authority is even admitted to a
repair-design lane. If later retained or migrated, runtime schema/execution evidence may become
necessary. If retired, a historical-use assessment may still be separately warranted, but that is
an incident/remediation question rather than proof of the design defect.

### Cluster B — canonical account closure

No production occupancy read is required to design for complete governed disposition. Runtime
occupancy becomes relevant before data migration, cleanup, backfill, or release acceptance.

### Cluster C — lineage

No production row census is required to decide whether lineage belongs inside this F5 repair scope.
If it does, occupancy and source recoverability become necessary before any backfill or historical
repair can be authorized.

## 6 · The S5 manifest substrate does not create a P2 exception

The existence of `deletion_manifests`, `deletion_manifest_scopes`, and `provenance_tombstones` might
make a production census tempting. P1 expressly found that account closure has no located runtime
integration with them.

P2 therefore refuses this inference:

```text
manifest tables exist → query their production rows now → decide architecture from what happens to be there
```

Architecture must first be adjudicated from law and mechanism. Population is consulted only where a
later decision genuinely depends on it.

## 7 · Standing

```text
P0 CONFORMANCE MAP                COMPLETE
P1 SURFACE / OVERLAP CENSUS       COMPLETE
P2 RUNTIME EVIDENCE DOCKET        COMPLETE
PRE-DESIGN PRODUCTION READ        NOT REQUIRED · NOT SPENT

EVIDENCE PHASE                    COMPLETE FOR REPAIR-SCOPE ADJUDICATION
REPAIR DESIGN                     CLOSED
IMPLEMENTATION                    CLOSED
PRODUCTION                        UNTOUCHED

NEXT                              P3 founder adjudication of repair scope
```

P3 must decide jurisdiction before architecture. At minimum it must rule on:

1. **Cluster A** — is the legacy `/api/sovereignty` authority inside the repair lane, and in what
   disposition class (retain/integrate/retire/other — no option preferred here)?
2. **Cluster B** — does the repair-design lane own canonical account-closure orchestration across
   storage graph, Circles lifecycle, member-visible truth and manifestability?
3. **Cluster C** — does lineage remain inside F5 repair or split into its own governed lane?
4. **S5 manifest substrate** — may P4 consider reuse as a candidate, or must it remain merely an
   external constraint/affordance?
5. **positive controls** — explicitly preserve the P0/P1 conformant mechanisms from opportunistic
   redesign.

**STOP — founder scope ruling required before repair architecture.**
