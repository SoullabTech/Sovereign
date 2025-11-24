/**
 * Elemental Coherence Calculator
 *
 * Integrates biometric data, fascial health, and consciousness markers
 * to calculate elemental balance and overall field coherence.
 *
 * Based on MAIA's elemental framework:
 * - Fire: Vision, action, creative energy
 * - Water: Emotion, flow, intuition
 * - Earth: Structure, grounding, embodiment
 * - Air: Communication, breath, mental clarity
 * - Aether: Integration, coherence, quantum connection
 */

import type { ParsedHealthData, HRVReading } from './HealthDataImporter';
import type { FascialHealthAssessment } from './FascialHealthTracker';

export interface ElementalCoherence {
  timestamp: Date;

  // Individual element scores (0-100)
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;

  // Overall coherence (0-100)
  overallCoherence: number;

  // Balance score (how evenly distributed the elements are)
  balance: number;

  // Dominant and deficient elements
  dominant: string[];
  deficient: string[];

  // Data sources used
  sources: {
    hasHRV: boolean;
    hasFascia: boolean;
    hasBreath: boolean;
  };

  // Insights
  insights: string[];
  recommendations: string[];
}

/**
 * Calculate HRV-based metrics
 * HRV indicates nervous system balance (sympathetic/parasympathetic)
 */
function calculateHRVContribution(hrv: HRVReading | null): {
  water: number;  // HRV = emotional/parasympathetic balance
  earth: number;  // Grounding/nervous system stability
  aether: number; // Coherence
} {
  if (!hrv) {
    return { water: 50, earth: 50, aether: 50 }; // Neutral if no data
  }

  // Apple Health exports HRV as RMSSD (Root Mean Square of Successive Differences)
  // stored in the 'value' field
  // Higher = better parasympathetic (rest/digest) tone
  // Optimal range: 30-100ms
  const rmssd = hrv.value;
  const rmssdScore = Math.min(100, (rmssd / 100) * 100);

  // Use RMSSD as proxy for overall HRV health
  // In absence of separate SDNN, we treat RMSSD as general nervous system flexibility
  const hrvScore = rmssdScore;

  return {
    water: rmssdScore,      // Parasympathetic = Water element
    earth: hrvScore,        // Stability = Earth element
    aether: rmssdScore      // Combined coherence (using RMSSD as primary marker)
  };
}

/**
 * Calculate fascia-based elemental contribution
 */
function calculateFasciaContribution(fascia: FascialHealthAssessment | null): {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
} {
  if (!fascia || !fascia.elementalState) {
    return { fire: 50, water: 50, earth: 50, air: 50, aether: 50 };
  }

  // Convert 1-10 scale to 0-100
  return {
    fire: fascia.elementalState.fire * 10,
    water: fascia.elementalState.water * 10,
    earth: fascia.elementalState.earth * 10,
    air: fascia.elementalState.air * 10,
    aether: fascia.elementalState.aether * 10
  };
}

/**
 * Calculate respiratory contribution
 */
function calculateRespiratoryContribution(respiratoryRate: number | null): {
  air: number;
  water: number;
} {
  if (!respiratoryRate) {
    return { air: 50, water: 50 };
  }

  // Optimal resting respiratory rate: 12-16 breaths/min
  // Slower (6-12) = coherent breathing, meditation states
  // Faster (>16) = stress, sympathetic activation
  let airScore = 50;
  let waterScore = 50;

  if (respiratoryRate >= 6 && respiratoryRate <= 12) {
    airScore = 90; // Coherent breathing
    waterScore = 80; // Calm, parasympathetic
  } else if (respiratoryRate >= 12 && respiratoryRate <= 16) {
    airScore = 70; // Normal
    waterScore = 60;
  } else if (respiratoryRate > 16) {
    airScore = 40; // Fast breathing
    waterScore = 30; // Stress response
  }

  return { air: airScore, water: waterScore };
}

/**
 * Main coherence calculation
 */
