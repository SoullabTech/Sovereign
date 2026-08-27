export const dynamic = 'force-dynamic'

/**
 * Data Migration API
 *
 * Migrates user data from an old explorerId to a new member account.
 * This allows users who had local-only sessions to link their history
 * to their new server-side account.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

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


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * AUTH-BOUNDARY-04A — the authorization contract for migration.
 *
 * WHAT THIS ROUTE DOES, so the contract is judged against the real blast radius:
 * it runs `UPDATE <table> SET user_id = $new WHERE user_id = $old` across ~30
 * tables — conversation turns, journals, consciousness traces, soul patterns,
 * breakthrough moments, field records. It does not copy. It MOVES. The source
 * loses everything the destination gains.
 *
 * Before this, both ids came from the request body with no session resolution
 * and no ACCESS_RULES entry, so any unauthenticated caller could move any
 * member's entire corpus to an id they controlled. That is a cross-account
 * transfer AND destruction primitive, not merely a read.
 *
 * THE CONTRACT, which is deliberately stricter than ordinary self-service:
 *
 *   1. The caller must hold a verified session. No session, no migration.
 *   2. The DESTINATION must be the caller. You may migrate INTO yourself and
 *      nowhere else — so the request can never hand your data to a third party,
 *      and can never be aimed at someone else's account.
 *   3. The SOURCE must not be an existing member. The legitimate case is an
 *      anonymous local `explorerId` being linked to a new account; a source that
 *      is itself a member account means someone is trying to drain a real
 *      person, and is refused even when the destination is the caller.
 *
 * Rules 2 and 3 together mean the only reachable operation is "pull anonymous
 * data into my own account". Every cross-member direction is closed.
 *
 * RESIDUAL RISK, named rather than hidden: an attacker who learns a victim's
 * local explorer id could still claim that anonymous data as their own. Explorer
 * ids are device-local and not exposed the way member UUIDs are, so this is far
 * narrower than what it replaces — but it is not zero, and closing it needs a
 * claim token issued at registration. That is a separate decision, not something
 * to assume here.
 */
async function isExistingMember(id: string): Promise<boolean> {
  // A non-UUID cannot be a member id, and passing one to a uuid column errors.
  if (!UUID_RE.test(id)) return false;
  const r = await query('SELECT id FROM members WHERE id = $1', [id]);
  return r.rows.length > 0;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verified caller. The request may name a SOURCE; it may never name who
    //    is asking, and it may never name a destination other than itself.
    const callerId = await getMemberIdFromRequest(request);
    if (!callerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // 2. Destination must BE the caller.
    if (newUserId !== callerId) {
      console.warn('[DataMigration] REFUSED: destination is not the caller (possible cross-account transfer attempt)');
      return NextResponse.json(
        { error: 'You may only migrate data into your own account' },
        { status: 403 }
      );
    }

    // 3. Source must not be a member account. Draining a real person is refused
    //    even when the destination is the caller's own account.
    if (await isExistingMember(oldUserId)) {
      console.warn('[DataMigration] REFUSED: source is an existing member account');
      return NextResponse.json(
        { error: 'The source is not eligible for migration' },
        { status: 403 }
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
    // The preview was an unauthenticated CENSUS ORACLE: name any user id and
    // learn their row counts across ~30 tables. Same contract as POST, minus the
    // destination (there isn't one): verified caller, and a source that is either
    // the caller themselves or a non-member id.
    const callerId = await getMemberIdFromRequest(request);
    if (!callerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oldUserId = searchParams.get('oldUserId');

    if (!oldUserId) {
      return NextResponse.json(
        { error: 'oldUserId parameter is required' },
        { status: 400 }
      );
    }

    if (oldUserId !== callerId && await isExistingMember(oldUserId)) {
      console.warn('[DataMigration] REFUSED preview: source is another member account');
      return NextResponse.json(
        { error: 'The source is not eligible for migration' },
        { status: 403 }
      );
    }

    console.log(`[DataMigration] Previewing migration for a source owned by the caller`);

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
