'use client';

/**
 * /onboarding/youth
 *
 * Youth-specific onboarding flow. Routes here when a member's developmental_tier
 * is tier2 or tier3 (ages 13-17) and youth_onboarded is false.
 *
 * Runs the TeenOnboarding component (age consent, neurodivergence, support needs,
 * safety resources), then persists the profile and marks youth_onboarded = true.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeenOnboarding, { type TeenProfile } from '@/components/onboarding/TeenOnboarding';
import { apiUrl } from '@/lib/http/apiBase';

export default function YouthOnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const betaUser = localStorage.getItem('beta_user');
    if (!betaUser) {
      router.push('/signin');
      return;
    }

    try {
      const parsed = JSON.parse(betaUser);

      // Reject local_* fallback IDs
      if (!parsed.id || parsed.id.startsWith('local_')) {
        router.push('/signin');
        return;
      }

      // If already youth-onboarded, skip to main onboarding or maia
      if (parsed.youthOnboarded) {
        router.push(parsed.onboarded ? '/maia' : '/onboarding');
        return;
      }

      setUserId(parsed.id);
      setLoading(false);
    } catch (e) {
      console.error('[youth-onboarding] Error parsing user data:', e);
      router.push('/signin');
    }
  }, [router]);

  const handleComplete = async (profile: TeenProfile) => {
    if (!userId) return;

    // Store teen profile in localStorage for client-side access
    const betaUser = JSON.parse(localStorage.getItem('beta_user') || '{}');
    betaUser.teenProfile = {
      age: profile.age,
      isNeurodivergent: profile.isNeurodivergent,
      neurodivergentTypes: profile.neurodivergentTypes,
      familyDynamics: profile.familyDynamics,
      supportNeeds: profile.supportNeeds,
    };
    betaUser.youthOnboarded = true;
    localStorage.setItem('beta_user', JSON.stringify(betaUser));

    // Also store in the teen profile utils format for OracleConversation
    localStorage.setItem('teen_profile', JSON.stringify({
      age: profile.age,
      isNeurodivergent: profile.isNeurodivergent,
      neurodivergentTypes: profile.neurodivergentTypes,
      familyDynamics: profile.familyDynamics,
      supportNeeds: profile.supportNeeds,
    }));

    // Sync to server
    try {
      await fetch(apiUrl('/api/members/progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          youthOnboarded: true,
        }),
      });
      console.log('[youth-onboarding] Synced youth onboarding to server');
    } catch (err) {
      console.warn('[youth-onboarding] Could not sync to server:', err);
    }

    // Continue to main onboarding flow
    router.push('/onboarding');
  };

  const handleSkip = () => {
    // Allow skip but mark in localStorage so we can prompt again later
    const betaUser = JSON.parse(localStorage.getItem('beta_user') || '{}');
    betaUser.youthOnboardingSkipped = true;
    localStorage.setItem('beta_user', JSON.stringify(betaUser));
    router.push('/onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-light">Preparing your space...</p>
        </div>
      </div>
    );
  }

  return <TeenOnboarding onComplete={handleComplete} onSkip={handleSkip} />;
}
