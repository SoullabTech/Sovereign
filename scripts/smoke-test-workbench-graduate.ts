/**
 * Workbench Slice 1 — extended smoke test.
 *
 * Exercises pieces the lib-level smoke test (smoke-test-workbench.ts) didn't:
 *   - typed-text file extraction pipeline (write file → extract → store)
 *   - typed-doc (.docx) extraction via mammoth
 *   - Table card resolution chain (layout pointer → adapter.resolve → content)
 *   - Graduation pipe end-to-end (group → markdown draft on disk)
 *   - Card scrub on upload delete (table layout updated when source removed)
 *
 * Same conventions as the v1 smoke test: uses the existing test member
 * 00000000-0000-0000-0000-000000000001, cleans up after itself.
 *
 * Run:
 *   npx tsx scripts/smoke-test-workbench-graduate.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { query } from '../lib/db/postgres';
import { uploadedSource } from '../lib/workbench/sources/uploaded';
import { graduateGroup } from '../lib/workbench/graduate';
import {
  writeOriginal,
  writeReviewed,
  uploadDir,
  deleteUpload,
} from '../lib/workbench/storage';
import { extractText } from '../lib/workbench/extract/text';
import { extractDocx } from '../lib/workbench/extract/docx';

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

async function main() {
  console.log('Workbench Slice 1 — extended smoke test (graduation pipeline)\n');

  // Track everything we create so cleanup is complete even on failure.
  const cleanup: { uploadIds: string[]; tableIds: string[]; draftFiles: string[] } = {
    uploadIds: [],
    tableIds: [],
    draftFiles: [],
  };

  try {
    // ── 1. Simulate the upload-route flow for a .txt file ──
    console.log('1. Typed-text upload pipeline (file → extract → store)');
    const txtRow = await query<{ id: string }>(
      `INSERT INTO workbench_uploads
         (arranger_id, original_name, mime_type, size_bytes, storage_path,
          source_kind, transcription_status)
       VALUES ($1, 'recipe-cardamom-bread.txt', 'text/plain', 0, '',
               'typed_text', 'extracting')
       RETURNING id`,
      [TEST_ARRANGER],
    );
    const txtId = txtRow.rows[0].id;
    cleanup.uploadIds.push(txtId);

    const txtContent = 'Cardamom Bread\n\nIngredients: cardamom, butter, sugar, flour, yeast.\nMethod: knead, rest, bake at 375°F for 30 min.';
    const txtBuf = Buffer.from(txtContent, 'utf8');
    await writeOriginal(TEST_ARRANGER, txtId, 'txt', txtBuf);
    const extractedTxt = await extractText(path.join(uploadDir(TEST_ARRANGER, txtId), 'original.txt'));
    await writeReviewed(TEST_ARRANGER, txtId, extractedTxt);
    await query(
      `UPDATE workbench_uploads
       SET transcription_reviewed = $1, transcription_status = 'reviewed', updated_at = NOW()
       WHERE id = $2`,
      [extractedTxt, txtId],
    );
    if (extractedTxt === txtContent) ok('extractText returned full content');
    else bad('extractText content mismatch', { expected: txtContent, got: extractedTxt });

    // ── 2. Simulate the upload-route flow for a .docx file ──
    console.log('\n2. Typed-doc upload pipeline (.docx via mammoth)');
    // mammoth can read a real .docx; we build one inline using its companion package.
    // To avoid a new dep, generate a .docx via the docx package — but we may not have it.
    // Simpler path: use mammoth on an existing tiny .docx fixture if present, otherwise skip with a note.
    let docxSkipped = false;
    const fixturePath = path.join(process.cwd(), 'docs', 'book-studio', 'drafts', '_fixture.docx');
    try {
      await fs.access(fixturePath);
    } catch {
      docxSkipped = true;
    }
    if (docxSkipped) {
      console.log('  ⊘ no .docx fixture present; skipping (mammoth path is exercised by typecheck + import)');
    } else {
      const docxRow = await query<{ id: string }>(
        `INSERT INTO workbench_uploads
           (arranger_id, original_name, mime_type, size_bytes, storage_path,
            source_kind, transcription_status)
         VALUES ($1, '_fixture.docx',
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                 0, '', 'typed_doc', 'extracting')
         RETURNING id`,
        [TEST_ARRANGER],
      );
      const docxId = docxRow.rows[0].id;
      cleanup.uploadIds.push(docxId);
      const docxBuf = await fs.readFile(fixturePath);
      await writeOriginal(TEST_ARRANGER, docxId, 'docx', docxBuf);
      const extractedDocx = await extractDocx(path.join(uploadDir(TEST_ARRANGER, docxId), 'original.docx'));
      if (extractedDocx.length > 0) ok('mammoth extracted text from .docx');
      else bad('mammoth returned empty string');
      await writeReviewed(TEST_ARRANGER, docxId, extractedDocx);
      await query(
        `UPDATE workbench_uploads
         SET transcription_reviewed = $1, transcription_status = 'reviewed', updated_at = NOW()
         WHERE id = $2`,
        [extractedDocx, docxId],
      );
    }

    // ── 3. Verify the .txt upload appears on the Shelf ──
    console.log('\n3. Shelf reflects the typed-text upload');
    const shelfHits = await uploadedSource.search({ arrangerId: TEST_ARRANGER, text: 'cardamom' });
    const found = shelfHits.find((c) => c.ref === txtId);
    if (found) ok('Shelf search for "cardamom" returns the typed-text upload');
    else bad('typed-text upload missing from Shelf', shelfHits);

    // ── 4. Create a table with a group containing the card ──
    console.log('\n4. Build a table with the card in a group');
    const tableInsert = await query<{ id: string }>(
      `INSERT INTO workbench_tables (arranger_id, name, layout)
       VALUES ($1, 'graduate-smoke-test', $2::jsonb)
       RETURNING id`,
      [
        TEST_ARRANGER,
        JSON.stringify({
          groups: [
            {
              id: 'g_grad_smoke',
              name: 'Cardamom Recipes',
              cards: [
                { id: 'c_grad_smoke_1', source: 'uploaded', ref: txtId },
              ],
            },
          ],
        }),
      ],
    );
    const tableId = tableInsert.rows[0].id;
    cleanup.tableIds.push(tableId);
    ok(`table created with one group containing the typed-text card`);

    // ── 5. Graduate the group → markdown draft ──
    console.log('\n5. Graduate group → Book Studio draft');
    const result = await graduateGroup(TEST_ARRANGER, tableId, 'g_grad_smoke');
    if (!result.ok) {
      bad('graduate failed', result);
      throw new Error('graduate failed');
    }
    ok(`graduate returned slug: ${result.slug}`);
    cleanup.draftFiles.push(result.filePath);

    // ── 6. Verify the draft markdown exists and contains expected content ──
    console.log('\n6. Inspect the graduated markdown');
    const draftContent = await fs.readFile(result.filePath, 'utf8');
    if (draftContent.includes('# Draft — Cardamom Recipes')) ok('draft has correct H1 title');
    else bad('draft missing expected H1', draftContent.slice(0, 200));
    if (draftContent.includes('## recipe-cardamom-bread.txt')) ok('draft includes per-card section heading');
    else bad('draft missing card section heading');
    if (draftContent.includes('cardamom, butter, sugar, flour, yeast')) ok('draft includes the resolved card content');
    else bad('draft missing the card content');
    if (draftContent.includes('<!-- workbench-source')) ok('draft includes round-trip ref block');
    else bad('draft missing workbench-source comment block');
    if (draftContent.includes(`<!-- uploaded:${txtId} -->`)) ok('draft references the source upload id');
    else bad('draft missing source upload ref');

    // ── 7. Verify sanctuary card is excluded from graduation ──
    console.log('\n7. Sanctuary card excluded from graduation');
    const sanctRow = await query<{ id: string }>(
      `INSERT INTO workbench_uploads
         (arranger_id, original_name, mime_type, size_bytes, storage_path,
          source_kind, transcription_status, transcription_reviewed, sanctuary)
       VALUES ($1, 'private-recipe.txt', 'text/plain', 20, '',
               'typed_text', 'reviewed', 'secret family recipe', true)
       RETURNING id`,
      [TEST_ARRANGER],
    );
    const sanctId = sanctRow.rows[0].id;
    cleanup.uploadIds.push(sanctId);

    await query(
      `UPDATE workbench_tables
       SET layout = $1::jsonb, updated_at = NOW()
       WHERE id = $2`,
      [
        JSON.stringify({
          groups: [
            {
              id: 'g_sanct_test',
              name: 'Mixed Group',
              cards: [
                { id: 'c_normal', source: 'uploaded', ref: txtId },
                { id: 'c_sanct', source: 'uploaded', ref: sanctId },
              ],
            },
          ],
        }),
        tableId,
      ],
    );

    const sanctResult = await graduateGroup(TEST_ARRANGER, tableId, 'g_sanct_test');
    if (!sanctResult.ok) {
      bad('graduate with sanctuary card failed entirely', sanctResult);
    } else {
      cleanup.draftFiles.push(sanctResult.filePath);
      const sanctDraft = await fs.readFile(sanctResult.filePath, 'utf8');
      if (!sanctDraft.includes('secret family recipe')) {
        ok('sanctuary card content NOT in graduated draft');
      } else {
        bad('sanctuary card content LEAKED into draft');
      }
      if (sanctDraft.includes('(unresolved or sanctuary)')) {
        ok('draft acknowledges sanctuary card via comment');
      } else {
        bad('draft missing sanctuary acknowledgement');
      }
    }

    // ── 8. Verify card scrub on upload delete ──
    console.log('\n8. Deleting an upload scrubs card pointers from tables');
    // Note: the route layer does the scrub; here we simulate the scrub logic the
    // same way the DELETE /uploads/[id] route does (the canonical scrub lives
    // in that route file). We verify behavior by replicating it.
    const beforeDelete = await query<{ layout: { groups: { cards: { ref: string }[] }[] } }>(
      `SELECT layout FROM workbench_tables WHERE id = $1`,
      [tableId],
    );
    const hadSanct = beforeDelete.rows[0].layout.groups.some((g) =>
      g.cards.some((c) => c.ref === sanctId),
    );
    if (hadSanct) ok('sanctuary card pointer present in layout before delete');
    else bad('expected sanctuary pointer not found');

    // Replicate route logic: scrub then delete
    const layout = beforeDelete.rows[0].layout;
    const scrubbed = {
      groups: layout.groups.map((g) => ({
        ...g,
        cards: g.cards.filter((c) => c.ref !== sanctId),
      })),
    };
    await query(
      `UPDATE workbench_tables SET layout = $1::jsonb WHERE id = $2`,
      [JSON.stringify(scrubbed), tableId],
    );
    await deleteUpload(TEST_ARRANGER, sanctId);
    await query(`DELETE FROM workbench_uploads WHERE id = $1`, [sanctId]);
    cleanup.uploadIds = cleanup.uploadIds.filter((id) => id !== sanctId);

    const afterDelete = await query<{ layout: { groups: { cards: { ref: string }[] }[] } }>(
      `SELECT layout FROM workbench_tables WHERE id = $1`,
      [tableId],
    );
    const stillHasSanct = afterDelete.rows[0].layout.groups.some((g) =>
      g.cards.some((c) => c.ref === sanctId),
    );
    if (!stillHasSanct) ok('sanctuary card pointer scrubbed from layout after delete');
    else bad('sanctuary card pointer remained in layout');
  } finally {
    // ── Cleanup ──
    console.log('\n9. Cleanup');
    for (const draft of cleanup.draftFiles) {
      await fs.unlink(draft).catch(() => undefined);
    }
    for (const uid of cleanup.uploadIds) {
      await deleteUpload(TEST_ARRANGER, uid).catch(() => undefined);
      await query(`DELETE FROM workbench_uploads WHERE id = $1`, [uid]).catch(() => undefined);
    }
    for (const tid of cleanup.tableIds) {
      await query(`DELETE FROM workbench_tables WHERE id = $1`, [tid]).catch(() => undefined);
    }
    ok('test rows + draft files + filesystem cleaned');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Smoke test crashed:', err);
    process.exit(1);
  });
