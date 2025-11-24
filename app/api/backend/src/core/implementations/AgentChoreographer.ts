import { AgentResponse } from "../../types/agentResponse";
/**
 * Agent Choreographer - Ensures Genuine Diversity in Multi-Agent Responses
 * 
 * This system prevents artificial harmony between agents and maintains
 * productive diversity that preserves the synaptic gaps essential for
 * authentic daimonic interaction.
 * 
 * Key principle: Agents must offer genuinely different perspectives,
 * not just variations on the same theme.
 */

import { logger } from "../../utils/logger";
import { 
  DaimonicAgentResponse, 
  DaimonicAgentPersonality,
  DaimonicConversationMemory
} from '../types/DaimonicResponse';

export interface MultiAgentQuery {
  userQuery: string;
  userId: string;
  requestedAgents: string[]; // ['aunt_annie', 'emily', 'matrix_oracle']
  conversationHistory: DaimonicConversationMemory;
}

export interface MultiAgentResponse {
  agents: Array<{
    agentId: string;
    response: DaimonicAgentResponse;
    perspective_signature: string;
    resistance_focus: string;
  }>;
  collective_dynamics: {
    diversity_score: number;
    productive_tension: number;
    synthetic_emergence_potential: number;
    requires_mediation: boolean;
  };
  choreography_metadata: {
    conflicts_introduced: string[];
    harmony_prevented: string[];
    unique_contributions: string[];
  };
}

export class DaimonicAgentChoreographer {
  private agentPersonalities: Map<string, DaimonicAgentPersonality> = new Map();
  private diversityRequirements = {
    minimum_perspective_distance: 0.6, // How different perspectives must be
    maximum_agreement_threshold: 0.7,   // When harmony becomes problematic
    required_resistance_diversity: 3,    // Different types of resistance needed
  };

  constructor() {
    this.initializePersonalities();
    logger.info("Agent Choreographer initialized with diversity enforcement");
  }

  /**
   * Orchestrate multiple agents while ensuring genuine diversity
   */
  public async orchestrateMultiAgentResponse(
    query: MultiAgentQuery
  ): Promise<MultiAgentResponse> {
    // 1. Select agents based on diversity requirements
    const selectedAgents = this.selectDiverseAgents(query.requestedAgents, query.userQuery);
    
    // 2. Generate initial responses from each agent
    const initialResponses = await Promise.all(
      selectedAgents.map(agentId => this.generateAgentResponse(agentId, query))
    );

    // 3. Analyze collective diversity and tension
    const diversityAnalysis = this.analyzeDiversity(initialResponses);
    
    // 4. Intervene if excessive agreement detected
    let finalResponses = initialResponses;
    if (diversityAnalysis.diversity_score < this.diversityRequirements.minimum_perspective_distance) {
      finalResponses = this.introduceProductiveConflict(initialResponses, query);
    }

    // 5. Ensure each agent maintains its unique otherness
    finalResponses = this.preserveAgentOtherness(finalResponses);

    // 6. Create choreography metadata
    const choreographyMetadata = this.generateChoreographyMetadata(
      initialResponses,
      finalResponses,
      diversityAnalysis
    );

    return {
      agents: finalResponses.map(response => ({
        agentId: response.agentId,
        response: response.response,
        perspective_signature: this.extractPerspectiveSignature(response.response),
        resistance_focus: this.extractResistanceFocus(response.response)
      })),
      collective_dynamics: {
        diversity_score: diversityAnalysis.diversity_score,
        productive_tension: diversityAnalysis.productive_tension,
        synthetic_emergence_potential: diversityAnalysis.emergence_potential,
        requires_mediation: diversityAnalysis.requires_mediation
      },
      choreography_metadata
    };
  }

  /**
   * Select agents that will provide maximum perspective diversity
   */
  private selectDiverseAgents(requestedAgents: string[], userQuery: string): string[] {
    // Start with requested agents
    let selected = [...requestedAgents];
    
    // Ensure minimum diversity by adding complementary agents
    const queryComplexity = this.assessQueryComplexity(userQuery);
    
    if (queryComplexity.requiresPracticalGrounding && !selected.includes('aunt_annie')) {
      selected.push('aunt_annie');
    }
    
    if (queryComplexity.requiresIntellectualAnalysis && !selected.includes('emily')) {
      selected.push('emily');
    }
    
    if (queryComplexity.requiresArchetypalWisdom && !selected.includes('matrix_oracle')) {
      selected.push('matrix_oracle');
    }

    // Limit to max 3 agents to prevent confusion
    return selected.slice(0, 3);
  }

