# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R1

## REGISTRY CONTRACT FOUNDER ADJUDICATION + CURRENT 13-CAPABILITY RECONCILIATION DESIGN ONLY

**Status:** RECONCILIATION DESIGN DELIVERED · AWAITING FOUNDER ADJUDICATION · NO SOURCE IMPLEMENTATION · NO RUNTIME WIRING

## Governing question

> How do the 13 current `MaiaCapability` IDs map into the O2 registry contract without pretending that the registry already governs their real runtime behavior?

## Critical evidence

1. `lib/maia/capabilities.ts` defines **13 capability IDs**.
2. `CAPABILITY_REGISTRY` has **0 value consumers**.
3. `getCapability` and `getCapabilitiesForWorld` have **0 callers**.
4. The registry itself has **0 emissions**.
5. `MaiaCapability` is type-used by cognition events.
6. A separate member-visible `capability-offer` presentation kind is not bound to a registry ID and is also currently un-emitted.
7. Voice commands and UI callbacks already execute some capability-like acts independently of the registry.

> **Current product substrate and current registry standing must therefore be recorded separately.**## Vocabulary conflicts

### C1 — Standard 5 versus code registry

Standard 5 still names `depth.explore`; current `MaiaCapability` does not.

- documentary capability vocabulary = 14 entries;
- code registry vocabulary = 13 IDs.

O2R1 does not re-add or retire `depth.explore`; it records the divergence.

### C2 — Navigation vocabulary is narrower/older than the Estate

`MaiaWorldId` does not include Depth, Astrology as a world, Decisions, Changes, Community, Co-lab, Writer's Studio, or distinct Personal/Pro Studios.

O2 placement therefore cannot be reduced to `MaiaWorldId`.

### C3 — Voice actions form a parallel vocabulary

Observed active voice actions include `journal-save`, `journal-dream`, `astrology-transits`, `astrology-personal`, and `world-navigate-*`.

These are not bound to the registry IDs.

### C4 — Studio is no longer one clear semantic destination

Current voice navigation sends `studio` to `/studio`; current product architecture distinguishes Personal, Pro, and Writer's Studio.## Reconciliation table — 13 code-registry IDs

| Current ID | Observed substrate | Registry standing | O2R1 disposition |
| --- | --- | --- | --- |
| `journal.create` | Journal room/sheet exist; voice can navigate to Journal; no registry-ID invocation found | DECLARED / UNBOUND | **KEEP provisionally**; define exact create/open-capture act |
| `journal.save` | Voice saves last 5 conversation messages to `/api/journal/quick` as reflection; success/failure acknowledged | SUBSTRATE WIRED / REGISTRY UNBOUND | **KEEP**; read-scope needs adjudication |
| `journal.dream` | Voice saves last 5 conversation messages to `/api/journal/quick` as dream; acknowledged | SUBSTRATE WIRED / REGISTRY UNBOUND | **KEEP**; same scope issue as save |
| `astrology.reading` | Astrology product exists; no registry-ID binding found | DECLARED / UNBOUND | **KEEP CONCEPT; re-scope placement** out of legacy `patterns` assumption |
| `astrology.transit` | Voice has current-transits and personal-transits acts; endpoints called and MAIA speaks summaries | SUBSTRATE WIRED / REGISTRY UNBOUND | **IDENTITY REVIEW**: one ID currently spans different scopes |
| `pattern.detect` | Pattern concepts/cognition exist; no registry binding | DECLARED / UNBOUND | **HOLD** for semantic + epistemic contract |
| `pattern.show` | Voice navigation to legacy `patterns` is wired | TRANSITION WIRED / REGISTRY UNBOUND | **RECONCILE** with House/Living Field architecture |
| `wisdom.surface` | Wisdom substrate exists; cognition concept exists; no registry invocation found | DECLARED / UNBOUND | **KEEP CONCEPT** with retrieval/provenance contract |
| `wisdom.text` | Sacred-text phrase currently navigates to Wisdom generally | DECLARED / SEMANTIC MISMATCH | **RENAME OR REDEFINE** |
| `relationship.reflect` | Relationships room exists; voice navigation deliberately deferred in source comments | DECLARED / INTENTIONALLY UNWIRED | **KEEP provisionally** |
| `depth.shadow` | Shadow modal/callback exists and can open from UI; registry not binding | UI-WIRED / REGISTRY UNBOUND | **PLACEMENT REVIEW** |
| `studio.transition` | Voice navigation is real; shell pushes `/studio`; acknowledged | SUBSTRATE WIRED / REGISTRY UNBOUND | **DO NOT FREEZE generic ID as final** |
| `schedule.create` | Studio booking substrate exists; no registry/voice binding found | DECLARED / AMBIGUOUS | **SPLIT SEMANTICS BEFORE WIRING** |

