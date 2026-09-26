import type {A213Contract} from './model';
export function referenceContract():A213Contract{return {
 endpoint:{method:'GET',path:'/api/writers-studio/relationships/:relationshipId/carry-sources',relationshipIdInPathOnly:true,receiverThreadIdRequired:true,mutates:false,providerCall:false,expandsRelationshipGet:false,returnsOmittedSourceReasons:false,featureGated:true,verifiedIdentity:true},
 response:{relationshipId:true,receiverThreadId:true,kindLiteral:true,episodeSequence:true,sourceScope:true,admittedAt:true,excerpt:true,excerptTruncated:true,sourceThreadId:false,sourceMaiaTurnIndex:false,fullLongBody:false,generatedTitle:false,generatedSummary:false,relevanceScore:false},
 eligibility:{provesRelationshipOwner:true,provesCurrentDeclaration:true,provesReceiverThread:true,editorialOnly:true,excludesSameThread:true,excludesUnavailable:true,excludesScopeIneligible:true,exactSourceBody:true,exposesForeignExistence:false},
 excerpt:{maxCodePoints:320,exactPrefix:true,normalizesWhitespace:false,serverAddsEllipsis:false,generated:false},sort:'CHRONOLOGICAL',sortHasAuthority:false,
 client:{strictParsing:true,cachesAcrossRelationship:false,cachesAcrossThread:false,fallbackRelationshipRead:false,fallbackEpisodeCount:false,persistentCache:false},
 state:{host:'REBUILD',generationGuard:true,relationshipIdentityGuard:true,threadIdentityGuard:true,preselects:false,maxSelected:1,selectionSeparateFromText:true,persistsLocalStorage:false,persistsSessionStorage:false,persistsRelationshipReturn:false,persistsPlaceReturn:false,clearsRelationshipChange:true,clearsThreadChange:true,clearsPlaceRelease:true,clearsReload:true},
 send:{sendsKind:true,sendsSequence:true,sendsExcerpt:false,sendsSourceThread:false,sendsSourceScope:false,runtimeReresolves:true,clearBeforeTransport:true,preserveOnLocalPostureBlock:true,restoreOnNetworkFailure:false,restoreOnServerStaleSource:false,autoReplaceStale:false},
 presentation:{actionLabel:'Bring an earlier MAIA response',chooserHeading:'Earlier in this relationship',selectedLabel:'Earlier MAIA response',desktopInline:true,desktopFullScreen:false,persistentSideRail:false,mobileReturnsSameComposer:true,mobileChangesRoute:false,oldThreadNavigation:false,revisionDeskPresentationOnly:true,canvasParallelImplementation:false,accessibleButtons:true,statusAnnouncements:true},
 productImplementation:false,
};}
