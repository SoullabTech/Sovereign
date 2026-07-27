/**
 * Corrective identity migration for the historical library corpus.
 *
 * Class A defect remediation (corrective arm):
 * docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
 *
 * Evaluates every library source against the D1 identity rules
 * (lib/library/ingestIntegrity.ts) and, for invalid identities, re-derives
 * title/author ONLY from an exact checksum-matched source file. Anything
 * ambiguous or unrepairable (no checksum match, basename-only match, multiple
 * candidates, re-derivation still invalid) is UNRESOLVED: the row is left
 * exactly as it is and surfaced in the report for an explicit later decision
 * (founder ruling 2026-07-27 — never infer a replacement identity).
 * Reconciliation invariant: evaluated = already_valid + repairable + unresolved;
 * executed_repairs <= repairable.
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
  /**
   * validate   — identity already passes current rules → set identity_valid=true
   * repair     — checksum-matched source file re-derived a valid identity
   * unresolved — NO mutation. Ambiguous or unrepairable cases stay exactly as
   *              they are and are surfaced in the audit's unresolved section
   *              (founder ruling 2026-07-27: never infer a replacement identity
   *              when no checksum-matched source exists, when matches are
   *              ambiguous, or when re-derivation still fails validation).
   */
  action: 'repair' | 'unresolved' | 'validate';
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

  // Index local candidate files by checksum. Repairs are authorized ONLY on
  // an exact checksum match (founder ruling 2026-07-27) — a basename match is
  // reported as an unresolved candidate, never acted on. Basename collisions
  // are tracked so ambiguity is visible in the report.
  console.log('[repairIdentity] Indexing candidate source files...');
  const byChecksum = new Map<string, { file: string; content: string }>();
  const basenameCount = new Map<string, number>();
  for (const file of walkFiles(sourceDir)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\u0000/g, '').replace(/^\uFEFF/, ''); // same normalization as ingestTxtSources.ts so checksums line up
    byChecksum.set(checksumOf(content), { file, content });
    const base = path.basename(file);
    basenameCount.set(base, (basenameCount.get(base) || 0) + 1);
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

    // Identity invalid — a repair may be inferred ONLY from an exact
    // checksum-matched source file. Everything else is unresolved: the row
    // stays exactly as it is and is surfaced in the audit.
    const located = byChecksum.get(s.checksum);

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
          reason: 're-derived from checksum-matched file',
        });
        continue;
      }
      plans.push({
        id: s.id,
        action: 'unresolved',
        oldTitle: s.title,
        oldAuthor: s.author,
        reason: `rederivation_still_invalid:${identity.validation.reasons.join(',')}`,
      });
      continue;
    }

    const dbBasename = path.basename(s.file_path || '');
    const basenameHits = basenameCount.get(dbBasename) || 0;
    plans.push({
      id: s.id,
      action: 'unresolved',
      oldTitle: s.title,
      oldAuthor: s.author,
      reason:
        basenameHits > 1
          ? `ambiguous_basename_match:${basenameHits} candidates`
          : basenameHits === 1
            ? 'basename_match_only_no_checksum'
            : 'source_file_unlocated',
    });
  }

  const counts = {
    validate: plans.filter((p) => p.action === 'validate').length,
    repair: plans.filter((p) => p.action === 'repair').length,
    unresolved: plans.filter((p) => p.action === 'unresolved').length,
  };
  // Reconciliation invariant (founder ruling 2026-07-27):
  // evaluated = already_valid + repairable + unresolved
  if (counts.validate + counts.repair + counts.unresolved !== sources.length) {
    throw new Error(
      `[repairIdentity] accounting failure: ${counts.validate}+${counts.repair}+${counts.unresolved} != ${sources.length}`
    );
  }
  console.log(
    `[repairIdentity] Plan: evaluated=${sources.length} = already_valid=${counts.validate} + repairable=${counts.repair} + unresolved=${counts.unresolved}`
  );

  if (execute) {
    // Unresolved rows are untouched by design; executed repairs can never
    // exceed the repairable count.
    let applied = 0;
    for (const p of plans) {
      if (p.action === 'validate') {
        await query(`UPDATE library_sources SET identity_valid = true WHERE id = $1`, [p.id]);
        applied++;
      } else if (p.action === 'repair') {
        await query(
          `UPDATE library_sources SET title = $2, author = $3, identity_valid = true,
             identity_invalid_reason = NULL,
             meta = meta || jsonb_build_object('identity_repaired_from', title, 'identity_repaired_at', NOW()::text)
           WHERE id = $1`,
          [p.id, p.newTitle, p.newAuthor]
        );
        applied++;
      }
      // action === 'unresolved': no mutation, ever.
    }
    console.log(
      `[repairIdentity] Applied ${applied} updates (executed_repairs=${counts.repair} <= repairable=${counts.repair}; unresolved=${counts.unresolved} untouched)`
    );
  } else {
    console.log('[repairIdentity] Dry-run — no changes written. Sample of repairs:');
    for (const p of plans.filter((x) => x.action === 'repair').slice(0, 15)) {
      console.log(`  ${p.id.slice(0, 8)} "${p.oldTitle.slice(0, 40)}" / "${p.oldAuthor}" → "${p.newTitle?.slice(0, 60)}" / "${p.newAuthor}"`);
    }
    console.log('[repairIdentity] Sample of unresolved (no mutation planned):');
    for (const p of plans.filter((x) => x.action === 'unresolved').slice(0, 10)) {
      console.log(`  ${p.id.slice(0, 8)} "${p.oldTitle.slice(0, 40)}" → UNRESOLVED (${p.reason})`);
    }
  }

  if (reportPath) {
    const lines: string[] = [
      `# Library identity repair ${execute ? 'execution' : 'dry-run'} report`,
      '',
      `Reconciliation: evaluated (${sources.length}) = already_valid (${counts.validate}) + repairable (${counts.repair}) + unresolved (${counts.unresolved})`,
      execute ? `Executed repairs: ${counts.repair} (<= repairable ${counts.repair}); unresolved rows untouched.` : 'Dry-run: nothing written.',
      '',
      '## Repairs (checksum-matched only)',
      ...plans.filter((p) => p.action === 'repair').map(
        (p) => `- \`${p.id}\` "${p.oldTitle}" / "${p.oldAuthor ?? ''}" → "${p.newTitle}" / "${p.newAuthor ?? ''}" (${p.reason})`
      ),
      '',
      '## Unresolved (unchanged by design — each needs an explicit later decision)',
      ...plans.filter((p) => p.action === 'unresolved').map(
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
