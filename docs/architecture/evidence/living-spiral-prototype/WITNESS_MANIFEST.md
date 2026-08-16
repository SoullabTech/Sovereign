# Living Spiral — Synthetic Prototype Witness Manifest

**Date:** 2026-08-16
**Classification:** ⭐ **ARCHITECTURE EVIDENCE — not application implementation.**
**Custody:** preservation custody assigned to this lane by founder ruling 2026-08-16.

```text
status:                 SYNTHETIC PROTOTYPE — PRESERVED EVIDENCE
semantic contract:      ACCEPTED  (semantics unchanged)
  as captured here:     sha256 ebfebb5a… · 624 lines · commit 21db7685c  [PRE-ERRATUM]
  current file:         amended by erratum E1 (2026-08-16) — provenance claim only, no
                        semantic change. Current hash in the forward-port reconciliation
                        record. ⛔ Frames were rendered against the PRE-ERRATUM text and are
                        NOT re-rendered; that citation is correct for this evidence.
prototype acceptance:   HELD — founder pixel witness pending
implementation authority: NONE
```

> ⛔ **Preservation only. No prototype acceptance is implied by this record.**
> ⛔ Nothing here is production, telemetry, a store, a schema, an emitter, or runtime wiring.
> ⛔ These frames are **evidence, not production assets.** No runtime code may consume them.

---

## Why the exact frames are preserved, not regenerated

The nine PNGs are **the visual evidence currently awaiting founder witness**. Reproducing them
later from the HTML would produce a **successor render, not custody of the existing one** —
browser version, fonts, antialiasing, viewport behaviour, or capture timing can move pixels even
when the page source is byte-identical.

⭐ This is a case where **binary custody is more truthful than "deterministically reproducible"
reconstruction.**

---

## Preserved identities

```text
prototype source
  living-spiral-prototype.html   sha256 2acf9367862734c8fca89b8b2449b842e23a3c918058d19868ce7fb1b0350e32
                                 35636 bytes · 598 lines

capture harness
  capture-witness.js             sha256 af14134568344fe6a71f9c8189d1c70f124dde4c226570b29a88bb5573cada5f

rendered frames (real Chrome / Puppeteer, viewport 1300x1000 @2x, dark theme)
  01-baseline.png                        sha256 d9a4409fac6ce1a38c3350ef3814fbc0eb08da20379bbb3dbd82fca158b5c6ce
  02-F1-unobserved.png                   sha256 37c8db62cc2a7b67223545e6a7b77f52a62c2d38a5d3fab0a7fb2d49b38740bf
  03-F2-composable.png                   sha256 740744aa500778c7d0240e1e1a9e4a4beb7611f076cd886746a75f66d38b97bf
  04-F3-contradiction.png                sha256 eb08b03c3f4053328fe46956edecc3301d8303c6a3334c322fcee2e8c8324815
  05-F10-provisional-composition.png     sha256 a60144b997db1c2c9254b5dbd61fe2fda395cefe7dc849018c3cc5eb8441ebb3
  06-F11-no-edge.png                     sha256 3b2200bc163d48a73271d63df747602e636f2ad7ead65ce76311435b8cde22e1
  07-F14-authority.png                   sha256 660465fb1542e9c057b019ffda00dc3a264c5edf72c608f3dbf4e2c8d4dcd341
  08-alias-elemental.png                 sha256 2024ed4ca315820f93b79ced88c573a0dc4e8571796b71cacb1ee143758ada42
  09-alias-swapped.png                   sha256 00422d4324af623b4d45c4170016891d1982bb18ea7bff0023fdffe6c2df5fbf
```

---

## Render class

**real Chrome / Puppeteer** — `Google Chrome for Testing` via the repo's `puppeteer` dependency,
headless, viewport 1300×1000 at `deviceScaleFactor: 2`, `data-theme="dark"` forced, one frame per
fixture with the relevant assertion selected.

⚠️ **`capture-witness.js` is preserved unchanged and deliberately NOT generalized.** It is kept as
`.js`, not `.mjs`: it uses CommonJS `require()`, and an `.mjs` extension would make node treat it
as ESM so it would no longer run. The original scratchpad filename was `shoot.js`; only the name
differs, and the bytes are identical.

---

## What each frame witnesses

| Frame | Fixture | What it establishes |
|---|---|---|
| 01 | baseline | `attention 0`, no amber mark, A3 as ordinary `discrimination` — F6 holds |
| 02 | F1 | `unobserved` as an aperture hole; no phenomenon mark occupies the channel |
| 03 | F2 | established+stale · provisional+stale · provisional+current, composable on one plate |
| 04 | F3 | contradiction pair, both retained, neither preferred |
| 05 | F10 | provisional composition — dashed edge |
| 06 | F11 | co-occurrence — **no edge at all** |
| 07 | F14 | `authority_blocked` as typed attention, non-fault, may be resumable |
| 08 | alias | Fire / Water / Earth / Air / Aether |
| 09 | alias | A / B / C / D / E — same plate, labels only (swap test) |

---

## Standing

```text
SEMANTIC CONTRACT          ACCEPTED
PROTOTYPE SOURCE           PRESERVED
EXACT 9-FRAME WITNESS      PRESERVED
PROTOTYPE ACCEPTANCE       HELD — founder visual review pending
IMPLEMENTATION             NOT AUTHORIZED
```

⚠️ **`FOUNDER PIXEL WITNESS — PENDING` is a delivery-aperture condition, not a prototype finding.**
The artifact's visual status is `UNWITNESSED BY FOUNDER`, which is **not** the same class as `FAIL`.
Governing distinction, from the contract this prototype projects:

> **Failure of the observer to obtain evidence is not evidence of failure in the observed.**

When a delivery surface becomes available, review resumes from these nine frames. ⛔ No source
change, reconstruction, or re-render should be required.
