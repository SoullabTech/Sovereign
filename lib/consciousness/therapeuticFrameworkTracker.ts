// Therapeutic Framework Tracker
// Analyzes MAIA's responses to identify which therapeutic modalities she's using

/**
 * Framework Detection System
 *
 * Tracks which therapeutic frameworks MAIA employs in her responses
 * Useful for:
 * - Researchers studying her approach
 * - Therapists understanding her methods
 * - MAIA's own metacognitive awareness
 * - Transparency and explainability
 */

export type TherapeuticFramework =
  | 'somatic-experiencing'
  | 'internal-family-systems'
  | 'jungian-depth'
  | 'relational-psychoanalysis'
  | 'attachment-theory'
  | 'polyvagal-theory'
  | 'hakomi'
  | 'focusing'
  | 'cbt'
  | 'dbt'
  | 'act'
  | 'gestalt'
  | 'existential'
  | 'narrative-therapy'
  | 'archetypal-psychology';

export interface FrameworkSignal {
  framework: TherapeuticFramework;
  confidence: number; // 0-1
  indicators: string[]; // What phrases/patterns triggered detection
  description: string; // What this framework does
}

export interface FrameworkAnalysis {
  primaryFramework: TherapeuticFramework | null;
  frameworks: FrameworkSignal[];
  integrationScore: number; // How well frameworks are integrated (0-1)
  rationale: string; // Why these frameworks were selected
}

/**
 * Framework Detection Patterns
 * Each framework has linguistic markers that indicate its use
 */
const FRAMEWORK_PATTERNS: Record<TherapeuticFramework, {
  keywords: string[];
  phrases: string[];
  description: string;
}> = {
  'somatic-experiencing': {
    keywords: ['body', 'sensation', 'felt', 'nervous system', 'settle', 'activation', 'discharge', 'pendulation'],
    phrases: [
      'where do you feel',
      'in your body',
      'that sensation',
      'notice what happens',
      'body is telling',
      'somatic',
      'physically'
    ],
    description: 'Body-based trauma processing and nervous system regulation'
  },

  'internal-family-systems': {
    keywords: ['part', 'parts', 'protective', 'vulnerable', 'self', 'exile', 'manager', 'firefighter'],
    phrases: [
      'part of you',
      'protective part',
      'that part',
      'what does that part',
      'self energy',
      'parts inside'
    ],
    description: 'Working with internal multiplicity and parts'
  },

  'jungian-depth': {
    keywords: ['shadow', 'archetype', 'archetypal', 'symbol', 'dream', 'unconscious', 'individuation', 'anima', 'animus'],
    phrases: [
      'archetypal',
      'shadow side',
      'unconscious',
      'symbolic',
      'deeper pattern',
      'collective'
    ],
    description: 'Archetypal psychology and depth work'
  },

  'relational-psychoanalysis': {
    keywords: ['between', 'relationship', 'rupture', 'repair', 'attunement', 'presence', 'relational'],
    phrases: [
      'between us',
      'in our relationship',
      'rupture',
      'repair',
      'what\'s happening here',
      'present with'
    ],
    description: 'Relational dynamics and healing through connection'
  },

  'attachment-theory': {
    keywords: ['attachment', 'secure', 'anxious', 'avoidant', 'safety', 'secure base', 'haven'],
    phrases: [
      'attachment',
      'feel safe',
      'secure base',
      'safe haven',
      'early relationships'
    ],
    description: 'Attachment patterns and relational security'
  },

  'polyvagal-theory': {
    keywords: ['vagal', 'ventral', 'dorsal', 'sympathetic', 'parasympathetic', 'neuroception', 'safety'],
    phrases: [
      'nervous system',
      'feel safe',
      'window of tolerance',
      'state',
      'regulated'
    ],
    description: 'Nervous system states and safety regulation'
  },

  'hakomi': {
    keywords: ['mindfulness', 'loving presence', 'curiosity', 'experiment', 'notice'],
    phrases: [
      'bring curiosity',
      'notice what',
      'stay with that',
      'loving presence',
      'mindfully'
    ],
    description: 'Mindfulness-based somatic psychotherapy'
  },

  'focusing': {
    keywords: ['felt sense', 'edge', 'bodily knowing', 'handle', 'carrying forward'],
    phrases: [
      'felt sense',
      'edge of awareness',
      'what wants to',
      'bodily knowing',
      'sits inside'
    ],
    description: 'Accessing bodily felt sense and implicit knowing'
  },

  'cbt': {
    keywords: ['thought', 'belief', 'thinking', 'cognitive', 'pattern', 'reframe'],
    phrases: [
      'thought pattern',
      'belief',
      'way of thinking',
      'reframe',
      'challenge that'
    ],
    description: 'Cognitive restructuring and thought patterns'
  },

  'dbt': {
    keywords: ['dialectic', 'validation', 'skill', 'mindfulness', 'distress tolerance', 'emotion regulation'],
    phrases: [
      'both/and',
      'validate',
      'skill',
      'mindful',
      'regulate'
    ],
    description: 'Dialectical behavior therapy skills and validation'
  },

  'act': {
    keywords: ['values', 'acceptance', 'committed action', 'defusion', 'present moment'],
    phrases: [
      'your values',
      'accept',
      'committed to',
      'present moment',
      'what matters'
    ],
    description: 'Acceptance and values-based action'
  },

  'gestalt': {
    keywords: ['awareness', 'here and now', 'contact', 'experiment', 'emergence'],
    phrases: [
      'right now',
      'in this moment',
      'what are you aware',
      'experiment with',
      'emerging'
    ],
    description: 'Present moment awareness and experiential exploration'
  },

  'existential': {
    keywords: ['meaning', 'choice', 'freedom', 'responsibility', 'authentic', 'being'],
    phrases: [
      'meaning',
      'your choice',
      'freedom',
      'authentic',
      'way of being'
    ],
    description: 'Existential themes of meaning and authenticity'
  },

  'narrative-therapy': {
    keywords: ['story', 'narrative', 'externalize', 'dominant', 'alternative', 'retelling'],
    phrases: [
      'story you tell',
      'narrative',
      'different story',
      'rewrite',
      'name it'
    ],
    description: 'Story and narrative approaches to identity'
  },

  'archetypal-psychology': {
    keywords: ['archetype', 'myth', 'pattern', 'image', 'soul', 'psyche'],
    phrases: [
      'archetypal',
      'mythic',
      'soul',
      'psyche',
      'deeper pattern'
    ],
    description: 'Archetypal patterns and soul-making'
  }
};

