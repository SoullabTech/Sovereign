/**
 * Gender-Aware Context Detector
 * Research-backed, non-stereotyping gender considerations
 *
 * DESIGN PRINCIPLES:
 * 1. Individual behavior > gender assumptions
 * 2. Patterns are weak priors, not deterministic rules
 * 3. Confidence scores enable graceful degradation
 * 4. Non-binary and fluid identities fully supported
 * 5. All adaptations cite research (see GENDER_AWARE_ENHANCEMENT_PLAN.md)
 *
 * @version 1.0.0
 * @status Experimental
 */

export interface GenderContextSignals {
  // User's stated gender identity (from profile)
  userGender?: 'feminine' | 'masculine' | 'non-binary' | 'fluid' | 'unknown';

  // Observed communication patterns (from actual behavior)
  communicationStyle: 'relational' | 'analytical' | 'mixed' | 'unknown';
  emotionalDisclosure: 'immediate' | 'gradual' | 'guarded' | 'unknown';
  questioningPreference: 'direct' | 'exploratory' | 'mixed' | 'unknown';
  integrationStyle: 'verbal' | 'embodied' | 'systemic' | 'unknown';
  stressResponse: 'tend-befriend' | 'fight-flight' | 'freeze' | 'mixed' | 'unknown';

  // Confidence in our detection (0-1)
  confidence: number;

  // Observed behaviors that informed our detection
  evidencePoints: string[];

  // Whether observed behavior contradicts profile assumption
  profileOverridden: boolean;
}

export interface GenderAdaptation {
  type: 'communication-style-match' | 'disclosure-pacing' | 'questioning-approach' |
        'integration-support' | 'stress-validation';
  description: string;
  confidenceThreshold: number; // Only apply if confidence >= this
  research: string; // Citation for why this adaptation exists
}

export class GenderAwareContext {
  // Feature flag - can be disabled globally
  private enabled: boolean = false;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  /**
   * Detect gender-related patterns from user profile + observed behavior
   * CRITICAL: Observed behavior ALWAYS overrides profile assumptions
   *
   * @param userProfile - User's stated gender identity (optional)
   * @param conversationHistory - Recent conversation turns
   * @param currentInput - Current user input
   * @returns GenderContextSignals with confidence scores
   */
  detectPatterns(
    userProfile: { gender?: string } = {},
    conversationHistory: string[] = [],
    currentInput: string = ''
  ): GenderContextSignals | null {
    // If disabled, return null (system works without this)
    if (!this.enabled) {
      return null;
    }

    try {
      const signals: GenderContextSignals = {
        userGender: this.normalizeGenderIdentity(userProfile.gender),
        communicationStyle: 'unknown',
        emotionalDisclosure: 'unknown',
        questioningPreference: 'unknown',
        integrationStyle: 'unknown',
        stressResponse: 'unknown',
        confidence: 0,
        evidencePoints: [],
        profileOverridden: false
      };

      // Analyze actual behavior (more weight than profile)
      const behaviorSignals = this.analyzeBehavior(conversationHistory, currentInput);
      Object.assign(signals, behaviorSignals);

      // If we have high confidence from behavior, check if it contradicts profile
      if (signals.confidence > 0.6) {
        const profilePrediction = this.predictFromProfile(signals.userGender);
        if (this.detectContradiction(signals, profilePrediction)) {
          signals.profileOverridden = true;
          console.log('[GenderAwareContext] Observed behavior contradicts profile assumption - using observed behavior');
        }
      }

      return signals;

    } catch (err) {
      // Fail gracefully - this is an enhancement, not critical functionality
      console.warn('[GenderAwareContext] Detection failed:', err);
      return null;
    }
  }

