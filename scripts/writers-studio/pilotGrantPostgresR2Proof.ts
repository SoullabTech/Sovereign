/**
 * WS-TIERS-R2 isolated PostgreSQL 16 proof.
 *
 * Requires an explicitly disposable loopback DB: 127.0.0.1:55439/postgres.
 * DO NOT point at production/staging, use private accounts or reuse an existing
 * Soullab DB. This script creates the complete fictional test schema itself.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
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
const RESTORE_WITNESS = process.env.WS_PILOT_RESTORE_WITNESS === '1';
const R20_URL = process.env.WS_PILOT_R20_WITNESS_URL;
if (RESTORE_WITNESS) {
  if (!R20_URL) throw new Error('Explicit disposable R20 witness URL required');
  const r20 = new URL(R20_URL);
  if (r20.hostname !== '127.0.0.1' || r20.port !== '55440'
      || r20.pathname !== '/postgres' || r20.username !== 'postgres') {
    throw new Error('REFUSED: R20 witness must be a separate, fixed fictional loopback container');
  }
}
function dockerFictional(...args: string[]): void {
  if (!RESTORE_WITNESS) throw new Error('Restore proof mode required');
  // Fixed container name; no caller-supplied Docker target.
  execFileSync('/usr/local/bin/docker', ['exec', 'ws-tiers-r2-fictional-20261022', ...args], {
    stdio: 'pipe', timeout: 30000,
  });
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
  const outsideR20 = RESTORE_WITNESS
    ? new Client({ connectionString: R20_URL })
    : null;
  if (outsideR20) {
    await outsideR20.connect();
    await outsideR20.query(`CREATE TABLE fictional_r20_revoked_grants (
      grant_id UUID PRIMARY KEY,
      revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  }
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
    const { readWriterPilotApproval } = await import(
      '../../lib/writersStudio/pilotGrantServer'
    );
    // Only the fictitious SQL model can be invoked on this guarded,
    // throwaway loopback PostgreSQL16 witness. Application exports refuse.
    const { approvePilotWriter, acceptPilotWriter, revokePilotWriter } = await import(
      './r9-fixture/fictionalPilotGrantDbModel'
    );
    const { verifiedPilotWriterActor, isTrustedPilotWrite } =
      await import('../../lib/writersStudio/pilotWriteSecurity');
    const { POST: approveRoute, DELETE: revokeRoute } =
      await import('../../app/api/sovereign/writers-studio/pilot-approval/route');
    const { POST: acceptRoute } =
      await import('../../app/api/sovereign/writers-studio/pilot-accept/route');
    const { closePool } = await import('../../lib/db/postgres');
    const { writerStudioPlanForMember } = await import('../../lib/writersStudio/planAccessServer');
    const { writersStudioBetaAccess } = await import('../../lib/writersStudio/betaAccessServer');
    // R7: beta-access and feedback now use the same strict request-bound
    // dual-credential authenticator as grant writes, not Next's older
    // cookies() request-store resolver. Direct-handler + REAL PostgreSQL
    // validation is therefore possible; this is not a deployed HTTP server.
    const { GET: betaAccessRoute } = await import(
      '../../app/api/sovereign/writers-studio/beta-access/route'
    );
    const { POST: betaFeedbackRoute } = await import(
      '../../app/api/sovereign/writers-studio/beta-feedback/route'
    );
    const { PilotR20AuthorityUnavailable } = await import('../../lib/writersStudio/pilotR20Authority');

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
    proof('duplicate/concurrent requests consume exactly one irreversible seat',
      (await direct.query('SELECT issued_seats FROM writer_studio_pilot_admission_control')).rows[0]?.issued_seats === 1);
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

    const heldApproval = await approveRoute(request(
      'pilot-approval', 'founder-session', 'POST', { memberId: writerB },
    ));
    proof('enabled pilot flag alone cannot bypass real unprovisioned R20 APPROVE seal',
      heldApproval.status === 423);
    proof('HTTP R20 refusal created no unintended second writer grant',
      (await direct.query('SELECT COUNT(*)::int AS n FROM writer_studio_beta_grants')).rows[0]?.n === 1);
    proof('disposable DB-only candidate explicitly approves fictional writer B for modeling',
      await approvePilotWriter(writerB, founder));
    proof('newly approved writer B remains pending until own acceptance',
      !(await readWriterPilotApproval(writerB)).eligible);
    proof('exactly two seats have been issued, independent of current grant status',
      (await direct.query('SELECT issued_seats FROM writer_studio_pilot_admission_control')).rows[0]?.issued_seats === 2);

    proof('third independently eligible CRM candidate cannot bypass two-seat canary',
      !(await approvePilotWriter(outsider, founder)));
    const thirdRoute = await approveRoute(request(
      'pilot-approval', 'founder-session', 'POST', { memberId: outsider },
    ));
    proof('HTTP R20 seal refuses even a founder attempt at third seat',
      thirdRoute.status === 423);
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
    proof('HTTP R20 seal refuses outside writer acceptance',
      wrongWriterAccept.status === 423 && !(await readWriterPilotApproval(outsider)).eligible);
    proof('unapproved fictional account has no pending DB grant',
      !(await acceptPilotWriter(outsider)));

    const heldAcceptA = await acceptRoute(request('pilot-accept', 'writer-a-session'));
    const heldAcceptB = await acceptRoute(request('pilot-accept', 'writer-b-session'));
    proof('even individually founder-approved writers cannot accept without sealed R20',
      heldAcceptA.status === 423 && heldAcceptB.status === 423);
    proof('fictional DB-only model can test writer A acceptance',
      await acceptPilotWriter(writerA));
    proof('fictional DB-only model can test writer B acceptance',
      await acceptPilotWriter(writerB));
    proof('both founder-approved and accepted writers have DB-level Pro candidature',
      (await readWriterPilotApproval(writerA)).basis === 'founder_approved_beta'
      && (await readWriterPilotApproval(writerB)).basis === 'founder_approved_beta');

    // R7: all beta presentation and feedback must consume the SAME accepted
    // founder+external R20 authorization, not merely an active CRM contact.
    proof('CRM-only outsider is no longer eligible for beta UI',
      !(await writersStudioBetaAccess(outsider)).eligible);
    proof('strictly selected founder can witness the beta without a tester CRM label',
      (await writersStudioBetaAccess(founder)).basis === 'founder_witness');
    let betaR20Held = false;
    try { await writersStudioBetaAccess(writerA); }
    catch { betaR20Held = true; }
    proof('approved and accepted writer cannot bypass absent R20 through beta-access resolver',
      betaR20Held);

    // Direct Next handler execution on real PostgreSQL confirms the new
    // request-local dual-session resolver. Production-build HTTP remains a
    // separate Class A/browser acceptance (these are not deployed URLs).
    const betaGet = (token: string) => new NextRequest(
      'https://beta.soullab.test/api/sovereign/writers-studio/beta-access',
      { headers: { 'x-session-token': token } },
    );
    const outsiderView = await betaAccessRoute(betaGet('outsider-session'));
    proof('R7 beta-access refuses a CRM-only account without R20',
      outsiderView.status === 200 && (await outsiderView.json()).eligible === false);
    const founderView = await betaAccessRoute(betaGet('founder-session'));
    proof('R7 beta-access recognizes only the selected founder witness',
      founderView.status === 200
      && (await founderView.json()).basis === 'founder_witness');
    const approvedView = await betaAccessRoute(betaGet('writer-a-session'));
    proof('R7 beta-access fails closed for accepted DB grant with missing R20 authority',
      approvedView.status === 503);
    const conflict = betaGet('writer-a-session');
    conflict.cookies.set('maia_session', 'outsider-session');
    const conflictView = await betaAccessRoute(conflict);
    proof('R7 beta-access rejects conflicting valid A/B cookie + header sessions',
      conflictView.status === 401);
    const expiredPair = betaGet('writer-a-session');
    expiredPair.cookies.set('maia_session', 'expired-session');
    proof('R7 beta-access refuses stale cookie paired with an otherwise valid header',
      (await betaAccessRoute(expiredPair)).status === 401);

    const outsiderFeedback = await betaFeedbackRoute(request(
      'beta-feedback', 'outsider-session', 'POST',
      { signal: 'felt_like_my_voice', orientationContext: {} },
    ));
    proof('R7 feedback route refuses CRM-only outsider without inserting member words',
      outsiderFeedback.status === 403);
    const approvedFeedback = await betaFeedbackRoute(request(
      'beta-feedback', 'writer-a-session', 'POST',
      { signal: 'felt_like_my_voice', orientationContext: {} },
    ));
    proof('R7 feedback route cannot insert writer narrative when R20 is unavailable',
      approvedFeedback.status === 503);
    const foreignFeedback = await betaFeedbackRoute(request(
      'beta-feedback', 'writer-a-session', 'POST',
      { signal: 'felt_like_my_voice', orientationContext: {} }, 'https://foreign.test',
    ));
    proof('R7 feedback rejects foreign Origin before attempting author access',
      foreignFeedback.status === 403);

    const admittedA = await direct.query<{ grant_id: string }>(
      'SELECT grant_id::text FROM writer_studio_beta_grants WHERE member_id=$1',
      [writerA],
    );
    const historicalGrantId = admittedA.rows[0]?.grant_id;
    proof('accepted writer has a stable grant generation identifier',
      typeof historicalGrantId === 'string' && historicalGrantId.length === 36);

    let proHeldByR20 = false;
    try { await writerStudioPlanForMember(writerA); }
    catch (error) { proHeldByR20 = error instanceof PilotR20AuthorityUnavailable; }
    proof('unprovisioned independent R20 authority refuses operational Pro despite DB acceptance',
      proHeldByR20);

    if (outsideR20) {
      dockerFictional('pg_dump', '-U', 'postgres', '-Fc', '-f',
        '/tmp/ws_r20_pre_revocation_r3.dump', 'postgres');
      proof('full fictional PostgreSQL pre-revocation backup captured', true);
    }
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
    proof('HTTP R20 seal refuses unsealed local founder revocation', revokeResponse.status === 423);
    proof('disposable DB-only model explicitly revokes fictional writer A',
      await revokePilotWriter(writerA, founder));
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

    if (outsideR20) {
      await outsideR20.query(
        'INSERT INTO fictional_r20_revoked_grants (grant_id) VALUES ($1)',
        [historicalGrantId],
      );
      dockerFictional('createdb', '-U', 'postgres', 'ws_r20_preimage_r3');
      dockerFictional('pg_restore', '-U', 'postgres', '-d', 'ws_r20_preimage_r3',
        '--no-owner', '/tmp/ws_r20_pre_revocation_r3.dump');
      const restoredUrl = url!.replace(/\/postgres$/, '/ws_r20_preimage_r3');
      const restored = new Client({ connectionString: restoredUrl });
      await restored.connect();
      try {
        const old = await restored.query<{ grant_state: string; grant_id: string; revoked_at: Date | null }>(
          'SELECT grant_state, grant_id::text, revoked_at FROM writer_studio_beta_grants WHERE member_id=$1',
          [writerA],
        );
        proof('actual old PostgreSQL backup restore resurrects a DB-accepted grant',
          old.rows[0]?.grant_state === 'accepted'
            && old.rows[0]?.grant_id === historicalGrantId
            && old.rows[0]?.revoked_at === null);
        const outside = await outsideR20.query<{ grant_id: string }>(
          'SELECT grant_id::text FROM fictional_r20_revoked_grants WHERE grant_id=$1',
          [historicalGrantId],
        );
        proof('second independent database still holds revocation after primary restore',
          outside.rows[0]?.grant_id === historicalGrantId);
        proof('external-grant-ID tombstone would refuse stale restored Pro state',
          old.rows[0]?.grant_state === 'accepted'
          && outside.rows[0]?.grant_id === old.rows[0]?.grant_id);
      } finally {
        await restored.end();
      }
    }

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

    // Ordinary member-account erasure can cascade-delete the member-linked
    // approval row. It must NEVER silently refill the initial pilot cohort.
    await direct.query('DELETE FROM writer_studio_beta_grants WHERE member_id=$1', [writerA]);
    const remaining = await direct.query(
      'SELECT issued_seats FROM writer_studio_pilot_admission_control',
    );
    proof('deleting a revoked grant row cannot return an issued pilot seat',
      remaining.rows[0]?.issued_seats === 2);
    proof('service still refuses a third writer after revoked-row cleanup',
      !(await approvePilotWriter(outsider, founder)));
    let rawReissueDenied = false;
    try {
      await direct.query(
        'INSERT INTO writer_studio_beta_grants (member_id, approved_by) VALUES ($1,$2)',
        [outsider, founder],
      );
    } catch { rawReissueDenied = true; }
    proof('database also refuses third writer after revoked-row cleanup',
      rawReissueDenied);

    await closePool();
    process.stdout.write('RESULT: ' + checks + '/' + checks + ' isolated PostgreSQL/handler checks PASS\n');
  } finally {
    await direct.end();
    if (outsideR20) await outsideR20.end();
  }
}

main().catch((error) => {
  process.stderr.write('R2 isolated witness FAILED (' + (error as Error).name + ')\n');
  process.exitCode = 1;
});