export function calculateElementalCoherence(
  healthData: ParsedHealthData | null,
  fasciaAssessment: FascialHealthAssessment | null
): ElementalCoherence {
  // Get latest HRV reading
  const latestHRV = healthData?.hrv?.[0] || null;

  // Get latest respiratory rate (if available)
  const latestRespiratory = healthData?.respiratory?.[0]?.value || null;

  // Calculate contributions
  const hrvContrib = calculateHRVContribution(latestHRV);
  const fasciaContrib = calculateFasciaContribution(fasciaAssessment);
  const respContrib = calculateRespiratoryContribution(latestRespiratory);

  // Weighted integration (fascia gets highest weight as it's most direct measure)
  const fire = fasciaContrib.fire;

  const water = fasciaAssessment
    ? (fasciaContrib.water * 0.5 + hrvContrib.water * 0.3 + respContrib.water * 0.2)
    : (hrvContrib.water * 0.6 + respContrib.water * 0.4);

  const earth = fasciaAssessment
    ? (fasciaContrib.earth * 0.6 + hrvContrib.earth * 0.4)
    : hrvContrib.earth;

  const air = fasciaAssessment
    ? (fasciaContrib.air * 0.6 + respContrib.air * 0.4)
    : respContrib.air;

  const aether = fasciaAssessment
    ? (fasciaContrib.aether * 0.5 + hrvContrib.aether * 0.5)
    : hrvContrib.aether;

  // Overall coherence (average of all elements)
  const overallCoherence = (fire + water + earth + air + aether) / 5;

  // Balance score (inverse of standard deviation - lower SD = better balance)
  const elements = [fire, water, earth, air, aether];
  const mean = elements.reduce((sum, val) => sum + val, 0) / elements.length;
  const variance = elements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / elements.length;
  const stdDev = Math.sqrt(variance);
  const balance = Math.max(0, 100 - stdDev);

  // Identify dominant and deficient elements
  const elementMap = { fire, water, earth, air, aether };
  const sorted = Object.entries(elementMap).sort(([, a], [, b]) => b - a);
  const dominant = sorted.slice(0, 2).filter(([, val]) => val >= 70).map(([name]) => name);
  const deficient = sorted.slice(-2).filter(([, val]) => val <= 40).map(([name]) => name);

  // Generate insights
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (overallCoherence >= 80) {
    insights.push("Exceptional field coherence. Your system is operating at high integration.");
  } else if (overallCoherence >= 60) {
    insights.push("Good coherence. You're moving toward integration.");
  } else if (overallCoherence < 40) {
    insights.push("Low coherence detected. Multiple systems need attention.");
  }

  if (balance >= 80) {
    insights.push("Beautiful elemental balance. All aspects of self are harmonized.");
  } else if (balance < 50) {
    insights.push("Significant imbalance between elements. Consider practices that address deficient areas.");
  }

  // Element-specific insights and recommendations
  if (fire < 40) {
    insights.push("Low Fire: Creative energy and forward momentum are dampened.");
    recommendations.push("Fire practices: Set clear intentions, engage in creative projects, physical movement that generates heat.");
  }

  if (water < 40) {
    insights.push("Low Water: Emotional flow and intuition may be blocked.");
    recommendations.push("Water practices: Emotional release work, time near water, journaling, art, music.");
  }

  if (earth < 40) {
    insights.push("Low Earth: Grounding and embodiment need strengthening.");
    recommendations.push("Earth practices: Barefoot walking, fascia work, consistent sleep/eating routines, spending time in nature.");
  }

  if (air < 40) {
    insights.push("Low Air: Mental clarity and communication may be clouded.");
    recommendations.push("Air practices: Breathwork, meditation, learning, teaching, meaningful conversations.");
  }

  if (aether < 40) {
    insights.push("Low Aether: Integration and quantum connection are weak.");
    recommendations.push("Aether practices: Meditation, ceremony, silence, integration time after major experiences.");
  }

  // Fascia-specific insights
  if (fasciaAssessment) {
    if (fasciaAssessment.synchronicityCount >= 3) {
      insights.push("High synchronicity suggests your fascial antenna is coherent with the quantum field.");
    }

    if (fasciaAssessment.emotionalRelease) {
      insights.push("Emotional release during fascial work indicates healthy trauma integration.");
    }

    if (fasciaAssessment.hydration <= 4) {
      recommendations.push("Increase hydration - dehydrated fascia dampens consciousness transmission.");
    }
  }

  return {
    timestamp: new Date(),
    fire,
    water,
    earth,
    air,
    aether,
    overallCoherence,
    balance,
    dominant,
    deficient,
    sources: {
      hasHRV: latestHRV !== null,
      hasFascia: fasciaAssessment !== null,
      hasBreath: latestRespiratory !== null
    },
    insights,
    recommendations
  };
}

/**
 * Calculate coherence trend over time
 */
export function calculateCoherenceTrend(
  assessments: ElementalCoherence[]
): 'improving' | 'stable' | 'declining' {
  if (assessments.length < 3) return 'stable';

  const recent = assessments.slice(-7);
  const earlier = assessments.slice(0, Math.min(7, assessments.length - 7));

  const recentAvg = recent.reduce((sum, a) => sum + a.overallCoherence, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, a) => sum + a.overallCoherence, 0) / earlier.length;

  if (recentAvg > earlierAvg + 5) return 'improving';
  if (recentAvg < earlierAvg - 5) return 'declining';
  return 'stable';
}

/**
 * Get elemental practice recommendations based on current state
 */
export function getElementalPracticeRecommendations(coherence: ElementalCoherence): {
  element: string;
  practice: string;
  why: string;
}[] {
  const practices: { element: string; practice: string; why: string }[] = [];

  // Address deficiencies first
  coherence.deficient.forEach(element => {
    switch (element) {
      case 'fire':
        practices.push({
          element: 'Fire',
          practice: 'Sacred morning movement practice (20 min)',
          why: 'Ignites creative energy and sets intentional direction for the day'
        });
        break;
      case 'water':
        practices.push({
          element: 'Water',
          practice: 'Evening emotional check-in with Oracle (15 min)',
          why: 'Opens emotional flow and enhances intuitive receptivity'
        });
        break;
      case 'earth':
        practices.push({
          element: 'Earth',
          practice: 'Barefoot grounding + fascia work (15 min)',
          why: 'Strengthens embodiment and connects fascial network to Earth field'
        });
        break;
      case 'air':
        practices.push({
          element: 'Air',
          practice: 'Coherent breathing meditation (10 min)',
          why: 'Clears mental fog and enhances nervous system balance'
        });
        break;
      case 'aether':
        practices.push({
          element: 'Aether',
          practice: 'Silent integration time (20 min)',
          why: 'Allows quantum field coherence and consciousness integration'
        });
        break;
    }
  });

  // If no deficiencies, suggest practices to maintain dominant strengths
  if (practices.length === 0 && coherence.dominant.length > 0) {
    practices.push({
      element: coherence.dominant[0].charAt(0).toUpperCase() + coherence.dominant[0].slice(1),
      practice: 'Continue current practices',
      why: `Your ${coherence.dominant[0]} element is strong. Maintain this while gently exploring other elements.`
    });
  }

  return practices;
}
