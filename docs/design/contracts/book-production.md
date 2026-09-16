---
room: Book Production
human_activity: preparing a finished book from the current Work while preserving authorship, production truth, and an inspectable path from proof to final artifact
surfaces:
  - app/press/manuscript/BookProductionPanel.tsx
  - app/press/manuscript/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — production decisions belong where the writer makes the book, not in an administrative dashboard
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — publication roles and omissions are explicit member acts
  - MAIA_SOVEREIGNTY_INVARIANTS — the system may refuse Final; it may not silently repair authorship or legal matter
  - STUDIO_COPY_VOICE — name human publication acts, not schema or rendering machinery
reference_surfaces:
  - docs/design/contracts/writers-studio-rebuild.md
  - docs/programme/HPB-02_FRONT_MATTER_AND_FINAL_GATE_EVIDENCE_2026-09-16.md
  - docs/programme/HPB-03_AUTHOR_OWNED_PUBLICATION_PLAN_EVIDENCE_2026-09-16.md
shared_with_house: Press serif typography, restrained gold for active state and explicit gestures, calm refusals, member-owned provenance, and truthful recovery language
distinct_to_room: this is where an authored Work becomes a produced book; the room exposes publication readiness, proof/final distinction, front-matter roles, and exact reversible production omissions without turning production metadata into manuscript prose
screenshot_desktop: docs/design/contracts/screenshots/book-production-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/book-production-mobile.png
experience_verification: local browser walk on the HPB-04 branch with synthetic member-scoped publication workspace responses; desktop and mobile verified readiness hierarchy, bounded front-matter scrolling, reversible role assignment controls, Proof availability, and Final disabled while blockers remain
---

# Book Production — Experience Contract

## What this room is for

The writer comes here when the Work is becoming a book. The activity is not file export; it is deciding what belongs in the produced object, seeing what still blocks Final, making a proof, and eventually authorizing one exact production state as final.
## Arrival

> **Prepare this book.**

The first question is readiness: whether this exact current writing can become Final, and if not, which production decisions remain. The room never hides a blocker behind a disabled button with no explanation.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| inspect an unfinished physical/digital book | `Download Proof PDF / EPUB` | proof is explicitly not Final |
| name publication matter | `Assign Title Page`, `Assign Copyright`, etc. | names the book object the writer is authoring |
| leave imported material out of produced artifacts | `Omit from book` | excludes production output without deleting source text |
| reverse a production decision | `Clear` | one explicit undo; the manuscript remains untouched |
| authorize a publication artifact | `Download Final PDF / EPUB` | available only after the final-production gate is clean |

## Forbidden here

- inferring a publication role from body prose and saving that inference as author intent;
- binding production decisions to stale source-section ids when a current draft identity exists;
- deleting manuscript text merely because it should not appear in a produced edition;
- silently repairing malformed legal copy, duplicate copyright blocks, or import debris;
- calling a Proof final, or enabling Final while the production preflight still has blockers;
- rendering an automatic title page in addition to the author-owned title-page object;
- presenting readiness as passive information when the writer has a lawful gesture to resolve it.

## The Hallmark test

Elemental Alchemy — Hallmark Edition is the acceptance target. The room is finished only when the writer can understand why Final is blocked, resolve those decisions without losing manuscript custody, make an inspection proof, and produce a final artifact whose source revision and production choices are reconstructable.