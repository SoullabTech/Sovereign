/**
 * AIN Knowledge Gate Tool
 *
 * Processes queries through the consciousness-aware knowledge gate.
 * Returns responses with source mixing and awareness calibration.
 */

export interface AINQueryInput {
  message: string;
  context?: string;
  awarenessHint?: 'UNCONSCIOUS' | 'PARTIAL' | 'RELATIONAL' | 'INTEGRATED' | 'MASTER';
  userId?: string;
}

export interface AINQueryOutput {
  response: string;
  sourceMix: Record<string, number>;
  awarenessLevel: string;
  depthMarkers: string[];
  processingPath: 'FAST' | 'CORE' | 'DEEP';
}

// Awareness level detection patterns
const AWARENESS_PATTERNS = {
  MASTER: [
    /\b(non-dual|unity|wholeness|sacred|divine|transcend)\b/i,
    /\b(witness|observer|awareness itself|pure consciousness)\b/i,
  ],
  INTEGRATED: [
    /\b(both|integrate|synthesis|hold|paradox|nuance)\b/i,
    /\b(i notice|i sense|i feel|i observe|deeper)\b/i,
  ],
  RELATIONAL: [
    /\b(we|us|together|connection|relationship|between)\b/i,
    /\b(impact|affect|others|community|collective)\b/i,
  ],
  PARTIAL: [
    /\b(sometimes|maybe|might|could|perhaps|not sure)\b/i,
    /\b(i think|i believe|in my experience)\b/i,
  ],
  UNCONSCIOUS: [
    /\b(always|never|everyone|nobody|should|must)\b/i,
    /\b(they are|people are|the problem is)\b/i,
  ],
};

function detectAwarenessLevel(text: string): string {
  for (const [level, patterns] of Object.entries(AWARENESS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return level;
      }
    }
  }
  return 'PARTIAL'; // Default
}

function extractDepthMarkers(text: string): string[] {
  const markers: string[] = [];

  // Check for various depth indicators
  if (/\b(feel|sense|notice)\b/i.test(text)) {
    markers.push('somatic_awareness');
  }
  if (/\b(pattern|recurring|always|keep)\b/i.test(text)) {
    markers.push('pattern_recognition');
  }
  if (/\b(shadow|unconscious|hidden|beneath)\b/i.test(text)) {
    markers.push('shadow_inquiry');
  }
  if (/\b(meaning|purpose|why|significance)\b/i.test(text)) {
    markers.push('meaning_seeking');
  }
  if (/\b(change|transform|grow|evolve)\b/i.test(text)) {
    markers.push('growth_orientation');
  }

  return markers;
}

function determineProcessingPath(
  message: string,
  awarenessLevel: string,
  depthMarkers: string[]
): 'FAST' | 'CORE' | 'DEEP' {
  // Quick queries get FAST path
  if (message.length < 50 && depthMarkers.length === 0) {
    return 'FAST';
  }

  // High awareness or deep markers get DEEP path
  if (
    awarenessLevel === 'MASTER' ||
    awarenessLevel === 'INTEGRATED' ||
    depthMarkers.includes('shadow_inquiry')
  ) {
    return 'DEEP';
  }

  return 'CORE';
}

function calculateSourceMix(
  awarenessLevel: string,
  depthMarkers: string[],
  processingPath: string
): Record<string, number> {
  const sourceMix: Record<string, number> = {
    local: 0.4,      // Ollama/local model
    collective: 0.3, // Collective wisdom
    personal: 0.2,   // User's patterns
    emergent: 0.1,   // Novel emergence
  };

  // Adjust based on awareness level
  if (awarenessLevel === 'MASTER' || awarenessLevel === 'INTEGRATED') {
    sourceMix.collective += 0.1;
    sourceMix.emergent += 0.1;
    sourceMix.local -= 0.2;
  }

  // Adjust for deep processing
  if (processingPath === 'DEEP') {
    sourceMix.collective += 0.1;
    sourceMix.personal += 0.1;
    sourceMix.local -= 0.2;
  }

  // Normalize to sum to 1
  const total = Object.values(sourceMix).reduce((a, b) => a + b, 0);
  for (const key in sourceMix) {
    sourceMix[key] = Math.round((sourceMix[key] / total) * 100) / 100;
  }

  return sourceMix;
}

export async function handleAINQuery(args: Record<string, unknown>): Promise<AINQueryOutput> {
  const input = args as unknown as AINQueryInput;
  const { message, context, awarenessHint } = input;

  // Detect awareness level
  const awarenessLevel = awarenessHint || detectAwarenessLevel(message + (context || ''));

  // Extract depth markers
  const depthMarkers = extractDepthMarkers(message + (context || ''));

  // Determine processing path
  const processingPath = determineProcessingPath(message, awarenessLevel, depthMarkers);

  // Calculate source mix
  const sourceMix = calculateSourceMix(awarenessLevel, depthMarkers, processingPath);

  // Generate response (placeholder - would integrate with actual AIN engine)
  const response = generatePlaceholderResponse(message, awarenessLevel, processingPath);

  return {
    response,
    sourceMix,
    awarenessLevel,
    depthMarkers,
    processingPath,
  };
}

function generatePlaceholderResponse(
  message: string,
  awarenessLevel: string,
  processingPath: string
): string {
  // This would be replaced with actual AIN engine integration
  const responses: Record<string, string> = {
    MASTER: 'From the space of witnessing awareness, I sense...',
    INTEGRATED: 'Holding both perspectives, I notice...',
    RELATIONAL: 'In the space between us, I observe...',
    PARTIAL: 'Exploring this with you, I find...',
    UNCONSCIOUS: 'Let me offer a reflection on this...',
  };

  const prefix = responses[awarenessLevel] || responses.PARTIAL;

  return `${prefix}

[AIN MCP Server - ${processingPath} path]
This is a placeholder response. Connect to the full MAIA backend for complete AIN functionality.

Original query: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`;
}
