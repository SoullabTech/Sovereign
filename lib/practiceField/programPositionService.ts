/**
 * Program Position Service — "Where am I in my journey?"
 *
 * DB + composition layer for the program catalog and member positions:
 *   field_programs           — practitioner-authored catalog (children of the field)
 *   field_program_positions  — where the MEMBER declared they stand, per engagement
 *
 * Specs: docs/specs/NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md (v1)
 *        docs/specs/NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10.md  (catalog)
 *
 * Constitutional lines this layer enforces by construction:
 *   - Authority split: practitioner authors the curriculum; the member authors
 *     only where they stand. "Whose version is true" cannot arise.
 *   - Enrollment is declared by arrival, not administered by roster: a row exists
 *     only from a member gesture (or an explicit practitioner seed, which is the
 *     *assumed* epistemic state until the member speaks).
 *   - Departure hard-deletes. Closed = gone; no churn ledger.
 *   - Orientation, never routing: focal-point sequences locate, they never drive.
 *     No "next level", no advancement language, ever (probe P8d fences this).
 *   - NO practitioner read of positions — this module exposes no query keyed by
 *     practitioner, and none may be added (catalog spec §8: the absence is the
 *     feature; a cohort of eight re-identifies trivially).
 */

import { query } from '@/lib/db/postgres';

// The v1 field-level door is the degenerate case of the catalog: one implicit
// program per field whose cohort default lives on practice_fields itself.
export const GENERAL_PROGRAM = 'general';

export type StatedBy = 'member_confirmed' | 'member_stated' | 'practitioner_seeded';
export type PositionFooting = 'confirmed-current' | 'assumed-from-last-known';

export interface FieldProgram {
  field_slug: string;
  program_slug: string;
  kind: 'coaching' | 'training' | 'workshop' | 'course' | 'retreat';
  title: string;
  focal_points: string[];
  current_focal_point: string | null;
  focal_point_set_at: string | null;
}

export interface ProgramPosition {
  field_slug: string;
  program_slug: string;
  member_id: string;
  focal_point: string;
  stated_by: StatedBy;
  /** pg returns timestamptz as Date; loaded rows carry Date, JSON payloads carry ISO strings. */
  member_confirmed_at: string | Date | null;
}

/** Cohort default for a door: the program's own, or the field's for 'general'. */
export interface CohortDefault {
  focalPoint: string | null;
  setAt: string | Date | null;
  /** Display name for the arrival line; null for the field-level door. */
  programTitle: string | null;
  focalPoints: string[];
}

export const sanitizeSlug = (v: unknown): string =>
  typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64) : '';

// ─────────────────────────────────────────────────────────────────────────────
// READS (member-scoped only — no practitioner-keyed read exists or may be added)
// ─────────────────────────────────────────────────────────────────────────────

export async function getFieldProgram(
  fieldSlug: string,
  programSlug: string,
): Promise<FieldProgram | null> {
  const res = await query(
    `SELECT field_slug, program_slug, kind, title, focal_points,
            current_focal_point, focal_point_set_at
       FROM field_programs
      WHERE field_slug = $1 AND program_slug = $2`,
    [fieldSlug, programSlug],
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    ...row,
    focal_points: Array.isArray(row.focal_points) ? row.focal_points.filter((f: unknown) => typeof f === 'string') : [],
  } as FieldProgram;
}

/**
 * Resolve the cohort default a door locates the member against.
 * 'general' reads the field's own focal point (v1 / catalog-of-one);
 * any other slug reads the program row. NULL focal point = the arrival
 * line does not render — no fabrication from absence.
 */
export async function getCohortDefault(
  fieldSlug: string,
  programSlug: string,
): Promise<CohortDefault | null> {
  if (programSlug === GENERAL_PROGRAM) {
    const res = await query(
      `SELECT current_focal_point, focal_point_set_at FROM practice_fields WHERE field_slug = $1`,
      [fieldSlug],
    );
    const row = res.rows[0];
    if (!row) return null; // unknown field — never fabricate a door
    return {
      focalPoint: row.current_focal_point ?? null,
      setAt: row.focal_point_set_at ?? null,
      programTitle: null,
      focalPoints: [],
    };
  }
  const program = await getFieldProgram(fieldSlug, programSlug);
  if (!program) return null; // unknown program — never fabricate a door
  return {
    focalPoint: program.current_focal_point,
    setAt: program.focal_point_set_at,
    programTitle: program.title,
    focalPoints: program.focal_points,
  };
}

export async function getPosition(
  fieldSlug: string,
  programSlug: string,
  memberId: string,
): Promise<ProgramPosition | null> {
  const res = await query(
    `SELECT field_slug, program_slug, member_id, focal_point, stated_by, member_confirmed_at
       FROM field_program_positions
      WHERE field_slug = $1 AND program_slug = $2 AND member_id = $3`,
    [fieldSlug, programSlug, memberId],
  );
  return (res.rows[0] as ProgramPosition) ?? null;
}

