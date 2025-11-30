/**
 * TTS tagging & prosody policy for Maya's Oracle voice
 * v3-friendly with minimal tags and sane stability defaults
 */

import { Intent } from '../personas/intent';
import { PersonaPrefs } from '../personas/prefs';

export type Stability = 'creative' | 'natural' | 'robust';

export interface Prosody {
  stability: Stability;
  speed?: number;
  pitch?: number;
  emphasis?: number;
}

export interface ElevenLabsSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed?: number;
}

// Stability mapping for ElevenLabs v3
const STABILITY_MAP: Record<Stability, number> = {
  creative: 0.25,   // More expressive, varied
  natural: 0.55,    // Balanced Oracle voice
  robust: 0.85      // Consistent, reliable
};

/**
 * Pick prosody settings based on intent and user preferences
 */
export function pickProsody(intent: Intent, prefs: PersonaPrefs): Prosody {
  const baseProsody = getBaseProsodyForIntent(intent);
  
  // Adjust for worldview
  if (prefs.worldview === 'metaphysical') {
    return {
      ...baseProsody,
      speed: (baseProsody.speed || 1.0) * 0.92, // Slightly more spacious
      stability: 'natural' // Allow more expression
    };
  }
  
  if (prefs.worldview === 'grounded') {
    return {
      ...baseProsody, 
      speed: (baseProsody.speed || 1.0) * 1.02, // A bit crisper
      stability: 'robust' // More consistent
    };
  }
  
  return baseProsody;
}

/**
 * Get base prosody settings for intent
 */
function getBaseProsodyForIntent(intent: Intent): Prosody {
  switch (intent) {
    case 'guidance':
    case 'reassurance':
      return {
        stability: 'natural',
        speed: 0.95, // Slightly slower for guidance
        emphasis: 0.3
      };
      
    case 'planning':
      return {
        stability: 'robust',
        speed: 1.0,
        emphasis: 0.2
      };
      
    case 'exploration':
      return {
        stability: 'natural',
        speed: 0.93, // Contemplative pace
        emphasis: 0.4
      };
      
    case 'smalltalk':
      return {
        stability: 'natural',
        speed: 1.05, // Conversational
        emphasis: 0.2
      };
      
    case 'explanation':
    default:
      return {
        stability: 'natural',
        speed: 1.0,
        emphasis: 0.3
      };
  }
}

/**
 * Convert Prosody to ElevenLabs API settings
 */
export function toElevenLabsSettings(prosody: Prosody): ElevenLabsSettings {
  return {
    stability: STABILITY_MAP[prosody.stability],
    similarity_boost: 0.65, // Modest setting for v3
    style: prosody.emphasis || 0.4,
    use_speaker_boost: true,
    speed: prosody.speed
  };
}

/**
 * Add TTS tags for guided practices (minimal, v3-friendly)
 */
export function maybeTagForPractice(
  text: string, 
  intent: Intent, 
  prefs: PersonaPrefs
): string {
  // Only tag for guidance that contains breathing or grounding
  const isPractice = intent === 'guidance' && 
    /breath|breathe|ground|pause|notice your|close your eyes|feel your feet|relax|inhale|exhale/i.test(text);
  
  if (!isPractice) return text;
  
  // Choose tag based on worldview
  const tag = prefs.worldview === 'metaphysical' ? '[gentle]' : '[calm]';
  
  // Apply minimal tagging
  let tagged = `${tag} ${text}`;
  
  // Add short breaks for breathing cues (keep under 1s for natural flow)
  tagged = tagged.replace(/(\b(inhale|exhale|breath[e]?)\b)/gi, '$1 <break time="0.6s" />');
  
  // Add pauses for contemplation
  tagged = tagged.replace(/(\.\s+)(Notice|Feel|Allow|Let)/gi, '$1<break time="0.4s" />$2');
  
  // Clean up multiple breaks
  tagged = tagged.replace(/(<break[^>]*>\s*){2,}/gi, '<break time="0.8s" />');
  
  return tagged;
}

/**
 * Add emotional prosody markers based on content
 */
export function addEmotionalProsody(text: string, emotions: string[]): string {
  let result = text;
  
  // Apply emotional markers sparingly
  if (emotions.includes('anxiety') || emotions.includes('overwhelm')) {
    result = result.replace(/^([A-Z])/, '[soothing] $1');
  }
  
  if (emotions.includes('sadness')) {
    result = result.replace(/^([A-Z])/, '[warm] $1');
  }
  
  if (emotions.includes('joy') || emotions.includes('excitement')) {
    result = result.replace(/^([A-Z])/, '[bright] $1');
  }
  
  return result;
}

/**
 * Clean and normalize TTS text
 */
export function normalizeTTSText(text: string): string {
  let normalized = text;
  
  // Clean up common text artifacts
  normalized = normalized.replace(/\s*…\s*/g, '… ');
  normalized = normalized.replace(/\s*\.\s*\.\s*\.\s*/g, '… ');
  normalized = normalized.replace(/\s{2,}/g, ' ');
  
  // Normalize quotation marks for better pronunciation
  normalized = normalized.replace(/[""]/g, '"');
  normalized = normalized.replace(/['']/g, "'");
  
  // Handle common abbreviations
  normalized = normalized.replace(/\be\.g\./gi, 'for example');
  normalized = normalized.replace(/\bi\.e\./gi, 'that is');
  normalized = normalized.replace(/\betc\./gi, 'and so on');
  
  // Expand numbers in context
  normalized = normalized.replace(/\b(\d+)\s*(minutes?|hours?|days?|weeks?)\b/gi, (match, num, unit) => {
    const numWord = numberToWord(parseInt(num));
    return numWord ? `${numWord} ${unit}` : match;
  });
  
  // Clean up line breaks for TTS
  normalized = normalized.replace(/\n\n+/g, ' … ');
  normalized = normalized.replace(/\n/g, ' ');
  
  return normalized.trim();
}

/**
 * Convert small numbers to words for better TTS
 */
function numberToWord(num: number): string | null {
  const words = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
    16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
    30: 'thirty', 60: 'sixty'
  };
  
  return words[num] || null;
}

/**
 * Validate TTS settings for production safety
 */
export function validateTTSSettings(settings: ElevenLabsSettings): ElevenLabsSettings {
  return {
    stability: Math.min(1, Math.max(0, settings.stability)),
    similarity_boost: Math.min(1, Math.max(0, settings.similarity_boost)),
    style: Math.min(1, Math.max(0, settings.style)),
    use_speaker_boost: Boolean(settings.use_speaker_boost),
    speed: settings.speed ? Math.min(2, Math.max(0.5, settings.speed)) : undefined
  };
}

/**
 * Get voice coaching tips for different stability levels
 */
export function getVoiceCoachingTips(stability: Stability): string[] {
  const tips = {
    creative: [
      'More expressive and varied delivery',
      'Natural emotional inflection',
      'Good for dynamic content'
    ],
    natural: [
      'Balanced Oracle voice - warm and clear',
      'Moderate expression with stability',
      'Best for most Maya interactions'
    ],
    robust: [
      'Consistent and reliable delivery',
      'Minimal variation, clear articulation', 
      'Good for important instructions'
    ]
  };
  
  return tips[stability];
}