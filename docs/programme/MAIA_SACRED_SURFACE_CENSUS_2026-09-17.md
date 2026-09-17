# MAIA Sacred Surface — drift-guard census

**Date:** 2026-09-17
**Authority:** MAIA Sacred Surface Drift Guard — Scope Ruling (founder)
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ CENSUS COMPLETE (READ-ONLY) · ⛔ GUARD NOT IMPLEMENTED · RETURNED FOR ADJUDICATION

> *Preserve the center; evolve the field around it.*

Repository truth only. No source changed, no test written, no guard implemented.
Where the boundary could not be settled from evidence it is named as a question
rather than guessed.

---

## 0. Executive finding

**Three things decide the guard, and two of them were not obvious.**

**F1 — `/maia` has TWO render paths, and only one is canonical.**
`app/maia/page.tsx:803` branches on `featureFlags.spatialMaiaShell`. That flag
defaults **`true`** (`lib/utils/feature-flags.ts:56`) *and* carries a migration
that force-enables it for anyone who previously had it off (`:85-89`). So the
sacred core is the **line-804 branch**; the ~1,200-line composition beginning at
`:906` — its own 30-particle atmospheric field, `SwipeNavigation`,
`bg-gradient-to-br from-stone-950` — is **dead in practice**.
⚠️ A guard that hashed `page.tsx` would pin 1,200 lines of unreachable legacy and
miss the distinction entirely.

**F2 — the codebase already tells us the guard's METHOD, because this exact
failure happened before.** `MaiaShell.tsx:308-327` carries **"GEOMETRY IS
LOAD-BEARING"** with measured coordinates for the House doorway — desktop
`x=20 y=5 114×44`, mobile `x=12 y=5 114×44` — and records that *a previous pass
placed this at `left-3 top-14` and asserted in a comment that it matched Arrival.
It did not: measured, it sat at (12,56) 124×44 — a 51px jump and a 10px width
change every time Arrival gave way to conversation.* Its instruction is explicit:
**"verify by measuring the bounding box in both states, not by reading this
comment."** That is the Layer B principle, already ratified in situ.

**F3 — the Extension Field rule already has a documented violation and remedy.**
`MaiaShell.tsx:279-296` carries the founder ruling of 2026-07-22 retiring the
left rail: *"The House previously failed this ruling by being added ALONGSIDE the
rail rather than replacing it: eleven destinations stayed permanently exposed so
the member met the product's internal map before they met the place."* With a
standing warning: *"⚠️ Do not reintroduce a permanent multi-icon rail here, and
do not add a chevron rail beside the House."*
⭐ **This is precisely "extensions colonizing the center", already survived once.**
Layer C therefore has a real historical failure to test against rather than a
hypothetical one.

**And one conflict the ruling must settle before a guard is written — §5.**

---

## 1. Exact route / layout chain

| Step | File | Notes |
|---|---|---|
| Root layout | `app/layout.tsx` | `Inter` (next/font/google); `<body className={inter.className} bg-[#1A1513]}>`; 8 providers incl. `SubscriptionProvider`, `AethericConsciousnessProvider`, `SystemHealthProvider`, `FeatureTooltipProvider`, `MaiaPresence`, `AppErrorBoundary`, `MobileRouteGuard` |
| Segment layout | **none** | `app/maia/layout.tsx` does not exist (VERIFIED) |
| Page | `app/maia/page.tsx` | `'use client'`, 2,166 lines, ~25 feature imports |
| Branch | `page.tsx:803` | `if (featureFlags.spatialMaiaShell)` → **canonical** |
| Canonical tree | `page.tsx:804-862` | `ErrorBoundary` › `VoiceStateProvider` › `MaiaShell` › `MaiaCenterField` › `OracleConversation`; then `MaiaModalManager`, `AccountDropdown` |
| Legacy tree | `page.tsx:906-2159` | `ErrorBoundary` › `SwipeNavigation` › own particle field › `OracleConversation` (`:1528`). **Unreachable under the default flag.** |

## 2. Components comprising the sacred core

| Component | Lines | Role in the gestalt |
|---|---|---|
| `components/maia/MaiaShell.tsx` | 406 | Outer frame: `div.min-h-screen.bg-[#1a1a2e]` › `MaiaTopBar` + `main.mt-12` (children) + the House doorway. Owns rail retirement, right-panel behaviour, `openMaiaHouse` |
| `components/maia/MaiaCenterField.tsx` | 165 | **The atmosphere.** Gradient base, 30 voice-reactive particles, state-driven glow. Takes `children`; `page.tsx` retains ownership of what renders inside |
| `components/OracleConversation.tsx` | 11,210 | The conversation surface itself — messages, composer, voice, sanctuary |
| `components/maia/MaiaArrivalField.tsx` | — | Swaps with conversation; carries its own doorway at the same coordinates |
| `components/maia/MaiaTopBar.tsx` | — | Minimal top bar |
| `components/liquid/RhythmHoloflower.tsx` | — | The primary visual geometry, reached via the above |

