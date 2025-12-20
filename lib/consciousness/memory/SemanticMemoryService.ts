/**
 * SEMANTIC MEMORY SERVICE
 *
 * Tracks concept learning and mastery over time
 * Part of MAIA's 5-Layer Memory Palace - Layer 2
 */

import { query, queryOne } from '../../database/postgres';
import { v4 as uuidv4 } from 'uuid';

export type ConceptCategory = 'framework' | 'archetype' | 'somatic_pattern' | 'element' | 'stage' | 'practice';

export interface UserDemonstration {
  timestamp: Date;
  context: string;
  quality: number; // 1-10
}

export interface SemanticMemory {
  id?: number;
  userId: string;
  conceptId: string;

  // Concept data
  conceptName: string;
  conceptCategory?: ConceptCategory;
  definition?: string;

  // Learning progression
  firstEncounter: Date;
  lastReinforcement: Date;
  masteryLevel: number; // 1-10
  understandingDepth: number; // 0-1

  // Application tracking
  timesApplied: number;
  successfulApplications: number;
  contextsUsed: string[];

  // Integration
  relatedConcepts: string[];
  prerequisiteConcepts: string[];
  buildsTowardConcepts: string[];

  // Evidence of understanding
  userDemonstrations: UserDemonstration[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class SemanticMemoryService {
  /**
   * Introduce a new concept or reinforce existing one
   */
  async trackConcept(params: {
    userId: string;
    conceptName: string;
    category?: ConceptCategory;
    definition?: string;
    context?: string;
    demonstrationQuality?: number;
  }): Promise<SemanticMemory> {
    const conceptId = this.generateConceptId(params.conceptName);

    // Check if concept already exists
    const existing = await this.getConcept(params.userId, conceptId);

    if (existing) {
      // Reinforce existing concept
      return this.reinforceConcept(
        conceptId,
        params.userId,
        params.context,
        params.demonstrationQuality
      );
    }

    // Create new concept
    try {
      const result = await queryOne<any>(
        `INSERT INTO semantic_memories (
          user_id, concept_id, concept_name, concept_category, definition,
          mastery_level, understanding_depth, times_applied
        ) VALUES ($1, $2, $3, $4, $5, 1, 0.1, 0)
        RETURNING *`,
        [
          params.userId,
          conceptId,
          params.conceptName,
          params.category || null,
          params.definition || null
        ]
      );

      console.log('🧠 [Semantic] New concept tracked:', params.conceptName);
      return this.mapToSemanticMemory(result);
    } catch (error) {
      console.error('Error tracking concept:', error);
      throw error;
    }
  }

  /**
   * Reinforce existing concept (deepens mastery)
   */
  async reinforceConcept(
    conceptId: string,
    userId: string,
    context?: string,
    demonstrationQuality?: number
  ): Promise<SemanticMemory> {
    const demonstration: UserDemonstration | null = demonstrationQuality ? {
      timestamp: new Date(),
      context: context || '',
      quality: demonstrationQuality
    } : null;

    try {
      const result = await queryOne<any>(
        `UPDATE semantic_memories
         SET
           last_reinforcement = NOW(),
           mastery_level = LEAST(mastery_level + 1, 10),
           understanding_depth = LEAST(understanding_depth + 0.1, 1.0),
           user_demonstrations = CASE
             WHEN $3::jsonb IS NOT NULL THEN user_demonstrations || $3::jsonb
             ELSE user_demonstrations
           END,
           updated_at = NOW()
         WHERE concept_id = $1 AND user_id = $2
         RETURNING *`,
        [conceptId, userId, demonstration ? JSON.stringify([demonstration]) : null]
      );

      console.log('📈 [Semantic] Concept reinforced:', conceptId);
      return this.mapToSemanticMemory(result!);
    } catch (error) {
      console.error('Error reinforcing concept:', error);
      throw error;
    }
  }

  /**
   * Record successful application of a concept
   */
  async recordApplication(
    conceptId: string,
    userId: string,
    context: string,
    successful: boolean = true
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE semantic_memories
         SET
           times_applied = times_applied + 1,
           successful_applications = successful_applications + $3,
           contexts_used = array_append(contexts_used, $4),
           updated_at = NOW()
         WHERE concept_id = $1 AND user_id = $2`,
        [conceptId, userId, successful ? 1 : 0, context]
      );

      console.log('✅ [Semantic] Application recorded:', conceptId, successful ? 'success' : 'attempt');
    } catch (error) {
      console.error('Error recording application:', error);
    }
  }

  /**
   * Link concepts together (prerequisite, related, builds toward)
   */
  async linkConcepts(
    conceptId: string,
    userId: string,
    relatedConceptId: string,
    linkType: 'related' | 'prerequisite' | 'builds_toward'
  ): Promise<void> {
    const field = linkType === 'related'
      ? 'related_concepts'
      : linkType === 'prerequisite'
      ? 'prerequisite_concepts'
      : 'builds_toward_concepts';

    try {
      await queryOne(
        `UPDATE semantic_memories
         SET ${field} = array_append(${field}, $3),
             updated_at = NOW()
         WHERE concept_id = $1 AND user_id = $2`,
        [conceptId, userId, relatedConceptId]
      );

      console.log('🔗 [Semantic] Concepts linked:', linkType);
    } catch (error) {
      console.error('Error linking concepts:', error);
    }
  }

  /**
   * Get concept by ID
   */
  async getConcept(userId: string, conceptId: string): Promise<SemanticMemory | null> {
    try {
      const result = await queryOne<any>(
        `SELECT * FROM semantic_memories
         WHERE user_id = $1 AND concept_id = $2`,
        [userId, conceptId]
      );

      return result ? this.mapToSemanticMemory(result) : null;
    } catch (error) {
      console.error('Error getting concept:', error);
      return null;
    }
  }

  /**
   * Get all concepts for a user
   */
  async getUserConcepts(
    userId: string,
    category?: ConceptCategory
  ): Promise<SemanticMemory[]> {
    try {
      const results = category
        ? await query<any>(
            `SELECT * FROM semantic_memories
             WHERE user_id = $1 AND concept_category = $2
             ORDER BY mastery_level DESC, last_reinforcement DESC`,
            [userId, category]
          )
        : await query<any>(
            `SELECT * FROM semantic_memories
             WHERE user_id = $1
             ORDER BY mastery_level DESC, last_reinforcement DESC`,
            [userId]
          );

      return results.map(r => this.mapToSemanticMemory(r));
    } catch (error) {
      console.error('Error retrieving user concepts:', error);
      return [];
    }
  }

  /**
   * Get mastered concepts (mastery level >= 7)
   */
  async getMasteredConcepts(userId: string): Promise<SemanticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM semantic_memories
         WHERE user_id = $1 AND mastery_level >= 7
         ORDER BY mastery_level DESC`,
        [userId]
      );

      return results.map(r => this.mapToSemanticMemory(r));
    } catch (error) {
      console.error('Error retrieving mastered concepts:', error);
      return [];
    }
  }

