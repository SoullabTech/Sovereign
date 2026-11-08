/**
 * WS-WORK-CONTINUITY · B + A2 — ROUTE WALK. The REAL Ask route handler, the REAL database, a SCRIPTED model transport
 * (nothing leaves the machine). SAFETY: disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback.
 * Fictional manuscript only. Establishes route + persistence behaviour; ⛔ NOT model behaviour, NOT a UI walk.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only'
  && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');

let CURRENT_MEMBER = '';
type Script = (system: string, messages: { role: string; content: string }[], n: number) => string;
let script: Script = () => 'ok';
let modelCalls = 0;
const systems: string[] = [];

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT_MEMBER }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string; messages: { role: string; content: string }[] }) => {
    systems.push(req.system);
    const text = script(req.system, req.messages, modelCalls++);
    return { ok: true, result: { content: [{ type: 'text', text }] } };
  },
}));

const d = ON ? describe : describe.skip;

d('Work conversation · route walk (fictional manuscript)', () => {
  const S1 = 'The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke.';
  const S2 = 'Marta carried the nets uphill every morning, counting each knot as though it were a name she owed.';
  const S3 = 'When she returned, the harbour was smaller, and she understood that leaving had been the long part.';
  let A = '', B = '', workA = '', ms = '', draftId = '';
  const sec: string[] = [];
  let texts: string[] = [];

  const post = async (member: string, body: Record<string, unknown>, id = ms) => {
    CURRENT_MEMBER = member;
    const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    /* the real client states its posture on every Ask; tests state it too unless they are testing its absence */
    const stated = 'sanctuary' in body || body.__unstated ? body : { ...body, sanctuary: false };
    delete (stated as Record<string, unknown>).__unstated;
    const res = await POST(new NextRequest(`http://localhost/api/sovereign/manuscripts/${id}/ask`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(stated) }),
      { params: Promise.resolve({ id }) });
    return { status: res.status, json: await res.json() as Record<string, any> };
  };
  const scope = async (member: string, c: Record<string, unknown>) => {
    CURRENT_MEMBER = member;
    const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/read-scope/route');
    const res = await POST(new NextRequest(`http://localhost/x`, { method: 'POST', body: JSON.stringify(c) }),
      { params: Promise.resolve({ id: ms }) });
    return res.status;
  };
  const receipts = async () => (await query<{ n: string }>(
    `SELECT COUNT(*)::text n FROM context_disclosure_receipts WHERE boundary='writers_studio.work_conversation->maia_cognition' AND member_id=$1`, [A])).rows[0].n;
  const lastSystem = () => systems[systems.length - 1] ?? '';

  beforeAll(async () => {
    const m = async (n: string) => (await query<{ id: string }>(
      `INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`])).rows[0].id;
    A = await m('walkA'); B = await m('walkB');
    workA = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title,purpose) VALUES ($1,'The Long Harbour','A book about leaving.') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'The Long Harbour') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [workA, ms, A]);
    draftId = (await query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash,section_addressable_at) VALUES ($1,$2,'','h',NULL) RETURNING id`, [ms, A])).rows[0].id;
    const heads = ['The Harbour', 'Salt', 'Return']; const bodies = [S1, S2, S3];
    for (let i = 0; i < 3; i++) {
      const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4) RETURNING id`, [ms, i + 1, heads[i], bodies[i]])).rows[0].id;
      sec.push((await query<{ id: string }>(
        `INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,$2,$3,$4) RETURNING id`,
        [draftId, i + 1, `${heads[i]}\n\n${bodies[i]}`, src])).rows[0].id);
    }
    texts = heads.map((h, i) => `${h}\n\n${bodies[i]}`);
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [draftId, texts.join('')]);
  });

  it('W1 no grant: only the passage the writer is at reaches MAIA, and nothing is receipted', async () => {
    script = () => 'A plain answer.';
    const r = await post(A, { anchor: { on: 'work' }, question: 'What is chapter three doing?', sectionId: sec[0] });
    expect(r.status).toBe(200);
    expect(lastSystem()).toContain(S1);
    expect(lastSystem()).not.toContain(S3);
    expect(lastSystem()).not.toContain('STANDING PERMISSION');
    expect(await receipts()).toBe('0');
    expect(r.json.read ?? []).toEqual([]);
  });

  let thread = '';
  it('W2 grant "work": a follow-up about another chapter is read without anyone reopening Write', async () => {
    expect(await scope(A, { action: 'grant', level: 'work' })).toBe(200);
    script = () => 'It is where she sees the harbour has shrunk.';
    const r = await post(A, { anchor: { on: 'work' }, question: 'How does Return land?', sectionId: sec[0] });
    thread = r.json.threadId;
    expect(lastSystem()).toContain('STANDING PERMISSION');
    expect(lastSystem()).toContain(S1);
    expect(lastSystem()).toContain(S3);
    expect(lastSystem()).not.toContain(S2);                      // not asked about, not read
    expect(await receipts()).toBe('2');
    const rec = await query(`SELECT scope_event_id, participation_basis, state, gesture FROM context_disclosure_receipts WHERE boundary='writers_studio.work_conversation->maia_cognition' AND member_id=$1`, [A]);
    for (const row of rec.rows as any[]) {
      expect(row.participation_basis).toBe('standing_authorization');
      expect(row.scope_event_id).toBeTruthy(); expect(row.state).toBe('crossed'); expect(row.gesture).toBe('standing_read_scope');
    }
    expect(r.json.read.map((x: any) => x.label).sort()).toEqual(['Return', 'The Harbour']);
    expect(JSON.stringify(r.json.read)).not.toContain(S3);       // visible record carries no text
  });

  it('W3 leave and return: a whole-book question with no locus reads every section; a later edit is flagged as moved', async () => {
    script = () => 'Across the book the harbour keeps shrinking.';
    const r = await post(A, { threadId: thread, question: 'What holds across the whole book?' });
    expect(r.status).toBe(200);
    for (const s of [S1, S2, S3]) expect(lastSystem()).toContain(s);
    texts[1] = 'Salt\n\nMarta stopped carrying the nets; someone else counted the knots now.';
    await query(`WITH u AS (UPDATE manuscript_draft_sections SET text = $2 WHERE id = $1) UPDATE manuscript_working_drafts SET content = $3 WHERE id = $4`,
      [sec[1], texts[1], texts.join(''), draftId]);
    const r2 = await post(A, { threadId: thread, question: 'And Salt now, across the whole book?' });
    expect(r2.status).toBe(200);
    expect(lastSystem()).toMatch(/Salt[^\n]*THIS TEXT HAS CHANGED/);
    expect(lastSystem()).not.toMatch(/The Harbour[^\n]*THIS TEXT HAS CHANGED/);
  });

  it('W4 revoke is effective mid-thread: the next Ask reads only the passage, mints nothing new', async () => {
    const before = await receipts();
    expect(await scope(A, { action: 'revoke' })).toBe(200);
    script = () => 'Without access.';
    await post(A, { threadId: thread, question: 'And the whole book again?', sectionId: sec[0] });
    expect(lastSystem()).not.toContain('STANDING PERMISSION');
    expect(lastSystem()).not.toContain('someone else counted the knots');
    expect(await receipts()).toBe(before);
  });

  it('W5 Sanctuary suspends an active grant', async () => {
    await scope(A, { action: 'grant', level: 'work' });
    const before = await receipts();
    script = () => 'In sanctuary.';
    await post(A, { threadId: thread, question: 'Read the whole book for me.', sectionId: sec[0], sanctuary: true });
    expect(lastSystem()).not.toContain('STANDING PERMISSION');
    expect(await receipts()).toBe(before);
  });

  it('W5b an Ask that does not state its Sanctuary posture fails closed: no standing read, conversation continues', async () => {
    await scope(A, { action: 'grant', level: 'work' });
    const before = await receipts();
    script = () => 'Posture unstated.';
    const r = await post(A, { threadId: thread, question: 'The whole book please.', sectionId: sec[0], __unstated: true });
    expect(r.status).toBe(200);
    expect(lastSystem()).not.toContain('STANDING PERMISSION');
    expect(await receipts()).toBe(before);
  });

  it('W6 another member cannot reach this Work, and their grant means nothing here', async () => {
    const r = await post(B, { anchor: { on: 'work' }, question: 'Read it.' });
    expect(r.status).toBe(404);
    expect(await scope(B, { action: 'grant', level: 'work' })).toBe(404);
  });

  it('W7 a receipt that cannot be minted fails closed: conversation continues, no section beyond the passage crosses', async () => {
    await query(`CREATE OR REPLACE FUNCTION walk_block() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'walk block'; END; $$ LANGUAGE plpgsql`);
    await query(`CREATE TRIGGER walk_block_t BEFORE INSERT ON context_disclosure_receipts FOR EACH ROW EXECUTE FUNCTION walk_block()`);
    try {
      script = () => 'Still here.';
      const r = await post(A, { threadId: thread, question: 'The whole book please.', sectionId: sec[0] });
      expect(r.status).toBe(200);
      expect(lastSystem()).not.toContain('STANDING PERMISSION');
      expect(lastSystem()).not.toContain('someone else counted the knots');
    } finally { await query(`DROP TRIGGER walk_block_t ON context_disclosure_receipts`); }
  });

  it('W8 A2: a faithful quote passes; an invented one is regenerated once; a persistent one is replaced by an honest answer', async () => {
    script = () => `She writes "the salt on the rails caught the first light" and it carries the scene.`;
    let r = await post(A, { threadId: thread, question: 'Quote the opening image.', sectionId: sec[0] });
    expect(r.json.thread.turns.at(-1).body).toContain('the salt on the rails caught the first light');

    const calls0 = modelCalls;
    script = (_s, _m, n) => n === calls0
      ? 'You wrote "the tide retreated like a held breath at dawn" which is lovely.'
      : 'The opening is about light on the rails.';
    r = await post(A, { threadId: thread, question: 'Quote something about the tide.', sectionId: sec[0] });
    expect(modelCalls - calls0).toBe(2);
    expect(r.json.thread.turns.at(-1).body).toBe('The opening is about light on the rails.');
    expect(lastSystem()).toContain('CORRECTION');

    script = () => 'You wrote "the tide retreated like a held breath at dawn" which is lovely.';
    r = await post(A, { threadId: thread, question: 'Again, the tide line?', sectionId: sec[0] });
    expect(r.json.thread.turns.at(-1).body).toContain('I won’t quote it');
    expect(r.json.thread.turns.at(-1).body).not.toContain('held breath');
  });
});
