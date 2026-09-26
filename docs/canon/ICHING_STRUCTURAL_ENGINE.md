---
level: architecture
---

# I Ching Structural Engine

> Use the I Ching to **know what is happening**.
> Use Classical Chinese (Daoist logic) to **speak in a way that lets it unfold**.

## Architecture: Two-Layer Guidance System

### Layer A -- I Ching (Structure / State Engine)

Role:
- Detect **state, transition, and movement**
- Provide **situational intelligence**

What it answers:
- *Where am I in the process?*
- *What is changing?*
- *What is the right posture now?*

### Layer B -- Classical Chinese (Expression / Voice Field)

Role:
- Deliver the response in a way that:
  - preserves ambiguity
  - invites participation
  - avoids over-definition

What it does:
- Shapes **how insight is spoken**, not what is concluded

---

## Core Loop

### Step 1 -- Detect movement (Spiralogic + input)
User input -> facet detection (existing system)

### Step 2 -- Map to I Ching state
Each facet + phase corresponds to 1-3 primary hexagrams with transitions (changing lines)

### Step 3 -- Extract guidance pattern
From the hexagram:
- **Image** (symbolic situation)
- **Judgment** (orientation)
- **Line** (specific movement)

### Step 4 -- Translate into Daoist voice
Convert structured meaning into minimal phrasing, paradox, image-based language

---

## Elemental Alignment

| Element    | I Ching       | Chinese logic         |
| ---------- | ------------- | --------------------- |
| Water      | danger, depth | yielding              |
| Fire       | illumination  | clarity without force |
| Earth      | receptivity   | holding               |
| Air (Wind) | penetration   | subtle influence      |
| Aether     | Tao           | the unnamed           |

---

## Concrete Example

**Input:** User feels stuck, circling the same emotional pattern

**System detects:** Water 2 (descent / emotional immersion)

**I Ching mapping:** Hexagram 29 (The Abysmal / Water)
- Repetition of danger
- Learning through immersion
- No escape -- only skillful navigation

**Raw interpretation (not shown to user):**
- You are in a repeating emotional pattern
- Progress comes through *learning to move within it*, not escaping it

**Daoist-style output:**
> "You are already inside it.
> Leaving is not the way through.
> Learn how the current moves --
> and it will begin to carry you."

---

## Function Stack

| Function                  | System            |
| ------------------------- | ----------------- |
| Dynamic state detection   | Spiralogic        |
| Archetypal pattern engine | I Ching           |
| Linguistic delivery field | Classical Chinese |

---

## Design Constraints (Critical)

Do NOT:
- Expose hexagram numbers by default
- Over-explain meanings
- Turn this into "fortune telling"

This is not: "You got Hexagram 29"
This is: "Here is how reality is moving right now."

---

## Advanced Layers (Future)

### Changing lines -> micro-guidance
Gives precision without verbosity

### Multi-hexagram blending
Reflects complex states (already tracked via Spiralogic multi-element)

### Personal pattern memory
Same hexagram recurring -> pattern recognition

---

## Implementation Types

```typescript
type HexagramMeaning = {
  image: string       // symbolic situation
  principle: string   // orientation
  guidance: string    // specific movement
}
```

## Facet-to-Hexagram Seed Map

```typescript
const facetToHexagram: Record<string, number[]> = {
  "fire_1":   [51],  // The Arousing (Thunder) -- shock of beginning
  "fire_2":   [30],  // The Clinging (Fire) -- clarity, direction
  "fire_3":   [14],  // Possession in Great Measure -- radiance shared
  "water_1":  [48],  // The Well -- feeling stirs from depth
  "water_2":  [29],  // The Abysmal -- immersion, repetition
  "water_3":  [63],  // After Completion -- integration, renewal
  "earth_1":  [23],  // Splitting Apart -- form emerging from dissolution
  "earth_2":  [2],   // The Receptive -- stabilization, holding
  "earth_3":  [46],  // Pushing Upward -- embodied manifestation
  "air_1":    [20],  // Contemplation -- seeing what is
  "air_2":    [57],  // The Gentle (Wind) -- penetrating clarity
  "air_3":    [50],  // The Caldron -- meaning transformed
  "aether_1": [52],  // Keeping Still -- space opens
  "aether_2": [11],  // Peace -- boundaries soften
  "aether_3": [1, 2] // Creative + Receptive -- unity
}
```

## Oracle Integration Point

Flow becomes:
1. `detectFacetFromInput()` -- existing
2. `mapToHexagram()` -- new
3. `generateInsight()` -- hexagram meaning extraction
4. `applyDaoistVoice()` -- voice transformation layer
5. Final response
