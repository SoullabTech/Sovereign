/**
 * FieldRecordsRepo - Postgres-native storage for Field Records
 *
 * Tables:
 * - field_records: stores the 5-stage wisdom documentation
 * - resonance_events: tracks community resonance
 */

import { query } from '../../db/postgres';
import type {
  FieldRecord,
  PrivacyLevel,
  ObservationRecord,
  InterpretationRecord,
  IntegrationRecord,
  ReflectionRecord,
  TransmissionRecord,
} from '../types';

export interface FieldRecordRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  observation: Record<string, unknown>;
  interpretation: Record<string, unknown> | null;
  integration: Record<string, unknown> | null;
  reflection: Record<string, unknown> | null;
  transmission: Record<string, unknown> | null;
  completion_stage: number;
  privacy_level: string;
  tags: string[];
  community_engagement: Record<string, unknown>;
  ai_processing: Record<string, unknown>;
}

export interface GetUserRecordsOptions {
  limit?: number;
  offset?: number;
  privacyFilter?: PrivacyLevel[];
  completionStageMin?: number;
}

export interface GetCommonsOptions {
  limit?: number;
  sortBy?: 'recent' | 'resonance' | 'completion';
}

/**
 * Parse database row to FieldRecord
 */
function rowToFieldRecord(row: FieldRecordRow): FieldRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    observation: row.observation as unknown as ObservationRecord,
    interpretation: row.interpretation as unknown as InterpretationRecord | undefined,
    integration: row.integration as unknown as IntegrationRecord | undefined,
    reflection: row.reflection as unknown as ReflectionRecord | undefined,
    transmission: row.transmission as unknown as TransmissionRecord | undefined,
    completionStage: row.completion_stage as 1 | 2 | 3 | 4 | 5,
    privacyLevel: row.privacy_level as PrivacyLevel,
    tags: row.tags ?? [],
    communityEngagement: row.community_engagement as FieldRecord['communityEngagement'],
    aiProcessing: row.ai_processing as FieldRecord['aiProcessing'],
  };
}

