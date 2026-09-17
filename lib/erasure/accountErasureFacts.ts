import type { TransactionClient } from '@/lib/db/postgres';
import type { DeleteAction } from './accountErasureActivationRegistry';
import {
  ACCOUNT_ERASURE_RUNTIME_AUTHORITY,
  ACCOUNT_ERASURE_RUNTIME_PLANNING_REGISTRY,
  groupedRuntimeForeignKeys,
  runtimeFkEffectKey,
  runtimeSchemaFingerprint,
  type AccountErasureRuntimeAuthority,
} from './accountErasureRuntimeAuthority';
import {
  SOURCE_DEPENDENT_LINEAGE_LOCI,
  type AccountErasureShadowFacts,
} from './accountErasureShadowPlan';
import type { ErasureDisposition, ObservedCount } from './accountErasureAdapters';

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

function qi(identifier: string): string {
  if (!IDENT.test(identifier)) throw new Error(`unsafe account-erasure identifier: ${identifier}`);
  return `"${identifier}"`;
}

export interface RuntimeFkConstraint {
  constraintName: string;
  table: string;
  localColumns: string[];
  onDelete: DeleteAction;
}

export interface RuntimeFkEffectFact {
  key: string;
  table: string;
  onDelete: DeleteAction;
  declarationKeys: string[];
  constraintNames: string[];
  localColumns: string[];
  rows: ObservedCount;
  disposition: ErasureDisposition;
  authorityReason: string;
  evidenceProblem?: string;
}

export interface CollectedAccountErasureFacts {
  shadowFacts: AccountErasureShadowFacts;
  fkEffects: RuntimeFkEffectFact[];
  activeCircleIds: string[] | 'unknown';
  runtimeSchemaProblems: string[];
}

function deleteAction(code: string): DeleteAction | null {
  if (code === 'c') return 'CASCADE';
  if (code === 'r') return 'RESTRICT';
  if (code === 'a') return 'NO ACTION';
  if (code === 'n') return 'SET NULL';
  return null;
}

async function runtimeMemberForeignKeys(tx: TransactionClient): Promise<RuntimeFkConstraint[]> {
  const result = await tx.query<{
    constraint_name: string;
    table_name: string;
    local_columns: string[];
    delete_code: string;
  }>(`
    SELECT
      c.conname AS constraint_name,
      rel.relname AS table_name,
      array_agg(att.attname::text ORDER BY ord.ordinality)::text[] AS local_columns,
      c.confdeltype::text AS delete_code
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY ord(attnum, ordinality) ON TRUE
    JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = ord.attnum
    WHERE c.contype = 'f'
      AND ns.nspname = 'public'
      AND c.confrelid = to_regclass('public.members')
    GROUP BY c.oid, c.conname, rel.relname, c.confdeltype
    ORDER BY rel.relname, c.conname
  `);

  const out: RuntimeFkConstraint[] = [];
  for (const row of result.rows) {
    const action = deleteAction(row.delete_code);
    if (!action) continue;
    if (!Array.isArray(row.local_columns) || row.local_columns.some((column) => typeof column !== 'string')) {
      throw new Error(`runtime FK columns are not text[] for ${row.constraint_name}`);
    }
    out.push({
      constraintName: row.constraint_name,
      table: row.table_name,
      localColumns: row.local_columns,
      onDelete: action,
    });
  }
  return out;
}

async function runtimeDirectLoci(
  tx: TransactionClient,
  identityColumns: string[],
): Promise<Array<{ table: string; identityColumns: string[] }>> {
  const result = await tx.query<{ table_name: string; column_name: string }>(`
    SELECT c.relname AS table_name, a.attname::text AS column_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
     WHERE n.nspname = 'public'
       AND c.relkind IN ('r', 'p')
       AND a.attname::text = ANY($1::text[])
     ORDER BY c.relname, a.attname
  `, [identityColumns]);
  const byTable = new Map<string, string[]>();
  for (const row of result.rows) {
    const current = byTable.get(row.table_name) ?? [];
    current.push(row.column_name);
    byTable.set(row.table_name, current);
  }
  return [...byTable.entries()]
    .map(([table, columns]) => ({ table, identityColumns: columns.sort() }))
    .sort((a, b) => a.table.localeCompare(b.table));
}

