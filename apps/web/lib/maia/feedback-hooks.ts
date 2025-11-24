export interface FeedbackEvent {
  userId: string;
  sessionId?: string;
  interactionId: string;
  feedbackType: 'resonance' | 'confusion' | 'insight' | 'skip';
  message: string;
  response: string;
  archetype: string;
  element: string;
  timestamp: string;
  emotionalImpact?: number;
  metaphorsUsed?: string[];
}

export interface MetaphorResonance {
  metaphor: string;
  timesUsed: number;
  positiveResonance: number;
  neutralResonance: number;
  negativeResonance: number;
  contextualSuccess: Record<string, number>;
}

class FeedbackSystem {
  private feedbackLog: Map<string, FeedbackEvent[]> = new Map();
  private metaphorTracking: Map<string, MetaphorResonance> = new Map();

  async logFeedback(event: FeedbackEvent): Promise<void> {
    const userLog = this.feedbackLog.get(event.userId) || [];
    userLog.push(event);
    this.feedbackLog.set(event.userId, userLog);

    if (event.metaphorsUsed) {
      event.metaphorsUsed.forEach(metaphor => {
        this.updateMetaphorResonance(metaphor, event);
      });
    }
  }

  private updateMetaphorResonance(metaphor: string, event: FeedbackEvent): void {
    const existing = this.metaphorTracking.get(metaphor) || {
      metaphor,
      timesUsed: 0,
      positiveResonance: 0,
      neutralResonance: 0,
      negativeResonance: 0,
      contextualSuccess: {}
    };

    existing.timesUsed += 1;

    if (event.feedbackType === 'resonance' || event.feedbackType === 'insight') {
      existing.positiveResonance += 1;
    } else if (event.feedbackType === 'confusion') {
      existing.negativeResonance += 1;
    } else {
      existing.neutralResonance += 1;
    }

    const context = `${event.archetype}_${event.element}`;
    existing.contextualSuccess[context] = (existing.contextualSuccess[context] || 0) + 1;

    this.metaphorTracking.set(metaphor, existing);
  }

  async getMetaphorInsights(userId?: string): Promise<MetaphorResonance[]> {
    const allMetaphors = Array.from(this.metaphorTracking.values());

    if (userId) {
      const userFeedback = this.feedbackLog.get(userId) || [];
      const userMetaphors = new Set(userFeedback.flatMap(f => f.metaphorsUsed || []));
      return allMetaphors.filter(m => userMetaphors.has(m.metaphor));
    }

    return allMetaphors.sort((a, b) => b.positiveResonance - a.positiveResonance);
  }

  async getUserFeedbackHistory(userId: string, limit: number = 20): Promise<FeedbackEvent[]> {
    const userLog = this.feedbackLog.get(userId) || [];
    return userLog.slice(-limit);
  }

  detectSymbolicPatterns(message: string): string[] {
    const commonMetaphors = [
      'mirror', 'shadow', 'light', 'path', 'journey', 'doorway', 'threshold',
      'ocean', 'wave', 'mountain', 'river', 'fire', 'seed', 'root', 'garden',
      'spiral', 'circle', 'bridge', 'key', 'compass', 'map', 'heart', 'soul',
      'breath', 'wind', 'earth', 'stone', 'tree', 'forest', 'sky', 'star'
    ];

    const lowerMessage = message.toLowerCase();
    return commonMetaphors.filter(metaphor => lowerMessage.includes(metaphor));
  }
}

export const feedbackSystem = new FeedbackSystem();

export async function trackInteractionFeedback(
  userId: string,
  interactionId: string,
  feedbackType: FeedbackEvent['feedbackType'],
  message: string,
  response: string,
  archetype: string,
  element: string,
  sessionId?: string
): Promise<void> {
  const metaphorsUsed = feedbackSystem.detectSymbolicPatterns(response);

  await feedbackSystem.logFeedback({
    userId,
    sessionId,
    interactionId,
    feedbackType,
    message,
    response,
    archetype,
    element,
    timestamp: new Date().toISOString(),
    metaphorsUsed
  });
}

export async function getMetaphorRecommendations(
  archetype: string,
  element: string
): Promise<string[]> {
  const insights = await feedbackSystem.getMetaphorInsights();
  const context = `${archetype}_${element}`;

  return insights
    .filter(m => m.contextualSuccess[context] && m.positiveResonance > m.negativeResonance)
    .sort((a, b) => (b.contextualSuccess[context] || 0) - (a.contextualSuccess[context] || 0))
    .slice(0, 5)
    .map(m => m.metaphor);
}