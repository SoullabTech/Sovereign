# JARVIS-AIN-PLATFORM-01 · J1 — Runtime Boundary Census

**Date:** 2026-09-17
**Mode:** DISCOVER / read-only census
**Canonical subject:** 34e7fe4eb3acdadb690f403d1c17734fc182209e
**Branch:** chore/ain-platform-01-j1-runtime-boundary-census-20260917
**Implementation authorization:** none

## 1 · Census question

> What inside the present Soullab / MAIA repository is actually evidence of a reusable AIN runtime, what belongs specifically to MAIA or Now What, what is legacy or semantically overloaded, and what cannot be decided without founder authority?

The census deliberately does **not** ask “what should AIN become?” until it has established what the repository can already prove.

## 2 · Population

The census sampled the current canonical families most directly implicated by the proposed platform boundary.

| Family | Source/document files counted |
|---|---:|
| packages/ain-engine | 4 |
| lib/ain | 66 |
| lib/provenance | 3 |
| lib/sanctuary | 3 |
| lib/practiceField | 9 |
| lib/relationships | 10 |
| lib/relationship | 2 |
| lib/memory | 89 |
| lib/maia | 225 |
| lib/nowWhat | 9 |
| app/api/ain | 7 |
| app/api/maia | 42 |
| app/api/now-what | 7 |
| app/maia | 85 |
| app/now-what | 20 |
| components/maia | 69 |
| components/now-what | 8 |

These counts establish the named search population for J1. They do not imply every file in a family has the same architectural standing.

## 2.1 · Freshness reconciliation

J1 opened from canonical 5b5683048c75087f8bc611fb55e6628cf2983687. Before publication, canonical advanced to **34e7fe4eb3acdadb690f403d1c17734fc182209e**.

The intervening 13 changed paths were confined to H8 relational-field-shadow work and voice. None touched the discriminating J1 seams: packages/ain-engine, FIELD_MANIFEST history, lib/maia/roomComposition.ts, Practice Field, Now What, or the governing canon cited here. The mechanical discriminators were rerun at 34e7fe4eb and returned the same results. The broad lib/maia family count rose from 221 to **225** because of the H8 additions; this census records the current count.

## 3 · F1 — “AIN” presently names more than one architectural object

### Observed fact

packages/ain-engine/README.md defines AIN as **Agentic Intelligence Networks**, a deliberative computation engine beneath MAIA. It explicitly states a “MAIA-First Hierarchy”: MAIA is the platform/product; AIN is an engine dependency.

packages/ain-engine/src/index.ts is not a realized platform runtime. Its exported deliberate() function returns the placeholder string “AIN engine not yet migrated,” and its telemetry export returns zero/empty placeholder values.

Repository history places this package framing in January 2026, before the present constitutional-runtime discussion.
Separately, current canonical contains:

- a large lib/ain/** service family;
- direct /api/ain/* routes;
- a legacy app/api/_backend/src/ain/** hierarchy;
- platform-wide constitutional laws and cross-field mechanisms that do **not** live under ain.

### Interpretation

“A folder already named AIN” is not a trustworthy proxy for the runtime boundary now under consideration.

### Consequence

The programme must reconcile AIN's semantic identity before renaming or extracting code.

### Open question

Does AIN going forward name the constitutional runtime/platform standard, while the old deliberative meaning becomes a subsystem/legacy name; or do both meanings coexist under explicit names? Repository evidence cannot decide this.

## 4 · F2 — packages/ain-engine does not prove a separable constitutional runtime

### Observed fact

A source search found no application consumer importing @maia/ain-engine; the only current hit outside the package is an architectural comment in packages/shared/src/index.ts.

The package excludes sessions, authentication, HTTP, user storage, product decisions, and UX and was designed for deliberation/telemetry/knowledge/activation—not for the current consent/provenance/memory/authority/field problem.

### Interpretation
The package is evidence of an earlier separation attempt, not evidence that the current platform substrate has already been separated.

### Consequence

“Move more files into packages/ain-engine” is not an evidence-earned J1 conclusion.

## 5 · F3 — cross-field constitutional law already exists

### Observed fact

Several current canon artifacts are explicitly broader than a single product surface.

Most decisive:

- CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md is ratified and explicitly governs every developmental surface and future feature carrying person material.
- ENCOUNTER_AS_PRIMITIVE.md is platform-wide foundational ontology.
- RIGHT_TO_REMAIN_UNPOSSESSED.md is canon governing inference, memory, interpretation, tempo, care, and meaning.
- FEDERATED_RELATIONAL_ARCHITECTURE.md is binding structural law preserving distinct gravitational centers.
- RECOGNITION_INTEGRITY.md is canon and load-bearing for retrieval/product/governance decisions.

### Interpretation

The constitutional substrate is not hypothetical. Some of it is already deliberately platform-wide.

### Consequence

AIN Runtime formalization should begin from authorizing clauses, not from whatever implementation directory currently bears the AIN name.
### Open question

Some highly consequential law is still explicitly MAIA-named, including MAIA_SOVEREIGNTY_INVARIANTS.md and MAIA_OATH.md. J1 does not universalize that law into AIN without a founder act.

## 6 · F4 — strongest cross-field runtime seam is MAIA-namespaced and entangled

### Observed fact

Both:

- app/api/now-what/interview/route.ts
- app/api/maia/vision-studio/interview/route.ts

import composeRoomTurnPrompt from lib/maia/roomComposition.ts.

That module declares and implements a shared composition order:

1. MAIA constitutional floor
2. member presence / read-only continuity
3. practitioner field context
4. member-declared programme position
5. room-specific grammar / hard limits

The module is intentionally shared to prevent two sibling rooms from drifting.

At the same time it remains coupled to the MAIA identity/floor, lib/maia namespace, Now What environment variables, practice-field assumptions, and room-specific field selection conventions.

### Interpretation
This is strong evidence for a **runtime contract candidate**, not evidence of a generic runtime implementation.

### Consequence

The contract may eventually say that constitutional context composes before field context, field context before room behavior, and authority/provenance remain explicit. The present file itself cannot simply be renamed AIN without further adjudication.

## 7 · F5 — Now What is a real second field, but not a manifest-instantiated platform proof

### Observed fact

Current source populations show Now What as a distinct application surface rather than a copied /maia route tree.

A static import comparison found:

- 35 Now What JS/TS surface files with 29 unique internal imports;
- 193 MAIA JS/TS surface files with 156 unique internal imports;
- only 8 shared internal imports between the sampled surfaces.

Those shared imports are predominantly lower-level infrastructure:

- @/lib/http/apiBase
- @/lib/db/postgres
- @/lib/auth/serverSessions
- @/lib/scribe/scribeAuth
- @/lib/consciousness/spiralogic-core
- @/lib/privacy/memberRef
- @/lib/consciousness/LLMProvider
- @/lib/maia/roomComposition
Now What nevertheless has direct MAIA dependencies in its arrival/shell/room/interview path, including RoomHoloflower and the shared MAIA room-composition mechanism.

Now What has its own routes, room grammar, invitation logic, flourishing-domain vocabulary, carried-thread/lived-return logic, and product navigation/UI components.

### Interpretation

Now What proves that the repository contains a second materially different field/application and reusable infrastructure.

It does **not** prove that a field can be declared against a stable AIN runtime contract and instantiated without MAIA internals.

### Consequence

Larry is an excellent **falsification specimen** for the platform thesis, not evidence that the platform threshold has already been crossed.

## 8 · F6 — Practice Field is a substantial partial substrate, not yet “the Field contract”

### Observed fact

lib/practiceField/practiceFieldService.ts already contains meaningful cross-cutting machinery:

- practice-field persistence;
- snapshots;
- append-only revisions;
- readiness distinct from explicit governance containment;
- ratification/identity checks;
- field guidance;
- room formatting;
- explicit refusal to treat readiness as authority.
It also currently carries practitioner-specific and MAIA-specific semantics.

Notably, the active field corpus remains non-composable by default: corpusIsComposable() returns false pending a real authority model.

### Interpretation

Practice Field supplies evidence for runtime contracts around field identity, custody, versioning, containment, and composition authority.

It is not yet proof that every AIN field is a Practice Field.

### Consequence

Generalizing the table/service wholesale would silently universalize one product ontology.

## 9 · F7 — a canonical Field Manifest contract is absent

### Observed fact

docs/fields/FLOURISHING_FIELD_MANIFEST.md identifies itself as a June 2026 OS-validation draft and repeatedly says it was written to test a Field Manifest spec at docs/canon/FIELD_MANIFEST.md.

On current canonical:

- docs/canon/FIELD_MANIFEST.md is absent;
- git rev-list --all -- docs/canon/FIELD_MANIFEST.md returns zero commits;
- no object/path history for that exact file was found in the available repository refs.

The Flourishing manifest was later marked **HISTORICAL — NOT A VOCABULARY SOURCE** because its Larry vocabulary predates later corrections.
### Interpretation

The historical manifest is evidence of a useful architectural experiment. It is not a recoverable canonical contract whose missing file can simply be restored.

### Consequence

J1 must record a gap rather than fabricate the referent. A future Field Manifest specification must be newly constituted from current authority and lived field evidence if the founder authorizes that path.

## 10 · F8 — AIN OS cross-layer draft cannot fill the gap by itself

### Observed fact

docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md states DRAFT — NOT RULED, implementation authorization none, and an unresolved relationship to existing canon.

### Interpretation

Its ideas may inform inquiry, but using the draft as the missing runtime constitution would reverse authority.

### Consequence

The programme may cite it as design history, not governing law.

## 11 · F9 — candidate runtime is distributed

### Observed fact

Current mechanisms relevant to the proposed runtime are spread across lib/provenance, lib/sanctuary, lib/practiceField, lib/relationship*, lib/memory, lib/maia/roomComposition.ts, authentication/privacy infrastructure, constitutional documents outside lib/ain, and selected lib/ain services.

### Interpretation
The runtime is currently more accurately described as a **distributed constitutional substrate** than as a coherent software package.

### Consequence

Phase 1 is a formalization programme before it is an extraction programme.

## 12 · Boundary map — J1 current best evidence

| Subject | J1 classification | Evidence standing |
|---|---|---|
| Direction of Authority | platform-wide constitutional law | OBSERVED / ratified |
| Encounter primitive | platform-wide constitutional ontology | OBSERVED |
| Right to Remain Unpossessed | platform-wide constitutional constraint | OBSERVED |
| Recognition Integrity | constitutional constraint | OBSERVED / MAIA-linked but canon |
| Federated Relational Architecture | platform-wide structural law | OBSERVED |
| MAIA Sovereignty Invariants / Oath | MAIA constitutional law; generic portability unresolved | OBSERVED + FOUNDER QUESTION |
| lib/maia/roomComposition.ts | cross-field runtime-contract candidate, implementation entangled | OBSERVED |
| lib/practiceField/** | reusable field-substrate candidate with practitioner-specific ontology | OBSERVED / PARTIAL |
| provenance / sanctuary / relationship / memory families | candidate runtime families; contract-by-contract census required before extraction | OBSERVED families, UNRESOLVED boundary |
| Now What room grammar / invitation / flourishing vocabulary / routes | field-specific | OBSERVED |
| MAIA identity, voice, sacred /maia experience | MAIA-specific expression; exact contract boundary still owed | OBSERVED |
| Spiralogic core | shared lens/service; not thereby a constitutional primitive | OBSERVED |
| packages/ain-engine | legacy/earlier AIN meaning; placeholder boundary | OBSERVED |
| lib/ain/** | active but semantically mixed AIN service family | OBSERVED; not classified wholesale |
| canonical Field Manifest spec | absent | OBSERVED ABSENCE |
| implementation-independent AIN Runtime Specification | absent as a single governing artifact | OBSERVED ABSENCE |
| clause → contract → conformance trace | not present as a complete AIN runtime chain | GAP |
| manifest → independent field instance mechanism | not demonstrated | GAP |

## 13 · Falsifier A — “the separable AIN Runtime already exists; extract it”

### Mutant

Treat packages/ain-engine as the desired AIN Runtime because it already has a package boundary and the AIN name.

### Result

**FAILS.**

Discriminating evidence:

1. the package describes a different architectural object: Agentic Intelligence Networks / deliberation engine;
2. its main functions are placeholders;
3. application consumption is effectively absent in the sampled canonical tree;
4. consent, provenance, memory authority, Sanctuary, field composition, and relational constitutional constraints live elsewhere;
5. the strongest actual cross-field composition mechanism lives in lib/maia, not the package.

### What this falsifies

It falsifies the claim that Phase 1 can be reduced to a code move or package rename.
## 14 · Falsifier B — “Now What proves AIN is already a platform”

### Mutant

Treat the existing Now What application as proof that an independent field is already instantiated on a stable common AIN contract.

### Result

**FAILS.**

Discriminating evidence:

1. no current canonical Field Manifest contract exists;
2. Now What has its own manually composed routes/components/domain logic;
3. Now What directly imports MAIA components/mechanisms;
4. the shared composition seam is MAIA-namespaced and Now What-aware;
5. no implementation-independent runtime spec is the source from which both MAIA and Now What are demonstrably built.

### What this falsifies

It falsifies “platform already achieved.”

It does **not** falsify the platform thesis. It strengthens the case for formalization because there is already a genuinely different second specimen.

## 15 · J1 adjudication

### PASS — bounded claim
> The repository contains enough platform-wide constitutional law, reusable substrate, and cross-field implementation evidence to justify a formal AIN Runtime programme, and the separability boundary is discoverable rather than imaginary.

### STOP — stronger claims

J1 does **not** establish that:

- a separable AIN Runtime is already realized;
- packages/ain-engine is the desired runtime;
- MAIA-specific law automatically governs all future fields;
- the historical Field Manifest is canonical;
- AIN Studio should be implemented now;
- any code is ready to move;
- AIN is ready to be open-sourced.

## 16 · Next gate

J1 exposes founder-level questions that repository evidence cannot answer without reversing authority.

The next legitimate act is **J2 — Founder Adjudication**, limited to those questions. Runtime contract design remains downstream.
