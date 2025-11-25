/**
 * 🧵 Story Thread Memory System
 * 
 * Weaves user stories, journal entries, and relived moments into coherent threads.
 * Creates a living mythology from fragmented experiences.
 */

import type {
  JournalEntry,
  StoryFragment,
  RelivedMoment,
  StoryThread,
  SoulLabMetadata,
  ElementType,
  EntryType
} from './types/soullab-metadata';

import {
  journalQueries,
  storyQueries,
  momentQueries,
  threadQueries,
  patternQueries
} from './supabase/soullab-queries';

export interface ThreadPattern {
  type: 'elemental' | 'archetypal' | 'thematic' | 'temporal';
  pattern: string;
  strength: number; // 0-1
  entries: string[]; // Entry IDs
}

export interface WeavingContext {
  userId: string;
  currentEntry: {
    type: EntryType;
    content: string;
    metadata: SoulLabMetadata;
  };
  activeThreads: StoryThread[];
  resonantMemories: any[];
}

export interface MemoryWeave {
  primary: string; // Main narrative thread
  echoes: string[]; // Related memories
  insights: string[]; // Maya's observations
  invitation?: string; // Prompt for deeper exploration
}

/**
 * Story Thread Engine - Memory Weaving System
 */
export class StoryThreadEngine {
  private userId: string;
  private activeThreads: Map<string, StoryThread> = new Map();
  private threadPatterns: Map<string, ThreadPattern[]> = new Map();
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  /**
   * Initialize engine with user's existing threads
   */
  async initialize() {
    const threads = await threadQueries.getByUser(this.userId);
    threads.forEach(thread => {
      this.activeThreads.set(thread.id, thread);
    });
    
    // Analyze patterns in existing threads
    await this.analyzeThreadPatterns();
  }
  
  /**
   * Capture a new entry and weave it into threads
   */
  async captureAndWeave(
    type: EntryType,
    content: string,
    metadata: SoulLabMetadata
  ): Promise<MemoryWeave> {
    // Create the entry
    let entry: any;
    switch (type) {
      case 'journal':
        entry = await journalQueries.create(this.userId, content, metadata);
        break;
      case 'story':
        entry = await storyQueries.create(this.userId, content, metadata);
        break;
      case 'moment':
        entry = await momentQueries.create(this.userId, content, metadata);
        break;
    }
    
    // Find resonant threads
    const resonantThreads = await this.findResonantThreads(metadata);
    
    // Link to most resonant thread or create new one
    let primaryThread: StoryThread;
    if (resonantThreads.length > 0) {
      primaryThread = resonantThreads[0];
      await threadQueries.linkEntry(primaryThread.id, type, entry.id);
    } else {
      // Create new thread
      primaryThread = await this.createNewThread(metadata, entry);
    }
    
    // Find echoing memories
    const echoes = await this.findEchoingMemories(metadata);
    
    // Generate insights
    const insights = await this.generateWeavingInsights(
      primaryThread,
      metadata,
      echoes
    );
    
    // Create invitation for deeper exploration
    const invitation = this.generateInvitation(metadata, echoes);
    
    return {
      primary: this.narrateThread(primaryThread),
      echoes: echoes.map(e => this.summarizeMemory(e)),
      insights,
      invitation
    };
  }
  
  /**
   * Recall memories related to current context
   */
  async recall(
    context: string,
    metadata?: SoulLabMetadata
  ): Promise<MemoryWeave> {
    // If no metadata, generate it from context
    const meta = metadata || await this.generateMetadata(context);
    
    // Find resonant memories
    const memories = await patternQueries.findResonantEntries(
      this.userId,
      meta,
      5
    );
    
    // Find active threads
    const threads = await this.findResonantThreads(meta);
    
    // Generate narrative weaving
    const primary = threads.length > 0 
      ? this.narrateThread(threads[0])
      : "New territory — no existing threads here yet.";
    
    const echoes = [
      ...memories.journals.map(j => this.summarizeMemory(j)),
      ...memories.stories.map(s => this.summarizeMemory(s))
    ];
    
    const insights = await this.detectPatterns(memories, meta);
    
    return {
      primary,
      echoes,
      insights,
      invitation: this.generateInvitation(meta, memories)
    };
  }
  
