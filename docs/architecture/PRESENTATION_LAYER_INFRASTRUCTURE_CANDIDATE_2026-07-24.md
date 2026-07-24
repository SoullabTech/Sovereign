# Presentation-Layer Infrastructure — Candidate Architecture

**Status: CANDIDATE, pending Issue 1 evidence. Not authorized. Not a prescribed remedy for #737 or Issue 1.**

Date: 2026-07-24
Author: Claude Code (session continuing the mobile-keyboard audit thread)
Origin: A pattern noticed while diagnosing #731/#737, then deliberately separated out at Kelly's direction so it does not steer today's measurements toward confirming itself.

---

## 0. What this document is not

This is **not** the diagnosis for why the transcript still fails to settle after #731. That diagnosis is still open — the debug instrumentation (#734/#737) exists precisely to establish it from evidence, and this document must not be read as pre-empting that conclusion. It is entirely possible Issue 1 turns out to be a single, local, already-identified mechanism (e.g. a timing race in the `[messages]`/`visualViewport.resize` effects) with nothing to do with shared infrastructure at all.

This is also **not** the fix for #735 (Arrival occluding composer controls). #735 has its own concrete, narrow root cause (a disjunctive activation gate plus an occluding full-viewport overlay) and can be fixed on its own terms without this proposal existing.

What this document *is*: an observation, made while working both of those threads, that the codebase has **no shared mechanism** for two structurally related concerns — "how much of the screen does the keyboard currently occupy" and "what stacking layer does this surface belong to" — and instead has multiple independent, partially-inconsistent implementations of each. That fragmentation is real and demonstrable today, independent of what Issue 1's root cause turns out to be. Whether it's *worth fixing*, and on what timeline, is a separate decision from diagnosing today's specific bugs.

---

## 1. Thesis

**Keyboard geometry and presentation-layer ownership are currently distributed across components that should consume shared infrastructure.**

This thesis has two distinct claims inside it. They are related but independent, and neither should be used to smuggle authorization for the other:

- **Claim A — Shared keyboard inset.** One measured viewport value (from a single `visualViewport` listener), many consumers. A centralized inset could be warranted even if the present stacking architecture remains exactly as it is.
- **Claim B — Named layer ownership.** One stacking vocabulary, with portals only where ownership genuinely requires escaping a stacking context. A layer registry could be warranted even if Issue 1 turns out not to be caused by competing keyboard calculations at all.

Evidence for A does not automatically justify B, and vice versa. Kelly may rule on them separately.

---

## 2. Current duplicated or absent mechanisms, named by component

### 2a. Keyboard/viewport tracking (Claim A territory)

