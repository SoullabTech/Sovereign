// Technical Review: Deterministic Feature Activation Logic
// Addresses edge cases, conflicts, and debugging requirements

interface ActivationTrigger {
  name: string;
  weight: number;           // 0-1 influence on activation decision
  threshold: number;        // Minimum score to contribute
  conflictPriority: number; // Higher number = higher priority in conflicts
  debugInfo: string;       // Human-readable explanation
}

interface ActivationRule {
  feature: string;
  requiredScore: number;    // Total weighted score needed
  triggers: ActivationTrigger[];
  conflictsWith: string[];  // Features this conflicts with
  overriddenBy: string[];   // Features that disable this one
  gracefulAbandonment: boolean; // Can be abandoned mid-process
}

interface FeatureActivationRecord {
  feature: string;
  activatedAt: number;
  confidence: number;
  triggers: string[];
  outcome: 'completed' | 'abandoned' | 'conflicted' | 'interrupted';
  userSatisfaction?: number;
}

export class TechnicalActivationEngine {
  private activationHistory = new Map<string, FeatureActivationRecord[]>();

  // === DETERMINISTIC ACTIVATION RULES ===
  private readonly ACTIVATION_RULES: ActivationRule[] = [
    {
      feature: 'crisis_detection',
      requiredScore: 0.7,
      conflictsWith: ['looping_protocol', 'contemplative_space'], // Crisis overrides everything
      overriddenBy: [],
      gracefulAbandonment: false, // Never abandon crisis response
      triggers: [
        {
          name: 'crisis_keywords',
          weight: 0.8,
          threshold: 0.5,
          conflictPriority: 10, // Highest priority
          debugInfo: 'Direct crisis language detected'
        },
        {
          name: 'emotional_emergency',
          weight: 0.9,
          threshold: 0.6,
          conflictPriority: 10,
          debugInfo: 'High emotional distress indicators'
        }
      ]
    },
    {
      feature: 'clarification_protocol',
      requiredScore: 0.6,
      conflictsWith: ['contemplative_space'],
      overriddenBy: ['crisis_detection'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'explicit_clarification_request',
          weight: 0.9,
          threshold: 0.7,
          conflictPriority: 8,
          debugInfo: 'User directly asks for clarification'
        },
        {
          name: 'confusion_indicators',
          weight: 0.6,
          threshold: 0.5,
          conflictPriority: 6,
          debugInfo: 'Language suggests confusion or misunderstanding'
        }
      ]
    },
    {
      feature: 'emotional_processing',
      requiredScore: 0.5,
      conflictsWith: ['analytical_mode'],
      overriddenBy: ['crisis_detection', 'clarification_protocol'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'emotional_processing_need',
          weight: 0.8,
          threshold: 0.4,
          conflictPriority: 7,
          debugInfo: 'Emotional content needs processing space'
        },
        {
          name: 'vulnerability_expression',
          weight: 0.7,
          threshold: 0.3,
          conflictPriority: 7,
          debugInfo: 'User expressing vulnerability or emotional state'
        }
      ]
    },
    {
      feature: 'conceptual_exploration',
      requiredScore: 0.6,
      conflictsWith: ['crisis_detection'],
      overriddenBy: ['crisis_detection', 'clarification_protocol'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'conceptual_density',
          weight: 0.7,
          threshold: 0.5,
          conflictPriority: 5,
          debugInfo: 'Complex conceptual content detected'
        },
        {
          name: 'philosophical_inquiry',
          weight: 0.6,
          threshold: 0.4,
          conflictPriority: 5,
          debugInfo: 'Philosophical or abstract exploration'
        }
      ]
    },
    {
      feature: 'contemplative_space',
      requiredScore: 0.4,
      conflictsWith: ['crisis_detection', 'clarification_protocol'],
      overriddenBy: ['crisis_detection', 'clarification_protocol', 'looping_protocol'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'contemplative_readiness',
          weight: 0.8,
          threshold: 0.3,
          conflictPriority: 3,
          debugInfo: 'User ready for contemplative engagement'
        },
        {
          name: 'silence_comfort',
          weight: 0.6,
          threshold: 0.2,
          conflictPriority: 3,
          debugInfo: 'User comfortable with silence and space'
        }
      ]
    },
    {
      feature: 'looping_protocol',
      requiredScore: 0.8,
      conflictsWith: [],
      overriddenBy: ['crisis_detection'],
      gracefulAbandonment: false,
      triggers: [
        {
          name: 'repetitive_patterns',
          weight: 0.9,
          threshold: 0.7,
          conflictPriority: 9,
          debugInfo: 'Destructive repetitive patterns detected'
        },
        {
          name: 'stuck_indicators',
          weight: 0.8,
          threshold: 0.6,
          conflictPriority: 8,
          debugInfo: 'User appears stuck in unhelpful loops'
        }
      ]
    }
  ];

  // === DETERMINISTIC TRIGGER ANALYSIS ===
  analyzeActivationTriggers(
    input: string,
    conversationHistory: any[],
    userProfile: any
  ): Map<string, { score: number; triggers: string[]; debugInfo: string[] }> {

    const results = new Map();

    // Crisis Detection Triggers
    const crisisScore = this.analyzeCrisisTriggers(input);
    results.set('crisis_keywords', crisisScore);

    // Clarification Triggers
    const clarificationScore = this.analyzeClarificationTriggers(input, conversationHistory);
    results.set('explicit_clarification_request', clarificationScore);

    // Emotional Processing Triggers
    const emotionalScore = this.analyzeEmotionalTriggers(input);
    results.set('emotional_processing_need', emotionalScore);

    // Conceptual Complexity Triggers
    const conceptualScore = this.analyzeConceptualTriggers(input);
    results.set('conceptual_density', conceptualScore);

    // Contemplative Triggers
    const contemplativeScore = this.analyzeContemplativeTriggers(input, userProfile);
    results.set('contemplative_readiness', contemplativeScore);

    // Looping Detection
    const loopingScore = this.analyzeLoopingTriggers(input, conversationHistory);
    results.set('repetitive_patterns', loopingScore);

    return results;
  }

  // === SPECIFIC TRIGGER ANALYZERS ===
  private analyzeCrisisTriggers(input: string): { score: number; triggers: string[]; debugInfo: string[] } {
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'emergency', 'crisis'];
    const emotionalEmergencyWords = ['overwhelmed', 'drowning', 'can\'t breathe', 'falling apart'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const keyword of crisisKeywords) {
      if (input.toLowerCase().includes(keyword)) {
        score += 0.3;
        triggers.push(keyword);
        debugInfo.push(`Crisis keyword detected: ${keyword}`);
      }
    }

    for (const word of emotionalEmergencyWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.2;
        triggers.push(word);
        debugInfo.push(`Emotional emergency indicator: ${word}`);
      }
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private analyzeClarificationTriggers(input: string, history: any[]): { score: number; triggers: string[]; debugInfo: string[] } {
    const clarificationRequests = ['what do you mean', 'i don\'t understand', 'can you explain', 'confused'];
    const questionMarkers = ['?', 'how', 'why', 'what'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const request of clarificationRequests) {
      if (input.toLowerCase().includes(request)) {
        score += 0.4;
        triggers.push(request);
        debugInfo.push(`Explicit clarification request: ${request}`);
      }
    }

    const questionCount = (input.match(/\?/g) || []).length;
    if (questionCount > 2) {
      score += 0.3;
      triggers.push('multiple_questions');
      debugInfo.push(`Multiple questions detected: ${questionCount}`);
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private analyzeEmotionalTriggers(input: string): { score: number; triggers: string[]; debugInfo: string[] } {
    const emotionalWords = ['feel', 'feeling', 'emotions', 'hurt', 'pain', 'sad', 'angry', 'afraid'];
    const vulnerabilityWords = ['scared', 'vulnerable', 'exposed', 'raw', 'sensitive'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const word of emotionalWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.15;
        triggers.push(word);
      }
    }

    for (const word of vulnerabilityWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.25;
        triggers.push(word);
        debugInfo.push(`Vulnerability expression: ${word}`);
      }
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private analyzeConceptualTriggers(input: string): { score: number; triggers: string[]; debugInfo: string[] } {
    const conceptualWords = ['philosophy', 'meaning', 'purpose', 'existence', 'consciousness', 'reality'];
    const complexityIndicators = ['complex', 'nuanced', 'layers', 'depth', 'interconnected'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const word of conceptualWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.2;
        triggers.push(word);
        debugInfo.push(`Conceptual content: ${word}`);
      }
    }

    const sentenceLength = input.split('.').filter(s => s.trim().length > 50).length;
    if (sentenceLength > 2) {
      score += 0.3;
      triggers.push('complex_sentences');
      debugInfo.push('Complex sentence structure detected');
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private analyzeContemplativeTriggers(input: string, userProfile: any): { score: number; triggers: string[]; debugInfo: string[] } {
    const contemplativeWords = ['reflect', 'contemplate', 'consider', 'ponder', 'meditate'];
    const spaceWords = ['space', 'silence', 'pause', 'breathe', 'slow'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const word of contemplativeWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.2;
        triggers.push(word);
      }
    }

    for (const word of spaceWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.15;
        triggers.push(word);
      }
    }

    if (userProfile?.depthPreference === 'deep') {
      score += 0.3;
      debugInfo.push('User profile indicates deep engagement preference');
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private analyzeLoopingTriggers(input: string, history: any[]): { score: number; triggers: string[]; debugInfo: string[] } {
    const loopingIndicators = ['again', 'repeat', 'same', 'still', 'always', 'never'];
    const stuckWords = ['stuck', 'trapped', 'can\'t move', 'going nowhere'];

    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    for (const word of loopingIndicators) {
      if (input.toLowerCase().includes(word)) {
        score += 0.1;
        triggers.push(word);
      }
    }

    for (const word of stuckWords) {
      if (input.toLowerCase().includes(word)) {
        score += 0.3;
        triggers.push(word);
        debugInfo.push(`Stuck indicator: ${word}`);
      }
    }

    // Check for repetitive patterns in history
    if (history.length > 3) {
      const recentInputs = history.slice(-3).map((h: any) => h.input?.toLowerCase() || '');
      const similarity = this.calculateSimilarity(recentInputs);
      if (similarity > 0.7) {
        score += 0.5;
        triggers.push('repetitive_content');
        debugInfo.push('Repetitive content pattern in recent history');
      }
    }

    return {
      score: Math.min(score, 1.0),
      triggers,
      debugInfo
    };
  }

  private calculateSimilarity(inputs: string[]): number {
    if (inputs.length < 2) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < inputs.length - 1; i++) {
      for (let j = i + 1; j < inputs.length; j++) {
        const similarity = this.stringSimilarity(inputs[i], inputs[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // === CONFLICT RESOLUTION ===
  resolveFeatureConflicts(candidateFeatures: Map<string, number>): string[] {
    const conflicts = new Map<string, string[]>();
    const priorities = new Map<string, number>();

    // Build conflict map and priorities
    for (const rule of this.ACTIVATION_RULES) {
      conflicts.set(rule.feature, rule.conflictsWith);
      priorities.set(rule.feature, this.getFeaturePriority(rule.feature));
    }

    const activeFeatures: string[] = [];
    const sortedFeatures = Array.from(candidateFeatures.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    for (const [feature, score] of sortedFeatures) {
      const rule = this.ACTIVATION_RULES.find(r => r.feature === feature);
      if (!rule || score < rule.requiredScore) continue;

      // Check if this feature conflicts with already active features
      const hasConflict = activeFeatures.some(activeFeature => {
        return rule.conflictsWith.includes(activeFeature) ||
               conflicts.get(activeFeature)?.includes(feature);
      });

      if (!hasConflict) {
        activeFeatures.push(feature);
      } else {
        // Handle conflict based on priority
        const conflictingFeatures = activeFeatures.filter(activeFeature => {
          return rule.conflictsWith.includes(activeFeature) ||
                 conflicts.get(activeFeature)?.includes(feature);
        });

        const currentPriority = priorities.get(feature) || 0;
        const shouldReplace = conflictingFeatures.every(conflictingFeature => {
          const conflictingPriority = priorities.get(conflictingFeature) || 0;
          return currentPriority > conflictingPriority;
        });

        if (shouldReplace) {
          // Remove conflicting features and add this one
          conflictingFeatures.forEach(conflictingFeature => {
            const index = activeFeatures.indexOf(conflictingFeature);
            if (index > -1) activeFeatures.splice(index, 1);
          });
          activeFeatures.push(feature);
        }
      }
    }

    return activeFeatures;
  }

  private getFeaturePriority(feature: string): number {
    const rule = this.ACTIVATION_RULES.find(r => r.feature === feature);
    if (!rule) return 0;

    return Math.max(...rule.triggers.map(t => t.conflictPriority));
  }

  // === ACTIVATION DECISION ENGINE ===
  makeActivationDecision(
    input: string,
    conversationHistory: any[],
    userProfile: any
  ): {
    activeFeatures: string[];
    confidence: number;
    reasoning: string[];
    debugInfo: { [key: string]: any };
  } {

    const triggerAnalysis = this.analyzeActivationTriggers(input, conversationHistory, userProfile);
    const featureScores = new Map<string, number>();
    const reasoning: string[] = [];
    const debugInfo: { [key: string]: any } = {};

    // Calculate feature scores based on trigger analysis
    for (const rule of this.ACTIVATION_RULES) {
      let totalScore = 0;
      const contributingTriggers: string[] = [];

      for (const trigger of rule.triggers) {
        const triggerResult = triggerAnalysis.get(trigger.name);
        if (triggerResult && triggerResult.score >= trigger.threshold) {
          const weightedScore = triggerResult.score * trigger.weight;
          totalScore += weightedScore;
          contributingTriggers.push(trigger.name);
          reasoning.push(`${rule.feature}: ${trigger.name} contributed ${weightedScore.toFixed(2)}`);
        }
      }

      featureScores.set(rule.feature, totalScore);
      debugInfo[rule.feature] = {
        totalScore,
        requiredScore: rule.requiredScore,
        contributingTriggers,
        meetsThreshold: totalScore >= rule.requiredScore
      };
    }

    // Resolve conflicts and get final active features
    const activeFeatures = this.resolveFeatureConflicts(featureScores);

    // Calculate overall confidence
    const confidence = activeFeatures.length > 0
      ? activeFeatures.reduce((sum, feature) => sum + (featureScores.get(feature) || 0), 0) / activeFeatures.length
      : 0;

    // Record activation for learning
    this.recordActivation(activeFeatures, confidence, input);

    return {
      activeFeatures,
      confidence,
      reasoning,
      debugInfo
    };
  }

  private recordActivation(features: string[], confidence: number, input: string): void {
    const timestamp = Date.now();
    const userId = 'current_user'; // In real implementation, get from context

    if (!this.activationHistory.has(userId)) {
      this.activationHistory.set(userId, []);
    }

    const history = this.activationHistory.get(userId)!;

    for (const feature of features) {
      history.push({
        feature,
        activatedAt: timestamp,
        confidence,
        triggers: [], // Would be populated with actual trigger names
        outcome: 'completed' // Initial state
      });
    }

    // Keep only last 100 records per user
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // === DEBUGGING AND MONITORING ===
  getActivationReport(userId: string): {
    recentActivations: FeatureActivationRecord[];
    featureUsageStats: { [feature: string]: number };
    averageConfidence: number;
    conflictResolutions: number;
  } {
    const history = this.activationHistory.get(userId) || [];
    const recent = history.slice(-20);

    const featureUsage = new Map<string, number>();
    let totalConfidence = 0;

    for (const record of recent) {
      featureUsage.set(record.feature, (featureUsage.get(record.feature) || 0) + 1);
      totalConfidence += record.confidence;
    }

    return {
      recentActivations: recent,
      featureUsageStats: Object.fromEntries(featureUsage),
      averageConfidence: recent.length > 0 ? totalConfidence / recent.length : 0,
      conflictResolutions: 0 // Would track actual conflict resolution events
    };
  }
}