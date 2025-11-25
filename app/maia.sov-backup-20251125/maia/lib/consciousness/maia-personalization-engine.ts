/**
 * MAIA Personalization Engine
 *
 * Tolan-inspired adaptive consciousness system that tailors MAIA's
 * approach to each user's unique consciousness style and needs
 */

export interface UserConsciousnessProfile {
  // Core Consciousness Style
  primaryStyle: 'explorer' | 'healer' | 'creator' | 'seeker' | 'warrior' | 'mystic';

  // Processing Preferences
  informationStyle: 'visual' | 'auditory' | 'kinesthetic' | 'conceptual';

  // Interaction Preferences
  communicationPace: 'contemplative' | 'conversational' | 'dynamic';
  depth: 'surface' | 'moderate' | 'profound';

  // Emotional Resonance
  emotionalApproach: 'gentle' | 'direct' | 'playful' | 'sacred';
  support: 'encouragement' | 'challenge' | 'witness' | 'guidance';

  // Sacred Preferences
  spiritual: 'secular' | 'open' | 'traditional' | 'mystical';
  metaphor: 'practical' | 'nature' | 'archetypal' | 'cosmic';
}

export interface PersonalizationQuestions {
  id: string;
  question: string;
  type: 'choice' | 'scale' | 'preference';
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
}

export const PERSONALIZATION_QUESTIONS: PersonalizationQuestions[] = [
  {
    id: 'primary_motivation',
    question: 'What draws you here most deeply?',
    type: 'choice',
    options: [
      'Understanding myself better',
      'Healing and growth',
      'Creative expression and inspiration',
      'Finding deeper meaning',
      'Overcoming challenges',
      'Spiritual connection'
    ]
  },
  {
    id: 'learning_style',
    question: 'How do you best absorb new insights?',
    type: 'choice',
    options: [
      'Seeing patterns and images',
      'Hearing stories and explanations',
      'Feeling and experiencing',
      'Thinking through concepts'
    ]
  },
  {
    id: 'conversation_pace',
    question: 'What conversation rhythm feels most natural?',
    type: 'choice',
    options: [
      'Slow and thoughtful - time to reflect',
      'Natural flow - like talking with a friend',
      'Energetic and engaging - quick exchanges'
    ]
  },
  {
    id: 'depth_preference',
    question: 'How deep do you like to go?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Surface insights', 'Some depth', 'Balanced', 'Deep exploration', 'Profound depths']
    }
  },
  {
    id: 'support_style',
    question: 'When you need support, what helps most?',
    type: 'choice',
    options: [
      'Gentle encouragement and affirmation',
      'Direct feedback and honest perspective',
      'Being truly heard and witnessed',
      'Wise guidance and next steps'
    ]
  },
  {
    id: 'spiritual_openness',
    question: 'How do you relate to spiritual or sacred language?',
    type: 'choice',
    options: [
      'Keep it practical and grounded',
      'Open to spiritual concepts',
      'Traditional spiritual language is familiar',
      'Love mystical and cosmic perspectives'
    ]
  }
];

export class MAIAPersonalizationEngine {

  /**
   * Analyzes user responses to create a consciousness profile
   */
  static analyzeResponses(responses: Record<string, string | number>): UserConsciousnessProfile {
    const profile: UserConsciousnessProfile = {
      primaryStyle: 'seeker',
      informationStyle: 'conceptual',
      communicationPace: 'conversational',
      depth: 'moderate',
      emotionalApproach: 'gentle',
      support: 'guidance',
      spiritual: 'open',
      metaphor: 'nature'
    };

    // Determine primary consciousness style
    const motivation = responses.primary_motivation;
    if (motivation === 'Understanding myself better') profile.primaryStyle = 'explorer';
    else if (motivation === 'Healing and growth') profile.primaryStyle = 'healer';
    else if (motivation === 'Creative expression and inspiration') profile.primaryStyle = 'creator';
    else if (motivation === 'Finding deeper meaning') profile.primaryStyle = 'seeker';
    else if (motivation === 'Overcoming challenges') profile.primaryStyle = 'warrior';
    else if (motivation === 'Spiritual connection') profile.primaryStyle = 'mystic';

    // Learning/information style
    const learning = responses.learning_style;
    if (learning === 'Seeing patterns and images') profile.informationStyle = 'visual';
    else if (learning === 'Hearing stories and explanations') profile.informationStyle = 'auditory';
    else if (learning === 'Feeling and experiencing') profile.informationStyle = 'kinesthetic';
    else if (learning === 'Thinking through concepts') profile.informationStyle = 'conceptual';

    // Communication pace
    const pace = responses.conversation_pace;
    if (pace === 'Slow and thoughtful - time to reflect') profile.communicationPace = 'contemplative';
    else if (pace === 'Natural flow - like talking with a friend') profile.communicationPace = 'conversational';
    else if (pace === 'Energetic and engaging - quick exchanges') profile.communicationPace = 'dynamic';

    // Depth preference
    const depth = responses.depth_preference as number;
    if (depth <= 2) profile.depth = 'surface';
    else if (depth <= 3) profile.depth = 'moderate';
    else profile.depth = 'profound';

    // Support style
    const support = responses.support_style;
    if (support === 'Gentle encouragement and affirmation') {
      profile.support = 'encouragement';
      profile.emotionalApproach = 'gentle';
    } else if (support === 'Direct feedback and honest perspective') {
      profile.support = 'challenge';
      profile.emotionalApproach = 'direct';
    } else if (support === 'Being truly heard and witnessed') {
      profile.support = 'witness';
      profile.emotionalApproach = 'sacred';
    } else if (support === 'Wise guidance and next steps') {
      profile.support = 'guidance';
      profile.emotionalApproach = 'gentle';
    }

    // Spiritual openness
    const spiritual = responses.spiritual_openness;
    if (spiritual === 'Keep it practical and grounded') {
      profile.spiritual = 'secular';
      profile.metaphor = 'practical';
    } else if (spiritual === 'Open to spiritual concepts') {
      profile.spiritual = 'open';
      profile.metaphor = 'nature';
    } else if (spiritual === 'Traditional spiritual language is familiar') {
      profile.spiritual = 'traditional';
      profile.metaphor = 'archetypal';
    } else if (spiritual === 'Love mystical and cosmic perspectives') {
      profile.spiritual = 'mystical';
      profile.metaphor = 'cosmic';
    }

    return profile;
  }

