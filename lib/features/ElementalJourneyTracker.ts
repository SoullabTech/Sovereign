/**
 * MY ELEMENTAL JOURNEY TRACKER
 *
 * Tracks user's progression through the 12-phase Spiralogic journey
 * Shows current facet, progress, shadow/gold teachings, and next steps
 */

import {
  UNIFIED_FACET_MAP,
  UnifiedFacetMapping,
  getFacetByNumber,
  getNextFacet,
  getPreviousFacet,
  calculateAlchemicalProgress,
  getRecommendedPractices,
  getShadowGoldTeachings,
  ConsciousnessJourneyPosition
} from '../consciousness/UnifiedSpiralogicAlchemyMap';
import { Element, Phase } from '../consciousness/spiralogic-core';

/**
 * User's journey state
 */
export interface UserJourneyState {
  userId: string;
  currentFacetNumber: number;
  progressInFacet: number; // 0-1 (how far through current facet)
  facetsCompleted: number[]; // Array of completed facet numbers
  spiralLevel: number; // How many complete 12-facet spirals completed
  lastUpdated: string;
  journeyStarted: string;
}

/**
 * Journey snapshot - what user sees
 */
export interface JourneySnapshot {
  // Current position
  currentFacet: UnifiedFacetMapping;
  progressInFacet: number;
  facetProgress: string; // "30% through Fire-1"

  // Journey context
  spiralLevel: number;
  totalFacetsCompleted: number;
  journeyDuration: string; // "3 months"

  // Current facet wisdom
  developmentalTheme: string;
  shadowToWatch: string;
  goldMedicineAvailable: string;
  consciousnessFocus: string;

  // Alchemical progress
  alchemicalStage: {
    current: string; // "nigredo"
    color: string; // "Black"
    overallProgress: number; // 0-1
    progressByStage: {
      nigredo: number;
      albedo: number;
      citrinitas: number;
      rubedo: number;
      quinta_essentia: number;
    };
  };

  // Guidance
  typicalQuestions: string[];
  healingPractices: string[];
  integrationTasks: string[];

  // Navigation
  nextFacet: {
    facetId: string;
    element: string;
    theme: string;
  };
  previousFacet?: {
    facetId: string;
    element: string;
    theme: string;
  };

  // Achievements
  achievements: JourneyAchievement[];
}

export interface JourneyAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  type: 'facet_complete' | 'stage_complete' | 'spiral_complete' | 'milestone';
}

/**
 * Get user's current journey snapshot
 */
export async function getJourneySnapshot(userId: string): Promise<JourneySnapshot> {
  // Get user's journey state from database
  const journeyState = await getUserJourneyState(userId);

  // Get current facet details
  const currentFacet = getFacetByNumber(journeyState.currentFacetNumber)!;
  const nextFacet = getNextFacet(currentFacet);
  const previousFacet = getPreviousFacet(currentFacet);

  // Calculate alchemical progress
  const alchemicalProgress = calculateAlchemicalProgress(journeyState.facetsCompleted);

  // Get current stage overall progress
  const currentStageProgress = alchemicalProgress[currentFacet.alchemicalStage];

  // Get practices and teachings
  const practices = getRecommendedPractices(currentFacet);
  const shadowGold = getShadowGoldTeachings(currentFacet);

  // Calculate journey duration
  const journeyDuration = calculateJourneyDuration(journeyState.journeyStarted);

  // Get achievements
  const achievements = calculateAchievements(journeyState);

  return {
    currentFacet,
    progressInFacet: journeyState.progressInFacet,
    facetProgress: `${Math.round(journeyState.progressInFacet * 100)}% through ${currentFacet.facetId}`,

    spiralLevel: journeyState.spiralLevel,
    totalFacetsCompleted: journeyState.facetsCompleted.length,
    journeyDuration,

    developmentalTheme: shadowGold.theme,
    shadowToWatch: shadowGold.shadow,
    goldMedicineAvailable: shadowGold.gold,
    consciousnessFocus: currentFacet.consciousnessFocus,

    alchemicalStage: {
      current: currentFacet.alchemicalStage,
      color: currentFacet.alchemicalColor,
      overallProgress: currentStageProgress,
      progressByStage: alchemicalProgress
    },

    typicalQuestions: practices.questions,
    healingPractices: practices.healing,
    integrationTasks: practices.integration,

    nextFacet: nextFacet ? {
      facetId: nextFacet.facetId,
      element: nextFacet.element,
      theme: nextFacet.developmentalTheme
    } : {
      facetId: 'Fire-1',
      element: 'Fire',
      theme: 'New spiral begins - deeper level'
    },

    previousFacet: previousFacet ? {
      facetId: previousFacet.facetId,
      element: previousFacet.element,
      theme: previousFacet.developmentalTheme
    } : undefined,

    achievements
  };
}

