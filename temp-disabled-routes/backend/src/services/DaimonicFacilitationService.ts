/**
 * Daimonic Facilitation Service
 * Main orchestrator for comprehensive daimonic encounter facilitation
 * Integrates all daimonic services with existing Spiralogic architecture
 */

import {
  OthernessManifestations,
  SynapticGapDynamics,
  DaimonicNarrative,
  CollectiveDaimonicField
} from '../types/daimonicFacilitation';
import { DaimonicOthernessService } from './DaimonicOthernessService';
import { SynapticSpaceAnalyzer } from './SynapticSpaceAnalyzer';
import { SyntheticEmergenceTracker, EmergenceEvent } from './SyntheticEmergenceTracker';
import { AntiSolipsisticValidator } from './AntiSolipsisticValidator';
import { ElementalOthernessService } from './ElementalOthernessService';
import { CollectiveDaimonicFieldService } from './CollectiveDaimonicFieldService';
import { IntegrationFailureTracker, FailureEvent } from './IntegrationFailureTracker';
import { DaimonicNarrativeGenerator } from './DaimonicNarrativeGenerator';

export interface DaimonicEncounterResult {
  narrative: DaimonicNarrative;
  manifestations: OthernessManifestations;
  synapticGaps: SynapticGapDynamics[];
  emergences: EmergenceEvent[];
  integrationFailures: FailureEvent[];
  othernessScore: number;
  collectiveField?: CollectiveDaimonicField;
  recommendations: DaimonicRecommendations;
}

export interface DaimonicRecommendations {
  primaryChannel: string;
  engagementStrategy: string;
  mysticismWarnings: string[];
  practicalGuidance: string[];
  ongoingPractices: string[];
}

export class DaimonicFacilitationService {
  private othernessService: DaimonicOthernessService;
  private synapticAnalyzer: SynapticSpaceAnalyzer;
  private emergenceTracker: SyntheticEmergenceTracker;
  private validator: AntiSolipsisticValidator;
  private elementalService: ElementalOthernessService;
  private collectiveService: CollectiveDaimonicFieldService;
  private failureTracker: IntegrationFailureTracker;
  private narrativeGenerator: DaimonicNarrativeGenerator;

  constructor() {
    this.othernessService = new DaimonicOthernessService();
    this.synapticAnalyzer = new SynapticSpaceAnalyzer();
    this.emergenceTracker = new SyntheticEmergenceTracker();
    this.validator = new AntiSolipsisticValidator();
    this.elementalService = new ElementalOthernessService();
    this.collectiveService = new CollectiveDaimonicFieldService();
    this.failureTracker = new IntegrationFailureTracker();
    this.narrativeGenerator = new DaimonicNarrativeGenerator(
      this.othernessService,
      this.synapticAnalyzer,
      this.emergenceTracker,
      this.validator,
      this.elementalService,
      this.failureTracker
    );
  }

  /**
   * Main entry point for daimonic encounter facilitation
   */
  async facilitateDaimonicEncounter(userId: string, profile: any): Promise<DaimonicEncounterResult> {
    try {
      // 1. Scan for otherness manifestations across all channels
      const manifestations = await this.othernessService.scanAllChannels(userId);

      // 2. Map synaptic gaps between self and Other
      const synapticGaps = await this.synapticAnalyzer.mapAllGaps(manifestations, userId);

      // 3. Track synthetic emergences
      const emergences = await this.emergenceTracker.trackEmergences(synapticGaps, manifestations, userId);

      // 4. Track integration failures (valuable)
      const integrationFailures = await this.failureTracker.trackIntegrationFailures(
        userId, manifestations, synapticGaps, emergences
      );

      // 5. Validate for genuine otherness (prevent solipsism)
      const othernessScore = await this.validateOtherness(manifestations, synapticGaps, emergences);

      // 6. Participate in collective field
      const collectiveField = await this.participateInCollectiveField(
        userId, manifestations, synapticGaps, emergences, profile
      );

      // 7. Generate comprehensive narrative
      const narrative = await this.narrativeGenerator.generateEncounterNarrative({
        userId,
        ...profile,
        manifestations,
        synapticGaps,
        emergences,
        integrationFailures
      });

      // 8. Generate practical recommendations
      const recommendations = await this.generateRecommendations(
        manifestations, synapticGaps, emergences, integrationFailures, othernessScore
      );

      return {
        narrative,
        manifestations,
        synapticGaps,
        emergences,
        integrationFailures,
        othernessScore,
        collectiveField,
        recommendations
      };

    } catch (error) {
      console.error('Error in daimonic encounter facilitation:', error);
      throw error;
    }
  }