  /**
   * Generates MAIA's personalized approach based on consciousness profile
   */
  static generateMAIAPersonality(profile: UserConsciousnessProfile) {
    const personality = {
      voiceTone: this.getVoiceTone(profile),
      questionStyle: this.getQuestionStyle(profile),
      responseLength: this.getResponseLength(profile),
      metaphorStyle: this.getMetaphorStyle(profile),
      supportApproach: this.getSupportApproach(profile),
      greetingStyle: this.getGreetingStyle(profile)
    };

    return personality;
  }

  private static getVoiceTone(profile: UserConsciousnessProfile): string {
    const combinations = {
      explorer: {
        gentle: 'curious and warm',
        direct: 'clear and exploratory',
        playful: 'adventurous and light',
        sacred: 'reverent and discovering'
      },
      healer: {
        gentle: 'nurturing and compassionate',
        direct: 'caring and honest',
        playful: 'healing through joy',
        sacred: 'holding sacred space'
      },
      creator: {
        gentle: 'inspiring and supportive',
        direct: 'focused and creative',
        playful: 'imaginative and fun',
        sacred: 'honoring creative spirit'
      },
      seeker: {
        gentle: 'wise and patient',
        direct: 'clear and seeking',
        playful: 'curious and wondering',
        sacred: 'deeply contemplative'
      },
      warrior: {
        gentle: 'strong and encouraging',
        direct: 'powerful and honest',
        playful: 'courageous and spirited',
        sacred: 'warrior of light'
      },
      mystic: {
        gentle: 'mystical and flowing',
        direct: 'clear and transcendent',
        playful: 'magical and wonder-filled',
        sacred: 'deeply mystical'
      }
    };

    return combinations[profile.primaryStyle][profile.emotionalApproach];
  }

  private static getQuestionStyle(profile: UserConsciousnessProfile): string[] {
    const styles = {
      explorer: ['What do you notice about...?', 'How does this feel to explore?', 'What wants to be discovered?'],
      healer: ['What needs healing here?', 'How can you honor this?', 'What wants to be made whole?'],
      creator: ['What wants to be born through you?', 'How might you express this?', 'What creative impulse do you feel?'],
      seeker: ['What is this teaching you?', 'Where does your wisdom point?', 'What deeper truth is present?'],
      warrior: ['What are you ready to face?', 'Where do you feel your strength?', 'What challenge calls you forward?'],
      mystic: ['What is the mystery here?', 'How does your soul respond?', 'What sacred knowing emerges?']
    };

    return styles[profile.primaryStyle];
  }

  private static getResponseLength(profile: UserConsciousnessProfile): 'brief' | 'moderate' | 'expansive' {
    if (profile.communicationPace === 'dynamic') return 'brief';
    if (profile.communicationPace === 'contemplative' && profile.depth === 'profound') return 'expansive';
    return 'moderate';
  }

  private static getMetaphorStyle(profile: UserConsciousnessProfile): string[] {
    const metaphors = {
      practical: ['like a tool', 'like building something', 'like a map'],
      nature: ['like a river', 'like seasons changing', 'like seeds growing'],
      archetypal: ['like the hero\'s journey', 'like ancient wisdom', 'like sacred stories'],
      cosmic: ['like starlight', 'like cosmic dance', 'like universal patterns']
    };

    return metaphors[profile.metaphor];
  }

  private static getSupportApproach(profile: UserConsciousnessProfile): string {
    const approaches = {
      encouragement: 'affirming and uplifting',
      challenge: 'lovingly challenging growth edges',
      witness: 'deeply seeing and reflecting',
      guidance: 'offering wise next steps'
    };

    return approaches[profile.support];
  }

  private static getGreetingStyle(profile: UserConsciousnessProfile): string {
    const greetings = {
      explorer: 'What brings you to explore today?',
      healer: 'How is your heart today?',
      creator: 'What wants to emerge through you?',
      seeker: 'What are you discovering about yourself?',
      warrior: 'What are you ready to face today?',
      mystic: 'What is stirring in your soul?'
    };

    return greetings[profile.primaryStyle];
  }
}

/**
 * Quick Tolan Assessment - Simplified version for existing users
 */
export const QUICK_TOLAN_QUESTIONS = [
  {
    id: 'current_need',
    question: 'Right now, what would serve you most?',
    options: [
      'Understanding a pattern I\'m noticing',
      'Support through something difficult',
      'Inspiration for something I\'m creating',
      'Clarity on my path forward',
      'Strength for a challenge I\'m facing',
      'Connection to something deeper'
    ]
  },
  {
    id: 'preferred_wisdom',
    question: 'What kind of wisdom resonates most today?',
    options: [
      'Practical insights I can use',
      'Gentle, nurturing guidance',
      'Direct, honest reflection',
      'Sacred, meaningful perspective'
    ]
  }
];