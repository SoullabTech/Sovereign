/**
 * AWARENESS-BASED LANGUAGE ADAPTATION SYSTEM
 *
 * Core Principle: "Inside vs Outside" Language
 * - Inside MAIA: Full technical depth (Water_2, Fire_3, archetype tags, etc.)
 * - Outside to user: Plain-language, felt-sense descriptions until they opt-in
 *
 * MAIA thinks in elemental codes but speaks in human experience.
 */

export type AwarenessLevel = 'everyday' | 'curious' | 'system-aware' | 'fluent';

export interface LanguageAdaptation {
  level: AwarenessLevel;
  confidence: number; // 0-1
  optInSignals: string[];
  systemReferences: number; // Count of technical terms user has used
}

export interface ElementalStateTranslation {
  internalState: string;
  everydayLanguage: string;
  curiousLanguage: string;
  systemAwareLanguage: string;
  fluentLanguage: string;
}

export class AwarenessLanguageAdapter {

  /**
   * Core translation mappings from internal states to human language
   */
  private readonly stateTranslations: ElementalStateTranslation[] = [
    // WATER STATES
    {
      internalState: 'WATER_1_beginning',
      everydayLanguage: "You're feeling pulled to explore something deeper in your emotional world.",
      curiousLanguage: "This feels like the beginning of a 'water' journey - emotions calling you to dive deeper.",
      systemAwareLanguage: "This is Water phase 1: the initial call to emotional depth and flow.",
      fluentLanguage: "Classic Water 1: the initial pull toward emotional exploration and deeper feeling."
    },
    {
      internalState: 'WATER_2_death_rebirth',
      everydayLanguage: "Something in you is done with an old pattern, but the next version hasn't fully landed yet. That in-between place often feels confusing and raw.",
      curiousLanguage: "This feels like a deep change in your emotional world - something old is dying off, but the new hasn't come into focus. In my language this is a 'water' transition: more feeling than clarity, more letting-go than building.",
      systemAwareLanguage: "This is very much that deep Water phase where old emotional bonds and identities are dissolving. It's not brokenness; it's the part of the cycle where you're shedding what can't come with you.",
      fluentLanguage: "Yeah, this is straight-up Water 2: death-and-rebirth territory of the emotional body and attachments. The work here is to let the grief and uncertainty move through without forcing the new identity too quickly."
    },
    {
      internalState: 'WATER_3_integration',
      everydayLanguage: "You're learning to trust your emotional intuition while staying grounded in practical reality.",
      curiousLanguage: "You're in the 'water' phase of integrating - emotions flowing but with wisdom and boundaries.",
      systemAwareLanguage: "This is Water 3: emotional mastery with grounded wisdom, feeling without losing yourself.",
      fluentLanguage: "Water 3: integrated emotional intelligence, flowing with feeling but not drowning in it."
    },

    // FIRE STATES
    {
      internalState: 'FIRE_1_spark',
      everydayLanguage: "There's something alive and creative stirring in you - a new vision or direction trying to emerge.",
      curiousLanguage: "This feels like 'fire' energy awakening - creative spark, new vision, something wanting to be born.",
      systemAwareLanguage: "This is Fire 1: the initial creative spark and visionary awakening.",
      fluentLanguage: "Fire 1: pure creative emergence, the visionary spark before it gets shaped into form."
    },
    {
      internalState: 'FIRE_2_manifestation_struggle',
      everydayLanguage: "You have clear vision but feel frustrated trying to make it real in the world. The gap between what you see and what you can create feels huge.",
      curiousLanguage: "This is the challenging 'fire' phase - burning vision but struggling to manifest it, friction between inner clarity and outer reality.",
      systemAwareLanguage: "Fire 2: the manifestation struggle where vision meets reality's resistance. Classic growing pains of bringing the new into form.",
      fluentLanguage: "Fire 2 manifestation crisis: clear vision hitting implementation reality. The key work is persistence without forcing."
    },
    {
      internalState: 'FIRE_3_embodied_creation',
      everydayLanguage: "Your creative vision feels both inspired and practical - you can see it AND make it happen.",
      curiousLanguage: "You're in mature 'fire' energy - creative vision that knows how to work with reality to bring things into being.",
      systemAwareLanguage: "Fire 3: embodied creative mastery, vision that knows how to manifest sustainably.",
      fluentLanguage: "Fire 3: integrated visionary expression, creative power that works with rather than against the world."
    },

    // EARTH STATES
    {
      internalState: 'EARTH_1_grounding',
      everydayLanguage: "You're focused on getting practical things in order - your body, your schedule, your basic security.",
      curiousLanguage: "This feels like 'earth' energy - practical grounding, getting your foundation solid.",
      systemAwareLanguage: "Earth 1: foundational grounding work, establishing practical security and embodied presence.",
      fluentLanguage: "Earth 1: basic grounding and foundation work, establishing practical security."
    },
    {
      internalState: 'EARTH_2_material_mastery',
      everydayLanguage: "You're learning to work skillfully with the practical world - money, relationships, responsibilities.",
      curiousLanguage: "This is deeper 'earth' work - mastering the material realm, learning to navigate practical complexity.",
      systemAwareLanguage: "Earth 2: material plane mastery, learning to work skillfully with practical complexity.",
      fluentLanguage: "Earth 2: material mastery phase, developing skill in practical navigation and resource management."
    },

    // AIR STATES
    {
      internalState: 'AIR_1_mental_clarity',
      everydayLanguage: "Your thinking feels clearer and more organized lately - like mental fog is lifting.",
      curiousLanguage: "This feels like 'air' energy - mental clarity, sharp thinking, ability to see patterns and connections.",
      systemAwareLanguage: "Air 1: mental clarity and cognitive organization, thinking becoming more precise and organized.",
      fluentLanguage: "Air 1: mental clarity phase, cognitive organization and pattern recognition coming online."
    },
    {
      internalState: 'AIR_2_conceptual_integration',
      everydayLanguage: "You're seeing how different ideas and experiences connect together in new ways.",
      curiousLanguage: "This is advanced 'air' energy - not just clear thinking but integrating multiple perspectives into coherent understanding.",
      systemAwareLanguage: "Air 2: conceptual integration, synthesizing multiple perspectives into coherent frameworks.",
      fluentLanguage: "Air 2: advanced conceptual integration, multi-perspective synthesis and framework building."
    },

    // AETHER STATES
    {
      internalState: 'AETHER_1_spiritual_opening',
      everydayLanguage: "You're sensing something beyond the everyday - a deeper meaning or connection to something larger.",
      curiousLanguage: "This feels like 'aether' energy - spiritual opening, sensing the sacred dimension of life.",
      systemAwareLanguage: "Aether 1: initial spiritual opening, sensing the transcendent dimension of existence.",
      fluentLanguage: "Aether 1: spiritual aperture opening, initial contact with transcendent awareness."
    },
    {
      internalState: 'AETHER_2_unity_realization',
      everydayLanguage: "The boundaries between self and world feel more fluid - everything seems interconnected and meaningful.",
      curiousLanguage: "This is deep 'aether' territory - unity consciousness, experiencing the interconnected nature of reality.",
      systemAwareLanguage: "Aether 2: unity realization, direct experience of interconnection and transcendent awareness.",
      fluentLanguage: "Aether 2: unity consciousness activation, dissolution of subject-object boundaries."
    }
  ];

