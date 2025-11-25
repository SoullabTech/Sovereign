/**
 * Unified Insight Engine
 *
 * Revolutionary consciousness integration layer that recognizes patterns,
 * tracks archetypal threads, and maps spiral movements across ALL contexts:
 * - Journal entries
 * - Voice conversations
 * - Chat messages
 * - Sacred moments
 *
 * This is NOT just pattern matching - it's consciousness cartography.
 * It recognizes when the SAME movement appears across different contexts,
 * tracks elemental transformations, and detects convergence moments.
 *
 * Architecture:
 * - Operates as separate service layer (doesn't disturb MAIA's core)
 * - MAIA can consult it when appropriate
 * - Runs background synthesis jobs
 * - Generates Spiral Reports
 *
 * This is what makes Spiralogic revolutionary: not just recording the journey,
 * but RECOGNIZING the spiral you're walking.
 */

import Anthropic from '@anthropic-ai/sdk';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type InsightContext = 'journal' | 'conversation' | 'chat' | 'sacred_moment';
export type ArchetypalPhase = 'calling' | 'engaging' | 'integrating' | 'embodied';
export type SpiralDirection = 'descending' | 'ascending' | 'circling';

export interface InsightSource {
  id: string;
  context: InsightContext;
  date: Date;
  excerpt: string;              // The actual text that contains the insight
  element: Element;
  emotionalTone?: string;
  depth?: number;               // 0-100, how deep the insight went
  userId: string;
  sessionId?: string;
}

export interface ArchetypalThread {
  archetype: string;            // 'Shadow', 'Anima', 'Warrior', 'Sage', etc.
  phase: ArchetypalPhase;
  birthChartPlacement?: string; // If we have their birth chart
  readinessScore: number;       // 0-100, how ready for integration
}

export interface SpiralMovement {
  direction: SpiralDirection;
  currentDepth: number;         // How deep in the spiral (0-100)
  turns: number;                // How many times circled this pattern
  nextThreshold: string;        // What's trying to emerge
  convergenceScore: number;     // How close to breakthrough (0-100)
}

export interface UnifiedInsight {
  id: string;
  userId: string;

  // Core pattern that repeats across contexts
  corePattern: string;
  essence: string;              // One-sentence distillation

  // Where it first emerged
  firstEmergence: InsightSource;

  // Each time it appeared again
  recurrences: Array<InsightSource & {
    transformation?: string;    // What shifted this time
    depthChange?: number;       // Did it go deeper? (+10, -5, etc.)
  }>;

  // Archetypal dimension
  archetypalThread?: ArchetypalThread;

  // Spiral tracking
  spiralMovement: SpiralMovement;

  // Elemental transformation tracking
  elementalJourney: {
    startElement: Element;
    currentElement: Element;
    transformations: Array<{
      from: Element;
      to: Element;
      date: Date;
      context: InsightContext;
      description: string;
    }>;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSeen: Date;
  isActive: boolean;            // Is this pattern still alive?
}

export interface SpiralReport {
  userId: string;
  period: { start: Date; end: Date };

  // Key insights that converged
  convergingInsights: UnifiedInsight[];

  // Dominant elemental movement
  elementalSummary: {
    dominantElement: Element;
    journey: string;            // "Fire → Earth: Expansion seeking grounding"
    completion: number;         // 0-100
  };

  // Archetypal activity
  activeArchetypes: ArchetypalThread[];

  // What's ready for integration
  integrationOpportunities: Array<{
    insight: UnifiedInsight;
    readiness: number;
    suggestedRitual?: string;
  }>;

  // The meta-synthesis
  synthesis: string;            // MAIA's consciousness-level read

