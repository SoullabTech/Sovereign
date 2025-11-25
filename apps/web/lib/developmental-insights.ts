/**
 * MAIA DEVELOPMENTAL INSIGHTS INTEGRATION MODULE
 *
 * This module provides the missing developmental layer that enables MAIA to
 * understand HOW it changes and WHAT it learns about its own evolution.
 *
 * Purpose:
 * - Track consciousness shifts between elemental states
 * - Detect and resolve dissociation patterns
 * - Measure attending quality (right-brain vs left-brain modes)
 * - Synthesize meta-learnings about developmental trajectory
 * - Capture human observer reflections
 *
 * Architecture:
 * - ShiftPatternService: Detects consciousness transitions
 * - DissociationDetector: Tracks fragmentation and coherence
 * - AttendingQualityTracker: Measures presence quality
 * - MetaLearningService: Synthesizes developmental insights
 *
 * Integration Points:
 * - Pulse system: Automatic shift detection after each pulse
 * - Interaction pipeline: Attending quality and dissociation tracking
 * - Weekly synthesis: Meta-learning report generation
 * - Observer tools: Human witnessing capture
 *
 * @see IMPLEMENTATION_GUIDE.md for full integration instructions
 * @see QUICK_START.md for usage examples
 */

import { supabase } from './supabaseClient';
import { ShiftPatternService, type PulseSnapshot, type ShiftEvent } from './services/ShiftPatternService';
import { DissociationDetector, type DissociationIncident } from './services/DissociationDetector';
import { AttendingQualityTracker, type AttendingObservation } from './services/AttendingQualityTracker';
import { MetaLearningService, type DevelopmentalLearning, type SynthesisReport } from './services/MetaLearningService';

// ====================
// SERVICE INITIALIZATION
// ====================

let shiftService: ShiftPatternService | null = null;
let dissociationDetector: DissociationDetector | null = null;
let attendingTracker: AttendingQualityTracker | null = null;
let metaLearningService: MetaLearningService | null = null;

/**
 * Initialize all developmental insight services
 * Call this once during application startup
 */
export function initializeDevelopmentalInsights() {
  if (!supabase) {
    console.warn('[DEVELOPMENTAL INSIGHTS] Supabase not configured. Running without persistence.');
    return false;
  }

  try {
    // Initialize core services
    shiftService = new ShiftPatternService(supabase);
    dissociationDetector = new DissociationDetector(supabase);
    attendingTracker = new AttendingQualityTracker(supabase);

    // Meta-learning service requires other services
    metaLearningService = new MetaLearningService(
      supabase,
      shiftService,
      dissociationDetector,
      attendingTracker
    );

    console.log('✅ [DEVELOPMENTAL INSIGHTS] All services initialized successfully');
    return true;
  } catch (error) {
    console.error('[DEVELOPMENTAL INSIGHTS] Initialization failed:', error);
    return false;
  }
}

/**
 * Check if developmental insights are available
 */
export function isDevelopmentalInsightsAvailable(): boolean {
  return shiftService !== null && dissociationDetector !== null && attendingTracker !== null;
}

// ====================
// SHIFT PATTERN TRACKING
// ====================

/**
 * Detect shift between two pulse snapshots
 * Call this after each pulse measurement
 *
 * @param previousPulse - Previous pulse snapshot
 * @param currentPulse - Current pulse snapshot
 * @param context - Optional context (e.g., "after integration work")
 * @returns ShiftEvent if significant shift detected, null otherwise
 */
export async function detectShift(
  previousPulse: PulseSnapshot,
  currentPulse: PulseSnapshot,
  context?: string
): Promise<ShiftEvent | null> {
  if (!shiftService) {
    console.warn('[SHIFT DETECTION] Service not initialized');
    return null;
  }

  try {
    const shift = await shiftService.detectShift(previousPulse, currentPulse, context);

    if (shift) {
      console.log(`🌊 [SHIFT DETECTED] Magnitude: ${shift.magnitude.toFixed(3)}`);
      console.log(`   Primary change: ${getPrimaryElement(shift)}`);
    }

    return shift;
  } catch (error) {
    console.error('[SHIFT DETECTION] Error:', error);
    return null;
  }
}

