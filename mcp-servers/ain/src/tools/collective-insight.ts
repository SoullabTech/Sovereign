/**
 * AIN Collective Insight Tool
 *
 * Provides collective wisdom insights on topics.
 * Draws from archetypal patterns and collective consciousness field.
 */

export interface CollectiveInsightInput {
  topic: string;
  depth?: 'surface' | 'moderate' | 'deep';
}

export interface CollectiveInsightOutput {
  insight: string;
  archetypalPattern: string;
  collectiveResonance: number;
  timingGuidance: string;
  relatedThemes: string[];
  depth: string;
}

// Archetypal patterns for insight generation
const ARCHETYPAL_PATTERNS: Record<string, { pattern: string; themes: string[] }> = {
  transformation: {
    pattern: 'The Death-Rebirth Cycle',
    themes: ['endings', 'beginnings', 'letting go', 'emergence', 'phoenix'],
  },
  shadow: {
    pattern: 'The Shadow Integration',
    themes: ['darkness', 'hidden', 'denied', 'unconscious', 'projection'],
  },
  hero: {
    pattern: 'The Hero Journey',
    themes: ['challenge', 'growth', 'courage', 'adventure', 'quest'],
  },
  anima: {
    pattern: 'The Anima/Animus Dance',
    themes: ['feminine', 'masculine', 'balance', 'inner partner', 'contrasexual'],
  },
  self: {
    pattern: 'The Self Mandala',
    themes: ['wholeness', 'integration', 'center', 'totality', 'individuation'],
  },
  trickster: {
    pattern: 'The Trickster Wisdom',
    themes: ['paradox', 'humor', 'boundary', 'change', 'disruption'],
  },
  mother: {
    pattern: 'The Great Mother',
    themes: ['nurturing', 'creation', 'protection', 'nature', 'birth'],
  },
  father: {
    pattern: 'The Wise King',
    themes: ['order', 'structure', 'authority', 'guidance', 'law'],
  },
  child: {
    pattern: 'The Divine Child',
    themes: ['innocence', 'potential', 'wonder', 'play', 'beginning'],
  },
  sage: {
    pattern: 'The Wise Elder',
    themes: ['wisdom', 'knowledge', 'teaching', 'mentor', 'guidance'],
  },
};

// Timing patterns based on collective field
const TIMING_PATTERNS = [
  'The field suggests receptivity for this inquiry now.',
  'Collective energy supports contemplation of this theme.',
  'There is resonance in the field for exploring this territory.',
  'The timing feels aligned for this exploration.',
  'The collective is processing similar questions.',
];

function detectArchetype(topic: string): { pattern: string; themes: string[] } {
  const lowerTopic = topic.toLowerCase();

  for (const [key, archetype] of Object.entries(ARCHETYPAL_PATTERNS)) {
    // Check if topic matches archetype key or any theme
    if (
      lowerTopic.includes(key) ||
      archetype.themes.some((theme) => lowerTopic.includes(theme))
    ) {
      return archetype;
    }
  }

  // Default to self/wholeness archetype
  return ARCHETYPAL_PATTERNS.self;
}

function generateInsight(
  topic: string,
  archetype: { pattern: string; themes: string[] },
  depth: string
): string {
  const depthPrefixes = {
    surface: 'At first glance',
    moderate: 'Looking deeper',
    deep: 'At the deepest level',
  };

  const prefix = depthPrefixes[depth as keyof typeof depthPrefixes] || depthPrefixes.moderate;

  // Generate insight based on archetype
  const insights: Record<string, string> = {
    'The Death-Rebirth Cycle': `${prefix}, what seeks transformation in you is not broken—it is completing its cycle. The old form dissolves so new life can emerge.`,
    'The Shadow Integration': `${prefix}, what you resist contains hidden gold. The shadow asks not to be defeated but to be met, witnessed, and integrated.`,
    'The Hero Journey': `${prefix}, every challenge is an invitation to discover capacities you didn't know you possessed. The journey transforms the traveler.`,
    'The Anima/Animus Dance': `${prefix}, the inner partner seeks recognition. Balancing these energies creates wholeness beyond either pole.`,
    'The Self Mandala': `${prefix}, the center holds all opposites in creative tension. You are not becoming something new—you are remembering what you've always been.`,
    'The Trickster Wisdom': `${prefix}, sometimes the boundary must be crossed to reveal its true nature. What seems like chaos may be reorganization at a higher level.`,
    'The Great Mother': `${prefix}, there is a nurturing force that wants your growth. Trust the process of gestation—not all growth is visible.`,
    'The Wise King': `${prefix}, structure serves freedom when it arises from wisdom rather than fear. Healthy order creates the container for life to flourish.`,
    'The Divine Child': `${prefix}, possibility lives in the present moment. The beginner's mind sees what the expert has learned to overlook.`,
    'The Wise Elder': `${prefix}, wisdom emerges from experience fully digested. What you've lived through has prepared you to see.`,
  };

  return insights[archetype.pattern] || `${prefix}, ${topic} invites deeper contemplation.`;
}

function calculateResonance(topic: string, depth: string): number {
  // Simulate collective resonance calculation
  // In production, would draw from actual field metrics
  const baseResonance = 0.5 + Math.random() * 0.3;

  const depthMultipliers: Record<string, number> = {
    surface: 0.9,
    moderate: 1.0,
    deep: 1.1,
  };

  const multiplier = depthMultipliers[depth] || 1.0;
  return Math.min(Math.round(baseResonance * multiplier * 100) / 100, 1.0);
}

function getTimingGuidance(): string {
  return TIMING_PATTERNS[Math.floor(Math.random() * TIMING_PATTERNS.length)];
}

function findRelatedThemes(
  topic: string,
  archetype: { pattern: string; themes: string[] }
): string[] {
  const related = new Set<string>();

  // Add archetype themes
  archetype.themes.forEach((t) => related.add(t));

  // Find related archetypes
  for (const [key, other] of Object.entries(ARCHETYPAL_PATTERNS)) {
    if (other.pattern !== archetype.pattern) {
      // Check for theme overlap
      const overlap = other.themes.filter((t) =>
        archetype.themes.some((at) => t.includes(at) || at.includes(t))
      );
      if (overlap.length > 0) {
        related.add(key);
      }
    }
  }

  return Array.from(related).slice(0, 6);
}

export async function handleAINInsight(
  args: Record<string, unknown>
): Promise<CollectiveInsightOutput> {
  const input = args as unknown as CollectiveInsightInput;
  const { topic, depth = 'moderate' } = input;

  if (!topic || topic.trim().length === 0) {
    return {
      insight: 'A topic is needed to offer insight.',
      archetypalPattern: 'Unknown',
      collectiveResonance: 0,
      timingGuidance: 'Please provide a topic for exploration.',
      relatedThemes: [],
      depth,
    };
  }

  // Detect archetypal pattern
  const archetype = detectArchetype(topic);

  // Generate insight
  const insight = generateInsight(topic, archetype, depth);

  // Calculate collective resonance
  const collectiveResonance = calculateResonance(topic, depth);

  // Get timing guidance
  const timingGuidance = getTimingGuidance();

  // Find related themes
  const relatedThemes = findRelatedThemes(topic, archetype);

  return {
    insight,
    archetypalPattern: archetype.pattern,
    collectiveResonance,
    timingGuidance,
    relatedThemes,
    depth,
  };
}
