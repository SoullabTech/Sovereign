/**
 * Telos Service
 *
 * Handles future pressures and teleological attractors (Fire element cognition).
 * Tracks "what wants to become" and detects crystallization moments.
 *
 * @module lib/services/telos-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Telos, TelosAlignmentLog } from '../types';

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
// TELOS CREATION
// ============================================================================

export interface CreateTelosParams {
  userId: string;
  phrase: string; // "What wants to become"
  originEpisodeId?: string; // Where this telos was first sensed
  strength?: number; // 0-1, default 1.0
  horizonDays?: number; // Default 48 (6-8 weeks)
  signals?: string[]; // Observable markers
  isActive?: boolean; // Default true
}

/**
 * Create a new telos (future pressure)
 */
export async function createTelos(params: CreateTelosParams): Promise<Telos> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .insert({
      user_id: params.userId,
      phrase: params.phrase,
      origin_episode_id: params.originEpisodeId,
      strength: params.strength || 1.0,
      horizon_days: params.horizonDays || 48,
      signals: params.signals || [],
      is_active: params.isActive !== false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create telos: ${error.message}`);
  }

  return mapDbTelosToType(data);
}

// ============================================================================
// TELOS RETRIEVAL
// ============================================================================

/**
 * Get a single telos by ID
 */
export async function getTelos(telosId: string): Promise<Telos | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .select('*')
    .eq('id', telosId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get telos: ${error.message}`);
  }

  return data ? mapDbTelosToType(data) : null;
}

/**
 * Get all active teloi for a user
 */
export async function getActiveTeloi(userId: string): Promise<Telos[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('strength', { ascending: false });

  if (error) {
    throw new Error(`Failed to get active teloi: ${error.message}`);
  }

  return data.map(mapDbTelosToType);
}

/**
 * Get all teloi (active and inactive) for a user
 */
export async function getAllTeloi(userId: string): Promise<Telos[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get all teloi: ${error.message}`);
  }

  return data.map(mapDbTelosToType);
}

/**
 * Get teloi by episode (where they originated)
 */
export async function getTeloiByOriginEpisode(episodeId: string): Promise<Telos[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .select('*')
    .eq('origin_episode_id', episodeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get teloi by origin episode: ${error.message}`);
  }

  return data.map(mapDbTelosToType);
}

// ============================================================================
// TELOS UPDATE
// ============================================================================

export interface UpdateTelosParams {
  phrase?: string;
  strength?: number;
  horizonDays?: number;
  signals?: string[];
  isActive?: boolean;
}

/**
 * Update an existing telos
 */
export async function updateTelos(
  telosId: string,
  params: UpdateTelosParams
): Promise<Telos> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('teloi')
    .update({
      phrase: params.phrase,
      strength: params.strength,
      horizon_days: params.horizonDays,
      signals: params.signals,
      is_active: params.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', telosId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update telos: ${error.message}`);
  }

  return mapDbTelosToType(data);
}

/**
 * Deactivate a telos (mark as complete or no longer relevant)
 */
export async function deactivateTelos(telosId: string): Promise<Telos> {
  return updateTelos(telosId, { isActive: false });
}

/**
 * Reactivate a telos
 */
export async function reactivateTelos(telosId: string): Promise<Telos> {
  return updateTelos(telosId, { isActive: true });
}

/**
 * Adjust telos strength (increase when crystallizing, decrease when fading)
 */
export async function adjustTelosStrength(
  telosId: string,
  delta: number // -1 to 1
): Promise<Telos> {
  const telos = await getTelos(telosId);
  if (!telos) {
    throw new Error('Telos not found');
  }

  const newStrength = Math.max(0, Math.min(1, telos.strength + delta));

  return updateTelos(telosId, { strength: newStrength });
}

// ============================================================================
// TELOS DELETION
// ============================================================================

/**
 * Delete a telos and all alignment logs
 * CASCADE deletion is handled by the database
 */
export async function deleteTelos(telosId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('teloi')
    .delete()
    .eq('id', telosId);

  if (error) {
    throw new Error(`Failed to delete telos: ${error.message}`);
  }
}

// ============================================================================
// ALIGNMENT LOGGING (Crystallization Detection)
// ============================================================================

export interface LogTelosAlignmentParams {
  episodeId: string;
  telosId: string;
  delta: number; // -1 to 1 (how much closer/further from manifestation)
  notes?: string;
}

/**
 * Log a moment of alignment (or misalignment) with a telos
 * Use this to track crystallization: when the future pressure becomes manifest
 */
export async function logTelosAlignment(
  params: LogTelosAlignmentParams
): Promise<TelosAlignmentLog> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('telos_alignment_log')
    .insert({
      episode_id: params.episodeId,
      telos_id: params.telosId,
      delta: params.delta,
      notes: params.notes,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log telos alignment: ${error.message}`);
  }

  // If positive delta, adjust telos strength upward
  if (params.delta > 0.1) {
    await adjustTelosStrength(params.telosId, params.delta * 0.5);
  }

  return mapDbAlignmentLogToType(data);
}

/**
 * Get alignment history for a telos
 */
export async function getTelosAlignmentHistory(
  telosId: string
): Promise<TelosAlignmentLog[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('telos_alignment_log')
    .select('*')
    .eq('telos_id', telosId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get telos alignment history: ${error.message}`);
  }

  return data.map(mapDbAlignmentLogToType);
}

