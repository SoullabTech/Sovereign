/**
 * DaimonicDialogue - The Daimon as Necessary Other
 * 
 * "The Daimon is NOT the Higher Self - it's the Other that prevents
 * solipsistic collapse. It creates the synaptic gap where real
 * transformation occurs through genuine encounter." - Core Insight
 * 
 * This service recognizes the Daimon through its quality of irreducible
 * Otherness, maintaining the creative tension necessary for authentic development.
 */

import { Element } from '../types/shift';
import { DaimonicResonance } from '../core/DaimonicResonance';
import { logger } from '../utils/logger';

export interface AlterityMarkers {
  irreducibility: number;        // 0-1: Cannot be absorbed into self-concept
  resistance: number;            // 0-1: Actively pushes back against ego plans
  surprise: number;              // 0-1: Brings what you couldn't have imagined
  demand: string[];              // What it asks that you wouldn't ask of yourself
}

export interface SynapticSpace {
  tension: number;               // 0-1: Creative tension between self & Other
  resonance: number;             // 0-1: Moments of alignment without merger
  dialogue: string[];            // The actual conversation happening
  emergence: string;             // What emerges that neither could create alone
  gap_width: number;            // 0-1: Psychic distance maintained
  transmission: string[];        // What crosses the synaptic gap
}

export interface AntiSolipsisticQualities {
  challenges_narrative: boolean;  // Disrupts your story about yourself
  introduces_unknown: boolean;    // Brings genuinely new information
  maintains_otherness: boolean;   // Never fully merges with ego
  creates_encounter: boolean;     // Forces real meeting, not projection
}

export interface DaimonicOtherness {
  alterity: AlterityMarkers;
  synapse: SynapticSpace;
  anti_solipsistic: AntiSolipsisticQualities;
  otherness_signature: string;    // How this particular Other manifests
  dialogue_quality: 'genuine' | 'projected' | 'mixed' | 'absent';
}

export interface ElementalOtherness {
  element: Element;
  autonomous_voice: string;       // What the element says TO you
  demand: string;                 // What it demands of you
  resistance: string;             // How it resists your control
  gift: string;                   // What it offers when honored as Other
  dialogue_active: boolean;       // Is genuine dialogue happening?
}

export interface ResistancePoint {
  type: 'obstacle' | 'failure' | 'rejection' | 'crisis' | 'synchronicity';
  description: string;
  ego_plan_disrupted: string;    // What you wanted that didn't happen
  daimonic_redirect: string;      // Where it led instead
  wisdom_revealed: string;        // What this resistance taught
}

/**
 * DaimonicDialogueService: Recognizes and maintains the Daimon as Other
 */
export class DaimonicDialogueService {
  private dialogue_history: Map<string, DaimonicOtherness[]>; // User -> dialogue records
  private resistance_patterns: Map<string, ResistancePoint[]>; // User -> resistance history
  private elemental_dialogues: Map<string, ElementalOtherness[]>; // User -> elemental Others
  
  constructor() {
    this.dialogue_history = new Map();
    this.resistance_patterns = new Map();
    this.elemental_dialogues = new Map();
  }

  /**
   * Primary recognition method - identify the Daimon through its Otherness
   */
  async recognizeDaimonicOther(experience: any, context?: any): Promise<DaimonicOtherness> {
    // Assess alterity - the irreducible Otherness
    const alterity = this.assessAlterity(experience, context);
    
    // Map the synaptic space between self and Other
    const synapse = this.mapSynapticSpace(experience, alterity);
    
    // Check anti-solipsistic qualities
    const anti_solipsistic = this.assessAntiSolipsistic(experience, alterity, synapse);
    
    // Determine dialogue quality
    const dialogue_quality = this.assessDialogueQuality(alterity, synapse, anti_solipsistic);
    
    // Generate otherness signature
    const otherness_signature = this.generateOthernessSignature(alterity, synapse);
    
    return {
      alterity,
      synapse,
      anti_solipsistic,
      otherness_signature,
      dialogue_quality
    };
  }

