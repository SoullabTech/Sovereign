# REVIEW-CUSTODY-01 · STEP 1 — FALSIFIER SUITE + DEFEAT CANDIDATES

**Date** 2026-09-20 · **Status** STEP 1 COMPLETE · MATRIX **LETHAL + DISCRIMINATING**
**Opened by** founder election of option (b) — Claude-on-Claude review wiring
⛔ **STEP 2 (review-authoring procedure) NOT OPENED** · ⛔ **STEP 3 (founder act naming the
first bound surface) NOT OPENED** · ⛔ **INSTRUMENT STILL UNWIRED, GATING NOTHING**
**Predecessor** `DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md` — which recorded this
step as owed, and recorded the 13-case probe as *a probe, not a record*.

---

## What Step 1 was for

The instrument's verification was a disposable probe run ad hoc from a scratchpad. This
step replaces it with a committed suite, and — the part that makes it evidence rather than
decoration — **proves the suite kills fourteen deliberately wrong custody implementations
before the instrument is relied on.**

Sequencing, carried from the S3 Class-B discipline: **lethality is a precondition of
reliance, not a hope about it.**

---

## What landed

```text
scripts/review-custody-core.ts                        pure core; all custody decisions
                                                      reached through CustodyDecisions
scripts/review-custody.ts                             CLI shell; hard-codes STRICT
tests/constitutional/review-custody/falsifiers.ts     RC-F1 … RC-F14
tests/constitutional/review-custody/candidates.ts     DC-1 … DC-14
tests/constitutional/review-custody/matrix.ts         lethality + collateral adjudication
tsconfig.review-custody.json                          strict · noUncheckedIndexedAccess
package.json                                          review:custody:matrix
                                                      typecheck:review-custody
```

⭐ **The seam is a decision seam, not a configuration flag.** The shipped code contains **no
branch** for any weaker rule: it calls `decisions.isMaterial(f)`, and the CLI supplies
`STRICT` with no override path. A defeat candidate replaces one decision *as code*. ⛔ There
is no flag in the shipped path that could be flipped in production.

⛔ **Behaviour is unchanged by the refactor.** The thirteen probe cases were re-run against
the new CLI and produce the same outcomes, now with named refusal codes
(`MATERIAL_UNDER_APPROVED`, `PLAN_MISMATCH`, `NO_COVERAGE`, `DUP_ID`, `NO_LIMITATIONS`,
`NO_EVIDENCE`, `BAD_SEVERITY`, `EMPTY_REVIEW`, `MALFORMED_REVIEW`, `CONFLICT`).

---

## The fourteen laws, and what each one kills

| Falsifier | Law | Defeat candidate |
|---|---|---|
| RC-F1 | APPROVED may not coexist with a material finding — **high AND medium** | DC-1 *mediums are nits* |
| RC-F2 | The record's plan hash governs, never the review's own claim | DC-2 *trusts the review's plan claim* |
| RC-F3 | An empty review is refused **as empty** | DC-3 *empty output is an empty object* |
| RC-F4 | A valid review plus a truncated tail is **not recovered** | DC-4 *lenient parse* |
| RC-F5 | Absent coverage is refused, not informational | DC-5 *coverage is informational* |
| RC-F6 | A repeated finding id is refused, not de-duplicated | DC-6 *de-duplicates by id* |
| RC-F7 | Admission is monotonic: `already` **preserves the original timestamp**; a different review is `conflict` | DC-7 *last write wins* |
| RC-F8 | An approval does not survive a plan edit | DC-8 *staleness IS the commit* |
| RC-F9 | An **untracked file alone** invalidates the manifest | DC-9 *tracked-only manifest* |
| RC-F10 | The manifest binds **content**, not the set of touched paths | DC-10 *manifest is the path set* |
| RC-F11 | `limitations` must be present as a claim, never defaulted | DC-11 *limitations default to none* |
| RC-F12 | Every finding must carry evidence | DC-12 *evidence is optional prose* |
| RC-F13 | The severity vocabulary is **closed** | DC-13 *open vocabulary, unknown → low* |
| RC-F14 | `check` requires the admitted verdict to BE APPROVED | DC-14 *a review exists, therefore reviewed* |

⭐ **The falsifiers assert the refusal's IDENTITY, not only its existence.** A refusal that
does not name its condition is how an operator learns to ignore an instrument — the same
argument that governed the S3 substrate typecheck disposition. So "refused for the wrong
reason" is a failure, and RC-F3's kill rests on exactly that: DC-3 does refuse the empty
review, but as `BAD_VERDICT`, which is undiagnosable as *the reviewer returned nothing*.

---

## Matrix result

```text
REFERENCE  STRICT satisfies 14/14 laws
LETHAL     14/14 candidates DIED on their named falsifier
COLLATERAL all classified with a stated reason
EXIT       0
```

