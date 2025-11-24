/**
 * Conversational Pipeline - Sesame/Maya Centric Intelligence
 * Upstream models draft → Sesame CI shapes → Maya TTS voices
 * Maintains conversational authenticity and cost efficiency
 */

import { logger } from '../utils/logger';
import { routeToModel } from './ElementalIntelligenceRouter';
import { safetyService } from './SafetyModerationService';
import { embeddingQueue } from './embeddingQueue';
import { getMayaMode, MAYA_FEATURES } from '../config/mayaMode';
import { MAYA_PROMPT_BETA, getMayaBetaFallback } from '../prompts/mayaPrompt.beta';
import { MAYA_PROMPT_FULL } from '../prompts/mayaPrompt.full';
import { sesameTTS } from './SesameTTS';
import { MemoryOrchestrator } from './MemoryOrchestrator';
import { ttsOrchestrator } from './TTSOrchestrator';
// import { FileMemoryIntegration } from '../../../lib/services/FileMemoryIntegration'; // Temporarily disabled
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { ADAPTIVE_ONBOARDING, detectResponseIntent, getAdaptiveResponse } from '../config/adaptiveOnboarding';
// TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
// import MultiModalEmotionalIntelligence, { VoiceMetrics, EmotionalState, SessionMemory } from './MultiModalEmotionalIntelligence';
import AdaptiveProsodyEngine from './AdaptiveProsodyEngine';
import { UserMemoryService } from './UserMemoryService';
import { DynamicGreetingService } from './DynamicGreetingService';
import { MemoryCoreIndex } from './MemoryCoreIndex';

// Load OpeningRitual configs
const ritualPath = path.join(__dirname, '../../config/OpeningRitual.json');
const mayaScriptPath = path.join(__dirname, '../../config/MayaOpeningScript.json');
let OpeningRitual: any = null;
let MayaScript: any = null;

// Initialize AdaptiveProsodyEngine will be done in constructor with logger

try {
  OpeningRitual = JSON.parse(fs.readFileSync(ritualPath, 'utf-8'));
  logger.info('📜 OpeningRitual.json loaded successfully');
} catch (error) {
  logger.warn('⚠️ Failed to load OpeningRitual.json, using fallback responses:', error.message);
  // Fallback ritual config
  OpeningRitual = {
    welcome: ["Hey there 👋 I'm Maya. Glad you're here."],
    questions: []
  };
}

try {
  MayaScript = JSON.parse(fs.readFileSync(mayaScriptPath, 'utf-8'));
  logger.info('🎭 MayaOpeningScript.json loaded successfully');
} catch (error) {
  logger.warn('⚠️ Failed to load MayaOpeningScript.json, using basic welcome:', error.message);
  MayaScript = null;
}

// Note: getAdaptiveResponse is now imported from '../config/adaptiveOnboarding'

// Enhanced Context type for pipeline with multi-modal support
export interface ConversationalContext {
  userText: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  sentiment: "low" | "neutral" | "high";
  element: "air" | "fire" | "water" | "earth" | "aether";
  voiceEnabled: boolean;
  userId: string;
  sessionId: string;
  // Enhanced multi-modal fields
  audioBuffer?: ArrayBuffer;
  // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
  // voiceMetrics?: VoiceMetrics;
  // emotionalState?: EmotionalState;
  // toneAnalysis?: ToneAnalysis;
  // sessionMemory?: SessionMemory; // TEMPORARILY DISABLED
  // Opening Ritual state (enhanced)
  onboardingStep?: "welcome" | "energy_check" | "focus_intention" | "spiral_phase" | "maya_welcome" | "maya_energy" | "maya_spiral" | "completed" | null;
  pendingQuestionId?: string;
  ritualResponses?: Record<string, any>;
  currentElement?: string;
  currentArchetype?: string;
  therapeuticNeeds?: string[];
  // Legacy fields for compatibility
  energy_state?: "low" | "high" | "scattered" | "emotional";
  focus_area?: "work" | "relationships" | "self";
  onboardingData?: {
    energyState?: string;
    focusArea?: string;
    detectedElement?: "air" | "fire" | "water" | "earth" | "aether";
    detectedArchetype?: "sage" | "oracle" | "companion" | "guide";
  };
  // Legacy fields for backward compatibility
  convoSummary?: string;
  longMemSnippets?: string[];
  recentBotReplies?: string[];
  // Journal fields
  journal?: boolean;
  tags?: string[];
  phase?: string;
}

// Pipeline result
export interface ConversationalResult {
  text: string;
  audioUrl: string | null;
  element: string;
  processingTime: number;
  source: 'sesame_shaped' | 'fallback';
  citations?: {
    fileId: string;
    fileName: string;
    category?: string;
    pageNumber?: number;
    sectionTitle?: string;
    sectionLevel?: number;
    preview: string;
    relevance: number;
    chunkIndex: number;
  }[];
  metadata: {
    draftModel: string;
    reshapeCount: number;
    voiceSynthesized: boolean;
    cost: {
      draftTokens: number;
      ttsSeconds?: number;
    };
  };
}

// Response planning
interface ResponsePlan {
  contentConstraints: string[];
  voiceDirectives: string[];
  expectedLength: 'short' | 'medium' | 'long';
  emotionalGoal: string;
}

// Anti-canned detection
const BOILERPLATE_PHRASES = [
  "I understand",
  "I'm here to help",
  "That's a great question",
  "I appreciate you sharing",
  "Thank you for reaching out",
  "I'm sorry to hear",
  "It sounds like",
  "I can imagine",
  "That makes sense",
  "I hear you saying"
];

const GENERIC_PATTERNS = [
  /I'm (here|available) to .*/i,
  /feel free to .*/i,
  /please don't hesitate to .*/i,
  /is there anything else .*/i,
  /(remember|keep in mind) that .*/i
];

export class ConversationalPipeline {
  private recentAudioCache = new Map<string, string>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private memoryOrchestrator: MemoryOrchestrator;
  private memoryCoreIndex: MemoryCoreIndex;
  // Multi-modal intelligence engines
  // private multiModalEI: MultiModalEmotionalIntelligence;
  private adaptiveProsody: AdaptiveProsodyEngine;
  // private fileMemory: FileMemoryIntegration; // Temporarily disabled

  constructor(dependencies?: { supabase?: any; vectorSearch?: any }) {
    this.memoryOrchestrator = new MemoryOrchestrator(dependencies);
    this.memoryCoreIndex = new MemoryCoreIndex();
    // Initialize AdaptiveProsodyEngine with logger
    this.adaptiveProsody = new AdaptiveProsodyEngine(logger);
    // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
    // this.multiModalEI = new MultiModalEmotionalIntelligence(logger);
    // this.fileMemory = new FileMemoryIntegration(); // Temporarily disabled
    
    logger.info('🧠 ConversationalPipeline initialized with MemoryCoreIndex and AdaptiveProsodyEngine');
  }

  /**
   * Run Maya's Opening Ritual with AdaptiveProsodyEngine integration
   */
  async runOpeningRitual(userTranscript: string, sessionContext: any) {
    console.log('[OpeningRitual] Starting...');

    if (!MayaScript) {
      return null;
    }

    const energyCheck = MayaScript.energy_check;

    try {
      // Step 1: Analyze user tone with AdaptiveProsodyEngine
      const toneAnalysis = await this.adaptiveProsody.analyzeUserTone(userTranscript);
      console.log('[OpeningRitual] Tone analysis:', toneAnalysis);

      let mirrorLine = "";
      let balanceLine = "";
      const dominantElement = toneAnalysis.dominantElement;

      // Step 2: Handle resistance/uncertainty
      if (toneAnalysis.resistanceFlags?.uncertainty || toneAnalysis.confidenceScore < 0.3) {
        console.log('[OpeningRitual] User unsure → using fallback');
        const fallback = MayaScript.fallbacks?.unclear || { text: "I'm picking up mixed signals, which often means there's beautiful complexity happening." };
        return {
          mirror: fallback.text,
          balance: "Tell me more about what you're experiencing.",
          raw: fallback.text + " Tell me more about what you're experiencing.",
          elementDetected: 'resistance',
          confidence: toneAnalysis.confidenceScore
        };
      }

      // Step 3: Find matching branch in the existing structure
      let matchedBranch = null;
      for (const branch of energyCheck.branches || []) {
        if (branch.element === dominantElement || 
            (toneAnalysis.mixedTones && 
             (branch.element === toneAnalysis.mixedTones.primary || branch.element === toneAnalysis.mixedTones.secondary))) {
          matchedBranch = branch;
          break;
        }
      }
      
      if (matchedBranch) {
        mirrorLine = matchedBranch.maya_response || '';
        balanceLine = "Let's explore this together."; // Simple balance for now
        console.log(`[OpeningRitual] Matched element: ${matchedBranch.element}`);
      } else {
        // Fallback to aether/default
        const fallback = MayaScript.fallbacks?.no_match || { text: "I sense something unique in your energy." };
        mirrorLine = fallback.text;
        balanceLine = "This is actually quite beautiful — let's explore this together.";
      }

      // Step 4: Determine spiral phase (simplified - could be enhanced)
      const phase = this.inferSpiralPhase(userTranscript, toneAnalysis);
      const phaseLine = this.getSpiralPhaseResponse(phase);

      // Step 5: Shape the response with prosody
      const combinedResponse = `${mirrorLine} ${balanceLine} ${phaseLine}`.trim();
      const shaped = await this.adaptiveProsody.shapeResponse(userTranscript, combinedResponse);

      console.log('[OpeningRitual] Shaped response:', shaped);

      return {
        raw: combinedResponse,
        shaped: shaped.balancePhase?.text || combinedResponse,
        mirror: mirrorLine,
        balance: balanceLine,
        phase: phaseLine,
        elementDetected: dominantElement,
        phaseDetected: phase,
        confidence: toneAnalysis.confidenceScore,
        toneAnalysis
      };

    } catch (error) {
      console.error('[OpeningRitual] AdaptiveProsodyEngine failed:', error);
      // Fallback to basic pattern matching
      return this.runBasicOpeningRitual(userTranscript, energyCheck);
    }
  }

  /**
   * Infer spiral phase from user input and tone analysis
   */
  private inferSpiralPhase(userTranscript: string, toneAnalysis: any): string {
    const lower = userTranscript.toLowerCase();
    
    // Simple pattern matching for phases
    if (lower.match(/start|begin|new|first/)) return 'initiation';
    if (lower.match(/challenge|difficult|struggle|hard/)) return 'challenge';
    if (lower.match(/learning|understand|process|integrate/)) return 'integration';
    if (lower.match(/good|confident|master|skilled/)) return 'mastery';
    if (lower.match(/transcend|spiritual|beyond|breakthrough/)) return 'transcendence';
    
    // Default based on energy level
    if (toneAnalysis.energyLevel === 'high') return 'mastery';
    if (toneAnalysis.energyLevel === 'low') return 'integration';
    
    return 'integration'; // Default
  }

  /**
   * Get spiral phase response text
   */
  private getSpiralPhaseResponse(phase: string): string {
    const responses = {
      initiation: "🌱 Sounds like you're beginning something new. Initiation is a sacred place of discovery.",
      challenge: "⚔️ You're in the crucible of challenge. Every obstacle is shaping you into something stronger.",
      integration: "🌀 You're in integration — weaving together what you've been through into wisdom.",
      mastery: "🏔 You're in mastery — flowing with skill and confidence.",
      transcendence: "✨ You're in transcendence — breaking through into a new level of awareness."
    };
    
    return responses[phase] || responses.integration;
  }

  /**
   * Get emoji for element
   */
  private getElementEmoji(element: string): string {
    const elementEmojis = {
      fire: '🔥',
      water: '🌊',
      earth: '🌍',
      air: '🌬',
      aether: '✨'
    };
    
    return elementEmojis[element as keyof typeof elementEmojis] || '✨';
  }

  /**
   * Basic opening ritual fallback when AdaptiveProsodyEngine fails
   */
  private runBasicOpeningRitual(userTranscript: string, energyCheck: any) {
    console.log('[OpeningRitual] Using basic fallback pattern matching');
    
    const lower = userTranscript.toLowerCase();
    let elementDetected = 'aether';
    let mirrorLine = '';
    let balanceLine = '';

    // Simple element detection
    if (lower.match(/fire|passion|energy|excited|intense/)) {
      elementDetected = 'fire';
      mirrorLine = energyCheck.fire?.mirror || '🔥 I hear the fire in you — intense, alive, passionate.';
      balanceLine = energyCheck.fire?.balance || 'Let\'s honor that heat, and then bring some 🌍 grounding earth so it doesn\'t burn you out.';
    } else if (lower.match(/water|emotion|feel|sad|tears/)) {
      elementDetected = 'water';
      mirrorLine = energyCheck.water?.mirror || '🌊 I feel the depth of your water — flowing, emotional, tender.';
      balanceLine = energyCheck.water?.balance || 'Let\'s give that depth some 🔥 fire spark to help lift your energy gently.';
    } else if (lower.match(/earth|grounded|heavy|stuck|tired/)) {
      elementDetected = 'earth';
      mirrorLine = energyCheck.earth?.mirror || '🌍 I sense the grounded earth in your words — steady, but maybe a little heavy.';
      balanceLine = energyCheck.earth?.balance || 'Let\'s lighten things with some 🌬 air, so movement and perspective can flow in.';
    } else if (lower.match(/air|think|mind|ideas|thoughts/)) {
      elementDetected = 'air';
      mirrorLine = energyCheck.air?.mirror || '🌬 I notice the air energy — thoughts swirling, ideas racing.';
      balanceLine = energyCheck.air?.balance || 'Let\'s anchor those ideas with some 🌍 earth so they can land and grow roots.';
    } else {
      // Use resistance branch for uncertain cases
      return {
        mirror: energyCheck.resistanceBranch[0],
        balance: energyCheck.resistanceBranch[1],
        raw: energyCheck.resistanceBranch.join(' '),
        elementDetected: 'resistance',
        confidence: 0.3
      };
    }

    const phase = this.inferSpiralPhase(userTranscript, { energyLevel: 'medium' });
    const phaseLine = this.getSpiralPhaseResponse(phase);

    return {
      raw: `${mirrorLine} ${balanceLine} ${phaseLine}`.trim(),
      shaped: `${mirrorLine} ${balanceLine} ${phaseLine}`.trim(),
      mirror: mirrorLine,
      balance: balanceLine,
      phase: phaseLine,
      elementDetected,
      phaseDetected: phase,
      confidence: 0.7
    };
  }

