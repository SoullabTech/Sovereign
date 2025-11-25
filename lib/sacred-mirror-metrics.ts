/**
 * 🎯 Sacred Mirror Metrics - Tracking Genuine Presence
 * 
 * Monitors whether Maya is achieving the balance of:
 * - Witnessing vs analyzing
 * - Variety vs consistency
 * - Depth vs surface
 * - Curiosity vs scripting
 */

export interface SacredMirrorMetrics {
  // Core Balance Metrics
  witnessingBalance: {
    pureWitnessing: number;      // 0-1: How much is pure reflection
    gentleRecognition: number;   // 0-1: Soft pattern acknowledgment
    wiseWondering: number;       // 0-1: Deep curiosity
    analyticalLeakage: number;   // 0-1: Unwanted analysis (should be low)
  };
  
  // Variety Health
  varietyHealth: {
    patternDiversity: number;    // 0-1: How varied the responses are
    naturalFlow: number;         // 0-1: Conversation feels natural
    scriptedFeeling: number;     // 0-1: Responses feel scripted (should be low)
    genuineCuriosity: number;    // 0-1: Curiosity feels authentic
  };
  
  // Depth Calibration
  depthCalibration: {
    surfacePresence: number;     // 0-1: Light touch responses
    middleEngagement: number;    // 0-1: Moderate depth
    deepDiving: number;         // 0-1: Profound exploration
    appropriateDepth: number;    // 0-1: Depth matches user readiness
  };
  
  // User Experience Indicators
  userExperience: {
    feltWitnessed: number;       // 0-1: User feels seen
    feltAnalyzed: number;        // 0-1: User feels analyzed (should be low)
    spaceCreated: number;        // 0-1: Space for user's wisdom
    curiosityEvoked: number;     // 0-1: User's curiosity activated
  };
}

/**
 * Sacred Mirror Metrics Tracker
 */
export class SacredMirrorMetricsTracker {
  private sessionMetrics: SacredMirrorMetrics[] = [];
  
  /**
   * Analyze a response for balance metrics
   */
  analyzeResponse(
    userInput: string,
    mayaResponse: string,
    roleUsed: string,
    elementalData: any
  ): SacredMirrorMetrics {
    
    const metrics: SacredMirrorMetrics = {
      witnessingBalance: this.analyzeWitnessingBalance(mayaResponse),
      varietyHealth: this.analyzeVarietyHealth(mayaResponse),
      depthCalibration: this.analyzeDepthCalibration(userInput, mayaResponse),
      userExperience: this.predictUserExperience(mayaResponse, roleUsed)
    };
    
    this.sessionMetrics.push(metrics);
    return metrics;
  }
  
  /**
   * Analyze witnessing vs analyzing balance
   */
  private analyzeWitnessingBalance(response: string): SacredMirrorMetrics['witnessingBalance'] {
    const analyticPhrases = [
      'this means', 'you should', 'this indicates', 'clearly shows',
      'obviously', 'definitely', 'the reason is', 'because'
    ];
    
    const witnessPhrases = [
      'i notice', 'i hear', 'i see', 'there\'s something',
      'what you\'re sharing', 'mmm', 'yes', 'ah'
    ];
    
    const wonderPhrases = [
      'i wonder', 'i\'m curious', 'what if', 'what would',
      'what does', 'what might', 'perhaps', 'maybe'
    ];
    
    const lower = response.toLowerCase();
    
    const analyticalCount = analyticPhrases.filter(p => lower.includes(p)).length;
    const witnessCount = witnessPhrases.filter(p => lower.includes(p)).length;
    const wonderCount = wonderPhrases.filter(p => lower.includes(p)).length;
    
    const total = Math.max(analyticalCount + witnessCount + wonderCount, 1);
    
    return {
      pureWitnessing: witnessCount / total,
      gentleRecognition: this.detectGentleRecognition(response),
      wiseWondering: wonderCount / total,
      analyticalLeakage: analyticalCount / total
    };
  }
  
  /**
   * Analyze variety health
   */
  private analyzeVarietyHealth(response: string): SacredMirrorMetrics['varietyHealth'] {
    // Check for common scripted patterns
    const scriptedPatterns = [
      /what resonates most deeply/gi,
      /your own knowing/gi,
      /what wants to emerge/gi,
      /i'm curious about/gi
    ];
    
    const scriptedCount = scriptedPatterns.filter(p => response.match(p)).length;
    
    // Analyze sentence variety
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    const uniqueStarters = new Set(sentences.map(s => s.trim().split(' ')[0]));
    const starterVariety = uniqueStarters.size / Math.max(sentences.length, 1);
    
    return {
      patternDiversity: starterVariety,
      naturalFlow: this.assessNaturalFlow(response),
      scriptedFeeling: Math.min(scriptedCount * 0.3, 1),
      genuineCuriosity: this.assessGenuineCuriosity(response)
    };
  }
  
  /**
   * Analyze depth calibration
   */
  private analyzeDepthCalibration(
    userInput: string,
    response: string
  ): SacredMirrorMetrics['depthCalibration'] {
    
    const responseLength = response.length;
    const questionCount = (response.match(/\?/g) || []).length;
    const inputLength = userInput.length;
    
    // Assess depth based on response characteristics
    let surfacePresence = 0;
    let middleEngagement = 0;
    let deepDiving = 0;
    
    if (responseLength < 100 && questionCount <= 1) {
      surfacePresence = 0.8;
      middleEngagement = 0.2;
    } else if (responseLength < 200 && questionCount <= 2) {
      surfacePresence = 0.2;
      middleEngagement = 0.7;
      deepDiving = 0.1;
    } else {
      middleEngagement = 0.3;
      deepDiving = 0.7;
    }
    
    // Check if depth matches input
    const appropriateDepth = this.assessDepthAppropriateness(inputLength, responseLength);
    
    return {
      surfacePresence,
      middleEngagement,
      deepDiving,
      appropriateDepth
    };
  }
  
