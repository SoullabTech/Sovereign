// lib/sesameCsm.ts - Local Sesame CSM Integration
export interface SesameConfig {
  serviceUrl: string;
  apiKey?: string;
  timeout?: number;
  mode?: 'offline' | 'online';
}

export interface SynthesisRequest {
  text: string;
  voice?: string;
  speed?: number;
  temperature?: number;
  format?: 'wav' | 'mp3';
  sample_rate?: number;
}

export interface SynthesisResponse {
  audio_data?: ArrayBuffer;
  audio_url?: string;
  duration_ms?: number;
  error?: string;
}

export async function synthesizeToWav(
  text: string, 
  config: SesameConfig
): Promise<ArrayBuffer> {
  const { serviceUrl, apiKey, timeout = 30000 } = config;
  
  if (!text?.trim()) {
    throw new Error('Text is required for synthesis');
  }
  
  if (!serviceUrl) {
    throw new Error('Sesame service URL is required');
  }

  const ttsUrl = `${serviceUrl}/api/v1/generate`;
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey && apiKey !== 'local') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: text.trim(),
        voice: 'maya',
        format: 'wav',
        sample_rate: 16000,
        speed: 1.0,
      } as SynthesisRequest),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sesame CSM API error ${response.status}: ${errorText}`);
    }

    // Direct audio stream response
    if (response.headers.get('content-type')?.includes('audio')) {
      return await response.arrayBuffer();
    }

    // JSON response with audio URL
    const result = await response.json();
    if (result.audio_url) {
      const audioResponse = await fetch(result.audio_url);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
      }
      return await audioResponse.arrayBuffer();
    }
    
    throw new Error('No audio data in response');
    
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Sesame CSM request timed out after ${timeout}ms`);
    }
    if (error.name === 'AbortError') {
      throw new Error('Sesame CSM request was aborted');
    }
    throw error;
  }
}

// Health check function
export async function checkHealth(config: SesameConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.serviceUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded === true;
  } catch {
    return false;
  }
}

// List available voices (for future use)
export async function listVoices(config: SesameConfig): Promise<any[]> {
  try {
    const response = await fetch(`${config.serviceUrl}/voices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Failed to list voices:', error);
    return [];
  }
}