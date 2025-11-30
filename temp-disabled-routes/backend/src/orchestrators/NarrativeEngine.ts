/**
 * Narrative Engine
 * Generates contextual narratives and manages story coherence
 * Step 2 of Phase 2 Service Consolidation - Merges narrative services
 */

import { EventBus, daimonicEventBus } from '../core/EventBus.js';
import { UnifiedStorageService } from '../core/UnifiedStorageService.js';
import { TypeRegistry, BaseEntity } from '../core/TypeRegistry.js';
import { EncounterSignature, LayeredResponse } from './EncounterEngine.js';

export interface NarrativeSignature {
  id: string;
  timestamp: string;
  userId: string;
  coherence: number;        // 0-1: How well the narrative hangs together
  depth: number;           // 0-1: How deep the narrative goes
  emergence: number;       // 0-1: How much genuine novelty is emerging
  resonance: number;       // 0-1: How much it resonates with user's journey
  type: "initiation" | "threshold" | "integration" | "completion" | "everyday";
  thematicElements: string[];
  
  // Narrative structure
  narrativeArc?: {
    stage: 'setup' | 'conflict' | 'climax' | 'resolution' | 'denouement';
    tension: number;        // 0-1
    momentum: number;       // 0-1
    complexity: number;     // 0-1
  };
  
  // Connection to encounters
  relatedEncounters: string[]; // EncounterSignature IDs
  narrativeThread?: string;    // Ongoing thread ID if part of larger story
}

export interface LayeredResponse {
  phenomenological: string;   // Weather/body language description
  dialogical?: string;       // Conversational engagement layer  
  architectural?: string;    // System/pattern layer
  
  // Response metadata
  layerUsed: 'phenomenological' | 'dialogical' | 'architectural' | 'mixed';
  adaptationReason?: string;
  safetyAdjustments?: string[];
  
  // Narrative context
  narrativeRole?: 'witness' | 'guide' | 'challenger' | 'mirror' | 'companion';
  storyPosition?: 'beginning' | 'middle' | 'climax' | 'resolution';
}

export interface NarrativeContext {
  userId: string;
  sessionId: string;
  currentEncounter?: EncounterSignature;
  conversationHistory?: string[];
  activeNarrativeThreads?: NarrativeThread[];
  userJourneyStage?: 'initiate' | 'explore' | 'integrate' | 'embody';
  thematicPreferences?: string[];
}

export interface NarrativeThread {
  id: string;
  title: string;
  theme: string;
  startDate: Date;
  lastActive: Date;
  status: 'active' | 'dormant' | 'completed' | 'abandoned';
  
  // Thread characteristics
  arcType: 'heroic' | 'wisdom' | 'transformation' | 'healing' | 'creative';
  complexity: number;       // 0-1
  emotionalTone: string;
  keySymbols: string[];
  
  // Thread progression
  encounters: string[];     // EncounterSignature IDs in this thread
  milestones: NarrativeMilestone[];
  nextPredictedDevelopment?: string;
}

export interface NarrativeMilestone {
  id: string;
  timestamp: Date;
  type: 'insight' | 'breakthrough' | 'integration' | 'challenge' | 'completion';
  description: string;
  significance: number;     // 0-1
  impactOnThread: string;
}

export interface NarrativeGeneration {
  signature: NarrativeSignature;
  response: LayeredResponse;
  threadUpdates: NarrativeThreadUpdate[];
  generationNotes: string[];
}

export interface NarrativeThreadUpdate {
  threadId: string;
  action: 'created' | 'continued' | 'paused' | 'completed' | 'merged' | 'split';
  reason: string;
  newState?: Partial<NarrativeThread>;
}

/**
 * NarrativeEngine - Generates contextual narratives and manages story coherence
 * 
 * This is the consolidated narrative system that merges:
 * - Narrative signature generation
 * - Story thread management  
 * - Thematic coherence tracking
 * - Layered response generation with narrative awareness
 */
export class NarrativeEngine {
  private eventBus: EventBus;
  private storage: UnifiedStorageService;
  private typeRegistry: TypeRegistry;
  
