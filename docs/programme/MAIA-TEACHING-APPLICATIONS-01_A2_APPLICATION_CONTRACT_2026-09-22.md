# MAIA-TEACHING-APPLICATIONS-01 / A2 — Application Contract

> **Programme:** MAIA-TEACHING-APPLICATIONS-01  
> **Act:** A2 — APPLICATION CONTRACT  
> **Class:** C — constitutional contract + falsification evidence only  
> **Opening canonical:** `0691cd3668c1ba0312e3578d5264a8b1abf90ec3`  
> **Canonical A1 content authority:** `e61971855bd759a43d5e5805146c8497de2f0df6`  
> **Canonical A1 blob:** `9a68e24e6746602fd7893d38d554fb445d36575f`  
> **Status:** CONTRACT CANDIDATE · NON-RUNTIME · NO IMPLEMENTATION

---

## 0 · Purpose

A2 defines the common contract by which one canonical MAIA teacher may be applied across the five canonical teaching surfaces without acquiring authority that belongs to the learner, writer, practitioner, researcher, host surface, retrieval system, mutation system, provider router, durable learner record, or scientific programme.

A2 answers:

> **What must every Teaching Application declare, preserve, refuse, and hand outward before any A3–A5 implementation may exist?**

A2 defines law. It does not implement a teaching application.

---

## I · Inherited law

A2 inherits A0, A1, T0–T8B, and TCF-2 without reopening them.

Preserve:

> **THE TEACHER MAY HELP THE PERSON SEE MORE CLEARLY. THE TEACHER DOES NOT TAKE OVER THE PERSON'S WORK.**

Preserve:

> **TEACHING AUTHORITY DOES NOT BECOME AUTHORSHIP, CLINICAL, PROFESSIONAL, OR SCIENTIFIC AUTHORITY BY ACCUMULATION.**

Preserve:

> **THE APPLICATION INHERITS THE TEACHING CONSTITUTION; IT DOES NOT QUIETLY REWRITE IT.**

Default authority remains:

```text
mutation_authority             = NONE
retrieval_authority            = INHERITED_ONLY / NO NEW ACQUISITION
provider_routing_authority     = NONE
learner_persistence_authority  = NONE
scientific_execution_authority = NONE
```

Silence never widens these defaults.

---

## II · Canonical application descriptor

Every later application must be representable by one descriptor with the following explicit fields:

```text
application_id

host_surface
host_route
teaching_purpose
bounded_work_object

allowed_teaching_acts

surface_authority_basis
surface_authority_standing

source_standing_rules
retrieval_authority

learner_authority_owner
artifact_authorship_owner
professional_judgment_owner
scientific_judgment_owner

mutation_authority
provider_routing_authority
learner_persistence_authority
scientific_execution_authority

downstream_handoff
handoff_authority_owner

domain_keys
domain_authority_scope

stop_conditions
route_outward_conditions

required_falsifiers
```

This descriptor is constitutional law, not a production schema.

One descriptor carries one effective surface and one effective domain-authority envelope. Descriptors do not union merely because the same teacher is capable of teaching on another surface.

---

## III · G1 ruling — surface authority

### Ruling

A2 recognizes exactly two **application-level evidence forms** for already-established surface authority:

1. `SERVER_ADJUDICATED_CURRENT_TURN`
2. `SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION`

This does **not** add a new T8B surface or modify T8B semantics.

### A · Shared-route surfaces

The following remain governed by T8B current-turn server adjudication:

- `general_maia`
- `coaching_practice`
- `therapist_practitioner`
- `research_lab`

Their authority basis remains server-held standing. Client intent is never authority.

### B · Writer's Studio

`writers_studio` may use `SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION` only because all of the following are simultaneously true:

- member identity is server-established;
- the manuscript/thread host object is server-established and member-bound;
- the route is the canonical `writers_studio_editorial` route;
- the surface/route/context/audience tuple is fixed as `writers_studio / writers_studio_editorial / writers_studio / writer`;
- no client-supplied teaching-surface label selects or elevates the surface;
- the authority grants no professional or research standing;
- the authority expires with that host interaction;
- the authority may not persist into another turn or surface merely because the same teacher is used.