/**
 * Update user's journey progress
 */
export async function updateJourneyProgress(
  userId: string,
  update: {
    facetNumber?: number;
    progressDelta?: number; // Add to current progress (e.g., 0.1 for 10%)
    completeFacet?: boolean;
  }
): Promise<UserJourneyState> {
  const state = await getUserJourneyState(userId);

  // Update facet number if changed
  if (update.facetNumber !== undefined) {
    state.currentFacetNumber = update.facetNumber;
    state.progressInFacet = 0; // Reset progress in new facet
  }

  // Update progress
  if (update.progressDelta !== undefined) {
    state.progressInFacet = Math.min(1, state.progressInFacet + update.progressDelta);
  }

  // Complete facet
  if (update.completeFacet) {
    if (!state.facetsCompleted.includes(state.currentFacetNumber)) {
      state.facetsCompleted.push(state.currentFacetNumber);
    }

    // Move to next facet
    const nextFacetNumber = (state.currentFacetNumber % 12) + 1;
    state.currentFacetNumber = nextFacetNumber;
    state.progressInFacet = 0;

    // Check if completed full spiral
    if (nextFacetNumber === 1) {
      state.spiralLevel += 1;
    }
  }

  state.lastUpdated = new Date().toISOString();

  // Save to database
  await saveUserJourneyState(state);

  return state;
}

/**
 * Detect user's current facet from conversation patterns
 * Uses semantic analysis to infer where they are
 */
export async function detectCurrentFacet(
  userId: string,
  recentMessages: string[]
): Promise<{
  suggestedFacet: UnifiedFacetMapping;
  confidence: number;
  reasoning: string;
}> {
  // Combine recent messages
  const conversationText = recentMessages.join(' ').toLowerCase();

  // Score each facet based on patterns
  const facetScores: Array<{ facet: UnifiedFacetMapping; score: number; matches: string[] }> = [];

  for (const facet of UNIFIED_FACET_MAP) {
    let score = 0;
    const matches: string[] = [];

    // Check for element keywords
    const elementKeywords = {
      Fire: ['fire', 'vision', 'creative', 'purpose', 'inspiration', 'spark'],
      Water: ['water', 'emotion', 'feeling', 'depth', 'flow', 'heal'],
      Earth: ['earth', 'ground', 'body', 'manifest', 'practical', 'root'],
      Air: ['air', 'mind', 'thought', 'clarity', 'communicate', 'perspective'],
      Aether: ['aether', 'unity', 'whole', 'integrate', 'transcend', 'all']
    };

    const elementWords = elementKeywords[facet.element] || [];
    for (const word of elementWords) {
      if (conversationText.includes(word)) {
        score += 0.5;
        matches.push(`element: ${word}`);
      }
    }

    // Check for shadow pattern
    if (conversationText.includes(facet.shadowPattern.toLowerCase().substring(0, 20))) {
      score += 2;
      matches.push(`shadow: ${facet.shadowPattern.substring(0, 30)}`);
    }

    // Check for developmental theme
    const themeWords = facet.developmentalTheme.toLowerCase().split(' ');
    for (const word of themeWords) {
      if (word.length > 4 && conversationText.includes(word)) {
        score += 0.3;
        matches.push(`theme: ${word}`);
      }
    }

    // Check for consciousness focus keywords
    const focusWords = facet.consciousnessFocus.toLowerCase().split(' ');
    for (const word of focusWords) {
      if (word.length > 5 && conversationText.includes(word)) {
        score += 0.4;
        matches.push(`focus: ${word}`);
      }
    }

    if (score > 0) {
      facetScores.push({ facet, score, matches });
    }
  }

  // Sort by score
  facetScores.sort((a, b) => b.score - a.score);

  const topMatch = facetScores[0];

  if (!topMatch || topMatch.score < 1) {
    // Default to Fire-1 if unclear
    return {
      suggestedFacet: getFacetByNumber(1)!,
      confidence: 0.3,
      reasoning: 'Insufficient data to determine facet, suggesting Fire-1 (journey beginning)'
    };
  }

  const confidence = Math.min(topMatch.score / 5, 1); // Normalize to 0-1

  return {
    suggestedFacet: topMatch.facet,
    confidence,
    reasoning: `Detected ${topMatch.facet.facetId} with ${topMatch.matches.length} matches: ${topMatch.matches.slice(0, 3).join(', ')}`
  };
}

