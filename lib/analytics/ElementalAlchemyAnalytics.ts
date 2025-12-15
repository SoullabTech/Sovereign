/**
 * ELEMENTAL ALCHEMY ANALYTICS SYSTEM
 *
 * Tracks book engagement, transformation patterns, and user journey metrics
 * Provides insights for both users (personal growth) and Kelly (platform health)
 */

import { Element } from '../consciousness/spiralogic-core';

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'book_query'           // User asked the book
  | 'chapter_loaded'       // Chapter auto-loaded in conversation
  | 'journey_progress'     // Journey facet update
  | 'shadow_recorded'      // Shadow instance tracked
  | 'shadow_integrated'    // Shadow pattern marked integrated
  | 'daily_alchemy_viewed' // Daily teaching viewed
  | 'practice_completed'   // User completed a practice
  | 'achievement_unlocked' // Journey milestone reached
  | 'facet_completed';     // Completed a facet

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: AnalyticsEventType;
  timestamp: string;

  // Event-specific data
  metadata: {
    // Book queries
    query?: string;
    detectedThemes?: string[];
    chaptersLoaded?: string[];

    // Chapter loading
    element?: Element;
    triggerContext?: string;

    // Journey
    facetNumber?: number;
    progressDelta?: number;

    // Shadow work
    shadowPatternId?: string;
    intensity?: number;
    wasIntegrated?: boolean;

    // Daily alchemy
    alchemyType?: 'morning' | 'midday' | 'evening';

    // Generic
    [key: string]: any;
  };
}

/**
 * Aggregated analytics metrics
 */
export interface PlatformAnalytics {
  // Overview
  totalUsers: number;
  activeUsers30Days: number;
  totalEvents: number;

  // Book engagement
  bookEngagement: {
    totalQueries: number;
    queriesLast30Days: number;
    averageQueriesPerUser: number;
    mostQueriedChapters: Array<{
      element: string;
      queryCount: number;
      percentage: number;
    }>;
    popularQueries: Array<{
      query: string;
      count: number;
    }>;
  };

  // Transformation metrics
  transformation: {
    totalJourneysActive: number;
    averageFacetProgress: number;
    facetDistribution: Array<{
      facetNumber: number;
      facetId: string;
      userCount: number;
      percentage: number;
    }>;
    averageShadowsTracked: number;
    totalShadowsIntegrated: number;
    integrationSuccessRate: number;
  };

  // Elemental balance
  elementalBalance: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    Aether: number;
  };

  // Engagement patterns
  engagement: {
    dailyAlchemyViews: number;
    practicesCompleted: number;
    achievementsUnlocked: number;
    averageSessionsPerWeek: number;
  };

  // Time-based trends
  trends: {
    weekOverWeekGrowth: number; // % change
    mostActiveDay: string;
    mostActiveHour: number;
    retentionRate30Day: number;
  };

  generatedAt: string;
}

/**
 * User-specific analytics
 */
export interface UserAnalytics {
  userId: string;

  // Personal transformation
  transformation: {
    journeyStartDate: string;
    daysSinceStart: number;
    currentFacetNumber: number;
    facetsCompleted: number;
    spiralLevel: number;
    overallProgress: number; // 0-1
  };

  // Shadow work
  shadowWork: {
    patternsTracked: number;
    instancesRecorded: number;
    patternsIntegrated: number;
    integrationRate: number;
    mostWorkedElement: Element;
  };

  // Book engagement
  bookEngagement: {
    totalQueries: number;
    favoriteChapter: string;
    chaptersExplored: string[];
    lastQueryDate?: string;
  };

  // Daily practice
  dailyPractice: {
    dailyAlchemyStreak: number; // Consecutive days
    totalPracticesCompleted: number;
    favoriteAlchemyType: 'morning' | 'midday' | 'evening';
  };

  // Elemental balance
  elementalBalance: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    Aether: number;
    mostActiveElement: Element;
    leastActiveElement: Element;
  };

  // Achievements
  achievements: {
    total: number;
    recent: Array<{
      title: string;
      unlockedAt: string;
    }>;
  };

  generatedAt: string;
}

/**
 * Content effectiveness metrics (for Kelly)
 */
