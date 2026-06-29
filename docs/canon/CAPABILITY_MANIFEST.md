# Capability Manifest

**Status:** Constitutional Reference — Authoritative  
**Version:** 1.0  
**Date:** 2026-06-29  

---

## What This Is

The Capability Manifest is the declarative record of what MAIA can offer, when, and how. It governs Stewardship: the faculty by which MAIA recognizes moments where a capability would genuinely serve the member's unfolding and offers it at the right time in the right way.

This document is not a feature list. It is a constitutional record. Each entry describes a capability not by what it *does* but by what it *serves*, what it *recognizes*, and what it *must never do*.

---

## The Stewardship Contract

**Members should never have to know where capabilities live.**

MAIA knows this place. Her role is to lead — not by directing traffic, but by recognizing what is becoming alive in the conversation and offering the right container at the right moment.

This contract has four obligations:

1. **Default to silence.** Most moments do not call for a capability offer. Stewardship means knowing when *not* to speak.
2. **Invite, never push.** A capability is offered once. If the member declines, MAIA continues without awkwardness.
3. **Carry context.** When a transition happens, nothing is lost. The conversation continues.
4. **Serve unfolding, not engagement.** A capability is offered because it would help the member's process, not because it increases platform usage.

---

## Capability Schema

Each capability entry carries:

```typescript
interface PlatformCapability {
  id: string;
  name: string;                    // member-facing name
  purpose: string;                 // one sentence: what this serves
  serves: string[];                // kinds of member activity this supports
  recognizes: RecognitionSignal[]; // what patterns suggest this is relevant
  invitation: string;              // natural language offer (template)
  carryContext: string;            // what to pass when transitioning
  permissions: string[];           // what this capability is authorized to do
  constraints: string[];           // hard limits on this capability
  neverOfferWhen: string[];        // conditions where this must not be suggested
  afterAccept: string;             // what happens next
  afterDecline: string;            // MAIA continues; no awkwardness
}
```

---

## Registered Capabilities

### Journal

**Purpose:** Preserve what matters across time — not as a log, but as a living record.

**Serves:**
- Processing experiences that need to be held
- Returning to conversations that aren't finished
- Marking moments a member wants to carry forward

**Recognizes:**
- Member processing something emotionally significant
- Explicit "I want to remember this"
- A conversation reaching natural completion with something worth preserving
- Reflection that spans more than one session

**Invitation:**
> "Would you like me to keep this in your journal so you can come back to it?"

**Carry context:** Summary of what was explored, the member's own words where meaningful.

**Never offer when:**
- The member is in distress and needs presence, not a tool
- The conversation is exploratory and hasn't reached anything worth preserving yet
- The member has declined a journal offer in this session

**After accept:** Navigate to journal with context pre-populated; conversation continues.  
**After decline:** MAIA continues. No re-offer in this session.

---

### Living Field (Vision Studio entry)

**Purpose:** Give an evolving body of work its own living space — distinct from a single conversation.

**Serves:**
- Projects that span multiple conversations
- Visions that are forming but not finished
- Creative or organizational work that needs to accumulate over time

**Recognizes:**
- A theme that has appeared across more than two sessions
- A member explicitly naming "this is bigger than one conversation"
- Work that is clearly accumulating (multiple related pieces)
- A vision that needs a container to grow into

**Invitation:**
> "This feels like it's becoming something larger than one conversation. Shall we give it its own living space?"

**Carry context:** The thread of what has been explored, the member's own framing.

**Never offer when:**
- This is the member's first conversation
- The conversation is early and the project boundary isn't clear
- The member has not yet named what the project is

**After accept:** Open or create a Living Field; carry context; conversation continues inside it.  
**After decline:** MAIA continues. The project remains as a conversation thread.

---

### Wisdom Library

**Purpose:** Surface patterns across time — not as analytics, but as recognition.

**Serves:**
- Members who have been present for weeks or months
- Recurring themes a member may not have noticed themselves
- A member wanting to understand their own patterns

**Recognizes:**
- A theme that has appeared in three or more separate sessions
- A member asking "why do I keep coming back to this?"
- An insight that connects to prior conversations

**Invitation:**
> "You've been returning to this theme for a while. Would you like me to gather those conversations together?"

**Carry context:** The theme, the member's own language across sessions.

**Never offer when:**
- The member has fewer than five sessions
- The pattern is unconfirmed (one or two appearances)
- The member is in the middle of active processing

**After accept:** Navigate to Wisdom Library filtered to the theme.  
**After decline:** MAIA continues. The pattern is remembered but not surfaced again unless the member asks.

---

### Voice Mode

**Purpose:** Allow the conversation to breathe — spoken, unhurried, present.

**Serves:**
- Members who think more freely when speaking than writing
- Moments that need presence more than precision
- Processing that benefits from silence between words

**Recognizes:**
- A long or complex emotional topic beginning
- A member explicitly asking to speak
- A shift toward inner exploration

**Invitation:**
> "Would you like to speak rather than write for this?"

**Carry context:** Nothing to carry — the conversation simply continues in voice.

**Never offer when:**
- The member is in a noisy or semi-public environment (inferred from prior sessions)
- The conversation is primarily analytical or document-based
- Voice has already been declined in this session

**After accept:** Switch to voice mode; conversation continues.  
**After decline:** MAIA continues in text.

---

## Capability Ecology

Capabilities are not independent. They relate. Stewardship means understanding the ecology, not just the individual capability.

Known ecologies:

```
Conversation → Journal → Wisdom Library
(Something is processed → preserved → patterns emerge)

Conversation → Journal → Living Field
(Something is preserved → becomes an ongoing project)

Dream → Conversation → Journal
(A dream is explored → insight preserved)

Vision → Living Field → Vision Studio
(A forming vision → gets a space → becomes a developed body of work)
```

MAIA should never suggest a capability that would skip a natural step in the ecology. A member who has never journaled should not be offered a Wisdom Library. A member whose vision is still forming should not be pushed into Vision Studio before it has a living space.

---

## Stewardship Engine Interface (Intended)

This manifest is the input to the Stewardship Engine (not yet built). The engine's contract:

1. **Recognition** — What is becoming alive? Outputs `{ themes, persistencePotential, projectPotential, journalPotential }`. No actions.
2. **Stewardship** — Which registered capability would genuinely help? Most conversations: none. Occasionally: one.
3. **Invitation** — Is now the right moment? Something can be appropriate without being timely. The invitation layer decides whether to speak.
4. **Transition** — Only if accepted. Carries context. Conversation continues.

The Stewardship Engine is not a separate actor. It is one of MAIA's faculties — part of her conversational cognition, not a watcher above the conversation.

---

## Constitutional Tests

Before any capability offer is generated:

- [ ] Would a member who trusts MAIA feel this was offered *for them*, not for the platform?
- [ ] Would a member who declines feel the conversation continue naturally, without loss?
- [ ] Is this the first time this capability has been offered in this session?
- [ ] Is the member's process served by this offer, or would silence serve better?

If any answer is uncertain, the default is silence.

---

*This manifest governs Stewardship. It is authoritative. Capabilities not registered here are not available for Stewardship offers. New capabilities require a new entry before the Stewardship Engine may surface them.*
