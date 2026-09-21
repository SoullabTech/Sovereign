# E3R1-D1b — HOST PROBE, PROVENANCE WITNESS & D1 CLOSURE

**Lane:** `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1`
**Date:** 2026-09-21
**Inputs:** `E3R1-D1` · `E3R1-D1a` @ `1adc6482`
**Pinned source:** `sst/opencode` v2.0.12 = `2670273ff17da96f85c5826ced57aa1b368754fa` (v1 comparison `v1.4.9` = `803d9eb7a`)

> ## ⛔ VERDICT: `D1 NOT CLOSED · D2 NOT READY`
> **Cause: §1 could not be performed. This session has no route to the Mac Studio.**
> Smallest unresolved evidence act is named in §15. ⭐ Everything else the act
> asked for is complete, and §6 found **three network surfaces D1a did not have**.

**NO QWEN E3 EXECUTION PERFORMED · NO EXECUTION GRANT MINTED · NO EXECUTION GRANT CONSUMED · NO IMPLEMENTATION REPAIR PERFORMED · NO PRODUCTION MUTATION**

---

## 1. MAC STUDIO HOST PROBE — ⛔ NOT PERFORMED

**WITNESSED in this session:**

```
opencode   ABSENT
ssh        ABSENT
scp        ABSENT
sshpass    ABSENT
~/.ssh     empty
uname      Linux 6.18.44-fc-v37 x86_64
```

The canonical seam runs on a macOS Mac Studio. This session is a Linux container
with no `opencode` binary, no SSH client and no key material. **`opencode --version`
and `opencode run --help` cannot be issued from here.** That is a statement about
the environment, ⛔ not a deferral and ⛔ not a partial result: no host read has
been performed under this act.

⛔ **No host output is reported, inferred, simulated or predicted.** §2 therefore
carries `NOT YET ESTABLISHED` wherever host witness is required, exactly as the
act's classification scheme requires.

**Instrument** (extended under this act, read-only, value-redacting):
`scripts/witness/opencode-v2-containment-probe.sh` — 14 sections: A1–A3 binary and
CLI surface · B1–B6 config/agent provenance · **C1 network-capable surfaces ·
C2 second inline-config channel and ambient provider credentials · C3 wellknown
origin store and provider package root · C4 the ancestor walk from `TMPDIR` to `/`.**

---

## 2. D1 / D1a ↔ HOST RECONCILIATION

⛔ Source law is **not** collapsed into host observation. Nothing below is promoted
merely because the pinned source is internally consistent.

