/**
 * Experiment Tracking and Metrics System
 * Core infrastructure for all SoulLab experiments
 */

import { logger } from '../utils/logger';
import { storeMemoryItem, getRelevantMemories } from '../services/memoryService';

interface BaseMetric {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'scale' | 'count' | 'duration' | 'text';
  description: string;
  unit?: string;
}

interface MetricValue {
  metricId: string;
  value: any;
  timestamp: number;
  notes?: string;
}

interface ExperimentMetrics {
  required: BaseMetric[];
  optional: BaseMetric[];
  derived: DerivedMetric[];
}

interface DerivedMetric extends BaseMetric {
  calculation: (values: MetricValue[]) => any;
  dependencies: string[];
}

interface ExperimentSession {
  experimentId: string;
  experimentType: string;
  userId: string;
  sessionId: string;
  day: number;
  date: string;
  metrics: MetricValue[];
  insights: string[];
  breakthroughs: string[];
  challenges: string[];
  moodBefore: number;  // 1-10
  moodAfter: number;   // 1-10
  notes: string;
  timestamp: number;
}

interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'relationships' | 'shadow' | 'creativity' | 'service' | 'presence';
  hypothesis: string;
  metrics: ExperimentMetrics;
  milestones: Milestone[];
  dailyPractices: DailyPractice[];
}

interface Milestone {
  day: number;
  name: string;
  description: string;
  celebration: string;
}

interface DailyPractice {
  time: 'morning' | 'midday' | 'evening' | 'anytime';
  duration: number; // minutes
  practice: string;
  reminder?: string;
}

interface UserExperiment {
  userId: string;
  experimentId: string;
  templateId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  currentDay: number;
  sessionsCompleted: number;
  streakDays: number;
  longestStreak: number;
  completionRate: number;
  insights: string[];
  breakthroughs: string[];
  patterns: Pattern[];
}

interface Pattern {
  type: 'improvement' | 'resistance' | 'cycle' | 'breakthrough';
  description: string;
  firstSeen: string;
  frequency: number;
  relatedMetrics: string[];
}

