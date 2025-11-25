/**
 * Simple Conversation Memory System
 * Practical implementation to fix repetition and body blindness
 */

export interface BodyState {
  symptom: string;
  intensity: number;
  firstMentioned: number;
  lastReferenced: number;
  resolved: boolean;
}

export interface ConversationMemory {
  // Track what's been discussed
  topics: Set<string>;
  emotions: Set<string>;

  // Prevent repetition
  questionsAsked: Map<string, number>; // question -> turn number
  responsesGiven: string[];

  // Body awareness
  bodyStates: Map<string, BodyState>;

  // Conversation arc
  currentTurn: number;
  lastElement: string;
  elementHistory: string[];

  // User profile
  hasADHD: boolean;
  isAutistic: boolean;
  hasSensoryIssues: boolean;
}

export class SimpleConversationMemory {
  private memory: ConversationMemory;

  constructor() {
    this.memory = {
      topics: new Set(),
      emotions: new Set(),
      questionsAsked: new Map(),
      responsesGiven: [],
      bodyStates: new Map(),
      currentTurn: 0,
      lastElement: '',
      elementHistory: [],
      hasADHD: false,
      isAutistic: false,
      hasSensoryIssues: false
    };
  }

  // Expose properties for external access
  get topics(): Set<string> { return this.memory.topics; }
  get emotions(): Set<string> { return this.memory.emotions; }
  get bodyStates(): Map<string, BodyState> { return this.memory.bodyStates; }
  get elementHistory(): string[] { return this.memory.elementHistory; }

