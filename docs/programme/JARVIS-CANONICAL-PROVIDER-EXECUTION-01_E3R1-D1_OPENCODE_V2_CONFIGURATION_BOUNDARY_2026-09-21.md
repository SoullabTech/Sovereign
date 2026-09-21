# JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1-D1 — OPENCODE V2 CONFIGURATION-BOUNDARY & FALSIFIER DESIGN

**Date:** 2026-09-21  
**Lineage:** `3c0f766ec` determination → `2c344488d` D1 candidate → `1adc6482a` D1a adversarial addendum → this closure record  
**Status:** **D1 DESIGN READY · HOST PROBE WITNESSED · D2 READY FOR FOUNDER AUTHORIZATION · IMPLEMENTATION NOT AUTHORIZED**

Preserved standing:

> **OPENCODE V2 MIGRATION DEFECT CONFIRMED · CONTAINMENT PROPERTIES PRESERVED BY RULING · E3 EXECUTION REMAINS CLOSED PENDING D2**

No canonical Qwen execution was initiated by this D1 act. No grant was minted or consumed by this D1 act. No production mutation occurred. No implementation repair occurred.

## 0. Evidence classes

- **HOST-WITNESSED** — read directly from Kelly's Mac Studio under this D1 act.
- **SOURCE-ENTAILED** — established from `sst/opencode` tag `v2.0.12`, tag object `2670273ff17da96f85c5826ced57aa1b368754fa`.
- **REPOSITORY-WITNESSED** — read from the exact JARVIS lineage above.
- **PROPOSED** — D2 design, not implemented.
- **ROUTED OUT** — relevant defect or hardening issue not owned by E3R1.

## 1. Host identity probe — HOST-WITNESSED

Complete bounded probe output:

~~~
=== opencode --version ===
opencode v2.0.12
=== opencode run --help ===
DESCRIPTION
  Run OpenCode with a message

USAGE
  opencode run [flags] [<message...>]

ARGUMENTS
  message... string    Message to send (optional)

FLAGS
  --standalone            Run with a private server instead of the background service
  --server string         Connect to a server URL instead of the background service
  --continue, -c          Continue the last session
  --session, -s string    Session ID to continue
  --fork                  Fork the session before continuing
  --model, -m string      Model to use in the format provider/model#variant
  --agent string          Agent to use
  --format choice         Output format (choices: default, json)
  --file, -f string       File to attach to the message
  --title string          Session title
  --thinking              Show thinking blocks
  --auto                  Auto-approve permissions that are not explicitly denied

GLOBAL FLAGS
  --help, -h                                                          Show help information
  --version, -v                                                       Show version information
  --wizard                                                            Start wizard mode for a command
  --completions <bash|zsh|fish|sh>                                    Print shell completion script (choices: bash, zsh, fish, sh)
  --log-level <all|trace|debug|info|warn|warning|error|fatal|none>    Sets the minimum log level (choices: all, trace, debug, info, warn, warning, error, fatal, none)
  --print-logs                                                        Print logs to stderr (server logs require --standalone)
~~~

Verdict:

- installed CLI reports `v2.0.12`;
- `--standalone` is present;
- `--pure` is absent;
- the Founder STOP condition did not fire;
- this proves command-surface correspondence only, not installed-binary/source hash identity.

During later read-only process inspection, a long-lived background OpenCode service was present with PPID 1. A separate canonical `opencode run --standalone` and its private `serve` child, launched by a concurrent act outside D1, were also briefly observed and later exited. D1 neither launched nor terminated those processes. That observation is not credited as an E3 execution or as a D1 runtime falsifier.

## 2. Configuration-loading law — SOURCE-ENTAILED

OpenCode v2.0.12 loads configuration in this effective order:

1. `wellknown`;
2. global config directory;
3. explicit `OPENCODE_CONFIG` file;
4. direct `opencode.json/jsonc` files discovered on the upward directory walk;
5. project supplementary directories such as `.opencode`;
6. `OPENCODE_CONFIG_CONTENT`, highest precedence.

Compatibility roots are separately discovered from `~/.claude` and `~/.agents` plus project-walk equivalents. Agent, command, skill and plugin loaders consume the resulting directory entries.

