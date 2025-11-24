# 💎 Spiralogic Diamond: Visual Design Specifications

*Design specifications for the diamond metaphor, elemental symbols, and visual identity*

---

## 🎨 The Core Visual: The Diamond

### Primary Diamond Diagram

**Concept:**
A 3D diamond with 7 visible facets, each labeled and glowing with its unique purpose.

**Structure:**
```
         ✨ (Top Point)
        EVOLVE
       /      \
      /        \
   SPIRAL     GUIDE
    /  \      /  \
   /    \    /    \
LISTEN  REFLECT  DEEPEN
   \    /    \    /
    \  /      \  /
   ENGAGE (Center)
      \      /
       \    /
    (Bottom Point)
```

**Facet Layout:**

**Top Tier (Highest Point):**
- **🧬 EVOLVE** - Apex, radiating outward

**Mid-Top Tier:**
- **🌀 SPIRAL** (Left upper)
- **🧭 GUIDE** (Right upper)

**Mid Tier (Widest):**
- **👂 LISTEN** (Far left)
- **🪞 REFLECT** (Center)
- **📓 DEEPEN** (Far right)

**Base Tier:**
- **🎭 ENGAGE** (Foundation, center bottom)

---

### Color Palette per Facet

**🎭 Engage (Foundation)**
- Primary: `#8B5CF6` (Purple 500)
- Secondary: `#7C3AED` (Purple 600)
- Glow: `#A78BFA` (Purple 400)
- Emotion: Connection, presence

**📓 Deepen (Creative)**
- Primary: `#3B82F6` (Blue 500)
- Secondary: `#2563EB` (Blue 600)
- Glow: `#60A5FA` (Blue 400)
- Emotion: Depth, introspection

**👂 Listen (Receptive)**
- Primary: `#10B981` (Green 500)
- Secondary: `#059669` (Green 600)
- Glow: `#34D399` (Green 400)
- Emotion: Awareness, noticing

**🪞 Reflect (Central)**
- Primary: `#F59E0B` (Amber 500)
- Secondary: `#D97706` (Amber 600)
- Glow: `#FCD34D` (Amber 300)
- Emotion: Illumination, clarity

**🧭 Guide (Directional)**
- Primary: `#EF4444` (Red 500)
- Secondary: `#DC2626` (Red 600)
- Glow: `#F87171` (Red 400)
- Emotion: Direction, will

**🌀 Spiral (Transformative)**
- Primary: `#EC4899` (Pink 500)
- Secondary: `#DB2777` (Pink 600)
- Glow: `#F9A8D4` (Pink 300)
- Emotion: Flow, evolution

**🧬 Evolve (Transcendent)**
- Primary: `#8B5CF6` (Purple 500) + `#3B82F6` (Blue 500) gradient
- Secondary: Iridescent, shifting
- Glow: Multi-color aura
- Emotion: Unity, emergence

---

### Animation States

**State 1: Resting (Default)**
- Gentle rotation (0.5° per second)
- Subtle pulse on all facets (60 BPM - human heart rate)
- Soft ambient glow

**State 2: Facet Active**
When user engages a facet:
- That facet brightens to 100% opacity
- Other facets dim to 40% opacity
- Active facet pulses faster (0.8s intervals)
- Light "travels" from active facet to Evolve apex

**State 3: Integration**
When multiple facets used in session:
- Active facets create light connections between them
- Geometric web of light forms
- Diamond rotates to show active side
- Evolve facet glows brighter

**State 4: Breakthrough**
When sacred moment detected:
- All facets flash in sequence (0.2s each)
- Light converges at Evolve apex
- Burst of particles emanate outward
- Brief rainbow refraction effect
- Returns to resting state with enhanced glow

---

### Technical Specifications

**3D Model:**
- Format: GLTF or FBX
- Polygons: 2000-5000 (optimized for web)
- Texture Resolution: 2048x2048 per facet
- Lighting: PBR materials (metallic + roughness)
- Transparency: Facets at 80% opacity, edges at 100%

**Web Implementation:**
- Three.js for 3D rendering
- React Three Fiber for React integration
- Framer Motion for 2D transitions
- Canvas size: 800x800px (desktop), 400x400px (mobile)
- 60 FPS target, with fallback to 2D SVG on low-end devices