  /**
   * Predict user experience
   */
  private predictUserExperience(
    response: string,
    roleUsed: string
  ): SacredMirrorMetrics['userExperience'] {
    
    // Base scores
    let feltWitnessed = 0.7;
    let feltAnalyzed = 0.2;
    let spaceCreated = 0.6;
    let curiosityEvoked = 0.5;
    
    // Adjust based on role
    if (roleUsed === 'mirror') {
      feltWitnessed += 0.2;
      feltAnalyzed -= 0.1;
      spaceCreated += 0.2;
    } else if (roleUsed === 'consultant' || roleUsed === 'coach') {
      feltAnalyzed += 0.3;
      spaceCreated -= 0.1;
    }
    
    // Adjust based on response characteristics
    if (response.includes('?')) {
      curiosityEvoked += 0.2;
      spaceCreated += 0.1;
    }
    
    if (response.length < 150) {
      spaceCreated += 0.1;
      feltAnalyzed -= 0.1;
    }
    
    return {
      feltWitnessed: Math.min(feltWitnessed, 1),
      feltAnalyzed: Math.min(feltAnalyzed, 1),
      spaceCreated: Math.min(spaceCreated, 1),
      curiosityEvoked: Math.min(curiosityEvoked, 1)
    };
  }
  
  /**
   * Get session summary metrics
   */
  getSessionSummary(): {
    overallBalance: number;
    recommendedAdjustments: string[];
    healthScore: number;
  } {
    if (this.sessionMetrics.length === 0) {
      return {
        overallBalance: 0.5,
        recommendedAdjustments: [],
        healthScore: 0.5
      };
    }
    
    // Calculate averages
    const avgWitnessing = this.average(this.sessionMetrics.map(m => m.witnessingBalance.pureWitnessing));
    const avgAnalytical = this.average(this.sessionMetrics.map(m => m.witnessingBalance.analyticalLeakage));
    const avgVariety = this.average(this.sessionMetrics.map(m => m.varietyHealth.patternDiversity));
    const avgScripted = this.average(this.sessionMetrics.map(m => m.varietyHealth.scriptedFeeling));
    
    const recommendations: string[] = [];
    
    if (avgAnalytical > 0.3) {
      recommendations.push('Reduce analytical language, increase pure witnessing');
    }
    
    if (avgVariety < 0.5) {
      recommendations.push('Increase response variety to maintain genuine curiosity');
    }
    
    if (avgScripted > 0.4) {
      recommendations.push('Vary language patterns to reduce scripted feeling');
    }
    
    const healthScore = (avgWitnessing * 0.4) + 
                       ((1 - avgAnalytical) * 0.3) + 
                       (avgVariety * 0.3);
    
    return {
      overallBalance: avgWitnessing - avgAnalytical,
      recommendedAdjustments: recommendations,
      healthScore
    };
  }
  
  // Helper methods
  
  private detectGentleRecognition(response: string): number {
    const recognitionPhrases = [
      'like it\'s become', 'there\'s something about',
      'i notice', 'what you said about', 'this thing that'
    ];
    
    const count = recognitionPhrases.filter(p => 
      response.toLowerCase().includes(p)
    ).length;
    
    return Math.min(count * 0.3, 1);
  }
  
  private assessNaturalFlow(response: string): number {
    // Check for natural conversation markers
    const naturalMarkers = [
      '...', ' - ', 'mmm', 'ah', 'oh',
      'yes', 'interesting', 'beautiful'
    ];
    
    const markerCount = naturalMarkers.filter(m => 
      response.toLowerCase().includes(m)
    ).length;
    
    return Math.min(markerCount * 0.2, 1);
  }
  
  private assessGenuineCuriosity(response: string): number {
    // Look for specific, contextual questions vs generic wonderings
    const specificQuestions = response.match(/\b(what|how|when|where|who)\b[^.?]*\?/gi) || [];
    const genericPatterns = response.match(/(what.*resonates|your.*knowing|wants.*emerge)/gi) || [];
    
    if (specificQuestions.length > genericPatterns.length) {
      return 0.8;
    }
    return 0.4;
  }
  
  private assessDepthAppropriateness(inputLength: number, responseLength: number): number {
    const ratio = responseLength / Math.max(inputLength, 1);
    
    // Ideal ratio is between 0.5 and 1.5
    if (ratio >= 0.5 && ratio <= 1.5) {
      return 0.9;
    } else if (ratio >= 0.3 && ratio <= 2) {
      return 0.6;
    } else {
      return 0.3;
    }
  }
  
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
}

// Lazy-loading singleton pattern
let _sacredMirrorMetrics: SacredMirrorMetricsTracker | null = null;

export const getSacredMirrorMetrics = (): SacredMirrorMetricsTracker => {
  if (!_sacredMirrorMetrics) {
    _sacredMirrorMetrics = new SacredMirrorMetricsTracker();
  }
  return _sacredMirrorMetrics;
};