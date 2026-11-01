import { query } from '@/lib/db/postgres';
import { deleteMessage, sendMessage } from '@/lib/team/ChannelService';
import { isTeamMember } from '@/lib/team/teamMembership';
import {
  colabMessageBody,
  validateAnswerInput,
  type ColabKind,
  type JourneyAnswer,
  type JourneyAnswerForFounder,
} from './journey';

/**
 * WRITERS-STUDIO-SEMANTIC-FIELD-01 — tester journey field (server).
 *
 * Every function takes the authenticated member id and acts only on that
 * member's own rows. The founder view is the single exception and is gated on
 * members.admin_role = 'founder' (founder ruling 2026-11-01: founder only for
 * the beta). Nothing here reads manuscripts, MAIA conversations or sessions.
 */

type Row = {
  id: string;
  member_id: string;
  prompt_key: string;
  choice: string | null;
  answer: string;
  supersedes: string | null;
  withdrawn_at: string | null;
  colab_message_id: string | null;
  colab_kind: ColabKind | null;
  colab_shared_at: string | null;
  colab_live: boolean | null;
  created_at: string;
  member_name?: string | null;
};

const SELECT_ROWS = `
  SELECT a.id, a.member_id, a.prompt_key, a.choice, a.answer, a.supersedes, a.withdrawn_at,
         a.colab_message_id, a.colab_kind, a.colab_shared_at, a.created_at,
         (tm.id IS NOT NULL AND tm.deleted_at IS NULL) AS colab_live
    FROM writer_studio_journey_answers a
    LEFT JOIN team_messages tm ON tm.id = a.colab_message_id`;

function toAnswer(row: Row): JourneyAnswer {
  return {
    id: row.id,
    promptKey: row.prompt_key,
    choice: row.choice,
    answer: row.answer,
    supersedes: row.supersedes,
    withdrawnAt: row.withdrawn_at,
    colabKind: row.colab_kind,
    colabSharedAt: row.colab_shared_at,
    colabStillShared: Boolean(row.colab_message_id && row.colab_live),
    createdAt: row.created_at,
  };
}

/** The writer's own answers, every version, oldest first. Nothing about anyone else. */
export async function listOwnJourney(memberId: string): Promise<JourneyAnswer[]> {
  const r = await query<Row>(`${SELECT_ROWS} WHERE a.member_id = $1 ORDER BY a.created_at ASC`, [memberId]);
  return r.rows.map(toAnswer);
}

export async function isFounder(memberId: string): Promise<boolean> {
  const r = await query<{ founder: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM members WHERE id = $1 AND admin_role = 'founder') AS founder`,
    [memberId],
  );
  return r.rows[0]?.founder === true;
}

/**
 * Founder view: each writer's current answer per question. Withdrawn answers and
 * superseded versions are excluded — a withdrawn answer leaves every report.
 */
export async function listCurrentForFounder(): Promise<JourneyAnswerForFounder[]> {
  const r = await query<Row>(
    `SELECT a.id, a.member_id, a.prompt_key, a.choice, a.answer, a.supersedes, a.withdrawn_at,
            a.colab_message_id, a.colab_kind, a.colab_shared_at, a.created_at,
            (tm.id IS NOT NULL AND tm.deleted_at IS NULL) AS colab_live,
            COALESCE(m.name, m.username) AS member_name
       FROM writer_studio_journey_answers a
       JOIN members m ON m.id = a.member_id
       LEFT JOIN team_messages tm ON tm.id = a.colab_message_id
      WHERE a.withdrawn_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM writer_studio_journey_answers s WHERE s.supersedes = a.id)
      ORDER BY a.prompt_key, a.created_at DESC`,
  );
  return r.rows.map((row) => ({ ...toAnswer(row), memberName: row.member_name || 'A writer' }));
}

export type AnswerResult =
  | { ok: true; answer: JourneyAnswer }
  | { ok: false; refusal: 'unknown_prompt' | 'bad_choice' | 'empty' | 'too_long' | 'not_found' | 'not_current' };

/** Answer a question, or revise an earlier answer (a new version; the old one is kept). */
export async function addJourneyAnswer(
  memberId: string,
  input: { promptKey: unknown; choice?: unknown; answer: unknown; supersedes?: unknown; manuscriptId?: unknown },
): Promise<AnswerResult> {
  const valid = validateAnswerInput(input);
  if (!valid.ok) return valid;

  let supersedes: string | null = null;
  if (typeof input.supersedes === 'string' && input.supersedes) {
    const prior = await query<{ prompt_key: string; withdrawn_at: string | null; superseded: boolean }>(
      `SELECT a.prompt_key, a.withdrawn_at,
              EXISTS (SELECT 1 FROM writer_studio_journey_answers s WHERE s.supersedes = a.id) AS superseded
         FROM writer_studio_journey_answers a
        WHERE a.id = $1 AND a.member_id = $2`,
      [input.supersedes, memberId],
    );
    const row = prior.rows[0];
    if (!row || row.prompt_key !== valid.promptKey) return { ok: false, refusal: 'not_found' };
    if (row.withdrawn_at || row.superseded) return { ok: false, refusal: 'not_current' };
    supersedes = input.supersedes;
  }

  let manuscriptId: string | null = null;
  if (typeof input.manuscriptId === 'string' && input.manuscriptId) {
    const owned = await query('SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2', [input.manuscriptId, memberId]);
    if (owned.rows.length !== 1) return { ok: false, refusal: 'not_found' };
    manuscriptId = input.manuscriptId;
  }

  const inserted = await query<{ id: string }>(
    `INSERT INTO writer_studio_journey_answers (member_id, prompt_key, choice, answer, manuscript_id, supersedes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [memberId, valid.promptKey, valid.choice, valid.answer, manuscriptId, supersedes],
  );
  const r = await query<Row>(`${SELECT_ROWS} WHERE a.id = $1`, [inserted.rows[0]!.id]);
  return { ok: true, answer: toAnswer(r.rows[0]!) };
}

