/**
 * WORK-CONTEXT-FINGERPRINT-01
 *
 * Canonical baseline for a Living Work before a manuscript exists.
 *
 * It fingerprints only context that the Work-level conversation is permitted
 * to know without another disclosure act:
 *   - member-authored Work declarations
 *   - declared material relationships
 *   - material identity / label metadata
 *
 * ⛔ It does not hash Source bodies or Idea block prose. Those do not enter a
 * Work conversation merely because the material belongs to the Work.
 */
import { createHash } from 'node:crypto';
import { query } from '@/lib/db/postgres';

interface WorkRow {
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  manuscript_state: string | null;
}

interface MaterialRow {
  material_type: string;
  material_id: string;
  relationship_sentence: string | null;
  source_label: string | null;
  source_status: string | null;
  idea_label: string | null;
  idea_status: string | null;
}

export interface WorkContextFingerprintBasis {
  work: WorkRow;
  materials: readonly MaterialRow[];
}

export function digestWorkContextBasis(basis: WorkContextFingerprintBasis): string {
  return createHash('sha256').update(JSON.stringify({
    work: basis.work,
    materials: [...basis.materials].map((material) => ({
      materialType: material.material_type,
      materialId: material.material_id,
      relationshipSentence: material.relationship_sentence,
      sourceLabel: material.source_label,
      sourceStatus: material.source_status,
      ideaLabel: material.idea_label,
      ideaStatus: material.idea_status,
    })),
  }), 'utf8').digest('hex');
}

export async function workContextFingerprint(
  workId: string,
  memberId: string,
): Promise<string | null> {
  const work = await query<WorkRow>(
    `SELECT title, purpose, form, stage, manuscript_state
       FROM living_works
      WHERE id = $1 AND member_id = $2`,
    [workId, memberId],
  );
  if (work.rows.length !== 1) return null;

  const materials = await query<MaterialRow>(
    `SELECT m.material_type,
            m.material_id::text AS material_id,
            m.relationship_sentence,
            CASE WHEN m.material_type = 'source_upload' THEN u.original_name ELSE NULL END AS source_label,
            CASE WHEN m.material_type = 'source_upload' THEN u.transcription_status ELSE NULL END AS source_status,
            CASE WHEN m.material_type = 'idea' THEN i.title ELSE NULL END AS idea_label,
            CASE WHEN m.material_type = 'idea' THEN i.status ELSE NULL END AS idea_status
       FROM living_work_materials m
       LEFT JOIN workbench_uploads u
         ON m.material_type = 'source_upload'
        AND u.id::text = m.material_id
        AND u.arranger_id = $2
       LEFT JOIN member_ideas i
         ON m.material_type = 'idea'
        AND i.id::text = m.material_id
        AND i.member_id = $2
      WHERE m.living_work_id = $1
      ORDER BY m.material_type ASC, m.material_id ASC`,
    [workId, memberId],
  );

  return digestWorkContextBasis({
    work: work.rows[0]!,
    materials: materials.rows,
  });
}
