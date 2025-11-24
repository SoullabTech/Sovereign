/**
 * BothAndPhenomenology - Harpur's Paradox-Holding Framework
 * 
 * "UFOs are BOTH material AND spiritual - not either/or. This refusal to be
 * categorized is itself the daimonic signature. The moment you force it into
 * one category, you've literalized the imaginal or reduced the material." - Harpur
 * 
 * This system recognizes and preserves paradox in experiences, never forcing
 * them into single categories. The resistance to categorization IS the message.
 */

import { logger } from '../utils/logger';

export interface MaterialMarkers {
  physical_traces: string[];        // Tangible evidence, measurements, witnesses
  sensory_data: string[];          // What could be seen, heard, touched, measured
  documented_evidence: string[];    // Photos, recordings, official reports
  multiple_witnesses: string[];     // Others who experienced the same thing
  temporal_specificity: string[];   // Exact times, durations, sequences
  spatial_specificity: string[];    // Specific locations, distances, directions
}

export interface ImaginalMarkers {
  symbolic_content: string[];       // Archetypal images, mythic themes
  synchronistic_elements: string[]; // Meaningful coincidences, perfect timing
  emotional_resonance: string[];    // Deep feeling responses, numinous quality
  mythic_parallels: string[];      // Connections to stories, legends, archetypes
  transformative_impact: string[];  // How it changed the person's life/understanding
  dream_like_qualities: string[];   // Surreal aspects, impossible elements
}

export interface ParadoxQuality {
  refuses_categorization: boolean;   // Won't fit cleanly in material OR imaginal
  both_registers_active: boolean;    // Strong markers in BOTH domains simultaneously  
  category_collapse: boolean;        // Trying to categorize destroys the experience
  paradox_comfort: number;          // 0-1: Person's comfort with not resolving it
  resolution_attempts: string[];     // How person tries to "solve" the paradox
  wisdom_in_holding: string;        // What holding the paradox teaches
}

export interface BothAndExperience {
  material_markers: MaterialMarkers;
  imaginal_markers: ImaginalMarkers;
  paradox_quality: ParadoxQuality;
  daimonic_signature: boolean;      // True if refusal to categorize IS the message
  holding_guidance: string;         // How to hold this paradox without collapse
  integration_wisdom: string;       // What this both-and teaches about reality
  literalization_warnings: string[]; // What happens if forced into one category
}

export type CategoryError = 
  | 'material_reduction'    // "It was just physical/psychological/coincidence"
  | 'imaginal_literalization' // "It was definitely supernatural/spiritual/magical"
  | 'either_or_forcing'     // "It must be either X or Y"
  | 'premature_resolution'  // "I need to figure out what this really was"
  | 'meaning_dismissal'     // "It doesn't matter what it means, only what it was"
  | 'fact_dismissal';       // "Facts don't matter, only the meaning matters"

export interface CategoryErrorPattern {
  error_type: CategoryError;
  how_it_manifests: string[];      // Signs someone is making this error
  what_gets_lost: string;          // What wisdom is lost through this error
  correction_guidance: string;      // How to return to both-and holding
  why_tempting: string;           // Why this error is so attractive
}

/**
 * BothAndPhenomenologyService: Preserves paradox without resolution
 */
export class BothAndPhenomenologyService {
  private user_paradox_patterns: Map<string, BothAndExperience[]>; // User history of both-and experiences
  private category_error_tracking: Map<string, CategoryErrorPattern[]>; // Track user's categorization tendencies
  private cultural_literalization: Map<string, number>; // Track cultural tendency to literalize different domains
  
  constructor() {
    this.user_paradox_patterns = new Map();
    this.category_error_tracking = new Map();
    this.cultural_literalization = new Map();
  }

