# MAIA-MEMORY-RETURN-AUTHORITY-01 / R1A — Canonical P6 Writer Repair

```text
STANDING            IMPLEMENTATION CANDIDATE · Class A
BASE                clean-main-no-secrets @ f1c1f96f8531a1812630311cc8d36559995d5e80
LIVE READER         d4655e6477fa40b8f94c5f8f91be47198288d2af
DONOR INSPECTED     3e31bc0ff4e050f9cfd35bdc68c70fbcb772e56c
DATE                2026-10-02
MERGE / DEPLOY       NOT AUTHORIZED BY THIS RECORD
PRODUCTION WRITE     NONE
```

## 1. Exact problem

Production already carries the fail-closed P6 schema default:

```text
member_memory_atoms.return_preference DEFAULT 'member_pulled'
20260903000001_return_authority_fail_closed.sql ledgered 2026-09-03
```

Canonical did not carry the matching writer bindings.

That creates two opposite failures from one missing boundary:

```text
practitioner observation  → explicit contextual_doorway → too permissive
member Keep               → omitted preference          → too restrictive
```
Production metadata establishes both consequences without reading member content:

- 12 historical practitioner observations still carry `contextual_doorway`;
- 1 of those rows / 1 member is currently prompt-eligible;
- 1 post-P6 `generated_by='member-gesture'` row inherited `member_pulled`;
- that member row has not been touched since creation.

The current Keep API exposes no keep-time return-preference input.
A later member reseal/allow-return act is a separate `set_return_preference` gesture and updates
`last_touched_at`.

## 2. Governing law is not new

R1A introduces no standing or consent vocabulary.

Existing canonical doctrine says:

> Keeping is the consent act.
> Return is the default meaning of keeping.
> Sealing is the exception.
> Resealing remains member-controlled.

Current Memory Organism governance separately records the practitioner defect: practitioner
authorship does not confer permission for MAIA to return that material contextually.

Therefore three properties remain independent:

```text
CONTENT AUTHORSHIP
≠ EPISTEMIC AUTHORITY
≠ RETURN AUTHORITY
```
## 3. R1A implementation

### Return-authority boundary

R1A ports the already-certified donor mechanism into the kept canonical lineage at:

`lib/psyche/returnAuthority.ts`

It provides:

- `memberConferredReturn(preference, evidence)` — refuses unless acting member equals subject;
- `noContextualReturn(reason)` — produces the fail-closed `member_pulled` disposition;
- `returnPreferenceValue(...)` — the only ordinary binding seam into a writer;
- an unexported type brand so arbitrary modules cannot construct the permission object normally.

The current canonical programme is cited as authority; the absent historical MIPA spec is not
made a canonical dependency.

### Member Keep

`lib/psyche/portfolio.ts` now constructs `contextual_doorway` explicitly from the authenticated
member's own Keep act and names `return_preference` in the INSERT.

The production column default no longer decides the semantics of a member gesture.

### Member preference gesture

`set_return_preference` goes through the same member-conferred boundary.
The existing member ownership predicate remains unchanged.

### Practitioner observation

The With-Me writer now binds `member_pulled` through `noContextualReturn(...)`.
The observation is still stored, attributed, witnessed, and epistemically `observed`.
Only ungranted contextual return is withheld.
## 4. Historical migration custody restored, not re-executed

R1A restores:

`database/migrations/20260903000001_return_authority_fail_closed.sql`

from donor commit `3e31bc0ff4e050f9cfd35bdc68c70fbcb772e56c`.

Blob identity:

```text
donor   a370ee4d71e7a16d0564ee53bb753a5595d73e7a
restored a370ee4d71e7a16d0564ee53bb753a5595d73e7a
```

Production already records this exact filename in `schema_migrations`.
The production migration runner skips by ledger filename.

Read-only candidate-files ↔ production-ledger comparison at R1A freeze:

```text
production-pending migrations = 0
```

So restoring repository custody does not create a migration act.

The production ledger's historical checksum for this row is empty. R1A therefore does not claim
a byte-for-byte production execution witness from the ledger; it records the recoverable donor
source, matching live schema default, and existing programme history separately.

## 5. Certification

