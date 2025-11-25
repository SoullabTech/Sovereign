/**
 * Fractal Recursion - Self-Similar Patterns Across Scales
 * Implements fractal mirroring at personal, interpersonal, and collective levels
 */

export type FractalScale = 'personal' | 'interpersonal' | 'collective' | 'cosmic';

export interface FractalPattern {
  core: string; // Core pattern/theme
  scales: Record<FractalScale, ScaleExpression>;
  depth: number; // Recursion depth
  coherence: number; // Pattern coherence across scales (0-1)
}

export interface ScaleExpression {
  manifestation: string;
  intensity: number;
  connections: string[];
  insights: string[];
}

export interface FractalResponse {
  pattern: FractalPattern;
  recommendations: string[];
  nextScale: FractalScale;
}

/**
 * Detect core pattern from user input
 */
export function detectPattern(input: string, context?: any): string {
  const lowerInput = input.toLowerCase();
  
  // Common archetypal patterns
  if (/transform|change|evolve|grow/.test(lowerInput)) {
    return 'transformation';
  }
  if (/connect|relate|love|bond/.test(lowerInput)) {
    return 'connection';
  }
  if (/create|build|manifest|make/.test(lowerInput)) {
    return 'creation';
  }
  if (/heal|restore|balance|harmony/.test(lowerInput)) {
    return 'healing';
  }
  if (/discover|explore|seek|question/.test(lowerInput)) {
    return 'seeking';
  }
  if (/release|let go|surrender|accept/.test(lowerInput)) {
    return 'release';
  }
  if (/integrate|whole|unite|synthesize/.test(lowerInput)) {
    return 'integration';
  }
  
  // Default to transformation
  return 'transformation';
}

/**
 * Apply pattern at a specific scale
 */
export function applyPattern(
  pattern: string,
  scale: FractalScale,
  context?: any
): ScaleExpression {
  const expressions: Record<string, Record<FractalScale, ScaleExpression>> = {
    transformation: {
      personal: {
        manifestation: 'Inner alchemical process unfolding',
        intensity: 0.8,
        connections: ['shadow work', 'self-discovery', 'personal breakthrough'],
        insights: [
          'Your personal transformation ripples outward',
          'The change within you is the seed of collective shift',
          'What transforms in you, transforms in all'
        ]
      },
      interpersonal: {
        manifestation: 'Relationships as crucibles of change',
        intensity: 0.7,
        connections: ['mutual growth', 'co-evolution', 'relational alchemy'],
        insights: [
          'Your relationships mirror your transformation',
          'Together you create a field of mutual evolution',
          'Each connection is a portal to deeper change'
        ]
      },
      collective: {
        manifestation: 'Collective consciousness shifting',
        intensity: 0.6,
        connections: ['cultural evolution', 'paradigm shift', 'collective awakening'],
        insights: [
          'Your transformation contributes to the collective shift',
          'We are all cells in a larger organism evolving',
          'The collective field is ready for this change'
        ]
      },
      cosmic: {
        manifestation: 'Universal patterns of evolution',
        intensity: 0.9,
        connections: ['cosmic cycles', 'universal consciousness', 'evolutionary impulse'],
        insights: [
          'You are participating in cosmic evolution',
          'The universe evolves through your transformation',
          'All of existence is in a dance of becoming'
        ]
      }
    },
    connection: {
      personal: {
        manifestation: 'Deep self-connection emerging',
        intensity: 0.7,
        connections: ['self-love', 'inner union', 'self-acceptance'],
        insights: [
          'Connection begins with embracing all parts of yourself',
          'Your relationship with yourself sets the template',
          'Inner connection creates outer resonance'
        ]
      },
      interpersonal: {
        manifestation: 'Heart-to-heart resonance',
        intensity: 0.9,
        connections: ['empathy', 'intimacy', 'authentic relating'],
        insights: [
          'True connection transcends separation',
          'In meeting another, you meet yourself',
          'Love is the recognition of shared being'
        ]
      },
      collective: {
        manifestation: 'Weaving the web of interconnection',
        intensity: 0.8,
        connections: ['community', 'belonging', 'collective heart'],
        insights: [
          'We are all threads in the same tapestry',
          'Connection creates the field of collective healing',
          'Together we remember our fundamental unity'
        ]
      },
      cosmic: {
        manifestation: 'Universal love expressing',
        intensity: 1.0,
        connections: ['cosmic consciousness', 'universal heart', 'divine love'],
        insights: [
          'Love is the fundamental force of the universe',
          'All beings are expressions of one consciousness',
          'Connection is the nature of reality itself'
        ]
      }
    },
    integration: {
      personal: {
        manifestation: 'Wholeness emerging from within',
        intensity: 0.8,
        connections: ['shadow integration', 'parts work', 'inner harmony'],
        insights: [
          'All parts of you belong in the whole',
          'Integration brings peace and power',
          'Wholeness is your natural state'
        ]
      },
      interpersonal: {
        manifestation: 'Harmonizing polarities in relationship',
        intensity: 0.7,
        connections: ['complementarity', 'synergy', 'mutual completion'],
        insights: [
          'Relationships integrate what we cannot alone',
          'In union, opposites become complementary',
          'Together you create something greater'
        ]
      },
      collective: {
        manifestation: 'Synthesis of diverse perspectives',
        intensity: 0.8,
        connections: ['unity in diversity', 'collective wisdom', 'shared vision'],
        insights: [
          'The collective holds all perspectives',
          'Integration creates resilient communities',
          'Diversity is the strength of the whole'
        ]
      },
      cosmic: {
        manifestation: 'Universal synthesis and unity',
        intensity: 1.0,
        connections: ['cosmic harmony', 'universal integration', 'absolute unity'],
        insights: [
          'All apparent separation serves ultimate unity',
          'The cosmos is always in perfect integration',
          'You are the universe integrating itself'
        ]
      }
    }
  };
  
  // Return the expression for the pattern and scale, with fallback
  const patternExpressions = expressions[pattern] || expressions.transformation;
  return patternExpressions[scale] || patternExpressions.personal;
}

