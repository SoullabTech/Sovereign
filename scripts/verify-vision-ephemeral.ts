/**
 * VISION-EPHEMERAL-01 — runtime falsification probe.
 *
 *   npx tsx scripts/verify-vision-ephemeral.ts
 *   npx tsx scripts/verify-vision-ephemeral.ts --recent-hours=24
 *
 * Run this AFTER real image turns have gone through production (see
 * docs/ops/VISION_WITNESS_2026-08-28.md). It answers the only question that
 * matters and that no code read can settle:
 *
 *     did any image bytes come to rest anywhere in the database?
 *
 * Method: scan every text-bearing column in every table for the base64
 * signatures that image payloads necessarily begin with. This is deliberately
 * NOT scoped to the tables the vision path is known to touch — the whole point
 * is to catch a sink nobody predicted, including a generic request logger, a
 * telemetry blob, or a memory-candidate row.
 *
 * The scan looks for the payload, not for our payload: it fires on ANY image
 * bytes from ANY source, which is what makes it a falsification test rather
 * than a confirmation of what we already believe.
 *
 * Companion to the source-level drift alarm:
 *   app/api/sovereign/app/maia/list/__tests__/visionEphemeral.test.ts
 * That one proves the shape; this one proves the absence.
 *
 * Read-only. Opens no transaction, writes nothing, and never prints a matched
 * value — only table, column, and a count. A leak must not be made worse by
 * the tool that finds it.
 */

import { Client } from 'pg';

// Base64 prefixes of the magic bytes each format starts with. An image encoded
// for the Anthropic API begins with one of these, whatever produced it.
const SIGNATURES: Array<{ label: string; like: string }> = [
  { label: 'JPEG',     like: '%/9j/%' },          // FF D8 FF
  { label: 'PNG',      like: '%iVBORw0KGgo%' },   // 89 50 4E 47
  { label: 'GIF',      like: '%R0lGOD%' },        // 47 49 46 38
  { label: 'WebP',     like: '%UklGR%' },         // 52 49 46 46 (RIFF)
  { label: 'data URL', like: '%data:image/%' },
];

/**
 * (table, column) pairs permitted to hold image content by an EXISTING product
 * contract — member-uploaded media that the member asked us to keep.
 *
 * Empty on purpose. A hit here is not automatically a leak, but it must be
 * named and justified in this list by a human before it stops failing the run.
 * Growing this list silently is how the invariant dies.
 */
const PERMITTED: Array<{ table: string; column: string; why: string }> = [];

const RECENT_HOURS = (() => {
  const arg = process.argv.find(a => a.startsWith('--recent-hours='));
  return arg ? Number(arg.split('=')[1]) : null;
})();

type Hit = { table: string; column: string; signature: string; rows: number };

async function main() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
  const client = new Client({ connectionString });
  await client.connect();

  console.log('👁️  VISION-EPHEMERAL-01 — scanning for image bytes at rest');
  console.log(`    scope: ${RECENT_HOURS ? `rows from the last ${RECENT_HOURS}h (where timestamped)` : 'ALL rows'}`);

  // Every text-bearing column. jsonb included: a leak into a metadata blob is
  // the likeliest shape, not a dedicated column someone deliberately added.
  const { rows: columns } = await client.query<{
    table_name: string; column_name: string; data_type: string;
  }>(`
    SELECT c.table_name, c.column_name, c.data_type
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
     WHERE c.table_schema = 'public'
       AND t.table_type = 'BASE TABLE'
       AND c.data_type IN ('text','character varying','character','json','jsonb')
     ORDER BY c.table_name, c.column_name
  `);

  // Which tables carry a timestamp we can narrow on, when --recent-hours is set.
  const timeCols = new Map<string, string>();
  if (RECENT_HOURS) {
    const { rows } = await client.query<{ table_name: string; column_name: string }>(`
      SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public'
         AND column_name IN ('created_at','inserted_at','updated_at','occurred_at')
         AND data_type LIKE 'timestamp%'
    `);
    for (const r of rows) if (!timeCols.has(r.table_name)) timeCols.set(r.table_name, r.column_name);
  }

  const hits: Hit[] = [];
  const errors: string[] = [];
  let scanned = 0;

  for (const col of columns) {
    const q = `"${col.table_name}"."${col.column_name}"`;
    const timeCol = timeCols.get(col.table_name);
    const window = RECENT_HOURS && timeCol
      ? ` AND "${timeCol}" > NOW() - INTERVAL '${RECENT_HOURS} hours'`
      : '';

    for (const sig of SIGNATURES) {
      try {
        const { rows } = await client.query<{ n: string }>(
          `SELECT count(*)::text AS n FROM "${col.table_name}"
            WHERE ${q}::text LIKE $1${window}`,
          [sig.like],
        );
        const n = Number(rows[0].n);
        if (n > 0) hits.push({ table: col.table_name, column: col.column_name, signature: sig.label, rows: n });
      } catch (err: any) {
        // A column we cannot cast or a table we cannot read is reported, never
        // silently skipped — an unscannable sink is an unproven sink.
        errors.push(`${q} [${sig.label}]: ${err?.message ?? err}`);
      }
    }
    scanned++;
  }

  console.log(`    scanned: ${scanned} columns across ${new Set(columns.map(c => c.table_name)).size} tables\n`);

  const permitted = (h: Hit) => PERMITTED.some(p => p.table === h.table && p.column === h.column);
  const violations = hits.filter(h => !permitted(h));
  const allowed = hits.filter(permitted);

  for (const h of allowed) {
    const why = PERMITTED.find(p => p.table === h.table && p.column === h.column)?.why;
    console.log(`ℹ️  permitted  ${h.table}.${h.column} — ${h.signature} × ${h.rows} (${why})`);
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} column(s) could not be scanned — these are UNPROVEN, not clean:`);
    for (const e of errors.slice(0, 20)) console.log(`    ${e}`);
    if (errors.length > 20) console.log(`    …and ${errors.length - 20} more`);
  }

  if (violations.length > 0) {
    console.log('\n❌ VISION-EPHEMERAL-01 FAILED — image bytes found at rest:\n');
    for (const h of violations) {
      console.log(`    ${h.table}.${h.column}  ${h.signature}  ${h.rows} row(s)`);
    }
    console.log('\n    Image content must not persist. Find the writer, remove the sink,');
    console.log('    then purge the rows above before re-running.');
    await client.end();
    process.exit(1);
  }

  console.log('\n✅ VISION-EPHEMERAL-01 PASSED — no image bytes at rest in any scanned column.');
  if (errors.length > 0) {
    console.log('   (with the unscannable columns above still unproven)');
  }
  console.log('\n   Still required for the full invariant — the log half:');
  console.log("   ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \\");
  console.log(`     | grep -cE "/9j/|iVBORw0KGgo|data:image/"'   # must print 0`);

  await client.end();
}

main().catch(err => {
  console.error('❌ probe failed to run:', err);
  process.exit(1);
});