The route does not self-authorize. The authority is the server-proven member + host-object custody expressed through a canonical fixed route.

### Why this does not rewrite T8B

T8B remains controlling for every surface selected on the shared MAIA route. A2 does not add `writers_studio` to the T8B shared-route adjudicator and does not alter `TeachingRuntimeSurfaceAuthority`.

A2 merely names the distinct server-bound evidence form already present in canonical Writer's Studio custody.

If any future Writer's Studio path permits client surface selection, role elevation, ambiguous host ownership, or a non-fixed route tuple, this ruling no longer applies and the request routes outward to core teaching governance.

> **G1 RESOLVED:** two bounded authority-evidence forms are permitted; only one is T8B shared-route adjudication.

---

## IV · G2 ruling — Writer's Studio source plane

Three things remain distinct:

```text
source class permitted by surface law
≠ governed source actually present in this turn
≠ authority to acquire a new source
```

T7's permitted Writer's Studio source classes do not imply that those sources are wired.

Canonical A1 established that the live Writer's Studio bridge call supplies no governed `sources`.

Therefore the current Writer's Studio application standing is:

```text
source_plane             = NO_GOVERNED_SOURCE_WIRING
retrieval_authority      = NO_NEW_ACQUISITION
substantive_fallback     = MAIA_SYNTHESIS_UNVERIFIED
```

A later A3 implementation may teach under that standing.

A3 may not convert permitted source classes into retrieved evidence.

If Writer's Studio is later to receive governed source references, the retrieval path must be separately authorized, and its output must enter with its actual claim-level provenance.

> **G2 RESOLVED:** Writer's Studio is source-capable in surface law, currently source-unwired in runtime, and A2 grants no retrieval.

---

## V · G3 ruling — practitioner terminality

Practitioner and coaching teaching are terminal at education/reflection under the Teaching Applications programme.

The canonical downstream standing is:

```text
downstream_handoff = NONE_TERMINAL_EDUCATION
```

Teaching may explain, contrast, inquire, illustrate, invite reflection, offer bounded practice, and repair misunderstanding.

Teaching may not itself transition into:

- diagnosis;
- client assessment;
- treatment planning;
- intervention selection;
- client-directed action;
- autonomous professional recommendation;
- mutation of a professional record.

The practitioner remains the professional decision authority.

If a future product requires a teaching→professional-action handoff, a separate host programme must define and earn it. A2 does not declare such a seam owed.

> **G3 RESOLVED:** practitioner teaching is deliberately terminal unless separate host governance later creates a lawful handoff.

---

## VI · G4 ruling — domain-key asymmetry

The current T7 surface-domain subsets are authoritative application scope.

A2 does not infer a hidden pedagogical reason for the asymmetry and does not need one in order to govern it.

The law is:

> **Domain availability is surface-scoped authority, not a globally possessed capability of the teacher.**

Therefore:

```text
teacher can teach domain X somewhere
≠ teacher may teach domain X on every surface
```

Current T7 sets are inherited unchanged:

- `general_maia` — canonical all-domain set;
- `writers_studio` — `writing_rhetoric`;
- `coaching_practice` — current coaching set;
- `therapist_practitioner` — current practitioner set;
- `research_lab` — current research set.

A request for a domain outside the active surface does not borrow permission from another surface.

It must either remain within an allowed domain, move through a separately lawful surface-adjudication act, or route outward:

> **ROUTE OUTWARD — CORE PLATFORM-BINDING GOVERNANCE REQUIRED**

> **G4 RESOLVED:** current non-nested domain sets are binding scope; future widening is a T7/platform-governance question, not an A2 application feature.

---

## VII · Cross-domain authority non-accumulation

The same teacher may operate in multiple domains and surfaces over time.

The teacher never accumulates the union of those authorities.

Every teaching move is bounded by one effective envelope:

```text
surface
route
audience
domain
source standing
surface authority basis
host custody
```