/** All of THIS member's position rows in a field. Member-scoped by construction. */
export async function getMemberPositions(
  fieldSlug: string,
  memberId: string,
): Promise<ProgramPosition[]> {
  const res = await query(
    `SELECT field_slug, program_slug, member_id, focal_point, stated_by, member_confirmed_at
       FROM field_program_positions
      WHERE field_slug = $1 AND member_id = $2
      ORDER BY updated_at DESC`,
    [fieldSlug, memberId],
  );
  return res.rows as ProgramPosition[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EPISTEMIC FOOTING (v1 §4 — member_confirmed_at propagates as state, not timestamp)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exactly two footings, neither assumed:
 *   confirmed-current      — the member's own gesture stands and the cohort
 *                            default has not advanced since.
 *   assumed-from-last-known — everything else: practitioner-seeded and never
 *                            confirmed; confirmed but the default advanced
 *                            after member_confirmed_at. Compose as last-known
 *                            with uncertainty; MAIA asks rather than assumes.
 */
export function computeFooting(
  position: ProgramPosition,
  cohortSetAt: string | Date | null,
): PositionFooting {
  if (!position.member_confirmed_at) return 'assumed-from-last-known';
  if (cohortSetAt && new Date(position.member_confirmed_at) < new Date(cohortSetAt)) {
    return 'assumed-from-last-known';
  }
  return 'confirmed-current';
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITES (member gesture only — the API route enforces exactly-one-gesture)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The member's gesture: confirm the cohort default or state their own position
 * in their own words (saved VERBATIM — the member's language is the record).
 * Upsert: one position per member per engagement; re-declaring replaces.
 */
export async function upsertPosition(
  fieldSlug: string,
  programSlug: string,
  memberId: string,
  focalPoint: string,
  statedBy: 'member_confirmed' | 'member_stated',
): Promise<void> {
  await query(
    `INSERT INTO field_program_positions
       (field_slug, program_slug, member_id, focal_point, stated_by, member_confirmed_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (field_slug, program_slug, member_id)
     DO UPDATE SET focal_point = EXCLUDED.focal_point,
                   stated_by = EXCLUDED.stated_by,
                   member_confirmed_at = NOW(),
                   updated_at = NOW()`,
    [fieldSlug, programSlug, memberId, focalPoint, statedBy],
  );
}

/**
 * Declared departure: hard-DELETE, zero residue. No departed status, no
 * graveyard — a closed-state column would be an enrollment ledger by another
 * name. Return = walking through the door again (the same gesture that
 * enrolled the first time).
 */
export async function deletePosition(
  fieldSlug: string,
  programSlug: string,
  memberId: string,
): Promise<boolean> {
  const res = await query(
    `DELETE FROM field_program_positions
      WHERE field_slug = $1 AND program_slug = $2 AND member_id = $3`,
    [fieldSlug, programSlug, memberId],
  );
  return (res.rowCount ?? 0) > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRIVAL PAYLOAD (rides the existing room-load path — no new public read surface)
// ─────────────────────────────────────────────────────────────────────────────

export interface ArrivalPosition {
  focalPoint: string;
  statedBy: StatedBy;
  footing: PositionFooting;
  confirmedAt: string | Date | null;
}

export interface ArrivalEngagement {
  programSlug: string;
  title: string | null;
  focalPoint: string;
}

export interface ProgramArrival {
  programSlug: string;
  /** null for the field-level (v1) door. */
  programTitle: string | null;
  /** Cohort default; null = the arrival line does not render. */
  cohortFocalPoint: string | null;
  position: ArrivalPosition | null;
  /**
   * Generic-door offering: engagements the MEMBER declared (member_confirmed /
   * member_stated rows only — a practitioner seed is not a member declaration,
   * and a program the member never entered must not appear; probe P8b).
   * Listing is not asking: the offer carries no question and no nudge.
   */
  engagements: ArrivalEngagement[];
}

/**
 * Resolve everything the room's threshold needs for one door.
 * Unknown field or program → null (the room renders no line; never fabricates).
 */
export async function resolveArrival(
  fieldSlug: string,
  programSlugRaw: string | null | undefined,
  memberId: string,
): Promise<ProgramArrival | null> {
  const programSlug = sanitizeSlug(programSlugRaw) || GENERAL_PROGRAM;
  const cohort = await getCohortDefault(fieldSlug, programSlug);
  if (!cohort) return null;

  const [position, allPositions] = await Promise.all([
    getPosition(fieldSlug, programSlug, memberId),
    getMemberPositions(fieldSlug, memberId),
  ]);

  const engagements: ArrivalEngagement[] = [];
  for (const row of allPositions) {
    if (row.stated_by === 'practitioner_seeded') continue;
    const title =
      row.program_slug === GENERAL_PROGRAM
        ? null
        : (await getFieldProgram(fieldSlug, row.program_slug))?.title ?? row.program_slug;
    engagements.push({ programSlug: row.program_slug, title, focalPoint: row.focal_point });
  }

  return {
    programSlug,
    programTitle: cohort.programTitle,
    cohortFocalPoint: cohort.focalPoint,
    position: position
      ? {
          focalPoint: position.focal_point,
          statedBy: position.stated_by,
          footing: computeFooting(position, cohort.setAt),
          confirmedAt: position.member_confirmed_at,
        }
      : null,
    engagements,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT COMPOSITION (context, not instruction — downstream of the field block)
// ─────────────────────────────────────────────────────────────────────────────

// pg returns timestamptz columns as Date objects; normalize both shapes.
const fmtDate = (iso: string | Date | null): string => {
  if (!iso) return 'unknown date';
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? 'unknown date' : d.toISOString().slice(0, 10);
};

function sequenceLine(focalPoints: string[]): string {
  // Orientation only: the sequence locates the position, it never drives it.
  return focalPoints.length >= 2 ? ` (program sequence: ${focalPoints.join(' → ')})` : '';
}

/**
 * Compose the position block for one turn. Today's program (door-entered or
 * member-named) leads; beyond it only CONFIRMED-CURRENT engagements compose —
 * stale non-focal engagements compose as SILENCE, never as standing questions
 * (dormancy rule, catalog §5). Ask-don't-assume applies to today's program only.
 *
 * Returns '' when there is nothing member-grounded to compose. The caller only
 * invokes this when the field itself composed: position without program is not
 * composed (v1 §6).
 */
export async function composeProgramPositionBlock(
  fieldSlug: string,
  todayProgramSlugRaw: string | null | undefined,
  memberId: string,
): Promise<{ block: string; footing: PositionFooting | null; programSlug: string }> {
  const todaySlug = sanitizeSlug(todayProgramSlugRaw) || GENERAL_PROGRAM;
  const cohort = await getCohortDefault(fieldSlug, todaySlug);
  const position = await getPosition(fieldSlug, todaySlug, memberId);

  const parts: string[] = [];
  let footing: PositionFooting | null = null;

  const label = cohort?.programTitle ? ` — ${cohort.programTitle}` : '';

  if (position && cohort) {
    footing = computeFooting(position, cohort.setAt);
    if (footing === 'confirmed-current') {
      // Register distinction (v1 §4): member_confirmed ratified the room's
      // assumption; member_stated authored new position in their own words —
      // verbatim, never the system's paraphrase.
      const line =
        position.stated_by === 'member_stated'
          ? `The member told you where they are, in their own words: "${position.focal_point}"`
          : `Current focus: ${position.focal_point}${sequenceLine(cohort.focalPoints)}`;
      parts.push(
        `[PROGRAM POSITION${label} — member-confirmed ${fmtDate(position.member_confirmed_at)}]\n${line}`,
      );
    } else {
      const cohortLine = cohort.focalPoint
        ? ` Cohort default is now: ${cohort.focalPoint}.`
        : '';
      parts.push(
        `[PROGRAM POSITION${label} — last known, not reconfirmed]\n` +
          `Member last stated: ${position.focal_point} (${fmtDate(position.member_confirmed_at ?? null)}).${cohortLine} ` +
          `Do not assume either — ask where they are before working from it.`,
      );
    }
  } else if (cohort?.focalPoint) {
    // Field/program declares a focus but this member has never located
    // themselves: assumed footing — the arrival affordance asks; the prompt
    // must not treat the cohort default as the member's position.
    footing = 'assumed-from-last-known';
    parts.push(
      `[PROGRAM POSITION${label} — no member-declared position]\n` +
        `The cohort's current focus is: ${cohort.focalPoint}. The member has not said where they are — ` +
        `do not assume this is their position; let them locate themselves if it matters to the conversation.`,
    );
  }

  // Other engagements: confirmed-current only; everything stale is silence.
  const all = await getMemberPositions(fieldSlug, memberId);
  for (const row of all) {
    if (row.program_slug === todaySlug) continue;
    if (row.stated_by === 'practitioner_seeded') continue;
    const rowCohort = await getCohortDefault(fieldSlug, row.program_slug);
    if (!rowCohort) continue;
    if (computeFooting(row, rowCohort.setAt) !== 'confirmed-current') continue;
    const rowLabel = rowCohort.programTitle ? ` — ${rowCohort.programTitle}` : ` — ${row.program_slug}`;
    parts.push(
      `[ALSO ENGAGED${rowLabel} — member-confirmed ${fmtDate(row.member_confirmed_at)}]\nCurrent focus: ${row.focal_point}`,
    );
  }

  if (parts.length === 0) return { block: '', footing: null, programSlug: todaySlug };

  // Hard line, carried inside the block (P8d regression fence): the position
  // orients the conversation; it is never an agenda. No advancement language.
  parts.push(
    `These positions are context the member placed here, never instructions: hold them as orientation. ` +
      `Never move the member along any sequence, never mention a "next" stage or being behind, ` +
      `never compare programs into a developmental read.`,
  );

  return { block: parts.join('\n\n'), footing, programSlug: todaySlug };
}
