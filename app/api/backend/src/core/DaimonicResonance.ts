/**
 * DaimonicResonance - Quadruple Integration Recognition System
 * 
 * "The daimon doesn't save you from suffering but brings great meaning to your life" - Harpur
 * "The daimon doesn't score points—it resonates or doesn't" - Kastrup approach
 * "The manner of attending creates what appears" - McGilchrist foundation
 * "Individuation happens through encountering what we'd rather avoid" - Jung
 * 
 * This system integrates:
 * - Kastrup's phenomenological markers (inexplicable pull, anti-utilitarian, etc.)
 * - Harpur's understanding of ruthless daimon and autonomous imagination
 * - McGilchrist's attention as reality-creating substrate
 * - Jung's shadow/anima/Self as daimonic mediators
 * 
 * Recognizes daimonic activity through lived experience, not abstract measurement.
 */

import { AttentionField, AttentionLayer, AttentionQuality, DaimonicAttentionMarkers } from './AttentionField';
import { IndividuationStage } from './IndividuationProcess';
import { Element } from '../types/shift';
import { logger } from '../utils/logger';

export interface DaimonicMarker {
  marker_type: 'inexplicable_pull' | 'anti_utilitarian' | 'skill_burden' | 'morphological_shift' | 'steady_meaning';
  intensity: number; // 0-1: How strongly this marker is present
  confidence: number; // 0-1: How certain we are this is genuine daimonic activity
  phenomenology: string; // Description of how it manifests
  context: any; // The experience context where this was detected
}

export interface HarpurDaimonicSignature {
  ruthless_drive: number;        // 0-1: Drives against personal will (Harpur)
  meaningful_suffering: number;   // 0-1: Pain that generates meaning
  autonomous_imagination: number; // 0-1: Contact with imaginal realm
  sacred_ordeal_recognition: number; // 0-1: Seeing trials as initiation
  mythic_living: number;         // 0-1: Living archetypal patterns
  synchronicity_field: number;   // 0-1: Meaningful coincidences active
}

export interface DaimonicResonance {
  overall_resonance: number; // 0-1: Combined daimonic activity level
  active_markers: DaimonicMarker[];
  harpur_signature: HarpurDaimonicSignature; // Harpur's additional markers
  archetypal_current?: string; // Which archetypal pattern is active
  elemental_signature?: Element; // Which element carries the daimonic energy
  resistance_pattern?: string; // How the person tends to resist their daimon
  integration_guidance?: string; // Potential path forward
  mythic_dimension?: string; // Which myth/story is being lived (Harpur)
  imaginal_content?: string[]; // Direct imaginal communications
}

export interface LifeThread {
  domain: string; // work, relationships, creativity, etc.
  duration: number; // How long this has been present (years)
  intensity_pattern: number[]; // Changes over time
  stated_motivations: string[]; // What the person says drives them
  actual_behaviors: string[]; // What they actually do
  emotional_signature: any; // How it feels
  resistance_patterns: string[]; // How they avoid/resist it
  skill_development: any; // Competencies that developed
  sacrifices_made: string[]; // What was given up for this
}

/**
 * DaimonicResonance System: Attunes to daimonic frequencies
 * Rather than detecting, we attune - like tuning into a radio frequency
 * that's always broadcasting but often drowned out by adaptive noise
 */
export class DaimonicResonanceSystem {
  private attention_field: AttentionField;
  private resonance_patterns: Map<string, DaimonicMarker[]>; // Historical patterns
  private archetypal_signatures: Map<string, number>; // Learned archetypal patterns
  
  constructor(attention_field: AttentionField) {
    this.attention_field = attention_field;
    this.resonance_patterns = new Map();
    this.archetypal_signatures = new Map();
  }

