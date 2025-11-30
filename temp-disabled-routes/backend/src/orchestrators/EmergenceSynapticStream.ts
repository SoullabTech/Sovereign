/**
 * Emergence Synaptic Stream
 * Integrates emergence detection and synaptic gap analysis as event stream state
 * Step 2 of Phase 2 Service Consolidation - Event-driven emergence + synaptic dynamics
 */

import { EventBus, daimonicEventBus } from '../core/EventBus.js';
import { UnifiedStorageService } from '../core/UnifiedStorageService.js';
import { TypeRegistry, BaseEntity } from '../core/TypeRegistry.js';

export interface EmergenceSignal {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  
  // Emergence characteristics
  novelty: number;          // 0-1: How genuinely new this is
  coherence: number;        // 0-1: How well it hangs together
  surprise: number;         // 0-1: How unexpected it is
  integration: number;      // 0-1: How well it connects with existing knowledge
  resistance: number;       // 0-1: How much it resists easy categorization
  
  // Signal metadata
  strength: number;         // 0-1: Overall emergence signal strength
  confidence: number;       // 0-1: How confident we are in this measurement
  source: 'dialogue' | 'reflection' | 'synthesis' | 'breakthrough' | 'integration';
  
  // Context
  triggeringContent: string;
  relatedConcepts: string[];
  emergenceType: 'conceptual' | 'emotional' | 'somatic' | 'relational' | 'spiritual';
}

export interface SynapticGapState {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  
  // Gap characteristics
  width: number;           // 0-1: How wide the gap between perspectives
  charge: number;          // 0-1: How much tension/energy in the gap
  stability: number;       // 0-1: How stable/unstable the gap is
  transmission: number;    // 0-1: How well information flows across
  resonance: number;       // 0-1: How much the gap creates resonance
  
  // Gap dynamics
  expanding: boolean;      // Is the gap getting wider?
  contracting: boolean;    // Is the gap getting narrower?
  oscillating: boolean;    // Is the gap fluctuating?
  bridging: boolean;       // Is something bridging the gap?
  
  // Gap content
  gapType: 'knowledge' | 'meaning' | 'identity' | 'value' | 'experience';
  leftSide: string;        // What's on one side of the gap
  rightSide: string;       // What's on the other side
  bridgingElements: string[]; // What might connect across the gap
}

export interface SynapticEvent extends BaseEntity {
  userId: string;
  sessionId: string;
  
  // Event classification
  eventType: 'gap_detected' | 'gap_widened' | 'gap_bridged' | 'emergence_detected' | 'synthesis_occurred';
  intensity: number;       // 0-1: How intense this event is
  significance: number;    // 0-1: How significant for user's journey
  
  // Associated states
  emergenceSignal?: EmergenceSignal;
  synapticGap?: SynapticGapState;
  
  // Event context
  conversationContext: string[];
  environmentalFactors: string[];
  userState: {
    energy: number;
    engagement: number;
    resistance: number;
  };
}

export interface StreamState {
  userId: string;
  sessionId: string;
  lastUpdated: Date;
  
  // Current active signals
  activeEmergenceSignals: EmergenceSignal[];
  activeSynapticGaps: SynapticGapState[];
  
  // Stream statistics
  emergenceFrequency: number;    // Emergences per hour
  synapticActivity: number;      // Gap events per hour
  synthesisRate: number;         // Successful bridging rate
  
  // Trajectory indicators
  emergenceTrajectory: 'building' | 'stable' | 'declining' | 'volatile';
  synapticTrajectory: 'opening' | 'stable' | 'closing' | 'turbulent';
  
  // Stream health
  streamCoherence: number;       // 0-1: How coherent the overall stream is
  signalClarity: number;         // 0-1: How clear the signals are
  noiseLevel: number;            // 0-1: How much noise in the stream
}

/**
 * EmergenceSynapticStream - Real-time event stream processing
 * 
 * This orchestrator processes emergence and synaptic dynamics as continuous
 * event streams rather than discrete services. It:
 * 
 * 1. Monitors conversations for emergence signals
 * 2. Detects synaptic gaps as they form and evolve
 * 3. Tracks synthesis events when gaps are bridged
 * 4. Maintains stream state for real-time awareness
 * 5. Emits events for other systems to respond to
 */
export class EmergenceSynapticStream {
  private eventBus: EventBus;
  private storage: UnifiedStorageService;
  private typeRegistry: TypeRegistry;
  
