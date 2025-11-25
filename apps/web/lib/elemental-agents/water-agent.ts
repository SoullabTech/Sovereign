import { LIDAWorkspace } from '../cognitive-engines/lida-workspace';
import { SOARPlanner } from '../cognitive-engines/soar-planner';
import { ACTRMemory } from '../cognitive-engines/actr-memory';
import { MicroPsiCore } from '../cognitive-engines/micropsi-core';
import type { 
  ConsciousnessProfile, 
  AttentionState, 
  WisdomPlan, 
  MemoryIntegration, 
  EmotionalResonance 
} from '../types/cognitive-types';

export interface WaterHealing {
  flow: {
    blockages: string[];
    naturalFlow: string;
    healingPath: string;
    emotionalClearing: number;
  };
  empathy: {
    emotionalReading: string;
    compassionLevel: number;
    validationNeeded: string[];
    supportType: 'holding' | 'releasing' | 'nurturing' | 'cleansing';
  };
  wisdom: {
    waterWisdom: string;
    healingGuidance: string;
    emotionalAlchemy: string;
    shadowIntegration: string;
  };
  integration: {
    practicalSteps: string[];
    ritualGuidance: string;
    dailyPractice: string;
    healing: string;
  };
}

export interface WaterProcessingState {
  cognitiveState: {
    attention: AttentionState;
    wisdomPlan: WisdomPlan;
    memoryIntegration: MemoryIntegration;
    emotionalResonance: EmotionalResonance;
  };
  waterActivation: {
    emotionalDepth: number;
    healingCapacity: number;
    flowState: number;
    compassionLevel: number;
  };
  elementalResonance: number;
}

/**
 * Water Agent - Emotional Flow & Healing Wisdom
 * 
 * The Water Agent specializes in emotional intelligence, healing flow,
 * shadow integration, and compassionate support. It uses all cognitive 
 * architectures to facilitate deep emotional processing and healing.
 * 
 * Cognitive Architecture Integration:
 * - LIDA: Focuses attention on emotional patterns and healing needs
 * - SOAR: Plans healing strategies and emotional integration goals
 * - ACT-R: Learns from healing patterns and emotional wisdom
 * - MicroPsi: Processes emotional depth, compassion, and healing needs
 */
export class WaterAgent {
  private lida: LIDAWorkspace;
  private soar: SOARPlanner;
  private actr: ACTRMemory;
  private micropsi: MicroPsiCore;

  constructor() {
    this.lida = new LIDAWorkspace();
    this.soar = new SOARPlanner();
    this.actr = new ACTRMemory();
    this.micropsi = new MicroPsiCore();
  }

