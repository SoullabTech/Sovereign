/**
 * CIRCADIAN RHYTHM OPTIMIZATION ENGINE
 *
 * Advanced circadian rhythm analysis and personalized optimization recommendations
 * Integrates sleep patterns, HRV data, dream quality, and consciousness states
 * for comprehensive circadian health optimization.
 *
 * Features:
 * - Circadian pattern analysis and phase tracking
 * - Personalized sleep-wake cycle optimization
 * - Light therapy and melatonin timing recommendations
 * - Integration with dream quality and consciousness depth
 * - Environmental optimization suggestions
 * - Seasonal adaptation strategies
 */

import { ParsedHealthData } from './HealthDataImporter';

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCADIAN RHYTHM INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CircadianProfile {
  userId: string;
  chronotype: 'extreme_morning' | 'moderate_morning' | 'intermediate' | 'moderate_evening' | 'extreme_evening';
  naturalWakeTime: string; // HH:MM format
  naturalSleepTime: string; // HH:MM format
  optimalSleepDuration: number; // hours
  lightSensitivity: 'low' | 'moderate' | 'high';
  melatoninProfile: {
    onsetTime: string; // HH:MM
    peakTime: string; // HH:MM
    offsetTime: string; // HH:MM
    sensitivity: number; // 0-1
  };
  coreBodyTemperatureRhythm: {
    minimumTime: string; // HH:MM, usually around 4-6 AM
    maximumTime: string; // HH:MM, usually around 6-8 PM
    amplitude: number; // degrees F/C variation
  };
}

export interface CircadianAnalysis {
  currentPhase: CircadianPhase;
  rhythmQuality: CircadianRhythmQuality;
  misalignment: CircadianMisalignment;
  optimization: CircadianOptimization;
  recommendations: CircadianRecommendation[];
  interventions: CircadianIntervention[];
}

export interface CircadianPhase {
  phase: 'wake_promotion' | 'morning_cortisol' | 'afternoon_alertness' | 'evening_wind_down' | 'melatonin_rise' | 'deep_sleep' | 'rem_sleep' | 'early_morning';
  timeInPhase: number; // minutes since phase began
  phaseProgress: number; // 0-1, how far through phase
  nextPhase: string;
  timeToNextPhase: number; // minutes
  phaseOptimal: boolean; // is user in sync with natural phase
}

export interface CircadianRhythmQuality {
  overall: number; // 0-1
  consistency: number; // 0-1, how consistent sleep-wake times are
  amplitude: number; // 0-1, strength of rhythm markers
  phase: number; // 0-1, how well aligned with natural rhythm
  flexibility: number; // 0-1, ability to adapt to schedule changes

  factors: {
    sleepTiming: number; // 0-1
    sleepDuration: number; // 0-1
    lightExposure: number; // 0-1
    activityTiming: number; // 0-1
    mealTiming: number; // 0-1
    socialCues: number; // 0-1
  };
}

export interface CircadianMisalignment {
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  type: 'advanced_phase' | 'delayed_phase' | 'irregular' | 'fragmented';

  // Specific misalignments
  sleepPhaseShift: number; // hours ahead/behind optimal (-/+)
  socialJetLag: number; // hours difference between work/free days
  lightExposureMisalignment: number; // 0-1, poor light timing
  activityMisalignment: number; // 0-1, activity at wrong times

  // Contributing factors
  contributingFactors: {
    screenTimeEvening: number; // 0-1 severity
    irregularSchedule: number; // 0-1 severity
    lateEating: number; // 0-1 severity
    insufficientMorningLight: number; // 0-1 severity
    caffeineTimingIssues: number; // 0-1 severity
    environmentalFactors: string[]; // noise, temperature, etc.
  };
}

export interface CircadianOptimization {
  targetSleepTime: string; // HH:MM
  targetWakeTime: string; // HH:MM
  transitionPlan: {
    currentOffset: number; // minutes difference from target
    dailyAdjustment: number; // minutes to shift each day
    transitionDays: number; // total days to reach target
    milestones: CircadianMilestone[];
  };

  // Optimization strategies
  lightTherapy: LightTherapyProtocol;
  melatoninProtocol: MelatoninProtocol;
  activityScheduling: ActivityScheduling;
  environmentalOptimization: EnvironmentalOptimization;
}

export interface CircadianRecommendation {
  category: 'light' | 'timing' | 'environment' | 'activity' | 'nutrition' | 'supplements' | 'behavioral';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string[];
  timeline: string; // "immediate", "within 1 week", "within 1 month"
  expectedBenefit: number; // 0-1
  difficulty: number; // 0-1

