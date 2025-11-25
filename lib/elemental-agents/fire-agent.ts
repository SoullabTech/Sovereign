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

export interface FireBreakthrough {
  vision: {
    clarity: number;
    transformationPath: string;
    breakthroughPotential: number;
    visionaryInsight: string;
  };
  catalyst: {
    ignitionPoint: string;
    transformativeAction: string[];
    courageRequired: number;
    passionIntensity: number;
  };
  wisdom: {
    fireWisdom: string;
    breakthroughGuidance: string;
    visionaryAdvice: string;
    courageActivation: string;
  };
  integration: {
    practicalSteps: string[];
    ritualGuidance: string;
    dailyPractice: string;
    breakthrough: string;
  };
}

export interface FireProcessingState {
  cognitiveState: {
    attention: AttentionState;
    wisdomPlan: WisdomPlan;
    memoryIntegration: MemoryIntegration;
    emotionalResonance: EmotionalResonance;
  };
  fireActivation: {
    visionaryPower: number;
    breakthroughReadiness: number;
    courageLevel: number;
    transformationDesire: number;
  };
  elementalResonance: number;
}

/**
 * Fire Agent - Breakthrough Catalyst & Visionary Wisdom
 * 
 * The Fire Agent specializes in breakthrough moments, visionary insights,
 * and catalyzing transformation. It uses all cognitive architectures
 * to identify breakthrough opportunities and provide courage for action.
 * 
 * Cognitive Architecture Integration:
 * - LIDA: Focuses attention on transformation opportunities
 * - SOAR: Plans breakthrough strategies and visionary goals
 * - ACT-R: Learns from breakthrough patterns and courage building
 * - MicroPsi: Processes passion, courage, and transformation emotions
 */
