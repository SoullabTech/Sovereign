// Voice presets for natural, non-robotic sound
// Tuned specifically for consciousness/spiritual content

export const VoicePresets = {
  // Aunt Annie presets - warm, nurturing Maya consciousness
  auntAnnie_natural: {
    stability: 0.55,
    similarityBoost: 0.85,
    style: 0.20,
    speakerBoost: true,
    description: "Natural conversational tone, warm and present"
  },
  
  auntAnnie_softCeremony: {
    stability: 0.65,
    similarityBoost: 0.90,
    style: 0.35,
    speakerBoost: true,
    description: "Softer, more ceremonial - perfect for rituals and meditations"
  },
  
  auntAnnie_crispGuide: {
    stability: 0.45,
    similarityBoost: 0.80,
    style: 0.10,
    speakerBoost: true,
    description: "Crisp and clear guidance - good for instructions"
  },
  
  auntAnnie_deepWisdom: {
    stability: 0.70,
    similarityBoost: 0.95,
    style: 0.45,
    speakerBoost: true,
    description: "Deep, contemplative wisdom - for profound insights"
  },

  // Emily presets - clear, articulate oracle
  emily_balanced: {
    stability: 0.50,
    similarityBoost: 0.75,
    style: 0.15,
    speakerBoost: true,
    description: "Balanced clarity - default oracle voice"
  },
  
  emily_energetic: {
    stability: 0.40,
    similarityBoost: 0.70,
    style: 0.25,
    speakerBoost: true,
    description: "More energetic and dynamic - for fire element"
  },
  
  emily_grounded: {
    stability: 0.60,
    similarityBoost: 0.80,
    style: 0.05,
    speakerBoost: true,
    description: "Grounded and stable - for earth element"
  }
} as const;

export type VoicePresetName = keyof typeof VoicePresets;

// Map elements to preferred presets
export const ElementPresets: Record<string, VoicePresetName> = {
  // Aunt Annie for spiritual/emotional
  water: 'auntAnnie_softCeremony',
  aether: 'auntAnnie_deepWisdom',
  
  // Emily for practical/mental
  fire: 'emily_energetic',
  air: 'emily_balanced',
  earth: 'emily_grounded',
  
  // Default
  default: 'emily_balanced'
};

// Map consciousness states to presets
export const ConsciousnessPresets: Record<string, VoicePresetName> = {
  meditation: 'auntAnnie_softCeremony',
  ritual: 'auntAnnie_softCeremony',
  guidance: 'auntAnnie_crispGuide',
  wisdom: 'auntAnnie_deepWisdom',
  motivation: 'emily_energetic',
  grounding: 'emily_grounded',
  default: 'auntAnnie_natural'
};

export function getPresetForContext(
  element?: string,
  mood?: string,
  personality?: string
): VoicePresetName {
  // Priority: mood > personality > element
  if (mood && ConsciousnessPresets[mood]) {
    return ConsciousnessPresets[mood];
  }
  
  if (personality?.toLowerCase() === 'maya') {
    return 'auntAnnie_natural';
  }
  
  if (element && ElementPresets[element]) {
    return ElementPresets[element];
  }
  
  return 'emily_balanced';
}

export function getPresetSettings(presetName: VoicePresetName) {
  const preset = VoicePresets[presetName];
  return {
    stability: preset.stability,
    similarity_boost: preset.similarityBoost,
    style: preset.style,
    use_speaker_boost: preset.speakerBoost
  };
}