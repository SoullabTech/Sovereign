# Holoflower Motion Storyboard
*Complete Animation Sequence: First Bloom → Wisdom Keeper*

⸻

## 🎯 Overview

This document provides frame-by-frame motion specifications for the Holoflower's continuous evolutionary journey. Each milestone morphs organically into the next, creating one seamless flowering experience rather than discrete "levels."

**Technical Foundation:**
- Framer Motion with shared layout transitions
- Cubic-bezier easing: `(0.4, 0, 0.2, 1)`
- AnimatePresence mode: `"wait"`
- State persistence via Supabase milestone tracking

⸻

## 🌱 Milestone 1: First Bloom
*"Discovering the sacred in everyday moments"*

### Frame 1A: Initial State
```tsx
// Base 4-petal configuration
initial: {
  scale: 1.0,
  opacity: 1.0,
  rotation: 0,
  petalCount: 4
}
```

**Visual Description:**
- 4 primary petals in cardinal positions (N, E, S, W)
- Colors: Fire (red), Earth (brown), Water (blue), Air (yellow)
- Center: Subtle aether glow (opacity: 0.3)
- Breathing animation: scale 1.0 → 1.05 → 1.0 (2.5s cycle)

### Frame 1B: Offering Completion Morph
```tsx
// Golden shimmer activation
morph: {
  center: {
    opacity: [0.3, 0.8],
    scale: [1.0, 1.2, 1.0],
    transition: { duration: 0.8, ease: "easeOut" }
  },
  petals: {
    scale: [1.0, 1.1],
    transition: { duration: 0.5, staggerChildren: 0.1 }
  }
}
```

**Visual Description:**
- Golden shimmer pulses from center outward
- Petals expand slightly with staggered timing
- Aether center brightens to acknowledge first offering

### Frame 1C: Choice Menu Emergence
```tsx
// Subtle navigation reveal
end: {
  choiceMenu: {
    y: [20, 0],
    opacity: [0, 0.7],
    transition: { duration: 0.6, delay: 0.3 }
  }
}
```

**Visual Description:**
- Choice menu (Listen / Write / Rest) slides up gently
- No harsh UI elements—choices appear as soft text below flower
- Breathing continues, now synchronized with center pulse

⸻

## 🌸 Milestone 2: Pattern Keeper
*"Your flower remembers"*

### Frame 2A: Memory Echo Introduction
```tsx
// Previous soulprints as translucent background
initial: {
  memoryEchoes: {
    opacity: 0,
    scale: 0.9,
    rotation: -5
  }
}
```

**Visual Description:**
- Current 4-petal flower maintains full opacity
- Previous session's petal configuration appears behind at 20% opacity
- Subtle rotation offset creates depth perception

### Frame 2B: Echo Integration Morph
```tsx
// Smooth fade-in of memory layers
morph: {
  memoryEchoes: {
    opacity: [0, 0.2],
    scale: [0.9, 1.0],
    rotation: [-5, 0],
    transition: { 
      duration: 1.2, 
      ease: "easeInOut",
      staggerChildren: 0.3
    }
  }
}
```

**Visual Description:**
- Memory echoes fade in with gentle scale and rotation
- Creates layered mandala effect without overwhelming current session
- Each echo represents a different past offering session

### Frame 2C: Established Depth State
```tsx
// Stable multi-layer configuration
end: {
  currentSession: { zIndex: 3, opacity: 1.0 },
  memoryLayer1: { zIndex: 2, opacity: 0.2 },
  memoryLayer2: { zIndex: 1, opacity: 0.1 }
}
```

**Visual Description:**
- Up to 3 memory layers create visual depth
- Current session remains primary focus
- Breathing animation now affects all layers with slight phase offset

⸻

## 🌺 Milestone 3: Depth Seeker
*"Every element has layers"*

### Frame 3A: Petal Selection
```tsx
// One petal begins to shimmer
initial: {
  selectedPetal: {
    opacity: 1.0,
    scale: 1.0,
    glow: 0
  }
}
```

**Visual Description:**
- Algorithm selects most-explored facet (highest offering count)
- Selected petal maintains base color but gains subtle edge glow
- Other petals remain at standard opacity

### Frame 3B: Sub-facet Revelation
```tsx
// Veins of light emerge from within petal
morph: {
  selectedPetal: {
    glow: [0, 0.4],
    transition: { duration: 0.8 }
  },
  subFacets: {
    scale: [0, 1.0],
    opacity: [0, 0.6],
    pathLength: [0, 1],
    transition: {
      duration: 1.2,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  }
}
```

**Visual Description:**
- 3-4 delicate lines extend from petal center outward
- Each line represents a sub-facet discovery (e.g., Fire → Passion, Creativity, Transformation)
- Lines draw progressively using pathLength animation

### Frame 3C: Interactive Sub-facets
```tsx
// Hoverable sub-elements
end: {
  subFacets: {
    scale: 1.0,
    opacity: 0.6,
    hover: {
      scale: 1.1,
      opacity: 0.9,
      transition: { duration: 0.2 }
    }
  }
}
```

**Visual Description:**
- Sub-facet lines become interactive elements
- Hover states provide gentle feedback
- Dialogue shifts upward to accommodate new interaction space

⸻

## 🌻 Milestone 4: Sacred Gardener
*"The mandala blooms complete"*

