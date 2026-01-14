/**
 * Server Audio Cleanup Script
 *
 * Deletes expired audio files based on retention policy.
 * Keeps journal entries (transcripts) intact - only removes raw audio.
 *
 * Usage:
 *   npx tsx scripts/cleanup-server-audio.ts           # dry-run (safe default)
 *   npx tsx scripts/cleanup-server-audio.ts -v       # dry-run with verbose output
 *   npx tsx scripts/cleanup-server-audio.ts --apply  # actually delete files
 *
 * Environment:
 *   AUDIO_RETENTION_DAYS=30       # default retention period
 *   AUDIO_CLEANUP_BATCH_SIZE=200  # max rows per run
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { query } from '../lib/db/postgres';

type Row = {
  id: string;
  user_id: string;
  audio_path: string;
  created_at: Date;
  circle_tier: string | null;
};

// Retention policy by tier (in days)
// -1 means "forever" (never auto-delete)
const TIER_RETENTION: Record<string, number> = {
  explorer: 0,      // free users shouldn't have server audio anyway
  sustainer: 30,    // 30 days
  guardian: 90,     // 90 days
  elder: -1,        // forever
  pioneer: -1,      // forever (founding members)
};

const DEFAULT_RETENTION_DAYS = Number(process.env.AUDIO_RETENTION_DAYS || 30);
const BATCH_SIZE = Number(process.env.AUDIO_CLEANUP_BATCH_SIZE || 200);

function getRetentionDays(tier: string | null): number {
  const t = tier || 'explorer';
  return TIER_RETENTION[t] ?? DEFAULT_RETENTION_DAYS;
}

function isSafeAudioPath(p: string): boolean {
  // Prevent deleting outside storage/audio/journals
  const norm = path.normalize(p).replace(/\\/g, '/');
  return norm.startsWith('storage/audio/journals/');
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Default to dry-run for safety; require --apply to actually delete
  const apply = process.argv.includes('--apply');
  const dryRun = !apply;
  const verbose = process.argv.includes('-v') || process.argv.includes('--verbose');

  console.log(`[cleanup-server-audio] Starting...`);
  console.log(`  dryRun=${dryRun} batch=${BATCH_SIZE} defaultRetention=${DEFAULT_RETENTION_DAYS}d`);
  console.log(`  Tier retention: ${JSON.stringify(TIER_RETENTION)}`);

  // Find audio entries with their owner's tier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await query(
    `
    SELECT
      q.id,
      q.user_id,
      q.audio_path,
      q.created_at,
      ms.circle_tier
    FROM quick_journal_entries q
    LEFT JOIN member_settings ms ON q.user_id::uuid = ms.member_id
    WHERE q.audio_path IS NOT NULL
    ORDER BY q.created_at ASC
    LIMIT $1
    `,
    [BATCH_SIZE]
  );

  const rows: Row[] = Array.isArray(res) ? res : res?.rows || [];
  if (!rows.length) {
    console.log('[cleanup-server-audio] No audio entries found');
    return;
  }

  console.log(`[cleanup-server-audio] Found ${rows.length} entries with audio`);

  let deleted = 0;
  let nulled = 0;
  let skipped = 0;
  let kept = 0;

  const now = new Date();

  for (const r of rows) {
    const retentionDays = getRetentionDays(r.circle_tier);

    // -1 means "forever" - never delete
    if (retentionDays === -1) {
      if (verbose) {
        console.log(`[cleanup-server-audio] KEEP (forever tier=${r.circle_tier}) id=${r.id}`);
      }
      kept++;
      continue;
    }

    // Check if entry is older than retention period
    const createdAt = new Date(r.created_at);
    const ageMs = now.getTime() - createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays < retentionDays) {
      if (verbose) {
        console.log(
          `[cleanup-server-audio] KEEP (age=${ageDays.toFixed(1)}d < ${retentionDays}d) id=${r.id}`
        );
      }
      kept++;
      continue;
    }

    const p = r.audio_path;

    if (!p || !isSafeAudioPath(p)) {
      skipped++;
      console.warn(`[cleanup-server-audio] SKIP unsafe path: id=${r.id} path=${p}`);
      continue;
    }

    const exists = await fileExists(p);

    if (dryRun) {
      console.log(
        `[cleanup-server-audio] DRY DELETE id=${r.id} age=${ageDays.toFixed(1)}d tier=${r.circle_tier} exists=${exists} path=${p}`
      );
      continue;
    }

    // Actually delete
    if (exists) {
      try {
        await fs.unlink(p);
        deleted++;
        if (verbose) {
          console.log(`[cleanup-server-audio] DELETED file: ${p}`);
        }
      } catch (e) {
        skipped++;
        console.warn(`[cleanup-server-audio] FAIL delete id=${r.id} path=${p}`, e);
        continue; // do NOT null metadata if delete failed
      }
    }

    // If file missing OR deleted successfully -> null metadata
    await query(
      `
      UPDATE quick_journal_entries
      SET audio_path = NULL,
          audio_mime = NULL,
          audio_duration_ms = NULL
      WHERE id = $1
      `,
      [r.id]
    );

    nulled++;
    if (verbose) {
      console.log(`[cleanup-server-audio] NULLED metadata for id=${r.id}`);
    }
  }

  console.log(`[cleanup-server-audio] Complete:`);
  console.log(`  deleted=${deleted} (files removed)`);
  console.log(`  nulled=${nulled} (metadata cleared)`);
  console.log(`  kept=${kept} (within retention or forever tier)`);
  console.log(`  skipped=${skipped} (errors or unsafe paths)`);
}

main().catch((e) => {
  console.error('[cleanup-server-audio] Fatal error:', e);
  process.exit(1);
});
