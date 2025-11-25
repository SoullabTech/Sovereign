/**
 * Microact Service
 *
 * Handles microacts - repeated small actions that build virtues over time (Earth element).
 * Tracks the slow accrual of character through consistent practice.
 *
 * @module lib/services/microact-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Microact, MicroactLog } from '../types';

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
// MICROACT CREATION
// ============================================================================

export interface CreateMicroactParams {
  userId: string;
  actionPhrase: string; // e.g., "Paused before speaking"
  virtueCategory?: string; // e.g., "presence", "courage", "compassion"
  totalCount?: number; // Default 0
}

/**
 * Create a new microact definition
 */
export async function createMicroact(params: CreateMicroactParams): Promise<Microact> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .insert({
      user_id: params.userId,
      action_phrase: params.actionPhrase,
      virtue_category: params.virtueCategory,
      total_count: params.totalCount || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create microact: ${error.message}`);
  }

  return mapDbMicroactToType(data);
}

/**
 * Get or create a microact by action phrase
 * If it exists, return it. If not, create it.
 */
export async function getOrCreateMicroact(
  userId: string,
  actionPhrase: string,
  virtueCategory?: string
): Promise<Microact> {
  const existing = await getMicroactByPhrase(userId, actionPhrase);

  if (existing) {
    return existing;
  }

  return createMicroact({ userId, actionPhrase, virtueCategory });
}

// ============================================================================
// MICROACT RETRIEVAL
// ============================================================================

/**
 * Get a single microact by ID
 */
export async function getMicroact(microactId: string): Promise<Microact | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .select('*')
    .eq('id', microactId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get microact: ${error.message}`);
  }

  return data ? mapDbMicroactToType(data) : null;
}

/**
 * Get microact by action phrase
 */
export async function getMicroactByPhrase(
  userId: string,
  actionPhrase: string
): Promise<Microact | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .select('*')
    .eq('user_id', userId)
    .eq('action_phrase', actionPhrase)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get microact by phrase: ${error.message}`);
  }

  return data ? mapDbMicroactToType(data) : null;
}

/**
 * Get all microacts for a user
 */
export async function getUserMicroacts(userId: string): Promise<Microact[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .select('*')
    .eq('user_id', userId)
    .order('total_count', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user microacts: ${error.message}`);
  }

  return data.map(mapDbMicroactToType);
}

/**
 * Get microacts by virtue category
 */
export async function getMicroactsByVirtue(
  userId: string,
  virtueCategory: string
): Promise<Microact[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .select('*')
    .eq('user_id', userId)
    .eq('virtue_category', virtueCategory)
    .order('total_count', { ascending: false });

  if (error) {
    throw new Error(`Failed to get microacts by virtue: ${error.message}`);
  }

  return data.map(mapDbMicroactToType);
}

/**
 * Get top microacts (most practiced)
 */
export async function getTopMicroacts(
  userId: string,
  limit: number = 10
): Promise<Microact[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .select('*')
    .eq('user_id', userId)
    .order('total_count', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get top microacts: ${error.message}`);
  }

  return data.map(mapDbMicroactToType);
}

// ============================================================================
// MICROACT UPDATE
// ============================================================================

export interface UpdateMicroactParams {
  actionPhrase?: string;
  virtueCategory?: string;
  totalCount?: number;
}

/**
 * Update a microact
 */
export async function updateMicroact(
  microactId: string,
  params: UpdateMicroactParams
): Promise<Microact> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microacts')
    .update({
      action_phrase: params.actionPhrase,
      virtue_category: params.virtueCategory,
      total_count: params.totalCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', microactId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update microact: ${error.message}`);
  }

  return mapDbMicroactToType(data);
}

// ============================================================================
// MICROACT DELETION
// ============================================================================

/**
 * Delete a microact and all its logs
 * CASCADE deletion is handled by the database
 */
export async function deleteMicroact(microactId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('microacts')
    .delete()
    .eq('id', microactId);

  if (error) {
    throw new Error(`Failed to delete microact: ${error.message}`);
  }
}

// ============================================================================
// LOGGING OCCURRENCES (The Heart of Virtue Accreting)
// ============================================================================

export interface LogMicroactParams {
  microactId: string;
  episodeId?: string; // Optional: link to an episode
  occurredAt?: Date; // Default: now
  contextNote?: string; // Optional context
}

/**
 * Log a single occurrence of a microact
 * This is called every time the action is performed
 */
