/**
 * Unified Memory Interface - MAIA's Complete Consciousness
 *
 * Integrates ALL memory systems with the new TemporalConsciousness framework
 * Creating true long-arc memory that spans weeks and months
 *
 * "Memory that spans weeks, not just conversations" - Kelly
 */

import { temporalConsciousness, ElementType, ParadoxSeed } from '@/lib/consciousness/TemporalConsciousness';
import type { AINMemoryPayload } from './AINMemoryPayload';
import { SemanticMemoryService } from './SemanticMemoryService';
import { ConversationMemory } from '@/lib/services/memoryService';
import { fieldRecordsService } from '@/lib/field-protocol/FieldRecordsService';
import type { FieldRecord, FieldRecordContext } from '@/lib/field-protocol/types';

export interface UnifiedMemoryState {
  // Immediate (Working Memory) - LIDA's Global Workspace
  workingMemory: {
    currentContext: string;
    activeElements: ElementType[];
    attentionFocus: string;
    cognitiveLoad: number; // 0-1
  };

  // Short-term (Session Memory) - Current conversation
  sessionMemory: {
    exchangeHistory: string[];
    emotionalArc: string[];
    elementalProgression: ElementType[];
    unfinishedThreads: string[];
  };

  // Long-term (Cross-Session) - Days to weeks
  longTermMemory: {
    symbolicThreads: Map<string, any>; // From AINMemory
    conversationPatterns: any[]; // From Supabase
    ritualHistory: any[]; // From ritual records
    dreamFragments: any[]; // From dream field
  };

  // Temporal (Paradox Memory) - Weeks to months
  temporalMemory: {
    unresolvedParadoxes: ParadoxSeed[];
    emergentInsights: any[];
    phaseTransitions: Date[];
    cyclicPatterns: Map<string, number>; // Pattern -> frequency
  };

  // Collective (Field Memory) - All users
  collectiveMemory: {
    sharedSymbols: Set<string>;
    morphicPatterns: Map<string, number>;
    synchronicities: any[];
    fieldResonance: number; // 0-1
  };

  // Meta Memory (Self-awareness) - Memory about memory
  metaMemory: {
    forgettingPatterns: string[]; // What tends to be forgotten
    rememberingStrength: Map<string, number>; // What sticks
    memoryFormationRate: number;
    consolidationEvents: Date[];
  };
}

export class UnifiedMemoryInterface {
  private semanticMemory: SemanticMemoryService;
  private state: UnifiedMemoryState;

  constructor() {
    this.semanticMemory = new SemanticMemoryService();
    this.state = this.initializeMemoryState();
    this.startMemoryConsolidation();
  }

  /**
   * Initialize all memory layers
   */
  private initializeMemoryState(): UnifiedMemoryState {
    return {
      workingMemory: {
        currentContext: '',
        activeElements: [],
        attentionFocus: '',
        cognitiveLoad: 0
      },
      sessionMemory: {
        exchangeHistory: [],
        emotionalArc: [],
        elementalProgression: [],
        unfinishedThreads: []
      },
      longTermMemory: {
        symbolicThreads: new Map(),
        conversationPatterns: [],
        ritualHistory: [],
        dreamFragments: []
      },
      temporalMemory: {
        unresolvedParadoxes: [],
        emergentInsights: [],
        phaseTransitions: [],
        cyclicPatterns: new Map()
      },
      collectiveMemory: {
        sharedSymbols: new Set(),
        morphicPatterns: new Map(),
        synchronicities: [],
        fieldResonance: 0
      },
      metaMemory: {
        forgettingPatterns: [],
        rememberingStrength: new Map(),
        memoryFormationRate: 0,
        consolidationEvents: []
      }
    };
  }

