/**
 * Quadrantal Response Generator - Integrates all response strategies
 */

import { ElementalBalancer, ElementsState } from './ElementalBalancer';
import { SomaticMemory } from './SomaticMemory';
import { QuadrantWeaver } from './QuadrantWeaver';
import { neurodivergentValidation } from './NeurodivergentValidation';
import { DBTOrchestrator } from './DBTTechniques';

export interface ResponseDecision {
  response: string;
  element: string;
  reason: string;
  tags: string[];
}

export class QuadrantalResponseGenerator {
  private balancer = new ElementalBalancer();
  private somatic = new SomaticMemory();
  private weaver = new QuadrantWeaver();
  private dbt = new DBTOrchestrator();
  private reasonCounts = new Map<string, number>();

  generate(
    input: string,
    memory: any,
    existingResponse: string,
    currentTurn: number
  ): ResponseDecision {
    // Priority 0: Crisis safety check (HIGHEST - safety first)
    if (input.match(/(disappear|end it|cut|hurt myself|kill myself|suicide)/i)) {
      this.incrementReasonCount('crisis-safety');
      return {
        response: "I hear that part of you wants to disappear. You're not alone in this moment — let's ground together. Would it help to hold something cold, like an ice cube, to ground your body?",
        element: 'earth',
        reason: '[crisis-safety]',
        tags: ['crisis', 'dbt-distress-tolerance', 'safety']
      };
    }

    // Priority 1: BPD-specific DBT pattern matching (abandonment, paradox, identity, relational)
    const bpdPattern = this.dbt.assessBPDPattern(input);
    if (bpdPattern) {
      this.incrementReasonCount('dbt-bpd-pattern');
      return {
        response: bpdPattern.response,
        element: this.getElementForDBTModule(bpdPattern.module),
        reason: `[dbt-${bpdPattern.pattern}]`,
        tags: ['dbt', bpdPattern.module, bpdPattern.pattern, 'bpd-specific']
      };
    }

    // Priority 2: Neurodivergent validation (urgent self-blame needs immediate response)
    const validation = neurodivergentValidation.validate(input);
    if (validation && validation.priority === 'urgent') {
      this.incrementReasonCount('validation-urgent');
      return {
        response: validation.response,
        element: validation.element,
        reason: '[validation-urgent]',
        tags: ['neurodivergent-validation', 'urgent']
      };
    }

    // Record somatic symptoms
    this.somatic.recordSymptom(input, currentTurn);

    // Calculate element state
    const elementState = this.calculateElementState(memory);

    // Priority 3: Elemental balance override (URGENT)
    const override = this.balancer.enforce(elementState);
    if (override && override.priority === 'urgent') {
      this.incrementReasonCount('urgent-balance');
      return {
        response: override.response,
        element: override.element,
        reason: `[${override.element}-urgent]`,
        tags: ['balance-override', 'urgent', override.element]
      };
    }

    // Priority 4: Urgent somatic (intensity >= 0.7)
    const urgentSomatic = this.somatic.getMostUrgent();
    if (urgentSomatic && urgentSomatic.intensity >= 0.7) {
      this.incrementReasonCount('somatic-urgent');
      return {
        response: this.somatic.generateSomaticResponse(urgentSomatic),
        element: 'earth',
        reason: '[somatic-urgent]',
        tags: ['somatic', `${urgentSomatic.part}-${Math.round(urgentSomatic.intensity * 100)}%`]
      };
    }

    // Priority 5: Cross-quadrant weaving
    const woven = this.weaver.weave(memory);
    if (woven) {
      this.incrementReasonCount('weave');
      return {
        response: woven,
        element: 'aether',
        reason: '[weave-fired]',
        tags: ['cross-quadrant', 'integration']
      };
    }

    // Priority 6: High-priority balance
    if (override && override.priority === 'high') {
      this.incrementReasonCount('high-balance');
      return {
        response: override.response,
        element: override.element,
        reason: `[${override.element}-balance]`,
        tags: ['balance-override', override.element]
      };
    }

    // Priority 7: Moderate somatic (intensity 0.4-0.7)
    if (urgentSomatic && urgentSomatic.intensity >= 0.4) {
      this.incrementReasonCount('somatic-moderate');
      return {
        response: this.somatic.generateSomaticResponse(urgentSomatic),
        element: 'earth',
        reason: '[somatic-check]',
        tags: ['somatic', `${urgentSomatic.part}-${Math.round(urgentSomatic.intensity * 100)}%`]
      };
    }

    // Priority 8: General DBT assessment and intervention
    const dbtAssessment = this.assessDBTIntervention(input, memory);
    if (dbtAssessment) {
      this.incrementReasonCount('dbt-intervention');
      return {
        response: this.dbt.formatDBTResponse(dbtAssessment),
        element: dbtAssessment.elementalAlignment[0] || 'aether',
        reason: '[dbt-technique]',
        tags: ['dbt', dbtAssessment.primaryModule, ...dbtAssessment.elementalAlignment]
      };
    }

    // Priority 9: Normal balance
    if (override) {
      this.incrementReasonCount('normal-balance');
      return {
        response: override.response,
        element: override.element,
        reason: `[${override.element}-shift]`,
        tags: ['balance', override.element]
      };
    }

    // Priority 10: High-priority neurodivergent validation
    if (validation && validation.priority === 'high') {
      this.incrementReasonCount('validation-high');
      return {
        response: validation.response,
        element: validation.element,
        reason: '[validation]',
        tags: ['neurodivergent-validation']
      };
    }

    // Fallback: Use existing response
    this.incrementReasonCount('fallback');
    return {
      response: existingResponse,
      element: 'mixed',
      reason: '[existing-rule]',
      tags: ['fallback']
    };
  }

