/**
 * Episode Service
 *
 * Handles all episode-related operations for the bardic memory system.
 * Episodes are "rooms that can be re-entered" - lived moments with portals.
 *
 * @module lib/services/episode-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Episode,
  EpisodeVector,
  ElementalState,
  SenseCues,
} from '../types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

// ============================================================================
// EPISODE CREATION
// ============================================================================

export interface CreateEpisodeParams {
  userId: string;
  datetime?: Date;

  // The Stanza (poetic compression)
  sceneStanza?: string;
  transcriptLink?: string;

  // Place & Sense Cues
  placeCue?: string;
  senseCues?: SenseCues;
  people?: string[];

  // Affect Binding
  affectValence?: number; // -1 to 1
  affectArousal?: number; // 0 to 1
  affectKeywords?: string[];

  // Elemental State
  elementalState?: ElementalState;
  dominantElement?: 'fire' | 'air' | 'water' | 'earth' | 'aether';
  currentFacet?: string;

  // Threshold Markers
  isRecalibration?: boolean;
  recalibrationType?: 'liminal' | 'death_rebirth' | 'integration' | 'breakthrough';

  // Sacred Boundary
  sacredFlag?: boolean;

  // Field Metadata
  fieldDepth?: number; // 0 to 1
  sessionId?: string;
}

/**
 * Create a new episode in the bardic memory system
 */
export async function createEpisode(params: CreateEpisodeParams): Promise<Episode> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .insert({
      user_id: params.userId,
      datetime: params.datetime?.toISOString() || new Date().toISOString(),
      scene_stanza: params.sceneStanza,
      transcript_link: params.transcriptLink,
      place_cue: params.placeCue,
      sense_cues: params.senseCues,
      people: params.people,
      affect_valence: params.affectValence,
      affect_arousal: params.affectArousal,
      affect_keywords: params.affectKeywords,
      elemental_state: params.elementalState,
      dominant_element: params.dominantElement,
      current_facet: params.currentFacet,
      is_recalibration: params.isRecalibration,
      recalibration_type: params.recalibrationType,
      sacred_flag: params.sacredFlag || false,
      field_depth: params.fieldDepth,
      session_id: params.sessionId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create episode: ${error.message}`);
  }

  return mapDbEpisodeToType(data);
}

// ============================================================================
// EPISODE RETRIEVAL
// ============================================================================

/**
 * Get a single episode by ID
 */
export async function getEpisode(episodeId: string): Promise<Episode | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', episodeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get episode: ${error.message}`);
  }

  return data ? mapDbEpisodeToType(data) : null;
}

/**
 * Get all episodes for a user, ordered by datetime descending
 */
