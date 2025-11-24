/**
 * Progression Invitation Service
 * 
 * Respects user autonomy by offering stage progression only when:
 * 1. System detects readiness signals
 * 2. User has explicitly requested more depth/complexity
 * 3. User chooses to progress (never automatic)
 * 
 * Core principle: "Not ours to say, just support"
 */

import { EthicalCollectiveIntelligence, UserProgressionReadiness } from './EthicalCollectiveIntelligence';
import { CapacitySignalsFramework, PersonalOracleStage } from '../core/CapacitySignalsFramework';
import { EventBus } from '../core/EventBus';
import { UnifiedStorageService } from '../core/UnifiedStorageService';

export interface ProgressionInvitation {
  id: string;
  userId: string;
  currentStage: PersonalOracleStage;
  proposedStage?: PersonalOracleStage;
  
  // User choice - never automatic
  message: string;
  options: ProgressionOption[];
  
  // Context for invitation
  readinessSignals: ReadinessSignals;
  userRequest: boolean; // True if user explicitly requested progression
  
  // Tracking
  offered: Date;
  responded?: Date;
  userChoice?: string;
  reasoning?: string; // If user provides reasoning for choice
}

export interface ProgressionOption {
  id: string;
  label: string;
  description: string;
  nextStage?: PersonalOracleStage;
  expectation: string; // What this choice means for the user
}

export interface ReadinessSignals {
  // Self-reported only
  explicitReadinessRequests: number; // "I want more depth"
  satisfactionWithCurrent: number;   // 0-1, from user feedback
  comfortWithComplexity: boolean;    // User says "I can handle more"
  
  // Behavioral (descriptive, not evaluative)
  consistentEngagement: boolean;     // Regular participation
  integratingInsights: boolean;      // Reports trying suggestions
  maintainingGrounding: boolean;     // No safety concerns
  requestingDepth: boolean;          // Asks follow-up questions
  
  // System confidence in assessment
  confidence: number; // 0-1
}

export class ProgressionInvitationService {
  private collectiveIntelligence: EthicalCollectiveIntelligence;
  private capacityFramework: CapacitySignalsFramework;
  private storage: UnifiedStorageService;
  private eventBus: EventBus;
  
  // Active invitations per user
  private activeInvitations: Map<string, ProgressionInvitation> = new Map();
  
  constructor(
    collectiveIntelligence: EthicalCollectiveIntelligence,
    capacityFramework: CapacitySignalsFramework,
    storage: UnifiedStorageService,
    eventBus: EventBus
  ) {
    this.collectiveIntelligence = collectiveIntelligence;
    this.capacityFramework = capacityFramework;
    this.storage = storage;
    this.eventBus = eventBus;
    
    this.setupEventHandlers();
  }

  /**
   * Detect readiness signals - conservative, multi-factor assessment
   */
  async detectReadinessSignals(
    userId: string,
    userProfile: any,
    sessionHistory: any[]
  ): Promise<ReadinessSignals> {
    
    const readiness = await this.collectiveIntelligence.assessProgressionReadiness(
      userId,
      userProfile,
      sessionHistory
    );
    
    return {
      explicitReadinessRequests: readiness.explicitReadinessRequests,
      satisfactionWithCurrent: readiness.selfReportedSatisfaction,
      comfortWithComplexity: readiness.explicitComfortWithComplexity,
      consistentEngagement: readiness.sessionConsistency > 0.5,
      integratingInsights: readiness.integrationReports > 2,
      maintainingGrounding: await this.checkGroundingMaintenance(userId),
      requestingDepth: readiness.questionAsking > 3,
      confidence: this.calculateConfidence(readiness)
    };
  }

  /**
   * Offer progression choice when appropriate (never automatic)
   */
  async offerProgressionChoice(
    userId: string,
    currentStage: PersonalOracleStage,
    readinessSignals: ReadinessSignals
  ): Promise<ProgressionInvitation | null> {
    
    // Only offer if multiple readiness criteria met
    if (!this.shouldOfferProgression(readinessSignals)) {
      return null;
    }
    
    // Check if we already have an active invitation
    if (this.activeInvitations.has(userId)) {
      return null;
    }
    
    const invitation = this.createProgressionInvitation(
      userId,
      currentStage,
      readinessSignals
    );
    
    // Store active invitation
    this.activeInvitations.set(userId, invitation);
    
    // Record invitation offered
    await this.recordInvitationOffered(invitation);
    
    return invitation;
  }

