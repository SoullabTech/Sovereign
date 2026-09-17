import type { TransactionClient } from '@/lib/db/postgres';
import type { AccountErasureActivationRegistry } from '../accountErasureActivationRegistry';
import { collectAccountErasureFacts } from '../accountErasureFacts';

const registry: AccountErasureActivationRegistry = {
  version: 'test', seededAgainst: 'test', coverageOnly: true, activationProhibited: false,
  activationAuthority: 'P5-D test', identityColumns: ['member_id', 'user_id'],
  baselineAnchor: { tables: 634, memberBound: 302 },
  migrationFkAnchor: { linkedTables: 243, tableActionPairs: 264, actions: { CASCADE: 161, RESTRICT: 24, 'NO ACTION': 47, 'SET NULL': 32 } },
  memberBoundLoci: [
    { table: 'known', identityColumns: ['member_id'], source: 'baseline', disposition: 'refuse', memberLabel: 'known', bindingRule: 'member_id', authorityReason: 'test', verificationRule: 'refusal_means_no_mutation', adapterKey: 'none', requiresS5: false },
    { table: 'missing', identityColumns: ['user_id'], source: 'baseline', disposition: 'refuse', memberLabel: 'missing', bindingRule: 'user_id', authorityReason: 'test', verificationRule: 'refusal_means_no_mutation', adapterKey: 'none', requiresS5: false },
  ],
  memberForeignKeyDeclarations: [
    { sourceFile: 'a.sql', line: 1, table: 'known', onDelete: 'CASCADE', declarationKey: 'a', disposition: 'refuse', authorityReason: 'test' },
  ],
  accountErasureLedgerChildren: [],
};

function tx(handler: (sql: string, params?: unknown[]) => any): TransactionClient {
  return { query: jest.fn(async (sql: string, params?: unknown[]) => handler(sql, params)) as any };
}

describe('F5 P5-D runtime erasure facts', () => {
  it('treats a missing declared table as unknown, never zero', async () => {
    const client = tx((sql) => {
      if (/information_schema\.columns/.test(sql)) return { rows: [{ table_name: 'known', column_name: 'member_id' }] };
      if (/pg_constraint/.test(sql)) return { rows: [{ constraint_name: 'known_member_fk', table_name: 'known', local_columns: ['member_id'], delete_code: 'c' }] };
      if (/FROM "known"/.test(sql)) return { rows: [{ present: false }] };
      if (/circle_memberships/.test(sql)) throw new Error('circle schema absent');
      return { rows: [] };
    });
    const facts = await collectAccountErasureFacts(client, 'm', registry);
    expect(facts.shadowFacts.locusRows.known).toBe(0);
    expect(facts.shadowFacts.locusRows.missing).toBe('unknown');
  });

  it('binds FK occupancy to actual runtime local columns', async () => {
    const seen: string[] = [];
    const client = tx((sql) => {
      seen.push(sql);
      if (/information_schema\.columns/.test(sql)) return { rows: [{ table_name: 'known', column_name: 'member_id' }] };
      if (/pg_constraint/.test(sql)) return { rows: [{ constraint_name: 'known_member_fk', table_name: 'known', local_columns: ['practitioner_id'], delete_code: 'c' }] };
      if (/"practitioner_id"::text/.test(sql)) return { rows: [{ present: true }] };
      if (/FROM "known"/.test(sql)) return { rows: [{ present: false }] };
      if (/circle_memberships/.test(sql)) throw new Error('circle schema absent');
      return { rows: [] };
    });
    const facts = await collectAccountErasureFacts(client, 'm', registry);
    expect(facts.shadowFacts.memberFkRows.a).toBe(1);
    expect(facts.fkEffects[0]).toMatchObject({ rows: 1, localColumns: ['practitioner_id'] });
    expect(seen.some((sql) => /"practitioner_id"::text/.test(sql))).toBe(true);
  });

  it('refuses to manufacture FK evidence when runtime constraint count drifts', async () => {
    const client = tx((sql) => {
      if (/information_schema\.columns/.test(sql)) return { rows: [{ table_name: 'known', column_name: 'member_id' }] };
      if (/pg_constraint/.test(sql)) return { rows: [] };
      if (/FROM "known"/.test(sql)) return { rows: [{ present: false }] };
      if (/circle_memberships/.test(sql)) throw new Error('circle schema absent');
      return { rows: [] };
    });
    const facts = await collectAccountErasureFacts(client, 'm', registry);
    expect(facts.shadowFacts.memberFkRows.a).toBe('unknown');
    expect(facts.fkEffects[0].evidenceProblem).toMatch(/constraint count/);
  });

  it('keeps source-dependent lineage unknown unless another lane has earned it', async () => {
    const client = tx((sql) => {
      if (/information_schema\.columns/.test(sql)) return { rows: [] };
      if (/pg_constraint/.test(sql)) return { rows: [] };
      if (/circle_memberships/.test(sql)) throw new Error('circle schema absent');
      return { rows: [] };
    });
    const facts = await collectAccountErasureFacts(client, 'm', registry);
    expect(facts.shadowFacts.lineageByLocus.conversation_insights).toBe('unknown');
  });
});