export async function getUserEpisodes(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    includeSacred?: boolean;
  }
): Promise<Episode[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('episodes')
    .select('*')
    .eq('user_id', userId);

  // Filter out sacred episodes by default
  if (!options?.includeSacred) {
    query = query.eq('sacred_flag', false);
  }

  query = query.order('datetime', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get user episodes: ${error.message}`);
  }

  return data.map(mapDbEpisodeToType);
}

/**
 * Get episodes by place cue (portal for re-entry)
 */
export async function getEpisodesByPlace(
  userId: string,
  placeCue: string
): Promise<Episode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('user_id', userId)
    .eq('place_cue', placeCue)
    .eq('sacred_flag', false)
    .order('datetime', { ascending: false });

  if (error) {
    throw new Error(`Failed to get episodes by place: ${error.message}`);
  }

  return data.map(mapDbEpisodeToType);
}

/**
 * Get episodes by dominant element
 */
export async function getEpisodesByElement(
  userId: string,
  element: 'fire' | 'air' | 'water' | 'earth' | 'aether'
): Promise<Episode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('user_id', userId)
    .eq('dominant_element', element)
    .eq('sacred_flag', false)
    .order('datetime', { ascending: false });

  if (error) {
    throw new Error(`Failed to get episodes by element: ${error.message}`);
  }

  return data.map(mapDbEpisodeToType);
}

/**
 * Get sacred episodes (witness-only, no embeddings)
 */
export async function getSacredEpisodes(userId: string): Promise<Episode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('user_id', userId)
    .eq('sacred_flag', true)
    .order('datetime', { ascending: false });

  if (error) {
    throw new Error(`Failed to get sacred episodes: ${error.message}`);
  }

  return data.map(mapDbEpisodeToType);
}

/**
 * Get recalibration episodes (threshold crossings)
 */
export async function getRecalibrationEpisodes(userId: string): Promise<Episode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_recalibration', true)
    .order('datetime', { ascending: false });

  if (error) {
    throw new Error(`Failed to get recalibration episodes: ${error.message}`);
  }

  return data.map(mapDbEpisodeToType);
}

// ============================================================================
// EPISODE UPDATE
// ============================================================================

export interface UpdateEpisodeParams {
  sceneStanza?: string;
  transcriptLink?: string;
  placeCue?: string;
  senseCues?: SenseCues;
  people?: string[];
  affectValence?: number;
  affectArousal?: number;
  affectKeywords?: string[];
  elementalState?: ElementalState;
  dominantElement?: 'fire' | 'air' | 'water' | 'earth' | 'aether';
  currentFacet?: string;
  isRecalibration?: boolean;
  recalibrationType?: 'liminal' | 'death_rebirth' | 'integration' | 'breakthrough';
  fieldDepth?: number;
}

/**
 * Update an existing episode
 */
export async function updateEpisode(
  episodeId: string,
  params: UpdateEpisodeParams
): Promise<Episode> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .update({
      scene_stanza: params.sceneStanza,
      transcript_link: params.transcriptLink,
      place_cue: params.placeCue,
      sense_cues: params.senseCues,
      people: params.people,
      affect_valence: params.affectValence,
      affect_arousal: params.affectArousal,
      affect_keywords: params.affectKeywords,
      elemental_state: params.elementalState,
      dominant_element: params.dominantElement,
      current_facet: params.currentFacet,
      is_recalibration: params.isRecalibration,
      recalibration_type: params.recalibrationType,
      field_depth: params.fieldDepth,
      updated_at: new Date().toISOString(),
    })
    .eq('id', episodeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update episode: ${error.message}`);
  }

  return mapDbEpisodeToType(data);
}

// ============================================================================
// EPISODE DELETION
// ============================================================================

/**
 * Delete an episode and all related data (vectors, links, cues)
 * CASCADE deletion is handled by the database
 */
export async function deleteEpisode(episodeId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('episodes')
    .delete()
    .eq('id', episodeId);

  if (error) {
    throw new Error(`Failed to delete episode: ${error.message}`);
  }
}

// ============================================================================
// VECTOR EMBEDDING OPERATIONS
// ============================================================================

export interface CreateEpisodeVectorParams {
  episodeId: string;
  embedding: number[]; // 1536-dimensional vector from OpenAI
  similarityHash?: string;
  resonanceStrength?: number; // Default 1.0
  decayRate?: number; // Default 0.001
  morphicSignature?: Record<string, any>;
}

/**
 * Create vector embedding for an episode (for similarity matching)
 * Note: Sacred episodes should NOT have vectors created
 */
export async function createEpisodeVector(
  params: CreateEpisodeVectorParams
): Promise<EpisodeVector> {
  const supabase = getSupabase();

  // Check if episode is sacred
  const episode = await getEpisode(params.episodeId);
  if (episode?.sacredFlag) {
    throw new Error('Cannot create vector for sacred episode');
  }

  const { data, error } = await supabase
    .from('episode_vectors')
    .insert({
      episode_id: params.episodeId,
      embedding: params.embedding,
      similarity_hash: params.similarityHash,
      resonance_strength: params.resonanceStrength || 1.0,
      decay_rate: params.decayRate || 0.001,
      morphic_signature: params.morphicSignature,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create episode vector: ${error.message}`);
  }

  return mapDbVectorToType(data);
}

/**
 * Get vector embedding for an episode
 */
export async function getEpisodeVector(episodeId: string): Promise<EpisodeVector | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episode_vectors')
    .select('*')
    .eq('episode_id', episodeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get episode vector: ${error.message}`);
  }

  return data ? mapDbVectorToType(data) : null;
}

