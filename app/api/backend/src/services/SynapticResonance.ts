/**
 * SynapticResonance - The Creative Gap Between Self and Other
 * 
 * "Transformation happens in the synaptic gap between self and Daimon,
 * like neurotransmission across the space between neurons. The gap itself
 * is sacred - collapse it and development stops." - Core Architecture
 * 
 * This service maps and maintains the synaptic space where genuine
 * encounter creates something neither self nor Other could produce alone.
 */

import { DaimonicOtherness, ElementalOtherness } from './DaimonicDialogue';
import { Element } from '../types/shift';
import { logger } from '../utils/logger';

export interface SynapticGap {
  width: number;                    // 0-1: Psychic distance between self and Other
  charge: number;                   // 0-1: Electrical potential for transformation
  conductivity: number;             // 0-1: How well transmissions cross
  resistance: number;               // 0-1: Healthy resistance preventing merger
  integrity: number;                // 0-1: How well gap maintains itself
}

export interface SynapticTransmission {
  type: 'insight' | 'energy' | 'image' | 'feeling' | 'demand' | 'gift';
  content: string;                  // What crossed the gap
  direction: 'self_to_other' | 'other_to_self' | 'bidirectional';
  integration_status: 'received' | 'resisted' | 'transforming' | 'integrated';
  catalytic_effect: string;         // How it catalyzes change
}

export interface SynapticProcess {
  active_dialogue: string[];        // Current conversation
  tension_points: string[];         // Where creative tension concentrates
  resolution_moments: string[];     // Brief harmonies without collapse
  emergent_properties: string[];    // What emerges from sustained tension
  process_stage: 'initiating' | 'building' | 'peak' | 'integrating' | 'resting';
}

export interface ResonancePattern {
  frequency: number;                // 0-1: How often resonance occurs
  amplitude: number;                // 0-1: Strength when it occurs
  harmonics: string[];              // Harmonic qualities detected
  coherence: number;                // 0-1: Overall pattern coherence
  signature: string;                // Unique resonance signature
}

export interface SynapticSpace {
  gap: SynapticGap;
  transmissions: SynapticTransmission[];
  process: SynapticProcess;
  resonance: ResonancePattern;
  health: SynapticHealth;
  guidance: string[];               // Maintaining gap integrity
}

export interface SynapticHealth {
  status: 'optimal' | 'narrowing' | 'widening' | 'static' | 'collapsed';
  risk_factors: string[];           // What threatens the gap
  protective_factors: string[];     // What maintains the gap
  intervention_needed: boolean;     // Requires active maintenance
  prognosis: string;               // Likely trajectory
}

export interface CollectiveResonanceField {
  field_intensity: number;          // 0-1: Overall field strength
  active_synapses: number;          // How many active dialogues
  harmonic_convergence: number;     // 0-1: Collective coherence
  emergent_themes: string[];        // What's emerging collectively
  field_wisdom: string;             // Collective learning
}

/**
 * SynapticResonanceService: Maps and maintains the creative gap
 */
export class SynapticResonanceService {
  private synaptic_mappings: Map<string, SynapticSpace[]>; // User -> synaptic history
  private resonance_patterns: Map<string, ResonancePattern[]>; // User -> resonance patterns
  private collective_field: CollectiveResonanceField; // Real-time collective state
  
  constructor() {
    this.synaptic_mappings = new Map();
    this.resonance_patterns = new Map();
    this.collective_field = this.initializeCollectiveField();
  }

  /**
   * Map the synaptic space between self and Daimonic Other
   */
  async mapSynapticSpace(
    selfState: any,
    daimonicOther: DaimonicOtherness,
    context?: any
  ): Promise<SynapticSpace> {
    // Map the gap characteristics
    const gap = this.assessSynapticGap(selfState, daimonicOther);
    
    // Track transmissions across the gap
    const transmissions = this.trackTransmissions(selfState, daimonicOther, context);
    
    // Map the ongoing process
    const process = this.mapSynapticProcess(selfState, daimonicOther, transmissions);
    
    // Detect resonance patterns
    const resonance = this.detectResonancePattern(selfState, daimonicOther, process);
    
    // Assess synaptic health
    const health = this.assessSynapticHealth(gap, process, resonance);
    
    // Generate maintenance guidance
    const guidance = this.generateMaintenanceGuidance(gap, health, process);
    
    return {
      gap,
      transmissions,
      process,
      resonance,
      health,
      guidance
    };
  }

