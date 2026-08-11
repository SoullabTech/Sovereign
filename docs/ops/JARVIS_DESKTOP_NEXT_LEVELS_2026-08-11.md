# JARVIS Desktop — what "fully functioning" actually requires

**Read-only research pass, 2026-08-11.** Grounded in 45 recorded documents (Units 7–21,
D-13/D-14 series, Builder OS Five-Horizon Roadmap). This proposes; it authorizes nothing.

---

## 0. The finding that reorders everything: there are TWO JARVIS Desktops

They are not versions of each other. They are separate lineages that never met.

| | **Unit 12 lineage** | **Minimal-router console** |
|---|---|---|
| Path | `desktop-app/jarvis/` | `jarvis-desktop/` |
| Launch | `npm run jarvis:desktop` | `cd jarvis-desktop && npm start` |
| Talks to | **Unit 11 persistent runtime**, loopback HTTP + SSE | imports `session.mjs` / `router.mjs` / `deterministic.mjs` directly |
| Surfaces | Command · Runs · Run detail + Evidence · System state | Home · Work · System |
| Has | runs, dispositions, evidence tables per citation, verification, cancel, state history, audit paths, governance-gate parity (D-13), principal identity (U14), delegation (U15), founder channel (U16), resolution + resumption (U17) | C0/C1/C3 lane submit, capability picker (today), truthful status |
| Proof | `jarvis-desktop-proof.mjs` (20 cases, +3 at D-13) | `desktop-c0-explorer-proof.mjs` (44) |
| Lineage | U12 → D-13 → D-14 → D-14L/P/Q/R/S | branched off the Minimal Router PR #1024 |

**Neither is on `clean-main-no-secrets`.** Trunk has no `desktop-app/jarvis/`, and no
`scripts/builder/jarvis-runtime.mjs`. The Unit 11 runtime is nonetheless **running right now**
out of the `ain-jarvis-unit-20-native-gate-wiring` worktree.

The console the founder walked today is the *shallower* of the two. Almost every "next level"
listed below **already exists in the other lineage.** Building them here would be the third
implementation of runs and evidence.

> ⛔ Therefore the first act is not a feature. It is a reconciliation ruling.

---

## 1. What the research already says the answer is

From `BUILDER_OS_ROADMAP_HORIZONS_2026-08-09.md`, governing all Builder OS work:

> **The permanent outcome test** — *Does this work increase our ability to build, maintain,
> improve, or safely extend member-facing capability? If not, it needs a very strong reason
> to exist.*
>
> **The governing correction from the audits** — *"JARVIS doesn't primarily need more stuff.
> It needs closure around the sophisticated stuff it already has."*

Named failure mode to avoid: *"AIN is perfectly governed, but nobody is shipping MAIA
improvements."*

Current milestone is **not** "JARVIS v1." It is **Closed Loop 1**:
`/orient → work → verify → record → /continue`, working reliably across fresh sessions.
Desktop's legitimate job is to be the **operator surface on that loop** — not a second IDE.

---

## 2. Three rulings are already blocking, and none of them are code

These were prepared by prior units and are waiting on the founder. Shipping features past
them adds surface to a chain that cannot close.

### R1 — Unit 21: gate admissibility by objective authority
**Status:** BLOCKER RECORDED · decision instrument prepared · NOT implemented.
On a fully-granted READ-ONLY objective, the worker reads *"do not modify anything"* as
*absence of write authority* and emits `GOVERNANCE_GATE: WRITE_AUTHORITY_REQUIRED`.
**The happy path falsely pauses.** Unit 20's wiring is proven and committed but **not
shippable** until this is ruled.
⛔ Two prompt-level narrowings already failed; the record explicitly forbids a third.
*Prompt text is the wrong layer for an admissibility invariant.*

### R2 — Unit 18: Alpha is not established
**Classification C — GOVERNANCE CHAIN INCOMPLETE.** Unit 19 closed one of the two seams.
Until the walk re-runs to A, "JARVIS Alpha" is a claim we do not hold.