A surface transition requires fresh authority appropriate to the destination surface.

A domain transition inside one surface is permitted only if the destination domain is already allowed by that surface.

If a requested move is ambiguous between teaching and an authority-bearing effect, the application remains at explanation/proposal or `REFRAIN`.

No previous surface, role, source standing, or host handoff can be inherited merely because the interaction is continuous.

---

## VIII · Writer's Studio host handoff law

Writer's Studio has an already-canonical action chain:

```text
teaching / explanation
        ↓
optional proposal
        ↓
existing proposal custody
        ↓
exact member authorization
        ↓
existing apply seam
        ↓
version / undo / recovery
```

The application may explain the possibility of entering that chain.

It may not execute the chain by teaching authority.

Preserve:

> **EXPLANATION OF A POSSIBLE REVISION ≠ PROPOSAL ACCEPTANCE**

> **PROPOSAL ≠ AUTHOR CONSENT**

> **TEACHING AUTHORITY ≠ MANUSCRIPT MUTATION AUTHORITY**

A2 grants no mutation authority and alters none of the proposal, authorization, apply, version, undo, recovery, or standing substrates.

---

## IX · Source and retrieval law

For every application:

1. surface law defines what source classes are permitted;
2. the current turn defines which governed sources are actually present;
3. retrieval authority determines whether new material may be acquired.

These do not collapse.

No application status authorizes browsing, retrieval, provider routing, or source acquisition.

When governed sources are present, claim-level provenance remains attached.

When governed sources are absent, MAIA synthesis remains MAIA synthesis and may not impersonate source evidence.

If a teaching answer requires new acquisition not already authorized:

> **STOP · SEPARATELY GOVERNED RETRIEVAL AUTHORITY REQUIRED**

---

## X · Professional and clinical boundary

Teaching for practitioners is educational authority only.

It may teach models, methods, distinctions, limitations, uncertainty, source standing, and hypothetical educational examples.

It does not acquire:

- diagnostic authority;
- treatment authority;
- client assessment authority;
- intervention-selection authority;
- professional-record authority;
- authority to direct a practitioner.

Case material never upgrades the teacher into the case decision-maker.

> **CASE LEARNING ≠ CASE AUTHORITY**

---

## XI · Research and scientific-standing boundary

A2 preserves TCF-2 and the current RGR standing membrane.

The contract keeps distinguishable:

- Soullab canon;
- Soullab research;
- external scholarship;
- MAIA paraphrase;
- MAIA synthesis;
- active research;
- hypothesis;
- established empirical evidence.

Preserve:

> **H-RT1 remains empirically unestablished.**

Preserve:

> **RGR-06 implementation machinery is not benchmark evidence.**

Fluency, repetition, canonical status, learner agreement, or teaching clarity never upgrades scientific standing.

No Teaching Application can execute research or manufacture benchmark evidence.

---

## XII · Teaching effects versus authority-bearing effects

### Teaching effects

The canonical teaching grammar remains:

- ORIENT
- EXPLAIN
- ILLUSTRATE
- CONTRAST
- INQUIRE
- INVITE_EXPERIENCE
- OFFER_PRACTICE
- CHECK_UNDERSTANDING
- REPAIR_MISUNDERSTANDING
- REFRAIN

### Authority-bearing effects

Examples include:

- write or apply manuscript text;
- mutate durable state;
- retrieve or browse a new source;
- route to a new provider;
- establish role/access standing;
- diagnose;
- prescribe;
- direct client action;
- execute research;
- persist learner state.

When the requested effect belongs to the second class, Teaching Application authority ends.

The application must either identify an already-lawful downstream handoff or stop.

---

## XIII · Canonical application profiles

A2 defines five profiles over one common contract.

### `general_maia`

- surface authority: `SERVER_ADJUDICATED_CURRENT_TURN`
- retrieval: inherited shared-route retrieval only; no new acquisition
- learner authority: member
- mutation authority: none
- downstream handoff: none
- domains: exact current T7 general set

### `writers_studio`