  /**
   * Extract body symptoms from input (EARTH quadrant - body/embodiment)
   */
  extractBodySymptoms(input: string): void {
    const text = input.toLowerCase();

    const bodyPatterns = [
      // Stomach
      { pattern: /stomach.*(hurt|ache|churn|upset|sick)/i, part: 'stomach', symptom: 'distress' },
      { pattern: /(nausea|queasy|sick to)/i, part: 'stomach', symptom: 'nausea' },

      // Head
      { pattern: /head.*(spin|hurt|ache|pound|throb)/i, part: 'head', symptom: 'pain' },
      { pattern: /(dizzy|lightheaded|woozy)/i, part: 'head', symptom: 'dizziness' },
      { pattern: /(migraine|headache)/i, part: 'head', symptom: 'headache' },

      // Chest/Heart
      { pattern: /chest.*(tight|heavy|hurt|pressure)/i, part: 'chest', symptom: 'tightness' },
      { pattern: /heart.*(race|pound|fast|flutter)/i, part: 'heart', symptom: 'racing' },
      { pattern: /(palpitations|skipped beat)/i, part: 'heart', symptom: 'palpitations' },

      // Breathing
      { pattern: /(can't breathe|short.*breath|hyperventilat)/i, part: 'breath', symptom: 'restricted' },
      { pattern: /breath.*(shallow|quick|fast)/i, part: 'breath', symptom: 'shallow' },

      // General body
      { pattern: /(shak|trembl|shiver)/i, part: 'body', symptom: 'shaking' },
      { pattern: /(tense|tight|clench)/i, part: 'muscles', symptom: 'tension' },
      { pattern: /(tired|exhausted|drained|fatigue)/i, part: 'energy', symptom: 'exhaustion' },
      { pattern: /(heavy|weight|pressure)/i, part: 'body', symptom: 'heaviness' },

      // Sensory
      { pattern: /(noise.*much|loud|ears.*hurt)/i, part: 'ears', symptom: 'sensory-overload' },
      { pattern: /(lights.*bright|eyes.*hurt)/i, part: 'eyes', symptom: 'light-sensitivity' }
    ];

    for (const { pattern, part, symptom } of bodyPatterns) {
      if (pattern.test(text)) {
        this.recordBodySymptom(part, symptom, 0.7);
      }
    }
  }

  /**
   * Record a body symptom (EARTH quadrant)
   */
  recordBodySymptom(part: string, symptom: string, intensity = 0.5): void {
    const existing = this.memory.bodyStates.get(part);

    if (existing) {
      existing.lastReferenced = this.memory.currentTurn;
      existing.intensity = Math.max(existing.intensity, intensity);
    } else {
      this.memory.bodyStates.set(part, {
        symptom,
        intensity,
        firstMentioned: this.memory.currentTurn,
        lastReferenced: this.memory.currentTurn,
        resolved: false
      });
    }
  }

  /**
   * Check if we've asked this question recently
   */
  hasAskedRecently(question: string, withinTurns = 5): boolean {
    const normalizedQ = this.normalizeQuestion(question);
    const askedAt = this.memory.questionsAsked.get(normalizedQ);

    if (!askedAt) return false;
    return (this.memory.currentTurn - askedAt) <= withinTurns;
  }

  /**
   * Record that we asked a question
   */
  recordQuestion(question: string): void {
    const normalized = this.normalizeQuestion(question);
    this.memory.questionsAsked.set(normalized, this.memory.currentTurn);
  }

  /**
   * Get unresolved body symptoms
   */
  getActiveBodySymptoms(): Array<[string, BodyState]> {
    return Array.from(this.memory.bodyStates.entries())
      .filter(([_, state]) => !state.resolved)
      .sort((a, b) => b[1].intensity - a[1].intensity);
  }

  /**
   * Build context-aware response considering memory (enhanced for Intelligence Engine)
   */
  generateContextAwareResponse(input: string, analysis?: any): string | null {
    const lower = input.toLowerCase();

    // Check for resolution signals
    if (lower.includes('better') || lower.includes('settled') || lower.includes('calmed')) {
      this.resolveSymptoms(lower);
    }

    // Enhanced body weaving with intensity awareness
    const activeSymptoms = this.getActiveBodySymptoms();
    for (const [part, state] of activeSymptoms) {
      const turnsSinceReference = this.memory.currentTurn - state.lastReferenced;
      const turnsSinceMentioned = this.memory.currentTurn - state.firstMentioned;

      // Don't repeat if they just mentioned it
      if (!input.includes(part) && turnsSinceMentioned >= 2 && turnsSinceReference >= 3) {
        state.lastReferenced = this.memory.currentTurn;

        if (state.intensity >= 0.7) {
          return `your ${part} is holding ${state.symptom}. Want a quick grounding exercise?`;
        }
        return `earlier you mentioned your ${part} ${state.symptom}. Is that still present?`;
      }
    }

    // Connect emotions to topics with memory weaving
    if (this.memory.emotions.size > 0 && this.memory.topics.size > 0) {
      const emotion = Array.from(this.memory.emotions)[0];
      const topic = Array.from(this.memory.topics)[0];
      if (!lower.includes(emotion) && !lower.includes(topic)) {
        return `you've shared feeling ${emotion} about ${topic}. How do those connect for you?`;
      }
    }

    // Prevent repetitive questions with intelligence
    const commonQuestions = [
      "How does that land in your body?",
      "What's coming up for you?",
      "Can you say more about that?",
      "Tell me more about that.",
      "What feeling is underneath?"
    ];

    for (const question of commonQuestions) {
      if (this.hasAskedRecently(question, 3)) {
        const part = question.includes('body') ? 'body' :
                    question.includes('coming up') ? 'emotions' : 'thoughts';
        return `you've already shared how it feels in your ${part} — has it shifted since?`;
      }
    }

    // Progressive depth based on memory accumulation
    if (this.memory.topics.size > 2 && this.memory.emotions.size > 1) {
      return `I'm noticing patterns in what you've shared. What feels most alive in all of this?`;
    }

    // Memory-driven technique enhancement
    if (analysis && analysis.technique?.type === 'mirror' && this.memory.emotions.size > 0) {
      const recentEmotion = Array.from(this.memory.emotions)[this.memory.emotions.size - 1];
      return `and I sense the ${recentEmotion} underneath all of this`;
    }

    return null;
  }

  /**
   * Track conversation progress
   */
  advanceTurn(): void {
    this.memory.currentTurn++;

    // Clean up old responses to prevent memory bloat
    if (this.memory.responsesGiven.length > 10) {
      this.memory.responsesGiven.shift();
    }
  }

  /**
   * Extract and remember topics (AIR quadrant - mind/clarity)
   */
  extractTopics(input: string): void {
    const topicPatterns = [
      { pattern: /work|job|career|office|meeting/i, topic: 'work' },
      { pattern: /adhd|attention|focus|distract/i, topic: 'ADHD' },
      { pattern: /autism|autistic|spectrum/i, topic: 'autism' },
      { pattern: /family|relationship|partner/i, topic: 'relationships' },
      { pattern: /anxiety|stress|overwhelm/i, topic: 'anxiety' },
      { pattern: /school|class|study|exam/i, topic: 'school' },
      { pattern: /friend|social|people/i, topic: 'social' },
      { pattern: /mask|masking|pretend/i, topic: 'masking' }
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(input)) {
        this.memory.topics.add(topic);
        console.log(`[MEMORY] Added topic: ${topic}`);
      }
    }
  }

  /**
   * Track emotional states (WATER quadrant - emotions/empathy)
   */
  extractEmotions(input: string): void {
    const emotionPatterns = [
      { pattern: /sad|down|depressed|low|blue/i, emotion: 'sadness' },
      { pattern: /angry|frustrated|mad|rage|pissed/i, emotion: 'anger' },
      { pattern: /anxious|worried|nervous|scared|fear/i, emotion: 'anxiety' },
      { pattern: /excited|happy|joy|elated|thrilled/i, emotion: 'excitement' },
      { pattern: /confused|lost|unclear|bewildered/i, emotion: 'confusion' },
      { pattern: /overwhelm|flooded|too much/i, emotion: 'overwhelm' },
      { pattern: /numb|empty|void|nothing/i, emotion: 'numbness' },
      { pattern: /ashamed|shame|guilty|bad/i, emotion: 'shame' },
      { pattern: /lonely|alone|isolated/i, emotion: 'loneliness' }
    ];

    for (const { pattern, emotion } of emotionPatterns) {
      if (pattern.test(input)) {
        this.memory.emotions.add(emotion);
        console.log(`[MEMORY] Added emotion: ${emotion}`);
      }
    }
  }

  /**
   * Update user profile and extract all quadrants
   */
  updateProfile(input: string): void {
    // Neurodivergent markers
    if (/adhd|attention|hyperfocus|distract/i.test(input)) {
      this.memory.hasADHD = true;
    }
    if (/autis|spectrum|stim/i.test(input)) {
      this.memory.isAutistic = true;
    }
    if (/sensory|overwhelm|noise|lights|texture/i.test(input)) {
      this.memory.hasSensoryIssues = true;
    }

    // Extract body symptoms (EARTH)
    this.extractBodySymptoms(input);

    // Extract possibilities (FIRE quadrant - transformation/growth)
    this.extractPossibilities(input);

    // Extract paradoxes (AETHER quadrant - integration/spaciousness)
    this.extractParadoxes(input);
  }

  /**
   * Extract possibilities and desires (FIRE quadrant)
   */
  private extractPossibilities(input: string): void {
    const firePatterns = [
      /want.*(change|different|better)/i,
      /wish.*could/i,
      /dream.*about/i,
      /hope.*for/i,
      /imagine.*if/i,
      /possibility/i,
      /potential/i,
      /transform/i
    ];

    for (const pattern of firePatterns) {
      if (pattern.test(input)) {
        // Store in topics with 'possibility:' prefix
        this.memory.topics.add('possibility:change');
      }
    }
  }

  /**
   * Extract paradoxes and contradictions (AETHER quadrant)
   */
  private extractParadoxes(input: string): void {
    const aetherPatterns = [
      /(both|at the same time)/i,
      /(but also|yet|however)/i,
      /contradict/i,
      /paradox/i,
      /(empty.*full|full.*empty)/i,
      /(meaningless|pointless|void)/i,
      /(everything.*nothing|nothing.*everything)/i
    ];

    for (const pattern of aetherPatterns) {
      if (pattern.test(input)) {
        // Mark that paradox/integration is needed
        this.memory.emotions.add('paradox');
      }
    }
  }

  /**
   * Check if symptoms have resolved
   */
  private resolveSymptoms(input: string): void {
    for (const [part, state] of this.memory.bodyStates.entries()) {
      if (input.includes(part) && (input.includes('better') || input.includes('settled'))) {
        state.resolved = true;
        state.intensity = 0;
      }
    }
  }

  /**
   * Normalize questions for comparison
   */
  private normalizeQuestion(question: string): string {
    return question.toLowerCase()
      .replace(/[?.,!]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get conversation summary
   */
  getSummary(): string {
    const topics = Array.from(this.memory.topics).join(', ');
    const emotions = Array.from(this.memory.emotions).join(', ');
    const symptoms = Array.from(this.memory.bodyStates.keys()).join(', ');

    return `Turn ${this.memory.currentTurn}: Topics[${topics}], Emotions[${emotions}], Body[${symptoms}]`;
  }

  /**
   * Record input and extract all patterns (for Intelligence Engine compatibility)
   */
  recordInput(input: string): void {
    this.advanceTurn();
    this.updateProfile(input);
    this.extractTopics(input);
    this.extractEmotions(input);
  }

  /**
   * Enhanced debug snapshot for Intelligence Engine
   */
  debugSnapshot(analysis?: any): void {
    console.log('🧠 MEMORY SNAPSHOT');
    console.log('Turn:', this.memory.currentTurn);
    console.log('Topics:', Array.from(this.memory.topics));
    console.log('Emotions:', Array.from(this.memory.emotions));
    console.log('Body States:', Array.from(this.memory.bodyStates.entries()).map(([part, state]) =>
      `${part}: ${state.symptom} (${state.intensity})`));
    console.log('Questions Asked:', this.memory.questionsAsked.size);
    console.log('Profile:', {
      hasADHD: this.memory.hasADHD,
      isAutistic: this.memory.isAutistic,
      hasSensoryIssues: this.memory.hasSensoryIssues
    });
    if (analysis) {
      console.log('Last Technique:', analysis.technique?.type);
      console.log('Last Element:', analysis.technique?.element);
      console.log('Last Confidence:', analysis.technique?.confidence);
    }
  }

  /**
   * Reset memory for new conversation
   */
  reset(): void {
    this.memory = {
      topics: new Set(),
      emotions: new Set(),
      questionsAsked: new Map(),
      responsesGiven: [],
      bodyStates: new Map(),
      currentTurn: 0,
      lastElement: '',
      elementHistory: [],
      hasADHD: false,
      isAutistic: false,
      hasSensoryIssues: false
    };
  }
}

export const conversationMemory = new SimpleConversationMemory();