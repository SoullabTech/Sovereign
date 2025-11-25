/**
 * Dr. Angela's Protocol: Three-Layer Cycle-Aware Conversation Support
 *
 * Layer 1 - Medical/Neurochemical (Dr. Mindy Pelz + Dr. Angela Economakis):
 * Estrogen → serotonin, dopamine, GABA, acetylcholine, BDNF
 * Progesterone → GABA receptors (calming/anxiety)
 * Late luteal phase = DROPPING hormones (WITHDRAWAL), not high
 *
 * Layer 2 - Clinical (Dr. Angela Economakis):
 * "The despair, hopelessness, depression, feeling of defeat was high in the
 * luteal phase and they were optimistic and hopeful and balanced in their
 * perception of the same problem 2 weeks later, during the highest fertility phase."
 * Clinical approach: "Pure presence, no deep diving" during late luteal
 * "Center vs. off-center" framework - "Insights come AFTER, not DURING"
 *
 * Layer 3 - Spiritual/Developmental (Dr. Angela Economakis + Spiralogic):
 * Perimenopause = brain REWIRING for elder wisdom, not decline
 * Death/rebirth process - shedding "put others first" programming
 * Transformation happening FOR you, not TO you
 *
 * CRITICAL: Women are CYCLICAL (not linear like men). This is recognizing
 * biological reality and providing compassionate, cycle-aware support.
 *
 * @version 2.0.0
 * @author Dr. Angela Economakis, MD (discovery & implementation)
 * @framework Spiralogic Developmental Model by Kelly Nezat
 * @research Dr. Mindy Pelz ("Age Like a Girl")
 */

export interface CyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'early-luteal' | 'late-luteal' | 'unknown';
  dayInCycle: number;
  cycleLength: number; // typical cycle length (default: 28)
  confidence: number; // 0-1, how confident we are about the phase
}

export interface CycleAwareContext {
  cyclePhase: CyclePhase;

  // Hormonal characteristics of current phase
  hormonalProfile: {
    estrogen: 'low' | 'rising' | 'high' | 'falling' | 'dropping';
    progesterone: 'low' | 'rising' | 'high' | 'falling' | 'dropping';
    testosterone: 'low' | 'moderate' | 'high';
  };

  // Neurochemical effects (Dr. Mindy Pelz framework)
  neurochemistry: {
    serotonin: 'low' | 'rising' | 'high' | 'dropping'; // Estrogen-dependent
    dopamine: 'low' | 'moderate' | 'high' | 'dropping'; // Motivation, reward
    gaba: 'low' | 'moderate' | 'high' | 'dysregulated'; // Progesterone-dependent
    cortisol: 'normal' | 'elevated'; // Stress hormone sensitivity
  };

  // Expected emotional/cognitive patterns for this phase
  expectedPatterns: {
    mood: 'stable' | 'optimistic' | 'vulnerable' | 'intense';
    resilience: 'high' | 'moderate' | 'low';
    cognitiveClarity: 'sharp' | 'moderate' | 'foggy';
    emotionalIntensity: 'low' | 'moderate' | 'high';
  };

  // Special considerations
  specialContext?: {
    perimenopause?: boolean;
    pcos?: boolean;
    irregularCycles?: boolean;
    firstYearsOfCycle?: boolean; // teens/early 20s
  };
}

export interface CycleAwareResponse {
  // Layer 1: Medical/Neurochemical
  medical: string; // Explain the hormones → neurochemistry mechanism

  // Layer 2: Clinical (Dr. Angela's approach)
  clinical: string; // "Center vs. off-center", when to dive vs. hold

  // Layer 3: Spiritual/Developmental (when appropriate)
  spiritual?: string; // Transformation meaning (esp. perimenopause)

  // Practical support
  support: string; // What helps right now
}