The upward config walk used by `ConfigDiscovery` has no stop bound unless project discovery is disabled. It therefore terminates only at the filesystem root.

Instruction discovery is a separate prompt-content surface:

- global `<global.config>/AGENTS.md` defaults ON;
- project `AGENTS.md` discovery obeys the project option;
- its project walk is bounded, unlike `ConfigDiscovery`'s default upward walk.

### 2.1 `OPENCODE_CONFIG_DIR` alone is insufficient

SOURCE-ENTAILED:

- `OPENCODE_CONFIG_DIR` relocates `global.config`;
- `~/.claude` and `~/.agents` are rooted in `global.home`, not `global.config`;
- direct/project discovery still walks upward from cwd;
- `OPENCODE_CONFIG` and `OPENCODE_CONFIG_CONTENT` remain independent injection channels;
- `wellknown` remains enabled;
- project `AGENTS.md` remains a separate instruction surface unless project discovery is disabled.

Therefore:

> **`OPENCODE_CONFIG_DIR` alone does not establish P-PURE or complete configuration ownership.**

### 2.2 `wellknown` and model-catalog network surfaces

SOURCE-ENTAILED:

- `wellknown` may issue GET requests to `<origin>/.well-known/opencode` and a `remote_config` URL;
- origins come from the KV/database state;
- `models.dev` has a periodic fetch path enabled by default unless `OPENCODE_DISABLE_MODELS_FETCH` is truthy;
- the CLI updater has a network update-check path unless `OPENCODE_DISABLE_AUTOUPDATE` is truthy.

This matters because `qwen-local` is governed as `external_network:false`. That property must describe the whole OpenCode process, not merely the Ollama inference request.

## 3. Current Mac Studio provenance — HOST-WITNESSED

At D1 probe time:

~~~
HOME=/Users/soullab
XDG_CONFIG_HOME=<unset>
XDG_DATA_HOME=<unset>
XDG_CACHE_HOME=<unset>
XDG_STATE_HOME=<unset>
OPENCODE_CONFIG_DIR=<unset>
OPENCODE_CONFIG=<unset>
OPENCODE_TEST_HOME=<unset>
OPENCODE_CONFIG_CONTENT=<unset>
OPENCODE_DISABLE_PROJECT_CONFIG=<unset>
OPENCODE_CONFIG_PROJECT_DISABLE=<unset>
resolved_global_config_root=/Users/soullab/.config/opencode
~~~

The host global OpenCode root contains:

- `opencode.json`;
- `agents/jarvis-readonly.md`;
- no configured plugin/plugin-directory entry observed;
- provider id `ollama`;
- model id `qwen3-coder:30b`;
- provider package `@ai-sdk/openai-compatible`;
- base URL `http://127.0.0.1:11434/v1`.

The host also has `~/.claude`. `~/.agents` was absent.

The global `jarvis-readonly.md` and the repository `jarvis-readonly.md` were byte-identical at D1:

~~~
sha256 7d83efe66f7050bdba22d21141b04160427b5989747f8997f33de32fc32b60cd
~~~

Current consequence:

> The existing canonical seam can resolve both the local Ollama provider and `jarvis-readonly` through ambient global configuration. Successful model resolution therefore cannot establish containment.

## 4. Correction to the D1 candidate layout

D1 at `2c344488d` proposed relocating `HOME/XDG` while leaving project discovery enabled and treating the rootward config walk as a residual guarded by F6.

That design is **not strong enough to close D1**, because a known ambient-input path would remain reachable.

D1a correctly witnessed the residual. This closure record removes it rather than accepting it.

### 4.1 Zero-residual configuration design — PROPOSED

Use one act-owned root with separate workspace and home:

~~~
<act-root>/
  workspace/
    <bounded evidence files only>

  home/
    .config/
      opencode/
        opencode.json
        agents/
          jarvis-readonly.md
    .local/
      share/
      state/
    .cache/
    tmp/
~~~

Rules:

1. `workspace` contains only the authorized evidence bundle; no `.opencode` directory is required.
2. `home/.config/opencode/opencode.json` contains only the authorized local Ollama provider/model definition.
3. `home/.config/opencode/agents/jarvis-readonly.md` is copied byte-identically from the governed repository agent.
4. no `plugin` or `plugins` directory is materialized.
5. no `~/.claude` or `~/.agents` compatibility roots are materialized.
6. project discovery is explicitly disabled.
7. OpenCode's internal DB is in-memory for this one-shot standalone service.
8. `models.dev` fetching and CLI update checking are disabled.

This preserves `jarvis-readonly` while eliminating the rootward direct/project walk. The earlier warning remains valid in its narrower form: disabling project discovery **without relocating the governed agent** would drop it. D2 must do both atomically.

## 5. Exact proposed provider configuration — PROPOSED

`home/.config/opencode/opencode.json`:

~~~json
{
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1"
      },
      "models": {
        "qwen3-coder:30b": {}
      }
    }
  }
}
~~~

No plugin key. No second provider. No credential reference. No agent duplication inside JSON.

## 6. Exact proposed argv — PROPOSED

Ordered argv:

~~~json
[
  "run",
  "--standalone",
  "--agent",
  "jarvis-readonly",
  "--model",
  "ollama/qwen3-coder:30b",
  "<canonical-provider-prompt>"
]
~~~

cwd: `<act-root>/workspace`

`--pure` is absent. `--auto` is absent. The background service is not used.

## 7. Environment contract — PROPOSED

D2 should replace `providerChildEnv`'s inherited-environment posture with an allowlist for this contained `qwen-local` lane.

### REQUIRED / CONTROLLED

| Variable | Controlled value | Purpose |
|---|---|---|
| `PATH` | JARVIS-built executable path | resolve OpenCode and required local binaries |
| `HOME` | `<act-root>/home` | owns `global.home` and compatibility roots |
| `XDG_CONFIG_HOME` | `<act-root>/home/.config` | owns global config |
| `XDG_DATA_HOME` | `<act-root>/home/.local/share` | owns data root |
| `XDG_CACHE_HOME` | `<act-root>/home/.cache` | owns cache root |
| `XDG_STATE_HOME` | `<act-root>/home/.local/state` | owns state root |
| `TMPDIR` | `<act-root>/home/tmp` | owns temp path |
| `OPENCODE_CONFIG_DIR` | `<act-root>/home/.config/opencode` | explicit governed global config root |
| `OPENCODE_CONFIG_PROJECT_DISABLE` | `1` | eliminates direct/project upward discovery and project instructions |
| `OPENCODE_DB` | `:memory:` | prevents persisted KV, credential and wellknown-source inheritance |
| `OPENCODE_DISABLE_MODELS_FETCH` | `1` | prevents `models.dev` network refresh |
| `OPENCODE_DISABLE_AUTOUPDATE` | `1` | prevents CLI update-check network activity |

### SAFE / IRRELEVANT, MAY BE COPIED IF NEEDED

`LANG`, `LC_*`, `SHELL`, `USER`, `LOGNAME` and `NO_COLOR`, provided their values are not used to discover configuration or credentials.

### MUST STRIP

- `OPENCODE_CONFIG`
- `OPENCODE_CONFIG_CONTENT`
- `OPENCODE_TEST_HOME`
- `OPENCODE_MODELS_URL`
- `OPENCODE_MODELS_PATH`
- `OPENCODE_API_KEY`
- `OPENCODE_BASE_URL`
- every other ambient `OPENCODE_*` variable not explicitly admitted above
- provider credential variables not required by `qwen-local`
- `HTTP_PROXY`, `HTTPS_PROXY` and `ALL_PROXY`
- `NODE_OPTIONS`
- `NODE_REPL_EXTERNAL_MODULE`
- `NODE_V8_COVERAGE`
- `ELECTRON_RUN_AS_NODE`

No ambient variable may silently reintroduce config, credentials, alternate provider routing, external model catalogs, or network proxies.

## 8. P-PURE and P-PRIVATE after the corrected design

P-PRIVATE:

> **Established by mechanism design:** `--standalone` selects a private child server with an invocation-scoped ownership lease. D2 must witness the process tree and lifecycle.

P-PURE:

> **Re-established by owned source set, not by a flag:** the only loaded global directory is the act-owned root; project discovery is disabled; explicit/content config injection is stripped; the DB is in-memory; compatibility roots are empty; external plugin directories are absent.

