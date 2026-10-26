/**
 * Personalized Voice Synthesis Service
 * Integrates with multiple TTS providers for customizable oracle voices
 */

import { VoiceSettings } from '../context/OraclePersonalizationContext';
import { requestSoullabTts } from './serverTtsClient';

export interface VoiceProvider {
  id: string;
  name: string;
  supportsStreaming: boolean;
  supportedGenders: ('feminine' | 'masculine' | 'neutral')[];
  supportedStyles: string[];
}

export interface VoiceSynthesisOptions {
  text: string;
  voiceSettings: VoiceSettings;
  streamCallback?: (chunk: ArrayBuffer) => void;
  emotion?: 'neutral' | 'warm' | 'excited' | 'contemplative' | 'mysterious';
  emphasis?: Array<{ text: string; level: 'low' | 'medium' | 'high' }>;
}

export class PersonalizedVoiceService {
  private static instance: PersonalizedVoiceService;
  private audioContext: AudioContext | null = null;
  private currentProvider: VoiceProvider;
  private voiceCache: Map<string, ArrayBuffer> = new Map();
  private isInitialized = false;

  // Available voice providers
  private providers: VoiceProvider[] = [
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      supportsStreaming: true,
      supportedGenders: ['feminine', 'masculine', 'neutral'],
      supportedStyles: [
        'warm-guide', 'wise-elder', 'playful-friend', 'serene-mystic',
        'gentle-mentor', 'wise-sage', 'trusted-friend', 'cosmic-philosopher',
        'ethereal-guide', 'ancient-wisdom', 'cosmic-consciousness', 'pure-presence'
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI TTS',
      supportsStreaming: false,
      supportedGenders: ['feminine', 'masculine', 'neutral'],
      supportedStyles: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    },
    {
      id: 'azure',
      name: 'Azure Cognitive Services',
      supportsStreaming: true,
      supportedGenders: ['feminine', 'masculine'],
      supportedStyles: ['neural', 'standard']
    },
    {
      id: 'web-speech',
      name: 'Web Speech API',
      supportsStreaming: false,
      supportedGenders: ['feminine', 'masculine', 'neutral'],
      supportedStyles: ['default']
    }
  ];

  private constructor() {
    // Default to Web Speech API for immediate availability
    this.currentProvider = this.providers.find(p => p.id === 'web-speech')!;
  }

