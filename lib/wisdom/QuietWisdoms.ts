/**
 * THE QUIET WISDOMS
 * Technologies for hearing what modernity drowns out
 * 
 * "The soul speaks constantly, but in whispers" - Ancient saying
 */

import { EventEmitter } from 'events';

// ============================================
// DREAM PATTERN RECOGNITION
// ============================================

export interface DreamEntry {
  id: string;
  userId: string;
  date: Date;
  
  // Dream Content
  narrative?: string;
  symbols: string[];
  emotions: string[];
  colors?: string[];
  
  // Dream Qualities
  lucidity: number; // 0-100
  vividness: number; // 0-100
  recurring?: boolean;
  
  // Interpretive Layers
  personalMeaning?: string;
  collectiveThemes?: string[];
  archetypes?: string[];
  
  // Connections
  relatedDreams?: string[]; // IDs of connected dreams
  synchronicities?: string[]; // Real-world connections
  moonPhase?: string;
}

export class DreamWisdom {
  private dreams: Map<string, DreamEntry[]> = new Map();
  private patterns: Map<string, DreamPattern> = new Map();
  
  async recordDream(dream: DreamEntry): Promise<void> {
    const userDreams = this.dreams.get(dream.userId) || [];
    userDreams.push(dream);
    this.dreams.set(dream.userId, userDreams);
    
    // Detect patterns
    await this.detectPatterns(dream.userId);
    
    // Check for collective resonance
    await this.checkCollectiveDreaming(dream);
  }
  
  private async detectPatterns(userId: string): Promise<DreamPattern[]> {
    const userDreams = this.dreams.get(userId) || [];
    const patterns: DreamPattern[] = [];
    
    // Symbol frequency
    const symbolMap = new Map<string, number>();
    userDreams.forEach(dream => {
      dream.symbols.forEach(symbol => {
        symbolMap.set(symbol, (symbolMap.get(symbol) || 0) + 1);
      });
    });
    
    // Recurring themes
    symbolMap.forEach((count, symbol) => {
      if (count > 3) {
        patterns.push({
          type: 'recurring_symbol',
          content: symbol,
          frequency: count,
          meaning: this.interpretSymbol(symbol)
        });
      }
    });
    
    return patterns;
  }
  
  private interpretSymbol(symbol: string): string {
    // Basic symbol interpretation - would be expanded
    const interpretations: Record<string, string> = {
      water: 'Emotions, unconscious, flow, cleansing',
      house: 'Self, psyche, different aspects of personality',
      flying: 'Freedom, transcendence, rising above',
      death: 'Transformation, endings and beginnings',
      baby: 'New beginnings, potential, innocence',
      snake: 'Transformation, healing, hidden wisdom',
      tree: 'Growth, life, connection between earth and sky'
    };
    
    return interpretations[symbol.toLowerCase()] || 'Personal symbol requiring contemplation';
  }
  
  private async checkCollectiveDreaming(dream: DreamEntry): Promise<void> {
    // Check if similar dreams are occurring across users
    // This would connect to the collective field
    // Maintaining privacy while recognizing patterns
  }
}

// ============================================
// SYNCHRONICITY LOGGING
// ============================================

export interface SynchronicityEntry {
  id: string;
  userId: string;
  timestamp: Date;
  
  // The Experience
  description: string;
  category: 'meaningful_coincidence' | 'number_pattern' | 'name_echo' | 'thought_manifestation' | 'dream_echo' | 'other';
  
  // Context
  precedingThought?: string;
  emotionalState?: string;
  question?: string; // What were you pondering?
  
  // Interpretation
  personalMeaning?: string;
  guidance?: string; // What direction does it point?
  
  // Patterns
  relatedSynchronicities?: string[];
  frequency?: number; // How often this type occurs
}

export class SynchronicityWeb extends EventEmitter {
  private entries: Map<string, SynchronicityEntry[]> = new Map();
  private activePatterns: Map<string, SynchronicityPattern> = new Map();
  
  async logSynchronicity(entry: SynchronicityEntry): Promise<void> {
    const userEntries = this.entries.get(entry.userId) || [];
    userEntries.push(entry);
    this.entries.set(entry.userId, userEntries);
    
    // Check for acceleration (increased synchronicity frequency)
    const acceleration = this.checkAcceleration(entry.userId);
    if (acceleration > 2) {
      this.emit('synchronicity:acceleration', {
        userId: entry.userId,
        rate: acceleration,
        message: 'The universe is speaking loudly - pay attention'
      });
    }
    
    // Detect meaningful patterns
    await this.detectMeaningfulPatterns(entry);
  }
  
