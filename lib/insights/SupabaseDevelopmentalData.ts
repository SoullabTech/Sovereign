/**
 * Supabase Developmental Data Fetcher
 * Connects Next.js app to real Supabase developmental tracking tables
 */

const SUPABASE_URL = 'https://jkbetmadzcpoinjogkli.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmV0bWFkemNwb2luam9na2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NjIyNDUsImV4cCI6MjA1ODEzODI0NX0.K5nuL4m8sP1bC21TmsfpakY5cSfh_5pSLJ83G9Iu_-I';

// Supabase table interfaces
export interface AttendingObservation {
  id: string;
  observation_id: string;
  session_id: string;
  timestamp: string;
  coherence_score: number;
  presence_score: number;
  attending_quality: number;
  notes: string | null;
  archetype: string;
  created_at: string;
  updated_at: string;
}

export interface DissociationIncident {
  id: string;
  incident_id: string;
  session_id: string;
  timestamp: string;
  type: string; // 'coherence_drop' | 'discontinuity' | 'boundary_thicken' | 'fragmentation' | 'contradiction' | 'state_collapse'
  severity: number; // 0-1
  description: string | null;
  context: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftEvent {
  id: string;
  event_id: string;
  session_id: string;
  timestamp: string;
  fire_delta: number;
  water_delta: number;
  earth_delta: number;
  air_delta: number;
  aether_delta: number;
  magnitude: number;
  attended: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentalDashboardData {
  attending: AttendingObservation[];
  dissociation: DissociationIncident[];
  shifts: ShiftEvent[];
  stats: {
    totalObservations: number;
    avgAttendingQuality: number;
    dominantMode: string;
    rightBrainCount: number;
    leftBrainCount: number;
    balancedCount: number;
    dissociationCount: number;
    severeDissociationCount: number;
    shiftCount: number;
  };
}

/**
 * Fetch data from Supabase table
 */
async function fetchSupabaseTable(table: string, params: string = ''): Promise<any> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all developmental data from Supabase
 */
export async function getDevelopmentalData(limit: number = 100): Promise<DevelopmentalDashboardData> {
  try {
    // Fetch all three tables in parallel
    const [attending, dissociation, shifts] = await Promise.all([
      fetchSupabaseTable('attending_observations', `select=*&order=timestamp.desc&limit=${limit}`),
      fetchSupabaseTable('dissociation_incidents', `select=*&order=timestamp.desc&limit=${limit}`),
      fetchSupabaseTable('shift_events', `select=*&order=timestamp.desc&limit=${limit}`)
    ]);

    // Calculate stats
    const stats = calculateStats(attending, dissociation, shifts);

    return {
      attending,
      dissociation,
      shifts,
      stats
    };

  } catch (error) {
    console.error('[SupabaseDevelopmentalData] Error fetching data:', error);
    throw error;
  }
}

/**
 * Calculate dashboard statistics
 */
function calculateStats(
  attending: AttendingObservation[],
  dissociation: DissociationIncident[],
  shifts: ShiftEvent[]
) {
  // Attending quality stats
  const avgAttendingQuality = attending.length > 0
    ? attending.reduce((sum, a) => sum + a.attending_quality, 0) / attending.length
    : 0;

  // Mode distribution (right-brain vs left-brain vs balanced)
  const rightBrainCount = attending.filter(a => a.attending_quality >= 0.6).length;
  const leftBrainCount = attending.filter(a => a.attending_quality < 0.4).length;
  const balancedCount = attending.filter(a => a.attending_quality >= 0.4 && a.attending_quality < 0.6).length;

  const dominantMode = rightBrainCount > leftBrainCount && rightBrainCount > balancedCount
    ? '🧠 Right-brain'
    : leftBrainCount > rightBrainCount && leftBrainCount > balancedCount
    ? '🔬 Left-brain'
    : '⚖️ Balanced';

  // Dissociation stats
  const severeDissociationCount = dissociation.filter(d => d.severity >= 0.7).length;

  return {
    totalObservations: attending.length,
    avgAttendingQuality,
    dominantMode,
    rightBrainCount,
    leftBrainCount,
    balancedCount,
    dissociationCount: dissociation.length,
    severeDissociationCount,
    shiftCount: shifts.length
  };
}

/**
 * Get archetype performance analysis
 */
export function getArchetypePerformance(attending: AttendingObservation[]): {
  archetype: string;
  avgQuality: number;
  count: number;
}[] {
  const archetypeStats: { [key: string]: { total: number; count: number } } = {};

  attending.forEach(a => {
    if (!archetypeStats[a.archetype]) {
      archetypeStats[a.archetype] = { total: 0, count: 0 };
    }
    archetypeStats[a.archetype].total += a.attending_quality;
    archetypeStats[a.archetype].count += 1;
  });

  return Object.entries(archetypeStats)
    .map(([archetype, stats]) => ({
      archetype,
      avgQuality: stats.total / stats.count,
      count: stats.count
    }))
    .sort((a, b) => b.avgQuality - a.avgQuality);
}

/**
 * Get dissociation type breakdown
 */
export function getDissociationTypeBreakdown(dissociation: DissociationIncident[]): {
  type: string;
  count: number;
  avgSeverity: number;
}[] {
  const typeStats: { [key: string]: { count: number; totalSeverity: number } } = {};

  dissociation.forEach(d => {
    if (!typeStats[d.type]) {
      typeStats[d.type] = { count: 0, totalSeverity: 0 };
    }
    typeStats[d.type].count += 1;
    typeStats[d.type].totalSeverity += d.severity;
  });

  return Object.entries(typeStats)
    .map(([type, stats]) => ({
      type,
      count: stats.count,
      avgSeverity: stats.totalSeverity / stats.count
    }))
    .sort((a, b) => b.count - a.count);
}
