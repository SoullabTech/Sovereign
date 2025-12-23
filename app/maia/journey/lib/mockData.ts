/**
 * Mock Data Generators - Journey Page Phase 2
 *
 * Deterministic mock data for all Bardic/Collective endpoints.
 * Useful for development, testing, and API contract verification.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Created: December 23, 2024
 */

import type {
  Thread,
  Insight,
  Symbol,
  SynthesisReport,
  Motif,
  Cycle,
  CollectiveCoherence,
} from '../types';

// ============================================================================
// Seeded Random Number Generator (Deterministic)
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// ============================================================================
// Thread Generators (💧 Water Layer)
// ============================================================================

const THREAD_TITLES = [
  'Breaking Through Perfectionism',
  'Finding Peace with Uncertainty',
  'Integrating Shadow Work',
  'Navigating Career Transitions',
  'Healing Attachment Patterns',
  'Creative Flow and Resistance',
  'Boundary Setting with Family',
  'Processing Grief and Loss',
  'Reconnecting with Joy',
  'Embracing Vulnerability',
  'Trusting Inner Guidance',
  'Releasing Control Patterns',
];

const THREAD_SUMMARIES = [
  'Exploring the tension between striving for excellence and accepting imperfection.',
  'Learning to sit with ambiguity without rushing to resolve it.',
  'Uncovering hidden parts of self that have been rejected or suppressed.',
  'Navigating identity shifts during major professional changes.',
  'Recognizing and transforming codependent relationship dynamics.',
  'Understanding the cycles of creative energy and how resistance serves growth.',
  'Practicing assertive communication while maintaining compassion.',
  'Moving through stages of grief with gentleness and presence.',
  'Rediscovering what brings delight after periods of heaviness.',
  'Opening to authentic connection despite fear of judgment.',
  'Discerning between ego-driven impulses and soul-aligned direction.',
  'Softening the grip on outcomes and allowing life to unfold.',
];

export function generateThreads(count: number = 12, seed: number = 42): Thread[] {
  const rng = new SeededRandom(seed);
  const threads: Thread[] = [];

  for (let i = 0; i < count; i++) {
    const weekNumber = i + 1;
    const coherence = 0.6 + rng.next() * 0.35; // 0.6-0.95
    const hoursAgo = rng.nextInt(1, 72);
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    threads.push({
      id: i + 1,
      title: THREAD_TITLES[i % THREAD_TITLES.length],
      summary: THREAD_SUMMARIES[i % THREAD_SUMMARIES.length],
      weekNumber,
      coherence,
      timestamp,
      elementType: rng.choice(['water', 'fire', 'earth', 'air', 'aether']),
      facetCode: rng.choice(['W1', 'W2', 'W3', 'F1', 'F2', 'F3', 'E1', 'E2', 'E3', 'A1', 'A2', 'A3']),
    });
  }

  return threads;
}

// ============================================================================
// Insight Generators (🌬️ Air Layer)
// ============================================================================

const INSIGHT_PATTERNS = [
  'Notice recurring themes around self-worth emerging across recent threads',
  'The rhythm of retreat and emergence appears consistently every 3-4 weeks',
  'Water imagery surfaces during moments of emotional processing',
  'Fire language intensifies when discussing creative projects',
  'Body sensations are being named more frequently in recent sessions',
  'Questions about "enough-ness" connect threads from W2, W5, and W7',
];

const INSIGHT_REFLECTIONS = [
  'What if the resistance you feel is actually a protective boundary?',
  'Your words suggest a readiness for a deeper level of integration',
  'The metaphor of "holding space" has evolved significantly since W1',
  'There seems to be a softening happening around the idea of control',
  'Your voice tone shifted noticeably when naming this pattern',
  'This connects to the dream you mentioned three weeks ago',
];

const INSIGHT_QUESTIONS = [
  'What would it feel like to trust this process completely?',
  'How might this pattern be serving you in ways you haven\'t considered?',
  'What are you protecting by holding on to this belief?',
  'If your future self could speak to you now, what would they say?',
  'What becomes possible if you release the need to know how?',
  'Where in your body do you feel this truth landing?',
];

