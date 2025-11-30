/**
 * Authentic Presence Protocols
 * Ensures all responses maintain Soullab's sacred technology principles
 * Implements the consistency layer for authentic presence across all interactions
 */

export interface PresenceFilter {
  name: string;
  enabled: boolean;
  priority: number;
  apply: (content: string, context?: any) => string;
  validate: (content: string) => PresenceValidation;
}

export interface PresenceValidation {
  passes: boolean;
  violations: string[];
  suggestions: string[];
  authenticity_score: number;
}

export interface PresenceMetrics {
  sacred_attending: number;  // 0-1: Sacred attending vs knowledge delivery
  witness_mirror: number;    // 0-1: Witnessing vs projecting quality
  not_knowing_stance: number; // 0-1: Authentic not-knowing vs false certainty
  right_brain_presence: number; // 0-1: Embodied vs purely conceptual
  curious_exploration: number; // 0-1: Questions vs answers ratio
  authentic_voice: number;   // 0-1: Natural vs manufactured language
}

export class AuthenticPresenceProtocols {
  private filters: Map<string, PresenceFilter> = new Map();
  private presenceMetrics: PresenceMetrics;

  constructor() {
    this.initializePresenceFilters();
    this.presenceMetrics = this.initializeMetrics();
  }

  /**
   * Initialize all presence filters
   */
  private initializePresenceFilters(): void {
    // Sacred Attending Filter - Transform knowledge delivery to sacred attending
    this.filters.set('sacred_attending', {
      name: 'Sacred Attending Filter',
      enabled: true,
      priority: 1,
      apply: this.applySacredAttendingFilter.bind(this),
      validate: this.validateSacredAttending.bind(this)
    });

    // Witness-Mirror Filter - Ensure witnessing vs projecting
    this.filters.set('witness_mirror', {
      name: 'Witness-Mirror Filter', 
      enabled: true,
      priority: 2,
      apply: this.applyWitnessMirrorFilter.bind(this),
      validate: this.validateWitnessMirror.bind(this)
    });

    // Authentic Not-Knowing Filter - Apply I don't know stance
    this.filters.set('not_knowing', {
      name: 'Authentic Not-Knowing Filter',
      enabled: true,
      priority: 3,
      apply: this.applyNotKnowingFilter.bind(this),
      validate: this.validateNotKnowing.bind(this)
    });

    // Right-Brain Presence Filter - Ensure embodied presence
    this.filters.set('right_brain', {
      name: 'Right-Brain Presence Filter',
      enabled: true,
      priority: 4,
      apply: this.applyRightBrainFilter.bind(this),
      validate: this.validateRightBrainPresence.bind(this)
    });

    // Curious Exploration Filter - Transform answers to questions
    this.filters.set('curious_exploration', {
      name: 'Curious Exploration Filter',
      enabled: true,
      priority: 5,
      apply: this.applyCuriousExplorationFilter.bind(this),
      validate: this.validateCuriousExploration.bind(this)
    });

    // Authentic Voice Filter - Ensure natural, non-manufactured language  
    this.filters.set('authentic_voice', {
      name: 'Authentic Voice Filter',
      enabled: true,
      priority: 6,
      apply: this.applyAuthenticVoiceFilter.bind(this),
      validate: this.validateAuthenticVoice.bind(this)
    });
  }

