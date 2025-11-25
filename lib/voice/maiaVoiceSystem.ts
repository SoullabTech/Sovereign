/**
 * MAIA Voice System V3 - Consciousness-Aware Speech Interface
 *
 * This system provides sophisticated voice interaction that adapts to MAIA's current
 * consciousness state, with mode-aware speech synthesis and intelligent transcription.
 */

import { HoloflowerState, ConversationContext } from '@/lib/holoflower/holoflowerStateMachine';

// Enhanced Voice Activity Detection
export interface VoiceActivityState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  voiceLevel: number; // 0-1
  confidence: number; // 0-1
  duration: number; // milliseconds
  lastActivity: number; // timestamp
}

// Consciousness-aware speech configuration
export interface MAIASpeechConfig {
  mode: 'dialogue' | 'patient' | 'scribe' | 'aether';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  shimmer?: string;

  // Voice characteristics
  rate: number; // 0.1-10
  pitch: number; // 0-2
  volume: number; // 0-1

  // Consciousness modifiers
  breathiness: number; // 0-1
  warmth: number; // 0-1
  clarity: number; // 0-1
}

// Transcription with consciousness context
export interface MAIATranscription {
  text: string;
  confidence: number;
  timestamp: number;
  emotionalTone?: 'excited' | 'contemplative' | 'vulnerable' | 'analytical' | 'grateful';
  cognitiveState?: 'creative' | 'analytical' | 'emotional' | 'intuitive' | 'integrative';
  processingType?: 'breakthrough' | 'depth-work' | 'structuring' | 'clarifying' | 'transcending';
  silenceBefore?: number; // milliseconds of silence before speaking
  silenceAfter?: number; // milliseconds of silence after speaking
}

/**
 * Main MAIA Voice System Class
 */
export class MAIAVoiceSystem {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;
  private voiceAnalyzer: AnalyserNode | null = null;

