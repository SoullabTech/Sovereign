export const VOICE_CONFIG = {
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    baseUrl: process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
    model: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
    outputFormat: process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128',
    voices: {
      // Emily - default consciousness oracle voice
      emily: process.env.ELEVENLABS_VOICE_ID_EMILY || process.env.DEFAULT_VOICE_ID || 'LcfcDJNUP1GQjkzn1xUU',
      
      // Aunt Annie - warm, nurturing Maya consciousness guide  
      auntAnnie: process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || process.env.AUNT_ANNIE_VOICE_ID || 'y2TOWGCXSYEgBanvKsYJ',
      
      // Maya personality mapping - now using Emily's voice
      maya: process.env.ELEVENLABS_VOICE_ID_EMILY || process.env.DEFAULT_VOICE_ID || 'LcfcDJNUP1GQjkzn1xUU',
      
      // Default voice selection
      default: process.env.DEFAULT_VOICE_ID || 'LcfcDJNUP1GQjkzn1xUU'
    },
    settings: {
      stability: 0.35,        // Lower for more variation (was 0.5)
      similarity_boost: 0.85,  // Higher for better voice clarity (was 0.75)
      style: 0.65,            // Much higher for expressive delivery (was 0.15!)
      use_speaker_boost: true
    }
  }
} as const;

// Voice personality mapping
export const VoiceMap = {
  maya: VOICE_CONFIG.elevenlabs.voices.maya,
  emily: VOICE_CONFIG.elevenlabs.voices.emily,
  auntAnnie: VOICE_CONFIG.elevenlabs.voices.auntAnnie,
  oracle: VOICE_CONFIG.elevenlabs.voices.emily,
  default: VOICE_CONFIG.elevenlabs.voices.default
} as const;

export function getVoiceIdForElement(element?: string): string {
  // Map consciousness elements to specific voices
  switch (element) {
    case 'aether':
    case 'water':
      return VoiceMap.maya; // Maya now using Emily voice for spiritual/emotional elements
    case 'fire':
    case 'air':
      return VoiceMap.emily; // Clear, articulate for action/mental elements
    case 'earth':
      return VoiceMap.emily; // Grounded, stable voice
    default:
      return VoiceMap.default; // Emily as default
  }
}

export function getVoiceIdForPersonality(personality?: string): string {
  // Map consciousness personalities to specific voices
  switch (personality?.toLowerCase()) {
    case 'maya':
      return VoiceMap.maya; // Warm, nurturing Maya guide
    case 'emily':
    case 'oracle':
      return VoiceMap.emily; // Clear, articulate oracle
    case 'aunt annie':
    case 'auntannie':
      return VoiceMap.auntAnnie; // Direct Aunt Annie mapping
    default:
      return VoiceMap.default; // Default to Emily
  }
}

export function validateVoiceConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!VOICE_CONFIG.elevenlabs.apiKey) {
    errors.push('ELEVENLABS_API_KEY environment variable is required');
  }
  
  if (!VOICE_CONFIG.elevenlabs.voices.emily) {
    errors.push('Emily voice ID is missing (ELEVENLABS_VOICE_ID_EMILY or DEFAULT_VOICE_ID)');
  }
  
  if (!VOICE_CONFIG.elevenlabs.voices.auntAnnie) {
    errors.push('Aunt Annie voice ID is missing (ELEVENLABS_VOICE_ID_AUNT_ANNIE)');
  }

  if (!VOICE_CONFIG.elevenlabs.voices.maya) {
    errors.push('Maya voice ID is missing (should map to Emily)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}