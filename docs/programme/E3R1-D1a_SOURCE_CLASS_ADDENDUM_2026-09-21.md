# E3R1-D1a — SOURCE-CLASS ADDENDUM TO D1

**Lane:** `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1`
**Date:** 2026-09-21
**Amends:** `E3R1-D1_OPENCODE_V2_CONFIGURATION_BOUNDARY_AND_FALSIFIER_DESIGN_2026-09-21.md` §2, §4, §6
**Status:** ⛔ NO IMPLEMENTATION · ⛔ NO GRANT · ⛔ NO HOST ACT · ⛔ NO BOUNDARY MODIFIED

## 0. Why this exists

D1 §2.2 listed `wellknown` in the precedence chain and never said what it was,
and D1 characterized four of the six source classes while treating the run's
**instruction** surface as out of frame. This addendum closes those gaps against
the same pinned source (`v2.0.12` = `2670273ff`, v1 comparison `v1.4.9` = `803d9eb7a`)
**before** the probe is spent and the §4/§5 rulings are taken.

⭐ Nothing in D1 is withdrawn. Three findings are added and one D1 claim is
upgraded from asserted to witnessed.

---

## A1 — ⚠️ `wellknown` IS AN HTTP-REACHING CONFIGURATION SOURCE, AND `global: false` DOES NOT DISABLE IT

D1 §2.4 quoted `Options.global`'s own comment: *"false skips the global config
dir, `~/.claude`, and `~/.agents`; **wellknown**, file, and content entries still
load."* D1 did not follow that clause. It should have.

**ENTAILED** (`packages/core/src/wellknown.ts`):

- `inspect()` (`:60-63`) issues `GET <origin>/.well-known/opencode`.
- `resolveEntry()` (`:83-92`) then issues a second `GET` against
  `manifest.remote_config.url`, with headers that may carry a credential value.
- The resulting documents enter the config entry list **first**
  (`config.ts:230`, lowest precedence — but loaded).

**The gate is credentials, and the gate is closed by the same mechanism §4 already
proposes.** `load()` (`:114-118`) reads its origin list from `kv.get(sourcesKey)`
— the KV store backed by the database at `databasePath(global.data)`
(`server-process.ts:97`). `global.data` derives from the XDG data root, which
derives from `$HOME`. A relocated `HOME` + `XDG_DATA_HOME` yields a **fresh,
empty database → no origins → no request is made**, and
`loadWellknownEntry()` (`:146-149`) returns `[]` for any entry lacking a stored
credential regardless.

⛔ **Not a v2 regression, and must not be reported as one.** `.well-known/opencode`
exists at `v1.4.9` (`packages/opencode/src/config/config.ts`). `--pure` never
covered it — it suppressed *plugins*, not config sources. This is a surface that
was always outside P-PURE and is only now visible because the boundary is being
drawn deliberately.

⭐ **But it is load-bearing for THIS lane specifically**, because
`scripts/builder/opencode-provider.mjs:39` declares `qwen-local` as
`external_network: false`. Under today's inherited environment that declaration
is a claim about the *model provider*, not about the *process*: config
resolution can reach the network before cognition begins. The §4 boundary closes
it — ⛔ and the closure must be witnessed (A5 below), not assumed.

---

## A2 — INSTRUCTION DISCOVERY IS A FIFTH SURFACE, AND IT IS PROMPT CONTENT, NOT CONFIGURATION

**ENTAILED** (`packages/core/src/config/plugin/instruction.ts`,
`packages/core/src/instruction-discovery.ts`):

`AGENTS.md` files are discovered and rendered into the run. Two scopes:

| Scope | Source | Closed by |
|---|---|---|
| global | `join(global.config, "AGENTS.md")` (`:37`) | **`OPENCODE_CONFIG_DIR`** |
| project | `fs.up({ targets: ["AGENTS.md"], start, stop })` (`:70`) | bounded walk (below) |

⚠️ **The global scope defaults ON and is never disabled by the server.**
`instruction-discovery.ts:100` computes `global: options?.global !== false`, and
`routes.ts:129` passes only `{ project: options.config?.project }`. So
`<global.config>/AGENTS.md` is **always** loaded. ⭐ This is the one surface that
`OPENCODE_CONFIG_DIR` closes *on its own* — the inverse of D1 §2.4's finding
about `~/.claude` / `~/.agents`, and the reason `OPENCODE_CONFIG_DIR` earns its
place in §4 rather than being redundant with the `HOME` relocation.

⭐ **The project walk here is bounded, unlike the config walk.**
`stop = FSUtil.contains(home, start) ? home : root` (`:36`), where `root` is
`location.project.directory`. For a sandbox under `/var/folders/...` — not under
home — the walk stops at the sandbox's own project root. **An `AGENTS.md` planted
above the sandbox is therefore not reached**, whereas an `opencode.json` planted
there **is** (A3).

⛔ Two different walks with two different bounds. D1's residual applies to the
configuration walk only, and this addendum is the reason that distinction is now
written down rather than discovered during an implementation.