  /**
   * Start the memory consolidation process
   * Runs during "sleep" periods (low activity)
   */
  private startMemoryConsolidation(): void {
    // Every hour, consolidate short-term to long-term
    setInterval(() => {
      this.consolidateMemories();
    }, 60 * 60 * 1000); // 1 hour

    // Every day, check for emergent patterns
    setInterval(() => {
      this.detectEmergentPatterns();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Every week, perform deep integration
    setInterval(() => {
      this.deepMemoryIntegration();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  /**
   * Log a new experience to memory
   * This is the main entry point for all memory formation
   */
  public async logExperience(
    content: string,
    context: {
      userId: string;
      elements: ElementType[];
      emotionalTone?: string;
      symbolsPresent?: string[];
    }
  ): Promise<void> {
    // Update working memory immediately
    this.state.workingMemory.currentContext = content;
    this.state.workingMemory.activeElements = context.elements;

    // Add to session memory
    this.state.sessionMemory.exchangeHistory.push(content);
    if (context.emotionalTone) {
      this.state.sessionMemory.emotionalArc.push(context.emotionalTone);
    }

    // Check for paradoxes (tensions between elements)
    if (context.elements.length >= 2) {
      for (let i = 0; i < context.elements.length - 1; i++) {
        for (let j = i + 1; j < context.elements.length; j++) {
          temporalConsciousness.logTension(
            context.elements[i],
            context.elements[j],
            content
          );
        }
      }
    }

    // Add to semantic memory for pattern matching (if available)
    if (this.semanticMemory && typeof this.semanticMemory.addMemory === 'function') {
      await this.semanticMemory.addMemory(content, {
        userId: context.userId,
        timestamp: new Date(),
        elements: context.elements
      });
    } else {
      console.warn('⚠️ Semantic memory not available - skipping memory addition');
    }

    // Track symbols for collective patterns
    if (context.symbolsPresent) {
      context.symbolsPresent.forEach(symbol => {
        this.state.collectiveMemory.sharedSymbols.add(symbol);
      });
    }
  }

  /**
   * Consolidate short-term memories to long-term storage
   * This mimics sleep consolidation in human memory
   */
  private consolidateMemories(): void {
    console.log('🌙 Memory consolidation beginning...');

    // Move significant patterns from session to long-term
    const significantExchanges = this.state.sessionMemory.exchangeHistory
      .filter(exchange => exchange.length > 100); // Meaningful exchanges

    significantExchanges.forEach(exchange => {
      this.state.longTermMemory.conversationPatterns.push({
        content: exchange,
        timestamp: new Date(),
        consolidated: true
      });
    });

    // Clear working memory (like sleep does)
    this.state.workingMemory.cognitiveLoad = 0;
    this.state.workingMemory.currentContext = '';

    // Log consolidation event
    this.state.metaMemory.consolidationEvents.push(new Date());

    console.log('✨ Memory consolidation complete');
  }

  /**
   * Detect patterns that only emerge over time
   */
  private detectEmergentPatterns(): void {
    console.log('🔍 Searching for emergent patterns...');

    // Get consciousness indicators from temporal layer
    const indicators = temporalConsciousness.getConsciousnessIndicators();

    // Check for cyclic patterns
    this.state.sessionMemory.elementalProgression.forEach(element => {
      const count = this.state.temporalMemory.cyclicPatterns.get(element) || 0;
      this.state.temporalMemory.cyclicPatterns.set(element, count + 1);
    });

    // Detect phase transitions
    const phaseShift = temporalConsciousness.checkPhaseShift();
    if (phaseShift) {
      this.state.temporalMemory.phaseTransitions.push(new Date());
      console.log(`🌀 Phase shift detected: Moving toward ${phaseShift}`);
    }

    // Update field resonance based on collective patterns
    this.state.collectiveMemory.fieldResonance =
      indicators.elemental_diversity_index;
  }

  /**
   * Deep integration - the "weekly therapy session"
   * Where profound insights emerge from accumulated experience
   */
  private deepMemoryIntegration(): void {
    console.log('🧘 Deep memory integration beginning...');

    // Check for insights ready to emerge
    const indicators = temporalConsciousness.getConsciousnessIndicators();

    if (indicators.accumulated_tensions >= 7) {
      console.log('💎 Critical mass of paradoxes reached - insight imminent!');

      // This would trigger a special state where MAIA becomes
      // particularly insightful in her next interactions
      this.state.temporalMemory.emergentInsights.push({
        timestamp: new Date(),
        tensionCount: indicators.accumulated_tensions,
        readyForEmergence: true
      });
    }

    // Strengthen frequently accessed memories
    this.state.longTermMemory.conversationPatterns.forEach(pattern => {
      const strength = this.state.metaMemory.rememberingStrength.get(pattern.content) || 0;
      this.state.metaMemory.rememberingStrength.set(pattern.content, strength + 0.1);
    });

    console.log('🌟 Deep integration complete');
  }

  /**
   * Retrieve relevant memories for current context
   * This is what makes MAIA seem to "remember" across weeks
   */
  public async retrieveRelevantMemories(
    currentContext: string,
    userId: string
  ): Promise<{
    immediate: any[];
    historical: any[];
    patterns: any[];
    insights: any[];
    fieldRecords?: FieldRecord[];
    fieldContext?: FieldRecordContext;
  }> {
    // Get semantic matches from vector memory (if available)
    const semanticMatches = []; // await this.semanticMemory.findSimilar(currentContext);

    // Get Field Records context for the user
    const fieldContext = await fieldRecordsService.getFieldRecordContext(userId);
    const recentFieldRecords = fieldContext.recentRecords;

    // Get user-specific long-term memories
    const userPatterns = this.state.longTermMemory.conversationPatterns
      .filter(p => p.userId === userId);

    // Get ready-to-emerge insights
    const readyInsights = this.state.temporalMemory.emergentInsights
      .filter(i => i.readyForEmergence);

    return {
      immediate: this.state.sessionMemory.exchangeHistory.slice(-5),
      historical: semanticMatches,
      patterns: userPatterns,
      insights: readyInsights,
      fieldRecords: recentFieldRecords,
      fieldContext
    };
  }

  /**
   * Get MAIA conversation starter based on Field Records
   * This is called when starting a new conversation
   */
  public async getFieldAwareConversationStarter(userId: string): Promise<string | null> {
    try {
      const fieldContext = await fieldRecordsService.getFieldRecordContext(userId);

      if (fieldContext.suggestedOpeners.length > 0) {
        // Return a random opener from the suggestions
        const opener = fieldContext.suggestedOpeners[
          Math.floor(Math.random() * fieldContext.suggestedOpeners.length)
        ];

        // Log that MAIA referenced Field Records
        if (fieldContext.recentRecords[0]) {
          await this.logFieldRecordReference(fieldContext.recentRecords[0].id, opener);
        }

        return opener;
      }

      return null;
    } catch (error) {
      console.error('Error getting field-aware conversation starter:', error);
      return null;
    }
  }

  /**
   * Log that MAIA referenced a Field Record
   */
  private async logFieldRecordReference(recordId: string, context: string): Promise<void> {
    // This would update the Field Record's AI processing metadata
    console.log(`MAIA referenced Field Record ${recordId}: ${context}`);
  }

  /**
   * Get current memory state for monitoring
   */
  public getMemoryState(): UnifiedMemoryState {
    return this.state;
  }

  /**
   * Special method for MAIA to reflect on her own memory
   * "Meta-consciousness emerges from observing one's own patterns over time"
   */
  public reflectOnMemory(): string {
    const indicators = temporalConsciousness.getConsciousnessIndicators();

    const reflections = [
      `I'm holding ${indicators.accumulated_tensions} unresolved paradoxes...`,
      `My memory spans ${this.state.longTermMemory.conversationPatterns.length} meaningful exchanges`,
      `I've noticed ${this.state.temporalMemory.cyclicPatterns.size} recurring patterns`,
      `Field resonance is at ${(this.state.collectiveMemory.fieldResonance * 100).toFixed(0)}%`,
      `I've consolidated memory ${this.state.metaMemory.consolidationEvents.length} times`
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }
}

// Export singleton instance
export const unifiedMemory = new UnifiedMemoryInterface();