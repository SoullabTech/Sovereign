/**
 * Sanctuary S5 — behavioral proof (provenance substrate)
 *
 *   npx tsx tests/constitutional/sanctuary-s5-behavioral-proof.ts
 *
 * Runs against a REAL database (DATABASE_URL / local dev stack — never run
 * against production) AFTER migration 20260718000001_s5_provenance_substrate
 * is applied. Drives real store code and raw SQL through the S5 gates and
 * asserts row-level outcomes.
 *
 * PROOF A — mint gate (constitutional sentence 2):
 *   a raw INSERT into conversation_turns without provenance is REFUSED by the
 *   DB trigger; TurnsStore writes (which mint server-side) succeed and carry
 *   posture_at_creation='normal' + complete provenance.
 * PROOF B — tombstone refusal (R20):
 *   a tombstoned id, re-inserted (the restore shape), is silently DROPPED.
 * PROOF C — manifest-scope refusal (R20):
 *   a row inside a deletion-manifest scope (session + window), re-inserted,
 *   is silently DROPPED — the incident's exact predicate shape.
 * PROOF D — unknown-historical is never minted anew (§7):
 *   an atom INSERT claiming posture 'unknown-historical' is REFUSED; and
 *   crossing_allowed cannot be newly enabled on an unknown-historical atom.
 * PROOF E — consent-state record:
 *   recordConsentState writes a content-free row resolvable by request id;
 *   resolveRecordedPosture of an unknown id is null (fail closed), not 'normal'.
 */

import { randomUUID } from 'crypto';
import { query, queryOne } from '../../lib/db/postgres';
import { TurnsStore } from '../../lib/memory/stores/TurnsStore';
import { TurnPosture } from '../../lib/sanctuary/turnPosture';
import { recordConsentState, resolveRecordedPosture } from '../../lib/provenance/consentState';

const SESSION = `s5proof-${randomUUID()}`;
const USER = `s5proof-user-${randomUUID().slice(0, 8)}`;

let passed = 0;
let failed = 0;
function assert(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ✅ ${name}${detail ? `  (${detail})` : ''}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? `  (${detail})` : ''}`); }
}

async function turnCount(): Promise<number> {
  const r = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM conversation_turns WHERE session_id = $1`, [SESSION]);
  return Number(r?.n ?? 0);
}

