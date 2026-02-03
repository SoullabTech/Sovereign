/**
 * AIN Evolution Guidance Tool
 *
 * Provides personalized evolution guidance for users.
 * Tracks development across Spiralogic facets and consciousness dimensions.
 */

export interface EvolutionGuidanceInput {
  userId: string;
  focusArea?: string;
}

export interface DevelopmentalEdge {
  facet: string;
  currentLevel: number;
  growthOpportunity: string;
  practiceRecommendation: string;
}

export interface EvolutionGuidanceOutput {
  userId: string;
  overallPhase: string;
  phaseDescription: string;
  primaryFocus: string;
  developmentalEdges: DevelopmentalEdge[];
  nextSteps: string[];
  integrationPractice: string;
  estimatedPhaseProgress: number;
}

// Spiralogic facets (12-facet system)
const FACETS = [
  { code: 'FIRE-1', name: 'Initiation', element: 'fire' },
  { code: 'EARTH-1', name: 'Grounding', element: 'earth' },
  { code: 'AIR-1', name: 'Perspective', element: 'air' },
  { code: 'WATER-1', name: 'Emotion', element: 'water' },
  { code: 'FIRE-2', name: 'Passion', element: 'fire' },
  { code: 'EARTH-2', name: 'Manifestation', element: 'earth' },
  { code: 'AIR-2', name: 'Communication', element: 'air' },
  { code: 'WATER-2', name: 'Intuition', element: 'water' },
  { code: 'FIRE-3', name: 'Transformation', element: 'fire' },
  { code: 'EARTH-3', name: 'Mastery', element: 'earth' },
  { code: 'AIR-3', name: 'Wisdom', element: 'air' },
  { code: 'WATER-3', name: 'Unity', element: 'water' },
];

// Evolution phases
const PHASES = [
  {
    name: 'Awakening',
    range: [0, 0.25],
    description: 'Initial contact with deeper dimensions of self',
    focus: 'Self-awareness and pattern recognition',
  },
  {
    name: 'Purification',
    range: [0.25, 0.5],
    description: 'Clearing obstacles and integrating shadow material',
    focus: 'Shadow work and emotional processing',
  },
  {
    name: 'Integration',
    range: [0.5, 0.75],
    description: 'Synthesizing insights into embodied wisdom',
    focus: 'Embodiment and relational expression',
  },
  {
    name: 'Service',
    range: [0.75, 1.0],
    description: 'Offering gifts in service to the collective',
    focus: 'Contribution and transmission',
  },
];

// Growth opportunities per element
const ELEMENT_OPPORTUNITIES: Record<string, string[]> = {
  fire: [
    'Channel creative energy into sustained projects',
    'Transform reactive anger into assertive boundaries',
    'Cultivate inspired action without burnout',
  ],
  earth: [
    'Build sustainable structures for growth',
    'Ground spiritual insights in practical reality',
    'Develop patience with slow, organic change',
  ],
  air: [
    'Balance mental activity with embodied presence',
    'Communicate inner truth with clarity',
    'Integrate multiple perspectives without fragmentation',
  ],
  water: [
    'Allow emotional flow without drowning',
    'Trust intuitive guidance in decision-making',
    'Cultivate compassion while maintaining boundaries',
  ],
};

// Practice recommendations
const PRACTICES: Record<string, string[]> = {
  fire: ['Breath of Fire', 'Active meditation', 'Creative expression'],
  earth: ['Walking meditation', 'Body scanning', 'Structured journaling'],
  air: ['Inquiry practice', 'Breathwork', 'Perspective-taking exercises'],
  water: ['Emotional presence meditation', 'Dream work', 'Compassion practices'],
};

function simulateUserProfile(userId: string): {
  progress: number;
  facetLevels: Record<string, number>;
} {
  // In production, would fetch from database
  // Simulating based on userId hash for consistency
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const progress = (hash % 100) / 100;

  const facetLevels: Record<string, number> = {};
  FACETS.forEach((f, i) => {
    facetLevels[f.code] = ((hash + i * 13) % 100) / 100;
  });

  return { progress, facetLevels };
}

function determinePhase(progress: number): { name: string; description: string; focus: string } {
  for (const phase of PHASES) {
    if (progress >= phase.range[0] && progress < phase.range[1]) {
      return phase;
    }
  }
  return PHASES[PHASES.length - 1];
}