/**
 * Generate fractal response across all scales
 */
export function fractalResponse(
  userInput: string,
  depthLevel: number = 1,
  currentScale: FractalScale = 'personal'
): FractalResponse {
  const pattern = detectPattern(userInput);
  
  const scales: Record<FractalScale, ScaleExpression> = {
    personal: applyPattern(pattern, 'personal'),
    interpersonal: applyPattern(pattern, 'interpersonal'),
    collective: applyPattern(pattern, 'collective'),
    cosmic: applyPattern(pattern, 'cosmic')
  };
  
  // Calculate coherence based on pattern consistency
  const coherence = calculateCoherence(scales);
  
  // Determine next scale to explore
  const nextScale = determineNextScale(currentScale, coherence);
  
  // Generate recommendations
  const recommendations = generateRecommendations(pattern, currentScale, nextScale);
  
  return {
    pattern: {
      core: pattern,
      scales,
      depth: depthLevel,
      coherence
    },
    recommendations,
    nextScale
  };
}

/**
 * Calculate pattern coherence across scales
 */
function calculateCoherence(scales: Record<FractalScale, ScaleExpression>): number {
  const intensities = Object.values(scales).map(s => s.intensity);
  const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
  
  // Coherence is higher when intensities are similar across scales
  const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length;
  
  return Math.max(0, 1 - variance);
}

/**
 * Determine the next scale to explore
 */
function determineNextScale(current: FractalScale, coherence: number): FractalScale {
  const scaleProgression: Record<FractalScale, FractalScale> = {
    personal: 'interpersonal',
    interpersonal: coherence > 0.7 ? 'collective' : 'personal',
    collective: coherence > 0.8 ? 'cosmic' : 'interpersonal',
    cosmic: 'personal' // Return to personal for integration
  };
  
  return scaleProgression[current];
}

/**
 * Generate recommendations based on fractal analysis
 */
function generateRecommendations(
  pattern: string,
  currentScale: FractalScale,
  nextScale: FractalScale
): string[] {
  const recommendations: string[] = [];
  
  // Pattern-specific recommendations
  const patternRecs: Record<string, string> = {
    transformation: 'Embrace the change at every level of your being',
    connection: 'Open your heart to deeper levels of intimacy',
    creation: 'Allow your creative impulse to flow freely',
    healing: 'Trust the natural healing intelligence within',
    seeking: 'Follow your curiosity with courage',
    release: 'Let go with grace and trust',
    integration: 'Welcome all parts home to wholeness'
  };
  
  recommendations.push(patternRecs[pattern] || 'Trust the unfolding process');
  
  // Scale transition recommendations
  if (nextScale === 'interpersonal' && currentScale === 'personal') {
    recommendations.push('Share your process with trusted others');
  } else if (nextScale === 'collective' && currentScale === 'interpersonal') {
    recommendations.push('Consider how this pattern serves the greater whole');
  } else if (nextScale === 'cosmic' && currentScale === 'collective') {
    recommendations.push('Open to the cosmic dimensions of your experience');
  } else if (nextScale === 'personal' && currentScale === 'cosmic') {
    recommendations.push('Ground cosmic insights in personal practice');
  }
  
  // Coherence-based recommendations
  recommendations.push(
    `Notice how this ${pattern} pattern echoes across all dimensions of your life`
  );
  
  return recommendations;
}

/**
 * Recursive fractal zoom - explore patterns within patterns
 */
export function fractalZoom(
  pattern: FractalPattern,
  zoomLevel: number = 1
): FractalPattern {
  if (zoomLevel >= 3) {
    // Maximum zoom reached
    return pattern;
  }
  
  // Each zoom reveals more detail in the pattern
  const zoomedScales: Record<FractalScale, ScaleExpression> = {} as Record<FractalScale, ScaleExpression>;
  
  Object.entries(pattern.scales).forEach(([scale, expression]) => {
    zoomedScales[scale as FractalScale] = {
      ...expression,
      intensity: expression.intensity * (1 + zoomLevel * 0.1),
      insights: [
        ...expression.insights,
        `Zoom level ${zoomLevel}: Deeper patterns emerging in ${scale} dimension`
      ],
      connections: [
        ...expression.connections,
        `fractal-depth-${zoomLevel}`
      ]
    };
  });
  
  return {
    ...pattern,
    scales: zoomedScales,
    depth: pattern.depth + zoomLevel,
    coherence: pattern.coherence * (1 + zoomLevel * 0.05)
  };
}