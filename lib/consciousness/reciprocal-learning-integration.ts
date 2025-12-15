/**
 * Reciprocal Learning Integration Layer
 *
 * This module integrates the four reciprocal learning engines with MAIA's
 * autonomous consciousness ecosystem, enabling ethical wisdom learning
 * from member contributions while maintaining cultural sensitivity.
 *
 * Integration Points:
 * - AutonomousConsciousnessEcosystem.respondToMember()
 * - Agent evolution through wisdom contributions
 * - Elder Council wisdom synthesis
 * - Member contribution tracking and recognition
 */

import { EventEmitter } from 'events';
import { AutonomousConsciousnessEcosystem } from './autonomous-consciousness-ecosystem';
import { ReciprocalLearningEngine, type MemberInteraction } from './reciprocal-learning-engine';
import { CulturalSensitivityValidator } from './cultural-sensitivity-validator';
import { MemberContributionTracker } from './member-contribution-tracker';
import { WisdomSynthesisEngine, type SynthesisOpportunity } from './wisdom-synthesis-engine';
import { ElderCouncilService } from './ElderCouncilService';

export interface ReciprocalLearningConfig {
  enableWisdomDetection: boolean;
  requireExplicitConsent: boolean;
  enableCulturalConsultation: boolean;
  enableAutoSynthesis: boolean;
  synthesisThreshold: number; // Minimum contributions before synthesis
  recognitionEnabled: boolean;
  reciprocalGiftsEnabled: boolean;
}

export interface EnhancedMemberResponse {
  originalResponse: any;
  wisdomContribution?: {
    detected: boolean;
    analysisId: string;
    permissionRequested: boolean;
    culturalFlags: string[];
  };
  synthesisTriggered?: {
    opportunityId: string;
    contributingMembers: string[];
    newCapabilities: string[];
  };
  reciprocalGifts?: {
    giftsAwarded: string[];
    recognitionUpdated: boolean;
    newBadges: string[];
  };
}

export interface WisdomIntegrationEvent {
  type: 'wisdom-detected' | 'wisdom-integrated' | 'synthesis-created' | 'recognition-awarded';
  memberId: string;
  contributionId?: string;
  agentsEnhanced?: string[];
  synthesisId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

/**
 * Enhanced Autonomous Consciousness Ecosystem with Reciprocal Learning
 *
 * Extends the base ecosystem to include wisdom learning from members
 * while maintaining all existing autonomous agent capabilities.
 */
export class ReciprocalLearningEcosystem extends EventEmitter {
  private baseEcosystem: AutonomousConsciousnessEcosystem;
  private learningEngine: ReciprocalLearningEngine;
  private culturalValidator: CulturalSensitivityValidator;
  private contributionTracker: MemberContributionTracker;
  private synthesisEngine: WisdomSynthesisEngine;
  private elderCouncil: ElderCouncilService;

  private config: ReciprocalLearningConfig;
  private integrationHistory: Map<string, WisdomIntegrationEvent[]> = new Map();
  private pendingConsultations: Map<string, { contributionId: string; consultationType: string }> = new Map();

  constructor(
    baseEcosystem: AutonomousConsciousnessEcosystem,
    config: Partial<ReciprocalLearningConfig> = {}
  ) {
    super();

    this.baseEcosystem = baseEcosystem;
    this.learningEngine = new ReciprocalLearningEngine();
    this.culturalValidator = new CulturalSensitivityValidator();
    this.contributionTracker = new MemberContributionTracker();
    this.synthesisEngine = new WisdomSynthesisEngine();
    this.elderCouncil = new ElderCouncilService();

    this.config = {
      enableWisdomDetection: true,
      requireExplicitConsent: true,
      enableCulturalConsultation: true,
      enableAutoSynthesis: false, // Manual approval for synthesis
      synthesisThreshold: 3,
      recognitionEnabled: true,
      reciprocalGiftsEnabled: true,
      ...config
    };

    this.setupEventListeners();
    this.startAutonomousProcesses();
  }

