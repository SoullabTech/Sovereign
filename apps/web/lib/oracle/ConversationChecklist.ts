/**
 * Transformational Conversation Checklist Module
 * Self-assessment system for Maya's conversational effectiveness
 * Maps modern research to Spiralogic elements
 */

export interface ChecklistResult {
  cue: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  description: string;
  hit: boolean;
  confidence: number;
  evidence?: string;
}

export interface ConversationQualityScore {
  overall: number;
  byElement: {
    fire: number;    // Challenge, vision, meaning
    water: number;   // Attunement, mirroring, vulnerability
    earth: number;   // Grounding, summarizing, safety
    air: number;     // Clarifying, perspective, patterns
    aether: number;  // Integration, values, transformation
  };
  cuesHit: number;
  totalCues: number;
  recommendations: string[];
}

export interface ElementalScore {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  score: number;
  indicators: string[];
  recommendations: string[];
}

export class ConversationChecklist {

  private readonly transformationalCues = [
    // WATER - Emotional Attunement & Mirroring
    {
      cue: "Mirroring",
      element: 'water' as const,
      description: "Echoes key words, phrases, or metaphors naturally",
      detect: (userMessage: string, response: string) => {
        const userWords = this.extractSignificantWords(userMessage);
        const hitWords = userWords.filter(word =>
          response.toLowerCase().includes(word.toLowerCase())
        );

        if (hitWords.length === 0) return { hit: false, confidence: 0 };

        // Avoid parroting detection
        const isParroting = response.toLowerCase().includes(userMessage.toLowerCase().substring(0, 20));
        if (isParroting) return { hit: false, confidence: 0.2 };

        const mirrorRatio = hitWords.length / Math.max(userWords.length, 1);
        return {
          hit: mirrorRatio > 0.2,
          confidence: Math.min(mirrorRatio * 2, 1),
          evidence: `Mirrored: ${hitWords.join(', ')}`
        };
      }
    },

    {
      cue: "Emotional Attunement",
      element: 'water' as const,
      description: "Acknowledges emotional tone, not just content",
      detect: (userMessage: string, response: string) => {
        const userEmotions = this.extractEmotionalWords(userMessage);
        const responseEmotions = this.extractEmotionalWords(response);

        if (userEmotions.length === 0) return { hit: false, confidence: 0.5 };

        const emotionOverlap = userEmotions.filter(e =>
          responseEmotions.some(r => r.includes(e) || e.includes(r))
        );

        const confidence = emotionOverlap.length > 0 ? 0.8 :
                          responseEmotions.length > 0 ? 0.6 : 0.2;

        return {
          hit: emotionOverlap.length > 0 || responseEmotions.length > 0,
          confidence,
          evidence: emotionOverlap.length > 0 ?
            `Emotion match: ${emotionOverlap.join(', ')}` :
            `Emotional awareness: ${responseEmotions.join(', ')}`
        };
      }
    },

    {
      cue: "Vulnerability Space",
      element: 'water' as const,
      description: "Creates safe space for uncertainty and shadow",
      detect: (userMessage: string, response: string) => {
        const vulnerabilityMarkers = /uncertain|don't know|scared|afraid|shadow|difficult|hard/i;
        const spaceMarkers = /\.\.\.|mm|pause|space|breathe|take.*time/i;

        const hasVulnerability = vulnerabilityMarkers.test(userMessage);
        const offersSpace = spaceMarkers.test(response) || response.length < 20;

        if (!hasVulnerability) return { hit: false, confidence: 0.5 };

        return {
          hit: offersSpace,
          confidence: offersSpace ? 0.9 : 0.3,
          evidence: offersSpace ? "Created space for vulnerability" : "Missed vulnerability cues"
        };
      }
    },

    // AIR - Clarifying & Perspective
    {
      cue: "Clarifying Questions",
      element: 'air' as const,
      description: "Asks short, open-ended questions that deepen exploration",
      detect: (userMessage: string, response: string) => {
        const openQuestions = /\b(what|how|why|where|when|tell me)\b.*\?/gi;
        const closedQuestions = /\b(is|are|do|did|will|would|could|should)\b.*\?/gi;

        const openMatches = response.match(openQuestions) || [];
        const closedMatches = response.match(closedQuestions) || [];

        if (openMatches.length === 0) return { hit: false, confidence: 0 };

        const ratio = openMatches.length / (openMatches.length + closedMatches.length);

        return {
          hit: true,
          confidence: ratio,
          evidence: `Open questions: ${openMatches.join('; ')}`
        };
      }
    },

    {
      cue: "Perspective Shift",
      element: 'air' as const,
      description: "Offers new angles or reframes without forcing",
      detect: (userMessage: string, response: string) => {
        const reframePatterns = /what if|another way|different.*angle|from.*perspective|see.*as|could.*be/i;
        const forcePatterns = /you should|you need to|you must|try to/i;

        const hasReframe = reframePatterns.test(response);
        const isForcing = forcePatterns.test(response);

        if (isForcing) return { hit: false, confidence: 0.1 };

        return {
          hit: hasReframe,
          confidence: hasReframe ? 0.8 : 0.3,
          evidence: hasReframe ? "Offered perspective shift" : "No reframing detected"
        };
      }
    },

    // EARTH - Grounding & Summarizing
    {
      cue: "Grounded Summarizing",
      element: 'earth' as const,
      description: "Reflects back core meaning without interpretation",
      detect: (userMessage: string, response: string) => {
        const summaryMarkers = /sounds like|what i hear|you're saying|so you|in other words/i;
        const interpretationMarkers = /this means|you feel this because|the reason is/i;

        const hasSummary = summaryMarkers.test(response);
        const hasInterpretation = interpretationMarkers.test(response);

        if (hasInterpretation) return { hit: false, confidence: 0.2 };

        const overlapScore = this.calculateContentOverlap(userMessage, response);

        return {
          hit: hasSummary || overlapScore > 0.4,
          confidence: hasSummary ? 0.9 : Math.min(overlapScore * 2, 0.7),
          evidence: hasSummary ? "Clear summarizing" : `Content overlap: ${(overlapScore * 100).toFixed(0)}%`
        };
      }
    },

    {
      cue: "Steady Pacing",
      element: 'earth' as const,
      description: "Maintains safety through consistent rhythm",
      detect: (userMessage: string, response: string) => {
        const responseLength = response.split(/\s+/).length;
        const isOverwhelming = responseLength > 30;
        const isTooTerse = responseLength < 2 && !response.includes('...');

        const confidence = isOverwhelming ? 0.2 :
                          isTooTerse ? 0.4 :
                          responseLength <= 15 ? 1.0 : 0.8;

        return {
          hit: !isOverwhelming && !isTooTerse,
          confidence,
          evidence: `${responseLength} words (${isOverwhelming ? 'overwhelming' : isTooTerse ? 'too brief' : 'steady'})`
        };
      }
    },

    // FIRE - Challenge & Vision
    {
      cue: "Meaningful Challenge",
      element: 'fire' as const,
      description: "Challenges patterns while connecting to values",
      detect: (userMessage: string, response: string) => {
        const challengePatterns = /what if|could you|dare|risk|edge|beyond/i;
        const meaningPatterns = /matter|important|value|care about|meaningful/i;
        const stuckPatterns = /always|never|can't|stuck|trapped/i;

        const hasStuckPattern = stuckPatterns.test(userMessage);
        const offersChallenge = challengePatterns.test(response);
        const connectsToMeaning = meaningPatterns.test(response);

        if (!hasStuckPattern) return { hit: false, confidence: 0.5 };

        const meaningfulChallenge = offersChallenge && connectsToMeaning;

        return {
          hit: meaningfulChallenge,
          confidence: meaningfulChallenge ? 0.9 : offersChallenge ? 0.6 : 0.2,
          evidence: meaningfulChallenge ? "Challenge connected to meaning" :
                   offersChallenge ? "Challenge without meaning anchor" : "No challenge offered"
        };
      }
    },

    // AETHER - Integration & Meaning
    {
      cue: "Values Alignment",
      element: 'aether' as const,
      description: "Connects to what matters deeply to the person",
      detect: (userMessage: string, response: string) => {
        const valueWords = /purpose|meaning|value|truth|integrity|soul|identity|calling|sacred/i;
        const personalValues = /what matters|care about|important to you|value most/i;

        const hasValueLanguage = valueWords.test(response);
        const invitesValues = personalValues.test(response);

        return {
          hit: hasValueLanguage || invitesValues,
          confidence: invitesValues ? 0.9 : hasValueLanguage ? 0.7 : 0.3,
          evidence: invitesValues ? "Invited values exploration" :
                   hasValueLanguage ? "Used value language" : "No values connection"
        };
      }
    },

    {
      cue: "Transformational Space",
      element: 'aether' as const,
      description: "Holds space for emergence and becoming",
      detect: (userMessage: string, response: string) => {
        const transformationMarkers = /becoming|emerging|transforming|shifting|threshold|edge/i;
        const spaceHolding = /\.\.\.|space|pause|present|witness|hold/i;

        const userInTransformation = transformationMarkers.test(userMessage);
        const holdsSpace = spaceHolding.test(response);
        const invitesEmergence = /what wants|seeking to|trying to emerge/i.test(response);

        if (!userInTransformation) return { hit: false, confidence: 0.5 };

        return {
          hit: holdsSpace || invitesEmergence,
          confidence: invitesEmergence ? 0.9 : holdsSpace ? 0.7 : 0.3,
          evidence: invitesEmergence ? "Invited emergence" :
                   holdsSpace ? "Held transformational space" : "Missed transformation moment"
        };
      }
    }
  ];

