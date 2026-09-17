import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import {
  ACCOUNT_ERASURE_SHADOW_REGISTRY,
  SOURCE_DEPENDENT_LINEAGE_LOCI,
  buildAccountErasureShadowPlan,
  type AccountErasureShadowFacts,
} from '../accountErasureShadowPlan';

type Count = number | 'unknown';

function zeroFacts(): AccountErasureShadowFacts {
  const locusRows: Record<string, Count> = {};
  for (const locus of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberBoundLoci) locusRows[locus.table] = 0;
  const memberFkRows: Record<string, Count> = {};
  for (const fk of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberForeignKeyDeclarations) memberFkRows[fk.declarationKey] = 0;
  return {
    locusRows,
    memberFkRows,
    circles: { activeMemberships: 0, activeSharedArtifacts: 0, liveInquiryResponses: 0 },
    lineageByLocus: Object.fromEntries([...SOURCE_DEPENDENT_LINEAGE_LOCI].map((table) => [table, 'unknown'])),
  };
}

function entry(plan: ReturnType<typeof buildAccountErasureShadowPlan>, key: string) {
  const found = plan.entries.find((e) => e.key === key);
  if (!found) throw new Error(`missing plan entry ${key}`);
  return found;
}

function sha1(rel: string): string {
  return createHash('sha1').update(readFileSync(path.join(process.cwd(), rel))).digest('hex');
}

