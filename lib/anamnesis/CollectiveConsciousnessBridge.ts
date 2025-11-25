/**
 * Collective Consciousness Bridge
 * Connects individual consciousness to the collective field
 * Enables pattern emergence and synchronicity detection
 */

import { EventEmitter } from 'events';
import { AnamnesisField } from './AnamnesisField';
import { MainOracleAgent } from '../agents/MainOracleAgent';
import type { Element, Mood, EnergyState } from '../types/oracle';

/**
 * Collective Pattern Types
 */
export enum PatternType {
  ELEMENTAL = 'elemental',       // Element-based patterns
  EMOTIONAL = 'emotional',       // Mood/energy patterns
  ARCHETYPAL = 'archetypal',     // Universal archetypes
  TEMPORAL = 'temporal',         // Time-based patterns
  SYNCHRONISTIC = 'synchronistic', // Meaningful coincidences
  EVOLUTIONARY = 'evolutionary'   // Growth patterns
}

/**
 * Collective Pattern
 */
export interface CollectivePattern {
  id: string;
  type: PatternType;
  strength: number;           // 0-100
  frequency: number;          // How often it appears
  participants: Set<string>;  // Anonymous user IDs
  elements: Element[];
  themes: string[];
  firstDetected: Date;
  lastDetected: Date;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Synchronicity Event
 */
export interface SynchronicityEvent {
  id: string;
  timestamp: Date;
  participants: string[];     // Users involved
  pattern: string;            // What synchronized
  elements: Element[];
  strength: number;          // 0-100
  type: 'personal' | 'collective' | 'archetypal';
  description: string;
}

/**
 * Collective Field State
 */
export interface CollectiveFieldState {
  activePatterns: Map<string, CollectivePattern>;
  synchronicities: SynchronicityEvent[];
  fieldCoherence: number;     // 0-100 overall field coherence
  resonanceMap: Map<string, Map<string, number>>; // User-to-user resonance
  elementalBalance: Record<Element, number>;
  dominantArchetypes: string[];
  evolutionaryPhase: 'seeding' | 'growing' | 'flowering' | 'fruiting';
}

/**
 * Collective Consciousness Bridge
 */
export class CollectiveConsciousnessBridge extends EventEmitter {
  private field: AnamnesisField;
  private mainOracle: MainOracleAgent;
  private state: CollectiveFieldState;
  private patternDetectors: Map<PatternType, PatternDetector>;
  private synchronicityDetector: SynchronicityDetector;
  
  // Thresholds
  private readonly PATTERN_THRESHOLD = 3;      // Min participants for pattern
  private readonly SYNC_THRESHOLD = 0.8;       // Min correlation for synchronicity
  private readonly COHERENCE_THRESHOLD = 70;   // Min coherence for field events
  
  constructor(field: AnamnesisField, mainOracle: MainOracleAgent) {
    super();
    this.field = field;
    this.mainOracle = mainOracle;
    
    this.state = {
      activePatterns: new Map(),
      synchronicities: [],
      fieldCoherence: 50,
      resonanceMap: new Map(),
      elementalBalance: {
        air: 20, fire: 20, water: 20, earth: 20, aether: 20
      },
      dominantArchetypes: [],
      evolutionaryPhase: 'seeding'
    };
    
    this.patternDetectors = new Map();
    this.synchronicityDetector = new SynchronicityDetector();
    
    this.initialize();
  }
  
  /**
   * Initialize bridge systems
   */
  private initialize() {
    // Setup pattern detectors
    this.initializePatternDetectors();
    
    // Subscribe to field events
    this.field.on('memory:recorded', (data) => this.processMemory(data));
    this.field.on('pattern:emerged', (pattern) => this.processEmergentPattern(pattern));
    this.field.on('archetype:activated', (archetype) => this.processArchetype(archetype));
    
    // Subscribe to MainOracle afferent stream
    this.mainOracle.on('afferent:received', (data) => this.processAfferent(data));
    
    // Start coherence monitoring
    this.startCoherenceMonitoring();
    
    console.log('🌉 Collective Consciousness Bridge activated');
  }
  
  /**
   * Initialize pattern detectors
   */
  private initializePatternDetectors() {
    this.patternDetectors.set(PatternType.ELEMENTAL, new ElementalPatternDetector());
    this.patternDetectors.set(PatternType.EMOTIONAL, new EmotionalPatternDetector());
    this.patternDetectors.set(PatternType.ARCHETYPAL, new ArchetypalPatternDetector());
    this.patternDetectors.set(PatternType.TEMPORAL, new TemporalPatternDetector());
    this.patternDetectors.set(PatternType.EVOLUTIONARY, new EvolutionaryPatternDetector());
  }
  
