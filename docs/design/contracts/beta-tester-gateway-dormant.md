---
room: Onboarding Threshold
human_activity: legacy beta invitation entry, if this dormant component is ever reactivated
surfaces:
  - components/onboarding/BetaTesterGateway.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — dormant implementation must not silently acquire authority by being present in the tree
reference_surfaces:
  - docs/design/contracts/onboarding-threshold.md — active sibling threshold contract; consulted for admission-boundary semantics
shared_with_house: server-side admission, fail-closed refusal, and no browser-resident human-record corpus
distinct_to_room: none currently; this component has zero consumers in the repository and therefore no live member room
structural_rationale: The current repository has zero importers or render sites for BetaTesterGateway. This change only removes its client-side credential corpus and points its dormant admission logic at the server boundary. No current member-visible route, copy, layout, gesture, or rendered state is changed. If the component is reactivated, it must receive an experiential contract before that use ships.
---

# Dormant Beta Tester Gateway — Experience Contract

This contract exists because the design-canon ratchet correctly sees a member-facing component file being changed even though the component is currently unmounted.

The only standing established here is containment: a dormant component may not keep an identified contact list or credential corpus in browser code merely because nobody calls it today.

It does **not** authorize reactivation, define a beta onboarding experience, or make this component a reference surface. Any future importer reopens the experiential question.