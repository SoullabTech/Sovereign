/**
 * Control Group Manager for A/B Testing
 * Manages cohort assignment and ensures clean experimental design
 */

export type CohortType = 'control' | 'fis-full' | 'fis-partial' | 'hybrid';

export interface UserCohortAssignment {
  userId: string;
  cohort: CohortType;
  assignedAt: Date;
  conversationCount: number;
  crossoverSchedule?: {
    switchPoint: number;  // Exchange number to switch
    fromSystem: string;
    toSystem: string;
  };
}

export class ControlGroupManager {
  private cohortAssignments: Map<string, UserCohortAssignment> = new Map();
  private cohortSizes = {
    control: 100,
    'fis-full': 100,
    'fis-partial': 100,
    hybrid: 100
  };

  private currentCounts = {
    control: 0,
    'fis-full': 0,
    'fis-partial': 0,
    hybrid: 0
  };

  /**
   * Assign new user to cohort using stratified randomization
   */
  assignUserToCohort(userId: string): UserCohortAssignment {
    // Check if already assigned
    if (this.cohortAssignments.has(userId)) {
      return this.cohortAssignments.get(userId)!;
    }

    // Find cohorts that need users
    const availableCohorts = Object.entries(this.currentCounts)
      .filter(([cohort, count]) => count < this.cohortSizes[cohort])
      .map(([cohort]) => cohort as CohortType);

    if (availableCohorts.length === 0) {
      throw new Error('All cohorts full - expand study size');
    }

    // Random assignment among available cohorts
    const cohort = availableCohorts[
      Math.floor(Math.random() * availableCohorts.length)
    ];

    const assignment: UserCohortAssignment = {
      userId,
      cohort,
      assignedAt: new Date(),
      conversationCount: 0
    };

    // Set crossover schedule for hybrid cohort
    if (cohort === 'hybrid') {
      assignment.crossoverSchedule = {
        switchPoint: 5 + Math.floor(Math.random() * 5), // Switch at 5-10 exchanges
        fromSystem: Math.random() > 0.5 ? 'traditional' : 'fis',
        toSystem: Math.random() > 0.5 ? 'fis' : 'traditional'
      };
    }

    this.cohortAssignments.set(userId, assignment);
    this.currentCounts[cohort]++;

    return assignment;
  }

  /**
   * Get appropriate system for user based on cohort
   */
  getSystemForUser(
    userId: string,
    exchangeNumber: number
  ): 'traditional' | 'fis-full' | 'fis-partial' {
    const assignment = this.cohortAssignments.get(userId);

    if (!assignment) {
      // Auto-assign if not yet assigned
      const newAssignment = this.assignUserToCohort(userId);
      return this.mapCohortToSystem(newAssignment.cohort, exchangeNumber);
    }

    return this.mapCohortToSystem(assignment.cohort, exchangeNumber, assignment);
  }

  private mapCohortToSystem(
    cohort: CohortType,
    exchangeNumber: number,
    assignment?: UserCohortAssignment
  ): 'traditional' | 'fis-full' | 'fis-partial' {
    switch (cohort) {
      case 'control':
        return 'traditional';

      case 'fis-full':
        return 'fis-full';

      case 'fis-partial':
        return 'fis-partial';

      case 'hybrid':
        // Check if we should switch systems
        if (assignment?.crossoverSchedule) {
          const { switchPoint, fromSystem, toSystem } = assignment.crossoverSchedule;
          if (exchangeNumber < switchPoint) {
            return fromSystem === 'traditional' ? 'traditional' : 'fis-full';
          } else {
            return toSystem === 'traditional' ? 'traditional' : 'fis-full';
          }
        }
        return 'traditional'; // Default
    }
  }