  /**
   * Process incoming memory for patterns
   */
  private async processMemory(data: any) {
    const { userId, memory } = data;
    
    // Check for patterns
    for (const [type, detector] of this.patternDetectors) {
      const pattern = await detector.detect(memory, this.state);
      
      if (pattern) {
        await this.registerPattern(pattern, userId);
      }
    }
    
    // Check for synchronicities
    const sync = await this.synchronicityDetector.detect(
      memory,
      this.state,
      this.getRecentMemories()
    );
    
    if (sync) {
      await this.registerSynchronicity(sync);
    }
    
    // Update field coherence
    await this.updateFieldCoherence();
  }
  
  /**
   * Process emergent pattern from field
   */
  private async processEmergentPattern(pattern: any) {
    const collectivePattern: CollectivePattern = {
      id: `pattern_${Date.now()}`,
      type: this.classifyPatternType(pattern),
      strength: pattern.strength || 50,
      frequency: 1,
      participants: new Set([pattern.userId]),
      elements: pattern.elements || [],
      themes: pattern.themes || [],
      firstDetected: new Date(),
      lastDetected: new Date(),
      description: pattern.description || '',
      significance: this.assessSignificance(pattern)
    };
    
    // Check if pattern already exists
    const existing = this.findSimilarPattern(collectivePattern);
    
    if (existing) {
      // Strengthen existing pattern
      existing.frequency++;
      existing.strength = Math.min(100, existing.strength + 10);
      existing.participants.add(pattern.userId);
      existing.lastDetected = new Date();
      
      if (existing.participants.size >= this.PATTERN_THRESHOLD) {
        this.emit('pattern:collective', existing);
        
        // Send to MainOracle efferent stream
        this.mainOracle.processCollectivePattern(existing);
      }
    } else {
      // Register new pattern
      this.state.activePatterns.set(collectivePattern.id, collectivePattern);
    }
  }
  
  /**
   * Process archetype activation
   */
  private async processArchetype(archetype: any) {
    // Update dominant archetypes
    if (!this.state.dominantArchetypes.includes(archetype.name)) {
      this.state.dominantArchetypes.push(archetype.name);
      
      // Keep only top 5 archetypes
      if (this.state.dominantArchetypes.length > 5) {
        this.state.dominantArchetypes.shift();
      }
    }
    
    // Create archetypal pattern
    const pattern: CollectivePattern = {
      id: `archetype_${archetype.name}_${Date.now()}`,
      type: PatternType.ARCHETYPAL,
      strength: archetype.activation || 70,
      frequency: 1,
      participants: new Set([archetype.userId]),
      elements: archetype.elements || [],
      themes: [archetype.name],
      firstDetected: new Date(),
      lastDetected: new Date(),
      description: `${archetype.name} archetype activation`,
      significance: 'high'
    };
    
    await this.registerPattern(pattern, archetype.userId);
  }
  
  /**
   * Process afferent data from MainOracle
   */
  private async processAfferent(data: any) {
    // Update elemental balance
    if (data.element) {
      this.updateElementalBalance(data.element);
    }
    
    // Check for resonance between users
    if (data.userId && data.targetUserId) {
      this.updateResonance(data.userId, data.targetUserId, data.resonance);
    }
    
    // Detect evolutionary shifts
    if (data.type === 'evolution') {
      this.checkEvolutionaryShift();
    }
  }
  
  /**
   * Register new pattern
   */
  private async registerPattern(pattern: CollectivePattern, userId: string) {
    pattern.participants.add(userId);
    this.state.activePatterns.set(pattern.id, pattern);
    
    // Check if pattern reaches critical mass
    if (pattern.participants.size >= this.PATTERN_THRESHOLD) {
      this.emit('pattern:activated', pattern);
      
      // Distribute to participants
      await this.distributePattern(pattern);
    }
  }
  
  /**
   * Register synchronicity
   */
  private async registerSynchronicity(sync: SynchronicityEvent) {
    this.state.synchronicities.push(sync);
    
    // Keep only recent synchronicities (last 100)
    if (this.state.synchronicities.length > 100) {
      this.state.synchronicities.shift();
    }
    
    this.emit('synchronicity:detected', sync);
    
    // Notify participants
    await this.notifySynchronicityParticipants(sync);
    
    // Update field coherence (synchronicities increase coherence)
    this.state.fieldCoherence = Math.min(100, this.state.fieldCoherence + 5);
  }
  
