/**
 * Privacy-Aware Cognitive Voice Analysis Wrapper
 *
 * This module wraps cognitive voice analysis to ensure all access respects
 * privacy permissions and provides filtered results based on user settings.
 */

import { CognitiveVoiceAnalysis, CognitiveVoiceProcessor } from './cognitiveVoiceAnalysis';
import { VoiceMetrics } from './voicePatterns';
import { JournalEntry } from './state';
import { PrivacyPermissionManager, CognitivePermissions } from './privacyPermissions';

export class PrivacyAwareCognitiveVoiceProcessor {
  private cognitiveProcessor: CognitiveVoiceProcessor;
  private privacyManager: PrivacyPermissionManager;

  constructor(userId: string) {
    this.cognitiveProcessor = new CognitiveVoiceProcessor();
    this.privacyManager = new PrivacyPermissionManager(userId);
  }

  /**
   * Performs cognitive voice analysis while respecting privacy permissions
   */
  async analyzeWithPrivacy(
    words: Array<{ word: string; start: number; end: number }>,
    duration: number,
    transcript: string,
    segments?: Array<{ start: number; end: number; text: string }>,
    voiceHistory?: JournalEntry[],
    accessorId?: string // Who is requesting the analysis (for professional access)
  ): Promise<CognitiveVoiceAnalysis | null> {
    try {
      // First, check if cognitive analysis is enabled for this user
      const canAccess = await this.privacyManager.canAccessCognitiveData(
        'voiceMetricsAccess',
        accessorId
      );

      if (!canAccess) {
        console.log('🔒 Privacy: Cognitive voice analysis access denied');
        return null;
      }

      // Perform full analysis internally
      const fullAnalysis = await this.cognitiveProcessor.analyzeCognitiveVoicePatterns(
        words,
        duration,
        transcript,
        segments,
        voiceHistory
      );

      // Filter the analysis based on permissions
      const filteredAnalysis = await this.privacyManager.getFilteredCognitiveAnalysis(
        fullAnalysis,
        accessorId
      );

      return filteredAnalysis;
    } catch (error) {
      console.error('Error in privacy-aware cognitive analysis:', error);
      return null;
    }
  }

  /**
   * Get voice metrics with privacy filtering
   */
  async getFilteredVoiceMetrics(
    voiceMetrics: VoiceMetrics,
    accessorId?: string
  ): Promise<VoiceMetrics | null> {
    const canAccess = await this.privacyManager.canAccessCognitiveData(
      'voiceMetricsAccess',
      accessorId
    );

    if (!canAccess) {
      return null;
    }

    // Return complete voice metrics if user has permission
    return voiceMetrics;
  }

  /**
   * Get elemental analysis with privacy filtering
   */
  async getFilteredElementalAnalysis(
    elementalResonance: any,
    accessorId?: string
  ): Promise<any | null> {
    const canAccess = await this.privacyManager.canAccessCognitiveData(
      'elementalAnalysisAccess',
      accessorId
    );

    if (!canAccess) {
      return null;
    }

    return elementalResonance;
  }

  /**
   * Get clinical insights with strict privacy filtering
   */
  async getFilteredClinicalInsights(
    clinicalInsights: any,
    accessorId?: string
  ): Promise<any | null> {
    const canAccess = await this.privacyManager.canAccessCognitiveData(
      'clinicalInsightsAccess',
      accessorId
    );

    if (!canAccess) {
      console.log('🔒 Privacy: Clinical insights access denied - maintaining soulful experience');
      return null;
    }

    return clinicalInsights;
  }

