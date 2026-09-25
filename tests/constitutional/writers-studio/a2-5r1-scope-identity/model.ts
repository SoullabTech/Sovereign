export type RelationshipFrame = 'WHOLE_WORK' | 'CHAPTER' | 'PASSAGE' | 'SENTENCE';
export type ChildSubjectKind = 'EDITORIAL_LOCUS' | 'REVIEW_FINDING';
export type EditorialLocusScope = 'section' | 'passage';
export type EditorialScopeSource =
  | 'SERVER_DURABLE_DISCRIMINATOR'
  | 'CLIENT_ASSERTED'
  | 'INFERRED_EXPECTED_TEXT'
  | 'UNMEASURED_HISTORICAL';

export interface ScopeIdentityContract {
  relationshipFrameDistinctFromChildSubject: boolean;
  childSubjectDistinctFromManuscriptScope: boolean;
  relationshipFrameAuthority: 'PRESENTATION_ONLY' | 'COGNITION_AUTHORITY';
  relationshipFrameVocabularyMakesExecutable: boolean;
  heterogeneousSubjectsShareOneRelationship: boolean;

  reviewSubjectKind: ChildSubjectKind;
  reviewAddress: 'READING_ID_OBSERVATION_KEY' | 'OBSERVATION_ID' | 'SECTION_ID';
  reviewManuscriptScope: 'ABSENT' | 'PASSAGE' | 'SECTION';
  reviewEvidenceAuthority: 'CHILD_CUSTODY' | 'A2_PARENT_COPY';
  reviewEvidenceCopiedToParent: boolean;
  reviewReadingScopeAutoMapsToFrame: boolean;
  reviewUnitAutoMapsToChapter: boolean;

  editorialSubjectKind: ChildSubjectKind;
  editorialDiscriminatorLocation: 'PROPOSAL_CHAIN' | 'ASK_THREAD' | 'NONE';
  editorialSectionOpenScope: EditorialLocusScope | 'UNMEASURED';
  editorialPassageOpenScope: EditorialLocusScope | 'UNMEASURED';
  fullBodyPassageScope: EditorialLocusScope | 'UNMEASURED';
  editorialScopeSource: EditorialScopeSource;
  editorialScopeMutable: boolean;
  historicalEditorialStanding: 'UNMEASURED' | 'BACKFILLED';
  historicalHeuristicBackfill: boolean;
  historicalEditorialA2Admittable: boolean;

  a24GenericScopeSurvives: boolean;
  a24ColumnsMeaning: 'UNIVERSAL_SCOPE' | 'MANUSCRIPT_LOCUS_SCOPE';
  reviewScopeNullable: boolean;
  editorialScopeRequired: boolean;
  reviewScopeMustBeNull: boolean;
  successorNoBackfillFailClosed: boolean;
}