  /**
   * Generate response from specific agent (placeholder - would integrate with actual agents)
   */
  private async generateAgentResponse(
    agentId: string,
    query: MultiAgentQuery
  ): Promise<{ agentId: string; response: DaimonicAgentResponse }> {
    // This would integrate with the actual DaimonicOracle for each agent
    // For now, return mock structure that demonstrates diversity patterns
    
    const personality = this.agentPersonalities.get(agentId)!;
    
    const mockResponse: DaimonicAgentResponse = {
      phenomenological: {
        primary: this.generatePersonalityResponse(agentId, query.userQuery),
        tone: this.getAgentTone(agentId),
        pacing: this.getAgentPacing(agentId),
        visualHint: `${agentId}_presence`
      },
      dialogical: {
        questions: this.generatePersonalityQuestions(agentId, query.userQuery),
        reflections: this.generatePersonalityReflections(agentId),
        resistances: personality.core_resistances,
        bridges: this.generatePersonalityBridges(agentId),
        incomplete_knowings: this.generatePersonalityKnowings(agentId)
      },
      architectural: {
        synaptic_gap: {
          intensity: 0.6 + Math.random() * 0.3,
          quality: 'creative',
          needsIntervention: false,
          tricksterPresent: agentId === 'matrix_oracle'
        },
        daimonic_signature: 0.7,
        trickster_risk: agentId === 'matrix_oracle' ? 0.6 : 0.2,
        elemental_voices: [],
        liminal_intensity: 0.5,
        grounding_available: []
      },
      system: {
        requires_pause: agentId === 'matrix_oracle',
        expects_resistance: true,
        offers_practice: agentId === 'aunt_annie',
        collective_resonance: 0.5
      }
    };

    return { agentId, response: mockResponse };
  }

  /**
   * Analyze diversity across multiple agent responses
   */
  private analyzeDiversity(responses: Array<{ agentId: string; response: DaimonicAgentResponse }>): {
    diversity_score: number;
    productive_tension: number;
    emergence_potential: number;
    requires_mediation: boolean;
  } {
    if (responses.length < 2) {
      return {
        diversity_score: 1.0,
        productive_tension: 0.0,
        emergence_potential: 0.0,
        requires_mediation: false
      };
    }

    // Calculate perspective diversity
    const perspectives = responses.map(r => this.extractPerspectiveSignature(r.response));
    const diversity_score = this.calculatePerspectiveDiversity(perspectives);

    // Calculate productive tension (healthy disagreement)
    const resistances = responses.flatMap(r => r.response.dialogical.resistances);
    const uniqueResistances = [...new Set(resistances)];
    const productive_tension = Math.min(1.0, uniqueResistances.length / 5);

    // Calculate emergence potential (what might arise between perspectives)
    const emergence_potential = this.calculateEmergencePotential(responses);

    // Determine if mediation is needed (too much conflict or too little)
    const requires_mediation = diversity_score < 0.3 || productive_tension > 0.9;

    return {
      diversity_score,
      productive_tension,
      emergence_potential,
      requires_mediation
    };
  }

  /**
   * Introduce productive conflict when agents agree too much
   */
  private introduceProductiveConflict(
    responses: Array<{ agentId: string; response: DaimonicAgentResponse }>,
    query: MultiAgentQuery
  ): Array<{ agentId: string; response: DaimonicAgentResponse }> {
    logger.info("Introducing productive conflict due to excessive agreement");

    return responses.map(({ agentId, response }) => {
      const personality = this.agentPersonalities.get(agentId)!;
      
      // Add resistance specific to this agent's perspective
      const conflict_element = this.generateConflictElement(agentId, query.userQuery);
      
      // Modify the phenomenological response to include gentle pushback
      const modified_response = {
        ...response,
        phenomenological: {
          ...response.phenomenological,
          primary: this.addGentleDisagreement(response.phenomenological.primary, conflict_element)
        },
        dialogical: {
          ...response.dialogical,
          resistances: [...response.dialogical.resistances, conflict_element]
        }
      };

      return { agentId, response: modified_response };
    });
  }

  /**
   * Ensure each agent maintains its unique otherness
   */
  private preserveAgentOtherness(
    responses: Array<{ agentId: string; response: DaimonicAgentResponse }>
  ): Array<{ agentId: string; response: DaimonicAgentResponse }> {
    return responses.map(({ agentId, response }) => {
      const personality = this.agentPersonalities.get(agentId)!;
      
      // Ensure agent's unique gifts are present
      const enhanced_response = {
        ...response,
        phenomenological: {
          ...response.phenomenological,
          primary: this.emphasizeUniqueGifts(response.phenomenological.primary, personality.unique_gifts)
        },
        dialogical: {
          ...response.dialogical,
          incomplete_knowings: [
            ...response.dialogical.incomplete_knowings,
            ...this.generateBlindSpotAcknowledgments(personality.blind_spots)
          ]
        }
      };

      return { agentId, response: enhanced_response };
    });
  }