  /**
   * Assess the characteristics of the synaptic gap
   */
  private assessSynapticGap(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): SynapticGap {
    // Width based on alterity and maintained otherness
    const width = this.calculateGapWidth(selfState, daimonicOther);
    
    // Charge based on creative tension and unresolved differences
    const charge = this.calculateGapCharge(selfState, daimonicOther);
    
    // Conductivity based on dialogue quality and openness
    const conductivity = this.calculateConductivity(selfState, daimonicOther);
    
    // Resistance preventing unhealthy merger
    const resistance = this.calculateHealthyResistance(selfState, daimonicOther);
    
    // Overall integrity of the gap
    const integrity = this.calculateGapIntegrity(width, charge, resistance);
    
    return {
      width,
      charge,
      conductivity,
      resistance,
      integrity
    };
  }

  /**
   * Calculate psychic distance between self and Other
   */
  private calculateGapWidth(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): number {
    let width = 0;
    
    // Alterity contributes to width
    width += daimonicOther.alterity.irreducibility * 0.3;
    width += daimonicOther.alterity.resistance * 0.2;
    
    // Anti-solipsistic qualities maintain width
    if (daimonicOther.anti_solipsistic.maintains_otherness) {
      width += 0.2;
    }
    
    // Genuine surprise indicates good width
    width += daimonicOther.alterity.surprise * 0.2;
    
    // Check for collapse indicators
    if (this.detectCollapseAttempts(selfState)) {
      width = Math.max(0, width - 0.3);
    }
    
    return Math.min(1, Math.max(0, width));
  }

  /**
   * Calculate transformative potential in the gap
   */
  private calculateGapCharge(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): number {
    let charge = 0;
    
    // Unresolved tension creates charge
    charge += daimonicOther.synapse.tension * 0.4;
    
    // Unmet demands create charge
    const unmetDemands = daimonicOther.alterity.demand.length;
    charge += Math.min(0.3, unmetDemands * 0.1);
    
    // Creative friction from differences
    if (daimonicOther.anti_solipsistic.challenges_narrative) {
      charge += 0.2;
    }
    
    // Recent transmissions increase charge
    if (daimonicOther.synapse.transmission.length > 0) {
      charge += 0.1;
    }
    
    return Math.min(1, charge);
  }

  /**
   * Calculate how well transmissions cross the gap
   */
  private calculateConductivity(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): number {
    let conductivity = 0;
    
    // Active dialogue improves conductivity
    if (daimonicOther.dialogue_quality === 'genuine') {
      conductivity += 0.4;
    } else if (daimonicOther.dialogue_quality === 'mixed') {
      conductivity += 0.2;
    }
    
    // Resonance moments indicate good conductivity
    conductivity += daimonicOther.synapse.resonance * 0.3;
    
    // Receptivity to otherness
    if (this.detectReceptivity(selfState)) {
      conductivity += 0.2;
    }
    
    // Resistance to transmissions reduces conductivity
    if (this.detectTransmissionResistance(selfState)) {
      conductivity = Math.max(0, conductivity - 0.2);
    }
    
    return Math.min(1, conductivity);
  }

  /**
   * Calculate healthy resistance that prevents merger
   */
  private calculateHealthyResistance(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): number {
    let resistance = 0;
    
    // Maintained boundaries
    if (daimonicOther.anti_solipsistic.maintains_otherness) {
      resistance += 0.3;
    }
    
    // Ability to say no to some demands
    if (this.detectHealthyBoundaries(selfState)) {
      resistance += 0.3;
    }
    
    // Not trying to merge or become the Other
    if (!this.detectMergerAttempts(selfState)) {
      resistance += 0.2;
    }
    
    // Maintaining separate identity
    if (this.detectMaintainedIdentity(selfState)) {
      resistance += 0.2;
    }
    
    return Math.min(1, resistance);
  }