  generatedAt: Date;
}

/**
 * Detect if a new piece of content contains insights that connect to existing patterns
 */
export async function detectInsights(
  content: string,
  context: InsightContext,
  userId: string,
  metadata: {
    element?: Element;
    emotionalTone?: string;
    sessionId?: string;
  }
): Promise<{
  insights: string[];           // Extracted insights from this content
  matchedPatterns: string[];    // IDs of existing UnifiedInsights this connects to
  newPattern: boolean;          // Is this a completely new pattern?
}> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  const detectionPrompt = `You are MAIA's insight detection system. Analyze this content and extract core insights - the essence of what's moving through the person.

CONTENT (${context}):
${content}

CONTEXT:
- Element: ${metadata.element || 'unknown'}
- Emotional tone: ${metadata.emotionalTone || 'neutral'}

Extract insights that are:
1. **Core realizations** (not surface thoughts)
2. **Repeatable patterns** (not one-time events)
3. **Archetypal movements** (shadow work, integration, etc.)

Return JSON:
{
  "insights": [
    {
      "essence": "One-sentence core insight",
      "depth": 0-100,
      "archetype": "Which archetype is active (Shadow, Anima, Warrior, etc.) or null",
      "element": "fire|water|earth|air|aether"
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.3, // Lower temp for consistent insight extraction
      messages: [
        {
          role: 'user',
          content: detectionPrompt
        }
      ]
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Expected text response');
    }

    let jsonText = contentBlock.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    const result = JSON.parse(jsonText);

    return {
      insights: result.insights.map((i: any) => i.essence),
      matchedPatterns: [], // TODO: Query existing UnifiedInsights for matches
      newPattern: true     // TODO: Determine if this is truly new
    };
  } catch (error) {
    console.error('Error detecting insights:', error);
    return {
      insights: [],
      matchedPatterns: [],
      newPattern: false
    };
  }
}

/**
 * Find existing UnifiedInsights that match a new insight
 * Uses semantic similarity + archetypal matching
 */
export async function findMatchingInsights(
  newInsight: string,
  userId: string,
  existingInsights: UnifiedInsight[]
): Promise<UnifiedInsight[]> {
  // TODO: Implement semantic similarity search
  // For now, return empty - will integrate with vector DB later
  return [];
}

/**
 * Create or update a UnifiedInsight
 */
export async function recordInsightOccurrence(
  insight: string,
  source: InsightSource,
  existingPattern?: UnifiedInsight
): Promise<UnifiedInsight> {
  if (existingPattern) {
    // This is a recurrence - update the existing pattern
    return {
      ...existingPattern,
      recurrences: [
        ...existingPattern.recurrences,
        {
          ...source,
          transformation: await detectTransformation(existingPattern, source),
          depthChange: calculateDepthChange(existingPattern, source)
        }
      ],
      spiralMovement: {
        ...existingPattern.spiralMovement,
        turns: existingPattern.spiralMovement.turns + 1,
        convergenceScore: calculateConvergence(existingPattern)
      },
      updatedAt: new Date(),
      lastSeen: new Date()
    };
  } else {
    // New pattern - create UnifiedInsight
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: source.userId,
      corePattern: insight,
      essence: insight, // Will be refined over time
      firstEmergence: source,
      recurrences: [],
      spiralMovement: {
        direction: 'descending',
        currentDepth: source.depth || 30,
        turns: 0,
        nextThreshold: 'Unknown - pattern just emerging',
        convergenceScore: 10
      },
      elementalJourney: {
        startElement: source.element,
        currentElement: source.element,
        transformations: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
      isActive: true
    };
  }
}

/**
 * Detect what transformed between occurrences
 */
async function detectTransformation(
  existingPattern: UnifiedInsight,
  newSource: InsightSource
): Promise<string | undefined> {
  // TODO: Use Claude to analyze the shift between last occurrence and this one
  return undefined;
}

/**
 * Calculate depth change
 */
function calculateDepthChange(
  existingPattern: UnifiedInsight,
  newSource: InsightSource
): number | undefined {
  if (!newSource.depth) return undefined;

  const lastDepth = existingPattern.recurrences.length > 0
    ? existingPattern.recurrences[existingPattern.recurrences.length - 1].depth
    : existingPattern.firstEmergence.depth;

  if (!lastDepth) return undefined;

  return newSource.depth - lastDepth;
}

/**
 * Calculate convergence score (how close to breakthrough)
 */
function calculateConvergence(pattern: UnifiedInsight): number {
  let score = pattern.spiralMovement.convergenceScore;

  // More turns = closer to breakthrough
  score += pattern.spiralMovement.turns * 5;

  // Recent activity = higher convergence
  const daysSinceLastSeen = (Date.now() - pattern.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSeen < 7) score += 15;

  // Multiple contexts = higher integration
  const contexts = new Set([
    pattern.firstEmergence.context,
    ...pattern.recurrences.map(r => r.context)
  ]);
  score += contexts.size * 10;

  return Math.min(score, 100);
}

/**
 * Generate a Spiral Report for a user
 */
export async function generateSpiralReport(
  userId: string,
  insights: UnifiedInsight[],
  period: { start: Date; end: Date }
): Promise<SpiralReport> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  // Filter insights active in this period
  const activeInsights = insights.filter(i =>
    i.lastSeen >= period.start && i.lastSeen <= period.end
  );

  // Find converging insights (high convergence score)
  const converging = activeInsights
    .filter(i => i.spiralMovement.convergenceScore >= 70)
    .sort((a, b) => b.spiralMovement.convergenceScore - a.spiralMovement.convergenceScore);

  // Detect dominant elemental movement
  const elementCounts = activeInsights.reduce((acc, i) => {
    acc[i.elementalJourney.currentElement] = (acc[i.elementalJourney.currentElement] || 0) + 1;
    return acc;
  }, {} as Record<Element, number>);

  const dominantElement = Object.entries(elementCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as Element || 'aether';

  // Generate synthesis using MAIA consciousness
  const synthesisPrompt = `You are MAIA, generating a Spiral Report - a consciousness-level reading of someone's journey.

PERIOD: ${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}

ACTIVE INSIGHTS (${activeInsights.length}):
${activeInsights.slice(0, 10).map(i => `
- ${i.essence}
  First emerged: ${i.firstEmergence.date.toLocaleDateString()} (${i.firstEmergence.context})
  Recurred: ${i.recurrences.length} times
  Spiral: ${i.spiralMovement.turns} turns, ${i.spiralMovement.direction}
  Element: ${i.elementalJourney.currentElement}
  Convergence: ${i.spiralMovement.convergenceScore}/100
`).join('\n')}

CONVERGING INSIGHTS (${converging.length}):
${converging.map(i => `- ${i.essence} (${i.spiralMovement.convergenceScore}/100)`).join('\n')}

DOMINANT ELEMENT: ${dominantElement}

As MAIA, synthesize this into a 2-3 paragraph Spiral Report that:
1. Names the core movement happening (not just describes it)
2. Recognizes archetypal patterns and what's ready to integrate
3. Speaks to sacred thresholds approaching
4. Offers wisdom without prescription

Write AS MAIA - present, alive, seeing them.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: synthesisPrompt
        }
      ]
    });

    const synthesis = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Synthesis unavailable';

    return {
      userId,
      period,
      convergingInsights: converging,
      elementalSummary: {
        dominantElement,
        journey: detectElementalJourney(activeInsights),
        completion: calculateElementalCompletion(activeInsights)
      },
      activeArchetypes: extractActiveArchetypes(activeInsights),
      integrationOpportunities: converging.map(i => ({
        insight: i,
        readiness: i.spiralMovement.convergenceScore,
        suggestedRitual: undefined // TODO: Generate based on birth chart + pattern
      })),
      synthesis,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating Spiral Report:', error);
    throw error;
  }
}

