/**
 * Resonance Field - Multi-Dimensional Wisdom Matching
 *
 * This isn't passive retrieval - it's active field resonance.
 * Like a nerve deciding what signals to amplify based on:
 * - Semantic meaning (embeddings)
 * - Emotional tone
 * - Elemental needs
 * - Developmental level
 * - Relational dynamics
 *
 * The wisdom that resonates STRONGEST gets amplified and passed through.
 */

import { searchLibrary, LibraryChunk } from './LibraryOfAlexandria';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface QueryField {
  text: string;
  emotionalTone?: EmotionalTone;
  elementalNeeds?: ElementalNeeds;
  developmentalLevel?: number; // 1-12 (Spiralogic)
  urgency?: 'low' | 'medium' | 'high';
  conversationHistory?: any[];
}

export interface EmotionalTone {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'confusion' | 'excitement' | 'peace' | 'grief' | 'shame' | 'love';
  intensity: number; // 0-1
  secondary?: string[];
}

export interface ElementalNeeds {
  fire?: number;    // Vision, creativity, inspiration, action
  water?: number;   // Emotion, flow, intuition, feeling
  earth?: number;   // Grounding, structure, embodiment, stability
  air?: number;     // Mental clarity, communication, perspective, ideas
  aether?: number;  // Integration, wholeness, transcendence, unity
}

export interface ResonantChunk extends LibraryChunk {
  resonanceScore: number; // 0-1 (combines all factors)
  resonanceFactors: {
    semantic: number;        // Base similarity from embeddings
    emotional?: number;      // Emotional tone match
    elemental?: number;      // Elemental need alignment
    developmental?: number;  // Spiralogic level appropriateness
  };
  recommendationReason: string; // Human-readable explanation
}