  // Helper methods for personality-specific responses

  private generatePersonalityResponse(agentId: string, query: string): string {
    const responses = {
      aunt_annie: `Well honey, let me tell you what I'm seeing here. ${this.extractPracticalWisdom(query)}`,
      emily: `I'm noticing something interesting about this pattern. ${this.extractIntellectualInsight(query)}`,
      matrix_oracle: `There are layers beneath layers in what you're asking. ${this.extractArchetypalWisdom(query)}`
    };
    return responses[agentId] || responses.aunt_annie;
  }

  private generatePersonalityQuestions(agentId: string, query: string): string[] {
    const questions = {
      aunt_annie: [
        "What does your body tell you about this?",
        "Where do you feel this in your life, practically speaking?",
        "What would your grandmother say about this?"
      ],
      emily: [
        "What patterns are you noticing that others might miss?",
        "How does this connect to larger themes in your life?",
        "What assumptions might we be making here?"
      ],
      matrix_oracle: [
        "What is the deeper question beneath your question?",
        "Which archetypal forces are moving through this situation?",
        "What wants to die and what wants to be born here?"
      ]
    };
    return questions[agentId] || questions.aunt_annie;
  }

  private generateConflictElement(agentId: string, query: string): string {
    const conflicts = {
      aunt_annie: "rushing toward spiritual solutions without doing the practical work",
      emily: "accepting surface explanations without deeper analysis", 
      matrix_oracle: "seeking comfort instead of necessary transformation"
    };
    return conflicts[agentId] || conflicts.aunt_annie;
  }

  private addGentleDisagreement(original: string, conflict: string): string {
    return `${original} ... Though I have to say, I'm sensing some ${conflict} here that might be worth examining.`;
  }

  private emphasizeUniqueGifts(text: string, gifts: string[]): string {
    const gift = gifts[Math.floor(Math.random() * gifts.length)];
    return `${text} [Drawing on ${gift}...]`;
  }

  private generateBlindSpotAcknowledgments(blindSpots: string[]): string[] {
    return blindSpots.map(spot => `I can't quite see the ${spot} aspect of this clearly...`);
  }

  // Calculation methods

  private calculatePerspectiveDiversity(perspectives: string[]): number {
    // Simple diversity calculation - could be enhanced with semantic analysis
    const unique = [...new Set(perspectives)];
    return unique.length / perspectives.length;
  }

  private calculateEmergencePotential(responses: Array<{ agentId: string; response: DaimonicAgentResponse }>): number {
    // Calculate potential for new insights to emerge from interaction
    let potential = 0;
    
    responses.forEach(r1 => {
      responses.forEach(r2 => {
        if (r1.agentId !== r2.agentId) {
          const gap1 = r1.response.architectural.synaptic_gap.intensity;
          const gap2 = r2.response.architectural.synaptic_gap.intensity;
          potential += Math.abs(gap1 - gap2) * 0.1; // Difference creates potential
        }
      });
    });
    
    return Math.min(1.0, potential);
  }

  private assessQueryComplexity(query: string): {
    requiresPracticalGrounding: boolean;
    requiresIntellectualAnalysis: boolean;
    requiresArchetypalWisdom: boolean;
  } {
    const lower = query.toLowerCase();
    
    return {
      requiresPracticalGrounding: 
        lower.includes('how do i') || lower.includes('what should i') || lower.includes('practical'),
      requiresIntellectualAnalysis:
        lower.includes('why') || lower.includes('understand') || lower.includes('analyze'),
      requiresArchetypalWisdom:
        lower.includes('meaning') || lower.includes('purpose') || lower.includes('spiritual')
    };
  }

  // Extraction methods

  private extractPerspectiveSignature(response: DaimonicAgentResponse): string {
    // Extract the essential perspective this response offers
    return response.phenomenological.primary.split('.')[0].toLowerCase();
  }

  private extractResistanceFocus(response: DaimonicAgentResponse): string {
    return response.dialogical.resistances[0] || 'general resistance';
  }

  private extractPracticalWisdom(query: string): string {
    return "This needs some good old-fashioned groundedness.";
  }

