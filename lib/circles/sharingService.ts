/**
 * Sharing Service — The sovereignty seam
 *
 * Enforces consent before any share. Only the sharing member
 * can revoke their own artifacts. Revocation does not touch
 * the original source item.
 */

import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import type { SharedArtifactRow, ContentMode } from './types';

export interface ShareArtifactInput {
  circleId: string;
  memberId: string;
  artifactType: string;
  artifactRef: string;
  contentMode: ContentMode;
  sharedTitle?: string | null;
  sharedSummary?: string | null;
  sharedText?: string | null;
}

/**
 * Share an artifact into a circle.
 *
 * CONSENT ENFORCEMENT: membership must exist AND consent_mode must be 'manual'.
 * Throws CONSENT_REQUIRED if member has not consented.
 */
export async function shareArtifact(input: ShareArtifactInput) {
  const { membership } = await getCircleWithMembership(input.circleId, input.memberId);

  // Non-negotiable consent check
  if (membership.consent_mode !== 'manual') {
    throw new Error('CONSENT_REQUIRED');
  }

  if (input.contentMode === 'full_text' && !input.sharedText) {
    throw new Error('FULL_TEXT_REQUIRES_TEXT');
  }

  const result = await queryOne<SharedArtifactRow>(
    `INSERT INTO shared_artifacts
      (circle_id, shared_by, artifact_type, artifact_ref, content_mode, shared_title, shared_summary, shared_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, created_at`,
    [
      input.circleId,
      input.memberId,
      input.artifactType,
      input.artifactRef,
      input.contentMode,
      input.sharedTitle ?? null,
      input.sharedSummary ?? null,
      input.contentMode === 'full_text' ? (input.sharedText ?? null) : null,
    ]
  );

  return result;
}

/**
 * Revoke a shared artifact. Owner-only.
 * Sets revoked_at — does NOT delete the original source item.
 */
export async function revokeArtifact(artifactId: string, memberId: string) {
  const result = await queryOne(
    `UPDATE shared_artifacts
     SET revoked_at = NOW()
     WHERE id = $1 AND shared_by = $2 AND revoked_at IS NULL
     RETURNING id`,
    [artifactId, memberId]
  );

  if (!result) {
    throw new Error('NOT_FOUND');
  }

  return true;
}

/**
 * List the shared feed for a circle.
 * Requires active membership. Excludes revoked items.
 */
export async function listFeed(circleId: string, memberId: string) {
  await getCircleWithMembership(circleId, memberId);

  const result = await query(
    `SELECT
      sa.id, sa.created_at, sa.circle_id, sa.shared_by,
      sa.artifact_type, sa.artifact_ref, sa.content_mode,
      sa.shared_title, sa.shared_summary,
      m.name AS sharer_name
     FROM shared_artifacts sa
     LEFT JOIN members m ON m.id = sa.shared_by
     WHERE sa.circle_id = $1 AND sa.revoked_at IS NULL
     ORDER BY sa.created_at DESC
     LIMIT 100`,
    [circleId]
  );

  return result.rows;
}
