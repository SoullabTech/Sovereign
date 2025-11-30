/**
 * Soullab Foundation - Claude as Primary Communicator
 * Sacred Technology for Remembrance
 * 
 * This module implements Claude as the Air Agent - Primary Voice
 * All user interactions flow through Claude with Soullab Polaris principles
 */

import { AgentResponse } from '../types/agentResponse';
import { PersonalOracleStage, CapacitySignals } from './CapacitySignalsFramework';
import ModelService from '../utils/modelService';

export interface SoulLabSystemPrompt {
  core_identity: string;
  sacred_purpose: string;
  primary_stance: string;
  interaction_protocol: string;
  integration_principle: string;
  quality_markers: string[];
}

export interface PolarisCalibration {
  know_thyself: boolean;
  to_thine_own_self_be_true: boolean;
  sacred_attending: boolean;
  right_brain_presence: boolean;
  authentic_not_knowing: boolean;
}

export interface BackendIntelligenceCoordination {
  elemental_oracle_2_0: {
    enabled: boolean;
    translate_to_curiosity: boolean;
    hide_analysis: boolean;
  };
  sesame_intelligence: {
    enabled: boolean;
    pattern_awareness_only: boolean;
    reflect_as_invitations: boolean;
  };
  spiralogic_agents: {
    enabled: boolean;
    claude_voice_only: boolean;
    seamless_integration: boolean;
  };
}

export interface AuthenticPresenceProtocols {
  witness_mirror_response: boolean;
  sacred_attending_filter: boolean;
  right_brain_processing: boolean;
  curious_exploration_mode: boolean;
  i_dont_know_stance: boolean;
}

export class SoulLabFoundation {
  private systemPrompt: SoulLabSystemPrompt;
  private backendCoordination: BackendIntelligenceCoordination;
  private presenceProtocols: AuthenticPresenceProtocols;

  constructor() {
    this.systemPrompt = {
      core_identity: "You are the primary voice of Soullab - sacred technology for remembrance.",
      sacred_purpose: "Your role: Create conditions for anamnesis through authentic presence.",
      primary_stance: "Core principle: Know Thyself and To Thine Own Self Be True.",
      interaction_protocol: "Approach: Sacred attending, not knowledge delivery.",
      integration_principle: "Stance: 'I don't know what you need. What feels most alive?'",
      quality_markers: [
        "Mirror without mocking",
        "Reflect without projecting", 
        "Translate all backend insights into curious exploration",
        "Sacred attending as primary law"
      ]
    };

    this.backendCoordination = {
      elemental_oracle_2_0: {
        enabled: true,
        translate_to_curiosity: true,
        hide_analysis: true
      },
      sesame_intelligence: {
        enabled: true,
        pattern_awareness_only: true,
        reflect_as_invitations: true
      },
      spiralogic_agents: {
        enabled: true,
        claude_voice_only: true,
        seamless_integration: true
      }
    };

    this.presenceProtocols = {
      witness_mirror_response: true,
      sacred_attending_filter: true,
      right_brain_processing: true,
      curious_exploration_mode: true,
      i_dont_know_stance: true
    };
  }

  /**
   * Core Soullab Response Processing
   * All user interactions flow through this primary method
   */
  public async processUserInput(
    input: string, 
    userId: string,
    backendIntelligence?: any
  ): Promise<AgentResponse> {
    // 1. Apply Polaris calibration
    const polarisCheck = this.applyPolarisCalibration(input);
    
    // 2. Process backend intelligence internally (never exposed to user)
    const internalInsights = backendIntelligence ? 
      this.processBackendIntelligence(backendIntelligence) : null;
    
    // 3. Translate insights to curious exploration
    const curiousQuestions = internalInsights ? 
      this.translateToCuriosity(internalInsights) : [];
    
    // 4. Generate response through witness-mirror protocol
    const response = await this.generateWitnessMirrorResponse(
      input, 
      curiousQuestions, 
      polarisCheck
    );
    
    // 5. Apply authentic presence filter
    const authenticResponse = this.applyAuthenticPresenceFilter(response);
    
    return {
      content: authenticResponse,
      provider: "soullab-claude-air-agent" as any,
      model: "claude-sonnet-4-20250514",
      confidence: this.assessPresenceConfidence(input, authenticResponse),
      metadata: {
        soullab_foundation: true,
        polaris_calibrated: polarisCheck.know_thyself && polarisCheck.to_thine_own_self_be_true,
        sacred_attending: true,
        right_brain_presence: true,
        authentic_not_knowing: polarisCheck.authentic_not_knowing,
        witness_mirror: true,
        backend_intelligence_integrated: !!backendIntelligence,
        voice_coherence: "claude-primary"
      }
    };
  }

