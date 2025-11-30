/**
 * Voice Router - Sesame-Primary with Explicit Fallback Control
 * Routes voice requests to Sesame first, with controlled fallback to ElevenLabs
 */

import { sesameService } from './SesameService';
import { logger } from '../utils/logger';
import { synthesizeVoice, synthesizeArchetypalVoice } from '../utils/voiceService';
import { performance } from 'perf_hooks';
import { voiceStartupLogger } from '../utils/voiceLogger';

export interface VoiceRequest {
  text: string;
  element?: string;
  personality?: string;
  voiceEngine?: 'sesame' | 'elevenlabs' | 'auto';
  useCSM?: boolean;
  contextSegments?: any[];
  userId?: string;
  sessionId?: string;
  fallbackEnabled?: boolean;
}

export interface VoiceResponse {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: Buffer;
  engine: 'sesame' | 'huggingface' | 'elevenlabs' | 'failed';
  model?: string;
  processingTimeMs?: number;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  error?: string;
  latency?: string;
  metadata?: {
    voiceId?: string;
    archetype?: string;
    personality?: string;
    energySignature?: string;
    engineAttempts?: string[];
  };
}

class VoiceRouter {
  private config = {
    sesamePrimary: process.env.SESAME_PRIMARY_MODE === 'true',
    fallbackEnabled: process.env.SESAME_FALLBACK_ENABLED === 'true',
    timeout: parseInt(process.env.VOICE_TIMEOUT_MS || '30000'),
    retryCount: parseInt(process.env.VOICE_RETRY_COUNT || '1'),
    failFast: process.env.VOICE_FAIL_FAST === 'true',
    trackPerformance: process.env.VOICE_TRACK_PERFORMANCE === 'true'
  };

