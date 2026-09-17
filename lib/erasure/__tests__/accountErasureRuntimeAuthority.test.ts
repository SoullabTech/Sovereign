import v3 from '@/config/governance/account-erasure-registry.v3.json';
import runtime from '@/config/governance/account-erasure-runtime-authority.v1.json';
import { groupedRuntimeForeignKeys, runtimeSchemaFingerprint } from '../accountErasureRuntimeAuthority';

describe('F5 P5-D-R3 runtime schema authority', () => {
  it('preserves v3 as source provenance while using a smaller current direct-locus graph', () => {
    expect(v3.memberBoundLoci).toHaveLength(319);
    expect(runtime.memberBoundLoci).toHaveLength(318);
    expect(runtime.staleSourceLoci.map((x) => x.table)).toEqual(['dream_entries']);
    expect(v3.memberBoundLoci.some((x) => x.table === 'dream_entries')).toBe(true);
    expect(runtime.memberBoundLoci.some((x) => x.table === 'dream_entries')).toBe(false);
  });

  it('keeps migration declarations and runtime constraints as distinct populations', () => {
    expect(v3.memberForeignKeyDeclarations).toHaveLength(289);
    expect(new Set(v3.memberForeignKeyDeclarations.map((x) => `${x.table}|${x.onDelete}`)).size).toBe(264);
    expect(runtime.runtimeMemberForeignKeys).toHaveLength(316);
    expect(groupedRuntimeForeignKeys().size).toBe(294);
  });

  it('makes every runtime-only FK effect fail-closed refuse', () => {
    const runtimeOnly = runtime.runtimeMemberForeignKeys.filter((x) => x.sourceStanding === 'runtime_only');
    expect(new Set(runtimeOnly.map((x) => `${x.table}|${x.onDelete}`)).size).toBe(36);
    expect(runtimeOnly.length).toBeGreaterThan(0);
    expect(runtimeOnly.every((x) => x.disposition === 'refuse' && x.sourceDeclarationKeys.length === 0)).toBe(true);
  });

  it('records the two count-drift groups and six source-only groups rather than hiding them', () => {
    const drift = new Set(runtime.runtimeMemberForeignKeys.filter((x) => x.sourceStanding === 'count_drift').map((x) => `${x.table}|${x.onDelete}`));
    expect([...drift].sort()).toEqual(['pattern_ledger|CASCADE', 'practitioner_clients|SET NULL']);
    expect(runtime.sourceOnlyFkGroups).toHaveLength(6);
  });

  it('carries real identifier arrays and a self-consistent schema fingerprint', () => {
    expect(runtime.runtimeMemberForeignKeys.every((x) => x.localColumns.length > 0 && x.localColumns.every((c) => !/[{}]/.test(c)))).toBe(true);
    expect(runtimeSchemaFingerprint(runtime.memberBoundLoci, runtime.runtimeMemberForeignKeys)).toBe(runtime.schemaFingerprintSha256);
  });
});
