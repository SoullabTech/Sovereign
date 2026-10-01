import fs from 'node:fs';
import path from 'node:path';

import {
  assembleConnectedCabinContextPackage,
  type ConnectedCabinExportAssemblyDeps,
  type ConnectedCabinExportSelection,
} from '../connectedExportAssembly';

const MEMBER = '00000000-0000-4000-8000-000000000001';
const WORK = '00000000-0000-4000-8000-000000000002';
const WORK_EXPR_A = '00000000-0000-4000-8000-000000000003';
const WORK_EXPR_B = '00000000-0000-4000-8000-000000000004';
const RELATIONSHIP = '00000000-0000-4000-8000-000000000005';
const MEMORY = '00000000-0000-4000-8000-000000000006';
const MEMORY_REJECTED = '00000000-0000-4000-8000-000000000007';

function selection(overrides: Partial<ConnectedCabinExportSelection> = {}): ConnectedCabinExportSelection {
  return {
    workIds: [],
    relationshipIds: [],
    memoryIds: [],
    ...overrides,
  };
}

function workRows() {
  return [
    {
      id: WORK, member_id: MEMBER, title: 'Elemental Alchemy', purpose: 'Write the book',
      form: 'book', stage: 'writing', manuscript_state: 'existing-manuscript',
      created_at: '2026-09-30T12:00:00.000Z', updated_at: '2026-09-30T13:00:00.000Z',
      expression_row_id: WORK_EXPR_A, expression_type: 'manuscript', expression_id: 'manuscript-a',
      declared_at: '2026-09-30T12:01:00.000Z',
    },
    {
      id: WORK, member_id: MEMBER, title: 'Elemental Alchemy', purpose: 'Write the book',
      form: 'book', stage: 'writing', manuscript_state: 'existing-manuscript',
      created_at: '2026-09-30T12:00:00.000Z', updated_at: '2026-09-30T13:00:00.000Z',
      expression_row_id: WORK_EXPR_B, expression_type: 'manuscript', expression_id: 'manuscript-b',
      declared_at: '2026-09-30T12:02:00.000Z',
    },
  ];
}

function memoryRow(overrides: Record<string, unknown> = {}) {
  return {
    id: MEMORY, member_id: MEMBER, memory_scope: 'personal', source_type: 'spontaneous',
    source_id: null, title: 'A kept recognition', body: 'I recognized something important.',
    primary_register: 'threshold', registers: ['threshold'], elemental_lenses: ['water'],
    thread_ids: [], status: 'active', return_preference: 'member_pulled',
    last_surfaced_at: null, surface_count: 0, member_response_status: null,
    member_response_at: null, kept_at: '2026-09-30T12:00:00.000Z',
    last_touched_at: '2026-09-30T12:00:00.000Z', created_at: '2026-09-30T12:00:00.000Z',
    updated_at: '2026-09-30T12:00:00.000Z', crossing_allowed: false, facilitator_id: null,
    ...overrides,
  };
}

