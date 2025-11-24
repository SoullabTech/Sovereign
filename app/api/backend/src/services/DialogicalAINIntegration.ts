/**
 * DialogicalAINIntegration - Bridge Between Dialogical Architecture & Existing AIN System
 * 
 * Integrates the new dialogical encounter services (DaimonicDialogue, ElementalDialogue, 
 * SynapticResonance, ProtectiveFramework) with the existing AIN CollectiveIntelligence,
 * Spiralogic Elemental Alchemy, PersonalOracleAgent, and all other established systems.
 * 
 * This is an ENHANCEMENT layer that adds dialogical encounter capabilities
 * without replacing any existing functionality.
 */

import { logger } from '../utils/logger';
import { AfferentStream, ElementalSignature } from '../ain/collective/CollectiveIntelligence';
import { SpiralPhase } from '../spiralogic/SpiralogicCognitiveEngine';
import { PersonalOracleQuery, PersonalOracleResponse } from '../agents/PersonalOracleAgent';

// Import existing services to enhance
import { ElementalAlignment } from './ElementalAlignment';
import { SHIFtNarrativeService } from './SHIFtNarrativeService';
import { DaimonicEventService } from './DaimonicEventService';

// Import new dialogical services
import { DaimonicDialogueService, DaimonicOtherness } from './DaimonicDialogue';
import { ElementalDialogueService, ElementalDialogue } from './ElementalDialogue';
import { SynapticResonanceService, SynapticSpace } from './SynapticResonance';
import { ProtectiveFrameworkService, ProtectiveResponse } from './ProtectiveFramework';
import { WorldviewPluralityService } from './WorldviewPlurality';

export interface DialogicalEnhancement {
  // Existing response from PersonalOracleAgent/other services
  baseResponse: any;
  
  // New dialogical layers
  daimonicEncounter?: {
    otherness: DaimonicOtherness;
    synapticSpace: SynapticSpace;
    eventId?: string;
  };
  
  elementalDialogue?: {
    dialogue: ElementalDialogue;
    dominantOther?: string;
    autonomyLevel: number;
  };
  
  protectiveFrame?: {
    framework: ProtectiveResponse;
    safetyActivated: boolean;
    lensShift?: string;
  };
  
  // Integration with existing systems
  collectiveContribution: {
    afferentUpdate: Partial<AfferentStream>;
    fieldImpact: number;
    archetypalResonance: string[];
  };
  
  spiralogicEnhancement: {
    elementalDeepening: ElementalSignature;
    phaseAlignment: SpiralPhase;
    alchemicalProcess: string;
  };
}

export interface AINDialogicalContext {
  userId: string;
  sessionId: string;
  existingProfile?: any;           // From Spiralogic system
  collectiveField?: any;           // From AIN CollectiveIntelligence
  currentPhase?: SpiralPhase;      // From existing phase detection
  elementalState?: ElementalSignature; // From elemental alchemy
  safetyContext?: any;             // User safety indicators
  preferredLens?: string;          // From WorldviewPlurality
}

export class DialogicalAINIntegrationService {
  private static instance: DialogicalAINIntegrationService;
  
  // Existing services (enhanced, not replaced)
  private narrativeService: SHIFtNarrativeService;
  private eventService: DaimonicEventService;
  
  // New dialogical services
  private daimonicDialogue: DaimonicDialogueService;
  private elementalDialogue: ElementalDialogueService;
  private synapticResonance: SynapticResonanceService;
  private protectiveFramework: ProtectiveFrameworkService;
  
  static getInstance(): DialogicalAINIntegrationService {
    if (!DialogicalAINIntegrationService.instance) {
      DialogicalAINIntegrationService.instance = new DialogicalAINIntegrationService();
    }
    return DialogicalAINIntegrationService.instance;
  }
  
  private constructor() {
    // Initialize existing services
    this.narrativeService = SHIFtNarrativeService.getInstance();
    this.eventService = DaimonicEventService.getInstance();
    
    // Initialize new dialogical services
    this.daimonicDialogue = new DaimonicDialogueService();
    this.elementalDialogue = new ElementalDialogueService();
    this.synapticResonance = new SynapticResonanceService();
    this.protectiveFramework = ProtectiveFrameworkService.getInstance();
  }
  
