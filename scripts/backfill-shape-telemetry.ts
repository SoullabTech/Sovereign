#!/usr/bin/env tsx
/**
 * Backfill AIN Shape Telemetry
 *
 * Re-runs the updated detector (with broadened bridge/permission regexes)
 * over historical telemetry rows and updates the flags.
 *
 * Usage: npx tsx scripts/backfill-shape-telemetry.ts [--dry-run]
 */

import { query } from '@/lib/db/postgres';
import { assessAINResponseShape } from '@/lib/ai/quality/ainResponseShape';

const DRY_RUN = process.argv.includes('--dry-run');

interface TelemetryTurn {
  telemetry_id: number;
  turn_id: number;
  session_id: string;
  user_text: string;
  maia_text: string;
  old_mirror: boolean;
  old_bridge: boolean;
  old_permission: boolean;
  old_next_step: boolean;
  old_score: number;
}

async function main() {
  console.log('🔄 AIN Shape Telemetry Backfill');
  console.log(DRY_RUN ? '   Mode: DRY RUN (no updates)' : '   Mode: LIVE (will update database)');
  console.log('');

  // Step 1: Get telemetry rows joined with turn content
  const joinQuery = `
    SELECT
      t.id as telemetry_id,
      m.id as turn_id,
      t.session_id,
      m.user_text,
      m.maia_text,
      t.mirror as old_mirror,
      t.bridge as old_bridge,
      t.permission as old_permission,
      t.next_step as old_next_step,
      t.score as old_score
    FROM ain_shape_telemetry t
    JOIN maia_turns m ON t.session_id = m.session_id
      AND ABS(EXTRACT(EPOCH FROM (t.formed_at - m.created_at))) < 5
    WHERE m.user_text IS NOT NULL
      AND m.maia_text IS NOT NULL
      AND LENGTH(m.maia_text) > 50
    ORDER BY t.formed_at DESC
  `;

  const result = await query<TelemetryTurn>(joinQuery);
  const rows = result.rows;

  console.log(`📊 Found ${rows.length} telemetry rows with matching turn content`);
  console.log('');

  // Stats tracking
  let updated = 0;
  let unchanged = 0;
  let errors = 0;
  const changes = {
    mirror: { gained: 0, lost: 0 },
    bridge: { gained: 0, lost: 0 },
    permission: { gained: 0, lost: 0 },
    nextStep: { gained: 0, lost: 0 },
  };

  // Step 2: Re-evaluate each row
  for (const row of rows) {
    try {
      const shape = assessAINResponseShape(row.user_text, row.maia_text);

      // Track changes
      const hasChanges =
        shape.flags.mirror !== row.old_mirror ||
        shape.flags.bridge !== row.old_bridge ||
        shape.flags.permission !== row.old_permission ||
        shape.flags.nextStep !== row.old_next_step;

      if (hasChanges) {
        // Track what changed
        if (shape.flags.mirror && !row.old_mirror) changes.mirror.gained++;
        if (!shape.flags.mirror && row.old_mirror) changes.mirror.lost++;
        if (shape.flags.bridge && !row.old_bridge) changes.bridge.gained++;
        if (!shape.flags.bridge && row.old_bridge) changes.bridge.lost++;
        if (shape.flags.permission && !row.old_permission) changes.permission.gained++;
        if (!shape.flags.permission && row.old_permission) changes.permission.lost++;
        if (shape.flags.nextStep && !row.old_next_step) changes.nextStep.gained++;
        if (!shape.flags.nextStep && row.old_next_step) changes.nextStep.lost++;

        if (!DRY_RUN) {
          // Update the row
          await query(`
            UPDATE ain_shape_telemetry
            SET
              mirror = $1,
              bridge = $2,
              permission = $3,
              next_step = $4,
              score = $5,
              pass = $6,
              menu_mode = $7,
              menu_signals = $8
            WHERE id = $9
          `, [
            shape.flags.mirror,
            shape.flags.bridge,
            shape.flags.permission,
            shape.flags.nextStep,
            shape.score,
            shape.pass,
            shape.flags.menuMode,
            shape.signals ? JSON.stringify(shape.signals) : null,
            row.telemetry_id
          ]);
        }

        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      errors++;
      console.error(`❌ Error processing telemetry ${row.telemetry_id}:`, err);
    }
  }

  // Step 3: Report results
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 BACKFILL RESULTS');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   Total processed: ${rows.length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Unchanged: ${unchanged}`);
  console.log(`   Errors: ${errors}`);
  console.log('');
  console.log('📈 FLAG CHANGES:');
  console.log(`   mirror:     +${changes.mirror.gained} / -${changes.mirror.lost}`);
  console.log(`   bridge:     +${changes.bridge.gained} / -${changes.bridge.lost}`);
  console.log(`   permission: +${changes.permission.gained} / -${changes.permission.lost}`);
  console.log(`   nextStep:   +${changes.nextStep.gained} / -${changes.nextStep.lost}`);
  console.log('');

  if (DRY_RUN) {
    console.log('💡 This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('✅ Backfill complete!');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
