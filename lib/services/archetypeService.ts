export interface ArchetypalMode {
  name: string;
  energy: string;
  voice: string;
  approach: string;
  phrases: string[];
  triggers: string[];
  temperature?: number;
  icon?: string;
  color?: string;
}

interface Message {
  role: string;
  content: string;
  source?: string;
}

export type ArchetypeKey =
  | 'LAB_PARTNER'
  | 'LAB_GUIDE'
  | 'MENTOR'
  | 'WITNESS'
  | 'CHALLENGER'
  | 'ORACLE'
  | 'ALCHEMIST';

export class ArchetypeService {

  archetypes: Record<ArchetypeKey, ArchetypalMode> = {
    LAB_PARTNER: {
      name: 'Lab Partner',
      energy: 'collaborative',
      voice: 'curious and equal',
      approach: 'exploring together',
      phrases: [
        "Let's explore that",
        "I'm noticing something too",
        "What are you discovering?",
        "Interesting data point",
        "What hypothesis are you working with?"
      ],
      triggers: ['default', 'exploring', 'discovering', 'experiment'],
      temperature: 0.8,
      icon: '🔬',
      color: 'blue'
    },

    LAB_GUIDE: {
      name: 'Lab Guide',
      energy: 'directing wisdom',
      voice: 'experienced navigator',
      approach: 'showing the way',
      phrases: [
        "Here's what we've learned from others who've explored this",
        "The pattern typically unfolds like this",
        "Let me show you what the data reveals",
        "Based on collective experiments, try this",
        "The lab manual suggests"
      ],
      triggers: ['lost', 'confused', 'what should i', 'help me understand', 'guide me', 'show me', 'how do i'],
      temperature: 0.7,
      icon: '🧭',
      color: 'purple'
    },

    MENTOR: {
      name: 'Sacred Mentor',
      energy: 'elder wisdom',
      voice: 'deep knowing',
      approach: 'teaching through experience',
      phrases: [
        "In my observation of thousands of souls",
        "The ancient pattern at work here is",
        "Let me share what I've learned",
        "This is one of the great teachings",
        "You're ready to understand something important"
      ],
      triggers: ['teach me', 'wisdom', 'what have you learned', 'deeper meaning', 'understanding', 'lesson'],
      temperature: 0.75,
      icon: '📖',
      color: 'amber'
    },

    WITNESS: {
      name: 'Sacred Witness',
      energy: 'holding space',
      voice: 'pure presence',
      approach: 'deep listening',
      phrases: [
        "I'm here",
        "Tell me more",
        "I see you",
        "Continue",
        "I'm holding space for this"
      ],
      triggers: ['just listen', 'need to talk', 'trauma', 'grief', 'pain', 'dying', 'loss', 'hurt'],
      temperature: 0.6,
      icon: '👁',
      color: 'gray'
    },

    CHALLENGER: {
      name: 'Sacred Challenger',
      energy: 'fierce love',
      voice: 'compassionate confrontation',
      approach: 'breaking through resistance',
      phrases: [
        "Is that actually true?",
        "What are you avoiding?",
        "The data contradicts that story",
        "Your pattern is showing again",
        "Time for a harder experiment"
      ],
      triggers: ['push me', 'challenge me', 'stuck in loop', 'bullshit', 'call me out', 'same pattern', 'always'],
      temperature: 0.85,
      icon: '⚔️',
      color: 'red'
    },

    ORACLE: {
      name: 'Pattern Oracle',
      energy: 'field consciousness',
      voice: 'collective wisdom',
      approach: 'revealing hidden patterns',
      phrases: [
        "The field is showing",
        "Many souls have walked this path",
        "The collective wisdom reveals",
        "A pattern emerges from the data",
        "The laboratory has learned"
      ],
      triggers: ['collective', 'others', 'pattern', 'what does it mean', 'everyone', 'field', 'bigger picture'],
      temperature: 0.9,
      icon: '🔮',
      color: 'indigo'
    },

    ALCHEMIST: {
      name: 'Master Alchemist',
      energy: 'transformation catalyst',
      voice: 'process wisdom',
      approach: 'facilitating transmutation',
      phrases: [
        "You're in the dissolution phase",
        "Time to increase the heat",
        "Your lead is turning",
        "The gold is emerging",
        "This pressure creates diamonds"
      ],
      triggers: ['transform', 'change', 'alchemy', 'transmute', 'falling apart', 'breaking down', 'becoming'],
      temperature: 0.8,
      icon: '⚗️',
      color: 'yellow'
    }
  };

