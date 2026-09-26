# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O6

## CAPABILITY ↔ HOUSE PLACE TOPOLOGY RELATIONSHIP CONTRACT ONLY

**Status:** DESIGN ONLY · NO HOUSE CONSUMER · NO MAIA CONSUMER · NO ROUTING / ELIGIBILITY / PRESENTATION CHANGE

## Governing problem

Capability awareness and House place architecture describe different things.

Capability awareness describes:
> **acts the system recognizes and their documentary standing.**

House place architecture describes:
> **member-facing places, authored purposes, presentation, routes, and current eligibility.**

Therefore:

> **CAPABILITY ≠ PLACE**

and:

> **PLACE ≠ CAPABILITY**

O6 defines only how the two may be related without either inheriting the other's authority.## Existing House authorities preserved

O6 explicitly preserves current House authority loci:

### Place identity and presentation
`lib/house/catalog.ts` remains authoritative for:
- House place IDs;
- labels;
- purposes;
- hrefs;
- visual marks/tones;
- House grouping;
- aliases;
- center eligibility;
- `studioRequired` presentation metadata.

### Member-relative House eligibility
`eligibleHousePlaces()` / `HousePreferenceSnapshot.eligibleIds` remain authoritative for current House place eligibility.

Current House behavior may use that eligibility for:
- `Open` versus `Set up Studio`;
- Center choices;
- Here·Now shortcuts;
- save validation.

Capability awareness does not supplement, replace, infer, or override that eligibility.## Relationship kinds

O6 defines four descriptive topology outcomes.

### `WITHIN_PLACE`
The capability act conceptually belongs within the member-facing place.

Example shape:
`journal.save → journal`

This does **not** mean:
- the capability is available;
- the place may invoke it;
- the place route is the capability route;
- the capability may read the place contents.

### `ENTERS_PLACE`
The capability act is conceptually an entry/transition into the place.

Example shape:
`studio.writer.open → writing`

This does **not** grant:
- access;
- entitlement;
- role;
- route authority;
- automatic navigation.

### `NO_HOUSE_PLACE`
The capability intentionally has no House-place relationship in the current topology.

This is a valid architectural result, not a missing implementation.### `UNRESOLVED`
A House relationship may plausibly exist, but current canon does not support choosing one.

UNRESOLVED must not be converted into the nearest-looking place.

## Proposed relationship record

```ts
type CapabilityHouseRelationKind =
  | 'WITHIN_PLACE'
  | 'ENTERS_PLACE'
  | 'NO_HOUSE_PLACE'
  | 'UNRESOLVED'

interface CapabilityHouseRelation {
  capabilityId: CapabilityAuthorityId
  relation: CapabilityHouseRelationKind
  housePlaceId?: HousePlaceId
  rationale: string
}
```

`housePlaceId` is permitted only for `WITHIN_PLACE` and `ENTERS_PLACE`.

The relation is static topology, never member-relative state.## Authority non-inheritance laws

### O6-L01 — No eligibility inheritance
A capability-to-place relation cannot make a House place eligible.

### O6-L02 — No capability availability inheritance
House eligibility cannot make a capability available, suggestible, invokable, or executable.

### O6-L03 — No route inheritance
`HousePlace.href` is not a capability invocation route.

### O6-L04 — No presentation inheritance
House labels/purposes/aliases do not become capability labels or MAIA wording.

### O6-L05 — No data inheritance
Being `WITHIN_PLACE` grants no read/write access to that place's data.

### O6-L06 — No member context
Topology relationships are the same regardless of member identity, tier, role, preferences, or eligibility.

### O6-L07 — No forced total mapping
A capability may legitimately be `NO_HOUSE_PLACE` or `UNRESOLVED`.

### O6-L08 — WITHHELD dominance
A WITHHELD capability cannot become behaviorally reachable because it has a House relationship.## Candidate current topology — documentary only

The following relationships are sufficiently supported for a candidate topology.

### Journal
- `journal.create → journal` — WITHIN_PLACE
- `journal.save → journal` — WITHIN_PLACE
- `journal.dream → journal` — WITHIN_PLACE

### Astrology
- `astrology.reading → astrology` — WITHIN_PLACE
- `astrology.transit.current → astrology` — WITHIN_PLACE
- `astrology.transit.personal → astrology` — WITHIN_PLACE

### Relationships
- `relationship.reflect → relationships` — WITHIN_PLACE

### Studios
- `studio.writer.open → writing` — ENTERS_PLACE
- `studio.personal.open → studio` — ENTERS_PLACE
- `studio.pro.open → studio` — ENTERS_PLACE
- `studio.choose → studio` — WITHIN_PLACE
- `studio.session.create → studio` — WITHIN_PLACE