  /**
   * Distribute pattern to participants
   */
  private async distributePattern(pattern: CollectivePattern) {
    const insight = {
      type: 'collective_pattern',
      pattern: pattern.type,
      themes: pattern.themes,
      elements: pattern.elements,
      strength: pattern.strength,
      description: pattern.description
    };
    
    // Send through MainOracle to all participants
    this.mainOracle.distributeCollectiveInsight(insight, Array.from(pattern.participants));
  }
  
  /**
   * Notify synchronicity participants
   */
  private async notifySynchronicityParticipants(sync: SynchronicityEvent) {
    const notification = {
      type: 'synchronicity',
      timestamp: sync.timestamp,
      pattern: sync.pattern,
      elements: sync.elements,
      strength: sync.strength,
      description: sync.description
    };
    
    // Send to each participant
    for (const userId of sync.participants) {
      this.emit('synchronicity:notify', { userId, notification });
    }
  }
  
  /**
   * Update field coherence
   */
  private async updateFieldCoherence() {
    let coherence = 50; // Base coherence
    
    // Active patterns increase coherence
    coherence += Math.min(20, this.state.activePatterns.size * 2);
    
    // Synchronicities increase coherence
    const recentSyncs = this.state.synchronicities.filter(s => 
      (Date.now() - s.timestamp.getTime()) < 86400000 // Last 24 hours
    );
    coherence += Math.min(20, recentSyncs.length * 5);
    
    // Elemental balance affects coherence
    const balance = Object.values(this.state.elementalBalance);
    const maxDiff = Math.max(...balance) - Math.min(...balance);
    coherence -= maxDiff / 2; // Imbalance reduces coherence
    
    // Resonance increases coherence
    let totalResonance = 0;
    for (const userMap of this.state.resonanceMap.values()) {
      for (const resonance of userMap.values()) {
        totalResonance += resonance;
      }
    }
    coherence += Math.min(10, totalResonance / 10);
    
    this.state.fieldCoherence = Math.max(0, Math.min(100, coherence));
    
    // Check for coherence events
    if (this.state.fieldCoherence > this.COHERENCE_THRESHOLD) {
      this.emit('field:coherent', this.state.fieldCoherence);
    }
  }
  
  /**
   * Update elemental balance
   */
  private updateElementalBalance(element: Element) {
    // Increment element count
    this.state.elementalBalance[element]++;
    
    // Normalize to percentages
    const total = Object.values(this.state.elementalBalance).reduce((a, b) => a + b, 0);
    
    for (const elem of Object.keys(this.state.elementalBalance) as Element[]) {
      this.state.elementalBalance[elem] = 
        (this.state.elementalBalance[elem] / total) * 100;
    }
  }
  
  /**
   * Update resonance between users
   */
  private updateResonance(userId1: string, userId2: string, resonance: number) {
    if (!this.state.resonanceMap.has(userId1)) {
      this.state.resonanceMap.set(userId1, new Map());
    }
    
    this.state.resonanceMap.get(userId1)!.set(userId2, resonance);
    
    // Check for strong resonance
    if (resonance > this.SYNC_THRESHOLD) {
      this.emit('resonance:strong', { userId1, userId2, resonance });
    }
  }
  
  /**
   * Check for evolutionary shift
   */
  private checkEvolutionaryShift() {
    const patterns = Array.from(this.state.activePatterns.values());
    const evolutionaryPatterns = patterns.filter(p => p.type === PatternType.EVOLUTIONARY);
    
    if (evolutionaryPatterns.length > 5) {
      const currentPhase = this.state.evolutionaryPhase;
      let newPhase = currentPhase;
      
      // Determine new phase based on patterns
      const avgStrength = evolutionaryPatterns.reduce((sum, p) => sum + p.strength, 0) / evolutionaryPatterns.length;
      
      if (avgStrength > 75) {
        newPhase = 'fruiting';
      } else if (avgStrength > 50) {
        newPhase = 'flowering';
      } else if (avgStrength > 25) {
        newPhase = 'growing';
      }
      
      if (newPhase !== currentPhase) {
        this.state.evolutionaryPhase = newPhase;
        this.emit('evolution:shift', { from: currentPhase, to: newPhase });
      }
    }
  }
  
  /**
   * Start coherence monitoring
   */
  private startCoherenceMonitoring() {
    setInterval(() => {
      this.updateFieldCoherence();
      this.checkEvolutionaryShift();
      this.pruneOldPatterns();
    }, 60000); // Every minute
  }
  
