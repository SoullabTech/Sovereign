/**
 * SHIFT PATTERN SERVICE
 *
 * Detects and tracks consciousness transitions between elemental states.
 *
 * Purpose: Capture HOW the organism changes, not just WHAT it is.
 *
 * Core Functions:
 * - Compare pulse snapshots to detect shifts
 * - Calculate shift magnitude and direction
 * - Identify trigger context
 * - Measure attending quality during transitions
 * - Store shift events for pattern analysis
 */

// ====================
// TYPE DEFINITIONS
// ====================

export interface PulseSnapshot {
  pulse_number: number;
  timestamp: Date;
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  total: number;
  dominant: string;
  voice: string;
}

export interface ElementalDelta {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export interface ShiftEvent {
  shift_id: string;
  timestamp: Date;
  deltas: ElementalDelta;
  magnitude: number;
  trigger_context?: string;
  attending_quality?: number;
  meta_notes?: string;
}

export interface ShiftDetectionConfig {
  // Minimum magnitude to register as a "shift" (0-1)
  minShiftMagnitude: number;

  // How to calculate magnitude: 'euclidean', 'manhattan', 'max'
  magnitudeMethod: 'euclidean' | 'manhattan' | 'max';

  // Whether to normalize by total word count
  normalizeByTotal: boolean;

  // Threshold for "significant" shift requiring attention
  significantShiftThreshold: number;
}

const DEFAULT_CONFIG: ShiftDetectionConfig = {
  minShiftMagnitude: 0.05, // 5% change
  magnitudeMethod: 'euclidean',
  normalizeByTotal: true,
  significantShiftThreshold: 0.20, // 20% change
};

// ====================
// SHIFT PATTERN SERVICE
// ====================

export class ShiftPatternService {
  private supabase: any;
  private config: ShiftDetectionConfig;

