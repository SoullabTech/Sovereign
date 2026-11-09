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
        '${JSON.stringify([{ key: 'o1', observation: o.text, doesNotEstablish: ['author-intent'] }]).replace(/'/g, "''")}'::jsonb, '{}'::jsonb, '{}'::jsonb, '${o.at}'); COMMIT;`);
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

  it('SANCTUARY STORES NOTHING (founder ruling 2026-11-09): no thread, no turn — fresh or continuing — yet she answers; ordinary still stores', async () => {
    const counts = async () => (await query<{ th: string; tu: string }>(
      `SELECT (SELECT COUNT(*) FROM ask_threads WHERE member_id=$1)::text th,
              (SELECT COUNT(*) FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1)::text tu`, [A])).rows[0]!;
    const before = await counts();
    const fresh = await post(A, { anchor: { on: 'work' }, question: 'In Sanctuary: tell me about Return.', sectionId: sec[2], sanctuary: true });
    expect(fresh.status).toBe(200);
    expect(fresh.json.sanctuary).toMatchObject({ notKept: true, question: 'In Sanctuary: tell me about Return.', answer: 'A plain answer.' });
    expect(fresh.json.threadId).toBeNull();
    expect(await counts()).toEqual(before);                                                   // nothing created, nothing written
    const ordinary = await post(A, { anchor: { on: 'work' }, question: 'Ordinary now.', sectionId: sec[2], sanctuary: false });
    const after1 = await counts();
    expect(Number(after1.tu)).toBe(Number(before.tu) + 2);                                     // ordinary keeps both turns
    const cont = await post(A, { threadId: ordinary.json.threadId, question: 'Switching to Sanctuary mid-conversation.', sectionId: sec[2], sanctuary: true });
    expect(cont.status).toBe(200);
    expect(cont.json.sanctuary?.notKept).toBe(true);
    expect(await counts()).toEqual(after1);                                                    // continuing in Sanctuary writes nothing either
    const rows = await query(`SELECT 1 FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1 AND t.body LIKE '%Sanctuary%'`, [A]);
    expect(rows.rows.length).toBe(0);
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
    // the record is in the SAME ROW as her answer: saved with it or not at all (no best-effort side table)
    const rec = await query<{ p: { carriedReadings?: { readingId: string; revisionNumber: number }[] } }>(
      `SELECT answer_provenance p FROM ask_turns WHERE thread_id=$1 AND speaker='maia' ORDER BY turn_index DESC LIMIT 1`, [r.json.threadId]);
    expect(rec.rows[0]!.p.carriedReadings).toHaveLength(1);
    expect(rec.rows[0]!.p.carriedReadings![0]!.revisionNumber).toBe(4);
  });

  it('SANCTUARY CLOSURE (founder ruling 2026-11-09): an UNDECLARED posture keeps nothing in the Work conversation, fresh or continuing', async () => {
    const counts = async () => (await query<{ th: string; tu: string }>(
      `SELECT (SELECT COUNT(*) FROM ask_threads WHERE member_id=$1)::text th,
              (SELECT COUNT(*) FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1)::text tu`, [A])).rows[0]!;
    const before = await counts();
    const fresh = await post(A, { anchor: { on: 'work' }, question: 'Undeclared: tell me about Return.', sectionId: sec[2] });
    expect(fresh.status).toBe(200);
    expect(fresh.json.sanctuary?.notKept).toBe(true);
    expect(fresh.json.threadId).toBeNull();
    expect(await counts()).toEqual(before);
    const ordinary = await post(A, { anchor: { on: 'work' }, question: 'Declared ordinary.', sectionId: sec[2], sanctuary: false });
    const after1 = await counts();
    expect(Number(after1.tu)).toBe(Number(before.tu) + 2);
    const cont = await post(A, { threadId: ordinary.json.threadId, question: 'Undeclared, continuing.', sectionId: sec[2] });
    expect(cont.json.sanctuary?.notKept).toBe(true);
    expect(await counts()).toEqual(after1);
    expect((await query(`SELECT 1 FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1 AND t.body LIKE '%Undeclared%'`, [A])).rows.length).toBe(0);
  });

  it('SANCTUARY CLOSURE: the reading-anchored lanes (structure, developmental) refuse in Sanctuary or undeclared, BEFORE any write', async () => {
    const threads = async () => (await query<{ n: string }>(`SELECT COUNT(*)::text n FROM ask_threads WHERE member_id=$1`, [A])).rows[0]!.n;
    const before = await threads();
    const anchors = [
      { on: 'division', proposalId: crypto.randomUUID(), unitId: 'u1' },
      { on: 'observation', readingId: crypto.randomUUID(), observationKey: 'o1' },
    ];
    for (const anchor of anchors) {
      const s1 = await post(A, { anchor, question: 'In Sanctuary.', sanctuary: true });
      expect([s1.status, s1.json.refusal]).toEqual([409, 'sanctuary_not_kept']);
      const u1 = await post(A, { anchor, question: 'Undeclared.' });
      expect([u1.status, u1.json.refusal]).toEqual([409, 'posture_undeclared']);
      const ok = await post(A, { anchor, question: 'Ordinary.', sanctuary: false });
      expect(ok.json.refusal).not.toBe('sanctuary_not_kept');                                  // ordinary passes the gate (and is refused later, for the made-up reading)
      expect(ok.json.refusal).not.toBe('posture_undeclared');
    }
    expect(await threads()).toBe(before);
  });

  it('SANCTUARY CLOSURE: the Living Work conversation (before a manuscript) keeps nothing in Sanctuary or undeclared; ordinary keeps', async () => {
    const lw = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'A work before its manuscript') RETURNING id`, [A])).rows[0].id;
    const postLW = async (body: Record<string, unknown>) => {
      CURRENT = A; const { POST } = await import('@/app/api/sovereign/living-works/[id]/ask/route');
      const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: lw }) });
      return { status: res.status, json: await res.json() as Record<string, any> };
    };
    const n = async () => (await query<{ th: string; tu: string }>(
      `SELECT (SELECT COUNT(*) FROM ask_threads WHERE living_work_id=$1)::text th,
              (SELECT COUNT(*) FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.living_work_id=$1)::text tu`, [lw])).rows[0]!;
    const s1 = await postLW({ question: 'In Sanctuary.', sanctuary: true });
    expect([s1.status, s1.json.sanctuary?.notKept, s1.json.threadId]).toEqual([200, true, null]);
    const u1 = await postLW({ question: 'Undeclared.' });
    expect([u1.status, u1.json.sanctuary?.notKept]).toEqual([200, true]);
    expect(await n()).toEqual({ th: '0', tu: '0' });
    const o1 = await postLW({ question: 'Ordinary.', sanctuary: false });
    expect(o1.status).toBe(200);
    expect(await n()).toEqual({ th: '1', tu: '2' });
    const c1 = await postLW({ threadId: o1.json.threadId, question: 'Undeclared, continuing.' });
    expect(c1.json.sanctuary?.notKept).toBe(true);
    expect(await n()).toEqual({ th: '1', tu: '2' });
    expect((await postLW({ question: 'Malformed.', sanctuary: 'yes' })).status).toBe(400);
  });

  it('SANCTUARY CLOSURE: a reading (a kept record) is never commissioned in Sanctuary or undeclared', async () => {
    const postR = async (body: Record<string, unknown>) => {
      CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/readings/route');
      const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: ms }) });
      return { status: res.status, json: await res.json() as Record<string, any> };
    };
    const count = async () => (await query<{ n: string }>(`SELECT COUNT(*)::text n FROM developmental_readings WHERE manuscript_id=$1`, [ms])).rows[0]!.n;
    const before = await count();
    const sys = systems.length;
    expect(await postR({ lens: 'overview', sanctuary: true })).toMatchObject({ status: 409, json: { refusal: 'sanctuary_not_kept' } });
    expect(await postR({ lens: 'overview' })).toMatchObject({ status: 409, json: { refusal: 'posture_undeclared' } });
    expect(await postR({ lens: 'overview', sanctuary: 'false' })).toMatchObject({ status: 409, json: { refusal: 'posture_undeclared' } });
    expect(await count()).toBe(before);
    expect(systems.length).toBe(sys);                                                              // MAIA was never called
  });

  it('SANCTUARY CLOSURE: a device with no saved setting uses the ACCOUNT default — Sanctuary keeps nothing; Continuity, or no settings row, keeps', async () => {
    const m = async (n: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
    const bookFor = async (who: string) => {
      const lw = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Account default book') RETURNING id`, [who])).rows[0].id;
      return lw;
    };
    const postLW = async (who: string, lw: string, body: Record<string, unknown>) => {
      CURRENT = who; const { POST } = await import('@/app/api/sovereign/living-works/[id]/ask/route');
      const res = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: lw }) });
      return { status: res.status, json: await res.json() as Record<string, any> };
    };
    const turns = async (lw: string) => Number((await query<{ n: string }>(`SELECT COUNT(*)::text n FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.living_work_id=$1`, [lw])).rows[0]!.n);

    const sanct = await m('acctS'); await query(`INSERT INTO member_settings(member_id, default_memory_mode) VALUES ($1,'sanctuary')`, [sanct]);
    const lwS = await bookFor(sanct);
    const s = await postLW(sanct, lwS, { question: 'New device.', sanctuary: 'no_live_settings' });
    expect([s.status, s.json.sanctuary?.notKept]).toEqual([200, true]);
    expect(await turns(lwS)).toBe(0);
    // the explicit live switch still wins for this session (it is the member's own act on this device)
    await postLW(sanct, lwS, { question: 'Turned Sanctuary off here.', sanctuary: false });
    expect(await turns(lwS)).toBe(2);

    const cont = await m('acctC'); await query(`INSERT INTO member_settings(member_id, default_memory_mode) VALUES ($1,'continuity')`, [cont]);
    const lwC = await bookFor(cont);
    await postLW(cont, lwC, { question: 'New device.', sanctuary: 'no_live_settings' });
    expect(await turns(lwC)).toBe(2);

    const none = await m('acctN');
    const lwN = await bookFor(none);
    await postLW(none, lwN, { question: 'New device, never chose.', sanctuary: 'no_live_settings' });
    expect(await turns(lwN)).toBe(2);
    expect((await query(`SELECT 1 FROM member_settings WHERE member_id=$1`, [none])).rows.length).toBe(0);   // read-only: no row created

    // the Work conversation and readings honour the same account default
    await query(`INSERT INTO member_settings(member_id, default_memory_mode) VALUES ($1,'sanctuary') ON CONFLICT (member_id) DO UPDATE SET default_memory_mode='sanctuary'`, [A]);
    try {
      const before = Number((await query<{ n: string }>(`SELECT COUNT(*)::text n FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1`, [A])).rows[0]!.n);
      const w = await post(A, { anchor: { on: 'work' }, question: 'Account default, Work.', sectionId: sec[2], sanctuary: 'no_live_settings' });
      expect(w.json.sanctuary?.notKept).toBe(true);
      expect(Number((await query<{ n: string }>(`SELECT COUNT(*)::text n FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1`, [A])).rows[0]!.n)).toBe(before);
      CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/readings/route');
      const r = await POST(new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lens: 'overview', sanctuary: 'no_live_settings' }) }), { params: Promise.resolve({ id: ms }) });
      expect([r.status, (await r.json()).refusal]).toEqual([409, 'sanctuary_not_kept']);
    } finally {
      await query(`DELETE FROM member_settings WHERE member_id=$1`, [A]);
    }
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

  it('she is told what exists beyond what she was given, so her memory is never silently partial', async () => {
    for (let i = 0; i < 3; i++) await reading({ lens: ['reader', 'structure', 'coherence'][i], sections: [sec[2]!], text: `Extra ${i}.`, at: `2026-11-09T14:0${i}:00Z` });
    await post(A, { anchor: { on: 'work' }, question: 'Tell me about Return.', sectionId: sec[2], sanctuary: false });
    expect(last()).toMatch(/You have made \d+ readings that cover these chapters; you were given 3/);
    expect(last()).toContain('Do not speak as if you remember the ones you were not given.');
  });

  it('a phrase SHE said in an earlier answer never passes later as a quotation of the writing (second-turn test)', async () => {
    answer = 'I wonder whether the harbour keeps every name it is given, and whether that is the heart of it.';   // her words, not a quotation
    const first = await post(A, { anchor: { on: 'work' }, question: 'What might the heart of Return be?', sectionId: sec[2], sanctuary: false });
    answer = 'In Return you wrote "the harbour keeps every name it is given".';
    await post(A, { threadId: first.json.threadId, question: 'Quote that line from Return.', sectionId: sec[2], sanctuary: false });
    answer = 'A plain answer.';
    const turns = await query<{ body: string }>(`SELECT body FROM ask_turns WHERE thread_id=$1 AND speaker='maia' ORDER BY turn_index`, [first.json.threadId]);
    expect(turns.rows[0]!.body).toContain('the harbour keeps every name it is given');        // she may wonder aloud
    expect(turns.rows.at(-1)!.body).not.toContain('you wrote "the harbour keeps every name it is given"');   // but not present it as the writer's text
  });

  it('FAILURE INJECTION: if her answer cannot be saved, its provenance is not saved either, and the writer is told — nothing is silently lost', async () => {
    CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/read-scope/route');
    await POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ action: 'grant', level: 'work' }) }), { params: Promise.resolve({ id: ms }) });
    await query(`CREATE OR REPLACE FUNCTION g6_fail_maia() RETURNS trigger AS $$ BEGIN IF NEW.speaker = 'maia' THEN RAISE EXCEPTION 'injected'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql`);
    await query(`CREATE TRIGGER g6_fail_maia_trigger BEFORE INSERT ON ask_turns FOR EACH ROW EXECUTE FUNCTION g6_fail_maia()`);
    let status = 0; let threadId: string | undefined;
    try {
      const r = await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker come back?', sectionId: sec[2], sanctuary: false }).catch(() => ({ status: 500, json: {} as Record<string, any> }));
      status = r.status; threadId = r.json.threadId;
    } finally {
      await query(`DROP TRIGGER IF EXISTS g6_fail_maia_trigger ON ask_turns`);
    }
    expect(status).toBeGreaterThanOrEqual(500);                                                // the writer sees a failure, never a silent half-record
    if (threadId) {
      const rows = await query(`SELECT 1 FROM ask_turns WHERE thread_id=$1 AND speaker='maia' AND answer_provenance ? 'suppliedSections'`, [threadId]);
      expect(rows.rows.length).toBe(0);                                                         // no orphan provenance: it exists only with an answer
    }
  });

  it('with reading permission she ALSO gets the text, as before; the reading stays labelled as her account', async () => {
    CURRENT = A; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/read-scope/route');
    await POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ action: 'grant', level: 'work' }) }), { params: Promise.resolve({ id: ms }) });
    await post(A, { anchor: { on: 'work' }, question: 'Where does the hiker with the map come back?', sectionId: sec[2], sanctuary: false });
    expect(last()).toContain('THE WRITER HAS GIVEN YOU STANDING PERMISSION');
    expect(last()).toContain('YOUR EARLIER READINGS OF THIS WORK');
    expect(last()).toContain('When she returned, the hiker with the map was gone.');
    const prov = await query<{ p: { suppliedSections?: { sectionId: string; digest: string }[] } }>(
      `SELECT answer_provenance p FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1 AND t.speaker='maia' ORDER BY t.created_at DESC LIMIT 1`, [A]);
    expect(prov.rows[0]!.p.suppliedSections?.some((x) => x.sectionId === sec[2])).toBe(true);   // what she was supplied is in her answer's own row
  });
});
