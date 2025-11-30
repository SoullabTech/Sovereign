import { bind, get } from "../core/di/container";
import { TOKENS } from "../core/di/tokens";
import { ICache, IAnalytics, IOrchestrator } from "../core/interfaces";
import { InMemoryMemory } from "../adapters/memory/InMemoryMemory";
import { ConsoleAnalytics } from "../adapters/analytics/ConsoleAnalytics";
import { StubOrchestrator } from "../adapters/orchestrator/StubOrchestrator";
import { ConsciousnessAPI } from "../api/ConsciousnessAPI";
import { StubVoice } from "../adapters/voice/StubVoice";
import { ElevenLabsVoice } from "../adapters/voice/ElevenLabsVoice";
import { VoiceMemo } from "../adapters/voice/VoiceMemo";
import { SseHub } from "../core/events/SseHub";
import { VoiceQueue } from "../services/VoiceQueue";
import { SimpleCache } from "../core/implementations/SimpleCache";
import { VOICE_CONFIG, validateVoiceConfig } from "../config/voice";
import { VoiceGuards } from "../core/guards/VoiceGuards";
import { S3AudioStorage } from "../adapters/storage/S3AudioStorage";
import { LocalAudioStorage } from "../adapters/storage/LocalAudioStorage";
import { SpiralogicAdapter } from "../orchestrators/SpiralogicAdapter";
import { SpiralogicCognitiveEngine } from "../spiralogic/SpiralogicCognitiveEngine";
import { ElementalAgentOrchestrator } from "../spiralogic/ElementalAgentOrchestrator";
import { AwarenessIntegrator } from "../spiralogic/AwarenessIntegrator";
import { OnboardingCeremony } from "../services/OnboardingCeremony";
import { logger } from "../utils/logger";
import path from 'path';

/**
 * Wire up Spiralogic orchestrator with full consciousness architecture
 */
