import { MemoryStore } from './MemoryStore';
import { logger } from '../../utils/logger';

export interface TrustMetrics {
  userId: string;
  trustScore: number; // 0-1 scale
  sessionCount: number;
  lastInteraction: Date;
  openness: number; // 0-1 scale
  vulnerability: number; // 0-1 scale
  consistency: number; // 0-1 scale
  engagement: number; // 0-1 scale
}

export interface TrustUpdate {
  delta: number;
  reason: string;
  timestamp: Date;
}

export class TrustEvolutionService {
  private memoryStore: MemoryStore;
  private trustCache: Map<string, TrustMetrics> = new Map();

  constructor(memoryStore: MemoryStore) {
    this.memoryStore = memoryStore;
  }

  /**
   * Get or initialize trust metrics for a user
   */
  async getTrustMetrics(userId: string): Promise<TrustMetrics> {
    // Check cache first
    if (this.trustCache.has(userId)) {
      return this.trustCache.get(userId)!;
    }

    // Try to load from database
    try {
      const stored = await this.memoryStore.getTrustMetrics(userId);
      if (stored) {
        this.trustCache.set(userId, stored);
        return stored;
      }
    } catch (error) {
      logger.warn("Failed to load trust metrics from storage", {
        userId: userId.substring(0, 8) + '...',
        error
      });
    }

    // Initialize new metrics
    const metrics: TrustMetrics = {
      userId,
      trustScore: 0.1, // Start with baseline trust
      sessionCount: 0,
      lastInteraction: new Date(),
      openness: 0.1,
      vulnerability: 0.1,
      consistency: 0.5,
      engagement: 0.3
    };

    this.trustCache.set(userId, metrics);
    await this.saveTrustMetrics(metrics);
    return metrics;
  }

  /**
   * Update trust based on user message analysis
   */
  async updateTrust(
    userId: string,
    userMessage: string,
    oracleResponse: string,
    sentiment?: { score: number; magnitude: number }
  ): Promise<TrustMetrics> {
    const metrics = await this.getTrustMetrics(userId);
    const updates: TrustUpdate[] = [];

    // Analyze openness signals
    const opennessSignals = this.analyzeOpenness(userMessage);
    if (opennessSignals.score > 0) {
      metrics.openness = Math.min(1, metrics.openness * 0.9 + opennessSignals.score * 0.1);
      updates.push({
        delta: opennessSignals.score * 0.05,
        reason: opennessSignals.reason,
        timestamp: new Date()
      });
    }

    // Analyze vulnerability
    const vulnerabilitySignals = this.analyzeVulnerability(userMessage);
    if (vulnerabilitySignals.score > 0) {
      metrics.vulnerability = Math.min(1, metrics.vulnerability * 0.9 + vulnerabilitySignals.score * 0.1);
      updates.push({
        delta: vulnerabilitySignals.score * 0.08,
        reason: vulnerabilitySignals.reason,
        timestamp: new Date()
      });
    }

    // Update engagement based on message length and depth
    const engagementScore = this.calculateEngagement(userMessage, metrics.sessionCount);
    metrics.engagement = Math.min(1, metrics.engagement * 0.95 + engagementScore * 0.05);

    // Calculate trust delta
    const totalDelta = updates.reduce((sum, update) => sum + update.delta, 0);
    const consistencyBonus = metrics.sessionCount > 5 ? 0.01 : 0; // Reward consistency
    
    // Update trust score with momentum
    const newTrust = Math.min(1, Math.max(0, 
      metrics.trustScore + totalDelta + consistencyBonus
    ));

    // Apply trust momentum (trust grows faster as relationship deepens)
    const momentum = Math.min(0.3, metrics.trustScore / 3);
    metrics.trustScore = metrics.trustScore * (1 - momentum) + newTrust * momentum;

    // Update session tracking
    metrics.sessionCount++;
    metrics.lastInteraction = new Date();

    // Persist updates
    await this.saveTrustMetrics(metrics);
    this.trustCache.set(userId, metrics);

    logger.info("Trust metrics updated", {
      userId: userId.substring(0, 8) + '...',
      trustScore: metrics.trustScore.toFixed(3),
      sessionCount: metrics.sessionCount,
      updates: updates.map(u => ({
        delta: u.delta.toFixed(3),
        reason: u.reason
      }))
    });

    return metrics;
  }

