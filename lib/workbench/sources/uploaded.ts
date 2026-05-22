/**
 * Workbench source adapter for uploaded material.
 *
 * Reads from workbench_uploads. Only `transcription_status = 'reviewed'`
 * rows surface on the Shelf — drafts are deliberately invisible until the
 * arranger confirms them (Spec §5.3 review-before-indexing).
 *
 * Sanctuary filtering happens here, not later — once a sanctuary upload
 * leaves the adapter it could leak into card previews or graduation pipes.
 */

import { query } from '@/lib/db/postgres';
import type {
  WorkbenchSource,
  WorkbenchCardRef,
  WorkbenchSourceQuery,
  ResolvedCard,
} from './types';

interface UploadRow {
  id: string;
  original_name: string;
  transcription_reviewed: string | null;
  created_at: Date;
  mime_type: string;
  source_kind: string;
  sanctuary: boolean;
}

export const uploadedSource: WorkbenchSource = {
  kind: 'uploaded',

  async search(q: WorkbenchSourceQuery): Promise<WorkbenchCardRef[]> {
    const clauses: string[] = [
      'arranger_id = $1',
      `transcription_status = 'reviewed'`,
      'sanctuary = false',
    ];
    const params: unknown[] = [q.arrangerId];

    if (q.text && q.text.trim()) {
      params.push(q.text.trim());
      clauses.push(
        `to_tsvector('english', COALESCE(transcription_reviewed, '')) @@ plainto_tsquery('english', $${params.length})`,
      );
    }
    if (q.from) {
      params.push(q.from);
      clauses.push(`created_at >= $${params.length}`);
    }
    if (q.to) {
      params.push(q.to);
      clauses.push(`created_at <= $${params.length}`);
    }

    const sql = `
      SELECT id, original_name, transcription_reviewed, created_at
      FROM workbench_uploads
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT 200
    `;

    const result = await query<UploadRow>(sql, params);

    return result.rows.map((row) => ({
      source: 'uploaded' as const,
      ref: row.id,
      title: row.original_name,
      preview: (row.transcription_reviewed ?? '').slice(0, 140),
      createdAt: row.created_at.toISOString(),
    }));
  },

  async resolve(ref: string, arrangerId: string): Promise<ResolvedCard | null> {
    const result = await query<UploadRow>(
      `SELECT id, original_name, transcription_reviewed, created_at,
              mime_type, source_kind, sanctuary
       FROM workbench_uploads
       WHERE id = $1 AND arranger_id = $2`,
      [ref, arrangerId],
    );
    const row = result.rows[0];
    if (!row) return null;
    if (row.sanctuary) return null;

    return {
      content: row.transcription_reviewed ?? '',
      meta: {
        originalName: row.original_name,
        mimeType: row.mime_type,
        sourceKind: row.source_kind,
        createdAt: row.created_at.toISOString(),
      },
    };
  },
};
