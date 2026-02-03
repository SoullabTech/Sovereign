# Astrology Lens Selector — Feature Specification

## Overview

Allow members to choose which astrological lens(es) MAIA applies when responding to astrology-related questions. This gives users control over the *type* of insight they receive without needing to know how to prompt for it.

---

## The Five Lenses

| Lens | Focus | Best For | Default House System |
|------|-------|----------|---------------------|
| **Technical** | Mechanics, geometry, dignity, timing | Precise questions, electional, "what's happening" | Placidus |
| **Developmental** | Soul arc, karmic patterns, growth edges | Purpose, recurring themes, "why me" | Whole Sign |
| **Archetypal** | Myths, gods, initiations, shadow | Deep psychology, meaning-making, creativity | Whole Sign |
| **Spiralogic** | Elemental cycles, phase logic | Current phase, practices, timing decisions | Porphyry |
| **Timing** | Transits, progressions, activations | Present-moment guidance, crisis, "what now" | Placidus |
| **Synthesis** | All lenses woven together | Comprehensive reading, major life questions | User's default |

---

## UI Options

### Option A: Chip/Tag Selector (Recommended)

Horizontal row of tappable chips below the chat input or in a collapsible "Astrology Settings" drawer:

```
[Technical] [Developmental] [Archetypal] [Spiralogic] [Timing] [Synthesis]
```

- Single-select (one active at a time) OR multi-select (combine lenses)
- `Synthesis` auto-selects when multiple lenses chosen
- Persists across session (stored in localStorage)
- Resets to "Synthesis" on new conversation

### Option B: Dropdown Menu

Single dropdown with lens options:

```
Astrology Lens: [Synthesis ▼]
  ├─ Technical
  ├─ Developmental
  ├─ Archetypal
  ├─ Spiralogic
  ├─ Timing
  └─ Synthesis (all)
```

- Simpler UI, less visual clutter
- Less discoverable than chips

### Option C: Quick Settings Integration

Add to existing QuickSettingsSheet alongside voice mode, path, etc.:

```
Astrology Lens
[Technical] [Developmental] [Archetypal] [Spiralogic] [Timing] [Synthesis]
```

- Keeps main chat clean
- Grouped with other MAIA settings
- May be overlooked

**Recommendation:** Option A (chips) for `/astrology` page, Option C (settings integration) for `/maia` chat.

---

## House System Mapping

When a lens is selected, suggest (or auto-apply) the appropriate house system:

| Lens | Recommended House System | Why |
|------|-------------------------|-----|
| Technical | Placidus | Most precise for timing, widely used |
| Developmental | Whole Sign | Cleaner archetypal containers |
| Archetypal | Whole Sign | Myth operates in whole-sign logic |
| Spiralogic | Porphyry | Quadrant-based, psychological work |
| Timing | Placidus | Best for transit precision |
| Synthesis | User's saved preference | Respect their setup |

**UI Integration:**
- When lens changes, show subtle prompt: "This lens works best with [X] houses. Switch?"
- Or auto-switch with undo option
- Store lens-specific house preference if user overrides

---

## Filter Options (Secondary)

Beyond lenses, allow filtering by:

### Focus Area
- [ ] Relationships
- [ ] Career / Purpose
- [ ] Health / Body
- [ ] Creativity
- [ ] Spirituality
- [ ] Timing / Decisions

### Depth Level
- [ ] Quick read (1-2 sentences)
- [ ] Standard (paragraph)
- [ ] Deep dive (comprehensive)

### System Blend
- [ ] Western only
- [ ] Western + Chinese
- [ ] Western + Mayan
- [ ] All systems

---

## Context Injection

When a lens is selected, inject context into MAIA's system prompt:

### Technical Lens Context
```
The user has selected TECHNICAL astrology mode. Focus on:
- Aspect geometry and orbs
- Planetary dignity and reception
- House rulership chains
- Precise timing and degrees
- Mechanical "what is happening" language
Avoid: mythic interpretation, soul-level framing, emotional language
```

### Developmental Lens Context
```
The user has selected DEVELOPMENTAL astrology mode. Focus on:
- Soul contracts and karmic patterns
- Growth edges and maturation sequences
- Why this pattern exists in their life
- What capacity is trying to develop
- Evolutionary purpose of configurations
Speak to the soul arc, not just the mechanics.
```

