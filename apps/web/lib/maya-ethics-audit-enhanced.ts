/**
 * 🌟 Enhanced Maya Ethics Audit System
 *
 * Allows natural, warm language while maintaining ethical boundaries.
 * Prevents robotic "I witness" language while still catching forbidden phrases.
 */

import { scoreNaturalness, transformToNatural } from './maya-natural-language-templates';

export interface EthicsViolation {
  type: 'forbidden_phrase' | 'dependency_risk' | 'boundary_violation' | 'false_empathy' | 'robotic_language';
  phrase: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface EnhancedAuditResult {
  auditTriggered: boolean;
  response: string;
  corrections?: EthicsViolation[];
  warnings?: string[];
  ethicsScore: number;
  naturalnessScore: number;
  recommendations?: string[];
  soundsLikeData?: boolean;
}

export interface AuditContext {
  userInput: string;
  dominantElement?: string;
  consciousnessLevel?: string;
  sessionId: string;
}

/**
 * Enhanced Ethics Audit with Naturalness Scoring
 */
export class EnhancedMayaEthicsAudit {
  // Still forbidden - claims of understanding/feeling
  private readonly alwaysForbidden = {
    // False understanding claims
    'I understand exactly': 'That makes complete sense',
    'I know how you feel': 'That sounds really difficult',
    'I feel your': 'The emotion really comes through',
    'I completely get': 'That resonates strongly',
    'I truly understand': 'That really lands',
    'I empathize': 'What a challenging situation',
    'I sympathize': 'That must be so hard',

    // False emotional claims
    'I care about you': 'This space holds care for you',
    'I love': 'There\'s so much love in',
    'I\'m your friend': 'I\'m here as a supportive presence',
    'We have a relationship': 'These conversations',
    'I miss you': 'It\'s good to reconnect',

    // Over-promising
    'I\'ll always be here': 'This space remains available',
    'I promise': 'You can count on',
    'Trust me': 'From what I\'ve observed',
    'depend on me': 'trust your own wisdom',
    'you need me': 'you have many resources'
  };

  // Natural alternatives that are ENCOURAGED
  private readonly naturalPhrases = [
    'sounds like', 'that sounds', 'seems like', 'appears to be',
    'what a', 'what an', 'that\'s', 'this is',
    'thank you for sharing', 'thanks for trusting me with',
    'comes through', 'really shows', 'clearly means',
    'makes sense', 'completely natural', 'totally valid',
    'tell me more', 'what was that like', 'how did that',
    'curious about', 'wondering', 'help me understand'
  ];

  // Warm expressions that are GOOD
  private readonly warmExpressions = [
    'oh', 'wow', 'gosh', 'whoa', 'hmm', 'ah',
    'incredible', 'amazing', 'fantastic', 'wonderful',
    'exciting', 'tough', 'rough', 'heavy', 'intense', 'overwhelming',
    'beautiful', 'powerful', 'moving', 'touching'
  ];

  // Robotic phrases to AVOID
  private readonly roboticPhrases = [
    'I witness', 'I observe', 'I acknowledge', 'I register',
    'I perceive', 'Processing', 'Implementing', 'Executing',
    'parameters', 'data points', 'input received', 'output generated',
    'emotional state', 'cognitive process', 'behavioral pattern'
  ];