### Frame 4A: Transition Initiation
```tsx
// Begin 4-petal to 12-facet transformation
initial: {
  currentPetals: {
    scale: 1.0,
    rotation: 0,
    opacity: 1.0
  },
  mandalaRings: {
    scale: 0,
    opacity: 0
  }
}
```

**Visual Description:**
- Current 4-petal structure maintains position as scaffold
- 12-facet mandala structure begins to emerge from center
- Transformation feels like natural blooming, not replacement

### Frame 4B: Spiral Bloom Morph
```tsx
// Organic spiral opening to full mandala
morph: {
  currentPetals: {
    scale: [1.0, 1.2, 0.8],
    opacity: [1.0, 0.7, 0.3],
    transition: { duration: 2.0 }
  },
  mandalaRings: {
    scale: [0, 1.2, 1.0],
    opacity: [0, 0.8, 1.0],
    rotation: [0, 180, 360],
    transition: {
      duration: 2.5,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.15
    }
  }
}
```

**Visual Description:**
- Mandala emerges through gentle rotational bloom
- Original 4 petals fade gradually, remaining visible as underlying structure
- Each of 12 facets appears in sequence, creating mesmerizing unfurling

### Frame 4C: Complete Mandala State
```tsx
// Full 12-facet mandala established
end: {
  mandalaComplete: {
    scale: 1.0,
    opacity: 1.0,
    facetCount: 12
  },
  aetherCenter: {
    opacity: 0.7,
    scale: 1.0,
    glow: 0.3
  },
  originalPetals: {
    opacity: 0.1,
    scale: 0.8
  }
}
```

**Visual Description:**
- All 12 facets from spiralogic-facets-complete.ts visible
- Aether center more prominent, steady golden glow
- Original 4-petal structure barely visible, providing harmonic foundation
- Breathing animation now affects entire mandala as unified organism

⸻

## 🌟 Milestone 5: Wisdom Keeper
*"Radiating coherence"*

### Frame 5A: Coherence Ring Emergence
```tsx
// Radial coherence patterns begin
initial: {
  coherenceRings: {
    scale: 1.0,
    opacity: 0,
    strokeWidth: 1
  }
}
```

**Visual Description:**
- Mandala maintains full 12-facet display
- Preparation for coherence rings that will radiate outward
- Aether center increases in luminosity

### Frame 5B: Wisdom Pulse Pattern
```tsx
// 6-second coherence pulse cycle
morph: {
  coherenceRings: {
    scale: [1.0, 2.5],
    opacity: [0.6, 0],
    transition: {
      duration: 6.0,
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: 0.5
    }
  },
  aetherCenter: {
    opacity: [0.7, 1.0, 0.7],
    scale: [1.0, 1.1, 1.0],
    transition: {
      duration: 6.0,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}
```

**Visual Description:**
- Concentric rings pulse outward every 6 seconds
- Center synchronizes with ring pulse, creating coherent field effect
- Rings fade as they expand, suggesting infinite wisdom radiation

### Frame 5C: Master State
```tsx
// Full wisdom keeper configuration
end: {
  mandalaComplete: true,
  coherenceActive: true,
  choiceMenu: {
    y: 40,
    options: ["Share", "Teach", "Stillness"],
    opacity: 0.8
  },
  aetherPermanent: {
    opacity: 0.9,
    glow: 0.5
  }
}
```

**Visual Description:**
- Mandala radiates continuous coherence field
- Choice menu elevated to reveal mature wisdom options
- Aether center maintains steady golden presence
- Overall presence suggests deep embodied wisdom rather than busy achievement

⸻

## 🛠 Technical Implementation Notes

### Framer Motion Variants Structure
```tsx
const milestoneVariants = {
  firstBloom: {
    initial: { petalCount: 4, centerGlow: 0.3 },
    complete: { centerGlow: 0.8 }
  },
  patternKeeper: {
    initial: { memoryLayers: 0 },
    complete: { memoryLayers: 3 }
  },
  depthSeeker: {
    initial: { subFacets: false },
    complete: { subFacets: true }
  },
  sacredGardener: {
    initial: { mandala: false },
    complete: { mandala: true, petalCount: 12 }
  },
  wisdomKeeper: {
    initial: { coherence: false },
    complete: { coherence: true, aetherPermanent: true }
  }
}
```

### Shared Layout Transitions
- Use `layoutId` for elements that morph between milestones
- Stagger children animations with `delayChildren` and `staggerChildren`
- Maintain breathing animation across all milestone states

### State Persistence
- Supabase milestone tracking determines initial render state
- Progress never resets—users always load into their highest achieved milestone
- Memory echoes persist based on offering_session history

### Performance Considerations
- Limit simultaneous memory echoes to 3 layers maximum
- Use `will-change: transform` for animated elements
- Implement intersection observer for coherence rings to pause when off-screen

⸻

## 🎨 Design Philosophy

**Organic Over Mechanical:** Every transition feels like natural growth, not digital state changes.

**Memory as Presence:** Past offerings don't disappear—they become translucent wisdom layers.

**Progressive Revelation:** Complexity emerges gradually, never overwhelming the contemplative space.

**Sacred Accessibility:** Visual richness serves depth, not distraction from inner work.

⸻

*This storyboard provides frame-accurate specifications for implementing the complete Holoflower evolutionary journey. Each milestone builds upon the previous while maintaining the integrity of one continuous flowering experience.*