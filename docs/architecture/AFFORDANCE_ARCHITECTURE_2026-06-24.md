# Affordance Architecture

**Date:** 2026-06-24  
**Origin:** Kelly Nezat  
**Status:** Constitutional candidate — design law governing all UI decisions  
**Relation to:** `LIVING_ORIENTATION_ENGINE_DESIGN_DIRECTIVE_2026-06-24.md`, `REPRESENTATION_ENGINE_2026-06-24.md`

---

## The reframe

**Don't reduce the icons. Reduce the need for icons.**

That is a different design objective.

Today, most software says: *"Here are my capabilities. Pick one."*  
What MAIA should say: *"Tell me what's happening. I'll help you discover the right way to work with it."*

---

## Navigation architecture vs. Affordance architecture

**Navigation architecture** asks: *Where do I go?*  
**Affordance architecture** asks: *What can I do from here?*

The member should almost never leave where they are.  
The environment changes around them.

---

## The continuum (not layers, but frequency)

### Level 1 — Natural language (95%)

The member never clicks anything. They simply say:
- "I need to see my week."
- "Can we look at this relationship?"
- "I'm overwhelmed."
- "I have three ideas I don't want to lose."
- "Help me prepare for tomorrow."

MAIA naturally offers what serves. No icons required.

### Level 2 — Gentle invitations (4%)

Sometimes MAIA offers one or two possibilities.

```
Would it help to:

• See your calendar

• Look at this relationship over time

• Keep talking
```

Three choices. Not twelve.

### Level 3 — The Field (1%)

Only when someone intentionally wants to inhabit the workspace.  
Not because it's hidden. Because it's no longer the primary way of navigating.

---

## Presence over icons

Icons say: *"Application."*  
Presence says: *"This is available."*

```
────────────────────────────
What are you holding today?
...
────────────────────────────
Still alive
• John
• Book
• Practitioner Portal
────────────────────────────
Available if helpful
Calendar
Timeline
Relationship
Projects
────────────────────────────
```

Typography, spacing, and hierarchy communicate more calmly than rows of symbols.

If someone says "Show me my calendar" — the word **Calendar** becomes active.  
If they never ask — it quietly stays in the background.

The interface becomes conversational instead of command-driven.

---

## The disappearing Field

The single persistent affordance:

```
See differently
```

When clicked it expands:

```
See through...

Time
Relationships
Projects
Practices
Ideas
Memory
```

These are **perspectives**, not destinations.  
That reinforces the representation architecture — every view is a lens through which the same field can be understood.

---

## The design law (constitutional candidate)

> **Capabilities should be discovered through need rather than advertised through interface.**

This doesn't mean hiding functionality.  
It means revealing functionality at the moment it becomes meaningful.

---

## Design rule table

Every icon, menu, and button must pass this test before it ships:

| Question | If "Yes" | If "No" |
|----------|----------|---------|
| Can the member simply ask for this? | Don't add a button. | Continue. |
| Can MAIA naturally offer this when appropriate? | Don't add persistent UI. | Continue. |
| Does the member need persistent spatial access? | Create a quiet affordance. | Continue. |
| Is this a professional workspace tool? | Put it in the Field. | Keep out of primary experience. |

**The governing principle:** Every piece of visible UI should be there because conversation and contextual invitation are *insufficient* — not because software traditionally has a toolbar.

---

## Implication for existing UI

**Context doors** (Personal / Creative / Business / Relationship / Session / Dream / Body / Unknown) warrant review against this rule:
- Can the member simply say "I'm working through something personal"? → Yes. That's natural language. The doors may be premature UI.
- Or do the doors help MAIA understand framing before the conversation begins? → If so, they earn their place as framing context, not capability navigation.

The test: are the context doors revealing what the member is *bringing* (earned), or advertising what the system can do (not earned)?

---

## Relation to four-engine architecture

```
Arrival Engine
    ↓
Recognition Engine
    ↓
Orientation Engine    ← affordance architecture lives here
    ↓
Representation Engine
```

The Orientation Engine's job is to make capabilities discoverable through need. Affordance architecture *is* the orientation layer.

---

## Status

**Constitutional candidate — not yet canon.**

This design law changes what the system is permitted to build: any persistent UI element that cannot pass the four-question test above should not exist in the primary experience.

When this becomes canon: it joins `docs/canon/MAIA_ATTENTION_DOCTRINE.md` and `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` as a governing constraint on all future UI decisions.
