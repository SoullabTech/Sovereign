# E3R1-D1 — OPENCODE V2 CONFIGURATION-BOUNDARY & FALSIFIER DESIGN

**Lane:** `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1 — OpenCode v2 Containment Reconciliation`
**Date:** 2026-09-21
**Authority:** founder adjudication of 2026-09-21 (R-A re-establish · R-B require `--standalone` · R-C bounded reconciliation first)
**Status:** ⚠️ **CANDIDATE — §1 OWED.** ⛔ NO IMPLEMENTATION · ⛔ NO GRANT MINTED OR CONSUMED · ⛔ PRODUCTION UNTOUCHED

---

## 0. Evidence classes used in this document

- **WITNESSED** — read directly from a durable artifact in this session.
- **ENTAILED** — read from version-pinned upstream source (`sst/opencode` @ `v2.0.12` = `2670273ff17da96f85c5826ced57aa1b368754fa`; v1 comparison @ `v1.4.9` = `803d9eb7ad5f4dfd832d7506a7cad83ded52253e`).
- **OWED** — answerable only on the Mac Studio host.

⛔ The two are never merged. Every claim below carries its class.

---

## 1. HOST PROBE — ⛔ OWED

**This section cannot be discharged from the session container.** There is no
`opencode` binary here and no route to the Mac Studio. That is a statement about
the environment, not a deferral: no host read has been performed under this act.

Instrument authored and committed for the founder to spend:

```
bash scripts/witness/opencode-v2-containment-probe.sh
```

Read-only by construction: it writes nothing, starts no server, invokes no
model, and prints **paths, presence and key names only** — never a
configuration value, because the files in scope may carry credentials.

It answers, in one run: A1 binary identity · A2 run-command surface · A3 dead-flag
absence and `--standalone` presence · B1 ambient service presence · B2 config
roots in effect · B3–B6 configuration and agent provenance.

**Stop conditions carried from the adjudication:**
- `--pure` present anywhere in the installed surface → **STOP, INSTRUMENT /
  INSTALLED-ARTIFACT DIVERGENCE.** §2 is void; this design may not proceed.
- `--standalone` absent → **STOP**, R-B cannot be satisfied as ruled.

⚠️ This probe establishes **CLI-surface correspondence only**. It does not
establish binary/source hash identity, and must never be recorded as if it had.

---

## 2. v2.0.12 CONFIGURATION-LOADING EVIDENCE — ENTAILED

### 2.1 Which sources are loaded

`packages/core/src/config/discovery.ts` (`ConfigDiscovery.discover`) resolves six
source classes:

| Class | Root | Rooted in |
|---|---|---|
| `global` | `<global.config>/opencode.json(c)` and that directory | `OPENCODE_CONFIG_DIR` ?? `XDG_CONFIG_HOME/opencode` ?? `$HOME/.config/opencode` |
| `explicit` | `OPENCODE_CONFIG` file | env |
| `direct` | `opencode.json(c)` in every directory from the working directory **up to the filesystem root** | working directory |
| `project` | every `.opencode/` directory on that same upward walk | working directory |
| `claude` | `$HOME/.claude` **plus** every `.claude/` on the upward walk | `global.home` |
| `agents` | `$HOME/.agents` **plus** every `.agents/` on the upward walk | `global.home` |

### 2.2 Precedence — later wins

`packages/core/src/config.ts:230-237` assembles the entry list in this exact order:

```
wellknown → global → explicit(OPENCODE_CONFIG) → direct → project(.opencode) → content(OPENCODE_CONFIG_CONTENT)
```

with the source comment *"Global entries sit below explicit and direct files;
project directories rank above them."* **`OPENCODE_CONFIG_CONTENT` is the
highest-precedence source.**

### 2.3 The env surface that actually reaches a run

`packages/cli/src/server-process.ts:104-111` passes exactly four config knobs to
the server: `directory` (`OPENCODE_CONFIG_DIR`), `project`
(`OPENCODE_CONFIG_PROJECT_DISABLE` / `OPENCODE_DISABLE_PROJECT_CONFIG`), `file`
(`OPENCODE_CONFIG`), `content` (`OPENCODE_CONFIG_CONTENT`).

### 2.4 ⭐⭐ THE DECISIVE FINDING — `OPENCODE_CONFIG_DIR` ALONE DOES NOT ISOLATE

The founder required that no such assumption be promoted without evidence. The
evidence says **it is false**, for two independent reasons:

1. **`~/.claude` and `~/.agents` are configuration sources, and they are keyed to
   `global.home`, not to `global.config`.** `discovery.ts:27-28` builds them from
   `path.join(global.home, ".claude" | ".agents")`, while only `config` is
   replaced by `OPENCODE_CONFIG_DIR` (`packages/util/src/global.ts:79`).
   `global.home` resolves as `OPENCODE_TEST_HOME ?? os.homedir()` — i.e. `$HOME`.
   **Relocating `OPENCODE_CONFIG_DIR` leaves both reachable.**
2. **The `direct` and `project` walks ascend from the working directory to the
   filesystem root**, so any `opencode.json`, `.opencode`, `.claude` or `.agents`
   in an ancestor of the sandbox is in scope regardless of `OPENCODE_CONFIG_DIR`.

⭐ There **is** an exact switch for property 1 — `Options.global: false`, whose
own source comment reads *"false skips the global config dir, `~/.claude`, and
`~/.agents`; wellknown, file, and content entries still load"*
(`packages/core/src/config.ts:47-48`). ⚠️ **It is not wired to any environment
variable or CLI flag**: `server-process.ts` passes `project`, `file` and
`content`, never `global`. It is reachable from the library API only.

**Therefore, for a CLI-driven canonical run, the only mechanism that neutralizes
the global, `~/.claude` and `~/.agents` sources is relocating `HOME`** — with
`XDG_CONFIG_HOME` (and siblings) redirected too, since `global-roots.ts` reads
the XDG variables **in preference to** `$HOME`, so a relocated `HOME` with an
ambient `XDG_CONFIG_HOME` still lands on the operator's configuration.

`OPENCODE_TEST_HOME` must additionally be proven **absent**: it overrides
`os.homedir()` for `global.home` and would silently defeat a relocated `HOME`.

### 2.5 ⛔ The trap, now mechanically confirmed

`OPENCODE_DISABLE_PROJECT_CONFIG=1` sets `project: false`, which in
`discovery.ts:34` collapses the directory walk to `[]` — removing the `project`
class, which is **where `.opencode/agents/jarvis-readonly.md` is found**
(`packages/core/src/config/plugin/agent.ts` loads agents from `config.entries()`;
`sourceDirectories = ["agent","agents","mode","modes"]`).

**Disabling project configuration would drop the governed agent while leaving the
process able to exit 0.** The adjudication forbids exactly this. ⛔ Do not set it.

---

## 3. CURRENT PROVENANCE — WHAT REACHES A CANONICAL RUN TODAY

**WITNESSED in this repository:**

| Element | Present state |
|---|---|
| Sandbox materialization | `jarvis-desktop/src/work-unit-control.js:569` `materializeCanonicalEvidenceSandbox()` — `mkdtempSync(os.tmpdir(), 'jarvis-e1-evidence-')`, copies the bounded evidence files **plus exactly one governance file**, `.opencode/agents/jarvis-readonly.md` (`:610-615`). **No `opencode.json` is materialized.** |
| Child environment | `providerChildEnv()` (`:170`) → `childEnv()` (`jarvis-desktop/src/child-env.js:42`) strips **only** `NODE_OPTIONS`, `NODE_REPL_EXTERNAL_MODULE`, `NODE_V8_COVERAGE`, `ELECTRON_RUN_AS_NODE`, then extends `PATH`. **`HOME`, `XDG_*` and every `OPENCODE_*` variable pass through untouched.** |
| Provider spec | `scripts/builder/opencode-provider.mjs:35` — `qwen-local` → `opencode_provider: 'ollama'`, `default_model: 'qwen3-coder:30b'`, `external_network: false`, `credential_env: null`. It names a provider; it does not define one. |
| Provider **definition** | The `ollama` provider block (`baseURL http://127.0.0.1:11434/v1`, `@ai-sdk/openai-compatible`) exists in the repository's root `opencode.json` — which is **not** in the sandbox and **not** on the sandbox's upward walk. |

**ENTAILED consequence:** with no config in the sandbox and no ancestor carrying
one, `ollama/qwen3-coder:30b` can only be resolving today from the operator's
**global** configuration — the same source class that can carry plugin
declarations. ⭐ **This is the defect stated precisely: the provider and the
plugin surface arrive through one and the same ambient channel.**

