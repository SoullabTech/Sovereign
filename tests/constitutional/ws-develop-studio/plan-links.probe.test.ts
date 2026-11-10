/**
 * WS-DEVELOP-STUDIO · M4c — a plan step ↔ the desk's own apply/undo records. Real database, real routes.
 * Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional data only.
 * Fixture note: accepted_at defaults to the DATABASE clock (clock_timestamp()). It used JavaScript's millisecond clock, which made a
 * change accepted in the same millisecond as the plan look older than it (µs vs ms) and be refused: the unexplained first-run failures.
 * Desk authorization rows are inserted with session_replication_role=replica (their proposal-chain parents
 * are out of scope here). The link and event logic under test runs unmodified.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: async () => ({ ok: false }) }));
const d = ON ? describe : describe.skip;
const u = () => crypto.randomUUID();

d('plan step ↔ desk records', () => {
  let A = '', B = '', ms = '', ms2 = '', dr = '', s2 = '', s7 = '', plan = '';
  const mk = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
  const auth = async (o: { member?: string; work?: string; section?: string; accepted?: boolean; at?: string }) => {
    const id = u();
    await query(`BEGIN; SET LOCAL session_replication_role = replica;
      INSERT INTO manuscript_revision_authorizations (id, member_id, proposal_chain_id, proposal_version_id, work_id, draft_id, base_version, target_section_id, expected_text, authorized_at, accepted_at, resulting_version)
      VALUES ('${id}', '${o.member ?? A}', '${u()}', '${u()}', '${o.work ?? ms}', '${dr}', 1, '${o.section ?? s7}', 'x', NOW(), ${o.accepted === false ? 'NULL' : o.at ? `'${o.at}'` : 'clock_timestamp()'}, ${o.accepted === false ? 'NULL' : '2'});
      INSERT INTO manuscript_application_recovery (authorization_id, before_body, after_body) VALUES ('${id}', 'a', 'b'); COMMIT;`);
    return id;
  };
  const undo = (id: string) => query(`UPDATE manuscript_application_recovery SET undone_at = NOW(), resulting_version = 3 WHERE authorization_id = $1`, [id]);
  const link = async (who: string, body: Record<string, unknown>, onMs = ms, onPlan = plan) => {
    CURRENT = who; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/plans/[planId]/links/route');
    // A link is kept: declare an ordinary posture unless the test says otherwise (founder ruling 2026-11-09).
    const r = await POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify('sanctuary' in body ? body : { ...body, sanctuary: false }) }), { params: Promise.resolve({ id: onMs, planId: onPlan }) });
    return { status: r.status, outcome: ((await r.json()) as { outcome?: string }).outcome };
  };
  const view = async () => { CURRENT = A; const { GET } = await import('@/app/api/sovereign/manuscripts/[id]/plans/route');
    return (await (await GET(new NextRequest('http://localhost/x'), { params: Promise.resolve({ id: ms }) })).json()) as Record<string, any>; };

  beforeAll(async () => {
    A = await mk('lnkA'); B = await mk('lnkB');
    const w = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Link book') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Link book') RETURNING id`, [A])).rows[0].id;
    ms2 = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Other book') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [w, ms, A]);
    dr = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) VALUES ($1,$2,'','h') RETURNING id`, [ms, A])).rows[0].id;
    s2 = u(); s7 = u();
    plan = (await query<{ id: string }>(`INSERT INTO development_plans (member_id, living_work_id, manuscript_id, ask, summary, steps, basis)
      VALUES ($1,$2,$3,'connect','s',$4::jsonb,'[]'::jsonb) RETURNING id`, [A, w, ms, JSON.stringify([
        { id: 'a', chapterId: s7, anchor: 'no key', direction: 'd', why: '', status: 'working' },
        { id: 'b', chapterId: s2, anchor: 'light', direction: 'd', why: '', status: 'open' }])])).rows[0].id;
  });

  it('an accepted change on the step’s own chapter links; the plan then reads it as applied, from the desk’s records', async () => {
    const id = await auth({});
    expect(await link(A, { stepId: 'a', authorizationId: id })).toEqual({ status: 200, outcome: 'linked' });
    const v = await view();
    expect(v.events.a.state).toBe('applied');
    expect(v.plan.steps.find((s: any) => s.id === 'a').status).toBe('working');     // applied never resolves the step
    expect(await link(A, { stepId: 'a', authorizationId: id })).toEqual({ status: 200, outcome: 'already' });   // repeated action: idempotent
  });

  it('Undo in the desk shows as undone without anyone telling the plan', async () => {
    const id = (await query<{ authorization_id: string }>(`SELECT authorization_id FROM development_plan_step_links WHERE plan_id=$1 AND step_id='a'`, [plan])).rows[0].authorization_id;
    await undo(id);
    expect((await view()).events.a.state).toBe('undone');
  });

  it('refuses: another chapter, not accepted, another manuscript, another member, before the plan, another step’s re-link', async () => {
    expect((await link(A, { stepId: 'a', authorizationId: await auth({ section: s2 }) })).outcome).toBe('refused');            // wrong chapter
    expect((await link(A, { stepId: 'a', authorizationId: await auth({ accepted: false }) })).outcome).toBe('refused');        // proposed, never applied
    expect((await link(A, { stepId: 'a', authorizationId: await auth({ work: ms2 }) })).outcome).toBe('refused');              // other manuscript
    expect((await link(A, { stepId: 'a', authorizationId: await auth({ at: '2000-01-01T00:00:00Z' }) })).outcome).toBe('refused'); // older than the plan
    const theirs = await auth({ member: B });
    expect((await link(A, { stepId: 'a', authorizationId: theirs })).outcome).toBe('refused');                                // another member's change
    expect((await link(B, { stepId: 'a', authorizationId: theirs })).outcome).toBe('refused');                                // another member's plan
    expect((await link(A, { stepId: 'a', authorizationId: await auth({}) }, ms2)).outcome).toBe('refused');                   // through another manuscript's route
    expect((await link(A, { stepId: 'zz', authorizationId: await auth({}) })).outcome).toBe('refused');                       // no such step
    const once = await auth({});
    expect((await link(A, { stepId: 'a', authorizationId: once })).outcome).toBe('linked');
    expect((await link(A, { stepId: 'b', authorizationId: once })).outcome).toBe('refused');                                  // one change, one step
    expect((await link(A, { stepId: 'a', authorizationId: 'not-a-uuid' })).status).toBe(400);
    expect((await link(A, { stepId: 'a', authorizationId: once, applied: true })).status).toBe(400);                          // no claims smuggled in
  });

  it('a second live apply on the same step reads as applied again; the record is append-only', async () => {
    expect((await view()).events.a.state).toBe('applied');
    let blocked = false; try { await query(`UPDATE development_plan_step_links SET step_id='b' WHERE plan_id=$1`, [plan]); } catch { blocked = true; }
    expect(blocked).toBe(true);
    expect((await view()).events.b).toBeUndefined();
  });
});