> **The current registry is a historical seed vocabulary, not yet the canonical Estate capability ontology.**## Journal family

### `journal.create`

Human purpose: expression / capture.

Observed: Journal world exists; Journal sheet can be opened by UI; voice can navigate to Journal. No evidence shows `journal.create` itself creates or opens a durable entry.

Unknowns:
- whether create means open a blank sheet;
- whether any durable row is created before save;
- what conversation material, if any, is carried;
- whether carried material must be explicitly selected.

Provisional posture:
- suggestion allowed as an offer;
- invocation by explicit request or confirmation;
- no durable write merely from opening;
- economic class: FREE_FOUNDATION;
- membrane: MEMBER_PRIVATE.

### `journal.save`

Current voice implementation reads the last five conversation messages automatically and writes them to the member Journal.

That five-message read scope is an implementation choice, **not yet a ratified authority contract**.

Explicit `save this` does not necessarily mean `save five turns chosen by the system`.

Disposition: keep the identity; adjudicate read scope before registry binding.### `journal.dream`

Structurally mirrors `journal.save`: the current voice path reads the last five conversation messages and writes them as a dream.

Open semantic question: does `save this to my dream journal` mean the recent conversational window, the member-authored dream account, or selected material?

O2R1 preserves the ID but does not canonize the automatic read scope.

## Astrology family

### `astrology.reading`

The current registry places this under legacy `patterns`; the Estate now treats Astrology as its own strong symbolic/pattern domain.

Disposition:
- capability concept survives;
- placement should reference Astrology, not merely the old Patterns world;
- birth/chart data is read only under member-provided/authorized scope;
- registry lifecycle remains DECLARED / UNBOUND.

### `astrology.transit`

Runtime currently distinguishes current/general transits from personal transits.

These differ in data requirement, privacy scope, personalization, and failure behavior.

Two lawful future options:
- split into `astrology.transit.current` and `astrology.transit.personal`; or
- retain one parameterized capability with an explicit scope and separate authority checks.

O2R1 makes no founder choice.## Pattern family

### `pattern.detect`

This is the highest epistemic-risk ID in the current registry.

`Detect pattern` can mean recurrence, statistical relation, symbolic interpretation, cross-life synthesis, or psychological inference. Those claims do not share one standing.

Disposition: **HOLD AS DECLARED; do not wire from a generic phrase alone.**

### `pattern.show`

Voice can currently navigate to legacy `patterns`, but the Estate now contains multiple pattern-bearing organs including Astrology, Living Field, Relationships, Reflections, and Changes.

`Show my patterns` no longer has one obvious destination.

O2R1 neither maps it automatically to Living Field nor ratifies the old Patterns destination.

## Wisdom family

### `wisdom.surface`

Concept remains strong: bring relevant teaching/source material into inquiry.

Future contract must preserve source provenance and distinguish traditional, interpretive, empirical, and hypothesis-level standing.

Likely AIN roles: RETRIEVAL + EPISTEMIC_GUARD.

### `wisdom.text`

Current ID implies opening/showing a specific text; current voice behavior routes `sacred texts` to Wisdom generally.

Possible future forms: `wisdom.open`, a specific `wisdom.text`, or separate sacred-text capability. O2R1 does not choose.## Relationships, Shadow, Studio, Scheduling

### `relationship.reflect`

Source comments deliberately defer Relationships voice commands until semantics stabilize.

Provisional contract:
- explicit relationship target;
- member-owned relationship context;
- cross-relationship synthesis not implied;
- MAIA may suggest reflection;
- AIN may support synthesis but cannot infer relational truth;
- Free core reflection; longitudinal depth may be Steward.

### `depth.shadow`

