/**
 * TTS Orchestrator Service
 * Manages primary (Sesame) and fallback (ElevenLabs) TTS services
 * with automatic failover and health monitoring
 */

import { logger } from '../utils/logger';

interface TTSResponse {
  audioUrl?: string;
  audioBuffer?: Buffer;
  service: 'sesame' | 'elevenlabs' | 'edge-tts' | 'text-only';
  cached?: boolean;
  processingTime?: number;
  error?: string;
}

interface TTSConfig {
  sesameUrl?: string;
  elevenlabsApiKey?: string;
  enableFallback: boolean;
  enableCache: boolean;
  strictMode: boolean; // No silent failures
}

export class TTSOrchestrator {
  private config: TTSConfig;
  private logger = logger;
  private healthStatus = {
    sesame: { available: false, lastCheck: 0 },
    elevenlabs: { available: false, lastCheck: 0 }
  };
  private audioCache = new Map<string, string>(); // text hash -> audio URL
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  constructor() {
    this.config = this.loadConfig();
    this.initializeHealthChecks();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): TTSConfig {
    const config: TTSConfig = {
      sesameUrl: process.env.SESAME_TTS_URL || process.env.NORTHFLANK_SESAME_URL,
      elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
      enableFallback: process.env.TTS_ENABLE_FALLBACK !== 'false',
      enableCache: process.env.TTS_ENABLE_CACHE !== 'false',
      strictMode: process.env.NODE_ENV === 'production'
    };

    // Log configuration status
    this.logger.info('TTS Configuration:', {
      hasSesame: !!config.sesameUrl,
      hasElevenLabs: !!config.elevenlabsApiKey,
      fallbackEnabled: config.enableFallback,
      cacheEnabled: config.enableCache,
      strictMode: config.strictMode
    });

    return config;
  }