  /**
   * Primary assessment method - evaluate both-and quality of experience
   */
  assessBothAndQuality(experience: any, context?: any): BothAndExperience {
    const material_markers = this.detectMaterialMarkers(experience);
    const imaginal_markers = this.detectImaginalMarkers(experience);
    const paradox_quality = this.assessParadoxQuality(experience, material_markers, imaginal_markers);
    const daimonic_signature = this.isDaimonicSignature(paradox_quality, material_markers, imaginal_markers);
    const holding_guidance = this.generateHoldingGuidance(paradox_quality, daimonic_signature);
    const integration_wisdom = this.generateIntegrationWisdom(material_markers, imaginal_markers, paradox_quality);
    const literalization_warnings = this.generateLiteralizationWarnings(material_markers, imaginal_markers);

    return {
      material_markers,
      imaginal_markers,
      paradox_quality,
      daimonic_signature,
      holding_guidance,
      integration_wisdom,
      literalization_warnings
    };
  }

  /**
   * Detect material/physical markers in experience
   */
  private detectMaterialMarkers(experience: any): MaterialMarkers {
    const text = this.extractText(experience);
    
    return {
      physical_traces: this.findPhysicalTraces(text),
      sensory_data: this.findSensoryData(text),
      documented_evidence: this.findDocumentedEvidence(text),
      multiple_witnesses: this.findMultipleWitnesses(text),
      temporal_specificity: this.findTemporalSpecificity(text),
      spatial_specificity: this.findSpatialSpecificity(text)
    };
  }

  /**
   * Detect imaginal/symbolic markers in experience
   */
  private detectImaginalMarkers(experience: any): ImaginalMarkers {
    const text = this.extractText(experience);
    
    return {
      symbolic_content: this.findSymbolicContent(text),
      synchronistic_elements: this.findSynchronisticElements(text),
      emotional_resonance: this.findEmotionalResonance(text),
      mythic_parallels: this.findMythicParallels(text),
      transformative_impact: this.findTransformativeImpact(text),
      dream_like_qualities: this.findDreamLikeQualities(text)
    };
  }

  /**
   * Assess the paradox quality - how well it holds both-and
   */
  private assessParadoxQuality(
    experience: any, 
    material: MaterialMarkers, 
    imaginal: ImaginalMarkers
  ): ParadoxQuality {
    const material_strength = this.calculateMarkerStrength(material);
    const imaginal_strength = this.calculateMarkerStrength(imaginal);
    
    const refuses_categorization = material_strength > 0.3 && imaginal_strength > 0.3;
    const both_registers_active = material_strength > 0.5 && imaginal_strength > 0.5;
    const category_collapse = this.detectCategoryCollapseAttempts(experience);
    const paradox_comfort = this.assessParadoxComfort(experience);
    const resolution_attempts = this.findResolutionAttempts(experience);
    const wisdom_in_holding = this.identifyWisdomInHolding(material_strength, imaginal_strength);

    return {
      refuses_categorization,
      both_registers_active,
      category_collapse,
      paradox_comfort,
      resolution_attempts,
      wisdom_in_holding
    };
  }

  /**
   * Determine if this refusal to categorize IS the daimonic signature
   * Harpur: The paradox quality itself is the message
   */
  private isDaimonicSignature(
    paradox: ParadoxQuality, 
    material: MaterialMarkers, 
    imaginal: ImaginalMarkers
  ): boolean {
    // Strong both-and with resistance to categorization
    if (paradox.both_registers_active && paradox.refuses_categorization) {
      return true;
    }
    
    // Experience becomes meaningless when forced into single category
    if (paradox.category_collapse) {
      return true;
    }
    
    // Rich in both domains with transformative impact
    if (material.multiple_witnesses.length > 0 && 
        imaginal.transformative_impact.length > 0) {
      return true;
    }
    
    return false;
  }

