/**
 * RELATIONSHIP ANAMNESIS - DIRECT DATABASE ACCESS
 *
 * Workaround for PostgREST schema cache issues
 * Uses service role key for direct SQL queries
 */

import type { RelationshipEssence } from './RelationshipAnamnesis';

const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL!;
const dbServiceKey = process.env.DATABASE_SERVICE_KEY!;


export async function saveRelationshipEssenceDirect(essence: RelationshipEssence): Promise<void> {
  console.log('🔵 [ANAMNESIS-DIRECT] saveRelationshipEssenceDirect called!');

  if (!dbUrl || !dbServiceKey) {
    console.warn('⚠️ [ANAMNESIS-DIRECT] Supabase not configured');
    return;
  }

  try {
    // Use raw SQL query to bypass REST API cache
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO relationship_essence (
          user_id, soul_signature, user_name, presence_quality,
          archetypal_resonances, spiral_position, relationship_field,
          first_encounter, last_encounter, encounter_count, morphic_resonance
        ) VALUES (
          $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10, $11
        )
        ON CONFLICT (soul_signature) DO UPDATE SET
          user_name = $3,
          presence_quality = $4,
          archetypal_resonances = $5::jsonb,
          spiral_position = $6::jsonb,
          relationship_field = $7::jsonb,
          last_encounter = $9,
          encounter_count = $10,
          morphic_resonance = $11
        RETURNING id;
      `,
      params: [
        essence.userId,
        essence.soulSignature,
        essence.userName || null,
        essence.presenceQuality,
        JSON.stringify(essence.archetypalResonances),
        JSON.stringify(essence.spiralPosition),
        JSON.stringify(essence.relationshipField),
        essence.firstEncounter.toISOString(),
        essence.lastEncounter.toISOString(),
        essence.encounterCount,
        essence.morphicResonance
      ]
    });

    if (error) {
      console.log('⚠️ [ANAMNESIS-DIRECT] RPC not available, trying alternative...');

      // Fallback: Try standard insert (might work after cache refresh)
      const essenceData = {
        user_id: essence.userId,
        soul_signature: essence.soulSignature,
        user_name: essence.userName || null,
        presence_quality: essence.presenceQuality,
        archetypal_resonances: essence.archetypalResonances,
        spiral_position: essence.spiralPosition,
        relationship_field: essence.relationshipField,
        first_encounter: essence.firstEncounter.toISOString(),
        last_encounter: essence.lastEncounter.toISOString(),
        encounter_count: essence.encounterCount,
        morphic_resonance: essence.morphicResonance
      };

      const { error: insertError } = await supabaseAdmin
        .from('relationship_essence')
        .upsert(essenceData, { onConflict: 'soul_signature' });

      if (insertError) throw insertError;

      // Invalidate cache after successful save
      const { CacheInvalidation } = await import('@/lib/utils/performance-cache');
      CacheInvalidation.onRelationshipEssenceUpdate(essence.soulSignature);
    }

    console.log('💾 [ANAMNESIS-DIRECT] Essence saved');
  } catch (error: any) {
    console.error('❌ [ANAMNESIS-DIRECT] Failed to save:', error.message);
  }
}

export async function loadRelationshipEssenceDirect(soulSignature: string): Promise<RelationshipEssence | null> {
  console.log('🔵 [ANAMNESIS-DIRECT] loadRelationshipEssenceDirect called!');

  if (!dbUrl || !dbServiceKey) {
    console.warn('⚠️ [ANAMNESIS-DIRECT] Supabase not configured');
    return null;
  }

  // Import performance cache
  const { performanceCache, CacheKeys } = await import('@/lib/utils/performance-cache');

  try {
    // Use cache for relationship essence lookup (high hit rate expected)
    return await performanceCache.getOrSet(
      CacheKeys.relationshipEssence(soulSignature),
      async () => {
        // Cache miss - fetch from database
        const { data, error } = await supabaseAdmin
          .from('relationship_essence')
          .select('*')
          .eq('soul_signature', soulSignature)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // No essence found
          }
          throw error;
        }

        if (!data) return null;

        const essence: RelationshipEssence = {
          soulSignature: data.soul_signature,
          userId: data.user_id,
          userName: data.user_name,
          presenceQuality: data.presence_quality,
          archetypalResonances: data.archetypal_resonances,
          spiralPosition: data.spiral_position,
          relationshipField: data.relationship_field,
          firstEncounter: new Date(data.first_encounter),
          lastEncounter: new Date(data.last_encounter),
          encounterCount: data.encounter_count,
          morphicResonance: data.morphic_resonance
        };

        console.log(`💫 [ANAMNESIS-DIRECT] Essence loaded from DB (${essence.encounterCount} encounters)`);
        return essence;
      },
      'relationship_essence'
    );
  } catch (error: any) {
    console.error('❌ [ANAMNESIS-DIRECT] Failed to load:', error.message);
    return null;
  }
}
