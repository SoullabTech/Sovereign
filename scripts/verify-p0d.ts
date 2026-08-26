/**
 * WS-01 P0-D — the deployed-candidate witness.
 *
 * Run INSIDE the running container, against the real database and the real
 * vault, on the exact candidate that is deployed:
 *
 *     docker exec maia-sovereign printenv GIT_COMMIT
 *     docker exec maia-sovereign sh -c "cd /app && npx tsx scripts/verify-p0d.ts"
 *     docker exec maia-sovereign printenv GIT_COMMIT
 *
 * The GIT_COMMIT reads bracket the run on purpose: if the running identity
 * changed underneath the witness, the witness is void and must abort. A
 * deploy during the witness window invalidates it — that is the whole reason
 * the deploy lease exists.
 *
 * P0-D requires TWO fresh member arrivals through the real ingest path on the
 * deployed candidate, and this reports on both legs independently:
 *
 *   FILE-BACKED   artifact_extraction — bytes in the vault, re-read and
 *                 re-hashed here. Passing means the original is genuinely
 *                 recoverable, not merely recorded.
 *
 *   PASTED        member_supplied_text — the exact text the member submitted
 *                 at the confirmation act. Passing means it claims NO artifact:
 *                 ref, hash and size must all be NULL. A pasted arrival that
 *                 carries artifact fields is the precise failure WS-01 exists
 *                 to make impossible, and the database CHECK constraint should
 *                 already have refused it.
 *
 * This script only READS. It creates nothing, repairs nothing, and cannot
 * manufacture the evidence it is reporting on.
 */
import { query } from '../lib/db/postgres';
import { verifyCustody } from '../lib/manuscript/source/arrivals';
import {
  ARTIFACT_EXTRACTION,
  MEMBER_SUPPLIED_TEXT,
} from '../lib/manuscript/source/custody';

interface ArrivalRow {
  id: string;
  member_id: string;
  manuscript_id: string | null;
  source_kind: string;
  artifact_ref: string | null;
  artifact_hash: string | null;
  artifact_size: number | null;
  original_filename: string | null;
  source_text_hash: string;
  extraction_method: string | null;
  created_at: string;
  claimed: boolean;
  source_custody: string | null;
}

const short = (value: string | null, n = 16) =>
  value === null ? 'NULL' : value.length > n ? `${value.slice(0, n)}…` : value;

async function main() {
  console.log('');
  console.log('WS-01 P0-D — custody verification against the deployed candidate');
  console.log(`GIT_COMMIT (as this process sees it): ${process.env.GIT_COMMIT ?? 'unset'}`);
  console.log(`DEPLOY_LANE: ${process.env.DEPLOY_LANE ?? 'unset'}`);
  console.log('');

  const arrivals = await query<ArrivalRow>(
    `SELECT a.id, a.member_id, a.manuscript_id, a.source_kind,
            a.artifact_ref, a.artifact_hash, a.artifact_size,
            a.original_filename, a.source_text_hash, a.extraction_method,
            a.created_at,
            (a.manuscript_id IS NOT NULL) AS claimed,
            m.source_custody
       FROM manuscript_source_arrivals a
       LEFT JOIN member_manuscripts m ON m.id = a.manuscript_id
      ORDER BY a.created_at ASC`,
  );

  console.log(`arrivals found: ${arrivals.rows.length}`);
  console.log('');

  let passed = 0;
  let failed = 0;
  const legs = { [ARTIFACT_EXTRACTION]: false, [MEMBER_SUPPLIED_TEXT]: false };

  for (const row of arrivals.rows) {
    const label = `${row.source_kind} (arrival ${row.id.slice(0, 8)})`;

    if (!row.manuscript_id) {
      // An arrival with no manuscript is not a failure — it is a recorded
      // arrival the member never confirmed. Reported, never counted.
      console.log(`  UNCLAIMED  ${label} — not bound to a manuscript`);
      console.log('');
      continue;
    }

    const problems: string[] = [];

    if (row.source_kind === MEMBER_SUPPLIED_TEXT) {
      // The pasted leg. It must claim NOTHING about a file.
      if (row.artifact_ref !== null) problems.push('artifact_ref is not NULL');
      if (row.artifact_hash !== null) problems.push('artifact_hash is not NULL');
      if (row.artifact_size !== null) problems.push('artifact_size is not NULL');
      if (row.original_filename !== null) problems.push('original_filename is not NULL');
    } else if (row.source_kind === ARTIFACT_EXTRACTION) {
      // The file-backed leg. It must have all three, together.
      if (row.artifact_ref === null) problems.push('artifact_ref is NULL');
      if (row.artifact_hash === null) problems.push('artifact_hash is NULL');
      if (row.artifact_size === null) problems.push('artifact_size is NULL');
    } else {
      problems.push(`unknown source_kind "${row.source_kind}"`);
    }

    if (row.source_custody !== 'source_custodied') {
      problems.push(`manuscript source_custody is "${row.source_custody ?? 'NULL'}"`);
    }

    // The live check: re-read the bytes, re-hash them, and decide again.
    const custody = await verifyCustody(row.manuscript_id, row.member_id);
    if (!custody.custodied) problems.push(`verifyCustody says custodied=false (${custody.reason})`);

    const ok = problems.length === 0;
    if (ok) {
      passed += 1;
      legs[row.source_kind as keyof typeof legs] = true;
    } else {
      failed += 1;
    }

    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${row.source_kind}`);
    console.log(`        arrival        : ${row.id}`);
    console.log(`        manuscript     : ${row.manuscript_id}`);
    console.log(`        arrived        : ${row.created_at}`);
    if (row.original_filename) {
      console.log(`        file           : ${row.original_filename}`);
    }
    console.log(`        artifact_ref   : ${short(row.artifact_ref, 40)}`);
    console.log(`        artifact_hash  : ${short(row.artifact_hash)}`);
    console.log(`        artifact_size  : ${row.artifact_size ?? 'NULL'}`);
    console.log(`        source_text    : ${short(row.source_text_hash)}`);
    console.log(`        extraction     : ${row.extraction_method ?? 'NULL'}`);
    console.log(`        source_custody : ${row.source_custody ?? 'NULL'}`);
    console.log(`        verifyCustody  : custodied=${custody.custodied} reason=${custody.reason}`);
    for (const problem of problems) console.log(`        ✗ ${problem}`);
    console.log('');
  }

  console.log('P0-D legs');
  console.log(`  file-backed (artifact_extraction) : ${legs[ARTIFACT_EXTRACTION] ? 'PASS' : 'NOT WITNESSED'}`);
  console.log(`  pasted (member_supplied_text)     : ${legs[MEMBER_SUPPLIED_TEXT] ? 'PASS' : 'NOT WITNESSED'}`);
  console.log('');
  console.log(`${passed} passed · ${failed} failed`);
  console.log('');

  const complete = legs[ARTIFACT_EXTRACTION] && legs[MEMBER_SUPPLIED_TEXT] && failed === 0;
  console.log(
    complete
      ? 'P0-D: BOTH LEGS WITNESSED on this candidate. Record against the candidate SHA read before AND after this run — a mismatch voids the witness.'
      : 'P0-D: INCOMPLETE. Both legs must pass on the same deployed candidate.',
  );
  console.log('');

  process.exit(complete ? 0 : 1);
}

main().catch((error) => {
  console.error('verify-p0d failed to run:', error);
  process.exit(2);
});