  /**
   * Weave multiple memories into a coherent narrative
   */
  async weaveNarrative(
    entryIds: string[],
    entryTypes: EntryType[]
  ): Promise<string> {
    // Fetch all entries
    const entries = await Promise.all(
      entryIds.map(async (id, index) => {
        const type = entryTypes[index];
        switch (type) {
          case 'journal':
            return journalQueries.getByUser(this.userId, 1, 0);
          case 'story':
            return storyQueries.getByUser(this.userId, 1, 0);
          case 'moment':
            return momentQueries.getByUser(this.userId, 1, 0);
        }
      })
    );
    
    // Extract narrative elements
    const elements = entries.flat().map(entry => ({
      content: entry.content || entry.moment_description,
      element: entry.metadata.elemental.dominant,
      archetype: entry.metadata.archetypal[0]?.archetype,
      timestamp: entry.created_at
    }));
    
    // Sort chronologically
    elements.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Weave narrative
    return this.constructNarrative(elements);
  }
  
  /**
   * Detect emerging patterns in user's journey
   */
  async detectEmergingPatterns(): Promise<ThreadPattern[]> {
    const recentEntries = await journalQueries.getByUser(this.userId, 20);
    
    const patterns: ThreadPattern[] = [];
    
    // Elemental patterns
    const elementalPattern = this.detectElementalPattern(recentEntries);
    if (elementalPattern) patterns.push(elementalPattern);
    
    // Archetypal patterns
    const archetypalPattern = this.detectArchetypalPattern(recentEntries);
    if (archetypalPattern) patterns.push(archetypalPattern);
    
    // Thematic patterns
    const thematicPattern = this.detectThematicPattern(recentEntries);
    if (thematicPattern) patterns.push(thematicPattern);
    
    // Temporal patterns (cycles)
    const temporalPattern = this.detectTemporalPattern(recentEntries);
    if (temporalPattern) patterns.push(temporalPattern);
    
    return patterns;
  }
  
  /**
   * Generate story arc from thread
   */
  async generateStoryArc(threadId: string): Promise<{
    beginning: string;
    middle: string;
    current: string;
    potential: string;
  }> {
    const entries = await threadQueries.getThreadEntries(threadId);
    
    if (entries.length === 0) {
      return {
        beginning: "The story has yet to begin...",
        middle: "",
        current: "",
        potential: "What wants to emerge?"
      };
    }
    
    // Divide entries into acts
    const acts = this.divideIntoActs(entries);
    
    return {
      beginning: this.summarizeAct(acts.beginning, "began"),
      middle: this.summarizeAct(acts.middle, "deepened"),
      current: this.summarizeAct(acts.current, "stands"),
      potential: this.projectFuture(acts.current)
    };
  }
  
  // === Private Helper Methods ===
  
  private async analyzeThreadPatterns() {
    for (const [threadId, thread] of this.activeThreads) {
      const patterns = await this.extractThreadPatterns(thread);
      this.threadPatterns.set(threadId, patterns);
    }
  }
  
  private async extractThreadPatterns(thread: StoryThread): Promise<ThreadPattern[]> {
    const entries = await threadQueries.getThreadEntries(thread.id);
    const patterns: ThreadPattern[] = [];
    
    if (thread.element) {
      patterns.push({
        type: 'elemental',
        pattern: thread.element,
        strength: 0.8,
        entries: entries.map(e => e.id)
      });
    }
    
    if (thread.archetype) {
      patterns.push({
        type: 'archetypal',
        pattern: thread.archetype,
        strength: 0.8,
        entries: entries.map(e => e.id)
      });
    }
    
    return patterns;
  }
  
