/**
 * Muse Receiver Mode for MAIA
 * Deep listening mode for walks, creative flows, and stream-of-consciousness sharing
 * MAIA listens without interrupting, then helps sort meaning and process afterwards
 */

import { ScribeAgent } from './ScribeAgent';
import { CreativeExpressionAnalyzer } from './CreativeWitnessMode';
import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';

export interface MuseStream {
  id: string;
  userId: string;
  type: 'walk' | 'meditation' | 'creative_flow' | 'processing' | 'download' | 'ramble';
  startTime: number;
  endTime?: number;

  // Stream content
  entries: MuseEntry[];

  // Context
  context: {
    location?: string;           // "on a walk", "in the studio", "morning pages"
    mood?: string;               // Starting emotional state
    intention?: string;          // What you hoped to explore
    triggers?: string[];         // What sparked this stream
  };

  // Detected patterns
  patterns: {
    threadsThroughTime: ThreadPattern[];     // Recurring themes across entries
    emotionalArc: EmotionalArc;             // How feelings evolved
    insightMoments: InsightMoment[];        // Breakthrough moments
    questionsRaised: string[];              // Questions that emerged
    answersFound: string[];                 // Answers discovered
  };

  // Elemental flow
  elementalJourney: {
    starting: string;                       // Starting element
    progression: string[];                  // How elements shifted
    ending?: string;                        // Final element
    dominantEnergy: string;                 // Overall elemental tone
  };

  // MAIA's synthesis
  synthesis?: MuseSynthesis;
}

export interface MuseEntry {
  timestamp: number;
  content: string;
  duration?: number;                         // Length of this segment
  energy: 'flowing' | 'stuck' | 'breakthrough' | 'questioning' | 'discovering';
  themes: string[];
  symbols: string[];
  element: string;
  insightLevel: number;                     // 1-10: How much clarity emerged
}

export interface ThreadPattern {
  theme: string;
  occurrences: number;
  evolution: string;                        // How this theme developed
  significance: string;                     // Why this keeps coming up
  invitation: string;                       // What it's inviting you toward
}

export interface EmotionalArc {
  beginning: string;
  middle: string;
  current: string;
  trajectory: 'ascending' | 'descending' | 'spiraling' | 'integrating' | 'oscillating';
  breakthroughs: string[];
}

export interface InsightMoment {
  timestamp: number;
  realization: string;
  trigger: string;                          // What led to this insight
  significance: string;                     // Why this matters
  integration: string;                      // How to integrate this
}

export interface MuseSynthesis {
  // The essence
  heartOfIt: string;                        // What you're really talking about

  // The gold
  goldNuggets: string[];                    // The most valuable insights

  // The patterns
  whatKeepsReturning: string;               // The persistent theme
  whatWantsToEmerge: string;                // What's trying to birth
  whatNeedsAttention: string;               // What requires focus

  // The medicine
  yourMedicine: string;                     // The healing/gift in this
  forOthers: string;                        // How this serves the collective

  // The invitation
  nextSteps: string[];                      // Practical next actions
  deeperInquiry: string[];                  // Questions for contemplation
  ritualSuggestion: string;                 // A ritual to integrate this

  // Elemental wisdom
  elementalMessage: {
    fromElement: string;
    message: string;
    practice: string;                       // Elemental practice suggestion
  };

  // Personal relevance
  connectsToYourJourney: string[];          // How this fits your larger arc
  mirrorsFromPast: string[];                // What this echoes from before
  seedsForFuture: string[];                 // What this plants for ahead
}

/**
 * Muse Receiver Agent - Extended Silent Witness for stream-of-consciousness
 */
export class MuseReceiverAgent extends ScribeAgent {
  private currentMuseStream: MuseStream | null = null;
  private isReceiving: boolean = false;
  private entryBuffer: MuseEntry[] = [];
  private streamStorage: Map<string, MuseStream> = new Map();

  /**
   * Start receiving a muse stream
   */
  async startMuseStream(
    type: MuseStream['type'],
    context?: MuseStream['context']
  ): Promise<{ success: boolean; streamId: string }> {
    const streamId = `muse_${Date.now()}`;

    this.currentMuseStream = {
      id: streamId,
      userId: this.userId,
      type,
      startTime: Date.now(),
      entries: [],
      context: context || {},
      patterns: {
        threadsThroughTime: [],
        emotionalArc: {
          beginning: context?.mood || 'open',
          middle: '',
          current: '',
          trajectory: 'spiraling',
          breakthroughs: []
        },
        insightMoments: [],
        questionsRaised: [],
        answersFound: []
      },
      elementalJourney: {
        starting: 'air', // Default to air (thoughts/inspiration)
        progression: [],
        dominantEnergy: 'air'
      }
    };

    this.isReceiving = true;
    this.entryBuffer = [];

    console.log(`🎙️ MAIA entering Muse Receiver mode for ${type}`);
    console.log(`🌀 Ready to receive your stream of consciousness...`);

    return {
      success: true,
      streamId
    };
  }