| Component | Mechanism | Listens to | Computes |
|---|---|---|---|
| `VoiceInteractionBar.tsx` — `useKeyboardBottomInset()` | Own hook, `visualViewport` | `resize` + `scroll` | A single `bottom` inset number: `innerHeight - (offsetTop + height)`, clamped to ≥0 |
| `MaiaArrivalField.tsx` — `useVisualViewportBox()` | Own hook, `visualViewport` | `resize` + `scroll` | A `{top, height}` box, used to size a full-screen field |
| `OracleConversation.tsx` transcript (#731) | Inline effect, `visualViewport` | `resize` only | **No inset value at all** — re-runs a scroll-to-bottom correction, gated by a `wasNearBottomRef` guard. Fundamentally different in kind from the other two: a correction, not a position |
| `OracleConversation.tsx` composer (`ModernTextInput` wrapper) | None | — | Static `bottom: calc(2.75rem + safe-area)` — no keyboard awareness at all |
| `OracleConversation.tsx` transcript container's own clearances | None | — | Static Tailwind `top-44…` / `bottom: 260px` (or `220px`) — computed once against whatever viewport exists at render, never re-measured |
| `app/journey/page.tsx` | Own inline logic, `visualViewport` | `resize` only | Viewport **width** (not keyboard-related — a fourth, unrelated use of the same API) |

Three independent `visualViewport` consumers with three different calculations (`bottom` inset / `{top,height}` box / scroll-correction-with-no-stored-value), one static offset that ignores the keyboard entirely, and one static clearance pair that also ignores it. No shared value. No shared hook. Each was authored at a different point in this project's history (the code comments on two of them — #713/#704 for Arrival, #722/Defect A for VoiceInteractionBar — read like independent rediscoveries of the same underlying iOS behavior: `position: fixed` tracks the *layout* viewport, which iOS does not shrink for the keyboard, so anything anchored near the bottom without `visualViewport` awareness silently mispositions).

### 2b. Stacking / layer ownership (Claim B territory)

A registry already exists — `app/styles/z-index-hierarchy.css` — explicitly written "to establish a consistent stacking order across the entire application" after prior Safari z-index conflicts:

```css
--z-background: 0;
--z-content: 10;
--z-sticky: 20;
--z-dropdown: 30;
--z-input-area: 40;
--z-buttons: 45;
--z-header-nav: 60;
--z-header-buttons: 61;
--z-modal-backdrop: 70;
--z-modal-content: 80;
--z-toast: 90;
--z-emergency: 100;
--z-debug: 9999;
```

`.z-below-nav` (`var(--z-header-nav) - 1` = 59) is the one utility from this file in live use — it's what the composer and the desktop voice pill both use. Everything else near the bottom/top of the screen uses **raw literal Tailwind arbitrary values that do not reference the registry at all**:

| Surface | Literal value used | Nearest registry rung | Registered? |
|---|---|---|---|
| `MaiaCenterField.tsx` content wrapper | `z-10` | `--z-content: 10` | Coincidence, not reference |
| `MaiaArrivalField.tsx` | `z-[90]` | `--z-toast: 90` | Coincidence, not reference |
| `MaiaLeftRail.tsx` rail | `z-[80]` | `--z-modal-content: 80` | Coincidence, not reference |
| `MaiaLeftRail.tsx` tooltips | `z-[90]` | `--z-toast: 90` | Coincidence, not reference |
| `MaiaShell.tsx` top bar | `z-[85]` | *(none — between modal-content and toast)* | **Not in the vocabulary** |
| `OracleConversation.tsx` capture panel | `z-[85]` | *(same gap)* | **Not in the vocabulary** |
| `MaiaHouseSheet.tsx` backdrop / sheet | `z-[95]` / `z-[96]` | *(none — between toast and emergency)* | **Not in the vocabulary** |
| `OracleConversation.tsx` transcript scrim | `z-20` | `--z-sticky: 20` | Coincidence, not reference |
| `OracleConversation.tsx` transcript box | `z-30` | `--z-dropdown: 30` | Coincidence, not reference |
| #737 debug strip | `zIndex: 99999` (inline) | `--z-debug: 9999` | **10× the registered debug value, and not a reference** |

The registry is aspirational, not load-bearing: most values happen to match it by convention (everyone independently reached for "90 means on top of everything"), a few values (85, 95, 96) already sit outside its vocabulary entirely, and none of it is actually wired to the custom properties, so changing the registry would change nothing.

---

## 3. Concrete failures each architecture would prevent

**Claim A (shared inset) would have prevented:**
- Defect A / #722 — `VoiceInteractionBar` floating above the keyboard with a gap, because it had no keyboard awareness until its own hook was written from scratch.
- The #703/#704 Arrival crop — same underlying cause, independently rediscovered and independently fixed in a sibling component.
- Whatever Issue 1 turns out to be, *if* (not yet established) it involves the transcript's static clearances or the composer's static offset failing to track a keyboard state that a shared mechanism would have already been computing correctly for two other surfaces.

**Claim B (named layers) would have prevented:**
- The stacking-context trap just found in #737 — a `z-index: 99999` value rendered invisible underneath Arrival's `z-90`, because it was nested inside an ancestor (`.flex-1.relative.z-10`) that caps all descendant stacking regardless of the literal z-index value.
- `MaiaArrivalField`'s own documented workaround for the *identical* trap (its code comment: "Portal to `<body>`: OracleConversation renders inside MaiaCenterField's z-10 stacking context, which would trap this field beneath the top bar (z-70)") — meaning this exact class of bug has already been hit and worked around once, ad hoc, without becoming a shared pattern.
- #735 (Arrival occluding composer controls) is adjacent to this territory — not necessarily *caused* by the same mechanism, but a layer registry with defined z-order and defined occlusion rules is the structural tool that would make "should Arrival ever occlude the composer" an explicit, checkable design decision instead of an emergent one.

---

## 4. Evidence sources

- **#731** — shipped a stale-scroll fix using a *correction* pattern (no stored inset value), distinct from the *positioning* pattern used by #722 and #713/#704. Evidence that this codebase already has more than one shape of "respond to the keyboard," not just duplicated instances of one shape.
- **#735** — Arrival (`z-[90]`, a portal to `document.body`) occludes the composer (`z-below-nav` = 59) and the conversation text input. Evidence of an unreconciled ownership boundary between two independently-authored full-viewport-adjacent surfaces.
- **#737** — the debug strip, correctly positioned by every measurable CSS property, was invisible on screen because of the exact stacking-context trap described above. Evidence that the trap is not hypothetical — it just silently broke a piece of code written *today*, by someone who had just finished reading `MaiaArrivalField`'s own comment about the same trap and still walked into it.
- **Current instrumentation work** (§ this session) — exists specifically because there was no shared, inspectable signal for "what is the keyboard doing right now," so a temporary one had to be built by hand, on-screen, per investigation. That absence is itself evidence for Claim A, independent of what it eventually reveals about Issue 1.

None of this proves Claim A or B is the *necessary* remedy for any specific open issue. It proves the fragmentation exists and has already produced at least three independent bugs (#703/#704, #722, #737) across two different categories (positioning, stacking) in components built at different times without shared infrastructure.

---

## 5. Proposed ownership boundaries and consumers

**If authorized**, not before:

### Claim A — `useKeyboardInset()` (or a `KeyboardInsetProvider` context)
- **Owns**: one `visualViewport` `resize`+`scroll` listener, at or near the app root (likely `MaiaShell.tsx` or `OracleConversation.tsx`'s top level).
- **Computes**: the same `{offsetTop, height}` primitives every current consumer already derives from `visualViewport` — exposed raw, not pre-shaped into any one consumer's preferred format (a `bottom` inset and a `{top,height}` box are both derivable from the same two numbers; forcing one shape on all three consumers would just relocate the duplication).
- **Consumers** (opt-in, not forced in one migration): `VoiceInteractionBar`, `MaiaArrivalField`, the transcript's #731 correction effect, the composer, the transcript's own clearances.
- **Explicitly does not own**: *whether* a given surface reacts to the keyboard, or how — that stays a per-component decision. It only removes the need for each one to independently listen and independently compute.

### Claim B — a real (wired) z-layer registry
- **Owns**: the actual set of named layers and their order — extending `z-index-hierarchy.css`'s existing intent to cover the gaps already found (85, 95, 96 need names; `--z-toast: 90` needs to stop being three different things — Arrival, tooltips, *and* toasts — under one name).
- **Consumers**: every `position: fixed`/`absolute` surface currently using a raw arbitrary z-index, migrated to reference the named layer instead of a literal number.
- **Portals**: used *only* where a surface's ownership genuinely requires escaping an ancestor's stacking context (as `MaiaArrivalField` already does, correctly, for exactly this reason) — not applied reflexively everywhere, and not treated as a substitute for naming the layer correctly in the first place.
- **Explicitly does not own**: layout, sizing, or keyboard geometry — a well-named layer can still be badly positioned; these are orthogonal concerns.

---

## 6. Migration sequence (if authorized)

Not a single cutover. Proposed order, each step independently shippable and independently revertible:

1. **Instrument only** (already underway via #734/#737) — no architectural change, just visibility. Complete before anything else, since it's what will tell us whether Issue 1 even lives in this territory.
2. **Claim A, one new consumer at a time**, starting with whichever surface Issue 1's evidence actually implicates — *not* a wholesale migration of all five current mechanisms in one PR. Each migrated consumer keeps its own tests; the shared hook is proven correct against the surface that already has the most scrutiny (`VoiceInteractionBar`, given #722's device-confirmed fix) before any other surface adopts it.
3. **Claim B, additive first** — name the gaps (85/95/96) in the existing registry without moving anything yet. This alone makes the current state legible without changing behavior.
4. **Claim B, migrate one surface at a time** from raw literal to named layer, verified by the same kind of stacking-context inspection used to diagnose #737 (ancestor chain walk, `elementsFromPoint`) before and after each move.
5. Both claims stay independently revertible at every step — a consumer can be moved back to its own local mechanism without unwinding the shared infrastructure, and a surface can be moved back to a raw z-index without unwinding the registry.

---

## 7. Behavioral acceptance conditions

Before any consumer is considered successfully migrated:

- **Claim A**: the migrated surface's on-device behavior (keyboard open / close / rotate, per the same four-observation pattern already used for #722's verification) is unchanged or improved — never regressed — verified on physical Safari, not simulator or source evidence alone.
- **Claim B**: `document.elementsFromPoint()` at the surface's own center, under every other currently-open overlay (Arrival open, House sheet open, capture panel open), resolves to the intended surface or an intended occluder — never an *unintended* one. This is the same check that caught #737.
- Both: no new console errors, no new SSR/hydration warnings, existing structural test suites (`__tests__/voicebar-keyboard-dock.test.ts`, `__tests__/transcript-scroll-resettle.test.ts`, etc.) remain green.

---

## 8. Explicit non-goals

- This does **not** propose changing Arrival's activation gate (#736) — that's a separate, already-diagnosed logic bug.
- This does **not** propose resolving #735's occlusion by raising or lowering any specific z-index as a point fix — the whole argument here is that point fixes to individual z-index values are exactly the pattern that produced the current inconsistency.
- This does **not** propose a full design-system rewrite, a new component library, or touching desktop layout, which is not evidenced to have any of these problems.
- This does **not** claim the current mechanisms are *wrong* for the surfaces they were written for — `useKeyboardBottomInset` and `useVisualViewportBox` are each correct, tested, device-verified solutions to their own component's problem. The claim is only that solving the same underlying measurement three separate times is unnecessary duplication, not that any one of the three implementations is itself broken.
- This does **not** authorize itself. It is a candidate for Kelly to rule on, not a plan already in motion.

---

## 9. Risks

- **iOS viewport semantics are still evolving and inconsistently implemented across WebKit versions.** A shared hook centralizes today's understanding of `visualViewport` behavior — it also centralizes today's *blind spots*. A bug in the shared hook would now affect every consumer at once, where today's fragmentation at least limits blast radius to one component per bug. Mitigation: the migration sequence in §6 proves the shared hook against the most-scrutinized existing consumer before widening.
- **Desktop is unmeasured.** All evidence gathered so far is iOS/WebKit-specific (`visualViewport` keyboard behavior, WebKit stacking-context quirks). Nothing here has been checked against desktop Chrome/Firefox/Safari, where none of these problems may exist at all. A shared mechanism must not silently change desktop behavior that currently works.
- **Nested scroll containers** — the transcript already has its own internal `overflow-y-auto` scroll container distinct from the page-level geometry `visualViewport` describes. A shared inset value describes "how much of the *screen* is keyboard"; it does not by itself resolve stale-scroll-position problems inside a nested scrollable region (that's exactly what #731's correction-pattern effect does, and why it's a different *kind* of mechanism from the other two — see §2a). Claim A does not subsume #731's problem class; it only removes duplicate *measurement*, not duplicate *response logic*.
- **SSR/hydration.** Every current `visualViewport` consumer already guards with `typeof window !== 'undefined'`. A shared hook/context must preserve this exactly — a context provider that reads `window` during a server render would break more surfaces at once than today's per-component guards ever could.
- **Accidental changes to Arrival's ownership.** `MaiaArrivalField` already portals to `document.body` for a documented, correct reason. Any Claim B migration must preserve that portal's *purpose* (escaping the z-10 trap) even if its *mechanism* changes (e.g. moving to a named "arrival" layer instead of an ad hoc z-90) — a careless migration could accidentally re-nest Arrival inside a stacking context it was deliberately extracted from, silently reintroducing a bug that's currently fixed.

---

## 10. Disposition

**Candidate only.** Do not begin implementation. Awaiting:
1. Issue 1's actual diagnosis from the #734/#737 instrumentation — which may confirm, partially confirm, or have nothing to do with this fragmentation.
2. Kelly's ruling on whether Claim A, Claim B, both, or neither are worth the migration cost described in §6, independent of Issue 1's outcome.