The recovered P6 certification suite was reconciled to current canonical and retained as:

`__tests__/mipa-p6-doorway-consent-integrity.test.ts`

It derives the writer closed set from source rather than maintaining a hand-waved allowlist.
Focused witness after reconciliation to canonical `f1c1f96f8`:

```text
P6 doorway-consent certification   PASS
With-Me completion governance      PASS
capsule / keepSource regression     PASS

test suites                         3 / 3
tests                               66 / 66
git diff --check                    clean
```

TypeScript no-regression witness from this candidate lineage:

```text
tsconfig.ship.json
program files   4682
errors          222
baseline        239
regressions     0
```

The certification specifically holds:

1. every assignment of `return_preference` is in the bounded writer set;
2. every binding site routes through the return-authority boundary;
3. the practitioner writer cannot regain a contextual literal;
4. member Keep still confers contextual return explicitly;
5. member reseal / allow-return remains authenticated and member-scoped;
6. authorship never derives return authority;
7. return authority never rewrites authorship;
8. the ambient reader gate itself is unchanged.

## 6. Why historical data repair is not in R1A

An initial reconciliation migration candidate was constructed and successfully parsed against the
live production schema using `EXPLAIN` inside a read-only transaction. It would have:

- resealed the 12 untouched historical practitioner rows;
- caught any untouched current-writer practitioner rows;
- restored untouched post-P6 member Keeps that inherited `member_pulled`.

That migration is deliberately **not** part of R1A.
Production deploy ordering is:

```text
migrations → candidate swap
```

If data reconciliation and writer repair shipped together, the old live reader would remain able
to create a new wrong practitioner row or an over-restricted member Keep after the migration
committed but before the candidate swap.

That is a real race, not a probability question.

R1A therefore follows:

```text
future-writer repair → deploy/witness R1A → only then historical reconciliation
```

This also gives the later migration-compatibility review the correct old reader: a reader whose
writers already obey P6.

## 7. R1B boundary

R1B is not implemented in this branch.

Once R1A is the exact live reader, R1B may reconsider one bounded migration using these
evidence-derived populations:

```text
historical practitioner contextual rows, untouched before P6       12
current-writer contextual rows, untouched at latest census          0
post-P6 member-gesture member_pulled rows, untouched                1
```

Any member-touched row must remain outside the repair set.

R1B must receive a fresh exact migration Review-Custody + old-reader compatibility witness against
the then-live R1A reader before production mutation.
## 8. Explicit exclusions

R1A does not:

- open the later "P6 attribution framing" step;
- close the Cut 1A production-shadow witness;
- alter FAST MemoryBundle prompt bytes;
- merge the separate G2 standing-shadow lane;
- open M3;
- build Continuity Mode;
- change retrieval, ranking, significance, source ancestry, or member-response semantics;
- backfill or reinterpret historical content;
- deploy anything.

The naming collision remains explicit: **MIPA/P6 return authority** and the later **P6 attribution
framing** are different acts with different gates.

## 9. Production witness posture

Current production `d4655e647` is canonical-lineage and contains Cut 1A, but no persisted
conversation turn has yet exercised the current container; Cut 1A therefore remains unwitnessed.

That fact does not block this local return-authority writer repair, and R1A does not claim to
satisfy the separate Cut 1A → attribution gate.

For R1A itself, deployment provenance can establish that the repaired writer bytes are running.
No synthetic member or practitioner material should be created in production merely to make an
acceptance witness happen. If a natural future write exercises the path, a bounded metadata-only
witness may confirm the resulting authority state.

## 10. R1A disposition

```text
return-authority boundary         CANDIDATE BUILT
member Keep binding               REPAIRED
member preference gesture         BOUND
practitioner writer               FAIL-CLOSED
historical P6 migration custody   RESTORED · already ledgered
production-pending migrations     0
historical data reconciliation    DEFERRED TO R1B
focused tests                     66 / 66 PASS
TypeScript regressions            0
merge                             NOT AUTHORIZED BY THIS RECORD
deploy                            NOT AUTHORIZED BY THIS RECORD
```

Next lawful gate: ordinary Class A review/admission of this exact R1A candidate.
