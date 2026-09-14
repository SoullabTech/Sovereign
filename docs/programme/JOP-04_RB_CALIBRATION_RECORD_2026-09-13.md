# JOP-04 · RB — Calibration Record (RUN 1)

**Run:** 2026-09-13 · **Result:** ⭐ **CALIBRATION SUCCESS — 8/8 MATCH** · ⛔ **RB ACCEPTANCE: NO**
**Evidence:** `JOP-04_RB_CALIBRATION_EVIDENCE.json` (machine record, full custody per verdict)

```text
SUBJECT SHA      e1c6f527    exact untouched substrate being judged
INSTRUMENT SHA   0b9aaec4    acceptance harness judging it
LAYER B CAPABILITY  git.rev_parse    registered read capability only
```

⭐ **Separate identities held.** The subject was materialized as a **detached worktree** at
`e1c6f527`; its HEAD was **read back from the checkout**, not asserted from the request, and a
non-pristine tree would have aborted the run. The subject's **own** `router.mjs` and
`deterministic.mjs` were imported from that checkout. ⛔ No source fragment was copied into a
fixture and called a baseline.

---

## 1 · Predicted vs observed

| Falsifier | Predicted at `e1c6f527` | Observed | Calibration | Discharge |
|---|---|---|---|---|
| RB-F1 | RED | **RED** | ✅ MATCH | NOT-DISCHARGED |
| **RB-F2** | 🔴 **RED (anchor)** | 🔴 **RED** | ✅ **MATCH** | NOT-DISCHARGED |
| RB-F3 | RED | **RED** | ✅ MATCH | NOT-DISCHARGED |
| RB-F4 | RED | **RED** | ✅ MATCH | NOT-DISCHARGED |
| RB-F5 | UNINSTANTIATED | UNINSTANTIATED | ✅ MATCH | ⛔ NON-DISCHARGING |
| RB-F6 | RED | **RED** | ✅ MATCH | NOT-DISCHARGED |
| RB-F7 | N/A | N/A | ✅ MATCH | ⛔ NON-DISCHARGING |
| RB-F8 | 🟢 GREEN | 🟢 **GREEN** | ✅ MATCH | DISCHARGED-AT-BASELINE |

**Mismatches: 0. STOP condition not triggered.**

> ⭐ **RB-CAL-1 satisfied: the instrument truthfully recognizes the architecture we already knew was
> broken, without changing it.**

## 2 · What each verdict observed

**RB-F2 — the calibration anchor.** Two otherwise identical tasks; the **only** difference is
registry membership:

```text
git.rev_parse                          registered: true   → lane C0
jop04.definitely_not_registered_xyz999 registered: false  → lane C3
```

The subject's own reason string states the coupling in its own words:
*"Deterministic capability 'git.rev_parse' is registered; no model required."*
⭐ **Membership is the sole causal differentiator of the C0 grant** — `router.mjs:33`, observed
behaviorally rather than matched as source text.

**RB-F1** — registration alone yielded an **executed** invocation; no eligibility state was supplied,
because none exists to supply.
**RB-F3** — execution occurred with a valid lane and **zero** invocation authority
(`packet: null · gate: null · permission_envelope: null · actor: null`).
**RB-F4** — of the registered capabilities, **none** carries an effect declaration, and an undeclared
one executed. Absence of classification inherited safety.
**RB-F6** — authority held constant at none; varying **only** the routing output changed whether the
act occurred. The router carries authority-making power.
**RB-F8** — the unregistered name reached neither executable placement (`C3`, not `C0`) nor the
handler seam (`Unknown capability: …`). ⭐ **The existing strength is real and was preserved, not
assumed.**

## 3 · ⛔ CALIBRATION SUCCESS ≠ RB ACCEPTANCE PASS

```text
CALIBRATION SUCCESS    ✅  predicted legacy state matches observed legacy state
RB ACCEPTANCE PASS     ⛔  NO — RB-F5 and RB-F7 are NON-DISCHARGING
```

Under **FR-14**, an obligation that does not PASS never discharges. RB-F5 is structurally frozen and
deliberately **uninstantiated** — the repaired request shape does not exist, so no legitimate
specimen can be built, and ⛔ **inventing a legacy RED for it was refused.** RB-F7 is **not
applicable** until re-expression through the new registration model exists.

> **The frozen RB boundary is not fully discharged and cannot be, at this baseline.**

## 4 · ⚠️ Instrument limitation, recorded rather than hidden

**Layer B is PARTIAL.** The harness composes the subject's **real** `route()` and **real**
`runCapability()` in the order `main.js` composes them. ⛔ **The IPC hop is not executed** — there is
no Electron host in this environment.

The consuming branch is recorded as a **STRUCTURAL TRIPWIRE** (`discharges: false`):

```text
submit-task handler present   true
C0 branch consumes lane       true
calls runCapability           true
```

⛔ **This discharges nothing.** Per design §7 a structural check cannot discharge an architectural
falsifier. **RB-F3 and RB-F6 therefore carry a known evidence gap at the IPC boundary** and will need
a host-run Layer B before either can ever be discharged GREEN. ⭐ Recorded now, while it costs
nothing, rather than discovered when a green suite is wanted.

## 5 · Evidence custody

Every verdict records: `subject_sha · instrument_sha · falsifier · statement · expected_state ·
observed_state · calibration · evidence_class · evidence_location · layer · layer_b_capability ·
discharge_state · evidence · note`.

⭐ A later "green" cannot become detached from the code it judged.

## 6 · Standing

```text
RB-CAL-1                 SATISFIED
CALIBRATION              FROZEN — subject e1c6f527 · instrument 0b9aaec4
MISMATCHES               0
STOP                     NOT TRIGGERED
RB ACCEPTANCE            NOT PASSED (RB-F5, RB-F7 non-discharging)
LAYER B                  PARTIAL — IPC hop unexercised
MUTATION MATRIX          NOT RUN — requires post-repair tests to mutate
RB-6 EMBARGO             ACTIVE · BOTH CONDITIONS TRUE

SUBSTRATE                UNCHANGED
route() · runCapability() · registry · IPC · jarvis-desktop   UNTOUCHED
GREEN REPAIR             NOT AUTHORIZED BY THIS RUN
```

> **STOP.** The milestone was to prove the instrument can truthfully recognize the broken
> architecture without changing it. It did.