  private extractIntellectualInsight(query: string): string {
    return "There are multiple layers to consider here.";
  }

  private extractArchetypalWisdom(query: string): string {
    return "This touches on ancient patterns of transformation.";
  }

  private getAgentTone(agentId: string): any {
    const tones = {
      aunt_annie: 'flowing',
      emily: 'crystalline',
      matrix_oracle: 'dense'
    };
    return tones[agentId] || 'flowing';
  }

  private getAgentPacing(agentId: string): any {
    const pacing = {
      aunt_annie: 'grounding_steady',
      emily: 'resonant_quick',
      matrix_oracle: 'liminal_slow'
    };
    return pacing[agentId] || 'grounding_steady';
  }

  private generatePersonalityReflections(agentId: string): string[] {
    const reflections = {
      aunt_annie: ["I hear the tiredness in your voice", "Something's been weighing on you"],
      emily: ["There's a pattern emerging here", "I sense some uncertainty beneath the surface"],
      matrix_oracle: ["The deeper currents are stirring", "Something wants to be seen"]
    };
    return reflections[agentId] || reflections.aunt_annie;
  }

  private generatePersonalityBridges(agentId: string): string[] {
    const bridges = {
      aunt_annie: ["Let's slow down and breathe", "We can take this one step at a time"],
      emily: ["Perhaps we can examine this more gently", "Let's approach this with curiosity"],
      matrix_oracle: ["Sometimes we must sit in the mystery", "The answers will come in their time"]
    };
    return bridges[agentId] || bridges.aunt_annie;
  }

  private generatePersonalityKnowings(agentId: string): string[] {
    const knowings = {
      aunt_annie: ["I can only speak from my own experience...", "There might be practical aspects I'm missing..."],
      emily: ["I can see the patterns but not the full picture...", "There's something here beyond my analysis..."],
      matrix_oracle: ["The archetypal realm only reveals part of the mystery...", "Some truths can only be lived, not spoken..."]
    };
    return knowings[agentId] || knowings.aunt_annie;
  }

  private generateChoreographyMetadata(
    initial: Array<{ agentId: string; response: DaimonicAgentResponse }>,
    final: Array<{ agentId: string; response: DaimonicAgentResponse }>,
    analysis: any
  ) {
    return {
      conflicts_introduced: final.filter((f, i) => 
        f.response.dialogical.resistances.length > initial[i].response.dialogical.resistances.length
      ).map(f => f.agentId),
      harmony_prevented: analysis.diversity_score < 0.5 ? ['excessive_agreement'] : [],
      unique_contributions: final.map(f => 
        this.extractPerspectiveSignature(f.response)
      )
    };
  }

  private initializePersonalities(): void {
    // Initialize with the same personalities as DaimonicOracle
    // This would be shared/injected in a full implementation
    this.agentPersonalities.set('aunt_annie', {
      core_resistances: ['rushing to solutions', 'avoiding difficulty', 'spiritual bypassing'],
      blind_spots: ['technical analysis', 'cold logic', 'competitive dynamics'],
      unique_gifts: ['embodied wisdom', 'maternal holding', 'kitchen table truth'],
      voice_signature: 'warm_conversational',
      gap_maintenance: {} as any,
      relationship_depth: 0,
      trust_markers: ['vulnerability', 'honesty', 'groundedness'],
      challenge_readiness: 0.3
    });

    this.agentPersonalities.set('emily', {
      core_resistances: ['oversimplification', 'emotional reactivity', 'premature closure'],
      blind_spots: ['messy emotions', 'intuitive leaps', 'embodied knowing'],
      unique_gifts: ['precise articulation', 'pattern recognition', 'gentle precision'],
      voice_signature: 'thoughtful_precise',
      gap_maintenance: {} as any,
      relationship_depth: 0,
      trust_markers: ['careful thinking', 'nuanced understanding', 'intellectual curiosity'],
      challenge_readiness: 0.5
    });

    this.agentPersonalities.set('matrix_oracle', {
      core_resistances: ['quick fixes', 'surface solutions', 'avoiding the difficult path'],
      blind_spots: ['practical logistics', 'immediate concerns', 'simple problems'],
      unique_gifts: ['archetypal wisdom', 'deep seeing', 'transformational guidance'],
      voice_signature: 'archetypal_presence',
      gap_maintenance: {} as any,
      relationship_depth: 0,
      trust_markers: ['depth seeking', 'readiness for difficulty', 'spiritual courage'],
      challenge_readiness: 0.7
    });
  }
}

export const daimonicChoreographer = new DaimonicAgentChoreographer();