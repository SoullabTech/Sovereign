/**
 * THE DIALECTICAL SCAFFOLD
 * MAIA's Bloom's Taxonomy Cognitive Level Detection
 *
 * "Know thyself deeply enough to serve wisely."
 *
 * The Dialectical Scaffold combines Socratic questioning (dialectic) with developmental
 * support (scaffold) to guide users from passive consumption to active wisdom creation.
 *
 * Detects HOW users think (cognitive process) not just WHAT they know (awareness content).
 * Integrates with MAIA's awareness detection to scaffold development and prevent bypassing.
 *
 * The Six Levels of Cognitive Development:
 * 1. REMEMBER - Quoting authorities, parroting slogans
 * 2. UNDERSTAND - Explaining concepts in own words
 * 3. APPLY - Using ideas in concrete life situations
 * 4. ANALYZE - Seeing patterns, comparing structures
 * 5. EVALUATE - Making value judgments, prioritizing
 * 6. CREATE - Designing original practices, serving others
 *
 * Level 1-2: Personal Development (learning)
 * Level 3-4: Field Building (pattern recognition)
 * Level 5-6: Collective Contribution (wisdom-holder capacity)
 */

export type BloomLevel =
  | 'REMEMBER'      // Level 1: parroting / quoting
  | 'UNDERSTAND'    // Level 2: explaining conceptually
  | 'APPLY'         // Level 3: using ideas in life
  | 'ANALYZE'       // Level 4: pattern / structure seeing
  | 'EVALUATE'      // Level 5: prioritizing, choosing, judging
  | 'CREATE';       // Level 6: designing something new

export interface BloomDetection {
  level: BloomLevel;
  numericLevel: 1 | 2 | 3 | 4 | 5 | 6;
  score: number;          // 0–1 confidence
  rationale: string[];    // why this level was chosen
  scaffoldingPrompt?: string; // suggested next-level prompt
}

export interface BloomDetectionOptions {
  history?: Array<{ role: string; content: string }>;
  contextWeight?: number; // 0-1, how much to weight conversation history
}

/**
 * SOPHISTICATED HEURISTIC SCORING
 * Each level is scored 0-1 based on linguistic signals
 */