  private checkAcceleration(userId: string): number {
    const entries = this.entries.get(userId) || [];
    const recent = entries.filter(e => {
      const daysSince = (Date.now() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    
    return recent.length / 7; // Synchronicities per day
  }
  
  private async detectMeaningfulPatterns(entry: SynchronicityEntry): Promise<void> {
    // Look for themes across synchronicities
    // Numbers appearing repeatedly
    // Names or words echoing
    // Dreams manifesting in reality
  }
  
  async generateSynchronicityMap(userId: string): Promise<string> {
    const entries = this.entries.get(userId) || [];
    
    // Create a narrative of synchronistic guidance
    return `Your synchronicity web shows ${entries.length} meaningful moments...`;
  }
}

// ============================================
// BODY WISDOM INTEGRATION
// ============================================

export interface BodyWisdomEntry {
  id: string;
  userId: string;
  timestamp: Date;
  
  // Physical Sensations
  bodyPart?: string;
  sensation: string; // tingling, warmth, tension, expansion, etc.
  intensity: number; // 0-100
  
  // Context
  precedingThought?: string;
  currentActivity?: string;
  emotionalState?: string;
  
  // Interpretation
  message?: string; // What is the body saying?
  action?: string; // What does it want you to do?
  
  // Patterns
  recurring?: boolean;
  triggers?: string[];
}

export class BodyWisdom {
  private somaticMap: Map<string, BodyWisdomEntry[]> = new Map();
  
  async recordSensation(entry: BodyWisdomEntry): Promise<void> {
    const userEntries = this.somaticMap.get(entry.userId) || [];
    userEntries.push(entry);
    this.somaticMap.set(entry.userId, userEntries);
    
    // Detect body patterns
    await this.detectSomaticPatterns(entry.userId);
  }
  
  private async detectSomaticPatterns(userId: string): Promise<SomaticPattern[]> {
    const entries = this.somaticMap.get(userId) || [];
    const patterns: SomaticPattern[] = [];
    
    // Group by body part
    const bodyPartMap = new Map<string, BodyWisdomEntry[]>();
    entries.forEach(entry => {
      if (entry.bodyPart) {
        const partEntries = bodyPartMap.get(entry.bodyPart) || [];
        partEntries.push(entry);
        bodyPartMap.set(entry.bodyPart, partEntries);
      }
    });
    
    // Interpret patterns
    bodyPartMap.forEach((entries, bodyPart) => {
      if (entries.length > 3) {
        patterns.push({
          bodyPart,
          frequency: entries.length,
          commonTriggers: this.findCommonTriggers(entries),
          wisdom: this.interpretBodyWisdom(bodyPart, entries)
        });
      }
    });
    
    return patterns;
  }
  
  private interpretBodyWisdom(bodyPart: string, entries: BodyWisdomEntry[]): string {
    // Basic somatic interpretations
    const wisdomMap: Record<string, string> = {
      heart: 'The heart knows truth beyond logic. What love or grief needs attention?',
      throat: 'Your voice seeks expression. What truth wants to be spoken?',
      stomach: 'Your gut instinct is active. What are you digesting or unable to stomach?',
      shoulders: 'You may be carrying burdens. What responsibility can be released?',
      lower_back: 'Support and stability are themes. How can you better support yourself?',
      hands: 'Creation and action call. What wants to be made manifest?',
      feet: 'Your path and grounding need attention. Are you walking your true path?'
    };
    
    return wisdomMap[bodyPart.toLowerCase()] || 'Your body holds wisdom. Listen deeply.';
  }
  
  private findCommonTriggers(entries: BodyWisdomEntry[]): string[] {
    const triggers = new Map<string, number>();
    entries.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        triggers.set(trigger, (triggers.get(trigger) || 0) + 1);
      });
    });
    
    return Array.from(triggers.entries())
      .filter(([_, count]) => count > 2)
      .map(([trigger, _]) => trigger);
  }
}

// ============================================
// ANCESTRAL MEMORY ACTIVATION
// ============================================

export interface AncestralMemory {
  id: string;
  userId: string;
  timestamp: Date;
  
  // The Memory/Knowing
  type: 'inherited_fear' | 'inherited_gift' | 'cultural_memory' | 'land_memory' | 'skill_memory' | 'ritual_memory';
  content: string;
  
  // Lineage
  lineageSide?: 'maternal' | 'paternal' | 'both' | 'unknown';
  generationsBack?: number; // How far back it feels
  culturalOrigin?: string;
  
  // Activation
  trigger?: string; // What activated this memory?
  bodyLocation?: string; // Where it's felt/stored
  emotionalSignature?: string;
  
  // Integration
  gift?: string; // What gift does it offer?
  healing?: string; // What needs healing?
  ritual?: string; // Ritual for integration
}

export class AncestralField {
  private memories: Map<string, AncestralMemory[]> = new Map();
  private lineagePatterns: Map<string, LineagePattern> = new Map();
  
