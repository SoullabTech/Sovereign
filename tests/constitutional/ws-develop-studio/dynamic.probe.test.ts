/**
 * WS-DEVELOP-STUDIO — disposable-database witness: the declared kind and the once-only, gentle offer about case stories. Real store, real Ask route, real DB, scripted model.
 * Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional data only.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { declareWorkKind } from '@/lib/writersStudio/workKindWrite';
import { livingWorkKind } from '@/lib/writersStudio/workKind';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
let nextAnswer = 'A plain answer.';
const systems: string[] = [];
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string }) => { systems.push(req.system); return { ok: true, result: { content: [{ type: 'text', text: nextAnswer }] } }; },
}));
const d = ON ? describe : describe.skip;
const MARK = 'ONE GENTLE OFFER, AT MOST ONCE EVER';

d('declared kind + the once-only offer', () => {
  const mk = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`,
    [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
  let A = '', B = '';
  const book = async (title: string) => {
    const w = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,$2) RETURNING id`, [A, title])).rows[0].id;
    const ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,$2) RETURNING id`, [A, title])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [w, ms, A]);
    const dr = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) VALUES ($1,$2,'','h') RETURNING id`, [ms, A])).rows[0].id;
    const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,1,'One','In session, a client told me about her mother.') RETURNING id`, [ms])).rows[0].id;
    await query(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,1,$2,$3)`, [dr, 'One\n\nIn session, a client told me about her mother.', src]);
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [dr, 'One\n\nIn session, a client told me about her mother.']);
    return { w, ms };
  };
  const ask = async (ms: string, body: Record<string, unknown>) => {
    CURRENT = A;
    const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: ms }) });
    return res.status;
  };
  beforeAll(async () => { A = await mk('kindA'); B = await mk('kindB'); });

  it('only the owner declares a kind; the database admits three values and null', async () => {
    const { w } = await book('Kind probe');
    expect(await declareWorkKind(B, w, 'fiction')).toBe(false);
    expect(await livingWorkKind(A, w)).toBeNull();
    expect(await declareWorkKind(A, w, 'practitioner')).toBe(true);
    expect(await livingWorkKind(A, w)).toBe('practitioner');
    expect(await livingWorkKind(B, w)).toBeNull();                       // another member reads nothing
    let bad = false; try { await query(`UPDATE living_works SET kind='memoir' WHERE id=$1`, [w]); } catch { bad = true; }
    expect(bad).toBe(true);
    expect(await declareWorkKind(A, w, null)).toBe(true);
    expect(await livingWorkKind(A, w)).toBeNull();
  });

  it('a helper’s book: the gentle offer is in the first answer’s instructions, and is not repeated once it has been made', async () => {
    const { w, ms } = await book('Helper book');
    await declareWorkKind(A, w, 'practitioner');
    systems.length = 0; nextAnswer = 'That is a tender scene. Case stories are other people’s lives, so I wonder whether you have changed what could identify her. No need to answer.';
    expect(await ask(ms, { anchor: { on: 'work' }, question: 'What do you notice?', sanctuary: false })).toBe(200);
    expect(systems.at(-1)).toContain(MARK);
    systems.length = 0; nextAnswer = 'Another plain answer.';
    await ask(ms, { anchor: { on: 'work' }, question: 'And the next part?', sanctuary: false });
    expect(systems.at(-1)).not.toContain(MARK);                          // already said once, anywhere in this Work
  });

  it('the offer is NOT consumed by an answer that did not make it', async () => {
    const { w, ms } = await book('Helper book 2');
    await declareWorkKind(A, w, 'practitioner');
    nextAnswer = 'A plain answer with no such note.'; systems.length = 0;
    await ask(ms, { anchor: { on: 'work' }, question: 'First question', sanctuary: false });
    expect(systems.at(-1)).toContain(MARK);
    systems.length = 0;
    await ask(ms, { anchor: { on: 'work' }, question: 'Second question', sanctuary: false });
    expect(systems.at(-1)).toContain(MARK);                              // still available: it was never made
  });

  it('never for fiction, nonfiction or an undeclared book; never in Sanctuary; never when the posture is unstated', async () => {
    for (const kind of ['fiction', 'nonfiction', null] as const) {
      const { w, ms } = await book(`Other ${String(kind)}`);
      await declareWorkKind(A, w, kind); systems.length = 0; nextAnswer = 'ok';
      await ask(ms, { anchor: { on: 'work' }, question: 'Q', sanctuary: false });
      expect({ kind, offered: systems.at(-1)!.includes(MARK) }).toEqual({ kind, offered: false });
    }
    const { w, ms } = await book('Helper sanctuary');
    await declareWorkKind(A, w, 'practitioner'); systems.length = 0;
    await ask(ms, { anchor: { on: 'work' }, question: 'Q', sanctuary: true });
    expect(systems.at(-1)).not.toContain(MARK);
    systems.length = 0;
    await ask(ms, { anchor: { on: 'work' }, question: 'Q2' });
    expect(systems.at(-1)).not.toContain(MARK);
  });
});
