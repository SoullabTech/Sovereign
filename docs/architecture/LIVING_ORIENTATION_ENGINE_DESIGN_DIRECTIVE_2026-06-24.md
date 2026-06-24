# Living Orientation Engine — Design Directive

**Date:** 2026-06-24  
**Origin:** Kelly Nezat  
**Status:** Architectural directive — governs orientation layer design  
**Relation to:** `REPRESENTATION_ENGINE_2026-06-24.md`, `LIVING_FIELD_INHABITATION_2026-06-24.md`

---

## The transition

The platform now has two solved problems and one unsolved problem.

**Solved:** Arrival — "What are you holding today?"  
**Solved:** Representation — the Representation Engine offers contextual visualizations  
**Unsolved:** Orientation — "What do I do now? What can MAIA actually do? Where do I start?"

Orientation should NOT be solved through tutorials, feature tours, dashboards, or mode selection.

**The platform translates human intentions into capabilities. Never capabilities into intentions.**

---

## The four-engine architecture

```
Arrival Engine
    ↓
Recognition Engine
    ↓
Orientation Engine      ← the missing layer
    ↓
Representation Engine
```

Calendar, Studio, Memory, Portrait, Practices, Relationships, Projects, Documents — these are **capabilities**. They plug into the engines. They are not engines.

---

## Three navigation modes

### 1. Invitation (most common)
MAIA offers.
```
Would it help to...

○ See your week
○ Trace this relationship
○ Stay here
```

### 2. Curiosity
The member intentionally opens the Field.
Icons are present — not because MAIA suggested them, but because the member wants to explore.

### 3. Direct intention
The member says: "Show me my calendar." / "Open the relationship map."
Natural language becomes navigation. This always works.

---

## Three layers (not menus)

### Layer 1 — Living Conversation (default state, 95% of the time)

```
──────────────────────────────

What are you holding today?

[ textarea ]

Still Alive...

──────────────────────────────
```

Nothing else competing.

### Layer 2 — Offered representations (contextual, ephemeral)

```
Would seeing this help?

◉ Your week
◉ Timeline
◉ Relationship
◉ Continue talking
```

Tiny. Contextual. Disappear after use.

### Layer 3 — The Field ("Open my Field" / "Show me everything")

The member intentionally enters a richer environment.

---

## The Field as atelier

Not a dashboard. A beautiful studio.

```
                 Portrait

        Ideas             Calendar

   Practices                 Timeline


            Conversation


    Memory              Relationships

             Documents
```

Quiet instruments resting nearby. Conversation at the center. The field ring is the spatial center.

**Two centers:**
- Conversation — the relational center
- Field ring — the spatial center

---

## Lenses, not applications

Members don't "go to Calendar." They look through the Calendar lens.  
Members don't "open Timeline." They ask: *Show me this through time.*

This is not metaphor — it changes the design. Lenses are invoked in context. Applications are navigated to.

---

## Adaptive affordance (four icon states)

Icons breathe. They never disappear — people build spatial memory. But they change state.

| State | Symbol | Meaning |
|-------|--------|---------|
| Dormant | • | Nothing current connects here |
| Available | ○ | Could be relevant |
| Relevant | ◉ | MAIA has noticed something |
| Active | ⬤ | Currently inhabited |

When scheduling becomes important → Calendar quietly brightens.  
When a relationship becomes active → That icon gently awakens.  
Not notifications. Presence. The environment reflects what is currently relevant.

**Principle:** Always present · softly dormant · gently active · currently inhabited.  
Never remove an icon. Spatial memory is load-bearing.

---

## Living Pathways (the first prototype)

Not "Here are features." Not "Try these tools."

After a member expresses themselves, MAIA says:

> There are a few ways people often continue from here.

And offers movements, not menus:

- Continue talking
- See what's remained alive over time
- Organize this into a project
- Look at your week
- Explore this relationship visually

These are **next possible movements**, generated from context. Not hardcoded.  
They should emerge from metadata, not from a scripted list.

---

## What this is not

- Not onboarding
- Not a feature tour
- Not a dashboard with widgets
- Not mode selection
- Not a tutorial

**The architecture of orientation is the architecture of invitation.**

---

## Governance (applies to all orientation features)

Every proposal must distinguish:
- Member-authored expression
- Evidence
- Inference
- Suggestion
- Visualization
- Representation

Nothing crosses these boundaries silently.

---

## Dependency map (to be produced by the research agent)

```
Living Orientation Engine

├── Arrival Engine
├── Recognition Engine
├── Continuity
├── Representation Engine
├── Memory
├── Calendar
├── Studio
├── Journey
├── Portrait
├── Practices
├── Relationship
├── Projects
└── Documents
```

Research agent will identify:
- Which pieces already exist
- Which are partially implemented
- Which are duplicates
- Which should be merged
- Which should remain independent

**Hypothesis:** 80–90% of the functionality is already in the codebase. What's missing is the orientation layer that helps people understand and inhabit what already exists.

---

## Status

**Cat 1 — Preserved direction, not yet authorized.**

Research agent is producing `docs/architecture/LIVING_ORIENTATION_ENGINE.md` — the full architecture paper with inventory tables, current state, gaps, and recommended first prototype.

The first prototype to authorize: **Living Pathways**.
