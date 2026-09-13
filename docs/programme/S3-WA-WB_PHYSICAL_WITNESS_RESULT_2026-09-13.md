# S3 · W-A / W-B — PHYSICAL WITNESS RESULT

**Candidate** `3a65ad1baadf8f2afe37808bbfa61dd7f2586ff4`
**Frozen law** `2255b60d`
**Date** 2026-09-13
**Result** ⭐ **W-A PASS · W-B PASS**

⛔ **This record authorizes neither route integration nor merge.** The candidate
remains non-canonical. Production was not contacted.

## Method

Founder-run on the Mac Studio against a fresh disposable local PostgreSQL shadow
built from the repository baseline and every migration at the candidate SHA.
The shadow carried all three S3 migrations:

- `20260913000001_ask_authorization_acts.sql`
- `20260913000002_disclosure_boundary_developmental_ask.sql`
- `20260913000003_disclosure_gesture_authorize_sections.sql`

The witness used only synthetic members, Works, threads and outcomes. The
physical shadow and the ephemeral witness worktree were destroyed after the run.
## W-A · real concurrent database claim

Eight independent PostgreSQL connections raced the same valid opportunity using
the candidate's claim statement.

```text
independent connections   8
successful claim rows      1
losers                     7
consumption rows           1
foreign-member claim rows  0
foreign consumptions       0
expired claim rows         0
expired consumptions       0
post-race replay           interrupted / no fresh claim
```

⭐ The UNIQUE `act_id` + `INSERT … SELECT … ON CONFLICT DO NOTHING` construction
produced exactly one winner under real database concurrency. Member binding and
expiry in the claim predicate also produced no consumption row for a foreign or
expired opportunity.

This discharges the physical-atomicity obligation S3-F1 could only model.
## W-B · crash / recovery — six cases

### 1 · claimed · process exits · no completion

A separate process won the claim and exited before recording completion. A new
process/context then read the durable facts.

```text
claim survived process exit   true
derived state                 interrupted
retry                         already / interrupted
consumption rows              1
new disclosure receipts       0
```

The same opportunity did not become resumable merely because no completion
existed.

### 2 · completed · response lost

```text
first completion              recorded
retry                         already / completed
same completion identity      true
additional consumption        0
```
### 3 · completed · outcome later deleted

A synthetic MAIA turn was created, named as the completion identity, and then
deleted. The S3 consumption retained its positive completion fact.

```text
outcome row present before delete  true
outcome row present after delete   false
S3 derived state                   completed
completion identity retained       true
```

⭐ Deleting the held outcome did not turn completion into interruption or
pending authority.

### 4 · unclaimed · expired

```text
claim result                 unclaimable / expired
consumption rows             0
```

Expiry remained a claim predicate. It created no state transition and no row.
### 5 · deletion custody

```text
direct consumption DELETE      REFUSED
direct opportunity DELETE      REFUSED
TRUNCATE consumptions          REFUSED
TRUNCATE opportunities         REFUSED
thread cascade                 removed opportunity + consumption
Work cascade                   removed thread + opportunity + consumption
```

⭐ The database, not repository convention, now distinguishes pruning from a
lawful parent cascade. The child DELETE trigger's parent-existence predicate is
the load-bearing mechanism.

### 6 · completion monotonicity

```text
first completion              recorded
same completion again         already
original completed_at kept    true
different completion          conflict / REFUSED
canonical completion changed  false
completion on unclaimed act   no_consumption
```

The candidate now truthfully distinguishes every completion outcome it claims
to distinguish.
## Scope boundary — what these witnesses do NOT prove

`context_disclosure_receipts` remained `0 → 0` throughout the substrate run.
That proves the unwired M1–M3 substrate itself minted no disclosure receipts.

⛔ It is **not** a route-level claim that a future integrated ACT 3 performs zero
unauthorized crossings. The developmental Ask is deliberately unwired; that
claim belongs to the later integration witness.

## Candidate and freeze checks

```text
S3 substrate guards            7 / 7 PASS
frozen constitutional typecheck PASS
frozen matrix                  LETHAL · DISCRIMINATING · reference clean
freeze diff vs 2255b60d        EMPTY
canonical ship typecheck       PASS · 229 errors vs baseline 239 · 0 regressions
tracked witness-tree diff      EMPTY
```

### ⚠️ `typecheck:s3-substrate` remains RED — instrument scope, not hidden

With real project dependencies present, the custom strict config gets past `pg`
and reaches an inherited error in `lib/db/postgres.ts:206` under
`noUncheckedIndexedAccess`: `result.rows[0]` is typed `T | undefined` while the
helper promises `T`.
`lib/db/postgres.ts` is byte-unchanged between the Class-B freeze and this
candidate. The repository's normal `tsconfig.ship.json` no-regression gate passes.

So the custom S3 typecheck is honestly **not green**; it has exposed an instrument
scope/configuration debt. ⛔ No compiler setting was weakened to manufacture a
pass.

## Operational observation — expected refusal logs as an error

The contradictory-completion case correctly returned `conflict`, but the shared
`query()` helper logged the database trigger refusal at error level before M3
translated it. The log carried synthetic identifiers only in this witness.

This is not a completion-law failure: the contradictory completion was refused
and the canonical completion stayed unchanged. It is an operational-noise
finding for later integration hygiene, not a reason to rewrite the witness.

## Containment

```text
candidate source       unchanged
route integration      untouched
production             untouched
shadow database        destroyed
witness harness         destroyed
witness worktree        destroyed
member-authored content none — synthetic fixtures only
```
## Standing

```text
CLASS-B FREEZE        INTACT @ 2255b60d
M1 · M2 · M2b · M3    CANDIDATE @ 3a65ad1b
W-A                    ⭐ PASS · physical atomicity established
W-B                    ⭐ PASS · all six recovery/custody cases established
SUBSTRATE GUARDS       7 / 7 PASS
SHIP TYPECHECK         PASS · 0 regressions
S3 SUBSTRATE TYPECHECK ⚠️ RED · inherited instrument-scope issue, not concealed
ROUTE INTEGRATION      ⛔ NOT AUTHORIZED
MERGE                  ⛔ NOT AUTHORIZED
PRODUCTION             UNTOUCHED
```

W-A and W-B are discharged for this candidate. The next programme act is a
separate founder ruling; these witnesses do not themselves authorize route
integration, canonical merge, or schema deployment.
