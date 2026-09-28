---
room: House — Here · Now
human_activity: Keeping a member-chosen set of House places immediately visible and recognizable without turning quick access into a generic text menu.
surfaces:
  - app/house/HousePreferences.tsx
  - app/house/house.module.css
  - app/house/house-preferences.module.css
change_class: experiential
principles:
  - EA-SIGNATURE-UIUX-01 — House wayfinding uses one canonical holoflower geometry differentiated by restrained color
  - INHABITABLE_ARCHITECTURE_STANDARD — navigation should preserve the character of places rather than reduce them to administration
  - SOULLAB_THEME — color is functional wayfinding, not decoration
reference_surfaces:
  - app/house/HousePreferences.tsx — Center already uses the same catalog-driven holoflower family
  - app/house/house-preferences.module.css — canonical catalog tone palette for House places
  - app/house/house.module.css — accepted House threshold composition
shared_with_house: one holoflower geometry, the House catalog tone for each place, restrained glow, and member-controlled placement.
distinct_to_room: Here · Now is a compact immediacy strip. It uses smaller holoflowers than Center but preserves the same place identity and color language.
screenshot_desktop: docs/design/contracts/screenshots/house-here-now-holoflowers-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/house-here-now-holoflowers-mobile.png
experience_verification: 2026-09-27 authenticated local witness on localhost:3597 using a temporary member. Default Here · Now rendered nine eligible shortcuts and exactly nine colored holoflower marks at 1440x1000 and 390x844. The repair removes the generic per-place glyph pseudo-elements and the one-off Astrology-only holoflower exception, then renders the same catalog-driven holoflower mark for every Here · Now place. Founder visual witness accepted the restored colored holoflower treatment in the live House. Temporary member and session were deleted; residue zero.
---

# House Here · Now — Colored Holoflower Wayfinding

## Ruling

Here · Now uses the same visual identity system as the House Center:

> **one canonical holoflower geometry, differentiated by place color.**

The compact list does not substitute generic glyphs for the places.

## Why this repair exists

The House catalog already carries a tone for every place.

Center correctly translates that tone into a colored holoflower.

Here · Now had regressed to text plus assorted Unicode glyphs, with Astrology alone retaining a holoflower exception. That broke the visual language in two ways:

- the same place had one identity in Center and another in Here · Now;
- one place received privileged visual treatment that the other quick-access places did not.

The repair restores one grammar.

## Behavior

Each visible Here · Now shortcut renders:

- the catalog place;
- the catalog tone;
- one 18px canonical holoflower;
- the place label.

No route, preference, eligibility, ordering, or access logic changes.

## Tone mapping

The colors remain catalog-driven:

- amber — Writing, Ideas;
- rose — Relationships;
- green — Practices, Changes, Daily Anchor;
- blue — Community, Astrology, Living Field, Co-lab;
- gold — Studio, Decisions;
- violet — Dream, Reflections, Wisdom, Divination;
- slate — Journal, Library.

The mark is therefore not a hard-coded list of current shortcuts.

Any eligible House place added to Here · Now inherits its existing catalog tone.

## Responsive law

Desktop and mobile use the same mark identity.

The layout may change with available width; the place does not lose its visual identity when the House compresses.

## Exact scope

This act changes only Here · Now visual wayfinding.

It does not alter:

- House preferences;
- shortcut membership;
- Center membership;
- place eligibility;
- routes;
- crossings;
- House topology;
- catalog semantics.

## Acceptance

Founder visual witness: accepted.

Authenticated local witness:

- desktop links: 9;
- desktop holoflower marks: 9;
- mobile links: 9;
- mobile holoflower marks: 9;
- residue: 0.
