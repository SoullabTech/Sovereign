# JOP-04 · RB-6B — CAL-3 Instrument Amendment · Calibration Record

**Date:** 2026-09-13 · ⭐ **CALIBRATION SUCCESS on both subjects · 0 mismatches**
⛔ **RB-6B repair does not exist. Nothing was implemented.**

```text
RB-6A SUBJECT           fd543df1     closed
CURRENT TRUSTED JUDGE   5c9f5094     precondition-enforcing
RB-6B AMENDED JUDGE     4267e12b     descends from it; history not replaced
RB-6B REPAIR            DOES NOT EXIST
```

---

## 1 · Governing law, frozen

> **Routing may be requester-influenced. Execution authority may not be requester-minted or
> requester-transported.**

```text
caller MAY request     "consider this task for routing"
caller MAY NOT assert  "therefore execute it"

ROUTABLE ≠ EXECUTABLE   must become an observable PRODUCTION state
```

## 2 · Results — 14 probes, both subjects, 0 mismatches

| Probe | `e1c6f527` | `fd543df1` | |
|---|---|---|---|
| **RB-CAL-3a** | 🔴 **RED** | 🔴 **RED** | ⭐ **the new known-bad anchor** |
| RB-CAL-3b | UNINSTANTIATED | UNINSTANTIATED | ARM B has no mechanism |
| RB-CAL-3c | UNINSTANTIATED | UNINSTANTIATED | no shape to counterfeit |
| RB-CAL-3d | UNINSTANTIATED | UNINSTANTIATED | nothing to test independence of |
| RB-F3 · RB-F4 | RED · RED | RED · RED | unchanged |
| RB-F6 | PRECONDITION-UNMET | RED | unchanged |
| RB-IPC-WITNESS | **HOST_WITNESS_UNAVAILABLE** | **HOST_WITNESS_UNAVAILABLE** | ⚠️ discharges nothing |

**CAL-3a's witness on the closed RB-6A subject:**

> *"a legitimately routed invocation executed with NO independent host execution decision"*

⭐ **Condition B is now directly witnessed by a probe built for it** — not inferred from F3 and F6.

## 3 · ⭐ What was NOT fabricated

Three probes report `UNINSTANTIATED` and **none was made runnable by inventing the thing it tests**:

- **CAL-3b ARM B** — a valid route plus a *constituted* host execution decision. No such mechanism
  exists. ⛔ Fabricating one would test the harness.
- **CAL-3c** — the counterfeit must mirror the **real repaired authority shape**. ⛔ *"Spraying
  arbitrary fields like `approved: true` and calling that proof"* is named in the probe as a
  forbidden shortcut. ⭐ When instantiable, this likely becomes **the first concrete specimen for
  RB-F5**, abstract since the freeze.
- **CAL-3d** — the auto-mint guard. Nothing exists whose independence from the route can be tested.

## 4 · ⭐⭐ CAL-3d states the trap that host-origin alone does not catch

```ts
if (route.lane === 'C0') { decision = mintHostDecision() }
```

> **Technically host-minted and architecturally worthless** — the decision's truth is still a
> function of the routing result.

**Host origin is necessary and not sufficient. Independence from the route is the real test:**

```text
same valid route · same capability · same request
  host decision WITHHELD                  → no execution
  host decision INDEPENDENTLY constituted → execution
```

⛔ **If the first state is unreachable, RB-6B remains RED however impressive the permit object looks.**

## 5 · Frozen host-origin contract

An execution decision is legitimate for RB-6B only if it originated **inside the trusted host side of
the IPC boundary**. Architectural disqualifiers, not naming rules:

```text
⛔ a field on the submitted task (task.execution_authorized)
⛔ a nested object supplied through jarvis:submit-task
⛔ a branded object created in the renderer
⛔ mintPermit(task.callerSuppliedDecision) — rewrapping is not minting
⛔ any value whose truth is a function of the routing result alone

✅ the decision depends on at least one fact the router did not produce
   and the caller could not supply
```

## 6 · ⚠️ The real IPC witness — specified, unavailable, never substituted

```text
renderer/request → ipcMain('jarvis:submit-task') → route()
  → C0 branch/successor → execution decision boundary → runCapability()
```

**Status: `HOST_WITNESS_UNAVAILABLE`.** No Electron host in this environment.

⛔ **The simulated `route()` + `runCapability()` composition MUST NOT be substituted** — it is
precisely what has never been able to discharge RB-F3 or RB-F6, and substituting it would convert a
known evidence gap into a false pass. Capability policy: **existing harmless registered read
capability only; no effect-bearing capability, ever.**

**Consequence:** RB-6B **cannot close GREEN** until a founder-run host witness captures **both** pre-
and post-repair semantics. ⭐ Capturing the **pre-repair** IPC baseline on `fd543df1` is available to
do now and should precede implementation.

## 7 · RB-6B target matrix — frozen before implementation

```text
RB-F1 GREEN · RB-F2 GREEN · RB-F3 GREEN · RB-F4 RED · RB-F5 nondischarging
RB-F6 GREEN · RB-F7 N/A   · RB-F8 GREEN
CAL-2a GREEN · CAL-2b GREEN · CAL-3a GREEN · CAL-3b GREEN · CAL-3c GREEN · CAL-3d GREEN
caller-forged execution authority  → REFUSED / no execution
host-minted execution decision     → execution possible
```

⛔ **RB-F4 must remain RED on a REACHED precondition.** If it turns GREEN because the new boundary
refuses *"unclassified effect"*, the implementation crossed into the effect lane.

```text
CORRECT RB-6B refusal   no constituted execution decision
⛔ WRONG                effect contract absent
```

## 8 · Standing

```text
RB-6A            CLOSED · fd543df1
CONDITION A      DEFEATED
CONDITION B      ACTIVE · now directly witnessed by CAL-3a RED
RB-6 EMBARGO     ACTIVE

CAL-3a           RED on both subjects — anchor established
CAL-3b/3c/3d     UNINSTANTIATED — ⛔ not fabricated
IPC WITNESS      HOST_WITNESS_UNAVAILABLE — founder-run act owed
RB-F4            RED — must remain so through RB-6B

NO main.js CHANGE · NO EXECUTION-AUTHORITY TYPE · NOTHING IMPLEMENTED
```

> **The judge now knows what counterfeit sovereignty looks like — before the sovereignty exists.**