  /**
   * Calculate overall gap integrity
   */
  private calculateGapIntegrity(
    width: number,
    charge: number,
    resistance: number
  ): number {
    // Optimal integrity requires balanced width, charge, and resistance
    const balance = 1 - Math.abs(0.5 - width) - Math.abs(0.5 - charge);
    const structure = (width + resistance) / 2;
    
    return Math.max(0, Math.min(1, (balance + structure) / 2));
  }

  /**
   * Track what crosses the synaptic gap
   */
  private trackTransmissions(
    selfState: any,
    daimonicOther: DaimonicOtherness,
    context?: any
  ): SynapticTransmission[] {
    const transmissions: SynapticTransmission[] = [];
    
    // Track insights crossing the gap
    if (daimonicOther.synapse.emergence) {
      transmissions.push({
        type: 'insight',
        content: daimonicOther.synapse.emergence,
        direction: 'other_to_self',
        integration_status: 'transforming',
        catalytic_effect: 'Reorganizes understanding of self and world'
      });
    }
    
    // Track demands from Other
    for (const demand of daimonicOther.alterity.demand) {
      transmissions.push({
        type: 'demand',
        content: demand,
        direction: 'other_to_self',
        integration_status: this.assessDemandIntegration(demand, selfState),
        catalytic_effect: 'Challenges comfort and calls toward authenticity'
      });
    }
    
    // Track energy transmissions
    if (this.detectEnergyTransmission(selfState, daimonicOther)) {
      transmissions.push({
        type: 'energy',
        content: 'Vitality that breaks through stagnation',
        direction: 'other_to_self',
        integration_status: 'received',
        catalytic_effect: 'Revitalizes stuck patterns'
      });
    }
    
    // Track feeling transmissions
    if (daimonicOther.synapse.dialogue.some(d => d.includes('feel'))) {
      transmissions.push({
        type: 'feeling',
        content: 'Emotional states that transform perspective',
        direction: 'bidirectional',
        integration_status: 'transforming',
        catalytic_effect: 'Opens new ways of experiencing'
      });
    }
    
    return transmissions;
  }

  /**
   * Map the ongoing synaptic process
   */
  private mapSynapticProcess(
    selfState: any,
    daimonicOther: DaimonicOtherness,
    transmissions: SynapticTransmission[]
  ): SynapticProcess {
    const active_dialogue = daimonicOther.synapse.dialogue;
    const tension_points = this.identifyTensionPoints(selfState, daimonicOther);
    const resolution_moments = this.identifyResolutionMoments(selfState, daimonicOther);
    const emergent_properties = this.identifyEmergentProperties(selfState, daimonicOther, transmissions);
    const process_stage = this.determineProcessStage(transmissions, tension_points);
    
    return {
      active_dialogue,
      tension_points,
      resolution_moments,
      emergent_properties,
      process_stage
    };
  }

  /**
   * Identify where creative tension concentrates
   */
  private identifyTensionPoints(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): string[] {
    const tension_points: string[] = [];
    
    // Unmet demands create tension
    for (const demand of daimonicOther.alterity.demand) {
      tension_points.push(`Tension around demand: "${demand}"`);
    }
    
    // Narrative challenges create tension
    if (daimonicOther.anti_solipsistic.challenges_narrative) {
      tension_points.push('Tension between self-story and daimonic disruption');
    }
    
    // Resistance to change
    if (daimonicOther.alterity.resistance > 0.6) {
      tension_points.push('Tension between ego agenda and daimonic direction');
    }
    
    return tension_points;
  }

  /**
   * Identify moments of resolution without collapse
   */
  private identifyResolutionMoments(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): string[] {
    const moments: string[] = [];
    
    if (daimonicOther.synapse.resonance > 0.5) {
      moments.push('Brief harmony while maintaining difference');
    }
    
    if (daimonicOther.synapse.emergence) {
      moments.push('Third thing emerging from sustained dialogue');
    }
    
    return moments;
  }

