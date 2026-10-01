import { query as postgresQuery } from '@/lib/db/postgres';
import { getMemberActiveRelationalContext } from '@/lib/relationships/relationshipContextService';
import type { CrystallizedMemory, MemberResponseStatus, MemoryAtomStatus, ReturnPreference } from '@/lib/psyche/types';
import type { MemoryScope } from '@/lib/maia/memoryAtomsLoader';
import { buildCabinContextPackage, type CabinContextPackage } from './contextPackage';
import { projectMemoryForCabin } from './memoryProjection';
import { projectRelationshipForCabin } from './relationshipProjection';
import { projectWorkForCabin } from './workProjection';
import type { ActiveRelationalContext } from '@/lib/relationships/types';

export type ConnectedCabinExportSelection = {
  workIds: string[];
  relationshipIds: string[];
  memoryIds: string[];
};

type QueryFn = typeof postgresQuery;
type RelationshipLoader = typeof getMemberActiveRelationalContext;

export type ConnectedCabinExportAssemblyDeps = {
  query: QueryFn;
  loadRelationshipContext: RelationshipLoader;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const productionDeps: ConnectedCabinExportAssemblyDeps = {
  query: postgresQuery,
  loadRelationshipContext: getMemberActiveRelationalContext,
};

function uniqueIds(values: string[], field: keyof ConnectedCabinExportSelection): string[] {
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string' || value.length === 0)) {
    throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${field}`);
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!UUID_RE.test(value)) {
      throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${field}`);
    }
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

function normalizeSelection(selection: ConnectedCabinExportSelection): ConnectedCabinExportSelection {
  if (!selection || typeof selection !== 'object') {
    throw new Error('CABIN_EXPORT_SELECTION_INVALID');
  }
  return {
    workIds: uniqueIds(selection.workIds, 'workIds'),
    relationshipIds: uniqueIds(selection.relationshipIds, 'relationshipIds'),
    memoryIds: uniqueIds(selection.memoryIds, 'memoryIds'),
  };
}

function iso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

type WorkRow = {
  id: string;
  member_id: string;
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  manuscript_state: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  expression_row_id: string | null;
  expression_type: string | null;
  expression_id: string | null;
  declared_at: string | Date | null;
};

type MemoryRow = {
  id: string;
  member_id: string;
  memory_scope: MemoryScope;
  source_type: CrystallizedMemory['sourceType'];
  source_id: string | null;
  title: string;
  body: string | null;
  primary_register: CrystallizedMemory['primaryRegister'];
  registers: CrystallizedMemory['registers'];
  elemental_lenses: CrystallizedMemory['elementalLenses'];
  thread_ids: string[];
  status: MemoryAtomStatus;
  return_preference: ReturnPreference;
  last_surfaced_at: string | Date | null;
  surface_count: number;
  member_response_status: MemberResponseStatus | null;
  member_response_at: string | Date | null;
  kept_at: string | Date;
  last_touched_at: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  crossing_allowed: boolean;
  facilitator_id: string | null;
};

function workFromRows(rows: WorkRow[], memberId: string, workId: string) {
  const matching = rows.filter((row) => row.id === workId);
  const first = matching[0];
  if (!first || first.member_id !== memberId) return null;

  return {
    id: first.id,
    memberId: first.member_id,
    title: first.title,
    purpose: first.purpose,
    form: first.form,
    stage: first.stage,
    manuscriptState: first.manuscript_state,
    createdAt: iso(first.created_at),
    updatedAt: iso(first.updated_at),
    expressions: matching
      .filter((row) => row.expression_row_id && row.expression_type && row.expression_id && row.declared_at)
      .map((row) => ({
        id: row.expression_row_id!,
        livingWorkId: row.id,
        expressionType: row.expression_type!,
        expressionId: row.expression_id!,
        declaredBy: memberId,
        declaredAt: iso(row.declared_at!),
      })),
  };
}