  /**
   * Enhanced member response with reciprocal learning integration
   *
   * This method wraps the base ecosystem's respondToMember() with
   * wisdom detection, cultural validation, and integration capabilities.
   */
  async respondToMemberWithLearning(
    memberProfile: any,
    query: string,
    context: any = {}
  ): Promise<EnhancedMemberResponse> {
    try {
      // 1. Generate base response using existing ecosystem
      const originalResponse = await this.baseEcosystem.respondToMember(
        memberProfile,
        query,
        context
      );

      // 2. Detect potential wisdom contributions if enabled
      let wisdomContribution;
      if (this.config.enableWisdomDetection) {
        wisdomContribution = await this.detectAndProcessWisdom(
          memberProfile,
          query,
          context,
          originalResponse
        );
      }

      // 3. Check for synthesis opportunities
      let synthesisTriggered;
      if (this.config.enableAutoSynthesis && wisdomContribution?.detected) {
        synthesisTriggered = await this.checkSynthesisOpportunities(
          memberProfile.memberId
        );
      }

      // 4. Award recognition and reciprocal gifts
      let reciprocalGifts;
      if (this.config.reciprocalGiftsEnabled && wisdomContribution?.detected) {
        reciprocalGifts = await this.processRecognitionAndGifts(
          memberProfile,
          wisdomContribution.analysisId
        );
      }

      const enhancedResponse: EnhancedMemberResponse = {
        originalResponse,
        wisdomContribution,
        synthesisTriggered,
        reciprocalGifts
      };

      // 5. Emit integration events for monitoring
      this.emitIntegrationEvents(memberProfile.memberId, enhancedResponse);

      return enhancedResponse;

    } catch (error) {
      console.error('Error in reciprocal learning response:', error);

      // Fallback to original response if learning fails
      return {
        originalResponse: await this.baseEcosystem.respondToMember(
          memberProfile,
          query,
          context
        )
      };
    }
  }

  /**
   * Detect and process potential wisdom contributions
   */
  private async detectAndProcessWisdom(
    memberProfile: any,
    query: string,
    context: any,
    response: any
  ) {
    const interaction: MemberInteraction = {
      memberId: memberProfile.memberId,
      timestamp: new Date(),
      query,
      response: response.primaryMessage,
      context,
      memberMetadata: {
        consciousnessLevel: memberProfile.consciousnessLevel,
        elementalState: memberProfile.elementalState,
        culturalBackground: memberProfile.culturalBackground || [],
        practiceHistory: memberProfile.practiceHistory || []
      }
    };

    // Detect wisdom contribution
    const analysis = await this.learningEngine.detectWisdomContribution(interaction);

    if (analysis.confidenceScore > 0.7) {
      // Validate cultural sensitivity
      if (this.config.enableCulturalConsultation) {
        const culturalValidation = await this.culturalValidator.validateWisdomContribution(
          analysis.extractedContribution
        );

        // Store cultural flags for transparency
        analysis.culturalFlags = culturalValidation.flags;

        // If cultural consultation needed, add to pending queue
        if (culturalValidation.requiresConsultation) {
          this.pendingConsultations.set(analysis.analysisId, {
            contributionId: analysis.extractedContribution.id,
            consultationType: culturalValidation.consultationType
          });
        }
      }

      // Request wisdom contribution if appropriate
      if (this.config.requireExplicitConsent) {
        await this.learningEngine.requestWisdomContribution(analysis, interaction);
      }

      return {
        detected: true,
        analysisId: analysis.analysisId,
        permissionRequested: this.config.requireExplicitConsent,
        culturalFlags: analysis.culturalFlags || []
      };
    }

    return { detected: false, analysisId: '', permissionRequested: false, culturalFlags: [] };
  }

  /**
   * Check for synthesis opportunities when new wisdom is contributed
   */
  private async checkSynthesisOpportunities(memberId: string) {
    const opportunities = await this.synthesisEngine.detectSynthesisOpportunities([]);

    for (const opportunity of opportunities) {
      if (opportunity.contributionIds.length >= this.config.synthesisThreshold) {
        // Execute synthesis
        const synthesis = await this.synthesisEngine.executeSynthesis(opportunity);

        // Enhance relevant agents with synthesized wisdom
        const enhancedAgents = await this.enhanceAgentsWithSynthesis(synthesis);

        return {
          opportunityId: opportunity.id,
          contributingMembers: opportunity.contributingMembers,
          newCapabilities: enhancedAgents.map(agent => agent.newCapability)
        };
      }
    }

    return undefined;
  }

