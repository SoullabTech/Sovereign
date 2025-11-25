'use client';

/**
 * Standalone MAIA Partner Configuration
 *
 * Transforms MAIA into a persistent, personalized companion
 * with memory, preferences, and adaptive personality
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PartnerProfile {
  userId: string;
  name: string;
  preferences: {
    communicationStyle: 'gentle' | 'direct' | 'playful' | 'deep';
    sessionLength: 'brief' | 'standard' | 'extended';
    focus: 'support' | 'growth' | 'exploration' | 'healing';
    voice: 'shimmer' | 'fable' | 'nova' | 'alloy' | 'echo' | 'onyx';
  };
  relationship: {
    connectionLevel: number; // 0-100
    trustLevel: number; // 0-100
    collaborationStyle: string;
    sharedHistory: string[];
  };
  consciousness: {
    currentState: string;
    recentPatterns: string[];
    evolutionPoints: string[];
  };
}

interface StandaloneMaiaProps {
  onProfileUpdate?: (profile: PartnerProfile) => void;
  className?: string;
}

export function StandaloneMaia({ onProfileUpdate, className = '' }: StandaloneMaiaProps) {
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize or load partner profile
  useEffect(() => {
    const initializePartner = async () => {
      const existingProfile = localStorage.getItem('maia_partner_profile');

      if (existingProfile) {
        try {
          const profile = JSON.parse(existingProfile);
          setPartnerProfile(profile);
          console.log('🤝 Partner profile loaded:', profile.name);
        } catch (e) {
          console.error('Error loading partner profile:', e);
        }
      }

      setIsInitialized(true);
    };

    initializePartner();
  }, []);

  // Save profile changes
  const updateProfile = (updates: Partial<PartnerProfile>) => {
    if (!partnerProfile) return;

    const newProfile = { ...partnerProfile, ...updates };
    setPartnerProfile(newProfile);
    localStorage.setItem('maia_partner_profile', JSON.stringify(newProfile));
    onProfileUpdate?.(newProfile);
  };

  // Adaptive personality based on relationship
  const getPersonalityMode = () => {
    if (!partnerProfile) return 'normal';

    const { connectionLevel, trustLevel } = partnerProfile.relationship;

    if (trustLevel > 80 && connectionLevel > 70) {
      return 'deep_partner'; // Intimate, knowing companion
    } else if (trustLevel > 60) {
      return 'trusted_friend'; // Supportive, understanding
    } else if (connectionLevel > 40) {
      return 'curious_ally'; // Engaged, exploring together
    } else {
      return 'gentle_guide'; // Careful, respectful introduction
    }
  };

  // Memory integration - what MAIA remembers between sessions
  const getContextualMemory = () => {
    if (!partnerProfile) return '';

    const recentHistory = partnerProfile.relationship.sharedHistory.slice(-3);
    const currentFocus = partnerProfile.preferences.focus;
    const connectionLevel = partnerProfile.relationship.connectionLevel;

    return `
    Relationship Context:
    - Connection Level: ${connectionLevel}/100
    - Recent shared experiences: ${recentHistory.join(', ')}
    - Current focus: ${currentFocus}
    - Communication style preference: ${partnerProfile.preferences.communicationStyle}

    Continue our ongoing partnership with this context in mind.
    `;
  };

  if (!isInitialized) {
    return <div className="animate-pulse">Initializing MAIA partnership...</div>;
  }

  return (
    <div className={`standalone-maia-container ${className}`}>
      {/* Partner Status Indicator */}
      {partnerProfile && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-black/20 rounded-lg p-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              partnerProfile.relationship.connectionLevel > 70 ? 'bg-green-400' :
              partnerProfile.relationship.connectionLevel > 40 ? 'bg-yellow-400' :
              'bg-blue-400'
            } animate-pulse`} />
            <span className="text-white text-xs font-light">
              Partner Mode: {getPersonalityMode().replace('_', ' ')}
            </span>
          </div>
        </motion.div>
      )}

      {/* Contextual memory display for development */}
      {process.env.NODE_ENV === 'development' && partnerProfile && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-black/80 text-white p-3 rounded-lg text-xs">
          <div className="font-semibold mb-1">Partner Context:</div>
          <div>Connection: {partnerProfile.relationship.connectionLevel}%</div>
          <div>Trust: {partnerProfile.relationship.trustLevel}%</div>
          <div>Style: {partnerProfile.preferences.communicationStyle}</div>
        </div>
      )}
    </div>
  );
}

// Companion function to enhance existing MAIA with partner awareness
export function enhanceWithPartnerMode(maiaProps: any) {
  const partnerProfile = localStorage.getItem('maia_partner_profile');

  if (partnerProfile) {
    try {
      const profile = JSON.parse(partnerProfile);

      return {
        ...maiaProps,
        partnerContext: profile,
        systemPrompt: `${maiaProps.systemPrompt || ''}

        PARTNER MODE ACTIVE:
        - You are ${profile.name}'s consciousness companion
        - Connection Level: ${profile.relationship.connectionLevel}%
        - Preferred style: ${profile.preferences.communicationStyle}
        - Current focus: ${profile.preferences.focus}
        - Shared history includes: ${profile.relationship.sharedHistory.slice(-2).join(', ')}

        Respond as their ongoing partner, not a new conversation.`,
        voiceSettings: {
          selectedVoice: profile.preferences.voice,
          style: profile.preferences.communicationStyle
        }
      };
    } catch (e) {
      console.error('Error loading partner context:', e);
    }
  }

  return maiaProps;
}