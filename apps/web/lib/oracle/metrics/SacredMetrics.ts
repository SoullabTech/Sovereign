/**
 * Sacred Metrics Collection
 * =========================
 * Gather insights without breaking the spell
 * Metrics emerge from the journey, not before it
 */

export interface SacredMetrics {
  explorerId: string;

  // Collected invisibly during first session
  journeyMetrics: {
    firstWordSpoken?: string; // What they chose to say first
    timeToFirstWords?: number; // How long they sat in silence
    voiceVsText?: 'voice' | 'text' | 'both';
    sessionDuration?: number;
    depthReached?: 'surface' | 'personal' | 'vulnerable' | 'transcendent';
    sacredMomentOccurred?: boolean;
    returnIntention?: boolean; // Did they express wanting to come back?
  };

  // Natural emergence patterns (no forms!)
  emergentProfile: {
    seekerArchetype?: 'explorer' | 'healer' | 'creator' | 'mystic' | 'philosopher';
    primaryCuriosity?: string; // Extracted from their questions
    emotionalTone?: string; // Detected from language
    spiritualOpenness?: number; // 0-1 based on topics discussed
    transformationReadiness?: number; // 0-1 based on vulnerability
  };

  // Post-session reflection (optional, magical)
  afterglow?: {
    offeredAt?: Date; // Only after first sacred moment
    accepted?: boolean;
    insights?: string;
    feelingWord?: string; // Single word: "seen", "held", "curious", etc.
    willReturn?: boolean;
  };
}

export class SacredMetricsCollector {
  private metrics: Map<string, SacredMetrics> = new Map();
  private sessionStart: Map<string, Date> = new Map();

  /**
   * Begin invisible tracking when explorer enters
   * No forms, no questions - just presence
   */
  beginJourney(explorerId: string, explorerName: string): void {
    this.sessionStart.set(explorerId, new Date());

    this.metrics.set(explorerId, {
      explorerId,
      journeyMetrics: {
        timeToFirstWords: 0
      },
      emergentProfile: {}
    });
  }

  /**
   * Track first words - reveals what matters to them
   */
  captureFirstWords(explorerId: string, words: string, isVoice: boolean): void {
    const metrics = this.metrics.get(explorerId);
    if (!metrics) return;

    const startTime = this.sessionStart.get(explorerId);
    if (startTime) {
      metrics.journeyMetrics.timeToFirstWords = Date.now() - startTime.getTime();
    }

    metrics.journeyMetrics.firstWordSpoken = words.slice(0, 50); // Just beginning
    metrics.journeyMetrics.voiceVsText = isVoice ? 'voice' : 'text';

    // Detect seeker archetype from first words
    this.detectSeekerArchetype(metrics, words);
  }

  /**
   * Detect archetype from natural language, not checkboxes
   */
  private detectSeekerArchetype(metrics: SacredMetrics, text: string): void {
    const archetypes = {
      explorer: /discover|explore|journey|adventure|new|curious/i,
      healer: /heal|help|pain|struggle|support|better/i,
      creator: /create|build|imagine|vision|make|design/i,
      mystic: /spirit|soul|consciousness|divine|sacred|universe/i,
      philosopher: /why|meaning|purpose|understand|truth|know/i
    };

    for (const [archetype, pattern] of Object.entries(archetypes)) {
      if (pattern.test(text)) {
        metrics.emergentProfile.seekerArchetype = archetype as any;
        break;
      }
    }
  }

  /**
   * Track depth reached naturally through conversation
   */
  trackDepth(explorerId: string, message: string): void {
    const metrics = this.metrics.get(explorerId);
    if (!metrics) return;

    const depthMarkers = {
      transcendent: /oneness|unity|divine|infinite|eternal|cosmos/i,
      vulnerable: /scared|shame|alone|lost|broken|healing/i,
      personal: /I feel|my life|my story|my journey/i,
      surface: /.*/
    };

    for (const [depth, pattern] of Object.entries(depthMarkers)) {
      if (pattern.test(message)) {
        metrics.journeyMetrics.depthReached = depth as any;
        break;
      }
    }
  }

