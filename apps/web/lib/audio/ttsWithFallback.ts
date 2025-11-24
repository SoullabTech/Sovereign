/**
 * TTS with network fallback - tries server TTS first, falls back to browser TTS
 */

import { mayaVoice } from '@/lib/voice/maya-voice';

export interface TTSOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  preferServer?: boolean;
  retryAttempts?: number;
}

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  source: 'server' | 'browser' | 'failed';
  error?: string;
  retries?: number;
}

export async function synthesizeWithFallback(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voice = 'maya',
    preferServer = true,
    retryAttempts = 1
  } = options;

  if (!text?.trim()) {
    return {
      success: false,
      source: 'failed',
      error: 'No text provided'
    };
  }

  let lastError: string = '';
  let retries = 0;

  // Try server TTS first if preferred
  if (preferServer) {
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🎵 Attempting server TTS (attempt ${attempt + 1}/${retryAttempts + 1})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('/api/voice/sesame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: text.slice(0, 1000), // Limit text length for cost control
            voice 
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const audioBlob = await response.blob();
          
          // Validate audio blob
          if (audioBlob.size > 0 && audioBlob.type.startsWith('audio/')) {
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('✅ Server TTS successful');
            
            return {
              success: true,
              audioUrl,
              source: 'server',
              retries: attempt
            };
          } else {
            throw new Error('Invalid audio response from server');
          }
        } else if (response.status >= 500) {
          // Server error - worth retrying
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        } else {
          // Client error - don&apos;t retry
          lastError = `Client error: ${response.status} ${response.statusText}`;
          break;
        }
      } catch (error: any) {
        retries = attempt;
        lastError = error.name === 'AbortError' ? 'Server TTS timeout' : error.message;
        console.warn(`⚠️ Server TTS attempt ${attempt + 1} failed:`, lastError);
        
        // Don&apos;t retry on client errors or aborts
        if (error.name === 'AbortError' || error.message.includes('Client error')) {
          break;
        }
        
        // Brief delay before retry
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  }

  // Fallback to browser TTS
  console.log('🎤 Falling back to browser TTS');
  try {
    await mayaVoice.speak(text, {
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume
    });
    
    console.log('✅ Browser TTS successful');
    return {
      success: true,
      source: 'browser',
      retries
    };
  } catch (browserError: any) {
    console.error('❌ Browser TTS also failed:', browserError);
    
    return {
      success: false,
      source: 'failed',
      error: `Server TTS failed: ${lastError}. Browser TTS failed: ${browserError.message}`,
      retries
    };
  }
}

// Utility for quick server TTS with automatic fallback
export async function speakWithMaya(
  text: string, 
  options: Partial<TTSOptions> = {}
): Promise<TTSResult> {
  return synthesizeWithFallback({
    text,
    voice: 'maya',
    preferServer: true,
    retryAttempts: 1,
    ...options
  });
}

// Cost-controlled TTS - skips TTS for very short messages
export async function smartSpeak(
  text: string,
  options: Partial<TTSOptions> & { minLength?: number } = {}
): Promise<TTSResult> {
  const minLength = options.minLength ?? 5;
  
  if (text.trim().length < minLength) {
    console.log(`⏭️ Skipping TTS for short message: "${text.slice(0, 20)}..."`);
    return {
      success: false,
      source: 'failed',
      error: 'Message too short for TTS'
    };
  }

  // Skip TTS for system/error messages
  const systemPhrases = [
    'error', 'failed', 'connection', 'loading', 'please wait',
    'try again', 'unavailable', 'processing'
  ];
  
  const lowerText = text.toLowerCase();
  if (systemPhrases.some(phrase => lowerText.includes(phrase))) {
    console.log(`⏭️ Skipping TTS for system message: "${text.slice(0, 30)}..."`);
    return {
      success: false,
      source: 'failed',
      error: 'System message - TTS skipped'
    };
  }

  return speakWithMaya(text, options);
}