"use client";

/**
 * Maya Hybrid Voice System - Refactored
 * Orchestrates conversation flow using modular components
 * Based on Maya Voice System White Paper architecture
 */

import OptimizedVoiceRecognition from './OptimizedVoiceRecognition';
import { ConversationStateManager } from './ConversationStateManager';
import { SilenceDetector } from './SilenceDetector';
import { NudgeSystem } from './NudgeSystem';

export type ConversationState = 'dormant' | 'listening' | 'processing' | 'speaking' | 'paused';

export interface MayaVoiceConfig {
  userId: string;
  characterId?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  previousStyle?: 'natural' | 'consciousness' | 'adaptive';
  enableNudges?: boolean;
  nudgeThreshold?: number; // seconds before nudge
  silenceThreshold?: number; // ms before processing
  apiEndpoint?: string;
}

export interface VoiceSystemCallbacks {
  onStateChange?: (state: ConversationState) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string, audioUrl?: string) => void;
  onError?: (error: string) => void;
  onNudge?: () => void;
}

/**
 * Pause/Resume command patterns
 */
const PAUSE_COMMANDS = [
  'pause maya',
  'one moment maya',
  'give me a moment',
  'give me a minute',
  'let me think',
  'let me meditate',
  'be quiet',
  'silence please',
  'hold on',
  'wait',
];

const RESUME_COMMANDS = [
  'okay maya',
  "i'm back",
  "i'm ready",
  "let's continue",
  'continue',
  'go ahead',
  'unpause',
  'resume',
];

/**
 * Main Maya Hybrid Voice System - Refactored
 */
export class MayaHybridVoiceSystem {
  private config: MayaVoiceConfig;
  private callbacks: VoiceSystemCallbacks;

  private stateManager: ConversationStateManager;
  private recognition?: OptimizedVoiceRecognition;
  private silenceDetector: SilenceDetector;
  private nudgeSystem: NudgeSystem;
  private synthesis?: SpeechSynthesis;
  private currentUtterance?: SpeechSynthesisUtterance;

  private isInitialized = false;

  constructor(config: MayaVoiceConfig, callbacks: VoiceSystemCallbacks = {}) {
    this.config = {
      silenceThreshold: 1500,
      nudgeThreshold: 45,
      enableNudges: false,
      characterId: 'maya-default',
      apiEndpoint: '/api/maya-chat',
      ...config,
    };
    this.callbacks = callbacks;

    this.stateManager = new ConversationStateManager();
    this.stateManager.onStateChange((newState) => {
      this.callbacks.onStateChange?.(newState);
    });

    this.silenceDetector = new SilenceDetector(
      { silenceThresholdMs: this.config.silenceThreshold! },
      { onSilenceDetected: (transcript) => this.processAccumulatedTranscript(transcript) }
    );

    this.nudgeSystem = new NudgeSystem(
      {
        enabled: this.config.enableNudges!,
        nudgeThresholdSeconds: this.config.nudgeThreshold!,
      },
      { onNudge: (message) => this.deliverNudge(message) }
    );

    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Initialize and start voice system
   */
  async start(): Promise<boolean> {
    if (this.isInitialized) {
      console.warn('Voice system already initialized');
      return true;
    }

    try {
      // Initialize speech recognition
      this.recognition = new OptimizedVoiceRecognition(
        {
          onResult: (transcript, isFinal) => this.handleTranscript(transcript, isFinal),
          onStart: () => this.stateManager.setState('listening'),
          onEnd: () => {
            if (this.stateManager.getState() === 'listening') {
              this.recognition?.startListening();
            }
          },
          onError: (error) => this.callbacks.onError?.(error),
        },
        {
          continuous: true,
          interimResults: true,
          language: 'en-US',
          silenceTimeoutMs: this.config.silenceThreshold,
        }
      );

      // Start listening
      const started = await this.recognition.startListening();
      if (!started) {
        throw new Error('Failed to start speech recognition');
      }

      this.isInitialized = true;
      this.stateManager.setState('listening');
      this.silenceDetector.start();
      this.nudgeSystem.start();

      return true;
    } catch (error: any) {
      this.callbacks.onError?.(`Failed to start: ${error.message}`);
      return false;
    }
  }

  stop(): void {
    this.recognition?.stopListening();
    this.stopSpeaking();
    this.silenceDetector.stop();
    this.nudgeSystem.stop();
    this.stateManager.setState('dormant');
    this.isInitialized = false;
  }

  private handleTranscript(transcript: string, isFinal: boolean): void {
    const lowerTranscript = transcript.toLowerCase().trim();

    if (this.isPauseCommand(lowerTranscript)) {
      this.enterPauseMode();
      return;
    }

    if (this.stateManager.isPaused() && this.isResumeCommand(lowerTranscript)) {
      this.exitPauseMode();
      return;
    }

    if (this.stateManager.isPaused()) {
      return;
    }

    this.callbacks.onTranscript?.(transcript, isFinal);
    this.silenceDetector.onSpeech(transcript, isFinal);
    this.nudgeSystem.onUserActivity();
  }

  private enterPauseMode(): void {
    console.log('🌙 Entering pause mode');

    this.stopSpeaking();
    this.silenceDetector.stop();
    this.nudgeSystem.stop();
    this.recognition?.stopListening();

    this.stateManager.setState('paused');

    this.speakWithFallback('Of course.', true);
  }

  private exitPauseMode(): void {
    console.log('✨ Exiting pause mode');

    this.stateManager.setState('listening');
    this.recognition?.startListening();
    this.silenceDetector.start();
    this.nudgeSystem.start();

    this.speakWithFallback("I'm here.", true);
  }

  private async processAccumulatedTranscript(transcript?: string): Promise<void> {
    const textToProcess = transcript || this.silenceDetector.getAccumulatedTranscript();

    if (!textToProcess) {
      return;
    }

    console.log('🧠 Processing transcript:', textToProcess);

    this.stateManager.setState('processing');

    try {
      // Call Maya API
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToProcess,
          userId: this.config.userId,
          characterId: this.config.characterId,
          element: this.config.element,
          conversationStyle: this.config.conversationStyle,
          previousStyle: this.config.previousStyle,
          enableVoice: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      this.callbacks.onResponse?.(data.text, data.audioUrl);

      await this.speakResponse(data.text, data.audioUrl);

    } catch (error: any) {
      console.error('Processing error:', error);
      this.callbacks.onError?.(`Failed to process: ${error.message}`);
      this.stateManager.setState('listening');
    }
  }

  private async speakResponse(text: string, audioUrl?: string): Promise<void> {
    this.stateManager.setState('speaking');

    try {
      if (audioUrl) {
        await this.playAudioUrl(audioUrl);
      } else {
        await this.speakWithFallback(text);
      }

      this.stateManager.setState('listening');
      this.recognition?.startListening();

    } catch (error: any) {
      console.error('Speech error:', error);
      this.callbacks.onError?.(`Speech failed: ${error.message}`);
      this.stateManager.setState('listening');
    }
  }

  /**
   * Play audio from URL
   */
  private playAudioUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);

