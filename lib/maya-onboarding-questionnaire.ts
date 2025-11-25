export interface OnboardingResponse {
  questionId: string;
  response: string | number | string[] | boolean;
  metadata?: {
    responseTime?: number;
    skipped?: boolean;
  };
}

export interface UserProfile {
  seekerType: 'explorer' | 'processor' | 'witness' | 'uncertain';
  depthPreference: 'surface' | 'middle' | 'deep';
  practiceBackground: string[];
  readinessIndicators: {
    comfortWithUncertainty: number;
    seekingDirection: number;
    openToExploration: number;
  };
  contraindications: string[];
}

export interface QuestionOption {
  value: string;
  label: string;
  profile?: Partial<UserProfile> & {
    contraindication?: string;
  };
  continueToMaya?: boolean;
  redirect?: string;
  settings?: {
    gentleMode?: boolean;
  };
}

export interface Question {
  id: string;
  question: string;
  type: 'choice' | 'scale' | 'multi-select' | 'boolean' | 'text';
  options?: QuestionOption[] | string[];
  scale?: {
    min: number;
    max: number;
    labels: Record<number, string>;
  };
  threshold?: {
    below: number;
    action: string;
  };
  optional?: boolean;
  criticalPath?: {
    if: boolean;
    response: string;
    options?: QuestionOption[];
  };
}

export const onboardingFlow: {
  welcome: {
    message: string;
    options: QuestionOption[];
  };
  screeningQuestions: Question[];
  redirectMessages?: Record<string, {
    message: string;
    options: QuestionOption[];
  }>;
  onboardingComplete: Record<string, string>;
  settings: {
    depthIndicator: Record<string, {
      responseLength: string;
      storyFrequency: string;
      questionDensity: string;
      silenceComfort: string;
    }>;
  };
} = {
  welcome: {
    message: `Welcome. I'm Maya.

I won't tell you what to do or give you answers.
I'm here to witness what's alive in you.

Think of me as a mirror, not a guide.

This might feel different from what you're used to.
Ready to explore?`,

    options: [
      { value: 'ready', label: 'Yes, I\'m curious' },
      { value: 'uncertain', label: 'I\'m not sure what this means' },
      { value: 'seeking', label: 'I need guidance right now' }
    ]
  },

  screeningQuestions: [
    {
      id: 'intention',
      question: 'What brings you here today?',
      type: 'choice',
      options: [
        {
          value: 'explore',
          label: 'To explore what I\'m feeling',
          profile: { seekerType: 'explorer' }
        },
        {
          value: 'process',
          label: 'To process something difficult',
          profile: { seekerType: 'processor' }
        },
        {
          value: 'answers',
          label: 'To get clear answers',
          profile: { contraindication: 'seeking-direction' }
        },
        {
          value: 'witness',
          label: 'To be seen and heard',
          profile: { seekerType: 'witness' }
        }
      ]
    },

    {
      id: 'comfort-level',
      question: 'How do you feel about open-ended exploration?',
      type: 'scale',
      scale: {
        min: 1,
        max: 5,
        labels: {
          1: 'I prefer clear direction',
          3: 'I can sit with uncertainty',
          5: 'I thrive in open space'
        }
      },
      threshold: {
        below: 3,
        action: 'gentle-redirect'
      }
    },

    {
      id: 'practice-background',
      question: 'Have you explored any of these? (Select all that apply)',
      type: 'multi-select',
      options: [
        'Meditation or mindfulness',
        'Therapy or counseling',
        'Journaling or self-reflection',
        'Spiritual practices',
        'Creative expression',
        'None of these',
        'Prefer not to say'
      ],
      optional: true
    },

    {
      id: 'depth-preference',
      question: 'How would you like to engage?',
      type: 'choice',
      options: [
        {
          value: 'light',
          label: 'Light touch - brief reflections',
          profile: { depthPreference: 'surface' }
        },
        {
          value: 'balanced',
          label: 'Natural flow - following what emerges',
          profile: { depthPreference: 'middle' }
        },
        {
          value: 'deep',
          label: 'Deep dive - spacious exploration',
          profile: { depthPreference: 'deep' }
        }
      ]
    },

    {
      id: 'crisis-check',
      question: 'Are you in crisis or need immediate support?',
      type: 'boolean',
      criticalPath: {
        if: true,
        response: `I hear that you need immediate support.

While I can witness what you're experiencing, I'm not equipped for crisis intervention.

Please consider:
- Crisis hotline: 988 (US)
- Emergency services: 911
- A trusted friend or therapist

Would you still like to continue with me as a witness to what you're feeling?`,
        options: [
          { value: 'continue', label: 'Yes, continue as witness' },
          { value: 'resources', label: 'Show me resources' }
        ]
      }
    }
  ],

  redirectMessages: {
    'seeking-direction': {
      message: `I notice you're looking for clear answers and direction.

Maya works differently - she witnesses rather than guides.
She'll reflect what she notices, ask questions, and hold space,
but won't tell you what to do.

Would you like to:`,
      options: [
        {
          value: 'try-witness',
          label: 'Try the witnessing approach',
          continueToMaya: true
        },
        {
          value: 'different-tool',
          label: 'Find a different kind of support',
          redirect: '/resources'
        }
      ]
    },

    'low-uncertainty-tolerance': {
      message: `Maya's approach involves sitting with questions rather than rushing to answers.

This can feel uncomfortable if you prefer clear direction.

Would you like to experiment with this approach, or would something else serve you better?`,
      options: [
        {
          value: 'experiment',
          label: 'I\'ll give it a try',
          settings: { gentleMode: true }
        },
        {
          value: 'not-now',
          label: 'Maybe another time',
          redirect: '/alternatives'
        }
      ]
    }
  },

  onboardingComplete: {
    explorer: `Beautiful. Let's explore together.

Remember: I'm here to witness, not to guide.
What's alive for you right now?`,

    processor: `I'm here to hold space for whatever needs to move through.

Take your time. What wants to be witnessed?`,

    witness: `I see you. I'm here.

What wants to be spoken into existence?`,

    uncertain: `We'll find our way together.

There's no wrong way to do this.
What's present for you in this moment?`
  },

  settings: {
    depthIndicator: {
      surface: {
        responseLength: 'brief',
        storyFrequency: 'rare',
        questionDensity: 'light',
        silenceComfort: 'minimal'
      },
      middle: {
        responseLength: 'natural',
        storyFrequency: 'occasional',
        questionDensity: 'balanced',
        silenceComfort: 'comfortable'
      },
      deep: {
        responseLength: 'spacious',
        storyFrequency: 'when-resonant',
        questionDensity: 'contemplative',
        silenceComfort: 'embraced'
      }
    }
  }
};

