import { v4 as uuidv4 } from 'uuid';

export interface DaimonicEncounter {
  id: string;
  userId: string;
  title: string;
  symbol: string;
  message: string;
  actionPrompt: string;
  archetype: string;
  energyState: string;
  triggerContext: any;
  timestamp: number;
}

export class DaimonService {
  private symbols = [
    '🌀', '🔥', '🌊', '🌍', '⚡', '🌙', '☀️', '🌟', '💎', '🗝️',
    '🦅', '🐺', '🐉', '🦋', '🌸', '🍄', '⚔️', '🏺', '📿', '🎭'
  ];

  private archetypes = [
    'The Shadow', 'The Anima/Animus', 'The Wise Elder', 'The Innocent Child',
    'The Rebel', 'The Creator', 'The Destroyer', 'The Healer', 'The Seeker',
    'The Guardian', 'The Trickster', 'The Lover', 'The Warrior', 'The Sage'
  ];

  private energyStates = [
    'emerging', 'crystallizing', 'transforming', 'integrating', 'awakening',
    'challenging', 'beckoning', 'warning', 'celebrating', 'mourning'
  ];

  async generateEncounter(
    userId: string, 
    triggerContext: any
  ): Promise<DaimonicEncounter> {
    const symbol = this.selectSymbol(triggerContext);
    const archetype = this.selectArchetype(triggerContext);
    const energyState = this.selectEnergyState(triggerContext);
    
    const encounter: DaimonicEncounter = {
      id: uuidv4(),
      userId,
      title: await this.generateTitle(archetype, energyState),
      symbol,
      message: await this.generateMessage(archetype, energyState, triggerContext),
      actionPrompt: await this.generateActionPrompt(archetype, energyState),
      archetype,
      energyState,
      triggerContext,
      timestamp: Date.now()
    };

    return encounter;
  }

  private selectSymbol(context: any): string {
    // Choose symbol based on context patterns
    if (context.emotionalResonance?.includes('fire') || context.intensity > 0.8) {
      return '🔥';
    }
    if (context.emotionalResonance?.includes('water') || context.depth > 0.7) {
      return '🌊';
    }
    if (context.transformation || context.change) {
      return '🌀';
    }
    if (context.wisdom || context.insight) {
      return '🌟';
    }
    // Default to random selection
    return this.symbols[Math.floor(Math.random() * this.symbols.length)];
  }

  private selectArchetype(context: any): string {
    // Select based on conversation patterns
    if (context.conflict || context.resistance) {
      return 'The Shadow';
    }
    if (context.creativity || context.innovation) {
      return 'The Creator';
    }
    if (context.wisdom || context.guidance) {
      return 'The Wise Elder';
    }
    if (context.questioning || context.seeking) {
      return 'The Seeker';
    }
    // Default selection
    return this.archetypes[Math.floor(Math.random() * this.archetypes.length)];
  }

  private selectEnergyState(context: any): string {
    if (context.breakthrough || context.realization) {
      return 'crystallizing';
    }
    if (context.confusion || context.uncertainty) {
      return 'emerging';
    }
    if (context.growth || context.development) {
      return 'transforming';
    }
    if (context.integration || context.synthesis) {
      return 'integrating';
    }
    // Default selection
    return this.energyStates[Math.floor(Math.random() * this.energyStates.length)];
  }

  private async generateTitle(archetype: string, energyState: string): Promise<string> {
    const templates = [
      `${archetype} is ${energyState}`,
      `The ${energyState} ${archetype}`,
      `When ${archetype} meets ${energyState} energy`,
      `${archetype}: A moment of ${energyState}`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private async generateMessage(
    archetype: string, 
    energyState: string, 
    context: any
  ): Promise<string> {
    const messages = {
      'The Shadow': {
        emerging: "What you resist in this moment holds a key to your wholeness.",
        crystallizing: "The part of you that you've been avoiding is ready to be seen.",
        transforming: "Your resistance is becoming your greatest teacher.",
        integrating: "What once seemed dark now reveals its hidden gifts."
      },
      'The Creator': {
        emerging: "A new possibility is stirring within you, waiting to be born.",
        crystallizing: "Your creative essence is ready to manifest something beautiful.",
        transforming: "You are being called to create from a deeper place.",
        integrating: "Your creativity is finding its authentic expression."
      },
      'The Wise Elder': {
        emerging: "Ancient wisdom stirs within you, ready to be remembered.",
        crystallizing: "The deeper knowing you seek is already present within you.",
        transforming: "You are being initiated into a more mature understanding.",
        integrating: "Your wisdom is ready to be shared with the world."
      },
      'The Seeker': {
        emerging: "A new question is arising that will guide your next steps.",
        crystallizing: "The search itself is revealing what you truly seek.",
        transforming: "Your seeking is becoming a way of being.",
        integrating: "What you've been searching for was within you all along."
      }
    };

    const archetypeMessages = messages[archetype] || messages['The Seeker'];
    const message = archetypeMessages[energyState] || archetypeMessages.emerging;
    
    return message;
  }

  private async generateActionPrompt(archetype: string, energyState: string): Promise<string> {
    const prompts = {
      'The Shadow': [
        "What aspect of yourself are you most avoiding right now?",
        "How might this resistance be serving your growth?",
        "What would happen if you welcomed this part of yourself?"
      ],
      'The Creator': [
        "What wants to be created through you in this moment?",
        "How can you honor your creative essence today?",
        "What would you create if you knew you couldn't fail?"
      ],
      'The Wise Elder': [
        "What wisdom is trying to emerge through your experience?",
        "How can you honor the deeper knowing within you?",
        "What would your wisest self advise you in this moment?"
      ],
      'The Seeker': [
        "What question is your soul asking right now?",
        "What are you truly seeking beneath the surface?",
        "How might your seeking itself be the answer?"
      ]
    };

    const archetypePrompts = prompts[archetype] || prompts['The Seeker'];
    return archetypePrompts[Math.floor(Math.random() * archetypePrompts.length)];
  }

  shouldTriggerEncounter(context: any): boolean {
    // Trigger logic based on conversation depth and patterns
    const triggers = [
      context.emotionalIntensity > 0.7,
      context.transformationalMoment,
      context.resistanceDetected,
      context.breakthroughMoment,
      context.meaningMaking,
      context.depthReached
    ];

    return triggers.some(trigger => trigger === true);
  }
}