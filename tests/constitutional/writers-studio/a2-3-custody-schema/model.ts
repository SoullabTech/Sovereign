export type DeleteAction = 'CASCADE' | 'RESTRICT' | 'SET_NULL' | 'NONE';
export type UpdatePolicy = 'REFUSE_ALL' | 'MUTABLE';
export type ChildRefPolicy = 'NO_FK_IMMUTABLE_REF' | 'FK_RESTRICT' | 'FK_CASCADE' | 'FK_SET_NULL';
export type LockOrder = 'WORK_MANUSCRIPT_DECLARATION_PARENT' | 'PARENT_FIRST' | 'NONE';
export type OrderAuthority = 'RELATIONSHIP_SEQUENCE' | 'CREATED_AT';
export type RollbackPolicy = 'RETAIN_SCHEMA_AFTER_DATA' | 'DROP_ALWAYS';

export interface ParentSchemaDesign {
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly singletonUnique: boolean;
  readonly sameMemberWorkFk: boolean;
  readonly sameMemberManuscriptFk: boolean;
  readonly workDelete: DeleteAction;
  readonly manuscriptDelete: DeleteAction;
  readonly creationExpressionIdStored: boolean;
  readonly creationExpressionFk: DeleteAction;
  readonly updatePolicy: UpdatePolicy;
  readonly storesCurrentScope: boolean;
  readonly storesLastEpisode: boolean;
  readonly storesPlace: boolean;
  readonly storesContent: boolean;
  readonly contractVersionCheck: boolean;
  readonly pluralityRepresentable: boolean;
}

export interface EpisodeSchemaDesign {
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly v1ChildKinds: readonly string[];
  readonly focusAdmitted: boolean;
  readonly childRefPolicy: ChildRefPolicy;
  readonly xorClosed: boolean;
  readonly zeroKindRepresentable: boolean;
  readonly twoKindsRepresentable: boolean;
  readonly requestedExecutedEqual: boolean;
  readonly allowedScopes: readonly string[];
  readonly editorialSpeakerRolesValidated: boolean;
  readonly reviewReadingLocal: boolean;
  readonly reviewCompletionValidated: boolean;
  readonly childActUnique: boolean;
  readonly sequenceUnique: boolean;
  readonly updatePolicy: UpdatePolicy;
  readonly parentDeleteCascadesEpisode: boolean;
  readonly parentDeleteCascadesChildObjects: boolean;
  readonly storesChildProse: boolean;
  readonly semanticChecksByKind: boolean;
}

export interface AppendTransactionDesign {
  readonly serverDerivedIdentity: boolean;
  readonly lockOrder: LockOrder;
  readonly workKeyShare: boolean;
  readonly manuscriptKeyShare: boolean;
  readonly declarationKeyShare: boolean;
  readonly parentForUpdate: boolean;
  readonly currentDeclarationReverified: boolean;
  readonly creationDeclarationTreatedAsPermanentPermission: boolean;
  readonly exactEditorialActValidated: boolean;
  readonly exactReviewActValidated: boolean;
  readonly focusCrossedReceiptTreatedAsCompletion: boolean;
  readonly nextSequenceInsideParentLock: boolean;
  readonly orderAuthority: OrderAuthority;
  readonly retryIdempotentByChildIdentity: boolean;
  readonly clientMemberWorkTrusted: boolean;
  readonly episodeAtomicWithChildCompletion: boolean;
}

export interface MigrationPlanDesign {
  readonly noBackfill: boolean;
  readonly supportingCompositeUniquesFirst: boolean;
  readonly parentBeforeEpisode: boolean;
  readonly checksBeforeActivation: boolean;
  readonly immutabilityTriggersIncluded: boolean;
  readonly rehearsalDropAllowedBeforeData: boolean;
  readonly rollbackPolicy: RollbackPolicy;
  readonly childDeletionLeavesCopiedProse: boolean;
  readonly declarationRemovalRepointsParent: boolean;
}

export interface A23Design {
  readonly parent: ParentSchemaDesign;
  readonly episode: EpisodeSchemaDesign;
  readonly append: AppendTransactionDesign;
  readonly migration: MigrationPlanDesign;
  readonly readModelContentFree: boolean;
}