⛔ **OWED, §1 B3/B4/B6 settle it.** Until the probe runs, the sentence above is
the leading hypothesis, not a finding. The probe also answers whether
`jarvis-readonly` exists anywhere outside the repository — if it does, the agent
in force during E3 may not have been the materialized one.

---

## 4. PROPOSED SANDBOX-OWNED CONFIGURATION LAYOUT — ⛔ PROPOSED, NOT TAKEN

Smallest set satisfying R-A while preserving the governed execution contract:

```
<sandbox>/                                  ← cwd of the run
  <bounded evidence files>                  ← unchanged
  .opencode/agents/jarvis-readonly.md       ← unchanged (project class; the agent)
  opencode.json                             ← NEW: authorized provider only
<sandboxHome>/                              ← NEW, sibling of the workspace
  .config/opencode/                         ← empty; the relocated global root
  (.claude, .agents absent by construction)
```

`<sandbox>/opencode.json` declares the **single** authorized provider and
nothing else — no second provider, no credential reference, no `plugin`/`plugins`
key, no agent block:

```json
{
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "options": { "baseURL": "http://127.0.0.1:11434/v1" },
      "models": { "qwen3-coder:30b": {} }
    }
  }
}
```

Child environment — **allowlist, not subtraction** (the `frontier-worker`
discipline, which `providerChildEnv` does not yet follow):

| Variable | Value | Why |
|---|---|---|
| `HOME` | `<sandboxHome>` | neutralizes `~/.claude` + `~/.agents` (§2.4) |
| `XDG_CONFIG_HOME` | `<sandboxHome>/.config` | else it outranks `HOME` for the config root |
| `XDG_DATA_HOME` / `XDG_CACHE_HOME` / `XDG_STATE_HOME` | under `<sandboxHome>` | server DB/state stay inside the act |
| `OPENCODE_CONFIG_DIR` | `<sandboxHome>/.config/opencode` | explicit rather than merely implied by `HOME` |
| `PATH`, `LANG`, `LC_*`, `TMPDIR`, `SHELL`, `USER`, `LOGNAME` | carried | minimum to execute |
| `OPENCODE_TEST_HOME` | **must be absent** | would override `HOME` for `global.home` |
| `OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT` | **must be absent** | highest-precedence ambient injection channels (§2.2) |
| `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_CONFIG_PROJECT_DISABLE` | **must be absent** | would drop the agent (§2.5) |

⚠️ **Residual, named rather than hidden:** the `direct`/`project` walk still
ascends from the sandbox to `/`. On macOS that path is
`/var/folders/<x>/<y>/T/jarvis-e1-evidence-*`. Nothing in the proposed boundary
prevents an `opencode.json` or `.opencode` planted in an ancestor from loading.
**F6 exists to detect exactly this**, and the residual must be stated in any
acceptance record rather than described as total isolation.

⚠️ **`OPENCODE_CONFIG_CONTENT` is deliberately NOT used** even though it is the
highest-precedence source and would need no file. It is an env-carried
configuration channel; preferring it would make the governed configuration
invisible in the sandbox that the act is supposed to be able to show. ⛔ Recorded
as considered and declined, not overlooked.

---

## 5. EXACT COMMAND SHAPE — ⛔ PROPOSED, NOT TAKEN

```
opencode run --standalone \
  --agent jarvis-readonly \
  --model ollama/qwen3-coder:30b \
  <prompt>
```

cwd `<sandbox>`, environment per §4.

