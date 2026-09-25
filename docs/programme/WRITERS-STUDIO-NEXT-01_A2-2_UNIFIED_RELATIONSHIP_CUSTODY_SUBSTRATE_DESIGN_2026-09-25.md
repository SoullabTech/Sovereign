# WRITERS-STUDIO-NEXT-01 / A2-2
## UNIFIED RELATIONSHIP CUSTODY SUBSTRATE DESIGN + FALSIFIERS

**Date:** 2026-09-25
**Class:** design / census / falsification only
**Parent candidate:** 948c06e6f1162a36f516c5abcfbddfcc70054a15
**Parent canonical:** 03cb0f1c69825f7b0d51988cf4f31ef77273733f
**A2-2 packet:** 000d6267ce9135c748fd3bf2a6f01d0cd4467cabfec0f2c08d7f1ba9c8ab1209 · 18,614 bytes · 493 lines
**Runtime / schema / UI / deployment:** NONE

## I. Disposition

A2-2 selects:

> **OPTION B — NEW CONTENT-FREE PARENT CUSTODY + APPEND-ONLY RELATIONSHIP-LOCAL EPISODE REFERENCES**

No current durable object can serve as the A2 parent without semantic overloading.
A2-2 creates no table or migration.
## II. Substrate census and reuse decision

| Existing substrate | Current meaning | Reuse decision |
|---|---|---|
| ask_threads / ask_turns | one anchored/editorial child conversation; exactly one subject; stores author/MAIA prose | INCOMPATIBLE AS PARENT |
| proposal_chains | one immutable editorial locus and proposal succession | INCOMPATIBLE AS PARENT |
| Review Discuss thread + authorization/completion | one reading-local AS_READ child act | CHILD CUSTODY ONLY |
| context_disclosure_receipts | governed crossing audit, attempted→crossed | PROVENANCE POINTER ONLY |
| conversation_turns / sessions | content-bearing session and cross-session recall | INCOMPATIBLE AS PARENT |
| developmental readings/manifests | frozen reading identity/evidence | CHILD CUSTODY ONLY |
| living_work_expressions | member declaration that manuscript belongs to Living Work | REUSE AS CREATION/APPEND PROOF ONLY |
| Bardic episodes / links | autobiographical/experiential memory + cues/content | INCOMPATIBLE |
| relationship_spaces | two-person consent-governed collaborative space | INCOMPATIBLE |
| field-note threads/events | reflective memory/content | INCOMPATIBLE |
| epistemic join/standing ledger | warrant/standing-specific custody | MECHANICAL PRECEDENT ONLY |
| wisdom/event graphs | domain-specific graph events | INCOMPATIBLE |

No existing store is neutral enough to become the A2 parent by renaming it.
## III. Parent custody design

Logical parent object: WriterEditorialRelationshipCustody.

Minimum durable facts:
- opaque relationship id minted by the A2 boundary;
- member id;
- Living Work id;
- manuscript id;
- A2 contract version;
- created-at provenance timestamp.

Not stored:
- current scope or current episode;
- last section or last place;
- manuscript prose;
- child response prose;
- summary/transcript;
- disclosure, cognition, mutation or personal-memory grant.

Plurality remains legal. Multiple relationships may exist for one Work/manuscript.
Selection is explicit; latest/first never wins silently.
## IV. Work ↔ manuscript binding

The parent binds both Living Work and manuscript identity.

Creation authority is server-derived:
1. verified member identity;
2. the Living Work belongs to that member;
3. a current living_work_expressions declaration exists for expression_type manuscript and the exact manuscript id.

A manuscript may belong to more than one Living Work, so manuscript id alone cannot choose the parent Work.

Episode append re-verifies the current declaration.

If the declaration is later removed, the relationship remains historical/readable but is not appendable under that Work until a lawful declaration exists again.

Removing a declaration never rewrites prior episode history.
## V. Episode custody design

Logical episode object: WriterEditorialRelationshipEpisode.

