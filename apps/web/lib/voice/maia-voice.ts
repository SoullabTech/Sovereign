/**
 * Maia Voice System - ElevenLabs "Aunt Annie" + Sesame Intelligence
 * Modern, everyday, soulful, intelligent voice for the Oracle
 */

import { AgentConfig } from '../agent-config';
import { VoicePreprocessor } from './VoicePreprocessor';
import { playAudioWithFeedbackPrevention, speakWithFeedbackPrevention } from './voice-feedback-prevention';
import { signalMayaSpeaking } from './enhanced-feedback-prevention';

interface MaiaVoiceConfig {
  elevenLabsApiKey?: string;
  voiceId: string; // Dynamic based on agent
  sesameApiKey?: string;
  fallbackToWebSpeech: boolean;
  agentConfig?: AgentConfig; // Agent configuration for voice selection
  naturalSettings: {
    rate: number;
    pitch: number;
    volume: number;
    stability: number;
    clarity: number;
  };
}

interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentText: string;
  voiceType: 'elevenlabs' | 'webspeech' | 'sesame';
  error?: string;
}

export class MaiaVoiceSystem {
  private config: MaiaVoiceConfig;
  private state: VoiceState;
  private audioContext?: AudioContext;
  private currentAudio?: HTMLAudioElement;
  private listeners: ((state: VoiceState) => void)[] = [];
  private playbackTimeoutId?: NodeJS.Timeout; // Safety timeout for stuck isPlaying state

  constructor(config?: Partial<MaiaVoiceConfig>) {
    // Determine voice settings based on agent
    const isAnthony = config?.agentConfig?.voice === 'anthony';
    const defaultVoiceId = isAnthony 
      ? 'c6SfcYrb2t09NHXiT80T'  // Anthony's voice
      : 'EXAVITQu4vr4xnSDxMaL'; // Maia's voice
    
    this.config = {
      voiceId: config?.voiceId || defaultVoiceId,
      elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      fallbackToWebSpeech: true,
      agentConfig: config?.agentConfig,
      naturalSettings: isAnthony ? {
        rate: 0.9,     // Slower for male voice
        pitch: 0.85,   // Lower pitch for male  
        volume: 0.9,   // Slightly louder
        stability: 0.85, // More stable for deeper voice
        clarity: 0.95   // High clarity for gravitas
      } : {
        rate: 0.95,    // Natural female pace
        pitch: 1.05,   // Slightly higher for warmth  
        volume: 0.85,  // Softer and more comfortable
        stability: 0.8, // Natural variation
        clarity: 0.9    // High clarity
      },
      ...config
    };

    this.state = {
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentText: '',
      voiceType: 'sesame' // Default to Sesame instead of ElevenLabs
    };

    // Initialize audio context for better browser compatibility
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext not available:', error);
      }

