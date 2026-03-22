import { query } from '@/lib/db/postgres';

export async function logFieldActivity(opts: {
  fieldSlug: string;
  actorId: string | null;
  eventType: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await query(
      `INSERT INTO field_activity_log (field_slug, actor_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      [opts.fieldSlug, opts.actorId, opts.eventType, JSON.stringify(opts.payload ?? {})]
    );
  } catch (err) {
    console.error('[fieldActivityLog] insert failed:', err);
  }
}
