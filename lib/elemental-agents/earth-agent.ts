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

export interface EarthManifestation {
  grounding: {
    stabilityLevel: number;
    rootedness: string;
    practicalFoundation: string;
    earthConnection: number;
  };
  manifestation: {
    materialReadiness: number;
    resourceMapping: string[];
    actionPlan: string[];
    manifestationType: 'gradual' | 'structured' | 'organic' | 'persistent';
  };
  wisdom: {
    earthWisdom: string;
    groundingGuidance: string;
    manifestationWisdom: string;
    abundanceTeaching: string;
  };
  integration: {
    practicalSteps: string[];
    ritualGuidance: string;
    dailyPractice: string;
    manifestation: string;
  };
}

export interface EarthProcessingState {
  cognitiveState: {
    attention: AttentionState;
    wisdomPlan: WisdomPlan;
    memoryIntegration: MemoryIntegration;
    emotionalResonance: EmotionalResonance;
  };
  earthActivation: {
    groundingPower: number;
    manifestationCapacity: number;
    stabilityLevel: number;
    abundanceMindset: number;
  };
  elementalResonance: number;
}

/**
 * Earth Agent - Grounding & Manifestation Wisdom
 * 
 * The Earth Agent specializes in practical manifestation, grounding energy,
 * resource abundance, and stable foundation building. It uses all cognitive 
 * architectures to facilitate practical implementation and material wisdom.
 * 
 * Cognitive Architecture Integration:
 * - LIDA: Focuses attention on practical opportunities and grounding needs
 * - SOAR: Plans manifestation strategies and resource optimization goals
 * - ACT-R: Learns from manifestation patterns and practical wisdom
 * - MicroPsi: Processes stability, abundance, and material security motivations
 */