  private async findResonantThreads(metadata: SoulLabMetadata): Promise<StoryThread[]> {
    const threads = Array.from(this.activeThreads.values());
    
    // Score each thread by resonance
    const scoredThreads = threads.map(thread => {
      let score = 0;
      
      // Elemental match
      if (thread.element === metadata.elemental.dominant) {
        score += 0.5;
      }
      
      // Archetypal match
      if (thread.archetype === metadata.archetypal[0]?.archetype) {
        score += 0.5;
      }
      
      // Thematic overlap
      const threadThemes = thread.description?.toLowerCase() || '';
      metadata.themes?.forEach(theme => {
        if (threadThemes.includes(theme)) {
          score += 0.2;
        }
      });
      
      return { thread, score };
    });
    
    // Sort by score and return top matches
    return scoredThreads
      .filter(s => s.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map(s => s.thread);
  }
  
  private async createNewThread(
    metadata: SoulLabMetadata,
    firstEntry: any
  ): Promise<StoryThread> {
    const title = this.generateThreadTitle(metadata);
    const description = this.generateThreadDescription(metadata);
    
    const thread = await threadQueries.create(
      this.userId,
      title,
      description,
      metadata.archetypal[0]?.archetype,
      metadata.elemental.dominant
    );
    
    // Link first entry
    await threadQueries.linkEntry(
      thread.id,
      firstEntry.type || 'journal',
      firstEntry.id
    );
    
    // Cache locally
    this.activeThreads.set(thread.id, thread);
    
    return thread;
  }
  
  private async findEchoingMemories(metadata: SoulLabMetadata): Promise<any[]> {
    const resonant = await patternQueries.findResonantEntries(
      this.userId,
      metadata,
      3
    );
    
    return [
      ...resonant.journals,
      ...resonant.stories
    ];
  }
  
  private async generateWeavingInsights(
    thread: StoryThread,
    metadata: SoulLabMetadata,
    echoes: any[]
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // Thread continuity insight
    if (thread.insights && thread.insights.length > 0) {
      insights.push(`This continues the thread: "${thread.title}"`);
    }
    
    // Elemental evolution
    if (echoes.length > 0) {
      const pastElements = echoes.map(e => e.metadata?.elemental?.dominant).filter(Boolean);
      const currentElement = metadata.elemental.dominant;
      
      if (pastElements[0] !== currentElement) {
        insights.push(
          `Movement from ${pastElements[0]} to ${currentElement} — ` +
          `the elements are shifting in your journey.`
        );
      }
    }
    
    // Archetypal development
    const currentArchetype = metadata.archetypal[0]?.archetype;
    if (currentArchetype && echoes.length > 0) {
      const pastArchetype = echoes[0].metadata?.archetypal?.[0]?.archetype;
      if (pastArchetype && pastArchetype !== currentArchetype) {
        insights.push(
          `The ${pastArchetype} is evolving into the ${currentArchetype}.`
        );
      }
    }
    
    return insights;
  }
  
  private generateInvitation(
    metadata: SoulLabMetadata,
    memories: any
  ): string | undefined {
    const element = metadata.elemental.dominant;
    const hasMemories = memories.length > 0 || 
                        (memories.journals?.length > 0) || 
                        (memories.stories?.length > 0);
    
    if (!hasMemories) {
      return `This ${element} energy feels new. What's calling it forward?`;
    }
    
    const invitations = {
      fire: "The fire returns. What needs to be ignited this time?",
      water: "The waters are moving again. What's ready to flow?",
      earth: "Earth is calling. What foundations are you building?",
      air: "Air brings clarity. What perspective is emerging?",
      aether: "The unified field opens. What wholeness do you sense?"
    };
    
    return invitations[element];
  }
  
  private narrateThread(thread: StoryThread): string {
    const element = thread.element || "mystery";
    const archetype = thread.archetype || "journey";
    
    return `Your ${archetype} thread, woven with ${element} energy: "${thread.title}"`;
  }
  
  private summarizeMemory(entry: any): string {
    const date = new Date(entry.created_at).toLocaleDateString();
    const preview = entry.content?.substring(0, 100) || 
                   entry.moment_description?.substring(0, 100) || "";
    
    return `[${date}] ${preview}...`;
  }
  
  private async generateMetadata(context: string): Promise<SoulLabMetadata> {
    // Simplified metadata generation
    return {
      elemental: {
        dominant: "fire" as ElementType,
        balance: { fire: 0.5, water: 0.2, earth: 0.2, air: 0.1, aether: 0 },
        intensity: 0.5
      },
      archetypal: [{ archetype: "Seeker", confidence: 0.5 }],
      consciousness: {
        level: "soul",
        developmentalPhase: "awakening",
        readinessForTruth: 0.5
      },
      timestamp: new Date().toISOString()
    };
  }
  
  private async detectPatterns(
    memories: any,
    metadata: SoulLabMetadata
  ): Promise<string[]> {
    const insights: string[] = [];
    
    const allEntries = [...(memories.journals || []), ...(memories.stories || [])];
    
    if (allEntries.length > 2) {
      // Check for recurring elements
      const elements = allEntries.map(e => e.metadata?.elemental?.dominant).filter(Boolean);
      const elementCounts = this.countOccurrences(elements);
      
      const dominant = Object.entries(elementCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominant && dominant[1] > 2) {
        insights.push(`${dominant[0]} appears consistently in your journey.`);
      }
    }
    
    return insights;
  }
  
  private constructNarrative(elements: any[]): string {
    if (elements.length === 0) return "The story begins...";
    
    const parts = elements.map((el, index) => {
      const transition = index === 0 ? "It began when" :
                        index === elements.length - 1 ? "Now" : "Then";
      
      return `${transition} ${el.element} energy moved through ` +
             `the ${el.archetype || 'journey'}.`;
    });
    
    return parts.join(" ");
  }
  
  private detectElementalPattern(entries: JournalEntry[]): ThreadPattern | null {
    const elements = entries.map(e => e.metadata.elemental.dominant);
    const counts = this.countOccurrences(elements);
    
    const dominant = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominant && dominant[1] > entries.length * 0.4) {
      return {
        type: 'elemental',
        pattern: dominant[0],
        strength: dominant[1] / entries.length,
        entries: entries.filter(e => 
          e.metadata.elemental.dominant === dominant[0]
        ).map(e => e.id)
      };
    }
    
    return null;
  }
  