export interface ContentEffectiveness {
  // Chapter metrics
  chapters: Array<{
    element: string;
    views: number;
    queries: number;
    averageEngagementTime?: number;
    userSatisfaction?: number; // If we add ratings
    commonThemes: string[];
  }>;

  // Teaching impact
  teachings: {
    mostTransformativeFacets: Array<{
      facetNumber: number;
      completionRate: number;
      averageTimeInFacet: number; // days
      userFeedback?: string[];
    }>;

    mostEffectivePractices: Array<{
      practice: string;
      completionCount: number;
      reportedImpact?: number;
    }>;

    mostIntegratedShadows: Array<{
      shadowPattern: string;
      element: Element;
      integrationCount: number;
      averageTimeToIntegration: number; // days
    }>;
  };

  // Daily alchemy
  dailyAlchemy: {
    morningEngagement: number;
    middayEngagement: number;
    eveningEngagement: number;
    mostPopularPrompts: Array<{
      element: Element;
      prompt: string;
      viewCount: number;
    }>;
  };

  generatedAt: string;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  userId: string,
  eventType: AnalyticsEventType,
  metadata: AnalyticsEvent['metadata'] = {}
): Promise<void> {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    userId,
    eventType,
    timestamp: new Date().toISOString(),
    metadata
  };

  await saveEvent(event);

  console.log('📊 [ANALYTICS]', {
    event: eventType,
    user: userId.substring(0, 8),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
  });
}

/**
 * Get platform-wide analytics
 */
