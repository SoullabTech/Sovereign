'use client';

import React, { useState, useEffect } from 'react';
import CompleteWelcomeFlow from '@/components/onboarding/CompleteWelcomeFlow';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Kelly');

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
        setUserName(userData.name || userData.username || 'Kelly');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [router]);

  const handleComplete = () => {
    // Mark user as having completed the full onboarding experience
    const newUser = {
      id: `user_${Date.now()}`,
      username: userName.toLowerCase(),
      name: userName,
      onboarded: true,
      daimonIntroComplete: true,
      welcomeFlowComplete: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('beta_user', JSON.stringify(newUser));

    // Also update the beta_users storage
    const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
    users[userName.toLowerCase()] = newUser;
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