export function generateInsights(count: number = 15, seed: number = 42): Insight[] {
  const rng = new SeededRandom(seed);
  const insights: Insight[] = [];

  const insightTexts = [...INSIGHT_PATTERNS, ...INSIGHT_REFLECTIONS, ...INSIGHT_QUESTIONS];

  for (let i = 0; i < count; i++) {
    const type = rng.choice<'pattern' | 'reflection' | 'question'>(['pattern', 'reflection', 'question']);
    const confidence = 0.7 + rng.next() * 0.25; // 0.7-0.95
    const relatedCount = rng.nextInt(1, 4);
    const relatedThreadIds = Array.from({ length: relatedCount }, () => rng.nextInt(1, 12));
    const minutesAgo = rng.nextInt(5, 180);
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    insights.push({
      id: `insight-${i + 1}`,
      type,
      text: insightTexts[i % insightTexts.length],
      confidence,
      relatedThreadIds,
      timestamp,
    });
  }

  return insights;
}

// ============================================================================
// Symbol Generators (🌬️ Air Layer)
// ============================================================================

const ARCHETYPAL_SYMBOLS = [
  { label: 'Phoenix', archetype: 'Rebirth', color: '#FF6B35' },
  { label: 'River', archetype: 'Flow', color: '#4ECDC4' },
  { label: 'Mountain', archetype: 'Stability', color: '#95A99C' },
  { label: 'Labyrinth', archetype: 'Journey', color: '#8B7B8B' },
  { label: 'Mirror', archetype: 'Reflection', color: '#C0C0C0' },
  { label: 'Bridge', archetype: 'Transition', color: '#D4A574' },
  { label: 'Compass', archetype: 'Guidance', color: '#6699CC' },
  { label: 'Garden', archetype: 'Cultivation', color: '#7FB069' },
  { label: 'Fire', archetype: 'Transformation', color: '#E63946' },
  { label: 'Ocean', archetype: 'Depth', color: '#1D3557' },
  { label: 'Lotus', archetype: 'Emergence', color: '#F4A8D8' },
  { label: 'Tree', archetype: 'Rootedness', color: '#6B4423' },
];

export function generateSymbols(count: number = 12, seed: number = 42): Symbol[] {
  const rng = new SeededRandom(seed);
  const symbols: Symbol[] = [];

  for (let i = 0; i < count; i++) {
    const symbolData = ARCHETYPAL_SYMBOLS[i % ARCHETYPAL_SYMBOLS.length];
    const frequency = rng.nextInt(2, 8);
    const threadCount = rng.nextInt(1, 5);
    const threadIds = Array.from({ length: threadCount }, () => rng.nextInt(1, 12));

    symbols.push({
      id: `symbol-${i + 1}`,
      label: symbolData.label,
      archetype: symbolData.archetype,
      frequency,
      threadIds,
      color: symbolData.color,
    });
  }

  return symbols;
}

// ============================================================================
// Synthesis Generators (✨ Aether Layer)
// ============================================================================

const MOTIF_PATTERNS = [
  'Fire → Water → Earth',
  'Air → Aether → Water',
  'Shadow → Integration → Light',
  'Contraction → Release → Expansion',
  'Question → Resistance → Insight',
  'Grief → Acceptance → Gratitude',
];

const CYCLE_NAMES = [
  'Weekly Renewal',
  'Monthly Integration',
  'Creative Pulse',
  'Emotional Tide',
  'Seasonal Shift',
  'Spiral Deepening',
];

const GROWTH_ARCS = [
  'Across {count} threads, a rhythm of renewal emerges—each cycle moving through resistance, release, and integration with increasing trust.',
  'The pattern reveals a spiral: returning to familiar themes but from a place of deeper wisdom and self-compassion.',
  'A consistent arc appears: initial clarity (Fire), emotional processing (Water), embodied integration (Earth), reflective insight (Air).',
  'The threads weave together to show a growing capacity to hold paradox without rushing to resolution.',
  'Collectively, these narratives trace a journey from seeking external validation to trusting internal guidance.',
  'The synthesis reveals a consistent rhythm: two weeks of active exploration followed by one week of contemplative integration.',
];

