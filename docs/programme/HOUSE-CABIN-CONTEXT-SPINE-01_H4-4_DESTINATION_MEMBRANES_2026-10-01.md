# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.4 — Destination Membranes

## Ruling

H4.3 established the non-semantic crossing marker.

H4.4 implements the receiving-room membrane: each destination recognizes
from=cabin as navigation provenance only and offers an explicit return to
/cabin without importing Cabin authority.

## Surfaces

- Writer's Studio shell
- Relationships field
- Relationship detail
- Daily Anchor history
- Daily Anchor

## Implementation state

The worktree already contained a source-aware destination implementation when
H4.4 was opened. Its diff was read before adoption and was limited to Cabin
origin recognition, explicit return, and origin propagation.

H4.4 adds:

- governed destination membrane tests;
- the H4.4 Experience Contract;
- the mobile Writer's Studio navigation containment repair required by the
  real witness.

The existing destination changes remain narrow: no destination content model
was altered.

## Destination behavior

### Writer's Studio

from=cabin produces an explicit Return to Cabin link in the Studio shell.

Work and manuscript authority remain inside Writer's Studio.

### Relationships

from=cabin is recognized at the field and relationship-detail levels.

Relationship creation/opening preserves from=cabin.

Return controls target /cabin explicitly.

### Memory / Daily Anchor

History recognizes from=cabin and preserves it when opening today's Anchor.

Daily Anchor recognizes from=cabin, returns explicitly to Cabin, and preserves
the origin when opening Earlier Anchors.

### MAIA

Daily Anchor recognizes Cabin origin only as a return membrane. No cognition is
created by the crossing.

## Real runtime witness

Local offline server: port 3692.

All four entry routes returned HTTP 200:

- /writers-studio?from=cabin
- /relationships?from=cabin
- /maia/anchor/history?from=cabin
- /maia/anchor?from=cabin

After hydration:

- Writer's Studio: Return to Cabin;
- Relationships: Back to Cabin;
- Anchor history: Return to Cabin;
- Daily Anchor: Return to Cabin.

Relationships detail also preserved the Cabin return locus.

Responsive witness:

- desktop: 1440px viewport, no horizontal overflow;
- Relationships mobile: 390 / 390;
- Anchor history mobile: 390 / 390;
- Daily Anchor mobile: 390 / 390;
- Writer's Studio initially exposed 431px document width on a 390px viewport
  because the existing product-bar navigation had no bounded overflow.

### Witness repair

The Writer's Studio product bar now gives its navigation:

- flex-bounded width;
- min-width: 0;
- internal horizontal scrolling;
- hidden scrollbar presentation.

After repair:

**390 / 390 mobile width.**

This preserves the Studio's own navigation instead of hiding the Cabin return
or collapsing the Studio hierarchy.

## Falsifier suite

Focused H4.4 destination membrane suite covers:

- explicit Cabin return in Writer's Studio;
- Relationships origin propagation and return;
- Anchor history / Daily Anchor origin propagation;
- rejection of arbitrary return targets;
- no Cabin context activation or cognition seam in receiving rooms.

## Stop boundary

H4.4 does not add:

- semantic object carry;
- memory recall;
- relationship interpretation;
- Work selection;
- automatic return;
- synchronization;
- JARVIS authority;
- production deployment.

## Standing

**H4.4 IMPLEMENTATION COMPLETE · REAL DESTINATION WITNESS COMPLETE · PR PENDING.**

Next boundary:

**H4.5 — post-return continuity witness:** explicit return to /cabin must show
the same already-mounted field, not silently reinitialize or replace it.