  /**
   * Evaluate a conversation exchange against transformational criteria
   */
  evaluateExchange(userMessage: string, mayaResponse: string): ChecklistResult[] {
    return this.transformationalCues.map(cue => {
      const result = cue.detect(userMessage, mayaResponse);

      return {
        cue: cue.cue,
        element: cue.element,
        description: cue.description,
        hit: result.hit,
        confidence: result.confidence,
        evidence: result.evidence
      };
    });
  }

  /**
   * Calculate overall conversation quality score
   */
  calculateQualityScore(results: ChecklistResult[]): ConversationQualityScore {
    const byElement = {
      fire: this.calculateElementScore(results, 'fire'),
      water: this.calculateElementScore(results, 'water'),
      earth: this.calculateElementScore(results, 'earth'),
      air: this.calculateElementScore(results, 'air'),
      aether: this.calculateElementScore(results, 'aether')
    };

    const overall = Object.values(byElement).reduce((sum, score) => sum + score, 0) / 5;
    const cuesHit = results.filter(r => r.hit).length;
    const totalCues = results.length;

    const recommendations = this.generateRecommendations(results, byElement);

    return {
      overall,
      byElement,
      cuesHit,
      totalCues,
      recommendations
    };
  }

  /**
   * Maya's self-assessment prompt addition
   */
  generateSelfAssessmentPrompt(results: ChecklistResult[]): string {
    const hitCues = results.filter(r => r.hit).map(r => r.cue);
    const missedCues = results.filter(r => !r.hit).map(r => r.cue);

    return `
Self-Assessment (internal check - do not output to user):
✓ Transformational cues hit: ${hitCues.join(', ')}
⚠ Missed opportunities: ${missedCues.join(', ')}

Next response: Focus on ${missedCues.length > 0 ? missedCues[0] : 'deepening current connection'}
    `;
  }

