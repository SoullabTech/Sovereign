# Evidence Engine — Architectural Crystallization

**Date:** 2026-06-24  
**Origin:** Kelly Nezat  
**Status:** Canonical architectural statement — governs all representation decisions  
**Relation to:** `REPRESENTATION_ENGINE_2026-06-24.md`, `AFFORDANCE_ARCHITECTURE_2026-06-24.md`, `LIVING_ORIENTATION_ENGINE_DESIGN_DIRECTIVE_2026-06-24.md`

---

## The crystallization

**Representations are not destinations. They are ways of seeing that are invited into an ongoing conversation when they deepen understanding.**

This is the unifying principle of the Living Field.

---

## The physician analogy

A physician doesn't walk into the room and put the MRI on the wall.

They begin with one question: *Tell me what's happening.*

Then, based on what emerges — they order blood work, pull up the MRI, review medications, compare previous scans. The imaging isn't separate from the consultation. It becomes part of the consultation.

**That is what MAIA does.**

The Living Field is a consultation room.  
Conversation is not the product. Conversation is the orchestrator.  
It asks: *What evidence would help us think better together?*  
Not: *Which app do you want?*

---

## Everything becomes evidence

Not features. Evidence.

| Evidence Provider | Primary Question |
|-------------------|-----------------|
| Calendar | When? |
| Timeline | Over what period? |
| Relationship | Between whom? |
| Astrology | Within what symbolic or developmental context? |
| Memory (Still Alive) | What has remained alive? |
| Projects | What needs to happen? |
| Practices | How might I respond? |
| Documents | What has already been written? |
| Journal | What was happening at that time? |

They are not different products. They answer different questions.

---

## The governing question

**What is the next question we're trying to answer together?**

If the question is *"When does this happen?"* → Calendar appears.  
If the question is *"Has this happened before?"* → Timeline appears.  
If the question is *"Why does this relationship feel stuck?"* → Relationship map appears.  
If the question is *"What larger developmental cycle am I in?"* → Astrology appears.

The member never navigates to "Astrology."  
They are invited into a symbolic perspective because it serves the question at hand.

---

## The flow

```
Expression
    ↓
Recognition
    ↓
"What kind of understanding would help?"
    ↓
Evidence Selection
    ↓
Offer ("It might help to see this.")
    ↓
Member accepts
    ↓
Representation appears (conversation makes room — no page load, no navigation, no modal)
    ↓
Conversation continues — with the representation, not away from it
    ↓
Representation closes when no longer needed
    ↓
Conversation remains
```

Nothing ever replaces the conversation.  
The conversation is the continuous thread.  
Everything else is temporarily invited into it.

---

## The three examples

**Calendar:**  
Member: "I'm overwhelmed."  
MAIA recognizes: half of this sounds like scheduling conflict.  
Not: "Open Calendar."  
Instead: *"I wonder if seeing your week would make this easier to understand."*  
Calendar quietly expands. Conversation stays alive. They're talking **with** the calendar, not **switching to** it.

**Scheduling:**  
Member: "Can you schedule something with Nathan?"  
The meeting panel appears alongside conversation.  
MAIA: "Would Wednesday give you more preparation time?"  
Scheduling didn't interrupt the relationship.

**Astrology:**  
Member: "I don't know why this year feels so different."  
MAIA: "One perspective that may be helpful is your current transit cycle. Would you like to look at it?"  
The chart unfolds. Not because astrology became the app — because astrology became one lens through which to examine the question.

---

## The principle that prevents misuse

**The system should never ask the member to think like the software.**

Instead it asks: *What is the next question we're trying to answer together?*

This is the test for every representation offer. If the representation doesn't serve the current question — it doesn't appear.

---

## What this means for the architecture

**"Representation Engine" understood as "Evidence Engine":**

```
Expression
    ↓
Recognition
    ↓
Evidence Engine
    ↙ ↓ ↘ ↙ ↘
Calendar  Timeline  Relationship  Memory  Astrology  Projects  Practices  Documents
```

Each representation is an Evidence Provider — a way of seeing that answers a specific class of question.

**The oracle's role:** After recognition, the oracle determines: "What kind of understanding would help?" and selects evidence providers accordingly. It emits `representations: RepresentationOption[]` — not a navigation decision, an evidence selection.

**The UI's role:** Make room. Fold away. Never interrupt. The conversation remains alive throughout.

---

## Naming precision

| Old framing | More precise framing | Why |
|-------------|---------------------|-----|
| Panels | Evidence Providers | Names what they do — provide evidence for a question |
| Capabilities | Evidence types | Names their role — answering a specific kind of question |
| Navigation | Invitation | Names the member's relationship to them |
| Opening a view | Evidence appearing | Names the gesture — appears into conversation |
| Closing a view | Evidence folding away | Names the lifecycle — conversation remains |

**The Representation Engine is the implementation. Evidence Engine is the concept.**

---

## Constitutional implication

This crystallization subsumes several prior principles:

- "Lenses not applications" — confirmed and deepened: lenses are evidence providers
- "Representations are not destinations" — now the canonical statement
- "MAIA offers; member accepts" — reframed as: MAIA selects evidence, offers it, member chooses whether to look
- "Member should almost never leave where they are" — structural consequence of evidence appearing into conversation

---

## Status

This is the **clearest single statement** of what the Living Field is.

Everything that follows — the Representation Engine implementation, the first Still Alive panel, the orientation layer, the Field atelier — is implementation of this architecture.

When canonized: this statement joins `docs/canon/` alongside the Oath and Sovereignty Invariants.