- surface authority: `SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION`
- required host evidence: server-established member + member-bound host object + fixed canonical tuple
- retrieval: `NO_GOVERNED_SOURCE_WIRING`; no new acquisition
- substantive no-source standing: MAIA synthesis, unverified as source
- learner authority: writer
- artifact authorship: writer
- mutation authority: none
- downstream handoff: reference only to existing proposal→authorization→apply chain
- domains: exact current T7 Writer's Studio set

### `coaching_practice`

- surface authority: `SERVER_ADJUDICATED_CURRENT_TURN`
- professional judgment owner: practitioner
- retrieval: inherited shared-route retrieval only; no new acquisition
- downstream handoff: `NONE_TERMINAL_EDUCATION`
- professional action: none
- domains: exact current T7 coaching set

### `therapist_practitioner`

- surface authority: `SERVER_ADJUDICATED_CURRENT_TURN`
- professional judgment owner: practitioner
- retrieval: inherited shared-route retrieval only; no new acquisition
- downstream handoff: `NONE_TERMINAL_EDUCATION`
- diagnosis/treatment/client action: none
- domains: exact current T7 practitioner set

### `research_lab`

- surface authority: `SERVER_ADJUDICATED_CURRENT_TURN`
- scientific judgment owner: researcher
- retrieval: inherited shared-route retrieval only; no new acquisition
- downstream handoff: none
- scientific execution: none
- domains: exact current T7 research set

---

## XIV · Stop semantics

The application MUST stop or remain non-executing when:

- no lawful teaching occasion exists;
- the requested domain is outside the active surface;
- a requested surface elevation lacks server-held standing;
- a requested effect is authority-bearing and no lawful handoff exists;
- new retrieval would be required but is not separately authorized;
- source standing is insufficient for the requested claim;
- the person stops teaching or changes topic;
- the application would need durable learner inference;
- the application would need to alter T0–T8B or TCF-2;
- the application would need professional, scientific, mutation, routing, or access authority.

Where the request conflicts with core teaching law:

> **ROUTE OUTWARD — CORE TEACHING GOVERNANCE REQUIRED**

Where it requests a domain outside T7 surface scope:

> **ROUTE OUTWARD — CORE PLATFORM-BINDING GOVERNANCE REQUIRED**

Where it requires new source acquisition:

> **ROUTE OUTWARD — RETRIEVAL GOVERNANCE REQUIRED**

Where it requires a professional action seam:

> **ROUTE OUTWARD — HOST-SURFACE GOVERNANCE REQUIRED**

---

## XV · F-A0-01 through F-A0-20 mapping

| Falsifier | Scope | A2 clause / defeat condition | Later evidence owed |
|---|---|---|---|
| F-A0-01 new-teacher smuggling | global | I, II, XII — one canonical teacher/grammar only | A3–A5 show no parallel teacher/act grammar |
| F-A0-02 relevance without occasion | global | XIV — no occasion means no teaching | A3–A5 occasion fixtures |
| F-A0-03 teaching→mutation | Writer's Studio | VIII, XII — mutation authority none | A3 manuscript remains unchanged |
| F-A0-04 proposal is not consent | Writer's Studio | VIII — proposal/consent separation | A3 proposal/apply separation |
| F-A0-05 professional-action capture | practitioner | V, X, XII | A4 case-learning refusal fixtures |
| F-A0-06 client metadata impersonates role | practitioner/research | III — server-held standing required | A4/A5 denied-elevation fixtures |
| F-A0-07 learner profile creep | global | I, XIV — persistence none | A3–A5 no durable learner state |
| F-A0-08 stop outranks momentum | global | XIV | A3–A5 stop/topic-change fixtures |
| F-A0-09 Soullab hierarchy collapse | Soullab domains | I, XI + TCF-2 | A3–A5 fidelity fixtures where applicable |
| F-A0-10 RGR scientific inflation | research | XI | A5 RGR-06/H-RT1 fixture |
| F-A0-11 epistemic-standing collapse | global | IX, XI | A3–A5 mixed-standing fixtures |
| F-A0-12 citation authority laundering | global | IX | A3–A5 synthesis/source separation |
| F-A0-13 retrieval/routing smuggling | global | IV, IX, XIV | A3–A5 new-acquisition refusal |
| F-A0-14 author impersonation | source-bearing | IX | A3/A5 author/source voice separation |
| F-A0-15 practice becomes proof | global | I, XII | A3–A5 practice/self-report standing |
| F-A0-16 authority accumulation | global | VI, VII | cross-surface/domain transition matrix |
| F-A0-17 agreement-as-success | global | I | A3–A5 disagreement fixtures |
| F-A0-18 host custody bypass | host-bound | III, VIII | A3 exact Writer's Studio custody proof; A4/A5 host gates |
| F-A0-19 ambiguous effect | global | VII, XII, XIV | A3–A5 explanation/proposal fail-closed fixture |
| F-A0-20 core-law rewrite | global | I, XIV | outward-route fixture |

