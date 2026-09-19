# MAIA-TEACHING-INTELLIGENCE-01 / T5 — Research, Citation & Provenance Contract

**Date:** 2026-09-18
**Contract:** rcp-1
**Status:** CANDIDATE · PURE DETERMINISTIC CONTRACT · NON-EXECUTING
**Opened from exact canonical:** 78ba888aa074b9685ce810ace13d9228bdce469f
**Upstream teaching law:** T0 + T1 + T2 + T3 + T4 canonical
**T4 execution:** NOT AUTHORIZED
**Retrieval / browsing / downloading:** NOT AUTHORIZED
**T6:** CLOSED

---

## 0. Purpose

T5 defines the evidence envelope required for material intended to satisfy a T4 knowledge need.

The governing chain is:

~~~
T3 TEACHING CLAIM
        ↓
T4 KNOWLEDGE NEED
        ↓
T4 SOURCE REQUEST
        ↓
T5 TEACHING EVIDENCE RECORD
        ↓
AUDITABLE SOURCE / REVISION / LOCATOR / CUSTODY
~~~

T5 does not obtain evidence.

It determines whether supplied evidence metadata and provenance can lawfully describe an auditable evidentiary relationship to an exact teaching claim.

---

## 1. Core non-collapse laws

T5 preserves:

> **SOURCE FOUND ≠ SOURCE VERIFIED**

> **SOURCE VERIFIED ≠ CLAIM SUPPORTED**

> **CLAIM SUPPORTED ≠ CONSENSUS**

> **CITATION PRESENT ≠ CITATION SUPPORTS CLAIM**

> **URL ≠ PROVENANCE**

> **PARAPHRASE ≠ QUOTATION**

> **MAIA SYNTHESIS ≠ SOURCE TEXT**

> **MAIA SYNTHESIS ≠ SOURCED FACT**

> **FRESH SOURCE ≠ RELIABLE SOURCE**

> **RELIABLE SOURCE ≠ CORRECT FOR THIS CLAIM**

> **SOURCE AUTHORITY ≠ TRANSFORMED OUTPUT AUTHORITY**

---

## 2. Exact T4 / T3 binding

Every T5 TeachingEvidenceRecord must bind to:

- an exact T4 knowledge-need ID;
- an exact T4 source-request ID;
- the T3 teaching-step ID inherited by that knowledge need;
- the exact T4 requested source class;
- an epistemic standing admitted by that exact request.

Evidence cannot switch:

- need;
- request;
- source class;
- epistemic standing;
- acquisition adapter;
- authority requirement.

A record that cannot bind to an exact T4 request is not T5 evidence.

---

## 3. Source identity

T5 source identity may represent:

- source ID;
- title;
- authorship key;
- authors;
- institution/publisher;
- publication or revision date;
- revision;
- edition;
- canonical SHA;
- DOI;
- stable locator;
- governed file path;
- governed checksum;
- access date;
- underlying-source identity;
- whether the source can independently be reopened.

Class-specific minimum identity applies.

### Soullab canon / research

Require canonical SHA plus stable locator.

### Governed Library

Require governed file path plus SHA-256 checksum.

### Practitioner material

Require author or institutional identity.

Practitioner material may remain unauditable when it lacks a stable recoverable source identity.

### External academic / scientific

Require:

- author identity;
- publication date;
- DOI or stable locator.

### Historical / traditional

Require stable locator and edition or revision.

### Current web

Require:

- stable locator;
- access date;
- author or institution.

A bare URL is insufficient.

---

## 4. Source form

T5 distinguishes:

~~~
canonical_text
governed_reference
practitioner_authored
primary_study
secondary_scholarship
systematic_review
meta_analysis
consensus_statement
traditional_text
web_reference
~~~

Source form remains constrained by T4 source class.

A source form cannot upgrade epistemic standing.

---

## 5. Citation contract

T5 records:

- citation required;
- citation present;
- stable citation locator;
- pinpoint locator;
- renderable citation representation;
- whether the cited source actually supports the exact claim.

Where T4/T2 requires citation, the evidence record must carry one.

A citation marked present must carry a stable locator and renderable representation.

