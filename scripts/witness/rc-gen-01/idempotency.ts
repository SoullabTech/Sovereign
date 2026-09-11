/**
 * RC-GEN-01 · 3C — C1..C6 against the REAL migrations. ⛔ Disposable cluster only.
 *
 * Inference is stubbed by a COUNTER, deliberately: C2's claim is about the CALLER
 * CONTRACT — that a replay does not reach cognition at all — not about what a
 * model would say. A real provider here would prove less, not more.
 */
import { Client } from 'pg';
import { persistRevisionActWithClient } from '../../../lib/manuscript/revision/persist';
import { checkInvocation, recoverAct } from '../../../lib/manuscript/revision/recovery';
import { invocationDigest } from '../../../lib/manuscript/revision/invocationIdentity';
import type { TransactionClient } from '../../../lib/db/postgres';
import type { RevisionOutcome } from '../../../lib/manuscript/revision/outcome';

const URL = process.env.RC3C_URL;
if (!URL) { console.error('RC3C_URL required. Disposable cluster only.'); process.exit(1); }

let failed = 0;
const check = (ok: boolean, label: string) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); if (!ok) failed++; };

const M='11111111-1111-1111-1111-111111111111', MS='22222222-2222-2222-2222-222222222222';
const DR='33333333-3333-3333-3333-333333333333', TH='55555555-5555-5555-5555-555555555555';
let SEC=''; let inferenceCalls = 0;

const tx = (c: Client): TransactionClient => ({ query: (s: string, p: any[] = []) => c.query(s, p) as any });

const inv = (question: string, text: string) => ({
  contractVersion: 'RC-GEN-01/1', threadId: TH, memberId: M, question,
  sections: [{ sectionId: SEC, text }],
});

async function seed(c: Client) {
  await c.query(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'PK','w','x') ON CONFLICT DO NOTHING`,[M]);
  await c.query(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'F') ON CONFLICT DO NOTHING`,[MS,M]);
  await c.query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
                 VALUES ($1,$2,$3,'The kettle clicked off.','h') ON CONFLICT DO NOTHING`,[DR,MS,M]);
  const s = await c.query(`INSERT INTO manuscript_draft_sections (draft_id,position,text) VALUES ($1,0,'The kettle clicked off.')
                           ON CONFLICT (draft_id,position) DO UPDATE SET text=EXCLUDED.text RETURNING id`,[DR]);
  SEC = s.rows[0].id;
  await c.query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by)
                 VALUES ($1,$2,$3,'{}'::jsonb,'{}'::jsonb,'author') ON CONFLICT DO NOTHING`,[TH,MS,M]);
}

const newRef = () => 'ref-' + 'x'.repeat(28) + Math.random().toString(36).slice(2,8);

async function openClaim(c: Client, ref: string) {
  await c.query(`INSERT INTO pending_ask_claims (ref,member_id,manuscript_id,thread_id,reading_id,observation_key,expires_at)
                 VALUES ($1,$2,$3,$4,gen_random_uuid(),'obs',now()+interval '1 hour')`,[ref,M,MS,TH]);
}

/** Claim binds identity: consumed_by_act AND request_digest, atomically, once. */
async function claimWithDigest(c: Client, ref: string, actId: string, digest: string): Promise<boolean> {
  const r = await c.query(
    `UPDATE pending_ask_claims SET consumed_at=now(), consumed_by_act=$2, request_digest=$3
      WHERE ref=$1 AND consumed_at IS NULL RETURNING ref`, [ref, actId, digest]);
  return r.rows.length === 1;
}

/** The caller contract: replay recovers, conflict refuses, otherwise infer once. */
async function invoke(c: Client, ref: string, actId: string, digest: string, outcome: RevisionOutcome) {
  const verdict = await checkInvocation(tx(c), ref, actId, digest);
  if (verdict.kind === 'conflict') return { kind: 'conflict' as const, verdict };
  if (verdict.kind === 'replay') return { kind: 'replay' as const, recovery: await recoverAct(tx(c), ref) };

  await claimWithDigest(c, ref, actId, digest);
  inferenceCalls++;                                  // the cognition call
  await c.query('BEGIN');
  try {
    const r = await persistRevisionActWithClient(tx(c), {
      threadId: TH, memberId: M, manuscriptId: MS, draftId: DR,
      authorBody: 'ask', maiaBody: 'reply', outcome,
      evidence: { [SEC]: { basedOn: {}, readState: {}, coverage: {} } },
      authority: {}, producer: 'RC-GEN-01/1', inputFingerprint: 'fp', staleness: {},
    });
    await c.query(`UPDATE pending_ask_claims SET completed_at=now(), outcome_kind=$2, produced_in_turn_index=$3 WHERE ref=$1`,
      [ref, outcome.kind, r.producerTurnIndex]);
    await c.query('COMMIT');
    return { kind: 'performed' as const, result: r };
  } catch (e) { await c.query('ROLLBACK'); throw e; }
}

const counts = async (c: Client) => ({
  turns: Number((await c.query('SELECT count(*) n FROM ask_turns WHERE thread_id=$1',[TH])).rows[0].n),
  props: Number((await c.query('SELECT count(*) n FROM manuscript_revision_proposals WHERE thread_id=$1',[TH])).rows[0].n),
});