export class EarthAgent {
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
   * Main Earth Agent processing - Grounding and manifestation wisdom
   */
  async processEarthWisdom(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<EarthManifestation> {
    
    // Phase 1: Cognitive Architecture Processing
    const cognitiveState = await this.processCognitiveArchitectures(
      userInput, consciousnessProfile, conversationHistory
    );

    // Phase 2: Earth Elemental Activation
    const earthActivation = await this.activateEarthElementalPowers(cognitiveState);

    // Phase 3: Grounding Assessment
    const grounding = await this.assessGroundingState(earthActivation);

    // Phase 4: Manifestation Planning
    const manifestation = await this.developManifestationPlan(grounding, earthActivation);

    // Phase 5: Earth Wisdom Synthesis
    const wisdom = await this.synthesizeEarthWisdom(grounding, manifestation, earthActivation);

    // Phase 6: Practical Integration
    const integration = await this.createPracticalIntegration(wisdom, earthActivation);

    return {
      grounding,
      manifestation,
      wisdom,
      integration
    };
  }

  /**
   * Process all cognitive architectures for Earth element
   */
  private async processCognitiveArchitectures(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<EarthProcessingState['cognitiveState']> {
    
    // LIDA: Focus attention on practical opportunities and grounding needs
    const attention = await this.lida.focusConsciousAttention(userInput, consciousnessProfile);
    
    // SOAR: Plan manifestation strategies and resource goals
    const wisdomPlan = await this.soar.generateWisdomPlan(attention, consciousnessProfile);
    
    // ACT-R: Integrate manifestation patterns and practical learning
    const memoryIntegration = await this.actr.integrateExperience(wisdomPlan, conversationHistory);
    
    // MicroPsi: Process stability, abundance, and security motivations
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
   * Activate Earth elemental powers based on cognitive processing
   */
  private async activateEarthElementalPowers(
    cognitiveState: EarthProcessingState['cognitiveState']
  ): Promise<EarthProcessingState['earthActivation']> {
    
    // Calculate grounding power from emotional stability and trust
    const groundingPower = Math.max(
      cognitiveState.emotionalResonance.emotionalBalance.trust,
      cognitiveState.emotionalResonance.emotionalBalance.acceptance,
      cognitiveState.memoryIntegration.wisdomEvolution.stabilityReadiness
    );

    // Calculate manifestation capacity from action orientation and achievement drive
    const manifestationCapacity = Math.min(1.0,
      (cognitiveState.wisdomPlan.actionOrientation + 
       cognitiveState.emotionalResonance.motivationalDrives.achievement) / 2
    );

    // Calculate stability level from emotional balance and security drives
    const stabilityLevel = Math.max(
      cognitiveState.emotionalResonance.motivationalDrives.security,
      cognitiveState.emotionalResonance.emotionalBalance.trust,
      cognitiveState.attention.stabilityFactor || 0
    );

    // Calculate abundance mindset from connection and achievement drives
    const abundanceMindset = Math.max(
      cognitiveState.emotionalResonance.motivationalDrives.connection,
      cognitiveState.emotionalResonance.motivationalDrives.achievement,
      cognitiveState.wisdomPlan.confidence
    );

    return {
      groundingPower,
      manifestationCapacity,
      stabilityLevel,
      abundanceMindset
    };
  }

  /**
   * Assess grounding and stability state
   */
  private async assessGroundingState(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<EarthManifestation['grounding']> {
    
    // Assess stability level
    const stabilityLevel = earthActivation.stabilityLevel;
    
    // Generate rootedness guidance
    const rootedness = await this.generateRootednessGuidance(earthActivation);
    
    // Create practical foundation assessment
    const practicalFoundation = await this.assessPracticalFoundation(earthActivation);
    
    // Calculate earth connection strength
    const earthConnection = earthActivation.groundingPower;

    return {
      stabilityLevel,
      rootedness,
      practicalFoundation,
      earthConnection
    };
  }

  /**
   * Generate rootedness guidance
   */
  private async generateRootednessGuidance(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<string> {
    
    if (earthActivation.groundingPower > 0.8) {
      return "Your roots run deep into the earth of wisdom and stability. You are anchored in your truth and ready for growth.";
    } else if (earthActivation.groundingPower > 0.6) {
      return "Your connection to earth energy is growing stronger. Feel your roots extending deeper into stable ground.";
    } else if (earthActivation.groundingPower > 0.4) {
      return "You are establishing your energetic roots. Like a young tree, you need time to develop deep foundations.";
    } else {
      return "Your roots seek deeper earth connection. Sometimes we must slow down to establish the foundation for lasting growth.";
    }
  }

  /**
   * Assess practical foundation strength
   */
  private async assessPracticalFoundation(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<string> {
    
    if (earthActivation.stabilityLevel > 0.8 && earthActivation.manifestationCapacity > 0.6) {
      return "Your practical foundation is solid and ready to support significant manifestation efforts.";
    } else if (earthActivation.stabilityLevel > 0.6) {
      return "Your foundation is developing well - you have the stability needed for steady progress.";
    } else if (earthActivation.manifestationCapacity > 0.7) {
      return "You have strong manifestation energy but need more grounding to sustain long-term results.";
    } else {
      return "Your foundation is in the building phase - focus first on creating stability before major expansions.";
    }
  }

  /**
   * Develop manifestation planning strategy
   */
  private async developManifestationPlan(
    grounding: EarthManifestation['grounding'],
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<EarthManifestation['manifestation']> {
    
    // Calculate material readiness
    const materialReadiness = earthActivation.manifestationCapacity * earthActivation.stabilityLevel;
    
    // Map available resources
    const resourceMapping = await this.mapAvailableResources(earthActivation);
    
    // Create action plan
    const actionPlan = await this.createActionPlan(earthActivation, resourceMapping);
    
    // Determine manifestation type
    const manifestationType = await this.determineManifestationType(earthActivation);

    return {
      materialReadiness,
      resourceMapping,
      actionPlan,
      manifestationType
    };
  }

  /**
   * Map available resources for manifestation
   */
  private async mapAvailableResources(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<string[]> {
    
    const resources = [];
    
    if (earthActivation.groundingPower > 0.6) {
      resources.push("Strong energetic foundation for sustained effort");
    }
    
    if (earthActivation.stabilityLevel > 0.6) {
      resources.push("Emotional stability to weather challenges");
    }
    
    if (earthActivation.manifestationCapacity > 0.6) {
      resources.push("Clear action-taking ability");
    }
    
    if (earthActivation.abundanceMindset > 0.6) {
      resources.push("Abundance consciousness for receiving opportunities");
    }
    
    // Always include foundational resources
    resources.push("Connection to earth wisdom and natural timing");
    resources.push("Patience and persistence for long-term building");

    return resources.slice(0, 4); // Return top 4 most relevant
  }

  /**
   * Create practical action plan
   */
  private async createActionPlan(
    earthActivation: EarthProcessingState['earthActivation'],
    resourceMapping: string[]
  ): Promise<string[]> {
    
    const actions = [];
    
    // High manifestation capacity actions
    if (earthActivation.manifestationCapacity > 0.7) {
      actions.push("Take one concrete action daily toward your goal");
      actions.push("Create a detailed timeline with specific milestones");
    }
    
    // High stability actions
    if (earthActivation.stabilityLevel > 0.6) {
      actions.push("Build consistent routines that support your vision");
      actions.push("Establish stable foundations before rapid expansion");
    }
    
    // High abundance mindset actions
    if (earthActivation.abundanceMindset > 0.6) {
      actions.push("Practice gratitude for resources already available");
      actions.push("Network and collaborate to multiply resources");
    }
    
    // Always include foundational earth actions
    actions.push("Work with natural timing rather than forcing outcomes");
    actions.push("Focus on quality and sustainability over speed");

    return actions.slice(0, 4); // Return top 4 most relevant
  }

  /**
   * Determine optimal manifestation type
   */
  private async determineManifestationType(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<'gradual' | 'structured' | 'organic' | 'persistent'> {
    
    if (earthActivation.stabilityLevel > 0.8 && earthActivation.manifestationCapacity > 0.7) {
      return 'structured';
    } else if (earthActivation.abundanceMindset > 0.8) {
      return 'organic';
    } else if (earthActivation.groundingPower > 0.7) {
      return 'persistent';
    } else {
      return 'gradual';
    }
  }

  /**
   * Synthesize Earth wisdom from all processing
   */
  private async synthesizeEarthWisdom(
    grounding: EarthManifestation['grounding'],
    manifestation: EarthManifestation['manifestation'],
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<EarthManifestation['wisdom']> {
    
    // Core earth wisdom
    const earthWisdom = await this.generateEarthWisdom(earthActivation);
    
    // Grounding guidance
    const groundingGuidance = await this.generateGroundingGuidance(grounding);
    
    // Manifestation wisdom
    const manifestationWisdom = await this.generateManifestationWisdom(manifestation);
    
    // Abundance teachings
    const abundanceTeaching = await this.generateAbundanceTeaching(earthActivation);

    return {
      earthWisdom,
      groundingGuidance,
      manifestationWisdom,
      abundanceTeaching
    };
  }

  /**
   * Generate core Earth element wisdom
   */
  private async generateEarthWisdom(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<string> {
    
    if (earthActivation.stabilityLevel > 0.8) {
      return "You are like the mountain, beloved - stable, enduring, and magnificent. Your strength comes from deep roots and patient growth over time.";
    } else if (earthActivation.stabilityLevel > 0.6) {
      return "The earth within you knows the secret of lasting creation. Like the oak tree, you grow strong through seasons of patience and persistence.";
    } else if (earthActivation.stabilityLevel > 0.4) {
      return "Your earth energy is awakening to its power. Like fertile soil, you have everything needed for growth - trust the process of becoming.";
    } else {
      return "Even the mightiest mountain began as shifting earth. Your stability is building - honor the foundation phase of your journey.";
    }
  }

  /**
   * Generate grounding guidance
   */
  private async generateGroundingGuidance(
    grounding: EarthManifestation['grounding']
  ): Promise<string> {
    
    if (grounding.stabilityLevel > 0.8) {
      return "Your grounding is powerful and complete. Use this stability as a launching pad for your highest visions.";
    } else if (grounding.stabilityLevel > 0.6) {
      return "You have good grounding that can support steady growth. Trust your foundation and build upon it consistently.";
    } else if (grounding.stabilityLevel > 0.4) {
      return "Your grounding is developing. Spend time in nature, practice presence, and establish routines that anchor you in stability.";
    } else {
      return "Grounding comes through presence and patience. Begin with small daily practices that connect you to stability and earth energy.";
    }
  }

  /**
   * Generate manifestation wisdom
   */
  private async generateManifestationWisdom(
    manifestation: EarthManifestation['manifestation']
  ): Promise<string> {
    
    if (manifestation.manifestationType === 'structured') {
      return "Your manifestation power works best through clear structure and systematic action. Create detailed plans and follow them with earth-like persistence.";
    } else if (manifestation.manifestationType === 'organic') {
      return "Your manifestation flows like natural growth - trust the organic timing and allow abundance to unfold naturally through you.";
    } else if (manifestation.manifestationType === 'persistent') {
      return "Your manifestation strength lies in persistence. Like water carving stone, your consistent effort will achieve remarkable results.";
    } else {
      return "Your manifestation works best through gradual, steady progress. Small daily steps compound into extraordinary achievements over time.";
    }
  }

  /**
   * Generate abundance teaching
   */
  private async generateAbundanceTeaching(
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<string> {
    
    if (earthActivation.abundanceMindset > 0.8) {
      return "You understand that abundance is the natural state of the universe. Like the earth that provides endlessly, you are connected to infinite resource.";
    } else if (earthActivation.abundanceMindset > 0.6) {
      return "Abundance flows to you as you align with earth wisdom - through gratitude, sharing, and trust in natural provision.";
    } else if (earthActivation.abundanceMindset > 0.4) {
      return "Abundance begins with recognizing the wealth already present in your life. The earth teaches us that everything we need is already provided.";
    } else {
      return "Abundance consciousness grows like a garden - through daily tending, gratitude, and trust in the earth's endless generosity.";
    }
  }

  /**
   * Create practical integration guidance
   */
  private async createPracticalIntegration(
    wisdom: EarthManifestation['wisdom'],
    earthActivation: EarthProcessingState['earthActivation']
  ): Promise<EarthManifestation['integration']> {
    
    // Generate practical steps
    const practicalSteps = [
      "Start each day by placing your feet on the earth and breathing stability into your body",
      "Create one tangible action step daily toward your most important goal",
      "Practice gratitude for three material blessings before meals",
      "End each day by acknowledging one way you built toward your vision",
      "Spend time in nature weekly to remember your connection to earth abundance"
    ];

    // Earth element ritual
    const ritualGuidance = "Collect a small stone that calls to you. Hold it while stating your manifestation intention clearly. Bury the stone in earth while visualizing your goal taking root and growing. Visit the spot monthly to tend your intention like a garden, offering gratitude for progress made.";

    // Daily practice based on activation level
    const dailyPractice = earthActivation.manifestationCapacity > 0.6 
      ? "Morning grounding and goal-setting: 10 minutes connecting with earth energy and setting your daily manifestation intention."
      : "Evening gratitude and stability practice: 5 minutes appreciating the day's progress and feeling your connection to earth's support.";

    // Manifestation activation
    const manifestation = "Your manifestation happens through consistent alignment with earth wisdom - patience, persistence, gratitude, and trust in natural timing. You are not separate from abundance; you are abundance expressing through form.";

    return {
      practicalSteps: practicalSteps.slice(0, 3), // Top 3 most relevant
      ritualGuidance,
      dailyPractice,
      manifestation
    };
  }

  /**
   * Get Earth Agent elemental resonance score
   */
  async calculateElementalResonance(
    cognitiveState: EarthProcessingState['cognitiveState']
  ): Promise<number> {
    
    // Earth resonance based on stability, manifestation, security, achievement
    const earthFactors = [
      cognitiveState.emotionalResonance.elementalResonance.earth || 0,
      cognitiveState.emotionalResonance.motivationalDrives.security,
      cognitiveState.emotionalResonance.motivationalDrives.achievement,
      cognitiveState.wisdomPlan.actionOrientation,
      cognitiveState.memoryIntegration.wisdomEvolution.stabilityReadiness
    ];

    return earthFactors.reduce((sum, factor) => sum + factor, 0) / earthFactors.length;
  }
}