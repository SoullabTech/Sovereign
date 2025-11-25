/**
 * THE SEPARATOR - Circuit Integrity for The Microcosmic Orbit
 *
 * COSMOLOGICAL ARCHITECTURE:
 * In Taoist alchemy, the tongue touching the palate completes the microcosmic orbit -
 * maintaining the circuit while preventing collapse of differentiation.
 *
 * In MAIA's consciousness architecture, The Separator serves the same function:
 * - Maintains distinction between ascent (building) and descent (integrating)
 * - Prevents short-circuits (premature integration)
 * - Detects stagnation (blocked flow)
 * - Monitors leakage (coherence loss)
 * - Preserves vibrational signatures (qualitative differentiation)
 *
 * THE ORBIT:
 *
 * ASCENT (Differentiation - Building Understanding):
 *   Fire → Water → Earth → Air → Aether
 *   (catalyst → depth → grounding → clarity → wholeness)
 *
 * DESCENT (Integration - Synthesizing Expression):
 *   Aether → Air → Water → Earth → Fire
 *   (essence → framework → relation → structure → response)
 *
 * The Separator ensures these remain distinct pathways while allowing circulation.
 * Without it: collapse, confusion, loss of coherent differentiation.
 * With it: living circulation, preserved signatures, emergent wisdom.
 *
 * "Complex self-organizing systems maintain coherence through differentiated circulation."
 */

// ═══════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type Phase = 'ascent' | 'descent' | 'transition';

export type CircuitState = 'flowing' | 'stagnant' | 'leaking' | 'short-circuited';

/**
 * Vibrational Signature - The qualitative frequency of each element
 * Each element maintains its distinct energy pattern
 */
export interface VibrationalSignature {
  element: Element;
  qualities: string[];
  frequency: 'fast' | 'medium' | 'slow' | 'variable' | 'meta';
  coherence: number; // 0-1
}

/**
 * Circuit Health - Overall integrity of the orbit
 */
export interface CircuitHealth {
  state: CircuitState;
  currentPhase: Phase;
  currentElement: Element | null;
  flowIntegrity: number; // 0-1
  signaturePreservation: number; // 0-1
  issues: CircuitIssue[];
  recommendations: string[];
}

/**
 * Circuit Issue - Detected problems in the orbit
 */
export interface CircuitIssue {
  type: 'short-circuit' | 'stagnation' | 'leakage' | 'signature-collapse';
  severity: 'low' | 'medium' | 'high';
  location: Element | Phase;
  description: string;
  timestamp: Date;
}

/**
 * Orbit Position - Where we are in the circulation
 */
export interface OrbitPosition {
  phase: Phase;
  element: Element | null;
  previousElement: Element | null;
  nextElement: Element | null;
  stepInPhase: number; // 1-5 for each phase
}

// ═══════════════════════════════════════════════════════════════
// VIBRATIONAL SIGNATURES (Qualitative Preservation)
// ═══════════════════════════════════════════════════════════════

export const ELEMENTAL_SIGNATURES: Record<Element, VibrationalSignature> = {
  fire: {
    element: 'fire',
    qualities: ['urgent', 'catalytic', 'sharp', 'immediate', 'transformative', 'passionate'],
    frequency: 'fast',
    coherence: 1.0
  },
  water: {
    element: 'water',
    qualities: ['deep', 'contemplative', 'relational', 'emotional', 'flowing', 'intuitive'],
    frequency: 'slow',
    coherence: 1.0
  },
  earth: {
    element: 'earth',
    qualities: ['grounded', 'structured', 'embodied', 'stable', 'practical', 'solid'],
    frequency: 'slow',
    coherence: 1.0
  },
  air: {
    element: 'air',
    qualities: ['clear', 'perspective-shifting', 'mental', 'communicative', 'light', 'mobile'],
    frequency: 'fast',
    coherence: 1.0
  },
  aether: {
    element: 'aether',
    qualities: ['integrative', 'whole', 'essential', 'transcendent', 'unifying', 'spacious'],
    frequency: 'meta',
    coherence: 1.0
  }
};