export function wireSpiralogic(): void {
  try {
    const engine = new SpiralogicCognitiveEngine();
    const elements = new ElementalAgentOrchestrator();
    const integrator = new AwarenessIntegrator();
    const cache = get(TOKENS.Cache) as ICache;
    const analytics = get(TOKENS.Analytics) as IAnalytics;
    
    const adapter = new SpiralogicAdapter(engine, elements, integrator, cache, analytics);
    bind(TOKENS.Orchestrator, adapter);
    
    logger.info('Spiralogic orchestrator wired successfully');
  } catch (error) {
    logger.error('Failed to wire Spiralogic orchestrator, falling back to baseline', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    wireBaseline();
  }
}

/**
 * Wire up baseline orchestrator with shadow work integration
 */
export function wireBaseline(): void {
  const baselineOrchestrator = {
    async process(request: any) {
      logger.debug('Baseline orchestrator processing request', { 
        userId: request.userId?.substring(0, 8) + '...',
        element: request.element 
      });

      // Simple baseline responses with shadow work elements
      const shadowWorkPrompts = [
        "What are you not quite ready to face about this situation?",
        "I hear what you're saying, and I'm curious about what you're not saying.",
        "That sounds like the story you tell yourself. What's the story underneath that one?",
        "What would you tell your best friend if they brought this exact problem to you?",
        "I notice you're asking me what to do. What do you already know you need to do?"
      ];

      const responses = {
        fire: "Your passion is clear. What's the action you're avoiding taking?",
        water: "I sense deep feeling here. What emotion are you not quite ready to feel fully?",
        earth: "You want solid ground. What foundation are you afraid to build?",
        air: "Your mind is working hard on this. What does your body know that your thoughts don't?",
        aether: shadowWorkPrompts[Math.floor(Math.random() * shadowWorkPrompts.length)]
      };

      const element = (request.element as keyof typeof responses) || 'aether';
      const text = responses[element] || responses.aether;

      return {
        id: `baseline-${Date.now()}`,
        text,
        tokens: { prompt: request.text?.length || 0, completion: text.length },
        meta: {
          element: element,
          evolutionary_awareness_active: false,
          latencyMs: 50
        }
      };
    },

    async getHealthStatus() {
      return { 
        status: 'healthy' as const, 
        details: { 
          type: 'baseline',
          message: 'Baseline orchestrator operational with shadow work integration' 
        } 
      };
    }
  };

  bind(TOKENS.Orchestrator, baselineOrchestrator);
  logger.info('Baseline orchestrator wired successfully');
}

export function wireDI(opts?: { requestHeaders?: Headers }) {
  const memory = new InMemoryMemory();
  const analytics = new ConsoleAnalytics();
  const cache = new SimpleCache({ defaultTtlSeconds: 3600 }); // 1 hour default TTL
  
  // Voice system setup - intelligent provider selection
  let baseVoice;
  
  // Check for explicit stub mode
  if (process.env.USE_STUB_VOICE === "true") {
    console.log('🎤 Using stub voice (USE_STUB_VOICE=true)');
    baseVoice = new StubVoice();
  } else {
    const voiceValidation = validateVoiceConfig();
    
    // Try ElevenLabs voice even if validation fails (more resilient)
    try {
      console.log('🎤 Initializing ElevenLabs with Maya/Aunt Annie + Emily voices');
      console.log(`   Maya/Aunt Annie: ${VOICE_CONFIG.elevenlabs.voices.maya}`);
      console.log(`   Emily (default): ${VOICE_CONFIG.elevenlabs.voices.emily}`);
      
      // Select storage based on environment
      const storage = process.env.AUDIO_BUCKET 
        ? new S3AudioStorage()
        : new LocalAudioStorage();
      
      const rawVoice = new ElevenLabsVoice({
        apiKey: VOICE_CONFIG.elevenlabs.apiKey || 'fallback-key',
        baseUrl: VOICE_CONFIG.elevenlabs.baseUrl,
        defaultVoiceId: VOICE_CONFIG.elevenlabs.voices.default,
        model: VOICE_CONFIG.elevenlabs.model,
        outputFormat: VOICE_CONFIG.elevenlabs.outputFormat,
        storage
      });
      
      // Wrap with memoization (30 minute cache)
      baseVoice = new VoiceMemo(rawVoice, 30 * 60 * 1000);
      
      console.log(`   Storage: ${process.env.AUDIO_BUCKET ? 'S3/CDN' : 'Local'}`);
      console.log('   Memoization: 30 minutes');
    } catch (error) {
      console.warn('⚠️  ElevenLabs initialization failed, falling back to stub voice:');
      console.warn(`   Error: ${error.message}`);
      baseVoice = new StubVoice();
    }
  }
  
  const sseHub = new SseHub();
  const voiceQueue = new VoiceQueue(baseVoice, sseHub);

  // Security guards
  const voiceGuards = new VoiceGuards();
  
  // Bind infrastructure services first
  bind(TOKENS.Memory, memory);
  bind(TOKENS.Analytics, analytics);
  bind(TOKENS.Cache, cache);
  bind(TOKENS.Voice, baseVoice);
  bind(TOKENS.SSE_HUB, sseHub);
  bind(TOKENS.VOICE_QUEUE, voiceQueue);
  bind(TOKENS.VOICE_GUARDS, voiceGuards);

  // Wire orchestrator based on canary flags
  const hdr = opts?.requestHeaders?.get('x-experiment-spiralogic');
  const useSpiralogic = (process.env.ORCHESTRATOR === 'spiralogic') || (hdr === 'on');
  
  if (useSpiralogic) {
    logger.info('🧠 Wiring Spiralogic orchestrator (canary mode)');
    wireSpiralogic();
  } else {
    logger.info('🔧 Wiring baseline orchestrator');
    wireBaseline();
  }

  // Wire OnboardingCeremony service
  const ceremony = new OnboardingCeremony();
  bind(TOKENS.ONBOARDING_CEREMONY, ceremony);

  // Wire API facade last
  const orchestrator = get(TOKENS.Orchestrator) as IOrchestrator;
  const api = new ConsciousnessAPI(orchestrator, memory, analytics);
  bind(TOKENS.API, api);
}