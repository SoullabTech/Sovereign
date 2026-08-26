'use client';

import React, { useState, useEffect } from 'react';
import { ArrivalThreshold } from '@/components/arrival/ArrivalThreshold';
import type { DoorwayId } from '@/lib/maia/arrivalContext';
import { recordFirstArrival } from '@/lib/maia/arrivalState';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/http/apiBase';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Explorer');
  const [crossing, setCrossing] = useState(false);

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
          router.push('/signin');
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

  // MLX-06 Unit 2. The legacy first-run path (ten lenses -> birth data ->
  // elemental lesson -> /choose) is replaced by the ruled threshold. The
  // COMPLETION MECHANISM IS UNCHANGED: the same localStorage keys and the same
  // canonical server call (POST /api/members/progress, which sets
  // members.onboarded = true) still mark the member onboarded, so returning
  // members bypass this surface exactly as before.
  //
  // What changed is only what the member is asked, and where they land: MAIA,
  // which is where the ruled spine ends. /choose is no longer part of the
  // first-run chain; it is left in place, unmodified.
  const handleCross = async (_attention: string, _doorway: DoorwayId) => {
    setCrossing(true);
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
      setCrossing(false);
      alert('Session expired. Please sign in again.');
      localStorage.removeItem('beta_user');
      router.push('/signin');
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

    // Crossing this threshold IS the first crossing. Without recording it, the
    // member meets the in-page Arrival ceremony again the moment they reach
    // /maia — observed at runtime before this line existed: they were greeted
    // "I'm here when you're ready" immediately after telling MAIA what was
    // asking for their attention, and the opening never engaged what they
    // brought. The marker is written exactly once and never cleared
    // (lib/maia/arrivalState.ts); this is the member act it records.
    recordFirstArrival();

    // The ruled spine ends at MAIA BEGINS. The arrival context the member just
    // gave is already in sessionStorage (session-scoped, per MLX-R3) and travels
    // with them — it is never placed on the URL.
    router.push('/maia');
  };

  return (
    <ArrivalThreshold
      name={userName === 'Explorer' ? '' : userName}
      busy={crossing}
      onCross={handleCross}
    />
  );
}