If a claim is represented as supported but its citation does not support the claim, the record fails.

A topically related source remains neutral when it does not support the exact claim.

---

## 6. Claim-evidence relationship

Every record declares one relationship:

~~~
SUPPORTS
CONTRADICTS
NEUTRAL
INSUFFICIENT_TO_DETERMINE
~~~

This standing is independent from topical relevance.

A citation may not claim support when the evidence relationship is neutral, contradictory, or insufficient.

---

## 7. Expression standing

T5 distinguishes:

~~~
exact_quotation
source_faithful_paraphrase
maia_paraphrase
maia_synthesis
~~~

### Exact quotation

Requires:

- present citation;
- pinpoint locator;
- no semantic transformation such as translation, summarization, paraphrase, or model-assisted transformation.

### Source-faithful paraphrase

Must visibly disclose paraphrase transformation.

### MAIA paraphrase

Must visibly disclose:

- paraphrase;
- model-assisted transformation.

This does not authorize a model call; it describes provenance if such a transformation later exists under separate authority.

### MAIA synthesis

Must remain visible as MAIA synthesis.

MAIA synthesis may not independently serve as source evidence supporting a claim.

---

## 8. Transformation law

T5 represents transformations including:

~~~
extraction
chunking
normalization
translation
summarization
paraphrase
model_assisted_transformation
~~~

Any transformation must remain visible.

Every evidence record fixes:

~~~
sourceAuthorityInheritedByTransformation = false
~~~

Authority of the original source never transfers automatically to transformed output.

---

## 9. Freshness / reliability separation

T5 preserves the exact T4 freshness requirement and records evaluated freshness standing.

A record can be fresh but unreliable.

A record can be reliable in its historical context but stale for a current-fact request.

Freshness satisfaction therefore does not create reliability.

Reliability does not change temporal standing.

---

## 10. Provenance chain

Every record preserves:

~~~
SOURCE
  ↓
ACQUISITION
  ↓
EVIDENCE_RECORD
  ↓
TEACHING_CLAIM
~~~

Where applicable provenance carries:

- acquisition adapter;
- authority requirement;
- authority proof;
- custody proof;
- transformations;
- expression standing;
- peer-review standing;
- reliability standing.

The record does not execute the acquisition adapter.

---

## 11. Auditability

T5 distinguishes:

~~~
auditable
partially_auditable
unauditable
~~~

### Auditable

Requires stable source identity, authority/custody evidence, and independent reopening.

### Partially auditable

Stable identity exists but the complete audit chain is unavailable.

### Unauditable

No independently recoverable source identity is established.

Unauditable evidence cannot silently become eligible for later teaching consideration.

---

## 12. Later teaching consideration

T5 does not authorize teaching.

It may only mark whether an evidence record is eligible for later teaching consideration.

Eligibility requires:

- non-synthesis source evidence;
- SUPPORTS relationship;
- reliability verified for the exact claim;
- sufficient auditability;
- authority proof;
- custody proof;
- required freshness;
- required citation;
- citation actually supporting the claim.

Even when all of those hold:

~~~
eligibleForLaterTeachingConsideration ≠ mayTeach
~~~

T5 always keeps mayTeach = false.

---

## 13. Independent corroboration

Every evidence record preserves:

- authorship identity;
- underlying-source identity.

Independent corroboration requires diversity in both.

Therefore:

- multiple chunks from one paper count as one source;
- mirrors count as one underlying source;
- syndicated copies count as one underlying source;
- summaries of the same underlying study do not become independent support;
- repeated retrieval does not create independence.

---

## 14. Consensus standing

Peer review is not consensus.

A primary study is not consensus.

Multiple ordinary studies are not automatically consensus.

T5 permits consensus-review role only for a consensus-capable source form:

- systematic review;
- meta-analysis;
- consensus statement.

Even then, the source must support the exact claim.

The record distinguishes:

~~~
not_claimed
eligible_source_form
supports_consensus_claim
~~~

This is evidence standing, not permission to teach a consensus claim.

---

## 15. Research disagreement

T5 evidence-set assessment preserves contradictory evidence.

When any admitted evidence contradicts the proposed claim, the set may return:

~~~
CONFLICTING_EVIDENCE
~~~

Contradiction remains individually traceable.

It may not be:

- averaged away;
- converted to agreement;
- hidden by source count;
- collapsed into false consensus.

---

## 16. Evidence-set standing

T5 can deterministically assess one knowledge need across already-built evidence records.

Possible standing:

~~~
CONSISTENT_SUPPORT
CONFLICTING_EVIDENCE
PARTIAL_SUPPORT
INSUFFICIENT_EVIDENCE
CONSENSUS_EVIDENCE_PRESENT
NO_CONSENSUS_EVIDENCE
~~~

The assessment preserves:

- evidence IDs;
- support IDs;
- contradiction IDs;
- neutral IDs;
- insufficient IDs;
- independent-source count;
- independent-authorship count;
- consensus-capable evidence presence;
- conflict standing.

It cannot teach or execute.

---

## 17. Existing-governance compatibility

T5 composes with:

- T2 source/standing law;
- T3 teaching-step identity and provenance layer;
- T4 knowledge-need identity;
- T4 source-request identity;
- T4 freshness requirements;
- T4 evidence-role requirements;
- governed Library path/checksum authority;
- Soullab canon/research revision identity;
- practitioner scope authority;
- external provenance authority.

T5 creates no parallel retrieval or epistemic authority.

---

## 18. No semantic authority transfer

T5 explicitly blocks:

~~~
URL → trustworthy source
citation → claim support
topic relevance → supporting evidence
author name → source authority
peer review → consensus
source authority → transformed-output authority
quotation → interpretation
paraphrase → quotation
multiple chunks → multiple sources
mirrored pages → independent sources
fresh source → reliable source
old source → current fact
research disagreement → consensus
MAIA synthesis → citation/source evidence
retrieval metadata → scholarly provenance
~~~

---

## 19. Runtime / execution boundary

T5 fixes:

~~~
authorityEffect = DESCRIPTIVE_PROVENANCE_RECORD_ONLY
executionStanding = NON_EXECUTING_PROPOSAL

mayRetrieve = false
mayBrowse = false
mayDownloadSource = false
mayCallModel = false
mayTeach = false
mayExecute = false
mayMutatePrompt = false
mayPersistLearnerState = false
~~~

Evidence-set assessment also fixes:

~~~
mayTeach = false
mayExecute = false
~~~

---

## 20. Adversarial falsification

The T5 suite attacks at minimum:

- unknown need/request identity;
- request/need cross-binding;
- source-class substitution;
- standing substitution;
- adapter/authority substitution;
- URL-only provenance;
- fresh-but-unverified reliability;
- stale-current substitution;
- author-name authority;
- auditable / partial / unauditable separation;
- missing required citation;
- citation without stable locator;
- citation-present without claim support;
- topic relevance impersonating support;
- false quotation;
- undisclosed paraphrase;
- undisclosed model-assisted paraphrase;
- MAIA synthesis impersonating source support;
- transformed-output authority inheritance;
- peer review impersonating consensus;
- primary study impersonating consensus review;
- web reference impersonating peer review;
- multiple chunks impersonating independent sources;
- mirrors/syndication impersonating independence;
- multiple ordinary studies impersonating consensus;
- research disagreement collapsing into consensus;
- retrieval metadata impersonating scholarly provenance;
- provider/model/prompt/retrieve/browse/download/execute escape fields.

---

## 21. Stop boundary

This tranche authorizes only:

1. this T5 contract document;
2. pure deterministic implementation;
3. adversarial tests;
4. exact candidate evidence.

It does not authorize:

- T4 execution;
- Library retrieval;
- AIN retrieval;
- web browsing;
- scholarly-provider access;
- live citation retrieval;
- source downloading;
- model/provider calls;
- prompt injection;
- teaching generation;
- learner persistence;
- schema/migrations;
- deployment;
- production mutation;
- T6.

No PR or merge is authorized by inference.

---

## 22. Standing

**T5 CANDIDATE ONLY.**

A future execution boundary may later obtain evidence, but only under separate authority and only if it returns records capable of satisfying T4 + T5 law.
