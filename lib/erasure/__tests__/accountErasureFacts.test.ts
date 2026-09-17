import type { TransactionClient } from '@/lib/db/postgres';
import type { AccountErasureRuntimeAuthority } from '../accountErasureRuntimeAuthority';
import { runtimeSchemaFingerprint } from '../accountErasureRuntimeAuthority';
import { collectAccountErasureFacts } from '../accountErasureFacts';

const locus = {
  table: 'known', identityColumns: ['member_id'], source: 'baseline' as const,
  disposition: 'refuse' as const, memberLabel: 'known', bindingRule: 'member_id',
  authorityReason: 'test', verificationRule: 'refusal_means_no_mutation', adapterKey: 'none', requiresS5: false,
};
const constraint = {
  constraintName: 'known_member_fk', table: 'known', localColumns: ['member_id'], onDelete: 'CASCADE' as const,
  disposition: 'refuse' as const, authorityReason: 'test runtime authority', sourceDeclarationKeys: ['a'], sourceStanding: 'matched' as const,
};

function authority(overrides: Partial<AccountErasureRuntimeAuthority> = {}): AccountErasureRuntimeAuthority {
  const memberBoundLoci = overrides.memberBoundLoci ?? [locus];
  const runtimeMemberForeignKeys = overrides.runtimeMemberForeignKeys ?? [constraint];
  return {
    version: 'test-runtime', generatedAgainst: 'test', sourceRegistryVersion: 'test-source', sourceRegistrySha256: 'x',
    activationAuthority: 'P5-D-R3 test', activationProhibited: false, identityColumns: ['member_id', 'user_id'],
    postgresMajor: 17, migrationCorpusSha256: 'x',
    schemaFingerprintSha256: runtimeSchemaFingerprint(memberBoundLoci, runtimeMemberForeignKeys),
    memberBoundLoci, staleSourceLoci: [], runtimeMemberForeignKeys, sourceOnlyFkGroups: [],
    ...overrides,
  } as AccountErasureRuntimeAuthority;
}

function tx(handler: (sql: string, params?: unknown[]) => any): TransactionClient {
  return { query: jest.fn(async (sql: string, params?: unknown[]) => handler(sql, params)) as any };
}

function baseHandler(opts: { present?: boolean; fkColumns?: string[]; extraFk?: boolean; directPresent?: boolean } = {}) {
  return (sql: string) => {
    if (/FROM pg_class c[\s\S]*pg_attribute/.test(sql) && !/pg_constraint/.test(sql)) {
      return { rows: opts.directPresent === false ? [] : [{ table_name: 'known', column_name: 'member_id' }] };
    }
    if (/FROM pg_constraint/.test(sql)) {
      const rows: any[] = [{ constraint_name: 'known_member_fk', table_name: 'known', local_columns: opts.fkColumns ?? ['member_id'], delete_code: 'c' }];
      if (opts.extraFk) rows.push({ constraint_name: 'surprise_fk', table_name: 'known', local_columns: ['member_id'], delete_code: 'c' });
      return { rows };
    }
    if (/FROM "known"/.test(sql)) return { rows: [{ present: opts.present ?? false }] };
    if (/circle_memberships/.test(sql)) return { rows: [] };
    if (/shared_artifacts/.test(sql) || /circle_inquiry_responses/.test(sql)) return { rows: [{ present: false }] };
    return { rows: [] };
  };
}

describe('F5 P5-D-R3 runtime erasure facts', () => {
  it('uses real text-array FK identifiers and binds occupancy to the exact runtime column', async () => {
    const seen: string[] = [];
    const client = tx((sql) => { seen.push(sql); return baseHandler({ present: true })(sql); });
    const facts = await collectAccountErasureFacts(client, 'm', authority());
    expect(facts.runtimeSchemaProblems).toEqual([]);
    expect(facts.fkEffects[0]).toMatchObject({ rows: 1, localColumns: ['member_id'], constraintNames: ['known_member_fk'] });
    expect(seen.some((sql) => /"member_id"::text/.test(sql))).toBe(true);
  });

  it('treats a missing current runtime locus as schema drift and unknown, never zero', async () => {
    const client = tx(baseHandler({ directPresent: false }));
    const facts = await collectAccountErasureFacts(client, 'm', authority());
    expect(facts.shadowFacts.locusRows.known).toBe('unknown');
    expect(facts.runtimeSchemaProblems).toEqual(expect.arrayContaining([expect.stringMatching(/missing runtime direct locus: known/)]));
  });

  it('detects an undeclared live FK constraint before execution', async () => {
    const client = tx(baseHandler({ extraFk: true }));
    const facts = await collectAccountErasureFacts(client, 'm', authority());
    expect(facts.runtimeSchemaProblems).toEqual(expect.arrayContaining([expect.stringMatching(/undeclared runtime member FK: surprise_fk/)]));
  });

  it('does not accept stringified name[] local-column payloads', async () => {
    const client = tx(baseHandler({ fkColumns: ['{member_id}'] }));
    const facts = await collectAccountErasureFacts(client, 'm', authority());
    expect(facts.runtimeSchemaProblems.length).toBeGreaterThan(0);
    expect(facts.fkEffects[0].rows).toBe('unknown');
  });

  it('keeps a runtime-only FK effect explicitly refuse', async () => {
    const runtimeOnly = { ...constraint, sourceDeclarationKeys: [], sourceStanding: 'runtime_only' as const, disposition: 'refuse' as const };
    const client = tx(baseHandler({ present: true }));
    const facts = await collectAccountErasureFacts(client, 'm', authority({ runtimeMemberForeignKeys: [runtimeOnly], schemaFingerprintSha256: runtimeSchemaFingerprint([locus], [runtimeOnly]) }));
    expect(facts.fkEffects[0]).toMatchObject({ rows: 1, disposition: 'refuse', declarationKeys: [] });
  });

  it('keeps source-dependent lineage unknown unless another lane has earned it', async () => {
    const client = tx(baseHandler());
    const facts = await collectAccountErasureFacts(client, 'm', authority());
    expect(facts.shadowFacts.lineageByLocus.conversation_insights).toBe('unknown');
  });
});
