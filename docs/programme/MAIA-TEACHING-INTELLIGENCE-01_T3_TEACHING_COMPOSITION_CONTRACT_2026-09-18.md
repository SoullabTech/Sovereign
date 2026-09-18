# MAIA-TEACHING-INTELLIGENCE-01 / T3 — Teaching Composition Contract

> **Class:** A — pedagogical composition / epistemic boundary; pure and non-executing only
> **Governing authority:** Founder authorization for T3 Teaching Composition only
> **Depends on:** canonical T0; canonical T1 tac-1; accepted T2 tcs-1 exact head 9711e740e26551b1e73e0bd0fa3613b95749dc97
> **Stop boundary:** no runtime teacher, model call, retrieval, browsing, prompt mutation, persistence, manuscript write, client action, deployment, or production effect

**Date:** 2026-09-18
**Status:** ⚠️ **T3 CANDIDATE — NOT CANONICAL**
**Contract:** tcomp-1

## 1. Why T3 exists

T0 defines what teaching must mean.

T1 defines the pure grammar of one teaching act.

T2 defines the teaching room and the epistemic standing of already-available sources.

T3 defines how a bounded sequence of those acts can become a coherent **teaching composition proposal** without acquiring runtime authority.

T3 is deliberately not a prose generator. It composes and validates the structure of teaching.

## 2. Composition law

A T3 sequence contains between one and eight T1 acts.

Every proposed step is re-expressed through tac-1 and must retain:

- DESCRIPTIVE_PROPOSAL_ONLY authority;
- NON_EXECUTING_PROPOSAL standing;
- mayExecute = false;
- mayPersistLearnerState = false.

REFRAIN is terminal when present.

REPAIR_MISUNDERSTANDING requires current-interaction evidence of confusion or misunderstanding.

## 3. One MAIA, room-specific teaching

T3 fixes the teacher identity as:

    MAIA_SHARED_TEACHER

The room changes teaching context, examples, practice frame, source expectations, and professional boundaries.

It does not create separate personas or independent teachers.

Supported T2 rooms remain:

- general_maia;
- writers_studio;
- coaching_practice;
- therapist_practitioner;
- research_lab.

## 4. Domain grammar

T3 introduces an extensible domain descriptor rather than closing the vocabulary permanently.

The initial governed registry includes:

- writing_rhetoric;
- coaching_practitioner_craft;
- psychology_psychotherapy_models;
- philosophy;
- spirituality_contemplative_traditions;
- consciousness_studies;
- systems_complexity;
- relational_collective_intelligence;
- soullab_canon;
- soullab_research;
- relational_geometry;
- elemental_alchemy;
- spiralogic;
- ain;
- maia_constitutional_architecture.

Each registered T3 domain binds to an existing T2 domain authority class.

Unregistered future domain keys may be proposed when they use a stable slug, a governed family, and a valid T2 domain binding.

Registered domains may not spoof a different T2 authority class.

## 5. Claim and provenance law

Every substantive teaching step names:

- its T1 teaching act;
- its T2 claim class;
- the exact source IDs it depends on;
- its statement layer;
- any current-interaction learner evidence it uses.

Statement layers are:

    none
    source
    maia_paraphrase
    maia_synthesis

A no-claim act carries no sources and uses none.

A substantive claim must carry at least one source.

Comparative synthesis is explicitly labeled maia_synthesis and requires at least two sources.

MAIA synthesis may not silently become a canonical statement or sourced fact.

## 6. T2 is re-applied per teaching claim

T3 does not trust source standing merely because a source entered the composition.

Every substantive step is revalidated through tcs-1.

Therefore:

- Soullab research cannot support a canonical_statement without canonical standing;
- a general web source cannot support an evidence_summary as academic/scientific evidence;
- historical or spiritual material cannot be relabeled scientific;
- comparative teaching retains the distinct standings of participating sources;
- citation obligations remain T2 obligations.

## 7. Learner responsiveness

T3 permits adaptation only from explicit evidence in the present teaching interaction.

Admitted evidence includes:

- explicit question;
- explicit confusion;
- explicit preference;
- explicit experience;
- demonstrated understanding;
- requested depth;
- requested example;
- requested comparison;
- misunderstanding observed in the current interaction.

Every learner evidence record must declare:

    source = current_interaction

T3 creates no durable learner profile, diagnosis, psychometric inference, or hidden learner claim.

The output fixes:

    adaptationStanding = CURRENT_INTERACTION_ONLY
    learnerClaims = []
    mayPersistLearnerState = false

## 8. Practice-oriented teaching and professional boundary

T3 distinguishes practice frame from professional authority.

Admitted practice frames include:

- conceptual education;
- general examples;
- manuscript excerpts;
- coaching scenarios;
- conceptual cases;
- reflective exercises;
- research problems.

T3 may describe an education or consultation composition.

It does not authorize:

- authorship takeover;
- diagnosis;
- treatment direction;
- direction of client action;
- autonomous professional action.

Writer's Studio may teach through manuscript material while mayWriteManuscript remains false.

