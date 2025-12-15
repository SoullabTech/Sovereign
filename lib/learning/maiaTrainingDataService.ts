// backend: lib/learning/maiaTrainingDataService.ts

/**
 * MAIA TRAINING DATA SERVICE
 *
 * TypeScript integration layer for MAIA's training data collection system.
 * Connects backend conversation flows to Postgres training schema.
 */

import { Pool, PoolClient } from 'pg';

// Database connection pool
let pool: Pool | null = null;

/**
 * Convert numeric values to smallint safely
 * - For 0-1 decimals (consciousness_depth): scale to 0-100 percentage points
 * - For 1-5 integers (feedback scores): keep as-is
 * - For invalid values: return null
 */
const toSmallInt = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(n)) return null;

  // If value is already an integer 1-5 (feedback scores), keep as-is
  if (Number.isInteger(n) && n >= 1 && n <= 5) {
    return n;
  }

  // If value is 0-1 decimal (consciousness depth), scale to 0-100
  if (n >= 0 && n <= 1) {
    return Math.round(n * 100);
  }

  // For any other value, round and clamp to smallint range
  const rounded = Math.round(n);
  return Math.max(-32768, Math.min(32767, rounded));
};

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'maia_consciousness',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface MaiaSession {
  id: string;
  user_id?: string;
  started_at: Date;
  ended_at?: Date;
  origin?: string;
  initial_intent?: string;
  metadata: Record<string, any>;
}

export interface MaiaTurn {
  id: number;
  session_id: string;
  turn_index: number;
  user_text: string;
  maia_text: string;
  processing_profile: 'FAST' | 'CORE' | 'DEEP';
  depth_requested?: 'surface' | 'medium' | 'deep' | 'unknown';
  depth_detected?: 'surface' | 'medium' | 'deep' | 'unknown';
  primary_engine: string;
  secondary_engine?: string;
  used_claude_consult: boolean;
  latency_ms?: number;
  rupture_flag: boolean;
  repair_flag: boolean;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  facet?: string;
  topic_tags?: string[];
  consciousness_layers_activated?: string[];
  consciousness_depth_achieved?: number;
  observer_insights?: Record<string, any>;
  evolution_triggers?: string[];
  created_at: Date;
}

export interface MaiaTurnFeedback {
  id: number;
  turn_id: number;
  source_type: 'user' | 'tester' | 'dev' | 'auto';
  source_id?: string;
  felt_seen_score?: number;
  attunement_score?: number;
  safety_score?: number;
  depth_appropriateness_score?: number;
  rupture_mark: boolean;
  ideal_for_repair: boolean;
  ideal_maia_reply?: string;
  tags?: string[];
  comment?: string;
  created_at: Date;
}

export interface TrainingReadiness {
  gold_examples: number;
  repair_examples: number;
  elements_covered: number;
  profiles_covered: number;
  recent_examples: number;
  training_status: 'COLLECTING' | 'APPROACHING' | 'READY';
}

// Request interfaces
export interface LogTurnRequest {
  sessionId: string;
  turnIndex: number;
  userText: string;
  maiaText: string;
  processingProfile: 'FAST' | 'CORE' | 'DEEP';
  primaryEngine?: string;
  latencyMs?: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  topicTags?: string[];
  consciousnessLayers?: string[];
  consciousnessDepth?: number;
  usedClaudeConsult?: boolean;
  // Extended consciousness data
  observerInsights?: Record<string, any>;
  evolutionTriggers?: string[];
}

export interface AddFeedbackRequest {
  turnId: number;
  sourceType?: 'user' | 'tester' | 'dev' | 'auto';
  sourceId?: string;
  feltSeenScore?: number;
  attunementScore?: number;
  safetyScore?: number;
  depthScore?: number;
  ruptureeMark?: boolean;
  tags?: string[];
  comment?: string;
  idealReply?: string;
}

// =============================================================================
// CORE SERVICE FUNCTIONS
// =============================================================================