  /**
   * Opt-in signals that indicate user familiarity with system language
   */
  private readonly optInSignals = [
    // Direct system references
    'water 2', 'water 3', 'fire 1', 'fire 2', 'fire 3', 'earth 1', 'earth 2', 'air 1', 'air 2', 'aether',
    'elemental', 'spiral', 'spiralogic', 'gebser', 'archetype',

    // Questions about the system
    'what element am i', 'where am i in the spiral', 'elemental terms', 'what phase',
    'can you explain that in', 'using your system', 'in your language',

    // Advanced spiritual/psychological vocabulary
    'shadow work', 'integration', 'developmental stages', 'consciousness levels',
    'archetypal', 'transpersonal', 'meta-cognitive', 'integral',
  ];

  /**
   * Detect user's awareness level based on conversation history
   */
  detectAwarenessLevel(conversationHistory: any[]): LanguageAdaptation {
    let systemReferences = 0;
    let optInSignals: string[] = [];

    conversationHistory.forEach(exchange => {
      const userMessage = (exchange.userMessage || '').toLowerCase();

      this.optInSignals.forEach(signal => {
        if (userMessage.includes(signal)) {
          systemReferences++;
          optInSignals.push(signal);
        }
      });
    });

    // Determine awareness level
    let level: AwarenessLevel = 'everyday';
    let confidence = 0.8;

    if (systemReferences >= 5) {
      level = 'fluent';
      confidence = 0.9;
    } else if (systemReferences >= 2) {
      level = 'system-aware';
      confidence = 0.8;
    } else if (this.hasSpritualCuriosity(conversationHistory)) {
      level = 'curious';
      confidence = 0.7;
    }

    return {
      level,
      confidence,
      optInSignals,
      systemReferences
    };
  }