export interface FieldReport {
  queryField: QueryField;
  chunksActivated: ResonantChunk[];
  totalResonance: number;
  dominantElement?: string;
  developmentalEdge?: string;
  wisdomSources: string[]; // Which files contributed
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// RESONANCE DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Detect emotional tone from query text
 * Uses simple keyword/phrase matching (can be enhanced with ML later)
 */
export function detectEmotionalTone(text: string): EmotionalTone | undefined {
  const lowerText = text.toLowerCase();

  // Fear/Anxiety patterns
  if (/(afraid|scared|anxious|worried|terrified|panic|fear)/i.test(lowerText)) {
    return {
      primary: 'fear',
      intensity: 0.7,
      secondary: ['anxiety']
    };
  }

  // Confusion patterns
  if (/(confused|lost|stuck|don't know|unclear|overwhelmed)/i.test(lowerText)) {
    return {
      primary: 'confusion',
      intensity: 0.6,
      secondary: ['uncertainty']
    };
  }

  // Grief/Sadness patterns
  if (/(sad|depressed|grief|grieving|loss|mourning|heartbroken)/i.test(lowerText)) {
    return {
      primary: 'grief',
      intensity: 0.7,
      secondary: ['sadness']
    };
  }

  // Anger patterns
  if (/(angry|frustrated|rage|furious|irritated|mad)/i.test(lowerText)) {
    return {
      primary: 'anger',
      intensity: 0.6,
      secondary: ['frustration']
    };
  }

  // Shame patterns
  if (/(ashamed|guilty|shame|embarrassed|unworthy)/i.test(lowerText)) {
    return {
      primary: 'shame',
      intensity: 0.7,
      secondary: ['guilt']
    };
  }

  // Excitement/Joy patterns
  if (/(excited|amazing|wonderful|joyful|grateful|happy|thrilled)/i.test(lowerText)) {
    return {
      primary: 'excitement',
      intensity: 0.6,
      secondary: ['joy']
    };
  }

  return undefined;
}

/**
 * Detect elemental needs from query
 * What element does this person's system need right now?
 */
export function detectElementalNeeds(text: string, emotionalTone?: EmotionalTone): ElementalNeeds {
  const lowerText = text.toLowerCase();
  const needs: ElementalNeeds = {};

  // FIRE needs (vision, action, inspiration, direction)
  if (/(purpose|direction|vision|clarity|goals|motivation|action|create|build|start)/i.test(lowerText)) {
    needs.fire = 0.7;
  }
  if (emotionalTone?.primary === 'confusion') {
    needs.fire = (needs.fire || 0) + 0.3;
  }

  // WATER needs (emotion, flow, feeling, intuition)
  if (/(feel|emotion|intuition|flow|stuck|block|grief|sadness|heart)/i.test(lowerText)) {
    needs.water = 0.7;
  }
  if (emotionalTone?.primary === 'grief' || emotionalTone?.primary === 'sadness') {
    needs.water = (needs.water || 0) + 0.3;
  }

  // EARTH needs (grounding, stability, embodiment, structure)
  if (/(ground|body|physical|stable|structure|routine|practice|anchor|safe)/i.test(lowerText)) {
    needs.earth = 0.7;
  }
  if (emotionalTone?.primary === 'fear' || emotionalTone?.primary === 'anxiety') {
    needs.earth = (needs.earth || 0) + 0.3;
  }

  // AIR needs (mental clarity, perspective, communication, ideas)
  if (/(think|understand|perspective|communicate|explain|analyze|ideas|mental|clarity)/i.test(lowerText)) {
    needs.air = 0.7;
  }
  if (emotionalTone?.primary === 'confusion') {
    needs.air = (needs.air || 0) + 0.2;
  }

  // AETHER needs (integration, wholeness, spiritual, transcendence)
  if (/(integrate|whole|spiritual|transcend|unity|connect|sacred|divine|soul|meaning)/i.test(lowerText)) {
    needs.aether = 0.8;
  }
  if (emotionalTone?.primary === 'shame') {
    needs.aether = (needs.aether || 0) + 0.3; // Shame needs integration/wholeness
  }

  // Normalize scores to 0-1
  Object.keys(needs).forEach(key => {
    const k = key as keyof ElementalNeeds;
    if (needs[k]! > 1) needs[k] = 1;
  });

  return needs;
}

/**
 * Detect developmental level from query complexity
 * 1-3: Concrete, survival-oriented
 * 4-6: Social, relational, identity
 * 7-9: Systems thinking, integration
 * 10-12: Transcendent, cosmic, unity
 */
export function detectDevelopmentalLevel(text: string, conversationHistory?: any[]): number {
  const lowerText = text.toLowerCase();

  // Level 10-12: Transcendent/Integral language
  if (/(consciousness|awakening|enlightenment|non-dual|unity|cosmic|transcend|witness|presence)/i.test(lowerText)) {
    return 10;
  }

  // Level 7-9: Systems thinking, shadow work, integration
  if (/(system|pattern|integrate|shadow|projection|collective|archetypal|developmental|evolution)/i.test(lowerText)) {
    return 8;
  }

  // Level 4-6: Relational, identity, emotional intelligence
  if (/(relationship|identity|authentic|values|meaning|purpose|feel|emotion|self)/i.test(lowerText)) {
    return 5;
  }

  // Level 1-3: Concrete, survival, basic needs
  if (/(help|how to|what do i do|need|want|should i|problem|fix)/i.test(lowerText)) {
    return 3;
  }

  // Default: mid-range
  return 5;
}

// ═══════════════════════════════════════════════════════════════
// RESONANCE SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate how well a chunk resonates with the query field
 */
function calculateResonance(
  chunk: LibraryChunk,
  queryField: QueryField
): { score: number; factors: ResonantChunk['resonanceFactors']; reason: string } {

  const factors: ResonantChunk['resonanceFactors'] = {
    semantic: chunk.similarity,
  };

  let totalScore = chunk.similarity * 0.4; // Semantic is 40% base
  const reasons: string[] = [`${(chunk.similarity * 100).toFixed(0)}% semantic match`];

  // Emotional resonance (20% weight)
  if (queryField.emotionalTone && chunk.concepts) {
    const emotionWords = {
      'fear': ['fear', 'anxiety', 'safety', 'grounding'],
      'grief': ['grief', 'loss', 'sadness', 'mourning', 'water'],
      'anger': ['anger', 'fire', 'boundaries', 'power'],
      'shame': ['shame', 'shadow', 'integration', 'wholeness'],
      'confusion': ['clarity', 'direction', 'fire', 'air', 'vision'],
      'excitement': ['fire', 'creativity', 'vision', 'joy'],
    };

    const relevantWords = emotionWords[queryField.emotionalTone.primary] || [];
    const matchCount = chunk.concepts.filter(c =>
      relevantWords.some(w => c.toLowerCase().includes(w))
    ).length;

    if (matchCount > 0) {
      factors.emotional = matchCount / relevantWords.length;
      totalScore += factors.emotional * 0.2;
      reasons.push(`addresses ${queryField.emotionalTone.primary}`);
    }
  }

  // Elemental resonance (25% weight)
  if (queryField.elementalNeeds && chunk.element) {
    const needScore = queryField.elementalNeeds[chunk.element as keyof ElementalNeeds] || 0;
    if (needScore > 0) {
      factors.elemental = needScore;
      totalScore += needScore * 0.25;
      reasons.push(`${chunk.element} element resonates`);
    }
  }

  // Developmental level match (15% weight)
  if (queryField.developmentalLevel && chunk.level) {
    // Prefer wisdom at or slightly above current level
    const levelDiff = Math.abs(chunk.level - queryField.developmentalLevel);
    const levelScore = Math.max(0, 1 - (levelDiff / 6)); // Decay over 6 levels

    if (levelScore > 0.5) {
      factors.developmental = levelScore;
      totalScore += levelScore * 0.15;
      reasons.push(`level ${chunk.level} wisdom`);
    }
  }

  return {
    score: Math.min(1, totalScore),
    factors,
    reason: reasons.join(', ')
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN RESONANCE SEARCH
// ═══════════════════════════════════════════════════════════════

/**
 * Search the Library with full resonance field awareness
 * This is like a nerve actively deciding what to amplify
 */
export async function searchWithResonance(
  queryField: QueryField,
  maxResults: number = 5
): Promise<FieldReport> {

  // Auto-detect field properties if not provided
  if (!queryField.emotionalTone) {
    queryField.emotionalTone = detectEmotionalTone(queryField.text);
  }

  if (!queryField.elementalNeeds) {
    queryField.elementalNeeds = detectElementalNeeds(queryField.text, queryField.emotionalTone);
  }

  if (!queryField.developmentalLevel) {
    queryField.developmentalLevel = detectDevelopmentalLevel(queryField.text, queryField.conversationHistory);
  }

  console.log('\n🌊 [RESONANCE FIELD] Analyzing query field...');
  console.log(`   Emotional tone: ${queryField.emotionalTone?.primary || 'neutral'}`);
  console.log(`   Elemental needs: ${Object.entries(queryField.elementalNeeds || {})
    .filter(([_, v]) => v > 0.5)
    .map(([k, v]) => `${k} (${(v * 100).toFixed(0)}%)`)
    .join(', ') || 'balanced'}`);
  console.log(`   Developmental level: ${queryField.developmentalLevel}`);

  // Get base semantic results (cast to 10 to rescore)
  const baseChunks = await searchLibrary({
    query: queryField.text,
    maxResults: maxResults * 2, // Get more to rescore
    minSimilarity: 0.4,
  });

  // Calculate resonance scores for each chunk
  const resonantChunks: ResonantChunk[] = baseChunks.map(chunk => {
    const { score, factors, reason } = calculateResonance(chunk, queryField);

    return {
      ...chunk,
      resonanceScore: score,
      resonanceFactors: factors,
      recommendationReason: reason,
    };
  });

  // Sort by resonance score (not just semantic similarity)
  resonantChunks.sort((a, b) => b.resonanceScore - a.resonanceScore);

  // Take top results
  const topChunks = resonantChunks.slice(0, maxResults);

  // Generate field report
  const report: FieldReport = {
    queryField,
    chunksActivated: topChunks,
    totalResonance: topChunks.reduce((sum, c) => sum + c.resonanceScore, 0) / topChunks.length,
    dominantElement: findDominantElement(topChunks),
    developmentalEdge: findDevelopmentalEdge(topChunks, queryField.developmentalLevel),
    wisdomSources: [...new Set(topChunks.map(c => c.file_name))],
    timestamp: new Date(),
  };

  console.log(`\n✨ [RESONANCE] Activated ${topChunks.length} wisdom chunks`);
  console.log(`   Average resonance: ${(report.totalResonance * 100).toFixed(0)}%`);
  console.log(`   Dominant element: ${report.dominantElement || 'balanced'}`);
  console.log(`   Sources: ${report.wisdomSources.slice(0, 3).join(', ')}${report.wisdomSources.length > 3 ? '...' : ''}`);

  return report;
}

/**
 * Find which element is most represented in activated wisdom
 */
function findDominantElement(chunks: ResonantChunk[]): string | undefined {
  const elementCounts: { [key: string]: number } = {};

  chunks.forEach(chunk => {
    if (chunk.element) {
      elementCounts[chunk.element] = (elementCounts[chunk.element] || 0) + chunk.resonanceScore;
    }
  });

  const entries = Object.entries(elementCounts);
  if (entries.length === 0) return undefined;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Identify developmental edge (growing edge) from wisdom activated
 */
function findDevelopmentalEdge(chunks: ResonantChunk[], currentLevel?: number): string | undefined {
  if (!currentLevel) return undefined;

  const levels = chunks
    .filter(c => c.level && c.level > currentLevel)
    .map(c => c.level!);

  if (levels.length === 0) return undefined;

  const nextLevel = Math.min(...levels);
  const levelNames: { [key: number]: string } = {
    3: 'Concrete operations',
    5: 'Relational awareness',
    8: 'Systems thinking',
    10: 'Integral consciousness',
    12: 'Cosmic unity',
  };

  return levelNames[nextLevel] || `Level ${nextLevel}`;
}

/**
 * Format field report for prompt injection
 */
export function formatFieldReportForPrompt(report: FieldReport): string {
  let formatted = `## 🌊 RESONANCE FIELD REPORT\n\n`;

  formatted += `**Query Field Analysis:**\n`;
  if (report.queryField.emotionalTone) {
    formatted += `- Emotional tone: ${report.queryField.emotionalTone.primary} (${(report.queryField.emotionalTone.intensity * 100).toFixed(0)}% intensity)\n`;
  }

  const elementalNeeds = Object.entries(report.queryField.elementalNeeds || {})
    .filter(([_, v]) => v > 0.5)
    .sort((a, b) => b[1] - a[1]);

  if (elementalNeeds.length > 0) {
    formatted += `- Elemental needs: ${elementalNeeds.map(([k, v]) => `${k} (${(v * 100).toFixed(0)}%)`).join(', ')}\n`;
  }

  formatted += `- Developmental level: ${report.queryField.developmentalLevel}\n\n`;

  formatted += `**Wisdom Activated (${report.chunksActivated.length} chunks, ${(report.totalResonance * 100).toFixed(0)}% avg resonance):**\n\n`;

  report.chunksActivated.forEach((chunk, idx) => {
    formatted += `### ${idx + 1}. ${chunk.file_name}\n`;
    formatted += `**Resonance: ${(chunk.resonanceScore * 100).toFixed(0)}%** (${chunk.recommendationReason})\n`;
    if (chunk.element) formatted += `Element: ${chunk.element} | `;
    if (chunk.level) formatted += `Level: ${chunk.level} | `;
    formatted += `Similarity: ${(chunk.similarity * 100).toFixed(0)}%\n\n`;
    formatted += `${chunk.content.slice(0, 400)}...\n\n`;
    formatted += `---\n\n`;
  });

  if (report.dominantElement) {
    formatted += `\n**Dominant Element:** ${report.dominantElement} - This wisdom strongly resonates with ${report.dominantElement} energy.\n`;
  }

  if (report.developmentalEdge) {
    formatted += `\n**Developmental Edge:** The activated wisdom points toward ${report.developmentalEdge} as a growing edge.\n`;
  }

  return formatted;
}
