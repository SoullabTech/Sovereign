import { JournalEntry, JournalingMode } from './state';
import {
  VoiceMetrics,
  VoicePattern,
  VoiceAwareGreeting,
  analyzeVoiceEvolution,
  createVoiceAwareGreeting
} from './voicePatterns';
import { CognitiveVoiceAnalysis } from './cognitiveVoiceAnalysis';
import { PrivacyAwareCognitiveVoiceProcessor } from './privacyAwareCognitiveVoice';

export interface JournalAwareGreeting {
  message: string;
  wisdomDepth: 'surface' | 'symbolic' | 'archetypal' | 'transcendent';
  archetypalSignatures?: string[];
  voiceRecognition?: {
    coherenceEvolution?: string;
    energyShift?: string;
    breathworkNotice?: string;
    signatureRecognition?: string;
  };
  cognitiveInsights?: {
    developmentalStage?: string;
    elementalResonance?: string;
    clinicalObservation?: string;
    wisdomDirection?: string;
  };
}

export async function generateJournalAwareGreeting(entries: JournalEntry[], userId?: string): Promise<JournalAwareGreeting> {
  // If no journal entries, return default greeting
  if (entries.length === 0) {
    return {
      message: "Hey there. I'm MAIA, getting to know the patterns that make you unique. What's on your mind today?",
      wisdomDepth: 'archetypal'
    };
  }

  // Get recent entries (last 7 days)
  const recentEntries = entries
    .filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const daysDiff = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (recentEntries.length === 0) {
    const voiceEntries = entries.filter(entry => entry.isVoice);
    const voiceEvolution = voiceEntries.length > 0 ? analyzeVoiceEvolution(voiceEntries) : null;
    return generateReturningUserGreeting(entries, voiceEvolution);
  }

  const latestEntry = recentEntries[0];
  const timeSinceLatest = getTimeSinceEntry(latestEntry.timestamp);

  // Detect journaling patterns
  const modeFrequency = analyzeJournalingPatterns(recentEntries);
  const dominantMode = Object.keys(modeFrequency)
    .reduce((a, b) => modeFrequency[a] > modeFrequency[b] ? a : b) as JournalingMode;

  // Analyze voice patterns from recent voice entries
  const voiceEntries = recentEntries.filter(entry => entry.isVoice);
  const voiceEvolution = voiceEntries.length > 0 ? analyzeVoiceEvolution(voiceEntries) : null;

  // 🔒 Privacy-Aware Cognitive Analysis for Enhanced Greetings
  let memberInsights = null;
  if (userId && voiceEntries.length > 0) {
    try {
      const cognitiveProcessor = new PrivacyAwareCognitiveVoiceProcessor(userId);
      // Get the most recent voice entry with cognitive analysis
      const recentVoiceEntry = voiceEntries[0];

      if (recentVoiceEntry.cognitiveAnalysis) {
        memberInsights = await cognitiveProcessor.generateMemberFriendlySummary(
          recentVoiceEntry.cognitiveAnalysis
        );
        console.log('🎭 Generated member-friendly insights for greeting personalization');
      }
    } catch (error) {
      console.warn('⚠️  Privacy-aware cognitive analysis failed for greeting (continuing without):', error.message);
    }
  }

  // Extract cognitive insights from recent entries
  const cognitiveInsights = extractCognitiveInsights(recentEntries);

  return generateContextualGreeting(latestEntry, timeSinceLatest, dominantMode, recentEntries.length, voiceEvolution, cognitiveInsights, memberInsights);
}

function generateReturningUserGreeting(
  entries: JournalEntry[],
  voiceEvolution?: ReturnType<typeof analyzeVoiceEvolution> | null
): JournalAwareGreeting {
  const totalEntries = entries.length;
  const voiceEntries = entries.filter(entry => entry.isVoice);

  let voiceRecognition: JournalAwareGreeting['voiceRecognition'] = undefined;

  if (voiceEvolution && voiceEntries.length > 0) {
    voiceRecognition = {
      signatureRecognition: `I remember your voice from ${voiceEntries.length} recordings - good to hear you again.`
    };

    if (voiceEvolution.overallProgress) {
      voiceRecognition.coherenceEvolution = voiceEvolution.overallProgress;
    }
  }

  return {
    message: `Hey, good to see you again. I've been thinking about your ${totalEntries} journal entries. The patterns you've been working through are really starting to connect. What's stirring in you today?`,
    wisdomDepth: 'archetypal',
    archetypalSignatures: ['return', 'integration', 'deepening'],
    voiceRecognition
  };
}

