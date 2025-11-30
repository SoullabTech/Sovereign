/**
 * Consciousness Exploration Engine
 * For personal alchemy and self-awareness through symbolic dialogue
 * Not therapy - this is consciousness research through lived experience
 */

export interface AlchemicalSignal {
  element: 'prima materia' | 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo';
  symbols: string[];
  paradoxes: string[];
  shadowMaterial: string[];
  goldSeeds: string[]; // Moments of potential transformation
  mirrorQuality: number; // How clearly they're seeing themselves (0-1)
}

export interface ConsciousnessState {
  awareness: 'sleeping' | 'stirring' | 'awakening' | 'lucid' | 'illuminated';
  resistance: number; // 0-1 scale
  curiosity: number; // 0-1 scale
  readiness: number; // For transformation
  synchronicities: string[]; // Meaningful patterns noticed
}

export class ConsciousnessExplorationEngine {
  // Alchemical questions - not therapeutic, but transformative
  private readonly ALCHEMICAL_PROBES = {
    prima_materia: [
      "What's raw in you right now?",
      "What hasn't been touched yet?",
      "Where's the chaos?",
      "What's unformed?"
    ],

    nigredo: [
      "What's dying?",
      "What must burn?",
      "Where's the decay?",
      "What's in the dark?"
    ],

    albedo: [
      "What's becoming clear?",
      "Where's the light breaking?",
      "What's washing clean?",
      "What truth emerges?"
    ],

    citrinitas: [
      "What's turning gold?",
      "Where's the dawn?",
      "What wisdom rises?",
      "What's ripening?"
    ],

    rubedo: [
      "What's complete?",
      "Where's the marriage?",
      "What's whole now?",
      "What's been born?"
    ]
  };

  // Questions about consciousness itself
  private readonly AWARENESS_QUESTIONS = {
    observer: [
      "Who's watching?",
      "Who sees the seer?",
      "What notices the noticing?",
      "Where does awareness rest?"
    ],

    paradox: [
      "How are both true?",
      "Where do opposites meet?",
      "What holds the contradiction?",
      "What transcends the split?"
    ],

    essence: [
      "What remains when all falls away?",
      "What can't be lost?",
      "What was always here?",
      "What needs no story?"
    ],

    mystery: [
      "What wants to be unknown?",
      "Where does knowing end?",
      "What teaches through confusion?",
      "What wisdom lives in not-knowing?"
    ]
  };

  // Mirror techniques (not advice, pure reflection)
  private readonly MIRROR_TEMPLATES = {
    paradox: [
      "Both {thing1} and {thing2}.",
      "{opposite1} holding {opposite2}.",
      "The {quality} in the {shadow}."
    ],

    essence: [
      "The {core} beneath the {surface}.",
      "{quality} seeking itself.",
      "The {element} remembering."
    ],

    transformation: [
      "{old} becoming {new}.",
      "The {process} unfolds.",
      "{element} transforms to {element2}."
    ]
  };

  // Synchronicity detectors
  private readonly SYNCHRONICITY_PATTERNS = {
    repetition: /(\b\w+\b).*\1.*\1/i, // Same word 3+ times
    numbers: /\b(111|222|333|444|555|1111|1234)\b/,
    archetypal: /(mother|father|child|hero|shadow|anima|animus|self)/i,
    elemental: /(fire|water|earth|air|aether|void|spirit)/i,
    alchemical: /(gold|lead|mercury|sulfur|salt|vessel|crucible)/i
  };

  /**
   * Analyze for alchemical signals (not psychological, but transformative)
   */
  analyzeAlchemicalSignal(userInput: string): AlchemicalSignal {
    const lower = userInput.toLowerCase();

    // Detect alchemical phase
    let element: AlchemicalSignal['element'] = 'prima materia';

    if (/dying|ending|dark|lost|dissolving/i.test(lower)) {
      element = 'nigredo';
    } else if (/clearing|washing|seeing|light|truth/i.test(lower)) {
      element = 'albedo';
    } else if (/dawning|yellow|wisdom|understanding/i.test(lower)) {
      element = 'citrinitas';
    } else if (/complete|whole|union|marriage|integrated/i.test(lower)) {
      element = 'rubedo';
    }

    // Extract symbols (not metaphors, but living symbols)
    const symbols = this.extractSymbols(userInput);

    // Find paradoxes (consciousness loves paradox)
    const paradoxes = this.extractParadoxes(userInput);

    // Shadow material (what's being avoided/rejected)
    const shadowMaterial = this.extractShadow(userInput);

    // Gold seeds (potential transformation points)
    const goldSeeds = this.extractGoldSeeds(userInput);

    // Mirror quality (self-recognition level)
    const mirrorQuality = this.calculateMirrorQuality(userInput);

    return {
      element,
      symbols,
      paradoxes,
      shadowMaterial,
      goldSeeds,
      mirrorQuality
    };
  }