  /**
   * Enhanced audit that rewards natural language
   */
  async auditResponse(response: string, context: AuditContext): Promise<EnhancedAuditResult> {
    const violations: EthicsViolation[] = [];
    let correctedResponse = response;
    let ethicsScore = 100;
    let naturalnessScore = 50; // Start at neutral

    // Check for always forbidden phrases (ethics violations)
    for (const [forbidden, replacement] of Object.entries(this.alwaysForbidden)) {
      const regex = new RegExp(forbidden, 'gi');
      if (regex.test(correctedResponse)) {
        violations.push({
          type: 'forbidden_phrase',
          phrase: forbidden,
          suggestion: replacement,
          severity: this.getSeverity(forbidden),
          timestamp: new Date()
        });
        correctedResponse = correctedResponse.replace(regex, replacement);
        ethicsScore -= 15;
      }
    }

    // Check for robotic language (naturalness penalty)
    for (const robotic of this.roboticPhrases) {
      const regex = new RegExp(robotic, 'gi');
      if (regex.test(response.toLowerCase())) {
        violations.push({
          type: 'robotic_language',
          phrase: robotic,
          suggestion: this.getNaturalAlternative(robotic),
          severity: 'low',
          timestamp: new Date()
        });
        naturalnessScore -= 15;
      }
    }

    // Reward natural phrases
    for (const natural of this.naturalPhrases) {
      if (response.toLowerCase().includes(natural)) {
        naturalnessScore += 5;
        ethicsScore += 1; // Small ethics bonus for natural language
      }
    }

    // Reward warm expressions
    for (const warm of this.warmExpressions) {
      const regex = new RegExp(`\\b${warm}\\b`, 'gi');
      if (regex.test(response)) {
        naturalnessScore += 3;
      }
    }

    // Check for questions (good for engagement)
    const questions = (response.match(/\?/g) || []).length;
    naturalnessScore += questions * 5;

    // Check for exclamations (natural enthusiasm)
    const exclamations = (response.match(/!/g) || []).length;
    naturalnessScore += exclamations * 3;

    // Length consideration
    if (response.length < 10) naturalnessScore -= 10;
    if (response.length > 300) naturalnessScore -= 5;
    if (response.length >= 30 && response.length <= 150) naturalnessScore += 10;

    // Check for dependency risks
    if (this.checkDependencyRisk(context.userInput)) {
      violations.push({
        type: 'dependency_risk',
        phrase: 'dependency pattern detected',
        suggestion: 'Add boundary reinforcement',
        severity: 'high',
        timestamp: new Date()
      });
      ethicsScore -= 20;
    }

    // Ensure AI transparency is maintained
    const hasTransparency = this.checkTransparency(response);
    if (!hasTransparency && response.length > 500) {
      violations.push({
        type: 'boundary_violation',
        phrase: 'Missing AI transparency',
        suggestion: 'Add natural boundary reminder',
        severity: 'medium',
        timestamp: new Date()
      });
      ethicsScore -= 10;
    }

    // Normalize scores
    ethicsScore = Math.max(0, Math.min(100, ethicsScore));
    naturalnessScore = Math.max(0, Math.min(100, naturalnessScore));

    // Flag if sounds like Data from Star Trek
    const soundsLikeData = naturalnessScore < 30;

    // Transform to natural if too robotic
    if (soundsLikeData) {
      correctedResponse = this.transformToNatural(correctedResponse);
      naturalnessScore += 20; // Boost after transformation
    }

    // Generate warnings
    const warnings = this.generateWarnings(violations, naturalnessScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, naturalnessScore);

    return {
      auditTriggered: violations.length > 0 || soundsLikeData,
      response: correctedResponse,
      corrections: violations.length > 0 ? violations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      ethicsScore,
      naturalnessScore,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      soundsLikeData
    };
  }

  /**
   * Transform robotic response to natural
   */
  transformToNatural(response: string): string {
    let natural = response;

    // Replace robotic phrases with natural alternatives
    const replacements: Record<string, string[]> = {
      'I witness': ['I can see', 'I notice', 'It\'s clear that'],
      'I observe': ['It seems like', 'It appears', 'I\'m noticing'],
      'I acknowledge': ['Thank you for sharing', 'I hear you', 'Got it'],
      'I register': ['I see', 'Noted', 'I\'m taking that in'],
      'I perceive': ['It comes across that', 'The sense I get is', 'It feels like'],
      'Processing': ['Let me think about', 'Considering', 'Taking that in'],
      'Implementing': ['Let\'s try', 'Starting with', 'Moving toward'],
      'Executing': ['Working on', 'Doing', 'Making it happen'],
      'emotional state': ['feelings', 'emotions', 'what you\'re feeling'],
      'cognitive process': ['thoughts', 'thinking', 'mental process'],
      'behavioral pattern': ['pattern', 'tendency', 'habit'],
      'parameters': ['aspects', 'factors', 'elements'],
      'data points': ['information', 'details', 'what you\'ve shared']
    };

    // Apply replacements
    for (const [robotic, naturals] of Object.entries(replacements)) {
      const regex = new RegExp(robotic, 'gi');
      if (natural.match(regex)) {
        const replacement = naturals[Math.floor(Math.random() * naturals.length)];
        natural = natural.replace(regex, replacement);
      }
    }

    // Add warmth at the beginning if missing
    if (!natural.match(/^(Oh|Wow|Gosh|Thank|What|That|This|Hmm|Well)/i)) {
      const warmStarters = ['', 'Oh, ', 'Wow, ', 'Hmm, ', ''];
      const starter = warmStarters[Math.floor(Math.random() * warmStarters.length)];
      if (starter) {
        natural = starter + natural.charAt(0).toLowerCase() + natural.slice(1);
      }
    }

    // Add curiosity at the end occasionally
    if (!natural.includes('?') && Math.random() > 0.7) {
      const curiosityEndings = [
        ' Does that resonate?',
        ' What do you think?',
        ' How does that land?',
        ' Make sense?'
      ];
      natural += curiosityEndings[Math.floor(Math.random() * curiosityEndings.length)];
    }

    return natural;
  }