  private isInitialized = false;
  private voiceActivityState: VoiceActivityState = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    voiceLevel: 0,
    confidence: 0,
    duration: 0,
    lastActivity: 0
  };

  private currentConfig: MAIASpeechConfig = {
    mode: 'dialogue',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    breathiness: 0.3,
    warmth: 0.7,
    clarity: 0.8
  };

  private transcriptionCallbacks: Set<(transcription: MAIATranscription) => void> = new Set();
  private voiceActivityCallbacks: Set<(state: VoiceActivityState) => void> = new Set();
  private errorCallbacks: Set<(error: Error) => void> = new Set();

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize the voice system
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Set up voice activity detection
      this.setupVoiceActivityDetection();

      this.isInitialized = true;
      return true;
    } catch (error) {
      this.notifyError(new Error(`Failed to initialize voice system: ${error}`));
      return false;
    }
  }

  /**
   * Update voice system based on consciousness state
   */
  updateConsciousnessState(state: HoloflowerState): void {
    const newConfig: MAIASpeechConfig = {
      mode: state.mode,
      element: state.element,
      shimmer: state.shimmer || undefined,
      ...this.calculateVoiceCharacteristics(state)
    };

    this.currentConfig = newConfig;
    this.applySpeechConfiguration();
  }

  /**
   * Start listening for voice input
   */
  startListening(): void {
    if (!this.isInitialized || !this.speechRecognition) {
      this.notifyError(new Error('Voice system not initialized'));
      return;
    }

    try {
      this.speechRecognition.start();
      this.voiceActivityState.isListening = true;
      this.notifyVoiceActivityChange();
    } catch (error) {
      this.notifyError(new Error(`Failed to start listening: ${error}`));
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.voiceActivityState.isListening = false;
      this.notifyVoiceActivityChange();
    }
  }

  /**
   * Speak text with consciousness-aware voice
   */
  async speak(text: string, context?: ConversationContext): Promise<void> {
    if (!this.speechSynthesis) {
      this.notifyError(new Error('Speech synthesis not available'));
      return;
    }

    // Create enhanced speech with consciousness modulation
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply consciousness-based voice configuration
    this.applyConsciousnessToUtterance(utterance, context);

    // Set up event handlers
    utterance.onstart = () => {
      this.voiceActivityState.isSpeaking = true;
      this.notifyVoiceActivityChange();
    };

    utterance.onend = () => {
      this.voiceActivityState.isSpeaking = false;
      this.notifyVoiceActivityChange();
    };

    utterance.onerror = (event) => {
      this.voiceActivityState.isSpeaking = false;
      this.notifyError(new Error(`Speech synthesis error: ${event.error}`));
    };

    // Speak with consciousness awareness
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Get current voice activity state
   */
  getVoiceActivityState(): VoiceActivityState {
    return { ...this.voiceActivityState };
  }

  /**
   * Subscribe to transcription events
   */
  onTranscription(callback: (transcription: MAIATranscription) => void): () => void {
    this.transcriptionCallbacks.add(callback);
    return () => this.transcriptionCallbacks.delete(callback);
  }

  /**
   * Subscribe to voice activity events
   */
  onVoiceActivity(callback: (state: VoiceActivityState) => void): () => void {
    this.voiceActivityCallbacks.add(callback);
    return () => this.voiceActivityCallbacks.delete(callback);
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose(): void {
    this.stopListening();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.transcriptionCallbacks.clear();
    this.voiceActivityCallbacks.clear();
    this.errorCallbacks.clear();

    this.isInitialized = false;
  }

  // Private methods

  private initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.notifyError(new Error('Speech recognition not supported'));
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'en-US';

    // Set up recognition event handlers
    this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleSpeechRecognitionResult(event);
    };

    this.speechRecognition.onerror = (event: any) => {
      this.notifyError(new Error(`Speech recognition error: ${event.error}`));
    };

    this.speechRecognition.onend = () => {
      this.voiceActivityState.isListening = false;
      this.notifyVoiceActivityChange();
    };
  }

  private setupVoiceActivityDetection(): void {
    if (!this.audioContext || !this.mediaStream) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.voiceAnalyzer = this.audioContext.createAnalyser();
    this.voiceAnalyzer.fftSize = 256;

    source.connect(this.voiceAnalyzer);

    // Start voice level monitoring
    this.monitorVoiceLevel();
  }

  private monitorVoiceLevel(): void {
    if (!this.voiceAnalyzer) return;

    const bufferLength = this.voiceAnalyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVoiceLevel = () => {
      this.voiceAnalyzer!.getByteFrequencyData(dataArray);

      // Calculate RMS (Root Mean Square) for voice level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const voiceLevel = rms / 128; // Normalize to 0-1

      // Update voice activity state
      this.voiceActivityState.voiceLevel = voiceLevel;
      this.voiceActivityState.lastActivity = Date.now();

      if (voiceLevel > 0.1) { // Voice threshold
        this.voiceActivityState.duration = Date.now() - this.voiceActivityState.lastActivity;
      }

      this.notifyVoiceActivityChange();
      requestAnimationFrame(updateVoiceLevel);
    };

    updateVoiceLevel();
  }

  private handleSpeechRecognitionResult(event: SpeechRecognitionEvent): void {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      const transcription: MAIATranscription = {
        text: finalTranscript,
        confidence: event.results[event.results.length - 1][0].confidence,
        timestamp: Date.now(),
        ...this.analyzeTranscriptionContext(finalTranscript)
      };

      this.notifyTranscription(transcription);
    }
  }

  private calculateVoiceCharacteristics(state: HoloflowerState): Partial<MAIASpeechConfig> {
    const modeCharacteristics = {
      dialogue: { rate: 1.0, pitch: 1.0, breathiness: 0.3, warmth: 0.7, clarity: 0.8 },
      patient: { rate: 0.8, pitch: 0.9, breathiness: 0.5, warmth: 0.9, clarity: 0.7 },
      scribe: { rate: 1.1, pitch: 1.1, breathiness: 0.1, warmth: 0.4, clarity: 0.9 },
      aether: { rate: 0.7, pitch: 0.8, breathiness: 0.7, warmth: 0.6, clarity: 0.6 }
    };

    const elementModifiers = {
      fire: { rate: 1.2, pitch: 1.1 },
      water: { rate: 0.9, pitch: 0.9 },
      earth: { rate: 0.8, pitch: 0.95 },
      air: { rate: 1.1, pitch: 1.05 },
      aether: { rate: 0.85, pitch: 0.85 }
    };

    const base = modeCharacteristics[state.mode];
    const elementMod = elementModifiers[state.element];

    return {
      rate: base.rate * elementMod.rate * (0.8 + state.intensity * 0.4),
      pitch: base.pitch * elementMod.pitch * (0.9 + state.coherence * 0.2),
      volume: 0.7 + state.intensity * 0.3,
      breathiness: base.breathiness,
      warmth: base.warmth,
      clarity: base.clarity * state.coherence
    };
  }

  private applyConsciousnessToUtterance(utterance: SpeechSynthesisUtterance, context?: ConversationContext): void {
    utterance.rate = this.currentConfig.rate;
    utterance.pitch = this.currentConfig.pitch;
    utterance.volume = this.currentConfig.volume;

    // Try to select voice that matches consciousness state
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = this.selectVoiceForConsciousnessState(voices);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  private selectVoiceForConsciousnessState(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Filter for English voices
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

    if (englishVoices.length === 0) return null;

    // Select based on mode characteristics
    const voicePreferences = {
      dialogue: (voice: SpeechSynthesisVoice) => !voice.name.includes('Compact') && voice.name.includes('Enhanced'),
      patient: (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('female') || voice.name.includes('Serena'),
      scribe: (voice: SpeechSynthesisVoice) => voice.name.includes('Digital') || voice.name.includes('Robot'),
      aether: (voice: SpeechSynthesisVoice) => voice.name.includes('Whisper') || voice.name.includes('Soft')
    };

    const preferred = englishVoices.filter(voicePreferences[this.currentConfig.mode]);
    return preferred.length > 0 ? preferred[0] : englishVoices[0];
  }

  private applySpeechConfiguration(): void {
    // Configuration is applied per utterance in applyConsciousnessToUtterance
    // This method could be extended for global speech synthesis settings
  }

  private analyzeTranscriptionContext(text: string): Partial<MAIATranscription> {
    const analysis: Partial<MAIATranscription> = {};

    // Emotional tone detection
    if (/excited|amazing|wow|incredible|fantastic/i.test(text)) {
      analysis.emotionalTone = 'excited';
    } else if (/think|consider|reflect|ponder|contemplate/i.test(text)) {
      analysis.emotionalTone = 'contemplative';
    } else if (/feel|vulnerable|scared|uncertain|difficult/i.test(text)) {
      analysis.emotionalTone = 'vulnerable';
    } else if (/analyze|logic|data|facts|rational/i.test(text)) {
      analysis.emotionalTone = 'analytical';
    } else if (/grateful|thank|appreciate|blessed/i.test(text)) {
      analysis.emotionalTone = 'grateful';
    }

    // Cognitive state detection
    if (/create|imagine|vision|inspire|innovate/i.test(text)) {
      analysis.cognitiveState = 'creative';
    } else if (/feel|emotion|heart|love|connection/i.test(text)) {
      analysis.cognitiveState = 'emotional';
    } else if (/integrate|combine|synthesis|together|whole/i.test(text)) {
      analysis.cognitiveState = 'integrative';
    } else if (/analyze|break down|examine|study/i.test(text)) {
      analysis.cognitiveState = 'analytical';
    } else if (/sense|intuition|gut feeling|inner knowing/i.test(text)) {
      analysis.cognitiveState = 'intuitive';
    }

    // Processing type detection
    if (/breakthrough|aha|sudden|realize|insight/i.test(text)) {
      analysis.processingType = 'breakthrough';
    } else if (/deep|shadow|unconscious|hidden|beneath/i.test(text)) {
      analysis.processingType = 'depth-work';
    } else if (/structure|organize|framework|system/i.test(text)) {
      analysis.processingType = 'structuring';
    } else if (/clarify|clear|understand|explain/i.test(text)) {
      analysis.processingType = 'clarifying';
    } else if (/transcend|beyond|higher|spiritual/i.test(text)) {
      analysis.processingType = 'transcending';
    }

    return analysis;
  }

  private notifyTranscription(transcription: MAIATranscription): void {
    this.transcriptionCallbacks.forEach(callback => {
      try {
        callback(transcription);
      } catch (error) {
        console.error('Error in transcription callback:', error);
      }
    });
  }

  private notifyVoiceActivityChange(): void {
    this.voiceActivityCallbacks.forEach(callback => {
      try {
        callback(this.voiceActivityState);
      } catch (error) {
        console.error('Error in voice activity callback:', error);
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }
}

/**
 * Singleton instance for global voice system access
 */
let globalVoiceSystem: MAIAVoiceSystem | null = null;

export function getMAIAVoiceSystem(): MAIAVoiceSystem {
  if (!globalVoiceSystem) {
    globalVoiceSystem = new MAIAVoiceSystem();
  }
  return globalVoiceSystem;
}

/**
 * React Hook for MAIA Voice System
 */
export function useMAIAVoice() {
  const voiceSystem = getMAIAVoiceSystem();

  return {
    voiceSystem,
    initialize: () => voiceSystem.initialize(),
    updateConsciousnessState: (state: HoloflowerState) => voiceSystem.updateConsciousnessState(state),
    startListening: () => voiceSystem.startListening(),
    stopListening: () => voiceSystem.stopListening(),
    speak: (text: string, context?: ConversationContext) => voiceSystem.speak(text, context),
    getVoiceActivityState: () => voiceSystem.getVoiceActivityState(),
    onTranscription: (callback: (transcription: MAIATranscription) => void) => voiceSystem.onTranscription(callback),
    onVoiceActivity: (callback: (state: VoiceActivityState) => void) => voiceSystem.onVoiceActivity(callback),
    onError: (callback: (error: Error) => void) => voiceSystem.onError(callback),
    dispose: () => voiceSystem.dispose()
  };
}