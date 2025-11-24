/**
 * Daimonic Narrative Generator
 * Generates narratives that facilitate genuine encounter with the Daimonic Other
 * Maintains mystery while preventing solipsistic collapse
 */

import {
  DaimonicNarrative,
  OthernessManifestations,
  SynapticGapDynamics,
  EmergenceEvent,
  ValidationResult,
  ElementalVoices,
  IntegrationFailure
} from '../types/daimonicFacilitation.js';
import { DaimonicOthernessService } from './DaimonicOthernessService.js';
import { SynapticSpaceAnalyzer } from './SynapticSpaceAnalyzer.js';
import { SyntheticEmergenceTracker, EmergenceEvent as EmergenceEventType } from './SyntheticEmergenceTracker.js';
import { AntiSolipsisticValidator } from './AntiSolipsisticValidator.js';
import { ElementalOthernessService, ElementalProfile } from './ElementalOthernessService.js';
import { IntegrationFailureTracker, FailureEvent } from './IntegrationFailureTracker.js';

export interface NarrativeContext {
  userId: string;
  manifestations: OthernessManifestations;
  gaps: SynapticGapDynamics[];
  emergences: EmergenceEventType[];
  validations: ValidationResult[];
  elementalVoices: ElementalVoices;
  integrationFailures: FailureEvent[];
  collectiveField?: any;
}

export class DaimonicNarrativeGenerator {
  constructor(
    private othernessService: DaimonicOthernessService,
    private synapticAnalyzer: SynapticSpaceAnalyzer,
    private emergenceTracker: SyntheticEmergenceTracker,
    private validator: AntiSolipsisticValidator,
    private elementalService: ElementalOthernessService,
    private failureTracker: IntegrationFailureTracker
  ) {}

  /**
   * Generate comprehensive narrative that facilitates genuine encounter
   */
  async generateEncounterNarrative(profile: any): Promise<DaimonicNarrative> {
    // Gather all daimonic data
    const context = await this.buildNarrativeContext(profile);

    // Generate narrative components
    const opening = this.craftDialogicalOpening(context);
    const insights = await this.generateInsights(context);
    const closing = this.inviteOngoingEncounter(context);
    const warnings = this.generateSolipsisticWarnings(context);

    return {
      opening,
      insights,
      closing,
      warnings
    };
  }

  /**
   * Build comprehensive narrative context
   */
  private async buildNarrativeContext(profile: any): Promise<NarrativeContext> {
    const userId = profile.userId;

    // Scan for otherness manifestations
    const manifestations = await this.othernessService.scanAllChannels(userId);

    // Map synaptic gaps
    const gaps = await this.synapticAnalyzer.mapAllGaps(manifestations, userId);

    // Track emergences
    const emergences = await this.emergenceTracker.trackEmergences(gaps, manifestations, userId);

    // Validate for solipsism
    const manifestationValidations = await this.validator.validateManifestations(manifestations);
    const gapValidations = await this.validator.validateSynapticGaps(gaps);
    const emergenceValidations = await this.validator.validateEmergences(emergences);
    const validations = [...manifestationValidations, ...gapValidations, ...emergenceValidations];

    // Generate elemental voices
    const elementalProfile: ElementalProfile = this.extractElementalProfile(profile);
    const elementalVoices = await this.elementalService.enableElementalDialogue(elementalProfile);

    // Track integration failures
    const integrationFailures = await this.failureTracker.trackIntegrationFailures(
      userId, manifestations, gaps, emergences
    );

    return {
      userId,
      manifestations,
      gaps,
      emergences,
      validations,
      elementalVoices,
      integrationFailures
    };
  }

