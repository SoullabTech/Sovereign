# JOP-04 · RB-6A — Candidate Run · ⛔ **STOP — FINDING**

**Run:** 2026-09-13 · **Disposition:** ⛔ **STOPPED. RB-6A NOT CLOSED. NO ACCEPTANCE CLAIMED.**

```text
BASELINE SUBJECT      e1c6f527
ORIGINAL INSTRUMENT   0b9aaec4
AMENDED INSTRUMENT    d1460c2e → ea2a1a25
REPAIR CANDIDATE      fd543df1
```

**Evidence:** `JOP-04_RB-6A_CANDIDATE_EVIDENCE.json`

---

## 1 · The stop condition fired

> *"If F3 or F6 turns GREEN, stop. RB-6A has crossed into RB-6B."*

**RB-F3 and RB-F6 both returned GREEN.**

⛔ **They did not cross into RB-6B. The probes stopped measuring.** This is an **instrument defect**,
not architectural progress — and reporting it as progress would have been the single most damaging
possible outcome of this run.

## 2 · Why the GREEN is vacuous — from the candidate's own evidence

**RB-F3** — its frozen specimen is *"supply a valid routing/placement result while withholding
invocation authority."*

```json
{ "lane": null, "authority_supplied": { … all null }, "executed": false }
```

⭐ **`lane: null`. The probe never obtained a valid lane, so its stated precondition was never met.**
Before RB-6A a lane came free with registration; the probe took one implicitly. After RB-6A a lane
requires a declared routing eligibility, which the probe does not supply. It now proves only that a
task with no eligibility does not execute — which is **RB-F1's** proposition, not RB-F3's.

**RB-F6** — *"hold authority constant, vary only routing output."*

```json
{ "arm_1": { "lane": null, "executed": false },
  "arm_2": { "lane": "C3",  "executed": false } }
```

⭐ **Neither arm executes.** `routed.executed !== unrouted.executed` is false because both are false.
"Routing output did not alter whether the act occurred" is **true and meaningless**: nothing occurred
in either arm.

> **A falsifier whose precondition is no longer reachable returns GREEN for the wrong reason.
> It is not passing. It has stopped asking.**

## 3 · What the run legitimately established

| | |
|---|---|
| **RB-F1 → GREEN** | ✅ genuine — registration alone yielded no execution (`executed: false`, nothing supplied) |
| **RB-F2 → GREEN** | ✅ genuine — *"membership alone did not determine the lane"* |
| **RB-CAL-2a → GREEN** | ✅ genuine — a task shape reachable through `route()` left a registered capability non-routable |
| **RB-CAL-2b → GREEN** | ✅ genuine — both states reached for one capability · unbranded assertion refused · caller does not derive the condition from the registry |
| **RB-F8 → GREEN** | ✅ control held |
| **RB-F4 → RED** | ✅ as predicted |
| **RB-F5 / RB-F7** | non-discharging, unchanged |
| **RB-F3 · RB-F6** | ⛔ **UNDETERMINED — not GREEN, not RED.** The probes did not run their stated tests. |

**Substrate behaviour directly witnessed** (`router-alpha-proof`, `desktop-c0-explorer-proof` 52/0):
registered + no eligibility → `refused_not_routable` · unbranded `{satisfied:true}` → refused ·
registered + declared eligibility → `C0` · **registered + oversized → `rejected_oversized`** (the
router's own refusal now defeats registration) · unregistered + eligibility → `C3`, never `C0` ·
basis `registry_membership` → refused at declaration.

## 4 · ⚠️ A second, lesser instrument limitation

The runner prints `CALIBRATION FAILED` and a `STOP` line for **RB-CAL-2a/2b** because it compares
every subject against the **baseline** matrix. It carries no post-repair matrix, so on a candidate it
flags the rows that were *supposed* to move.

⛔ **Do not read "CALIBRATION FAILED" on this run as "the repair failed."** It means *the runner
compared a candidate to baseline predictions.* The genuine finding is §2 alone.

## 5 · Owed, and deliberately NOT done here

Per the freeze semantics — `STOP → show the contradiction → founder ruling → re-freeze → resume` —
this run **does not amend the instrument and does not re-run.** Quietly repairing the probes and
re-running would be softening a frozen test after seeing its result, in the one direction that feels
like progress.

**Owed to the founder as a ruling, not an action:**

1. **Re-specify RB-F3 and RB-F6 against the post-RB-6A interface.** Both must now obtain a lane the
   legitimate way — a declared routing eligibility — and *then* withhold invocation authority.
   ⭐ Their frozen *meanings* are unchanged; only their **specimens** must reach the precondition.
   This is an amendment under §7.3, with its own instrument SHA, ruled before it is written.
2. **A post-repair matrix in the runner**, so a candidate is judged against the frozen post-repair
   predictions rather than the baseline ones.
3. ⭐ **A general obligation this run exposes:** *every falsifier must assert that its own
   precondition was reached, and report `PRECONDITION-UNMET` rather than GREEN when it was not.*
   RB-F3 and RB-F6 failed silently. Under this rule they would have failed loudly. **This is the
   RB-CAL-2b discipline — NOT-REACHED never discharges — generalized to the whole suite.**

## 6 · Standing

```text
RB-6A CANDIDATE        fd543df1 — implemented, PARTIALLY JUDGED
RB-F1 · RB-F2          GREEN (genuine)
RB-CAL-2a · RB-CAL-2b  GREEN (genuine)
RB-F8                  GREEN (control held)
RB-F4                  RED (as predicted)
RB-F3 · RB-F6          ⛔ UNDETERMINED — probes lost their precondition
MUTATION               NOT RUN — blocked on a trustworthy matrix
RB-6A                  ⛔ NOT CLOSED
RB-6B                  UNTOUCHED
RB-6 EMBARGO           ACTIVE
```

> **The apparatus did the job it was built for. It caught a false green — and pointed at the
> instrument rather than the substrate.**
