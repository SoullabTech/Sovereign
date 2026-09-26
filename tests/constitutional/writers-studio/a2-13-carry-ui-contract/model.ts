export type Scope='passage'|'section';
export type Sort='CHRONOLOGICAL'|'LATEST'|'RELEVANCE';
export type Host='REBUILD'|'REVISION_DESK'|'CANVAS'|'MULTIPLE';

export interface EndpointContract {
  readonly method:'GET'|'POST';
  readonly path:string;
  readonly relationshipIdInPathOnly:boolean;
  readonly receiverThreadIdRequired:boolean;
  readonly mutates:boolean;
  readonly providerCall:boolean;
  readonly expandsRelationshipGet:boolean;
  readonly returnsOmittedSourceReasons:boolean;
  readonly featureGated:boolean;
  readonly verifiedIdentity:boolean;
}

export interface SourceResponseContract {
  readonly relationshipId:boolean;
  readonly receiverThreadId:boolean;
  readonly kindLiteral:boolean;
  readonly episodeSequence:boolean;
  readonly sourceScope:boolean;
  readonly admittedAt:boolean;
  readonly excerpt:boolean;
  readonly excerptTruncated:boolean;
  readonly sourceThreadId:boolean;
  readonly sourceMaiaTurnIndex:boolean;
  readonly fullLongBody:boolean;
  readonly generatedTitle:boolean;
  readonly generatedSummary:boolean;
  readonly relevanceScore:boolean;
}

export interface EligibilityContract {
  readonly provesRelationshipOwner:boolean;
  readonly provesCurrentDeclaration:boolean;
  readonly provesReceiverThread:boolean;
  readonly editorialOnly:boolean;
  readonly excludesSameThread:boolean;
  readonly excludesUnavailable:boolean;
  readonly excludesScopeIneligible:boolean;
  readonly exactSourceBody:boolean;
  readonly exposesForeignExistence:boolean;
}

export interface ExcerptContract {
  readonly maxCodePoints:number;
  readonly exactPrefix:boolean;
  readonly normalizesWhitespace:boolean;
  readonly serverAddsEllipsis:boolean;
  readonly generated:boolean;
}

export interface ClientReadContract {
  readonly strictParsing:boolean;
  readonly cachesAcrossRelationship:boolean;
  readonly cachesAcrossThread:boolean;
  readonly fallbackRelationshipRead:boolean;
  readonly fallbackEpisodeCount:boolean;
  readonly persistentCache:boolean;
}

export interface StateContract {
  readonly host:Host;
  readonly generationGuard:boolean;
  readonly relationshipIdentityGuard:boolean;
  readonly threadIdentityGuard:boolean;
  readonly preselects:boolean;
  readonly maxSelected:number;
  readonly selectionSeparateFromText:boolean;
  readonly persistsLocalStorage:boolean;
  readonly persistsSessionStorage:boolean;
  readonly persistsRelationshipReturn:boolean;
  readonly persistsPlaceReturn:boolean;
  readonly clearsRelationshipChange:boolean;
  readonly clearsThreadChange:boolean;
  readonly clearsPlaceRelease:boolean;
  readonly clearsReload:boolean;
}

export interface SendContract {
  readonly sendsKind:boolean;
  readonly sendsSequence:boolean;
  readonly sendsExcerpt:boolean;
  readonly sendsSourceThread:boolean;
  readonly sendsSourceScope:boolean;
  readonly runtimeReresolves:boolean;
  readonly clearBeforeTransport:boolean;
  readonly preserveOnLocalPostureBlock:boolean;
  readonly restoreOnNetworkFailure:boolean;
  readonly restoreOnServerStaleSource:boolean;
  readonly autoReplaceStale:boolean;
}

export interface PresentationContract {
  readonly actionLabel:string;
  readonly chooserHeading:string;
  readonly selectedLabel:string;
  readonly desktopInline:boolean;
  readonly desktopFullScreen:boolean;
  readonly persistentSideRail:boolean;
  readonly mobileReturnsSameComposer:boolean;
  readonly mobileChangesRoute:boolean;
  readonly oldThreadNavigation:boolean;
  readonly revisionDeskPresentationOnly:boolean;
  readonly canvasParallelImplementation:boolean;
  readonly accessibleButtons:boolean;
  readonly statusAnnouncements:boolean;
}

export interface A213Contract {
  readonly endpoint:EndpointContract;
  readonly response:SourceResponseContract;
  readonly eligibility:EligibilityContract;
  readonly excerpt:ExcerptContract;
  readonly sort:Sort;
  readonly sortHasAuthority:boolean;
  readonly client:ClientReadContract;
  readonly state:StateContract;
  readonly send:SendContract;
  readonly presentation:PresentationContract;
  readonly productImplementation:boolean;
}