function memoryFromRow(row: MemoryRow): { candidate: Parameters<typeof projectMemoryForCabin>[0] } {
  if (row.crossing_allowed !== false) {
    throw new Error(`CABIN_EXPORT_SELECTION_INVALID:memory:${row.id}`);
  }

  const memory: CrystallizedMemory = {
    id: row.id,
    memberId: row.member_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    body: row.body,
    primaryRegister: row.primary_register,
    registers: row.registers ?? [],
    elementalLenses: row.elemental_lenses ?? [],
    threadIds: row.thread_ids ?? [],
    status: row.status,
    returnPreference: row.return_preference,
    lastSurfacedAt: row.last_surfaced_at ? iso(row.last_surfaced_at) : null,
    surfaceCount: row.surface_count,
    memberResponseStatus: row.member_response_status,
    memberResponseAt: row.member_response_at ? iso(row.member_response_at) : null,
    keptAt: iso(row.kept_at),
    lastTouchedAt: iso(row.last_touched_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    reverberationGuard: {
      interpretationStatus: 'uninterpreted',
      voiceEligibility: row.status === 'protected' ? 'record_only' : 'invitable',
      crossingAllowed: row.crossing_allowed,
    },
  };

  return { candidate: { ...memory, memoryScope: row.memory_scope } };
}

function requireComplete<T>(ids: string[], rows: T[], found: (row: T, id: string) => boolean, kind: string): void {
  const missing = ids.find((id) => !rows.some((row) => found(row, id)));
  if (missing) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${kind}:${missing}`);
}

export async function assembleConnectedCabinContextPackage(
  memberId: string,
  selection: ConnectedCabinExportSelection,
  deps: ConnectedCabinExportAssemblyDeps = productionDeps,
): Promise<CabinContextPackage> {
  if (!memberId) throw new Error('CABIN_EXPORT_MEMBER_REQUIRED');
  const normalized = normalizeSelection(selection);

  const workRows = normalized.workIds.length
    ? (await deps.query<WorkRow>(
        `SELECT
           w.id, w.member_id, w.title, w.purpose, w.form, w.stage,
           w.manuscript_state, w.created_at, w.updated_at,
           e.id AS expression_row_id, e.expression_type, e.expression_id, e.declared_at
         FROM living_works w
         LEFT JOIN living_work_expressions e ON e.living_work_id = w.id
         WHERE w.member_id = $1 AND w.id = ANY($2::uuid[])
         ORDER BY w.updated_at ASC, e.declared_at ASC`,
        [memberId, normalized.workIds],
      )).rows
    : [];

  const memoryRows = normalized.memoryIds.length
    ? (await deps.query<MemoryRow>(
        `SELECT
           id, member_id, memory_scope, source_type, source_id, title, body,
           primary_register, registers, elemental_lenses, thread_ids, status,
           return_preference, last_surfaced_at, surface_count,
           member_response_status, member_response_at, kept_at, last_touched_at,
           created_at, updated_at, crossing_allowed, facilitator_id
         FROM member_memory_atoms
         WHERE member_id = $1 AND id = ANY($2::uuid[])`,
        [memberId, normalized.memoryIds],
      )).rows
    : [];

  requireComplete(normalized.workIds, workRows, (row, id) => row.id === id && row.member_id === memberId, 'work');
  requireComplete(normalized.memoryIds, memoryRows, (row, id) => row.id === id && row.member_id === memberId, 'memory');

  const workProjections = normalized.workIds.map((id) => {
    const work = workFromRows(workRows, memberId, id);
    const projection = work ? projectWorkForCabin(work, memberId) : null;
    if (!projection) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:work:${id}`);
    return projection;
  });

  const relationshipContexts: { id: string; context: ActiveRelationalContext }[] = [];
  for (const relationshipId of normalized.relationshipIds) {
    const context = await deps.loadRelationshipContext(memberId, {
      relationshipId,
      allowRecentThreadFallback: false,
    });
    if (!context) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:relationship:${relationshipId}`);
    relationshipContexts.push({ id: relationshipId, context });
  }

  const relationshipProjections = relationshipContexts.map(({ id, context }) => {
    const projection = projectRelationshipForCabin(context, {
      relationshipId: id,
      authority: 'member_explicit',
    });
    if (!projection) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:relationship:${id}`);
    return projection;
  });

  const memoryProjections = normalized.memoryIds.map((id) => {
    const row = memoryRows.find((candidate) => candidate.id === id);
    if (!row) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:memory:${id}`);
    const { candidate } = memoryFromRow(row);
    const projection = projectMemoryForCabin(candidate);
    if (!projection) throw new Error(`CABIN_EXPORT_SELECTION_INVALID:memory:${id}`);
    return projection;
  });

  const packageValue = buildCabinContextPackage({
    works: workProjections,
    relationships: relationshipProjections,
    memories: memoryProjections,
  });

  if (!packageValue) throw new Error('CABIN_EXPORT_ASSEMBLY_INVALID');
  return packageValue;
}
