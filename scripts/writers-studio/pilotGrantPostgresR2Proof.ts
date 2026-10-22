/**
 * WS-TIERS-R2 isolated PostgreSQL 16 proof.
 *
 * Requires an explicitly disposable loopback DB: 127.0.0.1:55439/postgres.
 * DO NOT point at production/staging, use private accounts or reuse an existing
 * Soullab DB. This script creates the complete fictional test schema itself.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { NextRequest } from 'next/server';

const url = process.env.WS_PILOT_TEST_DATABASE_URL;
if (!url) throw new Error('Explicit disposable WS_PILOT_TEST_DATABASE_URL is required');
const parsed = new URL(url);
if (parsed.hostname !== '127.0.0.1' || parsed.port !== '55439'
  || parsed.pathname !== '/postgres' || parsed.username !== 'postgres') {
  throw new Error('REFUSED: test URL is not the dedicated loopback fictional PostgreSQL container');
}
process.env.DATABASE_URL = url;
process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';

const founder = '11111111-1111-4111-8111-111111111111';
const writerA = '22222222-2222-4222-8222-222222222222';
const writerB = '33333333-3333-4333-8333-333333333333';
const cto = '44444444-4444-4444-8444-444444444444';
const outsider = '55555555-5555-4555-8555-555555555555';
const otherFounder = '66666666-6666-4666-8666-666666666666';

async function main() {
  const direct = new Client({ connectionString: url });
  await direct.connect();
  let checks = 0;
  const proof = (name: string, condition: boolean) => {
    assert.equal(condition, true, name);
    checks += 1;
    process.stdout.write('PASS ' + String(checks).padStart(2, '0') + ' ' + name + '\n');
  };

  try {
    // Run against a FRESH disposable container; never clear a reused database.
    await direct.query(`CREATE TABLE members (
      id UUID PRIMARY KEY, admin_role TEXT
    );`);
    await direct.query(`CREATE TABLE ops_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID REFERENCES members(id),
      contact_type TEXT, pipeline_stage TEXT, deleted_at TIMESTAMPTZ
    );`);
    await direct.query(`CREATE TABLE auth_sessions (
      session_token TEXT PRIMARY KEY,
      member_id UUID NOT NULL REFERENCES members(id),
      revoked BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMPTZ NOT NULL
    );`);
    const migration = readFileSync(
      resolve(process.cwd(), 'database/migrations/20261022000001_writer_studio_pilot_grants_r2.sql'),
      'utf8',
    );
    await direct.query(migration);
    proof('actual R2 migration executed in isolated PostgreSQL', true);

    const fixtures: [string, string | null][] = [
      [founder, 'founder'], [writerA, null], [writerB, null], [cto, 'cto'], [outsider, null],
      [otherFounder, 'founder'],
    ];
    for (const [id, role] of fixtures) {
      await direct.query('INSERT INTO members (id, admin_role) VALUES ($1, $2)', [id, role]);
    }
    for (const id of [writerA, writerB, outsider]) {
      await direct.query(
        "INSERT INTO ops_contacts (member_id, contact_type, pipeline_stage) VALUES ($1,'beta_tester','active')",
        [id],
      );
    }
    for (const [token, memberId] of [
      ['founder-session', founder], ['writer-a-session', writerA],
      ['writer-b-session', writerB], ['cto-session', cto],
      ['outsider-session', outsider], ['expired-session', writerA],
      ['other-founder-session', otherFounder],
    ]) {
      await direct.query(
        'INSERT INTO auth_sessions (session_token, member_id, expires_at) VALUES ($1,$2,NOW()+INTERVAL \'1 day\')',
        [token, memberId],
      );
    }
    await direct.query(
      "UPDATE auth_sessions SET expires_at=NOW()-INTERVAL '1 minute' WHERE session_token='expired-session'",
    );
    const {
      readWriterPilotApproval, approvePilotWriter, acceptPilotWriter, revokePilotWriter,
    } = await import('../../lib/writersStudio/pilotGrantServer');
    const { verifiedPilotWriterActor, isTrustedPilotWrite } =
      await import('../../lib/writersStudio/pilotWriteSecurity');
    const { POST: approveRoute, DELETE: revokeRoute } =
      await import('../../app/api/sovereign/writers-studio/pilot-approval/route');
    const { POST: acceptRoute } =
      await import('../../app/api/sovereign/writers-studio/pilot-accept/route');
    const { closePool } = await import('../../lib/db/postgres');

    const request = (path: string, token: string, method: 'POST' | 'DELETE' = 'POST',
      body?: Record<string, unknown>, origin = 'https://beta.soullab.test') => new NextRequest(
      'https://beta.soullab.test/api/sovereign/writers-studio/' + path,
      {
        method,
        headers: {
          Origin: origin,
          'x-session-token': token,
          'Sec-Fetch-Site': 'same-origin',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );

    proof('unbound founder account cannot mint an approval',
      !(await approvePilotWriter(writerA, founder)));
    proof('unbound founder witness is not represented as verified owner',
      !(await readWriterPilotApproval(founder)).eligible);
    await direct.query(
      'UPDATE writer_studio_pilot_admission_control SET founder_member_id=$1 WHERE singleton=TRUE',
      [founder],
    );
    proof('fictional test authority binds one exact founder member ID',
      (await direct.query(
        'SELECT founder_member_id FROM writer_studio_pilot_admission_control',
      )).rows[0]?.founder_member_id === founder);
    const unselected = await verifiedPilotWriterActor(request('pilot-approval', 'other-founder-session'));
    proof('another founder-role member is not the selected enrollment authority',
      unselected?.founder === false);
    const otherFounderApproval = await approveRoute(request(
      'pilot-approval', 'other-founder-session', 'POST', { memberId: writerB },
    ));
    proof('real handler refuses unselected founder account',
      otherFounderApproval.status === 403);

    proof('CRM-only writer A does not receive Pro',
      (await readWriterPilotApproval(writerA)).eligible === false);
    proof('CRM-only writer B does not receive Pro',
      (await readWriterPilotApproval(writerB)).eligible === false);
    proof('founder witness role, not generic admin, gets complimentary Pro',
      (await readWriterPilotApproval(founder)).basis === 'founder_witness'
      && !(await readWriterPilotApproval(cto)).eligible);

    proof('CTO cannot approve even using direct R2 server grant function',
      !(await approvePilotWriter(writerA, cto)));
    proof('nonexistent member cannot be approved',
      !(await approvePilotWriter('77777777-7777-4777-8777-777777777777', founder)));

    const simultaneous = await Promise.all(
      Array.from({ length: 8 }, () => approvePilotWriter(writerA, founder)),
    );
    proof('8 simultaneous founder approvals admit exactly one grant',
      simultaneous.filter(Boolean).length === 1);
    proof('founder approval remains pending until writer accepts',
      !(await readWriterPilotApproval(writerA)).eligible);

    let insertRefused = false;
    try {
      await direct.query(
        'INSERT INTO writer_studio_beta_grants (member_id,approved_by) VALUES ($1,$2)',
        [writerB, cto],
      );
    } catch { insertRefused = true; }
    proof('PostgreSQL trigger rejects nonfounder insertion', insertRefused);
    const unauthorized = await approveRoute(request('pilot-approval', 'cto-session', 'POST', { memberId: writerB }));
    proof('actual HTTP-handler denies CTO approval', unauthorized.status === 403);

    const crossOrigin = await approveRoute(request(
      'pilot-approval', 'founder-session', 'POST', { memberId: writerB }, 'https://foreign.test',
    ));
    proof('actual handler refuses cross-site founder approval', crossOrigin.status === 403);

    const realApproval = await approveRoute(request(
      'pilot-approval', 'founder-session', 'POST', { memberId: writerB },
    ));
    proof('actual handler accepts one explicitly founded account grant', realApproval.status === 200);
    proof('newly approved writer B remains pending until own acceptance',
      !(await readWriterPilotApproval(writerB)).eligible);

    proof('third independently eligible CRM candidate cannot bypass two-seat canary',
      !(await approvePilotWriter(outsider, founder)));
    const thirdRoute = await approveRoute(request(
      'pilot-approval', 'founder-session', 'POST', { memberId: outsider },
    ));
    proof('actual founder route refuses a third seat until independent canary expansion',
      thirdRoute.status === 409);
    let directThirdRefused = false;
    try {
      await direct.query(
        'INSERT INTO writer_studio_beta_grants (member_id,approved_by) VALUES ($1,$2)',
        [outsider, founder],
      );
    } catch { directThirdRefused = true; }
    proof('PostgreSQL guard independently refuses third-seat direct insertion',
      directThirdRefused);

    const wrongWriterAccept = await acceptRoute(request('pilot-accept', 'outsider-session'));
    proof('unapproved account cannot accept another writer’s grant',
      wrongWriterAccept.status === 409 && !(await readWriterPilotApproval(outsider)).eligible);

    const acceptedA = await acceptRoute(request('pilot-accept', 'writer-a-session'));
    proof('writer A accepts with own verified session', acceptedA.status === 200);
    const acceptedB = await acceptRoute(request('pilot-accept', 'writer-b-session'));
    proof('writer B accepts with own verified session', acceptedB.status === 200);
    proof('both founder-approved and accepted writers have complimentary Pro inclusion',
      (await readWriterPilotApproval(writerA)).basis === 'founder_approved_beta'
      && (await readWriterPilotApproval(writerB)).basis === 'founder_approved_beta');
    proof('repeated acceptance is refused', !(await acceptPilotWriter(writerA)));

    await direct.query("UPDATE members SET admin_role='cto' WHERE id=$1", [founder]);
    proof('founder losing founder role suspends all approval authority',
      !(await readWriterPilotApproval(writerA)).eligible);
    await direct.query("UPDATE members SET admin_role='founder' WHERE id=$1", [founder]);

    await direct.query("UPDATE ops_contacts SET pipeline_stage='churned' WHERE member_id=$1", [writerA]);
    proof('inactive CRM contact cannot retain an active accepted beta grant',
      !(await readWriterPilotApproval(writerA)).eligible);
    await direct.query("UPDATE ops_contacts SET pipeline_stage='active' WHERE member_id=$1", [writerA]);

    const wrongRevoke = await revokeRoute(request(
      'pilot-approval', 'cto-session', 'DELETE', { memberId: writerA },
    ));
    proof('CTO cannot revoke a founder-authorized grant', wrongRevoke.status === 403);
    const revokeResponse = await revokeRoute(request(
      'pilot-approval', 'founder-session', 'DELETE', { memberId: writerA },
    ));
    proof('founder can explicitly revoke writer A grant', revokeResponse.status === 200);
    proof('revoked member A no longer receives Pro',
      !(await readWriterPilotApproval(writerA)).eligible);
    proof('revoked grant cannot be silently approved again',
      !(await approvePilotWriter(writerA, founder)));
    proof('revoked grant cannot be silently accepted again',
      !(await acceptPilotWriter(writerA)));
    let reopeningRefused = false;
    try {
      await direct.query(
        "UPDATE writer_studio_beta_grants SET grant_state='accepted', revoked_at=NULL, revoked_by=NULL WHERE member_id=$1",
        [writerA],
      );
    } catch { reopeningRefused = true; }
    proof('DB trigger makes revocation terminal in current database', reopeningRefused);
    proof('unrelated writer B remains admitted after writer A revocation',
      (await readWriterPilotApproval(writerB)).eligible);

    const badHeaderPair = request('pilot-approval', 'founder-session');
    badHeaderPair.cookies.set('maia_session', 'writer-a-session');
    proof('conflicting two valid sessions fail identity verification',
      (await verifiedPilotWriterActor(badHeaderPair)) === null);
    const stalePair = request('pilot-approval', 'founder-session');
    stalePair.cookies.set('maia_session', 'expired-session');
    proof('expired cookie cannot be ignored when a valid header is present',
      (await verifiedPilotWriterActor(stalePair)) === null);
    proof('explicit exact origin required for mutation',
      isTrustedPilotWrite(request('pilot-approval', 'founder-session')));
    const absentOrigin = request('pilot-approval', 'founder-session');
    absentOrigin.headers.delete('Origin');
    proof('originless mutation is refused',
      !isTrustedPilotWrite(absentOrigin));

    const row = await direct.query(
      'SELECT grant_state, accepted_at, revoked_at FROM writer_studio_beta_grants WHERE member_id=$1',
      [writerA],
    );
    proof('revoked approval retains no manuscript/feedback fields',
      row.rows[0]?.grant_state === 'revoked' && !!row.rows[0]?.revoked_at);

    await closePool();
    process.stdout.write('RESULT: ' + checks + '/' + checks + ' isolated PostgreSQL/handler checks PASS\n');
  } finally {
    await direct.end();
  }
}

main().catch((error) => {
  process.stderr.write('R2 isolated witness FAILED (' + (error as Error).name + ')\n');
  process.exitCode = 1;
});
