---
room: Ideas — Work relationship bridge
human_activity: recognizing that an Idea belongs with a larger creative Work without turning the Idea into manuscript prose or erasing its own identity
surfaces:
  - app/maia/ideas/[id]/page.tsx
  - app/maia/ideas/[id]/IdeaWorkBridge.tsx
change_class: experiential
principles:
  - THE_MEMBERS_WORLD_IS_PRIMARY — the member's own Ideas, Works, notes, and creative forms remain primary objects rather than raw material for system synthesis
  - INHABITABLE_ARCHITECTURE — an Idea remains an Idea-room object; relationship to a Work does not collapse two rooms into one
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — only the member declares that an Idea feeds a Work, and only the member removes that belonging
  - MAIA_SOVEREIGNTY_INVARIANTS — system momentum never promotes, copies, rewrites, or interprets the Idea merely because a relationship exists
  - CAPABILITY HONESTY — the surface says exactly what the act does: records belonging, not manuscript insertion
reference_surfaces:
  - docs/design/author-studio/WRITER_CANVAS_EXPERIENCE_DEFINITION_2026-08-05.md
  - docs/design/author-studio/WRITER_CANVAS_ROOM_MAP_2026-08-05.md
  - docs/design/contracts/flagship-studio.md
  - docs/design/contracts/studio-home.md
shared_with_house: restrained warm accent for a meaningful member act · human-language relationship verbs · explicit preservation of member object identity · clear return paths between rooms
distinct_to_room: the Idea remains the primary object and the chronological idea conversation remains visually dominant. The Work bridge is a subordinate relational gesture: it records only the member's declaration that this Idea feeds a Work, optionally with the member's own sentence about that relationship. It never copies the Idea into writing, never commissions MAIA, and never turns Work belonging into authorship.
screenshot_desktop: docs/design/contracts/screenshots/ideas-work-bridge-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/ideas-work-bridge-mobile.png
experience_verification: >-
  FRESH LOCAL WITNESS, 2026-09-28, from the P4R1 candidate worktree on a fresh Next dev server at localhost:3137 against the disposable founder database. The long-lived 3136 process had degraded after many hours of hot reloads, so it was not used as evidence. Desktop witness at a 1440-class Safari window showed the member's Idea title and chronological Idea conversation remaining primary, with one subordinate amber-bordered relationship surface reading "Let this idea feed a Work" and the explicit boundary "The Idea stays here. Nothing is copied into your manuscript. This only records that you say the Idea feeds a Work." The visible act was "Bring to a Work"; no manuscript insertion or MAIA commission appeared. Mobile witness at a 390-class content width preserved the same hierarchy and wording without clipping or converting the bridge into a dashboard. Fresh route checks on 3137 returned 200 for the Idea detail page and 401 for the unauthenticated Ideas API, while Writer's Studio returned 200. The bridge's dedicated behavioral tests separately prove ownership, add/remove relationship semantics, and no Idea-content copying.
---

# Ideas — Work relationship bridge

## What this room is for

A person may discover that an Idea belongs with something larger they are making. This gesture lets them say that explicitly without forcing the Idea to stop being an Idea.

The relationship is **belonging, not promotion**. An Idea can feed a book, course, talk, research project, or another Work while retaining its own chronology, decisions, reflections, and return life.

## Arrival

> **Let this idea feed a Work**

The member is told the consequence before the action:

> The Idea stays here. Nothing is copied into your manuscript.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| declare belonging | “Bring to a Work” | The member places the Idea in relationship; the system does not “convert,” “promote,” or “generate” from it |
| name the relationship | optional member sentence | The member may say why this Idea feeds the Work in their own words |
| withdraw belonging | “no longer feeds this Work” | Removes only the relationship; the Idea remains |
| return to writing | open the Work from Writer’s Studio | Navigation changes place, not object identity |

## Forbidden here

- copying Idea content into manuscript prose merely because belonging was declared
- silently commissioning MAIA to read the Idea for the Work
- deleting or converting the Idea when the relationship is removed
- choosing a Work automatically
- ranking candidate Works
- system-authored explanation masquerading as the member's reason the Idea belongs
- treating Ideas as a hidden material store rather than a room with its own continuity

## The two brand tests

**Same house?** Yes. The act uses restrained warm attention, explicit agency, clear provenance, and the same relationship language used by Writer's Studio materials.

**Distinct room?** Yes. The Idea and its evolving conversation remain the room. Writer's Studio receives only the declared relationship. A member can tell whether they are developing an Idea or writing a Work without reading a route label.