  /**
   * Validate overall otherness and check for solipsism
   */
  private async validateOtherness(
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[]
  ): Promise<number> {
    const [
      manifestationValidations,
      gapValidations,
      emergenceValidations
    ] = await Promise.all([
      this.validator.validateManifestations(manifestations),
      this.validator.validateSynapticGaps(gaps),
      this.validator.validateEmergences(emergences)
    ]);

    // Calculate overall otherness score
    const allValidations = [...manifestationValidations, ...gapValidations, ...emergenceValidations];
    const validCount = allValidations.filter(v => v.valid).length;
    const totalScore = allValidations.reduce((sum, v) => sum + (v.othernessScore || 0), 0);

    return allValidations.length > 0 ? totalScore / allValidations.length : 0;
  }

  /**
   * Participate in collective daimonic field
   */
  private async participateInCollectiveField(
    userId: string,
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[],
    profile: any
  ): Promise<CollectiveDaimonicField> {
    // Add user to collective field
    await this.collectiveService.addParticipant(userId, manifestations, gaps, emergences, profile);

    // Analyze current collective field
    return await this.collectiveService.analyzeCollectiveField();
  }

  /**
   * Generate practical recommendations
   */
  private async generateRecommendations(
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[],
    failures: FailureEvent[],
    othernessScore: number
  ): Promise<DaimonicRecommendations> {
    
    // Identify primary channel for engagement
    const primaryChannel = await this.identifyPrimaryChannel(manifestations, gaps);

    // Generate engagement strategy
    const engagementStrategy = this.generateEngagementStrategy(primaryChannel, gaps, othernessScore);

    // Generate mysticism warnings
    const mysticismWarnings = this.generateMysticismWarnings(othernessScore, failures);

    // Generate practical guidance
    const practicalGuidance = this.generatePracticalGuidance(primaryChannel, manifestations);

    // Generate ongoing practices
    const ongoingPractices = this.generateOngoingPractices(primaryChannel, gaps, failures);

    return {
      primaryChannel,
      engagementStrategy,
      mysticismWarnings,
      practicalGuidance,
      ongoingPractices
    };
  }

  /**
   * Identify the most active/important channel for engagement
   */
  private async identifyPrimaryChannel(
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[]
  ): Promise<string> {
    // Calculate activity scores for each channel
    const channelScores = Object.entries(manifestations).map(([channel, items]) => {
      const count = items.length;
      const intensity = this.getChannelIntensity(channel, items);
      const gapSupport = gaps.filter(gap => gap.gapCharge > 0.6).length;
      
      return {
        channel,
        score: (count * intensity) + (gapSupport * 0.1)
      };
    }).sort((a, b) => b.score - a.score);

    return channelScores.length > 0 ? channelScores[0].channel : 'general';
  }

  private getChannelIntensity(channel: string, items: any[]): number {
    const intensityWeights: Record<string, number> = {
      failures: 0.9,
      obstacles: 0.85,
      dreams: 0.8,
      synchronicities: 0.8,
      symptoms: 0.75,
      visions: 0.7,
      ideas: 0.65,
      sessions: 0.6,
      dialogues: 0.55,
      conversations: 0.5
    };

    return intensityWeights[channel] || 0.4;
  }

