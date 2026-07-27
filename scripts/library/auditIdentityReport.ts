/**
 * Library identity/completeness audit report.
 *
 * Read-only. Produces the before/after evidence required by the Class A
 * defect's remediation contract:
 * docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
 *
 * Usage:
 *   npx tsx scripts/library/auditIdentityReport.ts [--out report.md]
 */

import 'dotenv/config';
import * as fs from 'fs';
import { query, queryOne } from '../../lib/database/postgres';

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

  const totals = await queryOne<{
    total: string;
    junk_title: string;
    suspect_author: string;
    zero_chunks: string;
    dup_checksums: string;
    identity_true: string;
    identity_false: string;
    identity_null: string;
    chunk_mismatch: string;
  }>(`
    SELECT
      count(*) AS total,
      count(*) FILTER (WHERE title !~ '^[A-Za-z0-9"]' OR length(trim(title)) < 4) AS junk_title,
      count(*) FILTER (WHERE author IS NOT NULL AND author !~ '^[A-Z]') AS suspect_author,
      count(*) FILTER (WHERE chunk_count = 0 OR chunk_count IS NULL) AS zero_chunks,
      count(*) - count(DISTINCT checksum) AS dup_checksums,
      count(*) FILTER (WHERE identity_valid = true) AS identity_true,
      count(*) FILTER (WHERE identity_valid = false) AS identity_false,
      count(*) FILTER (WHERE identity_valid IS NULL) AS identity_null,
      count(*) FILTER (
        WHERE expected_chunk_count IS NOT NULL
          AND chunk_count IS DISTINCT FROM expected_chunk_count
      ) AS chunk_mismatch
    FROM library_sources
  `);

  const byStatus = await query<{ status: string; count: string }>(
    `SELECT ingestion_status AS status, count(*) AS count FROM library_sources GROUP BY 1 ORDER BY 2 DESC`
  );

  const worstTitles = await query<{ id: string; title: string; author: string | null; status: string }>(
    `SELECT id, left(title, 60) AS title, left(author, 30) AS author, ingestion_status AS status
     FROM library_sources
     WHERE title !~ '^[A-Za-z0-9"]' OR length(trim(title)) < 4
     ORDER BY title LIMIT 20`
  );

  const now = new Date().toISOString();
  const lines: string[] = [
    `# Library identity & completeness audit — ${now}`,
    '',
    `Total sources: ${totals!.total}`,
    '',
    '| Measure | Count |',
    '|---|---|',
    `| Junk titles | ${totals!.junk_title} |`,
    `| Suspect authors | ${totals!.suspect_author} |`,
    `| Zero-chunk sources | ${totals!.zero_chunks} |`,
    `| Duplicate checksums | ${totals!.dup_checksums} |`,
    `| identity_valid = true | ${totals!.identity_true} |`,
    `| identity_valid = false | ${totals!.identity_false} |`,
    `| identity_valid unevaluated (NULL) | ${totals!.identity_null} |`,
    `| expected/actual chunk mismatch | ${totals!.chunk_mismatch} |`,
    '',
    '## By ingestion status',
    ...byStatus.map((r) => `- ${r.status}: ${r.count}`),
    '',
    '## Sample of junk-titled sources (first 20 by title sort)',
    ...worstTitles.map((r) => `- \`${r.id.slice(0, 8)}\` "${r.title}" / "${r.author ?? ''}" (${r.status})`),
    '',
  ];

  const report = lines.join('\n');
  if (outPath) {
    fs.writeFileSync(outPath, report);
    console.log(`Report written to ${outPath}`);
  } else {
    console.log(report);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[auditIdentityReport] FAILED:', err);
  process.exit(1);
});
