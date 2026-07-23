# Mobile layout — measurement pass (2026-07-23)

**Measurement only. Nothing patched.** Separate from #697 and from all persistence work.

Surface: live `https://soullab.life/maia`, authenticated as Kelly, viewport 375×812,
`devicePixelRatio` 2. Engine: **desktop Chromium (macOS)** — see §5 for what this does
and does not license.

Viewport probes, all states consistent:

| probe | value |
|---|---|
| CSS `100vh` | 812 |
| CSS `100dvh` | 812 |
| `window.innerHeight` | 812 |
| `documentElement.clientHeight` | 812 |
| `visualViewport.height` | 812 |
| `visualViewport.offsetTop` | 0 |

---

## 1. The measured failure — and it is NOT viewport units

`100dvh === 100vh === 812` in this engine, so **`dvh` could not be validated here and is
not indicated by any measurement.** The leading pre-measurement theory (`vh` vs the iOS
keyboard) is not what the numbers show. Two other mechanisms are.

### Mechanism A — every "fixed" element is not viewport-fixed

`components/OracleConversation.tsx:6924`

```jsx
<div className="oracle-conversation min-h-screen bg-soul-background overflow-hidden">
```

`app/globals.css:246-260`

```css
@keyframes hearthlight {
  0%, 100% { opacity: 0.95; filter: brightness(1.0); }
  50%      { opacity: 1.0;  filter: brightness(1.03); }
}
.bg-soul-background { animation: hearthlight 14s ease-in-out infinite; }
```

Measured computed style on that div: **`filter: brightness(1.02997)`**.

A non-`none` `filter` creates a containing block for `position: fixed` descendants —
same rule as `transform`, and identical across engines. The animation never resolves to
`none` (even at 0%/100% it is `brightness(1)`), so the containing block exists
continuously.

**Every `fixed` element on the conversation surface is therefore positioned against this
div, not the viewport, and scrolls with it.** Proven by the offset: every fixed rect sits
exactly +48px below its CSS `top` (the height of the BETA banner above the div).

| element | CSS `top` | measured `rect.top` | delta |
|---|---|---|---|
| jewel block | 64px | 112 | +48 |
| conversation area | 176px | 224 | +48 |
| composer | 631px | 679 | +48 |

### Mechanism B — the conversation area is over-constrained, so `bottom` is dead

`components/OracleConversation.tsx:8134-8147` sets `top`, `height` **and** `bottom` on a
fixed element. Per CSS, when all three are specified, `bottom` is ignored.

| state | cssTop | cssHeight | cssBottom | bottom edge if `bottom` applied | **measured bottom edge** |
|---|---|---|---|---|---|
| voice (`showChatInterface` false) | 176px | 492px (`100vh − 320`) | 220px | 592 | **716** |
| text (`showChatInterface` true) | 176px | 512px (`100vh − 300`) | 260px | 552 | **736** |

The 220/260px clearance the code intends to reserve for the composer **never applies.**

---

## 2. Expected vs observed — text mode, keyboard closed, 375×812

| quantity | expected (from code intent) | measured | verdict |
|---|---|---|---|
| conversation area | ends 260px above viewport bottom → 552 | ends **736** | ✗ `bottom` inert |
| composer top | below the conversation area (≥736) | **679** | ✗ overlaps transcript by **57px** |
| composer bottom | ≤ 812 | **816** | ✗ **4px below the visible viewport, with no keyboard** |
| gap composer→viewport bottom | ≥ 0 | **−4** | ✗ |
| textarea | fully visible | 741..793 | within, but only by 19px |
| jewel container | 112..224 (per source comment) | **112..224** | ✓ comment accurate |
| largest flower inside | — | 80px at 112..192 | container is 112px for an 80px flower |

**Kelly's second symptom reproduces at rest**, before any keyboard is involved: the
composer already hangs below the visible viewport and overlaps the transcript.

---

## 2b. Multi-device scaling test — settles which mechanism dominates

Kelly's discriminator: *if the gap scales with screen height, viewport math dominates; if
it stays constant, the hard-coded offsets do.*

| viewport | `100vh` | conv bottom | composer top..bottom | **gap below composer** | **overlap** |
|---|---|---|---|---|---|
| 375×667 (SE) | 667 | 591 | 534..671 | **−4** | **57** |
| 375×812 | 812 | 736 | 679..816 | **−4** | **57** |
| 430×932 (Pro Max) | 932 | 856 | 799..936 | **−4** | **57** |

**Both defects are exactly constant across a 265px range of screen height.** The gap does
not scale. By Kelly's own test, the hard-coded offsets and the containing-block shift
dominate; viewport height does not.

The arithmetic closes exactly, which is why it is constant:

```
containing block starts at +48 (BETA banner), height = 100vh (min-h-screen)
composer bottom edge = 48 + (100vh − 44)  = 100vh + 4   → gap = −4, always
conv bottom          = 48 + 176 + (100vh − 300) = 100vh − 76
composer top         = 48 + (100vh − 44 − 137)  = 100vh − 133
overlap              = (100vh − 76) − (100vh − 133) = 57, always
```

`100vh` cancels out of both expressions. **The defect is device-height-independent** —
it is the +48px containing-block offset against a 44px inset, nothing more.

## 3. The two `holoflowerSize` effects

