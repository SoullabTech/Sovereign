/**
 * SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — DB-BACKED ZERO-WRITE WITNESS.
 *
 *   DATABASE_URL=<disposable shadow> npm run witness:sanctuary-editorial
 *
 * Real routes → real identity lookup (x-session-token) → real editorial
 * runtime → real `pg` → rows COUNTED before and after in proposal_chains,
 * ask_threads, ask_turns, editorial_turn_bindings. The only shim is
 * `next/headers` `cookies()` (no request scope outside Next). The flag is set
 * for the process ONLY — nothing here enables anything in production.
 * ⛔ Never point this at production. Records identifiers and counts only.
 */
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';

import { randomBytes, randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { query, closePool } from '@/lib/db/postgres';
import { POST as passageOpen } from '@/app/api/writers-studio/rebuild/editorial/thread/route';
import { POST as sectionOpen, GET as threadGet } from '@/app/api/writers-studio/editorial/thread/route';
import { POST as turn } from '@/app/api/writers-studio/editorial/turn/route';

const DSN = process.env.DATABASE_URL ?? '';
const M = randomUUID(), WK = randomUUID(), DR = randomUUID(), S1 = randomUUID(), D1 = randomUUID();
const TOKEN = randomBytes(32).toString('hex');
const H1 = 'The river at dusk';
const B1 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const record: string[] = []; const note = (s: string) => record.push(s);

interface Counts { chains: number; threads: number; turns: number; bindings: number }
const counts = async (): Promise<Counts> => {
  const n = async (sql: string) => Number((await query<{ n: string }>(sql, [WK])).rows[0]!.n);
  return {
    chains: await n(`SELECT count(*)::text AS n FROM proposal_chains WHERE work_id = $1`),
    threads: await n(`SELECT count(*)::text AS n FROM ask_threads WHERE manuscript_id = $1`),
    turns: await n(`SELECT count(*)::text AS n FROM ask_turns WHERE thread_id IN (SELECT id FROM ask_threads WHERE manuscript_id = $1)`),
    bindings: await n(`SELECT count(*)::text AS n FROM editorial_turn_bindings WHERE thread_id IN (SELECT id FROM ask_threads WHERE manuscript_id = $1)`),
  };
};
const delta = (a: Counts, b: Counts) => `chains ${b.chains - a.chains} · threads ${b.threads - a.threads} · turns ${b.turns - a.turns} · bindings ${b.bindings - a.bindings}`;
const zero = (a: Counts, b: Counts) => b.chains === a.chains && b.threads === a.threads && b.turns === a.turns && b.bindings === a.bindings;
const req = (url: string, body: unknown, method = 'POST') => new NextRequest(url, { method, headers: { 'content-type': 'application/json', 'x-session-token': TOKEN }, body: method === 'GET' ? undefined : JSON.stringify(body) });
const reply = async (res: Response) => ({ status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> });
const BASE = 'http://localhost/api/writers-studio';

beforeAll(async () => {
  if (!DSN) throw new Error('NO EVIDENCE — DATABASE_URL not set');
  if (/soullab\.life|minisforum|192\.168\.0\.104|maia_consciousness/.test(DSN)) throw new Error('REFUSED — production-looking DATABASE_URL');
  await query(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','E1 witness')`, [M, `SOULLAB-E1-${M.slice(0, 8)}`, `e1-${M.slice(0, 8)}`]);
  await query(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await query(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'E1 witness')`, [WK, M]);
  await query(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,2,'markdown',$4)`, [S1, WK, H1, B1]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-e1',2)`, [DR, WK, M]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4)`, [D1, DR, `${H1}\n\n${B1}`, S1]);
  await query(`UPDATE manuscript_working_drafts d SET content = (SELECT COALESCE(string_agg(s.text,'' ORDER BY s.position),'') FROM manuscript_draft_sections s WHERE s.draft_id = d.id) WHERE d.id = $1`, [DR]);
  await query(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR]);
  note(`shadow=${DSN.replace(/\/\/.*@/, '//***@')} member=${M} manuscript=${WK} draft=${DR} section=${D1}`);
});
afterAll(async () => {
  try {
    await query(`DELETE FROM ask_threads WHERE manuscript_id = $1`, [WK]).catch(() => {});
    await query(`DELETE FROM proposal_chains WHERE work_id = $1`, [WK]).catch(() => {});
    await query(`DELETE FROM manuscript_working_drafts WHERE manuscript_id = $1`, [WK]).catch(() => {});
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [WK]).catch(() => {});
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [M]).catch(() => {});
    await query(`DELETE FROM members WHERE id = $1`, [M]).catch(() => {});
  } finally {
    await closePool();
    process.stdout.write(['', '── E1 ZERO-WRITE WITNESS (counts + identifiers only) ──', ...record.map((l) => '  ' + l), ''].join('\n') + '\n');
  }
});

