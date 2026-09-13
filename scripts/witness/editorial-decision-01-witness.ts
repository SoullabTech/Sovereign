/**
 * EDITORIAL-DECISION-01 — the real specimen, witnessed.
 *
 * Records D1 — the campfire ruling — against the actual *Elemental Alchemy*
 * reading, THROUGH THE STORE SEAM. ⛔ No hand-written INSERT: an act recorded
 * by SQL would prove the table exists and nothing about the authority that is
 * supposed to govern writing to it.
 *
 * ── ⛔ WHAT IT MAY NOT DO ─────────────────────────────────────────────────
 *
 * ⛔ It writes exactly ONE editorial decision and NOTHING else. It touches no
 * standing, no manuscript, no draft, no production. The immutability proof runs
 * inside a transaction that is ALWAYS rolled back, so the witness cannot
 * contaminate the specimen it just recorded.
 *
 * ⛔ NO MEMBER PROSE IS PRINTED except the decision body itself, which the
 * founder authored and is the subject of the act.
 *
 * ── RUN ───────────────────────────────────────────────────────────────────
 *
 *   psql -d maia_focus_witness -f database/migrations/20260913000001_editorial_decision_events.sql
 *   DATABASE_URL=postgresql://soullab@localhost:5432/maia_focus_witness \
 *     npx tsx scripts/witness/editorial-decision-01-witness.ts
 */

import { query, transaction } from '@/lib/db/postgres';
import {
  recordEditorialDecision, currentDecision, decisionHistory,
} from '@/lib/manuscript/editorialDecision/store';
import { decisionsFor, mayRecord } from '@/lib/manuscript/editorialDecision/contract';

const WORK = 'a3ae67fd-a21e-4948-8766-4c397d2e4712';
const READING = '3f692e22-b959-4f20-93b5-7033887cb488';
const MEMBER = 'ce284751-e457-42f6-89b6-bc07d0876682';

