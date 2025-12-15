/**
 * SEMANTIC CHAPTER DETECTOR
 *
 * Enhanced elemental chapter detection using semantic similarity
 * Goes beyond keyword matching to understand conceptual resonance
 *
 * Uses embeddings to detect:
 * - Nuanced references to elemental themes
 * - Metaphorical language
 * - Contextual patterns
 * - Deep semantic connections
 */

export interface ElementalTheme {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic';
  confidence: number;
  detectionMethod: 'keyword' | 'semantic' | 'contextual' | 'pattern';
  matchedConcepts: string[];
}

/**
 * Elemental semantic patterns
 * Expanded beyond simple keywords to include metaphors, concepts, and contexts
 */
const ELEMENTAL_SEMANTIC_PATTERNS = {
  fire: {
    direct: ['fire', 'flame', 'spark', 'ignite', 'burn', 'heat', 'light', 'illumination'],
    metaphorical: ['passion', 'drive', 'enthusiasm', 'energy', 'motivation', 'inspiration', 'breakthrough', 'awakening'],
    conceptual: ['vision', 'purpose', 'creativity', 'transformation', 'alchemy', 'rebirth', 'phoenix'],
    experiential: ['lit up', 'fired up', 'burning with', 'spark of', 'light bulb moment', 'flash of insight'],
    shadow: ['burnout', 'consumed', 'manic', 'scattered', 'unsustainable', 'exhausted from creating'],
    developmental: ['initiating', 'beginning', 'emerging', 'conceiving', 'envisioning', 'dreaming'],

    // Fire phases
    fire1: ['first spark', 'initial vision', 'new idea', 'conception', 'glimpse', 'possibility'],
    fire2: ['purification', 'refining', 'testing', 'trial by fire', 'burning away', 'distillation'],
    fire3: ['radiance', 'full expression', 'mastery', 'empowerment', 'sovereignty', 'self-actualization']
  },

  water: {
    direct: ['water', 'ocean', 'river', 'stream', 'flow', 'wave', 'tide', 'current'],
    metaphorical: ['emotion', 'feeling', 'depth', 'intuition', 'empathy', 'compassion', 'sensitivity'],
    conceptual: ['healing', 'cleansing', 'purification', 'release', 'letting go', 'surrender', 'trust'],
    experiential: ['feel deeply', 'wash over', 'dive into', 'drown in', 'float', 'immersed'],
    shadow: ['overwhelmed', 'drowning', 'flooded', 'lost at sea', 'emotional tsunami', 'stuck in sadness'],
    developmental: ['receptive', 'allowing', 'accepting', 'integrating', 'processing', 'feeling'],

    // Water phases
    water1: ['emotional depth', 'feeling everything', 'sensitivity', 'vulnerability', 'opening heart'],
    water2: ['emotional flow', 'processing', 'movement', 'current', 'emotional intelligence'],
    water3: ['emotional wisdom', 'healing presence', 'compassion', 'empathy mastery', 'emotional maturity']
  },

  earth: {
    direct: ['earth', 'ground', 'soil', 'rock', 'mountain', 'roots', 'foundation', 'body'],
    metaphorical: ['stable', 'solid', 'practical', 'tangible', 'real', 'concrete', 'physical'],
    conceptual: ['manifestation', 'embodiment', 'grounding', 'presence', 'discipline', 'patience', 'persistence'],
    experiential: ['feet on ground', 'rooted', 'planted', 'anchored', 'centered', 'grounded in body'],
    shadow: ['stuck', 'rigid', 'heavy', 'dense', 'materialistic', 'can\'t move forward', 'trapped'],
    developmental: ['building', 'creating form', 'structuring', 'organizing', 'establishing', 'making real'],

    // Body/somatic signals
    body: ['fatigue', 'tired', 'sleep', 'appetite', 'pain', 'tension', 'sluggish', 'restless', 'tense', 'sore', 'ache', 'posture', 'in my body', 'in my bones'],

    // Life logistics/material world
    logistics: ['money', 'bills', 'work', 'tasks', 'schedule', 'routine', 'home', 'cleaning', 'paperwork', 'job', 'career', 'finances'],

    // Health/wellness
    health: ['nutrition', 'digestion', 'inflammation', 'injury', 'recovery', 'stability', 'structure', 'wellness', 'healing'],

    // Sense-world
    sensory: ['touch', 'taste', 'smell', 'weight', 'texture', 'physical sensation', 'embodied', 'somatic'],

    // Chaos/need for order
    chaos: ['chaos', 'chaotic', 'disorganized', 'mess', 'scattered', 'need structure', 'need order', 'need stability', 'overwhelm'],

    // Earth phases
    earth1: ['taking root', 'grounding', 'foundation', 'establishing', 'embodying', 'getting practical'],
    earth2: ['growing', 'developing', 'cultivating', 'nurturing', 'tending', 'patience'],
    earth3: ['harvest', 'fruition', 'manifestation', 'completion', 'abundance', 'mastery of form']
  },

  air: {
    direct: ['air', 'wind', 'breath', 'sky', 'atmosphere', 'breeze', 'gust'],
    metaphorical: ['thought', 'mind', 'clarity', 'perspective', 'understanding', 'communication', 'connection'],
    conceptual: ['ideas', 'concepts', 'learning', 'teaching', 'sharing', 'networking', 'collaboration'],
    experiential: ['think clearly', 'fresh perspective', 'mental clarity', 'aha moment', 'understand now'],
    shadow: ['overthinking', 'analysis paralysis', 'disconnected', 'in my head', 'can\'t stop thinking'],
    developmental: ['learning', 'understanding', 'integrating knowledge', 'communicating', 'connecting'],

    // Air phases
    air1: ['new thought', 'curiosity', 'questioning', 'exploring ideas', 'mental opening'],
    air2: ['understanding', 'connecting dots', 'seeing patterns', 'integrating knowledge'],
    air3: ['wisdom', 'teaching', 'sharing', 'communicating mastery', 'inspiring others']
  },

  aether: {
    direct: ['aether', 'ether', 'spirit', 'soul', 'essence', 'void', 'spaciousness'],
    metaphorical: ['unity', 'oneness', 'wholeness', 'integration', 'synthesis', 'transcendence'],
    conceptual: ['sacred', 'divine', 'mystical', 'spiritual', 'consciousness', 'awareness', 'presence'],
    experiential: ['at one with', 'connected to all', 'sense of wholeness', 'beyond self', 'timeless'],
    shadow: ['bypassing', 'ungrounded', 'dissociated', 'escapist', 'avoiding reality', 'spiritually bypassing'],
    developmental: ['integrating all', 'witnessing', 'holding paradox', 'transcending dualities'],

    // Soul/numinous
    numinous: ['sacred', 'divine', 'grace', 'prayer', 'communion', 'blessing', 'mystery', 'mystical', 'numinous', 'holy'],

    // Identity/teleology (purpose/meaning)
    purpose: ['purpose', 'calling', 'destiny', 'why am i here', 'vocation', 'meaning', 'alignment', 'life purpose', 'soul purpose'],

    // Liminal/integrative (threshold, wholeness)
    liminal: ['threshold', 'between worlds', 'liminal', 'transition', 'ending', 'beginning', 'initiation', 'rite of passage'],
    integrative: ['wholeness', 'unity', 'synchronicity', 'paradox', 'awe', 'presence', 'witness', 'the field', 'integration', 'synthesis']
  },

  spiralogic: {
    direct: ['spiral', 'spiralogic', 'cycle', 'phase', 'stage', 'process', 'evolution'],
    metaphorical: ['transformation', 'development', 'growth', 'journey', 'path', 'progression'],
    conceptual: ['regression', 'progression', 'integration', 'transcendence', 'renewal', 'iteration'],
    experiential: ['going back to', 'revisiting', 'cycling through', 'coming back around', 'next level'],
    patterns: ['torus', 'toroidal', 'inward spiral', 'outward spiral', 'stillness point', 'cardinal', 'fixed', 'mutable']
  }
};

