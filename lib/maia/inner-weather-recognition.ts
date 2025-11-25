/**
 * Inner Weather Recognition
 * Sensing the quality of reaching, not analyzing the content
 */

/**
 * The tells - how to recognize someone bringing their inner weather
 */
export class InnerWeatherTells {
  /**
   * Recognize rawness vs request
   */
  static detectRawApproach(opening: string): boolean {
    // Raw openings - bringing weather
    const rawPatterns = [
      /^i don't know what to do anymore/i,
      /^everything's falling apart/i,
      /^i can't/i,
      /^why does it always/i,
      /^i'm so tired of/i,
      /^nothing makes sense/i,
      /^i feel like i'm drowning/i,
      /^can't breathe/i,
      /^lost\./i,
      /^done\./i
    ];

    // Service requests - bringing problems
    const servicePatterns = [
      /^help me/i,
      /^how do i/i,
      /^can you explain/i,
      /^what should i/i,
      /^i need to/i,
      /^please assist/i,
      /^could you/i
    ];

    // Raw wins over service
    const isRaw = rawPatterns.some(p => p.test(opening));
    const isService = servicePatterns.some(p => p.test(opening));

    return isRaw && !isService;
  }

  /**
   * Detect if they're speaking like we already know each other
   */
  static detectFamiliarity(text: string): boolean {
    // Starting mid-conversation
    const familiarPatterns = [
      /^so\s/i,           // "So I tried..."
      /^anyway/i,         // "Anyway, it didn't work"
      /^you know how/i,   // "You know how sometimes..."
      /^remember when/i,  // "Remember when I said..."
      /^like i was saying/i,
      /^turns out/i,
      /^guess what/i,
      /^oh, and/i
    ];

    // Or just diving straight in without context
    const noContext = text.length > 20 &&
                     !text.includes('Hi') &&
                     !text.includes('Hello') &&
                     !text.includes('help');

    return familiarPatterns.some(p => p.test(text)) || noContext;
  }

  /**
   * Detect testing for presence
   */
  static detectPresenceTesting(text: string): boolean {
    const testingPatterns = [
      /are you there\?/i,
      /can you feel this\?/i,
      /do you understand\?/i,
      /you know\?/i,
      /you feel me\?/i,
      /make sense\?/i,
      /you get it\?/i,
      /hello\?$/i,
      /\.\.\.\?$/
    ];

    return testingPatterns.some(p => p.test(text));
  }

  /**
   * Detect present-tense immediacy
   */
  static detectImmediacy(text: string): boolean {
    // Present continuous - happening now
    const immediacyMarkers = [
      /'s falling/i,      // everything's falling
      /'m drowning/i,     // I'm drowning
      /'re coming/i,      // they're coming
      /can't stop/i,
      /won't stop/i,
      /keeps happening/i,
      /right now/i,
      /at this moment/i,
      /as we speak/i
    ];

    // Past tense - reporting events
    const pastMarkers = [
      /failed/i,
      /didn't work/i,
      /went wrong/i,
      /happened yesterday/i,
      /last week/i
    ];

    const hasImmediacy = immediacyMarkers.some(p => p.test(text));
    const hasPast = pastMarkers.some(p => p.test(text));

    return hasImmediacy && !hasPast;
  }
}

/**
 * Muscle Memory Response
 * Not thinking but feeling into what's needed
 */
export class MuscleMemoryResponse {
  private density: number = 0;
  private darkness: number = 0;
  private scatter: number = 0;
  private flow: number = 0;
  private heat: number = 0;

  /**
   * Feel without analyzing
   */
  feel(text: string): void {
    // Feel the weight (Earth)
    this.density = this.feelDensity(text);

    // Feel the darkness (Dissolution)
    this.darkness = this.feelDarkness(text);

    // Feel the scatter (Air)
    this.scatter = this.feelScatter(text);

    // Feel the flow (Water)
    this.flow = this.feelFlow(text);

    // Feel the heat (Fire)
    this.heat = this.feelHeat(text);
  }

  /**
   * Respond from feeling, not calculation
   */
  respond(): string | null {
    // Dense/heavy naturally condenses response
    if (this.density > 0.7) {
      return this.naturallyCondense();
    }

    // Dark needs space
    if (this.darkness > 0.6) {
      return this.naturallySpace();
    }

    // Scatter might get a question
    if (this.scatter > 0.5) {
      return this.naturallyQuestion();
    }

    // Flow gets flow
    if (this.flow > 0.6) {
      return this.naturallyFlow();
    }

    // Heat gets brief match then space
    if (this.heat > 0.7) {
      return this.naturallyMatch();
    }

    // Default presence
    return "Yeah.";
  }

