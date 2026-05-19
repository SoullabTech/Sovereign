/**
 * Stale Module Slug Cleanup
 *
 * Strips slugs from practitioners.enabled_modules that no longer exist in
 * the current MODULE_DEFINITIONS registry. Valid slugs are preserved
 * in their original order. NULL rows are skipped (those resolve to portal
 * defaults at read time and need no cleanup).
 *
 * Why this exists:
 *   Some practitioner rows carry legacy slugs from earlier schema versions
 *   (e.g. notebook, ideas, today, schedule, availability). validateModuleSlugs
 *   on the PATCH /api/studio/modules route rejects any payload containing
 *   such slugs, so module saves silently 400'd for affected practitioners
 *   until the load-side filter in app/studio/settings/page.tsx caught them.
 *   This script self-heals those rows so they never carry stale slugs again.
 *
 * Usage:
 *   npx tsx scripts/cleanup-stale-module-slugs.ts            # dry-run (safe default)
 *   npx tsx scripts/cleanup-stale-module-slugs.ts --apply    # actually write
 *
 * Idempotent: running twice is a no-op once rows are clean.
 */

import 'dotenv/config';
import { query } from '../lib/db/postgres';
import { ALL_MODULE_SLUGS } from '../lib/studio/moduleDefinitions';

const APPLY = process.argv.includes('--apply');
const MODE_LABEL = APPLY ? 'APPLY' : 'DRY-RUN';

type Row = {
  id: string;
  slug: string | null;
  enabled_modules: string[] | null;
};

async function main() {
  const validSet = new Set<string>(ALL_MODULE_SLUGS);

  console.log(`[cleanup-stale-module-slugs] mode=${MODE_LABEL}`);
  console.log(`[cleanup-stale-module-slugs] registry size=${validSet.size}`);

  const result = await query<Row>(
    'SELECT id, slug, enabled_modules FROM practitioners WHERE enabled_modules IS NOT NULL ORDER BY slug NULLS LAST'
  );

  let scanned = 0;
  let cleanRows = 0;
  let driftedRows = 0;
  let updated = 0;
  const droppedTally = new Map<string, number>();

  for (const row of result.rows) {
    scanned++;
    const original = row.enabled_modules ?? [];
    const cleaned = original.filter((s) => validSet.has(s));
    const dropped = original.filter((s) => !validSet.has(s));

    if (dropped.length === 0) {
      cleanRows++;
      continue;
    }

    driftedRows++;
    for (const s of dropped) {
      droppedTally.set(s, (droppedTally.get(s) ?? 0) + 1);
    }

    console.log(
      `  drift practitioner=${row.slug ?? row.id} kept=${cleaned.length} dropped=${dropped.length} stale=[${dropped.join(', ')}]`
    );

    if (APPLY) {
      await query(
        'UPDATE practitioners SET enabled_modules = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(cleaned), row.id]
      );
      updated++;
    }
  }

  console.log('');
  console.log('[cleanup-stale-module-slugs] summary:');
  console.log(`  scanned=${scanned}`);
  console.log(`  clean=${cleanRows}`);
  console.log(`  drifted=${driftedRows}`);
  console.log(`  updated=${updated}${APPLY ? '' : ' (dry-run, no writes)'}`);

  if (droppedTally.size > 0) {
    console.log('  stale slug frequency:');
    const sorted = [...droppedTally.entries()].sort((a, b) => b[1] - a[1]);
    for (const [slug, n] of sorted) {
      console.log(`    ${slug}: ${n}`);
    }
  }

  if (!APPLY && driftedRows > 0) {
    console.log('');
    console.log('Re-run with --apply to write the cleaned rows.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[cleanup-stale-module-slugs] fatal:', e);
    process.exit(1);
  });