| # | Conclusion | Class |
|---|---|---|
| 1 | `--standalone` exists on `run` | `SOURCE-ENTAILED` — `commands.ts:16-24`, `standalone.ts` · host: **NOT YET ESTABLISHED** |
| 2 | `--pure` absent from v2.0.12 | `SOURCE-ENTAILED` — no `"pure"` flag, no `OPENCODE_PURE` in tree · host: **NOT YET ESTABLISHED** (observed once as the E3 error string — an error message is not a surface enumeration) |
| 3 | `OPENCODE_CONFIG_DIR` relocates only `global.config` | `SOURCE-ENTAILED` — `global.ts:79` |
| 4 | `HOME` governs `global.home` → `~/.claude`, `~/.agents` | `SOURCE-ENTAILED` — `global.ts:17-19`, `discovery.ts:27-28` |
| 5 | XDG vars outrank `HOME` for all global roots | `SOURCE-ENTAILED` — `global-roots.ts:4-8` |
| 6 | Project `opencode.json` is discovered in the working directory | `SOURCE-ENTAILED` — `discovery.ts:43`, `config.ts:234` |
| 7 | Ancestor walk is unbounded to `/` | `SOURCE-ENTAILED` — `fs-util.ts:162-177` (no `stop`) · host instance: **NOT YET ESTABLISHED** (probe C4) |
| 8 | Global/user config always loaded; `global:false` unreachable from CLI | `SOURCE-ENTAILED` — `config.ts:44-52`, `server-process.ts:104-111` |
| 9 | `<global.config>/AGENTS.md` always loaded; project walk bounded | `SOURCE-ENTAILED` — `instruction.ts:36-48`, `instruction-discovery.ts:99-100` |
| 10 | Agents load via `config.entries()` incl. `.opencode/agent(s)` | `SOURCE-ENTAILED` — `config/plugin/agent.ts:22-26` |
| 11 | Plugins arrive only as config `plugin`/`plugins` package lists; no disable directive | `SOURCE-ENTAILED` — `schema/config/plugin.ts`, `normalize.ts:185-190` |
| 12 | Inline config channels exist and outrank everything | `SOURCE-ENTAILED` — `config.ts:206-237` · ⭐ **AMENDED in §5: there are TWO** (`OPENCODE_CONFIG_CONTENT`, `OPENCODE_CLI_CONFIG_CONTENT`) |
| 13 | `wellknown` issues HTTP; `global:false` does not disable it | `SOURCE-ENTAILED` — `wellknown.ts:60-63, 83-92`; origins from KV under `global.data` |
| 14 | `ollama/qwen3-coder:30b` resolution | ⭐ **AMENDED, §4** — `@ai-sdk/openai-compatible` maps to a **builtin**, so no npm install and no network; the *provider block* source on the host is **NOT YET ESTABLISHED** |
| 15 | `jarvis-readonly` carries no `"*"` rule; fallback effect is `ask` | `SOURCE-ENTAILED` + repo-`WITNESSED` — `permission.ts:87-95` |
| 16 | Non-interactive run auto-rejects permission requests | `SOURCE-ENTAILED` — `noninteractive.ts:135-144` |

**`DIVERGENT`: none.** ⛔ Absence of divergence is not agreement — 1, 2, 7 and 14
have no host reading at all.

---

## 3. PROVENANCE — REPOSITORY SIDE WITNESSED, HOST SIDE UNKNOWN

| Input | Value | Source mechanism | Host path | Scope | Precedence | Standing | Survives D2? |
|---|---|---|---|---|---|---|---|
| Provider/model | `ollama/qwen3-coder:30b` | named in `scripts/builder/opencode-provider.mjs:35`; **defined** in an OpenCode config block that the sandbox does not materialize | **UNKNOWN** (probe B4) | global (presumed) | global (2nd of 6) | **AMBIENT (presumed)** | **yes** — re-issued from a sandbox-owned `opencode.json` (§8) |
| Provider package | `@ai-sdk/openai-compatible` | `aisdk-native.ts:67` → `@opencode/ai/providers/openai-compatible`, a **builtin** (`provider.ts:93`) | n/a — bundled | process | n/a | **AUTHORIZED** | yes — no install, no network |
| Agent | `jarvis-readonly` | `.opencode/agents/jarvis-readonly.md`, materialized by `work-unit-control.js:610-615` | sandbox `TMPDIR` | project | project (5th) | **AUTHORIZED** | yes |
| Agent (competing) | any `jarvis-readonly` elsewhere | global agent dirs, `~/.claude/agents`, `~/.agents` | **UNKNOWN** (probe B6) | global | global | **UNKNOWN** | no — excluded by `HOME`+`XDG` rebind |
| Plugins | any `plugin`/`plugins` entry in any loaded config | config graph | **UNKNOWN** (probe B4) | global/project | per source | **UNKNOWN** | no |
| Instructions | `<global.config>/AGENTS.md` | `instruction.ts:37`, global scope defaults ON | **UNKNOWN** (probe B3) | global | always | **UNKNOWN** | no — excluded by `OPENCODE_CONFIG_DIR` |
| Instructions | ancestor `AGENTS.md` | bounded walk (`stop`) | sandbox only | project | bounded | **AUTHORIZED** | yes |
| Ancestor config | `opencode.json`/`.opencode`/`.claude`/`.agents` above the sandbox | **unbounded** walk | **UNKNOWN** (probe C4) | ancestor | direct/project | **UNKNOWN** | ⚠️ **NO CONTROL** — see §4 residual |
| Env-carried config | `OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT`, `OPENCODE_CLI_CONFIG_CONTENT` | passed through untouched by `childEnv()` | inherited | process | **highest** | **AMBIENT** | no — stripped |
| Remote config | `wellknown` origins | KV under `global.data` | **UNKNOWN** (probe C3) | global | 1st (lowest) | **UNKNOWN** | no — empty DB after rebind |
| Working directory | sandbox | `mkdtempSync(os.tmpdir(), 'jarvis-e1-evidence-')` | `$TMPDIR/jarvis-e1-evidence-*` | run | n/a | **AUTHORIZED** | yes |
| Service | ambient background service | default when `--standalone` absent | **UNKNOWN** (probe B1) | host | n/a | **AMBIENT** | no — `--standalone` |