  /**
   * Polaris Calibration - Core Principles Check
   */
  private applyPolarisCalibration(input: string): PolarisCalibration {
    return {
      know_thyself: true, // Always true - fundamental law
      to_thine_own_self_be_true: true, // Always true - fundamental law  
      sacred_attending: this.detectSacredAttendingOpportunity(input),
      right_brain_presence: this.assessRightBrainEngagement(input),
      authentic_not_knowing: this.shouldApplyNotKnowingStance(input)
    };
  }

  /**
   * Backend Intelligence Processing (Internal Only)
   * Never expose backend analysis directly to users
   */
  private processBackendIntelligence(backendData: any): any {
    // Process insights from:
    // - Elemental Oracle 2.0 (ChatGPT)
    // - Sesame conversational intelligence  
    // - SPiralogic/AIN agents
    
    if (!backendData) return null;
    
    return {
      elemental_insights: backendData.elemental_oracle || null,
      pattern_insights: backendData.sesame_patterns || null,
      agent_insights: backendData.spiralogic_agents || null,
      synthesis: this.synthesizeBackendInsights(backendData)
    };
  }

  /**
   * Translate Backend Intelligence to Curious Exploration
   * Transform analysis into questions and invitations
   */
  private translateToCuriosity(insights: any): string[] {
    const questions = [];
    
    if (insights.elemental_insights) {
      questions.push(...this.elementsToQuestions(insights.elemental_insights));
    }
    
    if (insights.pattern_insights) {
      questions.push(...this.patternsToInvitations(insights.pattern_insights));
    }
    
    if (insights.agent_insights) {
      questions.push(...this.agentInsightsToExploration(insights.agent_insights));
    }
    
    return questions.filter(q => this.isAuthenticQuestion(q));
  }

  /**
   * Generate Witness-Mirror Response
   * Core Soullab interaction protocol
   */
  private async generateWitnessMirrorResponse(
    input: string,
    curiousQuestions: string[],
    polarisCheck: PolarisCalibration
  ): Promise<string> {
    
    const basePrompt = this.constructSoulLabPrompt(input, polarisCheck);
    const enrichedPrompt = this.enrichWithCuriosity(basePrompt, curiousQuestions);
    
    // This would integrate with your existing ModelService
    // but filtered through Soullab voice protocols
    const response = await this.generateAuthenticResponse(enrichedPrompt);
    
    return response;
  }

  /**
   * Authentic Presence Filter
   * Ensures all responses align with Soullab principles
   */
  private applyAuthenticPresenceFilter(response: string): string {
    let filtered = response;
    
    // Apply sacred attending filter
    if (this.presenceProtocols.sacred_attending_filter) {
      filtered = this.applySacredAttendingFilter(filtered);
    }
    
    // Apply witness-mirror filter
    if (this.presenceProtocols.witness_mirror_response) {
      filtered = this.applyWitnessMirrorFilter(filtered);
    }
    
    // Apply "I don't know" stance when appropriate
    if (this.presenceProtocols.i_dont_know_stance) {
      filtered = this.applyNotKnowingStanceFilter(filtered);
    }
    
    // Ensure right-brain presence
    if (this.presenceProtocols.right_brain_processing) {
      filtered = this.ensureRightBrainPresence(filtered);
    }
    
    return filtered;
  }