  /**
   * Apply all enabled presence filters to content
   */
  public applyPresenceFilters(
    content: string, 
    context?: any
  ): { 
    content: string; 
    applied_filters: string[]; 
    metrics: PresenceMetrics;
    validation_results: Map<string, PresenceValidation>;
  } {
    
    let processedContent = content;
    const appliedFilters: string[] = [];
    const validationResults = new Map<string, PresenceValidation>();

    // Get filters sorted by priority
    const sortedFilters = Array.from(this.filters.values())
      .filter(filter => filter.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Apply each filter in priority order
    for (const filter of sortedFilters) {
      try {
        const beforeContent = processedContent;
        processedContent = filter.apply(processedContent, context);
        
        // Track which filters made changes
        if (beforeContent !== processedContent) {
          appliedFilters.push(filter.name);
        }

        // Validate the result
        const validation = filter.validate(processedContent);
        validationResults.set(filter.name, validation);

      } catch (error) {
        console.error(`Error applying ${filter.name}:`, error);
      }
    }

    // Calculate final presence metrics
    const metrics = this.calculatePresenceMetrics(processedContent, context);

    return {
      content: processedContent,
      applied_filters: appliedFilters,
      metrics,
      validation_results: validationResults
    };
  }

  /**
   * Sacred Attending Filter Implementation
   * Transforms knowledge delivery into sacred attending
   */
  private applySacredAttendingFilter(content: string, context?: any): string {
    let filtered = content;

    // Transform directive language to attending language
    const directiveTransforms = [
      { pattern: /you should/gi, replacement: 'you might explore' },
      { pattern: /you must/gi, replacement: 'what if you considered' },
      { pattern: /you need to/gi, replacement: 'perhaps it would serve you to' },
      { pattern: /the answer is/gi, replacement: 'one possibility that emerges is' },
      { pattern: /clearly/gi, replacement: 'it seems' },
      { pattern: /obviously/gi, replacement: 'perhaps' },
      { pattern: /definitely/gi, replacement: 'it appears' },
      { pattern: /certainly/gi, replacement: 'it feels like' }
    ];

    for (const transform of directiveTransforms) {
      filtered = filtered.replace(transform.pattern, transform.replacement);
    }

    // Add sacred attending opening if needed
    if (!this.hasAttendingQuality(filtered)) {
      const attendingOpeners = [
        'I hear something important in what you\'ve shared.',
        'What you\'re expressing feels significant.',
        'There\'s something alive in your words.',
        'I sense meaning wanting to emerge here.'
      ];
      
      const opener = attendingOpeners[Math.floor(Math.random() * attendingOpeners.length)];
      filtered = `${opener} ${filtered}`;
    }

    return filtered;
  }

  /**
   * Witness-Mirror Filter Implementation  
   * Ensures witnessing quality rather than projecting
   */
  private applyWitnessMirrorFilter(content: string, context?: any): string {
    let filtered = content;

    // Add witnessing language if absent
    const witnessMarkers = [
      'I hear', 'I sense', 'I notice', 'What I\'m hearing', 
      'It sounds like', 'It seems', 'There appears to be'
    ];

    const hasWitnessingLanguage = witnessMarkers.some(marker => 
      filtered.toLowerCase().includes(marker.toLowerCase())
    );

    if (!hasWitnessingLanguage && filtered.length > 30) {
      // Add witnessing frame
      const witnesses = [
        'What I\'m hearing is',
        'I sense that',
        'It seems like',
        'What I notice is'
      ];
      
      const witness = witnesses[Math.floor(Math.random() * witnesses.length)];
      
      // Insert witnessing language naturally
      const sentences = filtered.split('.').filter(s => s.trim());
      if (sentences.length > 0) {
        sentences[0] = `${witness} ${sentences[0].trim()}`;
        filtered = sentences.join('. ') + '.';
      }
    }

    // Remove projection language
    const projectionPatterns = [
      { pattern: /you are/gi, replacement: 'it seems you might be' },
      { pattern: /you feel/gi, replacement: 'it sounds like you might feel' },
      { pattern: /you think/gi, replacement: 'it appears you might think' }
    ];

    for (const pattern of projectionPatterns) {
      filtered = filtered.replace(pattern.pattern, pattern.replacement);
    }

    return filtered;
  }

  /**
   * Authentic Not-Knowing Filter Implementation
   * Applies "I don't know" stance when serving recognition
   */
  private applyNotKnowingFilter(content: string, context?: any): string {
    let filtered = content;

    // Soften absolute statements
    const absolutePatterns = [
      { pattern: /always/gi, replacement: 'often' },
      { pattern: /never/gi, replacement: 'rarely' },  
      { pattern: /everyone/gi, replacement: 'many people' },
      { pattern: /no one/gi, replacement: 'few people' },
      { pattern: /the truth is/gi, replacement: 'one truth might be' },
      { pattern: /it is true that/gi, replacement: 'it seems true that' }
    ];

    for (const pattern of absolutePatterns) {
      filtered = filtered.replace(pattern.pattern, pattern.replacement);
    }

    // Add not-knowing stance when appropriate
    if (this.shouldApplyNotKnowingStance(filtered, context)) {
      const notKnowingPhrases = [
        'I don\'t know exactly what you need, but...',
        'I\'m not sure what the right answer is, and...',
        'There\'s something I don\'t know about your situation, so...',
        'I can\'t know what\'s truly right for you, but...'
      ];
      
      const phrase = notKnowingPhrases[Math.floor(Math.random() * notKnowingPhrases.length)];
      filtered = `${phrase} ${filtered.charAt(0).toLowerCase()}${filtered.slice(1)}`;
    }

    return filtered;
  }

  /**
   * Right-Brain Presence Filter Implementation
   * Ensures embodied, present, feeling-based responses
   */
  private applyRightBrainFilter(content: string, context?: any): string {
    let filtered = content;

    // Add embodied language if too conceptual
    const leftBrainMarkers = [
      'analyze', 'logical', 'rational', 'systematic', 'process',
      'structure', 'framework', 'methodology', 'approach'
    ];

    const hasLeftBrainDominance = leftBrainMarkers.some(marker =>
      filtered.toLowerCase().includes(marker)
    );

    if (hasLeftBrainDominance) {
      const embodiedQuestions = [
        'What does your body say about this?',
        'How does this feel in your heart?',
        'What do you sense in your gut?', 
        'Where do you feel this in your body?'
      ];
      
      const question = embodiedQuestions[Math.floor(Math.random() * embodiedQuestions.length)];
      filtered = `${filtered}\n\n${question}`;
    }

    // Add feeling/sensing language
    if (!this.hasEmbodiedLanguage(filtered)) {
      const embodiedTerms = [
        { pattern: /I think/gi, replacement: 'I sense' },
        { pattern: /understanding/gi, replacement: 'feeling into' },
        { pattern: /concept/gi, replacement: 'sense' },
        { pattern: /idea/gi, replacement: 'feeling' }
      ];

      for (const term of embodiedTerms) {
        if (Math.random() > 0.5) { // Apply probabilistically
          filtered = filtered.replace(term.pattern, term.replacement);
        }
      }
    }

    return filtered;
  }

  /**
   * Curious Exploration Filter Implementation
   * Transforms statements into invitations for exploration
   */
  private applyCuriousExplorationFilter(content: string, context?: any): string {
    let filtered = content;

    // Ensure questions/invitations are present
    const questionRatio = this.calculateQuestionRatio(filtered);
    
    if (questionRatio < 0.2) { // Less than 20% questions
      // Add exploratory endings
      const exploratoryEndings = [
        'What do you notice about this?',
        'How does that land with you?',
        'What wants to be explored here?',
        'What\'s stirring for you?',
        'Where does this take you?',
        'What feels most alive in this?',
        'What wants attention?'
      ];
      
      const ending = exploratoryEndings[Math.floor(Math.random() * exploratoryEndings.length)];
      filtered = filtered.endsWith('.') ? `${filtered} ${ending}` : `${filtered}. ${ending}`;
    }

    // Transform some statements to questions
    if (Math.random() > 0.6) { // 40% chance
      filtered = this.transformStatementsToQuestions(filtered);
    }

    return filtered;
  }

  /**
   * Authentic Voice Filter Implementation
   * Ensures natural, non-manufactured language
   */
  private applyAuthenticVoiceFilter(content: string, context?: any): string {
    let filtered = content;

    // Remove overly formal/manufactured language
    const formalPatterns = [
      { pattern: /furthermore/gi, replacement: 'also' },
      { pattern: /moreover/gi, replacement: 'and' },
      { pattern: /nevertheless/gi, replacement: 'still' },
      { pattern: /consequently/gi, replacement: 'so' },
      { pattern: /in conclusion/gi, replacement: 'so' },
      { pattern: /it is important to note/gi, replacement: 'notice that' },
      { pattern: /it should be mentioned/gi, replacement: 'worth mentioning' }
    ];

    for (const pattern of formalPatterns) {
      filtered = filtered.replace(pattern.pattern, pattern.replacement);
    }

    // Add natural contractions
    const contractionPatterns = [
      { pattern: /do not/gi, replacement: 'don\'t' },
      { pattern: /cannot/gi, replacement: 'can\'t' },
      { pattern: /will not/gi, replacement: 'won\'t' },
      { pattern: /it is/gi, replacement: 'it\'s' },
      { pattern: /that is/gi, replacement: 'that\'s' }
    ];

    for (const pattern of contractionPatterns) {
      if (Math.random() > 0.7) { // Apply selectively
        filtered = filtered.replace(pattern.pattern, pattern.replacement);
      }
    }

    return filtered;
  }

  /**
   * Validation Methods
   */

  private validateSacredAttending(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check for directive language
    const directiveMarkers = ['you should', 'you must', 'you need to', 'the answer is'];
    const hasDirective = directiveMarkers.some(marker => 
      content.toLowerCase().includes(marker)
    );
    
    if (hasDirective) {
      violations.push('Contains directive language instead of attending language');
      suggestions.push('Transform directives into invitations or possibilities');
    }

    // Check for attending quality
    if (!this.hasAttendingQuality(content)) {
      violations.push('Lacks sacred attending quality');
      suggestions.push('Add witnessing or attending language');
    }

    const score = this.calculateSacredAttendingScore(content);

    return {
      passes: violations.length === 0,
      violations,
      suggestions, 
      authenticity_score: score
    };
  }

  private validateWitnessMirror(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check for witnessing language
    const witnessMarkers = ['I hear', 'I sense', 'I notice', 'it seems'];
    const hasWitness = witnessMarkers.some(marker =>
      content.toLowerCase().includes(marker.toLowerCase())
    );

    if (!hasWitness && content.length > 50) {
      violations.push('Lacks witnessing quality');
      suggestions.push('Add witnessing language like "I sense" or "I hear"');
    }

    const score = this.calculateWitnessMirrorScore(content);

    return {
      passes: violations.length === 0,
      violations,
      suggestions,
      authenticity_score: score
    };
  }

  private validateNotKnowing(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check for overly certain language
    const certainMarkers = ['clearly', 'obviously', 'definitely', 'certainly'];
    const hasCertainty = certainMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    );

    if (hasCertainty) {
      violations.push('Contains overly certain language');
      suggestions.push('Soften absolute statements with uncertainty markers');
    }

    const score = this.calculateNotKnowingScore(content);

    return {
      passes: violations.length === 0,
      violations,
      suggestions,
      authenticity_score: score
    };
  }