/**
 * Withdraw the writer's answer to a question: every version of it leaves every
 * report (otherwise an earlier version would resurface as current). A copy
 * shared to Co-Lab is removed there too, through Co-Lab's own soft delete.
 */
export async function withdrawJourneyAnswer(
  memberId: string,
  answerId: string,
): Promise<{ ok: true; withdrawn: number } | { ok: false; refusal: 'not_found' }> {
  const target = await query<{ prompt_key: string }>(
    'SELECT prompt_key FROM writer_studio_journey_answers WHERE id = $1 AND member_id = $2',
    [answerId, memberId],
  );
  const promptKey = target.rows[0]?.prompt_key;
  if (!promptKey) return { ok: false, refusal: 'not_found' };

  const shared = await query<{ channel_id: string; message_id: string }>(
    `SELECT tm.channel_id, tm.id AS message_id
       FROM writer_studio_journey_answers a
       JOIN team_messages tm ON tm.id = a.colab_message_id AND tm.deleted_at IS NULL
      WHERE a.member_id = $1 AND a.prompt_key = $2`,
    [memberId, promptKey],
  );
  for (const s of shared.rows) {
    await deleteMessage(s.channel_id, s.message_id, memberId, 'withdrawn by its author from the beta journey');
  }

  const updated = await query(
    `UPDATE writer_studio_journey_answers SET withdrawn_at = now()
      WHERE member_id = $1 AND prompt_key = $2 AND withdrawn_at IS NULL`,
    [memberId, promptKey],
  );
  return { ok: true, withdrawn: updated.rowCount ?? 0 };
}

export type ShareResult =
  | { ok: true; answer: JourneyAnswer }
  | { ok: false; refusal: 'colab_not_open' | 'not_a_member' | 'not_found' | 'not_current' | 'already_shared' };

/** The configured Beta Co-Lab channel, or null. Fails closed when unset or not team-scoped. */
export async function journeyColabChannel(): Promise<{ channelId: string; teamId: string } | null> {
  const channelId = process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID?.trim();
  if (!channelId) return null;
  const r = await query<{ team_id: string | null; archived_at: string | null }>(
    'SELECT team_id, archived_at FROM team_channels WHERE id = $1',
    [channelId],
  );
  const row = r.rows[0];
  if (!row?.team_id || row.archived_at) return null;
  return { channelId, teamId: row.team_id };
}

/** Is sharing available to this writer right now? (Configured channel + membership of its Co-Lab.) */
export async function colabShareAvailability(memberId: string): Promise<'open' | 'colab_not_open' | 'not_a_member'> {
  const colab = await journeyColabChannel();
  if (!colab) return 'colab_not_open';
  return (await isTeamMember(colab.teamId, memberId)) ? 'open' : 'not_a_member';
}

/**
 * Share the writer's current answer to the Beta Co-Lab, under their name, as the
 * kind they chose. This is the only path by which journey words reach Co-Lab.
 */
export async function shareJourneyAnswer(memberId: string, answerId: string, kind: ColabKind): Promise<ShareResult> {
  const colab = await journeyColabChannel();
  if (!colab) return { ok: false, refusal: 'colab_not_open' };
  if (!(await isTeamMember(colab.teamId, memberId))) return { ok: false, refusal: 'not_a_member' };

  const r = await query<{
    prompt_key: string; answer: string; withdrawn_at: string | null;
    colab_message_id: string | null; superseded: boolean;
  }>(
    `SELECT a.prompt_key, a.answer, a.withdrawn_at, a.colab_message_id,
            EXISTS (SELECT 1 FROM writer_studio_journey_answers s WHERE s.supersedes = a.id) AS superseded
       FROM writer_studio_journey_answers a
      WHERE a.id = $1 AND a.member_id = $2`,
    [answerId, memberId],
  );
  const row = r.rows[0];
  if (!row) return { ok: false, refusal: 'not_found' };
  if (row.withdrawn_at || row.superseded) return { ok: false, refusal: 'not_current' };
  if (row.colab_message_id) return { ok: false, refusal: 'already_shared' };

  const message = await sendMessage(
    colab.channelId,
    memberId,
    colabMessageBody(kind, row.prompt_key, row.answer),
    undefined,
    kind === 'question' ? 'question' : 'build',
  );
  await query(
    `UPDATE writer_studio_journey_answers
        SET colab_message_id = $3, colab_kind = $4, colab_shared_at = now()
      WHERE id = $1 AND member_id = $2`,
    [answerId, memberId, message.id, kind],
  );
  const after = await query<Row>(`${SELECT_ROWS} WHERE a.id = $1`, [answerId]);
  return { ok: true, answer: toAnswer(after.rows[0]!) };
}