⛔ No secret value is recorded anywhere in this document; §5 records presence and
class only.

---

## 4. SOURCE-CLASS CLOSURE TABLE

⛔ Containment is **never** claimed from precedence. Governing property:
*unauthorized ambient configuration cannot participate in canonical provider execution.*

| # | Source class | Presently reachable? | Closure mechanism | D2 control | Residual |
|---|---|---|---|---|---|
| 1 | JARVIS sandbox / project | yes (intended) | n/a — this is the authorized source | materialize `opencode.json` + agent | none |
| 2 | User/global config dir | **yes** | rebind the global root | `OPENCODE_CONFIG_DIR` **and** `XDG_CONFIG_HOME` **and** `HOME` | none |
| 3 | XDG data/cache/state roots | **yes** | rebind | `XDG_DATA_HOME`, `XDG_CACHE_HOME`, `XDG_STATE_HOME` | none |
| 4 | Global `AGENTS.md` | **yes** (defaults ON) | follows `global.config` | `OPENCODE_CONFIG_DIR` | none |
| 5 | Ancestor / project walk | **yes, unbounded to `/`** | ⚠️ **none available** | — | ⚠️ **RESIDUAL — F6 is the only detector** |
| 6 | `wellknown` remote config | credential-gated | origins live in the DB under `global.data` | `HOME`+`XDG_DATA_HOME` (empty DB) | none once rebound |
| 7 | Env / inline config | **yes** | strip | strip **both** inline channels + `OPENCODE_CONFIG` | none |
| 8 | Agent & plugin discovery dirs (`~/.claude`, `~/.agents`) | **yes** | keyed to `global.home` | `HOME` (+ `OPENCODE_TEST_HOME` absent) | none |
| 9 | Legacy compatibility (`mode`/`modes`, v1 `plugin`) | via 1–8 | same controls | inherited | none |

⚠️ **Class 5 is the one residual and it is not closable by any v2 control.** It is
mitigated only by where the sandbox is created. **Stated, not hidden.**

---

## 5. ENVIRONMENT CONTRACT

**Exhaustive sweep** of `process.env.*` across `packages/{cli,core,server,util,ai}/src`
at v2.0.12 (88 names). Classified:

| Variable / family | Class | Reason |
|---|---|---|
| `PATH` | `REQUIRED` | locate the binary |
| `LANG`, `LC_*`, `TERM`, `COLORTERM`, `NO_COLOR`, `USER`, `LOGNAME`, `SHELL`, `TMPDIR` | `SAFE / IRRELEVANT` | presentation / identity |
| `HOME` | **`MUST REBIND`** | governs `global.home` → classes 2,3,4,6,8 |
| `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME`, `XDG_STATE_HOME` | **`MUST REBIND`** | outrank `HOME` (`global-roots.ts:4-8`) |
| `OPENCODE_CONFIG_DIR` | **`MUST REBIND`** | sole control for global `AGENTS.md` |
| `OPENCODE_TEST_HOME` | **`MUST STRIP`** | overrides `os.homedir()`; would defeat the `HOME` rebind |
| `OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT`, **`OPENCODE_CLI_CONFIG_CONTENT`** | **`MUST STRIP`** | ⭐ **two inline channels, not one — D1 §4 named only one.** Highest precedence |
| `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_CONFIG_PROJECT_DISABLE` | **`MUST STRIP`** | would drop the governed agent (D1 §2.5) |
| `OPENCODE_MODELS_URL`, `OPENCODE_MODELS_PATH`, `OPENCODE_DB` | **`MUST STRIP`** | ambient redirection of catalog / database |
| `OPENCODE_DISABLE_MODELS_FETCH` | **`REQUIRED` = `1`** | §6 N1 |
| `OPENCODE_DISABLE_AUTOUPDATE` | **`REQUIRED` = `1`** | §6 N2 |
| `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_RESOURCE_ATTRIBUTES` | **`MUST STRIP`** | §6 N4 — ambient telemetry egress |
| `OPENCODE_API_KEY`, `OPENCODE_SERVER_PASSWORD`, `OPENCODE_PASSWORD` | **`MUST STRIP`** | server auth; `--standalone` mints its own (`standalone.ts:24`) |
| `OPENCODE_CLIENT`, `OPENCODE_SIMULATE`, `OPENCODE_DIRECT_TRACE`, `OPENCODE_PRINT_LOGS`, `OPENCODE_LOG_LEVEL`, `OPENCODE_TUI_CHANNEL` | **`MUST STRIP`** | alter identity/instrumentation of a governed run |
| Provider credentials — `AWS_*`, `AZURE_*`, `GOOGLE_*`/`GCLOUD_*`/`GCP_*`/`VERTEX_*`, `SNOWFLAKE_*`, `CLOUDFLARE_*`, `AICORE_*`, `GITLAB_TOKEN`, `MODAL_PROXY_TOKEN` | **`MUST STRIP`** | ⭐ could authorize a **non-authorized, metered, network-reaching** provider. `qwen-local` declares `credential_env: null` — it needs none |
| `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY`/`NO_PROXY` | **`UNRESOLVED`** | ⚠️ not read anywhere in opencode source; the runtime's HTTP stack may honour them implicitly. **Probe C1 records presence; D2 must rule.** |
| `OPENCODE_*_PATH` native-asset vars (`NODE_PTY`, `PARCEL_WATCHER`, `TREE_SITTER_*`, `PHOTON_WASM`, `PTY_BIN`) | **`UNRESOLVED`** | redirect loadable native code; `bash` is denied so exercise is unlikely. D2 should strip unless proven required |
| `ZDOTDIR`, `COMSPEC`, `PATHEXT`, `XDG_RUNTIME_DIR`, `SSH_ASKPASS_*` | **`SAFE / IRRELEVANT`** here | shell/PTY paths; `bash` denied |

### `extendEnv: true` — ⭐ ACCEPTABLE, AND HERE IS THE PROOF

`standalone.ts:18-33` spawns the private server with `env: { OPENCODE_PASSWORD }`,
`extendEnv: true`. `extendEnv` extends **the `opencode run` CLI process's own
environment** — which is precisely the environment JARVIS hands it via `execFile`.
⭐ **Containment is therefore established one level up: if the CLI child's
environment is the controlled allowlist, the private server inherits exactly that
allowlist and nothing else.** `extendEnv: true` needs no change.

⚠️ **The corollary is the actual requirement:** it is acceptable **only** if
JARVIS switches from `childEnv()`'s four-name **subtraction** list to an
**allowlist**. Under today's subtraction, `extendEnv: true` faithfully propagates
the operator's entire environment into the server. **Minimum D2 mechanism: a
canonical-execution allowlist env builder.** ⛔ Not implemented here.

---

## 6. NETWORK CONTAINMENT — ⭐ THREE SURFACES D1a DID NOT HAVE

Source evidence only; ⛔ no outbound request was made and no sentinel endpoint contacted.