export const FieldRecordsRepo = {
  /**
   * Create or update a field record
   */
  async upsert(
    record: Partial<FieldRecord>,
    userId: string
  ): Promise<FieldRecord | null> {
    const now = new Date().toISOString();

    // Determine completion stage based on filled sections
    let completionStage = 1;
    if (record.interpretation) completionStage = 2;
    if (record.integration) completionStage = 3;
    if (record.reflection) completionStage = 4;
    if (record.transmission) completionStage = 5;

    if (record.id) {
      // Update existing
      const res = await query(
        `
        UPDATE field_records
        SET
          observation = $1::jsonb,
          interpretation = $2::jsonb,
          integration = $3::jsonb,
          reflection = $4::jsonb,
          transmission = $5::jsonb,
          completion_stage = $6,
          privacy_level = $7,
          tags = $8::jsonb,
          community_engagement = $9::jsonb,
          updated_at = $10
        WHERE id = $11
        RETURNING *
        `,
        [
          JSON.stringify(record.observation ?? {}),
          JSON.stringify(record.interpretation ?? null),
          JSON.stringify(record.integration ?? null),
          JSON.stringify(record.reflection ?? null),
          JSON.stringify(record.transmission ?? null),
          completionStage,
          record.privacyLevel ?? 'private',
          JSON.stringify(record.tags ?? []),
          JSON.stringify(record.communityEngagement ?? {
            views: 0,
            resonanceMarkers: 0,
            reflections: [],
            questions: [],
          }),
          now,
          record.id,
        ]
      );
      const row = res.rows?.[0];
      return row ? rowToFieldRecord(row) : null;
    } else {
      // Insert new
      const res = await query(
        `
        INSERT INTO field_records (
          user_id, observation, interpretation, integration, reflection, transmission,
          completion_stage, privacy_level, tags, community_engagement, created_at, updated_at
        ) VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9::jsonb, $10::jsonb, $11, $11)
        RETURNING *
        `,
        [
          userId,
          JSON.stringify(record.observation ?? {}),
          JSON.stringify(record.interpretation ?? null),
          JSON.stringify(record.integration ?? null),
          JSON.stringify(record.reflection ?? null),
          JSON.stringify(record.transmission ?? null),
          completionStage,
          record.privacyLevel ?? 'private',
          JSON.stringify(record.tags ?? []),
          JSON.stringify(record.communityEngagement ?? {
            views: 0,
            resonanceMarkers: 0,
            reflections: [],
            questions: [],
          }),
          now,
        ]
      );
      const row = res.rows?.[0];
      return row ? rowToFieldRecord(row) : null;
    }
  },

  /**
   * Get a single field record by ID
   */
  async getById(id: string): Promise<FieldRecord | null> {
    const res = await query(
      `SELECT * FROM field_records WHERE id = $1 LIMIT 1`,
      [id]
    );
    const row = res.rows?.[0];
    return row ? rowToFieldRecord(row) : null;
  },

  /**
   * Get field records for a user with optional filters
   */
  async getUserRecords(
    userId: string,
    options?: GetUserRecordsOptions
  ): Promise<FieldRecord[]> {
    let sql = `SELECT * FROM field_records WHERE user_id = $1`;
    const params: (string | number | string[])[] = [userId];
    let paramIndex = 2;

    if (options?.privacyFilter?.length) {
      sql += ` AND privacy_level = ANY($${paramIndex})`;
      params.push(options.privacyFilter);
      paramIndex++;
    }

    if (options?.completionStageMin) {
      sql += ` AND completion_stage >= $${paramIndex}`;
      params.push(options.completionStageMin);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;

    if (options?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
      paramIndex++;
    }

    if (options?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(options.offset);
    }

    const res = await query(sql, params);
    return (res.rows ?? []).map(rowToFieldRecord);
  },

  /**
   * Get public/commons records
   */
  async getCommonsRecords(options?: GetCommonsOptions): Promise<FieldRecord[]> {
    let orderClause = 'ORDER BY created_at DESC';

    if (options?.sortBy === 'resonance') {
      orderClause = `ORDER BY (community_engagement->>'resonanceMarkers')::int DESC NULLS LAST`;
    } else if (options?.sortBy === 'completion') {
      orderClause = 'ORDER BY completion_stage DESC';
    }

    let sql = `
      SELECT * FROM field_records
      WHERE privacy_level IN ('commons', 'public')
      ${orderClause}
    `;

    const params: number[] = [];
    if (options?.limit) {
      sql += ` LIMIT $1`;
      params.push(options.limit);
    }

    const res = await query(sql, params);
    return (res.rows ?? []).map(rowToFieldRecord);
  },

  /**
   * Update community engagement (for reflections, resonance, etc.)
   */
  async updateCommunityEngagement(
    recordId: string,
    engagement: FieldRecord['communityEngagement']
  ): Promise<boolean> {
    const res = await query(
      `
      UPDATE field_records
      SET community_engagement = $1::jsonb, updated_at = now()
      WHERE id = $2
      `,
      [JSON.stringify(engagement), recordId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Get community engagement for a record
   */
  async getCommunityEngagement(
    recordId: string
  ): Promise<FieldRecord['communityEngagement'] | null> {
    const res = await query(
      `SELECT community_engagement FROM field_records WHERE id = $1 LIMIT 1`,
      [recordId]
    );
    const row = res.rows?.[0];
    return row?.community_engagement ?? null;
  },

  /**
   * Log a resonance event
   */
  async logResonanceEvent(recordId: string, userId: string): Promise<boolean> {
    const res = await query(
      `INSERT INTO resonance_events (record_id, user_id) VALUES ($1, $2) RETURNING id`,
      [recordId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Get recent records for context (last N days)
   */
  async getRecentRecords(
    userId: string,
    days: number = 7,
    limit: number = 10
  ): Promise<FieldRecord[]> {
    const res = await query(
      `
      SELECT * FROM field_records
      WHERE user_id = $1 AND created_at >= now() - ($2 || ' days')::interval
      ORDER BY created_at DESC
      LIMIT $3
      `,
      [userId, days.toString(), limit]
    );
    return (res.rows ?? []).map(rowToFieldRecord);
  },
};