/**
 * Get journey milestones
 */
export function getJourneyMilestones(): Array<{
  facetNumber: number;
  title: string;
  description: string;
  significance: string;
}> {
  return [
    {
      facetNumber: 1,
      title: 'Journey Begins',
      description: 'First spark of consciousness transformation',
      significance: 'You\'ve begun the alchemical journey'
    },
    {
      facetNumber: 3,
      title: 'Fire Triad Complete',
      description: 'Nigredo stage complete - shadow work integrated',
      significance: 'You\'ve faced the darkness and emerged with purified vision'
    },
    {
      facetNumber: 6,
      title: 'Water Triad Complete',
      description: 'Albedo stage complete - emotional purification',
      significance: 'You\'ve developed emotional wisdom and healing presence'
    },
    {
      facetNumber: 9,
      title: 'Earth Triad Complete',
      description: 'Citrinitas stage complete - wisdom embodied',
      significance: 'You\'ve grounded your transformation in practical reality'
    },
    {
      facetNumber: 11,
      title: 'Air Mastery',
      description: 'Rubedo stage nearing completion',
      significance: 'You\'re ready to communicate integrated wisdom'
    },
    {
      facetNumber: 12,
      title: 'First Spiral Complete',
      description: 'Quinta Essentia - Unity consciousness achieved',
      significance: 'You\'ve completed one full cycle of transformation'
    }
  ];
}

/**
 * Calculate achievements based on journey state
 */
function calculateAchievements(state: UserJourneyState): JourneyAchievement[] {
  const achievements: JourneyAchievement[] = [];
  const milestones = getJourneyMilestones();

  for (const milestone of milestones) {
    if (state.facetsCompleted.includes(milestone.facetNumber)) {
      achievements.push({
        id: `milestone-${milestone.facetNumber}`,
        title: milestone.title,
        description: milestone.description,
        unlockedAt: state.lastUpdated, // In real implementation, would track per-facet completion dates
        type: 'milestone'
      });
    }
  }

  // Spiral completion achievements
  if (state.spiralLevel >= 1) {
    achievements.push({
      id: `spiral-${state.spiralLevel}`,
      title: `Spiral ${state.spiralLevel} Complete`,
      description: `You've completed ${state.spiralLevel} full cycle(s) of the 12-phase journey`,
      unlockedAt: state.lastUpdated,
      type: 'spiral_complete'
    });
  }

  return achievements;
}

/**
 * Calculate journey duration in human-readable format
 */
function calculateJourneyDuration(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    const remainingMonths = months % 12;
    return remainingMonths > 0
      ? `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
      : `${years} year${years > 1 ? 's' : ''}`;
  }

  if (months > 0) {
    const remainingDays = days % 30;
    return remainingDays > 0
      ? `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
      : `${months} month${months > 1 ? 's' : ''}`;
  }

  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Database functions (to be implemented with actual DB)
 */
async function getUserJourneyState(userId: string): Promise<UserJourneyState> {
  // TODO: Implement actual database query
  // For now, return default state

  // Check if we have cached state (in-memory for demo)
  const cached = journeyStateCache.get(userId);
  if (cached) return cached;

  // Default state for new users
  const defaultState: UserJourneyState = {
    userId,
    currentFacetNumber: 1, // Start at Fire-1
    progressInFacet: 0,
    facetsCompleted: [],
    spiralLevel: 0,
    lastUpdated: new Date().toISOString(),
    journeyStarted: new Date().toISOString()
  };

  journeyStateCache.set(userId, defaultState);
  return defaultState;
}

async function saveUserJourneyState(state: UserJourneyState): Promise<void> {
  // TODO: Implement actual database save
  // For now, update cache
  journeyStateCache.set(state.userId, state);

  console.log('🌀 [JOURNEY] Saved state for user:', state.userId, {
    facet: state.currentFacetNumber,
    progress: `${Math.round(state.progressInFacet * 100)}%`,
    completed: state.facetsCompleted.length
  });
}

// In-memory cache (replace with database)
const journeyStateCache = new Map<string, UserJourneyState>();

/**
 * Export for testing
 */
export {
  journeyStateCache,
  calculateJourneyDuration,
  calculateAchievements
};
