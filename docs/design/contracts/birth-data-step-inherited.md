---
room: Onboarding — Birth Data
human_activity: choosing whether to share birth data during onboarding, and entering it only after opting in

surfaces:
  - components/onboarding/BirthDataStep.tsx

# Drafted during the production-lineage reconciliation of 2026-10-31. The
# component reached canonical by merging production runtime 9856e27f7.
change_class: structural
structural_rationale: >-
  components/onboarding/BirthDataStep.tsx on this branch is byte-identical to
  what production serves at 9856e27f7. Canonical had not changed it since the
  two lines diverged. Production's commit f70efee54 rewrote it so that
  onboarding advances only after the member's own profile consent is verified.
  Merging changes repository custody, not member experience. The onboarding
  owner owes an experiential contract before the next change that alters it.

principles:
  - Consent for memory — no stealth memory; birth data is held only after an explicit member choice
  - Onboarding invariants (CLAUDE.md) — one universal, one-time flow
  - Cultural sovereignty / Invariant 14 — astrology is not assumed desirable; declining is a full choice

reference_surfaces:
  - docs/design/contracts/onboarding-threshold.md
  - components/onboarding/BirthDataStep.tsx (production 9856e27f7, as read)

shared_with_house: >-
  Part of the onboarding threshold. It is one step in the universal sequence
  described in onboarding-threshold.md.
distinct_to_room: >-
  It is the only onboarding step that asks for astrological data, so it is
  the only one whose choice is "share or decline", with no default answer.
---

# Onboarding — Birth Data (inherited, pending owner review)

**Inherited, not authored.** This contract exists so the merge can land. It
records what production's version does, according to its commit (`f70efee54`):
onboarding advances only after the member's own consent to the profile is
verified. It grants no design approval. The onboarding owner should replace it
with an experiential contract, with screenshots and a walk, before the next
change that alters the step.