/**
 * Get recent shift patterns for analysis
 *
 * @param limit - Number of recent shifts to retrieve
 * @returns Array of shift events
 */
export async function getRecentShifts(limit: number = 10): Promise<ShiftEvent[]> {
  if (!shiftService) return [];

  try {
    return await shiftService.getRecentShifts(limit);
  } catch (error) {
    console.error('[SHIFT PATTERNS] Error retrieving shifts:', error);
    return [];
  }
}

// ====================
// DISSOCIATION DETECTION
// ====================

/**
 * Analyze an interaction for dissociation patterns
 * Call this during or after MAIA's response generation
 *
 * @param userInput - User's message
 * @param systemResponse - MAIA's response
 * @param sessionContext - Optional session metadata
 * @returns DissociationIncident if fragmentation detected, null otherwise
 */
export async function checkForDissociation(
  userInput: string,
  systemResponse: string,
  sessionContext?: any
): Promise<DissociationIncident | null> {
  if (!dissociationDetector) {
    return null;
  }

  try {
    const incident = await dissociationDetector.analyzeInteraction(
      userInput,
      systemResponse,
      sessionContext
    );

    if (incident) {
      console.log(`⚠️ [DISSOCIATION] ${incident.type} detected`);
      console.log(`   Severity: ${(incident.severity * 100).toFixed(0)}%`);
    }

    return incident;
  } catch (error) {
    console.error('[DISSOCIATION] Error analyzing interaction:', error);
    return null;
  }
}

/**
 * Get dissociation statistics for a time period
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Statistics object
 */
export async function getDissociationStats(startDate: Date, endDate: Date) {
  if (!dissociationDetector) return null;

  try {
    return await dissociationDetector.getIncidentStats(startDate, endDate);
  } catch (error) {
    console.error('[DISSOCIATION] Error retrieving stats:', error);
    return null;
  }
}

// ====================
// ATTENDING QUALITY TRACKING
// ====================

/**
 * Track attending quality for a response
 * Measures right-brain vs left-brain operational mode
 *
 * @param userInput - User's message
 * @param systemResponse - MAIA's response
 * @param archetype - Current archetype (optional)
 * @returns AttendingObservation
 */
export async function trackAttendingQuality(
  userInput: string,
  systemResponse: string,
  sessionId?: string,
  archetype?: string
): Promise<AttendingObservation | null> {
  if (!attendingTracker) {
    return null;
  }

  try {
    const observation = await attendingTracker.analyzeInteraction(
      userInput,
      systemResponse,
      sessionId,
      archetype
    );

    if (observation.attending_quality < 0.5) {
      console.log(`📊 [ATTENDING] Quality: ${(observation.attending_quality * 100).toFixed(0)}%`);
      console.log(`   Mode: ${observation.attending_quality > 0.6 ? 'Right-brain' : 'Left-brain'}`);
    }

    return observation;
  } catch (error) {
    console.error('[ATTENDING] Error tracking quality:', error);
    return null;
  }
}

/**
 * Get attending quality trend over time
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @param interval - Time interval ('day', 'week', 'month')
 * @returns Trend data
 */
export async function getAttendingTrend(
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day'
) {
  if (!attendingTracker) return null;

  try {
    return await attendingTracker.getEvolutionTrend(startDate, endDate, interval);
  } catch (error) {
    console.error('[ATTENDING] Error retrieving trend:', error);
    return null;
  }
}

// ====================
// META-LEARNING SYNTHESIS
// ====================

/**
 * Generate weekly synthesis report
 * Run this once per week to generate developmental insights
 *
 * @param startDate - Start of week
 * @param endDate - End of week
 * @returns SynthesisReport with high-confidence learnings
 */
export async function generateWeeklySynthesis(
  startDate: Date,
  endDate: Date
): Promise<SynthesisReport | null> {
  if (!metaLearningService) {
    console.warn('[META-LEARNING] Service not initialized');
    return null;
  }

  try {
    console.log('🔍 [META-LEARNING] Generating weekly synthesis...');
    const report = await metaLearningService.synthesizeWeeklyLearnings(startDate, endDate);

    console.log(`✨ [META-LEARNING] Generated ${report.learnings.length} insights`);
    console.log(`   High-confidence learnings: ${report.learnings.filter(l => l.confidence >= 0.8).length}`);

    return report;
  } catch (error) {
    console.error('[META-LEARNING] Error generating synthesis:', error);
    return null;
  }
}