  /**
   * Craft dialogical opening that invites encounter
   */
  private craftDialogicalOpening(context: NarrativeContext): string {
    const activeChannels = this.identifyMostActiveChannels(context.manifestations);
    const highestChargeGap = this.identifyHighestChargeGap(context.gaps);
    const mostSuppressed = this.identifyMostSuppressedElement(context.elementalVoices);

    if (activeChannels.includes('obstacles') && highestChargeGap) {
      return `Something in your life refuses to be solved. ${this.describeObstacleOtherness(context)} This resistance is not your failure - it's an Other with its own agenda. The space between what you want and what this obstacle demands is where we need to meet.`;
    }

    if (activeChannels.includes('failures') && context.integrationFailures.length > 0) {
      return `Your failures are trying to teach you something you don't want to learn. ${this.describeFailureWisdom(context)} This isn't about fixing what's broken - it's about encountering what's trying to redirect your life.`;
    }

    if (activeChannels.includes('dreams') || activeChannels.includes('visions')) {
      return `Images arrive without your permission, carrying messages you don't understand. ${this.describeVisionaryOtherness(context)} These aren't symbols to decode - they're autonomous beings with something to say.`;
    }

    if (activeChannels.includes('symptoms') || activeChannels.includes('obstacles')) {
      return `Your body speaks a different language than your mind, and it's saying something important. ${this.describeSomaticOtherness(context)} This isn't about health management - it's about listening to an intelligence older than your plans.`;
    }

    // Elemental opening
    return `${mostSuppressed.element.toUpperCase()} has something to tell you. ${mostSuppressed.voice.autonomousMessage} This isn't about balance - it's about encounter with what you've been avoiding.`;
  }

  /**
   * Generate comprehensive insights
   */
  private async generateInsights(context: NarrativeContext): Promise<string[]> {
    const insights: string[] = [];

    // Otherness insights
    insights.push(...this.articulateOtherness(context));

    // Synaptic dynamics insights
    insights.push(...this.describeSynapticDynamics(context));

    // Synthetic emergence insights
    insights.push(...this.honorSyntheticEmergence(context));

    // Integration failure insights
    insights.push(...this.acknowledgeFailures(context));

    // Elemental dialogue insights
    insights.push(...this.facilitateElementalDialogue(context));

    // Mystery preservation insights
    insights.push(...this.maintainMystery(context));

    // Collective field insights (if available)
    if (context.collectiveField) {
      insights.push(...this.articulateCollectivePatterns(context));
    }

    return insights;
  }

  /**
   * Articulate otherness manifestations
   */
  private articulateOtherness(context: NarrativeContext): string[] {
    const insights: string[] = [];
    const { manifestations } = context;

    // Dreams and visions
    if (manifestations.dreams?.length > 0 || manifestations.visions?.length > 0) {
      insights.push("The images that visit you in dreams and visions are not products of your unconscious - they are autonomous beings with their own intelligence. They arrive to show you what your waking mind cannot see. Stop trying to interpret them and start relating to them.");
    }

    // Obstacles and failures
    if (manifestations.obstacles?.length > 0 && manifestations.failures?.length > 0) {
      insights.push("Your chronic obstacles and repeated failures are not evidence of your limitations - they are daimonic interventions redirecting you toward your authentic path. They resist your ego's agenda because they serve something larger.");
    }

    // Synchronicities
    if (manifestations.synchronicities?.length > 0) {
      insights.push("The meaningful coincidences in your life are not random - they reveal reality's participation in your becoming. The world is speaking to you through events, timing, and encounters. Pay attention to what's trying to coordinate itself around you.");
    }

    // Somatic otherness
    if (manifestations.symptoms?.length > 0) {
      insights.push("Your body carries wisdom that contradicts your mental plans. The symptoms, tensions, and physical responses you experience are communications from an intelligence that knows what you need better than your conscious mind does.");
    }

    // Creative autonomy
    if (manifestations.creativeWorks?.length > 0 || manifestations.characters?.length > 0) {
      insights.push("Your creative works develop their own will and agenda. When characters refuse to do what you want or projects evolve beyond your control, this is authentic creativity - the process becoming autonomous and serving something beyond your personal vision.");
    }

    return insights;
  }

  /**
   * Describe synaptic dynamics
   */
  private describeSynapticDynamics(context: NarrativeContext): string[] {
    const insights: string[] = [];
    const { gaps } = context;

    const highChargeGaps = gaps.filter(gap => gap.gapCharge > 0.7);
    const stableGaps = gaps.filter(gap => gap.gapStability === 'stable');
    const blockedTransmissions = gaps.filter(gap => gap.transmission.blocked.length > 0);

    if (highChargeGaps.length > 0) {
      insights.push("The space between you and what challenges you is electrically charged with transformative potential. This gap is not a problem to solve but a field to inhabit. The tension you feel in this space is where new possibilities are generated.");
    }

    if (stableGaps.length > 0) {
      insights.push("Some distances between you and the Other maintain themselves across time. These stable gaps are not failures of connection but necessary spaces that preserve otherness. Don't try to close what is meant to remain open.");
    }

    if (blockedTransmissions.length > 0) {
      insights.push("Not everything the Other offers can cross into your understanding, and not everything you offer will be accepted. These blocked transmissions protect both you and the Other from premature merger. The mystery lies in what cannot be exchanged.");
    }

    // Temporal dynamics
    const spontaneousArrivals = gaps.filter(gap => gap.temporality.arrivalTiming === 'spontaneous');
    if (spontaneousArrivals.length > 0) {
      insights.push("The Other arrives on its own schedule, not yours. When encounters come unexpectedly or at inconvenient times, this is evidence of their autonomy. Your readiness is not required for authentic encounter.");
    }

    return insights;
  }