⚠️ **A second conditional lives INSIDE the core**: `MaiaCenterField:~60` reads
`isFeatureEnabled('arrivalField')` and toggles an `arrival-field` class that
scopes typography. The core is not a single fixed composition; it is
flag-conditioned in two places.

## 3. Load-bearing styles, tokens and primitives

**Colour / material**
- body `bg-[#1A1513]`; shell `bg-[#1a1a2e]`
- centre field `bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950`
- particles `bg-[#D4B896]/20`, `w-1 h-1`, **exactly 30**, seeded deterministically for hydration
- glow `from-[#D4B896]/35` (voice-state dependent)
- spice accents — `tailwind.config` `maia-spice-glow` `0 0 18px rgba(245,158,11,0.25)`, `spice-sand #D4A574`, `maia-panel` shadows

**Typography** — `Inter` from the root layout; `arrival-field` class scopes the Arrival typography variant.

**Geometry — explicitly declared load-bearing**
- House doorway: `h-[54px]`, `px-4 md:px-6`, button `-ml-1 h-11 px-2`, no pill
- measured: desktop `(20,5) 114×44` · mobile `(12,5) 114×44`
- must render at the **same box** in both Arrival and conversation states
- `main.mt-12`; `marginRight: rightPanelOpen ? '20rem' : 0`

## 4. Responsive variants

- `px-4 md:px-6` on the doorway header — the single documented breakpoint in the core
- right panel reserves `20rem` of right margin when open; auto-closes on voice flow unless the member pinned it
- mobile doorway box differs from desktop **by design** and is measured separately
- `MobileRouteGuard` in the root layout; Capacitor/native policy governed by `houseDestinations`
- ⚠️ No documented tablet/intermediate state was found.

## 5. ⚠️ THE CONFLICT THE RULING MUST SETTLE

**The sacred core contains exactly what P1-R §1 prohibits.**

`MaiaCenterField` renders **30 continuously animated particles** and a
**voice-reactive breathing glow**. P1-R §1 forbids "particle clouds", "excessive
blur and glow", and "animated breathing objects that imply consciousness"; §4
names "particles move continuously" and "glowing fields breathe" as bad examples.

Both can be true at once, but only under a stated rule:

> **`/maia` is exempt by preservation, not exemplary by imitation.**
> It is protected because it is the sacred center. New surfaces inherit its
> typography, spacing, darkness/light balance, restraint and interaction tone —
> and do **not** inherit its ambient motion.

⛔ This is not a decision I should take. It matters concretely here because
**the guard will freeze these forms in place**: writing Layer B without settling
it means mechanically enforcing, forever, the continued existence of the exact
motion language P1-R §1 was written to prevent spreading.

A second, smaller question rides with it: the particle field is already fully
disabled under `prefers-reduced-motion`. So a reduced-motion `/maia` *already*
satisfies §1 — which suggests the atmosphere is separable from the gestalt, and
that the perceptual anchor may be the gradient, geometry and typography rather
than the motion. **Worth deciding deliberately, not by default.**

## 6. Motion behaviour

- `framer-motion`; particle animation is **voice-state driven**: `idle` ambient drift · `listening` converge toward centre, opacity rises with amplitude · `processing` teal shift, orbital shimmer · `responding` pulse outward, warm gold
- per-state `yRange` / `xDrift` / `opacity` / `scale` / `duration` / `glowColor`
- `usePrefersReducedMotion()` — particles **not rendered at all**; glow static
- `main` carries `transition-all duration-300`
- ⭐ Under P1-R §4 this motion is *arguably* compliant even as it stands: it responds to who is speaking, which is a real change of state — not idle decoration. That is a meaningful distinction from the prototype shell's unconditional `apFieldPulse`.

## 7. Existing test / screenshot infrastructure

| Asset | State |
|---|---|
| `e2e/playwright.config.ts` | ✅ EXISTS — `chromium`, `firefox`, **`webkit` (Desktop Safari)**, `Mobile Chrome` (Pixel 5) |
| `e2e/tests/` | 3 specs: `offline-functionality`, `onboarding`, `oracle-conversation` |
| Visual baselines | ❌ **NONE.** `toHaveScreenshot` / `toMatchSnapshot` appear nowhere in the repo |
| Screenshot setting | `screenshot: 'only-on-failure'` — diagnostic, not regression |
| Gate wiring | ❌ `npm run test:e2e` is **NOT** in the normal gate path (`typecheck`, `check:no-supabase`, `smoke`, jest) |
| Jest | node env, `*.test.ts` only, **no React renderer** — cannot render a component |

**Consequences for Layer B**, stated plainly:
1. The harness exists; the *practice* does not. A baseline discipline (and its update ritual) is new work.
2. The founder requires mechanical enforcement "by the repository's normal test/gate path" — e2e is not currently on it. **Wiring it there is a real decision with CI cost**, not an implementation detail.
3. `/maia` is authenticated and carries member-specific greeting + voice-reactive motion. A stable baseline needs a seeded member, a frozen clock/greeting, and motion pinned via `reducedMotion: 'reduce'`. **No seeded test member exists today.**
4. ⭐ `webkit` is already configured — the Safari witness I owed from P1 is reachable without new infrastructure.

## 8. Safest extension seams — they already exist

