import { JournalEntry } from './state';
import { CognitiveVoiceProcessor, CognitiveVoiceAnalysis } from './cognitiveVoiceAnalysis';

export interface VoiceMetrics {
  speechRate: number; // words per minute
  pauseDensity: number; // pauses per minute
  averagePauseLength: number; // in seconds
  emotionalIntensity: number; // 0-1 based on variation patterns
  coherence: number; // 0-1 speech flow coherence
  breathPattern: 'shallow' | 'deep' | 'irregular' | 'rhythmic';
  energyLevel: 'low' | 'balanced' | 'elevated' | 'breakthrough';
}

export interface VoicePattern {
  userId: string;
  entryId: string;
  timestamp: Date;
  mode: string;
  metrics: VoiceMetrics;
  signature?: string; // unique voice fingerprint
}

export interface VoiceAwareGreeting {
  message: string;
  wisdomDepth: 'surface' | 'symbolic' | 'archetypal' | 'transcendent';
  archetypalSignatures?: string[];
  voiceRecognition?: {
    energyShift?: string;
    coherenceEvolution?: string;
    breathworkNotice?: string;
  };
}

/**
 * Analyzes voice patterns from Whisper transcription data
 */
export function analyzeVoiceMetrics(
  words: Array<{ word: string; start: number; end: number }>,
  duration: number,
  segments?: Array<{ start: number; end: number; text: string }>
): VoiceMetrics {
  if (!words || words.length === 0) {
    return {
      speechRate: 0,
      pauseDensity: 0,
      averagePauseLength: 0,
      emotionalIntensity: 0,
      coherence: 0,
      breathPattern: 'irregular',
      energyLevel: 'low'
    };
  }

  // Calculate speech rate (words per minute)
  const speechRate = (words.length / duration) * 60;

  // Detect pauses between words
  const pauses: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const pauseLength = words[i].start - words[i - 1].end;
    if (pauseLength > 0.3) { // Meaningful pause threshold
      pauses.push(pauseLength);
    }
  }

  const pauseDensity = (pauses.length / duration) * 60;
  const averagePauseLength = pauses.length > 0 ?
    pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length : 0;

  // Calculate emotional intensity based on speech rate variation
  const segmentRates = segments?.map(seg => {
    const segmentWords = words.filter(w => w.start >= seg.start && w.end <= seg.end);
    return segmentWords.length / (seg.end - seg.start) * 60;
  }) || [];

  const rateVariation = segmentRates.length > 1 ?
    Math.sqrt(segmentRates.reduce((sum, rate) => {
      const diff = rate - speechRate;
      return sum + diff * diff;
    }, 0) / segmentRates.length) / speechRate : 0;

  const emotionalIntensity = Math.min(rateVariation * 2, 1);

  // Calculate coherence (inverse of excessive pausing and rate variation)
  const coherence = Math.max(0, 1 - (pauseDensity / 20 + rateVariation));

  // Determine breath pattern based on pause patterns
  const longPauses = pauses.filter(p => p > 1.0).length;
  const shortPauses = pauses.filter(p => p >= 0.3 && p <= 1.0).length;

  let breathPattern: VoiceMetrics['breathPattern'];
  if (longPauses > shortPauses * 0.5) {
    breathPattern = pauseDensity < 10 ? 'deep' : 'irregular';
  } else if (pauseDensity > 15) {
    breathPattern = 'shallow';
  } else {
    breathPattern = 'rhythmic';
  }

  // Determine energy level
  let energyLevel: VoiceMetrics['energyLevel'];
  if (speechRate > 180 && emotionalIntensity > 0.7) {
    energyLevel = 'breakthrough';
  } else if (speechRate > 150 || emotionalIntensity > 0.4) {
    energyLevel = 'elevated';
  } else if (speechRate > 100 && coherence > 0.6) {
    energyLevel = 'balanced';
  } else {
    energyLevel = 'low';
  }

  return {
    speechRate,
    pauseDensity,
    averagePauseLength,
    emotionalIntensity,
    coherence,
    breathPattern,
    energyLevel
  };
}

/**
 * Comprehensive cognitive voice analysis using dormant architectures
 */
export async function analyzeCognitiveVoicePatterns(
  words: Array<{ word: string; start: number; end: number }>,
  duration: number,
  transcript: string,
  segments?: Array<{ start: number; end: number; text: string }>,
  voiceHistory?: JournalEntry[]
): Promise<CognitiveVoiceAnalysis> {
  const processor = new CognitiveVoiceProcessor();
  return await processor.analyzeCognitiveVoicePatterns(
    words,
    duration,
    transcript,
    segments,
    voiceHistory
  );
}

