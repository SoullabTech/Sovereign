/**
 * SpiralMapper.ts - Auto-generates spiral journey visualizations from user memory logs
 * 
 * Transforms session metadata, journals, and agent logs into:
 * - Polar spiral maps with phase/element tracking
 * - Elemental balance assessments
 * - Narrative thread detection
 * - Practice recommendations for coherence
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { UnifiedSymbolProcessor } from './UnifiedSymbolProcessor';
import { UnifiedDataAccessService } from './UnifiedDataAccessService';
import { BetaSafetyGuards } from './BetaSafetyGuards';

// Core types for spiral journey mapping
export interface SpiralPoint {
  id: string;
  sessionId: string;
  timestamp: string;
  phase: SpiralogicPhase;
  element: Element;
  intensity: number; // 0-1 scale
  content: string;
  journalExcerpt?: string;
  practice?: {
    ritual: string;
    therapeutic: string;
  };
  symbols?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  coordinates?: {
    angle: number; // Degrees on spiral
    radius: number; // Distance from center
  };
}

export type SpiralogicPhase = 
  | 'sacred_frame'
  | 'wholeness' 
  | 'friction'
  | 'integration'
  | 'closing';

export type Element = 
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'aether';

export interface ElementalBalance {
  element: Element;
  activity: number; // 0-1 scale
  sessions: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastSeen: string;
}

export interface NarrativeThread {
  id: string;
  symbol: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  contexts: string[];
  associatedElements: Element[];
  archetypalMapping?: string;
}

export interface SpiralJourney {
  userId: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  spiralPoints: SpiralPoint[];
  elementalBalance: ElementalBalance[];
  narrativeThreads: NarrativeThread[];
  currentPhase: SpiralogicPhase;
  dominantElement: Element;
  recommendations: {
    nextPractice: string;
    elementToBalance: Element;
    narrativeToExplore: string;
  };
}

export class SpiralMapper {
  private phaseKeywords: Record<SpiralogicPhase, string[]> = {
    sacred_frame: ['beginning', 'opening', 'sacred', 'ritual', 'threshold'],
    wholeness: ['complete', 'whole', 'affirm', 'strength', 'resource'],
    friction: ['challenge', 'stuck', 'anxiety', 'fear', 'resistance'],
    integration: ['merge', 'combine', 'synthesize', 'understand', 'connect'],
    closing: ['end', 'complete', 'closure', 'rest', 'release']
  };

  private elementKeywords: Record<Element, string[]> = {
    fire: ['passion', 'anger', 'creative', 'energy', 'transform', 'burn', 'intense'],
    water: ['emotion', 'flow', 'feeling', 'tears', 'intuition', 'deep', 'ocean'],
    earth: ['grounded', 'stable', 'practical', 'body', 'physical', 'solid', 'material'],
    air: ['thought', 'mind', 'anxiety', 'breath', 'communication', 'idea', 'mental'],
    aether: ['spirit', 'transcend', 'mystery', 'divine', 'sacred', 'soul', 'cosmic']
  };

  private symbolPatterns = {
    transformation: ['butterfly', 'phoenix', 'snake', 'chrysalis', 'metamorphosis'],
    journey: ['path', 'road', 'river', 'mountain', 'bridge', 'threshold'],
    shadow: ['dark', 'shadow', 'night', 'moon', 'hidden', 'unconscious'],
    light: ['sun', 'light', 'dawn', 'bright', 'illuminate', 'clarity'],
    nature: ['tree', 'forest', 'ocean', 'mountain', 'animal', 'earth']
  };

  /**
   * Generate complete spiral journey from user's memory logs
   */
  async generateSpiralJourney(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpiralJourney> {
    const startTime = performance.now();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate || new Date();

    try {
      // Fetch all relevant memory data with safety guards
      const dataResult = await BetaSafetyGuards.safeDataFetch(userId, {
        includeSessions: true,
        includeJournals: true,
        includeConversations: true,
        includeProfile: false,
        startDate: start,
        endDate: end,
        limit: 100
      });

      if (!dataResult.success) {
        logger.warn('[SPIRAL_MAPPER] Using fallback data due to fetch failure');
      }

      const { sessions, journals, conversations } = dataResult.data;

      // Transform into spiral points with validation
      const spiralPoints = BetaSafetyGuards.validateData(
        this.transformToSpiralPoints(sessions || [], journals || [], conversations || []),
        (points) => Array.isArray(points),
        [],
        'spiralPoints'
      );
      
      // Calculate elemental balance with validation
      const elementalBalance = BetaSafetyGuards.validateData(
        this.calculateElementalBalance(spiralPoints),
        (balance) => Array.isArray(balance) && balance.length > 0,
        this.getDefaultElementalBalance(),
        'elementalBalance'
      );
      
      // Detect narrative threads safely
      const narrativeThreadsResult = await BetaSafetyGuards.safeExecute(
        () => this.detectNarrativeThreads(spiralPoints, journals || []),
        () => [],
        'NarrativeThreads',
        1000
      );
      
      const narrativeThreads = narrativeThreadsResult.data;
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(elementalBalance, narrativeThreads, spiralPoints);

      // Determine current state
      const currentPhase = this.detectCurrentPhase(spiralPoints);
      const dominantElement = this.findDominantElement(elementalBalance);

      const processingTime = performance.now() - startTime;
      
      // Log performance metrics
      if (processingTime > 500) {
        logger.warn(`[SPIRAL_MAPPER] Slow journey generation: ${processingTime.toFixed(1)}ms for ${sessions.length + journals.length + conversations.length} items`);
      } else if (process.env.MAYA_DEBUG_PERFORMANCE === 'true') {
        logger.info(`[SPIRAL_MAPPER] Journey generated in ${processingTime.toFixed(1)}ms`);
      }

      return {
        userId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalSessions: sessions.length,
        spiralPoints,
        elementalBalance,
        narrativeThreads,
        currentPhase,
        dominantElement,
        recommendations
      };

    } catch (error) {
      logger.error('[SPIRAL_MAPPER] Failed to generate journey:', error);
      throw error;
    }
  }

  /**
   * Transform raw data into spiral points with phase/element tagging
   */
  private transformToSpiralPoints(
    sessions: any[],
    journals: any[],
    conversations: any[]
  ): SpiralPoint[] {
    const points: SpiralPoint[] = [];
    let spiralAngle = 0;
    let spiralRadius = 10;

    // Process sessions chronologically
    const allEvents = [...sessions, ...journals, ...conversations]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    allEvents.forEach((event, index) => {
      const phase = this.detectPhase(event.content || event.text || '');
      const element = this.detectElement(event.content || event.text || '');
      const symbols = this.extractSymbols(event.content || event.text || '');
      const sentiment = this.analyzeSentiment(event.content || event.text || '');

      // Calculate spiral coordinates
      spiralAngle += 30; // 30 degrees per point
      spiralRadius += 2; // Gradual outward expansion

      const point: SpiralPoint = {
        id: event.id || `point-${index}`,
        sessionId: event.session_id || event.id,
        timestamp: event.created_at || event.timestamp,
        phase,
        element,
        intensity: this.calculateIntensity(event.content || event.text || '', element),
        content: this.extractSnippet(event.content || event.text || ''),
        journalExcerpt: event.type === 'journal' ? event.content : undefined,
        symbols,
        sentiment,
        coordinates: {
          angle: spiralAngle % 360,
          radius: spiralRadius
        }
      };

      // Add practice recommendations if in friction phase
      if (phase === 'friction') {
        point.practice = this.suggestPractice(element, event.content || '');
      }

      points.push(point);
    });

    return points;
  }

  /**
   * Detect Spiralogic phase from text content
   */
  private detectPhase(text: string): SpiralogicPhase {
    const lowerText = text.toLowerCase();
    let bestMatch: SpiralogicPhase = 'integration'; // Default
    let highestScore = 0;

    Object.entries(this.phaseKeywords).forEach(([phase, keywords]) => {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = phase as SpiralogicPhase;
      }
    });

    return bestMatch;
  }

  /**
   * Detect dominant element from text content
   */
  private detectElement(text: string): Element {
    const lowerText = text.toLowerCase();
    let bestMatch: Element = 'aether'; // Default to spirit
    let highestScore = 0;

    Object.entries(this.elementKeywords).forEach(([element, keywords]) => {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = element as Element;
      }
    });

    return bestMatch;
  }

  /**
   * Extract symbolic patterns from text (now uses UnifiedSymbolProcessor)
   */
  private extractSymbols(text: string): string[] {
    const symbolCheck = UnifiedSymbolProcessor.quickSymbolCheck(text);
    if (symbolCheck.hasSymbols && symbolCheck.topSymbol) {
      return [symbolCheck.topSymbol.label];
    }
    return [];
  }

  /**
   * Calculate elemental intensity (0-1 scale)
   */
  private calculateIntensity(text: string, element: Element): number {
    const keywords = this.elementKeywords[element];
    const lowerText = text.toLowerCase();
    const matches = keywords.filter(k => lowerText.includes(k)).length;
    return Math.min(1, matches / 3); // Normalize to 0-1
  }

  /**
   * Extract meaningful snippet for display
   */
  private extractSnippet(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    
    // Find first sentence or meaningful break
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences[0].length <= maxLength) {
      return sentences[0].trim();
    }
    
    return text.slice(0, maxLength) + '...';
  }

  /**
   * Analyze sentiment of text
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'mixed' {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['happy', 'joy', 'peace', 'love', 'grateful', 'blessed', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'fear', 'anxious', 'stuck', 'frustrated', 'lost'];
    
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    return 'neutral';
  }

  /**
   * Calculate elemental balance across all points
   */
  private calculateElementalBalance(points: SpiralPoint[]): ElementalBalance[] {
    const elementStats: Map<Element, ElementalBalance> = new Map();
    
    // Initialize all elements
    (['fire', 'water', 'earth', 'air', 'aether'] as Element[]).forEach(element => {
      elementStats.set(element, {
        element,
        activity: 0,
        sessions: 0,
        trend: 'stable',
        lastSeen: ''
      });
    });

    // Calculate activity for each element
    points.forEach(point => {
      const stats = elementStats.get(point.element)!;
      stats.activity += point.intensity;
      stats.sessions += 1;
      stats.lastSeen = point.timestamp;
    });

    // Normalize activity scores and calculate trends
    const balances = Array.from(elementStats.values());
    const maxActivity = Math.max(...balances.map(b => b.activity));
    
    balances.forEach(balance => {
      balance.activity = maxActivity > 0 ? balance.activity / maxActivity : 0;
      
      // Calculate trend based on recent vs older sessions
      const recentPoints = points.filter(p => 
        p.element === balance.element && 
        new Date(p.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const olderPoints = points.filter(p => 
        p.element === balance.element && 
        new Date(p.timestamp) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      if (recentPoints.length > olderPoints.length) balance.trend = 'increasing';
      else if (recentPoints.length < olderPoints.length) balance.trend = 'decreasing';
    });

    return balances;
  }

  /**
   * Detect recurring narrative threads and symbols (now uses UnifiedSymbolProcessor)
   */
  private async detectNarrativeThreads(
    points: SpiralPoint[],
    journals: any[]
  ): Promise<NarrativeThread[]> {
    // Collect content from journals for symbol analysis
    const contents = journals.map(j => j.content || '').filter(Boolean);
    
    if (contents.length === 0) {
      return [];
    }

    try {
      const symbolAnalysis = await UnifiedSymbolProcessor.analyzeUserSymbols(
        points[0]?.sessionId || 'unknown',
        contents
      );

      // Convert to NarrativeThread format
      return symbolAnalysis.recurringSymbols.slice(0, 5).map(symbol => ({
        id: `thread-${symbol.label}`,
        symbol: symbol.label,
        occurrences: symbol.frequency,
        firstSeen: symbol.firstSeen,
        lastSeen: symbol.lastSeen,
        contexts: [symbol.context],
        associatedElements: symbol.element ? [symbol.element as Element] : [],
        archetypalMapping: symbol.archetype || this.mapToArchetype(symbol.label)
      }));

    } catch (error) {
      logger.error('[SPIRAL_MAPPER] Failed to detect narrative threads:', error);
      return [];
    }
  }

  /**
   * Map symbol to Jungian archetype
   */
  private mapToArchetype(symbol: string): string {
    const archetypeMap: Record<string, string> = {
      'butterfly': 'Transformation',
      'phoenix': 'Rebirth',
      'shadow': 'Shadow Self',
      'moon': 'Feminine/Intuition',
      'sun': 'Masculine/Consciousness',
      'tree': 'Growth/Life',
      'ocean': 'Unconscious',
      'mountain': 'Challenge/Achievement',
      'path': 'Journey/Individuation',
      'bridge': 'Transition'
    };

    return archetypeMap[symbol] || 'Personal Symbol';
  }

  /**
   * Generate practice recommendations
   */
  private generateRecommendations(
    balance: ElementalBalance[],
    threads: NarrativeThread[],
    points: SpiralPoint[]
  ): {
    nextPractice: string;
    elementToBalance: Element;
    narrativeToExplore: string;
  } {
    // Find underactive element
    const underactiveElement = balance
      .sort((a, b) => a.activity - b.activity)[0].element;

    // Find overactive element
    const overactiveElement = balance
      .sort((a, b) => b.activity - a.activity)[0].element;

    // Most prominent narrative thread
    const dominantThread = threads[0]?.symbol || 'personal journey';

    // Generate practice based on elemental imbalance
    const practice = this.generatePracticeForBalance(overactiveElement, underactiveElement);

    return {
      nextPractice: practice,
      elementToBalance: underactiveElement,
      narrativeToExplore: `Explore your relationship with ${dominantThread}`
    };
  }

  /**
   * Suggest practice based on element
   */
  private suggestPractice(element: Element, context: string): {
    ritual: string;
    therapeutic: string;
  } {
    const practices: Record<Element, { ritual: string; therapeutic: string }> = {
      fire: {
        ritual: 'Candle meditation on transformation',
        therapeutic: 'Anger release through movement'
      },
      water: {
        ritual: 'Water blessing for emotional flow',
        therapeutic: 'Emotional regulation breathing'
      },
      earth: {
        ritual: 'Grounding with stones or barefoot walking',
        therapeutic: 'Body scan meditation'
      },
      air: {
        ritual: 'Breath prayer or incense ceremony',
        therapeutic: 'CBT thought reframing'
      },
      aether: {
        ritual: 'Sacred silence or star gazing',
        therapeutic: 'Transpersonal meditation'
      }
    };

    return practices[element];
  }

  /**
   * Generate practice to balance elements
   */
  private generatePracticeForBalance(overactive: Element, underactive: Element): string {
    const balancingPractices: Record<string, string> = {
      'fire-water': 'Cool the fire with water ritual: gentle flow movement or bath meditation',
      'fire-earth': 'Ground the fire: gardening, clay work, or tree meditation',
      'water-air': 'Lift emotions with breath: pranayama or singing practice',
      'water-earth': 'Stabilize emotions: create art with natural materials',
      'earth-air': 'Lighten density: dancing, journaling thoughts',
      'air-water': 'Soften thoughts with feeling: heart coherence breathing',
      'air-earth': 'Ground the mind: walking meditation or physical exercise'
    };

    const key = `${overactive}-${underactive}`;
    return balancingPractices[key] || 
      `Balance ${overactive} with ${underactive} through mindful integration`;
  }

  /**
   * Detect current phase from recent points
   */
  private detectCurrentPhase(points: SpiralPoint[]): SpiralogicPhase {
    if (points.length === 0) return 'sacred_frame';
    
    // Get last 3 points
    const recentPoints = points.slice(-3);
    const phaseCounts: Partial<Record<SpiralogicPhase, number>> = {};
    
    recentPoints.forEach(point => {
      phaseCounts[point.phase] = (phaseCounts[point.phase] || 0) + 1;
    });
    
    // Return most common recent phase
    return Object.entries(phaseCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as SpiralogicPhase;
  }

  /**
   * Find dominant element from balance
   */
  private findDominantElement(balance: ElementalBalance[]): Element {
    return balance.sort((a, b) => b.activity - a.activity)[0].element;
  }

  /**
   * Get default elemental balance for fallback scenarios
   */
  private getDefaultElementalBalance(): ElementalBalance[] {
    return [
      {
        element: 'spirit',
        activity: 0.6,
        sessions: 1,
        trend: 'stable',
        lastSeen: new Date().toISOString()
      },
      {
        element: 'earth',
        activity: 0.4,
        sessions: 0,
        trend: 'stable',
        lastSeen: new Date().toISOString()
      }
    ];
  }

  // Database fetch methods removed - now using UnifiedDataAccessService

  /**
   * Export spiral journey data for visualization
   */
  exportForVisualization(journey: SpiralJourney): {
    nodes: any[];
    links: any[];
    metadata: any;
  } {
    const nodes = journey.spiralPoints.map(point => ({
      id: point.id,
      label: point.content.slice(0, 30),
      x: point.coordinates?.radius! * Math.cos(point.coordinates?.angle! * Math.PI / 180),
      y: point.coordinates?.radius! * Math.sin(point.coordinates?.angle! * Math.PI / 180),
      color: this.getElementColor(point.element),
      size: point.intensity * 10 + 5,
      phase: point.phase,
      element: point.element,
      timestamp: point.timestamp
    }));

    const links = nodes.slice(0, -1).map((node, i) => ({
      source: node.id,
      target: nodes[i + 1].id,
      weight: 1
    }));

    const metadata = {
      elementalBalance: journey.elementalBalance,
      narrativeThreads: journey.narrativeThreads,
      currentPhase: journey.currentPhase,
      dominantElement: journey.dominantElement,
      recommendations: journey.recommendations
    };

    return { nodes, links, metadata };
  }

  private getElementColor(element: Element): string {
    const colors: Record<Element, string> = {
      fire: '#FF6B6B',
      water: '#4ECDC4',
      earth: '#95E77E',
      air: '#FFE66D',
      aether: '#B57EDC'
    };
    return colors[element];
  }
}