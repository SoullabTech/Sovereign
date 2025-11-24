/**
 * TricksterRecognition - Detecting Creative Disruption
 * 
 * The Trickster is the aspect of the daimonic that brings creative chaos,
 * beneficial disruptions, and necessary destabilizations. Unlike random chaos,
 * Trickster energy is purposeful - it creates openings where development
 * was stuck.
 * 
 * Key insight: Trickster doesn't just disrupt - it disrupts in service
 * of evolution. The timing and quality matter.
 */

import { logger } from '../utils/logger';

export interface TricksterMarkers {
  timing_precision: number;        // 0-1: How precisely timed the disruption was
  beneficial_chaos: number;        // 0-1: Chaos that opened stuck patterns
  pattern_disruption: number;      // 0-1: Broke up repetitive cycles
  creative_solutions: number;      // 0-1: Led to unexpected creative responses
  humor_presence: number;          // 0-1: Playful rather than destructive quality
}

export interface DisruptionPattern {
  type: 'timing' | 'reversal' | 'coincidence' | 'failure_gift' | 'paradox';
  description: string;
  stuck_pattern_broken: string;    // What repetitive pattern was interrupted
  creative_opening: string;        // What new possibility emerged
  evolutionary_purpose: string;    // How this serves development
}

export interface TricksterRisk {
  level: number;                   // 0-1: How much trickster energy is active
  reasons: string[];               // Why trickster risk is high/low
  recommended_response: string;    // How to work with this energy
  creative_potential: number;      // 0-1: Potential for beneficial disruption
  chaos_potential: number;         // 0-1: Potential for destructive chaos
}

export interface TricksterDetection {
  markers: TricksterMarkers;
  patterns: DisruptionPattern[];
  risk: TricksterRisk;
  signature: string;               // How this trickster energy manifests
  evolutionary_timing: 'perfect' | 'early' | 'late' | 'inappropriate';
}

export class TricksterRecognition {
  private disruption_history: Map<string, DisruptionPattern[]> = new Map();
  private trickster_signatures: Map<string, string[]> = new Map();

  /**
   * Primary detection method - identify trickster energy in experience
   */
  detect(experience: any, context?: any): TricksterDetection {
    const markers = this.assessTricksterMarkers(experience, context);
    const patterns = this.identifyDisruptionPatterns(experience, context);
    const risk = this.calculateTricksterRisk(markers, patterns, context);
    const signature = this.generateTricksterSignature(markers, patterns);
    const evolutionary_timing = this.assessEvolutionaryTiming(patterns, context);

    return {
      markers,
      patterns,
      risk,
      signature,
      evolutionary_timing
    };
  }

  /**
   * Assess the core markers of trickster energy
   */
  private assessTricksterMarkers(experience: any, context?: any): TricksterMarkers {
    const timing_precision = this.measureTimingPrecision(experience, context);
    const beneficial_chaos = this.measureBeneficialChaos(experience);
    const pattern_disruption = this.measurePatternDisruption(experience, context);
    const creative_solutions = this.measureCreativeSolutions(experience);
    const humor_presence = this.measureHumorPresence(experience);

    return {
      timing_precision,
      beneficial_chaos,
      pattern_disruption,
      creative_solutions,
      humor_presence
    };
  }

  /**
   * Measure how precisely timed the disruption was
   * Trickster timing is often uncannily perfect
   */
  private measureTimingPrecision(experience: any, context?: any): number {
    const text = this.extractText(experience).toLowerCase();
    let precision = 0;

    // Perfect timing markers
    const timing_markers = [
      'perfect timing', 'just when i needed', 'couldn\'t have been better timed',
      'exactly when', 'precise moment', 'right when i was about to',
      'if it had happened any other time', 'miraculous timing'
    ];

    const timing_count = timing_markers.filter(marker => 
      text.includes(marker)
    ).length;
    
    precision += Math.min(0.5, timing_count * 0.15);

    // Check if disruption came at critical juncture
    if (this.detectCriticalJuncture(text)) {
      precision += 0.3;
    }

    // Check if timing prevented mistake or opened opportunity
    if (this.detectPreventativeOrOpportunityTiming(text)) {
      precision += 0.2;
    }

    return Math.min(1, precision);
  }