**Provider network property.** `qwen-local` is `external_network: false`,
`credential_env: null`, `baseURL http://127.0.0.1:11434/v1`. Its package resolves
to a **builtin** (`aisdk-native.ts:67` → `provider.ts:93`), so no npm install and
no registry traffic. ✅ The *provider* can reach only the authorized local endpoint.

**OpenCode process network property — ⛔ NO. Configuration resolution itself originates HTTP.**

| | Surface | Trigger | Gate | D2 control |
|---|---|---|---|---|
| **N1** | `GET https://models.opencode.ai/api.json` | ⭐ **forked at service construction, runs immediately, then repeats on a schedule** (`models-dev.ts:388-391`); `fetch` defaults **true** | ⛔ **none** — unconditional | `OPENCODE_DISABLE_MODELS_FETCH=1`; ⭐ **safe because `populate` reaches the bundled snapshot before the fetch** (`:389-396`), so the catalog still loads |
| **N2** | auto-update check | `Updater.layer` provided at CLI root (`cli/src/index.ts:112`) | returns early only on `OPENCODE_LOCAL` or `OPENCODE_DISABLE_AUTOUPDATE` (`updater.ts:243`) | `OPENCODE_DISABLE_AUTOUPDATE=1` |
| **N3** | `.well-known/opencode` + `remote_config.url` | per stored origin | credential/KV gated | empty DB via `HOME`+`XDG_DATA_HOME` |
| **N4** | OTLP telemetry export | `OTEL_EXPORTER_OTLP_ENDPOINT` set in ambient env | ambient | strip the OTEL family |

⭐⭐ **N1 is the concrete leak this act was asked to expose.** Unlike N3 it is not
credential-gated: **today, every canonical E3 invocation issues an outbound HTTPS
request before cognition begins**, in a lane whose provider is declared
`external_network: false`. That declaration is true of the model and false of the
process — and nothing in D1 or D1a caught it.

