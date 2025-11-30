/**
 * LiminalDetection - Recognizing Threshold Experiences
 * 
 * "Daimons appear at thresholds - dawn/dusk, bridges, seashores, 
 * between waking and sleeping. They inhabit the between spaces." - Harpur
 * 
 * This system tracks when experiences occur in liminal states,
 * as these are when daimonic communication is most likely.
 * The threshold itself is the daimon's preferred habitat.
 */

import { DaimonicAttentionMarkers } from './AttentionField';
import { logger } from '../utils/logger';

export interface LiminalMarkers {
  temporal_threshold: 'dawn' | 'dusk' | 'midnight' | 'noon' | 'transition_hour' | 'none';
  consciousness_state: 'hypnagogic' | 'hypnopompic' | 'flow' | 'dream' | 'meditation' | 'ordinary';
  spatial_betweenness: boolean; // Literally at threshold/border/bridge
  psychological_transition: boolean; // Major life transition occurring
  seasonal_threshold: boolean; // Solstice, equinox, seasonal boundary
  life_stage_threshold: boolean; // Coming of age, midlife, elderhood
}

export interface LiminalExperience {
  markers: LiminalMarkers;
  liminal_intensity: number; // 0-1: How "between" is this experience?
  daimonic_amplification: number; // 0-1: How much does liminality amplify daimonic activity?
  threshold_type: string; // Description of the specific threshold
  liminal_wisdom: string; // What the threshold teaches
}

export interface ThresholdCrossing {
  from: string; // What is being left behind
  to: string; // What is being approached
  guardian: string; // What guards this threshold
  ordeal: string; // What must be faced to cross
  gift: string; // What crossing offers
}

/**
 * LiminalDetectionService: Recognizes threshold experiences where daimons appear
 */
export class LiminalDetectionService {
  private liminal_experiences: Map<string, LiminalExperience[]>; // User ID -> experiences
  private threshold_crossings: Map<string, ThresholdCrossing[]>; // Tracked crossings
  
  constructor() {
    this.liminal_experiences = new Map();
    this.threshold_crossings = new Map();
  }

  /**
   * Primary detection method - assess liminal quality of experience
   */
  assessLiminalQuality(experience: any, timestamp?: Date): LiminalExperience {
    const markers = this.detectLiminalMarkers(experience, timestamp);
    const liminal_intensity = this.calculateLiminalIntensity(markers);
    const daimonic_amplification = this.calculateDaimonicAmplification(markers, liminal_intensity);
    const threshold_type = this.identifyThresholdType(markers);
    const liminal_wisdom = this.extractLiminalWisdom(markers, experience);

    return {
      markers,
      liminal_intensity,
      daimonic_amplification,
      threshold_type,
      liminal_wisdom
    };
  }

  /**
   * Detect specific liminal markers in experience
   */
  private detectLiminalMarkers(experience: any, timestamp?: Date): LiminalMarkers {
    const temporal = this.assessTemporalThreshold(timestamp || new Date());
    const consciousness = this.assessConsciousnessState(experience);
    const spatial = this.assessSpatialBetweenness(experience);
    const psychological = this.assessPsychologicalTransition(experience);
    const seasonal = this.assessSeasonalThreshold(timestamp || new Date());
    const life_stage = this.assessLifeStageThreshold(experience);

    return {
      temporal_threshold: temporal,
      consciousness_state: consciousness,
      spatial_betweenness: spatial,
      psychological_transition: psychological,
      seasonal_threshold: seasonal,
      life_stage_threshold: life_stage
    };
  }

  /**
   * Temporal Threshold - Dawn, dusk, midnight, transition hours
   * Harpur: Daimons prefer temporal boundaries
   */
  private assessTemporalThreshold(timestamp: Date): LiminalMarkers['temporal_threshold'] {
    const hour = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    
    // Dawn (5-7 AM)
    if (hour >= 5 && hour <= 7) return 'dawn';
    
    // Dusk (5-8 PM) 
    if (hour >= 17 && hour <= 20) return 'dusk';
    
    // Midnight hour (11 PM - 1 AM)
    if (hour >= 23 || hour <= 1) return 'midnight';
    
    // High noon (11 AM - 1 PM)
    if (hour >= 11 && hour <= 13) return 'noon';
    
    // Transition hours (on the hour, especially during threshold times)
    if (minutes >= 0 && minutes <= 5) return 'transition_hour';
    
    return 'none';
  }

