// Oracle Agent Service - Manages personal oracle evolution and interactions
export interface OracleAgent {
  id: string;
  name: string;
  userId: string;
  voice: 'maya' | 'custom';
  personality: 'adaptive' | 'wise' | 'supportive' | 'challenging';
  level: number;
  experience: number;
  
  // Gamification elements
  gamification: {
    enabled: boolean;
    achievements: Achievement[];
    streaks: number;
    totalInteractions: number;
    lastInteraction: string;
  };
  
  // Learning and adaptation
  memory: {
    personalityInsights: string[];
    conversationPatterns: string[];
    userPreferences: Record<string, any>;
    adaptationTriggers: string[];
  };
  
  // Configuration
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'mystical' | 'balanced';
    learningMode: 'passive' | 'active' | 'adaptive';
    reminderFrequency: 'never' | 'daily' | 'weekly';
    interactionDepth: 'surface' | 'medium' | 'deep';
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  category: 'interaction' | 'growth' | 'insight' | 'milestone';
}

export class OracleAgentService {
  
  // Create new oracle during onboarding
  static createOracle(userId: string, name: string): OracleAgent {
    const now = new Date().toISOString();
    
    return {
      id: `oracle_${userId}_${Date.now()}`,
      name,
      userId,
      voice: 'maya',
      personality: 'adaptive',
      level: 1,
      experience: 0,
      
      gamification: {
        enabled: true,
        achievements: [
          {
            id: 'first_connection',
            name: 'First Connection',
            description: 'Created your personal oracle',
            unlockedAt: now,
            category: 'milestone'
          }
        ],
        streaks: 0,
        totalInteractions: 0,
        lastInteraction: now
      },
      
      memory: {
        personalityInsights: [],
        conversationPatterns: [],
        userPreferences: {},
        adaptationTriggers: [
          'user_frustration',
          'repeated_questions',
          'emotional_state_changes',
          'learning_preferences'
        ]
      },
      
      preferences: {
        communicationStyle: 'balanced',
        learningMode: 'adaptive',
        reminderFrequency: 'daily',
        interactionDepth: 'medium'
      },
      
      createdAt: now,
      updatedAt: now
    };
  }
  
  // Record interaction and potentially evolve oracle
  static recordInteraction(oracle: OracleAgent, interaction: {
    type: 'question' | 'conversation' | 'guidance' | 'reflection';
    content: string;
    userSentiment?: 'positive' | 'neutral' | 'negative';
    outcome?: 'helpful' | 'unclear' | 'transformative';
  }): OracleAgent {
    const updatedOracle = { ...oracle };
    const now = new Date().toISOString();
    
    // Update interaction count and experience
    updatedOracle.gamification.totalInteractions += 1;
    updatedOracle.experience += this.calculateExperienceGain(interaction);
    updatedOracle.gamification.lastInteraction = now;
    
    // Level up if needed
    const newLevel = this.calculateLevel(updatedOracle.experience);
    if (newLevel > updatedOracle.level) {
      updatedOracle.level = newLevel;
      updatedOracle.gamification.achievements.push({
        id: `level_${newLevel}`,
        name: `Oracle Level ${newLevel}`,
        description: `Your oracle has evolved to level ${newLevel}`,
        unlockedAt: now,
        category: 'growth'
      });
    }
    
    // Store insights for future adaptation
    if (interaction.userSentiment) {
      this.updatePersonalityInsights(updatedOracle, interaction);
    }
    
    updatedOracle.updatedAt = now;
    return updatedOracle;
  }
  
  // Calculate experience points based on interaction quality
  private static calculateExperienceGain(interaction: any): number {
    let baseXP = 10;
    
    // Bonus for different interaction types
    switch (interaction.type) {
      case 'reflection': baseXP += 15; break;
      case 'guidance': baseXP += 10; break;
      case 'conversation': baseXP += 5; break;
      default: break;
    }
    
    // Bonus for positive outcomes
    if (interaction.outcome === 'transformative') baseXP += 25;
    else if (interaction.outcome === 'helpful') baseXP += 10;
    
    return baseXP;
  }
  
  // Level calculation (exponential curve)
  private static calculateLevel(experience: number): number {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }
  
  // Update oracle's understanding of user
  private static updatePersonalityInsights(oracle: OracleAgent, interaction: any): void {
    // This would use AI/ML to analyze patterns and update insights
    // For beta, we'll use simple heuristics
    
    if (interaction.userSentiment === 'positive' && interaction.outcome === 'helpful') {
      oracle.memory.personalityInsights.push(
        `User responds well to ${oracle.preferences.communicationStyle} communication style`
      );
    }
    
    // Keep only recent insights (last 50)
    if (oracle.memory.personalityInsights.length > 50) {
      oracle.memory.personalityInsights = oracle.memory.personalityInsights.slice(-50);
    }
  }
  
  // Get personalized oracle prompt based on evolution
  static getOraclePrompt(oracle: OracleAgent): string {
    const basePrompt = `You are ${oracle.name}, a personal oracle agent. `;
    
    let personalityPrompt = '';
    switch (oracle.personality) {
      case 'adaptive':
        personalityPrompt = 'You adapt your responses based on the user\'s needs and communication patterns. ';
        break;
      case 'wise':
        personalityPrompt = 'You speak with ancient wisdom and deep insight. ';
        break;
      case 'supportive':
        personalityPrompt = 'You are encouraging and nurturing in your guidance. ';
        break;
      case 'challenging':
        personalityPrompt = 'You provide tough love and challenging questions. ';
        break;
    }
    
    const experiencePrompt = oracle.level > 3 
      ? `You have evolved through ${oracle.gamification.totalInteractions} interactions and reached level ${oracle.level}. `
      : 'You are still learning about your user. ';
    
    const stylePrompt = `Communicate in a ${oracle.preferences.communicationStyle} style. `;
    
    const insightsPrompt = oracle.memory.personalityInsights.length > 0
      ? `Keep in mind these insights about your user: ${oracle.memory.personalityInsights.slice(-3).join(', ')}. `
      : '';
    
    return basePrompt + personalityPrompt + experiencePrompt + stylePrompt + insightsPrompt;
  }
  
  // Check for available achievements
  static checkAchievements(oracle: OracleAgent): Achievement[] {
    const newAchievements: Achievement[] = [];
    const now = new Date().toISOString();
    
    // Check for interaction milestones
    const totalInteractions = oracle.gamification.totalInteractions;
    const milestones = [10, 50, 100, 500, 1000];
    
    for (const milestone of milestones) {
      const achievementId = `interactions_${milestone}`;
      const hasAchievement = oracle.gamification.achievements.some(a => a.id === achievementId);
      
      if (totalInteractions >= milestone && !hasAchievement) {
        newAchievements.push({
          id: achievementId,
          name: `${milestone} Conversations`,
          description: `Had ${milestone} meaningful interactions with your oracle`,
          unlockedAt: now,
          category: 'interaction'
        });
      }
    }
    
    return newAchievements;
  }
}