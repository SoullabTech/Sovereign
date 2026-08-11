# JARVIS Desktop — Lineage Reconciliation Audit

**Date:** 2026-08-11 · **Mode:** read-only, governed (`s-b1c24d0e`, `--read-only`)
**Commissioned by:** founder, in refusal of a premature lineage ruling.
**This document authorizes nothing.** It establishes evidence for a ruling.

---

## 0. Headline — my earlier recommendation was wrong, and the founder's instinct to audit was correct

I recommended *"Adopt Unit 12, port tonight's picker (~400 lines), retire `jarvis-desktop/`."*

**The evidence does not support that as stated.** Neither lineage subsumes the other. Retiring
either one today amputates proven capability that exists **nowhere else on any branch**.

The specific error: the capability picker cannot "port cleanly," because the two modules it
depends on — `scripts/builder/deterministic.mjs` (the 15-capability registry) and
`scripts/builder/router.mjs` (the C0/C1/C3 cost router) — **do not exist in the Unit 12
lineage at all.** I had assumed a shared substrate. There isn't one.

---

## 1. Lineage topology (established, not assumed)

```
Unit 12  f7c543aab  ─→  D-13  35e6e11eb  ─→  O-1 Observer  5782beefe   ← lineage A tip
   desktop-app/jarvis/                              (17 files, 3,443 lines)
        │
        └─→ D-14 / D-14L / D-14P / D-14Q / D-14R / D-14S   (presence auth; do NOT touch desktop-app/jarvis)

Minimal Router PR #1024  5767d5d41  ─→  alpha-source ef3d57c4e  ─→  C0 explorer 1b692f672   ← lineage B tip
   jarvis-desktop/                                                        (5 files, 916 lines)
                                       └─→  C1 evidence containment e4cf9881a   ← ACTIVE THIRD STATE
```

**Neither lineage is on `clean-main-no-secrets`.** Trunk has no `desktop-app/jarvis/`, no
`jarvis-desktop/`, no `scripts/builder/jarvis-runtime.mjs`, and no `deterministic.mjs`.

⚠️ **The Unit 11 runtime is running right now** out of the `unit-20-native-gate-wiring` worktree.

---

## 2. What exists UNIQUELY in each lineage

### Unique to **A** — `desktop-app/jarvis/` @ `5782beefe`

