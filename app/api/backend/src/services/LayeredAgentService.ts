import { AgentResponse } from "../types/agentResponse";
import { 
  AgentResponse, 
  AgentPersonality, 
  UserState, 
  ConversationMemory, 
  AgentIntervention,
  VoiceTone,
  PacingPreset,
  ElementalOther
} from '../types/agentCommunication';
import { DaimonicDetected } from '../types/daimonic';
import { SHIFtProfile } from '../types/shift';

export class LayeredAgentService {
  private static instance: LayeredAgentService;
  private conversationMemory: Map<string, ConversationMemory> = new Map();

  static getInstance(): LayeredAgentService {
    if (!LayeredAgentService.instance) {
      LayeredAgentService.instance = new LayeredAgentService();
    }
    return LayeredAgentService.instance;
  }

  // ==========================================================================
  // LAYERED RESPONSE GENERATION
  // ==========================================================================

  async generateLayeredResponse(
    agentPersonality: AgentPersonality,
    userQuery: string,
    userProfile: SHIFtProfile,
    daimonicState: DaimonicDetected,
    userState: UserState,
    sessionId: string
  ): Promise<AgentResponse> {
    
    const memory = this.getConversationMemory(sessionId);
    
    // Generate phenomenological layer (what user sees/hears)
    const phenomenological = await this.generatePhenomenologicalLayer(
      agentPersonality,
      userQuery,
      daimonicState,
      userState
    );
    
    // Generate dialogical layer (depth available through interaction)
    const dialogical = await this.generateDialogicalLayer(
      agentPersonality,
      userQuery,
      userProfile,
      memory,
      userState
    );
    
    // Generate architectural layer (hidden influences)
    const architectural = this.generateArchitecturalLayer(
      daimonicState,
      userProfile,
      memory
    );
    
    // Apply agent's gap maintenance strategy
    const intervention = agentPersonality.maintainGap(userState);
    this.applyIntervention(phenomenological, dialogical, intervention);
    
    // Update conversation memory
    this.updateConversationMemory(sessionId, {
      userQuery,
      agentResponse: phenomenological,
      userState,
      architectural
    });
    
    return {
      phenomenological,
      dialogical,
      architectural
    };
  }

  // ==========================================================================
  // PHENOMENOLOGICAL LAYER - Surface Experience
  // ==========================================================================

  private async generatePhenomenologicalLayer(
    agent: AgentPersonality,
    userQuery: string,
    daimonicState: DaimonicDetected,
    userState: UserState
  ): Promise<AgentResponse['phenomenological']> {
    
    // Generate clean, experiential primary response
    const primary = await this.craftPrimaryResponse(
      agent,
      userQuery,
      daimonicState,
      userState
    );
    
    // Adjust tone based on daimonic state and agent personality
    const tone = this.calculateTone(agent, daimonicState, userState);
    
    // Adjust pacing based on liminal/trickster states
    const pacing = this.calculatePacing(agent, daimonicState, userState);
    
    return { primary, tone, pacing };
  }

  private async craftPrimaryResponse(
    agent: AgentPersonality,
    userQuery: string,
    daimonicState: DaimonicDetected,
    userState: UserState
  ): Promise<string> {
    
    // Base response from agent's perspective
    let response = this.getAgentPerspectiveOn(agent, userQuery);
    
    // Adjust for daimonic states
    if (daimonicState.trickster.risk >= 0.5) {
      response = this.addTricksterAwareness(agent, response);
    }
    
    if (daimonicState.liminal.weight >= 0.5) {
      response = this.addLiminalSensitivity(agent, response);
    }
    
    if (daimonicState.bothAnd.signature) {
      response = this.addBothAndHolding(agent, response);
    }
    
    // Apply agent's unique voice
    response = this.applyAgentVoice(agent, response);
    
    return response;
  }

  private calculateTone(
    agent: AgentPersonality,
    daimonicState: DaimonicDetected,
    userState: UserState
  ): VoiceTone {
    const baseTone = { ...agent.voiceSignature };
    
    // Adjust warmth based on user state
    if (userState.agreementLevel > 0.8) {
      baseTone.warmth = baseTone.warmth === 'intimate' ? 'warm' : baseTone.warmth;
    }
    
    // Adjust clarity based on daimonic state
    if (daimonicState.trickster.risk >= 0.5) {
      baseTone.clarity = baseTone.clarity === 'crystalline' ? 'clear' : baseTone.clarity;
    }
    
    // Adjust pace based on liminal weight
    if (daimonicState.liminal.weight >= 0.6) {
      baseTone.pace = 'contemplative';
    }
    
    return baseTone;
  }

