/**
 * Work-scoped Start writing — deterministic concurrency and rollback witness.
 * Fictional identities and an in-memory transactional database only.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn() }));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  computeSourceHash: jest.fn(() => 'fictional-empty-source-hash'),
}));
jest.mock('@/lib/manuscript/draftSections', () => ({
  partitionFromSections: jest.fn((sections: Array<{ id: string; text: string }>) => ({
    version: 1, boundaries: sections.map((s) => ({ id: s.id, length: s.text.length })),
  })),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { transaction } from '@/lib/db/postgres';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockTransaction = transaction as jest.Mock;
const MEMBER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '99999999-9999-4999-8999-999999999999';
const WORK_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const WORK_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const WORK_FOREIGN = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

const tick = () => new Promise((resolve) => setImmediate(resolve));
function mutex() {
  let tail: Promise<void> = Promise.resolve();
  return async () => {
    let release!: () => void;
    const mine = new Promise<void>((resolve) => { release = resolve; });
    const before = tail;
    tail = tail.then(() => mine);
    await before;
    return release;
  };
}

type Work = { id: string; member_id: string };
type Manuscript = { id: string; member_id: string; title: string | null; provenance: string };
type Draft = { id: string; manuscript_id: string; member_id: string; content: string; version: number; section_addressable_at: Date | null };
type Expression = { id: string; living_work_id: string; expression_type: string; expression_id: string; declared_by: string; declared_at: Date };

function makeDb() {
  const works: Work[] = [
    { id: WORK_A, member_id: MEMBER },
    { id: WORK_B, member_id: MEMBER },
    { id: WORK_FOREIGN, member_id: FOREIGN },
  ];
  const manuscripts: Manuscript[] = [];
  const drafts: Draft[] = [];
  const sections: Array<{ id: string; draft_id: string; text: string }> = [];
  const revisions: Array<{ draft_id: string; content: string; saved_by: string }> = [];
  const expressions: Expression[] = [];
  const statements: string[] = [];
  const workLocks = new Map<string, ReturnType<typeof mutex>>();
  let sequence = 0;
  let failDeclaration = false;
  const id = (kind: string) => {
    sequence += 1;
    const suffix = sequence.toString(16).padStart(12, '0');
    const prefix = kind === 'ms' ? '22222222' : kind === 'draft' ? '33333333' : kind === 'section' ? '44444444' : '55555555';
    return `${prefix}-0000-4000-8000-${suffix}`;
  };

  const runTransaction = async (callback: (client: { query: Function }) => Promise<unknown>) => {
    let release: (() => void) | null = null;
    let snapshot: null | { manuscripts: Manuscript[]; drafts: Draft[]; sections: typeof sections; revisions: typeof revisions; expressions: Expression[] } = null;
    const ensureSnapshot = () => {
      snapshot ??= {
        manuscripts: manuscripts.map((x) => ({ ...x })),
        drafts: drafts.map((x) => ({ ...x })),
        sections: sections.map((x) => ({ ...x })),
        revisions: revisions.map((x) => ({ ...x })),
        expressions: expressions.map((x) => ({ ...x })),
      };
    };
    const restore = () => {
      if (!snapshot) return;
      manuscripts.splice(0, manuscripts.length, ...snapshot.manuscripts);
      drafts.splice(0, drafts.length, ...snapshot.drafts);
      sections.splice(0, sections.length, ...snapshot.sections);
      revisions.splice(0, revisions.length, ...snapshot.revisions);
      expressions.splice(0, expressions.length, ...snapshot.expressions);
    };

    const client = {
      query: async (sql: string, params: unknown[] = []) => {
        await tick();
        const normalized = sql.replace(/\s+/g, ' ').trim();
        statements.push(normalized);

        if (normalized.includes('SELECT id FROM living_works') && normalized.includes('FOR UPDATE')) {
          const workId = String(params[0]);
          const acquire = workLocks.get(workId) ?? mutex();
          workLocks.set(workId, acquire);
          release = await acquire();
          const row = works.find((w) => w.id === workId && w.member_id === params[1]);
          return { rows: row ? [{ id: row.id }] : [] };
        }
        if (normalized.includes('FROM living_work_expressions e') && normalized.includes('JOIN member_manuscripts m')) {
          const [workId, memberId] = params.map(String);
          const rows = expressions
            .filter((e) => e.living_work_id === workId && e.expression_type === 'manuscript' && e.declared_by === memberId)
            .map((e) => {
              const manuscript = manuscripts.find((m) => m.id === e.expression_id && m.member_id === memberId)!;
              const draft = drafts.find((d) => d.manuscript_id === manuscript?.id && d.member_id === memberId);
              return {
                manuscript_id: manuscript?.id,
                draft_id: draft?.id ?? null,
                provenance: manuscript?.provenance,
                title: manuscript?.title ?? null,
                content: draft?.content ?? null,
                version: draft?.version ?? null,
                section_addressable_at: draft?.section_addressable_at ?? null,
              };
            });
          return { rows };
        }
        if (normalized.includes('INSERT INTO member_manuscripts')) {
          ensureSnapshot();
          const row = { id: id('ms'), member_id: String(params[0]), title: null, provenance: 'member_written' };
          manuscripts.push(row);
          return { rows: [{ id: row.id }] };
        }
        if (normalized.includes('INSERT INTO manuscript_working_drafts')) {
          ensureSnapshot();
          const row = { id: id('draft'), manuscript_id: String(params[0]), member_id: String(params[1]), content: '', version: 1, section_addressable_at: new Date('2026-10-20T00:00:00Z') };
          drafts.push(row);
          return { rows: [{ id: row.id }] };
        }
        if (normalized.includes('INSERT INTO manuscript_draft_sections')) {
          ensureSnapshot();
          const row = { id: id('section'), draft_id: String(params[0]), text: '' };
          sections.push(row);
          return { rows: [{ id: row.id }] };
        }
        if (normalized.includes('INSERT INTO working_draft_revisions')) {
          ensureSnapshot();
          revisions.push({ draft_id: String(params[0]), content: '', saved_by: String(params[1]) });
          return { rows: [], rowCount: 1 };
        }
        if (normalized.includes('INSERT INTO living_work_expressions')) {
          ensureSnapshot();
          if (failDeclaration) throw new Error('fictional declaration failure');
          const row = { id: id('expression'), living_work_id: String(params[0]), expression_type: 'manuscript', expression_id: String(params[1]), declared_by: String(params[2]), declared_at: new Date('2026-10-20T00:00:00Z') };
          expressions.push(row);
          return { rows: [{ id: row.id }] };
        }
        throw new Error(`Unexpected fictional SQL: ${normalized}`);
      },
    };

    try {
      return await callback(client);
    } catch (error) {
      restore();
      throw error;
    } finally {
      release?.();
    }
  };

  return { works, manuscripts, drafts, sections, revisions, expressions, statements,
    setDeclarationFailure(value: boolean) { failDeclaration = value; }, runTransaction };
}

const request = (workId: string) => new NextRequest(
  `https://soullab.life/api/sovereign/living-works/${workId}/start-writing`,
  { method: 'POST' },
);
const context = (workId: string) => ({ params: Promise.resolve({ id: workId }) });

let db: ReturnType<typeof makeDb>;
beforeEach(() => {
  jest.clearAllMocks();
  db = makeDb();
  mockAuth.mockResolvedValue(MEMBER);
  mockTransaction.mockImplementation(db.runTransaction);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('POST Work-scoped Start writing', () => {
  it('refuses an unauthenticated request before opening a transaction', async () => {
    mockAuth.mockResolvedValue(null);
    const response = await POST(request(WORK_A), context(WORK_A));
    expect(response.status).toBe(401);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('refuses a foreign Work without revealing whether it exists', async () => {
    const response = await POST(request(WORK_FOREIGN), context(WORK_FOREIGN));
    expect(response.status).toBe(404);
    expect(db.manuscripts).toHaveLength(0);
    expect(db.expressions).toHaveLength(0);
  });

  it('serializes two requests for one Work and returns one exact blank manuscript', async () => {
    const [a, b] = await Promise.all([
      POST(request(WORK_A), context(WORK_A)),
      POST(request(WORK_A), context(WORK_A)),
    ]);
    const [left, right] = await Promise.all([a.json(), b.json()]);
    expect([a.status, b.status].sort()).toEqual([200, 201]);
    expect(a.headers.get('cache-control')).toContain('no-store');
    expect(b.headers.get('cache-control')).toContain('no-store');
    expect(left.id).toBe(right.id);
    expect(db.manuscripts).toHaveLength(1);
    expect(db.expressions).toHaveLength(1);
    expect(db.expressions[0]).toMatchObject({ living_work_id: WORK_A, expression_id: left.id });
  });

  it('keeps simultaneous independent Work A and Work B starts on distinct manuscripts', async () => {
    const [a, b] = await Promise.all([
      POST(request(WORK_A), context(WORK_A)),
      POST(request(WORK_B), context(WORK_B)),
    ]);
    const [left, right] = await Promise.all([a.json(), b.json()]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    expect(left.id).not.toBe(right.id);
    expect(db.manuscripts).toHaveLength(2);
    expect(db.expressions).toEqual(expect.arrayContaining([
      expect.objectContaining({ living_work_id: WORK_A, expression_id: left.id }),
      expect.objectContaining({ living_work_id: WORK_B, expression_id: right.id }),
    ]));
  });

  it('returns the same untouched page on a sequential retry for that exact Work', async () => {
    const first = await POST(request(WORK_A), context(WORK_A));
    const one = await first.json();
    const retry = await POST(request(WORK_A), context(WORK_A));
    const two = await retry.json();
    expect(first.status).toBe(201);
    expect(retry.status).toBe(200);
    expect(two.id).toBe(one.id);
    expect(db.manuscripts).toHaveLength(1);
  });

  it('refuses a direct Start writing call when the Work already contains written manuscript material', async () => {
    db.manuscripts.push({ id: '77777777-0000-4000-8000-000000000001', member_id: MEMBER, title: null, provenance: 'member_written' });
    db.drafts.push({ id: '77777777-0000-4000-8000-000000000002', manuscript_id: '77777777-0000-4000-8000-000000000001', member_id: MEMBER, content: 'already writing', version: 2, section_addressable_at: new Date() });
    db.expressions.push({ id: '77777777-0000-4000-8000-000000000003', living_work_id: WORK_A, expression_type: 'manuscript', expression_id: '77777777-0000-4000-8000-000000000001', declared_by: MEMBER, declared_at: new Date() });
    const response = await POST(request(WORK_A), context(WORK_A));
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(db.manuscripts).toHaveLength(1);
  });

  it('rolls back the manuscript, draft, section and revision if declaration persistence fails', async () => {
    db.setDeclarationFailure(true);
    const response = await POST(request(WORK_A), context(WORK_A));
    expect(response.status).toBe(500);
    expect(db.manuscripts).toHaveLength(0);
    expect(db.drafts).toHaveLength(0);
    expect(db.sections).toHaveLength(0);
    expect(db.revisions).toHaveLength(0);
    expect(db.expressions).toHaveLength(0);
  });

  it('does not read or copy Idea, Source, materials or imported manuscript sections', async () => {
    expect((await POST(request(WORK_A), context(WORK_A))).status).toBe(201);
    const sql = db.statements.join('\n');
    expect(sql).not.toContain('member_ideas');
    expect(sql).not.toContain('source_upload');
    expect(sql).not.toContain('manuscript_sections ');
    expect(sql).not.toContain('practitioner_files');
  });
});
