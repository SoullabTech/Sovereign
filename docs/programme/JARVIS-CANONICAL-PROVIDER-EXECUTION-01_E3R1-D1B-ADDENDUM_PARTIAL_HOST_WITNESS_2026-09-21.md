# E3R1-D1b ADDENDUM — PARTIAL MAC STUDIO HOST WITNESS

**Date:** 2026-09-21
**Lane:** `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1-D1b`
**Status:** addendum — subordinate to the primary D1b record
**Primary record:** `ae89b7cfb` on `claude/busy-bohr-ngluni`
  (`…_E3R1-D1B_HOST_PROBE_AND_CLOSURE_2026-09-21.md`)
**Predecessors:** E3R1-D1 · E3R1-D1a (`1adc6482`)
**Class:** documentary only

> ## ⛔ VERDICT UNCHANGED: `D1 NOT CLOSED · D2 NOT READY`

---

## 0. WHY THIS IS AN ADDENDUM AND NOT A SECOND D1b

The D1b act was already executed at `ae89b7cfb`. Its §1 records the host probe as
NOT PERFORMED for want of a route to the Mac Studio, and it returns
`D1 NOT CLOSED · D2 NOT READY`.

This session inherited the same constraint: it runs in a remote container with no
`opencode` binary, no SSH client and no key material. **It did not re-run the probe
and did not re-derive the source-law analysis.**

What it does hold is evidence the primary record did not: **the founder ran part of
the probe on the Mac Studio and pasted the output into the session.** That partially
discharges the primary record's §15 unresolved act #1.

Writing a second full D1b would have produced a divergent record of the same act.
The primary record stands. This addendum only advances the rows the pasted output
actually settles, and narrows the remaining evidence act.

---

## 1. HOST OUTPUT AS RECEIVED

Host prompt `soullab@Kellys-Mac-Studio MAIA-SOVEREIGN %`, verbatim:

```
$ opencode --version
opencode v2.0.12
```

```
$ opencode run --help | grep -E '\-\-pure|\-\-agent|\-\-model'
  --model, -m string      Model to use in the format provider/model#variant
  --agent string          Agent to use
```

⚠️ **The second command was grepped, not preserved complete.** The act requires
complete `opencode run --help` output. This is therefore a BOUNDED host witness,
and it is recorded as such rather than promoted to a surface enumeration.

---

## 2. WHAT THIS DISCHARGES

| # | Adjudication | Prior (D1b §2) | Now | Basis |
|---|---|---|---|---|
| 1 | installed version `2.0.12` | NOT YET ESTABLISHED | ✅ **HOST-WITNESSED** | direct `--version` output |
| 2 | `--pure` **absent** | NOT YET ESTABLISHED | ✅ **HOST-WITNESSED (BOUNDED)** | the grep pattern **included** `--pure`; `--agent` and `--model` matched and printed, `--pure` did not. A pattern that would have matched it did not match it. |
| 3 | `--standalone` **present** | NOT YET ESTABLISHED | ⛔ **STILL NOT ESTABLISHED** | the grep pattern never tested `--standalone`; its absence from this output carries **zero** information |

### 2.1 Why item 2 is bounded and not complete

The prior record correctly refused to treat the E3 error string as evidence, on the
grounds that an error message is not a surface enumeration. This output is stronger —
it is the CLI's own help surface, filtered by a pattern that included `--pure` — but
it is still a filtered view. It establishes that `--pure` is **not present under that
flag spelling in `run --help`**. It does not enumerate the surface.

Consistent with pinned source. **No divergence. The STOP condition did not fire.**

### 2.2 New surface fact, recorded for D2

```
--model, -m string      Model to use in the format provider/model#variant
```

The v2 model reference format is `provider/model#variant`, variant optional.
`ollama/qwen3-coder:30b` remains well-formed. Recorded so D2 does not discover it
during implementation. ⛔ No production code changed.

---

## 3. WHAT REMAINS OWED — NOW A SINGLE NARROWED ACT

The primary record's §15 act #1 is **partially discharged**. What remains:

```bash
opencode run --help            # COMPLETE output, not grepped
```

Adjudicate one thing: **is `--standalone` present on `run`?**

- `--standalone` present → §1 closes; the primary D1b's remaining criteria govern.
- `--standalone` absent → ⛔ **STOP — INSTALLED ARTIFACT / PINNED SOURCE DIVERGENCE.**
  Closure question A has no mechanism, and D2 does not open.
- `--pure` present in complete output → ⛔ **STOP**, and §2 item 2 of this addendum
  is void.

Primary-record acts **2** (rule on class 5) and **3** (rule on the provider-block
question) are untouched by this addendum and remain owed.

---

## 4. CLOSURE VERDICT

> # `D1 NOT CLOSED · D2 NOT READY`

Unchanged. Process ownership rests on `--standalone`, which has **no host witness**.
Two of three §1 adjudications now carry host evidence; the load-bearing one does not.

| Criterion | Status |
|---|---|
| Host CLI surface matches pinned source | ⚠️ **2 of 3** — version ✅ · `--pure` ✅ bounded · `--standalone` ⛔ |
| Process ownership mechanical answer | ⛔ PASS still withheld — depends on `--standalone` |
| Configuration ownership | ⚠️ unchanged — 11 of 12, class 5 unresolved |
| Environment contract bounded | ⚠️ unchanged |
| F1–F10 | ✅ unchanged |
| Exact D2 files known | ✅ unchanged |

⛔ Nothing in this addendum authorizes D2.

---

## 5. CONFIRMATIONS

**NO QWEN E3 EXECUTION PERFORMED** — no provider cognition of any kind.
**NO EXECUTION GRANT MINTED.**
**NO EXECUTION GRANT CONSUMED.**
**NO IMPLEMENTATION REPAIR PERFORMED** — no OpenCode adapter change, no `--pure`
replacement, no `--standalone` added to production code, no configuration sandbox,
no permission hardening, `jarvis-readonly` unmodified.
**NO PRODUCTION MUTATION.**
**E3 EXECUTION REMAINS CLOSED.**

No secret value is recorded in this document.
