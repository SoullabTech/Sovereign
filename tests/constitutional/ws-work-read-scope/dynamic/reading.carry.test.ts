/**
 * G6 · MAIA's own completed readings carried into the Work conversation (founder ruling 2026-11-09). REAL Ask route, REAL database,
 * SCRIPTED model. Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Fictional manuscript only.
 * Fixture note: reading rows are inserted with session_replication_role=replica (their commission/freeze pipeline is out of scope);
 * the carry logic under test runs unmodified.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
let answer = 'A plain answer.';
const systems: string[] = [];
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async (req: { system: string }) => { systems.push(req.system); return { ok: true, result: { content: [{ type: 'text', text: answer }] } }; },
}));
const d = ON ? describe : describe.skip;
const sha = (t: string) => createHash('sha256').update(t, 'utf8').digest('hex');

d('G6 · a reading she made reaches the next conversation, labelled, on the commission’s terms', () => {
  const H = ['The Harbour', 'Salt', 'Return'];
  const B = ['The harbour woke slowly, and a hiker with a map stood on the quay.', 'Marta carried the nets uphill every morning.', 'When she returned, the hiker with the map was gone.'];
  let A = '', other = '', work = '', ms = '', draft = '', otherMs = '';
  const sec: string[] = [];
  const texts = H.map((h, i) => `${h}\n\n${B[i]}`);

  const post = async (who: string, body: Record<string, unknown>, id = ms) => {
    CURRENT = who; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id }) });
    return { status: res.status, json: await res.json() as Record<string, any> };
  };
  const reading = async (o: { member?: string; manuscript?: string; lens?: string; sections: string[]; text: string; at: string; digestOf?: (i: number) => string }) => {
    const id = crypto.randomUUID();
    const readState = { sections: Object.fromEntries(o.sections.map((sid) => [sid, { revisionNumber: 4, range: { start: 0, end: 1 }, digest: o.digestOf ? o.digestOf(sec.indexOf(sid)) : sha(texts[sec.indexOf(sid)]!) }])) };
    const coverage = { sections: Object.fromEntries(sec.map((sid) => [sid, o.sections.includes(sid) ? 'body' : 'position'])) };
    await query(`BEGIN; SET LOCAL session_replication_role = replica;
      INSERT INTO developmental_readings (id, manuscript_id, member_id, draft_id, revision_number, commissioned_lens, scope, read_state, coverage, input_fingerprint, outcome, observations, reader_provenance, classifier_provenance, frozen_at)
      VALUES ('${id}', '${o.manuscript ?? ms}', '${o.member ?? A}', '${draft}', 4, '${o.lens ?? 'development'}', '{}'::jsonb, '${JSON.stringify(readState)}'::jsonb, '${JSON.stringify(coverage)}'::jsonb, 'fp', 'reading',
        '${JSON.stringify([{ key: 'o1', text: o.text, doesNotEstablish: ['author-intent'] }]).replace(/'/g, "''")}'::jsonb, '{}'::jsonb, '{}'::jsonb, '${o.at}'); COMMIT;`);
    return id;
  };
  const last = () => systems.at(-1) ?? '';

  beforeAll(async () => {
    const m = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
    A = await m('g6A'); other = await m('g6B');
    work = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'The Long Harbour') RETURNING id`, [A])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'The Long Harbour') RETURNING id`, [A])).rows[0].id;
    otherMs = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Another book') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [work, ms, A]);
    draft = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash,section_addressable_at) VALUES ($1,$2,'','h',NULL) RETURNING id`, [ms, A])).rows[0].id;
    for (let i = 0; i < 3; i++) {
      const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4) RETURNING id`, [ms, i + 1, H[i], B[i]])).rows[0].id;
      sec.push((await query<{ id: string }>(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,$2,$3,$4) RETURNING id`, [draft, i + 1, texts[i], src])).rows[0].id);
    }
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [draft, texts.join('')]);
  });

  it('the Nov 8 case, WITHOUT reading permission: she has her reading of the chapter (lens, revision), no chapter text, and is pointed at the permission, not the button', async () => {
    await reading({ sections: [sec[2]!], text: 'The hiker with the map returns at the end, now absent.', at: '2026-11-08T10:00:00Z' });
    const r = await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker with the map come back?', sectionId: sec[2], sanctuary: false });
    expect(r.status).toBe(200);
    expect(last()).toContain('YOUR EARLIER READINGS OF THIS WORK');
    expect(last()).toContain('The hiker with the map returns at the end, now absent.');
    expect(last()).toMatch(/through the development lens, read 2026-11-08, from revision 4/i);
    expect(last()).toContain('Return (unchanged since)');
    expect(last()).toContain('Let MAIA read my saved work');
    expect(last()).toContain('Do NOT send them to "Read this chapter"');
    expect(last()).not.toContain('THE WRITER HAS GIVEN YOU STANDING PERMISSION');       // her reading never brings chapter text
    const rec = await query<{ reading_id: string; revision_number: number }>(`SELECT reading_id, revision_number FROM ask_turn_readings WHERE thread_id=$1`, [r.json.threadId]);
    expect(rec.rows).toHaveLength(1);
    expect(rec.rows[0]!.revision_number).toBe(4);
  });

  it('Sanctuary, or an unstated posture, carries nothing', async () => {
    await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker come back?', sectionId: sec[2], sanctuary: true });
    expect(last()).not.toContain('YOUR EARLIER READINGS');
    await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker come back?', sectionId: sec[2] });
    expect(last()).not.toContain('YOUR EARLIER READINGS');
  });

  it('a chapter edited since her reading is labelled CHANGED', async () => {
    await query(`BEGIN; SET LOCAL session_replication_role = replica; UPDATE manuscript_draft_sections SET text='Return\n\nShe never came back.' WHERE id='${sec[2]}'; COMMIT;`);
    await post(A, { anchor: { on: 'work' }, question: 'What did you see in Return?', sectionId: sec[2], sanctuary: false });
    expect(last()).toContain('Return (CHANGED since you read it)');
    await query(`BEGIN; SET LOCAL session_replication_role = replica; UPDATE manuscript_draft_sections SET text='${texts[2]!.replace(/'/g, "''")}' WHERE id='${sec[2]}'; COMMIT;`);
  });

  it('per lens, not "latest wins": a newer voice reading sits beside the older development reading; an older reading of the same lens is not carried', async () => {
    await reading({ lens: 'development', sections: [sec[2]!], text: 'OLDER development observation.', at: '2026-11-01T10:00:00Z' });
    await reading({ lens: 'voice', sections: [sec[2]!], text: 'The voice cools in Return.', at: '2026-11-09T09:00:00Z' });
    await post(A, { anchor: { on: 'work' }, question: 'Tell me about Return.', sectionId: sec[2], sanctuary: false });
    expect(last()).toContain('The voice cools in Return.');
    expect(last()).toContain('The hiker with the map returns at the end, now absent.');
    expect(last()).not.toContain('OLDER development observation.');
  });

  it('only readings of the chapters in play; never another manuscript’s, never another member’s', async () => {
    await reading({ sections: [sec[1]!], text: 'Salt-only observation.', at: '2026-11-09T11:00:00Z' });
    await reading({ manuscript: otherMs, sections: [sec[2]!], text: 'FROM ANOTHER BOOK.', at: '2026-11-09T12:00:00Z' });
    await reading({ member: other, sections: [sec[2]!], text: 'FROM ANOTHER MEMBER.', at: '2026-11-09T12:00:00Z' });
    await post(A, { anchor: { on: 'work' }, question: 'Tell me about Return.', sectionId: sec[2], sanctuary: false });
    expect(last()).not.toContain('Salt-only observation.');
    expect(last()).not.toContain('FROM ANOTHER BOOK.');
    expect(last()).not.toContain('FROM ANOTHER MEMBER.');
    await post(A, { anchor: { on: 'work' }, question: 'How does Salt work?', sectionId: sec[2], sanctuary: false });
    expect(last()).toContain('Salt-only observation.');                                    // named in the question → in play
  });

  it('her earlier account never grounds a quotation of the writing', async () => {
    await reading({ lens: 'arc', sections: [sec[2]!], text: 'She writes: "the lantern burned until the harbour forgot her name" here.', at: '2026-11-09T13:00:00Z' });
    answer = 'In Return you wrote "the lantern burned until the harbour forgot her name".';
    const r = await post(A, { anchor: { on: 'work' }, question: 'Quote Return for me.', sectionId: sec[2], sanctuary: false });
    answer = 'A plain answer.';
    const turns = await query<{ body: string }>(`SELECT body FROM ask_turns WHERE thread_id=$1 AND speaker='maia' ORDER BY turn_index DESC LIMIT 1`, [r.json.threadId]);
    expect(turns.rows[0]!.body).not.toContain('the lantern burned until the harbour forgot her name');
  });

  it('with reading permission she ALSO gets the text, as before; the reading stays labelled as her account', async () => {
    CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/read-scope/route');
    await POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ action: 'grant', level: 'work' }) }), { params: Promise.resolve({ id: ms }) });
    await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker with the map come back?', sectionId: sec[2], sanctuary: false });
    expect(last()).toContain('THE WRITER HAS GIVEN YOU STANDING PERMISSION');
    expect(last()).toContain('YOUR EARLIER READINGS OF THIS WORK');
    expect(last()).toContain('When she returned, the hiker with the map was gone.');
  });
});