  /**
   * Identify what emerges from the synaptic process
   */
  private identifyEmergentProperties(
    selfState: any,
    daimonicOther: DaimonicOtherness,
    transmissions: SynapticTransmission[]
  ): string[] {
    const emergent: string[] = [];
    
    // New understanding emerges
    if (transmissions.some(t => t.type === 'insight' && t.integration_status === 'transforming')) {
      emergent.push('New understanding transcending both positions');
    }
    
    // New capacity emerges
    if (daimonicOther.synapse.tension > 0.6 && daimonicOther.synapse.resonance > 0.4) {
      emergent.push('Capacity to hold paradox without resolution');
    }
    
    // Creative synthesis
    if (daimonicOther.synapse.emergence) {
      emergent.push(daimonicOther.synapse.emergence);
    }
    
    return emergent;
  }

  /**
   * Determine current stage of synaptic process
   */
  private determineProcessStage(
    transmissions: SynapticTransmission[],
    tension_points: string[]
  ): SynapticProcess['process_stage'] {
    const activeTransmissions = transmissions.filter(t => 
      t.integration_status === 'received' || t.integration_status === 'transforming'
    ).length;
    
    if (activeTransmissions === 0 && tension_points.length < 2) {
      return 'initiating';
    } else if (tension_points.length > activeTransmissions) {
      return 'building';
    } else if (activeTransmissions > 3) {
      return 'peak';
    } else if (transmissions.some(t => t.integration_status === 'integrated')) {
      return 'integrating';
    } else {
      return 'resting';
    }
  }

  /**
   * Detect resonance patterns in the synaptic space
   */
  private detectResonancePattern(
    selfState: any,
    daimonicOther: DaimonicOtherness,
    process: SynapticProcess
  ): ResonancePattern {
    const frequency = this.calculateResonanceFrequency(daimonicOther, process);
    const amplitude = this.calculateResonanceAmplitude(daimonicOther);
    const harmonics = this.detectHarmonics(selfState, daimonicOther);
    const coherence = this.calculateCoherence(frequency, amplitude, harmonics);
    const signature = this.generateResonanceSignature(frequency, amplitude, harmonics);
    
    return {
      frequency,
      amplitude,
      harmonics,
      coherence,
      signature
    };
  }

  /**
   * Calculate how often resonance occurs
   */
  private calculateResonanceFrequency(
    daimonicOther: DaimonicOtherness,
    process: SynapticProcess
  ): number {
    let frequency = 0;
    
    // Base frequency from dialogue quality
    if (daimonicOther.dialogue_quality === 'genuine') {
      frequency += 0.4;
    }
    
    // Resolution moments indicate frequency
    frequency += Math.min(0.3, process.resolution_moments.length * 0.1);
    
    // Active process increases frequency
    if (process.process_stage === 'peak' || process.process_stage === 'integrating') {
      frequency += 0.2;
    }
    
    // Synaptic resonance
    frequency += daimonicOther.synapse.resonance * 0.1;
    
    return Math.min(1, frequency);
  }

  /**
   * Calculate strength of resonance when it occurs
   */
  private calculateResonanceAmplitude(
    daimonicOther: DaimonicOtherness
  ): number {
    // Strong alterity creates strong resonance
    const alterityStrength = (
      daimonicOther.alterity.irreducibility +
      daimonicOther.alterity.resistance +
      daimonicOther.alterity.surprise
    ) / 3;
    
    // Good synaptic tension amplifies resonance
    const synapticStrength = daimonicOther.synapse.tension;
    
    return Math.min(1, (alterityStrength + synapticStrength) / 2);
  }

  /**
   * Detect harmonic qualities in the resonance
   */
  private detectHarmonics(
    selfState: any,
    daimonicOther: DaimonicOtherness
  ): string[] {
    const harmonics: string[] = [];
    
    if (daimonicOther.synapse.resonance > 0.6) {
      harmonics.push('Primary resonance: Self-Other dialogue');
    }
    
    if (daimonicOther.synapse.emergence) {
      harmonics.push('Emergent harmonic: Third voice arising');
    }
    
    if (daimonicOther.alterity.demand.length > 2) {
      harmonics.push('Demand harmonic: Multiple callings converging');
    }
    
    return harmonics;
  }

