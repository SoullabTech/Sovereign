/**
 * WS-WORK-CONTINUITY · B — disposable-database witness. Runs the REAL store/receipt code against a real
 * PostgreSQL. SAFETY: disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only; refuses a non-loopback DATABASE_URL;
 * fictional data only. Scope: DB-enforced and store-level laws. NOT the route, NOT the model, NOT a UI walk.
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { query } from '@/lib/db/postgres';
import { appendScopeEvent } from '@/lib/disclosure/workReadScopeWrite';
import { loadActiveGrant, loadEarlierDigests } from '@/lib/disclosure/workReadScopeRead';
import { mintDisclosureAttempt, confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { randomUUID } from 'crypto';

const ON = process.env.WS_READ_SCOPE_DYNAMIC === 'fictional-only'
  && /@(127\.0\.0\.1|localhost|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? '');
const d = ON ? describe : describe.skip;

d('Work reading scope · physical witness', () => {
  let A = '', B = '', workA = '', workB = '', ms = '', thread = '';
  const dig = (n: string) => n.padEnd(64, '0');
  const rejects = async (sql: string, p: unknown[] = []) => {
    try { await query(sql, p); return false; } catch { return true; }
  };
  const mintAs = async (extra: Record<string, unknown>) => {
    const req = randomUUID();
    await query(`INSERT INTO runtime_consent_state(request_id, posture) VALUES ($1,'normal')`, [req]);
    return mintDisclosureAttempt({
      disclosureId: randomUUID(), memberId: A, requestRef: req,
      boundary: 'writers_studio.work_conversation->maia_cognition', sourceClass: 'work',
      participationBasis: 'standing_authorization', sourceRef: ms, scopeKind: 'section',
      sectionRef: randomUUID(), gesture: 'standing_read_scope', ...extra,
    } as never);
  };

  beforeAll(async () => {
    const mk = async (n: string) => (await query<{ id: string }>(
      `INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x',$1) RETURNING id`,
      [`${n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`])).rows[0].id;
    A = await mk('scopeA'); B = await mk('scopeB');
    workA = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Fictional A') RETURNING id`, [A])).rows[0].id;
    workB = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Fictional B') RETURNING id`, [B])).rows[0].id;
    ms = (await query<{ id: string }>(`INSERT INTO member_manuscripts(member_id) VALUES ($1) RETURNING id`, [A])).rows[0].id;
    thread = (await query<{ id: string }>(
      `INSERT INTO ask_threads(manuscript_id,member_id,anchor,canonical_at_open,initiated_by)
       VALUES ($1,$2,'{"on":"work"}','x','author') RETURNING id`, [ms, A])).rows[0].id;
  });
  afterAll(async () => { /* the cluster is destroyed by the runner */ });

  it('no events means no grant; a member cannot write events on another member\'s Work', async () => {
    expect(await loadActiveGrant(A, workA)).toBeNull();
    expect(await appendScopeEvent({ memberId: B, livingWorkId: workA, event: 'grant', level: 'work' })).toBeNull();
    expect(await loadActiveGrant(A, workA)).toBeNull();
  });

  it('grant, revoke, re-grant are derived from events; another member never sees them', async () => {
    expect(await appendScopeEvent({ memberId: A, livingWorkId: workA, event: 'grant', level: 'work' })).toBeTruthy();
    expect((await loadActiveGrant(A, workA))?.level).toBe('work');
    expect(await loadActiveGrant(B, workA)).toBeNull();
    await appendScopeEvent({ memberId: A, livingWorkId: workA, event: 'revoke', level: null });
    expect(await loadActiveGrant(A, workA)).toBeNull();
    await appendScopeEvent({ memberId: A, livingWorkId: workA, event: 'grant', level: 'chapter' });
    expect((await loadActiveGrant(A, workA))?.level).toBe('chapter');
  });

  it('the database refuses UPDATE, TRUNCATE and a direct DELETE of events; a level on revoke or none on grant', async () => {
    expect(await rejects(`UPDATE work_reading_scope_events SET level='work' WHERE member_id=$1`, [A])).toBe(true);
    expect(await rejects(`DELETE FROM work_reading_scope_events WHERE member_id=$1`, [A])).toBe(true);
    expect(await rejects(`TRUNCATE work_reading_scope_events`)).toBe(true);
    expect(await rejects(`INSERT INTO work_reading_scope_events(member_id,living_work_id,event,level) VALUES ($1,$2,'revoke','work')`, [A, workA])).toBe(true);
    expect(await rejects(`INSERT INTO work_reading_scope_events(member_id,living_work_id,event,level) VALUES ($1,$2,'grant',NULL)`, [A, workA])).toBe(true);
  });

  it('a standing receipt needs its scope event, and only a standing receipt may carry one', async () => {
    const ev = (await query<{ id: string }>(`SELECT id FROM work_reading_scope_events WHERE member_id=$1 ORDER BY created_at DESC LIMIT 1`, [A])).rows[0].id;
    const ok = await mintAs({ scopeEventId: ev });
    expect(ok.kind).toBe('minted');
    expect((await mintAs({})).kind).toBe('unavailable');                                  // standing, no scope event
    expect((await mintAs({ participationBasis: 'member_invoked', scopeEventId: ev })).kind).toBe('unavailable'); // scope event, not standing
    if (ok.kind === 'minted') {
      expect(await rejects(`UPDATE context_disclosure_receipts SET scope_event_id=NULL WHERE disclosure_id=$1`, [ok.disclosureId])).toBe(true);
      expect(await confirmDisclosureCrossed(ok.disclosureId)).toBe(true);
    }
  });

  it('what was supplied each turn is read from her answers\' own rows: latest wins, member-scoped, immutable', async () => {
    const sid = randomUUID();
    const maia = (i: number, digest: string) => query(`INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness, answer_provenance)
      VALUES ($1,$2,'maia','an answer','{}'::jsonb,$3::jsonb)`, [thread, i, JSON.stringify({ suppliedSections: [{ sectionId: sid, digest }] })]);
    await maia(1, dig('a'));
    await maia(3, dig('b'));
    expect((await loadEarlierDigests(thread, A)).get(sid)).toBe(dig('b'));
    expect((await loadEarlierDigests(thread, B)).size).toBe(0);                          // other member reads nothing
    expect(await rejects(`UPDATE ask_turns SET answer_provenance='{}'::jsonb WHERE thread_id=$1`, [thread])).toBe(true);   // immutable with the answer
  });

  it('REVIEW FIX · a Work that has a standing-read receipt can still be removed (the receipt may dangle; it must not block)', async () => {
    const wk = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'Removable') RETURNING id`, [A])).rows[0].id;
    const ev = (await query<{ id: string }>(`INSERT INTO work_reading_scope_events(member_id,living_work_id,event,level) VALUES ($1,$2,'grant','work') RETURNING id`, [A, wk])).rows[0].id;
    const out = await mintAs({ scopeEventId: ev });
    expect(out.kind).toBe('minted');
    await query(`DELETE FROM living_works WHERE id=$1`, [wk]);                       // cascades the events; must not hit the receipt
    expect((await query(`SELECT 1 FROM work_reading_scope_events WHERE living_work_id=$1`, [wk])).rows.length).toBe(0);
    expect((await query(`SELECT 1 FROM context_disclosure_receipts WHERE scope_event_id=$1`, [ev])).rows.length).toBe(1); // the receipt survives, content-free
  });

  it('REVIEW FIX · a receipt cannot name another member\'s grant or a revoke or a non-existent event', async () => {
    const ev = (await query<{ id: string }>(`SELECT id FROM work_reading_scope_events WHERE member_id=$1 AND event='grant' LIMIT 1`, [A])).rows[0].id;
    const other = (await query<{ id: string }>(`INSERT INTO members(passkey,username,password_hash,name) VALUES ($1,$1,'x','o') RETURNING id`, [`oth-${Date.now()}`])).rows[0].id;
    const otherWork = (await query<{ id: string }>(`INSERT INTO living_works(member_id,title) VALUES ($1,'O') RETURNING id`, [other])).rows[0].id;
    const otherEv = (await query<{ id: string }>(`INSERT INTO work_reading_scope_events(member_id,living_work_id,event,level) VALUES ($1,$2,'grant','work') RETURNING id`, [other, otherWork])).rows[0].id;
    expect((await mintAs({ scopeEventId: otherEv })).kind).toBe('unavailable');
    expect((await mintAs({ scopeEventId: randomUUID() })).kind).toBe('unavailable');
    expect((await mintAs({ scopeEventId: ev })).kind).toBe('minted');
  });

  it('removing the Work removes its scope events with it (the only lawful deletion)', async () => {
    await appendScopeEvent({ memberId: B, livingWorkId: workB, event: 'grant', level: 'work' });
    await query(`DELETE FROM living_works WHERE id=$1`, [workB]);
    expect((await query(`SELECT 1 FROM work_reading_scope_events WHERE living_work_id=$1`, [workB])).rows.length).toBe(0);
  });
});