describe('F5 P5-B shadow account-erasure plan', () => {
  it('never confers activation authority', () => {
    const plan = buildAccountErasureShadowPlan(zeroFacts());
    expect(plan.mode).toBe('shadow_only');
    expect(plan.activationReady).toBe(false);
    expect(plan.activationBlockers[0]).toMatch(/shadow-only/);
  });

  it('refuses to present missing locus evidence as a complete plan', () => {
    const facts = zeroFacts();
    delete (facts.locusRows as Record<string, Count>).quick_journal_entries;
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.evidenceComplete).toBe(false);
    expect(plan.outcome).toBe('evidence_incomplete');
    expect(plan.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'missing_locus_fact' })]));
  });

  it('refuses an occupied unadjudicated locus instead of guessing erase', () => {
    const facts = zeroFacts();
    (facts.locusRows as Record<string, Count>).quick_journal_entries = 2;
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.outcome).toBe('governed_refusal');
    expect(entry(plan, 'locus:quick_journal_entries')).toMatchObject({
      plannedDisposition: 'refuse',
      refusalReason: 'unadjudicated_locus',
    });
  });

  it('refuses an occupied unadjudicated member FK effect', () => {
    const facts = zeroFacts();
    const fk = ACCOUNT_ERASURE_SHADOW_REGISTRY.memberForeignKeyDeclarations.find((x) => x.disposition === 'refuse');
    expect(fk).toBeDefined();
    (facts.memberFkRows as Record<string, Count>)[fk!.declarationKey] = 1;
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.outcome).toBe('governed_refusal');
    expect(plan.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'unadjudicated_fk' })]));
  });

  it('models the already-earned account/session sequence but still blocks activation on S5', () => {
    const facts = zeroFacts();
    for (const table of ['auth_sessions', 'member_settings', 'member_sessions']) {
      (facts.locusRows as Record<string, Count>)[table] = 1;
    }
    for (const fk of ACCOUNT_ERASURE_SHADOW_REGISTRY.memberForeignKeyDeclarations.filter((x) =>
      ['auth_sessions', 'member_settings', 'member_sessions'].includes(x.table),
    )) {
      (facts.memberFkRows as Record<string, Count>)[fk.declarationKey] = 1;
    }
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.outcome).toBe('candidate_destructive_plan');
    expect(entry(plan, 'locus:auth_sessions').plannedDisposition).toBe('revoke');
    expect(entry(plan, 'locus:member_settings').plannedDisposition).toBe('erase');
    expect(entry(plan, 'locus:member_sessions').plannedDisposition).toBe('erase');
    expect(plan.activationReady).toBe(false);
    expect(plan.activationBlockers).toEqual(expect.arrayContaining([expect.stringMatching(/S5 anti-resurrection/)]));
  });

  it('expands Circles to shared_artifacts even though shared_by is outside the direct-locus registry', () => {
    const facts = zeroFacts();
    (facts.locusRows as Record<string, Count>).circle_memberships = 1;
    (facts.locusRows as Record<string, Count>).circle_inquiry_responses = 1;
    facts.circles = { activeMemberships: 1, activeSharedArtifacts: 3, liveInquiryResponses: 1 };
    const plan = buildAccountErasureShadowPlan(facts);
    expect(entry(plan, 'domain:circles:shared_artifacts')).toMatchObject({
      source: 'domain_expansion',
      plannedDisposition: 'revoke',
      adapterKey: 'circles_lifecycle',
    });
  });

  it('kills the Circles-order mutant: shares/responses precede membership, membership precedes member row', () => {
    const facts = zeroFacts();
    (facts.locusRows as Record<string, Count>).circle_memberships = 1;
    (facts.locusRows as Record<string, Count>).circle_inquiry_responses = 1;
    facts.circles = { activeMemberships: 1, activeSharedArtifacts: 2, liveInquiryResponses: 1 };
    const plan = buildAccountErasureShadowPlan(facts);
    const membership = entry(plan, 'locus:circle_memberships');
    expect(membership.dependsOn).toEqual(
      expect.arrayContaining(['domain:circles:shared_artifacts', 'locus:circle_inquiry_responses']),
    );
    expect(entry(plan, 'synthetic:members-row').dependsOn).toEqual(expect.arrayContaining(['locus:circle_memberships']));
  });

  it('refuses source-dependent deletion when lineage is coarse instead of guessing', () => {
    const facts = zeroFacts();
    (facts.locusRows as Record<string, Count>).conversation_insights = 1;
    (facts.lineageByLocus as Record<string, any>).conversation_insights = 'coarse';
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.outcome).toBe('governed_refusal');
    expect(entry(plan, 'locus:conversation_insights')).toMatchObject({
      plannedDisposition: 'refuse',
      adapterKey: 'lineage_guard',
      refusalReason: 'lineage_not_specific',
    });
  });

  it('does not import the shadow planner into the live route or Account Settings', () => {
    const route = readFileSync(path.join(process.cwd(), 'app/api/members/delete-account/route.ts'), 'utf8');
    const client = readFileSync(path.join(process.cwd(), 'components/account/AccountSettings.tsx'), 'utf8');
    expect(route).not.toMatch(/accountErasureShadowPlan|accountErasureAdapters/);
    expect(client).not.toMatch(/accountErasureShadowPlan|accountErasureAdapters/);
    expect(route).toMatch(/CONTAINMENT_POSTURE:\s*'refuse'\s*\|\s*'proceed'\s*=\s*'refuse'/);
  });


  it('bounds registry v2 succession to the five P5-B loci and three known FK effects', () => {
    const v1 = JSON.parse(readFileSync(path.join(process.cwd(), 'config/governance/account-erasure-registry.v1.json'), 'utf8'));
    const v2 = JSON.parse(readFileSync(path.join(process.cwd(), 'config/governance/account-erasure-registry.v2.json'), 'utf8'));
    const byTable = (r: any) => new Map(r.memberBoundLoci.map((x: any) => [x.table, x]));
    const a = byTable(v1);
    const b = byTable(v2);
    const changedLoci = [...b.keys()].filter((table) => JSON.stringify(a.get(table)) !== JSON.stringify(b.get(table))).sort();
    expect(changedLoci).toEqual([
      'auth_sessions',
      'circle_inquiry_responses',
      'circle_memberships',
      'member_sessions',
      'member_settings',
    ]);
    const f1 = new Map(v1.memberForeignKeyDeclarations.map((x: any) => [x.declarationKey, x]));
    const changedFks = v2.memberForeignKeyDeclarations
      .filter((x: any) => JSON.stringify(f1.get(x.declarationKey)) !== JSON.stringify(x))
      .map((x: any) => x.table)
      .sort();
    expect(changedFks).toEqual(['auth_sessions', 'member_sessions', 'member_settings']);
    expect(v2.coverageOnly).toBe(true);
    expect(v2.activationProhibited).toBe(true);
  });

  it('requires live Circles expansion evidence even when direct registry rows are known', () => {
    const facts = zeroFacts();
    facts.circles = { activeMemberships: 0, activeSharedArtifacts: 'unknown', liveInquiryResponses: 0 };
    const plan = buildAccountErasureShadowPlan(facts);
    expect(plan.outcome).toBe('evidence_incomplete');
    expect(plan.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'missing_circle_fact' })]));
  });

  it('preserves the P4 positive-control files byte-for-byte from the P5-A tip', () => {
    expect(sha1('lib/circles/membershipService.ts')).toBe('3e9613473cef185268a5597235e40c9b0d14275c');
    expect(sha1('lib/circles/consentService.ts')).toBe('441588620a038816e05f9dd8163d0777f1856def');
    expect(sha1('lib/manuscript/source/eraseManuscript.ts')).toBe('ac5b9fb3707e68e55a4e14b8bf79858ef725bcf3');
    expect(sha1('lib/storage/fileVault.ts')).toBe('d21092f331caa119a14f493b586ee9b0ad6e4892');
  });
});
