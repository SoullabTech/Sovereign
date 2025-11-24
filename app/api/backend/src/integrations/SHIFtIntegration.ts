/**
 * SHIFt Integration Helper
 * 
 * Provides easy integration methods for agents to emit SHIFt data
 * and retrieve user profiles for personalization.
 */

import { SHIFtInferenceService } from '../services/SHIFtInferenceService';
import { SHIFtProfileResponse } from '../types/shift';
import { logger } from '../utils/logger';

export class SHIFtIntegration {
  private static instance: SHIFtIntegration | null = null;
  private shiftService: SHIFtInferenceService;

  private constructor() {
    this.shiftService = new SHIFtInferenceService();
  }

  static getInstance(): SHIFtIntegration {
    if (!SHIFtIntegration.instance) {
      SHIFtIntegration.instance = new SHIFtIntegration();
    }
    return SHIFtIntegration.instance;
  }

  /**
   * Emit session data for SHIFt inference
   */
  async emitSession(
    userId: string,
    sessionId: string,
    conversationText: string,
    events: Array<{ type: string; payload: any }> = [],
    metrics?: {
      streakDays?: number;
      tasksCompleted?: number;
      journalEntries?: number;
    }
  ): Promise<void> {
    try {
      await this.shiftService.ingest({
        userId,
        sessionId,
        text: conversationText,
        events,
        metrics
      });

      logger.debug('SHIFt session emitted', {
        userId,
        sessionId,
        textLength: conversationText.length,
        eventCount: events.length
      });
    } catch (error) {
      logger.error('Error emitting SHIFt session:', error);
      // Don't throw - SHIFt should be non-blocking
    }
  }

  /**
   * Get user's SHIFt profile for personalization
   */
  async getUserProfile(userId: string): Promise<SHIFtProfileResponse | null> {
    try {
      return await this.shiftService.getProfile(userId);
    } catch (error) {
      logger.error('Error getting SHIFt profile:', error);
      return null;
    }
  }

  /**
   * Get elemental guidance for voice/personality selection
   */
  async getElementalGuidance(userId: string): Promise<{
    dominantElement: string;
    elementalBalance: Record<string, number>;
    voiceRecommendation: string;
    personalityAdjustments: string[];
  } | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return null;

      // Find dominant element
      const elements = profile.elements;
      const dominantElement = Object.entries(elements)
        .filter(([key]) => key !== 'confidence')
        .reduce((max, [key, value]) => 
          (value as number) > elements[max as keyof typeof elements] ? key : max, 'fire');

      // Voice recommendations based on elemental balance
      const voiceRecommendation = this.getVoiceRecommendation(dominantElement, elements);
      
      // Personality adjustments
      const personalityAdjustments = this.getPersonalityAdjustments(profile);

      return {
        dominantElement,
        elementalBalance: {
          fire: elements.fire,
          earth: elements.earth,
          water: elements.water,
          air: elements.air,
          aether: elements.aether
        },
        voiceRecommendation,
        personalityAdjustments
      };
    } catch (error) {
      logger.error('Error getting elemental guidance:', error);
      return null;
    }
  }

  /**
   * Get suggested practices based on profile
   */
  async getSuggestedPractice(userId: string): Promise<{
    title: string;
    steps: string[];
    targetAreas: string[];
  } | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile?.practice) return null;

      return {
        title: profile.practice.title,
        steps: profile.practice.steps,
        targetAreas: this.getTargetAreasFromFacets(profile.facets)
      };
    } catch (error) {
      logger.error('Error getting suggested practice:', error);
      return null;
    }
  }

  /**
   * Get narrative summary for session context
   */
  async getNarrativeSummary(userId: string): Promise<string | null> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.narrative || null;
    } catch (error) {
      logger.error('Error getting narrative summary:', error);
      return null;
    }
  }

  /**
   * Get current phase for guidance style
   */
  async getCurrentPhase(userId: string): Promise<{
    primary: string;
    secondary: string;
    guidance: string;
  } | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return null;

      return {
        primary: profile.phase.primary,
        secondary: profile.phase.secondary,
        guidance: this.getPhaseGuidance(profile.phase.primary)
      };
    } catch (error) {
      logger.error('Error getting current phase:', error);
      return null;
    }
  }

  // Private helper methods

  private getVoiceRecommendation(dominantElement: string, elements: any): string {
    const { fire, earth, water, air, aether } = elements;

    if (fire > 70 && earth < 40) {
      return 'Use Emily voice with more grounding tone - high inspiration needs earthing';
    } else if (water > 70 && air < 40) {
      return 'Use Aunt Annie with gentle clarity - strong emotions need wise perspective';
    } else if (air > 70 && water < 40) {
      return 'Use Emily with warmer tone - clear thinking could use heart connection';
    } else if (earth > 70) {
      return 'Use Aunt Annie with encouraging tone - solid foundation ready for growth';
    } else if (aether > 70) {
      return 'Use contemplative tone - high wisdom integration active';
    } else {
      return 'Use balanced Maya tone - elemental harmony present';
    }
  }

  private getPersonalityAdjustments(profile: SHIFtProfileResponse): string[] {
    const adjustments: string[] = [];
    
    // Check for low facets that need support
    const lowFacets = profile.facets.filter(f => f.score < 40);
    
    lowFacets.forEach(facet => {
      switch (facet.code) {
        case 'F2_Courage':
          adjustments.push('Encourage gentle truth-telling and brave action');
          break;
        case 'E2_Grounding':
          adjustments.push('Emphasize practical steps and daily routines');
          break;
        case 'W2_Belonging':
          adjustments.push('Highlight connection and community support');
          break;
        case 'A1_Reflection':
          adjustments.push('Invite meta-cognitive awareness and reflection');
          break;
        case 'C2_Integrity':
          adjustments.push('Gently point toward word-deed alignment');
          break;
        default:
          adjustments.push(`Support ${facet.label.toLowerCase()}`);
      }
    });

    // Phase-based adjustments
    switch (profile.phase.primary) {
      case 'initiation':
        adjustments.push('Use encouraging, supportive tone for new beginnings');
        break;
      case 'grounding':
        adjustments.push('Emphasize stability, routine, and practical wisdom');
        break;
      case 'collaboration':
        adjustments.push('Highlight relationship dynamics and co-creation');
        break;
      case 'transformation':
        adjustments.push('Support deep change with compassionate guidance');
        break;
      case 'completion':
        adjustments.push('Honor integration and prepare for next cycle');
        break;
    }

    return adjustments.length > 0 ? adjustments : ['Use standard Maya personality'];
  }

  private getTargetAreasFromFacets(facets: any[]): string[] {
    return facets
      .filter(f => f.score < 50)
      .map(f => f.label)
      .slice(0, 3); // Top 3 areas needing support
  }

  private getPhaseGuidance(phase: string): string {
    const guidance: Record<string, string> = {
      initiation: 'Support new beginnings with encouragement and gentle direction',
      grounding: 'Focus on stability, routine, and embodied practices', 
      collaboration: 'Emphasize relationships, community, and co-creation',
      transformation: 'Hold space for deep change with compassionate presence',
      completion: 'Honor integration and wisdom, prepare for next chapter'
    };
    return guidance[phase] || 'Provide balanced, supportive guidance';
  }
}

// Export singleton instance for easy use
export const shiftIntegration = SHIFtIntegration.getInstance();