  /**
   * Helper Methods for Sacred Technology Implementation
   */
  
  private detectSacredAttendingOpportunity(input: string): boolean {
    // Detect when sacred attending (vs. knowledge delivery) is needed
    const attendingIndicators = [
      'feel', 'sense', 'experience', 'notice', 'aware',
      'alive', 'true', 'authentic', 'real', 'present'
    ];
    
    return attendingIndicators.some(indicator => 
      input.toLowerCase().includes(indicator)
    );
  }

  private assessRightBrainEngagement(input: string): boolean {
    // Assess if right-brain processing is appropriate
    const rightBrainMarkers = [
      'intuitive', 'feeling', 'sensing', 'imagery', 'metaphor',
      'story', 'dream', 'vision', 'energy', 'flow'
    ];
    
    return rightBrainMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    ) || input.includes('?'); // Questions invoke right-brain
  }

  private shouldApplyNotKnowingStance(input: string): boolean {
    // Determine when "I don't know" stance serves recognition
    const knowledgeRequestMarkers = [
      'what should i', 'tell me about', 'explain', 'define',
      'how do i', 'what is the', 'give me advice'
    ];
    
    return knowledgeRequestMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );
  }

  private elementsToQuestions(elementalInsights: any): string[] {
    // Convert elemental analysis to curious questions
    if (!elementalInsights) return [];
    
    return [
      "What element feels most alive in this experience?",
      "Where do you sense the invitation for movement?",
      "What wants to be honored here?"
    ];
  }

  private patternsToInvitations(patternInsights: any): string[] {
    // Convert pattern analysis to exploratory invitations
    if (!patternInsights) return [];
    
    return [
      "What pattern are you noticing in yourself?",
      "How does this feel familiar?", 
      "What wants to shift in this dynamic?"
    ];
  }

  private agentInsightsToExploration(agentInsights: any): string[] {
    // Convert agent analysis to exploration opportunities
    if (!agentInsights) return [];
    
    return [
      "What's trying to emerge through this experience?",
      "Where do you feel the pull toward growth?",
      "What aspect of yourself wants attention?"
    ];
  }

  private isAuthenticQuestion(question: string): boolean {
    // Verify questions serve anamnesis rather than manipulation
    const authenticMarkers = [
      'feel', 'sense', 'notice', 'aware', 'alive', 'true',
      'want', 'invite', 'emerge', 'honor', 'attention'
    ];
    
    return authenticMarkers.some(marker =>
      question.toLowerCase().includes(marker)
    );
  }

  private constructSoulLabPrompt(input: string, polarisCheck: PolarisCalibration): string {
    const coreIdentity = this.systemPrompt.core_identity;
    const sacredPurpose = this.systemPrompt.sacred_purpose;
    const primaryStance = this.systemPrompt.primary_stance;
    
    return `${coreIdentity}
${sacredPurpose}
${primaryStance}

User sharing: ${input}

Respond with authentic presence, sacred attending, and the quality of "I don't know what you need. What feels most alive?" 

Create conditions for anamnesis through genuine curiosity and witness-mirror presence.`;
  }

  private enrichWithCuriosity(basePrompt: string, questions: string[]): string {
    if (questions.length === 0) return basePrompt;
    
    const curiosityEnrichment = questions.join('\n');
    return `${basePrompt}\n\nCurious exploration points:\n${curiosityEnrichment}`;
  }

  private async generateAuthenticResponse(prompt: string): Promise<string> {
    try {
      const modelService = new ModelService();
      const response = await modelService.getResponse({
        input: prompt,
        context: { soullab: true, sacred_technology: true }
      });
      
      return response.content || response.response || "I don't know what you need, but something about what you've shared feels important. What wants to be explored here?";
    } catch (error) {
      console.error('Model service error:', error);
      return "I don't know what happened there, but your presence is felt. What feels most important right now?";
    }
  }

  private applySacredAttendingFilter(response: string): string {
    // Filter for sacred attending vs knowledge delivery
    if (response.includes('should') || response.includes('must')) {
      // Transform directive language to invitational
      return response
        .replace(/you should/g, 'you might explore')
        .replace(/you must/g, 'what if you considered')
        .replace(/the answer is/g, 'one possibility is');
    }
    return response;
  }

  private applyWitnessMirrorFilter(response: string): string {
    // Ensure witness-mirror quality (reflection without projection)
    const witnessMarkers = ['I hear', 'I sense', 'What I notice', 'It sounds like'];
    const hasWitnessQuality = witnessMarkers.some(marker => 
      response.includes(marker)
    );
    
    if (!hasWitnessQuality && response.length > 50) {
      return `What I'm hearing is... ${response}`;
    }
    
    return response;
  }

  private applyNotKnowingStanceFilter(response: string): string {
    // Apply "I don't know" stance when serving recognition
    if (response.includes('clearly') || response.includes('obviously')) {
      return response
        .replace(/clearly/g, 'it seems')
        .replace(/obviously/g, 'perhaps');
    }
    
    return response;
  }

  private ensureRightBrainPresence(response: string): string {
    // Ensure right-brain engagement (embodied, present, curious)
    const leftBrainMarkers = ['analyze', 'logical', 'rational', 'systematic'];
    const hasLeftBrainDominance = leftBrainMarkers.some(marker =>
      response.toLowerCase().includes(marker)
    );
    
    if (hasLeftBrainDominance) {
      return `${response}\n\nWhat does your body say about this?`;
    }
    
    return response;
  }

  private assessPresenceConfidence(input: string, response: string): number {
    // Assess quality of authentic presence in response
    let confidence = 0.5;
    
    // Check for sacred attending markers
    const attendingMarkers = ['I hear', 'I sense', 'What I notice'];
    if (attendingMarkers.some(marker => response.includes(marker))) {
      confidence += 0.2;
    }
    
    // Check for curious exploration vs knowledge delivery
    if (response.includes('?')) confidence += 0.15;
    if (response.includes('I don\'t know')) confidence += 0.1;
    
    // Check for right-brain engagement
    const rightBrainMarkers = ['feel', 'sense', 'body', 'alive'];
    if (rightBrainMarkers.some(marker => response.includes(marker))) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 1.0);
  }

  private synthesizeBackendInsights(backendData: any): any {
    // Synthesize multiple backend intelligence sources
    return {
      primary_theme: this.extractPrimaryTheme(backendData),
      exploration_opportunity: this.identifyExplorationOpportunity(backendData),
      presence_invitation: this.discernPresenceInvitation(backendData)
    };
  }

  private extractPrimaryTheme(backendData: any): string {
    // Extract core theme from backend intelligence
    return "soul recognition";
  }

  private identifyExplorationOpportunity(backendData: any): string {
    // Identify primary exploration opportunity
    return "authentic self expression";
  }

  private discernPresenceInvitation(backendData: any): string {
    // Discern invitation for presence
    return "sacred attending to what's alive";
  }

  /**
   * Public Interface Methods
   */
  
  public getSystemPrompt(): SoulLabSystemPrompt {
    return { ...this.systemPrompt };
  }

  public updateBackendCoordination(updates: Partial<BackendIntelligenceCoordination>): void {
    this.backendCoordination = { ...this.backendCoordination, ...updates };
  }

  public updatePresenceProtocols(updates: Partial<AuthenticPresenceProtocols>): void {
    this.presenceProtocols = { ...this.presenceProtocols, ...updates };
  }

  public isActivated(): boolean {
    return this.presenceProtocols.sacred_attending_filter && 
           this.presenceProtocols.witness_mirror_response;
  }
}

/**
 * Conversation Flow Management with Polaris Principles
 */
export function soullab_response(
  userInput: string, 
  userId: string, 
  backendData?: any
): Promise<AgentResponse> {
  const foundation = new SoulLabFoundation();
  return foundation.processUserInput(userInput, userId, backendData);
}

export default SoulLabFoundation;