describe('E1 zero-write witness', () => {
  let base: Counts; let threadId = '';
  const passageBody = (extra: Record<string, unknown> = {}) => ({ sectionId: D1, range: { start: 21, end: 29 }, revisionNumber: 1, ...extra });
  const sectionBody = (extra: Record<string, unknown> = {}) => ({ sectionId: D1, ...extra });

  it('W-0 baseline counts', async () => { base = await counts(); note(`W-0 baseline chains=${base.chains} threads=${base.threads} turns=${base.turns} bindings=${base.bindings}`); });

  it('W-1 passage-open sanctuary:true → 409 · all deltas 0', async () => {
    const r = await reply(await passageOpen(req(`${BASE}/rebuild/editorial/thread`, passageBody({ sanctuary: true }))));
    const after = await counts(); note(`W-1 status=${r.status} error=${String(r.json['error'])} · ${delta(base, after)}`);
    expect(r.status).toBe(409); expect(r.json['error']).toBe('sanctuary_unavailable'); expect(zero(base, after)).toBe(true);
  });
  it('W-2 passage-open missing + malformed → 400 · all deltas 0', async () => {
    for (const v of [undefined, 'false', 0, null]) {
      const body = v === undefined ? passageBody() : passageBody({ sanctuary: v });
      const r = await reply(await passageOpen(req(`${BASE}/rebuild/editorial/thread`, body)));
      const after = await counts(); note(`W-2 sanctuary=${JSON.stringify(v)} status=${r.status} error=${String(r.json['error'])} · ${delta(base, after)}`);
      expect(r.status).toBe(400); expect(r.json['error']).toBe('posture_required'); expect(zero(base, after)).toBe(true);
    }
  });
  it('W-3 section-open sanctuary:true → 409 · all deltas 0', async () => {
    const r = await reply(await sectionOpen(req(`${BASE}/editorial/thread`, sectionBody({ sanctuary: true }))));
    const after = await counts(); note(`W-3 status=${r.status} error=${String(r.json['error'])} · ${delta(base, after)}`);
    expect(r.status).toBe(409); expect(zero(base, after)).toBe(true);
  });
  it('W-4 section-open missing + malformed → 400 · all deltas 0', async () => {
    for (const v of [undefined, 'true', 1]) {
      const body = v === undefined ? sectionBody() : sectionBody({ sanctuary: v });
      const r = await reply(await sectionOpen(req(`${BASE}/editorial/thread`, body)));
      const after = await counts(); note(`W-4 sanctuary=${JSON.stringify(v)} status=${r.status} error=${String(r.json['error'])} · ${delta(base, after)}`);
      expect(r.status).toBe(400); expect(zero(base, after)).toBe(true);
    }
  });
  it('W-5 ordinary passage-open sanctuary:false → 200 · exactly one chain + one thread', async () => {
    const r = await reply(await passageOpen(req(`${BASE}/rebuild/editorial/thread`, passageBody({ sanctuary: false }))));
    const after = await counts(); note(`W-5 status=${r.status} threadId=${String(r.json['threadId'])} chainId=${String(r.json['chainId'])} · ${delta(base, after)}`);
    expect(r.status).toBe(200); threadId = String(r.json['threadId']);
    expect(after.chains - base.chains).toBe(1); expect(after.threads - base.threads).toBe(1); expect(after.turns - base.turns).toBe(0);
    base = after;
  });
  it('W-6 GET thread stays readable', async () => {
    const r = await reply(await threadGet(req(`${BASE}/editorial/thread?threadId=${threadId}&sanctuary=true`, null, 'GET')));
    note(`W-6 status=${r.status} threadId=${String(r.json['threadId'])} targetSectionId=${String(r.json['targetSectionId'])}`);
    expect(r.status).toBe(200); expect(r.json['threadId']).toBe(threadId);
  });
  it('W-7 turn sanctuary:true against the ordinary thread → 409 · turns 0 · bindings 0', async () => {
    const r = await reply(await turn(req(`${BASE}/editorial/turn`, { threadId, act: { act: 'discourse', text: 'Why does this turn here?', refersTo: null }, sanctuary: true })));
    const after = await counts(); note(`W-7 status=${r.status} error=${String(r.json['error'])} persisted=${String(r.json['persisted'])} · ${delta(base, after)}`);
    expect(r.status).toBe(409); expect(r.json['error']).toBe('sanctuary_unavailable'); expect(zero(base, after)).toBe(true);
  });
  it('W-8 turn missing + malformed → 400 · turns 0 · bindings 0', async () => {
    for (const v of [undefined, 'false', 0]) {
      const body: Record<string, unknown> = { threadId, act: { act: 'discourse', text: 'Why does this turn here?', refersTo: null } };
      if (v !== undefined) body['sanctuary'] = v;
      const r = await reply(await turn(req(`${BASE}/editorial/turn`, body)));
      const after = await counts(); note(`W-8 sanctuary=${JSON.stringify(v)} status=${r.status} error=${String(r.json['error'])} · ${delta(base, after)}`);
      expect(r.status).toBe(400); expect(r.json['error']).toBe('posture_required'); expect(zero(base, after)).toBe(true);
    }
  });
});
