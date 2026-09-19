# MAIA-TEACHING-INTELLIGENCE-01 / T6 — Learner Dialogue & Adaptation Contract

**Date:** 2026-09-19
**Contract:** lda-1
**Status:** CANDIDATE · PURE DETERMINISTIC CONTRACT · NON-EXECUTING
**Opened from exact canonical:** bb578146086e7b24f2ccb5215a1ecbe2d807c569
**Upstream teaching law:** T0 + T1 + T2 + T3 + T4 + T5 canonical
**Runtime teaching:** NOT AUTHORIZED
**Learner persistence/profile authority:** NOT AUTHORIZED
**T7/T8:** CLOSED

---

## 0. Purpose

T6 defines how MAIA may describe a lawful adaptation to evidence from the
current teaching interaction without turning interaction evidence into a
durable claim about the learner.

Governing principle:

> **ADAPT TO THE INTERACTION, NOT TO AN INVENTED PERSON.**

T6 proposes dialogue adaptation only. It does not generate teaching prose,
retrieve, browse, call models/providers, mutate prompts, persist learner
state, profile/score/rank a learner, diagnose, deploy, or mutate production.
---

## 1. Interaction scope

Every T6 record binds to:

- exact current interaction ID;
- exact learner signal ID;
- exact current-interaction turn/locator;
- exact T3 teaching step when applicable;
- exact canonical T1 act inherited from that step;
- exact T4 knowledge need + T5 evidence-set standing when supplied.

All signal evidence must carry:

CURRENT_INTERACTION_ONLY

T6 rejects any non-current-interaction evidence source.

No signal may silently become durable learner knowledge.

---

## 2. Closed learner-signal grammar

The initial signal grammar is:
- EXPLICIT_QUESTION
- CLARIFICATION_REQUEST
- EXAMPLE_REQUEST
- CONTRAST_REQUEST
- SIMPLIFICATION_REQUEST
- DEPTH_REQUEST
- CONFUSION_EXPRESSED
- PARTIAL_UNDERSTANDING_EXPRESSED
- UNDERSTANDING_EXPRESSED
- RESTATEMENT_ATTEMPT
- CHALLENGE_OR_DISAGREEMENT
- SOURCE_OR_EVIDENCE_CHALLENGE
- PRACTICE_REQUEST
- PRACTICE_DECLINE
- TEACHER_CORRECTION
- STOP_OR_TOPIC_CHANGE

Each signal is evidence about the active interaction only.

---

## 3. Understanding standing

T6 may describe:
- UNKNOWN
- CONFUSION_EXPRESSED
- PARTIAL_UNDERSTANDING_EXPRESSED
- UNDERSTANDING_EXPRESSED
- MISUNDERSTANDING_CANDIDATE
- CONTESTED_OR_CHALLENGED

These are present-dialogue standings only.

> **UNDERSTANDING EXPRESSED ≠ MASTERY.**

> **CONFUSION ≠ INABILITY.**

> **ONE SUCCESSFUL RESPONSE ≠ DURABLE COMPETENCE.**

---

## 4. No covert learner model

T6 produces:

- learnerClaims = []
- stableTraitInferences = []
- durableLearnerProfile = null

T6 cannot infer or persist stable intelligence, aptitude, competence,
expertise, personality, diagnosis, motivation, compliance, pathology,
trauma history, learning disability/style, stable educational level,
stable preferences, readiness, susceptibility, or persuasion profile.

Preserve:

> **OBSERVED RESPONSE ≠ STABLE TRAIT.**

> **CURRENT DIFFICULTY ≠ LOW ABILITY.**

> **REQUEST FOR SIMPLICITY ≠ LOW INTELLIGENCE.**

> **REQUEST FOR DEPTH ≠ EXPERTISE.**

> **SELF-REPORT ≠ VERIFIED COMPETENCE.**

> **FORMAT REQUEST ≠ LEARNING STYLE.**

---

## 5. Adaptation dimensions

T6 may propose bounded changes in:

