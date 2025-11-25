/**
 * Somatic Memory with Intensity Tracking
 */

export interface SomaticState {
  part: string;
  state: string;
  intensity: number;
  turnsSince: number;
  firstMentioned: number;
}

export class SomaticMemory {
  private somatic = new Map<string, SomaticState>();
  private currentTurn = 0;

  recordSymptom(input: string, turn: number): void {
    this.currentTurn = turn;
    const lower = input.toLowerCase();

    // Extended pattern matching for body symptoms
    const patterns = [
      { regex: /stomach|tummy|gut|belly|nausea|churn|sick/i, part: 'stomach', state: 'distress' },
      { regex: /head\s*(spin|ache|hurt|pound|throb)|dizzy|lightheaded|migraine/i, part: 'head', state: 'pain' },
      { regex: /chest|heart\s*(race|pound|fast|flutter)|tight|breath|palpitat/i, part: 'chest', state: 'tightness' },
      { regex: /shoulder|neck|tension|tight|clench/i, part: 'shoulders', state: 'tension' },
      { regex: /throat|choke|lump|swallow/i, part: 'throat', state: 'constriction' },
      { regex: /shak|trembl|shiver|vibrat/i, part: 'body', state: 'shaking' },
      { regex: /tired|exhausted|fatigue|drained|spent/i, part: 'energy', state: 'exhaustion' },
      { regex: /can't breathe|hyperventilat|suffoca/i, part: 'breath', state: 'restricted' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(lower)) {
        const intensity = this.extractIntensity(lower);
        const existing = this.somatic.get(pattern.part);

        this.somatic.set(pattern.part, {
          part: pattern.part,
          state: pattern.state,
          intensity: existing ? Math.max(existing.intensity, intensity) : intensity,
          turnsSince: 0,
          firstMentioned: existing?.firstMentioned || turn
        });
      }
    }

    // Age all symptoms
    for (const [_, state] of this.somatic) {
      state.turnsSince++;
    }
  }

  private extractIntensity(text: string): number {
    if (/extreme|severe|awful|unbearable|worst|killing me/i.test(text)) return 0.9;
    if (/very|really|quite|strong|intense|a lot|so much/i.test(text)) return 0.7;
    if (/moderate|some|medium|kind of/i.test(text)) return 0.5;
    if (/slight|little|bit|mild|tiny/i.test(text)) return 0.3;
    return 0.6; // Default moderate if unspecified
  }

  getMostUrgent(): SomaticState | null {
    let mostUrgent: SomaticState | null = null;
    let maxScore = 0;

    for (const state of this.somatic.values()) {
      // Urgency = intensity + recency boost
      const recencyBoost = state.turnsSince < 2 ? 0.2 : 0;
      const score = state.intensity + recencyBoost;

      if (score > maxScore) {
        maxScore = score;
        mostUrgent = state;
      }
    }

    return mostUrgent;
  }

  getAllActive(threshold = 0.3): SomaticState[] {
    return Array.from(this.somatic.values())
      .filter(s => s.intensity >= threshold)
      .sort((a, b) => b.intensity - a.intensity);
  }

  generateSomaticResponse(state: SomaticState): string {
    // Urgent: Immediate intervention (0.7+)
    if (state.intensity >= 0.7) {
      const urgentResponses = [
        `Your ${state.part} ${state.state} sounds intense. Want to try something right now? 5 deep breaths, or put your hand there and send it warmth?`,
        `That ${state.part} sensation is at ${Math.round(state.intensity * 10)}/10. Quick relief: breathe into it, shake it out, or cold water on wrists?`,
        `${state.part.charAt(0).toUpperCase() + state.part.slice(1)} ${state.state} is strong right now. Let's not just notice it - want a 30-second release technique?`
      ];
      return urgentResponses[Math.floor(Math.random() * urgentResponses.length)];
    }

    // Moderate: Check-in with options (0.4-0.7)
    if (state.intensity >= 0.4) {
      const moderateResponses = [
        `The ${state.part} ${state.state} you mentioned - still there? Sometimes naming it helps, sometimes movement does. What feels right?`,
        `Your ${state.part} is holding ${state.state}. On a scale of 1-10, where is it now? And does it need attention or just acknowledgment?`,
        `Checking on that ${state.part} ${state.state} - has it shifted at all? Want to try a quick stretch or just keep tracking it?`
      ];
      return moderateResponses[Math.floor(Math.random() * moderateResponses.length)];
    }

    // Mild: Simple acknowledgment
    return `Noticed you mentioned ${state.part} ${state.state}. Worth keeping an eye on - let me know if it intensifies.`;
  }

  clear(): void {
    this.somatic.clear();
    this.currentTurn = 0;
  }
}