# JOP-04 · RB-6A — Reconciled Candidate · Calibration Record

**Date:** 2026-09-13 · ⭐ **19/19 MATCH on all three subjects · 0 mismatches · 0 nulls · 0 instrument errors**
⛔ **Host-boundary acceptance NOT yet re-closed — the real IPC witness is the deciding act.**

```text
BASELINE      e1c6f527   ✅ 19/19
FRACTURED     fd543df1   ✅ 19/19   (unchanged; historical results intact)
RECONCILED    3f25932b   ✅ 19/19   ⛔ unchanged by this amendment
JUDGE         795a0270
```

---

## 1 · ⭐⭐ What Option B actually enforces

> **Option B does not make independently instantiated brands interoperable. It removes independent
> instantiation from the authorized production lineage.**

**The identity principle, frozen:**

> **Unforgeability does not require every GENUINE token to be accepted. It requires acceptance only
> of tokens minted within the AUTHORIZED identity lineage.**

## 2 · The three-way discrimination — all GREEN on `3f25932b`

```text
NO IDENTITY            plain structural counterfeit          → REFUSE   CAL-4c ✅
WRONG LINEAGE          genuine brand, minted outside         → REFUSE   CAL-4e ✅
AUTHORITATIVE LINEAGE  minted through the sanctioned graph   → ACCEPT   CAL-4a ✅
                       and surviving N fresh reloads                    CAL-4d ✅
                       and same-lineage control                         CAL-4b ✅
```

⭐ **Substantially stronger than "brand vs no brand"** — and available *only* because the repair
changed the topology.

- **CAL-4a** *"legitimately minted eligibility is recognized across the production identity topology"*
  — minted by router graph A, accepted by an independently cache-busted router graph B.
- **CAL-4d** *"survives production-equivalent module reloads"* — 5 fresh authoritative graphs.
- **CAL-4e** *"unforgeability does not mean accepting every genuine token — only those minted within
  the authorized lineage."*

## 3 · Structural checks (⛔ discharge nothing)

```text
Symbol.for canary               false   ✅
router calls producer           false   ✅
router binds producer locally   false   ✅   ⭐ widened: local binding is flagged even without a call
pure re-export                  true    ✅
```

⭐ **The pure re-export is a structural guarantee, not a discipline:**

```text
router exposes producer OUTWARD
router cannot consume producer INWARD
```

The producer is never bound into the router's scope, so the router **cannot** self-mint. ⛔ Should
later code bind it locally, the tripwire fires **even if no call exists yet**.

## 4 · Historical records — preserved, not rewritten

```text
OLD CAL-4a   RED
OLD CAL-4d   RED
```

> **The specimens correctly reproduced the pre-repair host topology. Option B eliminated that
> topology; therefore they ceased to represent legitimate production lineage after the repair.**

⛔ **That is different from saying the original calibration was bad.** It was right about the organism
it measured. On `fd543df1` the re-specified probes now report `PRECONDITION-UNMET` — the authoritative
topology does not exist there — which is the honest verdict, not a downgrade of the old evidence.

## 5 · "Production-shaped" is NOT derived from host source — ruled

⛔ **Rejected as an oracle.** If the instrument read `main.js` and concluded *"whatever production
currently does is what production-shaped means,"* **a future broken host could teach its own judge
that the breakage is correct.** That is grading-your-own-homework one level up.

**Three independent layers instead:**

```text
1. ARCHITECTURAL CONTRACT   the authorized identity topology, stated in the probe
2. STRUCTURAL TRIPWIRE      does the host source still conform?          ⛔ discharges nothing
3. REAL IPC WITNESS         does the running organism behave accordingly? ⭐ final truth
```

## 6 · RB-6B is untouched — the controls that prove it

```text
RB-F3     RED    a valid lane was reached and execution occurred with zero invocation authority
RB-F6     RED    varying only the routing condition decided whether the act could occur
RB-CAL-3a RED    a legitimately routed invocation executed with NO independent host execution decision
RB-F4     RED    absence of an effect contract still accepted as sufficient
```

⭐ **All four on REACHED preconditions.** Option B did not cross into RB-6B.

## 7 · Standing — next act is the founder-run IPC witness

```text
RECONCILED CANDIDATE   3f25932b   19/19 · in-process only
FROZEN IPC APPARATUS   unchanged — ⛔ not edited at any point

REQUIRED HOST RESULT
  CONTROL   no routing declaration    → refused_not_routable · no execution
  ARM A     legitimate declaration    → C0 → no host execution decision → EXECUTES

  ⭐ that single Arm A result establishes BOTH:
       RB-6A host-boundary acceptance   GREEN
       RB-6B Condition B                RED
```

```text
RB-6A HOST ACCEPTANCE   ⛔ STILL REOPENED — in-process evidence is not host evidence
RB-6B                   ⛔ NOT OPEN
RB-6 EMBARGO            ACTIVE
```

> **A repair can change which state is legitimate without weakening the law governing that state.**
