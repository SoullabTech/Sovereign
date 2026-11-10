/**
 * WS-DELETE-01 retained editorial threads — the orphaned-origin gate (founder-chosen option b-narrow, 2026-11-08), HERMETIC.
 *
 * The physical truth (real PostgreSQL 16, real routes) is `tests/constitutional/ws-delete/dynamic/retainedEditorial.probe.test.ts`.
 * This file holds the shape of the decisions where no database is needed: that the refusal comes BEFORE any permission exists and
 * before the other guards, that the list and the adoption share ONE definition of an orphan, that undo is not gated, and that a
 * stranger's thread never reaches the check. A '(textual guard)' test reads source text: it defends a structure, not a behaviour.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const seen: Array<{ sql: string; params: unknown[] }> = [];
let threadRows: Array<Record<string, unknown>> = [];
let orphaned = false;
let orphanedRows: Array<Record<string, unknown>> | null = null;
const authorizeVersion = jest.fn(async () => ({ ok: false as const, reason: 'chain_unknown' as const }));
const executeAuthorization = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[]) => {
    seen.push({ sql, params });
    if (/ORDER BY th\.opened_at ASC/.test(sql)) return { rows: [] };                 // the relationships list
    if (/FROM ask_threads th\s+LEFT JOIN proposal_chains/.test(sql)) return { rows: threadRows };
    if (/AS orphaned/.test(sql)) return { rows: orphanedRows ?? [{ orphaned }] };
    if (/FROM proposal_versions/.test(sql)) return { rows: [{ formulation: 'a plain replacement' }] };
    return { rows: [] };
  }),
}));
jest.mock('@/lib/manuscript/revisionAuthorization/store', () => ({ authorizeVersion: (...a: unknown[]) => (authorizeVersion as any)(...a) }));
jest.mock('@/lib/manuscript/revisionAuthorization/execute', () => ({ executeAuthorization: (...a: unknown[]) => (executeAuthorization as any)(...a) }));
jest.mock('@/lib/manuscript/revisionAuthorization/status', () => ({ readAuthorizationStatus: jest.fn(async () => null) }));

import { adoptVersion } from '../adoption';
import { editorialRelationshipsForSection } from '../relationships';
import { orphanedOriginSql, threadOriginIsOrphaned } from '@/lib/writers-studio/orphanedEditorialOrigin';

const ME = '11111111-1111-4111-8111-111111111111';
const THREAD = '22222222-2222-4222-8222-222222222222';
const VERSION = '33333333-3333-4333-8333-333333333333';
const CHAIN = '44444444-4444-4444-8444-444444444444';
const identity = { status: 'verified', memberId: ME, memberRef: 'ref' } as never;
const adopt = () => adoptVersion({ identity, threadId: THREAD, versionId: VERSION });
const root = join(__dirname, '..', '..', '..', '..');

beforeEach(() => {
  seen.length = 0; orphaned = false; orphanedRows = null;
  threadRows = [{ proposal_chain_id: CHAIN, expected_text: 'A plain passage.', heading: null }];
  authorizeVersion.mockClear(); executeAuthorization.mockClear();
});

describe('adoption: an orphaned origin is refused before anything is minted', () => {
  it('GATE-1 an orphaned thread answers relationship_refusal / origin_unavailable', async () => {
    orphaned = true;
    expect(await adopt()).toEqual({ kind: 'relationship_refusal', reason: 'origin_unavailable' });
  });

  it('GATE-2 ...and NEITHER act runs: no permission is minted and nothing is executed', async () => {
    orphaned = true;
    await adopt();
    expect(authorizeVersion).not.toHaveBeenCalled();
    expect(executeAuthorization).not.toHaveBeenCalled();
  });

  it('GATE-3 ...and the other guards never ran: no proposal_versions read (the quotation guard) happened first', async () => {
    orphaned = true;
    await adopt();
    expect(seen.some((q) => /FROM proposal_versions/.test(q.sql))).toBe(false);
  });

  it('GATE-4 a thread that is NOT orphaned reaches act 1 exactly as before', async () => {
    orphaned = false;
    const out = await adopt();
    expect(authorizeVersion).toHaveBeenCalledTimes(1);
    expect(authorizeVersion).toHaveBeenCalledWith(ME, CHAIN, VERSION);
    expect(out).toEqual({ kind: 'relationship_refusal', reason: 'chain_unknown' });   // what the stubbed store said, passed through untouched
  });

  it('GATE-5 the check comes AFTER the member-scoped thread lookup: a thread that is not the member\'s never reaches it', async () => {
    threadRows = [];
    orphaned = true;
    expect(await adopt()).toEqual({ kind: 'relationship_refusal', reason: 'thread_not_found' });
    expect(seen.some((q) => /AS orphaned/.test(q.sql))).toBe(false);
  });

  it('GATE-6 a thread with no proposal chain (not editorial) is still not_editorial, not an origin question', async () => {
    threadRows = [{ proposal_chain_id: null, expected_text: null, heading: null }];
    orphaned = true;
    expect(await adopt()).toEqual({ kind: 'relationship_refusal', reason: 'not_editorial' });
    expect(seen.some((q) => /AS orphaned/.test(q.sql))).toBe(false);
  });

  it('GATE-7 the orphan question is asked for THIS member and THIS thread, in that order', async () => {
    await adopt();
    const ask = seen.find((q) => /AS orphaned/.test(q.sql))!;
    expect(ask.params).toEqual([ME, THREAD]);
  });
});

describe('one definition of an orphan, shared by the list and the adoption', () => {
  it('GATE-8 the predicate asks for an origin row AND the absence of its relationship, nothing more', () => {
    const sql = orphanedOriginSql('th.id').replace(/\s+/g, ' ');
    expect(sql).toContain('FROM writer_editorial_thread_origins o WHERE o.thread_id = th.id');
    expect(sql).toContain('AND NOT EXISTS ( SELECT 1 FROM writer_editorial_relationships r WHERE r.id = o.relationship_id AND r.member_id = o.member_id)');
    // ⛔ not the strict lock: no declaration, draft or Work row is part of this definition (a declared gap, RT-10).
    expect(sql).not.toMatch(/living_work_expressions|manuscript_working_drafts|living_works/);
  });

  it('GATE-9 the list embeds that same predicate, negated', async () => {
    await editorialRelationshipsForSection(identity, '55555555-5555-4555-8555-555555555555');
    const listSql = seen[0]!.sql.replace(/\s+/g, ' ');
    expect(listSql).toContain(`AND NOT ${orphanedOriginSql('th.id').replace(/\s+/g, ' ')}`);
  });

  it('GATE-10 the thread reference is spliced into SQL text, so anything but a column or a parameter is refused', () => {
    expect(() => orphanedOriginSql('th.id; DROP TABLE x')).toThrow();
    expect(() => orphanedOriginSql("'x' OR 1=1")).toThrow();
    expect(() => orphanedOriginSql('th.id')).not.toThrow();
    expect(() => orphanedOriginSql('$2')).not.toThrow();
  });

  it('GATE-11 threadOriginIsOrphaned reads only a definite true: an absent thread or an unanswered row is not an orphan', async () => {
    orphaned = true;
    expect(await threadOriginIsOrphaned(ME, THREAD)).toBe(true);
    orphaned = false;
    expect(await threadOriginIsOrphaned(ME, THREAD)).toBe(false);
  });

  it('GATE-11b an UNANSWERED value (null) is not an orphan: it must not be read as one', async () => {
    orphanedRows = [{ orphaned: null }];
    expect(await threadOriginIsOrphaned(ME, THREAD)).toBe(false);
    orphanedRows = [{}];
    expect(await threadOriginIsOrphaned(ME, THREAD)).toBe(false);
  });

  it('GATE-11c a thread that is not the member\'s (no row at all) is not an orphan: the lookup, not this check, refuses a stranger', async () => {
    orphanedRows = [];
    expect(await threadOriginIsOrphaned(ME, THREAD)).toBe(false);
  });
});

describe('what is deliberately NOT gated', () => {
  // Comments are stripped before any scan: a header that documents what the code does NOT do must not read as the code doing it
  // (the same lesson as the Circle verifier's C21: a prose ban must never be matched as the banned behaviour returning).
  const read = (f: string) => readFileSync(join(root, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it('GATE-12 (textual guard) undo does not consult the orphan definition: it restores the member\'s own earlier bytes and stays open', () => {
    expect(read('lib/manuscript/editorialRuntime/recovery.ts')).not.toMatch(/orphanedEditorialOrigin|threadOriginIsOrphaned|orphanedOriginSql/);
    expect(read('app/api/writers-studio/editorial/undo/route.ts')).not.toMatch(/orphanedEditorialOrigin|origin_unavailable/);
  });

  it('GATE-13 (textual guard) the ask route\'s ?thread= read does not consult it either (declared: option c is its door)', () => {
    expect(read('app/api/sovereign/manuscripts/[id]/ask/route.ts')).not.toMatch(/orphanedEditorialOrigin|threadOriginIsOrphaned/);
  });

  it('GATE-14 (textual guard) the definition adds no strict-lock dependency and no request field: the adoption body stays two keys', () => {
    expect(read('app/api/writers-studio/editorial/adoption/route.ts')).toContain("const BODY_KEYS = ['threadId', 'versionId'] as const;");
    expect(read('lib/writers-studio/orphanedEditorialOrigin.ts')).not.toMatch(/lockCurrentEditorialOriginWithClient/);
  });
});
