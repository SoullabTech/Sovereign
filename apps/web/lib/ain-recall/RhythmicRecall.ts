/**
 * Rhythmic Recall - Elemental-Based Spaced Resonance
 *
 * Unlike algorithmic spaced repetition (SM-2, FSRS), this follows natural cycles:
 * - Water memories return with the moon
 * - Fire resurfaces around creative initiatives
 * - Earth appears when stability is tested
 * - Learning becomes ENTRAINMENT not drill
 */

import { ElementalCard, Element, Phase } from './ElementalCard';

export type RecallCadence = 'lunar' | 'solar' | 'seasonal' | 'project-based' | 'breath-based';

export interface RhythmicSchedule {
  cardId: string;
  nextRecall: Date;
  cadence: RecallCadence;
  interval: number; // Days (flexible based on rhythm)
  ease: number; // 0-1, how easily this integrates
  element: Element;
  lastReview?: {
    date: Date;
    integration: 'deepened' | 'stable' | 'surfaced' | 'released';
    notes?: string;
  };
}

export interface RecallMoment {
  card: ElementalCard;
  timing: 'due' | 'approaching' | 'opportune' | 'resonant';
  context: string; // Why this is surfacing now
  prompt: string; // Reflection prompt
  reviewType: 'integration' | 'evolution' | 'release' | 'amplification';
}

export interface ElementalCycle {
  element: Element;
  phase: 'waxing' | 'peak' | 'waning' | 'trough';
  nextPeak: Date;
  recommendations: string[];
}

/**
 * Rhythmic Recall Scheduler
 */
export class RhythmicRecallScheduler {
  private schedules: Map<string, RhythmicSchedule> = new Map();

  // Element-specific rhythms
  private readonly ELEMENTAL_RHYTHMS = {
    water: {
      primaryCycle: 'lunar', // 29.5 days
      intervals: [7, 14, 29, 59, 88], // Days
      bestPhases: ['full', 'new'] // Moon phases
    },
    fire: {
      primaryCycle: 'project-based', // Triggered by creative action
      intervals: [3, 7, 21, 42, 84],
      bestPhases: ['waxing'] // Growth phase
    },
    earth: {
      primaryCycle: 'seasonal', // 90 days
      intervals: [14, 30, 90, 180, 365],
      bestPhases: ['waning'] // Grounding phase
    },
    air: {
      primaryCycle: 'breath-based', // Quick cycles
      intervals: [1, 3, 7, 14, 28],
      bestPhases: ['waxing', 'full'] // Clarity phases
    },
    aether: {
      primaryCycle: 'solar', // Annual cycles
      intervals: [30, 90, 180, 365, 730],
      bestPhases: ['new', 'full'] // Integration points
    }
  };

  /**
   * Schedule a card for rhythmic recall
   */
  async scheduleCard(card: ElementalCard): Promise<void> {
    const element = card.elemental.primary;
    const rhythm = this.ELEMENTAL_RHYTHMS[element];

    // Determine cadence
    const cadence = this.determineCadence(card);

    // Calculate first recall interval
    const interval = rhythm.intervals[0];

    const schedule: RhythmicSchedule = {
      cardId: card.id,
      nextRecall: this.calculateNextRecall(new Date(), interval, element, cadence),
      cadence,
      interval,
      ease: 0.5, // Start neutral
      element
    };

    this.schedules.set(card.id, schedule);
  }

  /**
   * Determine appropriate cadence for a card
   */
  private determineCadence(card: ElementalCard): RecallCadence {
    const element = card.elemental.primary;

    // Element determines primary cadence
    if (element === 'water') return 'lunar';
    if (element === 'fire') return 'project-based';
    if (element === 'earth') return 'seasonal';
    if (element === 'air') return 'breath-based';
    if (element === 'aether') return 'solar';

    return 'lunar'; // Default
  }

  /**
   * Calculate next recall date based on rhythm
   */
  private calculateNextRecall(
    from: Date,
    interval: number,
    element: Element,
    cadence: RecallCadence
  ): Date {
    const next = new Date(from);

    switch (cadence) {
      case 'lunar':
        // Align to moon phase
        const moonCycle = 29.5;
        const cyclesNeeded = Math.ceil(interval / moonCycle);
        next.setDate(next.getDate() + (cyclesNeeded * moonCycle));
        break;

      case 'seasonal':
        // Align to season transitions (90 days)
        const seasonLength = 90;
        const seasonsNeeded = Math.ceil(interval / seasonLength);
        next.setDate(next.getDate() + (seasonsNeeded * seasonLength));
        break;

      case 'solar':
        // Align to solar year
        next.setDate(next.getDate() + interval);
        break;

      case 'breath-based':
        // Quick, responsive cycles
        next.setDate(next.getDate() + interval);
        break;

      case 'project-based':
        // Event-driven (calculate based on user activity)
        next.setDate(next.getDate() + interval);
        break;
    }

    return next;
  }