  /**
   * Process user choice on progression invitation
   */
  async processUserChoice(
    userId: string,
    invitationId: string,
    choice: string,
    reasoning?: string
  ): Promise<{
    newStage: PersonalOracleStage;
    acknowledgment: string;
    supportMessage: string;
  }> {
    
    const invitation = this.activeInvitations.get(userId);
    if (!invitation || invitation.id !== invitationId) {
      throw new Error('Invalid or expired invitation');
    }
    
    // Update invitation with user choice
    invitation.responded = new Date();
    invitation.userChoice = choice;
    invitation.reasoning = reasoning;
    
    // Find chosen option
    const chosenOption = invitation.options.find(opt => opt.id === choice);
    if (!chosenOption) {
      throw new Error('Invalid choice option');
    }
    
    // Determine new stage
    const newStage = chosenOption.nextStage || invitation.currentStage;
    
    // Generate acknowledgment and support
    const response = this.generateChoiceResponse(chosenOption, reasoning);
    
    // Record choice
    await this.recordChoiceMade(invitation, chosenOption);
    
    // Remove active invitation
    this.activeInvitations.delete(userId);
    
    // Emit stage change event if applicable
    if (newStage !== invitation.currentStage) {
      await this.eventBus.emit('user:stage_progression_chosen', {
        userId,
        fromStage: invitation.currentStage,
        toStage: newStage,
        userChoice: choice,
        reasoning: reasoning || 'No reasoning provided'
      });
    }
    
    return {
      newStage,
      acknowledgment: response.acknowledgment,
      supportMessage: response.supportMessage
    };
  }

  /**
   * Handle explicit user requests for progression assessment
   */
  async handleExplicitProgressionRequest(
    userId: string,
    userMessage: string,
    currentStage: PersonalOracleStage
  ): Promise<{
    canProgress: boolean;
    response: string;
    invitation?: ProgressionInvitation;
  }> {
    
    // User explicitly asked - respect their autonomy
    const userProfile = await this.getUserProfile(userId);
    const sessionHistory = await this.getSessionHistory(userId);
    
    const readinessSignals = await this.detectReadinessSignals(
      userId,
      userProfile,
      sessionHistory
    );
    
    // Even if system thinks they're not ready, respect their request
    // but provide honest feedback
    
    if (readinessSignals.confidence < 0.3) {
      return {
        canProgress: false,
        response: this.generateNotReadyResponse(readinessSignals),
        invitation: undefined
      };
    }
    
    // Create invitation based on explicit request
    const invitation = await this.offerProgressionChoice(
      userId,
      currentStage,
      { ...readinessSignals, explicitReadinessRequests: readinessSignals.explicitReadinessRequests + 1 }
    );
    
    return {
      canProgress: true,
      response: "I hear your interest in exploring differently. Let me offer you some choices:",
      invitation
    };
  }

  /**
   * Check if user should be offered progression (conservative criteria)
   */
  private shouldOfferProgression(signals: ReadinessSignals): boolean {
    // Multiple criteria must be met
    const hasExplicitInterest = signals.explicitReadinessRequests >= 2;
    const isSatisfiedButReady = signals.satisfactionWithCurrent > 0.6 && signals.comfortWithComplexity;
    const hasStableEngagement = signals.consistentEngagement && signals.maintainingGrounding;
    const showsIntegration = signals.integratingInsights && signals.requestingDepth;
    const systemConfident = signals.confidence > 0.7;
    
    return hasExplicitInterest && isSatisfiedButReady && hasStableEngagement && showsIntegration && systemConfident;
  }