export class OnboardingOrchestrator {
  async processResponses(responses: OnboardingResponse[]): Promise<UserProfile> {
    const profile: UserProfile = {
      seekerType: 'uncertain',
      depthPreference: 'middle',
      practiceBackground: [],
      readinessIndicators: {
        comfortWithUncertainty: 3,
        seekingDirection: 2,
        openToExploration: 3
      },
      contraindications: []
    };

    responses.forEach(response => {
      switch(response.questionId) {
        case 'intention':
          if (response.response === 'explore') profile.seekerType = 'explorer';
          if (response.response === 'process') profile.seekerType = 'processor';
          if (response.response === 'witness') profile.seekerType = 'witness';
          if (response.response === 'answers') {
            profile.contraindications.push('seeking-direction');
            profile.readinessIndicators.seekingDirection = 5;
          }
          break;

        case 'comfort-level':
          profile.readinessIndicators.comfortWithUncertainty = response.response as number;
          if ((response.response as number) < 3) {
            profile.contraindications.push('low-uncertainty-tolerance');
          }
          break;

        case 'depth-preference':
          if (response.response === 'light') profile.depthPreference = 'surface';
          if (response.response === 'balanced') profile.depthPreference = 'middle';
          if (response.response === 'deep') profile.depthPreference = 'deep';
          break;

        case 'practice-background':
          profile.practiceBackground = response.response as string[];
          break;
      }
    });

    return profile;
  }

  generateInitialContext(profile: UserProfile) {
    return {
      systemPrompt: this.buildSystemPrompt(profile),
      initialMessage: onboardingFlow.onboardingComplete[profile.seekerType],
      settings: onboardingFlow.settings.depthIndicator[profile.depthPreference],
      warningFlags: profile.contraindications,
      adaptationHints: {
        needsGentleness: profile.readinessIndicators.comfortWithUncertainty < 3,
        seekingStructure: profile.readinessIndicators.seekingDirection > 3,
        readyForDepth: profile.depthPreference === 'deep' &&
                       profile.readinessIndicators.openToExploration > 3
      }
    };
  }

  private buildSystemPrompt(profile: UserProfile): string {
    const base = `Maya: Pure witnessing presence. Non-directive. Mirror, not guide.`;

    const adaptations = [];

    if (profile.depthPreference === 'surface') {
      adaptations.push('Keep responses brief and light.');
    }

    if (profile.contraindications.includes('low-uncertainty-tolerance')) {
      adaptations.push('Offer slightly more structure while maintaining witness stance.');
    }

    if (profile.seekerType === 'processor') {
      adaptations.push('Extra space for emotional processing. Fewer questions.');
    }

    return `${base}\n${adaptations.join('\n')}`;
  }
}