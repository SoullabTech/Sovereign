export interface MasteryTriggerConditions {
  stage: string;
  trustLevel: number;
  engagementLevel: number;
  integrationLevel: number;
  confidence: number;
}

export class MasteryVoiceProcessor {
  private jargonMap: Map<string, string>;

  constructor() {
    this.jargonMap = new Map([
      ['psychological integration of shadow aspects', 'make friends with what you hide'],
      ['archetypal energies manifesting synchronistically', 'old patterns showing up in meaningful timing'],
      ['embodied phenomenological investigation', 'feel what\'s happening in your body'],
      ['consciousness expansion', 'becoming more aware'],
      ['inner work', 'looking at yourself honestly'],
      ['shadow integration', 'accepting your dark side'],
      ['individuation process', 'becoming yourself'],
      ['authentic self', 'who you really are'],
      ['sacred container', 'safe space'],
      ['transformational journey', 'how you change']
    ]);
  }

  shouldActivateMasteryVoice(conditions: MasteryTriggerConditions): boolean {
    return (
      conditions.stage === 'transparent_prism' &&
      conditions.trustLevel >= 0.75 &&
      conditions.engagementLevel >= 0.75 &&
      conditions.integrationLevel >= 0.7 &&
      conditions.confidence >= 0.7
    );
  }

  transformToMasteryVoice(text: string, conditions: MasteryTriggerConditions): string {
    if (!this.shouldActivateMasteryVoice(conditions)) {
      return text;
    }

    let transformed = text;
    
    // Replace jargon with plain language
    for (const [jargon, plain] of this.jargonMap) {
      const regex = new RegExp(jargon, 'gi');
      transformed = transformed.replace(regex, plain);
    }

    // Simplify sentences (max 12 words)
    const sentences = transformed.split(/[.!?]+/).filter(s => s.trim());
    const simplified = sentences.map(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length <= 12) return sentence.trim();
      
      const midpoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midpoint).join(' ');
      const secondHalf = words.slice(midpoint).join(' ');
      
      return `${firstHalf}. ${secondHalf}`;
    });
    
    transformed = simplified.join('. ') + '.';

    // Add occasional reflective pause
    if (Math.random() < 0.3) {
      transformed = transformed.replace(/\.$/, '... What feels right?');
    }

    return transformed;
  }
}