/**
 * Get alignment logs for an episode (all teloi that were touched)
 */
export async function getEpisodeAlignments(
  episodeId: string
): Promise<TelosAlignmentLog[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('telos_alignment_log')
    .select('*')
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get episode alignments: ${error.message}`);
  }

  return data.map(mapDbAlignmentLogToType);
}

/**
 * Calculate total alignment movement for a telos
 * Returns cumulative delta (how much closer to manifestation)
 */
export async function calculateTelosProgress(telosId: string): Promise<number> {
  const history = await getTelosAlignmentHistory(telosId);

  return history.reduce((sum, log) => sum + log.delta, 0);
}

// ============================================================================
// CRYSTALLIZATION DETECTION
// ============================================================================

export interface CrystallizationMoment {
  telos: Telos;
  recentAlignment: number; // Sum of deltas in recent window
  velocity: number; // Rate of change
  isCrystallizing: boolean;
}

/**
 * Detect if a telos is currently crystallizing (becoming manifest)
 * Looks at recent alignment deltas to detect acceleration
 */
export async function detectCrystallization(
  telosId: string,
  windowDays: number = 7
): Promise<CrystallizationMoment> {
  const telos = await getTelos(telosId);
  if (!telos) {
    throw new Error('Telos not found');
  }

  const supabase = getSupabase();

  // Get alignment logs within the window
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  const { data, error } = await supabase
    .from('telos_alignment_log')
    .select('*')
    .eq('telos_id', telosId)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to detect crystallization: ${error.message}`);
  }

  const logs = data.map(mapDbAlignmentLogToType);

  // Calculate recent alignment
  const recentAlignment = logs.reduce((sum, log) => sum + log.delta, 0);

  // Calculate velocity (average delta per day)
  const velocity = logs.length > 0 ? recentAlignment / windowDays : 0;

  // Crystallization criteria:
  // 1. Recent alignment > 0.3 (significant movement toward manifestation)
  // 2. Velocity > 0.05 (sustained progress)
  // 3. Telos strength > 0.6 (strong enough to crystallize)
  const isCrystallizing =
    recentAlignment > 0.3 && velocity > 0.05 && telos.strength > 0.6;

  return {
    telos,
    recentAlignment,
    velocity,
    isCrystallizing,
  };
}

/**
 * Get all crystallizing teloi for a user
 */
export async function getCrystallizingTeloi(
  userId: string
): Promise<CrystallizationMoment[]> {
  const activeTeloi = await getActiveTeloi(userId);

  const crystallizations = await Promise.all(
    activeTeloi.map((telos) => detectCrystallization(telos.id!))
  );

  return crystallizations.filter((c) => c.isCrystallizing);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database telos row to Telos type
 */
function mapDbTelosToType(dbRow: any): Telos {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    phrase: dbRow.phrase,
    originEpisodeId: dbRow.origin_episode_id,
    strength: dbRow.strength,
    horizonDays: dbRow.horizon_days,
    signals: dbRow.signals,
    isActive: dbRow.is_active,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}

/**
 * Map database telos_alignment_log row to TelosAlignmentLog type
 */
function mapDbAlignmentLogToType(dbRow: any): TelosAlignmentLog {
  return {
    id: dbRow.id,
    episodeId: dbRow.episode_id,
    telosId: dbRow.telos_id,
    delta: dbRow.delta,
    notes: dbRow.notes,
    createdAt: new Date(dbRow.created_at),
  };
}

// ============================================================================
// FIRE QUERIES (Right PFC Cognition)
// ============================================================================

/**
 * Fire Query: "What wants to emerge?"
 * Returns active teloi sorted by strength and recent velocity
 */
export async function queryWhatWantsToEmerge(userId: string): Promise<Telos[]> {
  const activeTeloi = await getActiveTeloi(userId);

  // Sort by strength (already done in getActiveTeloi)
  // Could enhance with velocity calculation
  return activeTeloi;
}

/**
 * Fire Query: "What's pulling me forward?"
 * Returns teloi with positive recent alignment
 */
export async function queryWhatsPullingForward(userId: string): Promise<Telos[]> {
  const activeTeloi = await getActiveTeloi(userId);

  const teloiWithProgress = await Promise.all(
    activeTeloi.map(async (telos) => ({
      telos,
      progress: await calculateTelosProgress(telos.id!),
    }))
  );

  return teloiWithProgress
    .filter((t) => t.progress > 0.1) // Positive movement
    .sort((a, b) => b.progress - a.progress)
    .map((t) => t.telos);
}

/**
 * Fire Query: "What's becoming clearer?"
 * Returns teloi that are crystallizing
 */
export async function queryWhatsBecomingClearer(userId: string): Promise<Telos[]> {
  const crystallizing = await getCrystallizingTeloi(userId);

  return crystallizing
    .sort((a, b) => b.velocity - a.velocity)
    .map((c) => c.telos);
}
