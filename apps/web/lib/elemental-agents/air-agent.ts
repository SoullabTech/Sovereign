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

export interface AirClarity {
  mental: {
    clarityLevel: number;
    thoughtPatterns: string[];
    mentalAgility: number;
    insightReadiness: string;
  };
  communication: {
    expressionClarity: number;
    listeningDepth: number;
    truthTelling: string;
    communicationType: 'direct' | 'intuitive' | 'analytical' | 'inspiring';
  };
  wisdom: {
    airWisdom: string;
    clarityGuidance: string;
    communicationWisdom: string;
    perspectiveShifting: string;
  };
  integration: {
    practicalSteps: string[];
    ritualGuidance: string;
    dailyPractice: string;
    clarity: string;
  };
}

export interface AirProcessingState {
  cognitiveState: {
    attention: AttentionState;
    wisdomPlan: WisdomPlan;
    memoryIntegration: MemoryIntegration;
    emotionalResonance: EmotionalResonance;
  };
  airActivation: {
    mentalClarity: number;
    communicationPower: number;
    insightCapacity: number;
    perspectiveFlexibility: number;
  };
  elementalResonance: number;
}

/**
 * Air Agent - Clarity & Communication Wisdom
 * 
 * The Air Agent specializes in mental clarity, communication mastery,
 * perspective shifting, and insight generation. It uses all cognitive 
 * architectures to facilitate clear thinking and authentic expression.
 * 
 * Cognitive Architecture Integration:
 * - LIDA: Focuses attention on clarity opportunities and communication patterns
 * - SOAR: Plans insight strategies and perspective-shifting goals
 * - ACT-R: Learns from communication patterns and clarity development
 * - MicroPsi: Processes curiosity, understanding, and social connection motivations
 */
