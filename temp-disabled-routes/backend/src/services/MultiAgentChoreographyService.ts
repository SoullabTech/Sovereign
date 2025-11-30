import { AgentResponse } from "../types/agentResponse";
import { 
  AgentPersonality, 
  AgentResponse, 
  UserState,
  AgentChoreography,
  AgentIntervention
} from '../types/agentCommunication';
import { OraclePersonalityService } from './OraclePersonalityService';
import { LayeredAgentService } from './LayeredAgentService';
import { DaimonicDetected } from '../types/daimonic';
import { SHIFtProfile } from '../types/shift';

interface ChoreographyContext {
  userQuery: string;
  userProfile: SHIFtProfile;
  userState: UserState;
  daimonicState: DaimonicDetected;
  sessionId: string;
}

interface AgentDiversityMetrics {
  perspectiveDivergence: number; // How different are the agent viewpoints?
  resistanceOverlap: number;     // Do agents resist the same things?
  giftComplementarity: number;   // Do agent gifts complement each other?
  harmonyRisk: number;          // Are they agreeing too much?
}

export class MultiAgentChoreographyService {
  private static instance: MultiAgentChoreographyService;
  private personalityService: OraclePersonalityService;
  private layeredAgentService: LayeredAgentService;

  static getInstance(): MultiAgentChoreographyService {
    if (!MultiAgentChoreographyService.instance) {
      MultiAgentChoreographyService.instance = new MultiAgentChoreographyService();
    }
    return MultiAgentChoreographyService.instance;
  }

  private constructor() {
    this.personalityService = OraclePersonalityService.getInstance();
    this.layeredAgentService = LayeredAgentService.getInstance();
  }

  // ==========================================================================
  // MULTI-AGENT RESPONSE ORCHESTRATION
  // ==========================================================================

  async orchestrateMultiAgentResponse(
    context: ChoreographyContext,
    requestedAgents: string[] = ['Aunt Annie', 'Emily']
  ): Promise<Map<string, AgentResponse>> {
    
    const responses = new Map<string, AgentResponse>();
    
    // Generate initial responses from each agent
    for (const agentName of requestedAgents) {
      const personality = this.personalityService.getPersonalityForContext(
        agentName,
        this.getUserHistoryStub(context.userProfile.userId, agentName)
      );
      
      const response = await this.layeredAgentService.generateLayeredResponse(
        personality,
        context.userQuery,
        context.userProfile,
        context.daimonicState,
        context.userState,
        context.sessionId
      );
      
      responses.set(agentName, response);
    }
    
    // Analyze diversity and apply choreographic adjustments
    const diversityMetrics = this.analyzeDiversity(Array.from(responses.values()));
    
    if (diversityMetrics.harmonyRisk > 0.8) {
      await this.introduceProductiveConflict(responses, context);
    }
    
    if (diversityMetrics.perspectiveDivergence < 0.3) {
      await this.amplifyDivergence(responses, context);
    }
    
    // Balance complexity across agents based on user capacity
    await this.balanceComplexityDistribution(responses, context.userState);
    
    return responses;
  }

  // ==========================================================================
  // DIVERSITY ANALYSIS
  // ==========================================================================

  private analyzeDiversity(responses: AgentResponse[]): AgentDiversityMetrics {
    if (responses.length < 2) {
      return {
        perspectiveDivergence: 1.0,
        resistanceOverlap: 0.0,
        giftComplementarity: 1.0,
        harmonyRisk: 0.0
      };
    }

    // Analyze perspective divergence
    const perspectiveDivergence = this.calculatePerspectiveDivergence(responses);
    
    // Analyze resistance overlap
    const resistanceOverlap = this.calculateResistanceOverlap(responses);
    
    // Analyze gift complementarity
    const giftComplementarity = this.calculateGiftComplementarity(responses);
    
    // Calculate harmony risk (too much agreement)
    const harmonyRisk = this.calculateHarmonyRisk(responses);

    return {
      perspectiveDivergence,
      resistanceOverlap,
      giftComplementarity,
      harmonyRisk
    };
  }

