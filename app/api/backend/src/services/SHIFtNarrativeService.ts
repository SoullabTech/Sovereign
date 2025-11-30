/**
 * SHIFt Narrative Service
 * 
 * Generates oracular narratives for SHIFt profiles at individual, group, and collective levels.
 * Uses modular templates with elemental metaphors, phase awareness, and gentle practice invitations.
 */

import { logger } from "../utils/logger";
import {
  Element,
  Phase,
  ElementalProfile,
  FacetScore,
  PhaseInference,
  SHIFtProfile,
  SPIRALOGIC_FACETS
} from "../types/shift";
import { 
  GroupSHIFtSnapshot,
  CollectivePattern
} from "../types/collectiveDashboard";
import { ElementalAlignment, AlignmentAssessment } from "./ElementalAlignment";
import { DaimonicDetectionService } from "./DaimonicDetectionService";
import { DaimonicNarrativeService } from "./DaimonicNarrativeService";
import { DaimonicDialogueService, DaimonicOtherness } from "./DaimonicDialogue";
import { ElementalDialogueService, ElementalDialogue } from "./ElementalDialogue";
import { SynapticResonanceService, SynapticSpace } from "./SynapticResonance";
import { DaimonicEventService } from "./DaimonicEventService";
import { EventEmitter } from 'events';

export type NarrativeLength = 'short' | 'medium' | 'long';
export type NarrativeScope = 'individual' | 'group' | 'collective';

interface ElementMetaphor {
  element: Element;
  high: string[];
  low: string[];
}

interface ElementalInsight {
  element: Element;
  level: 'high' | 'low' | 'balanced';
  narrative: string;
  alignment?: 'natural' | 'adaptive' | 'unclear';
}

interface NarrativeSegment {
  opening: string;
  insights: ElementalInsight[];
  closing: string;
}

export interface IndividualNarrative {
  scope: 'individual';
  userId: string;
  narrative: NarrativeSegment;
  practice?: PracticeInvitation;
  generatedAt: Date;
}

export interface GroupNarrative {
  scope: 'group';
  groupId: string;
  narrative: NarrativeSegment;
  collectivePattern: string;
  generatedAt: Date;
}

export interface CollectiveNarrative {
  scope: 'collective';
  phase: string;
  trend: string;
  narrative: NarrativeSegment;
  meta: string;
  generatedAt: Date;
}

export interface PracticeInvitation {
  element: Element;
  suggestion: string;
  duration?: string;
}

export class SHIFtNarrativeService {
  private static instance: SHIFtNarrativeService;
  private daimonicDetection: DaimonicDetectionService;
  private daimonicNarrative: DaimonicNarrativeService;
  private daimonicDialogue: DaimonicDialogueService;
  private elementalDialogue: ElementalDialogueService;
  private synapticResonance: SynapticResonanceService;
  private eventService: DaimonicEventService;
  private eventEmitter: EventEmitter;

  // Elemental metaphor banks
  private readonly metaphors: Record<Element, ElementMetaphor> = {
    fire: {
      element: 'fire',
      high: ['flame', 'spark', 'blaze', 'radiance', 'ember'],
      low: ['flicker', 'dim glow', 'cool ash', 'waiting spark']
    },
    earth: {
      element: 'earth',
      high: ['root', 'stone', 'mountain', 'ancient tree'],
      low: ['thin soil', 'shifting sand', 'untethered seed']
    },
    water: {
      element: 'water',
      high: ['river', 'ocean', 'flowing stream', 'deep pool'],
      low: ['dry riverbed', 'morning mist', 'dammed flow']
    },
    air: {
      element: 'air',
      high: ['breeze', 'clear sky', 'wind current', 'open horizon'],
      low: ['still air', 'held breath', 'quiet atmosphere']
    },
    aether: {
      element: 'aether',
      high: ['constellation', 'weaving', 'cosmic dance', 'unified field'],
      low: ['distant stars', 'faint thread', 'seeking connection']
    }
  };

  // Elemental practice suggestions
  private readonly practices: Record<Element, string[]> = {
    fire: [
      'lighting a candle with intention',
      'speaking one bold truth',
      "starting that project you've been holding"
    ],
    earth: [
      'a grounding walk',
      'tending to one small routine',
      'placing bare feet on earth'
    ],
    water: [
      'journaling emotions',
      'a cleansing bath',
      'sharing tears or laughter with a friend'
    ],
    air: [
      'breathing practice',
      'writing morning pages',
      'changing your perspective literally—find a new view'
    ],
    aether: [
      'meditation on connection',
      'offering gratitude to the web of life',
      'creating sacred space'
    ]
  };