  /**
   * Generate engagement strategy
   */
  private generateEngagementStrategy(
    primaryChannel: string,
    gaps: SynapticGapDynamics[],
    othernessScore: number
  ): string {
    const highChargeGaps = gaps.filter(gap => gap.gapCharge > 0.7).length;
    const stableGaps = gaps.filter(gap => gap.gapStability === 'stable').length;

    if (othernessScore < 0.4) {
      return "Increase engagement with genuine otherness. Look for what challenges your assumptions and resists your control.";
    }

    if (highChargeGaps > 2) {
      return "Work with high-charge encounters by staying in the tension rather than resolving it quickly.";
    }

    if (stableGaps > 1) {
      return "Honor the stable distances between you and the Other. Not everything is meant to be integrated.";
    }

    switch (primaryChannel) {
      case 'failures':
        return "Engage with your failures as initiatory experiences. Ask what they're trying to redirect you toward.";
      
      case 'obstacles':
        return "Stop trying to overcome chronic obstacles. Instead, ask what they're protecting or redirecting.";
      
      case 'dreams':
        return "Relate to dream figures as autonomous beings with their own intelligence and agenda.";
      
      case 'symptoms':
        return "Listen to your body's intelligence as communications from an Other with its own wisdom.";
      
      case 'synchronicities':
        return "Pay attention to meaningful coincidences as reality's participation in your development.";
      
      default:
        return "Engage with whatever form of otherness is most active in your life right now.";
    }
  }

  /**
   * Generate warnings about spiritual materialism/bypassing
   */
  private generateMysticismWarnings(othernessScore: number, failures: FailureEvent[]): string[] {
    const warnings: string[] = [];

    if (othernessScore > 0.8 && failures.length === 0) {
      warnings.push("Beware of spiritual inflation - genuine encounter should maintain some creative tension and unresolved elements.");
    }

    if (failures.filter(f => f.failureType === 'premature').length > 2) {
      warnings.push("You may be integrating encounters too quickly. Allow more time for metabolizing otherness.");
    }

    warnings.push("Don't turn daimonic encounters into spiritual concepts. Maintain the lived relationship with otherness.");
    warnings.push("Avoid using daimonic insights to feel special or enlightened. They're meant to make you more human, not more spiritual.");

    return warnings;
  }

  /**
   * Generate practical guidance
   */
  private generatePracticalGuidance(primaryChannel: string, manifestations: OthernessManifestations): string[] {
    const guidance: string[] = [];

    switch (primaryChannel) {
      case 'failures':
        guidance.push("Keep a failure journal - track what fails repeatedly and look for patterns");
        guidance.push("When something fails, ask: 'What is this failure protecting me from?' and 'What is it redirecting me toward?'");
        break;
        
      case 'obstacles':
        guidance.push("Map your chronic obstacles and identify their protective/redirective functions");
        guidance.push("Instead of fighting obstacles, engage them in dialogue: 'What do you need from me?'");
        break;
        
      case 'dreams':
        guidance.push("Keep a dream journal focused on autonomous characters and unresolvable elements");
        guidance.push("Practice active imagination with dream figures - let them speak for themselves");
        break;
        
      case 'symptoms':
        guidance.push("Track physical symptoms alongside life circumstances - look for meaningful connections");
        guidance.push("Ask your body: 'What are you trying to tell me?' and listen for the response");
        break;
        
      case 'synchronicities':
        guidance.push("Keep a synchronicity log - track meaningful coincidences and timing");
        guidance.push("Pay attention to what synchronicities cluster around - these are areas of active dialogue");
        break;
    }

    guidance.push("Remember: the goal is not resolution but deepening relationship with otherness");

    return guidance;
  }

  /**
   * Generate ongoing practices
   */
  private generateOngoingPractices(
    primaryChannel: string,
    gaps: SynapticGapDynamics[],
    failures: FailureEvent[]
  ): string[] {
    const practices: string[] = [];

    // Channel-specific practices
    switch (primaryChannel) {
      case 'dreams':
        practices.push("Daily: Record dreams focusing on what remains mysterious");
        practices.push("Weekly: Engage in active imagination dialogue with dream figures");
        break;
        
      case 'obstacles':
        practices.push("Daily: Notice what you're fighting against and ask what it's protecting");
        practices.push("Monthly: Review chronic patterns and their redirective functions");
        break;
        
      case 'failures':
        practices.push("Weekly: Reflect on what failed and what it revealed or redirected");
        practices.push("Monthly: Map failure patterns for deeper initiatory purposes");
        break;
    }

    // Gap-specific practices
    const stableGaps = gaps.filter(gap => gap.gapStability === 'stable').length;
    if (stableGaps > 0) {
      practices.push("Daily: Spend time in contemplation of what remains unresolved");
      practices.push("Resist the urge to force resolution - value the ongoing tension");
    }

    // Integration failure practices
    const valuableFailures = failures.filter(f => f.ongoingValue > 0.6).length;
    if (valuableFailures > 0) {
      practices.push("Weekly: Honor what refuses to be integrated as wisdom");
      practices.push("Monthly: Reflect on the value of your integration failures");
    }

    // General daimonic practices
    practices.push("Daily: Notice what arrives unexpectedly or challenges your plans");
    practices.push("Weekly: Reflect on encounters with genuine otherness");
    practices.push("Monthly: Review the ongoing dialogue between self and Other");

    return practices;
  }

