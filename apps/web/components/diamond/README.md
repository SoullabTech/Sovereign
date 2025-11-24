# 💎 Diamond System Visualizations

Complete set of diamond visualization components for the Spiralogic Diamond system.

---

## Components

### 1. **InteractiveDiamondSystem.tsx**
*Full-featured interactive React component*

**Features:**
- Hover effects on facets
- Click to see detailed descriptions
- Animated transitions
- Shows connections between facets
- Responsive design
- Dark-amber aesthetic

**Usage:**
```tsx
import InteractiveDiamondSystem from '@/components/diamond/InteractiveDiamondSystem';

export default function Page() {
  return <InteractiveDiamondSystem />;
}
```

**Where to use:**
- `/diamond` - Dedicated diamond page
- Onboarding flow
- Marketing landing pages
- Beta tester education

---

### 2. **DiamondSystemStatic.tsx**
*Lightweight static version*

**Features:**
- No interactivity, pure visual
- Three sizes (sm, md, lg)
- Optional labels
- Minimal bundle size
- Fast rendering

**Usage:**
```tsx
import DiamondSystemStatic from '@/components/diamond/DiamondSystemStatic';

// Small with labels
<DiamondSystemStatic size="sm" showLabels={true} />

// Large without labels
<DiamondSystemStatic size="lg" showLabels={false} />

// Medium (default)
<DiamondSystemStatic />
```

**Where to use:**
- Email templates
- Loading screens
- Quick reference
- Dashboard widgets
- Social media graphics (screenshot it)

---

### 3. **diamond-system.html**
*Standalone HTML file (no dependencies)*

**Features:**
- Pure HTML/CSS/JavaScript
- No build process needed
- Click interaction
- Fully responsive
- Can be used anywhere

**Where to use:**
- Embed in non-React sites
- Share as standalone page
- Email HTML version
- Quick demos
- Marketing microsites

**Access:**
```
http://localhost:3000/diamond-system.html
```

---

## Page Routes

### `/diamond`
Full interactive experience with additional context:
- Interactive diamond visualization
- "Like a Diamond" explanation
- "The Sacred Loop" diagram
- Quote section

**Perfect for:**
- First-time users
- Beta tester education
- Sharing link on social media
- Onboarding step

---

## Color Palette

Each facet has a unique color representing its elemental/thematic essence:

| Facet | Icon | Color | Hex |
|-------|------|-------|-----|
| **Engage** | 🔥 | Fire Red-Orange | `#ff6b35` |
| **Deepen** | 💧 | Water Blue | `#4a90e2` |
| **Listen** | 💨 | Air Gold | `#e8d5a0` |
| **Reflect** | 🪞 | Aether Amber | `#d4b896` |
| **Guide** | 🌱 | Earth Green | `#7cb342` |
| **Spiral** | 🌀 | Mystic Purple | `#9b59b6` |
| **Evolve** | 🧬 | Evolution Pink | `#e91e63` |

---

## Positions

Diamond shape coordinates (% based):

```
        Engage (50%, 10%)
              /  \
    Spiral   /    \   Deepen
   (20%,30%) \    / (80%, 30%)
              \  /
           Evolve (50%, 50%)
              /  \
    Guide    /    \   Listen
   (20%,70%) \    / (80%, 70%)
              \  /
        Reflect (50%, 90%)
```

---

## Integration Examples

### In Onboarding

```tsx
'use client';

import InteractiveDiamondSystem from '@/components/diamond/InteractiveDiamondSystem';

export default function OnboardingStep() {
  return (
    <div>
      <h2>Welcome to the Spiralogic Diamond</h2>
      <p>Seven facets working together for your becoming</p>
      <InteractiveDiamondSystem />
      <button>Continue to Next Step</button>
    </div>
  );
}
```

### In Dashboard Widget

```tsx
import DiamondSystemStatic from '@/components/diamond/DiamondSystemStatic';

export default function DashboardWidget() {
  return (
    <div className="p-4 bg-black/40 rounded-lg">
      <h3 className="mb-4">Your Diamond</h3>
      <DiamondSystemStatic size="sm" />
      <p className="mt-2 text-xs">All 7 facets active</p>
    </div>
  );
}
```

### In Email (Static HTML)

Copy the SVG + CSS from `diamond-system.html` into your email template.

---

## Customization

### Changing Colors

Edit the `facets` array in any component:

```tsx
const facets = [
  {
    id: 'engage',
    color: '#your-color-here', // Change this
    // ...
  },
];
```

### Adding More Facets

To add an 8th facet:

1. Add to `facets` array with position
2. Add corresponding detail panel
3. Update connection lines in SVG
4. Adjust diamond geometry as needed

### Removing Labels

```tsx
<DiamondSystemStatic showLabels={false} />
```

### Custom Styling

All components accept `className` prop:

```tsx
<InteractiveDiamondSystem className="my-custom-class" />
```

---

## Performance Notes

**InteractiveDiamondSystem:**
- Uses Framer Motion for animations
- ~50KB gzipped with dependencies
- Renders 7 facets + connections = ~100 DOM nodes

**DiamondSystemStatic:**
- No animation library
- ~5KB gzipped
- Renders 7 facets = ~30 DOM nodes
- Faster initial render

**diamond-system.html:**
- Zero dependencies
- ~8KB file size
- Works in any browser
- No build required

---

## Accessibility

All components include:
- Semantic HTML
- Keyboard navigation (interactive version)
- Screen reader friendly labels
- High contrast colors
- Reduced motion support (where applicable)

To improve:
- Add ARIA labels to facets
- Add keyboard shortcuts
- Add focus indicators
- Test with screen readers

---

## Mobile Considerations

- All components are responsive
- Touch-friendly tap targets (48px min)
- Scales gracefully on small screens
- Labels adjust font size by breakpoint

Test on:
- iPhone (375px width)
- Android (360px width)
- Tablet (768px width)

---

## Export Options

### For Social Media

1. Navigate to `/diamond`
2. Take screenshot
3. Use as Instagram/Twitter post

### For Print

1. Open `/diamond-system.html`
2. Print to PDF
3. High resolution for printing

### For Presentations

1. Use `DiamondSystemStatic` component
2. Screenshot at 2x scale
3. Import into Keynote/PowerPoint

---

## Future Enhancements

Potential additions:
- [ ] 3D rotating diamond (Three.js)
- [ ] Progress tracking on each facet
- [ ] Real-time data integration (show usage)
- [ ] Animated flow between facets
- [ ] VR/AR version
- [ ] Audio explanations on hover
- [ ] Particle effects for breakthroughs
- [ ] Dark/light theme toggle

---

## License

Part of Sacred Mirror / Soullab system.

---

*"Like a diamond formed under pressure, your transformation is precious, multifaceted, and unbreakable."*

**Last Updated:** 2025-09-27
**Version:** 1.0