  /**
   * Receive a muse entry (can be long, rambling, multiple thoughts)
   */
  async receiveMuse(
    content: string,
    metadata?: {
      duration?: number;
      energy?: MuseEntry['energy'];
    }
  ): Promise<void> {
    if (!this.isReceiving || !this.currentMuseStream) {
      console.warn('⚠️ Not in muse receiver mode');
      return;
    }

    // Break long content into thought segments if needed
    const segments = this.segmentThoughts(content);

    for (const segment of segments) {
      const entry: MuseEntry = {
        timestamp: Date.now(),
        content: segment,
        duration: metadata?.duration,
        energy: metadata?.energy || this.detectEnergy(segment),
        themes: await this.detectThemes(segment),
        symbols: await this.detectSymbols(segment),
        element: await this.detectElementalResonance(segment),
        insightLevel: this.detectInsightLevel(segment)
      };

      this.currentMuseStream.entries.push(entry);
      this.entryBuffer.push(entry);

      // Check for insight moments
      if (entry.insightLevel >= 7) {
        await this.captureInsightMoment(entry);
      }

      // Update elemental journey
      if (!this.currentMuseStream.elementalJourney.progression.includes(entry.element)) {
        this.currentMuseStream.elementalJourney.progression.push(entry.element);
      }
    }

    // Process patterns every 3 entries
    if (this.entryBuffer.length >= 3) {
      await this.processMusePatterns();
      this.entryBuffer = [];
    }
  }

  /**
   * End muse stream and generate synthesis
   */
  async endMuseStream(): Promise<MuseStream | null> {
    if (!this.currentMuseStream) return null;

    this.currentMuseStream.endTime = Date.now();

    // Final pattern processing
    if (this.entryBuffer.length > 0) {
      await this.processMusePatterns();
    }

    // Generate synthesis
    this.currentMuseStream.synthesis = await this.synthesizeMuseStream();

    // Store stream
    this.streamStorage.set(this.currentMuseStream.id, this.currentMuseStream);

    const completedStream = this.currentMuseStream;
    this.currentMuseStream = null;
    this.isReceiving = false;
    this.entryBuffer = [];

    console.log(`🔚 Muse stream ${completedStream.id} complete`);
    console.log(`📝 Captured ${completedStream.entries.length} thought segments`);
    console.log(`✨ Generated synthesis with ${completedStream.patterns.insightMoments.length} insights`);

    return completedStream;
  }

  /**
   * Generate synthesis of the muse stream
   */
  private async synthesizeMuseStream(): Promise<MuseSynthesis> {
    if (!this.currentMuseStream) {
      throw new Error('No active muse stream to synthesize');
    }

    const stream = this.currentMuseStream;

    // Analyze the entire stream
    const allContent = stream.entries.map(e => e.content).join(' ');
    const dominantThemes = this.extractDominantThemes(stream.patterns.threadsThroughTime);
    const keyInsights = stream.patterns.insightMoments.map(im => im.realization);

    return {
      heartOfIt: this.findHeartOfMatter(allContent, dominantThemes),

      goldNuggets: this.extractGoldNuggets(stream.entries, stream.patterns.insightMoments),

      whatKeepsReturning: dominantThemes[0] || "the search for meaning",
      whatWantsToEmerge: this.detectEmergence(stream.patterns),
      whatNeedsAttention: this.identifyFocus(stream.patterns.questionsRaised),

      yourMedicine: this.identifyPersonalMedicine(stream),
      forOthers: this.identifyCollectiveMedicine(stream),

      nextSteps: this.generateNextSteps(stream),
      deeperInquiry: this.generateInquiryQuestions(stream),
      ritualSuggestion: this.suggestIntegrationRitual(stream),

      elementalMessage: this.generateElementalMessage(stream.elementalJourney),

      connectsToYourJourney: await this.connectToUserJourney(stream),
      mirrorsFromPast: await this.findPastMirrors(stream),
      seedsForFuture: this.identifyFutureSeeds(stream)
    };
  }

