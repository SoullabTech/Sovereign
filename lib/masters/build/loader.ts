/**
 * Master Build Loader
 *
 * Loads the active build for a master field at conversation start.
 * Follows the spiralStatePersistence.ts pattern:
 *   - Graceful fallback on error (returns null, conversation continues as MAIA core)
 *   - Single query, no cache (builds change rarely)
 *   - Never blocks oracle response
 */

import { query } from '@/lib/db/postgres';
import type { ResolvedMasterBuild, MasterBuildMetadata } from './types';

/**
 * Load the active build for a master by field slug.
 * Returns null if:
 *   - No master found for slug
 *   - Master exists but has no active build
 *   - Query fails (graceful degradation)
 *
 * When null is returned, the oracle continues with MAIA core only (no overlay).
 */
export async function loadActiveBuild(fieldSlug: string): Promise<ResolvedMasterBuild | null> {
  try {
    const result = await query<{
      id: string;
      master_id: string;
      build_version: string;
      voice_block: string;
      stance_block: string;
      knowledge_block: string;
      perceptual_block: string;
      method_block: string | null;
      safety_block: string | null;
      status: string;
      validation_notes: string | null;
      created_by: string | null;
      activated_by: string | null;
      created_at: string;
      activated_at: string | null;
      metadata: MasterBuildMetadata;
      master_slug: string;
      master_display_name: string;
    }>(
      `SELECT
        b.id,
        b.master_id,
        b.build_version,
        b.voice_block,
        b.stance_block,
        b.knowledge_block,
        b.perceptual_block,
        b.method_block,
        b.safety_block,
        b.status,
        b.validation_notes,
        b.created_by,
        b.activated_by,
        b.created_at,
        b.activated_at,
        b.metadata,
        m.slug AS master_slug,
        m.display_name AS master_display_name
      FROM master_builds b
      JOIN master_intelligence m ON m.id = b.master_id
      WHERE m.field_slug = $1
        AND m.status = 'active'
        AND b.status = 'active'
      LIMIT 1`,
      [fieldSlug]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      master_id: row.master_id,
      build_version: row.build_version,
      voice_block: row.voice_block,
      stance_block: row.stance_block,
      knowledge_block: row.knowledge_block,
      perceptual_block: row.perceptual_block,
      method_block: row.method_block ?? undefined,
      safety_block: row.safety_block ?? undefined,
      status: row.status as ResolvedMasterBuild['status'],
      validation_notes: row.validation_notes ?? undefined,
      created_by: row.created_by ?? undefined,
      activated_by: row.activated_by ?? undefined,
      created_at: row.created_at,
      activated_at: row.activated_at ?? undefined,
      metadata: row.metadata ?? { source_counts: {} },
      master_slug: row.master_slug,
      master_display_name: row.master_display_name,
    };
  } catch (error) {
    // Graceful fallback — if build loading fails, conversation continues as MAIA core
    console.warn('[master-build] Failed to load active build:', {
      fieldSlug,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