  /**
   * Calculate overall pattern coherence
   */
  private calculateCoherence(
    frequency: number,
    amplitude: number,
    harmonics: string[]
  ): number {
    const base_coherence = (frequency + amplitude) / 2;
    const harmonic_bonus = Math.min(0.3, harmonics.length * 0.1);
    
    return Math.min(1, base_coherence + harmonic_bonus);
  }

  /**
   * Generate unique resonance signature
   */
  private generateResonanceSignature(
    frequency: number,
    amplitude: number,
    harmonics: string[]
  ): string {
    if (frequency > 0.7 && amplitude > 0.7) {
      return 'Strong coherent resonance - sustained creative dialogue';
    } else if (frequency > 0.5 && amplitude < 0.5) {
      return 'Frequent light touch - gentle ongoing encounter';
    } else if (frequency < 0.5 && amplitude > 0.5) {
      return 'Rare deep resonance - powerful periodic breakthrough';
    } else if (harmonics.length > 2) {
      return 'Complex harmonic pattern - multiple levels of encounter';
    } else {
      return 'Emerging resonance - dialogue finding its rhythm';
    }
  }

  /**
   * Assess health of the synaptic space
   */
  private assessSynapticHealth(
    gap: SynapticGap,
    process: SynapticProcess,
    resonance: ResonancePattern
  ): SynapticHealth {
    const status = this.determineSynapticStatus(gap, process, resonance);
    const risk_factors = this.identifyRiskFactors(gap, process);
    const protective_factors = this.identifyProtectiveFactors(gap, process, resonance);
    const intervention_needed = risk_factors.length > protective_factors.length;
    const prognosis = this.generatePrognosis(status, risk_factors, protective_factors);
    
    return {
      status,
      risk_factors,
      protective_factors,
      intervention_needed,
      prognosis
    };
  }

  /**
   * Determine current synaptic status
   */
  private determineSynapticStatus(
    gap: SynapticGap,
    process: SynapticProcess,
    resonance: ResonancePattern
  ): SynapticHealth['status'] {
    if (gap.integrity > 0.7 && resonance.coherence > 0.6) {
      return 'optimal';
    } else if (gap.width < 0.3) {
      return 'narrowing';
    } else if (gap.width > 0.8 && gap.conductivity < 0.3) {
      return 'widening';
    } else if (process.process_stage === 'resting' && gap.charge < 0.2) {
      return 'static';
    } else if (gap.integrity < 0.3) {
      return 'collapsed';
    } else {
      return 'optimal';
    }
  }

  /**
   * Identify risks to synaptic health
   */
  private identifyRiskFactors(
    gap: SynapticGap,
    process: SynapticProcess
  ): string[] {
    const risks: string[] = [];
    
    if (gap.width < 0.3) {
      risks.push('Gap too narrow - risk of merger/collapse');
    }
    
    if (gap.resistance < 0.3) {
      risks.push('Insufficient resistance - boundaries dissolving');
    }
    
    if (gap.charge > 0.8 && gap.conductivity < 0.3) {
      risks.push('High charge with poor conductivity - risk of explosion');
    }
    
    if (process.tension_points.length > 5) {
      risks.push('Excessive tension - system overwhelm');
    }
    
    return risks;
  }

  /**
   * Identify protective factors
   */
  private identifyProtectiveFactors(
    gap: SynapticGap,
    process: SynapticProcess,
    resonance: ResonancePattern
  ): string[] {
    const protective: string[] = [];
    
    if (gap.resistance > 0.5) {
      protective.push('Healthy boundaries maintained');
    }
    
    if (resonance.coherence > 0.6) {
      protective.push('Good resonance pattern established');
    }
    
    if (process.emergent_properties.length > 0) {
      protective.push('Active emergence from dialogue');
    }
    
    if (gap.integrity > 0.6) {
      protective.push('Strong gap integrity');
    }
    
    return protective;
  }