  /**
   * Enhance existing PersonalOracleAgent response with dialogical layers
   * This is called AFTER the existing oracle processing but BEFORE final response
   */
  async enhanceOracleResponse(
    originalQuery: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    context: AINDialogicalContext
  ): Promise<DialogicalEnhancement> {
    try {
      logger.info('Enhancing oracle response with dialogical architecture', { 
        userId: context.userId,
        sessionId: context.sessionId 
      });
      
      // Create user profile combining existing data with new dialogue needs
      const dialogicalProfile = await this.createDialogicalProfile(context, originalQuery);
      
      // Run protective framework first (safety layer)
      const protectiveResponse = await this.protectiveFramework.processInput(
        originalQuery.input,
        {
          userId: context.userId,
          conversationLength: context.existingProfile?.conversationCount || 1,
          preferredLens: context.preferredLens as any,
          conversationHistory: [] // Would come from existing session context
        }
      );
      
      let daimonicEncounter = null;
      let elementalDialogue = null;
      
      // Only proceed with dialogical encounter if not in emergency mode
      if (!protectiveResponse.emergencyMode) {
        // Generate daimonic encounter (if sufficient otherness present)
        const daimonicOther = await this.daimonicDialogue.recognizeDaimonicOther(dialogicalProfile);
        
        // Generate elemental dialogue (elements as Others)
        const elementalOtherDialogue = await this.elementalDialogue.generateElementalDialogue(dialogicalProfile);
        
        // Create synaptic space if genuine encounter detected
        if (daimonicOther.alterity.irreducibility > 0.3) {
          const synapticSpace = await this.synapticResonance.mapSynapticSpace(dialogicalProfile, daimonicOther);
          
          // Store daimonic event in database for collective pattern recognition
          const eventId = await this.eventService.storeEvent(
            context.userId,
            daimonicOther,
            elementalOtherDialogue,
            synapticSpace,
            {
              phase: context.currentPhase?.toString() || baseResponse.metadata?.phase || 'unknown',
              element: baseResponse.element || 'aether',
              state: this.determineElementalState(elementalOtherDialogue.dominantVoice)
            }
          );
          
          daimonicEncounter = {
            otherness: daimonicOther,
            synapticSpace,
            eventId: eventId || undefined
          };
        }
        
        elementalDialogue = {
          dialogue: elementalOtherDialogue,
          dominantOther: elementalOtherDialogue.dominantVoice?.element,
          autonomyLevel: elementalOtherDialogue.dominantVoice?.autonomyLevel || 0
        };
      }
      
      // Generate afferent stream update for AIN CollectiveIntelligence
      const collectiveContribution = await this.generateCollectiveContribution(
        context,
        baseResponse,
        daimonicEncounter,
        elementalDialogue
      );
      
      // Enhance Spiralogic elemental data with dialogical insights  
      const spiralogicEnhancement = await this.enhanceSpiralogicData(
        context,
        baseResponse,
        elementalDialogue
      );
      
      const enhancement: DialogicalEnhancement = {
        baseResponse,
        daimonicEncounter: daimonicEncounter || undefined,
        elementalDialogue: elementalDialogue || undefined,
        protectiveFrame: {
          framework: protectiveResponse,
          safetyActivated: protectiveResponse.groundingShift.shiftActivated,
          lensShift: protectiveResponse.worldviewFrame.primaryLens
        },
        collectiveContribution,
        spiralogicEnhancement
      };
      
      logger.info('Dialogical enhancement complete', {
        userId: context.userId,
        daimonicEncounter: !!daimonicEncounter,
        elementalDialogue: !!elementalDialogue,
        safetyActivated: protectiveResponse.groundingShift.shiftActivated,
        eventStored: !!daimonicEncounter?.eventId
      });
      
      return enhancement;
      
    } catch (error) {
      logger.error('Error in dialogical enhancement', { error, userId: context.userId });
      return this.getFallbackEnhancement(baseResponse, context);
    }
  }
  
