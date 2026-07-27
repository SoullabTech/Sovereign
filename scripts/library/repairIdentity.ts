/**
 * Corrective identity migration for the historical library corpus.
 *
 * Class A defect remediation (corrective arm):
 * docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
 *
 * Evaluates every library source against the D1 identity rules
 * (lib/library/ingestIntegrity.ts) and, for invalid identities, attempts to
 * re-derive title/author from the original source file — located by checksum
 * first (exact content match), then by file_path basename. Sources whose
 * identity cannot be repaired are marked identity_valid = false, which the
 * retrieval boundary excludes.
 *
 * DRY-RUN BY DEFAULT. Nothing is written without --execute.
 *
 * Usage:
 *   npx tsx scripts/library/repairIdentity.ts [--source-dir data/ain/source] [--execute] [--report out.md]
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { query } from '../../lib/database/postgres';
import { extractIdentity, validateTitle, validateAuthor } from '../../lib/library/ingestIntegrity';

interface SourceRow {
  id: string;
  type: string;
  title: string;
  author: string | null;
  file_path: string;
  checksum: string;
  ingestion_status: string;
  chunk_count: number | null;
}

interface RepairPlan {
  id: string;
  action: 'repair' | 'mark_invalid' | 'validate';
  oldTitle: string;
  oldAuthor: string | null;
  newTitle?: string;
  newAuthor?: string | null;
  reason: string;
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else if (/\.(md|txt)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function checksumOf(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const sourceDirIdx = args.indexOf('--source-dir');
  const sourceDir = sourceDirIdx >= 0 ? args[sourceDirIdx + 1] : 'data/ain/source';
  const reportIdx = args.indexOf('--report');
  const reportPath = reportIdx >= 0 ? args[reportIdx + 1] : null;

  console.log(`[repairIdentity] mode=${execute ? 'EXECUTE' : 'dry-run'} source-dir=${sourceDir}`);

  // Index local candidate files by checksum and basename.
  console.log('[repairIdentity] Indexing candidate source files...');
  const byChecksum = new Map<string, { file: string; content: string }>();
  const byBasename = new Map<string, { file: string; content: string }>();
  for (const file of walkFiles(sourceDir)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\u0000/g, '').replace(/^\uFEFF/, ''); // same normalization as ingestTxtSources.ts so checksums line up
    const entry = { file, content };
    byChecksum.set(checksumOf(content), entry);
    byBasename.set(path.basename(file), entry);
  }
  console.log(`[repairIdentity] Indexed ${byChecksum.size} files`);

  const sources = await query<SourceRow>(
    `SELECT id, type, title, author, file_path, checksum, ingestion_status, chunk_count
     FROM library_sources
     WHERE identity_valid IS NULL
     ORDER BY created_at`
  );
  console.log(`[repairIdentity] ${sources.length} unevaluated sources`);

  const plans: RepairPlan[] = [];

  for (const s of sources) {
    const titleCheck = validateTitle(s.title);
    const authorCheck = validateAuthor(s.author);

    if (titleCheck.valid && authorCheck.valid) {
      plans.push({
        id: s.id,
        action: 'validate',
        oldTitle: s.title,
        oldAuthor: s.author,
        reason: 'passes_current_rules',
      });
      continue;
    }

    // Identity invalid — try to re-derive from the original file.
    const located =
      byChecksum.get(s.checksum) ||
      byBasename.get(path.basename(s.file_path || ''));

    if (located) {
      const base = path.basename(located.file).replace(/\.(md|txt)$/i, '');
      const identity = extractIdentity(located.content, base);
      if (identity.validation.valid) {
        plans.push({
          id: s.id,
          action: 'repair',
          oldTitle: s.title,
          oldAuthor: s.author,
          newTitle: identity.title,
          newAuthor: identity.author,
          reason: `re-derived from ${byChecksum.has(s.checksum) ? 'checksum-matched' : 'basename-matched'} file`,
        });
        continue;
      }
      plans.push({
        id: s.id,
        action: 'mark_invalid',
        oldTitle: s.title,
        oldAuthor: s.author,
        reason: `rederivation_failed:${identity.validation.reasons.join(',')}`,
      });
      continue;
    }

    plans.push({
      id: s.id,
      action: 'mark_invalid',
      oldTitle: s.title,
      oldAuthor: s.author,
      reason: 'source_file_unlocated',
    });
  }

  const counts = {
    validate: plans.filter((p) => p.action === 'validate').length,
    repair: plans.filter((p) => p.action === 'repair').length,
    mark_invalid: plans.filter((p) => p.action === 'mark_invalid').length,
  };
  console.log(`[repairIdentity] Plan: ${counts.validate} validate · ${counts.repair} repair · ${counts.mark_invalid} mark invalid`);

  if (execute) {
    let applied = 0;
    for (const p of plans) {
      if (p.action === 'validate') {
        await query(`UPDATE library_sources SET identity_valid = true WHERE id = $1`, [p.id]);
      } else if (p.action === 'repair') {
        await query(
          `UPDATE library_sources SET title = $2, author = $3, identity_valid = true,
             identity_invalid_reason = NULL,
             meta = meta || jsonb_build_object('identity_repaired_from', title, 'identity_repaired_at', NOW()::text)
           WHERE id = $1`,
          [p.id, p.newTitle, p.newAuthor]
        );
      } else {
        await query(
          `UPDATE library_sources SET identity_valid = false, identity_invalid_reason = $2 WHERE id = $1`,
          [p.id, p.reason]
        );
      }
      applied++;
    }
    console.log(`[repairIdentity] Applied ${applied} updates`);
  } else {
    console.log('[repairIdentity] Dry-run — no changes written. Sample of repairs:');
    for (const p of plans.filter((x) => x.action === 'repair').slice(0, 15)) {
      console.log(`  ${p.id.slice(0, 8)} "${p.oldTitle.slice(0, 40)}" / "${p.oldAuthor}" → "${p.newTitle?.slice(0, 60)}" / "${p.newAuthor}"`);
    }
    for (const p of plans.filter((x) => x.action === 'mark_invalid').slice(0, 10)) {
      console.log(`  ${p.id.slice(0, 8)} "${p.oldTitle.slice(0, 40)}" → INVALID (${p.reason})`);
    }
  }

  if (reportPath) {
    const lines: string[] = [
      `# Library identity repair ${execute ? 'execution' : 'dry-run'} report`,
      '',
      `Sources evaluated: ${sources.length}`,
      `- validate (already sound): ${counts.validate}`,
      `- repair (re-derived from source file): ${counts.repair}`,
      `- mark invalid (unrepairable): ${counts.mark_invalid}`,
      '',
      '## Repairs',
      ...plans.filter((p) => p.action === 'repair').map(
        (p) => `- \`${p.id}\` "${p.oldTitle}" / "${p.oldAuthor ?? ''}" → "${p.newTitle}" / "${p.newAuthor ?? ''}" (${p.reason})`
      ),
      '',
      '## Marked invalid',
      ...plans.filter((p) => p.action === 'mark_invalid').map(
        (p) => `- \`${p.id}\` "${p.oldTitle}" (${p.reason})`
      ),
    ];
    fs.writeFileSync(reportPath, lines.join('\n'));
    console.log(`[repairIdentity] Report written to ${reportPath}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('[repairIdentity] FAILED:', err);
  process.exit(1);
});