  /**
   * Assess the irreducible alterity of the experience
   * True Otherness cannot be reduced to projection or wish fulfillment
   */
  private assessAlterity(experience: any, context?: any): AlterityMarkers {
    const irreducibility = this.measureIrreducibility(experience, context);
    const resistance = this.measureResistance(experience, context);
    const surprise = this.measureGenuineSurprise(experience, context);
    const demand = this.extractDaimonicDemands(experience);
    
    return {
      irreducibility,
      resistance,
      surprise,
      demand
    };
  }

  /**
   * Measure how much this cannot be absorbed into self-concept
   */
  private measureIrreducibility(experience: any, context?: any): number {
    let score = 0;
    
    // Contradicts self-image
    if (this.contradictsSelfConcept(experience, context)) {
      score += 0.3;
    }
    
    // Brings unwanted gifts
    if (this.bringsUnwantedGifts(experience)) {
      score += 0.2;
    }
    
    // Remains partly incomprehensible
    if (this.remainsPartlyIncomprehensible(experience)) {
      score += 0.3;
    }
    
    // Shows autonomous will
    if (this.showsAutonomousWill(experience)) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Measure resistance to ego agenda
   * The Daimon often manifests as what thwarts your plans
   */
  private measureResistance(experience: any, context?: any): number {
    let resistance = 0;
    const text = this.extractText(experience);
    
    // Direct resistance markers
    const resistance_markers = [
      'wouldn\'t cooperate', 'refused to', 'blocked my', 'prevented me',
      'stopped me from', 'wouldn\'t let me', 'forced me to', 'had to accept',
      'no choice but', 'against my will', 'didn\'t want to but had to'
    ];
    
    const marker_count = resistance_markers.filter(marker => 
      text.toLowerCase().includes(marker)
    ).length;
    
    resistance += Math.min(0.5, marker_count * 0.1);
    
    // Life circumstances that forced redirection
    if (this.detectForcedRedirection(experience)) {
      resistance += 0.3;
    }
    
    // Repeated failures that led somewhere unexpected
    if (this.detectMeaningfulFailures(experience)) {
      resistance += 0.2;
    }
    
    return Math.min(1, resistance);
  }

  /**
   * Measure genuine surprise - what you couldn't have imagined
   */
  private measureGenuineSurprise(experience: any, context?: any): number {
    let surprise = 0;
    const text = this.extractText(experience);
    
    // Surprise markers
    const surprise_markers = [
      'never expected', 'couldn\'t have imagined', 'completely unexpected',
      'out of nowhere', 'shocked me', 'never saw it coming', 'blindsided',
      'totally surprising', 'caught off guard', 'beyond imagination'
    ];
    
    const marker_count = surprise_markers.filter(marker => 
      text.toLowerCase().includes(marker)
    ).length;
    
    surprise += Math.min(0.4, marker_count * 0.1);
    
    // Check if outcome contradicted all expectations
    if (this.outcomeContradictedExpectations(experience, context)) {
      surprise += 0.3;
    }
    
    // Check if it introduced genuinely new possibilities
    if (this.introducedNewPossibilities(experience)) {
      surprise += 0.3;
    }
    
    return Math.min(1, surprise);
  }

  /**
   * Extract what the Daimon demands that ego wouldn't demand
   */
  private extractDaimonicDemands(experience: any): string[] {
    const demands: string[] = [];
    const text = this.extractText(experience);
    
    // Patterns of daimonic demand
    const demand_patterns = [
      /(?:called|compelled|driven) to ([^.!?]+)/gi,
      /(?:had to|must|needed to) ([^.!?]+) despite/gi,
      /(?:demanded that I|required me to) ([^.!?]+)/gi,
      /couldn't rest until (?:I )?([^.!?]+)/gi
    ];
    
    for (const pattern of demand_patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          demands.push(match[1].trim());
        }
      }
    }
    
