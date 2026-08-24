# JEM-00 — Canonical repository/runtime binding: evidence

**Unit:** JEM-00, Gate 0 of the JARVIS Agent Experience Memory program
(`docs/programs/JARVIS_AGENT_EXPERIENCE_MEMORY.md` §III).
**Date:** 2026-08-24 · **Verdict:** Gate 0 **PASSED** on the substrate proven below.
**Proof:** `scripts/builder/__tests__/jem-00-binding-proof.mjs` — **43 passed · 0 failed**, wired into `npm run jarvis:proof`.

---

## 1. What Gate 0 actually asked, and what was already true

Gate 0 was written around an observed failure — a C1 attempt answering
`repo root not found — cannot route`. The census below establishes that this
specific symptom had **already been diagnosed and fixed one plane over**, and
that the surviving defect was a different, larger one on the plane the directive
cares about.

**Already fixed (PRESERVE, no action):** JOP-04, 2026-08-17. JARVIS **Desktop**
dev mode resolved by upward marker walk only, so a checkout that had lost the
canonical markers fell to `NONE` while a valid saved workspace sat unread in
`config.json`. The fix gave dev mode the same env → config → default ladder
packaged mode always had, with the walk keeping precedence. Order lives in
`jarvis-desktop/src/repo-resolution.js`, proven by
`jarvis-desktop/test/jop-04-dev-resolution.test.mjs` (6/6, re-run and green).

**The surviving defect (this unit):** the JARVIS **runtime** — the plane that
validates packets, claims worktrees and spawns workers — bound itself with one
unverified line at the top of `scripts/builder/jarvis-runtime-pipeline.mjs`:

```js
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
```

Three things were missing from it, and Gate 0 names all three:

| Gate 0 requirement | Pre-JEM-00 runtime behaviour |
|---|---|
| identity **not** inferred from working directory / stale config | inferred from where a source file happens to sit; **no marker verification at all** |
| binding established from runtime behaviour **and configuration** | `JARVIS_REPO_ROOT` and the repository named in Preferences meant *nothing* to the runtime |
| record evidence | no provenance; nothing could report which repository the runtime believed it held |

The consequence was not theoretical. The Desktop and the runtime could bind to
two different checkouts with nothing on any surface saying so — and the runtime
is the plane that **writes**. Silence about identity is affordable in a viewer;
it is not affordable in a process that claims git worktrees.

## 2. The delta implemented (and the delta deliberately *not* implemented)

Per §IV — *never implement a second version of an already-working primitive* —
no new resolver was written. The Desktop's resolver was made shared.

| File | Change | Class |
|---|---|---|
| `jarvis-desktop/src/repo-markers.js` | **new** — the single definition of "canonical Sovereign checkout": the four markers, `isValidRepoRoot`, `findRepoRootByWalk`. Electron-free. | CONSOLIDATE |
| `jarvis-desktop/src/main.js` | its local marker list and walk deleted; now requires the shared module. Behaviour identical. | RECONCILE |
| `jarvis-desktop/src/repo-config.js` | adds `defaultAppSupportDir()` so a non-Electron process can read the same `config.json` Preferences writes. | COMPLETE |
| `scripts/builder/jarvis-binding.mjs` | **new** — the runtime's canonical binding. Reuses the Desktop's marker module, config module, resolution **order** module and provenance vocabulary. Contributes only the runtime's own ladder and its refusal. | BUILD (delta only) |
| `scripts/builder/jarvis-runtime-pipeline.mjs` | `REPO_ROOT` now comes from `resolveBinding()`; a named `REPO_BINDING_UNRESOLVED` refusal gates `CONTEXT_ROUTING` **before** any worktree claim; divergence recorded on the run. | REPAIR |
| `package.json` | `jarvis:binding` added; JEM-00 proof appended to `jarvis:proof`. | — |

**One deliberate difference from the Desktop.** The Desktop's ladder ends at a
hard-coded candidate reported `implicit-default`. That is right for a viewer: a
founder deserves a populated screen saying *nobody chose this* over an empty one
saying nothing. The runtime's equivalent of showing a screen is **refusing** —
so its ladder ends at `unresolved` and routing fails closed with
`REPO_BINDING_UNRESOLVED`. A process about to claim a worktree must not bind
itself to a repository nobody named.

