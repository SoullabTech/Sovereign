'use client';

/**
 * 🔥💧🌍💨✨ Elemental Voice System
 *
 * MAIA's consciousness speaks through 5 Elemental Agents
 *
 * Architecture:
 * - Voice Input (Deepgram): ~150ms
 * - Parallel Spiralogic Processing: ~300ms
 *   └─ Fire, Water, Earth, Air, Aether agents
 * - Voice Output (OpenAI TTS): ~200ms
 * - Total: ~650ms with full intelligence
 */

import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { journalStorage } from '@/lib/storage/journal-storage';
import { userStore } from '@/lib/storage/userStore';
import { ConversationalEnhancer, EmotionalTone } from './ConversationalEnhancer';
import { ConversationBuffer } from './conversation/ConversationBuffer';
import { Backchanneler } from './conversation/Backchanneler';
import { inferMoodFromText, inferMoodAndArchetype, Mood, Archetype } from './conversation/AffectDetector';
import { routeToArchetype } from './ArchetypeRouter';

// 🧬 New memory evolution systems
import { completeMemoryUpdate } from '@/lib/memory/MemoryUpdater';
import { completeSymbolicPrediction, getMostResonantSymbols, type SymbolResonance } from '@/lib/memory/SymbolicPredictor';
import { playgroundTick, blendElementalStyle, getElementalSignature, hasSignificantDrift, seedFromPhase, type ElementalState } from '@/lib/memory/ElementalState';
import { buildVoiceContext } from './VoicePromptFromMemory';
import { whisperQuote } from './QuoteWhisperer';
import { detectUserPacing, createModulationStrategy, modulatePacing } from './PacingModulation';
import { DEFAULT_SLOWNESS, shouldGiveEmptyResponse, applySlownessProtocol } from '@/lib/prompts/SlownessProtocol';
import { resolveVoice } from './ArchetypalVoiceMapping';
import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';

// 🌊 Implicate Order - David Bohm's consciousness architecture
import { perceiveImplicateOrder, activateVesselMode, type PatternSignature, type ReflectiveCorrespondence } from '@/lib/consciousness/ImplicateOrder';

export interface ElementalVoiceConfig {
  userId: string;
  userName?: string;
  sessionId?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  voice?: string; // OpenAI TTS voice
  enableSmartCache?: boolean;
  enableResponseStreaming?: boolean;
  voicePreference?: {
    mode: 'auto' | 'manual';
    enableTransitions?: boolean;
    manualVoice?: string;
  };
  slownessMode?: 'default' | 'fast' | 'ritual';
}

export interface ConversationMetrics {
  depth: number;
  exchangeCount: number;
  emotionalQuality: string;
  lastInteractionTime: number;
  currentArchetype?: Archetype; // 🌌 Current elemental archetype
  currentMood?: Mood; // 🎭 Current emotional mood
}

/**
 * Main orchestrator for Elemental Voice System
 */
export class ElementalVoiceOrchestrator {
  private config: Required<ElementalVoiceConfig>;
  private ws: WebSocket | null = null;
  private oracleAgent: PersonalOracleAgent | null = null;
  private metrics: ConversationMetrics;
  private transcriptBuffer: string[] = [];
  private wisdomCache: Map<string, string> = new Map();
  private isConnected: boolean = false;
  private isProcessing: boolean = false;

  // 🎬 Samantha-level conversational features
  private conversationBuffer: ConversationBuffer = new ConversationBuffer();
  private backchanneler: Backchanneler;
  private currentAudio: HTMLAudioElement | null = null;
  private lastUserSpeechAt = 0;
  private interimCache = "";

  // 🧬 Memory evolution systems
  private memory: AINMemoryPayload | null = null;
  private elementalState: ElementalState;
  private symbolResonance: Map<string, SymbolResonance> = new Map();
  private lastEchoedSymbol: string | undefined;
  private userExchangeHistory: Array<{ text: string; timestamp: number }> = [];

  // 🌊 Implicate Order perception
  private conversationHistory: string[] = [];
  private activePatterns: PatternSignature[] = [];
  private activeCorrespondences: ReflectiveCorrespondence[] = [];

