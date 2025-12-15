/**
 * SHADOW INTEGRATION TRACKER
 *
 * Personal alchemical process journal for tracking shadow work
 * Name shadow patterns, track when they arise, record gold medicine applied
 * Measure transformation over time with insights and progress metrics
 */

import {
  UNIFIED_FACET_MAP,
  UnifiedFacetMapping,
  getFacetByNumber,
  getShadowGoldTeachings
} from '../consciousness/UnifiedSpiralogicAlchemyMap';
import { Element } from '../consciousness/spiralogic-core';

/**
 * Shadow pattern instance - when a shadow arises
 */
export interface ShadowInstance {
  id: string;
  userId: string;
  shadowPatternId: string; // References a ShadowPattern

  // Context
  occurredAt: string;
  trigger?: string; // What triggered this shadow
  context?: string; // Where/when it happened
  intensity: 1 | 2 | 3 | 4 | 5; // How strong was it?

  // Awareness
  noticeMethod: 'body_sensation' | 'emotion' | 'behavior' | 'thought_pattern' | 'external_feedback';
  awareness: string; // What did you notice?

  // Response
  goldMedicineApplied?: string;
  responseTaken?: string; // What did you do differently?

  // Integration
  insights?: string; // What did you learn?
  wasIntegrated: boolean; // Did you work with it or react automatically?

  // Tracking
  createdAt: string;
  updatedAt: string;
}

/**
 * Shadow pattern - a recurring shadow from the 12 facets
 */
export interface ShadowPattern {
  id: string;
  userId: string;

  // Pattern identification
  name: string; // User's name for it (e.g., "My perfectionism")
  description: string;

  // Facet connection
  facetNumber: number; // Which of the 12 facets
  element: Element;
  officialShadowPattern: string; // From UnifiedFacetMapping
  officialGoldMedicine: string; // From UnifiedFacetMapping

  // Personal customization
  personalTriggers: string[]; // What triggers this for you?
  personalGoldMedicine: string[]; // What works for you specifically?

  // Tracking
  firstNoticed: string;
  instanceCount: number; // How many times recorded
  lastOccurred?: string;

  // Status
  status: 'active' | 'integrating' | 'integrated' | 'dormant';
  integrationNotes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Shadow transformation metrics
 */
export interface ShadowTransformationMetrics {
  userId: string;

  // Overall stats
  totalPatternsTracked: number;
  totalInstancesRecorded: number;

  // Status breakdown
  activePatterns: number;
  integratingPatterns: number;
  integratedPatterns: number;
  dormantPatterns: number;

  // Integration progress
  averageIntegrationRate: number; // 0-1 (% of instances where gold medicine applied)
  awarenessSpeed: number; // Average time from occurrence to recording (in hours)

  // Elemental balance
  shadowsByElement: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    Aether: number;
  };

  // Recent trends
  last30Days: {
    instancesRecorded: number;
    integrationRate: number;
    mostActivePattern?: string;
  };

  last90Days: {
    instancesRecorded: number;
    integrationRate: number;
    patternsIntegrated: number;
  };

  // Journey progress
  currentFacetShadow?: {
    facetNumber: number;
    shadowPattern: string;
    tracked: boolean;
  };
}

/**
 * Shadow integration insight
 */
export interface ShadowIntegrationInsight {
  type: 'pattern_recognition' | 'progress' | 'recommendation' | 'achievement';
  title: string;
  message: string;
  actionable?: string;
  relatedPatternIds?: string[];
  generatedAt: string;
}

/**
 * Create a new shadow pattern to track
 */