  private createProgressionInvitation(
    userId: string,
    currentStage: PersonalOracleStage,
    signals: ReadinessSignals
  ): ProgressionInvitation {
    
    const nextStage = this.getNextStage(currentStage);
    const invitationId = this.generateInvitationId(userId);
    
    return {
      id: invitationId,
      userId,
      currentStage,
      proposedStage: nextStage,
      message: this.generateInvitationMessage(currentStage, signals),
      options: this.generateProgressionOptions(currentStage, nextStage),
      readinessSignals: signals,
      userRequest: signals.explicitReadinessRequests > 0,
      offered: new Date()
    };
  }

  private generateInvitationMessage(
    currentStage: PersonalOracleStage,
    signals: ReadinessSignals
  ): string {
    
    const currentLabel = this.getStageLabel(currentStage);
    
    if (signals.explicitReadinessRequests > 1) {
      return `You've expressed interest in more depth, and your engagement suggests you're ready to explore differently. What feels right for you at this point in your journey?`;
    }
    
    return `Your consistent engagement and integration at the ${currentLabel} level suggests you might be ready for a different kind of exploration. The choice is entirely yours - what resonates?`;
  }

  private generateProgressionOptions(
    currentStage: PersonalOracleStage,
    nextStage?: PersonalOracleStage
  ): ProgressionOption[] {
    
    const currentLabel = this.getStageLabel(currentStage);
    const nextLabel = nextStage ? this.getStageLabel(nextStage) : '';
    
    const options: ProgressionOption[] = [
      {
        id: 'continue_current',
        label: 'Continue here',
        description: `Keep developing at the ${currentLabel} level`,
        nextStage: currentStage,
        expectation: 'We\'ll continue working in the same style that\'s been serving you'
      },
      {
        id: 'pause_integrate',
        label: 'Take integration time',
        description: 'Pause active exploration to consolidate what you\'ve learned',
        nextStage: currentStage,
        expectation: 'We\'ll focus on grounding and integration of existing insights'
      }
    ];
    
    if (nextStage && nextStage !== currentStage) {
      options.splice(1, 0, {
        id: 'progress_next',
        label: 'Explore more complexity',
        description: `Move toward ${nextLabel} level interactions`,
        nextStage: nextStage,
        expectation: this.getStageExpectation(nextStage)
      });
    }
    
    return options;
  }

  private getStageExpectation(stage: PersonalOracleStage): string {
    const expectations = {
      'structured_guide': 'Clear, practical guidance with strong supportive structure',
      'dialogical_companion': 'More questioning and exploration, less direct answers',
      'co_creative_partner': 'Collaborative meaning-making with paradox and complexity',
      'transparent_prism': 'Full transparency about the process with mastery-level simplicity'
    };
    
    return expectations[stage] || 'A different style of interaction';
  }

  private generateChoiceResponse(
    option: ProgressionOption,
    reasoning?: string
  ): {
    acknowledgment: string;
    supportMessage: string;
  } {
    
    let acknowledgment = `I hear your choice to ${option.label.toLowerCase()}.`;
    
    if (reasoning) {
      acknowledgment += ` Your reasoning - "${reasoning}" - shows thoughtful self-awareness.`;
    }
    
    const supportMessages = {
      'continue_current': 'There\'s wisdom in recognizing what serves you. We\'ll continue building on what\'s working.',
      'progress_next': 'Your readiness to engage with more complexity honors your growth. We\'ll move thoughtfully into new territory.',
      'pause_integrate': 'Taking time to integrate is often the most mature choice. Real development happens in the spaces between active learning.'
    };
    
    const supportMessage = supportMessages[option.id as keyof typeof supportMessages] || 'I\'ll support whatever approach serves your development.';
    
    return { acknowledgment, supportMessage };
  }

  private generateNotReadyResponse(signals: ReadinessSignals): string {
    const gaps: string[] = [];
    
    if (signals.explicitReadinessRequests < 2) {
      gaps.push('more time to explore what \'readiness\' means for you');
    }
    
    if (signals.satisfactionWithCurrent < 0.6) {
      gaps.push('finding more value in your current level before moving on');
    }
    
    if (!signals.consistentEngagement) {
      gaps.push('building more consistency in your practice');
    }
    
    if (!signals.integratingInsights) {
      gaps.push('more integration of current insights into daily life');
    }
    
    const gapsText = gaps.length > 0 
      ? `The areas that might benefit from more attention include: ${gaps.join(', ')}.`
      : 'It seems like there\'s more richness to discover at your current level.';
    
    return `I appreciate your interest in progressing. ${gapsText} Your current pace of development is exactly right - there\'s no rush. What aspects of your current explorations feel most alive to you?`;
  }