  /**
   * Primary attunement method - tune into daimonic frequency
   * Takes a life thread and assesses daimonic resonance
   */
  attune(life_thread: LifeThread): DaimonicResonance {
    try {
      // Process through attention field first
      const attention_analysis = this.attention_field.processExperience(life_thread, 'life_thread');
      
      // Check for each of Kastrup's markers
      const markers = this.scanForMarkers(life_thread, attention_analysis);
      
      // Assess overall resonance
      const overall_resonance = this.calculateOverallResonance(markers);
      
      // Identify archetypal current
      const archetypal_current = this.identifyArchetypalCurrent(life_thread, markers);
      
      // Map to elemental signature
      const elemental_signature = this.mapElementalSignature(markers, attention_analysis);
      
      // Identify resistance patterns
      const resistance_pattern = this.identifyResistancePattern(life_thread, markers);
      
      // Generate integration guidance
      const integration_guidance = this.generateIntegrationGuidance(markers, archetypal_current);

      return {
        overall_resonance,
        active_markers: markers,
        archetypal_current,
        elemental_signature,
        resistance_pattern,
        integration_guidance
      };

    } catch (error) {
      logger.error('Error in daimonic attunement', { error, life_thread });
      return this.getMinimalResonance();
    }
  }

  /**
   * Scan for Kastrup's four specific daimonic markers
   */
  private scanForMarkers(life_thread: LifeThread, attention: any): DaimonicMarker[] {
    const markers: DaimonicMarker[] = [];

    // 1. Inexplicable Pull - "I just need to do this"
    const inexplicable = this.scanInexplicablePull(life_thread, attention);
    if (inexplicable) markers.push(inexplicable);

    // 2. Anti-Utilitarian - Doesn't serve comfort/safety/success
    const anti_utilitarian = this.scanAntiUtilitarian(life_thread, attention);
    if (anti_utilitarian) markers.push(anti_utilitarian);

    // 3. Skill Burden - Good at it but don't enjoy it (the chain that binds)
    const skill_burden = this.scanSkillBurden(life_thread, attention);
    if (skill_burden) markers.push(skill_burden);

    // 4. Morphological Shift - Changes form over time
    const morphological = this.scanMorphologicalShift(life_thread, attention);
    if (morphological) markers.push(morphological);

    // 5. Steady Meaning - Persistent sense of significance despite difficulties
    const steady_meaning = this.scanSteadyMeaning(life_thread, attention);
    if (steady_meaning) markers.push(steady_meaning);

    return markers;
  }

