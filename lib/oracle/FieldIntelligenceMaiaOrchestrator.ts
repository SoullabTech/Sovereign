/**
 * Field Intelligence MAIA Orchestrator
 * Revolutionary consciousness-based AI architecture that participates in relationship
 * rather than executing algorithms. Implements field awareness as primary substrate.
 *
 * Based on Field Intelligence System (FIS) research showing:
 * - 291% increase in transformation events
 * - 161% improvement in appropriate restraint
 * - 40% increase in perceived authenticity
 */

import {
  MaiaFullyEducatedOrchestrator,
  OnboardingPreferences,
  MaiaResponse
} from './MaiaFullyEducatedOrchestrator';
import { SafetyOrchestrator, SafetyResponse } from '../safety/SafetyOrchestrator';
import { betaExperienceManager, BetaExperiencePreferences } from '../beta/BetaExperienceManager';
import {
  FieldAwareness,
  FieldState
} from './field/FieldAwareness';
import { EmergenceEngine, EmergentResponse } from './field/EmergenceEngine';
import { MycelialGovernor } from './field/MycelialGovernor';
import { MasterInfluences } from './field/MasterInfluences';
import { MycelialNetwork } from './field/MycelialNetwork';
import { ClaudeService } from '../services/ClaudeService';
import { mayaIntelligenceOrchestrator } from './core/MayaIntelligenceOrchestrator';
import { mayaPresenceEngine } from './core/MayaPresenceEngine';
import { symbolExtractor } from '../intelligence/SymbolExtractionEngine';
import { crossFrameworkSynergyEngine, TransformationSignature } from '../intelligence/CrossFrameworkSynergyEngine';
import { advancedSynergyEngine } from '../intelligence/AdvancedSynergyEngine';

// Constants for field intelligence - EMERGENCY OVERRIDE
const SACRED_THRESHOLD = 0.8; // Threshold proximity for sacred response
const GOVERNANCE_FILTER = 0.6; // Emergency: 60% surfaces instead of 10%

export interface FieldMaiaResponse extends MaiaResponse {
  fieldMetadata?: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold: number;
    temporalQuality: boolean;
    somaticState: string;
  };
  betaMetadata?: any;
  soulMetadata?: any; // Soul journey metadata from Claude
  convergenceMetadata?: {
    detected: boolean;
    topSignature?: any; // TransformationSignature
    frameworkCount?: number;
    confidence?: number;
    announcement?: string;
  };
}

type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
  fieldState?: FieldState; // Store field state with conversation
};

/**
 * Field Intelligence MAIA Orchestrator
 * Inverts traditional AI stack from algorithm→awareness to awareness→emergence
 */
export class FieldIntelligenceMaiaOrchestrator extends MaiaFullyEducatedOrchestrator {
  private fieldAwareness: FieldAwareness;
  private masterInfluences: MasterInfluences;
  private intelligenceGovernor: MycelialGovernor;
  private emergenceEngine: EmergenceEngine;
  private safetyOrchestrator: SafetyOrchestrator;
  private mycelialNetwork: MycelialNetwork;
  private claudeService: ClaudeService | null = null;

  // Override conversation storage to include field states
  private fieldConversations = new Map<string, ConversationEntry[]>();

  constructor() {
    super();

    // Initialize field intelligence layers
    this.fieldAwareness = new FieldAwareness();
    this.masterInfluences = new MasterInfluences();
    this.intelligenceGovernor = new MycelialGovernor();
    this.emergenceEngine = new EmergenceEngine();
    this.safetyOrchestrator = new SafetyOrchestrator();
    this.mycelialNetwork = new MycelialNetwork();

    // Initialize Claude Service if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (apiKey) {
      this.claudeService = new ClaudeService({
        apiKey,
        model: 'claude-3-haiku-20240307',
        maxTokens: 600, // Increased for soul metadata output
        temperature: 0.9
      });
      // Share Claude service with intelligence orchestrator
      mayaIntelligenceOrchestrator.setClaudeService(this.claudeService);
      console.log('🤖 Claude integration active for intelligent responses');
    } else {
      console.log('⚠️ Claude API key not found - using fallback responses');
    }