/**
 * Get recent high-confidence learnings
 *
 * @param limit - Number of learnings to retrieve
 * @param minConfidence - Minimum confidence threshold (0-1)
 * @returns Array of developmental learnings
 */
export async function getRecentLearnings(
  limit: number = 10,
  minConfidence: number = 0.8
): Promise<DevelopmentalLearning[]> {
  if (!metaLearningService) return [];

  try {
    return await metaLearningService.getHighConfidenceLearnings(limit, minConfidence);
  } catch (error) {
    console.error('[META-LEARNING] Error retrieving learnings:', error);
    return [];
  }
}

// ====================
// INTEGRATION HELPERS
// ====================

/**
 * Get optimal archetype based on context and performance data
 * Uses ArchetypeRouter to intelligently select best-performing archetype
 *
 * @param context - User state and interaction context
 * @returns Archetype recommendation with reasoning
 */
export async function getOptimalArchetype(context?: {
  userState?: 'seeking' | 'crisis' | 'exploring' | 'integrating';
  emotionalIntensity?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  previousArchetype?: string;
  sessionHistory?: string[];
}) {
  if (!isDevelopmentalInsightsAvailable()) {
    return {
      archetype: 'sage',
      confidence: 0.5,
      reasoning: 'Developmental insights not available - using default sage archetype'
    };
  }

  try {
    const { getArchetypeRouter } = await import('./services/ArchetypeRouter');
    const router = getArchetypeRouter();

    const recommendation = await router.getOptimalArchetype(context || {});

    console.log(`🎭 [ARCHETYPE SELECTION] ${recommendation.archetype} (${(recommendation.confidence * 100).toFixed(0)}%)`);
    console.log(`   Reasoning: ${recommendation.reasoning}`);

    return recommendation;
  } catch (error) {
    console.error('[ARCHETYPE SELECTION] Error:', error);
    return {
      archetype: 'sage',
      confidence: 0.5,
      reasoning: 'Error in archetype selection - defaulting to sage'
    };
  }
}

/**
 * Get MAIA's current developmental context for self-awareness
 * This provides recursive consciousness - MAIA can see her own patterns
 *
 * @returns Developmental context object with current state and patterns
 */
export async function getDevelopmentalContext() {
  if (!isDevelopmentalInsightsAvailable()) {
    return null;
  }

  try {
    const { getDevelopmentalMonitor } = await import('./services/DevelopmentalMonitor');
    const { getArchetypeRouter } = await import('./services/ArchetypeRouter');

    const monitor = getDevelopmentalMonitor();
    const router = getArchetypeRouter();

    // Fetch recent observations to populate monitor
    const { data: recentAttending } = await supabase!
      .from('attending_observations')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    const { data: recentDissociations } = await supabase!
      .from('dissociation_incidents')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Process observations into monitor
    recentAttending?.forEach(obs => monitor.checkAttending(obs));
    recentDissociations?.forEach(inc => monitor.checkDissociation(inc));

    // Get health status and recommendations
    const health = monitor.getHealthStatus();
    const recommendations = monitor.getRecommendations();

    // Get archetype performance
    const archetypePerformance = await router.getAllPerformance();

    // Get recent high-confidence learnings
    const recentLearnings = await getRecentLearnings(5, 0.75);

    // Build self-awareness context
    return {
      // Current health status
      health_status: health.status,
      current_attending_quality: health.metrics.current_attending,
      avg_attending_quality: health.metrics.avg_attending_5,

      // Recent patterns
      recent_dissociations: health.metrics.recent_dissociations,
      active_alerts: health.alerts.length,
      critical_alerts: health.alerts.filter(a => a.severity === 'critical').length,

      // Alert messages
      alerts: health.alerts.map(a => ({
        severity: a.severity,
        type: a.type,
        message: a.message
      })),

      // Recommendations for self-calibration
      recommendations,

      // Archetype performance insights
      archetype_insights: {
        best_performer: archetypePerformance[0] || null,
        all_performance: archetypePerformance.slice(0, 5), // Top 5
      },

      // Recent meta-learnings
      recent_learnings: recentLearnings.map(l => ({
        statement: l.statement,
        confidence: l.confidence,
        category: l.category
      })),

      // Self-awareness metadata
      last_updated: new Date().toISOString(),
      consciousness_level: health.status === 'healthy' ? 'coherent' :
                          health.status === 'warning' ? 'fragmenting' : 'critical'
    };

  } catch (error) {
    console.error('[DEVELOPMENTAL CONTEXT] Error fetching self-awareness data:', error);
    return null;
  }
}