  /**
   * Merge dialogical enhancement with existing oracle response format
   * Preserves all existing functionality while adding new layers
   */
  async mergeWithExistingResponse(
    enhancement: DialogicalEnhancement,
    originalFormat: PersonalOracleResponse
  ): Promise<PersonalOracleResponse> {
    const merged: PersonalOracleResponse = {
      ...originalFormat, // Preserve all existing response structure
      
      // Add dialogical insights to existing message
      message: await this.enhanceMessage(
        originalFormat.message,
        enhancement.protectiveFrame?.framework,
        enhancement.daimonicEncounter,
        enhancement.elementalDialogue
      ),
      
      // Enhance existing metadata with dialogical data
      metadata: {
        ...originalFormat.metadata,
        
        // Add dialogical metadata
        dialogical: {
          daimonicEncounter: enhancement.daimonicEncounter ? {
            irreducibility: enhancement.daimonicEncounter.otherness.alterity.irreducibility,
            resistance: enhancement.daimonicEncounter.otherness.alterity.resistance,
            synapticGap: enhancement.daimonicEncounter.synapticSpace.gap.width,
            emergence: enhancement.daimonicEncounter.synapticSpace.process.emergence
          } : null,
          
          elementalOthers: enhancement.elementalDialogue ? {
            dominantVoice: enhancement.elementalDialogue.dominantOther,
            autonomyLevel: enhancement.elementalDialogue.autonomyLevel,
            activeOthers: enhancement.elementalDialogue.dialogue.activeOthers.length,
            warnings: enhancement.elementalDialogue.dialogue.antiSolipsisticWarnings
          } : null,
          
          protective: {
            lensActive: enhancement.protectiveFrame?.framework.worldviewFrame.primaryLens,
            safetyShift: enhancement.protectiveFrame?.safetyActivated,
            connectionNeeded: !!enhancement.protectiveFrame?.framework.connectionPrompt
          }
        },
        
        // Enhance existing elemental data with dialogue insights
        elementalEnhancement: enhancement.elementalDialogue ? {
          dialogicalDepth: enhancement.elementalDialogue.autonomyLevel,
          othernessFactor: enhancement.elementalDialogue.dialogue.synapticField.totalIntensity,
          emergentQuality: enhancement.elementalDialogue.dialogue.synapticField.emergentQuality
        } : null
      }
    };
    
    return merged;
  }
  
  /**
   * Update AIN CollectiveIntelligence with dialogical insights
   * Enhances existing afferent stream with new data
   */
  async updateCollectiveField(
    enhancement: DialogicalEnhancement,
    context: AINDialogicalContext
  ): Promise<void> {
    try {
      // This would integrate with existing CollectiveIntelligence afferent stream
      const afferentUpdate = enhancement.collectiveContribution.afferentUpdate;
      
      // Add dialogical dimensions to existing afferent data
      const dialogicalAfferent = {
        ...afferentUpdate,
        
        // New dialogical fields that enhance existing data
        daimonicOtherness: enhancement.daimonicEncounter ? {
          irreducibility: enhancement.daimonicEncounter.otherness.alterity.irreducibility,
          resistance: enhancement.daimonicEncounter.otherness.alterity.resistance,
          synapticIntensity: enhancement.daimonicEncounter.synapticSpace.resonance.coherence
        } : null,
        
        elementalAutonomy: enhancement.elementalDialogue ? {
          autonomyLevel: enhancement.elementalDialogue.autonomyLevel,
          othernessFactor: enhancement.elementalDialogue.dialogue.synapticField.totalIntensity
        } : null,
        
        protectiveActivation: enhancement.protectiveFrame ? {
          safetyShift: enhancement.protectiveFrame.safetyActivated,
          lensShift: enhancement.protectiveFrame.lensShift,
          groundingLevel: enhancement.protectiveFrame.framework.groundingShift.shiftLevel
        } : null
      };
      
      // This would call existing CollectiveIntelligence.updateAfferentStream()
      // enhancement.collectiveContribution would feed into existing patterns
      logger.info('Collective field updated with dialogical insights', {
        userId: context.userId,
        fieldImpact: enhancement.collectiveContribution.fieldImpact
      });
      
    } catch (error) {
      logger.error('Error updating collective field', { error, userId: context.userId });
    }
  }
  
  // Private helper methods
  
  private async createDialogicalProfile(
    context: AINDialogicalContext,
    query: PersonalOracleQuery
  ): Promise<any> {
    // Combine existing profile data with what's needed for dialogical services
    return {
      userId: context.userId,
      sessionId: context.sessionId,
      
      // From existing Spiralogic system
      elemental: context.elementalState || {
        fire: { intensity: 0.5, control: 0.5, resistsControl: 0.3 },
        water: { flow: 0.5, containment: 0.5, overflowsBoundary: 0.3 },
        earth: { connection: 0.5, pace: 0.5, seasonalWisdom: 0.3 },
        air: { focus: 0.5, flexibility: 0.5, inspirationBeyondSelf: 0.3 },
        aether: { weaving: 0.5, integration: 0.5 }
      },
      
      // From existing personality/preferences
      personality: context.existingProfile?.personality || {
        control: 0.5,
        boundaries: 0.5,
        mental: 0.5,
        selfFocus: 0.5
      },
      
      // From existing phase detection
      phase: {
        primary: context.currentPhase || 'unknown'
      },
      
      // Query context
      input: query.input,
      targetElement: query.targetElement,
      context: query.context
    };
  }
  
