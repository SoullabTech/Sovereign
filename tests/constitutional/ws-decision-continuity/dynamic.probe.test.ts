/**
 * WS-DECISION-CONTINUITY — disposable-database witness + ROUTE walk of the Ask route. Real store, real route, real DB, scripted model.
 * Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional data only.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { listActiveDecisions } from '@/lib/writersStudio/decisionRecord';
import { settleDecision, withdrawDecision } from '@/lib/writersStudio/decisionRecordWrite';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
const systems: string[] = [];
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string }) => { systems.push(req.system); return { ok: true, result: { content: [{ type: 'text', text: 'ok' }] } }; },
}));
const d = ON ? describe : describe.skip;

d('decision record · physical witness + Ask route', () => {
  let A = '', B = '', workA = '', workA2 = '', ms = '', draftId = '';
  const rejects = async (sql: string, p: unknown[] = []) => { try { await query(sql, p); return false; } catch { return true; } };
  const mk = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`,
    [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
  const ask = async (body: Record<string, unknown>) => {
    CURRENT = A;
    const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: ms }) });
    return res.status;
  };

  beforeAll(async () => {
    A = await mk('decA'); B = await mk('decB');
    workA = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Dec A') RETURNING id`, [A])).rows[0].id;
    workA2 = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Dec A2') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Dec A') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [workA, ms, A]);
    const dr = draftId = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) VALUES ($1,$2,'','h') RETURNING id`, [ms, A])).rows[0].id;
    const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,1,'One','Body one.') RETURNING id`, [ms])).rows[0].id;
    await query(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,1,$2,$3)`, [dr, 'One\n\nBody one.', src]);
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [dr, 'One\n\nBody one.']);
  });

  it('only the owner can settle; settle and withdraw derive the active set; another member and another Work see nothing', async () => {
    expect(await settleDecision({ memberId: B, livingWorkId: workA, room: 'develop', subjectKind: 'note', saidIn: 'x' })).toBeNull();
    const id = await settleDecision({ memberId: A, livingWorkId: workA, room: 'develop', subjectKind: 'note', saidIn: 'I am keeping the sea ending.' });
    expect(id).toBeTruthy();
    expect((await listActiveDecisions(A, workA)).map((x) => x.saidIn)).toEqual(['I am keeping the sea ending.']);
    expect(await listActiveDecisions(B, workA)).toEqual([]);
    expect(await listActiveDecisions(A, workA2)).toEqual([]);
    expect(await withdrawDecision({ memberId: B, livingWorkId: workA, targetId: id! })).toBe(false);
    expect(await withdrawDecision({ memberId: A, livingWorkId: workA2, targetId: id! })).toBe(false);   // wrong Work
    expect(await withdrawDecision({ memberId: A, livingWorkId: workA, targetId: id! })).toBe(true);
    expect(await listActiveDecisions(A, workA)).toEqual([]);
  });

  it('the database refuses UPDATE, TRUNCATE and a direct DELETE; a malformed settle or withdraw', async () => {
    expect(await rejects(`UPDATE writer_decision_events SET said_in='y' WHERE member_id=$1`, [A])).toBe(true);
    expect(await rejects(`DELETE FROM writer_decision_events WHERE member_id=$1`, [A])).toBe(true);
    expect(await rejects(`TRUNCATE writer_decision_events`)).toBe(true);
    expect(await rejects(`INSERT INTO writer_decision_events(member_id,living_work_id,event) VALUES ($1,$2,'settle')`, [A, workA])).toBe(true);
    expect(await rejects(`INSERT INTO writer_decision_events(member_id,living_work_id,event,target_id) VALUES ($1,$2,'withdraw',$3)`, [A, workA, randomId()])).toBe(true);
  });

  it('a withdrawn decision is never revived by a later one', async () => {
    const a = await settleDecision({ memberId: A, livingWorkId: workA, room: 'passage_desk', subjectKind: 'note', saidIn: 'No adverbs in chapter two.' });
    await withdrawDecision({ memberId: A, livingWorkId: workA, targetId: a! });
    await settleDecision({ memberId: A, livingWorkId: workA, room: 'develop', subjectKind: 'note', saidIn: 'Keep the title.' });
    expect((await listActiveDecisions(A, workA)).map((x) => x.saidIn)).toEqual(['Keep the title.']);
  });

  it('Ask route: the writer’s decisions reach MAIA as THEIR words; Sanctuary and an unstated posture read nothing', async () => {
    await settleDecision({ memberId: A, livingWorkId: workA, room: 'develop', subjectKind: 'note', saidIn: 'I will not cut the storm scene.' });
    systems.length = 0;
    expect(await ask({ anchor: { on: 'work' }, question: 'What next?', sanctuary: false })).toBe(200);
    expect(systems.at(-1)).toContain('WHAT THE WRITER HAS SETTLED');
    expect(systems.at(-1)).toContain('I will not cut the storm scene.');
    expect(systems.at(-1)).toContain('discuss it freely');
    await ask({ anchor: { on: 'work' }, question: 'Again?', sanctuary: true });
    expect(systems.at(-1)).not.toContain('storm scene');
    await ask({ anchor: { on: 'work' }, question: 'Unstated?' });
    expect(systems.at(-1)).not.toContain('storm scene');
  });

  it('D5 narrow exception: a DISMISSED observation reaches MAIA as her own earlier words; keep and unresolved do not; Sanctuary reads nothing', async () => {
    await query(`INSERT INTO working_draft_revisions(draft_id,revision_number,content,saved_by) VALUES ($1,1,'x',$2) ON CONFLICT DO NOTHING`, [draftId, A]);
    const reading = (await query<{ id: string }>(
      `INSERT INTO developmental_readings(manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance)
       VALUES ($1,$2,$3,1,'structure','{}','{}','{}','fp','reading',$4::jsonb,'{}','{}') RETURNING id`,
      [ms, A, draftId, JSON.stringify([
        { key: 'o1', observation: 'The storm scene carries too much of the middle.' },
        { key: 'o2', observation: 'The ending returns to the harbour image.' },
        { key: 'o3', observation: 'The second chapter drifts from its argument.' }])])).rows[0].id;
    const ev = (k: string, i: number, st: string) => query(
      `INSERT INTO developmental_observation_standing_events(member_id,reading_id,observation_key,event_index,standing) VALUES ($1,$2,$3,$4,$5)`, [A, reading, k, i, st]);
    await ev('o1', 0, 'dismiss'); await ev('o2', 0, 'keep'); await ev('o3', 0, 'dismiss'); await ev('o3', 1, 'unresolved');
    systems.length = 0;
    await ask({ anchor: { on: 'work' }, question: 'Where next?', sanctuary: false });
    const sys = systems.at(-1) ?? '';
    expect(sys).toContain('The storm scene carries too much of the middle.');
    expect(sys).toContain('your words, not theirs');
    /* Narrowed to D5's law by founder ruling 2026-11-09 ("Yes, as recommended"): the writer's keep / unresolved STANDING never reaches
       MAIA. Her own observation text may (G6 carries her readings); this fixture reading read no chapter text, so it is not carried. */
    expect(sys).not.toContain('The ending returns to the harbour image.');
    expect(sys).not.toContain('The second chapter drifts');
    expect(sys).not.toMatch(/\b(kept|left unresolved|still open)\b[^\n]*(harbour image|second chapter drifts)/i);
    await ask({ anchor: { on: 'work' }, question: 'Again?', sanctuary: true });
    expect(systems.at(-1)).not.toContain('The storm scene carries');
  });
});
function randomId() { return '00000000-0000-4000-8000-000000000000'; }