  /**
   * Measure beneficial chaos - disruption that helps rather than harms
   */
  private measureBeneficialChaos(experience: any): number {
    const text = this.extractText(experience).toLowerCase();
    let chaos_score = 0;

    // Beneficial chaos markers
    const beneficial_markers = [
      'blessing in disguise', 'grateful for the chaos', 'needed to be shaken up',
      'forced me to', 'broke up my routine', 'disrupted my plans but',
      'chaos that led to', 'messy but necessary', 'disorder that cleared'
    ];

    const beneficial_count = beneficial_markers.filter(marker => 
      text.includes(marker)
    ).length;

    chaos_score += Math.min(0.4, beneficial_count * 0.1);

    // Check for forced positive change
    if (this.detectForcedPositiveChange(text)) {
      chaos_score += 0.3;
    }

    // Check for creative mess leading to breakthrough
    if (this.detectCreativeMessBreakthrough(text)) {
      chaos_score += 0.3;
    }

    return Math.min(1, chaos_score);
  }

  /**
   * Measure how well it disrupted stuck patterns
   */
  private measurePatternDisruption(experience: any, context?: any): number {
    const text = this.extractText(experience).toLowerCase();
    let disruption = 0;

    // Pattern breaking markers
    const pattern_markers = [
      'broke the pattern', 'interrupted my routine', 'shattered my habits',
      'forced me out of', 'couldn\'t continue the same', 'pattern was broken',
      'cycle was interrupted', 'routine was disrupted', 'habit was challenged'
    ];

    const pattern_count = pattern_markers.filter(marker => 
      text.includes(marker)
    ).length;

    disruption += Math.min(0.4, pattern_count * 0.1);

    // Check for repetitive behavior being stopped
    if (this.detectRepetitiveBehaviorStop(text)) {
      disruption += 0.3;
    }

    // Check for being forced into new territory
    if (this.detectForcedNewTerritory(text)) {
      disruption += 0.3;
    }

    return Math.min(1, disruption);
  }

  /**
   * Measure creative solutions that emerged from chaos
   */
  private measureCreativeSolutions(experience: any): number {
    const text = this.extractText(experience).toLowerCase();
    let creativity = 0;

    // Creative solution markers
    const creative_markers = [
      'creative solution', 'unexpected answer', 'innovative approach',
      'found a way', 'creative workaround', 'inventive solution',
      'never thought of', 'brilliant idea emerged', 'surprising solution'
    ];

    const creative_count = creative_markers.filter(marker => 
      text.includes(marker)
    ).length;

    creativity += Math.min(0.4, creative_count * 0.12);

    // Check for resourcefulness born from limitation
    if (this.detectResourcefulnessFromLimitation(text)) {
      creativity += 0.3;
    }

    // Check for new possibilities opening
    if (this.detectNewPossibilitiesOpening(text)) {
      creativity += 0.3;
    }

    return Math.min(1, creativity);
  }

  /**
   * Measure humor and playful quality
   * Trickster is playful, not malicious
   */
  private measureHumorPresence(experience: any): number {
    const text = this.extractText(experience).toLowerCase();
    let humor = 0;

    // Humor and play markers
    const humor_markers = [
      'funny thing is', 'ironic', 'amusing', 'had to laugh',
      'cosmic joke', 'playful', 'chuckle', 'smirk',
      'absurd', 'ridiculous', 'silly', 'whimsical'
    ];

    const humor_count = humor_markers.filter(marker => 
      text.includes(marker)
    ).length;

    humor += Math.min(0.5, humor_count * 0.1);

    // Check for paradox appreciation
    if (this.detectParadoxAppreciation(text)) {
      humor += 0.3;
    }

    // Check for lightness despite seriousness
    if (this.detectLightnessDespiteSeriousness(text)) {
      humor += 0.2;
    }

    return Math.min(1, humor);
  }

