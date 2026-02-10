'use client';

import React, { useState, useEffect } from 'react';
import CompleteWelcomeFlow from '@/components/onboarding/CompleteWelcomeFlow';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/http/apiBase';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Explorer');

  useEffect(() => {
    // Get user name from localStorage
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);

        // CRITICAL: Check for poisoned local_* IDs and redirect to re-auth
        if (userData.id && userData.id.startsWith('local_')) {
          console.warn('[onboarding] Detected poisoned local_* ID, clearing and redirecting');
          localStorage.removeItem('beta_user');
          localStorage.removeItem('explorerId');
          localStorage.removeItem('explorerName');
          localStorage.removeItem('signup_completed');
          router.push('/test-elemental');
          return;
        }

        if (userData.onboarded) {
          router.push('/maia');
          return;
        }

        // YOUTH ROUTING: If user has a youth tier and hasn't completed youth onboarding,
        // redirect to youth-specific flow first
        const tier = userData.developmentalTier;
        const isYouthTier = tier === 'tier2' || tier === 'tier3' || tier === 'under13';
        if (isYouthTier && !userData.youthOnboarded && !userData.youthOnboardingSkipped) {
          if (tier === 'under13') {
            // Under-13 not supported yet
            router.push('/onboarding/youth-coming-soon');
            return;
          }
          router.push('/onboarding/youth');
          return;
        }

        setUserName(userData.name || userData.username || 'Explorer');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [router]);

  const handleComplete = async () => {
    // Get existing user data - MUST have valid server-assigned ID
    const existingUser = localStorage.getItem('beta_user');
    let userId: string | null = null;
    let existingUsername = userName.toLowerCase();

    if (existingUser) {
      try {
        const parsed = JSON.parse(existingUser);
        // Only use valid server IDs, reject local_* fallbacks
        if (parsed.id && !parsed.id.startsWith('local_')) {
          userId = parsed.id;
        }
        if (parsed.username) existingUsername = parsed.username;
      } catch (e) {
        console.error('Error parsing existing user:', e);
      }
    }

    // CRITICAL: Don't proceed without valid server ID
    if (!userId) {
      console.error('[onboarding] Cannot complete - no valid server ID');
      alert('Session expired. Please sign in again.');
      localStorage.removeItem('beta_user');
      router.push('/test-elemental');
      return;
    }

    // Mark user as having completed the full onboarding experience
    const updatedUser = {
      id: userId,  // Preserve existing ID!
      username: existingUsername,
      name: userName,
      onboarded: true,
      daimonIntroComplete: true,
      welcomeFlowComplete: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('beta_user', JSON.stringify(updatedUser));
    localStorage.setItem('betaOnboardingComplete', 'true');

    // Sync onboarding completion to server
    try {
      await fetch(apiUrl('/api/members/progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          complete: true
        }),
      });
      console.log('[Onboarding] Synced completion to server for:', userId);
    } catch (err) {
      console.warn('[Onboarding] Could not sync to server:', err);
      // Continue anyway - localStorage is updated
    }

    // Also update the beta_users storage for local auth fallback
    const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
    users[existingUsername] = updatedUser;
    localStorage.setItem('beta_users', JSON.stringify(users));

    router.push('/maia');
  };

  return (
    <CompleteWelcomeFlow
      userName={userName}
      onComplete={handleComplete}
    />
  );
}