  /**
   * Get cards due for recall
   */
  async getDueRecalls(asOf: Date = new Date()): Promise<RecallMoment[]> {
    const moments: RecallMoment[] = [];

    for (const [cardId, schedule] of this.schedules.entries()) {
      if (schedule.nextRecall <= asOf) {
        // This card is due for recall
        // Need to fetch the actual card to create RecallMoment
        // TODO: Implement card fetching
      }
    }

    return moments;
  }

  /**
   * Get upcoming recalls (within next 7 days)
   */
  async getUpcomingRecalls(withinDays: number = 7): Promise<RecallMoment[]> {
    const now = new Date();
    const future = new Date(now.getTime() + (withinDays * 24 * 60 * 60 * 1000));

    const moments: RecallMoment[] = [];

    for (const [cardId, schedule] of this.schedules.entries()) {
      if (schedule.nextRecall > now && schedule.nextRecall <= future) {
        // This card is approaching
        // TODO: Implement card fetching and RecallMoment creation
      }
    }

    return moments;
  }

  /**
   * Record a review and update schedule
   */
  async recordReview(
    cardId: string,
    integration: RhythmicSchedule['lastReview']['integration'],
    notes?: string
  ): Promise<void> {
    const schedule = this.schedules.get(cardId);
    if (!schedule) return;

    const now = new Date();

    // Update last review
    schedule.lastReview = {
      date: now,
      integration,
      notes
    };

    // Update ease based on integration
    schedule.ease = this.adjustEase(schedule.ease, integration);

    // Calculate next interval
    const nextInterval = this.calculateNextInterval(schedule);
    schedule.interval = nextInterval;

    // Calculate next recall date
    schedule.nextRecall = this.calculateNextRecall(
      now,
      nextInterval,
      schedule.element,
      schedule.cadence
    );
  }

  /**
   * Adjust ease factor based on integration quality
   */
  private adjustEase(
    currentEase: number,
    integration: RhythmicSchedule['lastReview']['integration']
  ): number {
    // Ease affects how quickly intervals grow
    const adjustments = {
      deepened: 0.1,   // Integrated well, can increase interval faster
      stable: 0.05,    // Stable, slight increase
      surfaced: 0,     // Just becoming conscious, maintain
      released: -0.1   // Needs more attention, decrease interval growth
    };

    const newEase = currentEase + adjustments[integration];
    return Math.max(0.1, Math.min(1.0, newEase)); // Clamp between 0.1 and 1.0
  }

  /**
   * Calculate next interval based on current schedule and ease
   */
  private calculateNextInterval(schedule: RhythmicSchedule): number {
    const element = schedule.element;
    const rhythm = this.ELEMENTAL_RHYTHMS[element];
    const currentIndex = rhythm.intervals.indexOf(schedule.interval);

    if (currentIndex === -1) {
      // Not in standard intervals, use current * ease
      return Math.floor(schedule.interval * (1 + schedule.ease));
    }

    // Move to next interval in sequence, modulated by ease
    const nextIndex = Math.min(currentIndex + 1, rhythm.intervals.length - 1);
    const baseInterval = rhythm.intervals[nextIndex];

    // Ease modulates the interval
    return Math.floor(baseInterval * (0.5 + (schedule.ease * 1.5)));
  }

  /**
   * Get current elemental cycles
   */
  async getCurrentCycles(): Promise<ElementalCycle[]> {
    const now = new Date();
    const cycles: ElementalCycle[] = [];

    // Calculate each element's current phase in its natural cycle
    for (const element of ['fire', 'water', 'earth', 'air', 'aether'] as Element[]) {
      const cycle = this.calculateElementalPhase(element, now);
      cycles.push(cycle);
    }

    return cycles;
  }

