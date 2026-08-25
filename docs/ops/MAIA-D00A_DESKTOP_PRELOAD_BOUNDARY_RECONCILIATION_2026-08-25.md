# MAIA-D00A — Desktop Preload Boundary Reconciliation

**Date:** 2026-08-25 · **Authority:** founder ruling R3, 2026-08-25
**Canonical start:** `0c4638a` (`origin/clean-main-no-secrets`) · **Base of unit:** `9fcc3c3` (MAIA-D00)
**Scope:** the renderer↔main authority boundary of `jarvis-desktop/`. ⛔ No packaging. ⛔ No MAIA-D01 work.

---

## 0 · The question this unit had to answer

R3 forbade the bookkeeping answer — *"change nine to ten and move on."* The channel had to be
argued for against five questions:

> **required · authorized · minimal · main-process validated · compatible with the secure renderer doctrine**

---

## 1 · `jarvis:reveal-workspace` — ⭐ RATIFIED

| Question | Finding | Witness |
|---|---|---|
| **Required?** | Yes. JOP-04's ruling was *"Home states the workspace before Work has to refuse it."* Confirming *which* checkout resolved is the gesture that ruling needs. Not redundant with the existing Preferences item, which reveals the **config file** (`main.js:393`), a different referent. | `renderer.js:155`, `main.js:393` |
| **Authorized?** | **Not previously.** JOP-04 shipped it without re-reviewing the guard. This unit is that review. | MAIA-D00 §4.2 |
| **Minimal?** | Yes, on four independent counts — see below. | `preload.js`, `main.js:444-449` |
| **Main-validated?** | Yes. It reveals only `currentRoot()` = `RESOLVED.root`, and **every** writer of that value is marker-validated in main: ENV / CONFIG / DEFAULT via `isValidRepoRoot` (`main.js:87,111,122`), dev WALK via the marker walk, and `bindRepoRoot` via `isValidRepoRoot` (`main.js:317`). The `NONE` path yields `root: null`. | `main.js:84-126, 316-328` |
| **Doctrine-compatible?** | Yes. Nothing crosses inward; validation and persistence stay in main; no Node, shell, or fs authority is exposed. | `preload.js` |

**The four minimality properties — now asserted, no longer only argued in a comment:**

1. The preload forwards **no argument** (`revealWorkspace: () => ipcRenderer.invoke(...)`).
2. The handler **declares no parameter** (`async () => {}`) — a second, independent layer.
3. An unbound root **short-circuits to `{revealed:false}` before `shell` is touched at all**.
4. It uses `shell.showItemInFolder`, which *selects* an item in the file manager. `main.js` is now
   proven to call **neither `shell.openPath` nor `shell.openExternal`** — so no open-or-execute
   authority is introduced. It returns no file contents.

⭐ **Verdict: the channel is genuinely minimal. Ratified, and the guard raised to TEN.**

---

## 2 · ⛔ The deeper finding — the list was duplicated, which is why it stayed red

The guard has now gone red twice in this programme:

| | Widening | Missed for |
|---|---|---|
| JOP-00 §4.1 | Alpha Floor added `mechanism-status` + `run-work-unit` (7→9) | a generation |
| MAIA-D00 §4.2 | JOP-04 added `reveal-workspace` (9→10) | a generation |

Both times the guard worked. Both times nothing happened — because the list was **hard-coded in
two proof files**, and neither copy was the obvious place to go and argue.

**Repair:** the allow-list now lives in exactly one place —
`scripts/builder/__tests__/desktop-preload-allowlist.mjs` — carrying, per channel, the **purpose**
and the **ruling that authorized it**. Both proofs assert against it. Widening the renderer's
authority now means editing *that* file, which is a review, not a test-expectation edit.

The list remains **EXACT**, deliberately not relaxed to a subset check: a subset check is precisely
what would let the eleventh channel through silently.

### The ratified surface — ten invoke channels, one push channel

```
jarvis:capabilities       read: capability registry (proven to contain no runCapability)
jarvis:choose-repo        native picker in MAIN; renderer cannot SET a path
jarvis:clear-repo         unbind + re-resolve from scratch
jarvis:governance-action  runs the governor's own CLI; invents no verb
jarvis:mechanism-status   read: is the bound repo carrying the mechanism
jarvis:repo-config        read: current binding
jarvis:reveal-workspace   ⭐ RATIFIED HERE — no argument, no parameter, reveal-only
jarvis:run-work-unit      packet only; the lane is pinned in main
jarvis:status             read: runtime status
jarvis:submit-task        one bounded task shape; C3 routed_not_executed
--- push ---
jarvis:repo-changed       rebind broadcast; outward only
```

---

## 3 · ⚠️ The other two red assertions were STALE INSTRUMENTS, not boundary defects

MAIA-D00 named these and did not diagnose them. Diagnosed here — **neither is a widening.**

### 3.1 `governance path runs GOV-composed argv` — the token was stale, the property never broke

The assertion matched the literal string `execFileSync('node', built.argv`. **JOP-04b deliberately
replaced the bare command name with a resolved node path** — *"name the builder's node, not
Electron's"* — so the code now reads `execFileSync(govNode.path, built.argv, …)`. The property the
assertion exists to protect (argv is GOV-composed and passed through unmodified) **never stopped
holding**; only the token it grepped for went obsolete.