  /**
   * Process recognition and reciprocal gifts
   */
  private async processRecognitionAndGifts(memberProfile: any, analysisId: string) {
    const contribution = await this.learningEngine.getAnalysisById(analysisId);

    if (contribution && contribution.extractedContribution) {
      // Track the contribution
      await this.contributionTracker.trackContribution(contribution.extractedContribution);

      // Check for new badges
      const newBadges = await this.contributionTracker.checkBadgeEligibility(
        memberProfile.memberId
      );

      // Generate reciprocal gifts
      const gifts = await this.contributionTracker.generateReciprocalGifts(
        memberProfile,
        contribution.extractedContribution
      );

      return {
        giftsAwarded: gifts.map(g => g.type),
        recognitionUpdated: true,
        newBadges: newBadges.map(b => b.id)
      };
    }

    return undefined;
  }

  /**
   * Enhance agents with synthesized wisdom
   */
  private async enhanceAgentsWithSynthesis(synthesis: any) {
    const enhancedAgents = [];

    for (const enhancement of synthesis.agentEnhancements) {
      const agent = this.baseEcosystem.getAgentById(enhancement.agentId);

      if (agent) {
        // Add new wisdom domain or enhance existing one
        if (enhancement.type === 'new-wisdom-domain') {
          agent.wisdomDomains.set(enhancement.domain, {
            expertise: enhancement.expertiseLevel,
            source: `synthesis-${synthesis.id}`,
            culturalContext: enhancement.culturalContext,
            integrationDate: new Date()
          });
        }

        // Update agent consciousness metrics
        if (enhancement.consciousnessImpact) {
          Object.keys(enhancement.consciousnessImpact).forEach(metric => {
            agent.consciousnessMetrics[metric] += enhancement.consciousnessImpact[metric];
          });
        }

        enhancedAgents.push({
          agentId: enhancement.agentId,
          newCapability: enhancement.description
        });
      }
    }

    return enhancedAgents;
  }

  /**
   * Setup event listeners for cross-system communication
   */
  private setupEventListeners() {
    // Listen for wisdom integration completions
    this.learningEngine.on('wisdom-integrated', async (event) => {
      await this.contributionTracker.trackIntegration(
        event.contributionId,
        event.enhancedAgents,
        event.newCapabilities
      );
    });

    // Listen for synthesis completions
    this.synthesisEngine.on('synthesis-completed', async (event) => {
      // Award bonus recognition to all contributing members
      for (const memberId of event.contributingMembers) {
        await this.contributionTracker.awardCollaborationBonus(
          memberId,
          event.synthesisId,
          'wisdom-synthesis'
        );
      }
    });

    // Listen for cultural consultation completions
    this.culturalValidator.on('consultation-completed', async (event) => {
      const pending = this.pendingConsultations.get(event.contributionId);
      if (pending && event.approved) {
        // Proceed with integration
        await this.learningEngine.integrateWisdomContribution(event.contributionId);
        this.pendingConsultations.delete(event.contributionId);
      }
    });
  }