- `--pure` — **removed**; no successor exists (D0 determination, accepted).
- `--standalone` — **added per R-B.** `packages/cli/src/services/standalone.ts`
  spawns `opencode serve --stdio --port 0` as a child with `extendEnv: true`
  (so §4's environment governs the server that actually loads configuration),
  with a stdin-EOF ownership lease, `SIGTERM` and `forceKillAfter: 3 seconds`.
- ⛔ `--auto`, `--yolo`, `--dangerously-skip-permissions` — **never.** The v1
  bridge maps v1 `--dangerously-skip-permissions` onto native `auto`; reaching
  for any of them while looking for a `--pure` stand-in moves containment in the
  opposite direction.
- The `jarvis-readonly` permission block is **unchanged**. R-A's floor — *do not
  weaken a permission/agent boundary to obtain configuration isolation* — is
  satisfied by construction: nothing in §4 or §5 edits it.

---

## 6. EXECUTABLE FALSIFIER DESIGN

⛔ **Designed, not authored.** Every falsifier states the candidate it kills.

| ID | Proposition | Method | Kills |
|---|---|---|---|
| **F1** | No governed OpenCode v2 invocation contains `--pure` | static scan of the argv arrays at every governed call site, comments stripped before scanning (the C21 lesson — a file documenting the ban must not fail its own scan) | a partial repair that fixes the canonical seam and leaves a sibling lane dead |
| **F2** | Canonical execution uses the private-service control and does not resolve through an ambient service | assert `--standalone` in argv **and** witness that the serving process is a descendant of the invocation | a repair that drops `--pure` and silently attaches to the background service |
| **F3** | An external plugin declared in an ambient source is not loaded | plant a recognizable plugin declaration in the ambient global config; run; assert no load/execution evidence | any candidate relying on `OPENCODE_CONFIG_DIR` alone (§2.4) |
| **F4** | The governed agent survives the new boundary | assert from run output that `jarvis-readonly` is in force — ⛔ **never inferred from exit 0** | the `OPENCODE_DISABLE_PROJECT_CONFIG` candidate (§2.5), which exits 0 with the agent gone |
| **F5** | The authorized model resolves through sandbox-owned configuration | run with the operator's global config root unreadable to the child | a candidate that "works" because ambient configuration is still being read |
| **F6** | No ambient configuration is reachable | sentinel value placed **only** in an unauthorized ambient source must be absent from the effective configuration | an isolation that misses `~/.claude`, `~/.agents`, or the upward walk residual |
| **F7** | Lifecycle | the standalone server must not outlive the run; assert the pid is gone after exit | a private server leaked per run, re-creating the ambient-service condition over time |
| **F8** | Zero false containment inference | a successful model response alone must **fail** to satisfy the containment witness; the witness requires F3+F4+F5+F6 evidence | the whole class of "it answered, therefore it is contained" |

⭐ **F8 is the discriminator for the suite itself**, and it is the lane's own
history restated: E3 failed *above* the model layer while the substrate was
healthy. A witness that a model answered has never been a witness that the act
was governed.

⚠️ **F3 and F6 mutate ambient state on the host** (planting a sentinel/plugin in
a configuration source). That is a host act with its own cleanup obligation and
is **⛔ not authorized by this design** — it is named here so the implementation
act can request it explicitly rather than perform it as a side effect.

---

## 7. BOUNDED FILE LIST FOR THE EVENTUAL IMPLEMENTATION

⛔ **None of these is modified by this document.**

| File | Change |
|---|---|
| `jarvis-desktop/src/work-unit-control.js` | `materializeCanonicalEvidenceSandbox()` also materializes `<sandbox>/opencode.json` and `<sandboxHome>/`; `providerChildEnv()` (or a new canonical-execution env builder) becomes an allowlist per §4; the `opencode` argv drops `--pure` and gains `--standalone`; sandbox cleanup extends to `<sandboxHome>` |
| `scripts/builder/opencode-provider.mjs` | source of the provider block written into `<sandbox>/opencode.json` — ⚠️ **open question:** whether the provider *definition* belongs here or in a new governed asset. It presently names providers without defining them. |
| `tests/` (new) | F1–F8 |

Everything else is out of bounds for this repair, including — explicitly — the
`jarvis-readonly` agent definition.

---

## 8. R-C — BOUNDED RECONCILIATION OF THE DEFECT CLASS

| # | Occurrence | Owning lane | Invokes OpenCode v2 directly | P-PURE applies | P-PRIVATE applies | Config deps identical to canonical E3 seam |
|---|---|---|---|---|---|---|
| 1 | `jarvis-desktop/src/work-unit-control.js:674` | E1/E3 canonical provider execution | yes | **yes** | **yes** | — (is the seam) |
| 2 | `jarvis-desktop/src/frontier-worker.js:166` | Frontier (nemotron-zen, external) | yes | yes | **yes** | **no** — already relocates `HOME`/`XDG_*`/`OPENCODE_CONFIG_DIR`, stages a credential, writes its own agent |
| 3 | `scripts/ain-delegate.sh:402` | AIN delegate (worktree) | yes | yes | **yes** | **no** — runs in a git worktree, not a materialized sandbox; inherits the operator's full environment |
| 4 | `scripts/ain-delegate.sh:404` | AIN delegate (non-worktree) | yes | yes | **yes** | **no** — as above |
| 5 | `jarvis-desktop/test/frontier-worker.test.mjs:80` | Frontier test | no | n/a | n/a | n/a — asserts `['run','--pure','--agent','jarvis-frontier']` positionally |

### 8.1 ⚠️ The test currently locks the defect in

`frontier-worker.test.mjs:80` asserts the obsolete argument **by position**. Any
correct repair of occurrence 2 fails this test, and the cheapest way to make it
pass is to restore the dead flag. ⛔ It must be repaired **with** its call site,
never before it and never by relaxing the assertion into one that no longer
checks the argument vector.

### 8.2 ⚠️ A second defect found in the frontier lane, ⛔ not repaired here

`buildSanitizedEnv()` (`frontier-worker.js:119-122`) sets four isolation
variables. Against `v1.4.9` and `v2.0.12`:

| Variable | v1.4.9 | v2.0.12 |
|---|---|---|
| `OPENCODE_DISABLE_CLAUDE_CODE` | present (2 files) | **absent** |
| `OPENCODE_DISABLE_DEFAULT_PLUGINS` | present (5 files) | **absent** |
| `OPENCODE_ENABLE_EXA` | present (2 files) | **absent** |
| `OPENCODE_ENABLE_PARALLEL` | **absent** | **absent** |

⭐ Three are v1 controls that v2 no longer reads; the fourth was **never real in
either version**. The frontier lane's containment survives only because it also
relocates `HOME` and the XDG roots — i.e. **by the stronger mechanism, not by the
controls its code appears to rely on.** *A line that names a protection which the
runtime does not implement is worse than no line: it is a guard that reads as
satisfied.*

### 8.3 Disposition — ⛔ recommended, ruling owed

**Do not force one abstraction across these lanes.** Occurrence 1 executes a
bounded read-only Work Unit against a materialized evidence sandbox with a local,
credential-free provider. Occurrences 3–4 execute against a live git worktree
with the operator's environment. Occurrence 2 executes an **external, metered,
network-reaching** provider with a staged credential. These are materially
different execution contracts; a shared helper would have to be parameterized to
the point where it guarantees nothing uniformly.

Proposed routing:
- **E3R1** repairs occurrence 1 only.
- **A separate act** repairs occurrence 2 **with** occurrence 5, and adjudicates §8.2.
- **A separate act** adjudicates occurrences 3–4, which additionally have **no
  sandbox at all** — the question there is prior to the flag.

The only element safe to share today is **F1**, a static scan asserting the dead
flag appears in no governed invocation. It is an assertion, not an abstraction.

---

## 9. GRANT STANDING — CONFIRMED

```
E3 one-shot grant  e1-4b1695c51f739397869f989e4741f45b   CONSUMED (ISSUED→CLAIMED→CONSUMED) · NOT REUSABLE
New grant minted under E3R1                              NONE
New grant consumed under E3R1                            NONE
Canonical Qwen E3 witness re-run                          NOT RUN
Ollama / model invocation under this act                  NONE
Production mutation                                       NONE
Repository mutation                                       documentation + one read-only probe instrument
JARVIS permission / agent boundary                        UNCHANGED
```

---

## 10. Standing after D1

```
§1 host probe                      ⛔ OWED — instrument committed, unspent
§2 v2.0.12 config evidence         ✅ COMPLETE (ENTAILED)
  └ OPENCODE_CONFIG_DIR isolates?  ✅ ANSWERED — NO (§2.4)
  └ Options.global:false exists?   ✅ ANSWERED — yes, and unreachable from CLI/env
§3 current provenance              ⚠️ PARTIAL — repository side WITNESSED, host side OWED
§4 proposed layout                 ⛔ PROPOSED, NOT TAKEN
§5 command shape                   ⛔ PROPOSED, NOT TAKEN
§6 falsifier design                ⛔ DESIGNED, NOT AUTHORED (F3/F6 need a host act)
§7 bounded file list               ✅ DECLARED · ⛔ UNMODIFIED
§8 defect-class reconciliation     ✅ COMPLETE · ⛔ SPLIT RECOMMENDED, RULING OWED
§9 grant standing                  ✅ CONFIRMED CLEAN
IMPLEMENTATION                     ⛔ NOT AUTHORIZED
E3 EXECUTION                       ⛔ STILL CLOSED
```

⭐ *The flag that broke carried plugin suppression. The mechanism that can
restore it is not a flag at all, and the variable most lanes here trust to
provide it — `OPENCODE_CONFIG_DIR` — provably does not.*