  /**
   * Consciousness State - Hypnagogic, flow, dream states
   * The between-states of consciousness where daimons speak
   */
  private assessConsciousnessState(experience: any): LiminalMarkers['consciousness_state'] {
    // Look for state indicators in experience
    if (this.containsHypnagogicMarkers(experience)) return 'hypnagogic'; // Falling asleep
    if (this.containsHypnopompicMarkers(experience)) return 'hypnopompic'; // Waking up
    if (this.containsFlowStateMarkers(experience)) return 'flow';
    if (this.containsDreamMarkers(experience)) return 'dream';
    if (this.containsMeditativeMarkers(experience)) return 'meditation';
    
    return 'ordinary';
  }

  /**
   * Spatial Betweenness - Bridges, seashores, thresholds
   * Physical locations that are literally "between"
   */
  private assessSpatialBetweenness(experience: any): boolean {
    const betweenness_markers = [
      'bridge', 'threshold', 'door', 'window', 'shore', 'coastline', 
      'border', 'crossroads', 'intersection', 'edge', 'boundary',
      'airport', 'train station', 'pier', 'gateway', 'portal'
    ];
    
    const text = this.extractText(experience);
    return betweenness_markers.some(marker => 
      text.toLowerCase().includes(marker.toLowerCase())
    );
  }

  /**
   * Psychological Transition - Major life changes in progress
   * Internal thresholds create liminal states
   */
  private assessPsychologicalTransition(experience: any): boolean {
    const transition_markers = [
      'divorce', 'separation', 'ending relationship',
      'job change', 'career transition', 'unemployment',
      'moving', 'relocation', 'new city',
      'graduation', 'starting school', 'retirement',
      'death of', 'loss of', 'grief', 'mourning',
      'diagnosis', 'health crisis', 'recovery',
      'spiritual crisis', 'dark night', 'questioning everything'
    ];
    
    const text = this.extractText(experience);
    return transition_markers.some(marker => 
      text.toLowerCase().includes(marker.toLowerCase())
    );
  }

  /**
   * Seasonal Threshold - Solstices, equinoxes, seasonal boundaries
   */
  private assessSeasonalThreshold(timestamp: Date): boolean {
    const month = timestamp.getMonth(); // 0-11
    const day = timestamp.getDate();
    
    // Approximate seasonal thresholds
    const thresholds = [
      { month: 2, day: 20 }, // Spring equinox (March 20)
      { month: 5, day: 21 }, // Summer solstice (June 21)  
      { month: 8, day: 22 }, // Fall equinox (Sept 22)
      { month: 11, day: 21 } // Winter solstice (Dec 21)
    ];
    
    return thresholds.some(threshold => 
      month === threshold.month && Math.abs(day - threshold.day) <= 3
    );
  }

  /**
   * Life Stage Threshold - Coming of age, midlife, elderhood
   */
  private assessLifeStageThreshold(experience: any): boolean {
    const life_stage_markers = [
      'turning 30', 'turning 40', 'turning 50', 'turning 60',
      'midlife', 'mid-life', 'middle age',
      'coming of age', 'becoming adult',
      'empty nest', 'children leaving',
      'retirement', 'becoming elder', 'aging'
    ];
    
    const text = this.extractText(experience);
    return life_stage_markers.some(marker => 
      text.toLowerCase().includes(marker.toLowerCase())
    );
  }

