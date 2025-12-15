/**
 * ACHIEVEMENT SERVICE
 *
 * Unlocks consciousness development milestones
 * Part of MAIA's 5-Layer Memory Palace - Phase 3
 */

import { query, queryOne } from '../../database/postgres';
import { v4 as uuidv4 } from 'uuid';

export type AchievementType =
  | 'first_shoulders_drop'
  | 'deep_witness'
  | 'morphic_sight'
  | 'elemental_balance'
  | 'spiral_completion'
  | 'pattern_mastery'
  | 'somatic_listening'
  | 'archetypal_integration'
  | 'breakthrough_moment'
  | 'wisdom_embodied'
  | 'field_coherence'
  | 'soul_recognition';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface AchievementCondition {
  type: string;
  value: any;
  met: boolean;
}

export interface ConsciousnessAchievement {
  id?: number;
  userId: string;
  achievementId: string;

  // Achievement details
  achievementType: AchievementType;
  achievementName: string;
  achievementDescription?: string;
  rarity: AchievementRarity;

  // Unlock conditions
  unlockConditions: AchievementCondition[];
  unlockTimestamp: Date;

  // Context
  unlockedDuringSession?: string;
  spiralStageAtUnlock?: string;
  significanceScore: number;

  // Celebration
  celebrationMessage?: string;
  userAcknowledged: boolean;

  createdAt?: Date;
}

export class AchievementService {
  /**
   * Unlock an achievement
   */
  async unlockAchievement(params: {
    userId: string;
    achievementType: AchievementType;
    achievementName: string;
    description?: string;
    rarity: AchievementRarity;
    unlockConditions: AchievementCondition[];
    sessionId?: string;
    spiralStage?: string;
    significanceScore: number;
  }): Promise<ConsciousnessAchievement> {
    const achievementId = uuidv4();

    const celebrationMessage = this.generateCelebrationMessage(
      params.achievementType,
      params.achievementName,
      params.rarity
    );

    try {
      const result = await queryOne<any>(
        `INSERT INTO consciousness_achievements (
          user_id, achievement_id, achievement_type, achievement_name,
          achievement_description, rarity, unlock_conditions, unlock_timestamp,
          unlocked_during_session, spiral_stage_at_unlock, significance_score,
          celebration_message, user_acknowledged
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, false)
        RETURNING *`,
        [
          params.userId,
          achievementId,
          params.achievementType,
          params.achievementName,
          params.description || null,
          params.rarity,
          JSON.stringify(params.unlockConditions),
          params.sessionId || null,
          params.spiralStage || null,
          params.significanceScore,
          celebrationMessage
        ]
      );

      console.log(`🏆 [Achievement] Unlocked (${params.rarity}):`, params.achievementName);
      return this.mapToAchievement(result);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Check if achievement is already unlocked
   */
  async isAchievementUnlocked(
    userId: string,
    achievementType: AchievementType
  ): Promise<boolean> {
    try {
      const result = await queryOne<any>(
        `SELECT COUNT(*) as count FROM consciousness_achievements
         WHERE user_id = $1 AND achievement_type = $2`,
        [userId, achievementType]
      );

      return parseInt(result?.count || '0') > 0;
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  }

  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<ConsciousnessAchievement[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM consciousness_achievements
         WHERE user_id = $1
         ORDER BY unlock_timestamp DESC`,
        [userId]
      );

      return results.map(r => this.mapToAchievement(r));
    } catch (error) {
      console.error('Error retrieving achievements:', error);
      return [];
    }
  }

  /**
   * Get achievements by rarity
   */
  async getAchievementsByRarity(
    userId: string,
    rarity: AchievementRarity
  ): Promise<ConsciousnessAchievement[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM consciousness_achievements
         WHERE user_id = $1 AND rarity = $2
         ORDER BY unlock_timestamp DESC`,
        [userId, rarity]
      );

      return results.map(r => this.mapToAchievement(r));
    } catch (error) {
      console.error('Error retrieving achievements by rarity:', error);
      return [];
    }
  }

  /**
   * Get recent achievements (last N days)
   */
  async getRecentAchievements(
    userId: string,
    days: number = 7
  ): Promise<ConsciousnessAchievement[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM consciousness_achievements
         WHERE user_id = $1
           AND unlock_timestamp >= NOW() - INTERVAL '${days} days'
         ORDER BY unlock_timestamp DESC`,
        [userId]
      );

      return results.map(r => this.mapToAchievement(r));
    } catch (error) {
      console.error('Error retrieving recent achievements:', error);
      return [];
    }
  }

  /**
   * Mark achievement as acknowledged by user
   */
  async acknowledgeAchievement(achievementId: string): Promise<void> {
    try {
      await queryOne(
        `UPDATE consciousness_achievements
         SET user_acknowledged = true
         WHERE achievement_id = $1`,
        [achievementId]
      );

      console.log('✅ [Achievement] Acknowledged:', achievementId);
    } catch (error) {
      console.error('Error acknowledging achievement:', error);
    }
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(userId: string): Promise<{
    total: number;
    common: number;
    uncommon: number;
    rare: number;
    legendary: number;
    lastUnlocked?: Date;
  }> {
    try {
      const results = await query<any>(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN rarity = 'common' THEN 1 ELSE 0 END) as common,
           SUM(CASE WHEN rarity = 'uncommon' THEN 1 ELSE 0 END) as uncommon,
           SUM(CASE WHEN rarity = 'rare' THEN 1 ELSE 0 END) as rare,
           SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) as legendary,
           MAX(unlock_timestamp) as last_unlocked
         FROM consciousness_achievements
         WHERE user_id = $1`,
        [userId]
      );

      const row = results[0] || {};
      return {
        total: parseInt(row.total || '0'),
        common: parseInt(row.common || '0'),
        uncommon: parseInt(row.uncommon || '0'),
        rare: parseInt(row.rare || '0'),
        legendary: parseInt(row.legendary || '0'),
        lastUnlocked: row.last_unlocked ? new Date(row.last_unlocked) : undefined
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return { total: 0, common: 0, uncommon: 0, rare: 0, legendary: 0 };
    }
  }