      audio.onended = () => resolve();
      audio.onerror = () => {
        console.warn('Audio URL failed, trying Web Speech fallback');
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Speak using Web Speech API fallback
   */
  private speakWithFallback(text: string, brief: boolean = false): Promise<void> {
    // ❌ DISABLED: Browser TTS causes "robo voice" interference with OpenAI TTS
    // OpenAI TTS is handled by the backend via /api/voice/openai-tts
    // Browser speechSynthesis was playing simultaneously, creating double voices
    console.log('🔇 Browser TTS disabled - using OpenAI TTS only');
    return Promise.resolve();

    /* ORIGINAL BROWSER TTS CODE - COMMENTED OUT
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Maya's voice parameters from white paper
      utterance.rate = brief ? 1.0 : 0.85;
      utterance.pitch = 1.15;
      utterance.volume = brief ? 0.6 : 0.8;
      utterance.lang = 'en-US';

      // Try to use a good voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Female')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
    */
  }

  /**
   * Stop current speech
   */
  private stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = undefined;
  }

  private deliverNudge(message: string): void {
    if (this.stateManager.isListening()) {
      console.log('👋 Delivering nudge');
      this.callbacks.onNudge?.();
      this.speakWithFallback(message, true);
    }
  }

  /**
   * Command detection
   */
  private isPauseCommand(text: string): boolean {
    return PAUSE_COMMANDS.some(cmd => text.includes(cmd));
  }

  private isResumeCommand(text: string): boolean {
    return RESUME_COMMANDS.some(cmd => text.includes(cmd));
  }

  getState(): ConversationState {
    return this.stateManager.getState();
  }

  pause(): void {
    if (!this.stateManager.isPaused()) {
      this.enterPauseMode();
    }
  }

  resume(): void {
    if (this.stateManager.isPaused()) {
      this.exitPauseMode();
    }
  }

  setNudgesEnabled(enabled: boolean): void {
    this.config.enableNudges = enabled;
    this.nudgeSystem.setEnabled(enabled);
  }

  destroy(): void {
    this.stop();
    this.recognition?.destroy();
    this.stateManager.destroy();
    this.silenceDetector.destroy();
    this.nudgeSystem.destroy();
  }
}