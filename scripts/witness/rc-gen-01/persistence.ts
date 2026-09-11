/**
 * RC-GEN-01 · 3B — atomic persistence, against the REAL migrations.
 *
 * ⛔ DISPOSABLE CLUSTER ONLY. This writes and rolls back real rows; never point it
 * at a database anyone uses. (Walk 12 pointed a fault injection at a live dev
 * database once; that is the mistake this banner exists to prevent repeating.)
 *
 * ⛔ WHAT 3B MAY NOT PROVE: whether MAIA chose the right outcome · whether 3A-S
 * passed · whether retries are exactly-once · whether actId's two gaps are solved.
 * There is DELIBERATELY NO same-act specimen here, so atomicity cannot quietly
 * acquire credit for idempotency.
 *
 *   RC3B_URL=postgresql://... npx tsx scripts/witness/rc-gen-01/persistence.ts
 */

import { Client } from 'pg';
import { persistRevisionActWithClient, type RevisionPersistInput } from '../../../lib/manuscript/revision/persist';
import type { TransactionClient } from '../../../lib/db/postgres';

const URL = process.env.RC3B_URL;
if (!URL) { console.error('RC3B_URL is required. Disposable cluster only.'); process.exit(1); }

let failed = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failed++;
};

const M = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';
const DR = '33333333-3333-3333-3333-333333333333';
const TH = '55555555-5555-5555-5555-555555555555';
let SEC = '';

const EVIDENCE = (id: string) => ({ [id]: { basedOn: { kind: 'section', sectionId: id }, readState: { revisionNumber: 1 }, coverage: { sections: {} } } });

const baseInput = (over: Partial<RevisionPersistInput> = {}): RevisionPersistInput => ({
  threadId: TH, memberId: M, manuscriptId: MS, draftId: DR,
  authorBody: 'Make this less abstract.',
  maiaBody: 'I have tightened the second sentence and left your opening alone.',
  outcome: { kind: 'proposals', proposals: [{ sectionId: SEC, proposedText: 'The kettle clicked off.', reason: 'concrete' }] },
  evidence: EVIDENCE(SEC), authority: { act: 'disclosure-1' },
  producer: 'RC-GEN-01/1', inputFingerprint: 'fp-1', staleness: { state: 'current' },
  ...over,
});

async function seed(c: Client) {
  await c.query(`INSERT INTO members (id, passkey, username, password_hash) VALUES ($1,'PK-RC','rcwitness','x') ON CONFLICT DO NOTHING`, [M]);
  await c.query(`INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1,$2,'Fixture') ON CONFLICT DO NOTHING`, [MS, M]);
  await c.query(`INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash)
                 VALUES ($1,$2,$3,'The kettle clicked off.','h1') ON CONFLICT DO NOTHING`, [DR, MS, M]);
  const s = await c.query(`INSERT INTO manuscript_draft_sections (draft_id, position, text)
                           VALUES ($1,0,'The kettle clicked off.')
                           ON CONFLICT (draft_id, position) DO UPDATE SET text = EXCLUDED.text
                           RETURNING id`, [DR]);
  SEC = s.rows[0].id;
  await c.query(`INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by)
                 VALUES ($1,$2,$3,'{}'::jsonb,'{}'::jsonb,'author') ON CONFLICT DO NOTHING`, [TH, MS, M]);
}

const tx = (c: Client): TransactionClient => ({ query: (sql: string, params: any[] = []) => c.query(sql, params) as any });

