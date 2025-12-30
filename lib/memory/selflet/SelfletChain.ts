/**
 * SELFLET CHAIN SERVICE
 *
 * Core service for managing temporal identity - the chain of selves
 * that constitute a user's evolving consciousness over time.
 *
 * Based on Michael Levin's "selflet" concept:
 * - Each selflet is a distinct self at a moment in time
 * - Memories are messages between temporal selves
 * - Radical transitions require translation (metamorphosis)
 * - Current actions are messages to future selves
 *
 * Integration: This service is called by MAIA's consciousness layer
 * to seamlessly weave temporal identity awareness into conversations.
 */

import { query as dbQuery } from '@/lib/db/postgres';
import { toPgVectorLiteralOrNull } from '@/lib/db/pgvector';
import { generateLocalEmbedding } from '../embeddings';
import {
  SelfletNode,
  SelfletMessage,
  Reinterpretation,
  Metamorphosis,
  ContinuityMetrics,
  SelfletContext,
  CreateSelfletInput,
  SendMessageInput,
  RecordReinterpretationInput,
  Element,
  getMetamorphosisSymbol,
  UserSelfletState,
  SelfletActionResult,
} from './types';

// ═══════════════════════════════════════════════════════════════
// SELFLET CHAIN SERVICE
// ═══════════════════════════════════════════════════════════════

export class SelfletChainService {

  // ─────────────────────────────────────────────────────────────
  // SELFLET NODE OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new selflet node - marks a transition point in identity
   * The previous active selflet is closed (active_until set)
   */
  async createSelflet(input: CreateSelfletInput): Promise<SelfletNode> {
    console.log(`🌀 [SELFLET] Creating new selflet for ${input.userId}: ${input.phase} (${input.element})`);

    // Generate embedding for essence
    const essenceText = this.buildEssenceText(input);
    const embedding = await generateLocalEmbedding(essenceText);

    // Get current active selflet to set as parent
    const currentSelflet = await this.getCurrentSelflet(input.userId);
    const parentId = input.parentSelfletId ?? currentSelflet?.id;

    // Close previous selflet if exists
    if (currentSelflet) {
      await dbQuery(
        `UPDATE selflet_nodes SET active_until = NOW() WHERE id = $1`,
        [currentSelflet.id]
      );
    }

    // Calculate continuity with parent
    let continuityScore = input.continuityScore ?? 1.0;
    if (currentSelflet && !input.continuityScore) {
      continuityScore = this.calculateContinuityWithParent(input, currentSelflet);
    }

    const query = `
      INSERT INTO selflet_nodes (
        user_id, phase, element, archetypes, dominant_emotions,
        parent_selflet_id, continuity_score, essence_embedding, essence_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9)
      RETURNING *
    `;

    const result = await dbQuery(query, [
      input.userId,
      input.phase,
      input.element,
      input.archetypes,
      input.dominantEmotions ?? [],
      parentId,
      continuityScore,
      toPgVectorLiteralOrNull(embedding),
      input.essenceSummary ?? essenceText,
    ]);

    const selflet = this.parseSelfletNode(result.rows[0]);
    console.log(`✅ [SELFLET CREATED] ID: ${selflet.id}, Phase: ${selflet.phase}, Continuity: ${selflet.continuityScore}`);

    // Check for metamorphosis
    if (currentSelflet && currentSelflet.element !== input.element) {
      await this.recordMetamorphosis(input.userId, selflet.id, currentSelflet.element, input.element);
    }

    return selflet;
  }

