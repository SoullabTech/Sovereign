# Theme Hierarchy: Soullab and Stellium

This document explains the relationship between the Soullab Design Canon and the Stellium theme system, and provides guidance on when to use each aesthetic.

---

## Overview

Soullab maintains two complementary design directions within the Stellium theme system:

1. **Soullab Light Theme** - Warm, refined, consumer-facing aesthetic
2. **Dark Atmospheric Themes** - Immersive, practitioner-focused environments

Both directions share the same underlying typography principles (lighter weights, wider tracking) but apply them to different color environments.

---

## The Soullab Theme (Light)

**Use for:** Consumer-facing B2C pages, community spaces, membership areas, journal, onboarding

### Characteristics

- **Backgrounds:** Warm off-white gradient (`#f8f7f5` to `#f0efec`)
- **Cards:** Semi-transparent white (`bg-white/40`)
- **Accents:** Sage (`#5a7a6f`), Violet (`#6b5a98`), Gold (`#8a7a5a`)
- **Typography:** Light weights (300), wide tracking, relaxed leading
- **Symbols:** Geometric SVGs, never emojis

### When to Use

| Page Type | Use Soullab? | Rationale |
|-----------|--------------|-----------|
| Membership portal | Yes | Consumer-facing, nurturing |
| Community Commons | Yes | Social, grounded, accessible |
| Journal | Yes | Reflective, personal, warm |
| Onboarding flow | Yes | Welcoming, inviting |
| Marketing pages | Yes | Brand-consistent, refined |
| Blog/content | Yes | Readable, professional |

### Example Pages

- `/maia/membership`
- `/maia/community/commons`
- `/labtools/journal`
- `/begin`, `/onboarding`, `/signin`

---

## Dark Atmospheric Themes (Immersive)

**Use for:** Oracle readings, astrology charts, practitioner workspaces, labtools

### Available Themes

| Theme | Best For | Character |
|-------|----------|-----------|
| `sanctuary` | Default practitioner workspace | Warm, candlelit, grounded |
| `celestial` | Astrology, Oracle | Cosmic, starlit, deep indigo |
| `terra` | Bodywork practices | Earth tones, organic |
| `ember` | Coaching | Warm energy, motivating |
| `haven` | Therapy | Soft, safe, calming blues |
| `mystic` | Shamanic work | Deep purple, mysterious |
| `midnight` | Deep focus | Pure dark elegance |

### When to Use Dark Themes

| Page Type | Theme | Rationale |
|-----------|-------|-----------|
| Oracle readings | `celestial` | Atmospheric, divinatory |
| Birth chart viewer | `celestial` | Cosmic, chart-focused |
| Practitioner admin | `sanctuary` | Professional, focused |
| Labtools workspace | `sanctuary` | Tool-oriented, immersive |
| Voice sessions | `midnight` or `sanctuary` | Intimate, focused |

### Preserving Atmosphere

Dark pages often have beautiful visual elements that should be kept:

- Particle systems and animations
- Sacred geometry overlays
- Star fields and nebula effects
- Glowing accents and borders
- Gradient backgrounds

When applying typography updates to dark pages, preserve these atmospheric elements while refining the text treatment.

---

## Typography Principles (Universal)

These typography guidelines apply across ALL themes:

### Headers

```css
/* Light weight, wide tracking */
font-weight: 300;  /* font-light */
letter-spacing: 0.025em;  /* tracking-wide */
```

### Body Text

```css
font-weight: 400;  /* font-normal */
letter-spacing: 0.025em;  /* tracking-wide */
line-height: 1.625;  /* leading-relaxed */
```

### Section Labels

```css
font-size: 11px;
text-transform: uppercase;
letter-spacing: 0.2em;  /* tracking-[0.2em] */
```

### What Changed from Heavy to Refined

```jsx
// Before
<h1 className="text-4xl font-bold">Title</h1>

// After (both light and dark themes)
<h1 className="text-4xl font-light tracking-wide">Title</h1>
```

---

## Practitioner Theme Selection

Practitioners can select from all available vibes in their admin settings:

### Vibe Presets

| Preset | Colors | AI Tone | Best For |
|--------|--------|---------|----------|
| `earthy` | Earth tones, sage | Warm | Somatic, bodywork |
| `celestial` | Indigo, gold | Poetic | Astrology |
| `minimal` | White, black | Direct | Clinical practices |
| `warm` | Amber, coral | Warm | Counseling |
| `mystical` | Purple, violet | Poetic | Depth psychology |
| `clinical` | Teal, clean | Professional | Healthcare |
| `soullab` | Off-white, sage | Warm | Consumer-facing |

### How Practitioners Choose

1. Navigate to Settings > Visual Identity
2. Select a vibe preset OR customize colors (Professional tier+)
3. Preview changes in real-time
4. Publish to apply across their portal

---

## Implementation Details

### Stellium Design System

The theme is defined in `/lib/stellium/design-system.ts`:

```typescript
import { getTheme, getThemeForPage } from '@/lib/stellium/design-system';

// Get theme by name
const soullabTheme = getTheme('soullab');

// Get recommended theme for a page
const theme = getThemeForPage('/maia/membership'); // Returns 'soullab'
```

### Vibe Presets

Vibe presets are defined in `/lib/theme/vibePresets.ts`:

```typescript
import { VIBE_PRESETS, applyVibePreset } from '@/lib/theme/vibePresets';

// Apply soullab preset to a practitioner theme
const newTheme = applyVibePreset(existingTheme, 'soullab');
```

### CSS Variables

Generate CSS variables from a theme:

```typescript
import { themeToCSSVariables } from '@/lib/stellium/design-system';

const vars = themeToCSSVariables(theme);
// { '--bg-primary': '#f8f7f5', ... }
```

---

## Decision Tree

Use this to quickly decide which theme direction to use:

```
Is this page for end consumers (members, public)?
├── Yes → Use Soullab (light)
└── No → Is this an immersive tool (Oracle, Astrology)?
    ├── Yes → Use Celestial or appropriate dark theme
    └── No → Is this a practitioner workspace?
        ├── Yes → Use Sanctuary (default) or practitioner's chosen theme
        └── No → Default to Soullab
```

---

## Migration Notes

When migrating existing pages to the Soullab aesthetic:

1. **Check the page context** - Consumer pages should use Soullab
2. **Update backgrounds** - Replace dark gradients with warm off-white
3. **Swap accent colors** - Replace arbitrary colors with sage/violet/gold
4. **Refine typography** - Add `tracking-wide`, use `font-light` for headers
5. **Replace emojis** - Use geometric SVG symbols
6. **Test contrast** - Ensure text remains readable on light backgrounds

For dark pages being updated:

1. **Keep the atmosphere** - Preserve particles, gradients, glowing effects
2. **Update typography only** - Apply lighter weights, wider tracking
3. **Don't lighten** - These pages intentionally use dark, immersive backgrounds

---

## Reference

- **Soullab Design Canon (governing):** `/docs/canon/SOULLAB_DESIGN_CANON.md`
- **Soullab Visual Language (implementation):** `/docs/design/SOULLAB_VISUAL_LANGUAGE_v1.0.md`
- **Stellium Design System:** `/lib/stellium/design-system.ts`
- **Vibe Presets:** `/lib/theme/vibePresets.ts`
- **Practitioner Theme Schema:** `/lib/theme/practitionerTheme.ts`

---

*Last updated: January 2026*