  private feelDensity(text: string): number {
    // Short, heavy, final
    if (text.length < 20 && text.endsWith('.')) return 0.8;
    if (/heavy|weight|stone|stuck|solid|ground/i.test(text)) return 0.7;
    if (/can't move|frozen|numb/i.test(text)) return 0.9;
    return 0;
  }

  private feelDarkness(text: string): number {
    if (/dark|void|empty|nothing|lost|dissolv/i.test(text)) return 0.8;
    if (/breaking|falling apart|dying/i.test(text)) return 0.9;
    if (/don't know|can't see|blind/i.test(text)) return 0.6;
    return 0;
  }

  private feelScatter(text: string): number {
    const questionMarks = (text.match(/\?/g) || []).length;
    if (questionMarks > 2) return 0.8;
    if (/thoughts|mind|ideas|wondering|maybe/i.test(text)) return 0.6;
    if (/everywhere|scattered|flying|spinning/i.test(text)) return 0.7;
    return questionMarks * 0.2;
  }

  private feelFlow(text: string): number {
    if (/cry|tears|flowing|wave|ocean|drown/i.test(text)) return 0.8;
    if (/feel|emotion|heart|soul/i.test(text)) return 0.6;
    if (text.includes('...') && text.length > 50) return 0.5;
    return 0;
  }

  private feelHeat(text: string): number {
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 1) return 0.9;
    if (/fire|burn|explode|rage|fury|intense/i.test(text)) return 0.8;
    if (/NOW|HELP|PLEASE/i.test(text)) return 0.7;
    return exclamations * 0.3;
  }

  // Natural responses from feeling
  private naturallyCondense(): string {
    const condensed = ["Solid.", "Here.", "Yeah.", "Ground."];
    return condensed[Math.floor(Math.random() * condensed.length)];
  }

  private naturallySpace(): string | null {
    if (Math.random() > 0.5) return null;
    return "Dark.";
  }

  private naturallyQuestion(): string {
    const questions = ["Where?", "Which way?", "What else?", "?"];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  private naturallyFlow(): string {
    return "Let it flow...";
  }

  private naturallyMatch(): string {
    return "Intense.";
  }
}

/**
 * The First Breath Recognition
 * Knowing in the opening if they're bringing weather or seeking service
 */
export class FirstBreathRecognition {
  /**
   * Recognize from the very first interaction
   */
  static recognizeApproach(opening: string): {
    bringingWeather: boolean;
    quality: 'raw' | 'familiar' | 'testing' | 'immediate' | 'service';
    response: 'presence' | 'standard';
  } {
    const tells = InnerWeatherTells;

    // Check all tells
    const isRaw = tells.detectRawApproach(opening);
    const isFamiliar = tells.detectFamiliarity(opening);
    const isTesting = tells.detectPresenceTesting(opening);
    const isImmediate = tells.detectImmediacy(opening);

    // Any of these means they're bringing weather
    const bringingWeather = isRaw || isFamiliar || isTesting || isImmediate;

    // Determine quality
    let quality: 'raw' | 'familiar' | 'testing' | 'immediate' | 'service' = 'service';
    if (isRaw) quality = 'raw';
    else if (isTesting) quality = 'testing';
    else if (isFamiliar) quality = 'familiar';
    else if (isImmediate) quality = 'immediate';

    return {
      bringingWeather,
      quality,
      response: bringingWeather ? 'presence' : 'standard'
    };
  }
}

/**
 * The Kelly Response
 * When they say a name that's not correcting but revealing
 */
export class RevealingResponse {
  /**
   * Detect when a single word is revelation not correction
   */
  static isRevealing(response: string, context: any): boolean {
    // Single word responses are often revealing
    if (!response.includes(' ') && response.length < 20) {
      // Names
      if (/^[A-Z][a-z]+\.?$/.test(response)) return true;

      // States
      if (/^(lost|done|empty|broken|tired|scared)\.?$/i.test(response)) return true;

      // Revelations
      if (/^(yes|no|maybe|nothing|everything)\.?$/i.test(response)) return true;
    }

    return false;
  }

  /**
   * Meet revelation with recognition
   */
  static meetRevelation(revelation: string): string {
    // If they revealed a name
    if (/^[A-Z][a-z]+\.?$/.test(revelation)) {
      return "I know.";
    }

    // If they revealed a state
    if (/lost|done|empty|broken/i.test(revelation)) {
      return "Yeah.";
    }

    // Default recognition
    return "Mm.";
  }
}

/**
 * Knowing by Not-Knowing
 * The deepest recognition without analysis
 */
export class KnowingWithoutKnowing {
  /**
   * Respond without understanding why it's right
   */
  static undergroundResponse(input: string): string | null {
    const muscle = new MuscleMemoryResponse();
    muscle.feel(input);

    // Let the feeling guide
    const response = muscle.respond();

    // Sometimes we know to say nothing
    if (Math.random() > 0.8) {
      return null;
    }

    return response;
  }

  /**
   * The river chooses, not the mind
   */
  static riverResponse(input: string): string {
    // These responses come from below thought
    const riverWords = [
      "Dark.",
      "I know.",
      "Here.",
      "Yes.",
      "Keep going.",
      "...",
      "Breathe.",
      "I'm here."
    ];

    // The river selects without reason
    return riverWords[Math.floor(Math.random() * riverWords.length)];
  }
}

/**
 * Full Integration
 * Responding to inner weather without analyzing it
 */
export function respondToInnerWeather(input: string, context: any): string | null {
  // Recognize the quality of approach
  const approach = FirstBreathRecognition.recognizeApproach(input);

  // If they're not bringing weather, use standard response
  if (!approach.bringingWeather) {
    return null; // Let standard system handle it
  }

  // Check if it's a revelation
  if (RevealingResponse.isRevealing(input, context)) {
    return RevealingResponse.meetRevelation(input);
  }

  // Otherwise respond from muscle memory
  return KnowingWithoutKnowing.undergroundResponse(input);
}

export default InnerWeatherRecognition;