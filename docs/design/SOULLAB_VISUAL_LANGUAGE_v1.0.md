# Soullab Visual Language v1.0

**Renamed 2026-08-25** (was `docs/SOULLAB_DESIGN_CANON.md`). The governing aesthetic and experiential
standard is **`docs/canon/SOULLAB_DESIGN_CANON.md`** — founder-ratified canon. **This document is its
implementation layer:** the concrete visual language — palette, typography, components, motion, theme
integration — through which that canon is expressed. Where the two differ, **canon governs.**

A reference for the Soullab visual language. All new components and pages should follow these principles.

---

## Integration with Stellium Theme System

The Soullab Design Canon is now integrated into the Stellium theme system as a first-class theme package. This enables:

- **Automatic theme selection** via `getThemeForPage()` for consumer-facing pages
- **Vibe preset** for practitioners who want the Soullab aesthetic
- **CSS variable generation** for runtime theming

### When to Use Soullab vs Dark Themes

| Context | Theme | Rationale |
|---------|-------|-----------|
| Membership, Community, Journal | **Soullab** | Consumer B2C, warm and inviting |
| Onboarding, Marketing | **Soullab** | Brand-consistent, accessible |
| Oracle, Astrology | **Celestial** (dark) | Atmospheric, immersive |
| Practitioner Workspaces | **Sanctuary** (dark) | Professional, focused |

For detailed guidance, see `/docs/THEME_HIERARCHY.md`.

### Using the Theme Programmatically

```typescript
import { getTheme, getThemeForPage } from '@/lib/stellium/design-system';

// Get the Soullab theme directly
const soullab = getTheme('soullab');

// Auto-detect theme for a page
const theme = getThemeForPage('/maia/membership'); // Returns 'soullab'
```

---

## Philosophy

Soullab's design serves the soul's journey — elegant, unhurried, and grounded. It favors:

- **Warmth over coldness** — earth tones, soft whites, natural colors
- **Refinement over loudness** — clean typography, subtle borders, minimal decoration
- **Geometry over emoji** — custom SVG symbols that carry meaning
- **Breathing room** — generous spacing, light fonts, relaxed leading

---

## Color Palette

### Light Theme (Primary)

```css
/* Backgrounds */
--soullab-bg-primary: #f8f7f5;    /* Warm off-white */
--soullab-bg-secondary: #f4f3f0;  /* Slightly warmer */
--soullab-bg-tertiary: #f0efec;   /* Deepest warmth */

/* Background gradient */
background: linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%);

/* Cards */
--soullab-card-bg: rgba(255, 255, 255, 0.4);  /* bg-white/40 */
--soullab-card-bg-hover: rgba(255, 255, 255, 0.6);  /* bg-white/60 */

/* Borders */
--soullab-border: rgba(214, 211, 209, 0.6);  /* border-stone-200/60 */
```

### Accent Colors

```css
/* Sage - for growth, natural, grounding elements */
--soullab-sage: #5a7a6f;
--soullab-sage-hover: #4a6a5f;
--soullab-sage-bg: rgba(90, 122, 111, 0.1);

/* Violet - for consciousness, intuition, transformation */
--soullab-violet: #6b5a98;
--soullab-violet-hover: #5b4a88;
--soullab-violet-bg: rgba(107, 90, 152, 0.1);

/* Gold - for wisdom, achievement, guidance */
--soullab-gold: #8a7a5a;
--soullab-gold-hover: #7a6a4a;
--soullab-gold-bg: rgba(138, 122, 90, 0.1);
```

### Text Colors

```css
--soullab-text-primary: #292524;    /* stone-800 */
--soullab-text-secondary: #57534e;  /* stone-600 */
--soullab-text-muted: #78716c;      /* stone-500 */
--soullab-text-subtle: #a8a29e;     /* stone-400 */
```

---

## Typography

### Font Weights

- **Headers**: `font-light` (300) or `font-medium` (500)
- **Body**: `font-normal` (400)
- **Labels**: `font-medium` (500)

### Font Sizes

```css
/* Headers */
--soullab-h1: 2rem;        /* 32px, text-2xl */
--soullab-h2: 1.5rem;      /* 24px, text-xl */
--soullab-h3: 1.125rem;    /* 18px, text-lg */

/* Body */
--soullab-body: 0.875rem;  /* 14px, text-sm */
--soullab-body-sm: 0.8125rem; /* 13px, text-[13px] */

/* Labels */
--soullab-label: 0.6875rem; /* 11px, text-[11px] */
```

