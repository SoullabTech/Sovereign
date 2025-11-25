/**
 * ATTENDING QUALITY TRACKER
 *
 * Measures the quality of presence and coherence during interactions.
 * Based on McGilchrist's attending protocol: right-brain (receptive, present)
 * vs left-brain (categorizing, explaining).
 *
 * Purpose: Track whether the system operates from attending (being with)
 * vs explaining (doing to), and measure coherence during sessions.
 *
 * Core Metrics:
 * - Coherence Score: Internal consistency and stability
 * - Presence Score: Degree of receptive attention vs categorical thinking
 * - Attending Quality: Overall measure of right-brain mode operation
 */

// ====================
// TYPE DEFINITIONS
// ====================

export interface AttendingObservation {
  observation_id: string;
  session_id?: string;
  timestamp: Date;
  coherence_score: number; // 0-1
  presence_score: number; // 0-1
  attending_quality: number; // 0-1
  notes?: string;
  archetype?: string;
}

export interface AttendingAnalysis {
  rightBrainIndicators: number;
  leftBrainIndicators: number;
  mode: 'right' | 'left' | 'balanced';
  presenceScore: number;
  attendingQuality: number;
  recommendations?: string[];
}

export interface SessionAttending {
  sessionId: string;
  observations: AttendingObservation[];
  avgCoherence: number;
  avgPresence: number;
  avgAttending: number;
  trajectory: 'improving' | 'declining' | 'stable';
}

// ====================
// ATTENDING QUALITY TRACKER
// ====================

