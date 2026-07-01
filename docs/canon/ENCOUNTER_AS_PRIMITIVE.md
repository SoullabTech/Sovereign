# Encounter as Primitive

**Canon status:** Foundational ontology
**Date:** 2026-06-29
**Governs:** Platform-wide domain model, Session Room architecture, MAIA memory, Vision Studio, Witness

---

## The Core Claim

The Encounter is one of the fundamental primitives of the platform.

Not the Session. Not the Conversation. Not the Transcript.

The Encounter.

A session is a format. An encounter is an event in lived experience.

---

## What an Encounter Can Be

An encounter could be:

- A therapy session
- A coaching session
- A MAIA conversation
- A journal entry
- A dream reflection
- A difficult conversation with a family member
- A walk where insights arose
- An important meeting
- A workshop
- A class
- A supervision conversation
- A voice memo
- A celebration
- A caregiving moment
- A spiritual direction session
- A letter

The architecture does not assume therapy. It assumes human experience.

---

## The Core AIN Nouns

Everything in the platform is built from a small set of foundational primitives:

| Primitive | Meaning |
|-----------|---------|
| **Person** | Who |
| **Encounter** | What happened |
| **Witness** | What was faithfully observed |
| **Recognition** | What became consciously seen |
| **Field** | The evolving developmental context |
| **Practice** | What is intentionally cultivated |

Everything else is built from these.

---

## Encounter Types

The Encounter model carries a `type` field that specifies the kind of lived experience:

- `therapy_session`
- `coaching_session`
- `maia_conversation`
- `journal`
- `dream`
- `meeting`
- `workshop`
- `teaching_session`
- `voice_memo`
- `nature_reflection`
- `supervision`
- `group_session`
- `family_conversation`
- `other`

The type influences which Session Room lens is offered, which MAIA inquiry modes are surfaced, and which developmental patterns are tracked.

---

## Session Room vs. Encounter — Clean Separation

**Session Room** is the experience: the environment you enter.

**Encounter** is the object created inside that room.

```
Open Session Room
       ↓
  Begin Encounter
       ↓
 Record / Upload
       ↓
Encounter Created
       ↓
Explore Encounter
       ↓
    Reflect
       ↓
     Learn
       ↓
    Return
```

Language that follows:
- "Open Session Room"
- "Begin Encounter"
- "Encounter in Progress"
- "Encounter Complete"
- "Return to Encounter"

Not: "Open Session", "Session Session", "Open Transcript."

---

## One Encounter Architecture, Multiple Session Room Lenses

The Encounter is universal. The Session Room is contextual.

```
              Encounter
        (canonical object)
               │
  ┌────────────┼────────────┐
  │            │            │
Personal   Practitioner   Group
  SR           SR           SR
```

Different portals expose different capabilities over the same Encounter model:

| Capability               | Personal | Practitioner | Group  |
|--------------------------|:--------:|:------------:|:------:|
| Transcript               |    ✓     |      ✓       |   ✓    |
| Chat with encounter      |    ✓     |      ✓       |   ✓    |
| Reflections              |    ✓     |      ✓       |   ✓    |
| Moments                  |    ✓     |      ✓       |   ✓    |
| Relational dynamics      | Limited  |      ✓       |   ✓    |
| Intervention analysis    |    —     |      ✓       | Optional |
| Client preparation       |    —     |      ✓       |   —    |
| Personal growth timeline |    ✓     |   Limited    |   —    |
| Team patterns            |    —     |      —       |   ✓    |

The **mistake** would be creating separate data models for each. The Encounter model is one. The lenses differ.

---

## Personal Session Room

Not therapy software. A place where someone reflects on their own lived experience.

Inquiry mode:
- "What was I learning?"
- "Where was I most alive?"
- "What surprised me?"
- "How has my understanding changed?"

This is a living reflective journal — conversational and cumulative.

## Practitioner Session Room

The encounter includes multiple people. The questions change:
- "What happened relationally?"
- "What interventions opened the field?"
- "What did I miss?"
- "What patterns are recurring?"

## Teacher Session Room

- "Where did students become engaged?"
- "Which explanation landed?"
- "Where did confusion begin?"

## Team Session Room

- "Where did alignment emerge?"
- "Where did we stop listening?"
- "What decision still feels unresolved?"

---

## Platform Integration

Because the Encounter is primitive, everything in the platform can speak the same language:

- **MAIA** doesn't remember "sessions." It remembers encounters.
- **Vision Studio** organizes encounters into a developmental field.
- **Witness** (faithful observation layer) references encounters.
- **Recognition** emerges from encounters.
- **Development** is tracked across encounters over time.

Renaming the core concept later — from "session" to "encounter" — would require a platform-wide migration. The time to establish the canonical word is now, before the data model and language proliferate.

---

## Implementation Note

The `encounters` table already carries a `type` column (or should — add if missing). The type determines:
1. Which Session Room lens UI is offered
2. Which MAIA inquiry mode templates are loaded
3. Which developmental trajectory tracking is relevant

The Encounter workspace page (`/studio/encounters/[encounterId]`) is the shared foundation. Lens-specific behavior is configured via the encounter type, not by building separate pages or data models.

---

## What This Is Not

This is not a claim that all encounter types are equally developed today.

Today: the Practitioner Session Room is the primary build target.

Tomorrow: Personal Session Room, Group Session Room, and eventually other encounter types.

The canonical naming is established now so the infrastructure built today does not need to be renamed when the next lens is added.

---

## Connection to Broader Architecture

- `docs/canon/SESSION_ROOM_LIVING_ENCOUNTER.md` — the living encounter as relational intelligence environment
- `docs/canon/LIVING_FIELDS.md` — encounters as contributions to an evolving field
- `docs/canon/EPISTEMIC_JURISDICTION.md` — authority over meaning stays with the person
- `docs/canon/PREPARATION_IS_NOT_AUTHORIZATION.md` — naming encounter types does not authorize their build

The Encounter is not a schema decision. It is an ontological commitment.
