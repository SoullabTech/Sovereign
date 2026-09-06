/**
 * WS2-07 · BUILD-07F — the standing write boundary and the current projection.
 *
 * THIS FILE WRITES EXACTLY ONE TABLE: `developmental_observation_standing_events`.
 * It never writes a reading, a manuscript, a section, a proposal or a thread; it
 * reads `developmental_readings` only to establish that the address it is being
 * asked to record against actually exists inside the frozen reading.
 *
 * WHERE COHERENCE IS ENFORCED (design §5). `reading_id` is foreign-keyed;
 * `observation_key` CANNOT be — observations live inside the reading's jsonb and
 * there is no row to reference. So the observation half of the address is
 * guarded HERE, at the write boundary, and not in the surface or the HTTP route:
 * a future internal caller must not be able to manufacture `reading R +
 * imaginary o27` by bypassing a UI check.
 *
 * OWNERSHIP IS IN THE PREDICATE (design §8, D1). `member_id` appears in the SQL
 * of every statement below, never as a filter applied after another member's row
 * has already been returned. Authentication supplies it; a request never does.
 * The owner is not derived from the reading's owner — those are different
 * claims, and the second breaks the day legitimate sharing arrives.
 *
 * TWO GUARDS THAT LOOK REDUNDANT AND ARE NOT (design §4):
 *
 *   SIMULTANEITY  two callers holding the SAME current token both compute the
 *                 next index; the UNIQUE constraint refuses the loser rather
 *                 than letting one act overwrite the other.
 *   STALENESS     a caller acting from an event that is no longer current
 *                 collides with nothing — its index is free — so the constraint
 *                 cannot see it. The CAS token does.
 *
 * ORDERING (design §4). The expected-current test runs BEFORE the same-value
 * no-op. A stale caller whose value happens to match the current standing must
 * be refused, not quietly told "unchanged" and thereby taught that its token
 * was current.
 *
 * NO AUTOMATIC RETRY. A refusal carries no fresh token. Retrying the loser would
 * make machine scheduling the ordering authority over two member acts.
 */

import { query } from '@/lib/db/postgres';
import type { Standing, StandingEvent, StandingRequest, StandingWriteResult } from './contract';

interface EventRow {
  id: string;
  observation_key: string;
  standing: Standing;
  event_index: number;
  recorded_at: Date;
}

const hydrate = (r: EventRow): StandingEvent => ({
  id: r.id,
  observationKey: r.observation_key,
  standing: r.standing,
  eventIndex: r.event_index,
  recordedAt: r.recorded_at.toISOString(),
});

/**
 * The current standing for every observation the member has ruled on in this
 * reading. An observation with NO row is UNSET and is simply absent — the
 * projection never invents a value for it, because there is no value to invent.
 *
 * The caller must distinguish a FAILED read from an empty one; this function
 * throws rather than returning `[]` on error, so absence of evidence from the
 * instrument cannot be read as evidence of absence in the object.
 */
export async function currentStandings(
  memberId: string, readingId: string,
): Promise<readonly StandingEvent[]> {
  const r = await query<EventRow>(
    `SELECT DISTINCT ON (observation_key)
            id, observation_key, standing, event_index, recorded_at
       FROM developmental_observation_standing_events
      WHERE member_id = $1 AND reading_id = $2
      ORDER BY observation_key, event_index DESC`,
    [memberId, readingId]);
  return r.rows.map(hydrate);
}

/** The current standing for one exact observation, or null when UNSET. */
export async function currentStanding(
  memberId: string, readingId: string, observationKey: string,
): Promise<StandingEvent | null> {
  const r = await query<EventRow>(
    `SELECT id, observation_key, standing, event_index, recorded_at
       FROM developmental_observation_standing_events
      WHERE member_id = $1 AND reading_id = $2 AND observation_key = $3
      ORDER BY event_index DESC
      LIMIT 1`,
    [memberId, readingId, observationKey]);
  const row = r.rows[0];
  return row ? hydrate(row) : null;
}