Evidence shows a current Shadow Work modal/callback, but the `depth.*` namespace is historically unstable: `depth` is not a current `MaiaWorldId`, while Standard 5 still names the absent `depth.explore` capability.

Disposition: capability act exists; namespace/placement must be reconciled with current Shadow canon before voice/runtime binding.

### `studio.transition`

Current runtime is real: voice → navigation event → shell → `/studio`.

Future product question is not merely `open studio`; it is `which specialist environment is intended?`

Possible future identities include Personal Studio, Pro Studio, Writer's Studio, or a generic Studio chooser whose only power is orientation.

No silent remapping is authorized.

### `schedule.create`

Current phrase conflates possible member booking, practitioner session creation, team scheduling, and future calendar actions.

These have different actors, data, external effects, and liability.

Disposition: **not sufficiently bounded to wire**.## Lifecycle reconciliation

O2 lifecycle standing applies to the registered identity, not to nearby functionality.

| Capability | Registry lifecycle | Nearby substrate |
| --- | --- | --- |
| journal.create | DECLARED | Journal UI + navigation exist |
| journal.save | DECLARED / UNBOUND | voice effect WIRED |
| journal.dream | DECLARED / UNBOUND | voice effect WIRED |
| astrology.reading | DECLARED | Astrology product exists |
| astrology.transit | DECLARED / UNBOUND | voice effects WIRED |
| pattern.detect | DECLARED | pattern concepts/events exist |
| pattern.show | DECLARED / UNBOUND | world navigation WIRED |
| wisdom.surface | DECLARED | Wisdom substrate exists |
| wisdom.text | DECLARED / SEMANTIC MISMATCH | Wisdom navigation WIRED |
| relationship.reflect | DECLARED / INTENTIONALLY UNWIRED | Relationships room exists |
| depth.shadow | DECLARED / UNBOUND | modal UI WIRED |
| studio.transition | DECLARED / UNBOUND | voice transition WIRED |
| schedule.create | DECLARED | scheduling substrate exists |

This preserves O2-INV-16: nearby functionality does not silently promote an unbound registry ID.## Economic and research reconciliation

O2R1 carries economic classes as description only:
- Journal create/save/dream → FREE_FOUNDATION;
- Astrology reading → Free foundation with Steward depth around it;
- Astrology transit → Free/Steward boundary depends on scope/capacity;
- Relationship reflection → Free foundation with Steward longitudinal depth;
- Wisdom → meaningful Free foundation with advanced Steward retrieval/study;
- Pattern identities → unresolved;
- Shadow → unresolved pending current Shadow constitution;
- Studio transition → Studio entitlement only after destination identity exists;
- Scheduling → context-specific / unresolved.

No access enforcement changes follow from this.

None of the 13 IDs gains research authority from O2R1.

Special claim-discipline pressure applies to Pattern, Shadow, advanced Astrology interpretation, and Wisdom claims.

## Founder adjudication questions

1. Journal save scope: selected passage, current turn, bounded recent context, or ask each time?
2. Astrology transit identity: split current vs personal, or one parameterized act?
3. Pattern architecture: does `pattern.show` survive, and where does it truthfully lead?
4. Wisdom identity: navigation to Wisdom versus opening a specific text — one ID or two?
5. Shadow namespace: what is the current canonical member-facing name/placement?
6. Studio identity: generic chooser versus separate Personal / Pro / Writer's IDs?
7. Scheduling identity: which actor/context does each scheduling capability serve?## O2R1 standing

> **CURRENT 13-CAPABILITY RECONCILIATION DELIVERED · 13 CODE IDS MAPPED · STANDARD-5 14-vs-13 VOCABULARY DIVERGENCE RECORDED · EXISTING OUT-OF-REGISTRY VOICE/UI EFFECTS IDENTIFIED · 7 FOUNDER SEMANTIC RULINGS ISOLATED · NO SOURCE IMPLEMENTATION**

## Exact next boundary

> **FOUNDER ADJUDICATION — O2R1 SEVEN SEMANTIC RULINGS**

After those rulings, the successor would be:

> **O2R2 — RATIFIED CAPABILITY IDENTITY SET + DESCRIPTOR FIXTURES ONLY**

O2R2 would create documentary/test fixtures for accepted identities and contracts, still stopping before production wiring.