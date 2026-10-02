import { query } from '@/lib/db/postgres';
import { writerUnderstandingContext, type WriterUnderstanding } from './writerUnderstanding';

type Row = {
  work_id: string;
  purpose: string | null;
  becoming: string | null;
  preserve: unknown;
  reader_relationship: string | null;
  central_ideas: unknown;
  voice_cadence: string | null;
  intentional_ambiguity: unknown;
  challenge_me_on: unknown;
  non_negotiables: unknown;
  unresolved_intentions: unknown;
  updated_at: string | null;
};

const arr = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((x): x is string => typeof x === 'string') : [];

const isUndefinedTable = (error: unknown): boolean =>
  (error as { code?: string })?.code === '42P01';

function shape(row: Row): WriterUnderstanding {
  return {
    workId: row.work_id,
    workPurpose: row.purpose,
    becoming: row.becoming,
    preserve: arr(row.preserve),
    readerRelationship: row.reader_relationship,
    centralIdeas: arr(row.central_ideas),
    voiceCadence: row.voice_cadence,
    intentionalAmbiguity: arr(row.intentional_ambiguity),
    challengeMeOn: arr(row.challenge_me_on),
    nonNegotiables: arr(row.non_negotiables),
    unresolvedIntentions: arr(row.unresolved_intentions),
    updatedAt: row.updated_at,
  };
}

export async function writerUnderstandingForManuscript(
  memberId: string,
  manuscriptId: string,
): Promise<WriterUnderstanding | null> {
  try {
    const rows = await query<Row>(
      `SELECT w.id AS work_id, w.purpose,
              u.becoming, u.preserve, u.reader_relationship, u.central_ideas,
              u.voice_cadence, u.intentional_ambiguity, u.challenge_me_on,
              u.non_negotiables, u.unresolved_intentions, u.updated_at
         FROM living_work_expressions e
         JOIN living_works w ON w.id = e.living_work_id AND w.member_id = $1
         LEFT JOIN living_work_writer_understanding u
           ON u.living_work_id = w.id AND u.member_id = w.member_id
        WHERE e.expression_type = 'manuscript' AND e.expression_id = $2
        ORDER BY w.id`,
      [memberId, manuscriptId],
    );
    if (rows.rows.length !== 1) return null;
    return shape(rows.rows[0]!);
  } catch (error) {
    // Migrate-before-swap compatibility: absence of the additive writer-
    // understanding table means "no declared understanding yet", not a broken
    // Work/Ask lane. Every other database failure remains visible.
    if (isUndefinedTable(error)) return null;
    throw error;
  }
}

export async function writerUnderstandingContextForManuscript(
  memberId: string,
  manuscriptId: string,
): Promise<string> {
  return writerUnderstandingContext(await writerUnderstandingForManuscript(memberId, manuscriptId));
}

export async function writerUnderstandingForWork(
  memberId: string,
  workId: string,
): Promise<WriterUnderstanding | null> {
  try {
    const rows = await query<Row>(
      `SELECT w.id AS work_id, w.purpose,
              u.becoming, u.preserve, u.reader_relationship, u.central_ideas,
              u.voice_cadence, u.intentional_ambiguity, u.challenge_me_on,
              u.non_negotiables, u.unresolved_intentions, u.updated_at
         FROM living_works w
         LEFT JOIN living_work_writer_understanding u
           ON u.living_work_id = w.id AND u.member_id = w.member_id
        WHERE w.id = $1 AND w.member_id = $2`,
      [workId, memberId],
    );
    if (rows.rows.length !== 1) return null;
    return shape(rows.rows[0]!);
  } catch (error) {
    if (isUndefinedTable(error)) return null;
    throw error;
  }
}

export async function writerUnderstandingContextForWork(
  memberId: string,
  workId: string,
): Promise<string> {
  return writerUnderstandingContext(await writerUnderstandingForWork(memberId, workId));
}