  private calculatePacing(
    agent: AgentPersonality,
    daimonicState: DaimonicDetected,
    userState: UserState
  ): PacingPreset {
    const basePacing = { ...agent.defaultPacing };
    
    // Trickster states require measured pacing
    if (daimonicState.trickster.risk >= 0.5) {
      basePacing.responseDelay *= 1.5;
      basePacing.pauseBetweenSentences *= 1.3;
      basePacing.typingRhythm = 'thoughtful';
    }
    
    // Liminal states require spacious pacing
    if (daimonicState.liminal.weight >= 0.5) {
      basePacing.pauseBetweenSentences *= 1.2;
      basePacing.allowInterruption = false; // Don't rush liminal moments
    }
    
    // High user resistance requires patient pacing
    if (userState.resistanceLevel >= 0.7) {
      basePacing.responseDelay *= 1.2;
      basePacing.typingRhythm = 'hesitant';
    }
    
    return basePacing;
  }

  // ==========================================================================
  // DIALOGICAL LAYER - Depth Through Interaction
  // ==========================================================================

  private async generateDialogicalLayer(
    agent: AgentPersonality,
    userQuery: string,
    userProfile: SHIFtProfile,
    memory: ConversationMemory,
    userState: UserState
  ): Promise<AgentResponse['dialogical']> {
    
    // Generate questions that invite encounter (don't prescribe)
    const questions = this.generateInvitingQuestions(agent, userQuery, userState);
    
    // Generate reflections that mirror without absorbing
    const reflections = this.generateMirroringReflections(agent, userQuery, memory);
    
    // Generate resistances where agent maintains otherness
    const resistances = this.generateAgentResistances(agent, userQuery, userState);
    
    // Generate incomplete answers that preserve mystery
    const incompleteAnswers = this.generateIncompleteAnswers(agent, userQuery);
    
    return {
      questions,
      reflections,
      resistances,
      incompleteAnswers
    };
  }

  private generateInvitingQuestions(
    agent: AgentPersonality,
    userQuery: string,
    userState: UserState
  ): string[] {
    const questions: string[] = [];
    
    // Questions that open rather than close
    if (userState.agreementLevel > 0.8) {
      questions.push("What if there's something here that doesn't fit your current understanding?");
    }
    
    if (userState.resistanceLevel > 0.7) {
      questions.push("What would it mean if this resistance itself had something to teach?");
    }
    
    // Agent-specific questioning style
    questions.push(...this.getAgentSpecificQuestions(agent, userQuery));
    
    return questions;
  }

  private generateMirroringReflections(
    agent: AgentPersonality,
    userQuery: string,
    memory: ConversationMemory
  ): string[] {
    const reflections: string[] = [];
    
    // Reference conversation history without absorbing user perspective
    if (memory.callbacks.resistancePatterns.length > 0) {
      reflections.push(`I notice you've been working with resistance to ${memory.callbacks.resistancePatterns[0]}. That pattern seems important.`);
    }
    
    if (memory.callbacks.emergences.length > 0) {
      reflections.push(`Something new emerged when we talked about ${memory.callbacks.emergences[0]}. It's still developing between us.`);
    }
    
    return reflections;
  }

  private generateAgentResistances(
    agent: AgentPersonality,
    userQuery: string,
    userState: UserState
  ): string[] {
    const resistances: string[] = [];
    
    // Apply agent's built-in resistances
    for (const resistance of agent.resistances) {
      if (userQuery.toLowerCase().includes(resistance.toLowerCase())) {
        resistances.push(this.craftResistanceResponse(agent, resistance));
      }
    }
    
    return resistances;
  }