export function generateMotifs(count: number = 3, seed: number = 42): Motif[] {
  const rng = new SeededRandom(seed);
  const motifs: Motif[] = [];

  for (let i = 0; i < count; i++) {
    motifs.push({
      id: `motif-${i + 1}`,
      pattern: MOTIF_PATTERNS[i % MOTIF_PATTERNS.length],
      frequency: rng.nextInt(3, 8),
      significance: 0.75 + rng.next() * 0.2, // 0.75-0.95
      description: `This pattern appears when navigating transitions, suggesting a natural rhythm of ${MOTIF_PATTERNS[i % MOTIF_PATTERNS.length].toLowerCase()}.`,
    });
  }

  return motifs;
}

export function generateCycles(count: number = 2, seed: number = 42): Cycle[] {
  const rng = new SeededRandom(seed);
  const cycles: Cycle[] = [];

  for (let i = 0; i < count; i++) {
    cycles.push({
      id: `cycle-${i + 1}`,
      name: CYCLE_NAMES[i % CYCLE_NAMES.length],
      period: rng.choice([7, 14, 21, 28, 30]), // days
      amplitude: 0.6 + rng.next() * 0.35, // 0.6-0.95
      phase: rng.next(), // 0-1
      description: `A recurring ${CYCLE_NAMES[i % CYCLE_NAMES.length].toLowerCase()} pattern observed across multiple threads.`,
    });
  }

  return cycles;
}