  /**
   * Calculate where an element is in its natural cycle
   */
  private calculateElementalPhase(element: Element, date: Date): ElementalCycle {
    const day = date.getDate();
    const month = date.getMonth();

    let phase: ElementalCycle['phase'];
    let nextPeak: Date;
    let recommendations: string[];

    switch (element) {
      case 'water':
        // Lunar cycle
        if (day < 7) {
          phase = 'waxing';
          recommendations = ['New emotional insights emerging', 'Dreams may intensify'];
        } else if (day < 14) {
          phase = 'peak';
          recommendations = ['Peak emotional clarity', 'Time for deep feeling'];
        } else if (day < 21) {
          phase = 'waning';
          recommendations = ['Integration of emotional wisdom', 'Release what no longer serves'];
        } else {
          phase = 'trough';
          recommendations = ['Rest from emotional work', 'Prepare for new cycle'];
        }
        nextPeak = new Date(date);
        nextPeak.setDate(14); // Mid-month
        if (day >= 14) nextPeak.setMonth(month + 1);
        break;

      case 'fire':
        // Solar cycle (daily + seasonal)
        const hour = date.getHours();
        if (hour >= 10 && hour < 14) {
          phase = 'peak';
          recommendations = ['Peak creative energy', 'Take bold action'];
        } else if (hour >= 6 && hour < 10) {
          phase = 'waxing';
          recommendations = ['Momentum building', 'Start new initiatives'];
        } else if (hour >= 14 && hour < 18) {
          phase = 'waning';
          recommendations = ['Integrate the day\'s fire', 'Reflect on actions taken'];
        } else {
          phase = 'trough';
          recommendations = ['Rest and restore', 'Dream of tomorrow\'s creations'];
        }
        nextPeak = new Date(date);
        nextPeak.setHours(12, 0, 0, 0);
        if (hour >= 12) nextPeak.setDate(date.getDate() + 1);
        break;

      case 'earth':
        // Seasonal cycle
        if (month >= 2 && month <= 4) {
          phase = 'waxing';
          recommendations = ['Plant seeds', 'Build foundations'];
        } else if (month >= 5 && month <= 7) {
          phase = 'peak';
          recommendations = ['Embodiment at its fullest', 'Harvest growth'];
        } else if (month >= 8 && month <= 10) {
          phase = 'waning';
          recommendations = ['Release and compost', 'Prepare for rest'];
        } else {
          phase = 'trough';
          recommendations = ['Deep rest', 'Gestation of new forms'];
        }
        nextPeak = new Date(date.getFullYear(), 6, 1); // July
        if (month >= 6) nextPeak.setFullYear(date.getFullYear() + 1);
        break;

      case 'air':
        // Quick daily cycle
        if (hour >= 5 && hour < 9) {
          phase = 'waxing';
          recommendations = ['Mental clarity rising', 'Good for learning'];
        } else if (hour >= 9 && hour < 12) {
          phase = 'peak';
          recommendations = ['Peak mental clarity', 'Strategic thinking time'];
        } else if (hour >= 12 && hour < 17) {
          phase = 'waning';
          recommendations = ['Consolidate insights', 'Reflect and integrate'];
        } else {
          phase = 'trough';
          recommendations = ['Release mental activity', 'Allow unconscious processing'];
        }
        nextPeak = new Date(date);
        nextPeak.setHours(10, 0, 0, 0);
        if (hour >= 10) nextPeak.setDate(date.getDate() + 1);
        break;

      case 'aether':
        // Annual cycle
        if (month >= 0 && month <= 2) {
          phase = 'waxing';
          recommendations = ['New visions emerging', 'Integration beginning'];
        } else if (month >= 3 && month <= 5) {
          phase = 'peak';
          recommendations = ['Wholeness accessible', 'See the big picture'];
        } else if (month >= 6 && month <= 8) {
          phase = 'waning';
          recommendations = ['Wisdom settling', 'Integrate the year\'s lessons'];
        } else {
          phase = 'trough';
          recommendations = ['Reflect on the year', 'Allow mystery'];
        }
        nextPeak = new Date(date.getFullYear(), 4, 1); // May
        if (month >= 4) nextPeak.setFullYear(date.getFullYear() + 1);
        break;

      default:
        phase = 'waxing';
        nextPeak = new Date(date);
        recommendations = [];
    }

    return {
      element,
      phase,
      nextPeak,
      recommendations
    };
  }

  /**
   * Find opportune moments for recall (even if not "due")
   * This is the magic - surfacing memories when the rhythm is right
   */
  async findOpportuneMoments(
    currentElement?: Element,
    currentPhase?: Phase
  ): Promise<RecallMoment[]> {
    const moments: RecallMoment[] = [];
    const cycles = await this.getCurrentCycles();

    // Find cards that resonate with current elemental cycles
    for (const [cardId, schedule] of this.schedules.entries()) {
      const elementCycle = cycles.find(c => c.element === schedule.element);

      if (elementCycle?.phase === 'peak') {
        // This element is at peak - opportune time to recall related memories
        // TODO: Fetch card and create RecallMoment
        // moments.push(...)
      }
    }

    return moments;
  }
}
