/**
 * WS-WORK-CONTINUITY · B — disposable-database witness. Runs the REAL store/receipt code against a real
 * PostgreSQL. SAFETY: disabled unless WS_READ_SCOPE_DYNAMIC=fictional-only; refuses a non-loopback DATABASE_URL;
 * fictional data only. Scope: DB-enforced and store-level laws. NOT the route, NOT the model, NOT a UI walk.
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { query } from '@/lib/db/postgres';
import { appendScopeEvent } from '@/lib/disclosure/workReadScopeWrite';
import { loadActiveGrant, recordTurnReads, loadEarlierDigests } from '@/lib/disclosure/workReadScopeRead';
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
    await query(`INSERT INTO runtime_consent_state(request_id, member_id) VALUES ($1,$2)`, [req, A]);
    return mintDisclosureAttempt({
      disclosureId: randomUUID(), memberId: A, requestRef: req,
      boundary: 'writers_studio.work_conversation->maia_cognition', sourceClass: 'work',
      participationBasis: 'standing_authorization', sourceRef: ms, scopeKind: 'section',
      sectionRef: randomUUID(), gesture: 'standing_read_scope', ...extra,
    } as never);
  };

  beforeAll(async () => {
    A = (await query<{ id: string }>(`INSERT INTO members(name) VALUES ('A') RETURNING id`)).rows[0].id;
    B = (await query<{ id: string }>(`INSERT INTO members(name) VALUES ('B') RETURNING id`)).rows[0].id;
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

  it('what was supplied each turn is recorded, latest wins, member-scoped, append-only', async () => {
    const s1 = { id: randomUUID(), label: null, body: 'x', digest: dig('a') };
    await recordTurnReads(thread, A, 1, [s1]);
    await recordTurnReads(thread, A, 3, [{ ...s1, digest: dig('b') }]);
    expect((await loadEarlierDigests(thread, A)).get(s1.id)).toBe(dig('b'));
    expect((await loadEarlierDigests(thread, B)).size).toBe(0);                          // other member reads nothing
    await recordTurnReads(thread, B, 5, [{ ...s1, digest: dig('c') }]);                  // other member cannot write
    expect((await loadEarlierDigests(thread, A)).get(s1.id)).toBe(dig('b'));
    expect(await rejects(`UPDATE ask_turn_reads SET body_digest='z' WHERE thread_id=$1`, [thread])).toBe(true);
  });

  it('removing the Work removes its scope events with it (the only lawful deletion)', async () => {
    await appendScopeEvent({ memberId: B, livingWorkId: workB, event: 'grant', level: 'work' });
    await query(`DELETE FROM living_works WHERE id=$1`, [workB]);
    expect((await query(`SELECT 1 FROM work_reading_scope_events WHERE living_work_id=$1`, [workB])).rows.length).toBe(0);
  });
});
