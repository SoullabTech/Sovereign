import { createHash } from 'crypto';
import runtimeJson from '@/config/governance/account-erasure-runtime-authority.v1.json';
import type { ActivationRegistryLocus, DeleteAction } from './accountErasureActivationRegistry';
import type { ErasureDisposition } from './accountErasureAdapters';

export type RuntimeSourceStanding = 'matched' | 'runtime_only' | 'count_drift';

export interface RuntimeAuthorityFkConstraint {
  constraintName: string;
  table: string;
  localColumns: string[];
  onDelete: DeleteAction;
  disposition: ErasureDisposition;
  authorityReason: string;
  sourceDeclarationKeys: string[];
  sourceStanding: RuntimeSourceStanding;
}

export interface SourceOnlyFkGroup {
  key: string;
  table: string;
  onDelete: DeleteAction;
  disposition: ErasureDisposition;
  sourceDeclarationKeys: string[];
}

export interface AccountErasureRuntimeAuthority {
  version: string;
  generatedAgainst: string;
  sourceRegistryVersion: string;
  sourceRegistrySha256: string;
  activationAuthority: string;
  activationProhibited: false;
  identityColumns: string[];
  postgresMajor: number;
  migrationCorpusSha256: string;
  schemaFingerprintSha256: string;
  memberBoundLoci: ActivationRegistryLocus[];
  staleSourceLoci: ActivationRegistryLocus[];
  runtimeMemberForeignKeys: RuntimeAuthorityFkConstraint[];
  sourceOnlyFkGroups: SourceOnlyFkGroup[];
}

export const ACCOUNT_ERASURE_RUNTIME_AUTHORITY =
  runtimeJson as unknown as AccountErasureRuntimeAuthority;

export const ACCOUNT_ERASURE_RUNTIME_PLANNING_REGISTRY = {
  version: ACCOUNT_ERASURE_RUNTIME_AUTHORITY.version,
  coverageOnly: true,
  activationProhibited: ACCOUNT_ERASURE_RUNTIME_AUTHORITY.activationProhibited,
  memberBoundLoci: ACCOUNT_ERASURE_RUNTIME_AUTHORITY.memberBoundLoci,
  // Runtime FK effects are planned from exact constraints in accountErasureFacts.
  // Migration declarations remain provenance and do not masquerade as execution rows.
  memberForeignKeyDeclarations: [],
};

export function runtimeFkEffectKey(table: string, onDelete: DeleteAction): string {
  return `${table}|${onDelete}`;
}

export function groupedRuntimeForeignKeys(
  authority: AccountErasureRuntimeAuthority = ACCOUNT_ERASURE_RUNTIME_AUTHORITY,
): Map<string, RuntimeAuthorityFkConstraint[]> {
  const groups = new Map<string, RuntimeAuthorityFkConstraint[]>();
  for (const constraint of authority.runtimeMemberForeignKeys) {
    const key = runtimeFkEffectKey(constraint.table, constraint.onDelete);
    const current = groups.get(key) ?? [];
    current.push(constraint);
    groups.set(key, current);
  }
  return groups;
}

export function runtimeSchemaFingerprint(
  loci: Array<{ table: string; identityColumns: string[] }>,
  fks: Array<{ constraintName: string; table: string; localColumns: string[]; onDelete: DeleteAction }>,
): string {
  const normalized = {
    loci: loci
      .map((x) => ({ table: x.table, identityColumns: [...x.identityColumns].sort() }))
      .sort((a, b) => a.table.localeCompare(b.table)),
    fks: fks
      .map((x) => ({
        constraintName: x.constraintName,
        table: x.table,
        localColumns: [...x.localColumns].sort(),
        onDelete: x.onDelete,
      }))
      .sort((a, b) => `${a.table}|${a.constraintName}`.localeCompare(`${b.table}|${b.constraintName}`)),
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
