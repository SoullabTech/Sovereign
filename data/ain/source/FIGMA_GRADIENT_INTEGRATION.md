# Soullab Figma Gradient Integration Guide

## 🎨 Gradient Tokens for Figma

### Color Styles Setup

**Create these gradient styles in your Figma library:**

```
📁 Gradients
  📁 Primary
    ├── Gradient/Warmth (135°, #b85f42 → #f28c15)
    ├── Gradient/Nature (135°, #6a8f6b → #1c94b3)
    ├── Gradient/Earth (135°, #b85f42 → #6a8f6b)
    └── Gradient/Sunset (135°, #f28c15 → #1c94b3)
  
  📁 Subtle
    ├── Background/Warmth-Light (135°, #faf4f2 → #fff9f0)
    ├── Background/Nature-Light (135°, #f4f7f4 → #f2f7f9)
    ├── Background/Earth-Light (135°, #faf4f2 → #f4f7f4)
    └── Background/Sunset-Light (135°, #fff9f0 → #f2f7f9)
  
  📁 Dark Mode
    ├── Background/Warmth-Dark (135°, #5c2a1f → #7e3806)
    ├── Background/Nature-Dark (135°, #273627 → #0a414d)
    ├── Background/Earth-Dark (135°, #5c2a1f → #273627)
    └── Background/Sunset-Dark (135°, #7e3806 → #0a414d)
  
  📁 Aura (Radial)
    ├── Aura/Terracotta (radial, #c97a5c 40% → transparent 70%)
    ├── Aura/Sage (radial, #85a985 40% → transparent 70%)
    ├── Aura/Ocean (radial, #4baec9 40% → transparent 70%)
    └── Aura/Amber (radial, #f8a93e 40% → transparent 70%)
```

### Mesh Gradients

**Complex multi-point gradients for hero sections:**

1. **Mesh/Harmony** (4 radial gradients):
   - Point 1 (20%, 30%): Terracotta 300 @ 30% opacity
   - Point 2 (80%, 20%): Sage 300 @ 30% opacity  
   - Point 3 (40%, 60%): Ocean 300 @ 30% opacity
   - Point 4 (90%, 70%): Amber 300 @ 30% opacity

2. **Mesh/Balance** (3 radial gradients):
   - Point 1 (10%, 20%): Sage 200 @ 40% opacity
   - Point 2 (90%, 80%): Ocean 200 @ 40% opacity
   - Point 3 (50%, 50%): Amber 200 @ 30% opacity

## 🖼️ Example Frames & Components

### Frame 1: Attune Panel Live Preview

**Component Structure:**
```
📦 AttunePanel/LivePreview
├── Background: Rectangle with Background/Warmth-Light
├── Maia Avatar: 32×32 circle with Gradient/Warmth
├── Pulse Ring: 48×48 circle with Aura/Amber (animated)
└── Message Bubble: White with subtle Gradient/Earth border
```

**Animation Specs:**
- Pulse Ring: Scale 1.0 → 1.2 → 1.0 (2s ease-in-out, repeat)
- Background: Transitions between tone gradients (0.6s ease)

### Frame 2: Voice Recorder States

**Idle State:**
- Mic Icon: Solid terracotta 500
- Background: White with subtle Aura/Ocean

**Listening State:**
- Mic Icon: Gradient/Nature
- Background: 3 concentric Aura/Sage rings (animated)
- Animation: Rings scale outward sequentially (1.6s cycle)

**Speaking State:**
- Mic Icon: Gradient/Warmth
- Background: Pulsing Aura/Amber
- Animation: Breathing effect (1.2s in/out)

### Frame 3: Dashboard Cards

**Analytics Card:**
```
📦 DashboardCard
├── Background: Background/Nature-Light
├── Header: Gradient/Nature underline (2px)
├── Chart Area: White with Gradient/Earth accent bars
└── Status Badge: Aura/Sage with white text
```

**Reflection Card:**
```
📦 ReflectionCard  
├── Background: Background/Warmth-Light
├── Content: White background
├── Feeling Tags: Individual Aura gradients per emotion
└── Submit Button: Gradient/Sunset with white text
```

### Frame 4: Theme Toggle Component

**Light Mode Button:**
- Background: Background/Sunset-Light
- Icon: Gradient/Amber sun
- Active Border: 2px Gradient/Warmth

**Dark Mode Button:**
- Background: Background/Nature-Dark
- Icon: Gradient/Ocean moon
- Active Border: 2px Gradient/Nature

**System Mode Button:**
- Background: Split gradient (Light/Dark blend)
- Icon: Gradient/Earth monitor
- Active Border: 2px animated gradient cycle

### Frame 5: Beta Control Room Overview

**Header Section:**
- Background: Mesh/Harmony
- Title: White text with Aura/Amber glow
- Alert Badges: Status-appropriate gradients

**Metric Cards:**
```
📦 MetricCard
├── Background: White
├── Border: 1px Aura/Ocean (subtle)
├── Icon Background: Corresponding Aura gradient
├── Trend Arrow: Gradient/Nature (up) or Gradient/Terracotta (down)
└── Hover State: Background/Subtle + lifted shadow
```

**Combined Chart:**
- Background: White
- Grid Lines: Neutral gray
- Data Lines: Primary gradients (Nature, Warmth, Earth, Sunset)
- Hover Points: Aura gradients

## 📐 Motion Specifications

### Breathing Animations
```
Aura Pulse:
- Duration: 2000ms
- Easing: ease-in-out
- Scale: 1.0 → 1.15 → 1.0
- Opacity: 0.4 → 0.8 → 0.4
- Infinite repeat
```

### Gradient Transitions
```
Tone Changes:
- Duration: 600ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Property: background (gradient values)
- No intermediate frames (direct interpolation)
```

### Sequential Reveals
```
Card Grid Animation:
- Stagger: 150ms between cards
- Initial: opacity 0, y: 20px
- Final: opacity 1, y: 0px
- Easing: ease-out
```

## 🚫 Design Constraints

### Never Use:
- Purple, violet, magenta gradients
- Neon or saturated rainbow effects
- Hard gradient stops (always blend smoothly)
- More than 4 colors in a single gradient
- Gradients on small text (readability)

### Always Include:
- 135° angle for linear gradients (consistent direction)
- 40-70% opacity for aura effects
- White or very light backgrounds under gradients
- Sufficient contrast for accessibility (WCAG AA)

## 🔧 Developer Handoff Notes

**For each gradient component:**
1. Figma gradient → CSS gradient mapping
2. Animation duration/easing specifications
3. Responsive behavior notes
4. Dark mode variations
5. Interaction state definitions

**Example Handoff:**
```
Component: Maia Avatar
Background: Gradient/Warmth
CSS: background: linear-gradient(135deg, #b85f42 0%, #f28c15 100%)
Animation: Pulse aura every 2s
Hover: Scale 1.05, add Aura/Amber shadow
```

## 📱 Responsive Considerations

**Mobile Adaptations:**
- Reduce gradient complexity on small screens
- Use solid colors + subtle gradients instead of mesh
- Maintain aura effects but reduce intensity
- Ensure touch targets remain clearly defined

**Tablet Adjustments:**
- Full gradient system supported
- Slightly reduced animation intensity
- Maintain all interactive gradient effects

This integration ensures perfect design-developer alignment and maintains the sacred, professional aesthetic throughout all Soullab interfaces.