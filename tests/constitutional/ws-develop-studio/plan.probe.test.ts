/**
 * WS-DEVELOP-STUDIO · M4 — the plan, against a REAL database and the REAL routes, scripted model.
 * Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional data only.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
let PLAN_INPUT: unknown = { summary: 'x', steps: [] };
let FAIL_MODEL = false;
const systems: string[] = [];
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string; messages?: unknown; tools?: { name: string }[] }) => {
    systems.push(req.system + '\n' + JSON.stringify(req.messages ?? []));
    if (FAIL_MODEL) return { ok: false };
    return { ok: true, result: { content: [{ type: 'tool_use', id: 't1', name: req.tools?.[0]?.name ?? 'development_plan', input: PLAN_INPUT }] } };
  },
}));
const d = ON ? describe : describe.skip;

d('development plan · real database, real routes', () => {
  let A = '', B = '', ms = '', work = '', s2 = '', s7 = '', dr = '';
  const mk = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
  const call = async (who: string, method: 'GET' | 'POST' | 'PATCH', body?: unknown, planId?: string) => {
    CURRENT = who;
    const mod = planId ? await import('@/app/api/sovereign/manuscripts/[id]/plans/[planId]/route') : await import('@/app/api/sovereign/manuscripts/[id]/plans/route');
    // A plan edit is kept: it declares an ordinary posture unless the test says otherwise (founder ruling 2026-11-09).
    if (method === 'PATCH' && body && typeof body === 'object' && !('sanctuary' in (body as object))) body = { ...(body as object), sanctuary: false };
    const req = new NextRequest('http://localhost/x', { method, headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const res = await (mod as any)[method](req, { params: Promise.resolve(planId ? { id: ms, planId } : { id: ms }) });
    return { status: res.status as number, json: await res.json() as Record<string, any> };
  };
  const scope = async (action: string, level?: string) => {
    CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/read-scope/route');
    const r = await POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ action, level, sanctuary: false }) }), { params: Promise.resolve({ id: ms }) }); return r.status;   // a grant declares ordinary (founder ruling 2026-11-09)
  };
  const receipts = async () => Number((await query<{ n: string }>(`SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND boundary='writers_studio.work_conversation->maia_cognition'`, [A])).rows[0].n);

  beforeAll(async () => {
    A = await mk('planA'); B = await mk('planB');
    work = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Plan book') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Plan book') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [work, ms, A]);
    dr = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) VALUES ($1,$2,'','h') RETURNING id`, [ms, A])).rows[0].id;
    const t2 = 'Salt\n\nMarta left a light on in the hallway, as if someone might yet come home.';
    const t7 = 'Return\n\nShe found the house. There was no key, and the hallway was dark.';
    for (const [i, h, t] of [[1, 'Salt', t2], [2, 'Return', t7]] as const) {
      const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4) RETURNING id`, [ms, i, h, t.split('\n\n')[1]])).rows[0].id;
      const sid = (await query<{ id: string }>(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,$2,$3,$4) RETURNING id`, [dr, i, t, src])).rows[0].id;
      if (i === 1) s2 = sid; else s7 = sid;
    }
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [dr, 'Salt\n\nMarta left a light on in the hallway, as if someone might yet come home.Return\n\nShe found the house. There was no key, and the hallway was dark.']);
  });

  it('refuses without the writer’s permission, in Sanctuary, and when Sanctuary is not stated; nothing is read', async () => {
    const before = await receipts();
    expect((await call(A, 'POST', { ask: 'plan', sanctuary: false })).json.refusal).toBe('permission_required');
    await scope('grant', 'chapter');
    expect((await call(A, 'POST', { ask: 'plan', sanctuary: false })).json.refusal).toBe('permission_required');   // chapter-level is not enough for a plan across chapters
    await scope('grant', 'work');
    expect((await call(A, 'POST', { ask: 'plan', sanctuary: true })).json.refusal).toBe('sanctuary_not_kept');
    expect((await call(A, 'POST', { ask: 'plan' })).json.refusal).toBe('posture_undeclared');
    expect((await call(A, 'PATCH', { edits: [], sanctuary: true }, crypto.randomUUID())).json.refusal).toBe('sanctuary_not_kept');
    expect(await receipts()).toBe(before);
    expect(systems.length).toBe(0);
  });

  it('with permission: one receipt per chapter before the text loads; invented steps are dropped; real ones are saved; the manuscript is untouched', async () => {
    PLAN_INPUT = { summary: 'Connect Return to the light in Salt.', steps: [
      { chapterId: s7, anchor: 'There was no key, and the hallway was dark', direction: 'Bring back the light that Salt left on.', why: 'It pays off an earlier promise.' },
      { chapterId: s2, anchor: 'the lighthouse burned all night', direction: 'invented' },
      { chapterId: 'not-a-chapter', anchor: 'x', direction: 'y' }] };
    const before = await receipts();
    const textBefore = (await query<{ content: string }>(`SELECT content FROM manuscript_working_drafts WHERE id=$1`, [dr])).rows[0].content;
    const r = await call(A, 'POST', { ask: 'help me connect Return to Salt', sanctuary: false });
    expect(r.status).toBe(200);
    expect(r.json.plan.steps).toHaveLength(1);
    expect(r.json.plan.steps[0].anchor).toBe('There was no key, and the hallway was dark');
    expect(r.json.plan.ask).toBe('help me connect Return to Salt');           // the WRITER's words
    expect(r.json.dropped).toBe(2);
    expect(await receipts()).toBe(before + 2);                                  // one per chapter, both crossed
    expect(systems.at(-1)).toContain('Marta left a light on');
    expect(systems.at(-1)!.split('\n[')[0]).not.toContain('Marta left a light on');      // never in the instructions
    expect(systems.at(-1)).toContain('<chapter id=');
    expect((await query<{ content: string }>(`SELECT content FROM manuscript_working_drafts WHERE id=$1`, [dr])).rows[0].content).toBe(textBefore);
  });

  it('another member cannot see, make or edit this plan', async () => {
    expect((await call(B, 'GET')).json.plan ?? null).toBeNull();
    expect((await call(B, 'POST', { ask: 'x', sanctuary: false })).status).toBe(404);
    const plan = (await call(A, 'GET')).json.plan;
    expect((await call(B, 'PATCH', { edits: [{ id: plan.steps[0].id, remove: true }] }, plan.id)).status).toBe(404);
  });

  it('the writer edits wording and status; the anchor never changes; the previous version is kept; removal works', async () => {
    const plan = (await call(A, 'GET')).json.plan; const sid = plan.steps[0].id;
    const e = await call(A, 'PATCH', { edits: [{ id: sid, direction: 'My own wording.', status: 'working', anchor: 'EVIL', chapterId: 'zz' }] }, plan.id);
    expect(e.json.plan.steps[0]).toMatchObject({ direction: 'My own wording.', status: 'working', anchor: 'There was no key, and the hallway was dark' });
    const hist = await query<{ n: string }>(`SELECT COUNT(*)::text n FROM development_plan_history WHERE plan_id=$1`, [plan.id]);
    expect(Number(hist.rows[0].n)).toBe(1);
    let blocked = false; try { await query(`UPDATE development_plan_history SET steps='[]' WHERE plan_id=$1`, [plan.id]); } catch { blocked = true; }
    expect(blocked).toBe(true);
    let immutable = false; try { await query(`UPDATE development_plans SET ask='changed' WHERE id=$1`, [plan.id]); } catch { immutable = true; }
    expect(immutable).toBe(true);
  });

  it('return: the plan is still there; a changed chapter flags its step as stale; revoking permission does not erase the plan', async () => {
    const before = (await call(A, 'GET')).json;
    expect(before.plan.steps).toHaveLength(1); expect(before.staleStepIds).toEqual([]);
    // the writer edits a chapter. Fixture-only: the flatten trigger is set aside so the section and the draft move together, as Write does.
    const nt = 'Return\n\nShe found the house, and everything in it had been moved.';
    const whole = 'Salt\n\nMarta left a light on in the hallway, as if someone might yet come home.' + nt;
    await query(`BEGIN; SET LOCAL session_replication_role = replica; UPDATE manuscript_draft_sections SET text='${nt}' WHERE id='${s7}'; UPDATE manuscript_working_drafts SET content='${whole}' WHERE id='${dr}'; COMMIT;`);
    const after = (await call(A, 'GET')).json;
    expect(after.staleStepIds).toEqual([after.plan.steps[0].id]);
    await scope('revoke');
    expect((await call(A, 'GET')).json.plan.steps).toHaveLength(1);
  });

  it('a plan is bound to its manuscript: the same writer cannot read or edit it through another of their manuscripts', async () => {
    const plan = (await call(A, 'GET')).json.plan;
    const other = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Other book') RETURNING id`, [A])).rows[0].id;
    const keep = ms; ms = other;
    try {
      expect((await call(A, 'GET')).json.plan ?? null).toBeNull();
      expect((await call(A, 'PATCH', { edits: [{ id: plan.steps[0].id, remove: true }] }, plan.id)).status).toBe(404);
    } finally { ms = keep; }
    expect((await call(A, 'GET')).json.plan.steps).toHaveLength(1);   // untouched
  });

  it('the server names a step it cannot verify (its chapter can no longer be read), so the hand-off refuses it', async () => {
    await scope('grant', 'work');                                           // checking needs permission (review fix); the previous test revoked it
    const r = (await call(A, 'GET')).json;
    expect(r.unverifiedStepIds).toEqual([]);
    const sid = r.plan.steps[0].chapterId;
    // Fixture-only: remove the chapter, keeping the draft consistent (flatten trigger set aside, as before).
    const keepText = 'Salt\n\nMarta left a light on in the hallway, as if someone might yet come home.';
    await query(`BEGIN; SET LOCAL session_replication_role = replica; DELETE FROM manuscript_draft_sections WHERE id='${sid}'; UPDATE manuscript_working_drafts SET content='${keepText}' WHERE id='${dr}'; COMMIT;`);
    const after = (await call(A, 'GET')).json;
    expect(after.unverifiedStepIds).toEqual([r.plan.steps[0].id]);
    expect(after.staleStepIds).toEqual([]);                                // not claimed changed: unknown is not "changed"
  });

  it('review fixes: null body; a conversation from another manuscript is not used; a failed model call confirms no receipt', async () => {
    CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/plans/route');
    const nul = await POST(new NextRequest('http://localhost/x', { method: 'POST', body: 'null' }), { params: Promise.resolve({ id: ms }) });
    expect(nul.status).toBe(400);
    await scope('grant', 'work');
    // a thread on ANOTHER manuscript of the same writer
    const other = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Elsewhere') RETURNING id`, [A])).rows[0].id;
    const t = (await query<{ id: string }>(`INSERT INTO ask_threads (manuscript_id, member_id, anchor, canonical_at_open, initiated_by)
      VALUES ($1,$2,'{"kind":"work"}'::jsonb,'x','author') RETURNING id`, [other, A])).rows[0]!.id;
    // Fixture must exist, or this test proves nothing (a silent failure here once made it vacuous).
    await query(`INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness) VALUES ($1,0,'author','SECRET FROM ANOTHER BOOK','{}'::jsonb)`, [t]);
    expect((await query(`SELECT 1 FROM ask_turns WHERE thread_id=$1`, [t])).rows.length).toBe(1);
    PLAN_INPUT = { summary: 's', steps: [] };
    const withThread = await call(A, 'POST', { ask: 'plan', sanctuary: false, threadId: t });
    expect(withThread.status).toBe(200);
    expect(systems.at(-1)).not.toContain('SECRET FROM ANOTHER BOOK');
    // model failure: receipts stay 'attempted'
    FAIL_MODEL = true;
    const before = (await query<{ n: string }>(`SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND crossed_at IS NOT NULL`, [A]).catch(async () =>
      query<{ n: string }>(`SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND status='crossed'`, [A]))).rows[0].n;
    const r = await call(A, 'POST', { ask: 'plan', sanctuary: false });
    FAIL_MODEL = false;
    expect(r.status).toBe(502);
    const after = (await query<{ n: string }>(`SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND crossed_at IS NOT NULL`, [A]).catch(async () =>
      query<{ n: string }>(`SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND status='crossed'`, [A]))).rows[0].n;
    expect(after).toBe(before);
  });

  it('review fixes: checking a plan without permission reads nothing and calls every step unverified', async () => {
    PLAN_INPUT = { summary: 's', steps: [{ chapterId: s2, anchor: 'Marta left a light on in the hallway', direction: 'd' }] };
    await call(A, 'POST', { ask: 'again', sanctuary: false });
    await scope('revoke');
    const v = (await call(A, 'GET')).json;
    expect(v.plan.steps).toHaveLength(1);
    expect(v.unverifiedStepIds).toEqual([v.plan.steps[0].id]);
    expect(v.staleStepIds).toEqual([]);
  });

  it('review fixes: the database refuses an anchor change or an added step; a guarded status change respects the writer', async () => {
    const plan = (await call(A, 'GET')).json.plan;
    let blocked = false;
    try { await query(`UPDATE development_plans SET steps = jsonb_set(steps, '{0,anchor}', '"EVIL"') WHERE id=$1`, [plan.id]); } catch { blocked = true; }
    expect(blocked).toBe(true);
    let added = false;
    try { await query(`UPDATE development_plans SET steps = steps || '[{"id":"new","chapterId":"x","anchor":"y","direction":"z","why":"","status":"open"}]'::jsonb WHERE id=$1`, [plan.id]); } catch { added = true; }
    expect(added).toBe(true);
    const sid = plan.steps[0].id;
    await call(A, 'PATCH', { edits: [{ id: sid, status: 'done' }] }, plan.id);
    const g = await call(A, 'PATCH', { edits: [{ id: sid, status: 'working', ifStatus: 'open' }] }, plan.id);
    expect(g.json.plan.steps[0].status).toBe('done');
    expect((await call(A, 'PATCH', null as never, plan.id)).status).toBe(400);
  });

  it('review fixes: the writer can delete the plan; its history goes with it; the manuscript is untouched', async () => {
    const plan = (await call(A, 'GET')).json.plan;
    const text = (await query<{ content: string }>(`SELECT content FROM manuscript_working_drafts WHERE id=$1`, [dr])).rows[0].content;
    CURRENT = B; const mod = await import('@/app/api/sovereign/manuscripts/[id]/plans/[planId]/route');
    expect((await mod.DELETE(new NextRequest('http://localhost/x', { method: 'DELETE' }), { params: Promise.resolve({ id: ms, planId: plan.id }) })).status).toBe(404);
    CURRENT = A;
    expect((await mod.DELETE(new NextRequest('http://localhost/x', { method: 'DELETE' }), { params: Promise.resolve({ id: ms, planId: plan.id }) })).status).toBe(200);
    expect((await query(`SELECT 1 FROM development_plans WHERE id=$1`, [plan.id])).rows.length).toBe(0);
    expect((await query(`SELECT 1 FROM development_plan_history WHERE plan_id=$1`, [plan.id])).rows.length).toBe(0);
    expect((await query<{ content: string }>(`SELECT content FROM manuscript_working_drafts WHERE id=$1`, [dr])).rows[0].content).toBe(text);
  });

  it('a plan is bound to the decisions it read: unchanged → false; a new or withdrawn decision → true; asking to revisit changes no decision', async () => {
    await scope('grant', 'work');
    const { settleDecision, withdrawDecision } = await import('@/lib/writersStudio/decisionRecordWrite');
    const first = await settleDecision({ memberId: A, livingWorkId: work, room: 'work_conversation', subjectKind: 'note', saidIn: 'Marta never says she misses her mother.' });
    PLAN_INPUT = { summary: 's', steps: [{ chapterId: s2, anchor: 'Marta left a light on in the hallway', direction: 'd' }] };
    const made = await call(A, 'POST', { ask: 'revisit whether Marta should say she misses her mother', sanctuary: false });
    expect(made.status).toBe(200);
    expect(systems.at(-1)).toContain('Marta never says she misses her mother');            // she was given the decision
    const events = async () => Number((await query<{ n: string }>(`SELECT COUNT(*)::text n FROM writer_decision_events WHERE member_id=$1`, [A])).rows[0].n);
    const before = await events();
    expect((await call(A, 'GET')).json.decisionsChanged).toBe(false);
    expect(await events()).toBe(before);                                                     // asking to revisit is discussion, never a recorded change
    await settleDecision({ memberId: A, livingWorkId: work, room: 'work_conversation', subjectKind: 'note', saidIn: 'The lighthouse stays offstage.' });
    expect((await call(A, 'GET')).json.decisionsChanged).toBe(true);
    let frozen = false;
    try { await query(`UPDATE development_plans SET decisions_digest='x' WHERE id=$1`, [made.json.plan.id]); } catch { frozen = true; }
    expect(frozen).toBe(true);
    await withdrawDecision({ memberId: A, livingWorkId: work, targetId: first! });
    expect((await call(A, 'GET')).json.decisionsChanged).toBe(true);
    await scope('revoke');
    expect((await call(A, 'GET')).json.decisionsChanged).toBeNull();                        // cannot be known without permission
  });

  it('deleting the Work removes its plans with it', async () => {
    const w2 = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Gone') RETURNING id`, [A])).rows[0].id;
    await query(`DELETE FROM living_works WHERE id=$1`, [w2]);
    expect((await query(`SELECT 1 FROM development_plans WHERE living_work_id=$1`, [w2])).rows.length).toBe(0);
  });
});