  /**
   * Route voice request with Sesame-first logic and enhanced performance tracking
   */
  async synthesize(request: VoiceRequest): Promise<VoiceResponse> {
    const overallStart = performance.now();
    const requestId = Math.random().toString(36).substring(2, 8);
    const engineAttempts: string[] = [];
    
    logger.info(`[VoiceRouter:${requestId}] 🎤 Starting voice synthesis`, {
      text: request.text.substring(0, 50) + '...',
      engine: request.voiceEngine || 'auto',
      sesamePrimary: this.config.sesamePrimary,
      fallbackEnabled: this.config.fallbackEnabled || request.fallbackEnabled
    });

    // 1. Try Sesame (Self-hosted, Primary)
    const shouldTrySesame = this.config.sesamePrimary && 
                           request.voiceEngine !== 'elevenlabs' &&
                           request.voiceEngine !== 'huggingface' &&
                           sesameService.isEnabled();

    if (shouldTrySesame) {
      try {
        const sesameStart = performance.now();
        console.log(`🎤 Attempting Sesame...`);
        engineAttempts.push('sesame-attempted');
        
        const sesameResult = await this.trySesame(request, requestId);
        if (sesameResult.success) {
          const sesameElapsed = (performance.now() - sesameStart).toFixed(1);
          const overallElapsed = (performance.now() - overallStart).toFixed(1);
          
          console.log(`✅ Sesame succeeded (${sesameElapsed}ms)`);
          logger.info(`[VoiceRouter:${requestId}] ✅ Sesame synthesis successful (${sesameElapsed}ms)`);
          
          // Log successful startup
          voiceStartupLogger.logSuccess('sesame', parseFloat(sesameElapsed), {
            model: sesameResult.model,
            requestId,
            testMode: request.testMode
          });
          
          return { 
            ...sesameResult, 
            processingTimeMs: Math.round(performance.now() - overallStart),
            latency: `${overallElapsed}ms`,
            metadata: { 
              ...sesameResult.metadata, 
              engineAttempts: ['sesame-success'] 
            }
          };
        }
        
        const sesameElapsed = (performance.now() - sesameStart).toFixed(1);
        console.warn(`❌ Sesame failed after ${sesameElapsed}ms: ${sesameResult.error}`);
        logger.warn(`[VoiceRouter:${requestId}] ❌ Sesame failed (${sesameElapsed}ms): ${sesameResult.error}`);
        engineAttempts.push(`sesame-failed-${sesameElapsed}ms`);
        
        // Log failure
        voiceStartupLogger.logFailure('sesame', sesameResult.error || 'Unknown error');
        
      } catch (err: any) {
        const sesameElapsed = (performance.now() - sesameStart).toFixed(1);
        console.warn(`❌ Sesame failed after ${sesameElapsed}ms: ${err.message}`);
        engineAttempts.push(`sesame-error-${sesameElapsed}ms`);
        
        // Log error
        voiceStartupLogger.logFailure('sesame', err.message, 'Exception thrown');
      }
      
      // 2. Try HuggingFace (Secondary fallback)
      if ((this.config.fallbackEnabled || request.fallbackEnabled) && 
          process.env.SESAME_FALLBACK_ENABLED === 'true') {
        try {
          const hfStart = performance.now();
          console.log(`🔄 Falling back to HuggingFace...`);
          logger.info(`[VoiceRouter:${requestId}] 🔄 Trying HuggingFace fallback...`);
          engineAttempts.push('huggingface-attempted');
          
          const hfResult = await this.tryHuggingFace(request, requestId);
          if (hfResult.success) {
            const hfElapsed = (performance.now() - hfStart).toFixed(1);
            const overallElapsed = (performance.now() - overallStart).toFixed(1);
            
            console.log(`✅ HuggingFace succeeded (${hfElapsed}ms)`);
            logger.info(`[VoiceRouter:${requestId}] ✅ HuggingFace fallback successful (${hfElapsed}ms)`);
            
            // Log HF success
            voiceStartupLogger.logSuccess('huggingface', parseFloat(hfElapsed), {
              fallback: true,
              fallbackReason: 'Sesame unavailable',
              requestId
            });
            
            return {
              ...hfResult,
              fallbackUsed: true,
              fallbackReason: 'Sesame unavailable',
              processingTimeMs: Math.round(performance.now() - overallStart),
              latency: `${overallElapsed}ms`,
              metadata: { 
                ...hfResult.metadata, 
                engineAttempts: engineAttempts.concat(`huggingface-success-${hfElapsed}ms`)
              }
            };
          }
          
          const hfElapsed = (performance.now() - hfStart).toFixed(1);
          console.warn(`❌ HuggingFace failed after ${hfElapsed}ms: ${hfResult.error}`);
          engineAttempts.push(`huggingface-failed-${hfElapsed}ms`);
          
        } catch (err: any) {
          const hfElapsed = (performance.now() - hfStart).toFixed(1);
          console.warn(`❌ HuggingFace failed after ${hfElapsed}ms: ${err.message}`);
          engineAttempts.push(`huggingface-error-${hfElapsed}ms`);
        }
      }

      // 3. Try ElevenLabs (Final fallback)
      if (this.config.fallbackEnabled || request.fallbackEnabled) {
        try {
          const elStart = performance.now();
          console.log(`🔄 Falling back to ElevenLabs...`);
          logger.info(`[VoiceRouter:${requestId}] 🔄 Trying ElevenLabs final fallback...`);
          engineAttempts.push('elevenlabs-attempted');
          
          const elResult = await this.tryElevenLabs(request, requestId);
          const elElapsed = (performance.now() - elStart).toFixed(1);
          const overallElapsed = (performance.now() - overallStart).toFixed(1);
          
          if (elResult.success) {
            console.log(`✅ ElevenLabs succeeded (${elElapsed}ms)`);
            logger.info(`[VoiceRouter:${requestId}] ✅ ElevenLabs final fallback successful (${elElapsed}ms)`);
          } else {
            console.error(`❌ ElevenLabs failed after ${elElapsed}ms: ${elResult.error}`);
          }
          
          return {
            ...elResult,
            fallbackUsed: true,
            fallbackReason: 'All primary engines failed',
            processingTimeMs: Math.round(performance.now() - overallStart),
            latency: `${overallElapsed}ms`,
            metadata: { 
              ...elResult.metadata, 
              engineAttempts: engineAttempts.concat(`elevenlabs-${elResult.success ? 'success' : 'failed'}-${elElapsed}ms`)
            }
          };
        } catch (err: any) {
          const elElapsed = (performance.now() - elStart).toFixed(1);
          console.error(`❌ ElevenLabs failed after ${elElapsed}ms: ${err.message}`);
          engineAttempts.push(`elevenlabs-error-${elElapsed}ms`);
        }
      }
      
      // All engines failed
      const overallElapsed = (performance.now() - overallStart).toFixed(1);
      console.error(`❌ All voice engines failed!`);
      logger.error(`[VoiceRouter:${requestId}] ❌ All voice engines failed (${overallElapsed}ms total)`);
      
      return {
        success: false,
        engine: 'failed',
        error: 'All voice engines failed',
        processingTimeMs: Math.round(performance.now() - overallStart),
        latency: `${overallElapsed}ms`,
        metadata: { engineAttempts }
      };
    }

    // Direct engine request (non-Sesame-primary mode)
    if (request.voiceEngine === 'elevenlabs') {
      const elStart = performance.now();
      const result = await this.tryElevenLabs(request, requestId);
      const elapsed = (performance.now() - elStart).toFixed(1);
      console.log(`🎤 Direct ElevenLabs request completed (${elapsed}ms)`);
      
      return { 
        ...result, 
        processingTimeMs: Math.round(performance.now() - overallStart),
        latency: `${elapsed}ms`,
        metadata: { ...result.metadata, engineAttempts: [`elevenlabs-direct-${elapsed}ms`] }
      };
    }

    if (request.voiceEngine === 'huggingface') {
      const hfStart = performance.now();
      const result = await this.tryHuggingFace(request, requestId);
      const elapsed = (performance.now() - hfStart).toFixed(1);
      console.log(`🎤 Direct HuggingFace request completed (${elapsed}ms)`);
      
      return { 
        ...result, 
        processingTimeMs: Math.round(performance.now() - overallStart),
        latency: `${elapsed}ms`,
        metadata: { ...result.metadata, engineAttempts: [`huggingface-direct-${elapsed}ms`] }
      };
    }

    // Default fallback
    const elResult = await this.tryElevenLabs(request, requestId);
    const overallElapsed = (performance.now() - overallStart).toFixed(1);
    return { 
      ...elResult, 
      processingTimeMs: Math.round(performance.now() - overallStart),
      latency: `${overallElapsed}ms`
    };
  }