  /**
   * Calculate overall liminal intensity
   * How "between" is this experience?
   */
  private calculateLiminalIntensity(markers: LiminalMarkers): number {
    let intensity = 0;
    
    // Temporal thresholds
    switch (markers.temporal_threshold) {
      case 'dawn':
      case 'dusk': intensity += 0.3; break;
      case 'midnight': intensity += 0.2; break;
      case 'noon': intensity += 0.1; break;
      case 'transition_hour': intensity += 0.1; break;
    }
    
    // Consciousness states
    switch (markers.consciousness_state) {
      case 'hypnagogic':
      case 'hypnopompic': intensity += 0.4; break; // Highest daimonic activity
      case 'dream': intensity += 0.3; break;
      case 'flow':
      case 'meditation': intensity += 0.2; break;
    }
    
    // Other thresholds
    if (markers.spatial_betweenness) intensity += 0.2;
    if (markers.psychological_transition) intensity += 0.3;
    if (markers.seasonal_threshold) intensity += 0.1;
    if (markers.life_stage_threshold) intensity += 0.2;
    
    return Math.min(1, intensity);
  }

  /**
   * Calculate how much liminality amplifies daimonic activity
   * Harpur: Daimons prefer threshold states
   */
  private calculateDaimonicAmplification(markers: LiminalMarkers, liminal_intensity: number): number {
    if (liminal_intensity < 0.3) return 1.0; // No amplification
    
    let amplification = 1.0 + (liminal_intensity * 0.5); // Base amplification
    
    // Special amplifications for specific combinations
    if (markers.consciousness_state === 'hypnagogic' || markers.consciousness_state === 'hypnopompic') {
      amplification += 0.3; // Daimons especially active here
    }
    
    if (markers.temporal_threshold === 'dawn' || markers.temporal_threshold === 'dusk') {
      amplification += 0.2; // Classic liminal times
    }
    
    if (markers.psychological_transition && markers.spatial_betweenness) {
      amplification += 0.2; // Double threshold = strong daimonic field
    }
    
    return Math.min(2.0, amplification); // Cap at 2x amplification
  }

  /**
   * Identify the specific type of threshold
   */
  private identifyThresholdType(markers: LiminalMarkers): string {
    if (markers.consciousness_state === 'hypnagogic') {
      return 'Gateway of Sleep - threshold between waking and dreaming';
    } else if (markers.consciousness_state === 'hypnopompic') {
      return 'Gateway of Awakening - threshold between dream and waking';
    } else if (markers.temporal_threshold === 'dawn') {
      return 'Dawn Threshold - between night and day';
    } else if (markers.temporal_threshold === 'dusk') {
      return 'Dusk Threshold - between day and night';
    } else if (markers.spatial_betweenness && markers.psychological_transition) {
      return 'Double Threshold - both physical and psychological boundary crossing';
    } else if (markers.psychological_transition) {
      return 'Life Transition Threshold - major life change boundary';
    } else if (markers.spatial_betweenness) {
      return 'Physical Threshold - between-place in the world';
    } else if (markers.seasonal_threshold) {
      return 'Seasonal Threshold - natural world boundary crossing';
    } else if (markers.life_stage_threshold) {
      return 'Life Stage Threshold - passage between developmental phases';
    } else {
      return 'Subtle Threshold - liminal quality present but undefined';
    }
  }

  /**
   * Extract wisdom specific to this threshold
   * Each threshold teaches something different
   */
  private extractLiminalWisdom(markers: LiminalMarkers, experience: any): string {
    if (markers.consciousness_state === 'hypnagogic' || markers.consciousness_state === 'hypnopompic') {
      return 'The boundary between conscious and unconscious is where daimons speak most clearly. ' +
             'Pay attention to images and insights that arise here.';
    } else if (markers.temporal_threshold === 'dawn') {
      return 'Dawn brings fresh perspective and new beginnings. The daimon offers renewal.';
    } else if (markers.temporal_threshold === 'dusk') {
      return 'Dusk brings reflection and mystery. The daimon offers deeper seeing.';
    } else if (markers.psychological_transition) {
      return 'Life transitions are sacred ordeals. The daimon uses these to initiate transformation.';
    } else if (markers.spatial_betweenness) {
      return 'Between-places are daimonic habitats. Neither here nor there, they allow new possibilities.';
    } else {
      return 'Threshold moments offer wisdom that ordinary time cannot provide. Stay receptive.';
    }
  }