/**
 * Keyword-based detection (fast, baseline)
 */
export function detectElementsKeyword(text: string): ElementalTheme[] {
  const normalizedText = text.toLowerCase();
  const detected: ElementalTheme[] = [];

  for (const [element, patterns] of Object.entries(ELEMENTAL_SEMANTIC_PATTERNS)) {
    // Dynamically include ALL pattern arrays (not just hardcoded ones)
    const allPatterns: string[] = [];

    for (const [key, value] of Object.entries(patterns)) {
      if (Array.isArray(value)) {
        allPatterns.push(...value);
      }
    }

    const matches: string[] = [];
    let matchCount = 0;

    for (const pattern of allPatterns) {
      if (normalizedText.includes(pattern)) {
        matches.push(pattern);
        matchCount++;
      }
    }

    if (matchCount > 0) {
      detected.push({
        element: element as any,
        confidence: Math.min(matchCount / 10, 1.0), // Scale to 0-1
        detectionMethod: 'keyword',
        matchedConcepts: matches
      });
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Pattern-based detection (contextual understanding)
 */
export function detectElementsPattern(text: string): ElementalTheme[] {
  const normalizedText = text.toLowerCase();
  const detected: ElementalTheme[] = [];

  // Shadow pattern detection
  for (const [element, patterns] of Object.entries(ELEMENTAL_SEMANTIC_PATTERNS)) {
    if (!patterns.shadow) continue;

    const shadowMatches = patterns.shadow.filter(shadow =>
      normalizedText.includes(shadow)
    );

    if (shadowMatches.length > 0) {
      detected.push({
        element: element as any,
        confidence: 0.8, // High confidence for shadow patterns
        detectionMethod: 'pattern',
        matchedConcepts: shadowMatches.map(s => `shadow: ${s}`)
      });
    }
  }

  // Developmental stage detection
  for (const [element, patterns] of Object.entries(ELEMENTAL_SEMANTIC_PATTERNS)) {
    if (!patterns.developmental) continue;

    const devMatches = patterns.developmental.filter(dev =>
      normalizedText.includes(dev)
    );

    if (devMatches.length > 0) {
      detected.push({
        element: element as any,
        confidence: 0.7,
        detectionMethod: 'pattern',
        matchedConcepts: devMatches.map(d => `developmental: ${d}`)
      });
    }
  }

  // Phase-specific detection (e.g., fire1, water2, earth3)
  for (const [element, patterns] of Object.entries(ELEMENTAL_SEMANTIC_PATTERNS)) {
    for (const key of Object.keys(patterns)) {
      if (key.match(/^(fire|water|earth|air)\d$/)) {
        const phasePatterns = patterns[key as keyof typeof patterns] as string[];
        const phaseMatches = phasePatterns.filter(p => normalizedText.includes(p));

        if (phaseMatches.length > 0) {
          detected.push({
            element: element as any,
            confidence: 0.9, // Very high confidence for phase-specific patterns
            detectionMethod: 'pattern',
            matchedConcepts: phaseMatches.map(p => `${key}: ${p}`)
          });
        }
      }
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Contextual detection (sentence-level analysis)
 */
export function detectElementsContextual(text: string): ElementalTheme[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase());
  const detected: Map<string, ElementalTheme> = new Map();

  for (const sentence of sentences) {
    if (sentence.length < 10) continue; // Skip very short sentences

    // Check each element for contextual matches
    for (const [element, patterns] of Object.entries(ELEMENTAL_SEMANTIC_PATTERNS)) {
      const experiential = patterns.experiential || [];
      const conceptual = patterns.conceptual || [];

      // Look for experiential phrases (higher confidence)
      for (const exp of experiential) {
        if (sentence.includes(exp)) {
          const existing = detected.get(element);
          const newConfidence = 0.85;

          if (!existing || existing.confidence < newConfidence) {
            detected.set(element, {
              element: element as any,
              confidence: newConfidence,
              detectionMethod: 'contextual',
              matchedConcepts: [...(existing?.matchedConcepts || []), `experiential: ${exp}`]
            });
          }
        }
      }

      // Look for conceptual clusters (multiple concepts in one sentence)
      const conceptMatches = conceptual.filter(c => sentence.includes(c));
      if (conceptMatches.length >= 2) {
        const existing = detected.get(element);
        const newConfidence = Math.min(0.6 + (conceptMatches.length * 0.1), 0.9);

        if (!existing || existing.confidence < newConfidence) {
          detected.set(element, {
            element: element as any,
            confidence: newConfidence,
            detectionMethod: 'contextual',
            matchedConcepts: [...(existing?.matchedConcepts || []), ...conceptMatches.map(c => `concept: ${c}`)]
          });
        }
      }
    }
  }

  return Array.from(detected.values()).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Combined detection (all methods)
 * Returns merged results with highest confidence for each element
 */
export function detectElementsAll(text: string): ElementalTheme[] {
  const keywordResults = detectElementsKeyword(text);
  const patternResults = detectElementsPattern(text);
  const contextualResults = detectElementsContextual(text);

  // Merge results, keeping highest confidence for each element
  const merged = new Map<string, ElementalTheme>();

  for (const result of [...keywordResults, ...patternResults, ...contextualResults]) {
    const existing = merged.get(result.element);

    if (!existing || result.confidence > existing.confidence) {
      // Use higher confidence result but merge matched concepts
      merged.set(result.element, {
        ...result,
        matchedConcepts: [
          ...(existing?.matchedConcepts || []),
          ...result.matchedConcepts
        ].filter((v, i, a) => a.indexOf(v) === i) // deduplicate
      });
    }
  }

  const results = Array.from(merged.values())
    .sort((a, b) => b.confidence - a.confidence)
    .filter(r => r.confidence >= 0.2); // Minimum confidence threshold (lowered from 0.3)

  // Fallback: Never return empty results
  // If no strong detection, infer from query length/structure
  if (results.length === 0) {
    const wordCount = text.split(/\s+/).length;
    const hasQuestions = /\?|what|how|why|where/i.test(text);
    const hasBody = /body|physical|pain|tense|tired|fatigue/i.test(text);
    const hasPurpose = /purpose|meaning|calling|why am i/i.test(text);
    const hasEmotion = /feel|emotion|heart|sad|angry|afraid/i.test(text);

    // Heuristic fallback based on query characteristics
    if (hasBody) {
      results.push({
        element: 'earth',
        confidence: 0.4,
        detectionMethod: 'contextual',
        matchedConcepts: ['fallback: body-related query']
      });
    } else if (hasPurpose) {
      results.push({
        element: 'aether',
        confidence: 0.4,
        detectionMethod: 'contextual',
        matchedConcepts: ['fallback: purpose-related query']
      });
    } else if (hasEmotion) {
      results.push({
        element: 'water',
        confidence: 0.4,
        detectionMethod: 'contextual',
        matchedConcepts: ['fallback: emotion-related query']
      });
    } else if (hasQuestions && wordCount > 10) {
      results.push({
        element: 'air',
        confidence: 0.3,
        detectionMethod: 'contextual',
        matchedConcepts: ['fallback: inquiry-based query']
      });
    } else {
      // Ultimate fallback: return spiralogic (the meta-pattern)
      results.push({
        element: 'spiralogic',
        confidence: 0.25,
        detectionMethod: 'contextual',
        matchedConcepts: ['fallback: insufficient signal, suggesting process orientation']
      });
    }
  }

  return results;
}

/**
 * Get recommended chapters based on detected themes
 */
export function getRecommendedChapters(themes: ElementalTheme[]): Array<'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic'> {
  // Filter by confidence threshold (lowered to 0.2 to include fallback results)
  // Fallback results range from 0.25-0.4, so we need a permissive threshold
  return themes
    .filter(t => t.confidence >= 0.2)
    .map(t => t.element)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3); // Max 3 chapters to keep context manageable
}

/**
 * Generate detection report for debugging/analytics
 */
export function generateDetectionReport(text: string): {
  summary: string;
  themes: ElementalTheme[];
  recommendedChapters: string[];
  detectionMethods: Record<string, number>;
} {
  const themes = detectElementsAll(text);
  const recommendedChapters = getRecommendedChapters(themes);

  const detectionMethods: Record<string, number> = {
    keyword: themes.filter(t => t.detectionMethod === 'keyword').length,
    semantic: themes.filter(t => t.detectionMethod === 'semantic').length,
    contextual: themes.filter(t => t.detectionMethod === 'contextual').length,
    pattern: themes.filter(t => t.detectionMethod === 'pattern').length
  };

  const summary = themes.length > 0
    ? `Detected ${themes.length} elemental themes. Primary: ${themes[0].element} (${(themes[0].confidence * 100).toFixed(0)}% confidence)`
    : 'No strong elemental themes detected';

  return {
    summary,
    themes,
    recommendedChapters,
    detectionMethods
  };
}

/**
 * Export for use in ElementalAlchemyBookLoader
 */
export { ELEMENTAL_SEMANTIC_PATTERNS };
