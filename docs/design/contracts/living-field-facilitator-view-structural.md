---
room: Living Field Facilitator View
human_activity: a practitioner reading only the field threads a member explicitly chose to share within their bounded practitioner-client relationship
surfaces:
  - app/studio/fields/[memberId]/page.tsx
change_class: structural
structural_rationale: This change does not redesign the facilitator view or alter what an authorized practitioner sees. It narrows the entry authority from generic active-practitioner status to the actual active or paused practitioner-client relationship with the requested member, before any member or field data is read.
principles:
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — practitioner role does not create authority over unrelated members
  - MEMBER_CONSENT_GOVERNS_CONNECTIONS — practitioner visibility remains a separate per-thread member act
  - CAPABILITY_DOES_NOT_CREATE_AUTHORITY — being able to address a member id or hold a practitioner role cannot widen relationship scope
  - INHABITABLE_ARCHITECTURE — the facilitator view remains a bounded human relationship room, not a platform-wide member browser
reference_surfaces:
  - components/now-what/NowWhatRoom.tsx — explicit per-thread Share with your practitioner gesture, private by default
  - app/api/now-what/field-note/[id]/route.ts — member-owned withdrawal of practitioner visibility
  - lib/coachField/identity.ts — canonical practitioner-record/member identity translation and bounded relationship authorization
  - docs/design/contracts/practitioner-messages-structural.md — bounded practitioner activity as an existing structural contract pattern
shared_with_house: truthful state, explicit human authority, member-first provenance, and relationship-bounded access
distinct_to_room: this room is the practitioner-facing read of member-shared Living Field threads; it is not a caseload browser, admin member directory, MAIA conversation, or private member field
---

# Living Field Facilitator View — Structural Experience Contract

The room already exists as a quiet practitioner read of threads a member deliberately made visible. This repair does not change its layout, copy, phase grouping, or gestures for an authorized practitioner.

The change is structural because it corrects who may cross the room's threshold. Previously, any authenticated active practitioner satisfied the page gate. The page now requires the authenticated practitioner's practice to hold a live practitioner-client relationship with the specific requested member before any target-member row or field evidence is read.

An unrelated practitioner receives a not-found outcome rather than a distinguishable authorization response, preserving the member boundary without creating an identity-probing surface.

The member's existing share and withdrawal gestures remain the authority for thread visibility. This contract adds no new disclosure, editing, notification, or practitioner capability.
