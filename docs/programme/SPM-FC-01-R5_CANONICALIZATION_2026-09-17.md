# SPM-FC-01-R5 — CANONICALIZATION WITNESS

**Date:** 2026-09-17

```text
TYPE                  DOCUMENTARY CANONICALIZATION ONLY
FOUNDER AUTHORITY      in-session continuation into the canonicalization gate
CANONICAL BASE         78a85f652d9ecd3b993c183d67423f2215a46730
R5 LINEAGE TIP         c2c62b53d7790106f072b1ea1f3fce02016bb88b
INDEPENDENT SWEEP      40f1d821c64ad73504e6ad0cbcbf0d313d1162b5
R5 MERGE               30e402ead
INDEPENDENT MERGE      19614946c

IMPLEMENTATION         CLOSED
F5 REPAIR              NOT OPEN
PRODUCTION             UNTOUCHED
```

## 1 · Canonicalization rule

SPM-FC-01-R5 becomes canonical programme truth only when the canonical branch
`clean-main-no-secrets` contains this witness commit as an ancestor.

Branch names do not confer canonical standing by themselves. The test is ancestry:

```bash
git merge-base --is-ancestor <THIS_WITNESS_COMMIT> origin/clean-main-no-secrets
```

Exit status `0` is the canonicalization witness. Until then, this file is a prepared canonicalization
record on a candidate branch.

## 2 · What is being canonicalized

The canonicalized constitutional object remains the R5 **composite**, not a rewritten single-file
fiction. Founder ratification `18f95363a` binds manifest SHA-256:

```text
75932893bd8beddac5f08666a3aa4656b28683036cf4d8a9d0b96c73626e33b7
```

The governing lineage includes the historical base with routing annotations, R2 scope overlay, R4
four-clause correction, R5 I-8/I-33 disposition, R5 bounded re-adjudication, local D9-A provenance
sweep, discoverability repair, and the independently custodied sweep at `40f1d821c`.

## 3 · Separate custody preserved

The independent sweep was merged as its own history rather than copied into the R5 line.

```text
R5 merge parent             c2c62b53d
independent sweep parent    40f1d821c
```

This preserves the fact that the final verification was independently authored and was not rewritten
onto the R5 branch merely to simplify lineage.

## 4 · Stale ratification line excluded

The parallel pre-R5 accounting lineage is intentionally **not** imported:

```text
d1d942e54   pre-R5 founder ratification       NOT AN ANCESTOR
8fe80d366   stale programme-state bullet       NOT AN ANCESTOR
```

Those records remain historical on their own branch. They do not become current canonical truth by
this act.

## 5 · Containment

Against canonical base `78a85f652`, the incoming R5 + independent-sweep history changes only:

```text
CLAUDE.md
docs/**
```

No `app/`, `lib/`, `database/`, migration, schema, route, UI, prompt, provider, build, runtime,
deployment, or production object changes in this canonicalization.

## 6 · Standing carried into canon

```text
SPM-FC-01-R5             RATIFIED
local D9/F5 laws         31 = 16 unchanged + 10 R2 + 4 R4 + 1 R5
I-19                      DECLARED GAP · no law
I-33                      IMPORTED BINDING DEPENDENCY · temporal-memory provenance
D9                        CLOSED · qualifications preserved
F5 TRACE                  COMPLETE
F5 ERASURE CONFORMANCE    FAIL / STOP
organism conformance      NOT ESTABLISHED
implementation            CLOSED
F5 repair lane            NOT OPEN
production                UNTOUCHED
```

Canonicalization changes **where the documentary authority is reachable**, not what the law says and
not what the organism does.

## 7 · Finding 2 preserved deliberately

R3 deleted the defective closing synthesis rather than marking it superseded. The independent sweep
flagged this as a minor departure from the programme's usual supersession practice and sought no
reversal. This canonicalization records the deletion as deliberate and leaves it unchanged.

## 8 · Stop boundary

Canonicalization does not authorize the next implementation or conformance act. In particular:

```text
no F5 repair
no schema / FK design
no migration
no route or middleware change
no UI change
no backfill
no deployment
no production mutation
```

After canonicalization is witnessed by ancestry, the constitutional-contract lane is closed. Any
subsequent conformance or repair work requires its own authority-bearing lane.

**STOP.**