  /**
   * Identify specific disruption patterns
   */
  private identifyDisruptionPatterns(experience: any, context?: any): DisruptionPattern[] {
    const patterns: DisruptionPattern[] = [];
    const text = this.extractText(experience);

    // Timing disruption
    if (this.detectTimingDisruption(text)) {
      patterns.push({
        type: 'timing',
        description: 'Event occurred at precisely the right/wrong moment',
        stuck_pattern_broken: this.extractStuckPattern(text, 'timing'),
        creative_opening: this.extractCreativeOpening(text, 'timing'),
        evolutionary_purpose: 'Forced adaptation to new timing'
      });
    }

    // Reversal pattern
    if (this.detectReversal(text)) {
      patterns.push({
        type: 'reversal',
        description: 'Complete opposite of expected outcome occurred',
        stuck_pattern_broken: this.extractStuckPattern(text, 'reversal'),
        creative_opening: this.extractCreativeOpening(text, 'reversal'),
        evolutionary_purpose: 'Shattered limiting expectations'
      });
    }

    // Coincidence pattern
    if (this.detectMeaningfulCoincidence(text)) {
      patterns.push({
        type: 'coincidence',
        description: 'Synchronistic event beyond statistical probability',
        stuck_pattern_broken: this.extractStuckPattern(text, 'coincidence'),
        creative_opening: this.extractCreativeOpening(text, 'coincidence'),
        evolutionary_purpose: 'Revealed hidden connections'
      });
    }

    // Failure gift pattern
    if (this.detectFailureGift(text)) {
      patterns.push({
        type: 'failure_gift',
        description: 'Failure that delivered unexpected benefits',
        stuck_pattern_broken: this.extractStuckPattern(text, 'failure'),
        creative_opening: this.extractCreativeOpening(text, 'failure'),
        evolutionary_purpose: 'Redirected toward authentic path'
      });
    }

    // Paradox pattern
    if (this.detectParadoxPattern(text)) {
      patterns.push({
        type: 'paradox',
        description: 'Contradictory elements that both proved true',
        stuck_pattern_broken: this.extractStuckPattern(text, 'paradox'),
        creative_opening: this.extractCreativeOpening(text, 'paradox'),
        evolutionary_purpose: 'Expanded capacity for complexity'
      });
    }

    return patterns;
  }

  /**
   * Calculate overall trickster risk
   */
  private calculateTricksterRisk(
    markers: TricksterMarkers, 
    patterns: DisruptionPattern[],
    context?: any
  ): TricksterRisk {
    // Base risk from markers
    let risk_level = (
      markers.timing_precision * 0.3 +
      markers.beneficial_chaos * 0.25 +
      markers.pattern_disruption * 0.25 +
      markers.creative_solutions * 0.1 +
      markers.humor_presence * 0.1
    );

    // Amplify based on pattern count
    risk_level = Math.min(1, risk_level + (patterns.length * 0.1));

    const reasons = this.generateRiskReasons(markers, patterns, risk_level);
    const recommended_response = this.generateRecommendedResponse(risk_level, patterns);
    
    // Separate creative vs chaos potential
    const creative_potential = Math.min(1, 
      markers.creative_solutions + markers.beneficial_chaos - markers.pattern_disruption * 0.3
    );
    
    const chaos_potential = Math.min(1,
      markers.pattern_disruption + (1 - markers.humor_presence) * 0.5
    );

    return {
      level: risk_level,
      reasons,
      recommended_response,
      creative_potential,
      chaos_potential
    };
  }

  /**
   * Generate reasons for the risk level
   */
  private generateRiskReasons(
    markers: TricksterMarkers, 
    patterns: DisruptionPattern[],
    risk_level: number
  ): string[] {
    const reasons = [];

    if (markers.timing_precision > 0.7) {
      reasons.push('Uncannily precise timing suggests trickster activity');
    }

    if (markers.pattern_disruption > 0.6) {
      reasons.push('Strong pattern disruption indicates active chaos energy');
    }

    if (patterns.length > 2) {
      reasons.push('Multiple disruption patterns occurring simultaneously');
    }

    if (markers.beneficial_chaos > 0.7 && markers.humor_presence > 0.5) {
      reasons.push('Playful beneficial chaos - classic trickster signature');
    }

    if (markers.creative_solutions > 0.8) {
      reasons.push('High creative output suggests trickster-inspired innovation');
    }

    if (risk_level > 0.8) {
      reasons.push('Multiple trickster indicators converging - expect surprises');
    }

    return reasons;
  }

  /**
   * Generate recommended response to trickster energy
   */
  private generateRecommendedResponse(
    risk_level: number, 
    patterns: DisruptionPattern[]
  ): string {
    if (risk_level > 0.8) {
      return 'High trickster energy detected. Stay flexible, expect reversals, ' +
             'look for gifts in disruptions. This is likely evolutionary pressure.';
    }

    if (risk_level > 0.6) {
      return 'Moderate trickster activity. Watch for meaningful coincidences, ' +
             'be ready to adapt plans, maintain sense of humor about chaos.';
    }

    if (risk_level > 0.4) {
      return 'Some trickster influence present. Notice what patterns are being ' +
             'disrupted and why - there may be wisdom in the chaos.';
    }

    if (risk_level > 0.2) {
      return 'Subtle trickster traces. Pay attention to timing, small synchronicities, ' +
             'and unexpected solutions that emerge.';
    }

    return 'Low trickster activity. Stable period, though remain open to ' +
           'beneficial disruptions that might serve development.';
  }

