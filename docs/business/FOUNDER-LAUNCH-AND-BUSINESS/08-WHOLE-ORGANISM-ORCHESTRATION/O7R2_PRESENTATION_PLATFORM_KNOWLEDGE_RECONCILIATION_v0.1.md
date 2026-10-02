# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O7R2

## RATIFIED PRESENTATION FIXTURE + PLATFORM-KNOWLEDGE RECONCILIATION DESIGN ONLY

**Status:** DOCUMENTARY RECONCILIATION · NO PLATFORM KNOWLEDGE MUTATION · NO MAIA/HOUSE CONSUMER · NO MEMBER-VISIBLE BEHAVIOR

## Governing test

> Could MAIA repeat this approved capability description today without thereby creating a new platform fact?

Reconciliation classes:

- **COMPATIBLE** — current platformKnowledge already supports the capability's purpose closely enough that the approved description does not add a materially new platform claim.
- **STALE_MAP_SENSITIVE** — the capability purpose is directionally consistent, but current platformKnowledge is too coarse, older, role-sensitive, or status-sensitive to safely carry the approved capability distinction without reconciliation.
- **NOT_REPRESENTED** — current platformKnowledge does not presently contain the capability-level fact or the relevant product distinction.

These classes describe compatibility with MAIA's current authored map. They do not authorize utterance.## Reconciliation table

| Capability | Approved presentation | Reconciliation | Reason |
| --- | --- | --- | --- |
| `journal.create` | **New Journal Entry** — Begin a new Journal entry for something you want to write down. | COMPATIBLE | platformKnowledge describes Journal as quick capture and explicitly names “I want to write something down” as a doorway. |
| `journal.save` | **Save to Journal** — Preserve the part of an exchange you choose in your Journal. | STALE_MAP_SENSITIVE | platformKnowledge describes Journal capture and separately describes Keep, but does not establish the v2 conversation→Journal save act or its scope boundary. |
| `journal.dream` | **Record a Dream** — Preserve a dream you choose to record in your Journal. | COMPATIBLE | platformKnowledge explicitly describes dreams as Journal material and names “I had a dream” as a doorway. |
| `astrology.reading` | **Astrology Reading** — Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are. | COMPATIBLE | platformKnowledge already presents Astrology as archetypal timing/pattern and non-authoritative exploration; the Astrology contract reinforces the same boundary. |
| `astrology.transit.current` | **Current Transits** — Explore the planetary patterns of the present moment as a symbolic timing lens. | STALE_MAP_SENSITIVE | platformKnowledge supports timing/pattern but does not represent the v2 current-transit capability as a distinct act. |
| `astrology.transit.personal` | **Personal Transits** — Explore current transits in relation to your birth chart as a symbolic lens for reflection. | STALE_MAP_SENSITIVE | platformKnowledge knows chart entry and Astrology, but does not represent the personal-transit distinction or its member-scoped chart dependency. || `wisdom.open` | **Wisdom Inquiry** — Orient toward teachings and sources that can deepen a question you are holding. | NOT_REPRESENTED | current platformKnowledge names Library as the wisdom archive; it does not represent the newer House Wisdom place or a distinct Wisdom Inquiry capability. |
| `wisdom.surface` | **Wisdom Sources** — Bring forward relevant teachings or sources while preserving where they come from and how they should be understood. | STALE_MAP_SENSITIVE | platformKnowledge says MAIA may draw from Library sources and name them, but the newer governed Wisdom/source-surfacing distinction is not represented explicitly. |
| `relationship.reflect` | **Relationship Reflection** — Reflect on one relationship from your own lived experience while keeping your perspective distinct from assumptions about the other person. | STALE_MAP_SENSITIVE | platformKnowledge recognizes Relationships but labels it in development/not generally open; capability purpose is constitutionally compatible while present availability/status language is sensitive. |
| `studio.choose` | **Choose a Studio** — An orientation to the different Studio environments and what each is for. | STALE_MAP_SENSITIVE | platformKnowledge describes one generic role-conditioned Studio and does not yet describe the newer multi-Studio ecology. |
| `studio.writer.open` | **Writer's Studio** — A specialist writing environment for developing a work with MAIA while keeping the manuscript and the writer's authorship primary. | NOT_REPRESENTED | current platformKnowledge contains no Writer's Studio capability or area description. |
| `studio.session.create` | **Create Session** — Set up a client session within the practitioner's Studio context. | STALE_MAP_SENSITIVE | platformKnowledge knows Session Room and practitioner-hosted sessions, but does not authorize or describe the practitioner-side session-creation act. |## Totals

- COMPATIBLE: **3**
- STALE_MAP_SENSITIVE: **7**
- NOT_REPRESENTED: **2**