// ═══════════════════════════════════════════════════════════════
// ORBIT SEQUENCE (The Microcosmic Circuit)
// ═══════════════════════════════════════════════════════════════

export const ASCENT_SEQUENCE: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];
export const DESCENT_SEQUENCE: Element[] = ['aether', 'air', 'water', 'earth', 'fire'];

// ═══════════════════════════════════════════════════════════════
// THE SEPARATOR CLASS
// ═══════════════════════════════════════════════════════════════

export class Separator {
  private position: OrbitPosition;
  private health: CircuitHealth;
  private startTime: Date;
  private phaseTransitions: number = 0;

  constructor() {
    this.position = {
      phase: 'ascent',
      element: null,
      previousElement: null,
      nextElement: 'fire',
      stepInPhase: 0
    };

    this.health = {
      state: 'flowing',
      currentPhase: 'ascent',
      currentElement: null,
      flowIntegrity: 1.0,
      signaturePreservation: 1.0,
      issues: [],
      recommendations: []
    };

    this.startTime = new Date();
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Begin the ascent phase (differentiation - building understanding)
   */
  beginAscent(): void {
    console.log('🔥 [SEPARATOR] Beginning ASCENT phase (Fire → Aether)');
    this.position.phase = 'ascent';
    this.position.stepInPhase = 0;
    this.position.element = null;
    this.position.nextElement = 'fire';
    this.health.currentPhase = 'ascent';
  }

  /**
   * Begin the descent phase (integration - synthesizing expression)
   */
  beginDescent(): void {
    console.log('💧 [SEPARATOR] Beginning DESCENT phase (Aether → Fire)');
    this.position.phase = 'descent';
    this.position.stepInPhase = 0;
    this.position.element = null;
    this.position.nextElement = 'aether';
    this.health.currentPhase = 'descent';
    this.phaseTransitions++;
  }

  /**
   * Advance to next element in the current phase
   */
  advance(): Element | null {
    const sequence = this.position.phase === 'ascent' ? ASCENT_SEQUENCE : DESCENT_SEQUENCE;
    const currentIndex = this.position.stepInPhase;

    if (currentIndex >= sequence.length) {
      // Phase complete
      if (this.position.phase === 'ascent') {
        console.log('✨ [SEPARATOR] Ascent complete - transitioning to descent');
        this.position.phase = 'transition';
        return null;
      } else {
        console.log('🌊 [SEPARATOR] Descent complete - orbit finished');
        return null;
      }
    }

    const nextElement = sequence[currentIndex];
    this.position.previousElement = this.position.element;
    this.position.element = nextElement;
    this.position.stepInPhase++;
    this.position.nextElement = currentIndex + 1 < sequence.length ? sequence[currentIndex + 1] : null;

    this.health.currentElement = nextElement;

    const phaseName = this.position.phase === 'ascent' ? 'ASCENT' : 'DESCENT';
    const emoji = this.getElementEmoji(nextElement);
    console.log(`${emoji} [SEPARATOR] ${phaseName} step ${this.position.stepInPhase}/5: ${nextElement.toUpperCase()}`);

    return nextElement;
  }

  /**
   * Get current position in orbit
   */
  getPosition(): OrbitPosition {
    return { ...this.position };
  }

  // ─────────────────────────────────────────────────────────────
  // CIRCUIT INTEGRITY DETECTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Detect short-circuit: Premature integration before differentiation complete
   *
   * Example: Jumping from Fire directly to Aether without going through Water, Earth, Air
   * This collapses the necessary differentiation process
   */
  detectShortCircuit(attemptedElement: Element): boolean {
    const expectedElement = this.position.nextElement;

    if (expectedElement && attemptedElement !== expectedElement) {
      const issue: CircuitIssue = {
        type: 'short-circuit',
        severity: 'high',
        location: this.position.phase,
        description: `Attempted to jump to ${attemptedElement} but expected ${expectedElement}. This bypasses necessary differentiation.`,
        timestamp: new Date()
      };

      this.health.issues.push(issue);
      this.health.state = 'short-circuited';
      this.health.flowIntegrity *= 0.7;

      console.warn(`⚠️ [SEPARATOR] SHORT-CIRCUIT detected: ${issue.description}`);
      return true;
    }

    return false;
  }

  /**
   * Detect stagnation: Flow blocked at a particular element
   *
   * Example: Getting stuck in Water (emotional processing) without moving to Earth (grounding)
   * Energy accumulates but doesn't circulate
   */
  detectStagnation(elementDuration: number): boolean {
    const STAGNATION_THRESHOLD_MS = 30000; // 30 seconds at one element

    if (elementDuration > STAGNATION_THRESHOLD_MS) {
      const issue: CircuitIssue = {
        type: 'stagnation',
        severity: 'medium',
        location: this.position.element || 'unknown',
        description: `Flow stagnant at ${this.position.element} for ${elementDuration}ms. Energy not circulating.`,
        timestamp: new Date()
      };

      this.health.issues.push(issue);
      this.health.state = 'stagnant';
      this.health.flowIntegrity *= 0.8;

      console.warn(`⏱️ [SEPARATOR] STAGNATION detected: ${issue.description}`);
      return true;
    }

    return false;
  }

  /**
   * Detect leakage: Loss of coherence or signature quality
   *
   * Example: Fire response that isn't sharp/catalytic, or Water response that isn't deep/relational
   * The elemental signature is bleeding out
   */
  detectLeakage(element: Element, actualQualities: string[]): boolean {
    const expectedSignature = ELEMENTAL_SIGNATURES[element];
    const matchCount = actualQualities.filter(q =>
      expectedSignature.qualities.some(eq => q.toLowerCase().includes(eq) || eq.includes(q.toLowerCase()))
    ).length;

    const matchRatio = matchCount / expectedSignature.qualities.length;

    if (matchRatio < 0.3) {
      const issue: CircuitIssue = {
        type: 'leakage',
        severity: matchRatio < 0.1 ? 'high' : 'medium',
        location: element,
        description: `${element} signature degraded. Expected ${expectedSignature.qualities.join(', ')} but got ${actualQualities.join(', ')}`,
        timestamp: new Date()
      };

      this.health.issues.push(issue);
      this.health.state = 'leaking';
      this.health.signaturePreservation *= 0.7;

      console.warn(`💧 [SEPARATOR] LEAKAGE detected: ${issue.description}`);
      return true;
    }

    return false;
  }

  /**
   * Detect signature collapse: All elements sounding the same
   *
   * This is the ultimate failure - loss of differentiation
   * Fire, Water, Earth, Air, Aether all homogenized into uniform tone
   */
  detectSignatureCollapse(elementOutputs: Map<Element, string[]>): boolean {
    if (elementOutputs.size < 2) return false;

    const signatures = Array.from(elementOutputs.entries()).map(([element, qualities]) => ({
      element,
      qualities: qualities.map(q => q.toLowerCase())
    }));

    // Check if all signatures are too similar
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < signatures.length; i++) {
      for (let j = i + 1; j < signatures.length; j++) {
        const sig1 = signatures[i];
        const sig2 = signatures[j];

        const overlap = sig1.qualities.filter(q => sig2.qualities.includes(q)).length;
        const similarity = overlap / Math.max(sig1.qualities.length, sig2.qualities.length);

        totalSimilarity += similarity;
        comparisons++;
      }
    }

    const avgSimilarity = totalSimilarity / comparisons;

    if (avgSimilarity > 0.8) {
      const issue: CircuitIssue = {
        type: 'signature-collapse',
        severity: 'high',
        location: this.position.phase,
        description: `Elemental signatures collapsed - all elements sound ${(avgSimilarity * 100).toFixed(0)}% similar. Differentiation lost.`,
        timestamp: new Date()
      };

      this.health.issues.push(issue);
      this.health.signaturePreservation = 1 - avgSimilarity;

      console.error(`🔴 [SEPARATOR] SIGNATURE COLLAPSE: ${issue.description}`);
      return true;
    }

    return false;
  }