**Accessibility:**
- Alt text: "The Spiralogic Diamond - seven facets for transformation"
- Each facet clickable/tabbable
- Keyboard navigation: arrow keys rotate, enter activates
- Reduced motion: Static diamond with subtle gradients

---

## 🔥 Elemental Symbols

### The Five Elements

**Fire 🔥**
**Visual:**
- Upward flame shape
- Sharp, angular geometry
- Orange-red gradient (`#FF6B35` → `#F7931E`)
- Animated: Flickering upward
- Sacred geometry: Triangle pointing up

**Water 💧**
**Visual:**
- Droplet or wave shape
- Flowing, curved geometry
- Blue-cyan gradient (`#4A90E2` → `#00C9FF`)
- Animated: Rippling, undulating
- Sacred geometry: Inverted triangle

**Earth 🌱**
**Visual:**
- Square or cube shape
- Solid, stable geometry
- Green-brown gradient (`#52A447` → `#8B6F47`)
- Animated: Grounded pulse (slow)
- Sacred geometry: Square/Cube

**Air 💨**
**Visual:**
- Spiral or swirl shape
- Light, airy geometry
- Yellow-white gradient (`#FFF9C4` → `#F4F4F4`)
- Animated: Swirling, floating
- Sacred geometry: Circle

**Aether ✨**
**Visual:**
- Star or mandala shape
- Complex, radiant geometry
- Purple-white gradient with iridescence (`#9C27B0` → `#FFFFFF`)
- Animated: Pulsing, expanding/contracting
- Sacred geometry: Merkaba or dodecahedron

---

### Elemental Balance Visualization

**Circular Mandala:**
```
         AIR
          |
          |
FIRE ----+---- WATER
          |
          |
        EARTH

     (AETHER at center)
```

**Display Format:**
- 5 concentric rings
- Each ring fills based on usage (0-100%)
- Colors blend where rings overlap
- Center (Aether) glows when all balanced
- Hovering shows exact percentages

**Balance States:**
- **Harmonious**: All within 15% of each other, center glows gold
- **Developing**: One element <50%, that section dims
- **Focused**: One element >70%, that section pulses
- **Fragmented**: Large disparity, no center glow

---

## 🌀 The Spiral Visualization

### Journey Timeline

**Concept:**
A 3D spiral going upward and inward, with markers for journal entries and conversations.

**Structure:**
```
        (Future)
           ↑
          ○ ← Current position
         /
        ○ ← Previous theme return
       /
      ○ ← Earlier session
     /
    ○ ← Initial emergence
   /
(Past)
```

**Visual Design:**
- Spiral starts wide at bottom (past)
- Tightens as it rises (present)
- Fades into light at top (future potential)
- Color gradient: Cool colors (blue/purple) at past → Warm (gold/white) at present
- Each circle = a session or journal entry

**Markers:**
- **Regular session**: Small circle
- **Recurring symbol**: Medium circle with icon
- **Breakthrough moment**: Large circle with burst
- **Same theme, deeper level**: Vertical connection between markers

**Interaction:**
- Click marker: Show that session's content
- Hover: Preview symbol/date
- Drag to rotate spiral view
- Zoom in/out for different time ranges

---

## 📊 Pattern Recognition Visuals

### Symbol Cloud

**Concept:**
Word cloud where size = frequency, position = chronological first appearance, color = transformation score association.

**Visual Design:**
- Largest symbols in center
- Smaller symbols orbit around
- Lines connect related symbols
- Color intensity = transformation scores
- Animation: Symbols gently float/drift

**Interaction:**
- Click symbol: Filter timeline to that symbol
- Hover: Show frequency count + dates
- Double-click: Show all journal entries with symbol

---

### Archetype Constellation

**Concept:**
Star constellation where each archetype is a star, connected by user's journey.

**Visual Design:**
- Each archetype = Star with unique icon
- Brightness = frequency of appearance
- Lines connect co-occurring archetypes
- Constellation shifts as patterns change
- Background: Deep space gradient