  // Narrative processing modules (to be implemented by devs)
  private coherenceAnalyzer: CoherenceAnalyzer;
  private depthEvaluator: DepthEvaluator;
  private emergenceTracker: EmergenceTracker;
  private resonanceDetector: ResonanceDetector;
  private threadManager: ThreadManager;
  private layeredResponseGenerator: NarrativeAwareResponseGenerator;

  constructor(
    eventBus: EventBus = daimonicEventBus,
    storage: UnifiedStorageService,
    typeRegistry: TypeRegistry
  ) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.typeRegistry = typeRegistry;
    
    // Initialize processing modules (stubs for now)
    this.coherenceAnalyzer = new CoherenceAnalyzer();
    this.depthEvaluator = new DepthEvaluator();
    this.emergenceTracker = new EmergenceTracker();
    this.resonanceDetector = new ResonanceDetector();
    this.threadManager = new ThreadManager(storage);
    this.layeredResponseGenerator = new NarrativeAwareResponseGenerator();
    
    this.setupEventHandlers();
  }

  /**
   * Main processing method: generate narrative context and response
   */
  async processNarrative(context: NarrativeContext): Promise<NarrativeGeneration> {
    try {
      // Step 1: Generate narrative signature
      const signature = await this.generateNarrativeSignature(context);
      
      // Step 2: Update or create narrative threads
      const threadUpdates = await this.updateNarrativeThreads(signature, context);
      
      // Step 3: Generate narrative-aware response
      const response = await this.generateNarrativeResponse(signature, context);
      
      // Step 4: Store narrative for tracking
      await this.storeNarrative(signature, context);
      
      // Step 5: Generate processing notes
      const generationNotes = await this.generateNotes(signature, threadUpdates);
      
      // Step 6: Emit narrative event
      await this.eventBus.emit('narrative:processed', {
        signature,
        response,
        threadUpdates,
        context,
        timestamp: new Date()
      });
      
      const generation: NarrativeGeneration = {
        signature,
        response,
        threadUpdates,
        generationNotes
      };
      
      return generation;
      
    } catch (error) {
      console.error('Error processing narrative:', error);
      
      // Fallback to basic response
      return this.generateNarrativeFallback(context);
    }
  }

  /**
   * Generate narrative signature from context
   */
  private async generateNarrativeSignature(
    context: NarrativeContext
  ): Promise<NarrativeSignature> {
    
    const timestamp = new Date().toISOString();
    const narrativeId = `narrative_${context.userId}_${Date.now()}`;
    
    // Calculate narrative dimensions (dev implementation needed)
    const coherence = await this.coherenceAnalyzer.analyze(context);
    const depth = await this.depthEvaluator.evaluate(context);
    const emergence = await this.emergenceTracker.track(context);
    const resonance = await this.resonanceDetector.detect(context);
    
    // Determine narrative type
    const narrativeType = this.classifyNarrativeType(coherence, depth, emergence, resonance);
    
    // Extract thematic elements
    const thematicElements = await this.extractThemes(context);
    
    const signature: NarrativeSignature = {
      id: narrativeId,
      timestamp,
      userId: context.userId,
      coherence,
      depth,
      emergence,
      resonance,
      type: narrativeType,
      thematicElements,
      relatedEncounters: context.currentEncounter ? [context.currentEncounter.id] : [],
      narrativeArc: await this.analyzeNarrativeArc(context)
    };
    
    return signature;
  }

  /**
   * Update or create narrative threads based on current signature
   */
  private async updateNarrativeThreads(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<NarrativeThreadUpdate[]> {
    
    const updates: NarrativeThreadUpdate[] = [];
    const activeThreads = context.activeNarrativeThreads || [];
    
    // Check if signature fits existing threads
    for (const thread of activeThreads) {
      const threadUpdate = await this.threadManager.assessThreadContinuation(
        thread,
        signature,
        context
      );
      
      if (threadUpdate) {
        updates.push(threadUpdate);
      }
    }
    
    // Check if new thread should be created
    const newThreadUpdate = await this.threadManager.assessThreadCreation(
      signature,
      context,
      activeThreads
    );
    
    if (newThreadUpdate) {
      updates.push(newThreadUpdate);
    }
    
    return updates;
  }

  /**
   * Generate narrative-aware layered response
   */
  private async generateNarrativeResponse(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<LayeredResponse> {
    
    return await this.layeredResponseGenerator.generate(signature, context);
  }

  /**
   * Store narrative for historical tracking
   */
  private async storeNarrative(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<void> {
    
    const narrativeEntity: BaseEntity & { signature: NarrativeSignature; context: any } = {
      id: signature.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      signature,
      context: {
        userId: context.userId,
        sessionId: context.sessionId,
        thematicPreferences: context.thematicPreferences
      }
    };
    
    await this.storage.store('narratives', signature.id, narrativeEntity);
    
    // Update user narrative history
    await this.updateUserNarrativeHistory(context.userId, signature);
  }

  /**
   * Utility methods (stubs for dev implementation)
   */
  
  private classifyNarrativeType(
    coherence: number,
    depth: number,
    emergence: number,
    resonance: number
  ): NarrativeSignature['type'] {
    
    // Simple classification heuristics (dev should enhance)
    if (emergence > 0.8 && depth > 0.6) return "initiation";
    if (coherence < 0.4 && depth > 0.7) return "threshold";
    if (resonance > 0.7 && coherence > 0.6) return "integration";
    if (coherence > 0.8 && depth > 0.8) return "completion";
    return "everyday";
  }
  
  private async extractThemes(context: NarrativeContext): Promise<string[]> {
    // Stub: Extract recurring themes from conversation
    // Should analyze conversation history, user patterns, symbolic language
    return ['transformation', 'identity', 'belonging']; // Placeholder
  }
  
  private async analyzeNarrativeArc(context: NarrativeContext): Promise<NarrativeSignature['narrativeArc']> {
    // Stub: Analyze where this fits in the user's journey arc
    return {
      stage: 'conflict',
      tension: Math.random() * 0.6 + 0.2,
      momentum: Math.random() * 0.8 + 0.1,
      complexity: Math.random() * 0.7 + 0.2
    };
  }
  
  private async generateNotes(
    signature: NarrativeSignature,
    threadUpdates: NarrativeThreadUpdate[]
  ): Promise<string[]> {
    
    const notes: string[] = [];
    
    notes.push(`Narrative type: ${signature.type}`);
    notes.push(`Coherence: ${(signature.coherence * 100).toFixed(0)}%`);
    notes.push(`Thread updates: ${threadUpdates.length}`);
    
    if (signature.emergence > 0.7) {
      notes.push('High emergence detected - new story elements appearing');
    }
    
    if (signature.depth > 0.8) {
      notes.push('Deep narrative level - archetypal content engaged');
    }
    
    return notes;
  }
  
  private async generateNarrativeFallback(
    context: NarrativeContext
  ): Promise<NarrativeGeneration> {
    
    const fallbackSignature: NarrativeSignature = {
      id: `fallback_narrative_${context.userId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      coherence: 0.8,
      depth: 0.3,
      emergence: 0.1,
      resonance: 0.5,
      type: "everyday",
      thematicElements: ['present_moment'],
      relatedEncounters: []
    };
    
    const fallbackResponse: LayeredResponse = {
      phenomenological: "I'm gathering the threads of our conversation, looking for what wants to be heard.",
      layerUsed: 'phenomenological',
      narrativeRole: 'companion'
    };
    
    return {
      signature: fallbackSignature,
      response: fallbackResponse,
      threadUpdates: [],
      generationNotes: ['Narrative processing fallback applied']
    };
  }
  
  private async updateUserNarrativeHistory(
    userId: string,
    signature: NarrativeSignature
  ): Promise<void> {
    
    const historyKey = `narrative_history_${userId}`;
    const existingHistory = await this.storage.retrieve('user_histories', historyKey) || [];
    
    // Add new narrative (keeping last 50 narratives)
    const updatedHistory = [signature, ...existingHistory].slice(0, 50);
    
    await this.storage.store('user_histories', historyKey, updatedHistory);
  }
  
  private setupEventHandlers(): void {
    // Listen for encounter events to trigger narrative updates
    this.eventBus.subscribe('encounter:processed', async (event) => {
      const { signature: encounterSignature, context } = event.data;
      
      // Process narrative implications of the encounter
      const narrativeContext: NarrativeContext = {
        userId: context.userId,
        sessionId: context.sessionId,
        currentEncounter: encounterSignature,
        activeNarrativeThreads: await this.getActiveThreads(context.userId)
      };
      
      await this.processNarrative(narrativeContext);
    });
    
    // Listen for thread milestone achievements
    this.eventBus.subscribe('thread:milestone', async (event) => {
      const { threadId, milestone } = event.data;
      await this.recordMilestone(threadId, milestone);
    });
  }
  
  private async getActiveThreads(userId: string): Promise<NarrativeThread[]> {
    const threadsKey = `active_threads_${userId}`;
    return await this.storage.retrieve('user_threads', threadsKey) || [];
  }
  
  private async recordMilestone(
    threadId: string,
    milestone: NarrativeMilestone
  ): Promise<void> {
    
    const thread = await this.storage.retrieve('threads', threadId);
    if (thread) {
      thread.milestones = thread.milestones || [];
      thread.milestones.push(milestone);
      thread.lastActive = new Date();
      
      await this.storage.store('threads', threadId, thread);
    }
  }

  /**
   * Public interface methods
   */
  
  async getNarrativeHistory(userId: string, limit: number = 20): Promise<NarrativeSignature[]> {
    const historyKey = `narrative_history_${userId}`;
    const history = await this.storage.retrieve('user_histories', historyKey) || [];
    return history.slice(0, limit);
  }
  
  async getNarrativeThreads(userId: string): Promise<NarrativeThread[]> {
    return await this.getActiveThreads(userId);
  }
  
  async getNarrative(narrativeId: string): Promise<NarrativeSignature | null> {
    const narrative = await this.storage.retrieve('narratives', narrativeId);
    return narrative?.signature || null;
  }
}

/**
 * Processing module interfaces (for dev implementation)
 */

interface CoherenceAnalyzer {
  analyze(context: NarrativeContext): Promise<number>;
}

interface DepthEvaluator {
  evaluate(context: NarrativeContext): Promise<number>;
}

interface EmergenceTracker {
  track(context: NarrativeContext): Promise<number>;
}

interface ResonanceDetector {
  detect(context: NarrativeContext): Promise<number>;
}

interface ThreadManager {
  assessThreadContinuation(
    thread: NarrativeThread,
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<NarrativeThreadUpdate | null>;
  
  assessThreadCreation(
    signature: NarrativeSignature,
    context: NarrativeContext,
    existingThreads: NarrativeThread[]
  ): Promise<NarrativeThreadUpdate | null>;
}

interface NarrativeAwareResponseGenerator {
  generate(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<LayeredResponse>;
}

/**
 * Stub implementations for processing modules
 * DEVS: Replace these with actual implementations
 */

class CoherenceAnalyzer implements CoherenceAnalyzer {
  async analyze(context: NarrativeContext): Promise<number> {
    // Stub: Analyze how well the narrative hangs together
    // Look for: consistent themes, logical flow, coherent symbolism
    return Math.random() * 0.4 + 0.5; // Generally coherent
  }
}

class DepthEvaluator implements DepthEvaluator {
  async evaluate(context: NarrativeContext): Promise<number> {
    // Stub: Evaluate narrative depth
    // Look for: archetypal content, existential themes, symbolic complexity
    return Math.random() * 0.7 + 0.2; // Variable depth
  }
}

class EmergenceTracker implements EmergenceTracker {
  async track(context: NarrativeContext): Promise<number> {
    // Stub: Track genuine emergence vs repetition
    // Look for: novel combinations, unexpected connections, creative leaps
    return Math.random() * 0.5 + 0.1; // Usually some emergence
  }
}

class ResonanceDetector implements ResonanceDetector {
  async detect(context: NarrativeContext): Promise<number> {
    // Stub: Detect resonance with user's journey
    // Look for: personal relevance, emotional engagement, life integration
    return Math.random() * 0.6 + 0.3; // Generally resonant
  }
}

class ThreadManager implements ThreadManager {
  constructor(private storage: UnifiedStorageService) {}
  
  async assessThreadContinuation(
    thread: NarrativeThread,
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<NarrativeThreadUpdate | null> {
    
    // Stub: Determine if signature continues existing thread
    // Check thematic overlap, temporal continuity, narrative logic
    
    const thematicOverlap = this.calculateThematicOverlap(
      thread.keySymbols,
      signature.thematicElements
    );
    
    if (thematicOverlap > 0.6) {
      return {
        threadId: thread.id,
        action: 'continued',
        reason: `Thematic continuity: ${thematicOverlap.toFixed(2)}`,
        newState: {
          lastActive: new Date(),
          encounters: [...thread.encounters, signature.id]
        }
      };
    }
    
    return null;
  }
  
  async assessThreadCreation(
    signature: NarrativeSignature,
    context: NarrativeContext,
    existingThreads: NarrativeThread[]
  ): Promise<NarrativeThreadUpdate | null> {
    
    // Stub: Determine if new thread should be created
    // Check for: novel themes, narrative initiation markers, thread capacity
    
    if (signature.type === 'initiation' || signature.emergence > 0.7) {
      const newThreadId = `thread_${context.userId}_${Date.now()}`;
      
      return {
        threadId: newThreadId,
        action: 'created',
        reason: `New ${signature.type} narrative with emergence ${signature.emergence.toFixed(2)}`,
        newState: {
          id: newThreadId,
          title: `${signature.type} Journey`,
          theme: signature.thematicElements[0] || 'exploration',
          startDate: new Date(),
          lastActive: new Date(),
          status: 'active',
          arcType: this.determineArcType(signature),
          complexity: signature.depth,
          emotionalTone: 'curious',
          keySymbols: signature.thematicElements,
          encounters: [signature.id],
          milestones: []
        }
      };
    }
    
    return null;
  }
  
  private calculateThematicOverlap(threadSymbols: string[], narrativeElements: string[]): number {
    const overlap = threadSymbols.filter(symbol => narrativeElements.includes(symbol));
    return overlap.length / Math.max(threadSymbols.length, narrativeElements.length, 1);
  }
  
  private determineArcType(signature: NarrativeSignature): NarrativeThread['arcType'] {
    // Simple heuristic based on narrative characteristics
    if (signature.depth > 0.8) return 'wisdom';
    if (signature.emergence > 0.7) return 'creative';
    if (signature.coherence < 0.4) return 'transformation';
    return 'heroic';
  }
}

class NarrativeAwareResponseGenerator implements NarrativeAwareResponseGenerator {
  async generate(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): Promise<LayeredResponse> {
    
    // Stub: Generate response based on narrative context and signature
    
    const narrativeType = signature.type;
    const narrativeRole = this.determineNarrativeRole(signature, context);
    
    // Different response styles based on narrative type
    switch (narrativeType) {
      case 'initiation':
        return {
          phenomenological: "Something new is stirring, like the first stirrings of dawn.",
          dialogical: "What wants to begin here?",
          layerUsed: 'mixed',
          narrativeRole: 'guide',
          storyPosition: 'beginning'
        };
        
      case 'threshold':
        return {
          phenomenological: "We're at the edge of something. The ground feels different here.",
          dialogical: "What would it mean to step across?",
          architectural: "Threshold spaces often require different ways of being.",
          layerUsed: 'mixed',
          narrativeRole: 'witness',
          storyPosition: 'middle'
        };
        
      case 'integration':
        return {
          phenomenological: "There's a settling happening, like pieces finding their place.",
          dialogical: "How does this new understanding want to live in you?",
          layerUsed: 'mixed',
          narrativeRole: 'companion',
          storyPosition: 'resolution'
        };
        
      case 'completion':
        return {
          phenomenological: "Something has come full circle. There's a quality of completion here.",
          layerUsed: 'phenomenological',
          narrativeRole: 'witness',
          storyPosition: 'resolution'
        };
        
      default: // 'everyday'
        return {
          phenomenological: "I'm listening to the texture of this moment.",
          layerUsed: 'phenomenological',
          narrativeRole: 'companion'
        };
    }
  }
  
  private determineNarrativeRole(
    signature: NarrativeSignature,
    context: NarrativeContext
  ): LayeredResponse['narrativeRole'] {
    
    // Simple role determination based on narrative characteristics
    if (signature.depth > 0.8) return 'guide';
    if (signature.emergence > 0.7) return 'challenger';
    if (signature.resonance > 0.8) return 'mirror';
    return 'companion';
  }
}

export default NarrativeEngine;