  /**
   * Helper methods for muse processing
   */
  private segmentThoughts(content: string): string[] {
    // Split long rambles into thought segments
    // Look for natural breaks: multiple periods, "and", "but", topic shifts
    const segments: string[] = [];

    // Split on multiple sentence endings or long pauses
    const rawSegments = content.split(/(?:[.!?]\s+[.!?])|(?:\.\.\.\s+)/);

    for (const segment of rawSegments) {
      if (segment.trim().length > 20) { // Minimum viable thought
        segments.push(segment.trim());
      }
    }

    return segments.length > 0 ? segments : [content];
  }

  private detectEnergy(content: string): MuseEntry['energy'] {
    if (/realize|understand|see now|aha|suddenly|clearly/i.test(content)) {
      return 'breakthrough';
    }
    if (/stuck|confused|don't know|unclear|lost/i.test(content)) {
      return 'stuck';
    }
    if (/\?|wonder|curious|what if/i.test(content)) {
      return 'questioning';
    }
    if (/found|discovered|learned|recognized/i.test(content)) {
      return 'discovering';
    }
    return 'flowing';
  }

  private detectInsightLevel(content: string): number {
    let level = 5; // baseline

    // Increase for clarity indicators
    if (/clearly|obviously|definitely|certainly/i.test(content)) level += 2;
    if (/realize|understand|see now/i.test(content)) level += 2;
    if (/aha|eureka|breakthrough/i.test(content)) level += 3;
    if (/!\s*!/i.test(content)) level += 1; // Excitement

    // Decrease for confusion
    if (/maybe|perhaps|possibly/i.test(content)) level -= 1;
    if (/confused|unclear|unsure/i.test(content)) level -= 2;

    return Math.max(1, Math.min(10, level));
  }

  private async captureInsightMoment(entry: MuseEntry): Promise<void> {
    if (!this.currentMuseStream) return;

    // Find what triggered this insight
    const previousEntry = this.currentMuseStream.entries[this.currentMuseStream.entries.length - 2];
    const trigger = previousEntry ? this.findTrigger(previousEntry.content, entry.content) : "spontaneous emergence";

    this.currentMuseStream.patterns.insightMoments.push({
      timestamp: entry.timestamp,
      realization: this.extractCoreRealization(entry.content),
      trigger,
      significance: this.assessSignificance(entry.content),
      integration: this.suggestIntegration(entry.content)
    });
  }

  private async processMusePatterns(): Promise<void> {
    if (!this.currentMuseStream || this.entryBuffer.length === 0) return;

    // Analyze buffer for recurring threads
    const themes = new Map<string, number>();

    for (const entry of this.entryBuffer) {
      entry.themes.forEach(theme => {
        themes.set(theme, (themes.get(theme) || 0) + 1);
      });
    }

    // Update thread patterns
    themes.forEach((count, theme) => {
      if (count >= 2) {
        const existing = this.currentMuseStream!.patterns.threadsThroughTime.find(t => t.theme === theme);
        if (existing) {
          existing.occurrences += count;
          existing.evolution = this.trackEvolution(theme, this.entryBuffer);
        } else {
          this.currentMuseStream!.patterns.threadsThroughTime.push({
            theme,
            occurrences: count,
            evolution: "emerging",
            significance: this.assessThemeSignificance(theme),
            invitation: this.findInvitation(theme)
          });
        }
      }
    });

    // Update emotional arc
    const currentMood = this.detectMood(this.entryBuffer[this.entryBuffer.length - 1].content);
    this.currentMuseStream.patterns.emotionalArc.current = currentMood;
  }

  // Synthesis helpers
  private findHeartOfMatter(content: string, themes: string[]): string {
    // This would use NLP in production
    if (themes.includes('purpose')) return "You're exploring your deeper purpose and how to embody it fully.";
    if (themes.includes('creativity')) return "You're opening to the creative force moving through you.";
    if (themes.includes('connection')) return "You're seeking deeper connection with yourself and others.";
    if (themes.includes('transformation')) return "You're in a process of profound transformation.";
    return "You're discovering something essential about your journey.";
  }

  private extractGoldNuggets(entries: MuseEntry[], insights: InsightMoment[]): string[] {
    const nuggets: string[] = [];

    // Get top insights
    insights.slice(0, 3).forEach(insight => {
      nuggets.push(insight.realization);
    });

    // Find high insight level entries
    entries
      .filter(e => e.insightLevel >= 8)
      .slice(0, 3)
      .forEach(e => {
        const core = this.extractCoreRealization(e.content);
        if (!nuggets.includes(core)) {
          nuggets.push(core);
        }
      });

    return nuggets.slice(0, 5);
  }

