# E3R1-D1c — FINAL D1 CLOSURE EVIDENCE

**Date:** 2026-09-21
**Lane:** `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1-D1c`
**Class:** documentary only

## Documentary succession — ⛔ NOT supersession

| Record | Commit | Standing |
|---|---|---|
| D1a source-class addendum | `1adc6482` | **preserved** |
| **Primary D1b** | `ae89b7cfb` (`claude/busy-bohr-ngluni`) | **preserved as PRIMARY** |
| D1b host-evidence addendum | `8bc5d0b917ca9f8053d23cf923467b9f987193f5` | **preserved** |
| This record | D1c | **subordinate** |

D1 is not reopened. F1–F10, the D2 file boundary, the configuration-source analysis,
the environment analysis and the dead-flag reconciliation are carried unchanged except
where §2/§3 below explicitly resolve a named blocker.

> ## ⛔ VERDICT: `D1 NOT CLOSED · D2 NOT READY`

---

## 0. EVIDENCE BASE — WHAT THIS SESSION NEWLY HELD

The primary D1b and its addendum were both written without the pinned OpenCode
source in reach. **This session obtained it**: `sst/opencode` cloned read-only and
checked out at tag **`v2.0.12`** (`git describe --tags` → `v2.0.12`).

That upgrades §2 and §3 from *not mechanically answerable* to *answerable*, which is
the whole reason this act could proceed at all with §1 still blocked.

⛔ It does **not** substitute for the host witness. Source is source; the installed
artifact is a separate fact, and this record never collapses the two.

---

## 1. HOST CLI WITNESS — ⛔ NOT ADJUDICATED

The act states the Founder will supply complete `opencode run --help` output. **It was
not supplied.** The Founder reported the Mac Studio remote-execution service paused on
an exhausted monthly tool-call allowance, did not retry, and did not alter the host.

This session runs in a remote container with no `opencode` binary, no SSH client and no
key material. **It did not run the probe.** §1 is therefore unadjudicated, and every
determination that depends on it stays withheld.

### 1.1 Source-side confirmations (SOURCE-ENTAILED, ⛔ not host-witnessed)

| Flag | Source finding @ `v2.0.12` | Class |
|---|---|---|
| `--standalone` | `packages/cli/src/commands/commands.ts:16` — `Flag.boolean("standalone")`, described *"Run with a private server instead of the background service"* | **SOURCE-ENTAILED** |
| `--pure` | **zero** occurrences of a `"pure"` flag across `packages/*/src` | **SOURCE-ENTAILED** |
| version `2.0.12` | — | **HOST-WITNESSED** (D1b addendum); ⛔ no executable-byte identity inferred |

Source and the bounded host witness **agree**. No divergence is established, so the
STOP condition has **not** fired. But agreement of source with a *filtered* host view
is not the complete CLI surface the act requires.

**Still owed, unchanged and load-bearing:** complete `opencode run --help`, ungrepped.

---

## 2. CONFIGURATION CLASS 5 — RESOLVED AS *NARROWED*, ⛔ NOT CLOSED

### 2.1 Exact primary-record definition, quoted verbatim from `ae89b7cfb` §4

| # | Source class | Presently reachable? | Closure mechanism | D2 control | Residual |
|---|---|---|---|---|---|
| 5 | Ancestor / project walk | **yes, unbounded to `/`** | ⚠️ **none available** | — | ⚠️ **RESIDUAL — F6 is the only detector** |

> ⚠️ **Class 5 is the one residual and it is not closable by any v2 control.** It is
> mitigated only by where the sandbox is created. **Stated, not hidden.**

### 2.2 Mechanism, established from source

`packages/core/src/config/discovery.ts`:

```js
export const names = ["opencode.json", "opencode.jsonc"]

const directories =
  (yield* fs.resolve(location.directory)) === globalRoots[0] || options?.project === false
    ? []
    : yield* fs.up({ targets: ["."], start: location.directory })
```

and per discovered directory:

```js
Effect.forEach([".claude", ".agents", ".opencode", ...names.toReversed()], ...)
```

| Property | Finding |
|---|---|
| Discovery mechanism | `fs.up()` from `location.directory`, i.e. the **working directory**, upward |
| Carrier | **file-carried** (`opencode.json`, `opencode.jsonc`) **and directory-carried** (`.opencode/`, `.claude/`, `.agents/`) |
| Scope | every ancestor of the cwd |
| `OPENCODE_CONFIG_DIR` | ⛔ **no effect** — it sets `global.config`; the walk is rooted at `location.directory` |
| Relocated `HOME` | ⛔ **no effect on the walk itself.** It does change `globalRoots`, which only *filters* global roots back out of the walk |
| XDG rebinding | ⛔ **no effect** |
| Project sandboxing | ✅ **the only lever** — the walk starts at the cwd, so the cwd's ancestor chain is the whole attack surface |
| Environment contract | ⛔ **no effect** — no env var terminates the walk |