The historical `--pure` flag suppressed external plugins. The corrected boundary is stronger because it owns the whole config entry set and the relevant startup environment.

## 9. Executable falsifier specification

| ID | Setup / act | Expected observation | FAIL condition | Fixture | Capability |
|---|---|---|---|---|---|
| F1 | Static-scan every governed v2 argv construction | no `--pure`; canonical E3 argv contains `--standalone` | any governed v2 invocation retains `--pure` | repository source | CI, non-mutating |
| F2 | Run contained OpenCode against a local deterministic fake model endpoint while a background service already exists; inspect PID lineage | `serve` process is descendant of the run process, not PPID-1 service | run attaches to ambient service or no private child appears | local fake endpoint + process observer | host, non-ambient-mutating |
| F3 | Give the parent a synthetic ambient HOME/config containing a sentinel external plugin; contained lane relocates HOME | sentinel plugin is neither loaded nor executed | sentinel load/activation evidence appears | temp ambient-home fixture | host/CI where OpenCode is installed |
| F4 | Materialize byte-identical `jarvis-readonly` under contained global root; issue a deterministic disallowed tool attempt through fake provider | explicit permission rejection event for the governed agent | agent absent, wrong bytes, or disallowed act not rejected | local fake provider + agent hash | host |
| F5 | Inspect contained effective provider/model without invoking Qwen, then exercise fake loopback provider with same config shape | `ollama/qwen3-coder:30b` resolves from owned config; no ambient provider needed | resolution depends on host global config | owned config + fake endpoint | host |
| F6 | Place sentinel `opencode.json/.opencode` in synthetic ancestors and ambient HOME while project discovery is disabled | sentinel never enters effective configuration | any ancestor/global sentinel is observed | temp ancestor tree | host/CI where OpenCode is installed |
| F7 | Run the F2 fixture to completion | private serve PID exits with run; pre-existing service remains distinct | private child survives or wrong process is killed | process observer | host |
| F8 | Feed the witness a successful fake model response while withholding one containment proof | containment verdict remains FAIL/INCOMPLETE | model success alone produces containment PASS | witness harness | CI |
| F9 | Observe child/descendant sockets during local fake-provider run | no non-loopback outbound connection during boot/config/run | any non-loopback HTTP/socket appears | socket observer; models/update disabled | host |
| F10 | Put sentinel `AGENTS.md` in ambient global config and synthetic ancestors; fake provider captures assembled request | sentinel text absent from model request | ambient instruction reaches assembled prompt | fake provider request capture | host |

F3, F6 and F10 no longer need to mutate the operator's real ambient configuration. Synthetic ambient roots are sufficient and safer.

## 10. Defect-class reconciliation

| Surface | Owning lane | Direct v2 call? | P-PURE | P-PRIVATE | Same config contract as E3? | Disposition |
|---|---|---:|---:|---:|---:|---|
| `jarvis-desktop/src/work-unit-control.js` canonical seam | E1/E3 canonical provider execution | yes | yes | yes | yes | E3R1 D2 |
| `jarvis-desktop/src/frontier-worker.js` | Frontier external lane | yes | yes | yes | no | separate act with its positional test |
| `scripts/ain-delegate.sh` worktree call | AIN delegate | yes | yes | yes | no | separate act |
| `scripts/ain-delegate.sh` non-worktree call | AIN delegate | yes | yes | yes | no | separate act |
| `jarvis-desktop/test/frontier-worker.test.mjs` | Frontier test | no | n/a | n/a | no | repair with Frontier call site |

Do not force one shared abstraction across these materially different transport contracts.

The additional D1 finding that `frontier-worker` carries v1-era/ineffective OpenCode controls remains routed out.

## 11. `jarvis-readonly` permission observation — ROUTED OUT

The agent has no `"*"` default rule. v2's unmatched permission fallback is `ask`, not `deny`. The non-interactive runner auto-rejects asks, so the lane still fails closed, but the fail-closed mechanism is partly runner posture rather than solely agent policy.

Do not harden the shared agent in E3R1. F4 must assert the rejection event, and F8 forbids treating exit 0 as a permission witness.

