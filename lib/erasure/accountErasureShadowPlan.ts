import registryJson from '@/config/governance/account-erasure-registry.v2.json';
import {
  type AdapterPlanEntry,
  type CircleShadowFacts,
  type ErasureDisposition,
  type ObservedCount,
  planCircleSharedArtifacts,
  planRegistryLocus,
} from './accountErasureAdapters';

type LineageStanding = 'specific' | 'coarse' | 'none' | 'unknown' | 'not_applicable';

interface RegistryFk {
  declarationKey: string;
  table: string;
  onDelete: 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL';
  disposition: ErasureDisposition;
  authorityReason: string;
}

interface RegistryLocus {
  table: string;
  disposition: ErasureDisposition;
  memberLabel: string;
  bindingRule: string;
  authorityReason: string;
  verificationRule: string;
  adapterKey: string;
  requiresS5: boolean;
}

interface ShadowRegistry {
  version: string;
  coverageOnly: boolean;
  activationProhibited: boolean;
  memberBoundLoci: RegistryLocus[];
  memberForeignKeyDeclarations: RegistryFk[];
}

export interface AccountErasureShadowFacts {
  locusRows: Readonly<Record<string, ObservedCount>>;
  memberFkRows: Readonly<Record<string, ObservedCount>>;
  circles: CircleShadowFacts;
  lineageByLocus: Readonly<Record<string, LineageStanding>>;
}

export interface ShadowFkEffect {
  key: string;
  declarationKey: string;
  table: string;
  rows: ObservedCount;
  onDelete: RegistryFk['onDelete'];
  plannedDisposition: ErasureDisposition;
  blockingReason?: string;
}

export interface ShadowPlanBlocker {
  code:
    | 'missing_locus_fact'
    | 'missing_fk_fact'
    | 'missing_circle_fact'
    | 'unadjudicated_locus'
    | 'unadjudicated_fk'
    | 'lineage_not_specific';
  key: string;
  detail: string;
}

export interface AccountErasureShadowPlan {
  mode: 'shadow_only';
  registryVersion: string;
  evidenceComplete: boolean;
  planComplete: boolean;
  outcome: 'candidate_destructive_plan' | 'governed_refusal' | 'evidence_incomplete';
  activationReady: false;
  activationBlockers: string[];
  entries: AdapterPlanEntry[];
  memberFkEffects: ShadowFkEffect[];
  blockers: ShadowPlanBlocker[];
}

// P1's corrected lineage census. These are the loci for which account erasure
// may not invent a source relationship. P3 split repair of lineage itself into a
// separate lane; P5-B only refuses guessing.
export const SOURCE_DEPENDENT_LINEAGE_LOCI = new Set([
  'case_memory_chunks',
  'conversation_insights',
  'user_session_patterns',
  'consciousness_expansion_events',
  'selflet_nodes',
  'conversation_themes',
  'soul_patterns',
  'pattern_connections',
  'user_relationship_context',
  'episodes',
  'breakthrough_moments',
]);

export const ACCOUNT_ERASURE_SHADOW_REGISTRY = registryJson as unknown as ShadowRegistry;

function lineageBlocker(table: string, fact: LineageStanding | undefined): ShadowPlanBlocker | null {
  if (!SOURCE_DEPENDENT_LINEAGE_LOCI.has(table)) return null;
  if (fact === 'specific') return null;
  return {
    code: 'lineage_not_specific',
    key: `locus:${table}`,
    detail: `source-dependent locus ${table} has lineage=${fact ?? 'unknown'}; P5-B refuses to guess a source-dependent deletion`,
  };
}