### 2.3 ⭐ New finding the primary record did not have

**A short-circuit exists:** `options?.project === false` returns `[]` — the ancestor
walk does not run at all. That is a true exclusion, not precedence.

⚠️ **But it is unreachable from `opencode run`.** `Options` (`packages/core/src/config.ts:45-52`)
is a programmatic schema passed to `Config.layer(options)`. The CLI flag table at
`packages/cli/src/commands/commands.ts` exposes `--standalone`, `--server`, `--auto`,
`--yolo`, `--dangerously-skip-permissions`, `--continue`, `--session`, `--model`,
`--agent` — **and no `--project` / `--no-project`**.

So the primary D1b's *"none available"* is **correct for the CLI surface**, and this
record does not overturn it. What changes is the shape of the D2 problem: the exclusion
primitive exists in the library and is simply not exposed on the path JARVIS uses.

### 2.4 Candidate D2 exclusion mechanisms

Named, ⛔ **not implemented and not chosen** — selection is a Founder act:

1. **Ancestor-chain custody** — create the sandbox where JARVIS owns every ancestor,
   plus a **fail-closed pre-flight**: walk the cwd's ancestors for the five discovery
   names and **refuse the run** if any is found. Exclusion by precondition: if an
   unauthorized config exists, there is no run.
2. **Reach the `project: false` primitive** — requires an invocation path that sets
   `Options`, which `opencode run` does not provide. ⛔ Would exceed the D2 boundary.

### 2.5 Verdict

> ## ⛔ `CLASS 5 UNRESOLVED — D1 REMAINS OPEN`

Mechanism now fully characterised; **no mechanism is yet specified and ruled.** The
target property is not weakened from exclusion to precedence.

---

## 3. PROVIDER-BLOCK OWNERSHIP — ⛔ UNRESOLVED, AND COUPLED TO CLASS 5

### 3.1 The coupling — ⭐ the material finding of this act

`packages/schema/src/config/provider.ts` defines the provider block as **config-carried**:
`Settings` (`timeout`, `chunkTimeout`, `compaction`, `transport`, **plus an open
`Record<string, Json>` rest**), and `Overlays` = `settings` · `headers` · `body`.

Because the block is config-carried, it is reachable through **every** source class in
the D1b table — class 5 included.

> **Therefore: any ancestor `opencode.json` may carry a `provider.ollama` block, and
> that block can supply `headers`, `body` and open-record settings to the authorized
> model's requests.**

Provider-block ownership cannot close while class 5 is open. They are **one blocker,
not two.**

### 3.2 A · Provider declaration ownership

`ollama/qwen3-coder:30b` enters via JARVIS-materialized configuration and the CLI
`--model` flag. The v2 surface is `provider/model#variant` (variant optional) — host-
witnessed in the D1b addendum. `ollama/qwen3-coder:30b` is well-formed.
⚠️ The declaration is owned; the **block behind it** is not.

### 3.3 B · Provider configuration ownership

| Channel | Can affect `ollama` behaviour? | Closure |
|---|---|---|
| Global config | yes | ✅ classes 2/4 (`OPENCODE_CONFIG_DIR` + `HOME` + XDG) |
| Project config (authorized sandbox) | yes — intended | ✅ class 1 |
| **Ancestor config** | **yes** | ⛔ **class 5 — open** |
| Inline / env config | yes | ✅ class 7 (strip both channels + `OPENCODE_CONFIG`) |
| Plugin-provided | yes | ✅ class 8 (keyed to `global.home`) |
| `wellknown` / remote | yes | ✅ class 6 (empty DB once `HOME`+`XDG_DATA_HOME` rebound) |
| Inherited credentials | yes | ✅ environment contract (⛔ no secret value recorded here) |

### 3.4 C · Endpoint ownership

The act's three-way distinction holds and is decisive:

```
authorized model name   ✅ owned  (--model + materialized config)
authorized provider block  ⛔ NOT owned  (class-5 reachable)
authorized endpoint        ⛔ NOT owned  (carried by the block)
```

**A model string alone does not prove ownership of the provider block** — exactly as
the act warns. The proposed D2 contract does **not** yet mechanically fix or bound the
endpoint for the authorized local model.

### 3.5 Verdict

> ## ⛔ `PROVIDER-BLOCK OWNERSHIP UNRESOLVED — D1 REMAINS OPEN`

**Single smallest missing mechanism:** the class-5 exclusion mechanism of §2.4. Closing
class 5 closes this. ⛔ No Qwen execution was used to reach this.

---