⭐ Repaired to test the property — **and tightened while open.** The old form would have accepted the
bare, PATH-dependent `'node'`. A new companion assertion forbids **any** string-literal executable
in that handler. Proven by NC5 below: the exact code the old assertion accepted now **fails**.

### 3.2 `every resolver return declares conflictingConfigRoot :: 6 literals` — a false positive

The selector took every `{… root: … resolution: …}` literal. That swept in the **`jarvis:status`
payload** (`main.js:487`) — a *consumer* that merely reads `RESOLVED.resolution` and has no business
declaring a resolver field. **All five real resolver returns already declared it.** The guard was
reporting a boundary defect that did not exist.

This is the third appearance in this programme of the same failure mode — *absence from a lexical
search is evidence about the search* (JOP-00 §1, PHASE-0 §3.2, and now here).

⭐ Repaired by **vocabulary**, not by narrowing: a resolver return *writes* a `PROV.RESOLUTION.*`
constant; a consumer *reads* `RESOLVED.resolution`. Any genuinely new resolver return must use the
same constant vocabulary, so it is still selected and still must declare the field (NC7).
A **new** assertion then partitions the set, so no *third* kind of literal can appear unclassified
(NC8) — a gap the old form left open.

---

## 4 · TEST PROOF

| Suite | Before | After |
|---|---|---|
| `jarvis-alpha-floor-proof.mjs` | 87 pass / **3 fail** | **97 pass / 0 fail** |
| `desktop-c0-explorer-proof.mjs` | 51 pass / **1 fail** | **52 pass / 0 fail** |
| `jarvis-desktop/test/*` (8 suites) | 117 / 0 | **117 / 0** |
| `node --check jarvis-desktop/src/preload.js` | — | OK |

**Net +11 assertions.** Nothing was deleted, relaxed, or skipped.

### 4.1 ⭐ Negative controls — every repaired assertion still bites

Each control mutated the real source, ran the suite, and was reverted.

| # | Injected defect | Caught by |
|---|---|---|
| NC1 | 11th channel added to preload | `preload exposes exactly the 10 ratified channels` |
| NC2 | `revealWorkspace(p)` forwards a renderer path | `revealWorkspace forwards no argument across the bridge` |
| NC3 | reveal handler accepts `(_e, p)` | `the reveal handler declares no parameter…` |
| NC4 | `showItemInFolder` → `openPath` | `main.js reveals only — it never opens or executes a path` (+ short-circuit assertion) |
| NC5 | governance executable regressed to bare `'node'` | `the governance executable is a resolved node path…` ⭐ **the old assertion PASSED this; the new one fails it** |
| NC6 | argv hand-built instead of GOV-composed | `governance path runs GOV-composed argv…` |
| NC7 | new resolver return omitting `conflictingConfigRoot` | `every resolver return declares conflictingConfigRoot` |
| NC8 | third, unclassified `{root, resolution}` literal | `every {root, resolution} literal is either a resolver return or a RESOLVED consumer` |

⭐ **NC5 is the proof that §3.1 was a tightening and not a weakening.** `git status` clean after each.

---

## 5 · Founder rulings discharged in this unit

| Ruling | Disposition |
|---|---|
| **R2 — `desktop-app/`** | `desktop-app/STATUS.md` — LEGACY / NON-CANONICAL, no feature/release/packaging authority, **not deleted** |
| **R2 — `electron/`** | `electron/STATUS.md` — LabTools utility window only; **packaging hazard recorded** |
| **R3 — preload boundary** | this unit |
| Packaging hazard | **recorded, not corrected.** Per ruling, no packaging change folded into D00A |

**R1 — `maia-desktop/`** is *accepted and not executed here.* An empty tree is not a git object and
would be a hollow artifact; creating it is MAIA-D01's first act, under D01's own acceptance witness.

---

## 6 · SECURITY / SOVEREIGNTY IMPACT

**Net: the renderer's authority is unchanged in extent and better constrained in proof.**

- No channel added. No channel removed. `reveal-workspace` was already shipping — it is now
  *reviewed* and *ratified* rather than merely present.
- Four new assertions bound `reveal-workspace` at the boundary; one new assertion forbids
  `openPath` / `openExternal` anywhere in `main.js` — authority the app never had, now barred.
- One assertion strictly tightened (§3.1): a bare PATH-dependent executable in the governance
  handler is now a failure.
- Sovereignty invariant check: this increases the *founder's* legibility of the boundary and adds no
  capability. Growth-obligation check — the capability increase is **zero**; the provenance,
  restraint and transparency increase is the allow-list, its per-channel rulings, and eight
  negative controls.

---

## 7 · KNOWN LIMITATIONS

- **No DEVICE evidence.** Remote Linux container: no macOS, no Electron binary, no
  `/Applications/JARVIS.app`. Everything here is SOURCE + TEST. The ratified boundary has **not**
  been witnessed on a running or installed artifact, and the JOP-01/JOP-03 distribution obligation
  is untouched by this unit.
- The `c1-evidence-containment` suite reports `pass 1` under `node --test` where JOP-00 recorded 17
  — a top-level-test counting difference, not a regression. 0 failures either way.
- The allow-list is enforced against `preload.js` **lexically**. It proves what the source declares,
  not what a tampered runtime does. Consistent with every other guard in this suite; named, not hidden.
