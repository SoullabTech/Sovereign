---
level: architecture
---

# SOULLAB_THEME.md

## Name
**Soullab Core**

## Status
Canonical visual system for Soullab and MAIA core surfaces.

## Essence
Soullab Core is a dark, contained, developmental interface language.

It should feel like:
- entering a field
- crossing a threshold
- being held in a quiet, intelligent environment

It should **not** feel like:
- generic SaaS
- bright productivity software
- social media
- gamified wellness UI

---

## Core Principles

### 1. Containment before stimulation
The interface should feel calm, grounded, and spacious.
Visual intensity must be low unless signal requires emphasis.

### 2. Depth before brightness
Primary surfaces live in deep navy and midnight tones.
Light backgrounds are not canonical for core sanctuary surfaces.

### 3. Meaningful accent only
Gold/amber is used for:
- signal
- activation
- selected state
- meaningful emphasis

Accent color is never decorative.

### 4. Variation by function, not by identity
Different areas of the platform may shift accent emphasis depending on function, but all remain inside Soullab Core.

### 5. Low-noise hierarchy
Hierarchy should come from:
- spacing
- grouping
- surface elevation
- text weight
not from excessive color contrast or decorative elements.

---

## The Thread

Not color. Not layout. Not even theme.

**A continuous field of aware containment.**

Every design decision should ask:
- Does this feel like entering or using?
- Does this fragment the field or deepen it?
- Does this add noise or reveal signal?

---

## Field Hierarchy

The system has four structural layers, not just background/surface/accent:

| Layer | Token | Purpose |
|---|---|---|
| **Void** | `field-void` / `canvas-deep` | Cosmic depth, page edges, the space behind everything |
| **Field** | `field-base` / `canvas` | Main environment, the room you're in |
| **Surface** | `surface` / `elevated` | Interaction layer, cards, panels |
| **Signal** | `accent-primary` | Meaning, activation, emphasis |

Domain variance changes the **signal layer** and subtle tinting. The field stays continuous.

### Domain variance (same field, different signal)

Wrap any page or section with `data-domain`:
```html
<div data-domain="maia" class="bg-field-core">
```

| Domain | Accent | Tone |
|---|---|---|
| `maia` | `#B8860B` (gold) | quiet, reflective, thresholded |
| `admin` | `#C9A227` (bright gold) | observational, precise |
| `practitioner` | `#5E7FA6` (cool blue) | structured, capable |
| `world` | `#8A7FB8` (soft violet) | mythic, spacious |
| `archive` | `#8B8578` (stone) | preservation, continuity |

### Inner/outer depth modulation

```html
<div data-layer="inner">  <!-- softer surface for MAIA, journal, reflection -->
<div data-layer="outer">  <!-- slightly sharper for admin, tools, community -->
```

---

## Core Palette

### Foundation
- **Canvas:** `#0A1628`
- **Canvas Deep:** `#060D18`
- **Canvas Lift:** `#0F1D32`

### Surfaces
- **Surface:** `#121A2B`
- **Surface Elevated:** `#1A2235`
- **Surface Soft:** `#162033`

### Borders
- **Border Subtle:** `#1E2F4D`
- **Border Stronger:** `#2A3F63`

### Text
- **Text Primary:** `#F5F7FB`
- **Text Secondary:** `#B7C0D1`
- **Text Muted:** `#7F8AA3`

### Signal / Accent
- **Accent Gold:** `#B8860B`
- **Accent Gold Soft:** `#D4AF37`

### States
- **Success:** restrained green, muted only
- **Warning:** amber family only
- **Error:** muted red, never neon
- **Info:** cool blue, low saturation

---

## Functional Variants

These are tonal overlays, not separate themes.

### MAIA / Sanctuary
- Base: Soullab Core
- Accent: Gold / soft amber
- Tone: quiet, reflective, thresholded

### Admin / Telemetry
- Base: Soullab Core
- Accent: slightly brighter signal contrast
- Tone: observational, precise, restrained

### Practitioner Studio
- Base: Soullab Core
- Accent: cooler blue emphasis
- Tone: structured, capable, professional

### Worlds / Journey / Depth
- Base: Soullab Core
- Accent: slightly more atmospheric tonal variation
- Tone: mythic, spacious, immersive

### Archive / Memory
- Base: Soullab Core
- Accent: slate / stone / subdued gold
- Tone: preservation, continuity, reflection

---

## Field Gradients

Use radial gradients for immersion, not linear gradients for decoration.

| Gradient | Tailwind class | Feel |
|---|---|---|
| `field-core` | `bg-field-core` | Primary immersive field — radial bloom from top center |
| `field-depth` | `bg-field-depth` | Deeper, more intimate — tighter radial, lower center |
| `soullab-core` | `bg-soullab-core` | Simple vertical gradient for utility layouts |

```tsx
<div className="min-h-screen bg-field-core text-soullab-text-primary">
```

### Atmospheric presence

Add `sl-atmosphere` as a fixed overlay for subtle life:
```tsx
<div className="sl-atmosphere" />
```

Add `sl-field-alive` for imperceptible breathing:
```tsx
<div className="sl-field-alive">
```

These create presence, not motion.

---

## Component Rules

### Backgrounds
- Core pages use deep navy or midnight gradients.
- Avoid flat black.
- Avoid light canvases in canonical MAIA/Soullab surfaces.

### Cards / Panels
- Cards should be softly elevated through tonal lift, not heavy shadows.
- Use subtle borders.
- Rounded corners should feel gentle, not playful.

### Buttons
- Primary actions may use gold emphasis sparingly.
- Secondary actions should stay within blue/slate range.
- Avoid teal as a primary Soullab identity color.

### Inputs
- Dark surfaces
- Subtle border
- Clear focus state
- No bright form styling

### Charts / Telemetry
- Must feel like signal surfaces, not analytics dashboards.
- Use restrained colors and sparse labeling.

---

## Prohibitions

Do not introduce:
- bright teal as primary brand theme
- generic white SaaS surfaces in core MAIA flows
- random per-page accent colors
- high-saturation gradients
- decorative neon
- overly glossy or glassmorphism-heavy UI

---

## Accessibility
Soullab Core must preserve:
- readable contrast
- clear focus states
- legible text hierarchy
- reduced-motion compatibility

A future light mode may exist as a secondary accessibility/productivity mode, but it is **not canonical at present**.

---

## Implementation Rule
When in doubt:
- preserve containment
- reduce noise
- keep the field intact

Soullab Core is not a marketing skin.
It is the visual expression of a sanctuary.