export async function getPlatformAnalytics(
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<PlatformAnalytics> {
  const events = await getAllEvents(options);
  const users = await getAllUsers();

  // Calculate active users (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUserIds = new Set(
    events
      .filter(e => new Date(e.timestamp) >= thirtyDaysAgo)
      .map(e => e.userId)
  );

  // Book engagement
  const bookQueries = events.filter(e => e.eventType === 'book_query');
  const bookQueriesLast30 = bookQueries.filter(e =>
    new Date(e.timestamp) >= thirtyDaysAgo
  );

  // Chapter loading frequency
  const chapterLoads = events.filter(e => e.eventType === 'chapter_loaded');
  const elementCounts = new Map<string, number>();
  for (const event of chapterLoads) {
    const element = event.metadata.element || 'unknown';
    elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
  }

  const mostQueriedChapters = Array.from(elementCounts.entries())
    .map(([element, count]) => ({
      element,
      queryCount: count,
      percentage: (count / chapterLoads.length) * 100
    }))
    .sort((a, b) => b.queryCount - a.queryCount);

  // Popular queries
  const queryCounts = new Map<string, number>();
  for (const query of bookQueries) {
    const queryText = query.metadata.query || '';
    if (queryText) {
      const normalized = queryText.toLowerCase().trim();
      queryCounts.set(normalized, (queryCounts.get(normalized) || 0) + 1);
    }
  }

  const popularQueries = Array.from(queryCounts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Journey progress
  const journeyEvents = events.filter(e => e.eventType === 'journey_progress');
  const facetDistribution = new Map<number, number>();

  for (const event of journeyEvents) {
    const facetNumber = event.metadata.facetNumber;
    if (facetNumber) {
      facetDistribution.set(facetNumber, (facetDistribution.get(facetNumber) || 0) + 1);
    }
  }

  const facetDistributionArray = Array.from(facetDistribution.entries())
    .map(([facetNumber, userCount]) => ({
      facetNumber,
      facetId: getFacetIdForNumber(facetNumber),
      userCount,
      percentage: (userCount / users.length) * 100
    }))
    .sort((a, b) => a.facetNumber - b.facetNumber);

  // Shadow work
  const shadowRecorded = events.filter(e => e.eventType === 'shadow_recorded');
  const shadowIntegrated = events.filter(e => e.eventType === 'shadow_integrated');
  const shadowsWithIntegration = shadowRecorded.filter(e => e.metadata.wasIntegrated).length;

  // Daily alchemy
  const dailyAlchemyViews = events.filter(e => e.eventType === 'daily_alchemy_viewed').length;
  const practicesCompleted = events.filter(e => e.eventType === 'practice_completed').length;
  const achievementsUnlocked = events.filter(e => e.eventType === 'achievement_unlocked').length;

  // Elemental balance (across all shadow work and queries)
  const elementalBalance = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0
  };

  for (const event of [...shadowRecorded, ...chapterLoads]) {
    const element = event.metadata.element as Element;
    if (element && element in elementalBalance) {
      elementalBalance[element]++;
    }
  }

  // Trends (simplified for now)
  const lastWeekEvents = events.filter(e => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(e.timestamp) >= sevenDaysAgo;
  });

  const previousWeekEvents = events.filter(e => {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const date = new Date(e.timestamp);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  const weekOverWeekGrowth = previousWeekEvents.length > 0
    ? ((lastWeekEvents.length - previousWeekEvents.length) / previousWeekEvents.length) * 100
    : 0;

  return {
    totalUsers: users.length,
    activeUsers30Days: activeUserIds.size,
    totalEvents: events.length,

    bookEngagement: {
      totalQueries: bookQueries.length,
      queriesLast30Days: bookQueriesLast30.length,
      averageQueriesPerUser: users.length > 0 ? bookQueries.length / users.length : 0,
      mostQueriedChapters,
      popularQueries
    },

    transformation: {
      totalJourneysActive: users.length,
      averageFacetProgress: facetDistributionArray.length > 0
        ? facetDistributionArray.reduce((sum, f) => sum + f.facetNumber, 0) / facetDistributionArray.length
        : 1,
      facetDistribution: facetDistributionArray,
      averageShadowsTracked: users.length > 0 ? shadowRecorded.length / users.length : 0,
      totalShadowsIntegrated: shadowIntegrated.length,
      integrationSuccessRate: shadowRecorded.length > 0
        ? shadowsWithIntegration / shadowRecorded.length
        : 0
    },

    elementalBalance,

    engagement: {
      dailyAlchemyViews,
      practicesCompleted,
      achievementsUnlocked,
      averageSessionsPerWeek: 0 // TODO: Calculate based on session tracking
    },

    trends: {
      weekOverWeekGrowth,
      mostActiveDay: 'Monday', // TODO: Calculate from event timestamps
      mostActiveHour: 9, // TODO: Calculate from event timestamps
      retentionRate30Day: 0 // TODO: Calculate based on user return rates
    },

    generatedAt: new Date().toISOString()
  };
}

/**
 * Get user-specific analytics
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  const events = await getUserEvents(userId);

  // Journey events
  const journeyEvents = events.filter(e => e.eventType === 'journey_progress');
  const currentFacet = journeyEvents.length > 0
    ? journeyEvents[journeyEvents.length - 1].metadata.facetNumber || 1
    : 1;

  const facetsCompleted = events.filter(e => e.eventType === 'facet_completed').length;
  const spiralLevel = Math.floor(facetsCompleted / 12);

  // Journey start
  const firstEvent = events.length > 0 ? events[0] : null;
  const journeyStartDate = firstEvent?.timestamp || new Date().toISOString();
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(journeyStartDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Shadow work
  const shadowRecorded = events.filter(e => e.eventType === 'shadow_recorded');
  const shadowIntegrated = events.filter(e => e.eventType === 'shadow_integrated');
  const shadowsWithIntegration = shadowRecorded.filter(e => e.metadata.wasIntegrated).length;

  const shadowElements = shadowRecorded
    .map(e => e.metadata.element as Element)
    .filter(Boolean);
  const shadowElementCounts = new Map<Element, number>();
  for (const element of shadowElements) {
    shadowElementCounts.set(element, (shadowElementCounts.get(element) || 0) + 1);
  }
  const mostWorkedElement = Array.from(shadowElementCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Fire';

  // Book engagement
  const bookQueries = events.filter(e => e.eventType === 'book_query');
  const chapterLoads = events.filter(e => e.eventType === 'chapter_loaded');

  const chapterCounts = new Map<string, number>();
  for (const load of chapterLoads) {
    const element = load.metadata.element || 'unknown';
    chapterCounts.set(element, (chapterCounts.get(element) || 0) + 1);
  }
  const favoriteChapter = Array.from(chapterCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'fire';

  const chaptersExplored = Array.from(new Set(chapterLoads.map(e => e.metadata.element).filter(Boolean)));

  // Daily alchemy
  const dailyAlchemyEvents = events.filter(e => e.eventType === 'daily_alchemy_viewed');
  const alchemyTypeCounts = new Map<'morning' | 'midday' | 'evening', number>();
  for (const event of dailyAlchemyEvents) {
    const type = event.metadata.alchemyType;
    if (type) {
      alchemyTypeCounts.set(type, (alchemyTypeCounts.get(type) || 0) + 1);
    }
  }
  const favoriteAlchemyType = Array.from(alchemyTypeCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning';

  // Streak calculation (simplified)
  const dailyAlchemyStreak = calculateDailyStreak(dailyAlchemyEvents);

  // Practices
  const practicesCompleted = events.filter(e => e.eventType === 'practice_completed').length;

  // Elemental balance
  const allElementalEvents = [...shadowRecorded, ...chapterLoads];
  const userElementalBalance = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0
  };

  for (const event of allElementalEvents) {
    const element = event.metadata.element as Element;
    if (element && element in userElementalBalance) {
      userElementalBalance[element]++;
    }
  }

  const mostActiveElement = Object.entries(userElementalBalance)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as Element || 'Fire';
  const leastActiveElement = Object.entries(userElementalBalance)
    .filter(([, count]) => count > 0)
    .sort((a, b) => a[1] - b[1])[0]?.[0] as Element || 'Aether';

  // Achievements
  const achievements = events.filter(e => e.eventType === 'achievement_unlocked');
  const recentAchievements = achievements
    .slice(-5)
    .map(e => ({
      title: e.metadata.title || 'Achievement Unlocked',
      unlockedAt: e.timestamp
    }));

  return {
    userId,

    transformation: {
      journeyStartDate,
      daysSinceStart,
      currentFacetNumber: currentFacet,
      facetsCompleted,
      spiralLevel,
      overallProgress: facetsCompleted / 12
    },

    shadowWork: {
      patternsTracked: new Set(shadowRecorded.map(e => e.metadata.shadowPatternId)).size,
      instancesRecorded: shadowRecorded.length,
      patternsIntegrated: shadowIntegrated.length,
      integrationRate: shadowRecorded.length > 0
        ? shadowsWithIntegration / shadowRecorded.length
        : 0,
      mostWorkedElement
    },

    bookEngagement: {
      totalQueries: bookQueries.length,
      favoriteChapter,
      chaptersExplored: chaptersExplored as string[],
      lastQueryDate: bookQueries.length > 0
        ? bookQueries[bookQueries.length - 1].timestamp
        : undefined
    },

    dailyPractice: {
      dailyAlchemyStreak,
      totalPracticesCompleted: practicesCompleted,
      favoriteAlchemyType
    },

    elementalBalance: {
      ...userElementalBalance,
      mostActiveElement,
      leastActiveElement
    },

    achievements: {
      total: achievements.length,
      recent: recentAchievements
    },

    generatedAt: new Date().toISOString()
  };
}

/**
 * Get content effectiveness metrics (for Kelly)
 */
export async function getContentEffectiveness(): Promise<ContentEffectiveness> {
  const events = await getAllEvents();

  // Chapter metrics
  const chapterLoads = events.filter(e => e.eventType === 'chapter_loaded');
  const bookQueries = events.filter(e => e.eventType === 'book_query');

  const chapterStats = new Map<string, { views: number; queries: Set<string> }>();

  for (const load of chapterLoads) {
    const element = load.metadata.element || 'unknown';
    if (!chapterStats.has(element)) {
      chapterStats.set(element, { views: 0, queries: new Set() });
    }
    chapterStats.get(element)!.views++;
  }

  for (const query of bookQueries) {
    const chapters = query.metadata.chaptersLoaded || [];
    for (const chapter of chapters) {
      if (!chapterStats.has(chapter)) {
        chapterStats.set(chapter, { views: 0, queries: new Set() });
      }
      chapterStats.get(chapter)!.queries.add(query.metadata.query || '');
    }
  }

  const chapters = Array.from(chapterStats.entries()).map(([element, stats]) => ({
    element,
    views: stats.views,
    queries: stats.queries.size,
    commonThemes: [] // TODO: Analyze query themes
  }));

  // Most transformative facets (based on completion rates)
  const facetCompleted = events.filter(e => e.eventType === 'facet_completed');
  const facetCounts = new Map<number, number>();

  for (const event of facetCompleted) {
    const facetNumber = event.metadata.facetNumber;
    if (facetNumber) {
      facetCounts.set(facetNumber, (facetCounts.get(facetNumber) || 0) + 1);
    }
  }

  const mostTransformativeFacets = Array.from(facetCounts.entries())
    .map(([facetNumber, completionCount]) => ({
      facetNumber,
      completionRate: completionCount, // TODO: Calculate as percentage of users who started
      averageTimeInFacet: 0 // TODO: Calculate from journey_progress events
    }))
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);

  // Most integrated shadows
  const shadowIntegrated = events.filter(e => e.eventType === 'shadow_integrated');
  const shadowPatternStats = new Map<string, { count: number; element?: Element }>();

  for (const event of shadowIntegrated) {
    const pattern = event.metadata.shadowPattern || 'Unknown';
    if (!shadowPatternStats.has(pattern)) {
      shadowPatternStats.set(pattern, {
        count: 0,
        element: event.metadata.element as Element
      });
    }
    shadowPatternStats.get(pattern)!.count++;
  }

  const mostIntegratedShadows = Array.from(shadowPatternStats.entries())
    .map(([shadowPattern, stats]) => ({
      shadowPattern,
      element: stats.element || 'Fire',
      integrationCount: stats.count,
      averageTimeToIntegration: 0 // TODO: Calculate from shadow_recorded to shadow_integrated
    }))
    .sort((a, b) => b.integrationCount - a.integrationCount)
    .slice(0, 10);

  // Daily alchemy engagement
  const dailyAlchemy = events.filter(e => e.eventType === 'daily_alchemy_viewed');
  const morningEngagement = dailyAlchemy.filter(e => e.metadata.alchemyType === 'morning').length;
  const middayEngagement = dailyAlchemy.filter(e => e.metadata.alchemyType === 'midday').length;
  const eveningEngagement = dailyAlchemy.filter(e => e.metadata.alchemyType === 'evening').length;

  return {
    chapters,

    teachings: {
      mostTransformativeFacets,
      mostEffectivePractices: [], // TODO: Track practice completion and impact
      mostIntegratedShadows
    },

    dailyAlchemy: {
      morningEngagement,
      middayEngagement,
      eveningEngagement,
      mostPopularPrompts: [] // TODO: Track specific prompts viewed
    },

    generatedAt: new Date().toISOString()
  };
}

