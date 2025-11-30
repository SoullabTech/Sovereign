/**
 * Voice selection - Oracle-style, middle-aged, warm
 * Keeps Aunt Annie default for Maya; allows element overrides without breaking vibe
 */

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';
export type Persona = 'maya' | 'default';
export type VoiceContext = 'guidance' | 'explanation' | 'reassurance' | 'exploration' | 'casual';

export interface VoiceConfig {
  voiceId: string;
  name: string;
  character: string;
  bestFor: string[];
  stability: 'creative' | 'natural' | 'robust';
}

// Voice registry - production voice configurations
const VOICE_REGISTRY: Record<string, VoiceConfig> = {
  aunt_annie: {
    voiceId: process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'y2TOWGCXSYEgBanvKsYJ',
    name: 'Aunt Annie',
    character: 'Matrix Oracle - middle-aged, warm, grounded wisdom',
    bestFor: ['maya', 'water', 'aether', 'guidance', 'reassurance'],
    stability: 'natural'
  },
  emily: {
    voiceId: process.env.ELEVENLABS_VOICE_ID_EMILY || 'LcfcDJNUP1GQjkzn1xUU',
    name: 'Emily',
    character: 'Clear oracle - balanced, articulate, practical',
    bestFor: ['default', 'fire', 'air', 'earth', 'explanation'],
    stability: 'natural'
  }
};

/**
 * Select appropriate voice based on persona and context
 */
export function selectVoice(
  persona: Persona, 
  element?: Element, 
  context?: VoiceContext
): string {
  // Maya always gets Aunt Annie (Matrix Oracle archetype)
  if (persona === 'maya') {
    return VOICE_REGISTRY.aunt_annie.voiceId;
  }
  
  // Element-based selection for non-Maya personas
  if (element) {
    switch (element) {
      case 'water':
      case 'aether':
        // Water and Aether benefit from Aunt Annie's warm, intuitive delivery
        return VOICE_REGISTRY.aunt_annie.voiceId;
        
      case 'fire':
      case 'air': 
      case 'earth':
      default:
        // Fire, Air, Earth work well with Emily's clear, practical tone
        return VOICE_REGISTRY.emily.voiceId;
    }
  }
  
  // Context-based fallback
  if (context === 'guidance' || context === 'reassurance' || context === 'exploration') {
    return VOICE_REGISTRY.aunt_annie.voiceId;
  }
  
  // Default to Emily for clear, balanced delivery
  return VOICE_REGISTRY.emily.voiceId;
}

/**
 * Get voice character description for selected voice
 */
export function getVoiceCharacter(voiceId: string): string {
  const voice = Object.values(VOICE_REGISTRY).find(v => v.voiceId === voiceId);
  return voice?.character || 'Oracle voice';
}

/**
 * Get recommended voice configuration for context
 */
export function getVoiceConfig(
  persona: Persona,
  element?: Element,
  context?: VoiceContext
): VoiceConfig {
  const voiceId = selectVoice(persona, element, context);
  const config = Object.values(VOICE_REGISTRY).find(v => v.voiceId === voiceId);
  
  if (!config) {
    throw new Error(`Voice configuration not found for ID: ${voiceId}`);
  }
  
  return config;
}

/**
 * Validate voice selection logic
 */
