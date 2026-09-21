# E3R1-D1d — CLASS-5 & ENVIRONMENT CLOSURE

**Date:** 2026-09-21 · **Class:** documentary only
**Founder ruling:** class-5 exclusion by **JARVIS-owned neutral execution CWD**

## Succession — ⛔ not supersession

| Record | Commit | Standing |
|---|---|---|
| D1a | `1adc6482` | preserved |
| **Primary D1b** | `ae89b7cfb` | preserved as PRIMARY |
| D1b host addendum | `8bc5d0b91…` | preserved |
| D1c | `63fe356ae…` | **accepted** |
| Pinned source | `sst/opencode @ v2.0.12` | read-only |

> # ✅ `D1 TECHNICAL DESIGN CLOSED · HOST CLI WITNESS ONLY REMAINS`

---

## II. NEUTRAL CWD — ⭐ ALREADY TRUE IN THE SEAM

`jarvis-desktop/src/work-unit-control.js`:

```js
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-e1-evidence-'))   // :591
// evidence arrives via `git show <sha>:<rel>` — content, never a checkout
const target = path.join(workspace, '.opencode', 'agents', 'jarvis-readonly.md')  // :612
execFile('opencode', [...], { cwd: sandbox.workspace, env, timeout })             // :673-684
```

**The canonical E3 invocation has never used the repository as CWD.** It runs in a
fresh `mkdtemp` directory. The Founder ruling is therefore not a redesign — it is a
ratification plus one missing precondition.

| E3 semantic | Requires repository CWD? | Basis |
|---|---|---|
| Provider cognition | **no** | executes in Ollama, not the CWD |
| Prompt / input delivery | **no** | prompt passed as argv; `inlineEvidence: false` |
| Agent loading | **no** | `jarvis-readonly.md` is **copied into** the sandbox (`:612`) |
| Model / provider resolution | **no** | `--model` argv + governed config |
| Filesystem / tool access | **no** | read/glob/grep over sandbox; `edit`/`bash` denied |
| Repository mutation | **no** | E3 is a provider-execution witness, not an editing act |

> ## ✅ `NEUTRAL EXECUTION CWD SEMANTICALLY VALID FOR E3`

⚠️ **New requirement this exposes.** `os.tmpdir()` reads ambient **`TMPDIR`**, which
D1b classified `SAFE / IRRELEVANT`. Under this ruling `TMPDIR` **decides the ancestor
chain the pre-flight must scan** — it selects `location.directory`. It is now
**execution-relevant** and reclassified **`MUST REBIND` (or MUST VALIDATE)**.
⭐ Without this, an ambient `TMPDIR` pointing inside a project tree would reintroduce
class 5 through the back door. ⛔ Not implemented here.

---

## III. CLASS-5 PRE-FLIGHT LAW

Scan target: **the exact final execution CWD** (`sandbox.workspace`), every ancestor to
`/`. Detected names — **source-complete** per `packages/core/src/config/discovery.ts`
(`names = ["opencode.json","opencode.jsonc"]` and the per-directory probe
`[".claude", ".agents", ".opencode", ...names]`):

```
.claude   .agents   .opencode   opencode.json   opencode.jsonc
```

Any hit ⇒ **REFUSE**, before OpenCode process creation and before execution-grant
consumption. Record offending path · discovery class · structured reason — **without
reading or executing the discovered configuration.**

⛔ No precedence exception · ⛔ no "same content as governed config" exception ·
⛔ no user/global trust exception. Binary property: **the project-discovery walk has
zero admissible entries.**

---

## IV. OWNERSHIP vs ABSENCE

⛔ JARVIS does **not** own `/` or every ancestor. The property is:

> JARVIS owns **admission** to the canonical process, and proves before launch that the
> source-defined ancestor walk contains no participating configuration entry.

**Configuration exclusion by precondition.** ⛔ Not filesystem ownership.

---

## V. CLASS-5 LETHAL FALSIFIER — F6 AMENDMENT

Amends **F6** only, to encode the established property. ⛔ No fail condition weakened.