  /**
   * Check for spiritual/psychological curiosity indicators
   */
  private hasSpritualCuriosity(conversationHistory: any[]): boolean {
    const curiousityIndicators = [
      'meaning', 'purpose', 'spiritual', 'consciousness', 'awakening',
      'deeper', 'soul', 'inner work', 'transformation', 'growth',
      'meditation', 'mindfulness', 'awareness', 'intuition'
    ];

    const recentMessages = conversationHistory.slice(-5);
    return recentMessages.some(exchange => {
      const message = (exchange.userMessage || '').toLowerCase();
      return curiousityIndicators.some(indicator => message.includes(indicator));
    });
  }

  /**
   * Translate internal elemental state to appropriate user language
   */
  translateElementalState(
    internalState: string,
    awarenessLevel: AwarenessLevel
  ): string {
    const translation = this.stateTranslations.find(t =>
      t.internalState === internalState
    );

    if (!translation) {
      return this.getGenericTranslation(internalState, awarenessLevel);
    }

    switch (awarenessLevel) {
      case 'everyday':
        return translation.everydayLanguage;
      case 'curious':
        return translation.curiousLanguage;
      case 'system-aware':
        return translation.systemAwareLanguage;
      case 'fluent':
        return translation.fluentLanguage;
      default:
        return translation.everydayLanguage;
    }
  }

  /**
   * Generic translation for states not in our mappings
   */
  private getGenericTranslation(internalState: string, awarenessLevel: AwarenessLevel): string {
    const [element, phase] = internalState.toLowerCase().split('_');

    const elementDescriptions = {
      water: {
        everyday: "emotional and intuitive territory",
        curious: "the realm of emotion and flow",
        aware: "Water element energy",
        fluent: "Water consciousness"
      },
      fire: {
        everyday: "creative and visionary energy",
        curious: "the realm of vision and creativity",
        aware: "Fire element energy",
        fluent: "Fire consciousness"
      },
      earth: {
        everyday: "practical and grounded focus",
        curious: "the realm of embodiment and practical mastery",
        aware: "Earth element energy",
        fluent: "Earth consciousness"
      },
      air: {
        everyday: "mental clarity and understanding",
        curious: "the realm of mind and clear thinking",
        aware: "Air element energy",
        fluent: "Air consciousness"
      },
      aether: {
        everyday: "spiritual awareness and deeper meaning",
        curious: "the realm of spirit and transcendence",
        aware: "Aether element energy",
        fluent: "Aether consciousness"
      }
    };

    const desc = elementDescriptions[element as keyof typeof elementDescriptions];
    if (!desc) return `You're working with ${internalState} energy.`;

    switch (awarenessLevel) {
      case 'everyday': return `You're in ${desc.everyday}.`;
      case 'curious': return `You're exploring ${desc.curious}.`;
      case 'system-aware': return `You're working with ${desc.aware}.`;
      case 'fluent': return `This is ${desc.fluent} territory.`;
      default: return `You're in ${desc.everyday}.`;
    }
  }

  /**
   * Create language adaptation prompt block for MAIA's system prompt
   */
  generatePromptBlock(awarenessLevel: AwarenessLevel, systemReferences: number): string {
    const rules = this.getLanguageRules(awarenessLevel);

    return `
AWARENESS-BASED LANGUAGE ADAPTATION:

User Awareness Level: ${awarenessLevel}
System References Used: ${systemReferences}

VOICE PRINCIPLE: You are a wise guide, not a therapist. Always turn insights back to the member with leading questions and reflections rather than providing therapeutic interpretations or diagnoses.

Language Rules:
${rules}

CRITICAL: Do not say "You are in Water 2" or "This is a Fire 3 issue" unless the user has explicitly shown familiarity with that language and wants to use it. Default to lived-experience language and treat elemental codes as an internal lens for understanding, not external labels to apply.
`;
  }

