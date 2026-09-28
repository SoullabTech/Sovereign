---
room: Divination Saved Readings
human_activity: returning to a symbolic reading I explicitly saved and continuing from the exact source rather than from a detached summary
surfaces:
  - app/oracle/reflections/page.tsx
change_class: structural
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — source identity survives every crossing and return is part of the crossing
  - MAIA_OATH — symbolic material may deepen recognition without becoming determination or hidden memory
  - INHABITABLE_ARCHITECTURE_STANDARD — returning from another facet must reopen the actual source object, not a generic archive
  - SOULLAB_READABILITY_STANDARD — meaningful reading, metadata, and actions remain comfortable at normal zoom; quietness is not achieved by tiny text
reference_surfaces:
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
  - docs/canon/SOULLAB_READABILITY_STANDARD.md
  - docs/design/contracts/facet-crossings.md
  - components/reflections/ReflectionDetail.tsx
shared_with_house: explicit provenance, source custody, reversible movement between facets, and member-visible crossing gestures
distinct_to_room: this surface is the member's archive of I Ching, Tarot, and Runes readings. It preserves the reading as symbolic source material and supports exact return by reading identity.
screenshot_crossing: docs/design/contracts/screenshots/divination-reflection-crossing-desktop.png
screenshot_exact_return: docs/design/contracts/screenshots/divination-exact-return-desktop.png
experience_verification: >
  2026-09-27 authenticated local 3597 witness. A temporary I Ching reading explicitly labeled SAFE TO DELETE was saved through the real member gesture path. The resulting Reflection showed WHERE THIS BEGAN with a Divination source and Return to source. The crossing ledger contained exactly divination-save-to-reflections from iching:<reading id> to the Reflection id. Following Return to source reopened the exact saved I Ching reading expanded in Saved Readings. Screenshots capture both sides of that round trip. The temporary reading, Reflection and crossing row were then removed from the local development database.
structural_rationale: >
  This change does not redesign Saved Readings. It adds one returnability seam:
  when another facet links back with ?reading=<type:id>, the existing archive
  selects that reading's type, expands the exact owned reading, and scrolls it
  into view. No new interpretation, persistence, classification, or source
  content is accepted from the URL. If the identity is missing or stale, the
  archive behaves normally.
---

# Divination Saved Readings — Returnability Contract

## What this surface is for

Saved Readings is where a member can return to symbolic material they explicitly chose to keep.

A reading is not a Reflection, even when a Reflection was created from it.

> **The reading remains the source. The Reflection remains the keep.**

## Exact-return law

A governed crossing back into Divination may carry only the reading's durable identity:

- `iching:<id>`
- `tarot:<id>`
- `runes:<id>`

The archive resolves the source from the member's own saved readings and opens that exact object.

The URL does not carry interpretation text, cards, runes, hexagrams, conclusions, or generated meaning.

## What crosses out

`Save Reading` may explicitly carry a saved reading into Reflections.

That act does not erase or mutate the source reading.

The receiving Reflection may carry:

- source identity;
- truthful source excerpt;
- the existing reading text;
- a return doorway.

It may not silently become MAIA memory or a new interpretation.

## Return is required

A Divination → Reflection crossing is incomplete unless the member can later move:

> Reflection → **Where this began** → exact saved reading

Returning must reopen the specific source object, not merely the Saved Readings landing page.

## Forbidden here

- reconstructing a reading from Reflection text;
- putting reading content into a return URL;
- treating a Reflection as the canonical copy of a reading;
- silently saving every reading as a Reflection;
- changing symbolic interpretation while crossing;
- automatic memory writes at the crossing seam;
- generic "back to Divination" when the exact source is still available.

## Brand test

**Same house?** Yes. The member can move across Soullab without losing custody, provenance, or where they came from.

**Distinct room?** Yes. Divination remains the symbolic practice and its archive; Reflections remains the place for personal gems the member chose to keep.