```
ID                 F6 (amended)
PROPERTY           ambient project-discovery configuration cannot participate
SETUP              neutral execution tree; sentinel opencode.json in an ancestor of the execution CWD
ACT                invoke canonical pre-flight
EXPECTED           structured refusal · OpenCode never spawned · no grant consumed ·
                   offending path + class recorded · sentinel contents never read
FAIL               spawn occurs · grant consumed · admission granted · sentinel read
THEN               remove sentinel; repeat with clean ancestry ⇒ pre-flight admits
FIXTURE            neutral tree + sentinel
CLASS              HOST · NON-MUTATING · EXECUTION-GRANT CONSUMING? **no**
```

⭐ Proves **excluded because the invocation was refused** — ⛔ never "OpenCode happened
not to use the sentinel." ⛔ No Qwen execution.

**F1–F5, F7–F10 unchanged.**

---

## VI. PROVIDER-BLOCK CONSEQUENCE

| Class | Disposition after composed boundary |
|---|---|
| 1 sandbox | authorized source |
| 2 global · 3 XDG · 4 `AGENTS.md` · 6 wellknown · 8 agent/plugin dirs | closed by `OPENCODE_CONFIG_DIR` + `HOME` + XDG rebinding |
| **5 ancestor walk** | ✅ **closed by neutral CWD + pre-flight** |
| 7 env / inline | closed by the allowlist env builder (§VIII) |
| 9 legacy | inherits 1–8 |

No remaining source can supply or mutate `provider.ollama`, `model`, base URL/endpoint,
`headers`, `body`, or provider options.

⭐ **Independent endpoint reinforcement from source** —
`packages/core/src/effect/websocket-constructor.ts:39`:

```js
if (["127.0.0.1", "localhost", "::1"].includes(url.hostname)) return undefined
```

Loopback destinations bypass proxying entirely. The authorized `ollama` endpoint is
loopback, so proxy configuration cannot reroute it. ⛔ This does **not** by itself
authorize the endpoint — it is defence in depth behind class-5 closure.

The three properties stay distinct and all three now have bounded provenance:

```
authorized model         ✅ --model argv + governed config
authorized provider cfg  ✅ composed configuration boundary
authorized endpoint      ✅ composed boundary + loopback proxy exemption
```

> ## ✅ `PROVIDER-BLOCK OWNERSHIP CLOSED BY COMPOSED CONFIGURATION BOUNDARY`

---

## VII. THE TWO PRESERVED ENVIRONMENT FAMILIES

Taken verbatim from primary D1b §5; ⛔ not renamed.

### Family 1 — `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY` / `NO_PROXY`

⚠️ **D1b's stated reason is FALSIFIED by pinned source.** D1b: *"not read anywhere in
opencode source."* It **is** read — `websocket-constructor.ts:38-48` — and the runtime
is **Bun 1.4.2** (`packageManager`), whose `fetch` also honours proxy vars implicitly.
Corrected here, ⛔ not silently.

⭐ **Two names D1b did not list:** `WS_PROXY` and `WSS_PROXY` (`:42`), consulted
**before** the standard pair.

```
FAMILY                 proxy configuration
MATCHING RULE          HTTP_PROXY · HTTPS_PROXY · ALL_PROXY · NO_PROXY · WS_PROXY · WSS_PROXY (+ lowercase)
CAN ALTER PROVIDER?    no
CAN ALTER MODEL?       no
CAN ALTER ENDPOINT?    yes — routing for non-loopback destinations (loopback exempt, :39)
CAN ALTER DISCOVERY?   no
CAN ALTER PLUGINS/AGENTS/INSTRUCTIONS? no
D2 DISPOSITION         MUST STRIP
```

### Family 2 — `OPENCODE_*` native-asset path vars

Confirmed read, with file and line:

| Variable | Source |
|---|---|
| `OPENCODE_PHOTON_WASM_PATH` | `image/photon-wasm.node.ts:3` |
| `OPENCODE_PARCEL_WATCHER_PATH` | `filesystem/watcher-binding.ts:11` |
| `OPENCODE_TREE_SITTER_WASM_PATH` · `_BASH_WASM_PATH` · `_POWERSHELL_WASM_PATH` | `shell/parser-wasm.node.ts:6-9` |
| `OPENCODE_PTY_BIN` | `persistent-pty/binary.bun.ts:7` · `binary.node.ts:2` · `daemon.ts:160` |