  // Integration with consciousness work
  consciousnessConnection?: string;
  dreamQualityImpact?: number; // 0-1
  wisdomEmergenceSupport?: boolean;
}

export interface CircadianIntervention {
  type: 'light_therapy' | 'melatonin' | 'chronotherapy' | 'behavioral' | 'environmental';
  urgency: 'immediate' | 'within_days' | 'within_weeks';
  duration: string; // "2 weeks", "1 month", "ongoing"
  protocol: any; // specific intervention details
  monitoring: string[]; // what to track during intervention
  successMetrics: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFIC PROTOCOL INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LightTherapyProtocol {
  morningLight: {
    startTime: string; // HH:MM
    duration: number; // minutes
    intensity: number; // lux
    wavelength: 'full_spectrum' | 'blue_enriched' | 'red_filtered';
    source: 'sunlight' | 'light_box' | 'dawn_simulator';
  };
  eveningLight: {
    reductionStartTime: string; // HH:MM
    blueBlockingStartTime: string; // HH:MM
    ambientLightLevel: number; // lux
    recommendations: string[];
  };
  noonLight?: {
    exposureTime: string; // HH:MM
    duration: number; // minutes
    purpose: 'circadian_anchoring' | 'winter_support' | 'shift_correction';
  };
}

export interface MelatoninProtocol {
  recommended: boolean;
  dosage: number; // mg
  timing: string; // HH:MM, hours before desired sleep time
  duration: string; // "2 weeks", "seasonal", "as needed"
  form: 'immediate_release' | 'extended_release' | 'sublingual';