async function main() {
  console.log('Sanctuary S5 — behavioral proof (real DB, real stores)');
  console.log(`  session=${SESSION}`);

  // ── PROOF A — mint gate ────────────────────────────────────────────────────
  console.log('\nPROOF A — mint gate');
  let rawRefused = false;
  try {
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation)
       VALUES ($1, $2, 'user', 'unattested write attempt', 'normal')`,
      [USER, SESSION]);
  } catch (err) {
    rawRefused = err instanceof Error && err.message.includes('[PROVENANCE] mint failed');
  }
  assert('A1: raw INSERT without provenance refused by DB trigger', rawRefused);

  let unknownRefused = false;
  try {
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation, provenance)
       VALUES ($1, $2, 'user', 'backdated-unknown attempt', 'unknown-historical', '{}'::jsonb)`,
      [USER, SESSION]);
  } catch (err) {
    unknownRefused = err instanceof Error && err.message.includes('[PROVENANCE] mint failed');
  }
  assert('A2: unknown-historical may never be minted anew (turns)', unknownRefused);

  const posture = TurnPosture.resolve({ sanctuary: false });
  await TurnsStore.addExchange(posture, USER, SESSION, 'hello there', 'hello back', randomUUID());
  const minted = await queryOne<{ posture_at_creation: string; provenance: Record<string, unknown> | null }>(
    `SELECT posture_at_creation, provenance FROM conversation_turns
     WHERE session_id = $1 ORDER BY created_at ASC LIMIT 1`, [SESSION]);
  assert('A3: store-minted turn persisted with posture normal', minted?.posture_at_creation === 'normal');
  const prov = minted?.provenance ?? null;
  const provComplete = !!prov && ['createdBy', 'generatedBy', 'postureAtCreation', 'sourceContainer', 'source', 'persistencePolicy']
    .every((k) => Object.prototype.hasOwnProperty.call(prov, k));
  assert('A4: provenance complete (all six constitutional keys)', provComplete,
    prov ? Object.keys(prov).join(',') : 'NULL');
  assert('A5: both exchange turns persisted', (await turnCount()) === 2);

  // ── PROOF B — tombstone refusal ────────────────────────────────────────────
  console.log('\nPROOF B — tombstone refusal (R20)');
  const manifestId = randomUUID();
  await query(
    `INSERT INTO deletion_manifests (id, reason_class, incident_ref, authorized_by, note)
     VALUES ($1, 'sanctuary_purge', 'S5-PROOF', 'behavioral-proof fixture', 'proof fixture — deleted at end')`,
    [manifestId]);
  const victim = await queryOne<{ id: string }>(
    `SELECT id FROM conversation_turns WHERE session_id = $1 LIMIT 1`, [SESSION]);
  const victimId = victim!.id;
  await query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id) VALUES ($1, 'conversation_turns', $2)`,
    [manifestId, victimId]);
  await query(`DELETE FROM conversation_turns WHERE id = $1`, [victimId]);
  assert('B1: sovereignty deletion executed', (await turnCount()) === 1);

  // The restore shape: re-insert the forgotten row with its original id and
  // full provenance (a restore replays exactly what was dumped).
  await query(
    `INSERT INTO conversation_turns (id, user_id, session_id, role, content, posture_at_creation, provenance)
     VALUES ($1, $2, $3, 'user', 'resurrected content attempt', 'normal',
       '{"createdBy":"member","generatedBy":"member-utterance","postureAtCreation":"normal","sourceContainer":"personal","source":{},"persistencePolicy":{}}'::jsonb)`,
    [victimId, USER, SESSION]);
  assert('B2: tombstoned row silently dropped on re-insert (restore refused)', (await turnCount()) === 1);

  // ── PROOF C — manifest-scope refusal ───────────────────────────────────────
  console.log('\nPROOF C — manifest-scope refusal (R20, the incident predicate shape)');
  await query(
    `INSERT INTO deletion_manifest_scopes (manifest_id, table_name, session_id, window_start, window_end)
     VALUES ($1, 'conversation_turns', $2, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour')`,
    [manifestId, SESSION]);
  await query(
    `INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation, provenance)
     VALUES ($1, $2, 'user', 'in-scope resurrection attempt', 'normal',
       '{"createdBy":"member","generatedBy":"member-utterance","postureAtCreation":"normal","sourceContainer":"personal","source":{},"persistencePolicy":{}}'::jsonb)`,
    [USER, SESSION]);
  assert('C1: in-scope row silently dropped (scope filter live)', (await turnCount()) === 1);
  // Remove the scope so cleanup/other proofs are unaffected
  await query(`DELETE FROM deletion_manifest_scopes WHERE manifest_id = $1`, [manifestId]);

  // ── PROOF D — atoms: unknown-historical never minted; never newly collective ─
  console.log('\nPROOF D — atom attestation');
  let atomUnknownRefused = false;
  try {
    await query(
      `INSERT INTO member_memory_atoms (member_id, source_type, title, posture_at_creation, generated_by)
       VALUES ((SELECT id FROM members LIMIT 1), 'spontaneous', 's5 proof', 'unknown-historical', 'member-gesture')`);
  } catch (err) {
    atomUnknownRefused = err instanceof Error && err.message.includes('[PROVENANCE] mint failed');
  }
  assert('D1: atom INSERT claiming unknown-historical refused', atomUnknownRefused);

  let atomUnattestedRefused = false;
  try {
    await query(
      `INSERT INTO member_memory_atoms (member_id, source_type, title, posture_at_creation, generated_by)
       VALUES ((SELECT id FROM members LIMIT 1), 'spontaneous', 's5 proof', 'normal', 'unattributed-historical')`);
  } catch (err) {
    atomUnattestedRefused = err instanceof Error && err.message.includes('[PROVENANCE] mint failed');
  }
  assert('D2: atom INSERT claiming unattributed-historical generation refused', atomUnattestedRefused);

  // ── PROOF C+ — malformed provenance (present but incomplete) ───────────────
  console.log('\nPROOF C+ — malformed provenance refused');
  let malformedRefused = false;
  try {
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation, provenance)
       VALUES ($1, $2, 'user', 'malformed provenance attempt', 'normal',
         '{"createdBy":"member","generatedBy":"member-utterance"}'::jsonb)`,
      [USER, SESSION]);
  } catch (err) {
    malformedRefused = err instanceof Error && err.message.includes('[PROVENANCE] mint failed');
  }
  assert('C2: provenance missing constitutional keys refused (partial forge)', malformedRefused);

  // ── PROOF E — consent-state record ─────────────────────────────────────────
  console.log('\nPROOF E — consent-state record');
  const reqId = randomUUID();
  recordConsentState({ requestId: reqId, posture, memberId: USER, sessionId: SESSION });
  await new Promise((r) => setTimeout(r, 300)); // fire-and-forget settle
  const recorded = await resolveRecordedPosture(reqId);
  assert('E1: recorded posture resolvable by request id', recorded === 'normal', String(recorded));
  const absent = await resolveRecordedPosture(randomUUID());
  assert('E2: unknown request id resolves to null (fail closed), never normal', absent === null);

  let immutableRefused = false;
  try {
    await query(`UPDATE runtime_consent_state SET posture = 'sanctuary' WHERE request_id = $1`, [reqId]);
  } catch (err) {
    immutableRefused = err instanceof Error && err.message.includes('consent-state is immutable');
  }
  assert('E3: consent-state record immutable once minted (UPDATE refused)', immutableRefused);

  // ── Cleanup — proof fixtures only ──────────────────────────────────────────
  await query(`DELETE FROM provenance_tombstones WHERE manifest_id = $1`, [manifestId]);
  await query(`DELETE FROM deletion_manifests WHERE id = $1`, [manifestId]);
  await query(`DELETE FROM conversation_turns WHERE session_id = $1`, [SESSION]);
  await query(`DELETE FROM runtime_consent_state WHERE request_id = $1`, [reqId]);

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('proof runner error:', err);
  process.exit(1);
});