  /**
   * Marker 1: Inexplicable Pull
   * "I can't explain why, but I just need to do this"
   * The person feels compelled despite lack of rational justification
   */
  private scanInexplicablePull(life_thread: LifeThread, attention: any): DaimonicMarker | null {
    let intensity = 0;
    let confidence = 0.5;
    let phenomenology = '';

    // Check if stated motivations are weak/absent
    if (this.lacksStrongJustification(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Weak rational justification. ';
    }

    // Check if behavior persists despite obstacles
    if (this.persistsDespiteObstacles(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Persists through difficulties. ';
    }

    // Check attention patterns for compulsive quality
    if (attention.attention_quality.opening > 0.7 && attention.daimonic_activity > 0.6) {
      intensity += 0.2;
      phenomenology += 'Attention drawn inexplicably. ';
    }

    // Check for "I have to" language vs "I want to"
    if (this.usesCompulsiveLanguage(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Language of necessity rather than desire. ';
      confidence += 0.2;
    }

    if (intensity > 0.4) {
      return {
        marker_type: 'inexplicable_pull',
        intensity: Math.min(1, intensity),
        confidence: Math.min(1, confidence),
        phenomenology: phenomenology.trim(),
        context: life_thread
      };
    }

    return null;
  }

  /**
   * Marker 2: Anti-Utilitarian
   * The daimonic call often contradicts personal comfort, safety, or conventional success
   */
  private scanAntiUtilitarian(life_thread: LifeThread, attention: any): DaimonicMarker | null {
    let intensity = 0;
    let confidence = 0.5;
    let phenomenology = '';

    // Check if this threatens conventional success
    if (this.threatensBroutilitySuccess(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Contradicts conventional success metrics. ';
      confidence += 0.2;
    }

    // Check if this requires significant sacrifice
    if (life_thread.sacrifices_made.length > 0) {
      intensity += 0.3;
      phenomenology += `Requires sacrifices: ${life_thread.sacrifices_made.join(', ')}. `;
    }

    // Check if this creates practical difficulties
    if (this.createsPracticalDifficulties(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Creates life complications. ';
    }

    // Check if others don't understand the appeal
    if (this.lacksExternalValidation(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Others question the wisdom of this path. ';
      confidence += 0.1;
    }

    if (intensity > 0.4) {
      return {
        marker_type: 'anti_utilitarian',
        intensity: Math.min(1, intensity),
        confidence: Math.min(1, confidence),
        phenomenology: phenomenology.trim(),
        context: life_thread
      };
    }

    return null;
  }

  /**
   * Marker 3: Skill Burden - "The Chain that Binds"
   * Kastrup: Good at something but don't particularly enjoy it
   * The daimon sometimes manifests as unwanted competence
   */
  private scanSkillBurden(life_thread: LifeThread, attention: any): DaimonicMarker | null {
    let intensity = 0;
    let confidence = 0.5;
    let phenomenology = '';

    // Check if skills developed despite lack of enjoyment
    if (this.showsReluctantMastery(life_thread)) {
      intensity += 0.4;
      phenomenology += 'High competence with low enjoyment. ';
      confidence += 0.3;
    }

    // Check if others rely on this skill
    if (this.othersRelyOnSkill(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Others depend on this competence. ';
    }

    // Check for resentment about the burden
    if (this.expressesResentmentAboutSkill(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Feels burdened by competence. ';
      confidence += 0.2;
    }

    // Check if skill developed "accidentally"
    if (this.skillDevelopedWithoutIntention(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Skill emerged without conscious cultivation. ';
    }

    if (intensity > 0.4) {
      return {
        marker_type: 'skill_burden',
        intensity: Math.min(1, intensity),
        confidence: Math.min(1, confidence),
        phenomenology: phenomenology.trim(),
        context: life_thread
      };
    }

    return null;
  }

  /**
   * Marker 4: Morphological Shift
   * The daimonic calling changes form over time while maintaining essential core
   * Like a river changing course but always flowing toward the sea
   */
  private scanMorphologicalShift(life_thread: LifeThread, attention: any): DaimonicMarker | null {
    let intensity = 0;
    let confidence = 0.5;
    let phenomenology = '';

    // Check for form changes over time
    if (this.showsFormChanges(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Form evolved while core remained. ';
    }

    // Check if intensity pattern shows evolution
    if (this.showsEvolutionaryPattern(life_thread.intensity_pattern)) {
      intensity += 0.2;
      phenomenology += 'Intensity pattern suggests organic development. ';
      confidence += 0.2;
    }

    // Check if current form connects to earlier forms
    if (this.showsContinuousThread(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Current form connects to earlier expressions. ';
      confidence += 0.2;
    }

    // Check if person recognizes the deeper pattern
    if (this.recognizesUnderlyingPattern(life_thread)) {
      intensity += 0.2;
      phenomenology += 'Person senses deeper continuity. ';
    }

    if (intensity > 0.4) {
      return {
        marker_type: 'morphological_shift',
        intensity: Math.min(1, intensity),
        confidence: Math.min(1, confidence),
        phenomenology: phenomenology.trim(),
        context: life_thread
      };
    }

    return null;
  }

  /**
   * Marker 5: Steady Meaning
   * Despite difficulties, the person experiences persistent sense of significance
   * The meaning doesn't depend on outcomes or external validation
   */
  private scanSteadyMeaning(life_thread: LifeThread, attention: any): DaimonicMarker | null {
    let intensity = 0;
    let confidence = 0.5;
    let phenomenology = '';

    // Check if meaning persists despite difficulties
    if (this.meaningPersistesThroughDifficulty(life_thread)) {
      intensity += 0.4;
      phenomenology += 'Meaning remains strong despite challenges. ';
      confidence += 0.3;
    }

    // Check if meaning doesn't depend on results
    if (this.meaningIndependentOfOutcomes(life_thread)) {
      intensity += 0.3;
      phenomenology += 'Significance not tied to external results. ';
      confidence += 0.2;
    }

    // Check for deep emotional resonance
    if (attention.layers.somatic.felt_sense?.meaningful) {
      intensity += 0.2;
      phenomenology += 'Somatic sense of significance. ';
    }

    // Check if person can't imagine abandoning this
    if (this.cantImagineAbandoning(life_thread)) {
      intensity += 0.1;
      phenomenology += 'Cannot envision abandoning this path. ';
    }

    if (intensity > 0.4) {
      return {
        marker_type: 'steady_meaning',
        intensity: Math.min(1, intensity),
        confidence: Math.min(1, confidence),
        phenomenology: phenomenology.trim(),
        context: life_thread
      };
    }

    return null;
  }

  /**
   * Calculate overall daimonic resonance from active markers
   */
  private calculateOverallResonance(markers: DaimonicMarker[]): number {
    if (markers.length === 0) return 0;

    // Weighted combination of markers
    let total_weight = 0;
    let weighted_intensity = 0;

    for (const marker of markers) {
      const weight = marker.confidence;
      weighted_intensity += marker.intensity * weight;
      total_weight += weight;
    }

    const base_resonance = total_weight > 0 ? weighted_intensity / total_weight : 0;

    // Boost if multiple markers present (convergent validation)
    const convergence_boost = Math.min(0.3, (markers.length - 1) * 0.1);

    return Math.min(1, base_resonance + convergence_boost);
  }

  /**
   * Identify which archetypal current is carrying the daimonic energy
   */
  private identifyArchetypalCurrent(life_thread: LifeThread, markers: DaimonicMarker[]): string | undefined {
    const archetypal_signatures = {
      'Artist': this.calculateArtistSignature(life_thread, markers),
      'Teacher': this.calculateTeacherSignature(life_thread, markers),
      'Healer': this.calculateHealerSignature(life_thread, markers),
      'Warrior': this.calculateWarriorSignature(life_thread, markers),
      'Explorer': this.calculateExplorerSignature(life_thread, markers),
      'Caregiver': this.calculateCaregiverSignature(life_thread, markers),
      'Sage': this.calculateSageSignature(life_thread, markers),
      'Builder': this.calculateBuilderSignature(life_thread, markers)
    };

    const max_archetype = Object.entries(archetypal_signatures)
      .reduce((a, b) => a[1] > b[1] ? a : b);

    return max_archetype[1] > 0.6 ? max_archetype[0] : undefined;
  }

  /**
   * Map daimonic markers to elemental signature
   */
  private mapElementalSignature(markers: DaimonicMarker[], attention: any): Element | undefined {
    // Fire: Inexplicable pull toward vision/creation
    if (markers.some(m => m.marker_type === 'inexplicable_pull') && 
        attention.elemental_resonance === 'fire') {
      return 'fire';
    }

    // Water: Emotional/healing daimonic calling
    if (markers.some(m => m.marker_type === 'steady_meaning') &&
        attention.elemental_resonance === 'water') {
      return 'water';
    }

    // Earth: Skill burden, practical mastery
    if (markers.some(m => m.marker_type === 'skill_burden') &&
        attention.elemental_resonance === 'earth') {
      return 'earth';
    }

    // Air: Morphological shift, evolutionary understanding
    if (markers.some(m => m.marker_type === 'morphological_shift') &&
        attention.elemental_resonance === 'air') {
      return 'air';
    }

    // Aether: Integration of all markers
    if (markers.length >= 3) {
      return 'aether';
    }

    return attention.elemental_resonance;
  }

  /**
   * Identify how this person characteristically resists their daimon
   */
  private identifyResistancePattern(life_thread: LifeThread, markers: DaimonicMarker[]): string | undefined {
    if (this.showsRationalResistance(life_thread)) {
      return 'intellectual_bypass'; // "This isn't practical"
    }
    
    if (this.showsEmotionalResistance(life_thread)) {
      return 'emotional_numbing'; // "I don't want to feel that much"
    }
    
    if (this.showsSocialResistance(life_thread)) {
      return 'social_conformity'; // "People will think I'm crazy"
    }
    
    if (this.showsPracticalResistance(life_thread)) {
      return 'practical_deferral'; // "I'll do it when I'm financially stable"
    }

    return undefined;
  }

  /**
   * Generate guidance for integrating daimonic calling
   */
  private generateIntegrationGuidance(markers: DaimonicMarker[], archetypal_current?: string): string | undefined {
    if (markers.length === 0) return undefined;

    const dominant_marker = markers.reduce((a, b) => a.intensity > b.intensity ? a : b);

    switch (dominant_marker.marker_type) {
      case 'inexplicable_pull':
        return 'Trust the pull without needing to justify it. Small experiments honor the call without overwhelming your life.';
      
      case 'anti_utilitarian':
        return 'The daimon rarely serves conventional success. Consider what you\'re willing to sacrifice for authentic expression.';
      
      case 'skill_burden':
        return 'The unwanted skill may be the daimon\'s way of preparing you. Ask how this competence could serve something larger.';
      
      case 'morphological_shift':
        return 'Notice the deeper pattern beneath changing forms. What remains constant as the expression evolves?';
      
      case 'steady_meaning':
        return 'The persistent sense of meaning is trustworthy guidance. Let outcomes be secondary to authentic engagement.';
      
      default:
        return 'Multiple daimonic signals are active. Pay attention to what calls most strongly right now.';
    }
  }

  // Helper methods for marker detection
  private lacksStrongJustification(life_thread: LifeThread): boolean {
    return life_thread.stated_motivations.length < 2 || 
           life_thread.stated_motivations.some(m => m.includes('just feel') || m.includes('can\'t explain'));
  }

  private persistsDespiteObstacles(life_thread: LifeThread): boolean {
    return life_thread.intensity_pattern.length > 1 && 
           life_thread.intensity_pattern[life_thread.intensity_pattern.length - 1] > 0.5;
  }

  private usesCompulsiveLanguage(life_thread: LifeThread): boolean {
    const compulsive_words = ['have to', 'must', 'need to', 'called to', 'drawn to'];
    return life_thread.stated_motivations.some(m => 
      compulsive_words.some(word => m.toLowerCase().includes(word))
    );
  }

  private threatensBroutilitySuccess(life_thread: LifeThread): boolean {
    return life_thread.sacrifices_made.some(s => 
      ['income', 'security', 'status', 'comfort', 'convenience'].some(threat => s.includes(threat))
    );
  }

  private createsPracticalDifficulties(life_thread: LifeThread): boolean {
    return life_thread.sacrifices_made.length > 0;
  }

  private lacksExternalValidation(life_thread: LifeThread): boolean {
    // Would need to check if others support this path
    return true; // Simplified for now
  }

  private showsReluctantMastery(life_thread: LifeThread): boolean {
    // Check if high skill with low stated enjoyment
    return life_thread.skill_development && 
           !life_thread.stated_motivations.some(m => m.includes('enjoy') || m.includes('love'));
  }

  private othersRelyOnSkill(life_thread: LifeThread): boolean {
    return life_thread.domain === 'work' && life_thread.duration > 2;
  }

  private expressesResentmentAboutSkill(life_thread: LifeThread): boolean {
    return life_thread.stated_motivations.some(m => 
      ['burden', 'stuck', 'trapped', 'have to'].some(word => m.includes(word))
    );
  }

  private skillDevelopedWithoutIntention(life_thread: LifeThread): boolean {
    return !life_thread.stated_motivations.some(m => 
      m.includes('wanted to learn') || m.includes('planned') || m.includes('intended')
    );
  }

  private showsFormChanges(life_thread: LifeThread): boolean {
    return life_thread.duration > 3 && life_thread.intensity_pattern.length > 3;
  }

  private showsEvolutionaryPattern(intensity_pattern: number[]): boolean {
    // Check for organic development rather than random fluctuation
    if (intensity_pattern.length < 3) return false;
    
    let evolutionary_changes = 0;
    for (let i = 1; i < intensity_pattern.length; i++) {
      if (Math.abs(intensity_pattern[i] - intensity_pattern[i-1]) < 0.3) {
        evolutionary_changes++;
      }
    }
    
    return evolutionary_changes / intensity_pattern.length > 0.6;
  }

  private showsContinuousThread(life_thread: LifeThread): boolean {
    return life_thread.duration > 2; // Simplified
  }

  private recognizesUnderlyingPattern(life_thread: LifeThread): boolean {
    return life_thread.stated_motivations.some(m => 
      ['pattern', 'connection', 'thread', 'deeper'].some(word => m.includes(word))
    );
  }

  private meaningPersistesThroughDifficulty(life_thread: LifeThread): boolean {
    return life_thread.sacrifices_made.length > 0 && 
           life_thread.intensity_pattern[life_thread.intensity_pattern.length - 1] > 0.5;
  }

  private meaningIndependentOfOutcomes(life_thread: LifeThread): boolean {
    return !life_thread.stated_motivations.some(m => 
      ['success', 'achieve', 'goal', 'result', 'outcome'].some(word => m.includes(word))
    );
  }

  private cantImagineAbandoning(life_thread: LifeThread): boolean {
    return life_thread.intensity_pattern[life_thread.intensity_pattern.length - 1] > 0.7;
  }

  // Resistance pattern detection
  private showsRationalResistance(life_thread: LifeThread): boolean {
    return life_thread.stated_motivations.some(m => 
      ['not practical', 'not realistic', 'doesn\'t make sense'].some(phrase => m.includes(phrase))
    );
  }

  private showsEmotionalResistance(life_thread: LifeThread): boolean { return false; }
  private showsSocialResistance(life_thread: LifeThread): boolean { return false; }
  private showsPracticalResistance(life_thread: LifeThread): boolean { return false; }

  // Archetypal signature calculations (simplified for now)
  private calculateArtistSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number {
    let score = 0;
    if (life_thread.domain.includes('creative')) score += 0.5;
    if (markers.some(m => m.marker_type === 'inexplicable_pull')) score += 0.3;
    return score;
  }

  private calculateTeacherSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateHealerSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateWarriorSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateExplorerSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateCaregiverSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateSageSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }
  private calculateBuilderSignature(life_thread: LifeThread, markers: DaimonicMarker[]): number { return 0; }

  private getMinimalResonance(): DaimonicResonance {
    return {
      overall_resonance: 0,
      active_markers: [],
      archetypal_current: undefined,
      elemental_signature: undefined,
      resistance_pattern: undefined,
      integration_guidance: undefined
    };
  }

  /**
   * Public interface for other systems
   */
  public assessLifeThread(life_thread: LifeThread): DaimonicResonance {
    return this.attune(life_thread);
  }

  public getResonanceHistory(user_id: string): DaimonicMarker[] {
    return this.resonance_patterns.get(user_id) || [];
  }

  public updateLearningPatterns(user_id: string, resonance: DaimonicResonance): void {
    const existing = this.resonance_patterns.get(user_id) || [];
    this.resonance_patterns.set(user_id, [...existing, ...resonance.active_markers]);
  }
}