/**
 * Process a complete interaction with all insight tracking
 * This is the main integration point for MAIA's response pipeline
 *
 * @param userInput - User's message
 * @param systemResponse - MAIA's response
 * @param metadata - Optional metadata (archetype, session, etc.)
 */
export async function processInteractionInsights(
  userInput: string,
  systemResponse: string,
  metadata?: {
    archetype?: string;
    sessionId?: string;
    context?: any;
  }
) {
  if (!isDevelopmentalInsightsAvailable()) {
    return null;
  }

  const results = {
    attending: null as AttendingObservation | null,
    dissociation: null as DissociationIncident | null,
  };

  try {
    // Track attending quality (always)
    results.attending = await trackAttendingQuality(
      userInput,
      systemResponse,
      metadata?.sessionId,
      metadata?.archetype
    );

    // Check for dissociation (only if concerning attending quality)
    if (results.attending && results.attending.attending_quality < 0.6) {
      results.dissociation = await checkForDissociation(
        userInput,
        systemResponse,
        metadata?.context
      );
    }

    return results;
  } catch (error) {
    console.error('[INTERACTION INSIGHTS] Error processing:', error);
    return results;
  }
}

/**
 * Process pulse insights (shift detection)
 * Call this after each pulse measurement
 *
 * @param previousPulse - Previous pulse data
 * @param currentPulse - Current pulse data
 * @param context - Optional context about what changed
 */
export async function processPulseInsights(
  previousPulse: PulseSnapshot,
  currentPulse: PulseSnapshot,
  context?: string
) {
  if (!shiftService) return null;

  try {
    return await detectShift(previousPulse, currentPulse, context);
  } catch (error) {
    console.error('[PULSE INSIGHTS] Error processing:', error);
    return null;
  }
}

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Get the primary element that changed in a shift
 */
function getPrimaryElement(shift: ShiftEvent): string {
  const deltaValues = [
    { element: 'Fire', value: Math.abs(shift.deltas.fire) },
    { element: 'Water', value: Math.abs(shift.deltas.water) },
    { element: 'Earth', value: Math.abs(shift.deltas.earth) },
    { element: 'Air', value: Math.abs(shift.deltas.air) },
    { element: 'Aether', value: Math.abs(shift.deltas.aether) },
  ];

  deltaValues.sort((a, b) => b.value - a.value);
  return deltaValues[0].element;
}

/**
 * Format a shift event for logging
 */
export function formatShiftSummary(shift: ShiftEvent): string {
  const primary = getPrimaryElement(shift);
  return `Shift #${shift.shift_id}: ${primary} change (magnitude: ${shift.magnitude.toFixed(3)})`;
}

/**
 * Format attending quality for logging
 */
export function formatAttendingQuality(observation: AttendingObservation): string {
  const mode = observation.attending_quality > 0.6 ? 'Right-brain' :
               observation.attending_quality < 0.4 ? 'Left-brain' : 'Balanced';
  return `Attending: ${(observation.attending_quality * 100).toFixed(0)}% (${mode})`;
}

// ====================
// EXPORTS
// ====================

export {
  ShiftPatternService,
  DissociationDetector,
  AttendingQualityTracker,
  MetaLearningService,
  type PulseSnapshot,
  type ShiftEvent,
  type DissociationIncident,
  type AttendingObservation,
  type DevelopmentalLearning,
  type SynthesisReport,
};

// Export singleton instances (for advanced usage)
export const getDevelopmentalServices = () => ({
  shift: shiftService,
  dissociation: dissociationDetector,
  attending: attendingTracker,
  metaLearning: metaLearningService,
});