  /**
   * Get concepts being learned (mastery level 1-3)
   */
  async getLearningConcepts(userId: string): Promise<SemanticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM semantic_memories
         WHERE user_id = $1 AND mastery_level BETWEEN 1 AND 3
         ORDER BY last_reinforcement DESC`,
        [userId]
      );

      return results.map(r => this.mapToSemanticMemory(r));
    } catch (error) {
      console.error('Error retrieving learning concepts:', error);
      return [];
    }
  }

  /**
   * Generate concept ID from concept name
   */
  private generateConceptId(conceptName: string): string {
    return conceptName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Map database row to SemanticMemory interface
   */
  private mapToSemanticMemory(row: any): SemanticMemory {
    return {
      id: row.id,
      userId: row.user_id,
      conceptId: row.concept_id,
      conceptName: row.concept_name,
      conceptCategory: row.concept_category,
      definition: row.definition,
      firstEncounter: new Date(row.first_encounter),
      lastReinforcement: new Date(row.last_reinforcement),
      masteryLevel: row.mastery_level,
      understandingDepth: parseFloat(row.understanding_depth),
      timesApplied: row.times_applied,
      successfulApplications: row.successful_applications,
      contextsUsed: row.contexts_used || [],
      relatedConcepts: row.related_concepts || [],
      prerequisiteConcepts: row.prerequisite_concepts || [],
      buildsTowardConcepts: row.builds_toward_concepts || [],
      userDemonstrations: typeof row.user_demonstrations === 'string'
        ? JSON.parse(row.user_demonstrations)
        : row.user_demonstrations || [],
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }
}

// Singleton instance
export const semanticMemoryService = new SemanticMemoryService();
export default semanticMemoryService;