function findDevelopmentalEdges(
  facetLevels: Record<string, number>,
  focusArea?: string
): DevelopmentalEdge[] {
  const edges: DevelopmentalEdge[] = [];

  // Find lowest facets (growth opportunities)
  const sorted = Object.entries(facetLevels).sort((a, b) => a[1] - b[1]);

  for (const [code, level] of sorted.slice(0, 3)) {
    const facet = FACETS.find((f) => f.code === code);
    if (!facet) continue;

    const opportunities = ELEMENT_OPPORTUNITIES[facet.element];
    const practices = PRACTICES[facet.element];

    edges.push({
      facet: `${facet.name} (${code})`,
      currentLevel: Math.round(level * 100) / 100,
      growthOpportunity: opportunities[Math.floor(Math.random() * opportunities.length)],
      practiceRecommendation: practices[Math.floor(Math.random() * practices.length)],
    });
  }

  // If focus area specified, prioritize matching facets
  if (focusArea) {
    const lowerFocus = focusArea.toLowerCase();
    edges.sort((a, b) => {
      const aMatch = a.facet.toLowerCase().includes(lowerFocus) ? -1 : 0;
      const bMatch = b.facet.toLowerCase().includes(lowerFocus) ? -1 : 0;
      return aMatch - bMatch;
    });
  }

  return edges;
}

function generateNextSteps(phase: { focus: string }, edges: DevelopmentalEdge[]): string[] {
  const steps: string[] = [];

  // Phase-based step
  steps.push(`Continue ${phase.focus.toLowerCase()}`);

  // Edge-based steps
  if (edges.length > 0) {
    steps.push(`Practice: ${edges[0].practiceRecommendation}`);
    steps.push(`Explore: ${edges[0].growthOpportunity}`);
  }

  // Universal step
  steps.push('Return to your practice daily, even briefly');

  return steps;
}

function generateIntegrationPractice(edges: DevelopmentalEdge[]): string {
  if (edges.length === 0) {
    return 'Sit quietly for 10 minutes, observing what arises without agenda.';
  }

  const facet = FACETS.find((f) => edges[0].facet.includes(f.name));
  if (!facet) {
    return 'Sit quietly for 10 minutes, observing what arises without agenda.';
  }

  const practices: Record<string, string> = {
    fire: 'Light a candle and sit with the flame for 10 minutes, noticing your creative impulses.',
    earth: 'Walk barefoot on earth for 10 minutes, feeling your connection to ground.',
    air: 'Practice 10 minutes of conscious breathing, observing thoughts without attachment.',
    water: 'Sit near water or in a bath for 10 minutes, allowing emotions to flow.',
  };

  return practices[facet.element] || practices.earth;
}

export async function handleAINGuidance(
  args: Record<string, unknown>
): Promise<EvolutionGuidanceOutput> {
  const input = args as unknown as EvolutionGuidanceInput;
  const { userId, focusArea } = input;

  if (!userId) {
    return {
      userId: 'unknown',
      overallPhase: 'Unknown',
      phaseDescription: 'User ID required for personalized guidance.',
      primaryFocus: '',
      developmentalEdges: [],
      nextSteps: ['Provide a valid user ID'],
      integrationPractice: '',
      estimatedPhaseProgress: 0,
    };
  }

  // Get user profile (simulated)
  const profile = simulateUserProfile(userId);

  // Determine evolution phase
  const phase = determinePhase(profile.progress);

  // Find developmental edges
  const edges = findDevelopmentalEdges(profile.facetLevels, focusArea);

  // Generate next steps
  const nextSteps = generateNextSteps(phase, edges);

  // Generate integration practice
  const integrationPractice = generateIntegrationPractice(edges);

  // Calculate phase progress within current phase
  const currentPhaseData = PHASES.find((p) => p.name === phase.name);
  let phaseProgress = 0;
  if (currentPhaseData) {
    const range = currentPhaseData.range[1] - currentPhaseData.range[0];
    phaseProgress = (profile.progress - currentPhaseData.range[0]) / range;
  }

  return {
    userId,
    overallPhase: phase.name,
    phaseDescription: phase.description,
    primaryFocus: focusArea || phase.focus,
    developmentalEdges: edges,
    nextSteps,
    integrationPractice,
    estimatedPhaseProgress: Math.round(phaseProgress * 100) / 100,
  };
}
