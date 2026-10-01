---
room: Cabin Doorway Crossing
human_activity: choosing a Cabin doorway, entering the chosen room, and retaining a truthful voluntary path back to Cabin

surfaces:
  - lib/cabin/doorway.ts
  - lib/cabin/__tests__/doorway.test.ts

change_class: structural
structural_rationale: >-
  H4.3 currently establishes the typed, non-semantic crossing seam and records
  the destination census. It changes no destination room. The member-facing
  Cabin Arrival remains governed by the H4.2 experiential contract; destination
  membranes are a separate later act and are not claimed as implemented here.

principles:
  - EXPLICIT_CROSSING — a doorway is entered only by an explicit member act
  - ORIGIN_WITHOUT_AUTHORITY — from=cabin records origin but grants no data or cognition authority
  - NO_IDENTITY_IN_CROSSING — doorway URLs carry no Work, Relationship, Memory, member, or session id from Cabin
  - DESTINATION_LOCAL_AUTHORITY — each destination decides what its own room may consume
  - RETURN_IS_A_CHOICE — returning to Cabin is an explicit member action, never an automatic redirect
  - RETURN_TARGET_IS_STABLE — a Cabin-origin return resolves to /cabin, not to a remembered object or arbitrary URL
  - ORIGIN_PROPAGATION — a Cabin origin survives destination-local navigation when needed to preserve the explicit return locus
  - NO_CONTEXT_REHYDRATION — crossing does not refresh, remount, download, or reconstruct Cabin context
  - NO_COGNITION_HANDOFF — entering a doorway does not itself create a MAIA cognition handoff
  - NO_SECOND_SOURCE — crossing does not consult another continuity source

reference_surfaces:
  - docs/design/contracts/cabin-arrival-experience.md
  - docs/design/contracts/cabin-arrival-mounted-context.md
  - docs/design/contracts/cabin-arrival-visual-authority.md
  - lib/cabin/experienceContext.ts
  - lib/cabin/contextRuntime.ts

shared_with_house: explicit threshold crossing, local room authority, readable return paths, and preservation of member choice
distinct_to_room: Cabin is the source of the crossing and the return target; it does not become the authority for the destination room's contents
---
# Cabin Doorway Crossing — Contract

## 1. Crossing sequence

    Cabin Arrival
        ↓
    explicit doorway act
        ↓
    destination room
        ↓
    destination-local work
        ↓
    explicit return, when chosen
        ↓
    Cabin Arrival

The crossing itself carries no interpretation.

The member chooses the room. The destination owns the room.

A doorway must never become a disguised command to select an object, refresh
the Cabin field, summon MAIA cognition, or reinterpret the mounted package.

## 2. Origin marker

H4.2 establishes the origin marker:

    ?from=cabin

The marker is descriptive navigation provenance only.

It may be read by a destination solely to decide whether an explicit
"Return to Cabin" affordance should be offered.

It may not:
- select a Work;
- select a Relationship;
- select a Memory;
- identify a member or session;
- load a memory body;
- alter MAIA cognition;
- refresh the Cabin mount;
- trigger a network or database lookup;
- become a general-purpose redirect URL.

The canonical return target is exactly:

    /cabin

## 3. Destination law

Each room retains local authority.

Work owns:
- Work selection;
- manuscript selection;
- writing state;
- Writer's Studio modes.

Relationships owns:
- relationship retrieval;
- relationship selection;
- relationship interpretation.

Memory owns:
- anchor/history retrieval;
- memory presentation;
- memory preference behavior.

MAIA owns:
- explicit MAIA entry;
- any later cognition boundary;
- its own interface and sanctuary rules.

Cabin owns none of those destination decisions.

## 4. Return law

A destination reached from Cabin may offer a return to Cabin.

The return must:
- be explicit;
- target /cabin;
- contain no object id;
- not refresh or clear the Cabin context;
- not create a new context package;
- not invoke MAIA cognition;
- preserve ordinary destination behavior when from=cabin is absent.

Back/return controls inside a destination must not silently redirect merely
because a Cabin origin exists.

The member remains the agent of the crossing back to Cabin.

## 5. H4.3 census — current destination behavior

The live code was read at the H4.2 merge boundary.

Work:
- Cabin sends /writers-studio?from=cabin.
- The canonical Writer's Studio route reads mode/work parameters but does not
  currently consume from=cabin as a Cabin return locus.
- Writer's Studio therefore needs an explicit source-aware return seam.

Relationships:
- Cabin sends /relationships?from=cabin.
- Relationships reads the from parameter.
- Only from=house is currently treated as a special return origin.
- from=cabin therefore falls through to the existing MAIA return behavior.
- This loses the actual Cabin origin.

Memory:
- Cabin sends /maia/anchor/history?from=cabin.
- Anchor history does not currently consume the from parameter.
- Its footer always returns to House.
- The Cabin origin is therefore not preserved.

MAIA:
- Cabin sends /maia/anchor?from=cabin.
- Anchor reads the from parameter.
- Only from=house changes its return target.
- from=cabin therefore falls through to the existing MAIA return behavior.
- The Cabin origin is therefore not preserved.

This census is a seam finding, not a defect in H4.2. H4.2 correctly established
the crossing URLs without inventing destination authority.

## 6. Crossing falsifiers

F1 — Cabin crossing selects a domain object without member choice.

F2 — from=cabin is treated as an authorization or data source.

F3 — a Work, Relationship, Memory, member, or session id is added to the
crossing URL by Cabin.

F4 — a destination silently chooses an object because the member arrived from
Cabin.

F5 — return to Cabin occurs automatically without a member action.

F6 — return to Cabin targets anything other than /cabin.

F7 — destination-local navigation drops a required Cabin return locus before
the member has left the destination.

F8 — from=cabin causes a refresh, remount, download, synchronization, database
lookup, or network fetch of Cabin context.

F9 — entering the MAIA doorway creates cognition merely because the origin is
Cabin.

F10 — removing from=cabin changes ordinary destination behavior in ways not
required by the destination's own contract.

F11 — an arbitrary return URL is accepted where the contract requires the fixed
Cabin target.

F12 — technical crossing vocabulary reaches member-facing copy.

## 7. Acceptance

H4.3 is accepted only when:

1. all four Cabin doorway origins are explicitly defined;
2. each destination can recognize Cabin origin without gaining Cabin authority;
3. Cabin origin can survive destination-local navigation where needed;
4. return to Cabin is explicit and resolves to /cabin;
5. no destination selects or exposes an object merely because of Cabin origin;
6. MAIA remains a separate cognition boundary;
7. ordinary non-Cabin destination entry remains unchanged;
8. focused route and navigation witnesses pass.

## Stop boundary

H4.3 does not add:
- automatic return;
- browser-history substitution as the product contract;
- arbitrary returnTo URLs;
- context refresh;
- context synchronization;
- Work selection;
- Relationship interpretation;
- Memory recall;
- MAIA cognition;
- JARVIS authority;
- production deployment.

The next implementation act is the smallest source-aware return seam in each
destination, with one shared crossing vocabulary and no new context source.