  // Stream processors
  private emergenceDetector: StreamEmergenceDetector;
  private synapticAnalyzer: StreamSynapticAnalyzer;
  private synthesisTracker: SynthesisTracker;
  private streamStateManager: StreamStateManager;
  
  // Active stream states (in-memory for real-time processing)
  private activeStreams: Map<string, StreamState> = new Map();
  
  // Event processing queues
  private processingQueue: SynapticEvent[] = [];
  private isProcessing: boolean = false;

  constructor(
    eventBus: EventBus = daimonicEventBus,
    storage: UnifiedStorageService,
    typeRegistry: TypeRegistry
  ) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.typeRegistry = typeRegistry;
    
    // Initialize stream processors
    this.emergenceDetector = new StreamEmergenceDetector();
    this.synapticAnalyzer = new StreamSynapticAnalyzer();
    this.synthesisTracker = new SynthesisTracker();
    this.streamStateManager = new StreamStateManager(storage);
    
    this.setupEventStreaming();
    this.startStreamProcessing();
  }

  /**
   * Process incoming conversation for emergence and synaptic activity
   */
  async processConversationEvent(data: {
    userId: string;
    sessionId: string;
    userInput: string;
    agentResponse: string;
    conversationHistory: string[];
    userState?: any;
  }): Promise<{
    emergenceSignals: EmergenceSignal[];
    synapticEvents: SynapticEvent[];
    streamState: StreamState;
  }> {
    
    const { userId, sessionId } = data;
    const streamKey = `${userId}_${sessionId}`;
    
    // Get or create stream state
    let streamState = this.activeStreams.get(streamKey);
    if (!streamState) {
      streamState = await this.initializeStreamState(userId, sessionId);
      this.activeStreams.set(streamKey, streamState);
    }
    
    // Detect emergence signals
    const emergenceSignals = await this.emergenceDetector.detectEmergence(data, streamState);
    
    // Analyze synaptic gaps
    const synapticGaps = await this.synapticAnalyzer.analyzeSynapticActivity(data, streamState);
    
    // Check for synthesis events
    const synthesisEvents = await this.synthesisTracker.checkForSynthesis(
      emergenceSignals,
      synapticGaps,
      streamState
    );
    
    // Create synaptic events for processing
    const synapticEvents: SynapticEvent[] = [];
    
    // Add emergence events
    for (const signal of emergenceSignals) {
      synapticEvents.push(await this.createEmergenceEvent(signal, data));
    }
    
    // Add gap events
    for (const gap of synapticGaps) {
      synapticEvents.push(await this.createSynapticEvent(gap, data));
    }
    
    // Add synthesis events
    for (const synthesis of synthesisEvents) {
      synapticEvents.push(synthesis);
    }
    
    // Update stream state
    streamState = await this.updateStreamState(streamState, emergenceSignals, synapticGaps, synapticEvents);
    this.activeStreams.set(streamKey, streamState);
    
    // Queue events for processing
    this.queueEvents(synapticEvents);
    
    // Emit stream update event
    await this.eventBus.emit('emergence_synaptic:stream_updated', {
      userId,
      sessionId,
      emergenceSignals,
      synapticEvents,
      streamState,
      timestamp: new Date()
    });
    
    return {
      emergenceSignals,
      synapticEvents,
      streamState
    };
  }

  /**
   * Initialize new stream state for user session
   */
  private async initializeStreamState(userId: string, sessionId: string): Promise<StreamState> {
    const streamState: StreamState = {
      userId,
      sessionId,
      lastUpdated: new Date(),
      activeEmergenceSignals: [],
      activeSynapticGaps: [],
      emergenceFrequency: 0,
      synapticActivity: 0,
      synthesisRate: 0,
      emergenceTrajectory: 'stable',
      synapticTrajectory: 'stable',
      streamCoherence: 0.7,
      signalClarity: 0.6,
      noiseLevel: 0.3
    };
    
    // Load any existing stream data
    const existingState = await this.streamStateManager.loadStreamState(userId, sessionId);
    if (existingState) {
      return { ...streamState, ...existingState };
    }
    
    return streamState;
  }

  /**
   * Update stream state with new signals and events
   */
  private async updateStreamState(
    currentState: StreamState,
    emergenceSignals: EmergenceSignal[],
    synapticGaps: SynapticGapState[],
    events: SynapticEvent[]
  ): Promise<StreamState> {
    
    const updated = { ...currentState };
    updated.lastUpdated = new Date();
    
    // Update active signals (keep only recent and strong signals)
    updated.activeEmergenceSignals = this.filterActiveSignals([
      ...updated.activeEmergenceSignals,
      ...emergenceSignals
    ]);
    
    updated.activeSynapticGaps = this.filterActiveGaps([
      ...updated.activeSynapticGaps,
      ...synapticGaps
    ]);
    
    // Update stream statistics
    updated.emergenceFrequency = this.calculateEmergenceFrequency(updated.activeEmergenceSignals);
    updated.synapticActivity = this.calculateSynapticActivity(updated.activeSynapticGaps);
    updated.synthesisRate = this.calculateSynthesisRate(events);
    
    // Update trajectories
    updated.emergenceTrajectory = this.assessEmergenceTrajectory(updated.activeEmergenceSignals);
    updated.synapticTrajectory = this.assessSynapticTrajectory(updated.activeSynapticGaps);
    
    // Update stream health metrics
    updated.streamCoherence = this.assessStreamCoherence(updated);
    updated.signalClarity = this.assessSignalClarity(updated);
    updated.noiseLevel = this.assessNoiseLevel(updated);
    
    // Persist updated state
    await this.streamStateManager.saveStreamState(updated);
    
    return updated;
  }

  /**
   * Event creation methods
   */
  
  private async createEmergenceEvent(signal: EmergenceSignal, data: any): Promise<SynapticEvent> {
    return {
      id: `emergence_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: signal.userId,
      sessionId: signal.sessionId,
      eventType: 'emergence_detected',
      intensity: signal.strength,
      significance: signal.novelty * signal.coherence,
      emergenceSignal: signal,
      conversationContext: data.conversationHistory || [],
      environmentalFactors: this.extractEnvironmentalFactors(data),
      userState: {
        energy: data.userState?.energy || 0.5,
        engagement: data.userState?.engagement || 0.5,
        resistance: data.userState?.resistance || 0.3
      }
    };
  }
  
  private async createSynapticEvent(gap: SynapticGapState, data: any): Promise<SynapticEvent> {
    const eventType = this.determineSynapticEventType(gap);
    
    return {
      id: `synaptic_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: gap.userId,
      sessionId: gap.sessionId,
      eventType,
      intensity: gap.charge,
      significance: gap.width * gap.resonance,
      synapticGap: gap,
      conversationContext: data.conversationHistory || [],
      environmentalFactors: this.extractEnvironmentalFactors(data),
      userState: {
        energy: data.userState?.energy || 0.5,
        engagement: data.userState?.engagement || 0.5,
        resistance: data.userState?.resistance || 0.3
      }
    };
  }

  /**
   * Stream processing methods
   */
  
  private queueEvents(events: SynapticEvent[]): void {
    this.processingQueue.push(...events);
    
    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }
  
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const event = this.processingQueue.shift()!;
      
      try {
        // Store event
        await this.storage.store('synaptic_events', event.id, event);
        
        // Emit specific event type
        await this.eventBus.emit(`synaptic:${event.eventType}`, {
          event,
          timestamp: new Date()
        });
        
        // Check for pattern matches
        await this.checkForEventPatterns(event);
        
      } catch (error) {
        console.error('Error processing synaptic event:', error);
      }
    }
    
    this.isProcessing = false;
  }
  
  private async checkForEventPatterns(event: SynapticEvent): Promise<void> {
    // Look for significant patterns in event streams
    const recentEvents = await this.getRecentEvents(event.userId, event.sessionId, 10);
    
    // Check for emergence clusters
    const emergenceEvents = recentEvents.filter(e => e.eventType === 'emergence_detected');
    if (emergenceEvents.length >= 3) {
      await this.eventBus.emit('pattern:emergence_cluster', {
        userId: event.userId,
        sessionId: event.sessionId,
        events: emergenceEvents,
        pattern: 'multiple_emergences'
      });
    }
    
    // Check for synaptic bridging sequences
    const bridgeEvents = recentEvents.filter(e => e.eventType === 'gap_bridged');
    if (bridgeEvents.length >= 2) {
      await this.eventBus.emit('pattern:synaptic_bridging', {
        userId: event.userId,
        sessionId: event.sessionId,
        events: bridgeEvents,
        pattern: 'gap_bridging_sequence'
      });
    }
  }

  /**
   * Utility methods (stubs for dev implementation)
   */
  
  private filterActiveSignals(signals: EmergenceSignal[]): EmergenceSignal[] {
    // Keep signals from last hour with strength > 0.3
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return signals.filter(signal => 
      new Date(signal.timestamp) > oneHourAgo && signal.strength > 0.3
    ).slice(0, 10); // Limit to 10 most recent
  }
  
  private filterActiveGaps(gaps: SynapticGapState[]): SynapticGapState[] {
    // Keep gaps from last hour with significant charge or width
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return gaps.filter(gap => 
      new Date(gap.timestamp) > oneHourAgo && (gap.charge > 0.3 || gap.width > 0.4)
    ).slice(0, 10); // Limit to 10 most recent
  }
  
  private calculateEmergenceFrequency(signals: EmergenceSignal[]): number {
    // Count signals per hour
    return signals.length; // Simplified
  }
  
  private calculateSynapticActivity(gaps: SynapticGapState[]): number {
    // Count gap events per hour
    return gaps.length; // Simplified
  }
  
  private calculateSynthesisRate(events: SynapticEvent[]): number {
    const bridgeEvents = events.filter(e => e.eventType === 'gap_bridged');
    const totalEvents = events.length;
    return totalEvents > 0 ? bridgeEvents.length / totalEvents : 0;
  }
  
  private assessEmergenceTrajectory(signals: EmergenceSignal[]): StreamState['emergenceTrajectory'] {
    if (signals.length === 0) return 'stable';
    
    const avgStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;
    
    if (avgStrength > 0.7) return 'building';
    if (avgStrength < 0.3) return 'declining';
    
    // Check for volatility
    const strengthVariance = this.calculateVariance(signals.map(s => s.strength));
    return strengthVariance > 0.2 ? 'volatile' : 'stable';
  }
  
  private assessSynapticTrajectory(gaps: SynapticGapState[]): StreamState['synapticTrajectory'] {
    if (gaps.length === 0) return 'stable';
    
    const expandingGaps = gaps.filter(g => g.expanding).length;
    const contractingGaps = gaps.filter(g => g.contracting).length;
    
    if (expandingGaps > contractingGaps * 2) return 'opening';
    if (contractingGaps > expandingGaps * 2) return 'closing';
    
    const oscillatingGaps = gaps.filter(g => g.oscillating).length;
    return oscillatingGaps > gaps.length / 2 ? 'turbulent' : 'stable';
  }
  
  private assessStreamCoherence(state: StreamState): number {
    // Assess how well the stream hangs together
    const signalCoherence = this.assessSignalCoherence(state.activeEmergenceSignals);
    const gapCoherence = this.assessGapCoherence(state.activeSynapticGaps);
    
    return (signalCoherence + gapCoherence) / 2;
  }
  
  private assessSignalClarity(state: StreamState): number {
    // Assess how clear the signals are
    const signals = state.activeEmergenceSignals;
    if (signals.length === 0) return 0.5;
    
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    return avgConfidence;
  }
  
  private assessNoiseLevel(state: StreamState): number {
    // Assess noise in the stream
    const totalEvents = state.activeEmergenceSignals.length + state.activeSynapticGaps.length;
    const lowQualityEvents = [
      ...state.activeEmergenceSignals.filter(s => s.strength < 0.3),
      ...state.activeSynapticGaps.filter(g => g.charge < 0.2 && g.width < 0.2)
    ].length;
    
    return totalEvents > 0 ? lowQualityEvents / totalEvents : 0.3;
  }
  
  private determineSynapticEventType(gap: SynapticGapState): SynapticEvent['eventType'] {
    if (gap.bridging) return 'gap_bridged';
    if (gap.expanding) return 'gap_widened';
    return 'gap_detected';
  }
  
  private extractEnvironmentalFactors(data: any): string[] {
    const factors: string[] = [];
    
    if (data.timeOfDay) factors.push(`time_${data.timeOfDay}`);
    if (data.sessionDuration) factors.push(`duration_${data.sessionDuration}`);
    
    return factors;
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }
  
  private assessSignalCoherence(signals: EmergenceSignal[]): number {
    // Assess how coherent the emergence signals are
    return signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.coherence, 0) / signals.length : 0.5;
  }
  
  private assessGapCoherence(gaps: SynapticGapState[]): number {
    // Assess how coherent the synaptic gaps are
    return gaps.length > 0 ?
      gaps.reduce((sum, g) => sum + (1 - g.stability), 0) / gaps.length : 0.5;
  }
  
  private async getRecentEvents(userId: string, sessionId: string, limit: number): Promise<SynapticEvent[]> {
    // Retrieve recent events for pattern analysis
    // Implementation would query storage for recent events
    return []; // Placeholder
  }
  
  private setupEventStreaming(): void {
    // Listen for conversation events
    this.eventBus.subscribe('conversation:message', async (event) => {
      await this.processConversationEvent(event.data);
    });
    
    // Listen for user state changes
    this.eventBus.subscribe('user:state_changed', async (event) => {
      const { userId, sessionId } = event.data;
      const streamKey = `${userId}_${sessionId}`;
      const streamState = this.activeStreams.get(streamKey);
      
      if (streamState) {
        // Re-evaluate stream with new user state
        // Implementation would update stream processing
      }
    });
  }
  
  private startStreamProcessing(): void {
    // Start background stream processing
    setInterval(() => {
      this.processEventQueue();
    }, 1000); // Process every second
    
    // Cleanup old streams every 10 minutes
    setInterval(() => {
      this.cleanupInactiveStreams();
    }, 10 * 60 * 1000);
  }
  
  private cleanupInactiveStreams(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [key, stream] of this.activeStreams.entries()) {
      if (stream.lastUpdated < oneHourAgo) {
        this.activeStreams.delete(key);
      }
    }
  }

  /**
   * Public interface methods
   */
  
  async getStreamState(userId: string, sessionId: string): Promise<StreamState | null> {
    const streamKey = `${userId}_${sessionId}`;
    return this.activeStreams.get(streamKey) || null;
  }
  
  async getRecentEmergenceSignals(userId: string, limit: number = 10): Promise<EmergenceSignal[]> {
    // Implementation would query stored signals
    return []; // Placeholder
  }
  
  async getRecentSynapticGaps(userId: string, limit: number = 10): Promise<SynapticGapState[]> {
    // Implementation would query stored gaps
    return []; // Placeholder
  }
}