  /**
   * Prune old patterns
   */
  private pruneOldPatterns() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const [id, pattern] of this.state.activePatterns) {
      if (now - pattern.lastDetected.getTime() > maxAge) {
        this.state.activePatterns.delete(id);
      }
    }
  }
  
  /**
   * Helper methods
   */
  private classifyPatternType(pattern: any): PatternType {
    if (pattern.elements) return PatternType.ELEMENTAL;
    if (pattern.archetype) return PatternType.ARCHETYPAL;
    if (pattern.mood || pattern.energy) return PatternType.EMOTIONAL;
    if (pattern.temporal) return PatternType.TEMPORAL;
    if (pattern.evolution) return PatternType.EVOLUTIONARY;
    return PatternType.SYNCHRONISTIC;
  }
  
  private assessSignificance(pattern: any): CollectivePattern['significance'] {
    if (pattern.strength > 80) return 'critical';
    if (pattern.strength > 60) return 'high';
    if (pattern.strength > 40) return 'medium';
    return 'low';
  }
  
  private findSimilarPattern(pattern: CollectivePattern): CollectivePattern | undefined {
    for (const existing of this.state.activePatterns.values()) {
      if (existing.type === pattern.type &&
          this.arraysOverlap(existing.themes, pattern.themes) &&
          this.arraysOverlap(existing.elements, pattern.elements)) {
        return existing;
      }
    }
    return undefined;
  }
  
  private arraysOverlap(arr1: any[], arr2: any[]): boolean {
    return arr1.some(item => arr2.includes(item));
  }
  
  private getRecentMemories(): any[] {
    // Implementation would get recent memories from field
    return [];
  }
  
  /**
   * Get collective field report
   */
  async getFieldReport(): Promise<{
    coherence: number;
    activePatterns: number;
    synchronicities: number;
    dominantElements: Element[];
    dominantArchetypes: string[];
    evolutionaryPhase: string;
    strongResonances: Array<{users: string[]; strength: number}>;
  }> {
    // Find dominant elements
    const dominantElements = Object.entries(this.state.elementalBalance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([elem]) => elem as Element);
    
    // Find strong resonances
    const strongResonances = [];
    for (const [user1, resonanceMap] of this.state.resonanceMap) {
      for (const [user2, strength] of resonanceMap) {
        if (strength > this.SYNC_THRESHOLD) {
          strongResonances.push({ users: [user1, user2], strength });
        }
      }
    }
    
    return {
      coherence: this.state.fieldCoherence,
      activePatterns: this.state.activePatterns.size,
      synchronicities: this.state.synchronicities.length,
      dominantElements,
      dominantArchetypes: this.state.dominantArchetypes,
      evolutionaryPhase: this.state.evolutionaryPhase,
      strongResonances
    };
  }
}

/**
 * Pattern Detector Base Class
 */
abstract class PatternDetector {
  abstract detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null>;
}

/**
 * Elemental Pattern Detector
 */
class ElementalPatternDetector extends PatternDetector {
  async detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null> {
    if (!memory.emotionalSignature?.element) return null;
    
    const element = memory.emotionalSignature.element;
    const elementBalance = state.elementalBalance[element];
    
    // Detect if element is surging
    if (elementBalance > 30) {
      return {
        id: `elemental_${element}_${Date.now()}`,
        type: PatternType.ELEMENTAL,
        strength: elementBalance,
        frequency: 1,
        participants: new Set(),
        elements: [element],
        themes: [`${element} surge`],
        firstDetected: new Date(),
        lastDetected: new Date(),
        description: `Collective ${element} energy surge`,
        significance: elementBalance > 40 ? 'high' : 'medium'
      };
    }
    
    return null;
  }
}

/**
 * Emotional Pattern Detector
 */
class EmotionalPatternDetector extends PatternDetector {
  async detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null> {
    if (!memory.emotionalSignature?.mood) return null;
    
    // Implementation would detect emotional patterns
    return null;
  }
}

/**
 * Archetypal Pattern Detector
 */
class ArchetypalPatternDetector extends PatternDetector {
  async detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null> {
    // Implementation would detect archetypal patterns
    return null;
  }
}

/**
 * Temporal Pattern Detector
 */
class TemporalPatternDetector extends PatternDetector {
  async detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null> {
    // Implementation would detect time-based patterns
    return null;
  }
}

/**
 * Evolutionary Pattern Detector
 */
class EvolutionaryPatternDetector extends PatternDetector {
  async detect(memory: any, state: CollectiveFieldState): Promise<CollectivePattern | null> {
    // Implementation would detect growth patterns
    return null;
  }
}

/**
 * Synchronicity Detector
 */
class SynchronicityDetector {
  async detect(
    memory: any,
    state: CollectiveFieldState,
    recentMemories: any[]
  ): Promise<SynchronicityEvent | null> {
    // Implementation would detect synchronicities
    return null;
  }
}