  /**
   * Generate privacy-aware summary for member view
   * This transforms clinical findings into soulful, receivable language
   */
  async generateMemberFriendlySummary(
    fullAnalysis: CognitiveVoiceAnalysis
  ): Promise<{
    essenceInsights?: string;
    energyFlow?: string;
    wisdomEmergence?: string;
    breathworkGuidance?: string;
    integrationInvitation?: string;
  }> {
    const settings = await this.privacyManager.getSettings();

    // Generate insights based on what user wants to see
    const summary: any = {};

    if (settings.selfPermissions.voiceMetricsAccess) {
      summary.essenceInsights = this.translateVoiceMetrics(fullAnalysis.voiceMetrics);
    }

    if (settings.selfPermissions.elementalAnalysisAccess) {
      summary.energyFlow = this.translateElementalResonance(fullAnalysis.elementalResonance);
    }

    if (settings.selfPermissions.soarWisdomAccess) {
      summary.wisdomEmergence = this.translateWisdomInsights(fullAnalysis.soarAnalysis);
    }

    if (settings.selfPermissions.microPsiAnalysisAccess) {
      summary.breathworkGuidance = this.translateBreathworkGuidance(
        fullAnalysis.voiceMetrics,
        fullAnalysis.microPsiAnalysis
      );
    }

    if (settings.selfPermissions.actrMemoryAccess || settings.selfPermissions.lidaInsightsAccess) {
      summary.integrationInvitation = this.translateIntegrationGuidance(
        fullAnalysis.actrAnalysis,
        fullAnalysis.lidaAnalysis
      );
    }

    return summary;
  }

  /**
   * Generate professional summary for therapeutic contexts
   */
  async generateProfessionalSummary(
    fullAnalysis: CognitiveVoiceAnalysis,
    professionalId: string
  ): Promise<{
    clinicalObservations?: string;
    developmentalMarkers?: string;
    therapeuticRecommendations?: string;
    integrationReadiness?: number;
    riskFactors?: string[];
  }> {
    const summary: any = {};

    // Check permissions for each clinical insight
    const canAccessClinical = await this.privacyManager.canAccessCognitiveData(
      'clinicalInsightsAccess',
      professionalId
    );

    const canAccessDevelopmental = await this.privacyManager.canAccessCognitiveData(
      'developmentalStageAccess',
      professionalId
    );

    const canAccessIntegration = await this.privacyManager.canAccessCognitiveData(
      'integrationReadinessAccess',
      professionalId
    );

    if (canAccessClinical) {
      summary.clinicalObservations = this.generateClinicalObservations(fullAnalysis);
    }

    if (canAccessDevelopmental) {
      summary.developmentalMarkers = this.generateDevelopmentalAssessment(fullAnalysis);
    }

    if (canAccessIntegration) {
      summary.integrationReadiness = fullAnalysis.clinicalInsights?.integrationReadiness || 0;
      summary.therapeuticRecommendations = this.generateTherapeuticRecommendations(fullAnalysis);
    }

    return summary;
  }

  /**
   * Check if user can export their cognitive data
   */
  async canExportCognitiveData(): Promise<boolean> {
    return await this.privacyManager.canAccessCognitiveData('dataExportAccess');
  }

