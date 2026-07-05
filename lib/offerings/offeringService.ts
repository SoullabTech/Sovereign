/**
 * Offerings v0 — the smallest truthful member-offering experiment.
 *
 * Member-gated (any member may create an offering), not practitioner-gated.
 * No categories, ratings, endorsements, search, directory, or ranking.
 * No system-authored meaning: no auto-tagging, no inferred metadata, no
 * classification. The member's own words are the only content.
 *
 * Signals fire automatically via the Observation Primitive (emitSignal);
 * nothing here writes to the observations or recognitions tables.
 */

import { query } from '@/lib/db/postgres';
import { emitSignal } from '@/lib/observation/observationService';

export type OfferingAvailability = 'active' | 'seasonal' | 'paused';
export type OfferingVisibility = 'private' | 'relationships' | 'community' | 'public';
export type OfferingExchange = 'gift' | 'reciprocity' | 'paid' | 'open_to_conversation';

export interface Offering {
  id: string;
  member_id: string;
  title: string;
  description: string | null;
  availability: OfferingAvailability;
  visibility: OfferingVisibility;
  exchange: OfferingExchange;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferingInput {
  title: string;
  description?: string;
  availability?: OfferingAvailability;
  visibility?: OfferingVisibility;
  exchange?: OfferingExchange;
}

export interface UpdateOfferingInput {
  title?: string;
  description?: string;
  availability?: OfferingAvailability;
  visibility?: OfferingVisibility;
  exchange?: OfferingExchange;
}

export async function createOffering(
  memberId: string,
  input: CreateOfferingInput
): Promise<Offering> {
  const result = await query<Offering>(
    `INSERT INTO offerings (member_id, title, description, availability, visibility, exchange)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      memberId,
      input.title,
      input.description ?? null,
      input.availability ?? 'active',
      input.visibility ?? 'private',
      input.exchange ?? 'open_to_conversation',
    ]
  );

  const offering = result.rows[0];

  // Fire-and-forget signal — never blocks, never writes to observations/recognitions.
  emitSignal({
    signal_type: 'offering_created',
    context_type: 'offering',
    context_id: offering.id,
    surface: 'offerings',
  });

  return offering;
}

export async function updateOffering(
  memberId: string,
  offeringId: string,
  patch: UpdateOfferingInput
): Promise<Offering | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (patch.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(patch.title);
  }
  if (patch.description !== undefined) {
    fields.push(`description = $${i++}`);
    values.push(patch.description);
  }
  if (patch.availability !== undefined) {
    fields.push(`availability = $${i++}`);
    values.push(patch.availability);
  }
  if (patch.visibility !== undefined) {
    fields.push(`visibility = $${i++}`);
    values.push(patch.visibility);
  }
  if (patch.exchange !== undefined) {
    fields.push(`exchange = $${i++}`);
    values.push(patch.exchange);
  }

  if (fields.length === 0) {
    const existing = await query<Offering>(
      `SELECT * FROM offerings WHERE id = $1 AND member_id = $2`,
      [offeringId, memberId]
    );
    return existing.rows[0] ?? null;
  }

  fields.push(`updated_at = NOW()`);

  values.push(offeringId, memberId);
  const result = await query<Offering>(
    `UPDATE offerings SET ${fields.join(', ')}
     WHERE id = $${i++} AND member_id = $${i++}
     RETURNING *`,
    values
  );

  const offering = result.rows[0] ?? null;

  if (offering && patch.availability === 'paused') {
    emitSignal({
      signal_type: 'offering_paused',
      context_type: 'offering',
      context_id: offering.id,
      surface: 'offerings',
    });
  }

  return offering;
}

export async function listOwnOfferings(memberId: string): Promise<Offering[]> {
  const result = await query<Offering>(
    `SELECT * FROM offerings WHERE member_id = $1 ORDER BY created_at DESC`,
    [memberId]
  );
  return result.rows;
}

export async function deleteOffering(memberId: string, offeringId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM offerings WHERE id = $1 AND member_id = $2`,
    [offeringId, memberId]
  );
  return (result.rowCount ?? 0) > 0;
}