  /**
   * Analyze actual conversation behavior
   * This is where the real detection happens - not from profile assumptions
   */
  private analyzeBehavior(
    history: string[],
    current: string
  ): Partial<GenderContextSignals> {
    const allText = [...history, current].join(' ').toLowerCase();
    const evidence: string[] = [];
    let confidenceSum = 0;
    let confidenceCount = 0;

    // Communication Style Detection (Research: Tannen 1990, Baron-Cohen 2005)
    const relationalMarkers = [
      'feel', 'relationship', 'connection', 'together', 'we', 'us',
      'shared', 'understand', 'empathy', 'care about', 'think about how'
    ];
    const analyticalMarkers = [
      'analyze', 'logic', 'reason', 'because', 'therefore', 'data',
      'solve', 'fix', 'optimize', 'efficient', 'rational'
    ];

    const relationalCount = this.countMarkers(allText, relationalMarkers);
    const analyticalCount = this.countMarkers(allText, analyticalMarkers);

    let communicationStyle: GenderContextSignals['communicationStyle'] = 'unknown';
    if (relationalCount > analyticalCount * 1.5) {
      communicationStyle = 'relational';
      evidence.push(`relational-markers:${relationalCount}`);
      confidenceSum += 0.7;
      confidenceCount++;
    } else if (analyticalCount > relationalCount * 1.5) {
      communicationStyle = 'analytical';
      evidence.push(`analytical-markers:${analyticalCount}`);
      confidenceSum += 0.7;
      confidenceCount++;
    } else if (relationalCount > 0 || analyticalCount > 0) {
      communicationStyle = 'mixed';
      evidence.push(`mixed-markers:${relationalCount}/${analyticalCount}`);
      confidenceSum += 0.5;
      confidenceCount++;
    }

    // Emotional Disclosure Detection (Research: Gilligan 1982, Stanton 2011)
    const immediateDisclosure = /^(i feel|i'm so|i'm really|honestly|i need to tell you)/i.test(current);
    const gradualDisclosure = history.length > 3 && /feel|emotion|scared|anxious|sad|happy/i.test(current);
    const guardedDisclosure = history.length > 5 && !/feel|emotion/i.test(allText);

    let emotionalDisclosure: GenderContextSignals['emotionalDisclosure'] = 'unknown';
    if (immediateDisclosure) {
      emotionalDisclosure = 'immediate';
      evidence.push('immediate-emotional-disclosure');
      confidenceSum += 0.8;
      confidenceCount++;
    } else if (gradualDisclosure) {
      emotionalDisclosure = 'gradual';
      evidence.push('gradual-emotional-disclosure');
      confidenceSum += 0.6;
      confidenceCount++;
    } else if (guardedDisclosure) {
      emotionalDisclosure = 'guarded';
      evidence.push('guarded-emotional-disclosure');
      confidenceSum += 0.5;
      confidenceCount++;
    }

    // Integration Style Detection (Research: Belenky et al. 1986)
    const verbalIntegration = /^(i think|i understand|it makes sense|i see now)/i.test(current);
    const embodiedIntegration = /body|feel in my|chest|stomach|shoulders|tension|breath/i.test(current);
    const systemicIntegration = /pattern|system|connected|everything|whole|relates to/i.test(current);

    let integrationStyle: GenderContextSignals['integrationStyle'] = 'unknown';
    if (embodiedIntegration) {
      integrationStyle = 'embodied';
      evidence.push('embodied-integration-language');
      confidenceSum += 0.75;
      confidenceCount++;
    } else if (systemicIntegration) {
      integrationStyle = 'systemic';
      evidence.push('systemic-thinking-language');
      confidenceSum += 0.7;
      confidenceCount++;
    } else if (verbalIntegration) {
      integrationStyle = 'verbal';
      evidence.push('verbal-processing-language');
      confidenceSum += 0.65;
      confidenceCount++;
    }

    // Stress Response Detection (Research: Taylor et al. 2000 - "Tend and Befriend")
    const tendBefriend = /reach out|talk to|need support|call someone|be with people/i.test(current);
    const fightFlight = /get away|leave|escape|attack|defend|fight back/i.test(current);
    const freeze = /stuck|paralyzed|can't move|frozen|shut down|numb/i.test(current);

    let stressResponse: GenderContextSignals['stressResponse'] = 'unknown';
    if (tendBefriend) {
      stressResponse = 'tend-befriend';
      evidence.push('tend-befriend-stress-pattern');
      confidenceSum += 0.6;
      confidenceCount++;
    } else if (fightFlight) {
      stressResponse = 'fight-flight';
      evidence.push('fight-flight-stress-pattern');
      confidenceSum += 0.6;
      confidenceCount++;
    } else if (freeze) {
      stressResponse = 'freeze';
      evidence.push('freeze-stress-pattern');
      confidenceSum += 0.6;
      confidenceCount++;
    }

    const confidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;

    return {
      communicationStyle,
      emotionalDisclosure,
      integrationStyle,
      stressResponse,
      confidence,
      evidencePoints: evidence
    };
  }