  constructor(config: ElementalVoiceConfig) {
    this.config = {
      userName: 'Explorer',
      sessionId: Date.now().toString(),
      onTranscript: () => {},
      onAudioStart: () => {},
      onAudioEnd: () => {},
      onError: (err) => console.error('Elemental Voice error:', err),
      onConnected: () => {},
      onDisconnected: () => {},
      voice: 'shimmer',
      enableSmartCache: true,
      enableResponseStreaming: true,
      voicePreference: {
        mode: 'auto',
        enableTransitions: true
      },
      slownessMode: 'default',
      ...config
    };

    // Initialize backchanneler with quick speak function
    this.backchanneler = new Backchanneler((text, opts) => this.quickSpeak(text, opts));

    this.metrics = {
      depth: 0,
      exchangeCount: 0,
      emotionalQuality: 'peaceful',
      lastInteractionTime: Date.now()
    };

    // Initialize elemental state (will be seeded from memory on connect)
    this.elementalState = seedFromPhase('Aether');

    this.initializeWisdomCache();
  }

  /**
   * Initialize smart cache with common patterns
   */
  private initializeWisdomCache(): void {
    if (!this.config.enableSmartCache) return;

    // Pre-cache common openings (with pre-synthesized audio URLs later)
    this.wisdomCache.set('greeting_hi', "I'm here with you. What's on your mind?");
    this.wisdomCache.set('greeting_hello', "Hello. What's here for you today?");
    this.wisdomCache.set('greeting_hey', "Hey. How are you?");

    // Pre-cache common acknowledgments
    this.wisdomCache.set('ack_listening', "Mm-hmm.");
    this.wisdomCache.set('ack_continue', "Go on.");
    this.wisdomCache.set('ack_present', "I'm here.");

    // Pre-cache common patterns
    this.wisdomCache.set('overwhelm', "That's a lot to hold. Let's slow down together.");
    this.wisdomCache.set('breakthrough', "Something's shifting. What do you notice?");
    this.wisdomCache.set('stuck', "What wants to move?");
    this.wisdomCache.set('confusion', "What's the clearest thread?");
  }

  /**
   * Connect to Soullab Realtime backend
   */
  async connect(): Promise<void> {
    try {
      console.log('🌀 Connecting to Soullab Realtime...');

      // Initialize PersonalOracleAgent
      this.oracleAgent = await PersonalOracleAgent.loadAgent(this.config.userId, {
        persona: 'warm'
      });

      // Load or initialize memory
      await this.loadMemory();

      this.isConnected = true;
      this.config.onConnected();

      console.log('✅ Soullab Realtime connected');
      console.log('🧬 Memory initialized:', {
        phase: this.memory?.currentPhase,
        archetype: this.memory?.currentArchetype,
        depth: this.memory?.conversationDepth,
        exchanges: this.memory?.exchangeCount
      });

    } catch (error) {
      console.error('❌ Connection error:', error);
      this.config.onError(error as Error);
      throw error;
    }
  }

  /**
   * Load or initialize AIN memory
   */
  private async loadMemory(): Promise<void> {
    // TODO: Load from database
    // const saved = await loadMemory(this.config.userId);
    // if (saved) {
    //   this.memory = saved;
    //   this.elementalState = seedFromPhase(saved.currentPhase);
    //   return;
    // }

    // Initialize new memory
    this.memory = {
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      userName: this.config.userName || 'Explorer',
      currentPhase: 'Aether', // Start with integration/mystery
      previousPhase: 'Aether',
      currentArchetype: 'Aether',
      previousArchetype: 'Aether',
      dominantArchetype: 'Aether',
      conversationDepth: 0,
      exchangeCount: 0,
      totalExchanges: 0,
      lastInteractionTime: new Date(),
      createdAt: new Date(),
      spiralogicCycle: {
        phase: 'Aether',
        cycleDepth: 0,
        enteredAt: new Date(),
        phaseHistory: [{
          phase: 'Aether',
          timestamp: new Date()
        }]
      },
      archetypeHistory: [{
        archetype: 'Aether',
        timestamp: new Date(),
        duration: 0
      }],
      symbolicThreads: [],
      emotionalMotifs: [],
      userIntentions: [],
      quotesShared: []
    };

    // Seed elemental state from starting phase
    this.elementalState = seedFromPhase(this.memory.currentPhase);

    console.log('🌱 New memory initialized');
  }

