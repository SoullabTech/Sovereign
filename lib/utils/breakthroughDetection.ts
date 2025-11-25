export interface BreakthroughAnalysis {
  isBreakthrough: boolean;
  depth: number;
  markers: string[];
}

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

export function detectBreakthrough(text: string): BreakthroughAnalysis {
  if (!text) {
    return { isBreakthrough: false, depth: 0, markers: [] };
  }

  const lowerText = text.toLowerCase();
  const foundMarkers: string[] = [];
  let markerCount = 0;

  Object.entries(SACRED_MARKERS).forEach(([category, keywords]) => {
    const hasMarker = keywords.some(keyword => lowerText.includes(keyword));
    if (hasMarker) {
      foundMarkers.push(category);
      markerCount++;
    }
  });

  const emotionalIntensityWords = [
    'profound', 'deep', 'powerful', 'transformative', 'life-changing',
    'sacred', 'holy', 'divine', 'spiritual', 'awakening'
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

  const wordCount = text.split(/\s+/).length;
  const hasDepth = wordCount > 15;

  let depth = 0;
  if (markerCount > 0) depth += 0.4;
  if (markerCount > 1) depth += 0.2;
  if (hasEmotionalIntensity) depth += 0.2;
  if (hasDeepReflection) depth += 0.1;
  if (hasDepth) depth += 0.1;

  depth = Math.min(depth, 1.0);

  const isBreakthrough = depth > 0.85 && markerCount > 0;

  return {
    isBreakthrough,
    depth,
    markers: foundMarkers
  };
}