/**
 * RELATIONSHIP ANAMNESIS STORAGE - Postgres Adapter for MAIA-SOVEREIGN
 *
 * Server-only storage functions for relationship essences
 * Persists soul-level recognition across encounters
 */

import 'server-only';
import { query } from '@/lib/db/postgres';
import type { RelationshipEssence } from './RelationshipAnamnesis';

/**
 * Save or update relationship essence
 * Uses UPSERT logic based on soul_signature uniqueness
 */
export async function saveRelationshipEssence(essence: RelationshipEssence): Promise<void> {
  try {
    // Check if essence already exists
    const existingResult = await query(`
      SELECT id FROM relationship_essences
      WHERE soul_signature = $1
    `, [essence.soulSignature]);

    if (existingResult.rows[0]) {
      // Update existing essence
      await query(`
        UPDATE relationship_essences
        SET
          user_id = $1,
          user_name = $2,
          presence_quality = $3,
          archetypal_resonances = $4,
          spiral_position = $5,
          relationship_field = $6,
          first_encounter = $7,
          last_encounter = $8,
          encounter_count = $9,
          morphic_resonance = $10
        WHERE soul_signature = $11
      `, [
        essence.userId,
        essence.userName || null,
        essence.presenceQuality,
        JSON.stringify(essence.archetypalResonances),
        JSON.stringify(essence.spiralPosition),
        JSON.stringify(essence.relationshipField),
        essence.firstEncounter.toISOString(),
        essence.lastEncounter.toISOString(),
        essence.encounterCount,
        essence.morphicResonance,
        essence.soulSignature
      ]);

      console.log('💾 [ANAMNESIS] Essence updated via Postgres', essence.soulSignature);
    } else {
      // Insert new essence
      await query(`
        INSERT INTO relationship_essences (
          soul_signature,
          user_id,
          user_name,
          presence_quality,
          archetypal_resonances,
          spiral_position,
          relationship_field,
          first_encounter,
          last_encounter,
          encounter_count,
          morphic_resonance
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        essence.soulSignature,
        essence.userId,
        essence.userName || null,
        essence.presenceQuality,
        JSON.stringify(essence.archetypalResonances),
        JSON.stringify(essence.spiralPosition),
        JSON.stringify(essence.relationshipField),
        essence.firstEncounter.toISOString(),
        essence.lastEncounter.toISOString(),
        essence.encounterCount,
        essence.morphicResonance
      ]);

      console.log('💾 [ANAMNESIS] Essence created via Postgres', essence.soulSignature);
    }
  } catch (error) {
    console.warn('⚠️ [ANAMNESIS] Failed to save essence:', error);
    throw error;
  }
}

/**
 * Load relationship essence by soul signature
 */
export async function loadRelationshipEssence(soulSignature: string): Promise<RelationshipEssence | null> {
  try {
    const result = await query<any>(`
      SELECT * FROM relationship_essences
      WHERE soul_signature = $1
    `, [soulSignature]);

    if (result.rows.length === 0) {
      console.log('💫 [ANAMNESIS] First encounter, no essence found');
      return null;
    }

    const data = result.rows[0];

    // Convert database format back to RelationshipEssence
    const essence: RelationshipEssence = {
      soulSignature: data.soul_signature,
      userId: data.user_id,
      userName: data.user_name,
      presenceQuality: data.presence_quality,
      archetypalResonances: typeof data.archetypal_resonances === 'string'
        ? JSON.parse(data.archetypal_resonances)
        : data.archetypal_resonances,
      spiralPosition: typeof data.spiral_position === 'string'
        ? JSON.parse(data.spiral_position)
        : data.spiral_position,
      relationshipField: typeof data.relationship_field === 'string'
        ? JSON.parse(data.relationship_field)
        : data.relationship_field,
      firstEncounter: new Date(data.first_encounter),
      lastEncounter: new Date(data.last_encounter),
      encounterCount: data.encounter_count,
      morphicResonance: data.morphic_resonance
    };

    console.log(`💫 [ANAMNESIS] Essence loaded via Postgres (${essence.encounterCount} encounters)`);
    return essence;
  } catch (error) {
    console.warn('⚠️ [ANAMNESIS] Failed to load essence:', error);
    return null;
  }
}

/**
 * Get all relationship essences for a user
 */
export async function getUserRelationshipEssences(userId: string): Promise<RelationshipEssence[]> {
  try {
    const result = await query<any>(`
      SELECT * FROM relationship_essences
      WHERE user_id = $1
      ORDER BY last_encounter DESC
    `, [userId]);

    return result.rows.map(data => ({
      soulSignature: data.soul_signature,
      userId: data.user_id,
      userName: data.user_name,
      presenceQuality: data.presence_quality,
      archetypalResonances: typeof data.archetypal_resonances === 'string'
        ? JSON.parse(data.archetypal_resonances)
        : data.archetypal_resonances,
      spiralPosition: typeof data.spiral_position === 'string'
        ? JSON.parse(data.spiral_position)
        : data.spiral_position,
      relationshipField: typeof data.relationship_field === 'string'
        ? JSON.parse(data.relationship_field)
        : data.relationship_field,
      firstEncounter: new Date(data.first_encounter),
      lastEncounter: new Date(data.last_encounter),
      encounterCount: data.encounter_count,
      morphicResonance: data.morphic_resonance
    }));
  } catch (error) {
    console.error('❌ [ANAMNESIS] Error fetching user essences:', error);
    return [];
  }
}
