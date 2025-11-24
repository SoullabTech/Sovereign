import { logger } from './logger';

export interface OracleInsight {
  userId: string;
  anon_id?: string; // Added for backward compatibility
  sessionId?: string;
  agentType: string;
  query: string;
  response: string;
  confidence: number;
  metadata?: {
    symbols?: string[];
    archetypes?: string[];
    phase?: string;
    elementalAlignment?: string;
    [key: string]: any; // Allow additional properties for element-specific data
  };
  timestamp: Date;
}

export interface OracleInteraction {
  userId: string;
  sessionId: string;
  action: 'query' | 'response' | 'insight' | 'memory_store' | 'memory_retrieve';
  data?: any;
  duration?: number;
  success: boolean;
  error?: string;
}

class OracleLogger {
  private insights: OracleInsight[] = [];
  private interactions: OracleInteraction[] = [];

  logOracleInsight(insight: Partial<OracleInsight> & { userId: string; agentType: string; query: string; response: string }): void {
    const fullInsight: OracleInsight = {
      confidence: 0.8,
      timestamp: new Date(),
      ...insight
    };

    this.insights.push(fullInsight);
    
    logger.info('Oracle Insight Generated', {
      userId: insight.userId,
      agentType: insight.agentType,
      confidence: fullInsight.confidence,
      queryLength: insight.query.length,
      responseLength: insight.response.length,
      metadata: insight.metadata
    });
  }

  logOracleInteraction(interaction: Partial<OracleInteraction> & { userId: string; action: OracleInteraction['action']; success: boolean }): void {
    const fullInteraction: OracleInteraction = {
      sessionId: `session_${Date.now()}`,
      ...interaction
    };

    this.interactions.push(fullInteraction);

    if (fullInteraction.success) {
      logger.info('Oracle Interaction Success', {
        userId: interaction.userId,
        action: interaction.action,
        sessionId: fullInteraction.sessionId,
        duration: interaction.duration
      });
    } else {
      logger.error('Oracle Interaction Failed', {
        userId: interaction.userId,
        action: interaction.action,
        sessionId: fullInteraction.sessionId,
        error: interaction.error
      });
    }
  }

  getInsights(userId?: string, limit?: number): OracleInsight[] {
    let filtered = userId 
      ? this.insights.filter(insight => insight.userId === userId)
      : this.insights;
    
    // Sort by timestamp, newest first
    filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getInteractions(userId?: string, limit?: number): OracleInteraction[] {
    let filtered = userId 
      ? this.interactions.filter(interaction => interaction.userId === userId)
      : this.interactions;
    
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getStats(userId?: string) {
    const insights = this.getInsights(userId);
    const interactions = this.getInteractions(userId);

    return {
      totalInsights: insights.length,
      totalInteractions: interactions.length,
      successfulInteractions: interactions.filter(i => i.success).length,
      failedInteractions: interactions.filter(i => !i.success).length,
      averageConfidence: insights.length > 0 
        ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
        : 0,
      uniqueAgentTypes: Array.from(new Set(insights.map(i => i.agentType))),
      mostActiveUser: userId || 'N/A'
    };
  }

  clearLogs(userId?: string): void {
    if (userId) {
      this.insights = this.insights.filter(i => i.userId !== userId);
      this.interactions = this.interactions.filter(i => i.userId !== userId);
      logger.info(`Cleared oracle logs for user: ${userId}`);
    } else {
      this.insights = [];
      this.interactions = [];
      logger.info('Cleared all oracle logs');
    }
  }
}

// Create singleton instance
const oracleLogger = new OracleLogger();

// Export main functions
export const logOracleInsight = (insight: Partial<OracleInsight> & { userId: string; agentType: string; query: string; response: string }) => {
  oracleLogger.logOracleInsight(insight);
};

export const logOracleInteraction = (interaction: Partial<OracleInteraction> & { userId: string; action: OracleInteraction['action']; success: boolean }) => {
  oracleLogger.logOracleInteraction(interaction);
};

export const getOracleInsights = (userId?: string, limit?: number) => {
  return oracleLogger.getInsights(userId, limit);
};

export const getOracleInteractions = (userId?: string, limit?: number) => {
  return oracleLogger.getInteractions(userId, limit);
};

export const getOracleStats = (userId?: string) => {
  return oracleLogger.getStats(userId);
};

export const clearOracleLogs = (userId?: string) => {
  oracleLogger.clearLogs(userId);
};

export default oracleLogger;