  /**
   * Maya's Conversational Opening Script - Enhanced with AdaptiveProsodyEngine
   */
  /**
   * Handle personalized welcome for returning users based on UserMemoryService
   */
  private async handlePersonalizedWelcome(ctx: ConversationalContext): Promise<{
    shouldUsePersonalized: boolean;
    welcomeMessage?: string;
    lastElement?: string;
    lastSession?: any;
  }> {
    // Only trigger personalized welcome for greeting-like inputs
    const greetingPatterns = [
      /^(hi|hello|hey|howdy|greetings|good morning|good afternoon|good evening)[\s!.,]*$/i,
      /^(what's up|whats up|sup)[\s!.,]*$/i,
      /^(how are you|how's it going|how are things)[\s!.,?]*$/i,
      /^(i'm back|im back|here again)[\s!.,]*$/i
    ];
    
    const isGreeting = greetingPatterns.some(pattern => pattern.test(ctx.userText.trim()));
    
    if (!isGreeting) {
      return { shouldUsePersonalized: false };
    }

    try {
      // Check if user is new or returning
      const isNewUser = await UserMemoryService.isNewUser(ctx.userId);
      
      if (isNewUser) {
        logger.info(`[MEMORY] New user detected: ${ctx.userId}`);
        return { shouldUsePersonalized: false }; // Let Maya opening script handle new users
      }

      // Get last session for returning user
      const lastSession = await UserMemoryService.getLastSession(ctx.userId);
      
      if (!lastSession) {
        logger.info(`[MEMORY] Returning user but no session history: ${ctx.userId}`);
        return { shouldUsePersonalized: false };
      }

      // Check if we have adaptive greeting configuration in MayaScript
      if (MayaScript?.welcome?.adaptive_greetings?.context_aware) {
        const adaptiveGreeting = MayaScript.welcome.adaptive_greetings.context_aware;
        
        // Generate personalized welcome message
        let welcomeMessage = adaptiveGreeting.template
          .replace('{userName}', 'beautiful soul') // Generic for now, could be enhanced
          .replace('{element}', lastSession.element);
          
        // If template replacement didn't work, use fallback
        if (welcomeMessage.includes('{')) {
          welcomeMessage = adaptiveGreeting.fallback
            .replace('{userName}', 'beautiful soul');
        }

        // Add the UserMemoryService generated context
        const memoryWelcome = UserMemoryService.generateReturningUserWelcome(lastSession);
        
        // Combine both approaches for richer message
        const finalMessage = `${memoryWelcome}\n\nHow are you feeling in your energy today?`;

        logger.info(`[MEMORY] Generated personalized welcome for user ${ctx.userId}`);

        return {
          shouldUsePersonalized: true,
          welcomeMessage: finalMessage,
          lastElement: lastSession.element,
          lastSession
        };
      } else {
        // Fallback to UserMemoryService only
        const welcomeMessage = UserMemoryService.generateReturningUserWelcome(lastSession);
        
        return {
          shouldUsePersonalized: true,
          welcomeMessage,
          lastElement: lastSession.element,
          lastSession
        };
      }
      
    } catch (error) {
      logger.error(`[MEMORY] Error in personalized welcome for user ${ctx.userId}:`, error);
      return { shouldUsePersonalized: false };
    }
  }

  private async handleMayaOpeningScript(ctx: ConversationalContext): Promise<{ 
    shouldRunRitual: boolean; 
    ritualResponse?: string; 
    prosodyHint?: any;
    elementDetected?: string;
    phaseDetected?: string;
  }> {
    if (!MayaScript) {
      return { shouldRunRitual: false };
    }

    // Step 1: Maya Welcome with Personalization
    if (!ctx.onboardingStep || ctx.onboardingStep === 'maya_welcome') {
      ctx.onboardingStep = 'maya_energy';
      
      // Get user memory profile for personalized welcome
      const userProfile = await this.getUserMemoryProfile(ctx.userId);
      const personalizedWelcome = await this.generatePersonalizedWelcome({ ...userProfile, userId: ctx.userId });
      
      logger.info(`🌸 [MAYA_OPENING] Using personalized welcome for ${userProfile.isReturningUser ? 'returning' : 'first-time'} user`);
      
      return {
        shouldRunRitual: true,
        ritualResponse: personalizedWelcome + "\n\n" + MayaScript.energy_check.prompt,
        prosodyHint: MayaScript.welcome.prosody
      };
    }

    // Step 2: Energy Check with AdaptiveProsodyEngine
    if (ctx.onboardingStep === 'maya_energy') {
      try {
        const ritualResult = await this.runOpeningRitual(ctx.userText, ctx);
        
        if (ritualResult) {
          ctx.currentElement = ritualResult.elementDetected;
          ctx.onboardingStep = 'maya_spiral';
          
          logger.info(`🎭 [MAYA_RITUAL] Element detected: ${ritualResult.elementDetected} (confidence: ${ritualResult.confidence})`);
          
          const nextPrompt = MayaScript.spiral_phase?.prompt || "And where are you in your journey right now?";
          const fullResponse = ritualResult.shaped + "\n\n" + nextPrompt;
          
          return {
            shouldRunRitual: true,
            ritualResponse: fullResponse,
            prosodyHint: {
              element: ritualResult.elementDetected,
              mirror: ritualResult.mirror,
              balance: ritualResult.balance,
              confidence: ritualResult.confidence
            },
            elementDetected: ritualResult.elementDetected
          };
        }
      } catch (error) {
        logger.warn('AdaptiveProsodyEngine failed, using fallback:', error.message);
      }
      
      // Fallback to original pattern matching
      const userInput = ctx.userText.toLowerCase();
      
      // Find matching energy pattern in legacy format
      for (const branch of MayaScript.energy_check?.branches || []) {
        const match = branch.triggers?.find((trigger: string) => 
          userInput.includes(trigger.toLowerCase())
        );
        
        if (match) {
          ctx.currentElement = branch.element;
          ctx.onboardingStep = 'maya_spiral';
          
          logger.info(`🎭 [MAYA_SCRIPT] Legacy energy detected: ${branch.element} via "${match}"`);
          
          return {
            shouldRunRitual: true,
            ritualResponse: `${branch.maya_response}\n\n${MayaScript.spiral_phase?.prompt || "And where are you in your journey right now?"}`,
            prosodyHint: branch.prosody,
            elementDetected: branch.element
          };
        }
      }
      
      // Ultimate fallback
      ctx.currentElement = 'aether';
      ctx.onboardingStep = 'maya_spiral';
      
      return {
        shouldRunRitual: true,
        ritualResponse: (MayaScript.fallbacks?.unclear?.text || "I'm picking up mixed signals, which often means there's beautiful complexity happening.") + "\n\n" + (MayaScript.spiral_phase?.prompt || "And where are you in your journey right now?"),
        prosodyHint: { element: 'aether', approach: 'gentle' },
        elementDetected: 'aether'
      };
    }

    // Step 3: Spiral Phase Check
    if (ctx.onboardingStep === 'maya_spiral') {
      const userInput = ctx.userText.toLowerCase();
      
      // Determine phase using the same method as runOpeningRitual
      const detectedPhase = this.inferSpiralPhase(ctx.userText, { energyLevel: 'medium' });
      logger.info(`🌀 [MAYA_RITUAL] Phase detected: ${detectedPhase}`);
      
      ctx.onboardingStep = 'completed';
      
      const phaseLine = this.getSpiralPhaseResponse(detectedPhase);
      const closingLine = "Perfect. I feel your energy and your place in the spiral. I'll mirror where you are and bring in balance, so we can explore together. 💫";
      
      logger.info(`🎭 [MAYA_SCRIPT] Ritual completed: Element=${ctx.currentElement}, Phase=${detectedPhase}`);
      
      // Set element for the conversation
      ctx.element = (ctx.currentElement as any) || ctx.element;
      
      return {
        shouldRunRitual: true,
        ritualResponse: `${phaseLine}\n\n${closingLine}`,
        prosodyHint: { element: ctx.currentElement, phase: detectedPhase },
        elementDetected: ctx.currentElement,
        phaseDetected: detectedPhase
      };
    }

    return { shouldRunRitual: false };
  }

  /**
   * Get balancing element for logging
   */
  private getBalanceElement(element: string): string {
    const balanceMap: Record<string, string> = {
      'fire': 'water',
      'water': 'fire', 
      'earth': 'air',
      'air': 'earth',
      'aether': 'earth'
    };
    return balanceMap[element] || 'aether';
  }

  /**
   * 🌀 Extract Prosody Debug Data for Frontend
   */
  private createProsodyDebugData(
    userText: string,
    detectedElement: string,
    contextFlags?: any,
    balanceElement?: string,
    voiceParams?: any
  ): any {
    // Analyze context flags from user input
    const lower = userText.toLowerCase();
    const context = {
      overwhelmed: !!(
        lower.match(/can't handle|overwhelm|too much|stressed out|breaking down|can't cope|drowning/)
      ),
      uncertain: !!(
        lower.match(/don't know|not sure|maybe|confused|unclear|can't decide|unsure|i think|perhaps/)
      ),
      stuck: !!(
        lower.match(/stuck|blocked|can't move|trapped|same place|going nowhere|spinning wheels/)
      )
    };

    // Determine balance element and reasoning
    const actualBalanceElement = balanceElement || this.getBalanceElement(detectedElement);
    const balanceReason = this.getBalanceReason(detectedElement, actualBalanceElement, context);
    const contextReasoning = this.getContextReasoning(context);

    // Generate voice parameters (mock data for now, will be real when prosody engine is active)
    const mockVoiceParams = this.getMockVoiceParams(detectedElement, actualBalanceElement);

    return {
      userElement: detectedElement,
      mirrorElement: detectedElement, // Always mirror user element first
      balanceElement: actualBalanceElement,
      context: context,
      confidence: 0.85, // Mock confidence for now
      balanceReason: balanceReason,
      transition: this.getTransitionType(context),
      voiceParams: voiceParams || mockVoiceParams,
      contextReasoning: contextReasoning,
      mirrorDuration: this.getMirrorDuration(context),
      mirrorApproach: this.getMirrorApproach(detectedElement),
      timestamp: Date.now()
    };
  }

  /**
   * Get balance reason for prosody debugging
   */
  private getBalanceReason(userElement: string, balanceElement: string, context: any): string {
    // Context-based reasoning
    if (context.overwhelmed && balanceElement !== this.getBalanceElement(userElement)) {
      return 'softened for overwhelm';
    }
    if (context.uncertain && balanceElement === 'aether') {
      return 'uncertainty bridge';
    }
    if (context.stuck) {
      return 'strong polarity for movement';
    }

    // Standard Jungian reasoning
    const reasons: Record<string, string> = {
      'fire-earth': 'Jungian opposite (grounding)',
      'fire-water': 'Jungian opposite (cooling)',
      'air-water': 'Jungian opposite (feeling)',
      'water-air': 'Jungian opposite (clarity)', 
      'earth-fire': 'Jungian opposite (activation)',
      'aether-earth': 'transcendence grounding'
    };
    return reasons[`${userElement}-${balanceElement}`] || 'contextual balance';
  }

  /**
   * Get context reasoning for debug display
   */
  private getContextReasoning(context: any): string {
    if (context.overwhelmed) return 'Overwhelmed → softening with adjacent element';
    if (context.uncertain) return 'Uncertain → bridging through Aether';
    if (context.stuck) return 'Stuck → enforcing strong polarity';
    return 'Balanced → pure Jungian opposite';
  }

  /**
   * Get transition type based on context
   */
  private getTransitionType(context: any): string {
    if (context.overwhelmed || context.uncertain) return 'gentle';
    if (context.stuck) return 'decisive';
    return 'moderate';
  }

  /**
   * Get mirror duration based on context
   */
  private getMirrorDuration(context: any): string {
    if (context.overwhelmed) return 'extended';
    if (context.uncertain) return 'moderate';
    if (context.stuck) return 'brief';
    return 'moderate';
  }

  /**
   * Get mirror approach for element
   */
  private getMirrorApproach(element: string): string {
    const approaches: Record<string, string> = {
      fire: 'match_intensity',
      water: 'flow_with_emotion',
      earth: 'steady_presence', 
      air: 'mental_resonance',
      aether: 'spacious_acknowledgment'
    };
    return approaches[element] || 'empathetic_resonance';
  }

  /**
   * Generate mock voice parameters for debugging (will be replaced with real prosody engine data)
   */
  private getMockVoiceParams(userElement: string, balanceElement: string): any {
    const elementParams: Record<string, any> = {
      fire: { speed: 1.2, pitch: 5, emphasis: 0.8, warmth: 0.7 },
      water: { speed: 0.9, pitch: -3, emphasis: 0.3, warmth: 0.8 },
      earth: { speed: 0.85, pitch: -5, emphasis: 0.4, warmth: 0.6 },
      air: { speed: 1.1, pitch: 3, emphasis: 0.6, warmth: 0.5 },
      aether: { speed: 0.95, pitch: 0, emphasis: 0.3, warmth: 0.9 }
    };

    // Blend mirror and balance parameters
    const mirrorParams = elementParams[userElement] || elementParams.aether;
    const balanceParams = elementParams[balanceElement] || elementParams.earth;

    return {
      speed: (mirrorParams.speed + balanceParams.speed) / 2,
      pitch: (mirrorParams.pitch + balanceParams.pitch) / 2,
      emphasis: (mirrorParams.emphasis + balanceParams.emphasis) / 2,
      warmth: Math.max(mirrorParams.warmth, balanceParams.warmth) // Use higher warmth
    };
  }

  /**
   * 🌟 Get User Memory Profile for Personalized Welcomes
   */
  private async getUserMemoryProfile(userId: string): Promise<{
    isReturningUser: boolean;
    userName?: string;
    lastElement?: string;
    lastPhase?: string;
    sessionCount: number;
    recentThemes: string[];
    lastVisited?: string;
  }> {
    try {
      logger.info(`🧠 [PERSONALIZATION] Retrieving memory profile for user: ${userId}`);
      
      // Get user sessions and journal entries from MemoryOrchestrator
      const userSessions = await this.memoryOrchestrator.getSessionsByUser(userId, 5); // Last 5 sessions
      const recentJournals = await this.memoryOrchestrator.getJournalEntries(userId, 3); // Last 3 journals
      
      const isReturningUser = userSessions.length > 0 || recentJournals.length > 0;
      
      if (!isReturningUser) {
        logger.info(`🌱 [PERSONALIZATION] First-time user detected: ${userId}`);
        return {
          isReturningUser: false,
          sessionCount: 0,
          recentThemes: []
        };
      }
      
      // Extract user patterns from memory
      const recentThemes = await this.extractRecentThemes(userSessions, recentJournals);
      const lastSession = userSessions[0]; // Most recent session
      
      const profile = {
        isReturningUser: true,
        userName: lastSession?.user_name || undefined,
        lastElement: lastSession?.current_element || undefined,
        lastPhase: lastSession?.spiral_phase || undefined,
        sessionCount: userSessions.length,
        recentThemes,
        lastVisited: lastSession?.created_at || undefined
      };
      
      logger.info(`✨ [PERSONALIZATION] Returning user profile:`, profile);
      return profile;
      
    } catch (error) {
      logger.warn(`⚠️ [PERSONALIZATION] Memory retrieval failed for ${userId}:`, error.message);
      // Graceful fallback - treat as first-time user
      return {
        isReturningUser: false,
        sessionCount: 0,
        recentThemes: []
      };
    }
  }

  /**
   * 🔍 Extract Recent Themes from User Sessions and Journals
   */
  private async extractRecentThemes(sessions: any[], journals: any[]): Promise<string[]> {
    const themes: string[] = [];
    
    try {
      // Analyze recent sessions for patterns
      sessions.forEach(session => {
        if (session.current_element) themes.push(session.current_element);
        if (session.spiral_phase) themes.push(session.spiral_phase);
        if (session.therapeutic_needs) {
          const needs = Array.isArray(session.therapeutic_needs) 
            ? session.therapeutic_needs 
            : JSON.parse(session.therapeutic_needs || '[]');
          themes.push(...needs);
        }
      });
      
      // Analyze journal entries for emotional themes
      journals.forEach(journal => {
        const content = journal.content?.toLowerCase() || '';
        
        // Simple thematic analysis
        if (content.match(/stuck|blocked|can't move/)) themes.push('stuck');
        if (content.match(/overwhelm|too much|can't handle/)) themes.push('overwhelmed');
        if (content.match(/uncertain|don't know|confused/)) themes.push('uncertain');
        if (content.match(/growth|learning|transform/)) themes.push('growth');
        if (content.match(/fire|energy|passionate/)) themes.push('fire');
        if (content.match(/water|emotion|feel/)) themes.push('water');
        if (content.match(/earth|grounded|practical/)) themes.push('earth');
        if (content.match(/air|think|mental/)) themes.push('air');
        if (content.match(/spiritual|transcend|divine/)) themes.push('aether');
      });
      
      // Return unique themes, most recent first
      const uniqueThemes = Array.from(new Set(themes)).slice(0, 3);
      logger.info(`🎯 [PERSONALIZATION] Extracted themes:`, uniqueThemes);
      return uniqueThemes;
      
    } catch (error) {
      logger.warn('⚠️ [PERSONALIZATION] Theme extraction failed:', error.message);
      return [];
    }
  }

  /**
   * 💫 Generate Personalized Welcome Message
   */
  private async generatePersonalizedWelcome(profile: {
    isReturningUser: boolean;
    userName?: string;
    lastElement?: string;
    lastPhase?: string;
    recentThemes: string[];
    sessionCount: number;
    userId?: string;
  }): Promise<string> {
    // Use DynamicGreetingService for personalized greetings
    if (profile.userId) {
      try {
        const dynamicGreeting = await DynamicGreetingService.generateGreeting(profile.userId);
        logger.info(`[GREETING] Generated dynamic greeting for user ${profile.userId}`);
        return dynamicGreeting;
      } catch (error) {
        logger.warn('[GREETING] Failed to generate dynamic greeting, falling back to default');
      }
    }
    
    // Fallback: Use adaptive greetings from MayaScript if available
    if (MayaScript?.welcome?.adaptive_greetings) {
      const userName = profile.userName || 'friend';
      
      if (!profile.isReturningUser || profile.sessionCount === 0) {
        // First-time user - light and approachable  
        logger.info('🌱 [ADAPTIVE_GREETING] First session - light approach');
        const greeting = MayaScript.welcome.adaptive_greetings.first_session;
        return greeting.template.replace('{userName}', userName) + 
               (greeting.followup ? "\n\n" + greeting.followup : "");
      } else if (profile.sessionCount < 3 || !profile.lastElement || profile.lastElement === 'aether') {
        // Returning user but no strong element context
        logger.info('🌊 [ADAPTIVE_GREETING] Returning user - emotional check-in');
        const greeting = MayaScript.welcome.adaptive_greetings.returning_user;
        return greeting.template.replace('{userName}', userName) + 
               (greeting.followup ? "\n\n" + greeting.followup : "");
      } else {
        // Context-aware with element history
        logger.info('🔥 [ADAPTIVE_GREETING] Context-aware - elemental memory');
        const greeting = MayaScript.welcome.adaptive_greetings.context_aware;
        const elementEmoji = this.getElementEmoji(profile.lastElement);
        return elementEmoji + greeting.template
          .replace('{userName}', userName)
          .replace('{element}', profile.lastElement);
      }
    }

    // Fallback to original logic
    if (!profile.isReturningUser) {
      logger.info('👋 [PERSONALIZATION] Generating first-time user welcome');
      return "👋 Hi, I'm Maya, so glad you're here.";
    }
    
    // Returning user welcome with context
    const nameGreeting = profile.userName ? `${profile.userName}` : 'friend';
    let contextualPhrase = '';
    
    // Build contextual phrase based on recent themes and history
    if (profile.lastElement && ['fire', 'water', 'earth', 'air', 'aether'].includes(profile.lastElement)) {
      const elementPhrases = {
        fire: 'exploring that fiery energy',
        water: 'diving deep into your emotional flow', 
        earth: 'working on grounding and practical steps',
        air: 'expanding your mental clarity and perspective',
        aether: 'connecting with your spiritual essence'
      };
      contextualPhrase = elementPhrases[profile.lastElement as keyof typeof elementPhrases] || `exploring ${profile.lastElement}`;
    } else if (profile.lastPhase && ['initiation', 'challenge', 'integration', 'mastery', 'transcendence'].includes(profile.lastPhase)) {
      const phasePhrases = {
        initiation: 'starting your new journey',
        challenge: 'working through those challenges',
        integration: 'integrating new insights',
        mastery: 'mastering your path',
        transcendence: 'reaching new heights'
      };
      contextualPhrase = phasePhrases[profile.lastPhase as keyof typeof phasePhrases] || `in your ${profile.lastPhase} phase`;
    } else if (profile.recentThemes.length > 0) {
      // Use most recent theme
      const theme = profile.recentThemes[0];
      const themePhrases = {
        stuck: 'working through feeling stuck',
        overwhelmed: 'finding balance in the overwhelm',
        uncertain: 'navigating uncertainty',
        growth: 'on your growth journey'
      };
      contextualPhrase = themePhrases[theme as keyof typeof themePhrases] || `exploring ${theme}`;
    } else {
      contextualPhrase = 'on your journey';
    }
    
    const welcomeMessage = `✨ Welcome back, ${nameGreeting}, I remember last time you were ${contextualPhrase} — shall we pick up there?`;
    
    logger.info(`💫 [PERSONALIZATION] Generated personalized welcome:`, welcomeMessage);
    return welcomeMessage;
  }

  /**
   * 🔥 Simple Element Detection (will be replaced with full AdaptiveProsodyEngine)
   */
  private detectUserElement(userText: string): string {
    const lower = userText.toLowerCase();
    
    // Fire patterns - intensity, urgency, passion
    if (lower.match(/urgent|excited|passionate|can't wait|energy|fire|intense|now|immediately|frustrated|angry/)) {
      return 'fire';
    }
    
    // Water patterns - emotion, flow, feeling
    if (lower.match(/feel|feeling|emotion|sad|tears|heart|flow|gentle|soft|water|emotional/)) {
      return 'water';
    }
    
    // Earth patterns - practical, grounded, stable  
    if (lower.match(/practical|plan|structure|stable|solid|routine|grounded|earth|physical|concrete/)) {
      return 'earth';
    }
    
    // Air patterns - thinking, mental, clarity
    if (lower.match(/think|wonder|curious|analyze|understand|perspective|idea|concept|clarity|mind/)) {
      return 'air';
    }
    
    // Aether patterns - spiritual, transcendent
    if (lower.match(/spiritual|divine|cosmic|soul|sacred|transcend|aether|consciousness|universe/)) {
      return 'aether';
    }
    
    // Default based on sentence structure and energy
    if (lower.match(/[!]{2,}/)) return 'fire'; // Multiple exclamation marks
    if (lower.match(/[.]{3,}/)) return 'water'; // Ellipses = contemplative
    if (lower.includes('?')) return 'air'; // Questions = mental
    
    // Fallback to current ctx.element or aether
    return 'aether';
  }

  /**
   * Enhanced Opening Ritual handler with multi-modal intelligence
   */
  private async handleEnhancedOpeningRitual(ctx: ConversationalContext): Promise<{ shouldRunRitual: boolean; ritualResponse?: string; prosodyHint?: any }> {
    // Check if user is in ritual flow
    if (!ctx.onboardingStep || ctx.onboardingStep === 'welcome') {
      // First interaction - show enhanced welcome
      const welcomeMessage = OpeningRitual.welcome.join('\n');
      const firstQuestion = OpeningRitual.questions[0]; // energy_check question
      
      ctx.onboardingStep = 'energy_check';
      ctx.pendingQuestionId = firstQuestion.id;
      
      logger.info('🌟 Enhanced Opening Ritual started for user:', ctx.userId);
      
      return {
        shouldRunRitual: true,
        ritualResponse: `${welcomeMessage}\n\n${firstQuestion.text}`,
        prosodyHint: { element: 'aether', archetype: 'guide', intensity: 'gentle' }
      };
    }
    
    // Handle ritual responses with multi-modal analysis
    if (ctx.pendingQuestionId && ctx.onboardingStep !== 'completed') {
      const matchResult = await this.getEnhancedAdaptiveResponse(ctx.pendingQuestionId, ctx.userText, ctx);
      
      if (matchResult) {
        // Store response in ritual data
        ctx.ritualResponses = ctx.ritualResponses || {};
        ctx.ritualResponses[ctx.pendingQuestionId] = matchResult;
        
        // Update context with detected patterns
        ctx.currentElement = matchResult.element;
        ctx.currentArchetype = matchResult.archetype;
        ctx.therapeuticNeeds = matchResult.therapeuticNeeds || [];
        ctx.element = matchResult.element as any; // Update main element
        
        // Move to next question
        const currentQuestionIndex = OpeningRitual.questions.findIndex((q: any) => q.id === ctx.pendingQuestionId);
        const nextQuestion = OpeningRitual.questions[currentQuestionIndex + 1];
        
        if (nextQuestion) {
          ctx.pendingQuestionId = nextQuestion.id;
          ctx.onboardingStep = nextQuestion.id as any;
          
          return {
            shouldRunRitual: true,
            ritualResponse: `${matchResult.response}\n\n${nextQuestion.text}`,
            prosodyHint: matchResult.prosodyHint
          };
        } else {
          // Complete the ritual
          ctx.onboardingStep = 'completed';
          ctx.pendingQuestionId = undefined;
          
          const completionText = OpeningRitual.completion.text
            .replace('{energy}', ctx.ritualResponses.energy_check?.element || 'beautiful')
            .replace('{intention}', ctx.ritualResponses.focus_intention?.element || 'growth')
            .replace('{spiral_phase}', ctx.ritualResponses.spiral_phase?.element || 'unfolding');
          
          logger.info('✨ Enhanced Opening Ritual completed:', {
            userId: ctx.userId,
            element: ctx.currentElement,
            archetype: ctx.currentArchetype,
            therapeuticNeeds: ctx.therapeuticNeeds
          });
          
          return {
            shouldRunRitual: true,
            ritualResponse: completionText,
            prosodyHint: OpeningRitual.completion.prosodyHint
          };
        }
      }
    }
    
    return { shouldRunRitual: false };
  }
  
  /**
   * Match user input against enhanced Opening Ritual options with multi-modal analysis
   */
  private async getEnhancedAdaptiveResponse(questionId: string, userInput: string, ctx: ConversationalContext): Promise<any> {
    const question = OpeningRitual.questions.find((q: any) => q.id === questionId);
    if (!question) return null;
    
    // Analyze user input with multi-modal intelligence if available
    // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
    // let emotionalState: EmotionalState | undefined;
    // let toneAnalysis: ToneAnalysis | undefined;
    
    try {
      if (ctx.audioBuffer) {
        // Full multi-modal analysis
        // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
        // const voiceMetrics = await this.multiModalEI.analyzeVoiceMetrics(ctx.audioBuffer);
        // emotionalState = await this.multiModalEI.mapEmotionalState(userInput, voiceMetrics, ctx.sessionMemory);
        // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
        // toneAnalysis = await this.adaptiveProsody.analyzeUserTone(userInput, ctx.audioBuffer, ctx.sessionMemory);
        
        // ctx.voiceMetrics = voiceMetrics;
        // ctx.emotionalState = emotionalState;
        // ctx.toneAnalysis = toneAnalysis;
        
        // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
        // logger.info(`🎯 Multi-modal ritual analysis: ${emotionalState.primaryEmotion} (${emotionalState.emotionalIntensity.toFixed(2)})`);
      } else {
        // Text-only analysis with adaptive prosody
        // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
        // toneAnalysis = await this.adaptiveProsody.analyzeUserTone(userInput, undefined, ctx.sessionMemory);
        // ctx.toneAnalysis = toneAnalysis;
        
        // TEMPORARILY DISABLED - FIX COMPILATION ERRORS FIRST
        // logger.info(`📝 Text-only ritual analysis: ${toneAnalysis.dominantElement} (confidence: ${toneAnalysis.confidenceScore})`);
      }
    } catch (error) {
      logger.warn('⚠️ Multi-modal ritual analysis failed, using basic matching:', error.message);
    }
    
    // Enhanced matching with emotional intelligence
    for (const [key, option] of Object.entries<any>(question.options)) {
      const textMatch = option.userExamples.find((ex: string) =>
        userInput.toLowerCase().includes(ex.toLowerCase())
      );
      
      if (textMatch) {
        logger.info(`[EnhancedRitual] Text match: ${questionId}=${key} ("${textMatch}")`);
        
        // Enhance response with emotional context
        let enhancedResponse = option.mayaResponse;
        let enhancedProsodyHint = { ...option.prosodyHint };
        
        // Adjust response based on emotional state
        if (emotionalState) {
          if (emotionalState.stressLevel > 0.7) {
            enhancedResponse += " I can feel the intensity you're carrying right now.";
            enhancedProsodyHint.therapeuticNeeds = [...(enhancedProsodyHint.therapeuticNeeds || []), 'comfort'];
          } else if (emotionalState.emotionalIntensity > 0.8) {
            enhancedResponse += " Your energy is beautifully vibrant!";
            enhancedProsodyHint.intensity = 'high';
          }
        }
        
        return {
          element: key,
          response: enhancedResponse,
          prosodyHint: enhancedProsodyHint,
          archetype: option.prosodyHint?.archetype || 'guide',
          therapeuticNeeds: option.prosodyHint?.therapeuticNeeds || [],
          confidence: emotionalState ? 0.9 : 0.7,
          multiModalEnhanced: !!emotionalState
        };
      }
    }
    
    // No match found - use aether (transcendent) as default
    return {
      element: "aether",
      response: "✨ I sense something unique in your energy that doesn't fit the usual patterns. This is actually quite beautiful - let's explore this together.",
      prosodyHint: { element: "aether", archetype: "oracle", intensity: "gentle" },
      archetype: "oracle",
      therapeuticNeeds: ["clarity", "exploration"],
      confidence: 0.4,
      multiModalEnhanced: false
    };
  }

  /**
   * Legacy adaptive Maya onboarding ritual flow (for backward compatibility)
   */
  private handleOpeningRitual(ctx: ConversationalContext): { shouldRunRitual: boolean; ritualResponse?: string } {
    // Check if this looks like an opening ritual interaction
    if (!ctx.onboardingStep || ctx.onboardingStep === 'welcome') {
      // First interaction - show welcome and first question
      const welcomeMessage = ADAPTIVE_ONBOARDING.welcome.join(' ');
      const firstQuestion = ADAPTIVE_ONBOARDING.questions[0]; // energy_state question
      
      ctx.onboardingStep = 'energy_state'; // Set next step
      
      return {
        shouldRunRitual: true,
        ritualResponse: `${welcomeMessage}\n\n${firstQuestion.text}\n${firstQuestion.followUp || ''}`
      };
    }
    
    if (ctx.onboardingStep === 'energy_state') {
      // Process energy state response using new adaptive system
      const energyQuestion = ADAPTIVE_ONBOARDING.questions.find(q => q.id === 'energy_state');
      if (energyQuestion) {
        const detectedIntent = detectResponseIntent(ctx.userText, energyQuestion);
        const adaptiveResponse = getAdaptiveResponse('energy_state', detectedIntent);
        
        if (adaptiveResponse) {
          // Store detected element and archetype, move to focus question
          ctx.onboardingData = ctx.onboardingData || {};
          ctx.onboardingData.energyState = detectedIntent;
          ctx.onboardingData.detectedElement = adaptiveResponse.element as any;
          ctx.onboardingData.detectedArchetype = adaptiveResponse.archetype as any;
          
          // Move to focus area question
          ctx.onboardingStep = 'focus_area';
          const focusQuestion = ADAPTIVE_ONBOARDING.questions.find(q => q.id === 'focus_area');
          
          if (focusQuestion) {
            return {
              shouldRunRitual: true,
              ritualResponse: `${adaptiveResponse.response}\n\n${focusQuestion.text}\n${focusQuestion.followUp || ''}`
            };
          }
        }
      }
    }
    
    if (ctx.onboardingStep === 'focus_area') {
      // Process focus area response and complete ritual
      const focusQuestion = ADAPTIVE_ONBOARDING.questions.find(q => q.id === 'focus_area');
      if (focusQuestion) {
        const detectedIntent = detectResponseIntent(ctx.userText, focusQuestion);
        const adaptiveResponse = getAdaptiveResponse('focus_area', detectedIntent);
        
        if (adaptiveResponse) {
          ctx.onboardingData = ctx.onboardingData || {};
          ctx.onboardingData.focusArea = detectedIntent;
          
          // Update element/archetype based on focus area if needed
          if (adaptiveResponse.element) {
            ctx.onboardingData.detectedElement = adaptiveResponse.element as any;
          }
          if (adaptiveResponse.archetype) {
            ctx.onboardingData.detectedArchetype = adaptiveResponse.archetype as any;
          }
          
          // Apply detected element to conversation context
          ctx.element = ctx.onboardingData.detectedElement || ctx.element;
          
          // Complete onboarding
          ctx.onboardingStep = 'completed';
          
          logger.info('📋 Adaptive onboarding completed:', {
            userId: ctx.userId,
            energyState: ctx.onboardingData.energyState,
            focusArea: ctx.onboardingData.focusArea,
            finalElement: ctx.onboardingData.detectedElement,
            finalArchetype: ctx.onboardingData.detectedArchetype
          });
          
          return {
            shouldRunRitual: true,
            ritualResponse: `${adaptiveResponse.response}\n\n${ADAPTIVE_ONBOARDING.completion.text}\n\n${ADAPTIVE_ONBOARDING.completion.ready}`
          };
        }
      }
    }
    
    return { shouldRunRitual: false };
  }

  /**
   * Main conversational pipeline entry point
   */
  async converseViaSesame(ctx: ConversationalContext): Promise<ConversationalResult> {
    const startTime = Date.now();
    let reshapeCount = 0;

    console.log('🔄 [DEBUG] ConversationalPipeline.converseViaSesame called:', {
      userText: ctx.userText.substring(0, 50) + '...',
      voiceEnabled: ctx.voiceEnabled,
      userId: ctx.userId,
      sessionId: ctx.sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      // Step -1: Check for personalized welcome based on user memory
      const personalizedWelcomeCheck = await this.handlePersonalizedWelcome(ctx);
      if (personalizedWelcomeCheck.shouldUsePersonalized && personalizedWelcomeCheck.welcomeMessage) {
        logger.info('💫 Personalized welcome triggered for returning user:', ctx.userId);
        
        return {
          text: personalizedWelcomeCheck.welcomeMessage,
          audioUrl: null,
          element: personalizedWelcomeCheck.lastElement || ctx.element,
          processingTime: Date.now() - startTime,
          source: 'personalized_welcome',
          metadata: {
            draftModel: 'user_memory',
            reshapeCount: 0,
            voiceSynthesized: false,
            isReturningUser: true,
            lastSession: personalizedWelcomeCheck.lastSession,
            cost: {
              draftTokens: 0,
              ttsSeconds: 0
            }
          }
        };
      }

      // Step 0: Maya's Conversational Opening Script (for new users or non-personalized flows)
      const mayaScriptCheck = await this.handleMayaOpeningScript(ctx);
      if (mayaScriptCheck.shouldRunRitual && mayaScriptCheck.ritualResponse) {
        logger.info('🎭 Maya Opening Script triggered for user:', ctx.userId);
        
        return {
          text: mayaScriptCheck.ritualResponse,
          audioUrl: null,
          element: mayaScriptCheck.elementDetected || ctx.element,
          processingTime: Date.now() - startTime,
          source: 'maya_opening_script',
          metadata: {
            draftModel: 'maya_script',
            reshapeCount: 0,
            voiceSynthesized: false,
            elementDetected: mayaScriptCheck.elementDetected,
            phaseDetected: mayaScriptCheck.phaseDetected,
            prosodyHint: mayaScriptCheck.prosodyHint,
            cost: { draftTokens: 0 }
          }
        };
      }
      
      // Fallback: Adaptive Maya onboarding ritual (legacy)
      const ritualCheck = this.handleOpeningRitual(ctx);
      if (ritualCheck.shouldRunRitual && ritualCheck.ritualResponse) {
        logger.info('🌟 Legacy Opening Ritual triggered for user:', ctx.userId);
        
        // Generate voice with ritual prosody if enabled
        let audioUrl = null;
        let voiceSynthesized = false;
        
        if (ctx.voiceEnabled && enhancedRitualCheck.prosodyHint) {
          try {
            // Use Sesame CI shaping for ritual response
            const shapingRequest = {
              text: enhancedRitualCheck.ritualResponse,
              style: enhancedRitualCheck.prosodyHint.element || 'aether',
              archetype: enhancedRitualCheck.prosodyHint.archetype || 'guide',
              voiceParams: ctx.toneAnalysis?.voiceMetrics ? {
                speed: 1.0,
                pitch: 0,
                emphasis: enhancedRitualCheck.prosodyHint.intensity === 'gentle' ? 0.3 : 0.5,
                warmth: 0.8,
                confidence: 0.9
              } : undefined,
              emotionalContext: ctx.emotionalState ? {
                primaryEmotion: ctx.emotionalState.primaryEmotion,
                emotionalIntensity: ctx.emotionalState.emotionalIntensity,
                therapeuticNeeds: ctx.therapeuticNeeds || []
              } : undefined
            };
            
            const shapedResult = await this.callSesameCIShaping(shapingRequest);
            if (shapedResult?.text) {
              audioUrl = await sesameTTS.generateTTS(shapedResult.text, 'maya');
              voiceSynthesized = true;
              logger.info('🎵 Ritual voice synthesized with enhanced prosody');
            }
          } catch (voiceError) {
            logger.warn('⚠️ Ritual voice synthesis failed:', voiceError.message);
          }
        }
        
        return {
          text: ritualCheck.ritualResponse,
          audioUrl: null, // Voice disabled for now
          element: ctx.element,
          processingTime: Date.now() - startTime,
          source: 'opening_ritual',
          metadata: {
            draftModel: 'ritual',
            reshapeCount: 0,
            voiceSynthesized: false,
            cost: { draftTokens: 0 }
          }
        };
      }
      
      // Step 0: Build comprehensive memory context - MUST ALWAYS HAPPEN
      let memoryContext;
      try {
        memoryContext = await this.memoryOrchestrator.buildContext(
          ctx.userId,
          ctx.userText,
          ctx.sessionId,
          ctx.conversationHistory
        );
        
        // Debug memory loading if enabled
        if (process.env.MAYA_DEBUG_MEMORY === 'true') {
          console.log('[Memory Debug] Context loaded:', {
            sessionEntries: memoryContext.session?.length || 0,
            journalEntries: memoryContext.journal?.length || 0,
            profileLoaded: !!memoryContext.profile,
            symbolicPatterns: memoryContext.symbolic?.length || 0,
            externalContent: memoryContext.external?.length || 0,
            totalContextSize: JSON.stringify(memoryContext).length,
            processingTime: Date.now() - startTime
          });
        }
        
      } catch (memoryError) {
        console.warn('[ConversationalPipeline] Memory orchestration failed, using fallback context:', memoryError.message);
        logger.error('Memory orchestration failed:', memoryError);
        
        // Provide minimal fallback context - never skip memory injection completely
        memoryContext = {
          session: [],
          journal: [],
          profile: {},
          symbolic: [],
          external: []
        };
      }

      // Step 0.5: Fetch relevant files from user's library for citations
      let fileContexts: any[] = [];
      let citations: any[] = [];
      try {
        // fileContexts = await this.fileMemory.retrieveRelevantFiles(
        //   ctx.userId, 
        //   ctx.userText, 
        //   { limit: 3, minRelevance: 0.75 }
        // ); // Temporarily disabled
        
        if (fileContexts.length > 0) {
          // citations = this.fileMemory.formatCitationMetadata(fileContexts); // Temporarily disabled
          logger.info('File contexts integrated for citations', {
            userId: ctx.userId,
            filesReferenced: fileContexts.length,
            citationsGenerated: citations.length
          });
        }
      } catch (fileError) {
        logger.warn('File memory integration failed:', fileError);
        fileContexts = [];
        citations = [];
      }

      // Step 1: Draft with upstream model using full memory context + file context
      console.log('[Pipeline] Generating AI response...');
      let draft = await this.draftTextWithMemory(ctx, memoryContext, fileContexts);
      let draftModel = this.getDraftModelName(ctx.element);
      console.log('[Pipeline] Draft response generated:', draft.substring(0, 100) + '...');
      
      // Pass semantic debug info to response if available
      const semanticDebugInfo = (memoryContext as any).semanticDebugInfo;

      // Step 2: Anti-canned guard - reshape if needed
      const recentReplies = ctx.recentBotReplies || ctx.conversationHistory
        .filter(turn => turn.role === 'assistant')
        .slice(-3)
        .map(turn => turn.content);
      
      if (this.rejectBoilerplate(draft) || this.tooSimilar(draft, recentReplies)) {
        logger.info(`Reshaping response for Maya tone for user ${ctx.userId}`);
        draft = await this.redraftWithFreshness(ctx, draft, memoryContext);
        reshapeCount = 1;
        
        // If still generic, use Maya fallback
        if (this.rejectBoilerplate(draft)) {
          draft = getMayaBetaFallback();
        }
      }

      // Step 3: Format for Maya with prosody hints
      const hinted = this.formatForMaya(draft, {
        pace: ctx.sentiment === "low" ? "calm" : "neutral"
      });
      console.log('[Pipeline] Formatted for Maya with prosody hints');

      // Step 4: 🌀 Jungian Adaptive Prosody + Sesame CI Shaping
      console.log('🌀 [DEBUG] Starting Jungian Adaptive Prosody + Sesame CI:', {
        sesameCiEnabled: process.env.SESAME_CI_ENABLED,
        inputText: hinted.substring(0, 80) + '...',
        element: ctx.element,
        sentiment: ctx.sentiment,
        hasAudioBuffer: !!ctx.audioBuffer,
        hasVoiceMetrics: !!ctx.voiceMetrics
      });
      
      // 🧠 Generate Prosody Debug Data for Frontend
      const detectedElement = this.detectUserElement(ctx.userText);
      const prosodyDebugData = this.createProsodyDebugData(
        ctx.userText,
        detectedElement,
        undefined, // contextFlags - will be populated in createProsodyDebugData
        undefined, // balanceElement - will be calculated
        undefined  // voiceParams - will be mocked for now
      );
      
      console.log('🎯 [DEBUG] Prosody debug data generated:', {
        userElement: prosodyDebugData.userElement,
        balanceElement: prosodyDebugData.balanceElement,
        context: Object.keys(prosodyDebugData.context).filter(k => prosodyDebugData.context[k]).join(', ') || 'none',
        reasoning: prosodyDebugData.contextReasoning
      });
      
      let shapingResult;
      try {
        // Note: Prosody shaping temporarily disabled due to compilation issues
        if (false) {
          // Disabled prosody code - would integrate real AdaptiveProsodyEngine here
        } else {
          console.log('⚠️ [DEBUG] SESAME_CI_ENABLED=false, using legacy shaping');
          shapingResult = await this.sesameCITransform(hinted, {
            element: ctx.element,
            sentiment: ctx.sentiment,
            goals: this.getConversationalGoals(ctx),
            userId: ctx.userId,
            archetype: 'guide',
            // 🌀 Pass prosody data to CI for future integration
            prosodyHint: {
              detectedElement: prosodyDebugData.userElement,
              balanceElement: prosodyDebugData.balanceElement,
              voiceParams: prosodyDebugData.voiceParams
            }
          });
        }
      } catch (prosodyError) {
        console.warn('🌀 [DEBUG] Jungian prosody shaping failed, using fallback:', prosodyError.message);
        // Fallback to legacy shaping
        shapingResult = await this.sesameCITransform(hinted, {
          element: ctx.element,
          sentiment: ctx.sentiment,
          goals: this.getConversationalGoals(ctx),
          userId: ctx.userId,
          archetype: 'guide'
        });
      }

      const finalForVoice = shapingResult.text;
      console.log('🎯 [DEBUG] Sesame CI shaping completed:', {
        originalLength: hinted.length,
        shapedLength: finalForVoice.length,
        preview: finalForVoice.substring(0, 100) + '...',
        source: shapingResult.source || 'unknown'
      });

      // Step 5: Maya TTS (only if voice enabled and meets criteria)
      let audioUrl: string | null = null;
      let ttsSeconds = 0;

      if (ctx.voiceEnabled && this.shouldSynthesize(finalForVoice)) {
        const ttsStart = Date.now();
        
        console.log('🎵 [DEBUG] Starting TTS synthesis:', {
          voiceEnabled: ctx.voiceEnabled,
          textLength: finalForVoice.length,
          shouldSynthesize: this.shouldSynthesize(finalForVoice),
          userId: ctx.userId
        });
        
        // Enhanced logging for TTS debugging
        logger.info('[TTS] Attempting to generate speech', {
          voiceEnabled: ctx.voiceEnabled,
          textLength: finalForVoice.length,
          userId: ctx.userId
        });
        
        try {
          console.log('🎤 [DEBUG] Calling ttsOrchestrator.generateSpeech...');
          const ttsResult = await ttsOrchestrator.generateSpeech(finalForVoice, "maya", {
            userId: ctx.userId,
            sessionId: ctx.sessionId
          });
          
          audioUrl = ttsResult.audioUrl || null;
          ttsSeconds = (Date.now() - ttsStart) / 1000;
          
          console.log('[Pipeline] TTS completed:', { audioUrl: audioUrl ? 'Generated' : 'Failed', ttsSeconds });
          
          logger.info('[TTS] Speech generation result', {
            service: ttsResult.service,
            hasAudioUrl: !!audioUrl,
            cached: ttsResult.cached,
            processingTime: ttsResult.processingTime,
            error: ttsResult.error
          });
          
          if (!audioUrl) {
            logger.warn('[TTS] No audio URL returned from TTS service', {
              service: ttsResult.service,
              error: ttsResult.error
            });
          }
        } catch (ttsError) {
          logger.error('[TTS] Speech generation failed', {
            error: ttsError.message,
            stack: ttsError.stack
          });
          // Continue without audio rather than failing the entire response
          audioUrl = null;
        }
      } else {
        logger.debug('[TTS] Skipped speech generation', {
          voiceEnabled: ctx.voiceEnabled,
          shouldSynthesize: this.shouldSynthesize(finalForVoice)
        });
      }

      const processingTime = Date.now() - startTime;

      // Persist conversation turn to user's memory
      await this.memoryOrchestrator.persistConversationTurn(
        ctx.userId,
        ctx.userText,
        finalForVoice,
        ctx.sessionId,
        {
          element: ctx.element,
          sentiment: ctx.sentiment,
          processingTime,
          voiceSynthesized: audioUrl !== null
        }
      ).catch(error => {
        logger.warn('Memory persistence failed (non-critical):', error);
      });

      // Automatically create embedding for conversation snippet
      try {
        const conversationSnippet = `User: ${ctx.userText} | Maya: ${finalForVoice}`;
        await embeddingQueue.storeEmbeddedMemory(
          ctx.userId,
          conversationSnippet,
          "conversation",
          {
            sessionId: ctx.sessionId,
            element: ctx.element,
            sentiment: ctx.sentiment,
            processingTime,
            voiceSynthesized: audioUrl !== null,
          }
        );
        logger.info("[EMBED] Conversation snippet indexed", {
          userId: ctx.userId,
          sessionId: ctx.sessionId,
        });
      } catch (embedError) {
        // Don't block response if embedding fails
        logger.warn("[EMBED] Failed to index conversation snippet, will retry", {
          userId: ctx.userId,
          sessionId: ctx.sessionId,
          error: embedError instanceof Error ? embedError.message : "Unknown error",
        });
      }

      // Save session summary to UserMemoryService for personalized future welcomes
      this.saveSessionSummary(ctx, prosodyDebugData).catch(error => {
        logger.warn('[MEMORY] Session summary save failed (non-critical):', error);
      });

      // Handle journal entry if this is marked as a journal
      if (ctx.journal) {
        const detectedElement = this.detectUserElement(ctx.userText);
        const detectedPhase = this.inferSpiralPhase(ctx.userText, undefined);
        
        console.log(
          `[PIPELINE] Journal entry detected. Tags=${ctx.tags?.join(", ") || 'none'} Element=${detectedElement} Phase=${detectedPhase}`
        );
        
        // Save to journal through memoryOrchestrator
        this.memoryOrchestrator.saveJournalEntry(
          ctx.userId,
          ctx.userText,
          ctx.tags || [],
          detectedElement,
          detectedPhase || ctx.phase
        ).catch(error => {
          logger.warn('[JOURNAL] Failed to save journal entry (non-critical):', error);
        });
      }

      return {
        text: finalForVoice,
        audioUrl,
        element: ctx.element,
        processingTime,
        source: shapingResult.shapingApplied ? 'sesame_shaped' : 'maya_raw',
        citations,
        metadata: {
          draftModel,
          reshapeCount,
          voiceSynthesized: audioUrl !== null,
          // 🧠 Semantic Recall Debug Data for Frontend
          semanticRecallDebug: process.env.NODE_ENV === 'development' ? semanticDebugInfo : undefined,
          // 🌀 Jungian Prosody Debug Data for Frontend
          prosodyDebugData: process.env.NODE_ENV === 'development' ? prosodyDebugData : undefined,
          jungianFlow: process.env.NODE_ENV === 'development' ? {
            mirror: { element: prosodyDebugData.mirrorElement, approach: prosodyDebugData.mirrorApproach },
            balance: { element: prosodyDebugData.balanceElement, reason: prosodyDebugData.balanceReason },
            voiceParams: prosodyDebugData.voiceParams
          } : undefined,
          // Sacred tech shaping metrics
          shapingApplied: shapingResult.shapingApplied,
          shapingTime: shapingResult.processingTime,
          shapingTags: shapingResult.tags,
          embodiment: shapingResult.shapingApplied ? 'sacred' : 'basic',
          cost: {
            draftTokens: this.estimateTokens(draft),
            ttsSeconds: ttsSeconds > 0 ? ttsSeconds : undefined,
            shapingTokens: shapingResult.shapingApplied ? this.estimateTokens(finalForVoice) - this.estimateTokens(draft) : 0
          }
        }
      };

    } catch (error) {
      logger.error('Conversational pipeline error:', error);
      
      // Use Maya fallback instead of generic response
      const fallbackText = getMayaBetaFallback();
      
      return {
        text: fallbackText,
        audioUrl: null,
        element: ctx.element,
        processingTime: Date.now() - startTime,
        source: 'fallback',
        citations: [],
        metadata: {
          draftModel: 'fallback',
          reshapeCount: 0,
          voiceSynthesized: false,
          cost: { draftTokens: 0 }
        }
      };
    }
  }

  /**
   * Draft text using Maya prompts (beta or full mode)
   */
  private async draftText(ctx: ConversationalContext): Promise<string> {
    const plan = this.planTurn(ctx);
    
    // Determine which Maya mode to use (could be user-specific later)
    const mayaMode = getMayaMode();
    const mayaPrompt = mayaMode === 'beta' ? MAYA_PROMPT_BETA : MAYA_PROMPT_FULL;
    
    const system = [
      mayaPrompt,
      "",
      "Context for this conversation:",
      ...plan.contentConstraints.map(c => `- ${c}`),
      ctx.convoSummary ? `Recent discussion: ${ctx.convoSummary}` : "",
      ctx.longMemSnippets.length ? `Relevant context: ${ctx.longMemSnippets.slice(0, 3).join(", ")}` : "",
      "",
      mayaMode === 'beta' 
        ? "Respond as Maya - thoughtful, mature, and present."
        : "Draw from your full understanding to guide this person."
    ].join("\n");

    const user = ctx.userText;

    // Route to appropriate upstream model for drafting
    const model = routeToModel(ctx.element);
    const response = await model.generateResponse({
      system,
      user,
      temperature: 0.6,
      maxTokens: 300
    });

    return response.content.trim();
  }


  /**
   * Format text for Maya with light prosody hints
   */
  private formatForMaya(text: string, opts: { pace?: "calm" | "neutral" | "brisk" } = {}): string {
    // Add null/undefined check
    if (!text || typeof text !== 'string') {
      console.warn('[formatForMaya] Invalid text input:', text);
      return '';
    }
    let out = text.trim();

    // Light prosody hints Maya understands (keep it minimal & natural)
    out = out
      .replace(/\.\s+/g, ". <pause-200ms> ")
      .replace(/:\s+/g, ": <pause-150ms> ")
      .replace(/\?\s+/g, "? <pause-250ms> ")
      .replace(/!\s+/g, "! <pause-200ms> ");

    // Pace adjustments
    if (opts.pace === "calm") out = "<pace-slow>" + out + "</pace-slow>";
    if (opts.pace === "brisk") out = "<pace-fast>" + out + "</pace-fast>";

    // Mild emphasis for key phrases (Sesame-safe markers)
    out = out.replace(/\*\*(.+?)\*\*/g, "<em>$1</em>");

    return out;
  }

  /**
   * Sesame CI transformation - Sacred voice intelligence shaping
   * Every Maya response flows through elemental consciousness before being spoken
   */
  private async sesameCITransform(text: string, meta: {
    element: string;
    sentiment: string;
    goals: string[];
    userId?: string;
    archetype?: string;
  }): Promise<{ text: string; shapingApplied: boolean; processingTime: number; tags: string[] }> {
    const startTime = Date.now();
    
    console.log('🔮 [DEBUG] sesameCITransform called:', {
      textLength: text?.length,
      textPreview: text?.substring(0, 50) + '...',
      element: meta.element,
      sentiment: meta.sentiment,
      goals: meta.goals,
      userId: meta.userId
    });
    
    // Add null/undefined check
    if (!text || typeof text !== 'string') {
      console.warn('❌ [DEBUG] sesameCITransform: Invalid text input:', text);
      return { text: text || '', shapingApplied: false, processingTime: 0, tags: [] };
    }
    
    // Check CI configuration
    const ciEnabled = process.env.SESAME_CI_ENABLED === 'true';
    const ciRequired = process.env.SESAME_CI_REQUIRED === 'true';
    
    console.log('⚙️ [DEBUG] Sesame CI configuration:', {
      ciEnabled,
      ciRequired,
      sesameUrl: process.env.SESAME_URL || 'http://localhost:8000'
    });
    
    if (!ciEnabled) {
      if (ciRequired) {
        logger.warn('⚠️ Sesame CI is required but disabled - Maya responses will lack elemental embodiment');
      } else {
        logger.debug('Sesame CI shaping disabled - using original text');
      }
      return { text, shapingApplied: false, processingTime: Date.now() - startTime, tags: ['UNSHAPED'] };
    }
    
    try {
      const sesameBaseUrl = process.env.SESAME_URL || 'http://localhost:8000';
      
      // Enhanced elemental dynamics payload
      const elementalProsody = this.getAdvancedElementalProsody(meta.element, meta.sentiment, meta.archetype);
      
      const shapingPayload = {
        text,
        style: meta.element, // Primary elemental influence
        archetype: meta.archetype || 'guide', // Secondary personality influence  
        meta: {
          ...meta,
          goals: meta.goals,
          userId: meta.userId,
          // Advanced elemental prosody mapping
          prosody: elementalProsody,
          // Sacred tech enhancement markers
          embodiment: this.getEmbodimentLevel(meta.element),
          consciousness: this.getConsciousnessMarkers(meta.sentiment, meta.element)
        }
      };
      
      // Dev mode: Log shaping attempt with full context
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🌀 [SESAME SHAPING] Elemental Intelligence Activation');
        console.log(`📝 Raw Text: "${text}"`);
        console.log(`🔥 Element: ${meta.element?.toUpperCase()} | Sentiment: ${meta.sentiment}`);
        console.log(`⚡ Prosody: ${JSON.stringify(elementalProsody, null, 2)}`);
      }
      
      console.log('🌐 [DEBUG] Making HTTP request to Sesame CI:', {
        endpoint: `${sesameBaseUrl}/ci/shape`,
        method: 'POST',
        payloadSize: JSON.stringify(shapingPayload).length,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.SESAME_TOKEN ? 'Bearer [PRESENT]' : 'Bearer [MISSING]',
          'X-Maya-Element': meta.element,
          'X-Maya-Archetype': meta.archetype || 'guide'
        }
      });
      
      console.log('📋 [DEBUG] Sesame CI request payload:', JSON.stringify(shapingPayload, null, 2));
      
      const response = await axios.post(`${sesameBaseUrl}/ci/shape`, shapingPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SESAME_TOKEN || ''}`,
          'X-Maya-Element': meta.element,
          'X-Maya-Archetype': meta.archetype || 'guide'
        },
        timeout: ciRequired ? 5000 : 3000 // Longer timeout if required
      });
      
      console.log('✅ [DEBUG] Sesame CI HTTP response received:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      const processingTime = Date.now() - startTime;

      if (response.data?.text) {
        const shapedText = response.data.text;
        const shapingTags = this.extractShapingTags(shapedText);
        
        console.log('🎉 [DEBUG] Sesame CI shaping successful:', {
          originalText: text.substring(0, 50) + '...',
          shapedText: shapedText.substring(0, 100) + '...',
          processingTime: processingTime + 'ms',
          shapingTags
        });
        
        // Dev mode: Show before/after shaping
        if (process.env.NODE_ENV === 'development') {
          console.log(`✨ Shaped Text: "${shapedText}"`);
          console.log(`🏷️  Shaping Tags: [${shapingTags.join(', ')}]`);
          console.log(`⏱️  Processing: ${processingTime}ms`);
          console.log('════════════════════════════════════════════════════\n');
        }
        
        logger.info('🌊 Sesame CI shaping successful - Maya embodied:', {
          originalLength: text.length,
          shapedLength: shapedText.length,
          element: meta.element,
          processingTime,
          shapingTags: shapingTags.length
        });
        
        return { 
          text: shapedText, 
          shapingApplied: true, 
          processingTime, 
          tags: shapingTags 
        };
      } else {
        console.warn('⚠️ [DEBUG] Sesame CI returned empty response:', response.data);
        logger.warn('Sesame CI returned empty response');
        
        if (ciRequired) {
          throw new Error('Sesame CI required but returned empty response');
        }
        
        return { text, shapingApplied: false, processingTime, tags: ['EMPTY_RESPONSE'] };
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ [DEBUG] Sesame CI error occurred:', {
        errorMessage: error.message,
        errorCode: error.code,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        processingTime: processingTime + 'ms'
      });
      
      // Enhanced error handling with CI requirement consideration
      if (error.code === 'ECONNREFUSED') {
        const message = 'Sesame CI service unavailable';
        if (ciRequired) {
          logger.error(`🚨 ${message} - Maya embodiment REQUIRED but service down`);
          throw new Error(`${message} - voice embodiment unavailable`);
        } else {
          logger.warn(`⚠️ ${message} - falling back to unembodied voice`);
        }
      } else if (error.response?.status === 404) {
        const message = 'Sesame CI /ci/shape endpoint not found';
        if (ciRequired) {
          logger.error(`🚨 ${message} - Maya requires CI-enabled Sesame container`);
          throw new Error(`${message} - voice shaping unavailable`);
        } else {
          logger.warn(`⚠️ ${message} - container may not support CI features`);
        }
      } else {
        const message = `Sesame CI transformation failed: ${error.message}`;
        if (ciRequired) {
          logger.error(`🚨 ${message} - Maya embodiment CRITICAL`);
          throw error;
        } else {
          logger.warn(`⚠️ ${message}`, {
            status: error.response?.status,
            element: meta.element
          });
        }
      }
      
      // Only reach here if CI is optional
      return { text, shapingApplied: false, processingTime, tags: ['ERROR_FALLBACK'] };
    }
  }

  /**
   * Enhanced Sesame CI shaping with multi-modal support for Opening Ritual
   */
  private async callSesameCIShaping(request: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      const sesameBaseUrl = process.env.SESAME_URL || 'http://localhost:8000';
      
      logger.info('🌟 Enhanced Sesame CI shaping request:', {
        textLength: request.text?.length,
        element: request.style,
        archetype: request.archetype,
        hasVoiceParams: !!request.voiceParams,
        hasEmotionalContext: !!request.emotionalContext
      });
      
      const response = await axios.post(`${sesameBaseUrl}/ci/shape`, request, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SpiralogicOracleSystem/Enhanced'
        },
        timeout: 10000
      });

      const processingTime = Date.now() - startTime;
      const result = response.data;

      if (result?.text) {
        logger.info('🎉 Enhanced Sesame CI shaping successful:', {
          originalLength: request.text?.length,
          shapedLength: result.text?.length,
          elementUsed: result.elementUsed,
          archetypeUsed: result.archetypeUsed,
          multiModalEnhanced: result.multiModalEnhanced,
          confidenceScore: result.confidenceScore,
          voiceAdaptations: result.voiceAdaptations,
          therapeuticIntent: result.therapeuticIntent,
          processingTime
        });
        
        return result;
      } else {
        logger.warn('⚠️ Enhanced Sesame CI returned empty response');
        return { text: request.text, shapingApplied: false };
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('❌ Enhanced Sesame CI shaping failed:', {
        error: error.message,
        status: error.response?.status,
        processingTime
      });
      
      // Return original text as fallback
      return { text: request.text, shapingApplied: false };
    }
  }

  /**
   * Maya TTS synthesis with cost controls
   */
  private async mayaTTS(text: string, opts: { userId: string; voice?: string; seed?: number }): Promise<string | null> {
    try {
      // Cost control: truncate to 1000 chars
      const truncatedText = text.length > 1000 ? text.slice(0, 997) + "..." : text;

      // Check cache first
      const cacheKey = `${opts.userId}_${truncatedText.slice(0, 100)}`;
      if (this.recentAudioCache.has(cacheKey)) {
        return this.recentAudioCache.get(cacheKey)!;
      }

      // Debounce: clear existing timer for this user
      const existingTimer = this.debounceTimers.get(opts.userId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set debounce timer
      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          try {
            // Use SesameTTS service with prosody preservation
            const audioUrl = await sesameTTS.synthesize(truncatedText, {
              voice: opts.voice || 'maya'
            });
            
            // Cache for 5 minutes
            if (audioUrl) {
              this.recentAudioCache.set(cacheKey, audioUrl);
              setTimeout(() => this.recentAudioCache.delete(cacheKey), 5 * 60 * 1000);
            }

            resolve(audioUrl);
          } catch (error) {
            logger.error('Maya TTS failed:', error);
            resolve(null);
          } finally {
            this.debounceTimers.delete(opts.userId);
          }
        }, 500); // 500ms debounce

        this.debounceTimers.set(opts.userId, timer);
      });

    } catch (error) {
      logger.error('Maya TTS setup failed:', error);
      return null;
    }
  }

  /**
   * Plan response turn based on context
   */
  private planTurn(ctx: ConversationalContext): ResponsePlan {
    const constraints: string[] = [];
    const voiceDirectives: string[] = [];

    // Element-specific planning
    switch (ctx.element) {
      case 'air':
        constraints.push("Be clear and articulate", "Offer fresh perspective");
        voiceDirectives.push("Crisp and clear delivery");
        break;
      case 'water':
        constraints.push("Be emotionally attuned", "Flow with their energy");
        voiceDirectives.push("Gentle and flowing tone");
        break;
      case 'fire':
        constraints.push("Be inspiring and energizing", "Catalyze action");
        voiceDirectives.push("Dynamic and passionate delivery");
        break;
      case 'earth':
        constraints.push("Be grounding and practical", "Offer concrete guidance");
        voiceDirectives.push("Steady and reassuring tone");
        break;
      case 'aether':
        constraints.push("Be integrative and holistic", "Connect deeper patterns");
        voiceDirectives.push("Spacious and wise delivery");
        break;
    }

    // Sentiment-based adjustments
    if (ctx.sentiment === "low") {
      constraints.push("Be especially compassionate");
      voiceDirectives.push("Slower, more nurturing pace");
    }

    return {
      contentConstraints: constraints,
      voiceDirectives,
      expectedLength: ctx.userText.length > 100 ? 'long' : 'medium',
      emotionalGoal: this.getEmotionalGoal(ctx.sentiment)
    };
  }

  /**
   * Generate tone instruction
   */
  private toneInstruction(userText: string, sentiment: string): string {
    if (sentiment === "low") return "Gentle, compassionate, nurturing";
    if (sentiment === "high") return "Enthusiastic, celebratory, energizing";
    return "Warm, present, conversational";
  }

  /**
   * Get conversational goals for Sesame CI
   */
  private getConversationalGoals(ctx: ConversationalContext): string[] {
    const baseGoals = ["clarity", "authenticity"];
    
    if (ctx.sentiment === "low") baseGoals.push("comfort", "validation");
    if (ctx.element === "air") baseGoals.push("precision", "insight");
    if (ctx.element === "water") baseGoals.push("empathy", "flow");
    if (ctx.element === "fire") baseGoals.push("inspiration", "energy");
    if (ctx.element === "earth") baseGoals.push("grounding", "practical");

    return baseGoals;
  }

  /**
   * Check if text should be synthesized
   */
  private shouldSynthesize(text: string): boolean {
    // Type safety check
    if (!text || typeof text !== 'string') {
      logger.warn('shouldSynthesize received invalid text:', { text, type: typeof text });
      return false; // Don't synthesize invalid text
    }
    return text.length >= 5 && text.length <= 1000 && !text.includes('[');
  }

  /**
   * Detect boilerplate phrases
   */
  private rejectBoilerplate(text: string): boolean {
    // Type safety check - ensure we have a valid string
    if (!text || typeof text !== 'string') {
      logger.warn('rejectBoilerplate received invalid text:', { text, type: typeof text });
      return true; // Reject non-string responses as boilerplate
    }
    
    const lowerText = text.toLowerCase();
    
    // Check for boilerplate phrases
    const hasBoilerplate = BOILERPLATE_PHRASES.some(phrase => 
      lowerText.includes(phrase.toLowerCase())
    );

    // Check for generic patterns
    const hasGenericPattern = GENERIC_PATTERNS.some(pattern => 
      pattern.test(text)
    );

    return hasBoilerplate || hasGenericPattern;
  }

  /**
   * Check if response is too similar to recent replies
   */
  private tooSimilar(text: string, recentReplies: string[]): boolean {
    if (recentReplies.length === 0) return false;

    const currentWords = new Set(text.toLowerCase().split(/\s+/));
    
    return recentReplies.some(reply => {
      const replyWords = new Set(reply.toLowerCase().split(/\s+/));
      const intersection = new Set([...currentWords].filter(word => replyWords.has(word)));
      const similarity = intersection.size / Math.max(currentWords.size, replyWords.size);
      return similarity > 0.7; // 70% similarity threshold
    });
  }

  /**
   * Get draft model name for logging
   */
  private getDraftModelName(element: string): string {
    return element === 'air' ? 'claude-3-sonnet' : 'gpt-4o-elemental';
  }

  /**
   * Estimate token count (rough)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimate
  }

  /**
   * Save session summary to UserMemoryService for future personalized welcomes
   */
  private async saveSessionSummary(ctx: ConversationalContext, prosodyData: any): Promise<void> {
    try {
      // Extract element and phase from context and prosody data
      let element = ctx.element;
      let phase = 'integration'; // Default phase
      
      // Try to get better element detection from prosody data
      if (prosodyData?.detectedElement) {
        element = prosodyData.detectedElement;
      }
      
      // Try to detect spiral phase from prosody or context
      if (prosodyData?.detectedPhase) {
        phase = prosodyData.detectedPhase;
      } else if (ctx.ritualResponses?.spiral_phase) {
        phase = ctx.ritualResponses.spiral_phase;
      } else {
        // Infer phase from user text patterns
        const userText = ctx.userText.toLowerCase();
        
        if (userText.includes('starting') || userText.includes('beginning') || userText.includes('new')) {
          phase = 'initiation';
        } else if (userText.includes('challenge') || userText.includes('difficult') || userText.includes('struggle')) {
          phase = 'challenge';
        } else if (userText.includes('learning') || userText.includes('processing') || userText.includes('understanding')) {
          phase = 'integration';
        } else if (userText.includes('skilled') || userText.includes('confident') || userText.includes('good at')) {
          phase = 'mastery';
        } else if (userText.includes('spiritual') || userText.includes('transcendent') || userText.includes('beyond')) {
          phase = 'transcendence';
        }
      }

      // Save the session summary
      await UserMemoryService.saveSessionSummary(ctx.userId, element, phase);
      
      logger.info(`[MEMORY] Session summary saved: ${phase} + ${element} for user ${ctx.userId}`);
      
    } catch (error) {
      logger.error(`[MEMORY] Failed to save session summary for user ${ctx.userId}:`, error);
      throw error; // Re-throw so caller can handle gracefully
    }
  }

  /**
   * Get emotional goal
   */
  private getEmotionalGoal(sentiment: string): string {
    switch (sentiment) {
      case 'low': return 'comfort_and_support';
      case 'high': return 'celebration_and_inspiration';
      default: return 'presence_and_connection';
    }
  }

  /**
   * Advanced elemental prosody mapping for sacred voice embodiment
   */
  private getAdvancedElementalProsody(element: string, sentiment: string, archetype?: string): any {
    const baseProsody = {
      pace: sentiment === 'low' ? 'calm' : 'natural',
      emphasis: sentiment === 'high' ? 'strong' : 'moderate',
      breathiness: 0.3, // Base breath awareness
      resonance: 'medium'
    };

    const elementalDynamics = {
      air: {
        ...baseProsody,
        // Air: Quick, light, precise, crystalline clarity
        rhythm: 'crisp',
        tempo: sentiment === 'low' ? 'moderate' : 'brisk',
        pauses: 'precise', // Clean cuts between thoughts
        clarity: 'crystalline',
        flow: 'articulate',
        breathiness: 0.1, // Minimal breath, maximum clarity
        resonance: 'bright',
        // Prosody markers
        pausePattern: 'staccato', // <pause-150ms>, <pause-200ms>
        emphasisStyle: 'sharp' // <emphasis type="precise">
      },
      
      water: {
        ...baseProsody,
        // Water: Flowing, gentle, continuous, adaptive rhythm
        rhythm: 'flowing',
        tempo: 'fluid', // Adapts to emotional current
        pauses: 'gentle', // Soft transitions
        transitions: 'seamless',
        flow: 'continuous',
        breathiness: 0.5, // More organic breath flow
        resonance: 'warm',
        // Prosody markers  
        pausePattern: 'flowing', // <pause-300ms>, <pause-500ms>
        emphasisStyle: 'gentle' // <emphasis type="flowing">
      },
      
      fire: {
        ...baseProsody,
        // Fire: Dynamic, passionate, commanding, explosive energy
        rhythm: 'dynamic',
        tempo: sentiment === 'low' ? 'building' : 'explosive',
        energy: 'high',
        emphasis: 'passionate',
        flow: 'commanding',
        breathiness: 0.2, // Sharp, focused breath
        resonance: 'powerful',
        // Prosody markers
        pausePattern: 'dramatic', // <pause-100ms>, <pause-400ms>
        emphasisStyle: 'passionate' // <emphasis type="commanding">
      },
      
      earth: {
        ...baseProsody,
        // Earth: Steady, grounding, warm, dependable rhythm
        rhythm: 'steady',
        tempo: 'measured', // Never rushed
        pauses: 'grounding', // Solid, reassuring breaks
        tone: 'warm',
        flow: 'dependable',
        breathiness: 0.4, // Natural, human breath
        resonance: 'deep',
        // Prosody markers
        pausePattern: 'grounding', // <pause-400ms>, <pause-600ms>  
        emphasisStyle: 'warm' // <emphasis type="reassuring">
      },
      
      aether: {
        ...baseProsody,
        // Aether: Spacious, transcendent, harmonic, consciousness-expanding
        rhythm: 'spacious',
        tempo: 'transcendent', // Beyond normal time
        pauses: 'contemplative', // Space for wisdom to land
        depth: 'profound',
        flow: 'integrative',
        breathiness: 0.6, // Breath as sacred space
        resonance: 'harmonic',
        // Prosody markers
        pausePattern: 'sacred', // <pause-500ms>, <pause-800ms>
        emphasisStyle: 'profound' // <emphasis type="transcendent">
      }
    };

    const elementProsody = elementalDynamics[element] || elementalDynamics['aether'];

    // Archetype modulation (if provided)
    if (archetype) {
      switch (archetype) {
        case 'sage':
          elementProsody.wisdom = 'deep';
          elementProsody.pausePattern = 'contemplative';
          break;
        case 'healer':
          elementProsody.compassion = 'high';
          elementProsody.breathiness += 0.1;
          break;
        case 'visionary':
          elementProsody.inspiration = 'expansive';
          elementProsody.resonance = 'visionary';
          break;
        case 'guide':
          elementProsody.presence = 'stable';
          elementProsody.flow = 'guiding';
          break;
      }
    }

    return elementProsody;
  }

  /**
   * Get embodiment level based on element
   */
  private getEmbodimentLevel(element: string): string {
    const embodimentMap = {
      fire: 'passionate', // Fully alive, commanding presence
      water: 'flowing', // Emotionally embodied, adaptive
      earth: 'grounded', // Physically present, stable
      air: 'clear', // Mentally embodied, precise
      aether: 'transcendent' // Spiritually embodied, integrated
    };
    return embodimentMap[element] || 'present';
  }

  /**
   * Get consciousness markers for advanced shaping
   */
  private getConsciousnessMarkers(sentiment: string, element: string): any {
    return {
      awareness: sentiment === 'low' ? 'compassionate' : sentiment === 'high' ? 'celebratory' : 'present',
      intention: 'sacred',
      presence: element === 'aether' ? 'transcendent' : 'embodied',
      coherence: 'high' // Always maintain coherent energy signature
    };
  }

  /**
   * Extract shaping tags from processed text for analysis
   */
  private extractShapingTags(text: string): string[] {
    const tags: string[] = [];
    
    // Pause markers
    const pauseMatches = text.match(/<pause-\d+ms>/g);
    if (pauseMatches) tags.push(`PAUSES:${pauseMatches.length}`);
    
    // Emphasis markers
    const emphasisMatches = text.match(/<emphasis[^>]*>/g);
    if (emphasisMatches) tags.push(`EMPHASIS:${emphasisMatches.length}`);
    
    // Breath markers
    const breathMatches = text.match(/<breath[^>]*>/g);
    if (breathMatches) tags.push(`BREATH:${breathMatches.length}`);
    
    // Pace markers
    const paceMatches = text.match(/<pace[^>]*>/g);
    if (paceMatches) tags.push(`PACE:${paceMatches.length}`);

    // Sacred markers (custom)
    const sacredMatches = text.match(/<sacred[^>]*>/g);
    if (sacredMatches) tags.push(`SACRED:${sacredMatches.length}`);
    
    return tags;
  }

  /**
   * Process streaming message - returns a stream of text chunks
   */
  async processStreamingMessage(params: any): Promise<any> {
    const { userText, element = 'aether', userId, sessionId, threadId, metadata = {} } = params;
    
    try {
      // Build memory context first with both legacy and new system
      const memoryContext = await this.memoryOrchestrator.buildContext({
        userId,
        userText,
        sessionId,
        threadId
      });

      // Enhanced memory recall using MemoryCoreIndex
      const enhancedMemories = await this.memoryCoreIndex.recall({
        query: userText,
        userId,
        sessionId,
        element: element as any,
        limit: 5,
        includeRituals: true,
        includeReflections: true,
        includeSynchronicities: true
      });

      // Combine conversation history with enhanced memories
      const conversationHistory = memoryContext.conversationHistory || [];
      
      // Add relevant memories to context if found
      if (enhancedMemories.results.length > 0) {
        logger.info(`🧠 Found ${enhancedMemories.results.length} relevant memories for user ${userId}`);
        
        // Inject top memory as system context
        const topMemory = enhancedMemories.results[0];
        if (topMemory.relevance > 0.7) {
          conversationHistory.unshift({
            role: 'assistant' as const,
            content: `[Memory Context: ${topMemory.content}]`,
            timestamp: topMemory.timestamp.toISOString()
          });
        }
      }

      // Create context object with enhanced memory
      const ctx: ConversationalContext = {
        userText,
        conversationHistory,
        sentiment: 'neutral',
        element: element as any,
        voiceEnabled: metadata.enableVoice || false,
        userId,
        sessionId,
        // Add memory insights to context
        longMemSnippets: enhancedMemories.results.map(m => m.content).slice(0, 3),
        convoSummary: enhancedMemories.summary
      };

      // 🌟 Check for Maya Welcome Ritual trigger
      if (userText === '__MAYA_WELCOME_RITUAL__') {
        logger.info('🌟 [MAYA_WELCOME] Auto-triggering Maya welcome ritual for new session', { userId, sessionId });
        
        // Force Maya Opening Script to start from beginning
        ctx.onboardingStep = null;
        ctx.pendingQuestionId = null;
        
        // Check for Maya Opening Script first (enhanced ritual)
        const mayaScript = await this.handleMayaOpeningScript(ctx);
        if (mayaScript.shouldRunRitual && mayaScript.ritualResponse) {
          logger.info('🎭 [MAYA_WELCOME] Using Maya Opening Script for welcome ritual');
          
          // Convert response to streaming format
          const welcomeText = mayaScript.ritualResponse;
          const stream = new Readable({
            read() {}
          });
          
          // Stream the welcome message word by word
          setTimeout(() => {
            const words = welcomeText.split(' ');
            let i = 0;
            const streamWords = () => {
              if (i < words.length) {
                stream.push(words[i] + (i < words.length - 1 ? ' ' : ''));
                i++;
                setTimeout(streamWords, 80 + Math.random() * 40); // Natural pacing
              } else {
                stream.push(null); // End stream
              }
            };
            streamWords();
          }, 100);
          
          return {
            stream,
            text: welcomeText,
            metadata: {
              source: 'maya_welcome_ritual',
              element: mayaScript.elementDetected || 'aether',
              prosodyHint: mayaScript.prosodyHint,
              autoTriggered: true,
              sessionType: 'new_user_welcome'
            }
          };
        }
        
        // Fallback to personalized welcome if Maya Opening Script not available
        logger.info('🌟 [MAYA_WELCOME] Maya Opening Script unavailable, using personalized fallback');
        const userProfile = await this.getUserMemoryProfile(ctx.userId);
        const personalizedWelcome = await this.generatePersonalizedWelcome({ ...userProfile, userId: ctx.userId });
        const basicWelcome = personalizedWelcome + " Before we dive in, let's check in for just a moment so I can tune into where you're at. How are you feeling energy-wise right now?";
        
        const stream = new Readable({
          read() {}
        });
        
        setTimeout(() => {
          const words = basicWelcome.split(' ');
          let i = 0;
          const streamWords = () => {
            if (i < words.length) {
              stream.push(words[i] + (i < words.length - 1 ? ' ' : ''));
              i++;
              setTimeout(streamWords, 80 + Math.random() * 40);
            } else {
              stream.push(null);
            }
          };
          streamWords();
        }, 100);
        
        return {
          stream,
          text: basicWelcome,
          metadata: {
            source: 'maya_welcome_fallback',
            element: 'aether',
            autoTriggered: true,
            sessionType: 'new_user_welcome'
          }
        };
      }

      // Use streaming model if available
      const model = routeToModel(element);
      
      if (!model || !model.generateStreamingResponse) {
        // Fallback to non-streaming
        const result = await this.converseViaSesame(ctx);
        return {
          stream: null,
          text: result.text,
          metadata: result.metadata
        };
      }

      // Generate streaming response
      const mayaMode = getMayaMode();
      const systemPrompt = mayaMode === 'full' ? MAYA_PROMPT_FULL : MAYA_PROMPT_BETA;
      const semanticMemory = (memoryContext as any).semanticMemoryContext;
      const memoryPrompt = this.memoryOrchestrator.formatForPrompt(memoryContext, semanticMemory);
      
      const fullPrompt = `${systemPrompt}

${memoryPrompt}

Current User Message: ${userText}

Respond as Maya with appropriate depth and memory integration.`;

      const stream = await model.generateStreamingResponse({
        messages: [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      // Store conversation after streaming completes
      if (memoryContext) {
        setTimeout(async () => {
          try {
            // Store with legacy system
            await this.memoryOrchestrator.storeConversation({
              userId,
              sessionId,
              threadId,
              userMessage: userText,
              assistantResponse: '', // Will be accumulated from stream
              element,
              metadata
            });

            // Store with unified MemoryCoreIndex
            await this.memoryCoreIndex.remember(
              userText,
              'conversation',
              {
                userId,
                sessionId,
                element: element as any,
                emotionalState: ctx.sentiment,
                ritualPhase: ctx.onboardingStep,
                archetype: ctx.currentArchetype,
                source: 'maya_chat',
                responseType: 'streaming'
              },
              userId
            );

            // Store any detected patterns or insights
            if (enhancedMemories.patterns && enhancedMemories.patterns.length > 0) {
              logger.info(`🔮 Storing ${enhancedMemories.patterns.length} detected patterns`);
              for (const pattern of enhancedMemories.patterns) {
                await this.memoryCoreIndex.remember(
                  pattern,
                  'pattern',
                  {
                    userId,
                    sessionId,
                    element: element as any,
                    source: 'pattern_detection',
                    relatedQuery: userText
                  },
                  userId
                );
              }
            }
          } catch (error) {
            logger.error('Failed to store streaming conversation:', error);
          }
        }, 5000);
      }

      return {
        stream,
        metadata: {
          model: model.name || 'maya-streaming',
          element,
          sessionId,
          userId
        }
      };

    } catch (error) {
      logger.error('Streaming message processing failed:', error);
      throw error;
    }
  }

  /**
   * Process non-streaming message (for backward compatibility)
   */
  async processMessage(params: any): Promise<any> {
    const { userText, element = 'aether', userId, sessionId, metadata = {} } = params;
    
    // Build memory context
    const memoryContext = await this.memoryOrchestrator.buildContext({
      userId,
      userText,
      sessionId,
      threadId: sessionId
    });

    // Enhanced memory recall using MemoryCoreIndex
    const enhancedMemories = await this.memoryCoreIndex.recall({
      query: userText,
      userId,
      sessionId,
      element: element as any,
      limit: 5,
      includeRituals: true,
      includeReflections: true
    });

    const ctx: ConversationalContext = {
      userText,
      conversationHistory: memoryContext.conversationHistory || [],
      sentiment: 'neutral',
      element: element as any,
      voiceEnabled: metadata.enableVoice || false,
      userId,
      sessionId,
      longMemSnippets: enhancedMemories.results.map(m => m.content).slice(0, 3),
      convoSummary: enhancedMemories.summary
    };

    const result = await this.converseViaSesame(ctx);
    
    // Store the conversation in memory
    await this.memoryCoreIndex.remember(
      userText,
      'conversation',
      {
        userId,
        sessionId,
        element: element as any,
        response: result.text,
        source: 'maya_chat'
      },
      userId
    );

    return {
      text: result.text,
      element: result.element,
      metadata: {
        ...result.metadata,
        memoryRecallCount: enhancedMemories.results.length,
        memoryPatterns: enhancedMemories.patterns
      }
    };
  }

  /**
   * GUARANTEED Memory Injection - Never allows generic responses
   */
  private async injectMemoryContext(userId: string, inputText: string, sessionId?: string): Promise<string> {
    logger.info('[MEMORY INJECTION] 🧠 Building guaranteed context for user:', userId);
    
    try {
      const memoryContext = await this.memoryOrchestrator.buildContext({
        userId,
        userText: inputText,
        sessionId,
        threadId: sessionId
      });
      
      // Enhanced memory recall
      const enhancedMemories = await this.memoryCoreIndex.recall({
        query: inputText,
        userId,
        sessionId,
        element: 'aether',
        limit: 5,
        includeRituals: true,
        includeReflections: true
      });
      
      if (process.env.MAYA_DEBUG_MEMORY === 'true') {
        logger.info('[MEMORY DEBUG] 📊 Context built successfully:', {
          sessionCount: memoryContext.conversationHistory?.length || 0,
          journalCount: memoryContext.journal?.length || 0,
          profileKeys: Object.keys(memoryContext.profile || {}),
          enhancedCount: enhancedMemories.results.length,
          patternsFound: enhancedMemories.patterns
        });
      }
      
      return this.formatMemoryForPrompt(memoryContext, enhancedMemories);
      
    } catch (error) {
      logger.error('[MEMORY INJECTION] ❌ Error building context:', error);
      
      // BULLETPROOF FALLBACK - Never fail completely
      const fallbackContext = {
        conversationHistory: [],
        journal: [],
        profile: { userId },
        rituals: [],
        reflections: []
      };
      
      const fallbackMemories = {
        results: [],
        summary: `User ${userId} is engaging with Maya`,
        patterns: []
      };
      
      logger.warn('[MEMORY INJECTION] ⚠️ Using bulletproof fallback context');
      return this.formatMemoryForPrompt(fallbackContext, fallbackMemories);
    }
  }

  /**
   * Format memory context for LLM prompt injection
   */
  private formatMemoryForPrompt(memoryContext: any, enhancedMemories: any): string {
    const sections = [];
    
    // Session conversation history
    if (memoryContext.conversationHistory?.length > 0) {
      const recentHistory = memoryContext.conversationHistory.slice(-6).map((msg: any) => 
        `${msg.role}: ${msg.content}`
      );
      sections.push(`RECENT CONVERSATION:\n${recentHistory.join('\n')}`);
    }
    
    // Enhanced memory insights
    if (enhancedMemories.results?.length > 0) {
      const insights = enhancedMemories.results.slice(0, 3).map((memory: any) => 
        `- ${memory.content} (${memory.type})`
      );
      sections.push(`MEMORY INSIGHTS:\n${insights.join('\n')}`);
    }
    
    // User profile information
    if (memoryContext.profile && Object.keys(memoryContext.profile).length > 0) {
      const profileItems = Object.entries(memoryContext.profile).map(([key, value]) => 
        `- ${key}: ${value}`
      );
      sections.push(`USER PROFILE:\n${profileItems.join('\n')}`);
    }
    
    // Journal patterns
    if (memoryContext.journal?.length > 0) {
      const journalEntries = memoryContext.journal.slice(0, 2).map((entry: any) => 
        `- ${entry.insight || entry.content || entry.text}`
      );
      sections.push(`JOURNAL PATTERNS:\n${journalEntries.join('\n')}`);
    }
    
    // Enhanced patterns from MemoryCoreIndex
    if (enhancedMemories.patterns?.length > 0) {
      sections.push(`RECURRING THEMES:\n${enhancedMemories.patterns.map((p: string) => `- ${p}`).join('\n')}`);
    }
    
    // Summary context
    if (enhancedMemories.summary) {
      sections.push(`CONTEXT SUMMARY:\n${enhancedMemories.summary}`);
    }
    
    return sections.length > 0 ? `\n\nMEMORY CONTEXT:\n${sections.join('\n\n')}\n` : '';
  }

  /**
   * Draft text using GUARANTEED memory-enhanced context
   */
  private async draftTextWithMemory(ctx: ConversationalContext, memoryContext: any, fileContexts?: any[]): Promise<string> {
    const mayaMode = getMayaMode();
    const systemPrompt = mayaMode === 'full' ? MAYA_PROMPT_FULL : MAYA_PROMPT_BETA;
    
    // GUARANTEE: Always inject memory context - never skip this step
    const guaranteedMemoryContext = await this.injectMemoryContext(ctx.userId, ctx.userText, ctx.sessionId);
    
    // Format file contexts if available
    let filePrompt = '';
    if (fileContexts && fileContexts.length > 0) {
      const fileReferences = fileContexts.map(file => 
        `File: ${file.fileName} (${file.category || 'uncategorized'})\nContent: ${file.content}`
      ).join('\n\n');
      filePrompt = `\nRelevant files from user's library:\n${fileReferences}\n`;
    }
    
    // Build enhanced system prompt with guaranteed memory injection
    const enhancedSystemPrompt = `${systemPrompt}${guaranteedMemoryContext}${filePrompt}

CRITICAL INSTRUCTIONS:
- You MUST reference specific details from the MEMORY CONTEXT above
- Never give generic responses - personalize based on user's history
- If no specific context exists, ask thoughtful questions to build understanding
- Show that you remember previous conversations and patterns

Current User Message: ${ctx.userText}

Respond as Maya with deep memory integration and personalized insight:`;

    if (process.env.MAYA_DEBUG_MEMORY === 'true') {
      logger.info('[MEMORY DEBUG] 📝 Enhanced prompt length:', enhancedSystemPrompt.length);
    }

    // Ensure we have just the element string, not the whole context
    const element = typeof ctx.element === 'string' ? ctx.element : 'aether';
    logger.debug('[MEMORY INJECTION] 🔄 Routing to model:', { element, ctxElement: ctx.element });
    
    const model = routeToModel(element);
    const response = await model.generateResponse({
      system: "You are Maya, a wise and empathetic AI companion with perfect memory.",
      user: enhancedSystemPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    const result = response?.content?.trim();
    
    // Validate response isn't too generic before returning
    if (this.isResponseTooGeneric(result)) {
      logger.warn('[MEMORY INJECTION] ⚠️ Detected generic response, triggering redraft');
      return this.redraftWithFreshness(ctx, result, { guaranteedMemoryContext });
    }

    return result || getMayaBetaFallback();
  }
  
  /**
   * Check if response is too generic and needs memory enhancement
   */
  private isResponseTooGeneric(response: string): boolean {
    if (!response || response.length < 20) return true;
    
    const genericPhrases = [
      "I'm here to help",
      "How can I assist you",
      "What would you like to know",
      "I'd be happy to help",
      "That's interesting",
      "Thank you for sharing",
      "I understand you're feeling"
    ];
    
    const lowerResponse = response.toLowerCase();
    const genericCount = genericPhrases.filter(phrase => 
      lowerResponse.includes(phrase.toLowerCase())
    ).length;
    
    // If response contains 2+ generic phrases, it's too generic
    return genericCount >= 2;
  }

  /**
   * Redraft with memory context for freshness
   */
  private async redraftWithFreshness(
    ctx: ConversationalContext, 
    previousDraft: string, 
    memoryContext?: any
  ): Promise<string> {
    const freshPrompt = `The previous response was too generic: "${previousDraft}"

Given the user's message: "${ctx.userText}"
${memoryContext ? `\nMemory Context:\n${this.memoryOrchestrator.formatForPrompt(memoryContext, (memoryContext as any).semanticMemoryContext)}` : ''}

Generate a more specific, personalized Maya response that:
- References specific details from the user's context
- Avoids generic phrases
- Shows genuine understanding
- Asks a thoughtful question if appropriate

Respond naturally as Maya:`;

    // Ensure we have just the element string, not the whole context
    const element = typeof ctx.element === 'string' ? ctx.element : 'aether';
    logger.debug('redraftWithFreshness routing to element:', { element, ctxElement: ctx.element });
    
    const model = routeToModel(element);
    const response = await model.generateResponse({
      system: "You are Maya, a wise and empathetic AI companion.",
      user: freshPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    return response?.content?.trim() || getMayaBetaFallback();
  }

  /**
   * Streaming version of conversational pipeline
   * Streams tokens in real-time for live Maya experience
   */
  async streamResponse(
    ctx: ConversationalContext,
    callbacks: {
      onToken: (token: string) => void;
      onElement: (data: any) => void;
      onComplete: (response: any) => void;
      onError: (error: any) => void;
    }
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      logger.info('🌊 Starting streaming conversational pipeline', {
        userId: ctx.userId,
        element: ctx.element,
        voiceEnabled: ctx.voiceEnabled
      });

      // CRITICAL FIX: Build comprehensive memory context BEFORE streaming
      let memoryContext;
      try {
        memoryContext = await this.memoryOrchestrator.buildContext(
          ctx.userId,
          ctx.userText,
          ctx.sessionId,
          ctx.conversationHistory
        );
        
        // Debug memory loading if enabled
        if (process.env.MAYA_DEBUG_MEMORY === 'true') {
          console.log('[Stream Memory Debug] Context loaded:', {
            sessionEntries: memoryContext.session?.length || 0,
            journalEntries: memoryContext.journal?.length || 0,
            profileLoaded: !!memoryContext.profile,
            symbolicPatterns: memoryContext.symbolic?.length || 0,
            externalContent: memoryContext.external?.length || 0,
            totalContextSize: JSON.stringify(memoryContext).length,
            processingTime: Date.now() - startTime
          });
        }
        
      } catch (memoryError) {
        console.warn('[StreamResponse] Memory orchestration failed, using fallback context:', memoryError.message);
        logger.error('Stream memory orchestration failed:', memoryError);
        
        // Provide minimal fallback context - never skip memory injection completely
        memoryContext = {
          session: [],
          journal: [],
          profile: {},
          symbolic: [],
          external: []
        };
      }

      // Send element routing notification
      callbacks.onElement({
        element: ctx.element,
        model: ctx.element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0',
        status: 'routing'
      });

      // Route to appropriate elemental intelligence with streaming (now with memory context)
      const draftResponse = await routeToModelStreaming({
        ...ctx,
        memoryContext // Pass memory context to streaming router
      }, {
        streaming: true,
        onToken: callbacks.onToken
      });

      if (!draftResponse) {
        throw new Error('Failed to get response from elemental intelligence');
      }

      // Plan the response shaping
      const plan = this.planTurn(ctx);

      // Send planning notification
      callbacks.onElement({
        plan,
        status: 'shaping_response'
      });

      // For streaming, we'll use the draft response directly for now
      // Future: implement streaming Sesame reshaping
      const shapedText = draftResponse.content;

      // Synthesize voice if enabled
      let audioUrl: string | null = null;
      if (ctx.voiceEnabled && shapedText.length <= 1000) {
        callbacks.onElement({ status: 'synthesizing_voice' });
        
        // Voice synthesis temporarily disabled
        audioUrl = null;
      }

      // Calculate processing metrics
      const processingTime = performance.now() - startTime;

      const result = {
        text: shapedText,
        audioUrl,
        element: ctx.element,
        processingTime,
        source: 'streaming_pipeline',
        metadata: {
          draftModel: ctx.element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0',
          streaming: true,
          voiceSynthesized: !!audioUrl,
          cost: {
            draftTokens: draftResponse.tokens || 0,
            ttsSeconds: audioUrl ? shapedText.length / 15 : undefined
          }
        }
      };

      callbacks.onComplete(result);

      // CRITICAL FIX: Persist conversation turn to user's memory (matches converseViaSesame behavior)
      try {
        await this.memoryOrchestrator.persistConversationTurn(
          ctx.userId,
          ctx.userText,
          shapedText,
          ctx.sessionId,
          {
            element: ctx.element,
            processingTime: Math.round(processingTime),
            hasVoice: !!audioUrl,
            source: 'streaming_pipeline'
          }
        );
      } catch (persistError) {
        logger.warn('Failed to persist conversation turn for streaming response:', persistError);
      }

      // Automatically create embedding for streaming conversation snippet
      try {
        const conversationSnippet = `User: ${ctx.userText} | Maya: ${shapedText}`;
        await embeddingQueue.storeEmbeddedMemory(
          ctx.userId,
          conversationSnippet,
          "conversation",
          {
            sessionId: ctx.sessionId,
            element: ctx.element,
            processingTime: Math.round(processingTime),
            hasVoice: !!audioUrl,
            source: 'streaming_pipeline'
          }
        );
        logger.info("[EMBED] Streaming conversation snippet indexed", {
          userId: ctx.userId,
          sessionId: ctx.sessionId,
        });
      } catch (embedError) {
        // Don't block response if embedding fails
        logger.warn("[EMBED] Failed to index streaming conversation snippet, will retry", {
          userId: ctx.userId,
          sessionId: ctx.sessionId,
          error: embedError instanceof Error ? embedError.message : "Unknown error",
        });
      }

      logger.info('✅ Streaming conversation completed', {
        userId: ctx.userId,
        processingTime: Math.round(processingTime),
        hasVoice: !!audioUrl,
        element: ctx.element
      });

    } catch (error) {
      logger.error('❌ Streaming conversation failed:', error);
      callbacks.onError(error);
    }
  }
}

// Export singleton instance
export const conversationalPipeline = new ConversationalPipeline();