function generateContextualGreeting(
  latestEntry: JournalEntry,
  timeSince: string,
  dominantMode: JournalingMode,
  recentCount: number,
  voiceEvolution?: ReturnType<typeof analyzeVoiceEvolution> | null,
  cognitiveInsights?: any,
  memberInsights?: any
): JournalAwareGreeting {
  const modeGreetings = {
    free: {
      recent: [
        `I've been thinking about that free flow writing you did ${timeSince}. There was something really honest about how your thoughts just poured out. What's wanting to come through today?`,
        `Your stream-of-consciousness piece ${timeSince} had some really interesting currents running through it. Feel like diving back in?`
      ],
      pattern: `You've been doing a lot of free flow writing lately - ${recentCount} times recently. Seems like you're drawn to that unfiltered expression. What's moving in you today?`
    },

    shadow: {
      recent: [
        `I've been thinking about that shadow work you did ${timeSince}. Takes real guts to look at the stuff we usually avoid. How's that landing for you now?`,
        `That shadow exploration ${timeSince} really went deep. I could feel how carefully you approached the hard stuff. What else is ready to come up?`
      ],
      pattern: `You've been doing shadow work pretty consistently - ${recentCount} times recently. That takes real courage. What's stirring in the depths today?`
    },

    dream: {
      recent: [
        `Those symbols from your dream work ${timeSince} have been sticking with me. Dreams have this way of keeping their magic alive long after we wake up. Any new imagery coming through?`,
        `Your dream exploration ${timeSince} opened up some fascinating territory. I can feel those symbols still working on you. What new mysteries are showing up?`
      ],
      pattern: `You've been really tuned into your dream world lately - ${recentCount} explorations recently. The symbolic language seems to really speak to you. What symbols are alive for you today?`
    },

    emotional: {
      recent: [
        `I've been sitting with that emotional work you shared ${timeSince}. The way you moved through those feelings was really something. How are they shifting for you now?`,
        `That emotional exploration ${timeSince} showed such awareness of your inner landscape. What feelings are asking for attention today?`
      ],
      pattern: `You've been doing some deep emotional work - ${recentCount} explorations recently. Takes real courage to feel that deeply. What emotions want some space today?`
    },

    direction: {
      recent: [
        `That direction work you did ${timeSince} touched something important about where you're heading. I can feel those insights still working in you. What's becoming clear now?`,
        `Your exploration of life direction ${timeSince} brought up some real clarity. How's that wisdom showing up in your daily life? What needs direction today?`
      ],
      pattern: `You've been consistently exploring direction - ${recentCount} inquiries recently. Shows real commitment to living with intention. What part of your path needs clarity today?`
    }
  };

  // Generate voice recognition insights
  const generateVoiceRecognition = () => {
    if (!voiceEvolution) return undefined;

    const recognition: JournalAwareGreeting['voiceRecognition'] = {};

    if (voiceEvolution.coherenceTrend === 'improving') {
      recognition.coherenceEvolution = "Your voice sounds more present and clear lately.";
    } else if (voiceEvolution.coherenceTrend === 'declining') {
      recognition.coherenceEvolution = "I can hear you working through some stuff in your voice.";
    }

    if (voiceEvolution.dominantBreathPattern === 'deep') {
      recognition.breathworkNotice = "I can hear how grounded your breathing is.";
    } else if (voiceEvolution.dominantBreathPattern === 'shallow') {
      recognition.breathworkNotice = "Might be nice to take a few deeper breaths today.";
    }

    if (latestEntry.isVoice) {
      recognition.signatureRecognition = "Good to hear your voice again.";
    }

    return Object.keys(recognition).length > 0 ? recognition : undefined;
  };

  const voiceRecognition = generateVoiceRecognition();

  // Enhance greetings with privacy-aware member insights
  const enhanceGreetingWithInsights = (baseMessage: string): string => {
    if (!memberInsights) return baseMessage;

    // Add subtle energy awareness if available
    if (memberInsights.energyPatterns?.dominant) {
      const energyNote = ` I can sense ${memberInsights.energyPatterns.dominant} energy flowing through your voice.`;
      return baseMessage.replace(/\?$/, '') + energyNote + '?';
    }

    // Add breath awareness if available
    if (memberInsights.breathPattern?.quality) {
      const breathNote = ` Your breath ${memberInsights.breathPattern.quality === 'deep' ? 'feels grounded and present' : 'seems to be working through something'}.`;
      return baseMessage.replace(/\?$/, '') + breathNote + '?';
    }

    // Add coherence observation if available
    if (memberInsights.coherenceProfile?.trend === 'emerging') {
      const coherenceNote = ` There's a beautiful clarity emerging in your voice.`;
      return baseMessage.replace(/\?$/, '') + coherenceNote + '?';
    }

    return baseMessage;
  };

  // Choose between recent-specific or pattern-based greeting
  if (timeSince.includes('today') || timeSince.includes('yesterday')) {
    const recentMessages = modeGreetings[dominantMode].recent;
    const baseMessage = recentMessages[Math.floor(Math.random() * recentMessages.length)];
    const enhancedMessage = enhanceGreetingWithInsights(baseMessage);

    return {
      message: enhancedMessage,
      wisdomDepth: getWisdomDepthForMode(dominantMode),
      archetypalSignatures: getArchetypalSignaturesForMode(dominantMode),
      voiceRecognition,
      cognitiveInsights
    };
  } else if (recentCount >= 2) {
    const baseMessage = modeGreetings[dominantMode].pattern;
    const enhancedMessage = enhanceGreetingWithInsights(baseMessage);

    return {
      message: enhancedMessage,
      wisdomDepth: 'archetypal',
      archetypalSignatures: getArchetypalSignaturesForMode(dominantMode),
      voiceRecognition,
      cognitiveInsights
    };
  } else {
    // Fallback to general contextual greeting
    const baseMessage = `Hey, welcome back. I see you've been working with ${getModeDisplayName(dominantMode)} lately. Things seem to be deepening. What's calling to you today?`;
    const enhancedMessage = enhanceGreetingWithInsights(baseMessage);

    return {
      message: enhancedMessage,
      wisdomDepth: 'symbolic',
      archetypalSignatures: ['return', 'deepening'],
      voiceRecognition,
      cognitiveInsights
    };
  }
}