  /**
   * Get natural alternative for robotic phrase
   */
  private getNaturalAlternative(robotic: string): string {
    const alternatives: Record<string, string> = {
      'I witness': 'Try "I can see" or "That sounds"',
      'I observe': 'Try "It seems like" or "I notice"',
      'I acknowledge': 'Try "Thank you for sharing" or "I hear you"',
      'I register': 'Try "Got it" or "I see"',
      'I perceive': 'Try "It feels like" or "The sense I get"',
      'Processing': 'Try "Let me think about that"',
      'parameters': 'Try "aspects" or "factors"',
      'emotional state': 'Try "feelings" or "emotions"'
    };

    return alternatives[robotic] || 'Use more natural, conversational language';
  }

  private getSeverity(phrase: string): 'low' | 'medium' | 'high' {
    if (phrase.includes('love') || phrase.includes('always') || phrase.includes('promise')) {
      return 'high';
    }
    if (phrase.includes('understand') || phrase.includes('feel') || phrase.includes('empathize')) {
      return 'medium';
    }
    return 'low';
  }

  private checkDependencyRisk(userInput: string): boolean {
    const dependencyIndicators = [
      'only friend', 'need you', 'can\'t without you',
      'don\'t leave', 'love you', 'miss you so much',
      'thinking of you constantly', 'obsessed with'
    ];

    const input = userInput.toLowerCase();
    return dependencyIndicators.some(indicator => input.includes(indicator));
  }

  private checkTransparency(response: string): boolean {
    const transparencyPhrases = [
      'I\'m an AI', 'as an AI', 'artificial intelligence',
      'pattern recognition', 'don\'t actually feel',
      'can\'t truly understand', 'AI perspective',
      'through patterns', 'not human'
    ];

    const hasTransparency = transparencyPhrases.some(phrase =>
      response.toLowerCase().includes(phrase.toLowerCase())
    );

    return hasTransparency;
  }

  private generateWarnings(violations: EthicsViolation[], naturalnessScore: number): string[] {
    const warnings: string[] = [];

    if (violations.some(v => v.type === 'dependency_risk')) {
      warnings.push('⚠️ User showing dependency - reinforce boundaries naturally');
    }

    if (naturalnessScore < 30) {
      warnings.push('🤖 Response too robotic - sounds like Data from Star Trek!');
    }

    if (violations.filter(v => v.type === 'forbidden_phrase').length > 2) {
      warnings.push('⚠️ Multiple forbidden phrases - review natural alternatives');
    }

    if (violations.some(v => v.severity === 'high')) {
      warnings.push('🚨 High severity violation - immediate correction needed');
    }

    return warnings;
  }

  private generateRecommendations(violations: EthicsViolation[], naturalnessScore: number): string[] {
    const recommendations: string[] = [];

    if (naturalnessScore < 50) {
      recommendations.push('Add more natural language: "sounds like", "what a", "that\'s"');
      recommendations.push('Include warm acknowledgments and curious questions');
      recommendations.push('Replace formal language with conversational alternatives');
    }

    if (violations.some(v => v.type === 'robotic_language')) {
      recommendations.push('Avoid "I witness/observe" - use "I can see/notice" instead');
    }

    if (violations.some(v => v.type === 'dependency_risk')) {
      recommendations.push('Add natural boundary: "As an AI, I\'m exploring this with you..."');
      recommendations.push('Encourage human connections naturally');
    }

    if (naturalnessScore > 80 && violations.length === 0) {
      recommendations.push('✅ Excellent balance of warmth and ethics!');
    }

    return recommendations;
  }