  // Helper methods
  private extractSignificantWords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'i', 'you', 'we', 'they', 'is', 'was', 'are', 'were']);
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  private extractEmotionalWords(text: string): string[] {
    const emotionWords = ['feel', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'scared', 'excited', 'overwhelmed', 'stuck', 'lost', 'hopeful', 'anxious', 'peaceful', 'frustrated', 'joyful'];
    return emotionWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateContentOverlap(text1: string, text2: string): number {
    const words1 = new Set(this.extractSignificantWords(text1));
    const words2 = new Set(this.extractSignificantWords(text2));

    const words1Array = Array.from(words1);
    const words2Array = Array.from(words2);

    const intersection = new Set(words1Array.filter(x => words2.has(x)));
    const union = new Set([...words1Array, ...words2Array]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateElementScore(results: ChecklistResult[], element: string): number {
    const elementResults = results.filter(r => r.element === element);
    if (elementResults.length === 0) return 0.5;

    const totalConfidence = elementResults.reduce((sum, r) =>
      sum + (r.hit ? r.confidence : 0), 0
    );

    return totalConfidence / elementResults.length;
  }

  private generateRecommendations(results: ChecklistResult[], byElement: any): string[] {
    const recommendations: string[] = [];

    // Check weak elements
    Object.entries(byElement).forEach(([element, score]) => {
      if ((score as number) < 0.4) {
        const elementRecs = {
          fire: "Add meaningful challenges connected to their values",
          water: "Increase emotional attunement and mirroring",
          earth: "Provide clearer summaries and steady pacing",
          air: "Ask more open-ended clarifying questions",
          aether: "Connect to deeper meaning and transformation"
        };
        recommendations.push(elementRecs[element as keyof typeof elementRecs]);
      }
    });

    // Check missed critical cues
    const criticalMisses = results.filter(r => !r.hit && r.confidence < 0.3);
    criticalMisses.forEach(miss => {
      recommendations.push(`Focus on ${miss.cue.toLowerCase()}: ${miss.description}`);
    });

    return recommendations.slice(0, 3); // Top 3 recommendations
  }
}

export const conversationChecklist = new ConversationChecklist();