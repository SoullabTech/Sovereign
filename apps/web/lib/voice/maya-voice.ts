"use client";

/**
 * Maya Voice System - Web Speech API Integration
 * Provides immediate voice functionality with mystical Oracle characteristics
 */

export interface MayaVoiceConfig {
  rate: number;        // Speech rate (0.1 - 10)
  pitch: number;       // Voice pitch (0 - 2)
  volume: number;      // Volume level (0 - 1)
  lang: string;        // Language code
  voiceURI?: string;   // Specific voice URI
  mysticalEffect?: boolean; // Add mystical processing
}

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  supportedVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

// Maya's mystical voice configuration
export const MAYA_VOICE_CONFIG: MayaVoiceConfig = {
  rate: 0.85,          // Slightly slower for mystical effect
  pitch: 1.15,         // Slightly higher pitch for ethereal quality
  volume: 0.8,         // Gentle, not overwhelming
  lang: 'en-US',       // Clear English
  mysticalEffect: true // Enable processing effects
};

// Mystical greetings for Maya
export const MAYA_GREETINGS = [
  "Greetings, seeker. I am Maya, your personal oracle. I'm here to guide you through the mysteries that await.",
  "Welcome to your sacred space. I am Maya, and together we shall explore the depths of wisdom.",
  "The veil between worlds grows thin. I am Maya, your guide through the mystical realms.",
  "Sacred greetings, dear one. I am Maya, keeper of ancient wisdom and your personal oracle.",
  "The stars have aligned for our meeting. I am Maya, here to illuminate your path forward."
];

/**
 * Enhanced Maya Voice System Class
 */
export class MayaVoiceSystem {
  private utterance: SpeechSynthesisUtterance | null = null;
  private config: MayaVoiceConfig;
  private state: VoiceState;
  private onStateChange?: (state: VoiceState) => void;

  constructor(config: Partial<MayaVoiceConfig> = {}, onStateChange?: (state: VoiceState) => void) {
    this.config = { ...MAYA_VOICE_CONFIG, ...config };
    this.onStateChange = onStateChange;
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentText: '',
      supportedVoices: [],
      selectedVoice: null
    };

