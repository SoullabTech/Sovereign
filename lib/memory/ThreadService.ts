/**
 * ThreadService: Storyline/Trajectory Management
 *
 * A thread is a string of beads - how things unfold over time.
 * This service manages threads, links entries to them, and tracks progression.
 */

import { query, queryOne, transaction, type TransactionClient } from '@/lib/db/postgres';
import { BeadService, type Bead, type DetectedBead } from './BeadService';
import type { Element } from '@/lib/voice/types';

// ----- Types -----

export type ThreadDomain =
  | 'vocation'
  | 'relationship'
  | 'health'
  | 'creativity'
  | 'spirituality'
  | 'family'
  | 'money'
  | 'identity'
  | 'community'
  | 'other';

export type ThreadStatus = 'dormant' | 'active' | 'integration' | 'completed';

export type Milestone =
  | 'rupture'
  | 'revelation'
  | 'decision'
  | 'descent'
  | 'reconciliation'
  | 'embodiment'
  | 'completion';

export interface Thread {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  domain: ThreadDomain | null;
  status: ThreadStatus;
  current_phase: string | null;
  current_milestone: Milestone | null;
  milestone_history: Array<{ milestone: Milestone; reached_at: string; notes?: string }>;
  elemental_signature: Record<Element, number>;
  dominant_facets: string[] | null;
  open_questions: string[] | null;
  helpful_practices: string[] | null;
  stuck_patterns: string[] | null;
  started_at: Date;
  last_updated: Date;
  completed_at: Date | null;
  predicted_next: string | null;
  predicted_confidence: number | null;
  created_at: Date;
}

export interface ThreadEvent {
  id: string;
  thread_id: string;
  user_id: string;
  source_type: 'journal' | 'capture' | 'conversation' | 'episode' | 'elemental_journal' | 'milestone';
  source_id: string;
  event_type: 'entry' | 'milestone' | 'shift' | 'insight' | 'practice' | null;
  summary: string | null;
  bead_ids: string[] | null;
  phase_before: string | null;
  phase_after: string | null;
  milestone_reached: Milestone | null;
  created_at: Date;
}

export interface ThreadSuggestion {
  thread: Thread;
  relevance: number;
  matchingBeads: string[];
  reason: string;
}

// Domain detection keywords
const DOMAIN_KEYWORDS: Record<ThreadDomain, string[]> = {
  vocation: ['work', 'career', 'job', 'calling', 'profession', 'business', 'purpose', 'mission', 'craft'],
  relationship: ['partner', 'marriage', 'dating', 'love', 'romantic', 'spouse', 'boyfriend', 'girlfriend', 'divorce', 'breakup'],
  health: ['health', 'body', 'illness', 'sick', 'exercise', 'diet', 'sleep', 'energy', 'pain', 'healing', 'recovery'],
  creativity: ['creative', 'art', 'write', 'writing', 'music', 'paint', 'create', 'project', 'expression', 'artistic'],
  spirituality: ['spirit', 'soul', 'meditation', 'prayer', 'faith', 'divine', 'sacred', 'practice', 'awakening', 'god'],
  family: ['family', 'parent', 'child', 'mother', 'father', 'sibling', 'daughter', 'son', 'ancestry', 'lineage'],
  money: ['money', 'financial', 'income', 'debt', 'wealth', 'abundance', 'scarcity', 'budget', 'savings'],
  identity: ['identity', 'self', 'who am I', 'becoming', 'authentic', 'true self', 'persona', 'mask', 'real me'],
  community: ['community', 'friends', 'social', 'belonging', 'tribe', 'group', 'collective', 'peers', 'network'],
  other: []
};

// ----- Service Class -----