export function validateVoiceSelection(): { 
  valid: boolean; 
  issues: string[];
  config: Record<string, any>;
} {
  const issues: string[] = [];
  
  // Check environment variables
  if (!process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE) {
    issues.push('Missing ELEVENLABS_VOICE_ID_AUNT_ANNIE environment variable');
  }
  
  if (!process.env.ELEVENLABS_VOICE_ID_EMILY) {
    issues.push('Missing ELEVENLABS_VOICE_ID_EMILY environment variable');
  }
  
  // Validate voice IDs format (ElevenLabs format)
  const elevenLabsIdPattern = /^[A-Za-z0-9]{20}$/;
  
  Object.entries(VOICE_REGISTRY).forEach(([key, voice]) => {
    if (!elevenLabsIdPattern.test(voice.voiceId)) {
      issues.push(`Invalid voice ID format for ${key}: ${voice.voiceId}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues,
    config: {
      voices: Object.keys(VOICE_REGISTRY),
      defaultVoice: VOICE_REGISTRY.emily.voiceId,
      mayaVoice: VOICE_REGISTRY.aunt_annie.voiceId,
      environmentVariables: {
        ELEVENLABS_VOICE_ID_AUNT_ANNIE: process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'NOT_SET',
        ELEVENLABS_VOICE_ID_EMILY: process.env.ELEVENLABS_VOICE_ID_EMILY || 'NOT_SET'
      }
    }
  };
}

/**
 * Get voice selection explanation for debugging
 */
export function explainVoiceSelection(
  persona: Persona,
  element?: Element,
  context?: VoiceContext
): {
  selectedVoiceId: string;
  voiceName: string;
  reason: string;
  character: string;
} {
  const voiceId = selectVoice(persona, element, context);
  const config = Object.values(VOICE_REGISTRY).find(v => v.voiceId === voiceId);
  
  let reason = '';
  
  if (persona === 'maya') {
    reason = 'Maya persona always uses Aunt Annie (Matrix Oracle archetype)';
  } else if (element === 'water' || element === 'aether') {
    reason = `${element} element benefits from Aunt Annie's warm, intuitive delivery`;
  } else if (element === 'fire' || element === 'air' || element === 'earth') {
    reason = `${element} element works well with Emily's clear, practical tone`;
  } else if (context === 'guidance' || context === 'reassurance') {
    reason = `${context} context benefits from Aunt Annie's nurturing presence`;
  } else {
    reason = 'Default selection for balanced, clear delivery';
  }
  
  return {
    selectedVoiceId: voiceId,
    voiceName: config?.name || 'Unknown',
    reason,
    character: config?.character || 'Oracle voice'
  };
}

/**
 * Voice preset evolution mapping (for PersonalOracleAgent integration)
 */
export function getEvolvedVoicePreset(
  sessionCount: number,
  trustLevel: number,
  persona: Persona = 'default'
): string {
  // Only apply evolution presets to Maya (Aunt Annie)
  if (persona !== 'maya') {
    return 'emily_balanced';
  }
  
  // Maya voice evolution stages
  if (sessionCount < 5) {
    return 'auntAnnie_gentle';     // Getting to know you
  } else if (sessionCount < 20 && trustLevel < 0.6) {
    return 'auntAnnie_trusted';    // Building trust  
  } else if (sessionCount < 50 && trustLevel < 0.8) {
    return 'auntAnnie_wise';       // Deep guidance
  } else {
    return 'auntAnnie_sacred';     // Sacred friendship
  }
}

/**
 * Emergency voice fallback (if primary voices fail)
 */
export function getEmergencyVoice(): string {
  // Fallback to default ElevenLabs voice if configured voices unavailable
  return process.env.DEFAULT_VOICE_ID || process.env.ELEVENLABS_VOICE_ID_EMILY || 'LcfcDJNUP1GQjkzn1xUU';
}

/**
 * Voice health check for production monitoring
 */
export async function checkVoiceHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  voices: Record<string, { available: boolean; lastChecked: Date }>;
  message: string;
}> {
  const voiceStatus: Record<string, { available: boolean; lastChecked: Date }> = {};
  
  // In a real implementation, this would ping ElevenLabs API to verify voice availability
  // For now, just check that voice IDs are configured
  Object.entries(VOICE_REGISTRY).forEach(([key, config]) => {
    voiceStatus[key] = {
      available: config.voiceId.length > 10, // Basic sanity check
      lastChecked: new Date()
    };
  });
  
  const availableCount = Object.values(voiceStatus).filter(v => v.available).length;
  const totalCount = Object.keys(voiceStatus).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  let message: string;
  
  if (availableCount === totalCount) {
    status = 'healthy';
    message = 'All voices operational';
  } else if (availableCount > 0) {
    status = 'degraded';
    message = `${availableCount}/${totalCount} voices available`;
  } else {
    status = 'unhealthy';
    message = 'No voices available';
  }
  
  return { status, voices: voiceStatus, message };
}