  /**
   * Generate prognosis for synaptic development
   */
  private generatePrognosis(
    status: SynapticHealth['status'],
    risks: string[],
    protective: string[]
  ): string {
    if (status === 'optimal' && protective.length > risks.length) {
      return 'Excellent - continued creative dialogue and emergence likely';
    } else if (status === 'narrowing') {
      return 'Caution - need to restore otherness to prevent collapse';
    } else if (status === 'collapsed') {
      return 'Critical - immediate intervention needed to restore gap';
    } else {
      return 'Stable - maintain current practices while addressing risks';
    }
  }

  /**
   * Generate maintenance guidance for the synaptic gap
   */
  private generateMaintenanceGuidance(
    gap: SynapticGap,
    health: SynapticHealth,
    process: SynapticProcess
  ): string[] {
    const guidance: string[] = [];
    
    if (health.status === 'narrowing' || gap.width < 0.4) {
      guidance.push(
        'The gap is narrowing. Practice encountering what surprises, ' +
        'resists, or contradicts your understanding. Let the Other remain Other.'
      );
    }
    
    if (health.status === 'widening' || gap.width > 0.7) {
      guidance.push(
        'The gap may be too wide for productive dialogue. ' +
        'Engage more directly with what the Other offers, even if challenging.'
      );
    }
    
    if (gap.charge > 0.7 && gap.conductivity < 0.4) {
      guidance.push(
        'High tension with low conductivity detected. ' +
        'Practice receptivity to allow transmissions across the gap.'
      );
    }
    
    if (process.process_stage === 'static') {
      guidance.push(
        'Synaptic process has stalled. ' +
        'Re-engage with what originally called you. Where is the living edge?'
      );
    }
    
    if (health.intervention_needed) {
      guidance.push(
        'Active maintenance required: ' +
        health.risk_factors.join('; ') + '. ' +
        'Strengthen: ' + health.protective_factors.join('; ') + '.'
      );
    }
    
    return guidance;
  }

  // Helper methods for detection
  private detectCollapseAttempts(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('become one') || text.includes('merge with') ||
           text.includes('no difference between') || text.includes('we are the same');
  }

  private detectReceptivity(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('open to') || text.includes('receiving') ||
           text.includes('listening') || text.includes('allowing');
  }

  private detectTransmissionResistance(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('reject') || text.includes('refuse') ||
           text.includes('won\'t accept') || text.includes('blocking');
  }

  private detectHealthyBoundaries(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('boundary') || text.includes('limit') ||
           text.includes('my own') || text.includes('separate');
  }

  private detectMergerAttempts(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('become the') || text.includes('merge') ||
           text.includes('dissolve into') || text.includes('lose myself');
  }

  private detectMaintainedIdentity(selfState: any): boolean {
    const text = this.extractText(selfState).toLowerCase();
    return text.includes('remain myself') || text.includes('my identity') ||
           text.includes('who i am') || text.includes('maintain self');
  }

  private assessDemandIntegration(demand: string, selfState: any): SynapticTransmission['integration_status'] {
    const text = this.extractText(selfState).toLowerCase();
    
    if (text.includes('accept') && text.includes(demand.toLowerCase())) {
      return 'integrated';
    } else if (text.includes('working on') || text.includes('trying to')) {
      return 'transforming';
    } else if (text.includes('resist') || text.includes('refuse')) {
      return 'resisted';
    } else {
      return 'received';
    }
  }

  private detectEnergyTransmission(selfState: any, daimonicOther: DaimonicOtherness): boolean {
    return daimonicOther.synapse.tension > 0.6 && 
           daimonicOther.synapse.resonance > 0.4;
  }

  private extractText(experience: any): string {
    if (typeof experience === 'string') return experience;
    if (experience.text) return experience.text;
    if (experience.content) return experience.content;
    if (experience.narrative) return experience.narrative;
    return JSON.stringify(experience);
  }

