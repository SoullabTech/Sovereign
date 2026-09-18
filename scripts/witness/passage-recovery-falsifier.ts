/** Disposable PostgreSQL witness: recovery custody, concurrency, and rollback. */
import { randomUUID } from 'node:crypto';
import { query, closePool } from '@/lib/db/postgres';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';
import { executeAuthorization } from '@/lib/manuscript/revisionAuthorization/execute';
import { undoApplication } from '@/lib/manuscript/editorialRuntime/recovery';
import assert from 'node:assert/strict';
async function main() {
  const db = (await query<{ name: string }>('SELECT current_database() name')).rows[0].name;
  assert.equal(db, 'ws_conversation_witness_20260918_02');
  const fixture = (await query<any>(`SELECT a.member_id, a.proposal_chain_id, a.proposal_version_id,
      a.target_section_id, a.draft_id
    FROM manuscript_revision_authorizations a JOIN member_manuscripts m ON m.id = a.work_id
    JOIN manuscript_application_recovery r ON r.authorization_id = a.id
    WHERE m.title = 'Synthetic passage conversation' AND r.undone_at IS NOT NULL
    ORDER BY a.authorized_at DESC LIMIT 1`)).rows[0];
  assert.ok(fixture);
  const apply = async () => {
    const a = await authorizeVersion(fixture.member_id, fixture.proposal_chain_id, fixture.proposal_version_id);
    assert.equal(a.ok, true); if (!a.ok) throw Error(a.reason);
    const e = await executeAuthorization(fixture.member_id, a.authorization.id);
    assert.equal(e.outcome, 'executed'); return a.authorization.id;
  };
  const receipt = await apply();
  const foreign = await undoApplication(randomUUID(), receipt);
  assert.deepEqual(foreign, { kind: 'refused', reason: 'unknown_application' });
  console.log('PASS foreign identity cannot recover an application');
  const outcomes = await Promise.all([undoApplication(fixture.member_id, receipt), undoApplication(fixture.member_id, receipt)]);
  assert.equal(outcomes.filter(o => o.kind === 'undone').length, 1);
  assert.equal(outcomes.filter(o => o.kind === 'refused' && o.reason === 'already_undone').length, 1);
  console.log('PASS simultaneous undo executes exactly once');
  const failureReceipt = await apply();
  const before = (await query<any>('SELECT version, content FROM manuscript_working_drafts WHERE id = $1', [fixture.draft_id])).rows[0];
  // A deliberately failing receipt write must roll back the section writer too.
  await query(`CREATE FUNCTION ws_witness_refuse_receipt() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'synthetic receipt failure'; END; $$`);
  await query(`CREATE TRIGGER ws_witness_refuse_receipt BEFORE UPDATE ON manuscript_application_recovery
    FOR EACH ROW EXECUTE FUNCTION ws_witness_refuse_receipt()`);
  try { await assert.rejects(undoApplication(fixture.member_id, failureReceipt)); }
  finally {
    await query('DROP TRIGGER ws_witness_refuse_receipt ON manuscript_application_recovery');
    await query('DROP FUNCTION ws_witness_refuse_receipt()');
  }
  const after = (await query<any>('SELECT version, content FROM manuscript_working_drafts WHERE id = $1', [fixture.draft_id])).rows[0];
  assert.deepEqual(after, before);
  console.log('PASS receipt failure rolls back manuscript and version');
  await assert.rejects(query('UPDATE manuscript_application_recovery SET before_body = $2 WHERE authorization_id = $1', [failureReceipt, 'tampered']));
  console.log('PASS snapshot mutation rejected by database');
  assert.equal((await undoApplication(fixture.member_id, failureReceipt)).kind, 'undone');
  console.log('PASS legitimate undo remains available after failed transaction');
  await closePool();
}
main().catch(async e => { console.error(e.message); await closePool(); process.exitCode = 1; });