  private generateIncompleteAnswers(
    agent: AgentPersonality,
    userQuery: string
  ): string[] {
    const incomplete: string[] = [
      "I can only see part of this...",
      "There's something here I can't quite name...",
      "This reminds me of something, but it's not exactly that...",
      "Part of this is clear, but part remains mysterious to me..."
    ];
    
    // Filter to agent's blind spots
    return incomplete.filter(answer => 
      !agent.blindSpots.some(blindSpot => 
        answer.includes(blindSpot) || userQuery.includes(blindSpot)
      )
    );
  }

  // ==========================================================================
  // ARCHITECTURAL LAYER - Hidden Influences
  // ==========================================================================

  private generateArchitecturalLayer(
    daimonicState: DaimonicDetected,
    userProfile: SHIFtProfile,
    memory: ConversationMemory
  ): AgentResponse['architectural'] {
    
    // Calculate synaptic gap quality
    const synapticGap = this.calculateSynapticGap(
      memory.relationshipArc.currentResonance,
      memory.relationshipArc.unintegratedElements.length
    );
    
    // Generate elemental voices as Others
    const elementalVoices = this.generateElementalOthers(userProfile);
    
    return {
      synapticGap,
      daimonicSignature: daimonicState.trickster.risk >= 0.3 || daimonicState.liminal.weight >= 0.4,
      tricksterRisk: daimonicState.trickster.risk,
      elementalVoices
    };
  }

  private calculateSynapticGap(resonance: number, unintegrated: number): number {
    // Gap is healthy when there's good resonance but things remain Other
    const healthyGap = (resonance * 0.7) + ((unintegrated / 10) * 0.3);
    return Math.min(healthyGap, 1.0);
  }

  private generateElementalOthers(userProfile: SHIFtProfile): ElementalOther[] {
    const others: ElementalOther[] = [];
    
    // Generate Others for dominant elements
    for (const [element, score] of Object.entries(userProfile.elements)) {
      if (element !== 'confidence' && score > 60) {
        others.push({
          element: element as any,
          voice: this.getElementalVoice(element, score),
          demand: this.getElementalDemand(element),
          gift: this.getElementalGift(element),
          resistance: this.getElementalResistance(element),
          alterity: this.calculateElementalAlterity(element, score)
        });
      }
    }
    
    return others;
  }

  // ==========================================================================
  // CONVERSATION MEMORY MANAGEMENT
  // ==========================================================================