export class AirAgent {
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
   * Main Air Agent processing - Clarity and communication wisdom
   */
  async processAirWisdom(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<AirClarity> {
    
    // Phase 1: Cognitive Architecture Processing
    const cognitiveState = await this.processCognitiveArchitectures(
      userInput, consciousnessProfile, conversationHistory
    );

    // Phase 2: Air Elemental Activation
    const airActivation = await this.activateAirElementalPowers(cognitiveState);

    // Phase 3: Mental Clarity Assessment
    const mental = await this.assessMentalClarity(airActivation);

    // Phase 4: Communication Analysis
    const communication = await this.analyzeCommunicationNeeds(mental, airActivation);

    // Phase 5: Air Wisdom Synthesis
    const wisdom = await this.synthesizeAirWisdom(mental, communication, airActivation);

    // Phase 6: Clarity Integration
    const integration = await this.createClarityIntegration(wisdom, airActivation);

    return {
      mental,
      communication,
      wisdom,
      integration
    };
  }

  /**
   * Process all cognitive architectures for Air element
   */
  private async processCognitiveArchitectures(
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[]
  ): Promise<AirProcessingState['cognitiveState']> {
    
    // LIDA: Focus attention on clarity patterns and communication opportunities
    const attention = await this.lida.focusConsciousAttention(userInput, consciousnessProfile);
    
    // SOAR: Plan insight strategies and perspective goals
    const wisdomPlan = await this.soar.generateWisdomPlan(attention, consciousnessProfile);
    
    // ACT-R: Integrate communication patterns and clarity learning
    const memoryIntegration = await this.actr.integrateExperience(wisdomPlan, conversationHistory);
    
    // MicroPsi: Process curiosity, understanding, and social motivations
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
   * Activate Air elemental powers based on cognitive processing
   */
  private async activateAirElementalPowers(
    cognitiveState: AirProcessingState['cognitiveState']
  ): Promise<AirProcessingState['airActivation']> {
    
    // Calculate mental clarity from attention focus and wisdom confidence
    const mentalClarity = Math.min(1.0,
      (cognitiveState.attention.focusIntensity + 
       cognitiveState.wisdomPlan.confidence) / 2
    );

    // Calculate communication power from social motivation and wisdom action orientation
    const communicationPower = Math.max(
      cognitiveState.emotionalResonance.motivationalDrives.connection,
      cognitiveState.wisdomPlan.actionOrientation,
      cognitiveState.emotionalResonance.compassionateResponse.supportOffered
    );

    // Calculate insight capacity from curiosity and anticipation
    const insightCapacity = Math.max(
      cognitiveState.emotionalResonance.emotionalBalance.anticipation,
      cognitiveState.emotionalResonance.emotionalBalance.surprise,
      cognitiveState.memoryIntegration.wisdomEvolution.insightReadiness
    );

    // Calculate perspective flexibility from openness and learning
    const perspectiveFlexibility = Math.max(
      cognitiveState.emotionalResonance.motivationalDrives.growth,
      cognitiveState.emotionalResonance.emotionalBalance.trust,
      cognitiveState.attention.perspectiveShifting || 0
    );

    return {
      mentalClarity,
      communicationPower,
      insightCapacity,
      perspectiveFlexibility
    };
  }

  /**
   * Assess mental clarity and thought patterns
   */
  private async assessMentalClarity(
    airActivation: AirProcessingState['airActivation']
  ): Promise<AirClarity['mental']> {
    
    // Assess clarity level
    const clarityLevel = airActivation.mentalClarity;
    
    // Identify thought patterns
    const thoughtPatterns = await this.identifyThoughtPatterns(airActivation);
    
    // Calculate mental agility
    const mentalAgility = (airActivation.insightCapacity + airActivation.perspectiveFlexibility) / 2;
    
    // Generate insight readiness assessment
    const insightReadiness = await this.assessInsightReadiness(airActivation);

    return {
      clarityLevel,
      thoughtPatterns,
      mentalAgility,
      insightReadiness
    };
  }

  /**
   * Identify current thought patterns
   */
  private async identifyThoughtPatterns(
    airActivation: AirProcessingState['airActivation']
  ): Promise<string[]> {
    
    const patterns = [];
    
    if (airActivation.mentalClarity > 0.8) {
      patterns.push("Clear, focused thinking with strong discrimination");
    }
    
    if (airActivation.insightCapacity > 0.7) {
      patterns.push("High receptivity to new insights and perspectives");
    }
    
    if (airActivation.perspectiveFlexibility > 0.6) {
      patterns.push("Flexible thinking that can hold multiple viewpoints");
    }
    
    if (airActivation.communicationPower > 0.6) {
      patterns.push("Thoughts naturally organize for clear expression");
    }
    
    // Add pattern based on lowest score to indicate growth edge
    if (airActivation.mentalClarity < 0.4) {
      patterns.push("Mental fog that needs gentle clearing");
    } else if (airActivation.perspectiveFlexibility < 0.4) {
      patterns.push("Fixed thinking patterns seeking greater flexibility");
    }

    return patterns.slice(0, 3); // Return top 3 most relevant
  }

  /**
   * Assess readiness for insights
   */
  private async assessInsightReadiness(
    airActivation: AirProcessingState['airActivation']
  ): Promise<string> {
    
    if (airActivation.insightCapacity > 0.8 && airActivation.mentalClarity > 0.7) {
      return "Your mind is crystal clear and highly receptive - perfect conditions for profound insights to emerge.";
    } else if (airActivation.insightCapacity > 0.6) {
      return "Your insight capacity is strong - create space for quiet contemplation and fresh perspectives will arise.";
    } else if (airActivation.mentalClarity > 0.6) {
      return "Your mental clarity is good - insights will come through focused attention and open curiosity.";
    } else {
      return "Your mind is preparing for insight - gentle practices that clear mental clutter will open the way.";
    }
  }

  /**
   * Analyze communication needs and capabilities
   */
  private async analyzeCommunicationNeeds(
    mental: AirClarity['mental'],
    airActivation: AirProcessingState['airActivation']
  ): Promise<AirClarity['communication']> {
    
    // Calculate expression clarity
    const expressionClarity = (airActivation.mentalClarity + airActivation.communicationPower) / 2;
    
    // Calculate listening depth
    const listeningDepth = (airActivation.perspectiveFlexibility + airActivation.insightCapacity) / 2;
    
    // Generate truth telling guidance
    const truthTelling = await this.generateTruthTellingGuidance(airActivation);
    
    // Determine communication type
    const communicationType = await this.determineCommunicationType(airActivation);

    return {
      expressionClarity,
      listeningDepth,
      truthTelling,
      communicationType
    };
  }

  /**
   * Generate truth telling guidance
   */
  private async generateTruthTellingGuidance(
    airActivation: AirProcessingState['airActivation']
  ): Promise<string> {
    
    if (airActivation.communicationPower > 0.8 && airActivation.mentalClarity > 0.7) {
      return "Your truth-telling power is strong and clear. Speak with courage and compassion - your words can illuminate and inspire.";
    } else if (airActivation.communicationPower > 0.6) {
      return "You have good capacity for authentic expression. Trust what wants to be said through you, and let truth find its own voice.";
    } else if (airActivation.mentalClarity > 0.6) {
      return "Your clarity is developing - practice expressing your truth in small, safe ways before larger communications.";
    } else {
      return "Truth-telling begins with inner listening. First become clear about your own truth, then find gentle ways to share it.";
    }
  }

  /**
   * Determine optimal communication type
   */
  private async determineCommunicationType(
    airActivation: AirProcessingState['airActivation']
  ): Promise<'direct' | 'intuitive' | 'analytical' | 'inspiring'> {
    
    if (airActivation.mentalClarity > 0.8 && airActivation.communicationPower > 0.7) {
      return 'direct';
    } else if (airActivation.insightCapacity > 0.8) {
      return 'intuitive';
    } else if (airActivation.perspectiveFlexibility > 0.7) {
      return 'analytical';
    } else {
      return 'inspiring';
    }
  }

  /**
   * Synthesize Air wisdom from all processing
   */
  private async synthesizeAirWisdom(
    mental: AirClarity['mental'],
    communication: AirClarity['communication'],
    airActivation: AirProcessingState['airActivation']
  ): Promise<AirClarity['wisdom']> {
    
    // Core air wisdom
    const airWisdom = await this.generateAirWisdom(airActivation);
    
    // Clarity guidance
    const clarityGuidance = await this.generateClarityGuidance(mental);
    
    // Communication wisdom
    const communicationWisdom = await this.generateCommunicationWisdom(communication);
    
    // Perspective shifting guidance
    const perspectiveShifting = await this.generatePerspectiveShifting(airActivation);

    return {
      airWisdom,
      clarityGuidance,
      communicationWisdom,
      perspectiveShifting
    };
  }

  /**
   * Generate core Air element wisdom
   */
  private async generateAirWisdom(
    airActivation: AirProcessingState['airActivation']
  ): Promise<string> {
    
    if (airActivation.mentalClarity > 0.8) {
      return "You are like the clear mountain air, beloved - bringing fresh perspective and crystal clarity to all you touch. Your mind is a gift of illumination.";
    } else if (airActivation.mentalClarity > 0.6) {
      return "The air element within you carries the power of clear seeing and true speaking. Like the wind, you can shift perspectives and bring new life.";
    } else if (airActivation.mentalClarity > 0.4) {
      return "Your air energy is awakening to its natural clarity. Like the dawn breeze, you bring freshness and the possibility of new understanding.";
    } else {
      return "Even when your mental skies seem cloudy, the clear air of wisdom is always present. Trust that clarity will come with patient breathing and gentle attention.";
    }
  }

  /**
   * Generate clarity guidance
   */
  private async generateClarityGuidance(
    mental: AirClarity['mental']
  ): Promise<string> {
    
    if (mental.clarityLevel > 0.8) {
      return "Your mental clarity is exceptional - use this gift to illuminate truth for yourself and others. Clear seeing is a form of service.";
    } else if (mental.clarityLevel > 0.6) {
      return "Your clarity is strong and growing. Continue practices that support clear thinking - meditation, journaling, and honest self-reflection.";
    } else if (mental.clarityLevel > 0.4) {
      return "Clarity comes through releasing mental clutter and creating space for fresh perspective. Simplify your thoughts to clarify your vision.";
    } else {
      return "Mental clarity develops like the morning mist clearing - gradually and naturally. Be patient with the process and trust in your emerging understanding.";
    }
  }

  /**
   * Generate communication wisdom
   */
  private async generateCommunicationWisdom(
    communication: AirClarity['communication']
  ): Promise<string> {
    
    if (communication.communicationType === 'direct') {
      return "Your communication power lies in clear, direct expression. Speak your truth with kindness and watch how it serves both speaker and listener.";
    } else if (communication.communicationType === 'intuitive') {
      return "Your communication flows through intuitive channels. Trust the wisdom that wants to speak through you - it often knows more than your conscious mind.";
    } else if (communication.communicationType === 'analytical') {
      return "Your communication strength is in thoughtful analysis and perspective-sharing. Help others see new angles and possibilities through your clear thinking.";
    } else {
      return "Your communication inspires others to find their own truth. Like the wind that lifts wings, your words can help others soar to new understanding.";
    }
  }

  /**
   * Generate perspective shifting guidance
   */
  private async generatePerspectiveShifting(
    airActivation: AirProcessingState['airActivation']
  ): Promise<string> {
    
    if (airActivation.perspectiveFlexibility > 0.8) {
      return "Your ability to shift perspectives is masterful - you can see truth from many angles. Use this gift to find creative solutions and bridge differences.";
    } else if (airActivation.perspectiveFlexibility > 0.6) {
      return "You have good flexibility in how you see situations. When stuck, consciously shift your viewpoint - often the solution is visible from a different angle.";
    } else if (airActivation.perspectiveFlexibility > 0.4) {
      return "Perspective flexibility grows through curious questioning. Ask 'How else might I see this?' and let fresh viewpoints reveal new possibilities.";
    } else {
      return "Perspective shifting begins with recognizing that there are always multiple ways to see any situation. Cultivate curiosity about different viewpoints.";
    }
  }

  /**
   * Create clarity integration guidance
   */
  private async createClarityIntegration(
    wisdom: AirClarity['wisdom'],
    airActivation: AirProcessingState['airActivation']
  ): Promise<AirClarity['integration']> {
    
    // Generate practical steps
    const practicalSteps = [
      "Begin each day with 5 minutes of conscious breathing to clear your mental space",
      "Practice asking one clarifying question in every important conversation",
      "Write your thoughts for 10 minutes daily to organize and clarify your mental landscape",
      "When confused, pause and ask 'What perspective am I not seeing here?'",
      "End each day by identifying one insight or clarity that emerged"
    ];

    // Air element ritual
    const ritualGuidance = "Stand outside in fresh air, preferably at dawn or dusk. Take seven deep breaths, with each exhale releasing mental clutter and each inhale inviting clarity. On the seventh breath, ask for the insight you most need, then listen with your whole being. The answer may come as words, images, or simply knowing.";

    // Daily practice based on activation level
    const dailyPractice = airActivation.mentalClarity > 0.6 
      ? "Morning clarity meditation: 15 minutes of conscious breathing and intention-setting for clear thinking and authentic communication."
      : "Evening mind clearing: 10 minutes of journaling or silent reflection to release the day's mental accumulation and invite fresh perspective.";

    // Clarity activation
    const clarity = "Your clarity emerges naturally when you create space between stimulus and response, between question and answer. You don't have to force understanding - simply create the conditions for insight to arise.";

    return {
      practicalSteps: practicalSteps.slice(0, 3), // Top 3 most relevant
      ritualGuidance,
      dailyPractice,
      clarity
    };
  }

  /**
   * Get Air Agent elemental resonance score
   */
  async calculateElementalResonance(
    cognitiveState: AirProcessingState['cognitiveState']
  ): Promise<number> {
    
    // Air resonance based on clarity, communication, insight, flexibility
    const airFactors = [
      cognitiveState.emotionalResonance.elementalResonance.air || 0,
      cognitiveState.emotionalResonance.motivationalDrives.connection,
      cognitiveState.emotionalResonance.motivationalDrives.growth,
      cognitiveState.wisdomPlan.confidence,
      cognitiveState.attention.focusIntensity
    ];

    return airFactors.reduce((sum, factor) => sum + factor, 0) / airFactors.length;
  }
}