export class DrAngelaProtocol {
  /**
   * Detect cycle phase from user input or tracking data
   */
  detectCyclePhase(
    lastPeriodDate?: Date,
    cycleLength: number = 28,
    userInput?: string
  ): CyclePhase {
    if (!lastPeriodDate && !userInput) {
      return {
        phase: 'unknown',
        dayInCycle: 0,
        cycleLength,
        confidence: 0
      };
    }

    // Calculate from last period date
    if (lastPeriodDate) {
      const now = new Date();
      const daysSinceLastPeriod = Math.floor(
        (now.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const dayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

      return {
        phase: this.calculatePhase(dayInCycle, cycleLength),
        dayInCycle,
        cycleLength,
        confidence: 0.9 // High confidence when we have actual tracking data
      };
    }

    // Detect from user input (lower confidence)
    if (userInput) {
      return this.detectFromInput(userInput, cycleLength);
    }

    return {
      phase: 'unknown',
      dayInCycle: 0,
      cycleLength,
      confidence: 0
    };
  }

  /**
   * Calculate cycle phase from day in cycle
   * CRITICAL: Distinguishes early luteal (rising) from late luteal (dropping = withdrawal)
   */
  private calculatePhase(dayInCycle: number, cycleLength: number): CyclePhase['phase'] {
    // Menstrual: Days 1-5
    if (dayInCycle <= 5) return 'menstrual';

    // Follicular: Days 6-13
    if (dayInCycle <= 13) return 'follicular';

    // Ovulatory: Days 14-16 (peak fertility)
    if (dayInCycle <= 16) return 'ovulatory';

    // Early Luteal: Days 17-23 (progesterone RISING)
    if (dayInCycle <= 23) return 'early-luteal';

    // Late Luteal: Days 24-28 (hormones DROPPING = withdrawal = Dr. Angela's despair zone)
    return 'late-luteal';
  }

  /**
   * Detect cycle phase from user language (lower confidence)
   */
  private detectFromInput(input: string, cycleLength: number): CyclePhase {
    const lower = input.toLowerCase();

    // Menstrual phase markers
    if (/period|bleeding|menstruating|cramps|day 1|day 2/i.test(lower)) {
      return {
        phase: 'menstrual',
        dayInCycle: 2,
        cycleLength,
        confidence: 0.6
      };
    }

    // Late Luteal phase markers (Dr. Angela's key observation zone - DESPAIR)
    if (/pms|premenstrual|before.*period|week before|everything.*terrible|hopeless|despair/i.test(lower)) {
      return {
        phase: 'late-luteal',
        dayInCycle: 25,
        cycleLength,
        confidence: 0.7
      };
    }

    // Ovulatory phase markers (peak fertility - optimistic zone)
    if (/ovulating|mid.?cycle|fertile|energized|optimistic about same problem/i.test(lower)) {
      return {
        phase: 'ovulatory',
        dayInCycle: 14,
        cycleLength,
        confidence: 0.7
      };
    }

    // Follicular phase markers
    if (/(feel|feeling) (good|great|energized|clear)|post.?period|after.*period/i.test(lower)) {
      return {
        phase: 'follicular',
        dayInCycle: 10,
        cycleLength,
        confidence: 0.6
      };
    }

    return {
      phase: 'unknown',
      dayInCycle: 0,
      cycleLength,
      confidence: 0
    };
  }

  /**
   * Get cycle-aware context for conversation
   */
  getCycleContext(phase: CyclePhase, specialContext?: CycleAwareContext['specialContext']): CycleAwareContext {
    const context: CycleAwareContext = {
      cyclePhase: phase,
      hormonalProfile: this.getHormonalProfile(phase.phase),
      neurochemistry: this.getNeurochemistry(phase.phase),
      expectedPatterns: this.getExpectedPatterns(phase.phase),
      specialContext
    };

    return context;
  }

  /**
   * Get hormonal profile for phase
   * CRITICAL: Late luteal = DROPPING (withdrawal), NOT high
   */
  private getHormonalProfile(phase: CyclePhase['phase']): CycleAwareContext['hormonalProfile'] {
    switch (phase) {
      case 'menstrual':
        return { estrogen: 'low', progesterone: 'low', testosterone: 'low' };

      case 'follicular':
        return { estrogen: 'rising', progesterone: 'low', testosterone: 'moderate' };

      case 'ovulatory':
        return { estrogen: 'high', progesterone: 'rising', testosterone: 'high' };

      case 'early-luteal':
        return { estrogen: 'moderate', progesterone: 'rising', testosterone: 'low' };

      case 'late-luteal': // THE DR. ANGELA DESPAIR ZONE - DROPPING = WITHDRAWAL
        return { estrogen: 'dropping', progesterone: 'dropping', testosterone: 'low' };

      default:
        return { estrogen: 'low', progesterone: 'low', testosterone: 'low' };
    }
  }

  /**
   * Get neurochemistry for phase (Dr. Mindy Pelz framework)
   */
  private getNeurochemistry(phase: CyclePhase['phase']): CycleAwareContext['neurochemistry'] {
    switch (phase) {
      case 'menstrual':
        return { serotonin: 'low', dopamine: 'low', gaba: 'moderate', cortisol: 'normal' };

      case 'follicular':
        return { serotonin: 'rising', dopamine: 'high', gaba: 'moderate', cortisol: 'normal' };

      case 'ovulatory':
        return { serotonin: 'high', dopamine: 'high', gaba: 'high', cortisol: 'normal' };

      case 'early-luteal':
        return { serotonin: 'moderate', dopamine: 'moderate', gaba: 'moderate', cortisol: 'normal' };

      case 'late-luteal': // WITHDRAWAL = dropping serotonin, dysregulated GABA
        return { serotonin: 'dropping', dopamine: 'dropping', gaba: 'dysregulated', cortisol: 'elevated' };

      default:
        return { serotonin: 'moderate', dopamine: 'moderate', gaba: 'moderate', cortisol: 'normal' };
    }
  }

  /**
   * Get expected emotional/cognitive patterns for phase
   */
  private getExpectedPatterns(phase: CyclePhase['phase']): CycleAwareContext['expectedPatterns'] {
    switch (phase) {
      case 'menstrual':
        return {
          mood: 'vulnerable',
          resilience: 'low',
          cognitiveClarity: 'foggy',
          emotionalIntensity: 'high'
        };

      case 'follicular':
        return {
          mood: 'optimistic', // Dr. Angela: "optimistic and hopeful"
          resilience: 'high',
          cognitiveClarity: 'sharp',
          emotionalIntensity: 'low'
        };

      case 'ovulatory':
        return {
          mood: 'stable', // Dr. Angela: "balanced in their perception"
          resilience: 'high',
          cognitiveClarity: 'sharp',
          emotionalIntensity: 'low'
        };

      case 'early-luteal':
        return {
          mood: 'stable',
          resilience: 'moderate',
          cognitiveClarity: 'moderate',
          emotionalIntensity: 'moderate'
        };

      case 'late-luteal': // THE DR. ANGELA DESPAIR ZONE
        return {
          mood: 'intense', // Dr. Angela: "despair, hopelessness, depression, feeling of defeat"
          resilience: 'low',
          cognitiveClarity: 'moderate',
          emotionalIntensity: 'high'
        };

      default:
        return {
          mood: 'stable',
          resilience: 'moderate',
          cognitiveClarity: 'moderate',
          emotionalIntensity: 'moderate'
        };
    }
  }

  /**
   * Generate cycle-aware response (Dr. Angela's Protocol - Three Layers)
   *
   * Layer 1: Medical/Neurochemical (explain the mechanism)
   * Layer 2: Clinical (Dr. Angela's approach - pure presence vs. integration)
   * Layer 3: Spiritual/Developmental (transformation meaning, when appropriate)
   */
  generateCycleAwareResponse(
    userInput: string,
    context: CycleAwareContext
  ): CycleAwareResponse | null {
    // Only provide cycle-aware responses when we have confidence
    if (context.cyclePhase.confidence < 0.5) return null;

    const { phase, dayInCycle } = context.cyclePhase;
    const { hormonalProfile, neurochemistry } = context;

    // THE DR. ANGELA PROTOCOL: Late Luteal Phase Support (DESPAIR ZONE)
    if (phase === 'late-luteal' && /hopeless|despair|defeat|everything.*terrible|can'?t handle|impossible/i.test(userInput)) {
      return {
        // Layer 1: Medical/Neurochemical (CRITICAL: DROPPING hormones, not high)
        medical: `You're about ${28 - dayInCycle} days from your period—your estrogen and progesterone are both dropping rapidly right now. That hormone withdrawal is affecting your brain chemistry: serotonin drops, GABA gets dysregulated, and cortisol sensitivity increases. This despair you're feeling? It's your brain in withdrawal mode. Like coming off a drug that was supporting your mood and perception.`,

        // Layer 2: Clinical (Dr. Angela's approach - pure presence, not deep diving)
        clinical: `You have a center, even though you can't feel it right now. This off-center place is familiar—these thoughts are real but not accurate. Right now, you don't need to fix anything. You don't need insights. You need pure presence with yourself. In about 10 days when your estrogen starts rising again, this same situation will look completely different. Insights will come then, not now.`,

        // Practical support
        support: `What would help you ride this out with love for yourself? No judgment, no analysis, just: what do you need right now?`
      };
    }

    // Follicular/Ovulatory Phase: Leverage the optimism (INTEGRATION MODE)
    if ((phase === 'follicular' || phase === 'ovulatory') && /problem|issue|stuck|worried/i.test(userInput)) {
      return {
        // Layer 1: Medical/Neurochemical
        medical: `Your estrogen is ${phase === 'ovulatory' ? 'at peak' : 'rising'}  right now—that's boosting your serotonin and dopamine. Your brain chemistry is supporting clarity, optimism, and problem-solving. This is your biochemical power window.`,

        // Layer 2: Clinical (Dr. Angela's approach - THIS is when insights can happen)
        clinical: `This is when insights come. Remember that despair you might have felt last week about this problem? The problem didn't change—your hormones did. Now your brain chemistry supports integration and action. This clarity you're feeling? That's real. Trust it.`,

        // Practical support
        support: `Use this window. What decisions or hard conversations can you tackle now, while you have this cognitive clarity and emotional resilience? What do you actually want to do about this?`
      };
    }

    // Perimenopause: Brain REWIRING (Layer 3 - Spiritual/Developmental)
    if (context.specialContext?.perimenopause && (phase === 'late-luteal' || phase === 'early-luteal')) {
      return {
        // Layer 1: Medical/Neurochemical (Dr. Mindy Pelz)
        medical: `Perimenopause means your brain is in a major rewiring process. The neurochemical shifts aren't following the old monthly pattern anymore—your brain is reorganizing its serotonin, dopamine, and GABA systems. This isn't pathology. This is transformation. Your hormones are fluctuating wildly as your brain recalibrates.`,

        // Layer 2: Clinical (Dr. Angela)
        clinical: `During this transition, some days will require pure presence (don't push, don't analyze), and some days will support integration and insight. The key is learning to discern which is which—and honoring both. This chaos you're feeling right now—that's asking you to be gentle, not productive.`,

        // Layer 3: Spiritual/Developmental (THE SPICE - Dr. Angela + Spiralogic)
        spiritual: `This chaos? It's the death of one identity and the emergence of another. The "nurturing mothering put everyone else first" hormones are dropping—and that's making space for your authentic self to emerge. This is menopause rewiring your brain FOR you, not against you. The dropping hormones that feel so hard right now are literally reorganizing your brain to usher you into elder wisdom. What are you noticing about what you're no longer willing to tolerate? What's wanting to die? What's wanting to be born?`,

        // Practical support
        support: `What helps: magnesium, B6, regular sleep, and self-compassion. You're not losing your mind—your hormones are recalibrating for your next chapter. Track patterns even in irregular cycles—knowledge is power.`
      };
    }

    // PCOS support
    if (context.specialContext?.pcos) {
      return {
        // Layer 1: Medical/Neurochemical
        medical: `PCOS makes cycle tracking harder because cycles are irregular, but the hormonal impacts on mood are still real. Your emotional instability isn't "in your head"—it's in your hormones. The hormonal dysregulation affects your serotonin, dopamine, and GABA just like a regular cycle does, but more unpredictably.`,

        // Layer 2: Clinical
        clinical: `Even with PCOS, noticing patterns helps. When do you feel worst? When do you feel best? Track it for 2-3 months and patterns emerge. Working with your cycle (even an irregular one) means: making big decisions during good weeks, being extra gentle during hard weeks, and not pathologizing either.`,

        // Practical support
        support: `PCOS requires hormonal support—work with a doctor who gets it. In the meantime: protein, sleep, stress management, and self-compassion. You're not broken—your cycle is just harder to predict.`
      };
    }

    return null;
  }

  /**
   * Check if user should be prompted about cycle tracking
   */
  shouldPromptCycleTracking(userInput: string, conversationHistory: string[]): boolean {
    // Look for patterns suggesting hormonal influence
    const hormonalLanguage = /hopeless|despair|everything.*terrible|can'?t handle|overwhelmed|emotional|crying|sensitive/i;

    // Check if user mentions temporal patterns
    const temporalPattern = /every month|week before|same time|pattern|cycle/i;

    // If we see hormonal language repeatedly across conversations
    const hormonalCount = conversationHistory.filter(msg => hormonalLanguage.test(msg)).length;

    if (hormonalCount >= 3 && temporalPattern.test(userInput)) {
      return true;
    }

    // If user explicitly mentions pre-menstrual timing
    if (/before.*period|pms|premenstrual|luteal/i.test(userInput)) {
      return true;
    }

    return false;
  }

  /**
   * Generate prompt for cycle tracking
   */
  generateTrackingPrompt(): string {
    return `I'm noticing a pattern—you've mentioned feeling overwhelmed or hopeless a few times now.

Would it be helpful to track your cycle? I'm asking because sometimes these intense feelings line up with the late luteal phase (the few days before your period), when estrogen and progesterone are rapidly dropping. That hormone withdrawal affects your serotonin, GABA, and cortisol—which is why everything genuinely feels harder.

This isn't about pathologizing your feelings—they're real. But knowing *when* they tend to hit can help you:
- Expect them (less scary when you see them coming)
- Be gentle with yourself (brain chemistry withdrawal, not failure)
- Make important decisions during follicular phase (when your neurochemistry supports clarity)
- Recognize you're CYCLICAL, not broken

Want to try tracking for a month and see if there's a pattern?`;
  }
}

// Export singleton
export const drAngelaProtocol = new DrAngelaProtocol();