  static getInstance(eventEmitter?: EventEmitter): SHIFtNarrativeService {
    if (!SHIFtNarrativeService.instance) {
      SHIFtNarrativeService.instance = new SHIFtNarrativeService(eventEmitter);
    }
    return SHIFtNarrativeService.instance;
  }

  private constructor(eventEmitter?: EventEmitter) {
    this.eventEmitter = eventEmitter || new EventEmitter();
    this.daimonicDetection = new DaimonicDetectionService(this.eventEmitter);
    this.daimonicNarrative = DaimonicNarrativeService.getInstance();
    this.daimonicDialogue = new DaimonicDialogueService();
    this.elementalDialogue = new ElementalDialogueService();
    this.synapticResonance = new SynapticResonanceService();
    this.eventService = DaimonicEventService.getInstance();
  }

  // ==========================================================================
  // DIALOGICAL NARRATIVE GENERATION
  // ==========================================================================
  
  /**
   * Generate narrative that preserves the Daimon and Elements as genuine Others
   * Prevents solipsistic collapse by maintaining synaptic space
   */
  private generateDialogicalNarrative(
    daimonicOther: DaimonicOtherness,
    elementalDialogue: ElementalDialogue,
    synapticSpace: SynapticSpace
  ): {
    opening: string | null;
    insights: ElementalInsight[];
    closing: string | null;
  } {
    const insights: ElementalInsight[] = [];
    let opening: string | null = null;
    let closing: string | null = null;
    
    // Generate opening if strong daimonic encounter detected
    if (daimonicOther.alterity.irreducibility > 0.6) {
      opening = this.craftDaimonicOpening(daimonicOther, synapticSpace);
    }
    
    // Add elemental Others as dialogue partners
    if (elementalDialogue.dominantVoice) {
      insights.push({
        element: elementalDialogue.dominantVoice.element,
        level: 'balanced',
        narrative: `${elementalDialogue.dominantVoice.element.toUpperCase()} speaks as Other: "${elementalDialogue.dominantVoice.message}" Its demand: ${elementalDialogue.dominantVoice.demand}. Its gift: ${elementalDialogue.dominantVoice.gift}.`
      });
    }
    
    // Add daimonic otherness insights
    if (daimonicOther.synapse.resonance > 0.5) {
      insights.push({
        element: 'aether',
        level: 'balanced',
        narrative: `What calls you cannot be absorbed into self-understanding. It remains Other — this is its power. The creative tension between what you want and what calls you is where transformation occurs.`
      });
    }
    
    // Add synaptic space insights
    if (synapticSpace.resonance.coherence > 0.4 && synapticSpace.gap.width > 0.3) {
      insights.push({
        element: 'aether',
        level: 'balanced',
        narrative: `Moments of resonance with forces beyond yourself — not merger but dialogue. Two voices creating something neither could produce alone.`
      });
    }
    
    // Add anti-solipsistic warnings if needed
    const warnings = [
      ...elementalDialogue.antiSolipsisticWarnings,
      ...this.synapticResonance.maintainSynapticIntegrity(synapticSpace)
    ];
    
    if (warnings.length > 0) {
      insights.push({
        element: 'aether',
        level: 'balanced',
        narrative: `Caution: ${warnings[0]} The Other must remain Other for genuine development to occur.`
      });
    }
    
    // Generate closing if strong synaptic field present
    if (synapticSpace.process.emergence && elementalDialogue.synapticField.totalIntensity > 0.5) {
      closing = this.craftSynapticClosing(elementalDialogue, synapticSpace);
    }
    
    return {
      opening,
      insights,
      closing
    };
  }
  
  private craftDaimonicOpening(
    daimonicOther: DaimonicOtherness,
    synapticSpace: SynapticSpace
  ): string {
    if (daimonicOther.antiSolipsistic.challengesNarrative) {
      return "Your life story is being disrupted by something that won't fit your categories. This disruption IS the daimonic presence — not a higher aspect of self, but the important Other that makes development possible.";
    }
    
    if (daimonicOther.alterity.resistance > 0.7) {
      return "What meets you today resists incorporation into familiar patterns. This resistance is not obstruction but invitation — the Other speaking through what won't conform to your plans.";
    }
    
    return "A presence that cannot be reduced to personal psychology meets you in the gap between self and Other. In this synaptic space, genuine transformation becomes possible.";
  }
  