  public static getInstance(): PersonalizedVoiceService {
    if (!PersonalizedVoiceService.instance) {
      PersonalizedVoiceService.instance = new PersonalizedVoiceService();
    }
    return PersonalizedVoiceService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Check which providers are available
      await this.detectAvailableProviders();
      
      // Select best provider based on user preferences and availability
      await this.selectOptimalProvider();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      // Fall back to Web Speech API
      this.currentProvider = this.providers.find(p => p.id === 'web-speech')!;
    }
  }

  private async detectAvailableProviders(): Promise<void> {
    // Cloud credentials never enter the browser. Keep only the same-origin
    // Soullab server route and the device-local Web Speech fallback.
    this.providers = this.providers.filter((provider) =>
      provider.id === 'openai' ||
      (provider.id === 'web-speech' && 'speechSynthesis' in window),
    );
  }

  private async selectOptimalProvider(): Promise<void> {
    this.currentProvider =
      this.providers.find((provider) => provider.id === 'openai') ||
      this.providers.find((provider) => provider.id === 'web-speech')!;
  }

  public async synthesize(options: VoiceSynthesisOptions): Promise<ArrayBuffer | void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check cache first
    const cacheKey = this.getCacheKey(options);
    if (this.voiceCache.has(cacheKey)) {
      const cached = this.voiceCache.get(cacheKey)!;
      if (options.streamCallback) {
        options.streamCallback(cached);
      }
      return cached;
    }

    // Route to appropriate provider
    switch (this.currentProvider.id) {
      case 'elevenlabs':
        return this.synthesizeWithElevenLabs(options);
      case 'openai':
        return this.synthesizeWithOpenAI(options);
      case 'azure':
        return this.synthesizeWithAzure(options);
      case 'web-speech':
      default:
        return this.synthesizeWithWebSpeech(options);
    }
  }

  private async synthesizeWithSoullabServer(options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
    const audioData = await requestSoullabTts(options.text, {
      voice: this.getOpenAIVoice(options.voiceSettings),
      speed: options.voiceSettings.speed,
      format: 'mp3',
    });
    this.voiceCache.set(this.getCacheKey(options), audioData);
    options.streamCallback?.(audioData);
    return audioData;
  }

  private async synthesizeWithElevenLabs(options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
    return this.synthesizeWithSoullabServer(options);
  }

  private async synthesizeWithOpenAI(options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
    return this.synthesizeWithSoullabServer(options);
  }

  private async synthesizeWithAzure(options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
    return this.synthesizeWithSoullabServer(options);
  }

  private synthesizeWithWebSpeech(options: VoiceSynthesisOptions): void {
    if (!('speechSynthesis' in window)) {
      throw new Error('Web Speech API not supported');
    }

    const utterance = new SpeechSynthesisUtterance(options.text);
    
    // Apply voice settings
    utterance.rate = options.voiceSettings.speed;
    utterance.pitch = options.voiceSettings.pitch;
    utterance.volume = options.voiceSettings.volume;
    
    // Select voice based on gender preference
    const voices = speechSynthesis.getVoices();
    const preferredVoice = this.selectWebSpeechVoice(voices, options.voiceSettings);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Speak
    speechSynthesis.speak(utterance);
  }

  private selectWebSpeechVoice(
    voices: SpeechSynthesisVoice[], 
    settings: VoiceSettings
  ): SpeechSynthesisVoice | null {
    // Map gender preferences to voice characteristics
    const genderKeywords = {
      feminine: ['female', 'woman', 'girl'],
      masculine: ['male', 'man', 'guy'],
      neutral: ['neutral', 'assistant']
    };
    
    const keywords = genderKeywords[settings.gender];
    
    // Find matching voice
    const matchingVoice = voices.find(voice => 
      keywords.some(keyword => 
        voice.name.toLowerCase().includes(keyword)
      )
    );
    
    return matchingVoice || voices[0];
  }

  private buildSSML(options: VoiceSynthesisOptions): string {
    const { text, voiceSettings, emotion, emphasis } = options;
    
    let ssmlText = text;
    
    // Apply emphasis if provided
    if (emphasis && emphasis.length > 0) {
      emphasis.forEach(({ text: emphasisText, level }) => {
        const emphasisTag = `<emphasis level="${level}">${emphasisText}</emphasis>`;
        ssmlText = ssmlText.replace(emphasisText, emphasisTag);
      });
    }
    
    // Build SSML document
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${this.getAzureVoice(voiceSettings)}">
          <prosody rate="${voiceSettings.speed}" pitch="${voiceSettings.pitch}">
            ${ssmlText}
          </prosody>
        </voice>
      </speak>
    `;
  }

  private getCacheKey(options: VoiceSynthesisOptions): string {
    return `${options.text}_${JSON.stringify(options.voiceSettings)}_${options.emotion}`;
  }

  private getElevenLabsVoiceId(settings: VoiceSettings): string {
    // Map to ElevenLabs voice IDs
    const voiceMap: Record<string, string> = {
      'feminine_warm-guide': 'EXAVITQu4vr4xnSDxMaL',
      'feminine_wise-elder': 'IKne3meq5aSn9XLyUdCD',
      'masculine_gentle-mentor': 'TxGEqnHWrfWFTfGW9XjX',
      'masculine_wise-sage': 'josh',
      'neutral_ethereal-guide': 'flq6f7yk4E4fJM5XTYuZ'
    };
    
    const key = `${settings.gender}_${settings.style}`;
    return voiceMap[key] || 'EXAVITQu4vr4xnSDxMaL'; // Default to Rachel
  }

  private getOpenAIVoice(settings: VoiceSettings): string {
    const voiceMap: Record<string, string> = {
      'feminine': 'nova',
      'masculine': 'onyx',
      'neutral': 'echo'
    };
    return voiceMap[settings.gender] || 'nova';
  }

  private getAzureVoice(settings: VoiceSettings): string {
    const voiceMap: Record<string, string> = {
      'feminine': 'en-US-JennyNeural',
      'masculine': 'en-US-GuyNeural',
      'neutral': 'en-US-AriaNeural'
    };
    return voiceMap[settings.gender] || 'en-US-JennyNeural';
  }

  private getStabilityFromStyle(style: string): number {
    const stabilityMap: Record<string, number> = {
      'warm-guide': 0.75,
      'wise-elder': 0.85,
      'playful-friend': 0.5,
      'serene-mystic': 0.9
    };
    return stabilityMap[style] || 0.75;
  }

  private getElevenLabsStyle(style: string): number {
    const styleMap: Record<string, number> = {
      'warm-guide': 0.3,
      'wise-elder': 0.5,
      'playful-friend': 0.7,
      'serene-mystic': 0.2
    };
    return styleMap[style] || 0.3;
  }

  public async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }
    
    const audioData = await this.audioContext!.decodeAudioData(audioBuffer);
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioData;
    source.connect(this.audioContext!.destination);
    source.start();
  }

  public clearCache(): void {
    this.voiceCache.clear();
  }

  public getAvailableProviders(): VoiceProvider[] {
    return this.providers;
  }

  public getCurrentProvider(): VoiceProvider {
    return this.currentProvider;
  }

  public setProvider(providerId: string): void {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      this.currentProvider = provider;
    }
  }
}