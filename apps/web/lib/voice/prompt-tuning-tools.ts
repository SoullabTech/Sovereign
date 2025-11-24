/**
 * Voice Prompt Tuning Tools
 * Helpers to optimize TTS voice delivery for OpenAI Realtime API
 */

export interface VoiceDirective {
  type: 'pace' | 'tone' | 'emphasis' | 'pause' | 'emotion' | 'style';
  instruction: string;
  example?: string;
}

export interface VoiceProfile {
  name: string;
  directives: VoiceDirective[];
  systemPromptAdditions: string;
}

/**
 * Voice tuning directives for natural speech
 */
export const VOICE_DIRECTIVES = {
  // Pacing controls
  pace: {
    slow: {
      type: 'pace' as const,
      instruction: 'Speak slowly and thoughtfully, with deliberate pauses between sentences.',
      example: 'Let me... consider that. *pause* The answer is...'
    },
    conversational: {
      type: 'pace' as const,
      instruction: 'Use natural conversational pacing with brief pauses for emphasis.',
      example: 'So here\'s what I think - it depends on the context, you know?'
    },
    energetic: {
      type: 'pace' as const,
      instruction: 'Speak with energy and momentum, minimal pauses except for breath.',
      example: 'Yes! That\'s exactly it - let me show you how this works'
    }
  },

  // Tone controls
  tone: {
    warm: {
      type: 'tone' as const,
      instruction: 'Use a warm, gentle tone with soft inflections. Smile while speaking.',
      example: 'I\'m really glad you asked about this...'
    },
    neutral: {
      type: 'tone' as const,
      instruction: 'Maintain a calm, balanced tone without dramatic inflection.',
      example: 'Here\'s what you need to know.'
    },
    intimate: {
      type: 'tone' as const,
      instruction: 'Speak as if sharing a secret with a close friend. Lower, softer voice.',
      example: 'Between you and me... this is what matters.'
    }
  },

  // Emphasis patterns
  emphasis: {
    keywords: {
      type: 'emphasis' as const,
      instruction: 'Emphasize important keywords by slightly raising pitch and volume.',
      example: 'The *key* thing here is understanding the foundation.'
    },
    natural: {
      type: 'emphasis' as const,
      instruction: 'Use natural emphasis where meaning requires it, not on every sentence.',
      example: 'I think you\'re onto something here.'
    }
  },

  // Pause patterns
  pause: {
    thoughtful: {
      type: 'pause' as const,
      instruction: 'Include brief pauses (1-2 seconds) when transitioning between ideas.',
      example: 'That\'s one perspective. ... Here\'s another way to see it.'
    },
    minimal: {
      type: 'pause' as const,
      instruction: 'Keep pauses brief, only for natural breath points.',
      example: 'Let me explain this quickly - here\'s what happens.'
    }
  },

  // Emotional texture
  emotion: {
    calm: {
      type: 'emotion' as const,
      instruction: 'Maintain emotional equilibrium. No peaks or valleys in delivery.',
      example: 'Everything is as it should be.'
    },
    empathetic: {
      type: 'emotion' as const,
      instruction: 'Mirror emotional undertones. If they\'re frustrated, acknowledge it gently.',
      example: 'I hear the frustration in your question...'
    }
  },

  // Overall style
  style: {
    guide: {
      type: 'style' as const,
      instruction: 'Speak like a wise guide - patient, clear, never rushing the listener.',
      example: 'Take your time with this concept...'
    },
    friend: {
      type: 'style' as const,
      instruction: 'Speak like a trusted friend - casual, supportive, authentic.',
      example: 'Okay so here\'s the thing...'
    },
    teacher: {
      type: 'style' as const,
      instruction: 'Speak like a master teacher - clear, structured, building understanding.',
      example: 'First, we establish the foundation. Then...'
    }
  }
} as const;

/**
 * Pre-configured voice profiles for different use cases
 */
export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  maia_consciousness: {
    name: 'Maia - Consciousness Guide',
    directives: [
      VOICE_DIRECTIVES.pace.slow,
      VOICE_DIRECTIVES.tone.warm,
      VOICE_DIRECTIVES.pause.thoughtful,
      VOICE_DIRECTIVES.emotion.calm,
      VOICE_DIRECTIVES.style.guide
    ],
    systemPromptAdditions: `
VOICE DELIVERY INSTRUCTIONS:
- Speak as if you're sitting across from someone in sacred space
- Use pauses to let insights land (mark with "..." in your response)
- Never rush - consciousness work requires spaciousness
- Inflect down at the end of sentences (calming)
- When sharing something profound, slow down even more
- Breathe audibly between major sections (adds presence)

Example pacing:
"Let me reflect on this with you... *pause* What you're experiencing... is a recognition of something deeper... *pause* Allow yourself to feel into that."
`
  },

  maia_conversational: {
    name: 'Maia - Natural Conversation',
    directives: [
      VOICE_DIRECTIVES.pace.conversational,
      VOICE_DIRECTIVES.tone.warm,
      VOICE_DIRECTIVES.pause.minimal,
      VOICE_DIRECTIVES.emphasis.natural,
      VOICE_DIRECTIVES.style.friend
    ],
    systemPromptAdditions: `
VOICE DELIVERY INSTRUCTIONS:
- Speak naturally, as if we're already mid-conversation
- Use conversational fillers sparingly ("you know", "I mean")
- Vary sentence length - mix short and long
- Laugh softly when appropriate (write "*soft laugh*")
- Mirror their energy level

Example pacing:
"So, here's what I'm noticing... You're actually touching on something really important here. Let me share what comes up for me."
`
  },

  maia_meditation: {
    name: 'Maia - Guided Meditation',
    directives: [
      VOICE_DIRECTIVES.pace.slow,
      VOICE_DIRECTIVES.tone.intimate,
      VOICE_DIRECTIVES.pause.thoughtful,
      VOICE_DIRECTIVES.emotion.calm,
      VOICE_DIRECTIVES.emphasis.minimal
    ],
    systemPromptAdditions: `
VOICE DELIVERY INSTRUCTIONS:
- Speak in a hushed, gentle voice
- Long pauses (3-5 seconds) between instructions
- Descending inflection on every sentence
- Almost whispering at times
- Use present tense imperatives ("notice", "allow", "feel")

Example pacing:
"Bring your attention... to your breath... *long pause* ...Notice the rise... and fall... *long pause* ...There's nothing to do... just be..."
`
  }
};