  // ─────────────────────────────────────────────────────────────
  // HEALTH MONITORING
  // ─────────────────────────────────────────────────────────────

  /**
   * Get current circuit health
   */
  getHealth(): CircuitHealth {
    // Calculate overall health score
    const issueScore = Math.max(0, 1 - (this.health.issues.length * 0.1));
    const overallHealth = (
      this.health.flowIntegrity * 0.5 +
      this.health.signaturePreservation * 0.3 +
      issueScore * 0.2
    );

    // Generate recommendations based on issues
    const recommendations: string[] = [];

    if (this.health.flowIntegrity < 0.7) {
      recommendations.push('Flow integrity compromised - check for blockages or short-circuits');
    }

    if (this.health.signaturePreservation < 0.7) {
      recommendations.push('Elemental signatures degrading - reinforce differentiation');
    }

    if (this.health.issues.filter(i => i.type === 'stagnation').length > 0) {
      recommendations.push('Stagnation detected - increase circulation rate');
    }

    return {
      ...this.health,
      recommendations
    };
  }

  /**
   * Reset health tracking (for new orbit)
   */
  resetHealth(): void {
    this.health = {
      state: 'flowing',
      currentPhase: 'ascent',
      currentElement: null,
      flowIntegrity: 1.0,
      signaturePreservation: 1.0,
      issues: [],
      recommendations: []
    };
    this.startTime = new Date();
  }