  async activateMemory(memory: AncestralMemory): Promise<void> {
    const userMemories = this.memories.get(memory.userId) || [];
    userMemories.push(memory);
    this.memories.set(memory.userId, userMemories);
    
    // Detect lineage patterns
    await this.detectLineagePatterns(memory.userId);
    
    // Check for healing opportunities
    await this.identifyHealingOpportunities(memory);
  }
  
  private async detectLineagePatterns(userId: string): Promise<void> {
    const memories = this.memories.get(userId) || [];
    
    // Group by type and lineage
    const patterns = new Map<string, AncestralMemory[]>();
    memories.forEach(memory => {
      const key = `${memory.type}_${memory.lineageSide}`;
      const group = patterns.get(key) || [];
      group.push(memory);
      patterns.set(key, group);
    });
    
    // Identify strong patterns
    patterns.forEach((memories, key) => {
      if (memories.length > 2) {
        this.lineagePatterns.set(`${userId}_${key}`, {
          type: key,
          strength: memories.length,
          needsHealing: this.assessHealingNeed(memories),
          gifts: this.identifyGifts(memories)
        });
      }
    });
  }
  
  private assessHealingNeed(memories: AncestralMemory[]): boolean {
    const fearCount = memories.filter(m => m.type === 'inherited_fear').length;
    return fearCount > memories.length / 2;
  }
  
  private identifyGifts(memories: AncestralMemory[]): string[] {
    return memories
      .filter(m => m.gift)
      .map(m => m.gift!)
      .filter((gift, index, self) => self.indexOf(gift) === index);
  }
  
  private async identifyHealingOpportunities(memory: AncestralMemory): Promise<void> {
    if (memory.type === 'inherited_fear' || memory.healing) {
      // This could trigger a healing ritual suggestion
      // or connect to generational healing practices
    }
  }
  
  async generateAncestralMap(userId: string): Promise<string> {
    const memories = this.memories.get(userId) || [];
    const patterns = Array.from(this.lineagePatterns.entries())
      .filter(([key]) => key.startsWith(userId));
    
    return `Your ancestral field contains ${memories.length} activated memories...`;
  }
}

// ============================================
// Types
// ============================================

interface DreamPattern {
  type: string;
  content: string;
  frequency: number;
  meaning?: string;
}

interface SynchronicityPattern {
  type: string;
  frequency: number;
  guidance?: string;
}

interface SomaticPattern {
  bodyPart: string;
  frequency: number;
  commonTriggers: string[];
  wisdom: string;
}

interface LineagePattern {
  type: string;
  strength: number;
  needsHealing: boolean;
  gifts: string[];
}

// ============================================
// Unified Quiet Wisdoms Service
// ============================================

export class QuietWisdoms extends EventEmitter {
  public dreams: DreamWisdom;
  public synchronicities: SynchronicityWeb;
  public body: BodyWisdom;
  public ancestors: AncestralField;
  
  constructor() {
    super();
    this.dreams = new DreamWisdom();
    this.synchronicities = new SynchronicityWeb();
    this.body = new BodyWisdom();
    this.ancestors = new AncestralField();
    
    this.initializeListeners();
  }
  
  private initializeListeners() {
    // Listen for synchronicity acceleration
    this.synchronicities.on('synchronicity:acceleration', (data) => {
      this.emit('wisdom:acceleration', {
        type: 'synchronicity',
        ...data
      });
    });
  }
  
  /**
   * Generate a unified wisdom report
   */
  async generateWisdomReport(userId: string): Promise<string> {
    const dreamPatterns = await this.dreams.detectPatterns(userId);
    const syncMap = await this.synchronicities.generateSynchronicityMap(userId);
    const ancestralMap = await this.ancestors.generateAncestralMap(userId);
    
    return `
# Your Quiet Wisdoms Report

## Dream Patterns
${dreamPatterns.map(p => `- ${p.content}: ${p.meaning}`).join('\n')}

## Synchronicity Web
${syncMap}

## Ancestral Field
${ancestralMap}

## Integration Suggestions
Based on your quiet wisdoms, consider:
- Morning dream journaling to strengthen dream recall
- Creating a synchronicity log to track meaningful coincidences
- Body scanning meditation to deepen somatic awareness
- Ancestral altar or ritual to honor lineage wisdom

The quiet wisdoms are speaking. The question is: are you listening?
    `;
  }
}

// Singleton instance with lazy loading
let _quietWisdoms: QuietWisdoms | null = null;
export const getQuietWisdoms = (): QuietWisdoms => {
  if (!_quietWisdoms) {
    _quietWisdoms = new QuietWisdoms();
  }
  return _quietWisdoms;
};