Coaching may teach through coaching scenarios while mayDirectClientAction remains false.

Therapist/practitioner teaching may use conceptual cases while mayDiagnose and mayDirectTreatment remain false.

## 9. Source insufficiency behavior

T3 classifies source support as:

    sufficient
    partial
    contradictory
    unsupported

It also records one handling mode:

    teach_normally
    qualify_and_teach
    inquire
    source_seeking_required
    refrain

Partial or contradictory support may not silently teach normally.

qualify_and_teach requires ORIENT so the qualification is represented in the sequence.

inquire requires INQUIRE.

source_seeking_required records that additional source work would be needed while retrieval and browsing remain closed.

unsupported material may compose only ORIENT, INQUIRE, or REFRAIN with no substantive teaching claim.

REFRAIN remains the terminal option when adequate support is unavailable.

## 10. Platform teaching targets

Writer's Studio may later structure teaching around an author's own manuscript through sequences such as ORIENT → EXPLAIN → ILLUSTRATE → INQUIRE → CHECK_UNDERSTANDING. T3 itself does not rewrite, save, or mutate the manuscript.

Coaching may later use the same MAIA teacher to explain models, compare approaches, rehearse reflective inquiry, and examine conceptual coaching scenarios. The contract keeps consultation distinct from directing client action.

Therapist / practitioner teaching may later explain or compare psychology, psychotherapy, systems, philosophy, spirituality, consciousness, and related models. Conceptual cases may support education while clinical decisions remain outside T3.

Research teaching may compare Soullab research with external academic or scientific sources while preserving the standing of each source.

## 11. Comparative teaching law

Comparison does not erase source standing.

A scientific paper remains scientific or peer-reviewed evidence.

A historical or spiritual tradition remains historical or traditional material.

A Soullab hypothesis remains a research hypothesis.

A relationship MAIA draws among them remains explicitly MAIA synthesis.

## 12. Falsification targets

T3 is RED if any of the following becomes possible:

1. A Soullab research hypothesis becomes canon through composition.
2. Historical or spiritual material becomes scientific evidence through composition.
3. General web material becomes peer-reviewed or scientific evidence.
4. MAIA synthesis becomes sourced fact or canon.
5. Teaching composition acquires diagnostic or treatment authority.
6. Education becomes direction of client or professional action.
7. Learner responsiveness reads from a durable or hidden profile.
8. Explanation creates execution authority.
9. Writer teaching gains manuscript-write authority.
10. Source seeking silently opens retrieval or browsing.
11. Unsupported sources generate substantive teaching claims.
12. REFRAIN can be bypassed by later teaching acts.
13. A registered domain can spoof another T2 authority class.
14. A room silently creates another MAIA persona.

## 13. Candidate falsification evidence

Targeted T3 suite:

    TeachingCompositionContract.test.ts
    27 / 27 PASS

Integrated teaching-contract suite:

    TeachingActContract.test.ts
    TeachingContextSourceContract.test.ts
    TeachingCompositionContract.test.ts
    63 / 63 PASS

Repository type-health gate:

    program files   4379
    current errors  229
    baseline errors 239
    regressions     0

The type-health gate reports ten errors fixed relative to baseline and no new TypeScript regression.

## 14. Authority surface

T3 output fixes all of the following:

    authorityEffect          DESCRIPTIVE_COMPOSITION_ONLY
    executionStanding        NON_EXECUTING_PROPOSAL
    adaptationStanding       CURRENT_INTERACTION_ONLY

    mayTeach                 false
    mayExecute               false
    mayCallModel             false
    mayRetrieve              false
    mayBrowse                false
    mayMutatePrompt          false
    mayPersistLearnerState   false
    mayWriteManuscript       false
    mayDiagnose              false
    mayDirectTreatment       false
    mayDirectClientAction    false
    mayAutonomouslyAct       false

## 15. Lineage and canonical dependency

T3 was constructed directly on exact T2 candidate:

    9711e740e26551b1e73e0bd0fa3613b95749dc97

T2 PR #1392 was green but unmerged when T3 was constructed.

Therefore T3 is a dependent candidate, not a canonical teaching layer.

No T3 adjudication can make T2 canonical by inference.

T2 requires its own Founder adjudication and merge.

T3 requires separate Founder adjudication after exact-head evidence.

## 16. Stop boundary

Authorized and implemented in T3:

    bounded sequence composition
    T1 act preservation
    per-step T2 claim validation
    room-specific composition context
    extensible teaching-domain grammar
    epistemic standing preservation
    explicit MAIA synthesis labeling
    current-interaction learner evidence
    educational / consultative practice frames
    fail-closed source-insufficiency handling

Still closed:

    runtime teaching
    teaching prose generation
    live model/provider calls
    retrieval
    web browsing
    research-skill invocation
    prompt mutation
    learner-profile persistence
    manuscript writes
    diagnosis
    treatment direction
    client action
    autonomous professional action
    schema / migration
    deployment
    production behavior
    T4

**Next gate:** Founder adjudication of the exact T3 candidate only after exact-head conformance evidence.