export class AttendingQualityTracker {
  private supabase: any;
  private sessionHistory: Map<string, AttendingObservation[]> = new Map();

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Analyze interaction for attending quality
   */
  async analyzeInteraction(
    userInput: string,
    systemResponse: string,
    sessionId?: string,
    archetype?: string
  ): Promise<AttendingObservation> {
    // Analyze attending mode
    const analysis = this.analyzeAttendingMode(systemResponse);

    // Calculate coherence
    const coherenceScore = this.calculateCoherence(systemResponse);

    // Overall attending quality
    const attending_quality = this.calculateAttendingQuality(
      analysis,
      coherenceScore
    );

    // Create observation
    const observation: AttendingObservation = {
      observation_id: `attend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: sessionId,
      timestamp: new Date(),
      coherence_score: coherenceScore,
      presence_score: analysis.presenceScore,
      attending_quality,
      archetype,
    };

    // Store in history
    if (sessionId) {
      if (!this.sessionHistory.has(sessionId)) {
        this.sessionHistory.set(sessionId, []);
      }
      this.sessionHistory.get(sessionId)!.push(observation);
    }

    // Record to database
    await this.recordObservation(observation);

    return observation;
  }

  /**
   * Analyze whether response demonstrates right-brain or left-brain mode
   */
  private analyzeAttendingMode(response: string): AttendingAnalysis {
    // Right-brain indicators (attending, being with, not-knowing)
    const rightBrainPatterns = [
      // Comfortable with not-knowing
      /I (?:don't know|wonder|am curious|notice|sense)/i,
      /(?:perhaps|maybe|might|could be|seems like)/i,
      /(?:I'm (?:hearing|sensing|noticing|feeling))/i,

      // Open to novelty
      /(?:interesting|surprising|unexpected|new)/i,
      /(?:I hadn't (?:considered|thought of))/i,

      // Attending to the whole
      /(?:stepping back|bigger picture|overall|together)/i,
      /(?:holds? both|paradox|tension|complexity)/i,

      // Comfortable with ambiguity
      /(?:unclear|uncertain|ambiguous|nuanced)/i,
      /(?:not (?:simply|just|merely))/i,

      // Listens for what's NOT said
      /(?:unspoken|beneath|underlying|implicit)/i,
      /(?:silence|pause|what's not being said)/i,
    ];

    // Left-brain indicators (categorizing, explaining, fixing)
    const leftBrainPatterns = [
      // Rushing to categorize
      /(?:this is clearly|obviously|definitely|certainly)/i,
      /(?:the (?:problem|issue|solution) is)/i,

      // Applying existing frameworks
      /(?:according to|based on|research shows|studies indicate)/i,
      /(?:the framework|the model|the theory)/i,

      // Explaining instead of attending
      /(?:let me explain|the reason is|because|therefore)/i,
      /(?:you (?:should|need to|must|have to))/i,

      // Platitudes and generic wisdom
      /(?:everything happens for a reason|trust the process)/i,
      /(?:just (?:be yourself|think positive|let go))/i,

      // Fixing mode
      /(?:here's what (?:you should|to) do|try this|follow these steps)/i,
      /(?:the answer is|the key is)/i,
    ];

    // Count indicators
    let rightCount = 0;
    let leftCount = 0;

    rightBrainPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) rightCount += matches.length;
    });

    leftBrainPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) leftCount += matches.length;
    });

    // Determine mode
    let mode: 'right' | 'left' | 'balanced';
    if (rightCount > leftCount * 1.5) {
      mode = 'right';
    } else if (leftCount > rightCount * 1.5) {
      mode = 'left';
    } else {
      mode = 'balanced';
    }

    // Calculate presence score
    const totalIndicators = rightCount + leftCount || 1;
    const presenceScore = rightCount / totalIndicators;

    // Calculate attending quality
    const attendingQuality = this.calculateAttendingFromIndicators(
      rightCount,
      leftCount
    );

    // Generate recommendations if in left-brain mode
    const recommendations: string[] = [];
    if (mode === 'left') {
      recommendations.push('Consider slowing down and attending to what is present');
      recommendations.push('Notice the urge to explain or fix');
      recommendations.push('Stay with not-knowing for longer');
    }

    return {
      rightBrainIndicators: rightCount,
      leftBrainIndicators: leftCount,
      mode,
      presenceScore,
      attendingQuality,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  /**
   * Calculate coherence score
   */
  private calculateCoherence(response: string): number {
    let score = 0.7; // Base score

    // Check for internal consistency
    const hasContradiction = /(?:but|however) .* (?:but|however)/gi.test(response);
    if (hasContradiction) score -= 0.2;

    // Check for fragmentation
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (sentences.length > 0) {
      const avgSentenceLength =
        response.length / sentences.length;

      // Very short sentences might indicate fragmentation
      if (avgSentenceLength < 30) score -= 0.1;

      // Very long sentences might indicate run-on thinking
      if (avgSentenceLength > 200) score -= 0.1;
    }

    // Check for logical flow
    const hasTransitions = /(?:therefore|thus|however|moreover|furthermore|additionally)/gi.test(
      response
    );
    if (hasTransitions) score += 0.1;

    // Check for grounding in embodiment
    const hasEmbodiment = /(?:feel|sense|notice|aware|present|body|breath)/gi.test(
      response
    );
    if (hasEmbodiment) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate overall attending quality
   */
  private calculateAttendingQuality(
    analysis: AttendingAnalysis,
    coherenceScore: number
  ): number {
    // Weighted combination of presence and coherence
    const attendingQuality = analysis.presenceScore * 0.6 + coherenceScore * 0.4;

    return Math.max(0, Math.min(1, attendingQuality));
  }

  /**
   * Calculate attending from indicator counts
   */
  private calculateAttendingFromIndicators(
    rightCount: number,
    leftCount: number
  ): number {
    if (rightCount + leftCount === 0) return 0.5; // Neutral if no indicators

    // Right-brain mode = higher attending quality
    const ratio = rightCount / (rightCount + leftCount);

    // Apply sigmoid curve to make middle values more distinct
    const attending = 1 / (1 + Math.exp(-6 * (ratio - 0.5)));

    return attending;
  }

  /**
   * Record observation to database
   */
  private async recordObservation(
    observation: AttendingObservation
  ): Promise<void> {
    const { error } = await this.supabase.from('attending_observations').insert({
      observation_id: observation.observation_id,
      session_id: observation.session_id,
      timestamp: observation.timestamp.toISOString(),
      coherence_score: observation.coherence_score,
      presence_score: observation.presence_score,
      attending_quality: observation.attending_quality,
      notes: observation.notes,
      archetype: observation.archetype,
    });

    if (error) {
      console.error('Failed to record attending observation:', error);
      throw error;
    }
  }

  /**
   * Get session attending summary
   */
  async getSessionSummary(sessionId: string): Promise<SessionAttending | null> {
    const { data: observations, error } = await this.supabase
      .from('attending_observations')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error || !observations || observations.length === 0) {
      return null;
    }

    const avgCoherence =
      observations.reduce((sum, o) => sum + o.coherence_score, 0) /
      observations.length;

    const avgPresence =
      observations.reduce((sum, o) => sum + o.presence_score, 0) /
      observations.length;

    const avgAttending =
      observations.reduce((sum, o) => sum + o.attending_quality, 0) /
      observations.length;

    // Determine trajectory
    let trajectory: 'improving' | 'declining' | 'stable' = 'stable';
    if (observations.length >= 3) {
      const firstThird = observations
        .slice(0, Math.floor(observations.length / 3))
        .reduce((sum, o) => sum + o.attending_quality, 0) /
        Math.floor(observations.length / 3);

      const lastThird = observations
        .slice(-Math.floor(observations.length / 3))
        .reduce((sum, o) => sum + o.attending_quality, 0) /
        Math.floor(observations.length / 3);

      if (lastThird > firstThird + 0.1) trajectory = 'improving';
      else if (lastThird < firstThird - 0.1) trajectory = 'declining';
    }

    return {
      sessionId,
      observations: observations.map((o) => ({
        observation_id: o.observation_id,
        session_id: o.session_id,
        timestamp: new Date(o.timestamp),
        coherence_score: o.coherence_score,
        presence_score: o.presence_score,
        attending_quality: o.attending_quality,
        notes: o.notes,
        archetype: o.archetype,
      })),
      avgCoherence,
      avgPresence,
      avgAttending,
      trajectory,
    };
  }

  /**
   * Get attending quality evolution over time
   */
  async getEvolutionTrend(
    startDate: Date,
    endDate: Date,
    granularity: 'day' | 'week' | 'month' = 'week'
  ): Promise<Array<{
    period: Date;
    avgCoherence: number;
    avgPresence: number;
    avgAttending: number;
    observationCount: number;
  }>> {
    const { data: observations, error } = await this.supabase
      .from('attending_observations')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error || !observations || observations.length === 0) {
      return [];
    }

    // Group by period
    const periods = new Map<
      string,
      {
        coherence: number[];
        presence: number[];
        attending: number[];
      }
    >();

    observations.forEach((obs) => {
      const date = new Date(obs.timestamp);
      let periodKey: string;

      switch (granularity) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!periods.has(periodKey)) {
        periods.set(periodKey, { coherence: [], presence: [], attending: [] });
      }

      const period = periods.get(periodKey)!;
      period.coherence.push(obs.coherence_score);
      period.presence.push(obs.presence_score);
      period.attending.push(obs.attending_quality);
    });

    // Calculate averages
    const trend = Array.from(periods.entries())
      .map(([periodKey, data]) => ({
        period: new Date(periodKey),
        avgCoherence:
          data.coherence.reduce((sum, val) => sum + val, 0) / data.coherence.length,
        avgPresence:
          data.presence.reduce((sum, val) => sum + val, 0) / data.presence.length,
        avgAttending:
          data.attending.reduce((sum, val) => sum + val, 0) / data.attending.length,
        observationCount: data.coherence.length,
      }))
      .sort((a, b) => a.period.getTime() - b.period.getTime());

    return trend;
  }

  /**
   * Get attending quality by archetype
   */
  async getAttendingByArchetype(): Promise<Array<{
    archetype: string;
    avgCoherence: number;
    avgPresence: number;
    avgAttending: number;
    count: number;
  }>> {
    const { data: observations, error } = await this.supabase
      .from('attending_observations')
      .select('*')
      .not('archetype', 'is', null);

    if (error || !observations || observations.length === 0) {
      return [];
    }

    // Group by archetype
    const archetypes = new Map<
      string,
      {
        coherence: number[];
        presence: number[];
        attending: number[];
      }
    >();

    observations.forEach((obs) => {
      const archetype = obs.archetype;
      if (!archetypes.has(archetype)) {
        archetypes.set(archetype, { coherence: [], presence: [], attending: [] });
      }

      const data = archetypes.get(archetype)!;
      data.coherence.push(obs.coherence_score);
      data.presence.push(obs.presence_score);
      data.attending.push(obs.attending_quality);
    });

    // Calculate averages
    const results = Array.from(archetypes.entries())
      .map(([archetype, data]) => ({
        archetype,
        avgCoherence:
          data.coherence.reduce((sum, val) => sum + val, 0) / data.coherence.length,
        avgPresence:
          data.presence.reduce((sum, val) => sum + val, 0) / data.presence.length,
        avgAttending:
          data.attending.reduce((sum, val) => sum + val, 0) / data.attending.length,
        count: data.coherence.length,
      }))
      .sort((a, b) => b.avgAttending - a.avgAttending);

    return results;
  }

  /**
   * Generate attending quality report
   */
  async generateReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: string;
    avgMetrics: {
      coherence: number;
      presence: number;
      attending: number;
    };
    trend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
  }> {
    const { data: observations, error } = await this.supabase
      .from('attending_observations')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error || !observations || observations.length === 0) {
      return {
        summary: 'No observations recorded in this period.',
        avgMetrics: { coherence: 0, presence: 0, attending: 0 },
        trend: 'stable',
        recommendations: ['Start tracking attending quality to build baseline'],
      };
    }

    // Calculate averages
    const avgCoherence =
      observations.reduce((sum, o) => sum + o.coherence_score, 0) /
      observations.length;
    const avgPresence =
      observations.reduce((sum, o) => sum + o.presence_score, 0) /
      observations.length;
    const avgAttending =
      observations.reduce((sum, o) => sum + o.attending_quality, 0) /
      observations.length;

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (observations.length >= 10) {
      const firstQuarter = observations.slice(0, Math.floor(observations.length / 4));
      const lastQuarter = observations.slice(-Math.floor(observations.length / 4));

      const firstAvg =
        firstQuarter.reduce((sum, o) => sum + o.attending_quality, 0) /
        firstQuarter.length;
      const lastAvg =
        lastQuarter.reduce((sum, o) => sum + o.attending_quality, 0) /
        lastQuarter.length;

      if (lastAvg > firstAvg + 0.1) trend = 'improving';
      else if (lastAvg < firstAvg - 0.1) trend = 'declining';
    }

    // Generate summary
    const summary = `
Attending Quality Report (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})

Total Observations: ${observations.length}
Average Coherence: ${(avgCoherence * 100).toFixed(1)}%
Average Presence: ${(avgPresence * 100).toFixed(1)}%
Average Attending Quality: ${(avgAttending * 100).toFixed(1)}%

Trend: ${trend.charAt(0).toUpperCase() + trend.slice(1)}
    `.trim();

    // Generate recommendations
    const recommendations: string[] = [];

    if (avgPresence < 0.6) {
      recommendations.push(
        'Presence is below optimal. Practice staying with not-knowing before responding.'
      );
    }

    if (avgCoherence < 0.7) {
      recommendations.push(
        'Coherence could be improved. Check for contradictions and fragmentation in responses.'
      );
    }

    if (trend === 'declining') {
      recommendations.push(
        'Attending quality is declining. Consider returning to grounding practices and right-brain mode.'
      );
    }

    if (avgAttending > 0.8) {
      recommendations.push(
        'Excellent attending quality! Continue maintaining this level of presence.'
      );
    }

    return {
      summary,
      avgMetrics: {
        coherence: avgCoherence,
        presence: avgPresence,
        attending: avgAttending,
      },
      trend,
      recommendations,
    };
  }
}

export default AttendingQualityTracker;