async function main() {
  const c = new Client({ connectionString: URL }); await c.connect(); await seed(c);
  const OUT: RevisionOutcome = { kind:'proposals', proposals:[{ sectionId: SEC, proposedText:'The kettle clicked off.', reason:'concrete' }] };

  /* C1 */
  console.log('\n─── C1 · first invocation');
  const ref1 = newRef(); await openClaim(c, ref1);
  const A = invocationDigest(inv('Make this concrete.', 'The kettle clicked off.'));
  const before = await counts(c);
  const r1 = await invoke(c, ref1, 'act-X-0001', A, OUT);
  check(r1.kind === 'performed', 'the act is performed');
  const after1 = await counts(c);
  check(after1.turns === before.turns + 2 && after1.props === before.props + 1, 'exactly one historical act');
  check(inferenceCalls === 1, 'cognition called once');

  /* C2 */
  console.log('\n─── C2 · lost response, exact retry');
  const r2 = await invoke(c, ref1, 'act-X-0001', A, OUT);
  check(r2.kind === 'replay', 'classified as replay');
  check(inferenceCalls === 1, '⭐ cognition call count REMAINS 1 — no new inference');
  const after2 = await counts(c);
  check(after2.turns === after1.turns, 'turn count unchanged');
  check(after2.props === after1.props, 'proposal count unchanged');
  const rec = r2.kind === 'replay' ? r2.recovery : null;
  check(rec?.kind === 'recovered', 'the historical outcome is recovered');
  if (rec?.kind === 'recovered' && rec.outcome.kind === 'proposals') {
    check(rec.outcome.proposals.length === 1 &&
          rec.outcome.proposals[0].sectionId === SEC &&
          rec.outcome.proposals[0].proposedText === 'The kettle clicked off.',
          '⭐ recovered outcome is SEMANTICALLY EQUAL to the historical act');
  } else check(false, 'recovered outcome is semantically equal');

  /* C3 */
  console.log('\n─── C3 · same actId, changed intention');
  const B = invocationDigest(inv('Make this longer.', 'The kettle clicked off.'));
  const r3 = await invoke(c, ref1, 'act-X-0001', B, OUT);
  check(r3.kind === 'conflict', '⭐ HARD CONFLICT, not a replay');
  check(inferenceCalls === 1, 'no new inference');
  const after3 = await counts(c);
  check(after3.turns === after2.turns && after3.props === after2.props, 'the original act is unchanged');
  if (r3.kind === 'conflict') {
    const j = JSON.stringify(r3.verdict);
    check(!j.includes('completed') && !j.includes('already_consumed'),
          'the conflict is not dressed as ordinary replay');
  }

  /* C4 */
  console.log('\n─── C4 · a genuinely new intentional act');
  const ref2 = newRef(); await openClaim(c, ref2);
  const r4 = await invoke(c, ref2, 'act-Y-0002', B, OUT);
  check(r4.kind === 'performed', 'allowed');
  check(inferenceCalls === 2, 'cognition called again');
  const after4 = await counts(c);
  check(after4.turns === after3.turns + 2 && after4.props === after3.props + 1, 'a new historical act exists');

  /* C5 */
  console.log('\n─── C5 · same request, different serialization');
  const reordered = { ...inv('Make this concrete.', 'The kettle clicked off.') };
  check(invocationDigest(reordered) === A, 'same canonical digest');
  const r5 = await invoke(c, ref1, 'act-X-0001', invocationDigest(reordered), OUT);
  check(r5.kind === 'replay', '⭐ lawful replay, not a conflict');

  /* C6 */
  console.log('\n─── C6 · corruption is never repaired by guessing');
  const refN = newRef(); await openClaim(c, refN);
  await invoke(c, refN, 'act-N-0003', invocationDigest(inv('leave it?','The kettle clicked off.')),
               { kind:'no_change', reason:'already concrete' });
  const recN = await recoverAct(tx(c), refN);
  check(recN.kind === 'recovered' && recN.outcome.kind === 'no_change',
        'a lawful no_change recovers positively, from the receipt not from absence');

  await c.query(`DELETE FROM manuscript_revision_proposals WHERE ref_probe IS NULL AND thread_id=$1 AND produced_in_turn_index=(
                   SELECT produced_in_turn_index FROM pending_ask_claims WHERE ref=$2)`, [TH, ref1])
    .catch(async () => { await c.query(`DELETE FROM manuscript_revision_proposals WHERE thread_id=$1 AND produced_in_turn_index=(
                   SELECT produced_in_turn_index FROM pending_ask_claims WHERE ref=$2)`, [TH, ref1]); });
  const corrupt1 = await recoverAct(tx(c), ref1);
  check(corrupt1.kind === 'corrupt', '⭐ proposals receipt + missing proposal -> HARD RECOVERY FAILURE');
  check(!(corrupt1.kind === 'recovered'), '⛔ never downgraded to no_change');

  await c.query(`INSERT INTO manuscript_revision_proposals
      (manuscript_id,draft_id,section_id,member_id,thread_id,produced_in_turn_index,
       proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint)
     SELECT $1,$2,$3,$4,$5,produced_in_turn_index,'smuggled','r','{}','{}','{}','work','{}','p','f'
       FROM pending_ask_claims WHERE ref=$6`, [MS,DR,SEC,M,TH,refN]);
  const corrupt2 = await recoverAct(tx(c), refN);
  check(corrupt2.kind === 'corrupt', '⭐ no_change receipt + attached proposal -> HARD RECOVERY FAILURE');

  const refH = newRef(); await openClaim(c, refH);
  await claimWithDigest(c, refH, 'act-H-0004', A);
  const half = await recoverAct(tx(c), refH);
  check(half.kind === 'incomplete', 'a consumed but uncompleted act is `incomplete`, not a replay');

  let halfReceipt = false;
  try {
    await c.query(`UPDATE pending_ask_claims SET completed_at=now() WHERE ref=$1`, [refH]);
  } catch { halfReceipt = true; }
  check(halfReceipt, '⭐ the schema refuses completion without receipt evidence');

  console.log(`\n${'═'.repeat(60)}\n3C: ${failed} failed`);
  await c.end(); process.exit(failed > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
