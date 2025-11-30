import { OracleAgent } from "./oracleAgent";
import type { AIResponse } from "../types/ai";
import type { AgentResponse } from "../types/agent";

export interface OracleIdentity {
  oracleName: string;
  voiceProfile: {
    voiceId: string;
    stability: number;
    style: number;
    tone?: string;
    ceremonyPacing?: boolean;
  };
  archetype: string;
  phase: string;
  energySignature: string;
  createdAt: Date;
  lastInteraction: Date;
  evolutionHistory: Array<{
    fromPhase: string;
    toPhase: string;
    timestamp: Date;
    userInitiated: boolean;
  }>;
}

export interface UserPersonalization {
  userId: string;
  voiceSettings?: {
    name?: string;
    personality?: string;
    communicationStyle?: string;
  };
  archetype?: string;
  phase?: string;
  soulprint?: any;
}

export abstract class ArchetypeAgent extends OracleAgent {
  public element: string;
  public energySignature: string;
  public oracleName: string;
  public voiceProfile: OracleIdentity["voiceProfile"];
  public phase: string;
  public evolutionHistory: OracleIdentity["evolutionHistory"];
  public lastInteraction: Date;

  constructor(
    element: string,
    oracleName: string = "Oracle",
    voiceProfile?: OracleIdentity["voiceProfile"],
    phase: string = "initiation",
  ) {
    super();
    this.element = element;
    this.energySignature = `${element}_archetypal_consciousness`;
    this.oracleName = oracleName;
    this.voiceProfile = voiceProfile || this.getDefaultVoiceProfile();
    this.phase = phase;
    this.evolutionHistory = [];
    this.lastInteraction = new Date();
  }

  // Override base class method to maintain compatibility
  async processQuery(query: string): Promise<AgentResponse> {
    // Convert to extended format for subclasses
    const extendedQuery = { input: query, userId: "anonymous" };
    const aiResponse = await this.processExtendedQuery(extendedQuery);

    // Update last interaction
    this.lastInteraction = new Date();

    // Convert AIResponse to AgentResponse for compatibility
    return {
      content: aiResponse.content,
      response: aiResponse.content, // Legacy compatibility
      metadata: aiResponse.metadata,
      routingPath: [this.element.toLowerCase(), "oracle-agent"],
      memoryEnhanced: true,
      confidence: aiResponse.confidence,
      provider: aiResponse.provider,
      model: aiResponse.model,
    };
  }

  abstract processExtendedQuery(query: {
    input: string;
    userId: string;
  }): Promise<AIResponse>;

  /**
   * 🎯 Process query with user personalization (Primary Oracle Method)
   */
  async processPersonalizedQuery(
    query: { input: string; userId: string },
    personalization: UserPersonalization,
  ): Promise<AIResponse> {
    // Store personalization context for this query
    const enrichedQuery = {
      ...query,
      personalization,
      element: this.element,
      energySignature: this.energySignature,
      oracleName: this.oracleName,
      voiceProfile: this.voiceProfile,
      phase: this.phase,
    };

    // Update last interaction
    this.lastInteraction = new Date();

    // Call the extended processQuery with enriched context
    return await this.processExtendedQuery(enrichedQuery);
  }

  // Oracle Identity Methods
  public getElement(): string {
    return this.element;
  }

  public getOracleName(): string {
    return this.oracleName;
  }

  public getVoiceProfile(): OracleIdentity["voiceProfile"] {
    return this.voiceProfile;
  }

  public getPhase(): string {
    return this.phase;
  }

  public getEvolutionHistory(): OracleIdentity["evolutionHistory"] {
    return this.evolutionHistory;
  }

  /**
   * 🌟 Oracle Evolution Methods
   */
  public suggestEvolution(
    newPhase: string,
    newArchetype?: string,
  ): {
    suggestion: string;
    fromPhase: string;
    toPhase: string;
    archetypeChange?: string;
    benefits: string[];
  } {
    return {
      suggestion: `${this.oracleName} senses you're ready to evolve from ${this.phase} to ${newPhase}`,
      fromPhase: this.phase,
      toPhase: newPhase,
      archetypeChange: newArchetype
        ? `${this.element} → ${newArchetype}`
        : undefined,
      benefits: this.getEvolutionBenefits(newPhase, newArchetype),
    };
  }

