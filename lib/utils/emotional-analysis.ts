/**
 * Centralized emotional analysis utilities
 */

interface EmotionalPattern {
  pattern: RegExp;
  emotion: string;
  weight: number;
}

const EMOTIONAL_PATTERNS: EmotionalPattern[] = [
  // Curious
  { pattern: /\b(what|how|why|wonder|curious|explore|discover)\b/i, emotion: 'curious', weight: 1.0 },
  { pattern: /\b(tell me|show me|explain|understand)\b/i, emotion: 'curious', weight: 0.8 },

  // Seeking
  { pattern: /\b(help|need|want|looking|searching|seeking|find)\b/i, emotion: 'seeking', weight: 1.0 },
  { pattern: /\b(solution|answer|guidance|advice|support)\b/i, emotion: 'seeking', weight: 0.9 },

  // Reflective
  { pattern: /\b(think|feel|believe|remember|realize|reflect)\b/i, emotion: 'reflective', weight: 1.0 },
  { pattern: /\b(consider|contemplate|ponder|meditate)\b/i, emotion: 'reflective', weight: 0.9 },

  // Grounded
  { pattern: /\b(practical|specific|concrete|clear|direct|simple)\b/i, emotion: 'grounded', weight: 1.0 },
  { pattern: /\b(fact|data|evidence|proof|real)\b/i, emotion: 'grounded', weight: 0.8 },

  // Anxious
  { pattern: /\b(worried|anxious|nervous|stressed|overwhelmed)\b/i, emotion: 'anxious', weight: 1.0 },
  { pattern: /\b(concern|fear|panic|tense|pressure)\b/i, emotion: 'anxious', weight: 0.9 },

  // Excited
  { pattern: /\b(excited|amazing|wonderful|fantastic|great)\b/i, emotion: 'excited', weight: 1.0 },
  { pattern: /\b(awesome|brilliant|excellent|thrilled)\b/i, emotion: 'excited', weight: 0.9 },

  // Contemplative
  { pattern: /\b(meaning|purpose|soul|spirit|essence)\b/i, emotion: 'contemplative', weight: 1.0 },
  { pattern: /\b(deep|profound|wisdom|truth|understanding)\b/i, emotion: 'contemplative', weight: 0.9 },

  // Playful
  { pattern: /\b(fun|play|joke|laugh|silly|game)\b/i, emotion: 'playful', weight: 1.0 },
  { pattern: /\b(humor|funny|amusing|entertainment)\b/i, emotion: 'playful', weight: 0.8 },

  // Present
  { pattern: /\b(now|present|moment|here|aware|mindful)\b/i, emotion: 'present', weight: 1.0 },
  { pattern: /\b(breathe|ground|center|focus)\b/i, emotion: 'present', weight: 0.8 }
];

/**
 * Analyze emotional tone from text
 */
export function analyzeEmotionalTone(text: string): {
  primary: string;
  secondary?: string;
  scores: Map<string, number>;
} {
  const scores = new Map<string, number>();

  // Calculate scores for each emotion
  for (const { pattern, emotion, weight } of EMOTIONAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      const currentScore = scores.get(emotion) || 0;
      scores.set(emotion, currentScore + weight * matches.length);
    }
  }

  // Sort emotions by score
  const sortedEmotions = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);

  // Default to neutral if no emotions detected
  if (sortedEmotions.length === 0) {
    return {
      primary: 'neutral',
      scores: new Map([['neutral', 1.0]])
    };
  }

  const result: any = {
    primary: sortedEmotions[0][0],
    scores
  };

  // Add secondary emotion if significant
  if (sortedEmotions.length > 1 && sortedEmotions[1][1] > sortedEmotions[0][1] * 0.5) {
    result.secondary = sortedEmotions[1][0];
  }

  return result;
}

/**
 * Assess content depth from text
 */
export function assessContentDepth(text: string): number {
  let depth = 0.5; // Base depth

  // Philosophical/existential content
  if (/\b(meaning|purpose|consciousness|existence|soul|spirit)\b/i.test(text)) {
    depth += 0.2;
  }

  // Abstract concepts
  if (/\b(concept|theory|philosophy|abstract|metaphor)\b/i.test(text)) {
    depth += 0.15;
  }

  // Emotional depth
  if (/\b(feel|emotion|heart|vulnerable|authentic)\b/i.test(text)) {
    depth += 0.1;
  }

  // Length and complexity
  if (text.length > 200) depth += 0.1;
  if (text.split('.').length > 3) depth += 0.1;

  // Simple/direct questions reduce depth
  if (/^(what|where|when|who|how) (is|are|do)\b/i.test(text)) {
    depth -= 0.2;
  }

  // Short text reduces depth
  if (text.length < 50) depth -= 0.1;

  return Math.max(0, Math.min(1, depth));
}

/**
 * Extract topics from text
 */
export function extractTopics(text: string): string[] {
  const topics: string[] = [];

  const topicPatterns: Record<string, RegExp> = {
    work: /\b(work|job|career|profession|business|project)\b/i,
    relationships: /\b(relationship|partner|friend|family|love|connection)\b/i,
    health: /\b(health|wellness|body|exercise|sleep|energy)\b/i,
    growth: /\b(growth|learn|develop|improve|change|transform)\b/i,
    creativity: /\b(create|creative|art|music|write|design|imagine)\b/i,
    spirituality: /\b(spirit|soul|meditation|mindful|conscious|divine)\b/i,
    emotions: /\b(feel|emotion|mood|happy|sad|angry|afraid)\b/i,
    purpose: /\b(purpose|meaning|mission|calling|destiny|path)\b/i,
    presence: /\b(present|now|moment|aware|mindful|attention)\b/i,
    wisdom: /\b(wisdom|truth|understanding|insight|knowledge)\b/i
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(text)) {
      topics.push(topic);
    }
  }

  return topics;
}

/**
 * Detect emotional intensity
 */
export function detectEmotionalIntensity(text: string): number {
  let intensity = 0.5; // Base intensity

  // Exclamation marks
  const exclamations = (text.match(/!/g) || []).length;
  intensity += Math.min(exclamations * 0.1, 0.3);

  // Caps lock
  if (/\b[A-Z]{4,}\b/.test(text)) {
    intensity += 0.2;
  }

  // Intensity words
  if (/\b(very|extremely|totally|absolutely|completely)\b/i.test(text)) {
    intensity += 0.15;
  }

  // Emotional intensity markers
  if (/\b(desperate|urgent|critical|emergency|crisis)\b/i.test(text)) {
    intensity += 0.3;
  }

  // Calm markers reduce intensity
  if (/\b(calm|peaceful|relaxed|gentle|soft)\b/i.test(text)) {
    intensity -= 0.2;
  }

  return Math.max(0, Math.min(1, intensity));
}