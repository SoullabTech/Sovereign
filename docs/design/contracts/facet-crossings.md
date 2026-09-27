---
room: Facet Crossings
human_activity: carrying something from one part of my life into another without losing its origin or letting the system decide what it means
surfaces:
  - app/changes/page.tsx
  - app/studio/decisions/[id]/page.tsx
  - app/studio/decisions/new/page.tsx
  - components/maia/changes/ChangeJourney.tsx
  - components/maia/changes/ChangesSheet.tsx
  - components/maia/changes/NameYourChange.tsx
  - components/reflections/ReflectionDetail.tsx
  - components/house/FacetCarryNotice.tsx
  - components/house/FacetOriginTrail.tsx
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — crossings are as important as rooms; source identity survives the crossing
  - MAIA_OATH — no hidden propagation, no accidental authorship, no system substitution for member meaning
  - INHABITABLE_ARCHITECTURE_STANDARD — the member must know where they came from, what is moving, and how to return
reference_surfaces:
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/reflections-room.md
  - docs/design/contracts/daily-anchor.md
shared_with_house: visible provenance, member-explicit authority, quiet return doorways, and continuity without turning the House into a dashboard or universal graph
distinct_to_room: this contract governs the seam between rooms rather than the composition of any one room. The source remains a source, the receiving facet requires its own authorship act, and the durable relation stores identities only.
screenshot_desktop: docs/design/contracts/screenshots/facet-crossing-changes-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/facet-crossing-decision-mobile.png
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597. Four read-only crossings were walked:
  Journal→Changes, Journal→Personal Decisions, Reflection→Changes, Reflection→Personal Decisions.
  In every receiver the source was visible as provenance and all target meaning fields remained blank.
  A bounded local persistence witness then created one temporary Change and one temporary Personal Decision
  from the pre-existing Journal test entry explicitly labelled Safe to delete. Each target received exactly one
  member_facet_crossings row, storing only member id, crossing id, source facet/id, target facet/id, and time.
  The target detail surfaces then displayed Where this began with a Return to source doorway. Journal's
  return URL reopened the exact source entry by id. All temporary witness targets and crossing rows were deleted;
  residue verified at zero. Production was not touched.
---

# Facet Crossings — Experience Contract

## What this seam is for

A life does not divide itself into product sections.

A Journal entry may reveal a change.
A Reflection may bring a choice into focus.
A decision may later become part of a larger pattern.
A change may alter a relationship, practice, piece of writing, or sense of direction.

Soullab therefore needs movement between facets without collapsing them.

> **The source accompanies the member. It does not author the destination.**

This contract governs that movement.

## First live crossing set

The first durable crossing slice is deliberately narrow:

| From | Gesture | To |
|---|---|---|
| Journal | **Name this as a change** | Changes |
| Reflection | **Name a change** | Changes |
| Journal | **Consider a decision** | Personal Decisions |
| Reflection | **Consider a decision** | Personal Decisions |

These are member-explicit crossings only.

They do not imply that every source should become a Change or Decision. They make the doorway available.

## What crosses

Only enough identity to resolve the source under the authenticated member:

- crossing id;
- source facet;
- source object id.

The URL does **not** carry Journal prose, Reflection prose, inferred meaning, title suggestions, emotional labels, or semantic analysis.

The receiving room resolves the source server-side and may display a bounded read-only excerpt as provenance.

## What does not cross

The following remain for the member to author in the receiving room:

### Changes

- the name of the change;
- what is actually changing;
- the kind of change.

### Decisions

- the decision itself;
- its context;
- what is at stake;
- state and time pressure.

A source may have inspired those things. It is not evidence that the system knows them.

## The receiving gesture

The receiver says, quietly:

> **Came with you from Journal**

or

> **Came with you from Reflections**

and then:

> **The source stays where it is. You decide what belongs here.**

This is provenance, not prefill.

If the source cannot be authenticated and resolved, the crossing fails closed:

> **Source unavailable**
>
> Nothing has crossed. Return to the source and try again.

The target action does not become available until the source has resolved.

## Durable relation

When the member actually creates the Change or Decision, the target object and crossing relation are written in one transaction.

The crossing ledger stores only:

- member identity;
- canonical crossing gesture;
- source facet + source id;
- target facet + target id;
- timestamp.

It stores no copied prose, no summary, no inferred relationship, no importance score, and no semantic vector.

> **The relation is durable. The meaning remains living.**

## Return is part of the crossing

A target created through a crossing displays:

> **Where this began**

with the source facet, source label, and:

> **Return to source →**

Journal returns reopen the exact member-owned entry by id.

A missing source does not erase the target. The target remains the member's authored Change or Decision and the UI states that the original source is no longer available.

## Source identity law

A Journal entry remains a Journal entry.

A Reflection remains a Reflection.

A Change is not a promoted Journal entry.

A Decision is not an extracted conclusion.

The crossing records relationship without merger.

## Authority law

A crossing becomes durable only when the member completes the receiving facet's own authorship act.

Merely opening Changes or Decisions from a source does not write anything.

Merely viewing a source does not imply permission to propagate it.

Technical readability between subsystems is not crossing authority.

## Failure modes

### Silent promotion

The system decides that a Journal entry "is a change" and creates one automatically.

**Forbidden.**

### Prefilled meaning

The system inserts the source prose into a Decision context or generates a Change title before the member authors it.

**Forbidden.**

### Content-bearing URLs

Private source text is carried in query parameters.

**Forbidden.**

### Universal transfer

One generic endpoint permits arbitrary facet/object movement because the backend can resolve it.

**Forbidden.** Crossings are individually admitted.

### One-way door

The member can move into another facet but cannot see where the new object came from or return.

**Incomplete crossing.**

### Animation as obstruction

A transition effect prevents the receiving state from mounting.

**Defect.** Movement between facets is more important than transition animation.

## Current implementation substrate

The first durable crossing relation is held by:

`member_facet_crossings`

Its schema is intentionally relational and content-free.

The runtime allowlist lives in:

`lib/house/facetCrossing.server.ts`

The canonical member-facing crossing registry remains:

`lib/house/livingOrientation.ts`

The ledger does not create a universal graph or authorize automatic Field projection.

## What this does not yet authorize

This slice does not automatically connect:

- Changes → Decisions;
- Decisions → Daily Anchor;
- Changes → Practices;
- Relationships → Journal;
- Writing → Reflections;
- any facet → Living Field projection;
- cross-facet elemental or Spiralogic interpretation.

Those may become valuable crossings, but each needs a real receiving substrate and its own authority/provenance rule.

## Product test

At every crossing, ask:

> **Can I feel that I carried something with me without feeling that Soullab decided what it became?**

If yes, continuity is serving the person.

If no, the system has turned flow into capture.