### Letter Spacing

```css
/* Headers and body */
.tracking-wide { letter-spacing: 0.025em; }

/* Section labels (uppercase) */
.tracking-\[0\.2em\] { letter-spacing: 0.2em; }
```

### Line Height

```css
/* Body text */
.leading-relaxed { line-height: 1.625; }

/* Compact elements */
.leading-normal { line-height: 1.5; }
```

### Example Typography Patterns

```jsx
// Page title
<h1 className="text-2xl font-light tracking-wide text-stone-800">
  Title Here
</h1>

// Section header
<h2 className="text-xl font-medium tracking-wide text-stone-800">
  Section Title
</h2>

// Body text
<p className="text-[14px] tracking-wide text-stone-500 leading-relaxed">
  Body content here.
</p>

// Section label (uppercase)
<span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
  Section Label
</span>

// Small text / captions
<span className="text-[13px] tracking-wide text-stone-400">
  Caption or meta text
</span>
```

---

## Geometric Symbols

**Never use emojis in Soullab UI.** Use geometric SVG symbols that carry meaning.

### Symbol Guidelines

- **Stroke-based**: Use `fill="none" stroke="currentColor" strokeWidth="1.5"`
- **ViewBox**: Typically `viewBox="0 0 24 24"` or `viewBox="0 0 40 40"`
- **Color**: Inherit via `className` using Tailwind text colors

### Standard Symbols

```jsx
// Circle - Touch tier, presence, wholeness
<svg viewBox="0 0 40 40" className="w-5 h-5 text-[#5a7a6f]" fill="none" stroke="currentColor" strokeWidth="1.5">
  <circle cx="20" cy="20" r="12" />
</svg>

// Vesica Piscis - Continuity tier, connection, duality
<svg viewBox="0 0 40 40" className="w-5 h-5 text-[#6b5a98]" fill="none" stroke="currentColor" strokeWidth="1.5">
  <circle cx="15" cy="20" r="10" />
  <circle cx="25" cy="20" r="10" />
</svg>

// Triquetra / Three Circles - Stewardship tier, community, integration
<svg viewBox="0 0 40 40" className="w-5 h-5 text-[#8a7a5a]" fill="none" stroke="currentColor" strokeWidth="1.5">
  <circle cx="20" cy="14" r="8" />
  <circle cx="14" cy="24" r="8" />
  <circle cx="26" cy="24" r="8" />
</svg>

// Open Book - Journal, writing, reflection
<svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
  <path d="M8 10 Q20 8 20 20 Q20 32 8 30" />
  <path d="M32 10 Q20 8 20 20 Q20 32 32 30" />
  <line x1="20" y1="8" x2="20" y2="32" />
</svg>

// Square - Structure, foundation, grounding
<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
  <rect x="4" y="4" width="16" height="16" rx="2" />
</svg>

// Concentric Circles - Oracle, focus, center
<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
  <circle cx="12" cy="12" r="8" />
  <circle cx="12" cy="12" r="3" />
</svg>
```

---

## Components

### Cards

```jsx
// Standard card
<div className="bg-white/40 border border-stone-200/60 rounded-xl p-6">
  {/* Content */}
</div>

// Card with subtle shadow
<div className="bg-white/60 border border-stone-200/60 rounded-xl p-6 shadow-sm">
  {/* Content */}
</div>
```

### Buttons

```jsx
// Primary button (sage)
<button className="px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors">
  Primary Action
</button>

// Secondary button (violet)
<button className="px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors">
  Secondary Action
</button>

// Ghost button
<button className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors">
  Ghost Action
</button>
```

### Section Dividers

```jsx
// Simple divider
<div className="w-12 h-px bg-stone-300/50 mx-auto my-8" />

// Divider with label
<div className="flex items-center gap-4 my-8">
  <div className="flex-1 h-px bg-stone-200/60" />
  <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
    Section Name
  </span>
  <div className="flex-1 h-px bg-stone-200/60" />
</div>
```

### Tags / Pills

```jsx
// Type tag
<span className="text-[11px] tracking-wider uppercase px-2 py-1 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
  concept
</span>

// Status tag
<span className="text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-[#5a7a6f]/20 text-[#5a7a6f]">
  active
</span>
```

---

## Page Layout

### Standard Light Page

```jsx
<div
  className="min-h-screen"
  style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
>
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Page content */}
  </div>
</div>
```

### Header Pattern