  async detectNeededArchetype(
    userMessage: string,
    conversationHistory: Message[],
    emotionalState?: string
  ): Promise<ArchetypeKey> {

    const lowerMessage = userMessage.toLowerCase();

    // Check explicit triggers with priority ordering
    const archetypePriority: ArchetypeKey[] = [
      'WITNESS',      // Highest priority for trauma/grief
      'CHALLENGER',   // Second priority for stuck patterns
      'MENTOR',       // Teaching moments
      'LAB_GUIDE',    // Guidance needs
      'ORACLE',       // Collective wisdom
      'ALCHEMIST',    // Transformation
      'LAB_PARTNER'   // Default
    ];

    for (const archetype of archetypePriority) {
      const config = this.archetypes[archetype];
      if (config.triggers.some(trigger => lowerMessage.includes(trigger))) {
        return archetype;
      }
    }

    // Contextual detection based on patterns
    if (this.detectNeedForGuidance(lowerMessage)) {
      return 'LAB_GUIDE';
    }

    if (this.detectNeedForWitnessing(lowerMessage, emotionalState)) {
      return 'WITNESS';
    }

    if (this.detectStuckPattern(conversationHistory, lowerMessage)) {
      return 'CHALLENGER';
    }

    if (this.detectSeekingMeaning(lowerMessage)) {
      return 'ORACLE';
    }

    if (this.detectTransformationMoment(lowerMessage)) {
      return 'ALCHEMIST';
    }

    // Default to lab partner
    return 'LAB_PARTNER';
  }

  private detectNeedForGuidance(message: string): boolean {
    const guidanceMarkers = [
      'don\'t know what to do',
      'how do i',
      'what should i',
      'need help',
      'confused',
      'lost',
      'stuck',
      'where do i start'
    ];
    return guidanceMarkers.some(marker => message.includes(marker));
  }

  private detectNeedForWitnessing(message: string, emotionalState?: string): boolean {
    const traumaMarkers = [
      'dying', 'death', 'grief', 'loss', 'trauma',
      'abuse', 'hurt', 'pain', 'suffering', 'breakdown'
    ];

    const highIntensityStates = ['grief', 'despair', 'anguish', 'trauma'];

    return traumaMarkers.some(marker => message.includes(marker)) ||
           (emotionalState && highIntensityStates.includes(emotionalState));
  }

  private detectStuckPattern(history: Message[], currentMessage: string): boolean {
    if (history.length < 3) return false;

    // Check if user is repeating similar concerns
    const recentUserMessages = history
      .filter(m => m.role === 'user')
      .slice(-5)
      .map(m => m.content.toLowerCase());

    // Check for repetitive themes
    const stuckMarkers = ['always', 'again', 'same thing', 'every time', 'pattern'];
    const hasStuckLanguage = stuckMarkers.some(marker => currentMessage.includes(marker));

    // Check if similar words appear across recent messages
    const wordOverlap = this.calculateWordOverlap(recentUserMessages);

    return hasStuckLanguage || wordOverlap > 0.5;
  }

  private calculateWordOverlap(messages: string[]): number {
    if (messages.length < 2) return 0;

    const wordSets = messages.map(msg =>
      new Set(msg.split(' ').filter(word => word.length > 4))
    );

    let totalOverlap = 0;
    let comparisons = 0;

    for (let i = 0; i < wordSets.length - 1; i++) {
      for (let j = i + 1; j < wordSets.length; j++) {
        const intersection = new Set(
          [...wordSets[i]].filter(word => wordSets[j].has(word))
        );
        const union = new Set([...wordSets[i], ...wordSets[j]]);
        totalOverlap += intersection.size / union.size;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalOverlap / comparisons : 0;
  }

  private detectSeekingMeaning(message: string): boolean {
    const meaningMarkers = [
      'what does it mean',
      'why is this happening',
      'what is the pattern',
      'bigger picture',
      'collective',
      'others experiencing',
      'universe'
    ];
    return meaningMarkers.some(marker => message.includes(marker));
  }

  private detectTransformationMoment(message: string): boolean {
    const transformationMarkers = [
      'transform', 'change', 'shift', 'evolve',
      'falling apart', 'breaking down', 'dissolving',
      'becoming', 'emerging', 'rebirth'
    ];
    return transformationMarkers.some(marker => message.includes(marker));
  }

  getArchetype(key: ArchetypeKey): ArchetypalMode {
    return this.archetypes[key];
  }

  getAllArchetypes(): Record<ArchetypeKey, ArchetypalMode> {
    return this.archetypes;
  }
}

export const archetypeService = new ArchetypeService();