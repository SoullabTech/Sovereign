# JARVIS Desktop — C1 `REPO_ROOT` defect: fix proposal · DRAFT

**Status: PROPOSAL, document only. Confers no authority.** It changes no code, builds nothing, installs nothing, runs nothing, and lifts nothing. Owner project `jarvis-desktop` carries a dated **RUNTIME_HOLD** (R11N Electron/Next compatibility, macOS security acceptance; owner issue #1974, snapshot 2026-10-24, live issue not re-read). **Any fix needs (1) the founder's ruling on which source line is canonical and (2) the owner's ruling on that hold.** Sits under `JARVIS-S1_BRIEF_DRAFT_2026-10-30.md` (see its "REPO_ROOT trace, corrected").

## 1 · The defect (evidence class stated)

- **Witnessed (git, byte-identical to the installed app):** `jarvis-desktop/src/main.js` @ `65fbf9c72f4`, the **C1 execution lane** (`execution_lane === 'C1'`), uses `REPO_ROOT` at lines **1220, 1221, 1232**; nothing in the file declares or imports it. Its `catch` sets `response.result = { error: e.message }` — the exact `{"error":"REPO_ROOT is not defined"}` shape the owner recorded on 29 Oct.
- **Not reproduced by this session.** The strongest reading is code-read converging with the owner's recorded runtime error; ⛔ no run was made.
- **Why tests did not catch it (code-read):** `test/c1-evidence-containment.test.mjs` imports the canonical materializer/verifier **directly** and declares its **own** `const REPO_ROOT = path.resolve(DESKTOP, '..')`. Its header says it proves module reuse and a delegate tripwire — it never executes `main.js`'s C1 block. So the test passes while the app's lane throws. ⚠️ Whether any of the five other tests that mention `execution_lane` runs that block is **unchecked**.

## 2 · The decisive finding for the ruling

**Canonical already contains the repair.** On canonical's `main.js`, the enclosing function begins `const root = currentRoot(); if (!root) return { status: 'error', reason: 'repo root not found — cannot route' };`, and the C1 lane uses `root` (lines 1297, 1309) instead of `REPO_ROOT`. Introduced by canonical commit **`e55e32d14`** (2026-10-01, "recover founder workspace on current JARVIS"), which is **not** in the installed app's history. `currentRoot()` returns the qualified, explicitly-bound root or `null`; the null case **fails closed** (consistent with canonical commits "remove silent repository authority fallback" and "block authority on implicit repo fallback").

So the defect belongs to the **feature line only** (installed app, f1/unified, f2); on canonical it is already gone. ⚠️ Not established: that canonical's app *launches and completes a local Work call* on this machine — only that its `main.js` cannot throw this error.

## 3 · Two paths

**Path A — canonical line wins (recommended).** No source change for this bug. The work is **producing and verifying an installed build from canonical**: (a) a dev-mode launch of canonical's app against the configured root and one real local Work call, as the owner's gate step 4 asks; (b) only then a packaged build and replacement of `/Applications/JARVIS.app` — a signing/identity act that is the **founder's, never inferred**. The feature line's Resonance F2 work (23 commits, Secure Enclave signing) is **not** carried by this path; whether and how to port it is a **separate lane**. *Cost:* canonical's runtime has 17 desktop commits of hardening the installed app never ran, so launch behaviour on this machine is **unknown until witnessed**; the RUNTIME_HOLD is exactly about that uncertainty.

**Path B — feature line wins.** Port the same pattern into the feature line: in the function containing the C1 lane, obtain `root = currentRoot()`, **fail closed with a named reason when it is null**, and replace the three `REPO_ROOT` uses with `root`. Smallest diff: reuse the hunks from `e55e32d14`'s change to this block rather than hand-writing. *Cost:* forks the app further from canonical (586 commits behind) and keeps a second line alive that the continuity registry has no record of.

*Why A:* B fixes one symptom on a line that still diverges from canonical, so the next canonical change reopens the same question; A removes the divergence for this bug. ⛔ This is a recommendation on a founder-owned question, not a decision.

> ⚠️ **CORRECTION TO PATH A, 2026-10-30 (same day, after the dev-launch result in the Brief):** Path A as written ("produce an installed build from canonical") **would install an inert app**. Witnessed: under Electron 28.3.3, `require.main === module` is **false** for a standalone launch, so canonical's `STANDALONE` gate (`main.js:36`) skips the whole startup path — no window, no lock, no ready handler. **Do not package or install `jarvis-desktop` from canonical on the strength of this proposal.** The ruling "canonical wins" stands as a *source-of-record* ruling; what changes is the next act: canonical's JARVIS is meant to be composed by a Soullab host (candidate: `maia-desktop/`), and whether *that* path starts and runs a local Work call is **unknown and unrun**. A separate defect (the `STANDALONE` derivation) now sits beside the `REPO_ROOT` one; its repair is **not proposed here** and would have to reckon with a falsifier test that pins the current source text.

## 4 · Regression test (required under either path; its own acceptance instrument)

Per the repo's discipline, the test must be able to **fail a wrong fix**. It must execute the real lane, not re-import its modules.

| # | Must hold | Wrong fix it must kill |
|---|---|---|
| T1 | C1 lane run through `main.js`'s own code with a qualified root → no `ReferenceError`; module paths built from **that** root | restoring `const REPO_ROOT = process.cwd()` |
| T2 | no qualified root → **named refusal**, no throw, no module import attempted | a `try/catch` that swallows and returns empty evidence |
| T3 | root = the **configured** root, proven with a root different from `cwd` and from any default | a hard-coded default repo path |
| T4 | static guard: no free identifier `REPO_ROOT` in `main.js` (`no-undef` or equivalent) | any variant that reintroduces an undeclared name — the **class** of defect, not just this instance |

⚠️ **Open design question, not decided here:** `main.js` requires `electron` at load, so exercising the C1 block may need (a) a stub-`electron` harness, or (b) extracting the lane into an Electron-free module — the latter is a larger change than the fix and would need its own ruling. Which the existing tests (e.g. `wire-local-native.test.mjs`) already do is **unchecked**.

## 5 · After the fix (not part of this proposal)

Owner gate steps 4–5 — a real local Qwen answer in the existing app, then follow-up and **Cancel** tested separately against the R11N request-ID contract — require a **running** build and the founder's witness. They are not things a document can discharge.

## 6 · Founder rulings needed, in order

1. **Which line is canonical for JARVIS Desktop** — ✅ **TAKEN 2026-10-30 (founder chat reply "Canonical wins"): Path A. Canonical is the source line for JARVIS Desktop.** Effects: the installed app (`65fbf9c72f4`) and the feature line (f1/unified `fc9bd3578`, f2 `e1af0b642`) are **not** the source of record; no source fix for the `REPO_ROOT` defect is proposed (canonical already contains the repair, `e55e32d14`); the Resonance F2 work is **parked, not deleted**, and any port is a **separate lane that needs its own founder act**. ⛔ This ruling does **not** authorize a launch, build, packaging, install, or any change to `/Applications/JARVIS.app` or its settings, and does **not** lift the RUNTIME_HOLD.
2. **Owner ruling on the RUNTIME_HOLD** as it applies to a read-only/dev-mode launch and to any build.
3. **Whether a dev-mode launch of canonical's app is authorized** as the next evidence act (it runs software; it is not a read).
4. **Whether Resonance F2 is ported** — separate lane, not blocked by this one.

## Not authorized by this draft

Any code, test, config or ledger change · building, signing, installing or launching any app · touching the installed app or its settings · opening a lane · lifting the RUNTIME_HOLD · treating the recommendation as a ruling.
