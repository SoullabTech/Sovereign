/**
 * WS-WHOLE-BOOK-CONVERSATION — ROUTE WALK. The REAL Ask route, a REAL (disposable) database, a SCRIPTED model transport (nothing leaves
 * the machine). SAFETY: disabled unless WS_WHOLE_BOOK_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional manuscript only.
 * Establishes route + carried-account behaviour; ⛔ NOT model behaviour, NOT a UI walk.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_WHOLE_BOOK_DYNAMIC === 'fictional-only'
  && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');

let CURRENT_MEMBER = '';
const systems: string[] = [];
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT_MEMBER }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string }) => {
    systems.push(req.system);
    return { ok: true, result: { content: [{ type: 'text', text: 'An answer about the harbour.' }], stopReason: 'end_turn', usage: { inputTokens: 1, outputTokens: 1 } } };
  },
}));

const d = ON ? describe : describe.skip;
const LONG = 'L'.repeat(700);           // longer than the chapter-scope 600-char cut
const tail = (i: number) => `ARC-END-${i}`;

d('Whole-book conversation · route walk (fictional manuscript)', () => {
  let A = '', work = '', ms = '', draftId = '';
  const sec: string[] = [];
  const last = () => systems[systems.length - 1] ?? '';

  const post = async (body: Record<string, unknown>) => {
    CURRENT_MEMBER = A;
    const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    const res = await POST(new NextRequest(`http://localhost/api/sovereign/manuscripts/${ms}/ask`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sanctuary: false, ...body }) }),
      { params: Promise.resolve({ id: ms }) });
    return { status: res.status, json: await res.json() as Record<string, any> };
  };

  beforeAll(async () => {
    A = (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`,
      [`wbA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`])).rows[0]!.id;
    work = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title,purpose) VALUES ($1,'The Long Harbour','A book about leaving.') RETURNING id`, [A])).rows[0]!.id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'The Long Harbour') RETURNING id`, [A])).rows[0]!.id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [work, ms, A]);
    draftId = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash,section_addressable_at) VALUES ($1,$2,'','h',NULL) RETURNING id`, [ms, A])).rows[0]!.id;
    const heads = ['The Harbour', 'Salt', 'Return'];
    const texts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const body = `${heads[i]} body text for a fictional chapter.`;
      const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4) RETURNING id`, [ms, i + 1, heads[i], body])).rows[0]!.id;
      texts.push(`${heads[i]}\n\n${body}`);
      sec.push((await query<{ id: string }>(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,$2,$3,$4) RETURNING id`, [draftId, i + 1, texts[i], src])).rows[0]!.id);
    }
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [draftId, texts.join('')]);
    const digests = (await query<{ id: string; dg: string }>(`SELECT id, encode(sha256(convert_to(text,'UTF8')),'hex') dg FROM manuscript_draft_sections WHERE draft_id=$1`, [draftId])).rows;
    const readState = { sections: Object.fromEntries(digests.map((x) => [x.id, { digest: x.dg }])) };
    const coverage = { sections: Object.fromEntries(sec.map((id) => [id, 'body'])) };
    const obs = (lens: string, n: number) => Array.from({ length: n }, (_, i) => ({
      key: `o${i + 1}`, lens, phenomenon: 'recurrence', observation: `${lens} sees the harbour ${LONG} ${lens === 'arc' ? tail(i + 1) : ''}`,
      doesNotEstablish: ['author-intent'], evidenceRefs: [{ kind: 'section', sectionId: sec[i % 3] }], structureDependency: 'none' }));
    for (const [lens, n, day] of [['arc', 10, 1], ['voice', 2, 2]] as const) {
      await query(`INSERT INTO developmental_readings(manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
        VALUES ($1,$2,$3,1,$4,'{"kind":"whole"}',$5,$6,'fp','reading',$7,'{}','{}', NOW() - ($8 || ' days')::interval)`,
        [ms, A, draftId, lens, JSON.stringify(readState), JSON.stringify(coverage), JSON.stringify(obs(lens, n)), String(10 - day)]);
    }
  });

  it('WBW1 "the whole book" declared: every arc observation reaches her uncut, the scope is saved with her answer and returned', async () => {
    const r = await post({ anchor: { on: 'work' }, question: 'What is it about?', sectionId: sec[0], carryScope: 'whole_book' });
    expect(r.status).toBe(200);
    expect(last()).toContain('THE WHOLE BOOK');
    for (let i = 1; i <= 10; i++) expect(last()).toContain(tail(i));
    expect(last()).toContain(LONG);
    expect(r.json.carryScope).toBe('whole_book');
    const prov = (await query<{ p: any }>(`SELECT answer_provenance p FROM ask_turns WHERE thread_id=$1 AND speaker='maia' ORDER BY turn_index DESC LIMIT 1`, [r.json.threadId])).rows[0]!.p;
    expect(prov.carryScope).toBe('whole_book');
    expect(prov.carriedReadings.length).toBe(2);
  });

  it('WBW2 where I am (default): the chapter limits hold — at most eight observations, cut at 600 chars', async () => {
    const r = await post({ anchor: { on: 'work' }, question: 'What is it about?', sectionId: sec[0] });
    expect(r.status).toBe(200);
    expect(last()).not.toContain('THE WHOLE BOOK');
    expect(last()).toContain('arc sees the harbour');            // not vacuous: her reading IS carried, under the chapter limits
    expect(last()).not.toContain(tail(10));
    expect(last()).not.toContain(LONG);
    expect(r.json.carryScope).toBeUndefined();
  });

  it('WBW3 a whole-book phrase alone does NOT switch the scope (D1: only the writer\'s control does)', async () => {
    await post({ anchor: { on: 'work' }, question: 'Across the whole book, what holds?', sectionId: sec[0] });
    expect(last()).not.toContain('THE WHOLE BOOK');
  });

  it('WBW5 an older complete reading is not lost behind 30+ newer readings (review finding 1)', async () => {
    const digests = (await query<{ id: string; dg: string }>(`SELECT id, encode(sha256(convert_to(text,'UTF8')),'hex') dg FROM manuscript_draft_sections WHERE draft_id=$1`, [draftId])).rows;
    const readState = JSON.stringify({ sections: Object.fromEntries(digests.map((x) => [x.id, { digest: x.dg }])) });
    const coverage = JSON.stringify({ sections: Object.fromEntries(sec.map((id) => [id, 'body'])) });
    for (let i = 0; i < 31; i++) {
      await query(`INSERT INTO developmental_readings(manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
        VALUES ($1,$2,$3,1,'voice','{"kind":"whole"}',$4,$5,'fp','reading',$6,'{}','{}', NOW() - ($7 || ' minutes')::interval)`,
        [ms, A, draftId, readState, coverage,
         JSON.stringify([{ key: 'o1', lens: 'voice', phenomenon: 'recurrence', observation: `voice newer ${i}`, doesNotEstablish: ['author-intent'], evidenceRefs: [{ kind: 'section', sectionId: sec[0] }], structureDependency: 'none' }]),
         String(i + 1)]);
    }
    await post({ anchor: { on: 'work' }, question: 'What is it about?', sectionId: sec[0], carryScope: 'whole_book' });
    expect(last()).toContain(tail(1));                     // the arc reading (9 days old) is still carried
    expect(last()).toContain('voice newer 0');            // and the newest voice reading is the one carried for that lens
  });

  it('WBW6 a reading of an older revision of the same draft says so (review finding 3)', async () => {
    const content = (await query<{ c: string }>(`SELECT content c FROM manuscript_working_drafts WHERE id=$1`, [draftId])).rows[0]!.c;
    for (const n of [1, 2]) {
      await query(`INSERT INTO working_draft_revisions(draft_id,revision_number,content,saved_by) VALUES ($1,$2,$3,$4)`, [draftId, n, content, A]);
    }
    await post({ anchor: { on: 'work' }, question: 'What is it about?', sectionId: sec[0], carryScope: 'whole_book' });
    expect(last()).toContain('the current draft is revision 2');
  });

  it('WBW4 Sanctuary carries nothing, even with the whole book declared', async () => {
    await post({ anchor: { on: 'work' }, question: 'What is it about?', sectionId: sec[0], carryScope: 'whole_book', sanctuary: true });
    expect(last()).not.toContain('THE WHOLE BOOK');
    expect(last()).not.toContain(tail(1));
  });
});
