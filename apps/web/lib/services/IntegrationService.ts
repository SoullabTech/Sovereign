// Integration Service - Handles integration of spiritual insights and practices
export interface IntegrationSession {
  id: string;
  userId: string;
  type: 'insight' | 'practice' | 'shadow_work' | 'archetypal' | 'elemental';
  content: string;
  insights: string[];
  practices: string[];
  integrationLevel: 'surface' | 'developing' | 'deep' | 'embodied';
  duration: number; // in minutes
  timestamp: string;
  followUpRequired: boolean;
}

export interface IntegrationPlan {
  userId: string;
  currentFocus: string;
  sessions: IntegrationSession[];
  practices: IntegrationPractice[];
  milestones: IntegrationMilestone[];
  nextReview: string;
  progress: {
    completedSessions: number;
    totalHours: number;
    deepIntegrations: number;
    embodiedInsights: number;
  };
}

export interface IntegrationPractice {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  description: string;
  instructions: string[];
  frequency: number;
  completed: number;
  lastCompleted?: string;
  effectivenessRating: number; // 1-10 scale
}

export interface IntegrationMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  evidence: string[];
}

export interface IntegrationResponse {
  success: boolean;
  session?: IntegrationSession;
  plan?: IntegrationPlan;
  recommendations?: string[];
  nextSteps?: string[];
  error?: string;
}

export class IntegrationService {
  private sessions: Map<string, IntegrationSession[]> = new Map();
  private plans: Map<string, IntegrationPlan> = new Map();

  async createSession(
    userId: string,
    type: IntegrationSession['type'],
    content: string,
    duration: number = 30
  ): Promise<IntegrationResponse> {
    try {
      const insights = this.extractInsights(content);
      const practices = this.recommendPractices(type, content);
      const integrationLevel = this.assessIntegrationLevel(content);

      const session: IntegrationSession = {
        id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        content,
        insights,
        practices,
        integrationLevel,
        duration,
        timestamp: new Date().toISOString(),
        followUpRequired: integrationLevel === 'surface' || integrationLevel === 'developing'
      };

      // Store session
      const userSessions = this.sessions.get(userId) || [];
      userSessions.unshift(session);
      this.sessions.set(userId, userSessions);

      // Update integration plan
      await this.updateIntegrationPlan(userId, session);

      return {
        success: true,
        session,
        recommendations: this.generateRecommendations(session),
        nextSteps: this.getNextSteps(session)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create integration session'
      };
    }
  }

  async getIntegrationPlan(userId: string): Promise<IntegrationResponse> {
    try {
      let plan = this.plans.get(userId);
      
      if (!plan) {
        plan = await this.createInitialPlan(userId);
        this.plans.set(userId, plan);
      }

      return {
        success: true,
        plan,
        recommendations: this.generatePlanRecommendations(plan),
        nextSteps: this.getPlanNextSteps(plan)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get integration plan'
      };
    }
  }

  async updatePractice(
    userId: string,
    practiceId: string,
    completed: boolean,
    effectivenessRating?: number
  ): Promise<IntegrationResponse> {
    try {
      const plan = this.plans.get(userId);
      if (!plan) {
        return {
          success: false,
          error: 'Integration plan not found'
        };
      }

      const practice = plan.practices.find(p => p.id === practiceId);
      if (!practice) {
        return {
          success: false,
          error: 'Practice not found'
        };
      }

      if (completed) {
        practice.completed++;
        practice.lastCompleted = new Date().toISOString();
      }

      if (effectivenessRating !== undefined) {
        practice.effectivenessRating = effectivenessRating;
      }

      this.plans.set(userId, plan);

      return {
        success: true,
        plan,
        recommendations: ['Great work on your practice! Keep building consistency.']
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update practice'
      };
    }
  }