**Desktop (3,443 lines / 17 files, vs B's 916 / 5):**
- Two Electron windows: main console **+ a separate O-1 Observer app** (`observer-main.js`,
  `observer-preload.js`, `observer-renderer/`, `lib/observer/{adapters,observe,reading,notification}.js` — 853 lines)
- 11 IPC channels: `bootstrap · health · submit · runs · run · cancel · annotations · copy`
  + push `jarvis:event · jarvis:menu · jarvis:stream-status`  (B has 3, no push channel)
- `lib/runtime-client.js` (248) — loopback HTTP + SSE, reconnect-and-re-fetch
- `lib/presentation.js` (533) — presentation contract incl. **D-13 governance-gate parity**
- `lib/packets.js` (195) — bounded READ-ONLY packet composer, SHA-anchored context selectors
- `lib/annotations.js` (67) — non-authoritative objective labels
- 367-line stylesheet

**Builder substrate (exists in A only — B has NONE of these):**
`jarvis-runtime.mjs` · `jarvis-runtime-pipeline.mjs` · `jarvis-runtime-store.mjs` ·
`jarvis-runtime-client.mjs` · `jarvis-context.mjs` · `jarvis-principal.mjs` (U14) ·
`jarvis-delegation.mjs` (U15) · `jarvis-authority-channel.mjs` (U16) · `jarvis-authority-gate.mjs` ·
`jarvis-governance-gate.mjs` (U19) · `jarvis-packet-guard.mjs` · `jarvis-local-worker.mjs` ·
`jarvis-observer.mjs` · `founder-presence-auth.mjs` + Swift PoCs (`presence-gate.swift`,
`presence-proof{,-v2}.swift`, `D14QPresenceProofApp.swift`) + three entitlements plists ·
**`orient.mjs`** · **`continue.mjs`**

**15 proof suites exist only in A**, including `orient-proof`, `continue-proof`,
`loop-governance-proof`, `jarvis-desktop-proof` (23 cases), `jarvis-runtime-proof`,
`jarvis-principal-proof`, `jarvis-delegation-proof`, `jarvis-authority-channel-proof`,
`jarvis-governance-gate-proof`, `jarvis-gate-resumption-proof`, `jarvis-alpha-proving-walk`,
`jarvis-packet-guard-proof`, `jarvis-context-proof`, `jarvis-founder-presence-auth-proof`,
`jarvis-observer-negative-controls`.

> ⛔ **`orient.mjs` and `continue.mjs` are the Horizon II instruments** — the `/orient → work →
> verify → record → /continue` **Closed Loop 1** milestone. They are absent from B. The branch
> tonight's work was built on **cannot close Closed Loop 1**.

### Unique to **B** — `jarvis-desktop/` @ `1b692f672`

- **`scripts/builder/deterministic.mjs`** — the 15-capability registry. **Absent from A.**
- **`scripts/builder/router.mjs`** — the C0/C1/C3 minimal cost router. **Absent from A.**
- Proofs absent from A: `router-alpha-proof`, `deterministic-registry-proof`,
  `session-liveness-authority-proof`, `desktop-c0-explorer-proof`
- Tonight's capability picker + structured-argument launcher + pre-submit validation
- **A separately-identified, separately-signed JARVIS application**:
  `appId: life.soullab.jarvis`, productName `JARVIS`, category `developer-tools`,
  `identity: "Apple Development: Kelly Nezat (N9DTF6434L)"`

> ⚠️ **A has no JARVIS app identity.** `desktop-app/package.json` declares
> `appId: com.soullab.maia`, productName **"MAIA - Sacred Mirror"**. A's JARVIS is launched as a
> second entry point *inside the MAIA desktop shell* (`electron jarvis/main.js`). Unit 12 §2
> claims surface separation, and that holds for windows/memory — **but not for packaging
> identity.** Shipping a signed JARVIS from A today would sign it as MAIA.
> This directly concerns the D-14 presence lineage, which required a distinct signed JARVIS
> identity (`com.soullab.jarvis.d14q…`, team `ZVK2X646Z2`). **B holds the only JARVIS-identity
> packaging that exists.**

---

## 3. Answers to the founder's nine questions

| # | Question | Evidence-based answer |
|---|---|---|
| 1 | Unique to `desktop-app/jarvis/` | §2A — runtime client, SSE, runs/evidence/cancel, packet composer, presentation+gate parity, O-1 Observer, **plus 15 builder modules and 15 proof suites incl. orient/continue** |
| 2 | Unique to `jarvis-desktop/` | §2B — **`deterministic.mjs` + `router.mjs`** (exist nowhere else), 4 proofs, tonight's picker, **the only signed JARVIS app identity** |
| 3 | Stronger MAIA/JARVIS **relational presence** architecture | **A, decisively** — principal identity (U14), verified delegation (U15), founder channel (U16), conversational resolution + resumption (U17), founder-presence-auth + Swift PoCs. ⚠️ **Caveat: the MAIA bridge is unimplemented in BOTH.** Unit 13 is design-only; U14–U17 each state *"The MAIA bridge remains unimplemented."* A's MAIA references are packet templates and status prose, not a bridge. **And D-14R is Classification D (FAILED)** — presence unprovable on this hardware (no Touch ID). |
| 4 | Stronger execution/runtime substrate | **A, decisively.** B has no runtime, no persistence, no runs — every submit vanishes on re-render. ⚠️ But see §4: a live lane is porting A's substrate *into* B. |
| 5 | Which carries Units 14–17 evidence and gates | **A, exclusively.** B has zero U14–U17 modules and zero of their proofs. |
| 6 | Does tonight's picker port cleanly? | **No — not as I claimed.** The UI ports cleanly (~570 lines, DOM-free logic already isolated in `capability-form.js`), but its dependencies `deterministic.mjs` (275) + `router.mjs` (77) **must move with it**, and A's Work surface is packet/run-shaped, not lane-shaped. Realistic port: **~920 lines + 2 proof suites + a new surface concept in A**, not a drop-in. |
| 7 | What is lost by retiring either | **Retire B →** lose the deterministic registry, the cost router, C0/C1/C3 lanes, 4 proofs, tonight's picker, **and the only signed JARVIS identity**. **Retire A →** lose the entire Unit 11 runtime, U14–U17, governance gate, packet guard, observer, presence-auth + Swift + entitlements, **`/orient` + `/continue`**, and 15 proof suites. |
| 8 | Hidden consumers / launch paths / entitlements / persistence / memory / voice / delegation | **A: 8 external consumers** — `package.json` (`jarvis:desktop`, `jarvis:observer`, 8 proof scripts), `jarvis-observer.mjs`, observer negative-controls, `founder-presence-auth.mjs`, D-14/D-14P docs, O-1 source map, Unit 12 doc. Persistence via `jarvis-runtime-store.mjs`; delegation via `jarvis-delegation.mjs`; entitlements via 3 plists. **B: 1 consumer** (its own proof) — nearly free-standing as code, **but holds the signing identity**. **Neither lineage has voice or member-memory ties.** |
| 9 | Can one absorb the other with zero capability regression? | **Yes — in one direction only. A can absorb B; B cannot absorb A** at proportionate cost. A→B would mean relocating 15 builder modules, 15 proof suites, a runtime, and the presence/entitlements substrate. B→A moves 2 modules, 2 proofs, one UI, and one packaging identity. |

---

## 4. ⚠️ Live hazard: a third state is being created right now

`feature/jarvis-desktop-c1-evidence-containment` (`e4cf9881a`, session **`s-0186379e`**, active
51m, lease live) is **built on tonight's custody commit** and is porting A's substrate *into* B:
`jarvis-runtime-pipeline.mjs`, `jarvis-runtime-store.mjs`, `jarvis-context.mjs`,
`jarvis-governance-gate.mjs`, `jarvis-packet-guard.mjs` — "adopted byte-exact from `e381a6321`" —
plus `jarvis-desktop/src/correctness.js`.

**Two lanes are now moving capability in opposite directions**: this audit reasons toward
consolidating *into A*, while that lane is consolidating *into B*. Whichever ruling is made,
**that lane must be told**, or the duplication doubles rather than resolves.

---

## 5. What the evidence supports, against the founder's own criterion

> *One canonical JARVIS Desktop. Preserve the richest proven architecture. Merge capabilities
> into it. Retire the duplicate only after parity is demonstrated.*

Applied literally:

- **Richest proven architecture = A** (`desktop-app/jarvis/` @ `5782beefe`) — 3.8× the desktop
  code, 15 exclusive builder modules, 15 exclusive proof suites, and the only path to Closed Loop 1.
- **Merge into it =** move `deterministic.mjs`, `router.mjs`, their 2 proofs, the capability
  picker, and **the `life.soullab.jarvis` signed app identity** from B into A.
- **Retire only after parity =** parity here has a concrete, checkable definition:
  1. A can list and invoke all 15 deterministic capabilities with structured arguments;
  2. `router-alpha-proof` + `deterministic-registry-proof` + `desktop-c0-explorer-proof` pass in A;
  3. A packages under `life.soullab.jarvis` with the Apple Development identity, not `com.soullab.maia`;
  4. `jarvis-desktop-proof` (23) and the observer negative controls still pass;
  5. `/orient` + `/continue` remain intact.

Only then does `jarvis-desktop/` become a record rather than a product.

**Note this is the same destination as my original recommendation, reached for partly different
reasons and at roughly double the estimated cost — and with one item I had entirely missed (the
app signing identity), which would have been silently lost.**

---

## 6. What this audit does NOT establish

- **It does not rule.** The lineage decision is the founder's.
- It does not establish that A's runtime is *healthy* — only that it exists and is running.
- It does not resolve Unit 21 (gate admissibility), Unit 18 (Alpha not established), or D-14R
  (presence falsified). Those remain blocking regardless of lineage.
- It did not execute either desktop. Inventory is from git object inspection, not runtime behavior.
- It does not evaluate the active C1 lane's work on its merits — only that it exists and conflicts
  in direction.