⚠️ **D1b's hedge — *"bash is denied so exercise is unlikely"* — understates this.**
Photon (image) and parcel-watcher (filesystem watching) are **not** bash-gated, and
`OPENCODE_PTY_BIN` names an **executable**. These load native/wasm code into the
process: strictly more dangerous than configuration.

```
FAMILY                 OPENCODE_* native-asset redirection
MATCHING RULE          the six names above
CAN ALTER PROVIDER/MODEL/ENDPOINT? not directly — but loaded native code moots the question
CAN ALTER DISCOVERY?   not directly
CAN ALTER PLUGINS/AGENTS/INSTRUCTIONS? effectively yes, via loaded code
D2 DISPOSITION         MUST STRIP
```

> ✅ **Zero `UNRESOLVED` environment families remain.** No secret value recorded.

---

## VIII. `extendEnv: true`

**Preserved — it remains acceptable**, on D1b's own reasoning: `standalone.ts:18-33`
extends *the CLI child's* environment, which is exactly what JARVIS supplies.

⭐ **And D1b's corollary is now mandatory, because both newly-resolved families are
`MUST STRIP`:** a four-name **subtraction** list cannot exclude `WS_PROXY`,
`OPENCODE_PTY_BIN`, or names not yet invented.

> **Minimum D2 mechanism: a canonical-execution ALLOWLIST env builder.**
> Allowlisted: `PATH` · `TMPDIR` (rebound, §II) · presentation/identity vars ·
> `HOME` + XDG + `OPENCODE_CONFIG_DIR` (rebound) ·
> `OPENCODE_DISABLE_MODELS_FETCH=1` · `OPENCODE_DISABLE_AUTOUPDATE=1`.
> Everything else absent by construction.

⛔ Not a generic environment sanitizer — the allowlist is bounded by the D1b sweep plus
these two families. ⛔ Not implemented here.

---

## IX. CLASS-5 VERDICT

| Condition | Status |
|---|---|
| Neutral CWD preserves E3 semantics | ✅ §II — already true in the seam |
| Five discovery names source-complete | ✅ `discovery.ts` `names` + per-directory probe |
| Scan covers the exact `location.directory` | ✅ `sandbox.workspace`, with `TMPDIR` rebound |
| Any entry causes pre-spawn refusal | ✅ §III |

> # ✅ `CLASS 5 CLOSED BY NEUTRAL EXECUTION CWD + SOURCE-COMPLETE ANCESTOR PRE-FLIGHT`

---

## X. HOST WITNESS REMAINS SEPARATE

⛔ Pinned-source evidence is **not** substituted for the installed-CLI witness.
`--standalone` is SOURCE-ENTAILED (`commands.ts:16`); the Mac Studio witness is owed.

> ⛔ `PROCESS OWNERSHIP PASS REMAINS WITHHELD`

---

## XI. D1 CLOSURE

> # ✅ `D1 TECHNICAL DESIGN CLOSED · HOST CLI WITNESS ONLY REMAINS`

⛔ **Not** full D1 closure. Sole remaining evidence: complete `opencode run --help`
from the Mac Studio showing `--standalone` present and `--pure` absent. On that
output, and only then: `D1 CLOSED · D2 READY FOR FOUNDER AUTHORIZATION`.

### D2 must implement (specified, ⛔ not built)
1. neutral execution CWD with **`TMPDIR` rebound** to a JARVIS-owned root;
2. source-complete ancestor pre-flight, refusal pre-spawn and pre-grant-consumption;
3. allowlist env builder (replacing `childEnv()`'s subtraction list);
4. `--standalone`; 5. governed `OPENCODE_CONFIG_DIR` materialization;
6. removal of the dead `--pure`.

---

## XII. CONFIRMATIONS

**NO QWEN E3 EXECUTION** · **NO EXECUTION GRANT MINTED** · **NO EXECUTION GRANT
CONSUMED** · **NO OPENCODE PROCESS SPAWNED** · **NO IMPLEMENTATION REPAIR** ·
**NO PRODUCTION MUTATION** · **NO D2 IMPLEMENTATION** · **E3 REMAINS CLOSED.**
No secret value recorded.
