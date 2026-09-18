# MAIA-TEACHING-INTELLIGENCE-01 / T4 — Knowledge & Retrieval Orchestration Contract

**Date:** 2026-09-18
**Contract:** kro-1
**Status:** CANDIDATE · PURE DETERMINISTIC CONTRACT · NON-EXECUTING
**Opened from exact canonical:** 9580ad382089e8ce2e454d28ff3d97c2aa8efe11
**Upstream teaching law:** T0 + T1 + T2 + T3 canonical
**Runtime retrieval:** NOT AUTHORIZED
**Web browsing:** NOT AUTHORIZED
**T5:** CLOSED

---

## 0. Purpose

T4 defines how a lawful T3 teaching composition states what knowledge it needs and produces a governed source-acquisition plan.

T4 is not a retriever.

~~~
T3 TEACHING CLAIM
        ↓
T4 KNOWLEDGE NEED
        ↓
T4 ACQUISITION PLAN
        ↓
[FUTURE EXECUTION BOUNDARY — CLOSED]
        ↓
SOURCE EVIDENCE
        ↓
T4 SATISFACTION EVALUATION
~~~

At this gate only the plan and the deterministic evaluation law exist.

---

## 1. Governing retrieval law

T4 preserves the already-established Soullab governed-knowledge law:

> **AUTHORIZED ≠ INGESTED ≠ RETRIEVABLE ≠ RETRIEVED ≠ APPROPRIATE TO REPRESENT**

Consequences:

- storage is not authority;
- indexing is not authority;
- embedding is not authority;
- retrieval is not truth;
- similarity is not epistemic standing;
- domain/category match is not authority;
- retrieval frequency is not confirmation;
- a runtime retrieval result is not permission to teach;
- an authorized source must still be appropriate to represent for the exact claim.

T4 also preserves:

> **CO-PRESENCE ≠ CORROBORATION**

and:

> **MULTIPLE RETRIEVED SOURCES ≠ CONSENSUS**

---

## 2. T3 binding law

T4 consumes an already-valid TeachingCompositionRecord.

It does not accept free-form teaching prose as an authority source and it does not originate new teaching claims.

Every substantive T3 step must have exactly one T4 knowledge need.

A T3 no_claim step cannot originate a substantive T4 knowledge need.

The T3 step supplies:

- context;
- audience;
- domain;
- claim class;
- statement layer;
- T2 citation standing.

T4 may not silently alter them.

---

## 3. Knowledge-need record

Each T4 knowledge need represents:

- exact originating T3 step;
- teaching context;
- teaching domain key;
- T2 domain;
- T2 claim class;
- statement layer;
- capable source classes;
- required epistemic standings;
- citation requirement;
- freshness requirement;
- source-diversity requirement;
- evidence roles;
- bounded insufficiency disposition.

Supported insufficiency dispositions:

~~~
qualify
inquire
source_seeking_required
refrain
~~~

---

## 4. Retrievable source classes

T4 may plan only across:

~~~
soullab_canon
soullab_research
governed_library
practitioner_material
external_academic
external_scientific
external_historical_tradition
external_web_general
~~~

maia_synthesis is deliberately excluded.

MAIA synthesis is not a retrievable source. It may arise only downstream of independently standing source material under T3.

---

## 5. Source/standing law

T4 preserves the T2 source-class standing pairs:

~~~
soullab_canon
  → canonical

soullab_research
  → research_hypothesis

governed_library
  → governed_reference
  → canonical, when separately governed
  → research_hypothesis, when separately governed

practitioner_material
  → practitioner_authored
  → governed_reference

external_academic
  → peer_reviewed_evidence

external_scientific
  → scientific_reference
  → peer_reviewed_evidence

external_historical_tradition
  → historical_or_traditional

external_web_general
  → current_web_reference
~~~

Retrieval success cannot upgrade these standings.

---

## 6. Claim requirements

T4 preserves minimum T2 support law:

~~~
canonical_statement
  → canonical standing

research_hypothesis
  → research_hypothesis standing

evidence_summary
  → peer-reviewed and/or scientific standing

tradition_description
  → historical/traditional standing

comparative_synthesis
  → at least two independent sources
~~~

source_explanation remains source-specific and may use any lawful non-synthesis source class.

---

## 7. Freshness

T4 represents:

~~~
durable
current_revision
recent_scholarly
current_web
~~~

Freshness is independent from retrieval success.

Examples:

- current Soullab constitutional law may require current_revision;
- historical philosophy/tradition may be durable;
- contemporary scientific claims may require recent_scholarly;
- current institutional, legal, product, officeholder, standard, software, or event claims may require current_web.

Old evidence may remain valid historical evidence while failing a current-fact requirement.

---

## 8. Evidence roles and consensus

T4 may require:

~~~
canonical_authority
primary_source
secondary_source
peer_reviewed_scientific
historical_traditional
current_web
independent_corroboration
consensus_review
~~~

Evidence-role labels do not override source standing.

consensus_review is admitted only for a source form capable of carrying such evidence:

- systematic review;
- meta-analysis;
- consensus statement.

An ordinary primary study may not be relabeled as scientific consensus.

Multiple ordinary studies do not automatically become consensus.

---

## 9. Source diversity

T4 records a minimum independent-source count.

When more than one independent source is required, independence is measured by distinct authorship keys.

Two separately retrieved records from the same authorship do not satisfy a two-source corroboration requirement.

Repeated retrieval is not independent support.

---

## 10. Acquisition plan

T4 emits a deterministic KnowledgeAcquisitionPlan.