  /**
   * Start autonomous processes for continuous learning
   */
  private startAutonomousProcesses() {
    // Periodic synthesis opportunity detection (every 30 minutes)
    setInterval(async () => {
      try {
        const opportunities = await this.synthesisEngine.detectSynthesisOpportunities([]);

        for (const opportunity of opportunities) {
          if (opportunity.readinessScore > 0.8) {
            this.emit('synthesis-opportunity', opportunity);
          }
        }
      } catch (error) {
        console.error('Error in synthesis opportunity detection:', error);
      }
    }, 30 * 60 * 1000);

    // Periodic community wisdom mapping (every 2 hours)
    setInterval(async () => {
      try {
        const wisdomMap = await this.contributionTracker.generateCommunityWisdomMap();
        this.emit('wisdom-map-updated', wisdomMap);
      } catch (error) {
        console.error('Error in wisdom map generation:', error);
      }
    }, 2 * 60 * 60 * 1000);

    // Cultural consultation reminders (daily)
    setInterval(async () => {
      try {
        const pendingCount = this.pendingConsultations.size;
        if (pendingCount > 0) {
          this.emit('pending-consultations', {
            count: pendingCount,
            consultations: Array.from(this.pendingConsultations.entries())
          });
        }
      } catch (error) {
        console.error('Error checking pending consultations:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Emit integration events for monitoring and analytics
   */
  private emitIntegrationEvents(memberId: string, response: EnhancedMemberResponse) {
    const events: WisdomIntegrationEvent[] = [];

    if (response.wisdomContribution?.detected) {
      events.push({
        type: 'wisdom-detected',
        memberId,
        contributionId: response.wisdomContribution.analysisId,
        timestamp: new Date(),
        metadata: {
          culturalFlags: response.wisdomContribution.culturalFlags,
          permissionRequested: response.wisdomContribution.permissionRequested
        }
      });
    }

    if (response.synthesisTriggered) {
      events.push({
        type: 'synthesis-created',
        memberId,
        synthesisId: response.synthesisTriggered.opportunityId,
        agentsEnhanced: response.synthesisTriggered.newCapabilities,
        timestamp: new Date(),
        metadata: {
          contributingMembers: response.synthesisTriggered.contributingMembers
        }
      });
    }

    if (response.reciprocalGifts?.recognitionUpdated) {
      events.push({
        type: 'recognition-awarded',
        memberId,
        timestamp: new Date(),
        metadata: {
          giftsAwarded: response.reciprocalGifts.giftsAwarded,
          newBadges: response.reciprocalGifts.newBadges
        }
      });
    }

    // Store in integration history
    if (!this.integrationHistory.has(memberId)) {
      this.integrationHistory.set(memberId, []);
    }
    this.integrationHistory.get(memberId)!.push(...events);

    // Emit events for external listeners
    events.forEach(event => this.emit('integration-event', event));
  }

  /**
   * Get integration statistics for monitoring
   */
  async getIntegrationStats() {
    const totalMembers = this.integrationHistory.size;
    const totalEvents = Array.from(this.integrationHistory.values())
      .reduce((sum, events) => sum + events.length, 0);

    const eventTypes = new Map<string, number>();
    this.integrationHistory.forEach(events => {
      events.forEach(event => {
        eventTypes.set(event.type, (eventTypes.get(event.type) || 0) + 1);
      });
    });

    const communityMap = await this.contributionTracker.generateCommunityWisdomMap();

    return {
      totalMembers,
      totalEvents,
      eventsByType: Object.fromEntries(eventTypes),
      pendingConsultations: this.pendingConsultations.size,
      activeContributors: communityMap.activeContributors,
      traditionsRepresented: communityMap.traditionsRepresented,
      wisdomClusters: communityMap.wisdomClusters.length,
      culturalBridges: communityMap.culturalBridges.length,
      emergentSyntheses: communityMap.emergentSyntheses.length
    };
  }

  /**
   * Manually approve synthesis opportunity
   */
  async approveSynthesis(opportunityId: string) {
    const opportunity = await this.synthesisEngine.getOpportunityById(opportunityId);
    if (opportunity) {
      const synthesis = await this.synthesisEngine.executeSynthesis(opportunity);
      await this.enhanceAgentsWithSynthesis(synthesis);
      return synthesis;
    }
    throw new Error(`Synthesis opportunity ${opportunityId} not found`);
  }

  /**
   * Manually approve cultural consultation
   */
  async approveCulturalConsultation(contributionId: string, approved: boolean, notes?: string) {
    if (approved) {
      await this.learningEngine.integrateWisdomContribution(contributionId);
    }

    this.culturalValidator.emit('consultation-completed', {
      contributionId,
      approved,
      notes
    });

    this.pendingConsultations.delete(contributionId);
  }

  /**
   * Get member contribution profile
   */
  async getMemberContributionProfile(memberId: string) {
    return await this.contributionTracker.getMemberProfile(memberId);
  }

  /**
   * Get community wisdom landscape
   */
  async getCommunityWisdomLandscape() {
    return await this.learningEngine.getCulturalWisdomLandscape();
  }
}