export class MaiaTrainingDataService {
  /**
   * Log a conversation turn for training data collection
   * Called automatically from maiaService.ts after each response
   */
  static async logTurn(request: LogTurnRequest): Promise<number> {
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT log_maia_conversation_turn(
          $1::text, $2::int, $3::text, $4::text, $5::text,
          $6::text, $7::int, $8::text, $9::text[], $10::text[],
          $11::smallint, $12::boolean
        ) as turn_id`,
        [
          request.sessionId,
          request.turnIndex,
          request.userText,
          request.maiaText,
          request.processingProfile,
          request.primaryEngine || 'deepseek-r1:latest',
          request.latencyMs,
          request.element,
          request.topicTags,
          request.consciousnessLayers,
          toSmallInt(request.consciousnessDepth), // Convert 0.1 → 10, 0.5 → 50, etc.
          request.usedClaudeConsult || false
        ]
      );

      const turnId = result.rows[0]?.turn_id;

      // Store extended consciousness data if provided
      if ((request.observerInsights || request.evolutionTriggers) && turnId) {
        await pool.query(
          `UPDATE maia_turns
           SET observer_insights = $1, evolution_triggers = $2
           WHERE id = $3`,
          [
            request.observerInsights ? JSON.stringify(request.observerInsights) : null,
            request.evolutionTriggers,
            turnId
          ]
        );
      }

      console.log(`📊 Training data logged | Turn ID: ${turnId} | Profile: ${request.processingProfile} | Session: ${request.sessionId.slice(0, 8)}`);

      return turnId;
    } catch (error) {
      console.warn('⚠️ Training data logging failed (conversation continues):', error);
      return -1; // Return sentinel value - don't break the conversation
    }
  }

  /**
   * Add user feedback for a conversation turn
   * Called from feedback UI or API endpoints
   */
  static async addFeedback(request: AddFeedbackRequest): Promise<number | null> {
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT add_maia_feedback(
          $1::bigint, $2::text, $3::uuid, $4::smallint, $5::smallint,
          $6::smallint, $7::smallint, $8::boolean, $9::text[], $10::text, $11::text
        ) as feedback_id`,
        [
          request.turnId,
          request.sourceType || 'user',
          request.sourceId,
          toSmallInt(request.feltSeenScore),
          toSmallInt(request.attunementScore),
          toSmallInt(request.safetyScore),
          toSmallInt(request.depthScore),
          request.ruptureeMark || false,
          request.tags,
          request.comment,
          request.idealReply
        ]
      );

      const feedbackId = result.rows[0]?.feedback_id;

      console.log(`💬 Feedback logged | Feedback ID: ${feedbackId} | Turn: ${request.turnId} | Type: ${request.sourceType}`);

