/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * PATTERN EXTRACTION ENGINE
 * Extracts universal transformation patterns from anonymized transcripts
 * for MAIA training.
 *
 * Human-Authored IP: Kelly Nezat, 2025
 * Implementation: Built with Claude Code assistance
 */

import Anthropic from '@anthropic-ai/sdk';
import { TransformationPattern, AnonymizedTranscript } from './TranscriptAnonymizer';

/**
 * Types of patterns we extract
 */
export type PatternType =
  | 'resistance'              // Client protecting/deflecting
  | 'breakthrough'            // Moment of insight/clarity
  | 'integration'             // Applying new awareness
  | 'deflection'              // Avoiding deeper truth
  | 'somatic_awareness'       // Body-based realization
  | 'insight'                 // Cognitive understanding
  | 'emotional_release'       // Tears, laughter, relief
  | 'elemental_shift';        // Fire→Water, Earth→Air, etc.

/**
 * Pattern Extractor Configuration
 */
export interface PatternExtractorConfig {
  minPatternConfidence: number;     // 0-1, minimum confidence to store
  includeCounterExamples: boolean;  // Learn from what DIDN'T work
  elementalFramework: 'spiralogic'; // Future: other frameworks
  maxPatternsPerSession: number;    // Limit to most significant
}

/**
 * Main Pattern Extraction Class
 */
export class PatternExtractor {
  private anthropic: Anthropic;
  private config: PatternExtractorConfig;