const D1 = {
  statement: 'Keep the campfire recurrence. Each return must advance rather than merely repeat.',
  intent: 'The lived campfire experience remains phenomenological first.',
  principle: 'lived scene → interpretation → presence → sustaining → embers',
};

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? '  ok  ' : '  ✕   '}${name}${detail ? `  ·  ${detail}` : ''}`);
};

async function scalar<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const r = await query<Record<string, T>>(sql, params);
  return r.rows[0] ? Object.values(r.rows[0])[0] : undefined;
}

async function main() {
  console.log('EDITORIAL-DECISION-01 — the real specimen\n');

  /* ── the state BEFORE, so every delta is measured rather than assumed ── */
  const draft = await query<{ id: string; version: number }>(
    `SELECT id, version FROM manuscript_working_drafts
      WHERE manuscript_id = $1 ORDER BY version DESC LIMIT 1`, [WORK]);
  const workingDraftId = draft.rows[0]?.id ?? null;
  const workingDraftVersion = draft.rows[0] ? Number(draft.rows[0].version) : null;

  const standingsBefore = await scalar<string>(
    'SELECT count(*) FROM developmental_observation_standing_events');
  const decisionsBefore = await scalar<string>(
    'SELECT count(*) FROM editorial_decision_events');
  const textDigestBefore = await scalar<string>(
    `SELECT md5(string_agg(s.text, '' ORDER BY s.position))
       FROM manuscript_draft_sections s WHERE s.draft_id = $1`, [workingDraftId]);

  console.log(`WORK          ${WORK}`);
  console.log(`DRAFT         ${workingDraftId}  ·  version ${workingDraftVersion}`);
  console.log(`standings     ${standingsBefore}`);
  console.log(`decisions     ${decisionsBefore}\n`);

  check('the Work is at version 34', workingDraftVersion === 34, `v${workingDraftVersion}`);

  /* ── the act ─────────────────────────────────────────────────────────── */
  const result = await recordEditorialDecision(MEMBER, WORK, {
    expectedCurrentEventId: null,
    body: D1,
    governs: [{ readingId: READING, observationKey: 'o1' }],
    authorship: 'member_confirmed_maia_proposal',
    workingDraftId, workingDraftVersion,
  });

  if (result.outcome !== 'appended') {
    console.log(`\n⛔ THE ACT DID NOT RECORD: ${JSON.stringify(result)}`);
    process.exit(1);
  }
  const d1 = result.event;
  console.log(`\nD1  chain ${d1.decisionChainId}  ·  event ${d1.eventIndex}\n`);

  check('a new chain, at event_index 0', d1.eventIndex === 0);
  check('governs exactly {o1}',
    d1.governs.length === 1 && d1.governs[0].observationKey === 'o1',
    d1.governs.map((g) => g.observationKey).join(','));
  check('⛔ o4 is ABSENT — that edge was never authored',
    !d1.governs.some((g) => g.observationKey === 'o4'));
  check('authorship is member_confirmed_maia_proposal',
    d1.authorship === 'member_confirmed_maia_proposal');
  check('ruled against working draft v34', d1.workingDraftVersion === 34);

  /* ── ⭐⭐ THE COUPLING LAW, measured ─────────────────────────────────── */
  const standingsAfter = await scalar<string>(
    'SELECT count(*) FROM developmental_observation_standing_events');
  check('⭐⭐ standing rows delta 0 — a decision is not a standing',
    standingsAfter === standingsBefore, `${standingsBefore} → ${standingsAfter}`);

  /* ── the manuscript is untouched ─────────────────────────────────────── */
  const versionAfter = await scalar<number>(
    `SELECT version FROM manuscript_working_drafts WHERE id = $1`, [workingDraftId]);
  const textDigestAfter = await scalar<string>(
    `SELECT md5(string_agg(s.text, '' ORDER BY s.position))
       FROM manuscript_draft_sections s WHERE s.draft_id = $1`, [workingDraftId]);
  check('manuscript still at version 34', Number(versionAfter) === 34);
  check('⛔ manuscript text byte-identical', textDigestAfter === textDigestBefore);

  /* ── the read side ───────────────────────────────────────────────────── */
  const current = await currentDecision(MEMBER, d1.decisionChainId);
  const history = await decisionHistory(MEMBER, d1.decisionChainId);
  check('the current lookup returns D1', current?.id === d1.id);
  check('history holds exactly one event', history.length === 1);
  check('scope reads back as o1 only',
    current?.governs.length === 1 && current.governs[0].observationKey === 'o1');

  const view = decisionsFor(
    { state: 'available', workId: WORK, decisions: [d1] }, WORK);
  check('⭐ UNKNOWN ≠ UNSET — available-with-one is `some`', view.state === 'some');
  check('an unavailable lookup is UNKNOWN, and the act is withheld',
    !mayRecord(decisionsFor({ state: 'unavailable', workId: WORK }, WORK)));

  /* ── ⭐ IMMUTABILITY, AGAINST THE REAL TRIGGERS, ALWAYS ROLLED BACK ──── */
  for (const [name, sql, params] of [
    ['UPDATE the event is refused',
      `UPDATE editorial_decision_events SET statement = 'tampered' WHERE id = $1`, [d1.id]],
    ['DELETE a governs row is refused',
      `DELETE FROM editorial_decision_event_observations
        WHERE decision_chain_id = $1 AND event_index = 0`, [d1.decisionChainId]],
    ['DELETE the event is refused',
      `DELETE FROM editorial_decision_events WHERE id = $1`, [d1.id]],
  ] as [string, string, unknown[]][]) {
    /**
     * ⛔⭐ ONE CONNECTION, OR THE ROLLBACK IS A FICTION. The first draft issued
     * `query('BEGIN')` and `query('ROLLBACK')` through the POOL, so each
     * statement could take a different client and the UPDATE would have run
     * outside any transaction — able to contaminate the specimen this witness
     * had just recorded, in the one place where that must be impossible.
     *
     * `transaction()` holds a single client and rolls back on any throw. The
     * sentinel below is thrown when the statement UNEXPECTEDLY SUCCEEDS, so the
     * write is undone either way and the two outcomes stay distinguishable.
     */
    const SENTINEL = 'witness: statement applied — rolling back';
    let refused = false;
    try {
      await transaction(async (tx) => {
        await tx.query(sql, params);
        throw new Error(SENTINEL);
      });
    } catch (e) {
      refused = !(e instanceof Error && e.message === SENTINEL);
    }
    check(`⭐ ${name}`, refused);
  }

  const decisionsAfter = await scalar<string>(
    'SELECT count(*) FROM editorial_decision_events');
  check('exactly one decision exists afterwards',
    Number(decisionsAfter) === Number(decisionsBefore) + 1,
    `${decisionsBefore} → ${decisionsAfter}`);

  console.log(`\n${failures === 0 ? '⭐ ALL CHECKS PASSED' : `⛔ ${failures} CHECK(S) FAILED`}`);
  console.log('⛔ production untouched · manuscript v34 · no standing written');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
