/**
 * WS-01 — P0 Source Custody witness.
 *
 * Proves, against a REAL database and a REAL file vault, that what arrived is
 * preserved independently of any interpretation and that no arriving line is
 * silently discarded. Run it after applying
 * `database/migrations/20260824000001_manuscript_source_custody.sql`:
 *
 *   DATABASE_URL=... FILE_STORAGE_PATH=... WS01_WITNESS_CONFIRM=1 \
 *     npx tsx scripts/verify-ws01-source-custody.ts
 *
 * The negative leg is the one that makes the store-the-bytes ruling load-bearing:
 * it deletes the stored artifact while leaving every database column intact and
 * requires custody verification to FAIL. A hash without recoverable bytes is not
 * custody.
 *
 * WRITES TO THE DATABASE. It creates a disposable fixture member, exercises the
 * real code paths, and deletes everything it made. It is guarded behind an
 * explicit confirmation so it cannot be run by accident against a live database.
 */
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import path from 'path';
import { query } from '@/lib/db/postgres';
import { resolveVaultRoot } from '@/lib/storage/fileVault';
import { recordArtifactArrival, recordSuppliedArrival, claimArrival, verifyCustody } from '@/lib/manuscript/source/arrivals';
import { EXTRACTORS, hashBytes } from '@/lib/manuscript/source/custody';
import { segment } from '@/lib/manuscript/ingest/segment';
import { detectOmission } from '@/lib/manuscript/source/omission';

const ok = (label: string, pass: boolean, detail = '') =>
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
let failures = 0;
const check = (l: string, p: boolean, d = '') => { if (!p) failures++; ok(l, p, d); };