export class ExperimentTracking {
  private activeExperiments: Map<string, UserExperiment> = new Map();
  private templates: Map<string, ExperimentTemplate> = new Map();
  private sessions: Map<string, ExperimentSession[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize experiment templates
   */
  private initializeTemplates(): void {
    // Family Dinner Bridge template
    this.templates.set('family_dinner_bridge', {
      id: 'family_dinner_bridge',
      name: 'Family Dinner Bridge',
      description: 'Transform dinner chaos into connection through questions',
      duration: 21,
      difficulty: 'beginner',
      category: 'relationships',
      hypothesis: 'Structured questions create connection across family chaos',
      metrics: {
        required: [
          {
            id: 'conflict_level',
            name: 'Conflict Level',
            type: 'scale',
            description: 'Level of conflict during dinner',
            unit: '0-10'
          },
          {
            id: 'genuine_laughs',
            name: 'Genuine Laughs',
            type: 'count',
            description: 'Number of authentic laughs'
          },
          {
            id: 'voluntary_sharing',
            name: 'Voluntary Sharing',
            type: 'count',
            description: 'Moments of unprompted sharing'
          }
        ],
        optional: [
          {
            id: 'teen_engagement',
            name: 'Teen Engagement',
            type: 'scale',
            description: 'Teenager participation level',
            unit: '0-10'
          },
          {
            id: 'dinner_duration',
            name: 'Dinner Duration',
            type: 'duration',
            description: 'How long dinner lasted',
            unit: 'minutes'
          }
        ],
        derived: [
          {
            id: 'connection_index',
            name: 'Connection Index',
            type: 'number',
            description: 'Overall family connection score',
            calculation: (values) => {
              const conflict = values.find(v => v.metricId === 'conflict_level');
              const laughs = values.find(v => v.metricId === 'genuine_laughs');
              const sharing = values.find(v => v.metricId === 'voluntary_sharing');

              if (!conflict || !laughs || !sharing) return 0;

              return ((10 - conflict.value) + (laughs.value * 2) + (sharing.value * 3)) / 3;
            },
            dependencies: ['conflict_level', 'genuine_laughs', 'voluntary_sharing']
          }
        ]
      },
      milestones: [
        {
          day: 7,
          name: 'Week One Warrior',
          description: 'Completed first week of family bridges',
          celebration: 'Family deserves dessert!'
        },
        {
          day: 14,
          name: 'Halfway Hero',
          description: 'Two weeks of connection building',
          celebration: 'Share favorite moment so far'
        },
        {
          day: 21,
          name: 'Bridge Master',
          description: 'Completed the full experiment',
          celebration: 'Family celebration dinner'
        }
      ],
      dailyPractices: [
        {
          time: 'morning',
          duration: 2,
          practice: 'Choose tonight\'s bridge question',
          reminder: 'What question will open hearts tonight?'
        },
        {
          time: 'evening',
          duration: 30,
          practice: 'Family dinner with bridge question',
          reminder: 'Phones off, hearts open'
        },
        {
          time: 'evening',
          duration: 5,
          practice: 'Document one surprise',
          reminder: 'What unexpected thing emerged?'
        }
      ]
    });

    // Shadow Befriending template
    this.templates.set('shadow_befriending', {
      id: 'shadow_befriending',
      name: 'Shadow Befriending',
      description: 'Transform shadows from enemies to teachers',
      duration: 14,
      difficulty: 'intermediate',
      category: 'shadow',
      hypothesis: 'Shadows lose power when witnessed with curiosity',
      metrics: {
        required: [
          {
            id: 'trigger_intensity',
            name: 'Trigger Intensity',
            type: 'scale',
            description: 'How strong was the trigger',
            unit: '1-10'
          },
          {
            id: 'response_time',
            name: 'Response Time',
            type: 'duration',
            description: 'Time to notice the trigger',
            unit: 'seconds'
          },
          {
            id: 'curiosity_level',
            name: 'Curiosity Level',
            type: 'scale',
            description: 'Curiosity vs judgment ratio',
            unit: '1-10'
          }
        ],
        optional: [
          {
            id: 'shadow_gift',
            name: 'Shadow Gift',
            type: 'text',
            description: 'What gift did the shadow reveal'
          }
        ],
        derived: [
          {
            id: 'shadow_integration',
            name: 'Shadow Integration',
            type: 'number',
            description: 'Level of shadow integration',
            calculation: (values) => {
              const intensity = values.find(v => v.metricId === 'trigger_intensity');
              const curiosity = values.find(v => v.metricId === 'curiosity_level');

              if (!intensity || !curiosity) return 0;

              return (curiosity.value / intensity.value) * 10;
            },
            dependencies: ['trigger_intensity', 'curiosity_level']
          }
        ]
      },
      milestones: [
        {
          day: 3,
          name: 'Shadow Spotter',
          description: 'First shadow witnessed',
          celebration: 'Thank the shadow'
        },
        {
          day: 7,
          name: 'Shadow Friend',
          description: 'Week of shadow work',
          celebration: 'Journal the gifts found'
        },
        {
          day: 14,
          name: 'Shadow Dancer',
          description: 'Two weeks of integration',
          celebration: 'Share your journey'
        }
      ],
      dailyPractices: [
        {
          time: 'anytime',
          duration: 1,
          practice: 'Notice one trigger',
          reminder: 'What activated you?'
        },
        {
          time: 'anytime',
          duration: 2,
          practice: 'Ask: What is this protecting?',
          reminder: 'Curiosity over judgment'
        },
        {
          time: 'evening',
          duration: 3,
          practice: 'Thank the shadow and document gift',
          reminder: 'What wisdom emerged?'
        }
      ]
    });

    // Add more templates as needed...
  }

  /**
   * Start a new experiment for a user
   */
  async startExperiment(
    userId: string,
    templateId: string,
    customizations?: Partial<ExperimentTemplate>
  ): Promise<{
    experimentId: string;
    experiment: UserExperiment;
    firstDay: DailyPractice[];
    welcome: string;
  }> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const experimentId = `${templateId}_${userId}_${Date.now()}`;

    const experiment: UserExperiment = {
      userId,
      experimentId,
      templateId,
      startDate: new Date().toISOString(),
      status: 'active',
      currentDay: 1,
      sessionsCompleted: 0,
      streakDays: 0,
      longestStreak: 0,
      completionRate: 0,
      insights: [],
      breakthroughs: [],
      patterns: []
    };

    this.activeExperiments.set(experimentId, experiment);

    // Store in memory
    await storeMemoryItem(userId, 'EXPERIMENT_START', {
      experimentId,
      templateId,
      startDate: experiment.startDate
    });

    // Generate welcome message
    const welcome = this.generateWelcome(template, userId);

    logger.info('Experiment started', {
      userId,
      experimentId,
      templateId
    });

    return {
      experimentId,
      experiment,
      firstDay: template.dailyPractices,
      welcome
    };
  }