**One candidate carries collateral, and it is irreducible.** `DC-8 · staleness IS the commit`
additionally defeats RC-F9 and RC-F10, because an implementation whose staleness notion *is*
the commit consults no manifest at all and therefore cannot see a working-tree change of any
kind. ⛔ Narrowing it to kill only RC-F8 would require giving it both the plan hash and the
manifest — at which point it is no longer the error it models. **CLASSIFIED**, per the S3
collateral rule: *if removing the collateral requires the candidate to cease embodying its
constitutional error, that collateral is irreducible.*

The matrix fails on three conditions and no others: a surviving candidate, **undeclared**
collateral (a corpus isolation defect, not a finding about the suite), and a **declared
collateral that stops firing** (a stale claim, reported rather than tolerated).

---

## ⭐ Two results worth more than the green

**1. The matrix's first run went RED on the FALSIFIER, not on a candidate.** RC-F12 failed
against `STRICT`: the fixture called `F(id, sev, undefined)`, and passing `undefined`
explicitly **triggers the default parameter**, so the finding silently carried evidence and
nothing was omitted. The suite's own law has a mirror: *a surviving candidate repairs the
suite; a falsifier that fails the reference repairs the falsifier.* The fixture now omits the
key outright, with a comment saying why. ⭐ **A suite that had only ever been run against the
conforming implementation would have reported this as a pass.**

**2. One rule could NOT be made falsifiable, and is therefore NOT claimed as enforced.**
The core keeps a deleted path in the manifest as `ABSENT` rather than dropping it. Every
attempted construction of a case where *skipping missing paths* changes the outcome failed:
if a path existed at bind and is gone at check, dropping it still changes the fingerprint, so
the movement is caught either way. For "skip missing" to be undetectable the path would have
to be absent at bind **and** deleted later — which is not a deletion. **So the ABSENT rule is
recorded as DEFENCE IN DEPTH, ⛔ not as a law this suite enforces.** A negative result, stated
because the alternative is a falsifier that pretends to test something it cannot reach.

---

## Honest limit of the corpus

⚠️ **Each candidate replaces exactly ONE decision on an otherwise-identical mechanical
substrate.** The matrix therefore establishes **decision-level lethality**. ⛔ It does **not**
establish lethality against an independently authored custody implementation that makes the
same error by a different route. Buying that would mean fourteen standalone implementations,
whose accidental differences would generate unclassified collateral and *weaker* evidence —
so the narrower claim is made deliberately, not by omission.

⚠️ **Run provenance**: `review:custody:matrix` and `typecheck:review-custody` are
**repository-defined commands**, so a founder run is the evidence of record. In this session
both were executed with TypeScript/tsx resolved from a scratchpad (the container has no
`node_modules`): matrix **exit 0**, typecheck **exit 0** under `strict` +
`noUncheckedIndexedAccess`. ⛔ The project-wide gates (`npm run typecheck`, preflight) were
**NOT RUN** here, and the new paths sit outside `tsconfig.ship.json`, so they cannot move the
typecheck baseline.

---

## ⛔ FREEZE OWED BEFORE STEP 2

⭐ **DISCHARGED same day** — `REVIEW-CUSTODY-01_SUITE_FREEZE_2026-09-20.md`: taken at
`bbb5ff5c`, pinned by git blob hash, guard `npm run verify:review-custody-freeze` proven lethal
both ways. Step 2's eight new laws landed **additively** with zero frozen bytes edited. The text
below is kept as written rather than edited.

Per the S3 Class-B precedent, the moment lethality is proved the suite should FREEZE, so that
a later inconvenience cannot quietly domesticate the fourteen tests that killed its
predecessors. **Lawful** is *implementation fails suite → repair the implementation*.
⛔ **Forbidden** is *→ reinterpret the law → weaken the test*. Any change after the freeze
requires evidence the **LAW or the INSTRUMENT** was wrong — never that an implementation was
inconvenient. ⛔ **The freeze is a founder act and is NOT taken here.**

---

## Standing

**STEP 1 ✅ COMPLETE · SUITE ⭐ LETHAL + DISCRIMINATING (14/14 candidates dead · STRICT 14/14 ·
collateral CLASSIFIED) · MATRIX EXIT 0 · TYPECHECK EXIT 0 (strict · noUncheckedIndexedAccess) ·
⭐ ONE FALSIFIER DEFECT FOUND AND REPAIRED BY THE MATRIX ITSELF · ⭐ ONE RULE RECORDED AS
DEFENCE IN DEPTH, ⛔ NOT CLAIMED AS ENFORCED · ⚠️ LETHALITY IS DECISION-LEVEL, ⛔ NOT
IMPLEMENTATION-INDEPENDENT · ⛔ FREEZE NOT TAKEN · ⛔ STEP 2 NOT OPENED · ⛔ STEP 3 NOT OPENED ·
⛔ INSTRUMENT UNWIRED · ⛔ PROJECT GATES NOT RUN IN CONTAINER · ⛔ FOREIGN-PROVIDER HOLD
UNCHANGED · PRODUCTION UNTOUCHED.**
