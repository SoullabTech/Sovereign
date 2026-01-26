/**
 * EntryPipeline: 3-Write Memory Integration
 *
 * Every journal/capture entry triggers three possible writes:
 * - Write A: Event Memory (Always) - The raw entry + detected beads
 * - Write B: Thread Memory (Often) - Link to thread, update phase/questions
 * - Write C: Pattern Memory (When Meaningful) - Update transitions, cycles, profile
 *
 * This is the single entry point for all journal/capture saves.
 */

import { BeadService, type DetectedBead, type Bead, type VoiceFeatures } from './BeadService';
import { ThreadService, type Thread, type ThreadEvent, type ThreadSuggestion } from './ThreadService';
import { SpiralProfileService } from './SpiralProfileService';
import type { Element } from '@/lib/voice/types';

// ----- Types -----

export type EntrySourceType = 'journal' | 'capture' | 'conversation' | 'episode' | 'elemental_journal';

export interface EntryInput {
  userId: string;
  sourceType: EntrySourceType;
  sourceId: string;
  content: string;
  voiceFeatures?: VoiceFeatures;
  isSanctuary?: boolean;
  threadId?: string;           // If entry is explicitly linked to a thread
  metadata?: {
    entryType?: string;        // 'dream', 'day', 'handwriting', etc.
    tags?: string[];
    element?: Element;         // If already detected elsewhere
    facet?: string;
  };
}

export interface PipelineResult {
  // Write A: Event Memory
  detectedBeads: DetectedBead[];
  activatedBeads: Array<{ bead: Bead; activationId: string; wasCreated: boolean }>;

  // Write B: Thread Memory
  threadSuggestions: ThreadSuggestion[];
  linkedThread: Thread | null;
  threadEvent: ThreadEvent | null;
  suggestedNewThread: { title: string; domain: string | null; reason: string } | null;

  // Write C: Pattern Memory
  transitionRecorded: boolean;
  cycleDetected: string | null;  // Cycle name if detected
  loopWarning: boolean;          // True if stuck in loop pattern

  // Meta
  wasSanctuary: boolean;
  processingTimeMs: number;
}

// Store last bead code per user for transition tracking
const lastBeadCache = new Map<string, { code: string; element: Element; facet: string | null; timestamp: number }>();

// ----- Pipeline Class -----

class EntryPipelineImpl {
  /**
   * Process an entry through the full 3-write pipeline
   */
  async process(input: EntryInput): Promise<PipelineResult> {
    const startTime = Date.now();

    const result: PipelineResult = {
      detectedBeads: [],
      activatedBeads: [],
      threadSuggestions: [],
      linkedThread: null,
      threadEvent: null,
      suggestedNewThread: null,
      transitionRecorded: false,
      cycleDetected: null,
      loopWarning: false,
      wasSanctuary: input.isSanctuary ?? false,
      processingTimeMs: 0
    };

    // Sanctuary mode: detect but don't persist
    if (input.isSanctuary) {
      result.detectedBeads = await BeadService.detectBeads(
        input.userId,
        input.content,
        input.voiceFeatures
      );
      result.processingTimeMs = Date.now() - startTime;
      return result;
    }

    try {
      // ===== WRITE A: Event Memory (Always) =====
      await this.processEventMemory(input, result);

      // ===== WRITE B: Thread Memory (Often) =====
      await this.processThreadMemory(input, result);

      // ===== WRITE C: Pattern Memory (When Meaningful) =====
      await this.processPatternMemory(input, result);

    } catch (error) {
      console.error('[EntryPipeline] Error processing entry:', error);
      // Don't throw - return partial result
    }

    result.processingTimeMs = Date.now() - startTime;
    return result;
  }

  /**
   * Write A: Event Memory
   * Detect beads and record activations
   */
  private async processEventMemory(
    input: EntryInput,
    result: PipelineResult
  ): Promise<void> {
    // Detect beads from content
    result.detectedBeads = await BeadService.detectBeads(
      input.userId,
      input.content,
      input.voiceFeatures
    );

    if (result.detectedBeads.length === 0) {
      return;
    }

    // Collect all bead IDs for co-activation tracking
    const activatedBeadIds: string[] = [];

    // Activate each detected bead
    for (const detected of result.detectedBeads) {
      try {
        const activation = await BeadService.activateBead(
          input.userId,
          detected.code,
          input.sourceType,
          input.sourceId,
          {
            intensity: detected.intensity,
            label: detected.label,
            element: detected.element,
            facet: detected.facet,
            polarity: detected.polarity,
            isSanctuary: false
          }
        );

        result.activatedBeads.push({
          bead: activation.bead,
          activationId: activation.activation.id,
          wasCreated: activation.wasCreated
        });

        activatedBeadIds.push(activation.bead.id);
      } catch (error) {
        console.warn(`[EntryPipeline] Failed to activate bead ${detected.code}:`, error);
      }
    }

    // Update co-activation references (done after all beads activated)
    // This is a minor optimization - could be skipped for simplicity
  }

  /**
   * Write B: Thread Memory
   * Link to threads, update phase, track questions
   */
  private async processThreadMemory(
    input: EntryInput,
    result: PipelineResult
  ): Promise<void> {
    if (result.detectedBeads.length === 0) {
      return;
    }

    // If thread is explicitly specified, use it
    if (input.threadId) {
      const thread = await ThreadService.getThread(input.threadId);
      if (thread) {
        result.linkedThread = thread;
        result.threadEvent = await this.addToThread(input, result, thread);
        return;
      }
    }

    // Suggest threads based on detected beads
    result.threadSuggestions = await ThreadService.suggestThread(
      input.userId,
      result.detectedBeads,
      input.content
    );

    // If strong suggestion, auto-link
    if (result.threadSuggestions.length > 0 && result.threadSuggestions[0].relevance > 0.6) {
      result.linkedThread = result.threadSuggestions[0].thread;
      result.threadEvent = await this.addToThread(input, result, result.threadSuggestions[0].thread);
    } else {
      // Check if we should suggest a new thread
      result.suggestedNewThread = await ThreadService.suggestNewThread(
        input.userId,
        result.detectedBeads,
        input.content
      );
    }
  }