This is better news than expected. `MaiaShell` is already a seam architecture:

| Seam | Mechanism | Suitability |
|---|---|---|
| `MaiaRightPanelHost` | right panel, `20rem`, pinnable, auto-closes on voice | **Strongest** — already yields to the centre by construction |
| `MaiaHouseSheet` | the House; opened by `window` event `openMaiaHouse` | **Strong** — the sanctioned navigation surface; disclosure belongs *inside* it |
| `MaiaModalManager` | modal/sheet host at page level | Strong for transient overlays |
| `children` → `MaiaCenterField` | `page.tsx` retains ownership of the centre's contents | ⚠️ **Powerful and dangerous** — this is the slot through which an extension could become the centre |
| `MaiaLeftRail` | retired on this surface; still mounted by founder/steward surfaces | ⛔ **Do not reuse** — retiring it was a founder ruling |
| `MaiaBoundaryLayout` | not traced this pass | UNKNOWN |

**Continuity/Keeps most plausibly belong in the right panel or inside the House**,
both of which already yield to the centre. ⛔ Not a recommendation to build.

## 9. What must remain free to change

- `OracleConversation.tsx` functional wiring — **it changed today** (`42a907a1`, Safari silent-response handoff). The active voice programme runs through this file; pinning it would stall that lane within days.
- `page.tsx` feature wiring: sheets, modals, subscription/feature access, deep links
- accessibility markup, responsive correctness, performance, security, genuine bug repair (per the ruling)
- the dead legacy branch (`:906-2159`) — whether it should be removed at all is a separate question, ⛔ not this guard's business

## 10. Proposed executable guards — ⛔ NOT IMPLEMENTED

### Layer A — structural core guard (cheapest, highest confidence)

A jest `.test.ts` source-assertion guard, in the manner of
`lib/navigation/__tests__/houseReturn.test.ts` and
`app/relationships/__tests__/relationshipsUxArchitecture.test.ts`. Comments
stripped before scanning (the C21 lesson).

Pins:
1. `page.tsx` canonical branch is `spatialMaiaShell` and that flag still defaults `true`
2. The canonical nesting order `MaiaShell › MaiaCenterField › OracleConversation` is unbroken
3. `MaiaCenterField` still receives the conversation as `children` — nothing else has been inserted as the centre's organizing authority
4. `MaiaShell` still renders `MaiaTopBar` + `main` + the single House doorway
5. No permanent multi-icon rail returns to `MaiaShell` (the 2026-07-22 ruling, made mechanical)
6. The centre's load-bearing colour/gradient tokens are unchanged

Cost: one file. Runs on the existing jest gate. Catches substitution,
re-centering and extension-promotion — **not** restyling.

### Layer B — visual gestalt guard (the real protection, the real cost)

Playwright `toHaveScreenshot` baselines of the canonical core under
`reducedMotion: 'reduce'` (which removes particles and makes the glow static —
the only way to get a deterministic frame):
- Desktop Chrome · Desktop Safari (webkit) · Mobile Chrome
- masked: greeting name, timestamps, message content
- tolerance: `maxDiffPixelRatio` permitting AA/font variance, failing on composition, proportion, hierarchy, typography, spacing, dominant light relationships

⚠️ Requires: a seeded test member, a deterministic greeting, and a decision on
whether e2e joins the blocking gate path.
⭐ Plus one **non-screenshot** measurement that needs no baseline and directly
encodes F2: assert the House doorway's bounding box equals `114×44` at `(20,5)`
desktop and `(12,5)` mobile, in **both** Arrival and conversation states. That is
cheap, exact, and is the invariant the code itself asks to be verified by
measurement.

### Layer C — extension-boundary guard

Assert that new surfaces attach only through the named seams: no new component
may be inserted between `MaiaShell` and `MaiaCenterField`, or between
`MaiaCenterField` and its `children`, without failing. Plus the rail prohibition
from §F3.

⚠️ **Honest limit**: Layers A and C are *structural* — they catch substitution and
colonization. Neither catches restyling. **Only Layer B protects the gestalt**,
and it is the one that needs new infrastructure and a CI decision. A guard shipped
without Layer B would satisfy the letter of the ruling and not its purpose.

---

## 11. Owed before implementation

1. ⭐ **Settle §5** — exempt-by-preservation vs exemplary-by-imitation, and whether the ambient particle motion is part of the protected gestalt or incidental to it. The guard freezes whatever this decides.
2. **Does e2e join the blocking gate path?** Without it, Layer B is advisory.
3. **Confirm the Layer A pin list** (§10) is the right boundary — I derived it from repository truth, but the boundary is a founder call.
4. Whether `MaiaBoundaryLayout` belongs in the core or the extension field (UNKNOWN).

## 12. Standing

**CENSUS ✅ COMPLETE · ⛔ NO GUARD WRITTEN · ⛔ NO TEST ADDED · ⛔ `/maia` UNTOUCHED ·
⛔ NO SOURCE CHANGED · ⛔ P1 VISUAL LAYER REMAINS RETIRED · PRODUCTION UNTOUCHED.**

Returned for adjudication before implementation, as instructed.