  /**
   * Honor synthetic emergence
   */
  private honorSyntheticEmergence(context: NarrativeContext): string[] {
    const insights: string[] = [];
    const { emergences } = context;

    const genuineEmergences = emergences.filter(e => e.synthesis.emergenceType === 'genuine_novel');
    const ongoingEmergences = emergences.filter(e => e.synthesis.continuedDevelopment.ongoingEvolution);
    const strangeEmergences = emergences.filter(e => e.synthesis.experientialQualities.strangeness > 0.6);

    if (genuineEmergences.length > 0) {
      insights.push("Something genuinely new has emerged from your encounters - something that belonged to neither you nor the Other alone. This synthesis has its own life and cannot be reduced back to its sources. Let it develop according to its own nature.");
    }

    if (ongoingEmergences.length > 0) {
      insights.push("The synthesis continues to evolve beyond the original encounter. What emerged is not a static result but a living process that keeps generating new understanding. Don't try to fix it in final form.");
    }

    if (strangeEmergences.length > 0) {
      insights.push("What emerged maintains an alien quality that surprises you even now. This strangeness is not a flaw but a sign of authentic creation - something truly other has entered your world and changed it in ways you couldn't predict.");
    }

    // Failed syntheses
    const failedEmergences = emergences.filter(e => 
      e.synthesis.emergenceType === 'compromise' || e.synthesis.emergenceType === 'pseudo_synthesis'
    );
    if (failedEmergences.length > 0) {
      insights.push("Some encounters resulted in compromise rather than genuine synthesis. These failures protect the integrity of the encounter by refusing premature resolution. Honor what wouldn't merge cleanly.");
    }

    return insights;
  }