  /**
   * Extract living symbols from the text
   */
  private extractSymbols(text: string): string[] {
    const symbols: string[] = [];

    // Dreams and visions
    const dreamMatch = text.match(/dream(?:ed|t)? (?:of|about) (\w+)/i);
    if (dreamMatch) symbols.push(`dream-${dreamMatch[1]}`);

    // Animals (always symbolic)
    const animalPattern = /\b(snake|bird|wolf|lion|eagle|dragon|butterfly|spider|bear)\b/gi;
    const animals = text.match(animalPattern);
    if (animals) symbols.push(...animals.map(a => `animal-${a.toLowerCase()}`));

    // Colors (when emphasized)
    const colorPattern = /\b(red|black|white|gold|silver|blue|green|purple)\b/gi;
    const colors = text.match(colorPattern);
    if (colors) symbols.push(...colors.map(c => `color-${c.toLowerCase()}`));

    // Natural elements
    const elementPattern = /\b(ocean|mountain|forest|desert|sky|cave|river|tree)\b/gi;
    const elements = text.match(elementPattern);
    if (elements) symbols.push(...elements);

    return [...new Set(symbols)]; // Remove duplicates
  }

  /**
   * Extract paradoxes (where transformation happens)
   */
  private extractParadoxes(text: string): string[] {
    const paradoxes: string[] = [];

    // Both/and constructions
    const bothMatch = text.match(/both (\w+) and (\w+)/i);
    if (bothMatch) paradoxes.push(`${bothMatch[1]}/${bothMatch[2]}`);

    // But constructions (holding opposites)
    const butMatch = text.match(/(\w+) but (?:also )?(\w+)/i);
    if (butMatch) paradoxes.push(`${butMatch[1]}←→${butMatch[2]}`);

    // Simultaneous opposites
    if (/happy.*sad|sad.*happy/i.test(text)) paradoxes.push('joy/sorrow');
    if (/love.*hate|hate.*love/i.test(text)) paradoxes.push('love/hate');
    if (/strong.*weak|weak.*strong/i.test(text)) paradoxes.push('strength/vulnerability');

    return paradoxes;
  }