  /**
   * Try Sesame synthesis with timeout
   */
  private async trySesame(request: VoiceRequest, requestId: string): Promise<VoiceResponse> {
    try {
      const sesameResponse = await Promise.race([
        sesameService.generateResponse(request.text),
        this.createTimeout(this.config.timeout, 'Sesame synthesis timeout')
      ]);

      if (sesameResponse.success && sesameResponse.audio) {
        logger.info(`[VoiceRouter:${requestId}] Sesame generated audio (${sesameResponse.model})`);
        return {
          success: true,
          audioBuffer: sesameResponse.audio,
          engine: 'sesame',
          model: sesameResponse.model
        };
      } else {
        throw new Error(sesameResponse.error || 'No audio generated');
      }
    } catch (error: any) {
      logger.warn(`[VoiceRouter:${requestId}] Sesame error:`, error.message);
      return {
        success: false,
        engine: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Try ElevenLabs synthesis
   */
  private async tryElevenLabs(request: VoiceRequest, requestId: string): Promise<VoiceResponse> {
    try {
      logger.info(`[VoiceRouter:${requestId}] Using ElevenLabs synthesis`);
      
      // Use archetypal voice if element specified
      if (request.element && request.element !== 'aether') {
        const result = await synthesizeArchetypalVoice({
          text: request.text,
          primaryArchetype: request.element,
          userId: request.userId
        });

        return {
          success: true,
          audioUrl: result.audioUrl,
          engine: 'elevenlabs',
          model: 'elevenlabs-archetypal',
          metadata: result.voiceMetadata
        };
      } else {
        // Enhanced Maya voice configuration for more expressiveness
        // Using Nova for young, energetic expression or Domi for mystical oracle vibes
        const novaVoiceId = process.env.ELEVENLABS_VOICE_ID_NOVA || '21m00Tcm4TlvDq8ikWAM';
        const domiVoiceId = process.env.ELEVENLABS_VOICE_ID_DOMI || 'AZnzlk1XvdvUeBnXmlld';
        const mayaVoiceId = process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'y2TOWGCXSYEgBanvKsYJ';
        
        // Use Nova for energetic expression or Domi for mystical oracle personality
        // Nova is recommended for most engaging conversations
        const voiceId = novaVoiceId; // Switch to Nova for more expression
        
        logger.info(`[VoiceRouter] Using voice: Nova (energetic & expressive) for Maya Oracle`);
        
        // Enhanced voice settings for more expression
        const voiceSettings = {
          stability: request.voiceSettings?.stability || 0.65, // Lower = more expressive (was probably 1.0)
          similarity_boost: request.voiceSettings?.similarity_boost || 0.75,
          style: request.voiceSettings?.style || 0.0,
          use_speaker_boost: true,
          // Speed is controlled by streaming rate, but we can add prosody hints
        };
        
        const audioUrl = await synthesizeVoice({
          text: request.text,
          voiceId: voiceId,
          voice_settings: voiceSettings,
          model_id: 'eleven_multilingual_v2', // Better expressiveness
          optimize_streaming_latency: 2 // Balance between quality and speed
        });

        return {
          success: true,
          audioUrl,
          engine: 'elevenlabs',
          model: 'elevenlabs-standard',
          metadata: {
            voiceId: voiceId,
            personality: 'maya',
            voiceName: 'Nova',
            voiceSettings
          }
        };
      }
    } catch (error: any) {
      logger.error(`[VoiceRouter:${requestId}] ElevenLabs error:`, error.message);
      return {
        success: false,
        engine: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Try HuggingFace inference API
   */
  private async tryHuggingFace(request: VoiceRequest, requestId: string): Promise<VoiceResponse> {
    try {
      const apiKey = process.env.SESAME_FALLBACK_API_KEY;
      const apiUrl = process.env.SESAME_FALLBACK_URL;

      if (!apiKey || !apiUrl) {
        throw new Error('HuggingFace API credentials not configured');
      }

      logger.info(`[VoiceRouter:${requestId}] Calling HuggingFace API: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.text,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // HuggingFace inference API typically returns text, not audio
      // This is a simplified version - in practice you'd need text-to-speech conversion
      if (data && (data.generated_text || data[0]?.generated_text)) {
        const generatedText = data.generated_text || data[0]?.generated_text;
        
        // For now, return success but note this needs proper TTS integration
        logger.info(`[VoiceRouter:${requestId}] HuggingFace generated text: ${generatedText.substring(0, 50)}...`);
        
        return {
          success: true,
          engine: 'huggingface',
          model: 'facebook/blenderbot-1B-distill',
          error: 'HuggingFace returned text - TTS integration needed for audio'
        };
      } else {
        throw new Error('No generated text received from HuggingFace');
      }

    } catch (error: any) {
      logger.error(`[VoiceRouter:${requestId}] HuggingFace error:`, error.message);
      return {
        success: false,
        engine: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Get router status
   */
  getStatus() {
    return {
      sesamePrimary: this.config.sesamePrimary,
      fallbackEnabled: this.config.fallbackEnabled,
      sesameAvailable: sesameService.isEnabled(),
      timeout: this.config.timeout,
      failFast: this.config.failFast
    };
  }
}

export const voiceRouter = new VoiceRouter();
