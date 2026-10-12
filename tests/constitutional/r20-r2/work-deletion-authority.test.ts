import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordWorkDeletionAuthority } from '../../../lib/recovery/r20-r2/recordWorkDeletionAuthority';

const manuscriptId = 'f0000000-0000-4000-8000-000000000001';
const workId = 'f0000000-0000-4000-8000-000000000002';
const manifestId = 'e0000000-0000-4000-8000-000000000003';

type Captured = { sql: string; values?: readonly unknown[] };

function simulatedTransaction(failAt?: 'manifest' | 'tombstone' | 'outbox') {
  const captured: Captured[] = [];
  const tx = {
    async query(sql: string, values?: readonly unknown[]) {
      captured.push({ sql, values });
      if (sql.includes('pg_advisory_xact_lock')) {
        return { rows: [{ pg_advisory_xact_lock: null }] };
      }
      if (sql.includes('INSERT INTO deletion_manifests')) {
        if (failAt === 'manifest') throw new Error('Synthetic manifest failure');
        return { rows: [{ id: manifestId }] };
      }
      if (sql.includes('INSERT INTO provenance_tombstones')) {
        if (failAt === 'tombstone') throw new Error('Synthetic tombstone failure');
        return { rows: [{ object_id: values?.[2] }] };
      }
      if (sql.includes('INSERT INTO r20_deletion_authority_outbox')) {
        if (failAt === 'outbox') throw new Error('Synthetic outbox failure');
        return { rows: [{ sequence_id: '42' }] };
      }
      throw new Error('Unexpected SQL in synthetic transaction');
    },
  };
  return { tx: tx as any, captured };
}

test('member Work deletion mints manifest + both parent tombstones + outbox in one transaction', async () => {
  const { tx, captured } = simulatedTransaction();
  const result = await recordWorkDeletionAuthority(tx, manuscriptId, workId);
  assert.deepEqual(result, { manifestId, outboxSequence: '42' });
  assert.equal(captured.length, 5);
  assert.match(captured[0].sql, /pg_advisory_xact_lock/);
  assert.match(captured[1].sql, /INSERT INTO deletion_manifests/);
  assert.deepEqual(captured[2].values, [manifestId, 'member_manuscripts', manuscriptId]);
  assert.deepEqual(captured[3].values, [manifestId, 'living_works', workId]);
  assert.deepEqual(captured[4].values, [manifestId]);
  assert.doesNotMatch(JSON.stringify(captured), /source_text|source_bytes|artifact_ref|original_filename/i);
});

test('a manuscript referenced by a surviving Work does not tombstone that Work', async () => {
  const { tx, captured } = simulatedTransaction();
  await recordWorkDeletionAuthority(tx, manuscriptId);
  const tombstones = captured.filter(({ sql }) => sql.includes('INSERT INTO provenance_tombstones'));
  assert.equal(tombstones.length, 1);
  assert.deepEqual(tombstones[0].values, [manifestId, 'member_manuscripts', manuscriptId]);
});

for (const stage of ['manifest', 'tombstone', 'outbox'] as const) {
  test(stage + ' failure refuses deletion transaction', async () => {
    const { tx, captured } = simulatedTransaction(stage);
    await assert.rejects(() => recordWorkDeletionAuthority(tx, manuscriptId, workId));
    assert.ok(captured.some(({ sql }) => sql.includes('pg_advisory_xact_lock')));
    assert.ok(!captured.some(({ sql }) => /SELECT.*source_text/i.test(sql)));
  });
}

test('refuse malformed object identifiers before any SQL', async () => {
  const { tx, captured } = simulatedTransaction();
  await assert.rejects(() => recordWorkDeletionAuthority(tx, 'untrusted-filepath/../'));
  assert.equal(captured.length, 0);
});

test('production erasure path calls authority writer after successful deletion within transaction', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const source = readFileSync(resolve(process.cwd(), 'lib/manuscript/source/eraseManuscript.ts'), 'utf8');
  const txStart = source.indexOf('const result = await transaction(async (tx)');
  const deleted = source.indexOf('DELETE FROM member_manuscripts', txStart);
  const authority = source.indexOf('await recordWorkDeletionAuthority(tx, manuscriptId, deletedWorkId)', deleted);
  const txEnd = source.indexOf('  });', authority);
  assert.ok(txStart >= 0 && deleted > txStart && authority > deleted && txEnd > authority);
});