## 4. PROCESS OWNERSHIP — ⛔ PASS WITHHELD

PASS requires **both** limbs:

| Limb | Status |
|---|---|
| Source: `--standalone` creates the private-service path | ✅ `commands.ts:16` — *"private server instead of the background service"* |
| Installed Mac Studio CLI: `--standalone` available | ⛔ **NOT ESTABLISHED** — §1 unadjudicated |

> ⛔ `PROCESS OWNERSHIP NOT YET CLOSED` — one limb short.

⛔ This is *mechanism available by design*, never *containment runtime-proven*. F2 and
F7 remain D2 post-implementation lethal witnesses regardless.

---

## 5. CONFIGURATION OWNERSHIP — ENUMERATED, ⛔ NOT ZERO UNRESOLVED

⛔ No numeric score is used.

| # | Class | Disposition |
|---|---|---|
| 1 | JARVIS sandbox / project | **CLOSED BY EXPLICIT CONFIG MATERIALIZATION** |
| 2 | User/global config dir | **CLOSED BY `OPENCODE_CONFIG_DIR`** (+ `HOME`, XDG) |
| 3 | XDG data/cache/state | **CLOSED BY XDG REBINDING** |
| 4 | Global `AGENTS.md` | **CLOSED BY `OPENCODE_CONFIG_DIR`** (follows `global.config`) |
| 5 | **Ancestor / project walk** | ⛔ **UNRESOLVED** |
| 6 | `wellknown` remote | **CLOSED BY REMOTE/WELLKNOWN EXCLUSION** (`HOME`+`XDG_DATA_HOME`) |
| 7 | Env / inline config | **CLOSED BY ENVIRONMENT CONTRACT** |
| 8 | Agent & plugin discovery | **CLOSED BY `HOME` REBINDING** (`global.home`) |
| 9 | Legacy compatibility | **SELF-BOUNDED BY SOURCE LAW** (inherits 1–8) |

**One `UNRESOLVED` class. D1 cannot close.**

---

## 6. ENVIRONMENT OWNERSHIP — PRESERVED, ⛔ TWO FAMILIES STILL UNRESOLVED

The primary D1b's `extendEnv: true` determination is **preserved**; the provider-block
analysis does not falsify it (§3 finds no *environment* channel that escapes the
contract — its open channel is class 5, a **file** channel).

⛔ **This session did not re-run the 88-name environment sweep and does not claim to
have resolved the two outstanding families (proxy, native-asset paths).** Doing so
without the sweep would be assertion, not evidence. They remain **UNRESOLVED** and are
carried forward.

⛔ No generic environment scrubber is proposed.

---

## 7. F1–F10

Neither §2 nor §3 weakens a fail condition or requires a fixture amendment. **F6**
(ambient configuration exclusion) remains the class-5 detector, and §2 strengthens the
case for keeping it lethal rather than relaxing it.

> ## ✅ `F1–F10 PRESERVED`

---

## 8. FINAL D1 VERDICT

> # ⛔ `D1 NOT CLOSED · D2 NOT READY`

| Criterion | Status |
|---|---|
| Complete host help shows `--standalone` | ⛔ not supplied |
| Complete host help shows no `--pure` | ⛔ not supplied (bounded witness only) |
| Class 5 closed | ⛔ **UNRESOLVED** |
| Provider-block ownership closed | ⛔ **UNRESOLVED** (coupled to class 5) |
| Zero config classes unresolved | ⛔ one remains |
| Zero env families unresolved | ⛔ two remain |
| D2 file boundary known | ✅ preserved |
| F1–F10 lethal | ✅ preserved |

### Remaining blockers, in dependency order

1. **Complete `opencode run --help` from the Mac Studio.** Settles §1 and the second
   limb of process ownership.
2. **Rule the class-5 exclusion mechanism** (§2.4 candidate 1). Closing it also closes
   provider-block ownership and endpoint ownership — **one ruling, three criteria.**
3. **Resolve the two environment families** via the preserved sweep.

⛔ No implementation was improvised.

---

## 9. CONFIRMATIONS

**NO QWEN E3 EXECUTION** — no provider cognition of any kind.
**NO EXECUTION GRANT MINTED.** **NO EXECUTION GRANT CONSUMED.**
**NO IMPLEMENTATION REPAIR** — no adapter change, no `--pure` replacement, no
`--standalone` added to production code, no configuration sandbox, no permission
hardening, `jarvis-readonly` unmodified.
**NO PRODUCTION MUTATION.** **NO D2 IMPLEMENTATION.**
**E3 EXECUTION REMAINS CLOSED.**

`sst/opencode` was cloned **read-only** into this container for source inspection at
tag `v2.0.12`. No MAIA production surface was touched. No secret value is recorded.
