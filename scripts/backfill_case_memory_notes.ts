/**
 * BACKFILL CASE MEMORY NOTES
 *
 * One-time script to ingest existing case_notes into case_memory_chunks.
 * Uses queue mode by default so it doesn't block on embeddings.
 *
 * Usage:
 *   npx tsx scripts/backfill_case_memory_notes.ts --dry-run
 *   npx tsx scripts/backfill_case_memory_notes.ts --limit=50
 *   npx tsx scripts/backfill_case_memory_notes.ts --caseId=<uuid>
 *   npx tsx scripts/backfill_case_memory_notes.ts --force
 *
 * Options:
 *   --dry-run       Show what would be done without doing it
 *   --limit=N       Process at most N notes (default: 5000)
 *   --caseId=UUID   Only process notes for this case
 *   --since=DATE    Only process notes after this date (ISO format)
 *   --force         Re-ingest even if chunks already exist
 *   --sync          Use sync mode instead of queue (slower but immediate)
 */

import { query } from '@/lib/db/postgres';
import { CaseMemoryService, EmbedMode } from '@/lib/caseload/CaseMemoryService';

type Args = Record<string, string | boolean>;

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (const a of argv) {
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    args[k] = v === undefined ? true : v;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args['dry-run']);
  const force = Boolean(args['force']);
  const useSync = Boolean(args['sync']);
  const limit = args['limit'] ? Number(args['limit']) : 5000;
  const caseId = (args['caseId'] as string) || null;
  const since = (args['since'] as string) || null;

  console.log('backfill_case_memory_notes: starting');
  console.log(`  dryRun: ${dryRun}`);
  console.log(`  force: ${force}`);
  console.log(`  embedMode: ${useSync ? 'sync' : 'queue'}`);
  console.log(`  limit: ${limit}`);
  console.log(`  caseId: ${caseId || 'all'}`);
  console.log(`  since: ${since || 'all time'}`);
  console.log('');

  const where: string[] = [];
  const params: any[] = [];

  if (caseId) {
    params.push(caseId);
    where.push(`case_id = $${params.length}`);
  }
  if (since) {
    params.push(since);
    where.push(`session_date >= $${params.length}::date`);
  }

  params.push(limit);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: notes } = await query(
    `
    SELECT
      id,
      case_id,
      practitioner_id,
      session_date,
      content,
      themes_observed,
      interventions_used,
      element_focus,
      spiral_movement
    FROM case_notes
    ${whereSql}
    ORDER BY session_date ASC
    LIMIT $${params.length}
    `,
    params
  );

  console.log(`Found ${notes.length} notes to process\n`);

  let processed = 0;
  let skipped = 0;
  let ingested = 0;

  for (const n of notes) {
    processed += 1;

    const noteId = String(n.id);
    const cid = String(n.case_id);
    const memberId = String(n.practitioner_id);
    const occurredAt = new Date(n.session_date).toISOString();
    const content = String(n.content || '').trim();

    if (!content) {
      console.log(`  [${processed}] Note ${noteId.slice(0, 8)}... - SKIPPED (empty content)`);
      skipped += 1;
      continue;
    }

    // Check if already ingested (unless --force)
    if (!force) {
      const exists = await query(
        `
        SELECT 1
        FROM case_memory_chunks
        WHERE case_id=$1 AND source_type='note' AND source_id=$2
        LIMIT 1
        `,
        [cid, noteId]
      );
      if (exists.rows.length) {
        console.log(`  [${processed}] Note ${noteId.slice(0, 8)}... - SKIPPED (already ingested)`);
        skipped += 1;
        continue;
      }
    }

    if (dryRun) {
      console.log(`  [${processed}] Note ${noteId.slice(0, 8)}... - WOULD INGEST (${content.length} chars)`);
      continue;
    }

    // Delete existing chunks if re-ingesting with --force
    if (force) {
      await CaseMemoryService.deleteSourceChunks({
        caseId: cid,
        sourceType: 'note',
        sourceId: noteId,
      });
    }

    const embedMode: EmbedMode = useSync ? 'sync' : 'queue';

    const r = await CaseMemoryService.ingestText({
      caseId: cid,
      memberId,
      sourceType: 'note',
      sourceId: noteId,
      occurredAt,
      content,
      metadata: {
        themes: n.themes_observed ?? null,
        interventions: n.interventions_used ?? null,
        element_focus: n.element_focus ?? null,
        spiral_movement: n.spiral_movement ?? null,
        backfilled: true,
      },
      embedMode,
    });

    ingested += r?.inserted ?? 0;
    console.log(`  [${processed}] Note ${noteId.slice(0, 8)}... - INGESTED (${r?.inserted ?? 0} chunks)`);
  }

  console.log('\n--- Summary ---');
  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun,
        force,
        embedMode: useSync ? 'sync' : 'queue',
        processed,
        skipped,
        ingested,
      },
      null,
      2
    )
  );

  if (!dryRun && !useSync && ingested > 0) {
    console.log('\nNOTE: Chunks were enqueued for embedding.');
    console.log('Run the embedding worker to process them:');
    console.log('  npx tsx scripts/embedding_worker.ts');
  }
}

main().catch((e) => {
  console.error('backfill_case_memory_notes: fatal error', e);
  process.exit(1);
});
