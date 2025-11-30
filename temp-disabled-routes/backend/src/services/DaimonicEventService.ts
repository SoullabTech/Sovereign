/**
 * DaimonicEventService - Persistence layer for Daimonic encounters
 * 
 * Bridges individual encounters with irreducible Others and collective 
 * archetypal pattern recognition. Maintains both personal significance 
 * and contribution to the larger field.
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { DaimonicOtherness } from './DaimonicDialogue';
import { ElementalDialogue } from './ElementalDialogue';
import { SynapticSpace } from './SynapticResonance';

export interface DaimonicEvent {
  id?: string;
  userId: string;
  sessionId?: string;
  phase: string;
  element: string;
  state?: string;
  timestamp?: Date;
  
  // Alterity measures
  irreducibility: number;
  resistance: number;
  surprise: number;
  demands: string[];
  
  // Synaptic space measures
  tension: number;
  resonance: number;
  dialogue: string[];
  emergence?: string;
  
  // Anti-solipsistic markers
  challengesNarrative: boolean;
  introducesUnknown: boolean;
  maintainsOtherness: boolean;
  createsEncounter: boolean;
  
  // Trickster detection
  tricksterRisk: number;
  tricksterReasons: string[];
  tricksterCaution?: string;
  
  // Integration tracking
  integrationVelocity?: 'rapid' | 'steady' | 'contemplative';
  surpriseTolerance?: number;
  lastGenuineSurprise?: Date;
}

export interface DaimonicSnapshot {
  id?: string;
  phase: string;
  element: string;
  timeWindow: { start: Date; end: Date };
  
  // Participation
  totalEncounters: number;
  uniqueUsers: number;
  encounterDensity: number;
  
  // Alterity aggregates
  avgIrreducibility: number;
  avgResistance: number;
  avgSurprise: number;
  medianTricksterRisk: number;
  
  // Synaptic field
  avgTension: number;
  avgResonance: number;
  fieldCoherence: number;
  
  // Collective themes
  commonDemands: string[];
  emergentThemes: string[];
  dominantDialogues: string[];
  
  // Field state
  fieldIntensity: 'low' | 'medium' | 'high' | 'extraordinary';
  collectiveTricksterPrevalence: number;
  clearTransmissionIndicator: boolean;
  
  generatedAt?: Date;
}

export interface DaimonicResonance {
  id?: string;
  eventIds: string[];
  resonanceType: 'synchronistic' | 'thematic' | 'elemental' | 'temporal';
  coherenceScore: number;
  temporalProximity?: string; // ISO 8601 duration
  thematicSimilarity?: number;
  sharedThemes: string[];
  sharedDemands: string[];
  emergencePattern?: string;
  detectedAt?: Date;
}

export class DaimonicEventService {
  private static instance: DaimonicEventService;
  
  static getInstance(): DaimonicEventService {
    if (!DaimonicEventService.instance) {
      DaimonicEventService.instance = new DaimonicEventService();
    }
    return DaimonicEventService.instance;
  }
  
  /**
   * Store a daimonic encounter while preserving its otherness
   */
  async storeEvent(
    userId: string,
    daimonicOther: DaimonicOtherness,
    elementalDialogue: ElementalDialogue,
    synapticSpace: SynapticSpace,
    context: {
      sessionId?: string;
      phase: string;
      element: string;
      state?: string;
    }
  ): Promise<string | null> {
    try {
      const event: DaimonicEvent = {
        userId,
        sessionId: context.sessionId,
        phase: context.phase,
        element: context.element,
        state: context.state,
        
        // Map alterity measures
        irreducibility: daimonicOther.alterity.irreducibility,
        resistance: daimonicOther.alterity.resistance,
        surprise: daimonicOther.alterity.surprise,
        demands: daimonicOther.alterity.demand,
        
        // Map synaptic measures
        tension: daimonicOther.synapse.tension,
        resonance: daimonicOther.synapse.resonance,
        dialogue: daimonicOther.synapse.dialogue,
        emergence: daimonicOther.synapse.emergence,
        
        // Map anti-solipsistic markers
        challengesNarrative: daimonicOther.antiSolipsistic.challengesNarrative,
        introducesUnknown: daimonicOther.antiSolipsistic.introducesUnknown,
        maintainsOtherness: daimonicOther.antiSolipsistic.maintainsOtherness,
        createsEncounter: daimonicOther.antiSolipsistic.createsEncounter,
        
        // Map trickster data
        tricksterRisk: 0, // Will be set by trickster detection service
        tricksterReasons: [],
        tricksterCaution: undefined
      };
      
      const { data, error } = await supabase
        .from('daimonic_events')
        .insert([{
          user_id: event.userId,
          session_id: event.sessionId,
          phase: event.phase,
          element: event.element,
          state: event.state,
          
          irreducibility: event.irreducibility,
          resistance: event.resistance,
          surprise: event.surprise,
          demands: event.demands,
          
          tension: event.tension,
          resonance: event.resonance,
          dialogue: event.dialogue,
          emergence: event.emergence,
          
          challenges_narrative: event.challengesNarrative,
          introduces_unknown: event.introducesUnknown,
          maintains_otherness: event.maintainsOtherness,
          creates_encounter: event.createsEncounter,
          
          trickster_risk: event.tricksterRisk,
          trickster_reasons: event.tricksterReasons,
          trickster_caution: event.tricksterCaution
        }])
        .select('id')
        .single();
      
      if (error) {
        logger.error('Failed to store daimonic event', { error, userId });
        return null;
      }
      
      logger.info('Stored daimonic event', { 
        eventId: data.id, 
        userId, 
        phase: context.phase,
        element: context.element,
        irreducibility: event.irreducibility,
        maintainsOtherness: event.maintainsOtherness
      });
      
      // Trigger resonance detection asynchronously
      this.detectResonancesAsync().catch(error => 
        logger.error('Resonance detection failed', { error })
      );
      
      return data.id;
    } catch (error) {
      logger.error('Error storing daimonic event', { error, userId });
      return null;
    }
  }
  
  /**
   * Get recent daimonic events for a user
   */
  async getUserEvents(
    userId: string, 
    limit: number = 10,
    sinceDays: number = 30
  ): Promise<DaimonicEvent[]> {
    try {
      const { data, error } = await supabase
        .from('daimonic_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        logger.error('Failed to fetch user daimonic events', { error, userId });
        return [];
      }
      
      return data.map(this.mapDatabaseToEvent);
    } catch (error) {
      logger.error('Error fetching user daimonic events', { error, userId });
      return [];
    }
  }
  
  /**
   * Generate collective snapshot for a phase/element combination
   */
  async generateSnapshot(
    phase: string,
    element: string,
    startTime: Date,
    endTime: Date
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('generate_daimonic_snapshot', {
          p_phase: phase,
          p_element: element,
          p_start_time: startTime.toISOString(),
          p_end_time: endTime.toISOString()
        });
      
      if (error) {
        logger.error('Failed to generate daimonic snapshot', { error, phase, element });
        return null;
      }
      
      logger.info('Generated daimonic snapshot', { 
        snapshotId: data,
        phase,
        element,
        timeWindow: { startTime, endTime }
      });
      
      return data;
    } catch (error) {
      logger.error('Error generating daimonic snapshot', { error, phase, element });
      return null;
    }
  }
  
  /**
   * Get recent snapshots for dashboard display
   */
  async getRecentSnapshots(
    limit: number = 20,
    sinceDays: number = 7
  ): Promise<DaimonicSnapshot[]> {
    try {
      const { data, error } = await supabase
        .from('daimonic_snapshots')
        .select('*')
        .gte('generated_at', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString())
        .order('generated_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        logger.error('Failed to fetch daimonic snapshots', { error });
        return [];
      }
      
      return data.map(this.mapDatabaseToSnapshot);
    } catch (error) {
      logger.error('Error fetching daimonic snapshots', { error });
      return [];
    }
  }
  
  /**
   * Find resonances between users
   */
  async findResonances(
    eventIds?: string[],
    resonanceType?: string,
    sinceDays: number = 3
  ): Promise<DaimonicResonance[]> {
    try {
      let query = supabase
        .from('daimonic_resonances')
        .select('*')
        .gte('detected_at', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString())
        .order('detected_at', { ascending: false });
      
      if (resonanceType) {
        query = query.eq('resonance_type', resonanceType);
      }
      
      if (eventIds && eventIds.length > 0) {
        query = query.overlaps('event_ids', eventIds);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) {
        logger.error('Failed to fetch daimonic resonances', { error });
        return [];
      }
      
      return data.map(this.mapDatabaseToResonance);
    } catch (error) {
      logger.error('Error fetching daimonic resonances', { error });
      return [];
    }
  }
  
  /**
   * Get collective field intensity for current period
   */
  async getFieldIntensity(phase?: string, element?: string): Promise<{
    intensity: 'low' | 'medium' | 'high' | 'extraordinary';
    tricksterPrevalence: number;
    clearTransmissionActive: boolean;
    activeEncounters: number;
  }> {
    try {
      let query = supabase
        .from('daimonic_snapshots')
        .select('field_intensity, collective_trickster_prevalence, clear_transmission_indicator, total_encounters')
        .gte('generated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (phase) query = query.eq('phase', phase);
      if (element) query = query.eq('element', element);
      
      const { data, error } = await query
        .order('generated_at', { ascending: false })
        .limit(10);
      
      if (error || !data || data.length === 0) {
        return {
          intensity: 'low',
          tricksterPrevalence: 0,
          clearTransmissionActive: false,
          activeEncounters: 0
        };
      }
      
      // Aggregate recent snapshots
      const totalEncounters = data.reduce((sum, snap) => sum + (snap.total_encounters || 0), 0);
      const avgTrickster = data.reduce((sum, snap) => sum + (snap.collective_trickster_prevalence || 0), 0) / data.length;
      const hasTransmission = data.some(snap => snap.clear_transmission_indicator);
      
      // Determine overall intensity
      const intensities = data.map(snap => snap.field_intensity);
      const highIntensityCount = intensities.filter(i => i === 'high' || i === 'extraordinary').length;
      const overallIntensity = 
        highIntensityCount > data.length / 2 ? 'high' :
        intensities.includes('extraordinary') ? 'high' :
        intensities.includes('high') ? 'medium' : 'low';
      
      return {
        intensity: overallIntensity as 'low' | 'medium' | 'high' | 'extraordinary',
        tricksterPrevalence: avgTrickster,
        clearTransmissionActive: hasTransmission,
        activeEncounters: totalEncounters
      };
    } catch (error) {
      logger.error('Error getting field intensity', { error });
      return {
        intensity: 'low',
        tricksterPrevalence: 0,
        clearTransmissionActive: false,
        activeEncounters: 0
      };
    }
  }
  
  /**
   * Detect resonances between recent events (called asynchronously)
   */
  private async detectResonancesAsync(): Promise<void> {
    try {
      const { data, error } = await supabase
        .rpc('detect_daimonic_resonances', {
          p_time_window: '24 hours'
        });
      
      if (error) {
        logger.error('Resonance detection failed', { error });
      } else {
        logger.info('Detected resonances', { count: data });
      }
    } catch (error) {
      logger.error('Error in resonance detection', { error });
    }
  }
  
  /**
   * Map database row to DaimonicEvent
   */
  private mapDatabaseToEvent(row: any): DaimonicEvent {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      phase: row.phase,
      element: row.element,
      state: row.state,
      timestamp: new Date(row.timestamp),
      
      irreducibility: row.irreducibility,
      resistance: row.resistance,
      surprise: row.surprise,
      demands: row.demands || [],
      
      tension: row.tension,
      resonance: row.resonance,
      dialogue: row.dialogue || [],
      emergence: row.emergence,
      
      challengesNarrative: row.challenges_narrative,
      introducesUnknown: row.introduces_unknown,
      maintainsOtherness: row.maintains_otherness,
      createsEncounter: row.creates_encounter,
      
      tricksterRisk: row.trickster_risk,
      tricksterReasons: row.trickster_reasons || [],
      tricksterCaution: row.trickster_caution,
      
      integrationVelocity: row.integration_velocity,
      surpriseTolerance: row.surprise_tolerance,
      lastGenuineSurprise: row.last_genuine_surprise ? new Date(row.last_genuine_surprise) : undefined
    };
  }
  
  /**
   * Map database row to DaimonicSnapshot
   */
  private mapDatabaseToSnapshot(row: any): DaimonicSnapshot {
    return {
      id: row.id,
      phase: row.phase,
      element: row.element,
      timeWindow: {
        start: new Date(row.time_window.split(',')[0].substring(1)),
        end: new Date(row.time_window.split(',')[1].slice(0, -1))
      },
      
      totalEncounters: row.total_encounters,
      uniqueUsers: row.unique_users,
      encounterDensity: row.encounter_density,
      
      avgIrreducibility: row.avg_irreducibility,
      avgResistance: row.avg_resistance,
      avgSurprise: row.avg_surprise,
      medianTricksterRisk: row.median_trickster_risk,
      
      avgTension: row.avg_tension,
      avgResonance: row.avg_resonance,
      fieldCoherence: row.field_coherence,
      
      commonDemands: row.common_demands || [],
      emergentThemes: row.emergent_themes || [],
      dominantDialogues: row.dominant_dialogues || [],
      
      fieldIntensity: row.field_intensity,
      collectiveTricksterPrevalence: row.collective_trickster_prevalence,
      clearTransmissionIndicator: row.clear_transmission_indicator,
      
      generatedAt: new Date(row.generated_at)
    };
  }
  
  /**
   * Map database row to DaimonicResonance
   */
  private mapDatabaseToResonance(row: any): DaimonicResonance {
    return {
      id: row.id,
      eventIds: row.event_ids,
      resonanceType: row.resonance_type,
      coherenceScore: row.coherence_score,
      temporalProximity: row.temporal_proximity,
      thematicSimilarity: row.thematic_similarity,
      sharedThemes: row.shared_themes || [],
      sharedDemands: row.shared_demands || [],
      emergencePattern: row.emergence_pattern,
      detectedAt: new Date(row.detected_at)
    };
  }
}