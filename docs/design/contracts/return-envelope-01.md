# RETURN-ENVELOPE-01
## Minimum continuity carrier for cross-surface traversal

**Date:** 29 September 2026
**Status:** architecture contract
**Persistence authority:** none by default

A Return Envelope carries enough orientation to traverse surfaces and return truthfully.

It is a **continuity carrier**, not a narrative carrier.

## Required fields

Conceptually:

```text
ReturnEnvelope
  livingObjectId
  sourceVersionWitnessed
  originSurface
  originLocus
  originView
  focusTarget
  movementIntent
  openedAt
  returnPolicy
```

### livingObjectId

Stable identity of the object being traversed.

### sourceVersionWitnessed

The source/version standing when departure occurred.

Used only to detect truthful delta on return.

### originSurface

Where the movement began.

Examples:

- living_field;
- grokker;
- writers_studio;
- maia;
- relationships;
- house.

### originLocus

The meaningful local place within the origin surface.

Examples:

- presence ID;
- passage ID;
- thread;
- relation;
- selected source.

### originView

Only the orientation state necessary for truthful return.

Examples:

- semantic zoom;
- quiet / widened;
- field neighborhood;
- local view mode.

### focusTarget

Where attentional focus should return when possible.

### movementIntent

The member-chosen movement that opened the destination.

Examples:

- continue writing;
- see connections;
- another perspective;
- discuss with MAIA;
- inspect source.

Movement intent is not inferred motive.

### openedAt

Factual traversal time.

### returnPolicy

Explicit behavior for return.

Default:

> **restore orientation → reconcile current source truth → expose material delta → clear temporary interpretation**

## Optional ephemeral fields

Permitted only for current traversal where needed:

- temporary selected aperture;
- temporary comparison set;
- local scroll / viewport;
- local spatial camera;
- transient destination state.

These fields expire with the traversal.

## Prohibited fields

The envelope must not carry:

- hidden importance score;
- psychological interpretation;
- inferred developmental stage;
- inferred life goal;
- inferred motive;
- unconfirmed MAIA relation;
- a narrative of what the traversal means.

## Persistence law

> **A Return Envelope is ephemeral unless a specific member-authored return marker is separately authorized.**

Cross-surface navigation must not become a backdoor memory system.

## Truthful return

On return:

1. identify the same living object;
2. fetch / reconcile current governed source;
3. compare source version to the witnessed departure version;
4. expose material delta when useful;
5. restore origin orientation where still valid;
6. clear temporary surface interpretations;
7. restore member attention when possible.

## Invalidated origin state

If the exact origin locus no longer exists:

- do not fake it;
- return to the nearest truthful containing locus;
- say that the original locus changed or is no longer available;
- preserve the stable object identity.

## Acceptance sentence

> **The envelope remembers how to get me back; it does not decide what the journey meant.**
