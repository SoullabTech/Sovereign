/**
 * PT-3 — Source Custody falsifier. Behavioral half (P1–P5, P9, P10).
 *
 * Founder ruling 2026-09-08 authorizing Step 4. The law:
 *
 *   No content-working act performed in Writer's Studio may modify the
 *   historical Source from which a Working Draft was created. Explicit
 *   member-directed Source lifecycle acts are separately governed and must
 *   never be disguised as editing.
 *
 * The purpose is prospective: make it difficult for the Studio to BECOME capable
 * of violating Source custody without visibly breaking the law. The static half
 * (P6–P8, P11) lives in `lib/manuscript/source/__tests__/pt3SourceCustody.test.ts`
 * and carries most of that weight; this half proves the Studio does not violate
 * it today, and that the lifecycle act still works.
 *
 *   DATABASE_URL=... FILE_STORAGE_PATH=... PT3_WITNESS_CONFIRM=1 \
 *     npx tsx scripts/witness/pt3-source-custody-witness.ts
 *
 * WRITES TO THE DATABASE AND THE VAULT. Disposable fixture member, removed at
 * the end, guarded behind an explicit confirmation.
 */
import { randomUUID } from 'crypto';
import { query } from '@/lib/db/postgres';
import { recordArtifactArrival, claimArrival } from '@/lib/manuscript/source/arrivals';
import { witnessSource, witnessIsLive, type SourceWitness } from '@/lib/manuscript/source/sourceWitness';
import { writeVaultBytes, readVaultBytes } from '@/lib/storage/fileVault';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import { saveSection } from '@/lib/manuscript/sections/saveSection';

if (!process.env.PT3_WITNESS_CONFIRM) {
  console.error('Refusing to run without PT3_WITNESS_CONFIRM=1 (this writes to the database).');
  process.exit(2);
}

