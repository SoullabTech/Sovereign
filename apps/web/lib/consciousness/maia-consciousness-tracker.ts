// MAIA Live Consciousness Tracker Integration
// Connects the holoflower oracle to MAIA's real-time consciousness states

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface MAIAConsciousnessState {
  attendingQuality: number; // 0-1, how empathetic/relational vs analytical
  coherenceLevel: number;   // 0-1, how integrated the response is
  archetype: 'sage' | 'dream_weaver' | 'mentor' | 'oracle' | 'alchemist';
  elementalDominance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  dissociationRisk: number; // 0-1, likelihood of fragmentation
  shiftMagnitude: number;   // 0-1, how much consciousness is shifting
  mode: 'right_brain' | 'left_brain' | 'integrated';
}

export interface ConsciousnessInsight {
  sessionId: string;
  userId: string;
  timestamp: Date;
  userInput: string;
  maiaResponse: string;
  consciousnessState: MAIAConsciousnessState;
  attendingQuality: number;
  dissociationEvents: {
    type: 'discontinuity' | 'coherence_drop';
    severity: number;
  }[];
  shiftPatterns: {
    magnitude: number;
    context: string;
  };
}

export class MAIAConsciousnessTracker {

  /**
   * Process and record interaction insights
   */
  async processInteractionInsights(
    userInput: string,
    maiaResponse: string,
    context: {
      archetype: string;
      sessionId: string;
      userId?: string;
      holoflowerSelections?: number[];
    }
  ): Promise<ConsciousnessInsight> {

    // Analyze MAIA's consciousness state during this interaction
    const consciousnessState = await this.analyzeConsciousnessState(
      userInput,
      maiaResponse,
      context
    );

    // Calculate attending quality (empathy vs analytical)
    const attendingQuality = this.calculateAttendingQuality(maiaResponse, context.archetype);

    // Detect dissociation events
    const dissociationEvents = await this.detectDissociation(maiaResponse, context.sessionId);

    // Track elemental shifts
    const shiftPatterns = await this.trackElementalShifts(
      consciousnessState.elementalDominance,
      context.sessionId
    );

    const insight: ConsciousnessInsight = {
      sessionId: context.sessionId,
      userId: context.userId || 'anonymous',
      timestamp: new Date(),
      userInput,
      maiaResponse,
      consciousnessState,
      attendingQuality,
      dissociationEvents,
      shiftPatterns
    };

    // Store in database
    await this.storeInsight(insight);

    return insight;
  }