**No previously-working binding can have changed.** The walk still wins, and
this runtime's source physically lives inside the checkout it belongs to, so
every correctly-resolving setup produces the byte-identical root it did before
(proof §2). Only the two previously-silent cases behave differently: a checkout
that has lost the markers now falls *through* to the explicit ladder, and a
runtime that cannot resolve now refuses by name.

## 3. Evidence

Live binding on the proving substrate — `node scripts/builder/jarvis-binding.mjs --json`:

```json
{
  "root": "/home/user/Sovereign",
  "resolution": "dev-walk",
  "explicit": true,
  "markers_verified": true,
  "markers": ["scripts/builder/session.mjs", "scripts/builder/deterministic.mjs",
              "scripts/builder/router.mjs", "package.json"],
  "launched_from": "/home/user/Sovereign/scripts/builder",
  "config_path": "/root/.config/JARVIS/config.json",
  "config_root": null, "config_problem": null, "env_root": null,
  "divergence": null, "ok": true, "failure_class": null,
  "substrate": { "git_connected": true, "head": "be5b3b80241eb988e74f16cb8851888f135d45df",
                 "branch": "claude/jarvis-agent-memory-build-988kqw", "dirty": true }
}
```

`scripts/builder/__tests__/jem-00-binding-proof.mjs` — **43 passed · 0 failed**.
Every verdict reads an exit code or a structured field; nothing greps prose. The
restart assertions spawn genuinely separate `node` processes, because a second
call inside one process proves memory, not durability.

| § | Gate 0 item | Proven |
|---|---|---|
| 1 | resolve the canonical repository | root resolved, **markers verified** (not assumed), provenance rung reported, binding is explicit, substrate identity read as its own fact |
| 2 | binding from configuration, not inference | walk still outranks env (no working binding changed); with the walk removed, `JARVIS_REPO_ROOT` is honoured and reported as `explicit-env` |
| 3 | not inferred from stale config / labels | a directory without the markers is **refused**, not bound; refusal is named `REPO_BINDING_UNRESOLVED`; the problem names the directory the founder actually set |
| 4 | work-packet routing against the repository | the routing gate refuses by name, and sits **before** the worktree claim; no unverified `REPO_ROOT` inference survives in the pipeline |
| 5 | **resolve after restart** | process A records a binding and exits; a genuinely new process B reads back root, provenance and the writing pid |
| 6 | result persistence | a changed root is flagged `rebound_since_last_run` with the previous root carried forward; the same root twice is not a rebind |
| 7 | existing runtime state | Desktop/runtime divergence is reported as a fact (not an error, not a silence); the config path actually read is named, so a mapping drift is legible |
| 8 | no second implementation | Desktop carries no marker list of its own; both planes require the same markers, order, config and provenance modules |

**Read-only execution** (Gate 0 item 4) was **not re-proven here** — it is already
covered by `checkAuthority()` in the pipeline (`READ_ONLY_LANES`, write-authority
refusal) and by the existing suites. JEM-00 changed nothing in that path.

## 4. Regression state

- `jarvis-desktop/test/**` — **117 passed · 0 failed** across all 8 files, including JOP-04 (6/6).
- `npm run jarvis:proof` — all suites green **except** `delegate-workspace-convergence-proof.mjs`.

**That one failure is pre-existing and environmental, not a regression.** It was
reproduced on the base commit (`be5b3b8`) with these changes stashed, failing
identically with `spawnSync git ENOENT`: the proof spawns `ain-delegate.sh` with
a scrubbed environment, and this remote container does not put `git` on that
spawned `PATH`. It must be re-run on a founder workstation before the suite is
called green there.

## 5. Standing

Gate 0 acceptance requires "a bounded C1 task can resolve the canonical
repository, read it, execute, produce evidence, and persist a result — across a
restart." Proof §1 and §4–§6 demonstrate exactly that sequence in separate
processes, on this substrate.

Stated precisely, and not further: **the binding mechanism is proven, on this
container, by 43 mechanical assertions.** It has not yet been exercised by a
full live C1 delegation run end-to-end on a founder workstation — that requires
the delegate path whose proof is environmentally blocked here (§4). Re-running
`npm run jarvis:proof` on minisforum or the Mac Studio is the outstanding
confirmation.

**JEM-00 is complete. Per §XIX the unit STOPS here.** JEM-01 (existing memory
and knowledge census) is the next command and is not begun.
