---
room: Focus
human_activity: turning a captured thought into a chosen next action
surfaces:
  - components/focus/InboxTriage.tsx
  - components/focus/NextStepBuilder.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE — the interface serves human activity
  - SOULLAB_THEME — low-noise hierarchy
reference_surfaces:
  - components/focus/InboxTriage.tsx
  - components/focus/NextStepBuilder.tsx
shared_with_house: explicit member choices and quiet completion
distinct_to_room: brief capture and next-action flows
structural_rationale: Normalize absent stewardship metadata from null to undefined at the optional completion callback. No markup, styling, interaction sequence, request, or successful metadata is changed. This resolves two TypeScript diagnostics without widening the result contract.
---

# Focus completion metadata

The existing capture and next-step surfaces were inspected. Both callbacks declare
stewardship optional; when a request supplies none, absence must satisfy that
contract. Existing rendering and visual identity are preserved.