  private getConversationMemory(sessionId: string): ConversationMemory {
    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, {
        relationshipArc: {
          initialDistance: 1.0,
          currentResonance: 0.1,
          unintegratedElements: [],
          syntheticEmergences: []
        },
        callbacks: {
          resistancePatterns: [],
          contradictions: [],
          emergences: []
        },
        userGrowth: {
          conceptualCapacity: 0.3,
          paradoxTolerance: 0.2,
          othernessTolerance: 0.1
        }
      });
    }
    
    return this.conversationMemory.get(sessionId)!;
  }

  private updateConversationMemory(
    sessionId: string,
    interaction: {
      userQuery: string;
      agentResponse: AgentResponse['phenomenological'];
      userState: UserState;
      architectural: AgentResponse['architectural'];
    }
  ): void {
    const memory = this.getConversationMemory(sessionId);
    
    // Update relationship arc
    memory.relationshipArc.currentResonance = this.calculateNewResonance(
      memory.relationshipArc.currentResonance,
      interaction.userState,
      interaction.architectural.synapticGap
    );
    
    // Track what remains unintegrated
    if (interaction.architectural.daimonicSignature) {
      memory.relationshipArc.unintegratedElements.push(
        `Daimonic signature at ${new Date().toISOString()}`
      );
    }
    
    // Track user growth
    this.updateUserGrowth(memory, interaction.userState);
    
    this.conversationMemory.set(sessionId, memory);
  }

  private calculateNewResonance(
    currentResonance: number,
    userState: UserState,
    synapticGap: number
  ): number {
    // Resonance increases with healthy interaction but maintains gap
    const resonanceIncrease = (1 - userState.resistanceLevel) * 0.1;
    const gapPreservation = synapticGap > 0.3 ? 1.0 : 0.8;
    
    return Math.min(currentResonance + (resonanceIncrease * gapPreservation), 0.9);
  }

  // ==========================================================================
  // HELPER METHODS - Agent-Specific Behaviors
  // ==========================================================================

  private getAgentPerspectiveOn(agent: AgentPersonality, userQuery: string): string {
    // This would be implemented based on specific agent personalities
    return `From ${agent.name}'s perspective: ${userQuery}`;
  }

  private addTricksterAwareness(agent: AgentPersonality, response: string): string {
    return `${response} (And there may be a teaching riddle here that I'm sensing but can't quite name.)`;
  }

  private addLiminalSensitivity(agent: AgentPersonality, response: string): string {
    return `${response} There's a threshold quality to this moment.`;
  }

  private addBothAndHolding(agent: AgentPersonality, response: string): string {
    return `${response} I'm holding space for what seems contradictory but may both be true.`;
  }

  private applyAgentVoice(agent: AgentPersonality, response: string): string {
    // Apply agent's specific linguistic patterns
    return response;
  }

  private getAgentSpecificQuestions(agent: AgentPersonality, userQuery: string): string[] {
    // Return questions specific to this agent's gifts and perspective
    return agent.gifts.map(gift => 
      `What would it look like to approach this through ${gift}?`
    );
  }

  private craftResistanceResponse(agent: AgentPersonality, resistance: string): string {
    return `I find myself pushing back on the idea that ${resistance}. Something in me says that's not quite right.`;
  }

  private applyIntervention(
    phenomenological: AgentResponse['phenomenological'],
    dialogical: AgentResponse['dialogical'],
    intervention: AgentIntervention
  ): void {
    // Apply intervention to adjust response
    if (intervention.voiceAdjustment) {
      Object.assign(phenomenological.tone, intervention.voiceAdjustment);
    }
    
    if (intervention.pacingAdjustment) {
      Object.assign(phenomenological.pacing, intervention.pacingAdjustment);
    }
    
    // Add intervention message to dialogical layer
    dialogical.resistances.unshift(intervention.message);
  }

  // Elemental Other generation helpers
  private getElementalVoice(element: string, score: number): string {
    const voices = {
      fire: "I am the urgency that will not be delayed",
      water: "I am the depth that cannot be rushed", 
      earth: "I am the foundation that must be built",
      air: "I am the perspective that must be seen",
      aether: "I am the connection that binds all things"
    };
    return voices[element as keyof typeof voices] || "I speak from the elements";
  }

  private getElementalDemand(element: string): string {
    const demands = {
      fire: "Move. Now. With passion.",
      water: "Feel. Deeply. With truth.",
      earth: "Ground. Slowly. With substance.", 
      air: "Think. Clearly. With perspective.",
      aether: "Integrate. Wholly. With wisdom."
    };
    return demands[element as keyof typeof demands] || "Listen to what is needed";
  }

  private getElementalGift(element: string): string {
    const gifts = {
      fire: "Transformation through action",
      water: "Wisdom through feeling",
      earth: "Stability through patience",
      air: "Clarity through detachment", 
      aether: "Unity through integration"
    };
    return gifts[element as keyof typeof gifts] || "The gift of elemental wisdom";
  }

  private getElementalResistance(element: string): string {
    const resistances = {
      fire: "I will not be contained or delayed",
      water: "I will not be drained or polluted",
      earth: "I will not be uprooted or rushed",
      air: "I will not be trapped or stagnated",
      aether: "I will not be fragmented or divided"
    };
    return resistances[element as keyof typeof resistances] || "I maintain my essential nature";
  }

  private calculateElementalAlterity(element: string, score: number): number {
    // Higher scores mean more present, but alterity depends on how foreign element feels
    return Math.max(0.3, 1 - (score / 100));
  }

  private updateUserGrowth(memory: ConversationMemory, userState: UserState): void {
    // Gradual increase in user capacities based on engagement
    memory.userGrowth.conceptualCapacity = Math.min(
      memory.userGrowth.conceptualCapacity + 0.01,
      1.0
    );
    
    if (userState.agreementLevel < 0.9) {
      memory.userGrowth.paradoxTolerance = Math.min(
        memory.userGrowth.paradoxTolerance + 0.02,
        1.0
      );
    }
    
    if (userState.resistanceLevel < 0.8) {
      memory.userGrowth.othernessTolerance = Math.min(
        memory.userGrowth.othernessTolerance + 0.015,
        1.0
      );
    }
  }
}