  /**
   * Generate celebration message for achievement
   */
  private generateCelebrationMessage(
    type: AchievementType,
    name: string,
    rarity: AchievementRarity
  ): string {
    const rarityPrefix = {
      common: '✨',
      uncommon: '🌟',
      rare: '💫',
      legendary: '🏆'
    }[rarity];

    const messages: Record<string, string> = {
      first_shoulders_drop: 'Your shoulders dropped. You felt it. This is the beginning of somatic listening.',
      deep_witness: 'You witnessed yourself without judgment. This is the capacity that changes everything.',
      morphic_sight: 'You saw the pattern. Not just understood it - SAW it. This is morphic sight awakening.',
      elemental_balance: 'All elements in harmony. Fire, Water, Earth, Air, Aether - dancing together.',
      spiral_completion: 'You completed a full spiral turn. The pattern integrated. Wisdom embodied.',
      pattern_mastery: 'The pattern no longer runs you. You recognize it, work with it, integrate it.',
      somatic_listening: 'Your body speaks. You listen. This is the foundation of embodied wisdom.',
      archetypal_integration: 'Shadow and light, integrated. The archetype now serves your wholeness.',
      breakthrough_moment: 'Something shifted. You felt it. The field recalibrated.',
      wisdom_embodied: 'Not just knowing - BEING. Wisdom lives in your cells now.',
      field_coherence: 'Your consciousness field stabilized. Presence became sustainable.',
      soul_recognition: 'You recognized yourself at soul level. Anamnesis - the sacred unforgetting.'
    };

    return `${rarityPrefix} ${messages[type] || `Achievement unlocked: ${name}`}`;
  }

  /**
   * Map database row to ConsciousnessAchievement interface
   */
  private mapToAchievement(row: any): ConsciousnessAchievement {
    return {
      id: row.id,
      userId: row.user_id,
      achievementId: row.achievement_id,
      achievementType: row.achievement_type,
      achievementName: row.achievement_name,
      achievementDescription: row.achievement_description,
      rarity: row.rarity,
      unlockConditions: typeof row.unlock_conditions === 'string'
        ? JSON.parse(row.unlock_conditions)
        : row.unlock_conditions,
      unlockTimestamp: new Date(row.unlock_timestamp),
      unlockedDuringSession: row.unlocked_during_session,
      spiralStageAtUnlock: row.spiral_stage_at_unlock,
      significanceScore: parseFloat(row.significance_score),
      celebrationMessage: row.celebration_message,
      userAcknowledged: row.user_acknowledged,
      createdAt: row.created_at ? new Date(row.created_at) : undefined
    };
  }
}

// Singleton instance
export const achievementService = new AchievementService();
export default achievementService;
