import { query } from '@/lib/db/postgres';

export type SignalType =
  | 'invitation_shown'
  | 'invitation_opened'
  | 'conversation_started'
  | 'conversation_abandoned'
  | 'draft_generated'
  | 'draft_saved'
  | 'offering_created'
  | 'offering_paused';

export type ObservationContextType =
  | 'member'
  | 'practitioner'
  | 'encounter'
  | 'offering'
  | 'invitation'
  | 'relationship'
  | 'organization'
  | 'community_event';

export type ObservationHorizon = 'operational' | 'developmental' | 'ecological';

export interface SignalPayload {
  signal_type: SignalType;
  context_type: ObservationContextType;
  context_id?: string;
  surface?: string;
  metadata?: Record<string, unknown>;
}

export interface ObservationPayload {
  witnessed_by?: string;
  observation_context_type: ObservationContextType;
  observation_context_id?: string;
  witnessed_at?: Date;
  witness_text: string;
  horizon?: ObservationHorizon;
  surface?: string;
  signal_id?: string;
}

// Fire-and-forget — never blocks the caller
export function emitSignal(payload: SignalPayload): void {
  query(
    `INSERT INTO signals (signal_type, context_type, context_id, surface, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      payload.signal_type,
      payload.context_type,
      payload.context_id ?? null,
      payload.surface ?? null,
      JSON.stringify(payload.metadata ?? {}),
    ]
  ).catch((err) => {
    console.error('[observation] signal emit failed:', err?.message ?? err);
  });
}

export async function recordObservation(payload: ObservationPayload): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO observations
       (witnessed_by, observation_context_type, observation_context_id,
        witnessed_at, witness_text, horizon, surface, signal_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      payload.witnessed_by ?? null,
      payload.observation_context_type,
      payload.observation_context_id ?? null,
      payload.witnessed_at ?? new Date(),
      payload.witness_text,
      payload.horizon ?? null,
      payload.surface ?? null,
      payload.signal_id ?? null,
    ]
  );
  return result.rows[0].id;
}

export async function listObservations(opts: {
  context_type?: ObservationContextType;
  context_id?: string;
  horizon?: ObservationHorizon;
  limit?: number;
  offset?: number;
}): Promise<Array<Record<string, unknown>>> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (opts.context_type) {
    conditions.push(`observation_context_type = $${i++}`);
    params.push(opts.context_type);
  }
  if (opts.context_id) {
    conditions.push(`observation_context_id = $${i++}`);
    params.push(opts.context_id);
  }
  if (opts.horizon) {
    conditions.push(`horizon = $${i++}`);
    params.push(opts.horizon);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(opts.limit ?? 50);
  params.push(opts.offset ?? 0);

  const result = await query(
    `SELECT * FROM observations ${where}
     ORDER BY witnessed_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    params
  );
  return result.rows;
}