  /**
   * Record a daily session
   */
  async recordSession(
    experimentId: string,
    metrics: MetricValue[],
    notes: string = '',
    moodBefore: number = 5,
    moodAfter: number = 5
  ): Promise<{
    session: ExperimentSession;
    insights: string[];
    milestone?: Milestone;
    streakUpdate: string;
  }> {
    const experiment = this.activeExperiments.get(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    const template = this.templates.get(experiment.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create session
    const sessionId = `session_${Date.now()}`;
    const session: ExperimentSession = {
      experimentId,
      experimentType: experiment.templateId,
      userId: experiment.userId,
      sessionId,
      day: experiment.currentDay,
      date: new Date().toISOString(),
      metrics,
      insights: [],
      breakthroughs: [],
      challenges: [],
      moodBefore,
      moodAfter,
      notes,
      timestamp: Date.now()
    };

    // Calculate derived metrics
    const derivedValues = await this.calculateDerivedMetrics(
      template.metrics.derived,
      metrics
    );
    session.metrics.push(...derivedValues);

    // Analyze for insights
    const insights = await this.analyzeSession(session, experiment, template);
    session.insights = insights;

    // Update experiment
    experiment.currentDay++;
    experiment.sessionsCompleted++;
    experiment.completionRate = (experiment.sessionsCompleted / template.duration) * 100;

    // Update streak
    const streakUpdate = this.updateStreak(experiment);

    // Check for patterns
    const patterns = await this.detectPatterns(experimentId, session);
    experiment.patterns.push(...patterns);

    // Store session
    if (!this.sessions.has(experimentId)) {
      this.sessions.set(experimentId, []);
    }
    this.sessions.get(experimentId)!.push(session);

    // Store in memory
    await storeMemoryItem(experiment.userId, 'EXPERIMENT_SESSION', session);

    // Check for milestone
    const milestone = template.milestones.find(m => m.day === experiment.currentDay - 1);

    return {
      session,
      insights,
      milestone,
      streakUpdate
    };
  }

  /**
   * Calculate derived metrics
   */
  private async calculateDerivedMetrics(
    derivedMetrics: DerivedMetric[],
    values: MetricValue[]
  ): Promise<MetricValue[]> {
    const derived: MetricValue[] = [];

    for (const metric of derivedMetrics) {
      // Check dependencies
      const hasDeps = metric.dependencies.every(dep =>
        values.some(v => v.metricId === dep)
      );

      if (hasDeps) {
        const value = metric.calculation(values);
        derived.push({
          metricId: metric.id,
          value,
          timestamp: Date.now()
        });
      }
    }

    return derived;
  }

  /**
   * Analyze session for insights
   */
  private async analyzeSession(
    session: ExperimentSession,
    experiment: UserExperiment,
    template: ExperimentTemplate
  ): Promise<string[]> {
    const insights: string[] = [];

    // Mood shift insight
    if (session.moodAfter > session.moodBefore + 2) {
      insights.push('Significant mood improvement. The practice is working.');
    }

    // Consistency insight
    if (experiment.streakDays >= 7) {
      insights.push('Week streak! Momentum building.');
    }

    // Breakthrough detection
    const metricImprovements = await this.detectMetricImprovements(
      session,
      experiment.experimentId
    );
    if (metricImprovements.length > 0) {
      insights.push(`Breakthrough: ${metricImprovements[0]}`);
    }

    // Template-specific insights
    switch (template.id) {
      case 'family_dinner_bridge':
        const connection = session.metrics.find(m => m.metricId === 'connection_index');
        if (connection && connection.value >= 8) {
          insights.push('Deep family connection achieved tonight.');
        }
        break;

      case 'shadow_befriending':
        const integration = session.metrics.find(m => m.metricId === 'shadow_integration');
        if (integration && integration.value >= 7) {
          insights.push('Shadow becoming ally. Integration happening.');
        }
        break;
    }

    return insights;
  }

  /**
   * Detect metric improvements
   */
  private async detectMetricImprovements(
    currentSession: ExperimentSession,
    experimentId: string
  ): Promise<string[]> {
    const improvements: string[] = [];
    const previousSessions = this.sessions.get(experimentId) || [];

    if (previousSessions.length < 3) {
      return improvements;
    }

    // Compare with average of last 3 sessions
    const recent = previousSessions.slice(-3);

    for (const metric of currentSession.metrics) {
      const previousValues = recent
        .map(s => s.metrics.find(m => m.metricId === metric.metricId))
        .filter(v => v !== undefined);

      if (previousValues.length > 0) {
        const avgPrevious = previousValues.reduce((sum, v) => sum + Number(v!.value), 0) / previousValues.length;
        const current = Number(metric.value);

        // Check for significant improvement (20%+)
        if (current > avgPrevious * 1.2) {
          improvements.push(`${metric.metricId} improved by ${((current - avgPrevious) / avgPrevious * 100).toFixed(0)}%`);
        }
      }
    }

    return improvements;
  }

  /**
   * Update streak tracking
   */
  private updateStreak(experiment: UserExperiment): string {
    // Check if session was done today
    const today = new Date().toDateString();
    const lastSession = new Date(experiment.startDate);
    lastSession.setDate(lastSession.getDate() + experiment.sessionsCompleted - 1);

    if (lastSession.toDateString() === today) {
      experiment.streakDays++;

      if (experiment.streakDays > experiment.longestStreak) {
        experiment.longestStreak = experiment.streakDays;
        return `New record streak: ${experiment.streakDays} days!`;
      }

      return `Streak continues: ${experiment.streakDays} days`;
    } else {
      // Streak broken
      experiment.streakDays = 1;
      return 'Streak reset. Starting fresh.';
    }
  }

  /**
   * Detect patterns in experiment data
   */
  private async detectPatterns(
    experimentId: string,
    currentSession: ExperimentSession
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const allSessions = this.sessions.get(experimentId) || [];

    if (allSessions.length < 3) {
      return patterns;
    }

    // Look for improvement patterns
    const recentSessions = allSessions.slice(-5);
    const moodTrend = this.calculateTrend(
      recentSessions.map(s => s.moodAfter)
    );

    if (moodTrend > 0.2) {
      patterns.push({
        type: 'improvement',
        description: 'Consistent mood improvement',
        firstSeen: new Date().toISOString(),
        frequency: recentSessions.length,
        relatedMetrics: ['moodAfter']
      });
    }

    // Look for resistance patterns
    if (currentSession.challenges.length > 2) {
      patterns.push({
        type: 'resistance',
        description: 'Multiple challenges encountered',
        firstSeen: new Date().toISOString(),
        frequency: 1,
        relatedMetrics: []
      });
    }

    return patterns;
  }

  /**
   * Calculate trend in values
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Generate welcome message
   */
  private generateWelcome(template: ExperimentTemplate, userId: string): string {
    const welcomes = {
      beginner: `Welcome to ${template.name}. ${template.duration} days. Simple practices. Profound shifts possible.`,
      intermediate: `Ready for ${template.name}? ${template.duration} days of conscious exploration. Let's discover.`,
      advanced: `${template.name} begins. ${template.duration} days of deep work. You're ready for this.`
    };

    return welcomes[template.difficulty];
  }

  /**
   * Get experiment progress
   */
  async getProgress(experimentId: string): Promise<{
    experiment: UserExperiment;
    recentSessions: ExperimentSession[];
    nextMilestone?: Milestone;
    todaysPractices: DailyPractice[];
    insights: string[];
  }> {
    const experiment = this.activeExperiments.get(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    const template = this.templates.get(experiment.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const sessions = this.sessions.get(experimentId) || [];
    const recentSessions = sessions.slice(-5);

    const nextMilestone = template.milestones.find(m => m.day > experiment.currentDay);

    return {
      experiment,
      recentSessions,
      nextMilestone,
      todaysPractices: template.dailyPractices,
      insights: experiment.insights.slice(-5)
    };
  }

  /**
   * Complete or abandon an experiment
   */
  async completeExperiment(
    experimentId: string,
    reason: 'completed' | 'abandoned' = 'completed'
  ): Promise<{
    summary: string;
    achievements: string[];
    recommendations: string[];
  }> {
    const experiment = this.activeExperiments.get(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    experiment.status = reason === 'completed' ? 'completed' : 'abandoned';
    experiment.endDate = new Date().toISOString();

    const template = this.templates.get(experiment.templateId);
    const sessions = this.sessions.get(experimentId) || [];

    // Generate summary
    const summary = this.generateSummary(experiment, template!, sessions);

    // Calculate achievements
    const achievements = this.calculateAchievements(experiment, template!);

    // Generate recommendations
    const recommendations = this.generateRecommendations(experiment, sessions);

    // Store completion
    await storeMemoryItem(experiment.userId, 'EXPERIMENT_COMPLETE', {
      experimentId,
      status: experiment.status,
      summary,
      achievements
    });

    return {
      summary,
      achievements,
      recommendations
    };
  }

  /**
   * Generate experiment summary
   */
  private generateSummary(
    experiment: UserExperiment,
    template: ExperimentTemplate,
    sessions: ExperimentSession[]
  ): string {
    const completionRate = `${experiment.completionRate.toFixed(0)}%`;
    const totalInsights = experiment.insights.length;
    const totalBreakthroughs = experiment.breakthroughs.length;

    if (experiment.status === 'completed') {
      return `${template.name} complete! ${completionRate} completion. ` +
             `${totalInsights} insights discovered. ${totalBreakthroughs} breakthroughs. ` +
             `${experiment.longestStreak} day best streak. Transformation documented.`;
    } else {
      return `${template.name} paused at day ${experiment.currentDay}. ` +
             `${totalInsights} insights gained. ${experiment.longestStreak} day best streak. ` +
             `Seeds planted. Return when ready.`;
    }
  }

  /**
   * Calculate achievements
   */
  private calculateAchievements(
    experiment: UserExperiment,
    template: ExperimentTemplate
  ): string[] {
    const achievements: string[] = [];

    if (experiment.completionRate === 100) {
      achievements.push(`${template.name} Master`);
    }

    if (experiment.longestStreak >= 7) {
      achievements.push('Week Warrior');
    }

    if (experiment.longestStreak >= 14) {
      achievements.push('Consistency Champion');
    }

    if (experiment.breakthroughs.length >= 3) {
      achievements.push('Breakthrough Seeker');
    }

    if (experiment.patterns.filter(p => p.type === 'improvement').length >= 3) {
      achievements.push('Growth Catalyst');
    }

    return achievements;
  }

  /**
   * Generate recommendations for next experiments
   */
  private generateRecommendations(
    experiment: UserExperiment,
    sessions: ExperimentSession[]
  ): string[] {
    const recommendations: string[] = [];

    // Based on category explored
    const template = this.templates.get(experiment.templateId);
    if (!template) return recommendations;

    switch (template.category) {
      case 'relationships':
        recommendations.push('Try Shadow Befriending next - deepen self-understanding');
        break;
      case 'shadow':
        recommendations.push('Try Creative Flow States - express what you discovered');
        break;
      case 'creativity':
        recommendations.push('Try Earth Connection - ground your creativity');
        break;
      case 'presence':
        recommendations.push('Try Couple\'s Backchannel - share presence with partner');
        break;
      case 'service':
        recommendations.push('Try Ancestral Healing - serve the lineage');
        break;
    }

    // Based on success level
    if (experiment.completionRate === 100) {
      recommendations.push('Ready for advanced experiments - challenge yourself');
    } else if (experiment.completionRate >= 50) {
      recommendations.push('Try same experiment again - deeper layers await');
    } else {
      recommendations.push('Try shorter beginner experiment - build momentum');
    }

    return recommendations;
  }
}

// Export singleton
export const experimentTracking = new ExperimentTracking();