**Archetypes:**
- **Sage** ⭐ - Gold star, knowledge icon
- **Shadow** 🌑 - Dark star, crescent icon
- **Seeker** 🔍 - White star, compass icon
- **Healer** 💚 - Green star, heart icon
- **Trickster** 🎭 - Purple star, mask icon
- **Warrior** ⚔️ - Red star, shield icon
- **Mystic** 🔮 - Blue star, eye icon

---

## 🎯 UI Component Specifications

### Facet Selection Cards

**Dimensions:** 300x400px
**Layout:**
```
┌─────────────────────┐
│   [Icon - 64x64]    │
│                     │
│  FACET NAME         │
│  Brief tagline      │
│                     │
│  • Feature 1        │
│  • Feature 2        │
│  • Feature 3        │
│                     │
│  [Action Button]    │
└─────────────────────┘
```

**States:**
- **Default**: White background, subtle shadow
- **Hover**: Slight lift (4px), shadow intensifies, icon animates
- **Active**: Colored border (facet's color), filled background (10% opacity)
- **Completed**: Checkmark badge top-right

**Animation:**
- Entrance: Fade up with 0.1s stagger
- Exit: Fade down
- Transition: 0.3s ease-in-out

---

### Progress Indicators

**Circular Progress (Per Facet):**
- Ring showing completion/usage percentage
- Facet icon in center
- Color = facet's primary color
- Text below: "[X] sessions"
- Animation: Fills clockwise on update

**Linear Progress (Overall Journey):**
- Horizontal bar with 7 segments
- Each segment = one facet
- Gradient fills from left to right
- Milestones marked with icons
- Current position indicator

---

### Voice Waveform

**For Active Listening State:**
- Animated waveform reflecting audio input
- Color matches current element
- Amplitude shows voice volume
- Gentle pulse when silent (showing system is listening)
- Frequency: Real-time, 60 FPS

**States:**
- **Listening**: Active waveform
- **Processing**: Waveform morphs to loading spinner
- **Speaking**: Different waveform (Maia's "voice")
- **Paused**: Waveform freezes, dims to 50% opacity

---

## 🖼️ Landing Page Hero Visuals

### Hero Option 1: Rotating Diamond

**Layout:**
```
Left Side (40%):              Right Side (60%):
- Headline                    [3D Diamond Animation]
- Subhead                     - Slowly rotating
- 2 CTAs                      - Facets lighting up in sequence
- Trust badges                - Particle effects
```

**Animation Sequence:**
1. Diamond fades in (1s)
2. Facets light up one by one (0.5s each, 3.5s total)
3. Full diamond rotates (continuous)
4. On scroll: Diamond scales down, becomes nav icon

---

### Hero Option 2: Split Facets

**Layout:**
```
         [Large Headline]
       [Tagline/Subhead]

[Facet] [Facet] [Facet] [Facet] [Facet] [Facet] [Facet]
  🎭      📓      👂      🪞      🧭      🌀      🧬

         [Primary CTA]
       [Secondary CTA]
```

**Animation:**
- Facet cards appear in wave pattern
- Hover any card: Expands with details
- Click: Navigates to that facet's page

---

### Hero Option 3: User Journey

**Visual:**
- Split screen
- Left: Person speaking (video/illustration)
- Right: Diamond reacting in real-time
- Shows facets activating based on what's said
- Demonstrates system in action

---

## 🎨 Illustration Style Guide

### Overall Aesthetic

**Style:**
- Geometric with organic touches
- Minimalist but not stark
- Sacred geometry influenced
- Light and shadow play important
- Depth through layering

**Avoid:**
- Overly abstract/unrecognizable
- Too literal/medical
- Corporate stock imagery
- Aggressive/harsh angles
- Cluttered compositions

---

### Icon Style

**Specifications:**
- Size: 24x24px (UI), 64x64px (feature), 128x128px (hero)
- Stroke width: 2px (24px), 3px (64px), 4px (128px)
- Corners: 2px radius (slightly rounded)
- Style: Outlined (not filled) for most
- Filled: Only for active/selected states

**Design Principles:**
- Recognizable at small sizes
- Consistent visual weight
- Works in light and dark modes
- Scalable vector (SVG)

---

### Character Design: Maia

**Visual Concept:**
Maia doesn't need a human face—she's presence, not person.

**Option 1: Abstract Avatar**
- Flowing, nebulous form
- Colors shift based on active element
- Gentle animation (breathing effect)
- Grows/shrinks with speaking

**Option 2: Geometric Mandala**
- Sacred geometry pattern
- 7 sections (one per facet)
- Rotates and pulses
- Active facet section glows

**Option 3: Light Being**
- Ethereal light form
- No defined shape
- Responds to voice with ripples
- Pure presence

**Not Recommended:**
- Human face (creates expectation of person)
- Robot/android (too mechanical)
- Animal/creature (too literal)

---

## 📱 Mobile-Specific Designs

### Responsive Diamond

**Mobile (<768px):**
- 2D diamond diagram (top-down view)
- Hexagon with facets as sections
- Tap facet to expand details
- Swipe to rotate view
- Simplified animations (battery-friendly)

**Tablet (768-1024px):**
- Simplified 3D diamond
- Side-view with 4-5 visible facets
- Pinch to zoom
- Two-finger rotation

---

### Mobile Navigation

**Bottom Tab Bar:**
```
[Engage] [Deepen] [Reflect] [Guide] [More]
  🎭       📓       🪞       🧭      •••
```

**More Menu Contains:**
- Listen
- Spiral (Timeline)
- Evolve (Progress)
- Settings
- Help

---

## 🌐 Dark Mode Specifications

### Color Adjustments

**Background:**
- Light mode: `#FFFFFF` → `#F9FAFB` (neutral 50)
- Dark mode: `#111827` → `#1F2937` (neutral 900)

**Diamond:**
- Light mode: 80% opacity, white base
- Dark mode: 90% opacity, slight blue tint (#1E293B base)

**Facets:**
- Light mode: Saturated colors
- Dark mode: Slightly desaturated, increased luminosity

**Text:**
- Light mode: `#111827` (neutral 900)
- Dark mode: `#F9FAFB` (neutral 50)

**Shadows:**
- Light mode: Black 10% opacity
- Dark mode: Black 40% opacity + colored glow on interactive elements

---

## 🎬 Animation Library

### Microinteractions

**Button Hover:**
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
hover: transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1);
```

**Card Reveal:**
```css
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.4, ease: "easeOut" }
```

**Facet Activation:**
```css
scale: 1 → 1.05 → 1
duration: 0.6s
easing: spring(stiffness: 300, damping: 20)
```

**Loading State:**
- Diamond spins slowly
- Facets pulse in sequence
- Particle trail follows rotation

---

## 📐 Layout Grid

### Desktop (>1280px)
- 12-column grid
- Gutter: 24px
- Max content width: 1280px
- Padding: 40px

### Tablet (768-1280px)
- 8-column grid
- Gutter: 20px
- Max content width: 100%
- Padding: 32px

### Mobile (<768px)
- 4-column grid
- Gutter: 16px
- Max content width: 100%
- Padding: 20px

---

## 🎨 Typography Scale

**Headings:**
- H1: 48px / 56px (desktop), 36px / 44px (mobile)
- H2: 36px / 44px (desktop), 28px / 36px (mobile)
- H3: 24px / 32px (desktop), 20px / 28px (mobile)

**Body:**
- Large: 18px / 28px
- Regular: 16px / 24px
- Small: 14px / 20px
- Tiny: 12px / 16px

**Font:**
- Primary: Inter (sans-serif)
- Mono: JetBrains Mono (for code/data)
- Display: Optional serif for marketing headlines

---

## 🖌️ Design Assets Checklist

### For Development:
- [ ] Diamond 3D model (GLTF)
- [ ] Facet icons (SVG, all sizes)
- [ ] Element icons (SVG, animated)
- [ ] Loading states (Lottie JSON)
- [ ] Illustration set (SVG)
- [ ] Photography (if used)
- [ ] Favicon set (all sizes)
- [ ] Social share images (Open Graph)
- [ ] App icons (iOS/Android)

### For Marketing:
- [ ] Hero visuals (PNG, high-res)
- [ ] Diagram exports (SVG + PNG)
- [ ] Video assets (MP4, WebM)
- [ ] Presentation deck graphics
- [ ] Print materials (PDF, CMYK)

---

*All design specifications ready for implementation. Contact design team for asset creation.* ✨💎

**Last Updated:** 2025-09-27
**Version:** Visual Design Specs v1.0