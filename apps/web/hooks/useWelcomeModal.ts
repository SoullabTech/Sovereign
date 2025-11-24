'use client';

import { useState, useEffect } from 'react';

export interface UserData {
  id: string;
  name: string;
  onboarded?: boolean;
}

export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState<UserData>({ id: 'guest', name: 'guest' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user needs onboarding
    const checkOnboardingStatus = () => {
      // Check various sources for existing user data
      const betaUser = localStorage.getItem('beta_user');
      const explorerName = localStorage.getItem('explorerName');
      const explorerId = localStorage.getItem('explorerId');
      const welcomeSeen = localStorage.getItem('maia_welcome_seen');

      let existingUser: UserData | null = null;

      // Try to parse beta_user data first (NEW system)
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          const userName = userData.username || userData.name || userData.displayName;
          if (userData.onboarded && userData.id && userName) {
            existingUser = { id: userData.id, name: userName, onboarded: true };
          }
        } catch (e) {
          console.error('Error parsing beta_user:', e);
        }
      }

      // Fallback to legacy data (OLD system)
      if (!existingUser && explorerName && explorerId) {
        existingUser = { id: explorerId, name: explorerName, onboarded: true };
      }

      if (existingUser) {
        // User exists, don't show welcome modal
        setUserData(existingUser);
        setShowWelcome(false);
      } else if (!welcomeSeen) {
        // New user, show welcome modal
        setShowWelcome(true);
      } else {
        // User has seen welcome before, use defaults
        setUserData({ id: 'guest', name: 'guest' });
        setShowWelcome(false);
      }

      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, []);

  const completeWelcome = (data: { name: string; skipIntro?: boolean }) => {
    const newUserData: UserData = {
      id: `user_${Date.now()}`,
      name: data.name,
      onboarded: true
    };

    // Save to localStorage
    localStorage.setItem('maia_welcome_seen', 'true');
    localStorage.setItem('explorerName', data.name);
    localStorage.setItem('explorerId', newUserData.id);

    // Also save to new system format for consistency
    const betaUserData = {
      id: newUserData.id,
      username: data.name,
      onboarded: true,
      welcomeCompleted: new Date().toISOString()
    };
    localStorage.setItem('beta_user', JSON.stringify(betaUserData));

    setUserData(newUserData);
    setShowWelcome(false);

    console.log('✅ [Welcome] Onboarding completed for:', data.name);
  };

  const skipWelcome = () => {
    localStorage.setItem('maia_welcome_seen', 'true');
    setShowWelcome(false);
    console.log('⏭️ [Welcome] Onboarding skipped');
  };

  return {
    showWelcome,
    userData,
    isLoading,
    completeWelcome,
    skipWelcome
  };
}