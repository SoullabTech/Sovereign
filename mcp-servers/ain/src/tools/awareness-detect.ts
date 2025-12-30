/**
 * AIN Awareness Detection Tool
 *
 * Detects consciousness/awareness level from text content.
 * Returns level classification and optional detailed markers.
 */

export interface AwarenessDetectInput {
  text: string;
  includeMarkers?: boolean;
}

export interface AwarenessMarker {
  category: string;
  pattern: string;
  location: number;
  weight: number;
}

export interface AwarenessDetectOutput {
  level: 'UNCONSCIOUS' | 'PARTIAL' | 'RELATIONAL' | 'INTEGRATED' | 'MASTER';
  confidence: number;
  indicators: string[];
  markers?: AwarenessMarker[];
  summary: string;
}

// Weighted pattern definitions for each awareness level
const AWARENESS_PATTERNS: Record<string, { patterns: RegExp[]; weight: number }> = {
  MASTER: {
    patterns: [
      /\b(non-dual|unity|wholeness|sacred|divine|transcend)\b/gi,
      /\b(witness|observer|awareness itself|pure consciousness)\b/gi,
      /\b(emptiness|fullness|presence|being)\b/gi,
      /\b(dissolution|boundary.?less|infinite)\b/gi,
    ],
    weight: 5,
  },
  INTEGRATED: {
    patterns: [
      /\b(both|integrate|synthesis|hold|paradox|nuance)\b/gi,
      /\b(i notice|i sense|i feel|i observe|deeper)\b/gi,
      /\b(complexity|layers|multiple perspectives)\b/gi,
      /\b(shadow and light|dark and light|embrace)\b/gi,
    ],
    weight: 4,
  },
  RELATIONAL: {
    patterns: [
      /\b(we|us|together|connection|relationship|between)\b/gi,
      /\b(impact|affect|others|community|collective)\b/gi,
      /\b(empathy|compassion|understanding others)\b/gi,
      /\b(how .+ affects|impact on|ripple)\b/gi,
    ],
    weight: 3,
  },
  PARTIAL: {
    patterns: [
      /\b(sometimes|maybe|might|could|perhaps|not sure)\b/gi,
      /\b(i think|i believe|in my experience)\b/gi,
      /\b(starting to see|beginning to|learning)\b/gi,
      /\b(one perspective|my view|from where i stand)\b/gi,
    ],
    weight: 2,
  },
  UNCONSCIOUS: {
    patterns: [
      /\b(always|never|everyone|nobody|should|must)\b/gi,
      /\b(they are|people are|the problem is)\b/gi,
      /\b(obviously|clearly|of course)\b/gi,
      /\b(that's just|it's simply|there's no way)\b/gi,
    ],
    weight: 1,
  },
};

// Level descriptions for summaries
const LEVEL_DESCRIPTIONS: Record<string, string> = {
  MASTER:
    'Text reflects non-dual awareness, witness consciousness, or transcendent perspective.',
  INTEGRATED:
    'Text shows capacity to hold complexity, integrate paradox, and observe inner experience.',
  RELATIONAL:
    'Text demonstrates awareness of interconnection, impact on others, and collective dimension.',
  PARTIAL:
    'Text shows emerging self-awareness with acknowledgment of limited perspective.',
  UNCONSCIOUS:
    'Text reflects automatic patterns, projections, or unconscious assumptions.',
};

function findMarkers(text: string): AwarenessMarker[] {
  const markers: AwarenessMarker[] = [];

  for (const [level, config] of Object.entries(AWARENESS_PATTERNS)) {
    for (const pattern of config.patterns) {
      let match: RegExpExecArray | null;
      const patternCopy = new RegExp(pattern.source, pattern.flags);

      while ((match = patternCopy.exec(text)) !== null) {
        markers.push({
          category: level,
          pattern: match[0],
          location: match.index,
          weight: config.weight,
        });
      }
    }
  }

  return markers.sort((a, b) => a.location - b.location);
}

function calculateLevelScores(markers: AwarenessMarker[]): Record<string, number> {
  const scores: Record<string, number> = {
    MASTER: 0,
    INTEGRATED: 0,
    RELATIONAL: 0,
    PARTIAL: 0,
    UNCONSCIOUS: 0,
  };

  for (const marker of markers) {
    scores[marker.category] += marker.weight;
  }

  return scores;
}

function extractIndicators(markers: AwarenessMarker[]): string[] {
  const indicators: string[] = [];
  const seen = new Set<string>();

  for (const marker of markers) {
    const key = `${marker.category}:${marker.pattern.toLowerCase()}`;
    if (!seen.has(key)) {
      indicators.push(`${marker.category}: "${marker.pattern}"`);
      seen.add(key);
    }
  }

  return indicators.slice(0, 10); // Top 10 indicators
}

export async function handleAwarenessDetect(
  args: Record<string, unknown>
): Promise<AwarenessDetectOutput> {
  const input = args as unknown as AwarenessDetectInput;
  const { text, includeMarkers = false } = input;

  if (!text || text.trim().length === 0) {
    return {
      level: 'PARTIAL',
      confidence: 0,
      indicators: [],
      summary: 'No text provided for analysis.',
    };
  }

  // Find all markers
  const markers = findMarkers(text);

  // Calculate scores per level
  const scores = calculateLevelScores(markers);

  // Determine winning level
  let maxScore = 0;
  let winningLevel: AwarenessDetectOutput['level'] = 'PARTIAL';

  for (const [level, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningLevel = level as AwarenessDetectOutput['level'];
    }
  }

  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(maxScore / totalScore, 1) : 0;

  // Extract human-readable indicators
  const indicators = extractIndicators(markers);

  const result: AwarenessDetectOutput = {
    level: winningLevel,
    confidence: Math.round(confidence * 100) / 100,
    indicators,
    summary: LEVEL_DESCRIPTIONS[winningLevel],
  };

  if (includeMarkers) {
    result.markers = markers;
  }

  return result;
}