export function buildAccountErasureShadowPlan(
  facts: AccountErasureShadowFacts,
  registry: ShadowRegistry = ACCOUNT_ERASURE_SHADOW_REGISTRY,
): AccountErasureShadowPlan {
  const entries: AdapterPlanEntry[] = [];
  const memberFkEffects: ShadowFkEffect[] = [];
  const blockers: ShadowPlanBlocker[] = [];

  // Domain expansion is explicit: shared_artifacts is part of the Circles
  // authority lifecycle even though shared_by is outside P5-A's direct identity
  // column catalogue.
  const shared = planCircleSharedArtifacts(facts.circles);
  entries.push(shared);
  if (shared.refusalReason === 'missing_circle_fact') {
    blockers.push({
      code: 'missing_circle_fact',
      key: shared.key,
      detail: 'active Circle share state was not observed',
    });
  }

  for (const locus of registry.memberBoundLoci) {
    const observed = facts.locusRows[locus.table] ?? 'unknown';
    const lineage = lineageBlocker(locus.table, facts.lineageByLocus[locus.table]);
    if (observed !== 'unknown' && observed > 0 && lineage) {
      blockers.push(lineage);
      entries.push({
        key: `locus:${locus.table}`,
        source: 'registry',
        locusKey: locus.table,
        rows: observed,
        memberLabel: locus.memberLabel,
        plannedDisposition: 'refuse',
        adapterKey: 'lineage_guard',
        phase: 'pre_identity',
        verificationRule: 'specific_source_lineage_required',
        requiresS5: false,
        dependsOn: [],
        refusalReason: 'lineage_not_specific',
      });
      continue;
    }

    const entry = planRegistryLocus(locus, observed, facts.circles);
    entries.push(entry);
    if (entry.refusalReason === 'missing_locus_fact') {
      blockers.push({ code: 'missing_locus_fact', key: entry.key, detail: `no row-count fact for ${locus.table}` });
    } else if (entry.refusalReason === 'missing_circle_fact') {
      blockers.push({ code: 'missing_circle_fact', key: entry.key, detail: `live Circles fact missing for ${locus.table}` });
    } else if (entry.refusalReason === 'unadjudicated_locus') {
      blockers.push({ code: 'unadjudicated_locus', key: entry.key, detail: `${locus.table} remains refuse-by-default in ${registry.version}` });
    }
  }

  for (const fk of registry.memberForeignKeyDeclarations) {
    const rows = facts.memberFkRows[fk.declarationKey] ?? 'unknown';
    const effect: ShadowFkEffect = {
      key: `fk:${fk.declarationKey}`,
      declarationKey: fk.declarationKey,
      table: fk.table,
      rows,
      onDelete: fk.onDelete,
      plannedDisposition: rows === 0 ? 'no_op' : fk.disposition,
    };
    if (rows === 'unknown') {
      effect.plannedDisposition = 'refuse';
      effect.blockingReason = 'missing_fk_fact';
      blockers.push({ code: 'missing_fk_fact', key: effect.key, detail: `FK occupancy unknown for ${fk.declarationKey}` });
    } else if (rows > 0 && fk.disposition === 'refuse') {
      effect.blockingReason = 'unadjudicated_fk';
      blockers.push({ code: 'unadjudicated_fk', key: effect.key, detail: `occupied member FK remains refuse-by-default: ${fk.declarationKey}` });
    }
    memberFkEffects.push(effect);
  }

  // The member row is the identity-ending act. It is synthetic because `members`
  // is the subject table, not one of F5-C's member-bound identity-column loci.
  const preIdentityKeys = entries
    .filter((e) => e.phase === 'pre_identity' && e.plannedDisposition !== 'no_op' && e.plannedDisposition !== 'refuse')
    .map((e) => e.key);
  entries.push({
    key: 'synthetic:members-row',
    source: 'synthetic',
    locusKey: 'members.id',
    rows: 1,
    memberLabel: 'account identity',
    plannedDisposition: 'erase',
    adapterKey: 'account_identity_terminal',
    phase: 'identity_end',
    verificationRule: 'member_row_absent_after_all_pre_identity_effects',
    requiresS5: true,
    dependsOn: preIdentityKeys,
  });

  const evidenceComplete = !blockers.some((b) =>
    b.code === 'missing_locus_fact' || b.code === 'missing_fk_fact' || b.code === 'missing_circle_fact',
  );
  const refusal = blockers.some((b) =>
    b.code === 'unadjudicated_locus' || b.code === 'unadjudicated_fk' || b.code === 'lineage_not_specific',
  );
  const outcome = !evidenceComplete
    ? 'evidence_incomplete'
    : refusal
      ? 'governed_refusal'
      : 'candidate_destructive_plan';

  const activationBlockers = ['P5-B is shadow-only; registry activationProhibited=true'];
  if (entries.some((entry) => entry.requiresS5 && entry.plannedDisposition !== 'no_op' && entry.plannedDisposition !== 'refuse')) {
    activationBlockers.push('S5 anti-resurrection integration remains a P5-D obligation');
  }

  return {
    mode: 'shadow_only',
    registryVersion: registry.version,
    evidenceComplete,
    planComplete: evidenceComplete,
    outcome,
    activationReady: false,
    activationBlockers,
    entries,
    memberFkEffects,
    blockers,
  };
}
