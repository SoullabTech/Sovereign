import type { TransactionClient } from '@/lib/db/postgres';
import {
  ACCOUNT_ERASURE_ACTIVATION_REGISTRY,
  type AccountErasureActivationRegistry,
  type DeleteAction,
  fkEffectKey,
  groupedActivationForeignKeys,
} from './accountErasureActivationRegistry';
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
      array_agg(att.attname ORDER BY ord.ordinality) AS local_columns,
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
    out.push({
      constraintName: row.constraint_name,
      table: row.table_name,
      localColumns: row.local_columns,
      onDelete: action,
    });
  }
  return out;
}

async function occupied(
  tx: TransactionClient,
  table: string,
  columns: string[],
  memberId: string,
): Promise<boolean> {
  const predicate = columns.map((column) => `${qi(column)}::text = $1`).join(' OR ');
  const result = await tx.query<{ present: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM ${qi(table)} WHERE ${predicate}) AS present`,
    [memberId],
  );
  return result.rows[0]?.present === true;
}

export async function collectAccountErasureFacts(
  tx: TransactionClient,
  memberId: string,
  registry: AccountErasureActivationRegistry = ACCOUNT_ERASURE_ACTIVATION_REGISTRY,
): Promise<CollectedAccountErasureFacts> {
  const locusRows: Record<string, ObservedCount> = {};
  const memberFkRows: Record<string, ObservedCount> = {};
  const lineageByLocus = Object.fromEntries(
    [...SOURCE_DEPENDENT_LINEAGE_LOCI].map((table) => [table, 'unknown' as const]),
  );

  // One catalog read establishes table + identity-column availability. A missing
  // declaration is UNKNOWN, never an empty table.
  const expectedTables = registry.memberBoundLoci.map((locus) => locus.table);
  const columnsResult = await tx.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])`,
    [expectedTables],
  );
  const columnsByTable = new Map<string, Set<string>>();
  for (const row of columnsResult.rows) {
    const current = columnsByTable.get(row.table_name) ?? new Set<string>();
    current.add(row.column_name);
    columnsByTable.set(row.table_name, current);
  }

  for (const locus of registry.memberBoundLoci) {
    const actual = columnsByTable.get(locus.table);
    const shapeKnown = actual && locus.identityColumns.every((column) => actual.has(column));
    if (!shapeKnown) {
      locusRows[locus.table] = 'unknown';
      continue;
    }
    try {
      locusRows[locus.table] = (await occupied(tx, locus.table, locus.identityColumns, memberId)) ? 1 : 0;
    } catch {
      locusRows[locus.table] = 'unknown';
    }
  }

  // Migration declarations are provenance. Runtime constraints are execution
  // truth. Bind them at the table/action effect class; duplicate declarations
  // are lawful only because P5-D's activation gate proves disposition unanimity.
  let runtimeFks: RuntimeFkConstraint[] = [];
  try {
    runtimeFks = await runtimeMemberForeignKeys(tx);
  } catch {
    runtimeFks = [];
  }
  const expectedGroups = groupedActivationForeignKeys(registry);
  const actualGroups = new Map<string, RuntimeFkConstraint[]>();
  for (const constraint of runtimeFks) {
    const key = fkEffectKey(constraint.table, constraint.onDelete);
    const current = actualGroups.get(key) ?? [];
    current.push(constraint);
    actualGroups.set(key, current);
  }

  const fkEffects: RuntimeFkEffectFact[] = [];
  for (const [key, declarations] of expectedGroups) {
    const actual = actualGroups.get(key) ?? [];
    const disposition = declarations[0].disposition;
    let rows: ObservedCount = 'unknown';
    let evidenceProblem: string | undefined;

    if (actual.length !== declarations.length) {
      evidenceProblem = `runtime constraint count ${actual.length} does not match declaration count ${declarations.length}`;
    } else {
      try {
        let any = false;
        for (const constraint of actual) {
          if (await occupied(tx, constraint.table, constraint.localColumns, memberId)) any = true;
        }
        rows = any ? 1 : 0;
      } catch {
        evidenceProblem = 'runtime FK occupancy query failed';
      }
    }

    for (const declaration of declarations) memberFkRows[declaration.declarationKey] = rows;
    fkEffects.push({
      key,
      table: declarations[0].table,
      onDelete: declarations[0].onDelete,
      declarationKeys: declarations.map((x) => x.declarationKey),
      constraintNames: actual.map((x) => x.constraintName),
      localColumns: [...new Set(actual.flatMap((x) => x.localColumns))].sort(),
      rows,
      disposition,
      authorityReason: declarations[0].authorityReason,
      evidenceProblem,
    });
  }

  // A live constraint the governed declaration set does not know about is drift.
  for (const [key, actual] of actualGroups) {
    if (expectedGroups.has(key)) continue;
    fkEffects.push({
      key,
      table: actual[0].table,
      onDelete: actual[0].onDelete,
      declarationKeys: [],
      constraintNames: actual.map((x) => x.constraintName),
      localColumns: [...new Set(actual.flatMap((x) => x.localColumns))].sort(),
      rows: 'unknown',
      disposition: 'refuse',
      authorityReason: 'Runtime FK effect is absent from the governed activation registry.',
      evidenceProblem: 'undeclared runtime member FK effect',
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
  };
}