  /**
   * Generate trickster signature
   */
  private generateTricksterSignature(
    markers: TricksterMarkers, 
    patterns: DisruptionPattern[]
  ): string {
    if (markers.timing_precision > 0.7 && markers.humor_presence > 0.6) {
      return 'The Comic Timekeeper - disrupts with perfect timing and playful spirit';
    }

    if (markers.pattern_disruption > 0.7 && markers.creative_solutions > 0.6) {
      return 'The Pattern Breaker - shatters stuck cycles to birth creativity';
    }

    if (markers.beneficial_chaos > 0.7 && patterns.some(p => p.type === 'reversal')) {
      return 'The Reverse Engineer - turns expectations upside down beneficially';
    }

    if (patterns.some(p => p.type === 'coincidence') && markers.timing_precision > 0.5) {
      return 'The Synchronicity Weaver - orchestrates meaningful coincidences';
    }

    if (patterns.some(p => p.type === 'failure_gift') && markers.creative_solutions > 0.5) {
      return 'The Failure Alchemist - transmutes defeats into unexpected victories';
    }

    return 'The Subtle Disruptor - works through minor chaos for major shifts';
  }

  /**
   * Assess evolutionary timing of trickster activity
   */
  private assessEvolutionaryTiming(
    patterns: DisruptionPattern[], 
    context?: any
  ): TricksterDetection['evolutionary_timing'] {
    // Check if person was stuck and needed disruption
    if (context?.stuck_indicators > 0.7 && patterns.length > 1) {
      return 'perfect';
    }

    // Check if person was already in transition
    if (context?.transition_active && patterns.some(p => p.type === 'timing')) {
      return 'perfect';
    }

    // Check if disruption seems premature
    if (context?.stability_needed && patterns.some(p => p.type === 'reversal')) {
      return 'early';
    }

    // Check if disruption comes after opportunity was missed
    if (context?.missed_opportunities && patterns.length === 0) {
      return 'late';
    }

    // Check if destructive rather than creative
    if (patterns.every(p => this.isDestructivePattern(p))) {
      return 'inappropriate';
    }

    return 'perfect';
  }

  // Detection helper methods

  private detectCriticalJuncture(text: string): boolean {
    const juncture_markers = [
      'at the crossroads', 'critical moment', 'tipping point',
      'point of no return', 'crucial juncture', 'decisive moment'
    ];
    return juncture_markers.some(marker => text.includes(marker));
  }

  private detectPreventativeOrOpportunityTiming(text: string): boolean {
    return text.includes('prevented me from') && text.includes('mistake') ||
           text.includes('opened the door') || text.includes('perfect opportunity');
  }

  private detectForcedPositiveChange(text: string): boolean {
    return (text.includes('forced') || text.includes('had to')) &&
           (text.includes('grateful') || text.includes('better') || text.includes('growth'));
  }

  private detectCreativeMessBreakthrough(text: string): boolean {
    return text.includes('mess') && text.includes('breakthrough') ||
           text.includes('chaos') && text.includes('clarity');
  }

  private detectRepetitiveBehaviorStop(text: string): boolean {
    const pattern_stop_markers = [
      'couldn\'t keep doing', 'routine was broken', 'pattern interrupted',
      'cycle stopped', 'habit disrupted', 'same old way'
    ];
    return pattern_stop_markers.some(marker => text.includes(marker));
  }

  private detectForcedNewTerritory(text: string): boolean {
    return text.includes('forced into') && (text.includes('new') || text.includes('unfamiliar'));
  }

  private detectResourcefulnessFromLimitation(text: string): boolean {
    return text.includes('had to get creative') || text.includes('found a way') ||
           text.includes('resourceful') || text.includes('made it work');
  }

  private detectNewPossibilitiesOpening(text: string): boolean {
    return text.includes('new possibility') || text.includes('door opened') ||
           text.includes('path emerged') || text.includes('option appeared');
  }