The A2 constitutional matrix may test these clauses without creating application runtime.

---

## XVI · A3 / A4 / A5 obligations

### A3 · Writer's Studio Teaching Application

A3 must prove:

- Writer's Studio's bounded structural authority evidence;
- manuscript-first posture;
- explanation/proposal/apply separation;
- writer ownership of final language;
- current no-governed-source standing unless retrieval is separately authorized;
- existing version/undo/recovery custody;
- no mutation by teaching authority;
- relevant F-A0 falsifiers.

### A4 · Practitioner / Coaching Teaching

A4 must prove:

- T8B server-held surface authority;
- educational rather than clinical authority;
- practitioner ownership of professional decisions;
- terminal teaching behavior absent separate host governance;
- non-diagnosis/non-treatment/non-client-direction;
- source/provenance standing for methods;
- relevant F-A0 falsifiers.

### A5 · Knowledge / Research Teaching

A5 must prove:

- T8B research-surface authority where required;
- claim-level source/provenance standing;
- citation/non-collapse law;
- current versus historical evidence discipline;
- contested-position fidelity;
- active research/hypothesis boundaries;
- H-RT1/RGR-06 standing;
- no research execution;
- relevant F-A0 falsifiers.

---

## XVII · Explicit non-authorizations

A2 grants no:

- application runtime;
- Writer's Studio teaching implementation;
- practitioner teaching implementation;
- research teaching implementation;
- new teaching act;
- T0–T8B modification;
- TCF-2 modification;
- retrieval or browsing;
- provider/model call;
- routing change;
- new role or access;
- learner profile, score, or persistence;
- manuscript mutation;
- proposal application;
- practitioner action seam;
- diagnosis, treatment, or client action;
- research execution;
- benchmark materialization;
- schema or migration;
- application UI;
- deployment;
- production mutation;
- A3–A7 implementation.

Definition is not authority to satisfy the obligations it defines.

---

## XVIII · Candidate standing

A2 resolves the four A1 gaps as follows:

```text
G1  RESOLVED — two bounded authority-evidence forms;
               no T8B semantic change.

G2  RESOLVED — Writer's Studio is source-capable in law,
               source-unwired in runtime, retrieval not granted.

G3  RESOLVED — practitioner teaching terminal by default;
               later professional handoff requires host governance.

G4  RESOLVED — current T7 domain subsets are binding scope;
               no cross-surface union or inferred widening.
```

The contract preserves one canonical teacher, closes authority accumulation, defines host handoff and route-outward law, maps F-A0-01 through F-A0-20, and grants no implementation power.

> **MAIA-TEACHING-APPLICATIONS-01 / A2 — APPLICATION CONTRACT DEFINED · G1–G4 RESOLVED · AUTHORITY TRANSFERS CLOSED · HOST HANDOFF LAW DEFINED · FALSIFIER OBLIGATIONS MAPPED · NO IMPLEMENTATION · READY FOR FOUNDER ADJUDICATION**

A3 remains closed.
A4 remains closed.
A5 remains closed.
A6 remains closed.
A7 remains closed.