/**
 * Helper: Calculate daily streak
 */
function calculateDailyStreak(events: AnalyticsEvent[]): number {
  if (events.length === 0) return 0;

  // Get unique days with events
  const days = new Set(
    events.map(e => new Date(e.timestamp).toISOString().split('T')[0])
  );

  const sortedDays = Array.from(days).sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);

  for (const day of sortedDays) {
    const dayStr = currentDate.toISOString().split('T')[0];
    if (day === dayStr) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Helper: Get facet ID for number
 */
function getFacetIdForNumber(facetNumber: number): string {
  const facetMap: Record<number, string> = {
    1: 'Fire-1', 2: 'Fire-2', 3: 'Fire-3',
    4: 'Water-1', 5: 'Water-2', 6: 'Water-3',
    7: 'Earth-1', 8: 'Earth-2', 9: 'Earth-3',
    10: 'Air-1', 11: 'Air-2', 12: 'Aether'
  };
  return facetMap[facetNumber] || 'Unknown';
}

/**
 * Helper: Generate event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Database functions (to be implemented)
 */
const eventsCache: AnalyticsEvent[] = [];
const userIds = new Set<string>();

async function saveEvent(event: AnalyticsEvent): Promise<void> {
  eventsCache.push(event);
  userIds.add(event.userId);
  // TODO: Save to database
}

async function getAllEvents(options?: { startDate?: string; endDate?: string }): Promise<AnalyticsEvent[]> {
  let events = [...eventsCache];

  if (options?.startDate) {
    const start = new Date(options.startDate);
    events = events.filter(e => new Date(e.timestamp) >= start);
  }

  if (options?.endDate) {
    const end = new Date(options.endDate);
    events = events.filter(e => new Date(e.timestamp) <= end);
  }

  return events;
}

async function getUserEvents(userId: string): Promise<AnalyticsEvent[]> {
  return eventsCache.filter(e => e.userId === userId);
}

async function getAllUsers(): Promise<string[]> {
  return Array.from(userIds);
}

/**
 * Export for testing
 */
export {
  eventsCache,
  userIds
};
