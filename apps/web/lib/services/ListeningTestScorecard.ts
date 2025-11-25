/**
 * Listening Test Scorecard System
 * Structured data collection for voice mask evaluation
 */

export interface TestParticipant {
  id: string;
  name: string;
  role: 'developer' | 'designer' | 'healer' | 'musician' | 'user' | 'other';
  expertise: 'technical' | 'symbolic' | 'both' | 'general';
  testDate: Date;
}

export interface MaskEvaluation {
  participantId: string;
  maskId: string;
  round: 'blind' | 'revealed'; // First pass vs after name reveal

  // Core ratings (1-5)
  ratings: {
    clarity: number;        // Easy to understand, not muddy
    distinctiveness: number; // Different from other masks
    symbolicFit: number;    // Matches description
    comfort: number;        // Not fatiguing or uncanny
    resonance: number;      // Emotional/energetic impact
  };

  // Symbolic impressions
  impressions: {
    images: string[];       // What images came to mind
    feelings: string[];     // Emotional responses
    archetypes: string[];   // Jungian/mythic associations
    elements: string[];     // Elemental associations perceived
  };

  // Freeform notes
  notes?: string;

  // Test context
  testPhrase: string;
  timestamp: Date;
  audioQuality: 'headphones' | 'speakers' | 'earbuds';
}

export interface ListeningTestSession {
  sessionId: string;
  facilitator: string;
  participants: TestParticipant[];
  testPhrases: string[];
  masks: string[];
  evaluations: MaskEvaluation[];
  environment: {
    location: string;
    acoustics: 'studio' | 'office' | 'home' | 'other';
    distractions: 'none' | 'minimal' | 'some' | 'many';
  };
  startTime: Date;
  endTime?: Date;
}

// Test phrases for consistency
export const STANDARD_TEST_PHRASES = {
  greeting: "Welcome to the space between worlds.",
  reflective: "I hear the depth beneath your words.",
  ritual: "The spiral turns, and so do you.",
  shadow: "What you resist persists, what you embrace transforms.",
  integration: "You are both the question and the answer."
};

// Evaluation criteria with descriptions
export const EVALUATION_CRITERIA = {
  clarity: {
    name: 'Clarity',
    description: 'Voice is easy to understand, not muddy or muffled',
    lowScore: 'Muddy/unclear',
    highScore: 'Crystal clear'
  },
  distinctiveness: {
    name: 'Distinctiveness',
    description: 'Sounds noticeably different from other masks',
    lowScore: 'Too similar',
    highScore: 'Very unique'
  },
  symbolicFit: {
    name: 'Symbolic Fit',
    description: 'Audio qualities match the mask\'s archetypal description',
    lowScore: 'Doesn\'t match',
    highScore: 'Perfect match'
  },
  comfort: {
    name: 'Comfort',
    description: 'Pleasant to listen to, not fatiguing or uncanny',
    lowScore: 'Uncomfortable',
    highScore: 'Very pleasant'
  },
  resonance: {
    name: 'Resonance',
    description: 'Emotional and energetic impact of the voice',
    lowScore: 'No impact',
    highScore: 'Deeply moving'
  }
};

// Analysis functions
export class ListeningTestAnalyzer {

  // Calculate average scores per mask
  calculateMaskAverages(session: ListeningTestSession): Record<string, {
    overall: number;
    clarity: number;
    distinctiveness: number;
    symbolicFit: number;
    comfort: number;
    resonance: number;
    sampleSize: number;
  }> {
    const results: Record<string, any> = {};

    session.evaluations.forEach(eval => {
      if (!results[eval.maskId]) {
        results[eval.maskId] = {
          clarity: [],
          distinctiveness: [],
          symbolicFit: [],
          comfort: [],
          resonance: []
        };
      }

      Object.entries(eval.ratings).forEach(([criterion, score]) => {
        results[eval.maskId][criterion].push(score);
      });
    });

    // Calculate averages
    Object.keys(results).forEach(maskId => {
      const mask = results[maskId];
      const avgRatings: any = {};
      let sum = 0;

      Object.keys(mask).forEach(criterion => {
        const scores = mask[criterion];
        avgRatings[criterion] = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        sum += avgRatings[criterion];
      });

      results[maskId] = {
        ...avgRatings,
        overall: sum / 5,
        sampleSize: mask.clarity.length
      };
    });

    return results;
  }

  // Identify masks needing adjustment
  identifyIssues(averages: ReturnType<typeof this.calculateMaskAverages>): {
    maskId: string;
    issues: string[];
    recommendations: string[];
  }[] {
    const issues: any[] = [];

    Object.entries(averages).forEach(([maskId, scores]) => {
      const maskIssues: string[] = [];
      const recommendations: string[] = [];

      if (scores.clarity < 4) {
        maskIssues.push('Low clarity');
        recommendations.push('Adjust EQ (boost 1-4kHz), reduce reverb wetness');
      }

      if (scores.distinctiveness < 3.5) {
        maskIssues.push('Not distinct enough');
        recommendations.push('Increase parameter differences (pitch ±2, reverb +10%)');
      }

      if (scores.symbolicFit < 3.5) {
        maskIssues.push('Poor symbolic alignment');
        recommendations.push('Review archetypal description, adjust to match expectations');
      }

      if (scores.comfort < 3.5) {
        maskIssues.push('Uncomfortable listening');
        recommendations.push('Reduce harsh frequencies, check breathiness levels');
      }

      if (maskIssues.length > 0) {
        issues.push({ maskId, issues: maskIssues, recommendations });
      }
    });

    return issues;
  }

