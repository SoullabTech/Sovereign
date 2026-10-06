import { query } from '@/lib/db/postgres';
import {
  workDirectiveContext,
  type WorkDirective,
  type WorkDirectiveEvent,
  type WorkDirectiveKind,
} from './workDirectives';

type DirectiveRow = {
  id: string;
  living_work_id: string;
  kind: WorkDirectiveKind;
  initial_text: string;
  created_at: Date | string;
  last_event: WorkDirectiveEvent | null;
  revised_text: string | null;
  last_changed_at: Date | string | null;
};

const SELECT_DIRECTIVES = [
  'SELECT d.id, d.living_work_id, d.kind, d.initial_text, d.created_at,',
  '       latest.event_type AS last_event,',
  '       latest_revision.text AS revised_text,',
  '       COALESCE(latest.created_at, d.created_at) AS last_changed_at',
  '  FROM writer_studio_work_directives d',
  '  LEFT JOIN LATERAL (',
  '    SELECT e.event_type, e.created_at',
  '      FROM writer_studio_work_directive_events e',
  '     WHERE e.directive_id = d.id',
  '     ORDER BY e.created_at DESC, e.id DESC',
  '     LIMIT 1',
  '  ) latest ON true',
  '  LEFT JOIN LATERAL (',
  '    SELECT e.text',
  '      FROM writer_studio_work_directive_events e',
  "     WHERE e.directive_id = d.id AND e.event_type = 'revise'",
  '     ORDER BY e.created_at DESC, e.id DESC',
  '     LIMIT 1',
  '  ) latest_revision ON true',
].join('\n');

const shape = (row: DirectiveRow): WorkDirective => ({
  id: row.id,
  workId: row.living_work_id,
  kind: row.kind,
  text: row.revised_text ?? row.initial_text,
  active: row.last_event !== 'retire',
  createdAt: new Date(row.created_at).toISOString(),
  lastChangedAt: new Date(row.last_changed_at ?? row.created_at).toISOString(),
});

export async function listWorkDirectives(
  memberId: string,
  workId: string,
): Promise<WorkDirective[]> {
  try {
    const sql = SELECT_DIRECTIVES
      + '\n WHERE d.member_id = $1 AND d.living_work_id = $2'
      + '\n ORDER BY d.created_at ASC, d.id ASC';
    const rows = await query<DirectiveRow>(sql, [memberId, workId]);
    return rows.rows.map(shape);
  } catch (error) {
    if ((error as { code?: string })?.code === '42P01') return [];
    throw error;
  }
}

export async function createWorkDirective(input: {
  memberId: string;
  workId: string;
  kind: WorkDirectiveKind;
  text: string;
}): Promise<
  | { ok: true; directiveId: string }
  | { ok: false; refusal: 'invalid_text' | 'not_found' }
> {
  const text = input.text.trim();
  if (text.length < 1 || text.length > 4000) {
    return { ok: false, refusal: 'invalid_text' };
  }

  const sql = [
    'INSERT INTO writer_studio_work_directives',
    '  (member_id, living_work_id, kind, initial_text)',
    'SELECT $1, w.id, $3, $4',
    '  FROM living_works w',
    ' WHERE w.id = $2 AND w.member_id = $1',
    'RETURNING id',
  ].join('\n');

  const inserted = await query<{ id: string }>(
    sql,
    [input.memberId, input.workId, input.kind, text],
  );
  const id = inserted.rows[0]?.id;
  return id
    ? { ok: true, directiveId: id }
    : { ok: false, refusal: 'not_found' };
}

export async function appendWorkDirectiveEvent(input: {
  memberId: string;
  workId: string;
  directiveId: string;
  event: WorkDirectiveEvent;
  text?: string;
}): Promise<
  | { ok: true }
  | { ok: false; refusal: 'invalid_text' | 'not_found' }
> {
  const revisedText = input.event === 'revise'
    ? input.text?.trim() ?? ''
    : null;
  if (
    input.event === 'revise'
    && (revisedText === null || revisedText.length < 1 || revisedText.length > 4000)
  ) {
    return { ok: false, refusal: 'invalid_text' };
  }

  const sql = [
    'INSERT INTO writer_studio_work_directive_events',
    '  (directive_id, member_id, event_type, text)',
    'SELECT d.id, d.member_id, $4, $5',
    '  FROM writer_studio_work_directives d',
    ' WHERE d.id = $3 AND d.member_id = $1 AND d.living_work_id = $2',
    'RETURNING id',
  ].join('\n');

  const inserted = await query<{ id: string }>(
    sql,
    [input.memberId, input.workId, input.directiveId, input.event, revisedText],
  );
  return inserted.rows.length === 1
    ? { ok: true }
    : { ok: false, refusal: 'not_found' };
}

export async function workDirectiveContextForWork(
  memberId: string,
  workId: string,
): Promise<string> {
  return workDirectiveContext(await listWorkDirectives(memberId, workId));
}