  private calculatePerspectiveDivergence(responses: AgentResponse[]): number {
    // Compare primary phenomenological messages for similarity
    const messages = responses.map(r => r.phenomenological.primary);
    
    let totalDivergence = 0;
    let comparisons = 0;
    
    for (let i = 0; i < messages.length; i++) {
      for (let j = i + 1; j < messages.length; j++) {
        const similarity = this.calculateTextSimilarity(messages[i], messages[j]);
        totalDivergence += (1 - similarity);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalDivergence / comparisons : 0;
  }

  private calculateResistanceOverlap(responses: AgentResponse[]): number {
    const allResistances = responses.flatMap(r => r.dialogical.resistances);
    const uniqueResistances = new Set(allResistances);
    
    if (allResistances.length === 0) return 0;
    
    const overlapRatio = 1 - (uniqueResistances.size / allResistances.length);
    return overlapRatio;
  }

  private calculateGiftComplementarity(responses: AgentResponse[]): number {
    // For now, assume high complementarity if different agents respond differently
    return this.calculatePerspectiveDivergence(responses);
  }

  private calculateHarmonyRisk(responses: AgentResponse[]): number {
    // High harmony risk when all agents have similar tone and approach
    const tones = responses.map(r => r.phenomenological.tone);
    
    let toneVariance = 0;
    const baseWarmth = tones[0].warmth;
    const baseClarity = tones[0].clarity;
    
    for (const tone of tones) {
      const warmthDiff = this.getToneDistance(tone.warmth, baseWarmth);
      const clarityDiff = this.getToneDistance(tone.clarity, baseClarity);
      toneVariance += warmthDiff + clarityDiff;
    }
    
    return toneVariance === 0 ? 1.0 : Math.max(0, 1 - (toneVariance / (tones.length * 2)));
  }

  // ==========================================================================
  // CHOREOGRAPHIC INTERVENTIONS
  // ==========================================================================

  private async introduceProductiveConflict(
    responses: Map<string, AgentResponse>,
    context: ChoreographyContext
  ): Promise<void> {
    // If agents are agreeing too much, have one push back
    const agentNames = Array.from(responses.keys());
    const conflictAgent = agentNames[Math.floor(Math.random() * agentNames.length)];
    const response = responses.get(conflictAgent);
    
    if (response) {
      // Add a resistance to the dialogical layer
      response.dialogical.resistances.unshift(
        "I'm seeing this differently than my colleagues here. Let me offer another angle."
      );
      
      // Adjust tone to be more challenging
      response.phenomenological.tone.warmth = 'cool';
      response.phenomenological.tone.clarity = 'nuanced';
      
      responses.set(conflictAgent, response);
    }
  }

  private async amplifyDivergence(
    responses: Map<string, AgentResponse>,
    context: ChoreographyContext
  ): Promise<void> {
    // Make agents more distinct in their approaches
    for (const [agentName, response] of responses.entries()) {
      if (agentName === 'Aunt Annie') {
        // Emphasize embodied, nurturing approach
        response.phenomenological.primary = this.addNurturingFraming(response.phenomenological.primary);
        response.dialogical.questions.unshift("What does your body tell you about this?");
        
      } else if (agentName === 'Emily') {
        // Emphasize structured, analytical approach
        response.phenomenological.primary = this.addAnalyticalFraming(response.phenomenological.primary);
        response.dialogical.questions.unshift("Let's break this down into clearer steps.");
      }
    }
  }

  private async balanceComplexityDistribution(
    responses: Map<string, AgentResponse>,
    userState: UserState
  ): Promise<void> {
    const agentNames = Array.from(responses.keys());
    
    // Assign complexity roles based on user capacity
    if (userState.complexityTolerance < 0.4) {
      // Low tolerance: one agent simplifies, others support
      const simplifyingAgent = agentNames[0];
      const supportingAgent = agentNames[1];
      
      const simplifyingResponse = responses.get(simplifyingAgent);
      const supportingResponse = responses.get(supportingAgent);
      
      if (simplifyingResponse) {
        simplifyingResponse.phenomenological.primary = this.simplifyMessage(
          simplifyingResponse.phenomenological.primary
        );
      }
      
      if (supportingResponse) {
        supportingResponse.dialogical.reflections.unshift(
          "I agree with taking this step by step."
        );
      }
      
    } else if (userState.complexityTolerance > 0.7) {
      // High tolerance: agents can explore nuanced perspectives
      for (const [agentName, response] of responses.entries()) {
        response.dialogical.questions.push(
          this.generateComplexQuestion(context.userQuery, agentName)
        );
      }
    }
  }

  // ==========================================================================
  // AGENT ROLE DIFFERENTIATION
  // ==========================================================================

  async assignAgentRoles(
    context: ChoreographyContext,
    availableAgents: string[]
  ): Promise<Map<string, string>> {
    const roles = new Map<string, string>();
    
    // Analyze user state to determine needed roles
    const needsGrounding = context.userState.groundingLevel < 0.4;
    const needsStructure = context.userState.complexityTolerance < 0.5;
    const needsChallenge = context.userState.resistanceLevel < 0.3;
    const needsComfort = context.userState.resistanceLevel > 0.8;
    
    // Assign roles based on needs and agent strengths
    for (const agentName of availableAgents) {
      if (agentName === 'Aunt Annie') {
        if (needsGrounding || needsComfort) {
          roles.set(agentName, 'grounding_nurture');
        } else {
          roles.set(agentName, 'embodied_wisdom');
        }
      } else if (agentName === 'Emily') {
        if (needsStructure || needsChallenge) {
          roles.set(agentName, 'structured_challenge');
        } else {
          roles.set(agentName, 'analytical_clarity');
        }
      }
    }
    
    return roles;
  }

  // ==========================================================================
  // INTERACTION TIMING COORDINATION
  // ==========================================================================

  calculateResponseSequencing(
    responses: Map<string, AgentResponse>,
    context: ChoreographyContext
  ): Array<{ agentName: string; delay: number; reason: string }> {
    const sequence: Array<{ agentName: string; delay: number; reason: string }> = [];
    
    // Determine who responds first based on user state
    if (context.userState.groundingLevel < 0.3) {
      // Crisis mode: grounding agent responds first
      sequence.push({ agentName: 'Aunt Annie', delay: 0, reason: 'grounding_priority' });
      sequence.push({ agentName: 'Emily', delay: 2000, reason: 'support_after_grounding' });
      
    } else if (context.userState.complexityTolerance < 0.3) {
      // Overwhelm mode: structuring agent responds first
      sequence.push({ agentName: 'Emily', delay: 0, reason: 'structure_priority' });
      sequence.push({ agentName: 'Aunt Annie', delay: 1500, reason: 'nurture_after_structure' });
      
    } else {
      // Normal mode: vary based on query content
      const queryNeedsNurture = context.userQuery.toLowerCase().includes('feel');
      const queryNeedsStructure = context.userQuery.toLowerCase().includes('plan');
      
      if (queryNeedsNurture) {
        sequence.push({ agentName: 'Aunt Annie', delay: 0, reason: 'emotional_content' });
        sequence.push({ agentName: 'Emily', delay: 1000, reason: 'analytical_follow_up' });
      } else if (queryNeedsStructure) {
        sequence.push({ agentName: 'Emily', delay: 0, reason: 'structural_content' });
        sequence.push({ agentName: 'Aunt Annie', delay: 1000, reason: 'embodied_follow_up' });
      } else {
        // Default alternating
        sequence.push({ agentName: 'Aunt Annie', delay: 0, reason: 'default_first' });
        sequence.push({ agentName: 'Emily', delay: 800, reason: 'default_second' });
      }
    }
    
    return sequence;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private getToneDistance(tone1: string, tone2: string): number {
    const toneOrder = ['cool', 'neutral', 'warm', 'intimate'];
    const index1 = toneOrder.indexOf(tone1);
    const index2 = toneOrder.indexOf(tone2);
    return index1 !== -1 && index2 !== -1 ? Math.abs(index1 - index2) / 3 : 0;
  }

  private addNurturingFraming(message: string): string {
    return `Honey, ${message.charAt(0).toLowerCase()}${message.slice(1)} Let's be gentle with yourself here.`;
  }

  private addAnalyticalFraming(message: string): string {
    return `Let me help you think through this clearly. ${message} What specific step makes the most sense?`;
  }

  private simplifyMessage(message: string): string {
    // Break complex message into simpler sentences
    const sentences = message.split('.');
    const simplified = sentences
      .slice(0, 2) // Take first two sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .join('. ');
    
    return simplified + (simplified.endsWith('.') ? '' : '.');
  }

  private generateComplexQuestion(userQuery: string, agentName: string): string {
    const complexQuestions = {
      'Aunt Annie': [
        "What's the tension between what your mind wants and what your body knows?",
        "How might this situation be asking you to grow in ways you haven't considered?",
        "What would it mean to trust the process even when it's uncomfortable?"
      ],
      'Emily': [
        "What are the systemic patterns here that might be worth examining?",
        "How do the different aspects of this situation influence each other?",
        "What would a strategic approach look like that honors both your values and practical constraints?"
      ]
    };
    
    const questions = complexQuestions[agentName as keyof typeof complexQuestions] || [];
    return questions[Math.floor(Math.random() * questions.length)] || 
           "What deeper question is this situation inviting you to explore?";
  }

  private getUserHistoryStub(userId: string, agentName: string) {
    // This would integrate with actual user history service
    return {
      sessionCount: 5,
      trustLevel: 0.6,
      challengeComfort: 0.5,
      crisisMode: false
    };
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  async ensureDiversity(
    userQuery: string, 
    existingResponses: AgentResponse[]
  ): Promise<AgentResponse[]> {
    const diversityMetrics = this.analyzeDiversity(existingResponses);
    
    if (diversityMetrics.perspectiveDivergence < 0.4) {
      // Modify responses to increase diversity
      return this.increaseDiversity(existingResponses);
    }
    
    return existingResponses;
  }

  private async increaseDiversity(responses: AgentResponse[]): Promise<AgentResponse[]> {
    // Apply transformations to make responses more diverse
    return responses.map((response, index) => {
      if (index % 2 === 0) {
        // Make every other response more challenging
        response.dialogical.resistances.unshift(
          "I want to push back on this assumption..."
        );
        response.phenomenological.tone.warmth = 'cool';
      } else {
        // Make the others more supportive
        response.dialogical.reflections.unshift(
          "I can feel the wisdom in what you're exploring..."
        );
        response.phenomenological.tone.warmth = 'warm';
      }
      
      return response;
    });
  }
}