Each source request contains:

- request ID;
- knowledge-need ID;
- source class;
- required standing(s);
- target domain;
- freshness requirement;
- citation requirement;
- authority requirement;
- retrieval adapter class;
- evidence-role requirement;
- independent-source minimum;
- failure disposition.

The plan describes a future acquisition route.

It does not execute that route.

---

## 11. Existing authority seams

T4 composes with existing governance rather than creating parallel retrieval authority.

### Governed Library

T4 maps governed_library to:

~~~
adapter:
  governed_library_path_checksum

authority:
  global_library_path_checksum_authority
~~~

This names the existing authority seam implemented in:

lib/library/globalRetrievalAuthority.ts

That seam binds global Library retrieval to exact governed source path plus SHA-256 identity and fails closed when governed custody is absent.

### Soullab canon / research

Require governed repository authority.

### Practitioner material

Requires practitioner-scope authority.

### External academic / scientific / historical material

Requires external provenance authority.

### Current web

Requires current-web provenance authority.

No adapter is executed by T4.

---

## 12. Legacy retrieval containment

The repository already contains:

lib/ain/knowledge/RetrievalService.ts

and a legacy runtime callsite in:

lib/consciousness/maiaOrchestrator.ts

That path can use embeddings, similarity, mode/domain/category filters, and prompt formatting.

T4 does not adopt it as Teaching Intelligence authority.

The law is:

> **LEGACY RETRIEVAL ≠ TEACHING AUTHORITY**

A legacy retrieval result cannot satisfy T4 merely because it:

- is stored;
- is indexed;
- is embedded;
- has high similarity;
- matches domain/category;
- was retrieved repeatedly;
- was formatted for a prompt.

---

## 13. Satisfaction states

T4 distinguishes:

~~~
SATISFIED
PARTIALLY_SUPPORTED
CONTRADICTORY
INSUFFICIENT
UNAVAILABLE
AUTHORITY_BLOCKED
FRESHNESS_BLOCKED
~~~

SATISFIED requires applicable source class, standing, authority, appropriate-to-represent standing, retrieved evidence, non-legacy Teaching Intelligence standing, freshness, citation, diversity, and evidence roles.

PARTIALLY_SUPPORTED means some lawful support exists but diversity or evidence-role requirements remain incomplete.

CONTRADICTORY means authorized evidence contradicts the proposed teaching claim.

INSUFFICIENT means evidence exists but does not satisfy the required class, standing, citation, or support law.

UNAVAILABLE means no evidence candidate is available.

AUTHORITY_BLOCKED means evidence exists or is retrievable but lacks Teaching Intelligence authority.

FRESHNESS_BLOCKED means standing and authority may be valid while freshness is insufficient.

---

## 14. No semantic authority transfer

T4 prohibits:

~~~
stored → authorized
indexed → authorized
embedded → authoritative
retrieved → true
retrieved → appropriate to represent
similarity → epistemic standing
domain match → source authority
category match → source authority
retrieval frequency → confirmation
Soullab research → Soullab canon
historical tradition → science
general web → academic evidence
academic publication → scientific consensus
old evidence → current evidence
multiple sources → consensus
practitioner material → diagnosis/treatment authority
MAIA synthesis → sourced fact
acquisition plan → retrieval execution
retrieval execution → teaching authority
~~~

---

## 15. Authority boundary

T4 fixes:

~~~
authorityEffect = DESCRIPTIVE_ACQUISITION_PLAN_ONLY
executionStanding = NON_EXECUTING_PROPOSAL

mayRetrieve = false
mayBrowse = false
mayCallModel = false
mayTeach = false
mayExecute = false
mayMutatePrompt = false
mayPersistLearnerState = false

mayWriteManuscript = false
mayDiagnose = false
mayDirectTreatment = false
mayDirectClientAction = false
mayAutonomouslyAct = false
~~~

The presence of acquisition requests does not change these values.

---

## 16. Adversarial falsification

The T4 test suite explicitly attacks:

- storage/index/embed as authority;
- retrieval as truth;
- similarity as standing;
- domain/category match as standing;
- retrieval frequency as confirmation;
- legacy RetrievalService as teaching authority;
- Soullab research as canon;
- tradition as science;
- web as scholarship;
- one primary study as consensus;
- multiple ordinary studies as consensus;
- stale evidence as current;
- same-authorship repetition as independence;
- co-presence as corroboration;
- MAIA synthesis as retrievable source;
- planning as execution;
- forged T3 authority;
- provider/query/prompt/execute escape fields.

---

## 17. Existing governance compatibility

T4 does not weaken:

- corpus authority;
- Library path/checksum custody;
- practitioner/member scoping;
- Sanctuary;
- source custody;
- retrieval containment;
- T2 epistemic standing;
- T3 teaching authority limits.

It names future adapter classes but opens none of them.

---

## 18. Stop boundary

This tranche authorizes only:

1. this contract;
2. the pure deterministic TypeScript implementation;
3. adversarial tests;
4. exact candidate evidence.

It does not authorize:

- actual Library retrieval;
- AIN retrieval execution;
- web search;
- scholarly-provider access;
- external research skills;
- live citations;
- prompt injection;
- teaching generation;
- model/provider calls;
- schema/migrations;
- deployment;
- production mutation;
- T5.

Green evidence does not authorize merge by inference.

---

## 19. Standing

**T4 CANDIDATE ONLY.**

Only after separate Founder adjudication and canonical merge may a later gate consider an execution boundary that consumes a T4 acquisition plan and actually obtains evidence.