  private craftSynapticClosing(
    elementalDialogue: ElementalDialogue,
    synapticSpace: SynapticSpace
  ): string {
    const emergentQuality = elementalDialogue.synapticField.emergentQuality;
    const processEmergence = synapticSpace.process.emergence;
    
    if (emergentQuality && processEmergence) {
      return `The dialogue between self and Other generates ${emergentQuality} — what emerges when you honor both your authentic nature and the resistance that shapes it. ${processEmergence} becomes possible in the space between.`;
    }
    
    return "The creative tension between self and Other — this gap is sacred. Collapse it and development stops. Honor it and something new emerges that neither could create alone.";
  }

  // ==========================================================================
  // INDIVIDUAL NARRATIVES
  // ==========================================================================

  async generateIndividual(
    profile: SHIFtProfile,
    length: NarrativeLength = 'medium',
    expert: boolean = false
  ): Promise<IndividualNarrative> {
    try {
      const alignment = ElementalAlignment.assessIndividual(profile);
      const synthesis = ElementalAlignment.synthesizeAlignment(alignment);
      
      // Detect daimonic signatures
      const daimonicDetection = await this.daimonicDetection.detectDaimonicSignatures(
        profile.userId,
        profile,
        profile.elements,
        expert
      );
      
      // Generate dialogical encounter with Daimon as Other
      const daimonicOther = await this.daimonicDialogue.recognizeDaimonicOther(profile);
      const elementalDialogue = await this.elementalDialogue.generateElementalDialogue(profile);
      
      // Map synaptic space between self and Others
      const synapticSpace = await this.synapticResonance.mapSynapticSpace(profile, daimonicOther);
      
      // Generate enhanced narrative with daimonic extras
      const daimonicExtras = this.daimonicNarrative.enhanceIndividualNarrative(daimonicDetection);
      const dialogicalNarrative = this.generateDialogicalNarrative(daimonicOther, elementalDialogue, synapticSpace);
      
      const opening = dialogicalNarrative.opening || daimonicExtras.opening || this.generateIndividualOpeningWithAlignment(profile.elements, synthesis);
      const insights = this.generateElementalInsightsWithAlignment(profile.elements, alignment, length);
      const closing = dialogicalNarrative.closing || daimonicExtras.closing || this.generateIndividualClosingWithAlignment(profile.elements, profile.phase, synthesis);
      const practice = this.suggestPractice(profile.elements);
      
      // Add dialogical insights first (most important)
      if (dialogicalNarrative.insights.length > 0) {
        insights.unshift(...dialogicalNarrative.insights);
      }
      
      // Add daimonic insights to base insights
      if (daimonicExtras.insights) {
        insights.unshift(...daimonicExtras.insights.map(insight => ({
          element: 'aether' as const,
          level: 'balanced' as const,
          narrative: insight
        })));
      }
      
      // Add trickster caution if present
      if (daimonicExtras.tricksterCaution) {
        insights.push({
          element: 'aether' as const,
          level: 'balanced' as const,
          narrative: daimonicExtras.tricksterCaution
        });
      }

      // Persist the daimonic encounter if it has sufficient otherness
      let eventId: string | null = null;
      if (daimonicOther.alterity.irreducibility > 0.3 && daimonicOther.antiSolipsistic.maintainsOtherness) {
        eventId = await this.eventService.storeEvent(
          profile.userId,
          daimonicOther,
          elementalDialogue,
          synapticSpace,
          {
            phase: profile.phase?.primary || 'unknown',
            element: elementalDialogue.dominantVoice?.element || 'aether',
            state: this.determineElementalState(elementalDialogue.dominantVoice)
          }
        );
      }

      const narrative = {
        scope: 'individual' as const,
        userId: profile.userId,
        narrative: {
          opening,
          insights,
          closing
        },
        practice,
        generatedAt: new Date(),
        daimonic: {
          detection: daimonicDetection,
          chips: this.daimonicNarrative.generateChips(daimonicDetection),
          microPrompts: daimonicExtras.microPrompts,
          practiceHints: daimonicExtras.practiceHints
        },
        dialogical: {
          daimonicOther,
          elementalDialogue,
          synapticSpace,
          antiSolipsisticWarnings: [
            ...elementalDialogue.antiSolipsisticWarnings,
            ...this.synapticResonance.maintainSynapticIntegrity(synapticSpace)
          ],
          eventId // Link to persisted event if created
        }
      };
      
      return narrative;
    } catch (error) {
      logger.error('Error generating individual narrative', { error, userId: profile.userId });
      return this.getFallbackIndividualNarrative(profile.userId);
    }
  }