One episode represents one completed child act, never an entire heterogeneous transcript.

Common durable facts:
- opaque episode id;
- parent relationship id;
- relationship-local sequence;
- closed child-kind discriminant;
- exact child-native identity;
- requested scope;
- executed scope;
- executability;
- temporal posture;
- history policy;
- continuation standing;
- authority class;
- carry policy at admission;
- admitted-at provenance timestamp.

Episode rows contain no manuscript prose and no child reply/finding/proposal text.
## VI. Exact child-act granularity

FOCUS_ACT
- exact completed exchange/request id;
- crossed disclosure id;
- session id only as child correlation;
- completion requires a real crossed boundary and completed response exchange.

EDITORIAL_THREAD_ACT
- thread id;
- proposal chain id;
- member turn index;
- MAIA turn index;
- exact completed member→MAIA turn pair;
- locus remains authoritative in the child proposal chain.

REVIEW_DISCUSS_ACT
- thread id;
- MAIA turn index;
- authorization/completion ref;
- readingId + observationKey;
- observation_id may be retained as provenance only;
- completion must be recorded for that exact authorization act.

Whole thread/session identity is insufficient episode granularity.
## VII. Future physical design family

Preferred A2-3 schema family:
1. one parent table; and
2. one append-only episode table with a closed child_kind / XOR child-reference shape.

A single episode row may use nullable child-reference columns only if database checks prove:
- exactly one child kind;
- all required refs for that kind are present;
- all refs belonging to other kinds are null;
- no zero-kind or two-kind row is representable.

Generic child_id, JSON metadata bags, URI references and optional-everything rows are rejected.

Table-per-kind sidecars are acceptable only if A2-3 can prove the same exact-one-kind guarantee structurally.
## VIII. Ordering and concurrency

Parent ordering authority is a relationship-local monotonic sequence.

Future append algorithm:
1. verified server identity loads the parent under member ownership;
2. lock the parent row for append serialization;
3. re-verify current Work↔manuscript declaration;
4. verify exact completed child ownership and standing;
5. compute next relationship sequence while the parent lock is held;
6. insert one immutable episode under UNIQUE relationship + sequence;
7. commit.

Timestamps are provenance only.

Child turn indexes, UUID order, reading timestamps, created_at and updated_at never order heterogeneous parent episodes.

Concurrent appends serialize. No ambiguous same-position state is lawful.
## IX. Admission semantics

A2 parent custody records completed relational acts only.

Not admitted:
- pre-persistence Sanctuary refusals;
- attempted-but-not-crossed Focus disclosures;
- incomplete Review Discuss acts;
- editorial thread-open with no completed MAIA turn;
- child failures with no completed answer.

Those facts remain in native child/audit custody.

A crossed-but-failed child remains whatever its child law says. It is not promoted to a completed A2 episode merely because crossing occurred.

Parent episode existence therefore means the referenced child act reached its own completed/admitted standing.
## X. Snapshot / live / derived classification

Snapshot at episode admission:
- child kind and native identity;
- requested and executed scope;
- executability;
- temporal posture;
- history policy;
- continuation standing;
- authority class;
- carry policy;
- relationship-local sequence.

Resolved live from child custody:
- child prose/answer/finding/proposal;
- provider/model provenance;
- editorial locus content;
- child deletion/unavailability.

Derived on read:
- episode count;
- child availability;
- parent mutation authority = NONE;
- parent disclosure/cognition authority = NONE;
- durable place = UNESTABLISHED;
- appendability from current member + Work declaration.

Parent custody never reconstructs missing child prose from summaries.
## XI. Carry, authority and scope

Default carry is PRESENTATION_ONLY.

Relationship membership never authorizes prompt/history injection, body disclosure, reread, comparison, Review continuation, proposal/adoption, Work mutation or personal-memory recall.

Prior disclosure receipts may be referenced as audit provenance only.

Completed episode admission requires requested scope = executed scope.

Unsupported scope requests do not become fake completed episodes.