/**
 * Stream processor interfaces (for dev implementation)
 */

interface StreamEmergenceDetector {
  detectEmergence(data: any, streamState: StreamState): Promise<EmergenceSignal[]>;
}

interface StreamSynapticAnalyzer {
  analyzeSynapticActivity(data: any, streamState: StreamState): Promise<SynapticGapState[]>;
}

interface SynthesisTracker {
  checkForSynthesis(
    emergenceSignals: EmergenceSignal[],
    synapticGaps: SynapticGapState[],
    streamState: StreamState
  ): Promise<SynapticEvent[]>;
}

interface StreamStateManager {
  loadStreamState(userId: string, sessionId: string): Promise<Partial<StreamState> | null>;
  saveStreamState(state: StreamState): Promise<void>;
}

/**
 * Stub implementations (DEVS: Replace with actual implementations)
 */

class StreamEmergenceDetector implements StreamEmergenceDetector {
  async detectEmergence(data: any, streamState: StreamState): Promise<EmergenceSignal[]> {
    // Stub: Detect emergence in real-time conversation
    // Implementation would analyze dialogue for novelty, coherence, surprise, etc.
    return []; // Placeholder
  }
}

class StreamSynapticAnalyzer implements StreamSynapticAnalyzer {
  async analyzeSynapticActivity(data: any, streamState: StreamState): Promise<SynapticGapState[]> {
    // Stub: Detect synaptic gaps in real-time
    // Implementation would identify conceptual gaps, tensions, contradictions
    return []; // Placeholder
  }
}

class SynthesisTracker implements SynthesisTracker {
  async checkForSynthesis(
    emergenceSignals: EmergenceSignal[],
    synapticGaps: SynapticGapState[],
    streamState: StreamState
  ): Promise<SynapticEvent[]> {
    // Stub: Detect when gaps are bridged through emergence
    return []; // Placeholder
  }
}

class StreamStateManager implements StreamStateManager {
  constructor(private storage: UnifiedStorageService) {}
  
  async loadStreamState(userId: string, sessionId: string): Promise<Partial<StreamState> | null> {
    // Stub: Load existing stream state from storage
    return null; // Placeholder
  }
  
  async saveStreamState(state: StreamState): Promise<void> {
    // Stub: Save stream state to storage
    const key = `stream_state_${state.userId}_${state.sessionId}`;
    await this.storage.store('stream_states', key, state);
  }
}

export default EmergenceSynapticStream;