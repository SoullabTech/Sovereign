/**
 * REAL-TIME TRANSIT INTEGRATION
 *
 * "The breeze at dawn has secrets to tell you"
 *
 * This system integrates live cosmic timing with consciousness translation,
 * creating the dynamic field where archetypal patterns are activated
 * by current astrological transits.
 */

import { patternDatabase } from './pattern-database';
import type { ArchetypalPattern, TimingWindow, SystemType } from './consciousness-translation-engine';

// ==================== TRANSIT TYPES ====================

export interface PlanetaryPosition {
  planet: Planet;
  sign: AstrologicalSign;
  degree: number;
  house?: number; // Depends on individual birth chart
  retrograde: boolean;
}

export interface AspectInfo {
  type: AspectType;
  planet1: Planet;
  planet2: Planet;
  orb: number;
  exact: boolean;
  applying: boolean; // Is the aspect getting tighter?
}

export interface TransitEvent {
  id: string;
  type: TransitType;
  planet: Planet;
  position: PlanetaryPosition;
  aspect?: AspectInfo;
  startTime: Date;
  peakTime: Date;
  endTime: Date;
  intensity: number; // 0-1
  archetypalActivations: string[]; // Pattern IDs activated by this transit
}

export interface JourneyField {
  currentTransits: TransitEvent[];
  activePatterns: string[];
  fieldIntensity: number;
  dominantElement: string;
  phase: 'building' | 'peak' | 'integrating' | 'resting';
  recommendations: FieldRecommendation[];
  nextSignificantEvent: TransitEvent | null;
}

export interface FieldRecommendation {
  type: 'activation' | 'integration' | 'rest' | 'transformation';
  pattern: string;
  timing: 'now' | 'soon' | 'prepare';
  description: string;
  method: string;
  duration: number; // minutes
}

// ==================== ENUMS ====================

export type Planet =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'Chiron' | 'NorthNode' | 'SouthNode';

export type AstrologicalSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type AspectType =
  | 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
  | 'quintile' | 'sesquiquadrate' | 'semisquare';

export type TransitType =
  | 'ingress' | 'aspect' | 'station' | 'eclipse' | 'newMoon' | 'fullMoon';

// ==================== PLANETARY ARCHETYPAL MAPPINGS ====================

const PLANETARY_PATTERN_MAPPINGS: Record<Planet, string[]> = {
  Sun: ['hero', 'ruler', 'creator'],
  Moon: ['innocent', 'caregiver', 'lover'],
  Mercury: ['magician', 'explorer', 'sage'],
  Venus: ['lover', 'creator', 'caregiver'],
  Mars: ['hero', 'rebel', 'destroyer'],
  Jupiter: ['explorer', 'sage', 'magician'],
  Saturn: ['ruler', 'destroyer', 'sage'],
  Uranus: ['rebel', 'magician', 'explorer'],
  Neptune: ['innocent', 'creator', 'sage'],
  Pluto: ['destroyer', 'magician', 'rebel'],
  Chiron: ['orphan', 'caregiver', 'sage'],
  NorthNode: ['hero', 'magician', 'explorer'],
  SouthNode: ['sage', 'caregiver', 'innocent']
};

const SIGN_ELEMENT_MAPPINGS: Record<AstrologicalSign, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water'
};

const ASPECT_INTENSITY_MAPPINGS: Record<AspectType, number> = {
  conjunction: 1.0,
  opposition: 0.9,
  square: 0.8,
  trine: 0.7,
  sextile: 0.6,
  quintile: 0.5,
  sesquiquadrate: 0.4,
  semisquare: 0.3
};

// ==================== REAL-TIME TRANSIT ENGINE ====================