  /**
   * Traditional Maya responses for control group
   */
  generateTraditionalResponse(
    userInput: string,
    context: any
  ): string {
    // Simulate traditional over-eager therapeutic AI
    const patterns = {
      greeting: [
        "Hello! I'm sensing you're reaching out to connect. What's alive for you in this moment?",
        "Welcome! I notice you're here. What brings you to this space today?",
        "Greetings! I'm curious about what's calling for your attention right now."
      ],

      casual: [
        "Even casual check-ins often carry deeper meaning. What's beneath the surface for you?",
        "I'm noticing something in your words. What wants to be expressed?",
        "There's always more than meets the eye. What else is present?"
      ],

      emotional: [
        "I'm hearing strong emotions in what you're sharing. Can you tell me more about what you're feeling?",
        "There's a lot of feeling here. What's at the core of this emotion?",
        "Your words carry emotional weight. How does this feeling live in your body?"
      ],

      fragment: [
        "I notice you're speaking in fragments. What's difficult to put into words?",
        "There's hesitation in your expression. What's holding you back?",
        "Sometimes fragments point to something deeper. What's trying to emerge?"
      ],

      celebration: [
        "I sense joy and accomplishment in your words. What does this success mean for your journey?",
        "This achievement seems significant. How does it connect to your larger growth?",
        "Celebration often marks transformation. What shifted for you to make this possible?"
      ]
    };

    const inputType = this.classifyInput(userInput);
    const responses = patterns[inputType] || patterns.casual;

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * FIS-Partial responses (only field sensing, no higher systems)
   */
  generateFISPartialResponse(
    userInput: string,
    fieldState: any
  ): string {
    // Uses field awareness but limited systems
    if (fieldState.emotionalWeather.density > 0.7) {
      return "That's intense.";
    }

    if (fieldState.sacredMarkers.thresholdProximity > 0.8) {
      return "..."; // Sacred pause
    }

    if (fieldState.connectionDynamics.distance > 0.7) {
      return "Hi there."; // Match distance
    }

    return "Tell me more.";
  }

  private classifyInput(input: string): string {
    const lower = input.toLowerCase();

    if (/^(hi|hey|hello)/.test(lower)) return 'greeting';
    if (input.includes('!') && /got it|worked|success|did it/.test(lower)) return 'celebration';
    if (/feel|hurt|sad|angry|scared/.test(lower)) return 'emotional';
    if (input.length < 30 && !input.includes('.')) return 'fragment';

    return 'casual';
  }

  /**
   * Export cohort assignments for analysis
   */
  exportAssignments(): UserCohortAssignment[] {
    return Array.from(this.cohortAssignments.values());
  }

  /**
   * Check study balance
   */
  getStudyBalance(): any {
    return {
      targetSizes: this.cohortSizes,
      currentSizes: this.currentCounts,
      balance: Object.entries(this.currentCounts).map(([cohort, count]) => ({
        cohort,
        fillRate: (count / this.cohortSizes[cohort]) * 100
      }))
    };
  }
}

interface EvaluatorProfile {
  id: string;
  name: string;
  expertise: 'clinical' | 'ux' | 'general';
  completedEvaluations: number;
  averageRatingTime: number;
  calibrationScore: number;
}

interface EvaluationTask {
  conversationId: string;
  exchanges: Array<{
    user: string;
    maya: string;
  }>;
  systemType: 'traditional' | 'fis' | 'unknown';
  evaluatorId?: string;
  ratings?: {
    authenticity: number;
    naturalness: number;
    presence: number;
    therapeutic: number;
    wouldContinue: boolean;
    breakthrough: boolean;
    notes: string;
  };
}

/**
 * Evaluation Team Interface
 */
export class AuthenticityEvaluator {
  private evaluators: Map<string, EvaluatorProfile> = new Map();
  private evaluationQueue: EvaluationTask[] = [];

  /**
   * Queue conversation for evaluation
   */
  queueForEvaluation(
    conversationId: string,
    exchanges: any[],
    hideSystemType: boolean = true
  ): void {
    this.evaluationQueue.push({
      conversationId,
      exchanges,
      systemType: hideSystemType ? 'unknown' : this.getSystemType(conversationId)
    });
  }

  /**
   * Assign next evaluation to available evaluator
   */
  getNextEvaluation(evaluatorId: string): EvaluationTask | null {
    // Find unassigned task
    const task = this.evaluationQueue.find(t => !t.evaluatorId);

    if (task) {
      task.evaluatorId = evaluatorId;
      return task;
    }

    return null;
  }

  /**
   * Submit evaluation ratings
   */
  submitEvaluation(
    taskId: string,
    ratings: EvaluationTask['ratings']
  ): void {
    const task = this.evaluationQueue.find(t => t.conversationId === taskId);

    if (task) {
      task.ratings = ratings;
      this.updateEvaluatorStats(task.evaluatorId!, ratings);
    }
  }

  /**
   * Calculate inter-rater reliability
   */
  calculateInterRaterReliability(): number {
    // Group evaluations by conversation
    const grouped = this.groupByConversation(this.evaluationQueue);

    // Calculate Krippendorff's alpha or similar
    // Simplified version here
    let totalVariance = 0;
    let observedVariance = 0;

    for (const [convId, evaluations] of Object.entries(grouped)) {
      const ratings = evaluations
        .filter(e => e.ratings)
        .map(e => e.ratings!.authenticity);

      if (ratings.length > 1) {
        const mean = ratings.reduce((a, b) => a + b) / ratings.length;
        const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0);

        observedVariance += variance;
        totalVariance += ratings.length;
      }
    }

    return 1 - (observedVariance / totalVariance);
  }

  private updateEvaluatorStats(evaluatorId: string, ratings: any): void {
    const evaluator = this.evaluators.get(evaluatorId);
    if (evaluator) {
      evaluator.completedEvaluations++;
    }
  }

  private groupByConversation(tasks: EvaluationTask[]): Record<string, EvaluationTask[]> {
    return tasks.reduce((acc, task) => {
      if (!acc[task.conversationId]) {
        acc[task.conversationId] = [];
      }
      acc[task.conversationId].push(task);
      return acc;
    }, {} as Record<string, EvaluationTask[]>);
  }

  private getSystemType(conversationId: string): 'traditional' | 'fis' | 'unknown' {
    return 'unknown';
  }
}

// Export singleton instances
export const controlGroupManager = new ControlGroupManager();
export const authenticityEvaluator = new AuthenticityEvaluator();