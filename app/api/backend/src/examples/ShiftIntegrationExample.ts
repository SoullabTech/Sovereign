/**
 * SHIFt Integration Example
 * 
 * Shows how PersonalOracleAgent and other agents can integrate with SHIFt
 * for implicit profiling and personalized guidance.
 */

import { shiftIntegration } from '../integrations/SHIFtIntegration';
import { logger } from '../utils/logger';

/**
 * Example: PersonalOracleAgent Session Integration
 * 
 * This shows how to integrate SHIFt into a typical Oracle session
 */
export async function oracleSessionWithShift(
  userId: string,
  sessionId: string,
  userMessage: string,
  oracleResponse: string
) {
  try {
    // 1. Get current SHIFt profile for personalization
    const profile = await shiftIntegration.getUserProfile(userId);
    const elementalGuidance = await shiftIntegration.getElementalGuidance(userId);
    const currentPhase = await shiftIntegration.getCurrentPhase(userId);
    
    // 2. Use profile to adjust response style
    let personalizedResponse = oracleResponse;
    
    if (elementalGuidance) {
      // Adjust voice selection
      logger.info('Voice recommendation:', elementalGuidance.voiceRecommendation);
      
      // Apply personality adjustments
      if (elementalGuidance.personalityAdjustments.length > 0) {
        logger.info('Personality adjustments:', elementalGuidance.personalityAdjustments);
        // In real implementation, modify response tone/style here
      }
    }
    
    if (currentPhase) {
      logger.info(`User in ${currentPhase.primary} phase: ${currentPhase.guidance}`);
      // Adjust guidance style based on phase
    }
    
    // 3. Add suggested practice if appropriate
    const suggestedPractice = await shiftIntegration.getSuggestedPractice(userId);
    if (suggestedPractice && shouldOfferPractice(userMessage)) {
      personalizedResponse += `\n\n💫 A small practice for you: ${suggestedPractice.title}\n`;
      personalizedResponse += suggestedPractice.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    }
    
    // 4. Emit session data for future inference
    await shiftIntegration.emitSession(
      userId,
      sessionId,
      `User: ${userMessage}\nOracle: ${personalizedResponse}`,
      [
        { type: 'oracle.session', payload: { timestamp: new Date(), responseLength: personalizedResponse.length } }
      ],
      {
        // Add any available metrics
        journalEntries: 1, // This session counts as journaling
      }
    );
    
    return personalizedResponse;
    
  } catch (error) {
    logger.error('Error in oracle session with SHIFt:', error);
    // Return original response if SHIFt fails
    return oracleResponse;
  }
}

/**
 * Example: Batch Profile Updates
 * 
 * Shows how to process multiple users for profile updates
 */
export async function batchUpdateShiftProfiles(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    try {
      const profile = await shiftIntegration.getUserProfile(userId);
      if (profile) {
        logger.info(`Updated SHIFt profile for ${userId}:`, {
          dominantElement: getDominantElement(profile.elements),
          phase: profile.phase.primary,
          confidence: Math.round(profile.elements.confidence * 100)
        });
      }
    } catch (error) {
      logger.error(`Error updating profile for ${userId}:`, error);
    }
  }
}

/**
 * Example: Ceremony Integration
 * 
 * Shows how retreat/ceremony agents can use SHIFt data
 */
export async function ceremonySessionWithShift(
  userId: string,
  ceremonyId: string,
  sessionData: {
    ritualStage: string;
    emotionalIntensity: number;
    groupSynchrony: number;
    overwhelmRisk: 'low' | 'medium' | 'high';
  }
) {
  try {
    // Get baseline profile
    const profile = await shiftIntegration.getUserProfile(userId);
    
    // Emit ceremony-specific session
    await shiftIntegration.emitSession(
      userId,
      `ceremony_${ceremonyId}_${Date.now()}`,
      `Ceremony session: ${sessionData.ritualStage}. High intensity emotional processing.`,
      [
        { 
          type: 'ceremony.session', 
          payload: {
            ceremonyId,
            stage: sessionData.ritualStage,
            emotionalIntensity: sessionData.emotionalIntensity,
            groupSynchrony: sessionData.groupSynchrony,
            overwhelmRisk: sessionData.overwhelmRisk
          }
        }
      ]
    );
    
    // Get updated guidance based on ceremony context
    if (profile) {
      logger.info(`Ceremony guidance for ${userId}:`, {
        basePhase: profile.phase.primary,
        narrativeSummary: profile.narrative,
        overwhelmRisk: sessionData.overwhelmRisk
      });
    }
    
  } catch (error) {
    logger.error('Error in ceremony session with SHIFt:', error);
  }
}

/**
 * Example: Daily Practice Suggestions
 * 
 * Shows how to generate personalized practices
 */
export async function generateDailyPractices(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    try {
      const practice = await shiftIntegration.getSuggestedPractice(userId);
      if (practice) {
        logger.info(`Daily practice for ${userId}: ${practice.title}`, {
          steps: practice.steps,
          targetAreas: practice.targetAreas
        });
        
        // In real implementation, send practice to user via notification
        // await notificationService.sendDailyPractice(userId, practice);
      }
    } catch (error) {
      logger.error(`Error generating practice for ${userId}:`, error);
    }
  }
}

// Helper functions

function shouldOfferPractice(userMessage: string): boolean {
  // Simple heuristic - offer practices when user expresses need
  const needKeywords = ['stuck', 'confused', 'overwhelmed', 'help', 'practice', 'what should', 'how do'];
  return needKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
}

function getDominantElement(elements: any): string {
  return Object.entries(elements)
    .filter(([key]) => key !== 'confidence')
    .reduce((max, [key, value]) => 
      (value as number) > elements[max] ? key : max, 'fire');
}

/**
 * Example usage in PersonalOracleAgent:
 * 
 * // Inside PersonalOracleAgent process method
 * const personalizedResponse = await oracleSessionWithShift(
 *   userId,
 *   sessionId, 
 *   userInput,
 *   generatedResponse
 * );
 * 
 * return personalizedResponse;
 */