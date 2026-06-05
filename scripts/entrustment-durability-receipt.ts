/**
 * Entrustment Covenant — Durability receipt (Stage 1 → Stage 2).
 *
 * Proves the round-trip the live-route change is meant to close:
 *   explicit member filing phrase
 *     → parseFilingInstruction (the member's literal words)
 *     → applyConversationalKeepResult  (the EXACT call the live route now makes)
 *     → row in member_memory_atoms      (Durability: the atom persists)
 *     → loadMemberMemoryAtomsForPrompt  (a LATER session's recall load sees it)
 *
 * This exercises the same code path app/api/sovereign/app/maia/list now runs;
 * it does not stand up the HTTP/auth layer (identical to the already-live
 * atoms-loaded read path). Safe + self-cleaning: a throwaway member is created
 * and deleted (ON DELETE CASCADE removes the test atom — zero residue, no real
 * member touched).
 *
 * Run: npx tsx scripts/entrustment-durability-receipt.ts
 */
import { randomUUID } from 'crypto';
import { query, pool } from '@/lib/db/postgres';
import { parseFilingInstruction, applyConversationalKeepResult } from '@/lib/psyche/conversational-keep';
import { loadMemberMemoryAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';

const PHRASE = 'keep this';
let allPass = true;
function check(ok: boolean, label: string, detail: string) {
  allPass = allPass && ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(12)}  ${detail}`);
}

async function main() {
  const memberId = randomUUID();
  const sessionId = randomUUID();

  // Throwaway member to satisfy member_memory_atoms.member_id FK.
  await query(
    `INSERT INTO members (id, passkey, username, password_hash) VALUES ($1, $2, $3, $4)`,
    [memberId, `TEST-${memberId.slice(0, 8)}`, `test_${memberId.slice(0, 8)}`, 'receipt-only'],
  );

  try {
    // ── Stage 1: Entrust — detection of the member's literal instruction ──
    const filing = parseFilingInstruction({ utterance: PHRASE });
    check(
      !!filing && filing.confidence === 'high' && filing.destination === 'keep',
      'detect',
      `phrase="${PHRASE}" → ${JSON.stringify(filing ? { destination: filing.destination, confidence: filing.confidence } : null)}`,
    );
    if (!filing) throw new Error('detection returned null — cannot continue');

    // ── Stage 1→2: execute the keep EXACTLY as the live route now does ──
    const atom = await applyConversationalKeepResult(memberId, {
      kind: 'filing',
      instruction: filing,
      context: { sessionId },
    });
    check(!!atom?.id, 'write', `atomId=${atom?.id} title="${atom?.title}"`);

    // ── Stage 2: Durability — the row persists in the recall registry ──
    const row = await query<{ id: string; status: string; return_preference: string; kept_at: string }>(
      `SELECT id, status, return_preference, kept_at FROM member_memory_atoms WHERE member_id = $1`,
      [memberId],
    );
    const r0 = row.rows[0];
    check(
      row.rows.length === 1 && r0?.status === 'active',
      'durable',
      `rows=${row.rows.length} status=${r0?.status} kept_at=${r0?.kept_at ? 'set' : 'null'}`,
    );

    // ── Stage 2 verify — a later session's loader returns the kept atom ──
    const loaded = await loadMemberMemoryAtomsForPrompt(memberId);
    const found = loaded.find((a) => a.id === atom.id);
    check(!!found, 'loaded', `loader returned ${loaded.length} atom(s); kept atom present=${!!found}`);

    // ── Honesty gate — the eligibility default that decides ambient surfacing ──
    check(
      r0?.return_preference === 'contextual_doorway',
      'eligibility',
      `return_preference=${r0?.return_preference} (must be contextual_doorway/ritual_review_opt_in to ambiently surface; migration 20260523000001)`,
    );
  } finally {
    // Cleanup — CASCADE removes the test atom with the member.
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
    const leftover = await query<{ n: number }>(
      `SELECT count(*)::int AS n FROM member_memory_atoms WHERE member_id = $1`,
      [memberId],
    );
    check(leftover.rows[0].n === 0, 'cleanup', `residual atoms for test member = ${leftover.rows[0].n}`);
  }

  console.log(`\n${allPass ? '✅ RECEIPT PASS — entrusted "keep this" became durable and was loaded by a later recall read' : '❌ RECEIPT FAIL'}`);
  await pool.end();
  process.exit(allPass ? 0 : 1);
}

main().catch(async (e) => {
  console.error('receipt error:', e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
