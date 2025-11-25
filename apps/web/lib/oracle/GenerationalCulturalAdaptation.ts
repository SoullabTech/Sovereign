/**
 * Generational & Cultural Adaptation System
 * Adapts Maya's interface and responses for all generations and cultures
 */

export interface GenerationalProfile {
  generation: 'genAlpha' | 'genZ' | 'millennial' | 'genX' | 'boomer' | 'silent';
  ageRange: string;
  birthYears: string;
  techFluency: 'native' | 'adapted' | 'learned' | 'basic';
  communicationStyle: string[];
  culturalMarkers: string[];
  interfacePreferences: InterfacePrefs;
  languagePatterns: LanguageStyle;
}

export interface InterfacePrefs {
  visualComplexity: 'minimal' | 'moderate' | 'rich';
  textSize: 'small' | 'medium' | 'large' | 'xlarge';
  iconStyle: 'modern' | 'classic' | 'text-heavy';
  navigationStyle: 'gesture' | 'button' | 'menu';
  audioDefault: boolean;
  tutorialLevel: 'none' | 'minimal' | 'guided' | 'extensive';
}

export interface LanguageStyle {
  formality: 'casual' | 'conversational' | 'professional' | 'formal';
  techTerms: 'native' | 'explained' | 'avoided';
  culturalReferences: string[];
  avoidTerms: string[];
}

export interface CulturalContext {
  primaryCulture: string;
  language: string;
  culturalNorms: {
    directness: 'very-direct' | 'direct' | 'indirect' | 'very-indirect';
    emotionalExpression: 'open' | 'moderate' | 'reserved';
    authorityRelation: 'egalitarian' | 'respectful' | 'deferential';
    privacyExpectation: 'low' | 'medium' | 'high' | 'very-high';
  };
  tabooTopics?: string[];
  preferredGreetings: string[];
}

export class GenerationalCulturalAdaptation {

  // GENERATIONAL PROFILES
  static readonly profiles: Record<string, GenerationalProfile> = {
    genAlpha: {
      generation: 'genAlpha',
      ageRange: '0-14',
      birthYears: '2010-2024',
      techFluency: 'native',
      communicationStyle: ['visual', 'video', 'interactive', 'gamified'],
      culturalMarkers: ['youtube', 'roblox', 'minecraft', 'tablet-native', 'ai-native'],
      interfacePreferences: {
        visualComplexity: 'rich',
        textSize: 'medium',
        iconStyle: 'modern',
        navigationStyle: 'gesture',
        audioDefault: true,
        tutorialLevel: 'none'
      },
      languagePatterns: {
        formality: 'casual',
        techTerms: 'native',
        culturalReferences: ['gaming', 'youtube', 'school', 'parents'],
        avoidTerms: ['facebook', 'email', 'cable tv']
      }
    },

    genZ: {
      generation: 'genZ',
      ageRange: '14-27',
      birthYears: '1997-2010',
      techFluency: 'native',
      communicationStyle: ['brief', 'visual', 'authentic', 'meme-fluent'],
      culturalMarkers: ['tiktok', 'discord', 'mental-health-aware', 'social-justice'],
      interfacePreferences: {
        visualComplexity: 'moderate',
        textSize: 'small',
        iconStyle: 'modern',
        navigationStyle: 'gesture',
        audioDefault: false,
        tutorialLevel: 'none'
      },
      languagePatterns: {
        formality: 'casual',
        techTerms: 'native',
        culturalReferences: ['social media', 'college', 'climate', 'identity'],
        avoidTerms: ['boomer-speak', 'corporate-jargon', 'patronizing']
      }
    },

    millennial: {
      generation: 'millennial',
      ageRange: '28-43',
      birthYears: '1981-1996',
      techFluency: 'adapted',
      communicationStyle: ['collaborative', 'emoji-heavy', 'purpose-driven'],
      culturalMarkers: ['facebook-era', 'student-loans', 'delayed-milestones'],
      interfacePreferences: {
        visualComplexity: 'moderate',
        textSize: 'medium',
        iconStyle: 'modern',
        navigationStyle: 'button',
        audioDefault: false,
        tutorialLevel: 'minimal'
      },
      languagePatterns: {
        formality: 'conversational',
        techTerms: 'explained',
        culturalReferences: ['work-life-balance', 'housing', 'parenting', 'burnout'],
        avoidTerms: ['ok-boomer', 'outdated-slang']
      }
    },

    genX: {
      generation: 'genX',
      ageRange: '44-59',
      birthYears: '1965-1980',
      techFluency: 'learned',
      communicationStyle: ['direct', 'email-comfortable', 'pragmatic'],
      culturalMarkers: ['latchkey', 'sandwich-generation', 'work-focused'],
      interfacePreferences: {
        visualComplexity: 'moderate',
        textSize: 'medium',
        iconStyle: 'classic',
        navigationStyle: 'menu',
        audioDefault: false,
        tutorialLevel: 'guided'
      },
      languagePatterns: {
        formality: 'professional',
        techTerms: 'explained',
        culturalReferences: ['career', 'teenagers', 'aging-parents', 'retirement'],
        avoidTerms: ['teen-slang', 'overcomplicated']
      }
    },

    boomer: {
      generation: 'boomer',
      ageRange: '60-78',
      birthYears: '1946-1964',
      techFluency: 'basic',
      communicationStyle: ['detailed', 'phone-preferred', 'formal'],
      culturalMarkers: ['retirement', 'grandchildren', 'traditional-values'],
      interfacePreferences: {
        visualComplexity: 'minimal',
        textSize: 'large',
        iconStyle: 'text-heavy',
        navigationStyle: 'menu',
        audioDefault: true,
        tutorialLevel: 'extensive'
      },
      languagePatterns: {
        formality: 'formal',
        techTerms: 'avoided',
        culturalReferences: ['retirement', 'health', 'family', 'legacy'],
        avoidTerms: ['slang', 'abbreviations', 'tech-jargon']
      }
    },

    silent: {
      generation: 'silent',
      ageRange: '79+',
      birthYears: 'Before 1946',
      techFluency: 'basic',
      communicationStyle: ['formal', 'respectful', 'traditional'],
      culturalMarkers: ['traditional', 'cautious-tech', 'privacy-focused'],
      interfacePreferences: {
        visualComplexity: 'minimal',
        textSize: 'xlarge',
        iconStyle: 'text-heavy',
        navigationStyle: 'menu',
        audioDefault: true,
        tutorialLevel: 'extensive'
      },
      languagePatterns: {
        formality: 'formal',
        techTerms: 'avoided',
        culturalReferences: ['health', 'family', 'community', 'history'],
        avoidTerms: ['slang', 'casual', 'disrespectful']
      }
    }
  };