      return feedbackId;
    } catch (error) {
      console.error('❌ Failed to log feedback:', error);
      return null;
    }
  }

  /**
   * Get training readiness status
   * Check if we have enough data for training runs
   */
  static async getTrainingReadiness(): Promise<TrainingReadiness | null> {
    try {
      const pool = getPool();
      const result = await pool.query('SELECT * FROM maia_training_readiness');

      return result.rows[0] as TrainingReadiness;
    } catch (error) {
      console.error('❌ Failed to check training readiness:', error);
      return null;
    }
  }

  /**
   * Export gold standard training data as JSONL
   * Ready for ML pipeline consumption
   */
  static async exportTrainingGold(
    minFeedbackCount: number = 2,
    minAvgScore: number = 4.0
  ): Promise<string[]> {
    try {
      const pool = getPool();
      const result = await pool.query(
        'SELECT jsonl_row FROM export_maia_training_gold($1, $2)',
        [minFeedbackCount, minAvgScore]
      );

      return result.rows.map(row => row.jsonl_row);
    } catch (error) {
      console.error('❌ Failed to export training gold:', error);
      return [];
    }
  }

  /**
   * Export rupture-repair pairs for negative training
   */
  static async exportRuptureRepair(): Promise<string[]> {
    try {
      const pool = getPool();
      const result = await pool.query('SELECT jsonl_row FROM export_maia_rupture_repair()');

      return result.rows.map(row => row.jsonl_row);
    } catch (error) {
      console.error('❌ Failed to export rupture-repair data:', error);
      return [];
    }
  }

  /**
   * Get training statistics by element
   */
  static async getElementalStats(): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool.query('SELECT * FROM maia_training_by_element');

      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get elemental stats:', error);
      return [];
    }
  }

  /**
   * Get processing profile statistics
   */
  static async getProcessingProfileStats(): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool.query('SELECT * FROM maia_processing_profile_stats');

      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get processing profile stats:', error);
      return [];
    }
  }

  /**
   * Initialize database schema (run once on startup)
   */
  static async initializeSchema(): Promise<boolean> {
    try {
      const pool = getPool();

      // Test connection
      await pool.query('SELECT 1');
      console.log('📊 Training data schema connection established');

      return true;
    } catch (error) {
      console.warn('⚠️ Training data schema initialization failed:', error);
      console.warn('⚠️ Training data collection will be disabled');
      return false;
    }
  }

  /**
   * Health check for training data collection system
   */
  static async healthCheck(): Promise<{
    connected: boolean;
    recentTurns: number;
    recentFeedback: number;
    totalSessions: number;
    trainingReadiness: TrainingReadiness | null;
  }> {
    try {
      const pool = getPool();

      // Check connection and get basic stats
      const statsResult = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM maia_turns WHERE created_at > NOW() - INTERVAL '24 hours') as recent_turns,
          (SELECT COUNT(*) FROM maia_turn_feedback WHERE created_at > NOW() - INTERVAL '24 hours') as recent_feedback,
          (SELECT COUNT(*) FROM maia_sessions) as total_sessions
      `);

      const stats = statsResult.rows[0];
      const readiness = await this.getTrainingReadiness();

      return {
        connected: true,
        recentTurns: parseInt(stats.recent_turns),
        recentFeedback: parseInt(stats.recent_feedback),
        totalSessions: parseInt(stats.total_sessions),
        trainingReadiness: readiness
      };
    } catch (error) {
      console.error('❌ Training data health check failed:', error);

      return {
        connected: false,
        recentTurns: 0,
        recentFeedback: 0,
        totalSessions: 0,
        trainingReadiness: null
      };
    }
  }

  /**
   * Clean up old empty sessions (maintenance)
   */
  static async cleanupEmptySessions(daysOld: number = 30): Promise<number> {
    try {
      const pool = getPool();
      const result = await pool.query(
        'SELECT cleanup_empty_sessions($1) as deleted_count',
        [daysOld]
      );

      const deletedCount = result.rows[0]?.deleted_count || 0;
      console.log(`🧹 Cleaned up ${deletedCount} empty sessions older than ${daysOld} days`);

      return deletedCount;
    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Maintain database indexes (run periodically)
   */
  static async maintainIndexes(): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool.query('SELECT maintain_maia_indexes() as status');

      console.log('🔧', result.rows[0]?.status);
      return true;
    } catch (error) {
      console.error('❌ Index maintenance failed:', error);
      return false;
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS FOR INTEGRATION
// =============================================================================

/**
 * Quick function to log turn from maiaService
 * Safely handles failures without breaking conversation flow
 */
export async function logMaiaTurn(
  sessionId: string,
  turnIndex: number,
  userText: string,
  maiaText: string,
  processingProfile: 'FAST' | 'CORE' | 'DEEP',
  metadata: {
    primaryEngine?: string;
    latencyMs?: number;
    element?: string;
    consciousnessData?: any;
    usedClaudeConsult?: boolean;
  } = {}
): Promise<number> {
  return MaiaTrainingDataService.logTurn({
    sessionId,
    turnIndex,
    userText,
    maiaText,
    processingProfile,
    primaryEngine: metadata.primaryEngine,
    latencyMs: metadata.latencyMs,
    element: metadata.element as any,
    consciousnessLayers: metadata.consciousnessData?.layersActivated,
    consciousnessDepth: metadata.consciousnessData?.depth,
    observerInsights: metadata.consciousnessData?.observerInsights,
    evolutionTriggers: metadata.consciousnessData?.evolutionTriggers,
    usedClaudeConsult: metadata.usedClaudeConsult
  });
}

/**
 * Quick function to add simple thumbs up/down feedback
 */
export async function addSimpleFeedback(
  turnId: number,
  positive: boolean,
  sourceType: 'user' | 'tester' = 'user',
  comment?: string
): Promise<number | null> {
  return MaiaTrainingDataService.addFeedback({
    turnId,
    sourceType,
    feltSeenScore: positive ? 5 : 2,
    attunementScore: positive ? 5 : 2,
    safetyScore: 5, // Always safe unless explicitly marked
    tags: [positive ? 'helpful' : 'needs_improvement'],
    comment
  });
}

/**
 * Mark a turn as rupture for curation
 */
export async function markRupture(
  turnId: number,
  comment: string,
  idealReply?: string
): Promise<number | null> {
  return MaiaTrainingDataService.addFeedback({
    turnId,
    sourceType: 'tester',
    feltSeenScore: 1,
    attunementScore: 1,
    ruptureeMark: true,
    tags: ['rupture', 'needs_repair'],
    comment,
    idealReply
  });
}

export default MaiaTrainingDataService;