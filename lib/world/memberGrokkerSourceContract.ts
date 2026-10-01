export type MemberGrokkerSourceKind =
  | 'house_navigation'
  | 'shared_library'
  | 'living_work'
  | 'journal'
  | 'reflection'
  | 'relationship'
  | 'dream'
  | 'astrology'
  | 'developmental_memory';

export type SourceSensitivity = 'shared' | 'personal' | 'intimate' | 'symbolic';

export interface MemberSourcePolicy {
  kind: MemberGrokkerSourceKind;
  memberOwned: boolean;
  eligibleInR3: boolean;
  sensitivity: SourceSensitivity;
  requiresPerRequestSelection: boolean;
  requiresHeightenedConsent: boolean;
  mayCrossCommunity: false;
  mayCrossConsulting: false;
  activeInfluence: 'request_only' | 'none';
}

export const MEMBER_SOURCE_POLICIES: Record<MemberGrokkerSourceKind, MemberSourcePolicy> = {
  house_navigation: { kind:'house_navigation', memberOwned:false, eligibleInR3:true, sensitivity:'shared', requiresPerRequestSelection:false, requiresHeightenedConsent:false, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'none' },
  shared_library: { kind:'shared_library', memberOwned:false, eligibleInR3:true, sensitivity:'shared', requiresPerRequestSelection:false, requiresHeightenedConsent:false, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'none' },  living_work: { kind:'living_work', memberOwned:true, eligibleInR3:true, sensitivity:'personal', requiresPerRequestSelection:true, requiresHeightenedConsent:false, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  journal: { kind:'journal', memberOwned:true, eligibleInR3:true, sensitivity:'personal', requiresPerRequestSelection:true, requiresHeightenedConsent:false, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  reflection: { kind:'reflection', memberOwned:true, eligibleInR3:true, sensitivity:'personal', requiresPerRequestSelection:true, requiresHeightenedConsent:false, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  relationship: { kind:'relationship', memberOwned:true, eligibleInR3:true, sensitivity:'intimate', requiresPerRequestSelection:true, requiresHeightenedConsent:true, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  dream: { kind:'dream', memberOwned:true, eligibleInR3:true, sensitivity:'intimate', requiresPerRequestSelection:true, requiresHeightenedConsent:true, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  astrology: { kind:'astrology', memberOwned:true, eligibleInR3:true, sensitivity:'symbolic', requiresPerRequestSelection:true, requiresHeightenedConsent:true, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
  developmental_memory: { kind:'developmental_memory', memberOwned:true, eligibleInR3:false, sensitivity:'intimate', requiresPerRequestSelection:true, requiresHeightenedConsent:true, mayCrossCommunity:false, mayCrossConsulting:false, activeInfluence:'request_only' },
};

export interface MemberGrokkerSourceSelection {
  kind: MemberGrokkerSourceKind;
  ref?: string;
  selectedByMember?: boolean;
  heightenedConsent?: boolean;
}

export interface MemberGrokkerRequest {
  query: string;
  mode: 'trace' | 'synthesize';
  target?: 'member_world' | 'community' | 'consulting';
  sources: MemberGrokkerSourceSelection[];
}
export interface MemberGrokkerValidation {
  ok: boolean;
  blockers: string[];
  releaseRequired: boolean;
  laws: string[];
}

export function validateMemberGrokkerRequest(request: MemberGrokkerRequest): MemberGrokkerValidation {
  const blockers: string[] = [];
  const target = request.target ?? 'member_world';
  if (!request.query.trim()) blockers.push('QUERY_REQUIRED');
  if (request.mode === 'synthesize') blockers.push('R3_SYNTHESIS_CLOSED');
  if (target !== 'member_world') blockers.push('R3_CROSS_CONTEXT_CLOSED');

  const seen = new Set<MemberGrokkerSourceKind>();
  for (const source of request.sources) {
    if (seen.has(source.kind)) blockers.push(`DUPLICATE_SOURCE:${source.kind}`);
    seen.add(source.kind);
    const policy = MEMBER_SOURCE_POLICIES[source.kind];
    if (!policy.eligibleInR3) {
      blockers.push(`SOURCE_NOT_ELIGIBLE:${source.kind}`);
      continue;
    }
    if (policy.requiresPerRequestSelection && source.selectedByMember !== true) {
      blockers.push(`EXPLICIT_SELECTION_REQUIRED:${source.kind}`);
    }
    if (policy.requiresHeightenedConsent && source.heightenedConsent !== true) {
      blockers.push(`HEIGHTENED_CONSENT_REQUIRED:${source.kind}`);
    }
  }

  const releaseRequired = request.sources.some(source =>
    MEMBER_SOURCE_POLICIES[source.kind].activeInfluence === 'request_only'
  );
  return {
    ok: blockers.length === 0,
    blockers,
    releaseRequired,
    laws: [
      'SOURCE_STANDING_MUST_SURVIVE',
      'MEMORY_DOES_NOT_CREATE_PERMISSION',
      'PRIVATE_CONTEXT_IS_REQUEST_SCOPED',
      'RELEASE_AFTER_REQUEST',
      'NO_CROSS_CONTEXT_WITHOUT_SEPARATE_GRANT',
    ],
  };
}