| | Effect A | Effect B |
|---|---|---|
| site | `OracleConversation.tsx:1550` | `OracleConversation.tsx:2831` |
| deps | `[]` | `[]` |
| values | `≤768 → 40`, else `350` | `<640 → 80`, `<1024 → 100`, else `120` |
| runs on mount | **No** — only registers a listener | Yes (`updateSize()` called directly) |
| listens to `resize` | Yes | Yes |
| runs first | **A** (earlier in the component body → its listener registers first) | B |

Both write the same state from the same event. On every `resize`, A sets 40 and B then
overwrites with 80 — so **B wins by registration order, not by design.** Reverse the
declaration order and mobile silently becomes a 40px flower.

Initial state (`:1441`) is a third source: `≤768 → 40`, else `350`.

**Measured live value: 80px** (largest flower image 80px tall) — B's value, as predicted.

Do `resize` events fire from URL-bar or keyboard changes? **Not measurable in this
engine** (no browser chrome collapse, no software keyboard). On iOS Safari the URL bar
collapse does fire `resize`; the keyboard does not change `innerHeight` and so should
not. Unverified here.

---

## 4. Causal chain

Confirmed by measurement:

1. `.bg-soul-background`'s animated `filter` makes `.oracle-conversation` the containing
   block for all `fixed` descendants → they are not viewport-pinned and scroll with the
   page.
2. The conversation area's `bottom` is inert (over-constrained), so its intended
   composer clearance is never reserved.
3. Consequence, measured at rest: composer overlaps the transcript by 57px and extends
   4px past the visible viewport.

Inferred, **not** measured:

4. On iOS, focusing the textarea makes Safari scroll the page to reveal it. Because the
   composition is not viewport-pinned (1), that scroll carries the whole surface upward —
   holoflower off the top, composer landing above the keyboard with a gap. This matches
   both reported symptoms but has not been observed on iOS.

---

## 5. What this measurement does and does not license

**Licensed** (CSS-spec behaviour, engine-independent): mechanisms A and B, the
over-constraint arithmetic, the +48px containing-block offset, the effect-ordering
analysis.

**Not licensed**: anything about the iOS software keyboard, Safari focus-scroll, or URL
bar. Those states were **not measured**.

Why not: no booted iOS simulator was available, and `/maia` requires an authenticated
member session — credentials I will not enter. Real-device remote inspection (Safari Web
Inspector against Kelly's iPhone) is the tool that would settle §4 item 4, and it needs
Kelly.

---

## 6. Smallest proposed patch (NOT applied)

Ordered by evidence strength, smallest first:

1. **Stop the wrapper creating a containing block.** Move `bg-soul-background`'s animated
   `filter` off the element that wraps `fixed` descendants — onto a sibling layer or a
   `::before` — so `position: fixed` means viewport-fixed again. One-line class move plus
   a CSS rule. Addresses mechanism A, which is upstream of both symptoms.
2. **Resolve the over-constraint.** On the conversation area, drop either `height`/
   `maxHeight` or `bottom` — keep one pair, not all three — so the intended clearance
   actually applies. Addresses mechanism B and the measured 57px overlap.
3. **Collapse the two `holoflowerSize` effects into one.** A live bug regardless; it is
   currently correct only by accident of declaration order.

## 6b. SECOND SURFACE, SECOND MECHANISM — added after device evidence

Kelly supplied iPhone screenshots with the keyboard open (10:10). They show the **Arrival
field**, not the conversation surface, and it fails differently.

`components/maia/MaiaArrivalField.tsx:61-67`

```jsx
createPortal(
  <motion.div className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-5">
  …, document.body)
```

It is portaled to `document.body`, so it sits **outside** `.oracle-conversation` and is
unaffected by the filter containing block (§1 mechanism A). It is genuinely
viewport-fixed. Yet the device shows its holoflower cropped off the top when the keyboard
opens.

Mechanism: `inset-0` sizes to the **layout** viewport, which iOS does not shrink for the
keyboard; `justify-center` centres the column in that full-height box. With the keyboard
taking ~40% of the screen, the visible centre sits far above the layout centre, so the top
of the column is pushed out of view.

**This is the visual-viewport mechanism** — on a different surface from the one measured
in §1–2b. The desktop measurement could not reach it (no software keyboard).

### Correction to §2b

"Viewport units are not implicated" is proven for the **conversation surface** (constant
−4 / 57 across a 265px range). It is **not** established for the Arrival field, and the
device evidence points the other way there. Two surfaces, two mechanisms, two fixes.

Also observed in the browser measurement and not yet explained: the Arrival portal is
mounted **concurrently** with an active conversation (a 142px flower at top 267..409
alongside the conversation surface's own). Flagged, not diagnosed.

## 7. Explicit non-goals

- **Do not** replace `100vh` with `dvh` **on the conversation surface** — measurement
  gives no evidence for it there. The Arrival field is a separate question (§6b) where
  `dvh`/`svh` or a non-centred layout is a live candidate.
- **Do not** wire `visualViewport` on the conversation surface. Same reason, same
  exception.
- **Do not** change the fixed `bottom: 220px/260px` values. They are *inert*, not wrong —
  changing the numbers before fixing the over-constraint changes nothing.
- **Do not** adjust `pt-[10.5rem]` on the transcript. It matches the measured jewel box
  (112..224); it is not implicated.
- **Do not** touch #697, `TurnsStore`, `sessionManager`, `maiaService`, or any
  persistence path. Different thread.