/**
 * Enhanced voice pattern evolution with cognitive architecture insights
 */
export function analyzeVoiceEvolution(voiceEntries: JournalEntry[]): {
  coherenceTrend: 'improving' | 'stable' | 'declining';
  energyShifts: Array<{ date: Date; shift: string }>;
  dominantBreathPattern: VoiceMetrics['breathPattern'];
  overallProgress: string;
  cognitiveInsights?: {
    developmentalProgression: string;
    elementalEvolution: string;
    integrationReadiness: number;
    wisdomEmergence: string[];
  };
} {
  if (voiceEntries.length < 2) {
    return {
      coherenceTrend: 'stable',
      energyShifts: [],
      dominantBreathPattern: 'rhythmic',
      overallProgress: 'Your voice patterns show increasing coherence and presence.'
    };
  }

  // Analyze basic trends
  const recentEntries = voiceEntries.slice(-5); // Last 5 voice entries
  const coherenceValues = recentEntries.map(entry =>
    entry.voiceMetrics?.coherence || 0.5
  );

  const coherenceTrend = determineCoherenceTrend(coherenceValues);
  const energyShifts = detectEnergyShifts(recentEntries);
  const dominantBreathPattern = findDominantBreathPattern(recentEntries);

  // Enhanced cognitive insights
  const cognitiveInsights = analyzeCognitiveEvolution(voiceEntries);

  const overallProgress = generateEvolutionSummary(
    coherenceTrend,
    energyShifts,
    cognitiveInsights
  );

  return {
    coherenceTrend,
    energyShifts,
    dominantBreathPattern,
    overallProgress,
    cognitiveInsights
  };
}

function determineCoherenceTrend(coherenceValues: number[]): 'improving' | 'stable' | 'declining' {
  if (coherenceValues.length < 2) return 'stable';

  const trend = coherenceValues[coherenceValues.length - 1] - coherenceValues[0];
  if (trend > 0.1) return 'improving';
  if (trend < -0.1) return 'declining';
  return 'stable';
}

function detectEnergyShifts(entries: JournalEntry[]): Array<{ date: Date; shift: string }> {
  const shifts: Array<{ date: Date; shift: string }> = [];

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];

    if (prev.voiceMetrics && curr.voiceMetrics) {
      const prevEnergy = getEnergyValue(prev.voiceMetrics.energyLevel);
      const currEnergy = getEnergyValue(curr.voiceMetrics.energyLevel);

      if (Math.abs(currEnergy - prevEnergy) > 1) {
        shifts.push({
          date: new Date(curr.timestamp),
          shift: `${prev.voiceMetrics.energyLevel} → ${curr.voiceMetrics.energyLevel}`
        });
      }
    }
  }

  return shifts;
}

function getEnergyValue(energyLevel: string): number {
  const map = { 'low': 0, 'balanced': 1, 'elevated': 2, 'breakthrough': 3 };
  return map[energyLevel] || 1;
}