      // 🛑 Listen for interrupt events (when user starts speaking)
      window.addEventListener('maya-voice-interrupted', () => {
        console.log('🛑 [MaiaVoiceSystem] Received interrupt signal - stopping immediately');
        this.stop();
      });
    }
  }

  // Subscribe to voice state changes
  subscribe(listener: (state: VoiceState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // iOS Audio Fix - Keep context alive
  private async ensureAudioContextActive(): Promise<void> {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('✅ AudioContext resumed');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }

    // Keep alive ping for iOS
    if (this.isIOS()) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.001; // Nearly silent
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.01);
    }
  }

  private isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private updateState(updates: Partial<VoiceState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Clear any existing playback timeout
  private clearPlaybackTimeout() {
    if (this.playbackTimeoutId) {
      clearTimeout(this.playbackTimeoutId);
      this.playbackTimeoutId = undefined;
    }
  }

  // Set a safety timeout to prevent stuck isPlaying state
  // If audio doesn't end within 60 seconds, force reset
  private setPlaybackTimeout() {
    this.clearPlaybackTimeout();
    this.playbackTimeoutId = setTimeout(() => {
      if (this.state.isPlaying) {
        console.warn('⚠️ [MaiaVoiceSystem] Audio playback timeout - forcing state reset');
        this.updateState({
          isPlaying: false,
          isPaused: false,
          isLoading: false,
          currentText: ''
        });
        // Clean up current audio
        if (this.currentAudio) {
          try {
            this.currentAudio.pause();
            this.currentAudio = undefined;
          } catch (error) {
            console.error('Error cleaning up audio:', error);
          }
        }
      }
    }, 60000); // 60 second safety timeout
  }

  // Clean text for speech without artificial pauses
  private enhanceTextForSpeech(text: string): string {
    // Remove stage directions that shouldn't be spoken
    let processedText = VoicePreprocessor.extractSpokenContent(text);

    // Simply return the clean text without adding pauses
    // Let the TTS engine handle natural pacing
    return processedText.trim();
  }

  // Generate Maia's natural greeting
  getNaturalGreeting(): string {
    const greetings = [
      "Hey there. I'm Maia. Good to connect with you.",
      "Hi. I'm here when you're ready to explore what's on your mind.",
      "Hello. I'm Maia, and I'm listening. What's stirring for you?",
      "Hey. Let's see what we can discover together. How are you feeling?",
      "Hi there. I'm Maia. What would it be helpful to talk about?"
    ];
    
    return this.enhanceTextForSpeech(
      greetings[Math.floor(Math.random() * greetings.length)]
    );
  }

  // ElevenLabs TTS with Aunt Annie voice
  private async speakWithElevenLabs(text: string): Promise<void> {
    if (!this.config.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    this.updateState({ isLoading: true, currentText: text, voiceType: 'elevenlabs' });

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.elevenLabsApiKey
        },
        body: JSON.stringify({
          text: this.enhanceTextForSpeech(text),
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: this.config.naturalSettings.stability,
            similarity_boost: this.config.naturalSettings.clarity,
            style: 0.0, // Natural conversational style
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      this.updateState({ error: error.message });
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // OpenAI TTS with Alloy voice - PRIMARY METHOD
  private async speakWithOpenAI(text: string, voiceTone?: any): Promise<void> {
    console.log('🎯 [speakWithOpenAI] Starting...');

    // iOS Fix: Ensure audio context is active before speaking
    await this.ensureAudioContextActive();
    console.log('   ✓ AudioContext active');

    const isAnthony = this.config.agentConfig?.voice === 'anthony';
    const voiceName = isAnthony ? 'onyx' : 'alloy';
    console.log(`   ✓ Using ${voiceName} voice for ${isAnthony ? 'Anthony' : 'Maya'}`);
    this.updateState({ isLoading: true, currentText: text, voiceType: 'elevenlabs' }); // Keep as 'elevenlabs' for compatibility

    try {
      console.log('   → Calling /api/voice/openai-tts...');
      const requestBody: any = {
        text: this.enhanceTextForSpeech(text),
        agentVoice: this.config.agentConfig?.voice || 'maya',
        speed: 0.95,        // Slightly slower for natural conversational pace
        model: 'tts-1-hd'   // Higher quality for better clarity
      };

      // 🔥 ELEMENTAL PROSODY: Pass voiceTone if available
      if (voiceTone) {
        requestBody.voiceTone = voiceTone;
        console.log('   🌀 Passing elemental voiceTone:', voiceTone);
      }

      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('   ← API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI TTS API error:', response.status, errorText);
        throw new Error(`OpenAI TTS error: ${response.status}`);
      }

      console.log('   ✓ Converting to blob...');
      const audioBlob = await response.blob();
      console.log('   ✓ Blob size:', audioBlob.size, 'bytes');

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('   ✓ Created blob URL, attempting playback...');

      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('❌ OpenAI TTS failed:', error);
      this.updateState({ error: error.message });
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Sesame conversational intelligence + voice - DISABLED
  private async speakWithSesame(text: string, context?: any): Promise<void> {
    // Sesame CI has been disabled - using OpenAI TTS instead
    console.log('Sesame CI disabled, using OpenAI TTS directly');
    return this.speakWithOpenAI(text);
  }

  // Web Speech API fallback with agent-appropriate characteristics
  private async speakWithWebSpeech(text: string): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Web Speech API not supported');
    }

    // iOS Fix: Ensure audio context is active before speaking
    await this.ensureAudioContextActive();

    this.updateState({ isLoading: true, currentText: text, voiceType: 'webspeech' });

    return new Promise((resolve, reject) => {
      try {
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(this.enhanceTextForSpeech(text));
        
        // Configure voice based on agent
        const isAnthony = this.config.agentConfig?.voice === 'anthony';
        
        if (isAnthony) {
          // Anthony's voice characteristics
          utterance.rate = 0.9;   // Slower, more deliberate
          utterance.pitch = 0.8;  // Lower pitch for male voice
          utterance.volume = 0.9; // Slightly louder
        } else {
          // Maia's voice characteristics  
          utterance.rate = 0.95;  // Natural female pace
          utterance.pitch = 1.05;  // Slightly higher for warmth
          utterance.volume = 0.85; // Softer for comfort
        }
        utterance.lang = 'en-US';

        // Try to select the best available voice based on gender
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = this.selectBestVoice(voices, isAnthony ? 'male' : 'female');
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Event handlers
        utterance.onstart = () => {
          this.updateState({
            isPlaying: true,
            isLoading: false,
            isPaused: false
          });

          // Set safety timeout to prevent stuck state
          this.setPlaybackTimeout();
        };

        utterance.onend = () => {
          // Clear safety timeout since speech ended naturally
          this.clearPlaybackTimeout();

          this.updateState({
            isPlaying: false,
            currentText: ''
          });
          console.log('🎵 Web Speech finished speaking');
          // CRITICAL: Delay to ensure audio has fully stopped in speakers
          setTimeout(() => {
            console.log('🔇 Web Speech promise resolving after cooldown');
            resolve();
          }, 400); // 400ms delay for speaker buffer to clear (reduced from 800ms for faster responses)
        };

        utterance.onerror = (event) => {
          // Clear safety timeout since we're handling the error
          this.clearPlaybackTimeout();

          this.updateState({
            isPlaying: false,
            isLoading: false,
            error: event.error
          });
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        utterance.onpause = () => {
          this.updateState({ isPaused: true });
        };

        utterance.onresume = () => {
          this.updateState({ isPaused: false });
        };

        // Use feedback prevention wrapper instead of direct speak
        speakWithFeedbackPrevention(utterance);
      } catch (error) {
        this.updateState({ 
          isLoading: false, 
          error: error.message 
        });
        reject(error);
      }
    });
  }

  // Select the best available voice for the agent
  private selectBestVoice(voices: SpeechSynthesisVoice[], gender: 'male' | 'female' = 'female'): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    
    // Score voices based on quality factors
    const scoredVoices = voices.map(voice => {
      let score = 0;
      
      // Strongly prefer local voices (much better quality)
      if (voice.localService) score += 100;
      
      // Prefer English voices
      if (voice.lang.startsWith('en')) score += 50;
      
      // Prefer known high-quality voices based on gender
      const highQualityFemaleVoices = ['Samantha', 'Victoria', 'Allison', 'Ava', 'Karen', 'Hazel', 'Susan', 'Kate'];
      const highQualityMaleVoices = ['Alex', 'Daniel', 'Fred', 'Gordon', 'Lee', 'Oliver', 'Thomas', 'Tom'];
      const voiceName = voice.name;
      
      if (gender === 'male') {
        if (highQualityMaleVoices.some(name => voiceName.includes(name))) {
          score += 40;
        }
      } else {
        if (highQualityFemaleVoices.some(name => voiceName.includes(name))) {
          score += 40;
        }
      }
      
      // Prefer voices matching the desired gender
      const isFemaleVoice = voiceName.toLowerCase().includes('female') || 
          voiceName.toLowerCase().includes('woman') ||
          highQualityFemaleVoices.some(name => voiceName.includes(name));
      
      const isMaleVoice = voiceName.toLowerCase().includes('male') || 
          voiceName.toLowerCase().includes('man') ||
          highQualityMaleVoices.some(name => voiceName.includes(name));
      
      if (gender === 'male' && isMaleVoice) {
        score += 30;
      } else if (gender === 'female' && isFemaleVoice) {
        score += 30;
      }
      
      // Avoid known robotic voices
      const roboticVoices = ['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged'];
      if (roboticVoices.some(name => voiceName.includes(name))) {
        score -= 50;
      }
      
      return { voice, score };
    });
    
    // Sort by score and return best
    scoredVoices.sort((a, b) => b.score - a.score);
    const selected = scoredVoices[0]?.voice || null;
    
    if (selected) {
      console.log('Selected voice:', selected.name, 'Local:', selected.localService, 'Score:', scoredVoices[0].score);
    }
    
    return selected;
  }

  // Play audio from URL with feedback prevention
  private async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Clean up previous audio
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = undefined;
        }

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        // Configure audio element
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        audio.volume = this.config.naturalSettings.volume;

        // CRITICAL iOS/iPhone Chrome FIX: Set playsinline attributes for mobile compatibility
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', ''); // For older iOS versions
        audio.muted = false; // Explicitly ensure audio is not muted

        console.log('🎵 Audio element configured for iOS:', {
          playsinline: audio.getAttribute('playsinline'),
          volume: audio.volume,
          muted: audio.muted
        });

        // iOS PWA: Resume AudioContext if suspended
        if (this.audioContext) {
          try {
            if (this.audioContext.state === 'suspended') {
              console.log('🔄 Resuming suspended AudioContext for iOS PWA...');
              await this.audioContext.resume();
              console.log('✅ AudioContext resumed, state:', this.audioContext.state);
            }
          } catch (contextError) {
            console.warn('Could not resume AudioContext:', contextError);
          }
        }

        // For iOS/PWA: Don't use MediaElementSource - it causes issues
        // Just use plain Audio element with volume control

        audio.onloadstart = () => {
          this.updateState({ isLoading: true });
        };

        audio.oncanplay = () => {
          this.updateState({ isLoading: false });
        };

        audio.onplay = () => {
          this.updateState({
            isPlaying: true,
            isPaused: false
          });
          console.log('🎵 Maia audio started playing');

          // Set safety timeout to prevent stuck state
          this.setPlaybackTimeout();
        };

        audio.onended = () => {
          // Clear safety timeout since audio ended naturally
          this.clearPlaybackTimeout();

          this.updateState({
            isPlaying: false,
            currentText: ''
          });
          console.log('🎵 Maia audio finished playing');
          URL.revokeObjectURL(audioUrl); // Clean up blob URL

          // CRITICAL: Delay to ensure audio has fully stopped in speakers
          // Audio can linger in the output buffer even after file ends
          setTimeout(() => {
            console.log('🔇 Audio promise resolving after cooldown');
            resolve();
          }, 400); // 400ms delay for speaker buffer to clear (reduced from 800ms for faster responses)
        };

        audio.onerror = (error) => {
          // Clear safety timeout since we're handling the error
          this.clearPlaybackTimeout();

          this.updateState({
            isPlaying: false,
            isLoading: false,
            error: 'Audio playback failed'
          });
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        audio.onpause = () => {
          this.updateState({ isPaused: true });
        };

        // Use feedback prevention wrapper
        playAudioWithFeedbackPrevention(audio).catch(error => {
          console.error('❌ Audio play failed - likely needs user interaction:', error);
          console.error('   Error name:', error?.name);
          console.error('   Error message:', error?.message);
          this.updateState({
            isPlaying: false,
            isLoading: false,
            error: 'Audio playback blocked - click to enable audio'
          });
          reject(error);
        });
      } catch (error) {
        this.updateState({
          isLoading: false,
          error: error.message
        });
        reject(error);
      }
    });
  }

  // Main speak method with intelligent fallback
  async speak(text: string, context?: any): Promise<void> {
    console.log('🔊 MaiaVoiceSystem.speak called with text:', text.substring(0, 50) + '...');

    // Signal Maya is starting to speak
    signalMayaSpeaking(true);

    try {
      // Reset error state
      this.updateState({ error: undefined });

      // Extract voiceTone from context if available (from oracle response)
      const voiceTone = context?.voiceTone;
      if (voiceTone) {
        console.log('🌀 Voice context includes elemental tone:', voiceTone.style);
      }

      // Try OpenAI TTS first (PRIMARY)
      try {
        console.log('🎙️ Trying OpenAI TTS first...');
        await this.speakWithOpenAI(text, voiceTone);
        console.log('✅ OpenAI TTS succeeded!');
        return;
      } catch (error) {
        console.warn('⚠️ OpenAI TTS failed, trying ElevenLabs:', error);
      }

      // Try ElevenLabs second (if configured)
      if (this.config.elevenLabsApiKey) {
        try {
          console.log('🎙️ Trying ElevenLabs as fallback...');
          await this.speakWithElevenLabs(text);
          console.log('✅ ElevenLabs succeeded!');
          return;
        } catch (error) {
          console.warn('⚠️ ElevenLabs failed, falling back to Web Speech:', error);
        }
      }

      // DISABLED: Don't fall back to robotic Web Speech API
      // Users report it's jarring and breaks immersion
      // Better to fail silently than use robotic voice
      console.warn('🚫 All premium voice services failed. NOT falling back to robotic Web Speech API.');
      console.warn('   → OpenAI TTS failed');
      if (this.config.elevenLabsApiKey) {
        console.warn('   → ElevenLabs failed');
      }
      console.warn('   → Skipping Web Speech API to avoid robotic voice');

      throw new Error('Premium voice services unavailable');
    } catch (error) {
      console.error('❌ Maia voice system completely failed:', error);
      this.updateState({
        error: `Voice system error: ${error.message}`,
        isPlaying: false,
        isLoading: false
      });

      // Signal Maya stopped speaking even on error
      signalMayaSpeaking(false);
      throw error;
    } finally {
      // Ensure we always signal end of speaking
      setTimeout(() => signalMayaSpeaking(false), 500);
    }
  }

  // Speak Maia's greeting
  async playGreeting(context?: any): Promise<void> {
    const greeting = this.getNaturalGreeting();
    return this.speak(greeting, { ...context, type: 'greeting' });
  }

  // Control methods
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  stop(): void {
    // Clear safety timeout when manually stopping
    this.clearPlaybackTimeout();

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = undefined;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentText: ''
    });
  }

  // Get current state
  getState(): VoiceState {
    return { ...this.state };
  }

  // Check voice capabilities
  getCapabilities() {
    return {
      elevenLabs: !!this.config.elevenLabsApiKey,
      sesame: !!this.config.sesameApiKey,
      webSpeech: 'speechSynthesis' in window,
      audioContext: !!this.audioContext
    };
  }

  /**
   * Detect if running on mobile device
   */
  private isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'opera mini'];
    
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
           ('ontouchstart' in window) ||
           (window.innerWidth <= 768);
  }

  /**
   * Generate speech with automatic mobile optimization
   */
  async generateSpeech(text: string, options?: any): Promise<string> {
    // Use mobile-optimized version on mobile devices
    if (this.isMobileDevice()) {
      const MaiaVoiceMobile = await import('./maia-voice-mobile');
      const mobileVoice = new MaiaVoiceMobile.default();
      return await mobileVoice.generateSpeech(text, options);
    }

    // Desktop version - use OpenAI TTS primarily
    try {
      await this.speakWithOpenAI(text);
      return 'openai-tts-success';
    } catch (error) {
      console.warn('OpenAI TTS failed, falling back to Web Speech:', error);

      // Fallback to Web Speech API
      await this.speakWithWebSpeech(text);
      return 'web-speech-fallback';
    }
  }

  /**
   * Get current state for external components
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = undefined;
    }
    
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }
    
    this.listeners = [];
  }
}

// Global Maia voice instance
let maiaVoiceInstance: MaiaVoiceSystem | null = null;

export function getMaiaVoice(config?: Partial<MaiaVoiceConfig>): MaiaVoiceSystem {
  if (!maiaVoiceInstance) {
    maiaVoiceInstance = new MaiaVoiceSystem(config);
  }
  return maiaVoiceInstance;
}

// Configuration helper
export function configureMaiaVoice(config: Partial<MaiaVoiceConfig>): void {
  if (maiaVoiceInstance) {
    // Update existing instance
    Object.assign(maiaVoiceInstance['config'], config);
  } else {
    // Create new instance with config
    maiaVoiceInstance = new MaiaVoiceSystem(config);
  }
}