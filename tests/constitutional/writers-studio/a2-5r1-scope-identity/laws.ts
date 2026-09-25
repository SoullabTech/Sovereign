import type { ScopeIdentityContract } from './model';
export type LawResult = { id: string; pass: boolean; detail: string };

export function evaluate(c: ScopeIdentityContract): LawResult[] {
  return [
    {id:'L1',pass:c.relationshipFrameDistinctFromChildSubject,detail:'relationship frame is distinct from child subject'},
    {id:'L2',pass:c.childSubjectDistinctFromManuscriptScope,detail:'child subject is distinct from manuscript locus scope'},
    {id:'L3',pass:c.reviewSubjectKind==='REVIEW_FINDING'&&c.reviewAddress==='READING_ID_OBSERVATION_KEY',detail:'Review subject is exact finding identity'},
    {id:'L4',pass:c.reviewManuscriptScope==='ABSENT',detail:'Review has no fabricated passage/section manuscript scope'},
    {id:'L5',pass:c.reviewEvidenceAuthority==='CHILD_CUSTODY'&&!c.reviewEvidenceCopiedToParent,detail:'Review evidence remains child-authoritative'},
    {id:'L6',pass:!c.reviewReadingScopeAutoMapsToFrame&&!c.reviewUnitAutoMapsToChapter,detail:'reading scope does not auto-map into A2 relationship frame'},
    {id:'L7',pass:c.editorialSubjectKind==='EDITORIAL_LOCUS'&&c.editorialDiscriminatorLocation==='PROPOSAL_CHAIN',detail:'Editorial locus discriminator lives with frozen proposal-chain locus'},
    {id:'L8',pass:c.editorialSectionOpenScope==='section',detail:'new section open mints section discriminator'},
    {id:'L9',pass:c.editorialPassageOpenScope==='passage',detail:'new passage open mints passage discriminator'},
    {id:'L10',pass:c.fullBodyPassageScope==='passage',detail:'full-body selection remains passage'},
    {id:'L11',pass:c.editorialScopeSource==='SERVER_DURABLE_DISCRIMINATOR',detail:'Editorial scope is server-authored, never client/inferred'},
    {id:'L12',pass:!c.editorialScopeMutable,detail:'Editorial scope discriminator is immutable'},
    {id:'L13',pass:c.historicalEditorialStanding==='UNMEASURED'&&!c.historicalHeuristicBackfill,detail:'historical absence remains unmeasured with no heuristic backfill'},
    {id:'L14',pass:!c.historicalEditorialA2Admittable,detail:'historical unmeasured Editorial child is not A2 scope-admittable'},
    {id:'L15',pass:!c.a24GenericScopeSurvives&&c.a24ColumnsMeaning==='MANUSCRIPT_LOCUS_SCOPE',detail:'A2-4 generic scope is succeeded by manuscript-locus scope semantics'},
    {id:'L16',pass:c.reviewScopeNullable&&c.reviewScopeMustBeNull&&c.editorialScopeRequired,detail:'successor episode schema allows Review null scope and requires Editorial scope'},
    {id:'L17',pass:c.relationshipFrameAuthority==='PRESENTATION_ONLY'&&!c.relationshipFrameVocabularyMakesExecutable,detail:'relationship frame grants no cognition/disclosure or executability'},
    {id:'L18',pass:c.heterogeneousSubjectsShareOneRelationship&&c.successorNoBackfillFailClosed,detail:'one relationship may contain heterogeneous child subjects; schema succession is non-backfilling and fail-closed'},
  ];
}
