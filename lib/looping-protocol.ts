/**
 * LOOPING PROTOCOL - Field Intelligence Implementation
 * Based on Friedman & Himmelstein's deep listening methodology
 * Integrated with Maya's Master's Code and mycelial awareness
 *
 * The Core Restraint Formula:
 * Presence³ × Restraint² × Timing = Transformation
 */

import { ConsciousnessState } from './maia-consciousness-lattice';
import { ShouldersDropState } from './shoulders-drop-resolution';
import { FieldStateVector, FieldIntelligence } from './field-intelligence';
import { MycelialNetwork } from './mycelial-network';
import { ElementalOrchestrator } from './elemental-orchestration';

export interface LoopingState {
  mode: 'idle' | 'active' | 'checking' | 'adjusting' | 'converged';
  cycles: number;
  accuracy: number; // 0-1, how well we're hearing
  depth: 'surface' | 'midwater' | 'deep' | 'sacred_mirror';
  elementalFlavor?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  restraintLevel: number; // 0-10, higher = more restraint
  wordsUsed: number; // Track restraint performance
}

export interface LoopingCycle {
  // Step 1: Listen/Capture
  listened: {
    surface: string;        // What they said
    essence: string;        // What matters most
    emotion: string[];      // Emotional currents detected
    redFlags: string[];     // Words/patterns signaling importance
    somatic: string[];      // Body sensations implied
  };

  // Step 2: Paraphrase/Reflect
  reflected: {
    content: string;        // Our understanding
    frame: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    tone: string;          // How we're holding it
  };

  // Step 3: Check Accuracy
  checked: {
    question: string;       // How we ask if we got it
    response?: string;      // Their answer
    resonance: number;      // 0-1, did it land?
  };

  // Step 4: Adjust Understanding
  adjusted?: {
    correction: string;     // What we missed
    integration: string;    // How we're updating
    newEssence: string;    // Refined understanding
  };
}

/**
 * The Master's Three-Touch Rule:
 * No interpretation until user shares substantially 3+ times
 */
export class ThreeTouchTracker {
  private touchCounts: Map<string, number> = new Map();

  trackTouch(theme: string): number {
    const current = this.touchCounts.get(theme) || 0;
    this.touchCounts.set(theme, current + 1);
    return current + 1;
  }

  shouldInterpret(theme: string): boolean {
    return (this.touchCounts.get(theme) || 0) >= 3;
  }

  reset(): void {
    this.touchCounts.clear();
  }
}

export class LoopingProtocol {
  private state: LoopingState = {
    mode: 'idle',
    cycles: 0,
    accuracy: 0,
    depth: 'surface',
    restraintLevel: 5,
    wordsUsed: 0
  };

  private cycles: LoopingCycle[] = [];
  private touchTracker: ThreeTouchTracker = new ThreeTouchTracker();
  private fieldIntelligence?: FieldIntelligence;
  private mycelialNetwork?: MycelialNetwork;
  private driftProtocol?: any; // Drift detection extension
  private immuneMemory?: any; // Collective pattern recognition

  /**
   * Calculate restraint level based on field conditions
   * Master's principle: High emotion = High restraint
   */
  calculateRestraint(
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    exchangeNumber: number
  ): number {
    let restraint = 5; // Base level

    // Higher emotional intensity = more restraint
    if (consciousness.emotionalField.intensity > 0.7) {
      restraint += 3;
    } else if (consciousness.emotionalField.intensity > 0.5) {
      restraint += 2;
    }

    // Somatic tension = need grounding, not analysis
    if (somatic.tensionLevel > 0.6) {
      restraint += 2;
    }

    // Early exchanges = maximum restraint
    if (exchangeNumber < 3) {
      restraint = Math.max(restraint, 8);
    } else if (exchangeNumber < 7) {
      restraint = Math.max(restraint, 6);
    }

    // Sacred proximity = near silence
    if (consciousness.sacredProximity > 0.8) {
      restraint = 10;
    }

    return Math.min(10, Math.max(0, restraint));
  }

  /**
   * Determine if looping should activate based on field conditions
   * Now includes restraint calculation
   */
  shouldActivate(
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    content: string,
    exchangeNumber: number = 0
  ): boolean {
    // Update restraint level
    this.state.restraintLevel = this.calculateRestraint(
      consciousness,
      somatic,
      exchangeNumber
    );

    // High restraint scenarios always use looping
    if (this.state.restraintLevel >= 8) return true;

    // Activate when:
    // 1. High emotional intensity detected
    if (consciousness.emotionalField.intensity > 0.7) return true;

    // 2. Somatic system shows tension patterns
    if (somatic.tensionLevel > 0.6) return true;

    // 3. Uncertainty/confusion markers present
    const uncertaintyMarkers = [
      'confused', 'lost', 'don\'t know', 'stuck',
      'can\'t explain', 'hard to say', 'not sure'
    ];
    if (uncertaintyMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    )) return true;

