/**
 * SHIFt Ritual Reflection Form
 * 
 * Embodied, poetic, retreat-friendly reflection prompts.
 * Feels like gentle invitation rather than clinical survey.
 */

export type PromptType = 'text' | 'slider' | 'choice' | 'rating';

export interface ReflectionPrompt {
  id: string;
  element: string;
  facetCodes: string[];
  type: PromptType;
  prompt: string;
  options?: string[] | { min: number; max: number; labels?: Record<number, string> };
  placeholder?: string;
}

export const RITUAL_REFLECTION_OPENING = `
🌟 Sacred Pause for Reflection 🌟

Welcome, dear soul. You are invited into a gentle space of witnessing—
a moment to honor where you are and what moves through you.

There are no right answers here, only truth as you know it in this moment.
Let your responses arise naturally, like breath or morning light.

~ ~ ~ ~ ~
`;

export const RITUAL_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  // =============================================================================
  // FIRE – INSPIRATION & SACRED PURPOSE
  // =============================================================================
  {
    id: 'fire_spark',
    element: 'fire',
    facetCodes: ['F1_Meaning', 'F2_Courage'],
    type: 'text',
    prompt: '🔥 What has been sparking your soul or stirring your sense of purpose lately?',
    placeholder: 'Let the words flow like flames...'
  },

  // =============================================================================
  // EARTH – GROUNDING & EMBODIED PRESENCE  
  // =============================================================================
  {
    id: 'earth_rhythm',
    element: 'earth',
    facetCodes: ['E2_Grounding', 'E1_Coherence'],
    type: 'slider',
    prompt: '🌍 How steady do you feel in your daily rhythm right now?',
    options: { 
      min: 1, 
      max: 7, 
      labels: { 
        1: 'Scattered like leaves', 
        4: 'Finding my footing', 
        7: 'Rooted like an oak' 
      } 
    }
  },

  // =============================================================================
  // WATER – EMOTIONAL TIDES & HEART CONNECTION
  // =============================================================================
  {
    id: 'water_flow',
    element: 'water',
    facetCodes: ['W1_Attunement'],
    type: 'choice',
    prompt: '💧 If your heart were a river today, how would you describe its flow?',
    options: [
      'Frozen still—emotions feel distant or numb',
      'Gentle stream—emotions flow naturally and clearly', 
      'Rapids rushing—strong feelings moving with purpose',
      'Flooding banks—overwhelmed by the emotional current',
      'Underground spring—emotions present but hidden deep'
    ]
  },

  {
    id: 'water_belonging',
    element: 'water',
    facetCodes: ['W2_Belonging'],
    type: 'text',
    prompt: '🤝 Where do you feel most held and witnessed in your life right now?',
    placeholder: 'Community, relationship, place, practice...'
  },

  // =============================================================================
  // AIR – MENTAL CLARITY & PERSPECTIVE
  // =============================================================================
  {
    id: 'air_insight',
    element: 'air',
    facetCodes: ['A1_Reflection'],
    type: 'text',
    prompt: '💨 What insight or realization has been circling through your awareness?',
    placeholder: 'Perhaps something you keep returning to...'
  },

  {
    id: 'air_adaptation',
    element: 'air',
    facetCodes: ['A2_Adaptability'],
    type: 'rating',
    prompt: '🌪️ When life shifts unexpectedly, how do you typically respond?',
    options: { 
      min: 1, 
      max: 5,
      labels: {
        1: 'I resist and feel stressed',
        2: 'I struggle but eventually adapt',
        3: 'I bend like a tree in wind',
        4: 'I flow and find new possibilities', 
        5: 'I dance with change as my partner'
      }
    }
  },

  // =============================================================================
  // AETHER – SACRED INTEGRATION & WHOLENESS
  // =============================================================================
  {
    id: 'aether_harmony',
    element: 'aether',
    facetCodes: ['AE1_Values', 'AE2_Fulfillment'],
    type: 'text',
    prompt: '✨ Where in your life do you sense the deepest harmony or wholeness? Where do you feel fragments calling to be integrated?',
    placeholder: 'Both the integrated and the integrating...'
  },

  // =============================================================================
  // INTEGRATION – WALKING THE TALK
  // =============================================================================
  {
    id: 'integration_practice',
    element: 'cross',
    facetCodes: ['C1_Integration', 'C2_Integrity'],
    type: 'text',
    prompt: '🌉 What wisdom or insight from recent experiences are you actively weaving into your daily life?',
    placeholder: 'How you are bridging knowing and being...'
  }
];

export const RITUAL_REFLECTION_CLOSING = `
~ ~ ~ ~ ~

Take a moment to breathe deeply. 

Your reflections have been received into the sacred circle of witnessing.
They join the collective wisdom of all who have paused to know themselves more truly.

May your insights settle into your bones.
May your questions guide you gently forward.
May you remember: you are held, you are seen, you belong.

🙏 With gratitude for your presence 🙏
`;

export const REFLECTION_METADATA = {
  version: "1.0",
  totalPrompts: 8,
  elementalCoverage: ['fire', 'earth', 'water', 'air', 'aether', 'cross'],
  estimatedMinutes: 12,
  recommendedFrequency: "weekly, seasonally, or during ceremony",
  context: "retreat, ceremony, seasonal check-in"
};

// Helper function to generate a complete ritual form
export function generateRitualReflectionForm(): {
  opening: string;
  prompts: ReflectionPrompt[];
  closing: string;
  metadata: typeof REFLECTION_METADATA;
} {
  return {
    opening: RITUAL_REFLECTION_OPENING,
    prompts: RITUAL_REFLECTION_PROMPTS,
    closing: RITUAL_REFLECTION_CLOSING,
    metadata: REFLECTION_METADATA
  };
}