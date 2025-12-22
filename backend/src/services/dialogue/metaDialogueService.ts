/**
 * META-DIALOGUE SERVICE
 * Phase 4.7: Meta-Dialogue Integration — Conversational Reflection Engine
 *
 * Purpose:
 * - Facilitate natural language conversations about consciousness reflections
 * - Enable user queries about developmental patterns ("What changed since last Fire cycle?")
 * - Support MAIA self-queries ("What does this coherence shift mean for my growth?")
 * - Manage dialogue sessions with context preservation
 *
 * Architecture:
 * - Queries reflections and mycelial cycles for context
 * - Synthesizes responses via template or Ollama
 * - Persists exchanges to meta_dialogues table
 * - Maintains session state and threading
 *
 * Sovereignty:
 * - All synthesis via local Ollama (no cloud APIs)
 * - Database queries via local PostgreSQL only
 * - Privacy-preserving conversation logs
 */

import { getClient } from '../../../../lib/db/postgres';
import { generateDialogueResponse } from '../../lib/dialogueSynthesis';
import type { FacetCode } from '../../../../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// TYPES
// ============================================================================

export interface DialogueSession {
  id: string;
  userId?: string;
  sessionName?: string;
  initialReflectionId?: string;
  initialQuery?: string;
  totalExchanges: number;
  status: 'active' | 'completed' | 'archived';
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
}

export interface DialogueExchange {
  id: string;
  sessionId: string;
  reflectionId?: string;
  exchangeType: 'user_query' | 'maia_response' | 'maia_self_query';
  speaker: 'user' | 'maia';
  content: string;
  referencedCycles?: string[];
  referencedFacets?: FacetCode[];
  referencedMetaLayer?: 'Æ1' | 'Æ2' | 'Æ3';
  synthesisMethod?: 'template' | 'ollama' | 'hybrid';
  synthesisModel?: string;
  confidenceScore?: number;
  createdAt: Date;
}