---

## A3 — D1's RESIDUAL IS UPGRADED FROM ASSERTED TO WITNESSED

D1 §4 stated that the `direct`/`project` configuration walk ascends to the
filesystem root. That is now read at source rather than inferred:

`packages/util/src/fs-util.ts:162-177` — `up()` loops, and terminates only on
`options.stop === current` or `dirname(current) === current`.
`ConfigDiscovery.discover` calls `fs.up({ targets: ["."], start: location.directory })`
(`discovery.ts:34`) — **with no `stop`**. The walk therefore terminates at `/`.

The residual stands exactly as D1 stated it, and **F6 remains the only thing that
would detect it**.

---

## A4 — ⚠️ `jarvis-readonly` HAS NO `"*"` RULE; THE v2 FALLBACK EFFECT IS `ask`, NOT `deny`

**WITNESSED** (`.opencode/agents/jarvis-readonly.md`): the permission block names
fourteen actions and carries **no `"*"` default**. `jarvis-frontier`
(`frontier-worker.js:78`) *does* carry `"*": deny`.

**ENTAILED** (`packages/core/src/permission.ts:87-95`): `evaluate()` returns the
**last matching rule**, and when nothing matches falls back to
`{ action, resource: "*", effect: "ask" }`. The fallback is `ask`, **not** `deny`.
(A missing agent is a different case and is `deny` — `:19`.)

**It nonetheless fails closed under `opencode run`**, and the reason is worth
naming precisely: `packages/cli/src/run/noninteractive.ts:135-144` installs a
handler that **auto-rejects** every permission request
(`"permission requested: … auto-rejecting"`, setting `permissionRejected = true`).
⭐ So any v2 action not named in the agent file — an MCP-provided tool, a new
builtin — is rejected **by the runner's non-interactive posture, not by the agent
definition**.

⛔ **Do not "harden" `jarvis-readonly` under this act.** R-A forbids touching the
permission/agent boundary to obtain configuration isolation, the file is shared
with other callers, and adding `"*": deny` would change behaviour for every one
of them. Recorded as a **defence-in-depth observation**, routed out, ⛔ not repaired.

⭐ **One consequence that strengthens the falsifier design**: `permissionRejected`
steers control flow (`:208`, `:476`, `:494`) but there is no path in which it, by
itself, produces a non-zero exit. **A refused `edit`/`bash` can coexist with a
successful run.** D1 §6 F5 must therefore assert the rejection *explicitly* and
never infer containment from an exit code — which is exactly what F8 already
forbids, now with a mechanism behind it rather than a principle.

---

## A5 — AMENDMENTS TO THE D1 §6 FALSIFIER SET

D1 §6 stands. Two additions and one sharpening:

| ID | Proposition | Method | Kills |
|---|---|---|---|
| **F9** *(new)* | A canonical run issues **no outbound HTTP during configuration resolution** | observe the child's network behaviour across a run whose provider is local-only; assert no `.well-known/opencode` request | a boundary that relocates `HOME` but leaves an inherited KV/database carrying wellknown origins (A1) |
| **F10** *(new)* | No ambient `AGENTS.md` reaches the run | sentinel text in `<global.config>/AGENTS.md`, and in an ancestor of the sandbox; assert neither appears in the assembled prompt | a boundary that sets `HOME` but not `OPENCODE_CONFIG_DIR` (A2) |
| **F5** *(sharpened)* | unchanged proposition | must assert the **refusal event**, not the exit code | the "it exited 0 with a rejected tool call" reading (A4) |

⚠️ **F9 and F10 mutate ambient host state** (a sentinel in a global config
directory; a file in a sandbox ancestor). Like F3 and F6 they are **⛔ not
authorized here** and carry their own cleanup obligation. They are named so the
implementation act requests them explicitly.

---

## A6 — Standing

```
D1 §2 source classes            ✅ NOW COMPLETE — six characterized, not four
  └ wellknown                   ⚠️ HTTP-reaching · global:false does NOT disable · closed by HOME/XDG · pre-dates v2
  └ instruction (AGENTS.md)     ⚠️ global scope always ON · closed by OPENCODE_CONFIG_DIR · project walk BOUNDED
D1 §4 residual                  ✅ UPGRADED — asserted → WITNESSED at fs-util.ts:162-177
jarvis-readonly "*" gap         ⚠️ NAMED · fails closed via the runner · ⛔ ROUTED OUT, NOT REPAIRED
D1 §6                           ✅ AMENDED — F9, F10 added; F5 sharpened
Anything withdrawn from D1      NONE
Host probe                      ⛔ STILL OWED
Implementation                  ⛔ STILL NOT AUTHORIZED
E3 execution                    ⛔ STILL CLOSED
```

⭐ *Two of the six configuration sources are closed by relocating `HOME`, one by
relocating `OPENCODE_CONFIG_DIR`, one is bounded by its own walk, one is the
sandbox itself — and one reaches the network. No single variable closes them,
which is why the boundary had to be enumerated before it was built.*