async function main() {
  if (process.env.WS01_WITNESS_CONFIRM !== '1') {
    console.error(
      'Refusing to run: this witness writes a disposable fixture to the database.\n' +
      'Set WS01_WITNESS_CONFIRM=1 to confirm.',
    );
    process.exit(2);
  }
  // Disposable fixture member. Never a real member's manuscript.
  const memberId = randomUUID();
  await query(
    `INSERT INTO members (id, passkey, username, password_hash, name)
     VALUES ($1,$2,$3,'x','WS-01 fixture')`,
    [memberId, `WS01-${memberId.slice(0, 8)}`, `ws01_${memberId.slice(0, 8)}`],
  );

  // ── File-backed leg ──────────────────────────────────────────────────────
  const arrivedBytes = Buffer.from(
    'TITLE\nSUBTITLE\nAUTHOR NAME\n\nFirst real paragraph.\n',
    'utf-8',
  );
  const localSha = hashBytes(arrivedBytes);
  const sourceText = arrivedBytes.toString('utf-8');

  const arrival = await recordArtifactArrival({
    memberId,
    bytes: arrivedBytes,
    originalFilename: 'disposable-fixture.txt',
    mimeType: 'text/plain',
    sourceText,
    extractor: 'text',
  });
  check('3  arrival row exists', Boolean(arrival.id));

  const row = (await query<any>(
    `SELECT * FROM manuscript_source_arrivals WHERE id = $1`, [arrival.id],
  )).rows[0];
  check('4  source arrival persisted with artifact custody',
    row.source_kind === 'artifact_extraction' && row.artifact_ref !== null);

  // 5–6: retrieve the vault bytes and re-hash them.
  const { readVaultBytes } = await import('@/lib/storage/fileVault');
  const recovered = await readVaultBytes(row.artifact_ref);
  check('6  SHA-256(recovered) === SHA-256(arrived)', hashBytes(recovered) === localSha,
    `${hashBytes(recovered).slice(0, 12)}… vs ${localSha.slice(0, 12)}…`);
  check('6b bytes are byte-for-byte identical', recovered.equals(arrivedBytes));

  /* 7 — the source text is a witness in its own right: its own column, its own
     hash, its own extractor identity. For a PLAIN TEXT artifact the extraction is
     the identity function, so source_text_hash and artifact_hash coincide — and
     that coincidence is itself evidence, because it proves the utf-8 decode and
     re-encode round-trip byte-exactly with no normalization slipped in. The
     separation being tested is of IDENTITY, not of value. */
  const { hashText } = await import('@/lib/manuscript/source/custody');
  check('7  source-text witness stored independently, with its own hash',
    row.source_text === sourceText && row.source_text_hash === hashText(sourceText));
  check('7b for a plain-text artifact the two hashes coincide — no silent normalization',
    row.source_text_hash === row.artifact_hash);

  // 7c — where extraction is NOT the identity function the two identities diverge,
  // which is what lets a changed extraction be told apart from a changed artifact.
  const pretendDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x01, 0x02]);
  const extracted = 'Words the extractor produced.';
  const nonIdentity = await recordArtifactArrival({
    memberId, bytes: pretendDocx, originalFilename: 'fixture.docx',
    mimeType: null, sourceText: extracted, extractor: 'docx',
  });
  const nrow = (await query<any>(
    `SELECT artifact_hash, source_text_hash, extraction_method FROM manuscript_source_arrivals WHERE id = $1`,
    [nonIdentity.id])).rows[0];
  check('7c non-identity extraction → artifact and source-text hashes differ',
    nrow.artifact_hash !== nrow.source_text_hash, nrow.extraction_method);
  check('8  extractor identity and version recorded',
    row.extraction_method === EXTRACTORS.text.method &&
      row.extractor_version === EXTRACTORS.text.version,
    `${row.extraction_method} / ${row.extractor_version}`);

  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,$2) RETURNING id`,
    [memberId, 'WS-01 disposable fixture'],
  );
  const manuscriptId = ms.rows[0].id;
  check('9  manuscript claims the correct arrival',
    await claimArrival(arrival.id, manuscriptId, memberId));
  const custodyLabel = (await query<any>(
    `SELECT source_custody FROM member_manuscripts WHERE id = $1`, [manuscriptId])).rows[0].source_custody;
  check('9b manuscript labelled source_custodied', custodyLabel === 'source_custodied', custodyLabel);

  const v1 = await verifyCustody(manuscriptId, memberId);
  check('10 verifyCustody === PASS', v1.custodied === true, v1.reason);

  // ── NEGATIVE LEG: bytes removed, metadata intact ─────────────────────────
  await unlink(path.join(resolveVaultRoot(), row.artifact_ref));
  const v2 = await verifyCustody(manuscriptId, memberId);
  check('NEG  bytes deleted, DB intact → verifyCustody FAILS', v2.custodied === false, v2.reason);
  const stillThere = (await query<any>(
    `SELECT artifact_hash IS NOT NULL AS h FROM manuscript_source_arrivals WHERE id = $1`, [arrival.id])).rows[0].h;
  check('NEG  the hash is still in the database (so the refusal is not incidental)', stillThere === true);

  // ── Pasted leg ───────────────────────────────────────────────────────────
  const pasted = 'I typed this straight into the box.\n';
  const supplied = await recordSuppliedArrival({ memberId, sourceText: pasted });
  const srow = (await query<any>(
    `SELECT * FROM manuscript_source_arrivals WHERE id = $1`, [supplied.id])).rows[0];
  check('P  source_kind = member_supplied_text', srow.source_kind === 'member_supplied_text');
  check('P  artifact_ref NULL', srow.artifact_ref === null);
  check('P  artifact_hash NULL', srow.artifact_hash === null);
  check('P  artifact_size NULL', srow.artifact_size === null);
  check('P  original_filename NULL', srow.original_filename === null);
  check('P  source_text is the exact confirmed text', srow.source_text === pasted);

  const ms2 = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,$2) RETURNING id`,
    [memberId, 'WS-01 pasted fixture']);
  await claimArrival(supplied.id, ms2.rows[0].id, memberId);
  const v3 = await verifyCustody(ms2.rows[0].id, memberId);
  check('P  custody PASS for a paste', v3.custodied === true, v3.reason);

  // Structural refusal: a paste must not be able to claim an artifact.
  let refused = false;
  try {
    await query(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, artifact_ref, artifact_hash, artifact_size, original_filename,
          source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text','faked/path','deadbeef',10,'invented.pdf','x','y','z','v')`,
      [memberId]);
  } catch (e: any) {
    refused = /manuscript_source_arrivals_kind_fields/.test(e.message);
  }
  check('P  giving a paste artifact provenance FAILS structurally', refused);

  // ── Omission witness ─────────────────────────────────────────────────────
  const sections = segment(sourceText);
  const report = detectOmission(sourceText, sections);
  check('OM arrived === accounted, lossless',
    report.lossless && report.missing.length === 0,
    `arrived=${report.arrivedLineCount} accounted=${report.accountedLineCount} lossless=${report.lossless}`);
  const witnessText = (await query<any>(
    `SELECT source_text FROM manuscript_source_arrivals WHERE id = $1`, [arrival.id])).rows[0].source_text;
  for (const line of ['TITLE', 'SUBTITLE', 'AUTHOR NAME', 'First real paragraph.']) {
    check(`OM source witness still contains "${line}"`, witnessText.includes(line));
  }

  // ── Cleanup: the disposable fixture leaves nothing behind ────────────────
  await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  const left = (await query<any>(
    `SELECT count(*)::int AS n FROM manuscript_source_arrivals WHERE member_id = $1`, [memberId])).rows[0].n;
  check('CLEAN fixture removed', left === 0);

  console.log(`\n${failures === 0 ? 'P0 WITNESS: ALL CONTROLS PASSED' : `P0 WITNESS: ${failures} FAILURE(S)`}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