  private generateIndividualOpening(elements: ElementalProfile): string {
    const dominantElement = this.getDominantElement(elements);
    const metaphor = this.getRandomMetaphor(dominantElement, 'high');
    
    return `Today your elemental pattern reveals itself like a ${metaphor}.`;
  }

  private generateIndividualOpeningWithAlignment(
    elements: ElementalProfile, 
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    const dominantMode = ElementalAlignment.getDominantAlignmentMode([...synthesis.natural, ...synthesis.adaptive]);
    
    if (dominantMode === 'natural') {
      return 'The elements speak through you with Nature\'s voice — patterns that feel effortless and true.';
    } else if (dominantMode === 'adaptive') {
      return 'Your elemental currents carry both diamond and shadow — survival strategies woven with authentic call.';
    } else {
      return 'Elements dance between natural flow and adaptive wisdom — both serve your becoming.';
    }
  }

  private generateElementalInsights(
    elements: ElementalProfile,
    length: NarrativeLength
  ): ElementalInsight[] {
    const insights: ElementalInsight[] = [];
    const elementList: Element[] = ['fire', 'earth', 'water', 'air', 'aether'];
    
    // For short narratives, only show dominant and weakest
    if (length === 'short') {
      const dominant = this.getDominantElement(elements);
      const weakest = this.getWeakestElement(elements);
      
      insights.push(this.createElementInsight(dominant, elements[dominant]));
      if (dominant !== weakest) {
        insights.push(this.createElementInsight(weakest, elements[weakest]));
      }
      return insights;
    }

    // For medium/long, show all elements
    for (const element of elementList) {
      const score = elements[element];
      const insight = this.createElementInsight(element, score);
      insights.push(insight);
      
      // Skip balanced elements in medium length
      if (length === 'medium' && insight.level === 'balanced') {
        insights.pop();
      }
    }

    return insights;
  }

  private generateElementalInsightsWithAlignment(
    elements: ElementalProfile,
    alignment: AlignmentAssessment[],
    length: NarrativeLength
  ): ElementalInsight[] {
    const insights: ElementalInsight[] = [];
    
    // Prioritize elements with clear Natural/Adaptive patterns
    const priorityElements = alignment.filter(a => a.mode !== 'unclear').slice(0, length === 'short' ? 2 : 4);
    const remainingElements = alignment.filter(a => a.mode === 'unclear');
    
    for (const assessment of priorityElements) {
      const score = elements[assessment.element];
      const level = score >= 70 ? 'high' : score <= 40 ? 'low' : 'balanced';
      
      insights.push({
        element: assessment.element,
        level,
        narrative: assessment.narrative,
        alignment: assessment.mode
      });
    }
    
    // Add unclear elements if space allows
    if (length !== 'short' && insights.length < 3) {
      for (const assessment of remainingElements.slice(0, 3 - insights.length)) {
        const score = elements[assessment.element];
        const level = score >= 70 ? 'high' : score <= 40 ? 'low' : 'balanced';
        
        insights.push({
          element: assessment.element,
          level,
          narrative: assessment.narrative,
          alignment: assessment.mode
        });
      }
    }

    return insights;
  }

  private createElementInsight(element: Element, score: number): ElementalInsight {
    const level = score >= 70 ? 'high' : score <= 40 ? 'low' : 'balanced';
    
    const narratives = {
      fire: {
        high: "Your Fire blazes strong, carrying vision and momentum.",
        low: "Your Fire flickers—desire is present, but it waits for air to breathe.",
        balanced: "Fire burns steady within you, neither consuming nor fading."
      },
      earth: {
        high: "Earth steadies you, giving form to your intentions.",
        low: "Earth feels thin beneath your feet; grounding may be needed.",
        balanced: "Earth holds you gently, neither rigid nor shifting."
      },
      water: {
        high: "Water flows freely, carrying compassion and depth.",
        low: "The river feels dammed; emotions wait for safe release.",
        balanced: "Water moves in its natural rhythm through you."
      },
      air: {
        high: "Air circles you with clarity, curiosity, and perspective.",
        low: "The winds are quiet; insight will return if you make space.",
        balanced: "Air moves freely, bringing fresh perspectives as needed."
      },
      aether: {
        high: "Aether weaves harmony—you feel connected to the greater whole.",
        low: "Aether is faint; a sense of meaning may need rekindling.",
        balanced: "Aether holds you in the web of connection, neither lost nor overwhelmed."
      }
    };

    return {
      element,
      level,
      narrative: narratives[element][level]
    };
  }

