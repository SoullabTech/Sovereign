/** @jest-environment node */
/**
 * JARVIS read-only fictional compatibility witness for CURRENT section-native
 * and legacy continuous-draft contracts. Not an approval for real member data.
 *
 * The historical route fixtures omit `section_addressable_at` and POST's
 * server-minted section readback. These cases supply each required fact
 * explicitly and prove only the current mocked route behavior.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => {
  const query = jest.fn();
  return {
    query,
    transaction: jest.fn(async (run: (tx: { query: unknown }) => unknown) =>
      run({ query })),
  };
});
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  computeSourceHash: jest.fn(() => 'fiction-source-hash'),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { composeDraftSlices } from '@/lib/manuscript/draftSections';
import { POST as createDraft, GET as readDraft, PUT as saveDraft } from '../route';
import { POST as restoreDraft } from '../revisions/route';

const id = '22222222-2222-2222-2222-222222222222';
const member = '11111111-1111-1111-1111-111111111111';
const draft = '33333333-3333-3333-3333-333333333333';
const sourceId = '44444444-4444-4444-4444-444444444444';
const sectionId = '55555555-5555-5555-5555-555555555555';
const guard = { baseRevisionId: 7, idempotencyKey: 'fiction-idempotency-key' };
const context = { params: Promise.resolve({ id }) };
const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;

type MockResult = { rows: Record<string, unknown>[]; rowCount: number };
const rows = (...values: Record<string, unknown>[]): MockResult =>
  ({ rows: values, rowCount: values.length });
const empty = () => rows();
const request = (method: string, path = 'draft', body?: unknown) =>
  new NextRequest('http://fiction.invalid/api/sovereign/manuscripts/' + id +
    '/draft' + (path === 'revisions' ? '/revisions' : ''), {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const source = [{ id: sourceId, heading: 'Imaginary chapter', body: 'Lantern 🜂 in the river.\r\n' }];
const composed = composeDraftSlices(source);
const sections = [{ id: sectionId, text: composed.slices[0]!.text }];
const receipt = { revisionCount: 3, revisionId: 8, updatedAt: 'fiction-time', checkpointed: false };

beforeEach(() => {
  mockAuth.mockReset();
  mockAuth.mockResolvedValue(member);
  mockQuery.mockReset();
  mockTransaction.mockClear();
});

describe('Current draft route vs historical mock-architecture contract', () => {
  it('opens new section-native draft and actually rereads its minted sections BEFORE first revision', async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM member_manuscripts')) return rows({ id });
      if (sql.includes('FROM manuscript_working_drafts')) return empty();
      if (sql.includes('FROM manuscript_sections')) return rows(source[0]!);
      if (sql.includes('INSERT INTO manuscript_working_drafts')) return rows({ id: draft });
      if (sql.includes('INSERT INTO manuscript_draft_sections')) return rows({});
      if (sql.includes('SELECT id, text FROM manuscript_draft_sections')) return rows(sections[0]!);
      if (sql.includes('INSERT INTO working_draft_revisions')) return rows({});
      throw Error('Unanticipated fictional query in source creation: ' + sql);
    });
    const answer = await createDraft(request('POST'), context);
    expect(answer.status).toBe(201);
    const body = await answer.json();
    expect(body).toMatchObject({ id: draft, manuscriptId: id, revisionCount: 1,
      revisionId: 1, sectionAddressable: true, baseSourceHash: 'fiction-source-hash' });
    expect(body.sections).toEqual(sections);
    expect(body.content).toBe(composed.content);
    const queries = mockQuery.mock.calls.map(([sql]) => String(sql));
    const minted = queries.findIndex(q => q.includes('INSERT INTO manuscript_draft_sections'));
    const reread = queries.findIndex(q => q.includes('SELECT id, text FROM manuscript_draft_sections'));
    const version = queries.findIndex(q => q.includes('INSERT INTO working_draft_revisions'));
    expect(minted).toBeGreaterThan(-1);
    expect(minted).toBeLessThan(reread);
    expect(reread).toBeLessThan(version);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('loads a real section-addressable draft with exact server-minted sections', async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM manuscript_working_drafts')) return rows({
        id: draft, content: composed.content, base_source_hash: 'fiction-hash',
        revision_count: 3, version: '7', section_addressable_at: 'fiction-created',
        created_at: 'fiction-created', updated_at: 'fiction-now',
      });
      if (sql.includes('FROM manuscript_draft_sections')) return rows(sections[0]!);
      throw Error('Unanticipated section load');
    });
    const answer = await readDraft(request('GET'), context);
    expect(answer.status).toBe(200);
    expect(await answer.json()).toMatchObject({
      sectionAddressable: true, sections, revisionId: 7, content: composed.content,
    });
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('loads an explicitly non-section-addressable legacy draft WITHOUT inventing section IDs', async () => {
    mockQuery.mockResolvedValueOnce(rows({
      id: draft, content: 'fiction continuous prose', base_source_hash: 'fiction-hash',
      revision_count: 3, version: '7', section_addressable_at: null,
      created_at: 'fiction-created', updated_at: 'fiction-now',
    }));
    const answer = await readDraft(request('GET'), context);
    expect(answer.status).toBe(200);
    const value = await answer.json();
    expect(value.sectionAddressable).toBe(false);
    expect('sections' in value).toBe(false);
    expect(value.content).toBe('fiction continuous prose');
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('legacy invalid content still refuses 400 without mutation; the old mock must specify section_addressable_at:null', async () => {
    mockQuery.mockResolvedValueOnce(rows({
      id: draft, version: '7', section_addressable_at: null,
      last_idempotency_key: null, last_idempotency_op: null,
      last_idempotency_payload_hash: null, last_idempotency_response: null,
    }));
    const answer = await saveDraft(request('PUT','draft',{ content: 42,...guard }), context);
    expect(answer.status).toBe(400);
    expect(await answer.json()).toMatchObject({ error: 'content must be a string' });
    expect(mockQuery.mock.calls.map(([sql]) => String(sql)).some(s => /UPDATE|INSERT/.test(s))).toBe(false);
  });

  it('ordinary legacy content save uses the locked/guarded current version and does not write revisions', async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT id, version, section_addressable_at')) return rows({
        id: draft, version: '7', section_addressable_at: null,
        last_idempotency_key: null, last_idempotency_op: null,
        last_idempotency_payload_hash: null, last_idempotency_response: null,
      });
      if (sql.includes('UPDATE manuscript_working_drafts')) return rows({
        revision_count: 3, version: 8, last_idempotency_response: receipt,
      });
      throw Error('Unanticipated legacy save query');
    });
    const answer = await saveDraft(request('PUT','draft',{ content: 'My own fictional wording 🜂',...guard }), context);
    expect(answer.status).toBe(200);
    expect(await answer.json()).toEqual(receipt);
    expect(mockQuery.mock.calls).toHaveLength(2);
    const update = mockQuery.mock.calls.find(([sql]) => String(sql).includes('UPDATE manuscript_working_drafts'));
    expect(update?.[1]).toContain(guard.baseRevisionId);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO working_draft_revisions'))).toBe(false);
  });

  it('legacy stale-base refuses BEFORE UPDATE even with exact valid member/source', async () => {
    mockQuery.mockResolvedValueOnce(rows({
      id: draft, version: 9, section_addressable_at: null,
      last_idempotency_key: null, last_idempotency_op: null,
      last_idempotency_payload_hash: null, last_idempotency_response: null,
    }));
    const answer = await saveDraft(request('PUT','draft',{ content: 'stale fictional edit',...guard }), context);
    expect(answer.status).toBe(409);
    expect(await answer.json()).toMatchObject({ reason: 'stale_base', currentRevisionId: 9 });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('converted section-native draft refuses a legacy content-only PUT before any SQL write', async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT id, version, section_addressable_at')) return rows({
        id: draft, version: '7', section_addressable_at: 'fiction-created',
        last_idempotency_key: null, last_idempotency_op: null,
        last_idempotency_payload_hash: null, last_idempotency_response: null,
      });
      if (sql.includes('FOR UPDATE')) return rows({
        version: '7', last_idempotency_key: null, last_idempotency_op: null,
        last_idempotency_payload_hash: null, last_idempotency_response: null,
      });
      if (sql.includes('FROM manuscript_draft_sections')) return rows(sections[0]!);
      throw Error('Unexpected write during section-only content refusal');
    });
    const answer = await saveDraft(request('PUT','draft',{ content:'a guess from client',...guard }), context);
    expect(answer.status).toBe(409);
    expect(await answer.json()).toMatchObject({ refusal: 'section_state_required' });
    // SELECT ... FOR UPDATE is a protective row lock, not a SQL mutation.
    expect(mockQuery.mock.calls.every(([sql]) => !/^\s*(INSERT|UPDATE|DELETE)\b/i.test(String(sql)))).toBe(true);
  });

  it('legacy restore appends a new revision rather than rewriting older stored history', async () => {
    const restored = {
      revisionCount: 4, revisionId: 8, restoredFrom: 2,
      updatedAt: 'fiction-restored-now',
    };
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT id, version, section_addressable_at') ||
          (sql.includes('FROM manuscript_working_drafts') && sql.includes('FOR UPDATE'))) return rows({
        id: draft, version: '7', section_addressable_at: null,
        last_idempotency_key: null, last_idempotency_op: null,
        last_idempotency_payload_hash: null, last_idempotency_response: null,
      });
      if (sql.includes('SELECT content FROM working_draft_revisions')) return rows({
        content: 'fiction old saved text',
      });
      if (sql.includes('UPDATE manuscript_working_drafts')) return rows({
        revision_count: 4, last_idempotency_response: restored,
      });
      if (sql.includes('INSERT INTO working_draft_revisions')) return rows({});
      throw Error('Unanticipated legacy restore SQL');
    });
    const answer = await restoreDraft(request('POST','revisions',{ revisionNumber:2,...guard }),context);
    expect(answer.status).toBe(200);
    expect(await answer.json()).toEqual(restored);
    const sqlStatements = mockQuery.mock.calls.map(([sql]) => String(sql));
    expect(sqlStatements.filter(s => s.includes('INSERT INTO working_draft_revisions'))).toHaveLength(1);
    expect(sqlStatements.some(s => /UPDATE\s+working_draft_revisions|DELETE\s+FROM\s+working_draft_revisions/.test(s))).toBe(false);
  });

  it('legacy restore stale-base refuses without fetching prior Source or changing revisions', async () => {
    const lockedGuard = rows({
      id: draft, version: '9', section_addressable_at: null,
      last_idempotency_key: null, last_idempotency_op: null,
      last_idempotency_payload_hash: null, last_idempotency_response: null,
    });
    mockQuery.mockResolvedValueOnce(lockedGuard).mockResolvedValueOnce(lockedGuard);
    const answer = await restoreDraft(request('POST','revisions',{ revisionNumber:2,...guard }),context);
    expect(answer.status).toBe(409);
    expect(await answer.json()).toMatchObject({ reason:'stale_base', currentRevisionId:9 });
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('working_draft_revisions'))).toBe(false);
  });

  it('legacy restore refuses a missing history revision without changing writing', async () => {
    const lockedGuard = rows({
      id: draft, version:'7', section_addressable_at:null,
      last_idempotency_key:null, last_idempotency_op:null,
      last_idempotency_payload_hash:null, last_idempotency_response:null,
    });
    mockQuery.mockResolvedValueOnce(lockedGuard).mockResolvedValueOnce(lockedGuard)
      .mockResolvedValueOnce(empty());
    const answer = await restoreDraft(request('POST','revisions',{ revisionNumber:2,...guard }),context);
    expect(answer.status).toBe(404);
    expect(await answer.json()).toEqual({ error: 'Revision not found' });
    expect(mockQuery).toHaveBeenCalledTimes(3);
  });

  it('both current draft and restore routes reject an absent member before touching SQL', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await readDraft(request('GET'),context)).status).toBe(401);
    expect((await saveDraft(request('PUT','draft',{content:'fiction',...guard}),context)).status).toBe(401);
    expect((await restoreDraft(request('POST','revisions',{revisionNumber:2,...guard}),context)).status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