  /**
   * Integration with existing Spiralogic query processing
   */
  async enhanceSpiralogicQuery(query: any, spiralogicResponse: any): Promise<any> {
    try {
      // Run daimonic analysis in parallel with Spiralogic processing
      const daimonicResult = await this.facilitateDaimonicEncounter(query.userId, query);

      // Enhance Spiralogic response with daimonic insights
      const enhancedResponse = {
        ...spiralogicResponse,
        daimonicEnhancement: {
          othernessScore: daimonicResult.othernessScore,
          primaryChannel: daimonicResult.recommendations.primaryChannel,
          mysticismWarnings: daimonicResult.recommendations.mysticismWarnings,
          integrationGuidance: this.generateIntegrationGuidance(daimonicResult),
          ongoingPractices: daimonicResult.recommendations.ongoingPractices.slice(0, 2) // Limit for brevity
        }
      };

      // Add daimonic narrative as supplement
      if (daimonicResult.othernessScore > 0.6) {
        enhancedResponse.daimonicNarrative = {
          opening: daimonicResult.narrative.opening,
          keyInsights: daimonicResult.narrative.insights.slice(0, 3), // Top 3 insights
          warnings: daimonicResult.narrative.warnings
        };
      }

      return enhancedResponse;

    } catch (error) {
      console.error('Error enhancing Spiralogic query with daimonic facilitation:', error);
      // Return original response if daimonic enhancement fails
      return spiralogicResponse;
    }
  }

  /**
   * Generate integration guidance for Spiralogic response
   */
  private generateIntegrationGuidance(result: DaimonicEncounterResult): string[] {
    const guidance: string[] = [];

    if (result.othernessScore < 0.4) {
      guidance.push("Seek more challenging encounters that resist your understanding");
    }

    if (result.integrationFailures.length === 0) {
      guidance.push("Allow some aspects to remain unintegrated - not everything should be resolved");
    }

    const highChargeGaps = result.synapticGaps.filter(gap => gap.gapCharge > 0.7).length;
    if (highChargeGaps > 0) {
      guidance.push("Stay in the tension between self and Other rather than collapsing the distance");
    }

    if (result.recommendations.primaryChannel === 'failures') {
      guidance.push("Your failures are initiatory experiences - engage them as teachers");
    }

    return guidance;
  }

  /**
   * Get user's ongoing daimonic relationship status
   */
  async getDaimonicRelationshipStatus(userId: string): Promise<{
    activeChannels: string[];
    othernessScore: number;
    ongoingFailures: number;
    stableGaps: number;
    lastEncounter: Date | null;
  }> {
    try {
      const manifestations = await this.othernessService.scanAllChannels(userId);
      const gaps = await this.synapticAnalyzer.mapAllGaps(manifestations, userId);
      const othernessScore = await this.othernessService.assessOthernessIntensity(manifestations);
      
      const activeChannels = Object.entries(manifestations)
        .filter(([_, items]) => items.length > 0)
        .map(([channel, _]) => channel)
        .slice(0, 3);

      const stableGaps = gaps.filter(gap => gap.gapStability === 'stable').length;
      
      // This would track ongoing failures from the failure tracker
      const ongoingFailures = 0; // Placeholder

      return {
        activeChannels,
        othernessScore,
        ongoingFailures,
        stableGaps,
        lastEncounter: new Date() // Would track actual last encounter
      };

    } catch (error) {
      console.error('Error getting daimonic relationship status:', error);
      return {
        activeChannels: [],
        othernessScore: 0,
        ongoingFailures: 0,
        stableGaps: 0,
        lastEncounter: null
      };
    }
  }
}