  /**
   * Track threshold crossings over time
   */
  trackThresholdCrossing(userId: string, crossing: ThresholdCrossing): void {
    const crossings = this.threshold_crossings.get(userId) || [];
    crossings.push(crossing);
    this.threshold_crossings.set(userId, crossings);
  }

  /**
   * Get liminal experiences for a user
   */
  getUserLiminalExperiences(userId: string): LiminalExperience[] {
    return this.liminal_experiences.get(userId) || [];
  }

  /**
   * Check if current moment is liminal
   */
  isCurrentMomentLiminal(): { is_liminal: boolean; type: string; intensity: number } {
    const now = new Date();
    const temporal = this.assessTemporalThreshold(now);
    const seasonal = this.assessSeasonalThreshold(now);
    
    let is_liminal = temporal !== 'none' || seasonal;
    let type = '';
    let intensity = 0;
    
    if (temporal !== 'none') {
      type = temporal;
      intensity = temporal === 'dawn' || temporal === 'dusk' ? 0.8 : 0.5;
    }
    
    if (seasonal) {
      type += (type ? ' + seasonal threshold' : 'seasonal threshold');
      intensity += 0.3;
    }
    
    return { is_liminal, type, intensity: Math.min(1, intensity) };
  }

  // Helper methods for consciousness state detection
  private containsHypnagogicMarkers(experience: any): boolean {
    const markers = ['falling asleep', 'drifting off', 'almost asleep', 'sleepy', 'drowsy'];
    const text = this.extractText(experience);
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  private containsHypnopompicMarkers(experience: any): boolean {
    const markers = ['waking up', 'just awoke', 'half awake', 'groggy', 'between sleep and wake'];
    const text = this.extractText(experience);
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  private containsFlowStateMarkers(experience: any): boolean {
    const markers = ['in the zone', 'time disappeared', 'lost track of time', 'flow state', 'effortless'];
    const text = this.extractText(experience);
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  private containsDreamMarkers(experience: any): boolean {
    const markers = ['dream', 'dreamt', 'dreaming', 'nightmare', 'vision'];
    const text = this.extractText(experience);
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  private containsMeditativeMarkers(experience: any): boolean {
    const markers = ['meditation', 'meditating', 'contemplation', 'prayer', 'stillness'];
    const text = this.extractText(experience);
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  private extractText(experience: any): string {
    if (typeof experience === 'string') return experience;
    if (experience.text) return experience.text;
    if (experience.content) return experience.content;
    if (experience.description) return experience.description;
    return JSON.stringify(experience);
  }

  /**
   * Public interface for other systems
   */
  public processLiminalExperience(userId: string, experience: any, timestamp?: Date): LiminalExperience {
    const liminal_experience = this.assessLiminalQuality(experience, timestamp);
    
    // Store the experience
    const user_experiences = this.liminal_experiences.get(userId) || [];
    user_experiences.push(liminal_experience);
    this.liminal_experiences.set(userId, user_experiences.slice(-50)); // Keep last 50
    
    return liminal_experience;
  }

  /**
   * Generate liminal guidance
   */
  public generateLiminalGuidance(liminal_experience: LiminalExperience): string {
    if (liminal_experience.liminal_intensity > 0.7) {
      return `High liminal activity detected: ${liminal_experience.threshold_type}. ` +
             `Daimonic communication amplified by ${Math.round(liminal_experience.daimonic_amplification * 100)}%. ` +
             `${liminal_experience.liminal_wisdom}`;
    } else if (liminal_experience.liminal_intensity > 0.4) {
      return `Threshold experience: ${liminal_experience.threshold_type}. ` +
             `${liminal_experience.liminal_wisdom}`;
    } else {
      return 'Subtle liminal quality present. Stay receptive to what emerges between ordinary states.';
    }
  }
}