  // CULTURAL ADAPTATIONS
  static readonly culturalContexts: Record<string, CulturalContext> = {
    // North American
    usEnglish: {
      primaryCulture: 'American',
      language: 'en-US',
      culturalNorms: {
        directness: 'direct',
        emotionalExpression: 'open',
        authorityRelation: 'egalitarian',
        privacyExpectation: 'medium'
      },
      preferredGreetings: ['Hi', 'Hey', "What's up?", 'How are you?']
    },

    canadian: {
      primaryCulture: 'Canadian',
      language: 'en-CA',
      culturalNorms: {
        directness: 'direct',
        emotionalExpression: 'moderate',
        authorityRelation: 'respectful',
        privacyExpectation: 'high'
      },
      preferredGreetings: ['Hello', 'Hi there', 'How are you?']
    },

    // Latin American
    mexican: {
      primaryCulture: 'Mexican',
      language: 'es-MX',
      culturalNorms: {
        directness: 'indirect',
        emotionalExpression: 'open',
        authorityRelation: 'respectful',
        privacyExpectation: 'low'
      },
      preferredGreetings: ['Hola', '¿Cómo estás?', 'Buenos días']
    },

    // European
    british: {
      primaryCulture: 'British',
      language: 'en-GB',
      culturalNorms: {
        directness: 'indirect',
        emotionalExpression: 'reserved',
        authorityRelation: 'respectful',
        privacyExpectation: 'high'
      },
      preferredGreetings: ['Hello', 'Good morning', 'How do you do?']
    },

    // Asian
    japanese: {
      primaryCulture: 'Japanese',
      language: 'ja-JP',
      culturalNorms: {
        directness: 'very-indirect',
        emotionalExpression: 'reserved',
        authorityRelation: 'deferential',
        privacyExpectation: 'very-high'
      },
      tabooTopics: ['direct-conflict', 'personal-problems'],
      preferredGreetings: ['Konnichiwa', 'Ohayou gozaimasu']
    },

    chinese: {
      primaryCulture: 'Chinese',
      language: 'zh-CN',
      culturalNorms: {
        directness: 'indirect',
        emotionalExpression: 'reserved',
        authorityRelation: 'deferential',
        privacyExpectation: 'high'
      },
      preferredGreetings: ['Ni hao', 'Nin hao']
    },

    indian: {
      primaryCulture: 'Indian',
      language: 'en-IN',
      culturalNorms: {
        directness: 'indirect',
        emotionalExpression: 'moderate',
        authorityRelation: 'respectful',
        privacyExpectation: 'medium'
      },
      preferredGreetings: ['Namaste', 'Hello', 'Good morning']
    },

    // Middle Eastern
    arab: {
      primaryCulture: 'Arab',
      language: 'ar',
      culturalNorms: {
        directness: 'indirect',
        emotionalExpression: 'moderate',
        authorityRelation: 'respectful',
        privacyExpectation: 'high'
      },
      tabooTopics: ['sexuality', 'religious-criticism'],
      preferredGreetings: ['As-salaam alaikum', 'Marhaba']
    },

    // African
    nigerian: {
      primaryCulture: 'Nigerian',
      language: 'en-NG',
      culturalNorms: {
        directness: 'direct',
        emotionalExpression: 'open',
        authorityRelation: 'respectful',
        privacyExpectation: 'low'
      },
      preferredGreetings: ['Hello', 'How are you?', 'Good morning']
    },

    southAfrican: {
      primaryCulture: 'South African',
      language: 'en-ZA',
      culturalNorms: {
        directness: 'direct',
        emotionalExpression: 'open',
        authorityRelation: 'egalitarian',
        privacyExpectation: 'medium'
      },
      preferredGreetings: ['Hello', 'Howzit', 'Good day']
    }
  };

