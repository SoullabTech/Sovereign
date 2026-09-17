import registryJson from '@/config/governance/account-erasure-registry.v3.json';
import type { ErasureDisposition } from './accountErasureAdapters';

export type DeleteAction = 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL';

export interface ActivationRegistryLocus {
  table: string;
  identityColumns: string[];
  source: 'baseline' | 'post_baseline';
  disposition: ErasureDisposition;
  memberLabel: string;
  bindingRule: string;
  authorityReason: string;
  verificationRule: string;
  adapterKey: string;
  requiresS5: boolean;
}

export interface ActivationRegistryFk {
  sourceFile: string;
  line: number;
  table: string;
  onDelete: DeleteAction;
  declarationKey: string;
  disposition: ErasureDisposition;
  authorityReason: string;
}

export interface AccountErasureActivationRegistry {
  version: string;
  seededAgainst: string;
  coverageOnly: true;
  activationProhibited: false;
  activationAuthority: string;
  identityColumns: string[];
  baselineAnchor: { tables: number; memberBound: number };
  migrationFkAnchor: {
    linkedTables: number;
    tableActionPairs: number;
    actions: Record<DeleteAction, number>;
  };
  memberBoundLoci: ActivationRegistryLocus[];
  memberForeignKeyDeclarations: ActivationRegistryFk[];
  accountErasureLedgerChildren: Array<{
    declarationKey: string;
    sourceFile: string;
    line: number;
    table: string;
    onDelete: DeleteAction;
    disposition: 'retain';
    authorityReason: string;
  }>;
}

export const ACCOUNT_ERASURE_ACTIVATION_REGISTRY =
  registryJson as unknown as AccountErasureActivationRegistry;

export function fkEffectKey(table: string, onDelete: DeleteAction): string {
  return `${table}|${onDelete}`;
}

export function groupedActivationForeignKeys(
  registry: AccountErasureActivationRegistry = ACCOUNT_ERASURE_ACTIVATION_REGISTRY,
): Map<string, ActivationRegistryFk[]> {
  const groups = new Map<string, ActivationRegistryFk[]>();
  for (const declaration of registry.memberForeignKeyDeclarations) {
    const key = fkEffectKey(declaration.table, declaration.onDelete);
    const current = groups.get(key) ?? [];
    current.push(declaration);
    groups.set(key, current);
  }
  return groups;
}