export async function logMicroactOccurrence(
  params: LogMicroactParams
): Promise<MicroactLog> {
  const supabase = getSupabase();

  // Insert the log
  const { data, error } = await supabase
    .from('microact_logs')
    .insert({
      microact_id: params.microactId,
      episode_id: params.episodeId,
      occurred_at: params.occurredAt?.toISOString() || new Date().toISOString(),
      context_note: params.contextNote,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log microact occurrence: ${error.message}`);
  }

  // Increment total count
  await incrementMicroactCount(params.microactId);

  return mapDbMicroactLogToType(data);
}

/**
 * Log a microact by action phrase (auto-creates if needed)
 */
export async function logMicroactByPhrase(
  userId: string,
  actionPhrase: string,
  options?: {
    episodeId?: string;
    virtueCategory?: string;
    contextNote?: string;
  }
): Promise<MicroactLog> {
  // Get or create the microact
  const microact = await getOrCreateMicroact(
    userId,
    actionPhrase,
    options?.virtueCategory
  );

  // Log the occurrence
  return logMicroactOccurrence({
    microactId: microact.id!,
    episodeId: options?.episodeId,
    contextNote: options?.contextNote,
  });
}

/**
 * Increment microact total count
 */
async function incrementMicroactCount(microactId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.rpc('increment_microact_count', {
    p_microact_id: microactId,
  });

  if (error) {
    // If RPC doesn't exist, do it manually
    const microact = await getMicroact(microactId);
    if (microact) {
      await updateMicroact(microactId, {
        totalCount: microact.totalCount + 1,
      });
    }
  }
}

// ============================================================================
// MICROACT LOG RETRIEVAL
// ============================================================================

/**
 * Get all logs for a microact
 */
export async function getMicroactLogs(
  microactId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<MicroactLog[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('microact_logs')
    .select('*')
    .eq('microact_id', microactId);

  if (options?.startDate) {
    query = query.gte('occurred_at', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('occurred_at', options.endDate.toISOString());
  }

  query = query.order('occurred_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get microact logs: ${error.message}`);
  }

  return data.map(mapDbMicroactLogToType);
}

/**
 * Get logs for an episode (all microacts performed during that episode)
 */
export async function getEpisodeMicroacts(episodeId: string): Promise<MicroactLog[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('microact_logs')
    .select('*')
    .eq('episode_id', episodeId)
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get episode microacts: ${error.message}`);
  }

  return data.map(mapDbMicroactLogToType);
}

/**
 * Get recent microact activity for a user
 */
export async function getRecentMicroactActivity(
  userId: string,
  days: number = 7
): Promise<MicroactLog[]> {
  const supabase = getSupabase();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get all microacts for user
  const microacts = await getUserMicroacts(userId);
  const microactIds = microacts.map((m) => m.id!);

  if (microactIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('microact_logs')
    .select('*')
    .in('microact_id', microactIds)
    .gte('occurred_at', cutoffDate.toISOString())
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get recent microact activity: ${error.message}`);
  }

  return data.map(mapDbMicroactLogToType);
}

// ============================================================================
// ANALYTICS & PATTERNS
// ============================================================================

export interface VirtueLedgerEntry {
  virtue: string;
  totalOccurrences: number;
  microacts: Array<{
    actionPhrase: string;
    count: number;
  }>;
}

/**
 * Get virtue ledger: grouped summary of all virtues being cultivated
 */
export async function getVirtueLedger(userId: string): Promise<VirtueLedgerEntry[]> {
  const microacts = await getUserMicroacts(userId);

  // Group by virtue category
  const virtueMap = new Map<string, Microact[]>();

  microacts.forEach((m) => {
    const virtue = m.virtueCategory || 'uncategorized';
    if (!virtueMap.has(virtue)) {
      virtueMap.set(virtue, []);
    }
    virtueMap.get(virtue)!.push(m);
  });

  // Build ledger entries
  const ledger: VirtueLedgerEntry[] = [];

  for (const [virtue, acts] of virtueMap.entries()) {
    const totalOccurrences = acts.reduce((sum, m) => sum + m.totalCount, 0);

    ledger.push({
      virtue,
      totalOccurrences,
      microacts: acts.map((m) => ({
        actionPhrase: m.actionPhrase,
        count: m.totalCount,
      })),
    });
  }

  return ledger.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

/**
 * Get microact streak (consecutive days with at least one occurrence)
 */
export async function getMicroactStreak(microactId: string): Promise<number> {
  const logs = await getMicroactLogs(microactId, { limit: 100 });

  if (logs.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const logDates = new Set(
    logs.map((log) => {
      const d = new Date(log.occurredAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  while (logDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Get microact frequency (occurrences per day over last N days)
 */
export async function getMicroactFrequency(
  microactId: string,
  days: number = 30
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await getMicroactLogs(microactId, { startDate });

  return logs.length / days;
}

/**
 * Detect emerging patterns: microacts that are accelerating
 */
export async function getAcceleratingMicroacts(
  userId: string
): Promise<Microact[]> {
  const microacts = await getUserMicroacts(userId);

  const microactsWithVelocity = await Promise.all(
    microacts.map(async (m) => {
      const recentFreq = await getMicroactFrequency(m.id!, 7);
      const historicFreq = await getMicroactFrequency(m.id!, 30);

      return {
        microact: m,
        velocity: recentFreq - historicFreq,
      };
    })
  );

  return microactsWithVelocity
    .filter((m) => m.velocity > 0.1) // Accelerating
    .sort((a, b) => b.velocity - a.velocity)
    .map((m) => m.microact);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database microact row to Microact type
 */
function mapDbMicroactToType(dbRow: any): Microact {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    actionPhrase: dbRow.action_phrase,
    virtueCategory: dbRow.virtue_category,
    totalCount: dbRow.total_count,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}

/**
 * Map database microact_log row to MicroactLog type
 */
function mapDbMicroactLogToType(dbRow: any): MicroactLog {
  return {
    id: dbRow.id,
    microactId: dbRow.microact_id,
    episodeId: dbRow.episode_id,
    occurredAt: new Date(dbRow.occurred_at),
    contextNote: dbRow.context_note,
    createdAt: new Date(dbRow.created_at),
  };
}