  // Utility methods
  
  private async checkGroundingMaintenance(userId: string): Promise<boolean> {
    // Check recent safety signals
    const recentSignals = await this.capacityFramework.getCurrentSignals(userId);
    return recentSignals ? !recentSignals.safetyFlag : true;
  }

  private calculateConfidence(readiness: UserProgressionReadiness): number {
    let confidence = 0.5; // Base confidence
    
    if (readiness.explicitReadinessRequests > 1) confidence += 0.2;
    if (readiness.selfReportedSatisfaction > 0.7) confidence += 0.15;
    if (readiness.explicitComfortWithComplexity) confidence += 0.15;
    if (readiness.sessionConsistency > 0.5) confidence += 0.1;
    if (readiness.integrationReports > 2) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private getNextStage(currentStage: PersonalOracleStage): PersonalOracleStage | undefined {
    const progression: Record<PersonalOracleStage, PersonalOracleStage | undefined> = {
      'structured_guide': 'dialogical_companion',
      'dialogical_companion': 'co_creative_partner',
      'co_creative_partner': 'transparent_prism',
      'transparent_prism': undefined // No next stage
    };
    
    return progression[currentStage];
  }

  private getStageLabel(stage: PersonalOracleStage): string {
    const labels: Record<PersonalOracleStage, string> = {
      'structured_guide': 'Structured Guide',
      'dialogical_companion': 'Dialogical Companion', 
      'co_creative_partner': 'Co-Creative Partner',
      'transparent_prism': 'Transparent Prism'
    };
    
    return labels[stage];
  }

  private generateInvitationId(userId: string): string {
    return `invitation_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private async getUserProfile(userId: string): Promise<any> {
    const result = await this.storage.query({
      entityType: 'UserProfile',
      userId,
      limit: 1
    });
    
    return result.data[0] || {};
  }

  private async getSessionHistory(userId: string): Promise<any[]> {
    const result = await this.storage.query({
      entityType: 'SessionContext',
      userId,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.data;
  }

  private async recordInvitationOffered(invitation: ProgressionInvitation): Promise<void> {
    await this.storage.create({
      ...invitation,
      entityType: 'ProgressionInvitation'
    });
  }

  private async recordChoiceMade(
    invitation: ProgressionInvitation,
    chosenOption: ProgressionOption
  ): Promise<void> {
    
    await this.storage.update(invitation.id, {
      responded: new Date(),
      userChoice: chosenOption.id,
      reasoning: invitation.reasoning
    });
    
    // Also record in user progression history
    await this.storage.create({
      entityType: 'UserProgressionChoice',
      userId: invitation.userId,
      invitationId: invitation.id,
      choice: chosenOption.id,
      reasoning: invitation.reasoning,
      fromStage: invitation.currentStage,
      toStage: chosenOption.nextStage,
      timestamp: new Date()
    });
  }

  private setupEventHandlers(): void {
    // Listen for explicit progression requests in user messages
    this.eventBus.subscribe('user:message_analyzed', async (event) => {
      const progressionKeywords = [
        /ready for more/i,
        /want.*deeper/i,
        /more complex/i,
        /next level/i,
        /ready to progress/i
      ];
      
      const hasProgressionRequest = progressionKeywords.some(pattern => 
        pattern.test(event.data.message)
      );
      
      if (hasProgressionRequest) {
        await this.eventBus.emit('user:progression_request_detected', {
          userId: event.data.userId,
          message: event.data.message,
          currentStage: event.data.currentStage,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Public interface methods
   */
  
  getActiveInvitation(userId: string): ProgressionInvitation | undefined {
    return this.activeInvitations.get(userId);
  }

  async getUserProgressionHistory(userId: string): Promise<any[]> {
    const result = await this.storage.query({
      entityType: 'UserProgressionChoice',
      userId,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    return result.data;
  }

  cancelActiveInvitation(userId: string): boolean {
    return this.activeInvitations.delete(userId);
  }
}