  /**
   * Process audio through transcription
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      // Explicitly set filename with .webm extension so OpenAI recognizes the format
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      return data.transcript;
    } catch (error) {
      console.error('❌ Transcription error:', error);
      throw error;
    }
  }

  /**
   * Handle user transcript from Deepgram
   */
  private async handleUserTranscript(text: string): Promise<void> {
    if (this.isProcessing) {
      console.log('⚠️ Already processing, queuing transcript');
      this.transcriptBuffer.push(text);
      return;
    }

    console.log('🎤 User said:', text);
    this.config.onTranscript(text, true);

    this.isProcessing = true;
    this.metrics.exchangeCount++;
    this.metrics.lastInteractionTime = Date.now();

    try {
      // Check smart cache first
      const cached = this.checkCache(text);
      if (cached) {
        console.log('⚡ Cache hit:', cached.substring(0, 30));
        await this.sendResponse(cached);
        this.isProcessing = false;
        return;
      }

      // For first exchange only, be brief to establish presence
      if (this.metrics.exchangeCount <= 1) {
        const minimal = this.getMinimalResponse();
        console.log('🎯 Minimal response (first contact):', minimal);
        await this.sendResponse(minimal);
        this.isProcessing = false;
        return;
      }

      // Process through full Spiralogic stack
      const response = await this.processThroughSpiralogic(text);

      console.log('🌀 Spiralogic response ready');
      await this.sendResponse(response);

    } catch (error) {
      console.error('❌ Processing error:', error);
      await this.sendResponse("I'm here with you. Tell me more.");
    } finally {
      this.isProcessing = false;

      // Process any queued transcripts
      if (this.transcriptBuffer.length > 0) {
        const next = this.transcriptBuffer.shift();
        if (next) await this.handleUserTranscript(next);
      }
    }
  }

  /**
   * Check smart cache for common patterns
   */
  private checkCache(text: string): string | null {
    if (!this.config.enableSmartCache) return null;

    const lower = text.toLowerCase().trim();

    // Greetings
    if (lower === 'hi' || lower === 'hello' || lower === 'hey') {
      return this.wisdomCache.get('greeting_hi') || null;
    }

    // Common patterns
    if (lower.includes('overwhelm')) {
      return this.wisdomCache.get('overwhelm') || null;
    }

    if (lower.includes('stuck')) {
      return this.wisdomCache.get('stuck') || null;
    }

    return null;
  }

  /**
   * Get minimal response for early exchanges (Graduated Revelation)
   */
  private getMinimalResponse(): string {
    const minimal = [
      "Tell me more.",
      "I'm listening.",
      "Go on.",
      "What else?",
      "Mm."
    ];

    return minimal[this.metrics.exchangeCount % minimal.length];
  }