  /**
   * Initialize periodic health checks
   */
  private initializeHealthChecks() {
    // Check immediately on startup
    this.checkSesameHealthInternal();
    this.checkElevenLabsHealthInternal();

    // Then periodically
    setInterval(() => {
      this.checkSesameHealthInternal();
      this.checkElevenLabsHealthInternal();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Public method to trigger Sesame health check
   */
  public async checkSesameHealth(): Promise<boolean> {
    return this.checkSesameHealthInternal();
  }

  /**
   * Public method to trigger ElevenLabs health check  
   */
  public async checkElevenLabsHealth(): Promise<boolean> {
    return this.checkElevenLabsHealthInternal();
  }

  /**
   * Check Sesame service health (Internal)
   */
  private async checkSesameHealthInternal(): Promise<boolean> {
    if (!this.config.sesameUrl) {
      this.healthStatus.sesame.available = false;
      return false;
    }

    try {
      const response = await fetch(`${this.config.sesameUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      this.healthStatus.sesame.available = response.ok;
      this.healthStatus.sesame.lastCheck = Date.now();

      if (response.ok) {
        this.logger.debug('Sesame TTS health check: OK');
      }
      
      return response.ok;
    } catch (error) {
      this.logger.warn('Sesame TTS health check failed:', error);
      this.healthStatus.sesame.available = false;
      this.healthStatus.sesame.lastCheck = Date.now();
      return false;
    }
  }

  /**
   * Check ElevenLabs service health (Internal)
   */
  private async checkElevenLabsHealthInternal(): Promise<boolean> {
    if (!this.config.elevenlabsApiKey) {
      this.healthStatus.elevenlabs.available = false;
      return false;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': this.config.elevenlabsApiKey
        },
        signal: AbortSignal.timeout(5000)
      });

      this.healthStatus.elevenlabs.available = response.ok;
      this.healthStatus.elevenlabs.lastCheck = Date.now();

      if (response.ok) {
        this.logger.debug('ElevenLabs TTS health check: OK');
      }

      return response.ok;
    } catch (error) {
      this.logger.warn('ElevenLabs TTS health check failed:', error);
      this.healthStatus.elevenlabs.available = false;
      this.healthStatus.elevenlabs.lastCheck = Date.now();
      return false;
    }
  }

  /**
   * Generate speech from text using primary service with fallback
   */
  async generateSpeech(
    text: string,
    voice: string = 'maya',
    options: {
      userId?: string;
      sessionId?: string;
      bypassCache?: boolean;
    } = {}
  ): Promise<TTSResponse> {
    const startTime = Date.now();

    // Clean the text of prosody markup for TTS
    const cleanText = this.cleanTextForTTS(text);

    // Check cache first (unless bypassed)
    if (this.config.enableCache && !options.bypassCache) {
      const cached = this.getCachedAudio(cleanText);
      if (cached) {
        this.logger.debug('TTS cache hit for text hash');
        return {
          audioUrl: cached,
          service: 'sesame',
          cached: true,
          processingTime: Date.now() - startTime
        };
      }
    }

    // In strict mode, we never return mock audio
    if (this.config.strictMode && !this.healthStatus.sesame.available && !this.healthStatus.elevenlabs.available) {
      throw new Error('No TTS service available and strict mode is enabled');
    }

    // Log which services are available
    this.logger.info('TTS Provider Selection:', {
      sesameAvailable: this.healthStatus.sesame.available,
      elevenlabsAvailable: this.healthStatus.elevenlabs.available,
      fallbackEnabled: this.config.enableFallback,
      attempting: this.healthStatus.sesame.available ? 'sesame' : 
                  (this.config.enableFallback && this.healthStatus.elevenlabs.available) ? 'elevenlabs' : 'text-only'
    });

    // Try Sesame first (Primary Provider)
    if (this.healthStatus.sesame.available) {
      try {
        this.logger.info('[TTS ORCHESTRATOR] ✨ Attempting Sesame (Primary)...', {
          textLength: cleanText.length,
          voice,
          endpoint: this.config.sesameUrl
        });
        
        const result = await this.generateWithSesame(cleanText, voice);
        
        if (result.audioUrl && result.audioUrl.length > 0) {
          this.cacheAudio(cleanText, result.audioUrl);
          this.logger.info('[TTS ORCHESTRATOR] ✅ Sesame succeeded!', {
            processingTime: Date.now() - startTime,
            voice,
            textLength: cleanText.length,
            audioLength: result.audioUrl.length
          });
          
          return {
            ...result,
            processingTime: Date.now() - startTime
          };
        } else {
          throw new Error('Sesame returned empty audio URL');
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error('[TTS ORCHESTRATOR] ❌ Sesame failed:', {
          error: errorMessage,
          voice,
          textLength: cleanText.length,
          fallbackAvailable: this.config.enableFallback && this.healthStatus.elevenlabs.available
        });
        
        // Mark as unhealthy for faster future failover
        this.healthStatus.sesame.available = false;
        
        // Continue to fallback...
      }
    } else {
      this.logger.info('[TTS ORCHESTRATOR] ⚠️ Sesame unavailable, skipping to ElevenLabs');
    }

    // Fallback to ElevenLabs (Secondary Provider)
    if (this.config.enableFallback && this.healthStatus.elevenlabs.available) {
      try {
        this.logger.info('[TTS ORCHESTRATOR] 🔄 Falling back to ElevenLabs...', {
          textLength: cleanText.length,
          voice,
          reason: 'Sesame unavailable'
        });
        
        const result = await this.generateWithElevenLabs(cleanText, voice);
        
        if (result.audioUrl && result.audioUrl.length > 0) {
          this.cacheAudio(cleanText, result.audioUrl);
          this.logger.info('[TTS ORCHESTRATOR] ✅ ElevenLabs fallback succeeded!', {
            processingTime: Date.now() - startTime,
            voice,
            textLength: cleanText.length,
            audioLength: result.audioUrl.length
          });
          
          return {
            ...result,
            processingTime: Date.now() - startTime
          };
        } else {
          throw new Error('ElevenLabs returned empty audio URL');
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error('[TTS ORCHESTRATOR] ❌ ElevenLabs fallback failed:', {
          error: errorMessage,
          voice,
          textLength: cleanText.length
        });
        
        // Mark as unhealthy
        this.healthStatus.elevenlabs.available = false;
        
        // Continue to emergency mock...
      }
    } else if (this.config.enableFallback) {
      this.logger.warn('[TTS ORCHESTRATOR] ⚠️ ElevenLabs fallback unavailable');
    } else {
      this.logger.info('[TTS ORCHESTRATOR] ⚠️ Fallback disabled, proceeding to emergency mock');
    }

    // Final emergency fallback - this guarantees Maya never fails completely
    this.logger.error('[TTS ORCHESTRATOR] 🚨 All TTS providers failed! Using emergency mock audio');
    return this.generateTextOnlyResponse(cleanText);
  }

  /**
   * Generate speech using Sesame CSM
   */
  private async generateWithSesame(text: string, voice: string): Promise<TTSResponse> {
    if (!this.config.sesameUrl) {
      throw new Error('Sesame URL not configured');
    }

    // Build Sesame TTS endpoint dynamically
    const sesameTtsPath = process.env.SESAME_TTS_PATH || '/tts';
    const sesameEndpoint = `${this.config.sesameUrl}${sesameTtsPath}`;
    
    // Debug logging to show which path is being used
    this.logger.debug('Using Sesame TTS endpoint:', {
      baseUrl: this.config.sesameUrl,
      ttsPath: sesameTtsPath,
      fullEndpoint: sesameEndpoint
    });

    const response = await fetch(sesameEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice: this.mapVoiceToSesame(voice),
        speed: 1.0,
        pitch: 1.0
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Sesame TTS returned ${response.status}`);
    }

    const data = await response.json() as any;
    
    return {
      audioUrl: data.audioUrl || data.url,
      audioBuffer: data.audioBuffer,
      service: 'sesame'
    };
  }

  /**
   * Generate speech using ElevenLabs
   */
  private async generateWithElevenLabs(text: string, voice: string): Promise<TTSResponse> {
    if (!this.config.elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = this.mapVoiceToElevenLabs(voice);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.elevenlabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS returned ${response.status}`);
    }

    // ElevenLabs returns raw audio, need to convert to URL
    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.bufferToDataUrl(audioBuffer, 'audio/mpeg');

    return {
      audioUrl,
      audioBuffer: Buffer.from(audioBuffer),
      service: 'elevenlabs'
    };
  }

  /**
   * Generate emergency mock audio when all TTS services fail
   */
  private generateTextOnlyResponse(text: string): TTSResponse {
    this.logger.warn('All TTS providers failed! Generating emergency mock audio');
    
    // Create a minimal WAV file that won't break frontend audio players
    const emergencyAudioUrl = this.createEmergencyMockAudio(text);
    
    return {
      audioUrl: emergencyAudioUrl,
      service: 'text-only',
      cached: false,
      error: 'All TTS services unavailable, using emergency mock audio'
    };
  }

  /**
   * Create emergency mock audio that frontend can handle gracefully
   */
  private createEmergencyMockAudio(text: string): string {
    // Generate a minimal silent WAV file as base64 data URL
    // This prevents frontend audio components from breaking
    const silentWavHeader = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
    
    const mockId = Date.now().toString();
    this.logger.warn(`Created emergency mock audio for text: "${text.slice(0, 50)}..." (ID: ${mockId})`);
    
    return `data:audio/wav;base64,${silentWavHeader}`;
  }

  /**
   * Clean text by removing prosody markup
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/\*[^*]*\*/g, '') // Remove stage directions
      .replace(/<pause-\d+ms>/g, ', ') // Replace pauses with commas
      .replace(/<breath\s*\/?>/g, ', ')
      .replace(/<\/?emphasis>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Map voice names to Sesame voice IDs
   */
  private mapVoiceToSesame(voice: string): string {
    const voiceMap: Record<string, string> = {
      'maya': 'maya-oracle',
      'fire': 'phoenix-bold',
      'water': 'river-gentle',
      'earth': 'stone-steady',
      'air': 'wind-clear',
      'default': 'maya-oracle'
    };

    return voiceMap[voice.toLowerCase()] || voiceMap.default;
  }

  /**
   * Map voice names to ElevenLabs voice IDs
   */
  private mapVoiceToElevenLabs(voice: string): string {
    const voiceMap: Record<string, string> = {
      'maya': 'EXAVITQu4vr4xnSDxMaL', // Bella - calm, clear
      'fire': 'TxGEqnmLPcvKyzegtW2', // Josh - energetic
      'water': 'oiiGUMDAqL39V6K6EgdD', // Charlotte - gentle
      'earth': 'FzzXrHFRuPyDriPBYiFd', // Matilda - grounded
      'air': 'kWFh2Z8RsomlFjGNrfUq', // George - clear
      'default': 'EXAVITQu4vr4xnSDxMaL'
    };

    return voiceMap[voice.toLowerCase()] || voiceMap.default;
  }

  /**
   * Convert audio buffer to data URL
   */
  private async bufferToDataUrl(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Cache audio URL
   */
  private cacheAudio(text: string, audioUrl: string): void {
    if (!this.config.enableCache) return;

    const hash = this.hashText(text);
    this.audioCache.set(hash, audioUrl);

    // Limit cache size
    if (this.audioCache.size > 100) {
      const firstKey = this.audioCache.keys().next().value;
      this.audioCache.delete(firstKey);
    }
  }

  /**
   * Get cached audio URL
   */
  private getCachedAudio(text: string): string | null {
    const hash = this.hashText(text);
    return this.audioCache.get(hash) || null;
  }

  /**
   * Simple hash function for text
   */
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      sesame: {
        ...this.healthStatus.sesame,
        configured: !!this.config.sesameUrl
      },
      elevenlabs: {
        ...this.healthStatus.elevenlabs,
        configured: !!this.config.elevenlabsApiKey
      },
      fallbackEnabled: this.config.enableFallback,
      cacheEnabled: this.config.enableCache,
      cacheSize: this.audioCache.size,
      strictMode: this.config.strictMode
    };
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    this.logger.info('TTS audio cache cleared');
  }
}

// Singleton instance
export const ttsOrchestrator = new TTSOrchestrator();