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
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const selfletChain = new SelfletChainService();