class ThreadServiceImpl {
  /**
   * Create a new thread (storyline)
   */
  async createThread(
    userId: string,
    title: string,
    options: {
      description?: string;
      domain?: ThreadDomain;
      initialPhase?: string;
      openQuestions?: string[];
    } = {}
  ): Promise<Thread> {
    const result = await query<Thread>(`
      INSERT INTO threads (
        user_id, title, description, domain, current_phase, open_questions
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      title,
      options.description ?? null,
      options.domain ?? null,
      options.initialPhase ?? null,
      options.openQuestions ?? null
    ]);

    return result.rows[0];
  }

  /**
   * Add an entry to a thread
   */
  async addToThread(
    threadId: string,
    userId: string,
    sourceType: ThreadEvent['source_type'],
    sourceId: string,
    options: {
      eventType?: ThreadEvent['event_type'];
      summary?: string;
      beadIds?: string[];
      phaseChange?: { from: string | null; to: string };
      milestoneReached?: Milestone;
    } = {}
  ): Promise<ThreadEvent> {
    return transaction(async (client) => {
      // Create thread event
      const eventResult = await client.query<ThreadEvent>(`
        INSERT INTO thread_events (
          thread_id, user_id, source_type, source_id,
          event_type, summary, bead_ids,
          phase_before, phase_after, milestone_reached
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        threadId,
        userId,
        sourceType,
        sourceId,
        options.eventType ?? 'entry',
        options.summary ?? null,
        options.beadIds ?? null,
        options.phaseChange?.from ?? null,
        options.phaseChange?.to ?? null,
        options.milestoneReached ?? null
      ]);

      const event = eventResult.rows[0];

      // Update thread stats
      const updates: string[] = ['last_updated = NOW()'];
      const params: (string | null)[] = [];
      let paramIndex = 1;

      // Update current phase if changed
      if (options.phaseChange?.to) {
        updates.push(`current_phase = $${paramIndex++}`);
        params.push(options.phaseChange.to);
      }

      // Update milestone if reached
      if (options.milestoneReached) {
        updates.push(`current_milestone = $${paramIndex++}`);
        params.push(options.milestoneReached);

        // Add to milestone history
        updates.push(`milestone_history = milestone_history || $${paramIndex++}::jsonb`);
        params.push(JSON.stringify([{
          milestone: options.milestoneReached,
          reached_at: new Date().toISOString()
        }]));
      }

      params.push(threadId);

      await client.query(`
        UPDATE threads SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `, params);

      // Update thread-bead associations if beads provided
      if (options.beadIds && options.beadIds.length > 0) {
        await this.updateThreadBeads(client, threadId, userId, options.beadIds);
      }

      // Update elemental signature based on beads
      await this.updateElementalSignature(client, threadId);

      return event;
    });
  }

  /**
   * Update thread-bead associations
   */
  private async updateThreadBeads(
    client: TransactionClient,
    threadId: string,
    userId: string,
    beadIds: string[]
  ): Promise<void> {
    for (const beadId of beadIds) {
      await client.query(`
        INSERT INTO thread_beads (thread_id, bead_id, user_id, occurrence_count)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (thread_id, bead_id) DO UPDATE SET
          occurrence_count = thread_beads.occurrence_count + 1,
          last_seen = NOW()
      `, [threadId, beadId, userId]);
    }
  }

  /**
   * Update a thread's elemental signature based on its beads
   */
  private async updateElementalSignature(
    client: TransactionClient,
    threadId: string
  ): Promise<void> {
    const result = await client.query<{ element: Element; count: number }>(`
      SELECT b.element, SUM(tb.occurrence_count) as count
      FROM thread_beads tb
      JOIN beads b ON tb.bead_id = b.id
      WHERE tb.thread_id = $1
      GROUP BY b.element
    `, [threadId]);

    if (result.rows.length === 0) return;

    const total = result.rows.reduce((sum, r) => sum + Number(r.count), 0);
    const signature: Record<Element, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };

    for (const row of result.rows) {
      signature[row.element] = Number(row.count) / total;
    }

    await client.query(`
      UPDATE threads SET elemental_signature = $1
      WHERE id = $2
    `, [JSON.stringify(signature), threadId]);
  }

  /**
   * Update thread's current phase
   */
  async updateThreadPhase(
    threadId: string,
    newPhase: string,
    notes?: string
  ): Promise<Thread> {
    const result = await query<Thread>(`
      UPDATE threads SET
        current_phase = $1,
        last_updated = NOW()
      WHERE id = $2
      RETURNING *
    `, [newPhase, threadId]);

    return result.rows[0];
  }

  /**
   * Mark a milestone reached in a thread
   */
  async markMilestone(
    threadId: string,
    milestone: Milestone,
    notes?: string
  ): Promise<Thread> {
    const milestoneEntry = {
      milestone,
      reached_at: new Date().toISOString(),
      notes
    };

    const result = await query<Thread>(`
      UPDATE threads SET
        current_milestone = $1,
        milestone_history = milestone_history || $2::jsonb,
        last_updated = NOW()
      WHERE id = $3
      RETURNING *
    `, [milestone, JSON.stringify([milestoneEntry]), threadId]);

    // If completion milestone, mark thread as completed
    if (milestone === 'completion') {
      await query(`
        UPDATE threads SET
          status = 'completed',
          completed_at = NOW()
        WHERE id = $1
      `, [threadId]);
    }

    return result.rows[0];
  }

  /**
   * Get active threads for a user
   */
  async getActiveThreads(
    userId: string,
    limit: number = 7
  ): Promise<Thread[]> {
    const result = await query<Thread>(`
      SELECT * FROM threads
      WHERE user_id = $1 AND status = 'active'
      ORDER BY last_updated DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  /**
   * Get all threads for a user
   */
  async getAllThreads(
    userId: string,
    options: {
      status?: ThreadStatus;
      domain?: ThreadDomain;
      limit?: number;
    } = {}
  ): Promise<Thread[]> {
    let sql = 'SELECT * FROM threads WHERE user_id = $1';
    const params: (string | number)[] = [userId];
    let paramIndex = 2;

    if (options.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(options.status);
    }

    if (options.domain) {
      sql += ` AND domain = $${paramIndex++}`;
      params.push(options.domain);
    }

    sql += ' ORDER BY last_updated DESC';

    if (options.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
    }

    const result = await query<Thread>(sql, params);
    return result.rows;
  }

  /**
   * Get a thread by ID
   */
  async getThread(threadId: string): Promise<Thread | null> {
    return queryOne<Thread>('SELECT * FROM threads WHERE id = $1', [threadId]);
  }

  /**
   * Get events for a thread
   */
  async getThreadEvents(
    threadId: string,
    limit: number = 50
  ): Promise<ThreadEvent[]> {
    const result = await query<ThreadEvent>(`
      SELECT * FROM thread_events
      WHERE thread_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [threadId, limit]);

    return result.rows;
  }

  /**
   * Suggest which thread(s) an entry belongs to based on detected beads
   */
  async suggestThread(
    userId: string,
    detectedBeads: DetectedBead[],
    text: string
  ): Promise<ThreadSuggestion[]> {
    if (detectedBeads.length === 0) {
      return [];
    }

    // Get active threads
    const threads = await this.getActiveThreads(userId, 10);

    if (threads.length === 0) {
      return [];
    }

    const suggestions: ThreadSuggestion[] = [];

    for (const thread of threads) {
      // Get beads associated with this thread
      const threadBeadResult = await query<{ code: string; occurrence_count: number }>(`
        SELECT b.code, tb.occurrence_count
        FROM thread_beads tb
        JOIN beads b ON tb.bead_id = b.id
        WHERE tb.thread_id = $1
      `, [thread.id]);

      const threadBeadCodes = new Set(threadBeadResult.rows.map(r => r.code));

      // Calculate match
      const matchingBeads = detectedBeads
        .filter(b => threadBeadCodes.has(b.code))
        .map(b => b.code);

      // Calculate elemental match
      let elementalMatch = 0;
      for (const bead of detectedBeads) {
        const threadElementScore = thread.elemental_signature[bead.element] ?? 0;
        elementalMatch += threadElementScore * bead.intensity;
      }

      // Domain match (via text analysis)
      const domainMatch = thread.domain
        ? this.calculateDomainMatch(text, thread.domain)
        : 0;

      // Combined relevance score
      const beadRelevance = matchingBeads.length / Math.max(detectedBeads.length, 1);
      const relevance = (beadRelevance * 0.5) + (elementalMatch * 0.3) + (domainMatch * 0.2);

      if (relevance > 0.1 || matchingBeads.length > 0) {
        suggestions.push({
          thread,
          relevance,
          matchingBeads,
          reason: this.generateSuggestionReason(matchingBeads, elementalMatch, domainMatch, thread)
        });
      }
    }

    // Sort by relevance
    suggestions.sort((a, b) => b.relevance - a.relevance);

    return suggestions.slice(0, 3);
  }

  /**
   * Calculate domain match from text
   */
  private calculateDomainMatch(text: string, domain: ThreadDomain): number {
    const keywords = DOMAIN_KEYWORDS[domain];
    if (!keywords || keywords.length === 0) return 0;

    const lower = text.toLowerCase();
    let matches = 0;

    for (const keyword of keywords) {
      if (lower.includes(keyword)) matches++;
    }

    return Math.min(1, matches / 3);
  }

  /**
   * Generate human-readable suggestion reason
   */
  private generateSuggestionReason(
    matchingBeads: string[],
    elementalMatch: number,
    domainMatch: number,
    thread: Thread
  ): string {
    const reasons: string[] = [];

    if (matchingBeads.length > 0) {
      reasons.push(`shares ${matchingBeads.length} bead pattern${matchingBeads.length > 1 ? 's' : ''}`);
    }

    if (elementalMatch > 0.5) {
      reasons.push('strong elemental resonance');
    } else if (elementalMatch > 0.2) {
      reasons.push('elemental connection');
    }

    if (domainMatch > 0.5) {
      reasons.push(`${thread.domain} domain match`);
    }

    if (reasons.length === 0) {
      return 'possible connection';
    }

    return reasons.join(', ');
  }

  /**
   * Update thread status
   */
  async updateThreadStatus(
    threadId: string,
    status: ThreadStatus
  ): Promise<Thread> {
    const updates: string[] = ['status = $1', 'last_updated = NOW()'];
    const params: (string | null)[] = [status];

    if (status === 'completed') {
      updates.push('completed_at = NOW()');
    }

    const result = await query<Thread>(`
      UPDATE threads SET ${updates.join(', ')}
      WHERE id = $2
      RETURNING *
    `, [...params, threadId]);

    return result.rows[0];
  }

  /**
   * Add an open question to a thread
   */
  async addOpenQuestion(threadId: string, question: string): Promise<Thread> {
    const result = await query<Thread>(`
      UPDATE threads SET
        open_questions = COALESCE(open_questions, '{}') || $1,
        last_updated = NOW()
      WHERE id = $2
      RETURNING *
    `, [[question], threadId]);

    return result.rows[0];
  }

  /**
   * Add a helpful practice to a thread
   */
  async addHelpfulPractice(threadId: string, practice: string): Promise<Thread> {
    const result = await query<Thread>(`
      UPDATE threads SET
        helpful_practices = COALESCE(helpful_practices, '{}') || $1,
        last_updated = NOW()
      WHERE id = $2
      RETURNING *
    `, [[practice], threadId]);

    return result.rows[0];
  }

  /**
   * Add a stuck pattern to a thread
   */
  async addStuckPattern(threadId: string, pattern: string): Promise<Thread> {
    const result = await query<Thread>(`
      UPDATE threads SET
        stuck_patterns = COALESCE(stuck_patterns, '{}') || $1,
        last_updated = NOW()
      WHERE id = $2
      RETURNING *
    `, [[pattern], threadId]);

    return result.rows[0];
  }

  /**
   * Detect domain from text
   */
  detectDomain(text: string): ThreadDomain | null {
    const lower = text.toLowerCase();
    let bestDomain: ThreadDomain | null = null;
    let bestScore = 0;

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      if (domain === 'other') continue;

      let score = 0;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain as ThreadDomain;
      }
    }

    return bestScore >= 2 ? bestDomain : null;
  }

  /**
   * Suggest a new thread if content doesn't fit existing threads
   */
  async suggestNewThread(
    userId: string,
    detectedBeads: DetectedBead[],
    text: string
  ): Promise<{ title: string; domain: ThreadDomain | null; reason: string } | null> {
    // First check if there's a good match to existing threads
    const suggestions = await this.suggestThread(userId, detectedBeads, text);

    // If there's a strong match, don't suggest new thread
    if (suggestions.length > 0 && suggestions[0].relevance > 0.5) {
      return null;
    }

    // Detect domain
    const domain = this.detectDomain(text);

    // Get primary bead for title generation
    const primaryBead = detectedBeads[0];

    if (!primaryBead && !domain) {
      return null;
    }

    // Generate suggested title
    const title = this.generateThreadTitle(primaryBead, domain, text);

    return {
      title,
      domain,
      reason: primaryBead
        ? `New ${primaryBead.element} movement detected${domain ? ` in ${domain} domain` : ''}`
        : `New ${domain} pattern emerging`
    };
  }

  /**
   * Generate a thread title from context
   */
  private generateThreadTitle(
    primaryBead: DetectedBead | undefined,
    domain: ThreadDomain | null,
    text: string
  ): string {
    const domainLabels: Record<ThreadDomain, string> = {
      vocation: 'Vocation',
      relationship: 'Relationship',
      health: 'Health',
      creativity: 'Creative',
      spirituality: 'Spiritual',
      family: 'Family',
      money: 'Financial',
      identity: 'Identity',
      community: 'Community',
      other: ''
    };

    const elementLabels: Record<Element, string> = {
      fire: 'Transformation',
      water: 'Depth Work',
      earth: 'Building',
      air: 'Clarity',
      aether: 'Integration'
    };

    if (domain && primaryBead) {
      return `${domainLabels[domain]} ${elementLabels[primaryBead.element]}`;
    }

    if (domain) {
      return `${domainLabels[domain]} Journey`;
    }

    if (primaryBead) {
      return `${elementLabels[primaryBead.element]} Path`;
    }

    // Extract first meaningful phrase from text
    const firstSentence = text.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 5 && firstSentence.length < 50) {
      return firstSentence;
    }

    return 'New Thread';
  }
}

// Export singleton instance
export const ThreadService = new ThreadServiceImpl();
export default ThreadService;
