import { readFileSync } from 'fs';
import {
  type AccountErasureRegistry,
  type CensusResult,
  discoverCensus,
  loadRegistry,
  validateRegistry,
} from '../account-erasure-registry-core';

const ROOT = process.cwd();

function cloneCensus(value: CensusResult): CensusResult {
  return JSON.parse(JSON.stringify(value)) as CensusResult;
}

function cloneRegistry(value: AccountErasureRegistry): AccountErasureRegistry {
  return JSON.parse(JSON.stringify(value)) as AccountErasureRegistry;
}

describe('P5-A account-erasure registry coverage guard', () => {
  const census = discoverCensus(ROOT);
  const registry = loadRegistry(ROOT);

  it('reproduces the F5 anti-vacuity anchors before governing anything', () => {
    expect(census.baselineTableCount).toBe(634);
    expect(census.baselineMemberBoundCount).toBe(302);
    expect(census.fkLinkedTables).toBe(243);
    expect(census.fkTableActionPairs).toBe(264);
    expect(census.fkActionCounts).toEqual({
      CASCADE: 161,
      RESTRICT: 24,
      'NO ACTION': 47,
      'SET NULL': 32,
    });
  });

  it('the checked-in registry covers the current declared population exactly', () => {
    expect(validateRegistry(registry, census)).toEqual([]);
    expect(registry.memberBoundLoci).toHaveLength(census.memberBoundLoci.length);
    expect(registry.memberForeignKeyDeclarations).toHaveLength(census.memberForeignKeys.length);
  });

  it('kills the unknown-table mutant', () => {
    const mutant = cloneCensus(census);
    mutant.memberBoundLoci.push({
      table: 'future_unclassified_member_store',
      identityColumns: ['member_id'],
      source: 'post_baseline',
    });
    expect(validateRegistry(registry, mutant)).toEqual(
      expect.arrayContaining([expect.stringContaining('UNCLASSIFIED member-bound locus: future_unclassified_member_store')]),
    );
  });

  it('kills a new FK declaration even when its table/action pair is already known', () => {
    const mutant = cloneCensus(census);
    const existing = mutant.memberForeignKeys[0];
    mutant.memberForeignKeys.push({
      ...existing,
      sourceFile: 'database/migrations/20990101000000_mutant.sql',
      line: 7,
      declarationKey: `database/migrations/20990101000000_mutant.sql:7:${existing.table}:${existing.onDelete}`,
    });
    // Same table/action means the semantic anchor counts do not move; only the
    // declaration fingerprint catches this mutant.
    expect(validateRegistry(registry, mutant)).toEqual(
      expect.arrayContaining([expect.stringContaining('UNCLASSIFIED member FK declaration')]),
    );
  });

  it('kills identity-binding drift on an already classified table', () => {
    const mutant = cloneCensus(census);
    const target = mutant.memberBoundLoci.find((l) => l.table === 'account_erasure_acts');
    expect(target).toBeDefined();
    target!.identityColumns = ['subject_member_id', 'member_id'];
    expect(validateRegistry(registry, mutant)).toEqual(
      expect.arrayContaining([expect.stringContaining('IDENTITY DRIFT account_erasure_acts')]),
    );
  });

  it('classifies every indirect account-erasure ledger child as retained custody', () => {
    expect(registry.accountErasureLedgerChildren).toHaveLength(2);
    expect(registry.accountErasureLedgerChildren.map((x) => x.table).sort()).toEqual(
      ['account_erasure_dispositions', 'account_erasure_execution_events'].sort(),
    );
    expect(registry.accountErasureLedgerChildren.every((x) => x.disposition === 'retain')).toBe(true);
  });

  it('kills an unclassified future child of the retained erasure act', () => {
    const mutant = cloneCensus(census);
    mutant.accountErasureLedgerChildren.push({
      sourceFile: 'database/migrations/20990102000000_mutant_ledger_child.sql',
      line: 9,
      table: 'future_erasure_evidence',
      onDelete: 'RESTRICT',
      declarationKey:
        'database/migrations/20990102000000_mutant_ledger_child.sql:9:future_erasure_evidence:RESTRICT',
    });
    expect(validateRegistry(registry, mutant)).toEqual(
      expect.arrayContaining([expect.stringContaining('UNCLASSIFIED account-erasure ledger child')]),
    );
  });

  it('refuses to classify the durable erasure act as disposable', () => {
    const mutant = cloneRegistry(registry);
    const acts = mutant.memberBoundLoci.find((l) => l.table === 'account_erasure_acts');
    expect(acts).toBeDefined();
    acts!.disposition = 'erase';
    expect(validateRegistry(mutant, census)).toEqual(
      expect.arrayContaining([expect.stringContaining('account_erasure_acts must be explicitly classified retain')]),
    );
  });

  it('is bound into package governance rather than existing as an orphan script', () => {
    const pkg = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['check:erasure-registry']).toContain('check-account-erasure-registry.ts');
    expect(pkg.scripts['ci:sovereignty']).toContain('check:erasure-registry');
  });
});
