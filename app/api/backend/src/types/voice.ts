/**
 * Voice System Type Definitions
 * Complete type system for voice synthesis and TTS
 */

export interface VoiceRequest {
  text: string;
  voiceEngine?: 'elevenlabs' | 'sesame' | 'auto';
  voiceId?: string;
  voiceName?: string;
  testMode?: boolean;
  
  // Voice settings for different engines
  voiceSettings?: {
    // ElevenLabs settings
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
    
    // Sesame settings
    speed?: number;
    pitch?: number;
    volume?: number;
    emotion?: string;
  };
  
  // Voice preset configurations
  preset?: 'maya' | 'oracle' | 'guardian' | 'sage' | 'mystic' | 'alchemist' | 'weaver';
  
  // Metadata
  metadata?: {
    voiceName?: string;
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    archetype?: string;
    sessionId?: string;
    userId?: string;
  };
  
  // Advanced options
  outputFormat?: 'mp3' | 'wav' | 'ogg' | 'pcm';
  sampleRate?: number;
  bitrate?: number;
  streaming?: boolean;
}

export interface VoiceResponse {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: Buffer;
  duration?: number;
  voiceUsed?: string;
  engine?: string;
  error?: string;
  fallbackUsed?: boolean;
  cached?: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  engine: 'elevenlabs' | 'sesame' | 'openai' | 'azure';
  voiceId: string;
  
  // Personality settings
  personality: {
    archetype: string;
    element: string;
    tone: 'warm' | 'neutral' | 'mystical' | 'authoritative' | 'gentle';
    speed: 'slow' | 'normal' | 'fast';
    pitch: 'low' | 'medium' | 'high';
  };
  
  // Engine-specific settings
  settings: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    emotion?: string;
    prosody?: {
      rate?: number;
      pitch?: number;
      volume?: number;
    };
  };
  
  // Usage metadata
  metadata?: {
    description?: string;
    bestFor?: string[];
    languages?: string[];
    gender?: string;
    age?: string;
    accent?: string;
  };
}

export interface TTSConfig {
  primaryEngine: 'elevenlabs' | 'sesame' | 'openai';
  fallbackEngine?: string;
  enableCache: boolean;
  cacheDir?: string;
  maxCacheSize?: number;
  timeout: number;
  retryAttempts: number;
  
  // Engine configurations
  engines: {
    elevenlabs?: {
      apiKey: string;
      baseUrl?: string;
      model?: string;
      voiceIds: Record<string, string>;
    };
    sesame?: {
      url: string;
      apiKey?: string;
      model?: string;
      voices: Record<string, string>;
    };
    openai?: {
      apiKey: string;
      model?: string;
      voice?: string;
    };
  };
  
  // Default settings
  defaults: {
    voice: string;
    language: string;
    outputFormat: string;
    sampleRate: number;
  };
}

export interface VoiceStreamRequest {
  text: string;
  voiceId: string;
  chunkSize?: number;
  onChunk?: (chunk: Buffer) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface VoiceAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  cacheHitRate: number;
  engineUsage: Record<string, number>;
  voiceUsage: Record<string, number>;
  totalCharacters: number;
  totalDuration: number;
}

// Archetypal voice mappings
export const ARCHETYPAL_VOICES = {
  maya: {
    name: 'Maya - Sacred Guide',
    voiceId: 'maya_voice_id',
    element: 'aether',
    archetype: 'guide',
    settings: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.5
    }
  },
  oracle: {
    name: 'Oracle - Divine Wisdom',
    voiceId: 'oracle_voice_id',
    element: 'aether',
    archetype: 'sage',
    settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.6
    }
  },
  guardian: {
    name: 'Guardian - Protective Force',
    voiceId: 'guardian_voice_id',
    element: 'earth',
    archetype: 'protector',
    settings: {
      stability: 0.9,
      similarity_boost: 0.8,
      style: 0.3
    }
  },
  sage: {
    name: 'Sage - Ancient Knowledge',
    voiceId: 'sage_voice_id',
    element: 'air',
    archetype: 'teacher',
    settings: {
      stability: 0.85,
      similarity_boost: 0.75,
      style: 0.7
    }
  },
  mystic: {
    name: 'Mystic - Ethereal Presence',
    voiceId: 'mystic_voice_id',
    element: 'water',
    archetype: 'visionary',
    settings: {
      stability: 0.6,
      similarity_boost: 0.95,
      style: 0.8
    }
  },
  alchemist: {
    name: 'Alchemist - Transformative Power',
    voiceId: 'alchemist_voice_id',
    element: 'fire',
    archetype: 'transformer',
    settings: {
      stability: 0.7,
      similarity_boost: 0.85,
      style: 0.6
    }
  },
  weaver: {
    name: 'Weaver - Connective Thread',
    voiceId: 'weaver_voice_id',
    element: 'air',
    archetype: 'integrator',
    settings: {
      stability: 0.75,
      similarity_boost: 0.8,
      style: 0.5
    }
  }
} as const;

export type ArchetypalVoiceType = keyof typeof ARCHETYPAL_VOICES;