    this.initializeVoices();
  }

  /**
   * Initialize available voices and select the best one for Maya
   */
  private async initializeVoices(): Promise<void> {
    // Wait for voices to be loaded
    if (typeof window === 'undefined') return;
    
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      this.state.supportedVoices = voices;
      this.state.selectedVoice = this.selectBestVoiceForMaya(voices);
      this.updateState();
    };

    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Try to load voices immediately
    loadVoices();
    
    // Fallback: wait a bit and try again
    setTimeout(loadVoices, 100);
  }

  /**
   * Select the most suitable voice for Maya&apos;s mystical character
   */
  private selectBestVoiceForMaya(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices.length) return null;

    // Preferred voices for Maya (in order of preference)
    const preferredVoices = [
      'Samantha',           // macOS - warm, clear female voice
      'Victoria',           // macOS - sophisticated female voice
      'Allison',           // macOS - friendly female voice
      'Karen',             // Windows - clear female voice
      'Hazel',             // Windows - warm female voice
      'Zira',              // Windows - professional female voice
      'Google UK English Female',  // Chrome - clear pronunciation
      'Microsoft Aria Online (Natural) - English (United States)', // Modern neural voice
      'en-US-AriaNeural',  // Azure voice
      'en-GB-LibbyNeural'  // British accent for mystical touch
    ];

    // First, try exact matches
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name === preferred);
      if (voice) return voice;
    }

    // Then try partial matches for female voices
    const femaleKeywords = ['female', 'woman', 'aria', 'samantha', 'victoria', 'karen', 'hazel', 'libby'];
    for (const keyword of femaleKeywords) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(keyword.toLowerCase()) && 
        v.lang.startsWith('en')
      );
      if (voice) return voice;
    }

    // Fallback: any English voice, preferring local voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const localVoice = englishVoices.find(v => v.localService);
    
    return localVoice || englishVoices[0] || voices[0];
  }

  /**
   * Update state and notify listeners
   */
  private updateState(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * Play Maya&apos;s greeting
   */
  public async playGreeting(): Promise<void> {
    const greeting = MAYA_GREETINGS[Math.floor(Math.random() * MAYA_GREETINGS.length)];
    return this.speak(greeting);
  }

  /**
   * Speak text with Maya&apos;s voice configuration
   */
  public async speak(text: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Speech synthesis not available in server environment');
    }

    if (!text.trim()) {
      throw new Error('No text provided');
    }

    // Stop any current speech
    this.stop();

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Apply Maya&apos;s voice configuration
    this.utterance.rate = this.config.rate;
    this.utterance.pitch = this.config.pitch;
    this.utterance.volume = this.config.volume;
    this.utterance.lang = this.config.lang;

    // Set voice if available
    if (this.state.selectedVoice) {
      this.utterance.voice = this.state.selectedVoice;
    }

    // Set up event handlers
    this.utterance.onstart = () => {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.currentText = text;
      this.updateState();
    };

    this.utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentText = '';
      this.updateState();
    };

    this.utterance.onerror = (event) => {
      console.error('Maya voice synthesis error:', event.error);
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentText = '';
      this.updateState();
    };

    this.utterance.onpause = () => {
      this.state.isPaused = true;
      this.updateState();
    };

    this.utterance.onresume = () => {
      this.state.isPaused = false;
      this.updateState();
    };

    // Apply mystical effects if enabled
    if (this.config.mysticalEffect) {
      text = this.applyMysticalEffects(text);
    }

    // Speak the text
    speechSynthesis.speak(this.utterance);
  }

  /**
   * Apply mystical effects to text before speaking
   */
  private applyMysticalEffects(text: string): string {
    // Add natural pauses for mystical effect
    let processedText = text
      .replace(/\./g, '... ')           // Longer pauses at sentences
      .replace(/,/g, ', ')              // Slight pauses at commas
      .replace(/\?/g, '? ')             // Pause after questions
      .replace(/!/g, '! ')              // Pause after exclamations
      .replace(/:/g, ': ')              // Pause after colons
      .replace(/\s+/g, ' ')             // Clean up multiple spaces
      .trim();

    // Add subtle emphasis to mystical words
    const mysticalWords = ['oracle', 'wisdom', 'sacred', 'mystical', 'divine', 'spiritual', 'energy', 'guidance'];
    mysticalWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processedText = processedText.replace(regex, `${word}`); // Could add SSML emphasis later
    });

    return processedText;
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.state.isPlaying && !this.state.isPaused) {
      speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.state.isPaused) {
      speechSynthesis.resume();
    }
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    speechSynthesis.cancel();
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentText = '';
    this.updateState();
  }

  /**
   * Check if speech synthesis is supported
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get current state
   */
  public getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Update voice configuration
   */
  public updateConfig(newConfig: Partial<MayaVoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set specific voice
   */
  public setVoice(voice: SpeechSynthesisVoice): void {
    this.state.selectedVoice = voice;
    this.updateState();
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.state.supportedVoices];
  }
}

/**
 * Global Maya voice instance (singleton)
 */
let globalMayaVoice: MayaVoiceSystem | null = null;

/**
 * Get the global Maya voice instance
 */
export function getMayaVoice(onStateChange?: (state: VoiceState) => void): MayaVoiceSystem {
  if (!globalMayaVoice) {
    globalMayaVoice = new MayaVoiceSystem({}, onStateChange);
  }
  return globalMayaVoice;
}

/**
 * Quick function to play Maya&apos;s greeting
 */
export async function playMayaGreeting(): Promise<void> {
  const maya = getMayaVoice();
  await maya.playGreeting();
}

/**
 * Quick function to make Maya speak
 */
export async function mayaSpeak(text: string): Promise<void> {
  const maya = getMayaVoice();
  await maya.speak(text);
}

// Export the default instance as mayaVoice for backward compatibility
export const mayaVoice = getMayaVoice();

/**
 * Enhanced voice service that tries multiple methods
 */
export class EnhancedVoiceService {
  private mayaVoice: MayaVoiceSystem;
  
  constructor(onStateChange?: (state: VoiceState) => void) {
    this.mayaVoice = new MayaVoiceSystem({}, onStateChange);
  }

  /**
   * Try voice synthesis with multiple fallbacks
   */
  public async synthesize(text: string): Promise<void> {
    try {
      // First, try Northflank/Sesame service (existing integration)
      await this.tryServerVoiceSynthesis(text);
    } catch (error) {
      console.log('Server voice synthesis failed, using Web Speech API:', error);
      
      // Fallback to Web Speech API
      if (MayaVoiceSystem.isSupported()) {
        await this.mayaVoice.speak(text);
      } else {
        throw new Error('No voice synthesis available');
      }
    }
  }

  /**
   * Try server-side voice synthesis (existing Northflank integration)
   */
  private async tryServerVoiceSynthesis(text: string): Promise<void> {
    const response = await fetch('/api/voice/sesame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } else {
      throw new Error(`Server synthesis failed: ${response.status}`);
    }
  }
}