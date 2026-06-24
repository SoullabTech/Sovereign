# MAIA Design Doctrine

> Governing principles for all UI restructuring decisions.
> This document has authority over implementation choices. When in doubt, defer to these principles.

---

## North Star

The goal is not to add more UI. The goal is to create a more immersive, intuitive experience by removing friction, clarifying spatial meaning, and protecting the felt center.

---

## Core Principles

### 1. Fewer visible choices, stronger sense of place
- One sovereign center
- One stable lateral navigation system
- One contextual unfolding area
- Clear thresholds between modes

### 2. Worlds instead of features
Users should feel they are entering worlds:
- Patterns
- Depth
- Journal
- Wisdom
- Relationships

Not switching between tools.

### 3. Distinct posture between MAIA and Studio
- MAIA = contemplative, relational, alive
- Studio = structured, focused, productive

These must remain distinct shells.

---

## Decision Framework

### Immediate yes
- Collapse redundant navigation surfaces
- Move stable destinations into the left rail
- Use the right panel for contextual unfolding
- Centralize sheets and modal logic
- Remove exposed architectural labels from primary UI
- Turn Talk/Care/Scribe/Mark into behaviors instead of top-level navigation
- Keep Studio as a separate shell

### Conditional yes
- Subtle transitions between worlds
- Soft threshold animation when entering Studio
- Adaptive right-panel content based on active world
- State-aware lighting or tone shifts in the center field

### Not yet
- Major visual redesign
- Mobile redesign before desktop spatial logic is stable
- New feature proliferation
- Adding more top-level destinations
- Increasing commerce prominence before the core environment settles

---

## Evaluation Standard

**Approve** UI changes only if they increase:
- Calm
- Legibility
- Spatial coherence
- Sense of presence
- Intuitive movement

**Reject or defer** changes that increase:
- Options
- Density
- Explanation burden
- Visible architecture
- Navigation redundancy

---

## Immersive Quality

The immersive quality should come from:
- Spatial coherence
- Center protection
- Progressive reveal
- Postural clarity
- Atmospheric consistency

---

## Implementation Rules

1. Do not add new UI surfaces while old ones are still being reduced.
2. Do not restore old top-level mode navigation.
3. Preserve the visual authority of the MAIA center.
4. Keep Studio as a separate shell and do not merge Studio UI into MAIA.

---

## Short Reference (repeat to Claude)

```
Protect the center.
Reduce choices.
Use worlds, not tools.
Make the right panel contextual.
Keep Studio separate.
Do not add surfaces while old ones are being reduced.
```

---

## Change Review Checklist

Before implementing any UI change, answer:

1. Does this increase calm?
2. Does this improve legibility?
3. Does this strengthen spatial coherence?
4. Does this protect the MAIA center?
5. Does this reduce visible architecture and redundancy?
6. Does this preserve the distinct posture between MAIA and Studio?

Classify: **approve now** / **approve later** / **reject**

Give a short reason tied to the doctrine.

---

## Talk-First Extension

> Voice is the spine. UI is the field.

### Voice handles
- Relationship
- Guidance
- Interpretation
- Support
- Emotional pacing
- Real-time inquiry

### UI handles
- Spatial orientation
- Memory surfacing
- World transitions
- Lightweight controls
- Structured follow-through
- Trust cues

### Talk-first rules

1. Voice is the primary interface for support.
2. The visual layer exists to orient, reveal context, and support follow-through.
3. The screen should remain calm enough that a user can stay in conversation without feeling managed by software.
4. Worlds must be accessible through both navigation and speech.
5. The platform should privilege continuity, attunement, and low-friction transitions over visible feature density.
6. Studio remains distinct as the structured execution environment.
7. Any new UI must strengthen, not compete with, the voice relationship.

### Screen behavior

- Nothing should appear on screen unless it **orients**, **deepens**, or **supports action**.
- If it merely exposes architecture or adds options, it should go.
- The screen should be glanceable, not demanding.
- During active voice flow, chrome de-emphasizes (calm mode).
- The right panel shows visible cognition, not navigation.

### Capability model

- Features are not destinations. They are capabilities MAIA can invoke.
- User intent flows through MAIA, not through menus.
- Worlds are environments, not apps. MAIA guides movement between them.
- Manual navigation remains as fallback, not primary path.

### Talk-first evaluation

Before adding any UI element, also ask:
- Does this compete with the voice relationship?
- Could this be handled by speech instead?
- Does this require the user to stop talking and start managing?

If yes to any, defer or remove.

---

## Empty State Principle

> Empty surfaces communicate orientation, readiness, and purpose — not absence.

A surface with no data is not a failure state. It is the space before use begins. The copy and layout should answer the question the user is implicitly asking: *"Where am I, and what is this place for?"*

**Anti-patterns to avoid:**
- `No decisions pending` — implies something is missing
- `No recent activity` — implies the system is idle or broken
- Generic empty states that could belong to any tool

**Correct pattern:**
- Name the current state affirmatively: *"Your desk is clear."*
- Describe what the surface is for: *"New requests and delegated work will appear here."*
- Use present tense and calm register throughout

**First implementation:** `app/studio/command/page.tsx` — Decisions Needed and Recent Activity empty states (merged in feat/studio-orientation-empty-states, 2026-06-12).

This principle applies to both Practitioner Studio and Member Portal surfaces. The practitioner's empty dashboard should feel like a ready room. The member's empty threshold should feel like an open door.