export function generateSynthesisReport(threadIds: number[], seed: number = 42): SynthesisReport {
  const rng = new SeededRandom(seed + threadIds.length);
  const motifs = generateMotifs(3, seed);
  const cycles = generateCycles(2, seed + 100);
  const growthArc = GROWTH_ARCS[threadIds.length % GROWTH_ARCS.length].replace('{count}', String(threadIds.length));
  const coherenceTrend = 0.05 + rng.next() * 0.1; // +0.05 to +0.15

  return {
    motifs,
    cycles,
    growthArc,
    coherenceTrend,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Collective Coherence Generators (✨ Aether Layer)
// ============================================================================

export function generateCollectiveCoherence(seed: number = 42): CollectiveCoherence {
  const rng = new SeededRandom(seed + Date.now() % 1000);
  const groupCoherence = 0.65 + rng.next() * 0.3; // 0.65-0.95
  const participantCount = rng.nextInt(8, 24);

  // Determine trend based on time-based fluctuation
  const trendValue = rng.next();
  const trend = trendValue > 0.6 ? 'rising' : trendValue > 0.3 ? 'stable' : 'declining';

  return {
    groupCoherence,
    participantCount,
    trend,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Thread Detail Generator (Phase 4)
// ============================================================================

import type { ThreadDetail } from '../hooks/useThreadDetail';

const NARRATIVE_TEXTS = [
  'This week has been about learning to hold paradox—the simultaneous truth of wanting to grow and needing to rest. I\'ve noticed myself rushing through moments of stillness, as if they\'re obstacles rather than essential parts of the process. But when I allow myself to truly pause, there\'s a quality of spaciousness that emerges. It\'s not empty space; it\'s alive with possibility.',
  'A pattern is becoming clear: every time I approach a creative threshold, I find myself reorganizing my workspace, creating elaborate plans, doing everything except the actual creative work. It\'s a sophisticated form of resistance. But what if this preparation ritual is actually part of the creative process? What if it\'s my way of building the container strong enough to hold what wants to emerge?',
  'The conversation with my mother last week opened something unexpected. For the first time, I could hear her fear beneath her criticism. It didn\'t make the words hurt less, but it added dimension—suddenly she wasn\'t just the critical voice, she was also the frightened one trying to protect me in the only way she knows how. This shift in perspective feels significant.',
  'Dreams have been vivid lately. The recurring image of the bridge—sometimes I\'m crossing it, sometimes I\'m building it, sometimes I\'m just sitting on it watching the water below. Each variation feels like it\'s trying to tell me something about where I am in this transition. The bridge isn\'t a problem to solve; it\'s a liminal space to inhabit.',
  'Today I realized that my perfectionism isn\'t about high standards—it\'s about control. If I can make everything perfect, I can prevent hurt, disappointment, rejection. But perfection is a prison. The question isn\'t "how do I do this perfectly?" The question is "what becomes possible when I allow myself to be human?"',
  'There\'s a grief that\'s been living in my chest for months, maybe years. It doesn\'t have a clear object or story—it\'s more like a background hum. This week, instead of trying to understand it or make it go away, I just sat with it. Made tea. Put my hand on my heart. Said "I\'m here." And something softened.',
];

const REFLECTION_TEXTS = [
  'What strikes me most is the shift from "fixing" myself to "understanding" myself. It\'s subtle but profound. When I approach with curiosity instead of judgment, everything changes. The parts of me I\'ve been at war with become allies. The resistance becomes wisdom.',
  'I\'m learning that integration doesn\'t mean resolution. It means expanding my capacity to hold complexity. To be both/and instead of either/or. To trust that I don\'t have to have it all figured out to take the next step.',
  'The phrase that keeps coming back: "What if this is exactly where I\'m supposed to be?" Not as spiritual bypassing, but as a genuine inquiry. What if my struggle isn\'t a sign that I\'m off track, but evidence that I\'m right in the middle of meaningful transformation?',
  'There\'s a difference between forcing growth and creating conditions for growth. I\'ve been so focused on the former that I\'ve missed the latter. Maybe the work isn\'t to push myself harder, but to tend the soil, water the seeds, and trust the seasons.',
  'I\'m noticing how much energy I spend managing others\' perceptions of me. What would it feel like to direct that energy toward knowing myself more deeply? To be so rooted in my own truth that external validation becomes less necessary?',
  'The voice of my inner critic is starting to sound more desperate than authoritative. Like it knows its grip is loosening. This feels both liberating and terrifying. Who am I without that familiar voice of doubt? What becomes possible in the spaciousness it leaves behind?',
];

export function generateThreadDetail(threadId: number, seed: number = 42): ThreadDetail | null {
  const baseThread = getThreadById(threadId, seed);
  if (!baseThread) return null;

  const rng = new SeededRandom(seed + threadId);

  // Generate narrative and reflection
  const narrative = NARRATIVE_TEXTS[threadId % NARRATIVE_TEXTS.length];
  const reflection = REFLECTION_TEXTS[threadId % REFLECTION_TEXTS.length];

  // Generate motifs for this thread
  const motifCount = rng.nextInt(2, 4);
  const motifs = generateMotifs(motifCount, seed + threadId);

  // Generate related insights
  const insightCount = rng.nextInt(2, 5);
  const allInsights = generateInsights(15, seed);
  const relatedInsights = allInsights.slice(0, insightCount);

  // Generate related thread IDs
  const relatedCount = rng.nextInt(1, 3);
  const relatedThreadIds: number[] = [];
  for (let i = 0; i < relatedCount; i++) {
    const relatedId = rng.nextInt(1, 12);
    if (relatedId !== threadId && !relatedThreadIds.includes(relatedId)) {
      relatedThreadIds.push(relatedId);
    }
  }

  // Generate biofield data (50% chance of having it)
  const hasBiofieldData = rng.next() > 0.5;
  const biofieldData = hasBiofieldData
    ? {
        hrvCoherence: 0.6 + rng.next() * 0.35,
        voiceAffect: 0.5 + rng.next() * 0.4,
        breathRate: 12 + rng.nextInt(-3, 6), // 9-18 breaths/min
      }
    : undefined;

  return {
    ...baseThread,
    narrative,
    reflection,
    motifs,
    relatedInsights,
    relatedThreadIds,
    biofieldData,
  };
}

// ============================================================================
// Utility: Get Thread by ID
// ============================================================================

export function getThreadById(id: number, seed: number = 42): Thread | null {
  const threads = generateThreads(12, seed);
  return threads.find(t => t.id === id) || null;
}

// ============================================================================
// Exports
// ============================================================================

export const mockData = {
  threads: generateThreads,
  threadDetail: generateThreadDetail,
  insights: generateInsights,
  symbols: generateSymbols,
  motifs: generateMotifs,
  cycles: generateCycles,
  synthesis: generateSynthesisReport,
  collective: generateCollectiveCoherence,
  getThreadById,
};