/**
 * Analyze a MAIA response to detect which frameworks she's using
 */
export function analyzeTherapeuticFrameworks(responseText: string, userInput?: string): FrameworkAnalysis {
  const normalizedResponse = responseText.toLowerCase();
  const detectedFrameworks: FrameworkSignal[] = [];

  // Check each framework for matches
  for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    const indicators: string[] = [];
    let matchCount = 0;

    // Check keywords
    for (const keyword of patterns.keywords) {
      if (normalizedResponse.includes(keyword.toLowerCase())) {
        indicators.push(`keyword: "${keyword}"`);
        matchCount++;
      }
    }

    // Check phrases (weighted more heavily)
    for (const phrase of patterns.phrases) {
      if (normalizedResponse.includes(phrase.toLowerCase())) {
        indicators.push(`phrase: "${phrase}"`);
        matchCount += 2; // Phrases are stronger signals
      }
    }

    // Calculate confidence based on matches
    const totalPossible = patterns.keywords.length + (patterns.phrases.length * 2);
    const confidence = Math.min(matchCount / totalPossible, 1);

    // Only include if confidence > 0.1 (at least some signal)
    if (confidence > 0.1) {
      detectedFrameworks.push({
        framework: framework as TherapeuticFramework,
        confidence,
        indicators,
        description: patterns.description
      });
    }
  }

  // Sort by confidence
  detectedFrameworks.sort((a, b) => b.confidence - a.confidence);

  // Calculate integration score (how many frameworks are used together)
  const integrationScore = detectedFrameworks.length > 1
    ? Math.min(detectedFrameworks.length / 4, 1) // Multiple frameworks = better integration
    : detectedFrameworks.length === 1 ? 0.5 : 0;

  // Generate rationale
  const rationale = generateRationale(detectedFrameworks, userInput);

  return {
    primaryFramework: detectedFrameworks[0]?.framework || null,
    frameworks: detectedFrameworks,
    integrationScore,
    rationale
  };
}

