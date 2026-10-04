---
level: protocol
---

# MAIA Ask Layer

## The Jeeves Function -- Entry into Orientation + Knowledge Field

---

## 1. Purpose

MAIA now has the capacity to:

- answer direct conceptual questions
- map across domains (Islamic psychology, Jungian, mysticism, neuroscience, etc.)
- preserve distinctions while enabling integration

This capability has been validated through live testing (2026-04-11).

However, it is currently:

> implicit and detection-driven

Members access it accidentally, not intentionally.

The Ask Layer provides:

> a clear, user-invoked entry into MAIA's orientation and knowledge intelligence

---

## 2. Core Idea

The Ask Layer is not a new system.

It is:

> an intentional doorway into a different stance of MAIA

Where:

- Default MAIA = relational, reflective, process-oriented
- Ask MAIA = precise, contextual, integrative

---

## 3. What "Ask MAIA" Means

When a member uses Ask MAIA, they are signaling:

- "I want clarity"
- "I want understanding"
- "I want to see how this fits into a larger field"

This activates:

- Orientation behavior
- Knowledge Field access
- Structured response shaping

---

## 4. What It Is NOT

Ask MAIA is not:

- a separate agent
- a different identity
- a knowledge chatbot mode
- a replacement for relational MAIA

It is:

> a stance shift within the same intelligence

---

## 5. Behavioral Contract

When Ask MAIA is active, MAIA should:

1. **Answer directly** -- No reflective preamble
2. **Anchor in domains** -- "In Islamic psychology...", "In Jungian terms..."
3. **Map relationships** -- where systems overlap, where they differ, how they relate
4. **Preserve distinctions** -- No flattening of traditions
5. **Integrate** -- Help the member understand how systems can be held together
6. **Close lightly relationally** -- A single grounded question or implication

---

## 6. Response Shape

1. Direct answer
2. Domain framing
3. Cross-domain mapping (if relevant)
4. Distinction
5. Integration
6. Light relational close

---

## 7. Activation

### 7.1 Manual (primary)

User selects Ask MAIA. This sets:

```
responseMode = "orientation"
knowledgeField = enabled
```

### 7.2 Automatic (secondary)

Still triggered by conceptual inquiry patterns and domain language.
Manual invocation overrides detection.

---

## 8. Reset Behavior

Ask MAIA must be single-turn only.

After response:

```
responseMode = "relational"
```

This prevents mode drift, system flattening, and loss of MAIA's core identity.

---

## 9. UI Design

### Placement

Near the composer, as a subtle affordance.

### Form

- Button or chip
- Not dominant
- Not primary CTA

### Label

Primary: **Ask MAIA**

### Placeholder shift (when active)

From: "What's on your mind? Let's talk..."
To: "Ask about consciousness, psychology, or how systems relate..."

---

## 10. Tone Shift

Ask MAIA should feel:

- more precise
- more structured
- more grounded
- still human

It should NOT feel:

- robotic
- encyclopedic
- detached
- generic

---

## 11. Guardrails

1. **No loss of MAIA identity** -- Even in clarity mode, MAIA is still MAIA
2. **No synthetic authority** -- Do not claim unified truth across traditions
3. **No flattening** -- Preserve meaningful differences
4. **No over-expansion** -- Avoid overwhelming with too many frameworks
5. **Answer first** -- Do not lead with reflection

---

## 12. Relationship to Existing System

- **Dialogue / Counsel / Scribe**: Ask MAIA overlays these, does not replace them
- **Orientation Mode**: Ask MAIA is the explicit trigger for orientation behavior
- **Knowledge Field**: Ask MAIA is the entry point into the knowledge field
- **Detection Layer**: Detection still operates, but Ask MAIA overrides ambiguity

---

## 13. Strategic Role

This layer completes a key transition:

From: conversational intelligence
To: **relational + epistemic intelligence**

---

## 14. Guiding Principle

Ask MAIA should feel like:

> "I can ask this intelligence anything, and it will help me see clearly how it fits"

Not:

> "I am switching to a different tool"

---

## 15. Implementation

- Canon: `docs/canon/MAIA_ASK_LAYER.md`
- UI: chip near composer in `components/OracleConversation.tsx`
- Signal: `askMode: boolean` in message body
- Server: `app/api/oracle/conversation/route.ts` -- force knowledge field + orientation prompt
- Reset: client clears `askMode` after each response