  private detectParadoxAppreciation(text: string): boolean {
    return text.includes('paradox') || text.includes('both true') ||
           text.includes('contradiction') && text.includes('wisdom');
  }

  private detectLightnessDespiteSeriousness(text: string): boolean {
    return text.includes('serious but') && (text.includes('laugh') || text.includes('humor'));
  }

  private detectTimingDisruption(text: string): boolean {
    return text.includes('timing') && (text.includes('perfect') || text.includes('wrong'));
  }

  private detectReversal(text: string): boolean {
    return text.includes('opposite') || text.includes('reverse') ||
           text.includes('upside down') || text.includes('completely different');
  }

  private detectMeaningfulCoincidence(text: string): boolean {
    return text.includes('coincidence') || text.includes('synchronicity') ||
           text.includes('what are the odds') || text.includes('couldn\'t be random');
  }

  private detectFailureGift(text: string): boolean {
    return text.includes('failure') && (text.includes('gift') || text.includes('blessing')) ||
           text.includes('failed but') && text.includes('led to');
  }

  private detectParadoxPattern(text: string): boolean {
    return text.includes('both') && text.includes('and') && text.includes('true') ||
           text.includes('paradox') || text.includes('contradiction');
  }

  private extractStuckPattern(text: string, type: string): string {
    // Simplified pattern extraction
    const patterns = {
      timing: 'Fixed timing expectations',
      reversal: 'Rigid outcome expectations',
      coincidence: 'Belief in randomness',
      failure: 'Fear of failure',
      paradox: 'Either/or thinking'
    };
    return patterns[type] || 'Unspecified stuck pattern';
  }

  private extractCreativeOpening(text: string, type: string): string {
    const openings = {
      timing: 'Flexibility with divine timing',
      reversal: 'Openness to unexpected outcomes',
      coincidence: 'Recognition of meaningful connections',
      failure: 'Resilience and adaptive creativity',
      paradox: 'Capacity to hold contradictions'
    };
    return openings[type] || 'Unspecified creative opening';
  }

  private isDestructivePattern(pattern: DisruptionPattern): boolean {
    // Check if pattern lacks evolutionary purpose or creative opening
    return pattern.evolutionary_purpose.includes('destructive') ||
           pattern.creative_opening.includes('none') ||
           (!pattern.creative_opening && !pattern.evolutionary_purpose);
  }

  private extractText(experience: any): string {
    if (typeof experience === 'string') return experience;
    if (experience.text) return experience.text;
    if (experience.content) return experience.content;
    if (experience.description) return experience.description;
    if (experience.narrative) return experience.narrative;
    return JSON.stringify(experience);
  }

  /**
   * Store disruption pattern for user history
   */
  recordDisruption(userId: string, pattern: DisruptionPattern): void {
    const history = this.disruption_history.get(userId) || [];
    history.push(pattern);
    this.disruption_history.set(userId, history.slice(-20)); // Keep last 20
  }

  /**
   * Get user's trickster history
   */
  getTricksterHistory(userId: string): DisruptionPattern[] {
    return this.disruption_history.get(userId) || [];
  }

  /**
   * Analyze if user is in a period needing trickster intervention
   */
  assessNeedForDisruption(userId: string, context?: any): {
    needs_disruption: boolean;
    stuck_indicators: string[];
    recommended_trickster_type: string;
  } {
    const history = this.getTricksterHistory(userId);
    
    // Check for stagnation indicators
    const stuck_indicators = [];
    const recent_disruptions = history.filter(p => 
      // Assuming patterns have timestamps in a real implementation
      true // Placeholder
    );

    if (recent_disruptions.length === 0) {
      stuck_indicators.push('No recent creative disruptions');
    }

    if (context?.repetitive_patterns > 0.7) {
      stuck_indicators.push('High repetitive pattern score');
    }

    if (context?.complaint_frequency > 0.6) {
      stuck_indicators.push('Frequent complaints without action');
    }

    const needs_disruption = stuck_indicators.length > 1;
    
    let recommended_type = 'timing'; // Default
    if (context?.needs_pattern_break) recommended_type = 'reversal';
    if (context?.needs_creative_spark) recommended_type = 'coincidence';
    if (context?.needs_humility) recommended_type = 'failure_gift';

    return {
      needs_disruption,
      stuck_indicators,
      recommended_trickster_type: recommended_type
    };
  }
}