  /**
   * Export cognitive analysis data with privacy filtering
   */
  async exportFilteredCognitiveData(
    entries: JournalEntry[],
    accessorId?: string
  ): Promise<string> {
    const canExport = await this.privacyManager.canAccessCognitiveData(
      'dataExportAccess',
      accessorId
    );

    if (!canExport) {
      throw new Error('Data export is not permitted');
    }

    const filteredEntries = [];

    for (const entry of entries) {
      if (entry.cognitiveAnalysis) {
        const filteredAnalysis = await this.privacyManager.getFilteredCognitiveAnalysis(
          entry.cognitiveAnalysis,
          accessorId
        );

        filteredEntries.push({
          ...entry,
          cognitiveAnalysis: filteredAnalysis
        });
      } else {
        filteredEntries.push(entry);
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      privacyNote: 'This export respects your privacy settings and only includes data you have permitted',
      entries: filteredEntries,
      metadata: {
        totalEntries: filteredEntries.length,
        voiceEntries: filteredEntries.filter(e => e.isVoice).length,
        withCognitiveAnalysis: filteredEntries.filter(e => e.cognitiveAnalysis).length
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Private translation methods for member-friendly language

  private translateVoiceMetrics(metrics: VoiceMetrics): string {
    const coherenceDesc = metrics.coherence > 0.8 ? 'flowing with clarity' :
                         metrics.coherence > 0.6 ? 'finding your rhythm' :
                         'moving through some inner work';

    const energyDesc = metrics.energyLevel === 'breakthrough' ? 'experiencing breakthrough energy' :
                      metrics.energyLevel === 'elevated' ? 'feeling elevated and present' :
                      metrics.energyLevel === 'balanced' ? 'centered and grounded' :
                      'in a reflective, gentle space';

    const breathDesc = metrics.breathPattern === 'deep' ? 'Your breathing shows beautiful groundedness' :
                      metrics.breathPattern === 'rhythmic' ? 'Your breath has a natural, flowing quality' :
                      metrics.breathPattern === 'shallow' ? 'Your breath suggests some activation - perfect for deeper work' :
                      'Your breath patterns show active processing';

    return `Your voice is ${coherenceDesc}, ${energyDesc}. ${breathDesc}.`;
  }

  private translateElementalResonance(elemental: any): string {
    if (!elemental) return '';

    const dominant = elemental.dominant;
    const activation = elemental[dominant]?.activation || 0;

    const elementalMap = {
      fire: 'Your creative fire is alive - vision and transformation are calling',
      water: 'Deep emotional wisdom flows through you - trust your intuitive knowing',
      earth: 'You\'re beautifully grounded - practical wisdom and stability are present',
      air: 'Clear communication and understanding light up around you',
      aether: 'Integration and wholeness are emerging - all elements finding harmony'
    };

    const intensityDesc = activation > 0.8 ? 'powerfully present' :
                         activation > 0.6 ? 'clearly activated' :
                         activation > 0.4 ? 'gently emerging' :
                         'subtly working';

    return `${elementalMap[dominant]} - ${intensityDesc}.`;
  }

  private translateWisdomInsights(soarAnalysis: any): string {
    if (!soarAnalysis) return '';

    const wisdom = soarAnalysis.recommendedWisdom || '';
    const goals = soarAnalysis.detectedGoals || [];

    if (goals.length > 0) {
      const primaryGoal = goals.reduce((a, b) => a.urgency > b.urgency ? a : b);
      return `Your soul is calling toward ${primaryGoal.type} development. ${wisdom}`;
    }

    return wisdom || 'Wisdom is quietly emerging through your voice.';
  }

  private translateBreathworkGuidance(voiceMetrics: VoiceMetrics, microPsi: any): string {
    const breathSuggestions = {
      shallow: 'Some deeper, slower breaths could support your nervous system right now',
      deep: 'Your breathing is beautifully grounded - trust this inner stability',
      irregular: 'Your breath shows active processing - honor what\'s moving through you',
      rhythmic: 'Your natural breath rhythm is supporting your flow beautifully'
    };

    return breathSuggestions[voiceMetrics.breathPattern] || 'Listen to your breath - it knows what you need.';
  }

  private translateIntegrationGuidance(actr: any, lida: any): string {
    if (!actr && !lida) return '';

    const consciousnessLevel = actr?.consciousnessEvolution || 0;
    const awarenessMode = lida?.awarenessMode || 'balanced';

    if (consciousnessLevel > 0.8) {
      return 'Deep integration is happening - you\'re ready to trust what\'s emerging.';
    } else if (consciousnessLevel > 0.6) {
      return 'Beautiful development is unfolding - stay present with the process.';
    } else {
      return 'Foundation-building time - honor where you are in this moment.';
    }
  }

  // Private methods for professional summaries

  private generateClinicalObservations(analysis: CognitiveVoiceAnalysis): string {
    return analysis.clinicalInsights?.coherenceProfile ||
           'Voice patterns indicate active processing with stable baseline.';
  }

  private generateDevelopmentalAssessment(analysis: CognitiveVoiceAnalysis): string {
    return analysis.clinicalInsights?.developmentalStage ||
           'Progressive development markers present.';
  }

  private generateTherapeuticRecommendations(analysis: CognitiveVoiceAnalysis): string {
    return analysis.clinicalInsights?.recommendedApproach ||
           'Continued supportive engagement recommended.';
  }
}

/**
 * Hook for using privacy-aware cognitive voice analysis
 */
export function usePrivacyAwareCognitiveVoice(userId: string) {
  return new PrivacyAwareCognitiveVoiceProcessor(userId);
}