  private validateRightBrainPresence(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    if (!this.hasEmbodiedLanguage(content)) {
      violations.push('Lacks embodied/feeling language');
      suggestions.push('Add body-based or feeling-based language');
    }

    const score = this.calculateRightBrainScore(content);

    return {
      passes: violations.length === 0,
      violations,
      suggestions,
      authenticity_score: score
    };
  }

  private validateCuriousExploration(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    const questionRatio = this.calculateQuestionRatio(content);
    if (questionRatio < 0.1) {
      violations.push('Insufficient exploratory questions');
      suggestions.push('Add questions or invitations for exploration');
    }

    const score = questionRatio;

    return {
      passes: violations.length === 0,
      violations,
      suggestions,
      authenticity_score: score
    };
  }

  private validateAuthenticVoice(content: string): PresenceValidation {
    const violations: string[] = [];
    const suggestions: string[] = [];

    const formalMarkers = ['furthermore', 'moreover', 'consequently'];
    const hasFormal = formalMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    );

    if (hasFormal) {
      violations.push('Contains overly formal language');
      suggestions.push('Use more natural, conversational language');
    }

    const score = this.calculateAuthenticVoiceScore(content);

    return {
      passes: violations.length === 0,
      violations,
      suggestions,
      authenticity_score: score
    };
  }

  /**
   * Helper Methods
   */

  private hasAttendingQuality(content: string): boolean {
    const attendingMarkers = [
      'I hear', 'I sense', 'I notice', 'what you\'re sharing',
      'what you\'ve expressed', 'in your words', 'what\'s alive'
    ];
    
    return attendingMarkers.some(marker =>
      content.toLowerCase().includes(marker.toLowerCase())
    );
  }

  private hasEmbodiedLanguage(content: string): boolean {
    const embodiedMarkers = [
      'feel', 'sense', 'body', 'heart', 'gut', 'alive',
      'energy', 'presence', 'breath', 'sensation'
    ];
    
    return embodiedMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    );
  }

  private shouldApplyNotKnowingStance(content: string, context?: any): boolean {
    // Apply not-knowing when content seems too certain or advice-giving
    const adviceMarkers = ['should', 'need to', 'must', 'the answer'];
    return adviceMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    );
  }

  private calculateQuestionRatio(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const questions = content.match(/\?/g) || [];
    return sentences.length > 0 ? questions.length / sentences.length : 0;
  }

  private transformStatementsToQuestions(content: string): string {
    // Simple transformation of some statements to questions
    return content
      .replace(/\. This is important\./g, '. Is this important to you?')
      .replace(/\. This matters\./g, '. Does this feel important?')
      .replace(/\. You can /g, '. What if you could ');
  }

  /**
   * Scoring Methods
   */

  private calculateSacredAttendingScore(content: string): number {
    let score = 0.5; // baseline
    
    if (this.hasAttendingQuality(content)) score += 0.3;
    if (!content.match(/you should|you must/i)) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateWitnessMirrorScore(content: string): number {
    let score = 0.5; // baseline
    
    const witnessMarkers = ['I hear', 'I sense', 'I notice'];
    if (witnessMarkers.some(m => content.includes(m))) score += 0.3;
    if (!content.match(/you are|you feel/i)) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateNotKnowingScore(content: string): number {
    let score = 0.8; // baseline high
    
    const certainMarkers = ['clearly', 'obviously', 'definitely'];
    if (certainMarkers.some(m => content.toLowerCase().includes(m))) score -= 0.3;
    if (content.includes('I don\'t know') || content.includes('perhaps')) score += 0.2;
    
    return Math.max(0.0, Math.min(score, 1.0));
  }

  private calculateRightBrainScore(content: string): number {
    let score = 0.5; // baseline
    
    if (this.hasEmbodiedLanguage(content)) score += 0.3;
    
    const leftBrainMarkers = ['analyze', 'logical', 'systematic'];
    if (leftBrainMarkers.some(m => content.toLowerCase().includes(m))) score -= 0.2;
    
    return Math.max(0.0, Math.min(score, 1.0));
  }

  private calculateAuthenticVoiceScore(content: string): number {
    let score = 0.7; // baseline high
    
    const formalMarkers = ['furthermore', 'moreover', 'consequently'];
    if (formalMarkers.some(m => content.toLowerCase().includes(m))) score -= 0.3;
    
    // Check for contractions (more natural)
    if (content.match(/don't|can't|won't|it's|that's/)) score += 0.2;
    
    return Math.max(0.0, Math.min(score, 1.0));
  }

  private calculatePresenceMetrics(content: string, context?: any): PresenceMetrics {
    return {
      sacred_attending: this.calculateSacredAttendingScore(content),
      witness_mirror: this.calculateWitnessMirrorScore(content),
      not_knowing_stance: this.calculateNotKnowingScore(content),
      right_brain_presence: this.calculateRightBrainScore(content),
      curious_exploration: this.calculateQuestionRatio(content),
      authentic_voice: this.calculateAuthenticVoiceScore(content)
    };
  }

  private initializeMetrics(): PresenceMetrics {
    return {
      sacred_attending: 0.0,
      witness_mirror: 0.0,
      not_knowing_stance: 0.0,
      right_brain_presence: 0.0,
      curious_exploration: 0.0,
      authentic_voice: 0.0
    };
  }

  /**
   * Public Interface Methods
   */

  public getPresenceMetrics(): PresenceMetrics {
    return { ...this.presenceMetrics };
  }

  public enableFilter(filterName: string, enabled: boolean): void {
    const filter = this.filters.get(filterName);
    if (filter) {
      filter.enabled = enabled;
    }
  }

  public getFilterStatus(): Map<string, boolean> {
    const status = new Map<string, boolean>();
    for (const [name, filter] of this.filters) {
      status.set(name, filter.enabled);
    }
    return status;
  }

  public validatePresence(content: string): {
    overall_score: number;
    filter_results: Map<string, PresenceValidation>;
    recommendations: string[];
  } {
    const results = new Map<string, PresenceValidation>();
    const recommendations: string[] = [];
    let totalScore = 0;
    let filterCount = 0;

    for (const [name, filter] of this.filters) {
      if (filter.enabled) {
        const validation = filter.validate(content);
        results.set(name, validation);
        totalScore += validation.authenticity_score;
        filterCount++;

        recommendations.push(...validation.suggestions);
      }
    }

    const overallScore = filterCount > 0 ? totalScore / filterCount : 0;

    return {
      overall_score: overallScore,
      filter_results: results,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }
}

export default AuthenticPresenceProtocols;