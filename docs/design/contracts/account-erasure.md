---
room: Account Settings · Account Erasure
human_activity: asking MAIA to end my account while being told truthfully whether the governed deletion completed or refused
surfaces:
  - components/account/AccountSettings.tsx
change_class: structural
principles:
  - MAIA_OATH — never claim that personal material was deleted unless the governed act records completion
  - SOVEREIGNTY — a refusal must preserve the member's account rather than orphan material or silently narrow the request
  - INHABITABLE_ARCHITECTURE — every visible destructive control must report the actual state produced by the system
reference_surfaces:
  - docs/programme/F5-CONFORMANCE-REPAIR-01_P4_ADJUDICATION_2026-09-17.md
  - docs/design/contracts/settings.md
shared_with_house: Settings remains operational and plain-spoken; system state is named rather than implied.
distinct_to_room: Account erasure is irreversible only when the governed act actually completes, so refusal/unavailable states are first-class outcomes rather than errors hidden from the member.
structural_rationale: >
  F5 P5-D does not redesign Settings. It replaces one false completeness sentence
  and one silent non-2xx path with a direct projection of the governed erasure
  act. The confirmation control, placement and destructive-action threshold stay
  where they are. Completion still exits the account. Refusal or unavailable
  leaves the member in place and displays the durable request result, blockers
  and content-free request reference. This is a truthfulness/control repair, not
  a new room composition.
---

# Account erasure — truthful outcome contract

The control may request full account erasure. It may not promise completion in
advance. A completed governed act may end the account; every other outcome must
leave the member able to see that deletion did not complete and why.

## Required member-visible states

- **Completed:** the server says `accountChanged=true`; only then may the client clear local account state and leave Settings.
- **Governed refusal:** the account remains unchanged and the member sees the member-legible blocked categories.
- **Evidence unavailable:** the account remains unchanged and the member is told a complete governed plan could not be established.
- **Failed/rolled back:** the client never converts failure into success or redirects as if deletion completed.

## Forbidden

- “all associated data” or equivalent completeness language before a completed governed act
- redirecting on HTTP success alone without `state=completed` and `accountChanged=true`
- dropping a 409/503 response without member-visible explanation
- sending a member id from the client to select the deletion subject
- treating the request reference as authority; it is only a content-free receipt
