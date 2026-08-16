---
room: Astrology
human_activity: reflective orientation through one's birth chart and chosen astrological lenses — using astrology as a symbolic map for inquiry, not as diagnosis, prediction, or authority over the member
surfaces:
  - app/astrology/page.tsx
change_class: structural
structural_rationale: This contract is being introduced to establish room jurisdiction for an existing member-facing surface while a defect/security repair changes implementation plumbing only. The repair binds birth-chart resolution to the authenticated member and refuses unbound local caches; it does not redesign the Astrology experience, alter its visual hierarchy, introduce a new member gesture, or ratify the existing UI as an approved experiential reference. The only member-visible change is that two states which previously rendered as "no birth data" now say what is actually true — signed out, or temporarily unreachable — which corrects a false claim rather than authoring an experience.
principles:
  - INHABITABLE_ARCHITECTURE — rooms arise from human activity, not data models
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — symbolic interpretation cannot manufacture higher-order truth about the member
  - MAIA_OATH — reflection, never guru stance or authority
  - SOULLAB_THEME — House language and visual hierarchy remain coherent across rooms
reference_surfaces:
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/studio-home.md
shared_with_house: quiet field hierarchy · human-language gestures · provenance-aware interpretation · MAIA as reflective companion rather than authority
distinct_to_room: the member encounters a symbolic celestial map of their own chart and may choose interpretive lenses such as house or zodiac systems. Astrology presents possibilities for reflection; it does not score, diagnose, rank, predict destiny, or tell the member who they are.
---

# Astrology — Experience Contract

**Scope is deliberately narrow.** This contract claims exactly one surface,
`app/astrology/page.tsx`, because that is the surface actually touched.
`components/astrology/**` and the lens sub-rooms (`/astrology/vedic`,
`/chinese`, `/mayan`, `/synastry`, `/report`) are **not** claimed here. Coverage
grows when those surfaces are themselves touched — not by proximity.

**Coverage is not retrospective approval.** Introducing this contract does not
ratify the current Astrology page as an approved experiential reference. It
establishes which room this is and what it may not become. The page has never
been walked against an approved reference; that remains owed, and is not
discharged by this file.

## What this room is for

A person orienting themselves by their own birth chart — reading it as a
symbolic map to think with, and choosing the lens through which to read it.
The chart is material for the member's own reflection. It is not a readout of
who they are.

The reference surfaces above are cited as **House-level** patterns only — for
how a room is defined by human activity and how it separates what is shared
with the House from what is distinctive. They are not templates for Astrology's
own expression.

## FORBIDDEN HERE

- dashboard-style scoring of the person
- deterministic fate language
- "your chart proves…" claims
- system-generated developmental ranking
- MAIA speaking as astrological authority
- engagement/streak mechanics around astrology

## Identity boundary (established 2026-08-16)

A chart is member-scoped data. The room may render a chart **only** for a member
the server has positively named from a verified session credential. Where that
member cannot be established, the room says so and shows nothing:

```text
authoritative member + birth data   →  chart
authoritative member + no data      →  ABSENT       (Enter Birth Details)
401 / 403                           →  SIGNED_OUT   (Sign in)
5xx / transport                     →  UNREACHABLE  (Try again)
no condition                        →  read an unbound member cache
```

`UNAVAILABLE ≠ ABSENT`. Telling a member "enter your birth details" when the
system merely could not confirm who they are asserts an absence never
established, and invites someone who already has a chart to re-enter it. The two
unresolved states are told apart because **a remedy is itself a claim about the
cause**: offering "try again" to a signed-out person makes a permanent state
look transient.

No local cache may resolve member birth data. Neither historical fallback could
prove whose chart it held — `birthChartData` carries no member id and survived
sign-out; `beta_user` carries one but cannot be verified against the session
without the very call that would already have answered. **No chart is better
than the wrong person's chart.**

Restoring offline or degraded chart viewing is a separate, unopened unit. It
does not mean reinstating the removed fallbacks; it means binding the cache to a
server-verified `memberId` at every write site.

## Constitutional note

A security repair may be structurally non-experiential, but touching a
member-facing room still requires knowing what room is being protected.
