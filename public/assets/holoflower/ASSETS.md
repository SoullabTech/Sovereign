# Holoflower Asset Taxonomy

The holoflower (spiral-of-dots mark) appears across the platform in several
distinct **symbolic roles**. The recurring "wrong asset" regressions happen when
a session asks *"which PNG should I use?"* instead of the real question:

> **Which symbolic role is this holoflower playing here?**

- a **room atmosphere mark** — quiet, ambient, tintable → mono
- a **developmental / elemental map** — the elemental colors carry meaning → elemental
- a **brand symbol** — identity usage on light or dark ground → elemental (transparent)
- a **dynamic mask / watermark / overlay** — must have true alpha → mono
- a **teaching diagram** — fixed colors, explanatory → elemental

Once the role is named, the correct asset is obvious.

## Canonical assets (`canonical/`)

New code MUST reference these paths. Every canonical file has a **true
transparent background** and works on light and dark surfaces and as a CSS mask.

| File | Role | Description |
|------|------|-------------|
| `canonical/holoflower-mono-white.png` | Mono mark (raster) | White dot-spiral, 793×840, transparent. Room atmosphere, watermarks, overlays. Tint dynamically rather than adding color variants. |
| `canonical/holoflower-mono-white.svg` | Mono mark (vector) | Same art as vector, all-white fills. Preferred where SVG is accepted; recolor via CSS. |
| `canonical/holoflower-mono-amber.png` | Mono mark, amber | Pre-tinted amber variant already in use (tarot, book studio, Nathan pages, pitch decks). |
| `canonical/holoflower-elemental.png` | Elemental / brand mark | Full-color dot-spiral (Air/gold top · Fire/red right · Water/blue bottom · Earth/green left), 1024², transparent. Use when the elemental distinctions themselves matter, and for brand placement on any ground. |

### Known gaps (do not fabricate — commission or derive deliberately)

- `holoflower-mono-black.png` — no black mono variant exists yet.
- Print-grade vector of the **elemental** mark — only the mono SVG exists.

## Legacy files (repo root of `public/`) — DEPRECATED for new use

Kept in place so existing references and any external hotlinks don't break.
Do **not** reference these in new code.

| File | Status | Why |
|------|--------|-----|
| `holoflower.png` | superseded by `canonical/holoflower-mono-white.png` | Same file; migrate references opportunistically. |
| `holoflower.svg` | superseded by `canonical/holoflower-mono-white.svg` | Same file; migrate references opportunistically. |
| `holoflower-amber.png` | superseded by `canonical/holoflower-mono-amber.png` | Same file; migrate references opportunistically. |
| `holoflower-studio-transparent.png` | superseded by `canonical/holoflower-elemental.png` | Same file; migrate references opportunistically. |
| `maia-spiral-logo-alt.png` | ⚠️ **white-backed** | Opaque white baked into alpha. Renders as a white square on dark ground; breaks masks. Caused the 2026-07-19 Vision Studio regression (PR #663). Light surfaces only, and prefer the canonical elemental even there. |
| `maia-spiral-logo.png` | ⚠️ white-backed | Same constraint. |
| `holoflower-studio.png` | ⚠️ white-backed | Same constraint. Unreferenced. |
| `holoflower-whatsapp.png` | chat-app variant | 640², transparent; kept for any external chat integrations. |
| `holoflower-v2.png` / `holoflower-v2-transparent.png` | ❌ **wrong mark** | 12-petal mandala — ruled off-brand (Kelly, 2026-07-07). Never use; never revert to it. |

## Rules

1. The holoflower is a **fixed brand asset**: reference it, tint it, animate it,
   frame it — **never redraw it in code** (no hand-drawn `<svg>` recreations).
2. Anything used on a dark surface or as a CSS mask must have **true alpha** —
   check the background pixels, not just whether the file "has an alpha channel"
   (the white-backed files all technically have one).
3. New variants (sizes, tints, formats) are derived from the canonical files and
   added to `canonical/` with a role-named filename — not dropped into `public/`
   root with an ad-hoc name.

See also: `public/README.md` (icon inventory) and
`components/maia/vision-studio/RoomHoloflower.tsx` (the room-mark exemplar and
its do-not-recreate docstring).