### R3 — D-14R: founder physical presence is FALSIFIED on this hardware
**Classification D (FAILED).** The Mac Studio has **no Touch ID hardware**. The invariant
*"JARVIS cannot produce a founder-authorization signature unless the founder is freshly and
physically present"* could not be established on the machine JARVIS runs on.

**Consequence — and it is a good one:** stop trying to make Desktop execute C3. The §8 stance
in `main.js` is not timidity awaiting a better auth story; it is currently the *only* honest
position. Desktop should get better at **handing off** to a founder-driven session, not at
impersonating one.

---

## 3. The next levels, in dependency order

### Level 0 — Reconcile the two desktops *(ruling, then mechanical)*
Decide which lineage is the product. Three coherent options:

- **(a) Adopt Unit 12 as the product**, port today's capability picker into
  `desktop-app/jarvis/`, retire `jarvis-desktop/` to a record. *Most capability retained.*
- **(b) Keep the minimal console as the shell**, drop the Unit 11 runtime client into it,
  and port runs/evidence/gate parity across. *Most work; keeps the simpler surface.*
- **(c) Two surfaces on purpose** — a console for governance/observation, a client for runs.
  Only defensible if the split is written down, because today it is accidental.

**Recommendation: (a).** The Unit 12 lineage carries U14–U17 and D-13 gate parity. Today's
picker is ~400 lines and ports cleanly. Nothing else preserves that much proven work.

### Level 1 — Make governance *actionable* (highest value, no new authority class)
Desktop already **reads** Builder OS truthfully — active claims, stale leases, collisions,
queue depth, "waiting for founder." It cannot **act**. Yet `session.mjs` already exposes
`recover` / `reconcile` / `close` with lease semantics, and *"waiting for founder"* is by
definition the founder's own decision.
This is the single thing a founder console is *for*, and it invents no authority: it is the
founder performing, at a console, governance acts the CLI already performs.
⚠️ `recover --force` is destructive — needs explicit confirmation and a reason string, and
should record who acted from where.

### Level 2 — Runs and continuity (free under option (a))
Today every C0/C1 submit vanishes on re-render. Unit 11/12 already provide durable runs,
SSE notification, run detail, per-citation evidence, cancel. Under (a) this is adoption,
not construction.

### Level 3 — Close the System view's two UNKNOWNs
`Memory / Postgres` and `Production` both read UNKNOWN — *"not probed by Desktop Alpha."*
Best expressed as **new deterministic capabilities in the registry**, not Desktop code —
then today's picker surfaces them automatically, and the terminal gets them too.
This is the cleanest compounding return on the work just shipped.

### Level 4 — Registry metadata (`description`, `category`)
The picker shows neither, because the registry declares neither. Adding them is a
**registry** change (`scripts/builder/deterministic.mjs`); the Desktop already renders
whatever the registry declares and will pick them up with no UI edit.

### Level 5 — C3 as governed *handoff*, not execution
Compose the packet, bind the SHA, hand to a founder-driven Claude Code session — using the
existing U15 verified delegation / U16 founder channel / U17 resolution-resumption
machinery. Respects §8 and D-14R rather than fighting them.

### Level 6 — Only then: the native worker path
Unblocked by R1. Not before.

---

## 4. What NOT to build

- **C3 auto-invocation from Desktop.** Falsified by D-14R on this hardware.
- **A third runs/evidence implementation.** See §0.
- **A fourth "current state" document.** Explicitly guarded against in Horizon II.
- **Another prompt-level fix for the gate taxonomy.** Explicitly forbidden by Unit 21.
- **An IDE.** Unit 12 §4: *"no dashboard sprawl, no settings, no IDE."*

---

## 5. The honest one-line summary

> Desktop does not need more features next. It needs **one ruling on which Desktop it is**,
> and then the capability that already exists behind it — runs, evidence, governance action —
> connected to the surface the founder actually opens.