function getTimeSinceEntry(timestamp: Date): string {
  const now = new Date();
  const entryTime = new Date(timestamp);
  const diffInHours = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 2) return 'just now';
  if (diffInHours < 24) return 'earlier today';
  if (diffInHours < 48) return 'yesterday';
  if (diffInHours < 72) return 'a couple days ago';
  if (diffInHours < 168) return 'this week';
  return 'recently';
}

function analyzeJournalingPatterns(entries: JournalEntry[]): Record<JournalingMode, number> {
  const patterns: Record<JournalingMode, number> = {
    free: 0,
    shadow: 0,
    dream: 0,
    emotional: 0,
    direction: 0
  };

  entries.forEach(entry => {
    patterns[entry.mode]++;
  });

  return patterns;
}

function getWisdomDepthForMode(mode: JournalingMode): 'surface' | 'symbolic' | 'archetypal' | 'transcendent' {
  const depthMap: Record<JournalingMode, 'surface' | 'symbolic' | 'archetypal' | 'transcendent'> = {
    free: 'symbolic',
    shadow: 'archetypal',
    dream: 'archetypal',
    emotional: 'symbolic',
    direction: 'transcendent'
  };

  return depthMap[mode];
}

function getArchetypalSignaturesForMode(mode: JournalingMode): string[] {
  const signatureMap: Record<JournalingMode, string[]> = {
    free: ['authenticity', 'expression', 'flow'],
    shadow: ['integration', 'courage', 'transformation'],
    dream: ['symbols', 'archetypal', 'mythic'],
    emotional: ['alchemy', 'feeling', 'transformation'],
    direction: ['clarity', 'purpose', 'guidance']
  };

  return signatureMap[mode];
}

function getModeDisplayName(mode: JournalingMode): string {
  const displayNames: Record<JournalingMode, string> = {
    free: 'Free Flow',
    shadow: 'Shadow Integration',
    dream: 'Dream Weaving',
    emotional: 'Emotional Alchemy',
    direction: 'Sacred Direction'
  };

  return displayNames[mode];
}

/**
 * Extracts cognitive insights from recent journal entries with cognitive analysis
 */
function extractCognitiveInsights(entries: JournalEntry[]): any {
  const entriesWithCognitive = entries.filter(entry => entry.cognitiveAnalysis);

  if (entriesWithCognitive.length === 0) return undefined;

  const latestCognitive = entriesWithCognitive[0].cognitiveAnalysis;
  if (!latestCognitive) return undefined;

  // Extract key insights for greeting integration
  const insights = {
    developmentalStage: latestCognitive.clinicalInsights?.developmentalStage,
    elementalResonance: `Primary ${latestCognitive.elementalResonance?.dominant} energy`,
    clinicalObservation: latestCognitive.clinicalInsights?.coherenceProfile,
    wisdomDirection: latestCognitive.soarAnalysis?.recommendedWisdom
  };

  // Add integration readiness context
  const readiness = latestCognitive.clinicalInsights?.integrationReadiness || 0;
  if (readiness > 0.8) {
    insights.clinicalObservation = `High integration readiness (${(readiness * 100).toFixed(0)}%)`;
  } else if (readiness < 0.4) {
    insights.clinicalObservation = 'Building integration foundation';
  }

  // Add elemental balance insights
  const elemental = latestCognitive.elementalResonance;
  if (elemental) {
    const activations = [
      { element: 'fire', level: elemental.fire.activation },
      { element: 'water', level: elemental.water.activation },
      { element: 'earth', level: elemental.earth.activation },
      { element: 'air', level: elemental.air.activation },
      { element: 'aether', level: elemental.aether.activation }
    ].sort((a, b) => b.level - a.level);

    const top2 = activations.slice(0, 2);
    if (top2[0].level - top2[1].level < 0.2) {
      insights.elementalResonance = `Balanced ${top2[0].element}-${top2[1].element} resonance`;
    }
  }

  // Add SOAR wisdom insights
  if (latestCognitive.soarAnalysis?.detectedGoals?.length > 0) {
    const goals = latestCognitive.soarAnalysis.detectedGoals;
    const primary = goals.reduce((a, b) => a.urgency > b.urgency ? a : b);
    insights.wisdomDirection = `Focus on ${primary.type} development`;
  }

  return insights;
}