export class RealTimeTransitEngine {
  private currentTransits: Map<string, TransitEvent> = new Map();
  private journeyField: JourneyField | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startRealTimeUpdates();
  }

  // ==================== CORE METHODS ====================

  getCurrentJourneyField(): JourneyField {
    if (!this.journeyField) {
      this.updateJourneyField();
    }
    return this.journeyField!;
  }

  getActivePatterns(): ArchetypalPattern[] {
    const field = this.getCurrentJourneyField();
    return field.activePatterns
      .map(id => patternDatabase.getPattern(id))
      .filter(Boolean) as ArchetypalPattern[];
  }

  getOptimalTranslationTiming(
    patterns: string[],
    systems: SystemType[]
  ): TimingWindow {
    const field = this.getCurrentJourneyField();
    const now = new Date();

    // Calculate timing based on current field intensity and pattern activation
    const patternResonance = patterns.reduce((total, patternId) => {
      return total + (field.activePatterns.includes(patternId) ? 0.3 : 0);
    }, 0);

    const systemResonance: Record<SystemType, number> = {
      astrology: Math.min(0.9, 0.6 + field.fieldIntensity * 0.3),
      alchemy: this.calculateElementalResonance(field.dominantElement),
      psychology: 0.7,
      spiral: 0.6,
      somatic: this.calculateSomaticResonance(field.phase),
      mythology: 0.6,
      energy: Math.min(0.9, 0.5 + field.fieldIntensity * 0.4),
      archetypal: Math.min(1.0, 0.7 + patternResonance)
    };

    return {
      optimal: field.fieldIntensity > 0.6 && patternResonance > 0.2,
      startDate: now,
      endDate: new Date(now.getTime() + this.calculateOptimalWindowDuration(field)),
      intensity: Math.min(1.0, field.fieldIntensity + patternResonance),
      systemResonance,
      description: this.generateTimingDescription(field, patternResonance)
    };
  }

  // ==================== FIELD CALCULATION METHODS ====================

  private updateJourneyField(): void {
    const now = new Date();
    const currentTransits = this.getCurrentTransits(now);
    const activePatterns = this.calculateActivePatterns(currentTransits);
    const fieldIntensity = this.calculateFieldIntensity(currentTransits);
    const dominantElement = this.calculateDominantElement(currentTransits);
    const phase = this.calculateFieldPhase(currentTransits, fieldIntensity);
    const recommendations = this.generateFieldRecommendations(activePatterns, phase, fieldIntensity);
    const nextEvent = this.findNextSignificantEvent(now);

    this.journeyField = {
      currentTransits,
      activePatterns,
      fieldIntensity,
      dominantElement,
      phase,
      recommendations,
      nextSignificantEvent: nextEvent
    };
  }

  private getCurrentTransits(time: Date): TransitEvent[] {
    // This would integrate with real ephemeris data
    // For now, we'll simulate some transits based on current time
    return this.generateSimulatedTransits(time);
  }

  private generateSimulatedTransits(time: Date): TransitEvent[] {
    const transits: TransitEvent[] = [];
    const hour = time.getHours();
    const day = time.getDate();

    // Generate some sample transits based on time patterns
    // This is simplified - real implementation would use Swiss Ephemeris or similar

    // Sun transit (always present)
    transits.push({
      id: `sun-transit-${time.getTime()}`,
      type: 'ingress',
      planet: 'Sun',
      position: {
        planet: 'Sun',
        sign: this.getCurrentSunSign(time),
        degree: (day * 30 / 30) % 30,
        retrograde: false
      },
      startTime: new Date(time.getTime() - 12 * 60 * 60 * 1000),
      peakTime: time,
      endTime: new Date(time.getTime() + 12 * 60 * 60 * 1000),
      intensity: 0.6,
      archetypalActivations: PLANETARY_PATTERN_MAPPINGS.Sun
    });

    // Moon transit (changes every ~2.5 days)
    const moonSign = this.getCurrentMoonSign(time);
    transits.push({
      id: `moon-transit-${time.getTime()}`,
      type: 'ingress',
      planet: 'Moon',
      position: {
        planet: 'Moon',
        sign: moonSign,
        degree: (hour * 15) % 30, // Rough approximation
        retrograde: false
      },
      startTime: new Date(time.getTime() - 6 * 60 * 60 * 1000),
      peakTime: time,
      endTime: new Date(time.getTime() + 6 * 60 * 60 * 1000),
      intensity: 0.7,
      archetypalActivations: PLANETARY_PATTERN_MAPPINGS.Moon
    });

    // Add some dynamic aspects based on time patterns
    if (hour % 6 === 0) { // Every 6 hours, simulate a significant aspect
      transits.push({
        id: `aspect-${time.getTime()}`,
        type: 'aspect',
        planet: 'Mars',
        position: {
          planet: 'Mars',
          sign: 'Aries',
          degree: 15,
          retrograde: false
        },
        aspect: {
          type: 'square',
          planet1: 'Mars',
          planet2: 'Pluto',
          orb: 2,
          exact: true,
          applying: false
        },
        startTime: new Date(time.getTime() - 2 * 60 * 60 * 1000),
        peakTime: time,
        endTime: new Date(time.getTime() + 2 * 60 * 60 * 1000),
        intensity: 0.8,
        archetypalActivations: ['hero', 'rebel', 'destroyer']
      });
    }

    return transits;
  }

  private getCurrentSunSign(time: Date): AstrologicalSign {
    const month = time.getMonth() + 1;
    const day = time.getDate();

    // Simplified sun sign calculation
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  }

  private getCurrentMoonSign(time: Date): AstrologicalSign {
    // Simplified moon sign calculation based on day of year
    const dayOfYear = Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const moonCycle = (dayOfYear * 12 / 365) % 12;

    const signs: AstrologicalSign[] = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    return signs[Math.floor(moonCycle)];
  }

  private calculateActivePatterns(transits: TransitEvent[]): string[] {
    const activePatterns = new Set<string>();

    transits.forEach(transit => {
      transit.archetypalActivations.forEach(pattern => {
        activePatterns.add(pattern);
      });
    });

    return Array.from(activePatterns);
  }

  private calculateFieldIntensity(transits: TransitEvent[]): number {
    const totalIntensity = transits.reduce((sum, transit) => sum + transit.intensity, 0);
    const maxPossibleIntensity = transits.length * 1.0;
    return maxPossibleIntensity > 0 ? totalIntensity / maxPossibleIntensity : 0;
  }

  private calculateDominantElement(transits: TransitEvent[]): string {
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };

    transits.forEach(transit => {
      const element = SIGN_ELEMENT_MAPPINGS[transit.position.sign];
      elementCounts[element] += transit.intensity;
    });

    return Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private calculateFieldPhase(transits: TransitEvent[], intensity: number): 'building' | 'peak' | 'integrating' | 'resting' {
    if (intensity < 0.3) return 'resting';
    if (intensity > 0.8) return 'peak';

    // Check if intensity is increasing (building) or decreasing (integrating)
    const now = new Date();
    const buildingTransits = transits.filter(t => t.peakTime > now).length;
    const integratingTransits = transits.filter(t => t.peakTime < now).length;

    return buildingTransits > integratingTransits ? 'building' : 'integrating';
  }

  private generateFieldRecommendations(
    patterns: string[],
    phase: string,
    intensity: number
  ): FieldRecommendation[] {
    const recommendations: FieldRecommendation[] = [];

    // Phase-based recommendations
    switch (phase) {
      case 'building':
        recommendations.push({
          type: 'activation',
          pattern: patterns[0] || 'hero',
          timing: 'now',
          description: 'Energy is building - prepare for activation',
          method: 'Conscious breathing and intention setting',
          duration: 10
        });
        break;

      case 'peak':
        recommendations.push({
          type: 'transformation',
          pattern: patterns[0] || 'magician',
          timing: 'now',
          description: 'Peak energy available for transformation work',
          method: 'Deep transformation practices and pattern work',
          duration: 30
        });
        break;

      case 'integrating':
        recommendations.push({
          type: 'integration',
          pattern: patterns[0] || 'sage',
          timing: 'soon',
          description: 'Time to integrate and understand experiences',
          method: 'Reflection, journaling, and meaning-making',
          duration: 20
        });
        break;

      case 'resting':
        recommendations.push({
          type: 'rest',
          pattern: patterns[0] || 'innocent',
          timing: 'now',
          description: 'Rest and replenish energy',
          method: 'Gentle practices, rest, and self-care',
          duration: 15
        });
        break;
    }

    return recommendations;
  }

  private findNextSignificantEvent(currentTime: Date): TransitEvent | null {
    // This would calculate the next significant astrological event
    // For now, return a sample future event
    const futureTime = new Date(currentTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

    return {
      id: `future-event-${futureTime.getTime()}`,
      type: 'aspect',
      planet: 'Venus',
      position: {
        planet: 'Venus',
        sign: 'Libra',
        degree: 23,
        retrograde: false
      },
      aspect: {
        type: 'trine',
        planet1: 'Venus',
        planet2: 'Jupiter',
        orb: 1,
        exact: true,
        applying: true
      },
      startTime: new Date(futureTime.getTime() - 60 * 60 * 1000),
      peakTime: futureTime,
      endTime: new Date(futureTime.getTime() + 60 * 60 * 1000),
      intensity: 0.9,
      archetypalActivations: ['lover', 'creator', 'sage']
    };
  }

  // ==================== HELPER METHODS ====================

  private calculateElementalResonance(element: string): number {
    const resonanceMap = {
      fire: 0.8, // Strong alchemical connection
      water: 0.7,
      earth: 0.6,
      air: 0.7
    };
    return resonanceMap[element] || 0.6;
  }

  private calculateSomaticResonance(phase: string): number {
    const resonanceMap = {
      building: 0.8, // High activation
      peak: 0.9,     // Maximum embodiment
      integrating: 0.7, // Processing
      resting: 0.5   // Low activation
    };
    return resonanceMap[phase] || 0.6;
  }

  private calculateOptimalWindowDuration(field: JourneyField): number {
    // Duration in milliseconds based on field intensity
    const baseWindow = 2 * 60 * 60 * 1000; // 2 hours
    const intensityMultiplier = 1 + (field.fieldIntensity * 2); // 1-3x
    return baseWindow * intensityMultiplier;
  }

  private generateTimingDescription(field: JourneyField, patternResonance: number): string {
    const { phase, dominantElement, fieldIntensity } = field;

    let description = `Current field is in ${phase} phase with ${dominantElement} dominance`;

    if (fieldIntensity > 0.8) {
      description += ". High-intensity period optimal for deep work.";
    } else if (fieldIntensity > 0.6) {
      description += ". Moderate intensity, good for focused practice.";
    } else {
      description += ". Gentle energy, ideal for reflection and integration.";
    }

    if (patternResonance > 0.3) {
      description += " Strong archetypal activation present.";
    }

    return description;
  }

  // ==================== LIFECYCLE METHODS ====================

  private startRealTimeUpdates(): void {
    // Update every 15 minutes
    this.updateInterval = setInterval(() => {
      this.updateJourneyField();
    }, 15 * 60 * 1000);

    // Initial update
    this.updateJourneyField();
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // ==================== PUBLIC API METHODS ====================

  getFieldSummary(): string {
    const field = this.getCurrentJourneyField();
    const patterns = field.activePatterns.slice(0, 3).join(', ');

    return `${field.phase.charAt(0).toUpperCase() + field.phase.slice(1)} phase, ` +
           `${field.dominantElement} dominant, ` +
           `${Math.round(field.fieldIntensity * 100)}% intensity. ` +
           `Active patterns: ${patterns}`;
  }

  getNextEventDescription(): string {
    const field = this.getCurrentJourneyField();
    const nextEvent = field.nextSignificantEvent;

    if (!nextEvent) return "No significant events detected in the near future.";

    const timeUntil = nextEvent.peakTime.getTime() - new Date().getTime();
    const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));

    return `Next: ${nextEvent.planet} ${nextEvent.type} in ${hoursUntil} hours, ` +
           `activating ${nextEvent.archetypalActivations.join(', ')} patterns`;
  }
}

// Export singleton instance
export const transitEngine = new RealTimeTransitEngine();