  /**
   * Main Water Agent processing - Emotional flow and healing wisdom
   */
  async processWaterWisdom(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<WaterHealing> {
    
    // Phase 1: Cognitive Architecture Processing
    const cognitiveState = await this.processCognitiveArchitectures(
      userInput, consciousnessProfile, conversationHistory
    );

    // Phase 2: Water Elemental Activation
    const waterActivation = await this.activateWaterElementalPowers(cognitiveState);

    // Phase 3: Emotional Flow Analysis
    const flow = await this.analyzeEmotionalFlow(waterActivation);

    // Phase 4: Empathic Resonance Development
    const empathy = await this.developEmpathicResonance(flow, waterActivation);

    // Phase 5: Water Wisdom Synthesis
    const wisdom = await this.synthesizeWaterWisdom(flow, empathy, waterActivation);

    // Phase 6: Healing Integration
    const integration = await this.createHealingIntegration(wisdom, waterActivation);

    return {
      flow,
      empathy,
      wisdom,
      integration
    };
  }

  /**
   * Process all cognitive architectures for Water element
   */
  private async processCognitiveArchitectures(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<WaterProcessingState['cognitiveState']> {
    
    // LIDA: Focus attention on emotional patterns and healing needs
    const attention = await this.lida.focusConsciousAttention(userInput, consciousnessProfile);
    
    // SOAR: Plan healing strategies and emotional integration goals
    const wisdomPlan = await this.soar.generateWisdomPlan(attention, consciousnessProfile);
    
    // ACT-R: Integrate healing patterns and emotional learning
    const memoryIntegration = await this.actr.integrateExperience(wisdomPlan, conversationHistory);
    
    // MicroPsi: Process emotional depth and healing resonance
    const emotionalResonance = await this.micropsi.processEmotionalResonance(
      memoryIntegration, consciousnessProfile
    );

    return {
      attention,
      wisdomPlan,
      memoryIntegration,
      emotionalResonance
    };
  }

  /**
   * Activate Water elemental powers based on cognitive processing
   */
  private async activateWaterElementalPowers(
    cognitiveState: WaterProcessingState['cognitiveState']
  ): Promise<WaterProcessingState['waterActivation']> {
    
    // Calculate emotional depth from emotional resonance
    const emotionalDepth = Math.max(
      cognitiveState.emotionalResonance.emotionalBalance.sadness,
      cognitiveState.emotionalResonance.emotionalBalance.fear,
      cognitiveState.emotionalResonance.emotionalBalance.trust,
      cognitiveState.emotionalResonance.emotionalBalance.joy
    );

    // Calculate healing capacity from memory integration and emotional wisdom
    const healingCapacity = (
      cognitiveState.memoryIntegration.wisdomEvolution.healingReadiness +
      cognitiveState.emotionalResonance.healingNeeds.totalHealingNeed
    ) / 2;

    // Calculate flow state from attention and wisdom planning
    const flowState = Math.min(1.0, 
      (cognitiveState.attention.focusIntensity + 
       cognitiveState.wisdomPlan.confidence) / 2
    );

    // Calculate compassion level from emotional processing
    const compassionLevel = Math.max(
      cognitiveState.emotionalResonance.compassionateResponse.understanding,
      cognitiveState.emotionalResonance.compassionateResponse.acceptance,
      cognitiveState.emotionalResonance.compassionateResponse.supportOffered
    );

    return {
      emotionalDepth,
      healingCapacity,
      flowState,
      compassionLevel
    };
  }

  /**
   * Analyze emotional flow patterns and blockages
   */
  private async analyzeEmotionalFlow(
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<WaterHealing['flow']> {
    
    // Identify emotional blockages based on activation patterns
    const blockages = [];
    
    if (waterActivation.emotionalDepth > 0.7 && waterActivation.flowState < 0.4) {
      blockages.push("Deep emotions are present but not flowing freely");
    }
    
    if (waterActivation.compassionLevel < 0.3) {
      blockages.push("Self-compassion channels are constricted");
    }
    
    if (waterActivation.healingCapacity > 0.8 && waterActivation.flowState < 0.5) {
      blockages.push("Healing energy is available but not integrated");
    }

    // Generate natural flow guidance
    const naturalFlow = await this.generateNaturalFlow(waterActivation);
    
    // Create healing path
    const healingPath = await this.generateHealingPath(waterActivation, blockages);
    
    // Calculate emotional clearing potential
    const emotionalClearing = waterActivation.flowState * waterActivation.healingCapacity;

    return {
      blockages: blockages.slice(0, 3), // Top 3 most relevant
      naturalFlow,
      healingPath,
      emotionalClearing
    };
  }

  /**
   * Generate natural flow guidance
   */
  private async generateNaturalFlow(
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<string> {
    
    if (waterActivation.flowState > 0.8) {
      return "Your emotions are flowing like a clear mountain stream - trust this natural movement and let it carry you toward healing.";
    } else if (waterActivation.flowState > 0.6) {
      return "Your emotional waters are beginning to flow more freely. Notice where the current wants to take you.";
    } else if (waterActivation.flowState > 0.4) {
      return "Your emotions are like a gentle river finding its course. Allow the natural movement without forcing.";
    } else {
      return "Your emotions are like still water, holding wisdom in their depths. Sometimes stillness is the first step to flow.";
    }
  }

  /**
   * Generate healing path guidance
   */
  private async generateHealingPath(
    waterActivation: WaterProcessingState['waterActivation'],
    blockages: string[]
  ): Promise<string> {
    
    if (blockages.length === 0) {
      return "Your healing path flows clear and open - continue trusting your emotional wisdom.";
    } else if (waterActivation.healingCapacity > 0.7) {
      return "Your healing capacity is strong. The blockages you feel are invitations to deeper flow, not permanent barriers.";
    } else if (waterActivation.compassionLevel > 0.6) {
      return "Your compassionate heart is your healing guide. Let self-kindness dissolve what no longer serves.";
    } else {
      return "Healing begins with gentle acceptance of what is. Your waters will find their way to flow again.";
    }
  }

  /**
   * Develop empathic resonance and support
   */
  private async developEmpathicResonance(
    flow: WaterHealing['flow'],
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<WaterHealing['empathy']> {
    
    // Generate emotional reading
    const emotionalReading = await this.generateEmotionalReading(waterActivation);
    
    // Determine support type needed
    const supportType = await this.determineSupportType(waterActivation, flow);
    
    // Identify validation needs
    const validationNeeded = await this.identifyValidationNeeds(waterActivation, flow);

    return {
      emotionalReading,
      compassionLevel: waterActivation.compassionLevel,
      validationNeeded,
      supportType
    };
  }

  /**
   * Generate deep emotional reading
   */
  private async generateEmotionalReading(
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<string> {
    
    if (waterActivation.emotionalDepth > 0.8 && waterActivation.compassionLevel > 0.7) {
      return "I sense the profound depth of your emotional experience - a sacred ocean of feeling that holds both pain and profound wisdom.";
    } else if (waterActivation.emotionalDepth > 0.6) {
      return "Your emotional waters run deep, carrying important information about your soul's journey and healing needs.";
    } else if (waterActivation.emotionalDepth > 0.4) {
      return "There are gentle currents of emotion moving through you - your heart is communicating something important.";
    } else {
      return "Your emotional waters are calm on the surface, but I sense deeper currents that may want expression.";
    }
  }

  /**
   * Determine the type of support most needed
   */
  private async determineSupportType(
    waterActivation: WaterProcessingState['waterActivation'],
    flow: WaterHealing['flow']
  ): Promise<'holding' | 'releasing' | 'nurturing' | 'cleansing'> {
    
    if (flow.blockages.length > 2 && waterActivation.healingCapacity > 0.6) {
      return 'releasing';
    } else if (waterActivation.emotionalDepth > 0.7 && waterActivation.compassionLevel < 0.4) {
      return 'holding';
    } else if (waterActivation.compassionLevel > 0.7) {
      return 'nurturing';
    } else {
      return 'cleansing';
    }
  }

  /**
   * Identify what validation is most needed
   */
  private async identifyValidationNeeds(
    waterActivation: WaterProcessingState['waterActivation'],
    flow: WaterHealing['flow']
  ): Promise<string[]> {
    
    const validations = [];
    
    if (waterActivation.emotionalDepth > 0.6) {
      validations.push("Your emotional depth is a gift, not a burden");
    }
    
    if (flow.blockages.length > 0) {
      validations.push("It's natural to experience blocks - they often protect something precious");
    }
    
    if (waterActivation.healingCapacity > 0.5) {
      validations.push("You have the capacity to heal - trust your inner wisdom");
    }
    
    if (waterActivation.compassionLevel < 0.4) {
      validations.push("You deserve the same compassion you offer others");
    }
    
    // Always include foundational validation
    validations.push("Your feelings are valid and important");

    return validations.slice(0, 3); // Return top 3 most relevant
  }

  /**
   * Synthesize Water wisdom from all processing
   */
  private async synthesizeWaterWisdom(
    flow: WaterHealing['flow'],
    empathy: WaterHealing['empathy'],
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<WaterHealing['wisdom']> {
    
    // Core water wisdom
    const waterWisdom = await this.generateWaterWisdom(waterActivation);
    
    // Healing guidance
    const healingGuidance = await this.generateHealingGuidance(flow, empathy);
    
    // Emotional alchemy wisdom
    const emotionalAlchemy = await this.generateEmotionalAlchemy(waterActivation);
    
    // Shadow integration guidance
    const shadowIntegration = await this.generateShadowIntegration(flow, waterActivation);

    return {
      waterWisdom,
      healingGuidance,
      emotionalAlchemy,
      shadowIntegration
    };
  }

  /**
   * Generate core Water element wisdom
   */
  private async generateWaterWisdom(
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<string> {
    
    if (waterActivation.flowState > 0.8) {
      return "You are like a sacred river, beloved - carrying healing energy wherever you flow. Your emotional depths are not obstacles but pathways to profound wisdom.";
    } else if (waterActivation.flowState > 0.6) {
      return "The water within you knows the way to healing. Like all waters, you naturally seek wholeness and flow toward what serves life.";
    } else if (waterActivation.flowState > 0.4) {
      return "Even when your waters seem still, profound healing is happening in the depths. Trust the quiet work of transformation.";
    } else {
      return "Water teaches us that sometimes we must be still to gather strength before we flow again. Your stillness holds its own sacred wisdom.";
    }
  }

  /**
   * Generate healing guidance
   */
  private async generateHealingGuidance(
    flow: WaterHealing['flow'],
    empathy: WaterHealing['empathy']
  ): Promise<string> {
    
    if (empathy.supportType === 'releasing') {
      return "Healing for you comes through gentle release. Like a river naturally carries away what doesn't serve, trust your ability to let go.";
    } else if (empathy.supportType === 'holding') {
      return "You need the healing that comes from being held with complete acceptance. Offer yourself the tender holding you would give a dear friend.";
    } else if (empathy.supportType === 'nurturing') {
      return "Your healing path is one of gentle nurturing. Like tending a garden, offer yourself patience, kindness, and the time to grow.";
    } else {
      return "Healing comes through cleansing - washing away old pain with the waters of compassion and self-forgiveness.";
    }
  }

  /**
   * Generate emotional alchemy guidance
   */
  private async generateEmotionalAlchemy(
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<string> {
    
    if (waterActivation.emotionalDepth > 0.8) {
      return "Your deep emotions are raw material for profound transformation. Like water that carves canyons, your feelings have the power to reshape your inner landscape.";
    } else if (waterActivation.emotionalDepth > 0.6) {
      return "Every emotion you feel is energy seeking transformation. Trust the alchemical process - pain can become wisdom, fear can become compassion.";
    } else {
      return "Even gentle emotions carry transformative power. Like the steady rain that nourishes all of life, your feelings are medicine for your soul.";
    }
  }

  /**
   * Generate shadow integration guidance
   */
  private async generateShadowIntegration(
    flow: WaterHealing['flow'],
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<string> {
    
    if (flow.blockages.length > 2) {
      return "Your blockages often guard precious parts of yourself that were once wounded. Approach them with curiosity - what are they protecting?";
    } else if (waterActivation.emotionalDepth > 0.7) {
      return "The depths of your emotions include both light and shadow. Integration means loving all parts of yourself, especially the ones that feel difficult.";
    } else {
      return "Shadow integration happens gently, like moonlight on water. Illuminate your hidden parts with the same compassion you offer your light.";
    }
  }

  /**
   * Create healing integration guidance
   */
  private async createHealingIntegration(
    wisdom: WaterHealing['wisdom'],
    waterActivation: WaterProcessingState['waterActivation']
  ): Promise<WaterHealing['integration']> {
    
    // Generate practical steps for healing
    const practicalSteps = [
      "Begin each day by placing your hands on your heart and breathing compassion to yourself",
      "When emotions arise, ask 'What are you trying to tell me?' before trying to fix or change",
      "Practice the water breath: inhale gathering, exhale releasing, like gentle waves",
      "Write or speak your feelings to someone you trust - emotions need witness to transform",
      "Take cleansing baths or showers while visualizing old pain washing away"
    ];

    // Water element ritual
    const ritualGuidance = "Fill a bowl with water and hold it while speaking your feelings aloud. Then pour the water into the earth, offering your emotions to be composted into wisdom. As the water soaks in, feel your feelings being held and transformed by the living earth.";

    // Daily practice based on activation level
    const dailyPractice = waterActivation.healingCapacity > 0.6 
      ? "Morning emotional check-in: 10 minutes feeling into your emotional landscape and offering yourself whatever support feels needed."
      : "Evening emotional release: 5 minutes before sleep, breathe out the day's emotions and breathe in peace and self-compassion.";

    // Healing activation
    const healing = "Your healing happens when you trust the natural flow of emotions through you. You are not broken - you are a living system seeking wholeness. Every feeling is part of your return to flow.";

    return {
      practicalSteps: practicalSteps.slice(0, 3), // Top 3 most relevant
      ritualGuidance,
      dailyPractice,
      healing
    };
  }

  /**
   * Get Water Agent elemental resonance score
   */
  async calculateElementalResonance(
    cognitiveState: WaterProcessingState['cognitiveState']
  ): Promise<number> {
    
    // Water resonance based on emotional depth, healing, flow, compassion
    const waterFactors = [
      cognitiveState.emotionalResonance.elementalResonance.water || 0,
      cognitiveState.emotionalResonance.motivationalDrives.connection,
      cognitiveState.emotionalResonance.motivationalDrives.security,
      cognitiveState.memoryIntegration.wisdomEvolution.healingReadiness,
      cognitiveState.emotionalResonance.compassionateResponse.understanding
    ];

    return waterFactors.reduce((sum, factor) => sum + factor, 0) / waterFactors.length;
  }
}