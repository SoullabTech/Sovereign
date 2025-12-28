/**
 * MEMORY WRITEBACK SERVICE
 *
 * Handles promotion of conversation content to long-term memory.
 * Called after each response to break the amnesia loop.
 *
 * Writes to:
 * - developmental_memories (turn capsules, patterns, corrections)
 * - conversation_insights (when high-signal insights detected)
 * - breakthrough_moments (when breakthroughs detected)
 *
 * Respects permission gating via memoryMode:
 * - ephemeral: no writes
 * - continuity: conversation_turns only (handled elsewhere)
 * - longterm: full writeback pipeline
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type MemoryMode = 'ephemeral' | 'continuity' | 'longterm';

export interface WritebackInput {
  userId: string;
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  facetCode?: string;
  element?: string;
  memoryMode: MemoryMode;
  route?: string;  // FAST, CORE, DEEP
  timestamp?: Date;
}

export interface MemoryCapsule {
  facts: string[];      // Max 6
  preferences: string[];// Max 4
  openLoops: string[];  // Max 3
  entities: string[];   // Max 8
}

// ═══════════════════════════════════════════════════════════════
// SECURITY: Sensitive data patterns (NEVER store these)
// ═══════════════════════════════════════════════════════════════
const SENSITIVE_PATTERNS = [
  /secret\s*code/i,
  /password/i,
  /passphrase/i,
  /\bpin\b/i,
  /\botp\b/i,
  /2fa|two.?factor/i,
  /social\s*security/i,
  /\bssn\b/i,
  /credit\s*card/i,
  /\bcvv\b/i,
  /api.?key/i,
  /private.?key/i,
  /seed\s*phrase/i,
  /recovery\s*phrase/i,
  /bank\s*account/i,
  /routing\s*number/i,
];

// Patterns that indicate "stable facts" worth storing
const STABLE_FACT_PATTERNS = [
  /my (?:name) (?:is|was) (.+)/i,  // Name (removed secret/code/phrase)
  /call me (.+)/i,
  /i (?:prefer|like|love|hate|dislike) (.+)/i,
  /i (?:am|'m) (?:a|an) (.+)/i,
  /i work (?:at|for|as) (.+)/i,
  /my (?:partner|wife|husband|friend|dog|cat|child|daughter|son) (?:is|'s) (?:called|named)? ?(.+)/i,
  /(?:don't|never) (.+)/i,  // Boundaries
  /i always (.+)/i,
  /remind me (?:to|that|about) (.+)/i,
  // NEW: Practical coping/help patterns
  /what helps (?:me|is) (.+)/i,
  /when (.+?),?\s*(.+?) helps/i,
  /(.+?) helps (?:me|with) (.+)/i,
  /my goal (?:is|was) (.+)/i,
  /i struggle with (.+)/i,
  /i'm working on (.+)/i,
  /i get (?:anxious|stressed|overwhelmed) when (.+)/i,
];

// ═══════════════════════════════════════════════════════════════
// MEMORY WRITEBACK SERVICE
// ═══════════════════════════════════════════════════════════════

export const MemoryWritebackService = {

  /**
   * MAIN WRITEBACK
   *
   * Called after each response. Analyzes the exchange and writes
   * to long-term memory if conditions are met.
   */
  async writeBack(input: WritebackInput): Promise<{
    wrote: boolean;
    memoryId?: string;
    reason?: string;
  }> {
    const { userId, sessionId, userMessage, assistantResponse, memoryMode } = input;

    // Permission gate: check memoryMode
    if (memoryMode === 'ephemeral') {
      console.log('[MemoryWriteback] Skipping - ephemeral mode');
      return { wrote: false, reason: 'ephemeral_mode' };
    }

    if (memoryMode === 'continuity') {
      console.log('[MemoryWriteback] Continuity mode - turns only, no promotion');
      return { wrote: false, reason: 'continuity_mode' };
    }

    // Longterm mode: analyze and write
    console.log(`[MemoryWriteback] Analyzing exchange for user: ${userId}`);

    // SECURITY GATE: Block sensitive data from ever entering memory
    if (this.containsSensitiveData(userMessage)) {
      console.log('[MemoryWriteback] 🔒 BLOCKED - sensitive data detected (secrets never stored)');
      return { wrote: false, reason: 'sensitive_blocked' };
    }

    // Detect stable facts
    const extractedFacts = this.extractStableFacts(userMessage);

    // Calculate significance
    const significance = this.calculateSignificance(userMessage, assistantResponse, extractedFacts);

    // Gate: only write if significance >= 0.35 OR stable facts found
    if (significance < 0.35 && extractedFacts.length === 0) {
      console.log(`[MemoryWriteback] Skipping - low significance (${significance.toFixed(2)}) and no stable facts`);
      return { wrote: false, reason: 'below_threshold' };
    }

    // Build memory capsule
    const capsule = this.buildCapsule(userMessage, assistantResponse, extractedFacts);

    // Write to developmental_memories
    try {
      const memoryId = await this.writeDevelopmentalMemory({
        userId,
        sessionId,
        userMessage,
        assistantResponse,
        significance,
        capsule,
        facetCode: input.facetCode,
        route: input.route,
        timestamp: input.timestamp,
      });

      console.log(`✅ [MemoryWriteback] Promoted to developmental_memories: ${memoryId}`);

      // Check for breakthrough (high significance + insight pattern)
      if (significance >= 0.8 || this.isBreakthroughPattern(userMessage, assistantResponse)) {
        await this.writeBreakthroughMoment({
          userId,
          sessionId,
          insight: this.extractInsight(userMessage, assistantResponse),
          element: input.element,
        });
        console.log(`⭐ [MemoryWriteback] Breakthrough moment recorded`);
      }

      return { wrote: true, memoryId };

    } catch (err) {
      console.error('[MemoryWriteback] Write failed:', err);
      return { wrote: false, reason: 'write_error' };
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FACT EXTRACTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Extract stable facts from user message
   */
  extractStableFacts(userMessage: string): string[] {
    const facts: string[] = [];

    for (const pattern of STABLE_FACT_PATTERNS) {
      const match = userMessage.match(pattern);
      if (match) {
        // Clean up the extracted fact
        const fact = match[0].trim();
        if (fact.length > 5 && fact.length < 200) {
          facts.push(fact);
        }
      }
    }

    return facts.slice(0, 6); // Max 6 facts
  },

  /**
   * Extract entities (names, places, concepts)
   */
  extractEntities(text: string): string[] {
    const entities: string[] = [];

    // Capitalized words (potential names/places)
    const caps: string[] = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
    const stopWords = ['The', 'This', 'That', 'What', 'How', 'Why', 'When', 'Where'];
    entities.push(...caps.filter(c => c.length > 2 && !stopWords.includes(c)));

    // Quoted strings
    const quoted: string[] = text.match(/"([^"]+)"|'([^']+)'/g) || [];
    entities.push(...quoted.map(q => q.replace(/['"]/g, '')));

    // Dedupe and limit
    return Array.from(new Set(entities)).slice(0, 8);
  },

  // ═══════════════════════════════════════════════════════════════
  // SIGNIFICANCE SCORING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculate significance score (0-1)
   */
  calculateSignificance(
    userMessage: string,
    assistantResponse: string,
    extractedFacts: string[]
  ): number {
    let score = 0.3; // Base score

    // Stable facts boost
    if (extractedFacts.length > 0) {
      score += 0.2 * Math.min(extractedFacts.length, 3);
    }

    // Length indicates depth
    if (userMessage.length > 200) score += 0.1;
    if (assistantResponse.length > 500) score += 0.1;

    // Emotional indicators
    if (/!\s|thank|grateful|realize|understand|breakthrough|insight/i.test(userMessage)) {
      score += 0.15;
    }

    // Personal disclosure
    if (/i feel|i think|i believe|i'm afraid|i love|i hate/i.test(userMessage)) {
      score += 0.1;
    }

    // Correction pattern (learning opportunity)
    if (/no,|actually|not quite|that's not|i meant/i.test(userMessage)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  },

  // ═══════════════════════════════════════════════════════════════
  // CAPSULE BUILDING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Build a compressed memory capsule
   */
  buildCapsule(
    userMessage: string,
    assistantResponse: string,
    extractedFacts: string[]
  ): MemoryCapsule {
    const entities = this.extractEntities(userMessage + ' ' + assistantResponse);

    // Detect preferences
    const preferences: string[] = [];
    const prefMatch = userMessage.match(/i (?:prefer|like|love|want|need) (.+?)(?:\.|$)/gi);
    if (prefMatch) {
      preferences.push(...prefMatch.slice(0, 4));
    }

    // Detect open loops (questions, future commitments)
    const openLoops: string[] = [];
    if (/\?$/.test(userMessage.trim())) {
      openLoops.push(`Question: ${userMessage.substring(0, 80)}`);
    }
    const commitMatch = userMessage.match(/i will|i'm going to|remind me|next time/gi);
    if (commitMatch) {
      openLoops.push(`Commitment: ${commitMatch[0]}`);
    }

    return {
      facts: extractedFacts,
      preferences: preferences.slice(0, 4),
      openLoops: openLoops.slice(0, 3),
      entities: entities.slice(0, 8),
    };
  },

  /**
   * Format capsule as text for storage
   */
  formatCapsuleText(capsule: MemoryCapsule): string {
    const parts: string[] = [];

    if (capsule.facts.length > 0) {
      parts.push(`Facts:\n${capsule.facts.map(f => `- ${f}`).join('\n')}`);
    }
    if (capsule.preferences.length > 0) {
      parts.push(`Preferences:\n${capsule.preferences.map(p => `- ${p}`).join('\n')}`);
    }
    if (capsule.openLoops.length > 0) {
      parts.push(`Open loops:\n${capsule.openLoops.map(o => `- ${o}`).join('\n')}`);
    }
    if (capsule.entities.length > 0) {
      parts.push(`Entities: [${capsule.entities.join(', ')}]`);
    }

    return parts.join('\n');
  },

  // ═══════════════════════════════════════════════════════════════
  // DATABASE WRITES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Write to developmental_memories
   * Uses exact SQL from user guidance
   */
  async writeDevelopmentalMemory(input: {
    userId: string;
    sessionId: string;
    userMessage: string;
    assistantResponse: string;
    significance: number;
    capsule: MemoryCapsule;
    facetCode?: string;
    route?: string;
    timestamp?: Date;
  }): Promise<string> {
    const { userId, sessionId, userMessage, assistantResponse, significance, capsule, facetCode, route } = input;

    const triggerEvent = {
      sessionId,
      route: route || 'unknown',
      userMessage: userMessage.substring(0, 500),
      assistantResponse: assistantResponse.substring(0, 500),
      ts: new Date().toISOString(),
    };

    const contentText = this.formatCapsuleText(capsule);

    const result = await query(`
      INSERT INTO developmental_memories (
        user_id,
        memory_type,
        trigger_event,
        facet_code,
        spiral_cycle,
        significance,
        vector_embedding,
        entity_tags,
        user_feedback,
        source_beads_task_id,
        source_ain_session_id,
        source_consciousness_entry_id,
        authority,
        scope,
        source,
        immutable,
        content_text,
        recall_count,
        last_recalled_at,
        formed_at,
        updated_at
      ) VALUES (
        $1,
        $2,
        $3::jsonb,
        $4,
        NULL,
        $5,
        NULL,
        $6::text[],
        NULL,
        NULL,
        $7,
        NULL,
        'MEMORY',
        'USER',
        'chat',
        FALSE,
        $8,
        0,
        NULL,
        NOW(),
        NOW()
      )
      RETURNING id
    `, [
      userId,
      'turn_capsule',
      JSON.stringify(triggerEvent),
      facetCode || null,
      significance,
      capsule.entities,
      sessionId,
      contentText,
    ]);

    return result.rows[0]?.id;
  },

  /**
   * Write to breakthrough_moments
   */
  async writeBreakthroughMoment(input: {
    userId: string;
    sessionId: string;
    insight: string;
    element?: string;
  }): Promise<string> {
    const { userId, sessionId, insight, element } = input;

    const result = await query(`
      INSERT INTO breakthrough_moments (
        user_id,
        timestamp,
        insight,
        element,
        integrated,
        related_themes,
        conversation_id,
        created_at,
        updated_at
      ) VALUES (
        $1,
        NOW(),
        $2,
        $3,
        FALSE,
        ARRAY[]::text[],
        $4,
        NOW(),
        NOW()
      )
      RETURNING id
    `, [userId, insight, element || null, sessionId]);

    return result.rows[0]?.id;
  },

  /**
   * Write to conversation_insights (safe version - session_id = NULL)
   */
  async writeConversationInsight(input: {
    userId: string;
    sessionId: string;
    insightText: string;
    insightType: string;
    precedingMessages: any[];
    significance: number;
  }): Promise<string> {
    const { userId, sessionId, insightText, insightType, precedingMessages, significance } = input;

    // Note: session_id is uuid but our sessionIds are strings
    // Per user guidance: use NULL for session_id, put string in conversation_context
    const result = await query(`
      INSERT INTO conversation_insights (
        session_id,
        user_id,
        insight_text,
        insight_type,
        conversation_context,
        preceding_messages,
        insight_embedding,
        insight_significance,
        created_at
      ) VALUES (
        NULL,
        $1,
        $2,
        $3,
        $4,
        $5::jsonb,
        NULL,
        $6,
        NOW()
      )
      RETURNING id
    `, [
      userId,
      insightText,
      insightType,
      sessionId, // Put string session ID in conversation_context
      JSON.stringify(precedingMessages),
      significance,
    ]);

    return result.rows[0]?.id;
  },

  // ═══════════════════════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if message contains sensitive data that should NEVER be stored
   * This is a trust cornerstone - secrets don't enter memory
   */
  containsSensitiveData(message: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
  },

  // ═══════════════════════════════════════════════════════════════
  // PATTERN DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detect if exchange contains a breakthrough pattern
   */
  isBreakthroughPattern(userMessage: string, assistantResponse: string): boolean {
    const text = userMessage + ' ' + assistantResponse;
    const patterns = [
      /breakthrough|epiphany|realized|just understood/i,
      /now i see|finally get|makes sense now/i,
      /i never thought|changed my mind|new perspective/i,
      /thank you.*profound|deeply grateful/i,
    ];

    return patterns.some(p => p.test(text));
  },

  /**
   * Extract insight text for breakthrough
   */
  extractInsight(userMessage: string, assistantResponse: string): string {
    // Try to find the insight in user message first
    const insightMatch = userMessage.match(/i (?:realized|understand|see) (.+?)(?:\.|!|$)/i);
    if (insightMatch) {
      return insightMatch[1].substring(0, 200);
    }

    // Fallback: first sentence of user message
    const firstSentence = userMessage.split(/[.!?]/)[0];
    return firstSentence.substring(0, 200);
  },
};

export default MemoryWritebackService;
