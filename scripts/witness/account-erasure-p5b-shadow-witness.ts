import {
  ACCOUNT_ERASURE_SHADOW_REGISTRY,
  SOURCE_DEPENDENT_LINEAGE_LOCI,
  buildAccountErasureShadowPlan,
  type AccountErasureShadowFacts,
} from '../../lib/erasure/accountErasureShadowPlan';

type Count = number | 'unknown';

function facts(): AccountErasureShadowFacts {
  const locusRows: Record<string, Count> = {};
  for (const locus of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberBoundLoci) locusRows[locus.table] = 0;
  const memberFkRows: Record<string, Count> = {};
  for (const fk of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberForeignKeyDeclarations) memberFkRows[fk.declarationKey] = 0;

  for (const table of ['auth_sessions', 'member_settings', 'member_sessions', 'circle_memberships', 'circle_inquiry_responses']) {
    locusRows[table] = 1;
  }
  for (const fk of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberForeignKeyDeclarations.filter((x) =>
    ['auth_sessions', 'member_settings', 'member_sessions'].includes(x.table),
  )) memberFkRows[fk.declarationKey] = 1;

  return {
    locusRows,
    memberFkRows,
    circles: { activeMemberships: 1, activeSharedArtifacts: 2, liveInquiryResponses: 1 },
    lineageByLocus: Object.fromEntries([...SOURCE_DEPENDENT_LINEAGE_LOCI].map((table) => [table, 'unknown'])),
  };
}

const plan = buildAccountErasureShadowPlan(facts());
if (!plan.evidenceComplete) throw new Error(`P5-B witness: evidence incomplete: ${JSON.stringify(plan.blockers)}`);
if (plan.outcome !== 'candidate_destructive_plan') throw new Error(`P5-B witness: expected candidate plan, got ${plan.outcome}`);
if (plan.activationReady !== false) throw new Error('P5-B witness: shadow plan became activation-ready');

const byKey = new Map(plan.entries.map((entry) => [entry.key, entry]));
const shares = byKey.get('domain:circles:shared_artifacts');
const responses = byKey.get('locus:circle_inquiry_responses');
const membership = byKey.get('locus:circle_memberships');
const memberRow = byKey.get('synthetic:members-row');
if (!shares || shares.plannedDisposition !== 'revoke') throw new Error('P5-B witness: shares were not planned revoke');
if (!responses || responses.plannedDisposition !== 'tombstone') throw new Error('P5-B witness: responses were not planned tombstone');
if (!membership || !membership.dependsOn.includes(shares.key) || !membership.dependsOn.includes(responses.key)) {
  throw new Error('P5-B witness: membership does not depend on representation shutdown');
}
if (!memberRow || !memberRow.dependsOn.includes(membership.key)) throw new Error('P5-B witness: member row can end before Circles membership');

console.log('P5-B SHADOW WITNESS — PASS');
console.log(`registry=${plan.registryVersion}`);
console.log(`outcome=${plan.outcome}`);
console.log(`activationReady=${plan.activationReady}`);
console.log(`entries=${plan.entries.length} fkEffects=${plan.memberFkEffects.length}`);
for (const key of [
  'locus:auth_sessions',
  'domain:circles:shared_artifacts',
  'locus:circle_inquiry_responses',
  'locus:circle_memberships',
  'synthetic:members-row',
]) {
  const e = byKey.get(key)!;
  console.log(`${key} disposition=${e.plannedDisposition} phase=${e.phase} dependsOn=${e.dependsOn.join(',') || '-'}`);
}
console.log(`activationBlockers=${plan.activationBlockers.join(' | ')}`);