  constructor(config?: Partial<PatternExtractorConfig>) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.config = {
      minPatternConfidence: 0.7,
      includeCounterExamples: true,
      elementalFramework: 'spiralogic',
      maxPatternsPerSession: 10,
      ...config,
    };
  }

  /**
   * Extract transformation patterns from anonymized transcript
   */
  async extractPatterns(
    anonymizedTranscript: AnonymizedTranscript
  ): Promise<TransformationPattern[]> {
    console.log('🔍 Extracting transformation patterns...');

    const patterns = await this.analyzeWithSpiralogic(
      anonymizedTranscript.anonymizedText,
      anonymizedTranscript.metadata
    );

    // Filter by confidence
    const highConfidencePatterns = patterns.filter(
      p => p.confidence >= this.config.minPatternConfidence
    );

    // Limit to most significant
    const topPatterns = highConfidencePatterns
      .sort((a, b) => b.significance - a.significance)
      .slice(0, this.config.maxPatternsPerSession);

    console.log(`✅ Extracted ${topPatterns.length} patterns (${patterns.length} total analyzed)`);

    return topPatterns.map(p => this.formatPattern(p));
  }

  /**
   * Analyze transcript through Spiralogic lens
   */
  private async analyzeWithSpiralogic(
    transcript: string,
    metadata: AnonymizedTranscript['metadata']
  ): Promise<Array<TransformationPattern & { confidence: number; significance: number }>> {
    const prompt = `You are a Spiralogic consciousness analyst trained by Kelly Nezat. Analyze this anonymized session transcript to extract universal transformation patterns.

# SPIRALOGIC FRAMEWORK REMINDER

**Four Elements (Modes of Consciousness):**
- **FIRE** - Will, agency, direction, boundaries, Yang energy
- **WATER** - Feeling, flow, receptivity, emotion, Yin energy
- **EARTH** - Embodiment, grounding, sensation, presence
- **AIR** - Perspective, witness, clarity, understanding

**Three Phases (Levels of Engagement):**
- **Concentration** - Focusing, directing attention
- **Contemplation** - Exploring, discovering
- **Meditation** - Integration, allowing, being with

**Common Dynamics:**
- Fire rigidity blocking Water flow
- Water overwhelm needing Fire boundaries
- Air intellectualization avoiding Earth embodiment
- Earth stuck needing Air perspective

---

# YOUR TASK

Extract 3-10 **universal transformation patterns** from this session. For each pattern:

1. **Identify the type**: resistance, breakthrough, integration, deflection, somatic_awareness, insight, emotional_release, elemental_shift

2. **Describe the context**:
   - Elemental dynamics (which elements, how they're relating)
   - Archetypal theme (what universal human pattern)
   - Somatic signals (if present - body sensations, breathing, etc.)
   - Conversational context (what was happening in dialogue)

3. **Document the intervention** (if applicable):
   - What the facilitator did/asked
   - How the client responded
   - What insight emerged

4. **Extract the teaching**:
   - When to use this approach
   - How it works (mechanism)
   - What to avoid
   - Elemental wisdom (Spiralogic insight)

5. **Rate confidence and significance**:
   - Confidence: 0-1 (how certain this is a valid pattern)
   - Significance: 0-1 (how important/impactful this pattern is)

---

**FORMAT YOUR RESPONSE AS JSON:**

\`\`\`json
[
  {
    "type": "breakthrough",
    "context": {
      "elementalDynamics": "Fire rigidity (perfectionism) blocking Water (grief)",
      "archetypalTheme": "Inner critic protecting wounded child",
      "somaticSignals": "Jaw tension, held breath, rapid speech",
      "conversationalContext": "Client describing compulsive achieving"
    },
    "intervention": {
      "approach": "Asked: 'What is the perfectionism protecting you from feeling?'",
      "response": "Long pause → tears → 'I'm terrified I'm not enough'",
      "insight": "Perfectionism is armor against core unworthiness wound"
    },
    "teaching": {
      "whenToUse": "Client presents rigid control, harsh self-judgment, compulsive achieving",
      "howItWorks": "Name protection compassionately, invite what's underneath, hold space for grief",
      "whatToAvoid": "Don't challenge perfectionism directly - it's doing its job as protector",
      "elementalWisdom": "Perfectionism is Fire protecting Water. Soften into grief, Fire transforms naturally."
    },
    "confidence": 0.95,
    "significance": 0.9
  },
  // ... more patterns
]
\`\`\`

---

**TRANSCRIPT TO ANALYZE:**

${transcript}

---

**SESSION METADATA:**
- Date: ${metadata.sessionDate}
- Length: ${metadata.sessionLength} minutes
- Modalities: ${metadata.modalitiesUsed.join(', ')}

---

**IMPORTANT REMINDERS:**
- Extract UNIVERSAL patterns (not specific personal stories)
- Focus on TRANSFORMATION MECHANICS (how change happens)
- Use SPIRALOGIC LENS (elemental dynamics)
- Rate CONFIDENCE and SIGNIFICANCE honestly
- Return ONLY the JSON (no additional text)
`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : '[]';

    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '[]';

    try {
      const patterns = JSON.parse(jsonString);
      return patterns;
    } catch (error) {
      console.error('Failed to parse pattern extraction JSON:', error);
      console.error('Raw response:', content);
      return [];
    }
  }

  /**
   * Format pattern into standard TransformationPattern structure
   */
  private formatPattern(
    raw: TransformationPattern & { confidence: number; significance: number }
  ): TransformationPattern {
    return {
      id: this.generatePatternId(raw.type),
      type: raw.type,
      context: raw.context,
      intervention: raw.intervention,
      teaching: raw.teaching,
      traceableToClient: false, // Always false after anonymization
    };
  }

  /**
   * Generate unique pattern ID
   */
  private generatePatternId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `pattern_${type}_${timestamp}_${random}`;
  }

  /**
   * Analyze multiple sessions in batch
   */
  async extractPatternsFromMultipleSessions(
    sessions: AnonymizedTranscript[]
  ): Promise<TransformationPattern[]> {
    console.log(`📚 Extracting patterns from ${sessions.length} sessions...`);

    const allPatterns: TransformationPattern[] = [];

    for (const [index, session] of sessions.entries()) {
      console.log(`Processing session ${index + 1}/${sessions.length}...`);

      const patterns = await this.extractPatterns(session);
      allPatterns.push(...patterns);

      // Rate limiting (Anthropic: 50 req/min on tier 1)
      if (index < sessions.length - 1) {
        await this.sleep(1200); // ~1.2s between requests = 50/min
      }
    }

    // Deduplicate similar patterns
    const uniquePatterns = this.deduplicatePatterns(allPatterns);

    console.log(`✅ Extracted ${uniquePatterns.length} unique patterns from ${sessions.length} sessions`);

    return uniquePatterns;
  }

  /**
   * Deduplicate similar patterns (cluster and merge)
   */
  private deduplicatePatterns(patterns: TransformationPattern[]): TransformationPattern[] {
    // Simple deduplication by teaching content similarity
    // In production, use embeddings or more sophisticated clustering

    const unique: TransformationPattern[] = [];

    for (const pattern of patterns) {
      const isDuplicate = unique.some(existing =>
        this.patternsAreSimilar(existing, pattern)
      );

      if (!isDuplicate) {
        unique.push(pattern);
      }
    }

    return unique;
  }

  /**
   * Check if two patterns are essentially the same
   */
  private patternsAreSimilar(a: TransformationPattern, b: TransformationPattern): boolean {
    // Same type and similar context
    if (a.type !== b.type) return false;

    // Check if elemental dynamics are similar
    const aElemental = a.context.elementalDynamics.toLowerCase();
    const bElemental = b.context.elementalDynamics.toLowerCase();

    // Simple string similarity (in production, use embedding distance)
    const similarity = this.simpleSimilarity(aElemental, bElemental);

    return similarity > 0.7; // 70% similar = duplicate
  }

  /**
   * Simple string similarity (Jaccard index on words)
   */
  private simpleSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));

    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
  }

  /**
   * Helper: Sleep for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example usage:
 *
 * const extractor = new PatternExtractor({
 *   minPatternConfidence: 0.8,
 *   maxPatternsPerSession: 5,
 * });
 *
 * const patterns = await extractor.extractPatterns(anonymizedTranscript);
 *
 * // Or batch process:
 * const allPatterns = await extractor.extractPatternsFromMultipleSessions(
 *   anonymizedSessions
 * );
 */