  // Contraindications and considerations
  considerations: string[];
  alternatives: string[]; // natural melatonin support
  monitoring: string[]; // what to track
}

export interface ActivityScheduling {
  morningRoutine: {
    wakeTime: string;
    lightExposure: number; // minutes within first hour
    physicalActivity: string; // type and timing
    nutrition: string[]; // breakfast timing and composition
  };
  daytimeActivity: {
    peakPerformanceWindow: string; // HH:MM - HH:MM
    exerciseWindow: string; // HH:MM - HH:MM
    naturalEnergyDips: string[]; // times to expect lower energy
    optimization: string[];
  };
  eveningRoutine: {
    windDownStart: string; // HH:MM
    screenTimeEnd: string; // HH:MM
    relaxationActivities: string[];
    sleepPrepTime: string; // HH:MM
  };
}

export interface EnvironmentalOptimization {
  bedroom: {
    temperature: { optimal: number; range: string }; // degrees F
    humidity: { optimal: number; range: string }; // percentage
    darkness: string[]; // blackout recommendations
    soundscape: string[]; // noise control recommendations
    airQuality: string[]; // ventilation and purification
  };
  workspace: {
    lightingRecommendations: string[];
    breakScheduling: string[];
    environmentalCues: string[];
  };
  seasonal: {
    winterOptimizations: string[];
    summerOptimizations: string[];
    transitionSupport: string[];
  };
}

export interface CircadianMilestone {
  day: number;
  targetSleepTime: string;
  targetWakeTime: string;
  expectedBenefits: string[];
  checkpoints: string[]; // what to assess
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CIRCADIAN OPTIMIZER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class CircadianRhythmOptimizer {
  private userProfiles: Map<string, CircadianProfile> = new Map();
  private seasonalAdjustments: Map<string, any> = new Map();

  constructor() {
    this.initializeSeasonalData();
  }

  /**
   * Analyze user's circadian rhythm and provide optimization recommendations
   */
  async analyzeCircadianRhythm(
    userId: string,
    healthData: ParsedHealthData,
    dreamData?: any[],
    conversationInsights?: any[]
  ): Promise<CircadianAnalysis> {

    // Get or create user circadian profile
    const profile = await this.getUserCircadianProfile(userId, healthData);

    // Analyze current circadian state
    const currentPhase = this.analyzeCurrentPhase(healthData, profile);
    const rhythmQuality = this.assessRhythmQuality(healthData, profile);
    const misalignment = this.detectMisalignment(healthData, profile);

    // Generate optimization plan
    const optimization = await this.generateOptimizationPlan(profile, misalignment, rhythmQuality);

    // Create recommendations with consciousness integration
    const recommendations = await this.generateRecommendations(
      profile,
      misalignment,
      rhythmQuality,
      dreamData,
      conversationInsights
    );

    // Determine interventions if needed
    const interventions = await this.determineInterventions(misalignment, rhythmQuality);

    console.log(`🕐 Circadian analysis completed for user ${userId}: ${recommendations.length} recommendations`);

    return {
      currentPhase,
      rhythmQuality,
      misalignment,
      optimization,
      recommendations,
      interventions
    };
  }

  /**
   * Get or create a circadian profile for the user
   */
  private async getUserCircadianProfile(userId: string, healthData: ParsedHealthData): Promise<CircadianProfile> {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = await this.createCircadianProfile(userId, healthData);
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Create initial circadian profile based on sleep data
   */
  private async createCircadianProfile(userId: string, healthData: ParsedHealthData): Promise<CircadianProfile> {
    const sleepData = healthData.sleep.slice(0, 14); // Last 2 weeks

    // Analyze sleep timing patterns
    const sleepTimes = sleepData.map(s => s.startDate.getHours() + s.startDate.getMinutes() / 60);
    const wakeTimes = sleepData.map(s => {
      const wakeTime = new Date(s.startDate.getTime() + s.durationHours * 60 * 60 * 1000);
      return wakeTime.getHours() + wakeTime.getMinutes() / 60;
    });

    const avgSleepTime = this.calculateCircadianMean(sleepTimes);
    const avgWakeTime = this.calculateCircadianMean(wakeTimes);
    const avgSleepDuration = sleepData.reduce((sum, s) => sum + s.durationHours, 0) / sleepData.length;

    // Determine chronotype based on natural timing
    const chronotype = this.determineChronotype(avgSleepTime, avgWakeTime);

    // Estimate melatonin profile
    const melatoninProfile = this.estimateMelatoninProfile(avgSleepTime, avgWakeTime);

    // Estimate core body temperature rhythm
    const coreBodyTemperatureRhythm = this.estimateTemperatureRhythm(avgWakeTime);

    return {
      userId,
      chronotype,
      naturalWakeTime: this.formatTime(avgWakeTime),
      naturalSleepTime: this.formatTime(avgSleepTime),
      optimalSleepDuration: avgSleepDuration,
      lightSensitivity: 'moderate', // Default, can be refined with more data
      melatoninProfile,
      coreBodyTemperatureRhythm
    };
  }

  /**
   * Analyze current circadian phase
   */
  private analyzeCurrentPhase(healthData: ParsedHealthData, profile: CircadianProfile): CircadianPhase {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    // Define phase windows based on user's profile
    const wakeTime = this.parseTime(profile.naturalWakeTime);
    const sleepTime = this.parseTime(profile.naturalSleepTime);

    const phases = this.calculatePhaseWindows(wakeTime, sleepTime);
    const currentPhaseInfo = this.determineCurrentPhase(currentHour, phases);

    return {
      phase: currentPhaseInfo.phase,
      timeInPhase: currentPhaseInfo.timeInPhase,
      phaseProgress: currentPhaseInfo.progress,
      nextPhase: currentPhaseInfo.nextPhase,
      timeToNextPhase: currentPhaseInfo.timeToNext,
      phaseOptimal: currentPhaseInfo.optimal
    };
  }

  /**
   * Assess overall circadian rhythm quality
   */
  private assessRhythmQuality(healthData: ParsedHealthData, profile: CircadianProfile): CircadianRhythmQuality {
    const sleepData = healthData.sleep.slice(0, 14);

    // Calculate consistency (how regular sleep/wake times are)
    const sleepTimes = sleepData.map(s => s.startDate.getHours() + s.startDate.getMinutes() / 60);
    const wakeTimes = sleepData.map(s => {
      const wakeTime = new Date(s.startDate.getTime() + s.durationHours * 60 * 60 * 1000);
      return wakeTime.getHours() + wakeTime.getMinutes() / 60;
    });

    const sleepTimeVariability = this.calculateVariability(sleepTimes);
    const wakeTimeVariability = this.calculateVariability(wakeTimes);
    const consistency = Math.max(0, 1 - (sleepTimeVariability + wakeTimeVariability) / 2);

    // Calculate amplitude (strength of rhythm markers)
    const amplitude = this.assessRhythmAmplitude(healthData);

    // Calculate phase alignment
    const naturalSleepTime = this.parseTime(profile.naturalSleepTime);
    const actualSleepTime = sleepTimes.reduce((sum, time) => sum + time, 0) / sleepTimes.length;
    const phaseAlignment = Math.max(0, 1 - Math.abs(naturalSleepTime - actualSleepTime) / 6);

    // Assess flexibility (ability to adapt)
    const flexibility = this.assessScheduleFlexibility(sleepData);

    // Factor assessments
    const factors = {
      sleepTiming: phaseAlignment,
      sleepDuration: this.assessSleepDuration(sleepData, profile.optimalSleepDuration),
      lightExposure: 0.7, // Placeholder - would need light exposure data
      activityTiming: 0.7, // Placeholder - would need activity data
      mealTiming: 0.7, // Placeholder - would need meal timing data
      socialCues: consistency
    };

    const overall = (consistency + amplitude + phaseAlignment + flexibility +
                    Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length) / 5;

    return {
      overall,
      consistency,
      amplitude,
      phase: phaseAlignment,
      flexibility,
      factors
    };
  }

  /**
   * Detect circadian misalignment
   */
  private detectMisalignment(healthData: ParsedHealthData, profile: CircadianProfile): CircadianMisalignment {
    const sleepData = healthData.sleep.slice(0, 14);

    // Calculate various misalignment metrics
    const sleepPhaseShift = this.calculatePhaseShift(sleepData, profile);
    const socialJetLag = this.calculateSocialJetLag(sleepData);

    // Determine severity
    const maxShift = Math.max(Math.abs(sleepPhaseShift), socialJetLag);
    let severity: CircadianMisalignment['severity'];
    if (maxShift < 0.5) severity = 'none';
    else if (maxShift < 1) severity = 'mild';
    else if (maxShift < 2) severity = 'moderate';
    else severity = 'severe';

    // Determine type
    let type: CircadianMisalignment['type'];
    if (sleepPhaseShift < -1) type = 'advanced_phase';
    else if (sleepPhaseShift > 1) type = 'delayed_phase';
    else if (socialJetLag > 1) type = 'irregular';
    else type = 'fragmented';

    // Assess contributing factors
    const contributingFactors = this.assessContributingFactors(sleepData);

    return {
      severity,
      type,
      sleepPhaseShift,
      socialJetLag,
      lightExposureMisalignment: 0.3, // Placeholder
      activityMisalignment: 0.2, // Placeholder
      contributingFactors
    };
  }

  /**
   * Generate comprehensive optimization plan
   */
  private async generateOptimizationPlan(
    profile: CircadianProfile,
    misalignment: CircadianMisalignment,
    quality: CircadianRhythmQuality
  ): Promise<CircadianOptimization> {

    // Determine target sleep/wake times
    const currentSleepTime = this.parseTime(profile.naturalSleepTime);
    const currentWakeTime = this.parseTime(profile.naturalWakeTime);

    // Adjust based on chronotype and goals
    let targetSleepTime = currentSleepTime;
    let targetWakeTime = currentWakeTime;

    // Apply corrections for misalignment
    if (misalignment.severity !== 'none') {
      const correction = this.calculateOptimalCorrection(misalignment, profile);
      targetSleepTime = this.adjustTime(targetSleepTime, correction.sleepAdjustment);
      targetWakeTime = this.adjustTime(targetWakeTime, correction.wakeAdjustment);
    }

    // Create transition plan
    const currentOffset = Math.abs(currentSleepTime - targetSleepTime) * 60; // minutes
    const dailyAdjustment = Math.min(15, currentOffset / 7); // Max 15 min/day
    const transitionDays = Math.ceil(currentOffset / dailyAdjustment);

    const milestones = this.createTransitionMilestones(
      currentSleepTime,
      targetSleepTime,
      currentWakeTime,
      targetWakeTime,
      transitionDays
    );

    // Generate protocol recommendations
    const lightTherapy = this.designLightTherapyProtocol(profile, misalignment, targetWakeTime);
    const melatoninProtocol = this.designMelatoninProtocol(profile, misalignment, targetSleepTime);
    const activityScheduling = this.designActivityScheduling(profile, targetWakeTime, targetSleepTime);
    const environmentalOptimization = this.designEnvironmentalOptimization(profile);

    return {
      targetSleepTime: this.formatTime(targetSleepTime),
      targetWakeTime: this.formatTime(targetWakeTime),
      transitionPlan: {
        currentOffset,
        dailyAdjustment,
        transitionDays,
        milestones
      },
      lightTherapy,
      melatoninProtocol,
      activityScheduling,
      environmentalOptimization
    };
  }

  /**
   * Generate personalized recommendations with consciousness integration
   */
  private async generateRecommendations(
    profile: CircadianProfile,
    misalignment: CircadianMisalignment,
    quality: CircadianRhythmQuality,
    dreamData?: any[],
    conversationInsights?: any[]
  ): Promise<CircadianRecommendation[]> {

    const recommendations: CircadianRecommendation[] = [];

    // Light exposure recommendations
    if (quality.factors.lightExposure < 0.7) {
      recommendations.push({
        category: 'light',
        priority: 'high',
        title: 'Optimize Morning Light Exposure',
        description: 'Get bright light (10,000+ lux) within 30 minutes of waking to strengthen your circadian rhythm and improve dream recall.',
        implementation: [
          'Go outside for 15-30 minutes after waking, even on cloudy days',
          'Use a light therapy box (10,000 lux) if outdoor light is unavailable',
          'Face east-facing windows during morning routine',
          'Avoid sunglasses during morning light exposure'
        ],
        timeline: 'immediate',
        expectedBenefit: 0.8,
        difficulty: 0.2,
        consciousnessConnection: 'Morning light exposure enhances dream recall and supports natural consciousness transitions',
        dreamQualityImpact: 0.7,
        wisdomEmergenceSupport: true
      });
    }

    // Sleep timing optimization
    if (misalignment.severity !== 'none') {
      recommendations.push({
        category: 'timing',
        priority: 'critical',
        title: 'Gradual Sleep Schedule Adjustment',
        description: `Gradually shift your sleep time by 15 minutes every 2-3 days to align with your natural circadian rhythm and optimize dream states.`,
        implementation: [
          `Target bedtime: ${this.formatTime(this.parseTime(profile.naturalSleepTime))}`,
          'Use consistent sleep and wake times, even on weekends',
          'Set gradual alarms to support the transition',
          'Track sleep quality and dream intensity during adjustment'
        ],
        timeline: 'within 1 month',
        expectedBenefit: 0.9,
        difficulty: 0.6,
        consciousnessConnection: 'Proper circadian alignment enhances REM sleep quality and archetypal dream content',
        dreamQualityImpact: 0.9,
        wisdomEmergenceSupport: true
      });
    }

    // Evening routine for dream preparation
    recommendations.push({
      category: 'behavioral',
      priority: 'high',
      title: 'Dream-Optimized Evening Routine',
      description: 'Create an evening routine that supports both circadian health and dream consciousness preparation.',
      implementation: [
        'Begin wind-down routine 2 hours before sleep',
        'Dim lights and use blue light filters after sunset',
        'Practice dream intention setting or journaling',
        'Avoid screens 1 hour before sleep',
        'Use relaxation techniques like gentle breathwork'
      ],
      timeline: 'immediate',
      expectedBenefit: 0.8,
      difficulty: 0.4,
      consciousnessConnection: 'Evening preparation enhances dream lucidity and archetypal accessibility',
      dreamQualityImpact: 0.8,
      wisdomEmergenceSupport: true
    });

    // HRV and coherence optimization
    if (quality.factors.sleepTiming < 0.6) {
      recommendations.push({
        category: 'activity',
        priority: 'medium',
        title: 'Heart Rate Variability Optimization',
        description: 'Improve sleep quality and dream depth through HRV-enhancing practices aligned with your circadian rhythm.',
        implementation: [
          'Practice coherent breathing 20 minutes before sleep',
          'Avoid intense exercise 3 hours before bedtime',
          'Use HRV-guided recovery timing',
          'Consider cold exposure in morning/afternoon only'
        ],
        timeline: 'within 1 week',
        expectedBenefit: 0.7,
        difficulty: 0.3,
        consciousnessConnection: 'Higher HRV supports deeper sleep states and enhanced wisdom emergence in dreams',
        dreamQualityImpact: 0.6,
        wisdomEmergenceSupport: true
      });
    }

    // Nutrition timing for circadian support
    recommendations.push({
      category: 'nutrition',
      priority: 'medium',
      title: 'Circadian-Aligned Nutrition',
      description: 'Time your meals and nutrition to support your natural circadian rhythm and dream states.',
      implementation: [
        'Eat largest meal during peak metabolism (12-3 PM)',
        'Stop eating 3 hours before sleep to avoid dream disruption',
        'Include tryptophan-rich foods in evening meal',
        'Avoid caffeine after 2 PM',
        'Consider magnesium supplementation before sleep'
      ],
      timeline: 'immediate',
      expectedBenefit: 0.6,
      difficulty: 0.4,
      consciousnessConnection: 'Proper meal timing supports stable blood sugar during dream states',
      dreamQualityImpact: 0.5
    });

    // Integration with dream and consciousness work
    if (dreamData && dreamData.length > 0) {
      const dreamQualityTrend = this.analyzeDreamQualityTrend(dreamData);

      if (dreamQualityTrend < 0.7) {
        recommendations.push({
          category: 'behavioral',
          priority: 'high',
          title: 'Circadian-Dream Integration Protocol',
          description: 'Align your circadian optimization with your dream work for enhanced archetypal access and wisdom emergence.',
          implementation: [
            'Track sleep timing alongside dream quality and archetypal content',
            'Correlate circadian metrics with dream depth and wisdom emergence',
            'Adjust sleep schedule based on dream quality feedback',
            'Use natural wake times for dream journaling when possible'
          ],
          timeline: 'within 1 week',
          expectedBenefit: 0.9,
          difficulty: 0.5,
          consciousnessConnection: 'Integrated approach maximizes both sleep health and consciousness development',
          dreamQualityImpact: 0.9,
          wisdomEmergenceSupport: true
        });
      }
    }

    return recommendations.sort((a, b) => {
      // Sort by priority, then by expected benefit
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.expectedBenefit - a.expectedBenefit;
    });
  }

  /**
   * Determine if interventions are needed
   */
  private async determineInterventions(
    misalignment: CircadianMisalignment,
    quality: CircadianRhythmQuality
  ): Promise<CircadianIntervention[]> {

    const interventions: CircadianIntervention[] = [];

    // Severe misalignment requires immediate intervention
    if (misalignment.severity === 'severe') {
      interventions.push({
        type: 'chronotherapy',
        urgency: 'immediate',
        duration: '2-4 weeks',
        protocol: {
          method: 'controlled_light_dark_cycle',
          lightTherapyTiming: 'morning_and_evening',
          sleepRestriction: true,
          monitoringRequired: true
        },
        monitoring: ['sleep_timing', 'sleep_quality', 'mood', 'energy_levels', 'dream_recall'],
        successMetrics: ['sleep_timing_consistency', 'reduced_social_jetlag', 'improved_mood']
      });
    }

    // Poor rhythm quality may need behavioral intervention
    if (quality.overall < 0.6) {
      interventions.push({
        type: 'behavioral',
        urgency: 'within_days',
        duration: '4-6 weeks',
        protocol: {
          sleepHygieneProtocol: true,
          environmentalOptimization: true,
          activityScheduling: true,
          stressManagement: true
        },
        monitoring: ['sleep_efficiency', 'sleep_onset_time', 'wake_time_consistency'],
        successMetrics: ['improved_sleep_quality', 'enhanced_dream_recall', 'stable_energy_patterns']
      });
    }

    return interventions;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private initializeSeasonalData(): void {
    // Initialize seasonal adjustment data
    // This would include daylight hours, seasonal affective adjustments, etc.
  }

  private calculateCircadianMean(times: number[]): number {
    // Handle circular time averaging (e.g., 23.5 and 0.5 should average to 0, not 12)
    const sines = times.map(t => Math.sin(2 * Math.PI * t / 24));
    const cosines = times.map(t => Math.cos(2 * Math.PI * t / 24));
    const meanSine = sines.reduce((sum, s) => sum + s, 0) / sines.length;
    const meanCosine = cosines.reduce((sum, c) => sum + c, 0) / cosines.length;
    let meanTime = Math.atan2(meanSine, meanCosine) * 24 / (2 * Math.PI);
    if (meanTime < 0) meanTime += 24;
    return meanTime;
  }

  private determineChronotype(avgSleepTime: number, avgWakeTime: number): CircadianProfile['chronotype'] {
    const midSleep = (avgSleepTime + avgWakeTime) / 2;
    if (midSleep < 1) return 'extreme_morning';
    if (midSleep < 2) return 'moderate_morning';
    if (midSleep < 4) return 'intermediate';
    if (midSleep < 5) return 'moderate_evening';
    return 'extreme_evening';
  }

  private estimateMelatoninProfile(sleepTime: number, wakeTime: number): CircadianProfile['melatoninProfile'] {
    // Melatonin typically begins rising ~2 hours before sleep
    const onsetTime = this.adjustTime(sleepTime, -2);
    // Peak is typically 3-4 hours after onset
    const peakTime = this.adjustTime(onsetTime, 3.5);
    // Offset is typically 2-3 hours before wake
    const offsetTime = this.adjustTime(wakeTime, -2.5);

    return {
      onsetTime: this.formatTime(onsetTime),
      peakTime: this.formatTime(peakTime),
      offsetTime: this.formatTime(offsetTime),
      sensitivity: 0.7 // Default moderate sensitivity
    };
  }

  private estimateTemperatureRhythm(wakeTime: number): CircadianProfile['coreBodyTemperatureRhythm'] {
    // Core body temperature minimum typically 1-3 hours before wake
    const minimumTime = this.adjustTime(wakeTime, -2);
    // Maximum typically 8-10 hours after wake
    const maximumTime = this.adjustTime(wakeTime, 9);

    return {
      minimumTime: this.formatTime(minimumTime),
      maximumTime: this.formatTime(maximumTime),
      amplitude: 1.5 // degrees F variation
    };
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  }

  private formatTime(time: number): string {
    const hours = Math.floor(time) % 24;
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private adjustTime(time: number, adjustment: number): number {
    let newTime = time + adjustment;
    while (newTime < 0) newTime += 24;
    while (newTime >= 24) newTime -= 24;
    return newTime;
  }

  // Placeholder methods for complex calculations
  private calculatePhaseWindows(wakeTime: number, sleepTime: number): any {
    return {}; // Implementation would define phase windows
  }

  private determineCurrentPhase(currentHour: number, phases: any): any {
    return {
      phase: 'wake_promotion',
      timeInPhase: 30,
      progress: 0.5,
      nextPhase: 'morning_cortisol',
      timeToNext: 60,
      optimal: true
    };
  }

  private calculateVariability(times: number[]): number {
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    return Math.sqrt(variance);
  }

  private assessRhythmAmplitude(healthData: ParsedHealthData): number {
    // Would analyze HRV, activity, and other rhythm markers
    return 0.7; // Placeholder
  }

  private assessScheduleFlexibility(sleepData: any[]): number {
    // Would analyze ability to adapt to schedule changes
    return 0.6; // Placeholder
  }

  private assessSleepDuration(sleepData: any[], optimal: number): number {
    const avgDuration = sleepData.reduce((sum, s) => sum + s.durationHours, 0) / sleepData.length;
    return Math.max(0, 1 - Math.abs(avgDuration - optimal) / 2);
  }

  private calculatePhaseShift(sleepData: any[], profile: CircadianProfile): number {
    const actualSleepTime = sleepData.reduce((sum, s) => sum + s.startDate.getHours() + s.startDate.getMinutes() / 60, 0) / sleepData.length;
    const naturalSleepTime = this.parseTime(profile.naturalSleepTime);
    return actualSleepTime - naturalSleepTime;
  }

  private calculateSocialJetLag(sleepData: any[]): number {
    // Calculate difference between weekday and weekend sleep patterns
    const weekdayData = sleepData.filter(s => s.startDate.getDay() % 6 !== 0);
    const weekendData = sleepData.filter(s => s.startDate.getDay() % 6 === 0);

    if (weekdayData.length === 0 || weekendData.length === 0) return 0;

    const weekdayAvg = weekdayData.reduce((sum, s) => sum + s.startDate.getHours(), 0) / weekdayData.length;
    const weekendAvg = weekendData.reduce((sum, s) => sum + s.startDate.getHours(), 0) / weekendData.length;

    return Math.abs(weekendAvg - weekdayAvg);
  }

  private assessContributingFactors(sleepData: any[]): CircadianMisalignment['contributingFactors'] {
    return {
      screenTimeEvening: 0.3, // Placeholder values
      irregularSchedule: 0.4,
      lateEating: 0.2,
      insufficientMorningLight: 0.5,
      caffeineTimingIssues: 0.3,
      environmentalFactors: ['noise', 'temperature_variation']
    };
  }

  private calculateOptimalCorrection(misalignment: CircadianMisalignment, profile: CircadianProfile): any {
    return {
      sleepAdjustment: -misalignment.sleepPhaseShift / 2,
      wakeAdjustment: -misalignment.sleepPhaseShift / 2
    };
  }

  private createTransitionMilestones(
    currentSleep: number, targetSleep: number,
    currentWake: number, targetWake: number,
    days: number
  ): CircadianMilestone[] {
    const milestones: CircadianMilestone[] = [];
    const sleepAdjustment = (targetSleep - currentSleep) / days;
    const wakeAdjustment = (targetWake - currentWake) / days;

    for (let day = 1; day <= days; day += 3) { // Every 3 days
      milestones.push({
        day,
        targetSleepTime: this.formatTime(currentSleep + sleepAdjustment * day),
        targetWakeTime: this.formatTime(currentWake + wakeAdjustment * day),
        expectedBenefits: ['Improved sleep onset', 'Better morning energy'],
        checkpoints: ['Sleep quality rating', 'Morning alertness', 'Dream recall']
      });
    }

    return milestones;
  }

  private designLightTherapyProtocol(
    profile: CircadianProfile,
    misalignment: CircadianMisalignment,
    targetWakeTime: number
  ): LightTherapyProtocol {
    return {
      morningLight: {
        startTime: this.formatTime(targetWakeTime),
        duration: 30,
        intensity: 10000,
        wavelength: 'blue_enriched',
        source: 'sunlight'
      },
      eveningLight: {
        reductionStartTime: this.formatTime(targetWakeTime + 10),
        blueBlockingStartTime: this.formatTime(targetWakeTime + 12),
        ambientLightLevel: 50,
        recommendations: ['Use blue light blocking glasses', 'Dim all screens', 'Use warm lighting only']
      }
    };
  }

  private designMelatoninProtocol(
    profile: CircadianProfile,
    misalignment: CircadianMisalignment,
    targetSleepTime: number
  ): MelatoninProtocol {
    const needsSupplementation = misalignment.severity === 'severe' || misalignment.type === 'delayed_phase';

    return {
      recommended: needsSupplementation,
      dosage: 0.5, // Start low
      timing: this.formatTime(this.adjustTime(targetSleepTime, -1)), // 1 hour before sleep
      duration: 'as needed',
      form: 'immediate_release',
      considerations: ['Start with lowest dose', 'Monitor morning grogginess', 'Use consistently'],
      alternatives: ['Cherry juice', 'Magnesium', 'L-theanine'],
      monitoring: ['Sleep onset time', 'Sleep quality', 'Morning alertness']
    };
  }

  private designActivityScheduling(
    profile: CircadianProfile,
    targetWakeTime: number,
    targetSleepTime: number
  ): ActivityScheduling {
    return {
      morningRoutine: {
        wakeTime: this.formatTime(targetWakeTime),
        lightExposure: 30,
        physicalActivity: 'Light movement or stretching within 1 hour',
        nutrition: ['Protein-rich breakfast within 2 hours', 'Avoid sugar spikes']
      },
      daytimeActivity: {
        peakPerformanceWindow: `${this.formatTime(targetWakeTime + 2)} - ${this.formatTime(targetWakeTime + 6)}`,
        exerciseWindow: `${this.formatTime(targetWakeTime + 1)} - ${this.formatTime(targetSleepTime - 4)}`,
        naturalEnergyDips: [this.formatTime(targetWakeTime + 7), this.formatTime(targetWakeTime + 13)],
        optimization: ['Schedule demanding tasks during peak windows', 'Use energy dips for rest or light activity']
      },
      eveningRoutine: {
        windDownStart: this.formatTime(this.adjustTime(targetSleepTime, -2)),
        screenTimeEnd: this.formatTime(this.adjustTime(targetSleepTime, -1)),
        relaxationActivities: ['Reading', 'Gentle stretching', 'Meditation', 'Dream journaling preparation'],
        sleepPrepTime: this.formatTime(this.adjustTime(targetSleepTime, -0.5))
      }
    };
  }

  private designEnvironmentalOptimization(profile: CircadianProfile): EnvironmentalOptimization {
    return {
      bedroom: {
        temperature: { optimal: 68, range: '65-70°F' },
        humidity: { optimal: 50, range: '40-60%' },
        darkness: ['Blackout curtains', 'Eye mask if needed', 'Remove LED lights'],
        soundscape: ['White noise machine', 'Earplugs if necessary', 'Minimize disruptive sounds'],
        airQuality: ['Good ventilation', 'Air purifier if needed', 'Plants for oxygen']
      },
      workspace: {
        lightingRecommendations: ['Bright light during day', 'Natural light when possible', 'Avoid bright screens in evening'],
        breakScheduling: ['Regular breaks every 90 minutes', 'Outdoor breaks when possible'],
        environmentalCues: ['Consistent lighting schedule', 'Temperature regulation']
      },
      seasonal: {
        winterOptimizations: ['Light therapy box', 'Vitamin D supplementation', 'Extended morning light'],
        summerOptimizations: ['Cooling strategies', 'Earlier bedtime adjustment', 'UV protection'],
        transitionSupport: ['Gradual schedule adjustments', 'Monitor energy levels', 'Adjust light exposure']
      }
    };
  }

  private analyzeDreamQualityTrend(dreamData: any[]): number {
    // Analyze trend in dream quality/consciousness depth
    const recentDreams = dreamData.slice(0, 7).filter(d => d.consciousnessDepth);
    if (recentDreams.length === 0) return 0.5;

    const avgDepth = recentDreams.reduce((sum, d) => sum + d.consciousnessDepth, 0) / recentDreams.length;
    return avgDepth / 10; // Assuming depth scale is 0-10
  }
}