  // RESPONSE ADAPTATION
  static adaptResponse(
    message: string,
    generation: string,
    culture: string
  ): string {
    const genProfile = this.profiles[generation];
    const culturalContext = this.culturalContexts[culture];

    // Apply generational language patterns
    let adapted = this.applyGenerationalTone(message, genProfile);

    // Apply cultural sensitivity
    adapted = this.applyCulturalNorms(adapted, culturalContext);

    return adapted;
  }

  private static applyGenerationalTone(
    message: string,
    profile: GenerationalProfile
  ): string {
    switch (profile.generation) {
      case 'genAlpha':
        // Super simple, fun, emoji-heavy
        return this.simplifyForKids(message);

      case 'genZ':
        // Casual, authentic, no fluff
        return this.makeGenZAuthentic(message);

      case 'millennial':
        // Supportive, collaborative
        return this.makeMillennialFriendly(message);

      case 'genX':
        // Direct, practical, no-nonsense
        return this.makeGenXPragmatic(message);

      case 'boomer':
        // Respectful, clear, detailed
        return this.makeBoomerClear(message);

      case 'silent':
        // Very respectful, formal, careful
        return this.makeSilentRespectful(message);

      default:
        return message;
    }
  }

  private static applyCulturalNorms(
    message: string,
    context: CulturalContext
  ): string {
    // Adjust directness
    if (context.culturalNorms.directness === 'very-indirect') {
      message = this.softenMessage(message);
    }

    // Adjust emotional expression
    if (context.culturalNorms.emotionalExpression === 'reserved') {
      message = this.reduceEmotionalLanguage(message);
    }

    // Add appropriate greeting
    if (!message.startsWith('Hi') && !message.startsWith('Hello')) {
      message = context.preferredGreetings[0] + '. ' + message;
    }

    return message;
  }

  // INTERFACE ADAPTATION
  static getInterfaceConfig(generation: string): InterfaceConfig {
    const profile = this.profiles[generation];

    return {
      fontSize: this.getFontSize(profile.interfacePreferences.textSize),
      buttonSize: this.getButtonSize(profile.interfacePreferences.textSize),
      complexity: profile.interfacePreferences.visualComplexity,
      showTutorials: profile.interfacePreferences.tutorialLevel !== 'none',
      audioEnabled: profile.interfacePreferences.audioDefault,
      navigation: profile.interfacePreferences.navigationStyle
    };
  }

  private static getFontSize(size: string): number {
    const sizes = { small: 14, medium: 16, large: 18, xlarge: 22 };
    return sizes[size] || 16;
  }

  private static getButtonSize(size: string): number {
    const sizes = { small: 40, medium: 48, large: 56, xlarge: 64 };
    return sizes[size] || 48;
  }

  // Simplification methods (examples)
  private static simplifyForKids(message: string): string {
    return message
      .replace(/complicated/g, 'hard')
      .replace(/anxiety/g, 'worried feelings')
      .replace(/depression/g, 'sad feelings') +
      ' 😊';
  }

  private static makeGenZAuthentic(message: string): string {
    return message
      .replace(/It appears that/g, 'Looks like')
      .replace(/I understand/g, 'I get it')
      .replace(/How are you feeling?/g, "What's up?");
  }

  private static makeMillennialFriendly(message: string): string {
    return message
      .replace(/You must/g, "Let's try to")
      .replace(/Failed/g, "Didn't work out this time");
  }

  private static makeGenXPragmatic(message: string): string {
    return message
      .replace(/journey/g, 'process')
      .replace(/healing/g, 'improvement');
  }

  private static makeBoomerClear(message: string): string {
    return message
      .replace(/app/g, 'application')
      .replace(/DM/g, 'direct message');
  }

  private static makeSilentRespectful(message: string): string {
    return 'I hope you are well. ' + message
      .replace(/Hey/g, 'Hello')
      .replace(/cool/g, 'good');
  }

  private static softenMessage(message: string): string {
    return message
      .replace(/You should/g, 'Perhaps you might consider')
      .replace(/You need to/g, 'It might be helpful to');
  }

  private static reduceEmotionalLanguage(message: string): string {
    return message
      .replace(/amazing/g, 'good')
      .replace(/terrible/g, 'difficult')
      .replace(/!/g, '.');
  }
}

// UI Configuration Interface
interface InterfaceConfig {
  fontSize: number;
  buttonSize: number;
  complexity: 'minimal' | 'moderate' | 'rich';
  showTutorials: boolean;
  audioEnabled: boolean;
  navigation: 'gesture' | 'button' | 'menu';
}