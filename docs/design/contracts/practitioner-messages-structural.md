---
room: Practitioner Messages
human_activity: reading and responding to bounded between-session client messages while keeping response expectations and practitioner responsibility explicit
surfaces:
  - components/stellium/MessageInbox.tsx
  - components/stellium/MessageThread.tsx
change_class: structural
structural_rationale: Next 16 compatibility moves browser-safe formatting and display helpers out of the PostgreSQL-backed practitioner messages module into lib/practitioner/messagePresentation.ts. The rendered controls, copy, layout, state transitions, message policy, API calls, client selection, reply behavior, urgency labels, quick-response text, and practitioner/client authority are unchanged.
principles:
  - INHABITABLE_ARCHITECTURE — messaging remains a bounded practitioner activity rather than a generic communications dashboard
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — presentation helpers cannot acquire message, client, or practitioner authority
  - CAPABILITY HONESTY — browser code may render message presentation but server-backed message custody remains server-side
reference_surfaces:
  - app/stellium/messages/page.tsx — existing mounted practitioner messaging room
  - docs/design/now-what/reconciliation/NOW_WHAT_AMENDMENT_RELATIONAL_ARCHITECTURE_2026-08-26.md — existing bounded async messaging posture
  - docs/security/free-text-phi-doctrine.md — practitioner message free-text security boundary
shared_with_house: human-language gestures, explicit role boundaries, truthful state, and separation of presentation from server authority
distinct_to_room: this is asynchronous practitioner-to-client messaging with check-window and response-boundary semantics; it is not MAIA conversation, Writer's Studio, live chat, or a member social feed
---

# Practitioner Messages — Structural Experience Contract

This contract establishes jurisdiction for the already-existing Stellium messaging
components touched by the Next 16 client/server compatibility repair.

The repair does not redesign the room. MessageInbox and MessageThread previously
imported runtime display helpers from lib/practitioner/messages.ts, a module that
also imports PostgreSQL-backed services. Next 16 correctly refuses that server
dependency in a client bundle.

The repair extracts only browser-safe presentation functions into
lib/practitioner/messagePresentation.ts. Message custody, queries, mutation,
policy, authorization, API paths, rendered copy, layout and gestures remain
unchanged.

This contract therefore records where those components belong without claiming a
new experiential approval or visual witness.