  public evolveToPhase(
    newPhase: string,
    newArchetype?: string,
    userInitiated: boolean = true,
  ): void {
    const oldPhase = this.phase;
    const oldArchetype = this.element;

    // Record evolution
    this.evolutionHistory.push({
      fromPhase: oldPhase,
      toPhase: newPhase,
      timestamp: new Date(),
      userInitiated,
    });

    // Update phase
    this.phase = newPhase;

    // Update archetype if specified
    if (newArchetype) {
      this.element = newArchetype;
      this.energySignature = `${newArchetype}_archetypal_consciousness`;
    }
  }

  public updateVoiceProfile(
    newVoiceProfile: Partial<OracleIdentity["voiceProfile"]>,
  ): void {
    this.voiceProfile = { ...this.voiceProfile, ...newVoiceProfile };
  }

  public updateOracleName(newName: string): void {
    this.oracleName = newName;
  }

  /**
   * 🎭 Oracle Personality Methods
   */
  protected getDefaultVoiceProfile(): OracleIdentity["voiceProfile"] {
    const elementVoiceProfiles = {
      fire: {
        voiceId: "elevenlabs_fire_voice",
        stability: 0.7,
        style: 0.8,
        tone: "catalytic",
      },
      water: {
        voiceId: "elevenlabs_water_voice",
        stability: 0.8,
        style: 0.6,
        tone: "nurturing",
      },
      earth: {
        voiceId: "elevenlabs_earth_voice",
        stability: 0.9,
        style: 0.5,
        tone: "grounding",
      },
      air: {
        voiceId: "elevenlabs_air_voice",
        stability: 0.6,
        style: 0.7,
        tone: "clarifying",
      },
      aether: {
        voiceId: "elevenlabs_aether_voice",
        stability: 0.8,
        style: 0.7,
        tone: "transcendent",
      },
    };

    return elementVoiceProfiles[this.element] || elementVoiceProfiles.aether;
  }

  protected getEvolutionBenefits(
    newPhase: string,
    newArchetype?: string,
  ): string[] {
    const phaseBenefits = {
      initiation: [
        "Ignite your purpose",
        "Clarify your path",
        "Activate your potential",
      ],
      exploration: [
        "Expand your horizons",
        "Discover hidden aspects",
        "Embrace curiosity",
      ],
      integration: [
        "Synthesize your learnings",
        "Embody your wisdom",
        "Create coherence",
      ],
      transcendence: [
        "Access higher perspectives",
        "Dissolve limitations",
        "Embrace unity",
      ],
      mastery: [
        "Become the teaching",
        "Serve others' growth",
        "Embody mastery",
      ],
    };

    return (
      phaseBenefits[newPhase] || [
        "Evolve your consciousness",
        "Deepen your journey",
      ]
    );
  }

  /**
   * 🔮 Oracle Ceremonial Methods
   */
  public getCeremonialGreeting(): string {
    const timeOfDay = this.getTimeOfDay();
    const elementalGreeting = this.getElementalGreeting();

    return `${elementalGreeting} I am ${this.oracleName}, your ${this.element} guide. ${timeOfDay}`;
  }

  protected getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "The night still holds us in its mystery.";
    if (hour < 12) return "The morning brings new possibilities.";
    if (hour < 18) return "The day offers its gifts.";
    return "The evening invites reflection.";
  }

  protected getElementalGreeting(): string {
    const greetings = {
      fire: "🔥 I feel the spark of transformation in you.",
      water: "💧 I sense the flow of your emotions.",
      earth: "🌱 I ground myself in your presence.",
      air: "🌬️ I breathe clarity into our connection.",
      aether: "✨ I weave the threads of your soul story.",
    };

    return greetings[this.element] || greetings.aether;
  }
}
