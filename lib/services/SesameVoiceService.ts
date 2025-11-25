// import axios from 'axios'; // Commented out - using fetch instead
import { EventEmitter } from 'events';
import OpenAI from 'openai';
import { VoiceProfile as ConfigVoiceProfile } from '../config/voiceProfiles';

export interface VoiceProfile {
  id: string;
  name: string;
  baseVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  clonedFrom?: string; // URL or file path if cloned
  parameters: VoiceModulation;
  metadata?: {
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
  };
}

export interface VoiceModulation {
  temperature: number;      // 0.0 - 1.0 (emotional variation)
  speed: number;            // 0.5 - 2.0 (speaking rate)
  pitch: number;            // -12 to +12 semitones
  consistency: number;      // 0.0 - 1.0 (voice stability)
  emotionalDepth: number;   // 0.0 - 1.0 (expressiveness)
  resonance: number;        // 0.0 - 1.0 (warmth/depth)
  clarity: number;          // 0.0 - 1.0 (articulation)
  breathiness: number;      // 0.0 - 1.0 (softness)
}

export interface SesameVoiceConfig {
  apiUrl: string;
  apiKey?: string;
  defaultVoice: VoiceProfile['baseVoice'];
  enableCloning: boolean;
  cacheEnabled: boolean;
  maxConcurrentRequests: number;
}

export interface VoiceGenerationRequest {
  text: string;
  voiceProfile?: VoiceProfile;
  element?: string; // Fire, Water, Earth, Air, Aether
  emotionalContext?: {
    mood: string;
    intensity: number;
    jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
  };
  prosodyHints?: {
    emphasis?: string[];
    pauses?: { position: number; duration: number }[];
    intonation?: 'rising' | 'falling' | 'neutral' | 'questioning';
  };
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
  stream?: boolean;
}

export interface VoiceCloneRequest {
  sourceUrl?: string;
  sourceFile?: Buffer;
  name: string;
  baseVoice?: VoiceProfile['baseVoice'];
  preserveAccent?: boolean;
  preserveAge?: boolean;
  preserveGender?: boolean;
}

export class SesameVoiceService extends EventEmitter {
  private config: SesameVoiceConfig;
  private voiceProfiles: Map<string, VoiceProfile>;
  private audioCache: Map<string, Buffer>;
  private activeRequests: number = 0;
  private openai?: OpenAI;

  constructor(config: Partial<SesameVoiceConfig> = {}) {
    super();

    this.config = {
      apiUrl: process.env.SESAME_API_URL || 'http://localhost:8000',
      apiKey: process.env.SESAME_API_KEY,
      defaultVoice: 'nova',
      enableCloning: true,
      cacheEnabled: true,
      maxConcurrentRequests: 3,
      ...config
    };

    this.voiceProfiles = new Map();
    this.audioCache = new Map();

    // Initialize OpenAI client if API key is available
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey) {
      this.openai = new OpenAI({ apiKey: openAIKey });
    }

