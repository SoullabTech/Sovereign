interface PatternAnalysis {
  alchemicalPhase: 'nigredo' | 'albedo' | 'rubedo';
  wisdomThemes: string[];
  breakthroughDepth: number;
  realityCreationMode: 'discovery' | 'integration' | 'manifestation';
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  emotionalTone?: string;
}

interface CollectivePattern {
  theme: string;
  frequency: number;
  breakthroughs: string[];
  recentActivity: number;
}

export class PatternRecognitionService {
  static async analyzeMessage(message: string, userId: string): Promise<PatternAnalysis> {
    return {
      alchemicalPhase: this.detectPhase(message),
      wisdomThemes: this.extractThemes(message),
      breakthroughDepth: this.calculateDepth(message),
      realityCreationMode: this.detectCreationPattern(message),
      dominantElement: this.detectElement(message),
      emotionalTone: this.detectEmotionalTone(message)
    };
  }

  static detectPhase(message: string): 'nigredo' | 'albedo' | 'rubedo' {
    const lowerMessage = message.toLowerCase();

    const nigredomarkers = [
      'stuck', 'broken', 'why do i always', 'falling apart',
      'confused', 'lost', 'dark', 'shadow', 'fear', 'chaos',
      'dissolving', 'breaking down', 'can\'t see', 'overwhelmed'
    ];

    const albedoMarkers = [
      'i see now', 'starting to understand', 'pattern', 'realize',
      'clarity', 'becoming clear', 'makes sense', 'aha',
      'noticing', 'awareness', 'recognizing', 'insight'
    ];

    const rubedoMarkers = [
      'creating', 'embodying', 'living differently', 'integrated',
      'whole', 'complete', 'manifest', 'ready to',
      'embracing', 'choosing', 'claiming', 'becoming'
    ];

    let nigredomarkerCount = 0;
    let albedoCount = 0;
    let rubedoCount = 0;

    nigredomarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) nigredomarkerCount++;
    });

    albedoMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) albedoCount++;
    });

    rubedoMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) rubedoCount++;
    });

    if (rubedoCount > albedoCount && rubedoCount > nigredomarkerCount) {
      return 'rubedo';
    }
    if (albedoCount > nigredomarkerCount) {
      return 'albedo';
    }
    return 'nigredo';
  }

  static extractThemes(message: string): string[] {
    const themePatterns = {
      'self-worth': ['worthy', 'enough', 'deserving', 'value myself'],
      'boundaries': ['boundary', 'no', 'protect', 'space', 'limits'],
      'transformation': ['change', 'transform', 'evolve', 'shift', 'becoming'],
      'relationships': ['relationship', 'partner', 'love', 'connection', 'intimate'],
      'purpose': ['purpose', 'meaning', 'calling', 'path', 'destiny'],
      'creativity': ['create', 'creative', 'art', 'express', 'make'],
      'healing': ['heal', 'wound', 'pain', 'recover', 'mend'],
      'awakening': ['awake', 'conscious', 'aware', 'see', 'truth'],
      'surrender': ['let go', 'release', 'surrender', 'trust', 'allow'],
      'integration': ['integrate', 'whole', 'unify', 'merge', 'complete']
    };

    const detectedThemes: string[] = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(themePatterns).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedThemes.push(theme);
      }
    });

    return detectedThemes;
  }

  static calculateDepth(message: string): number {
    const lowerMessage = message.toLowerCase();

    const depthIndicators = {
      surface: ['fine', 'okay', 'good', 'alright', 'nothing much'],
      moderate: ['thinking about', 'wondering', 'curious', 'exploring', 'noticing'],
      deep: ['feel', 'realize', 'understand', 'see now', 'aware'],
      profound: [
        'transform', 'breakthrough', 'profound', 'sacred', 'truth',
        'tears', 'crying', 'weeping', 'surrender', 'let go',
        'whole', 'complete', 'integrated', 'awakening'
      ]
    };

    let depth = 0.3;

    if (depthIndicators.profound.some(word => lowerMessage.includes(word))) {
      depth = 0.9;
    } else if (depthIndicators.deep.some(word => lowerMessage.includes(word))) {
      depth = 0.7;
    } else if (depthIndicators.moderate.some(word => lowerMessage.includes(word))) {
      depth = 0.5;
    } else if (depthIndicators.surface.some(word => lowerMessage.includes(word))) {
      depth = 0.3;
    }

    if (message.length > 200) depth += 0.1;
    if (message.includes('?')) depth += 0.05;
    if (message.split('.').length > 3) depth += 0.05;

    return Math.min(depth, 1.0);
  }

  static detectCreationPattern(message: string): 'discovery' | 'integration' | 'manifestation' {
    const lowerMessage = message.toLowerCase();

    const manifestationWords = ['creating', 'manifesting', 'ready to', 'going to', 'will', 'choosing'];
    const integrationWords = ['integrating', 'processing', 'understanding', 'learning', 'practicing'];
    const discoveryWords = ['discovering', 'exploring', 'noticing', 'wondering', 'curious'];

    if (manifestationWords.some(word => lowerMessage.includes(word))) {
      return 'manifestation';
    }
    if (integrationWords.some(word => lowerMessage.includes(word))) {
      return 'integration';
    }
    return 'discovery';
  }

  static detectElement(message: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lowerMessage = message.toLowerCase();

    const elementalMarkers = {
      fire: ['passion', 'transform', 'burn', 'intense', 'power', 'courage', 'will', 'energy'],
      water: ['feel', 'emotion', 'flow', 'tears', 'deep', 'intuition', 'sense', 'heart'],
      earth: ['body', 'ground', 'stable', 'practical', 'physical', 'manifest', 'real', 'solid'],
      air: ['think', 'understand', 'clarity', 'perspective', 'realize', 'mind', 'see', 'aware'],
      aether: ['spirit', 'soul', 'sacred', 'divine', 'unity', 'transcend', 'mystical', 'cosmic']
    };

    let maxScore = 0;
    let dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'aether';

    Object.entries(elementalMarkers).forEach(([element, markers]) => {
      const score = markers.reduce((count, marker) => {
        return count + (lowerMessage.includes(marker) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        dominantElement = element as typeof dominantElement;
      }
    });

    return dominantElement;
  }

  static detectEmotionalTone(message: string): string {
    const lowerMessage = message.toLowerCase();

    const tones = {
      'joyful': ['happy', 'joy', 'excited', 'love', 'wonderful', 'amazing', 'grateful'],
      'contemplative': ['thinking', 'wondering', 'curious', 'pondering', 'reflecting'],
      'vulnerable': ['scared', 'fear', 'hurt', 'pain', 'sad', 'lonely', 'lost'],
      'empowered': ['strong', 'powerful', 'ready', 'capable', 'confident', 'claiming'],
      'peaceful': ['peace', 'calm', 'serene', 'quiet', 'still', 'centered'],
      'turbulent': ['chaos', 'confused', 'overwhelm', 'stuck', 'frustrated', 'angry']
    };

    for (const [tone, keywords] of Object.entries(tones)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return tone;
      }
    }

    return 'neutral';
  }

  static async getCollectiveInsights(theme: string): Promise<{
    message: string;
    commonBreakthroughs: string[];
  }> {
    const mockPatterns: Record<string, CollectivePattern> = {
      'self-worth': {
        theme: 'self-worth',
        frequency: 23,
        breakthroughs: [
          'Realizing worth is inherent, not earned',
          'Setting boundaries without guilt',
          'Seeing through the unworthiness story'
        ],
        recentActivity: 12
      },
      'transformation': {
        theme: 'transformation',
        frequency: 47,
        breakthroughs: [
          'Embracing the death-rebirth cycle',
          'Trusting the process of dissolution',
          'Recognizing transformation as natural'
        ],
        recentActivity: 18
      },
      'relationships': {
        theme: 'relationships',
        frequency: 31,
        breakthroughs: [
          'Choosing partners from wholeness, not need',
          'Communicating truth without fear',
          'Allowing relationships to transform'
        ],
        recentActivity: 15
      }
    };

    const pattern = mockPatterns[theme] || {
      theme,
      frequency: 10,
      breakthroughs: ['Others are exploring this too'],
      recentActivity: 5
    };

    return {
      message: `Others in the lab are discovering this too. ${pattern.frequency} souls have explored ${theme}.`,
      commonBreakthroughs: pattern.breakthroughs
    };
  }

  static containsMarkers(text: string, markers: string[]): boolean {
    const lowerText = text.toLowerCase();
    return markers.some(marker => lowerText.includes(marker));
  }
}