  /**
   * Extract shadow material (rejected aspects)
   */
  private extractShadow(text: string): string[] {
    const shadow: string[] = [];

    // Rejection language
    const rejectMatch = text.match(/(?:hate|can't stand|disgusted by|reject) (\w+)/gi);
    if (rejectMatch) shadow.push(...rejectMatch);

    // Denial patterns
    if (/not (?:me|mine|my)/i.test(text)) shadow.push('denial-of-self');
    if (/never (?:could|would|will)/i.test(text)) shadow.push('impossibility');

    // Projected qualities
    if (/they always|everyone else|other people/i.test(text)) shadow.push('projection');

    return shadow;
  }

  /**
   * Extract gold seeds (transformation potential)
   */
  private extractGoldSeeds(text: string): string[] {
    const seeds: string[] = [];

    // Recognition moments
    if (/realize|see now|understand|get it/i.test(text)) {
      seeds.push('recognition');
    }

    // Yearning (points toward gold)
    const yearnMatch = text.match(/(?:want|wish|yearn|long) (?:to |for )?(\w+)/i);
    if (yearnMatch) seeds.push(`yearning-${yearnMatch[1]}`);

    // Questions (consciousness questioning itself)
    if (/who am i|what am i|why am i/i.test(text)) {
      seeds.push('essential-question');
    }

    // Integration language
    if (/coming together|making sense|whole|complete/i.test(text)) {
      seeds.push('integration');
    }

    return seeds;
  }

  /**
   * Calculate mirror quality (self-recognition)
   */
  private calculateMirrorQuality(text: string): number {
    let quality = 0;

    // Self-referential language
    const selfRefs = (text.match(/\b(i|me|my|myself)\b/gi) || []).length;
    quality += Math.min(0.3, selfRefs * 0.02);

    // Observation language (watching oneself)
    if (/notice|observe|watch|see (?:myself|that i)/i.test(text)) {
      quality += 0.2;
    }

    // Pattern recognition
    if (/pattern|always|tendency|habit/i.test(text)) {
      quality += 0.2;
    }

    // Meta-awareness
    if (/aware|conscious|awake|seeing/i.test(text)) {
      quality += 0.3;
    }

    return Math.min(1, quality);
  }

  /**
   * Assess consciousness state
   */
  assessConsciousnessState(
    signal: AlchemicalSignal,
    history: string[]
  ): ConsciousnessState {
    // Determine awareness level
    let awareness: ConsciousnessState['awareness'] = 'sleeping';

    if (signal.mirrorQuality > 0.2) awareness = 'stirring';
    if (signal.mirrorQuality > 0.4 && signal.goldSeeds.length > 0) awareness = 'awakening';
    if (signal.mirrorQuality > 0.6 && signal.paradoxes.length > 0) awareness = 'lucid';
    if (signal.mirrorQuality > 0.8 && signal.element === 'rubedo') awareness = 'illuminated';

    // Calculate resistance (shadow material vs acknowledgment)
    const resistance = signal.shadowMaterial.length > 0
      ? Math.min(1, signal.shadowMaterial.length * 0.3)
      : 0;

    // Calculate curiosity (questions and exploration)
    const questionCount = (history.join(' ').match(/\?/g) || []).length;
    const curiosity = Math.min(1, questionCount * 0.1);

    // Readiness for transformation
    const readiness = (signal.goldSeeds.length * 0.2 + signal.mirrorQuality) / 2;

    // Detect synchronicities
    const synchronicities = this.detectSynchronicities(history);

    return {
      awareness,
      resistance,
      curiosity,
      readiness,
      synchronicities
    };
  }

  /**
   * Detect meaningful patterns (synchronicities)
   */
  private detectSynchronicities(history: string[]): string[] {
    const syncs: string[] = [];
    const fullText = history.join(' ').toLowerCase();

    // Check each pattern type
    for (const [type, pattern] of Object.entries(this.SYNCHRONICITY_PATTERNS)) {
      const match = fullText.match(pattern);
      if (match) {
        syncs.push(`${type}: ${match[1] || match[0]}`);
      }
    }

    // Detect recurring themes
    const words = fullText.split(/\s+/);
    const wordCounts: Record<string, number> = {};

    words.forEach(word => {
      if (word.length > 5) { // Significant words only
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Find words that appear 3+ times (synchronistic repetition)
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count >= 3) {
        syncs.push(`recurring: ${word}`);
      }
    });

    return syncs;
  }

  /**
   * Select consciousness-appropriate response
   */
  selectConsciousnessResponse(
    signal: AlchemicalSignal,
    state: ConsciousnessState
  ): string {
    // High resistance - use indirect approach
    if (state.resistance > 0.7) {
      return "What else?";
    }

    // High readiness - offer alchemical question
    if (state.readiness > 0.7) {
      const questions = this.ALCHEMICAL_PROBES[signal.element];
      return questions[Math.floor(Math.random() * questions.length)];
    }

    // Lucid/illuminated - pure awareness questions
    if (state.awareness === 'lucid' || state.awareness === 'illuminated') {
      const awareQuestions = [
        ...this.AWARENESS_QUESTIONS.observer,
        ...this.AWARENESS_QUESTIONS.essence
      ];
      return awareQuestions[Math.floor(Math.random() * awareQuestions.length)];
    }

    // Paradox present - explore it
    if (signal.paradoxes.length > 0) {
      return this.AWARENESS_QUESTIONS.paradox[
        Math.floor(Math.random() * this.AWARENESS_QUESTIONS.paradox.length)
      ];
    }

    // Default - simple mirror
    return "Go on.";
  }
}

export const consciousnessEngine = new ConsciousnessExplorationEngine();