  async completeMilestone(
    userId: string,
    milestoneId: string,
    evidence: string[]
  ): Promise<IntegrationResponse> {
    try {
      const plan = this.plans.get(userId);
      if (!plan) {
        return {
          success: false,
          error: 'Integration plan not found'
        };
      }

      const milestone = plan.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        return {
          success: false,
          error: 'Milestone not found'
        };
      }

      milestone.completed = true;
      milestone.completedDate = new Date().toISOString();
      milestone.evidence = evidence;

      // Update progress
      plan.progress.embodiedInsights++;

      this.plans.set(userId, plan);

      return {
        success: true,
        plan,
        recommendations: [
          'Congratulations on reaching this milestone!',
          'Take time to celebrate your growth',
          'Reflect on how this achievement changes your perspective'
        ],
        nextSteps: this.getPlanNextSteps(plan)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete milestone'
      };
    }
  }

  async getSessionHistory(
    userId: string,
    type?: IntegrationSession['type'],
    limit: number = 20
  ): Promise<IntegrationSession[]> {
    const userSessions = this.sessions.get(userId) || [];
    
    let filteredSessions = userSessions;
    if (type) {
      filteredSessions = userSessions.filter(s => s.type === type);
    }

    return filteredSessions.slice(0, limit);
  }

  // Private helper methods

  private extractInsights(content: string): string[] {
    const insights: string[] = [];
    const insightKeywords = [
      'realize', 'understand', 'discover', 'learn', 'insight',
      'awareness', 'recognition', 'clarity', 'breakthrough'
    ];

    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (insightKeywords.some(keyword => lower.includes(keyword))) {
        insights.push(sentence.trim());
      }
    });

    // Add general insights if none found
    if (insights.length === 0) {
      insights.push('New awareness emerging from this experience');
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private recommendPractices(type: IntegrationSession['type'], content: string): string[] {
    const practicesByType = {
      insight: [
        'Daily journaling to deepen understanding',
        'Meditation on the insight for 10 minutes daily',
        'Share the insight with a trusted friend'
      ],
      practice: [
        'Continue the practice for 7 consecutive days',
        'Track your experience in a practice journal',
        'Adapt the practice to your daily routine'
      ],
      shadow_work: [
        'Shadow dialogue writing exercise',
        'Gentle self-compassion practice',
        'Integration through creative expression'
      ],
      archetypal: [
        'Active imagination with the archetype',
        'Study myths related to this archetypal pattern',
        'Embody the archetype in daily life'
      ],
      elemental: [
        'Elemental meditation practice',
        'Connect with the element in nature',
        'Balance with complementary elements'
      ]
    };

    return practicesByType[type] || practicesByType.insight;
  }

  private assessIntegrationLevel(content: string): IntegrationSession['integrationLevel'] {
    const lower = content.toLowerCase();
    
    const embodiedWords = ['embody', 'live', 'become', 'am', 'natural', 'automatic'];
    const deepWords = ['transform', 'change', 'shift', 'different', 'new way'];
    const developingWords = ['practice', 'work on', 'trying', 'learning'];
    
    if (embodiedWords.some(word => lower.includes(word))) {
      return 'embodied';
    } else if (deepWords.some(word => lower.includes(word))) {
      return 'deep';
    } else if (developingWords.some(word => lower.includes(word))) {
      return 'developing';
    } else {
      return 'surface';
    }
  }

  private async updateIntegrationPlan(userId: string, session: IntegrationSession): Promise<void> {
    let plan = this.plans.get(userId);
    
    if (!plan) {
      plan = await this.createInitialPlan(userId);
    }

    // Add session to plan
    plan.sessions.unshift(session);

    // Update progress
    plan.progress.completedSessions++;
    plan.progress.totalHours += session.duration / 60;
    
    if (session.integrationLevel === 'deep') {
      plan.progress.deepIntegrations++;
    }
    if (session.integrationLevel === 'embodied') {
      plan.progress.embodiedInsights++;
    }

    // Update current focus based on recent sessions
    plan.currentFocus = this.determineFocus(plan.sessions.slice(0, 5));

    this.plans.set(userId, plan);
  }

  private async createInitialPlan(userId: string): Promise<IntegrationPlan> {
    const plan: IntegrationPlan = {
      userId,
      currentFocus: 'Foundation Building',
      sessions: [],
      practices: this.createInitialPractices(),
      milestones: this.createInitialMilestones(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      progress: {
        completedSessions: 0,
        totalHours: 0,
        deepIntegrations: 0,
        embodiedInsights: 0
      }
    };

    return plan;
  }

  private createInitialPractices(): IntegrationPractice[] {
    return [
      {
        id: 'daily_reflection',
        name: 'Daily Reflection',
        type: 'daily',
        description: 'Brief daily check-in with your inner state',
        instructions: [
          'Take 5 minutes each evening',
          'Reflect on the day\'s experiences',
          'Notice patterns and insights',
          'Record key observations'
        ],
        frequency: 1,
        completed: 0,
        effectivenessRating: 7
      },
      {
        id: 'weekly_integration',
        name: 'Weekly Integration Review',
        type: 'weekly',
        description: 'Deeper review of weekly insights and patterns',
        instructions: [
          'Review the week\'s reflections',
          'Identify recurring themes',
          'Set intentions for integration',
          'Plan specific actions'
        ],
        frequency: 1,
        completed: 0,
        effectivenessRating: 8
      }
    ];
  }

  private createInitialMilestones(): IntegrationMilestone[] {
    const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'consistent_practice',
        title: 'Establish Consistent Practice',
        description: 'Complete daily reflections for 21 consecutive days',
        targetDate: oneMonth.toISOString(),
        completed: false,
        evidence: []
      },
      {
        id: 'deep_insight',
        title: 'Achieve Deep Integration',
        description: 'Have at least 3 deep integration sessions',
        targetDate: threeMonths.toISOString(),
        completed: false,
        evidence: []
      }
    ];
  }

  private determineFocus(recentSessions: IntegrationSession[]): string {
    if (recentSessions.length === 0) {
      return 'Foundation Building';
    }

    const typeCount = recentSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0];

    const focusByType = {
      insight: 'Insight Integration',
      practice: 'Practice Development',
      shadow_work: 'Shadow Integration',
      archetypal: 'Archetypal Embodiment',
      elemental: 'Elemental Balance'
    };

    return focusByType[dominantType as keyof typeof focusByType] || 'Holistic Integration';
  }

  private generateRecommendations(session: IntegrationSession): string[] {
    const recommendations = [];

    switch (session.integrationLevel) {
      case 'surface':
        recommendations.push('Deepen this insight through contemplation and practice');
        break;
      case 'developing':
        recommendations.push('Continue working with this awareness in daily life');
        break;
      case 'deep':
        recommendations.push('Share this transformation with others who might benefit');
        break;
      case 'embodied':
        recommendations.push('You\'ve embodied this wisdom - consider teaching or mentoring others');
        break;
    }

    if (session.followUpRequired) {
      recommendations.push('Schedule a follow-up session within the next week');
    }

    recommendations.push('Document your progress in your integration journal');

    return recommendations;
  }

  private getNextSteps(session: IntegrationSession): string[] {
    return [
      'Practice the recommended integration exercises',
      'Monitor how this insight affects your daily life',
      'Note any resistance or challenges that arise',
      'Celebrate your growth and progress'
    ];
  }

  private generatePlanRecommendations(plan: IntegrationPlan): string[] {
    const recommendations = [];

    if (plan.progress.completedSessions < 5) {
      recommendations.push('Build consistency with regular integration sessions');
    }

    if (plan.progress.deepIntegrations < 2) {
      recommendations.push('Focus on deepening your integration work');
    }

    const incompleteMilestones = plan.milestones.filter(m => !m.completed);
    if (incompleteMilestones.length > 0) {
      recommendations.push(`Work toward your next milestone: ${incompleteMilestones[0].title}`);
    }

    return recommendations;
  }

  private getPlanNextSteps(plan: IntegrationPlan): string[] {
    const nextSteps = [];

    const upcomingMilestone = plan.milestones.find(m => !m.completed);
    if (upcomingMilestone) {
      nextSteps.push(`Focus on milestone: ${upcomingMilestone.title}`);
    }

    const incompletePractices = plan.practices.filter(p => p.completed === 0);
    if (incompletePractices.length > 0) {
      nextSteps.push(`Start practice: ${incompletePractices[0].name}`);
    }

    nextSteps.push('Schedule your next integration session');
    nextSteps.push('Review your progress regularly');

    return nextSteps;
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();

// Default export
export default IntegrationService;