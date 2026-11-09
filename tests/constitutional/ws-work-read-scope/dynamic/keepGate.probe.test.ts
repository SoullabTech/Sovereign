/**
 * Sanctuary closure across every Writer's Studio write of something MAIA keeps (founder ruling 2026-11-09, third).
 * REAL routes, REAL PostgreSQL. Each route, in Sanctuary or with an undeclared posture, must answer 409 with its reason and change no
 * row in any table it could write. Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional rows only.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: async () => { throw new Error('MAIA must not be called in this probe'); } }));
const d = ON ? describe : describe.skip;

const TABLES = ['writer_studio_corrections', 'living_work_writer_understanding', 'writer_studio_chapter_review_runs', 'development_plans',
  'development_plan_history', 'development_plan_step_links', 'manuscript_structure_proposals', 'writer_studio_work_themes',
  'writer_decision_events', 'ask_threads', 'ask_turns', 'developmental_readings'];

d('every MAIA-kept write refuses in Sanctuary or undeclared, and writes nothing', () => {
  let A = '', work = '', ms = '';
  const snapshot = async () => {
    const out: Record<string, string> = {};
    for (const t of TABLES) {
      // Scoped to this probe's member so parallel suites cannot disturb the count.
      const scoped = t === 'ask_turns'
        ? `SELECT COUNT(*)::text n FROM ask_turns x JOIN ask_threads h ON h.id = x.thread_id WHERE h.member_id = $1 AND $2::uuid IS NOT NULL`
        : t === 'development_plan_history'
          ? `SELECT COUNT(*)::text n FROM development_plan_history x JOIN development_plans p ON p.id = x.plan_id WHERE p.member_id = $1 AND $2::uuid IS NOT NULL`
          : t === 'manuscript_structure_proposals'
            ? `SELECT COUNT(*)::text n FROM manuscript_structure_proposals WHERE manuscript_id = $2 AND $1::uuid IS NOT NULL`
            : `SELECT COUNT(*)::text n FROM ${t} WHERE member_id = $1 AND $2::uuid IS NOT NULL`;
      out[t] = (await query<{ n: string }>(scoped, [A, ms])).rows[0]!.n;   // ⛔ no catch: a count that cannot be taken fails the probe
    }
    return out;
  };
  const call = async (path: string, method: string, params: Record<string, string>, body: Record<string, unknown>) => {
    CURRENT = A;
    const mod = await import(`@/app/api/${path}/route`) as Record<string, (r: NextRequest, c: unknown) => Promise<Response>>;
    const res = await mod[method]!(new NextRequest('http://localhost/x', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      { params: Promise.resolve(params) });
    return { status: res.status, json: await res.json().catch(() => ({})) as Record<string, unknown> };
  };

  beforeAll(async () => {
    A = (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`kg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
    work = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Gate probe') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Gate probe') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [work, ms, A]);
  });

  const cases = () => [
    { name: 'correction to MAIA', path: 'sovereign/living-works/[id]/corrections', method: 'POST', params: { id: work }, body: { threadId: crypto.randomUUID(), maiaTurnIndex: 1, kind: 'other', correction: 'You misread me.' } },
    { name: 'writer understanding', path: 'sovereign/living-works/[id]/writer-understanding', method: 'PUT', params: { id: work }, body: { note: 'x' } },
    { name: 'settled decision', path: 'sovereign/living-works/[id]/decisions', method: 'POST', params: { id: work }, body: { action: 'settle', saidIn: 'The ending stays.' } },
    { name: 'plan', path: 'sovereign/manuscripts/[id]/plans', method: 'POST', params: { id: ms }, body: { ask: 'Help Return land.' } },
    { name: 'plan edit', path: 'sovereign/manuscripts/[id]/plans/[planId]', method: 'PATCH', params: { id: ms, planId: crypto.randomUUID() }, body: { edits: [] } },
    { name: 'plan step link', path: 'sovereign/manuscripts/[id]/plans/[planId]/links', method: 'POST', params: { id: ms, planId: crypto.randomUUID() }, body: { stepId: 's1', authorizationId: crypto.randomUUID() } },
    { name: 'chapter review run', path: 'sovereign/manuscripts/[id]/chapter-reviews', method: 'POST', params: { id: ms }, body: { chapterRootSectionId: crypto.randomUUID(), sectionIds: [], draftRevision: 1, readingIds: [], failures: [] } },
    { name: 'structure read', path: 'sovereign/manuscripts/[id]/structure/read', method: 'POST', params: { id: ms }, body: {} },
    { name: 'structure proposal review', path: 'sovereign/manuscripts/[id]/structure/proposals/[proposalId]', method: 'POST', params: { id: ms, proposalId: crypto.randomUUID() }, body: { op: 'x' } },
    { name: 'theme', path: 'sovereign/manuscripts/[id]/themes', method: 'POST', params: { id: ms }, body: { action: 'declare', label: 'Return' } },
  ];

  it('in Sanctuary: 409 sanctuary_not_kept everywhere, nothing written, MAIA never called', async () => {
    const before = await snapshot();
    for (const c of cases()) {
      const r = await call(c.path, c.method, c.params, { ...c.body, sanctuary: true });
      expect([c.name, r.status, r.json.refusal]).toEqual([c.name, 409, 'sanctuary_not_kept']);
    }
    expect(await snapshot()).toEqual(before);
  });

  it('undeclared (absent, malformed, a string "false"): 409 posture_undeclared everywhere, nothing written', async () => {
    const before = await snapshot();
    for (const c of cases()) for (const posture of [undefined, 'false', 0, null, 'yes']) {
      const body = posture === undefined ? { ...c.body } : { ...c.body, sanctuary: posture };
      const r = await call(c.path, c.method, c.params, body);
      expect([c.name, String(posture), r.status, r.json.refusal]).toEqual([c.name, String(posture), 409, 'posture_undeclared']);
    }
    expect(await snapshot()).toEqual(before);
  });

  it('contradictory (sanctuary:false with meta.sanctuary:true) is Sanctuary', async () => {
    const before = await snapshot();
    for (const c of cases()) {
      const r = await call(c.path, c.method, c.params, { ...c.body, sanctuary: false, meta: { sanctuary: true } });
      expect([c.name, r.status, r.json.refusal]).toEqual([c.name, 409, 'sanctuary_not_kept']);
    }
    expect(await snapshot()).toEqual(before);
  });

  it('ordinary passes the gate (each route then applies its own checks to these fictional bodies)', async () => {
    for (const c of cases()) {
      const r = await call(c.path, c.method, c.params, { ...c.body, sanctuary: false });
      expect([c.name, r.json.refusal]).not.toEqual([c.name, 'sanctuary_not_kept']);
      expect([c.name, r.json.refusal]).not.toEqual([c.name, 'posture_undeclared']);
    }
  });
});