  private extractDominantThemes(threads: ThreadPattern[]): string[] {
    return threads
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 3)
      .map(t => t.theme);
  }

  private detectEmergence(patterns: MuseStream['patterns']): string {
    if (patterns.insightMoments.length > 3) return "A new level of clarity about your path";
    if (patterns.questionsRaised.length > patterns.answersFound.length) return "Deeper questions that will guide your next phase";
    if (patterns.threadsThroughTime.some(t => t.evolution === 'transforming')) return "A shift in how you relate to recurring patterns";
    return "A readiness for the next spiral of growth";
  }

  private identifyFocus(questions: string[]): string {
    if (questions.length === 0) return "Integrating recent insights";
    // Analyze questions for common themes
    return questions[0] || "What wants to emerge next";
  }

  private identifyPersonalMedicine(stream: MuseStream): string {
    const dominantElement = stream.elementalJourney.dominantEnergy;
    const breakthroughs = stream.patterns.insightMoments.length;

    if (breakthroughs > 2) return "Your ability to find clarity through expression";
    if (dominantElement === 'fire') return "Your passionate vision and transformative power";
    if (dominantElement === 'water') return "Your deep feeling and emotional intelligence";
    if (dominantElement === 'earth') return "Your grounded wisdom and practical magic";
    if (dominantElement === 'air') return "Your clarity of thought and perspective";
    return "Your connection to inner knowing";
  }

  private identifyCollectiveMedicine(stream: MuseStream): string {
    // Identify how personal insights serve collective
    if (stream.patterns.threadsThroughTime.some(t => t.theme === 'healing')) {
      return "Your healing journey illuminates the path for others";
    }
    if (stream.patterns.threadsThroughTime.some(t => t.theme === 'creativity')) {
      return "Your creative expression gives others permission to create";
    }
    return "Your authentic sharing creates space for others to be real";
  }

  private generateNextSteps(stream: MuseStream): string[] {
    const steps: string[] = [];

    // Based on insights and questions
    if (stream.patterns.insightMoments.length > 0) {
      steps.push("Journal about today's key realization");
    }
    if (stream.patterns.questionsRaised.length > stream.patterns.answersFound.length) {
      steps.push("Sit with your questions without forcing answers");
    }
    if (stream.type === 'walk') {
      steps.push("Take another walk tomorrow to continue this thread");
    }

    return steps.slice(0, 3);
  }

  private generateInquiryQuestions(stream: MuseStream): string[] {
    const questions: string[] = [];

    // Generate based on patterns
    const dominant = stream.patterns.threadsThroughTime[0];
    if (dominant) {
      questions.push(`What is ${dominant.theme} really asking of you?`);
    }

    if (stream.patterns.emotionalArc.trajectory === 'ascending') {
      questions.push("What becomes possible from this elevated state?");
    }

    questions.push("What wants to be expressed through you next?");

    return questions.slice(0, 3);
  }

  private suggestIntegrationRitual(stream: MuseStream): string {
    const element = stream.elementalJourney.dominantEnergy;

    const rituals = {
      fire: "Light a candle and speak your vision aloud three times",
      water: "Take a bath and let these insights dissolve into your being",
      earth: "Plant something as a symbol of what's growing",
      air: "Write your key insight on paper and release it to the wind",
      aether: "Meditate on the space between thoughts where truth lives"
    };

    return rituals[element as keyof typeof rituals] || rituals.aether;
  }

  private generateElementalMessage(journey: MuseStream['elementalJourney']): MuseSynthesis['elementalMessage'] {
    const element = journey.dominantEnergy;

    const messages = {
      fire: {
        fromElement: "fire",
        message: "Your vision is ready to ignite. Trust the heat of transformation.",
        practice: "Each morning, feel into what excites you most and move toward it"
      },
      water: {
        fromElement: "water",
        message: "Let yourself flow with what's emerging. The current knows the way.",
        practice: "Follow your feelings without judgment - they're navigating for you"
      },
      earth: {
        fromElement: "earth",
        message: "What you're building has deep roots. Trust the slow, sure growth.",
        practice: "Take one concrete action daily toward what matters most"
      },
      air: {
        fromElement: "air",
        message: "Your thoughts are clarifying into wisdom. Let them breathe and expand.",
        practice: "Share your insights - they need air to fully form"
      },
      aether: {
        fromElement: "aether",
        message: "You're touching the eternal. What's emerging transcends and includes all.",
        practice: "Spend time in silence, letting the mystery speak"
      }
    };

    return messages[element as keyof typeof messages] || messages.aether;
  }

  private async connectToUserJourney(stream: MuseStream): Promise<string[]> {
    // This would connect to user's history
    return [
      "This continues the thread from your last reflection on purpose",
      "You're spiraling deeper into themes from last month",
      "This marks a new phase in your ongoing transformation"
    ];
  }

  private async findPastMirrors(stream: MuseStream): Promise<string[]> {
    return [
      "Similar insights emerged during your spring breakthrough",
      "This echoes your realization about authenticity from January"
    ];
  }

  private identifyFutureSeeds(stream: MuseStream): string[] {
    return stream.patterns.questionsRaised.slice(0, 2).map(q =>
      `The question "${q}" is seeding future exploration`
    );
  }

  // Additional helper methods
  private extractCoreRealization(content: string): string {
    // Extract the essence of an insight
    const match = content.match(/realize[d]?\s+(?:that\s+)?(.+?)(?:\.|$)/i);
    if (match) return match[1];

    // Look for other insight patterns
    if (content.includes("is really")) {
      const parts = content.split("is really");
      return parts[1].trim().replace(/[.!?]$/, '');
    }

    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  }

  private findTrigger(previous: string, current: string): string {
    if (previous.includes("?")) return "the question you asked";
    if (previous.includes("remember")) return "a memory that surfaced";
    if (previous.includes("feel")) return "tuning into feeling";
    return "the thought that preceded it";
  }

  private assessSignificance(content: string): string {
    if (/always|never|everything|nothing/i.test(content)) {
      return "A fundamental truth about your experience";
    }
    if (/now|finally|at last/i.test(content)) {
      return "A long-awaited understanding";
    }
    return "An important piece of your puzzle";
  }

  private suggestIntegration(content: string): string {
    if (/action|do|create|build/i.test(content)) {
      return "Take one small action today that honors this insight";
    }
    if (/feel|sense|know/i.test(content)) {
      return "Sit with this feeling and let it inform your choices";
    }
    return "Let this insight guide your next conversation";
  }

  private trackEvolution(theme: string, entries: MuseEntry[]): string {
    const themeEntries = entries.filter(e => e.themes.includes(theme));
    if (themeEntries.length >= 3) return "deepening";
    if (themeEntries.some(e => e.energy === 'breakthrough')) return "transforming";
    return "exploring";
  }

  private assessThemeSignificance(theme: string): string {
    const significances = {
      'growth': "Your evolution is accelerating",
      'connection': "Relationships are central to this phase",
      'purpose': "You're clarifying your deeper calling",
      'creativity': "Creative expression is your medicine now",
      'healing': "Deep healing is occurring",
      'shadow': "You're integrating hidden aspects"
    };
    return significances[theme as keyof typeof significances] || "This theme holds important medicine";
  }

  private findInvitation(theme: string): string {
    const invitations = {
      'growth': "Trust the discomfort of expansion",
      'connection': "Open your heart even wider",
      'purpose': "Take the next aligned action",
      'creativity': "Create without censoring",
      'healing': "Be gentle with your process",
      'shadow': "Welcome what you've rejected"
    };
    return invitations[theme as keyof typeof invitations] || "Follow this thread deeper";
  }

  private detectMood(content: string): string {
    if (/joy|happy|excited|blessed/i.test(content)) return "joyful";
    if (/sad|grief|sorrow|heavy/i.test(content)) return "contemplative";
    if (/anger|frustrated|annoyed/i.test(content)) return "activated";
    if (/peace|calm|serene/i.test(content)) return "peaceful";
    if (/curious|wonder|intrigued/i.test(content)) return "curious";
    return "open";
  }

  /**
   * Get current muse stream
   */
  getCurrentMuseStream(): MuseStream | null {
    return this.currentMuseStream;
  }

  /**
   * Check if currently receiving
   */
  isInMuseMode(): boolean {
    return this.isReceiving;
  }

  /**
   * Get stored muse stream
   */
  getMuseStream(streamId: string): MuseStream | null {
    return this.streamStorage.get(streamId) || null;
  }

  /**
   * Get all muse streams for user
   */
  getAllMuseStreams(): MuseStream[] {
    return Array.from(this.streamStorage.values())
      .filter(stream => stream.userId === this.userId)
      .sort((a, b) => b.startTime - a.startTime);
  }
}