  /**
   * Generate contextual adaptations based on detected patterns
   * Returns suggestions, not commands - gentle nudges only
   */
  suggestAdaptations(
    signals: GenderContextSignals,
    currentTechnique: string
  ): GenderAdaptation[] {
    if (!signals || signals.confidence < 0.4) {
      // Confidence too low - no adaptations
      return [];
    }

    const adaptations: GenderAdaptation[] = [];

    // Communication Style Adaptation
    if (signals.communicationStyle === 'relational' && signals.confidence > 0.6) {
      adaptations.push({
        type: 'communication-style-match',
        description: 'Add contextual connections to previous conversation',
        confidenceThreshold: 0.6,
        research: 'Tannen (1990) - Rapport-talk communication preferences'
      });
    }

    // Disclosure Pacing Adaptation
    if (signals.emotionalDisclosure === 'gradual' && signals.confidence > 0.5) {
      adaptations.push({
        type: 'disclosure-pacing',
        description: 'Use indirect questions early, build trust gradually',
        confidenceThreshold: 0.5,
        research: 'Gilligan (1982) - Relational development patterns'
      });
    }

    // Integration Support Adaptation
    if (signals.integrationStyle === 'embodied' && signals.confidence > 0.7) {
      adaptations.push({
        type: 'integration-support',
        description: 'Offer somatic awareness prompts',
        confidenceThreshold: 0.7,
        research: 'Belenky et al. (1986) - Embodied ways of knowing'
      });
    }

    // Stress Validation Adaptation
    if (signals.stressResponse === 'tend-befriend' && signals.confidence > 0.6) {
      adaptations.push({
        type: 'stress-validation',
        description: 'Validate connection-seeking as healthy stress response',
        confidenceThreshold: 0.6,
        research: 'Taylor et al. (2000) - Tend-and-befriend theory'
      });
    }

    return adaptations;
  }

  /**
   * Predict patterns based on profile gender (weak prior only)
   */
  private predictFromProfile(gender?: string): Partial<GenderContextSignals> {
    // These are WEAK priors from research - individual variance is huge
    // Only used to check if observed behavior contradicts assumptions

    if (gender === 'feminine') {
      return {
        communicationStyle: 'relational',
        emotionalDisclosure: 'gradual',
        integrationStyle: 'embodied',
        stressResponse: 'tend-befriend'
      };
    } else if (gender === 'masculine') {
      return {
        communicationStyle: 'analytical',
        emotionalDisclosure: 'guarded',
        integrationStyle: 'verbal',
        stressResponse: 'fight-flight'
      };
    } else {
      // Non-binary, fluid, or unknown - no assumptions
      return {};
    }
  }

  /**
   * Detect if observed behavior contradicts profile prediction
   */
  private detectContradiction(
    observed: GenderContextSignals,
    predicted: Partial<GenderContextSignals>
  ): boolean {
    if (!predicted.communicationStyle) return false;

    let contradictions = 0;

    if (observed.communicationStyle !== 'unknown' &&
        observed.communicationStyle !== predicted.communicationStyle &&
        observed.communicationStyle !== 'mixed') {
      contradictions++;
    }

    if (observed.emotionalDisclosure !== 'unknown' &&
        observed.emotionalDisclosure !== predicted.emotionalDisclosure) {
      contradictions++;
    }

    // If 2+ contradictions, observed behavior clearly differs from profile
    return contradictions >= 2;
  }

  /**
   * Normalize gender identity strings
   */
  private normalizeGenderIdentity(gender?: string): GenderContextSignals['userGender'] {
    if (!gender) return 'unknown';

    const lower = gender.toLowerCase();
    if (lower.includes('fem') || lower.includes('woman') || lower.includes('girl')) {
      return 'feminine';
    } else if (lower.includes('masc') || lower.includes('man') || lower.includes('boy')) {
      return 'masculine';
    } else if (lower.includes('non-binary') || lower.includes('nonbinary') || lower.includes('enby')) {
      return 'non-binary';
    } else if (lower.includes('fluid') || lower.includes('queer')) {
      return 'fluid';
    } else {
      return 'unknown';
    }
  }

  /**
   * Count markers in text
   */
  private countMarkers(text: string, markers: string[]): number {
    return markers.reduce((count, marker) => {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }
}

// Export singleton instance (disabled by default)
export const genderAwareContext = new GenderAwareContext(false);
