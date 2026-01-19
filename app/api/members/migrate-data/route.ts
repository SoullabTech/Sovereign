export const dynamic = 'force-dynamic';

/**
 * Data Migration API
 *
 * Migrates user data from an old explorerId to a new member account.
 * This allows users who had local-only sessions to link their history
 * to their new server-side account.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// Tables that contain user data to migrate
// Ordered by importance for user experience
const TABLES_TO_MIGRATE = [
  // Core conversation data
  'conversation_turns',
  'conversation_insights',
  'conversation_themes',
  'conversation_memory_uses',

  // Session data
  'maia_sessions',
  'user_session_patterns',
  'session_insights',

  // Journal and reflection data
  'elemental_journal_entries',
  'holoflower_journal_entries',
  'quick_journal_entries',

  // Consciousness and growth data
  'consciousness_traces',
  'consciousness_expansion_events',
  'soul_patterns',
  'spiral_stage_transitions',
  'breakthrough_moments',

  // Memory and patterns
  'developmental_memories',
  'semantic_memory_vectors',
  'memory_links',
  'pattern_connections',
  'episodes',
  'episode_links',

  // Preferences and settings
  'member_preferences',
  'preference_confirmations',

  // Relationships
  'relationship_essences',
  'relationship_events',
  'relationship_patterns',
  'user_relationship_context',

  // Focus and productivity
  'focus_tasks',
  'focus_reminders',
  'focus_message_drafts',

  // Scribe mode
  'scribe_sessions',
  'scribe_artifacts',

  // Other user data
  'resonance_events',
  'field_records',
  'teloi',
  'bardic_teloi',
  'bardic_links',
  'bardic_cues',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldUserId, newUserId } = body;

    if (!oldUserId || !newUserId) {
      return NextResponse.json(
        { error: 'Both oldUserId and newUserId are required' },
        { status: 400 }
      );
    }

    if (oldUserId === newUserId) {
      return NextResponse.json(
        { error: 'Old and new user IDs are the same' },
        { status: 400 }
      );
    }

    console.log(`[DataMigration] Starting migration from ${oldUserId} to ${newUserId}`);

    const results: { table: string; rowsUpdated: number }[] = [];
    let totalMigrated = 0;

    for (const table of TABLES_TO_MIGRATE) {
      try {
        // Check if table exists and has user_id column
        const tableCheck = await query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_name = $1 AND column_name = 'user_id' AND table_schema = 'public'`,
          [table]
        );

        if (tableCheck.rows.length === 0) {
          // Table doesn't exist or doesn't have user_id column, skip
          continue;
        }

        // Count existing records for old user
        const countResult = await query(
          `SELECT COUNT(*) as count FROM ${table} WHERE user_id = $1`,
          [oldUserId]
        );
        const count = parseInt(countResult.rows[0]?.count || '0');

        if (count > 0) {
          // Migrate the data
          await query(
            `UPDATE ${table} SET user_id = $1 WHERE user_id = $2`,
            [newUserId, oldUserId]
          );

          results.push({ table, rowsUpdated: count });
          totalMigrated += count;
          console.log(`[DataMigration] Migrated ${count} rows from ${table}`);
        }
      } catch (tableError) {
        // Log but continue - some tables might have constraints
        console.warn(`[DataMigration] Warning for table ${table}:`, tableError);
      }
    }

    console.log(`[DataMigration] Complete! Total rows migrated: ${totalMigrated}`);

    return NextResponse.json({
      success: true,
      oldUserId,
      newUserId,
      totalMigrated,
      details: results,
    });

  } catch (error) {
    console.error('[DataMigration] Error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate data' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what would be migrated
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const oldUserId = searchParams.get('oldUserId');

    if (!oldUserId) {
      return NextResponse.json(
        { error: 'oldUserId parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[DataMigration] Previewing migration for ${oldUserId}`);

    const preview: { table: string; count: number }[] = [];
    let totalCount = 0;

    for (const table of TABLES_TO_MIGRATE) {
      try {
        const tableCheck = await query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_name = $1 AND column_name = 'user_id' AND table_schema = 'public'`,
          [table]
        );

        if (tableCheck.rows.length === 0) continue;

        const countResult = await query(
          `SELECT COUNT(*) as count FROM ${table} WHERE user_id = $1`,
          [oldUserId]
        );
        const count = parseInt(countResult.rows[0]?.count || '0');

        if (count > 0) {
          preview.push({ table, count });
          totalCount += count;
        }
      } catch {
        // Skip tables that error
      }
    }

    return NextResponse.json({
      oldUserId,
      totalRecords: totalCount,
      tables: preview,
    });

  } catch (error) {
    console.error('[DataMigration] Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to preview migration' },
      { status: 500 }
    );
  }
}