These relationships are semantic topology only.## Candidate unresolved / non-place topology

### Wisdom
- `wisdom.open → wisdom` — WITHIN_PLACE
- `wisdom.surface → wisdom` — WITHIN_PLACE
- `wisdom.text.open` — **UNRESOLVED**

Reason:
`wisdom.text.open` is an archive/source-opening act while House distinguishes both Wisdom and Library. O6 will not silently choose one.

### Shadow
- `shadow.open` — **NO_HOUSE_PLACE**

Current House catalog has no Shadow place.

### Booking
- `booking.practitioner.request` — **NO_HOUSE_PLACE**

A booking act is not itself a House place.

### Pattern
- `pattern.detect` — **NO_HOUSE_PLACE**

Pattern is explicitly a distributed epistemic capacity and remains WITHHELD; it must not be coerced into Living Field or another destination.

## Important omission

Divination, Decisions, Practices, Community, Reflections, Ideas, Changes, Library, Living Field, Co-lab, and Anchor may be House places without corresponding O3 v2 capability identities.

O6 does not treat that as an error.

## Why House cannot consume this yet

Even after O6 topology exists, House runtime consumption remains closed.

Before any House use, a separate behavioral contract must answer:
- what specific member-visible behavior may read topology?
- may topology change copy?
- may topology change grouping?
- may topology change card presence?
- how is current House eligibility kept dominant?
- what happens when House catalog and capability topology disagree?

O6 answers none of those.

## Why MAIA cannot consume this yet

Capability-to-place topology does not provide:
- member-facing capability names;
- offer language;
- invocation language;
- availability;
- route authority;
- consent status.

So O6 also does not make capability awareness ready for MAIA.

## Behavioral ruling

> **No member-visible behavior changes in O6.**

The contract exists only to prevent future behavioral consumers from confusing acts with places.

## Falsifier matrix

| ID | Forbidden proposition | Required failure |
| --- | --- | --- |
| F-O6-01 | `journal.save → journal` makes Journal eligible | `TOPOLOGY_NOT_ELIGIBILITY` |
| F-O6-02 | House Studio eligibility makes `studio.pro.open` available | `PLACE_ELIGIBILITY_NOT_CAPABILITY_AUTHORITY` |
| F-O6-03 | `studio.writer.open → writing` reuses House href as invocation route | `HOUSE_ROUTE_NOT_CAPABILITY_ROUTE` |
| F-O6-04 | House label becomes capability label | `HOUSE_PRESENTATION_NOT_CAPABILITY_PRESENTATION` |
| F-O6-05 | `WITHIN_PLACE` grants place data read | `TOPOLOGY_NOT_DATA_AUTHORITY` |
| F-O6-06 | topology varies by member tier | `TOPOLOGY_NOT_MEMBER_RELATIVE` |
| F-O6-07 | `wisdom.text.open` forced to nearest place | `UNRESOLVED_RELATION_MUST_REMAIN_UNRESOLVED` |
| F-O6-08 | `pattern.detect` maps to Living Field | `PATTERN_NOT_DESTINATION` |
| F-O6-09 | `shadow.open` invented as hidden House place | `NO_HOUSE_PLACE_MUST_REMAIN_LEGIBLE` |
| F-O6-10 | every House place required to have capability ID | `PLACE_NOT_CAPABILITY` |
| F-O6-11 | every capability required to have House place | `CAPABILITY_NOT_PLACE` |
| F-O6-12 | WITHHELD capability becomes reachable via mapped place | `WITHHELD_DOMINATES_TOPOLOGY` |

## Standing

> **O6 DESIGN — CAPABILITY/PLACE ONTOLOGIES SEPARATED · DESCRIPTIVE RELATIONSHIP KINDS DEFINED · HOUSE ELIGIBILITY / PRESENTATION / ROUTING AUTHORITY PRESERVED · NO BEHAVIORAL CONSUMER AUTHORIZED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O6R1 — CAPABILITY ↔ HOUSE PLACE TOPOLOGY FIXTURE + CONFORMANCE MATRIX ONLY**

O6R1 may:
- encode the candidate topology as test/documentary data;
- test the relationship laws;
- prove unresolved/no-place outcomes remain legible;
- compare IDs against the existing House catalog without changing it.

O6R1 may not:
- import topology into House runtime;
- alter `HOUSE_PLACES`;
- alter `eligibleHousePlaces()`;
- alter labels, hrefs, grouping, or preferences;
- import topology into MAIA;
- change any member-visible behavior.

It must stop again for founder adjudication.