export async function createShadowPattern(
  userId: string,
  params: {
    name: string;
    description: string;
    facetNumber: number;
    personalTriggers?: string[];
    personalGoldMedicine?: string[];
  }
): Promise<ShadowPattern> {
  const facet = getFacetByNumber(params.facetNumber);
  if (!facet) {
    throw new Error(`Invalid facet number: ${params.facetNumber}`);
  }

  const shadowGold = getShadowGoldTeachings(facet);

  const pattern: ShadowPattern = {
    id: generateId(),
    userId,
    name: params.name,
    description: params.description,
    facetNumber: params.facetNumber,
    element: facet.element,
    officialShadowPattern: shadowGold.shadow,
    officialGoldMedicine: shadowGold.gold,
    personalTriggers: params.personalTriggers || [],
    personalGoldMedicine: params.personalGoldMedicine || [],
    firstNoticed: new Date().toISOString(),
    instanceCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveShadowPattern(pattern);

  console.log('🌑 [SHADOW] New pattern tracked:', {
    name: pattern.name,
    facet: facet.facetId,
    element: facet.element
  });

  return pattern;
}

/**
 * Record a shadow instance
 */
export async function recordShadowInstance(
  userId: string,
  params: {
    shadowPatternId: string;
    trigger?: string;
    context?: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    noticeMethod: ShadowInstance['noticeMethod'];
    awareness: string;
    goldMedicineApplied?: string;
    responseTaken?: string;
    insights?: string;
  }
): Promise<ShadowInstance> {
  // Verify pattern exists
  const pattern = await getShadowPattern(params.shadowPatternId);
  if (!pattern || pattern.userId !== userId) {
    throw new Error('Shadow pattern not found');
  }

  const instance: ShadowInstance = {
    id: generateId(),
    userId,
    shadowPatternId: params.shadowPatternId,
    occurredAt: new Date().toISOString(),
    trigger: params.trigger,
    context: params.context,
    intensity: params.intensity,
    noticeMethod: params.noticeMethod,
    awareness: params.awareness,
    goldMedicineApplied: params.goldMedicineApplied,
    responseTaken: params.responseTaken,
    insights: params.insights,
    wasIntegrated: !!(params.goldMedicineApplied || params.responseTaken),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveShadowInstance(instance);

  // Update pattern stats
  pattern.instanceCount += 1;
  pattern.lastOccurred = instance.occurredAt;
  pattern.updatedAt = new Date().toISOString();
  await saveShadowPattern(pattern);

  console.log('🌑 [SHADOW] Instance recorded:', {
    pattern: pattern.name,
    intensity: instance.intensity,
    integrated: instance.wasIntegrated
  });

  return instance;
}

/**
 * Get all shadow patterns for a user
 */
export async function getUserShadowPatterns(
  userId: string,
  options?: {
    status?: ShadowPattern['status'];
    element?: Element;
  }
): Promise<ShadowPattern[]> {
  let patterns = await getAllShadowPatterns(userId);

  // Filter by status
  if (options?.status) {
    patterns = patterns.filter(p => p.status === options.status);
  }

  // Filter by element
  if (options?.element) {
    patterns = patterns.filter(p => p.element === options.element);
  }

  return patterns.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Get shadow instances for a pattern
 */
export async function getPatternInstances(
  patternId: string,
  options?: {
    limit?: number;
    since?: string; // ISO date
  }
): Promise<ShadowInstance[]> {
  let instances = await getAllInstancesForPattern(patternId);

  // Filter by date
  if (options?.since) {
    const sinceDate = new Date(options.since);
    instances = instances.filter(i => new Date(i.occurredAt) >= sinceDate);
  }

  // Sort by most recent
  instances.sort((a, b) =>
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  // Limit
  if (options?.limit) {
    instances = instances.slice(0, options.limit);
  }

  return instances;
}

/**
 * Update shadow pattern status
 */
export async function updateShadowPatternStatus(
  patternId: string,
  status: ShadowPattern['status'],
  integrationNotes?: string
): Promise<ShadowPattern> {
  const pattern = await getShadowPattern(patternId);
  if (!pattern) {
    throw new Error('Pattern not found');
  }

  pattern.status = status;
  if (integrationNotes) {
    pattern.integrationNotes = integrationNotes;
  }
  pattern.updatedAt = new Date().toISOString();

  await saveShadowPattern(pattern);

  console.log('🌑→✨ [SHADOW] Status updated:', {
    pattern: pattern.name,
    status,
    element: pattern.element
  });

  return pattern;
}

/**
 * Get transformation metrics for user
 */
export async function getShadowTransformationMetrics(
  userId: string
): Promise<ShadowTransformationMetrics> {
  const patterns = await getAllShadowPatterns(userId);
  const allInstances = await getAllInstancesForUser(userId);

  // Calculate status breakdown
  const statusCount = {
    active: patterns.filter(p => p.status === 'active').length,
    integrating: patterns.filter(p => p.status === 'integrating').length,
    integrated: patterns.filter(p => p.status === 'integrated').length,
    dormant: patterns.filter(p => p.status === 'dormant').length
  };

  // Calculate integration rate
  const integratedInstances = allInstances.filter(i => i.wasIntegrated).length;
  const integrationRate = allInstances.length > 0
    ? integratedInstances / allInstances.length
    : 0;

  // Elemental breakdown
  const shadowsByElement = {
    Fire: patterns.filter(p => p.element === 'Fire').length,
    Water: patterns.filter(p => p.element === 'Water').length,
    Earth: patterns.filter(p => p.element === 'Earth').length,
    Air: patterns.filter(p => p.element === 'Air').length,
    Aether: patterns.filter(p => p.element === 'Aether').length
  };

  // Recent trends
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const last30DaysInstances = allInstances.filter(i =>
    new Date(i.occurredAt) >= thirtyDaysAgo
  );
  const last90DaysInstances = allInstances.filter(i =>
    new Date(i.occurredAt) >= ninetyDaysAgo
  );

  const last30DaysIntegrated = last30DaysInstances.filter(i => i.wasIntegrated).length;
  const last90DaysIntegrated = last90DaysInstances.filter(i => i.wasIntegrated).length;

  // Most active pattern in last 30 days
  const patternCounts = new Map<string, number>();
  for (const instance of last30DaysInstances) {
    const count = patternCounts.get(instance.shadowPatternId) || 0;
    patternCounts.set(instance.shadowPatternId, count + 1);
  }
  let mostActivePatternId: string | undefined;
  let maxCount = 0;
  for (const [patternId, count] of patternCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostActivePatternId = patternId;
    }
  }
  const mostActivePattern = mostActivePatternId
    ? (await getShadowPattern(mostActivePatternId))?.name
    : undefined;

  // Patterns integrated in last 90 days
  const patternsIntegratedLast90 = patterns.filter(p =>
    p.status === 'integrated' &&
    p.updatedAt &&
    new Date(p.updatedAt) >= ninetyDaysAgo
  ).length;

  return {
    userId,
    totalPatternsTracked: patterns.length,
    totalInstancesRecorded: allInstances.length,
    activePatterns: statusCount.active,
    integratingPatterns: statusCount.integrating,
    integratedPatterns: statusCount.integrated,
    dormantPatterns: statusCount.dormant,
    averageIntegrationRate: integrationRate,
    awarenessSpeed: 0, // TODO: Implement when we track time-to-recording
    shadowsByElement,
    last30Days: {
      instancesRecorded: last30DaysInstances.length,
      integrationRate: last30DaysInstances.length > 0
        ? last30DaysIntegrated / last30DaysInstances.length
        : 0,
      mostActivePattern
    },
    last90Days: {
      instancesRecorded: last90DaysInstances.length,
      integrationRate: last90DaysInstances.length > 0
        ? last90DaysIntegrated / last90DaysInstances.length
        : 0,
      patternsIntegrated: patternsIntegratedLast90
    }
  };
}

/**
 * Generate insights about shadow integration journey
 */
export async function generateShadowInsights(
  userId: string
): Promise<ShadowIntegrationInsight[]> {
  const metrics = await getShadowTransformationMetrics(userId);
  const patterns = await getAllShadowPatterns(userId);
  const insights: ShadowIntegrationInsight[] = [];

  // Insight: First pattern tracked
  if (patterns.length === 1) {
    insights.push({
      type: 'achievement',
      title: 'Shadow Work Begins',
      message: 'You\'ve taken the first step in conscious shadow integration by naming and tracking a pattern. This is profound work.',
      actionable: 'Record instances as they arise. Each awareness is a victory.',
      generatedAt: new Date().toISOString()
    });
  }

  // Insight: High integration rate
  if (metrics.last30Days.integrationRate >= 0.7 && metrics.last30Days.instancesRecorded >= 5) {
    insights.push({
      type: 'progress',
      title: 'Strong Integration Practice',
      message: `You're integrating gold medicine in ${Math.round(metrics.last30Days.integrationRate * 100)}% of shadow instances. This shows developing mastery.`,
      actionable: 'Notice what\'s working and apply those practices to other patterns.',
      generatedAt: new Date().toISOString()
    });
  }

  // Insight: Low integration rate
  if (metrics.last30Days.integrationRate < 0.3 && metrics.last30Days.instancesRecorded >= 5) {
    insights.push({
      type: 'recommendation',
      title: 'Awareness Before Integration',
      message: `You're building awareness by tracking instances. The next step is practicing gold medicine in the moment.`,
      actionable: 'Before recording an instance, try applying one piece of gold medicine first.',
      generatedAt: new Date().toISOString()
    });
  }

  // Insight: Pattern dormant (integrated?)
  const possiblyIntegrated = patterns.filter(p => {
    if (!p.lastOccurred) return false;
    const daysSinceOccurrence =
      (Date.now() - new Date(p.lastOccurred).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceOccurrence > 60 && p.instanceCount >= 3;
  });

  if (possiblyIntegrated.length > 0) {
    const pattern = possiblyIntegrated[0];
    insights.push({
      type: 'achievement',
      title: 'Pattern May Be Integrating',
      message: `"${pattern.name}" hasn't appeared in 60+ days. This could indicate deep integration.`,
      actionable: `Consider marking it as 'integrated' or 'dormant' and reflecting on what shifted.`,
      relatedPatternIds: [pattern.id],
      generatedAt: new Date().toISOString()
    });
  }

  // Insight: Elemental imbalance
  const totalShadows = Object.values(metrics.shadowsByElement).reduce((a, b) => a + b, 0);
  if (totalShadows >= 3) {
    const elementCounts = Object.entries(metrics.shadowsByElement)
      .sort(([, a], [, b]) => b - a);

    const [dominantElement, dominantCount] = elementCounts[0];
    const percentage = (dominantCount / totalShadows) * 100;

    if (percentage >= 60) {
      const elementGuidance: Record<string, string> = {
        Fire: 'Creative burnout and unsustainable vision. Consider grounding practices (Earth).',
        Water: 'Emotional overwhelm and boundary challenges. Consider clarity practices (Air).',
        Earth: 'Stuckness and rigidity. Consider flow practices (Water) or new perspectives (Air).',
        Air: 'Overthinking and disconnection. Consider embodiment practices (Earth).',
        Aether: 'Spiritual bypassing. Ground in the elements before ascending to unity.'
      };

      insights.push({
        type: 'pattern_recognition',
        title: `${dominantElement} Element Dominant`,
        message: `${percentage.toFixed(0)}% of your tracked shadows are ${dominantElement}-related. ${elementGuidance[dominantElement] || ''}`,
        actionable: `Explore practices from other elements to balance your shadow work.`,
        generatedAt: new Date().toISOString()
      });
    }
  }

  // Insight: Consistent tracking
  if (metrics.last30Days.instancesRecorded >= 10) {
    insights.push({
      type: 'achievement',
      title: 'Consistent Shadow Tracking',
      message: `You've recorded ${metrics.last30Days.instancesRecorded} instances in the last 30 days. This level of awareness is transformative.`,
      actionable: 'Review your instances to spot deeper patterns beneath the patterns.',
      generatedAt: new Date().toISOString()
    });
  }

  // Insight: First integration
  const firstIntegration = patterns.find(p => p.status === 'integrated');
  if (firstIntegration && metrics.integratedPatterns === 1) {
    insights.push({
      type: 'achievement',
      title: 'First Shadow Integrated',
      message: `You've integrated "${firstIntegration.name}". This is alchemical transformation in action.`,
      actionable: 'Notice how life feels different without this pattern running you.',
      relatedPatternIds: [firstIntegration.id],
      generatedAt: new Date().toISOString()
    });
  }

  return insights;
}

/**
 * Suggest shadow patterns to track based on user's current facet
 */
export async function suggestShadowPatternsForFacet(
  facetNumber: number
): Promise<{
  facet: UnifiedFacetMapping;
  shadowPattern: string;
  goldMedicine: string;
  commonTriggers: string[];
  practicesForIntegration: string[];
}> {
  const facet = getFacetByNumber(facetNumber);
  if (!facet) {
    throw new Error('Invalid facet number');
  }

  const shadowGold = getShadowGoldTeachings(facet);

  // Generate common triggers based on element and phase
  const commonTriggers = generateCommonTriggersForFacet(facet);
  const practices = generatePracticesForShadow(facet);

  return {
    facet,
    shadowPattern: shadowGold.shadow,
    goldMedicine: shadowGold.gold,
    commonTriggers,
    practicesForIntegration: practices
  };
}

/**
 * Get shadow pattern history (timeline view)
 */
export async function getShadowPatternHistory(
  patternId: string
): Promise<{
  pattern: ShadowPattern;
  instances: ShadowInstance[];
  timeline: Array<{
    date: string;
    instanceCount: number;
    integrationRate: number;
    averageIntensity: number;
  }>;
  progressSummary: {
    totalInstances: number;
    integrationRate: number;
    intensityTrend: 'increasing' | 'stable' | 'decreasing';
    frequencyTrend: 'increasing' | 'stable' | 'decreasing';
  };
}> {
  const pattern = await getShadowPattern(patternId);
  if (!pattern) {
    throw new Error('Pattern not found');
  }

  const instances = await getAllInstancesForPattern(patternId);

  // Build weekly timeline
  const weeklyData = new Map<string, { instances: ShadowInstance[] }>();

  for (const instance of instances) {
    const date = new Date(instance.occurredAt);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, { instances: [] });
    }
    weeklyData.get(weekKey)!.instances.push(instance);
  }

  const timeline = Array.from(weeklyData.entries())
    .map(([date, data]) => ({
      date,
      instanceCount: data.instances.length,
      integrationRate: data.instances.filter(i => i.wasIntegrated).length / data.instances.length,
      averageIntensity: data.instances.reduce((sum, i) => sum + i.intensity, 0) / data.instances.length
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate trends
  const recentInstances = instances.slice(0, 10);
  const olderInstances = instances.slice(10, 20);

  const recentAvgIntensity = recentInstances.length > 0
    ? recentInstances.reduce((sum, i) => sum + i.intensity, 0) / recentInstances.length
    : 0;
  const olderAvgIntensity = olderInstances.length > 0
    ? olderInstances.reduce((sum, i) => sum + i.intensity, 0) / olderInstances.length
    : 0;

  const intensityTrend = recentAvgIntensity < olderAvgIntensity - 0.5 ? 'decreasing'
    : recentAvgIntensity > olderAvgIntensity + 0.5 ? 'increasing'
    : 'stable';

  // Frequency trend (compare last 30 days to previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentFrequency = instances.filter(i => new Date(i.occurredAt) >= thirtyDaysAgo).length;
  const previousFrequency = instances.filter(i => {
    const date = new Date(i.occurredAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;

  const frequencyTrend = recentFrequency < previousFrequency * 0.7 ? 'decreasing'
    : recentFrequency > previousFrequency * 1.3 ? 'increasing'
    : 'stable';

  const integrationRate = instances.filter(i => i.wasIntegrated).length / instances.length;

  return {
    pattern,
    instances: instances.slice(0, 20), // Most recent 20
    timeline,
    progressSummary: {
      totalInstances: instances.length,
      integrationRate,
      intensityTrend,
      frequencyTrend
    }
  };
}

/**
 * Helper: Generate common triggers for a facet
 */
function generateCommonTriggersForFacet(facet: UnifiedFacetMapping): string[] {
  const triggersByElement: Record<string, string[]> = {
    Fire: [
      'Seeing others succeed with their vision',
      'Feeling creatively blocked',
      'Being asked to compromise your vision',
      'Running out of creative energy',
      'Comparing your progress to others'
    ],
    Water: [
      'Someone else\'s strong emotions',
      'Feeling overwhelmed by sadness',
      'Relationship conflict',
      'Being asked to "just get over it"',
      'Sensing others\' pain'
    ],
    Earth: [
      'Things not going according to plan',
      'Feeling rushed or pressured',
      'Scarcity or lack',
      'Change and uncertainty',
      'Physical discomfort or illness'
    ],
    Air: [
      'Confusion or lack of clarity',
      'Being misunderstood',
      'Information overload',
      'Having to make a decision',
      'Needing to explain yourself'
    ],
    Aether: [
      'Feeling fragmented',
      'Conflict between different parts of self',
      'Spiritual experiences that feel destabilizing',
      'Being asked to choose one path',
      'Feeling disconnected from wholeness'
    ]
  };

  return triggersByElement[facet.element] || [];
}

/**
 * Helper: Generate integration practices for shadow
 */
function generatePracticesForShadow(facet: UnifiedFacetMapping): string[] {
  const practicesByElement: Record<string, string[]> = {
    Fire: [
      'Pause before starting new projects',
      'Check: Is this sustainable?',
      'Ground vision in body before acting',
      'Rest between creative cycles'
    ],
    Water: [
      'Name the emotion without judgment',
      'Feel it in your body for 60 seconds',
      'Boundary: "This is theirs, this is mine"',
      'Release through tears, movement, or breath'
    ],
    Earth: [
      'Feet on the ground, 5 deep breaths',
      'Name three things you have right now',
      'One small practical step',
      'Trust the timing of growth'
    ],
    Air: [
      'Write to clarify thoughts',
      '5 conscious breaths to clear mental fog',
      'Ask: What\'s the simplest truth here?',
      'Ground thinking in body sensation'
    ],
    Aether: [
      'Witness all parts without choosing sides',
      'Feel into wholeness beneath fragmentation',
      'Ground transcendence in body',
      'Serve from fullness, not depletion'
    ]
  };

  return practicesByElement[facet.element] || [];
}

/**
 * Helper: Get start of week for a date
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

/**
 * Helper: Generate unique ID
 */
function generateId(): string {
  return `shadow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Database functions (to be implemented)
 */
const shadowPatternsCache = new Map<string, ShadowPattern>();
const shadowInstancesCache = new Map<string, ShadowInstance>();
const userPatternsCache = new Map<string, string[]>(); // userId -> patternIds
const patternInstancesCache = new Map<string, string[]>(); // patternId -> instanceIds

async function saveShadowPattern(pattern: ShadowPattern): Promise<void> {
  shadowPatternsCache.set(pattern.id, pattern);

  const userPatterns = userPatternsCache.get(pattern.userId) || [];
  if (!userPatterns.includes(pattern.id)) {
    userPatterns.push(pattern.id);
    userPatternsCache.set(pattern.userId, userPatterns);
  }

  console.log('🌑 [SHADOW] Pattern saved:', pattern.name);
}

async function getShadowPattern(patternId: string): Promise<ShadowPattern | undefined> {
  return shadowPatternsCache.get(patternId);
}

async function getAllShadowPatterns(userId: string): Promise<ShadowPattern[]> {
  const patternIds = userPatternsCache.get(userId) || [];
  return patternIds
    .map(id => shadowPatternsCache.get(id))
    .filter((p): p is ShadowPattern => p !== undefined);
}

async function saveShadowInstance(instance: ShadowInstance): Promise<void> {
  shadowInstancesCache.set(instance.id, instance);

  const patternInstances = patternInstancesCache.get(instance.shadowPatternId) || [];
  if (!patternInstances.includes(instance.id)) {
    patternInstances.push(instance.id);
    patternInstancesCache.set(instance.shadowPatternId, patternInstances);
  }
}

async function getAllInstancesForPattern(patternId: string): Promise<ShadowInstance[]> {
  const instanceIds = patternInstancesCache.get(patternId) || [];
  return instanceIds
    .map(id => shadowInstancesCache.get(id))
    .filter((i): i is ShadowInstance => i !== undefined);
}

async function getAllInstancesForUser(userId: string): Promise<ShadowInstance[]> {
  const patterns = await getAllShadowPatterns(userId);
  const allInstances: ShadowInstance[] = [];

  for (const pattern of patterns) {
    const instances = await getAllInstancesForPattern(pattern.id);
    allInstances.push(...instances);
  }

  return allInstances;
}

/**
 * Export for testing
 */
export {
  shadowPatternsCache,
  shadowInstancesCache,
  userPatternsCache,
  patternInstancesCache
};