  /**
   * Get the current active selflet for a user
   */
  async getCurrentSelflet(userId: string): Promise<SelfletNode | null> {
    try {
      const result = await dbQuery(
        `SELECT * FROM selflet_nodes
         WHERE user_id = $1 AND active_until IS NULL
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return result.rows[0] ? this.parseSelfletNode(result.rows[0]) : null;
    } catch (error) {
      // Table may not exist yet
      console.log(`[SELFLET] No selflet found for ${userId} (table may not exist)`);
      return null;
    }
  }

  /**
   * Get the full selflet chain for a user (chronological order)
   */
  async getChain(userId: string): Promise<SelfletNode[]> {
    try {
      const result = await dbQuery(
        `SELECT * FROM selflet_nodes
         WHERE user_id = $1
         ORDER BY created_at ASC`,
        [userId]
      );
      return result.rows.map(row => this.parseSelfletNode(row));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get a specific selflet by ID
   */
  async getSelfletById(id: string): Promise<SelfletNode | null> {
    try {
      const result = await dbQuery(
        `SELECT * FROM selflet_nodes WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? this.parseSelfletNode(result.rows[0]) : null;
    } catch (error) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MESSAGE OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Send a message to a future self
   * If toSelfletId is null, addressed to any future self
   */
  async sendMessage(input: SendMessageInput): Promise<SelfletMessage> {
    console.log(`💌 [SELFLET MESSAGE] Sending ${input.messageType} from ${input.fromSelfletId}`);

    const query = `
      INSERT INTO selflet_messages (
        from_selflet_id, to_selflet_id, message_type, title, content,
        symbolic_objects, ritual_trigger, delivery_context, relevance_themes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await dbQuery(query, [
      input.fromSelfletId,
      input.toSelfletId ?? null,
      input.messageType,
      input.title,
      input.content,
      input.symbolicObjects ?? [],
      input.ritualTrigger,
      input.deliveryContext ? JSON.stringify(input.deliveryContext) : null,
      input.relevanceThemes ?? [],
    ]);

    const message = this.parseSelfletMessage(result.rows[0]);
    console.log(`✅ [MESSAGE SENT] ID: ${message.id}, Type: ${message.messageType}`);
    return message;
  }

  /**
   * Get pending (undelivered) messages for a user
   * MAIA uses this to intuit when to surface past-self wisdom
   */
  async getPendingMessages(userId: string): Promise<SelfletMessage[]> {
    try {
      const result = await dbQuery(
        `SELECT sm.*, sn.phase as from_phase, sn.element as from_element
         FROM selflet_messages sm
         JOIN selflet_nodes sn ON sm.from_selflet_id = sn.id
         WHERE sn.user_id = $1
           AND sm.delivered_at IS NULL
           AND sm.archived_at IS NULL
           AND (sm.snoozed_until IS NULL OR sm.snoozed_until <= NOW())
           AND sm.to_selflet_id IS NULL
         ORDER BY sn.created_at DESC`,
        [userId]
      );
      return result.rows.map(row => this.parseSelfletMessage(row));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get messages relevant to current context
   * MAIA calls this during response generation to find pertinent wisdom
   */
  async getRelevantMessages(
    userId: string,
    themes: string[],
    currentElement?: Element,
    limit: number = 3
  ): Promise<SelfletMessage[]> {
    try {
      // Build relevance query
      let query = `
        SELECT sm.*, sn.phase as from_phase, sn.element as from_element
        FROM selflet_messages sm
        JOIN selflet_nodes sn ON sm.from_selflet_id = sn.id
        WHERE sn.user_id = $1
          AND sm.delivered_at IS NULL
          AND sm.archived_at IS NULL
          AND (sm.snoozed_until IS NULL OR sm.snoozed_until <= NOW())
      `;
      const params: any[] = [userId];

      // Filter by theme overlap
      if (themes.length > 0) {
        query += ` AND sm.relevance_themes && $${params.length + 1}`;
        params.push(themes);
      }

      query += ` ORDER BY sn.created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await dbQuery(query, params);
      return result.rows.map(row => this.parseSelfletMessage(row));
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark a message as delivered and record interpretation
   */
  async markMessageDelivered(
    messageId: string,
    interpretation?: string
  ): Promise<void> {
    await dbQuery(
      `UPDATE selflet_messages
       SET delivered_at = NOW(), received_interpretation = $2
       WHERE id = $1`,
      [messageId, interpretation]
    );
    console.log(`📬 [MESSAGE DELIVERED] ID: ${messageId}`);
  }

  // ─────────────────────────────────────────────────────────────
  // REINTERPRETATION OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Record how current self interprets a past self's message
   * This is the "caterpillar → butterfly" translation layer
   */
  async recordReinterpretation(input: RecordReinterpretationInput): Promise<Reinterpretation> {
    console.log(`🔄 [REINTERPRETATION] Recording interpretation of ${input.sourceSelfletId}`);

    const query = `
      INSERT INTO selflet_reinterpretations (
        interpreting_selflet_id, source_selflet_id, source_message_id,
        interpretation, emotional_resonance, integration_depth, translation_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await dbQuery(query, [
      input.interpretingSelfletId,
      input.sourceSelfletId,
      input.sourceMessageId,
      input.interpretation,
      input.emotionalResonance,
      input.integrationDepth ?? 0.5,
      input.translationNotes,
    ]);

    const reinterpretation = this.parseReinterpretation(result.rows[0]);
    console.log(`✅ [REINTERPRETATION RECORDED] ID: ${reinterpretation.id}`);
    return reinterpretation;
  }

  /**
   * Get all reinterpretations for a source selflet
   */
  async getReinterpretationsOf(sourceSelfletId: string): Promise<Reinterpretation[]> {
    try {
      const result = await dbQuery(
        `SELECT * FROM selflet_reinterpretations
         WHERE source_selflet_id = $1
         ORDER BY created_at DESC`,
        [sourceSelfletId]
      );
      return result.rows.map(row => this.parseReinterpretation(row));
    } catch (error) {
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // METAMORPHOSIS OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Record a metamorphosis event (radical elemental transition)
   */
  async recordMetamorphosis(
    userId: string,
    selfletId: string,
    fromElement: Element,
    toElement: Element,
    interpretation?: string
  ): Promise<Metamorphosis> {
    const symbol = getMetamorphosisSymbol(fromElement, toElement);
    console.log(`🦋 [METAMORPHOSIS] ${fromElement} → ${toElement} (${symbol})`);

    const query = `
      INSERT INTO selflet_metamorphosis (
        user_id, selflet_id, from_element, to_element, symbol, interpretation,
        discontinuity_score, translation_needed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // Higher discontinuity for non-adjacent elemental transitions
    const discontinuityScore = this.calculateDiscontinuity(fromElement, toElement);

    const result = await dbQuery(query, [
      userId,
      selfletId,
      fromElement,
      toElement,
      symbol,
      interpretation,
      discontinuityScore,
      discontinuityScore > 0.5,  // Translation needed for significant shifts
    ]);

    const metamorphosis = this.parseMetamorphosis(result.rows[0]);
    console.log(`✅ [METAMORPHOSIS RECORDED] ID: ${metamorphosis.id}, Symbol: ${symbol}`);
    return metamorphosis;
  }

  /**
   * Get recent metamorphosis for a user (if any needs attention)
   */
  async getRecentMetamorphosis(userId: string): Promise<Metamorphosis | null> {
    try {
      const result = await dbQuery(
        `SELECT * FROM selflet_metamorphosis
         WHERE user_id = $1
           AND bridging_ritual_completed = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return result.rows[0] ? this.parseMetamorphosis(result.rows[0]) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Mark metamorphosis bridging ritual as completed
   */
  async completeBridgingRitual(metamorphosisId: string): Promise<void> {
    await dbQuery(
      `UPDATE selflet_metamorphosis SET bridging_ritual_completed = TRUE WHERE id = $1`,
      [metamorphosisId]
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CONTINUITY & METRICS
  // ─────────────────────────────────────────────────────────────

  /**
   * Calculate overall continuity metrics for a user's selflet chain
   */
  async calculateContinuity(userId: string): Promise<ContinuityMetrics> {
    const chain = await this.getChain(userId);

    // Get counts
    let reinterpretationCount = 0;
    let metamorphosisCount = 0;

    try {
      const reinterpResult = await dbQuery(
        `SELECT COUNT(*) as count FROM selflet_reinterpretations sr
         JOIN selflet_nodes sn ON sr.interpreting_selflet_id = sn.id
         WHERE sn.user_id = $1`,
        [userId]
      );
      reinterpretationCount = parseInt(reinterpResult.rows[0]?.count || '0');

      const metaResult = await dbQuery(
        `SELECT COUNT(*) as count FROM selflet_metamorphosis WHERE user_id = $1`,
        [userId]
      );
      metamorphosisCount = parseInt(metaResult.rows[0]?.count || '0');
    } catch (error) {
      // Tables may not exist
    }

    // Calculate overall coherence
    const avgContinuity = chain.length > 0
      ? chain.reduce((sum, s) => sum + s.continuityScore, 0) / chain.length
      : 1.0;

    // Integration bonus for reinterpretations
    const integrationBonus = chain.length > 1
      ? Math.min(0.2, reinterpretationCount / chain.length * 0.1)
      : 0;

    // Build elemental journey
    const elementalJourney = chain.slice(1).map((s, i) => ({
      from: chain[i].element,
      to: s.element,
      symbol: getMetamorphosisSymbol(chain[i].element, s.element),
      timestamp: s.createdAt,
    })).filter(t => t.from !== t.to);

    // Build archetypal evolution
    const archetypalEvolution = chain.slice(1).map((s, i) => ({
      from: chain[i].archetypes,
      to: s.archetypes,
      timestamp: s.createdAt,
    })).filter(t => JSON.stringify(t.from) !== JSON.stringify(t.to));

    return {
      userId,
      overallCoherence: Math.min(1.0, avgContinuity + integrationBonus),
      nodeCount: chain.length,
      reinterpretationCount,
      metamorphosisCount,
      elementalJourney,
      archetypalEvolution,
      integrationStrength: reinterpretationCount / Math.max(1, chain.length),
      growthVelocity: metamorphosisCount / Math.max(1, chain.length),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CONTEXT FOR MAIA
  // ─────────────────────────────────────────────────────────────

  /**
   * Build context for MAIA's prompt injection
   * Called during response generation to give MAIA temporal awareness
   */
  async buildContext(userId: string): Promise<SelfletContext> {
    const currentSelflet = await this.getCurrentSelflet(userId);
    const pendingMessages = await this.getPendingMessages(userId);
    const recentMetamorphosis = await this.getRecentMetamorphosis(userId);
    const metrics = await this.calculateContinuity(userId);

    // Build human-readable summary for MAIA
    let contextSummary = '';

    if (currentSelflet) {
      contextSummary += `Current self: ${currentSelflet.phase} phase, ${currentSelflet.element} element`;
      if (currentSelflet.archetypes.length > 0) {
        contextSummary += `, embodying ${currentSelflet.archetypes.join(' and ')}`;
      }
      contextSummary += '. ';
    }

    if (pendingMessages.length > 0) {
      contextSummary += `${pendingMessages.length} message(s) from past selves await delivery. `;
    }

    if (recentMetamorphosis && !recentMetamorphosis.bridgingRitualCompleted) {
      contextSummary += `Recent metamorphosis: ${recentMetamorphosis.fromElement} → ${recentMetamorphosis.toElement} (${recentMetamorphosis.symbol}). `;
    }

    contextSummary += `Chain continuity: ${(metrics.overallCoherence * 100).toFixed(0)}%.`;

    return {
      currentSelflet: currentSelflet ?? undefined,
      pendingMessages,
      recentMetamorphosis: recentMetamorphosis ?? undefined,
      chainContinuity: metrics.overallCoherence,
      contextSummary,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // BOUNDARY EVENT OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Insert a boundary event into the database
   * Called when a transition is detected (micro, major, metamorphosis, manual)
   */
  async insertBoundaryEvent(input: {
    userId: string;
    sessionId?: string;
    fromSelfletId?: string;
    toSelfletId?: string;
    boundaryKind: 'micro' | 'major' | 'metamorphosis' | 'manual';
    elementFrom?: Element;
    elementTo?: Element;
    phaseFrom?: string;
    phaseTo?: string;
    intensity?: number;
    continuityScoreBefore?: number;
    continuityScoreAfter?: number;
    signal: Record<string, unknown>;
    inputExcerpt?: string;
    assistantExcerpt?: string;
  }): Promise<string> {
    const query = `
      INSERT INTO selflet_boundaries (
        user_id, session_id, from_selflet_id, to_selflet_id,
        boundary_kind, element_from, element_to, phase_from, phase_to,
        intensity, continuity_score_before, continuity_score_after,
        signal, input_excerpt, assistant_excerpt
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12,
        $13::jsonb, $14, $15
      )
      RETURNING id
    `;

    const result = await dbQuery(query, [
      input.userId,
      input.sessionId ?? null,
      input.fromSelfletId ?? null,
      input.toSelfletId ?? null,
      input.boundaryKind,
      input.elementFrom ?? null,
      input.elementTo ?? null,
      input.phaseFrom ?? null,
      input.phaseTo ?? null,
      input.intensity ?? null,
      input.continuityScoreBefore ?? null,
      input.continuityScoreAfter ?? null,
      JSON.stringify(input.signal),
      input.inputExcerpt?.slice(0, 500) ?? null,  // Truncate for storage
      input.assistantExcerpt?.slice(0, 500) ?? null,
    ]);

    const id = result.rows[0]?.id;
    console.log(`📍 [SELFLET BOUNDARY] Recorded ${input.boundaryKind} boundary: ${id}`);
    return id;
  }

  /**
   * Get recent boundaries for a user (for debugging/visualization)
   */
  async getRecentBoundaries(userId: string, limit = 10): Promise<Array<{
    id: string;
    boundaryKind: string;
    intensity: number | null;
    signal: Record<string, unknown>;
    detectedAt: Date;
  }>> {
    try {
      const result = await dbQuery(
        `SELECT id, boundary_kind, intensity, signal, detected_at
         FROM selflet_boundaries
         WHERE user_id = $1
         ORDER BY detected_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows.map(row => ({
        id: row.id,
        boundaryKind: row.boundary_kind,
        intensity: row.intensity ? parseFloat(row.intensity) : null,
        signal: typeof row.signal === 'string' ? JSON.parse(row.signal) : row.signal,
        detectedAt: new Date(row.detected_at),
      }));
    } catch (error) {
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MESSAGE OPERATIONS (Phase 2C)
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a selflet message (future-self note on major/metamorphosis boundaries)
   */
  async createSelfletMessage(input: {
    fromSelfletId: string;
    messageType: string;
    title: string;
    content: string;
    relevanceThemes?: string[];
    ritualTrigger?: string | null;
    deliveryContext?: Record<string, unknown>;
  }): Promise<string> {
    const query = `
      INSERT INTO selflet_messages (
        from_selflet_id,
        message_type,
        title,
        content,
        relevance_themes,
        ritual_trigger,
        delivery_context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING id
    `;
    const result = await dbQuery(query, [
      input.fromSelfletId,
      input.messageType,
      input.title,
      input.content,
      input.relevanceThemes ?? null,
      input.ritualTrigger ?? null,
      JSON.stringify(input.deliveryContext ?? {}),
    ]);
    const id = result.rows[0]?.id;
    console.log(`📨 [SELFLET MESSAGE] Created ${input.messageType} message: ${id}`);
    return id;
  }

  /**
   * Get pending message for current context (theme-based relevance matching)
   */
  async getPendingMessageForContext(input: {
    userId: string;
    currentThemes: string[];
    limit?: number;
  }): Promise<null | {
    id: string;
    fromSelfletId: string;
    messageType: string;
    title: string;
    content: string;
    relevanceThemes: string[] | null;
    deliveryContext: Record<string, unknown> | null;
    createdAt: Date;
    deliveryCount: number; // Phase 2K-b
  }> {
    const limit = input.limit ?? 1;

    // Phase 2K-b: Include delivery_count for "Returning" badge
    const query = `
      SELECT
        m.id,
        m.from_selflet_id,
        m.message_type,
        m.title,
        m.content,
        m.relevance_themes,
        m.delivery_context,
        m.created_at,
        m.delivery_count
      FROM selflet_messages m
      JOIN selflet_nodes n ON n.id = m.from_selflet_id
      WHERE n.user_id = $1
        AND m.delivered_at IS NULL
        AND m.archived_at IS NULL
        AND (m.snoozed_until IS NULL OR m.snoozed_until <= NOW())
        AND (
          $2::text[] IS NULL
          OR array_length($2::text[], 1) IS NULL
          OR m.relevance_themes && $2::text[]
        )
      ORDER BY m.created_at DESC
      LIMIT $3
    `;

    const themes = (input.currentThemes?.length ?? 0) > 0 ? input.currentThemes : null;
    const result = await dbQuery(query, [input.userId, themes, limit]);
    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      fromSelfletId: row.from_selflet_id,
      messageType: row.message_type,
      title: row.title,
      content: row.content,
      relevanceThemes: row.relevance_themes ?? null,
      deliveryContext: row.delivery_context ?? null,
      createdAt: new Date(row.created_at),
      deliveryCount: row.delivery_count ?? 0,
    };
  }

  /**
   * Mark a message as delivered (called when surfaced in conversation)
   * Phase 2I: Also stores session/turn for cooldown gating
   */
  async markMessageDeliveredById(input: {
    messageId: string;
    deliveryContext?: Record<string, unknown>;
    deliveredSessionId?: string | null;
    deliveredTurnId?: number | null;
  }): Promise<void> {
    // Phase 2K-b: Track delivery count for "Returning" badge
    const query = `
      UPDATE selflet_messages
      SET delivered_at = NOW(),
          delivery_count = COALESCE(delivery_count, 0) + 1,
          first_delivered_at = COALESCE(first_delivered_at, NOW()),
          last_delivered_at = NOW(),
          delivery_context = COALESCE(delivery_context, '{}'::jsonb) || $2::jsonb,
          delivered_session_id = COALESCE($3, delivered_session_id),
          delivered_turn_id = COALESCE($4, delivered_turn_id)
      WHERE id = $1
    `;
    await dbQuery(query, [
      input.messageId,
      JSON.stringify(input.deliveryContext ?? {}),
      input.deliveredSessionId ?? null,
      input.deliveredTurnId ?? null,
    ]);
    console.log(`✅ [SELFLET MESSAGE] Marked delivered: ${input.messageId} (session: ${input.deliveredSessionId ?? 'none'})`);
  }

  /**
   * Phase 2I: Get user's selflet delivery state for surfacing gating
   * Returns last delivery time, last turn, and count for current session
   */
  async getUserSelfletState(userId: string, sessionId?: string): Promise<UserSelfletState> {
    const current = await this.getCurrentSelflet(userId);
    if (!current) {
      return { lastSelfletTime: null, lastSelfletTurn: null, countThisSession: 0 };
    }

    try {
      // Get last delivery time across all sessions
      const lastTimeRes = await dbQuery(
        `SELECT MAX(delivered_at) AS last_time
         FROM selflet_messages
         WHERE to_selflet_id = $1 AND delivered_at IS NOT NULL`,
        [current.id]
      );
      const lastSelfletTime = (lastTimeRes.rows[0]?.last_time as Date | null) ?? null;

      if (!sessionId) {
        return { lastSelfletTime, lastSelfletTurn: null, countThisSession: 0 };
      }

      // Get per-session stats
      const perSessionRes = await dbQuery(
        `SELECT
            COUNT(*)::int AS count_session,
            MAX(delivered_turn_id)::int AS last_turn
         FROM selflet_messages
         WHERE to_selflet_id = $1
           AND delivered_session_id = $2
           AND delivered_at IS NOT NULL`,
        [current.id, sessionId]
      );

      return {
        lastSelfletTime,
        lastSelfletTurn: perSessionRes.rows[0]?.last_turn ?? null,
        countThisSession: perSessionRes.rows[0]?.count_session ?? 0,
      };
    } catch (error) {
      console.log(`[SELFLET] Error getting user state for ${userId}:`, error);
      return { lastSelfletTime: null, lastSelfletTurn: null, countThisSession: 0 };
    }
  }

  /**
   * Insert a reinterpretation (how current self interpreted past-self message)
   * Idempotent per (message_id, origin) - won't duplicate auto_delivery writes
   */
  async insertReinterpretationFromDelivery(input: {
    messageId: string;
    userId: string;
    interpretation: string;
    integrationDepth: number;
    emotionalResonance?: string | null;
    translationNotes?: string | null;
    origin?: 'auto_delivery' | 'manual';
  }): Promise<void> {
    const origin = input.origin ?? 'auto_delivery';

    // Get the source selflet from the message
    const msgResult = await dbQuery(
      `SELECT from_selflet_id FROM selflet_messages WHERE id = $1`,
      [input.messageId]
    );
    const sourceSelfletId = msgResult.rows[0]?.from_selflet_id;
    if (!sourceSelfletId) {
      console.log(`[SELFLET] Message ${input.messageId} not found, skipping reinterpretation`);
      return;
    }

    // Get current selflet for interpreting_selflet_id
    const currentSelflet = await this.getCurrentSelflet(input.userId);
    if (!currentSelflet) {
      console.log(`[SELFLET] No current selflet for user ${input.userId}, skipping reinterpretation`);
      return;
    }

    const query = `
      INSERT INTO selflet_reinterpretations (
        interpreting_selflet_id,
        source_selflet_id,
        source_message_id,
        interpretation,
        integration_depth,
        emotional_resonance,
        translation_notes,
        origin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (source_message_id, origin) DO NOTHING
    `;
    await dbQuery(query, [
      currentSelflet.id,
      sourceSelfletId,
      input.messageId,
      input.interpretation,
      input.integrationDepth,
      input.emotionalResonance ?? null,
      input.translationNotes ?? null,
      origin,
    ]);
    console.log(`📝 [SELFLET REINTERPRETATION] Recorded (origin: ${origin}) for message ${input.messageId}`);
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private buildEssenceText(input: CreateSelfletInput): string {
    const parts = [
      `${input.phase} phase`,
      `${input.element} element`,
      input.archetypes.join(', '),
    ];
    if (input.dominantEmotions?.length) {
      parts.push(`feeling ${input.dominantEmotions.join(', ')}`);
    }
    if (input.essenceSummary) {
      parts.push(input.essenceSummary);
    }
    return parts.join('. ');
  }

  private calculateContinuityWithParent(
    newSelflet: CreateSelfletInput,
    parent: SelfletNode
  ): number {
    let score = 1.0;

    // Element change reduces continuity
    if (newSelflet.element !== parent.element) {
      score -= 0.2;
    }

    // Archetype change reduces continuity
    const sharedArchetypes = newSelflet.archetypes.filter(a => parent.archetypes.includes(a));
    const archetypeOverlap = sharedArchetypes.length / Math.max(newSelflet.archetypes.length, 1);
    score -= (1 - archetypeOverlap) * 0.15;

    return Math.max(0.3, score);  // Minimum 0.3 continuity
  }

  private calculateDiscontinuity(from: Element, to: Element): number {
    // Adjacent elements have lower discontinuity
    const adjacency: Record<Element, Element[]> = {
      fire: ['air', 'earth'],
      water: ['earth', 'air'],
      earth: ['fire', 'water'],
      air: ['fire', 'water'],
      aether: ['fire', 'water', 'earth', 'air'],  // Aether connects all
    };

    if (adjacency[from]?.includes(to)) {
      return 0.3;  // Adjacent transition
    }
    if (to === 'aether' || from === 'aether') {
      return 0.5;  // Aether transitions are moderate
    }
    return 0.7;  // Non-adjacent transition
  }

  private parseSelfletNode(row: any): SelfletNode {
    return {
      id: row.id,
      userId: row.user_id,
      phase: row.phase,
      element: row.element as Element,
      archetypes: row.archetypes || [],
      dominantEmotions: row.dominant_emotions || [],
      parentSelfletId: row.parent_selflet_id,
      continuityScore: parseFloat(row.continuity_score) || 1.0,
      createdAt: new Date(row.created_at),
      activeUntil: row.active_until ? new Date(row.active_until) : undefined,
      essenceSummary: row.essence_summary,
    };
  }

  private parseSelfletMessage(row: any): SelfletMessage {
    return {
      id: row.id,
      fromSelfletId: row.from_selflet_id,
      toSelfletId: row.to_selflet_id,
      messageType: row.message_type,
      title: row.title,
      content: row.content,
      symbolicObjects: row.symbolic_objects || [],
      ritualTrigger: row.ritual_trigger,
      deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
      receivedInterpretation: row.received_interpretation,
      deliveryContext: row.delivery_context ? JSON.parse(row.delivery_context) : undefined,
      relevanceThemes: row.relevance_themes || [],
      createdAt: new Date(row.created_at),
    };
  }

  private parseReinterpretation(row: any): Reinterpretation {
    return {
      id: row.id,
      interpretingSelfletId: row.interpreting_selflet_id,
      sourceSelfletId: row.source_selflet_id,
      sourceMessageId: row.source_message_id,
      interpretation: row.interpretation,
      emotionalResonance: row.emotional_resonance,
      integrationDepth: parseFloat(row.integration_depth) || 0.5,
      translationNotes: row.translation_notes,
      createdAt: new Date(row.created_at),
    };
  }

  private parseMetamorphosis(row: any): Metamorphosis {
    return {
      id: row.id,
      userId: row.user_id,
      selfletId: row.selflet_id,
      fromElement: row.from_element as Element,
      toElement: row.to_element as Element,
      symbol: row.symbol,
      interpretation: row.interpretation,
      discontinuityScore: parseFloat(row.discontinuity_score),
      translationNeeded: row.translation_needed,
      bridgingRitualCompleted: row.bridging_ritual_completed,
      triggerContext: row.trigger_context,
      createdAt: new Date(row.created_at),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 2J: SNOOZE / ARCHIVE CONTROLS
  // ─────────────────────────────────────────────────────────────

  /**
   * Snooze a message - clears delivery tracking and sets snooze timer
   * Message will resurface after snooze expires
   */
  async snoozeMessageById(input: {
    userId: string;
    messageId: string;
    snoozeMinutes: number;
    reason?: string;
  }): Promise<SelfletActionResult> {
    const snoozedUntil = new Date(Date.now() + input.snoozeMinutes * 60_000);

    // Phase 2K-b: Track last_snoozed_at for history
    const { rows } = await dbQuery(
      `
      UPDATE selflet_messages sm
      SET
        snoozed_until = $1,
        last_snoozed_at = NOW(),
        delivered_at = NULL,
        delivered_session_id = NULL,
        delivered_turn_id = NULL
      FROM selflet_nodes sn
      WHERE
        sm.id = $2
        AND sm.from_selflet_id = sn.id
        AND sn.user_id = $3
        AND sm.archived_at IS NULL
      RETURNING sm.id, sm.snoozed_until
      `,
      [snoozedUntil.toISOString(), input.messageId, input.userId]
    );

    if (!rows?.length) {
      console.log(`[SELFLET] Snooze failed for message ${input.messageId} (not found or archived)`);
      return { ok: false, messageId: input.messageId, action: 'snooze' };
    }

    console.log(`[SELFLET] ⏰ Snoozed message ${input.messageId} until ${snoozedUntil.toISOString()}`);
    return {
      ok: true,
      messageId: rows[0].id,
      action: 'snooze',
      snoozedUntil: rows[0].snoozed_until,
    };
  }

  /**
   * Archive a message - permanently removes from surfacing queue
   */
  async archiveMessageById(input: {
    userId: string;
    messageId: string;
    reason?: string;
  }): Promise<SelfletActionResult> {
    const reason = input.reason ?? 'user_archive';

    const { rows } = await dbQuery(
      `
      UPDATE selflet_messages sm
      SET
        archived_at = NOW(),
        archived_reason = $1
      FROM selflet_nodes sn
      WHERE
        sm.id = $2
        AND sm.from_selflet_id = sn.id
        AND sn.user_id = $3
      RETURNING sm.id
      `,
      [reason, input.messageId, input.userId]
    );

    if (!rows?.length) {
      console.log(`[SELFLET] Archive failed for message ${input.messageId} (not found)`);
      return { ok: false, messageId: input.messageId, action: 'archive' };
    }

    console.log(`[SELFLET] 📦 Archived message ${input.messageId} (reason: ${reason})`);
    return { ok: true, messageId: rows[0].id, action: 'archive' };
  }

  /**
   * Phase 2K-a: Get archived messages for user (for archive drawer)
   * Returns messages ordered by archived_at DESC (newest first)
   */
  async getArchivedMessagesForUser(input: {
    userId: string;
    limit?: number;
    cursor?: string; // ISO timestamp for pagination
  }): Promise<{
    items: Array<SelfletMessage & { archivedAt: Date; archivedReason?: string }>;
    nextCursor: string | null;
  }> {
    const limit = Math.min(input.limit ?? 25, 100);
    const cursorClause = input.cursor
      ? `AND sm.archived_at < $3`
      : '';
    const params: (string | number)[] = [input.userId, limit + 1];
    if (input.cursor) {
      params.push(input.cursor);
    }

    const { rows } = await dbQuery(
      `
      SELECT
        sm.id,
        sm.from_selflet_id AS "fromSelfletId",
        sm.to_selflet_id AS "toSelfletId",
        sm.message_type AS "messageType",
        sm.title,
        sm.content,
        sm.symbolic_objects AS "symbolicObjects",
        sm.ritual_trigger AS "ritualTrigger",
        sm.relevance_themes AS "relevanceThemes",
        sm.delivered_at AS "deliveredAt",
        sm.created_at AS "createdAt",
        sm.archived_at AS "archivedAt",
        sm.archived_reason AS "archivedReason"
      FROM selflet_messages sm
      JOIN selflet_nodes sn ON sm.from_selflet_id = sn.id
      WHERE sn.user_id = $1
        AND sm.archived_at IS NOT NULL
        ${cursorClause}
      ORDER BY sm.archived_at DESC
      LIMIT $2
      `,
      params
    );

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row) => ({
      id: row.id,
      fromSelfletId: row.fromSelfletId,
      toSelfletId: row.toSelfletId ?? undefined,
      messageType: row.messageType,
      title: row.title ?? undefined,
      content: row.content,
      symbolicObjects: row.symbolicObjects ?? undefined,
      ritualTrigger: row.ritualTrigger ?? undefined,
      relevanceThemes: row.relevanceThemes ?? undefined,
      deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : undefined,
      createdAt: new Date(row.createdAt),
      archivedAt: new Date(row.archivedAt),
      archivedReason: row.archivedReason ?? undefined,
    }));

    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].archivedAt.toISOString()
      : null;

    return { items, nextCursor };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const selfletChain = new SelfletChainService();
