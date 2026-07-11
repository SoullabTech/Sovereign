/**
 * Two-party relay verification — setup script.
 *
 * Creates ONE throwaway Encounter with two participants (practitioner + client),
 * crosses BOTH thresholds (writes join+record consent rows), mints both
 * participant-scoped threshold tokens, and prints the two final join URLs.
 *
 * Runbook: docs/specs/SESSION_ROOM_VIDEO_RELAY_VERIFICATION_2026-07-08.md
 *
 * WHY IN-CONTAINER: tokens are HMAC-signed with JWT_SECRET and the rows must live in
 * the prod DB the room verifies against. Mint anywhere else and the room rejects the
 * link (invalid_token). Run it inside maia-sovereign:
 *
 *   ssh soullab@minisforum 'docker exec maia-sovereign \
 *     sh -c "DATABASE_URL=\$DATABASE_URL JWT_SECRET=\$JWT_SECRET \
 *            npx tsx scripts/setup-relay-verify-encounter.ts"'
 *
 * WRITES (intentional, the only writes): 1 encounters row, 2 encounter_participants
 * rows, 4 encounter_consent_events rows. Everything else is read-only.
 * Cleanup (cascades): DELETE FROM encounters WHERE id = '<printed id>';
 *
 * Options (env):
 *   BASE_URL   default https://soullab.life
 *   TITLE      default "relay-verify (throwaway)"
 */

import { query, closePool } from '@/lib/db/postgres';
import { mintThresholdToken, RECORD_CONSENT_TEXT } from '@/lib/encounters/threshold';

const BASE_URL = (process.env.BASE_URL ?? 'https://soullab.life').replace(/\/$/, '');
const TITLE = process.env.TITLE ?? 'relay-verify (throwaway)';

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set — run inside maia-sovereign so tokens match the room.');
  }

  // Borrow a valid ownership triple from an existing encounter so every FK / NOT NULL /
  // CHECK constraint (practitioner_id, team_id NOT NULL, encounter_type CHECK) is satisfied
  // without guessing the practitioners/teams schema. Prod has run encounters, so one exists.
  const sample = await query<{ practitioner_id: string; team_id: string; encounter_type: string }>(
    `SELECT practitioner_id, team_id, encounter_type
       FROM encounters
      WHERE team_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1`
  );
  if (sample.rows.length === 0) {
    throw new Error(
      'No existing encounter to borrow (practitioner_id, team_id, encounter_type) from. ' +
        'Create one Encounter in the Studio first, then re-run.'
    );
  }
  const { practitioner_id, team_id, encounter_type } = sample.rows[0];

  // 1. Encounter
  const enc = await query<{ id: string }>(
    `INSERT INTO encounters (practitioner_id, team_id, title, encounter_type, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING id`,
    [practitioner_id, team_id, TITLE, encounter_type]
  );
  const encounterId = enc.rows[0].id;

  // 2. Two participants. role CHECK = practitioner|client|supervisor|observer.
  //    The PRACTITIONER is the WebRTC offerer (page.makeOffer gates on role==='practitioner').
  async function addParticipant(displayName: string, role: 'practitioner' | 'client') {
    const r = await query<{ id: string }>(
      `INSERT INTO encounter_participants (encounter_id, display_name, role)
       VALUES ($1, $2, $3) RETURNING id`,
      [encounterId, displayName, role]
    );
    return r.rows[0].id;
  }
  const pracId = await addParticipant('Prac (offerer)', 'practitioner');
  const clientId = await addParticipant('Guest (answerer)', 'client');

  // 3. Cross BOTH thresholds — write join + record consent (idempotent). Without the 'join'
  //    row the room's door refuses (no_consent → no signaling → no media). This is the same
  //    write the participant authors at /open/threshold/[token]; we author it here so the
  //    test is repeatable without two humans clicking through the consent screen first.
  async function crossThreshold(participantId: string) {
    await query(
      `INSERT INTO encounter_consent_events (encounter_id, participant_id, kind, text_snapshot)
       VALUES ($1, $2, 'join', NULL), ($1, $2, 'record', $3)
       ON CONFLICT (encounter_id, participant_id, kind) DO NOTHING`,
      [encounterId, participantId, RECORD_CONSENT_TEXT]
    );
  }
  await crossThreshold(pracId);
  await crossThreshold(clientId);

  // 4. Mint participant-scoped tokens + build join URLs. role param is a label only —
  //    the room re-derives role server-side from the participant row (roomDoor).
  const pracToken = mintThresholdToken(encounterId, pracId);
  const clientToken = mintThresholdToken(encounterId, clientId);
  const pracUrl = `${BASE_URL}/open/session-room/${encounterId}?threshold=${pracToken}&role=practitioner`;
  const clientUrl = `${BASE_URL}/open/session-room/${encounterId}?threshold=${clientToken}&role=guest`;

  const line = '─'.repeat(72);
  console.log(`\n${line}`);
  console.log('TWO-PARTY RELAY VERIFICATION — join URLs ready');
  console.log(line);
  console.log(`encounter id : ${encounterId}`);
  console.log(`base         : ${BASE_URL}`);
  console.log(`consent      : both thresholds crossed (join + record) ✓`);
  console.log(line);
  console.log('\n① PRACTITIONER  (the OFFERER — open this one FIRST):');
  console.log(`   ${pracUrl}`);
  console.log('\n② GUEST/CLIENT  (the ANSWERER — MUST be on a DIFFERENT network):');
  console.log(`   ${clientUrl}`);
  console.log(`\n${line}`);
  console.log('HOW TO RUN THE TEST');
  console.log(line);
  console.log('1. Open ① on network A (e.g. home wifi). Click "Join as practitioner", grant mic.');
  console.log('2. Open ② on network B (e.g. a phone on cellular). Click "Join as guest", grant mic.');
  console.log('   → For a REAL relay test the two networks must differ; two tabs on one LAN');
  console.log('     connect host-to-host and never exercise coturn.');
  console.log('3. On BOTH status blocks confirm:  connection: connected · remote audible: yes');
  console.log('4. Read the "connected via" row on the GUEST:');
  console.log('     relay ⇄ *  → coturn relay is carrying media (Q2 PASS — router forward works)');
  console.log('     srflx/host → traversed without relay (lucky NAT; retry from behind symmetric NAT');
  console.log('                  to actually force the relay path)');
  console.log('5. Watch the server signaling log in a second terminal:');
  console.log("     ssh soullab@minisforum 'docker logs maia-sovereign -f --since 2m 2>&1 \\");
  console.log('       | grep -E "\\[signal\\]|MODULE_ID"\'');
  console.log('   → both peers must show the SAME MODULE_ID (a mismatch = split process = they');
  console.log('     never rendezvous).');
  console.log(`\ncleanup when done (cascades to participants + consent):`);
  console.log(`   DELETE FROM encounters WHERE id = '${encounterId}';`);
  console.log(`${line}\n`);
}

main()
  .then(() => closePool())
  .catch(async (err) => {
    console.error('[setup-relay-verify] FAILED:', err?.message ?? err);
    await closePool().catch(() => {});
    process.exit(1);
  });