### Archetypal Lens Context
```
The user has selected ARCHETYPAL astrology mode. Focus on:
- Gods, myths, and initiatory narratives
- Shadow material and psychological depth
- Descent/return journey patterns
- Creative and artistic implications
- Which archetypal forces are active
Use mythic language. Name the gods at work.
```

### Spiralogic Lens Context
```
The user has selected SPIRALOGIC astrology mode. Focus on:
- Elemental phase: Fire (initiation) → Water (dissolution) → Earth (integration) → Air (transcendence)
- Where they are in the cycle
- Appropriate practices for current phase
- What to embrace vs. what to release
- Timing based on elemental rhythm
Map configurations to the four-element cycle.
```

### Timing Lens Context
```
The user has selected TIMING astrology mode. Focus on:
- Current transits and their exact timing
- What's activating NOW vs. theory
- Progression phases and returns
- Eclipse cycles and nodal activations
- Practical "what to do this week/month" guidance
Be specific about timing windows and action steps.
```

### Synthesis Lens Context
```
The user has selected SYNTHESIS mode. Weave together:
- Technical (what's happening)
- Developmental (why it exists)
- Archetypal (which forces are active)
- Spiralogic (current phase)
- Timing (what's activating now)
Provide a coherent multi-lens reading. Note where lenses agree (high signal) and where they diverge (nuance).
```

---

## State Management

```typescript
interface AstrologySettings {
  lens: 'technical' | 'developmental' | 'archetypal' | 'spiralogic' | 'timing' | 'synthesis';
  houseSystem: 'placidus' | 'whole-sign' | 'porphyry' | 'equal' | 'koch';
  focusAreas: string[];
  depthLevel: 'quick' | 'standard' | 'deep';
  systemBlend: 'western' | 'western-chinese' | 'western-mayan' | 'all';
}

// Default
const defaultSettings: AstrologySettings = {
  lens: 'synthesis',
  houseSystem: 'porphyry',
  focusAreas: [],
  depthLevel: 'standard',
  systemBlend: 'all',
};
```

Store in:
- `localStorage` for persistence
- `members.astrology_settings` (PostgreSQL) for cross-device sync

---

## API Integration

### Chat Request Enhancement

```typescript
interface ChatRequest {
  message: string;
  userId: string;
  astrologyContext?: {
    lens: string;
    houseSystem: string;
    focusAreas: string[];
    depthLevel: string;
    systemBlend: string;
  };
}
```

### Backend Processing

1. Detect if message is astrology-related (keyword matching or intent classification)
2. If yes, inject lens-specific context from above
3. If user has birth data, include relevant chart data
4. Process through MAIA with enriched context

---

## Member-Facing Copy

### Lens Descriptions (Tooltips)

- **Technical:** "Precise mechanics — aspects, timing, degrees"
- **Developmental:** "Soul growth — why this pattern exists in your life"
- **Archetypal:** "Myths and gods — which forces are active"
- **Spiralogic:** "Elemental cycles — where you are in Fire→Water→Earth→Air"
- **Timing:** "What's happening NOW — transits, activations, action steps"
- **Synthesis:** "All lenses woven together — comprehensive reading"

### Onboarding Prompt

> **Choose how MAIA reads your chart**
>
> Different questions need different lenses. Select one — or let MAIA synthesize them all.
>
> [Technical] [Developmental] [Archetypal] [Spiralogic] [Timing] [Synthesis]

---

## Implementation Priority

### Phase 1 (MVP)
- [ ] Add lens selector chips to `/astrology` page
- [ ] Store selection in localStorage
- [ ] Inject lens context into MAIA prompts
- [ ] Default to Synthesis

### Phase 2
- [ ] Add house system auto-suggestion per lens
- [ ] Add depth level selector
- [ ] Sync settings to PostgreSQL for cross-device

### Phase 3
- [ ] Add focus area filters
- [ ] Add system blend selector (Western + Chinese + Mayan)
- [ ] Build lens-specific response templates

---

## Success Metrics

- Members use non-default lens at least once: target 40%
- Lens selection correlates with higher satisfaction ratings
- Reduced "that's not what I was asking for" feedback
- Increased return usage of astrology features