  /**
   * Add entry to a thread
   */
  private async addToThread(
    input: EntryInput,
    result: PipelineResult,
    thread: Thread
  ): Promise<ThreadEvent> {
    // Determine if there's a phase change
    const primaryBead = result.detectedBeads[0];
    const phaseChange = primaryBead?.facet && primaryBead.facet !== thread.current_phase
      ? { from: thread.current_phase, to: primaryBead.facet }
      : undefined;

    // Create thread event
    const event = await ThreadService.addToThread(
      thread.id,
      input.userId,
      input.sourceType,
      input.sourceId,
      {
        eventType: 'entry',
        summary: this.generateSummary(input.content),
        beadIds: result.activatedBeads.map(ab => ab.bead.id),
        phaseChange
      }
    );

    return event;
  }

  /**
   * Write C: Pattern Memory
   * Update transitions, detect cycles, update profile
   */
  private async processPatternMemory(
    input: EntryInput,
    result: PipelineResult
  ): Promise<void> {
    if (result.activatedBeads.length === 0) {
      return;
    }

    // Get the primary activated bead
    const primaryBead = result.activatedBeads[0];

    // Check for transition from last bead
    const lastBead = lastBeadCache.get(input.userId);

    if (lastBead) {
      // Record transition
      try {
        await SpiralProfileService.recordTransition(
          input.userId,
          primaryBead.bead.code,
          primaryBead.bead.element as Element,
          primaryBead.bead.facet,
          {
            fromBeadCode: lastBead.code,
            fromElement: lastBead.element,
            fromFacet: lastBead.facet ?? undefined,
            sourceType: input.sourceType,
            sourceId: input.sourceId
          }
        );
        result.transitionRecorded = true;
      } catch (error) {
        console.warn('[EntryPipeline] Failed to record transition:', error);
      }
    }

    // Update last bead cache
    lastBeadCache.set(input.userId, {
      code: primaryBead.bead.code,
      element: primaryBead.bead.element as Element,
      facet: primaryBead.bead.facet,
      timestamp: Date.now()
    });

    // Check for cycle completion
    const recentBeads = await this.getRecentBeadCodes(input.userId, 10);
    const cycle = await SpiralProfileService.detectCycle(input.userId, recentBeads);

    if (cycle) {
      result.cycleDetected = cycle.name;
    }

    // Check for loop pattern (same bead 3+ times in a row)
    if (recentBeads.length >= 3 &&
        recentBeads[0] === recentBeads[1] &&
        recentBeads[1] === recentBeads[2]) {
      result.loopWarning = true;
    }

    // Update profile stats
    await SpiralProfileService.incrementEntriesProcessed(input.userId);

    // Periodically update confidence and elemental strengths
    const profile = await SpiralProfileService.getProfile(input.userId);
    if (profile.total_entries_processed % 10 === 0) {
      await SpiralProfileService.updateProfileConfidence(input.userId);
      await SpiralProfileService.updateElementalStrengths(input.userId);
    }
  }

  /**
   * Get recent bead codes for a user
   */
  private async getRecentBeadCodes(userId: string, limit: number): Promise<string[]> {
    const beads = await BeadService.getActiveBeads(userId, limit);
    return beads.map(b => b.code);
  }

  /**
   * Generate a brief summary from content
   */
  private generateSummary(content: string): string {
    // Take first sentence or first 100 chars
    const firstSentence = content.split(/[.!?]/)[0];
    if (firstSentence.length <= 100) {
      return firstSentence.trim();
    }
    return content.substring(0, 97).trim() + '...';
  }

  /**
   * Process entry with explicit thread creation
   * Use when user confirms a suggested new thread
   */
  async processWithNewThread(
    input: EntryInput,
    threadTitle: string,
    threadDomain?: string
  ): Promise<PipelineResult & { createdThread: Thread }> {
    // Create the thread first
    const thread = await ThreadService.createThread(
      input.userId,
      threadTitle,
      {
        domain: threadDomain as any,
        description: `Created from ${input.sourceType} entry`
      }
    );

    // Process with the new thread
    const result = await this.process({
      ...input,
      threadId: thread.id
    });

    return {
      ...result,
      createdThread: thread
    };
  }

  /**
   * Process a batch of entries (for backfill/import)
   */
  async processBatch(
    entries: EntryInput[]
  ): Promise<{ processed: number; failed: number; results: PipelineResult[] }> {
    const results: PipelineResult[] = [];
    let failed = 0;

    for (const entry of entries) {
      try {
        const result = await this.process(entry);
        results.push(result);
      } catch (error) {
        console.error(`[EntryPipeline] Batch entry failed:`, error);
        failed++;
      }
    }

    return {
      processed: results.length,
      failed,
      results
    };
  }

  /**
   * Clear the last bead cache for a user (use on session end or manual reset)
   */
  clearCache(userId: string): void {
    lastBeadCache.delete(userId);
  }

  /**
   * Get the current cached state for a user (for debugging/dashboard)
   */
  getCacheState(userId: string): { lastBead: string | null; cacheAge: number } | null {
    const cached = lastBeadCache.get(userId);
    if (!cached) return null;

    return {
      lastBead: cached.code,
      cacheAge: Date.now() - cached.timestamp
    };
  }
}

// Export singleton instance
export const EntryPipeline = new EntryPipelineImpl();
export default EntryPipeline;