**Proposed D2 property:** *no configuration input may originate outside the
JARVIS-owned boundary.* Mechanism = §5 allowlist (strips N4, `OPENCODE_MODELS_URL`)
+ `HOME`/`XDG` rebind (empties N3's origin store) + `OPENCODE_DISABLE_MODELS_FETCH=1`
(N1) + `OPENCODE_DISABLE_AUTOUPDATE=1` (N2), **witnessed by F9, never assumed.**

---

## 7. FINAL F1–F10

⛔ No falsifier requires the E3 one-shot grant. All are `EXECUTION-GRANT CONSUMING: no`.

| ID | Property | Setup | Act | Expected | Fail | Fixture | Where | Mutating |
|---|---|---|---|---|---|---|---|---|
| **F1** | no `--pure` in any governed invocation | none | scan argv arrays at governed call sites, comments stripped first | zero occurrences | any occurrence | none | **CI** | non-mutating |
| **F2** | private service ownership | sandbox | canonical invocation | `--standalone` in argv **and** serving process is a descendant of the invocation | resolves through a pre-existing service | sandbox | host | non-mutating |
| **F3** | external plugin exclusion | plant a recognizable plugin declaration in the ambient global config | canonical invocation | not loaded, not executed | loaded | ambient config | host | **mutating** |
| **F4** | governed agent preserved | sandbox | canonical invocation | run output names `jarvis-readonly` | inferred from exit 0, or a different agent | sandbox | host | non-mutating |
| **F5** | provider preserved **+ refusal witnessed** | operator global root unreadable to the child | canonical invocation; attempt `edit`/`bash` | model resolves; refusal event observed | ⭐ inferring either from exit code (`noninteractive.ts` rejects without a non-zero exit) | sandbox | host | non-mutating |
| **F6** | ambient configuration excluded | sentinel in each of: global config, `~/.claude`, `~/.agents`, **and a sandbox ancestor** | canonical invocation | absent from the effective configuration | any sentinel present | ambient + ancestor | host | **mutating** |
| **F7** | lifecycle | record server pid | run, then exit | pid gone after exit | server outlives the run | sandbox | host | non-mutating |
| **F8** | response ≠ containment | none | assert the witness requires F3+F4+F5+F6+F9+F10 evidence | a successful response alone **fails** to satisfy it | any path where a response alone passes | none | **CI** | non-mutating |
| **F9** | no unauthorized outbound HTTP during config resolution | egress observation around the child | canonical invocation | **zero** requests to `models.opencode.ai`, any `.well-known/opencode`, any OTLP endpoint, any npm registry | any such request | sandbox | host | non-mutating |
| **F10** | no ambient `AGENTS.md` | sentinel in `<global.config>/AGENTS.md` **and** a sandbox ancestor | canonical invocation | neither sentinel in the assembled prompt | either present | ambient | host | **mutating** |

**F1 and F8 are CI-capable today.** F2, F4, F5, F7, F9 are
**D2 POST-IMPLEMENTATION LETHAL FALSIFIERS** — they require the containment
mechanism to exist. **F3, F6, F10 additionally require an authorized host act**
(ambient mutation + cleanup). ⛔ None is weakened to become runnable sooner.

---

## 8. EXACT D2 FILE BOUNDARY

| Path | Owning contract | Why required | Classification |
|---|---|---|---|
| `jarvis-desktop/src/work-unit-control.js` | canonical E3 provider invocation; JARVIS-owned configuration materialization; environment construction; standalone invocation; lifecycle | the seam: argv (`:674`), sandbox materialization (`:569`), `providerChildEnv` (`:170`) | **REQUIRED IMPLEMENTATION** |
| `jarvis-desktop/src/child-env.js` | environment construction/filtering | subtraction → allowlist for the canonical path (§5). ⚠️ **shared with other JARVIS children — D2 must ADD a canonical builder, never repurpose `childEnv()`** | **REQUIRED IMPLEMENTATION** |
| `scripts/builder/opencode-provider.mjs` | provider identity | ⚠️ **open**: it names providers without defining them; D2 must rule whether the provider *block* lives here or in a new governed asset | **REQUIRED IMPLEMENTATION (pending ruling)** |
| `jarvis-desktop/test/**` (new) | containment tests | F1, F8 now; F2/F4/F5/F7/F9 after | **LETHAL FALSIFIER / TEST** |
| `scripts/witness/opencode-v2-containment-probe.sh` | configuration-resolution witness | already committed | **DOCUMENTATION** |
| `docs/programme/**` | record | — | **DOCUMENTATION** |
| `.opencode/agents/jarvis-readonly.md` | permission boundary | R-A forbids touching it | **OUT OF SCOPE** |
| `jarvis-desktop/src/frontier-worker.js` · `test/frontier-worker.test.mjs` | frontier lane | ⛔ **different contract** — external metered provider, staged credential, own temp HOME | **OUT OF SCOPE** |
| `scripts/ain-delegate.sh` | AIN delegate | ⛔ **different contract** — live worktree, no sandbox | **OUT OF SCOPE** |

⛔ Nothing is silently absorbed. Per D1 §8, the evidence shows these lanes do
**not** share the canonical execution/configuration contract; **F1 alone is shared**,
and it is an assertion, not an abstraction.

---

## 9. CLOSURE QUESTION A — WHO OWNS THE OPENCODE PROCESS?

**Mechanism:** `--standalone` → `Standalone.start` → `ChildProcess.make(selfCommand(), ["serve","--stdio","--port","0"])`, spawned by the invocation, authenticated with a per-run 32-byte password, holding an ownership lease over stdin, terminated by `SIGTERM` / `forceKillAfter: 3s` when the invocation's scope closes (`standalone.ts:18-33`).

**Source: satisfied. Installed CLI: NOT YET ESTABLISHED (§1).**

> ⛔ **PASS WITHHELD.** The act requires *source **plus** installed CLI evidence*.

---

## 10. CLOSURE QUESTION B — WHO OWNS EVERY CONFIGURATION INPUT?

⛔ Precedence is **not** offered as containment. Exclusion mechanism per input:

| Input | Exclusion mechanism |
|---|---|
| Project configuration | sandbox **is** the project directory; JARVIS materializes it |
| User/global configuration | `HOME` + `XDG_CONFIG_HOME` + `OPENCODE_CONFIG_DIR` rebound to sandbox-owned roots |
| XDG config/data | all four XDG roots rebound |
| `AGENTS.md` (global) | follows `global.config` → rebound |
| `AGENTS.md` (project) | walk is `stop`-bounded to the sandbox |
| Agent discovery | `~/.claude`, `~/.agents` follow `global.home` → rebound; `OPENCODE_TEST_HOME` stripped |
| Plugin discovery | plugins exist only as config entries; every config source is owned or rebound |
| Env-carried configuration | **both** inline channels + `OPENCODE_CONFIG` stripped by allowlist |
| Remote / `wellknown` | origins live in the DB under `global.data` → rebound to an empty DB |
| Provider / model | declared in the sandbox-owned `opencode.json`; package is a builtin |
| Instructions & commands | same entry set as configuration |
| **Ancestor walk (class 5)** | ⚠️ **NO MECHANISM.** Unbounded to `/`; detectable only by F6 |

> ⛔ **PASS WITHHELD.** Eleven of twelve inputs have a named mechanism; **class 5
> has none**, and the act's own test is that *no unresolved ambient configuration
> path can silently participate.* ⭐ It is not silent — F6 detects it — but
> detection is not exclusion, and D2 must rule on it explicitly.

---

## 11–14. See §3 (provider, agent, plugin, instruction provenance), §4 (closure), §5 (environment), §6 (network).

---

## 15. CLOSURE VERDICT

> # `D1 NOT CLOSED · D2 NOT READY`

| Criterion | Status |
|---|---|
| Host CLI surface matches pinned source | ⛔ **NOT ESTABLISHED** — §1 unreachable |
| Process ownership has a mechanical answer | ✅ mechanism named · ⛔ PASS withheld pending CLI evidence |
| Configuration ownership has a mechanical answer | ⚠️ 11 of 12 · ⛔ class 5 unresolved |
| Environment contract bounded | ✅ 88 names swept and classified · ⚠️ 2 families `UNRESOLVED` (proxy, native-asset paths) |
| F1–F10 executable or correctly classified | ✅ |
| Exact D2 files known | ✅ |
| No unresolved ambient path can silently participate | ⚠️ class 5 is detectable, not excluded |

### Smallest unresolved evidence acts, in order

1. **Run the probe on the Mac Studio** and paste the output. One command, read-only. Settles §1, §2 items 1/2/7/14, §3's UNKNOWN rows, §5's proxy family, and the class-5 residual in practice (C4).
2. **Rule on class 5** — accept the residual with F6 as detector, or require D2 to create the sandbox at a path whose ancestors JARVIS controls.
3. **Rule on the §8 provider-block question** — `opencode-provider.mjs` or a new governed asset.

⛔ If the probe shows `--pure` present → **STOP, INSTALLED ARTIFACT / PINNED SOURCE
DIVERGENCE**; this document's §2 is void and D2 does not open.

---

## 16. CONFIRMATIONS

**NO QWEN E3 EXECUTION PERFORMED** · **NO EXECUTION GRANT MINTED** ·
**NO EXECUTION GRANT CONSUMED** · **NO IMPLEMENTATION REPAIR PERFORMED** ·
**NO PRODUCTION MUTATION** · no `--standalone` added to any production code ·
no configuration sandbox implemented · no permission hardening ·
`jarvis-readonly` unmodified · no outbound request issued under this act.

⭐ *D1 did not close, and the reason it did not is the finding: a lane whose
provider is declared `external_network: false` has been reaching the network on
every invocation, before cognition, through the configuration layer nobody was
auditing.*
