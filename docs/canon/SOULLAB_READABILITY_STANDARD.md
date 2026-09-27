# Soullab Readability Standard

**Standing:** House-wide visual-language canon  
**Applies to:** member-facing Soullab rooms, facets, crossings, settings, Studio surfaces, and future interfaces

## Governing principle

> **Quiet is not the same as small.**

Soullab uses spaciousness, contrast, weight, typography, and placement to create hierarchy.
Meaningful information must not become physically difficult to read merely because it is secondary.

The product should feel comfortable at normal browser zoom for adults across a broad age range.
A member should not have to zoom simply to read ordinary content, metadata, or actions.
## Font-family grammar

### Serif — meaning
Use the literary/serif House register for:

- member-authored writing;
- questions that invite reflection;
- readings and interpretations;
- room and section titles;
- meaningful quotations;
- longer contemplative prose.

### Sans — orientation
Use the sans/interface register for:

- navigation;
- actions and controls;
- dates and times;
- provenance and source labels;
- categories and filters;
- status and system orientation.

A room may modulate the specific family within the accepted House visual authority,
but it should preserve this meaning/orientation distinction.
## Semantic size roles

| Role | Baseline | Family | Use |
|---|---:|---|---|
| Room title | 28–32px | serif | primary room/page heading |
| Section title | 24–28px | serif | major section within a room |
| Item title | 18–19px | serif | reading, card, object, source title |
| Reading prose | 17–18px | serif | member content, interpretation, substantial reflective prose |
| Body/interface | 16–17px | sans | ordinary explanations and supporting interface copy |
| Action | 16px minimum | sans | buttons, tabs, links, navigation |
| Meaningful metadata | 14–15px | sans | dates, provenance, source names, status |
| Decorative marker | 12px | sans | non-essential uppercase/category ornament only |

These are product defaults, not a prohibition on larger typography.
## Floors

- **16px** is the ordinary-copy floor.
- **17px** is the long-form reading floor.
- **16px** is the action-label floor.
- **14px** is the meaningful-metadata floor.
- **12px** is reserved for decorative markers that carry no unique information.
- Interactive targets remain at least **44px** high/wide where applicable.

Text below 14px requires an explicit reason and may not be the sole carrier of:

- instructions;
- actions;
- provenance;
- dates required for orientation;
- member-authored content;
- interpretation or guidance;
- warnings, errors, or status;
- source identity.
## Hierarchy without shrinking

Prefer, in order:

1. placement and whitespace;
2. serif vs sans role;
3. weight;
4. contrast;
5. letter-spacing;
6. line length;
7. size.

Do not default to shrinking secondary text.

Muted text should remain readable through contrast that still meets the relevant accessibility requirement.

## Reading measure

Long-form prose should usually remain between roughly **45–75 characters per line**.
Increasing type size should not produce excessively wide measures.

## Responsive behavior

Mobile is not permission to reduce meaningful copy below the floors above.
Allow wrapping, stacking, increased vertical space, and fewer simultaneous controls instead.
## Adoption law

New member-facing surfaces must use these semantic roles or document why a different scale is necessary.

Existing accepted rooms are migrated when touched. A migration should preserve the room's
composition and atmosphere while correcting under-sized meaningful text.

A readability correction does not authorize redesign of an accepted room.

## Reference implementation

The shared code tokens live at:

`lib/house/readability.ts`

Saved Readings was the first House surface explicitly conformed to this standard after founder review on 2026-09-27. Divination then adopted a shared semantic type map at `lib/oracle/divinationTypography.ts`, governing equivalent I Ching, Tarot, Runes, and embedded MAIA fields without flattening their distinct visual identities.