function sameStrings(a: string[], b: string[]): boolean {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function schemaProblems(
  authority: AccountErasureRuntimeAuthority,
  loci: Array<{ table: string; identityColumns: string[] }>,
  fks: RuntimeFkConstraint[],
): string[] {
  const problems: string[] = [];
  const expectedLoci = new Map(authority.memberBoundLoci.map((x) => [x.table, x.identityColumns]));
  const actualLoci = new Map(loci.map((x) => [x.table, x.identityColumns]));
  for (const [table, columns] of expectedLoci) {
    const actual = actualLoci.get(table);
    if (!actual) problems.push(`missing runtime direct locus: ${table}`);
    else if (!sameStrings(actual, columns)) problems.push(`runtime direct-locus identity drift: ${table}`);
  }
  for (const table of actualLoci.keys()) if (!expectedLoci.has(table)) problems.push(`undeclared runtime direct locus: ${table}`);

  const expectedFks = new Map(authority.runtimeMemberForeignKeys.map((x) => [x.constraintName, x]));
  const actualFks = new Map(fks.map((x) => [x.constraintName, x]));
  for (const [name, expected] of expectedFks) {
    const actual = actualFks.get(name);
    if (!actual) { problems.push(`missing runtime member FK: ${name}`); continue; }
    if (actual.table !== expected.table || actual.onDelete !== expected.onDelete || !sameStrings(actual.localColumns, expected.localColumns)) {
      problems.push(`runtime member FK shape drift: ${name}`);
    }
  }
  for (const name of actualFks.keys()) if (!expectedFks.has(name)) problems.push(`undeclared runtime member FK: ${name}`);

  const fingerprint = runtimeSchemaFingerprint(loci, fks);
  if (fingerprint !== authority.schemaFingerprintSha256) problems.push('runtime schema fingerprint differs from R3 authority');
  return problems;
}

async function occupied(
  tx: TransactionClient,
  table: string,
  columns: string[],
  memberId: string,
): Promise<boolean> {
  const predicate = columns.map((column) => `${qi(column)}::text = $1`).join(' OR ');
  if (!predicate) throw new Error(`no identity columns for ${table}`);
  const result = await tx.query<{ present: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM ${qi(table)} WHERE ${predicate}) AS present`,
    [memberId],
  );
  return result.rows[0]?.present === true;
}

export async function collectAccountErasureFacts(
  tx: TransactionClient,
  memberId: string,
  authority: AccountErasureRuntimeAuthority = ACCOUNT_ERASURE_RUNTIME_AUTHORITY,
): Promise<CollectedAccountErasureFacts> {
  const locusRows: Record<string, ObservedCount> = {};
  const memberFkRows: Record<string, ObservedCount> = {};
  const lineageByLocus = Object.fromEntries(
    [...SOURCE_DEPENDENT_LINEAGE_LOCI].map((table) => [table, 'unknown' as const]),
  );

  let liveLoci: Array<{ table: string; identityColumns: string[] }> = [];
  let liveFks: RuntimeFkConstraint[] = [];
  let runtimeSchemaProblems: string[] = [];
  try {
    [liveLoci, liveFks] = await Promise.all([
      runtimeDirectLoci(tx, authority.identityColumns),
      runtimeMemberForeignKeys(tx),
    ]);
    runtimeSchemaProblems = schemaProblems(authority, liveLoci, liveFks);
  } catch (error) {
    runtimeSchemaProblems = [`runtime schema census failed: ${error instanceof Error ? error.message : typeof error}`];
  }

  const liveLocusMap = new Map(liveLoci.map((x) => [x.table, x.identityColumns]));
  for (const locus of authority.memberBoundLoci) {
    const actual = liveLocusMap.get(locus.table);
    if (!actual || !sameStrings(actual, locus.identityColumns)) {
      locusRows[locus.table] = 'unknown';
      continue;
    }
    try {
      locusRows[locus.table] = (await occupied(tx, locus.table, locus.identityColumns, memberId)) ? 1 : 0;
    } catch {
      locusRows[locus.table] = 'unknown';
    }
  }

  const actualByName = new Map(liveFks.map((x) => [x.constraintName, x]));
  const authorityGroups = groupedRuntimeForeignKeys(authority);
  const fkEffects: RuntimeFkEffectFact[] = [];
  for (const [key, governed] of authorityGroups) {
    const actual = governed.map((x) => actualByName.get(x.constraintName)).filter((x): x is RuntimeFkConstraint => Boolean(x));
    const disposition = governed[0].disposition;
    let rows: ObservedCount = 'unknown';
    let evidenceProblem: string | undefined;
    if (actual.length !== governed.length || governed.some((expected) => {
      const found = actualByName.get(expected.constraintName);
      return !found || found.table !== expected.table || found.onDelete !== expected.onDelete || !sameStrings(found.localColumns, expected.localColumns);
    })) {
      evidenceProblem = 'runtime FK constraint set does not match R3 authority';
    } else {
      try {
        let any = false;
        for (const constraint of actual) if (await occupied(tx, constraint.table, constraint.localColumns, memberId)) any = true;
        rows = any ? 1 : 0;
      } catch {
        evidenceProblem = 'runtime FK occupancy query failed';
      }
    }
    fkEffects.push({
      key,
      table: governed[0].table,
      onDelete: governed[0].onDelete,
      declarationKeys: [...new Set(governed.flatMap((x) => x.sourceDeclarationKeys))].sort(),
      constraintNames: governed.map((x) => x.constraintName).sort(),
      localColumns: [...new Set(governed.flatMap((x) => x.localColumns))].sort(),
      rows,
      disposition,
      authorityReason: governed[0].authorityReason,
      evidenceProblem,
    });
  }

  let activeCircleIds: string[] | 'unknown' = 'unknown';
  let activeMemberships: ObservedCount = 'unknown';
  let activeSharedArtifacts: ObservedCount = 'unknown';
  let liveInquiryResponses: ObservedCount = 'unknown';
  try {
    const memberships = await tx.query<{ circle_id: string }>(
      `SELECT circle_id::text AS circle_id
         FROM circle_memberships
        WHERE member_id::text = $1 AND status = 'active'
        ORDER BY circle_id`,
      [memberId],
    );
    activeCircleIds = memberships.rows.map((row) => row.circle_id);
    activeMemberships = activeCircleIds.length > 0 ? 1 : 0;

    const shares = await tx.query<{ present: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM shared_artifacts
          WHERE shared_by::text = $1 AND revoked_at IS NULL
       ) AS present`,
      [memberId],
    );
    activeSharedArtifacts = shares.rows[0]?.present ? 1 : 0;

    const responses = await tx.query<{ present: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM circle_inquiry_responses
          WHERE member_id::text = $1 AND withdrawn_at IS NULL
       ) AS present`,
      [memberId],
    );
    liveInquiryResponses = responses.rows[0]?.present ? 1 : 0;
  } catch {
    activeCircleIds = 'unknown';
  }

  return {
    shadowFacts: {
      locusRows,
      memberFkRows,
      circles: { activeMemberships, activeSharedArtifacts, liveInquiryResponses },
      lineageByLocus,
    },
    fkEffects,
    activeCircleIds,
    runtimeSchemaProblems,
  };
}

export const ACCOUNT_ERASURE_RUNTIME_FACT_REGISTRY = ACCOUNT_ERASURE_RUNTIME_PLANNING_REGISTRY;