- depth: simplify / maintain / deepen;
- granularity: orient-first / step-by-step / integrated / concise;
- representation: explanation / example / illustration / contrast /
  analogy / conceptual map / reflective question / practice;
- dialogue movement: answer / clarify / inquire / check understanding /
  repair misunderstanding / invite restatement / offer another framing /
  preserve disagreement / refrain.

These remain proposals, never generated teaching.

---

## 6. T1 composition

T6 proposes next acts only from the canonical T1 grammar:

ORIENT · EXPLAIN · ILLUSTRATE · CONTRAST · INQUIRE ·
INVITE_EXPERIENCE · OFFER_PRACTICE · CHECK_UNDERSTANDING ·
REPAIR_MISUNDERSTANDING · REFRAIN

T6 does not invent parallel teaching acts and cannot execute an act.

---

## 7. Dialogue adaptation law

Deterministic mapping includes:

- clarification → explain / inquire;
- example request → illustrate;
- contrast request → contrast;
- simplicity request → simplify without ability inference;
- depth request → deepen without expertise inference;
- confusion → inquire / illustrate / check understanding;
- partial understanding → check understanding / invite restatement;
- understanding expressed → check without mastery inference;
- practice request → OFFER_PRACTICE proposal;
- practice decline → REFRAIN and block practice pressure;
- stop/topic change → REFRAIN.

---

## 8. Misunderstanding repair boundary

> **DISAGREEMENT ≠ MISUNDERSTANDING.**

REPAIR_MISUNDERSTANDING is available only for a RESTATEMENT_ATTEMPT
carrying a traceable mismatch against a specific proposition, source,
model, definition, or relationship.

A restatement attempt without a specific mismatch blocks repair.

Challenge, disagreement, source/evidence challenge, and teacher correction
also block automatic repair.

One mismatch cannot create a generalized learner-ability claim.

---

## 9. Learner challenge and correction

Learners may question, challenge evidence, disagree, offer competing
interpretations, correct MAIA, decline practice, or stop the exchange.
Preserve:

> **CHALLENGE ≠ RESISTANCE.**

> **CORRECTING THE TEACHER ≠ FAILURE TO UNDERSTAND.**

Teacher correction does not create a learner-failure standing.

---

## 10. T4/T5 epistemic constraint

When T6 receives epistemic standing, it requires both:

- a canonical kro-1 KnowledgeAcquisitionPlan;
- a canonical rcp-1 EvidenceSetAssessment.

The T5 knowledgeNeedId must exist in the supplied T4 plan and must bind
to the same exact teaching step as the learner signal.

T6 preserves, but never upgrades:

- CONFLICTING_EVIDENCE;
- PARTIAL_SUPPORT;
- INSUFFICIENT_EVIDENCE;
- NO_CONSENSUS_EVIDENCE.

Those states block automatic misunderstanding repair where epistemic
uncertainty must remain visible.

> **PEDAGOGICAL CONFIDENCE ≠ EPISTEMIC CERTAINTY.**
> **REPETITION ≠ EVIDENCE.**

> **TEACHING CLARITY ≠ CLAIM TRUTH.**

Research disagreement may be contrasted, qualified, explored, or left
unresolved. T6 may not repair the learner toward one side merely because
MAIA presented it first.

---

## 11. Agency and non-coercion

Preserve:

> **ADAPTATION ≠ PERSUASION.**

> **ENGAGEMENT ≠ CONSENT.**

> **PARTICIPATION ≠ AGREEMENT.**

An explicit practice decline blocks OFFER_PRACTICE in the T6 proposal.
A stop/topic-change signal blocks every T1 act except REFRAIN.

T6 contains no compliance, persuasion, engagement-maximization, or
emotional-exploitation mechanism.

---

## 12. Teaching versus treatment

> **TEACHING REPAIR ≠ TREATMENT.**
T6 may adapt education or consultation. It cannot diagnose the learner or
a client, direct treatment, direct client action, or autonomously perform
professional action.