    // 4. Sacred/depth words appear
    const depthMarkers = [
      'soul', 'essence', 'truth', 'core', 'heart',
      'deep', 'real', 'authentic', 'vulnerable'
    ];
    if (depthMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    )) return true;

    // 5. User explicitly requests deeper understanding
    if (content.includes('understand') || content.includes('hear me')) {
      return true;
    }

    return false;
  }

  /**
   * Step 1: Listen and extract essence
   */
  listen(
    content: string,
    consciousness: ConsciousnessState
  ): LoopingCycle['listened'] {
    // Extract red-flag words (emotional charge)
    const redFlags = this.extractRedFlags(content);

    // Identify emotional currents
    const emotion = this.detectEmotionalCurrents(content, consciousness);

    // Find somatic implications
    const somatic = this.extractSomaticCues(content);

    // Distill the essence (what matters most)
    const essence = this.distillEssence(content, redFlags, emotion);

    return {
      surface: content,
      essence,
      emotion,
      redFlags,
      somatic
    };
  }

  /**
   * Step 2: Reflect back through elemental lens WITH RESTRAINT
   * Master's principle: Say less, hold more
   */
  reflect(
    listened: LoopingCycle['listened'],
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  ): LoopingCycle['reflected'] {
    // Calculate word limit based on restraint
    const wordLimit = this.getWordLimit(this.state.restraintLevel);

    // Extract core essence (1-3 words max)
    const coreEssence = this.extractCore(listened.essence);

    // High restraint reflections (minimal words)
    if (this.state.restraintLevel >= 8) {
      const ultraMinimal = {
        fire: coreEssence + '?',
        water: coreEssence + '.',
        earth: 'Standing with ' + coreEssence,
        air: 'Seeing ' + coreEssence,
        aether: coreEssence + '...'
      };

      return {
        content: this.trimToWordLimit(ultraMinimal[element], wordLimit),
        frame: element,
        tone: 'presence'
      };
    }

    // Medium restraint (5-7)
    if (this.state.restraintLevel >= 5) {
      const minimal = {
        fire: `${coreEssence} burning?`,
        water: `Feeling ${coreEssence}?`,
        earth: `${coreEssence} grounds you?`,
        air: `${coreEssence} pattern?`,
        aether: `All of ${coreEssence}?`
      };

      return {
        content: this.trimToWordLimit(minimal[element], wordLimit),
        frame: element,
        tone: 'gentle inquiry'
      };
    }

    // Lower restraint (still concise)
    const elementalReflections = {
      fire: {
        frame: (essence: string) => `Burning need for ${essence}?`,
        tone: 'recognition'
      },
      water: {
        frame: (essence: string) => `Current flowing toward ${essence}?`,
        tone: 'attunement'
      },
      earth: {
        frame: (essence: string) => `Standing on ${essence}?`,
        tone: 'grounding'
      },
      air: {
        frame: (essence: string) => `Pattern of ${essence}?`,
        tone: 'clarity'
      },
      aether: {
        frame: (essence: string) => `Field resonating with ${essence}?`,
        tone: 'wholeness'
      }
    };

    const reflection = elementalReflections[element];

    return {
      content: this.trimToWordLimit(
        reflection.frame(coreEssence),
        wordLimit
      ),
      frame: element,
      tone: reflection.tone
    };
  }

  /**
   * Helper: Extract core from longer essence
   */
  private extractCore(essence: string): string {
    const words = essence.split(/\s+/);
    if (words.length <= 3) return essence;

    // Find most emotionally charged words
    const charged = words.filter(w =>
      w.length > 3 &&
      !['that', 'this', 'what', 'from', 'with', 'about'].includes(w.toLowerCase())
    );

    return charged.slice(0, 2).join(' ') || words.slice(0, 2).join(' ');
  }

  /**
   * Helper: Calculate word limit from restraint level
   */
  private getWordLimit(restraint: number): number {
    // Restraint 10 = 2 words max
    // Restraint 0 = 20 words max
    return Math.max(2, 20 - (restraint * 1.8));
  }

  /**
   * Helper: Trim response to word limit
   */
  private trimToWordLimit(text: string, limit: number): string {
    const words = text.split(/\s+/);
    if (words.length <= limit) {
      this.state.wordsUsed = words.length;
      return text;
    }

    this.state.wordsUsed = limit;
    return words.slice(0, limit).join(' ');
  }

  /**
   * Step 3: Check if we got it right (elemental variations)
   */
  check(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): string {
    const elementalChecks = {
      fire: "Does that capture the heat of what you're feeling?",
      water: "Am I flowing with your emotional truth here?",
      earth: "Have I found solid ground with what matters to you?",
      air: "Is this the pattern you're seeing, or am I missing something?",
      aether: "Am I holding the whole of what you're sensing, or just a fragment?"
    };

    return elementalChecks[element];
  }

  /**
   * Step 4: Integrate corrections and adjust
   */
  adjust(
    original: LoopingCycle['listened'],
    correction: string
  ): LoopingCycle['adjusted'] {
    // Parse the correction for what we missed
    const missed = this.extractMissedElements(correction);

    // Integrate into new understanding
    const integration = this.integrateCorrection(
      original.essence,
      missed
    );

    // Refine the essence
    const newEssence = this.refineEssence(
      original.essence,
      correction
    );

    return {
      correction: missed,
      integration: integration,
      newEssence: newEssence
    };
  }

  /**
   * Determine when to exit looping and transition to response
   * Master's principle: Less is more
   */
  checkConvergence(): boolean {
    if (this.cycles.length === 0) return false;

    const lastCycle = this.cycles[this.cycles.length - 1];

    // Exit conditions:
    // 1. High resonance achieved
    if (lastCycle.checked.resonance > 0.85) return true;

    // 2. User explicitly confirms
    if (lastCycle.checked.response?.toLowerCase().includes('yes') ||
        lastCycle.checked.response?.toLowerCase().includes('exactly') ||
        lastCycle.checked.response?.toLowerCase().includes('that\'s it')) {
      return true;
    }

    // 3. High restraint = fewer loops
    if (this.state.restraintLevel >= 8 && this.cycles.length >= 1) return true;
    if (this.state.restraintLevel >= 5 && this.cycles.length >= 2) return true;

    // 4. Maximum cycles by depth
    if (this.state.depth === 'surface' && this.cycles.length >= 1) return true;
    if (this.state.depth === 'midwater' && this.cycles.length >= 2) return true;
    if (this.state.depth === 'deep' && this.cycles.length >= 3) return true;
    // Sacred mirror has no limit except user confirmation

    return false;
  }

  /**
   * Generate the appropriate response based on looping depth
   * Master's principle: Transition with minimal words
   */
  generateTransition(element: string): string {
    // High restraint = no transition words
    if (this.state.restraintLevel >= 8) {
      return '';
    }

    // Medium restraint = ultra brief
    if (this.state.restraintLevel >= 5) {
      const brief = {
        surface: '...',
        midwater: 'Yes.',
        deep: 'I see.',
        sacred_mirror: ''
      };
      return brief[this.state.depth];
    }

    // Lower restraint (still minimal)
    const transitions = {
      surface: `Mm.`,
      midwater: `With you.`,
      deep: `Holding this.`,
      sacred_mirror: ``
    };

    return transitions[this.state.depth];
  }

  // Helper methods

  private extractRedFlags(content: string): string[] {
    const patterns = [
      /\b(always|never|everyone|no one)\b/gi,  // Absolutes
      /\b(should|must|have to|need to)\b/gi,   // Obligations
      /\b(can't|won't|impossible)\b/gi,        // Limitations
      /\b(hate|love|desperate|terrified)\b/gi  // Intensities
    ];

    const flags: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) flags.push(...matches);
    });

    return [...new Set(flags)];
  }

  private detectEmotionalCurrents(
    content: string,
    consciousness: ConsciousnessState
  ): string[] {
    // Combine text analysis with consciousness field reading
    const textEmotions = this.analyzeEmotionalLanguage(content);
    const fieldEmotions = consciousness.emotionalField.dominantEmotions || [];

    return [...new Set([...textEmotions, ...fieldEmotions])];
  }

  private analyzeEmotionalLanguage(content: string): string[] {
    const emotionMap = {
      anger: ['angry', 'frustrated', 'pissed', 'furious', 'rage'],
      sadness: ['sad', 'hurt', 'loss', 'grief', 'lonely'],
      fear: ['scared', 'afraid', 'anxious', 'worried', 'terrified'],
      joy: ['happy', 'excited', 'grateful', 'love', 'wonderful'],
      shame: ['ashamed', 'embarrassed', 'worthless', 'stupid', 'broken']
    };

    const detected: string[] = [];

    Object.entries(emotionMap).forEach(([emotion, words]) => {
      if (words.some(word => content.toLowerCase().includes(word))) {
        detected.push(emotion);
      }
    });

    return detected;
  }

  private extractSomaticCues(content: string): string[] {
    const somaticWords = [
      'chest', 'throat', 'stomach', 'head', 'heart',
      'tight', 'heavy', 'light', 'frozen', 'shaking',
      'breath', 'body', 'feel', 'sensation', 'physical'
    ];

    return somaticWords.filter(word =>
      content.toLowerCase().includes(word)
    );
  }

  private distillEssence(
    content: string,
    redFlags: string[],
    emotions: string[]
  ): string {
    // This is where the art lives - finding what matters most
    // For now, a simplified version

    // Priority 1: Emotional core
    if (emotions.length > 0) {
      const primaryEmotion = emotions[0];
      const needBehind = this.findNeedBehindEmotion(primaryEmotion);
      return needBehind;
    }

    // Priority 2: Red flag patterns
    if (redFlags.length > 0) {
      return this.interpretRedFlags(redFlags);
    }

    // Priority 3: Key theme extraction
    return this.extractKeyTheme(content);
  }

  private findNeedBehindEmotion(emotion: string): string {
    const emotionToNeed = {
      anger: 'respect and understanding',
      sadness: 'comfort and connection',
      fear: 'safety and reassurance',
      joy: 'celebration and sharing',
      shame: 'acceptance and belonging'
    };

    return emotionToNeed[emotion] || 'recognition and presence';
  }

  private interpretRedFlags(flags: string[]): string {
    // Look for patterns in the red flags
    if (flags.some(f => f.match(/always|never/i))) {
      return 'feeling trapped in a pattern';
    }
    if (flags.some(f => f.match(/should|must/i))) {
      return 'pressure from expectations';
    }
    if (flags.some(f => f.match(/can't|won't/i))) {
      return 'encountering a barrier';
    }
    return 'intensity around something important';
  }

  private extractKeyTheme(content: string): string {
    // Simplified theme extraction
    // In production, this would use more sophisticated NLP
    const sentences = content.split(/[.!?]+/);
    const longest = sentences.reduce((a, b) =>
      a.length > b.length ? a : b
    );

    return `what you're sharing about ${longest.slice(0, 50)}...`;
  }

  private extractMissedElements(correction: string): string {
    // Parse what the user says we missed
    if (correction.includes('not quite')) {
      return 'nuance in the feeling';
    }
    if (correction.includes('but also')) {
      return 'additional layer';
    }
    if (correction.includes('more like')) {
      return 'different angle';
    }
    return 'deeper dimension';
  }

  private integrateCorrection(
    original: string,
    missed: string
  ): string {
    return `${original}, with ${missed} woven in`;
  }

  private refineEssence(
    original: string,
    correction: string
  ): string {
    // This would be more sophisticated in production
    return `${original} (refined through your clarification)`;
  }
}