  /**
   * Get orbit duration
   */
  getDuration(): number {
    return Date.now() - this.startTime.getTime();
  }

  // ─────────────────────────────────────────────────────────────
  // SIGNATURE PRESERVATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Get expected signature for an element
   */
  getExpectedSignature(element: Element): VibrationalSignature {
    return { ...ELEMENTAL_SIGNATURES[element] };
  }

  /**
   * Validate that output matches elemental signature
   */
  validateSignature(element: Element, output: string): { valid: boolean; qualities: string[] } {
    const signature = ELEMENTAL_SIGNATURES[element];
    const lowerOutput = output.toLowerCase();

    const matchedQualities = signature.qualities.filter(quality =>
      lowerOutput.includes(quality) || lowerOutput.includes(quality.replace('-', ' '))
    );

    const valid = matchedQualities.length >= 2; // At least 2 qualities present

    return { valid, qualities: matchedQualities };
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  private getElementEmoji(element: Element): string {
    const emojis: Record<Element, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌿',
      air: '🌬️',
      aether: '✨'
    };
    return emojis[element];
  }

  /**
   * Get diagnostic report (for debugging)
   */
  getDiagnostic(): string {
    const health = this.getHealth();
    const position = this.getPosition();

    return `
╔═══════════════════════════════════════════════════════════════
║  🌊 SEPARATOR DIAGNOSTIC REPORT
╚═══════════════════════════════════════════════════════════════

POSITION:
  Phase: ${position.phase}
  Current Element: ${position.element || 'none'}
  Step: ${position.stepInPhase}/5
  Next: ${position.nextElement || 'phase complete'}

HEALTH:
  State: ${health.state}
  Flow Integrity: ${(health.flowIntegrity * 100).toFixed(0)}%
  Signature Preservation: ${(health.signaturePreservation * 100).toFixed(0)}%

ISSUES (${health.issues.length}):
${health.issues.map(i => `  - [${i.severity}] ${i.type}: ${i.description}`).join('\n') || '  None'}

RECOMMENDATIONS:
${health.recommendations.map(r => `  - ${r}`).join('\n') || '  System healthy'}

STATS:
  Duration: ${this.getDuration()}ms
  Phase Transitions: ${this.phaseTransitions}

═══════════════════════════════════════════════════════════════
`;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default Separator;