    this.initializeDefaultProfiles();
  }

  private initializeDefaultProfiles() {
    // Character voice profiles menu
    const characterProfiles: Record<string, Partial<VoiceProfile>> = {
      // Maya - Primary Oracle Voice (warm, mystical, feminine)
      'maya-default': {
        id: 'maya-default',
        name: 'Maya - Sacred Oracle',
        baseVoice: 'nova', // Nova has warmth and clarity
        parameters: {
          temperature: 0.75,    // Expressive but controlled
          speed: 0.95,          // Slightly slower for gravitas
          pitch: 1,             // Slightly higher for feminine tone
          consistency: 0.85,    // High consistency for trust
          emotionalDepth: 0.9,  // Very emotionally expressive
          resonance: 0.8,       // Rich, warm tone
          clarity: 0.9,         // Clear articulation
          breathiness: 0.35     // Soft, approachable quality
        }
      },

      // Miles - Wise Guide Voice (deep, grounded, masculine)
      'miles-default': {
        id: 'miles-default',
        name: 'Miles - Wisdom Guide',
        baseVoice: 'onyx', // Onyx has depth and gravitas
        parameters: {
          temperature: 0.6,     // Measured, thoughtful
          speed: 0.9,           // Deliberate pace
          pitch: -3,            // Lower for masculine depth
          consistency: 0.95,    // Very stable and reliable
          emotionalDepth: 0.7,  // Present but contained emotion
          resonance: 1.0,       // Maximum depth and warmth
          clarity: 0.95,        // Crystal clear wisdom
          breathiness: 0.1      // Minimal breathiness for authority
        }
      },

      // Anthony - Modern Mystic (balanced, contemporary)
      'anthony-default': {
        id: 'anthony-default',
        name: 'Anthony - Modern Mystic',
        baseVoice: 'alloy', // Alloy is balanced and neutral
        parameters: {
          temperature: 0.7,
          speed: 1.0,
          pitch: 0,
          consistency: 0.8,
          emotionalDepth: 0.75,
          resonance: 0.7,
          clarity: 0.85,
          breathiness: 0.25
        }
      },

      // Aria - Ethereal Spirit (light, otherworldly)
      'aria-default': {
        id: 'aria-default',
        name: 'Aria - Ethereal Spirit',
        baseVoice: 'shimmer', // Shimmer for ethereal quality
        parameters: {
          temperature: 0.8,
          speed: 1.05,
          pitch: 4,
          consistency: 0.6,
          emotionalDepth: 0.85,
          resonance: 0.5,
          clarity: 0.8,
          breathiness: 0.6
        }
      },

      // Sage - Ancient Wisdom (timeless, androgynous)
      'sage-default': {
        id: 'sage-default',
        name: 'Sage - Ancient Wisdom',
        baseVoice: 'echo', // Echo for mystical quality
        parameters: {
          temperature: 0.65,
          speed: 0.88,
          pitch: -1,
          consistency: 0.9,
          emotionalDepth: 0.8,
          resonance: 0.85,
          clarity: 0.88,
          breathiness: 0.3
        }
      },

      // Luna - Night Oracle (mysterious, intuitive)
      'luna-default': {
        id: 'luna-default',
        name: 'Luna - Night Oracle',
        baseVoice: 'fable', // Fable for storytelling quality
        parameters: {
          temperature: 0.85,
          speed: 0.92,
          pitch: 2,
          consistency: 0.7,
          emotionalDepth: 0.95,
          resonance: 0.75,
          clarity: 0.75,
          breathiness: 0.45
        }
      }
    };

    // Maya's elemental voice variations
    const mayaElementalProfiles: Record<string, Partial<VoiceProfile>> = {
      'maya-fire': {
        id: 'maya-fire',
        name: 'Maya - Fire Element',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.85,
          speed: 1.05,
          pitch: 2,
          consistency: 0.75,
          emotionalDepth: 0.95,
          resonance: 0.7,
          clarity: 0.85,
          breathiness: 0.25
        }
      },
      'maya-water': {
        id: 'maya-water',
        name: 'Maya - Water Element',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.7,
          speed: 0.88,
          pitch: 0,
          consistency: 0.8,
          emotionalDepth: 0.85,
          resonance: 0.9,
          clarity: 0.75,
          breathiness: 0.5
        }
      },
      'maya-earth': {
        id: 'maya-earth',
        name: 'Maya - Earth Element',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.6,
          speed: 0.85,
          pitch: -1,
          consistency: 0.9,
          emotionalDepth: 0.7,
          resonance: 0.95,
          clarity: 0.9,
          breathiness: 0.2
        }
      },
      'maya-air': {
        id: 'maya-air',
        name: 'Maya - Air Element',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.75,
          speed: 1.02,
          pitch: 3,
          consistency: 0.65,
          emotionalDepth: 0.8,
          resonance: 0.6,
          clarity: 0.95,
          breathiness: 0.6
        }
      },
      'maya-aether': {
        id: 'maya-aether',
        name: 'Maya - Aether Element',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.8,
          speed: 0.95,
          pitch: 1,
          consistency: 0.7,
          emotionalDepth: 1.0,
          resonance: 0.85,
          clarity: 0.85,
          breathiness: 0.4
        }
      }
    };

    // Miles' elemental voice variations
    const milesElementalProfiles: Record<string, Partial<VoiceProfile>> = {
      'miles-fire': {
        id: 'miles-fire',
        name: 'Miles - Fire Element',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.7,
          speed: 0.95,
          pitch: -2,
          consistency: 0.9,
          emotionalDepth: 0.8,
          resonance: 0.9,
          clarity: 1.0,
          breathiness: 0.05
        }
      },
      'miles-water': {
        id: 'miles-water',
        name: 'Miles - Water Element',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.55,
          speed: 0.85,
          pitch: -4,
          consistency: 0.95,
          emotionalDepth: 0.65,
          resonance: 1.0,
          clarity: 0.85,
          breathiness: 0.15
        }
      },
      'miles-earth': {
        id: 'miles-earth',
        name: 'Miles - Earth Element',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.5,
          speed: 0.82,
          pitch: -5,
          consistency: 1.0,
          emotionalDepth: 0.6,
          resonance: 1.0,
          clarity: 0.95,
          breathiness: 0.0
        }
      },
      'miles-air': {
        id: 'miles-air',
        name: 'Miles - Air Element',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.65,
          speed: 0.92,
          pitch: -2,
          consistency: 0.85,
          emotionalDepth: 0.75,
          resonance: 0.85,
          clarity: 0.98,
          breathiness: 0.2
        }
      },
      'miles-aether': {
        id: 'miles-aether',
        name: 'Miles - Aether Element',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.6,
          speed: 0.88,
          pitch: -3,
          consistency: 0.9,
          emotionalDepth: 0.85,
          resonance: 0.95,
          clarity: 0.9,
          breathiness: 0.1
        }
      }
    };

    // Add all profiles to the map
    Object.entries({
      ...characterProfiles,
      ...mayaElementalProfiles,
      ...milesElementalProfiles
    }).forEach(([key, profile]) => {
      this.voiceProfiles.set(profile.id!, profile as VoiceProfile);
    });
  }

  // Get voice menu for UI
  getVoiceMenu(): {
    characters: VoiceProfile[];
    mayaVariations: VoiceProfile[];
    milesVariations: VoiceProfile[];
    custom: VoiceProfile[];
  } {
    const allProfiles = Array.from(this.voiceProfiles.values());

    return {
      characters: allProfiles.filter(p =>
        ['maya-default', 'miles-default', 'anthony-default', 'aria-default', 'sage-default', 'luna-default']
          .includes(p.id)
      ),
      mayaVariations: allProfiles.filter(p => p.id.startsWith('maya-') && p.id !== 'maya-default'),
      milesVariations: allProfiles.filter(p => p.id.startsWith('miles-') && p.id !== 'miles-default'),
      custom: allProfiles.filter(p => p.clonedFrom !== undefined)
    };
  }

  async generateSpeech(request: VoiceGenerationRequest): Promise<{
    audioData?: Buffer;
    audioUrl?: string;
    duration?: number;
    metadata?: any;
  }> {
    // Check concurrent request limit
    if (this.activeRequests >= this.config.maxConcurrentRequests) {
      await this.waitForSlot();
    }

    this.activeRequests++;
    this.emit('generation:start', request);

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(request);
      if (this.config.cacheEnabled && this.audioCache.has(cacheKey)) {
        this.emit('cache:hit', cacheKey);
        return { audioData: this.audioCache.get(cacheKey)! };
      }

      // Select voice profile based on element or use provided profile
      const voiceProfile = this.selectVoiceProfile(request);

      // Apply emotional and prosody modulation
      const modulatedParams = this.applyEmotionalModulation(
        voiceProfile.parameters,
        request.emotionalContext
      );

      // Prepare API request
      const apiRequest = {
        model: 'sesame-csm-1b',
        input: request.text,
        voice: voiceProfile.baseVoice,
        response_format: request.format || 'mp3',
        speed: modulatedParams.speed,
        // Additional Sesame-specific parameters
        temperature: modulatedParams.temperature,
        pitch_shift: modulatedParams.pitch,
        voice_consistency: modulatedParams.consistency,
        emotional_depth: modulatedParams.emotionalDepth,
        resonance: modulatedParams.resonance,
        clarity: modulatedParams.clarity,
        breathiness: modulatedParams.breathiness,
        // Prosody hints
        emphasis: request.prosodyHints?.emphasis,
        pauses: request.prosodyHints?.pauses,
        intonation: request.prosodyHints?.intonation
      };

      // Use OpenAI TTS for actual voice generation
      const openAIKey = process.env.OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Call OpenAI TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1-hd', // High quality model
          input: request.text,
          voice: voiceProfile.baseVoice,
          response_format: request.format || 'mp3',
          speed: modulatedParams.speed
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI TTS failed: ${error}`);
      }

      // Get audio data as buffer
      const audioData = Buffer.from(await response.arrayBuffer());

      // Cache the result
      if (this.config.cacheEnabled) {
        this.audioCache.set(cacheKey, audioData);
      }

      this.emit('generation:complete', {
        request,
        size: audioData.length,
        profile: voiceProfile.id
      });

      return {
        audioData,
        duration: undefined, // OpenAI doesn't provide duration in headers
        metadata: {
          profile: voiceProfile.id,
          modulation: modulatedParams,
          cached: false,
          provider: 'openai',
          model: 'tts-1-hd',
          voice: voiceProfile.baseVoice
        }
      };

    } catch (error) {
      this.emit('generation:error', error);
      throw error;
    } finally {
      this.activeRequests--;
    }
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceProfile> {
    this.emit('clone:start', request);

    try {
      const formData = new FormData();

      if (request.sourceUrl) {
        formData.append('source_url', request.sourceUrl);
      } else if (request.sourceFile) {
        formData.append('audio_file', new Blob([request.sourceFile]));
      }

      formData.append('name', request.name);
      formData.append('base_voice', request.baseVoice || 'nova');
      formData.append('preserve_accent', String(request.preserveAccent ?? true));
      formData.append('preserve_age', String(request.preserveAge ?? true));
      formData.append('preserve_gender', String(request.preserveGender ?? true));

      // Voice cloning placeholder - OpenAI doesn't support cloning yet
      // Store the request for future implementation
      const clonedId = `cloned-${Date.now()}`;

      const clonedProfile: VoiceProfile = {
        id: clonedId,
        name: request.name,
        baseVoice: request.baseVoice || 'nova',
        clonedFrom: request.sourceUrl || 'uploaded_file',
        parameters: {
          temperature: 0.7,
          speed: 1.0,
          pitch: 0,
          consistency: 0.9,
          emotionalDepth: 0.8,
          resonance: 0.7,
          clarity: 0.85,
          breathiness: 0.3
        },
        metadata: {
          createdAt: new Date(),
          lastUsed: new Date(),
          usageCount: 0
        }
      };

      this.voiceProfiles.set(clonedProfile.id, clonedProfile);
      this.emit('clone:complete', clonedProfile);

      return clonedProfile;

    } catch (error) {
      this.emit('clone:error', error);
      throw error;
    }
  }

  private selectVoiceProfile(request: VoiceGenerationRequest): VoiceProfile {
    if (request.voiceProfile) {
      return request.voiceProfile;
    }

    if (request.element) {
      const elementProfile = this.voiceProfiles.get(`maya-${request.element.toLowerCase()}`);
      if (elementProfile) {
        return elementProfile;
      }
    }

    // Return default profile
    return {
      id: 'default',
      name: 'Default Voice',
      baseVoice: this.config.defaultVoice,
      parameters: {
        temperature: 0.7,
        speed: 1.0,
        pitch: 0,
        consistency: 0.8,
        emotionalDepth: 0.7,
        resonance: 0.6,
        clarity: 0.8,
        breathiness: 0.3
      }
    };
  }

  private applyEmotionalModulation(
    baseParams: VoiceModulation,
    emotionalContext?: VoiceGenerationRequest['emotionalContext']
  ): VoiceModulation {
    if (!emotionalContext) {
      return baseParams;
    }

    const modulated = { ...baseParams };
    const { mood, intensity, jungianPhase } = emotionalContext;

    // Mood-based modulation
    const moodModulations: Record<string, Partial<VoiceModulation>> = {
      joyful: { speed: 1.1, pitch: 2, emotionalDepth: 0.9 },
      sad: { speed: 0.9, pitch: -2, breathiness: 0.6 },
      angry: { speed: 1.05, clarity: 0.95, resonance: 0.8 },
      peaceful: { speed: 0.95, breathiness: 0.5, emotionalDepth: 0.6 },
      mystical: { resonance: 0.9, breathiness: 0.4, consistency: 0.6 },
      passionate: { temperature: 0.9, emotionalDepth: 1.0, speed: 1.05 }
    };

    if (mood && moodModulations[mood]) {
      const moodMod = moodModulations[mood];
      Object.entries(moodMod).forEach(([key, value]) => {
        const k = key as keyof VoiceModulation;
        modulated[k] = (modulated[k] + value) / 2; // Blend with base
      });
    }

    // Jungian phase modulation
    const jungianModulations: Record<string, Partial<VoiceModulation>> = {
      mirror: { clarity: 0.95, consistency: 0.9 },
      shadow: { resonance: 0.8, breathiness: 0.4, pitch: -2 },
      anima: { emotionalDepth: 0.9, breathiness: 0.5, temperature: 0.8 },
      self: { consistency: 0.95, clarity: 0.9, resonance: 0.85 }
    };

    if (jungianPhase && jungianModulations[jungianPhase]) {
      const jungMod = jungianModulations[jungianPhase];
      Object.entries(jungMod).forEach(([key, value]) => {
        const k = key as keyof VoiceModulation;
        modulated[k] = (modulated[k] + value) / 2;
      });
    }

    // Apply intensity scaling
    if (intensity) {
      modulated.emotionalDepth *= intensity;
      modulated.temperature = Math.min(1.0, modulated.temperature * (0.5 + intensity * 0.5));
    }

    return this.normalizeParameters(modulated);
  }

  private normalizeParameters(params: VoiceModulation): VoiceModulation {
    return {
      temperature: Math.max(0, Math.min(1, params.temperature)),
      speed: Math.max(0.5, Math.min(2, params.speed)),
      pitch: Math.max(-12, Math.min(12, params.pitch)),
      consistency: Math.max(0, Math.min(1, params.consistency)),
      emotionalDepth: Math.max(0, Math.min(1, params.emotionalDepth)),
      resonance: Math.max(0, Math.min(1, params.resonance)),
      clarity: Math.max(0, Math.min(1, params.clarity)),
      breathiness: Math.max(0, Math.min(1, params.breathiness))
    };
  }

  private getCacheKey(request: VoiceGenerationRequest): string {
    return `${request.text}-${request.voiceProfile?.id || 'default'}-${request.element}-${JSON.stringify(request.emotionalContext)}`;
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = setInterval(() => {
        if (this.activeRequests < this.config.maxConcurrentRequests) {
          clearInterval(checkSlot);
          resolve();
        }
      }, 100);
    });
  }

  // Voice profile management
  async saveVoiceProfile(profile: VoiceProfile): Promise<void> {
    this.voiceProfiles.set(profile.id, profile);
    this.emit('profile:saved', profile);
  }

  getVoiceProfile(id: string): VoiceProfile | undefined {
    return this.voiceProfiles.get(id);
  }

  getAllVoiceProfiles(): VoiceProfile[] {
    return Array.from(this.voiceProfiles.values());
  }

  // Cache management
  clearCache(): void {
    this.audioCache.clear();
    this.emit('cache:cleared');
  }

  getCacheSize(): number {
    let size = 0;
    this.audioCache.forEach(buffer => {
      size += buffer.length;
    });
    return size;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Check OpenAI API health
      const openAIKey = process.env.OPENAI_API_KEY;
      if (!openAIKey) return false;

      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openAIKey}`
          }
        });
        return response.ok;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }
}

export default SesameVoiceService;