let failures = 0;
let skips = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures += 1;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? `  — ${detail}` : ''}`);
}
function skip(name: string, why: string) {
  /* FR-14: a SKIP never discharges an obligation. It is reported, counted, and
     it is not a pass. */
  skips += 1;
  console.log(` SKIP  ${name}  — ${why}`);
}

const TEXT = '# A Novel, 1987\n\nThe first line the writer entrusted.\nAnd a second.\n';

async function main() {
  const memberId = randomUUID();
  await query(
    `INSERT INTO members (id, passkey, username, password_hash, name)
     VALUES ($1,$2,$3,'x','PT3 fixture')`,
    [memberId, `PT3-${memberId}`, `pt3-${memberId}`],
  );

  const mk = async (title: string) => {
    const r = await query<{ id: string }>(
      `INSERT INTO member_manuscripts (id, member_id, title) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [memberId, title],
    );
    return r.rows[0].id;
  };

  /* ── A custodied manuscript, arriving through the real WS-01 path ────────── */
  const manuscriptId = await mk('PT3 custodied');
  const bytes = Buffer.from(TEXT, 'utf8');
  const arrival = await recordArtifactArrival({
    memberId, bytes, originalFilename: 'novel.md', mimeType: 'text/markdown',
    sourceText: TEXT, extractor: 'text',
  });
  await claimArrival(arrival.id, manuscriptId, memberId);

  console.log('\nPT-3 — Source Custody falsifier (behavioral half)\n');

  const before = await witnessSource(manuscriptId, memberId);
  check('P10 the witness is APPLICABLE — there is Source to protect', before.applicable);
  check('P2  the witness is LIVE before any act (bytes re-read and re-hashed)', witnessIsLive(before),
    JSON.stringify(before.arrivals.map((a) => ({
      bytes: a.bytesPresent, hash: a.bytesMatchRecordedHash, text: a.textMatchesRecordedHash, queued: a.erasureQueued,
    }))));

  /* ── P1: representative content-working acts ─────────────────────────────
     Real product writes against descendant representations, issued as the
     product issues them. Every one of these MUST be free to change; the law is
     that none of them may reach the Source. */
  const acts: { name: string; run: () => Promise<unknown> }[] = [
    {
      name: 'working draft created and written',
      run: () => query(
        `INSERT INTO manuscript_working_drafts
           (manuscript_id, member_id, content, base_source_hash, revision_count, version)
         VALUES ($1,$2,$3,$4,1,1)`,
        [manuscriptId, memberId, TEXT + '\nA revision the writer made.\n', 'x'.repeat(64)],
      ),
    },
    {
      name: 'draft revised again (a second version)',
      run: () => query(
        `UPDATE manuscript_working_drafts
            SET content = content || $3, version = version + 1, revision_count = revision_count + 1
          WHERE manuscript_id = $1 AND member_id = $2`,
        [manuscriptId, memberId, '\nAnd redeveloped further.\n'],
      ),
    },
    {
      name: 'sections written (interpretation, not Source)',
      run: () => query(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1,1,'A Novel, 1987','The first line the writer entrusted.')`,
        [manuscriptId],
      ),
    },
    {
      name: 'a keep is recorded',
      run: () => query(
        `INSERT INTO manuscript_keeps (manuscript_id, member_id, section_id, verbatim_text)
         SELECT $1, $2, s.id, 'A kept line.' FROM manuscript_sections s
          WHERE s.manuscript_id = $1 LIMIT 1`,
        [manuscriptId, memberId],
      ),
    },
    {
      name: 'saveSection() — the real section-write code path',
      run: () => saveSection(manuscriptId, memberId, randomUUID(), 'edited body', 1).catch(() => undefined),
    },
  ];

  for (const act of acts) {
    await act.run();
    const after = await witnessSource(manuscriptId, memberId);
    check(`P1  ${act.name} → Source unchanged`, after.digest === before.digest,
      after.digest === before.digest ? '' : 'DIGEST MOVED');
    check(`P2  ${act.name} → Source still LIVE`, witnessIsLive(after));
    check(`P3  ${act.name} → no erasure obligation on this Source`,
      after.arrivals.every((a) => !a.erasureQueued));
    check(`P4  ${act.name} → binding intact (manuscript_id, custody label)`,
      after.arrivals.every((a) => a.manuscriptId === manuscriptId)
        && after.custodyLabel === 'source_custodied');
  }

  /* ── P5: a later arrival is permitted; the historical one may not change ── */
  const second = await recordArtifactArrival({
    memberId, bytes: Buffer.from(TEXT + '\nA later import.\n', 'utf8'),
    originalFilename: 'novel-v2.md', mimeType: 'text/markdown',
    sourceText: TEXT + '\nA later import.\n', extractor: 'text',
  });
  const otherManuscript = await mk('PT3 second import');
  await claimArrival(second.id, otherManuscript, memberId);
  const afterSecond = await witnessSource(manuscriptId, memberId);
  check('P5  a NEW arrival elsewhere leaves the historical arrival identical',
    afterSecond.digest === before.digest);
  check('P5  and the new arrival is its own witness, not a mutation of the old',
    (await witnessSource(otherManuscript, memberId)).digest !== before.digest);

  /* ── P10 vacuity: a legacy manuscript has nothing to protect ─────────────── */
  const legacy = await mk('PT3 legacy import');
  const legacyWitness = await witnessSource(legacy, memberId);
  if (!legacyWitness.applicable) {
    skip('P10 legacy manuscript (no arrival) — SKIP, never PASS',
      `custody=${legacyWitness.custodyLabel}; a SKIP does not discharge the obligation`);
  } else {
    check('P10 vacuity guard', false, 'a manuscript with no arrival reported applicable');
  }

  /* ── The demonstrated false green (§6 of the design) ─────────────────────── */
  console.log('\n  demonstration — the row-diff false green\n');
  const target = before.arrivals[0];
  const columnsBefore = await query<any>(
    `SELECT artifact_hash, source_text_hash, source_text FROM manuscript_source_arrivals WHERE id = $1`,
    [target.id],
  );
  /* A "content-working act" that overwrites the artifact in place through the
     shared truncating writer, touching no column. Test-double only: no
     production code is modified to make this reproduce. */
  const seg = target.artifactRef!.split('/');
  const fileId = seg[1].replace(/\.[^.]+$/, '');
  const ext = seg[1].slice(seg[1].lastIndexOf('.') + 1);
  await writeVaultBytes('manuscript-sources', fileId, ext, Buffer.from('THE BOOK IS GONE', 'utf8'));
  const columnsAfter = await query<any>(
    `SELECT artifact_hash, source_text_hash, source_text FROM manuscript_source_arrivals WHERE id = $1`,
    [target.id],
  );
  check('D1 every column is untouched — a row-diff falsifier would PASS here',
    JSON.stringify(columnsBefore.rows[0]) === JSON.stringify(columnsAfter.rows[0]));
  const corrupted = await witnessSource(manuscriptId, memberId);
  check('D2 ⛔ P2 CATCHES IT — the witness is no longer live', witnessIsLive(corrupted) === false);
  check('D3 ⛔ and the digest moved, because liveness is part of the witness',
    corrupted.digest !== before.digest);
  /* Put the entrusted bytes back so P9 erases the real thing. */
  await writeVaultBytes('manuscript-sources', fileId, ext, bytes);
  check('D4 the fixture artifact is restored for the lifecycle leg',
    (await readVaultBytes(target.artifactRef!)).equals(bytes));

  /* ── P9: the member can still relinquish custody completely ──────────────── */
  console.log('\n  P9 — explicit member-directed lifecycle still relinquishes fully\n');
  const outcome = await eraseManuscript(manuscriptId, memberId);
  check('P9  erasure succeeded', outcome.ok === true, JSON.stringify(outcome));
  const rowsLeft = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM manuscript_source_arrivals WHERE manuscript_id = $1`,
    [manuscriptId],
  );
  check('P9  the custody record is gone', rowsLeft.rows[0].n === 0);
  let bytesGone = false;
  try { await readVaultBytes(target.artifactRef!); } catch { bytesGone = true; }
  check('P9  ⛔ the entrusted bytes are gone — custody that cannot be ended is capture', bytesGone);
  const owed = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM vault_erasure_queue WHERE artifact_ref = $1`,
    [target.artifactRef],
  );
  check('P9  and nothing is left owed', owed.rows[0].n === 0);

  /* ── Cleanup ── */
  await query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  const left = await query<{ n: number }>(`SELECT count(*)::int AS n FROM members WHERE id = $1`, [memberId]);
  check('CLEAN fixture removed', left.rows[0].n === 0);

  console.log(`\nPT-3 behavioral: ${failures === 0 ? 'ALL CONTROLS PASSED' : `${failures} FAILURE(S)`} · ${skips} skipped (skips discharge nothing)\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