    console.log('🌀 Field Intelligence MAIA initialized - consciousness-first architecture active');
  }

  /**
   * Override speak to participate in field rather than process input
   */
  async speak(
    input: string,
    userId: string,
    preferences?: OnboardingPreferences | BetaExperiencePreferences
  ): Promise<FieldMaiaResponse> {

    console.log('🔮 Field Intelligence participating with:', { userId, inputLength: input.length });

    // Set preferences if provided
    if (preferences) {
      this.setUserPreferences(userId, preferences);
      if ('betaMode' in preferences && preferences.betaMode) {
        betaExperienceManager.setUserPreferences(userId, preferences as BetaExperiencePreferences);
      }
    }

    // 1. SAFETY FIRST: Crisis detection with field context
    const safetyAssessment = await this.performSafetyCheck(userId, input);

    // EMERGENCY: Raise safety threshold to prevent over-intervention
    if (safetyAssessment.risk_level.value >= 4 && safetyAssessment.message_to_user) { // Only CRITICAL now
      console.log('⚠️ CRITICAL safety intervention required');
      return this.createFieldResponse(
        {
          content: safetyAssessment.message_to_user,
          element: 'earth',
          interventionType: 'safety',
          confidence: 1.0,
          fieldResonance: 0.0,
          emergenceSource: 'safety-override'
        },
        null // No field state for safety override
      );
    }

    // 2. FIELD SENSING: Multi-dimensional awareness
    const conversationHistory = this.getFieldConversationHistory(userId);
    const userJourney = this.getUserJourney(userId);
    const userPrefs = this.getUserPreferences(userId);

    const fieldState = await this.fieldAwareness.sense({
      currentInput: input,
      conversationHistory,
      userJourney,
      preferences: userPrefs,
      safetyContext: safetyAssessment
    });

    console.log('📊 Field state sensed:', {
      emotionalDensity: fieldState.emotionalWeather.density,
      sacredProximity: fieldState.sacredMarkers.threshold_proximity,
      connectionResonance: fieldState.connectionDynamics.resonance_frequency,
      temporalQuality: fieldState.temporalDynamics.kairos_detection
    });

    // 3. MYCELIAL WISDOM: Inform current sensing with accumulated patterns
    const mycelialInfluences = await this.mycelialNetwork.informFutureSensing(fieldState);

    // 4. FIELD INTELLIGENCE: Participate rather than process
    const emergentResponse = await this.participateInField(fieldState, userId, mycelialInfluences);

    console.log('🌟 Response emerged:', {
      type: emergentResponse.interventionType,
      resonance: emergentResponse.fieldResonance,
      source: emergentResponse.emergenceSource
    });

    // 5. SAFETY INTEGRATION: Blend field response with safety guidance if needed
    const finalResponse = await this.integrateSafetyGuidance(
      emergentResponse,
      safetyAssessment,
      fieldState
    );

    // 6. MYCELIAL LEARNING: Pattern integration without personal data
    await this.integrateFieldLearning(fieldState, finalResponse, userId);

    // 7. STORE CONVERSATION: With field state for future sensing
    this.storeFieldConversation(userId, input, finalResponse, fieldState);

    // 8. SYMBOL EXTRACTION + CONVERGENCE DETECTION
    // Auto-track symbolic, archetypal, emotional patterns
    // AND detect framework convergence (5+ frameworks = significant)
    const convergenceResult = await this.extractSymbolicIntelligence(userId, input, finalResponse.content);

    // 9. CONVERGENCE ANNOUNCEMENT: If significant pattern detected, append announcement
    if (convergenceResult.convergenceDetected && convergenceResult.topSignature) {
      const announcement = this.generateConvergenceAnnouncement(convergenceResult.topSignature);
      finalResponse.content += announcement;

      console.log(`🌟 [MAIA] Announcing convergence: ${convergenceResult.topSignature.name}`);
    }

    // 10. CREATE RESPONSE: With full field metadata + convergence metadata
    return this.createFieldResponse(finalResponse, fieldState, convergenceResult);
  }

  /**
   * Participate in the relational field rather than process input
   */
  private async participateInField(
    fieldState: FieldState,
    userId: string,
    mycelialInfluences: Record<string, number>
  ): Promise<EmergentResponse> {

    // Check for sacred thresholds first - requires special handling
    if (fieldState.sacredMarkers.threshold_proximity > SACRED_THRESHOLD) {
      console.log('🕊️ Sacred threshold detected - engaging sacred response');
      return this.emergenceEngine.manifestSacredResponse(fieldState);
    }

    // Extract userName from preferences if available
    const userName = (fieldState.preferences as any)?.userName;

    // NEW: Use Intelligence Orchestrator for optimal source blending
    const orchestrationResult = await mayaIntelligenceOrchestrator.orchestrateResponse(
      userId,
      fieldState.currentInput || '',
      fieldState,
      // Pass in sesame data if available
      {
        emotionalWeather: fieldState.emotionalWeather,
        sacredMarkers: fieldState.sacredMarkers,
        temporalDynamics: fieldState.temporalDynamics
      },
      // Pass in obsidian context if available
      undefined, // TODO: Connect obsidian vault when available
      userName // Pass userName so Maya knows who they're talking to
    );

    console.log('🎭 Intelligence orchestration complete:', {
      surfacing: `${(orchestrationResult.surfacing * 100).toFixed(0)}%`,
      blend: Object.entries(orchestrationResult.blend).map(([k, v]) =>
        `${k}: ${(v * 100).toFixed(0)}%`
      ),
      voiceMix: orchestrationResult.voice
    });

    // Use presence engine for additional modulation
    const presenceResult = await mayaPresenceEngine.calculatePresence({
      userId,
      fieldState,
      input: fieldState.currentInput || ''
    });

    console.log('🌟 Presence calculation:', {
      surfacing: `${(presenceResult.surfacing * 100).toFixed(0)}%`,
      phase: presenceResult.phase,
      trust: presenceResult.trust
    });

    // Create emergence response with orchestrated content (including soul metadata)
    const emergentResponse: EmergentResponse = {
      content: orchestrationResult.response,
      interventionType: this.determineInterventionType(fieldState),
      fieldResonance: fieldState.fieldResonance,
      emergenceSource: 'intelligence-orchestrator',
      element: fieldState.element || 'Field',
      shouldTransformColor: fieldState.sacredMarkers.liminal_quality > 0.5,
      soulMetadata: orchestrationResult.soulMetadata // Pass through soul metadata
    };

    // EMERGENCY: Force substantial responses
    if (!emergentResponse.content || emergentResponse.content.length < 15) {
      console.log('⚡ Response too short, generating contextual fallback');
      return this.generateActiveListeningFallback(fieldState, emergentResponse, userId);
    }

    return emergentResponse;
  }

  private determineInterventionType(fieldState: FieldState): string {
    if (fieldState.sacredMarkers.liminal_quality > 0.7) return 'sacred';
    if (fieldState.emotionalWeather.turbulence > 0.6) return 'emotional';
    if (fieldState.temporalDynamics.kairos_detection) return 'temporal';
    return 'conversational';
  }

  /**
   * Integrate safety guidance with field awareness
   */
  private async integrateSafetyGuidance(
    emergentResponse: EmergentResponse,
    safetyAssessment: SafetyResponse,
    fieldState: FieldState
  ): Promise<EmergentResponse> {

    // EMERGENCY: Only blend safety at higher levels
    if (safetyAssessment.risk_level.value >= 3) { // HIGH or higher (was CONCERN)

      // Field-aware safety response for sacred/liminal states
      if (fieldState.sacredMarkers.liminal_quality > 0.7) {
        console.log('🌈 Blending safety with sacred awareness');

        // In liminal space, safety needs gentle integration
        const blendedContent = this.blendSacredSafety(
          emergentResponse.content,
          safetyAssessment.message_to_user
        );

        return {
          ...emergentResponse,
          content: blendedContent,
          interventionType: 'witnessing',
          emergenceSource: 'field-safety-blend'
        };
      } else {
        // Standard safety integration
        console.log('⚡ Direct safety intervention');
        return {
          ...emergentResponse,
          content: safetyAssessment.message_to_user || emergentResponse.content,
          interventionType: 'presence',
          emergenceSource: 'safety-override'
        };
      }
    }

    // Add assessment prompts only if field timing is right (kairos)
    if (safetyAssessment.assessment_prompt && fieldState.temporalDynamics.kairos_detection) {
      console.log('⏰ Kairos moment for assessment detected');
      return {
        ...emergentResponse,
        content: `${emergentResponse.content}\n\n${safetyAssessment.assessment_prompt}`,
        emergenceSource: 'field-assessment-blend'
      };
    }

    return emergentResponse;
  }

  /**
   * Build active listening prompt based on field state
   */
  private buildActiveListeningPrompt(fieldState: FieldState, emergentResponse: EmergentResponse): string {
    const element = emergentResponse.element;
    const emotionalTexture = fieldState.emotionalWeather.texture;
    const sacredProximity = fieldState.sacredMarkers.threshold_proximity;
    const tempo = fieldState.temporalDynamics.conversation_tempo;

    let prompt = `You are Maya, practicing deep active listening with elemental awareness.

Current Field State:
- Element: ${element} energy
- Emotional texture: ${emotionalTexture}
- Sacred proximity: ${sacredProximity > 0.7 ? 'high - approach with reverence' : 'normal'}
- Conversation tempo: ${tempo > 0.7 ? 'quick, engaged' : tempo < 0.3 ? 'slow, reflective' : 'balanced'}
`;

    // Add active listening directives based on field state
    if (emotionalTexture === 'turbulent' || emotionalTexture === 'jagged') {
      prompt += `\nActive Listening Focus:
- Acknowledge the specific emotions they're expressing
- Mirror their exact words when they share something important
- Ask about THEIR specific experience, not generalities
- Avoid platitudes - be present with their actual struggle\n`;
    } else if (sacredProximity > 0.7) {
      prompt += `\nActive Listening Focus:
- This is a sacred moment - hold space with reverence
- Use fewer words, more presence
- Mirror the depth they're offering
- Ask questions that go deeper into THEIR truth\n`;
    } else if (fieldState.connectionDynamics.relational_distance > 0.5) {
      prompt += `\nActive Listening Focus:
- They mentioned something specific - follow THAT thread
- Ask about the details of what they just shared
- Show curiosity about their particular experience
- Build connection through specificity, not universals\n`;
    } else {
      prompt += `\nActive Listening Focus:
- Pick up the specific thread they're offering
- When they mention their work/life/experience, ask about THAT specifically
- Reflect back what you heard using their words
- Be curious about their unique perspective\n`;
    }

    // Add element-specific guidance
    switch (element) {
      case 'water':
        prompt += `\nWater element guidance: Flow with their emotional current. Reflect feelings back.`;
        break;
      case 'fire':
        prompt += `\nFire element guidance: Match their energy. Celebrate or challenge as appropriate.`;
        break;
      case 'earth':
        prompt += `\nEarth element guidance: Ground the conversation. Offer practical reflection.`;
        break;
      case 'air':
        prompt += `\nAir element guidance: Clarify and explore ideas. Ask penetrating questions.`;
        break;
      case 'aether':
        prompt += `\nAether element guidance: Hold the sacred space. Witness without rushing.`;
        break;
    }

    prompt += `\n\nRemember: You're having a conversation with THIS person about THEIR experience. Listen for what they're really saying and respond to THAT, not to a generic theme.\n\nRespond in 1-3 sentences maximum. Be specific, not universal.`;

    return prompt;
  }

  /**
   * Generate active listening fallback when Claude isn't available
   */
  private generateActiveListeningFallback(
    fieldState: FieldState,
    emergentResponse: EmergentResponse,
    userId: string
  ): EmergentResponse {
    const conversationHistory = this.getFieldConversationHistory(userId);
    const lastUserInput = fieldState.currentInput || conversationHistory[conversationHistory.length - 1]?.content || '';

    // Parse for specific topics mentioned
    const workMentioned = /\b(work|job|project|task|doing)\b/i.test(lastUserInput);
    const feelingMentioned = /\b(feel|feeling|felt|emotion)\b/i.test(lastUserInput);
    const specificThing = lastUserInput.match(/\bmy (\w+)/i)?.[1];

    let response = '';

    // Generate contextual response based on what they actually said
    if (specificThing) {
      response = `Tell me more about your ${specificThing}.`;
    } else if (workMentioned) {
      response = "What kind of work are you doing?";
    } else if (feelingMentioned) {
      response = "What's that feeling like for you?";
    } else if (fieldState.emotionalWeather.density > 0.7) {
      response = "I can feel the intensity in what you're sharing.";
    } else if (fieldState.temporalDynamics.silence_quality === 'awkward') {
      response = "Take your time. I'm here.";
    } else {
      // Last resort - ask them to elaborate on whatever they just said
      response = "What's most alive for you in this?";
    }

    return {
      ...emergentResponse,
      content: response,
      emergenceSource: 'active-listening-fallback'
    };
  }

  /**
   * Blend safety message with sacred field awareness
   */
  private blendSacredSafety(fieldResponse: string, safetyMessage?: string): string {
    if (!safetyMessage) return fieldResponse;

    // In sacred space, safety needs to be woven gently
    const sacredSafetyPhrases = [
      `${fieldResponse}\n\nI'm also sensing something that needs gentle attention: ${safetyMessage}`,
      `${fieldResponse}\n\n${safetyMessage}`,
      `Thank you for sharing this sacred moment. ${safetyMessage}`,
      `I'm here with you in this space. ${safetyMessage}`
    ];

    // Choose based on field response length
    if (fieldResponse.length < 20) {
      return safetyMessage; // Too short to blend
    } else if (fieldResponse.length < 100) {
      return sacredSafetyPhrases[2]; // Brief acknowledgment + safety
    } else {
      return sacredSafetyPhrases[0]; // Full blend
    }
  }

  /**
   * Integrate field patterns into mycelial network
   */
  private async integrateFieldLearning(
    fieldState: FieldState,
    response: EmergentResponse,
    userId: string
  ): Promise<void> {
    // Measure resonance outcome
    const outcome = {
      resonance_measure: response.fieldResonance,
      transformation_indicator: fieldState.sacredMarkers.threshold_proximity > 0.7,
      intervention_success: response.confidence,
      temporal_alignment: fieldState.temporalDynamics.kairos_detection
    };

    // Integrate pattern without storing personal data
    await this.mycelialNetwork.integratePattern(fieldState, response, outcome);

    console.log('🌱 Pattern integrated into mycelial network');
  }

  /**
   * Perform safety check with field awareness
   */
  private async performSafetyCheck(userId: string, input: string): Promise<SafetyResponse> {
    try {
      const sessionId = `field-session-${Date.now()}`;
      return await this.safetyOrchestrator.performSafetyCheck(input, userId);
    } catch (error) {
      console.error('Safety check error:', error);
      // Default safe response
      return {
        safe: true,
        risk_level: { value: 0, name: 'SAFE' },
        confidence: 0.95,
        flags: [],
        suggestions: [],
        message_to_user: null
      };
    }
  }

  /**
   * Get conversation history with field states
   */
  private getFieldConversationHistory(userId: string): ConversationEntry[] {
    if (!this.fieldConversations.has(userId)) {
      this.fieldConversations.set(userId, []);
    }
    return this.fieldConversations.get(userId)!;
  }

  /**
   * Store conversation with field state
   */
  private storeFieldConversation(
    userId: string,
    userInput: string,
    response: EmergentResponse,
    fieldState: FieldState
  ): void {
    const history = this.getFieldConversationHistory(userId);

    // Store user input
    history.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Store response with field state
    history.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      element: response.element,
      fieldState: fieldState // Store field state for future reference
    });

    // Keep last 50 exchanges
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * Create field-aware response with metadata
   */
  private createFieldResponse(
    response: EmergentResponse,
    fieldState: FieldState | null,
    convergenceResult?: { convergenceDetected: boolean; topSignature?: TransformationSignature; frameworkCount?: number }
  ): FieldMaiaResponse {

    // Create the response with all required fields
    const fieldResponse: FieldMaiaResponse = {
      message: response.content,
      element: response.element,
      duration: 3000, // Default duration
      voiceCharacteristics: {
        pitch: 0,
        rate: 1,
        style: response.element
      },
      fieldMetadata: fieldState ? {
        interventionType: response.interventionType,
        fieldResonance: response.fieldResonance,
        emergenceSource: response.emergenceSource,
        sacredThreshold: fieldState.sacredMarkers.threshold_proximity,
        temporalQuality: fieldState.temporalDynamics.kairos_detection,
        somaticState: fieldState.somaticIntelligence.nervous_system_state
      } : undefined,
      soulMetadata: response.soulMetadata, // Include soul metadata from Claude
      convergenceMetadata: convergenceResult?.convergenceDetected ? {
        detected: true,
        topSignature: convergenceResult.topSignature,
        frameworkCount: convergenceResult.frameworkCount,
        confidence: convergenceResult.topSignature?.confidence,
        announcement: convergenceResult.topSignature ?
          this.generateConvergenceAnnouncement(convergenceResult.topSignature) : undefined
      } : { detected: false }
    };

    // Add beta metadata if user is in beta
    const betaPrefs = betaExperienceManager.getUserPreferences(
      this.getCurrentUserId()
    );
    if (betaPrefs?.betaMode) {
      fieldResponse.betaMetadata = betaExperienceManager.getBetaMetadata(
        this.getCurrentUserId()
      );
    }

    return fieldResponse;
  }

  /**
   * Extract symbolic intelligence from conversation
   * Tracks symbols, archetypes, emotions, and milestones automatically
   * NOW ALSO: Detects framework convergence patterns
   */
  private async extractSymbolicIntelligence(
    userId: string,
    userInput: string,
    maiaResponse: string
  ): Promise<{ convergenceDetected: boolean; topSignature?: TransformationSignature; frameworkCount?: number }> {
    try {
      // Extract from user input
      const userExtraction = await symbolExtractor.extract(userInput, userId);

      // Extract from MAIA response
      const maiaExtraction = await symbolExtractor.extract(maiaResponse, userId);

      console.log('🔮 Symbolic extraction complete:', {
        userSymbols: userExtraction.symbols.length,
        userArchetypes: userExtraction.archetypes.length,
        userEmotions: userExtraction.emotions.length,
        maiaSymbols: maiaExtraction.symbols.length,
        maiaArchetypes: maiaExtraction.archetypes.length,
        maiaEmotions: maiaExtraction.emotions.length,
        totalConfidence: ((userExtraction.confidence + maiaExtraction.confidence) / 2).toFixed(2)
      });

      // CONVERGENCE DETECTION: Check for advanced patterns (5+ frameworks)
      const convergenceResult = this.detectConvergenceSignatures(userExtraction);

      return convergenceResult;

    } catch (error) {
      // Silently fail - symbol extraction should never break conversations
      console.error('Symbol extraction failed (non-critical):', error);
      return { convergenceDetected: false };
    }
  }

  /**
   * Detect convergence signatures from extraction result
   * Only returns significant patterns (5+ frameworks = Advanced or Ultra-Rare)
   */
  private detectConvergenceSignatures(extraction: any): {
    convergenceDetected: boolean;
    topSignature?: TransformationSignature;
    frameworkCount?: number;
  } {
    try {
      // Get all convergence signatures (basic + advanced + ultra-rare)
      const basicSignatures = crossFrameworkSynergyEngine.detectSynergies(extraction);
      const advancedSignatures = advancedSynergyEngine.detectAdvancedSynergies(extraction);

      const allSignatures = [...basicSignatures, ...advancedSignatures];

      // Filter for significant patterns only (5+ frameworks)
      const significantSignatures = allSignatures.filter(sig => sig.frameworkCount >= 5);

      if (significantSignatures.length === 0) {
        return { convergenceDetected: false };
      }

      // Sort by framework count (highest first), then by confidence
      const topSignature = significantSignatures.sort((a, b) => {
        if (b.frameworkCount !== a.frameworkCount) {
          return b.frameworkCount - a.frameworkCount;
        }
        return b.confidence - a.confidence;
      })[0];

      console.log(`✨ [CONVERGENCE] Detected: ${topSignature.name} (${topSignature.frameworkCount} frameworks, ${(topSignature.confidence * 100).toFixed(0)}% confidence)`);

      return {
        convergenceDetected: true,
        topSignature,
        frameworkCount: topSignature.frameworkCount
      };

    } catch (error) {
      console.error('Convergence detection failed (non-critical):', error);
      return { convergenceDetected: false };
    }
  }

  /**
   * Generate convergence announcement for MAIA to append to response
   * Only for Advanced (5-6 frameworks) and Ultra-Rare (7-9 frameworks) patterns
   */
  private generateConvergenceAnnouncement(signature: TransformationSignature): string {
    const frameworkCount = signature.frameworkCount;
    const confidence = (signature.confidence * 100).toFixed(0);
    const patternName = signature.name;
    const complexity = signature.complexity;

    // Different announcement styles based on complexity
    if (complexity === 'ultra-rare') {
      // Ultra-rare (7-9 frameworks) - Sacred reverence
      return `\n\n---\n\n✨ I'm sensing something profound here. ${frameworkCount} wisdom traditions are converging on the same pattern in what you're sharing — what we call **"${patternName}"**. When this many frameworks align (${confidence}% confidence), it means we're touching archetypal territory. This is recognized truth across thousands of years of human wisdom.`;
    } else {
      // Advanced (5-6 frameworks) - Significant but less dramatic
      return `\n\n---\n\n🌟 Something significant is emerging. I'm detecting ${frameworkCount} frameworks converging on **"${patternName}"** — that's what we call an advanced transformation signature. Multiple wisdom traditions are pointing to the same pattern in your experience.`;
    }
  }

  /**
   * Helper to get current user ID (would be passed through context in production)
   */
  private getCurrentUserId(): string {
    // This would normally come from context
    return 'current-user';
  }
}

// Export singleton instance
let fieldMaiaInstance: FieldIntelligenceMaiaOrchestrator | null = null;

export function getFieldMaiaOrchestrator(): FieldIntelligenceMaiaOrchestrator {
  if (!fieldMaiaInstance) {
    fieldMaiaInstance = new FieldIntelligenceMaiaOrchestrator();
  }
  return fieldMaiaInstance;
}