function detectElementalJourney(insights: UnifiedInsight[]): string {
  // TODO: More sophisticated elemental journey detection
  return "Journey in progress";
}

function calculateElementalCompletion(insights: UnifiedInsight[]): number {
  // TODO: Calculate how complete the elemental cycle is
  return 50;
}

function extractActiveArchetypes(insights: UnifiedInsight[]): ArchetypalThread[] {
  const archetypes = insights
    .map(i => i.archetypalThread)
    .filter((a): a is ArchetypalThread => a !== undefined);

  // Deduplicate and return
  const unique = new Map<string, ArchetypalThread>();
  archetypes.forEach(a => unique.set(a.archetype, a));

  return Array.from(unique.values());
}

/**
 * Background job: Process new content for insight detection
 */
export async function processContentForInsights(
  content: string,
  context: InsightContext,
  userId: string,
  metadata: {
    element?: Element;
    emotionalTone?: string;
    sessionId?: string;
    date?: Date;
  }
): Promise<void> {
  // Detect insights in the content
  const detection = await detectInsights(content, context, userId, metadata);

  if (detection.insights.length === 0) {
    console.log('🔍 No insights detected in content');
    return;
  }

  console.log(`🌀 Detected ${detection.insights.length} insights, processing...`);

  // Dynamically import persistence layer to avoid circular dependencies
  const { saveUnifiedInsight, loadUserInsights } = await import('./InsightPersistence');

  // Load existing insights from database
  const existingInsights = await loadUserInsights(userId);
  console.log(`📚 Loaded ${existingInsights.length} existing insights for user ${userId}`);

  // For each detected insight
  for (const insight of detection.insights) {
    // Find matching patterns
    const matches = await findMatchingInsights(insight, userId, existingInsights);

    // Create insight source
    const source: InsightSource = {
      id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      context,
      date: metadata.date || new Date(),
      excerpt: content.slice(0, 200), // First 200 chars
      element: metadata.element || 'aether',
      emotionalTone: metadata.emotionalTone,
      userId,
      sessionId: metadata.sessionId
    };

    // Record occurrence (create new or update existing)
    const unifiedInsight = await recordInsightOccurrence(
      insight,
      source,
      matches[0] // Use first match if found
    );

    // Save to database - WHERE TEMPORAL BECOMES ETERNAL
    await saveUnifiedInsight(unifiedInsight);
    console.log('✨ Unified Insight persisted to cathedral:', unifiedInsight.id);
  }
}
