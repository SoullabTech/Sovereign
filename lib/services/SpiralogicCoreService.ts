/**
 * 🌀 Spiralogic Core Service (Stub Implementation)
 * Provides basic spiralogic state management for MAIA integration
 * This is a minimal implementation to support the archetypal intelligence system
 */

export interface SpiralogicState {
  currentElement: 'water' | 'earth' | 'fire' | 'air' | 'aether';
  currentFacet: string;
  intensity: number;
  coherence: number;
  lastTransition: Date;
  phase: 'exploring' | 'integrating' | 'transcending';
}

export interface SpiralogicTransition {
  fromElement: string;
  toElement: string;
  timestamp: Date;
  triggerType: string;
  intensity: number;
}

export class SpiralogicCoreService {
  private userStates: Map<string, SpiralogicState> = new Map();
  private userTransitions: Map<string, SpiralogicTransition[]> = new Map();

  /**
   * Get current spiral state for a user
   */
  async getCurrentState(userId: string): Promise<SpiralogicState> {
    let state = this.userStates.get(userId);

    if (!state) {
      // Create initial state - most users start in water/earth exploration
      state = {
        currentElement: 'water',
        currentFacet: 'emotional_flow',
        intensity: 0.5,
        coherence: 0.5,
        lastTransition: new Date(),
        phase: 'exploring'
      };

      this.userStates.set(userId, state);
    }

    return state;
  }

  /**
   * Get recent transitions for a user
   */
  async getRecentTransitions(userId: string, limit: number = 5): Promise<SpiralogicTransition[]> {
    const transitions = this.userTransitions.get(userId) || [];
    return transitions.slice(-limit);
  }

  /**
   * Record a new transition for a user
   */
  async recordTransition(userId: string, transition: SpiralogicTransition): Promise<void> {
    let transitions = this.userTransitions.get(userId) || [];
    transitions.push(transition);

    // Keep only last 50 transitions to prevent memory bloat
    if (transitions.length > 50) {
      transitions = transitions.slice(-50);
    }

    this.userTransitions.set(userId, transitions);

    // Update current state based on transition
    await this.updateStateFromTransition(userId, transition);
  }

  /**
   * Update user's current state based on transition
   */
  private async updateStateFromTransition(userId: string, transition: SpiralogicTransition): Promise<void> {
    const currentState = await this.getCurrentState(userId);

    // Update element if it's a valid transition
    if (this.isValidElement(transition.toElement)) {
      currentState.currentElement = transition.toElement as any;
    }

    // Update intensity and coherence based on transition
    currentState.intensity = Math.min(1, Math.max(0, transition.intensity));
    currentState.lastTransition = transition.timestamp;

    // Update phase based on transition patterns
    currentState.phase = this.determinePhase(userId);

    this.userStates.set(userId, currentState);
  }

  /**
   * Determine current phase based on recent transitions
   */
  private determinePhase(userId: string): 'exploring' | 'integrating' | 'transcending' {
    const transitions = this.userTransitions.get(userId) || [];

    if (transitions.length < 3) return 'exploring';

    const recent = transitions.slice(-3);
    const uniqueElements = new Set(recent.map(t => t.toElement)).size;

    // If visiting many different elements, likely exploring
    if (uniqueElements >= 3) return 'exploring';

    // If staying within similar elements, likely integrating
    if (uniqueElements <= 1) return 'integrating';

    // Check for upward movement toward aether (transcending)
    const elementOrder = ['water', 'earth', 'fire', 'air', 'aether'];
    const lastElement = recent[recent.length - 1].toElement;
    const elementIndex = elementOrder.indexOf(lastElement);

    if (elementIndex >= 3) return 'transcending';

    return 'integrating';
  }

  /**
   * Check if element is valid
   */
  private isValidElement(element: string): boolean {
    return ['water', 'earth', 'fire', 'air', 'aether'].includes(element);
  }

  /**
   * Get spiral analytics for a user
   */
  async getSpiralogicAnalytics(userId: string): Promise<any> {
    const state = await this.getCurrentState(userId);
    const transitions = await this.getRecentTransitions(userId, 10);

    return {
      currentState: state,
      recentActivity: transitions.length,
      dominantElement: this.getDominantElement(transitions),
      evolutionDirection: this.getEvolutionDirection(transitions),
      coherenceLevel: state.coherence
    };
  }

  /**
   * Get the most frequently visited element
   */
  private getDominantElement(transitions: SpiralogicTransition[]): string {
    if (transitions.length === 0) return 'water';

    const elementCounts = transitions.reduce((acc, t) => {
      acc[t.toElement] = (acc[t.toElement] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Determine overall evolution direction
   */
  private getEvolutionDirection(transitions: SpiralogicTransition[]): 'ascending' | 'descending' | 'cycling' | 'stable' {
    if (transitions.length < 2) return 'stable';

    const elementOrder = ['water', 'earth', 'fire', 'air', 'aether'];
    let ascending = 0;
    let descending = 0;

    for (let i = 1; i < transitions.length; i++) {
      const prevIndex = elementOrder.indexOf(transitions[i - 1].toElement);
      const currIndex = elementOrder.indexOf(transitions[i].toElement);

      if (currIndex > prevIndex) ascending++;
      else if (currIndex < prevIndex) descending++;
    }

    if (ascending > descending + 1) return 'ascending';
    if (descending > ascending + 1) return 'descending';
    if (ascending + descending < transitions.length * 0.5) return 'cycling';

    return 'stable';
  }
}

// Export singleton instance
export const spiralogicService = new SpiralogicCoreService();

export default spiralogicService;