function deps(overrides: Partial<ConnectedCabinExportAssemblyDeps> = {}): ConnectedCabinExportAssemblyDeps {
  const calls: string[] = [];
  const query = async <T>(sql: string, _params?: unknown[]) => {
    calls.push(sql);
    if (/FROM living_works/i.test(sql)) return { rows: workRows() as T[] };
    if (/FROM member_memory_atoms/i.test(sql)) return { rows: [memoryRow() as T] };
    return { rows: [] as T[] };
  };

  const loadRelationshipContext = async (_memberId: string, opts: { relationshipId?: string; allowRecentThreadFallback?: boolean }) => {
    if (opts.allowRecentThreadFallback !== false) throw new Error('recent fallback was enabled');
    if (opts.relationshipId !== RELATIONSHIP) return null;
    return {
      relationshipId: RELATIONSHIP, relationshipLabel: 'My relationship', realm: 'outer' as const,
      bondType: 'friend', mode: 'interpersonal' as const, salientThemes: ['repair'],
      currentTensions: ['distance'], continuitySignals: ['checkin'],
    };
  };

  return {
    query: query as ConnectedCabinExportAssemblyDeps['query'],
    loadRelationshipContext: loadRelationshipContext as ConnectedCabinExportAssemblyDeps['loadRelationshipContext'],
    ...overrides,
    _calls: calls,
  } as ConnectedCabinExportAssemblyDeps & { _calls: string[] };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.4 Connected Export Assembly', () => {
  it('F1 exports only explicitly selected ids and performs no ambient discovery', async () => {
    const d = deps();
    const result = await assembleConnectedCabinContextPackage(MEMBER, selection(), d);
    expect(result.works).toEqual([]);
    expect(result.relationships).toEqual([]);
    expect(result.memories).toEqual([]);
    expect((d as ConnectedCabinExportAssemblyDeps & { _calls: string[] })._calls).toHaveLength(0);
  });

  it('F2 requires member-owned Work and Memory rows', async () => {
    const d = deps({
      query: async <T>(sql: string) => ({
        rows: /living_works/i.test(sql) ? [] as T[] : [memoryRow() as T],
      }) as Promise<{ rows: T[] }>,
    });

    await expect(
      assembleConnectedCabinContextPackage(MEMBER, selection({ workIds: [WORK] }), d),
    ).rejects.toThrow(`CABIN_EXPORT_SELECTION_INVALID:work:${WORK}`);
  });

  it('F3 preserves every selected manuscript declaration without selecting one', async () => {
    const result = await assembleConnectedCabinContextPackage(MEMBER, selection({ workIds: [WORK] }), deps());
    expect(result.works[0].work.expressions.map((e) => e.expressionId)).toEqual([
      'manuscript-a',
      'manuscript-b',
    ]);
  });

  it('F4 carries only the bounded relationship identity from an explicit handoff', async () => {
    const result = await assembleConnectedCabinContextPackage(
      MEMBER, selection({ relationshipIds: [RELATIONSHIP] }), deps(),
    );
    expect(result.relationships[0]).toEqual({
      schema: 'soullab.cabin.relationship-reference.v1',
      source: { kind: 'member_relationships', id: RELATIONSHIP },
      permission: { scope: 'member', basis: 'explicit_handoff' },
      relationship: { id: RELATIONSHIP, label: 'My relationship', realm: 'outer', bondType: 'friend' },
    });
    expect(JSON.stringify(result.relationships[0])).not.toContain('salientThemes');
    expect(JSON.stringify(result.relationships[0])).not.toContain('distance');
  });

  it('F5 refuses a memory atom whose crossing flag is not canonically false', async () => {
    const d = deps({
      query: async <T>(sql: string) => ({
        rows: /member_memory_atoms/i.test(sql) ? [memoryRow({ crossing_allowed: true }) as T] : workRows() as T[],
      }) as Promise<{ rows: T[] }>,
    });

    await expect(
      assembleConnectedCabinContextPackage(MEMBER, selection({ memoryIds: [MEMORY] }), d),
    ).rejects.toThrow(`CABIN_EXPORT_SELECTION_INVALID:memory:${MEMORY}`);
  });

  it('F6 preserves member_pulled as a non-ambient memory standing and rejects rejected memory', async () => {
    const result = await assembleConnectedCabinContextPackage(MEMBER, selection({ memoryIds: [MEMORY] }), deps());
    expect(result.memories[0].recall).toEqual({ standing: 'member_pulled', basis: 'return_preference' });

    const rejectedDeps = deps({
      query: async <T>(sql: string) => ({
        rows: /member_memory_atoms/i.test(sql) ? [memoryRow({ id: MEMORY_REJECTED, member_response_status: 'rejected' }) as T] : workRows() as T[],
      }) as Promise<{ rows: T[] }>,
    });
    await expect(
      assembleConnectedCabinContextPackage(MEMBER, selection({ memoryIds: [MEMORY_REJECTED] }), rejectedDeps),
    ).rejects.toThrow(`CABIN_EXPORT_SELECTION_INVALID:memory:${MEMORY_REJECTED}`);
  });

  it('F6 never manufactures synthesis, relevance, questions, transitions, or graph edges', async () => {
    const result = await assembleConnectedCabinContextPackage(
      MEMBER, selection({ workIds: [WORK], relationshipIds: [RELATIONSHIP], memoryIds: [MEMORY] }), deps(),
    );
    const serialized = JSON.stringify(result);
    for (const forbidden of ['relevance', 'score', 'rank', 'synthesis', 'questions', 'transitions', 'edges', 'currentWork']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F7 does not mutate source rows during assembly', async () => {
    const rows = workRows();
    const before = structuredClone(rows);
    const d = deps({
      query: async <T>(sql: string) => ({
        rows: /living_works/i.test(sql) ? rows as T[] : [memoryRow() as T],
      }) as Promise<{ rows: T[] }>,
    });
    await assembleConnectedCabinContextPackage(MEMBER, selection({ workIds: [WORK] }), d);
    expect(rows).toEqual(before);
  });

  it('F8 carries no member/session/browser identity', async () => {
    const result = await assembleConnectedCabinContextPackage(
      MEMBER, selection({ workIds: [WORK], relationshipIds: [RELATIONSHIP], memoryIds: [MEMORY] }), deps(),
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(MEMBER);
    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('localStorage');
  });

  it('F9 rejects the entire selection when any selected item is absent', async () => {
    const d = deps({
      query: async <T>(sql: string) => ({
        rows: /living_works/i.test(sql) ? workRows() as T[] : [memoryRow() as T],
      }) as Promise<{ rows: T[] }>,
    });
    const missing = '00000000-0000-4000-8000-000000000099';
    await expect(
      assembleConnectedCabinContextPackage(MEMBER, selection({ workIds: [WORK, missing] }), d),
    ).rejects.toThrow(`CABIN_EXPORT_SELECTION_INVALID:work:${missing}`);
  });

  it('F10 keeps H3.3 as the only artifact writer', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'lib/cabin/connectedExportAssembly.ts'), 'utf8');
    expect(source).not.toContain('contextPackageWriter');
    expect(source).not.toMatch(/\b(INSERT|UPDATE|DELETE|UPSERT|TRUNCATE)\b/i);
    expect(source).not.toMatch(/writeFile|renameSync|appendFile|unlink|rmSync/);
    expect(source).not.toMatch(/fetch\(|https?:\/\//);
  });

  it('accepts duplicate explicit ids without duplicating the portable reference', async () => {
    const result = await assembleConnectedCabinContextPackage(
      MEMBER, selection({ workIds: [WORK, WORK] }), deps(),
    );
    expect(result.works).toHaveLength(1);
  });
});