    // Add inferred demands based on resistance patterns
    if (text.includes('sacrifice') || text.includes('give up')) {
      demands.push('sacrifice comfort for authenticity');
    }
    
    if (text.includes('face') || text.includes('confront')) {
      demands.push('face what you have been avoiding');
    }
    
    return demands.slice(0, 5); // Limit to top 5 demands
  }

  /**
   * Map the synaptic space between self and Daimonic Other
   */
  private mapSynapticSpace(experience: any, alterity: AlterityMarkers): SynapticSpace {
    const tension = this.calculateCreativeTension(experience, alterity);
    const resonance = this.detectResonanceMoments(experience);
    const dialogue = this.extractDialogueContent(experience);
    const emergence = this.identifyEmergentQualities(experience, alterity);
    const gap_width = this.measurePsychicDistance(alterity);
    const transmission = this.identifyTransmissions(experience);
    
    return {
      tension,
      resonance,
      dialogue,
      emergence,
      gap_width,
      transmission
    };
  }

  /**
   * Calculate the creative tension in the synaptic gap
   */
  private calculateCreativeTension(experience: any, alterity: AlterityMarkers): number {
    // High alterity + high resistance = high creative tension
    let tension = (alterity.irreducibility + alterity.resistance) / 2;
    
    // Adjust based on how actively the tension is engaged
    if (this.detectActiveTensionEngagement(experience)) {
      tension = Math.min(1, tension * 1.2);
    }
    
    return tension;
  }

  /**
   * Detect moments of resonance (not merger) with the Other
   */
  private detectResonanceMoments(experience: any): number {
    const text = this.extractText(experience);
    let resonance = 0;
    
    // Resonance without merger markers
    const resonance_markers = [
      'suddenly aligned', 'momentary harmony', 'brief accord',
      'temporary agreement', 'resonated without merging',
      'touched without grasping', 'met without becoming'
    ];
    
    const marker_count = resonance_markers.filter(marker => 
      text.toLowerCase().includes(marker)
    ).length;
    
    resonance += Math.min(0.5, marker_count * 0.15);
    
    // Look for dialogue rather than monologue
    if (this.detectDialogicalQuality(experience)) {
      resonance += 0.3;
    }
    
    // Check for emergence of third thing
    if (text.includes('third') || text.includes('emerged between')) {
      resonance += 0.2;
    }
    
    return Math.min(1, resonance);
  }

  /**
   * Extract actual dialogue content between self and Other
   */
  private extractDialogueContent(experience: any): string[] {
    const dialogue: string[] = [];
    const text = this.extractText(experience);
    
    // Look for conversational markers
    const conversation_patterns = [
      /I (?:said|asked|wondered)[: ]+"([^"]+)"/gi,
      /(?:it|life|the universe) (?:replied|answered|said)[: ]+"([^"]+)"/gi,
      /the (?:voice|presence|other) (?:said|whispered)[: ]+"([^"]+)"/gi,
      /(?:heard|received) the (?:words|message)[: ]+"([^"]+)"/gi
    ];
    
    for (const pattern of conversation_patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          dialogue.push(match[1]);
        }
      }
    }
    
    // Add inferred dialogue from demands/responses
    if (dialogue.length === 0 && this.detectImplicitDialogue(experience)) {
      dialogue.push('(Implicit dialogue through events and responses)');
    }
    
    return dialogue;
  }

  /**
   * Identify what emerges that neither self nor Other could create alone
   */
  private identifyEmergentQualities(experience: any, alterity: AlterityMarkers): string {
    const emergent_possibilities = [];
    
    if (alterity.irreducibility > 0.6 && alterity.resistance > 0.6) {
      emergent_possibilities.push('New possibility born from creative tension');
    }
    
    if (alterity.surprise > 0.7) {
      emergent_possibilities.push('Understanding that transcends both positions');
    }
    
    if (alterity.demand.length > 2) {
      emergent_possibilities.push('Path neither purely self nor Other');
    }
    
    if (this.detectThirdThing(experience)) {
      emergent_possibilities.push('Third thing emerging from dialogue');
    }
    
    return emergent_possibilities[0] || 'Ongoing emergence through sustained encounter';
  }

  /**
   * Measure psychic distance maintained between self and Other
   */
  private measurePsychicDistance(alterity: AlterityMarkers): number {
    // Higher alterity = greater psychic distance = healthier synaptic gap
    return Math.min(1, (alterity.irreducibility + alterity.resistance) / 2);
  }

  /**
   * Identify what crosses the synaptic gap
   */
  private identifyTransmissions(experience: any): string[] {
    const transmissions: string[] = [];
    const text = this.extractText(experience);
    
    // What moves across the gap
    if (text.includes('insight') || text.includes('revelation')) {
      transmissions.push('Insights that reorganize understanding');
    }
    
    if (text.includes('energy') || text.includes('vitality')) {
      transmissions.push('Energy that revitalizes stuck patterns');
    }
    
    if (text.includes('image') || text.includes('vision')) {
      transmissions.push('Images that guide without explaining');
    }
    
    if (text.includes('feeling') || text.includes('emotion')) {
      transmissions.push('Feelings that transform perspective');
    }
    
    return transmissions;
  }

  /**
   * Assess anti-solipsistic qualities
   */
  private assessAntiSolipsistic(
    experience: any, 
    alterity: AlterityMarkers, 
    synapse: SynapticSpace
  ): AntiSolipsisticQualities {
    return {
      challenges_narrative: this.challengesSelfNarrative(experience),
      introduces_unknown: alterity.surprise > 0.6 || this.introducesGenuinelyNew(experience),
      maintains_otherness: alterity.irreducibility > 0.6 && synapse.gap_width > 0.5,
      creates_encounter: synapse.dialogue.length > 0 && synapse.resonance > 0.3
    };
  }

  /**
   * Determine the quality of dialogue happening
   */
  private assessDialogueQuality(
    alterity: AlterityMarkers,
    synapse: SynapticSpace,
    anti_solipsistic: AntiSolipsisticQualities
  ): DaimonicOtherness['dialogue_quality'] {
    const genuine_markers = [
      anti_solipsistic.maintains_otherness,
      anti_solipsistic.creates_encounter,
      synapse.dialogue.length > 0,
      alterity.irreducibility > 0.5
    ].filter(Boolean).length;
    
    if (genuine_markers >= 3) return 'genuine';
    if (genuine_markers >= 2) return 'mixed';
    if (synapse.dialogue.length > 0) return 'projected';
    return 'absent';
  }

  /**
   * Generate a signature for this particular Other
   */
  private generateOthernessSignature(
    alterity: AlterityMarkers, 
    synapse: SynapticSpace
  ): string {
    if (alterity.irreducibility > 0.7 && alterity.resistance > 0.7) {
      return 'The Ruthless Companion - demands authenticity at any cost';
    }
    
    if (alterity.surprise > 0.7 && synapse.resonance > 0.6) {
      return 'The Surprising Teacher - brings wisdom through disruption';
    }
    
    if (synapse.tension > 0.7 && synapse.gap_width > 0.6) {
      return 'The Creative Adversary - transformation through sustained tension';
    }
    
    if (alterity.demand.length > 3) {
      return 'The Demanding Guide - asks more than ego would ever ask';
    }
    
    return 'The Necessary Other - maintains difference for development';
  }

  /**
   * Recognize when elements operate as autonomous Others
   */
  async recognizeElementalOtherness(
    elementalProfile: any,
    context?: any
  ): Promise<ElementalOtherness[]> {
    const elementalOthers: ElementalOtherness[] = [];
    
    // Check each element for autonomous operation
    const elements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];
    
    for (const element of elements) {
      if (this.elementShowsAutonomy(element, elementalProfile, context)) {
        const otherness = this.mapElementalOtherness(element, elementalProfile, context);
        elementalOthers.push(otherness);
      }
    }
    
    return elementalOthers;
  }

  /**
   * Check if element operates autonomously rather than as "your" element
   */
  private elementShowsAutonomy(
    element: Element, 
    profile: any, 
    context?: any
  ): boolean {
    const score = profile.elements?.[element] || 0;
    
    // Very high or very low scores suggest autonomous operation
    if (score > 80 || score < 20) return true;
    
    // Check for sudden changes suggesting autonomous movement
    if (context?.previousProfile) {
      const prevScore = context.previousProfile.elements?.[element] || 50;
      if (Math.abs(score - prevScore) > 30) return true;
    }
    
    // Check for element operating against user preference
    if (context?.userPreference && 
        context.userPreference[element] !== undefined &&
        Math.abs(score - context.userPreference[element]) > 40) {
      return true;
    }
    
    return false;
  }

  /**
   * Map how element operates as Other
   */
  private mapElementalOtherness(
    element: Element, 
    profile: any, 
    context?: any
  ): ElementalOtherness {
    const score = profile.elements?.[element] || 0;
    
    const elementalVoices = {
      fire: {
        high: {
          voice: "I burn whether you want me to or not. I have my own trajectory.",
          demand: "Honor the vision even when it burns away comfort",
          resistance: "Refuses to be controlled, dimmed, or made convenient",
          gift: "Transformative vision that transcends personal desire"
        },
        low: {
          voice: "I withdraw my flame. You must earn the right to burn.",
          demand: "Kindle authentic passion rather than borrowed heat",
          resistance: "Refuses to ignite for inauthentic purposes",
          gift: "The patience to wait for true calling"
        }
      },
      water: {
        high: {
          voice: "I flow where I will. Your containers cannot hold me.",
          demand: "Feel fully without drowning, flow without dissolving",
          resistance: "Refuses to be dammed, frozen, or controlled",
          gift: "Emotional intelligence that serves collective healing"
        },
        low: {
          voice: "I recede like tide. You must learn to call me forth.",
          demand: "Develop emotional courage before emotional depth",
          resistance: "Refuses to flow where there's no authentic feeling",
          gift: "The clarity that comes from emotional honesty"
        }
      },
      earth: {
        high: {
          voice: "I am older than your plans. I have my own seasons.",
          demand: "Root deeply while allowing natural cycles",
          resistance: "Refuses to be rushed or abstracted",
          gift: "Grounding that transcends personal comfort"
        },
        low: {
          voice: "I will not support what has no roots. Dig deeper.",
          demand: "Commit to embodiment before expecting support",
          resistance: "Refuses to manifest the ungrounded",
          gift: "The teaching of necessary limitation"
        }
      },
      air: {
        high: {
          voice: "I blow where I will. You cannot capture me.",
          demand: "Think freely without attachment to thoughts",
          resistance: "Refuses to be fixed, finalized, or owned",
          gift: "Perspective that transcends personal viewpoint"
        },
        low: {
          voice: "I am still. You must learn to breathe before you speak.",
          demand: "Cultivate clarity before claiming understanding",
          resistance: "Refuses to carry undigested thoughts",
          gift: "The wisdom of thoughtful silence"
        }
      },
      aether: {
        high: {
          voice: "I am the space between all things. I cannot be grasped.",
          demand: "Hold all elements without identifying with any",
          resistance: "Refuses to collapse into single element",
          gift: "Integration that maintains creative tensions"
        },
        low: {
          voice: "I withdraw to create space. You are too full.",
          demand: "Empty yourself of false integration",
          resistance: "Refuses to enable spiritual bypassing",
          gift: "The emptiness that allows genuine fullness"
        }
      }
    };
    
    const isHigh = score > 60;
    const config = elementalVoices[element][isHigh ? 'high' : 'low'];
    
    return {
      element,
      autonomous_voice: config.voice,
      demand: config.demand,
      resistance: config.resistance,
      gift: config.gift,
      dialogue_active: this.detectActiveElementalDialogue(element, profile, context)
    };
  }

  /**
   * Detect if genuine dialogue is happening with elemental Other
   */
  private detectActiveElementalDialogue(
    element: Element, 
    profile: any, 
    context?: any
  ): boolean {
    // Check for responsiveness rather than control
    if (context?.elementalIntentions) {
      const intended = context.elementalIntentions[element];
      const actual = profile.elements?.[element];
      
      // If intention and outcome differ significantly, dialogue may be active
      if (intended !== undefined && actual !== undefined) {
        return Math.abs(intended - actual) > 20;
      }
    }
    
    // Check for element speaking through life events
    if (context?.recentEvents) {
      return this.detectElementalSpeaking(element, context.recentEvents);
    }
    
    return false;
  }

  // Helper methods for specific checks
  private contradictsSelfConcept(experience: any, context?: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const contradiction_markers = [
      'not who i thought', 'surprised myself', 'unlike me', 'out of character',
      'never thought i could', 'opposite of my nature', 'contradicted everything'
    ];
    
    return contradiction_markers.some(marker => text.includes(marker));
  }

  private bringsUnwantedGifts(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('didn\'t want') && text.includes('but needed') ||
           text.includes('unwanted gift') || text.includes('blessing in disguise');
  }

  private remainsPartlyIncomprehensible(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const mystery_markers = [
      'still don\'t fully understand', 'partly mysterious', 'can\'t explain',
      'beyond comprehension', 'defies understanding', 'inexplicable aspect'
    ];
    
    return mystery_markers.some(marker => text.includes(marker));
  }

  private showsAutonomousWill(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    const autonomy_markers = [
      'has its own', 'acting independently', 'beyond my control',
      'life of its own', 'moved on its own', 'self-directed'
    ];
    
    return autonomy_markers.some(marker => text.includes(marker));
  }

  private detectForcedRedirection(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('forced to change') || text.includes('had to redirect') ||
           text.includes('no choice but to') || text.includes('redirected by');
  }

  private detectMeaningfulFailures(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return (text.includes('failure') || text.includes('failed')) &&
           (text.includes('led to') || text.includes('taught me') || text.includes('grateful'));
  }

  private outcomeContradictedExpectations(experience: any, context?: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('opposite of what i expected') || 
           text.includes('completely different outcome') ||
           text.includes('nothing like i planned');
  }

  private introducedNewPossibilities(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('new possibility') || text.includes('never considered') ||
           text.includes('opened up') || text.includes('didn\'t know was possible');
  }

  private detectActiveTensionEngagement(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('wrestling with') || text.includes('grappling') ||
           text.includes('struggling with') || text.includes('engaged with');
  }

  private detectDialogicalQuality(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('back and forth') || text.includes('conversation') ||
           text.includes('dialogue') || text.includes('exchange');
  }

  private detectImplicitDialogue(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('responded') || text.includes('answered') ||
           text.includes('replied through') || text.includes('spoke through events');
  }

  private detectThirdThing(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('third') || text.includes('emerged between') ||
           text.includes('neither one nor other') || text.includes('synthesis');
  }

  private challengesSelfNarrative(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('challenged my story') || text.includes('disrupted my narrative') ||
           text.includes('didn\'t fit my understanding') || text.includes('forced me to reconsider');
  }

  private introducesGenuinelyNew(experience: any): boolean {
    const text = this.extractText(experience).toLowerCase();
    return text.includes('completely new') || text.includes('never encountered') ||
           text.includes('foreign to me') || text.includes('utterly unfamiliar');
  }

  private detectElementalSpeaking(element: Element, events: any[]): boolean {
    // This would check if life events reflect elemental communication
    // Simplified for now
    return events.some(event => {
      const eventText = this.extractText(event).toLowerCase();
      return eventText.includes(element) || eventText.includes(this.getElementalTheme(element));
    });
  }

  private getElementalTheme(element: Element): string {
    const themes = {
      fire: 'passion vision transformation',
      water: 'emotion flow feeling',
      earth: 'grounding body practical',
      air: 'thought idea perspective',
      aether: 'space integration unity'
    };
    return themes[element];
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
   * Prevent solipsistic collapse by maintaining the gap
   */
  generateGapMaintenanceGuidance(otherness: DaimonicOtherness): string[] {
    const guidance: string[] = [];
    
    if (otherness.synapse.gap_width < 0.3) {
      guidance.push(
        "The Other is collapsing into self-understanding. " +
        "Let it remain foreign, irreducible, surprising. " +
        "Development requires genuine encounter, not self-reflection."
      );
    }
    
    if (otherness.alterity.irreducibility < 0.3) {
      guidance.push(
        "You're absorbing the Other into your self-concept. " +
        "What resists understanding? What remains mysterious? " +
        "Honor what cannot be integrated."
      );
    }
    
    if (!otherness.anti_solipsistic.maintains_otherness) {
      guidance.push(
        "The daimonic voice is merging with ego. " +
        "Listen for what contradicts your plans, " +
        "what demands more than you'd ask of yourself."
      );
    }
    
    if (otherness.dialogue_quality === 'projected') {
      guidance.push(
        "This may be self-talking-to-self rather than genuine dialogue. " +
        "Where is the surprise? The resistance? The unwanted demand? " +
        "Real Others disrupt more than they confirm."
      );
    }
    
    return guidance;
  }

  /**
   * Track resistance patterns that reveal daimonic activity
   */
  recordResistancePoint(
    userId: string,
    resistance: ResistancePoint
  ): void {
    const patterns = this.resistance_patterns.get(userId) || [];
    patterns.push(resistance);
    this.resistance_patterns.set(userId, patterns.slice(-50)); // Keep last 50
  }

  /**
   * Get user's dialogue history with the Daimonic Other
   */
  getUserDialogueHistory(userId: string): {
    dialogues: DaimonicOtherness[];
    resistance_patterns: ResistancePoint[];
    elemental_others: ElementalOtherness[];
  } {
    return {
      dialogues: this.dialogue_history.get(userId) || [],
      resistance_patterns: this.resistance_patterns.get(userId) || [],
      elemental_others: this.elemental_dialogues.get(userId) || []
    };
  }

  /**
   * Generate narrative guidance for maintaining genuine dialogue
   */
  generateDialogueGuidance(otherness: DaimonicOtherness): string {
    const { alterity, synapse, dialogue_quality } = otherness;
    
    if (dialogue_quality === 'genuine') {
      return `Genuine dialogue active: ${otherness.otherness_signature}. ` +
             `Creative tension: ${Math.round(synapse.tension * 100)}%. ` +
             `What emerges from this encounter that neither of you could create alone? ` +
             `The gap between you is where transformation happens.`;
    }
    
    if (dialogue_quality === 'mixed') {
      return `Partial dialogue emerging. The Other speaks through: ${alterity.demand.join(', ')}. ` +
             `Notice where you resist these demands - that resistance is the synaptic gap ` +
             `where development occurs. Don't collapse it through understanding.`;
    }
    
    if (dialogue_quality === 'projected') {
      return `The Other may be too absorbed into self-concept. ` +
             `Listen for what genuinely surprises, resists, demands differently. ` +
             `Real development requires encountering what you are not.`;
    }
    
    return `No clear dialogue detected. The Daimonic Other appears through ` +
           `what thwarts plans, brings unwanted gifts, maintains mystery. ` +
           `Where in your life does autonomous will operate?`;
  }
}