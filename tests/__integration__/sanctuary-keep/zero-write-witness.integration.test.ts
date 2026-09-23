/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — DB-BACKED ZERO-WRITE WITNESS.
 *
 *   DATABASE_URL=<disposable shadow> npm run witness:sanctuary-keep
 *
 * Evidence class: real route → real auth lookup (x-session-token path) →
 * real `pg` → real `manuscript_keeps` rows COUNTED before and after.
 * The only shim is `next/headers` `cookies()`, which cannot exist outside a
 * Next request scope; it returns no cookie, so authentication goes through
 * the header path the route already serves for Safari/iOS.
 *
 * ⛔ Never point this at production. It seeds and deletes fixture rows.
 * ⛔ The record it prints carries identifiers and counts only — never
 *    `verbatim_text`.
 */

jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));

import { randomBytes, randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { query, closePool } from '@/lib/db/postgres';
import { POST, DELETE } from '@/app/api/sovereign/manuscripts/[id]/keeps/route';

const DSN = process.env.DATABASE_URL ?? '';
const memberId = randomUUID();
const manuscriptId = randomUUID();
const sectionId = randomUUID();
const token = randomBytes(32).toString('hex');
const suffix = memberId.slice(0, 8);
const PASSAGE = `witness passage ${suffix}`;
const record: string[] = [];
const note = (s: string) => record.push(s);

const count = async () =>
  Number((await query<{ n: string }>(`SELECT count(*)::text AS n FROM manuscript_keeps WHERE manuscript_id = $1`, [manuscriptId])).rows[0]!.n);

const ctx = () => ({ params: Promise.resolve({ id: manuscriptId }) });
const base = `http://localhost/api/sovereign/manuscripts/${manuscriptId}/keeps`;
const post = async (body: unknown) => {
  const res = await POST(
    new NextRequest(base, { method: 'POST', headers: { 'content-type': 'application/json', 'x-session-token': token }, body: JSON.stringify(body) }),
    ctx(),
  );
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
};

beforeAll(async () => {
  if (!DSN) throw new Error('NO EVIDENCE — DATABASE_URL not set; the witness needs a disposable shadow database');
  if (/soullab\.life|minisforum|192\.168\.0\.104|maia_consciousness/.test(DSN)) throw new Error('REFUSED — DATABASE_URL looks like production');
  await query(`INSERT INTO members (id, passkey, username, password_hash, name) VALUES ($1, $2, $3, 'x', 'S1 witness')`, [memberId, `SOULLAB-WITNESS-${suffix}`, `s1-witness-${suffix}`]);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  await query(`INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1, $2, 'S1 witness manuscript')`, [manuscriptId, memberId]);
  await query(`INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body) VALUES ($1, $2, 0, 'One', $3)`, [sectionId, manuscriptId, `Before. ${PASSAGE}. After.`]);
  note(`shadow=${DSN.replace(/\/\/.*@/, '//***@')} member=${memberId} manuscript=${manuscriptId} section=${sectionId}`);
});

afterAll(async () => {
  try {
    await query(`DELETE FROM manuscript_keeps WHERE manuscript_id = $1`, [manuscriptId]);
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  } finally {
    await closePool();
    process.stdout.write(['', '── S1 ZERO-WRITE WITNESS (counts + identifiers only) ──', ...record.map((l) => '  ' + l), ''].join('\n') + '\n');
  }
});

describe('S1 zero-write witness', () => {
  let baseline = -1;
  let keepId = '';

  it('W-0 the fixture starts with zero keeps', async () => {
    baseline = await count();
    note(`W-0 baseline_count=${baseline}`);
    expect(baseline).toBe(0);
  });

  it('W-1 POST sanctuary:true → 200 persisted:false · delta 0', async () => {
    const r = await post({ sectionId, text: PASSAGE, sanctuary: true });
    const after = await count();
    note(`W-1 status=${r.status} json=${JSON.stringify(r.json)} count=${after} delta=${after - baseline}`);
    expect(r.status).toBe(200);
    expect(r.json).toEqual({ success: true, sanctuary: true, persisted: false });
    expect(after - baseline).toBe(0);
  });

  it('W-2 POST missing posture → 400 posture_required · delta 0', async () => {
    const r = await post({ sectionId, text: PASSAGE });
    const after = await count();
    note(`W-2 status=${r.status} error=${String(r.json['error'])} count=${after} delta=${after - baseline}`);
    expect(r.status).toBe(400);
    expect(r.json['error']).toBe('posture_required');
    expect(after - baseline).toBe(0);
  });

  it("W-3 POST sanctuary:'false' (malformed) → 400 · delta 0", async () => {
    const r = await post({ sectionId, text: PASSAGE, sanctuary: 'false' });
    const after = await count();
    note(`W-3 status=${r.status} error=${String(r.json['error'])} count=${after} delta=${after - baseline}`);
    expect(r.status).toBe(400);
    expect(after - baseline).toBe(0);
  });

  it('W-4 POST sanctuary:false → 201 · delta +1 (discrimination)', async () => {
    const r = await post({ sectionId, text: PASSAGE, sanctuary: false });
    const after = await count();
    keepId = String((r.json['keep'] as Record<string, unknown> | undefined)?.['id'] ?? '');
    note(`W-4 status=${r.status} keep_id=${keepId} count=${after} delta=${after - baseline}`);
    expect(r.status).toBe(201);
    expect(keepId).toMatch(/^[0-9a-f-]{36}$/);
    expect(after - baseline).toBe(1);
  });

  it('W-5 DELETE with a Sanctuary hint → 200 removed · count returns to baseline', async () => {
    const res = await DELETE(
      new NextRequest(`${base}?keepId=${keepId}&sanctuary=true`, { method: 'DELETE', headers: { 'x-session-token': token, 'x-sanctuary': 'true' } }),
      ctx(),
    );
    const json = (await res.json()) as Record<string, unknown>;
    const after = await count();
    note(`W-5 status=${res.status} removed=${String(json['removed'])} count=${after} delta=${after - baseline}`);
    expect(res.status).toBe(200);
    expect(json['removed']).toBe(true);
    expect(after).toBe(baseline);
  });
});
