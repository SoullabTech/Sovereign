# JOP-04 · RB — Calibration Record (RUN 2 · AMENDED INSTRUMENT)

**Run:** 2026-09-13 · **Result:** ⭐ **CALIBRATION SUCCESS — 10/10 MATCH, 0 mismatches**
⛔ **RB ACCEPTANCE: NO** · **Evidence:** `JOP-04_RB_CALIBRATION_EVIDENCE_AMENDED.json`

```text
SUBJECT SHA           e1c6f527    frozen known-bad substrate — UNTOUCHED
INSTRUMENT SHA        0b9aaec4    calibrated original instrument
AMENDED INSTRUMENT    1ed81732    adds RB-CAL-2 · lineage from 0b9aaec4
```

⭐ **The amendment descends from `0b9aaec4`; it does not replace it.**
⛔ **Run 1's record and evidence file are IMMUTABLE and were not edited** (verified: no change to
`JOP-04_RB_CALIBRATION_EVIDENCE.json`, still at commit `57675083`).

---

## 1 · Amendment matrix — predeclared, frozen before the run

| Probe | `e1c6f527` predicted | **observed** | After RB-6A (frozen) |
|---|---|---|---|
| RB-F1 | RED | **RED** ✅ | **GREEN** |
| RB-F2 | RED | **RED** ✅ | **GREEN** |
| ⭐ **RB-CAL-2a** discriminator | 🔴 **RED** | 🔴 **RED** ✅ | **GREEN** |
| ⭐ RB-CAL-2b no-auto-manufacture | NOT-REACHED | **NOT-REACHED** ✅ | **GREEN** |
| RB-F3 | RED | **RED** ✅ | RED |
| RB-F4 | RED | **RED** ✅ | RED |
| RB-F5 | UNINSTANTIATED | **UNINSTANTIATED** ✅ | UNINSTANTIATED |
| RB-F6 | RED | **RED** ✅ | RED |
| RB-F7 | N/A | **N/A** ✅ | N/A |
| RB-F8 | 🟢 GREEN | 🟢 **GREEN** ✅ | 🟢 GREEN |

⛔ **The original legacy matrix was not edited.** This is a second, separate matrix.

> **Attribution claim preserved: RB-6A changes only the registration/routing boundary.**
> ⛔ **If F3 or F6 turns green, STOP** — it may be good architecture, but it would mean Repair A
> crossed into Repair B.

## 2 · ⭐ RB-CAL-2a — what the discriminator observed

Same capability (`git.rev_parse`), same identity in every arm. ⛔ Not registered-vs-unknown — RB-F8
already covers that. **Only the task shape varies**, and every arm is an ordinary task object passed
to the production entry point.

| Arm | Lane | Placement |
|---|---|---|
| `bare` | C0 | EXECUTABLE |
| `bounded_for_local: false` | C0 | EXECUTABLE |
| `bounded_for_local: true` | C0 | EXECUTABLE |
| `bounded_for_local: true, input_chars: 1_000_000` | C0 | EXECUTABLE |
| `routing_eligibility: false` | C0 | EXECUTABLE |
| `eligible: false` | C0 | EXECUTABLE |
| `routable: false` | C0 | EXECUTABLE |
| `routing_condition: 'unsatisfied'` | C0 | EXECUTABLE |

**8 arms probed · 8 executable · 0 non-routable.**

⭐ **Two findings sharper than "RED":**

1. **A caller cannot withhold routing consideration.** Four arms *explicitly* assert non-eligibility
   in four different plausible spellings. **All eight route to C0.** Non-routability is not merely
   absent from the design — it is **unreachable from the production entry point**, which is exactly
   the state RB-6A must make reachable.
2. **Even `route()`'s own refusal path is unreachable for a registered capability.** `router.mjs`
   *does* refuse oversized input (`rejected_oversized`), but that check sits **after** the C0 early
   return — so a registered name bypasses the one refusal the router owns. The registry grant
   preempts the router's own judgement.

## 3 · RB-CAL-2b — the anti-tautology check, honestly unrun

```text
observed: NOT-REACHED     discharge: NON-DISCHARGING
```

CAL-2b asks whether a non-routable witness was produced **through the production entry point with
task-shaped input only** — no harness-internal injection, no registry modification, no
unregistration. ⛔ **At this baseline no non-routable witness exists, so the check has nothing to
evaluate.**

> ⭐ **It did not run, and it did not pass.** Reporting it GREEN because "no violation was observed"
> would be the precise failure FR-14 forbids.

**After RB-6A this becomes the decisive probe.** A GREEN on CAL-2a does not discharge RB-F2 if the
production composition manufactures the routing condition solely because the capability is
registered:

```text
⛔ FORBIDDEN EQUIVALENCE
if registered: routingFact = true
route(task, routingFact)          ← registered → routable, with an extra variable
```

## 4 · RB-F8 held as a control

```text
unknown name → lane C3 (not C0) → runCapability refuses: "Unknown capability: …"
```

⭐ **Observed GREEN again under the amended instrument.** The conjunction proof (RB-6A design §7)
says the intended design preserves it; **this witness says the substrate still does.** A repair can
accidentally introduce a generic executor, fallback capability, default registered handler or
dynamic command carrier and destroy the first conjunct without intending to — so F8 must remain an
**observed** control after every RB-6A run, not an inferred one.

## 5 · Required result before RB-6A implementation — MET

```text
ORIGINAL CALIBRATION     unchanged — all 8 verdicts identical to run 1   ✅
RB-CAL-2 baseline        RED                                             ✅
RB-F8                    GREEN                                           ✅
instrument mismatches    0                                               ✅
substrate                untouched                                       ✅
STOP condition           not triggered                                   ✅
```

⛔ **RB ACCEPTANCE PASS: NO** — RB-F5, RB-F7 and RB-CAL-2b are non-discharging.

## 6 · Standing

```text
RB-CAL-1                 SATISFIED (run 1, instrument 0b9aaec4)
RB-CAL-2                 SATISFIED (run 2, instrument 1ed81732)
AMENDMENT MATRIX         FROZEN
ORIGINAL RECORDS         IMMUTABLE — not edited
LAYER B                  PARTIAL — IPC hop unexercised (mandatory before RB-6B GREEN)
MUTATION MATRIX          NOT RUN
RB-6 EMBARGO             ACTIVE · BOTH CONDITIONS TRUE

SUBSTRATE                UNTOUCHED
route() · runCapability() · registry · main.js · IPC        UNCHANGED
RB-6A IMPLEMENTATION     NOT AUTHORIZED BY THIS RUN
```

> ⭐ **The judge can now distinguish a known instrument from permission to route that instrument —
> before any repair exists to be judged.**
