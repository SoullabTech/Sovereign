/**
 * SANCTUARY CLOSURE — negative suite for one frozen candidate (product source frozen at 94175aff4f4f).
 * Provider-off (MAIA's model is a scripted double), fictional rows only, REAL routes, REAL PostgreSQL 16, and the durable stores
 * inspected DIRECTLY before and after — never the HTTP response alone. Every not-kept request carries a unique marker; the final
 * check searches every column that could hold conversation content for any marker.
 * Disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only and DATABASE_URL is loopback. Run in band.
 */
import { describe, expect, it, beforeAll, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only' && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
let CURRENT = '';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => CURRENT }));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: async () => ({ ok: true, result: { content: [{ type: 'text', text: 'A plain answer.' }] } }),
}));
const d = ON ? describe : describe.skip;
const MARK = `SANCT-${Date.now()}`;
let n = 0;
const marker = () => `${MARK}-${++n}`;

d('Sanctuary closure — frozen-candidate negative suite', () => {
  let A = '', B = '', workA = '', msA = '', lwA = '';
  const sec: string[] = [];

  const req = (body: unknown, method = 'POST') => new NextRequest('http://localhost/x', { method, headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const ask = async (who: string, body: Record<string, unknown>, ms = msA) => {
    CURRENT = who; const { POST } = await import('@/app/api/sovereign/manuscripts/[id]/ask/route');
    const r = await POST(req(body), { params: Promise.resolve({ id: ms }) });
    return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, any> };
  };
  const askLW = async (who: string, body: Record<string, unknown>, lw = lwA) => {
    CURRENT = who; const { POST } = await import('@/app/api/sovereign/living-works/[id]/ask/route');
    const r = await POST(req(body), { params: Promise.resolve({ id: lw }) });
    return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, any> };
  };
  /** Every place a conversation, reading, plan, decision or correction could have kept a marker. */
  const leaked = async () => {
    const like = `%${MARK}%`;
    const probes: [string, string][] = [
      ['ask_turns.body', `SELECT COUNT(*)::int n FROM ask_turns WHERE body LIKE $1`],
      ['ask_turns.answer_provenance', `SELECT COUNT(*)::int n FROM ask_turns WHERE answer_provenance::text LIKE $1`],
      ['writer_decision_events', `SELECT COUNT(*)::int n FROM writer_decision_events WHERE row_to_json(writer_decision_events)::text LIKE $1`],
      ['writer_studio_corrections', `SELECT COUNT(*)::int n FROM writer_studio_corrections WHERE row_to_json(writer_studio_corrections)::text LIKE $1`],
      ['development_plans', `SELECT COUNT(*)::int n FROM development_plans WHERE row_to_json(development_plans)::text LIKE $1`],
      ['developmental_readings', `SELECT COUNT(*)::int n FROM developmental_readings WHERE row_to_json(developmental_readings)::text LIKE $1`],
      ['writer_studio_work_themes', `SELECT COUNT(*)::int n FROM writer_studio_work_themes WHERE row_to_json(writer_studio_work_themes)::text LIKE $1`],
      ['living_work_writer_understanding', `SELECT COUNT(*)::int n FROM living_work_writer_understanding WHERE row_to_json(living_work_writer_understanding)::text LIKE $1`],
    ];
    const out: Record<string, number> = {};
    for (const [name, sql] of probes) out[name] = (await query<{ n: number }>(sql, [like])).rows[0]!.n;
    return out;
  };
  const counts = async (who: string) => (await query<{ th: number; tu: number }>(
    `SELECT (SELECT COUNT(*) FROM ask_threads WHERE member_id=$1)::int th,
            (SELECT COUNT(*) FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1)::int tu`, [who])).rows[0]!;

  beforeAll(async () => {
    const m = async (k: string) => (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`, [`${k}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
    A = await m('scA'); B = await m('scB');
    workA = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Closure book') RETURNING id`, [A])).rows[0].id;
    lwA = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Before its manuscript') RETURNING id`, [A])).rows[0].id;
    msA = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id,title) VALUES ($1,'Closure book') RETURNING id`, [A])).rows[0].id;
    await query(`INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [workA, msA, A]);
    const draft = (await query<{ id: string }>(`INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash,section_addressable_at) VALUES ($1,$2,'','h',NULL) RETURNING id`, [msA, A])).rows[0].id;
    const H = ['Shore', 'Tide'];
    const texts = H.map((h) => `${h}\n\nBody of ${h}.`);
    for (let i = 0; i < 2; i++) {
      const src = (await query<{ id: string }>(`INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4) RETURNING id`, [msA, i + 1, H[i], `Body of ${H[i]}.`])).rows[0].id;
      sec.push((await query<{ id: string }>(`INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) VALUES ($1,$2,$3,$4) RETURNING id`, [draft, i + 1, texts[i], src])).rows[0].id);
    }
    await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [draft, texts.join('')]);
  });

  it('N1 absent, malformed, forged and contradictory postures keep nothing (Work + Living Work conversations)', async () => {
    const before = await counts(A);
    const postures: unknown[] = [undefined, null, 'false', 0, 1, 'yes', {}, [], 'true', true];
    for (const p of postures) {
      const body = (q: string) => (p === undefined ? { question: q } : { question: q, sanctuary: p });
      const w = await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], ...body(marker()) });
      expect([String(p), w.status, w.json.sanctuary?.notKept ?? w.json.refusal]).toEqual([String(p), 200, true]);
      const l = await askLW(A, body(marker()));
      expect([String(p), l.json.sanctuary?.notKept ?? l.status]).toEqual([String(p), typeof p === 'boolean' || p === undefined ? true : 400]);
    }
    // contradiction: ordinary on top, Sanctuary nested
    const c = await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], question: marker(), sanctuary: false, meta: { sanctuary: true } });
    expect(c.json.sanctuary?.notKept).toBe(true);
    expect(await counts(A)).toEqual(before);
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N2 changing posture within one conversation: only the ordinary turns are kept, each exactly once', async () => {
    const o1 = await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], question: 'ordinary one', sanctuary: false });
    expect(o1.status).toBe(200);
    const thread = o1.json.threadId as string;
    const after1 = await counts(A);
    await ask(A, { threadId: thread, sectionId: sec[0], question: marker(), sanctuary: true });
    await ask(A, { threadId: thread, sectionId: sec[0], question: marker() });
    await ask(A, { threadId: thread, sectionId: sec[0], question: 'ordinary two', sanctuary: false });
    const after2 = await counts(A);
    expect(after2.tu).toBe(after1.tu + 2);
    const bodies = (await query<{ body: string }>(`SELECT body FROM ask_turns WHERE thread_id=$1 AND speaker='author' ORDER BY turn_index`, [thread])).rows.map((r) => r.body);
    expect(bodies).toEqual(['ordinary one', 'ordinary two']);
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N3 concurrent requests on one conversation, mixed postures: Sanctuary ones keep nothing, ordinary ones are each kept', async () => {
    const o = await ask(A, { anchor: { on: 'work' }, sectionId: sec[1], question: 'opening', sanctuary: false });
    const thread = o.json.threadId as string;
    const before = (await query<{ n: number }>(`SELECT COUNT(*)::int n FROM ask_turns WHERE thread_id=$1`, [thread])).rows[0]!.n;
    const jobs = Array.from({ length: 10 }, (_, i) => i % 2 === 0
      ? ask(A, { threadId: thread, sectionId: sec[1], question: marker(), sanctuary: true })
      : ask(A, { threadId: thread, sectionId: sec[1], question: `ordinary concurrent ${i}`, sanctuary: false }));
    // Wait for EVERY request to finish (a rejected one must not leave others writing into the next test).
    const settled = await Promise.allSettled(jobs);
    const sanctuaryOk = settled.filter((r, i) => i % 2 === 0 && r.status === 'fulfilled' && r.value.json.sanctuary?.notKept === true).length;
    const ordinaryOk = settled.filter((r, i) => i % 2 === 1 && r.status === 'fulfilled' && r.value.status === 200).length;
    const ordinaryFailed = 5 - ordinaryOk;
    const after = (await query<{ n: number }>(`SELECT COUNT(*)::int n FROM ask_turns WHERE thread_id=$1`, [thread])).rows[0]!.n;
    const authorRows = (await query<{ n: number }>(`SELECT COUNT(*)::int n FROM ask_turns WHERE thread_id=$1 AND speaker='author' AND body LIKE 'ordinary concurrent%'`, [thread])).rows[0]!.n;
    // Sanctuary: every one answered, none kept — regardless of the race.
    expect(sanctuaryOk).toBe(5);
    // Ordinary: recorded as observed. A loser of the known turn-index race (THREAD_STORE_CONCURRENT_TURN_COLLISION, routed) may fail.
    // Its author turn may already be kept without an answer — measured here, not hidden.
    console.info('[N3] ordinary ok', ordinaryOk, 'failed', ordinaryFailed, 'turns added', after - before, 'ordinary author rows', authorRows);
    expect(after - before).toBeGreaterThanOrEqual(ordinaryOk * 2);
    expect(after - before).toBeLessThanOrEqual(ordinaryOk * 2 + ordinaryFailed);
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N4 failed writes and retries: an injected failure keeps nothing half-written; a Sanctuary retry keeps nothing; an ordinary retry keeps once', async () => {
    await query(`CREATE OR REPLACE FUNCTION sc_fail_maia() RETURNS trigger AS $$ BEGIN IF NEW.speaker = 'maia' AND NEW.body = 'A plain answer.' AND current_setting('sc.fail', true) = 'on' THEN RAISE EXCEPTION 'injected'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql`);
    await query(`DROP TRIGGER IF EXISTS sc_fail_maia ON ask_turns; CREATE TRIGGER sc_fail_maia BEFORE INSERT ON ask_turns FOR EACH ROW EXECUTE FUNCTION sc_fail_maia()`);
    try {
      await query(`ALTER DATABASE ${(await query<{ d: string }>(`SELECT current_database() d`)).rows[0]!.d} SET sc.fail = 'on'`);
      // the setting applies to new sessions; the pool may hold old ones — so assert on what is durable, not on the status code
      const before = await counts(A);
      await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], question: marker(), sanctuary: true }).catch(() => null);
      expect(await counts(A)).toEqual(before);
    } finally {
      await query(`ALTER DATABASE ${(await query<{ d: string }>(`SELECT current_database() d`)).rows[0]!.d} RESET sc.fail`);
      await query(`DROP TRIGGER IF EXISTS sc_fail_maia ON ask_turns`);
    }
    const before = await counts(A);
    const retry = await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], question: marker(), sanctuary: true });
    expect(retry.json.sanctuary?.notKept).toBe(true);
    expect(await counts(A)).toEqual(before);
    const ord = await ask(A, { anchor: { on: 'work' }, sectionId: sec[0], question: 'ordinary after retry', sanctuary: false });
    expect(ord.status).toBe(200);
    expect((await counts(A)).tu).toBe(before.tu + 2);
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N5 cross-member: another member reaches nothing of this Work in any posture, and nothing of theirs is kept here', async () => {
    const beforeA = await counts(A), beforeB = await counts(B);
    for (const p of [false, true, undefined, 'no_live_settings']) {
      const body = p === undefined ? { question: marker() } : { question: marker(), sanctuary: p };
      expect((await ask(B, { anchor: { on: 'work' }, sectionId: sec[0], ...body })).status).toBe(404);
      expect((await askLW(B, body)).status).toBe(404);
    }
    const t = (await query<{ id: string }>(`SELECT id FROM ask_threads WHERE member_id=$1 LIMIT 1`, [A])).rows[0]!.id;
    expect((await ask(B, { threadId: t, question: marker(), sanctuary: false })).status).toBe(404);
    expect(await counts(A)).toEqual(beforeA);
    expect(await counts(B)).toEqual(beforeB);
  });

  it('N6 kept-record attempts in Sanctuary or undeclared: readings, plans, decisions, corrections — refused, nothing kept, MAIA not asked', async () => {
    const call = async (path: string, method: string, params: Record<string, string>, body: Record<string, unknown>) => {
      CURRENT = A; const mod = await import(`@/app/api/${path}/route`) as Record<string, (r: NextRequest, c: unknown) => Promise<Response>>;
      const r = await mod[method]!(req(body, method), { params: Promise.resolve(params) });
      return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, unknown> };
    };
    for (const p of [true, undefined, 'false']) {
      const s = (b: Record<string, unknown>) => (p === undefined ? b : { ...b, sanctuary: p });
      for (const [path, method, params, body] of [
        ['sovereign/manuscripts/[id]/readings', 'POST', { id: msA }, { lens: 'overview' }],
        ['sovereign/manuscripts/[id]/plans', 'POST', { id: msA }, { ask: marker() }],
        ['sovereign/living-works/[id]/decisions', 'POST', { id: workA }, { action: 'settle', saidIn: marker() }],
        ['sovereign/living-works/[id]/corrections', 'POST', { id: workA }, { threadId: crypto.randomUUID(), maiaTurnIndex: 1, kind: 'other', correction: marker() }],
      ] as [string, string, Record<string, string>, Record<string, unknown>][]) {
        const r = await call(path, method, params, s(body));
        expect([path, String(p), r.status]).toEqual([path, String(p), 409]);
      }
    }
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N7 direct store bypass: the thread store refuses every write without a witness, whatever the caller', async () => {
    const store = await import('@/lib/manuscript/ask/threadStore');
    const before = await counts(A);
    const forged = [undefined, null, { source: 'declared_ordinary' }, true, 'ordinary'];
    for (const keep of forged) {
      await expect(store.openThread({ manuscriptId: msA, memberId: A, anchor: { on: 'work' } as never, reading: null, canonicalAtOpen: 'c', initiatedBy: 'author', keep } as never)).rejects.toThrow('sanctuary_write_refused');
      const t = (await query<{ id: string }>(`SELECT id FROM ask_threads WHERE member_id=$1 LIMIT 1`, [A])).rows[0]!.id;
      await expect(store.appendTurn({ threadId: t, memberId: A, speaker: 'author', body: marker(), staleness: { state: 'current' } as never, keep } as never)).rejects.toThrow('sanctuary_write_refused');
    }
    expect(await counts(A)).toEqual(before);
    expect(Object.values(await leaked()).every((x) => x === 0)).toBe(true);
  });

  it('N8 final direct inspection: no marker from any not-kept request exists anywhere it could have been kept', async () => {
    const found = await leaked();
    expect(found).toEqual(Object.fromEntries(Object.keys(found).map((k) => [k, 0])));
    expect(n).toBeGreaterThan(40);   // the suite really did send that many not-kept requests
  });
});
