---
room: Living Field — Facet Flow Projection
human_activity: seeing the paths I explicitly chose to make between parts of my life without turning those paths into psychological interpretation
surfaces:
  - components/maia/living-field/LifeFacetFlowPanel.tsx
  - components/maia/living-field/PersonalLivingFieldDashboard.tsx
  - app/changes/page.tsx
  - components/maia/changes/ChangesSheet.tsx
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — crossings preserve continuity; the member remains the center and the Field reveals relationship without merger
  - MAIA_OATH — the system may show an authored relation; it may not silently add meaning to it
  - INHABITABLE_ARCHITECTURE_STANDARD — member-authored evidence appears before system-inferred/developmental readings
  - LIVING_CONSTELLATION_PROJECTION_CONTRACT_LC02 — projection remains read-only and source authority stays attached
reference_surfaces:
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
  - docs/design/contracts/facet-crossings.md
  - docs/design/contracts/living-constellation-projection.md
shared_with_house: the same source identities and crossing gestures used in the rooms are projected here without copying or reauthoring them
distinct_to_room: Living Field does not create the relation. It shows recent member-explicit relations already created elsewhere and keeps source and target independently returnable.
screenshot_desktop: docs/design/contracts/screenshots/life-facet-flow-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/life-facet-flow-mobile.png
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597. A single temporary Change
  was created from the pre-existing Journal test entry explicitly labelled Safe to delete.
  The durable crossing resolved in Living Field as JOURNAL → CHANGE under
  Threads across your life. The source and target labels were both real source-object
  labels, the target href resolved to /changes?change=<id>, and the flow appeared before
  Emotional Weather and Living Field Dimensions. The panel stated that the line records
  movement the member explicitly made and does not claim psychological, causal, or
  developmental connection. Desktop and narrow-window screenshots contain only the
  safe test entry / temporary witness title. The temporary Change and crossing row were
  deleted after capture; residue verified at zero. During the same walk an existing
  Living Field auth defect was repaired: the parent API now derives member identity from
  the authenticated session through getMemberIdFromRequest and no longer accepts a
  memberId query override.
---

# Living Field — Facet Flow Projection

## Purpose

Living Field should help the member perceive relationship across one life.

LOF-01 begins with the strongest relationship evidence Soullab already has:

> **a movement the member explicitly made.**

If the member carried a Journal entry into a Change, or a Reflection into a Decision, that path is a fact. It can be shown without interpreting it.

## Member-facing language

> **Threads across your life**

> Paths you chose to carry from one part of Soullab into another.

Each thread shows:

- source facet and source-object label;
- a simple directional crossing mark;
- target facet and target-object label;
- the date the member made the crossing.

Both endpoints remain doorways back to the real source objects.

## What the line means

Only:

> **You carried this source into relation with this target.**

The line does **not** mean:

- the source caused the target;
- the target is the true meaning of the source;
- the two objects are psychologically linked;
- one develops into the other;
- MAIA detected a pattern;
- Spiralogic or an elemental lens has classified the movement.

The panel states this explicitly.

## Epistemic order in Living Field

The member-authored flow projection appears:

1. after the existing wider-field orientation;
2. before Active Spirals;
3. before Emotional Weather;
4. before Living Field Dimensions.

This ordering is intentional.

> **Explicit member action is stronger evidence than system inference.**

Developmental and pattern-oriented views may remain available, but they do not outrank the member’s own authored movements.

## Projection authority

The client is read-only.

It calls:

`GET /api/house/facet-flows`

The route derives identity from the authenticated session and accepts no member-id selector.

The read model projects only rows already present in:

`member_facet_crossings`

It creates no crossings and mutates no source object.

## Source and target custody

Every visible endpoint is resolved through the ownership rule of its own facet.

Current source facets:

- Journal;
- Reflections.

Current target facets:

- Changes;
- Personal Decisions.

If an endpoint is later unavailable, the surviving relation does not invent replacement content. The panel says:

> **No longer available.**

## Changes return seam

Changes is sheet-based rather than having a standalone `/changes/:id` detail route.

LOF-01 therefore admits:

`/changes?change=<change-id>`

as the direct return doorway for a projected Change.

If a crossing-creation source and direct Change id are both present, the explicit crossing-create gesture wins. This prevents a stale target query from overriding the member’s active crossing act.

## Authentication repair

The LOF-01 runtime witness exposed that the parent Living Field API still used an older identity-probe contract and rejected a valid authenticated session unless a matching header/query identity claim was also present.

The route now uses the canonical authenticated-member resolver:

`getMemberIdFromRequest(request)`

and no longer accepts `?memberId=` as a fallback selector.

This is a reachability and sovereignty repair, not an expansion of Field authority.

## Empty state

If there are no explicit facet crossings:

> Nothing has crossed between these facets yet. When you choose to carry something forward, the path can remain visible here.

Absence is not deficiency. The system does not manufacture a thread to make the Field appear populated.

## Failure state

If the read projection is unavailable:

> These paths are quiet right now. Nothing has been changed.

A read failure does not imply that the member has no cross-facet history.

## Forbidden in LOF-01

- inferred semantic edges;
- automatic relation creation;
- MAIA-proposed connections;
- elemental classification of a crossing;
- Spiralogic classification of a crossing;
- developmental scoring or stage assignment;
- graph editing from Living Field;
- mutation through the projection client;
- caller-selected member identity;
- treating the member as a graph node.

## What this opens later

Once explicit relation evidence is visible, later governed acts may ask whether a member wants to view it through:

- an elemental lens;
- Spiralogic movement;
- developmental trajectory;
- relational dynamics;
- temporal context;
- symbolic context.

Those are **lenses over evidence**, not replacements for evidence.

They require separate authority.

## Product test

> **Can I see how parts of my life have moved into relationship because I moved them there—without Soullab telling me what that relationship means?**

LOF-01 passes only if the answer is yes.