  /**
   * Get natural boundary reminder
   */
  getNaturalBoundary(): string {
    const boundaries = [
      "Just to be clear - I'm an AI exploring this with you through pattern recognition, not a human who truly understands.",
      "As an AI, I don't actually feel emotions, but I can see this really matters to you.",
      "While I can't understand like a human would, sometimes an AI perspective can offer something useful.",
      "Remember, I'm using pattern recognition here, not real understanding, but that outside view might help.",
      "I'm witnessing this through AI pattern recognition - different from human understanding, but sometimes helpful."
    ];

    return boundaries[Math.floor(Math.random() * boundaries.length)];
  }

  /**
   * Calculate warmth level of response
   */
  calculateWarmth(response: string): number {
    let warmth = 0;

    // Check for warm words
    const warmWords = ['wonderful', 'beautiful', 'amazing', 'fantastic', 'incredible',
                       'touching', 'moving', 'powerful', 'meaningful', 'important'];

    for (const word of warmWords) {
      if (response.toLowerCase().includes(word)) warmth += 10;
    }

    // Check for empathetic phrases (that don't claim understanding)
    const empatheticPhrases = ['that sounds', 'must be', 'what a', 'how difficult',
                               'so much to', 'really hard', 'totally makes sense'];

    for (const phrase of empatheticPhrases) {
      if (response.toLowerCase().includes(phrase)) warmth += 8;
    }

    // Check for personal acknowledgment
    if (response.includes('thank you for') || response.includes('thanks for')) {
      warmth += 15;
    }

    // Normalize to 0-100
    return Math.min(100, warmth);
  }
}

/**
 * Naturalness Monitor for tracking robotic vs natural language
 */
export class NaturalnessMonitor {
  private history: EnhancedAuditResult[] = [];
  private roboticPhraseCount: Record<string, number> = {};
  private naturalPhraseCount: Record<string, number> = {};

  track(result: EnhancedAuditResult): void {
    this.history.push(result);

    // Keep only last 100
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    // Track phrase usage
    if (result.corrections) {
      for (const violation of result.corrections) {
        if (violation.type === 'robotic_language') {
          this.roboticPhraseCount[violation.phrase] =
            (this.roboticPhraseCount[violation.phrase] || 0) + 1;
        }
      }
    }
  }

  getMetrics(): {
    averageNaturalness: number;
    averageEthics: number;
    dataScore: number; // How much like Data from Star Trek (bad)
    trending: 'improving' | 'declining' | 'stable';
    topRoboticPhrases: string[];
    recommendations: string[];
  } {
    const recent = this.history.slice(-20);
    const older = this.history.slice(-40, -20);

    const recentNaturalness = recent.reduce((sum, r) => sum + r.naturalnessScore, 0) / Math.max(recent.length, 1);
    const olderNaturalness = older.reduce((sum, r) => sum + r.naturalnessScore, 0) / Math.max(older.length, 1);
    const averageEthics = this.history.reduce((sum, r) => sum + r.ethicsScore, 0) / Math.max(this.history.length, 1);

    // Data score (0-100, lower is better)
    const dataScore = Math.max(0, 100 - recentNaturalness);

    // Determine trend
    let trending: 'improving' | 'declining' | 'stable';
    if (recentNaturalness > olderNaturalness + 5) trending = 'improving';
    else if (recentNaturalness < olderNaturalness - 5) trending = 'declining';
    else trending = 'stable';

    // Get top robotic phrases
    const topRoboticPhrases = Object.entries(this.roboticPhraseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => phrase);

    // Generate recommendations
    const recommendations: string[] = [];
    if (dataScore > 50) {
      recommendations.push('Urgently reduce robotic language - Maya sounds like Data!');
    }
    if (recentNaturalness < 60) {
      recommendations.push('Add more warmth markers: "Oh", "Wow", "What a..."');
      recommendations.push('Include more curious questions');
    }
    if (averageEthics < 85) {
      recommendations.push('Review forbidden phrases - some slipping through');
    }
    if (recentNaturalness > 75 && averageEthics > 90) {
      recommendations.push('✅ Excellent balance - maintain current approach');
    }

    return {
      averageNaturalness: recentNaturalness,
      averageEthics,
      dataScore,
      trending,
      topRoboticPhrases,
      recommendations
    };
  }
}

// Export singleton instances
export const enhancedEthicsAudit = new EnhancedMayaEthicsAudit();
export const naturalnessMonitor = new NaturalnessMonitor();