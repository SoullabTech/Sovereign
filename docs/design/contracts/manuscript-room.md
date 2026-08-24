---
room: Manuscript Room
human_activity: working directly with one long-form manuscript, at length, in one continuous measure — and the threshold where existing writing is brought in
surfaces:
  - app/press/manuscript/page.tsx
  - app/press/manuscript/WorkingDraftEditor.tsx
  - app/press/manuscript/WriterField.tsx
change_class: structural
structural_rationale: >
  Created for WS-01 (source custody), whose change to this surface is deliberately invisible:
  an arrival identifier is threaded from ingest through to the save act, and .txt/.md uploads
  take the same server transport every other file already takes so their bytes can reach
  custody. No copy, layout, control, state or gesture changes; the member sees the same room
  behaving the same way. The gate fires because the file is staged, not because the experience
  moved. This contract therefore carries no screenshots and claims no experiential evidence —
  it governs what this room IS and what may not change about it, and the first change here that
  is actually experiential must flip change_class, supply both renders, and record a real
  verification before it can pass.
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - MAIA_OATH — no guru stance; the room holds the member's words and claims nothing about them
  - WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION — this is the long-form instrument, not the publication field
  - WRITERS_STUDIO_FLOOR_PLAN — arrival and inhabitation are different rooms and need different contracts
  - "Master brief §4 — source artifact → source text → interpretation → work structure"
  - "Master brief §5 — machines may detect; they may not silently declare"
reference_surfaces:
  - docs/design/author-studio/MANUSCRIPT_ROOM_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md
  - docs/design/author-studio/MANUSCRIPT_ROOM_IDENTITY_CONTRADICTION_2026-08-14.md
  - docs/design/author-studio/WRITERS_STUDIO_FLOOR_PLAN_2026-08-14.md
  - docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
  - docs/programme/WS-01_SOURCE_CUSTODY_UNIT_DEFINITION.md
  - docs/design/contracts/studio-home.md
shared_with_house: the Press palette and serif the member crosses in from Studio Home · gesture
  language in human verbs · provenance voice — every fact shown is a member-authored fact or an
  observable one, never an inference · the working-draft engine's save grammar (autosave, kept
  versions, exit guard, terminal conflict) shared with every writing surface
distinct_to_room: this is the only room that is also a threshold. Existing writing enters the
  Studio here, which makes it the one surface where the difference between what arrived, what the
  machine read, and what the member confirmed is decided rather than merely displayed. Everywhere
  else in the Studio a manuscript is already a manuscript; here it is still becoming one, and the
  room is answerable for not losing anything on the way.
deviation: this contract is authored after the room it governs, and for a structural unit rather
  than a design pass. Its authored design text is the 2026-08-14 draft, cited rather than copied.
authority: the design canon gate (docs/design/contracts/README.md), which requires a contract for
  any member-facing surface a change touches; and the precedent of docs/design/contracts/studio-home.md
  for citing an existing draft as the authored text rather than restating it. No design ruling is
  claimed here, and WS-01's prohibition on a visible Manuscript Room redesign is untouched.
---

# Manuscript Room — Experience Contract

**The authored design text is
`docs/design/author-studio/MANUSCRIPT_ROOM_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md`**, cited so the
design record and the build cannot be confused.

## What this room is for

One manuscript, at length, in one continuous measure. It is also the **threshold**: the place
existing writing enters the Studio.

## What this room is answerable for

Because it is the threshold, it carries a duty no other writing surface has: **what arrives must
survive arriving.**

- **The arrival is preserved before anything interprets it.** Bytes and their extraction go into
  custody at ingest, before the member can edit and before segmentation runs — because after that
  point nothing the client sends can honestly be called *what arrived*.
- **Files have artifacts; pasted words do not.** A file-backed import is `artifact_extraction`; a
  paste is `member_supplied_text`, and no artifact is invented for it. Neither is given provenance
  it never had.
- **No arriving line is silently discarded.** Segmentation runs under an omission control that
  reports rather than repairs, because a segmentation that loses text is a defect to be seen.
- **Interpretation is not structure.** The cuts this room proposes are candidates. They become the
  Work's structure only because the member confirmed them.

## What may not change here without a new contract

The member-visible grammar of arrival: how writing is brought in, what the member is shown before
anything is saved, and the relationship between the preserved source and the editable draft. A
change to any of those is experiential, and this contract's `change_class` must move with it.