  private generateIndividualClosing(
    elements: ElementalProfile,
    phase: PhaseInference
  ): string {
    const weakest = this.getWeakestElement(elements);
    const practice = this.getRandomPractice(weakest);
    const phaseNote = this.getPhaseNote(phase.primary);
    
    return `Consider a practice of ${practice}. ${phaseNote} Trust the Spiral—what is thin can grow, what is bright can steady.`;
  }

  private generateIndividualClosingWithAlignment(
    elements: ElementalProfile,
    phase: PhaseInference,
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    const phaseNote = this.getPhaseNote(phase.primary);
    return `${synthesis.guidance} ${phaseNote} The diamond of your Natural Self shines most when noticed.`;
  }

  private suggestPractice(elements: ElementalProfile): PracticeInvitation {
    const weakest = this.getWeakestElement(elements);
    const suggestion = this.getRandomPractice(weakest);
    
    return {
      element: weakest,
      suggestion,
      duration: this.getPracticeDuration(weakest)
    };
  }

  // ==========================================================================
  // GROUP NARRATIVES
  // ==========================================================================

  generateGroup(
    snapshot: GroupSHIFtSnapshot,
    groupId: string,
    length: NarrativeLength = 'medium'
  ): GroupNarrative {
    try {
      const alignment = ElementalAlignment.assessGroup(snapshot);
      const synthesis = ElementalAlignment.synthesizeAlignment(alignment);
      const dominantElement = snapshot.dominantElement;
      const collectivePattern = this.detectGroupPattern(snapshot);
      
      const opening = this.generateGroupOpeningWithAlignment(dominantElement, synthesis);
      const insights = this.generateGroupInsightsWithAlignment(snapshot, alignment, length);
      const closing = this.generateGroupClosingWithAlignment(snapshot, synthesis);

      return {
        scope: 'group',
        groupId,
        narrative: {
          opening,
          insights,
          closing
        },
        collectivePattern,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating group narrative', { error, groupId });
      return this.getFallbackGroupNarrative(groupId);
    }
  }

  private generateGroupInsights(
    snapshot: GroupSHIFtSnapshot,
    length: NarrativeLength
  ): ElementalInsight[] {
    const insights: ElementalInsight[] = [];
    
    // Always include dominant element insight
    insights.push({
      element: snapshot.dominantElement,
      level: 'high',
      narrative: this.getGroupElementNarrative(snapshot.dominantElement, 'high', snapshot)
    });

    // Add lowest element if significant imbalance
    if (snapshot.lowestElement && snapshot.imbalanceScore > 0.3) {
      insights.push({
        element: snapshot.lowestElement,
        level: 'low',
        narrative: this.getGroupElementNarrative(snapshot.lowestElement, 'low', snapshot)
      });
    }

    // For longer narratives, add phase-specific insights
    if (length !== 'short' && snapshot.phaseAlignment) {
      const phaseInsight = this.getGroupPhaseInsight(snapshot);
      if (phaseInsight) {
        insights.push(phaseInsight);
      }
    }

    return insights;
  }

  private getGroupElementNarrative(
    element: Element,
    level: 'high' | 'low',
    snapshot: GroupSHIFtSnapshot
  ): string {
    const narratives = {
      fire: {
        high: "There is abundant vision, though grounding may lag.",
        low: "The collective fire needs tending—inspiration waits to be kindled."
      },
      earth: {
        high: "Roots are strong, but the fire of inspiration is gentler.",
        low: "The group seeks grounding—daily practices may be scattered."
      },
      water: {
        high: "Emotional resonance is high; shared vulnerability is alive.",
        low: "Emotions move beneath the surface, seeking safe expression."
      },
      air: {
        high: "Ideas and reflections circulate quickly, though emotions may be bypassed.",
        low: "The group mind is quiet—space for dialogue may be needed."
      },
      aether: {
        high: "The group feels woven into a larger story of wholeness.",
        low: "The sense of shared purpose is seeking renewal."
      }
    };

    return narratives[element][level];
  }

  private generateGroupClosing(snapshot: GroupSHIFtSnapshot): string {
    const balancingElement = this.getBalancingElement(snapshot);
    const practice = this.getGroupPractice(balancingElement);
    
    return `The ceremony ahead may ask for ${practice}. Together, tend to what is thin so the Spiral can move in harmony.`;
  }

  // ==========================================================================
  // COLLECTIVE NARRATIVES
  // ==========================================================================

  generateCollective(
    patterns: CollectivePattern[],
    phase: string,
    length: NarrativeLength = 'medium'
  ): CollectiveNarrative {
    try {
      const alignment = ElementalAlignment.assessCollective(patterns);
      const synthesis = ElementalAlignment.synthesizeAlignment(alignment);
      const trend = this.detectCollectiveTrend(patterns);
      const opening = this.generateCollectiveOpeningWithAlignment(phase, synthesis);
      const insights = this.generateCollectiveInsightsWithAlignment(patterns, alignment, length);
      const closing = this.generateCollectiveClosingWithAlignment(patterns, synthesis);
      const meta = this.generateMetaPatternWithAlignment(patterns, synthesis);

      return {
        scope: 'collective',
        phase,
        trend,
        narrative: {
          opening,
          insights,
          closing
        },
        meta,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating collective narrative', { error });
      return this.getFallbackCollectiveNarrative(phase);
    }
  }

  private generateCollectiveInsights(
    patterns: CollectivePattern[],
    length: NarrativeLength
  ): ElementalInsight[] {
    const insights: ElementalInsight[] = [];
    
    // Analyze elemental trends across patterns
    const elementalTrends = this.analyzeElementalTrends(patterns);
    
    for (const [element, trend] of Object.entries(elementalTrends)) {
      if (length === 'short' && trend.significance < 0.7) continue;
      
      insights.push({
        element: element as Element,
        level: trend.direction === 'rising' ? 'high' : 'low',
        narrative: this.getCollectiveTrendNarrative(element as Element, trend)
      });
    }

    return insights;
  }

  private getCollectiveTrendNarrative(
    element: Element,
    trend: { direction: string; significance: number }
  ): string {
    const rising = trend.direction === 'rising';
    
    const narratives = {
      fire: `Across the circle, Fire ${rising ? 'rises' : 'dips'}—${rising ? 'vision grows faster than emotional anchoring' : 'the collective seeks renewed inspiration'}.`,
      earth: `Earth ${rising ? 'steadies' : 'loosens'}; ${rising ? 'practices and routines are deepening' : 'the need for grounding becomes apparent'}.`,
      water: `Water ${rising ? 'swells' : 'recedes'}—${rising ? 'emotional sharing increases' : 'feelings seek safe containers'}.`,
      air: `Air ${rising ? 'quickens' : 'stills'}; ${rising ? 'ideas proliferate' : 'reflection deepens'}.`,
      aether: `Aether ${rising ? 'brightens' : 'dims'}—${rising ? 'unity consciousness expands' : 'individual paths diverge for integration'}.`
    };

    return narratives[element];
  }

  private generateCollectiveClosing(patterns: CollectivePattern[]): string {
    const medicine = this.detectCollectiveMedicine(patterns);
    return `The larger body is learning this: ${medicine}. This is the medicine of the season.`;
  }

  private generateMetaPattern(patterns: CollectivePattern[]): string {
    // Detect the overarching pattern
    const hasVisionWithoutGround = patterns.some(p => 
      p.type === 'elemental_wave' && p.data.element === 'fire'
    ) && patterns.some(p => 
      p.type === 'elemental_wave' && p.data.element === 'earth' && p.strength < 0.5
    );

    if (hasVisionWithoutGround) {
      return 'how to hold great vision while staying rooted';
    }

    const hasEmotionalOpening = patterns.some(p => 
      p.type === 'elemental_wave' && p.data.element === 'water' && p.strength > 0.7
    );

    if (hasEmotionalOpening) {
      return 'how to honor the waters of feeling without drowning';
    }

    return 'how to dance with change while maintaining center';
  }

  // ==========================================================================
  // ALIGNMENT-ENHANCED HELPER METHODS
  // ==========================================================================

  private generateGroupOpeningWithAlignment(
    dominantElement: Element,
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    const dominantMode = ElementalAlignment.getDominantAlignmentMode([...synthesis.natural, ...synthesis.adaptive]);
    
    if (dominantMode === 'natural') {
      return `The group Spiral flows with natural rhythm — ${dominantElement} emerges from shared diamond clarity.`;
    } else if (dominantMode === 'adaptive') {
      return `The group field carries both light and shadow — ${dominantElement} rises, yet adaptive strategies may be at work.`;
    } else {
      return `The group explores its collective rhythm — ${dominantElement} speaks, though its origin remains to be discerned.`;
    }
  }

  private generateGroupInsightsWithAlignment(
    snapshot: GroupSHIFtSnapshot,
    alignment: AlignmentAssessment[],
    length: NarrativeLength
  ): ElementalInsight[] {
    return alignment.slice(0, length === 'short' ? 2 : 4).map(assessment => ({
      element: assessment.element,
      level: assessment.mode === 'natural' ? 'balanced' : assessment.mode === 'adaptive' ? 'high' : 'balanced',
      narrative: assessment.narrative,
      alignment: assessment.mode
    }));
  }

  private generateGroupClosingWithAlignment(
    snapshot: GroupSHIFtSnapshot,
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    const balancingElement = this.getBalancingElement(snapshot);
    const practice = this.getGroupPractice(balancingElement);
    
    return `${synthesis.guidance} The ceremony ahead may ask for ${practice} — together, tend what serves the whole.`;
  }

  private generateCollectiveOpeningWithAlignment(
    phase: string,
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    const dominantMode = ElementalAlignment.getDominantAlignmentMode([...synthesis.natural, ...synthesis.adaptive]);
    
    if (dominantMode === 'natural') {
      return `The Soullab field moves through ${phase} with natural intelligence — collective patterns aligned with Nature's will.`;
    } else if (dominantMode === 'adaptive') {
      return `The collective field navigates ${phase} through both wisdom and adaptation — learning to discern diamond from overlay.`;
    } else {
      return `The body of Soullab breathes through ${phase} — patterns emerging that bridge natural flow and adaptive strategy.`;
    }
  }

  private generateCollectiveInsightsWithAlignment(
    patterns: CollectivePattern[],
    alignment: AlignmentAssessment[],
    length: NarrativeLength
  ): ElementalInsight[] {
    return alignment.slice(0, length === 'short' ? 2 : 4).map(assessment => ({
      element: assessment.element,
      level: assessment.mode === 'natural' ? 'balanced' : 'high',
      narrative: assessment.narrative,
      alignment: assessment.mode
    }));
  }

  private generateCollectiveClosingWithAlignment(
    patterns: CollectivePattern[],
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    return `${synthesis.guidance} This is the medicine of the season — learning how to follow Nature's call while honoring what adaptation has taught.`;
  }

  private generateMetaPatternWithAlignment(
    patterns: CollectivePattern[],
    synthesis: { natural: AlignmentAssessment[]; adaptive: AlignmentAssessment[]; guidance: string }
  ): string {
    if (synthesis.natural.length > synthesis.adaptive.length) {
      return 'how to trust the natural intelligence emerging through collective process';
    } else if (synthesis.adaptive.length > synthesis.natural.length) {
      return 'how to transform survival strategies into conscious choice';
    } else {
      return 'how to dance between Nature\'s call and wisdom learned through adaptation';
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Determine elemental state from elemental otherness
   */
  private determineElementalState(elementalOther: any): string {
    if (!elementalOther) return 'unknown';
    
    const { autonomyLevel, resistance } = elementalOther;
    
    if (autonomyLevel > 0.8 && resistance > 0.7) return 'highly_autonomous';
    if (autonomyLevel > 0.6) return 'autonomous';
    if (autonomyLevel > 0.4) return 'emerging';
    return 'dormant';
  }

  private getDominantElement(elements: ElementalProfile): Element {
    let max = 0;
    let dominant: Element = 'fire';
    
    for (const [element, score] of Object.entries(elements)) {
      if (element !== 'confidence' && score > max) {
        max = score;
        dominant = element as Element;
      }
    }
    
    return dominant;
  }

  private getWeakestElement(elements: ElementalProfile): Element {
    let min = 100;
    let weakest: Element = 'fire';
    
    for (const [element, score] of Object.entries(elements)) {
      if (element !== 'confidence' && score < min) {
        min = score;
        weakest = element as Element;
      }
    }
    
    return weakest;
  }

  private getRandomMetaphor(element: Element, level: 'high' | 'low'): string {
    const metaphors = this.metaphors[element][level];
    return metaphors[Math.floor(Math.random() * metaphors.length)];
  }

  private getRandomPractice(element: Element): string {
    const practices = this.practices[element];
    return practices[Math.floor(Math.random() * practices.length)];
  }

  private getPracticeDuration(element: Element): string {
    const durations = {
      fire: '5-10 minutes',
      earth: '15-20 minutes',
      water: '10-15 minutes',
      air: '5-10 minutes',
      aether: '10-20 minutes'
    };
    return durations[element];
  }

  private getPhaseNote(phase: Phase): string {
    const notes = {
      initiation: 'You are beginning anew.',
      grounding: 'Roots are forming.',
      collaboration: 'Connections deepen.',
      transformation: 'Old forms dissolve.',
      completion: 'A cycle completes.'
    };
    return notes[phase];
  }

  private detectGroupPattern(snapshot: GroupSHIFtSnapshot): string {
    if (snapshot.coherenceScore > 0.8) {
      return 'High coherence—the group moves as one breath.';
    } else if (snapshot.imbalanceScore > 0.5) {
      return 'Elements seek balance—diversity creates dynamic tension.';
    } else {
      return 'The group explores its unique rhythm.';
    }
  }

  private getBalancingElement(snapshot: GroupSHIFtSnapshot): Element {
    // Return the element that would balance the dominant one
    const balancing: Record<Element, Element> = {
      fire: 'earth',
      earth: 'fire',
      water: 'air',
      air: 'water',
      aether: 'earth'
    };
    return balancing[snapshot.dominantElement];
  }

  private getGroupPractice(element: Element): string {
    const practices = {
      fire: 'shared visioning',
      earth: 'grounding ceremony',
      water: 'emotional witnessing',
      air: 'collective reflection',
      aether: 'unity meditation'
    };
    return practices[element];
  }

  private detectCollectiveTrend(patterns: CollectivePattern[]): string {
    const elementalWaves = patterns.filter(p => p.type === 'elemental_wave');
    if (elementalWaves.length > 0) {
      const strongest = elementalWaves.reduce((a, b) => a.strength > b.strength ? a : b);
      return `${strongest.data.element} wave building`;
    }
    return 'subtle shifts across elements';
  }

  private analyzeElementalTrends(patterns: CollectivePattern[]): Record<string, any> {
    const trends: Record<string, any> = {};
    const elements: Element[] = ['fire', 'earth', 'water', 'air', 'aether'];
    
    for (const element of elements) {
      const elementPatterns = patterns.filter(p => 
        p.type === 'elemental_wave' && p.data.element === element
      );
      
      if (elementPatterns.length > 0) {
        const avgStrength = elementPatterns.reduce((sum, p) => sum + p.strength, 0) / elementPatterns.length;
        trends[element] = {
          direction: avgStrength > 0.5 ? 'rising' : 'falling',
          significance: avgStrength
        };
      }
    }
    
    return trends;
  }

  private detectCollectiveMedicine(patterns: CollectivePattern[]): string {
    // Analyze patterns to determine what the collective is learning
    const hasIntegration = patterns.some(p => p.type === 'integration_phase');
    const hasShadow = patterns.some(p => p.type === 'shadow_pattern');
    
    if (hasIntegration && hasShadow) {
      return 'how to integrate shadow with grace';
    } else if (hasIntegration) {
      return 'how to weave disparate threads into wholeness';
    } else if (hasShadow) {
      return 'how to face collective shadows with courage';
    }
    
    return 'how to trust the spiral of becoming';
  }

  private getGroupPhaseInsight(snapshot: GroupSHIFtSnapshot): ElementalInsight | null {
    if (!snapshot.phaseAlignment) return null;
    
    return {
      element: 'aether',
      level: 'balanced',
      narrative: `The group aligns in ${snapshot.phaseAlignment.primary}—${this.getPhaseNote(snapshot.phaseAlignment.primary as Phase)}`
    };
  }

  // ==========================================================================
  // FALLBACK NARRATIVES
  // ==========================================================================

  private getFallbackIndividualNarrative(userId: string): IndividualNarrative {
    return {
      scope: 'individual',
      userId,
      narrative: {
        opening: 'Your elemental pattern dances in unique ways today.',
        insights: [{
          element: 'aether',
          level: 'balanced',
          narrative: 'All elements move within you, seeking their natural expression.'
        }],
        closing: 'Trust your inner knowing. The Spiral holds you.'
      },
      generatedAt: new Date()
    };
  }

  private getFallbackGroupNarrative(groupId: string): GroupNarrative {
    return {
      scope: 'group',
      groupId,
      narrative: {
        opening: 'The group field holds many currents.',
        insights: [{
          element: 'aether',
          level: 'balanced',
          narrative: 'Together, you explore the dance of elements.'
        }],
        closing: 'May your shared journey reveal its wisdom.'
      },
      collectivePattern: 'The pattern emerges in its own time.',
      generatedAt: new Date()
    };
  }

  private getFallbackCollectiveNarrative(phase: string): CollectiveNarrative {
    return {
      scope: 'collective',
      phase,
      trend: 'gentle evolution',
      narrative: {
        opening: `The field moves through ${phase}.`,
        insights: [{
          element: 'aether',
          level: 'balanced',
          narrative: 'The collective breathes in its natural rhythm.'
        }],
        closing: 'We are learning together.'
      },
      meta: 'how to trust the process',
      generatedAt: new Date()
    };
  }
}