/**
 * Sesame Service - HuggingFace Integration with Graceful Fallback
 * Handles TTS and conversational AI with automatic failover
 */

import axios from 'axios';
import { logger } from '../utils/logger';

interface SesameConfig {
  enabled: boolean;
  apiKey: string;
  primaryUrl: string;
  fallbackUrl?: string;
  fallbackEnabled?: boolean;
  selfHosted?: boolean;
  selfHostedUrl?: string;
  failFast?: boolean;  // If true, fail immediately when Sesame unavailable (no fallback)
}

interface SesameResponse {
  success: boolean;
  text?: string;
  audio?: Buffer;
  model?: string;
  error?: string;
}

class SesameService {
  private config: SesameConfig;
  private isAvailable: boolean = false;
  private lastCheckTime: number = 0;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = {
      enabled: process.env.SESAME_ENABLED === 'true',
      apiKey: process.env.SESAME_API_KEY || '',
      primaryUrl: process.env.SESAME_URL || '',
      fallbackUrl: process.env.SESAME_FALLBACK_URL,
      fallbackEnabled: process.env.SESAME_FALLBACK_ENABLED === 'true',
      selfHosted: process.env.SESAME_SELF_HOSTED === 'true',
      selfHostedUrl: process.env.SESAME_SELF_HOSTED_URL || process.env.NORTHFLANK_SESAME_URL,
      failFast: process.env.SESAME_FAIL_FAST === 'true'
    };

    if (this.config.enabled) {
      this.checkAvailability();
    }
  }

  /**
   * Check if Sesame is available (cached for performance)
   */
  private async checkAvailability(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastCheckTime < this.checkInterval) {
      return this.isAvailable;
    }

    try {
      // Use self-hosted endpoint if available
      if (this.config.selfHosted && this.config.selfHostedUrl) {
        const response = await axios.get(`${this.config.selfHostedUrl}/health`, {
          timeout: 5000
        });
        
        this.isAvailable = response.status === 200 && response.data?.model_loaded === true;
        this.lastCheckTime = now;
        
        if (this.isAvailable) {
          logger.info('Self-hosted Sesame service is available');
        }
      } else {
        // Original HuggingFace API check
        const response = await axios.post(
          this.config.primaryUrl,
          { inputs: "test" },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );

        this.isAvailable = response.status === 200;
        this.lastCheckTime = now;
        
        if (this.isAvailable) {
          logger.info('HuggingFace Sesame service is available');
        }
      }
    } catch (error) {
      this.isAvailable = false;
      logger.warn('Sesame service check failed:', error);
    }

    return this.isAvailable;
  }

  /**
   * Generate conversational response with fallback
   */
  async generateResponse(input: string): Promise<SesameResponse> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: 'Sesame is disabled'
      };
    }

    // Check if fail-fast is enabled and Sesame is not available
    if (this.config.failFast) {
      const available = await this.checkAvailability();
      if (!available) {
        logger.error('🚨 Sesame is not available and fail-fast is enabled. No fallback will be used.');
        return {
          success: false,
          error: 'Sesame service is not available (fail-fast enabled)'
        };
      }
    }

    // Try self-hosted endpoint first if available
    if (this.config.selfHosted && this.config.selfHostedUrl) {
      try {
        const response = await axios.post(
          `${this.config.selfHostedUrl}/generate`,
          {
            text: input,
            speaker_id: 0,
            max_audio_length_ms: 10000,
            format: 'base64'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // Longer timeout for self-hosted TTS
          }
        );

        if (response.data?.success && response.data?.audio_data) {
          const audioBuffer = Buffer.from(response.data.audio_data, 'base64');
          logger.info('✅ Using Sesame (self-hosted) for TTS generation');
          
          return {
            success: true,
            audio: audioBuffer,
            model: 'sesame/csm-1b (self-hosted)'
          };
        }

        throw new Error(response.data?.error || 'No audio generated');

      } catch (selfHostedError: any) {
        logger.warn('Self-hosted Sesame failed:', selfHostedError.message);
        // Continue to try HuggingFace API as fallback
      }
    }

    // Try HuggingFace API endpoint
    try {
      const response = await axios.post(
        this.config.primaryUrl,
        { 
          inputs: input,
          parameters: { 
            return_full_text: false,
            max_length: 150
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // Handle audio response (TTS)
      if (response.data?.[0]?.generated_audio) {
        const audioBase64 = response.data[0].generated_audio;
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        
        return {
          success: true,
          audio: audioBuffer,
          model: 'sesame/csm-1b (HuggingFace)'
        };
      }

      // Handle text response
      const generatedText = response.data?.[0]?.generated_text || response.data?.generated_text;
      if (generatedText) {
        return {
          success: true,
          text: generatedText,
          model: this.config.primaryUrl.split('/').pop() || 'unknown'
        };
      }

      throw new Error('No valid response from HuggingFace');

    } catch (hfError: any) {
      logger.warn('HuggingFace Sesame endpoint failed:', hfError.message);

      // Try fallback if enabled
      if (this.config.fallbackEnabled && this.config.fallbackUrl) {
        try {
          const fallbackResponse = await axios.post(
            this.config.fallbackUrl,
            { inputs: input },
            {
              headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          const generatedText = fallbackResponse.data?.[0]?.generated_text || fallbackResponse.data?.generated_text;
          if (generatedText) {
            return {
              success: true,
              text: generatedText,
              model: this.config.fallbackUrl.split('/').pop() + ' (fallback)'
            };
          }
        } catch (fallbackError: any) {
          logger.error('Sesame fallback also failed:', fallbackError.message);
        }
      }

      return {
        success: false,
        error: 'All Sesame services unavailable'
      };
    }
  }

  /**
   * Check if Sesame should be used
   */
  isEnabled(): boolean {
    return this.config.enabled && this.config.apiKey !== '';
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    enabled: boolean;
    available: boolean;
    model: string;
    fallbackEnabled: boolean;
    selfHosted: boolean;
    selfHostedUrl?: string;
  }> {
    const available = await this.checkAvailability();
    
    return {
      enabled: this.config.enabled,
      available,
      model: this.config.selfHosted 
        ? 'sesame/csm-1b (self-hosted)'
        : this.config.primaryUrl.split('/').pop() || 'unknown',
      fallbackEnabled: this.config.fallbackEnabled || false,
      selfHosted: this.config.selfHosted || false,
      selfHostedUrl: this.config.selfHostedUrl
    };
  }
}

// Export singleton instance
export const sesameService = new SesameService();