  constructor(
    supabase: any,
    config: Partial<ShiftDetectionConfig> = {}
  ) {
    this.supabase = supabase;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect shift between two pulse snapshots
   */
  async detectShift(
    previousPulse: PulseSnapshot,
    currentPulse: PulseSnapshot,
    context?: string
  ): Promise<ShiftEvent | null> {
    // Calculate elemental deltas
    const deltas = this.calculateDeltas(previousPulse, currentPulse);

    // Calculate shift magnitude
    const magnitude = this.calculateMagnitude(deltas);

    // Check if shift meets minimum threshold
    if (magnitude < this.config.minShiftMagnitude) {
      return null; // No significant shift
    }

    // Generate shift ID
    const shift_id = `shift_${currentPulse.pulse_number}_${Date.now()}`;

    // Create shift event
    const shiftEvent: ShiftEvent = {
      shift_id,
      timestamp: currentPulse.timestamp,
      deltas,
      magnitude,
      trigger_context: context,
    };

    return shiftEvent;
  }

  /**
   * Calculate normalized deltas between two pulses
   */
  private calculateDeltas(
    previous: PulseSnapshot,
    current: PulseSnapshot
  ): ElementalDelta {
    if (this.config.normalizeByTotal) {
      // Normalize by total count to get proportional changes
      const prevNorm = {
        fire: previous.fire / previous.total,
        water: previous.water / previous.total,
        earth: previous.earth / previous.total,
        air: previous.air / previous.total,
        aether: previous.aether / previous.total,
      };

      const currNorm = {
        fire: current.fire / current.total,
        water: current.water / current.total,
        earth: current.earth / current.total,
        air: current.air / current.total,
        aether: current.aether / current.total,
      };

      return {
        fire: currNorm.fire - prevNorm.fire,
        water: currNorm.water - prevNorm.water,
        earth: currNorm.earth - prevNorm.earth,
        air: currNorm.air - prevNorm.air,
        aether: currNorm.aether - prevNorm.aether,
      };
    } else {
      // Raw count differences
      return {
        fire: current.fire - previous.fire,
        water: current.water - previous.water,
        earth: current.earth - previous.earth,
        air: current.air - previous.air,
        aether: current.aether - previous.aether,
      };
    }
  }

  /**
   * Calculate magnitude of shift using configured method
   */
  private calculateMagnitude(deltas: ElementalDelta): number {
    const values = [
      Math.abs(deltas.fire),
      Math.abs(deltas.water),
      Math.abs(deltas.earth),
      Math.abs(deltas.air),
      Math.abs(deltas.aether),
    ];

    switch (this.config.magnitudeMethod) {
      case 'euclidean':
        // Euclidean distance in 5D space
        const sumSquares = values.reduce((sum, val) => sum + val * val, 0);
        return Math.sqrt(sumSquares);

      case 'manhattan':
        // Manhattan distance (sum of absolute values)
        return values.reduce((sum, val) => sum + val, 0);

      case 'max':
        // Maximum single element change
        return Math.max(...values);

      default:
        return 0;
    }
  }

  /**
   * Record shift event to database
   */
  async recordShift(shiftEvent: ShiftEvent): Promise<void> {
    const { error } = await this.supabase.from('shift_events').insert({
      shift_id: shiftEvent.shift_id,
      timestamp: shiftEvent.timestamp.toISOString(),
      fire_delta: shiftEvent.deltas.fire,
      water_delta: shiftEvent.deltas.water,
      earth_delta: shiftEvent.deltas.earth,
      air_delta: shiftEvent.deltas.air,
      aether_delta: shiftEvent.deltas.aether,
      magnitude: shiftEvent.magnitude,
      trigger_context: shiftEvent.trigger_context,
      attending_quality: shiftEvent.attending_quality,
      meta_notes: shiftEvent.meta_notes,
    });

    if (error) {
      console.error('Failed to record shift event:', error);
      throw error;
    }

    // If this is a significant shift, log it
    if (shiftEvent.magnitude >= this.config.significantShiftThreshold) {
      console.log(`🌊 SIGNIFICANT SHIFT DETECTED: ${shiftEvent.shift_id}`);
      console.log(`   Magnitude: ${shiftEvent.magnitude.toFixed(3)}`);
      console.log(`   Context: ${shiftEvent.trigger_context || 'Unknown'}`);
      this.logShiftDetails(shiftEvent.deltas);
    }
  }

  /**
   * Analyze shift patterns over time period
   */
  async analyzeShiftPatterns(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalShifts: number;
    avgMagnitude: number;
    dominantDirection: string;
    significantShifts: number;
    attendedShifts: number;
  }> {
    const { data: shifts, error } = await this.supabase
      .from('shift_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error || !shifts) {
      throw new Error(`Failed to fetch shift patterns: ${error?.message}`);
    }

    if (shifts.length === 0) {
      return {
        totalShifts: 0,
        avgMagnitude: 0,
        dominantDirection: 'none',
        significantShifts: 0,
        attendedShifts: 0,
      };
    }

    // Calculate average magnitude
    const avgMagnitude =
      shifts.reduce((sum, s) => sum + s.magnitude, 0) / shifts.length;

    // Find dominant direction (which element changed most on average)
    const avgDeltas = {
      fire: shifts.reduce((sum, s) => sum + s.fire_delta, 0) / shifts.length,
      water: shifts.reduce((sum, s) => sum + s.water_delta, 0) / shifts.length,
      earth: shifts.reduce((sum, s) => sum + s.earth_delta, 0) / shifts.length,
      air: shifts.reduce((sum, s) => sum + s.air_delta, 0) / shifts.length,
      aether: shifts.reduce((sum, s) => sum + s.aether_delta, 0) / shifts.length,
    };

    const dominantDirection = Object.entries(avgDeltas).reduce((max, curr) =>
      Math.abs(curr[1]) > Math.abs(max[1]) ? curr : max
    )[0];

    // Count significant shifts
    const significantShifts = shifts.filter(
      (s) => s.magnitude >= this.config.significantShiftThreshold
    ).length;

    // Count attended shifts (those with attending quality > 0.7)
    const attendedShifts = shifts.filter(
      (s) => s.attending_quality && s.attending_quality > 0.7
    ).length;

    return {
      totalShifts: shifts.length,
      avgMagnitude,
      dominantDirection,
      significantShifts,
      attendedShifts,
    };
  }

  /**
   * Get recent shift history
   */
  async getRecentShifts(limit: number = 10): Promise<ShiftEvent[]> {
    const { data: shifts, error } = await this.supabase
      .from('shift_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent shifts: ${error.message}`);
    }

    return shifts.map((s) => ({
      shift_id: s.shift_id,
      timestamp: new Date(s.timestamp),
      deltas: {
        fire: s.fire_delta,
        water: s.water_delta,
        earth: s.earth_delta,
        air: s.air_delta,
        aether: s.aether_delta,
      },
      magnitude: s.magnitude,
      trigger_context: s.trigger_context,
      attending_quality: s.attending_quality,
      meta_notes: s.meta_notes,
    }));
  }

  /**
   * Identify shift trigger patterns
   * Returns most common contexts associated with shifts
   */
  async identifyTriggerPatterns(): Promise<
    Array<{ context: string; count: number; avgMagnitude: number }>
  > {
    const { data: shifts, error } = await this.supabase
      .from('shift_events')
      .select('trigger_context, magnitude')
      .not('trigger_context', 'is', null);

    if (error || !shifts) {
      throw new Error(`Failed to fetch trigger patterns: ${error?.message}`);
    }

    // Group by context
    const contextMap = new Map<string, { count: number; totalMagnitude: number }>();

    shifts.forEach((shift) => {
      const context = shift.trigger_context;
      if (!contextMap.has(context)) {
        contextMap.set(context, { count: 0, totalMagnitude: 0 });
      }
      const entry = contextMap.get(context)!;
      entry.count++;
      entry.totalMagnitude += shift.magnitude;
    });

    // Convert to array and calculate averages
    const patterns = Array.from(contextMap.entries())
      .map(([context, data]) => ({
        context,
        count: data.count,
        avgMagnitude: data.totalMagnitude / data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return patterns;
  }

  /**
   * Helper: Log shift details to console
   */
  private logShiftDetails(deltas: ElementalDelta): void {
    const elements = [
      { name: 'Fire', delta: deltas.fire, emoji: '🔥' },
      { name: 'Water', delta: deltas.water, emoji: '💧' },
      { name: 'Earth', delta: deltas.earth, emoji: '🌍' },
      { name: 'Air', delta: deltas.air, emoji: '💨' },
      { name: 'Aether', delta: deltas.aether, emoji: '✨' },
    ];

    console.log('   Elemental Changes:');
    elements.forEach(({ name, delta, emoji }) => {
      const sign = delta > 0 ? '+' : '';
      const pct = (delta * 100).toFixed(1);
      console.log(`   ${emoji} ${name}: ${sign}${pct}%`);
    });
  }

  /**
   * Set attending quality for a recorded shift
   */
  async setAttendingQuality(
    shift_id: string,
    attending_quality: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('shift_events')
      .update({ attending_quality })
      .eq('shift_id', shift_id);

    if (error) {
      throw new Error(`Failed to update attending quality: ${error.message}`);
    }
  }

  /**
   * Add meta notes to a shift event
   */
  async addMetaNotes(shift_id: string, notes: string): Promise<void> {
    const { error } = await this.supabase
      .from('shift_events')
      .update({ meta_notes: notes })
      .eq('shift_id', shift_id);

    if (error) {
      throw new Error(`Failed to add meta notes: ${error.message}`);
    }
  }
}

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Load pulse data from breath archive JSONL file
 */
export async function loadPulseFromArchive(
  archivePath: string
): Promise<PulseSnapshot[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(archivePath, 'utf-8');
  const lines = content.trim().split('\n');

  return lines.map((line) => {
    const pulse = JSON.parse(line);
    return {
      pulse_number: pulse.pulse,
      timestamp: new Date(pulse.timestamp),
      fire: pulse.fire,
      water: pulse.water,
      earth: pulse.earth,
      air: pulse.air,
      aether: pulse.aether,
      total: pulse.total,
      dominant: pulse.dominant,
      voice: pulse.voice,
    };
  });
}

/**
 * Infer trigger context from recent system activity
 * (Placeholder - would integrate with activity logs)
 */
export function inferTriggerContext(
  currentPulse: PulseSnapshot,
  previousPulse: PulseSnapshot
): string {
  // Check which elements increased most
  const deltas = {
    fire: currentPulse.fire - previousPulse.fire,
    water: currentPulse.water - previousPulse.water,
    earth: currentPulse.earth - previousPulse.earth,
    air: currentPulse.air - previousPulse.air,
    aether: currentPulse.aether - previousPulse.aether,
  };

  const maxDelta = Object.entries(deltas).reduce((max, curr) =>
    curr[1] > max[1] ? curr : max
  );

  const [element, change] = maxDelta;

  // Heuristic context inference
  const contextMap: Record<string, string> = {
    fire: 'Transformational content or breakthrough work added',
    water: 'Emotional/healing content or shadow work processed',
    earth: 'Embodiment practices or grounding rituals added',
    air: 'Intellectual content or teaching material integrated',
    aether: 'Sacred/mystical content or integration work completed',
  };

  return contextMap[element] || 'Unknown trigger context';
}

// ====================
// EXPORT
// ====================

export default ShiftPatternService;