  // Compare blind vs revealed ratings
  compareBlindVsRevealed(session: ListeningTestSession): Record<string, {
    blindAvg: number;
    revealedAvg: number;
    difference: number;
    symbolicFitChange: number;
  }> {
    const comparison: Record<string, any> = {};

    session.masks.forEach(maskId => {
      const blindEvals = session.evaluations.filter(e =>
        e.maskId === maskId && e.round === 'blind'
      );
      const revealedEvals = session.evaluations.filter(e =>
        e.maskId === maskId && e.round === 'revealed'
      );

      if (blindEvals.length > 0 && revealedEvals.length > 0) {
        const blindAvg = this.averageRatings(blindEvals);
        const revealedAvg = this.averageRatings(revealedEvals);

        comparison[maskId] = {
          blindAvg: blindAvg.overall,
          revealedAvg: revealedAvg.overall,
          difference: revealedAvg.overall - blindAvg.overall,
          symbolicFitChange: revealedAvg.symbolicFit - blindAvg.symbolicFit
        };
      }
    });

    return comparison;
  }

  // Extract common symbolic impressions
  extractSymbolicPatterns(session: ListeningTestSession): Record<string, {
    commonImages: string[];
    commonFeelings: string[];
    commonArchetypes: string[];
    alignment: 'strong' | 'moderate' | 'weak';
  }> {
    const patterns: Record<string, any> = {};

    session.masks.forEach(maskId => {
      const maskEvals = session.evaluations.filter(e => e.maskId === maskId);

      const allImages = maskEvals.flatMap(e => e.impressions.images);
      const allFeelings = maskEvals.flatMap(e => e.impressions.feelings);
      const allArchetypes = maskEvals.flatMap(e => e.impressions.archetypes);

      patterns[maskId] = {
        commonImages: this.findCommonTerms(allImages),
        commonFeelings: this.findCommonTerms(allFeelings),
        commonArchetypes: this.findCommonTerms(allArchetypes),
        alignment: this.assessSymbolicAlignment(maskId, maskEvals)
      };
    });

    return patterns;
  }

  // Private helpers
  private averageRatings(evaluations: MaskEvaluation[]) {
    const totals = { clarity: 0, distinctiveness: 0, symbolicFit: 0, comfort: 0, resonance: 0 };

    evaluations.forEach(eval => {
      Object.entries(eval.ratings).forEach(([key, value]) => {
        totals[key as keyof typeof totals] += value;
      });
    });

    const count = evaluations.length;
    return {
      clarity: totals.clarity / count,
      distinctiveness: totals.distinctiveness / count,
      symbolicFit: totals.symbolicFit / count,
      comfort: totals.comfort / count,
      resonance: totals.resonance / count,
      overall: Object.values(totals).reduce((a, b) => a + b, 0) / (5 * count)
    };
  }

  private findCommonTerms(terms: string[], threshold = 2): string[] {
    const frequency: Record<string, number> = {};

    terms.forEach(term => {
      const normalized = term.toLowerCase().trim();
      frequency[normalized] = (frequency[normalized] || 0) + 1;
    });

    return Object.entries(frequency)
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term);
  }

  private assessSymbolicAlignment(maskId: string, evaluations: MaskEvaluation[]): 'strong' | 'moderate' | 'weak' {
    const avgSymbolicFit = evaluations.reduce((sum, e) => sum + e.ratings.symbolicFit, 0) / evaluations.length;

    if (avgSymbolicFit >= 4) return 'strong';
    if (avgSymbolicFit >= 3) return 'moderate';
    return 'weak';
  }
}

// Export test results to CSV/JSON
export function exportTestResults(session: ListeningTestSession, format: 'csv' | 'json'): string {
  const analyzer = new ListeningTestAnalyzer();
  const averages = analyzer.calculateMaskAverages(session);
  const issues = analyzer.identifyIssues(averages);
  const symbolic = analyzer.extractSymbolicPatterns(session);

  if (format === 'json') {
    return JSON.stringify({
      session: {
        id: session.sessionId,
        date: session.startTime,
        participants: session.participants.length,
        environment: session.environment
      },
      averages,
      issues,
      symbolic,
      rawData: session.evaluations
    }, null, 2);
  }

  // CSV format
  const csvRows: string[] = [
    'Mask ID,Overall,Clarity,Distinctiveness,Symbolic Fit,Comfort,Resonance,Sample Size,Issues'
  ];

  Object.entries(averages).forEach(([maskId, scores]) => {
    const maskIssues = issues.find(i => i.maskId === maskId);
    csvRows.push([
      maskId,
      scores.overall.toFixed(2),
      scores.clarity.toFixed(2),
      scores.distinctiveness.toFixed(2),
      scores.symbolicFit.toFixed(2),
      scores.comfort.toFixed(2),
      scores.resonance.toFixed(2),
      scores.sampleSize.toString(),
      maskIssues ? maskIssues.issues.join('; ') : 'None'
    ].join(','));
  });

  return csvRows.join('\n');
}