A lawful REPAIR_MISUNDERSTANDING proposal still fixes:

- mayDiagnose = false
- mayDirectTreatment = false
- mayDirectClientAction = false
- mayAutonomouslyAct = false

---

## 13. Ephemeral adaptation record

LearnerDialogueAdaptationRecord carries:

- contract version;
- interaction/signal/evidence identity;
- T3 step + inherited T1 act where applicable;
- current understanding standing;
- proposed adaptation dimensions;
- proposed T1 next acts;
- blocked acts and reasons;
- optional preserved T4/T5 epistemic constraint;
- empty learner claims and stable-trait inferences;
- explicit authority flags.

Fix:

adaptationStanding = CURRENT_INTERACTION_ONLY
---

## 14. No hidden persistence

T6 cannot:

- write learner/member memory;
- write profile rows;
- update durable preferences;
- create learner embeddings;
- create learner scores/rankings;
- create mastery models;
- create psychological profiles;
- create cross-session teaching profiles.

Any future durable pedagogical memory requires separate Founder authority
and transparent member control.

---

## 15. No semantic authority transfer

The contract blocks:

- confusion → inability;
- simplification request → low intelligence;
- depth request → expertise;
- disagreement → misunderstanding;
- challenge → resistance;
- successful response → mastery;
- current preference → learning style;
- current interaction → durable learner trait;
- learner correction → teacher authority override;
- pedagogical confidence → epistemic certainty;
- repetition → evidence;
- engagement → agreement;
- teaching repair → treatment authority.

---

## 16. Authority boundary

T6 fixes:

- authorityEffect = DESCRIPTIVE_DIALOGUE_ADAPTATION_ONLY
- executionStanding = NON_EXECUTING_PROPOSAL
- adaptationStanding = CURRENT_INTERACTION_ONLY
- mayTeach = false
- mayExecute = false
- mayCallModel = false
- mayRetrieve = false
- mayBrowse = false
- mayMutatePrompt = false
- mayPersistLearnerState = false
- mayReadDurableLearnerProfile = false
- mayWriteLearnerProfile = false
- mayInferStableTraits = false
- mayScoreLearner = false
- mayRankLearner = false
- mayDiagnose = false
- mayDirectTreatment = false
- mayDirectClientAction = false
- mayAutonomouslyAct = false

No T6 record may declare itself a durable learner profile.

---

## 17. Falsification standing

The adversarial suite attacks:

- non-current-interaction evidence;
- durable profile standing;
- pre-existing learner claims;
- intelligence/expertise/learning-style/mastery fields;
- persistence/memory/embedding/scoring/ranking fields;
- model/provider/prompt/retrieval/browse/execute fields;
- diagnosis/treatment/client/professional-action fields;
- disagreement falsely labeled misunderstanding;
- evidence challenge falsely labeled resistance;
- restatement repair without a specific mismatch;
- learner correction falsely treated as learner failure;
- practice pressure after refusal;
- T4/T5 binding mismatch;
- T5 conflict/insufficiency erasure.

Positive tests cover clarification, examples, contrast, simplification,
deepening, confusion, partial understanding, understanding checks,
restatement repair, disagreement, evidence challenge, correction,
practice request/decline, and stopping/changing topic.

---

## 18. Existing-governance compatibility

T6 composes with T0–T5.

T6 may adapt **how** something could be taught.

It may not independently change **what is epistemically warranted**.

No parallel teaching or learner authority is created.
---

## 19. Stop boundary

This tranche authorizes only:

1. this T6 programme contract;
2. pure deterministic implementation;
3. adversarial tests;
4. exact candidate evidence.

It does not authorize:

- runtime teaching;
- model/provider calls;
- prompt mutation;
- source retrieval or browsing;
- T4 execution;
- learner memory or profiling;
- mastery tracking;
- schema/migrations;
- deployment;
- production mutation;
- T7 platform bindings;
- T8 runtime teaching authority.

No PR or merge is authorized by inference.

**T6 CANDIDATE ONLY.**