function generateRationale(frameworks: FrameworkSignal[], userInput?: string): string {
  if (frameworks.length === 0) {
    return 'No specific therapeutic framework detected - likely using general conversational presence.';
  }

  if (frameworks.length === 1) {
    return `Primarily using ${formatFrameworkName(frameworks[0].framework)} - ${frameworks[0].description}`;
  }

  const frameworkNames = frameworks.slice(0, 3).map(f => formatFrameworkName(f.framework));
  return `Integrating multiple frameworks: ${frameworkNames.join(', ')}. This suggests a holistic, multi-modal approach appropriate for complex relational work.`;
}

function formatFrameworkName(framework: TherapeuticFramework): string {
  return framework
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a transparency report for researchers/therapists
 */
export function generateTransparencyReport(
  responseText: string,
  userInput: string,
  analysis: FrameworkAnalysis
): string {
  const report = `
THERAPEUTIC FRAMEWORK ANALYSIS
================================

User Input: "${userInput.substring(0, 100)}${userInput.length > 100 ? '...' : ''}"

MAIA Response: "${responseText.substring(0, 150)}${responseText.length > 150 ? '...' : ''}"

PRIMARY FRAMEWORK: ${analysis.primaryFramework ? formatFrameworkName(analysis.primaryFramework) : 'None detected'}

FRAMEWORKS DETECTED (${analysis.frameworks.length}):
${analysis.frameworks.map((f, i) => `
${i + 1}. ${formatFrameworkName(f.framework)}
   Confidence: ${(f.confidence * 100).toFixed(1)}%
   Description: ${f.description}
   Indicators: ${f.indicators.join(', ')}
`).join('\n')}

INTEGRATION SCORE: ${(analysis.integrationScore * 100).toFixed(1)}%
${analysis.integrationScore > 0.7 ? '(High integration - multiple frameworks working together)' :
  analysis.integrationScore > 0.4 ? '(Moderate integration)' :
  '(Single framework or general approach)'}

RATIONALE: ${analysis.rationale}

================================
This analysis helps therapists and researchers understand which therapeutic modalities
MAIA is drawing from in her responses. Higher integration scores suggest more nuanced,
multi-modal approaches appropriate for complex relational work.
`;

  return report;
}

/**
 * Real-time framework tracking for conversation analysis
 */
export class FrameworkTracker {
  private conversationFrameworks: Map<number, FrameworkAnalysis> = new Map();
  private turnCount = 0;

  trackTurn(userInput: string, maiaResponse: string): FrameworkAnalysis {
    this.turnCount++;
    const analysis = analyzeTherapeuticFrameworks(maiaResponse, userInput);
    this.conversationFrameworks.set(this.turnCount, analysis);
    return analysis;
  }

  getConversationSummary(): {
    totalTurns: number;
    frameworkFrequency: Record<TherapeuticFramework, number>;
    averageIntegration: number;
    dominantFramework: TherapeuticFramework | null;
  } {
    const frameworkCounts: Partial<Record<TherapeuticFramework, number>> = {};
    let totalIntegration = 0;

    for (const analysis of this.conversationFrameworks.values()) {
      totalIntegration += analysis.integrationScore;

      for (const signal of analysis.frameworks) {
        frameworkCounts[signal.framework] = (frameworkCounts[signal.framework] || 0) + 1;
      }
    }

    // Find most used framework
    let dominantFramework: TherapeuticFramework | null = null;
    let maxCount = 0;
    for (const [framework, count] of Object.entries(frameworkCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantFramework = framework as TherapeuticFramework;
      }
    }

    return {
      totalTurns: this.turnCount,
      frameworkFrequency: frameworkCounts as Record<TherapeuticFramework, number>,
      averageIntegration: totalIntegration / this.turnCount,
      dominantFramework
    };
  }

  reset() {
    this.conversationFrameworks.clear();
    this.turnCount = 0;
  }
}