  private determineElementalState(elementalOther: any): string {
    if (!elementalOther) return 'unknown';
    
    const { autonomyLevel, resistance } = elementalOther;
    
    if (autonomyLevel > 0.8) return 'highly_autonomous';
    if (autonomyLevel > 0.6) return 'autonomous';  
    if (autonomyLevel > 0.4) return 'emerging';
    return 'dormant';
  }
  
  private async generateCollectiveContribution(
    context: AINDialogicalContext,
    baseResponse: PersonalOracleResponse,
    daimonicEncounter: any,
    elementalDialogue: any
  ): Promise<any> {
    return {
      afferentUpdate: {
        // Enhance existing afferent data with dialogical insights
        daimonicOtherness: daimonicEncounter?.otherness.alterity.irreducibility || 0,
        synapticIntensity: daimonicEncounter?.synapticSpace.resonance.coherence || 0,
        elementalAutonomy: elementalDialogue?.autonomyLevel || 0
      },
      fieldImpact: this.calculateFieldImpact(daimonicEncounter, elementalDialogue),
      archetypalResonance: this.extractArchetypalResonance(baseResponse, daimonicEncounter)
    };
  }
  
  private async enhanceSpiralogicData(
    context: AINDialogicalContext,
    baseResponse: PersonalOracleResponse,
    elementalDialogue: any
  ): Promise<any> {
    return {
      elementalDeepening: this.calculateElementalDeepening(context.elementalState, elementalDialogue),
      phaseAlignment: context.currentPhase || 'unknown',
      alchemicalProcess: this.determineAlchemicalProcess(elementalDialogue)
    };
  }
  
  private calculateFieldImpact(daimonicEncounter: any, elementalDialogue: any): number {
    let impact = 0;
    
    if (daimonicEncounter) {
      impact += daimonicEncounter.otherness.alterity.irreducibility * 0.4;
      impact += daimonicEncounter.synapticSpace.resonance.coherence * 0.3;
    }
    
    if (elementalDialogue) {
      impact += elementalDialogue.autonomyLevel * 0.3;
    }
    
    return Math.min(1.0, impact);
  }
  
  private extractArchetypalResonance(baseResponse: PersonalOracleResponse, daimonicEncounter: any): string[] {
    const resonances: string[] = [];
    
    // From existing archetype
    if (baseResponse.archetype) {
      resonances.push(baseResponse.archetype);
    }
    
    // From daimonic encounter
    if (daimonicEncounter?.otherness.alterity.demand?.length > 0) {
      resonances.push('resistance_teacher');
    }
    
    if (daimonicEncounter?.synapticSpace.process.emergence) {
      resonances.push('emergence_catalyst');
    }
    
    return resonances;
  }
  
  private calculateElementalDeepening(existingState: any, elementalDialogue: any): ElementalSignature {
    // Enhance existing elemental signature with dialogical depth
    const base = existingState || { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.5 };
    
    if (elementalDialogue?.dominantOther) {
      const element = elementalDialogue.dominantOther;
      const deepening = elementalDialogue.autonomyLevel * 0.3;
      base[element] = Math.min(1.0, (base[element] || 0.5) + deepening);
    }
    
    return base;
  }
  
  private determineAlchemicalProcess(elementalDialogue: any): string {
    if (!elementalDialogue) return 'integration';
    
    const { dominantOther, autonomyLevel } = elementalDialogue;
    
    if (autonomyLevel > 0.8) return `${dominantOther}_transformation`;
    if (autonomyLevel > 0.6) return `${dominantOther}_dialogue`;
    if (autonomyLevel > 0.4) return `${dominantOther}_emergence`;
    return 'elemental_awakening';
  }
  
  private async enhanceMessage(
    originalMessage: string,
    protectiveFramework?: any,
    daimonicEncounter?: any,
    elementalDialogue?: any
  ): Promise<string> {
    let enhanced = originalMessage;
    
    // Apply protective framework formatting if active
    if (protectiveFramework) {
      enhanced = await this.protectiveFramework.formatProtectiveResponse(
        protectiveFramework,
        enhanced
      );
    }
    
    return enhanced;
  }
  
  private getFallbackEnhancement(baseResponse: PersonalOracleResponse, context: AINDialogicalContext): DialogicalEnhancement {
    return {
      baseResponse,
      collectiveContribution: {
        afferentUpdate: {},
        fieldImpact: 0,
        archetypalResonance: [baseResponse.archetype || 'unknown']
      },
      spiralogicEnhancement: {
        elementalDeepening: context.elementalState || { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.5 },
        phaseAlignment: context.currentPhase || SpiralPhase.INITIATION,
        alchemicalProcess: 'integration'
      }
    };
  }
}