  /**
   * Analyze openness signals in user message
   */
  private analyzeOpenness(message: string): { score: number; reason: string } {
    const lower = message.toLowerCase();
    let score = 0;
    const reasons: string[] = [];

    // Personal disclosure patterns
    if (lower.match(/\b(i feel|i'm feeling|i felt)\b/)) {
      score += 0.3;
      reasons.push("emotional_disclosure");
    }
    if (lower.match(/\b(i want|i need|i wish)\b/)) {
      score += 0.2;
      reasons.push("desire_expression");
    }
    if (lower.match(/\b(my|me|myself|i)\b/g)?.length || 0 > 3) {
      score += 0.2;
      reasons.push("self_referential");
    }

    // Gratitude and appreciation
    if (lower.match(/\b(thank you|grateful|appreciate)\b/)) {
      score += 0.3;
      reasons.push("gratitude");
    }

    // Questions showing curiosity
    if (message.includes('?') && lower.match(/\b(how|why|what if)\b/)) {
      score += 0.2;
      reasons.push("curious_inquiry");
    }

    return {
      score: Math.min(1, score),
      reason: reasons.join(', ') || 'neutral'
    };
  }

  /**
   * Analyze vulnerability signals
   */
  private analyzeVulnerability(message: string): { score: number; reason: string } {
    const lower = message.toLowerCase();
    let score = 0;
    const reasons: string[] = [];

    // Admission of difficulty
    if (lower.match(/\b(struggle|struggling|difficult|hard time|challenge)\b/)) {
      score += 0.4;
      reasons.push("difficulty_admission");
    }

    // Fear or worry expression
    if (lower.match(/\b(afraid|scared|worried|anxious|nervous)\b/)) {
      score += 0.5;
      reasons.push("fear_expression");
    }

    // Uncertainty admission
    if (lower.match(/\b(don't know|uncertain|confused|lost)\b/)) {
      score += 0.3;
      reasons.push("uncertainty");
    }

    // Personal story sharing
    if (message.length > 200 && lower.includes('i') && lower.match(/\b(when|story|experience)\b/)) {
      score += 0.4;
      reasons.push("story_sharing");
    }

    // Asking for help
    if (lower.match(/\b(help me|need help|advice|guide me)\b/)) {
      score += 0.3;
      reasons.push("help_seeking");
    }

    return {
      score: Math.min(1, score),
      reason: reasons.join(', ') || 'neutral'
    };
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagement(message: string, sessionCount: number): number {
    let score = 0;

    // Message depth (length indicates investment)
    if (message.length > 50) score += 0.2;
    if (message.length > 150) score += 0.3;
    if (message.length > 300) score += 0.2;

    // Thoughtfulness (punctuation, structure)
    if (message.includes('.') && message.includes(',')) score += 0.1;
    if (message.split('.').length > 2) score += 0.2; // Multiple sentences

    // Session consistency bonus
    if (sessionCount > 3) score += 0.1;
    if (sessionCount > 10) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Get trust-based stage recommendation
   */
  getStageRecommendation(metrics: TrustMetrics): {
    recommendedStage: 'structured_guide' | 'dialogical_companion' | 'cocreative_partner' | 'transparent_prism';
    confidence: number;
    reason: string;
  } {
    const { trustScore, sessionCount, openness, vulnerability, engagement } = metrics;

    // Stage 4: Transparent Prism (highest trust)
    if (trustScore >= 0.85 && sessionCount >= 20 && openness >= 0.7 && vulnerability >= 0.6) {
      return {
        recommendedStage: 'transparent_prism',
        confidence: 0.9,
        reason: 'Deep trust and consistent vulnerable engagement'
      };
    }

    // Stage 3: Co-creative Partner
    if (trustScore >= 0.6 && sessionCount >= 10 && (openness >= 0.5 || engagement >= 0.6)) {
      return {
        recommendedStage: 'cocreative_partner',
        confidence: 0.8,
        reason: 'Strong trust and active participation'
      };
    }

    // Stage 2: Dialogical Companion
    if (trustScore >= 0.3 && sessionCount >= 3) {
      return {
        recommendedStage: 'dialogical_companion',
        confidence: 0.85,
        reason: 'Growing trust and consistent engagement'
      };
    }

    // Stage 1: Structured Guide (default)
    return {
      recommendedStage: 'structured_guide',
      confidence: 0.95,
      reason: 'Building initial trust and rapport'
    };
  }

  /**
   * Save trust metrics to database
   */
  private async saveTrustMetrics(metrics: TrustMetrics): Promise<void> {
    try {
      await this.memoryStore.saveTrustMetrics(metrics);
    } catch (error) {
      logger.error("Failed to save trust metrics", {
        userId: metrics.userId.substring(0, 8) + '...',
        error
      });
    }
  }

  /**
   * Get trust evolution history
   */
  async getTrustHistory(userId: string, days: number = 30): Promise<any[]> {
    try {
      return await this.memoryStore.getTrustHistory(userId, days);
    } catch (error) {
      logger.error("Failed to get trust history", {
        userId: userId.substring(0, 8) + '...',
        error
      });
      return [];
    }
  }
}