  // Material marker detection methods
  private findPhysicalTraces(text: string): string[] {
    const markers = [];
    const trace_indicators = [
      'marks', 'traces', 'evidence', 'footprints', 'residue', 'damage',
      'burn marks', 'indentations', 'scratches', 'physical evidence'
    ];
    
    for (const indicator of trace_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findSensoryData(text: string): string[] {
    const markers = [];
    const sensory_indicators = [
      'saw', 'heard', 'felt', 'touched', 'smelled', 'tasted',
      'temperature', 'pressure', 'vibration', 'sound', 'light',
      'color', 'texture', 'weight', 'movement'
    ];
    
    for (const indicator of sensory_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findDocumentedEvidence(text: string): string[] {
    const markers = [];
    const documentation_indicators = [
      'photo', 'recording', 'video', 'measured', 'documented', 'report',
      'official record', 'medical report', 'police report', 'written down',
      'recorded', 'captured', 'filed report'
    ];
    
    for (const indicator of documentation_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findMultipleWitnesses(text: string): string[] {
    const markers = [];
    const witness_indicators = [
      'others saw', 'we all', 'everyone noticed', 'witnesses', 'group saw',
      'my friend also', 'family saw', 'coworkers saw', 'neighbors saw',
      'several people', 'multiple people'
    ];
    
    for (const indicator of witness_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findTemporalSpecificity(text: string): string[] {
    const markers = [];
    // Look for specific times, durations
    const time_patterns = [
      /at exactly \d+:\d+/gi,
      /lasted \d+ minutes/gi,
      /for exactly \d+ seconds/gi,
      /\d+ hours/gi,
      /between \d+:\d+ and \d+:\d+/gi
    ];
    
    for (const pattern of time_patterns) {
      const matches = text.match(pattern);
      if (matches) {
        markers.push(...matches);
      }
    }
    
    return markers;
  }

  private findSpatialSpecificity(text: string): string[] {
    const markers = [];
    const spatial_indicators = [
      'exactly', 'precisely', 'measured', 'distance', 'location',
      'coordinates', 'address', 'specific place', 'exact spot'
    ];
    
    for (const indicator of spatial_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  // Imaginal marker detection methods
  private findSymbolicContent(text: string): string[] {
    const markers = [];
    const symbolic_indicators = [
      'reminded me of', 'like a', 'symbolized', 'represented', 'archetypal',
      'mythic', 'ancient', 'timeless', 'universal', 'sacred geometry',
      'mandala', 'cross', 'circle', 'spiral', 'tree', 'mountain',
      'ocean', 'fire', 'light', 'darkness', 'shadow', 'golden'
    ];
    
    for (const indicator of symbolic_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findSynchronisticElements(text: string): string[] {
    const markers = [];
    const sync_indicators = [
      'perfect timing', 'exactly when', 'just as', 'coincidence', 
      'meaningful coincidence', 'synchronicity', 'right moment',
      'couldn\'t have planned', 'universe arranged', 'fate', 'destiny'
    ];
    
    for (const indicator of sync_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findEmotionalResonance(text: string): string[] {
    const markers = [];
    const emotional_indicators = [
      'numinous', 'sacred', 'holy', 'overwhelming', 'profound',
      'life-changing', 'deeply moved', 'tears', 'awe', 'wonder',
      'transcendent', 'mystical', 'spiritual', 'divine', 'blessed'
    ];
    
    for (const indicator of emotional_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findMythicParallels(text: string): string[] {
    const markers = [];
    const mythic_indicators = [
      'like in the Bible', 'ancient story', 'myth', 'legend', 'fairy tale',
      'hero\'s journey', 'initiation', 'quest', 'vision quest', 'prophecy',
      'dream', 'vision', 'archetypal', 'universal story', 'collective unconscious'
    ];
    
    for (const indicator of mythic_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findTransformativeImpact(text: string): string[] {
    const markers = [];
    const transformation_indicators = [
      'changed my life', 'never the same', 'transformed me', 'awakening',
      'realization', 'breakthrough', 'revelation', 'life-altering',
      'paradigm shift', 'new understanding', 'opened my eyes', 'healing'
    ];
    
    for (const indicator of transformation_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  private findDreamLikeQualities(text: string): string[] {
    const markers = [];
    const dream_indicators = [
      'dream-like', 'surreal', 'impossible', 'defied physics', 
      'couldn\'t be real', 'like a dream', 'otherworldly', 'magical',
      'beyond normal reality', 'transcendent', 'not of this world'
    ];
    
    for (const indicator of dream_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        markers.push(indicator);
      }
    }
    
    return markers;
  }

  // Assessment helper methods
  private calculateMarkerStrength(markers: any): number {
    let total = 0;
    let count = 0;
    
    for (const [key, value] of Object.entries(markers)) {
      if (Array.isArray(value)) {
        total += value.length;
        count++;
      }
    }
    
    return count > 0 ? Math.min(1, total / (count * 3)) : 0; // Normalize to 0-1
  }

  private detectCategoryCollapseAttempts(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    
    const collapse_indicators = [
      'trying to figure out', 'need to know', 'must be either', 'has to be',
      'can\'t be both', 'doesn\'t make sense', 'impossible', 'contradiction',
      'need explanation', 'must understand', 'need to categorize'
    ];
    
    return collapse_indicators.some(indicator => text.includes(indicator));
  }

  private assessParadoxComfort(experience: any): number {
    const text = this.extractText(experience).toLowerCase();
    
    const comfort_indicators = [
      'comfortable not knowing', 'okay with mystery', 'both are true',
      'holding the paradox', 'doesn\'t need to make sense', 'mystery is okay',
      'accept the contradiction', 'both-and', 'comfortable with uncertainty'
    ];
    
    const discomfort_indicators = [
      'need to know', 'must understand', 'doesn\'t make sense', 'impossible',
      'can\'t accept', 'must be explained', 'need closure', 'confusing'
    ];
    
    let comfort_score = comfort_indicators.filter(indicator => text.includes(indicator)).length;
    let discomfort_score = discomfort_indicators.filter(indicator => text.includes(indicator)).length;
    
    return Math.max(0, Math.min(1, (comfort_score - discomfort_score + 3) / 6));
  }

  private findResolutionAttempts(experience: any): string[] {
    const text = this.extractText(experience);
    const attempts = [];
    
    const resolution_patterns = [
      'it must be', 'probably just', 'likely explanation', 'rational explanation',
      'scientific explanation', 'psychological explanation', 'coincidence',
      'imagination', 'hallucination', 'misperception', 'definitely supernatural',
      'clearly spiritual', 'obviously divine', 'certainly paranormal'
    ];
    
    for (const pattern of resolution_patterns) {
      if (text.toLowerCase().includes(pattern)) {
        attempts.push(pattern);
      }
    }
    
    return attempts;
  }

  private identifyWisdomInHolding(material_strength: number, imaginal_strength: number): string {
    if (material_strength > 0.6 && imaginal_strength > 0.6) {
      return 'Reality is richer than either-or categories. Both registers speak truth simultaneously.';
    } else if (material_strength > 0.4 && imaginal_strength > 0.4) {
      return 'Mystery preserves itself by refusing single interpretations. The paradox IS the message.';
    } else {
      return 'Some experiences teach us that understanding and meaning are different ways of knowing.';
    }
  }

  /**
   * Generate guidance for holding the paradox without collapse
   */
  private generateHoldingGuidance(paradox: ParadoxQuality, daimonic_signature: boolean): string {
    if (daimonic_signature) {
      return 'This experience\'s refusal to be categorized IS its daimonic signature. ' +
             'Hold both the facts and the meaning without collapsing one into the other. ' +
             'Name what you witnessed. Honor what it meant. Do not resolve the paradox.';
    }
    
    if (paradox.both_registers_active) {
      return 'Both the material and imaginal dimensions are speaking. Listen to each without ' +
             'forcing them into harmony. Let the tension between them teach you about reality\'s complexity.';
    }
    
    if (paradox.paradox_comfort < 0.3) {
      return 'Your discomfort with not knowing is understandable. Practice saying: "Both are true. ' +
             'I don\'t need to resolve this to learn from it." The mystery itself has wisdom to offer.';
    }
    
    return 'Stay curious about both dimensions without rushing to explanation. ' +
           'What happens if you let this remain paradoxical?';
  }

  /**
   * Generate integration wisdom from both-and experience
   */
  private generateIntegrationWisdom(
    material: MaterialMarkers, 
    imaginal: ImaginalMarkers, 
    paradox: ParadoxQuality
  ): string {
    if (paradox.both_registers_active) {
      return 'Integration wisdom: Reality operates in multiple registers simultaneously. ' +
             'Material facts and imaginal meaning are both real - different kinds of truth that don\'t cancel each other out.';
    }
    
    if (material.multiple_witnesses.length > 0 && imaginal.transformative_impact.length > 0) {
      return 'Integration wisdom: Shared experiences can carry personal meaning. ' +
             'The collective witness validates the event; the personal transformation validates its significance.';
    }
    
    return 'Integration wisdom: Mystery is not the absence of knowledge but a different way of knowing. ' +
           'Some truths can only be lived, not explained.';
  }

  /**
   * Generate warnings about literalization dangers
   */
  private generateLiteralizationWarnings(
    material: MaterialMarkers, 
    imaginal: ImaginalMarkers
  ): string[] {
    const warnings: string[] = [];
    
    if (material.physical_traces.length > 0 && imaginal.symbolic_content.length > 0) {
      warnings.push('Warning: Reducing this to "just physical" loses the symbolic teaching.');
      warnings.push('Warning: Making this "purely spiritual" ignores the physical reality.');
    }
    
    if (imaginal.synchronistic_elements.length > 0) {
      warnings.push('Warning: Dismissing as "coincidence" misses the meaning; ' +
                   'claiming "supernatural intervention" literalizes the imaginal.');
    }
    
    if (imaginal.transformative_impact.length > 0) {
      warnings.push('Warning: The personal transformation is as real as any physical evidence.');
    }
    
    return warnings;
  }

  /**
   * Detect category errors in user's interpretation
   */
  public detectCategoryError(experience: any, interpretation: string): CategoryErrorPattern | null {
    const error_type = this.identifyErrorType(interpretation);
    if (!error_type) return null;
    
    return this.getCategoryErrorPattern(error_type);
  }

  private identifyErrorType(interpretation: string): CategoryError | null {
    const text = interpretation.toLowerCase();
    
    // Material reduction
    if (this.containsAny(text, ['just a coincidence', 'just psychological', 'just imagination', 'nothing supernatural'])) {
      return 'material_reduction';
    }
    
    // Imaginal literalization
    if (this.containsAny(text, ['definitely supernatural', 'clearly divine', 'certainly paranormal', 'obviously magical'])) {
      return 'imaginal_literalization';
    }
    
    // Either-or forcing
    if (this.containsAny(text, ['must be either', 'can\'t be both', 'has to be one or the other'])) {
      return 'either_or_forcing';
    }
    
    // Premature resolution
    if (this.containsAny(text, ['need to figure out', 'must know what this was', 'need explanation'])) {
      return 'premature_resolution';
    }
    
    // Meaning dismissal
    if (this.containsAny(text, ['meaning doesn\'t matter', 'only facts matter', 'interpretation is irrelevant'])) {
      return 'meaning_dismissal';
    }
    
    // Fact dismissal
    if (this.containsAny(text, ['facts don\'t matter', 'only meaning matters', 'physical doesn\'t matter'])) {
      return 'fact_dismissal';
    }
    
    return null;
  }

  private getCategoryErrorPattern(error_type: CategoryError): CategoryErrorPattern {
    const patterns: Record<CategoryError, CategoryErrorPattern> = {
      material_reduction: {
        error_type: 'material_reduction',
        how_it_manifests: ['Dismissing as coincidence', 'Explaining away meaning', 'Only accepting physical evidence'],
        what_gets_lost: 'The transformative wisdom and symbolic teaching of the experience',
        correction_guidance: 'Honor both the material facts AND the personal meaning. Both are real.',
        why_tempting: 'Protects against seeming gullible or unscientific to others'
      },
      imaginal_literalization: {
        error_type: 'imaginal_literalization',
        how_it_manifests: ['Making definitive supernatural claims', 'Insisting on magical explanation', 'Rejecting any natural factors'],
        what_gets_lost: 'The grounding in physical reality and practical wisdom',
        correction_guidance: 'Honor the spiritual meaning without dismissing material aspects. The mystery includes both.',
        why_tempting: 'Makes the experience feel more special and validates its importance'
      },
      either_or_forcing: {
        error_type: 'either_or_forcing',
        how_it_manifests: ['Demanding single explanation', 'Rejecting paradox', 'Insisting on one interpretation'],
        what_gets_lost: 'The paradoxical wisdom that some truths transcend single categories',
        correction_guidance: 'Practice saying "Both are true." Reality is more complex than either-or categories.',
        why_tempting: 'Our minds prefer clear categories and avoid cognitive dissonance'
      },
      premature_resolution: {
        error_type: 'premature_resolution',
        how_it_manifests: ['Rushing to explain', 'Can\'t tolerate not knowing', 'Forcing interpretations'],
        what_gets_lost: 'The ongoing teaching that emerges from sitting with mystery',
        correction_guidance: 'Let the experience ripen. Some wisdom only emerges through living with questions.',
        why_tempting: 'Not knowing feels uncomfortable and anxiety-provoking'
      },
      meaning_dismissal: {
        error_type: 'meaning_dismissal',
        how_it_manifests: ['Only caring about what happened', 'Dismissing personal significance', 'Avoiding interpretation'],
        what_gets_lost: 'The transformative potential and life guidance in the experience',
        correction_guidance: 'Facts and meaning are both important. What happened AND what it means both matter.',
        why_tempting: 'Seems more objective and avoids seeming to read too much into things'
      },
      fact_dismissal: {
        error_type: 'fact_dismissal',
        how_it_manifests: ['Only caring about meaning', 'Dismissing physical aspects', 'Avoiding concrete details'],
        what_gets_lost: 'The grounding and practical wisdom that comes from honoring material reality',
        correction_guidance: 'Meaning emerges through engagement with facts, not by dismissing them.',
        why_tempting: 'Physical details can seem to diminish the spiritual significance'
      }
    };
    
    return patterns[error_type];
  }

  // Helper methods
  private containsAny(text: string, phrases: string[]): boolean {
    return phrases.some(phrase => text.includes(phrase));
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
   * Public interface for other systems
   */
  public processBothAndExperience(
    userId: string, 
    experience: any, 
    context?: any
  ): BothAndExperience {
    const both_and_experience = this.assessBothAndQuality(experience, context);
    
    // Store user's both-and patterns
    const user_patterns = this.user_paradox_patterns.get(userId) || [];
    user_patterns.push(both_and_experience);
    this.user_paradox_patterns.set(userId, user_patterns.slice(-20)); // Keep last 20
    
    return both_and_experience;
  }

  /**
   * Get user's both-and experience history
   */
  public getUserBothAndHistory(userId: string): BothAndExperience[] {
    return this.user_paradox_patterns.get(userId) || [];
  }

  /**
   * Generate user-facing guidance for both-and experience
   */
  public generateBothAndGuidance(both_and: BothAndExperience): string {
    if (both_and.daimonic_signature) {
      return `Daimonic signature detected: ${both_and.holding_guidance} ` +
             `${both_and.integration_wisdom}`;
    } else {
      return `${both_and.holding_guidance} ${both_and.integration_wisdom}`;
    }
  }

  /**
   * Track cultural literalization tendencies
   */
  public trackCulturalLiteralization(domain: string, literalization_type: 'material' | 'imaginal'): void {
    const key = `${domain}_${literalization_type}`;
    const current = this.cultural_literalization.get(key) || 0;
    this.cultural_literalization.set(key, current + 1);
  }

  /**
   * Get cultural literalization patterns
   */
  public getCulturalLiteralizationPatterns(): Map<string, number> {
    return new Map(this.cultural_literalization);
  }
}