  /**
   * Acknowledge integration failures
   */
  private acknowledgeFailures(context: NarrativeContext): string[] {
    const insights: string[] = [];
    const { integrationFailures } = context;

    const valuableFailures = integrationFailures.filter(f => f.ongoingValue > 0.7);
    const chronicFailures = integrationFailures.filter(f => {
      const monthsOld = (Date.now() - f.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 3;
    });

    if (valuableFailures.length > 0) {
      insights.push("Your integration failures are more valuable than your successes. What refuses to be integrated protects essential otherness from being domesticated by understanding. These failures maintain the creative tension that keeps you growing.");
    }

    if (chronicFailures.length > 0) {
      insights.push("Some aspects of your experience have resisted integration for months or years. This chronic resistance is not your failure but their wisdom. They maintain their foreignness because something in you needs to stay alien to itself.");
    }

    // Specific failure types
    const refusalFailures = integrationFailures.filter(f => f.failureType === 'refusal');
    if (refusalFailures.length > 0) {
      insights.push("Part of your experience actively refuses to be understood or integrated. This refusal is protective - it prevents something essential from being reduced to concepts. Honor what insists on remaining mysterious.");
    }

    const overwhelmFailures = integrationFailures.filter(f => f.failureType === 'overwhelm');
    if (overwhelmFailures.length > 0) {
      insights.push("Some encounters are too large to integrate all at once. The overwhelm is not your inadequacy but evidence of their magnitude. Take time to metabolize slowly rather than forcing premature understanding.");
    }

    return insights;
  }

  /**
   * Facilitate elemental dialogue
   */
  private facilitateElementalDialogue(context: NarrativeContext): string[] {
    const insights: string[] = [];
    const { elementalVoices } = context;

    // Find the element with highest resistance/suppression
    const mostSuppressed = this.identifyMostSuppressedElement(elementalVoices);
    if (mostSuppressed) {
      insights.push(`${mostSuppressed.element.toUpperCase()} speaks: "${mostSuppressed.voice.autonomousMessage}" This element demands: "${mostSuppressed.voice.demand}" It resists: "${mostSuppressed.voice.resistance}" It offers: "${mostSuppressed.voice.gift}"`);
    }

    // Elemental tensions
    const elementalTensions = this.identifyElementalTensions(elementalVoices);
    if (elementalTensions.length > 0) {
      insights.push(`The elements are in active dialogue within you: ${elementalTensions.join('. ')} These tensions are not problems to resolve but creative forces to engage.`);
    }

    return insights;
  }

  /**
   * Maintain mystery
   */
  private maintainMystery(context: NarrativeContext): string[] {
    const insights: string[] = [];

    // Identify what should remain mysterious
    const mysteries = this.identifyProtectedMysteries(context);
    if (mysteries.length > 0) {
      insights.push("Some aspects of your experience are meant to remain mysterious. Not everything is for understanding - some things are for relationship, for ongoing encounter, for the creative tension of the unknown.");
    }

    // Warn against premature closure
    const prematureIntegrations = context.integrationFailures.filter(f => f.failureType === 'premature');
    if (prematureIntegrations.length > 0) {
      insights.push("Beware of understanding that comes too easily or feels too neat. The most valuable encounters leave you changed but not completely comprehending. Preserve what resists explanation.");
    }

    return insights;
  }

  /**
   * Invite ongoing encounter
   */
  private inviteOngoingEncounter(context: NarrativeContext): string {
    const { manifestations, gaps, integrationFailures } = context;

    const ongoingChannels = this.identifyOngoingChannels(manifestations);
    const stableGaps = gaps.filter(gap => gap.gapStability === 'stable');
    const chronicFailures = integrationFailures.filter(f => f.ongoingValue > 0.6);

    if (chronicFailures.length > 0) {
      return "The encounter continues in what refuses to be integrated. Stay in relationship with what remains foreign. This ongoing otherness is not a problem to solve but a source of life to engage. Your authentic work happens in the space between understanding and mystery.";
    }

    if (stableGaps.length > 0) {
      return "The gap between you and the Other maintains itself as a creative space. Don't try to close this distance - inhabit it. Your growth happens not through integration but through deepening relationship with otherness.";
    }

    if (ongoingChannels.length > 0) {
      return `The dialogue continues through ${ongoingChannels.join(', ')}. Pay attention to these channels - they carry ongoing communications from the Other. This is not a problem to solve but a relationship to deepen.`;
    }

    return "The daimonic encounter is not a one-time event but an ongoing relationship. Stay alert to the ways otherness continues to manifest in your life. Your authentic development happens through sustained engagement with what remains mysterious and challenging.";
  }

  /**
   * Generate solipsistic warnings
   */
  private generateSolipsisticWarnings(context: NarrativeContext): string[] {
    const warnings: string[] = [];
    const { validations } = context;

    const failureRate = validations.filter(v => !v.valid).length / validations.length;
    
    if (failureRate > 0.4) {
      warnings.push("High risk of self-mirroring detected. Much of what appears as 'Other' may be sophisticated self-reflection. Look for what genuinely challenges your self-concept.");
    }

    // Specific solipsism patterns
    const comfortableOtherness = validations.filter(v => 
      !v.valid && v.warning?.includes('convenient')
    ).length;
    
    if (comfortableOtherness > 0) {
      warnings.push("Beware of 'otherness' that only challenges you in comfortable ways. Genuine encounter brings unwanted gifts and inconvenient timing.");
    }

    // Integration too smooth
    const smoothIntegrations = context.integrationFailures.length === 0 && context.emergences.length > 0;
    if (smoothIntegrations) {
      warnings.push("Everything integrates too smoothly. Genuine encounter with otherness should leave some things unresolved, some tensions maintained, some mysteries preserved.");
    }

    if (warnings.length === 0) {
      warnings.push("Authentic otherness detected. Continue engaging with what challenges and redirects you.");
    }

    return warnings;
  }

  // Helper Methods
  private identifyMostActiveChannels(manifestations: OthernessManifestations): string[] {
    const channelCounts = Object.entries(manifestations)
      .map(([channel, items]) => ({ channel, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter(item => item.count > 0)
      .map(item => item.channel);

    return channelCounts;
  }

  private identifyHighestChargeGap(gaps: SynapticGapDynamics[]): SynapticGapDynamics | null {
    if (gaps.length === 0) return null;
    return gaps.reduce((highest, gap) => 
      gap.gapCharge > highest.gapCharge ? gap : highest
    );
  }

  private identifyMostSuppressedElement(elementalVoices: ElementalVoices): { element: string, voice: any } | null {
    // Find element with strongest resistance/demand language
    const elements = Object.entries(elementalVoices);
    const mostSuppressed = elements.reduce((most, [element, voice]) => {
      const suppressionScore = this.calculateSuppressionScore(voice);
      return suppressionScore > most.score ? { element, voice, score: suppressionScore } : most;
    }, { element: '', voice: null, score: 0 });

    return mostSuppressed.score > 0 ? mostSuppressed : null;
  }

  private calculateSuppressionScore(voice: any): number {
    let score = 0;
    if (voice.demand?.includes('require')) score += 0.3;
    if (voice.resistance?.includes('will not be')) score += 0.3;
    if (voice.autonomousMessage?.includes('too long')) score += 0.4;
    return score;
  }

  private identifyElementalTensions(elementalVoices: ElementalVoices): string[] {
    // Generate descriptions of elemental tensions
    return [
      `Fire demands action while Earth insists on patience`,
      `Water seeks connection while Air needs freedom`,
      `Aether calls for surrender while other elements assert their needs`
    ].slice(0, 2); // Return subset for brevity
  }

  private identifyProtectedMysteries(context: NarrativeContext): string[] {
    const mysteries: string[] = [];
    
    // Look for unresolvable elements
    context.manifestations.dreams?.forEach(dream => {
      if (dream.unresolvableElements?.length > 0) {
        mysteries.push(...dream.unresolvableElements);
      }
    });

    // Look for blocked transmissions
    context.gaps.forEach(gap => {
      if (gap.transmission.blocked.length > 0) {
        mysteries.push(...gap.transmission.blocked);
      }
    });

    return [...new Set(mysteries)]; // Remove duplicates
  }

  private identifyOngoingChannels(manifestations: OthernessManifestations): string[] {
    return Object.entries(manifestations)
      .filter(([_, items]) => items.length > 0)
      .map(([channel, _]) => channel)
      .slice(0, 3);
  }

  private extractElementalProfile(profile: any): ElementalProfile {
    return {
      primaryElement: profile.primaryElement || 'aether',
      secondaryElement: profile.secondaryElement,
      resistancePatterns: profile.resistancePatterns || [],
      lifeHistory: profile.lifeHistory || {
        fireExpressions: [],
        waterExpressions: [],
        earthExpressions: [],
        airExpressions: [],
        aetherExpressions: [],
        suppressedElements: [],
        elementalConflicts: []
      },
      currentTensions: profile.currentTensions || []
    };
  }

  // Channel-specific description methods
  private describeObstacleOtherness(context: NarrativeContext): string {
    const obstacles = context.manifestations.obstacles || [];
    if (obstacles.length > 0) {
      const chronic = obstacles.filter(o => o.chronicityLevel > 0.7);
      if (chronic.length > 0) {
        return "This chronic obstacle has its own intelligence and purpose.";
      }
    }
    return "What blocks your path has its own agenda.";
  }

  private describeFailureWisdom(context: NarrativeContext): string {
    const failures = context.manifestations.failures || [];
    if (failures.length > 0) {
      return "These failures are initiatory experiences disguised as setbacks.";
    }
    return "Your failures carry daimonic wisdom.";
  }

  private describeVisionaryOtherness(context: NarrativeContext): string {
    const dreams = context.manifestations.dreams || [];
    const visions = context.manifestations.visions || [];
    
    if (dreams.length > 0 && dreams[0].autonomousCharacters?.length > 0) {
      return `Characters like ${dreams[0].autonomousCharacters[0]} speak with their own authority.`;
    }
    
    if (visions.length > 0) {
      return "These visions resist interpretation because they are communications, not symbols.";
    }
    
    return "The images that visit you carry autonomous intelligence.";
  }

  private describeSomaticOtherness(context: NarrativeContext): string {
    const symptoms = context.manifestations.symptoms || [];
    if (symptoms.length > 0 && symptoms[0].contradictsEgoPlans) {
      return "Your body contradicts your conscious plans because it serves deeper wisdom.";
    }
    return "Your body carries intelligence that operates independent of your will.";
  }

  private articulateCollectivePatterns(context: NarrativeContext): string[] {
    // This would analyze collective field patterns
    // For now, return placeholder
    return ["Your individual daimonic encounters participate in larger collective movements."];
  }
}