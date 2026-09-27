/**
 * D5C2 — durable Work Theme identity and member governance.
 *
 * A frozen Themes reading is MAIA's immutable observation. A Work Theme is a
 * separate governable identity. We mint that identity only when the member
 * declares a theme or acts on a MAIA candidate.
 */
import { query, transaction } from '@/lib/db/postgres';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import { validateThemeClaim } from '@/lib/manuscript/developmentalReader/themes';

export type WorkThemeProvenance =
  | 'member-declared'
  | 'template-selected'
  | 'textual-entity'
  | 'maia-observation';

export type WorkThemeStanding = 'candidate' | 'accepted' | 'rejected';
export type WorkThemeEvent = 'accept' | 'rename' | 'reject' | 'restore';

export interface WorkTheme {
  id: string;
  manuscriptId: string;
  provenance: WorkThemeProvenance;
  initialLabel: string;
  currentLabel: string;
  standing: WorkThemeStanding;
  sourceReadingId: string | null;
  sourceObservationId: string | null;
  templateName: string | null;
  createdAt: string;
}

interface ThemeRow {
  id: string;
  manuscript_id: string;
  provenance_kind: WorkThemeProvenance;
  initial_label: string;
  source_reading_id: string | null;
  source_observation_id: string | null;
  template_name: string | null;
  created_at: Date | string;
  last_event: WorkThemeEvent | null;
  renamed_label: string | null;
}

const cleanLabel = (value: string): string | null => {
  const label = value.trim();
  return label.length >= 1 && label.length <= 120 ? label : null;
};

function standingOf(row: ThemeRow): WorkThemeStanding {
  if (row.last_event === 'reject') return 'rejected';
  if (row.last_event === 'accept' || row.last_event === 'rename' || row.last_event === 'restore') {
    return 'accepted';
  }
  return row.provenance_kind === 'member-declared' || row.provenance_kind === 'template-selected'
    ? 'accepted'
    : 'candidate';
}

const asTheme = (row: ThemeRow): WorkTheme => ({
  id: row.id,
  manuscriptId: row.manuscript_id,
  provenance: row.provenance_kind,
  initialLabel: row.initial_label,
  currentLabel: row.renamed_label ?? row.initial_label,
  standing: standingOf(row),
  sourceReadingId: row.source_reading_id,
  sourceObservationId: row.source_observation_id,
  templateName: row.template_name,
  createdAt: new Date(row.created_at).toISOString(),
});

const THEME_SELECT = `
  SELECT t.id, t.manuscript_id, t.provenance_kind, t.initial_label,
         t.source_reading_id, t.source_observation_id, t.template_name, t.created_at,
         last_event.event_type AS last_event,
         last_rename.label AS renamed_label
    FROM writer_studio_work_themes t
    LEFT JOIN LATERAL (
      SELECT e.event_type
        FROM writer_studio_work_theme_events e
       WHERE e.theme_id = t.id
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT 1
    ) last_event ON true
    LEFT JOIN LATERAL (
      SELECT e.label
        FROM writer_studio_work_theme_events e
       WHERE e.theme_id = t.id AND e.event_type = 'rename'
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT 1
    ) last_rename ON true
`;

export async function listWorkThemes(memberId: string, manuscriptId: string): Promise<WorkTheme[]> {
  const rows = await query<ThemeRow>(
    `${THEME_SELECT}
      WHERE t.member_id = $1 AND t.manuscript_id = $2
      ORDER BY t.created_at ASC, t.id ASC`,
    [memberId, manuscriptId],
  );
  return rows.rows.map(asTheme);
}

export async function declareMemberTheme(input: {
  memberId: string;
  manuscriptId: string;
  label: string;
}): Promise<{ ok: true; themeId: string } | { ok: false; refusal: 'invalid_label' | 'not_found' }> {
  const label = cleanLabel(input.label);
  if (!label) return { ok: false, refusal: 'invalid_label' };

  const inserted = await query<{ id: string }>(
    `INSERT INTO writer_studio_work_themes
       (member_id, manuscript_id, provenance_kind, initial_label)
     SELECT $1, m.id, 'member-declared', $3
       FROM member_manuscripts m
      WHERE m.id = $2 AND m.member_id = $1
     RETURNING id`,
    [input.memberId, input.manuscriptId, label],
  );
  const id = inserted.rows[0]?.id;
  return id ? { ok: true, themeId: id } : { ok: false, refusal: 'not_found' };
}