function findDominantBreathPattern(entries: JournalEntry[]): VoiceMetrics['breathPattern'] {
  const patterns = entries
    .map(entry => entry.voiceMetrics?.breathPattern)
    .filter(Boolean);

  const counts = patterns.reduce((acc, pattern) => {
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).reduce((a, b) =>
    counts[a[0]] > counts[b[0]] ? a : b
  )[0] as VoiceMetrics['breathPattern'] || 'rhythmic';
}

function analyzeCognitiveEvolution(voiceEntries: JournalEntry[]) {
  // Analyze developmental progression
  const coherenceProgression = voiceEntries.map(entry =>
    entry.voiceMetrics?.coherence || 0.5
  );
  const avgCoherence = coherenceProgression.reduce((a, b) => a + b, 0) / coherenceProgression.length;

  let developmentalStage = 'integration';
  if (avgCoherence < 0.3) developmentalStage = 'initiation';
  else if (avgCoherence < 0.6) developmentalStage = 'exploration';

  // Analyze elemental evolution
  const elementalCounts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  voiceEntries.forEach(entry => {
    if (entry.cognitiveAnalysis?.elementalResonance?.dominant) {
      elementalCounts[entry.cognitiveAnalysis.elementalResonance.dominant]++;
    }
  });

  const dominantElement = Object.entries(elementalCounts).reduce((a, b) =>
    elementalCounts[a[0]] > elementalCounts[b[0]] ? a : b
  )[0];

  // Calculate integration readiness
  const recentCoherence = coherenceProgression.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const integrationReadiness = Math.min(recentCoherence + 0.2, 1.0);

  // Detect emerging wisdom patterns
  const wisdomEmergence = detectWisdomPatterns(voiceEntries);

  return {
    developmentalProgression: `Moving through ${developmentalStage} phase with ${(avgCoherence * 100).toFixed(0)}% coherence`,
    elementalEvolution: `Primary ${dominantElement} energy with balanced integration`,
    integrationReadiness,
    wisdomEmergence
  };
}

function detectWisdomPatterns(entries: JournalEntry[]): string[] {
  const patterns = [];

  // Check for breakthrough patterns
  const breakthroughCount = entries.filter(entry =>
    entry.voiceMetrics?.energyLevel === 'breakthrough'
  ).length;
  if (breakthroughCount > 0) {
    patterns.push(`${breakthroughCount} breakthrough moment${breakthroughCount > 1 ? 's' : ''} detected`);
  }

  // Check for integration patterns
  const integrationCount = entries.filter(entry =>
    entry.cognitiveAnalysis?.elementalResonance?.dominant === 'aether'
  ).length;
  if (integrationCount > entries.length * 0.3) {
    patterns.push('Strong integration capacity emerging');
  }

  // Check for emotional evolution
  const emotionalRange = entries.map(entry =>
    entry.voiceMetrics?.emotionalIntensity || 0
  );
  const maxEmotion = Math.max(...emotionalRange);
  const minEmotion = Math.min(...emotionalRange);
  if (maxEmotion - minEmotion > 0.5) {
    patterns.push('Wide emotional range and regulation developing');
  }

  return patterns.length > 0 ? patterns : ['Steady development and voice stabilization'];
}

function generateEvolutionSummary(
  coherenceTrend: string,
  energyShifts: Array<{ date: Date; shift: string }>,
  cognitiveInsights: any
): string {
  const trendMap = {
    improving: 'Your voice patterns are becoming more coherent and integrated',
    stable: 'Your voice patterns show consistent presence and stability',
    declining: 'Your voice shows some processing - often a sign of deep integration work'
  };

  let summary = trendMap[coherenceTrend];

  if (cognitiveInsights.wisdomEmergence.length > 0) {
    summary += `. ${cognitiveInsights.wisdomEmergence[0]}`;
  }

  if (energyShifts.length > 0) {
    summary += '. Dynamic energy patterns show active development';
  }

  return summary;
}

/**
 * Generates voice signature for recognition
 */
export function generateVoiceSignature(metrics: VoiceMetrics): string {
  const rate = Math.round(metrics.speechRate / 10);
  const coherence = Math.round(metrics.coherence * 10);
  const energy = metrics.energyLevel.charAt(0);
  const breath = metrics.breathPattern.charAt(0);

  return `${rate}${coherence}${energy}${breath}`;
}

/**
 * Creates voice-aware greeting variations
 */
export function createVoiceAwareGreeting(
  baseMessage: string,
  recentVoiceEntries: JournalEntry[],
  currentMetrics?: VoiceMetrics
): VoiceAwareGreeting {
  const voiceRecognition: VoiceAwareGreeting['voiceRecognition'] = {};

  if (currentMetrics) {
    // Energy shift recognition
    if (currentMetrics.energyLevel === 'breakthrough') {
      voiceRecognition.energyShift = "I can hear the breakthrough energy in your voice right now.";
    } else if (currentMetrics.energyLevel === 'low') {
      voiceRecognition.energyShift = "Your voice has a gentle, thoughtful quality today.";
    }

    // Coherence evolution
    if (currentMetrics.coherence > 0.8) {
      voiceRecognition.coherenceEvolution = "Your speech is flowing really clearly.";
    } else if (currentMetrics.coherence < 0.4) {
      voiceRecognition.coherenceEvolution = "I can hear you working through some stuff in your voice.";
    }

    // Breathwork awareness
    if (currentMetrics.breathPattern === 'deep') {
      voiceRecognition.breathworkNotice = "I can hear how grounded your breathing is.";
    } else if (currentMetrics.breathPattern === 'shallow') {
      voiceRecognition.breathworkNotice = "Might be good to take some deeper breaths.";
    }
  }

  // Enhance base message with voice awareness
  let enhancedMessage = baseMessage;

  if (Object.keys(voiceRecognition).length > 0) {
    const voiceInsights = Object.values(voiceRecognition).join(' ');
    enhancedMessage = `${baseMessage} ${voiceInsights}`;
  }

  return {
    message: enhancedMessage,
    wisdomDepth: 'archetypal',
    voiceRecognition: Object.keys(voiceRecognition).length > 0 ? voiceRecognition : undefined
  };
}