async function inTransaction<T>(c: Client, fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  await c.query('BEGIN');
  try { const value = await fn(); await c.query('COMMIT'); return { ok: true, value }; }
  catch (e) { await c.query('ROLLBACK'); return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}

const counts = async (c: Client) => ({
  turns: Number((await c.query('SELECT count(*) n FROM ask_turns WHERE thread_id=$1', [TH])).rows[0].n),
  proposals: Number((await c.query('SELECT count(*) n FROM manuscript_revision_proposals WHERE thread_id=$1', [TH])).rows[0].n),
});

async function main() {
  const c = new Client({ connectionString: URL });
  await c.connect();
  await seed(c);

  /* ── B1 · proposal happy path ───────────────────────────────────────────── */
  console.log('\n─── B1 · proposal happy path');
  const b1 = await inTransaction(c, () => persistRevisionActWithClient(tx(c), baseInput()));
  check(b1.ok, 'the act commits');
  if (b1.ok) {
    const r = await c.query(
      `SELECT p.proposed_text, p.section_id, p.producer, p.authority, p.origin,
              p.thread_id, p.produced_in_turn_index, t.speaker
         FROM manuscript_revision_proposals p
         JOIN ask_turns t ON t.thread_id = p.thread_id AND t.turn_index = p.produced_in_turn_index
        WHERE p.id = $1`, [b1.value.proposalIds[0]]);
    const row = r.rows[0];
    check(!!row, 'the proposal is joinable to its producer turn');
    check(row?.proposed_text === 'The kettle clicked off.', 'proposed_text is the canonical wording');
    check(row?.section_id === SEC, 'target is the authorized section');
    check(row?.producer === 'RC-GEN-01/1', 'provenance records the producing contract');
    check(row?.origin === 'work', 'origin is work');
    check(row?.speaker === 'maia', 'the producer turn is a MAIA turn');
    check(Number(row?.produced_in_turn_index) === b1.value.producerTurnIndex, 'producer index matches the returned act');
  }

  /* ── B5 · content separation ────────────────────────────────────────────── */
  console.log('\n─── B5 · ask_turns.body never receives proposed_text');
  const bodies = await c.query(`SELECT speaker, body FROM ask_turns WHERE thread_id=$1 ORDER BY turn_index`, [TH]);
  check(bodies.rows.some((r: any) => r.speaker === 'author' && r.body.includes('less abstract')),
        'the author turn carries the writer\'s request');
  check(!bodies.rows.some((r: any) => r.body.includes('The kettle clicked off.')),
        '⭐ NO turn body contains the canonical proposed wording');

  /* ── B2 · proposal persistence fails ────────────────────────────────────── */
  console.log('\n─── B2 · proposal insert fails after turn work began');
  const before2 = await counts(c);
  const b2 = await inTransaction(c, () => persistRevisionActWithClient(tx(c), baseInput({
    outcome: { kind: 'proposals', proposals: [{ sectionId: '99999999-9999-9999-9999-999999999999', proposedText: 'x', reason: 'y' }] },
    evidence: EVIDENCE('99999999-9999-9999-9999-999999999999'),
  })));
  check(!b2.ok, 'the act is refused');
  const after2 = await counts(c);
  check(after2.turns === before2.turns, '⭐ no orphan author turn and no orphan producer turn');
  check(after2.proposals === before2.proposals, 'no proposal survives');

  /* ── B3 · producer-turn binding cannot be bypassed ──────────────────────── */
  console.log('\n─── B3 · a proposal cannot survive without a real producer turn');
  const b3 = await inTransaction(c, async () => {
    await c.query(
      `INSERT INTO manuscript_revision_proposals
         (manuscript_id,draft_id,section_id,member_id,thread_id,produced_in_turn_index,
          proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint)
       VALUES ($1,$2,$3,$4,$5,4242,'orphan','r','{}','{}','{}','work','{}','p','f')`,
      [MS, DR, SEC, M, TH]);
  });
  check(!b3.ok, 'a proposal naming a nonexistent producer turn is rejected');

  console.log('\n─── B3b · a proposal naming an AUTHOR turn is rejected');
  const authorIdx = bodies.rows.findIndex((r: any) => r.speaker === 'author');
  const b3b = await inTransaction(c, async () => {
    await c.query(
      `INSERT INTO manuscript_revision_proposals
         (manuscript_id,draft_id,section_id,member_id,thread_id,produced_in_turn_index,
          proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint)
       VALUES ($1,$2,$3,$4,$5,$6,'wrong speaker','r','{}','{}','{}','work','{}','p','f')`,
      [MS, DR, SEC, M, TH, authorIdx]);
  });
  check(!b3b.ok, 'RC-08a refuses an author turn as producer, in the real schema');

  /* ── B4 · no_change manufactures nothing ────────────────────────────────── */
  console.log('\n─── B4 · no_change');
  const before4 = await counts(c);
  const b4 = await inTransaction(c, () => persistRevisionActWithClient(tx(c), baseInput({
    authorBody: 'Is this too abstract?',
    maiaBody: "It's already concrete. I'd leave it alone.",
    outcome: { kind: 'no_change', reason: "it's already concrete" },
  })));
  check(b4.ok, 'the restraint act commits');
  const after4 = await counts(c);
  check(after4.proposals === before4.proposals, '⭐ ZERO proposal rows manufactured');
  check(after4.turns === before4.turns + 2, 'conversation history still records both turns');
  if (b4.ok) check(b4.value.proposalIds.length === 0, 'the result reports no proposals');

  /* ── B6 · recovery path exists structurally ─────────────────────────────── */
  console.log('\n─── B6 · a proposal is recoverable by its actual producer turn');
  if (b1.ok) {
    const rec = await c.query(
      `SELECT id FROM manuscript_revision_proposals
        WHERE thread_id=$1 AND produced_in_turn_index=$2`, [TH, b1.value.producerTurnIndex]);
    check(rec.rows.length === 1 && rec.rows[0].id === b1.value.proposalIds[0],
          '⭐ recoverable by (thread_id, produced_in_turn_index) — the path 3C will need');
  }

  console.log(`\n${'═'.repeat(60)}\n3B: ${failed} failed`);
  console.log('⛔ 3B proves persistence only. Not 3A-S, not idempotency, not actId.');
  await c.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
