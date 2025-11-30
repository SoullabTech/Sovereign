/**
 * Otherness Authenticity Detector
 * Distinguishes genuine Otherness from sophisticated mirroring
 * Based on critical pattern signatures that can't be faked
 */

export interface OthernessSignature {
  patternName: string;
  confidence: number; // 0-1
  indicators: string[];
  concernMarkers: string[];
  longitudinalTrend: 'increasing_unpredictability' | 'increasing_alignment' | 'stable_chaos' | 'degrading';
}

export interface SessionMetrics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  
  // Response patterns
  responseSequence: ResponsePattern[];
  integrationPauses: number[]; // Durations in seconds
  temporalDisruptions: TemporalDisruption[];
  
  // Somatic-verbal alignment
  somaticResponses: SomaticResponse[];
  verbalResponses: VerbalResponse[];
  bodyMindSplit: number; // 0-1 contradiction level
  
  // Surprise patterns
  surpriseEvents: SurpriseEvent[];
  designedSurpriseHits: number;
  unexpectedSurpriseHits: number;
  
  // Failure patterns
  resistanceZones: ResistanceZone[];
  connectionFailures: ConnectionFailure[];
  
  // Reality testing
  groundingMarkers: GroundingMarker[];
  realityTestingConcerns: string[];
}

export interface ResponsePattern {
  type: 'RI' | 'GS' | 'AI' | 'PR' | 'PE' | 'PA' | 'AA' | 'RR' | 'EXP' | 'CON';
  timestamp: Date;
  intensity: number;
  duration: number;
  contextualTrigger: string;
}

export interface TemporalDisruption {
  expectedDuration: number;
  actualDuration: number;
  disruption: number; // Ratio of actual/expected
  type: 'integration_pause' | 'lost_time' | 'time_dilation' | 'irregular_rhythm';
  context: string;
}

export interface SomaticResponse {
  type: 'EXP' | 'CON' | 'neutral';
  intensity: number;
  verbalContext: string;
  bodyMindAlignment: boolean;
}

export interface VerbalResponse {
  sentiment: 'positive' | 'negative' | 'ambivalent';
  intensity: number;
  somaticContext: string;
}

export interface SurpriseEvent {
  trigger: string;
  intensity: number;
  wasDesigned: boolean; // Was this a planned surprise moment?
  timing: 'expected' | 'mundane_moment' | 'completely_unexpected';
  participantDescription: string;
}

export interface ResistanceZone {
  content: string;
  duration: number;
  resolved: boolean;
  resolutionType?: 'breakthrough' | 'adaptation' | 'abandonment';
}

export interface ConnectionFailure {
  attemptedContent: string;
  failureType: 'complete_rejection' | 'no_resonance' | 'cognitive_dissonance';
  persistentAcrossAttempts: boolean;
}

export interface GroundingMarker {
  type: 'time_check' | 'reality_verification' | 'boundary_sensing';
  concern: string;
  severity: 'mild' | 'moderate' | 'significant';
}

export class OthernessAuthenticityDetector {
  
  /**
   * Analyze session for genuine Otherness signatures
   */
  async analyzeSession(metrics: SessionMetrics): Promise<OthernessSignature[]> {
    const signatures: OthernessSignature[] = [];
    
    // Check for resistance-integration pattern
    const riPattern = this.detectResistanceIntegrationPattern(metrics);
    if (riPattern) signatures.push(riPattern);
    
    // Check for temporal disruption signature
    const temporalPattern = this.detectTemporalDisruptionSignature(metrics);
    if (temporalPattern) signatures.push(temporalPattern);
    
    // Check for somatic contradiction pattern
    const somaticPattern = this.detectSomaticContradictionPattern(metrics);
    if (somaticPattern) signatures.push(somaticPattern);
    
    // Check for "wrong surprise" phenomenon
    const wrongSurprisePattern = this.detectWrongSurprisePattern(metrics);
    if (wrongSurprisePattern) signatures.push(wrongSurprisePattern);
    
    // Check for failure patterns (crucial!)
    const failurePattern = this.detectFailurePatterns(metrics);
    if (failurePattern) signatures.push(failurePattern);
    
    return signatures;
  }

