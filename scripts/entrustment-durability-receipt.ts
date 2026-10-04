/**
 * T1-A R9/R10 — Keep durability / return-authority receipt.
 *
 * Proves three distinct acts rather than the superseded "Keep implies return" chain:
 *
 *   1. unresolved "keep this" is REFUSED as a filing (R9 exact referent);
 *   2. an exact member-selected Keep is durable but private (KEEP only);
 *   3. only a later explicit return-preference gesture makes it ambiently loadable (REOPEN).
 *
 * Safe + self-cleaning: creates one throwaway member and deletes it at the end.
 * Requires the R10 migration to be applied on the target database.
 *
 * Run: npx tsx scripts/entrustment-durability-receipt.ts
 */
import { randomUUID } from 'crypto';
import { query, pool } from '@/lib/db/postgres';
import { parseFilingInstruction } from '@/lib/psyche/conversational-keep';
import { applyAtomGesture, keepSource } from '@/lib/psyche/portfolio';
import { loadMemberMemoryAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';

const AMBIGUOUS_PHRASE = 'keep this';
const EXACT_MATERIAL = 'This is the exact member-selected material for the R9/R10 receipt.';
let allPass = true;

function check(ok: boolean, label: string, detail: string) {
  allPass = allPass && ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(18)}  ${detail}`);
}

async function main() {
  const memberId = randomUUID();

  await query(
    `INSERT INTO members (id, passkey, username, password_hash) VALUES ($1, $2, $3, $4)`,
    [memberId, `TEST-${memberId.slice(0, 8)}`, `test_${memberId.slice(0, 8)}`, 'receipt-only'],
  );

  try {
    // R9: the command contains an intention, but no resolved material.
    const ambiguous = parseFilingInstruction({ utterance: AMBIGUOUS_PHRASE });
    check(
      ambiguous === null,
      'exact-referent',
      `phrase="${AMBIGUOUS_PHRASE}" → ${ambiguous === null ? 'withheld' : 'WRONGLY executable'}`,
    );

    // KEEP: simulate the already-resolved member act with exact material.
    const atom = await keepSource(memberId, {
      memberId,
      sourceType: 'spontaneous',
      sourceId: null,
      title: 'R9/R10 receipt',
      body: EXACT_MATERIAL,
    });
    check(!!atom.id && atom.wasCreated, 'keep-durable', `atomId=${atom.id}`);

    const beforeRows = await query<{
      id: string;
      status: string;
      return_preference: string;
      return_authority: string;
      kept_at: string;
    }>(
      `SELECT id, status, return_preference, return_authority, kept_at
         FROM member_memory_atoms WHERE member_id = $1`,
      [memberId],
    );
    const before = beforeRows.rows[0];
    check(
      beforeRows.rows.length === 1 &&
        before?.status === 'active' &&
        before?.return_preference === 'member_pulled' &&
        before?.return_authority === 'default_private',
      'keep-is-private',
      `pref=${before?.return_preference} authority=${before?.return_authority}`,
    );

    // KEEP alone must not be ambiently reopened by a later session.
    const beforeLoad = await loadMemberMemoryAtomsForPrompt(memberId);
    check(
      !beforeLoad.some((a) => a.id === atom.id),
      'keep-not-reopen',
      `loader returned ${beforeLoad.length}; kept atom absent=${!beforeLoad.some((a) => a.id === atom.id)}`,
    );

    // REOPEN: a distinct member gesture grants ambient-return authority.
    const reopened = await applyAtomGesture(memberId, atom.id, {
      kind: 'set_return_preference',
      preference: 'contextual_doorway',
    });
    check(
      reopened.returnPreference === 'contextual_doorway' && reopened.returnAuthority === 'member_explicit',
      'reopen-authority',
      `pref=${reopened.returnPreference} authority=${reopened.returnAuthority}`,
    );

    const afterLoad = await loadMemberMemoryAtomsForPrompt(memberId);
    check(
      afterLoad.some((a) => a.id === atom.id),
      'reopen-loads',
      `loader returned ${afterLoad.length}; explicitly authorized atom present=${afterLoad.some((a) => a.id === atom.id)}`,
    );
  } finally {
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
    const leftover = await query<{ n: number }>(
      `SELECT count(*)::int AS n FROM member_memory_atoms WHERE member_id = $1`,
      [memberId],
    );
    check(leftover.rows[0].n === 0, 'cleanup', `residual atoms = ${leftover.rows[0].n}`);
  }

  console.log(
    `\n${allPass
      ? '✅ RECEIPT PASS — KEEP persisted privately; only a separate member REOPEN act made it ambiently returnable'
      : '❌ RECEIPT FAIL'}`,
  );
  if (pool) await pool.end();
  process.exit(allPass ? 0 : 1);
}

main().catch(async (e) => {
  console.error('receipt error:', e);
  try { if (pool) await pool.end(); } catch {}
  process.exit(1);
});
