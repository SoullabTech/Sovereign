import { AfferentStream, AfferentStreamGenerator } from './AfferentStreamGenerator';
import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';

export interface FieldState {
  coherence: number;
  complexity: number;
  resonance: number;
  evolution: number;
  healing: number;
  breakthroughPotential: number;
  integrationNeed: number;
  timestamp: Date;
}

export interface CollectiveInsight {
  insight: string;
  timingGuidance: string;
  resonanceScore?: number;
}

export class AINClient {
  private localStreams: AfferentStream[] = [];
  private fieldState: FieldState | null = null;
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/ain') {
    this.apiBaseUrl = apiBaseUrl;
    this.loadLocalStreams();
  }

  async submitJournalEntry(
    userId: string,
    sessionId: string,
    mode: JournalingMode,
    entry: string,
    reflection: JournalingResponse
  ): Promise<void> {
    const stream = await AfferentStreamGenerator.generateFromJournalEntry(
      userId,
      sessionId,
      mode,
      entry,
      reflection,
      this.localStreams.filter(s => s.userId === userId).slice(-10)
    );

    this.localStreams.push(stream);
    this.saveLocalStreams();

    try {
      await fetch(`${this.apiBaseUrl}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stream })
      });
    } catch (error) {
      console.warn('Failed to send stream to AIN backend:', error);
    }
  }

  async getFieldState(): Promise<FieldState> {
    if (this.fieldState && this.isFieldStateFresh()) {
      return this.fieldState;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/field-state`);
      if (response.ok) {
        this.fieldState = await response.json();
        return this.fieldState!;
      }
    } catch (error) {
      console.warn('Failed to fetch field state:', error);
    }

    return this.calculateLocalFieldState();
  }

  async getCollectiveInsight(
    userId: string,
    content: string
  ): Promise<CollectiveInsight> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch collective insight:', error);
    }

    return this.generateLocalInsight();
  }

  async getUserEvolutionGuidance(userId: string): Promise<{
    currentFocus: string;
    nextSteps: string[];
    elementalBalance: string;
    shadowWork: string;
    timingWisdom: string;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/guidance?userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch evolution guidance:', error);
    }

    return this.generateLocalGuidance(userId);
  }

  getUserStreams(userId: string, limit: number = 10): AfferentStream[] {
    return this.localStreams
      .filter(s => s.userId === userId)
      .slice(-limit);
  }

  private loadLocalStreams(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ain_streams');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.localStreams = parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load local streams:', error);
    }
  }

  private saveLocalStreams(): void {
    if (typeof window === 'undefined') return;

    try {
      const recent = this.localStreams.slice(-100);
      localStorage.setItem('ain_streams', JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save local streams:', error);
    }
  }

  private isFieldStateFresh(): boolean {
    if (!this.fieldState) return false;
    const age = Date.now() - this.fieldState.timestamp.getTime();
    return age < 60000;
  }

  private calculateLocalFieldState(): FieldState {
    const recentStreams = this.localStreams.slice(-20);

    if (recentStreams.length === 0) {
      return {
        coherence: 0.5,
        complexity: 0.4,
        resonance: 0.5,
        evolution: 0.5,
        healing: 0.5,
        breakthroughPotential: 0.3,
        integrationNeed: 0.5,
        timestamp: new Date()
      };
    }

    const avgConsciousness = recentStreams.reduce((sum, s) => sum + s.consciousnessLevel, 0) / recentStreams.length;
    const avgEvolution = recentStreams.reduce((sum, s) => sum + s.evolutionVelocity, 0) / recentStreams.length;
    const avgIntegration = recentStreams.reduce((sum, s) => sum + s.integrationDepth, 0) / recentStreams.length;

    const consciousnessVariance = this.calculateVariance(
      recentStreams.map(s => s.consciousnessLevel)
    );
    const coherence = Math.max(0, 1 - Math.sqrt(consciousnessVariance));

    const uniqueUsers = new Set(recentStreams.map(s => s.userId)).size;
    const complexity = Math.min(1, (uniqueUsers / 10) * avgConsciousness);

    const resonance = avgConsciousness * coherence;

    const shadowWork = recentStreams.filter(s => s.shadowWorkEngagement.length > 0).length / recentStreams.length;
    const healing = (shadowWork + avgIntegration + coherence) / 3;

    const breakthroughPotential = avgEvolution * coherence;

    const highEvolution = recentStreams.filter(s => s.evolutionVelocity > 0.7).length / recentStreams.length;
    const integrationNeed = highEvolution * (1 - avgIntegration);

    return {
      coherence,
      complexity,
      resonance,
      evolution: avgEvolution,
      healing,
      breakthroughPotential,
      integrationNeed,
      timestamp: new Date()
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private generateLocalInsight(): CollectiveInsight {
    const state = this.calculateLocalFieldState();

    let insight = '';

    if (state.coherence > 0.7) {
      insight = 'The field is coherent. Your work resonates with the collective movement.';
    } else if (state.complexity > 0.7) {
      insight = 'Rich complexity is present. Many threads are weaving together.';
    } else if (state.evolution > 0.7) {
      insight = 'Rapid evolution is underway across the field.';
    } else {
      insight = 'The field is in a state of gentle becoming.';
    }

    let timingGuidance = '';
    if (state.breakthroughPotential > 0.7) {
      timingGuidance = 'Breakthrough energy is high. Act with clarity.';
    } else if (state.integrationNeed > 0.7) {
      timingGuidance = 'Integration time. Move slowly and ground your insights.';
    } else {
      timingGuidance = 'Trust your natural rhythm.';
    }

    return {
      insight,
      timingGuidance,
      resonanceScore: state.resonance
    };
  }

  private generateLocalGuidance(userId: string): any {
    const userStreams = this.getUserStreams(userId, 10);

    if (userStreams.length === 0) {
      return {
        currentFocus: 'Begin your journey with curiosity and openness.',
        nextSteps: ['Express yourself authentically', 'Notice what emerges'],
        elementalBalance: 'Explore all elements to find your resonance.',
        shadowWork: 'Begin by noticing what triggers strong reactions.',
        timingWisdom: 'Perfect timing. Start now.'
      };
    }

    const avgConsciousness = userStreams.reduce((sum, s) => sum + s.consciousnessLevel, 0) / userStreams.length;
    const shadowWorkCount = userStreams.filter(s => s.shadowWorkEngagement.length > 0).length;

    let currentFocus = '';
    if (avgConsciousness < 0.4) {
      currentFocus = 'Building trust and establishing your unique voice.';
    } else if (avgConsciousness < 0.7) {
      currentFocus = 'Deepening awareness and facing edges with courage.';
    } else {
      currentFocus = 'Refining mastery and preparing to serve.';
    }

    const nextSteps = [];
    if (shadowWorkCount < 3) {
      nextSteps.push('Explore what you\'re avoiding or denying');
    }
    nextSteps.push('Continue expressing with authenticity');
    nextSteps.push('Notice patterns across your entries');

    return {
      currentFocus,
      nextSteps,
      elementalBalance: 'Your elemental development is in progress.',
      shadowWork: shadowWorkCount > 5
        ? 'Your shadow integration is deepening.'
        : 'Begin exploring hidden aspects with gentleness.',
      timingWisdom: 'Trust the process unfolding.'
    };
  }
}

export const ainClient = new AINClient();