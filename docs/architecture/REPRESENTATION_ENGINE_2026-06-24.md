# The Representation Engine

**Date:** 2026-06-24  
**Status:** Architectural directive — the correct first prototype for Living Field  
**Origin:** Kelly Nezat  
**Relation to:** `LIVING_FIELD_INHABITATION_2026-06-24.md`, `INTEGRITY_OF_BECOMING_CONSTITUTIONAL_FOUNDATION_2026-06-24.md`

---

## The reframe

Don't build the Calendar View.  
Don't build the Relationship Map.  
**Build the Representation Engine.**

If you build the calendar first, people think: "Oh, MAIA can show my calendar."  
If you build the relationship map first, they think: "Oh, MAIA can visualize relationships."  
Neither demonstrates the architecture.

**The calendar isn't the feature. The representation shift is.**

---

## The design law (complete)

```
Expression
    ↓
Recognition
    ↓
Invitation      ← constitutionally critical
    ↓
Representation
    ↓
Field
    ↓
Memory
```

**The Invitation layer is the constitutional mechanism.** Recognition is MAIA's perception. Representation is the visualization. Invitation is the transfer of agency. Without it, MAIA silently changes the environment. With it, the member chooses.

---

## The first proof (the right prototype)

**"I'm struggling with John. We were supposed to meet next week, but I keep avoiding him."**

Inside that one expression already exist multiple representations:
```
Relationship → Timeline → Calendar → Conversation → Memory → Practices
```

MAIA responds:
> "There are a few ways we could explore this together.
> • Look at your upcoming week.
> • Trace how this has unfolded over time.
> • Stay with the conversation."

Member chooses: "Let's look at my week."

The field shifts:
- Conversation narrows to the left
- Calendar opens on the right
- The meeting with John is already highlighted — because it came from the conversation, not because the user searched for it
- MAIA continues: "Seeing it now, what do you notice?"

**That single interaction demonstrates:** continuity · contextual routing · representation by invitation · authorship · relationship-first · capability emerging from context.

---

## Three kinds of representations

### 1. Evidence representations
*The member asks: "Show me."*
- Calendar
- Timeline
- Documents
- Memory atoms
- Session history

### 2. Pattern representations
*The member asks: "Help me see."*
- Relationship map
- Themes
- Elemental movement
- Continuity
- Practices

### 3. Creative representations
*The member asks: "Help me build."*
- Mind map
- Canvas
- Writing
- Studio
- Planning

---

## The Representation Engine

Its job is simply: *What representations could help someone understand this more deeply?*

It doesn't know about calendars or relationships. Everything else plugs into it.

```typescript
interface RepresentationOption {
  id: string;
  title: string;          // "See your week"
  reason: string;         // "You mentioned a meeting with John next Tuesday."
  evidence: string[];     // what from expression grounds this offer
  component: React.Component;  // the panel that renders it
  requiredData: string[]; // what data keys are needed
  confidence: number;     // 0-1, drives whether to offer at all
}
```

Example output from a single conversation turn:
```typescript
[
  {
    title: "See your week",
    reason: "You mentioned a meeting with John next Tuesday.",
    component: CalendarPanel,
    confidence: 0.85
  },
  {
    title: "See this relationship over time",
    reason: "This conversation connects with four earlier threads about John.",
    component: TimelinePanel,
    confidence: 0.72
  },
  {
    title: "Stay in conversation",
    reason: "No visual representation needed.",
    confidence: 1.0
  }
]
```

---

## Architecture placement

The Representation Engine sits between the oracle (recognition) and the UI (representation).

**Option A: Oracle-side** — MAIA's response includes an optional `representations: RepresentationOption[]` field alongside the text. The oracle recognizes the context and generates the offer.

**Option B: Client-side** — A separate analysis pass over the oracle response. Less ideal — requires a second inference call or client-side heuristics.

**Recommended: Option A.** The oracle already has the full context. Adding `representations[]` to the response schema is minimal. The UI renders an `InvitationCard` when the field is non-empty.

---

## What the prototype requires

1. **Oracle response schema update** — add optional `representations: RepresentationOption[]` to the MAIA response
2. **Oracle prompt update** — instruct MAIA to recognize representation opportunities and generate options (only when confident)
3. **InvitationCard component** — renders "There are a few ways we could explore this..." with the options
4. **Panel container** — manages which representation panel is open alongside conversation (conversation narrows; panel expands)
5. **At least one working panel plugin** — the first plugin that actually renders (likely Still Alive / memory atoms, because data is live and constitutionally clean)

---

## Plugin model

Each representation is a plugin:
- CalendarPanel → plugs in when calendar data exists
- TimelinePanel → plugs in when memory atoms or sessions have temporal data
- RelationshipMapPanel → plugs in when relationship/person data exists
- StillAlivePanel → plugs in immediately (atoms are live for Kelly)
- PracticePanel → plugs in when practices are defined

**The engine is the architecture. The panels are content. They can be built independently over time.**

---

## Governance (applies to all representations)

| Question | Rule |
|----------|------|
| What can be shown without asking? | Only what the member has expressed in this session or explicitly kept (atoms) |
| What requires confirmation? | External data (calendar), inferred patterns, synthesized connections |
| What must never be shown silently? | Anything inferred about the member that they haven't expressed |
| Who controls the view? | The member. MAIA offers; the member accepts or declines. |
| What if the member declines? | Conversation continues. No persistence of the offer. |

---

## What this is NOT

- Not a collection of tools bolted onto chat
- Not a dashboard with widgets
- Not an app switcher
- Not MAIA deciding what the member should see

**It is a field that can change its shape while remaining the same relationship.**

---

## Status

**Cat 1 — Preserved direction, not yet authorized.**

Authorize and begin prototype when:
1. Architecture trace (`LIVING_FIELD_REPRESENTATION_TRACE.md`) is complete
2. Data sources for first panel are confirmed live
3. Oracle response schema change is approved
4. Panel container design is approved