Current standing:
- passage executable;
- section executable;
- chapter conversation not yet executable;
- whole-Work conversation not yet member-reachable in current Rebuild;
- sentence conversation not executable without a constituted sentence locator.
## XII. Deletion, retention and recovery

Child deletion never repoints an episode.

If a child becomes lawfully unavailable:
- parent retains only its content-free opaque reference;
- read reports child unavailable;
- no copied prose or generated summary substitutes for it.

Deleting a parent relationship never cascades into child semantic objects.

Work/manuscript/account deletion law remains superior; exact future FK/cascade mechanics are deferred to A2-3.

Recovery may restore relationship identity, ordered episode refs, child kinds, scope/temporal/history labels and child availability.

It does not restore caret, scroll, selection, active scope or durable place.
## XIII. Focus Work-identity dependency found by census

Current mounted Rebuild constructs Focus with:
- workRef = LivingWork.id;
- manuscriptId = context.manuscriptId.

The Focus assembler currently queries manuscript_sections.manuscript_id = workRef.

Those are distinct identity namespaces.

A2-2 does not repair this path.

Future A2 runtime must not admit Focus episodes until the Focus child can prove its Living Work ↔ manuscript identity correctly, or Focus must remain excluded from A2 runtime admission.

This is a prerequisite/dependency, not a reason to weaken the A2 parent design.
## XIV. Design comparison and suite-first evidence

| Architecture | Final matrix | Disposition |
|---|---:|---|
| A — reuse ask_threads as parent | 30/55 | reject |
| B — new parent + append-only typed episode refs | **55/55** | **selected** |
| C — derive from generic event/graph node | 41/55 | reject |
| session-as-parent | 32/55 | reject |

Suite-first known-bad reference:
- reference 7/55;
- matrix exit 1;
- 30/30 named defeat candidates already dead.

Final lawful design:
- reference 55/55 GREEN;
- 30/30 defeat candidates DEAD;
- strict typecheck PASS.
## XV. Instrument identities

- model.ts — 661a507c5e519c79cf8f8bc76a2444bab139534da9ce7cd1aa0c5dcb6012d666
- laws.ts — 5ddfddc699a32df95688a6995068243fbeca6a5d39adb3cd5bf36675251a0a7b
- design.ts — e2aec23069e6489fa938f3c033de15fd2a34ae7e09627928b9b443a8c1422f9c
- badArchitectures.ts — 83b1f8a7ec96e30630a7f351fce47cd33e08cefeff24a260e45f33ee2b68248f
- candidates.ts — 6f989fded48efc1f6b5ce9d012913dee9e8faef9f51fff5d674eb7b1549ee7a9
- matrix.ts — 1c28e553e50be470dcfaa2e5d3e823ffec75c4afbb6cd0755ab79bf59659204b
- tsconfig — 04c34e235fa8001ad4d80748acdf40df4179779f34a505f5edd4343d328c989d

Inherited verification:
- A2-1 24/24 GREEN · 24/24 defeat candidates DEAD · typecheck PASS;
- R2-2 17/17 GREEN;
- editorial-runtime lethal · 0 failures;
- Focus tests 64/64 PASS.
## XVI. What remains unimplemented

A2-2 designs but does not build:
- parent table;
- episode table;
- XOR child reference constraints;
- relationship mint;
- append transaction/locking;
- child ownership/completion validators;
- read service;
- deletion mechanics;
- capability/scope read;
- UI composition.

No schema or migration exists from A2-2.

## XVII. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-3 — RELATIONSHIP CUSTODY IMPLEMENTATION CONTRACT + MIGRATION DESIGN ONLY**

A2-3 should translate this design into an exact schema/transaction contract and defeat-candidate plan before implementation.

It must carry the Focus Work-identity prerequisite explicitly.

A2-3 is recommended, not opened.

## XVIII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-2 UNIFIED RELATIONSHIP CUSTODY SUBSTRATE DESIGN**

A2-2 STOPS BEFORE SCHEMA OR RUNTIME.
