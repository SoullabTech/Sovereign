import { query } from '@/lib/db/postgres';
import type {
  CompletionDimension,
  CompletionDimensionId,
  CompletionDimensionStanding,
} from './workCompletion';

const IDS: readonly CompletionDimensionId[] = [
  'editorial-integrity',
  'continuity',
  'recovery',
  'source-provenance',
  'permissions-rights',
  'page-proof',
  'front-back-matter',
  'publication-target',
] as const;

type Row = {
  dimension: CompletionDimensionId;
  standing: Exclude<CompletionDimensionStanding, 'not-run'>;
  note: string | null;
  created_at: string | Date;
};

export async function currentCompletionDimensions(
  memberId: string,
  manuscriptId: string,
): Promise<CompletionDimension[]> {
  try {
    const result = await query<Row>(
      `SELECT DISTINCT ON (dimension)
              dimension, standing, note, created_at
         FROM writer_studio_completion_checks
        WHERE member_id = $1 AND manuscript_id = $2
        ORDER BY dimension, created_at DESC, id DESC`,
      [memberId, manuscriptId],
    );
    const current = new Map(result.rows.map((row) => [row.dimension, row] as const));
    return IDS.map((id) => {
      const row = current.get(id);
      return row
        ? { id, standing: row.standing, ...(row.note ? { note: row.note } : {}) }
        : { id, standing: 'not-run' as const };
    });
  } catch (error) {
    if ((error as { code?: string })?.code === '42P01') {
      return IDS.map((id) => ({ id, standing: 'not-run' as const }));
    }
    throw error;
  }
}

export async function recordCompletionDimension(input: {
  memberId: string;
  manuscriptId: string;
  dimension: CompletionDimensionId;
  standing: 'clear' | 'open' | 'blocked';
  note?: string | null;
}): Promise<
  | { ok: true; dimension: CompletionDimension }
  | { ok: false; reason: 'not_found' | 'substrate_not_ready' }
> {
  try {
    const inserted = await query<Row>(
      `INSERT INTO writer_studio_completion_checks
         (member_id, manuscript_id, dimension, standing, note)
       SELECT $1, m.id, $3, $4, $5
         FROM member_manuscripts m
        WHERE m.id = $2 AND m.member_id = $1
       RETURNING dimension, standing, note, created_at`,
      [input.memberId, input.manuscriptId, input.dimension, input.standing, input.note?.trim() || null],
    );
    const row = inserted.rows[0];
    if (!row) return { ok: false, reason: 'not_found' };
    return {
      ok: true,
      dimension: {
        id: row.dimension,
        standing: row.standing,
        ...(row.note ? { note: row.note } : {}),
      },
    };
  } catch (error) {
    if ((error as { code?: string })?.code === '42P01') {
      return { ok: false, reason: 'substrate_not_ready' };
    }
    throw error;
  }
}
