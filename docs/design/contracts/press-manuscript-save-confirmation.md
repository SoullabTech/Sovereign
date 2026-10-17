---
room: Soullab Press — Confirm a manuscript
human_activity: bringing the writer's own manuscript into a durable Work by one deliberate Save
surfaces:
  - app/press/manuscript/page.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — a writing room rests on the author's real Work, not a second invented copy
  - MAIA_SOVEREIGNTY_INVARIANTS — confirmation belongs to the writer, never the network retry
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — no implicit promotion of a preview into a Work
reference_surfaces:
  - docs/design/contracts/writer-worktable-section-native.md
  - docs/programme/WS_STANDARD_FIRST_BETA_AND_SOVEREIGN_UPGRADE_DECISION_20261017.md
  - docs/specs/MANUSCRIPT_INGEST_SPEC_2026-07-21.md
shared_with_house: one explicit Save, clear ownership, quiet continuity when a network reply is interrupted
distinct_to_room: >
  Press retains its accepted preview/correct-sections/Save manuscript gesture
  and hands off to the same Writer's Studio Work. A pasted Source has no invented
  upload artifact. A member's file Source remains governed by its separate
  original upload and claim custody.
structural_rationale: >-
  This does not change the member-facing copy, layout, spacing, navigation,
  button, transition or rendered Worktable. It changes only the hidden
  request identifier used by the existing Press Save manuscript button:
  identical retries in one continuing preview carry the same random UUID;
  altered text or confirmed section cuts mint a new UUID. This prevents
  accidentally creating a second Work after a lost HTTP reply. The
  identifier remains in the component's memory, never a URL or persistent
  browser store. A separate physical fictional PostgreSQL test covers
  concurrent double-submit, changed-payload refusal, deleted-Work tombstone
  and member-isolation. It is not an authentic on-device UX witness.
---

# Press manuscript confirmation — one writer gesture, one Work

The writer previews the original, adjusts section boundaries, and chooses
**Save manuscript** once. A duplicated browser request is not an additional
author act; a new content decision is. Source text, section membership and
the receipt commit together for the pasted-source branch. A file-backed Source
still uses the existing separately verified upload custody.

No new visible controls or technical vocabulary are presented to the writer.
This contract does not approve the new SQL migration, real member access,
weaker storage protections, beta invitations or production deployment.