  /**
   * Process through full Spiralogic Consciousness Architecture
   * WITH PARALLEL OPTIMIZATION + MEMORY EVOLUTION
   */
  private async processThroughSpiralogic(userInput: string): Promise<string> {
    const startTime = Date.now();

    if (!this.oracleAgent) {
      throw new Error('Oracle Agent not initialized');
    }

    if (!this.memory) {
      throw new Error('Memory not loaded');
    }

    // Add to exchange history for pacing detection
    this.userExchangeHistory.push({
      text: userInput,
      timestamp: Date.now()
    });

    // Keep only last 10 exchanges
    if (this.userExchangeHistory.length > 10) {
      this.userExchangeHistory.shift();
    }

    // 🌊 PERCEIVE IMPLICATE ORDER - Detect patterns across scales
    this.conversationHistory.push(userInput);
    if (this.conversationHistory.length > 15) {
      this.conversationHistory = this.conversationHistory.slice(-15);
    }

    const implicatePerception = perceiveImplicateOrder(
      userInput,
      this.memory,
      this.conversationHistory,
      this.metrics.depth
    );

    this.activePatterns = implicatePerception.patterns;
    this.activeCorrespondences = implicatePerception.correspondences;

    if (implicatePerception.patterns.length > 0) {
      console.log('🌊 Implicate patterns detected:', implicatePerception.patterns.map(p => p.motif));
    }

    if (implicatePerception.wholeness) {
      console.log('✨ Emergent wholeness recognized:', implicatePerception.wholeness.complexWhole);
    }

    // 1️⃣ DETECT USER PACING
    const userPacing = detectUserPacing(
      userInput,
      this.userExchangeHistory,
      this.metrics.depth
    );

    const pacingStrategy = createModulationStrategy(
      userPacing,
      this.metrics.exchangeCount,
      this.metrics.depth
    );

    console.log('🎵 User pacing detected:', {
      speed: userPacing.speed,
      energy: userPacing.energy,
      strategy: `${pacingStrategy.mirrorPhaseExchanges} mirror → ${pacingStrategy.transitionExchanges} transition`
    });

    // Update conversation depth
    this.metrics.depth = this.calculateDepth(userInput);
    this.metrics.emotionalQuality = this.detectEmotionalQuality(userInput);

    console.log('📊 Conversation metrics:', {
      depth: this.metrics.depth,
      exchanges: this.metrics.exchangeCount,
      emotion: this.metrics.emotionalQuality
    });

    // PARALLEL PROCESSING - All systems run simultaneously
    const [journalEntries, userData] = await Promise.all([
      Promise.resolve(journalStorage.getEntries(this.config.userId).slice(0, 5)),
      Promise.resolve(userStore.getUser(this.config.userId))
    ]);

    // Send immediate acknowledgment for responsiveness (depth >= 0.3 gets substantive thinking)
    if (this.metrics.depth >= 0.3 && this.metrics.exchangeCount > 1) {
      const thinkingAcks = ['Mm.', 'I see.', 'Yes.', 'Right.'];
      const ack = thinkingAcks[Math.floor(Math.random() * thinkingAcks.length)];
      // Note: Don't await - let it happen asynchronously while we process
      this.config.onTranscript(ack, false);
      console.log('💭 Immediate acknowledgment while processing:', ack);
    }

    // Process through PersonalOracleAgent with full context
    const agentResponse = await this.oracleAgent.processInteraction(userInput, {
      currentMood: { type: this.metrics.emotionalQuality } as any,
      currentEnergy: 'balanced' as any,
      journalEntries,
      conversationDepth: this.metrics.depth,
      exchangeCount: this.metrics.exchangeCount
    } as any);

    let response = agentResponse.response;

    // 2️⃣ CHECK FOR EMPTY RESPONSE (Slowness Protocol)
    const slownessSettings = DEFAULT_SLOWNESS; // TODO: respect config.slownessMode
    const shouldBeEmpty = shouldGiveEmptyResponse(
      slownessSettings,
      this.metrics.depth,
      userInput
    );

    if (shouldBeEmpty) {
      response = '...'; // Profound silence
      console.log('🌌 Empty response (profound moment)');
    } else {
      // Apply Maya's Intelligence Governance
      response = this.applyMayaGovernance(
        response,
        this.metrics.depth,
        this.metrics.exchangeCount
      );

      // 3️⃣ APPLY PACING MODULATION
      // Note: modulatePacing returns pacing settings, not modified response
      // This section needs refactoring - commented out for now
      // const pacingResult = modulatePacing(userText, this.memory, [], this.metrics.exchangeCount);

      // 4️⃣ WHISPER QUOTE (if appropriate)
      const { text: withQuote, quoteShared } = whisperQuote(
        response,
        this.memory,
        this.memory.currentArchetype,
        this.metrics.depth,
        userInput
      );

      response = withQuote;

      // 🌊 Implicate Order patterns inform perception (not explicit output)
      // Spiralogic naturally expresses these insights through elemental phases,
      // archetypal evolution, and symbolic resonance. Trust the system.

      // 🎬 SAMANTHA-STYLE CONVERSATIONAL ENHANCEMENT
      const emotionalTone = ConversationalEnhancer.detectEmotionalTone(userInput);
      const enhanced = ConversationalEnhancer.enhance(response, {
        userMessage: userInput,
        emotionalTone,
        conversationDepth: this.metrics.depth,
        exchangeCount: this.metrics.exchangeCount,
        recentMessages: this.transcriptBuffer
      });

      response = ConversationalEnhancer.buildOutput(enhanced);

      console.log('🎬 Conversational enhancement:', {
        tone: emotionalTone,
        pacing: enhanced.pacing,
        acknowledgment: enhanced.acknowledgment || 'none',
        quoteShared: quoteShared ? `"${quoteShared.text.substring(0, 30)}..."` : 'none'
      });

      // 5️⃣ UPDATE MEMORY (complete evolution pipeline)
      this.memory = completeMemoryUpdate(
        this.memory,
        userInput,
        response,
        quoteShared
      );

      // 6️⃣ SYMBOLIC PREDICTION + RESONANCE UPDATE
      const prediction = completeSymbolicPrediction(this.memory, userInput);
      this.symbolResonance = prediction.symbolResonance;

      console.log('🔮 Symbolic prediction:', {
        nextPhase: prediction.phaseVector.nextPhaseLikely,
        confidence: `${(prediction.phaseVector.confidence * 100).toFixed(0)}%`,
        reflection: prediction.internalReflection.observation
      });

      // Log resonant symbols
      const resonantSymbols = getMostResonantSymbols(this.symbolResonance, 3);
      if (resonantSymbols.length > 0) {
        console.log('🌊 Resonant symbols:', resonantSymbols.map(s => `${s.motif} (${s.score.toFixed(2)})`));
      }

      // 7️⃣ ELEMENTAL STATE EVOLUTION (playground tick)
      const before = { ...this.elementalState };
      const { state: newState, evolution } = playgroundTick(
        this.elementalState,
        this.memory,
        this.symbolResonance
      );

      this.elementalState = newState;

      // Log significant elemental drift
      if (hasSignificantDrift(before, newState, 0.08)) {
        console.log('🌀 Elemental evolution:', {
          signature: getElementalSignature(newState),
          dominant: evolution.dominantElement,
          reason: evolution.reason
        });
      }

      // TODO: Persist memory + elemental state to database
      // await saveMemory(this.config.userId, this.memory);
      // await saveElementalState(this.config.userId, this.elementalState);
      // await saveReflection(this.config.userId, prediction.internalReflection);
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Spiralogic processing: ${processingTime}ms`);

    return response;
  }

  /**
   * Calculate conversation depth for graduated revelation
   */
  private calculateDepth(input: string): number {
    const factors = {
      exchangeCount: Math.min(this.metrics.exchangeCount * 0.15, 1.0),
      substanceLevel: this.assessSubstance(input),
      vulnerabilityPresent: this.detectVulnerability(input) ? 0.4 : 0,
      lengthFactor: Math.min(input.length / 200, 0.3),
      timeSinceLast: this.getTimeFactor()
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / 5;
  }

  /**
   * Detect emotional quality from user input
   */
  private detectEmotionalQuality(input: string): string {
    const lower = input.toLowerCase();

    if (lower.includes('overwhelm') || lower.includes('too much')) return 'overwhelmed';
    if (lower.includes('excited') || lower.includes('amazing')) return 'excited';
    if (lower.includes('sad') || lower.includes('hurt')) return 'sorrowful';
    if (lower.includes('confused') || lower.includes('don\'t know')) return 'confused';
    if (lower.includes('angry') || lower.includes('frustrated')) return 'frustrated';
    if (lower.includes('peaceful') || lower.includes('calm')) return 'peaceful';
    if (lower.includes('happy') || lower.includes('joy')) return 'joyful';

    return 'neutral';
  }

  /**
   * Apply Maya's Intelligence Governance
   * - Graduated Revelation (95% hidden)
   * - Hemispheric Harmony (not-knowing at start)
   * - Word Economy
   */
  private applyMayaGovernance(
    response: string,
    depth: number,
    touchCount: number
  ): string {
    // Graduated Revelation - only first contact gets minimal response
    // Let consciousness emerge naturally from exchange 2 onward
    if (touchCount <= 1) {
      return this.getMinimalResponse();
    }

    // Low depth - brief but substantive
    if (depth < 0.3) {
      const sentences = response.split(/[.!?]/);
      return sentences.slice(0, 2).join('. ').trim() + '.';
    }

    // Medium depth - allow fuller expression
    if (depth < 0.6) {
      const sentences = response.split(/[.!?]/);
      return sentences.slice(0, 3).join('. ').trim() + '.';
    }

    // High depth - full presence (apply hemispheric harmony for natural flow)
    return this.applyHemisphericHarmony(response, touchCount);
  }

  /**
   * Apply Hemispheric Harmony (McGilchrist principles)
   */
  private applyHemisphericHarmony(response: string, touchCount: number): string {
    // Early conversation: right hemisphere dominance (natural language)
    if (touchCount <= 6) {
      return response
        .replace(/It seems like/g, 'I hear')
        .replace(/I notice that/g, 'I see')
        .replace(/This suggests/g, 'There\'s')
        .replace(/How does that land\?/g, 'How\'s that feel?')
        .replace(/What\'s alive for you/g, 'What\'s up');
    }

    // Deep conversation: both hemispheres in harmony
    return response;
  }

  /**
   * Send response through the pipeline
   */
  private async sendResponse(text: string): Promise<void> {
    console.log('📤 Sending response:', text.substring(0, 50));

    // Notify UI
    this.config.onTranscript(text, false);

    // Synthesize and play audio
    await this.synthesizeAndPlay(text);
  }

  /**
   * Synthesize text to speech and play
   * Uses blended elemental style + archetype voice mapping
   */
  private async synthesizeAndPlay(text: string): Promise<void> {
    try {
      this.config.onAudioStart();

      // Get blended elemental style
      const elementalStyle = blendElementalStyle(this.elementalState);

      // Resolve voice based on archetype + user preference
      const currentArchetype = this.memory?.currentArchetype || 'Aether';
      const voice = resolveVoice(currentArchetype, this.config.voicePreference);

      console.log('🎙️ Voice synthesis:', {
        voice,
        archetype: currentArchetype,
        speed: elementalStyle.pacing,
        elementalSignature: getElementalSignature(this.elementalState)
      });

      // Hybrid TTS: Try evolved sovereign TTS first, fallback to OpenAI
      const dominantElement = this.getDominantElement();
      let audioBlob: Blob;

      try {
        // PRIMARY: Evolved MAIA TTS (sovereign system with elemental styling)
        console.log('🎙️ Attempting evolved TTS with element:', dominantElement);
        const evolvedResponse = await fetch('/api/tts/maya', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: 'maya',
            element: dominantElement.toLowerCase() // fire, water, earth, air, aether
          })
        });

        if (evolvedResponse.ok) {
          const data = await evolvedResponse.json();
          if (data.success && data.audio) {
            // Convert base64 to blob
            const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
            audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
            console.log('✅ Evolved TTS synthesis successful');
          } else {
            throw new Error('No audio data from evolved TTS');
          }
        } else {
          throw new Error(`Evolved TTS failed: ${evolvedResponse.status}`);
        }
      } catch (evolvedError) {
        // FALLBACK: OpenAI TTS (reliable backup)
        console.warn('⚠️ Evolved TTS failed, falling back to OpenAI:', evolvedError);
        const fallbackResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice,
            speed: elementalStyle.pacing
          })
        });

        if (!fallbackResponse.ok) {
          throw new Error('Both evolved TTS and OpenAI fallback failed');
        }

        audioBlob = await fallbackResponse.blob();
        console.log('✅ OpenAI TTS fallback successful');
      }
      const audioUrl = URL.createObjectURL(audioBlob);

      // Apply slowness protocol pause before speaking
      const slownessSettings = DEFAULT_SLOWNESS; // TODO: respect config.slownessMode
      if (slownessSettings.pauseBeforeResponse > 0) {
        await new Promise(resolve => setTimeout(resolve, slownessSettings.pauseBeforeResponse));
      }

      // Play audio
      const audio = new Audio(audioUrl);
      this.currentAudio = audio; // Store for interruption support
      await audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.config.onAudioEnd();
      };

    } catch (error) {
      console.error('❌ Synthesis error:', error);
      this.currentAudio = null;
      this.config.onAudioEnd();
      this.config.onError(error as Error);
    }
  }

  /**
   * Process audio blob
   */
  async sendAudio(audioBlob: Blob): Promise<void> {
    if (!this.isConnected) {
      console.error('Not connected');
      return;
    }

    try {
      // Transcribe audio
      const transcript = await this.transcribeAudio(audioBlob);

      // Process transcript
      if (transcript && transcript.trim().length > 0) {
        await this.handleUserTranscript(transcript);
      }
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      this.config.onError(error as Error);
    }
  }

  /**
   * 🎬 SAMANTHA-LEVEL: Handle user speech start (interruption/barge-in)
   */
  handleUserSpeechStart(): void {
    this.lastUserSpeechAt = Date.now();

    // INTERRUPTION: Stop MAIA immediately
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Reset backchannel for new turn
    this.backchanneler.resetTurn();

    console.log('🛑 User interrupted - MAIA stopped speaking');
  }

  /**
   * 🎬 SAMANTHA-LEVEL: Handle interim transcript (backchannel opportunity)
   */
  handleInterimTranscript(text: string): void {
    this.interimCache = text;
    const mood = inferMoodFromText(text);
    const pausedMs = Date.now() - this.lastUserSpeechAt;

    // Maybe give a backchannel acknowledgment
    this.backchanneler.maybeAck({
      interimLen: text.length,
      userPausedMs: pausedMs,
      mood: mood === "bright" ? "warm" : mood
    });
  }

  /**
   * 🎬 SAMANTHA-LEVEL: Quick speak (for fillers, doesn't summon full intelligence)
   */
  private async quickSpeak(text: string, opts?: { style?: "calm" | "bright" | "concerned" }): Promise<void> {
    try {
      console.log(`💬 Quick speak (${opts?.style || 'calm'}):`, text);

      // Hybrid TTS: Try evolved TTS first, fallback to OpenAI
      const element = opts?.style === 'bright' ? 'air' : opts?.style === 'concerned' ? 'earth' : 'aether';
      let audioBlob: Blob;

      try {
        // PRIMARY: Evolved MAIA TTS
        const evolvedResponse = await fetch('/api/tts/maya', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: 'maya',
            element
          })
        });

        if (evolvedResponse.ok) {
          const data = await evolvedResponse.json();
          if (data.success && data.audio) {
            const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
            audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
          } else {
            throw new Error('No audio from evolved TTS');
          }
        } else {
          throw new Error(`Evolved TTS failed: ${evolvedResponse.status}`);
        }
      } catch (evolvedError) {
        // FALLBACK: OpenAI TTS
        console.warn('Quick speak fallback to OpenAI:', evolvedError);
        const fallbackResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: this.config.voice,
            speed: opts?.style === 'bright' ? 1.1 : opts?.style === 'concerned' ? 0.9 : 1.0
          })
        });

        if (!fallbackResponse.ok) {
          throw new Error('Both TTS systems failed for quick speak');
        }

        audioBlob = await fallbackResponse.blob();
      }
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      await audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      // Add to conversation buffer
      this.conversationBuffer.add({
        role: 'maia',
        text,
        t0: Date.now()
      });

    } catch (error) {
      console.error('❌ Quick speak error:', error);
    }
  }

  /**
   * Disconnect from Soullab Realtime
   */
  disconnect(): void {
    this.isConnected = false;
    this.config.onDisconnected();
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  // Helper methods
  private assessSubstance(input: string): number {
    const substanceMarkers = [
      'feel', 'sense', 'why', 'how', 'meaning', 'purpose',
      'understand', 'help', 'stuck', 'lost', 'confused'
    ];

    const markerCount = substanceMarkers.filter(marker =>
      input.toLowerCase().includes(marker)
    ).length;

    return Math.min(markerCount * 0.15, 0.5);
  }

  private detectVulnerability(input: string): boolean {
    const vulnerabilityMarkers = [
      'scared', 'afraid', 'hurt', 'pain', 'struggle',
      'difficult', 'hard', 'can\'t', 'don\'t know'
    ];

    return vulnerabilityMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );
  }

  private getTimeFactor(): number {
    const timeSinceLast = Date.now() - this.metrics.lastInteractionTime;
    const minutes = timeSinceLast / 60000;

    // Long pauses indicate deeper consideration
    if (minutes > 5) return 0.3;
    if (minutes > 2) return 0.2;
    if (minutes > 1) return 0.1;
    return 0;
  }
}