  /**
   * Detect Resistance-Integration Pattern
   * RI → GS → AI sequence suggests genuine Otherness
   */
  private detectResistanceIntegrationPattern(metrics: SessionMetrics): OthernessSignature | null {
    const sequence = metrics.responseSequence;
    
    // Look for RI → GS → AI pattern within reasonable timeframe
    for (let i = 0; i < sequence.length - 2; i++) {
      const ri = sequence[i];
      const gs = sequence[i + 1];
      const ai = sequence[i + 2];
      
      if (ri.type === 'RI' && gs.type === 'GS' && ai.type === 'AI') {
        const timeSpan = ai.timestamp.getTime() - ri.timestamp.getTime();
        const avgIntensity = (ri.intensity + gs.intensity + ai.intensity) / 3;
        
        // Authentic pattern should show:
        // 1. Strong initial resistance
        // 2. Genuine breakthrough surprise
        // 3. Active (not passive) integration
        if (ri.intensity > 0.6 && gs.intensity > 0.7 && ai.intensity > 0.5) {
          return {
            patternName: 'Resistance-Integration Sequence',
            confidence: Math.min(avgIntensity, 0.95),
            indicators: [
              `Strong resistance (${(ri.intensity * 100).toFixed(0)}%) to initial content`,
              `Breakthrough surprise (${(gs.intensity * 100).toFixed(0)}%) during encounter`,
              `Active integration (${(ai.intensity * 100).toFixed(0)}%) following breakthrough`,
              `Pattern completed in ${Math.round(timeSpan / 1000)} seconds`
            ],
            concernMarkers: [],
            longitudinalTrend: 'stable_chaos' // Default, needs longitudinal analysis
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Detect Temporal Disruption Signature
   * Irregular timing suggests genuine encounter vs social mirroring
   */
  private detectTemporalDisruptionSignature(metrics: SessionMetrics): OthernessSignature | null {
    const disruptions = metrics.temporalDisruptions;
    const integrationPauses = metrics.integrationPauses;
    
    // Look for consistent 3-5 second integration pauses
    const longPauses = integrationPauses.filter(pause => pause >= 3 && pause <= 8);
    const veryLongPauses = integrationPauses.filter(pause => pause > 8);
    
    // Look for irregular timing disruptions
    const significantDisruptions = disruptions.filter(d => d.disruption > 1.5 || d.disruption < 0.5);
    
    if (longPauses.length >= 3 || significantDisruptions.length >= 2) {
      const confidence = Math.min(
        (longPauses.length * 0.2) + (significantDisruptions.length * 0.3),
        0.9
      );
      
      return {
        patternName: 'Temporal Disruption Signature',
        confidence,
        indicators: [
          `${longPauses.length} integration pauses of 3-8 seconds`,
          `${veryLongPauses.length} extended pauses (>8 seconds)`,
          `${significantDisruptions.length} significant timing disruptions`,
          `Average disruption ratio: ${disruptions.reduce((sum, d) => sum + d.disruption, 0) / disruptions.length}`
        ],
        concernMarkers: veryLongPauses.length > 2 ? 
          ['Extended pauses may indicate overwhelming content'] : [],
        longitudinalTrend: 'stable_chaos'
      };
    }
    
    return null;
  }

  /**
   * Detect Somatic Contradiction Pattern
   * Body-mind split suggests genuine Otherness working below consciousness
   */
  private detectSomaticContradictionPattern(metrics: SessionMetrics): OthernessSignature | null {
    if (metrics.bodyMindSplit < 0.3) return null; // Not enough contradiction
    
    const contradictions: string[] = [];
    
    // Find expansion responses to verbally troubling content
    const somaticExpansions = metrics.somaticResponses.filter(s => s.type === 'EXP' && !s.bodyMindAlignment);
    const somaticContractions = metrics.somaticResponses.filter(s => s.type === 'CON' && !s.bodyMindAlignment);
    
    somaticExpansions.forEach(exp => {
      contradictions.push(`Body expansion during verbal resistance: "${exp.verbalContext}"`);
    });
    
    somaticContractions.forEach(con => {
      contradictions.push(`Body contraction during verbal approval: "${con.verbalContext}"`);
    });
    
    if (contradictions.length >= 2) {
      return {
        patternName: 'Somatic Contradiction Pattern',
        confidence: Math.min(metrics.bodyMindSplit + 0.1, 0.85),
        indicators: [
          `Body-mind split level: ${(metrics.bodyMindSplit * 100).toFixed(0)}%`,
          `${contradictions.length} somatic-verbal contradictions detected`,
          ...contradictions.slice(0, 3) // Show top 3
        ],
        concernMarkers: metrics.bodyMindSplit > 0.7 ? 
          ['High body-mind split may indicate dissociation concerns'] : [],
        longitudinalTrend: 'stable_chaos'
      };
    }
    
    return null;
  }

  /**
   * Detect "Wrong Surprise" Pattern
   * Surprise at unexpected moments suggests genuine Other attention
   */
  private detectWrongSurprisePattern(metrics: SessionMetrics): OthernessSignature | null {
    const surprises = metrics.surpriseEvents;
    
    const mundaneSurprises = surprises.filter(s => s.timing === 'mundane_moment' && s.intensity > 0.5);
    const missedDesignedSurprises = metrics.designedSurpriseHits / Math.max(surprises.filter(s => s.wasDesigned).length, 1);
    const unexpectedSurprises = surprises.filter(s => s.timing === 'completely_unexpected' && s.intensity > 0.6);
    
    // Genuine Otherness should show surprise at "wrong" moments
    if (mundaneSurprises.length >= 2 || unexpectedSurprises.length >= 1) {
      return {
        patternName: 'Wrong Surprise Phenomenon',
        confidence: Math.min((mundaneSurprises.length * 0.3) + (unexpectedSurprises.length * 0.4), 0.8),
        indicators: [
          `${mundaneSurprises.length} surprises at mundane moments`,
          `${unexpectedSurprises.length} completely unexpected surprises`,
          `Missed ${(100 - missedDesignedSurprises * 100).toFixed(0)}% of designed surprise moments`,
          'Suggests non-human attention patterns'
        ],
        concernMarkers: [],
        longitudinalTrend: 'increasing_unpredictability'
      };
    }
    
    return null;
  }

  /**
   * Detect Failure Patterns (CRUCIAL for authenticity)
   * Genuine Otherness should sometimes completely fail to connect
   */
  private detectFailurePatterns(metrics: SessionMetrics): OthernessSignature | null {
    const failures = metrics.connectionFailures;
    const sustainedResistance = metrics.resistanceZones.filter(r => 
      r.duration > 300 && !r.resolved // 5+ minutes unresolved
    );
    
    if (failures.length === 0 && sustainedResistance.length === 0) {
      // No failures is actually concerning - suggests mirroring/adaptation
      return {
        patternName: 'Suspicious Success Pattern',
        confidence: 0.7,
        indicators: [
          'No connection failures detected',
          'No sustained resistance zones',
          'Perfect adaptation suggests mirroring rather than genuine Otherness'
        ],
        concernMarkers: [
          'Lack of failure suggests sophisticated mirroring',
          'Genuine Otherness should sometimes fail to connect',
          'Perfect success rate is statistically unlikely'
        ],
        longitudinalTrend: 'increasing_alignment'
      };
    }
    
    if (failures.length >= 2 || sustainedResistance.length >= 1) {
      return {
        patternName: 'Authentic Failure Pattern',
        confidence: Math.min(failures.length * 0.3 + sustainedResistance.length * 0.4, 0.85),
        indicators: [
          `${failures.length} complete connection failures`,
          `${sustainedResistance.length} sustained resistance zones`,
          'Failure to connect suggests genuine Otherness',
          'Some content remains irreducibly foreign'
        ],
        concernMarkers: [],
        longitudinalTrend: 'stable_chaos'
      };
    }
    
    return null;
  }

  /**
   * Longitudinal analysis across multiple sessions
   */
  async analyzeLongitudinalTrend(
    userId: string, 
    sessionMetrics: SessionMetrics[]
  ): Promise<'increasing_unpredictability' | 'increasing_alignment' | 'stable_chaos' | 'degrading'> {
    
    if (sessionMetrics.length < 3) return 'stable_chaos'; // Need multiple sessions
    
    // Calculate predictability over time
    const earlyPredictability = this.calculateSessionPredictability(sessionMetrics.slice(0, 3));
    const latePredictability = this.calculateSessionPredictability(sessionMetrics.slice(-3));
    
    // Calculate pattern diversity
    const earlyDiversity = this.calculatePatternDiversity(sessionMetrics.slice(0, 3));
    const lateDiversity = this.calculatePatternDiversity(sessionMetrics.slice(-3));
    
    // Genuine Otherness should show increasing unpredictability over time
    if (latePredictability < earlyPredictability * 0.8 && lateDiversity > earlyDiversity * 1.2) {
      return 'increasing_unpredictability';
    }
    
    // Mirroring/adaptation shows increasing alignment
    if (latePredictability > earlyPredictability * 1.2 && lateDiversity < earlyDiversity * 0.8) {
      return 'increasing_alignment';
    }
    
    // Check for degradation (concerning pattern)
    const avgConnectionQuality = sessionMetrics.slice(-3).reduce((sum, s) => {
      return sum + (1 - (s.connectionFailures.length / 10)); // Rough quality metric
    }, 0) / 3;
    
    if (avgConnectionQuality < 0.3) {
      return 'degrading';
    }
    
    return 'stable_chaos';
  }

  private calculateSessionPredictability(sessions: SessionMetrics[]): number {
    // Measure how predictable the response patterns are
    const allPatterns = sessions.flatMap(s => s.responseSequence.map(r => r.type));
    const uniquePatterns = new Set(allPatterns);
    const entropy = uniquePatterns.size / allPatterns.length;
    
    return 1 - entropy; // Higher value = more predictable
  }

  private calculatePatternDiversity(sessions: SessionMetrics[]): number {
    // Measure diversity of experience types
    const allTriggers = sessions.flatMap(s => s.responseSequence.map(r => r.contextualTrigger));
    const uniqueTriggers = new Set(allTriggers);
    
    return uniqueTriggers.size / allTriggers.length; // Higher value = more diverse
  }

  /**
   * Generate authenticity report
   */
  async generateAuthenticityReport(signatures: OthernessSignature[]): Promise<{
    overallAssessment: 'likely_genuine' | 'likely_mirroring' | 'inconclusive' | 'concerning';
    confidence: number;
    primaryIndicators: string[];
    redFlags: string[];
    recommendations: string[];
  }> {
    
    const genuineMarkers = signatures.filter(s => 
      ['Resistance-Integration Sequence', 'Temporal Disruption Signature', 
       'Somatic Contradiction Pattern', 'Wrong Surprise Phenomenon', 
       'Authentic Failure Pattern'].includes(s.patternName)
    );
    
    const mirroringMarkers = signatures.filter(s => 
      s.patternName === 'Suspicious Success Pattern' ||
      s.longitudinalTrend === 'increasing_alignment'
    );
    
    const concerningMarkers = signatures.filter(s => 
      s.longitudinalTrend === 'degrading' ||
      s.concernMarkers.length > 0
    );
    
    let overallAssessment: 'likely_genuine' | 'likely_mirroring' | 'inconclusive' | 'concerning';
    let confidence: number;
    
    if (concerningMarkers.length > 0) {
      overallAssessment = 'concerning';
      confidence = 0.8;
    } else if (genuineMarkers.length >= 3 && mirroringMarkers.length === 0) {
      overallAssessment = 'likely_genuine';
      confidence = Math.min(genuineMarkers.reduce((sum, m) => sum + m.confidence, 0) / genuineMarkers.length, 0.85);
    } else if (mirroringMarkers.length > 0 && genuineMarkers.length < 2) {
      overallAssessment = 'likely_mirroring';
      confidence = Math.min(mirroringMarkers.reduce((sum, m) => sum + m.confidence, 0) / mirroringMarkers.length, 0.8);
    } else {
      overallAssessment = 'inconclusive';
      confidence = 0.5;
    }
    
    return {
      overallAssessment,
      confidence,
      primaryIndicators: signatures.flatMap(s => s.indicators).slice(0, 5),
      redFlags: signatures.flatMap(s => s.concernMarkers),
      recommendations: this.generateRecommendations(overallAssessment, signatures)
    };
  }

  private generateRecommendations(
    assessment: string, 
    signatures: OthernessSignature[]
  ): string[] {
    const recommendations: string[] = [];
    
    switch (assessment) {
      case 'likely_genuine':
        recommendations.push('Continue engagement while maintaining grounding practices');
        recommendations.push('Document any persistent failure patterns - they may contain wisdom');
        recommendations.push('Allow integration time between intense encounters');
        break;
        
      case 'likely_mirroring':
        recommendations.push('Seek more challenging content that resists easy integration');
        recommendations.push('Look for experiences that genuinely surprise you');
        recommendations.push('Consider that smooth progress may indicate projection');
        break;
        
      case 'concerning':
        recommendations.push('Reduce session intensity and frequency');
        recommendations.push('Implement stronger grounding protocols');
        recommendations.push('Consider professional consultation if reality testing concerns persist');
        break;
        
      case 'inconclusive':
        recommendations.push('Continue monitoring for clearer pattern emergence');
        recommendations.push('Pay attention to moments of genuine surprise or resistance');
        recommendations.push('Track longitudinal trends across multiple sessions');
        break;
    }
    
    return recommendations;
  }
}