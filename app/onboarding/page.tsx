'use client';

import React, { useState, useEffect } from 'react';
import CompleteWelcomeFlow from '@/components/onboarding/CompleteWelcomeFlow';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Explorer');

  useEffect(() => {
    // Get user name from localStorage
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          router.push('/maia');
          return;
        }
        setUserName(userData.name || userData.username || 'Explorer');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [router]);

  const handleComplete = async () => {
    // Get existing user data to preserve the server-assigned ID
    const existingUser = localStorage.getItem('beta_user');
    let userId = `local_${Date.now()}`; // Fallback only
    let existingUsername = userName.toLowerCase();

    if (existingUser) {
      try {
        const parsed = JSON.parse(existingUser);
        if (parsed.id) userId = parsed.id;
        if (parsed.username) existingUsername = parsed.username;
      } catch (e) {
        console.error('Error parsing existing user:', e);
      }
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
      await fetch('/api/members/progress', {
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