function scoreLevel1_Remember(input: string): number {
  let score = 0;
  const lower = input.toLowerCase();

  // Quote detection (0.3)
  const quoteScore = (input.match(/"[^"]{30,}"/g) || []).length > 0 ? 0.3 : 0;

  // Authority attribution (0.25)
  const authorityPatterns = [
    /\b(I (?:read|heard|saw|learned) that)\b/gi,
    /\b((?:they|people|experts) say|according to)\b/gi,
    /\b(Ram Dass|Jung|Rumi|Tolle|Adyashanti|Ramana) says?\b/gi,
    /\b(the (?:book|article|teacher|video) says?)\b/gi,
  ];
  const authorityMatches = authorityPatterns.reduce((sum, pattern) =>
    sum + (input.match(pattern) || []).length, 0);
  const authorityScore = Math.min(authorityMatches * 0.1, 0.25);

  // Slogan detection (0.25)
  const slogans = [
    /\b(everything happens for a reason)\b/gi,
    /\b(love is the answer)\b/gi,
    /\b(we are all one)\b/gi,
    /\b(trust the process)\b/gi,
    /\b(let it go)\b/gi,
  ];
  const sloganScore = slogans.some(s => s.test(input)) ? 0.25 : 0;

  // No personal integration (0.2)
  const hasNoPersonal = !/\b(I (?:tried|practiced|noticed|felt|realized))\b/gi.test(input);
  const noPersonalScore = hasNoPersonal ? 0.2 : 0;

  score = quoteScore + authorityScore + sloganScore + noPersonalScore;
  return Math.min(score, 1.0);
}

function scoreLevel2_Understand(input: string): number {
  let score = 0;

  // Definition patterns (0.4)
  const definePatterns = [
    /\b((?:shadow work|meditation|consciousness) (?:is|means))\b/gi,
    /\b(I (?:think|believe) (?:it|this) means?)\b/gi,
    /\b(basically it's|essentially)\b/gi,
    /\b(the (?:idea|concept) is)\b/gi,
  ];
  const defineScore = definePatterns.some(p => p.test(input)) ? 0.4 : 0;

  // Conceptual explanation (0.3)
  const conceptualWords = ['concept', 'idea', 'theory', 'means', 'basically', 'essentially'];
  const conceptMatches = conceptualWords.filter(w =>
    input.toLowerCase().includes(w)
  ).length;
  const conceptScore = Math.min(conceptMatches * 0.1, 0.3);

  // No concrete examples yet (0.3)
  const hasNoConcrete = !/\b(yesterday|last week|this morning|recently|when I)\b/gi.test(input);
  const noConcreteScore = hasNoConcrete ? 0.3 : 0;

  score = defineScore + conceptScore + noConcreteScore;
  return Math.min(score, 1.0);
}

function scoreLevel3_Apply(input: string): number {
  let score = 0;

  // First-person action verbs (0.4)
  const firstPersonPatterns = [
    /\b(I (?:tried|practiced|did|used|applied))\b/gi,
    /\b(I (?:told myself|reminded myself|noticed myself))\b/gi,
  ];
  const firstPersonScore = firstPersonPatterns.some(p => p.test(input)) ? 0.4 : 0;

  // Concrete time references (0.3)
  const timePatterns = [
    /\b(yesterday|last week|this morning|recently|today)\b/gi,
    /\b(when (?:I|my))\b/gi,
  ];
  const concreteTimeScore = timePatterns.some(p => p.test(input)) ? 0.3 : 0;

  // Specific relationships/situations (0.3)
  const relationshipPatterns = [
    /\b(with my (?:partner|child|boss|friend|parent))\b/gi,
    /\b(in my (?:life|experience|practice|work))\b/gi,
  ];
  const relationshipScore = relationshipPatterns.some(p => p.test(input)) ? 0.3 : 0;

  score = firstPersonScore + concreteTimeScore + relationshipScore;
  return Math.min(score, 1.0);
}

function scoreLevel4_Analyze(input: string): number {
  let score = 0;

  // Pattern recognition (0.4)
  const patternWords = ['pattern', 'notice', 'always', 'whenever', 'structure', 'dynamic'];
  const patternMatches = patternWords.filter(w =>
    input.toLowerCase().includes(w)
  ).length;
  const metaPatternScore = Math.min(patternMatches * 0.15, 0.4);

  // Contrast/comparison (0.3)
  const contrastPatterns = [
    /\b(compared to|unlike|different from|similar to)\b/gi,
    /\b(it's not (?:just|only).+it's (?:more|actually))\b/gi,
  ];
  const contrastScore = contrastPatterns.some(p => p.test(input)) ? 0.3 : 0;

  // Structural thinking (0.3)
  const structuralPatterns = [
    /\b(underneath|beneath|behind) (?:this|that|the)\b/gi,
    /\b(the (?:pattern|structure|dynamic) (?:is|seems))\b/gi,
  ];
  const structuralScore = structuralPatterns.some(p => p.test(input)) ? 0.3 : 0;

  score = metaPatternScore + contrastScore + structuralScore;
  return Math.min(score, 1.0);
}

function scoreLevel5_Evaluate(input: string): number {
  let score = 0;

  // Value prioritization (0.4)
  const valuePatterns = [
    /\b((?:it|this) matters more (?:than|to))\b/gi,
    /\b(what really matters (?:is|here))\b/gi,
    /\b(I'm (?:choosing|prioritizing|deciding) to)\b/gi,
  ];
  const valueScore = valuePatterns.some(p => p.test(input)) ? 0.4 : 0;

  // Belief revision (0.3)
  const revisionPatterns = [
    /\b(I used to (?:think|believe).+now I (?:see|realize|know))\b/gi,
    /\b(I'm realizing|I now see)\b/gi,
  ];
  const responsibilityScore = revisionPatterns.some(p => p.test(input)) ? 0.3 : 0;

  // Trade-off thinking (0.3)
  const tradeoffWords = ['trade-off', 'worth it', 'the cost', 'the benefit', 'sacrifice'];
  const tradeoffMatches = tradeoffWords.filter(w =>
    input.toLowerCase().includes(w)
  ).length;
  const tradeoffScore = Math.min(tradeoffMatches * 0.15, 0.3);

  score = valueScore + responsibilityScore + tradeoffScore;
  return Math.min(score, 1.0);
}

function scoreLevel6_Create(input: string): number {
  let score = 0;

  // Design/creation verbs (0.4)
  const designPatterns = [
    /\b(I (?:created|designed|made|built) (?:a|an|my own))\b/gi,
    /\b(I call it|I started|I came up with)\b/gi,
    /\b(my (?:practice|ritual|method|approach) is)\b/gi,
  ];
  const designScore = designPatterns.some(p => p.test(input)) ? 0.4 : 0;

  // Original practice naming (0.3)
  const practicePatterns = [
    /\b(I call it|my ritual|my practice)\b/gi,
  ];
  const practiceScore = practicePatterns.some(p => p.test(input)) ? 0.3 : 0;

  // Service to others (0.3)
  const servicePatterns = [
    /\b(I (?:shared|taught|showed) (?:this with|my|others))\b/gi,
    /\b((?:others|people|my group) (?:are trying|could use|might benefit))\b/gi,
    /\b((?:what if|imagine if) we)\b/gi,
  ];
  const forOthersScore = servicePatterns.some(p => p.test(input)) ? 0.3 : 0;

  score = designScore + practiceScore + forOthersScore;
  return Math.min(score, 1.0);
}

/**
 * Main detection function with sophisticated multi-level scoring
 * @throws Never - returns safe fallback on error
 */
export function detectBloomLevel(
  input: string,
  options: BloomDetectionOptions = {}
): BloomDetection {
  try {
    // Input validation: ensure we have a string to work with
    const safeInput = (input || '').toString().trim();

    if (!safeInput) {
      // Empty input: return safe default (Level 2: UNDERSTAND)
      return {
        level: 'UNDERSTAND',
        numericLevel: 2,
        score: 0.0,
        rationale: ['Input was empty or invalid'],
        scaffoldingPrompt: getScaffoldingPrompt('UNDERSTAND'),
      };
    }

    // Score all six levels
    const scores = {
      REMEMBER: scoreLevel1_Remember(safeInput),
      UNDERSTAND: scoreLevel2_Understand(safeInput),
      APPLY: scoreLevel3_Apply(safeInput),
      ANALYZE: scoreLevel4_Analyze(safeInput),
      EVALUATE: scoreLevel5_Evaluate(safeInput),
      CREATE: scoreLevel6_Create(safeInput),
    };

  // Apply hierarchical logic: higher levels subsume lower ones
  // If L6 signals present, it implies L3-L5 were already achieved
  if (scores.CREATE > 0.5) {
    scores.APPLY = Math.max(scores.APPLY, 0.6);
    scores.ANALYZE = Math.max(scores.ANALYZE, 0.5);
  }
  if (scores.EVALUATE > 0.5) {
    scores.ANALYZE = Math.max(scores.ANALYZE, 0.6);
    scores.APPLY = Math.max(scores.APPLY, 0.5);
  }
  if (scores.ANALYZE > 0.5) {
    scores.APPLY = Math.max(scores.APPLY, 0.6);
  }

  // Determine primary level (highest score)
  const levelEntries = Object.entries(scores) as [BloomLevel, number][];
  levelEntries.sort((a, b) => b[1] - a[1]);

  const primaryLevel = levelEntries[0][0];
  const primaryScore = levelEntries[0][1];

  // Build rationale
  const rationale: string[] = [];

  if (scores.REMEMBER > 0.3) {
    rationale.push('Quoting authorities or using slogans without integration');
  }
  if (scores.UNDERSTAND > 0.3) {
    rationale.push('Explaining concepts theoretically');
  }
  if (scores.APPLY > 0.3) {
    rationale.push('Applying ideas in concrete life situations');
  }
  if (scores.ANALYZE > 0.3) {
    rationale.push('Recognizing patterns or comparing structures');
  }
  if (scores.EVALUATE > 0.3) {
    rationale.push('Making value judgments or prioritizing');
  }
  if (scores.CREATE > 0.3) {
    rationale.push('Designing original practices or serving others');
  }

  if (rationale.length === 0) {
    rationale.push('Input too short or ambiguous for clear classification');
  }

  // Map to numeric level
  const numericLevelMap: Record<BloomLevel, 1 | 2 | 3 | 4 | 5 | 6> = {
    REMEMBER: 1,
    UNDERSTAND: 2,
    APPLY: 3,
    ANALYZE: 4,
    EVALUATE: 5,
    CREATE: 6,
  };

  // Generate scaffolding prompt for next level
  const scaffoldingPrompt = getScaffoldingPrompt(primaryLevel);

  return {
    level: primaryLevel,
    numericLevel: numericLevelMap[primaryLevel],
    score: primaryScore,
    rationale,
    scaffoldingPrompt,
  };
  } catch (error) {
    // Fail-safe: never crash, return safe default
    console.error('[Dialectical Scaffold] Detection error:', error);
    return {
      level: 'UNDERSTAND',
      numericLevel: 2,
      score: 0.0,
      rationale: ['Error during detection - defaulted to Level 2'],
      scaffoldingPrompt: getScaffoldingPrompt('UNDERSTAND'),
    };
  }
}

/**
 * Scaffolding prompts for each level transition
 */
export const ScaffoldingPrompts = {
  'REMEMBER→UNDERSTAND': [
    "In your own words—not the book's or the teacher's—what does this mean to you?",
    "How would you explain this to someone who's never heard of it?",
    "What's your personal understanding of this concept?",
  ],

  'UNDERSTAND→APPLY': [
    "Can you give me a recent moment where you actually tried this?",
    "Tell me about a specific time this showed up in your life.",
    "What happened when you used this idea in a real situation?",
  ],

  'APPLY→ANALYZE': [
    "When you look at a few of these situations together, what patterns do you notice?",
    "How is this experience different from other times you've felt this way?",
    "What's the structure underneath these events?",
  ],

  'ANALYZE→EVALUATE': [
    "Given these patterns you're seeing, which one feels most important to work with—and why?",
    "What do you value most in this situation? What takes priority?",
    "If you had to choose, what matters more here?",
  ],

  'EVALUATE→CREATE': [
    "If you were designing a new way of handling this, what would it look like?",
    "What practice could you create that would serve both you and others?",
    "How might you turn this insight into something others could use?",
  ],
};

/**
 * Get scaffolding prompt for current→next level transition
 */
export function getScaffoldingPrompt(currentLevel: BloomLevel): string {
  const nextLevelMap: Record<BloomLevel, BloomLevel | null> = {
    REMEMBER: 'UNDERSTAND',
    UNDERSTAND: 'APPLY',
    APPLY: 'ANALYZE',
    ANALYZE: 'EVALUATE',
    EVALUATE: 'CREATE',
    CREATE: null,
  };

  const nextLevel = nextLevelMap[currentLevel];
  if (!nextLevel) return "What's the next edge of understanding for you here?";

  const key = `${currentLevel}→${nextLevel}` as keyof typeof ScaffoldingPrompts;
  const prompts = ScaffoldingPrompts[key];
  if (!prompts) return "What's the next edge of understanding for you here?";

  // Return random prompt from array for variety
  return prompts[Math.floor(Math.random() * prompts.length)];
}