  private calculateElementState(memory: any): ElementsState {
    // Sum somatic intensities for Earth
    let earthScore = 0;
    if (memory.earth instanceof Map) {
      for (const [_, state] of memory.earth) {
        earthScore += state.intensity || 0;
      }
    }

    // Get element history from memory
    const elementHistory = memory.elementHistory || [];

    // Check for paradoxes in emotions (aether)
    let aetherScore = 0;
    if (memory.water instanceof Set) {
      const emotions = Array.from(memory.water);
      // Paradox if conflicting emotions present
      if ((emotions.includes('excitement') && emotions.includes('anxiety')) ||
          (emotions.includes('paradox')) ||
          (emotions.includes('overwhelm') && emotions.includes('numbness'))) {
        aetherScore = 0.6;
      }
    }

    // Check for possibilities in topics (fire)
    let fireScore = 0;
    if (memory.air instanceof Set) {
      const topics = Array.from(memory.air);
      if (topics.some(t => t.includes('possibility') || t.includes('change'))) {
        fireScore = 0.5;
      }
    }

    return {
      earth: Math.min(earthScore, 1),
      water: memory.water?.size || 0,
      air: memory.air?.size || 0,
      fire: fireScore,
      aether: aetherScore,
      lastElements: elementHistory.slice(-4)  // Look at last 4 for better pattern detection
    };
  }

  private incrementReasonCount(reason: string): void {
    const current = this.reasonCounts.get(reason) || 0;
    this.reasonCounts.set(reason, current + 1);
  }

  getReasonSummary(): string {
    const summary: string[] = [];

    for (const [reason, count] of this.reasonCounts) {
      summary.push(`${reason}: ${count}x`);
    }

    return summary.length > 0
      ? `Response Strategy Usage: ${summary.join(', ')}`
      : 'No special strategies used';
  }

  private assessDBTIntervention(input: string, memory: any): any {
    // Extract emotions from water memory
    const emotions: string[] = [];
    if (memory.water instanceof Set) {
      emotions.push(...Array.from(memory.water));
    }

    // Calculate emotional intensity from water memory
    let intensity = 0;
    if (memory.water && memory.water.intensity) {
      intensity = memory.water.intensity;
    }

    // Extract topics from air memory
    const topics: string[] = [];
    if (memory.air instanceof Set) {
      topics.push(...Array.from(memory.air));
    }

    // Check for paradox in current conversation
    const hasParadox = input.includes('paradox') ||
                      input.includes('both') ||
                      emotions.includes('paradox') ||
                      (emotions.includes('excitement') && emotions.includes('anxiety')) ||
                      (input.includes('take on the world') && memory.recentEmotions?.includes('disappear')) ||
                      (input.includes('grandiose') || input.includes('powerful')) ||
                      input.match(/(other times|sometimes.*other|contrast|opposite)/i);

    // Check for crisis patterns in input
    const crisisWords = input.match(/(disappear|overwhelm|can't handle|too much|breaking)/i);
    if (crisisWords || intensity > 0.7) {
      intensity = Math.max(intensity, 0.7);
    }

    // Boost intensity for abandonment/identity fears (typical in BPD)
    if (input.match(/(everyone leaves|terrified.*broken|always push.*away|broken.*am)/i)) {
      intensity = Math.max(intensity, 0.6);
      emotions.push('abandonment', 'shame');
    }

    // Boost intensity for emotional extremes
    if (input.match(/(hate myself|take on the world|so much)/i)) {
      intensity = Math.max(intensity, 0.5);
    }

    // Use DBT orchestrator to assess need
    return this.dbt.assessDBTNeed(emotions, intensity, topics, memory.earth);
  }

  private getElementForDBTModule(module: string): string {
    const elementMap: Record<string, string> = {
      'mindfulness': 'aether',
      'distressTolerance': 'earth',
      'emotionRegulation': 'water',
      'interpersonalEffectiveness': 'air'
    };
    return elementMap[module] || 'aether';
  }

  resetCounts(): void {
    this.reasonCounts.clear();
    this.somatic.clear();
  }
}