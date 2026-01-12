export interface BreakthroughAnalysis {
  isBreakthrough: boolean;
  depth: number;
  markers: string[];
  spiralLevel?: string;
}

// Original sacred markers (depth-oriented)
const SACRED_MARKERS = {
  tears: ['cry', 'tears', 'weep', 'crying', 'sobbing'],
  breakthrough: ['realize', 'see now', 'understand', 'ah', 'oh', 'finally see', 'get it now'],
  surrender: ['let go', 'release', 'surrender', 'allow', 'acceptance', 'accepting'],
  opening: ['open', 'expand', 'infinite', 'vast', 'spacious', 'boundless'],
  truth: ['truth', 'authentic', 'real self', 'who i am', 'true self', 'honest'],
  love: ['love myself', 'self-compassion', 'forgiveness', 'forgiving myself', 'compassion'],
  shadow: ['embrace my shadow', 'accept my darkness', 'shadow', 'dark side'],
  integration: ['whole', 'complete', 'integrated', 'wholeness', 'unity']
};

// Spiral-level specific breakthrough markers
// Breakthroughs are relative to where someone is in their awareness
const SPIRAL_MARKERS: Record<string, { markers: string[]; level: string }> = {
  // Beige/Purple: Safety, belonging, survival
  safety: {
    markers: ['feel safe', 'can trust', 'belong', 'protected', 'not alone', 'home', 'supported'],
    level: 'beige-purple'
  },
  // Red: Power, autonomy, self-assertion
  power: {
    markers: ['stand up', 'my power', 'assert', 'boundaries', 'my voice', 'stronger', 'fight for'],
    level: 'red'
  },
  // Blue: Order, meaning, purpose, faith
  purpose: {
    markers: ['my purpose', 'meaning', 'faith', 'believe', 'right path', 'devotion', 'commitment', 'calling'],
    level: 'blue'
  },
  // Orange: Achievement, success, growth, mastery
  achievement: {
    markers: ['achieved', 'success', 'growth', 'progress', 'improved', 'mastered', 'goal', 'accomplished'],
    level: 'orange'
  },
  // Green: Connection, empathy, community, heart
  connection: {
    markers: ['connected', 'empathy', 'community', 'heart', 'together', 'shared', 'vulnerable', 'authentic'],
    level: 'green'
  },
  // Yellow: Integration, systems, complexity, patterns
  systems: {
    markers: ['patterns', 'systems', 'integrate', 'complexity', 'both/and', 'perspectives', 'meta', 'interconnected'],
    level: 'yellow'
  },
  // Turquoise: Unity, cosmic, transcendent, oneness
  unity: {
    markers: ['oneness', 'cosmic', 'transcend', 'all is', 'infinite', 'eternal', 'consciousness', 'divine'],
    level: 'turquoise'
  }
};

export function detectBreakthrough(text: string): BreakthroughAnalysis {
  if (!text) {
    return { isBreakthrough: false, depth: 0, markers: [] };
  }

  const lowerText = text.toLowerCase();
  const foundMarkers: string[] = [];
  let markerCount = 0;
  let detectedSpiralLevel: string | undefined;

  // Check sacred markers (depth-oriented breakthroughs)
  Object.entries(SACRED_MARKERS).forEach(([category, keywords]) => {
    const hasMarker = keywords.some(keyword => lowerText.includes(keyword));
    if (hasMarker) {
      foundMarkers.push(category);
      markerCount++;
    }
  });

  // Check spiral-level markers (level-relative breakthroughs)
  // A breakthrough at any level is valid and meaningful
  Object.entries(SPIRAL_MARKERS).forEach(([category, { markers, level }]) => {
    const hasMarker = markers.some(keyword => lowerText.includes(keyword));
    if (hasMarker) {
      foundMarkers.push(`spiral:${category}`);
      markerCount++;
      // Track the highest spiral level detected
      if (!detectedSpiralLevel) {
        detectedSpiralLevel = level;
      }
    }
  });

  const emotionalIntensityWords = [
    'profound', 'deep', 'powerful', 'transformative', 'life-changing',
    'sacred', 'holy', 'divine', 'spiritual', 'awakening',
    // Added more accessible emotional indicators
    'grateful', 'thankful', 'moved', 'touched', 'shifted', 'changed'
  ];

  const hasEmotionalIntensity = emotionalIntensityWords.some(word =>
    lowerText.includes(word)
  );

  const questionPatterns = [
    /why (did|do|have) i/,
    /what if i/,
    /how can i/,
    /i wonder/,
    /maybe i/
  ];

  const hasDeepReflection = questionPatterns.some(pattern =>
    pattern.test(lowerText)
  );

  // First-person realization patterns (strong breakthrough indicators)
  const realizationPatterns = [
    /i (just )?(realized|understand|see|get)/,
    /it('s| is) (clear|clicking|making sense)/,
    /something (shifted|changed|opened)/,
    /i feel (different|lighter|free)/
  ];

  const hasRealization = realizationPatterns.some(pattern =>
    pattern.test(lowerText)
  );

  const wordCount = text.split(/\s+/).length;
  const hasDepth = wordCount > 15;

  // Recalibrated depth scoring (more generous, spiral-aware)
  let depth = 0;
  if (markerCount > 0) depth += 0.3;  // Any marker is meaningful
  if (markerCount > 1) depth += 0.2;  // Multiple markers = stronger signal
  if (markerCount > 2) depth += 0.1;  // Three+ = very strong
  if (hasEmotionalIntensity) depth += 0.15;
  if (hasDeepReflection) depth += 0.1;
  if (hasRealization) depth += 0.2;   // Strong signal
  if (hasDepth) depth += 0.1;

  depth = Math.min(depth, 1.0);

  // Lowered threshold: 0.5 instead of 0.85
  // A breakthrough is meaningful at any depth if markers are present
  const isBreakthrough = depth >= 0.5 && markerCount > 0;

  return {
    isBreakthrough,
    depth,
    markers: foundMarkers,
    spiralLevel: detectedSpiralLevel
  };
}