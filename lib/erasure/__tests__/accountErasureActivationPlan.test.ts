import {
  ACCOUNT_ERASURE_RUNTIME_AUTHORITY,
  groupedRuntimeForeignKeys,
} from '../accountErasureRuntimeAuthority';
import {
  SOURCE_DEPENDENT_LINEAGE_LOCI,
  type AccountErasureShadowFacts,
} from '../accountErasureShadowPlan';
import type { CollectedAccountErasureFacts, RuntimeFkEffectFact } from '../accountErasureFacts';
import { buildAccountErasureActivationPlan } from '../accountErasureActivationPlan';

type Count = number | 'unknown';

function facts(): CollectedAccountErasureFacts {
  const locusRows: Record<string, Count> = {};
  for (const locus of ACCOUNT_ERASURE_RUNTIME_AUTHORITY.memberBoundLoci) locusRows[locus.table] = 0;
  locusRows.account_erasure_acts = 1;
  const fkEffects: RuntimeFkEffectFact[] = [];
  for (const [key, constraints] of groupedRuntimeForeignKeys()) {
    fkEffects.push({
      key,
      table: constraints[0].table,
      onDelete: constraints[0].onDelete,
      declarationKeys: [...new Set(constraints.flatMap((x) => x.sourceDeclarationKeys))].sort(),
      constraintNames: constraints.map((x) => x.constraintName),
      localColumns: [...new Set(constraints.flatMap((x) => x.localColumns))].sort(),
      rows: 0,
      disposition: constraints[0].disposition,
      authorityReason: constraints[0].authorityReason,
    });
  }
  const shadowFacts: AccountErasureShadowFacts = {
    locusRows,
    memberFkRows: {},
    circles: { activeMemberships: 0, activeSharedArtifacts: 0, liveInquiryResponses: 0 },
    lineageByLocus: Object.fromEntries([...SOURCE_DEPENDENT_LINEAGE_LOCI].map((table) => [table, 'unknown'])),
  };
  return { shadowFacts, fkEffects, activeCircleIds: [], runtimeSchemaProblems: [] };
}

function fkEffect(f: CollectedAccountErasureFacts, table: string) {
  const x = f.fkEffects.find((e) => e.table === table);
  if (!x) throw new Error(`missing FK effect ${table}`);
  return x;
}

describe('F5 P5-D/R3 activation plan', () => {
  it('freezes current direct/domain/synthetic entries plus 294 runtime FK effect classes', () => {
    const plan = buildAccountErasureActivationPlan(facts());
    expect(plan.outcome).toBe('candidate_destructive_plan');
    expect(plan.activationReady).toBe(true);
    expect(plan.dispositions).toHaveLength(320 + 294);
    expect(plan.registryVersion).toBe('account-erasure-runtime-authority-v1-r3');
  });

  it('keeps an occupied unadjudicated locus as a governed refusal', () => {
    const f = facts();
    (f.shadowFacts.locusRows as Record<string, Count>).quick_journal_entries = 1;
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('governed_refusal');
    expect(plan.activationReady).toBe(false);
    expect(plan.blockedLabels).toContain('stored account data');
  });

  it('turns missing direct evidence into unavailable, never a destructive candidate', () => {
    const f = facts();
    (f.shadowFacts.locusRows as Record<string, Count>).quick_journal_entries = 'unknown';
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('evidence_incomplete');
    expect(plan.activationReady).toBe(false);
  });

  it('turns runtime schema drift into unavailable before execution', () => {
    const f = facts();
    f.runtimeSchemaProblems.push('undeclared runtime member FK: surprise_fk');
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('evidence_incomplete');
    expect(plan.activationReady).toBe(false);
    expect(plan.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'runtime_schema_drift' })]));
  });

  it('turns runtime FK evidence failure into unavailable', () => {
    const f = facts();
    fkEffect(f, 'auth_sessions').rows = 'unknown';
    fkEffect(f, 'auth_sessions').evidenceProblem = 'runtime FK occupancy query failed';
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('evidence_incomplete');
  });

  it('makes an occupied runtime-only FK an explicit governed refusal', () => {
    const f = facts();
    const runtimeOnly = f.fkEffects.find((e) => e.declarationKeys.length === 0 && e.disposition === 'refuse');
    expect(runtimeOnly).toBeDefined();
    runtimeOnly!.rows = 1;
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('governed_refusal');
    expect(plan.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'unadjudicated_runtime_fk' })]));
  });

  it('allows the already-earned account/session effects and makes every destructive one S5-bound', () => {
    const f = facts();
    for (const table of ['auth_sessions', 'member_settings', 'member_sessions']) {
      (f.shadowFacts.locusRows as Record<string, Count>)[table] = 1;
      fkEffect(f, table).rows = 1;
    }
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('candidate_destructive_plan');
    for (const table of ['auth_sessions', 'member_settings', 'member_sessions']) {
      const direct = plan.dispositions.find((x) => x.locusKey === table)!;
      expect(direct.requiresS5).toBe(true);
    }
  });

  it('makes Circle shared/reply/membership withdrawal S5-bound before identity end', () => {
    const f = facts();
    (f.shadowFacts.locusRows as Record<string, Count>).circle_memberships = 1;
    (f.shadowFacts.locusRows as Record<string, Count>).circle_inquiry_responses = 1;
    f.shadowFacts.circles = { activeMemberships: 1, activeSharedArtifacts: 1, liveInquiryResponses: 1 };
    f.activeCircleIds = ['circle-1'];
    const plan = buildAccountErasureActivationPlan(f);
    expect(plan.outcome).toBe('candidate_destructive_plan');
    for (const key of ['shared_artifacts.shared_by', 'circle_inquiry_responses', 'circle_memberships']) {
      expect(plan.dispositions.find((x) => x.locusKey === key)?.requiresS5).toBe(true);
    }
    expect(plan.dispositions.find((x) => x.locusKey === 'members.id')?.requiresS5).toBe(true);
  });
});
