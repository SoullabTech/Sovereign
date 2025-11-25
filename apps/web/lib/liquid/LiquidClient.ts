/**
 * 🌊 LIQUID AI CLIENT
 *
 * Client-side service for calling the Liquid AI API
 * Provides typed interface for MAIA components to use Liquid responses
 */

export interface LiquidRequest {
  text: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface LiquidResponse {
  reply: string;
  model: string;
  tokens_generated: number;
}

export interface LiquidHealthStatus {
  status: 'ok' | 'unavailable' | 'error';
  liquid_service?: {
    status: string;
    service: string;
    model: string;
    ready: boolean;
  };
  api_url?: string;
  error?: string;
}

export class LiquidClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/liquid') {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a prompt to the Liquid AI model
   *
   * @param request - The prompt and generation parameters
   * @returns The Liquid AI response
   */
  async generate(request: LiquidRequest): Promise<LiquidResponse> {
    const startTime = Date.now();

    try {
      console.log('🌊 [LIQUID CLIENT] Sending request:', {
        text: request.text.substring(0, 50) + '...',
        max_tokens: request.max_tokens,
        temperature: request.temperature
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: LiquidResponse = await response.json();
      const duration = Date.now() - startTime;

      console.log('🌊 [LIQUID CLIENT] Response received:', {
        model: data.model,
        tokens: data.tokens_generated,
        duration_ms: duration,
        reply_preview: data.reply.substring(0, 50) + '...'
      });

      return data;

    } catch (error) {
      console.error('🌊 [LIQUID CLIENT] Error:', error);
      throw error;
    }
  }

  /**
   * Check if the Liquid AI service is available
   *
   * @returns Health status of the Liquid AI service
   */
  async healthCheck(): Promise<LiquidHealthStatus> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });

      const data = await response.json();
      return data as LiquidHealthStatus;

    } catch (error) {
      console.error('🌊 [LIQUID CLIENT] Health check failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a response with rhythm-aware parameters
   *
   * Uses conversational rhythm metrics to adjust generation parameters
   * for more natural timing and pacing
   *
   * @param text - The prompt text
   * @param rhythmMetrics - Optional rhythm metrics to adjust parameters
   */
  async generateWithRhythm(
    text: string,
    rhythmMetrics?: {
      conversationTempo: 'slow' | 'medium' | 'fast';
      silenceComfort: number;
      rhythmCoherence: number;
    }
  ): Promise<LiquidResponse> {
    // Adjust generation parameters based on rhythm
    let temperature = 0.8;
    let max_tokens = 80;

    if (rhythmMetrics) {
      // Slower conversations get more contemplative responses
      if (rhythmMetrics.conversationTempo === 'slow') {
        temperature = 0.7;
        max_tokens = 100;
      }
      // Fast conversations get more concise responses
      else if (rhythmMetrics.conversationTempo === 'fast') {
        temperature = 0.9;
        max_tokens = 60;
      }

      // High silence comfort = user is okay with pauses, can be more thoughtful
      if (rhythmMetrics.silenceComfort > 0.7) {
        max_tokens = Math.min(max_tokens + 20, 120);
      }

      console.log('🌊 [LIQUID CLIENT] Rhythm-adjusted parameters:', {
        tempo: rhythmMetrics.conversationTempo,
        temperature,
        max_tokens,
        silence_comfort: rhythmMetrics.silenceComfort.toFixed(2)
      });
    }

    return this.generate({
      text,
      temperature,
      max_tokens,
      top_p: 0.9
    });
  }
}

// Singleton instance
export const liquidClient = new LiquidClient();