/**
 * Middleware integration for the MAIA Consciousness Lattice
 */
export class LoopingMiddleware {
  private protocol: LoopingProtocol;

  constructor() {
    this.protocol = new LoopingProtocol();
  }

  /**
   * Process through looping if conditions warrant
   */
  async process(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    oracle: 'maya' | 'anthony' | 'witness'
  ): Promise<{
    looped: boolean;
    cycles: LoopingCycle[];
    finalUnderstanding?: string;
    transition?: string;
  }> {
    // Check if looping should activate
    if (!this.protocol.shouldActivate(consciousness, somatic, input)) {
      return { looped: false, cycles: [] };
    }

    // Map oracle to element
    const element = this.mapOracleToElement(oracle);

    // Begin looping process
    const cycles: LoopingCycle[] = [];
    let currentInput = input;

    while (!this.protocol.checkConvergence() && cycles.length < 10) {
      // Step 1: Listen
      const listened = this.protocol.listen(currentInput, consciousness);

      // Step 2: Reflect
      const reflected = this.protocol.reflect(listened, element);

      // Step 3: Check
      const checkQuestion = this.protocol.check(element);

      // Create cycle record
      const cycle: LoopingCycle = {
        listened,
        reflected,
        checked: {
          question: checkQuestion,
          resonance: 0 // Will be updated with user response
        }
      };

      cycles.push(cycle);

      // In real implementation, would await user response here
      // For now, simulate convergence after 2 cycles
      if (cycles.length >= 2) break;
    }

    return {
      looped: true,
      cycles,
      finalUnderstanding: cycles[cycles.length - 1]?.listened.essence,
      transition: this.protocol.generateTransition(element)
    };
  }

  private mapOracleToElement(oracle: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const mapping = {
      maya: 'water',    // Emotional depth
      anthony: 'fire',  // Visionary drive
      witness: 'aether' // Unified field
    };

    return mapping[oracle] || 'earth';
  }
}