/**
 * Is this reading this member's, AND addressed under the Work it actually
 * belongs to? A reading is not addressable beneath a different manuscript — the
 * 07D reading route holds the same line. Absent and not-yours are one answer:
 * a caller learns nothing about another member's Work from the difference.
 *
 * This is the ROUTE's identity check. It does not replace `addressResolves`
 * below, which the write boundary performs independently so that an internal
 * caller bypassing the route cannot manufacture an address (design §5).
 */
export async function readingIsAddressable(
  memberId: string, manuscriptId: string, readingId: string,
): Promise<boolean> {
  const r = await query<{ one: number }>(
    `SELECT 1 AS one FROM developmental_readings
      WHERE id = $1 AND member_id = $2 AND manuscript_id = $3
      LIMIT 1`,
    [readingId, memberId, manuscriptId]);
  return r.rows.length === 1;
}

/**
 * Does this exact key resolve inside this exact frozen reading, owned by this
 * member? Ownership and resolution are established in ONE predicate so that a
 * reading belonging to someone else is indistinguishable from one that does not
 * exist, and an unresolvable key is never repaired to a nearby one.
 */
async function addressResolves(
  memberId: string, readingId: string, observationKey: string,
): Promise<'ok' | 'reading_unknown' | 'observation_unknown'> {
  const r = await query<{ resolves: boolean }>(
    `SELECT EXISTS (
              SELECT 1 FROM jsonb_array_elements(r.observations) o
               WHERE o->>'key' = $3
            ) AS resolves
       FROM developmental_readings r
      WHERE r.id = $1 AND r.member_id = $2
      LIMIT 1`,
    [readingId, memberId, observationKey]);
  const row = r.rows[0];
  if (!row) return 'reading_unknown';
  return row.resolves ? 'ok' : 'observation_unknown';
}

/**
 * Record a standing.
 *
 * The index allocation and the expected-current test happen INSIDE one
 * statement, carrying the `ask_turns` precedent: nothing is read, decided in
 * JavaScript, and then written back into a world that moved in between.
 */
export async function recordStanding(
  memberId: string, readingId: string, request: StandingRequest,
): Promise<StandingWriteResult> {
  const address = await addressResolves(memberId, readingId, request.observationKey);
  if (address !== 'ok') return { outcome: 'refused', reason: address };

  const params = [
    memberId, readingId, request.observationKey,
    request.expectedCurrentEventId, request.standing,
  ];

  let inserted: EventRow | undefined;
  try {
    const r = await query<EventRow>(
      `WITH cur AS (
         SELECT id, standing, event_index
           FROM developmental_observation_standing_events
          WHERE member_id = $1 AND reading_id = $2 AND observation_key = $3
          ORDER BY event_index DESC
          LIMIT 1
       )
       INSERT INTO developmental_observation_standing_events
         (member_id, reading_id, observation_key, event_index, standing)
       SELECT $1, $2, $3, coalesce((SELECT event_index FROM cur) + 1, 0), $5
        WHERE (SELECT id FROM cur)       IS NOT DISTINCT FROM $4::uuid
          AND (SELECT standing FROM cur) IS DISTINCT     FROM $5::text
       RETURNING id, observation_key, standing, event_index, recorded_at`,
      params);
    inserted = r.rows[0];
  } catch (e) {
    /* 23505 — another act took this index between the snapshot and the write.
       The unique constraint refused the loser; it did not overwrite anyone. */
    if ((e as { code?: string }).code === '23505') {
      return { outcome: 'refused', reason: 'simultaneous_write' };
    }
    throw e;
  }

  if (inserted) return { outcome: 'appended', event: hydrate(inserted) };

  /* Nothing was written. Exactly one of two things is true, and STALENESS IS
     TESTED FIRST: either the caller's token is not the current event, or the
     token was current and the value it asked for is the value already standing. */
  const current = await currentStanding(memberId, readingId, request.observationKey);
  const token = request.expectedCurrentEventId;
  if ((current?.id ?? null) !== token) return { outcome: 'refused', reason: 'stale_expectation' };
  /* Token current, no row inserted ⇒ the same standing was asked for twice. */
  return { outcome: 'unchanged', current: current as StandingEvent };
}