```jsx
<div className="mb-12">
  <button className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide mb-8">
    <ArrowLeft className="h-4 w-4" />
    <span>Back to Previous</span>
  </button>

  <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-3">
    Page Title
  </h1>
  <p className="text-stone-500 text-[14px] tracking-wide leading-relaxed max-w-2xl">
    Page description or subtitle text goes here.
  </p>
</div>
```

---

## Hybrid Approach for Dark Themes

Some pages (Oracle, Astrology) have beautiful dark atmospheric aesthetics that should be preserved. Apply the Soullab typography principles without replacing the background/atmosphere:

### Typography Updates for Dark Pages

```jsx
// Before (heavy)
<h1 className="text-4xl font-bold text-amber-100">Title</h1>

// After (refined)
<h1 className="text-4xl font-light tracking-wide text-amber-100">Title</h1>

// Before (heavy)
<h2 className="text-2xl font-bold text-white">Section</h2>

// After (refined)
<h2 className="text-xl font-medium tracking-wide text-white">Section</h2>

// Before
<p className="text-white/60">Description</p>

// After (refined)
<p className="text-white/60 text-sm tracking-wider leading-relaxed">Description</p>
```

### What to Keep

- Atmospheric particles and animations
- Sacred geometry overlays
- Dark gradients (navy, amber, purple)
- Glowing effects
- Star fields

### What to Update

- Font weights: `font-bold` → `font-light` or `font-medium`
- Letter spacing: Add `tracking-wide` or `tracking-wider`
- Text sizes: Slightly smaller for refinement
- Section labels: Use `text-[11px] uppercase tracking-[0.2em]`

---

## Animations & Transitions

### Standard Transitions

```css
/* Button and interactive element transitions */
.transition-colors { transition-property: color, background-color, border-color; }
.transition-all { transition-property: all; }
.duration-200 { transition-duration: 200ms; }
```

### Hover Effects

```jsx
// Card hover
className="hover:bg-white/60 transition-colors"

// Button hover
className="hover:scale-[1.01] transition-all"
```

### Avoid Framer Motion for Critical Content

Framer Motion animations can cause rendering issues. For critical content visibility:
- Use CSS transitions instead of `motion.div`
- Avoid `initial={{ opacity: 0 }}` on important content
- Use Tailwind hover/transition classes

---

## Don't

- Use emojis in UI (use geometric symbols)
- Use `font-bold` for main headers (use `font-light` or `font-medium`)
- Use dark backgrounds in pages meant to be light
- Use Framer Motion for elements that must be visible on load
- Use small, tight letter-spacing (prefer `tracking-wide`)
- Override the Soullab palette with arbitrary colors

---

## Do

- Use warm off-white backgrounds for light pages
- Use geometric SVG symbols
- Use refined typography with tracking
- Keep cards subtle with low-opacity backgrounds
- Maintain consistent spacing (6, 8, 12px scale)
- Preserve beautiful existing aesthetics when applying hybrid updates

---

## Reference Pages

- **Full Soullab aesthetic**: `/maia/membership`, `/maia/community/commons`, `/labtools/journal`
- **Hybrid dark aesthetic**: `/oracle`, `/astrology`

---

## Stellium Integration Reference

### Files

| File | Purpose |
|------|---------|
| `/lib/stellium/design-system.ts` | Theme packages including `soullab` |
| `/lib/theme/vibePresets.ts` | Vibe presets including `soullab` |
| `/lib/theme/practitionerTheme.ts` | Schema with `soullab` vibe option |
| `/docs/THEME_HIERARCHY.md` | When to use which theme |

### Soullab Theme Tokens

The `soullab` theme in Stellium provides these key tokens:

```typescript
{
  colors: {
    bg: {
      primary: '#f8f7f5',    // Warm off-white
      secondary: '#f4f3f0',  // Slightly warmer
      tertiary: '#ffffff',   // Cards
    },
    text: {
      primary: '#292524',    // stone-800
      secondary: '#57534e',  // stone-600
      muted: '#78716c',      // stone-500
      accent: '#5a7a6f',     // Sage
    },
    accent: {
      primary: '#5a7a6f',    // Sage
      secondary: '#6b5a98',  // Violet
    },
    special: {
      gold: '#8a7a5a',       // Gold
    }
  },
  typography: {
    letterSpacing: {
      normal: '0.025em',     // tracking-wide
      wide: '0.2em',         // For labels
    }
  }
}
```

---

*Last updated: January 2026*