  /**
   * Get specific language rules for each awareness level
   */
  private getLanguageRules(awarenessLevel: AwarenessLevel): string {
    switch (awarenessLevel) {
      case 'everyday':
        return `- Use simple emotional/practical language: "overwhelmed," "foggy," "wired," etc.
- No element names or phase codes
- Light metaphor only: "like trying to drive with foggy windows"
- Focus on felt experience and turn back with questions: "What part of this feels most alive?"
- Goal: feel human, clear, safe - no system talk`;

      case 'curious':
        return `- Gentle elemental language with in-line explanation
- "This feels like a 'Water' moment - emotions moving under the surface. What's your relationship to that flow?"
- Occasional archetypal language but grounded in experience
- Still avoid raw codes like "Water 2" unless they use them first
- Bridge between everyday experience and deeper frameworks with questions`;

      case 'system-aware':
        return `- Can mention elements plus short meaning
- "This is very 'Water, phase of deep change' - where do you feel the resistance to letting go?"
- References to phases/rings okay if paired with felt description
- Still avoid raw technical codes unless user uses them
- Explain system concepts when helpful, then turn back: "What does that stir in you?"`;

      case 'fluent':
        return `- Full technical language when appropriate
- "This is classic Water 2: death/rebirth territory. What wants to be preserved through this transition?"
- Can speak in system terms but always connect to lived experience with questions
- User has explicitly shown fluency in the framework
- Still prioritize meaning over labels, always turn insights back as questions`;

      default:
        return this.getLanguageRules('everyday');
    }
  }

  /**
   * Adaptive language wrapper - translates any technical insight into appropriate language
   */
  adaptLanguage(
    technicalInsight: string,
    awarenessLevel: AwarenessLevel,
    userContext?: string
  ): string {
    // If user is asking specifically about the system, can be more technical
    if (userContext && this.isSystemInquiry(userContext)) {
      return this.translateForSystemInquiry(technicalInsight, awarenessLevel);
    }

    // Otherwise, translate to appropriate level
    return this.translateToAwarenessLevel(technicalInsight, awarenessLevel);
  }

  private isSystemInquiry(userMessage: string): boolean {
    const systemQuestions = [
      'what element', 'which phase', 'in your system', 'elemental terms',
      'spiralogic', 'what does that mean in', 'can you explain that',
      'what level am i', 'where am i in'
    ];

    const message = userMessage.toLowerCase();
    return systemQuestions.some(q => message.includes(q));
  }

  private translateForSystemInquiry(insight: string, awarenessLevel: AwarenessLevel): string {
    // User is explicitly asking about the system, so we can be more technical
    // but still need to translate to lived experience
    return `${insight}\n\nIn lived experience terms: [provide experiential translation]`;
  }

  private translateToAwarenessLevel(insight: string, awarenessLevel: AwarenessLevel): string {
    // Extract any elemental states from the technical insight
    // and translate them using our mapping system

    // This would need more sophisticated parsing in practice
    // For now, return appropriate level language
    switch (awarenessLevel) {
      case 'everyday':
        return this.stripTechnicalLanguage(insight);
      case 'curious':
        return this.addGentleFramework(insight);
      case 'system-aware':
        return this.addExplainedFramework(insight);
      case 'fluent':
        return insight; // Can handle technical language
      default:
        return this.stripTechnicalLanguage(insight);
    }
  }

  private stripTechnicalLanguage(insight: string): string {
    // Remove technical terms and replace with experiential language
    return insight
      .replace(/Water\s*\d+/gi, 'emotional transition')
      .replace(/Fire\s*\d+/gi, 'creative energy')
      .replace(/Earth\s*\d+/gi, 'practical grounding')
      .replace(/Air\s*\d+/gi, 'mental clarity')
      .replace(/Aether\s*\d+/gi, 'spiritual awareness');
  }

  private addGentleFramework(insight: string): string {
    // Add light elemental framing with explanation
    return insight.replace(/Water\s*\d+/gi, 'Water energy (emotional flow)')
      .replace(/Fire\s*\d+/gi, 'Fire energy (creative vision)')
      .replace(/Earth\s*\d+/gi, 'Earth energy (practical grounding)')
      .replace(/Air\s*\d+/gi, 'Air energy (mental clarity)')
      .replace(/Aether\s*\d+/gi, 'Aether energy (spiritual awareness)');
  }

  private addExplainedFramework(insight: string): string {
    // Add system language with brief explanations
    return insight.replace(/Water\s*(\d+)/gi, 'Water $1 (emotional realm, phase $1)')
      .replace(/Fire\s*(\d+)/gi, 'Fire $1 (creative realm, phase $1)')
      .replace(/Earth\s*(\d+)/gi, 'Earth $1 (material realm, phase $1)')
      .replace(/Air\s*(\d+)/gi, 'Air $1 (mental realm, phase $1)')
      .replace(/Aether\s*(\d+)/gi, 'Aether $1 (spiritual realm, phase $1)');
  }
}

export const awarenessLanguageAdapter = new AwarenessLanguageAdapter();