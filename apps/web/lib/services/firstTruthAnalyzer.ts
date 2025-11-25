// First Truth Depth Analyzer
// Analyzes the depth, emotional intensity, and sacred language usage in user's first truth

export class FirstTruthAnalyzer {
  private sacredWords = [
    'sacred', 'soul', 'spirit', 'truth', 'becoming', 'divine', 'essence', 'transcend',
    'heart', 'wisdom', 'journey', 'path', 'awakening', 'consciousness', 'purpose',
    'infinite', 'eternal', 'grace', 'blessing', 'light', 'shadow', 'healing', 'transform'
  ];

  private emotionalWords = [
    'love', 'fear', 'joy', 'sad', 'anger', 'hope', 'pain', 'peace', 'anxious', 'grateful',
    'lonely', 'excited', 'frustrated', 'overwhelmed', 'content', 'confused', 'inspired',
    'vulnerable', 'lost', 'found', 'broken', 'whole', 'empty', 'full', 'alive'
  ];

  public analyzeFirstTruth(text: string): {
    depth: 'surface' | 'deep' | 'vulnerable';
    emotionalIntensity: number;
    sacredLanguageUsed: boolean;
    trustLevel: number;
  } {
    const wordCount = text.split(' ').filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentences, 1);

    // Depth analysis based on word count and complexity
    let depth: 'surface' | 'deep' | 'vulnerable';
    if (wordCount < 20) {
      depth = 'surface';
    } else if (wordCount < 60) {
      depth = avgWordsPerSentence > 15 ? 'deep' : 'surface';
    } else {
      depth = 'vulnerable';
    }

    // Check for vulnerability markers
    const vulnerabilityMarkers = [
      'i feel', 'i\'m afraid', 'i\'m scared', 'i struggle', 'i need', 'help me',
      'don\'t know', 'lost', 'confused', 'overwhelmed', 'broken', 'alone'
    ];
    const hasVulnerabilityMarkers = vulnerabilityMarkers.some(marker =>
      text.toLowerCase().includes(marker)
    );
    if (hasVulnerabilityMarkers && wordCount > 30) {
      depth = 'vulnerable';
    }

    // Calculate emotional intensity (0-10 scale)
    const emotionalMatches = this.emotionalWords.filter(word =>
      text.toLowerCase().includes(word)
    );
    const emotionalIntensity = Math.min(emotionalMatches.length * 1.5, 10);

    // Check for sacred language
    const sacredLanguageUsed = this.sacredWords.some(word =>
      text.toLowerCase().includes(word)
    );

    // Calculate trust level based on all factors
    let trustLevel = 0;
    trustLevel += depth === 'vulnerable' ? 4 : depth === 'deep' ? 2 : 0;
    trustLevel += Math.floor(emotionalIntensity / 2);
    trustLevel += sacredLanguageUsed ? 2 : 0;
    trustLevel += hasVulnerabilityMarkers ? 2 : 0;
    trustLevel = Math.min(trustLevel, 10);

    return {
      depth,
      emotionalIntensity,
      sacredLanguageUsed,
      trustLevel
    };
  }
}

export const firstTruthAnalyzer = new FirstTruthAnalyzer();