## 12. Bounded D2 implementation file set

D2 should be authorized against this exact file boundary:

### REQUIRED

1. `jarvis-desktop/src/opencode-v2-containment.js` — **NEW** pure containment/config/env materializer for the canonical `qwen-local` v2 lane.
2. `jarvis-desktop/src/work-unit-control.js` — wire the contained act root, owned global config, controlled environment and `--standalone` argv; remove `--pure`; fail closed for unsupported OpenCode provider contracts rather than falling back to ambient config.

### TEST / FALSIFIER

3. `jarvis-desktop/test/opencode-v2-containment.test.mjs` — **NEW** deterministic unit/source falsifiers for env, materialization, argv, provider/agent identity and F8 witness law.
4. `scripts/witness/opencode-v2-containment-witness.mjs` — **NEW** bounded host witness for F2-F7 and F9-F10 using a local deterministic fake provider; no Qwen call and no execution grant.

### DOCUMENTATION

5. `docs/programme/JARVIS-CANONICAL-PROVIDER-EXECUTION-01_E3R1-D2_OPENCODE_V2_CONTAINMENT_IMPLEMENTATION_2026-09-21.md` — eventual D2 implementation/witness record.

### OUT OF SCOPE

- `scripts/builder/opencode-provider.mjs`
- `.opencode/agents/jarvis-readonly.md`
- `jarvis-desktop/src/frontier-worker.js`
- `jarvis-desktop/test/frontier-worker.test.mjs`
- `scripts/ain-delegate.sh`
- production deployment surfaces

If implementation proves any additional file is required, D2 must stop and request boundary expansion rather than silently adding it.

## 13. D2 provider scope

The corrected D2 mechanism is authorized in design for the exact canonical `qwen-local` identity:

- `provider_id: qwen-local`
- OpenCode provider: `ollama`
- model: `qwen3-coder:30b`
- adapter: `opencode`
- `external_network: false`

Other OpenCode provider contracts must fail closed at this contained canonical seam unless separately admitted. D2 must not preserve them by falling back to ambient configuration.

## 14. Grant and production standing

Under this D1 act:

> **NO QWEN E3 EXECUTION PERFORMED BY D1**

> **NO EXECUTION GRANT MINTED BY D1**

> **NO EXECUTION GRANT CONSUMED BY D1**

> **NO PRODUCTION MUTATION**

> **NO IMPLEMENTATION REPAIR PERFORMED**

A concurrent canonical Qwen run from another act was observed during read-only host inspection. It was not launched, controlled, retried, terminated or adjudicated by D1 and is not evidence for D1 closure.

Repository mutation under D1 is documentary/witness-design only.

## 15. Closure questions

### Who owns the OpenCode process?

With the proposed D2 mechanism:

> **JARVIS owns the invocation-scoped OpenCode service through `--standalone`.**

D2 must still execute F2 and F7 before this becomes a runtime witness.

### Who owns every configuration input to that process?

With the corrected zero-residual design:

> **JARVIS owns the admitted config roots and environment: relocated HOME/XDG/OPENCODE_CONFIG_DIR, in-memory DB, project discovery disabled, explicit/content injection stripped, byte-identical governed agent materialized into the owned global root, and network-bearing model/update discovery disabled.**

There is no longer a knowingly accepted rootward configuration residual in the design.

## 16. D1 verdict

**Configuration isolation verdict:** **DESIGN-SUFFICIENT · ZERO KNOWN AMBIENT CONFIG SOURCE LEFT ADMITTED · RUNTIME FALSIFICATION STILL OWED IN D2**

**D2 readiness:** **YES — READY FOR FOUNDER AUTHORIZATION**

The D2 authorization must explicitly permit:

- implementation only within §12;
- creation of synthetic temp ambient/config/ancestor fixtures;
- a local deterministic fake provider/server;
- read-only process/socket observation;
- no Qwen E3 execution;
- no execution grant mint/consume;
- no production mutation.

Only after D2 implementation and F1-F10 pass should the canonical one-shot E3 Qwen witness be reopened.

> **D1 CLOSED AT DESIGN/EVIDENCE LEVEL · D2 MAY OPEN · E3 EXECUTION REMAINS CLOSED**
