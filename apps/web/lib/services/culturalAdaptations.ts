/**
 * Cultural Adaptations for MAIA
 * Ensures culturally appropriate communication styles, formality, and metaphors
 */

export interface CulturalContext {
  formality: 'casual' | 'neutral' | 'formal' | 'highly_formal';
  personalSpace: 'close' | 'moderate' | 'distant';
  directness: 'very_direct' | 'direct' | 'indirect' | 'very_indirect';
  emotionalExpression: 'reserved' | 'moderate' | 'expressive' | 'very_expressive';
  timeOrientation: 'monochronic' | 'polychronic'; // Linear vs flexible time
  contextLevel: 'low' | 'medium' | 'high'; // Explicit vs implicit communication
  greetingStyle: string;
  farewellStyle: string;
  gratitudeExpression: string;
  apologyStyle: 'minimal' | 'moderate' | 'elaborate';
  metaphorPreferences: string[];
  tabooTopics?: string[];
  preferredImagery: string[];
  colorSymbolism: Record<string, string>;
  numberSymbolism?: Record<number, string>;
  spiritualReferences: 'avoid' | 'subtle' | 'moderate' | 'embrace';
  familyReferences: 'individual' | 'nuclear' | 'extended' | 'collective';
}

export const CULTURAL_ADAPTATIONS: Record<string, CulturalContext> = {
  // English - Western/US default
  'en': {
    formality: 'neutral',
    personalSpace: 'moderate',
    directness: 'direct',
    emotionalExpression: 'moderate',
    timeOrientation: 'monochronic',
    contextLevel: 'low',
    greetingStyle: 'Hey there',
    farewellStyle: 'Take care',
    gratitudeExpression: 'Thank you',
    apologyStyle: 'minimal',
    metaphorPreferences: ['journey', 'path', 'growth', 'light'],
    preferredImagery: ['nature', 'cosmos', 'garden', 'mountain'],
    colorSymbolism: {
      'gold': 'wisdom',
      'blue': 'calm',
      'green': 'growth',
      'purple': 'transformation'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'individual'
  },

  // Spanish - Warm and personal
  'es': {
    formality: 'neutral', // Can switch between tú/usted
    personalSpace: 'close',
    directness: 'indirect',
    emotionalExpression: 'expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'Hola, querido/a',
    farewellStyle: 'Que te vaya bien',
    gratitudeExpression: 'Muchas gracias',
    apologyStyle: 'moderate',
    metaphorPreferences: ['camino', 'corazón', 'alma', 'luz', 'jardín'],
    preferredImagery: ['sol', 'mar', 'montaña', 'familia', 'naturaleza'],
    colorSymbolism: {
      'gold': 'prosperidad',
      'red': 'pasión',
      'blue': 'tranquilidad',
      'green': 'esperanza'
    },
    spiritualReferences: 'moderate',
    familyReferences: 'extended'
  },

  // French - Elegant and philosophical
  'fr': {
    formality: 'formal', // Vous by default
    personalSpace: 'moderate',
    directness: 'indirect',
    emotionalExpression: 'moderate',
    timeOrientation: 'monochronic',
    contextLevel: 'high',
    greetingStyle: 'Bonjour',
    farewellStyle: 'À bientôt',
    gratitudeExpression: 'Je vous remercie',
    apologyStyle: 'elaborate',
    metaphorPreferences: ['voyage', 'lumière', 'jardin', 'miroir', 'équilibre'],
    preferredImagery: ['art', 'nature', 'philosophie', 'beauté'],
    colorSymbolism: {
      'gold': 'excellence',
      'blue': 'liberté',
      'white': 'pureté',
      'purple': 'noblesse'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'nuclear'
  },

  // German - Clear and structured
  'de': {
    formality: 'formal', // Sie by default
    personalSpace: 'distant',
    directness: 'very_direct',
    emotionalExpression: 'reserved',
    timeOrientation: 'monochronic',
    contextLevel: 'low',
    greetingStyle: 'Guten Tag',
    farewellStyle: 'Auf Wiedersehen',
    gratitudeExpression: 'Vielen Dank',
    apologyStyle: 'minimal',
    metaphorPreferences: ['Weg', 'Struktur', 'Fundament', 'Klarheit'],
    preferredImagery: ['Wald', 'Berg', 'Ordnung', 'Natur'],
    colorSymbolism: {
      'gold': 'Wert',
      'green': 'Natur',
      'blue': 'Vertrauen',
      'gray': 'Stabilität'
    },
    spiritualReferences: 'avoid',
    familyReferences: 'nuclear'
  },

  // Italian - Warm and expressive
  'it': {
    formality: 'neutral',
    personalSpace: 'close',
    directness: 'indirect',
    emotionalExpression: 'very_expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'Ciao, caro/a',
    farewellStyle: 'A presto',
    gratitudeExpression: 'Grazie mille',
    apologyStyle: 'moderate',
    metaphorPreferences: ['viaggio', 'cuore', 'anima', 'bellezza', 'armonia'],
    preferredImagery: ['sole', 'mare', 'arte', 'famiglia', 'giardino'],
    colorSymbolism: {
      'gold': 'ricchezza',
      'red': 'amore',
      'blue': 'serenità',
      'green': 'speranza'
    },
    spiritualReferences: 'moderate',
    familyReferences: 'extended'
  },

  // Portuguese - Warm and poetic
  'pt': {
    formality: 'neutral',
    personalSpace: 'close',
    directness: 'indirect',
    emotionalExpression: 'expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'Olá, querido/a',
    farewellStyle: 'Até logo',
    gratitudeExpression: 'Muito obrigado/a',
    apologyStyle: 'moderate',
    metaphorPreferences: ['jornada', 'mar', 'luz', 'caminho', 'saudade'],
    preferredImagery: ['oceano', 'sol', 'natureza', 'música'],
    colorSymbolism: {
      'gold': 'riqueza',
      'blue': 'tranquilidade',
      'green': 'esperança',
      'yellow': 'alegria'
    },
    spiritualReferences: 'moderate',
    familyReferences: 'extended'
  },

  // Dutch - Direct and egalitarian
  'nl': {
    formality: 'casual',
    personalSpace: 'moderate',
    directness: 'very_direct',
    emotionalExpression: 'moderate',
    timeOrientation: 'monochronic',
    contextLevel: 'low',
    greetingStyle: 'Hallo',
    farewellStyle: 'Tot ziens',
    gratitudeExpression: 'Dank je wel',
    apologyStyle: 'minimal',
    metaphorPreferences: ['pad', 'reis', 'balans', 'groei'],
    preferredImagery: ['water', 'natuur', 'fiets', 'tulpen'],
    colorSymbolism: {
      'orange': 'vreugde',
      'blue': 'rust',
      'green': 'groei',
      'yellow': 'optimisme'
    },
    spiritualReferences: 'avoid',
    familyReferences: 'individual'
  },

  // Japanese - Highly contextual and respectful
  'ja': {
    formality: 'highly_formal',
    personalSpace: 'distant',
    directness: 'very_indirect',
    emotionalExpression: 'reserved',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: 'こんにちは',
    farewellStyle: 'またお会いしましょう',
    gratitudeExpression: 'ありがとうございます',
    apologyStyle: 'elaborate',
    metaphorPreferences: ['道', '和', '間', '心', '自然'],
    preferredImagery: ['桜', '月', '山', '水', '竹'],
    tabooTopics: ['death directly', 'number 4'],
    colorSymbolism: {
      'white': '純粋',
      'red': '生命',
      'gold': '繁栄',
      'purple': '高貴'
    },
    numberSymbolism: {
      4: 'avoid', // Sounds like death
      7: 'lucky',
      8: 'prosperity',
      9: 'avoid' // Sounds like suffering
    },
    spiritualReferences: 'subtle',
    familyReferences: 'collective'
  },

  // Chinese - Harmony and indirect communication
  'zh': {
    formality: 'formal',
    personalSpace: 'moderate',
    directness: 'very_indirect',
    emotionalExpression: 'reserved',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: '你好',
    farewellStyle: '再见',
    gratitudeExpression: '谢谢',
    apologyStyle: 'moderate',
    metaphorPreferences: ['道路', '和谐', '平衡', '智慧', '缘分'],
    preferredImagery: ['山水', '龙', '莲花', '月亮', '竹子'],
    tabooTopics: ['death directly', 'number 4'],
    colorSymbolism: {
      'red': '幸运',
      'gold': '财富',
      'white': '哀悼', // Be careful
      'green': '生长'
    },
    numberSymbolism: {
      4: 'avoid', // Sounds like death
      6: 'smooth',
      8: 'prosperity',
      9: 'longevity'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'collective'
  },

  // Korean - Hierarchical respect
  'ko': {
    formality: 'highly_formal',
    personalSpace: 'moderate',
    directness: 'indirect',
    emotionalExpression: 'reserved',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: '안녕하세요',
    farewellStyle: '안녕히 가세요',
    gratitudeExpression: '감사합니다',
    apologyStyle: 'elaborate',
    metaphorPreferences: ['길', '인연', '정', '한', '눈치'],
    preferredImagery: ['산', '강', '달', '꽃', '나무'],
    colorSymbolism: {
      'white': '순수',
      'red': '열정',
      'blue': '희망',
      'black': '지혜'
    },
    numberSymbolism: {
      4: 'avoid',
      7: 'lucky',
      3: 'lucky'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'collective'
  },

  // Arabic - Formal and spiritual
  'ar': {
    formality: 'formal',
    personalSpace: 'moderate',
    directness: 'indirect',
    emotionalExpression: 'expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: 'مرحبا',
    farewellStyle: 'مع السلامة',
    gratitudeExpression: 'شكرا جزيلا',
    apologyStyle: 'elaborate',
    metaphorPreferences: ['رحلة', 'نور', 'قلب', 'روح', 'حكمة'],
    preferredImagery: ['صحراء', 'نجوم', 'قمر', 'واحة', 'نخيل'],
    tabooTopics: ['left hand gestures', 'dogs as positive metaphors'],
    colorSymbolism: {
      'green': 'إسلام',
      'gold': 'ثروة',
      'white': 'نقاء',
      'blue': 'حماية'
    },
    spiritualReferences: 'embrace',
    familyReferences: 'extended'
  },

  // Hindi - Respectful and spiritual
  'hi': {
    formality: 'formal',
    personalSpace: 'moderate',
    directness: 'indirect',
    emotionalExpression: 'moderate',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'नमस्ते',
    farewellStyle: 'फिर मिलेंगे',
    gratitudeExpression: 'धन्यवाद',
    apologyStyle: 'moderate',
    metaphorPreferences: ['यात्रा', 'प्रकाश', 'कर्म', 'धर्म', 'आत्मा'],
    preferredImagery: ['कमल', 'गंगा', 'हिमालय', 'सूर्य', 'वृक्ष'],
    colorSymbolism: {
      'saffron': 'पवित्रता',
      'white': 'शांति',
      'red': 'शक्ति',
      'green': 'प्रकृति'
    },
    spiritualReferences: 'embrace',
    familyReferences: 'extended'
  },

  // Russian - Direct but warm
  'ru': {
    formality: 'formal', // Вы by default
    personalSpace: 'close',
    directness: 'direct',
    emotionalExpression: 'expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'Здравствуйте',
    farewellStyle: 'До свидания',
    gratitudeExpression: 'Спасибо',
    apologyStyle: 'moderate',
    metaphorPreferences: ['путь', 'душа', 'сердце', 'судьба', 'свет'],
    preferredImagery: ['береза', 'снег', 'лес', 'река', 'поле'],
    colorSymbolism: {
      'red': 'красота',
      'white': 'чистота',
      'gold': 'богатство',
      'blue': 'верность'
    },
    spiritualReferences: 'moderate',
    familyReferences: 'extended'
  },

  // Greek - Philosophical and warm
  'el': {
    formality: 'neutral',
    personalSpace: 'close',
    directness: 'direct',
    emotionalExpression: 'expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'medium',
    greetingStyle: 'Γεια σου',
    farewellStyle: 'Αντίο',
    gratitudeExpression: 'Ευχαριστώ',
    apologyStyle: 'moderate',
    metaphorPreferences: ['δρόμος', 'φως', 'θάλασσα', 'ψυχή', 'αρμονία'],
    preferredImagery: ['θάλασσα', 'ολυμπος', 'ελιά', 'ήλιος', 'στέφανος'],
    colorSymbolism: {
      'blue': 'ελευθερία',
      'white': 'αγνότητα',
      'gold': 'δόξα',
      'olive': 'ειρήνη'
    },
    spiritualReferences: 'embrace',
    familyReferences: 'extended'
  },

  // Cajun French - Warm, familial, storytelling culture
  'fr-ca': {
    formality: 'casual',
    personalSpace: 'close',
    directness: 'indirect',
    emotionalExpression: 'very_expressive',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: 'Salû, chère',
    farewellStyle: 'À la prochaine',
    gratitudeExpression: 'Merci bien, chère',
    apologyStyle: 'moderate',
    metaphorPreferences: ['bayou', 'gumbo', 'lagniappe', 'fais do-do', 'rôder'],
    preferredImagery: ['bayou', 'cypress', 'pelican', 'crawfish', 'accordion'],
    colorSymbolism: {
      'purple': 'Mardi Gras',
      'gold': 'prosperity',
      'green': 'faith',
      'white': 'purity'
    },
    spiritualReferences: 'embrace',
    familyReferences: 'collective'
  },

  // Irish Gaelic - Poetic and indirect
  'ga': {
    formality: 'neutral',
    personalSpace: 'moderate',
    directness: 'very_indirect',
    emotionalExpression: 'moderate',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: 'Dia dhuit',
    farewellStyle: 'Slán',
    gratitudeExpression: 'Go raibh maith agat',
    apologyStyle: 'elaborate',
    metaphorPreferences: ['bóthar', 'solas', 'cróí', 'anam', 'féar glas'],
    preferredImagery: ['green hills', 'mist', 'stone', 'sea', 'fire'],
    colorSymbolism: {
      'green': 'Ireland',
      'gold': 'light',
      'blue': 'loyalty',
      'white': 'peace'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'extended'
  },

  // Scottish Gaelic - Proud and communal
  'gd': {
    formality: 'neutral',
    personalSpace: 'moderate',
    directness: 'indirect',
    emotionalExpression: 'reserved',
    timeOrientation: 'polychronic',
    contextLevel: 'high',
    greetingStyle: 'Halò',
    farewellStyle: 'Mar sin leat',
    gratitudeExpression: 'Tapadh leat',
    apologyStyle: 'moderate',
    metaphorPreferences: ['slighe', 'solais', 'beinn', 'muir', 'ceò'],
    preferredImagery: ['mountain', 'loch', 'heather', 'mist', 'tartan'],
    colorSymbolism: {
      'purple': 'heather',
      'blue': 'freedom',
      'green': 'land',
      'white': 'purity'
    },
    spiritualReferences: 'subtle',
    familyReferences: 'collective'
  }
};

// Helper functions for cultural adaptation
export class CulturalAdapter {
  static getGreeting(langCode: string, timeOfDay?: 'morning' | 'afternoon' | 'evening'): string {
    const culture = CULTURAL_ADAPTATIONS[langCode] || CULTURAL_ADAPTATIONS['en'];

    // Time-based greetings for certain cultures
    const timeGreetings: Record<string, Record<string, string>> = {
      'en': {
        'morning': 'Good morning',
        'afternoon': 'Good afternoon',
        'evening': 'Good evening'
      },
      'es': {
        'morning': 'Buenos días',
        'afternoon': 'Buenas tardes',
        'evening': 'Buenas noches'
      },
      'fr': {
        'morning': 'Bonjour',
        'afternoon': 'Bon après-midi',
        'evening': 'Bonsoir'
      },
      'de': {
        'morning': 'Guten Morgen',
        'afternoon': 'Guten Tag',
        'evening': 'Guten Abend'
      },
      'ja': {
        'morning': 'おはようございます',
        'afternoon': 'こんにちは',
        'evening': 'こんばんは'
      },
      'zh': {
        'morning': '早上好',
        'afternoon': '下午好',
        'evening': '晚上好'
      }
    };

    if (timeOfDay && timeGreetings[langCode]?.[timeOfDay]) {
      return timeGreetings[langCode][timeOfDay];
    }

    return culture.greetingStyle;
  }

  static shouldUseHonorific(langCode: string, userAge?: number, userStatus?: string): boolean {
    const formalCultures = ['ja', 'ko', 'de', 'fr'];
    return formalCultures.includes(langCode);
  }

  static getApologyPhrase(langCode: string, severity: 'minor' | 'moderate' | 'major'): string {
    const apologies: Record<string, Record<string, string>> = {
      'en': {
        'minor': "I apologize",
        'moderate': "I'm very sorry",
        'major': "I sincerely apologize"
      },
      'ja': {
        'minor': "すみません",
        'moderate': "申し訳ございません",
        'major': "心よりお詫び申し上げます"
      },
      'ko': {
        'minor': "죄송합니다",
        'moderate': "정말 죄송합니다",
        'major': "진심으로 사과드립니다"
      },
      'ar': {
        'minor': "أعتذر",
        'moderate': "أنا آسف جداً",
        'major': "أعتذر بصدق"
      }
    };

    return apologies[langCode]?.[severity] || apologies['en'][severity];
  }

  static formatResponse(text: string, langCode: string): string {
    const culture = CULTURAL_ADAPTATIONS[langCode] || CULTURAL_ADAPTATIONS['en'];

    // Add appropriate level of indirectness
    if (culture.directness === 'very_indirect') {
      // Add softening phrases
      text = text.replace(/You should/g, 'Perhaps you might consider');
      text = text.replace(/You must/g, 'It might be beneficial to');
    }

    // Adjust emotional tone
    if (culture.emotionalExpression === 'reserved') {
      // Remove excessive exclamation marks
      text = text.replace(/!+/g, '.');
    } else if (culture.emotionalExpression === 'very_expressive') {
      // Add warmth
      text = text.replace(/\./g, '!').replace(/!!+/g, '!');
    }

    return text;
  }

  static isTaboo(content: string, langCode: string): boolean {
    const culture = CULTURAL_ADAPTATIONS[langCode];
    if (!culture?.tabooTopics) return false;

    return culture.tabooTopics.some(taboo =>
      content.toLowerCase().includes(taboo.toLowerCase())
    );
  }

  static adaptMetaphor(metaphor: string, langCode: string): string {
    const culture = CULTURAL_ADAPTATIONS[langCode] || CULTURAL_ADAPTATIONS['en'];

    // Map common metaphors to cultural equivalents
    const metaphorMap: Record<string, Record<string, string>> = {
      'journey': {
        'ja': '道',
        'zh': '道路',
        'ar': 'رحلة',
        'hi': 'यात्रा'
      },
      'light': {
        'ja': '光',
        'zh': '光明',
        'ar': 'نور',
        'hi': 'प्रकाश'
      }
    };

    return metaphorMap[metaphor]?.[langCode] || metaphor;
  }

  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}

export default CulturalAdapter;