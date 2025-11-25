// lib/voice/sesameTTS.ts - Sesame CSM TTS Integration
// Simple console logger for now
const logger = {
  error: (msg: string, error?: any) => console.error(msg, error),
  info: (msg: string, data?: any) => console.info(msg, data)
};

export interface TTSResponse {
  success: boolean;
  audio?: string; // base64 encoded audio
  audio_url?: string;
  duration_ms?: number;
  service?: string;
  shaped_text?: string;
  voice_personality?: string;
}

export type VoicePersonality = 'maya' | 'oracle' | 'guide';
export type ElementalStyle = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'neutral';

/**
 * Speak a message using Sesame CSM TTS
 * @param text The text to synthesize
 * @param voice The voice personality to use
 * @param element Optional elemental styling for voice modulation
 * @returns Base64 encoded audio or null on error
 */
export async function speakPetalMessage(
  text: string,
  voice: VoicePersonality = 'maya',
  element?: ElementalStyle
): Promise<string | null> {
  try {
    const ttsUrl = process.env.NEXT_PUBLIC_SESAME_URL || 
                   process.env.NEXT_PUBLIC_TTS_API_URL || 
                   'http://localhost:8000';
    
    const response = await fetch(`${ttsUrl}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text, 
        voice,
        element,
        format: 'mp3'
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data: TTSResponse = await response.json();
    
    if (data.success && data.audio) {
      logger?.info('TTS synthesis successful', { 
        voice, 
        element,
        duration: data.duration_ms 
      });
      return data.audio; // returns base64 string
    }
    
    throw new Error('No audio data received');
  } catch (error) {
    console.error('TTS error:', error);
    logger?.error('TTS synthesis failed', { error, text: text.substring(0, 50) });
    return null;
  }
}

/**
 * Apply conversational intelligence shaping to text
 * @param text The text to shape
 * @param style The elemental style
 * @param archetype The voice archetype
 * @returns Shaped text with prosody markers
 */
export async function shapeTextWithCI(
  text: string,
  style: ElementalStyle = 'neutral',
  archetype: string = 'guide'
): Promise<{ shaped: string; tags: string[] } | null> {
  try {
    const ttsUrl = process.env.NEXT_PUBLIC_SESAME_URL || 
                   process.env.NEXT_PUBLIC_TTS_API_URL || 
                   'http://localhost:8000';
    
    const response = await fetch(`${ttsUrl}/ci/shape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text, 
        style,
        archetype
      }),
    });

    if (!response.ok) {
      throw new Error(`CI shaping error: ${response.status}`);
    }

    const data = await response.json();
    return {
      shaped: data.shaped || data.text,
      tags: data.tags || []
    };
  } catch (error) {
    console.error('CI shaping error:', error);
    return null;
  }
}

/**
 * Voice configuration for different contexts
 */
export const VOICE_CONTEXTS = {
  petalReading: {
    voice: 'oracle' as VoicePersonality,
    element: 'aether' as ElementalStyle,
    prefix: 'Listen deeply...'
  },
  journalReflection: {
    voice: 'maya' as VoicePersonality,
    element: 'water' as ElementalStyle,
    prefix: 'Take a breath...'
  },
  dreamGuidance: {
    voice: 'guide' as VoicePersonality,
    element: 'air' as ElementalStyle,
    prefix: 'Follow the thread...'
  },
  ritualInstruction: {
    voice: 'oracle' as VoicePersonality,
    element: 'earth' as ElementalStyle,
    prefix: 'Ground yourself...'
  },
  soulMessage: {
    voice: 'maya' as VoicePersonality,
    element: 'fire' as ElementalStyle,
    prefix: 'Your soul speaks...'
  }
} as const;

/**
 * Get voice configuration for a specific context
 */
export function getVoiceForContext(context: keyof typeof VOICE_CONTEXTS) {
  return VOICE_CONTEXTS[context];
}