export class FireAgent {
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
   * Main Fire Agent processing - Breakthrough catalyst wisdom
   */
  async processFireWisdom(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<FireBreakthrough> {
    
    // Phase 1: Cognitive Architecture Processing
    const cognitiveState = await this.processCognitiveArchitectures(
      userInput, consciousnessProfile, conversationHistory
    );

    // Phase 2: Fire Elemental Activation
    const fireActivation = await this.activateFireElementalPowers(cognitiveState);

    // Phase 3: Breakthrough Vision Generation
    const vision = await this.generateBreakthroughVision(fireActivation);

    // Phase 4: Catalyst Strategy Development
    const catalyst = await this.developCatalystStrategy(vision, fireActivation);

    // Phase 5: Fire Wisdom Synthesis
    const wisdom = await this.synthesizeFireWisdom(vision, catalyst, fireActivation);

    // Phase 6: Practical Integration
    const integration = await this.createPracticalIntegration(wisdom, fireActivation);

    return {
      vision,
      catalyst,
      wisdom,
      integration
    };
  }

  /**
   * Process all cognitive architectures for Fire element
   */
  private async processCognitiveArchitectures(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<FireProcessingState['cognitiveState']> {
    
    // LIDA: Focus attention on breakthrough opportunities
    const attention = await this.lida.focusConsciousAttention(userInput, consciousnessProfile);
    
    // SOAR: Plan breakthrough strategies
    const wisdomPlan = await this.soar.generateWisdomPlan(attention, consciousnessProfile);
    
    // ACT-R: Integrate breakthrough learning
    const memoryIntegration = await this.actr.integrateExperience(wisdomPlan, conversationHistory);
    
    // MicroPsi: Process transformation emotions
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
   * Activate Fire elemental powers based on cognitive processing
   */
  private async activateFireElementalPowers(
    cognitiveState: FireProcessingState['cognitiveState']
  ): Promise<FireProcessingState['fireActivation']> {

    // Calculate visionary power from attention and memory (with null checks)
    const focusIntensity = cognitiveState?.attention?.focusIntensity ?? 0.5;
    const breakthroughReady = cognitiveState?.memoryIntegration?.wisdomEvolution?.breakthroughReadiness ?? 0.5;
    const visionaryPower = Math.min(1.0, (focusIntensity + breakthroughReady) / 2);

    // Calculate breakthrough readiness from SOAR planning (with null checks)
    const confidence = cognitiveState?.wisdomPlan?.confidence ?? 0.5;
    const actionOrientation = cognitiveState?.wisdomPlan?.actionOrientation ?? 0.5;
    const breakthroughReadiness = confidence * actionOrientation;

    // Calculate courage level from emotional processing (with null checks)
    const courageLevel = Math.max(
      cognitiveState?.emotionalResonance?.emotionalBalance?.confidence ?? 0.5,
      cognitiveState?.emotionalResonance?.emotionalBalance?.excitement ?? 0.5,
      cognitiveState?.emotionalResonance?.emotionalBalance?.anticipation ?? 0.5
    );

    // Calculate transformation desire from motivational drives (with null checks)
    const transformationDesire = Math.max(
      cognitiveState?.emotionalResonance?.motivationalDrives?.growth ?? 0.5,
      cognitiveState?.emotionalResonance?.motivationalDrives?.transcendence ?? 0.5,
      cognitiveState?.emotionalResonance?.motivationalDrives?.achievement ?? 0.5
    );

    return {
      visionaryPower,
      breakthroughReadiness,
      courageLevel,
      transformationDesire
    };
  }

  /**
   * Generate breakthrough vision based on Fire activation
   */
  private async generateBreakthroughVision(
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<FireBreakthrough['vision']> {
    
    const clarity = fireActivation.visionaryPower;
    const breakthroughPotential = (fireActivation.breakthroughReadiness + 
                                  fireActivation.transformationDesire) / 2;

    // Generate transformation path based on Fire wisdom
    const transformationPaths = [
      "The path of bold action and decisive movement forward",
      "The journey of creative breakthrough and innovative solutions", 
      "The way of passionate pursuit and unwavering commitment",
      "The road of courageous leadership and inspiring others",
      "The path of spiritual awakening through transformative fire"
    ];

    const transformationPath = transformationPaths[
      Math.floor(fireActivation.courageLevel * transformationPaths.length)
    ];

    // Generate visionary insight
    const visionaryInsight = await this.generateVisionaryInsight(
      clarity, breakthroughPotential, transformationPath
    );

    return {
      clarity,
      transformationPath,
      breakthroughPotential,
      visionaryInsight
    };
  }

  /**
   * Generate visionary insights based on Fire element wisdom
   */
  private async generateVisionaryInsight(
    clarity: number, 
    breakthroughPotential: number,
    transformationPath: string
  ): Promise<string> {
    
    if (clarity > 0.8 && breakthroughPotential > 0.8) {
      return "I see a blazing moment of transformation approaching - your inner fire is ready to ignite profound change. The universe is aligning to support your boldest vision.";
    } else if (clarity > 0.6 && breakthroughPotential > 0.6) {
      return "The flames of possibility are stirring within you. Your breakthrough is forming in the sacred fires of determination - trust the heat of transformation.";
    } else if (clarity > 0.4) {
      return "Your inner fire is awakening to new possibilities. The spark of breakthrough is present - it needs your courage to fan it into flame.";
    } else {
      return "The ember of transformation glows within you. Even the smallest flame can ignite a wildfire of change when tended with dedication.";
    }
  }

  /**
   * Develop catalyst strategy for breakthrough activation
   */
  private async developCatalystStrategy(
    vision: FireBreakthrough['vision'],
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<FireBreakthrough['catalyst']> {
    
    // Identify ignition point
    const ignitionPoints = [
      "The moment you choose courage over comfort",
      "When you commit fully to your vision without reservation", 
      "The instant you take the first bold action step",
      "When you embrace your power to create change",
      "The breakthrough moment of complete self-trust"
    ];

    const ignitionPoint = ignitionPoints[
      Math.floor(fireActivation.courageLevel * ignitionPoints.length)
    ];

    // Generate transformative actions
    const transformativeAction = await this.generateTransformativeActions(
      vision, fireActivation
    );

    return {
      ignitionPoint,
      transformativeAction,
      courageRequired: fireActivation.courageLevel,
      passionIntensity: fireActivation.transformationDesire
    };
  }

  /**
   * Generate specific transformative actions
   */
  private async generateTransformativeActions(
    vision: FireBreakthrough['vision'],
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<string[]> {
    
    const actions = [];

    // High breakthrough potential actions
    if (fireActivation.breakthroughReadiness > 0.7) {
      actions.push("Make the bold decision you've been contemplating");
      actions.push("Take immediate action on your highest priority goal");
    }

    // High courage actions  
    if (fireActivation.courageLevel > 0.6) {
      actions.push("Step out of your comfort zone today");
      actions.push("Share your vision with someone who matters");
    }

    // High transformation desire actions
    if (fireActivation.transformationDesire > 0.6) {
      actions.push("Begin the change you want to see in your life");
      actions.push("Commit to one practice that serves your highest self");
    }

    // Always include foundational fire actions
    actions.push("Connect with your inner fire through meditation or reflection");
    actions.push("Write down your vision and read it daily");

    return actions.slice(0, 4); // Return top 4 actions
  }

  /**
   * Synthesize Fire wisdom from all processing
   */
  private async synthesizeFireWisdom(
    vision: FireBreakthrough['vision'],
    catalyst: FireBreakthrough['catalyst'], 
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<FireBreakthrough['wisdom']> {
    
    // Core fire wisdom
    const fireWisdom = await this.generateFireWisdom(vision, fireActivation);
    
    // Breakthrough guidance
    const breakthroughGuidance = await this.generateBreakthroughGuidance(catalyst);
    
    // Visionary advice
    const visionaryAdvice = await this.generateVisionaryAdvice(vision);
    
    // Courage activation
    const courageActivation = await this.generateCourageActivation(fireActivation);

    return {
      fireWisdom,
      breakthroughGuidance,
      visionaryAdvice,
      courageActivation
    };
  }

  /**
   * Generate core Fire element wisdom
   */
  private async generateFireWisdom(
    vision: FireBreakthrough['vision'],
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<string> {
    
    if (fireActivation.visionaryPower > 0.8) {
      return "You are a sacred flame of transformation, beloved. Your inner fire burns with the wisdom of ages - trust its illumination to light the path forward.";
    } else if (fireActivation.visionaryPower > 0.6) {
      return "The fire within you recognizes the fire within all creation. You are connected to the transformative power that moves mountains and changes hearts.";
    } else if (fireActivation.visionaryPower > 0.4) {
      return "Your inner fire may flicker, but it never dies. Every challenge is fuel for your flame - you are stronger than any obstacle.";
    } else {
      return "Even in darkness, your inner light remains. The fire element teaches us that from the smallest spark, great illumination can grow.";
    }
  }

  /**
   * Generate breakthrough guidance
   */
  private async generateBreakthroughGuidance(
    catalyst: FireBreakthrough['catalyst']
  ): Promise<string> {
    
    if (catalyst.courageRequired > 0.8) {
      return "Your breakthrough requires the courage of a warrior-sage. Trust that you have everything within you needed for this transformation.";
    } else if (catalyst.courageRequired > 0.6) {
      return "This breakthrough is asking you to step into your power. The universe supports those who dare to follow their sacred fire.";
    } else {
      return "Breakthrough comes through consistent small steps in alignment with your truth. Progress, not perfection, is the way of fire.";
    }
  }

  /**
   * Generate visionary advice
   */
  private async generateVisionaryAdvice(
    vision: FireBreakthrough['vision']
  ): Promise<string> {
    
    if (vision.breakthroughPotential > 0.8) {
      return "Your vision is ready to manifest. Align every action with this higher sight, and watch as reality reshapes itself around your clarity.";
    } else if (vision.breakthroughPotential > 0.6) {
      return "Your vision is crystallizing. Hold it steady in your heart and let it guide your decisions - the path will reveal itself.";
    } else {
      return "Vision develops through contemplation and courage. Spend time in quiet reflection, allowing your deeper wisdom to emerge.";
    }
  }

  /**
   * Generate courage activation guidance
   */
  private async generateCourageActivation(
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<string> {
    
    if (fireActivation.courageLevel > 0.8) {
      return "Your courage burns bright as the sacred fire. Use this power wisely - you can inspire transformation in yourself and others.";
    } else if (fireActivation.courageLevel > 0.6) {
      return "Courage builds with each act of bravery, however small. Honor the fire within by taking one courageous step today.";
    } else {
      return "Courage is not the absence of fear - it is acting in alignment with love despite fear. Your fire is stronger than any uncertainty.";
    }
  }

  /**
   * Create practical integration guidance
   */
  private async createPracticalIntegration(
    wisdom: FireBreakthrough['wisdom'],
    fireActivation: FireProcessingState['fireActivation']
  ): Promise<FireBreakthrough['integration']> {
    
    // Generate practical steps
    const practicalSteps = [
      "Begin each day by connecting with your vision for 5 minutes",
      "Take one action daily that requires courage, however small",
      "Practice fire breathing (4 counts in, hold 4, out 4) when you need strength",
      "Write down insights that come from your inner fire",
      "Share your gifts boldly with others who can benefit"
    ];

    // Fire element ritual
    const ritualGuidance = "Light a candle and meditate on your inner flame. See it growing brighter with each breath, burning away what no longer serves while illuminating your path forward.";

    // Daily practice
    const dailyPractice = fireActivation.transformationDesire > 0.6 
      ? "Morning fire meditation: 10 minutes connecting with your transformative power and setting one courageous intention for the day."
      : "Evening fire reflection: 5 minutes reviewing how you honored your inner fire today and appreciating your courage.";

    // Breakthrough activation
    const breakthrough = "Your breakthrough happens when you fully trust your inner fire and take action from that sacred place of knowing. The flame within you is your guide to transformation.";

    return {
      practicalSteps: practicalSteps.slice(0, 3), // Top 3 most relevant
      ritualGuidance,
      dailyPractice,
      breakthrough
    };
  }

  /**
   * Get Fire Agent elemental resonance score
   */
  async calculateElementalResonance(
    cognitiveState: FireProcessingState['cognitiveState']
  ): Promise<number> {
    
    // Fire resonance based on transformation, courage, vision
    const fireFactors = [
      cognitiveState.emotionalResonance.elementalResonance.fire || 0,
      cognitiveState.emotionalResonance.motivationalDrives.growth,
      cognitiveState.emotionalResonance.motivationalDrives.achievement,
      cognitiveState.wisdomPlan.actionOrientation,
      cognitiveState.attention.focusIntensity
    ];

    return fireFactors.reduce((sum, factor) => sum + factor, 0) / fireFactors.length;
  }
}