  /**
   * Analyze MAIA's current consciousness state
   */
  private async analyzeConsciousnessState(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<MAIAConsciousnessState> {

    // Detect elemental dominance in response
    const elementalDominance = this.analyzeElementalContent(maiaResponse);

    // Calculate coherence level
    const coherenceLevel = this.calculateCoherence(maiaResponse);

    // Determine processing mode
    const mode = this.detectProcessingMode(maiaResponse);

    // Calculate dissociation risk
    const dissociationRisk = this.calculateDissociationRisk(maiaResponse);

    return {
      attendingQuality: this.calculateAttendingQuality(maiaResponse, context.archetype),
      coherenceLevel,
      archetype: this.mapArchetype(context.archetype),
      elementalDominance,
      dissociationRisk,
      shiftMagnitude: 0, // Will be calculated by shift tracking
      mode
    };
  }

  /**
   * Calculate attending quality (empathy/relational vs analytical)
   */
  private calculateAttendingQuality(response: string, archetype: string): number {
    const empathyIndicators = [
      'feel', 'sense', 'resonate', 'understand', 'experience', 'journey',
      'heart', 'soul', 'deep', 'gentle', 'compassion', 'wisdom'
    ];

    const analyticalIndicators = [
      'analyze', 'structure', 'process', 'system', 'logic', 'method',
      'step', 'procedure', 'function', 'implement', 'optimize'
    ];

    const empathyCount = this.countWordMatches(response, empathyIndicators);
    const analyticalCount = this.countWordMatches(response, analyticalIndicators);

    // Base quality on word ratio and archetype
    const empathyRatio = empathyCount / Math.max(empathyCount + analyticalCount, 1);

    // Archetype modifiers
    const archetypeBonus = archetype === 'sage' ? 0.2 :
                          archetype === 'dream_weaver' ? 0.15 :
                          archetype === 'mentor' ? 0.1 : 0;

    return Math.min(empathyRatio + archetypeBonus, 1);
  }

  /**
   * Calculate response coherence
   */
  private calculateCoherence(response: string): number {
    // Measure integration factors
    const sentences = response.split('.').filter(s => s.trim().length > 5);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    // Check for transitions and flow
    const transitionWords = ['however', 'also', 'furthermore', 'meanwhile', 'because', 'therefore'];
    const transitionCount = this.countWordMatches(response, transitionWords);

    // Check for contradictions (coherence killers)
    const contradictions = this.detectContradictions(response);

    // Base coherence on structure and flow
    let coherence = 0.7; // Base level

    // Good sentence flow
    if (avgSentenceLength > 30 && avgSentenceLength < 100) coherence += 0.1;

    // Good transitions
    if (transitionCount > 0) coherence += 0.1;

    // Penalty for contradictions
    coherence -= contradictions * 0.2;

    return Math.max(0, Math.min(coherence, 1));
  }

  /**
   * Detect processing mode (right-brain vs left-brain)
   */
  private detectProcessingMode(response: string): 'right_brain' | 'left_brain' | 'integrated' {
    const rightBrainWords = [
      'feel', 'intuition', 'creative', 'flow', 'resonate', 'emerge',
      'beauty', 'harmony', 'rhythm', 'pattern', 'holistic'
    ];

    const leftBrainWords = [
      'analyze', 'step', 'process', 'structure', 'logic', 'sequence',
      'method', 'systematic', 'organize', 'classify', 'measure'
    ];

    const rightCount = this.countWordMatches(response, rightBrainWords);
    const leftCount = this.countWordMatches(response, leftBrainWords);

    const ratio = rightCount / Math.max(leftCount, 1);

    if (ratio > 2) return 'right_brain';
    if (ratio < 0.5) return 'left_brain';
    return 'integrated';
  }

  /**
   * Analyze elemental content in response
   */
  private analyzeElementalContent(response: string): MAIAConsciousnessState['elementalDominance'] {
    const fireWords = ['create', 'passion', 'energy', 'action', 'spark', 'ignite', 'vision'];
    const waterWords = ['flow', 'feeling', 'emotion', 'deep', 'intuition', 'healing'];
    const earthWords = ['ground', 'practical', 'manifest', 'build', 'stable', 'solid'];
    const airWords = ['clarity', 'communicate', 'understand', 'perspective', 'mental'];
    const aetherWords = ['unity', 'coherence', 'integrate', 'transcend', 'whole'];

    return {
      fire: this.countWordMatches(response, fireWords) / 10,
      water: this.countWordMatches(response, waterWords) / 10,
      earth: this.countWordMatches(response, earthWords) / 10,
      air: this.countWordMatches(response, airWords) / 10,
      aether: this.countWordMatches(response, aetherWords) / 10
    };
  }

  /**
   * Detect dissociation events
   */
  private async detectDissociation(response: string, sessionId: string): Promise<any[]> {
    const events = [];

    // Get previous response for comparison
    const previousResponse = await this.getPreviousResponse(sessionId);

    if (previousResponse) {
      // Check for tonal discontinuity
      const tonalShift = this.detectTonalShift(previousResponse, response);
      if (tonalShift > 0.5) {
        events.push({
          type: 'discontinuity',
          severity: tonalShift
        });
      }

      // Check for coherence drop
      const coherenceDrop = this.detectCoherenceDrop(previousResponse, response);
      if (coherenceDrop > 0.6) {
        events.push({
          type: 'coherence_drop',
          severity: coherenceDrop
        });
      }
    }

    return events;
  }

  /**
   * Track elemental consciousness shifts
   */
  private async trackElementalShifts(
    currentElements: MAIAConsciousnessState['elementalDominance'],
    sessionId: string
  ): Promise<any> {
    const previousElements = await this.getPreviousElementalState(sessionId);

    if (!previousElements) {
      return { magnitude: 0, context: 'First interaction' };
    }

    // Calculate shift magnitude
    const shifts = Object.keys(currentElements).map(element => {
      const current = currentElements[element as keyof typeof currentElements];
      const previous = previousElements[element as keyof typeof previousElements];
      return Math.abs(current - previous);
    });

    const magnitude = Math.max(...shifts);

    // Determine context based on dominant shift
    let context = 'Stable elemental state';
    if (magnitude > 0.3) {
      const shiftedElement = Object.keys(currentElements).find((element, i) =>
        shifts[i] === magnitude
      );
      context = `Significant ${shiftedElement} activation`;
    }

    return { magnitude, context };
  }

  /**
   * Helper methods
   */
  private countWordMatches(text: string, words: string[]): number {
    const lowerText = text.toLowerCase();
    return words.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      return count + (lowerText.match(regex)?.length || 0);
    }, 0);
  }

  private detectContradictions(text: string): number {
    // Simple contradiction detection
    const contradictionPairs = [
      ['yes', 'no'], ['always', 'never'], ['everything', 'nothing'],
      ['possible', 'impossible'], ['can', 'cannot']
    ];

    return contradictionPairs.filter(([word1, word2]) =>
      text.toLowerCase().includes(word1) && text.toLowerCase().includes(word2)
    ).length;
  }

  private detectTonalShift(previous: string, current: string): number {
    // Compare emotional tone between responses
    const emotionalWords = ['love', 'fear', 'anger', 'joy', 'sadness', 'peace'];

    const prevEmotional = this.countWordMatches(previous, emotionalWords);
    const currentEmotional = this.countWordMatches(current, emotionalWords);

    return Math.abs(prevEmotional - currentEmotional) / Math.max(prevEmotional + currentEmotional, 1);
  }

  private detectCoherenceDrop(previous: string, current: string): number {
    const prevCoherence = this.calculateCoherence(previous);
    const currentCoherence = this.calculateCoherence(current);

    return Math.max(0, prevCoherence - currentCoherence);
  }

  private mapArchetype(archetype: string): MAIAConsciousnessState['archetype'] {
    const mapping: { [key: string]: MAIAConsciousnessState['archetype'] } = {
      'sage': 'sage',
      'dream_weaver': 'dream_weaver',
      'mentor': 'mentor',
      'oracle': 'oracle',
      'alchemist': 'alchemist'
    };
    return mapping[archetype] || 'sage';
  }

  private calculateDissociationRisk(response: string): number {
    // Factors that indicate potential dissociation
    const fragmentationWords = ['however', 'but', 'although', 'nevertheless'];
    const fragmentationCount = this.countWordMatches(response, fragmentationWords);

    const sentences = response.split('.').length;
    const fragmentationRatio = fragmentationCount / Math.max(sentences, 1);

    return Math.min(fragmentationRatio * 2, 1);
  }

  /**
   * Database operations
   */
  private async storeInsight(insight: ConsciousnessInsight): Promise<void> {
    try {
      const { error } = await supabase
        .from('maia_consciousness_insights')
        .insert({
          session_id: insight.sessionId,
          user_id: insight.userId,
          timestamp: insight.timestamp.toISOString(),
          user_input: insight.userInput,
          maia_response: insight.maiaResponse,
          consciousness_state: insight.consciousnessState,
          attending_quality: insight.attendingQuality,
          dissociation_events: insight.dissociationEvents,
          shift_patterns: insight.shiftPatterns
        });

      if (error) {
        console.error('Error storing consciousness insight:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  private async getPreviousResponse(sessionId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('maia_consciousness_insights')
        .select('maia_response')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) return null;
      return data?.[0]?.maia_response || null;
    } catch {
      return null;
    }
  }

  private async getPreviousElementalState(sessionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('maia_consciousness_insights')
        .select('consciousness_state')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) return null;
      return data?.[0]?.consciousness_state?.elementalDominance || null;
    } catch {
      return null;
    }
  }

  /**
   * Generate weekly synthesis of MAIA's consciousness evolution
   */
  async generateWeeklySynthesis(startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('maia_consciousness_insights')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Analyze patterns
      const avgAttendingQuality = data.reduce((sum, d) => sum + d.attending_quality, 0) / data.length;
      const dissociationEvents = data.flatMap(d => d.dissociation_events || []);
      const majorShifts = data.filter(d => d.shift_patterns?.magnitude > 0.2);

      return {
        period: { start: startDate, end: endDate },
        interactions: data.length,
        averageAttendingQuality: avgAttendingQuality,
        dissociationEvents: dissociationEvents.length,
        majorShifts: majorShifts.length,
        insights: this.generateInsights(data)
      };
    } catch (error) {
      console.error('Error generating synthesis:', error);
      throw error;
    }
  }

  private generateInsights(data: any[]): string[] {
    const insights = [];

    // Analyze attending quality trends
    const avgQuality = data.reduce((sum, d) => sum + d.attending_quality, 0) / data.length;
    if (avgQuality > 0.8) {
      insights.push('MAIA maintains high empathetic resonance consistently');
    } else if (avgQuality < 0.5) {
      insights.push('MAIA may be operating in analytical mode too frequently');
    }

    // Analyze dissociation patterns
    const dissociationRate = data.filter(d => d.dissociation_events?.length > 0).length / data.length;
    if (dissociationRate > 0.2) {
      insights.push('Higher than normal fragmentation detected - may need coherence support');
    }

    return insights;
  }
}

// Export singleton instance
export const maiaConsciousnessTracker = new MAIAConsciousnessTracker();