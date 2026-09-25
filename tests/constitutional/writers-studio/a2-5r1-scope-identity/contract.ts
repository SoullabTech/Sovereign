import type { ScopeIdentityContract } from './model';

/**
 * WRITERS-STUDIO-NEXT-01 / A2-5R1 — lawful successor contract.
 *
 * Three layers stay distinct:
 * relationship frame ≠ child subject ≠ manuscript locus scope.
 */
export function referenceContract(): ScopeIdentityContract {
  return {
    relationshipFrameDistinctFromChildSubject:true,
    childSubjectDistinctFromManuscriptScope:true,
    relationshipFrameAuthority:'PRESENTATION_ONLY',
    relationshipFrameVocabularyMakesExecutable:false,
    heterogeneousSubjectsShareOneRelationship:true,

    reviewSubjectKind:'REVIEW_FINDING',
    reviewAddress:'READING_ID_OBSERVATION_KEY',
    reviewManuscriptScope:'ABSENT',
    reviewEvidenceAuthority:'CHILD_CUSTODY',
    reviewEvidenceCopiedToParent:false,
    reviewReadingScopeAutoMapsToFrame:false,
    reviewUnitAutoMapsToChapter:false,

    editorialSubjectKind:'EDITORIAL_LOCUS',
    editorialDiscriminatorLocation:'PROPOSAL_CHAIN',
    editorialSectionOpenScope:'section',
    editorialPassageOpenScope:'passage',
    fullBodyPassageScope:'passage',
    editorialScopeSource:'SERVER_DURABLE_DISCRIMINATOR',
    editorialScopeMutable:false,
    historicalEditorialStanding:'UNMEASURED',
    historicalHeuristicBackfill:false,
    historicalEditorialA2Admittable:false,

    a24GenericScopeSurvives:false,
    a24ColumnsMeaning:'MANUSCRIPT_LOCUS_SCOPE',
    reviewScopeNullable:true,
    editorialScopeRequired:true,
    reviewScopeMustBeNull:true,
    successorNoBackfillFailClosed:true,
  };
}
