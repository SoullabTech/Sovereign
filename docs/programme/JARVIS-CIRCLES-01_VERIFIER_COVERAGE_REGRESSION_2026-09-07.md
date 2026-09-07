# R4 verification — instrument regression, and the coverage law it produced

```text
R4 PRODUCT REPAIR       provisionally sound
R4 VERIFICATION         NOT ACCEPTED
VERIFY                  INSTRUMENT REGRESSION
R5                      NOT STARTED
```

## 1. The run — preserved, not erased

Founder-run shadow witness against `a148a13e`:

```text
31 passed · 0 failed · 0 warned · 0 skipped   →   exit 0
```

⛔ **Not a full VERIFY PASS.** The apparent improvement from `34/1` to `31/0` came **partly from
four assertions disappearing**, not only from C6 being fixed.

**Retained as evidence of the regression.** A green run that was green for the wrong reason is
exactly the artefact worth keeping.

## 2. What was deleted, and by whom

**Jarvis's error.** The R4 edit replaced the C6 block by splicing from the C6 marker to the C14
marker — and C9, C10, C11 and C13 were sitting inside that span:

| | Obligation lost |
|---|---|
| **C9** | FR-06 discovery boundary |
| **C10** | FR-07 collective-release absence |
| **C11** | FR-01 / FR-08 representational crossing |
| **C13** | B-01 Circle API access gate |

All four were present at `d1742472`. None was removed deliberately, and none was mentioned in the
R4 record — which is itself part of the defect: **a silent coverage loss reads identically to a
clean pass.**

## 3. The boundaries themselves held

Founder's direct check against `a148a13e`:

```text
C9   discovery paths             0
C10  collective-release paths    0
C11  live-pointer dereference    no
C13  Circle API routes          17   ·   ungated routes   0
```

**No evidence R4 weakened those four product boundaries.** But — and this is the point —
**direct inspection does not substitute for restoring them to the verifier.** An obligation checked
once by hand is not an obligation the instrument holds.

## 4. ⭐ FR-14 — the verifier coverage law

> **A verifier passes only when every executed assertion passes AND every required constitutional
> assertion is still present.**

```text
PASS = 0 failed  AND  no required assertion missing
```

`0 failed` is **necessary but not sufficient**. This run demonstrated why:

```text
delete four assertions
  → none of the remaining assertions fail
  → verifier reports 0 failed
```

> **An instrument can satisfy all of its remaining questions by forgetting to ask the difficult ones.**

The invariant is therefore not *the suite is green*. It is **the obligations are still represented,
and every represented obligation passes.**

⛔ **Not a frozen numeric total** — brittle, because legitimate new assertions raise it. A
**named coverage floor** instead:

```text
required assertion missing  →  FAIL
required assertion failed   →  FAIL
new assertion added         →  allowed
all required + new pass     →  PASS
```

⛔ **An ID leaves the floor only by a founder act retiring the obligation itself** — never to make a
run green. That would be the exact failure this exists to catch.

## 5. The instrument repair

**C9, C10, C11, C13 restored verbatim from `d1742472`.** Kept: the new destination-aware C6 · C14 ·
every R1/R2/R3 assertion · the R4 product changes. **No Circle behavior changed. No other repair
touched.** Committed separately, as an instrument repair *within* R4 — not R5, not a new product
repair.

**`REQUIRED_ASSERTIONS`** now names all **35** obligations. Every `pass`/`fail`/`warn`/`skip` records
the leading ID; a missing required ID is reported in a **COVERAGE** section and **counts as a
failure** — *a missing obligation is not a smaller test suite, it is an unverified boundary.*

Checked **last**, so a group that aborts mid-way still reports which obligations went unasked rather
than hiding behind the assertions that ran.

**Targeted test of the mechanism** (isolated, no database): with `C13` removed from a sample run,
the check reports `missing: C13` → FAIL. Labels without an ID (`GROUP S aborted`) are harmless.

**The result line now reads both parts**, so a future reader cannot mistake a total for a gate:

```text
N passed · 0 failed · 0 warned · 0 skipped
coverage: 35/35 required assertions executed
PASS = 0 failed AND no required assertion missing. The total is never the gate.
```

## 6. Re-run required

⛔ **Not verified from this session** — no `DATABASE_URL`, no `node_modules`.

Confirm **all 35 required IDs execute** and `0 failed`; fixtures roll back; shadow and worktree
deleted; production remains unmigrated and unchanged. ⛔ **Do not call the result PASS because its
numeric total matches an expectation.**

Only on `all required present AND 0 failed` does `R4 = VERIFIED ON CANDIDATE` and `R5 · CLASS-B
RE-CENSUS` open — read-only, no repair, no deploy, no INVOKE, no cohort.
