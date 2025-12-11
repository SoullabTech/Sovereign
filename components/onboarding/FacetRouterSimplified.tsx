'use client';

/**
 * Simplified FacetRouter - Bypasses onboarding pages
 * Questions are now asked by MAIA in conversation instead of as separate pages
 */

import React, { useEffect } from 'react';
import { storeNeutralOnboardingContext } from '@/lib/services/onboardingMetadata';

interface FacetRouterProps {
  partnerContext?: string;
  onComplete?: (profile: {
    reason: string;
    feeling: string;
    partnerContext?: string;
  }) => void;
}

export default function FacetRouterSimplified({ partnerContext = 'general', onComplete }: FacetRouterProps) {
  // Skip directly to completion - questions now handled by MAIA in conversation
  useEffect(() => {
    // Store minimal onboarding context indicating questions will be asked by MAIA
    storeNeutralOnboardingContext(partnerContext);

    // Mark that MAIA should ask onboarding questions
    sessionStorage.setItem('maia_should_ask_onboarding', 'true');

    // Store the original onboarding options for MAIA to use
    sessionStorage.setItem('maia_onboarding_options', JSON.stringify({
      reasonOptions: [
        { key: 'inner', label: 'My inner life / feelings', description: 'Working with emotions, healing, personal growth' },
        { key: 'direction', label: 'My direction / creativity', description: 'Finding purpose, creative expression, life direction' },
        { key: 'work', label: 'My work or projects', description: 'Professional development, leadership, ventures' },
        { key: 'relationships', label: 'My relationships', description: 'Family dynamics, connection patterns, communication' },
        { key: 'support', label: 'The people I support', description: 'Helping others, teaching, healing, caregiving' },
        { key: 'explore', label: 'Just exploring', description: 'Curious about consciousness, open to discovery' }
      ],
      feelingOptions: [
        { key: 'air', label: 'My head is busy.', description: 'Lots of thoughts, hard to slow down.' },
        { key: 'water', label: 'My feelings are strong.', description: 'A lot is moving in my heart.' },
        { key: 'fire', label: 'I feel wired and tired.', description: 'I have energy, but I\'m kind of worn out too.' },
        { key: 'earth', label: 'I feel heavy or flat.', description: 'Low energy, hard to get going.' },
        { key: 'neutral', label: 'It\'s hard to say.', description: 'I\'m not sure, or it keeps changing.' }
      ]
    }));

    // Complete immediately with default neutral values
    if (onComplete) {
      onComplete({
        reason: 'explore',
        feeling: 'neutral',
        partnerContext: partnerContext
      });
    }
  }, [partnerContext, onComplete]);

  // Show minimal loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#6EE7B7]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 animate-spin">
          <img src="/holoflower.svg" alt="Loading" className="w-full h-full" />
        </div>
        <h2 className="text-xl font-light text-teal-900 mb-2">Preparing your experience...</h2>
        <p className="text-teal-800/70">MAIA will personally ask what brings you here today.</p>
      </div>
    </div>
  );
}

// Export both named and default exports for compatibility
export { FacetRouterSimplified };