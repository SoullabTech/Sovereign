---
room: MAIA Conversation
human_activity: speaking with MAIA and, when explicitly chosen, entering a governed teaching context without leaving the conversation
surfaces:
  - app/maia/page.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE — room identity follows human activity rather than hidden system capability
  - MAIA_OATH — MAIA accompanies and teaches without becoming authority over the member
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — client intent may request a room but cannot mint professional or research standing
reference_surfaces:
  - docs/design/contracts/conversation-turn-taking.md
  - docs/design/contracts/house-return.md
shared_with_house: the House conversation field, truthful state, restrained gestures, member sovereignty, and one continuous MAIA identity
distinct_to_room: this is MAIA's ordinary relational conversation room; teaching context may be selected for the current turn, but the room does not become a dashboard, classroom shell, or separate teacher persona
structural_rationale: T8B adds only typed teaching-room intent derived from the URL and passes it into the existing OracleConversation. No rendered control, layout, copy, palette, spacing, navigation hierarchy, or ordinary conversation gesture is changed. The server independently verifies practitioner/research standing before the intent can affect cognition.
---

# MAIA Conversation — Experience Contract

## What this room is for

This is the member's direct conversation with MAIA. The conversation remains the
primary experience whether MAIA is accompanying, explaining, or teaching.

T8B does not create a new visible classroom. It allows an explicitly requestedteaching context to travel through the existing conversation while the server
retains authority over whether that context is lawful.

## Forbidden here

- a client URL or prop silently granting professional or research authority
- a separate teacher persona replacing MAIA
- durable learner labels inferred from choosing a teaching room
- turning ordinary conversation into an ambient curriculum

## The two brand tests

**Same house?** Yes. The visible conversation is unchanged and retains the same
House field, member sovereignty, and conversational gestures.

**Distinct room?** Yes. This remains the direct MAIA conversation rather than
Writer's Studio, Studio practitioner work, Journal, or a research dashboard.