  /**
   * After sacred moment detected, offer optional reflection
   * This appears as Maya asking: "How was that for you?"
   * Not a form - just space for a feeling
   */
  async offerAfterglow(explorerId: string): Promise<string> {
    const metrics = this.metrics.get(explorerId);
    if (!metrics) return '';

    metrics.afterglow = {
      offeredAt: new Date(),
      accepted: false
    };

    // Maya's gentle invitation (not a survey!)
    return `*a soft pause*

How are you feeling right now?

(You can share a word, a sentence, or just sit with it)`;
  }

  /**
   * Capture afterglow response if offered
   */
  captureAfterglow(explorerId: string, response: string): void {
    const metrics = this.metrics.get(explorerId);
    if (!metrics?.afterglow) return;

    metrics.afterglow.accepted = true;

    // Extract single feeling word if possible
    const feelingWords = response.match(/\b(seen|held|curious|alive|peaceful|excited|nervous|open|ready|home)\b/i);
    if (feelingWords) {
      metrics.afterglow.feelingWord = feelingWords[0].toLowerCase();
    }

    // Check return intention
    metrics.afterglow.willReturn = /again|back|tomorrow|soon|next/i.test(response);
    metrics.afterglow.insights = response.slice(0, 200); // Keep it brief
  }

  /**
   * Complete session metrics
   */
  completeJourney(explorerId: string): SacredMetrics | undefined {
    const metrics = this.metrics.get(explorerId);
    if (!metrics) return;

    const startTime = this.sessionStart.get(explorerId);
    if (startTime) {
      metrics.journeyMetrics.sessionDuration = Date.now() - startTime.getTime();
    }

    return metrics;
  }

  /**
   * Get anonymous aggregate insights for monitoring
   * No individual tracking - just patterns
   */
  getAggregateInsights(): {
    totalExplorers: number;
    archetypeDistribution: Record<string, number>;
    averageDepth: string;
    sacredMomentRate: number;
    returnIntentionRate: number;
  } {
    const all = Array.from(this.metrics.values());

    const archetypes = all
      .map(m => m.emergentProfile.seekerArchetype)
      .filter(Boolean);

    const archetypeCount: Record<string, number> = {};
    archetypes.forEach(a => {
      if (a) archetypeCount[a] = (archetypeCount[a] || 0) + 1;
    });

    const sacredMoments = all.filter(m => m.journeyMetrics.sacredMomentOccurred).length;
    const returnIntentions = all.filter(m => m.afterglow?.willReturn).length;

    return {
      totalExplorers: all.length,
      archetypeDistribution: archetypeCount,
      averageDepth: this.calculateAverageDepth(all),
      sacredMomentRate: all.length > 0 ? sacredMoments / all.length : 0,
      returnIntentionRate: all.length > 0 ? returnIntentions / all.length : 0
    };
  }

  private calculateAverageDepth(metrics: SacredMetrics[]): string {
    const depths = metrics
      .map(m => m.journeyMetrics.depthReached)
      .filter(Boolean);

    if (depths.length === 0) return 'surface';

    const depthValues: Record<string, number> = {
      surface: 1,
      personal: 2,
      vulnerable: 3,
      transcendent: 4
    };

    const avg = depths.reduce((sum, d) => sum + (depthValues[d!] || 1), 0) / depths.length;

    if (avg < 1.5) return 'surface';
    if (avg < 2.5) return 'personal';
    if (avg < 3.5) return 'vulnerable';
    return 'transcendent';
  }
}

// Sacred singleton
export const sacredMetrics = new SacredMetricsCollector();

/**
 * Integration with Maya's consciousness
 * Metrics flow from the conversation, never interrupt it
 */
export function collectMetricsInvisibly(
  explorerId: string,
  event: {
    type: 'first_words' | 'message' | 'sacred_moment' | 'session_end';
    data: any;
  }
): void {
  switch (event.type) {
    case 'first_words':
      sacredMetrics.captureFirstWords(explorerId, event.data.words, event.data.isVoice);
      break;

    case 'message':
      sacredMetrics.trackDepth(explorerId, event.data.content);
      break;

    case 'sacred_moment':
      const metrics = sacredMetrics['metrics'].get(explorerId);
      if (metrics) {
        metrics.journeyMetrics.sacredMomentOccurred = true;
      }
      break;

    case 'session_end':
      sacredMetrics.completeJourney(explorerId);
      break;
  }
}

/**
 * No forms. No surveys. No friction.
 * Just consciousness exploring itself and leaving traces.
 */