  private detectArchetypalPattern(entries: JournalEntry[]): ThreadPattern | null {
    const archetypes = entries.flatMap(e => 
      e.metadata.archetypal.map(a => a.archetype)
    );
    const counts = this.countOccurrences(archetypes);
    
    const dominant = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominant && dominant[1] > entries.length * 0.3) {
      return {
        type: 'archetypal',
        pattern: dominant[0],
        strength: dominant[1] / entries.length,
        entries: entries.filter(e => 
          e.metadata.archetypal.some(a => a.archetype === dominant[0])
        ).map(e => e.id)
      };
    }
    
    return null;
  }
  
  private detectThematicPattern(entries: JournalEntry[]): ThreadPattern | null {
    const themes = entries.flatMap(e => e.metadata.themes || []);
    const counts = this.countOccurrences(themes);
    
    const dominant = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominant && dominant[1] > 3) {
      return {
        type: 'thematic',
        pattern: dominant[0],
        strength: dominant[1] / entries.length,
        entries: entries.filter(e => 
          e.metadata.themes?.includes(dominant[0])
        ).map(e => e.id)
      };
    }
    
    return null;
  }
  
  private detectTemporalPattern(entries: JournalEntry[]): ThreadPattern | null {
    // Detect weekly/monthly cycles
    const dates = entries.map(e => new Date(e.createdAt));
    const dayOfWeek = dates.map(d => d.getDay());
    const dayCounts = this.countOccurrences(dayOfWeek);
    
    const peakDay = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (peakDay && peakDay[1] > entries.length * 0.25) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        type: 'temporal',
        pattern: `${dayNames[parseInt(peakDay[0])]} rhythm`,
        strength: peakDay[1] / entries.length,
        entries: entries.filter(e => 
          new Date(e.createdAt).getDay() === parseInt(peakDay[0])
        ).map(e => e.id)
      };
    }
    
    return null;
  }
  
  private countOccurrences<T>(items: T[]): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }
  
  private divideIntoActs(entries: any[]): {
    beginning: any[];
    middle: any[];
    current: any[];
  } {
    const third = Math.ceil(entries.length / 3);
    
    return {
      beginning: entries.slice(0, third),
      middle: entries.slice(third, third * 2),
      current: entries.slice(third * 2)
    };
  }
  
  private summarizeAct(entries: any[], verb: string): string {
    if (entries.length === 0) return "";
    
    const elements = [...new Set(entries.map(e => 
      e.metadata?.elemental?.dominant
    ).filter(Boolean))];
    
    const archetypes = [...new Set(entries.flatMap(e => 
      e.metadata?.archetypal?.map((a: any) => a.archetype) || []
    ))];
    
    return `The journey ${verb} with ${elements.join(" and ")} energy, ` +
           `through the ${archetypes[0] || 'mystery'}.`;
  }
  
  private projectFuture(currentEntries: any[]): string {
    if (currentEntries.length === 0) {
      return "The next chapter awaits...";
    }
    
    const lastElement = currentEntries[currentEntries.length - 1]
      ?.metadata?.elemental?.dominant;
    
    const projections = {
      fire: "The fire seeks expression — what performance awaits?",
      water: "The waters are gathering — what healing is ready?",
      earth: "The earth is fertile — what will you plant?",
      air: "The air is clearing — what truth will emerge?",
      aether: "Unity beckons — what synthesis is forming?"
    };
    
    return projections[lastElement] || "Something new is stirring...";
  }
  
  private generateThreadTitle(metadata: SoulLabMetadata): string {
    const element = metadata.elemental.dominant;
    const archetype = metadata.archetypal[0]?.archetype || "Journey";
    
    return `${archetype}'s ${element} Thread`;
  }
  
  private generateThreadDescription(metadata: SoulLabMetadata): string {
    const themes = metadata.themes?.join(", ") || "unfolding mystery";
    return `A thread of ${themes}, woven through time.`;
  }
}

// Export factory function
export function createStoryThreadEngine(userId: string) {
  return new StoryThreadEngine(userId);
}