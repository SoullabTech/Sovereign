export type ErasureDisposition = 'erase' | 'revoke' | 'tombstone' | 'retain' | 'refuse' | 'no_op';
export type PlanPhase = 'pre_identity' | 'identity_end' | 'post_identity';
export type ObservedCount = number | 'unknown';

export interface ShadowRegistryLocus {
  table: string;
  disposition: ErasureDisposition;
  memberLabel: string;
  bindingRule: string;
  authorityReason: string;
  verificationRule: string;
  adapterKey: string;
  requiresS5: boolean;
}

export interface CircleShadowFacts {
  activeMemberships: ObservedCount;
  activeSharedArtifacts: ObservedCount;
  liveInquiryResponses: ObservedCount;
}

export interface AdapterPlanEntry {
  key: string;
  source: 'registry' | 'domain_expansion' | 'synthetic';
  locusKey: string;
  rows: ObservedCount;
  memberLabel: string;
  plannedDisposition: ErasureDisposition;
  adapterKey: string;
  phase: PlanPhase;
  verificationRule: string;
  requiresS5: boolean;
  dependsOn: string[];
  refusalReason?: string;
}

function noOp(locus: ShadowRegistryLocus, rows: number): AdapterPlanEntry {
  return {
    key: `locus:${locus.table}`,
    source: 'registry',
    locusKey: locus.table,
    rows,
    memberLabel: locus.memberLabel,
    plannedDisposition: 'no_op',
    adapterKey: 'absence',
    phase: 'pre_identity',
    verificationRule: 'observed_zero_rows',
    requiresS5: false,
    dependsOn: [],
  };
}

export function planRegistryLocus(
  locus: ShadowRegistryLocus,
  observedRows: ObservedCount,
  circles: CircleShadowFacts,
): AdapterPlanEntry {
  if (observedRows === 'unknown') {
    return {
      key: `locus:${locus.table}`,
      source: 'registry',
      locusKey: locus.table,
      rows: 'unknown',
      memberLabel: locus.memberLabel,
      plannedDisposition: 'refuse',
      adapterKey: 'evidence_missing',
      phase: 'pre_identity',
      verificationRule: 'fact_required_before_plan_can_complete',
      requiresS5: false,
      dependsOn: [],
      refusalReason: 'missing_locus_fact',
    };
  }

  if (observedRows === 0) return noOp(locus, observedRows);

  if (locus.adapterKey === 'ledger_retention') {
    return {
      key: `locus:${locus.table}`,
      source: 'registry',
      locusKey: locus.table,
      rows: observedRows,
      memberLabel: locus.memberLabel,
      plannedDisposition: 'retain',
      adapterKey: locus.adapterKey,
      phase: 'post_identity',
      verificationRule: locus.verificationRule,
      requiresS5: false,
      dependsOn: [],
    };
  }

  if (locus.adapterKey === 'account_session') {
    return {
      key: `locus:${locus.table}`,
      source: 'registry',
      locusKey: locus.table,
      rows: observedRows,
      memberLabel: locus.memberLabel,
      plannedDisposition: locus.disposition,
      adapterKey: locus.adapterKey,
      phase: 'pre_identity',
      verificationRule: locus.verificationRule,
      requiresS5: locus.requiresS5,
      dependsOn: [],
    };
  }

  if (locus.adapterKey === 'circles_lifecycle') {
    let rows: ObservedCount = observedRows;
    const dependsOn: string[] = [];
    if (locus.table === 'circle_memberships') {
      rows = circles.activeMemberships;
      dependsOn.push('domain:circles:shared_artifacts', 'locus:circle_inquiry_responses');
    } else if (locus.table === 'circle_inquiry_responses') {
      rows = circles.liveInquiryResponses;
    }

    if (rows === 'unknown') {
      return {
        key: `locus:${locus.table}`,
        source: 'registry',
        locusKey: locus.table,
        rows: 'unknown',
        memberLabel: locus.memberLabel,
        plannedDisposition: 'refuse',
        adapterKey: 'evidence_missing',
        phase: 'pre_identity',
        verificationRule: 'circle_live_state_required',
        requiresS5: locus.requiresS5,
        dependsOn,
        refusalReason: 'missing_circle_fact',
      };
    }
    if (rows === 0) return noOp(locus, 0);

    return {
      key: `locus:${locus.table}`,
      source: 'registry',
      locusKey: locus.table,
      rows,
      memberLabel: locus.memberLabel,
      plannedDisposition: locus.disposition,
      adapterKey: locus.adapterKey,
      phase: 'pre_identity',
      verificationRule: locus.verificationRule,
      requiresS5: locus.requiresS5,
      dependsOn,
    };
  }

  return {
    key: `locus:${locus.table}`,
    source: 'registry',
    locusKey: locus.table,
    rows: observedRows,
    memberLabel: locus.memberLabel,
    plannedDisposition: 'refuse',
    adapterKey: locus.adapterKey || 'none',
    phase: 'pre_identity',
    verificationRule: locus.verificationRule,
    requiresS5: false,
    dependsOn: [],
    refusalReason: 'unadjudicated_locus',
  };
}

export function planCircleSharedArtifacts(circles: CircleShadowFacts): AdapterPlanEntry {
  const rows = circles.activeSharedArtifacts;
  if (rows === 'unknown') {
    return {
      key: 'domain:circles:shared_artifacts',
      source: 'domain_expansion',
      locusKey: 'shared_artifacts.shared_by',
      rows: 'unknown',
      memberLabel: 'Circle shared artifacts',
      plannedDisposition: 'refuse',
      adapterKey: 'evidence_missing',
      phase: 'pre_identity',
      verificationRule: 'circle_live_share_state_required',
      requiresS5: false,
      dependsOn: [],
      refusalReason: 'missing_circle_fact',
    };
  }
  if (rows === 0) {
    return {
      key: 'domain:circles:shared_artifacts',
      source: 'domain_expansion',
      locusKey: 'shared_artifacts.shared_by',
      rows,
      memberLabel: 'Circle shared artifacts',
      plannedDisposition: 'no_op',
      adapterKey: 'circles_lifecycle',
      phase: 'pre_identity',
      verificationRule: 'observed_zero_active_shares',
      requiresS5: false,
      dependsOn: [],
    };
  }
  return {
    key: 'domain:circles:shared_artifacts',
    source: 'domain_expansion',
    locusKey: 'shared_artifacts.shared_by',
    rows,
    memberLabel: 'Circle shared artifacts',
    plannedDisposition: 'revoke',
    adapterKey: 'circles_lifecycle',
    phase: 'pre_identity',
    verificationRule: 'no_active_member_shares',
    requiresS5: false,
    dependsOn: [],
  };
}
