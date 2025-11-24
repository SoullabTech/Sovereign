# Soullab Design System

Professional, grounded design tokens and gradients for the Soullab brand.

## Color Palette

The Soullab palette consists of four primary colors, each with a full shade range (50-900):

- **Terracotta** (`#b85f42`): Warm earth tone for alerts, emphasis
- **Sage** (`#6a8f6b`): Natural green for success, growth
- **Ocean** (`#1c94b3`): Deep blue for primary actions, trust
- **Amber** (`#f28c15`): Golden accent for highlights, warmth

## Usage Examples

### In React Components

```tsx
import { soullabColors } from '@/lib/theme/soullabColors'
import { soullabGradients } from '@/lib/theme/soullabGradients'

// Solid colors
<div style={{ backgroundColor: soullabColors.ocean[500] }}>
  Ocean background
</div>

// Gradients
<div style={{ background: soullabGradients.warmth }}>
  Terracotta to Amber gradient
</div>
```

### In Framer Motion

```tsx
<motion.div
  animate={{ 
    background: soullabGradients.natureShift['50%']
  }}
  transition={{ duration: 2, ease: "easeInOut" }}
/>
```

### In Charts (Recharts)

```tsx
const chartColors = [
  soullabColors.terracotta[500],
  soullabColors.sage[500],
  soullabColors.ocean[500],
  soullabColors.amber[500],
]

<Area fill={soullabColors.ocean[200]} stroke={soullabColors.ocean[500]} />
```

### CSS Custom Properties

```css
:root {
  --soullab-terracotta: #b85f42;
  --soullab-sage: #6a8f6b;
  --soullab-ocean: #1c94b3;
  --soullab-amber: #f28c15;
  
  --gradient-warmth: linear-gradient(135deg, #b85f42 0%, #f28c15 100%);
  --gradient-nature: linear-gradient(135deg, #6a8f6b 0%, #1c94b3 100%);
}
```

## Available Gradients

### Primary Gradients
- `warmth`: Terracotta → Amber (energetic, passionate)
- `nature`: Sage → Ocean (calming, flowing)
- `earth`: Terracotta → Sage (grounded, natural)
- `sunset`: Amber → Ocean (dynamic, transformative)

### Subtle Backgrounds
- `warmthSubtle`: Light terracotta → light amber
- `natureSubtle`: Light sage → light ocean
- `earthSubtle`: Light terracotta → light sage
- `sunsetSubtle`: Light amber → light ocean

### Auras & Glows
```tsx
// For orbs, button hovers, focus states
<div style={{ background: soullabGradients.aura.ocean }}>
  Subtle ocean glow
</div>
```

### Mesh Gradients
Complex multi-point gradients for rich backgrounds:
- `mesh.harmony`: 4-color balanced composition
- `mesh.balance`: 3-color centered design

## Theme Integration

### Tone-Based Gradients
```tsx
import { toneGradients } from '@/lib/theme/soullabGradients'

// In AttunePanel or voice components
const backgroundForTone = {
  grounded: toneGradients.grounded,
  balanced: toneGradients.balanced, 
  poetic: toneGradients.poetic,
}
```

### Theme-Aware Backgrounds
```tsx
import { themeBackgrounds } from '@/lib/theme/soullabGradients'

const isDark = theme === 'dark'
const bg = isDark ? themeBackgrounds.dark.primary : themeBackgrounds.light.primary
```

## Best Practices

1. **Subtle First**: Use subtle gradients for backgrounds, bold for accents
2. **Consistent Direction**: Most gradients use 135° for visual harmony
3. **Semantic Colors**: 
   - Terracotta for alerts, warnings
   - Sage for success, completion
   - Ocean for primary actions, links
   - Amber for highlights, active states
4. **Accessibility**: All color combinations meet WCAG AA contrast requirements
5. **Performance**: Gradients are CSS-only, no additional assets needed

## Animation Examples

```tsx
// Gentle pulsing aura
<motion.div
  animate={{
    background: [
      soullabGradients.aura.amber,
      soullabGradients.aura.terracotta,
      soullabGradients.aura.amber,
    ],
  }}
  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
/>

// Gradient shift animation
<div className="animate-gradient-shift">
  Content with shifting background
</div>
```

```css
@keyframes gradient-shift {
  0% { background: var(--gradient-warmth); }
  50% { background: var(--gradient-nature); }
  100% { background: var(--gradient-warmth); }
}

.animate-gradient-shift {
  animation: gradient-shift 6s ease-in-out infinite;
  background-size: 200% 200%;
}
```