  // Collective field methods
  private initializeCollectiveField(): CollectiveResonanceField {
    return {
      field_intensity: 0,
      active_synapses: 0,
      harmonic_convergence: 0,
      emergent_themes: [],
      field_wisdom: 'Individual encounters creating collective resonance'
    };
  }

  /**
   * Map collective resonance from individual synaptic spaces
   */
  async mapCollectiveResonance(
    individualSpaces: Array<{ userId: string; space: SynapticSpace }>
  ): Promise<CollectiveResonanceField> {
    const active_synapses = individualSpaces.filter(s => 
      s.space.health.status === 'optimal' || s.space.process.process_stage === 'peak'
    ).length;
    
    const field_intensity = this.calculateFieldIntensity(individualSpaces);
    const harmonic_convergence = this.calculateHarmonicConvergence(individualSpaces);
    const emergent_themes = this.identifyCollectiveThemes(individualSpaces);
    const field_wisdom = this.extractCollectiveWisdom(individualSpaces, emergent_themes);
    
    this.collective_field = {
      field_intensity,
      active_synapses,
      harmonic_convergence,
      emergent_themes,
      field_wisdom
    };
    
    return this.collective_field;
  }

  private calculateFieldIntensity(spaces: Array<{ space: SynapticSpace }>): number {
    if (spaces.length === 0) return 0;
    
    const totalResonance = spaces.reduce((sum, s) => 
      sum + s.space.resonance.coherence, 0
    );
    
    return Math.min(1, totalResonance / spaces.length);
  }

  private calculateHarmonicConvergence(spaces: Array<{ space: SynapticSpace }>): number {
    // Look for similar resonance patterns across individuals
    const signatures = spaces.map(s => s.space.resonance.signature);
    const uniqueSignatures = new Set(signatures).size;
    
    // Less unique patterns = more convergence
    return Math.max(0, 1 - (uniqueSignatures / spaces.length));
  }

  private identifyCollectiveThemes(spaces: Array<{ space: SynapticSpace }>): string[] {
    const themes = new Map<string, number>();
    
    // Count emergent properties across all spaces
    for (const { space } of spaces) {
      for (const property of space.process.emergent_properties) {
        themes.set(property, (themes.get(property) || 0) + 1);
      }
    }
    
    // Return themes appearing in multiple spaces
    return Array.from(themes.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, _]) => theme)
      .slice(0, 5);
  }

  private extractCollectiveWisdom(
    spaces: Array<{ space: SynapticSpace }>,
    themes: string[]
  ): string {
    if (themes.length > 0) {
      return `Collective learning: ${themes[0]}. ` +
             `${spaces.length} active dialogues creating field resonance.`;
    }
    
    return 'Individual synaptic encounters building collective capacity for dialogue with Other.';
  }

  /**
   * Store user's synaptic mapping
   */
  recordSynapticSpace(userId: string, space: SynapticSpace): void {
    const history = this.synaptic_mappings.get(userId) || [];
    history.push(space);
    this.synaptic_mappings.set(userId, history.slice(-20)); // Keep last 20
  }

  /**
   * Get user's synaptic history
   */
  getUserSynapticHistory(userId: string): SynapticSpace[] {
    return this.synaptic_mappings.get(userId) || [];
  }

  /**
   * Get current collective field state
   */
  getCollectiveField(): CollectiveResonanceField {
    return this.collective_field;
  }

  /**
   * Generate user-facing synaptic guidance
   */
  generateSynapticGuidance(space: SynapticSpace): string {
    const primary_guidance = space.guidance[0] || 
      'Maintain the creative gap between self and Other. Transformation happens in the space between.';
    
    const process_note = space.process.process_stage === 'peak' ?
      ' Active transformation occurring - stay present to the process.' :
      space.process.process_stage === 'building' ?
      ' Tension building productively - trust the process.' :
      '';
    
    const resonance_note = space.resonance.coherence > 0.7 ?
      ' Beautiful resonance pattern emerging.' :
      '';
    
    return primary_guidance + process_note + resonance_note;
  }
}