Compatible:
- `journal.create`
- `journal.dream`
- `astrology.reading`

Stale-map-sensitive:
- `journal.save`
- `astrology.transit.current`
- `astrology.transit.personal`
- `wisdom.surface`
- `relationship.reflect`
- `studio.choose`
- `studio.session.create`

Not represented:
- `wisdom.open`
- `studio.writer.open`## Held set carried unchanged

UNRESOLVED and WITHHOLD records are not classified against platformKnowledge as utterance candidates because they still have no approved presentation copy:

- `wisdom.text.open` — UNRESOLVED
- `shadow.open` — UNRESOLVED
- `studio.personal.open` — UNRESOLVED
- `studio.pro.open` — UNRESOLVED
- `booking.practitioner.request` — UNRESOLVED
- `pattern.detect` — WITHHOLD

None receives fallback language from platformKnowledge, House, or the legacy registry.

## Smallest future utterance context

The smallest lawful future context is **not** broad platform orientation.

It is:

> **EXPLICIT_CAPABILITY_INQUIRY — DESCRIPTION ONLY**

Definition:
> A member explicitly asks what a named capability is or what it is for, and a separately-authorized caller already resolves that inquiry to one canonical capability ID.

Permitted future response content:
- approved capability name;
- approved capability purpose;
- a static qualifier already authorized for that record, if separately ratified.

Forbidden:
- proactive suggestion;
- “Would you like me to…?”;
- availability claims;
- entitlement/tier statements;
- route or button directions;
- execution/invocation;
- member-state inference;
- substituting another capability when the requested one is unresolved.

## Why explicit capability inquiry is smaller than platform orientation

Broad platform orientation asks MAIA to summarize or navigate the ecosystem and therefore requires:
- current area inventory;
- availability/status language;
- House/place relationships;
- route truth;
- handling of open/closed/gated areas.

Explicit capability inquiry can be bounded to:

```text
resolved canonical capability ID
→ approved presentation record
→ name + purpose only
```

That is the narrowest behavioral seam that uses the new presentation layer without turning it into a router, recommender, availability engine, or product map.

## Utterance eligibility by reconciliation class — design only

### COMPATIBLE
Potentially eligible for a future explicit-capability-inquiry pilot after a dedicated consumer act.

Even here, current-member availability must not be implied.

### STALE_MAP_SENSITIVE
Not eligible for MAIA utterance until platformKnowledge reconciliation or an explicit rule establishes that the capability description may coexist with the older/coarser map.

### NOT_REPRESENTED
Not eligible for MAIA utterance until platformKnowledge is deliberately updated or another authored truth source is constitutionally admitted.

### UNRESOLVED / WITHHOLD
Not eligible for utterance.

## PlatformKnowledge reconciliation design consequence

O7R2 does **not** recommend appending all 12 capability records to platformKnowledge.

Instead, a later act should determine whether the platform map needs:

1. **area-level update** — e.g. newer Wisdom and Writer's Studio architecture;
2. **capability-level detail** — only where members plausibly ask about a specific act;
3. **status qualifier** — open / role-conditioned / in-development / unknown;
4. **no change** — where current area-level truth already supports the approved capability purpose.

This prevents platformKnowledge from becoming a dump of internal capability metadata.

## No-runtime law

Every record in the O7R2 documentary fixture remains:
`runtimeUtterance = NOT_AUTHORIZED`.

O7R2 changes no:
- `platformKnowledge.ts` bytes;
- MAIA prompt composition;
- House source;
- capability runtime;
- access/entitlement policy;
- route/navigation;
- cognition event;
- voice behavior.

## Standing

> **O7R2 DESIGN — 12 RATIFIED PRESENTATIONS RECONCILED AGAINST CURRENT PLATFORM KNOWLEDGE · 3 COMPATIBLE · 7 STALE-MAP-SENSITIVE · 2 NOT REPRESENTED · SMALLEST FUTURE CONTEXT FIXED AS EXPLICIT CAPABILITY INQUIRY / DESCRIPTION ONLY · NO RUNTIME UTTERANCE AUTHORIZED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O7R2R1 — RATIFIED PRESENTATION RECONCILIATION FIXTURE + CONFORMANCE MATRIX ONLY**

O7R2R1 may:
- encode all 18 presentation records with the O7R1 founder-authored copy and O7R2 reconciliation classes;
- preserve all records as `NOT_AUTHORIZED` for runtime utterance;
- add test-only laws proving presentation shape, held-set silence, reconciliation counts, and no route/access/offer semantics;
- add defeat candidates and evidence.

O7R2R1 may not:
- modify platformKnowledge;
- add a MAIA/House consumer;
- authorize explicit-capability-inquiry runtime;
- add routes, availability, offers, or entitlement semantics;
- change member-visible behavior.