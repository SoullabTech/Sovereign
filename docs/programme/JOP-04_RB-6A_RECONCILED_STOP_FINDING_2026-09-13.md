# JOP-04 · RB-6A — Reconciled Candidate Run · ⛔ **STOP — MATRIX MISMATCH**

**Date:** 2026-09-13 · ⛔ **RB-6A host acceptance NOT re-closed. IPC witness NOT run.**

```text
RB-6A CANDIDATE        fd543df1    fractured
MATRIX FROZEN AT       c774dd6c    before the repair existed
RECONCILED CANDIDATE   3f25932b    Option B
JUDGE                  8a62ea93 → e11dfc3d
```

**Result: 16/18 MATCH. `RB-CAL-4a` and `RB-CAL-4d` returned RED against a frozen GREEN.**
⛔ **The matrix has not been edited.**

---

## 1 · What the repair actually does

```text
router.mjs    export { declareRoutingEligibility } from './routing-eligibility.mjs';
              ⭐ PURE re-export — never bound into router scope, so the router
                 CANNOT self-mint. Structural, not disciplinary.
main.js       const { route, declareRoutingEligibility } = await import(routerUrl?t=…);
              ⭐ ONE graph. The independent eligibility import is GONE (grep: 0).
```

`routing-eligibility.mjs` **untouched** — as CAL-4b's GREEN said it should be.

**Behaviour under the discipline the host now uses:**

```text
mint via router graph                      → C0            ✅
5 fresh cache-busted routers, same object  → all accept    ✅
minted by router#1, tested by router#2     → C0            ✅
forged lookalike                           → refused       ✅
no declaration                             → refused       ✅
unregistered + eligible                    → C3, never C0  ✅
```

Subject proofs: `desktop-c0-explorer-proof` **52/0**, `deterministic-registry-proof` **11/0**.

## 2 · ⭐⭐ Why CAL-4a and CAL-4d are RED — the diagnosis

```text
OLD discipline — independent cache-busted eligibility mint  → refused_not_routable
NEW discipline — mint via the router graph                  → C0
```

**CAL-4a and CAL-4d still reproduce the OLD host discipline.** Their frozen precondition says
*"PRODUCTION-SHAPED — router cache-busted, eligibility INDEPENDENTLY cache-busted."* ⛔ **After the
repair that is no longer production-shaped.** `main.js` performs no independent eligibility import;
the string does not appear in the file.

> ⭐ **Option B did not HEAL the cross-loader fracture. It REMOVED the production path that created
> one.**

Those are two different repairs. The frozen matrix encoded **heal**; the authorized repair was
**eliminate** — chosen precisely because it *"makes the invalid state much harder to express."*
**Freezing a heal-shaped expectation for an eliminate-shaped repair was my error.**

## 3 · ⚠️ And the literal frozen expectation may have been the wrong thing to want

Under the frozen law — *one authoritative identity lineage* — an object minted from a
**non-authoritative** lineage **should be refused**. Accepting it would mean the brand no longer
distinguishes lineages at all.

> ⛔ **CAL-4a returning GREEN as written would have indicated a WEAKER brand, not a repaired one.**

That is the RED's substantive content: the current result says *"an object from a lineage the host
does not use is refused."* Post-Option-B that is **correct behaviour**, not a defect — but it is
**not** the proposition CAL-4a was frozen to test.

## 4 · Adjudication owed — ⛔ not performed here

1. **Re-specify CAL-4a and CAL-4d to follow the host**, minting through the *authoritative* graph as
   `main.js` now does, and freeze a new matrix **before** re-running. Their frozen *meanings* are
   unchanged; only the specimen's notion of "production-shaped" moves, exactly as F3/F6 did after
   RB-6A.
2. ⭐ **Retain the old-discipline arm — renamed, as a CONTROL.** It tests a real and still-valuable
   property: *an object carrying a genuine brand from a NON-authoritative lineage is refused.*
   Together with CAL-4c that gives **two distinct ways to fail authority**:

   ```text
   NO brand at all        (forgery)        → refused   CAL-4c
   WRONG-LINEAGE brand    (stale graph)    → refused   ← this arm, repurposed
   AUTHORITATIVE lineage                   → accepted  ← re-specified CAL-4a
   ```

   ⭐ That is a stronger three-way discrimination than the original pair, and it is **available only
   because the repair changed the topology.**
3. Decide whether *"production-shaped"* should be **derived from the host source** rather than
   hard-coded in the probe — otherwise this staleness recurs at every topology change. ⚠️ A probe
   that reads the host to decide how to load is powerful and easy to get wrong; recommending it is
   not the same as authorizing it.

## 5 · Standing

```text
RECONCILED CANDIDATE   3f25932b   built · subject proofs pass · NOT accepted
CAL-4b · CAL-4c        GREEN      brand sound · unforgeability intact
CAL-4a · CAL-4d        RED        ⛔ probes reproduce the PRE-repair host discipline
ALL 14 OTHER PROBES    MATCH      F3/F6/CAL-3a still RED — RB-6B untouched

REAL IPC WITNESS       ⛔ NOT RUN — blocked on this adjudication
RB-6A HOST ACCEPTANCE  ⛔ STILL REOPENED
RB-6B                  ⛔ NOT OPEN
RB-6 EMBARGO           ACTIVE
```

> **A repair that eliminates a state rather than fixing it will fail a matrix written for the fix.
> That is the matrix being wrong about the repair — which is exactly what freezing it before the
> run is for.**
