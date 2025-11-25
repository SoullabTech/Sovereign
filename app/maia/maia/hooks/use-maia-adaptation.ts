/**
 * MAIA Natural Adaptation Hook
 *
 * React hook for integrating Tolan-inspired consciousness adaptation
 * into conversation components. Processes conversations naturally
 * without explicit questioning.
 */

import { useCallback, useEffect, useState } from 'react';
import { maiaAdaptationEngine, TransformationalPartnership } from '../lib/consciousness/maia-natural-adaptation';

export interface MAIAAdaptationHook {
  // Partnership state
  partnership: TransformationalPartnership | null;
  partnershipInitialized: boolean;

  // Adaptation functions
  processConversationTurn: (userMessage: string, maiaResponse: string, conversationId: string) => void;
  getPersonalizedApproach: () => {
    voiceTone: string;
    greetingStyle: string;
    questionStyle: string[];
    supportApproach: string;
    responseLength: 'brief' | 'moderate' | 'expansive';
  };

  // Partnership insights
  getConnectionLevel: () => number;
  getTrustLevel: () => number;
  getTransformationSeeds: () => string[];

  // Manual adaptation triggers (for special moments)
  recordBreakthrough: (description: string) => void;
  recordChallenge: (description: string) => void;
}

export function useMAIAAdaptation(userId: string, userName: string): MAIAAdaptationHook {
  const [partnership, setPartnership] = useState<TransformationalPartnership | null>(null);
  const [partnershipInitialized, setPartnershipInitialized] = useState(false);

  // Initialize partnership
  useEffect(() => {
    if (!userId || userId === 'guest' || partnershipInitialized) return;

    // Try to load existing partnership
    let existingPartnership = maiaAdaptationEngine.loadPartnership(userId);

    if (!existingPartnership) {
      // Create new partnership
      existingPartnership = maiaAdaptationEngine.initializePartnership(userId, userName);
      console.log('🌱 New transformational partnership initialized for:', userName);
    } else {
      console.log('💫 Partnership restored for:', userName, 'Connection level:', existingPartnership.connectionLevel);
    }

    setPartnership(existingPartnership);
    setPartnershipInitialized(true);
  }, [userId, userName, partnershipInitialized]);

  // Process conversation for natural adaptation
  const processConversationTurn = useCallback(
    (userMessage: string, maiaResponse: string, conversationId: string) => {
      if (!partnershipInitialized || !userId || userId === 'guest') return;

      try {
        const updatedPartnership = maiaAdaptationEngine.processConversation(
          userId,
          userMessage,
          maiaResponse,
          conversationId
        );

        setPartnership(updatedPartnership);

        // Log adaptation moments for development
        if (updatedPartnership.adaptationHistory.length > (partnership?.adaptationHistory.length || 0)) {
          const latestAdaptation = updatedPartnership.adaptationHistory[updatedPartnership.adaptationHistory.length - 1];
          console.log('🔄 MAIA adapted:', latestAdaptation.description);
        }
      } catch (error) {
        console.error('Error processing conversation for adaptation:', error);
      }
    },
    [partnershipInitialized, userId, partnership?.adaptationHistory.length]
  );

  // Get personalized MAIA approach
  const getPersonalizedApproach = useCallback(() => {
    if (!partnershipInitialized || !userId || userId === 'guest') {
      return {
        voiceTone: 'warm and gentle',
        greetingStyle: 'What brings you here today?',
        questionStyle: ['How does this feel for you?', 'What are you noticing?'],
        supportApproach: 'gentle encouragement',
        responseLength: 'moderate' as const
      };
    }

    return maiaAdaptationEngine.generatePersonalizedApproach(userId);
  }, [partnershipInitialized, userId]);

  // Get connection level
  const getConnectionLevel = useCallback(() => {
    return partnership?.connectionLevel || 25;
  }, [partnership?.connectionLevel]);

  // Get trust level
  const getTrustLevel = useCallback(() => {
    return partnership?.trustLevel || 30;
  }, [partnership?.trustLevel]);

  // Get transformation seeds
  const getTransformationSeeds = useCallback(() => {
    return partnership?.transformationSeeds.map(seed => seed.description) || [];
  }, [partnership?.transformationSeeds]);

  // Record breakthrough moments
  const recordBreakthrough = useCallback(
    (description: string) => {
      if (!partnership || !partnershipInitialized) return;

      // Increase trust and connection significantly for breakthroughs
      partnership.trustLevel = Math.min(100, partnership.trustLevel + 10);
      partnership.connectionLevel = Math.min(100, partnership.connectionLevel + 8);
      partnership.intimacyLevel = Math.min(100, partnership.intimacyLevel + 5);

      // Record as significant adaptation moment
      partnership.adaptationHistory.push({
        timestamp: new Date(),
        type: 'style_shift',
        description: `Breakthrough moment: ${description}`,
        trigger: 'User breakthrough',
        maiaBefore: 'Standard support',
        maiaAfter: 'Deeper witnessing and celebration'
      });

      setPartnership({ ...partnership });
      maiaAdaptationEngine.savePartnership(userId);

      console.log('🎉 Breakthrough recorded:', description);
    },
    [partnership, partnershipInitialized, userId]
  );

  // Record challenge moments
  const recordChallenge = useCallback(
    (description: string) => {
      if (!partnership || !partnershipInitialized) return;

      // Adjust communication style to be more gentle during challenges
      if (partnership.preferredCommunicationStyle !== 'gentle') {
        partnership.preferredCommunicationStyle = 'gentle';
        partnership.currentFocus = 'support';

        partnership.adaptationHistory.push({
          timestamp: new Date(),
          type: 'style_shift',
          description: `Adapting to support during challenge: ${description}`,
          trigger: 'User challenge',
          maiaBefore: 'Previous communication style',
          maiaAfter: 'Gentle, supportive approach'
        });
      }

      setPartnership({ ...partnership });
      maiaAdaptationEngine.savePartnership(userId);

      console.log('🤗 Challenge support activated:', description);
    },
    [partnership, partnershipInitialized, userId]
  );

  // Save partnership periodically
  useEffect(() => {
    if (!partnershipInitialized || !userId || userId === 'guest') return;

    const saveInterval = setInterval(() => {
      maiaAdaptationEngine.savePartnership(userId);
    }, 45000); // Save every 45 seconds

    return () => clearInterval(saveInterval);
  }, [partnershipInitialized, userId]);

  return {
    partnership,
    partnershipInitialized,
    processConversationTurn,
    getPersonalizedApproach,
    getConnectionLevel,
    getTrustLevel,
    getTransformationSeeds,
    recordBreakthrough,
    recordChallenge
  };
}