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
    // Mark user as onboarded and navigate to MAIA
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        userData.onboarded = true;
        userData.daimonIntroComplete = true;
        localStorage.setItem('beta_user', JSON.stringify(userData));

        // Also update the beta_users storage
        const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
        if (userData.username && users[userData.username]) {
          users[userData.username] = { ...users[userData.username], onboarded: true, daimonIntroComplete: true };
          localStorage.setItem('beta_users', JSON.stringify(users));
        }
      } catch (e) {
        console.error('Error updating user data:', e);
      }
    }
    router.push('/maia');
  };

  return (
    <div className="w-full h-screen">
      <CompleteWelcomeFlow
        userName={userName}
        onComplete={handleComplete}
      />
    </div>
  );
}