export async function governMaiaThemeCandidate(input: {
  memberId: string;
  manuscriptId: string;
  readingId: string;
  observationId: string;
  action: WorkThemeEvent;
  label?: string;
}): Promise<
  | { ok: true; themeId: string }
  | { ok: false; refusal: 'not_found' | 'not_theme_candidate' | 'invalid_label' }
> {
  const reading = await loadReading(input.readingId, input.memberId);
  if (!reading || reading.manuscriptId !== input.manuscriptId) {
    return { ok: false, refusal: 'not_found' };
  }
  if (reading.scope.commissionedLens !== 'themes' || reading.outcome !== 'reading') {
    return { ok: false, refusal: 'not_theme_candidate' };
  }
  const observation = reading.observations.find((o) => o.observationId === input.observationId);
  if (!observation?.themeLabel?.trim()) {
    return { ok: false, refusal: 'not_theme_candidate' };
  }
  const lawfulTheme = validateThemeClaim(observation.themeLabel, observation.evidenceRefs);
  if (!lawfulTheme.ok) {
    return { ok: false, refusal: 'not_theme_candidate' };
  }

  const renameLabel = input.action === 'rename' ? cleanLabel(input.label ?? '') : null;
  if (input.action === 'rename' && !renameLabel) {
    return { ok: false, refusal: 'invalid_label' };
  }

  return transaction(async (client) => {
    const created = await client.query<{ id: string }>(
      `INSERT INTO writer_studio_work_themes
         (member_id, manuscript_id, provenance_kind, initial_label,
          source_reading_id, source_observation_id)
       VALUES ($1, $2, 'maia-observation', $3, $4, $5)
       ON CONFLICT (member_id, manuscript_id, source_reading_id, source_observation_id)
         WHERE provenance_kind = 'maia-observation'
       DO NOTHING
       RETURNING id`,
      [input.memberId, input.manuscriptId, observation.themeLabel.trim(), input.readingId, input.observationId],
    );

    let themeId = created.rows[0]?.id;
    if (!themeId) {
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM writer_studio_work_themes
          WHERE member_id = $1 AND manuscript_id = $2
            AND provenance_kind = 'maia-observation'
            AND source_reading_id = $3 AND source_observation_id = $4`,
        [input.memberId, input.manuscriptId, input.readingId, input.observationId],
      );
      themeId = existing.rows[0]?.id;
    }
    if (!themeId) throw new Error('theme identity admission failed');

    await client.query(
      `INSERT INTO writer_studio_work_theme_events
         (theme_id, member_id, event_type, label)
       VALUES ($1, $2, $3, $4)`,
      [themeId, input.memberId, input.action, input.action === 'rename' ? renameLabel : null],
    );

    return { ok: true as const, themeId };
  });
}

export async function governWorkTheme(input: {
  memberId: string;
  manuscriptId: string;
  themeId: string;
  action: WorkThemeEvent;
  label?: string;
}): Promise<{ ok: true } | { ok: false; refusal: 'not_found' | 'invalid_label' }> {
  const renameLabel = input.action === 'rename' ? cleanLabel(input.label ?? '') : null;
  if (input.action === 'rename' && !renameLabel) {
    return { ok: false, refusal: 'invalid_label' };
  }

  const inserted = await query<{ id: string }>(
    `INSERT INTO writer_studio_work_theme_events
       (theme_id, member_id, event_type, label)
     SELECT t.id, t.member_id, $4, $5
       FROM writer_studio_work_themes t
      WHERE t.id = $3 AND t.member_id = $1 AND t.manuscript_id = $2
     RETURNING id`,
    [
      input.memberId,
      input.manuscriptId,
      input.themeId,
      input.action,
      input.action === 'rename' ? renameLabel : null,
    ],
  );
  return inserted.rows.length === 1 ? { ok: true } : { ok: false, refusal: 'not_found' };
}