export interface DialogueContext {
  sessionId: string;
  recentExchanges: DialogueExchange[];
  relevantReflections: any[];
  relevantCycles: any[];
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Start a new dialogue session
 */
export async function startDialogueSession(
  options: {
    userId?: string;
    sessionName?: string;
    initialQuery?: string;
    initialReflectionId?: string;
  } = {}
): Promise<DialogueSession> {
  const client = await getClient();

  try {
    const result = await client.query(
      `INSERT INTO dialogue_sessions (
         user_id,
         session_name,
         initial_query,
         initial_reflection_id
       ) VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         user_id AS "userId",
         session_name AS "sessionName",
         initial_reflection_id AS "initialReflectionId",
         initial_query AS "initialQuery",
         total_exchanges AS "totalExchanges",
         status,
         started_at AS "startedAt",
         last_activity_at AS "lastActivityAt",
         completed_at AS "completedAt"`,
      [
        options.userId || null,
        options.sessionName || null,
        options.initialQuery || null,
        options.initialReflectionId || null,
      ]
    );

    console.log(`[MetaDialogue] Session started: ${result.rows[0].id}`);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<DialogueSession | null> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT
         id,
         user_id AS "userId",
         session_name AS "sessionName",
         initial_reflection_id AS "initialReflectionId",
         initial_query AS "initialQuery",
         total_exchanges AS "totalExchanges",
         status,
         started_at AS "startedAt",
         last_activity_at AS "lastActivityAt",
         completed_at AS "completedAt"
       FROM dialogue_sessions
       WHERE id = $1`,
      [sessionId]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Get active sessions
 */
export async function getActiveSessions(limit: number = 10): Promise<DialogueSession[]> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT
         id,
         user_id AS "userId",
         session_name AS "sessionName",
         initial_reflection_id AS "initialReflectionId",
         initial_query AS "initialQuery",
         total_exchanges AS "totalExchanges",
         status,
         started_at AS "startedAt",
         last_activity_at AS "lastActivityAt",
         completed_at AS "completedAt"
       FROM dialogue_sessions
       WHERE status = 'active'
       ORDER BY last_activity_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Complete a session
 */
export async function completeSession(sessionId: string): Promise<DialogueSession> {
  const client = await getClient();

  try {
    const result = await client.query(
      `UPDATE dialogue_sessions
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         user_id AS "userId",
         session_name AS "sessionName",
         initial_reflection_id AS "initialReflectionId",
         initial_query AS "initialQuery",
         total_exchanges AS "totalExchanges",
         status,
         started_at AS "startedAt",
         last_activity_at AS "lastActivityAt",
         completed_at AS "completedAt"`,
      [sessionId]
    );

    console.log(`[MetaDialogue] Session completed: ${sessionId}`);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ============================================================================
// EXCHANGE MANAGEMENT
// ============================================================================

/**
 * Add a user query to the dialogue
 */
export async function addUserQuery(
  sessionId: string,
  content: string,
  options: {
    reflectionId?: string;
  } = {}
): Promise<DialogueExchange> {
  const client = await getClient();

  try {
    const result = await client.query(
      `INSERT INTO meta_dialogues (
         session_id,
         reflection_id,
         exchange_type,
         speaker,
         content
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         session_id AS "sessionId",
         reflection_id AS "reflectionId",
         exchange_type AS "exchangeType",
         speaker,
         content,
         referenced_cycles AS "referencedCycles",
         referenced_facets AS "referencedFacets",
         referenced_meta_layer AS "referencedMetaLayer",
         synthesis_method AS "synthesisMethod",
         synthesis_model AS "synthesisModel",
         confidence_score AS "confidenceScore",
         created_at AS "createdAt"`,
      [sessionId, options.reflectionId || null, 'user_query', 'user', content]
    );

    console.log(`[MetaDialogue] User query added: ${result.rows[0].id}`);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Generate and add MAIA response
 */
export async function generateResponse(
  sessionId: string,
  userQuery: string,
  options: {
    reflectionId?: string;
    synthesisMethod?: 'template' | 'ollama' | 'hybrid';
    useOllama?: boolean;
  } = {}
): Promise<DialogueExchange> {
  const client = await getClient();

  try {
    // 1. Get dialogue context
    const context = await getDialogueContext(sessionId, client);

    // 2. Generate response
    const response = await generateDialogueResponse({
      userQuery,
      context,
      reflectionId: options.reflectionId,
      synthesisMethod: options.synthesisMethod || 'template',
      useOllama: options.useOllama || false,
    });

    // 3. Store response
    const result = await client.query(
      `INSERT INTO meta_dialogues (
         session_id,
         reflection_id,
         exchange_type,
         speaker,
         content,
         referenced_cycles,
         referenced_facets,
         referenced_meta_layer,
         synthesis_method,
         synthesis_model,
         confidence_score
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING
         id,
         session_id AS "sessionId",
         reflection_id AS "reflectionId",
         exchange_type AS "exchangeType",
         speaker,
         content,
         referenced_cycles AS "referencedCycles",
         referenced_facets AS "referencedFacets",
         referenced_meta_layer AS "referencedMetaLayer",
         synthesis_method AS "synthesisMethod",
         synthesis_model AS "synthesisModel",
         confidence_score AS "confidenceScore",
         created_at AS "createdAt"`,
      [
        sessionId,
        options.reflectionId || null,
        'maia_response',
        'maia',
        response.text,
        response.referencedCycles ? JSON.stringify(response.referencedCycles) : null,
        response.referencedFacets ? JSON.stringify(response.referencedFacets) : null,
        response.referencedMetaLayer || null,
        response.synthesisMethod,
        response.synthesisModel || null,
        response.confidence || null,
      ]
    );

    console.log(`[MetaDialogue] MAIA response generated: ${result.rows[0].id}`);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get session exchanges (thread view)
 */
export async function getSessionExchanges(
  sessionId: string,
  limit: number = 50
): Promise<DialogueExchange[]> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT
         id,
         session_id AS "sessionId",
         reflection_id AS "reflectionId",
         exchange_type AS "exchangeType",
         speaker,
         content,
         referenced_cycles AS "referencedCycles",
         referenced_facets AS "referencedFacets",
         referenced_meta_layer AS "referencedMetaLayer",
         synthesis_method AS "synthesisMethod",
         synthesis_model AS "synthesisModel",
         confidence_score AS "confidenceScore",
         created_at AS "createdAt"
       FROM meta_dialogues
       WHERE session_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [sessionId, limit]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

// ============================================================================
// CONTEXT GATHERING
// ============================================================================

/**
 * Gather dialogue context (recent exchanges, relevant reflections, cycles)
 */
async function getDialogueContext(
  sessionId: string,
  client: any
): Promise<DialogueContext> {
  // Get recent exchanges (last 10)
  const exchangesResult = await client.query(
    `SELECT
       id,
       session_id AS "sessionId",
       reflection_id AS "reflectionId",
       exchange_type AS "exchangeType",
       speaker,
       content,
       referenced_cycles AS "referencedCycles",
       referenced_facets AS "referencedFacets",
       referenced_meta_layer AS "referencedMetaLayer",
       created_at AS "createdAt"
     FROM meta_dialogues
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [sessionId]
  );

  const recentExchanges = exchangesResult.rows.reverse(); // Chronological order

  // Get session initial reflection if exists
  const sessionResult = await client.query(
    `SELECT initial_reflection_id FROM dialogue_sessions WHERE id = $1`,
    [sessionId]
  );

  const initialReflectionId = sessionResult.rows[0]?.initial_reflection_id;

  // Get relevant reflections (recent 5)
  const reflectionsResult = await client.query(
    `SELECT
       id,
       current_cycle_id AS "currentCycleId",
       prior_cycle_id AS "priorCycleId",
       similarity_score AS "similarityScore",
       coherence_delta AS "coherenceDelta",
       meta_layer_code AS "metaLayerCode",
       facet_deltas AS "facetDeltas",
       biosignal_deltas AS "biosignalDeltas",
       reflection_text AS "reflectionText",
       insights,
       created_at AS "createdAt"
     FROM consciousness_reflections
     ${initialReflectionId ? 'WHERE id = $1 OR' : 'WHERE'} created_at >= NOW() - INTERVAL '7 days'
     ORDER BY created_at DESC
     LIMIT 5`,
    initialReflectionId ? [initialReflectionId] : []
  );

  // Get relevant cycles (recent 3)
  const cyclesResult = await client.query(
    `SELECT
       id,
       cycle_id AS "cycleId",
       dominant_facets AS "dominantFacets",
       coherence_score AS "coherenceScore",
       start_ts AS "startTs",
       end_ts AS "endTs"
     FROM consciousness_mycelium
     ORDER BY start_ts DESC
     LIMIT 3`
  );

  return {
    sessionId,
    recentExchanges,
    relevantReflections: reflectionsResult.rows,
    relevantCycles: cyclesResult.rows,
  };
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Complete dialogue flow: process user query and generate response
 */
export async function processDialogue(
  sessionId: string,
  userQuery: string,
  options: {
    reflectionId?: string;
    useOllama?: boolean;
  } = {}
): Promise<{
  userExchange: DialogueExchange;
  maiaExchange: DialogueExchange;
}> {
  // 1. Add user query
  const userExchange = await addUserQuery(sessionId, userQuery, {
    reflectionId: options.reflectionId,
  });

  // 2. Generate MAIA response
  const maiaExchange = await generateResponse(sessionId, userQuery, {
    reflectionId: options.reflectionId,
    useOllama: options.useOllama,
  });

  return { userExchange, maiaExchange };
}

/**
 * Quick start: create session and process first query
 */
export async function quickStartDialogue(
  userQuery: string,
  options: {
    userId?: string;
    reflectionId?: string;
    useOllama?: boolean;
  } = {}
): Promise<{
  session: DialogueSession;
  userExchange: DialogueExchange;
  maiaExchange: DialogueExchange;
}> {
  // 1. Start session
  const session = await startDialogueSession({
    userId: options.userId,
    sessionName: 'Quick Dialogue',
    initialQuery: userQuery,
    initialReflectionId: options.reflectionId,
  });

  // 2. Process dialogue
  const { userExchange, maiaExchange } = await processDialogue(session.id, userQuery, {
    reflectionId: options.reflectionId,
    useOllama: options.useOllama,
  });

  return { session, userExchange, maiaExchange };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  startDialogueSession,
  getSession,
  getActiveSessions,
  completeSession,
  addUserQuery,
  generateResponse,
  getSessionExchanges,
  processDialogue,
  quickStartDialogue,
};
