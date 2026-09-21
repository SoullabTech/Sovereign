# E3R1-D1e — HOST CLI LIMB ADMISSION & D1 CLOSURE

**Date:** 2026-09-21 · **Class:** documentary only
**Act:** Founder evidence admission — E3R1-D1 host CLI limb

## Succession — ⛔ not supersession

| Record | Commit | Standing |
|---|---|---|
| D1a | `1adc6482` | preserved |
| **Primary D1b** | `ae89b7cfb` | preserved as PRIMARY |
| D1b host addendum | `8bc5d0b91…` | preserved |
| D1c | `63fe356ae…` | preserved |
| **D1d** | `b5a920586…` | **preserved — carries items 1–5** |
| Pinned source | `sst/opencode @ v2.0.12` | read-only |

> # ✅ `D1 CLOSED · D2 READY FOR FOUNDER AUTHORIZATION`

---

## 1. HOST CLI LIMB — ADMITTED

The Founder ran `opencode run --help` on Kellys-Mac-Studio and admits the complete
installed command surface as evidence.

| Adjudication | Verdict |
|---|---|
| `--standalone` | ✅ **HOST-WITNESSED PRESENT** — *"Run with a private server instead of the background service"* |
| `--pure` | ✅ **HOST-WITNESSED ABSENT FROM COMPLETE `opencode run` CLI SURFACE** |
| Installed / source divergence | ✅ **NONE SHOWN** |

⚠️ **How this evidence arrived, recorded precisely.** The admission is a **Founder
attestation of the complete surface**; the record carries the quoted `--standalone`
line and the attested absence of `--pure`, not a full transcript. The Founder is the
authority admitting evidence into this lane, and the attestation is accepted as such.
⛔ It is not recorded as a transcript this session read, and the D1b addendum's
*bounded* witness is not retroactively promoted — it is **superseded** by this
complete-surface admission.

⛔ **No executable-byte identity is inferred** between the installed artifact and
pinned `v2.0.12` source. The two agree on the CLI surface; that is the claim, and the
whole claim.

### 1.1 The two limbs now both hold

| Limb | Evidence |
|---|---|
| Source: `--standalone` selects the private-service path | `packages/cli/src/commands/commands.ts:16` (D1c) |
| Installed: `--standalone` exposed by the actual CLI | **this admission** |

> ## ✅ `PROCESS OWNERSHIP DESIGN LIMB CLOSED`

⛔ **F2 and F7 runtime containment are NOT claimed passed.** They remain **D2
post-implementation lethal witnesses**. *Mechanism available and governed by design* is
not *containment runtime-proven*, and this record does not blur them.

---

## 2. ITEMS 1–5 — CLOSED AT `b5a920586`, ⛔ NOT RE-DERIVED

All five were adjudicated in D1d. They are carried forward unchanged; re-deriving them
here would produce a divergent second record of one act.

| # | Item | Verdict | Where |
|---|---|---|---|
| 1 | Neutral-CWD semantic validity | ✅ `NEUTRAL EXECUTION CWD SEMANTICALLY VALID FOR E3` | D1d §II |
| 2 | Class-5 exclusion | ✅ `CLASS 5 CLOSED BY NEUTRAL EXECUTION CWD + SOURCE-COMPLETE ANCESTOR PRE-FLIGHT` | D1d §III, §IX |
| 3 | Provider-block ownership | ✅ `CLOSED BY COMPOSED CONFIGURATION BOUNDARY` | D1d §VI |
| 4a | Env family — proxy | ✅ **`MUST STRIP`** | D1d §VII |
| 4b | Env family — `OPENCODE_*` native-asset | ✅ **`MUST STRIP`** | D1d §VII |
| 5 | `extendEnv: true` | ✅ **remains**, conditional on an allowlist env builder | D1d §VIII |

**Zero `UNRESOLVED` configuration classes. Zero `UNRESOLVED` environment families.**

---

## 3. FINAL D1 CLOSURE

| Criterion | Status |
|---|---|
| Complete host help shows `--standalone` | ✅ admitted |
| Complete host help shows no `--pure` | ✅ admitted |
| Class 5 closed | ✅ D1d |
| Provider-block ownership closed | ✅ D1d |
| Zero config source classes unresolved | ✅ D1d §VI |
| Zero execution-relevant env families unresolved | ✅ D1d §VII |
| Exact D2 file boundary known | ✅ D1b, preserved |
| F1–F10 lethal / correctly classified | ✅ F6 amended; F1–F5, F7–F10 unchanged |

> # ✅ `D1 CLOSED · D2 READY FOR FOUNDER AUTHORIZATION`

---

## 4. WHAT D2 IS SCOPED TO IMPLEMENT — ⛔ NOT AUTHORIZED BY THIS RECORD

Specification only. D2 requires its own Founder act.

1. **Neutral execution CWD** with **`TMPDIR` rebound** to a JARVIS-owned root.
   ⚠️ D1d §II: `os.tmpdir()` selects `location.directory`, so `TMPDIR` is
   execution-relevant and reclassified **`MUST REBIND`** from D1b's `SAFE / IRRELEVANT`.
2. **Source-complete ancestor pre-flight** over `.claude`, `.agents`, `.opencode`,
   `opencode.json`, `opencode.jsonc` — refusal **before** process creation and
   **before** execution-grant consumption, without reading the discovered file.
3. **Allowlist env builder**, replacing `childEnv()`'s four-name subtraction list.
4. **`--standalone`** on the canonical invocation.
5. **Governed `OPENCODE_CONFIG_DIR`** materialization.
6. **Removal of the dead `--pure`** from the canonical argv.

⭐ The governing property is unchanged and is met by construction, not by precedence:
*unauthorized ambient configuration cannot participate in canonical provider execution.*

### Sequence from here

```
D1 CLOSED  →  D2 implements containment  →  F1–F10  →  E3 reopens  →  Qwen runs
```

⛔ E3 does not reopen on this record. It reopens only after D2 passes F1–F10.

---

## 5. CONFIRMATIONS

**NO QWEN E3 EXECUTION** · **NO EXECUTION GRANT MINTED** · **NO EXECUTION GRANT
CONSUMED** · **NO OPENCODE PROCESS SPAWNED** · **NO IMPLEMENTATION REPAIR** ·
**NO PRODUCTION MUTATION** · **NO D2 IMPLEMENTATION** ·
**E3 EXECUTION REMAINS CLOSED.**

F2 / F7 runtime containment ⛔ **not claimed passed**. No secret value recorded.