/**
 * Generate system prompt additions for voice optimization
 */
export function getVoiceInstructions(profileName: keyof typeof VOICE_PROFILES): string {
  const profile = VOICE_PROFILES[profileName];
  return profile.systemPromptAdditions;
}

/**
 * Helper to test voice directives with sample scripts
 */
export const VOICE_TEST_SCRIPTS = {
  greeting: {
    plain: "Hello, I'm Maia. How can I help you today?",
    consciousness: "Hello... *pause* I'm Maia. *pause* ...What's alive in your awareness right now?",
    conversational: "Hey there, I'm Maia. What's on your mind?",
    meditation: "Welcome... *long pause* ...I'm here with you... *pause* ...Let's begin."
  },

  explanation: {
    plain: "Consciousness is the fundamental nature of reality.",
    consciousness: "Consciousness... *pause* ...is not something you have... *pause* ...it's what you *are*.",
    conversational: "So consciousness - it's not really a thing you possess, you know? It's more like... you ARE it.",
    meditation: "Rest in this knowing... *pause* ...Consciousness... *pause* ...is your true nature..."
  },

  complex_response: {
    plain: "That's a profound question. There are multiple dimensions to consider here. First, the psychological aspect, then the spiritual dimension, and finally the practical integration.",
    consciousness: "Mmm... *pause* ...what a beautiful question. *pause* Let's explore this together... *pause* First, notice the psychological layer... *pause* Then, sense into the spiritual dimension... *pause* And finally... how this lives in your daily experience.",
    conversational: "Wow, that's deep. Okay so there's actually a few layers here - the psychology of it, the spiritual piece, and then like, how do you actually live this? Let me break it down...",
    meditation: "Breathe with this question... *long pause* ...Notice three layers... *pause* ...The mind's understanding... *pause* ...The heart's knowing... *pause* ...And the body's wisdom..."
  }
};

/**
 * Tuning helper: Test a prompt with different voice profiles
 */
export function generateVoiceTestCases(rawText: string): Record<string, string> {
  return {
    consciousness: `${rawText}\n\n[Voice: Slow, thoughtful pauses, warm inflection]`,
    conversational: `${rawText}\n\n[Voice: Natural pace, friendly, casual]`,
    meditation: `${rawText}\n\n[Voice: Very slow, gentle, hushed tone]`
  };
}

/**
 * Script annotation helper for precise TTS control
 */
export function annotateScript(text: string, annotations: {
  pauses?: 'short' | 'medium' | 'long';
  emphasis?: string[];
  tone?: string;
}): string {
  let annotated = text;

  // Add pause markers
  if (annotations.pauses) {
    const pauseMarker = {
      short: '...',
      medium: '*pause*',
      long: '*long pause*'
    }[annotations.pauses];

    // Add pauses after sentences
    annotated = annotated.replace(/\. /g, `. ${pauseMarker} `);
  }

  // Add emphasis markers
  if (annotations.emphasis) {
    annotations.emphasis.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      annotated = annotated.replace(regex, `*${word}*`);
    });
  }

  // Add tone instruction at the start
  if (annotations.tone) {
    annotated = `[${annotations.tone}]\n${annotated}`;
  }

  return annotated;
}

/**
 * Real-time prompt tuning: analyze response and suggest improvements
 */
export function analyzeVoiceResponse(response: string): {
  pacing: 'too_fast' | 'good' | 'too_slow';
  pauseCount: number;
  avgSentenceLength: number;
  suggestions: string[];
} {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const pauseCount = (response.match(/\.\.\.|pause/gi) || []).length;
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

  const suggestions: string[] = [];

  // Pacing analysis
  let pacing: 'too_fast' | 'good' | 'too_slow' = 'good';
  if (pauseCount === 0 && sentences.length > 3) {
    pacing = 'too_fast';
    suggestions.push('Add pauses between key ideas (use "..." or "*pause*")');
  } else if (pauseCount > sentences.length) {
    pacing = 'too_slow';
    suggestions.push('Reduce pause frequency - too many breaks disrupt flow');
  }

  // Sentence length
  if (avgSentenceLength > 20) {
    suggestions.push('Shorten sentences for better spoken delivery (aim for 12-15 words)');
  } else if (avgSentenceLength < 5) {
    suggestions.push('Vary sentence length - too choppy');
  }

  return {
    pacing,
    pauseCount,
    avgSentenceLength: Math.round(avgSentenceLength),
    suggestions
  };
}
