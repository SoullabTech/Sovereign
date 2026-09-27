---
room: Divination Readability
human_activity: reading, choosing, interpreting, and conversing inside Divination without needing browser zoom
surfaces:
  - app/oracle/iching/page.tsx
  - app/oracle/tarot/page.tsx
  - app/oracle/runes/page.tsx
  - components/oracle/EmbeddedMAIAChat.tsx
change_class: experiential
principles:
  - SOULLAB_READABILITY_STANDARD — meaningful Divination text remains comfortable at normal zoom
  - INHABITABLE_ARCHITECTURE_STANDARD — symbolic practice should remain inhabitable rather than become a dense information panel
  - MAIA_OATH — MAIA conversation is meaning-bearing prose and must not be visually demoted to utility text
reference_surfaces:
  - docs/canon/SOULLAB_READABILITY_STANDARD.md
  - lib/house/readability.ts
  - lib/oracle/divinationTypography.ts
shared_with_house: semantic typography roles, readable actions, readable metadata, 44px interaction floors
distinct_to_room: I Ching, Tarot, and Runes retain distinct symbolic color/palette treatments while equivalent semantic fields share one type scale
screenshot_desktop: docs/design/contracts/screenshots/divination-readability-iching-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/divination-readability-iching-mobile.png
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597. The live I Ching result and existing eight-message Embedded MAIA conversation were measured after conformance: MAIA and member message prose rendered at 17px with 25.5px line-height, composer text at 16px with a 48px control height, conversation-count metadata at 14px, and the primary I Ching interpretation/guidance field prose resolved through the shared 17–18px Divination reading role. Fresh narrow live windows for Tarot and Runes then verified their question textareas at 17px with 28.05px line-height and their primary actions at 16px, using a named Divination exception to the global 16px iOS anti-zoom form rule. I Ching, Tarot, and Runes were statically reconciled to the same semantic type map and the conformance test rejects raw text-xs/text-sm/10–12px classes across all four governed surfaces.
---

# Divination Readability Contract

## Governing law

> **Different oracle. Same readability.**

I Ching, Tarot, and Runes may differ in symbol, ritual, palette, imagery, and atmosphere.

They do not invent separate font-size hierarchies for equivalent information.
## Shared semantic roles

All Divination rooms resolve these roles from `lib/oracle/divinationTypography.ts`:

- **Section title** — major reading sections such as Oracle's Wisdom, Changing Lines, The Runes Speak.
- **Item title** — cards, runes, saved objects, embedded MAIA heading.
- **Field label** — Interpretation, Guidance, Sacred Timing, Archetypal Theme, Insight, Soul Guidance, Card Details.
- **Field body** — interpretation, guidance, card/rune interpretations, rituals, member question fields.
- **Support** — explanatory copy that helps a member choose or understand a practice.
- **Metadata** — positions, counts, source descriptors, spread/rune/card metadata.
- **Action** — Back, Cast, Save, Explore with MAIA, New Reading, Return.
- **Marker** — decorative/category micro-label only.

The semantic role determines size/family. Oracle-specific color classes may modulate tone without changing the role.
## Font-size baseline

The Divination system inherits the House floors:

- field/reading prose: **17–18px**
- support/body text: **16–17px**
- action labels: **16px minimum**
- meaningful metadata: **14–15px**
- decorative markers: **12px**

No meaningful Divination field may use ad-hoc `text-xs`, `text-sm`, or 10–12px classes.

## MAIA conversation law

Embedded MAIA is not utility text.

- MAIA prose uses the House reading role.
- Member replies use the same readable prose tier.
- The composer uses the House body role.
- Conversation count/status uses metadata.
- Send/start controls respect the action and touch-target floors.

This contract applies to future embedded Divination conversations as well as the current I Ching implementation.
## Responsive law

Narrower screens may stack, wrap, and increase vertical length.

They may not shrink meaningful text below the semantic floors to preserve a desktop composition.

## Scope

This act changes typography/readability only.

It does not change:

- divination calculations or casts;
- symbolic interpretation content;
- saved-reading persistence;
- MAIA cognition;
- crossing authority;
- oracle sequencing.

## Acceptance

The act passes when:

1. I Ching, Tarot, and Runes import the same semantic Divination type map.
2. Question-entry text, result fields, ritual text, metadata, and actions use those roles.
3. Embedded MAIA conversation uses House readability roles.
4. No raw micro typography remains in the governed surfaces.
5. Desktop and mobile witnesses preserve the visual atmosphere while remaining readable at normal zoom.
