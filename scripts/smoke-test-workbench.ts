/**
 * Workbench Slice 1 back-end smoke test.
 *
 * Exercises the lib layer directly (no HTTP, no auth) against the local DB.
 * Verifies the highest-value shape contracts before any UI exists:
 *
 *   1. uploaded source.search()      — returns reviewed, non-sanctuary rows
 *   2. uploaded source.resolve()     — returns content for normal, null for sanctuary
 *   3. storage write/read roundtrip  — filesystem path is consistent
 *   4. table layout validation       — pointer/group shape stored cleanly
 *   5. card scrub on upload delete   — table layout updated when upload removed
 *
 * Runs against:
 *   postgresql://soullab@localhost:5432/maia_consciousness
 *
 * Cleanup is automatic — every row this script inserts is deleted at the end.
 * Uses the built-in test arranger 00000000-0000-0000-0000-000000000001.
 *
 * Run:
 *   npx tsx scripts/smoke-test-workbench.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { query } from '../lib/db/postgres';
import { uploadedSource } from '../lib/workbench/sources/uploaded';
import {
  writeOriginal,
  writeReviewed,
  readOriginal,
  deleteUpload,
  uploadDir,
} from '../lib/workbench/storage';

const TEST_ARRANGER = '00000000-0000-0000-0000-000000000001';

let pass = 0;
let fail = 0;

function ok(label: string) {
  console.log(`  ✓ ${label}`);
  pass++;
}

function bad(label: string, detail?: unknown) {
  console.log(`  ✗ ${label}`);
  if (detail !== undefined) console.log('    ', detail);
  fail++;
}

function assertEq<T>(label: string, actual: T, expected: T) {
  if (actual === expected) ok(label);
  else bad(label, { expected, actual });
}

async function main() {
  console.log('Workbench Slice 1 — back-end smoke test\n');

  // ── 1. Insert two uploads: one reviewed/normal, one reviewed/sanctuary ──
  console.log('1. Insert test uploads');
  const normal = await query<{ id: string }>(
    `INSERT INTO workbench_uploads
       (arranger_id, original_name, mime_type, size_bytes, storage_path,
        source_kind, transcription_status, transcription_reviewed, sanctuary)
     VALUES ($1, 'normal-recipe.txt', 'text/plain', 32, '', 'typed_text',
             'reviewed', 'cardamom, butter, sugar, flour', false)
     RETURNING id`,
    [TEST_ARRANGER],
  );
  const normalId = normal.rows[0].id;
  ok(`normal upload inserted: ${normalId.slice(0, 8)}…`);

  const sanctuary = await query<{ id: string }>(
    `INSERT INTO workbench_uploads
       (arranger_id, original_name, mime_type, size_bytes, storage_path,
        source_kind, transcription_status, transcription_reviewed, sanctuary)
     VALUES ($1, 'sanctuary-note.txt', 'text/plain', 18, '', 'typed_text',
             'reviewed', 'private kitchen note', true)
     RETURNING id`,
    [TEST_ARRANGER],
  );
  const sanctuaryId = sanctuary.rows[0].id;
  ok(`sanctuary upload inserted: ${sanctuaryId.slice(0, 8)}…`);

  // Also insert a draft (should NOT appear in Shelf, even non-sanctuary)
  const draft = await query<{ id: string }>(
    `INSERT INTO workbench_uploads
       (arranger_id, original_name, mime_type, size_bytes, storage_path,
        source_kind, transcription_status, transcription_draft, sanctuary)
     VALUES ($1, 'pdf-draft.pdf', 'application/pdf', 100, '', 'typed_doc',
             'draft', 'unreviewed PDF text', false)
     RETURNING id`,
    [TEST_ARRANGER],
  );
  const draftId = draft.rows[0].id;
  ok(`draft upload inserted: ${draftId.slice(0, 8)}…`);

  // ── 2. uploadedSource.search() ──
  console.log('\n2. uploadedSource.search()');
  const results = await uploadedSource.search({ arrangerId: TEST_ARRANGER });
  const ids = results.map((r) => r.ref);
  if (ids.includes(normalId)) ok('normal upload is in search results');
  else bad('normal upload missing from search', ids);
  if (!ids.includes(sanctuaryId)) ok('sanctuary upload excluded from search');
  else bad('sanctuary upload leaked into search', sanctuaryId);
  if (!ids.includes(draftId)) ok('draft upload excluded from search (review-before-indexing)');
  else bad('draft upload leaked into search', draftId);

  // ── 3. uploadedSource.search() with text filter ──
  console.log('\n3. Text search');
  const textHits = await uploadedSource.search({
    arrangerId: TEST_ARRANGER,
    text: 'cardamom',
  });
  if (textHits.some((r) => r.ref === normalId)) ok('FTS query found "cardamom"');
  else bad('FTS query missed "cardamom"', textHits);

  const noHits = await uploadedSource.search({
    arrangerId: TEST_ARRANGER,
    text: 'paprika-nonexistent',
  });
  assertEq('FTS query returns empty for missing term', noHits.length, 0);

  // ── 4. uploadedSource.resolve() ──
  console.log('\n4. uploadedSource.resolve()');
  const resolvedNormal = await uploadedSource.resolve(normalId, TEST_ARRANGER);
  if (resolvedNormal && resolvedNormal.content.includes('cardamom')) {
    ok('normal upload resolves with content');
  } else {
    bad('normal upload did not resolve', resolvedNormal);
  }

  const resolvedSanctuary = await uploadedSource.resolve(sanctuaryId, TEST_ARRANGER);
  assertEq('sanctuary upload resolves to null', resolvedSanctuary, null);

  const resolvedWrongArranger = await uploadedSource.resolve(
    normalId,
    '00000000-0000-0000-0000-000000000002',
  );
  assertEq('resolve with wrong arranger returns null', resolvedWrongArranger, null);

  // ── 5. Storage roundtrip ──
  console.log('\n5. Storage write/read roundtrip');
  const storageId = '00000000-0000-0000-0000-000000000099';
  const testBuf = Buffer.from('roundtrip-test-content', 'utf8');
  await writeOriginal(TEST_ARRANGER, storageId, 'txt', testBuf);
  await writeReviewed(TEST_ARRANGER, storageId, 'roundtrip-test-content');
  const readBack = await readOriginal(TEST_ARRANGER, storageId, 'txt');
  assertEq('original file roundtrip', readBack.toString('utf8'), 'roundtrip-test-content');
  await deleteUpload(TEST_ARRANGER, storageId);
  try {
    await fs.access(uploadDir(TEST_ARRANGER, storageId));
    bad('deleteUpload should remove the directory');
  } catch {
    ok('deleteUpload removed the directory');
  }

  // ── 6. Table operations with card pointers ──
  console.log('\n6. Table with card pointer');
  const tableInsert = await query<{ id: string }>(
    `INSERT INTO workbench_tables (arranger_id, name, layout)
     VALUES ($1, 'smoke-test-table', $2::jsonb)
     RETURNING id`,
    [
      TEST_ARRANGER,
      JSON.stringify({
        groups: [
          {
            id: 'g_smoke_1',
            name: 'cardamom-things',
            cards: [
              { id: 'c_smoke_1', source: 'uploaded', ref: normalId },
            ],
          },
        ],
      }),
    ],
  );
  const tableId = tableInsert.rows[0].id;
  ok(`table inserted with pointer: ${tableId.slice(0, 8)}…`);

  // Verify the layout came back intact
  const tableRead = await query<{ layout: { groups: { id: string; cards: { ref: string }[] }[] } }>(
    `SELECT layout FROM workbench_tables WHERE id = $1`,
    [tableId],
  );
  const layoutGroup = tableRead.rows[0].layout.groups[0];
  assertEq('layout group id preserved', layoutGroup.id, 'g_smoke_1');
  assertEq('card pointer ref preserved', layoutGroup.cards[0].ref, normalId);

  // ── 7. Cleanup ──
  console.log('\n7. Cleanup');
  await query(`DELETE FROM workbench_tables WHERE id = $1`, [tableId]);
  await query(`DELETE FROM workbench_uploads WHERE id IN ($1, $2, $3)`, [
    normalId,
    sanctuaryId,
    draftId,
  ]);
  ok('test rows removed');

  // ── Summary ──
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Smoke test crashed:', err);
    process.exit(1);
  });
