import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { createExperienceStore } from '../../../lib/constellation/experience/store';
import { EXPERIENCE_POLICY } from '../../../lib/constellation/experience/contract';

async function main() {
  const socket = realpathSync(process.env.CONSTELLATION_WITNESS_SOCKET ?? '/not-configured');
  if (!/^\/private\/tmp\/sl-c7b2-[A-Za-z0-9]+$/.test(socket) ||
      readFileSync(path.join(socket, 'witness.marker'), 'utf8') !== 'C7B2 DISPOSABLE ONLY\n') {
    throw new Error('Refused: disposable witness socket and marker required');
  }
  const pool = new Pool({ host: socket, port: 56541, database: 'constellation_witness',
    user: 'constellation_witness', max: 8, connectionTimeoutMillis: 2000 });
  const checks: { name: string; result: 'PASS' }[] = [];
  const pass = (name: string) => checks.push({ name, result: 'PASS' });
  const body = { policy: EXPERIENCE_POLICY, agreement: 'submit_this_report_once', activity: 'considered_revision', usefulness: 'partly' };
  try {
    const directory = (await pool.query('SHOW data_directory')).rows[0].data_directory;
    assert.equal(realpathSync(directory), realpathSync(path.join(socket, 'db')));
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = $1', ['public'])).rows[0].n, 0);
    await pool.query('CREATE TABLE members(id uuid PRIMARY KEY)'); // Synthetic identity shape, not user data.
    await pool.query(readFileSync(path.join(process.cwd(), 'lib/constellation/experience/schema.candidate.sql'), 'utf8'));
    const members = Array.from({length: 8}, () => randomUUID());
    for (const id of members) await pool.query('INSERT INTO members VALUES ($1)', [id]);
    const store = createExperienceStore(pool);
    pass('fresh disposable database verified; candidate schema applied only there');

    const opportunity = await store.issue(members[0]);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM constellation_experience_reports')).rows[0].n, 0);
    pass('an opportunity does not fabricate a report or consent');
    assert.deepEqual(await store.submit(members[1], opportunity.id, body), { state: 'refused', reason: 'not_available' });
    pass('foreign member cannot spend opportunity');
    // Force both real connections to reach the atomic claim before releasing the row.
    const blocker = await pool.connect();
    await blocker.query('BEGIN');
    await blocker.query('SELECT id FROM constellation_experience_opportunities WHERE id=$1 FOR UPDATE',[opportunity.id]);
    const pending = Promise.all([store.submit(members[0], opportunity.id, body), store.submit(members[0], opportunity.id, body)]);
    let waiting = 0;
    try {
      for(let attempt=0; attempt<40; attempt++) {
        const locks=await pool.query("SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'UPDATE constellation_experience_opportunities%'");
        waiting=locks.rows[0].n;
        if(waiting===2)break;
        await new Promise(resolve=>setTimeout(resolve,20));
      }
    } finally {await blocker.query('ROLLBACK');blocker.release();}
    const concurrent = await pending;
    assert.equal(waiting,2,'Both competing updates must be witnessed waiting on the same claim boundary');
    assert.deepEqual(concurrent.map(r => r.state).sort(), ['recorded', 'recovered']);
    const held = await store.read(members[0], opportunity.id);
    assert.ok(held);
    assert.equal(Date.parse(held.expiresAt) - Date.parse(held.submittedAt), 30 * 86400000);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM constellation_experience_reports')).rows[0].n, 1);
    pass('two independently blocked claim updates resolve to one report and one recovery');
    pass('database supplies exactly thirty-day retention, not client time');
    const retry = await store.submit(members[0], opportunity.id, body);
    assert.equal(retry.state, 'recovered');
    if (retry.state === 'refused') throw new Error('Missing retry receipt');
    assert.equal(retry.report.expiresAt, held.expiresAt);
    pass('retry recovers the same identity and never extends retention');
    assert.deepEqual(await store.submit(members[0], opportunity.id, {...body, usefulness: 'helped'}), { state: 'refused', reason: 'different_report' });
    pass('changed-payload retry cannot rewrite a report');
    assert.equal(await store.read(members[1], opportunity.id), null);
    assert.deepEqual(await store.withdraw(members[1], opportunity.id), { state: 'not_held' });
    assert.ok(await store.read(members[0], opportunity.id));
    pass('foreign read and withdrawal disclose nothing and leave own report intact');

    const second = await store.issue(members[0]);
    assert.deepEqual(await store.submit(members[0], second.id, body), { state: 'refused', reason: 'report_already_held' });
    assert.equal((await pool.query('SELECT consumed_at FROM constellation_experience_opportunities WHERE id=$1',[second.id])).rows[0].consumed_at, null);
    pass('a second opportunity cannot duplicate a held report; its failed claim rolls back');
    await assert.rejects(pool.query("UPDATE constellation_experience_reports SET expires_at = expires_at + interval '1 minute' WHERE id=$1", [opportunity.id]));
    pass('database rejects report updates, including retention renewal');
    assert.deepEqual(await store.withdraw(members[0], opportunity.id), { state: 'removed' });
    assert.equal(await store.read(members[0], opportunity.id), null);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM constellation_experience_reports WHERE id=$1',[opportunity.id])).rows[0].n, 0);
    assert.deepEqual(await store.submit(members[0], opportunity.id, body), { state: 'refused', reason: 'not_available' });
    pass('withdrawal removes active-table content and consumed-opportunity replay cannot resurrect it');
    await pool.query('DELETE FROM constellation_experience_opportunities WHERE id=$1',[opportunity.id]);
    assert.deepEqual(await store.submit(members[0], opportunity.id, body), { state: 'refused', reason: 'not_available' });
    pass('withdrawn report also stays absent once its opportunity is no longer held');

    const activeOpportunity = await store.issue(members[1]);
    assert.equal((await store.submit(members[1], activeOpportunity.id, {...body, invitation:{id:'wisdom-carrier',confirmed:true}})).state,'recorded');
    const expiredReport = randomUUID();
    await pool.query(`INSERT INTO constellation_experience_reports(id,member_id,policy,agreement,activity,usefulness,submitted_at,expires_at)
      VALUES ($1,$2,$3,$4,$5,$6,statement_timestamp()-interval '744 hours',statement_timestamp()-interval '24 hours')`,
      [expiredReport,members[2],EXPERIENCE_POLICY,body.agreement,body.activity,body.usefulness]);
    assert.equal(await store.read(members[2],expiredReport),null);
    pass('expired report is excluded even before cleanup runs');
    const expiredOpportunity=randomUUID();
    await pool.query(`INSERT INTO constellation_experience_opportunities(id,member_id,policy,issued_at,expires_at)
      VALUES ($1,$2,$3,statement_timestamp()-interval '16 minutes',statement_timestamp()-interval '1 minute')`,[expiredOpportunity,members[3],EXPERIENCE_POLICY]);
    assert.deepEqual(await store.submit(members[3],expiredOpportunity,body),{state:'refused',reason:'not_available'});
    pass('expired opportunity cannot authorize a report');
    const cleanup=await store.purgeExpired();
    assert.equal(cleanup.reportsRemoved,1);assert.equal(cleanup.opportunitiesRemoved,1);
    assert.ok(await store.read(members[1],activeOpportunity.id));
    pass('cleanup removes only expired active-table rows');

    const faultOpportunity=await store.issue(members[4]);
    await pool.query(`CREATE FUNCTION witness_insert_fault() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'witness-only fault'; END; $$;
      CREATE TRIGGER witness_insert_fault BEFORE INSERT ON constellation_experience_reports FOR EACH ROW EXECUTE FUNCTION witness_insert_fault();`);
    await assert.rejects(store.submit(members[4],faultOpportunity.id,body));
    assert.equal((await pool.query('SELECT consumed_at FROM constellation_experience_opportunities WHERE id=$1',[faultOpportunity.id])).rows[0].consumed_at,null);
    await pool.query('DROP TRIGGER witness_insert_fault ON constellation_experience_reports; DROP FUNCTION witness_insert_fault();');
    assert.equal((await store.submit(members[4],faultOpportunity.id,body)).state,'recorded');
    pass('failure between claim and insertion rolls both back; later deliberate retry works');
    await pool.query('DELETE FROM members WHERE id=$1',[members[4]]);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM constellation_experience_reports WHERE id=$1',[faultOpportunity.id])).rows[0].n,0);
    pass('member deletion cascades to candidate reports and opportunities');

    const raceOne=await store.issue(members[5]);const raceTwo=await store.issue(members[5]);
    const race=await Promise.all([store.submit(members[5],raceOne.id,body),store.submit(members[5],raceTwo.id,body)]);
    assert.deepEqual(race.map(r=>r.state).sort(),['recorded','refused']);
    pass('distinct concurrent opportunities cannot duplicate one active member-policy report');
    const own=await store.read(members[1],activeOpportunity.id);
    assert.equal(own?.invitation,'wisdom-carrier');
    assert.ok(!Object.keys(own!).some(k=>['memberId','note','conversation','manuscript'].includes(k)));
    pass('receipt is categorical and owner-scoped; it carries no private work');
    console.log(JSON.stringify({ standing:'DISPOSABLE POSTGRESQL WITNESS ONLY; not production, backup erasure, scheduled cleanup, or member use', checks },null,2));
  } finally { await pool.end(); }
}
main().catch(error=>{ console.error('C7B2 witness failed:', error instanceof Error ? error.message : 'unknown failure'); process.exitCode=1; });
