import type { A23Design } from './model';
export type LawResult = { id: string; pass: boolean; detail: string };

const hasForbidden = (cols: readonly string[]) =>
  cols.some(c => ['current_scope','last_episode','last_section','scroll','caret','selection','transcript','summary','memory'].includes(c));

export function evaluate(d: A23Design): LawResult[] {
  return [
    {id:'L1',pass:!d.parent.singletonUnique && d.parent.pluralityRepresentable,detail:'plurality preserved; no singleton unique'},
    {id:'L2',pass:!d.parent.storesCurrentScope&&!d.parent.columns.includes('current_scope'),detail:'parent stores no current scope'},
    {id:'L3',pass:!d.parent.storesLastEpisode&&!d.parent.storesPlace&&!hasForbidden(d.parent.columns),detail:'parent stores no place surrogate'},
    {id:'L4',pass:d.parent.creationExpressionIdStored&&d.parent.creationExpressionFk==='NONE',detail:'creation declaration provenance is non-FK'},
    {id:'L5',pass:d.parent.sameMemberWorkFk&&d.parent.workDelete==='CASCADE',detail:'same-member Work FK permits Remove Work'},
    {id:'L6',pass:d.parent.sameMemberManuscriptFk&&d.parent.manuscriptDelete==='CASCADE',detail:'same-member manuscript FK permits Delete Work'},
    {id:'L7',pass:d.episode.parentDeleteCascadesEpisode&&!d.episode.parentDeleteCascadesChildObjects,detail:'parent delete reaches A2 episodes only'},
    {id:'L8',pass:d.episode.childRefPolicy==='NO_FK_IMMUTABLE_REF',detail:'child refs are immutable non-FKs'},
    {id:'L9',pass:d.episode.xorClosed&&!d.episode.zeroKindRepresentable&&!d.episode.twoKindsRepresentable,detail:'exactly one child kind'},
    {id:'L10',pass:!d.episode.focusAdmitted&&!d.episode.v1ChildKinds.includes('FOCUS_ACT'),detail:'Focus excluded from v1'},
    {id:'L11',pass:d.episode.requestedExecutedEqual,detail:'requested scope equals executed scope'},
    {id:'L12',pass:d.episode.allowedScopes.every(s=>s==='passage'||s==='section'),detail:'v1 scope vocabulary is bounded to current substrate'},
    {id:'L13',pass:d.episode.editorialSpeakerRolesValidated,detail:'editorial author/MAIA speaker roles validated'},
    {id:'L14',pass:d.episode.reviewReadingLocal,detail:'Review remains readingId + observationKey'},
    {id:'L15',pass:d.episode.reviewCompletionValidated,detail:'Review completion must be durable and exact'},
    {id:'L16',pass:!d.append.focusCrossedReceiptTreatedAsCompletion&&!d.episode.focusAdmitted,detail:'crossed Focus receipt is not response completion'},
    {id:'L17',pass:d.append.lockOrder==='WORK_MANUSCRIPT_DECLARATION_PARENT',detail:'lock order avoids parent-first delete deadlock'},
    {id:'L18',pass:d.append.workKeyShare&&d.append.manuscriptKeyShare&&d.append.declarationKeyShare&&d.append.parentForUpdate,detail:'required row locks are explicit'},
    {id:'L19',pass:d.append.orderAuthority==='RELATIONSHIP_SEQUENCE'&&d.append.nextSequenceInsideParentLock,detail:'parent sequence is only ordering authority'},
    {id:'L20',pass:d.episode.childActUnique,detail:'one completed child act attaches once'},
    {id:'L21',pass:d.append.retryIdempotentByChildIdentity,detail:'retry recovers existing child episode'},
    {id:'L22',pass:d.episode.updatePolicy==='REFUSE_ALL',detail:'episode UPDATE refused'},
    {id:'L23',pass:d.parent.updatePolicy==='REFUSE_ALL',detail:'parent UPDATE refused'},
    {id:'L24',pass:d.append.serverDerivedIdentity&&!d.append.clientMemberWorkTrusted,detail:'ownership is server-derived'},
    {id:'L25',pass:d.append.currentDeclarationReverified&&!d.append.creationDeclarationTreatedAsPermanentPermission,detail:'current declaration is reverified'},
    {id:'L26',pass:!d.migration.declarationRemovalRepointsParent,detail:'declaration removal never repoints parent'},
    {id:'L27',pass:!d.parent.storesContent&&!d.episode.storesChildProse&&!d.migration.childDeletionLeavesCopiedProse,detail:'A2 custody stores no child prose'},
    {id:'L28',pass:d.migration.noBackfill,detail:'historical child acts are not auto-backfilled'},
    {id:'L29',pass:d.migration.rollbackPolicy==='RETAIN_SCHEMA_AFTER_DATA'&&d.migration.rehearsalDropAllowedBeforeData,detail:'rollback distinguishes rehearsal from live custody'},
    {id:'L30',pass:d.parent.sameMemberWorkFk&&d.parent.sameMemberManuscriptFk,detail:'member+Work+manuscript isolation is structural'},
    {id:'L31',pass:d.parent.creationExpressionIdStored,detail:'creation declaration identity retained'},
    {id:'L32',pass:d.parent.contractVersionCheck,detail:'contract version constrained'},
    {id:'L33',pass:d.episode.semanticChecksByKind,detail:'child-specific semantic snapshots constrained'},
    {id:'L34',pass:d.readModelContentFree,detail:'read model does not require child prose'},
    {id:'L35',pass:d.migration.supportingCompositeUniquesFirst&&d.migration.parentBeforeEpisode&&d.migration.checksBeforeActivation&&d.migration.immutabilityTriggersIncluded,detail:'migration ordering explicit'},
    {id:'L36',pass:d.append.exactEditorialActValidated&&d.append.exactReviewActValidated,detail:'completed child acts validated before admission'},
    {id:'L37',pass:d.append.episodeAtomicWithChildCompletion,detail:'episode admission is atomic with child completion'},
  ];
}
