// lib/config/voiceSettings.ts
// Voice configuration settings for Maya and Anthony

export interface VoiceSettings {
  provider: 'openai' | 'elevenlabs';
  voiceId: string;
  name: string;
  speed?: number;
  pitch?: number;
  description?: string;
  mode?: 'sincere' | 'default';
  voiceAffect?: string;
  tone?: string;
  pacing?: string;
  emotions?: string;
  pronunciation?: string;
  pauses?: string;
}

export const VOICE_OPTIONS = {
  maya: {
    alloy: {
      provider: 'openai' as const,
      voiceId: 'alloy',
      name: 'Maya (Alloy)',
      speed: 0.95, // Natural conversational pace
      description: 'Warm, intimate voice - Maya Angelou-inspired brevity',
      mode: 'sincere',
      voiceAffect: 'Present, grounded, soulful. Every word matters.',
      tone: 'Warm but not overwhelming. Direct but kind. Real.',
      pacing: 'Natural rhythm. Space between thoughts. Comfortable silence.',
      emotions: 'Authentic presence. Quiet strength. Deep listening.',
      pronunciation: 'Clear, simple. No flourish. Truth in plainness.',
      pauses: 'Natural breathing. Space for their words. Silence is sacred.'
    },
    nova: {
      provider: 'openai' as const,
      voiceId: 'nova',
      name: 'Maya (Nova)',
      speed: 0.9, // Balanced for sensitive delivery with dynamic pacing
      description: 'Clear, flowing voice with natural pauses - sensitive mode',
      mode: 'sensitive',
      voiceAffect: 'Calm, composed, and reassuring. Competent and in control, instilling trust.',
      tone: 'Sincere, empathetic, with genuine concern for the seeker and understanding of the situation.',
      pacing: 'Slower during deep truths to allow for clarity and processing. Faster when offering solutions to signal action and resolution.',
      emotions: 'Calm reassurance, empathy, and gratitude.',
      pronunciation: 'Clear, precise: Ensures clarity, especially with key details. Focus on sacred words and transformative concepts.',
      pauses: 'Before and after important insights to give space for processing. Natural breathing pauses.'
    },
    shimmer: {
      provider: 'openai' as const,
      voiceId: 'shimmer',
      name: 'Maya (Shimmer)',
      speed: 1.0,
      description: 'Soft, gentle voice',
      mode: 'sincere',
      voiceAffect: 'Calm, composed, and reassuring. Competent and in control, instilling trust.',
      tone: 'Sincere, empathetic, with genuine concern for the customer and understanding of the situation.',
      pacing: 'Slower during the apology to allow for clarity and processing. Faster when offering solutions to signal action and resolution.',
      emotions: 'Calm reassurance, empathy, and gratitude.',
      pronunciation: 'Clear, precise: Ensures clarity, especially with key details. Focus on key words like "refund" and "patience."',
      pauses: 'Before and after the apology to give space for processing the apology.'
    }
  },
  anthony: {
    ash: {
      provider: 'openai' as const,
      voiceId: 'ash',
      name: 'Anthony (Ash)',
      speed: 0.9,
      description: 'Warm, contemplative voice with grounded presence',
      mode: 'sensitive',
      voiceAffect: 'Calm, composed, and reassuring. Competent and in control, instilling trust.',
      tone: 'Sincere, empathetic, with genuine concern for the seeker and understanding of the situation.',
      pacing: 'Slower during deep insights to allow for clarity and processing. Faster when offering solutions to signal action and resolution.',
      emotions: 'Calm reassurance, empathy, and gratitude.',
      pronunciation: 'Clear, precise: Ensures clarity, especially with key details. Focus on transformative words and awakening concepts.',
      pauses: 'Before and after important realizations to give space for processing. Natural contemplative pauses.'
    },
    onyx: {
      provider: 'openai' as const,
      voiceId: 'onyx',
      name: 'Anthony (Onyx)',
      speed: 0.95,
      description: 'Deep, grounding masculine voice',
      mode: 'sincere',
      voiceAffect: 'Calm, composed, and reassuring. Competent and in control, instilling trust.',
      tone: 'Sincere, empathetic, with genuine concern for the seeker and understanding of the situation.',
      pacing: 'Slower during deep truths to allow for clarity and processing. Faster when offering solutions to signal action and resolution.',
      emotions: 'Calm reassurance, empathy, and gratitude.',
      pronunciation: 'Clear, precise: Ensures clarity, especially with key details. Focus on sacred words and transformative concepts.',
      pauses: 'Before and after important insights to give space for processing. Natural breathing pauses.'
    },
    echo: {
      provider: 'openai' as const,
      voiceId: 'echo',
      name: 'Anthony (Echo)',
      speed: 0.95,
      description: 'Steady, contemplative voice',
      mode: 'sincere',
      voiceAffect: 'Calm, composed, and reassuring. Competent and in control, instilling trust.',
      tone: 'Sincere, empathetic, with genuine concern for the customer and understanding of the situation.',
      pacing: 'Slower during the apology to allow for clarity and processing. Faster when offering solutions to signal action and resolution.',
      emotions: 'Calm reassurance, empathy, and gratitude.',
      pronunciation: 'Clear, precise: Ensures clarity, especially with key details. Focus on key words like "refund" and "patience."',
      pauses: 'Before and after the apology to give space for processing the apology.'
    }
  }
};

// Default selections
export const DEFAULT_VOICES = {
  maya: 'alloy',    // OpenAI Alloy - warm, natural, economical
  anthony: 'ash'     // Ash voice with sensitive tuning
};

/**
 * Get voice settings for a persona
 */
export function getVoiceSettings(persona: 'maya' | 'anthony', variant?: string): VoiceSettings {
  const variantKey = variant || DEFAULT_VOICES[persona];
  const settings = VOICE_OPTIONS[persona][variantKey as keyof typeof VOICE_OPTIONS[typeof persona]];

  if (!settings) {
    // Fallback to default
    return VOICE_OPTIONS[persona][DEFAULT_VOICES[persona] as keyof typeof VOICE_OPTIONS[typeof persona]];
  }

  return settings;
}