/**
 * Find similar episodes using vector cosine similarity
 * Returns episodes ordered by similarity (most similar first)
 */
export async function findSimilarEpisodes(
  userId: string,
  queryEmbedding: number[],
  options?: {
    limit?: number;
    minSimilarity?: number; // 0 to 1
    excludeEpisodeIds?: string[];
  }
): Promise<Array<Episode & { similarity: number }>> {
  const supabase = getSupabase();

  // Build the query with vector similarity
  // Note: This uses pgvector's cosine distance operator (<=>)
  // Similarity = 1 - distance
  const { data, error } = await supabase.rpc('find_similar_episodes', {
    p_user_id: userId,
    p_query_embedding: queryEmbedding,
    p_limit: options?.limit || 5,
    p_min_similarity: options?.minSimilarity || 0.5,
    p_exclude_ids: options?.excludeEpisodeIds || [],
  });

  if (error) {
    // If the RPC function doesn't exist yet, we'll need to create it
    // For now, throw a helpful error
    throw new Error(
      `Vector similarity search requires find_similar_episodes RPC function: ${error.message}`
    );
  }

  return data.map((row: any) => ({
    ...mapDbEpisodeToType(row),
    similarity: row.similarity,
  }));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database episode row to Episode type
 */
function mapDbEpisodeToType(dbRow: any): Episode {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    datetime: new Date(dbRow.datetime),
    sceneStanza: dbRow.scene_stanza,
    transcriptLink: dbRow.transcript_link,
    placeCue: dbRow.place_cue,
    senseCues: dbRow.sense_cues,
    people: dbRow.people,
    affectValence: dbRow.affect_valence,
    affectArousal: dbRow.affect_arousal,
    affectKeywords: dbRow.affect_keywords,
    elementalState: dbRow.elemental_state,
    dominantElement: dbRow.dominant_element,
    currentFacet: dbRow.current_facet,
    isRecalibration: dbRow.is_recalibration,
    recalibrationType: dbRow.recalibration_type,
    sacredFlag: dbRow.sacred_flag,
    fieldDepth: dbRow.field_depth,
    sessionId: dbRow.session_id,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}

/**
 * Map database episode_vectors row to EpisodeVector type
 */
function mapDbVectorToType(dbRow: any): EpisodeVector {
  return {
    episodeId: dbRow.episode_id,
    embedding: dbRow.embedding,
    similarityHash: dbRow.similarity_hash,
    resonanceStrength: dbRow.resonance_strength,
    decayRate: dbRow.decay_rate,
    morphicSignature: dbRow.morphic_signature,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get episode count for a user
 */
export async function getEpisodeCount(
  userId: string,
  options?: { includeSacred?: boolean }
): Promise<number> {
  const supabase = getSupabase();

  let query = supabase
    .from('episodes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!options?.includeSacred) {
    query = query.eq('sacred_flag', false);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get episode count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get elemental distribution for a user's episodes
 */
export async function getElementalDistribution(userId: string): Promise<{
  fire: number;
  air: number;
  water: number;
  earth: number;
  aether: number;
}> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('episodes')
    .select('dominant_element')
    .eq('user_id', userId)
    .eq('sacred_flag', false);

  if (error) {
    throw new Error(`Failed to get elemental distribution: ${error.message}`);
  }

  const distribution = {
    fire: 0,
    air: 0,
    water: 0,
    earth: 0,
    aether: 0,
  };

  data.forEach((row) => {
    const element = row.dominant_element;
    if (element && element in distribution) {
      distribution[element as keyof typeof distribution]++;
    }
  });

  return distribution;
}
